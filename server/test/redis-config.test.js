// The optional Redis connection (src/shared/config/redis.js, step R0) and the fake Redis the other tests will use.
// No real Redis and no network here: a closed local port stands in for "Redis is down".
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { FakeRedis } = require('./helpers/fake-redis');

const MODULE = path.join(__dirname, '..', 'src', 'shared', 'config', 'redis.js');
const SECRET = 'topsecretpassword';

// A fresh copy of the module (it keeps its connection in a variable), with the environment and the console under test control.
function load(env = {}) {
  for (const key of ['REDIS_URL', 'REDIS_PREFIX']) delete process.env[key];
  Object.assign(process.env, env);
  delete require.cache[MODULE];
  return require(MODULE);
}
function captureConsole() {
  const lines = [];
  const original = { log: console.log, warn: console.warn, error: console.error };
  for (const level of Object.keys(original)) console[level] = (...args) => lines.push(args.join(' '));
  return { lines, restore: () => Object.assign(console, original) };
}
const until = async (check, ms = 5000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (check()) return true; await new Promise((r) => setTimeout(r, 25)); }
  return false;
};

describe('the optional Redis connection', () => {
  let out;
  let redis;
  beforeEach(() => { out = captureConsole(); });
  afterEach(async () => {
    out.restore();
    await redis?.closeRedis();
    delete process.env.REDIS_URL;
    delete process.env.REDIS_PREFIX;
  });

  it('is off without REDIS_URL: no client, one clear line, and closing is harmless', async () => {
    redis = load();
    assert.equal(redis.connectRedis(), null);
    assert.equal(redis.getRedis(), null);
    assert.deepEqual(redis.redisStatus(), { state: 'disabled', error: null });
    assert.ok(out.lines.some((line) => line.startsWith('Redis: disabled')));
    await redis.closeRedis();
    await redis.closeRedis();
  });

  it('does not crash when Redis is down: it reports the error code once, answers null, and closes quickly', async () => {
    redis = load({ REDIS_URL: `redis://user:${SECRET}@127.0.0.1:1` });
    redis.connectRedis();
    assert.equal(redis.getRedis(), null, 'not connected yet');
    assert.ok(await until(() => redis.redisStatus().state === 'error'), 'the failure is noticed');
    assert.equal(redis.redisStatus().error, 'ECONNREFUSED');
    assert.equal(redis.getRedis(), null, 'callers get null and fall back to MongoDB or memory');
    await new Promise((r) => setTimeout(r, 1500)); // the background retries must not repeat the same warning
    const warnings = out.lines.filter((line) => line.startsWith('Redis: unavailable'));
    assert.equal(warnings.length, 1, warnings.join(' | '));
    const started = Date.now();
    await redis.closeRedis();
    assert.ok(Date.now() - started < 3000, 'a clean shutdown even when the connection never worked');
  });

  it('never writes the address, the user name or the password to a log', async () => {
    redis = load({ REDIS_URL: `rediss://someuser:${SECRET}@127.0.0.1:1` });
    redis.connectRedis();
    await until(() => redis.redisStatus().state === 'error');
    await redis.closeRedis();
    const text = out.lines.join('\n');
    for (const forbidden of [SECRET, 'someuser', '127.0.0.1', 'rediss://']) assert.ok(!text.includes(forbidden), `the log contains "${forbidden}"`);
  });

  it('reports a name that does not exist by its error code only', async () => {
    redis = load({ REDIS_URL: `redis://u:${SECRET}@no-such-host.invalid:6379` });
    redis.connectRedis();
    assert.ok(await until(() => redis.redisStatus().state === 'error', 10000));
    assert.match(redis.redisStatus().error, /^(ENOTFOUND|EAI_AGAIN)$/);
    assert.ok(!out.lines.join('\n').includes('no-such-host'));
  });

  it('keeps development and the live site apart with a key prefix, which can be overridden', () => {
    const original = process.env.NODE_ENV;
    try {
      delete process.env.NODE_ENV;
      assert.equal(load().redisKey('rl', 'login', '1.2.3.4'), 'prepstack:development:rl:login:1.2.3.4');
      process.env.NODE_ENV = 'production';
      assert.equal(load().redisKey('rl', 'login', '1.2.3.4'), 'prepstack:production:rl:login:1.2.3.4');
      redis = load({ REDIS_PREFIX: 'custom:' });
      assert.equal(redis.redisKey('a', 'b'), 'custom:a:b');
    } finally {
      if (original === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = original;
    }
  });

  it('can run on a stand-in client in tests, and closes it', async () => {
    redis = load();
    const fake = new FakeRedis();
    redis.setRedisForTests(fake);
    assert.equal(redis.getRedis(), fake);
    assert.equal(redis.redisStatus().state, 'ready');
    await redis.closeRedis();
    assert.equal(fake.closed, true);
    assert.equal(redis.getRedis(), null);
  });
});

describe('the fake Redis (what later steps rely on)', () => {
  it('stores, reads and deletes strings', async () => {
    const r = new FakeRedis();
    assert.equal(await r.get('a'), null);
    assert.equal(await r.set('a', 1), 'OK');
    assert.equal(await r.get('a'), '1');
    assert.equal(await r.exists('a', 'b'), 1);
    assert.equal(await r.del('a', 'b'), 1);
    assert.equal(await r.get('a'), null);
  });

  it('expires keys on its own clock (EX in seconds, PX in milliseconds)', async () => {
    const r = new FakeRedis();
    await r.set('s', 'x', 'EX', 10);
    await r.set('m', 'y', 'PX', 500);
    assert.equal(await r.ttl('s'), 10);
    r.advance(600);
    assert.equal(await r.get('m'), null);
    assert.equal(await r.get('s'), 'x');
    r.advance(9500);
    assert.equal(await r.get('s'), null);
    assert.equal(await r.ttl('s'), -2);
    await r.set('plain', 1);
    assert.equal(await r.ttl('plain'), -1);
  });

  it('SET NX only sets an absent key (the base of a lock), and a spent lock can be taken again', async () => {
    const r = new FakeRedis();
    assert.equal(await r.set('lock', 'a', 'PX', 1000, 'NX'), 'OK');
    assert.equal(await r.set('lock', 'b', 'PX', 1000, 'NX'), null);
    assert.equal(await r.get('lock'), 'a');
    r.advance(1001);
    assert.equal(await r.set('lock', 'b', 'PX', 1000, 'NX'), 'OK');
  });

  it('counts with INCR, keeps the expiry, and EXPIRE sets one', async () => {
    const r = new FakeRedis();
    assert.equal(await r.incr('n'), 1);
    assert.equal(await r.expire('n', 5), 1);
    assert.equal(await r.incr('n'), 2);
    assert.equal(await r.ttl('n'), 5);
    r.advance(5000);
    assert.equal(await r.incr('n'), 1, 'an expired counter starts again');
    assert.equal(await r.expire('missing', 5), 0);
  });
});
