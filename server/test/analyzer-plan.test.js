// Ticking the study plan of a Role Analyzer report, and the "today" card. Real app, real in-memory database, no AI involved:
// the reports are written straight into the database.
const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

let Report;
before(async () => {
  await t.start();
  Report = t.mongoose.model('InterviewReport');
  await t.seedSheets();
});
after(() => t.stop());

const makeReport = (user, over = {}) => Report.create({
  user, title: 'Backend Developer', jobDescription: 'x'.repeat(40), days: 3, score: 60,
  plan: [
    { day: 1, focus: 'Arrays', items: [{ ref: 'dsa:blind-75:arrays', task: 'Do five array problems' }, { ref: 'none', task: 'Read the notes' }] },
    { day: 2, focus: 'Docker', items: [{ ref: 'none', task: 'Write a Dockerfile' }] },
  ],
  ...over,
});
const tick = (acct, id, body) => t.api.patch(`/api/analyzer/${id}/plan`, { cookies: acct.cookies, body });
const read = async (id) => (await Report.findById(id)).plan;

describe('PATCH /api/analyzer/:id/plan', () => {
  it('ticks an item and records when', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    const before = Date.now();
    const res = await tick(acct, r._id, { day: 1, index: 1, done: true });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.done, true);
    const plan = await read(r._id);
    assert.equal(plan[0].items[1].done, true);
    assert.ok(plan[0].items[1].doneAt.getTime() >= before - 1000);
    // the other items are untouched
    assert.equal(plan[0].items[0].done, false);
    assert.equal(plan[1].items[0].done, false);
  });
  it('unticks an item and clears the time', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    await tick(acct, r._id, { day: 2, index: 0, done: true });
    const res = await tick(acct, r._id, { day: 2, index: 0, done: false });
    assert.equal(res.status, 200);
    const item = (await read(r._id))[1].items[0];
    assert.equal(item.done, false);
    assert.equal(item.doneAt ?? null, null);
  });
  it('sets the state, it does not flip it: sending "done" twice leaves it done', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    await tick(acct, r._id, { day: 1, index: 0, done: true });
    await tick(acct, r._id, { day: 1, index: 0, done: true });
    assert.equal((await read(r._id))[0].items[0].done, true);
  });
  it('answers with the day that is "today" after the change', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    const res = await tick(acct, r._id, { day: 1, index: 0, done: true });
    assert.equal(res.body.data.todayDay, 1); // the report was made just now, so today is day 1
  });
  it("cannot change someone else's report (404, nothing changed)", async () => {
    const owner = await t.register();
    const other = await t.register();
    const r = await makeReport(owner.id);
    const res = await tick(other, r._id, { day: 1, index: 0, done: true });
    assert.equal(res.status, 404);
    assert.equal((await read(r._id))[0].items[0].done, false);
  });
  it('a day or item that is not in the plan is 404', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    assert.equal((await tick(acct, r._id, { day: 9, index: 0, done: true })).status, 404);
    assert.equal((await tick(acct, r._id, { day: 1, index: 5, done: true })).status, 404);
    assert.equal((await tick(acct, r._id, { day: 2, index: 1, done: true })).status, 404); // day 2 has only one item
  });
  it('rejects a bad body (422) and a bad id (400)', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    for (const body of [{}, { day: 1, index: 0 }, { day: 0, index: 0, done: true }, { day: 1, index: -1, done: true }, { day: 1.5, index: 0, done: true }, { day: 1, index: 0, done: 'yes' }]) {
      assert.equal((await tick(acct, r._id, body)).status, 422, JSON.stringify(body));
    }
    assert.equal((await tick(acct, 'nope', { day: 1, index: 0, done: true })).status, 400);
  });
  it('needs a signed-in user (401)', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    assert.equal((await t.api.patch(`/api/analyzer/${r._id}/plan`, { body: { day: 1, index: 0, done: true } })).status, 401);
  });
  it('works on a report saved before ticks existed (items without a done field)', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    await Report.collection.updateOne({ _id: r._id }, { $unset: { 'plan.0.items.0.done': '' } });
    const res = await tick(acct, r._id, { day: 1, index: 0, done: true });
    assert.equal(res.status, 200);
    assert.equal((await read(r._id))[0].items[0].done, true);
  });
  it('is limited to 60 ticks a minute per user, and another user is not affected', async () => {
    const acct = await t.register();
    const other = await t.register();
    const r = await makeReport(acct.id);
    const o = await makeReport(other.id);
    let last;
    for (let i = 0; i < 61; i++) last = await tick(acct, r._id, { day: 1, index: 0, done: i % 2 === 0 });
    assert.equal(last.status, 429);
    assert.equal((await tick(other, o._id, { day: 1, index: 0, done: true })).status, 200);
  });
});

