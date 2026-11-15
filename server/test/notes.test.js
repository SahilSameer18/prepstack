const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

describe('CS notes (public)', () => {
  before(async () => {
    await t.start();
    const { Notes } = t.getModels();
    await Notes.create([
      { subject: 'Operating Systems', subjectSlug: 'os', sections: [{ id: 'os-processes', title: 'Processes', overview: ['What a process is'], topics: [{ concept: 'PCB', traps: ['x'] }, { anything: 'goes' }] }] },
      { subject: 'Databases', subjectSlug: 'dbms', sections: [] },
    ]);
  });
  after(() => t.stop());

  it('publishing on a standalone database fails safely without clearing existing notes', async () => {
    const Notes = t.getModels().Notes;
    const { publishNotes } = require('../src/seed/notesSeed');
    const os = require('../src/data/notes/os');
    const before = await Notes.find({}).lean();
    await assert.rejects(publishNotes([{ subject: os.subject, subjectSlug: 'os', sections: os.sections }]), /Transaction numbers|replica set/i);
    assert.deepEqual(await Notes.find({}).lean(), before);
  });

  it('the seed command returns a failing exit code when publishing cannot connect', () => {
    const script = `
      const config = require.resolve('./src/seed/seedConfig');
      require.cache[config] = { id: config, filename: config, loaded: true, exports: async () => { throw new Error('simulated offline database'); } };
      require('./src/seed/notesSeed').seedNotes();
    `;
    const child = spawnSync(process.execPath, ['-e', script], { cwd: require('node:path').join(__dirname, '..'), encoding: 'utf8', timeout: 10000 });
    assert.equal(child.status, 1);
    assert.match(child.stderr, /simulated offline database/);
  });

  it('importing seed data setup does not read an environment file or change DNS', () => {
    const script = `
      require('dotenv').config = () => { throw new Error('unexpected environment read'); };
      require('node:dns').setServers = () => { throw new Error('unexpected DNS change'); };
      if (typeof require('./src/seed/seedConfig') !== 'function') process.exit(1);
    `;
    const child = spawnSync(process.execPath, ['-e', script], {
      cwd: require('node:path').join(__dirname, '..'), encoding: 'utf8', timeout: 10000,
    });
    assert.equal(child.status, 0, child.stderr);
  });

  it('GET /api/notes lists every subject with its name, slug and counts, but no sections, no login needed', async () => {
    const res = await t.api.get('/api/notes');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.map((n) => n.subjectSlug).sort(), ['dbms', 'os']);
    assert.deepEqual(Object.keys(res.body.data[0]).sort(), ['_id', 'lastChecked', 'readMinutes', 'sectionCount', 'subject', 'subjectSlug', 'topicCount']);
    assert.ok(!JSON.stringify(res.body.data).includes('"sections"'));
  });

  it('the counts, reading time and last checked date are worked out from the sections', async () => {
    const res = await t.api.get('/api/notes');
    const os = res.body.data.find((n) => n.subjectSlug === 'os');
    assert.deepEqual({ sectionCount: os.sectionCount, topicCount: os.topicCount, readMinutes: os.readMinutes, lastChecked: os.lastChecked }, { sectionCount: 1, topicCount: 2, readMinutes: 1, lastChecked: null });
    const dbms = res.body.data.find((n) => n.subjectSlug === 'dbms');
    assert.deepEqual({ sectionCount: dbms.sectionCount, topicCount: dbms.topicCount, lastChecked: dbms.lastChecked }, { sectionCount: 0, topicCount: 0, lastChecked: null });
  });

  it('GET /api/notes/:subject returns the full notes with their sections and free-form topics', async () => {
    const res = await t.api.get('/api/notes/os');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.subject, 'Operating Systems');
    assert.equal(res.body.data.sections[0].title, 'Processes');
    assert.deepEqual(res.body.data.sections[0].topics[0], { concept: 'PCB', traps: ['x'] });
    assert.ok(!('__v' in res.body.data));
  });

  it('every section keeps its permanent id and carries its reading time', async () => {
    const res = await t.api.get('/api/notes/os');
    assert.equal(res.body.data.sections[0].id, 'os-processes');
    assert.equal(res.body.data.sections[0].readMinutes, 1);
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
