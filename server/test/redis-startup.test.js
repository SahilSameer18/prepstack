// The real server.js, started as its own process on an in-memory MongoDB: it must start with Redis off, with Redis down, and with a
// name that does not exist, say which in one line, keep answering requests, and never print the address (it holds a password).
// (Stopping with Ctrl+C cannot be sent as a signal on Windows, so the clean shutdown is tested on the module itself: redis-config.test.js.)
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const os = require('node:os');
const net = require('node:net');
const path = require('node:path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const SERVER = path.join(__dirname, '..', 'server.js');
const SECRET = 'topsecretpassword';
let mongod;

const freePort = () => new Promise((resolve) => { const s = net.createServer().listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); }); });

// Start server.js with the given REDIS_URL; resolve with its output once `ready(output)` is true, then stop it.
async function run(redisUrl, ready) {
  const port = await freePort();
  const child = spawn(process.execPath, [SERVER], {
    cwd: os.tmpdir(), // so the real server/.env is never read
    env: {
      PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, NODE_ENV: 'test', PORT: String(port), MONGO_URI: mongod.getUri(),
      ACCESS_SECRET: 'a'.repeat(40), REFRESH_SECRET: 'b'.repeat(40), GOOGLE_CLIENT_ID: 'fake-client-id', REDIS_URL: redisUrl,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (d) => { output += d; });
  child.stderr.on('data', (d) => { output += d; });
  const end = Date.now() + 30000;
  while (Date.now() < end && !ready(output)) await new Promise((r) => setTimeout(r, 100));
  let status = null;
  try { status = (await fetch(`http://127.0.0.1:${port}/api/sheets`)).status; } catch { /* reported below */ }
  child.kill();
  return { output, status };
}

describe('server.js with and without Redis', () => {
  before(async () => { mongod = await MongoMemoryServer.create(); });
  after(async () => { await mongod.stop(); });

  it('starts without REDIS_URL, says so, and serves requests', async () => {
    const { output, status } = await run('', (o) => o.includes('Redis: disabled') && o.includes('server is running'));
    assert.match(output, /Redis: disabled \(REDIS_URL is not set/);
    assert.equal(status, 200);
  });

  it('starts when Redis is down, says so once, serves requests, and prints no address or password', async () => {
    const { output, status } = await run(`rediss://someuser:${SECRET}@127.0.0.1:1`, (o) => o.includes('Redis: unavailable') && o.includes('server is running'));
    assert.match(output, /Redis: unavailable \(ECONNREFUSED\); continuing without it/);
    assert.equal(status, 200, 'requests are served while Redis is down');
    for (const forbidden of [SECRET, 'someuser', '127.0.0.1:1', 'rediss://']) assert.ok(!output.includes(forbidden), `the output contains "${forbidden}"`);
  });

  it('starts when the Redis host name does not exist', async () => {
    const { output, status } = await run(`rediss://u:${SECRET}@no-such-host.invalid:6379`, (o) => o.includes('Redis: unavailable') && o.includes('server is running'));
    assert.match(output, /Redis: unavailable \((ENOTFOUND|EAI_AGAIN)\)/);
    assert.equal(status, 200);
    assert.ok(!output.includes(SECRET) && !output.includes('no-such-host'));
  });
});
