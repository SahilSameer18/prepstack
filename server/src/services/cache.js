// Cache-aside on Redis (docs/plans/REDIS_PLAN.md, phase 4). Read the cache; on a miss run the loader (MongoDB or the generator), store the
// result with an expiry, return it. MongoDB stays the source of truth, so every failure of Redis falls through to the loader, and an
// error thrown by the loader itself always reaches the caller unchanged.
//
//   - Every key has a TTL with random jitter, so many keys never expire at the same moment (avalanche).
//   - On a miss one request takes a short lock and refills the key while the others wait a moment for it (stampede).
//   - A loader that finds nothing returns null: that "not found" is cached briefly, so repeated requests for something that does not
//     exist do not all reach the database (penetration).
//   - The host has 298 MB and evicts nothing (the job queue needs that), so growth is bounded: a value above maxBytes is not cached,
//     and each cache name has a write budget per minute. When the budget is spent the request is served without caching.
//   - The value must survive JSON (it is stored as JSON text).
//   - In front of Redis sits a small in-process cache (level 1): a hit costs no network at all (a Redis read is about 36 ms from a laptop), identical
//     requests at the same moment share one load, and it works with Redis off. It holds a value for at most 60 s (CACHE_MEMORY_SECONDS; 0 turns it
//     off), so after a reseed one server can show the old content for up to a minute. Callers must not change a returned value (it is shared).
const crypto = require('node:crypto');
const { getRedis, redisKey, connectRedis, redisStatus, closeRedis } = require('../config/redis');

const NULL_MARKER = '__null__';
const MEMORY_MAX_ENTRIES = 300;
const MEMORY_MAX_BYTES = 48 * 1024 * 1024; // this process only: the free host has 512 MB
const LOCK_MS = 10000; // longer than the slowest loader, so the lock does not expire while someone is still loading
const WAIT_MS = 1500; // how long a request waits for another request's refill before loading by itself
const POLL_MS = 40;
const DEFAULTS = { ttlSeconds: 600, jitter: 0.1, negativeTtlSeconds: 30, maxBytes: 512 * 1024, writeBudgetPerMinute: 120 };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const decode = (raw) => (raw === NULL_MARKER ? null : JSON.parse(raw));
// keys are built from user input (a slug): only plain words become cache keys, anything else is just not cached
const SAFE_PART = /^[a-z0-9][a-z0-9-]{0,63}$/;

const withJitter = (seconds, jitter) => Math.max(1, Math.round(seconds * (1 + (Math.random() * 2 - 1) * jitter)));

// Has this cache name spent its writes for this minute? (INCR is atomic, so two servers share one count.)
async function withinBudget(client, name, perMinute) {
  const key = redisKey('cache', 'budget', name, String(Math.floor(Date.now() / 60000)));
  const used = await client.incr(key);
  if (used === 1) await client.expire(key, 120);
  return used <= perMinute;
}

async function store(client, key, name, value, options) {
  if (value === undefined) return;
  const raw = value === null ? NULL_MARKER : JSON.stringify(value);
  if (raw.length > options.maxBytes) return;
  if (!(await withinBudget(client, name, options.writeBudgetPerMinute))) return;
  const seconds = value === null ? options.negativeTtlSeconds : options.ttlSeconds;
  await client.set(key, raw, 'EX', withJitter(seconds, options.jitter));
}

/**
 * cached(['content', 'sheet', slug], loader, { ttlSeconds })
 * parts: the key words (the first two name the cache for its write budget, unless options.budgetName says otherwise). loader: async, returns a JSON-safe value, or null for "not found".
 */
