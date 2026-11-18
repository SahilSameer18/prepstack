# Redis for interviews: basics, patterns and PrepStack's decisions

Started 18 Nov 2026. Kept up to date by the agent after every Redis phase (`docs/plans/REDIS_PLAN.md`). The owner does the hands-on learning separately; this file is what to read and say before an SDE interview.

**How to use it.** Part 1 and 2 are general questions with short answers. Part 3 is the log of every decision made in PrepStack: what the situation was, what we chose, what we rejected and why. Part 4 holds the numbers we measured. Part 5 holds mistakes. Say only what is marked *built and measured* as "I built". Say *decided* or *planned* as "I designed" or "I planned".

**Honesty rule for interviews.** PrepStack has no real traffic and runs on a free single-instance host. Never claim users, scale or production results. Say: "I built it, tested it with two server instances, and measured it locally against a hosted free Redis-compatible service." That is true and still strong.

---

## Part 1. Basics (from the beginning)

**What is Redis?** An in-memory data store: data lives in RAM, so reads and writes take well under a millisecond. It is used next to a main database for things that must be fast and can be rebuilt: caches, counters, locks, queues, leaderboards. It is not a replacement for the main database, because memory is small and costly and data can be lost.

**Why is it fast?** Data is in memory; the data structures are simple and efficient; commands are executed by a single thread, so there are no locks between commands; and the protocol is light. (Since Redis 6, extra threads can read and write network data, but commands still run one at a time.)

**If it is single-threaded, how does it handle many clients?** It multiplexes connections with an event loop. Each command is tiny, so one thread serves many clients. The risk: one slow command (for example `KEYS *` on millions of keys) blocks everyone. Use `SCAN`, not `KEYS`.

**Why is every command atomic?** Because commands run one at a time. `INCR` on a counter cannot be interrupted. This is why Redis counters are exact under 100 parallel callers, where "read, add one, write" in application code would lose updates.

**Data types and what each is for.**
| Type | Use |
|---|---|
| String | A value or a counter (`GET`, `SET`, `INCR`) |
| Hash | An object with fields (a session, a user summary) |
| List | A simple queue or recent items (`LPUSH`, `RPOP`, `BRPOP`) |
| Set | Unique members, membership checks (`SADD`, `SISMEMBER`) |
| Sorted set | Members with a score: leaderboards, sliding-window rate limits (`ZADD`, `ZRANGE`) |
| Bitmap, HyperLogLog | Compact flags or counts (daily activity, approximate unique counts) |
| Stream | An append-only log with consumer groups (durable messaging) |

**Expiry (TTL).** `SET key value EX 10` makes a key disappear after 10 seconds. Redis removes expired keys in two ways: when you touch them (lazy), and by a background process that samples keys (active). So an expired key may briefly use memory but is never returned.

**Persistence: is my data safe?** Not by default. Two options:
- **RDB**: a snapshot of memory every so often. Fast to restart, but a crash loses the changes since the last snapshot.
- **AOF**: a log of every write. With the common setting (sync every second) you lose at most about a second. Larger and slower to restart.
You can use both. "Redis lost my data" almost always means no persistence, a snapshot gap, or eviction.

**Eviction: what happens when memory is full?** The `maxmemory-policy` decides. `noeviction` refuses new writes (errors). `allkeys-lru` removes the least recently used key of any kind. `volatile-lru` only removes keys that have a TTL. There are also LFU (least frequently used), random and `volatile-ttl` variants. **A cache wants an LRU/LFU policy; a queue must use `noeviction`**, or Redis may silently delete jobs.

**Transactions.** `MULTI` ... `EXEC` runs a batch without interleaving, but there is **no rollback**: if one command fails, the others still run. `WATCH` gives optimistic locking (abort if a watched key changed).

**Lua scripts.** `EVAL` runs a script on the server as one atomic step. Use it when several reads and writes must happen together (a sliding-window limiter, "release the lock only if it is mine"). Keep scripts short: while one runs, nothing else does.

**Pipelining.** Send many commands without waiting for each reply, to cut network round trips. It is about speed, not atomicity.

**Pub/Sub versus Streams.** Pub/Sub is fire-and-forget: a subscriber that is offline misses the message. Streams keep messages and let groups of consumers read them with acknowledgements, so they suit work that must not be lost.

