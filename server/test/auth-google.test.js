const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

let User;
let gn = 0;
// A Google account payload; every call gets a fresh id/email unless you override them
const gAcct = (over = {}) => { gn++; return { email: `guser${gn}@example.com`, sub: `google-sub-${gn}`, name: 'Gina Google', ...over }; };
const googleLogin = (payload, opts = {}) => t.api.post('/api/auth/google', { body: { idToken: t.google.token(payload) }, ...opts });
const linkGoogle = (cookies, payload) => t.api.post('/api/auth/link-google', { cookies, body: { idToken: t.google.token(payload) } });

describe('Google sign-in, linking and set-password (Google is faked)', () => {
  before(async () => { await t.start(); ({ User } = t.getModels()); });
  after(() => t.stop());

  describe('POST /api/auth/google', () => {
    it('creates a new account from a verified Google identity and logs it in', async () => {
      const g = gAcct({ name: 'Gina Google' });
      const res = await googleLogin(g);
      assert.equal(res.status, 200);
      const u = res.body.data.user;
      assert.equal(u.email, g.email);
      assert.equal(u.username, 'gina_google');                                  // derived from the display name
      assert.deepEqual(u.providers.map((p) => p.providerName), ['google']);
      assert.equal(u.hasPassword, false);
      assert.equal(u.avatar, 'https://lh3.example/photo.jpg');                  // the Google picture
      const cookies = t.parseCookies(res);
      assert.ok(cookies.accessToken && cookies.refreshToken);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies })).status, 200);
    });

    it('signing in again with the same Google account reuses the account (no duplicate)', async () => {
      const g = gAcct();
      const first = await googleLogin(g);
      const second = await googleLogin(g);
      assert.equal(second.status, 200);
      assert.equal(second.body.data.user.id, first.body.data.user.id);
      assert.equal(await User.countDocuments({ email: g.email }), 1);
    });

    it('refreshes the stored avatar when the Google picture changes', async () => {
      const g = gAcct();
      await googleLogin(g, {});
      const res = await googleLogin({ ...g, picture: 'https://lh3.example/new.jpg' });
      assert.equal(res.body.data.user.avatar, 'https://lh3.example/new.jpg');
    });

    it("ignores Google's default placeholder picture and uses the generated avatar", async () => {
      const res = await googleLogin(gAcct({ name: 'No Photo', picture: 'https://lh3.example/default-user=s96-c' }));
      assert.match(res.body.data.user.avatar, /^https:\/\/api\.dicebear\.com\//);
    });

    it('picks a different username when the generated one is taken (case-insensitively)', async () => {
      await t.register({ username: 'Sam_Taken' });
      const res = await googleLogin(gAcct({ name: 'sam taken' }));
      assert.equal(res.status, 200);
      assert.notEqual(res.body.data.user.username.toLowerCase(), 'sam_taken');
      assert.match(res.body.data.user.username, /^sam_taken_\d{3}$/);
    });

    it('works for names with no usable letters (falls back to a prepstack_ username)', async () => {
      const res = await googleLogin(gAcct({ name: '张伟' }));
      assert.equal(res.status, 200);
      assert.match(res.body.data.user.username, /^prepstack_/);
    });

    it('refuses an unverified Google email (400)', async () => {
      const res = await googleLogin(gAcct({ email_verified: false }));
      assert.equal(res.status, 400);
      assert.match(res.body.message, /not verified/);
    });

    it('refuses to auto-merge into an existing password account with the same email (409)', async () => {
      const acct = await t.register();
      const res = await googleLogin(gAcct({ email: acct.email }));
      assert.equal(res.status, 409);
      assert.match(res.body.message, /already exists/);
      assert.equal(await User.countDocuments({ email: acct.email }), 1);
    });

    it('returns a clean 401 (not a 500) when the Google token is invalid', async () => {
      const res = await t.api.post('/api/auth/google', { body: { idToken: 'definitely-not-a-google-token' } });
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('validates the body: idToken is required and cannot be empty (422)', async () => {
      assert.equal((await t.api.post('/api/auth/google', { body: {} })).body.message, 'Google ID token is required');
      assert.equal((await t.api.post('/api/auth/google', { body: { idToken: '' } })).body.message, 'Google ID token cannot be empty');
    });

    it('a Google-only account cannot log in with a password until one is set (clear message)', async () => {
      const g = gAcct();
      await googleLogin(g);
      const res = await t.api.post('/api/auth/login', { body: { email: g.email, password: 'Passw0rdX' } });
      assert.equal(res.status, 401);
      assert.match(res.body.message, /Google Sign-In/);
    });
  });

  describe('PUT /api/auth/set-password (Google-only accounts)', () => {
    it('lets a Google-only account add a password, then it can log in with it', async () => {
      const g = gAcct();
      const cookies = t.parseCookies(await googleLogin(g));
      const res = await t.api.put('/api/auth/set-password', { cookies, body: { password: 'BrandNew123' } });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.user.hasPassword, true);
      const login = await t.api.post('/api/auth/login', { body: { email: g.email, password: 'BrandNew123' } });
      assert.equal(login.status, 200);
    });
    it('refuses when the account already has a password (400)', async () => {
      const acct = await t.register();
      const res = await t.api.put('/api/auth/set-password', { cookies: acct.cookies, body: { password: 'BrandNew123' } });
      assert.equal(res.status, 400);
      assert.match(res.body.message, /already has a password/);
    });
    it('enforces the same password rules as registration (422)', async () => {
      const cookies = t.parseCookies(await googleLogin(gAcct()));
      for (const [pw, re] of [['short1A', /at least 8/], ['alllowercase1', /uppercase/], ['ALLUPPERCASE1', /lowercase/], ['NoNumbersHere', /number/]]) {
        const res = await t.api.put('/api/auth/set-password', { cookies, body: { password: pw } });
        assert.equal(res.status, 422);
        assert.match(res.body.message, re);
      }
    });
    it('requires login (401)', async () => {
      assert.equal((await t.api.put('/api/auth/set-password', { body: { password: 'BrandNew123' } })).status, 401);
    });
  });

  describe('POST /api/auth/link-google', () => {
    it('links a Google identity to a logged-in password account with the SAME email', async () => {
      const acct = await t.register();
      const res = await linkGoogle(acct.cookies, gAcct({ email: acct.email }));
      assert.equal(res.status, 200);
      assert.deepEqual(res.body.data.user.providers.map((p) => p.providerName), ['google']);
      assert.equal(res.body.data.user.hasPassword, true); // password kept
    });
    it('matches the email case-insensitively', async () => {
      const acct = await t.register();
      const res = await linkGoogle(acct.cookies, gAcct({ email: acct.email.toUpperCase() }));
      assert.equal(res.status, 200);
    });
    it('replaces the default avatar with the Google picture', async () => {
      const acct = await t.register();
      const res = await linkGoogle(acct.cookies, gAcct({ email: acct.email, picture: 'https://lh3.example/linked.jpg' }));
      assert.equal(res.body.data.user.avatar, 'https://lh3.example/linked.jpg');
    });
    it('refuses a Google account with a DIFFERENT email (403)', async () => {
      const acct = await t.register();
      const res = await linkGoogle(acct.cookies, gAcct({ email: 'someone.else@example.com' }));
      assert.equal(res.status, 403);
      assert.match(res.body.message, /does not match/);
    });
    it('refuses a Google account already linked to ANOTHER user (409)', async () => {
      const first = await t.register();
      const g = gAcct({ email: first.email });
      assert.equal((await linkGoogle(first.cookies, g)).status, 200);
      const second = await t.register();
      const res = await linkGoogle(second.cookies, { ...g, email: second.email });
      assert.equal(res.status, 409);
      assert.match(res.body.message, /already linked to another/);
    });
    it('is idempotent: linking the same Google account twice says so (200)', async () => {
      const acct = await t.register();
      const g = gAcct({ email: acct.email });
      await linkGoogle(acct.cookies, g);
      const again = await linkGoogle(acct.cookies, g);
      assert.equal(again.status, 200);
      assert.match(again.body.message, /already linked/);
      assert.equal((await User.findOne({ email: acct.email })).providers.length, 1);
    });
    it('refuses an unverified Google email (400)', async () => {
      const acct = await t.register();
      assert.equal((await linkGoogle(acct.cookies, gAcct({ email: acct.email, email_verified: false }))).status, 400);
    });
    it('returns a clean 401 for an invalid Google token', async () => {
      const acct = await t.register();
      const res = await t.api.post('/api/auth/link-google', { cookies: acct.cookies, body: { idToken: 'garbage' } });
      assert.equal(res.status, 401);
    });
    it('requires login (401)', async () => {
      assert.equal((await t.api.post('/api/auth/link-google', { body: { idToken: t.google.token(gAcct()) } })).status, 401);
    });
    it('is rate-limited to 5 attempts per 15 minutes per IP', async () => {
      const acct = await t.register();
      const ip = '203.0.113.70';
      const statuses = [];
      for (let i = 0; i < 7; i++) statuses.push((await t.api.post('/api/auth/link-google', { ip, cookies: acct.cookies, body: { idToken: t.google.token(gAcct({ email: 'x@example.com' })) } })).status);
      assert.deepEqual(statuses.slice(5), [429, 429]);
    });
  });
});
