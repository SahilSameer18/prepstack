// My plan: the Plan model and the API (public preview, create, read, delete, changes with a preview). The generator and the adjust module have their own tests;
// these check the rules around them: who may call what, ownership, one active plan, limits, and that only a previewed change can be applied.
const t = require('./helpers/setup');
const { describe, it, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { planClock } = require('../src/services/planData');
const { todayIst, dayNumber, ymdOf } = require('../src/services/planGenerator');

let Plan, Progress;
before(async () => {
  await t.start();
  Plan = t.mongoose.model('Plan');
  Progress = t.mongoose.model('Progress');
  await Plan.init(); // builds the unique "one active plan" index
});
after(() => t.stop());
afterEach(() => { planClock.now = () => new Date(); });

const form = (over = {}) => ({ goalType: 'bigtech', style: 'one-topic', weeks: 12, weekdayHours: 3, weekendHours: 5, restDay: 6, sheetSlug: 'neetcode-150', subjects: ['os', 'dbms', 'cn', 'oops'], ...over });
const preview = (body, ip) => t.api.post('/api/plan/preview', { body, ip });
const create = (acct, body) => t.api.post('/api/plan', { cookies: acct.cookies, body });
const getPlan = (acct) => t.api.get('/api/plan', { cookies: acct.cookies });
const delPlan = (acct) => t.api.del('/api/plan', { cookies: acct.cookies });
const changePreview = (acct, body) => t.api.post('/api/plan/changes/preview', { cookies: acct.cookies, body });
const changeApply = (acct, body) => t.api.post('/api/plan/changes/apply', { cookies: acct.cookies, body });
const addDays = (n) => ymdOf(dayNumber(todayIst()) + n);
const L = 'https://leetcode.com/problems/';

describe('POST /api/plan/preview (public)', () => {
  it('works without login and gives the numbers and week 1 only, writing nothing', async () => {
    const before = await Plan.countDocuments();
    const res = await preview(form());
    assert.equal(res.status, 200);
    const d = res.body.data;
    assert.deepEqual(Object.keys(d).sort(), ['coverage', 'deadline', 'earlyDays', 'finishDate', 'notices', 'startDate', 'week1']);
    assert.ok(d.coverage.syllabusMinutes > 0 && d.coverage.plannedMinutes > 0);
    assert.equal(d.startDate, todayIst());
    assert.equal(d.week1.week, 1);
    assert.ok(d.week1.items.length > 0 && d.week1.items.every((i) => i.day <= d.week1.to));
    const text = JSON.stringify(res.body);
    assert.ok(!text.includes(addDays(20)), 'no day from week 3 on is in the answer');
    assert.equal(await Plan.countDocuments(), before);
  });
  it('is the same for a signed-in user (no user data is used)', async () => {
    const acct = await t.register();
    const a = await t.api.post('/api/plan/preview', { cookies: acct.cookies, body: form() });
    const b = await preview(form());
    assert.deepEqual(a.body.data, b.body.data);
  });
  it('refuses a form that is out of range (422)', async () => {
    for (const over of [{ weeks: 0 }, { weeks: 53 }, { weeks: 2.5 }, { weekdayHours: 13 }, { weekdayHours: 0.2 }, { weekendHours: -1 }, { restDay: 7 }, { goalType: 'x' }, { style: 'x' }, { startDate: '2026-02-30' }, { subjects: ['nope'] }, { sheetSlug: 'Bad Slug' }, { knownTopics: Array(81).fill('x') }]) {
      assert.equal((await preview(form(over))).status, 422, JSON.stringify(over));
    }
    assert.equal((await preview({})).status, 422);
  });
  it('refuses what the generator refuses: a missing sheet, a missing roadmap, no study day', async () => {
    assert.equal((await preview(form({ sheetSlug: 'nope-sheet' }))).status, 422);
    assert.equal((await preview(form({ goalType: 'role', sheetSlug: undefined }))).status, 422);
    assert.equal((await preview(form({ goalType: 'role', roadmapSlug: 'nope-road', sheetSlug: undefined }))).status, 422);
    assert.equal((await preview(form({ weekdayHours: 0, weekendHours: 0 }))).status, 422);
    const ok = await preview(form({ goalType: 'role', roadmapSlug: 'backend', sheetSlug: undefined, subjects: undefined }));
    assert.equal(ok.status, 200);
  });
  it('the start date may be from yesterday to 60 days ahead', async () => {
    assert.equal((await preview(form({ startDate: addDays(-1) }))).status, 200);
    assert.equal((await preview(form({ startDate: addDays(60) }))).status, 200);
    assert.equal((await preview(form({ startDate: addDays(-2) }))).status, 422);
    assert.equal((await preview(form({ startDate: addDays(61) }))).status, 422);
  });
  it('is limited per IP address (20 a minute): the 21st gets 429, another address is fine', async () => {
    const ip = '203.0.113.50';
    for (let i = 0; i < 20; i += 1) assert.equal((await preview(form({ weeks: 2 }), ip)).status, 200, `request ${i + 1}`);
    assert.equal((await preview(form({ weeks: 2 }), ip)).status, 429);
    assert.equal((await preview(form({ weeks: 2 }), '203.0.113.51')).status, 200);
  });
});

describe('every other plan route needs login (401)', () => {
  it('refuses a request without a session', async () => {
    const calls = [
      t.api.get('/api/plan'), t.api.post('/api/plan', { body: form() }), t.api.del('/api/plan'), t.api.del('/api/plan/history'),
      t.api.post('/api/plan/changes/preview', { body: { type: 'rebuild' } }), t.api.post('/api/plan/changes/apply', { body: { type: 'rebuild', checksum: 'a'.repeat(16) } }),
    ];
    for (const r of calls) assert.equal((await r).status, 401);
  });
});

describe('creating, reading and deleting a plan', () => {
  it('makes a plan for the signed-in user, with the days, the items and the Today list', async () => {
    const acct = await t.register();
    const res = await create(acct, form({ title: 'My big-tech plan', targetRole: 'SDE 1' }));
    assert.equal(res.status, 201);
    const { plan, today } = res.body.data;
    assert.equal(plan.title, 'My big-tech plan');
    assert.equal(plan.status, 'active');
    assert.equal(plan.startDate, todayIst());
    assert.equal(plan.deadline, addDays(12 * 7 - 1));
    assert.deepEqual(plan.hoursByWeekday, [3, 3, 3, 3, 3, 5, 5]);
    assert.ok(plan.items.length > 100 && plan.items.every((i) => i.id && i.day));
    assert.ok(plan.coverage.syllabusMinutes > plan.coverage.plannedMinutes);
    assert.deepEqual(Object.keys(today).sort(), ['date', 'isToday', 'items', 'minutes', 'onTrack', 'startItem']);
    assert.equal(await Plan.countDocuments({ user: acct.id, status: 'active' }), 1);
    const read = await getPlan(acct);
    assert.equal(read.body.data.plan.id, plan.id);
    assert.equal(read.body.data.finished, false);
  });
  it('gives a default title, and refuses a title or a target role over 120 characters', async () => {
    const acct = await t.register();
    assert.equal((await create(acct, form({ title: 'x'.repeat(121) }))).status, 422);
    assert.equal((await create(acct, form({ targetRole: 'x'.repeat(121) }))).status, 422);
    const ok = await create(acct, form());
    assert.equal(ok.body.data.plan.title, 'Big-tech SDE interview, 12 weeks');
  });
  it('says there is no plan yet with plan: null', async () => {
    const acct = await t.register();
    const res = await getPlan(acct);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, { plan: null, today: null, finished: false });
  });
  it('leaves out problems the user has already solved, and keeps what it left out in the plan', async () => {
    const acct = await t.register();
    await Progress.create({ user: acct.id, sheetSlug: 'neetcode-150', solvedProblems: [{ link: `${L}contains-duplicate/` }, { link: `${L}valid-anagram/` }, { link: 'https://example.com/not-on-the-sheet' }] });
    const res = await create(acct, form());
    const items = res.body.data.plan.items;
    assert.ok(!items.some((i) => i.link === `${L}contains-duplicate/` || i.link === `${L}valid-anagram/`));
    assert.equal(res.body.data.plan.coverage.alreadySolved, 2);
    const doc = await Plan.findOne({ user: acct.id });
    assert.deepEqual([...doc.solvedLinks].sort(), [`${L}contains-duplicate/`, `${L}valid-anagram/`]);
  });
  it('another user never sees, changes or deletes it (ownership)', async () => {
    const a = await t.register();
    const b = await t.register();
    await create(a, form());
    assert.equal((await getPlan(b)).body.data.plan, null);
    assert.equal((await delPlan(b)).body.data.deleted, false);
    assert.equal((await changePreview(b, { type: 'rebuild' })).status, 404);
    assert.equal((await changeApply(b, { type: 'rebuild', checksum: 'a'.repeat(16) })).status, 404);
    assert.equal(await Plan.countDocuments({ user: a.id }), 1);
  });
  it('one active plan per user: a second is refused (409) unless replace is true, which keeps the old plan as finished history', async () => {
    const acct = await t.register();
    await create(acct, form());
    assert.equal((await create(acct, form({ weeks: 8 }))).status, 409);
    const res = await create(acct, form({ weeks: 8, replace: true }));
    assert.equal(res.status, 201);
    assert.equal(res.body.data.plan.weeks, 8);
    assert.equal(await Plan.countDocuments({ user: acct.id, status: 'active' }), 1);
    assert.equal(await Plan.countDocuments({ user: acct.id, status: 'finished' }), 1);
  });
  it('the database itself refuses a second active plan for one user, and a plan with more than 600 items', async () => {
    const acct = await t.register();
    const doc = (over = {}) => ({ user: acct.id, goalType: 'placements', style: 'one-topic', title: 'x', weeks: 1, startDate: '2026-11-16', deadline: '2026-11-22', hoursByWeekday: [1, 1, 1, 1, 1, 1, 1], ...over });
    await Plan.create(doc());
    await assert.rejects(Plan.create(doc()), (e) => e.code === 11000);
    await Plan.create(doc({ status: 'finished' }));
    await Plan.create(doc({ status: 'finished' })); // any number of finished plans is fine
    const other = await t.register();
    const items = Array.from({ length: 601 }, (_, i) => ({ key: `k${i}`, type: 'custom', title: 't', plannedMinutes: 10, day: '2026-11-16' }));
    await assert.rejects(Plan.create({ ...doc({ user: other.id }), items }), /at most 600 items/);
    await Plan.create({ ...doc({ user: other.id }), items: items.slice(0, 600) });
  });
  it('keeps at most 5 finished plans as history, deleting the oldest', async () => {
    const acct = await t.register();
    for (let i = 0; i < 7; i += 1) assert.equal((await create(acct, form({ weeks: 2 + i, replace: true }))).status, 201);
    assert.equal(await Plan.countDocuments({ user: acct.id, status: 'finished' }), 5);
    assert.equal(await Plan.countDocuments({ user: acct.id, status: 'active' }), 1);
    const weeks = (await Plan.find({ user: acct.id, status: 'finished' }).lean()).map((p) => p.weeks).sort((a, b) => a - b);
    assert.deepEqual(weeks, [3, 4, 5, 6, 7], 'the two oldest (2 and 3 weeks... the first two made) are gone');
  });
  it('a plan whose deadline has passed is finished, and a new one can then be made without replace', async () => {
    const acct = await t.register();
    await create(acct, form({ weeks: 1 }));
    planClock.now = () => new Date(`${addDays(10)}T06:00:00Z`);
    const read = await getPlan(acct);
    assert.equal(read.body.data.finished, true);
    const res = await create(acct, form({ weeks: 2, startDate: undefined }));
    assert.equal(res.status, 201);
    assert.equal(await Plan.countDocuments({ user: acct.id, status: 'finished' }), 1);
  });
  it('refuses to plan when everything on the sheet is solved or known (422), and does not touch an existing plan', async () => {
    const acct = await t.register();
    const first = await create(acct, form());
    const topics = ['arrays-hashing', 'two-pointers', 'sliding-window', 'stack', 'binary-search', 'linked-list', 'trees', 'heap-priority-queue', 'backtracking', 'trie', 'graph', 'advanced-graphs', '1d-dynamic-programming', '2d-dynamic-programming', 'greedy', 'intervals', 'math-geometry', 'bit-manipulation'];
    const res = await create(acct, form({ replace: true, knownTopics: topics, subjects: [] }));
    assert.equal(res.status, 422);
    assert.match(res.body.message, /nothing to plan/);
    assert.equal((await getPlan(acct)).body.data.plan.id, first.body.data.plan.id);
  });
  it('delete is free and really deletes; a second delete says nothing was deleted; history has its own delete', async () => {
    const acct = await t.register();
    await create(acct, form());
    await create(acct, form({ weeks: 4, replace: true }));
    const res = await delPlan(acct);
    assert.deepEqual(res.body.data, { deleted: true });
    assert.equal(await Plan.countDocuments({ user: acct.id, status: 'active' }), 0);
    assert.equal((await delPlan(acct)).body.data.deleted, false);
    assert.equal(await Plan.countDocuments({ user: acct.id, status: 'finished' }), 1);
    const hist = await t.api.del('/api/plan/history', { cookies: acct.cookies });
    assert.deepEqual(hist.body.data, { deleted: 1 });
    assert.equal(await Plan.countDocuments({ user: acct.id }), 0);
  });
  it('deleting the account deletes the plans too', async () => {
    const acct = await t.register();
    await create(acct, form());
    await create(acct, form({ weeks: 3, replace: true }));
    assert.equal(await Plan.countDocuments({ user: acct.id }), 2);
    const res = await t.api.del('/api/user/account', { cookies: acct.cookies, body: { password: t.PASSWORD } });
    assert.equal(res.status, 200);
    assert.equal(await Plan.countDocuments({ user: acct.id }), 0);
  });
  it('is limited to 10 saved plans an hour per user (the 11th gets 429); failed attempts do not count', async () => {
    const acct = await t.register();
    for (let i = 0; i < 3; i += 1) assert.equal((await create(acct, form({ weeks: 0 }))).status, 422); // failed: not counted
    for (let i = 0; i < 10; i += 1) assert.equal((await create(acct, form({ weeks: 1, replace: true }))).status, 201, `plan ${i + 1}`);
    assert.equal((await create(acct, form({ weeks: 1, replace: true }))).status, 429);
    const other = await t.register();
    assert.equal((await create(other, form({ weeks: 1 }))).status, 201, 'another user has their own count');
  });
});

