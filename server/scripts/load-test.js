// A small load test of the REAL server process (server.js on an in-memory MongoDB), to find where PrepStack slows down first.
// Run: npm run load:test           (REDIS_URL, if set in server/.env, is used by the server: npm run load:test:redis)
//
// It starts the server as its own process, makes 40 users with a plan each, then runs a mix of requests at 10, 50 and 100 at once:
//   public reads (sheet list, one sheet, notes subject), the public plan preview (CPU work), the dashboard, the plan, saving a note.
// A probe asks /health every 100 ms during the run: if the server is busy with one long job, the probe waits too, so its slowest
// answers show how long the event loop was blocked (a single Node process serves every request on one thread).
// CLUSTER=4 starts cluster.js with 4 server copies instead of one (state in memory, so only the throughput is meaningful).
// ONLY='GET /api/plan' (a part of a scenario name) runs just that request and prints the server CPU it costs per request.
// PROFILE=1 also records a CPU profile of the server and prints where its time went (which package or file, which function).
//
// Read the result as a RANKING of what is slow, not as the capacity of your host: the database here is in memory on the same machine,
// and your laptop is many times faster than the free Render instance (0.1 CPU). Multiply the CPU-bound times by that ratio, not the rest.
const os = require('node:os');
const net = require('node:net');
const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const redisUrl = process.env.REDIS_URL; // the harness below removes it from this process; the server child gets it back only for load:test:redis
const t = require('../test/helpers/setup');

