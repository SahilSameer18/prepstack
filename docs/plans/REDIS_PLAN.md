# Redis, BullMQ and background jobs: learning and integration plan

Written 9 Nov 2026. Status: **planned, nothing built.** This replaces the old analysis in `docs/archive/REDIS_INTEGRATION_ANALYSIS.md`. Do not copy code from that file: it was written against code that no longer exists, and its login limiter counts the wrong requests (it skips failed attempts, so wrong passwords would never be limited).

**Two goals, one path.**
1. **Learn** Redis, BullMQ and background jobs from the basics, by building small things that work.
2. **Use** what you learned in PrepStack, for growth: many users, several servers, busy periods such as placement season.

So every step has two halves: a **learning module** (a concept, a practice you type yourself, a check) and a **PrepStack step** that applies it for real. You always learn the idea in a small throwaway script first, and only then touch the real app. The plan describes behaviour and checks, not code. The code is written against the real files when a step starts.

---

## What this project needs, and the zero-money rule (checked 9 Nov 2026)

**Rule: no money is spent.** Learning runs on Redis in WSL on your computer. Anything live uses free tiers only, and no live step starts without a measured reason.

**Where background work could exist, from the code:**

| Work | Today | Verdict |
|---|---|---|
| AI project ideas | Inside the request, 55 s budget, the browser waits 90 s | The only real queue candidate |
| Role Analyzer | Inside the request, 120 s wait; the resume must never be stored | Stays in the request (the resume would sit in Redis) |
| Reset emails | Sent in the background without a retry; the link holds a secret token | No queue: the token must not sit in Redis. Retry in memory instead |
| Scheduled jobs | None (reset tokens clean themselves up with an expiry) | None needed; Render cron jobs are paid anyway |

**Render's free plan, from its own docs:** one instance only (no scaling beyond it); 512 MB and 0.1 CPU; the service stops after 15 minutes without incoming requests and takes about a minute to wake, and Render "might restart a Free web service at any time"; background workers and cron jobs are paid only; outbound ports 25, 465 and 587 are blocked (this affects the Brevo email port, not Redis). The Render logs confirm the 15 minute sleeps.

**What that means for the plan:**
- The "state shared across several servers" problem does not exist on a single free instance. What Redis would fix on Render free is **counters and locks being lost at every sleep or restart.**
- A BullMQ worker cannot be a separate service on the free plan. It would run **inside the web process**. That works for jobs started by a request, because the request keeps the instance awake. Render's docs do not say whether it is supported or discouraged.
- **The real limit is AI quota, not the server.** Gemini's docs give no free numbers (your AI Studio console does; the AI plan recorded 20 requests a day and 5 a minute for the primary model on 7 Nov). Groq's page shows 30 requests/min, 1K/day and 8K tokens/min for `gpt-oss-120b` (that table may be the Developer plan; check your console). A queue cannot create quota. It can only smooth demand under it.

**Zero-cost options for a live queue, in order:**
1. **Keep AI in the request.** It works today. Choose this until requests visibly pile up or time out.
2. **BullMQ on Aiven Valkey free, worker in the web process, project ideas only**, after the host acceptance check in section 3b.
3. **A MongoDB job collection** (no Redis): claim a job with one atomic update, count attempts, one job per user through a unique index, a worker loop in the web process. It survives restarts, uses the Atlas database you already have, and is the fallback if the host check fails. Agenda is a MongoDB library but is built for scheduling, not queues; I could not confirm its current maintenance.

---

## 0. How we work

