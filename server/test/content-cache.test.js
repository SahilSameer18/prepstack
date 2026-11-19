// Phase 4 through HTTP: the public sheet and notes reads, the dashboard's sheet list and the My plan preview come from the cache after
// the first request (MongoDB / the generator are asked once), carry cache headers, keep working when Redis is down, and never cache
// errors, other people's data or anything that is not a plain slug.
const t = require('./helpers/setup');
const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { FakeRedis } = require('./helpers/fake-redis');
const redisConfig = require('../src/shared/config/redis');
const gen = require('../src/services/planGenerator');

const PUBLIC = 'public, max-age=300, stale-while-revalidate=600';
let DSASheet; let Notes;
const counts = {};
const spy = (model, name, label) => {
  const original = model[name];
  model[name] = function spied(...args) { counts[label] = (counts[label] || 0) + 1; return original.apply(this, args); };
  return () => { model[name] = original; };
};
const previewBody = (over = {}) => ({ goalType: 'placements', style: 'one-topic', weeks: 4, weekdayHours: 2, weekendHours: 3, restDay: null, sheetSlug: 'blind-75', subjects: ['os'], ...over });

describe('cached public reads', () => {
  const restores = [];
  let fake;
  before(async () => {
    await t.start();
    ({ DSASheet, Notes } = t.getModels());
    await t.seedSheets();
    await Notes.create([{ subject: 'Operating Systems', subjectSlug: 'os', sections: [{ id: 'os-processes', title: 'Processes', overview: ['What a process is'], topics: [{ concept: 'PCB', name: 'PCB', definition: 'd', why: 'w', example: 'e', failure: 'f' }], questions: [], mistakes: [], quiz: [], links: { sheetTopics: [], roadmapSteps: [] } }] }]).catch(() => {});
    restores.push(spy(DSASheet, 'find', 'sheet.find'), spy(DSASheet, 'findOne', 'sheet.findOne'), spy(Notes, 'find', 'notes.find'), spy(Notes, 'findOne', 'notes.findOne'));
  });
  after(async () => { restores.forEach((restore) => restore()); redisConfig.setRedisForTests(null); await t.stop(); });
  beforeEach(() => { for (const k of Object.keys(counts)) delete counts[k]; fake = new FakeRedis(); redisConfig.setRedisForTests(fake); });
  afterEach(() => redisConfig.setRedisForTests(null));

  it('the sheet list is read from MongoDB once, then from the cache, with a public cache header', async () => {
    const first = await t.api.get('/api/sheets');
    const second = await t.api.get('/api/sheets');
    assert.equal(first.status, 200);
    assert.deepEqual(second.body, first.body);
    assert.equal(counts['sheet.find'], 1);
    assert.equal(second.headers['cache-control'], PUBLIC);
  });

  it('a sheet is cached by its slug; an unknown slug is a 404 that is cached briefly and carries no cache header', async () => {
    const a = await t.api.get('/api/sheets/blind-75');
    const b = await t.api.get('/api/sheets/blind-75');
    assert.equal(a.status, 200);
    assert.deepEqual(b.body, a.body);
    assert.equal(counts['sheet.findOne'], 1);
    assert.equal(b.headers['cache-control'], PUBLIC);
    const miss1 = await t.api.get('/api/sheets/no-such-sheet');
    const miss2 = await t.api.get('/api/sheets/no-such-sheet');
    assert.deepEqual([miss1.status, miss2.status], [404, 404]);
    assert.equal(counts['sheet.findOne'], 2, 'the unknown slug reached MongoDB once');
    assert.ok(!String(miss2.headers['cache-control'] || '').includes('public'));
  });

  it('a slug that is not a plain lowercase word (the database matches it ignoring case) is never cached, and keeps its old answer', async () => {
    const one = await t.api.get('/api/sheets/Blind-75');
    const two = await t.api.get('/api/sheets/Blind-75');
    assert.deepEqual([one.status, two.status], [200, 200]);
    assert.deepEqual(two.body, one.body);
    assert.equal(counts['sheet.findOne'], 2, 'each request reached MongoDB: nothing was cached under a made-up key');
  });

  it('the notes list and a subject are cached; an unknown subject is a cached 404', async () => {
    const list1 = await t.api.get('/api/notes');
    const list2 = await t.api.get('/api/notes');
    assert.equal(list1.status, 200);
    assert.deepEqual(list2.body, list1.body);
    assert.equal(counts['notes.find'], 1);
    assert.equal(list2.headers['cache-control'], PUBLIC);
    const os1 = await t.api.get('/api/notes/os');
    const os2 = await t.api.get('/api/notes/os');
    assert.equal(os1.status, 200);
    assert.deepEqual(os2.body, os1.body);
    assert.equal(os2.body.data.sections[0].readMinutes >= 0, true);
    assert.equal(counts['notes.findOne'], 1);
    assert.deepEqual([(await t.api.get('/api/notes/nope')).status, (await t.api.get('/api/notes/nope')).status], [404, 404]);
    assert.equal(counts['notes.findOne'], 2);
  });

  it("the dashboard's sheet definitions are shared by every user, while each user's progress stays their own", async () => {
    const a = await t.register();
    const b = await t.register();
    const link = (await DSASheet.findOne({ slug: 'blind-75' }).lean()).topics[0].problems[0].link;
    for (const key of Object.keys(counts)) delete counts[key];
    await t.api.post('/api/sheets/blind-75/progress', { cookies: a.cookies, body: { problemLink: link } });
    const da = await t.api.get('/api/user/dashboard-summary', { cookies: a.cookies });
    const db = await t.api.get('/api/user/dashboard-summary', { cookies: b.cookies });
    assert.equal(da.status, 200);
    assert.equal(da.body.data.stats.totalSolved, 1);
    assert.equal(db.body.data.stats.totalSolved, 0, "user b never sees user a's solves");
    assert.equal(counts['sheet.find'], 1, 'the sheet definitions were read once for both users');
  });

  it('the plan preview is generated once per input; another input, and an invalid input, are not served from it', async () => {
    const original = gen.previewPlan;
    let runs = 0;
    gen.previewPlan = (...args) => { runs += 1; return original(...args); };
    try {
      const body = previewBody();
      const first = await t.api.post('/api/plan/preview', { body });
      const second = await t.api.post('/api/plan/preview', { body });
      assert.equal(first.status, 200);
      assert.deepEqual(second.body, first.body);
      assert.equal(runs, 1);
      assert.equal((await t.api.post('/api/plan/preview', { body: previewBody({ weeks: 5 }) })).status, 200);
      assert.equal(runs, 2, 'a different input is generated');
      const bad = previewBody({ weeks: 500 });
      assert.equal((await t.api.post('/api/plan/preview', { body: bad })).status, 422);
      assert.equal((await t.api.post('/api/plan/preview', { body: bad })).status, 422);
      assert.equal([...fake.data.keys()].filter((k) => k.includes(':cache:preview:')).length, 2, 'only the two valid inputs were stored; the invalid one was not');
    } finally { gen.previewPlan = original; }
  });

  it('every cache key written has an expiry (the host evicts nothing)', async () => {
    await t.api.get('/api/sheets');
    await t.api.get('/api/sheets/blind-75');
    await t.api.get('/api/notes/os');
    await t.api.post('/api/plan/preview', { body: previewBody({ weeks: 6 }) });
    const keys = [...fake.data.keys()];
    assert.ok(keys.length >= 4);
    for (const key of keys) assert.ok((await fake.ttl(key)) > 0, `${key} has no expiry`);
    assert.ok(keys.every((key) => key.startsWith(redisConfig.redisKey('cache'))), 'all keys sit under the cache prefix');
  });

  it('with Redis down every read still answers from MongoDB, with the same body', async () => {
    const cachedAnswer = await t.api.get('/api/sheets/blind-75');
    redisConfig.setRedisForTests(null);
    for (const key of Object.keys(counts)) delete counts[key];
    const plain = await t.api.get('/api/sheets/blind-75');
    await t.api.get('/api/sheets/blind-75');
    assert.equal(plain.status, 200);
    assert.deepEqual(plain.body, cachedAnswer.body);
    assert.equal(counts['sheet.findOne'], 2, 'no cache: MongoDB answers each time');
    assert.equal((await t.api.get('/api/notes')).status, 200);
    assert.equal((await t.api.post('/api/plan/preview', { body: previewBody() })).status, 200);
  });
});
