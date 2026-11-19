// The cache-aside helper (src/shared/infra/cache.js, phase 4) on the fake Redis: hit and miss, expiry with jitter, the lock against a stampede,
// "not found" cached briefly, a bounded write budget and size, and every Redis failure falling through to the loader.
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { FakeRedis } = require('./helpers/fake-redis');
const redisConfig = require('../src/shared/config/redis');
process.env.CACHE_MEMORY_SECONDS = '0'; // these tests are about the Redis layer
const { cached, clearContentCache } = require('../src/shared/infra/cache');

const quiet = () => { const log = console.log; console.log = () => {}; return () => { console.log = log; }; };
const counter = (value) => { const f = async () => { f.calls += 1; return typeof value === 'function' ? value() : value; }; f.calls = 0; return f; };

describe('cache-aside', () => {
  let fake;
  let restore;
  beforeEach(() => { restore = quiet(); fake = new FakeRedis(); redisConfig.setRedisForTests(fake); });
  afterEach(() => { redisConfig.setRedisForTests(null); restore(); });
  const key = (...parts) => redisConfig.redisKey('cache', ...parts);

  it('runs the loader once on a miss, then answers from the cache', async () => {
    const loader = counter({ a: 1 });
    assert.deepEqual(await cached(['content', 'x'], loader), { a: 1 });
    assert.deepEqual(await cached(['content', 'x'], loader), { a: 1 });
    assert.equal(loader.calls, 1);
  });

  it('gives every key an expiry of the TTL plus or minus the jitter, and the loader runs again after it', async () => {
    const loader = counter(1);
    await cached(['content', 'x'], loader, { ttlSeconds: 600, jitter: 0.1 });
    const ttl = await fake.ttl(key('content', 'x'));
    assert.ok(ttl >= 540 && ttl <= 660, `ttl ${ttl}`);
    fake.advance(661 * 1000);
    await cached(['content', 'x'], loader, { ttlSeconds: 600 });
    assert.equal(loader.calls, 2);
  });

  it('spreads expiry times, so many keys do not all expire together', async () => {
    const ttls = new Set();
    for (let i = 0; i < 40; i += 1) {
      await cached(['content', `k${i}`], counter(i), { ttlSeconds: 600, jitter: 0.1, writeBudgetPerMinute: 1000 });
      ttls.add(await fake.ttl(key('content', `k${i}`)));
    }
    assert.ok(ttls.size > 5, `only ${ttls.size} distinct expiry times`);
  });

  it('caches "not found" (null) for a short time, so repeated misses do not reach the database', async () => {
    const loader = counter(null);
    assert.equal(await cached(['content', 'gone'], loader, { negativeTtlSeconds: 30 }), null);
    assert.equal(await cached(['content', 'gone'], loader), null);
    assert.equal(loader.calls, 1);
    assert.ok((await fake.ttl(key('content', 'gone'))) <= 33);
  });

  it('one request refills a missing key while the others wait for it (no stampede)', async () => {
    const loader = counter(async () => { await new Promise((r) => setTimeout(r, 80)); return { big: true }; });
    const results = await Promise.all(Array.from({ length: 25 }, () => cached(['content', 'hot'], loader)));
    assert.equal(loader.calls, 1, 'the database was read once, not 25 times');
    assert.ok(results.every((r) => r.big === true));
    assert.equal(await fake.get(key('content', 'hot') + ':lock'), null, 'the lock is released');
  });

  it('a loader error reaches the caller unchanged, is not cached, and does not leave the lock behind', async () => {
    const failure = Object.assign(new Error('database down'), { status: 503 });
    const loader = counter(() => { throw failure; });
    await assert.rejects(() => cached(['content', 'x'], loader), (error) => error === failure);
    assert.equal(loader.calls, 1, 'the loader is not run a second time because of the error');
    assert.equal(await fake.get(key('content', 'x')), null);
    assert.equal(await fake.get(key('content', 'x') + ':lock'), null);
    const ok = counter(7);
    assert.equal(await cached(['content', 'x'], ok), 7);
  });

  it('falls back to the loader when Redis is off or not connected', async () => {
    redisConfig.setRedisForTests(null);
    const loader = counter(5);
    assert.equal(await cached(['content', 'x'], loader), 5);
    assert.equal(await cached(['content', 'x'], loader), 5);
    assert.equal(loader.calls, 2);
  });

  it('falls back to the loader when a Redis command fails, whichever one', async () => {
    for (const command of ['get', 'set']) {
      const broken = new FakeRedis();
      broken[command] = async () => { throw new Error('connection lost'); };
      redisConfig.setRedisForTests(broken);
      const loader = counter({ ok: command });
      assert.deepEqual(await cached(['content', 'x'], loader), { ok: command }, `${command} failing`);
      assert.equal(loader.calls, 1);
    }
  });

  it('serves from the loader when the stored text is damaged', async () => {
    await fake.set(key('content', 'x'), '{not json');
    const loader = counter({ fresh: 1 });
    assert.deepEqual(await cached(['content', 'x'], loader), { fresh: 1 });
  });

  it('does not store a value above the size limit', async () => {
    const loader = counter('x'.repeat(2000));
    await cached(['content', 'big'], loader, { maxBytes: 1000 });
    await cached(['content', 'big'], loader, { maxBytes: 1000 });
    assert.equal(loader.calls, 2);
    assert.equal(await fake.get(key('content', 'big')), null);
  });

  it('stops storing new entries when the write budget for the minute is spent, and keeps serving', async () => {
    const stored = [];
    for (let i = 0; i < 6; i += 1) {
      const loader = counter(`value ${i}`);
      assert.equal(await cached(['preview', `k${i}`], loader, { budgetName: 'preview', writeBudgetPerMinute: 3 }), `value ${i}`);
      stored.push((await fake.get(key('preview', `k${i}`))) !== null);
    }
    assert.deepEqual(stored, [true, true, true, false, false, false]);
  });

  it('only turns plain lowercase words into keys: anything else is not cached', async () => {
    for (const bad of ['Blind-75', '../x', 'a b', 'a:b', '*', '']) {
      const loader = counter(1);
      await cached(['content', 'sheet', bad], loader);
      await cached(['content', 'sheet', bad], loader);
      assert.equal(loader.calls, 2, `"${bad}" must not be cached`);
    }
    assert.equal(fake.data.size, 0);
  });

  it('clears the content keys of every environment prefix, and only those', async () => {
    await fake.set('prepstack:development:cache:content:sheets-list', '1');
    await fake.set('prepstack:production:cache:content:notes:os', '1');
    await fake.set('prepstack:production:cache:preview:dev:abc', '1');
    await fake.set('prepstack:production:rl:login:1.2.3.4', '1');
    const result = await clearContentCache();
    assert.deepEqual(result, { cleared: 2, skipped: false });
    assert.equal(fake.data.size, 2);
    assert.ok(fake.data.has('prepstack:production:cache:preview:dev:abc'));
    assert.ok(fake.data.has('prepstack:production:rl:login:1.2.3.4'));
  });

  it('skips clearing without a Redis, and says so', async () => {
    redisConfig.setRedisForTests(null);
    delete process.env.REDIS_URL;
    assert.deepEqual(await clearContentCache(), { cleared: 0, skipped: true });
  });
});
