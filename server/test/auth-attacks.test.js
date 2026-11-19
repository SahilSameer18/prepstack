// Attack-style checks on login sessions, written from a security review (docs/research/SECURITY_REVIEW.md). They add to auth.test.js,
// login-lock.test.js and cors-health.test.js: races, cross-site requests, stolen identifiers, injection and oversize input.
// Each test describes what an attacker tries and what must be true afterwards.
const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

let User, PasswordReset;
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const sessionsOf = async (email) => (await User.findOne({ email }).lean()).refreshTokens;
const EVIL = { Origin: 'https://evil.example' };
const refreshWith = (refreshToken) => t.api.post('/api/auth/refresh', { cookies: { refreshToken } });
const me = (accessToken) => t.api.get('/api/auth/current-user', { cookies: { accessToken } });

describe('attack scenarios against sessions and login', () => {
  before(async () => { await t.start(); ({ User } = t.getModels()); PasswordReset = t.mongoose.model('PasswordReset'); });
  after(() => t.stop());

  it('20 refreshes with the same token at the same moment: no server error, exactly one rotation, the session survives', async () => {
    const acct = await t.register();
    const first = acct.cookies.refreshToken;
    const responses = await Promise.all(Array.from({ length: 20 }, () => refreshWith(first)));
    assert.ok(responses.every((r) => r.status === 200), 'inside the grace window every caller gets an access token: ' + responses.map((r) => r.status).join(','));
    const rotated = responses.map((r) => t.parseCookies(r).refreshToken).filter(Boolean);
    assert.equal(rotated.length, 1, 'only the winner is handed a new refresh token');
    assert.equal((await sessionsOf(acct.email)).length, 1);
    assert.equal((await refreshWith(rotated[0])).status, 200, 'the winner keeps working');
  });

  it('a request from another website (foreign or null Origin) cannot log out, revoke, change a password or delete the account', async () => {
    const acct = await t.register();
    const other = await t.login(acct);
    const sid = jwt.decode(other.cookies.accessToken).sid;
    const attempts = [
      ['post', '/api/auth/logout'], ['post', '/api/auth/logout-all'], ['post', '/api/auth/refresh'],
      ['del', `/api/auth/sessions/${sid}`],
      ['put', '/api/user/change-password', { currentPassword: acct.password, newPassword: 'Another1Pass' }],
      ['del', '/api/user/account', { password: acct.password }],
    ];
    for (const origin of ['https://evil.example', 'null']) {
      for (const [method, path, body] of attempts) {
        const res = await t.api[method](path, { cookies: acct.cookies, body, headers: { Origin: origin } });
        assert.equal(res.status, 403, `${method} ${path} from ${origin}`);
      }
    }
    assert.equal((await sessionsOf(acct.email)).length, 2, 'both sessions are still there');
    assert.equal((await me(acct.cookies.accessToken)).status, 200);
    assert.ok(await User.exists({ email: acct.email }), 'the account still exists');
  });

  it('a token for user A carrying user B\'s session id is refused (the session must belong to the same user)', async () => {
    const a = await t.register();
    const b = await t.register();
    const sidOfB = jwt.decode(b.cookies.accessToken).sid;
    const forged = jwt.sign({ id: a.id, username: 'x', sid: sidOfB }, process.env.ACCESS_SECRET, { expiresIn: '15m' }); // only possible if the secret leaks
    assert.equal((await me(forged)).status, 401);
  });

  it('user B cannot revoke or even see user A\'s session by guessing its id', async () => {
    const a = await t.register();
    const b = await t.register();
    const sidOfA = jwt.decode(a.cookies.accessToken).sid;
    const res = await t.api.del(`/api/auth/sessions/${sidOfA}`, { cookies: b.cookies });
    assert.equal(res.status, 404);
    assert.equal((await me(a.cookies.accessToken)).status, 200);
    const list = await t.api.get('/api/auth/sessions', { cookies: b.cookies });
    assert.ok(!JSON.stringify(list.body).includes(sidOfA));
  });

  it('operator objects instead of strings (NoSQL injection) are refused with a validation error, never a 500 or a login', async () => {
    const acct = await t.register();
    const attempts = [
      ['/api/auth/login', { email: { $gt: '' }, password: { $gt: '' } }],
      ['/api/auth/login', { email: acct.email, password: { $ne: null } }],
      ['/api/auth/forgot-password', { email: { $ne: null } }],
      ['/api/auth/reset-password', { token: { $ne: null }, password: 'Fresh1Password' }],
      ['/api/auth/google', { idToken: { $ne: null } }],
    ];
    for (const [path, body] of attempts) {
      const res = await t.api.post(path, { body });
      assert.ok([400, 422].includes(res.status), `${path} answered ${res.status}`);
      assert.ok(!res.headers['set-cookie'], 'no session started');
    }
  });

  it('a password reset link used by 6 requests at once works exactly once, and signs every device out', async () => {
    const acct = await t.register();
    const second = await t.login(acct);
    const user = await User.findOne({ email: acct.email });
    const token = crypto.randomBytes(32).toString('hex');
    await PasswordReset.create({ user: user._id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 3600000) });
    const results = await Promise.all(Array.from({ length: 6 }, (_, i) => t.api.post('/api/auth/reset-password', { body: { token, password: `Fresh${i}Password` } })));
    assert.equal(results.filter((r) => r.status === 200).length, 1);
    assert.ok(results.filter((r) => r.status !== 200).every((r) => r.status === 400), 'the others get "invalid or expired", not a 500');
    assert.equal((await sessionsOf(acct.email)).length, 0);
    for (const c of [acct.cookies, second.cookies]) assert.equal((await me(c.accessToken)).status, 401);
  });

  it('a reset token from one account cannot reset another, and a made-up token resets nothing', async () => {
    const a = await t.register();
    const b = await t.register();
    const userA = await User.findOne({ email: a.email });
    const token = crypto.randomBytes(32).toString('hex');
    await PasswordReset.create({ user: userA._id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 3600000) });
    assert.equal((await t.api.post('/api/auth/reset-password', { body: { token: crypto.randomBytes(32).toString('hex'), password: 'Fresh1Password' } })).status, 400);
    assert.equal((await t.api.post('/api/auth/reset-password', { body: { token, password: 'Fresh1Password' } })).status, 200);
    assert.equal((await t.login(b)).res.status, 200, 'the other account is untouched');
  });

  it('a malformed JSON body is a client error (400), and a body over the size limit is 413, not a server error', async () => {
    const bad = await t.api.post('/api/auth/login', { body: '{bad', headers: { 'Content-Type': 'application/json' } });
    assert.equal(bad.status, 400, 'malformed JSON answered ' + bad.status);
    const huge = await t.api.post('/api/auth/login', { body: { email: 'a@example.com', password: 'x'.repeat(300000) } });
    assert.equal(huge.status, 413, 'an oversize body answered ' + huge.status);
  });
});
