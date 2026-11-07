const t = require('./helpers/setup');
const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

let User;
const sessionsInDb = async (email) => (await User.findOne({ email })).refreshTokens;
const mongooseId = () => new t.mongoose.Types.ObjectId().toString();

describe('Authentication: register, login, refresh, sessions', () => {
  before(async () => { await t.start(); ({ User } = t.getModels()); });
  after(() => t.stop());

  // ───────────────────────────── register ─────────────────────────────
  describe('POST /api/auth/register', () => {
    it('creates the account, logs the user in, and never returns secrets', async () => {
      const { res, username, email } = await t.register();
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      const u = res.body.data.user;
      assert.equal(u.username, username);
      assert.equal(u.email, email);
      assert.equal(u.hasPassword, true);
      assert.deepEqual(u.providers, []);
      assert.match(u.avatar, new RegExp(`^https://api\\.dicebear\\.com/7\\.x/bottts/svg\\?seed=${username}$`));
      for (const secret of ['password', 'refreshTokens', 'tokenHash']) assert.ok(!(secret in u), `${secret} must not be returned`);
      assert.equal(res.body.user.username, username); // legacy top-level copy the client still reads
    });

    it('sets httpOnly + Secure + SameSite=None access and refresh cookies', async () => {
      const { res } = await t.register();
      const cookies = res.headers['set-cookie'];
      assert.equal(cookies.length, 2);
      for (const c of cookies) { assert.match(c, /HttpOnly/); assert.match(c, /Secure/); assert.match(c, /SameSite=None/); }
      assert.ok(cookies.some((c) => c.startsWith('accessToken=')));
      assert.ok(cookies.some((c) => c.startsWith('refreshToken=')));
    });

    it('stores a hashed refresh token and one session with device info', async () => {
      const { email, cookies } = await t.register({ headers: { 'User-Agent': t.UA.windows } });
      const [s] = await sessionsInDb(email);
      assert.equal((await sessionsInDb(email)).length, 1);
      assert.match(s.tokenHash, /^[0-9a-f]{64}$/); // sha256, never the raw token
      assert.notEqual(s.tokenHash, cookies.refreshToken);
      assert.equal(s.device, 'Chrome on Windows 10/11');
    });

    const bad = [
      ['nothing sent', {}, 'Username is required'],
      ['no email', { username: 'abcd', password: 'Passw0rdX' }, 'Email is required'],
      ['no password', { username: 'abcd', email: 'a@example.com' }, 'Password is required'],
      ['no username', { email: 'a@example.com', password: 'Passw0rdX' }, 'Username is required'],
      ['username too short', { username: 'ab', email: 'a@example.com', password: 'Passw0rdX' }, 'Username must be at least 4 characters'],
      ['username with symbols', { username: 'bad-name!', email: 'a@example.com', password: 'Passw0rdX' }, /start with a letter/],
      ['username starting with a digit', { username: '1abcd', email: 'a@example.com', password: 'Passw0rdX' }, /start with a letter/],
      ['invalid email', { username: 'abcd', email: 'not-an-email', password: 'Passw0rdX' }, 'Please provide a valid email address'],
      ['password too short', { username: 'abcd', email: 'a@example.com', password: 'Pw0rd' }, 'Password must be at least 8 characters'],
      ['password without uppercase', { username: 'abcd', email: 'a@example.com', password: 'passw0rdx' }, /uppercase/],
      ['password without lowercase', { username: 'abcd', email: 'a@example.com', password: 'PASSW0RDX' }, /lowercase/],
      ['password without a number', { username: 'abcd', email: 'a@example.com', password: 'Passwordx' }, /number/],
      ['password longer than 72 chars (bcrypt limit)', { username: 'abcd', email: 'a@example.com', password: 'Aa1' + 'x'.repeat(70) }, /cannot exceed 72/],
      ['password sent as a number', { username: 'abcd', email: 'a@example.com', password: 12345678 }, 'Password is required'],
    ];
    for (const [label, body, expected] of bad) {
      it(`rejects: ${label} (422 with a readable message)`, async () => {
        const res = await t.api.post('/api/auth/register', { body });
        assert.equal(res.status, 422);
        assert.equal(res.body.success, false);
        if (expected instanceof RegExp) assert.match(res.body.message, expected); else assert.equal(res.body.message, expected);
        assert.ok(Array.isArray(res.body.errors));
      });
    }

    it('rejects a duplicate email (case-insensitively) with 409', async () => {
      const a = await t.register({ email: 'dupe@example.com' });
      assert.equal(a.res.status, 201);
      const b = await t.register({ email: 'DUPE@Example.com' });
      assert.equal(b.res.status, 409);
      assert.equal(b.res.body.message, 'An account with this email already exists');
    });

    it('treats usernames case-insensitively: Admin / admin / ADMIN -> one account', async () => {
      const first = await t.register({ username: 'CaseName' });
      const second = await t.register({ username: 'casename' });
      const third = await t.register({ username: 'CASENAME' });
      assert.equal(first.res.status, 201);
      assert.equal(second.res.status, 409);
      assert.equal(second.res.body.message, 'Username is already taken. Please choose another.');
      assert.equal(third.res.status, 409);
      assert.equal(await User.countDocuments({ username: { $regex: '^casename$', $options: 'i' } }), 1);
    });

    it('survives parallel sign-ups for the same name in different case: one 201, the rest 409, never a 500', async () => {
      const results = await Promise.all(['RaceUser', 'raceuser', 'RACEUSER', 'RaceUSER'].map((u) => t.register({ username: u })));
      const statuses = results.map((r) => r.res.status).sort();
      assert.deepEqual(statuses, [201, 409, 409, 409]);
      assert.equal(await User.countDocuments({ username: { $regex: '^raceuser$', $options: 'i' } }), 1);
    });

    it('enforces the case-insensitive unique index in the database itself', async () => {
      const idx = (await User.collection.indexes()).find((i) => i.name === 'username_ci_unique');
      assert.ok(idx, 'username_ci_unique index missing');
      assert.equal(idx.unique, true);
      assert.equal(idx.collation.strength, 2);
    });

    it('stores the password as a bcrypt hash, never in clear text', async () => {
      const { email, password } = await t.register();
      const doc = await User.findOne({ email });
      assert.match(doc.password, /^\$2[aby]\$12\$/); // bcrypt, cost 12
      assert.notEqual(doc.password, password);
    });
  });

  // ───────────────────────────── login ─────────────────────────────
  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials and starts a new session each time', async () => {
      const acct = await t.register();
      const { res, cookies } = await t.login(acct);
      assert.equal(res.status, 200);
      assert.equal(res.body.data.user.email, acct.email);
      assert.ok(cookies.accessToken && cookies.refreshToken);
      assert.equal((await sessionsInDb(acct.email)).length, 2); // register + this login
    });

    it('accepts the email in any letter case', async () => {
      const acct = await t.register();
      const res = await t.api.post('/api/auth/login', { body: { email: acct.email.toUpperCase(), password: acct.password } });
      assert.equal(res.status, 200);
    });

    it('gives the SAME generic 401 for a wrong password and for an unknown email', async () => {
      const acct = await t.register();
      const wrong = await t.api.post('/api/auth/login', { body: { email: acct.email, password: 'WrongPass1' } });
      const unknown = await t.api.post('/api/auth/login', { body: { email: 'nobody@example.com', password: 'WrongPass1' } });
      assert.equal(wrong.status, 401); assert.equal(unknown.status, 401);
      assert.equal(wrong.body.message, 'Invalid email or password');
      assert.equal(unknown.body.message, 'Invalid email or password');
    });

    it('validates the body (422)', async () => {
      assert.equal((await t.api.post('/api/auth/login', { body: {} })).body.message, 'Email is required');
      assert.equal((await t.api.post('/api/auth/login', { body: { email: 'a@example.com' } })).body.message, 'Password is required');
      assert.equal((await t.api.post('/api/auth/login', { body: { email: 'nope', password: 'x' } })).status, 422);
    });

    it('caps concurrent sessions at 10 and drops the OLDEST ones', async () => {
      const acct = await t.register();
      const logins = [];
      for (let i = 0; i < 12; i++) logins.push(await t.login(acct));
      assert.equal((await sessionsInDb(acct.email)).length, 10);
      const oldest = await t.api.get('/api/auth/current-user', { cookies: acct.cookies });
      assert.equal(oldest.status, 401, 'the oldest session should have been dropped');
      const newest = await t.api.get('/api/auth/current-user', { cookies: logins.at(-1).cookies });
      assert.equal(newest.status, 200);
    });

    it('handles 25 parallel logins: all succeed, exactly 10 sessions kept, unique ids, no errors', async () => {
      const acct = await t.register();
      const results = await Promise.all(Array.from({ length: 25 }, () => t.login(acct)));
      assert.ok(results.every((r) => r.res.status === 200));
      const sessions = await sessionsInDb(acct.email);
      assert.equal(sessions.length, 10);
      assert.equal(new Set(sessions.map((s) => String(s._id))).size, 10);
    });

    it('gives two logins in the same second different refresh tokens', async () => {
      const acct = await t.register();
      const [a, b] = await Promise.all([t.login(acct), t.login(acct)]);
      assert.notEqual(a.cookies.refreshToken, b.cookies.refreshToken);
      const hashes = (await sessionsInDb(acct.email)).map((s) => s.tokenHash);
      assert.equal(new Set(hashes).size, hashes.length);
    });

    it('rate-limits one IP after 10 attempts (wrong passwords count) but not other IPs', async () => {
      const ip = '203.0.113.50';
      const statuses = [];
      for (let i = 0; i < 12; i++) statuses.push((await t.api.post('/api/auth/login', { ip, body: { email: 'x@example.com', password: 'WrongPass1' } })).status);
      assert.deepEqual(statuses, [401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 429, 429]);
      const blocked = await t.api.post('/api/auth/login', { ip, body: { email: 'x@example.com', password: 'WrongPass1' } });
      assert.equal(blocked.body.message, 'Too many attempts. Please try again after 15 minutes.');
      const other = await t.api.post('/api/auth/login', { body: { email: 'x@example.com', password: 'WrongPass1' } });
      assert.equal(other.status, 401); // a different IP is unaffected
    });

    it('an unknown email costs the same password work as a wrong password (so timing does not reveal which emails exist)', async () => {
      const bcrypt = require('bcrypt');
      const real = await t.register();
      const spy = require('node:test').mock.method(bcrypt, 'compare');
      try {
        await t.api.post('/api/auth/login', { body: { email: 'nobody.here@example.com', password: 'WrongPass123' } });
        assert.equal(spy.mock.callCount(), 1);
        await t.api.post('/api/auth/login', { body: { email: real.email, password: 'WrongPass123' } });
        assert.equal(spy.mock.callCount(), 2);
      } finally { spy.mock.restore(); }
    });
    it('does not count successful logins, so many students behind one Wi-Fi address can all log in', async () => {
      const acct = await t.register();
      const ip = '203.0.113.77';
      const statuses = [];
      for (let i = 0; i < 12; i++) statuses.push((await t.api.post('/api/auth/login', { ip, body: { email: acct.email, password: acct.password } })).status);
      assert.deepEqual(statuses, Array(12).fill(200));
    });
  });

  // ───────────────────────────── access-token middleware ─────────────────────────────
  describe('access token checks (every protected route)', () => {
    let acct;
    beforeEach(async () => { acct = await t.register(); });

    it('returns the current user for a valid cookie', async () => {
      const res = await t.api.get('/api/auth/current-user', { cookies: acct.cookies });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.user.email, acct.email);
    });
    it('also accepts the token as an Authorization: Bearer header', async () => {
      const res = await t.api.get('/api/auth/current-user', { bearer: acct.cookies.accessToken });
      assert.equal(res.status, 200);
    });
    it('401 Unauthorized when no token is sent', async () => {
      const res = await t.api.get('/api/auth/current-user');
      assert.equal(res.status, 401);
      assert.equal(res.body.message, 'Unauthorized');
    });
    it('403 Invalid token for a garbage or tampered token', async () => {
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: { accessToken: 'abc.def.ghi' } })).status, 403);
      const tampered = acct.cookies.accessToken.slice(0, -3) + 'xyz';
      const res = await t.api.get('/api/auth/current-user', { cookies: { accessToken: tampered } });
      assert.equal(res.status, 403);
      assert.equal(res.body.message, 'Invalid token');
    });
    it('401 Token expired for an expired token (so the client knows to refresh)', async () => {
      const [{ _id }] = await sessionsInDb(acct.email);
      const expired = jwt.sign({ id: acct.id, username: acct.username, sid: String(_id) }, process.env.ACCESS_SECRET, { expiresIn: -10 });
      const res = await t.api.get('/api/auth/current-user', { cookies: { accessToken: expired } });
      assert.equal(res.status, 401);
      assert.equal(res.body.message, 'Token expired');
    });
    it('rejects a validly-signed token that has no session id (issued before sessions were tracked)', async () => {
      const legacy = jwt.sign({ id: acct.id, username: acct.username }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: { accessToken: legacy } })).status, 401);
    });
    it('rejects a token whose session id is not a valid id, or no longer exists', async () => {
      const mk = (sid) => jwt.sign({ id: acct.id, username: acct.username, sid }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: { accessToken: mk('not-an-id') } })).status, 401);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: { accessToken: mk(mongooseId()) } })).status, 401);
    });
    it('rejects a token signed with the wrong secret', async () => {
      const [{ _id }] = await sessionsInDb(acct.email);
      const forged = jwt.sign({ id: acct.id, sid: String(_id) }, 'some-other-secret', { expiresIn: '15m' });
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: { accessToken: forged } })).status, 403);
    });
    it('rejects a token for a session the database says has expired', async () => {
      await User.updateOne({ email: acct.email }, { $set: { 'refreshTokens.$[].expiresAt': new Date(Date.now() - 1000) } });
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: acct.cookies })).status, 401);
    });
    it('rejects the token of a deleted user', async () => {
      await User.deleteOne({ email: acct.email });
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: acct.cookies })).status, 401);
    });
    it('every protected route refuses a request with no token', async () => {
      const protectedRoutes = [
        ['get', '/api/auth/current-user'], ['post', '/api/auth/logout'], ['post', '/api/auth/logout-all'], ['get', '/api/auth/sessions'],
        ['get', '/api/user/stats'], ['get', '/api/user/dashboard-summary'], ['get', '/api/project'], ['post', '/api/project/generate'],
        ['get', '/api/sheets/blind-75/progress'], ['post', '/api/sheets/blind-75/progress'],
      ];
      for (const [method, url] of protectedRoutes) assert.equal((await t.api[method](url)).status, 401, `${method} ${url}`);
    });
  });

  // ───────────────────────────── logout / revocation ─────────────────────────────
  describe('logout and revocation take effect immediately', () => {
    it('logout kills this device only: its old access token and refresh token stop working, other devices stay logged in', async () => {
      const acct = await t.register();
      const other = await t.login(acct);
      const out = await t.api.post('/api/auth/logout', { cookies: acct.cookies });
      assert.equal(out.status, 200);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: acct.cookies })).status, 401);
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } })).status, 403);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: other.cookies })).status, 200);
      assert.equal((await sessionsInDb(acct.email)).length, 1);
    });
    it('logout clears both cookies', async () => {
      const acct = await t.register();
      const out = await t.api.post('/api/auth/logout', { cookies: acct.cookies });
      const cleared = out.headers['set-cookie'].join(';');
      assert.match(cleared, /accessToken=;/); assert.match(cleared, /refreshToken=;/);
    });
    it('logout-all kills EVERY device (access and refresh tokens)', async () => {
      const acct = await t.register();
      const d2 = await t.login(acct);
      assert.equal((await t.api.post('/api/auth/logout-all', { cookies: acct.cookies })).status, 200);
      for (const c of [acct.cookies, d2.cookies]) {
        assert.equal((await t.api.get('/api/auth/current-user', { cookies: c })).status, 401);
        assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: c.refreshToken } })).status, 403);
      }
      assert.equal((await sessionsInDb(acct.email)).length, 0);
    });
  });

  // ───────────────────────────── refresh ─────────────────────────────
  describe('POST /api/auth/refresh (single-use rotation)', () => {
    it('rotates the refresh token, keeps the same session, and the old access token still works', async () => {
      const acct = await t.register();
      const before = await sessionsInDb(acct.email);
      const res = await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } });
      assert.equal(res.status, 200);
      const fresh = t.parseCookies(res);
      assert.ok(fresh.accessToken && fresh.refreshToken);
      assert.notEqual(fresh.refreshToken, acct.cookies.refreshToken);
      const after = await sessionsInDb(acct.email);
      assert.equal(after.length, 1);
      assert.equal(String(after[0]._id), String(before[0]._id));          // same session identity
      assert.notEqual(after[0].tokenHash, before[0].tokenHash);           // new token hash
      assert.equal(after[0].prevTokenHash, before[0].tokenHash);          // old one remembered for the grace window
      assert.equal(after[0].createdAt.getTime(), before[0].createdAt.getTime());
      assert.ok(after[0].expiresAt > before[0].expiresAt);                // lifetime extended
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: acct.cookies })).status, 200);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: fresh })).status, 200);
    });
    it('the new refresh token works again, so a long session can keep refreshing', async () => {
      const acct = await t.register();
      let token = acct.cookies.refreshToken;
      for (let i = 0; i < 4; i++) {
        const res = await t.api.post('/api/auth/refresh', { cookies: { refreshToken: token } });
        assert.equal(res.status, 200, `refresh #${i + 1}`);
        token = t.parseCookies(res).refreshToken;
        assert.ok(token);
      }
    });
    it('401 when no refresh cookie is sent', async () => {
      const res = await t.api.post('/api/auth/refresh');
      assert.equal(res.status, 401);
      assert.equal(res.body.message, 'No refresh token provided');
    });
    it('403 for a tampered or garbage refresh token', async () => {
      const acct = await t.register();
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken.slice(0, -3) + 'abc' } })).status, 403);
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: 'garbage' } })).status, 403);
    });
    it('rejects a refresh token whose session has expired in the database', async () => {
      const acct = await t.register();
      await User.updateOne({ email: acct.email }, { $set: { 'refreshTokens.$[].expiresAt': new Date(Date.now() - 1000) } });
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } })).status, 403);
    });
    it('rejects a refresh token of a deleted user', async () => {
      const acct = await t.register();
      await User.deleteOne({ email: acct.email });
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } })).status, 403);
    });
    it('an access token cannot be used as a refresh token (different secrets)', async () => {
      const acct = await t.register();
      const res = await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.accessToken } });
      assert.equal(res.status, 403);
    });

    it('grace window: the old token still works right after rotation, but only yields an access token', async () => {
      const acct = await t.register();
      await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } }); // tab A wins
      const late = await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } }); // tab B, same old token
      assert.equal(late.status, 200);
      assert.deepEqual(Object.keys(t.parseCookies(late)), ['accessToken']); // must NOT overwrite tab A's new refresh cookie
    });
    it('after the grace window the old token is rejected (403)', async () => {
      const acct = await t.register();
      await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } });
      await User.updateOne({ email: acct.email }, { $set: { 'refreshTokens.$[].rotatedAt': new Date(Date.now() - 11_000) } });
      const res = await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } });
      assert.equal(res.status, 403);
      assert.equal(res.body.message, 'Invalid or expired refresh token');
    });

    it('replaying the previous token after the grace window signs out the whole session (thief AND real user)', async () => {
      const acct = await t.register();
      const first = acct.cookies.refreshToken;
      const rotated = await t.api.post('/api/auth/refresh', { cookies: { refreshToken: first } }); // the real user moves on
      const current = t.parseCookies(rotated);
      await User.updateOne({ email: acct.email }, { $set: { 'refreshTokens.$[].rotatedAt': new Date(Date.now() - 11_000) } });
      const replay = await t.api.post('/api/auth/refresh', { cookies: { refreshToken: first } }); // a copy of the old token is used
      assert.equal(replay.status, 403);
      assert.equal((await sessionsInDb(acct.email)).length, 0); // the session is deleted
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: current.refreshToken } })).status, 403); // the newer token is dead too
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: { accessToken: current.accessToken } })).status, 401);
    });
    it('replaying inside the grace window revokes nothing (two tabs refreshing together stay logged in)', async () => {
      const acct = await t.register();
      const first = acct.cookies.refreshToken;
      const winner = t.parseCookies(await t.api.post('/api/auth/refresh', { cookies: { refreshToken: first } }));
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: first } })).status, 200); // slower tab
      assert.equal((await sessionsInDb(acct.email)).length, 1);
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: winner.refreshToken } })).status, 200);
    });
    it('a token from TWO rotations ago is rejected, but it is not the remembered previous one so nothing is revoked', async () => {
      const acct = await t.register();
      const first = acct.cookies.refreshToken;
      const second = t.parseCookies(await t.api.post('/api/auth/refresh', { cookies: { refreshToken: first } })).refreshToken;
      const third = t.parseCookies(await t.api.post('/api/auth/refresh', { cookies: { refreshToken: second } })).refreshToken;
      await User.updateOne({ email: acct.email }, { $set: { 'refreshTokens.$[].rotatedAt': new Date(Date.now() - 11_000) } });
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: first } })).status, 403);
      assert.equal((await sessionsInDb(acct.email)).length, 1); // known limit: only the immediately previous token triggers a revoke
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: third } })).status, 200);
    });

    for (const n of [2, 5, 30]) {
      it(`${n} parallel refreshes with the same cookie: all succeed, exactly one new refresh cookie, one session, no 500`, async () => {
        const acct = await t.register();
        const results = await Promise.all(Array.from({ length: n }, () => t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } })));
        assert.ok(results.every((r) => r.status === 200), `statuses: ${results.map((r) => r.status)}`);
        assert.equal(results.filter((r) => t.parseCookies(r).refreshToken).length, 1);
        assert.equal((await sessionsInDb(acct.email)).length, 1);
        const winner = results.find((r) => t.parseCookies(r).refreshToken);
        assert.equal((await t.api.get('/api/auth/current-user', { cookies: t.parseCookies(winner) })).status, 200);
      });
    }

    it('rate-limits refresh at 30 per 15 minutes per IP', async () => {
      const ip = '203.0.113.60';
      const statuses = [];
      for (let i = 0; i < 32; i++) statuses.push((await t.api.post('/api/auth/refresh', { ip })).status);
      assert.equal(statuses.slice(0, 30).every((s) => s === 401), true);
      assert.deepEqual(statuses.slice(30), [429, 429]);
    });
  });

  // ───────────────────────────── sessions list / revoke ─────────────────────────────
  describe('GET/DELETE /api/auth/sessions', () => {
    it('lists devices with parsed browser/OS, flags only the caller as current, and never exposes token hashes', async () => {
      const acct = await t.register({ headers: { 'User-Agent': t.UA.windows } });
      await t.login(acct, { userAgent: t.UA.iphone });
      const res = await t.api.get('/api/auth/sessions', { cookies: acct.cookies });
      assert.equal(res.status, 200);
      const sessions = res.body.data.sessions;
      assert.equal(sessions.length, 2);
      assert.deepEqual(Object.keys(sessions[0]).sort(), ['browser', 'createdAt', 'device', 'id', 'ip', 'isCurrent', 'lastActive', 'os']);
      assert.equal(sessions.filter((s) => s.isCurrent).length, 1);
      assert.equal(sessions.find((s) => s.isCurrent).device, 'Chrome on Windows 10/11');
      assert.equal(sessions.find((s) => !s.isCurrent).device, 'Safari on iOS');
      assert.ok(!JSON.stringify(res.body).includes('tokenHash'));
    });
    it('keeps the current-device flag correct after the token rotates', async () => {
      const acct = await t.register();
      const r = await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } });
      const res = await t.api.get('/api/auth/sessions', { cookies: { ...acct.cookies, ...t.parseCookies(r) } });
      assert.equal(res.body.data.sessions[0].isCurrent, true);
    });
    it('stores the IP the proxy saw, NOT the first value a client can fake in X-Forwarded-For', async () => {
      const acct = await t.register({ ip: '6.6.6.6, 9.9.9.9' });
      const res = await t.api.get('/api/auth/sessions', { cookies: acct.cookies });
      assert.equal(res.body.data.sessions[0].ip, '9.9.9.9');
    });
    it('revokes another device: its tokens die, yours keep working', async () => {
      const acct = await t.register();
      const other = await t.login(acct, { userAgent: t.UA.android });
      const list = await t.api.get('/api/auth/sessions', { cookies: acct.cookies });
      const target = list.body.data.sessions.find((s) => !s.isCurrent);
      const del = await t.api.del(`/api/auth/sessions/${target.id}`, { cookies: acct.cookies });
      assert.equal(del.status, 200);
      assert.equal(del.body.data.isCurrentRevoked, false);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: other.cookies })).status, 401);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: acct.cookies })).status, 200);
    });
    it('revoking your OWN session signs you out and clears cookies', async () => {
      const acct = await t.register();
      const list = await t.api.get('/api/auth/sessions', { cookies: acct.cookies });
      const del = await t.api.del(`/api/auth/sessions/${list.body.data.sessions[0].id}`, { cookies: acct.cookies });
      assert.equal(del.status, 200);
      assert.equal(del.body.data.isCurrentRevoked, true);
      assert.match(del.headers['set-cookie'].join(';'), /accessToken=;/);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: acct.cookies })).status, 401);
    });
    it('404 for a garbage id, for a valid-looking unknown id, and for revoking the same session twice', async () => {
      const acct = await t.register();
      const other = await t.login(acct);
      assert.equal((await t.api.del('/api/auth/sessions/not-an-id', { cookies: acct.cookies })).status, 404);
      assert.equal((await t.api.del(`/api/auth/sessions/${mongooseId()}`, { cookies: acct.cookies })).status, 404);
      const list = await t.api.get('/api/auth/sessions', { cookies: acct.cookies });
      const id = list.body.data.sessions.find((s) => !s.isCurrent).id;
      assert.equal((await t.api.del(`/api/auth/sessions/${id}`, { cookies: acct.cookies })).status, 200);
      assert.equal((await t.api.del(`/api/auth/sessions/${id}`, { cookies: acct.cookies })).status, 404);
      void other;
    });
    it("cannot revoke ANOTHER USER's session (404) and their login is unaffected", async () => {
      const victim = await t.register();
      const attacker = await t.register();
      const victimSession = (await t.api.get('/api/auth/sessions', { cookies: victim.cookies })).body.data.sessions[0].id;
      const res = await t.api.del(`/api/auth/sessions/${victimSession}`, { cookies: attacker.cookies });
      assert.equal(res.status, 404);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: victim.cookies })).status, 200);
    });
  });
});
