// Stable ids and the notes rules: every notes section and every DSA sheet topic has a permanent id, the notes data follows
// the rules in validators/notes.validators.js, and the numbers shown on the page (counts, reading time) are worked out from the data.
const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { checkNotesSubject, ID_PATTERN } = require('../src/validators/notes.validators');
const { countWords, readMinutes, sectionStats, subjectStats, WORDS_PER_MINUTE } = require('../src/utils/notesStats');

const SUBJECTS = ['os', 'dbms', 'cn', 'oops'];
const realData = (slug) => require(`../src/data/notes/${slug}.js`);
const words = (n) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ');

// A section that follows the whole template
const goodSection = (over = {}) => ({
  id: 'os-deadlocks',
  title: 'Deadlocks',
  lastChecked: '2026-11-09',
  overview: [words(40), words(40)],
  topics: Array.from({ length: 4 }, (_, i) => ({ name: `Topic ${i}`, definition: 'd', why: 'w', example: 'e', failure: 'f' })),
  questions: Array.from({ length: 3 }, (_, i) => ({ question: `Q${i}?`, answer: 'A.' })),
  mistakes: ['Mistake one', 'Mistake two'],
  quiz: Array.from({ length: 5 }, (_, i) => ({ question: `Quiz ${i}?`, options: ['a', 'b', 'c', 'd'], answer: 1, explanation: 'Because.' })),
  links: { sheetTopics: ['blind-75:graph'], roadmapSteps: [], next: 'os-memory-management' },
  ...over,
});
const check = (section, slug = 'os') => checkNotesSubject(slug, { subject: 'Operating Systems', sections: [section] });

describe('the real notes data', () => {
  for (const slug of SUBJECTS) {
    it(`${slug}: follows the rules, and every section has an id that starts with "${slug}-"`, () => {
      assert.deepEqual(checkNotesSubject(slug, realData(slug)), []);
    });
  }
  it('has 38 sections and no id is used twice, even across subjects', () => {
    const ids = SUBJECTS.flatMap((slug) => realData(slug).sections.map((s) => s.id));
    assert.equal(ids.length, 38);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.every((id) => ID_PATTERN.test(id)));
  });
  it('the sections the Analyzer catalog points at still exist under the same ids', () => {
    const ids = new Set(SUBJECTS.flatMap((slug) => realData(slug).sections.map((s) => s.id)));
    for (const id of ['os-deadlocks', 'os-cpu-scheduling', 'dbms-sql', 'dbms-keys-constraints', 'cn-osi-model', 'oops-solid-principles']) assert.ok(ids.has(id), id);
  });
});

describe('the DSA sheet topics', () => {
  it('every topic of the 5 sheets has an id, and the ids are unique within their sheet', () => {
    const sheets = t.sheetSeedData();
    assert.equal(sheets.length, 5);
    for (const sheet of sheets) {
      const ids = sheet.topics.map((topic) => topic.id);
      assert.ok(ids.length > 0, sheet.slug);
      assert.ok(ids.every((id) => typeof id === 'string' && ID_PATTERN.test(id)), `${sheet.slug} has a topic with no valid id`);
      assert.equal(new Set(ids).size, ids.length, `${sheet.slug} uses an id twice`);
    }
  });
});

describe('notes validator: the always-enforced shape', () => {
  it('accepts an old-format section that has only an id, a title and topics', () => {
    assert.deepEqual(check({ id: 'os-deadlocks', title: 'Deadlocks', topics: [{ name: 'x', concept: ['y'] }] }), []);
  });
  it('rejects a section without an id, with a badly written id, or with an id from another subject', () => {
    assert.match(check({ title: 'Deadlocks', topics: [] })[0], /id is required/);
    assert.match(check({ id: 'Os Deadlocks', title: 'Deadlocks', topics: [] })[0], /id is required/);
    assert.match(check({ id: 'dbms-deadlocks', title: 'Deadlocks', topics: [] })[0], /must start with "os-"/);
  });
  it('rejects an id used twice, a missing title and topics that are not a list', () => {
    const two = checkNotesSubject('os', { subject: 'OS', sections: [{ id: 'os-a', title: 'A', topics: [] }, { id: 'os-a', title: 'B', topics: [] }] });
    assert.match(two.join('\n'), /used twice/);
    assert.match(check({ id: 'os-a', topics: [] }).join('\n'), /title is required/);
    assert.match(check({ id: 'os-a', title: 'A', topics: 'nope' }).join('\n'), /topics must be a list/);
  });
  it('rejects a subject with no name or no sections', () => {
    assert.match(checkNotesSubject('os', { sections: [] }).join('\n'), /name is required/);
    assert.match(checkNotesSubject('os', { subject: 'OS', sections: [] }).join('\n'), /at least one section/);
  });
});

