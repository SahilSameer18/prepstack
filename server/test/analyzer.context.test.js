// What the analyzer may point a student at. Two things are copied into the server because it cannot read the client's files
// once deployed (the roadmap list and the behavioral questions). These tests fail if the copies drift from the client, so a
// renamed roadmap or a changed question cannot silently break the report.
const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const ctxService = require('../src/services/analyzerContext.service');
const catalog = require('../src/data/skillCatalog.json');
const behavioral = require('../src/data/behavioralQuestions.json');

const CLIENT_DATA = path.join(t.SERVER_ROOT, '..', 'client', 'src', 'data');
const hasClient = fs.existsSync(path.join(CLIENT_DATA, 'roadmaps.js')); // the server may be tested alone, without the client folder
const fromClient = (file) => import(pathToFileURL(path.join(CLIENT_DATA, file)).href);

describe('copies of client data stay in sync', { skip: !hasClient && 'client folder not present' }, () => {
  it('the roadmap list matches client/src/data/roadmaps.js', async () => {
    const { roadmaps } = await fromClient('roadmaps.js');
    assert.deepEqual([...ctxService.ROADMAP_SLUGS].sort(), roadmaps.map((r) => r.slug).sort());
  });
  it('the roadmap names used in the advice labels cover exactly the same roadmaps', async () => {
    const { roadmaps } = await fromClient('roadmaps.js');
    assert.deepEqual(Object.keys(require('../src/services/skills.service').ROADMAP_TITLES).sort(), roadmaps.map((r) => r.slug).sort());
  });
  it('the behavioral questions match client/src/data/behavioralQuestions.js (same ids, same text)', async () => {
    const { behavioralQuestions } = await fromClient('behavioralQuestions.js');
    assert.deepEqual(behavioral, behavioralQuestions.map((q) => ({ id: q.id, question: q.question })));
  });
});

describe('the skill catalog', () => {
  it('has at least the 94 original skills, with unique names and a list of lower-case aliases', () => {
    assert.ok(catalog.length >= 94);
    assert.equal(new Set(catalog.map((s) => s.name)).size, catalog.length);
    for (const s of catalog) {
      assert.ok(s.name.trim() && Array.isArray(s.aliases) && s.aliases.length > 0, s.name);
      assert.ok(s.aliases.every((a) => a === a.toLowerCase().trim() && a.length >= 2), `${s.name}: aliases must be lower-case`);
    }
  });
  it('lists the names the analyzer relies on', () => {
    for (const n of ['React', 'Node.js', 'Docker', 'TypeScript', 'SQL', 'Kubernetes', 'AWS', 'Unit Testing']) assert.ok(ctxService.skillNames.includes(n), n);
  });
  it('the behavioral bank has unique numeric ids and non-empty questions', () => {
    assert.ok(behavioral.length >= 20);
    assert.equal(new Set(behavioral.map((q) => q.id)).size, behavioral.length);
    assert.ok(behavioral.every((q) => Number.isInteger(q.id) && q.question.trim().length > 5));
  });
});

describe('buildContext: built from what PrepStack really contains', () => {
  before(async () => { await t.start(); await t.seedSheets(); });
  after(() => t.stop());

  it('lists the Blind 75 topics from the database, and the six roadmaps', async () => {
    const ctx = await ctxService.buildContext();
    assert.deepEqual(ctx.dsaRefs, ['dsa:blind-75:arrays', 'dsa:blind-75:strings']);
    assert.deepEqual([ctx.titles['dsa:blind-75:arrays'], ctx.titles['dsa:blind-75:strings']], ['Arrays', 'Strings']);
    for (const slug of ctxService.ROADMAP_SLUGS) assert.ok(ctx.refs.includes(`roadmap:${slug}`));
    assert.equal(ctx.skillNames.length, catalog.length);
    assert.equal(ctx.behavioral.length, behavioral.length);
  });
  it('picks up CS notes sections from the database (and nothing when there are none)', async () => {
    const { Notes } = t.getModels();
    assert.ok(!(await ctxService.buildContext()).refs.some((r) => r.startsWith('notes:')));
    await Notes.create({ subject: 'Operating Systems', subjectSlug: 'os', sections: [{ id: 'os-deadlocks', title: 'Deadlocks' }, { id: 'os-scheduling', title: 'Scheduling' }] });
    const ctx = await ctxService.buildContext();
    assert.ok(ctx.refs.includes('notes:os:os-deadlocks') && ctx.refs.includes('notes:os:os-scheduling'));
    assert.deepEqual([ctx.titles['notes:os:os-deadlocks'], ctx.titles['notes:os:os-scheduling']], ['Deadlocks', 'Scheduling']);
  });
  it('a renamed topic keeps its ref (the id) and shows the new title', async () => {
    const { DSASheet } = t.getModels();
    await DSASheet.updateOne({ slug: 'blind-75' }, { $set: { 'topics.0.title': 'Hashing Basics' } });
    const ctx = await ctxService.buildContext();
    assert.ok(ctx.refs.includes('dsa:blind-75:arrays'));
    assert.equal(ctx.titles['dsa:blind-75:arrays'], 'Hashing Basics');
  });
  it('has no duplicate links', async () => {
    const ctx = await ctxService.buildContext();
    assert.equal(new Set(ctx.refs).size, ctx.refs.length);
  });
  it('does not fail when the Blind 75 sheet is not seeded (it just has no coding topics)', async () => {
    const { DSASheet } = t.getModels();
    await DSASheet.deleteMany({});
    const ctx = await ctxService.buildContext();
    assert.deepEqual(ctx.dsaRefs, []);
    assert.ok(ctx.refs.length >= ctxService.ROADMAP_SLUGS.length);
  });
});
