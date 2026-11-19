// Phase 4 measurement: how many database reads and generator runs do N requests cost, without Redis and with the real Redis service?
// Run:  npm run measure:cache      (reads REDIS_URL from server/.env; it writes only keys with a unique test prefix and deletes them again)
//       DB_LATENCY_MS=40 npm run measure:cache    adds an ASSUMED delay to every database read, to imitate a database across the internet
// It uses an in-memory MongoDB and the app in this process, so request times are the app's own work plus the Redis round trip, not a real deployment.
const url = process.env.REDIS_URL; // the test harness below removes it from the environment; keep a copy
const crypto = require('node:crypto');
const t = require('../test/helpers/setup');
const redisConfig = require('../src/shared/config/redis');
const gen = require('../src/services/planGenerator');

const REQUESTS = Number(process.env.REQUESTS || 400);
const DB_LATENCY_MS = Number(process.env.DB_LATENCY_MS || 0);
const CONCURRENCY = 10;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const counts = { db: 0, generator: 0 };
function instrument() {
  const { DSASheet, Notes } = t.getModels();
  for (const [model, names] of [[DSASheet, ['find', 'findOne']], [Notes, ['find', 'findOne']]]) {
    for (const name of names) {
      const original = model[name];
      model[name] = function counted(...args) {
        counts.db += 1;
        const query = original.apply(this, args);
        if (!DB_LATENCY_MS) return query;
        const exec = query.exec.bind(query); // a query runs when it is awaited: delay that moment
        query.exec = async () => { await sleep(DB_LATENCY_MS); return exec(); };
        return query;
      };
    }
  }
  const generate = gen.previewPlan;
  gen.previewPlan = (...args) => { counts.generator += 1; return generate(...args); };
}

const preview = { goalType: 'placements', style: 'one-topic', weeks: 8, weekdayHours: 2, weekendHours: 3, restDay: null, sheetSlug: 'neetcode-150', subjects: ['os', 'dbms'] };
const mix = [() => t.api.get('/api/sheets'), () => t.api.get('/api/sheets/blind-75'), () => t.api.get('/api/notes'), () => t.api.get('/api/notes/os'), () => t.api.post('/api/plan/preview', { body: preview })];

async function scenario(label) {
  counts.db = 0; counts.generator = 0;
  const times = [];
  const started = Date.now();
  for (let sent = 0; sent < REQUESTS; sent += CONCURRENCY) {
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, REQUESTS - sent) }, async (_, i) => {
      const begin = process.hrtime.bigint();
      const res = await mix[(sent + i) % mix.length]();
      if (res.status !== 200) throw new Error(`${label}: status ${res.status}`);
      times.push(Number(process.hrtime.bigint() - begin) / 1e6);
    }));
  }
  times.sort((a, b) => a - b);
  return { label, requests: REQUESTS, dbReads: counts.db, generatorRuns: counts.generator, medianMs: times[Math.floor(times.length / 2)], p95Ms: times[Math.floor(times.length * 0.95)], totalMs: Date.now() - started };
}

(async () => {
  await t.start();
  await t.seedSheets();
  const { Notes } = t.getModels();
  const os = require('../src/data/notes/os');
  await Notes.create({ subject: os.subject, subjectSlug: 'os', sections: os.sections });
  instrument();

  const rows = [];
  redisConfig.setRedisForTests(null);
  rows.push(await scenario('without Redis'));

  if (url) {
    process.env.REDIS_URL = url;
    process.env.REDIS_PREFIX = `prepstack:test:${crypto.randomBytes(6).toString('hex')}:`; // this run's own keys only
    redisConfig.connectRedis();
    for (let i = 0; i < 300 && redisConfig.redisStatus().state === 'connecting'; i += 1) await sleep(50);
    if (redisConfig.getRedis()) {
      rows.push(await scenario('with Redis, cold cache'));
      rows.push(await scenario('with Redis, warm cache'));
      const client = redisConfig.getRedis();
      let cursor = '0';
      do { const [next, keys] = await client.scan(cursor, 'MATCH', `${process.env.REDIS_PREFIX}*`, 'COUNT', 200); cursor = next; if (keys.length) await client.del(...keys); } while (cursor !== '0');
    } else console.log('Redis is not reachable: only the first row was measured.');
    await redisConfig.closeRedis();
  } else console.log('REDIS_URL is not set (use npm run measure:cache): only the first row was measured.');

  console.log(`\n${REQUESTS} requests per row (5 kinds in turn: sheet list, one sheet, notes list, one subject, plan preview), ${CONCURRENCY} at a time. Assumed database delay: ${DB_LATENCY_MS} ms.\n`);
  console.log('scenario'.padEnd(26), 'DB reads'.padStart(9), 'generator'.padStart(10), 'median ms'.padStart(10), 'p95 ms'.padStart(8), 'total ms'.padStart(9));
  for (const r of rows) console.log(r.label.padEnd(26), String(r.dbReads).padStart(9), String(r.generatorRuns).padStart(10), r.medianMs.toFixed(1).padStart(10), r.p95Ms.toFixed(1).padStart(8), String(r.totalMs).padStart(9));
  await t.stop();
  process.exit(0);
})().catch((error) => { console.error(error); process.exit(1); });
