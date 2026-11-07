// The real server.js, started as its own process in an empty folder (so no real .env is read). It must refuse to
// start when a required setting is missing, before it ever touches a database.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const os = require('os');
const path = require('path');

const SERVER_JS = path.join(__dirname, '..', 'server.js');
const start = (env) => spawnSync(process.execPath, [SERVER_JS], {
  cwd: os.tmpdir(),
  env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, ...env },
  encoding: 'utf8',
  timeout: 15000,
});
const ALL = { ACCESS_SECRET: 'a'.repeat(40), REFRESH_SECRET: 'b'.repeat(40), GOOGLE_CLIENT_ID: 'fake-client-id', MONGO_URI: 'mongodb://127.0.0.1:1/never?serverSelectionTimeoutMS=500' };

describe('server startup checks', () => {
  it('refuses to start without GOOGLE_CLIENT_ID (the Google sign-in token check would silently weaken)', () => {
    const { GOOGLE_CLIENT_ID, ...without } = ALL; void GOOGLE_CLIENT_ID;
    const r = start(without);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /Missing GOOGLE_CLIENT_ID/);
  });
  it('refuses to start without the JWT secrets', () => {
    const { ACCESS_SECRET, ...without } = ALL; void ACCESS_SECRET;
    const r = start(without);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /Missing ACCESS_SECRET/);
  });
  it('passes both settings checks when everything is set (it then fails only at the database, which is unreachable here)', () => {
    const r = start(ALL);
    assert.equal(r.status, 1);
    assert.doesNotMatch(r.stderr, /Missing (GOOGLE_CLIENT_ID|ACCESS_SECRET)/);
    assert.match(r.stderr, /Database connection error/);
  });
});
