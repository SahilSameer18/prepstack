// The Markdown loader for notes sections: a file becomes the same data the JS notes files hold, and every mistake in the
// format is reported with the file name. No database.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { parseSection, loadMarkdownSections, withMarkdownSections } = require('../src/data/notes/markdownSections');
const { checkNotesSubject } = require('../src/validators/notes.validators');

const OVERVIEW = [
  'A relational schema is in good shape when each fact is stored once. Interviewers ask about this to see whether you can spot redundancy and name the rule it breaks.',
  'After this section you can say what a key is, tell a super key from a candidate key, and explain in a few sentences how a foreign key keeps two tables consistent, with one small example for each of them.',
].join('\n\n');

const topic = (n) => `## Topic: Topic ${n}\n\n**Definition:** Definition ${n}.\n\n**Why:** Why ${n}.\n\n**Example:** Example ${n}.\n\n**Failure:** Failure ${n}.\n`;
const quizItem = (n) => `### Quiz question ${n}?\n\n- [ ] wrong a${n}\n- [x] right ${n}\n- [ ] wrong b${n}\n- [ ] wrong c${n}\n\nExplanation: because ${n}.\n`;

const valid = (over = {}) => `---
id: dbms-demo
title: Demo
lastChecked: 2026-11-10
next: dbms-sql
sheetTopics: blind-75:arrays-hashing, striver-sde:arrays-i
roadmapSteps: backend:database-design
---

## Overview

${OVERVIEW}

${[1, 2, 3, 4].map(topic).join('\n')}
## Questions

### What is a key?

A set of attributes that identifies a row.

### What is a foreign key?

A value that must match a key in another table.

### What is a super key?

Any set that identifies a row.

## Mistakes

- Thinking a primary key can be null.
- Thinking a unique key never holds NULL.

## Quiz

${[1, 2, 3, 4, 5].map(quizItem).join('\n')}
## Diagram

\`\`\`json
{ "kind": "flow", "caption": "The steps", "steps": [{ "label": "One" }, { "label": "Two" }] }
\`\`\`
`.replace(over.from ?? '\u0000', over.to ?? '');

const sectionOf = (text, file = 'dbms-demo.md') => parseSection(text, file);
const problems = (section) => checkNotesSubject('dbms', { subject: 'DBMS', sections: [section] });

