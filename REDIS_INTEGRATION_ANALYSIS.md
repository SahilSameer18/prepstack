# Comprehensive Architectural & Implementation Analysis
# Redis Integration Plan — PrepStack Backend (Upstash · 3 Phases)

**Date:** August 5, 2026  
**Target Repository:** `prepstack/server`  
**Integration Stack:** Node.js (Express 5), Upstash Redis (TCP / TLS), `redis` v6, `rate-limit-redis` v6, `express-rate-limit` v8, MongoDB (Mongoose 9)

---

## Table of Contents
1. [Executive Summary & Readiness Verdict](#1-executive-summary--readiness-verdict)
2. [Codebase Architecture & Existing Integration Points](#2-codebase-architecture--existing-integration-points)
3. [Deep-Dive Evaluation by Phase](#3-deep-dive-evaluation-by-phase)
   - [Phase 0 — Upstash & TLS Setup](#phase-0--upstash--tls-setup)
   - [Phase 1 — Redis Foundation Architecture](#phase-1--redis-foundation-architecture)
   - [Phase 2 — Rate Limiting Strategy & Nuances](#phase-2--rate-limiting-strategy--nuances)
   - [Phase 3 — Content & User Stats Caching](#phase-3--content--user-stats-caching)
4. [Critical Gaps & Edge Cases Discovered](#4-critical-gaps--edge-cases-discovered)
   - [Gap 1: Incomplete User Stats Invalidation](#gap-1-incomplete-user-stats-invalidation-on-project-actions)
   - [Gap 2: Standalone Seed Scripts Invalidation Bug](#gap-2-standalone-seed-scripts-invalidation-bug)
   - [Gap 3: AI Rate Limiter Keying & Route Order](#gap-3-ai-rate-limiter-keying--route-order)
   - [Gap 4: Missing Express Reverse-Proxy Trust](#gap-4-missing-express-reverse-proxy-trust)
   - [Gap 5: Process Lifecycle & Graceful Shutdown](#gap-5-process-lifecycle--graceful-shutdown)
5. [Token Revocation & Session Management Review](#5-token-revocation--session-management-review)
6. [Complete Production-Ready File Implementations](#6-complete-production-ready-file-implementations)
7. [Verification & Testing Checklist](#7-verification--testing-checklist)

---

## 1. Executive Summary & Readiness Verdict

The **Redis Integration Plan** is well-conceived, modern, and fits the PrepStack architecture cleanly. It adheres to critical cloud design patterns—notably **fail-open resilience**, **bounded reconnect backoff**, and **clear separation of concerns**.

### Readiness Scorecard
| Dimension | Rating | Summary |
|---|:---:|---|
| **Architecture & Structure** | **9.5 / 10** | Perfectly mirrors `src/config`, `src/utils`, `src/constants`, and `src/services`. |
| **Fail-Open Resilience** | **10 / 10** | Server starts and stays functional even during Redis downtime or network partitions. |
| **Caching Design** | **8.5 / 10** | Content caching is sound; user stats invalidation required project lifecycle triggers. |
| **Rate Limiting** | **8.5 / 10** | Robust stores; requires proxy-trust and user-based keying on AI generation. |
| **CLI & Seed Compatibility** | **7.0 / 10** | Standalone seed scripts needed explicit Redis connect/disconnect handling. |

---

## 2. Codebase Architecture & Existing Integration Points

The PrepStack backend is structured with modular controllers, routes, validation schemas, and database models. The Redis integration directly touches the following files:

```
server/
├── .env                                  ◄── REDIS_URL configuration
├── server.js                             ◄── Redis startup sequencing & lifecycle management
└── src/
    ├── app.js                            ◄── Express reverse proxy settings (trust proxy)
    ├── config/
    │   ├── database.js                   ◄── Mongoose DB connection
    │   └── redis.js                      ◄── [NEW] Node-redis client & bounded reconnect strategy
    ├── constants/
    │   └── redisKeys.js                  ◄── [NEW] Centralized key generators & namespaces
    ├── controllers/
    │   ├── notes.controller.js           ◄── Cached read-through for subject notes
    │   ├── project.controller.js         ◄── Invalidate user stats on project create/delete
    │   ├── sheets.controller.js          ◄── Cached read-through for sheets + invalidate stats on solve
    │   └── user.controller.js            ◄── Cached user stats (5 min TTL)
    ├── middlewares/
    │   └── rateLimit.middleware.js       ◄── [UPDATED] RedisStore-backed rate limiters
    ├── routes/
    │   └── project.routes.js             ◄── Reordered middleware (auth before AI limiter)
    ├── seed/
    │   ├── masterSeed.js                 ◄── Invalidate sheet caches on reseed (with CLI client handling)
    │   └── notesSeed.js                  ◄── Invalidate note caches on reseed (with CLI client handling)
    ├── services/
    │   └── contentCache.service.js       ◄── [NEW] Centralized get/set/delete/invalidate service
    └── utils/
        └── safeRedis.js                  ◄── [NEW] Safe execution wrapper with isReady checking
```

---

## 3. Deep-Dive Evaluation by Phase

### Phase 0 — Upstash & TLS Setup
- **TLS Requirement**: Upstash requires TLS for all connections. Using `rediss://default:<password>@<endpoint>.upstash.io:6379` in `server/.env` is mandatory.
- **Node.js TCP Client (`redis` package)**: Optimal choice over the REST API for socket reuse, lower overhead, and native compatibility with `rate-limit-redis`.
- **Command Budgeting**: Upstash's free tier allows up to 10,000 commands/day. With 24-hour TTL on static sheets/notes, 5-minute TTL on user stats, and efficient rate-limiting, daily usage for standard traffic will remain well within the free quota.

---

### Phase 1 — Redis Foundation Architecture

#### `src/config/redis.js`
- **Reconnection Strategy**: 
  - Uses `hasConnectedOnce` to distinguish initial boot from runtime disconnections.
  - Initial connection retry count is capped at `MAX_INITIAL_RETRIES = 3`. If Redis is offline at boot, the error is thrown, caught in `server.js`, and the server continues booting in fail-open mode.
  - Once connected, subsequent runtime retries use capped exponential backoff (`Math.min(retries * 500, 5000)`), continuously attempting recovery if Upstash undergoes maintenance.
- **`isReady` vs. `isOpen`**:
  - `isOpen` is `true` as soon as the socket is open (even while TLS handshake or authentication is pending).
  - `isReady` is `true` ONLY after the client is authenticated and ready to receive commands. Checking `isReady` inside `safeRedis.js` prevents command queuing stalls during reconnect states.

#### `src/utils/safeRedis.js`
- Catches synchronous and asynchronous exceptions.
- Returns a customizable `fallback` (default: `null`) when Redis is disconnected or when an operation fails, allowing controllers to transparently query MongoDB without crashing.

#### `src/constants/redisKeys.js`
- Namespaces all keys under `prepstack:`.
- Slugs are mapped deterministically (e.g. `prepstack:notes:subject:os`, `prepstack:sheets:slug:blind-75`).

---

### Phase 2 — Rate Limiting Strategy & Nuances

#### `middlewares/rateLimit.middleware.js`
- **Store**: Uses `rate-limit-redis` v6 with `createStore(prefix)`.
- **`passOnStoreError: true`**: Crucial setting in `express-rate-limit`. If Redis experiences downtime, rate limiters fail open rather than blocking legitimate users with 500 errors.
- **`skipFailedRequests: true`**: Prevents 4xx/5xx errors (e.g. invalid credentials or validation failures) from counting against a user's rate limit quota.

---

### Phase 3 — Content & User Stats Caching

#### `services/contentCache.service.js`
- **Serialization**: Objects are stringified before storing and parsed upon retrieval.
- **TTL Strategy**:
  - **DSA Sheets & CS Notes**: 24-hour TTL (`TTL_SECONDS = 86400`). Static content that only changes during explicit reseeds.
  - **User Stats**: 5-minute TTL (`300` seconds). Balances fresh profile statistics with reduced DB aggregation overhead.
- **Lean Mongoose Queries**: In `notes.controller.js` and `sheets.controller.js`, queries use `.lean()`, returning plain JavaScript objects. This eliminates Mongoose document overhead and ensures fast, clean JSON serialization into Redis.

---

## 4. Critical Gaps & Edge Cases Discovered

### Gap 1: Incomplete User Stats Invalidation on Project Actions
* **Issue**: `controllers/user.controller.js` computes `stats = { generatedProjectsCount, solvedDSACount }`. The plan invalidates `USER_STATS(userId)` when a problem is toggled in `sheets.controller.js`, but **fails to invalidate** when a user creates a new project (`generateProject`) or deletes one (`deleteProject`) in `project.controller.js`.
* **Consequence**: When a user generates an AI project, navigates to their profile, they see an outdated project count for up to 5 minutes.
* **Resolution**: Call `await deleteCache(USER_STATS(req.user._id))` inside `generateProject` and `deleteProject`.

---

### Gap 2: Standalone Seed Scripts Invalidation Bug
* **Issue**: `masterSeed.js` and `notesSeed.js` are executed as standalone CLI scripts via `npm run seed:all` or `npm run seed:notes`. In these scripts, `server.js` is never executed, meaning `connectRedis()` is **never called**.
* **Consequence**: `redisClient.isReady` evaluates to `false`, causing `safeRedisCall` to silently skip invalidation. Reseeding the database leaves stale cache entries in Redis. Furthermore, without `await redisClient.quit()`, the script will either hang or terminate before commands flush.
* **Resolution**: Add explicit `connectRedis()` and `redisClient.quit()` calls within the `try ... finally` blocks of both seed scripts.

---

### Gap 3: AI Rate Limiter Keying & Route Order
* **Issue**: In `routes/project.routes.js`, the route was defined as:
  ```javascript
  projectRouter.post('/generate', aiProjectLimiter, authMiddleware, validate(generateProjectSchema), generateProject);
  ```
  Because `aiProjectLimiter` ran *before* `authMiddleware`, it keyed strictly by IP (`req.ip`).
* **Consequence**: Multiple users behind the same NAT/proxy (university campuses, shared offices) shared the restrictive 4 requests/hour quota.
* **Resolution**: Reorder to run `authMiddleware` first, and use a custom `keyGenerator` that keys by `req.user._id` (falling back to `req.ip`).

---

### Gap 4: Missing Express Reverse-Proxy Trust
* **Issue**: `src/app.js` lacked `app.set('trust proxy', 1)`.
* **Consequence**: When deployed to modern cloud hosting (Vercel, Render, Railway, AWS ECS), Express views the incoming IP as the proxy's IP, or `express-rate-limit` v8 logs proxy misconfiguration warnings.
* **Resolution**: Add `app.set('trust proxy', 1);` right after initializing `const app = express();`.

---

### Gap 5: Process Lifecycle & Graceful Shutdown
* **Issue**: Neither `server.js` nor `redis.js` listened for termination signals (`SIGINT`, `SIGTERM`).
* **Consequence**: During server restarts or deployments, open Redis socket connections and Mongoose connection pools were abruptly severed without cleanly flushing.
* **Resolution**: Add graceful shutdown listeners in `server.js`.

---

## 5. Token Revocation & Session Management Review

The plan explicitly specifies **"No token revocation"** in Redis. Here is the architectural analysis of that decision:

1. **Current PrepStack Authentication Model**:
   - **Access Token**: Short-lived JWT (15 minutes), stored in an `httpOnly`, `secure`, `sameSite: 'none'` cookie.
   - **Refresh Token**: Long-lived JWT (7 days), stored in an `httpOnly` cookie **and persisted in MongoDB (`user.refreshToken`)**.
2. **Logout Behavior**:
   - On `/api/auth/logout`, `user.refreshToken` is set to `null` in MongoDB, and cookies are cleared.
   - Any attempt to use the refresh token to obtain a new access token immediately fails with `403 Invalid refresh token`.
3. **Security Assessment**:
   - Even without an in-memory token blocklist in Redis, any leaked access token expires automatically in under 15 minutes.
   - Avoiding a Redis blocklist saves significant memory and daily command operations on Upstash.
   - **Conclusion**: Omitting Redis token revocation is an **appropriate, cost-effective architectural choice** for PrepStack.

---

## 6. Complete Production-Ready File Implementations

Below are the exact, refined source files incorporating all fixes and edge-case protections.

### File 1: `server/src/config/redis.js`
```javascript
const { createClient } = require('redis');

let hasConnectedOnce = false;
const MAX_INITIAL_RETRIES = 3;

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy(retries) {
      if (!hasConnectedOnce && retries > MAX_INITIAL_RETRIES) {
        return new Error('Redis unavailable at startup, giving up initial retries');
      }
      return Math.min(retries * 500, 5000);
    },
    connectTimeout: 5000,
  },
});

redisClient.on('connect', () => console.log('🔄 Connecting to Redis...'));
redisClient.on('ready', () => {
  hasConnectedOnce = true;
  console.log('✅ Redis connected successfully!');
});
redisClient.on('error', (err) => console.error('⚠️ Redis Client Error:', err.message));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

module.exports = { redisClient, connectRedis };
```

---

### File 2: `server/src/utils/safeRedis.js`
```javascript
const { redisClient } = require('../config/redis');

/**
 * Executes a Redis command safely.
 * Returns `fallback` if Redis is offline, reconnecting, or throws an error.
 */
async function safeRedisCall(fn, fallback = null) {
  try {
    if (!redisClient.isReady) return fallback;
    return await fn();
  } catch (err) {
    console.error('⚠️ Redis operation failed:', err.message);
    return fallback;
  }
}

module.exports = { safeRedisCall };
```

---

### File 3: `server/src/constants/redisKeys.js`
```javascript
module.exports = {
  NOTES_ALL: 'prepstack:notes:all',
  NOTES_SUBJECT: (slug) => `prepstack:notes:subject:${slug}`,
  SHEETS_ALL: 'prepstack:sheets:all',
  SHEET_SLUG: (slug) => `prepstack:sheets:slug:${slug}`,
  USER_STATS: (userId) => `prepstack:user:${userId}:stats`,
};
```

---

### File 4: `server/src/services/contentCache.service.js`
```javascript
const { redisClient } = require('../config/redis');
const { safeRedisCall } = require('../utils/safeRedis');
const { NOTES_ALL, NOTES_SUBJECT, SHEETS_ALL, SHEET_SLUG } = require('../constants/redisKeys');

const TTL_SECONDS = 60 * 60 * 24; // 24 hours

async function getCache(key) {
  const data = await safeRedisCall(() => redisClient.get(key), null);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

async function setCache(key, value, ttl = TTL_SECONDS) {
  await safeRedisCall(() => redisClient.set(key, JSON.stringify(value), { EX: ttl }));
}

async function deleteCache(key) {
  await safeRedisCall(() => redisClient.del(key));
}

async function invalidateSheets(slugs = []) {
  await deleteCache(SHEETS_ALL);
  await Promise.all(slugs.map((slug) => deleteCache(SHEET_SLUG(slug))));
}

async function invalidateNotes(subjectSlugs = []) {
  await deleteCache(NOTES_ALL);
  await Promise.all(subjectSlugs.map((slug) => deleteCache(NOTES_SUBJECT(slug))));
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
  invalidateSheets,
  invalidateNotes,
};
```

---

### File 5: `server/src/middlewares/rateLimit.middleware.js`
```javascript
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('../config/redis');
const { safeRedisCall } = require('../utils/safeRedis');

const createStore = (prefix) =>
  new RedisStore({
    prefix: `prepstack:rl:${prefix}:`,
    sendCommand: (...args) => safeRedisCall(() => redisClient.sendCommand(args)),
  });

const aiProjectLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4,
  keyGenerator: (req) => (req.user && (req.user._id || req.user.id) ? (req.user._id || req.user.id).toString() : req.ip),
  skipFailedRequests: true,
  passOnStoreError: true,
  store: createStore('ai-project'),
  message: {
    success: false,
    message: 'Too many Project idea generation requests. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skipFailedRequests: true,
  passOnStoreError: true,
  store: createStore('auth'),
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const linkGoogleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipFailedRequests: true,
  passOnStoreError: true,
  store: createStore('link-google'),
  message: {
    success: false,
    message: 'Too many linking attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, aiProjectLimiter, linkGoogleLimiter };
```

---

### File 6: `server/src/app.js` (Proxy Trust)
```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorMiddleware = require('./middlewares/error.middleware');
const AppError = require('./utils/AppError');

const app = express();

// Trust reverse proxy (Vercel / Render / Cloudflare / Nginx) for accurate IP resolution
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://prepstack-ss.vercel.app'],
    credentials: true,
  })
);

// Routes
const authRouter = require('./routes/auth.routes');
const sheetsRouter = require('./routes/sheets.routes');
const projectRouter = require('./routes/project.routes');
const notesRouter = require('./routes/notes.routes');
const userRouter = require('./routes/user.routes');

app.use('/api/auth', authRouter);
app.use('/api/sheets', sheetsRouter);
app.use('/api/project', projectRouter);
app.use('/api/notes', notesRouter);
app.use('/api/user', userRouter);

// 404 handler
app.use((req, res, next) => {
  next(new AppError(404, `Cannot ${req.method} ${req.originalUrl}`));
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
```

---

### File 7: `server/src/routes/project.routes.js`
```javascript
const express = require('express');
const { generateProject, getAllProjects, getProjectById, deleteProject } = require('../controllers/project.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { aiProjectLimiter } = require('../middlewares/rateLimit.middleware');
const validate = require('../middlewares/validate.middleware');
const { generateProjectSchema } = require('../validators/project.validators');

const projectRouter = express.Router();

// Generate project idea (Auth first so rate limiter keys by User ID)
projectRouter.post('/generate', authMiddleware, aiProjectLimiter, validate(generateProjectSchema), generateProject);

// User project listings
projectRouter.get('/', authMiddleware, getAllProjects);
projectRouter.get('/:projectId', authMiddleware, getProjectById);
projectRouter.delete('/:projectId', authMiddleware, deleteProject);

module.exports = projectRouter;
```

---

### File 8: `server/src/controllers/project.controller.js` (Stats Invalidation)
```javascript
const { generateProjectIdea } = require('../services/ai.service');
const projectModel = require('../models/project.model');
const { deleteCache } = require('../services/contentCache.service');
const { USER_STATS } = require('../constants/redisKeys');

const generateProject = async (req, res, next) => {
  try {
    const { techStack, complexity, domain, notes } = req.body;
    const projectIdea = await generateProjectIdea({ techStack, complexity, domain, notes });

    const project = await projectModel.create({
      title: projectIdea.title,
      tagline: projectIdea.tagline,
      description: projectIdea.description,
      features: projectIdea.features,
      techStack: projectIdea.techStack,
      difficulty: projectIdea.difficulty,
      estimatedTime: projectIdea.estimatedTime,
      resumeValue: projectIdea.resumeValue,
      domain: domain || '',
      user: req.user._id,
    });

    // Invalidate user stats cache
    await deleteCache(USER_STATS(req.user._id));

    return res.status(200).json({
      success: true,
      message: 'Project idea generated successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const projects = await projectModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('title tagline difficulty createdAt techStack domain features');
    return res.status(200).json({
      success: true,
      message: 'Projects fetched successfully',
      projects,
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await projectModel.findOne({ _id: projectId, user: req.user._id });
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({
      success: true,
      message: 'Project fetched successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await projectModel.findOneAndDelete({ _id: projectId, user: req.user._id });
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    // Invalidate user stats cache
    await deleteCache(USER_STATS(req.user._id));

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateProject, getAllProjects, getProjectById, deleteProject };
```

---

### File 9: `server/src/controllers/sheets.controller.js`
```javascript
const DSASheet = require('../models/sheets.model');
const Progress = require('../models/progress.model');
const { getCache, setCache, deleteCache } = require('../services/contentCache.service');
const { SHEETS_ALL, SHEET_SLUG, USER_STATS } = require('../constants/redisKeys');
const AppError = require('../utils/AppError');

exports.getSheets = async (req, res, next) => {
  try {
    let sheets = await getCache(SHEETS_ALL);
    if (!sheets) {
      sheets = await DSASheet.find({}, 'name slug description').lean();
      await setCache(SHEETS_ALL, sheets);
    }
    res.status(200).json({
      success: true,
      data: sheets,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSheetBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cacheKey = SHEET_SLUG(slug);

    let sheet = await getCache(cacheKey);
    if (!sheet) {
      sheet = await DSASheet.findOne({ slug }).lean();
      if (!sheet) return next(new AppError(404, 'DSA Sheet not found'));
      await setCache(cacheKey, sheet);
    }
    res.status(200).json({
      success: true,
      data: sheet,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserSheetProgress = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user._id;

    let progress = await Progress.findOne({ user: userId, sheetSlug: slug });
    if (!progress) {
      progress = await Progress.create({ user: userId, sheetSlug: slug, solvedProblems: [] });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleProblemCompletion = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { problemLink } = req.body;
    const userId = req.user._id;

    let progress = await Progress.findOne({ user: userId, sheetSlug: slug });

    if (!progress) {
      progress = new Progress({ user: userId, sheetSlug: slug, solvedProblems: [problemLink] });
    } else {
      const idx = progress.solvedProblems.indexOf(problemLink);
      if (idx !== -1) {
        progress.solvedProblems.splice(idx, 1);
      } else {
        progress.solvedProblems.push(problemLink);
      }
    }

    await progress.save();

    // Invalidate user stats cache so dashboard updates immediately
    await deleteCache(USER_STATS(userId));

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};
```

---

### File 10: `server/src/controllers/notes.controller.js`
```javascript
const notesModel = require('../models/notes.model');
const { getCache, setCache } = require('../services/contentCache.service');
const { NOTES_ALL, NOTES_SUBJECT } = require('../constants/redisKeys');
const AppError = require('../utils/AppError');

const getNotes = async (req, res, next) => {
  try {
    let notesSummary = await getCache(NOTES_ALL);
    if (!notesSummary) {
      notesSummary = await notesModel.find({}, 'subject subjectSlug').lean();
      await setCache(NOTES_ALL, notesSummary);
    }
    res.status(200).json({
      success: true,
      data: notesSummary,
    });
  } catch (error) {
    next(error);
  }
};

const getNotesBySubject = async (req, res, next) => {
  try {
    const subject = req.params.subject.toLowerCase();
    const cacheKey = NOTES_SUBJECT(subject);

    let notes = await getCache(cacheKey);
    if (!notes) {
      notes = await notesModel.findOne({ subjectSlug: subject }).lean();
      if (!notes) return next(new AppError(404, 'Notes not found for this subject'));
      await setCache(cacheKey, notes);
    }
    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, getNotesBySubject };
```

---

### File 11: `server/src/controllers/user.controller.js`
```javascript
const projectModel = require('../models/project.model');
const progressModel = require('../models/progress.model');
const { getCache, setCache } = require('../services/contentCache.service');
const { USER_STATS } = require('../constants/redisKeys');

const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const cacheKey = USER_STATS(userId);

    let stats = await getCache(cacheKey);
    if (!stats) {
      const generatedProjectsCount = await projectModel.countDocuments({ user: userId });
      const progressDocs = await progressModel.find({ user: userId });
      const solvedDSACount = progressDocs.reduce(
        (total, doc) => total + (doc.solvedProblems ? doc.solvedProblems.length : 0),
        0
      );
      stats = { generatedProjectsCount, solvedDSACount };
      await setCache(cacheKey, stats, 300); // 5 minutes TTL
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserStats };
```

---

### File 12: `server/server.js` (Graceful Shutdown & Ordering)
```javascript
require('dotenv').config();
const dns = require('dns');
const { connectRedis, redisClient } = require('./src/config/redis');
const connectToDB = require('./src/config/database');
const mongoose = require('mongoose');

// Fix DNS resolution for MongoDB Atlas SRV records
dns.setServers(['1.1.1.1', '8.8.8.8']);

async function start() {
  try {
    await connectRedis();
  } catch (err) {
    console.error('❌ Redis failed to connect on startup, continuing without it (fail-open):', err.message);
  }

  await connectToDB();

  // Load app AFTER Redis connection attempt resolves
  const app = require('./src/app');

  const server = app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${process.env.PORT}`);
  });

  // Graceful shutdown handlers
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}, closing server and connections...`);
    server.close(async () => {
      try {
        if (redisClient.isOpen) await redisClient.quit();
        await mongoose.connection.close();
        console.log('✅ Connections closed cleanly.');
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err.message);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
```

---

### File 13: `server/src/seed/masterSeed.js` (CLI-Aware Invalidation)
```javascript
const mongoose = require('mongoose');
const seedLoveBabbar = require('./sheetSeeds/loveBabbarSeed');
const seedStriverA2Z = require('./sheetSeeds/striverA2ZSeed');
const seedStriverSDE = require('./sheetSeeds/striverSDESeed');
const seedNeetCode = require('./sheetSeeds/neetCodeSeed');
const seedBlind75 = require('./sheetSeeds/blind75');
const connectDB = require('./seedConfig');
const { redisClient, connectRedis } = require('../config/redis');
const { invalidateSheets } = require('../services/contentCache.service');

const seedAll = async () => {
  try {
    await connectDB();
    try {
      await connectRedis();
    } catch (e) {
      console.warn('Redis offline during seed, skipping cache invalidation');
    }

    await seedLoveBabbar();
    await seedStriverA2Z();
    await seedStriverSDE();
    await seedNeetCode();
    await seedBlind75();

    const allSlugs = ['love-babbar', 'striver-a2z', 'striver-sde', 'neetcode-150', 'blind-75'];
    await invalidateSheets(allSlugs);

    console.log('✅ All DSA Sheets seeded & Redis cache invalidated successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    if (redisClient.isOpen) await redisClient.quit();
    process.exit(0);
  }
};

seedAll();
```

---

### File 14: `server/src/seed/notesSeed.js` (CLI-Aware Invalidation)
```javascript
const mongoose = require('mongoose');
const connectDB = require('./seedConfig');
const notesModel = require('../models/notes.model');
const { redisClient, connectRedis } = require('../config/redis');
const { invalidateNotes } = require('../services/contentCache.service');

const osNotes = require('../data/notes/os');
const dbmsNotes = require('../data/notes/dbms');
const cnNotes = require('../data/notes/cn');
const oopsNotes = require('../data/notes/oops');

const seedNotes = async () => {
  try {
    await connectDB();
    try {
      await connectRedis();
    } catch (e) {
      console.warn('Redis offline during seed, skipping cache invalidation');
    }

    console.log('Clearing existing notes...');
    await notesModel.deleteMany({});

    console.log('Seeding new rich structured notes...');
    const notesToInsert = [
      { subject: osNotes.subject, subjectSlug: 'os', sections: osNotes.sections },
      { subject: dbmsNotes.subject, subjectSlug: 'dbms', sections: dbmsNotes.sections },
      { subject: cnNotes.subject, subjectSlug: 'cn', sections: cnNotes.sections },
      { subject: oopsNotes.subject, subjectSlug: 'oops', sections: oopsNotes.sections },
    ];

    await notesModel.insertMany(notesToInsert);

    await invalidateNotes(['os', 'dbms', 'cn', 'oops']);

    console.log('✅ Notes seeded & Redis cache invalidated successfully!');
  } catch (error) {
    console.error('Error seeding notes:', error);
  } finally {
    await mongoose.connection.close();
    if (redisClient.isOpen) await redisClient.quit();
    process.exit(0);
  }
};

seedNotes();
```

---

## 7. Verification & Testing Checklist

| Step | Action | Expected Output |
|---|---|---|
| **1** | Start server with valid `REDIS_URL` | Log shows `🔄 Connecting to Redis...` then `✅ Redis connected successfully!` |
| **2** | Start server with invalid `REDIS_URL` | Logs 3 retry warnings, then `❌ Redis failed to connect on startup, continuing without it`, server starts on `PORT` with MongoDB |
| **3** | Hit `GET /api/sheets` twice | 1st hit queries Mongo and stores to Redis; 2nd hit returns in <15ms from Redis |
| **4** | Hit `GET /api/notes/os` twice | Served from Redis key `prepstack:notes:subject:os` |
| **5** | Toggle problem completion (`POST /api/sheets/blind-75/progress`) | `prepstack:user:<id>:stats` key deleted; next call to `GET /api/user/stats` recalculates fresh count |
| **6** | Generate AI project (`POST /api/project/generate`) | `prepstack:user:<id>:stats` key deleted; next call to `GET /api/user/stats` reflects new project count |
| **7** | Rapidly make 5 project requests | 5th request returns `429 Too Many Requests` with the configured rate limit message |
| **8** | Run `npm run seed:all` and `npm run seed:notes` | Data seeds into Mongo, Redis keys `prepstack:sheets:*` and `prepstack:notes:*` are invalidated, script exits cleanly (code 0) without hanging |
| **9** | Stop server (`Ctrl+C`) | Logs `🛑 Received SIGINT, closing server and connections...` and exits cleanly |