**Replication, Sentinel, Cluster.** A replica copies a primary, **asynchronously**, so a failover can lose recently acknowledged writes. Sentinel watches the primary and promotes a replica. Cluster splits the keys over **16,384 hash slots** across several primaries to scale memory and writes. Multi-key commands only work when the keys are in the same slot (hash tags force that).

**Redis versus Memcached.** Memcached is a simple, multi-threaded cache of strings. Redis has data types, persistence, replication, Lua, and many uses beyond caching. Choose Memcached only for a very plain cache.

**Redis versus Valkey.** Valkey is a fork of Redis (from 2024, after Redis changed its license), backed by the Linux Foundation, and is protocol compatible for what PrepStack uses. Our hosted service is Valkey. Say so plainly, and name the compatibility check we ran (Part 3, D3).

---

## Part 2. Patterns (the questions interviewers actually ask)

**Cache-aside (lazy loading).** Read the cache; on a miss read the database, store the result with a TTL, return it. Write path: change the database, then delete (do not update) the cached copy. Deleting is safer than updating because two concurrent writers cannot leave a stale value behind as easily.
- *Write-through*: write to the cache and the database together. Always fresh, slower writes, caches data nobody reads.
- *Write-behind*: write to the cache and save to the database later. Fast, but you can lose data.

**The three cache failures.**
- **Stampede (thundering herd):** a popular key expires and hundreds of requests hit the database at once. Fixes: one request refills while others wait (a lock or "single flight"), refresh just before expiry, serve a stale value briefly.
- **Penetration:** requests for keys that do not exist skip the cache every time. Fixes: cache the "not found" result for a short time, validate input, use a Bloom filter.
- **Avalanche:** many keys expire at the same moment. Fix: add random jitter to TTLs.
- Related: a **hot key** (one key gets most of the traffic) and a **big key** (a huge value that blocks the server and clogs the network).

**Rate limiting algorithms.**
- *Fixed window* (`INCR` + `EXPIRE`): simple, but a burst across a window edge can allow almost double the limit.
- *Sliding window log* (a sorted set of timestamps): exact, uses more memory.
- *Sliding window counter*: two fixed windows weighted, approximate, cheap.
- *Token bucket*: allows controlled bursts. *Leaky bucket*: smooth output.
Do the check and the increment atomically (Lua), or two callers can both pass.

**Distributed lock.** `SET lock token NX PX 5000`: set only if absent, with an expiry so a crashed holder cannot block forever. Release only if the stored token is yours (Lua script), so you never delete someone else's lock after yours expired. Know the limits: if the holder is slow (a long pause) the lock can expire while it still works, so protect the real resource with a fencing token or make the work safe to repeat. The Redlock algorithm (several Redis nodes) is debated; the honest answer is "good for efficiency locks, not for strict correctness".

**Queues and background jobs.** Why: slow work (an AI call that takes 10 to 60 seconds) should not hold a web request. A producer puts a job on a queue and answers at once; a worker does it. Words to know: producer, worker, concurrency, retry with backoff, dead-letter list, **at-least-once delivery** (a job can run twice, so the work must be **idempotent**), delayed and repeating jobs, **backpressure** (stop accepting work when the queue is too long).
A list with `LPUSH`/`BRPOP` loses the job if the worker dies mid-job. A library such as BullMQ tracks active jobs, detects stalled ones and retries them. BullMQ needs `noeviction`, Redis 6.2 or newer (or Valkey), and persistence you set up.

**Counters and shared budgets.** An atomic counter with an expiry is the base of rate limits, daily quotas and usage caps.

**When Redis is down (always say this).** Decide per use: fail **open** (allow, because the main database still protects us) or fail **closed** (refuse). A cache falls through to the database. A queue cannot, so the request says "try again later". Never let a cache outage take the whole app down.

---

## Part 3. PrepStack decision log

Each entry: **situation, choice, alternatives and why not, status.** Status words: *decided* (agreed), *draft* (code written, not agreed or not committed), *built*, *measured*.

**D1. Redis is optional; the app must run without it.** (decided)
Situation: a new service that can fail. Choice: `REDIS_URL` is optional; when it is empty or Redis is unreachable, every caller falls back to memory or MongoDB. The server never waits for Redis at startup. Rejected: making Redis required (one more thing that can take the whole app down). Interview line: "graceful degradation with a decided fail mode per use."

