// The Redis rate limit store (src/services/rateLimitStore.js, phase 5). The Lua scripts run for real here (ioredis-mock has a Lua engine),
// so these tests check the actual scripts: counting, expiry, the sliding window, giving a hit back, many callers at once, two "servers"
// sharing one Redis, and every way Redis can be missing falling back to memory.
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const RedisMock = require('ioredis-mock');
const redisConfig = require('../src/config/redis');
const { RedisRateLimitStore } = require('../src/services/rateLimitStore');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const make = (options, windowMs = 60000) => { const store = new RedisRateLimitStore(options); store.init({ windowMs }); return store; };

describe('rate limit store on Redis', () => {
  let redis;
  let quiet;
  beforeEach(async () => { redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); quiet = console.log; console.log = () => {}; delete process.env.RATE_LIMIT_MEMORY_ONLY; });
  afterEach(() => { redisConfig.setRedisForTests(null); console.log = quiet; delete process.env.RATE_LIMIT_MEMORY_ONLY; });

  describe('fixed window', () => {
    it('counts hits per client, with a reset time, and keeps clients apart', async () => {
      const store = make({ name: 'login' });
      assert.equal((await store.increment('1.1.1.1')).totalHits, 1);
      const second = await store.increment('1.1.1.1');
      assert.equal(second.totalHits, 2);
      assert.ok(second.resetTime > new Date() && second.resetTime <= new Date(Date.now() + 60001));
      assert.equal((await store.increment('2.2.2.2')).totalHits, 1);
    });

    it('starts a new window when the old one has passed', async () => {
      const store = make({ name: 'login' }, 300);
      await store.increment('a'); await store.increment('a');
      await sleep(350);
      assert.equal((await store.increment('a')).totalHits, 1);
    });

    it('every key it writes has an expiry (a client that stops coming leaves nothing behind)', async () => {
      const store = make({ name: 'login' }, 5000);
      await store.increment('a');
      const key = store.key('a');
      assert.ok((await redis.pttl(key)) > 0);
      await store.increment('a');
      await sleep(120);
      await store.increment('a');
      assert.ok((await redis.pttl(key)) < 4950, 'a later hit does not extend the window: it keeps counting down from the first hit');
    });

    it('50 callers at once get exactly 1 to 50, none twice', async () => {
      const store = make({ name: 'login' });
      const hits = await Promise.all(Array.from({ length: 50 }, () => store.increment('burst')));
      assert.deepEqual(hits.map((h) => h.totalHits).sort((a, b) => a - b), Array.from({ length: 50 }, (_, i) => i + 1));
    });

    it('gives a hit back (a request that should not count) and never goes below zero', async () => {
      const store = make({ name: 'login' });
      await store.increment('a'); await store.increment('a');
      await store.decrement('a');
      assert.equal((await store.increment('a')).totalHits, 2);
      await store.resetKey('a');
      await store.decrement('a'); await store.decrement('a');
      assert.equal((await store.increment('a')).totalHits, 1);
    });
  });

  describe('sliding window', () => {
    it('counts the requests of the last window exactly, and forgets older ones', async () => {
      const store = make({ name: 'login', algorithm: 'sliding' }, 400);
      assert.equal((await store.increment('a')).totalHits, 1);
      assert.equal((await store.increment('a')).totalHits, 2);
      await sleep(450);
      assert.equal((await store.increment('a')).totalHits, 1);
    });

    it('drops only the requests that left the window, while newer ones stay counted', async () => {
      const store = make({ name: 'login', algorithm: 'sliding' }, 400);
      await store.increment('a'); // at 0 ms
      await sleep(250);
      await store.increment('a'); // at 250 ms
      await sleep(200);
      assert.equal((await store.increment('a')).totalHits, 2, 'the first request (450 ms ago) left the window; the second and this one are inside');
    });

    it('has no burst at the edge of a window, which a fixed window does have', async () => {
      const fixed = make({ name: 'edge-fixed', algorithm: 'fixed' }, 300);
      const sliding = make({ name: 'edge-sliding', algorithm: 'sliding' }, 600);
      for (let i = 0; i < 3; i += 1) { await fixed.increment('a'); await sliding.increment('a'); }
      await sleep(350); // the fixed window has just ended; the sliding window still remembers all three
      const fixedAfter = await fixed.increment('a');
      const slidingAfter = await sliding.increment('a');
      assert.equal(fixedAfter.totalHits, 1, 'a fixed window forgets everything at its edge: up to twice the limit in a short time');
      assert.equal(slidingAfter.totalHits, 4, 'a sliding window still counts the three earlier requests');
    });

    it('reports when the oldest request leaves the window, and gives a hit back by removing the newest', async () => {
      const store = make({ name: 'login', algorithm: 'sliding' }, 5000);
      const first = await store.increment('a');
      await sleep(5);
      await store.increment('a'); await store.increment('a');
      assert.ok(Math.abs(first.resetTime.getTime() - (Date.now() + 5000)) < 200);
      await store.decrement('a');
      assert.equal((await store.increment('a')).totalHits, 3);
    });

    it('50 callers at once are all counted', async () => {
      const store = make({ name: 'login', algorithm: 'sliding' });
      const hits = await Promise.all(Array.from({ length: 50 }, () => store.increment('burst')));
      assert.equal(Math.max(...hits.map((h) => h.totalHits)), 50);
      assert.equal(new Set(hits.map((h) => h.totalHits)).size, 50);
    });

    it('every key has an expiry', async () => {
      const store = make({ name: 'login', algorithm: 'sliding' }, 5000);
      await store.increment('a');
      assert.ok((await redis.pttl(store.key('a'))) > 0);
    });
  });

  describe('shared by several servers, and across a restart', () => {
    it('two store objects (two servers) on one Redis share one count', async () => {
      const serverA = make({ name: 'login' });
      const serverB = make({ name: 'login' });
      await serverA.increment('ip'); await serverA.increment('ip');
      assert.equal((await serverB.increment('ip')).totalHits, 3);
    });

    it('a new store object (a restart) still sees the old count', async () => {
      await make({ name: 'login', algorithm: 'sliding' }).increment('ip');
      const afterRestart = make({ name: 'login', algorithm: 'sliding' });
      assert.equal((await afterRestart.increment('ip')).totalHits, 2);
    });

    it('limiters with different names do not share counts, and keys carry the environment prefix', async () => {
      const a = make({ name: 'login' });
      const b = make({ name: 'register' });
      await a.increment('ip');
      assert.equal((await b.increment('ip')).totalHits, 1);
      assert.equal(a.key('ip'), redisConfig.redisKey('rl', 'login', 'ip'));
      assert.ok(a.key('ip').startsWith('prepstack:'));
    });
  });

  describe('when Redis is missing or breaks, the app counts in memory and is never blocked', () => {
    it('without a Redis', async () => {
      redisConfig.setRedisForTests(null);
      const store = make({ name: 'login' });
      assert.equal((await store.increment('a')).totalHits, 1);
      assert.equal((await store.increment('a')).totalHits, 2);
      await store.decrement('a');
      assert.equal((await store.increment('a')).totalHits, 2);
    });

    it('when a command fails', async () => {
      const broken = new RedisMock();
      broken.eval = async () => { throw new Error('connection lost'); };
      broken.zpopmax = async () => { throw new Error('connection lost'); };
      broken.del = async () => { throw new Error('connection lost'); };
      redisConfig.setRedisForTests(broken);
      for (const algorithm of ['fixed', 'sliding']) {
        const store = make({ name: algorithm, algorithm });
        assert.equal((await store.increment('a')).totalHits, 1);
        assert.equal((await store.increment('a')).totalHits, 2);
        await store.decrement('a');
        await store.resetKey('a');
        assert.equal((await store.increment('a')).totalHits, 1, 'reset works on the memory count');
      }
    });

    it('RATE_LIMIT_MEMORY_ONLY puts the named limiters (or all) back in memory, and writes nothing to Redis', async () => {
      process.env.RATE_LIMIT_MEMORY_ONLY = 'login, register';
      const login = make({ name: 'login' });
      const refresh = make({ name: 'refresh' });
      await login.increment('a');
      await refresh.increment('a');
      assert.equal(await redis.exists(login.key('a')), 0, 'login stayed in memory');
      assert.equal(await redis.exists(refresh.key('a')), 1, 'refresh is not on the list: it uses Redis');
      process.env.RATE_LIMIT_MEMORY_ONLY = 'all';
      await refresh.increment('b');
      assert.equal(await redis.exists(refresh.key('b')), 0);
    });
  });
});
