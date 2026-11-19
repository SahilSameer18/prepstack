// Scoring for the Role Analyzer benchmark (docs/research/ANALYZER_BENCHMARK.md). Pure functions: no AI, no database.
//
// A benchmark pair is: { id, resume, jobDescription, days, judgeScore: [low, high], requirements: [{ match: [terms], expected: 'met'|'partial'|'missing' }] }
// The labels come from people, not from this code. A report is { requirements: [{ text, skillKey, status, evidence }], score, aiProvider }.
const { verifyEvidence, normalise } = require('../../src/modules/analyzer/analyzer.service');

const has = (text, term) => ` ${normalise(text)} `.includes(` ${normalise(term)} `);

/** The report requirement that talks about a labelled requirement (by any of its terms), or null. */
const findRequirement = (report, label) => report.requirements.find((r) => label.match.some((t) => has(r.text, t) || has(r.skillKey || '', t))) || null;

/** One report against one labelled pair. */
function scorePair(pair, report) {
  let found = 0; let statusChecked = 0; let statusCorrect = 0; let falseGaps = 0; let falseReassurance = 0;
  const statuses = {};
  for (const label of pair.requirements) {
    const req = findRequirement(report, label);
    statuses[label.match[0]] = req ? req.status : null;
    if (!req) continue;
    found += 1; statusChecked += 1;
    if (req.status === label.expected) statusCorrect += 1;
    if (label.expected === 'met' && req.status === 'missing') falseGaps += 1; // tells the student to study something they already show
    if (label.expected === 'missing' && req.status === 'met') falseReassurance += 1; // tells the student they are fine when they are not
  }
  const withEvidence = report.requirements.filter((r) => r.status !== 'missing');
  const verified = withEvidence.filter((r) => verifyEvidence(pair.resume, r.evidence) !== 'none').length;
  const [low, high] = pair.judgeScore || [null, null];
  return {
    id: pair.id, provider: report.aiProvider || null, score: report.score, statuses,
    labelled: pair.requirements.length, found, statusChecked, statusCorrect, falseGaps, falseReassurance,
    evidenceChecked: withEvidence.length, evidenceVerified: verified,
    scoreInBand: low == null ? null : report.score >= low && report.score <= high,
    scoreError: low == null ? null : Math.abs(report.score - (low + high) / 2),
  };
}

const ratio = (a, b) => (b ? a / b : null);
const sum = (rows, key) => rows.reduce((total, r) => total + (r[key] || 0), 0);
const sd = (values) => { if (values.length < 2) return 0; const m = values.reduce((a, b) => a + b, 0) / values.length; return Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length); };

/** All runs together, plus how much repeated runs of the same pair disagree. */
function aggregate(rows) {
  const banded = rows.filter((r) => r.scoreInBand !== null);
  const byPair = {};
  for (const r of rows) (byPair[r.id] ||= []).push(r);
  const scoreSd = Object.values(byPair).map((runs) => sd(runs.map((r) => r.score)));
  let flips = 0; let comparable = 0;
  for (const runs of Object.values(byPair)) {
    if (runs.length < 2) continue;
    for (const key of Object.keys(runs[0].statuses)) {
      const seen = runs.map((r) => r.statuses[key]);
      if (seen.every((v) => v === null)) continue; // never found in any run: not a status question
      comparable += 1;
      if (new Set(seen).size > 1) flips += 1;
    }
  }
  return {
    runs: rows.length, pairs: Object.keys(byPair).length,
    requirementRecall: ratio(sum(rows, 'found'), sum(rows, 'labelled')),
    statusAccuracy: ratio(sum(rows, 'statusCorrect'), sum(rows, 'statusChecked')),
    falseGapRate: ratio(sum(rows, 'falseGaps'), sum(rows, 'statusChecked')),
    falseReassuranceRate: ratio(sum(rows, 'falseReassurance'), sum(rows, 'statusChecked')),
    evidenceVerifiedRate: ratio(sum(rows, 'evidenceVerified'), sum(rows, 'evidenceChecked')),
    scoreInBandRate: ratio(banded.filter((r) => r.scoreInBand).length, banded.length),
    meanScoreError: banded.length ? sum(banded, 'scoreError') / banded.length : null,
    meanScoreSdAcrossRuns: scoreSd.length ? scoreSd.reduce((a, b) => a + b, 0) / scoreSd.length : null,
    statusFlipRate: ratio(flips, comparable),
  };
}

/** Rows grouped by the provider that answered, to see whether the models disagree. */
const byProvider = (rows) => Object.fromEntries(Object.entries(rows.reduce((groups, r) => { (groups[r.provider || 'unknown'] ||= []).push(r); return groups; }, {})).map(([k, v]) => [k, aggregate(v)]));

module.exports = { scorePair, aggregate, byProvider, findRequirement };
