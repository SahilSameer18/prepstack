// Every link between notes, roadmaps and DSA sheets must point at something that exists. A title or id that changes, or a typo,
// fails here instead of becoming a dead link on the site. No network and no database: it reads the data files.
const t = require('./helpers/setup');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { checkContentLinks } = require('../src/validators/contentLinks');

const CLIENT_DATA = path.join(t.SERVER_ROOT, '..', 'client', 'src', 'data');
const hasClient = fs.existsSync(path.join(CLIENT_DATA, 'roadmaps.js')); // the server may be tested alone, without the client folder
const SUBJECTS = ['os', 'dbms', 'cn', 'oops', 'hld'];

describe('links between notes, roadmaps and sheets', { skip: !hasClient && 'client folder not present' }, () => {
  it('every link in the real data resolves', async () => {
    const { roadmaps } = await import(pathToFileURL(path.join(CLIENT_DATA, 'roadmaps.js')).href);
    const notes = Object.fromEntries(SUBJECTS.map((s) => [s, require(`../src/data/notes/${s}.js`)]));
    assert.deepEqual(checkContentLinks({ notes, sheets: t.sheetSeedData(), roadmaps }), []);
  });
});

describe('checkContentLinks finds each kind of broken link', () => {
  const sheets = [{ slug: 'blind-75', topics: [{ id: 'graph' }, { id: 'stack' }] }];
  const roadmaps = [{ slug: 'backend', steps: [{ id: 'nodejs-fundamentals' }, { id: 'database-design' }] }];
  const section = (id, links) => ({ id, links });
  // dbms-sql really exists, but in another subject, so os-deadlocks may not use it as its next section
  const notesWith = (links, extra = []) => ({ os: { sections: [section('os-deadlocks', links), section('os-memory-management'), ...extra] }, dbms: { sections: [section('dbms-sql')] } });
  const ok = { sheetTopics: ['blind-75:graph'], roadmapSteps: ['backend:database-design'], next: 'os-memory-management' };
  const run = (links) => checkContentLinks({ notes: notesWith(links), sheets, roadmaps });

  it('is quiet when everything exists', () => {
    assert.deepEqual(run(ok), []);
  });
  it('is quiet for a section with no links yet', () => {
    assert.deepEqual(run(undefined), []);
  });
  it('finds a sheet topic that does not exist, in a sheet that does and in one that does not', () => {
    assert.match(run({ ...ok, sheetTopics: ['blind-75:nope'] }).join(), /sheet topic "blind-75:nope" does not exist/);
    assert.match(run({ ...ok, sheetTopics: ['no-sheet:graph'] }).join(), /does not exist/);
  });
  it('finds a roadmap step that does not exist (a changed or mistyped id)', () => {
    assert.match(run({ ...ok, roadmapSteps: ['backend:operating-systems'] }).join(), /roadmap step "backend:operating-systems" does not exist/);
    assert.match(run({ ...ok, roadmapSteps: ['frontend:database-design'] }).join(), /does not exist/);
  });
  it('finds a next section that is missing, in another subject, or the section itself', () => {
    assert.match(run({ ...ok, next: 'os-nope' }).join(), /next section "os-nope" is not in os/);
    assert.match(run({ ...ok, next: 'dbms-sql' }).join(), /is not in os/);
    assert.match(run({ ...ok, next: 'os-deadlocks' }).join(), /itself/);
  });
  it('tells you which section the broken link is in', () => {
    assert.match(run({ ...ok, sheetTopics: ['x:y'] })[0], /^notes os \/ os-deadlocks:/);
  });
  it('finds a roadmap practice link to a notes section or sheet topic that does not exist, and a bad kind', () => {
    const bad = (practice) => checkContentLinks({ notes: notesWith(ok), sheets, roadmaps: [{ slug: 'backend', steps: [{ id: 'database-design', practice }] }] });
    assert.deepEqual(bad([{ kind: 'notes', target: 'os:os-deadlocks' }, { kind: 'sheet', target: 'blind-75:stack' }]), []);
    assert.match(bad([{ kind: 'notes', target: 'os:os-nope' }]).join(), /notes link "os:os-nope" does not exist/);
    assert.match(bad([{ kind: 'sheet', target: 'blind-75:nope' }]).join(), /sheet link "blind-75:nope" does not exist/);
    assert.match(bad([{ kind: 'video', target: 'a:b' }]).join(), /not notes or sheet/);
    assert.match(bad([{ kind: 'notes', target: 'os:os-nope' }])[0], /^roadmap backend \/ database-design:/);
  });
  it('reports every broken link, not just the first', () => {
    assert.equal(run({ sheetTopics: ['a:b'], roadmapSteps: ['c:d'], next: 'os-nope' }).length, 3);
  });
});