**D2. MongoDB stays the source of truth; Redis holds only things that can be lost.** (decided)
Choice: counters, locks, caches, queues. Never accounts, sessions' truth, reports, progress. Why: Redis can lose data (no persistence, eviction, snapshot gaps). Also **no personal text in Redis** (no resume text, job descriptions, passwords, tokens, email addresses); a test will scan keys and values for it.

**D3. Host: Aiven for Valkey, free plan.** (decided; the host acceptance check is still to be run)
Situation: zero-money rule; Render's free plan has one instance, background workers are paid, and its free key-value store is 25 MB with no persistence. Choice: Aiven Valkey free (about 1 GB, no card, `noeviction` by default). Rejected: Upstash (command quota, and BullMQ polls constantly), Redis Cloud free (30 MB, no persistence), Render Key Value (25 MB, no persistence). Known risks: not meant for production, may power off when idle, snapshots rather than AOF so a crash can lose up to about ten minutes of jobs. Acceptable because AI generation jobs last seconds and a lost job shows "try again". Measured 18 Nov 2026: the free service runs Valkey 9.1.3; PING, expiry, `SET NX PX`, 50 parallel `INCR` (exact) and a Lua script all work; the `CONFIG` command is blocked by the host (a managed service), so the eviction policy is read through `INFO memory`; snapshots are on and AOF is off (`aof_enabled 0`), as the plan expected. Still open: eviction policy, job survival after a restart, idle command cost. Gate: before it serves the queue we run the acceptance check (version, `noeviction`, connections, job survival after a restart, idle command cost).

**D4. Practise against the hosted service directly, with isolated keys.** (decided by the owner on 18 Nov)
Situation: the owner chose to skip a local Redis for the app work and to do hands-on learning on another laptop. Risk: one free service shared by development and the live site, and no way to stop the server to test an outage. Mitigation: every key is prefixed with the environment (`prepstack:development:` by default), no `FLUSHALL` or key sweeps, tests use a fake Redis, and outage behaviour is tested by pointing at a closed port. Say it honestly: "I traded isolation for simplicity and reduced the risk with prefixes and a fake."

**D5. Client library: ioredis 5.** (built 18 Nov 2026, Phase 3)
Why: BullMQ is built on ioredis, so one client for everything. Version 5, not 6, to match what BullMQ expects (check at the queue phase). Connection settings: short connect timeout, fail fast instead of queueing commands while disconnected (`enableOfflineQueue: false`), background retry every few seconds at most. Never log the address (it holds a password); log an error code only.

**D5b. How the connection is built (Phase 3, built).** One module hands out the client only while it is connected; otherwise it hands out null and every caller falls back. The server never waits for Redis at startup (it connects in the background and prints one line: disabled, connected, or unavailable with an error code). A command that cannot be sent fails at once instead of queueing, so a Redis outage cannot pile up memory or hang requests. The background retry runs every few seconds at most and the warning is printed once, not on every retry. The address and password are never logged. Why: Redis is an optimisation here, not a dependency; "graceful degradation" is only real if it is tested, so it is: the real `server.js` is started with Redis off, with a closed port and with a host name that does not exist, and must still serve requests.

**D5c. Tests without a real Redis.** A small fake Redis (strings, expiry on its own clock, `SET NX`, counters) lets every later step be tested with no network; the app tests also delete `REDIS_URL` so a developer's real address can never leak into a test. Tests that need real behaviour (queues, a killed worker) are opt-in and use a unique key prefix per run. Mutation checks: logging the address, repeating the warning on every retry, and handing out a client while Redis is down were each introduced on purpose and each made a test fail.

**D6. Order of building: cache first.** (decided)
Cache-aside for sheets, notes and the plan preview first, then rate limits and locks, then session cache and AI budget, and the queue last. Why: the cache is the safest step (fall through to the database), the most commonly asked, and shows a clean before-and-after number.

**D7. My plan: cache the public preview, not the saved plan.** (decided)
The preview depends only on its inputs (no user data) and runs the generator, sometimes twice (the finish-date line). The saved plan, Today and dashboard change with every tick; a stale Today screen is a visible bug and their database reads are small. The plan catalogs are already in server memory. Interview line: "cache what is expensive, shared and rarely changing; not what is personal and changes every click."

