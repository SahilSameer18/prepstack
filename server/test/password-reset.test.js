const t = require('./helpers/setup'); // email is faked: nothing is ever sent, messages are kept in t.mail.sent
const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

let User, PasswordReset;
const CLIENT = 'http://client.test';
const SENDER = 'PrepStack <sender@example.test>';
const NEW_PASSWORD = 'BrandNew1pass';
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const MIN = 60 * 1000;
let gn = 0;

const forgot = (email, opts = {}) => t.api.post('/api/auth/forgot-password', { body: { email }, ...opts });
const reset = (token, password = NEW_PASSWORD, opts = {}) => t.api.post('/api/auth/reset-password', { body: { token, password }, ...opts });
const tokenOf = (message) => (message.text.match(/token=([a-f0-9]{64})/) || [])[1];
// Ask for a reset for a real account and return the token from the (fake) email
const askFor = async (acct) => {
  const before = t.mail.sent.length;
  const res = await forgot(acct.email);
  assert.equal(res.status, 200);
  assert.equal(t.mail.sent.length, before + 1, 'one email should have been sent');
  return tokenOf(t.mail.sent.at(-1));
};
// skip the 1-minute wait (createdAt is protected in the model, so go around it)
const forget = (acct) => PasswordReset.collection.updateMany({ user: acct.userId }, { $set: { createdAt: new Date(Date.now() - 5 * MIN) } });

