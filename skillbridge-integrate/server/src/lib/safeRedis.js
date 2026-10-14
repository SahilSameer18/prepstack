import redis from "./redis.js";

/**
 * Runs a Redis operation safely. Checks `isReady`, not just `isOpen` —
 * a reconnecting client can have an open socket that isn't yet accepting
 * commands, and isOpen alone wouldn't catch that window. Returns
 * `fallback` on any failure instead of throwing, so a Redis outage never
 * takes down a request.
 */
export async function safeRedisCall(fn, fallback = null) {
  try {
    if (!redis.isReady) return fallback;
    return await fn();
  } catch (err) {
    console.error("Redis operation failed:", err.message);
    return fallback;
  }
}
