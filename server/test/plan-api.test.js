// My plan: the Plan model and the API (public preview, create, read, delete, changes with a preview). The generator and the adjust module have their own tests;
// these check the rules around them: who may call what, ownership, one active plan, limits, and that only a previewed change can be applied.
const t = require('./helpers/setup');
const { describe, it, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { planClock } = require('../src/shared/calendar/clock');
const { todayIst, dayNumber, ymdOf, baseId } = require('../src/modules/plan/planGenerator');

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
const personalPreview = (acct, body) => t.api.post('/api/plan/preview/personal', { cookies: acct.cookies, body });

describe('Phase 2 optional learning, ownership and confirmed scheduling', () => {
  const learningRead = (acct) => t.api.get('/api/plan/learning', { cookies: acct.cookies });
  const learningPost = (acct, action, body) => t.api.post('/api/plan/learning/' + action, { cookies: acct.cookies, body });

  it('keeps DSA, notes and roadmap evidence consistent through PATCH and result routes', async () => {
    for (const type of ['dsa', 'notes', 'roadmap', 'default-dsa']) {
      const acct = await t.register();
      const body = type === 'roadmap' ? form({ goalType: 'role', roadmapSlug: 'frontend', sheetSlug: undefined, subjects: [] }) : form();
      const created = await create(acct, body);
      assert.equal(created.status, 201, JSON.stringify(created.body));
      const items = created.body.data.plan.items;
      const source = items.find(item => item.type === (type === 'default-dsa' ? 'dsa' : type));
      assert.ok(source, type);
      const response = type === 'notes' ? { quizScore: 0, result: 'alone' }
        : type === 'default-dsa' ? { quizScore: 5 } : { result: 'solution', quizScore: 5 };
      for (const part of items.filter(item => baseId(item) === baseId(source))) {
        const reply = await t.api.patch(`/api/plan/items/${part.id}`, { cookies: acct.cookies, body: { done: true, ...response } });
        assert.equal(reply.status, 200, JSON.stringify(reply.body));
      }
      const completed = await Plan.findOne({ user: acct.id }).lean();
      assert.equal(completed.learningAttempts.at(-1).outcome, type === 'default-dsa' ? 'independent' : 'help');
      assert.equal(completed.learningAttempts.at(-1).complete, true);

      const result = type === 'notes' ? { quizScore: 5, result: 'solution' } : { result: 'alone', quizScore: 0 };
      const last = items.filter(item => baseId(item) === baseId(source)).at(-1);
      // Unlike PATCH, the result route rejects mixed fields at validation.
      const rejected = await t.api.post(`/api/plan/items/${last.id}/result`, { cookies: acct.cookies, body: result });
      assert.equal(rejected.status, 422);
      assert.deepEqual(await Plan.findOne({ user: acct.id }).lean(), completed);
      const relevant = type === 'notes' ? { quizScore: 5 } : { result: 'alone' };
      const next = completed.items.find(item => item.type === source.type && !item.doneAt && !item.skipped);
      assert.ok(next);
      for (const part of completed.items.filter(item => baseId(item) === baseId(next))) {
        const reply = await t.api.post(`/api/plan/items/${part._id}/result`, { cookies: acct.cookies, body: relevant });
        assert.equal(reply.status, 200, JSON.stringify(reply.body));
      }
      const saved = await Plan.findOne({ user: acct.id }).lean();
      assert.equal(saved.learningAttempts.at(-1).outcome, 'independent');
      for (const done of completed.items.filter(item => item.doneAt)) {
        assert.deepEqual(saved.items.find(item => item.key === done.key).doneAt, done.doneAt);
      }
    }
  });

  it('can move a re-added foundation task without touching its skipped predecessor', async () => {
    const acct = await t.register();
    await create(acct, form({ weeks: 4, restDay: null, subjects: [] }));
    await learningPost(acct, 'check', { id: 'foundation', outcome: 'help' });
    const addPractice = async () => {
      const preview = await learningPost(acct, 'preview', { offerId: 'foundation' });
      assert.equal(preview.status, 200, JSON.stringify(preview.body));
      const applied = await learningPost(acct, 'apply', { offerId: 'foundation', checksum: preview.body.data.checksum });
      assert.equal(applied.status, 200, JSON.stringify(applied.body));
      return (await getPlan(acct)).body.data.plan.items.find(item => item.learningKind === 'foundation' && !item.skipped);
    };
    const original = await addPractice();
    assert.equal((await t.api.post(`/api/plan/items/${original.id}/skip`, { cookies: acct.cookies, body: {} })).status, 200);
    const fresh = await addPractice();
    assert.notEqual(fresh.key, original.key);
    const nextDay = ymdOf(dayNumber(fresh.day) + 1);
    const moved = await t.api.patch(`/api/plan/items/${fresh.id}`, { cookies: acct.cookies, body: { day: nextDay } });
    assert.equal(moved.status, 200, JSON.stringify(moved.body));
    const saved = (await getPlan(acct)).body.data.plan;
    assert.equal(saved.items.find(item => item.id === original.id).skipped, true);
    assert.equal(saved.items.find(item => item.id === fresh.id).day, nextDay);
    assert.equal(new Set(saved.items.map(item => item.key)).size, saved.items.length);
  });

  it('fits temporary lighter days, preserves locked split order and records the actual DSA outcome', async () => {
    planClock.now = () => new Date('2026-11-09T08:00:00Z');
    const acct = await t.register();
    const created = await create(acct, form({ goalType: 'placements', sheetSlug: 'striver-a2z', pace: 'slower', weeks: 4, weekdayHours: 3, weekendHours: 3, restDay: null, subjects: [] }));
    assert.equal(created.status, 201);
    const first = created.body.data.plan.items.find(item => item.type === 'dsa');
    for (const part of created.body.data.plan.items.filter(item => item.link === first.link)) {
      assert.equal((await t.api.post(`/api/plan/items/${part.id}/result`, { cookies: acct.cookies, body: { result: 'alone' } })).status, 200);
    }
    planClock.now = () => new Date('2026-11-23T08:00:00Z');
    const offer = (await learningRead(acct)).body.data.offers.find(item => item.kind === 'transfer');
    assert.ok(offer);
    const preview = await learningPost(acct, 'preview', { offerId: offer.id });
    assert.equal(preview.status, 200);
    assert.equal((await learningPost(acct, 'apply', { offerId: offer.id, checksum: preview.body.data.checksum })).status, 200);
    const before = await Plan.findOne({ user: acct.id }).lean();
    const lighter = { type: 'lighter', lighterDays: [{ from: '2026-11-23', to: before.deadline, hours: 0.5 }] };
    const temporary = await t.api.post('/api/plan/changes/preview', { cookies: acct.cookies, body: lighter });
    assert.equal(temporary.status, 200, JSON.stringify(temporary.body));
    assert.deepEqual(await Plan.findOne({ user: acct.id }).lean(), before, 'preview must not write');
    const applied = await t.api.post('/api/plan/changes/apply', {
      cookies: acct.cookies, body: { ...lighter, checksum: temporary.body.data.diff.checksum },
    });
    assert.equal(applied.status, 200, JSON.stringify(applied.body));
    const hours = { type: 'hours', weekdayHours: 0.5, weekendHours: 0.5, restDay: null };
    const beforeHours = await Plan.findOne({ user: acct.id }).lean();
    const changed = await t.api.post('/api/plan/changes/preview', { cookies: acct.cookies, body: hours });
    assert.equal(changed.status, 200, JSON.stringify(changed.body));
    assert.deepEqual(await Plan.findOne({ user: acct.id }).lean(), beforeHours);
    assert.equal((await t.api.post('/api/plan/changes/apply', { cookies: acct.cookies, body: { ...hours, checksum: changed.body.data.diff.checksum } })).status, 200);
    const after = await Plan.findOne({ user: acct.id }).lean();
    const practice = after.items.filter(item => item.learningKind === 'transfer');
    assert.equal(practice.reduce((sum, item) => sum + item.plannedMinutes, 0), offer.minutes);
    assert.ok(practice.every(item => item.plannedMinutes <= 30));
    assert.equal(new Set(after.items.map(item => item.key)).size, after.items.length);
    for (const done of before.items.filter(item => item.doneAt)) assert.deepEqual(after.items.find(item => item.key === done.key), done);

    const last = practice.at(-1);
    const lockedDay = ymdOf(dayNumber(last.day) + 1);
    const moved = await t.api.patch(`/api/plan/items/${last._id}`, { cookies: acct.cookies, body: { day: lockedDay } });
    assert.equal(moved.status, 200, JSON.stringify(moved.body));
    const locked = await Plan.findOne({ user: acct.id }).lean();
    const rebuilt = await t.api.post('/api/plan/changes/preview', { cookies: acct.cookies, body: { type: 'rebuild' } });
    assert.equal(rebuilt.status, 200, JSON.stringify(rebuilt.body));
    assert.equal((await t.api.post('/api/plan/changes/apply', { cookies: acct.cookies,
      body: { type: 'rebuild', checksum: rebuilt.body.data.diff.checksum } })).status, 200);
    const saved = (await getPlan(acct)).body.data.plan;
    const sequence = saved.items.filter(item => item.learningKind === 'transfer');
    assert.deepEqual(sequence.map(item => item.part.n), sequence.map((_, index) => index + 1));
    assert.equal(sequence.reduce((sum, item) => sum + item.plannedMinutes, 0), offer.minutes);
    const stored = await Plan.findOne({ user: acct.id }).lean();
    for (const protectedItem of locked.items.filter(item => item.doneAt || item.locked)) {
      assert.deepEqual(stored.items.find(item => item.key === protectedItem.key), protectedItem);
    }

    // Quiz data accepted by the shared PATCH must not override a DSA solve.
    const next = saved.items.find(item => item.type === 'dsa' && !item.doneAt && !item.skipped);
    assert.ok(next);
    for (const part of saved.items.filter(item => item.ref === next.ref)) {
      const finished = await t.api.patch(`/api/plan/items/${part.id}`, { cookies: acct.cookies,
        body: { done: true, result: 'solution', quizScore: 5 } });
      assert.equal(finished.status, 200, JSON.stringify(finished.body));
    }
    const evidence = (await Plan.findOne({ user: acct.id }).lean()).learningAttempts.at(-1);
    assert.equal(evidence.type, 'dsa');
    assert.equal(evidence.outcome, 'help');
  });

  it('keeps starting checks optional and correctable without touching progress, and isolates accounts', async () => {
    const acct = await t.register();
    const other = await t.register();
    await create(acct, form({ weeks: 4, subjects: [] }));
    const before = await Plan.findOne({ user: acct.id }).lean();
    assert.equal((await t.api.get('/api/plan/learning')).status, 401);
    assert.equal((await learningRead(other)).status, 404);
    await create(other, form({ weeks: 4, subjects: [] }));
    const read = await learningRead(acct);
    assert.equal(read.status, 200);
    assert.match(read.headers['cache-control'], /private.*no-store/);
    assert.equal((await learningPost(acct, 'check', { id: 'foundation', outcome: 'help' })).status, 200);
    assert.ok((await learningRead(acct)).body.data.offers.some((offer) => offer.kind === 'foundation'));
    assert.equal((await learningRead(other)).body.data.results.length, 0);
    assert.ok(!(await learningRead(other)).body.data.offers.some((offer) => offer.kind === 'foundation'));
    assert.equal((await learningPost(acct, 'check', { id: 'foundation', outcome: 'independent' })).status, 200);
    assert.ok(!(await learningRead(acct)).body.data.offers.some((offer) => offer.kind === 'foundation'));
    assert.equal((await learningPost(acct, 'check', { id: 'foundation', outcome: 'skipped' })).status, 200);
    const after = await Plan.findOne({ user: acct.id }).lean();
    assert.deepEqual(after.items, before.items);
    assert.equal(after.startingChecks.length, 1);
    assert.equal((await learningPost(acct, 'check', { id: 'role', outcome: 'help' })).status, 422);
    assert.equal((await learningPost(acct, 'check', { id: 'foundation', outcome: 'expert' })).status, 422);
  });

  it('previews without writes, rejects stale/double/concurrent applies and saves practice separately from sheet solves', async () => {
    const acct = await t.register();
    const other = await t.register();
    await create(acct, form({ weeks: 4, subjects: [] }));
    await create(other, form({ weeks: 4, subjects: [] }));
    await learningPost(acct, 'check', { id: 'foundation', outcome: 'help' });
    const before = await Plan.findOne({ user: acct.id }).lean();
    const preview = await learningPost(acct, 'preview', { offerId: 'foundation' });
    assert.equal(preview.status, 200, JSON.stringify(preview.body));
    assert.deepEqual(await Plan.findOne({ user: acct.id }).lean(), before);
    await learningPost(acct, 'check', { id: 'foundation', outcome: 'help' });
    const stale = { offerId: 'foundation', checksum: preview.body.data.checksum };
    assert.equal((await learningPost(acct, 'apply', stale)).status, 409);
    const fresh = (await learningPost(acct, 'preview', { offerId: 'foundation' })).body.data;
    const payload = { offerId: 'foundation', checksum: fresh.checksum };
    assert.equal((await learningPost(other, 'apply', payload)).status, 409);
    const replies = await Promise.all([learningPost(acct, 'apply', payload), learningPost(acct, 'apply', payload)]);
    assert.deepEqual(replies.map((reply) => reply.status).sort(), [200, 409]);
    const saved = await Plan.findOne({ user: acct.id }).lean();
    const practice = saved.items.find((item) => item.learningKind === 'foundation');
    assert.ok(practice);
    const rubric = { familiar: false, independent: true, explained: true, tested: true, effort: 'about' };
    const finish = (user, body) => t.api.post(`/api/plan/items/${practice._id}/practice`, { cookies: user.cookies, body });
    assert.equal((await finish(other, rubric)).status, 404);
    assert.equal((await finish(acct, { independent: true })).status, 422);
    assert.equal((await finish(acct, rubric)).status, 200);
    assert.equal((await finish(acct, rubric)).status, 422);
    assert.equal(await Progress.countDocuments({ user: acct.id }), 0);
    assert.ok(!(await learningRead(acct)).body.data.offers.some((offer) => offer.kind === 'foundation'));
  });

  it('records effort on ordinary completion and offers calibration only through a preview', async () => {
    const acct = await t.register();
    const made = await create(acct, form({ weeks: 12, subjects: [] }));
    const problems = made.body.data.plan.items.filter((item) => item.type === 'dsa' && !item.part).slice(0, 5);
    assert.equal(problems.length, 5);
    for (const item of problems) {
      const reply = await t.api.post(`/api/plan/items/${item.id}/result`, { cookies: acct.cookies, body: { result: 'alone', effort: 'more' } });
      assert.equal(reply.status, 200, JSON.stringify(reply.body));
    }
    const offers = (await learningRead(acct)).body.data.offers;
    assert.ok(offers.some((offer) => offer.id === 'estimate:dsa'));
    const before = await Plan.findOne({ user: acct.id }).lean();
    const preview = await learningPost(acct, 'preview', { offerId: 'estimate:dsa' });
    assert.equal(preview.status, 200, JSON.stringify(preview.body));
    const reply = await learningPost(acct, 'apply', { offerId: 'estimate:dsa', checksum: preview.body.data.checksum });
    assert.equal(reply.status, 200, JSON.stringify(reply.body));
    const after = await Plan.findOne({ user: acct.id }).lean();
    assert.equal(after.estimateFactors.dsa, 1.15);
    assert.equal((await getPlan(acct)).body.data.plan.estimateFactors.dsa, 1.15);
    const application = (await learningRead(acct)).body.data.offers.find(offer => offer.kind === 'transfer');
    assert.ok(application);
    const problem = require('../src/modules/plan/planData').getPlanData().sheets[after.sheetSlug].topics
      .flatMap(topic => topic.problems).find(item => item.link === application.link);
    const baseMinutes = require('../src/modules/plan/planGenerator').problemMinutes(problem.difficulty, after.pace);
    assert.equal(application.minutes, Math.round(baseMinutes * 1.15));
    for (const item of before.items.filter((entry) => entry.doneAt)) assert.deepEqual(after.items.find((entry) => entry.key === item.key), item);
    assert.ok(!(await learningRead(acct)).body.data.offers.some((offer) => offer.kind === 'estimate'));
  });
});

describe('Phase 1 preview/save agreement and saved curricula', () => {
  it('limits personal previews per account while keeping students on the same network separate', async () => {
    const acct = await t.register();
    const other = await t.register();
    const body = form({weeks:1,subjects:[]});
    const ip = '192.0.2.188';
    for (let index=0;index<20;index+=1) {
      assert.equal((await t.api.post('/api/plan/preview/personal',{cookies:acct.cookies,body,ip})).status,200);
    }
    assert.equal((await t.api.post('/api/plan/preview/personal',{cookies:acct.cookies,body,ip})).status,429);
    assert.equal((await t.api.post('/api/plan/preview/personal',{cookies:other.cookies,body,ip})).status,200);
  });
  it('reports the same item-limit refusal in public preview, personal preview and save', async () => {
    planClock.now = () => new Date('2026-11-23T08:00:00Z');
    const acct = await t.register();
    const body = form({ goalType:'placements', sheetSlug:'striver-a2z', weeks:52, weekdayHours:3, weekendHours:3, restDay:null });
    const publicReply = await preview(body);
    const privateReply = await personalPreview(acct, body);
    const saved = await create(acct, body);
    assert.equal(publicReply.status, 200);
    assert.equal(privateReply.status, 200);
    assert.equal(publicReply.body.data.saveEligibility.allowed, false);
    assert.deepEqual(privateReply.body.data.saveEligibility, publicReply.body.data.saveEligibility);
    assert.equal(saved.status, 422);
    assert.equal(saved.body.message, privateReply.body.data.saveEligibility.reason);
    assert.equal(await Plan.countDocuments({ user:acct.id }), 0);
    assert.match(privateReply.headers['cache-control'], /private.*no-store/);
    assert.equal((await t.api.post('/api/plan/preview/personal', { body })).status, 401);
  });
  it('includes only owned progress, can rescue an oversized public plan, and never leaks it into public previews', async () => {
    planClock.now = () => new Date('2026-11-23T08:00:00Z');
    const acct = await t.register();
    const other = await t.register();
    const body = form({ goalType:'placements', sheetSlug:'striver-a2z', weeks:52, weekdayHours:3, weekendHours:3, restDay:null });
    const sheet = require('../src/modules/plan/planData').getPlanData().sheets['striver-a2z'];
    const solved = sheet.topics.flatMap((topic)=>topic.problems).slice(0,200).map((p)=>({link:p.link,solvedAt:new Date()}));
    await Progress.create({ user:acct.id, sheetSlug:'striver-a2z', solvedProblems:solved });
    const owned = (await personalPreview(acct, body)).body.data;
    assert.equal(owned.usesSavedProgress, true);
    assert.ok(owned.coverage.alreadySolved > 0);
    assert.equal(owned.saveEligibility.allowed, true);
    assert.equal((await personalPreview(other, body)).body.data.coverage.alreadySolved, 0);
    const publicReply = (await preview(body)).body.data;
    assert.equal(publicReply.coverage.alreadySolved, 0);
    assert.equal(publicReply.saveEligibility.allowed, false);
    const saved = await create(acct, body);
    assert.equal(saved.status, 201, JSON.stringify(saved.body));
    assert.equal(saved.body.data.plan.items.length, owned.saveEligibility.itemCount);
  });
  it('uses new milestones for new saves but leaves legacy task identities intact on rebuild', async () => {
    planClock.now = () => new Date('2026-11-23T08:00:00Z');
    const acct = await t.register();
    const body = form({ goalType:'role', roadmapSlug:'frontend', subjects:[], weeks:12, style:'mixed' });
    const made = await create(acct, body);
    assert.equal(made.status, 201, JSON.stringify(made.body));
    assert.equal(made.body.data.plan.style, 'one-topic');
    const doc = await Plan.findById(made.body.data.plan.id);
    assert.equal(doc.generationVersion, 2);
    assert.ok(doc.roadmapSnapshot.steps[0].topics.length);
    assert.ok(made.body.data.plan.items[0].milestoneId);
    assert.ok(!('roadmapSnapshot' in made.body.data.plan));
    // A pre-upgrade record has no milestone identities or generation field.
    const gen = require('../src/modules/plan/planGenerator');
    const legacy = gen.generatePlan({ goalType:'role', roadmapSlug:'frontend', generationVersion:1, style:'one-topic', startDate:'2026-11-23', weeks:12, hoursByWeekday:Array(7).fill(3), restDay:6, subjects:[] }, require('../src/modules/plan/planData').getPlanData());
    await Plan.updateOne({_id:doc.id},{$set:{items:legacy.items},$unset:{generationVersion:1,roadmapSnapshot:1}});
    const old = await getPlan(acct);
    const first = old.body.data.plan.items[0];
    await t.api.patch(`/api/plan/items/${first.id}`,{cookies:acct.cookies,body:{done:true}});
    const before = (await getPlan(acct)).body.data.plan.items.find((i)=>i.id===first.id);
    const change = {type:'rebuild'};
    const p = await changePreview(acct,change);
    assert.equal(p.status,200,JSON.stringify(p.body));
    const applied = await t.api.post('/api/plan/changes/apply',{cookies:acct.cookies,body:{...change,checksum:p.body.data.diff.checksum}});
    assert.equal(applied.status,200,JSON.stringify(applied.body));
    const items = applied.body.data.plan.items;
    assert.ok(items.every((i)=>!i.milestoneId));
    assert.equal(items.find((i)=>i.id===first.id).doneAt,before.doneAt);
  });
});

describe('seeded mixed journeys through the real planner API', () => {
  it('preserves plan rules after ticks, reviews, moves, skips, imports, substitutes and recovery', async (context) => {
    const { rng } = require('./helpers/plan-scenarios');
    const random = rng(20261123);
    const profiles = [
      {goalType:'placements',sheetSlug:'blind-75',weekdayHours:1,weekendHours:3,restDay:6},
      {goalType:'bigtech',sheetSlug:'neetcode-150',weekdayHours:2,weekendHours:4,restDay:0},
      {goalType:'role',roadmapSlug:'frontend',weekdayHours:1,weekendHours:3,restDay:6},
      {goalType:'role',roadmapSlug:'backend',weekdayHours:2,weekendHours:3,restDay:5},
    ];
    let requests = 0;
    let substitutions = 0;
    let reviews = 0;
    for (const profile of profiles) {
      planClock.now = () => new Date('2026-11-23T08:00:00Z');
      const acct = await t.register();
      async function request(method, path, body, expected = 200) {
        requests += 1;
        const reply = await t.api[method]('/api/plan' + path, {cookies:acct.cookies,body});
        assert.equal(reply.status,expected,`${profile.goalType} ${path}: ${JSON.stringify(reply.body)}`);
        return reply.body.data;
      }
      // This oracle checks the saved response, independently of generator helpers.
      async function state() {
        const view = await request('get','');
        if (!view.plan) return view;
        const {plan,today} = view;
        assert.equal(new Set(plan.items.map(i=>i.id)).size,plan.items.length);
        assert.equal(new Set(plan.items.map(i=>i.key)).size,plan.items.length);
        assert.ok(plan.items.length <= 600);
        for (const item of plan.items) {
          assert.ok(item.plannedMinutes > 0 && Number.isFinite(item.plannedMinutes));
          assert.ok(item.day >= plan.startDate && item.day <= plan.deadline);
          assert.ok(!(item.doneAt && item.skipped));
        }
        assert.equal(today.minutes,today.items.reduce((sum,item)=>sum+item.plannedMinutes,0));
        if (today.startItem) assert.ok(today.items.some(i=>i.key===today.startItem.key));
        return view;
      }
      async function apply(path,body) {
        const preview = await request('post',path+'/preview',body);
        await request('post',path+'/apply',{...body,checksum:preview.checksum || preview.diff.checksum});
        return state();
      }
      const body = form({...profile,weeks:12,subjects:['os','dbms']});
      const checked = await request('post','/preview/personal',body);
      assert.equal(checked.saveEligibility.allowed,true);
      await request('post','',body,201);
      let view = await state();
      const planId = view.plan.id;
      assert.equal(view.plan.items.length,checked.saveEligibility.itemCount);
      for (let step=0;step<20;step+=1) {
        const previous = view.plan;
        const waiting = previous.items.filter(i=>!i.doneAt&&!i.skipped&&['dsa','notes','roadmap'].includes(i.type));
        const item = waiting[Math.floor(random()*waiting.length)];
        if (!item) break;
        const action = Math.floor(random()*5);
        if (action===0) await request('patch','/items/'+item.id,{done:true,result:'hints',quizScore:4});
        if (action===1) await request('patch','/items/'+item.id+'/star');
        if (action===2) {
          await request('post','/items/'+item.id+'/skip');
          await state();
          await request('post','/items/'+item.id+'/unskip');
        }
        if (action===3) {
          const target = ymdOf(dayNumber(item.day)+1);
          const weekday = (new Date(target+'T12:00:00Z').getUTCDay()+6)%7;
          const hours = weekday===previous.restDay ? 0 : previous.hoursByWeekday[weekday];
          const blocked = target>previous.deadline || !hours || Math.abs(dayNumber(target)-dayNumber(item.plannedDay))>3 || previous.items.some(i=>i.type==='mock'&&i.day===target);
          await request('patch','/items/'+item.id,{day:target},blocked?422:200);
        }
        if (action===4) {
          const completed = previous.items.find(i=>i.doneAt);
          if (completed) await request('patch','/items/'+completed.id,{done:false});
        }
        view = await state();
        if (action!==4) for (const completed of previous.items.filter(i=>i.doneAt)) {
          assert.equal(view.plan.items.find(i=>i.id===completed.id)?.doneAt,completed.doneAt);
        }
      }
      const custom = await request('post','/items',{title:'Explain a project decision',plannedMinutes:15,day:view.plan.items[0].day},201);
      await state();
      await request('patch','/items/'+custom.item.id,{done:true});
      await state();
      await request('del','/items/'+custom.item.id);
      view = await state();
      const exercise = view.plan.items.find(i=>!i.doneAt&&!i.skipped&&!i.part&&i.type==='dsa');
      if (exercise) {
        const result = await request('post','/items/'+exercise.id+'/result',{result:'solution'});
        await state();
        await request('post','/items/'+exercise.id+'/review',{passed:true},422);
        planClock.now = () => new Date(result.item.nextReviewDay+'T08:00:00Z');
        await request('post','/items/'+exercise.id+'/review',{passed:false});
        await state();
        await request('post','/items/'+exercise.id+'/review',{passed:true},422);
        reviews += 1;
      }
      view = await state();
      const beforePause = view.plan.items.reduce((sum,i)=>sum+i.plannedMinutes,0);
      const resumeDay = ymdOf(dayNumber(view.calendar.today)+14);
      await apply('/lifecycle',{type:'pause'});
      assert.equal((await state()).plan,null);
      planClock.now = () => new Date(resumeDay+'T08:00:00Z');
      view = await apply('/lifecycle',{type:'resume',planId});
      assert.equal(view.plan.items.reduce((sum,i)=>sum+i.plannedMinutes,0),beforePause);
      const report = await importReport(acct);
      view = await apply('/reports/'+report.id,{mode:'merge'});
      const imported = view.plan.items.filter(i=>i.source==='analyzer:'+report.id).map(i=>i.id);
      assert.ok(imported.length);
      view = await apply('/changes',{type:'rebuild',deadline:ymdOf(dayNumber(view.plan.deadline)+7)});
      assert.ok(imported.every(id=>view.plan.items.some(i=>i.id===id)));
      const candidate = view.plan.items.find(i=>i.type==='dsa'&&!i.doneAt&&!i.skipped&&!i.part);
      if (candidate) {
        const options = await request('get','/items/'+candidate.id+'/substitutes');
        const choice = options.substitutes[0];
        if (choice) {
          await request('post','/items/'+candidate.id+'/substitute',{sheetSlug:choice.sheetSlug,link:choice.link,checksum:choice.checksum});
          await state();
          substitutions += 1;
        }
      }
      await request('get','/review');
    }
    assert.ok(substitutions>0 && reviews>0,'the journeys actually exercise substitutions and review writes');
    context.diagnostic(`${requests} requests across four seeded student journeys; ${reviews} review flows, ${substitutions} substitutions`);
  });
});

const lifecyclePreview = (acct, body) => t.api.post('/api/plan/lifecycle/preview', { cookies: acct.cookies, body });
async function lifecycleApply(acct, body) {
  const preview = await lifecyclePreview(acct, body);
  assert.equal(preview.status, 200, JSON.stringify(preview.body));
  return t.api.post('/api/plan/lifecycle/apply', { cookies: acct.cookies, body: { ...body, checksum: preview.body.data.checksum } });
}

describe('study calendar, freeze and short sprint recovery', () => {
  it('refits a five-day break around rest days and retains every unfinished minute', async () => {
    const { hoursOn } = require('../src/modules/plan/planAdjust');
    const { dayBudget } = require('../src/modules/plan/planGenerator');
    planClock.now = () => new Date('2026-11-16T07:00:00Z');
    const acct = await t.register();
    const made = (await create(acct, form({
      goalType: 'placements', sheetSlug: 'blind-75', subjects: ['os', 'dbms'],
      weeks: 4, weekdayHours: 1, weekendHours: 3, restDay: 6,
    }))).body.data.plan;
    const task = made.items.find((item) => item.type === 'dsa' && !item.part);
    const result = await t.api.post(`/api/plan/items/${task.id}/result`, { cookies: acct.cookies, body: { result: 'hints' } });
    assert.equal(result.status, 200);
    const before = (await getPlan(acct)).body.data.plan;
    await lifecycleApply(acct, { type: 'pause' });
    planClock.now = () => new Date('2026-11-21T07:00:00Z');
    const body = { type: 'resume', planId: made.id };
    const preview = await lifecyclePreview(acct, body);
    assert.equal(preview.status, 200);
    assert.equal(preview.body.data.shiftDays, 5);
    assert.ok(preview.body.data.refitted > 0);
    assert.ok(preview.body.data.extraDays > 0);
    assert.equal((await lifecyclePreview(acct, { ...body, extendDeadline: false })).status, 422);
    assert.equal((await getPlan(acct)).body.data.plan, null, 'preview does not resume the plan');
    assert.equal((await lifecycleApply(acct, body)).status, 200);
    const after = (await getPlan(acct)).body.data.plan;
    assert.equal(after.deadline, preview.body.data.deadlineAfter);
    assert.deepEqual(after.items.map((item) => item.key).sort(), before.items.map((item) => item.key).sort());
    const completed = after.items.find((item) => item.id === task.id);
    assert.equal(completed.doneAt, result.body.data.item.doneAt);
    assert.equal(completed.nextReviewDay, '2026-11-24');
    const totals = new Map();
    for (const item of after.items.filter((item) => !item.doneAt)) {
      assert.ok(item.day >= '2026-11-21' && item.day <= after.deadline);
      totals.set(item.day, (totals.get(item.day) || 0) + item.plannedMinutes);
    }
    for (const [day, minutes] of totals) assert.ok(minutes <= dayBudget(hoursOn(after, day)).planned, day);
  });

  it('restores a missing split remainder after a second rebuild and credits it only when finished', async () => {
    planClock.now = () => new Date('2026-11-16T07:00:00Z');
    const acct = await t.register();
    const made = (await create(acct, form({
      goalType: 'placements', sheetSlug: 'blind-75', subjects: [],
      weeks: 4, weekdayHours: 0.5, weekendHours: 0.5, restDay: 6,
    }))).body.data.plan;
    const first = made.items.find((item) => item.title === 'Two Sum' && item.part?.n === 1);
    const result = () => t.api.post(`/api/plan/items/${first.id}/result`, { cookies: acct.cookies, body: { result: 'hints' } });
    assert.equal((await result()).body.data.started, false);
    planClock.now = () => new Date(made.deadline + 'T07:00:00Z');
    async function rebuild(change) {
      const preview = await changePreview(acct, change);
      assert.equal(preview.status, 200, JSON.stringify(preview.body));
      const saved = await t.api.post('/api/plan/changes/apply', {
        cookies: acct.cookies, body: { ...change, checksum: preview.body.data.diff.checksum },
      });
      assert.equal(saved.status, 200, JSON.stringify(saved.body));
      return saved.body.data.plan;
    }
    const saved = await rebuild({ type: 'rebuild' });
    const partial = saved.items.find((item) => item.id === first.id);
    assert.deepEqual(partial.partialProgress, { completedMinutes: 21, totalMinutes: 40, unscheduledMinutes: 19 });
    assert.equal(partial.part.of, 2);
    assert.equal(await Progress.countDocuments({ user: acct.id }), 0);
    // Read and rebuild an older record that stored the remainder only in coverage.
    await Plan.updateOne({ _id: made.id, 'items._id': first.id }, { $unset: { 'items.$.unscheduledMinutes': 1 } });
    assert.deepEqual((await getPlan(acct)).body.data.plan.items.find((item) => item.id === first.id).partialProgress, partial.partialProgress);
    const extended = await rebuild({ type: 'rebuild', deadline: ymdOf(dayNumber(made.deadline) + 14) });
    const outstanding = extended.items.filter((item) => item.link === first.link && !item.doneAt);
    assert.equal(outstanding.reduce((sum, item) => sum + item.plannedMinutes, 0), 19);
    assert.equal(extended.items.find((item) => item.id === first.id).doneAt, partial.doneAt);
    assert.ok(!extended.items.find((item) => item.id === first.id).partialProgress);
    const last = await t.api.post(`/api/plan/items/${outstanding.at(-1).id}/result`, { cookies: acct.cookies, body: { result: 'alone' } });
    assert.equal(last.body.data.started, true);
    assert.equal(await Progress.countDocuments({ user: acct.id }), 1);
  });

  it('concurrent resume applies once and account deletion includes a paused main plan', async () => {
    planClock.now = () => new Date('2026-11-16T12:00:00Z');
    const acct = await t.register();
    const made = (await create(acct, form({ restDay: null }))).body.data.plan;
    assert.equal((await lifecycleApply(acct, { type: 'pause' })).status, 200);
    planClock.now = () => new Date('2026-11-30T12:00:00Z');
    const body = { type: 'resume', planId: made.id };
    const preview = await lifecyclePreview(acct, body);
    const confirmed = { ...body, checksum: preview.body.data.checksum };
    const responses = await Promise.all([1, 2].map(() => t.api.post('/api/plan/lifecycle/apply', { cookies: acct.cookies, body: confirmed })));
    assert.equal(responses.filter((response) => response.status === 200).length, 1);
    assert.ok(responses.every((response) => [200, 404, 409].includes(response.status)));
    assert.equal((await Plan.findById(made.id)).deadline, ymdOf(dayNumber(made.deadline) + 14));
    assert.equal((await lifecycleApply(acct, { type: 'pause' })).status, 200);
    const removed = await t.api.del('/api/user/account', { cookies: acct.cookies, body: { password: acct.password } });
    assert.equal(removed.status, 200, JSON.stringify(removed.body));
    assert.equal(await Plan.countDocuments({ user: acct.id }), 0);
  });

  it('keeps legacy same-day review protection when calendar settings move the day forward', async () => {
    planClock.now = () => new Date('2026-11-16T19:00:00Z');
    const acct = await t.register();
    assert.equal((await lifecycleApply(acct, { type: 'calendar', timeZone: 'America/Los_Angeles', dayStartHour: 4 })).status, 200);
    const made = (await create(acct, form({ restDay: null }))).body.data.plan;
    const doc = await Plan.findById(made.id);
    const item = doc.items.find((entry) => entry.type === 'dsa' && !entry.part);
    Object.assign(item, { doneAt: planClock.now(), reviewStage: 0, reviewLadder: 'solution', nextReviewDay: '2026-11-16', reviewBaseDay: '2026-11-01', lastReviewDay: '2026-11-16' });
    await doc.save();
    assert.equal((await lifecycleApply(acct, { type: 'calendar', timeZone: 'Asia/Kolkata', dayStartHour: 0 })).status, 200);
    const response = await t.api.post(`/api/plan/items/${item._id}/review`, { cookies: acct.cookies, body: { passed: true } });
    assert.equal(response.status, 422);
    assert.equal((await Plan.findById(made.id)).items.id(item._id).reviewStage, 0);
  });
  it('pauses safely, resumes after 14 days, archives a sprint and protects completed work', async () => {
    planClock.now = () => new Date('2026-11-16T12:00:00Z');
    const acct = await t.register();
    const made = (await create(acct, form({ weeks: 8, restDay: null }))).body.data.plan;
    const item = made.items.find((entry) => entry.type === 'dsa' && !entry.part);
    assert.equal((await t.api.post(`/api/plan/items/${item.id}/result`, { cookies: acct.cookies, body: { result: 'hints' } })).status, 200);
    const original = await Plan.findById(made.id).lean();
    const completed = original.items.find((entry) => String(entry._id) === item.id);
    const pending = original.items.find((entry) => !entry.doneAt);
    assert.equal(completed.completedStudyDay, '2026-11-16');
    const beforePreview = await lifecyclePreview(acct, { type: 'pause' });
    assert.equal(beforePreview.status, 200);
    assert.equal((await Plan.findById(made.id)).status, 'active');
    assert.equal((await lifecycleApply(acct, { type: 'pause' })).status, 200);
    assert.equal((await getPlan(acct)).body.data.plan, null);
    assert.equal((await getPlan(acct)).body.data.pausedPlans.length, 1);
    assert.equal((await t.api.patch(`/api/plan/items/${item.id}`, { cookies: acct.cookies, body: { done: false } })).status, 404);
    planClock.now = () => new Date('2026-11-30T12:00:00Z');
    const sprint = (await create(acct, form({ weeks: 1, restDay: null, title: 'Interview sprint' }))).body.data.plan;
    assert.ok(sprint);
    assert.equal((await lifecyclePreview(acct, { type: 'pause' })).status, 409, 'one paused main plan only');
    const body = { type: 'resume', planId: made.id };
    const preview = await lifecyclePreview(acct, body);
    assert.equal(preview.status, 200);
    assert.equal(preview.body.data.shiftDays, 14);
    assert.equal(preview.body.data.archiveActive.title, 'Interview sprint');
    const confirm = { ...body, checksum: preview.body.data.checksum };
    assert.equal((await t.api.post('/api/plan/lifecycle/apply', { cookies: acct.cookies, body: confirm })).status, 200);
    const resumed = await Plan.findById(made.id).lean();
    const after = resumed.items.find((entry) => String(entry._id) === item.id);
    assert.equal(resumed.deadline, ymdOf(dayNumber(original.deadline) + 14));
    assert.equal(after.doneAt.toISOString(), completed.doneAt.toISOString());
    assert.equal(after.day, completed.day);
    assert.equal(after.completedStudyDay, completed.completedStudyDay);
    assert.equal(after.nextReviewDay, ymdOf(dayNumber(completed.nextReviewDay) + 14));
    assert.equal(after.reviewBaseDay, ymdOf(dayNumber(completed.reviewBaseDay) + 14));
    assert.equal(after.reviewStage, completed.reviewStage);
    assert.equal(resumed.items.find((entry) => String(entry._id) === String(pending._id)).day, ymdOf(dayNumber(pending.day) + 14));
    assert.equal((await Plan.findById(sprint.id)).status, 'finished');
    assert.equal((await t.api.post('/api/plan/lifecycle/apply', { cookies: acct.cookies, body: confirm })).status, 404);
    assert.equal((await Plan.findById(made.id)).deadline, resumed.deadline, 'repeat resume never shifts twice');
    assert.equal((await lifecycleApply(acct, { type: 'pause' })).status, 200);
    await t.api.del('/api/plan/history', { cookies: acct.cookies });
    assert.equal((await Plan.findById(made.id)).status, 'paused', 'history cleanup excludes paused plans');
    assert.equal((await lifecycleApply(acct, { type: 'discard', planId: made.id })).status, 200);
    assert.equal(await Plan.findById(made.id), null);
    assert.ok(await Progress.findOne({ user: acct.id }), 'sheet solves survive deletion');
  });

  it('rejects unowned, stale and invalid lifecycle changes and restores a sprint after failed resume', async () => {
    planClock.now = () => new Date('2026-11-16T12:00:00Z');
    const acct = await t.register();
    const outsider = await t.register();
    const made = (await create(acct, form({ restDay: null }))).body.data.plan;
    assert.equal((await lifecycleApply(acct, { type: 'pause' })).status, 200);
    assert.equal((await t.api.get(`/api/plan/paused/${made.id}`, { cookies: outsider.cookies })).status, 404);
    assert.equal((await lifecyclePreview(outsider, { type: 'resume', planId: made.id })).status, 404);
    assert.equal((await lifecyclePreview(acct, { type: 'calendar', timeZone: 'Fake/Zone', dayStartHour: 4 })).status, 422);
    assert.equal((await lifecyclePreview(acct, { type: 'calendar', timeZone: 'UTC', dayStartHour: 24 })).status, 422);
    const sprint = (await create(acct, form({ weeks: 1, restDay: null }))).body.data.plan;
    const body = { type: 'resume', planId: made.id };
    const preview = await lifecyclePreview(acct, body);
    await Plan.updateOne({ _id: made.id }, { $set: { title: 'Changed after preview' } });
    assert.equal((await t.api.post('/api/plan/lifecycle/apply', { cookies: acct.cookies, body: { ...body, checksum: preview.body.data.checksum } })).status, 409);
    const fresh = await lifecyclePreview(acct, body);
    const originalUpdate = Plan.updateOne;
    Plan.updateOne = function(filter, ...args) {
      if (String(filter._id) === made.id && filter.status === 'paused') throw new Error('Injected resume failure');
      return originalUpdate.call(this, filter, ...args);
    };
    try {
      assert.equal((await t.api.post('/api/plan/lifecycle/apply', { cookies: acct.cookies, body: { ...body, checksum: fresh.body.data.checksum } })).status, 500);
    } finally { Plan.updateOne = originalUpdate; }
    assert.equal((await Plan.findById(sprint.id)).status, 'active');
    assert.equal((await Plan.findById(made.id)).status, 'paused');
  });

  it('uses a saved night-owl clock and prevents repeat reviews across timezone changes', async () => {
    planClock.now = () => new Date('2026-11-16T19:00:00Z');
    const acct = await t.register();
    assert.equal((await lifecycleApply(acct, { type: 'calendar', timeZone: 'Asia/Kolkata', dayStartHour: 4 })).status, 200);
    let state = (await getPlan(acct)).body.data;
    assert.equal(state.calendar.today, '2026-11-16');
    assert.equal(state.calendar.nextRollover, '2026-11-16T22:30:00.000Z');
    const made = (await create(acct, form({ restDay: null }))).body.data.plan;
    assert.equal(made.startDate, '2026-11-16');
    const item = made.items.find((entry) => entry.type === 'dsa' && !entry.part);
    await t.api.post(`/api/plan/items/${item.id}/result`, { cookies: acct.cookies, body: { result: 'solution' } });
    await Plan.updateOne({ _id: made.id, 'items._id': item.id }, { $set: { 'items.$.nextReviewDay': '2026-11-16', 'items.$.reviewBaseDay': '2026-10-01' } });
    const review = () => t.api.post(`/api/plan/items/${item.id}/review`, { cookies: acct.cookies, body: { passed: true } });
    assert.equal((await review()).status, 200);
    assert.equal((await lifecycleApply(acct, { type: 'calendar', timeZone: 'Asia/Kolkata', dayStartHour: 0 })).status, 200);
    state = (await getPlan(acct)).body.data;
    assert.equal(state.calendar.today, '2026-11-17');
    assert.equal((await review()).status, 422, 'old study-day window still applies');
    assert.equal((await Plan.findById(made.id)).items.id(item.id).completedStudyDay, '2026-11-16');
    planClock.now = () => new Date('2026-11-17T19:00:00Z');
    assert.equal((await review()).status, 200);
  });

  it('reschedules overdue reviews only after fresh confirmation without changing solve credit', async () => {
    planClock.now = () => new Date('2026-11-16T12:00:00Z');
    const acct = await t.register();
    const made = (await create(acct, form({ restDay: null }))).body.data.plan;
    const doc = await Plan.findById(made.id);
    const items = doc.items.filter((entry) => entry.type === 'dsa' && !entry.part).slice(0, 12);
    for (const item of items) Object.assign(item, { doneAt: planClock.now(), completedStudyDay: '2026-11-16', reviewLadder: 'solution', reviewStage: 0, reviewBaseDay: '2026-11-01', nextReviewDay: '2026-11-02' });
    doc.hoursByWeekday = Array(7).fill(0.5);
    await doc.save();
    assert.equal((await lifecyclePreview(acct, { type: 'recover', recoveryDays: 1 })).status, 422);
    const progressBefore = await Progress.find({ user: acct.id }).lean();
    const body = { type: 'recover', recoveryDays: 14 };
    const preview = await lifecyclePreview(acct, body);
    assert.equal(preview.status, 200);
    assert.equal(preview.body.data.reviewCount, 12);
    assert.equal((await Plan.findById(made.id)).items.id(items[0]._id).nextReviewDay, '2026-11-02');
    assert.equal((await lifecycleApply(acct, body)).status, 200);
    const after = await Plan.findById(made.id);
    for (const item of items) {
      const next = after.items.id(item._id);
      assert.equal(next.reviewStage, 0);
      assert.equal(next.doneAt.toISOString(), item.doneAt.toISOString());
      assert.ok(next.nextReviewDay >= '2026-11-16' && next.nextReviewDay <= '2026-11-29');
    }
    assert.deepEqual(await Progress.find({ user: acct.id }).lean(), progressBefore);
  });
});

// Direct model fixtures avoid an AI request while exercising the real import API.
async function importReport(acct) {
  const Report = t.mongoose.model('InterviewReport');
  const data = require('../src/modules/plan/planData').getPlanData();
  return Report.create({
    user: acct.id, title: 'Frontend role', jobDescription: 'Saved test role', days: 7, score: 50,
    plan: [
      { day: 1, items: [
        { task: 'Practice arrays', ref: 'dsa:blind-75:arrays-hashing' },
        { task: 'Read system design', ref: 'notes:hld:' + data.notes.hld[0].id },
        { task: 'Explain a project decision' },
      ] },
      { day: 2, items: [{ task: 'Build a small frontend', ref: 'roadmap:frontend' }] },
    ],
  });
}
const importPreview = (acct, report, mode = 'merge') => t.api.post(`/api/plan/reports/${report._id}/preview`, { cookies: acct.cookies, body: { mode } });
const importApply = (acct, report, preview) => t.api.post(`/api/plan/reports/${report._id}/apply`, {
  cookies: acct.cookies, body: { mode: preview.mode, checksum: preview.checksum },
});

describe('Analyzer report connections', () => {
  it('extends a deadline only through its confirmed preview and preserves completed work', async () => {
    const acct = await t.register();
    const made = (await create(acct, form({ weeks: 4, restDay: null }))).body.data.plan;
    const item = made.items.find((entry) => entry.type === 'dsa' && !entry.part);
    await t.api.post(`/api/plan/items/${item.id}/result`, { cookies: acct.cookies, body: { result: 'alone' } });
    const before = (await Plan.findById(made.id)).items.id(item.id).toObject();
    const change = { type: 'rebuild', deadline: ymdOf(dayNumber(made.deadline) + 14) };
    const preview = await t.api.post('/api/plan/changes/preview', { cookies: acct.cookies, body: change });
    assert.equal(preview.status, 200);
    assert.equal((await Plan.findById(made.id)).deadline, made.deadline, 'preview writes nothing');
    const tampered = { ...change, deadline: ymdOf(dayNumber(change.deadline) + 7), checksum: preview.body.data.diff.checksum };
    assert.equal((await t.api.post('/api/plan/changes/apply', { cookies: acct.cookies, body: tampered })).status, 409);
    const applied = await t.api.post('/api/plan/changes/apply', { cookies: acct.cookies, body: { ...change, checksum: preview.body.data.diff.checksum } });
    assert.equal(applied.status, 200);
    const after = await Plan.findById(made.id);
    assert.equal(after.deadline, change.deadline);
    assert.equal(after.weeks, 6);
    assert.deepEqual(after.items.id(item.id).toObject(), before);
    assert.equal((await t.api.post('/api/plan/changes/preview', { cookies: acct.cookies, body: { type: 'rebuild', deadline: made.startDate } })).status, 422);
  });

  it('recognizes legacy URL aliases without rewriting solve dates or double-counting progress', async () => {
    const acct = await t.register();
    const made = (await create(acct, form({ weeks: 4, restDay: null }))).body.data.plan;
    const item = made.items.find((entry) => entry.type === 'dsa' && !entry.part);
    const date = new Date('2026-11-01T08:00:00Z');
    const sheet = t.sheetSeedData().find((entry) => entry.slug === item.sheet);
    await t.getModels().DSASheet.updateOne({ slug: item.sheet }, { $set: sheet }, { upsert: true });
    await Progress.create({ user: acct.id, sheetSlug: item.sheet, solvedProblems: [
      { link: item.link.replace(/\/$/, ''), solvedAt: date },
      { link: item.link, solvedAt: new Date('2026-11-02T08:00:00Z') },
    ] });
    const view = (await getPlan(acct)).body.data.plan.items.find((entry) => entry.id === item.id);
    assert.equal(view.solvedOnSheet, true);
    const progress = await t.api.get(`/api/sheets/${item.sheet}/progress`, { cookies: acct.cookies });
    assert.deepEqual(progress.body.data.solvedProblems, [item.link]);
    const toggled = await t.api.post(`/api/sheets/${item.sheet}/progress`, { cookies: acct.cookies, body: { problemLink: item.link.replace(/\/$/, '') } });
    assert.equal(toggled.status, 200);
    assert.deepEqual(toggled.body.data.solvedProblems, []);
    assert.equal((await Plan.findById(made.id)).items.id(item.id).doneAt, null);
  });

  it('substitutes a separate problem with fresh consent and never solves the original', async () => {
    const acct = await t.register();
    const made = (await create(acct, form({ goalType: 'placements', sheetSlug: 'blind-75', weeks: 1, restDay: null, subjects: [] }))).body.data.plan;
    const original = made.items.find((entry) => entry.type === 'dsa');
    const options = await t.api.get(`/api/plan/items/${original.id}/substitutes`, { cookies: acct.cookies });
    assert.equal(options.status, 200);
    const choice = options.body.data.substitutes[0];
    assert.ok(choice, 'another sheet supplies an unscheduled problem in this topic');
    const body = { sheetSlug: choice.sheetSlug, link: choice.link, checksum: choice.checksum };
    assert.equal((await t.api.post(`/api/plan/items/${original.id}/substitute`, { cookies: acct.cookies, body: { ...body, checksum: '0'.repeat(32) } })).status, 409);
    const reply = await t.api.post(`/api/plan/items/${original.id}/substitute`, { cookies: acct.cookies, body });
    assert.equal(reply.status, 200);
    const next = reply.body.data.plan.items.find((entry) => entry.replacesKey === original.key);
    assert.ok(next);
    assert.equal(reply.body.data.plan.items.find((entry) => entry.id === original.id).skipped, true);
    assert.equal((await t.api.post(`/api/plan/items/${next.id}/result`, { cookies: acct.cookies, body: { result: 'alone' } })).status, 200);
    const links = (await Progress.find({ user: acct.id }).lean()).flatMap((row) => row.solvedProblems.map((entry) => entry.link));
    assert.ok(links.includes(next.link));
    assert.ok(!links.includes(original.link));
    assert.equal((await t.api.get(`/api/plan/items/${next.id}/substitutes`, { cookies: acct.cookies })).status, 422);
  });
  it('previews owned report tasks without writing, validates consent and hides other owners', async () => {
    const acct = await t.register();
    const other = await t.register();
    const report = await importReport(acct);
    const response = await importPreview(acct, report);
    assert.equal(response.status, 200);
    const preview = response.body.data;
    assert.equal(preview.addedCount, 4);
    assert.equal(preview.createsPlan, true);
    assert.equal(preview.items[0].type, 'custom');
    assert.equal(preview.items[0].plannedMinutes, 60);
    assert.equal(preview.items.find((item) => item.type === 'roadmap').plannedMinutes, 120);
    assert.equal(await Plan.countDocuments({ user: acct.id }), 0);
    assert.equal((await importPreview(other, report)).status, 404);
    for (const route of ['preview', 'apply']) {
      assert.equal((await t.api.post(`/api/plan/reports/${report._id}/${route}`, { body: { mode: 'merge', checksum: preview.checksum } })).status, 401);
      assert.equal((await t.api.post(`/api/plan/reports/not-an-id/${route}`, { cookies: acct.cookies, body: { mode: 'merge', checksum: preview.checksum } })).status, 404);
    }
    assert.equal((await t.api.post(`/api/plan/reports/${report._id}/preview`, { cookies: acct.cookies, body: { mode: 'bad' } })).status, 422);
    assert.equal((await t.api.post(`/api/plan/reports/${report._id}/apply`, { cookies: acct.cookies, body: { mode: 'merge' } })).status, 422);
    assert.equal((await importApply(acct, report, { ...preview, checksum: '0'.repeat(32) })).status, 409);
  });

  it('merges once, preserves completed and locked rows, and never solves a topic as a problem', async () => {
    const acct = await t.register();
    const report = await importReport(acct);
    const made = await create(acct, form({ weeks: 4, restDay: null }));
    const first = made.body.data.plan.items.find((item) => item.type === 'dsa' && !item.part);
    await t.api.patch(`/api/plan/items/${first.id}`, { cookies: acct.cookies, body: { done: true, result: 'alone' } });
    const doc = await Plan.findOne({ user: acct.id });
    doc.items[1].locked = true;
    await doc.save();
    const before = doc.items.map((item) => item.toObject());
    const progressBefore = await Progress.find({ user: acct.id }).lean();
    const preview = (await importPreview(acct, report)).body.data;
    const replies = await Promise.all([importApply(acct, report, preview), importApply(acct, report, preview)]);
    assert.equal(replies.filter((reply) => reply.status === 200).length, 1);
    assert.ok(replies.every((reply) => [200, 409, 422].includes(reply.status)));
    const after = await Plan.findOne({ user: acct.id });
    for (const item of before) assert.deepEqual(after.items.id(item._id).toObject(), item);
    assert.equal(new Set(after.items.map((item) => item.key)).size, after.items.length);
    assert.equal((await importPreview(acct, report)).status, 422);
    const topic = after.items.find((item) => item.source === 'analyzer:' + report._id && item.ref?.startsWith('dsa:'));
    assert.equal((await t.api.patch(`/api/plan/items/${topic._id}`, { cookies: acct.cookies, body: { done: true } })).status, 200);
    assert.deepEqual(await Progress.find({ user: acct.id }).lean(), progressBefore);
  });

  it('refuses a preview after either the plan or the source report changes', async () => {
    const acct = await t.register();
    const report = await importReport(acct);
    const made = await create(acct, form({ weeks: 4, restDay: null }));
    let preview = (await importPreview(acct, report)).body.data;
    await t.api.patch(`/api/plan/items/${made.body.data.plan.items[0].id}/star`, { cookies: acct.cookies });
    assert.equal((await importApply(acct, report, preview)).status, 409);
    preview = (await importPreview(acct, report)).body.data;
    await t.api.patch(`/api/analyzer/${report._id}/plan`, { cookies: acct.cookies, body: { day: 1, index: 0, done: true } });
    assert.equal((await importApply(acct, report, preview)).status, 409);
  });

  it('reports overload and refuses an import beyond the item cap', async () => {
    const acct = await t.register();
    const report = await importReport(acct);
    await create(acct, form({ weeks: 1, weekdayHours: 0.5, weekendHours: 0.5, restDay: null }));
    const preview = await importPreview(acct, report);
    assert.equal(preview.status, 200);
    assert.ok(preview.body.data.overloadMinutes > 0);
    const doc = await Plan.findOne({ user: acct.id });
    doc.items = Array.from({ length: 600 }, (_, index) => ({ key: 'custom:' + index, title: 'Task', type: 'custom', source: 'student', plannedMinutes: 1, day: doc.startDate }));
    await doc.save();
    assert.equal((await importPreview(acct, report)).status, 422);
    assert.equal((await Plan.findById(doc._id)).items.length, 600);
  });

  it('replaces an expired plan with report days, keeping its history and sheet progress', async () => {
    const acct = await t.register();
    const report = await importReport(acct);
    await create(acct, form({ weeks: 1 }));
    const old = await Plan.findOne({ user: acct.id });
    old.deadline = '2020-01-01';
    await old.save();
    assert.equal((await importPreview(acct, report)).status, 409);
    const preview = (await importPreview(acct, report, 'replace')).body.data;
    const applied = await importApply(acct, report, preview);
    assert.equal(applied.status, 200);
    assert.notEqual(applied.body.data.plan.id, String(old._id));
    assert.equal(dayNumber(applied.body.data.plan.deadline) - dayNumber(applied.body.data.plan.startDate), 6);
    const history = await t.api.get(`/api/plan/history/${old._id}`, { cookies: acct.cookies });
    assert.equal(history.status, 200);
    assert.deepEqual((await Plan.findById(old._id)).items.toObject(), old.items.toObject());
    assert.equal(await Progress.countDocuments({ user: acct.id }), 0);
  });

  it('restores the original active plan when saving a replacement fails', async () => {
    const acct = await t.register();
    const report = await importReport(acct);
    const made = await create(acct, form({ weeks: 1 }));
    const preview = (await importPreview(acct, report, 'replace')).body.data;
    const insert = Plan.collection.insertOne;
    Plan.collection.insertOne = async () => { throw new Error('simulated failed import save'); };
    try {
      assert.equal((await importApply(acct, report, preview)).status, 500);
    } finally { Plan.collection.insertOne = insert; }
    const active = await Plan.findOne({ user: acct.id, status: 'active' });
    assert.equal(String(active._id), made.body.data.plan.id);
    assert.equal(await Plan.countDocuments({ user: acct.id }), 1);
  });

  it('creates report-only plans that carry over and rebuild their own remaining tasks', async () => {
    const acct = await t.register();
    const report = await importReport(acct);
    const preview = (await importPreview(acct, report)).body.data;
    assert.equal((await importApply(acct, report, preview)).status, 200);
    const doc = await Plan.findOne({ user: acct.id });
    assert.equal(doc.originReport, String(report._id));
    const task = doc.items.find((item) => item.type === 'custom');
    planClock.now = () => new Date(ymdOf(dayNumber(doc.startDate) + 1) + 'T08:00:00Z');
    const today = (await getPlan(acct)).body.data.today;
    assert.ok(today.items.some((item) => item.id === String(task._id)), 'missed report tasks remain visible');
    await t.api.patch(`/api/plan/items/${task._id}`, { cookies: acct.cookies, body: { done: true } });
    const saved = (await Plan.findById(doc._id)).items.id(task._id).toObject();
    const change = { type: 'hours', weekdayHours: 1, weekendHours: 2 };
    const changedPreview = await t.api.post('/api/plan/changes/preview', { cookies: acct.cookies, body: change });
    assert.equal(changedPreview.status, 200);
    const applied = await t.api.post('/api/plan/changes/apply', { cookies: acct.cookies, body: { ...change, checksum: changedPreview.body.data.diff.checksum } });
    assert.equal(applied.status, 200);
    const after = await Plan.findById(doc._id);
    assert.equal(after.items.length, doc.items.length);
    assert.ok(after.items.every((item) => item.source === 'analyzer:' + report._id));
    assert.deepEqual(after.items.id(task._id).toObject(), saved);
  });
});

describe('Finished-plan history is private and read-only', () => {
  it('lists and reads owned snapshots after replacement, without later sheet overlays', async () => {
    const acct = await t.register();
    const old = (await create(acct, form({ weeks: 4 }))).body.data.plan;
    assert.equal((await create(acct, form({ weeks: 5, replace: true }))).status, 201);
    const list = await t.api.get('/api/plan/history', { cookies: acct.cookies });
    assert.equal(list.status, 200);
    assert.deepEqual(list.body.data.plans.map((p) => p.id), [old.id]);
    const item = old.items.find((it) => it.type === 'dsa');
    await Progress.create({ user: acct.id, sheetSlug: item.sheet, solvedProblems: [{ link: item.link, solvedAt: new Date() }] });
    const read = await t.api.get(`/api/plan/history/${old.id}`, { cookies: acct.cookies });
    assert.equal(read.status, 200);
    assert.equal(read.body.data.readOnly, true);
    assert.equal(read.body.data.plan.status, 'finished');
    assert.equal(read.body.data.plan.items.find((it) => it.id === item.id).solvedOnSheet, false);
    assert.equal((await t.api.patch(`/api/plan/items/${item.id}`, { cookies: acct.cookies, body: { done: true } })).status, 404);
    const stranger = await t.register();
    assert.deepEqual((await t.api.get('/api/plan/history', { cookies: stranger.cookies })).body.data.plans, []);
    assert.equal((await t.api.get(`/api/plan/history/${old.id}`, { cookies: stranger.cookies })).status, 404);
    assert.equal((await t.api.get('/api/plan/history')).status, 401);
    assert.equal((await t.api.get(`/api/plan/history/${old.id}`)).status, 401);
    assert.equal((await t.api.get('/api/plan/history/not-an-id', { cookies: acct.cookies })).status, 404);
  });
  it('expired active plans can be read, but every item mutation is refused', async () => {
    planClock.now = () => new Date('2026-11-16T08:00:00Z');
    const acct = await t.register();
    const plan = (await create(acct, form({ weeks: 1 }))).body.data.plan;
    planClock.now = () => new Date('2026-11-23T08:00:00Z');
    assert.equal((await getPlan(acct)).body.data.finished, true);
    assert.equal((await t.api.get(`/api/plan/history/${plan.id}`, { cookies: acct.cookies })).status, 200);
    assert.equal((await t.api.get('/api/plan/history', { cookies: acct.cookies })).body.data.plans.length, 1);
    const path = `/api/plan/items/${plan.items[0].id}`;
    for (const [method, url, body] of [
      ['patch', path, { done: true }], ['patch', `${path}/star`, {}], ['del', path, {}],
      ['post', '/api/plan/items', { title: 'Extra', plannedMinutes: 10, day: plan.startDate }],
      ['post', `${path}/result`, { result: 'alone' }], ['post', `${path}/review`, { passed: true }],
      ['post', `${path}/skip`, {}], ['post', `${path}/unskip`, {}],
    ]) assert.equal((await t.api[method](url, { cookies: acct.cookies, body })).status, 409, url);
    assert.deepEqual((await getPlan(acct)).body.data.plan.items, plan.items);
  });
});
const delPlan = (acct) => t.api.del('/api/plan', { cookies: acct.cookies });
const changePreview = (acct, body) => t.api.post('/api/plan/changes/preview', { cookies: acct.cookies, body });
const changeApply = (acct, body) => t.api.post('/api/plan/changes/apply', { cookies: acct.cookies, body });
const addDays = (n) => ymdOf(dayNumber(todayIst()) + n);
const L = 'https://leetcode.com/problems/';

describe('POST /api/plan/preview (public)', () => {
  it('the public builder choices match the generator without exposing problems or private plans', async () => {
    const countBefore = await Plan.countDocuments();
    const response = await t.api.get('/api/plan/options');
    assert.equal(response.status, 200);
    const options = response.body.data;
    const data = require('../src/modules/plan/planData').getPlanData();
    assert.equal(options.sheets.length, Object.keys(data.sheets).length);
    assert.equal(options.roadmaps.length, data.roadmapCatalog.length);
    assert.deepEqual(options.subjects.map((s) => s.id), Object.keys(data.notes));
    for (const sheet of options.sheets) {
      assert.ok(sheet.title);
      assert.deepEqual(sheet.topics.map((t) => t.id), data.sheets[sheet.slug].topics.map((t) => t.id));
      assert.ok(sheet.topics.every((t) => Object.keys(t).sort().join(',') === 'id,title'));
    }
    assert.ok(options.roadmaps.find((r) => r.slug === 'dsa').topics.length > 0);
    assert.ok(!JSON.stringify(options).includes('plannedMinutes'));
    assert.equal(await Plan.countDocuments(), countBefore);
  });
  it('works without login and gives the numbers and week 1 only, writing nothing', async () => {
    const before = await Plan.countDocuments();
    // A Sunday rest day legitimately leaves the first calendar week empty.
    const res = await preview(form({ restDay: null }));
    assert.equal(res.status, 200);
    const d = res.body.data;
    assert.deepEqual(Object.keys(d).sort(), ['coverage', 'deadline', 'earlyDays', 'finishDate', 'notices', 'pace', 'saveEligibility', 'startDate', 'usesSavedProgress', 'week1']);
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
    assert.equal(res.body.data.plan, null);
    assert.equal(res.body.data.today, null);
    assert.equal(res.body.data.finished, false);
    assert.deepEqual(res.body.data.pausedPlans, []);
    assert.equal(res.body.data.calendar.today, todayIst());
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

describe('my pace (phase D1): the plan keeps it and it can be changed with a preview', () => {
  const slowerForm = form({ weeks: 6, pace: 'slower' });
  const firstProblem = (plan) => plan.items.find((i) => i.type === 'dsa' && !i.part);
  it('a plan made at a slower pace stores it, shows it, and plans longer minutes for the same problem', async () => {
    const standard = await t.register();
    const std = (await create(standard, form({ weeks: 6 }))).body.data.plan;
    assert.equal(std.pace, 'standard', 'no pace means standard');
    const acct = await t.register();
    const res = await create(acct, slowerForm);
    assert.equal(res.status, 201, JSON.stringify(res.body));
    const plan = res.body.data.plan;
    assert.equal(plan.pace, 'slower');
    assert.equal((await Plan.findOne({ user: acct.id }).lean()).pace, 'slower');
    assert.equal((await getPlan(acct)).body.data.plan.pace, 'slower');
    const a = firstProblem(std);
    const b = plan.items.find((i) => i.link === a.link && !i.part);
    assert.ok(a && b);
    assert.equal(b.plannedMinutes, Math.round(a.plannedMinutes * 1.4));
  });
  it('refuses a pace that does not exist, in the preview, the save and a change', async () => {
    const acct = await t.register();
    assert.equal((await preview(form({ pace: 'turbo' }))).status, 422);
    assert.equal((await create(acct, form({ pace: 'turbo' }))).status, 422);
    await create(acct, form({ weeks: 6 }));
    assert.equal((await changePreview(acct, { type: 'pace', pace: 'turbo' })).status, 422);
    assert.equal((await changePreview(acct, { type: 'pace' })).status, 422, 'a pace change needs a pace');
    assert.equal((await changePreview(acct, { type: 'rebuild', pace: 'faster' })).status, 422, 'the pace is changed through a pace change only');
    assert.equal((await changePreview(acct, { type: 'hours', weekdayHours: 2, weekendHours: 2, pace: 'faster' })).status, 422);
  });
  it('the public preview reports the pace and the coverage groups', async () => {
    const res = await preview(form({ weeks: 4, pace: 'faster' }));
    assert.equal(res.status, 200);
    assert.equal(res.body.data.pace, 'faster');
    assert.ok(res.body.data.coverage.byGroup.length > 0 && res.body.data.coverage.byGroup.every((g) => ['dsa', 'notes'].includes(g.kind)));
  });
  it('a pace change is previewed, saves nothing until applied, keeps done work, and later changes keep the new pace', async () => {
    const acct = await t.register();
    const made = (await create(acct, form({ weeks: 6 }))).body.data.plan;
    const doneItem = firstProblem(made);
    assert.equal((await t.api.post(`/api/plan/items/${doneItem.id}/result`, { cookies: acct.cookies, body: { result: 'alone' } })).status, 200);
    planClock.now = () => new Date(`${addDays(3)}T06:00:00Z`);
    const before = await Plan.findOne({ user: acct.id }).lean();
    const pv = await changePreview(acct, { type: 'pace', pace: 'slower' });
    assert.equal(pv.status, 200, JSON.stringify(pv.body));
    assert.equal(pv.body.data.diff.checksum.length, 16);
    assert.deepEqual(await Plan.findOne({ user: acct.id }).lean(), before, 'a preview writes nothing');
    assert.equal((await changeApply(acct, { type: 'rebuild', checksum: pv.body.data.diff.checksum })).status, 409, 'the checksum belongs to the pace change');
    const applied = await changeApply(acct, { type: 'pace', pace: 'slower', checksum: pv.body.data.diff.checksum });
    assert.equal(applied.status, 200, JSON.stringify(applied.body));
    const doc = await Plan.findOne({ user: acct.id }).lean();
    assert.equal(doc.pace, 'slower');
    const kept = doc.items.find((i) => String(i._id) === doneItem.id);
    assert.ok(kept.doneAt && kept.plannedMinutes === doneItem.plannedMinutes, 'done work stays exactly as it was');
    const futureProblem = doc.items.find((i) => i.type === 'dsa' && !i.doneAt && !i.part && i.day >= addDays(3));
    const original = before.items.find((i) => i.link === futureProblem.link && !i.part);
    if (original) assert.equal(futureProblem.plannedMinutes, Math.round(original.plannedMinutes * 1.4));
    const hours = await changePreview(acct, { type: 'hours', weekdayHours: 3, weekendHours: 4 });
    assert.equal(hours.status, 200);
    assert.equal((await changeApply(acct, { type: 'hours', weekdayHours: 3, weekendHours: 4, checksum: hours.body.data.diff.checksum })).status, 200);
    assert.equal((await Plan.findOne({ user: acct.id }).lean()).pace, 'slower', 'a change of hours keeps the pace');
    const rebuild = await changePreview(acct, { type: 'rebuild' });
    assert.equal((await changeApply(acct, { type: 'rebuild', checksum: rebuild.body.data.diff.checksum })).status, 200);
    assert.equal((await Plan.findOne({ user: acct.id }).lean()).pace, 'slower', 'a rebuild keeps the pace');
  });
  it('another user cannot change the pace of a plan that is not theirs, and a user with no plan gets a clean refusal', async () => {
    const owner = await t.register();
    await create(owner, form({ weeks: 6 }));
    const other = await t.register();
    assert.equal((await changePreview(other, { type: 'pace', pace: 'faster' })).status, 404);
    assert.equal((await Plan.findOne({ user: owner.id }).lean()).pace, 'standard');
  });
});

describe('review fixes: no empty plan, pace on report plans, substitutes at the plan pace', () => {
  it('a plan with no task that fits is refused (422) and nothing is saved; a normal plan still saves', async () => {
    const acct = await t.register();
    const tight = form({ weeks: 1, weekdayHours: 0, weekendHours: 0.5, restDay: 6, subjects: [], sheetSlug: 'neetcode-150' }); // only Saturday, 21 minutes of room
    const res = await create(acct, tight);
    assert.equal(res.status, 422, JSON.stringify(res.body));
    assert.match(res.body.message, /No task fits/);
    assert.equal(await Plan.countDocuments({ user: acct.id }), 0);
    assert.equal((await create(acct, form({ weeks: 4 }))).status, 201);
  });
  it('a plan made from a report says so, and a pace change on it is refused cleanly', async () => {
    const acct = await t.register();
    const normal = (await create(acct, form({ weeks: 6 }))).body.data.plan;
    assert.equal(normal.fromReport, false);
    await t.api.del('/api/plan', { cookies: acct.cookies });
    const report = await importReport(acct);
    const preview = (await importPreview(acct, report)).body.data;
    assert.equal((await importApply(acct, report, preview)).status, 200);
    assert.equal((await getPlan(acct)).body.data.plan.fromReport, true);
    const before = await Plan.findOne({ user: acct.id }).lean();
    const res = await changePreview(acct, { type: 'pace', pace: 'faster' });
    assert.equal(res.status, 422, JSON.stringify(res.body));
    assert.match(res.body.message, /pace does not apply/);
    assert.deepEqual(await Plan.findOne({ user: acct.id }).lean(), before);
  });
  it('substitute problems are estimated at the plan pace', async () => {
    const BASE = { Basic: 30, Easy: 40, Medium: 70, Hard: 120 };
    for (const [pace, factor] of [['faster', 0.6], ['slower', 1.4]]) {
      const acct = await t.register();
      const made = (await create(acct, form({ goalType: 'placements', sheetSlug: 'blind-75', weeks: 1, restDay: null, subjects: [], pace }))).body.data.plan;
      const original = made.items.find((entry) => entry.type === 'dsa');
      const options = (await t.api.get(`/api/plan/items/${original.id}/substitutes`, { cookies: acct.cookies })).body.data.substitutes;
      assert.ok(options.length > 0);
      for (const option of options) assert.equal(option.plannedMinutes, Math.round(BASE[option.difficulty] * factor), `${pace}: ${option.title}`);
      const choice = options[0];
      const reply = await t.api.post(`/api/plan/items/${original.id}/substitute`, { cookies: acct.cookies, body: { sheetSlug: choice.sheetSlug, link: choice.link, checksum: choice.checksum } });
      assert.equal(reply.status, 200);
      assert.equal(reply.body.data.plan.items.find((entry) => entry.replacesKey === original.key).plannedMinutes, choice.plannedMinutes);
    }
  });
});
