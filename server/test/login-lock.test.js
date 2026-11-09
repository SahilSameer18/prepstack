const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

let User;
const wrong = (email) => t.api.post('/api/auth/login', { body: { email, password: 'WrongPass1' } }); // each call gets a new IP
const failWrong = async (email, n) => { for (let i = 0; i < n; i++) await wrong(email); };
const doc = (email) => User.findOne({ email }).lean();
const MIN = 60 * 1000;
let gn = 0;
const googleLogin = (payload) => t.api.post('/api/auth/google', { body: { idToken: t.google.token(payload) } });

describe('Per-account login lock (10 wrong passwords in 15 minutes)', () => {
  before(async () => { await t.start(); ({ User } = t.getModels()); });
  after(() => t.stop());

  it('locks the account on the 11th attempt even when every guess comes from a different address', async () => {
    const acct = await t.register();
    for (let i = 0; i < 10; i++) assert.equal((await wrong(acct.email)).status, 401);
    const eleventh = await wrong(acct.email);
    assert.equal(eleventh.status, 429);
    assert.match(eleventh.body.message, /Too many failed attempts on this account\. Please try again in \d+ minutes?\./);
  });

  it('refuses the CORRECT password while locked, and starts no session', async () => {
    const acct = await t.register();
    await failWrong(acct.email, 10);
    const before = (await doc(acct.email)).refreshTokens.length;
    const { res, cookies } = await t.login(acct);
    assert.equal(res.status, 429);
    assert.ok(!cookies.accessToken && !cookies.refreshToken);
    assert.equal((await doc(acct.email)).refreshTokens.length, before);
    // the answer is the same whether the guess was right or wrong (nothing to learn from it)
    assert.equal(res.body.message, (await wrong(acct.email)).body.message);
  });

  it('keeps the response time like a normal attempt (does the same password work while locked)', async () => {
    const acct = await t.register();
    await failWrong(acct.email, 10);
    const spy = require('node:test').mock.method(bcrypt, 'compare');
    try {
      await wrong(acct.email);
      assert.equal(spy.mock.callCount(), 1);
    } finally { spy.mock.restore(); }
  });

  it('does not lock at 9 wrong passwords', async () => {
    const acct = await t.register();
    await failWrong(acct.email, 9);
    assert.equal((await doc(acct.email)).loginFailures.count, 9);
    assert.equal((await t.login(acct)).res.status, 200);
  });

  it('a lock ends after 15 minutes and a correct password then works and clears the counter', async () => {
    const acct = await t.register();
    await failWrong(acct.email, 10);
    assert.equal((await t.login(acct)).res.status, 429);
    // move the clock forward by moving the stored times back
    await User.updateOne({ email: acct.email }, { $set: { 'loginFailures.lockedUntil': new Date(Date.now() - MIN), 'loginFailures.windowStart': new Date(Date.now() - 20 * MIN) } });
    assert.equal((await t.login(acct)).res.status, 200);
    assert.equal((await doc(acct.email)).loginFailures, undefined);
  });

  it('a successful login resets the count, so the next 9 wrong passwords do not lock', async () => {
    const acct = await t.register();
    await failWrong(acct.email, 6);
    assert.equal((await t.login(acct)).res.status, 200);
    assert.equal((await doc(acct.email)).loginFailures, undefined);
    await failWrong(acct.email, 9);
    assert.equal((await t.login(acct)).res.status, 200);
  });

  it('failures older than 15 minutes stop counting', async () => {
    const acct = await t.register();
    await failWrong(acct.email, 9);
    await User.updateOne({ email: acct.email }, { $set: { 'loginFailures.windowStart': new Date(Date.now() - 16 * MIN) } });
    assert.equal((await wrong(acct.email)).status, 401); // would have been the 10th
    const f = (await doc(acct.email)).loginFailures;
    assert.equal(f.count, 1);
    assert.ok(!f.lockedUntil);
    assert.equal((await wrong(acct.email)).status, 401);
  });

  it('counts every guess when many arrive at the same moment (the counter is atomic)', async () => {
    const acct = await t.register();
    const results = await Promise.all(Array.from({ length: 15 }, () => wrong(acct.email)));
    assert.ok(results.every((r) => r.status === 401), 'all were checked before the first one locked the account');
    const f = (await doc(acct.email)).loginFailures;
    assert.equal(f.count, 15);
    assert.ok(f.lockedUntil > new Date());
    assert.equal((await wrong(acct.email)).status, 429);
  });

  it('locking one account does not touch another, and unknown emails are never counted', async () => {
    const a = await t.register();
    const b = await t.register();
    await failWrong(a.email, 10);
    assert.equal((await t.login(a)).res.status, 429);
    assert.equal((await t.login(b)).res.status, 200);
    const before = await User.countDocuments();
    for (let i = 0; i < 12; i++) assert.equal((await wrong('nobody.at.all@example.com')).status, 401);
    assert.equal(await User.countDocuments(), before);
  });

  it('devices that are already logged in keep working, and token refresh still works, during a lock', async () => {
    const acct = await t.register();
    await failWrong(acct.email, 10);
    assert.equal((await t.api.get('/api/auth/current-user', { cookies: acct.cookies })).status, 200);
    const refreshed = await t.api.post('/api/auth/refresh', { cookies: acct.cookies });
    assert.equal(refreshed.status, 200);
  });

  it('Google sign-in still works during a lock', async () => {
    const acct = await t.register();
    gn++;
    const g = { email: acct.email, sub: `lock-google-sub-${gn}`, name: 'Lock Tester' };
    const linked = await t.api.post('/api/auth/link-google', { cookies: acct.cookies, body: { idToken: t.google.token(g) } });
    assert.equal(linked.status, 200);
    await failWrong(acct.email, 10);
    assert.equal((await t.login(acct)).res.status, 429);
    assert.equal((await googleLogin(g)).status, 200);
  });

  it('never exposes the counter or lock time in any response', async () => {
    const acct = await t.register();
    await failWrong(acct.email, 4);
    const ok = await t.login(acct);
    const stored = await User.updateOne({ email: acct.email }, { $set: { loginFailures: { count: 3, windowStart: new Date(), lockedUntil: new Date(Date.now() + MIN) } } });
    assert.equal(stored.modifiedCount, 1);
    const me = await t.api.get('/api/auth/current-user', { cookies: ok.cookies });
    const sessions = await t.api.get('/api/auth/sessions', { cookies: ok.cookies });
    const locked = await wrong(acct.email);
    const profile = await t.api.put('/api/user/profile', { cookies: ok.cookies, body: { username: `renamed${Date.now() % 100000}` } });
    for (const r of [ok.res, me, sessions, locked, profile]) {
      const text = JSON.stringify(r.body);
      assert.ok(!/loginFailures|lockedUntil|windowStart/.test(text), `leaked in ${r.status}: ${text.slice(0, 120)}`);
    }
  });
});
