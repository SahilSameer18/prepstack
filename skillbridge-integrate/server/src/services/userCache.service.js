import redis from "../lib/redis.js";
import { safeRedisCall } from "../lib/safeRedis.js";
import { USER_CACHE_PREFIX, USER_CACHE_TTL_SECONDS } from "../config/redis.constants.js";

function cacheKey(userId) {
  return `${USER_CACHE_PREFIX}${userId}`;
}

async function get(userId) {
  const cached = await safeRedisCall(() => redis.get(cacheKey(userId)), null);
  return cached ? JSON.parse(cached) : null;
}

async function set(userId, userData) {
  await safeRedisCall(() =>
    redis.set(cacheKey(userId), JSON.stringify(userData), { EX: USER_CACHE_TTL_SECONDS })
  );
}

/**
 * Call after ANY operation that mutates the User row: profile update,
 * Google account linking, Google login avatar sync, future admin edits,
 * future disable/delete flows. Centralized so a new mutation path can't
 * forget to invalidate.
 */
async function invalidate(userId) {
  await safeRedisCall(() => redis.del(cacheKey(userId)));
}

export default { get, set, invalidate };

