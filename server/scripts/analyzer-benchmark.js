// Role Analyzer benchmark (docs/research/ANALYZER_BENCHMARK.md): runs the real analyzer on labelled resume and job pairs and prints how often
// it agrees with the labels, and how much repeated runs and different models disagree with each other.
// Uses real AI calls (free quota). Never prints a key. Does not touch the database.
//
//   node scripts/analyzer-benchmark.js                          the 7 made-up pairs in scripts/samples (a smoke test, not a benchmark)
//   node scripts/analyzer-benchmark.js --data C:/path/pairs.json   your own labelled pairs, kept OUTSIDE the repo
//   options: --runs <n, default 3>  --only <pair id>  --pace <ms between calls, default 4500>  --out <file for the raw results>
//   EVAL_MODEL=<gemini model> picks the first model tried; the answering provider is recorded for every run.
// Pair format: see the top of scripts/lib/benchmark-metrics.js and docs/research/ANALYZER_BENCHMARK.md.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
process.env.GEMINI_PRIMARY_MODEL = process.env.EVAL_MODEL || 'gemini-3.5-flash-lite';
process.env.GEMINI_FALLBACK_MODEL = 'gemini-3.1-flash-lite';
process.env.GEMINI_FALLBACK_2_MODEL = 'gemini-3-flash-preview';

const fs = require('fs');
const os = require('os');
const path = require('path');
const analyzer = require('../src/modules/analyzer/analyzer.service');
const skills = require('../src/modules/analyzer/skillCatalog.json');
const { buildContext } = require('./lib/eval-context');
const { scorePair, aggregate, byProvider } = require('./lib/benchmark-metrics');

const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : fallback; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The made-up samples carry skill lists, not labelled requirements: turn them into labels (met / missing) with the catalog's aliases. */
function fromSamples(samples) {
  const terms = (name) => { const entry = skills.find((s) => s.name === name); return [...new Set([...name.split('/'), ...(entry ? entry.aliases : [])].map((t) => t.trim()).filter(Boolean))]; };
  return samples.map((s) => ({
    id: s.id, resume: s.resume, jobDescription: s.jobDescription, days: s.days, judgeScore: s.scoreBand,
    requirements: [...s.expect.missing.map((n) => ({ match: terms(n), expected: 'missing' })), ...s.expect.present.map((n) => ({ match: terms(n), expected: 'met' }))],
  }));
}

const pct = (v) => (v === null || v === undefined ? 'n/a' : `${(v * 100).toFixed(1)}%`);
const show = (title, m) => {
  console.log(`\n${title} (${m.pairs} pairs, ${m.runs} runs)`);
  console.log(`  requirements found      ${pct(m.requirementRecall)}`);
  console.log(`  status agrees with label ${pct(m.statusAccuracy)}`);
  console.log(`  false gaps (said missing, label met)         ${pct(m.falseGapRate)}`);
  console.log(`  false reassurance (said met, label missing)  ${pct(m.falseReassuranceRate)}`);
  console.log(`  quotes found in the resume ${pct(m.evidenceVerifiedRate)}`);
  console.log(`  score inside the judges' range ${pct(m.scoreInBandRate)}   mean error ${m.meanScoreError == null ? 'n/a' : m.meanScoreError.toFixed(1)} points`);
  console.log(`  repeat runs: mean score spread ${m.meanScoreSdAcrossRuns == null ? 'n/a' : m.meanScoreSdAcrossRuns.toFixed(1)} points, ${pct(m.statusFlipRate)} of labelled requirements changed status between runs`);
};

(async () => {
  const dataPath = arg('data', null);
  const pairs = dataPath ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : fromSamples(require('./samples/samples'));
  const only = arg('only', null);
  const runs = Number(arg('runs', 3));
  const pace = Number(arg('pace', 4500));
  const chosen = only ? pairs.filter((p) => p.id === only) : pairs;
  if (!chosen.length) throw new Error('No pairs to run');
  const ctx = await buildContext();
  const rows = [];
  for (const pair of chosen) {
    for (let run = 1; run <= runs; run += 1) {
      try {
        const report = await analyzer.analyze({ resume: pair.resume, jobDescription: pair.jobDescription, days: pair.days || 7 }, ctx, { label: 'benchmark' });
        rows.push(scorePair(pair, report));
        console.log(`${pair.id} run ${run}: score ${report.score}, answered by ${report.aiProvider}`);
      } catch (error) {
        console.log(`${pair.id} run ${run}: FAILED (${String(error.message).slice(0, 80)})`);
      }
      await sleep(pace);
    }
  }
  if (!rows.length) throw new Error('Every run failed; nothing to score');
  show('All runs', aggregate(rows));
  for (const [provider, m] of Object.entries(byProvider(rows))) show(`Answered by ${provider}`, m);
  const out = arg('out', path.join(os.tmpdir(), 'analyzer-benchmark', `${Date.now()}.json`));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ at: new Date().toISOString(), model: process.env.GEMINI_PRIMARY_MODEL, rows }, null, 2));
  console.log(`\nRaw results: ${out}`);
})().catch((error) => { console.error('Benchmark failed:', error.message); process.exit(1); });