describe('Password reset by email (the email service is faked)', () => {
  before(async () => {
    await t.start(); ({ User, PasswordReset } = Object.assign(t.getModels(), { PasswordReset: t.mongoose.model('PasswordReset') }));
    Object.assign(process.env, { EMAIL_PROVIDER: 'brevo', EMAIL_FROM: SENDER, BREVO_SMTP_LOGIN: 'fake-login@smtp-brevo.test', BREVO_SMTP_KEY: 'fake-smtp-key', CLIENT_URL: CLIENT });
  });
  after(() => { for (const k of ['EMAIL_PROVIDER', 'EMAIL_FROM', 'BREVO_SMTP_LOGIN', 'BREVO_SMTP_KEY', 'CLIENT_URL']) delete process.env[k]; return t.stop(); });
  beforeEach(() => t.mail.reset());

  const account = async () => { const a = await t.register(); a.userId = (await User.findOne({ email: a.email }))._id; return a; };

  describe('POST /api/auth/forgot-password', () => {
    it('answers the same for a real email and an unknown one, and only emails the real one', async () => {
      const acct = await account();
      const real = await forgot(acct.email);
      assert.equal(t.mail.sent.length, 1);
      const unknown = await forgot('nobody.here@example.com');
      assert.equal(t.mail.sent.length, 1, 'no email for an unknown address');
      assert.equal(real.status, 200); assert.equal(unknown.status, 200);
      assert.deepEqual(real.body, unknown.body);
      assert.equal(real.body.message, 'If an account with that email exists, we have sent a password reset link.');
    });

    it('sends one email from the configured sender to the account, with a one-time link built from CLIENT_URL', async () => {
      const acct = await account();
      await forgot(acct.email);
      const [m] = t.mail.sent;
      assert.equal(m.to, acct.email);
      assert.equal(m.from, SENDER);
      assert.equal(m.subject, 'Reset your PrepStack password');
      const token = tokenOf(m);
      assert.match(token, /^[a-f0-9]{64}$/);
      assert.ok(m.text.includes(`${CLIENT}/reset-password?token=${token}`));
      assert.ok(m.html.includes(`${CLIENT}/reset-password?token=${token}`));
      assert.match(m.text, /1 hour/);
    });

    it('connects to Brevo with the configured login and key over TLS', async () => {
      const acct = await account();
      await forgot(acct.email);
      assert.equal(t.mail.lastOptions.host, 'smtp-relay.brevo.com');
      assert.equal(t.mail.lastOptions.port, 2525, 'not 587: Render\'s free plan blocks that port');
      assert.equal(t.mail.lastOptions.requireTLS, true);
      assert.deepEqual(t.mail.lastOptions.auth, { user: 'fake-login@smtp-brevo.test', pass: 'fake-smtp-key' });
    });

    it('stores only a hash of the token (never the token), valid for about 1 hour', async () => {
      const acct = await account();
      const token = await askFor(acct);
      const rows = await PasswordReset.find({ user: acct.userId }).lean();
      assert.equal(rows.length, 1);
      assert.equal(rows[0].tokenHash, sha256(token));
      assert.ok(!JSON.stringify(rows).includes(token), 'the raw token must not be stored');
      const ttl = rows[0].expiresAt - Date.now();
      assert.ok(ttl > 59 * MIN && ttl <= 60 * MIN + 5000, `expires in ${ttl} ms`);
    });

    it('a new link replaces the older one', async () => {
      const acct = await account();
      const first = await askFor(acct);
      await forget(acct);
      const second = await askFor(acct);
      assert.notEqual(first, second);
      assert.equal(await PasswordReset.countDocuments({ user: acct.userId }), 1);
      assert.equal((await reset(first)).status, 400, 'the older link no longer works');
      assert.equal((await reset(second)).status, 200);
    });

    it('sends at most one email per account per minute (still answers 200)', async () => {
      const acct = await account();
      await forgot(acct.email);
      const again = await forgot(acct.email);
      assert.equal(again.status, 200);
      assert.equal(t.mail.sent.length, 1);
    });

    it('a Google-only account gets a "sign in with Google" email and NO link or reset row', async () => {
      gn++;
      const g = { email: `reset-google-${gn}@example.com`, sub: `reset-google-sub-${gn}`, name: 'Reset Google' };
      const signup = await t.api.post('/api/auth/google', { body: { idToken: t.google.token(g) } });
      assert.equal(signup.status, 200);
      const res = await forgot(g.email);
      assert.equal(res.status, 200);
      assert.equal(t.mail.sent.length, 1);
      assert.match(t.mail.sent[0].text, /Continue with Google/);
      assert.ok(!/token=/.test(t.mail.sent[0].text) && !/reset-password/.test(t.mail.sent[0].html));
      const googleUser = await User.findOne({ email: g.email });
      assert.equal(await PasswordReset.countDocuments({ user: googleUser._id }), 0);
    });

    it('still answers 200 when the mail server is down (and does not crash)', async () => {
      const acct = await account();
      t.mail.error = Object.assign(new Error('connect ECONNREFUSED smtp-relay.brevo.com:2525 for ' + acct.email), { code: 'ESOCKET' });
      const logged = [];
      const original = console.error;
      console.error = (...a) => logged.push(a.join(' '));
      try {
        const res = await forgot(acct.email);
        await t.sleep(30);
        assert.equal(res.status, 200);
      } finally { console.error = original; }
      assert.deepEqual(logged, ['Password reset email failed: ESOCKET'], 'logs only an error code, never the address or the link');
    });

    it('answers 503 for everyone when email is not set up', async () => {
      const acct = await account();
      const key = process.env.BREVO_SMTP_KEY;
      delete process.env.BREVO_SMTP_KEY;
      try {
        assert.equal((await forgot(acct.email)).status, 503);
        assert.equal((await forgot('nobody@example.com')).status, 503);
        assert.equal(t.mail.sent.length, 0);
      } finally { process.env.BREVO_SMTP_KEY = key; }
    });

    it('validates the email (422)', async () => {
      assert.equal((await forgot('not-an-email')).status, 422);
      assert.equal((await t.api.post('/api/auth/forgot-password', { body: {} })).body.message, 'Email is required');
    });

    it('is rate-limited to 5 requests per address per 15 minutes, and other addresses are unaffected', async () => {
      const ip = '198.51.100.9';
      const statuses = [];
      for (let i = 0; i < 7; i++) statuses.push((await forgot('nobody.limit@example.com', { ip })).status);
      assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429, 429]);
      assert.equal((await forgot('nobody.limit@example.com')).status, 200);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('sets the new password: the new one works, the old one stops working', async () => {
      const acct = await account();
      const token = await askFor(acct);
      const res = await reset(token);
      assert.equal(res.status, 200);
      assert.equal(res.body.message, 'Your password has been updated. Please log in with your new password.');
      assert.equal((await t.api.post('/api/auth/login', { body: { email: acct.email, password: NEW_PASSWORD } })).status, 200);
      assert.equal((await t.api.post('/api/auth/login', { body: { email: acct.email, password: acct.password } })).status, 401);
    });

    it('signs out every device at once', async () => {
      const acct = await account();
      const other = await t.login(acct); // a second device
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: acct.cookies })).status, 200);
      const token = await askFor(acct);
      await reset(token);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: acct.cookies })).status, 401);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: other.cookies })).status, 401);
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: other.cookies })).status, 403, 'the old refresh token is refused');
      assert.deepEqual((await User.findById(acct.userId)).refreshTokens, []);
    });

    it('a link works only once', async () => {
      const acct = await account();
      const token = await askFor(acct);
      assert.equal((await reset(token)).status, 200);
      const again = await reset(token, 'AnotherOne2pass');
      assert.equal(again.status, 400);
      assert.equal(again.body.message, 'This reset link is invalid or has expired. Please request a new one.');
      assert.equal((await t.api.post('/api/auth/login', { body: { email: acct.email, password: NEW_PASSWORD } })).status, 200, 'the second use must not change the password');
    });

    it('two requests with the same link at the same moment: exactly one wins', async () => {
      const acct = await account();
      const token = await askFor(acct);
      const results = await Promise.all([reset(token, 'ParallelOne1a'), reset(token, 'ParallelTwo2b')]);
      assert.deepEqual(results.map((r) => r.status).sort(), [200, 400]);
    });

    it('a link expires after 1 hour', async () => {
      const acct = await account();
      const token = await askFor(acct);
      await PasswordReset.updateOne({ user: acct.userId }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
      assert.equal((await reset(token)).status, 400);
      assert.equal((await t.api.post('/api/auth/login', { body: { email: acct.email, password: acct.password } })).status, 200, 'the old password is unchanged');
    });

    it('refuses a made-up link (400) and a malformed one (422)', async () => {
      assert.equal((await reset(crypto.randomBytes(32).toString('hex'))).status, 400);
      assert.equal((await reset('abc')).status, 422);
      assert.equal((await reset(undefined)).status, 422);
    });

    it('refuses a weak password and keeps the link usable', async () => {
      const acct = await account();
      const token = await askFor(acct);
      for (const bad of ['short1A', 'alllowercase1', 'ALLUPPERCASE1', 'NoNumbersHere']) assert.equal((await reset(token, bad)).status, 422, bad);
      assert.equal((await reset(token, NEW_PASSWORD)).status, 200);
    });

    it('does not log the user in (no cookies are set)', async () => {
      const acct = await account();
      const res = await reset(await askFor(acct));
      assert.equal(res.headers['set-cookie'], undefined);
    });

    it('also lifts a login lock on the account', async () => {
      const acct = await account();
      for (let i = 0; i < 10; i++) await t.api.post('/api/auth/login', { body: { email: acct.email, password: 'WrongPass1' } });
      assert.equal((await t.login(acct)).res.status, 429);
      await reset(await askFor(acct));
      assert.equal((await t.api.post('/api/auth/login', { body: { email: acct.email, password: NEW_PASSWORD } })).status, 200);
    });

    it('limits failed attempts: 10 wrong links per address, then 429', async () => {
      const ip = '198.51.100.77';
      const statuses = [];
      for (let i = 0; i < 12; i++) statuses.push((await reset(crypto.randomBytes(32).toString('hex'), NEW_PASSWORD, { ip })).status);
      assert.deepEqual(statuses, [...Array(10).fill(400), 429, 429]);
    });
  });

  describe('data safety', () => {
    it('never shows a token, hash or reset row in any response', async () => {
      const acct = await account();
      const a = await forgot(acct.email);
      const token = tokenOf(t.mail.sent[0]);
      const b = await reset(token);
      const c = await reset(token);
      for (const r of [a, b, c]) {
        const text = JSON.stringify(r.body) + JSON.stringify(r.headers);
        assert.ok(!text.includes(token) && !/tokenHash|expiresAt/.test(text), text.slice(0, 120));
      }
    });

    it('deleting the account removes its reset rows', async () => {
      const acct = await account();
      await askFor(acct);
      assert.equal(await PasswordReset.countDocuments({ user: acct.userId }), 1);
      const del = await t.api.del('/api/user/account', { cookies: acct.cookies, body: { password: acct.password } });
      assert.equal(del.status, 200);
      assert.equal(await PasswordReset.countDocuments({ user: acct.userId }), 0);
    });
  });
});
