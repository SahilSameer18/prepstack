// The session cache in the auth middleware (src/shared/infra/sessionCache.js, phase 6 R3). The harness turns it off; here it is on.
// The rule under test: caching may save MongoDB reads, but a revoked session must stop working at once on this server, whatever was cached.
const t = require('./helpers/setup');
const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const RedisMock = require('ioredis-mock');
const redisConfig = require('../src/shared/config/redis');
const { sessionFor, invalidateUser, resetSessionCache } = require('../src/shared/infra/sessionCache');

let User;
let lookups = 0; // MongoDB reads made by the auth middleware
const realFindOne = () => User.findOne;
let original;
const me = (acct) => t.api.get('/api/auth/current-user', { cookies: { accessToken: acct.cookies.accessToken } });
const waitForFill = () => new Promise((r) => setTimeout(r, 25)); // the Redis write is not awaited by the request

before(async () => {
  await t.start();
  Object.assign(process.env, { EMAIL_PROVIDER: 'brevo', EMAIL_FROM: 'PrepStack <sender@example.test>', BREVO_SMTP_LOGIN: 'fake-login@smtp-brevo.test', BREVO_SMTP_KEY: 'fake-smtp-key', CLIENT_URL: 'http://client.test' });
  ({ User } = t.getModels());
  original = realFindOne();
  User.findOne = function (filter, ...rest) { if (filter && filter.refreshTokens && filter.refreshTokens.$elemMatch) lookups += 1; return original.call(this, filter, ...rest); };
});
after(() => { User.findOne = original; for (const k of ['EMAIL_PROVIDER', 'EMAIL_FROM', 'BREVO_SMTP_LOGIN', 'BREVO_SMTP_KEY', 'CLIENT_URL']) delete process.env[k]; return t.stop(); });