- **You write the practice code; I explain, review and answer.** The practice scripts are small (10 to 60 lines). When you are stuck I explain the idea, not paste the whole answer first. For the PrepStack steps I write the code with you, and you explain back what each part does.
- **Practice lives outside the app.** Throwaway scripts go in a separate folder `learning/` at the repo root, with its own `package.json`, never imported by `client/` or `server/`. It is deleted or kept as notes; it never ships.
- **Each module ends with a check:** 5 short questions you answer in your own words, then one small thing you build without help. Move on only when you can do both.
- **Local Redis (no Docker): real Redis on Linux inside WSL2.** WSL2 is already enabled on your machine but has no Linux installed yet. Setup, once (about 20 minutes, the Linux download is large):
  1. In a terminal: `wsl --install -d Ubuntu`, then create a Linux username and password when it asks (it may ask to restart Windows).
  2. In the Ubuntu window: `sudo apt update && sudo apt install -y redis-server`.
  3. Start it: `sudo service redis-server start`. Check: `redis-cli ping` answers `PONG`.
  4. Node on Windows connects to `redis://localhost:6379` (WSL2 normally forwards the port to Windows; the first practice script checks it works).
  5. `redis-cli` inside Ubuntu is where you type commands by hand in L1.
  Redis stops when you close Ubuntu or restart Windows; start it again with step 3. This is the same Redis that runs on a real server, which is why it is the choice over a Windows port. Windows-only alternatives exist (Memurai), but they are not Redis itself, and a free hosted Redis is a poor fit for BullMQ (next point).
- **Do not use a free hosted Redis for BullMQ practice.** BullMQ keeps asking Redis for work, so it uses many commands even when idle. Upstash's own page tells BullMQ users to switch to a paid fixed plan, and its free limits have changed between pages (check its live pricing page before relying on any number). A hosted free Redis is fine for L1 to L3 if WSL does not work.
- **Rules for the PrepStack steps** (the same as `IMPROVEMENT_PLAN.md`): one step at a time; tests for every rule; break each rule once on purpose and see a test fail; a rollback line; anything that cannot be proven is reverted.
- **MongoDB stays the source of truth** for accounts, sessions, reports, projects, progress and the login lock. Redis holds only counters, locks, caches and queues: things that can be lost without losing user data.
- **No personal text in Redis:** no resume text, job descriptions, passwords, tokens or email addresses. Keys use user ids and hashes.
- **Copy the current limiter settings exactly:** login-type limiters count only failed attempts; AI-type limiters count only successful ones. A test asserts which requests count.

---

## 1. Learning track (in order)

Times are rough, full-time, for one person who types the practice code. Re-estimate after L1.

### L0. Why Redis exists (half a day, no code)
- **Concept:** a database that keeps data in memory, so it answers in under a millisecond; why that is useful next to MongoDB (counters, locks, caches, queues) and why it is not a replacement (memory is small and costly; data can be lost).
- **Check:** explain in your own words what in PrepStack is "state that must be shared and fast" (use the table in section 2).

### L1. Redis basics by hand (2 days)
- **Concept:** a key and a value; the data types; expiry; why every command is atomic.
- **Try it in `redis-cli`:**
  1. Strings: `SET`, `GET`, `DEL`, `EXISTS`.
  2. Expiry: `SET key value EX 10`, `TTL`, `EXPIRE`, and watching a key disappear.
  3. Counters: `INCR`, `INCRBY`, and what happens when 100 of them run at once (always exactly right).
  4. Hashes (`HSET`, `HGETALL`), lists (`LPUSH`, `RPOP`), sets (`SADD`, `SMEMBERS`), sorted sets (`ZADD`, `ZRANGE`, a leaderboard).
  5. `SET key value NX PX 5000`: "set only if absent": the building block of a lock.
  6. How keys are named (`prepstack:rl:login:203.0.113.5`) and why `KEYS *` is dangerous in production (use `SCAN`).
- **Concept to read about, not code:** memory limits and eviction policies; persistence (snapshot and append-only file) and what "Redis lost my data" means.
- **Check:** from memory, which command gives you "at most 5 tries per 15 minutes per user"? Which gives "only one request at a time per user"?

### L2. Redis from Node (2 days)
- **Concept:** a client library (`redis`, the official Node client) speaks to the server over a connection; commands return promises; one shared connection is reused.
- **Build in `learning/`:**
  1. Connect, `SET`/`GET`, close cleanly.
  2. Handle a wrong URL and a stopped server without crashing (connection errors, retry with a delay).
  3. Store an object as JSON, and as a hash; read it back.
  4. Run 1,000 `INCR` calls in parallel and check the total is exactly 1,000.
- **Check:** what happens to your script when Redis is stopped halfway? Show it.

