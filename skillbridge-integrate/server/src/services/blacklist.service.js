import redis from "../lib/redis.js";
import { safeRedisCall } from "../lib/safeRedis.js";
import { BLACKLIST_PREFIX } from "../config/redis.constants.js";

/**
 * Blacklists a token until its own JWT expiry — no longer, since an
 * expired token is already rejected by jwt.verify regardless.
 */
async function blacklist(token, exp) {
  const ttlSeconds = exp - Math.floor(Date.now() / 1000);
  if (ttlSeconds <= 0) return;

  await safeRedisCall(() =>
    redis.set(`${BLACKLIST_PREFIX}${token}`, "1", { EX: ttlSeconds })
  );
}

/**
 * Fail-open: if Redis is unreachable, assumes NOT blacklisted.
 * Intentional availability-over-security trade-off — see README.
 */
async function isBlacklisted(token) {
  const result = await safeRedisCall(
    () => redis.exists(`${BLACKLIST_PREFIX}${token}`),
    0
  );
  return Boolean(result);
}

export default { blacklist, isBlacklisted };

