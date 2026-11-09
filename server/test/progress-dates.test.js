// Progress dates (B1): when each problem was ticked, the one-time migration from plain links, last solved per sheet,
// and the streak counted in IST days.
const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { istDayNumber, currentStreak } = require('../src/utils/istDay');
const { migrateSolvedAt } = require('../scripts/migrate-solved-at');

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const IST_OFFSET = 5.5 * HOUR;
const mid = (id) => new t.mongoose.Types.ObjectId(id);
const toggle = (acct, link, slug = 'blind-75') => t.api.post(`/api/sheets/${slug}/progress`, { cookies: acct.cookies, body: { problemLink: link } });
const dashboard = async (acct) => (await t.api.get('/api/user/dashboard-summary', { cookies: acct.cookies })).body.data;
// a time on a given IST day (0 = today in IST, -1 = yesterday...) at the given IST hour
const istTime = (daysAgo, hour = 12) => new Date((istDayNumber(new Date()) + daysAgo) * DAY - IST_OFFSET + hour * HOUR);

describe('IST day and streak maths', () => {
  const at = (iso) => new Date(iso);
  it('23:59 and 00:01 IST are different days (IST midnight is 18:30 UTC)', () => {
    assert.notEqual(istDayNumber(at('2026-11-09T18:29:00Z')), istDayNumber(at('2026-11-09T18:31:00Z')));
    assert.equal(istDayNumber(at('2026-11-09T18:31:00Z')) - istDayNumber(at('2026-11-09T18:29:00Z')), 1);
  });
  it('two times on the same IST day are one day, even when UTC shows two different dates', () => {
    assert.equal(istDayNumber(at('2026-11-09T18:31:00Z')), istDayNumber(at('2026-11-10T10:00:00Z')));
  });
  it('counts consecutive days ending today', () => {
    const now = at('2026-11-10T06:00:00Z');
    assert.equal(currentStreak([at('2026-11-10T01:00:00Z'), at('2026-11-09T05:00:00Z'), at('2026-11-08T05:00:00Z')], now), 3);
  });
  it('stays alive when only yesterday has a solve, and ends after a missed day', () => {
    const now = at('2026-11-10T06:00:00Z');
    assert.equal(currentStreak([at('2026-11-09T05:00:00Z'), at('2026-11-08T05:00:00Z')], now), 2);
    assert.equal(currentStreak([at('2026-11-08T05:00:00Z'), at('2026-11-07T05:00:00Z')], now), 0);
  });
  it('a gap day breaks the run (older days do not count)', () => {
    const now = at('2026-11-10T06:00:00Z');
    assert.equal(currentStreak([at('2026-11-10T01:00:00Z'), at('2026-11-08T05:00:00Z'), at('2026-11-07T05:00:00Z')], now), 1);
  });
  it('several solves on one day count once, and entries without a date are ignored', () => {
    const now = at('2026-11-10T06:00:00Z');
    assert.equal(currentStreak([at('2026-11-10T01:00:00Z'), at('2026-11-10T02:00:00Z'), null, undefined], now), 1);
    assert.equal(currentStreak([null, null], now), 0);
  });
});

describe('progress dates in the API', () => {
  let Progress;
  before(async () => {
    await t.start();
    ({ Progress } = t.getModels());
    await t.seedSheets();
  });
  after(() => t.stop());

  it('ticking stores the time, and a new tick after an untick gets a new time', async () => {
    const acct = await t.register();
    const before = Date.now();
    await toggle(acct, t.L('two-sum'));
    const first = (await Progress.findOne({ user: acct.id })).solvedProblems[0];
    assert.ok(first.solvedAt.getTime() >= before - 1000 && first.solvedAt.getTime() <= Date.now() + 1000);
    await toggle(acct, t.L('two-sum')); // untick
    assert.equal((await Progress.findOne({ user: acct.id })).solvedProblems.length, 0);
    await t.sleep(20);
    await toggle(acct, t.L('two-sum')); // tick again
    const second = (await Progress.findOne({ user: acct.id })).solvedProblems[0];
    assert.ok(second.solvedAt > first.solvedAt);
  });

  it('the API still sends solvedProblems as plain links (the client does not see the dates)', async () => {
    const acct = await t.register();
    await toggle(acct, t.L('two-sum'));
    const res = await t.api.get('/api/sheets/blind-75/progress', { cookies: acct.cookies });
    assert.deepEqual(res.body.data.solvedProblems, [t.L('two-sum')]);
  });

  it('the dashboard shows the streak and the last solved time of each sheet', async () => {
    const acct = await t.register();
    await Progress.collection.insertOne({
      user: mid(acct.id), sheetSlug: 'blind-75',
      solvedProblems: [
        { link: t.L('two-sum'), solvedAt: istTime(0) },
        { link: t.L('3sum'), solvedAt: istTime(-1) },
        { link: t.L('valid-anagram'), solvedAt: istTime(-2) },
      ],
    });
    const dash = await dashboard(acct);
    assert.equal(dash.stats.streak, 3);
    const blind = dash.dsaSheets.find((s) => s.sheet.slug === 'blind-75');
    assert.equal(new Date(blind.lastSolvedAt).getTime(), istTime(0).getTime());
    assert.equal(dash.dsaSheets.find((s) => s.sheet.slug === 'other-sheet').lastSolvedAt, null);
  });

  it('a streak spans sheets, and a missed day ends it', async () => {
    const acct = await t.register();
    await Progress.collection.insertMany([
      { user: mid(acct.id), sheetSlug: 'blind-75', solvedProblems: [{ link: t.L('two-sum'), solvedAt: istTime(0) }, { link: t.L('3sum'), solvedAt: istTime(-3) }] },
      { user: mid(acct.id), sheetSlug: 'other-sheet', solvedProblems: [{ link: t.L('only-in-other'), solvedAt: istTime(-1) }] },
    ]);
    assert.equal((await dashboard(acct)).stats.streak, 2); // today and yesterday; the day 3 days ago is cut off by the gap
  });

  it('migrated ticks without a date never count towards a streak or last solved, but still count as solved', async () => {
    const acct = await t.register();
    await Progress.collection.insertOne({
      user: mid(acct.id), sheetSlug: 'blind-75',
      solvedProblems: [{ link: t.L('two-sum'), solvedAt: null }, { link: t.L('3sum'), solvedAt: null }],
    });
    const dash = await dashboard(acct);
    assert.equal(dash.stats.totalSolved, 2);
    assert.equal(dash.stats.streak, 0);
    assert.equal(dash.dsaSheets.find((s) => s.sheet.slug === 'blind-75').lastSolvedAt, null);
  });

  it('a link ticked twice in the stored data is one problem and one solve date', async () => {
    const acct = await t.register();
    await Progress.collection.insertOne({
      user: mid(acct.id), sheetSlug: 'blind-75',
      solvedProblems: [{ link: t.L('two-sum'), solvedAt: istTime(0) }, { link: t.L('two-sum'), solvedAt: istTime(0) }],
    });
    const dash = await dashboard(acct);
    assert.equal(dash.stats.totalSolved, 1);
    assert.equal(dash.stats.streak, 1);
  });

  it('a user with no progress has a streak of 0', async () => {
    const acct = await t.register();
    assert.equal((await dashboard(acct)).stats.streak, 0);
  });

  it('one user\'s solves never count towards another user\'s streak', async () => {
    const a = await t.register(); const b = await t.register();
    await toggle(a, t.L('two-sum'));
    assert.equal((await dashboard(a)).stats.streak, 1);
    assert.equal((await dashboard(b)).stats.streak, 0);
  });
});

