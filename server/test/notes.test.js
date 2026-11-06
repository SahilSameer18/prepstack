const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

describe('CS notes (public)', () => {
  before(async () => {
    await t.start();
    const { Notes } = t.getModels();
    await Notes.create([
      { subject: 'Operating Systems', subjectSlug: 'os', sections: [{ title: 'Processes', overview: ['What a process is'], topics: [{ concept: 'PCB', traps: ['x'] }, { anything: 'goes' }] }] },
      { subject: 'Databases', subjectSlug: 'dbms', sections: [] },
    ]);
  });
  after(() => t.stop());

  it('GET /api/notes lists every subject with just its name and slug, no login needed', async () => {
    const res = await t.api.get('/api/notes');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.map((n) => n.subjectSlug).sort(), ['dbms', 'os']);
    assert.deepEqual(Object.keys(res.body.data[0]).sort(), ['_id', 'subject', 'subjectSlug']);
    assert.ok(!JSON.stringify(res.body.data).includes('sections'));
  });

  it('GET /api/notes/:subject returns the full notes with their sections and free-form topics', async () => {
    const res = await t.api.get('/api/notes/os');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.subject, 'Operating Systems');
    assert.equal(res.body.data.sections[0].title, 'Processes');
    assert.deepEqual(res.body.data.sections[0].topics[0], { concept: 'PCB', traps: ['x'] });
    assert.ok(!('__v' in res.body.data));
  });

  it('finds a subject whatever the letter case of the URL', async () => {
    assert.equal((await t.api.get('/api/notes/OS')).status, 200);
    assert.equal((await t.api.get('/api/notes/Dbms')).status, 200);
  });

  it('404 with a clear message for an unknown subject', async () => {
    const res = await t.api.get('/api/notes/networks');
    assert.equal(res.status, 404);
    assert.equal(res.body.message, 'Notes not found for this subject');
  });

  it('a subject with no sections yet still opens', async () => {
    const res = await t.api.get('/api/notes/dbms');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.sections, []);
  });
});
