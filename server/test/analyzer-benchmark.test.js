const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { scorePair, aggregate, byProvider } = require('../scripts/lib/benchmark-metrics');

const pair = {
  id: 'p1', judgeScore: [50, 70],
  resume: 'SKILLS: React, Node.js. Built a REST API with Express.js for a task app.',
  requirements: [
    { match: ['react'], expected: 'met' },
    { match: ['docker'], expected: 'missing' },
    { match: ['kubernetes'], expected: 'missing' },
    { match: ['graphql'], expected: 'partial' },
  ],
};
const req = (text, status, evidence = '') => ({ text, status, evidence, skillKey: '' });
const report = (requirements, score = 60, aiProvider = 'gemini:x') => ({ requirements, score, aiProvider });

describe('analyzer benchmark scoring', () => {
  it('counts found requirements, correct statuses, false gaps and false reassurance', () => {
    const r = scorePair(pair, report([
      req('React experience', 'missing'),       // label met: a false gap
      req('Docker for deployment', 'met', 'REST API with Express.js'), // label missing: false reassurance
      req('Kubernetes', 'missing'),             // correct
    ]));
    assert.equal(r.labelled, 4);
    assert.equal(r.found, 3, 'graphql is never mentioned');
    assert.equal(r.statusCorrect, 1);
    assert.equal(r.falseGaps, 1);
    assert.equal(r.falseReassurance, 1);
  });

  it('matches whole words only: "react" is not found inside "reactive"', () => {
    const r = scorePair(pair, report([req('Reactive programming', 'met')]));
    assert.equal(r.found, 0);
  });

  it('checks quotes against the resume and the score against the judges range', () => {
    const r = scorePair(pair, report([req('React', 'met', 'SKILLS: React, Node.js'), req('Docker', 'partial', 'ran Docker in production')], 80));
    assert.equal(r.evidenceChecked, 2);
    assert.equal(r.evidenceVerified, 1, 'the second quote is not in the resume');
    assert.equal(r.scoreInBand, false);
    assert.equal(r.scoreError, 20);
  });

  it('measures how much repeated runs and providers disagree', () => {
    const run = (status, score, provider) => scorePair(pair, report([req('React', status)], score, provider));
    const rows = [run('met', 60, 'a'), run('met', 70, 'a'), run('missing', 60, 'b')];
    const all = aggregate(rows);
    assert.equal(all.runs, 3);
    assert.equal(all.pairs, 1);
    assert.ok(all.meanScoreSdAcrossRuns > 0);
    assert.equal(all.statusFlipRate, 1, 'the one comparable requirement changed status between runs');
    const groups = byProvider(rows);
    assert.deepEqual(Object.keys(groups).sort(), ['a', 'b']);
    assert.equal(groups.a.statusAccuracy, 1);
    assert.equal(groups.b.statusAccuracy, 0);
  });

  it('handles an empty set without dividing by zero', () => {
    const empty = aggregate([]);
    assert.equal(empty.requirementRecall, null);
    assert.equal(empty.meanScoreError, null);
  });
});