describe('session cache in the auth middleware', () => {
  let redis;
  beforeEach(async () => { process.env.SESSION_CACHE = 'on'; redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); resetSessionCache(); lookups = 0; });
  afterEach(() => { process.env.SESSION_CACHE = 'off'; redisConfig.setRedisForTests(null); resetSessionCache(); });

  it('reads MongoDB once for many requests of one session', async () => {
    const acct = await t.register();
    for (let i = 0; i < 10; i += 1) assert.equal((await me(acct)).status, 200);
    assert.equal(lookups, 1);
  });

  it('with the cache off every request reads MongoDB', async () => {
    process.env.SESSION_CACHE = 'off';
    const acct = await t.register();
    for (let i = 0; i < 4; i += 1) await me(acct);
    assert.equal(lookups, 4);
  });

  it('stores no token, hash or email in Redis', async () => {
    const acct = await t.register();
    await me(acct); await waitForFill();
    const keys = await redis.keys('*session*');
    assert.ok(keys.length >= 1);
    for (const key of keys) {
      const value = String(await redis.get(key));
      for (const secret of [acct.cookies.accessToken, acct.cookies.refreshToken, acct.email, 'tokenHash', 'password']) assert.ok(!value.includes(secret), key);
    }
  });

  it('another server copy (empty memory) answers from Redis without reading MongoDB', async () => {
    const acct = await t.register();
    await me(acct); await waitForFill();
    resetSessionCache(); lookups = 0; // a second copy: nothing in memory, the same Redis
    assert.equal((await me(acct)).status, 200);
    assert.equal(lookups, 0);
  });

  it('works with Redis off (memory only) and when Redis fails', async () => {
    redisConfig.setRedisForTests(null);
    const acct = await t.register();
    await me(acct); await me(acct);
    assert.equal(lookups, 1);
    const broken = Object.assign(new RedisMock(), { mget: async () => { throw new Error('down'); }, eval: async () => { throw new Error('down'); } });
    redisConfig.setRedisForTests(broken); resetSessionCache(); lookups = 0;
    assert.equal((await me(acct)).status, 200);
    assert.equal(lookups, 1, 'fell through to MongoDB');
  });

  // ---- every way a session ends: the old access token must be refused immediately, although it was cached ----
  describe('a cached session stops working at once after', () => {
    it('logout', async () => {
      const acct = await t.register(); await me(acct);
      assert.equal((await t.api.post('/api/auth/logout', { cookies: acct.cookies })).status, 200);
      assert.equal((await me(acct)).status, 401);
    });
    it('logout-all (every device)', async () => {
      const acct = await t.register(); const other = await t.login(acct);
      await me(acct); await me(other);
      assert.equal((await t.api.post('/api/auth/logout-all', { cookies: acct.cookies })).status, 200);
      assert.equal((await me(acct)).status, 401);
      assert.equal((await me(other)).status, 401);
    });
    it('revoking one session from another device', async () => {
      const acct = await t.register(); const other = await t.login(acct);
      await me(acct); await me(other);
      const sid = JSON.parse(Buffer.from(acct.cookies.accessToken.split('.')[1], 'base64url')).sid;
      assert.equal((await t.api.del(`/api/auth/sessions/${sid}`, { cookies: other.cookies })).status, 200);
      assert.equal((await me(acct)).status, 401);
      assert.equal((await me(other)).status, 200, 'the revoking device stays signed in');
    });
    it('a password change (other devices only)', async () => {
      const acct = await t.register(); const other = await t.login(acct);
      await me(acct); await me(other);
      assert.equal((await t.api.put('/api/user/change-password', { cookies: other.cookies, body: { currentPassword: acct.password, newPassword: 'ChangedInSettings1' } })).status, 200);
      assert.equal((await me(acct)).status, 401);
      assert.equal((await me(other)).status, 200);
    });
    it('a password reset by email', async () => {
      const acct = await t.register(); await me(acct);
      assert.equal((await t.api.post('/api/auth/forgot-password', { body: { email: acct.email } })).status, 200);
      const token = (t.mail.sent.at(-1).text.match(/token=([a-f0-9]{64})/) || [])[1];
      assert.equal((await t.api.post('/api/auth/reset-password', { body: { token, password: 'BrandNew1pass' } })).status, 200);
      assert.equal((await me(acct)).status, 401);
    });
    it('a replayed refresh token (the whole session is deleted)', async () => {
      const acct = await t.register();
      const first = acct.cookies.refreshToken;
      const rotated = t.parseCookies(await t.api.post('/api/auth/refresh', { cookies: { refreshToken: first } }));
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: { accessToken: rotated.accessToken } })).status, 200);
      await User.updateOne({ email: acct.email }, { $set: { 'refreshTokens.$[].rotatedAt': new Date(Date.now() - 11_000) } });
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: first } })).status, 403);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: { accessToken: rotated.accessToken } })).status, 401);
    });
    it('deleting the account', async () => {
      const acct = await t.register(); await me(acct);
      assert.equal((await t.api.del('/api/user/account', { cookies: acct.cookies, body: { password: acct.password } })).status, 200);
      assert.equal((await me(acct)).status, 401);
    });
  });

  it('a changed study calendar is read again (not kept from the cache)', async () => {
    const acct = await t.register(); await me(acct);
    await me(acct); assert.equal(lookups, 1);
    const body = { type: 'calendar', timeZone: 'America/Los_Angeles', dayStartHour: 4 };
    const preview = await t.api.post('/api/plan/lifecycle/preview', { cookies: acct.cookies, body });
    assert.equal(preview.status, 200, JSON.stringify(preview.body));
    assert.equal((await t.api.post('/api/plan/lifecycle/apply', { cookies: acct.cookies, body: { ...body, checksum: preview.body.data.checksum } })).status, 200);
    const before = lookups;
    await me(acct);
    assert.equal(lookups, before + 1, 'read again after the change');
    await me(acct);
    assert.equal(lookups, before + 1, 'and cached again');
  });

  it('the session ending by time is honoured: a cached answer never outlives the session', async () => {
    const acct = await t.register(); await me(acct);
    await User.updateOne({ email: acct.email }, { $set: { 'refreshTokens.$[].expiresAt': new Date(Date.now() - 1000) } });
    resetSessionCache(); await redis.flushall(); // memory cleared as after the cache time passed
    assert.equal((await me(acct)).status, 401);
  });
});

