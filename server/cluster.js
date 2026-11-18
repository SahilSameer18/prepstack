// Runs several copies of the server on one machine, one per CPU core (npm run start:cluster). A single Node process uses ONE core, so on a
// host with several cores this is how PrepStack uses them. The copies share nothing in memory, so the shared state must live in Redis:
// rate limits, the "being generated now" locks and the caches. Without Redis each copy would count and lock on its own, so this refuses to
// start without REDIS_URL (CLUSTER_ALLOW_MEMORY_STATE=1 overrides it, for measuring only).
// WEB_CONCURRENCY sets the number of copies (hosts such as Render set it); the default is the number of cores, at most 8.
require('dotenv').config();
const cluster = require('node:cluster');
const os = require('node:os');

const wanted = Number(process.env.WEB_CONCURRENCY) || os.availableParallelism();
const workers = Math.max(1, Math.min(8, wanted));

if (cluster.isPrimary) {
  if (workers > 1 && !process.env.REDIS_URL && process.env.CLUSTER_ALLOW_MEMORY_STATE !== '1') {
    console.error('Cluster mode needs REDIS_URL: the copies must share rate limits, locks and caches. Run `npm start` (one copy) or set REDIS_URL.');
    process.exit(1);
  }
  console.log(`cluster: starting ${workers} server cop${workers === 1 ? 'y' : 'ies'}`);
  let stopping = false;
  const crashes = [];
  const start = () => cluster.fork();
  for (let i = 0; i < workers; i += 1) start();

  cluster.on('exit', (worker, code, signal) => {
    if (stopping) return;
    console.error(`cluster: copy ${worker.process.pid} stopped (${signal || code}); starting a new one`);
    // a copy that keeps crashing at once (a broken setting) must not be restarted in a tight loop
    const now = Date.now();
    crashes.push(now);
    while (crashes.length && now - crashes[0] > 60000) crashes.shift();
    if (crashes.length > workers * 5) { console.error('cluster: the copies keep crashing, giving up'); process.exit(1); }
    setTimeout(start, Math.min(5000, crashes.length * 500));
  });

  const stop = (reason) => {
    if (stopping) return;
    stopping = true;
    console.log(`cluster: ${reason}, asking the copies to finish and stop`);
    for (const worker of Object.values(cluster.workers)) worker.process.kill('SIGTERM'); // each copy closes its server and databases (server.js)
    setTimeout(() => process.exit(0), 12000).unref();
    cluster.on('exit', () => { if (!Object.keys(cluster.workers).length) process.exit(0); });
  };
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
} else {
  require('./server.js');
}
