// The benchmark's statistics (F1, intervals, baseline, held-out split) and the 12-pair starter set itself (scripts/samples/benchmark-starter.js).
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { scorePair, aggregate, perClass, wilson, keywordBaseline, selectPairs, CLASSES } = require('../scripts/lib/benchmark-metrics');
const starter = require('../scripts/samples/benchmark-starter');

const req = (text, status) => ({ text, status, evidence: '', skillKey: '' });
const pair = (requirements, resume = 'SKILLS: Java, Spring Boot. Built a REST API with Spring Boot.') => ({ id: 'p', resume, jobDescription: 'x', requirements });

describe('F1, precision and recall per status', () => {
  it('counts a requirement the report never mentioned as a miss for recall, but not for precision', () => {
    const p = pair([{ match: ['java'], expected: 'met' }, { match: ['spring'], expected: 'met' }, { match: ['docker'], expected: 'missing' }]);
    const row = scorePair(p, { requirements: [req('Java', 'met'), req('Docker', 'met')], score: 50 }); // spring never mentioned; docker wrongly met
    const c = perClass([row]);
    assert.equal(c.met.support, 2);
    assert.equal(c.met.precision, 0.5, '1 of the 2 "met" answers was right');
    assert.equal(c.met.recall, 0.5, '1 of the 2 labelled met requirements was found as met');
    assert.equal(c.met.f1, 0.5);
    assert.equal(c.missing.recall, 0, 'the one missing requirement was called met');
  });

  it('gives F1 0 when nothing is right, and null (not a crash) for a class that never appears', () => {
    const p = pair([{ match: ['java'], expected: 'missing' }]);
    const c = perClass([scorePair(p, { requirements: [req('Java', 'met')], score: 0 })]);
    assert.equal(c.missing.f1, 0);
    assert.equal(c.partial.f1, null);
    assert.equal(c.partial.support, 0);
  });
});

describe('Wilson interval', () => {
  it('matches known values and stays inside 0 to 1', () => {
    const [low, high] = wilson(8, 10);
    assert.ok(Math.abs(low - 0.49) < 0.01 && Math.abs(high - 0.943) < 0.01, `${low} ${high}`);
    assert.deepEqual(wilson(0, 5).map((v) => Math.round(v * 100)), [0, 43]);
    assert.equal(wilson(5, 5)[1], 1);
    assert.equal(wilson(0, 0), null);
  });
  it('is wider for fewer observations', () => {
    const wide = wilson(9, 10); const narrow = wilson(90, 100);
    assert.ok(wide[1] - wide[0] > narrow[1] - narrow[0]);
  });
});

describe('the keyword baseline', () => {
  it('says met for any word in the resume, even in a skills list, and misses synonyms (that is what the analyzer must beat)', () => {
    const p = { ...pair([{ match: ['aws'], expected: 'partial' }, { match: ['sql'], expected: 'met' }, { match: ['rest api'], expected: 'met' }], 'SKILLS: AWS, MySQL.\nBuilt REST APIs.'), id: 'b' };
    const r = keywordBaseline(p);
    assert.deepEqual(r.requirements.map((x) => x.status), ['met', 'missing', 'met'], 'AWS mentioned = met; MySQL is not the word SQL; "REST APIs" matches "rest api"');
  });
  it('does not find "java" inside "javascript"', () => {
    const r = keywordBaseline(pair([{ match: ['java'], expected: 'missing' }], 'SKILLS: JavaScript, React'));
    assert.equal(r.requirements[0].status, 'missing');
  });
});

describe('held-out split', () => {
  it('selects dev, holdout or all; a pair with no split counts as dev', () => {
    const pairs = [{ id: 'a', split: 'dev' }, { id: 'b', split: 'holdout' }, { id: 'c' }];
    assert.deepEqual(selectPairs(pairs, 'dev').map((p) => p.id), ['a', 'c']);
    assert.deepEqual(selectPairs(pairs, 'holdout').map((p) => p.id), ['b']);
    assert.equal(selectPairs(pairs, 'all').length, 3);
  });
});

describe('the 12-pair starter set', () => {
  it('has 3 strong, 3 partial, 3 weak and 3 tricky pairs, with unique ids and 4 held out (one of each kind)', () => {
    assert.equal(starter.length, 12);
    assert.equal(new Set(starter.map((p) => p.id)).size, 12);
    const count = (key, value) => starter.filter((p) => p[key] === value).length;
    for (const c of ['strong', 'partial', 'weak', 'tricky']) assert.equal(count('category', c), 3, c);
    assert.equal(count('split', 'holdout'), 4);
    for (const c of ['strong', 'partial', 'weak', 'tricky']) assert.equal(starter.filter((p) => p.split === 'holdout' && p.category === c).length, 1, 'holdout has one ' + c);
  });

  it('every label is well formed: a status, an importance, terms, and a score range from the labels', () => {
    for (const p of starter) {
      assert.ok(p.requirements.length >= 6, `${p.id} has ${p.requirements.length} labelled requirements`);
      for (const r of p.requirements) {
        assert.ok(CLASSES.includes(r.expected), `${p.id}: ${r.expected}`);
        assert.ok(['must', 'nice'].includes(r.importance), `${p.id}: importance`);
        assert.ok(Array.isArray(r.match) && r.match.length && r.match.every((t) => typeof t === 'string' && t.trim()), `${p.id}: terms`);
      }
      assert.ok(p.judgeScore[0] >= 0 && p.judgeScore[1] <= 100 && p.judgeScore[0] < p.judgeScore[1], `${p.id}: score range`);
    }
  });

  it('holds no contact details (no email, phone number or link) and no real names (every person is "Example")', () => {
    for (const p of starter) {
      assert.doesNotMatch(p.resume, /@|https?:\/\/|www\.|\b\d{10}\b|\+\d{2}/i, `${p.id}: contact details`);
      assert.match(p.resume.split('\n')[0], /Example/, `${p.id}: name`);
    }
  });

  it('is not trivially solved by keywords: the baseline is wrong on some requirements, never on all, and it fails the "skills list only" pair', () => {
    const rows = starter.map((p) => scorePair(p, keywordBaseline(p)));
    const m = aggregate(rows);
    assert.ok(m.statusAccuracy < 0.95 && m.statusAccuracy > 0.5, `baseline accuracy ${m.statusAccuracy}`);
    assert.equal(m.classes.partial.recall, 0, 'the baseline can never say "partial"');
    const trap = rows.find((r) => r.id === 'aws-skills-list-only');
    assert.equal(trap.statusCorrect, 0, 'every requirement in that pair is only a word in a skills list');
  });

  it('is labelled as draft until a second person reviews it', () => {
    assert.ok(starter.every((p) => /draft/.test(p.labelStatus)));
  });
});