### L3. The patterns PrepStack will use (3 days)
Each pattern is a small script plus a test that proves it.
1. **Cache-aside:** read from the cache; on a miss read the database, store with an expiry; and the hard part: when to delete the cached copy.
2. **Rate limiting:** fixed window with `INCR` + `EXPIRE` (and its flaw at window edges); then a sliding window with a sorted set; compare.
3. **A lock:** `SET NX PX`, release only if it is still yours (a token), and why a lock with no expiry is a bug.
4. **A shared budget:** an atomic counter with a daily expiry, used to stay under a quota.
- **Check:** two copies of the same script running at once share one limit. Show it.

### L4. Background jobs: the ideas (1 day, then a small build)
- **Concept:** why slow work (an AI call that takes 10 to 60 seconds) should not run inside the web request; the producer puts a job on a queue and answers at once; a worker takes it off and does the work later; the page asks "is it done yet?".
- **The words you must be able to explain:** producer, consumer/worker, job, queue, concurrency, retry and backoff, dead-letter list, **at-least-once delivery** (a job may run twice, so work must be safe to repeat), idempotency, delayed and repeating jobs, backpressure.
- **Build:** a toy queue with a Redis list (`LPUSH` a job, a worker loop with `BRPOP`). Then break it on purpose: kill the worker mid-job and watch the job vanish. This is why we use a proper library.

### L5. BullMQ (4 days)
- **Concept:** BullMQ is a queue library that stores jobs in Redis and handles the hard parts of L4.
- **Build, one small program per item:**
  1. A `Queue`, a `Worker`, and one job that prints a message.
  2. Job data and a return value; reading a job's state (waiting, active, completed, failed).
  3. Concurrency: process 5 jobs at once; watch the order.
  4. Failing jobs: retries with backoff; what lands in the failed list.
  5. Making a double submission create only one job (a job id built from the input).
  6. A delayed job and a repeating job.
  7. Events and progress reporting (`QueueEvents`, `job.updateProgress`).
  8. Stopping a worker politely so it finishes its job first.
  9. A rate limit on the queue (for example "no more than 5 jobs a minute": the shape of your AI provider limits).
  10. A look at the queue with Bull Board.
- **Redis setting BullMQ needs:** the eviction policy must be `noeviction`, or Redis may throw away jobs when memory is full. You will see why.
- **Check:** kill the worker while a job runs; show what BullMQ does with it and why that is different from your L4 toy.

### L6. Running it for real (2 days)
- **Concept:** a worker as its own process; how many workers; logs and metrics worth keeping; what to do when Redis is down (fail open or closed, section 4); memory and cost; backups; managed Redis versus running your own.
- **Check:** write the one-page "what breaks when Redis is down" for PrepStack in your own words, then compare it with section 4.

---

## 2. What lives in server memory today

