// The in-process cache in front of Redis (level 1, src/services/cache.js): it works with Redis off, shares one load between identical requests,
// never caches errors or unsafe keys, stays bounded, and spares Redis a round trip when it has the answer.
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const redisConfig = require('../src/config/redis');
const { FakeRedis } = require('./helpers/fake-redis');
const { cached, resetMemoryCache } = require('../src/services/cache');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const counter = (value) => { const f = async () => { f.calls += 1; return typeof value === 'function' ? value() : value; }; f.calls = 0; return f; };

describe('level 1: the in-process cache', () => {
  beforeEach(() => { process.env.CACHE_MEMORY_SECONDS = '60'; redisConfig.setRedisForTests(null); resetMemoryCache(); });
  afterEach(() => { process.env.CACHE_MEMORY_SECONDS = '0'; redisConfig.setRedisForTests(null); resetMemoryCache(); });

  it('works without Redis: the loader runs once, then the answer comes from memory', async () => {
    const loader = counter({ a: 1 });
    assert.deepEqual(await cached(['content', 'x'], loader), { a: 1 });
    assert.deepEqual(await cached(['content', 'x'], loader), { a: 1 });
    assert.equal(loader.calls, 1);
  });

  it('25 identical requests at once share one load', async () => {
    const loader = counter(async () => { await sleep(60); return { big: true }; });
    const results = await Promise.all(Array.from({ length: 25 }, () => cached(['content', 'hot'], loader)));
    assert.equal(loader.calls, 1);
    assert.ok(results.every((r) => r.big));
  });

  it('keeps an answer for at most CACHE_MEMORY_SECONDS, then loads again', async () => {
    process.env.CACHE_MEMORY_SECONDS = '1';
    const loader = counter(1);
    await cached(['content', 'x'], loader, { ttlSeconds: 600 });
    await cached(['content', 'x'], loader, { ttlSeconds: 600 });
    assert.equal(loader.calls, 1);
    await sleep(1200);
    await cached(['content', 'x'], loader, { ttlSeconds: 600 });
    assert.equal(loader.calls, 2);
  });

  it('CACHE_MEMORY_SECONDS=0 turns it off', async () => {
    process.env.CACHE_MEMORY_SECONDS = '0';
    const loader = counter(1);
    await cached(['content', 'x'], loader);
    await cached(['content', 'x'], loader);
    assert.equal(loader.calls, 2);
  });

  it('a loader error reaches every waiting caller, is not kept, and the next call tries again', async () => {
    const failure = new Error('database down');
    const loader = counter(async () => { await sleep(30); throw failure; });
    const settled = await Promise.allSettled([cached(['content', 'x'], loader), cached(['content', 'x'], loader)]);
    assert.ok(settled.every((s) => s.status === 'rejected' && s.reason === failure));
    assert.equal(loader.calls, 1);
    const ok = counter(5);
    assert.equal(await cached(['content', 'x'], ok), 5);
  });

  it('"not found" (null) is kept briefly, and unsafe keys and oversized values are never kept', async () => {
    const none = counter(null);
    assert.equal(await cached(['content', 'gone'], none), null);
    assert.equal(await cached(['content', 'gone'], none), null);
    assert.equal(none.calls, 1);
    const bad = counter(1);
    await cached(['content', 'Blind-75'], bad); await cached(['content', 'Blind-75'], bad);
    assert.equal(bad.calls, 2, 'a key that is not a plain word is not cached');
    const big = counter('x'.repeat(5000));
    await cached(['content', 'big'], big, { maxBytes: 1000 }); await cached(['content', 'big'], big, { maxBytes: 1000 });
    assert.equal(big.calls, 2);
  });

  it('stays bounded: past 300 entries the oldest are dropped', async () => {
    const first = counter('first');
    await cached(['content', 'k0'], first);
    for (let i = 1; i <= 305; i += 1) await cached(['content', `k${i}`], counter(i));
    await cached(['content', 'k0'], first);
    assert.equal(first.calls, 2, 'the oldest entry was evicted');
    const newest = counter('x');
    await cached(['content', 'k305'], newest);
    assert.equal(newest.calls, 0, 'a recent entry is still there');
  });

  it('spares Redis a round trip when memory has the answer, and still fills memory from Redis', async () => {
    const fake = new FakeRedis();
    let reads = 0;
    const get = fake.get.bind(fake);
    fake.get = async (key) => { reads += 1; return get(key); };
    redisConfig.setRedisForTests(fake);
    const loader = counter({ v: 1 });
    await cached(['content', 'x'], loader);
    const afterFirst = reads;
    await cached(['content', 'x'], loader);
    assert.equal(reads, afterFirst, 'the second call never touched Redis');
    resetMemoryCache(); // a new server process: memory is empty but Redis has it
    await cached(['content', 'x'], loader);
    assert.equal(loader.calls, 1, 'answered from Redis, not from the database');
  });
});
