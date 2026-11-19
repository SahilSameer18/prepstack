// Scoring for the Role Analyzer benchmark (docs/research/ANALYZER_BENCHMARK.md). Pure functions: no AI, no database.
//
// A benchmark pair is: { id, split: 'dev'|'holdout', resume, jobDescription, days, judgeScore?: [low, high],
//                        requirements: [{ match: [terms], expected: 'met'|'partial'|'missing', importance?: 'must'|'nice' }] }
// The labels come from people, not from this code. A report is { requirements: [{ text, skillKey, status, evidence }], score, aiProvider }.
const { verifyEvidence, normalise, computeScore } = require('../../src/modules/analyzer/analyzer.service');

const CLASSES = ['met', 'partial', 'missing'];
const has = (text, term) => ` ${normalise(text)} `.includes(` ${normalise(term)} `);

/** The report requirement that talks about a labelled requirement (by any of its terms), or null. */
const findRequirement = (report, label) => report.requirements.find((r) => label.match.some((t) => has(r.text, t) || has(r.skillKey || '', t))) || null;

/** A baseline with no AI: a requirement is "met" if the resume contains the job's own wording (the FIRST term of the label) as a whole word, with an optional plural s,
 *  otherwise "missing". It cannot tell a skill used in a project from a word in a skills list, and it does not know synonyms. The analyzer has to beat this. */
const mentions = (text, term) => new RegExp(`(^|\\s)${normalise(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?(\\s|$)`).test(normalise(text));
function keywordBaseline(pair) {
  const requirements = pair.requirements.map((label) => {
    const hit = mentions(pair.resume, label.match[0]) ? label.match[0] : null;
    const sentence = hit ? (pair.resume.split(/(?<=[.!?\n])\s+/).find((line) => mentions(line, hit)) || hit) : '';
    return { text: label.match[0], skillKey: '', status: hit ? 'met' : 'missing', evidence: sentence.trim(), importance: label.importance || 'must' };
  });
  return { requirements, score: computeScore(requirements), aiProvider: 'keyword-baseline' };
}

/** Pairs of one split: 'dev' (used while improving), 'holdout' (looked at once at the end) or 'all'. A pair with no split counts as dev. */
const selectPairs = (pairs, split = 'all') => (split === 'all' ? pairs : pairs.filter((p) => (p.split || 'dev') === split));

/** One report against one labelled pair. */
function scorePair(pair, report) {
  let found = 0; let statusChecked = 0; let statusCorrect = 0; let falseGaps = 0; let falseReassurance = 0;
  const statuses = {};
  const confusion = {};
  for (const c of CLASSES) confusion[c] = { met: 0, partial: 0, missing: 0, none: 0 };
  for (const label of pair.requirements) {
    const req = findRequirement(report, label);
    statuses[label.match[0]] = req ? req.status : null;
    confusion[label.expected][req ? req.status : 'none'] += 1;
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
    id: pair.id, split: pair.split || 'dev', provider: report.aiProvider || null, score: report.score, statuses, confusion,
    labelled: pair.requirements.length, found, statusChecked, statusCorrect, falseGaps, falseReassurance,
    evidenceChecked: withEvidence.length, evidenceVerified: verified,
    scoreInBand: low == null ? null : report.score >= low && report.score <= high,
    scoreError: low == null ? null : Math.abs(report.score - (low + high) / 2),
  };
}

const ratio = (a, b) => (b ? a / b : null);
const sum = (rows, key) => rows.reduce((total, r) => total + (r[key] || 0), 0);
const sd = (values) => { if (values.length < 2) return 0; const m = values.reduce((a, b) => a + b, 0) / values.length; return Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length); };

/** 95% Wilson interval for k successes in n tries: honest for small counts (unlike the normal approximation). Null when n is 0. */
function wilson(k, n, z = 1.96) {
  if (!n) return null;
  const p = k / n;
  const denominator = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denominator;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denominator;
  return [Math.max(0, centre - margin), Math.min(1, centre + margin)];
}

/** Precision, recall and F1 for each class from the summed confusion counts. Precision counts only requirements the report matched; recall counts every labelled one (a requirement the report never mentioned is a miss). */
function perClass(rows) {
  const total = {};
  for (const c of CLASSES) { total[c] = { met: 0, partial: 0, missing: 0, none: 0 }; for (const r of rows) for (const a of Object.keys(total[c])) total[c][a] += r.confusion[c][a]; }
  const out = {};
  for (const c of CLASSES) {
    const tp = total[c][c];
    const predicted = CLASSES.reduce((n, e) => n + total[e][c], 0);
    const actual = Object.values(total[c]).reduce((a, b) => a + b, 0);
    const precision = ratio(tp, predicted);
    const recall = ratio(tp, actual);
    out[c] = { precision, recall, f1: precision && recall ? (2 * precision * recall) / (precision + recall) : (precision === 0 || recall === 0 ? 0 : null), support: actual };
  }
  const f1s = CLASSES.map((c) => out[c].f1).filter((v) => v !== null);
  out.macroF1 = f1s.length ? f1s.reduce((a, b) => a + b, 0) / f1s.length : null;
  return out;
}

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
    classes: perClass(rows),
    intervals: {
      requirementRecall: wilson(sum(rows, 'found'), sum(rows, 'labelled')),
      statusAccuracy: wilson(sum(rows, 'statusCorrect'), sum(rows, 'statusChecked')),
      falseReassuranceRate: wilson(sum(rows, 'falseReassurance'), sum(rows, 'statusChecked')),
      evidenceVerifiedRate: wilson(sum(rows, 'evidenceVerified'), sum(rows, 'evidenceChecked')),
    },
  };
}

/** Rows grouped by the provider that answered, to see whether the models disagree. */
const byProvider = (rows) => Object.fromEntries(Object.entries(rows.reduce((groups, r) => { (groups[r.provider || 'unknown'] ||= []).push(r); return groups; }, {})).map(([k, v]) => [k, aggregate(v)]));

module.exports = { scorePair, aggregate, byProvider, findRequirement, keywordBaseline, selectPairs, wilson, perClass, CLASSES };
