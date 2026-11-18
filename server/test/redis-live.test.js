// OPT-IN: runs against a REAL Redis-compatible service, and is skipped otherwise (the normal `npm test` never loads server/.env).
// Run it with:  npm run test:redis-live   (reads REDIS_TEST_URL, or REDIS_URL, from server/.env)
// Every key it writes starts with a prefix that is unique to this run, and it deletes only keys with that prefix, so it never touches
// the keys of the live site or of your own development data on the same service.
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');

const url = process.env.REDIS_TEST_URL || process.env.REDIS_URL;
const MODULE = path.join(__dirname, '..', 'src', 'config', 'redis.js');
const prefix = `prepstack:test:${crypto.randomBytes(6).toString('hex')}:`;

describe('the Redis connection against a real service', { skip: url ? false : 'set REDIS_TEST_URL or REDIS_URL (npm run test:redis-live)' }, () => {
  let redis;
  before(async () => {
    process.env.REDIS_URL = url;
    process.env.REDIS_PREFIX = prefix;
    delete require.cache[MODULE];
    redis = require(MODULE);
    redis.connectRedis();
    const end = Date.now() + 15000;
    while (Date.now() < end && redis.redisStatus().state !== 'ready') await new Promise((r) => setTimeout(r, 50));
  });
  after(async () => {
    const client = redis.getRedis();
    if (client && prefix.startsWith('prepstack:test:')) { // only this run's own keys
      let cursor = '0';
      do {
        const [next, keys] = await client.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
        cursor = next;
        if (keys.length) await client.del(...keys);
      } while (cursor !== '0');
    }
    await redis.closeRedis();
  });

  it('connects, and callers get a ready client', () => {
    assert.equal(redis.redisStatus().state, 'ready');
    assert.ok(redis.getRedis());
  });

  it('keys carry the run prefix; expiry, SET NX and parallel counters behave', async () => {
    const client = redis.getRedis();
    const key = redis.redisKey('probe');
    assert.ok(key.startsWith(prefix));
    await client.set(key, 'x', 'EX', 30);
    assert.equal(await client.get(key), 'x');
    const ttl = await client.ttl(key);
    assert.ok(ttl > 0 && ttl <= 30);
    assert.equal(await client.set(redis.redisKey('lock'), 'a', 'PX', 5000, 'NX'), 'OK');
    assert.equal(await client.set(redis.redisKey('lock'), 'b', 'PX', 5000, 'NX'), null);
    const counts = await Promise.all(Array.from({ length: 50 }, () => client.incr(redis.redisKey('n'))));
    assert.equal(Math.max(...counts), 50);
    assert.equal(new Set(counts).size, 50);
  });

  // phase 5: the real Lua scripts on the real service (the other tests run them on ioredis-mock)
  it('the rate limit store counts exactly on the real service: fixed and sliding, 50 at once, give-back, and shared by two store objects', async () => {
    const { RedisRateLimitStore } = require('../src/services/rateLimitStore');
    for (const algorithm of ['fixed', 'sliding']) {
      const a = new RedisRateLimitStore({ name: 'live-' + algorithm, algorithm }); a.init({ windowMs: 60000 });
      const b = new RedisRateLimitStore({ name: 'live-' + algorithm, algorithm }); b.init({ windowMs: 60000 });
      const hits = await Promise.all(Array.from({ length: 50 }, (_, i) => (i % 2 ? a : b).increment('ip')));
      assert.deepEqual(hits.map((h) => h.totalHits).sort((x, y) => x - y), Array.from({ length: 50 }, (_, i) => i + 1), algorithm);
      await a.decrement('ip');
      assert.equal((await b.increment('ip')).totalHits, 50, algorithm + ': one hit was given back');
      assert.ok((await redis.getRedis().pttl(a.key('ip'))) > 0, algorithm + ': the key has an expiry');
    }
  });

  it('the lock is taken by one, released only by its holder, and the event counter counts a window', async () => {
    const { acquireLock, recentCount, recordEvent } = require('../src/services/lock');
    const first = await acquireLock('live', 'u1', 30000);
    assert.ok(first);
    assert.equal(await acquireLock('live', 'u1', 30000), null);
    await first.release();
    const again = await acquireLock('live', 'u1', 30000);
    assert.ok(again);
    await again.release();
    await recordEvent('live-junk', 'u1', 30000); await recordEvent('live-junk', 'u1', 30000);
    assert.equal(await recentCount('live-junk', 'u1', 30000), 2);
  });
});