describe('parseSection: a good file', () => {
  const s = sectionOf(valid());
  it('reads the header', () => {
    assert.equal(s.id, 'dbms-demo');
    assert.equal(s.title, 'Demo');
    assert.equal(s.lastChecked, '2026-11-10');
    assert.deepEqual(s.links, { sheetTopics: ['blind-75:arrays-hashing', 'striver-sde:arrays-i'], roadmapSteps: ['backend:database-design'], next: 'dbms-sql' });
  });
  it('reads the overview as paragraphs, topics with their four parts, questions, mistakes, quiz and diagram', () => {
    assert.equal(s.overview.length, 2);
    assert.equal(s.topics.length, 4);
    assert.deepEqual(s.topics[0], { name: 'Topic 1', definition: 'Definition 1.', why: 'Why 1.', example: 'Example 1.', failure: 'Failure 1.' });
    assert.deepEqual(s.questions[1], { question: 'What is a foreign key?', answer: 'A value that must match a key in another table.' });
    assert.deepEqual(s.mistakes, ['Thinking a primary key can be null.', 'Thinking a unique key never holds NULL.']);
    assert.equal(s.quiz.length, 5);
    assert.deepEqual(s.quiz[2], { question: 'Quiz question 3?', options: ['wrong a3', 'right 3', 'wrong b3', 'wrong c3'], answer: 1, explanation: 'because 3.' });
    assert.deepEqual(s.diagrams, [{ kind: 'flow', caption: 'The steps', steps: [{ label: 'One' }, { label: 'Two' }] }]);
  });
  it('passes the real notes validator, including the full template that lastChecked switches on', () => {
    assert.deepEqual(problems(s), []);
  });
  it('gives the same result for Windows line endings (CRLF)', () => {
    assert.deepEqual(sectionOf(valid().replace(/\n/g, '\r\n')), s);
  });
  it('"next: none" or no next line means the last section', () => {
    assert.equal(sectionOf(valid().replace('next: dbms-sql', 'next: none')).links.next, null);
    assert.equal(sectionOf(valid().replace('next: dbms-sql\n', '')).links.next, null);
  });
  it('a draft without lastChecked has no lastChecked, so the strict template is not applied', () => {
    const draft = sectionOf(valid().replace('lastChecked: 2026-11-10\n', ''));
    assert.equal('lastChecked' in draft, false);
    assert.deepEqual(problems({ ...draft, topics: [] }), []);
  });
  it('a multi-line example keeps its lines, and code fence lines are dropped but the code stays', () => {
    const text = valid().replace('**Example:** Example 1.', '**Example:** Run this:\n```sql\nSELECT 1;\nSELECT 2;\n```\nThen look at the result.');
    assert.equal(sectionOf(text).topics[0].example, 'Run this:\nSELECT 1;\nSELECT 2;\nThen look at the result.');
  });
  it('a line that looks like a heading inside a code fence is not a heading', () => {
    const text = valid().replace('**Example:** Example 1.', '**Example:** x\n```\n## not a heading\n**Why:** not a field\n```');
    const s2 = sectionOf(text);
    assert.equal(s2.topics.length, 4);
    assert.match(s2.topics[0].example, /## not a heading/);
  });
  it('HTML comments are ignored', () => {
    const text = valid().replace('## Overview', '<!-- a note\nto the author -->\n## Overview');
    assert.deepEqual(sectionOf(text), s);
  });
  it('a mistake can continue on the next line', () => {
    const text = valid().replace('- Thinking a primary key can be null.', '- Thinking a primary key\n  can be null.');
    assert.equal(sectionOf(text).mistakes[0], 'Thinking a primary key can be null.');
  });
});

describe('parseSection: every mistake in the format is reported with the file name', () => {
  const bad = (text, pattern, file = 'dbms-demo.md') => assert.throws(() => parseSection(text, file), (e) => pattern.test(e.message) && e.message.startsWith(file), `expected ${pattern}`);

  it('no header, or a header that is not closed', () => {
    bad('## Overview\nx', /must start with a "---"/);
    bad('---\nid: dbms-demo\ntitle: x\n## Overview', /not closed/);
  });
  it('a header line that is not key: value', () => {
    bad(valid().replace('title: Demo', 'title Demo'), /must look like "key: value"/);
  });
  it('a missing id or title', () => {
    bad(valid().replace('id: dbms-demo\n', ''), /needs an id/);
    bad(valid().replace('title: Demo\n', ''), /needs a title/);
  });
  it('an id that is not the file name', () => {
    bad(valid(), /must equal the file name/, 'dbms-other.md');
  });
  it('an unknown heading', () => {
    bad(valid().replace('## Mistakes', '## Mistake list'), /unknown heading "## Mistake list"/);
  });
  it('text before the first heading', () => {
    bad(valid().replace('## Overview', 'stray text\n\n## Overview'), /text before the first "## " heading/);
  });
  it('an unknown or repeated topic field, and text before the first field', () => {
    bad(valid().replace('**Why:** Why 1.', '**Because:** Why 1.'), /unknown field "Because"/);
    bad(valid().replace('**Why:** Why 1.', '**Definition:** again'), /used twice/);
    bad(valid().replace('## Topic: Topic 1\n', '## Topic: Topic 1\nloose text\n'), /text before the first field/);
  });
  it('two Overview, Questions, Mistakes or Quiz blocks', () => {
    bad(valid() + '\n## Overview\n\nmore', /two "## Overview" blocks/);
    bad(valid() + '\n## Questions\n\n### q?\n\na', /two "## Questions" blocks/);
    bad(valid() + '\n## Mistakes\n\n- x', /two "## Mistakes" blocks/);
    bad(valid() + '\n## Quiz\n\n' + quizItem(9), /two "## Quiz" blocks/);
  });
  it('a quiz question with no [x] answer or with two', () => {
    bad(valid().replace('- [x] right 1', '- [ ] right 1'), /no \[x\] answer/);
    bad(valid().replace('- [ ] wrong a1', '- [x] wrong a1'), /more than one \[x\] answer/);
  });
  it('a stray line inside a quiz question', () => {
    bad(valid().replace('- [ ] wrong a1', 'wrong a1'), /unexpected line/);
  });
  it('a mistake that does not start with "- ", and questions that do not start with "### "', () => {
    bad(valid().replace('- Thinking a primary key can be null.', 'Thinking a primary key can be null.'), /must start with "- "/);
    bad(valid().replace('### What is a key?', 'What is a key?'), /must start with a "### " line/);
  });
  it('a diagram with no json block, or json that is broken', () => {
    bad(valid().replace(/```json[\s\S]*```/, 'a picture'), /needs a fenced ```json block/);
    bad(valid().replace('"kind": "flow",', '"kind": "flow" ,,'), /not valid JSON/);
  });
  it('error messages carry a line number for body mistakes', () => {
    assert.throws(() => parseSection(valid().replace('## Mistakes', '## Mistake list'), 'dbms-demo.md'), /dbms-demo\.md, line \d+:/);
  });
});

describe('the validator still catches what the loader leaves to it', () => {
  it('a topic with a missing part', () => {
    const s = sectionOf(valid().replace('**Failure:** Failure 1.', ''));
    assert.match(problems(s).join('\n'), /topic "how it fails"/);
  });
  it('an overview that is too short, a quiz that is not 5 questions, a duplicate option', () => {
    assert.match(problems(sectionOf(valid().replace(OVERVIEW, 'Too short.'))).join('\n'), /overview must be 60 to 120 words/);
    assert.match(problems(sectionOf(valid().replace(quizItem(5), ''))).join('\n'), /exactly 5 quiz questions/);
    assert.match(problems(sectionOf(valid().replace('wrong b1', 'wrong a1'))).join('\n'), /must be different from each other/);
  });
  it('a bad link format and a bad diagram', () => {
    assert.match(problems(sectionOf(valid().replace('sheetTopics: blind-75:arrays-hashing', 'sheetTopics: nonsense'))).join('\n'), /must look like "blind-75:graph"/);
    assert.match(problems(sectionOf(valid().replace('"steps": [{ "label": "One" }, { "label": "Two" }]', '"steps": [{ "label": "One" }]'))).join('\n'), /a flow needs 2 to 8 steps/);
  });
});

describe('loadMarkdownSections and withMarkdownSections', () => {
  let dir;
  before(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'notes-md-')); });
  after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const put = (name, text) => fs.writeFileSync(path.join(dir, name), text);
  const clear = () => fs.readdirSync(dir).forEach((f) => fs.rmSync(path.join(dir, f)));
  const legacy = { subject: 'DBMS', sections: [{ id: 'dbms-a', title: 'A', topics: [] }, { id: 'dbms-demo', title: 'Old demo', topics: [{ name: 'old' }] }, { id: 'dbms-c', title: 'C', topics: [] }] };

  it('a missing folder or an empty folder changes nothing', () => {
    assert.deepEqual(withMarkdownSections(legacy, path.join(dir, 'nope')), legacy);
    clear();
    assert.deepEqual(withMarkdownSections(legacy, dir), legacy);
  });
  it('a Markdown file replaces the legacy section with the same id, in the same place', () => {
    clear(); put('dbms-demo.md', valid());
    const out = withMarkdownSections(legacy, dir);
    assert.deepEqual(out.sections.map((s) => s.id), ['dbms-a', 'dbms-demo', 'dbms-c']);
    assert.equal(out.sections[1].title, 'Demo');
    assert.equal(out.sections[0], legacy.sections[0]);
    assert.equal(out.subject, 'DBMS');
  });
  it('a Markdown section that is not in the legacy list is added at the end', () => {
    clear(); put('dbms-new.md', valid().replace('id: dbms-demo', 'id: dbms-new'));
    assert.deepEqual(withMarkdownSections(legacy, dir).sections.map((s) => s.id), ['dbms-a', 'dbms-demo', 'dbms-c', 'dbms-new']);
  });
  it('files starting with "_" and files that are not .md are ignored', () => {
    clear(); put('_draft.md', 'this is not even valid'); put('notes.txt', 'x');
    assert.deepEqual(loadMarkdownSections(dir), []);
  });
  it('a broken file stops the load with its name in the message', () => {
    clear(); put('dbms-demo.md', valid().replace('## Mistakes', '## Oops'));
    assert.throws(() => loadMarkdownSections(dir), /dbms-demo\.md/);
  });
  it('the legacy data object is not changed', () => {
    clear(); put('dbms-demo.md', valid());
    const before2 = JSON.stringify(legacy);
    withMarkdownSections(legacy, dir);
    assert.equal(JSON.stringify(legacy), before2);
  });
});

describe('the real DBMS notes', () => {
  it('load through the loader with the same 10 sections while no Markdown file is published', () => {
    const dbms = require('../src/data/notes/dbms');
    const legacy = require('../src/data/notes/dbms.legacy');
    const mdDir = path.join(__dirname, '..', 'src', 'data', 'notes', 'dbms');
    const published = loadMarkdownSections(mdDir).map((s) => s.id);
    assert.equal(dbms.sections.length, legacy.sections.length + published.filter((id) => !legacy.sections.some((s) => s.id === id)).length);
    assert.deepEqual(checkNotesSubject('dbms', dbms), []);
  });
  it('the starter template parses (it is ignored by the loader because its name starts with "_")', () => {
    const file = path.join(__dirname, '..', 'src', 'data', 'notes', 'dbms', '_example.md');
    const s = parseSection(fs.readFileSync(file, 'utf8'), 'dbms-example.md');
    assert.equal(s.topics.length, 2);
    assert.equal(s.quiz[0].answer, 1);
    assert.equal(s.diagrams[0].kind, 'flow');
  });
});

describe('the draft sections in notes/dbms/drafts', () => {
  const draftsDir = path.join(__dirname, '..', 'src', 'data', 'notes', 'dbms', 'drafts');
  const files = fs.existsSync(draftsDir) ? fs.readdirSync(draftsDir).filter((f) => f.endsWith('.md')) : [];
  const legacy = require('../src/data/notes/dbms.legacy');
  const drafts = files.map((f) => parseSection(fs.readFileSync(path.join(draftsDir, f), 'utf8'), f));

  it('are not published: no draft has lastChecked, and none is loaded by the site', () => {
    for (const d of drafts) assert.equal('lastChecked' in d, false, `${d.id} has lastChecked: it must stay a draft until it is reviewed`);
    const published = require('../src/data/notes/dbms').sections;
    for (const d of drafts) assert.ok(!published.some((s) => s.id === d.id && s.topics.some((t) => t.definition)), `${d.id} is loaded by the site`);
  });
  it('each draft would pass the full template (checked with a lastChecked added), so publishing it later only needs the review', () => {
    for (const d of drafts) assert.deepEqual(checkNotesSubject('dbms', { subject: 'DBMS', sections: [{ ...d, lastChecked: '2026-11-10' }] }), [], d.id);
  });
  it('each draft replaces a section that exists, and points at a next section and roadmap step that exist', async () => {
    const { pathToFileURL } = require('node:url');
    const roadmapFile = path.join(__dirname, '..', '..', 'client', 'src', 'data', 'roadmaps.js');
    for (const d of drafts) assert.ok(legacy.sections.some((s) => s.id === d.id), `${d.id} is not a section of the DBMS notes`);
    const ids = new Set([...legacy.sections.map((s) => s.id), ...drafts.map((d) => d.id)]);
    for (const d of drafts) if (d.links.next) assert.ok(ids.has(d.links.next), `${d.id}: next section ${d.links.next} does not exist`);
    if (fs.existsSync(roadmapFile)) {
      const { roadmaps } = await import(pathToFileURL(roadmapFile).href);
      for (const d of drafts) for (const ref of d.links.roadmapSteps) {
        const [slug, step] = ref.split(':');
        assert.ok(roadmaps.find((r) => r.slug === slug)?.steps.some((s) => s.id === step), `${d.id}: roadmap step ${ref} does not exist`);
      }
    }
  });
  it('all ten DBMS sections have a draft', () => {
    for (const s of legacy.sections) assert.ok(drafts.some((d) => d.id === s.id), s.id + ' has no draft yet');
    assert.equal(drafts.length, legacy.sections.length);
  });
  it('the next links of the drafts follow the order of the DBMS sections, and the last one has none', () => {
    const order = legacy.sections.map((s) => s.id);
    for (const d of drafts) {
      const i = order.indexOf(d.id);
      assert.equal(d.links.next, order[i + 1] ?? null, d.id);
    }
  });
  it('no two drafts use the same title or the same quiz question', () => {
    const titles = drafts.map((d) => d.title);
    assert.equal(new Set(titles).size, titles.length);
    const questions = drafts.flatMap((d) => d.quiz.map((q) => q.question));
    assert.equal(new Set(questions).size, questions.length);
  });
});