**D8. The Role Analyzer: first inside the request; queued later only after a privacy change.** (changed on 18 Nov 2026: the owner decided it goes into the queue too; see D17)
The privacy policy promises the resume is never stored. A queued job would hold resume text in Redis until it finishes. Project ideas have no such text, so they go first.

**D9. Fail modes per use.** (decided)
Per-address limits (login, sign-up, reset email): fail open, because the per-account lock in MongoDB still protects passwords. Per-user AI limits: open, because the daily caps live in MongoDB. "Being generated" lock: open (worst case, a double click runs twice). AI budget and breaker: open (the providers answer 429 themselves; this changes to closed if paid keys are ever used). Session cache and content cache: fall through to MongoDB. Job queue: open since 18 Nov 2026 (see D16): run the work inside the request.

**D10. Session-check cache: at most 30 seconds, deleted before answering on every revoke.** (decided, not built)
Why: every logged-in request does a database lookup to check the session. Cache it briefly. Logout, logout-everywhere, password change, reset and account deletion delete the entry **before** replying, so revoking stays immediate. Without a measurement showing the lookups are a problem, this step does not start.

**D11. Queue settings to start from (BullMQ).** (decided, not built)
A global limiter sized to the AI providers' requests per minute; concurrency 1 or 2 (the host has 0.1 CPU); a job id built from the user so a double click makes one job; 2 attempts with exponential backoff and jitter; **remove finished and failed jobs after an age and a count** (BullMQ keeps them by default and would fill a small Redis); close the worker on shutdown so an active job finishes first.

**D12. What we are not doing.** (decided)
Redis as the main database, storing login tokens, real-time features, full-text search, and a leaderboard (only if ever added). Failed-login absorption and "planned feature" counters only when measured or needed.

**D13. Memory budget: 298 MB, `noeviction`.** (decided, measured 18 Nov 2026)
The free Aiven service reports a memory limit of 298 MB (5 MB used at the start) and `noeviction`. A full Redis then refuses new writes, and one runaway cache would block the queue. So: every cache key has a TTL (with jitter), the plan-preview cache has a cap on its number of keys, and finished jobs are removed after an age and a count. Interview line: "with a queue on the same instance I could not use an evicting policy, so I bounded the cache instead."

**D14. Job status by polling.** (decided 18 Nov 2026)
The page asks for the job state every few seconds. Rejected: server-sent events (a long-lived connection on a small free host that sleeps). Polling also survives the server restarting.

**D15. Queue tests: opt-in against the real service.** (decided 18 Nov 2026)
BullMQ cannot run on a fake Redis, so its tests run only when a test address is set, use a unique key prefix per run, and delete only their own keys. Everything else uses the fake. Say honestly that these are integration tests against a hosted service.

**D16. When Redis is down, generate inside the request.** (decided 18 Nov 2026)
Changes the queue row of D9 (the older plan said "try again later"). The in-request path stays in the code behind a feature switch, so the feature keeps working and there is no new outage.

**D17. The Role Analyzer goes into the queue, with encryption and a policy change.** (decided 18 Nov 2026; privacy work not done)
The privacy policy says the resume is never stored. A queued job would hold the cleaned resume text (email, phone and links already removed). Plan: encrypt the payload in the app (AES-256-GCM, key from the environment) so the host's snapshots and backups hold only ciphertext; delete the job on success and on final failure; a short TTL as a safety net; log nothing from the text; change the Privacy Policy and README first (cleaned text held for a few minutes, encrypted, in a third-party Redis service, deleted when the job ends); keep consent and the MongoDB daily limit; fall back to the in-request path when Redis is down. A test queues a fixture resume and checks that no readable text is in any key or value. Project ideas go first.

**D18. Cache-aside through one helper (phase 4, built).** What is cached: the sheet list, one sheet, the notes list, one notes subject, the sheet definitions the dashboard needs, and the My plan preview. Read the cache; on a miss take a short lock, run the loader (MongoDB or the generator), store with an expiry, release the lock. Rules in the helper: every key has a TTL of 10 minutes with plus or minus 10 percent jitter (avalanche); one request refills a missing key while the others wait up to 1.5 s for it (stampede); a loader that finds nothing returns null and the "not found" is cached for 30 s (penetration); a value above 512 KB (64 KB for previews) is not cached; each cache has a write budget per minute (120, previews 200), counted with an atomic `INCR`, because the host has 298 MB and `noeviction` and a full Redis would block the queue; only plain lowercase words become keys (a slug from the URL cannot inject or flood). Every Redis failure falls through to the loader, and an error from the loader itself reaches the caller unchanged and is never cached. Alternatives rejected: write-through (the content changes only when a seed runs), caching the whole HTTP response (the dashboard mixes shared and personal data).

