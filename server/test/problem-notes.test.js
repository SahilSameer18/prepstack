// Problem notes saved to the account: the API, the one-time import from the browser, and the rules that keep it safe.
const t = require('./helpers/setup');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

let ProblemNote;
before(async () => {
  await t.start();
  ProblemNote = t.mongoose.model('ProblemNote');
  await ProblemNote.init(); // build the unique index before the tests start
  await t.seedSheets(); // blind-75 has two-sum, 3sum, valid-anagram; other-sheet has only-in-other
});
after(() => t.stop());

const LINK = t.L('two-sum');
const note = (over = {}) => ({ problemLink: LINK, pattern: 'Two Pointers', timeComplexity: 'O(N)', spaceComplexity: 'O(1)', approach: 'Sort first, then move two pointers.', ...over });
const put = (acct, body) => t.api.put('/api/problem-notes', { cookies: acct.cookies, body });
const list = (acct) => t.api.get('/api/problem-notes', { cookies: acct.cookies });
const del = (acct, link) => t.api.del(`/api/problem-notes?problemLink=${encodeURIComponent(link)}`, { cookies: acct.cookies });
const imp = (acct, notes) => t.api.post('/api/problem-notes/import', { cookies: acct.cookies, body: { notes } });

describe('PUT /api/problem-notes', () => {
  it('saves a note, and saving again replaces it (one note per user per link)', async () => {
    const acct = await t.register();
    const res = await put(acct, note());
    assert.equal(res.status, 200);
    assert.equal(res.body.data.note.approach, 'Sort first, then move two pointers.');
    await put(acct, note({ approach: 'Use a hash map instead.', pattern: '' }));
    assert.equal(await ProblemNote.countDocuments({ user: acct.id }), 1);
    const n = (await list(acct)).body.data.notes[0];
    assert.equal(n.approach, 'Use a hash map instead.');
    assert.equal(n.pattern, '');
  });
  it('the database itself refuses a second note for the same user and link', async () => {
    const acct = await t.register();
    await ProblemNote.create({ user: acct.id, problemLink: LINK, approach: 'a' });
    await assert.rejects(ProblemNote.create({ user: acct.id, problemLink: LINK, approach: 'b' }), (e) => e.code === 11000);
  });
  it('the same link in two sheets is one note', async () => {
    const acct = await t.register();
    await put(acct, note({ problemLink: t.L('3sum') })); // 3sum is in two topics of blind-75
    await put(acct, note({ problemLink: t.L('3sum'), approach: 'second' }));
    assert.equal(await ProblemNote.countDocuments({ user: acct.id }), 1);
  });
  it('refuses a link that is not in any sheet (400), so nobody can fill the database with made-up links', async () => {
    const acct = await t.register();
    const res = await put(acct, note({ problemLink: 'https://example.com/not-a-problem' }));
    assert.equal(res.status, 400);
    assert.equal(await ProblemNote.countDocuments({ user: acct.id }), 0);
  });
  it('accepts a link that is only in another sheet', async () => {
    const acct = await t.register();
    assert.equal((await put(acct, note({ problemLink: t.L('only-in-other') }))).status, 200);
  });
  it('rejects a note longer than 5000 characters, accepts exactly 5000', async () => {
    const acct = await t.register();
    assert.equal((await put(acct, note({ approach: 'x'.repeat(5001) }))).status, 422);
    assert.equal((await put(acct, note({ approach: 'x'.repeat(5000) }))).status, 200);
  });
  it('rejects a pattern or complexity that is not one of the choices', async () => {
    const acct = await t.register();
    for (const over of [{ pattern: 'Magic' }, { timeComplexity: 'O(1.5)' }, { spaceComplexity: 'fast' }]) {
      assert.equal((await put(acct, note(over))).status, 422, JSON.stringify(over));
    }
  });
  it('rejects an empty note (422) and a bad link (422)', async () => {
    const acct = await t.register();
    assert.equal((await put(acct, note({ pattern: '', timeComplexity: '', spaceComplexity: '', approach: '   ' }))).status, 422);
    assert.equal((await put(acct, note({ problemLink: 'not a url' }))).status, 422);
    assert.equal((await put(acct, {})).status, 422);
  });
  it('needs a signed-in user (401)', async () => {
    assert.equal((await t.api.put('/api/problem-notes', { body: note() })).status, 401);
  });
  it('is limited to 120 saves a minute per user, and another user is not affected', async () => {
    const acct = await t.register(); const other = await t.register();
    let last;
    for (let i = 0; i < 121; i++) last = await put(acct, note({ approach: `v${i}` }));
    assert.equal(last.status, 429);
    assert.equal((await put(other, note())).status, 200);
  });
  it('two first saves at the same moment end with one note and no error', async () => {
    const acct = await t.register();
    const results = await Promise.all([put(acct, note({ problemLink: t.L('valid-anagram') })), put(acct, note({ problemLink: t.L('valid-anagram'), approach: 'other' }))]);
    assert.deepEqual(results.map((r) => r.status), [200, 200]);
    assert.equal(await ProblemNote.countDocuments({ user: acct.id }), 1);
  });
});