// ---- level 1: this process's own memory ----
const level1 = new Map(); // key -> { value, expiresAt, size } (Map order = oldest first)
const inFlight = new Map(); // key -> the load already running for it
let level1Bytes = 0;
const memorySeconds = () => { const n = Number(process.env.CACHE_MEMORY_SECONDS ?? 60); return Number.isFinite(n) && n >= 0 ? n : 60; };
const forget = (key) => { const entry = level1.get(key); if (entry) { level1Bytes -= entry.size; level1.delete(key); } };
function remember(key, value, options) {
  const limit = memorySeconds();
  if (limit === 0 || value === undefined) return;
  const size = value === null ? 8 : JSON.stringify(value).length;
  if (size > options.maxBytes) return;
  forget(key);
  const seconds = value === null ? Math.min(options.negativeTtlSeconds, limit) : Math.min(options.ttlSeconds, limit);
  level1.set(key, { value, size, expiresAt: Date.now() + withJitter(seconds, options.jitter) * 1000 });
  level1Bytes += size;
  while (level1.size > MEMORY_MAX_ENTRIES || level1Bytes > MEMORY_MAX_BYTES) forget(level1.keys().next().value);
}
const resetMemoryCache = () => { level1.clear(); inFlight.clear(); level1Bytes = 0; };

async function cached(parts, loader, overrides = {}) {
  if (!parts.every((part) => SAFE_PART.test(String(part)))) return loader();
  const options = { ...DEFAULTS, ...overrides };
  const key = parts.join(':');
  const hit = level1.get(key);
  if (hit) { if (hit.expiresAt > Date.now()) return hit.value; forget(key); }
  const running = inFlight.get(key);
  if (running) return running; // the same thing is being loaded right now: wait for it instead of loading it again
  const load = (async () => {
    const value = await viaRedis(parts, loader, overrides);
    remember(key, value, options);
    return value;
  })().finally(() => inFlight.delete(key));
  inFlight.set(key, load);
  return load;
}

async function viaRedis(parts, loader, overrides = {}) {
  const client = getRedis();
  if (!client || !parts.every((part) => SAFE_PART.test(String(part)))) return loader();
  const options = { ...DEFAULTS, ...overrides };
  const name = options.budgetName || parts.slice(0, 2).join('-');
  const key = redisKey('cache', ...parts);
  const lockKey = `${key}:lock`;
  const token = crypto.randomBytes(8).toString('hex');

  try {
    const hit = await client.get(key);
    if (hit !== null) return decode(hit);
    if ((await client.set(lockKey, token, 'PX', LOCK_MS, 'NX')) !== 'OK') {
      const end = Date.now() + WAIT_MS; // someone else is refilling it: wait for their result instead of hitting the database too
      while (Date.now() < end) {
        await sleep(POLL_MS);
        const filled = await client.get(key);
        if (filled !== null) return decode(filled);
      }
      return loader();
    }
  } catch {
    return loader(); // Redis failed (or the stored text was damaged): serve from the database
  }

  try {
    const value = await loader(); // an error here is the loader's own and goes to the caller
    try { await store(client, key, name, value, options); } catch { /* Redis failed after loading: the value is still good */ }
    return value;
  } finally {
    // release only our own lock (it may have expired and been taken by someone else)
    try { if ((await client.get(lockKey)) === token) await client.del(lockKey); } catch { /* the lock expires by itself */ }
  }
}

// After a seed changed the sheets or the notes: delete the cached copies. A seed usually runs on a developer machine against the live
// database, where the key prefix differs from the live server's, so this clears the content keys of every environment prefix.
async function clearContentCache() {
  if (!getRedis()) connectRedis(); // answers null without REDIS_URL
  const end = Date.now() + 8000;
  while (Date.now() < end && redisStatus().state === 'connecting') await sleep(50);
  const client = getRedis();
  if (!client) { await closeRedis(); return { cleared: 0, skipped: true }; }
  let cleared = 0;
  try {
    for (const pattern of new Set([redisKey('cache', 'content', '*'), 'prepstack:*:cache:content:*'])) {
      let cursor = '0';
      do {
        const [next, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
        cursor = next;
        if (keys.length) cleared += await client.del(...keys);
      } while (cursor !== '0');
    }
  } finally {
    await closeRedis();
  }
  return { cleared, skipped: false };
}

module.exports = { cached, clearContentCache, resetMemoryCache, DEFAULTS };
