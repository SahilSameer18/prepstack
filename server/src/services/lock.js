// "One at a time" locks and a short-window counter (docs/plans/REDIS_PLAN.md, phase 5), shared between server copies through Redis.
// Without Redis, or when Redis fails, they work in this process's memory, which is what the app did before and is correct for one server.
const crypto = require('node:crypto');
const { getRedis, redisKey } = require('../config/redis');

// Release only if the stored token is still ours: a lock that expired may already belong to someone else.
const RELEASE = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0`;

const memoryLocks = new Map(); // name:id -> { token, expiresAt }

/**
 * acquireLock('project', userId, 70000) -> { release() } or null when someone else holds it.
 * The lock expires by itself after ttlMs (longer than the slowest work), so a crashed server cannot block a user for ever.
 */
async function acquireLock(name, id, ttlMs) {
  const token = crypto.randomBytes(12).toString('hex');
  const client = getRedis();
  if (client) {
    const key = redisKey('lock', name, id);
    try {
      if ((await client.set(key, token, 'PX', ttlMs, 'NX')) !== 'OK') return null;
      return { release: async () => { try { await client.eval(RELEASE, 1, key, token); } catch { /* it expires by itself */ } } };
    } catch { /* Redis failed: use this process's memory */ }
  }
  const key = `${name}:${id}`;
  const held = memoryLocks.get(key);
  if (held && held.expiresAt > Date.now()) return null;
  memoryLocks.set(key, { token, expiresAt: Date.now() + ttlMs });
  return { release: async () => { if (memoryLocks.get(key)?.token === token) memoryLocks.delete(key); } };
}

// ── events in the last window (a sliding window of timestamps): how many times has this happened lately? ──
const COUNT = `
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', tonumber(ARGV[1]) - tonumber(ARGV[2]))
return redis.call('ZCARD', KEYS[1])`;
const RECORD = `
local now = tonumber(ARGV[1])
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - tonumber(ARGV[2]))
redis.call('ZADD', KEYS[1], now, ARGV[3])
redis.call('PEXPIRE', KEYS[1], ARGV[2])
return redis.call('ZCARD', KEYS[1])`;

const memoryEvents = new Map(); // name:id -> [timestamps]

async function recentCount(name, id, windowMs) {
  const client = getRedis();
  if (client) {
    try { return Number(await client.eval(COUNT, 1, redisKey('events', name, id), Date.now(), windowMs)); } catch { /* memory */ }
  }
  const key = `${name}:${id}`;
  const fresh = (memoryEvents.get(key) || []).filter((at) => Date.now() - at < windowMs);
  if (fresh.length) memoryEvents.set(key, fresh); else memoryEvents.delete(key);
  return fresh.length;
}

async function recordEvent(name, id, windowMs) {
  const client = getRedis();
  if (client) {
    try { await client.eval(RECORD, 1, redisKey('events', name, id), Date.now(), windowMs, `${Date.now()}:${crypto.randomBytes(6).toString('hex')}`); return; } catch { /* memory */ }
  }
  const key = `${name}:${id}`;
  memoryEvents.set(key, [...(memoryEvents.get(key) || []), Date.now()]);
}

const resetLocalState = () => { memoryLocks.clear(); memoryEvents.clear(); };

module.exports = { acquireLock, recentCount, recordEvent, resetLocalState, RELEASE };
