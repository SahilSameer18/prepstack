// The "one at a time" locks and the short-window counter (src/shared/infra/lock.js, phase 5). The Lua release script runs for real (ioredis-mock).
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const RedisMock = require('ioredis-mock');
const redisConfig = require('../src/shared/config/redis');
const { acquireLock, recentCount, recordEvent, resetLocalState } = require('../src/shared/infra/lock');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('locks', () => {
  let redis;
  let quiet;
  beforeEach(async () => { redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); resetLocalState(); quiet = console.log; console.log = () => {}; });
  afterEach(() => { redisConfig.setRedisForTests(null); resetLocalState(); console.log = quiet; });
  const key = (name, id) => redisConfig.redisKey('lock', name, id);

  it('one holder at a time; the next can take it after release', async () => {
    const first = await acquireLock('project', 'u1', 5000);
    assert.ok(first);
    assert.equal(await acquireLock('project', 'u1', 5000), null);
    await first.release();
    assert.ok(await acquireLock('project', 'u1', 5000));
  });

  it('20 callers at once: exactly one gets it', async () => {
    const results = await Promise.all(Array.from({ length: 20 }, () => acquireLock('analyzer', 'u1', 5000)));
    assert.equal(results.filter(Boolean).length, 1);
  });

  it('locks of different names or users do not block each other', async () => {
    assert.ok(await acquireLock('project', 'u1', 5000));
    assert.ok(await acquireLock('project', 'u2', 5000));
    assert.ok(await acquireLock('analyzer', 'u1', 5000));
  });

  it('expires by itself, so a crashed holder cannot block for ever, and the key has an expiry', async () => {
    assert.ok(await acquireLock('project', 'u1', 150));
    assert.ok((await redis.pttl(key('project', 'u1'))) > 0);
    assert.equal(await acquireLock('project', 'u1', 150), null);
    await sleep(200);
    assert.ok(await acquireLock('project', 'u1', 150));
  });

  it('releases only its own lock: a slow holder whose lock expired must not delete the new holder\'s lock', async () => {
    const slow = await acquireLock('project', 'u1', 100);
    await sleep(150); // the slow holder's lock has expired
    const next = await acquireLock('project', 'u1', 5000);
    assert.ok(next);
    await slow.release(); // must do nothing
    assert.equal(await acquireLock('project', 'u1', 5000), null, "the new holder's lock is still there");
    await next.release();
    assert.ok(await acquireLock('project', 'u1', 5000));
  });

  it('a lock taken by another server (a key in Redis) is respected', async () => {
    await redis.set(key('project', 'u9'), 'another-server', 'PX', 5000);
    assert.equal(await acquireLock('project', 'u9', 5000), null);
  });

  it('works in memory without Redis, and when Redis fails', async () => {
    for (const broken of [null, Object.assign(new RedisMock(), { set: async () => { throw new Error('connection lost'); } })]) {
      redisConfig.setRedisForTests(broken);
      resetLocalState();
      const first = await acquireLock('project', 'u1', 5000);
      assert.ok(first);
      assert.equal(await acquireLock('project', 'u1', 5000), null);
      await first.release();
      assert.ok(await acquireLock('project', 'u1', 5000));
    }
  });

  it('in memory the lock also expires, and an old release does not free a newer lock', async () => {
    redisConfig.setRedisForTests(null);
    const slow = await acquireLock('project', 'u1', 60);
    await sleep(90);
    const next = await acquireLock('project', 'u1', 5000);
    assert.ok(next);
    await slow.release();
    assert.equal(await acquireLock('project', 'u1', 5000), null);
  });
});

describe('events in the last window', () => {
  let redis;
  beforeEach(async () => { redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); resetLocalState(); });
  afterEach(() => { redisConfig.setRedisForTests(null); resetLocalState(); });

  it('counts events per name and user, and forgets the old ones', async () => {
    assert.equal(await recentCount('junk', 'u1', 300), 0);
    await recordEvent('junk', 'u1', 300); await recordEvent('junk', 'u1', 300);
    await recordEvent('junk', 'u2', 300);
    assert.equal(await recentCount('junk', 'u1', 300), 2);
    assert.equal(await recentCount('junk', 'u2', 300), 1);
    assert.equal(await recentCount('other', 'u1', 300), 0);
    await sleep(350);
    assert.equal(await recentCount('junk', 'u1', 300), 0);
  });

  it('is shared through Redis, and every key has an expiry', async () => {
    await recordEvent('junk', 'u1', 5000);
    assert.equal(await redis.zcard(redisConfig.redisKey('events', 'junk', 'u1')), 1);
    assert.ok((await redis.pttl(redisConfig.redisKey('events', 'junk', 'u1'))) > 0);
  });

  it('works in memory without Redis', async () => {
    redisConfig.setRedisForTests(null);
    await recordEvent('junk', 'u1', 300); await recordEvent('junk', 'u1', 300);
    assert.equal(await recentCount('junk', 'u1', 300), 2);
    await sleep(350);
    assert.equal(await recentCount('junk', 'u1', 300), 0);
  });
});