describe('GET and DELETE /api/problem-notes', () => {
  it("lists only the user's own notes, newest first, without internal fields", async () => {
    const a = await t.register(); const b = await t.register();
    await put(a, note()); await put(a, note({ problemLink: t.L('3sum') })); await put(b, note({ problemLink: t.L('valid-anagram') }));
    const notes = (await list(a)).body.data.notes;
    assert.deepEqual(notes.map((n) => n.problemLink), [t.L('3sum'), LINK]);
    assert.deepEqual(Object.keys(notes[0]).sort(), ['approach', 'pattern', 'problemLink', 'spaceComplexity', 'timeComplexity', 'updatedAt']);
  });
  it('an account with no notes gets an empty list', async () => {
    assert.deepEqual((await list(await t.register())).body.data.notes, []);
  });
  it('deletes a note; deleting again is fine; other users keep theirs', async () => {
    const a = await t.register(); const b = await t.register();
    await put(a, note()); await put(b, note());
    assert.equal((await del(a, LINK)).body.data.deleted, true);
    assert.equal((await del(a, LINK)).body.data.deleted, false);
    assert.equal(await ProblemNote.countDocuments({ user: b.id }), 1);
  });
  it('can delete a note for a link that is no longer in any sheet (after a re-seed)', async () => {
    const acct = await t.register();
    await ProblemNote.create({ user: acct.id, problemLink: 'https://old.example/gone', approach: 'x' });
    assert.equal((await del(acct, 'https://old.example/gone')).body.data.deleted, true);
  });
  it('a delete without a link is 400, and needs sign-in (401)', async () => {
    const acct = await t.register();
    assert.equal((await t.api.del('/api/problem-notes', { cookies: acct.cookies })).status, 400);
    assert.equal((await t.api.del('/api/problem-notes?problemLink=x')).status, 401);
  });
});

describe('POST /api/problem-notes/import (the one-time move from the browser)', () => {
  it('adds the notes and keeps their original time', async () => {
    const acct = await t.register();
    const when = Date.UTC(2026, 0, 5, 10);
    const res = await imp(acct, [note({ updatedAt: when }), note({ problemLink: t.L('3sum'), updatedAt: when })]);
    assert.deepEqual(res.body.data, { added: 2, kept: 0, skipped: 0 });
    const saved = await ProblemNote.findOne({ user: acct.id, problemLink: LINK });
    assert.equal(saved.updatedAt.getTime(), when);
    assert.equal(saved.createdAt.getTime(), when);
  });
  it('NEVER overwrites a note the account already has (newer or older)', async () => {
    const acct = await t.register();
    await put(acct, note({ approach: 'written on my laptop' }));
    const res = await imp(acct, [note({ approach: 'old browser note', updatedAt: 1 }), note({ approach: 'newer browser note', updatedAt: Date.now() + 100000 })]);
    assert.deepEqual(res.body.data, { added: 0, kept: 2, skipped: 0 });
    assert.equal((await ProblemNote.findOne({ user: acct.id })).approach, 'written on my laptop');
  });
  it('running it twice changes nothing the second time', async () => {
    const acct = await t.register();
    const notes = [note({ updatedAt: 5 })];
    await imp(acct, notes);
    assert.deepEqual((await imp(acct, notes)).body.data, { added: 0, kept: 1, skipped: 0 });
    assert.equal(await ProblemNote.countDocuments({ user: acct.id }), 1);
  });
  it('skips notes for links that are not in a sheet, and empty notes, and still adds the rest', async () => {
    const acct = await t.register();
    const res = await imp(acct, [note({ problemLink: 'https://example.com/made-up' }), note({ problemLink: t.L('3sum') }), note({ problemLink: t.L('valid-anagram'), pattern: '', timeComplexity: '', spaceComplexity: '', approach: '' })]);
    assert.deepEqual(res.body.data, { added: 1, kept: 0, skipped: 2 });
  });
  it('accepts 15 notes of 5000 characters inside the 100 KB request limit, rejects 16 (422) and none (422)', async () => {
    const acct = await t.register();
    const big = (i) => note({ approach: 'x'.repeat(5000), problemLink: i % 2 ? t.L('3sum') : LINK });
    assert.equal((await imp(acct, Array.from({ length: 15 }, (_, i) => big(i)))).status, 200);
    assert.equal((await imp(acct, Array.from({ length: 16 }, (_, i) => big(i)))).status, 422);
    assert.equal((await imp(acct, [])).status, 422);
  });
  it('rejects a bad choice inside the batch (422) and needs sign-in (401)', async () => {
    const acct = await t.register();
    assert.equal((await imp(acct, [note({ pattern: 'Magic' })])).status, 422);
    assert.equal((await t.api.post('/api/problem-notes/import', { body: { notes: [note()] } })).status, 401);
  });
  it("one user's import never touches another user's notes", async () => {
    const a = await t.register(); const b = await t.register();
    await put(b, note({ approach: 'b wrote this' }));
    await imp(a, [note({ approach: 'a imports' })]);
    assert.equal((await ProblemNote.findOne({ user: b.id })).approach, 'b wrote this');
    assert.equal((await ProblemNote.findOne({ user: a.id })).approach, 'a imports');
  });
});

describe('the choices match the drawer on the client', { skip: !fs.existsSync(path.join(t.SERVER_ROOT, '..', 'client', 'src', 'data', 'problemNoteOptions.js')) && 'client folder not present' }, () => {
  it('server and client lists are the same', async () => {
    const client = await import(pathToFileURL(path.join(t.SERVER_ROOT, '..', 'client', 'src', 'data', 'problemNoteOptions.js')).href);
    const server = require('../src/data/problemNoteOptions');
    for (const k of ['TIME_COMPLEXITIES', 'SPACE_COMPLEXITIES', 'COMMON_PATTERNS', 'APPROACH_MAX']) assert.deepEqual(client[k], server[k], k);
  });
});
