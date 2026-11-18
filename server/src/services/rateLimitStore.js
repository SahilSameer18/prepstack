// A Redis store for express-rate-limit (docs/plans/REDIS_PLAN.md, phase 5), so every server copy shares one count and a restart keeps it.
//
// Two algorithms, each one atomic Lua script (the check and the count happen in one step, so two callers can never both pass):
//   fixed   a counter per window (INCR, with the expiry set when the key is created). Cheap. Flaw: a burst across the edge of two
//           windows can let nearly double the limit through.
//   sliding a sorted set of the request times in the last window (the exact count, no edge burst). Costs memory per request, so it is
//           used where a burst matters (login), not everywhere.
//
// When Redis is off or fails, the limiter falls back to an in-memory store, so the app is never unprotected and never blocked by Redis.
// RATE_LIMIT_MEMORY_ONLY=all (or a list of limiter names, for example login,register) forces memory: the way back if a Redis limiter misbehaves.
// A limiter built with defaultStore 'memory' counts in memory unless RATE_LIMIT_REDIS names it (or says all): a shared count costs a Redis
// round trip (36 ms measured), which is not worth it for chatty, low-risk limiters on a single server; with several servers, opt them in.
// The time comes from the app server's clock (passed into the script); with several servers a skewed clock moves the sliding window a little.
const crypto = require('node:crypto');
const { MemoryStore } = require('express-rate-limit');
const { getRedis, redisKey } = require('../config/redis');

// returns {hits, ms left}. PEXPIRE only when the key is new (or lost its expiry), so a busy client cannot keep a window open for ever.
const FIXED_INCREMENT = `
local hits = redis.call('INCR', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if hits == 1 or ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return {hits, ttl}`;

// give one hit back (a request that should not count after all), never below zero
const FIXED_DECREMENT = `
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
if current > 0 then redis.call('DECR', KEYS[1]) end
return current`;

// ARGV: now (ms), window (ms), a unique member. Drop what left the window, add this request, count, report the oldest.
const SLIDING_INCREMENT = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - window)
redis.call('ZADD', KEYS[1], now, ARGV[3])
redis.call('PEXPIRE', KEYS[1], window)
local hits = redis.call('ZCARD', KEYS[1])
local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
return {hits, tonumber(oldest[2])}`;

const listed = (variable, name) => {
  const setting = (process.env[variable] || '').toLowerCase().split(',').map((part) => part.trim());
  return setting.includes('all') || setting.includes(name);
};
const memoryOnly = (name) => listed('RATE_LIMIT_MEMORY_ONLY', name);

class RedisRateLimitStore {
  /** name: the limiter's name in the keys and in the environment lists. algorithm: 'fixed' or 'sliding'. defaultStore: 'redis' or 'memory' (see above). */
  constructor({ name, algorithm = 'fixed', defaultStore = 'redis' }) {
    this.name = name;
    this.algorithm = algorithm;
    this.defaultStore = defaultStore;
    this.fallback = new MemoryStore();
    this.localKeys = false; // a count made on one server counts on all of them
    this.windowMs = 60000;
  }

  init(options) {
    this.windowMs = options.windowMs;
    this.fallback.init(options);
  }

  key(clientKey) { return redisKey('rl', this.name, clientKey); }

  client() {
    if (memoryOnly(this.name)) return null;
    if (this.defaultStore === 'memory' && !listed('RATE_LIMIT_REDIS', this.name)) return null;
    return getRedis();
  }

  async increment(clientKey) {
    const client = this.client();
    if (client) {
      try {
        if (this.algorithm === 'sliding') {
          const now = Date.now();
          const [hits, oldest] = await client.eval(SLIDING_INCREMENT, 1, this.key(clientKey), now, this.windowMs, `${now}:${crypto.randomBytes(6).toString('hex')}`);
          return { totalHits: Number(hits), resetTime: new Date(Number(oldest) + this.windowMs) };
        }
        const [hits, ttl] = await client.eval(FIXED_INCREMENT, 1, this.key(clientKey), this.windowMs);
        return { totalHits: Number(hits), resetTime: new Date(Date.now() + Number(ttl)) };
      } catch { /* Redis failed: count in memory for this request */ }
    }
    return this.fallback.increment(clientKey);
  }

  async decrement(clientKey) {
    const client = this.client();
    if (client) {
      try {
        if (this.algorithm === 'sliding') await client.zpopmax(this.key(clientKey)); // the newest entry is the request being given back
        else await client.eval(FIXED_DECREMENT, 1, this.key(clientKey));
        return;
      } catch { /* fall through */ }
    }
    await this.fallback.decrement(clientKey);
  }

  async resetKey(clientKey) {
    const client = this.client();
    if (client) { try { await client.del(this.key(clientKey)); } catch { /* the key expires anyway */ } }
    await this.fallback.resetKey(clientKey);
  }

  shutdown() { this.fallback.shutdown?.(); }
}

module.exports = { RedisRateLimitStore, FIXED_INCREMENT, FIXED_DECREMENT, SLIDING_INCREMENT };
