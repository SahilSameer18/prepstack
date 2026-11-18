// cluster.js runs one server copy per core. The copies share nothing in memory, so it refuses to start without Redis (unless told it is only
// a measurement), and with the switch it starts the copies and serves requests.
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const os = require('node:os');
const net = require('node:net');
const path = require('node:path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const CLUSTER = path.join(__dirname, '..', 'cluster.js');
const freePort = () => new Promise((resolve) => { const s = net.createServer().listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
const baseEnv = { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, NODE_ENV: 'test', ACCESS_SECRET: 'a'.repeat(40), REFRESH_SECRET: 'b'.repeat(40), GOOGLE_CLIENT_ID: 'fake-client-id' };

describe('cluster.js', () => {
  let mongod;
  before(async () => { mongod = await MongoMemoryServer.create(); });
  after(async () => { await mongod.stop(); });

  it('refuses to start several copies without REDIS_URL, and says why', () => {
    const run = spawnSync(process.execPath, [CLUSTER], { cwd: os.tmpdir(), env: { ...baseEnv, WEB_CONCURRENCY: '2', MONGO_URI: mongod.getUri(), REDIS_URL: '' }, encoding: 'utf8', timeout: 20000 });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /Cluster mode needs REDIS_URL/);
  });

  it('starts the requested number of copies when told state in memory is acceptable, and they serve requests', async () => {
    const port = await freePort();
    const child = spawn(process.execPath, [CLUSTER], {
      cwd: os.tmpdir(), stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...baseEnv, WEB_CONCURRENCY: '2', CLUSTER_ALLOW_MEMORY_STATE: '1', MONGO_URI: mongod.getUri(), REDIS_URL: '', PORT: String(port) },
    });
    let output = '';
    child.stdout.on('data', (d) => { output += d; });
    child.stderr.on('data', (d) => { output += d; });
    try {
      const end = Date.now() + 40000;
      while (Date.now() < end && (output.match(/server is running/g) || []).length < 2) await new Promise((r) => setTimeout(r, 100));
      assert.match(output, /cluster: starting 2 server copies/);
      assert.equal((output.match(/server is running/g) || []).length, 2, 'both copies are listening');
      for (let i = 0; i < 6; i += 1) assert.equal((await fetch(`http://127.0.0.1:${port}/api/sheets`)).status, 200);
    } finally {
      child.kill();
    }
  });
});