describe('sessionFor and invalidateUser (unit)', () => {
  let redis;
  const entry = { studyTimeZone: 'Asia/Kolkata', studyDayStart: 0 };
  const loaderOf = (value, calls) => async () => { calls.n += 1; return value; };
  beforeEach(async () => { process.env.SESSION_CACHE = 'on'; redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); resetSessionCache(); });
  afterEach(() => { process.env.SESSION_CACHE = 'off'; redisConfig.setRedisForTests(null); resetSessionCache(); });

  it('an inactive session (null) is never cached', async () => {
    const calls = { n: 0 };
    assert.equal(await sessionFor('u1', 's1', loaderOf(null, calls)), null);
    assert.equal(await sessionFor('u1', 's1', loaderOf(null, calls)), null);
    assert.equal(calls.n, 2);
  });

  it('a revoke that happens while MongoDB is being read wins: the old answer is not cached (this process and Redis)', async () => {
    const calls = { n: 0 };
    const slow = async () => { calls.n += 1; await invalidateUser('u1'); return { entry, expiresAt: Date.now() + 60000 }; };
    assert.deepEqual(await sessionFor('u1', 's1', slow), entry); // this request itself saw the old state
    await waitForFill();
    assert.equal(await sessionFor('u1', 's1', loaderOf(null, calls)), null, 'the next request reads MongoDB again');
    assert.equal(calls.n, 2);
  });

  it('the Redis entry is invalid after a version bump, even before it expires (another copy)', async () => {
    const calls = { n: 0 };
    await sessionFor('u1', 's1', loaderOf({ entry, expiresAt: Date.now() + 60000 }, calls)); await waitForFill();
    await invalidateUser('u1'); // bumps the version; this process's memory is cleared too
    assert.equal(await sessionFor('u1', 's1', loaderOf(null, calls)), null);
  });

  it('another user is not affected by a revoke', async () => {
    const calls = { n: 0 };
    await sessionFor('u1', 's1', loaderOf({ entry, expiresAt: Date.now() + 60000 }, calls));
    await sessionFor('u2', 's2', loaderOf({ entry, expiresAt: Date.now() + 60000 }, calls));
    await invalidateUser('u1');
    assert.deepEqual(await sessionFor('u2', 's2', loaderOf(null, calls)), entry);
  });

  it('Redis entry lives no longer than the session or 30 s, and the memory entry no longer than 5 s', async (ctx) => {
    ctx.mock.timers.enable({ apis: ['Date'], now: 1_000_000 });
    const calls = { n: 0 };
    await sessionFor('u1', 's1', loaderOf({ entry, expiresAt: 1_000_000 + 2000 }, calls)); // the session ends in 2 s
    await waitForFill();
    const [key] = await redis.keys('*session:u1:s1*');
    const ttl = await redis.pttl(key);
    assert.ok(ttl > 0 && ttl <= 2000, `ttl ${ttl}`);
    ctx.mock.timers.tick(2500);
    assert.equal(await sessionFor('u1', 's1', loaderOf(null, calls)), null, 'after the session ended nothing answers for it');
    await sessionFor('u3', 's3', loaderOf({ entry, expiresAt: 1_000_000 + 600000 }, calls));
    ctx.mock.timers.tick(5100);
    assert.equal(calls.n, 3);
    await sessionFor('u3', 's3', loaderOf({ entry, expiresAt: 1_000_000 + 600000 }, calls)); // memory entry gone, Redis still has it
    assert.equal(calls.n, 3, 'served from Redis');
  });
});