| State | Where | Problem when there is more than one server, or after a restart |
|---|---|---|
| Per-address rate-limit counters (10 limiters) | `middlewares/rateLimit.middleware.js` | Each server has its own copy, so every limit is multiplied by the number of servers. A restart or deploy resets them (Render's free plan also sleeps when idle) |
| "A report is being written now" set | `controllers/analyzer.controller.js` (`generatingNow`) | Two servers can both start a report for one user |
| "An idea is being generated now" set | `controllers/project.controller.js` (`generatingNow`) | Same |
| "Not a real technology" counter per user | `controllers/project.controller.js` (`notATechnology`) | The limit on junk requests resets and is not shared |
| AI provider circuit breakers | `services/ai.service.js` (`breakers`) | Each server finds out separately that Gemini is failing, so users on every server wait for it |

**Already safe, and stays where it is:** the daily caps (counted from saved documents over a rolling 24 hours), the per-account login lock (on the user document, atomic), reset tokens (hashed, expiring), and login sessions (in the user document).

**The hottest read:** every logged-in request runs `userModel.exists(...)` in `middlewares/auth.middleware.js` to check the session is still active.

---

## 3. PrepStack steps (each one comes right after its learning modules)

### R0. Choose the host and connect (about 1 day) (after L2)
- Local development uses the Redis inside WSL (see section 0). For the live site use a managed Redis with TLS: see section 3b for the researched free options. **Verify the chosen provider's live page before signing up; limits change.** The job queue (R6) needs persistence and `noeviction`.
- One client module, one `REDIS_URL` setting, a short connect timeout, a single startup status line (never the URL), and a clean shutdown with the rest of the server.
- **Done when:** the server starts with and without Redis, and the log says which.

### R1. Shared limits and locks (about 3 days) (after L3)
- **What it fixes on Render free:** limits, locks and the breaker survive a sleep or restart. It does not fix "several servers": the free plan has one instance.
- Move all 10 rate limiters to a Redis store (one key prefix per limiter).
- Replace both `generatingNow` sets with a lock that expires by itself (longer than the slowest generation), always released when the request ends.
- Replace the `notATechnology` map with a counter that expires after an hour.
- Share the circuit-breaker state, so one server noticing a failing provider protects all of them.
- **Done when:** two server instances sharing one Redis enforce one limit between them; a restart does not reset a counter; the "which requests count" test passes for every limiter.
- **Rollback:** switch the stores back to memory (one setting per limiter).

### R2. App-wide AI budget (about 2 days) (after L3)
- The free AI tiers are limited for the whole app, not per user (the AI plan recorded 20 requests a day and 5 a minute for the primary Gemini model on 7 Nov 2026; **check your own dashboards again before using any number**).
- Keep an atomic counter per provider per window. Before calling a provider, check it: skip a provider whose budget is spent, so the app stops burning failed calls and users wait less.
- **Done when:** with the budget spent the cascade goes straight to the next provider, and counters reset at the window end.

### R3. Session check cache (about 2 days) (after L3)
- Cache "this session is active" for each login session for at most 30 seconds, so most requests skip the database lookup.
- Logout, logout-everywhere, password change, password reset and account deletion delete the cached entries **before they answer**, so revoking stays immediate.
- **Done when:** a test proves a revoked session fails on its next request, and a measurement shows the lookups per minute drop. Without that measurement this step is not started.
- **Rollback:** remove the cache read; the database check is untouched underneath.

### R4. Content and per-user stats (measure first) (after L3)
- Public content (sheet lists, notes) goes first to HTTP cache headers and the website's CDN, which beat Redis for public pages. Use Redis only for a per-user dashboard summary with a short lifetime.
- Every action that changes a user's totals clears it: solving a problem, creating or deleting a project, creating or deleting a report, and any new writer added later (progress dates, saved notes, plans). The list of writers is written down in the step, and a test fails if a new one is missing.

### R5. Absorb failed-login traffic (optional, after an attack)
- Count wrong passwords per account in Redis and write to MongoDB only when the lock triggers. This protects the database during credential stuffing. The password check itself is the bigger load (a slow hash on purpose), so measure which one hurts before building this.

### R6. Background job queue for AI (about 1 week) (after L5 and L6)
- The idea generator returns a job number at once. A worker calls the AI with a concurrency matched to the provider limits, retries with a random delay, keeps failed jobs in a dead-letter list, and makes a double click create one job. The page checks the job until it finishes.
- **Privacy rule:** the Role Analyzer promises that the resume is never stored. A queued analyzer job would hold the resume text in Redis until it finishes. So **the analyzer stays inside the request** until the Privacy Policy wording is changed on purpose (for example: kept for a few minutes, encrypted in transit and at rest, deleted when the job ends). Project ideas have no such text and go first.
- **Settings to start from (BullMQ docs):**
  - a global limiter (`limiter: { max, duration }`) sized to the providers' requests per minute;
  - `concurrency` of 1 or 2 (0.1 CPU);
  - `jobId` built from the user, so a double click cannot make two jobs (or the deduplication option);
  - `attempts: 2` with exponential backoff and a little jitter;
  - **`removeOnComplete` and `removeOnFail` with an age and a count.** BullMQ keeps finished jobs by default, which would fill a small free Redis;
  - lower idle traffic with a longer `drainDelay` and `stalledInterval`: the defaults are 5 s and 30 s, and the docs do not state the idle command cost, so measure it in the host check;
  - `worker.close()` when the server shuts down, so an active job finishes first;
  - the job holds only the user's options (and the free-text notes), and the Privacy Policy names Redis' host.
- Needs a host that passes the acceptance check in section 3b: Redis 6.2 or newer (or a compatible Valkey), `noeviction`, and persistence.
- **Done when:** 50 simultaneous requests queue without errors, a killed worker's job is retried, and nothing with personal text is in Redis.

### R7. Planned features
- Streaks, "today" and the planner need cheap daily counters; a leaderboard (only if ever added) uses sorted sets. MongoDB stays the source of truth. Planned in the step when the feature is built.

---

## 3b. Free Redis hosts (researched 9 Nov 2026 from each provider's own pages)

Re-check each provider's live page before signing up: free tiers change, and some pages disagree with each other (noted below).

| | Aiven for Valkey | Upstash Redis | Redis Cloud | Render Key Value |
|---|---|---|---|---|
| Size | 1 GB RAM, 1 CPU, one node (usable memory 50% of RAM on the free-tier page, 70% on another page) | 250 MB (a compare table says 256 MB) | 30 MB | 25 MB |
| Limits | "Capped throughput and connection limits", no numbers | 500K commands a month, 10 GB bandwidth, 10,000 commands/sec (billing page; its FAQ still says 10,000 a day) | 100 ops/sec, 30 connections, 5 GB a month | 50 connections |
| Survives a restart | Backups included; persistence setting not stated for free | Yes (written to disk; not replicated on free) | No ("disabled entirely") | No |
| Idle rule | Powered off when unused, with notice; days not stated | Archived after a minimum of 30 days idle, with warnings and a backup | Not stated in the docs reached | Not stated |
| Credit card | Not required | Not required | Not stated as required | Not stated |
| Eviction | Default noeviction; changeable on free: not stated | Off by default (writes refused when full) | Changeable; default volatile-lru | Changeable; free restriction not stated |
| Other | One free service per type; not aimed at production | 1 database | 1 free database per account | Internal URL only, same region and workspace |

**Fit for PrepStack**
- **Learning (L1 to L6): local Redis in WSL.** No free host fits BullMQ practice: each one caps commands, memory or persistence.
- **Small shared state (R1 to R3): Render Key Value**, next to the backend on Render's internal network; losing the data on a restart is acceptable for counters, locks and the breaker. Upstash is the alternative when the data should survive restarts.
- **BullMQ queue (R6): Aiven Valkey free is the closest fit, and none of the free hosts is officially listed by BullMQ.** BullMQ's own docs require Redis 6.2 or newer, `maxmemory-policy` set to `noeviction` ("the only setting that guarantees the correct behavior of the queues"), and persistence set up by you (AOF recommended, about one second per write). Its hosting guide lists only AWS ElastiCache and MemoryDB (no permanent free tier), and it names Valkey and Dragonfly as compatible servers. A Queue uses at least one connection and a Worker a second, blocking one (so a backend plus one worker is about 3 to 4).

  | BullMQ needs | Aiven Valkey free | Upstash free | Redis Cloud free | Render Key Value free |
  |---|---|---|---|---|
  | noeviction | Default | Off by default | Settable (default volatile-lru) | Chosen at creation |
  | Persistence | Snapshots about every 10 minutes by default; free-specific not stated; not AOF | On (disk), not replicated | None | None |
  | Memory | about 500 MB usable | 250 MB | 30 MB | 25 MB |
  | Commands | No per-command billing | 500K a month; BullMQ polls even when idle | 100 ops/sec | No stated limit |
  | Connections | Not stated | Not stated | 30 | 50 |

  **Choice: Aiven Valkey free.** Known risks: up to about ten minutes of jobs can be lost in a crash (snapshots, not AOF); Aiven says the free plan is "not aimed at production workloads"; an idle service can be powered off (the time is not stated); the connection limit and the Valkey version are not stated. These are acceptable for AI generation jobs that last seconds to a minute (a lost job shows "try again"), and not for anything that must never be lost. **Fallback with a guarantee: Upstash Fixed plan, $10 a month for 250 MB** (persistence always on, no per-command billing, and Upstash documents BullMQ on it). Upstash free runs out of commands; Redis Cloud and Render free lose jobs on a restart.

  **Host acceptance check, run once before R6 starts:** (1) `INFO server` shows a version BullMQ accepts; (2) `CONFIG GET maxmemory-policy` answers `noeviction`; (3) count the connections one backend plus one worker use; (4) create 20 jobs, restart the service, count how many survive; (5) leave it idle for a day and read the command count. A host that fails any of these is not used.
- Not usable: AWS ElastiCache (no permanent free tier), Railway (trial or credit only), Momento (free tier retired).

**Not confirmed:** Redis Cloud's idle deletion rule; Aiven's connection limit, idle power-off time, and whether eviction can be changed on free; Upstash's numbers differ between its pages.

---

## 4. What happens when Redis is down

| Use | Fail mode | Why |
|---|---|---|
| Per-address limits (login, sign-up, reset email) | Open: allow | The per-account login lock in MongoDB still protects passwords. The cost is that the sign-up and reset-email limits stop for the outage |
| Per-user AI limits | Open: allow | The daily caps are counted in MongoDB and still apply |
| "Being generated" lock | Open: allow | Worst case a double click runs twice |
| AI provider budget and breaker | Open: try the providers | They answer 429 themselves; the free tier has no bill. **If paid keys are ever used, this changes to closed** |
| Session cache | Fall through to MongoDB | Always safe |
| Content and stats cache | Fall through to MongoDB | Always safe |
| Job queue | Closed: AI generation answers "try again later" | There is no queue to put the job in |

---

## 5. Schedule

| Part | What | Time |
|---|---|---|
| L0 to L2 | Why Redis, basics by hand, Redis from Node | about 4.5 days |
| R0 | Choose the host and connect | 1 day |
| L3 | The patterns | 3 days |
| R1 to R3 | Shared limits and locks, the AI budget, the session cache | about 7 days |
| L4 to L6 | Background jobs, BullMQ, running it for real | about 7 days |
| R6 | The AI job queue (project ideas first) | about 1 week |
| R4, R5, R7 | Only when measured or needed | later |

About 6 to 7 weeks of full-time work, because learning is part of every step. It can run alongside `IMPROVEMENT_PLAN.md` Phase 1, but do not interleave inside a single step.

---

## 6. Tests

- A small fake Redis in `server/test/helpers/setup.js`, like the fake Gemini, so the app's tests need no real Redis and no network. A short hand-run script checks the same commands against a real Redis once per release.
- Tests for every step: two server instances sharing one fake Redis, counters surviving a "restart", a Redis failure injected for each use in section 4 (the app keeps the behaviour in the table), and the "which requests count" check for every limiter.
- For the queue: a worker killed mid-job gets its job retried; a double submission makes one job; no personal text is in any queue key or value (a test scans them).
- Break each new rule once on purpose and confirm a test fails.

---

## 7. Risks

| Risk | Reduction |
|---|---|
| A new service that can fail | Fail modes decided above, a startup status line, and a rollback per step |
| Revoked sessions staying valid through the cache | Delete before answering; 30 second lifetime; a test for every revoke path |
| Personal text ending up in Redis | The rule in section 0, a test that scans keys and values, and the analyzer staying inside the request |
| Cost grows with traffic | Check the host's prices and limits at R0, and measure commands per request in R1 |
| Learning takes longer than planned | Each module has a check; a module that is slow is split, not skipped; re-estimate after L1 |
| Over-building | Learning scripts stay in `learning/`; production steps start only after their learning module and with a measured reason |

---

## 8. Decisions needed from you

1. **Learning style:** you type the practice code and I review (recommended), or I write it and you read and modify it?
2. **Local Redis:** WSL2 with Ubuntu (recommended, no Docker needed): okay to install it?
3. **Redis host: decided 9 Nov 2026.** Learning: Redis on your computer in WSL. Live: **Aiven for Valkey (free plan)**, the only host, for limits, locks and the queue, and only after it passes the host acceptance check in section 3b. No paid plan. If it fails the check, the queue is a MongoDB job collection and there is no Redis host.
4. **The analyzer in a queue:** keep it inside the request, or change the Privacy Policy to allow a few minutes of storage?
5. **Fail open** for the sign-up and reset-email limits during an outage: acceptable?

---

## 9. Not planned

- Redis as the main database, storing login tokens, real-time features, or full-text search.
