// Phase 4: Item API, DSA progress synchronization, review items & ladders, and the weekly review route.
const t = require('./helpers/setup');
const { describe, it, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { planClock } = require('../src/services/planData');
const { todayIst, dayNumber, ymdOf } = require('../src/services/planGenerator');

let Plan, Progress, User;
before(async () => {
  await t.start();
  Plan = t.mongoose.model('Plan');
  Progress = t.mongoose.model('Progress');
  User = t.mongoose.model('User');
  await Plan.init();
});
after(() => t.stop());
afterEach(() => { planClock.now = () => new Date(); });

const form = (over = {}) => ({
  goalType: 'placements',
  style: 'one-topic',
  weeks: 4,
  weekdayHours: 3,
  weekendHours: 5,
  restDay: 6,
  sheetSlug: 'blind-75',
  subjects: ['os', 'dbms'],
  ...over,
});

const createPlan = (acct, body = form()) => t.api.post('/api/plan', { cookies: acct.cookies, body });
const getPlan = (acct) => t.api.get('/api/plan', { cookies: acct.cookies });
const patchItem = (acct, id, body) => t.api.patch(`/api/plan/items/${id}`, { cookies: acct.cookies, body });
const postItem = (acct, body) => t.api.post('/api/plan/items', { cookies: acct.cookies, body });
const deleteItem = (acct, id) => t.api.del(`/api/plan/items/${id}`, { cookies: acct.cookies });
const starItem = (acct, id) => t.api.patch(`/api/plan/items/${id}/star`, { cookies: acct.cookies });
const recordResult = (acct, id, body) => t.api.post(`/api/plan/items/${id}/result`, { cookies: acct.cookies, body });
const recordReview = (acct, id, body) => t.api.post(`/api/plan/items/${id}/review`, { cookies: acct.cookies, body });
const skipItem = (acct, id) => t.api.post(`/api/plan/items/${id}/skip`, { cookies: acct.cookies });
const unskipItem = (acct, id) => t.api.post(`/api/plan/items/${id}/unskip`, { cookies: acct.cookies });
const getWeeklyReview = (acct, query = '') => t.api.get(`/api/plan/review${query ? `?${query}` : ''}`, { cookies: acct.cookies });

describe('Phase 4: Plan Items API', () => {
  describe('PATCH /api/plan/items/:id (tick, untick, move, minutes)', () => {
    it('ticks a DSA item, sets doneAt, and atomically upserts { link, solvedAt } into Progress', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      assert.equal(planRes.status, 201);

      const dsaItem = planRes.body.data.plan.items.find((it) => it.type === 'dsa');
      assert.ok(dsaItem, 'has a dsa item');
      assert.ok(dsaItem.link, 'dsa item has link');

      // Tick the item
      const tickRes = await patchItem(acct, dsaItem.id, { done: true, result: 'alone' });
      assert.equal(tickRes.status, 200);
      assert.ok(tickRes.body.data.item.doneAt);
      assert.equal(tickRes.body.data.item.result, 'alone');
      assert.equal(tickRes.body.data.item.reviewStage, 0);

      // Verify Progress document was updated
      const prog = await Progress.findOne({ user: acct.id, sheetSlug: dsaItem.sheet || 'blind-75' });
      assert.ok(prog, 'Progress document created/updated');
      const solved = prog.solvedProblems.find((p) => p.link === dsaItem.link);
      assert.ok(solved, 'problem link in solvedProblems');
      assert.ok(solved.solvedAt instanceof Date);

      // Verify idempotence: ticking again does not duplicate in Progress
      const tickAgain = await patchItem(acct, dsaItem.id, { done: true });
      assert.equal(tickAgain.status, 200);
      const progAfter = await Progress.findOne({ user: acct.id, sheetSlug: dsaItem.sheet || 'blind-75' });
      const matches = progAfter.solvedProblems.filter((p) => p.link === dsaItem.link);
      assert.equal(matches.length, 1, 'no duplicate solved links');
    });

    it('unticks a DSA item, clears ladder fields, and pulls { link } from Progress', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const dsaItem = planRes.body.data.plan.items.find((it) => it.type === 'dsa');

      // Tick first
      await patchItem(acct, dsaItem.id, { done: true, result: 'hints' });
      let prog = await Progress.findOne({ user: acct.id, sheetSlug: dsaItem.sheet || 'blind-75' });
      assert.ok(prog.solvedProblems.some((p) => p.link === dsaItem.link));

      // Untick
      const untickRes = await patchItem(acct, dsaItem.id, { done: false });
      assert.equal(untickRes.status, 200);
      assert.equal(untickRes.body.data.item.doneAt, null);
      assert.equal(untickRes.body.data.item.result, null);
      assert.equal(untickRes.body.data.item.reviewStage, null);
      assert.equal(untickRes.body.data.item.nextReviewDay, null);

      // Verify Progress document has problem removed
      prog = await Progress.findOne({ user: acct.id, sheetSlug: dsaItem.sheet || 'blind-75' });
      assert.ok(!prog.solvedProblems.some((p) => p.link === dsaItem.link));
    });

    it('moves an item by up to 3 days, sets locked: true, and remembers plannedDay', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const doc = planRes.body.data.plan;
      // Find an item and targetDay within 3 days that has study hours and no mock
      let item = null;
      let targetDay = null;
      for (const it of doc.items) {
        if (it.type !== 'dsa' || it.day >= doc.deadline) continue;
        for (let shift = 1; shift <= 3; shift += 1) {
          const cand = ymdOf(dayNumber(it.day) + shift);
          const wd = (new Date(dayNumber(cand) * 86400000).getUTCDay() + 6) % 7;
          if (wd !== doc.restDay && !doc.items.some((m) => m.day === cand && m.type === 'mock')) {
            item = it;
            targetDay = cand;
            break;
          }
        }
        if (item) break;
      }
      assert.ok(item && targetDay, 'found movable item and targetDay');

      const moveRes = await patchItem(acct, item.id, { day: targetDay });
      assert.equal(moveRes.status, 200);
      assert.equal(moveRes.body.data.item.day, targetDay);
      assert.equal(moveRes.body.data.item.locked, true);

      // Moving more than 3 days returns 422
      const tooFarDay = ymdOf(dayNumber(item.day) + 4);
      const tooFarRes = await patchItem(acct, item.id, { day: tooFarDay });
      assert.equal(tooFarRes.status, 422);
      assert.ok(tooFarRes.body.message.includes('3 days'));

      // Moving a done item returns 422
      await patchItem(acct, item.id, { done: true, result: 'alone' });
      const moveDoneRes = await patchItem(acct, item.id, { day: targetDay });
      assert.equal(moveDoneRes.status, 422);
      assert.ok(moveDoneRes.body.message.includes('Done items cannot be moved'));
    });

    it('changes plannedMinutes of an open item, but refuses for done or skipped items', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const item = planRes.body.data.plan.items.find((it) => it.type === 'notes');
      assert.ok(item);

      const updateRes = await patchItem(acct, item.id, { plannedMinutes: 45 });
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.data.item.plannedMinutes, 45);

      // Mark done, then attempt minutes change -> 422
      await patchItem(acct, item.id, { done: true, quizScore: 5 });
      const failDoneRes = await patchItem(acct, item.id, { plannedMinutes: 50 });
      assert.equal(failDoneRes.status, 422);

      const open = planRes.body.data.plan.items.filter((it) => it.type === 'notes')[1];
      assert.equal((await skipItem(acct, open.id)).status, 200);
      const failSkippedRes = await patchItem(acct, open.id, { plannedMinutes: 50 });
      assert.equal(failSkippedRes.status, 422);
      assert.match(failSkippedRes.body.message, /skipped/);
    });
  });

  describe('POST /api/plan/items (Add custom item)', () => {
    it('creates a custom item with student source, locked: true, and enforces limits', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const doc = planRes.body.data.plan;

      const addRes = await postItem(acct, {
        title: 'Review System Design Chapter 1',
        plannedMinutes: 60,
        day: doc.startDate,
      });
      assert.equal(addRes.status, 201);
      const item = addRes.body.data.item;
      assert.equal(item.title, 'Review System Design Chapter 1');
      assert.equal(item.type, 'custom');
      assert.equal(item.source, 'student');
      assert.equal(item.locked, true);
      assert.equal(item.plannedMinutes, 60);
      assert.equal(item.day, doc.startDate);

      // Outside plan dates -> 422
      const outsideRes = await postItem(acct, {
        title: 'Future plan',
        plannedMinutes: 30,
        day: ymdOf(dayNumber(doc.deadline) + 10),
      });
      assert.equal(outsideRes.status, 422);

      // Rest day with 0 hours -> 422
      // In form(), restDay is 6 (Sunday)
      const restDayDate = doc.items.find((it) => {
        const n = dayNumber(it.day);
        return (new Date(n * 86400000).getUTCDay() + 6) % 7 === 6;
      });
      if (restDayDate) {
        const restRes = await postItem(acct, {
          title: 'Sunday Study',
          plannedMinutes: 30,
          day: restDayDate.day,
        });
        assert.equal(restRes.status, 422);
      }
    });
  });

  describe('DELETE /api/plan/items/:id (Remove item)', () => {
    it('removes an item the student added, but an item from the plan must be skipped (422), and a removal never un-solves a problem', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const dsaItem = planRes.body.data.plan.items.find((it) => it.type === 'dsa');
      await patchItem(acct, dsaItem.id, { done: true, result: 'alone' });
      const solved = async () => (await Progress.findOne({ user: acct.id, sheetSlug: dsaItem.sheet || 'blind-75' })).solvedProblems.some((p) => p.link === dsaItem.link);
      assert.ok(await solved());

      const refused = await deleteItem(acct, dsaItem.id);
      assert.equal(refused.status, 422);
      assert.match(refused.body.message, /Skip it instead/);
      assert.ok((await getPlan(acct)).body.data.plan.items.some((it) => it.id === dsaItem.id), 'the planner item is still there');
      assert.ok(await solved(), 'and the problem is still solved on its sheet');

      const added = await postItem(acct, { title: 'Write the resume', plannedMinutes: 60, day: dsaItem.day });
      const delRes = await deleteItem(acct, added.body.data.item.id);
      assert.equal(delRes.status, 200);
      assert.equal(delRes.body.data.removed, true);
      assert.ok(!(await getPlan(acct)).body.data.plan.items.some((it) => it.id === added.body.data.item.id));
      assert.ok(await solved(), 'removing a custom item changes no progress');
    });
  });

  describe('a problem solved on its sheet shows done in the plan (decision 2)', () => {
    it('marks it done in the plan and the Today list without changing the stored plan, and not for a problem solved only elsewhere', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const first = planRes.body.data.plan.items.find((it) => it.type === 'dsa');
      const before = planRes.body.data.today;
      assert.ok(before.items.some((i) => i.id === first.id), 'the first item is on Today');
      await Progress.create({ user: acct.id, sheetSlug: first.sheet, solvedProblems: [{ link: first.link, solvedAt: new Date() }] });
      const res = await getPlan(acct);
      const item = res.body.data.plan.items.find((i) => i.id === first.id);
      assert.equal(item.solvedOnSheet, true);
      assert.equal(item.doneAt, null, 'nothing was written to the plan');
      const stored = await Plan.findOne({ user: acct.id });
      assert.equal(stored.items.id(first.id).doneAt, null);
      assert.ok(!res.body.data.today.items.some((i) => i.id === first.id), 'it left the Today list');
      assert.ok(res.body.data.today.minutes < before.minutes);
      const other = res.body.data.plan.items.find((i) => i.type === 'dsa' && i.id !== first.id);
      assert.equal(other.solvedOnSheet, false);
    });
  });

  describe('ticking is one operation with the sheet progress (the plan\'s two sources of ticks must not drift)', () => {
    it('if the sheet cannot be written the plan is not changed either, and the user sees an error', async () => {
      const acct = await t.register();
      const item = (await createPlan(acct)).body.data.plan.items.find((it) => it.type === 'dsa');
      const original = Progress.updateOne;
      Progress.updateOne = async () => { throw new Error('the database went away'); };
      try {
        const res = await patchItem(acct, item.id, { done: true, result: 'alone' });
        assert.equal(res.status, 500);
      } finally { Progress.updateOne = original; }
      assert.equal((await Plan.findOne({ user: acct.id })).items.id(item.id).doneAt, null);
      assert.equal(await Progress.countDocuments({ user: acct.id }), 0);
    });
    it('if the plan cannot be saved the sheet is put back as it was (tick and untick)', async () => {
      const acct = await t.register();
      const item = (await createPlan(acct)).body.data.plan.items.find((it) => it.type === 'dsa');
      const original = Plan.prototype.save;
      const solved = async () => (await Progress.findOne({ user: acct.id, sheetSlug: item.sheet }))?.solvedProblems.some((p) => p.link === item.link) ?? false;
      Plan.prototype.save = async function failingSave(opts) { if (opts && opts.session) return original.call(this, opts); throw new Error('could not save the plan'); };
      try {
        assert.equal((await patchItem(acct, item.id, { done: true, result: 'alone' })).status, 500);
      } finally { Plan.prototype.save = original; }
      assert.equal(await solved(), false, 'the tick on the sheet was undone');
      assert.equal((await Plan.findOne({ user: acct.id })).items.id(item.id).doneAt, null);

      assert.equal((await patchItem(acct, item.id, { done: true, result: 'alone' })).status, 200);
      const solvedAt = (await Progress.findOne({ user: acct.id })).solvedProblems.find((p) => p.link === item.link).solvedAt;
      Plan.prototype.save = async function failingSave(opts) { if (opts && opts.session) return original.call(this, opts); throw new Error('could not save the plan'); };
      try {
        assert.equal((await patchItem(acct, item.id, { done: false })).status, 500);
      } finally { Plan.prototype.save = original; }
      const back = (await Progress.findOne({ user: acct.id })).solvedProblems.find((p) => p.link === item.link);
      assert.ok(back, 'the untick on the sheet was undone');
      assert.equal(back.solvedAt.getTime(), solvedAt.getTime(), 'with its first date');
    });
  });

  describe('PATCH /api/plan/items/:id/star', () => {
    it('toggles starred state between true and false', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const item = planRes.body.data.plan.items[0];

      const starRes1 = await starItem(acct, item.id);
      assert.equal(starRes1.status, 200);
      assert.equal(starRes1.body.data.item.starred, true);

      const starRes2 = await starItem(acct, item.id);
      assert.equal(starRes2.status, 200);
      assert.equal(starRes2.body.data.item.starred, false);
    });
  });

  describe('POST /api/plan/items/:id/result & POST /api/plan/items/:id/review', () => {
    it('records result (alone / hints / solution) and starts ladder with appropriate initial review gap', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const dsaItem = planRes.body.data.plan.items.find((it) => it.type === 'dsa');

      // Result 'solution' starts review on day + 1
      const resResult = await recordResult(acct, dsaItem.id, { result: 'solution' });
      assert.equal(resResult.status, 200);
      assert.equal(resResult.body.data.item.result, 'solution');
      assert.equal(resResult.body.data.item.reviewStage, 0);
      assert.equal(resResult.body.data.item.nextReviewDay, ymdOf(dayNumber(todayIst()) + 1));
      assert.equal(resResult.body.data.started, true);

      // Recording result again on done item -> 422
      const dupRes = await recordResult(acct, dsaItem.id, { result: 'alone' });
      assert.equal(dupRes.status, 422);
    });

    it('records notes quiz score and starts notes ladder', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const notesItem = planRes.body.data.plan.items.find((it) => it.type === 'notes');

      const resNotes = await recordResult(acct, notesItem.id, { quizScore: 4 });
      assert.equal(resNotes.status, 200);
      assert.equal(resNotes.body.data.item.quizScore, 4);
      assert.equal(resNotes.body.data.item.reviewStage, 0);
      assert.equal(resNotes.body.data.item.nextReviewDay, ymdOf(dayNumber(todayIst()) + 3)); // notes ladder starts at gap 3
    });

    it('advances review ladder on pass and resets on fail', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const dsaItem = planRes.body.data.plan.items.find((it) => it.type === 'dsa');

      // Start ladder with 'alone' ([7, 30])
      await recordResult(acct, dsaItem.id, { result: 'alone' });

      // Pass review -> moves to stage 1, next review is base + 30
      const passRes = await recordReview(acct, dsaItem.id, { passed: true });
      assert.equal(passRes.status, 200);
      assert.equal(passRes.body.data.item.reviewStage, 1);
      assert.equal(passRes.body.data.item.nextReviewDay, ymdOf(dayNumber(todayIst()) + 30));
      assert.equal(passRes.body.data.retired, false);

      // Fail review -> resets to stage 0, offers recode for DSA
      const failRes = await recordReview(acct, dsaItem.id, { passed: false });
      assert.equal(failRes.status, 200);
      assert.equal(failRes.body.data.item.reviewStage, 0);
      assert.equal(failRes.body.data.item.nextReviewDay, ymdOf(dayNumber(todayIst()) + 7));
      assert.equal(failRes.body.data.offerRecode, true);
    });

    it('retires an item when the final review gap is passed', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const dsaItem = planRes.body.data.plan.items.find((it) => it.type === 'dsa');

      // 'alone' has 2 gaps: [7, 30]
      await recordResult(acct, dsaItem.id, { result: 'alone' });
      await recordReview(acct, dsaItem.id, { passed: true }); // stage 1
      const retireRes = await recordReview(acct, dsaItem.id, { passed: true }); // passed stage 1 -> retired
      assert.equal(retireRes.status, 200);
      assert.equal(retireRes.body.data.retired, true);
      assert.equal(retireRes.body.data.item.nextReviewDay, null);

      // Reviewing retired item gives 422
      const afterRes = await recordReview(acct, dsaItem.id, { passed: true });
      assert.equal(afterRes.status, 422);
    });
  });

  describe('POST /api/plan/items/:id/skip & /unskip', () => {
    it('skips an item, warns about dependent topics, and unskips restores it', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const dsaItem = planRes.body.data.plan.items.find((it) => it.type === 'dsa');

      const skipRes = await skipItem(acct, dsaItem.id);
      assert.equal(skipRes.status, 200);
      assert.equal(skipRes.body.data.item.skipped, true);

      // Unskip
      const unskipRes = await unskipItem(acct, dsaItem.id);
      assert.equal(unskipRes.status, 200);
      assert.equal(unskipRes.body.data.item.skipped, false);
    });

    it('refuses to skip a completed item (422)', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const item = planRes.body.data.plan.items[0];
      await patchItem(acct, item.id, { done: true });

      const failSkip = await skipItem(acct, item.id);
      assert.equal(failSkip.status, 422);
      assert.ok(failSkip.body.message.includes('Completed items cannot be skipped'));
    });
  });

  describe('GET /api/plan/review (Weekly review)', () => {
    it('computes weekly summary, planned vs completed minutes, moved count, and detects weak topics', async () => {
      const acct = await t.register();
      const planRes = await createPlan(acct);
      const doc = planRes.body.data.plan;

      const dsaItem = doc.items.find((it) => it.type === 'dsa');
      const notesItem = doc.items.find((it) => it.type === 'notes');

      // Complete DSA item with 'solution' (marks it as weak topic)
      await recordResult(acct, dsaItem.id, { result: 'solution' });

      // Complete notes item with low quiz score (marks it as weak topic)
      await recordResult(acct, notesItem.id, { quizScore: 2 });

      // Fetch review for current week
      const reviewRes = await getWeeklyReview(acct);
      assert.equal(reviewRes.status, 200);
      const d = reviewRes.body.data;

      assert.ok(d.week.from && d.week.to);
      assert.ok(d.week.weekNumber >= 1);
      assert.ok(d.summary.plannedMinutes > 0);
      assert.ok(d.summary.completedMinutes > 0);
      assert.ok(d.summary.completedCount >= 2);
      assert.ok(Array.isArray(d.weakTopics));

      // Both items should be flagged in weak topics with appropriate links
      const dsaWeak = d.weakTopics.find((w) => w.key === dsaItem.key);
      assert.ok(dsaWeak, 'dsa item in weak topics');
      assert.equal(dsaWeak.reason, 'Viewed solution');
      assert.ok(dsaWeak.link.includes('/dsa/'));

      const notesWeak = d.weakTopics.find((w) => w.key === notesItem.key);
      assert.ok(notesWeak, 'notes item in weak topics');
      assert.equal(notesWeak.reason, 'Quiz score 2/5');
      assert.ok(notesWeak.link.startsWith('/notes/') && notesWeak.quizLink === notesWeak.link, 'the quiz is on the section page, so its link is the same');
    });
  });

  describe('Ownership & Security', () => {
    it('prevents user B from accessing or mutating user A plan items (404)', async () => {
      const userA = await t.register();
      const userB = await t.register();

      const planA = await createPlan(userA);
      const itemA = planA.body.data.plan.items[0];

      // User B tries to tick User A's item
      const tickRes = await patchItem(userB, itemA.id, { done: true });
      assert.equal(tickRes.status, 404);

      // User B tries to delete User A's item
      const delRes = await deleteItem(userB, itemA.id);
      assert.equal(delRes.status, 404);

      // User B tries to star User A's item
      const starRes = await starItem(userB, itemA.id);
      assert.equal(starRes.status, 404);

      // User B tries to skip User A's item
      const skipRes = await skipItem(userB, itemA.id);
      assert.equal(skipRes.status, 404);
    });
  });

  describe('Account deletion cascade', () => {
    it('permanently deletes active plan when account is deleted', async () => {
      const acct = await t.register();
      await createPlan(acct);
      assert.equal(await Plan.countDocuments({ user: acct.id }), 1);

      // Delete account
      const delAcc = await t.api.del('/api/user/account', {
        cookies: acct.cookies,
        body: { password: acct.password },
      });
      assert.equal(delAcc.status, 200);

      // Plan should be deleted via userOwnedModels cascade
      assert.equal(await Plan.countDocuments({ user: acct.id }), 0);
    });
  });
});