describe('changes with a preview', () => {
  const make = async (over = {}) => { const acct = await t.register(); const res = await create(acct, form({ weeks: 6, ...over })); return { acct, plan: res.body.data.plan }; };
  it('a preview shows the diff and saves nothing', async () => {
    const { acct } = await make();
    const before = await Plan.findOne({ user: acct.id }).lean();
    planClock.now = () => new Date(`${addDays(10)}T06:00:00Z`);
    const res = await changePreview(acct, { type: 'rebuild' });
    assert.equal(res.status, 200);
    const d = res.body.data;
    assert.match(d.diff.finishText, /^(stays the same|\d+ days? (earlier|later))$/);
    assert.equal(d.diff.checksum.length, 16);
    assert.ok(d.diff.movedItems > 0 && d.plannedMinutes > 0);
    const after = await Plan.findOne({ user: acct.id }).lean();
    assert.deepEqual(after, before, 'the stored plan is exactly as it was');
  });
  it('only a previewed change can be applied: no checksum, a wrong checksum or another change gives 422 or 409', async () => {
    const { acct } = await make();
    planClock.now = () => new Date(`${addDays(10)}T06:00:00Z`);
    assert.equal((await changeApply(acct, { type: 'rebuild' })).status, 422);
    assert.equal((await changeApply(acct, { type: 'rebuild', checksum: 'zz' })).status, 422);
    assert.equal((await changeApply(acct, { type: 'rebuild', checksum: '0123456789abcdef' })).status, 409);
    const pv = (await changePreview(acct, { type: 'rebuild' })).body.data.diff.checksum;
    const other = await changeApply(acct, { type: 'hours', weekdayHours: 1, weekendHours: 1, checksum: pv });
    assert.equal(other.status, 409, 'the checksum belongs to the rebuild, not to a change of hours');
    assert.equal((await changeApply(acct, { type: 'rebuild', checksum: pv })).status, 200);
  });
  it('a rebuild that was previewed is applied: done items stay exactly as they were and nothing before today is planned', async () => {
    const { acct } = await make();
    const doc = await Plan.findOne({ user: acct.id });
    const firstDsa = doc.items.find((i) => i.type === 'dsa');
    firstDsa.doneAt = new Date();
    firstDsa.result = 'alone';
    firstDsa.reviewLadder = 'alone'; firstDsa.reviewStage = 0; firstDsa.reviewBaseDay = firstDsa.day; firstDsa.nextReviewDay = addDays(7);
    await doc.save();
    planClock.now = () => new Date(`${addDays(10)}T06:00:00Z`);
    const pv = await changePreview(acct, { type: 'rebuild' });
    assert.equal(pv.body.data.diff.doneProtected, 1);
    const res = await changeApply(acct, { type: 'rebuild', checksum: pv.body.data.diff.checksum });
    assert.equal(res.status, 200);
    const saved = await Plan.findOne({ user: acct.id });
    const stillDone = saved.items.id(firstDsa._id);
    assert.ok(stillDone && stillDone.doneAt && stillDone.result === 'alone' && stillDone.nextReviewDay === addDays(7), 'same id, same result and ladder');
    assert.ok(saved.items.filter((i) => !i.doneAt).every((i) => i.day >= addDays(10)), 'nothing planned before today');
    assert.equal(saved.deadline, doc.deadline);
  });
  it('new hours are saved in the plan and change what it plans', async () => {
    const { acct, plan } = await make();
    const pv = await changePreview(acct, { type: 'hours', weekdayHours: 1, weekendHours: 2, restDay: 5 });
    assert.equal(pv.status, 200);
    const res = await changeApply(acct, { type: 'hours', weekdayHours: 1, weekendHours: 2, restDay: 5, checksum: pv.body.data.diff.checksum });
    assert.equal(res.status, 200);
    const saved = res.body.data.plan;
    assert.deepEqual(saved.hoursByWeekday, [1, 1, 1, 1, 1, 2, 2]);
    assert.equal(saved.restDay, 5);
    assert.ok(saved.coverage.plannedMinutes < plan.coverage.plannedMinutes);
    assert.ok(!saved.items.some((i) => i.day >= todayIst() && new Date(`${i.day}T00:00:00Z`).getUTCDay() === 6 && i.type === 'dsa'), 'nothing on the new rest day (Saturday)');
  });
  it('lighter days are saved, and a stretch that is too long, overlapping or outside the plan is refused (422)', async () => {
    const { acct } = await make();
    const light = [{ from: addDays(3), to: addDays(5), hours: 1 }];
    const pv = await changePreview(acct, { type: 'lighter', lighterDays: light });
    assert.equal(pv.status, 200);
    const res = await changeApply(acct, { type: 'lighter', lighterDays: light, checksum: pv.body.data.diff.checksum });
    assert.deepEqual(res.body.data.plan.lighterDays, light);
    for (const bad of [[{ from: addDays(1), to: addDays(20), hours: 1 }], [{ from: addDays(1), to: addDays(3), hours: 1 }, { from: addDays(3), to: addDays(4), hours: 1 }], [{ from: addDays(-10), to: addDays(-8), hours: 1 }], [{ from: addDays(60), to: addDays(62), hours: 1 }]]) {
      assert.equal((await changePreview(acct, { type: 'lighter', lighterDays: bad })).status, 422, JSON.stringify(bad));
    }
    assert.equal((await changePreview(acct, { type: 'hours', weekdayHours: 1 })).status, 422);
    assert.equal((await changePreview(acct, { type: 'lighter' })).status, 422);
    assert.equal((await changePreview(acct, { type: 'nope' })).status, 422);
  });
  it('refuses when the plan changed after the preview (409), and for a finished plan or no plan', async () => {
    const { acct } = await make();
    const pv = await changePreview(acct, { type: 'rebuild' });
    const doc = await Plan.findOne({ user: acct.id });
    doc.items.find((i) => i.type === 'dsa').doneAt = new Date(); // the student ticked an item in between
    doc.items.find((i) => i.type === 'dsa').result = 'alone';
    await doc.save();
    const res = await changeApply(acct, { type: 'rebuild', checksum: pv.body.data.diff.checksum });
    assert.equal(res.status, 409);
    planClock.now = () => new Date(`${addDays(100)}T06:00:00Z`);
    assert.equal((await changePreview(acct, { type: 'rebuild' })).status, 409);
    const nobody = await t.register();
    assert.equal((await changePreview(nobody, { type: 'rebuild' })).status, 404);
  });
  it('is limited to 20 changes a minute per user', async () => {
    const { acct } = await make({ weeks: 1 });
    for (let i = 0; i < 20; i += 1) assert.equal((await changePreview(acct, { type: 'rebuild' })).status, 200, `change ${i + 1}`);
    assert.equal((await changePreview(acct, { type: 'rebuild' })).status, 429);
  });
});
