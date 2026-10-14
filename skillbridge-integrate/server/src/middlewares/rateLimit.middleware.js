import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../lib/redis.js";

const makeStore = () =>
  new RedisStore({
    sendCommand: async (...args) => {
      try {
        if (!redis.isReady) {
          throw new Error("Redis not ready");
        }
        return await redis.sendCommand(args);
      } catch (err) {
        console.error("Rate limit Redis call failed:", err.message);
        throw err; 
      }
    },
  });

const aiGenerationLimiter = rateLimit({
  store: makeStore(),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4, // 4 requests per hour per IP
  skipFailedRequests: true, // if response is 4xx/5xx, don't count it
  passOnStoreError: true, // Fail-open if Redis is down
  message: {
    success: false,
    message: "Too many AI generation requests. Please try again after an hour.",
  },
  standardHeaders: true, // sends RateLimit headers in response
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  store: makeStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/register attempts per 15 min
  passOnStoreError: true, // Fail-open if Redis is down
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const googleLinkLimiter = rateLimit({
  store: makeStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 account link attempts per 15 min
  passOnStoreError: true, // Fail-open if Redis is down
  message: {
    success: false,
    message: "Too many account linking requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { aiGenerationLimiter, authLimiter, googleLinkLimiter };

