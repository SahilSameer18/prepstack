import { createClient } from "redis";

let hasConnectedOnce = false;
const MAX_INITIAL_RETRIES = 3;

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy(retries) {
      if (!hasConnectedOnce && retries > MAX_INITIAL_RETRIES) {
        // give up on the initial connection attempt so startup doesn't hang forever
        return new Error("Redis unavailable at startup, giving up initial retries");
      }
      return Math.min(retries * 100, 3000);
    },
    connectTimeout: 5000, // don't hang startup indefinitely
  },
});

redis.on("ready", () => {
  hasConnectedOnce = true;
});

redis.on("error", (err) => console.error("Redis connection error:", err.message));

export async function connectRedis() {
  // isOpen is correct here: we're asking "does a connect() call need to
  // happen at all," not "can commands be sent right now"
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export default redis;
