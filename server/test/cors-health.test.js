// NODE_ENV=production on purpose: the access log is switched off in "test" mode.
const t = require('./helpers/setup');
t.env({ NODE_ENV: 'production', ALLOWED_ORIGINS: ' https://staging.example.com , https://other.example.com ,, ' });
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const logLines = [];
const realLog = console.log;

describe('CORS, security headers, /health and the access log', () => {
  before(async () => {
    console.log = (...a) => { logLines.push(a.join(' ')); };
    await t.start();
    await t.seedSheets();
  });
  after(async () => { console.log = realLog; await t.stop(); });

  describe('CORS allowlist (exact origins only)', () => {
    const allowed = ['http://localhost:5173', 'https://prepstack-ss.vercel.app', 'https://staging.example.com', 'https://other.example.com'];
    for (const origin of allowed) {
      it(`allows ${origin} with credentials`, async () => {
        const res = await t.api.get('/api/auth/current-user', { headers: { Origin: origin } });
        assert.equal(res.status, 401); // reached the handler (not logged in), so CORS let it through
        assert.equal(res.headers['access-control-allow-origin'], origin);
        assert.equal(res.headers['access-control-allow-credentials'], 'true');
      });
    }

    const blocked = [
      'https://prepstack-evil.vercel.app',          // the old regex let this through
      'https://prepstack-xyz123.vercel.app',
      'https://prepstack.vercel.app.evil.com',
      'https://evil.com',
      'http://localhost:5174',
      'https://staging.example.com.evil.com',
    ];
    for (const origin of blocked) {
      it(`blocks ${origin} with a clean 403 and no CORS headers`, async () => {
        const res = await t.api.get('/api/sheets', { headers: { Origin: origin } });
        assert.equal(res.status, 403);
        assert.equal(res.headers['access-control-allow-origin'], undefined);
        assert.equal(res.body.success, false);
      });
    }

    it('blocks a state-changing request from a bad origin before any handler runs', async () => {
      const acct = await t.register();
      const res = await t.api.post('/api/auth/logout-all', { cookies: acct.cookies, headers: { Origin: 'https://prepstack-evil.vercel.app' } });
      assert.equal(res.status, 403);
      const still = await t.api.get('/api/auth/current-user', { cookies: acct.cookies });
      assert.equal(still.status, 200); // the session was NOT revoked by the cross-site call
    });

    it('answers a preflight for an allowed origin and refuses it for a bad one', async () => {
      const ok = await t.api.options('/api/auth/current-user', { headers: { Origin: 'https://prepstack-ss.vercel.app', 'Access-Control-Request-Method': 'GET' } });
      assert.equal(ok.status, 204);
      assert.equal(ok.headers['access-control-allow-origin'], 'https://prepstack-ss.vercel.app');
      const bad = await t.api.options('/api/auth/current-user', { headers: { Origin: 'https://evil.com', 'Access-Control-Request-Method': 'GET' } });
      assert.equal(bad.status, 403);
    });

    it('allows requests that send no Origin header (curl, Postman, uptime monitors)', async () => {
      const res = await t.api.get('/api/sheets');
      assert.equal(res.status, 200);
    });
  });

  describe('security headers (helmet)', () => {
    it('sets hardening headers and hides X-Powered-By', async () => {
      const res = await t.api.get('/api/sheets');
      assert.equal(res.headers['x-powered-by'], undefined);
      assert.equal(res.headers['x-content-type-options'], 'nosniff');
      assert.match(res.headers['strict-transport-security'], /max-age=\d+/);
      assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
      assert.equal(res.headers['referrer-policy'], 'no-referrer');
      assert.ok(res.headers['content-security-policy']);
    });
  });

  describe('GET /health', () => {
    it('returns 200 {status:ok, db:up} without logging in', async () => {
      const res = await t.api.get('/health');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { status: 'ok', db: 'up' });
    });
    it('is not written to the access log (monitors call it constantly)', async () => {
      logLines.length = 0;
      await t.api.get('/health');
      assert.equal(logLines.filter((l) => l.includes('/health')).length, 0);
    });
  });

  describe('access log', () => {
    it('logs one line per request: method, path (no query string), status, duration', async () => {
      logLines.length = 0;
      await t.api.get('/api/sheets?token=SUPERSECRET123&password=hunter2');
      const line = logLines.find((l) => l.startsWith('GET /api/sheets'));
      assert.ok(line, 'expected a log line for GET /api/sheets');
      assert.match(line, /^GET \/api\/sheets 200 \d+ms$/);
    });
    it('logs the full routed path and the real status code', async () => {
      logLines.length = 0;
      await t.api.post('/api/auth/login', { body: { email: 'nobody@example.com', password: 'MySecretPass99' } });
      await t.api.get('/no-such-page');
      assert.ok(logLines.some((l) => /^POST \/api\/auth\/login 401 \d+ms$/.test(l)));
      assert.ok(logLines.some((l) => /^GET \/no-such-page 404 \d+ms$/.test(l)));
    });
    it('never leaks query strings, passwords or tokens into the log', async () => {
      logLines.length = 0;
      await t.api.get('/api/sheets?token=SUPERSECRET123&password=hunter2');
      await t.api.post('/api/auth/login', { body: { email: 'a@example.com', password: 'MySecretPass99' } });
      const all = logLines.join('\n');
      for (const secret of ['SUPERSECRET123', 'hunter2', 'MySecretPass99']) assert.ok(!all.includes(secret), `${secret} leaked into the log`);
    });
  });

  describe('unknown routes', () => {
    it('returns a JSON 404 in the standard error shape', async () => {
      const res = await t.api.get('/api/does-not-exist');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Cannot GET \/api\/does-not-exist/);
    });
  });

  describe('GET /health when the database is down', () => {
    it('returns 503 {status:unavailable, db:down}', async () => {
      await t.mongoose.disconnect();
      const res = await t.api.get('/health');
      assert.equal(res.status, 503);
      assert.deepEqual(res.body, { status: 'unavailable', db: 'down' });
    });
  });
});
