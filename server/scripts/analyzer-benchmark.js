// Role Analyzer benchmark (docs/research/ANALYZER_BENCHMARK.md): runs the real analyzer on labelled resume and job pairs and prints how often it agrees with the labels
// (precision, recall and F1 per status, false reassurance, quotes found in the resume, score against the judges' range, spread across repeat runs and models),
// next to a keyword baseline that needs no AI. Uses real AI calls (free quota) unless --baseline-only. Never prints a key. Does not touch the database.
//
//   node scripts/analyzer-benchmark.js --baseline-only            the keyword baseline on the starter set: no AI, no quota (a quick check of the labels)
//   node scripts/analyzer-benchmark.js                            the 12-pair starter set (draft labels), 3 runs each
//   node scripts/analyzer-benchmark.js --split dev|holdout        only the pairs used while improving, or the held-out pairs (look at the held-out result once, at the end)
//   node scripts/analyzer-benchmark.js --set smoke                the 7 older made-up pairs in scripts/samples/samples.js
//   node scripts/analyzer-benchmark.js --data C:/path/pairs.json  your own labelled pairs, kept OUTSIDE the repo
//   options: --runs <n, default 3>  --only <pair id>  --pace <ms between calls, default 4500>  --retries <n, default 1>  --retry-pause <ms, default 20000>  --out <file for the raw results>
//   Time limits are raised for this script (75 s per call, 200 s per run) and the preview model is skipped unless EVAL_PREVIEW=1; the Reliability line shows how many runs answered.
//   EVAL_MODEL=<gemini model> picks the first model tried; the answering provider is recorded for every run.
// Pair format: see the top of scripts/lib/benchmark-metrics.js and docs/research/ANALYZER_BENCHMARK.md.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
// The cheap high-quota models are used. The preview model (about 20 requests a day, the SAME quota the live site uses) is skipped unless EVAL_PREVIEW=1.
process.env.GEMINI_PRIMARY_MODEL = process.env.EVAL_MODEL || 'gemini-3.5-flash-lite';
process.env.GEMINI_FALLBACK_MODEL = 'gemini-3.1-flash-lite';
process.env.GEMINI_FALLBACK_2_MODEL = process.env.EVAL_PREVIEW === '1' ? 'gemini-3-flash-preview' : (process.env.EVAL_MODEL || 'gemini-3.5-flash-lite');
// This script measures accuracy, not live speed: the analyzer's long answer often needs more than the live site's 20 s per call, so allow more time.
// (A run that still fails is counted and reported below, never hidden.)
process.env.AI_CALL_TIMEOUT_MS = process.env.AI_CALL_TIMEOUT_MS || '75000';
process.env.AI_TOTAL_BUDGET_MS = process.env.AI_TOTAL_BUDGET_MS || '200000';
process.env.AI_RESERVE_MS = process.env.AI_RESERVE_MS || '20000';

const fs = require('fs');
const os = require('os');
const path = require('path');
const skills = require('../src/modules/analyzer/skillCatalog.json');
const { scorePair, aggregate, byProvider, keywordBaseline, selectPairs, CLASSES } = require('./lib/benchmark-metrics');

const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : fallback; };
const flag = (name) => process.argv.includes(`--${name}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The older made-up samples carry skill lists, not labelled requirements: turn them into labels (met / missing) with the catalog's aliases. */
function fromSamples(samples) {
  const terms = (name) => { const entry = skills.find((s) => s.name === name); return [...new Set([...name.split('/'), ...(entry ? entry.aliases : [])].map((t) => t.trim()).filter(Boolean))]; };
  return samples.map((s) => ({
    id: s.id, resume: s.resume, jobDescription: s.jobDescription, days: s.days, judgeScore: s.scoreBand,
    requirements: [...s.expect.missing.map((n) => ({ match: terms(n), expected: 'missing' })), ...s.expect.present.map((n) => ({ match: terms(n), expected: 'met' }))],
  }));
}

const pct = (v) => (v === null || v === undefined ? 'n/a' : `${(v * 100).toFixed(1)}%`);
const range = (iv) => (iv ? `${(iv[0] * 100).toFixed(0)} to ${(iv[1] * 100).toFixed(0)}%` : 'n/a');
const show = (title, m) => {
  console.log(`\n${title} (${m.pairs} pairs, ${m.runs} runs)`);
  console.log(`  requirements found         ${pct(m.requirementRecall)}   (95% interval ${range(m.intervals.requirementRecall)})`);
  console.log(`  status agrees with label   ${pct(m.statusAccuracy)}   (95% interval ${range(m.intervals.statusAccuracy)})`);
  console.log(`  false gaps (said missing, label met)         ${pct(m.falseGapRate)}`);
  console.log(`  false reassurance (said met, label missing)  ${pct(m.falseReassuranceRate)}   (95% interval ${range(m.intervals.falseReassuranceRate)})`);
  console.log(`  quotes found in the resume ${pct(m.evidenceVerifiedRate)}`);
  console.log(`  score inside the judges' range ${pct(m.scoreInBandRate)}   mean error ${m.meanScoreError == null ? 'n/a' : m.meanScoreError.toFixed(1)} points`);
  console.log('  per status        precision   recall     F1     labelled');
  for (const c of CLASSES) console.log(`    ${c.padEnd(15)} ${pct(m.classes[c].precision).padStart(8)} ${pct(m.classes[c].recall).padStart(9)} ${pct(m.classes[c].f1).padStart(8)} ${String(m.classes[c].support).padStart(8)}`);
  console.log(`    macro F1 ${pct(m.classes.macroF1)}`);
  if (m.runs > m.pairs) console.log(`  repeat runs: mean score spread ${m.meanScoreSdAcrossRuns == null ? 'n/a' : m.meanScoreSdAcrossRuns.toFixed(1)} points, ${pct(m.statusFlipRate)} of labelled requirements changed status between runs`);
};