**D19. Invalidation across environments.** The hard part of caching. Two bounds: (1) the seed scripts delete the content keys when they finish, and (2) every entry expires by itself within about 10 minutes. Why the seeds clear every environment prefix: a seed usually runs on a developer machine against the live database, where the key prefix is `prepstack:development:`, not the live server's `prepstack:production:`. Clearing only the local prefix would leave the live cache stale. The seed deletes `prepstack:*:cache:content:*` and nothing else (previews and counters are untouched). Alternative: version numbers inside keys (no deletes, but every read needs the version).

**D20. HTTP cache headers.** The four public reads send `Cache-Control: public, max-age=300, stale-while-revalidate=600` on success only (not on a 404 or an error). Browsers reuse the answer for 5 minutes and may show an older copy for 10 more while refreshing. Trade-off: after a reseed, a visitor can see old content for up to about 15 minutes. Chosen because the content changes rarely and these pages are now public and crawled.

**D21. The My plan preview cache.** Key = hash of the validated input plus the release version (so a new deploy never serves an older generator's answer). Safe because the preview has no user data and is a pure function of its input. Invalid input throws before anything is stored. The saved plan, Today and the dashboard progress are deliberately not cached: they change with every tick and a stale Today screen is a visible bug.

**D22. An honest limit: caching does not always reduce latency.** The measurement script counts database reads and generator runs, which cache hits remove. Latency only improves when Redis is closer or faster than the thing it replaces. Here the Redis service is about 35 ms away, and a local in-memory database answers in under a millisecond, so a cached read can be slower than a local database read. The saving is load on the database and the CPU spent generating plans. At one server instance an in-process cache would be faster still; Redis earns its place when several instances must share one cache.

---

## Part 4. Numbers to collect (fill in as each phase is measured)

| Phase | What was measured | Before | After | How (tool, inputs, two instances?) |
|---|---|---|---|---|
| Caching (18 Nov 2026), baseline without Redis | 400 mixed public requests (sheet list, one sheet, notes list, one subject, preview), 10 at a time | 320 DB reads, 80 generator runs, median 79 ms | pending: run `npm run measure:cache` | `scripts/measure-cache.js`, in-memory MongoDB, no Redis |
| Phase 3 live check (18 Nov 2026) | Opt-in live test against the real service: connects, expiry, SET NX and 50 parallel INCR exact, 2 of 2 passed in about 0.7 s | n/a | pass | `npm run test:redis-live` |
| Host check (18 Nov 2026) | Round-trip time to the host (median of 20 pings) | n/a | 35.0 ms | `npm run redis:check`, from the developer machine to the free Aiven service; this is network distance, not Redis speed |
| Caching | Database reads per 1,000 sheet requests | | | |
| Caching | Plan preview time, repeated input | | | |
| Rate limits | Counter exactness with two server copies | | | |
| Session cache | Database lookups per minute | | | |
| Queue | 50 simultaneous project-idea requests: errors, time to first answer | | | |

## Part 5. Mistakes and lessons

(Empty. Add one line per phase: what went wrong and what fixed it. Interviewers like this question.)

## Part 6. Quick practice questions (answer aloud, then check Parts 1 to 3)

1. Why is Redis fast although single-threaded?
2. What is the difference between RDB and AOF? Which loses less?
3. A cache key expires and 500 requests hit the database. Name the problem and two fixes.
4. How do you rate limit 5 requests per minute per user across two servers? What breaks with a fixed window?
5. Write the lock and release steps. Why must release check a token?
6. A BullMQ worker dies mid-job. What happens? Why must jobs be idempotent?
7. Why is `noeviction` required for a queue but wrong for a cache?
8. Redis goes down. What does each use in PrepStack do, and why?
9. Why did you not cache the saved study plan?
10. Why is the resume never queued?