describe('migration from plain links to { link, solvedAt }', () => {
  let Progress, collection;
  before(async () => {
    await t.start();
    ({ Progress } = t.getModels());
    collection = Progress.collection;
    await t.seedSheets();
  });
  after(() => t.stop());

  const raw = (userId, solvedProblems, sheetSlug = 'blind-75') => ({ user: mid(userId), sheetSlug, solvedProblems });

  it('turns every string into { link, solvedAt: null } and keeps the order', async () => {
    const acct = await t.register();
    await collection.insertOne(raw(acct.id, [t.L('two-sum'), t.L('3sum')]));
    const result = await migrateSolvedAt(collection);
    assert.deepEqual(result, { records: 1, entries: 2 });
    const doc = await collection.findOne({ user: mid(acct.id) });
    assert.deepEqual(doc.solvedProblems, [{ link: t.L('two-sum'), solvedAt: null }, { link: t.L('3sum'), solvedAt: null }]);
  });

  it('is safe to run twice: the second run changes nothing', async () => {
    const acct = await t.register();
    await collection.insertOne(raw(acct.id, [t.L('two-sum')]));
    await migrateSolvedAt(collection);
    const after1 = await collection.findOne({ user: mid(acct.id) });
    const second = await migrateSolvedAt(collection);
    assert.deepEqual(second, { records: 0, entries: 0 });
    assert.deepEqual(await collection.findOne({ user: mid(acct.id) }), after1);
  });

  it('leaves entries that already have a date untouched, even next to old strings', async () => {
    const acct = await t.register();
    const when = new Date('2026-11-01T10:00:00Z');
    await collection.insertOne(raw(acct.id, [{ link: t.L('two-sum'), solvedAt: when }, t.L('3sum')]));
    await migrateSolvedAt(collection);
    const doc = await collection.findOne({ user: mid(acct.id) });
    assert.deepEqual(doc.solvedProblems, [{ link: t.L('two-sum'), solvedAt: when }, { link: t.L('3sum'), solvedAt: null }]);
  });

  it('dry run reports the numbers and changes nothing', async () => {
    const acct = await t.register();
    await collection.insertOne(raw(acct.id, [t.L('two-sum'), t.L('3sum')]));
    const result = await migrateSolvedAt(collection, { dryRun: true });
    assert.ok(result.records >= 1 && result.entries >= 2);
    const doc = await collection.findOne({ user: mid(acct.id) });
    assert.deepEqual(doc.solvedProblems, [t.L('two-sum'), t.L('3sum')]);
  });

  it('does not touch an empty list, a record of another user, or updatedAt', async () => {
    const empty = await t.register(); const other = await t.register();
    const stamp = new Date('2026-10-01T00:00:00Z');
    await collection.insertOne({ ...raw(empty.id, []), updatedAt: stamp });
    await collection.insertOne({ ...raw(other.id, [t.L('two-sum')]), updatedAt: stamp });
    await migrateSolvedAt(collection);
    assert.deepEqual((await collection.findOne({ user: mid(empty.id) })).solvedProblems, []);
    assert.deepEqual((await collection.findOne({ user: mid(other.id) })).updatedAt, stamp);
  });

  it('after migration the app reads the old ticks as solved and the toggle still works on them', async () => {
    const acct = await t.register();
    await collection.insertOne(raw(acct.id, [t.L('two-sum'), t.L('3sum')]));
    await migrateSolvedAt(collection);
    assert.equal((await dashboard(acct)).stats.totalSolved, 2);
    const res = await toggle(acct, t.L('two-sum')); // untick an old, migrated tick
    assert.deepEqual(res.body.data.solvedProblems, [t.L('3sum')]);
    assert.equal((await dashboard(acct)).stats.totalSolved, 1);
  });
});