(async () => {
  const dataPath = arg('data', null);
  const set = arg('set', 'starter');
  const all = dataPath ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : (set === 'smoke' ? fromSamples(require('./samples/samples')) : require('./samples/benchmark-starter'));
  const split = arg('split', 'all');
  const only = arg('only', null);
  const chosen = selectPairs(only ? all.filter((p) => p.id === only) : all, split);
  if (!chosen.length) throw new Error('No pairs to run');
  const dist = chosen.reduce((d, p) => { d[p.category || 'unlabelled'] = (d[p.category || 'unlabelled'] || 0) + 1; return d; }, {});
  console.log(`${chosen.length} pairs (${JSON.stringify(dist)}), ${chosen.reduce((n, p) => n + p.requirements.length, 0)} labelled requirements, split: ${split}`);
  if (chosen.some((p) => p.labelStatus)) console.log('NOTE: some labels are drafts that have not been reviewed by a second person.');

  // the baseline needs no AI
  show('Keyword baseline (a requirement is met when the resume mentions it as a whole word)', aggregate(chosen.map((p) => scorePair(p, keywordBaseline(p)))));
  if (flag('baseline-only')) return;

  const runs = Number(arg('runs', 3));
  const pace = Number(arg('pace', 4500));
  const analyzer = require('../src/modules/analyzer/analyzer.service');
  const { buildContext } = require('./lib/eval-context');
  const ctx = await buildContext();
  const retries = Number(arg('retries', 1)); // a run that fails (the AI is busy, times out or answers in the wrong shape) is tried again after a longer pause
  const retryPause = Number(arg('retry-pause', 20000));
  const rows = [];
  const failures = [];
  let attempted = 0;
  for (const pair of chosen) {
    for (let run = 1; run <= runs; run += 1) {
      attempted += 1;
      let done = false;
      for (let attempt = 0; attempt <= retries && !done; attempt += 1) {
        try {
          const report = await analyzer.analyze({ resume: pair.resume, jobDescription: pair.jobDescription, days: pair.days || 7 }, ctx, { label: 'benchmark' });
          rows.push(scorePair(pair, report));
          console.log(`${pair.id} run ${run}: score ${report.score}, answered by ${report.aiProvider}${attempt ? ` (after ${attempt} retry)` : ''}`);
          done = true;
        } catch (error) {
          console.log(`${pair.id} run ${run}: FAILED attempt ${attempt + 1} (${String(error.message).slice(0, 60)})`);
          if (attempt === retries) failures.push({ id: pair.id, run, message: String(error.message).slice(0, 120) });
          else await sleep(retryPause);
        }
      }
      await sleep(pace);
    }
  }
  console.log(`\nReliability: ${rows.length} of ${attempted} runs answered (${((100 * rows.length) / attempted).toFixed(0)}%), ${failures.length} failed even after ${retries} retry. The accuracy numbers below cover only the runs that answered.`);
  if (!rows.length) throw new Error('Every run failed; nothing to score');
  show('Role Analyzer, all runs', aggregate(rows));
  for (const [provider, m] of Object.entries(byProvider(rows))) show(`Role Analyzer, answered by ${provider}`, m);
  const out = arg('out', path.join(os.tmpdir(), 'analyzer-benchmark', `${Date.now()}.json`));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ at: new Date().toISOString(), model: process.env.GEMINI_PRIMARY_MODEL, split, attempted, answered: rows.length, failures, rows }, null, 2));
  console.log(`\nRaw results: ${out}`);
})().catch((error) => { console.error('Benchmark failed:', error.message); process.exit(1); });
