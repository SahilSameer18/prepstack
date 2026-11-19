// A short-lived cache of "this login session is still active" for the auth middleware (docs/plans/REDIS_PLAN.md, phase 6, step R3).
// Every signed-in request used to read the user from MongoDB just to check the session. Now the answer is kept for a few seconds in this process
// and up to 30 seconds in Redis (shared by every server copy). What is cached is only the study time zone, the day start and when the session
// ends: never a token, a password hash or an email.
//
// Revoking (logout, logout-all, revoking one session, password change or reset, a replayed refresh token, deleting the account) and changing the
// study calendar call invalidateUser(), which forgets this process's copies at once and raises the user's version number in Redis, so every
// other copy sees its cached answer as old. A copy never keeps an answer longer than the session itself lasts.
// Limits: another server copy can still answer from its own memory for up to LOCAL_MS (5 s) after a revoke, and if Redis is down at that moment
// its cached answer can live up to REDIS_MS (30 s). SESSION_CACHE=off turns the whole cache off (every request reads MongoDB again).
const { getRedis, redisKey } = require('../config/redis');

const LOCAL_MS = 5000;
const REDIS_MS = 30000;
const LOCAL_MAX = 1000;

// Write the answer only if the user's version has not moved since it was read: a revoke that happened while MongoDB was being read wins.
const FILL = `
local version = tonumber(redis.call('GET', KEYS[2]) or '0')
if version ~= tonumber(ARGV[1]) then return 0 end
redis.call('SET', KEYS[1], ARGV[2], 'PX', ARGV[3])
return 1`;
const BUMP = `
local version = redis.call('INCR', KEYS[1])
redis.call('PEXPIRE', KEYS[1], ARGV[1])
return version`;
const VERSION_KEEP_MS = 24 * 60 * 60 * 1000; // longer than any entry lives, so a forgotten version can never revive an old entry

const local = new Map(); // `${userId}:${sid}` -> { entry, until }
let invalidations = 0; // raised by every invalidateUser: a fill that started before it is refused

const enabled = () => String(process.env.SESSION_CACHE || '').toLowerCase() !== 'off';
const versionKey = (userId) => redisKey('session', 'v', String(userId));
const entryKey = (userId, sid) => redisKey('session', String(userId), String(sid));

const remember = (key, entry, until) => {
  if (local.size >= LOCAL_MAX) local.delete(local.keys().next().value);
  local.set(key, { entry, until });
};

/**
 * Returns the cached { studyTimeZone, studyDayStart } of an active session, or calls load() (one MongoDB read) and caches its answer.
 * load() returns { entry, expiresAt } for an active session or null for an inactive one (never cached).
 */
async function sessionFor(userId, sid, load) {
  const fromLoad = async () => { const loaded = await load(); return loaded ? loaded.entry : null; };
  if (!enabled()) return fromLoad();

  const now = Date.now();
  const key = `${userId}:${sid}`;
  const hit = local.get(key);
  if (hit && hit.until > now) return hit.entry;
  local.delete(key);

  const seen = invalidations;
  const client = getRedis();
  let version = null;
  if (client) {
    try {
      const [raw, current] = await client.mget(entryKey(userId, sid), versionKey(userId));
      version = Number(current || 0);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached.v === version && cached.exp > Date.now()) {
          if (seen === invalidations) remember(key, cached.entry, Math.min(Date.now() + LOCAL_MS, cached.exp));
          return cached.entry;
        }
      }
    } catch { version = null; } // Redis failed: read MongoDB, do not write to Redis
  }

  const loaded = await load();
  if (!loaded) return null;
  const expiresAt = new Date(loaded.expiresAt).getTime();
  const after = Date.now();
  if (seen === invalidations) remember(key, loaded.entry, Math.min(after + LOCAL_MS, expiresAt));
  if (client && version !== null && seen === invalidations) {
    // Not awaited: the request must not wait for a cache write.
    Promise.resolve(client.eval(FILL, 2, entryKey(userId, sid), versionKey(userId), version,
      JSON.stringify({ v: version, exp: expiresAt, entry: loaded.entry }), Math.max(1, Math.min(REDIS_MS, expiresAt - after)))).catch(() => {});
  }
  return loaded.entry;
}

/** Forget everything cached about this user's sessions (call after the database change, before answering). */
async function invalidateUser(userId) {
  invalidations += 1;
  const prefix = `${userId}:`;
  for (const key of local.keys()) if (key.startsWith(prefix)) local.delete(key);
  const client = getRedis();
  if (!client) return;
  try { await client.eval(BUMP, 1, versionKey(userId), VERSION_KEEP_MS); } catch { /* the entries still end within REDIS_MS */ }
}

const resetSessionCache = () => { local.clear(); };

module.exports = { sessionFor, invalidateUser, resetSessionCache };