describe('notes validator: the full template, only for a section with lastChecked', () => {
  it('accepts a complete section', () => {
    assert.deepEqual(check(goodSection()), []);
  });
  it('does not hold a section without lastChecked to the template', () => {
    const { lastChecked, ...rest } = goodSection({ quiz: [] });
    assert.deepEqual(check(rest), []);
  });
  const rejects = (name, over, pattern) => it(`rejects: ${name}`, () => assert.match(check(goodSection(over)).join('\n'), pattern));
  rejects('lastChecked that is not written 2026-11-09', { lastChecked: '9 Nov 2026' }, /lastChecked must look like/);
  rejects('lastChecked that is not a real date', { lastChecked: '2026-02-30' }, /real date/);
  rejects('an overview under 60 words', { overview: [words(59)] }, /60 to 120 words/);
  rejects('an overview over 120 words', { overview: [words(121)] }, /60 to 120 words/);
  rejects('3 topics', { topics: goodSection().topics.slice(0, 3) }, /4 to 8 topics/);
  rejects('9 topics', { topics: Array.from({ length: 9 }, (_, i) => ({ name: `T${i}`, definition: 'd', why: 'w', example: 'e', failure: 'f' })) }, /4 to 8 topics/);
  rejects('a topic with no example', { topics: goodSection().topics.map((tp, i) => (i === 0 ? { ...tp, example: '' } : tp)) }, /topic example/);
  rejects('2 interview questions', { questions: goodSection().questions.slice(0, 2) }, /3 to 5 interview questions/);
  rejects('6 interview questions', { questions: Array.from({ length: 6 }, (_, i) => ({ question: `Q${i}`, answer: 'a' })) }, /3 to 5 interview questions/);
  rejects('1 common mistake', { mistakes: ['only one'] }, /2 to 3 common mistakes/);
  rejects('4 common mistakes', { mistakes: ['a', 'b', 'c', 'd'] }, /2 to 3 common mistakes/);
  rejects('4 quiz questions', { quiz: goodSection().quiz.slice(0, 4) }, /exactly 5 quiz questions/);
  rejects('a quiz question with 3 options', { quiz: goodSection().quiz.map((q, i) => (i === 0 ? { ...q, options: ['a', 'b', 'c'] } : q)) }, /exactly 4 options/);
  rejects('quiz options that repeat', { quiz: goodSection().quiz.map((q, i) => (i === 0 ? { ...q, options: ['a', 'a', 'c', 'd'] } : q)) }, /different from each other/);
  rejects('a quiz answer outside 0 to 3', { quiz: goodSection().quiz.map((q, i) => (i === 0 ? { ...q, answer: 4 } : q)) }, /answer must be 0 to 3/);
  rejects('a quiz question with no explanation', { quiz: goodSection().quiz.map((q, i) => (i === 0 ? { ...q, explanation: '' } : q)) }, /quiz explanation/);
  rejects('links to nothing', { links: { sheetTopics: [], roadmapSteps: [], next: null } }, /at least one sheet topic or roadmap step/);
  rejects('no links at all', { links: undefined }, /links/);
});

describe('notes numbers worked out from the data', () => {
  it('counts the words a reader sees and skips ids, dates and links', () => {
    const section = { id: 'os-a-b-c', title: 'Two words', lastChecked: '2026-11-09', links: { sheetTopics: ['a:b'] }, topics: [{ name: 'three small words', tips: ['one', 'two three'] }] };
    assert.equal(countWords(section), 2 + 3 + 3);
  });
  it('counts the text of interview answers (an answer is text there, a number only in the quiz)', () => {
    assert.equal(countWords({ questions: [{ question: 'Why?', answer: 'Because it is so.' }], quiz: [{ question: 'Pick', options: ['a'], answer: 2, explanation: 'ok' }] }), 1 + 4 + 1 + 1 + 1);
  });
  it('reading time is the word count over 200 a minute, rounded up, never under 1', () => {
    assert.equal(WORDS_PER_MINUTE, 200);
    assert.equal(readMinutes(0), 1);
    assert.equal(readMinutes(200), 1);
    assert.equal(readMinutes(201), 2);
    assert.equal(readMinutes(1000), 5);
    assert.equal(sectionStats({ topics: [{ name: words(450) }] }).readMinutes, 3);
  });
  it('a subject has section and topic counts, a reading time and the latest checked date', () => {
    const stats = subjectStats([
      { id: 'os-a', title: 'A', topics: [{ name: words(300) }, { name: 'x' }], lastChecked: '2026-11-01' },
      { id: 'os-b', title: 'B', topics: [{ name: words(300) }], lastChecked: '2026-11-09' },
      { id: 'os-c', title: 'C', topics: [] },
    ]);
    assert.deepEqual(stats, { sectionCount: 3, topicCount: 3, readMinutes: 4, lastChecked: '2026-11-09' });
    assert.equal(subjectStats([{ id: 'os-a', title: 'A', topics: [] }]).lastChecked, null);
  });
  it('the real subjects give sensible numbers (the Notes page no longer types them by hand)', () => {
    assert.deepEqual(SUBJECTS.map((slug) => subjectStats(realData(slug).sections).topicCount), [29, 17, 19, 19]);
  });
});

describe('the notes model', () => {
  before(() => t.start());
  after(() => t.stop());
  it('refuses to save a section that has no id', async () => {
    const { Notes } = t.getModels();
    await assert.rejects(() => Notes.create({ subject: 'OS', subjectSlug: 'os-test', sections: [{ title: 'No id' }] }), /id/);
  });
  it('refuses to save a DSA topic that has no id', async () => {
    const { DSASheet } = t.getModels();
    await assert.rejects(() => DSASheet.create({ name: 'X', slug: 'x', description: 'd', topics: [{ title: 'No id', problems: [] }] }), /id/);
  });
});