const LEVELS = (process.env.LEVELS || '10,50,100').split(',').map(Number);
const SECONDS = Number(process.env.SECONDS || 12);
const USERS = 40;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// CPU seconds used so far by some processes (Windows only; elsewhere the line is just left out): tells which process is the busy one
const cpuSeconds = (pids) => {
  if (process.platform !== 'win32' || !pids.every(Boolean)) return null;
  try {
    const out = require('node:child_process').execFileSync('powershell', ['-NoProfile', '-Command', pids.map((p) => '(Get-Process -Id ' + p + ').TotalProcessorTime.TotalSeconds').join(';')], { encoding: 'utf8' });
    return out.trim().split(/\r?\n/).map(Number);
  } catch { return null; }
};
const freePort = () => new Promise((resolve) => { const s = net.createServer().listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
const pct = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0);
const fmt = (n) => n.toFixed(1).padStart(8);

// Where did the server's own CPU time go? Self time per package or source file, and per function.
function summarizeProfile(dir) {
  const file = fs.readdirSync(dir).filter((name) => name.endsWith('.cpuprofile')).sort().pop();
  if (!file) { console.log('no CPU profile was written'); return; }
  const profile = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const byId = new Map(profile.nodes.map((node) => [node.id, node]));
  const self = new Map();
  profile.samples.forEach((id, i) => self.set(id, (self.get(id) || 0) + (profile.timeDeltas[i] || 0)));
  const total = [...self.values()].reduce((a, b) => a + b, 0) || 1;
  const places = new Map();
  const functions = new Map();
  const place = (url) => {
    if (!url) return '(native / internal)';
    const m = url.replace(/\\/g, '/').match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
    if (m) return 'package ' + m[1];
    if (url.startsWith('node:')) return url;
    const i = url.replace(/\\/g, '/').lastIndexOf('/server/');
    return i >= 0 ? url.replace(/\\/g, '/').slice(i + 1) : url;
  };
  for (const [id, micros] of self) {
    const { callFrame } = byId.get(id);
    const where = place(callFrame.url);
    places.set(where, (places.get(where) || 0) + micros);
    const name = (callFrame.functionName || '(anonymous)') + '  ' + where.replace(/^package /, '') + ':' + (callFrame.lineNumber + 1);
    functions.set(name, (functions.get(name) || 0) + micros);
  }
  const top = (map, n) => [...map].sort((a, b) => b[1] - a[1]).slice(0, n);
  console.log('\n=== where the server spent its own CPU time (self time, ' + (total / 1e6).toFixed(1) + ' s sampled) ===');
  for (const [name, micros] of top(places, 12)) console.log(((micros / total) * 100).toFixed(1).padStart(5) + ' %  ' + name);
  console.log('\n--- top functions ---');
  for (const [name, micros] of top(functions, 18)) console.log(((micros / total) * 100).toFixed(1).padStart(5) + ' %  ' + name);
}

(async () => {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  const { DSASheet, Notes } = t.getModels();
  await DSASheet.insertMany(t.sheetSeedData());
  const notesData = require('../src/modules/notes/content/os');
  await Notes.create({ subject: notesData.subject, subjectSlug: 'os', sections: notesData.sections });
  await mongoose.disconnect();

  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const env = {
    PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, NODE_ENV: 'production', PORT: String(port), MONGO_URI: mongod.getUri(),
    ACCESS_SECRET: 'a'.repeat(40), REFRESH_SECRET: 'b'.repeat(40), GOOGLE_CLIENT_ID: 'fake-client-id', REDIS_URL: process.env.LOAD_TEST_REDIS === '1' ? (redisUrl || '') : '',
    ...(process.env.CLUSTER ? { WEB_CONCURRENCY: process.env.CLUSTER, CLUSTER_ALLOW_MEMORY_STATE: '1' } : {}), REDIS_PREFIX: `prepstack:loadtest:${crypto.randomBytes(4).toString('hex')}:`, ALLOWED_ORIGINS: base,
  };
  const profileDir = process.env.PROFILE === '1' ? fs.mkdtempSync(path.join(os.tmpdir(), 'prepstack-prof-')) : null;
  const nodeArgs = profileDir ? ['--cpu-prof', '--cpu-prof-dir=' + profileDir, '--require', path.join(__dirname, 'load-test-exit.js')] : [];
  const server = spawn(process.execPath, [...nodeArgs, path.join(__dirname, '..', process.env.CLUSTER ? 'cluster.js' : 'server.js')], { cwd: os.tmpdir(), env, stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
  let log = '';
  server.stdout.on('data', (d) => { log += d; });
  server.stderr.on('data', (d) => { log += d; });
  for (let i = 0; i < 300 && !log.includes('server is running'); i += 1) await sleep(100);
  if (!log.includes('server is running')) { console.error('the server did not start:\n' + log); server.kill(); process.exit(1); }
  const finish = async (code) => {
    if (profileDir) { server.send('exit'); await new Promise((resolve) => { server.once('exit', resolve); setTimeout(resolve, 15000); }); summarizeProfile(profileDir); } else server.kill();
    await mongod.stop();
    process.exit(code);
  };

  let ipCounter = 0;
  const ip = () => `10.${(ipCounter >> 16) & 255}.${(ipCounter >> 8) & 255}.${ipCounter++ & 255}`; // a new address per request: the limiters never get in the way
  const call = (method, url, { cookies, body } = {}) => fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip(), ...(cookies ? { Cookie: cookies } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

  // users, each with a plan
  const users = [];
  for (let i = 0; i < USERS; i += 1) {
    const res = await call('POST', '/api/auth/register', { body: { username: `load_${i}_${crypto.randomBytes(3).toString('hex')}`, email: `load${i}_${crypto.randomBytes(3).toString('hex')}@example.com`, password: 'Passw0rdX' } });
    if (res.status !== 201) { console.error('register failed', res.status, await res.text()); await finish(1); }
    const cookies = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
    const plan = await call('POST', '/api/plan', { cookies, body: { goalType: 'placements', style: 'one-topic', weeks: 8, weekdayHours: 2, weekendHours: 3, restDay: null, sheetSlug: 'blind-75', subjects: [] } });
    if (plan.status !== 201) { console.error('plan failed', plan.status, await plan.text()); await finish(1); }
    users.push({ cookies, link: (await DSASheet0()) });
  }
  async function DSASheet0() { return 'https://leetcode.com/problems/two-sum/'; }

  const previewBody = (n) => ({ goalType: 'placements', style: 'one-topic', weeks: 4 + (n % 20), weekdayHours: 1 + (n % 4), weekendHours: 3, restDay: null, sheetSlug: 'neetcode-150', subjects: ['os', 'dbms'] });
  let n = 0;
  const scenarios = [
    { name: 'GET /api/sheets', weight: 10, run: () => call('GET', '/api/sheets') },
    { name: 'GET /api/sheets/:slug', weight: 10, run: () => call('GET', '/api/sheets/blind-75') },
    { name: 'GET /api/notes/os', weight: 10, run: () => call('GET', '/api/notes/os') },
    { name: 'POST /api/plan/preview', weight: 15, run: () => call('POST', '/api/plan/preview', { body: previewBody(n++) }) },
    { name: 'GET /api/user/dashboard-summary', weight: 25, run: () => call('GET', '/api/user/dashboard-summary', { cookies: users[n++ % USERS].cookies }) },
    { name: 'GET /api/plan', weight: 20, run: () => call('GET', '/api/plan', { cookies: users[n++ % USERS].cookies }) },
    { name: 'PUT /api/problem-notes', weight: 10, run: () => call('PUT', '/api/problem-notes', { cookies: users[n++ % USERS].cookies, body: { problemLink: users[0].link, pattern: 'Two Pointers', approach: 'Sort first. ' + n } }) },
  ];
  const chosen = process.env.ONLY ? scenarios.filter((x) => x.name.includes(process.env.ONLY)) : scenarios;
  if (!chosen.length) { console.error('no scenario matches ONLY'); await finish(1); }
  const total = chosen.reduce((s, x) => s + x.weight, 0);
  const pick = () => { let r = Math.random() * total; for (const s of chosen) { r -= s.weight; if (r <= 0) return s; } return chosen[0]; };

  const watched = { server: server.pid, mongod: mongod.instanceInfo?.instance?.mongodProcess?.pid, loadgen: process.pid };
  console.log('machine: ' + os.cpus().length + ' logical CPUs. CPU use below is in cores (1.0 = one core fully busy).');
  for (const level of LEVELS) {
    const cpuBefore = cpuSeconds(Object.values(watched));
    const stats = new Map(scenarios.map((s) => [s.name, { times: [], ok: 0, other: {} }]));
    const probe = [];
    let running = true;
    const prober = (async () => { while (running) { const b = process.hrtime.bigint(); try { await fetch(base + '/health'); probe.push(Number(process.hrtime.bigint() - b) / 1e6); } catch { probe.push(10000); } await sleep(100); } })();
    const until = Date.now() + SECONDS * 1000;
    const started = Date.now();
    await Promise.all(Array.from({ length: level }, async () => {
      while (Date.now() < until) {
        const s = pick();
        const b = process.hrtime.bigint();
        let status = 0;
        try { status = (await s.run()).status; } catch { status = -1; }
        const ms = Number(process.hrtime.bigint() - b) / 1e6;
        const st = stats.get(s.name);
        if (status >= 200 && status < 300) { st.ok += 1; st.times.push(ms); } else st.other[status] = (st.other[status] || 0) + 1;
      }
    }));
    running = false; await prober;
    const elapsed = (Date.now() - started) / 1000;
    const cpuAfter = cpuSeconds(Object.values(watched));
    const all = [...stats.values()].flatMap((s) => s.times).sort((a, b) => a - b);
    const errors = [...stats.values()].reduce((sum, s) => sum + Object.entries(s.other).reduce((x, [k, v]) => x + (k === '429' ? 0 : v), 0), 0);
    const limited = [...stats.values()].reduce((sum, s) => sum + (s.other[429] || 0), 0);
    probe.sort((a, b) => a - b);
    console.log(`\n=== ${level} at once, ${SECONDS} s: ${(all.length / elapsed).toFixed(0)} requests/s, ${all.length} answered, ${errors} errors, ${limited} rate-limited ===`);
    console.log('overall'.padEnd(34), 'p50'.padStart(8), 'p95'.padStart(8), 'p99'.padStart(8), ' ms');
    console.log(''.padEnd(34), fmt(pct(all, 0.5)), fmt(pct(all, 0.95)), fmt(pct(all, 0.99)));
    for (const [name, st] of stats) {
      const sorted = st.times.sort((a, b) => a - b);
      console.log(name.padEnd(34), fmt(pct(sorted, 0.5)), fmt(pct(sorted, 0.95)), fmt(pct(sorted, 0.99)), `  (${st.ok} ok${Object.keys(st.other).length ? ', other: ' + JSON.stringify(st.other) : ''})`);
    }
    if (process.env.ONLY && cpuBefore && cpuAfter && all.length) console.log('server CPU per request: ' + (((cpuAfter[0] - cpuBefore[0]) * 1000) / all.length).toFixed(1) + ' ms  (' + process.env.ONLY + ')');
    if (cpuBefore && cpuAfter) console.log('CPU use: ' + Object.keys(watched).map((name, i) => name + ' ' + ((cpuAfter[i] - cpuBefore[i]) / elapsed).toFixed(2)).join(', '));
    console.log(`event-loop probe (/health every 100 ms): p50 ${pct(probe, 0.5).toFixed(1)} ms, p95 ${pct(probe, 0.95).toFixed(1)} ms, worst ${pct(probe, 1).toFixed(1)} ms`);
  }
  await finish(0);
})().catch((error) => { console.error(error); process.exit(1); });
