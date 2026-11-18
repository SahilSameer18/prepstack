// The one Redis connection of the app (docs/plans/REDIS_PLAN.md, step R0).
//
// Redis is optional: without REDIS_URL, or when it cannot be reached, getRedis() answers null and every caller falls back to what it
// did before (memory, MongoDB). The server never waits for Redis to start and never crashes because of it.
// MongoDB stays the source of truth: Redis holds only counters, locks, caches and queues, which can be lost without losing user data.
// The connection string holds a password: it is never logged and never put in an error message.
const Redis = require('ioredis');

const CONNECT_TIMEOUT_MS = 5000;
const CLOSE_TIMEOUT_MS = 2000;
const COMMAND_TIMEOUT_MS = 2000;

let client = null;
let state = 'disabled'; // disabled | connecting | ready | error
let lastError = null; // an error code such as ECONNREFUSED, never a message that could carry the address

const log = (message) => console.log(`Redis: ${message}`);

// Start connecting in the background. Safe to call once at startup; the server does not wait for it.
function connectRedis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    state = 'disabled';
    log('disabled (REDIS_URL is not set); using memory and MongoDB');
    return null;
  }
  if (client) return client;
  state = 'connecting';
  client = new Redis(url, {
    connectTimeout: CONNECT_TIMEOUT_MS,
    commandTimeout: COMMAND_TIMEOUT_MS, // a command on a connection that went silent fails in time, so callers fall back instead of waiting
    maxRetriesPerRequest: 1, // a command that cannot be sent fails fast, so callers can fall back instead of hanging
    enableOfflineQueue: false, // never pile commands up while disconnected
    retryStrategy: (attempt) => Math.min(attempt * 500, 5000), // keep trying in the background, at most every 5 seconds
  });
  client.on('ready', () => {
    const recovered = state === 'error';
    state = 'ready';
    lastError = null;
    log(recovered ? 'connected again' : 'connected');
  });
  client.on('error', (err) => {
    const code = err?.code || err?.name || 'ERROR';
    if (state === 'error' && lastError === code) return; // say it once, not on every retry
    state = 'error';
    lastError = code;
    console.warn(`Redis: unavailable (${code}); continuing without it`);
  });
  client.on('end', () => { if (state === 'ready') state = 'error'; });
  return client;
}

// The client, or null when Redis is off or not connected right now. Callers must handle null (the fail modes are in the plan, section 4).
const getRedis = () => (client && state === 'ready' ? client : null);

const redisStatus = () => ({ state, error: lastError });

// Keys never collide between environments, because one hosted Redis may serve both development and the live site.
const redisKey = (...parts) => `${process.env.REDIS_PREFIX || `prepstack:${process.env.NODE_ENV || 'development'}:`}${parts.join(':')}`;

// Close cleanly: QUIT lets a command in flight finish; if it hangs, cut the connection.
async function closeRedis() {
  const current = client;
  client = null;
  state = 'disabled';
  if (!current) return;
  try {
    await Promise.race([
      current.quit(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('close timeout')), CLOSE_TIMEOUT_MS).unref()),
    ]);
  } catch {
    current.disconnect();
  }
}

// Tests only: use a stand-in client (test/helpers/fake-redis.js) as if it were connected.
const setRedisForTests = (fake) => { client = fake; state = fake ? 'ready' : 'disabled'; lastError = null; };

module.exports = { connectRedis, getRedis, redisStatus, redisKey, closeRedis, setRedisForTests };
