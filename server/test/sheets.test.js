const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

let Progress, DSASheet;
const toggle = (acct, link, slug = 'blind-75') => t.api.post(`/api/sheets/${slug}/progress`, { cookies: acct.cookies, body: { problemLink: link } });
const progressDoc = (acct, slug = 'blind-75') => Progress.findOne({ user: acct.id, sheetSlug: slug });
const solvedLinks = async (acct, slug) => (await progressDoc(acct, slug)).solvedProblems.map((e) => e.link);

describe('DSA sheets and per-user progress', () => {
  before(async () => {
    await t.start();
    ({ Progress, DSASheet } = t.getModels());
    await t.seedSheets();
    await DSASheet.create({ name: 'Odd Links', slug: 'odd-links', description: 'd', topics: [{ id: 'odd', title: 'Odd', problems: [
      { title: 'Dollar and quotes', link: 'https://x.example.com/p?a=$b&c="q"', difficulty: 'Easy', tags: [] },
      { title: 'Plain', link: 'https://x.example.com/plain', difficulty: 'Easy', tags: [] },
    ] }] });
  });
  after(() => t.stop());

  describe('GET /api/sheets (public list)', () => {
    it('lists every sheet with name, slug, a unique-link problem count, a difficulty label and up to 4 tags', async () => {
      const res = await t.api.get('/api/sheets');
      assert.equal(res.status, 200);
      const blind = res.body.data.find((s) => s.slug === 'blind-75');
      assert.equal(blind.name, 'Blind 75');
      assert.equal(blind.totalProblems, 3);                       // 4 entries, but one link repeats -> 3 unique
      assert.equal(blind.difficulty, 'Beginner → Intermediate');  // Easy + Medium
      assert.deepEqual(blind.tags, ['array', 'hashmap', 'extra', 'string']);
      const other = res.body.data.find((s) => s.slug === 'other-sheet');
      assert.equal(other.difficulty, 'Advanced');                 // only Hard
      assert.deepEqual(other.tags, []);
    });
    it('is public (no login needed) and does not leak the full problem lists', async () => {
      const res = await t.api.get('/api/sheets');
      assert.equal(res.status, 200);
      assert.ok(!('topics' in res.body.data[0]));
    });
  });

  describe('GET /api/sheets/:slug', () => {
    it('returns the whole sheet with topics and problems, without internal fields', async () => {
      const res = await t.api.get('/api/sheets/blind-75');
      assert.equal(res.status, 200);
      assert.equal(res.body.data.topics.length, 2);
      assert.equal(res.body.data.topics[0].problems[0].title, 'Two Sum');
      assert.ok(!('__v' in res.body.data));
    });
    it('404 for a sheet that does not exist', async () => {
      const res = await t.api.get('/api/sheets/nope');
      assert.equal(res.status, 404);
      assert.equal(res.body.message, 'DSA Sheet not found');
    });
  });

  describe('GET /api/sheets/:slug/progress (read-only)', () => {
    it('401 when not logged in', async () => {
      assert.equal((await t.api.get('/api/sheets/blind-75/progress')).status, 401);
    });
    it('returns an empty list for a user who has not solved anything, and WRITES NOTHING', async () => {
      const acct = await t.register();
      const before = await Progress.countDocuments();
      const res = await t.api.get('/api/sheets/blind-75/progress', { cookies: acct.cookies });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.deepEqual(res.body.data.solvedProblems, []);
      assert.equal(await Progress.countDocuments(), before);
    });
    it('404 for a sheet that does not exist, and creates no junk record', async () => {
      const acct = await t.register();
      const before = await Progress.countDocuments();
      const res = await t.api.get('/api/sheets/does-not-exist/progress', { cookies: acct.cookies });
      assert.equal(res.status, 404);
      assert.equal(await Progress.countDocuments(), before);
    });
    it('accepts the slug in any letter case without creating a second record', async () => {
      const acct = await t.register();
      assert.equal((await t.api.get('/api/sheets/BLIND-75/progress', { cookies: acct.cookies })).status, 200);
      assert.equal(await Progress.countDocuments({ user: acct.id }), 0);
    });
    it('returns what the user solved', async () => {
      const acct = await t.register();
      await toggle(acct, t.L('two-sum'));
      const res = await t.api.get('/api/sheets/blind-75/progress', { cookies: acct.cookies });
      assert.deepEqual(res.body.data.solvedProblems, [t.L('two-sum')]);
    });
  });

  describe('POST /api/sheets/:slug/progress (toggle)', () => {
    it('adds a problem, then removes it on the second click; response keeps the shape the client reads', async () => {
      const acct = await t.register();
      const add = await toggle(acct, t.L('two-sum'));
      assert.equal(add.status, 200);
      assert.deepEqual(add.body.data.solvedProblems, [t.L('two-sum')]);
      assert.deepEqual(Object.keys(add.body.data).sort(), ['_id', 'createdAt', 'sheetSlug', 'solvedProblems', 'updatedAt', 'user']);
      const remove = await toggle(acct, t.L('two-sum'));
      assert.deepEqual(remove.body.data.solvedProblems, []);
    });
    it('keeps createdAt fixed and moves updatedAt forward', async () => {
      const acct = await t.register();
      const a = (await toggle(acct, t.L('two-sum'))).body.data;
      await t.sleep(15);
      const b = (await toggle(acct, t.L('3sum'))).body.data;
      assert.equal(a.createdAt, b.createdAt);
      assert.ok(new Date(b.updatedAt) > new Date(a.updatedAt));
    });
    it('tracks each user separately', async () => {
      const a = await t.register(); const b = await t.register();
      await toggle(a, t.L('two-sum'));
      await toggle(b, t.L('3sum'));
      assert.deepEqual(await solvedLinks(a), [t.L('two-sum')]);
      assert.deepEqual(await solvedLinks(b), [t.L('3sum')]);
    });
    it('rejects a link that is NOT in this sheet (400) and stores nothing', async () => {
      const acct = await t.register();
      const res = await toggle(acct, t.L('not-in-this-sheet'));
      assert.equal(res.status, 400);
      assert.equal(res.body.message, 'This problem is not part of this sheet');
      assert.equal(await progressDoc(acct), null);
    });
    it('rejects a link that belongs to a DIFFERENT sheet (400)', async () => {
      const acct = await t.register();
      assert.equal((await toggle(acct, t.L('only-in-other'))).status, 400);
      assert.equal((await toggle(acct, t.L('only-in-other'), 'other-sheet')).status, 200); // but it is fine on its own sheet
    });
    it('404 for a sheet that does not exist, with no junk record', async () => {
      const acct = await t.register();
      const res = await toggle(acct, t.L('two-sum'), 'no-such-sheet');
      assert.equal(res.status, 404);
      assert.equal(await Progress.countDocuments({ user: acct.id }), 0);
    });
    it('stores the slug lower-case even if the request used capitals', async () => {
      const acct = await t.register();
      assert.equal((await toggle(acct, t.L('3sum'), 'BLIND-75')).status, 200);
      assert.deepEqual(await Progress.distinct('sheetSlug', { user: acct.id }), ['blind-75']);
    });
    it('lets the user un-tick a "stale" link that a later re-seed removed from the sheet', async () => {
      const acct = await t.register();
      await Progress.create({ user: acct.id, sheetSlug: 'blind-75', solvedProblems: [{ link: t.L('two-sum') }, { link: t.L('removed-from-sheet-later') }] });
      const res = await toggle(acct, t.L('removed-from-sheet-later'));
      assert.equal(res.status, 200);
      assert.deepEqual(await solvedLinks(acct), [t.L('two-sum')]);
    });
    it('can never hold more solved problems than the sheet has, and never duplicates', async () => {
      const acct = await t.register();
      for (const slug of ['two-sum', '3sum', 'valid-anagram']) await toggle(acct, t.L(slug));
      const solved = await solvedLinks(acct);
      assert.equal(solved.length, 3);
      assert.equal(new Set(solved).size, 3);
    });
    it('treats links containing $ and quotes as plain text (no database-operator surprises)', async () => {
      const acct = await t.register();
      const odd = 'https://x.example.com/p?a=$b&c="q"';
      const res = await toggle(acct, odd, 'odd-links');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body.data.solvedProblems, [odd]);
      assert.deepEqual((await toggle(acct, odd, 'odd-links')).body.data.solvedProblems, []);
    });

    it('validates the body (422)', async () => {
      const acct = await t.register();
      const post = (body) => t.api.post('/api/sheets/blind-75/progress', { cookies: acct.cookies, body });
      assert.equal((await post({})).body.message, 'Problem link is required');
      assert.equal((await post({ problemLink: 'notaurl' })).body.message, 'Problem link must be a valid URL');
      assert.equal((await post({ problemLink: { $ne: 1 } })).status, 422);        // object instead of text
      assert.equal((await post({ problemLink: ['a', 'b'] })).status, 422);
    });
    it('401 when not logged in', async () => {
      assert.equal((await t.api.post('/api/sheets/blind-75/progress', { body: { problemLink: t.L('two-sum') } })).status, 401);
    });
  });

  describe('double clicks and parallel tabs (atomic toggle)', () => {
    const fire = (acct, n, link = t.L('two-sum')) => Promise.all(Array.from({ length: n }, () => toggle(acct, link)));
    it('6 parallel FIRST-EVER toggles end at "not solved", one record, no errors', async () => {
      const acct = await t.register();
      const rs = await fire(acct, 6);
      assert.ok(rs.every((r) => r.status === 200), `statuses: ${rs.map((r) => r.status)}`);
      assert.equal(await Progress.countDocuments({ user: acct.id }), 1);
      assert.equal((await progressDoc(acct)).solvedProblems.length, 0);
    });
    it('an odd number of parallel toggles ends "solved", an even number "not solved"', async () => {
      const acct = await t.register();
      await fire(acct, 10); assert.equal((await progressDoc(acct)).solvedProblems.length, 0);
      await fire(acct, 7);  assert.equal((await progressDoc(acct)).solvedProblems.length, 1);
    });
    it('8 users x 21 parallel first-ever toggles: all succeed, one record each, each solved exactly once', async () => {
      const users = await Promise.all(Array.from({ length: 8 }, () => t.register()));
      const all = await Promise.all(users.map((u) => fire(u, 21)));
      assert.ok(all.flat().every((r) => r.status === 200));
      for (const u of users) {
        assert.equal(await Progress.countDocuments({ user: u.id }), 1);
        assert.equal((await progressDoc(u)).solvedProblems.length, 1);
      }
    });
  });
});
