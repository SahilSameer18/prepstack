# Scaling report: where PrepStack slowed down, what was fixed, what is left

18 Nov 2026. Goal chosen by the owner: **scale-ready at zero cost, first target about 500 users a day** (a placement-season spike of maybe 50 at once). Method: measure first, then fix the biggest cost, then measure again.

## How it was measured

`npm run load:test` (in `server/`) starts the real `server.js` on an in-memory MongoDB, makes 40 users with a plan each, and sends a mix of requests at 10, 50 and 100 at once for 10 seconds each: the sheet list, one sheet, a notes subject, the public plan preview, the dashboard, the plan and a note save. A probe asks `/health` every 100 ms; its slowest answers show how long the one thread was blocked. `PROFILE=1` records a CPU profile of the server. `ONLY='GET /api/plan'` runs one request kind and prints the server CPU it costs. `CLUSTER=4` starts four copies.

**Read it as a ranking, not as the capacity of the host.** The machine was a 12-core laptop with the database in memory on the same machine; the free Render instance has about 0.1 of a CPU, so CPU-bound times there are many times longer. Every row is one run; the baseline at 10 at once varied between 30 and 61 requests a second from run to run.

## What it found

At 50 and 100 at once the server fell to **about 24 requests a second with a median of 1.8 to 3.5 seconds**, and the server process used 1.1 cores (one core fully busy) while the database used 0.1. So the limit is CPU on Node's single thread. The CPU profile and the per-request cost showed where it went:

| Request | Server CPU before | After |
|---|---|---|
| Sheet list (`GET /api/sheets`) | 58 ms | 5 ms |
| Plan preview (`POST /api/plan/preview`) | 49 ms | 20 ms |
| Dashboard summary | 45 ms | 23 ms |
| Saved plan (`GET /api/plan`) | 59 ms | 18 ms |
| Notes subject | 6.5 ms | 6.5 ms |
| Problem note save | 12.5 ms | 12.5 ms |

## What was changed

1. **Plain objects instead of Mongoose documents for read-only reads** (sheet list and sheet, the dashboard's progress, the saved plan). Building about 1,300 problem documents per request was most of the sheet list's cost.
2. **The planner's date helpers remember their answers.** The profile ranked `ymdOf` and `dayNumber` first inside the plan generator (called millions of times per plan).
3. **An in-process cache in front of Redis** (level 1): works with Redis off, identical simultaneous requests share one load, holds a value for at most 60 s (`CACHE_MEMORY_SECONDS`, 0 turns it off), bounded to 300 entries and 48 MB. A Redis read costs about 36 ms from a laptop, so memory first is faster for content that rarely changes.
4. **`npm run start:cluster`** (`server/cluster.js`): one server copy per core (`WEB_CONCURRENCY`, at most 8), restarts a crashed copy with a back-off, and **refuses to start without `REDIS_URL`**, because the copies share nothing in memory and the rate limits, locks and caches must live in Redis.

## Results (laptop, Redis off, one run each)

| At once | Before: requests/s, median, p95 | After, one process | After, 4 copies (cluster) |
|---|---|---|---|
| 10 | 30 to 61 /s, 125 ms, 426 ms | 86 /s, 114 ms, 241 ms | not run |
| 50 | 23 /s, 1,761 ms, 3,986 ms | 101 /s, 476 ms, 974 ms | not run |
| 100 | 24 /s, 3,457 ms, 7,718 ms | 122 /s, 679 ms, 1,838 ms | **401 /s, 156 ms, 721 ms** |

One process is still CPU-bound (1.0 core); four copies served about 3.3 times as many requests. The cluster run used memory state (`CLUSTER_ALLOW_MEMORY_STATE=1`), so its limits are per copy; it measures throughput only.

## What is NOT fixed

- **The plan generator still runs on the main thread** (about 20 ms per preview, more for a saved plan and a rebuild, and the finish-date line runs it twice). A burst of students using the builder at once blocks every other request on that copy. Next fix: run it in a worker thread, or in the cluster copies.
- **Session check on every logged-in request** (MongoDB lookup): the Redis session cache (R3) is planned, default off, to be decided after measuring on the live host.
- **AI calls run inside the request** and hold a connection for up to 55 to 120 s: the BullMQ queue (R6) is planned.
- **The dashboard (23 ms), saved plan (18 ms) and note save (12 ms) still cost CPU per request.** They are the next candidates after the generator.
- **The real database and host were not measured.** The database here is in memory and the host has more than ten times the CPU of the free Render instance. The same test against the deployed server (with a real Atlas database) is the number that matters for the first target.
- **Clustering needs a host with several cores and Redis.** The free Render instance has one shared 0.1 CPU, so `start:cluster` helps only after moving to a paid plan; the fixes 1 to 3 help on the free plan too.
- **Free-tier ceilings** (MongoDB Atlas free connections and operations, Render's instance, AI quotas) are outside this code.

## How to repeat it

```bash
cd server
npm run load:test                       # 10, 50 and 100 at once, one process
CLUSTER=4 LEVELS=100 npm run load:test  # four copies
PROFILE=1 LEVELS=20 npm run load:test   # where the server's CPU went
ONLY="POST /api/plan/preview" LEVELS=2 npm run load:test   # CPU per request for one kind
```

On PowerShell set the variables first, for example `$env:LEVELS=100; $env:CLUSTER=4; npm run load:test`.
