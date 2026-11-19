// Phase 5 measurement: what does counting a rate limit in Redis cost a request?
// Run:  npm run measure:limits      (reads REDIS_URL from server/.env; it writes only keys with a unique test prefix and deletes them again)
// The same cheap request (saving a problem note, which goes through the problem-note limiter and one database write) is timed in three modes:
//   1. Redis off                      : limiters count in memory
//   2. Redis on, limiters in memory   : RATE_LIMIT_MEMORY_ONLY=all (Redis is connected but the limiters do not use it)
//   3. Redis on, limiter in Redis     : RATE_LIMIT_REDIS=problem-note (this limiter counts in memory by default, because of the cost measured here)
// The cost of the limiter is row 3 minus row 2. It uses an in-memory MongoDB in this process, so the request itself is fast and the
// difference is almost all the round trip to the Redis service; from a laptop that is the internet, from a host next to it far less.
const url = process.env.REDIS_URL; // the test harness below removes it from the environment; keep a copy
const crypto = require('node:crypto');
const t = require('../test/helpers/setup');
const redisConfig = require('../src/shared/config/redis');

const USERS = 40;
const ROUNDS = 3;
const PER_MODE_PER_ROUND = 100;
const WARMUP = 20;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)];
const percentile = (list, p) => [...list].sort((a, b) => a - b)[Math.min(list.length - 1, Math.floor(list.length * p))];

async function makeUsers() {
  const users = [];
  for (let i = 0; i < USERS; i += 1) users.push({ cookies: (await t.register()).cookies, count: 0 });
  return users;
}

async function timeRequests(users, count) {
  const times = [];
  for (let i = 0; i < count; i += 1) {
    const user = users[i % users.length];
    user.count += 1;
    const begin = process.hrtime.bigint();
    const res = await t.api.put('/api/problem-notes', { cookies: user.cookies, body: { problemLink: t.L('two-sum'), pattern: 'Two Pointers', approach: 'Sort first, then move two pointers. Version ' + user.count } });
    times.push(Number(process.hrtime.bigint() - begin) / 1e6);
    if (res.status !== 200) throw new Error('unexpected status ' + res.status);
  }
  return times;
}

(async () => {
  await t.start();
  await t.seedSheets();
  const users = await makeUsers();

  let real = null;
  if (url) {
    process.env.REDIS_URL = url;
    process.env.REDIS_PREFIX = `prepstack:test:${crypto.randomBytes(6).toString('hex')}:`; // this run's own keys only
    redisConfig.connectRedis();
    for (let i = 0; i < 300 && redisConfig.redisStatus().state === 'connecting'; i += 1) await sleep(50);
    real = redisConfig.getRedis();
    if (!real) console.log('Redis is not reachable: only the "Redis off" row can be measured.');
  } else console.log('REDIS_URL is not set (use npm run measure:limits): only the "Redis off" row can be measured.');

  const modes = [
    { label: 'Redis off (limiters in memory)', use: () => { redisConfig.setRedisForTests(null); delete process.env.RATE_LIMIT_MEMORY_ONLY; } },
  ];
  if (real) {
    modes.push({ label: 'Redis on, limiters in memory', use: () => { redisConfig.setRedisForTests(real); process.env.RATE_LIMIT_MEMORY_ONLY = 'all'; delete process.env.RATE_LIMIT_REDIS; } });
    modes.push({ label: 'Redis on, limiters in Redis', use: () => { redisConfig.setRedisForTests(real); delete process.env.RATE_LIMIT_MEMORY_ONLY; process.env.RATE_LIMIT_REDIS = 'problem-note'; } }); // problem-note counts in memory by default: opt it in
  }

  for (const mode of modes) { mode.use(); await timeRequests(users, WARMUP); mode.times = []; }
  for (let round = 0; round < ROUNDS; round += 1) { // rounds alternate the modes, so a slow minute on the network hits all of them
    for (const mode of modes) { mode.use(); mode.times.push(...(await timeRequests(users, PER_MODE_PER_ROUND))); }
  }

  if (real) {
    redisConfig.setRedisForTests(real);
    let cursor = '0';
    do { const [next, keys] = await real.scan(cursor, 'MATCH', `${process.env.REDIS_PREFIX}*`, 'COUNT', 200); cursor = next; if (keys.length) await real.del(...keys); } while (cursor !== '0');
    await redisConfig.closeRedis();
  }

  console.log(`\n${modes[0].times.length} requests per mode (a problem note save, ${USERS} users in turn, ${ROUNDS} alternating rounds, after ${WARMUP} warm-up requests each).\n`);
  console.log('mode'.padEnd(34), 'median ms'.padStart(10), 'p95 ms'.padStart(8), 'mean ms'.padStart(9));
  for (const mode of modes) console.log(mode.label.padEnd(34), median(mode.times).toFixed(1).padStart(10), percentile(mode.times, 0.95).toFixed(1).padStart(8), (mode.times.reduce((a, b) => a + b, 0) / mode.times.length).toFixed(1).padStart(9));
  if (modes.length === 3) {
    const [, inMemory, inRedis] = modes;
    console.log(`\ncost of the Redis limiter per request: median ${(median(inRedis.times) - median(inMemory.times)).toFixed(1)} ms, p95 ${(percentile(inRedis.times, 0.95) - percentile(inMemory.times, 0.95)).toFixed(1)} ms`);
  }
  await t.stop();
  process.exit(0);
})().catch((error) => { console.error(error); process.exit(1); });
