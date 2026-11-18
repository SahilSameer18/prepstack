// The host acceptance check from docs/plans/REDIS_PLAN.md section 3b, for the Redis you set in server/.env. Run: npm run redis:check
// It reads REDIS_URL, prints what it finds (never the address or the password) and writes only keys of its own, which it deletes again.
// Checks 4 (do jobs survive a restart) and 5 (idle command count) need you: the script tells you what to do.
require('dotenv').config();
const Redis = require('ioredis');

const url = process.env.REDIS_URL;
if (!url) {
  console.error('REDIS_URL is not set in server/.env. Add the service address there first (never paste it in a chat or commit it).');
  process.exit(1);
}

// What the address looks like, without showing any of it: enough to spot a typo or a half-pasted value.
try {
  const parsed = new URL(url);
  console.log(`address shape: scheme ${parsed.protocol.replace(':', '')}, user ${parsed.username ? 'yes' : 'no'}, password ${parsed.password ? 'yes' : 'NO'}, host ${parsed.hostname ? 'yes' : 'NO'}, port ${parsed.port || 'none'}`);
} catch {
  console.error('REDIS_URL is not a valid address. Copy the whole Service URI again (no spaces, no quotes around it).');
  process.exit(1);
}

const results = [];
const note = (name, ok, detail) => { results.push({ name, ok }); console.log(`${ok === null ? '  ?' : ok ? ' OK' : 'BAD'}  ${name}${detail ? `: ${detail}` : ''}`); };
const fieldOf = (info, name) => (info.match(new RegExp(`^${name}:(.*)$`, 'm')) || [])[1]?.trim();
const median = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)];

(async () => {
  // The offline queue stays on here so the first command waits for the connection (the app's own client fails fast instead).
  const redis = new Redis(url, { connectTimeout: 10000, maxRetriesPerRequest: 1, retryStrategy: () => null });
  let firstError = null;
  redis.on('error', (error) => { firstError ||= /WRONGPASS|NOAUTH/.test(error.message || '') ? 'AUTH_FAILED (wrong or missing password)' : error.code || error.name; }); // a code only: messages can carry the address
  const probe = `prepstack:hostcheck:${Date.now()}`;
  try {
    // connection, TLS and round-trip time (the distance to the host decides how every later measurement reads)
    const times = [];
    for (let i = 0; i < 20; i += 1) { const t = process.hrtime.bigint(); await redis.ping(); times.push(Number(process.hrtime.bigint() - t) / 1e6); }
    note('connects and answers PING', true, `median ${median(times).toFixed(1)} ms over 20 round trips (this is the network, not Redis)`);

    // check 1: a version BullMQ accepts (Redis 6.2 or newer, or Valkey)
    const server = await redis.info('server');
    const valkey = fieldOf(server, 'valkey_version');
    const version = valkey || fieldOf(server, 'redis_version');
    const [major, minor] = (version || '0.0').split('.').map(Number);
    note('server version', Boolean(valkey) || major > 6 || (major === 6 && minor >= 2), `${valkey ? 'Valkey' : 'Redis'} ${version}`);

    // check 2: eviction must be noeviction for queues
    // Managed hosts often block CONFIG, so INFO memory (which also lists the policy) is the way to read it.
    const memory = await redis.info('memory');
    const policy = fieldOf(memory, 'maxmemory_policy');
    note('eviction policy is noeviction (BullMQ needs it)', policy ? policy === 'noeviction' : null, `${policy || 'not shown'}; memory limit ${fieldOf(memory, 'maxmemory_human') || 'not shown'}, used ${fieldOf(memory, 'used_memory_human') || 'not shown'}`);

    // what the app itself needs: expiry, SET NX PX (locks), atomic counters and a Lua script (limiters)
    await redis.set(probe, '1', 'EX', 30);
    const ttl = await redis.ttl(probe);
    note('expiry works', ttl > 0 && ttl <= 30, `TTL ${ttl}s`);
    const first = await redis.set(`${probe}:lock`, 'a', 'PX', 5000, 'NX');
    const second = await redis.set(`${probe}:lock`, 'b', 'PX', 5000, 'NX');
    note('SET NX PX works (locks)', first === 'OK' && second === null);
    const counts = await Promise.all(Array.from({ length: 50 }, () => redis.incr(`${probe}:n`)));
    note('50 parallel INCR are exact (counters)', Math.max(...counts) === 50 && new Set(counts).size === 50);
    const lua = await redis.eval("return redis.call('INCR', KEYS[1])", 1, `${probe}:lua`);
    note('Lua scripts run (atomic limiters)', lua === 1);

    // check 3: connections used (add one for each server copy and each worker you plan)
    const clients = await redis.info('clients');
    note('connections right now', null, `${fieldOf(clients, 'connected_clients')} (this script included); the plan needs about 1 per server and 2 to 3 per BullMQ worker`);

    // check 5 starts here: the command count now
    const stats = await redis.info('stats');
    note('commands processed so far', null, `${fieldOf(stats, 'total_commands_processed')}. Run this again after the app has been idle for a day: the difference is the idle cost`);

    const persistence = await redis.info('persistence').catch(() => '');
    note('persistence (read-only look)', null, `rdb_last_save_time ${fieldOf(persistence, 'rdb_last_save_time') || 'not shown'}, aof_enabled ${fieldOf(persistence, 'aof_enabled') || 'not shown'}`);
    console.log('\nStill to do by hand: check 4. Create 20 test jobs later in R6, restart the service from its console, and count how many survive.');
  } catch (error) {
    note('connection or command', false, firstError || error.code || 'unknown (run again; if it repeats, check the address in server/.env)');
  } finally {
    try { await redis.del(probe, `${probe}:lock`, `${probe}:n`, `${probe}:lua`); } catch { /* the keys expire anyway */ }
    redis.disconnect();
  }
  const bad = results.filter((r) => r.ok === false).length;
  console.log(bad ? `\n${bad} check(s) failed. A host that fails one is not used for the live queue.` : '\nNo check failed.');
  process.exit(bad ? 1 : 0);
})();