describe('the report carries todayDay', () => {
  it('GET /api/analyzer/:id has todayDay, and old items read as not done', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    const res = await t.api.get(`/api/analyzer/${r._id}`, { cookies: acct.cookies });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.report.todayDay, 1);
    assert.ok(res.body.data.report.plan.every((d) => d.items.every((i) => i.done === false)));
  });
  it('a report made 3 days ago, day 1 unfinished: today is the first unfinished day when past the plan', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    await Report.collection.updateOne({ _id: r._id }, { $set: { createdAt: new Date(Date.now() - 10 * 86400000) } });
    const res = await t.api.get(`/api/analyzer/${r._id}`, { cookies: acct.cookies });
    assert.equal(res.body.data.report.todayDay, 1);
  });
});

describe('GET /api/analyzer/today', () => {
  it('null when the user has no report', async () => {
    const acct = await t.register();
    const res = await t.api.get('/api/analyzer/today', { cookies: acct.cookies });
    assert.equal(res.status, 200);
    assert.equal(res.body.data, null);
  });
  it('null when the latest report has no plan', async () => {
    const acct = await t.register();
    await makeReport(acct.id, { plan: [] });
    assert.equal((await t.api.get('/api/analyzer/today', { cookies: acct.cookies })).body.data, null);
  });
  it("today's items with their position, progress over the whole plan, and readable titles", async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    await tick(acct, r._id, { day: 1, index: 1, done: true });
    const d = (await t.api.get('/api/analyzer/today', { cookies: acct.cookies })).body.data;
    assert.equal(String(d.reportId), String(r._id));
    assert.equal(d.day.day, 1);
    assert.equal(d.day.focus, 'Arrays');
    assert.deepEqual(d.day.items.map((i) => [i.index, i.task, i.done]), [[0, 'Do five array problems', false], [1, 'Read the notes', true]]);
    assert.deepEqual(d.progress, { done: 1, total: 3 });
    assert.equal(d.allDone, false);
    assert.equal(d.totalDays, 2);
    assert.ok('dsa:blind-75:arrays' in d.refTitles || Object.keys(d.refTitles).length === 0); // titles only for refs that exist
  });
  it('uses the LATEST report', async () => {
    const acct = await t.register();
    await makeReport(acct.id, { title: 'Old one', createdAt: new Date(Date.now() - 86400000) });
    const newer = await makeReport(acct.id, { title: 'New one' });
    const d = (await t.api.get('/api/analyzer/today', { cookies: acct.cookies })).body.data;
    assert.equal(String(d.reportId), String(newer._id));
    assert.equal(d.title, 'New one');
  });
  it('allDone when every item is ticked; the day is then null', async () => {
    const acct = await t.register();
    const r = await makeReport(acct.id);
    await Report.collection.updateOne({ _id: r._id }, { $set: { createdAt: new Date(Date.now() - 20 * 86400000) } });
    for (const [day, index] of [[1, 0], [1, 1], [2, 0]]) await tick(acct, r._id, { day, index, done: true });
    const d = (await t.api.get('/api/analyzer/today', { cookies: acct.cookies })).body.data;
    assert.equal(d.allDone, true);
    assert.equal(d.day, null);
    assert.deepEqual(d.progress, { done: 3, total: 3 });
  });
  it("never shows another user's plan", async () => {
    const a = await t.register();
    const b = await t.register();
    await makeReport(a.id);
    assert.equal((await t.api.get('/api/analyzer/today', { cookies: b.cookies })).body.data, null);
  });
  it('needs a signed-in user (401)', async () => {
    assert.equal((await t.api.get('/api/analyzer/today')).status, 401);
  });
});

describe('the AI never supplies done', () => {
  it('the AI service does not know about done / doneAt (they are the student\'s, never the model\'s)', () => {
    const src = require('node:fs').readFileSync(require.resolve('../src/services/analyzer.service'), 'utf8');
    assert.ok(!/doneAt|\bdone\b\s*:/.test(src), 'analyzer.service.js must not mention done');
  });
});
