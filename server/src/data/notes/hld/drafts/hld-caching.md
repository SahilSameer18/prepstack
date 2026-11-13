---
id: hld-caching
title: Caching
next: hld-choosing-databases
roadmapSteps: backend:database-design, fullstack:deployment-scaling
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-phase1.md. Numbers from docs/content/checks/hld-check.py. -->

## Overview

A cache is a small, fast store that keeps copies of data that is slow to get, so that repeated requests are answered quickly. Almost every design answer adds one, so interviewers push on the details: how data gets in, how it gets out, how it stays correct, and what happens when the cache is empty or gone.

After this section you can name the usual write and read patterns, say where a cache can live, compare LRU and LFU eviction, explain a cache stampede (many requests refilling one entry at once), and say why a service should not depend on its cache to stay alive.

## Topic: Why cache, and when not to

**Definition:** A cache holds copies of results. A hit is a request answered from the cache. A miss is a request the cache cannot answer, so the original source (often a database) must be asked. The hit ratio is hits divided by all requests. An AWS Builders' Library article on caching (Jas Chhabra, 2019) says a cache pays off only if results can be reused by many requests, and only if the service and its callers can live with eventual consistency (the cached copy may be a little out of date).

**Why:** It lowers latency and the load on the database, and can hide short outages of what is behind it. The effect of the hit ratio is large and is not linear.

**Example:** Made-up latencies: a hit takes 1 ms; a miss takes 21 ms (1 ms cache look-up plus 20 ms database). With 10,000 requests per second:

| Hit ratio | Average time | Requests reaching the database per second |
|---|---|---|
| 50% | 11.0 ms | 5,000 |
| 80% | 5.0 ms | 2,000 |
| 90% | 3.0 ms | 1,000 |
| 95% | 2.0 ms | 500 |
| 99% | 1.2 ms | 100 |

Going from 90% to 99% cuts the database load tenfold, from 1,000 to 100 requests a second.

**Failure:** Caching data that is never asked for twice (the article: if every request is unique, the hit rate is negligible). The Azure Architecture Center (cache-aside page) adds: do not cache sensitive data in a cache that many users share, and a cache may not help when most requests miss, because the look-up and fill cost more than they save. "Cache everything" is not a design.

## Topic: Cache-aside and read-through

**Definition:** In cache-aside (also called lazy loading) the application itself manages the cache. It looks in the cache first. On a miss it reads the database, puts the result in the cache, and returns it. When it changes data, it writes the database and then removes (invalidates) the cache entry; the next read refills it. This is how the Azure Architecture Center and the Amazon ElastiCache documentation describe it. Read-through looks the same to the caller, but the cache itself loads the missing item from the database; the Azure page says the pattern lets an application imitate a read-through cache when the cache does not do it.

**Why:** Only data that is asked for gets cached, and if a cache node fails and is replaced by an empty one, the application still works, only slower (ElastiCache documentation).

**Example:** Read of key 42: (1) application asks the cache, (2) miss, (3) application reads the database, (4) application stores it in the cache with an expiry and returns it. A miss costs three trips: the cache, the database, and the write to the cache (ElastiCache documentation). The Azure page also stresses the order on updates: write the database first and then delete the cache entry. If you delete the cache entry first, another reader can miss, read the old row from the database before it is updated, and put the stale value back.

**Failure:** Stale data between a write and the next read; the Azure page says cache-aside does not guarantee consistency. Setting the expiry too short makes the application keep refilling, too long leaves old data. If the invalidate fails, the entry stays old until its expiry, which is why you still set one.

## Topic: Write-through, write-behind and refresh-ahead

**Definition:** In write-through, a write goes to the cache and the database together and finishes only when the data is stored in both. The ElastiCache documentation lists the gain (the cache is never stale) and the cost (each write takes two trips, and data that is never read still fills the cache). In write-behind (also called write-back), the write goes to the cache and is saved to the database later. The Oracle Coherence documentation (a data grid product) describes a queue of changed items written after a delay, with several changes to the same item merged into one database write. Refresh-ahead means the cache reloads a recently used entry in the background before it expires. In Oracle Coherence the refresh point is a fraction of the expiry time; with an expiry of 60 s and a factor of 0.5, an access after 30 s returns the cached value and starts a reload.

**Why:** Write-through suits data that must be read back fresh. Write-behind gives faster writes and fewer database writes, because the caller does not wait for the database and merged writes reduce load. Refresh-ahead avoids a slow miss for popular entries, but only helps if the cache guesses well which entries will be needed.

**Example:** See the sequence diagram. Write-through: write x=5 to the cache, the cache writes the database, the database confirms, the caller gets "done". Write-behind: the caller gets "done" as soon as the cache has x=6, and the database write happens later.

**Failure:** Write-behind makes the cache hold the only copy of the change until it is saved. Oracle's documentation says it effectively makes the cache the system of record until the queue is written, so you must be sure that losing data held only in the cluster's memory is acceptable. Updates may also be reordered. Refresh-ahead with bad guesses sends needless reads to the database.

## Topic: Where caches live

**Definition:** An on-box (local) cache is in the memory of each application server. An external cache is a separate group of machines, for example Redis or Memcached. The AWS article lists the trade-offs. On-box: fast and simple, but servers hold different copies, database load grows with the number of servers, and a new server starts empty. External: copies agree better, database load does not depend on the number of servers, and a deployment does not empty it; but it is another fleet to run, and the service needs code for its failure. The article also separates inline caches (the cache sits in the data access path, as in read-through and write-through, for example DynamoDB Accelerator or an HTTP cache such as Nginx or Varnish) from side caches (the application checks and fills the cache itself).

**Why:** The choice decides who handles misses and failures. An inline cache adds its failures to the dependency's, so clients cannot work around a failed cache. A side cache keeps control in the application.

**Example:** Assumption: 50 servers each with an on-box cache, empty at start: a rolling restart means up to 50 empty caches asking the database at once. An external cache survives that restart.

**Failure:** Treating an external cache as always available. The article says its availability may be lower than the database's. For the caching layers in front of web servers (browser, CDN), see Computer Networks: System Design Concepts (`cn-system-design-concepts`).

## Topic: Eviction: LRU and LFU

**Definition:** A cache has limited memory, so when it is full it evicts (throws out) something. LRU (least recently used) removes the entry that has gone longest without being used. LFU (least frequently used) removes the entry used the fewest times. Redis documents ten eviction policies: noeviction (refuse new data with an error), random, LRU, LFU and LRM (least recently modified, new in Redis 8.6), each in an "allkeys" form and a "volatile" form (only keys that have an expiry), plus volatile-ttl (shortest remaining life first); that is 1 + 4 + 4 + 1 = 10. In Redis, LRU and LFU are approximations: Redis picks a small random sample of keys (setting `maxmemory-samples`, 5 in the documentation's example) and evicts the best candidate in that sample. A sample of 10 gets very close to true LRU at some extra processor cost. Redis LFU, available since 4.0, keeps a small approximate counter that decays, so old popularity fades.

**Why:** The right policy keeps the entries that will be asked for again. Exact LRU needs extra memory for tracking, so Redis samples instead.

**Example:** A simulation on a made-up trace of 1,000 keys, where a few keys are very popular (not a rule): hit ratio with cache size 50, 100 and 200 keys: LRU 46.3%, 57.8%, 69.8%; LFU 59.9%, 68.2%, 76.5%. Then the same trace plus a one-time scan of 1,000 different keys: LRU fell to 44.1%, 54.9%, 66.1%; LFU to 57.0%, 64.9%, 72.9%. On this trace LFU was ahead at every size, and the one-time scan cost both policies about 2 to 4 points of hit ratio (LRU lost 2.2, 2.9 and 3.7 points; LFU lost 2.9, 3.3 and 3.6).

**Failure:** Saying "LFU is better than LRU". This is one made-up trace, with a few very popular keys, which suits LFU. Redis itself says LFU "may work better in certain cases" and calls allkeys-lru a good default when some entries are used far more than others. LFU needs its count to decay, or an entry popular once stays too long (Redis decays it every minute by default). Also, eviction is not expiry: eviction happens when memory is full, expiry when time runs out.

## Topic: Expiry, invalidation and stale data

**Definition:** A TTL (time to live) is a lifetime set on an entry; after it, the entry counts as not found. The AWS article describes a soft and a hard TTL: after the soft TTL the client tries to refresh, but if the source fails it keeps serving the cached value until the hard TTL. Negative caching stores an error or "not found" answer with its own TTL, so a failing source is not asked again and again. Cached formats should carry a version number, because during a deployment old and new software read each other's entries.

**Why:** Without a TTL, a missed invalidation leaves stale data forever. The article warns that arbitrary TTL and size values that are never revisited have caused real outages.

**Example:** Soft TTL 1 minute, hard TTL 10 minutes (assumption). At minute 2 a read finds the entry past its soft TTL and tries to refresh from the database. If the database is down, the cache still serves the old value until minute 10.

**Failure:** Deleting the entry before updating the database (see cache-aside above), or caching a failure with no TTL so it lasts too long.

## Topic: Stampede, cold caches and cache addiction

**Definition:** A stampede (thundering herd) is many requests missing the same entry at once and all going to the database. Request coalescing means only one request refills the entry while the others wait for that result. The AWS article says some caching libraries and servers such as Nginx and Varnish can do this. Cache addiction is the article's name for a service that has come to depend on its cache: the service behaves in two modes, depending on what is cached, so a cold cache, a failed cache fleet or a change in traffic sends a surge to the database.

**Why:** A popular entry that expires makes a burst of identical database reads. A cold or missing cache can bring down the database that the cache was protecting.

**Example:** Made-up numbers: a popular key gets 2,000 requests per second, and a refill from the database takes 50 ms. In the first 50 ms about 2,000 × 0.05 = 100 requests arrive while the first one refills, and each goes to the database. With coalescing, 1 database read refills the entry and the rest wait for its result.

**Failure:** The article says that if the cache is out for a long time, falling back to the database can bring the database down; its preferred defences are load shedding (refusing some requests cheaply), capping the rate of requests sent downstream, or an in-memory fallback cache, and teams should load-test with the cache switched off. Another AWS Builders' Library article (on avoiding fallback) gives the author's account of a past case where falling back after a cache failure overloaded the database.

## Questions

### What are the cache patterns and how do they differ?

Cache-aside: the application checks the cache, loads from the database on a miss and fills the cache; on writes it updates the database, then deletes the entry. Read-through: the cache loads on a miss. Write-through: writes go to cache and database together. Write-behind: the cache saves later. Refresh-ahead: the cache reloads popular entries before they expire.

### What is the difference between write-through and write-behind?

Write-through finishes after the database write, so data is safe and the cache is fresh, but writes are slower. Write-behind finishes after the cache write and saves later, so writes are faster and merged, but the data exists only in the cache until saved.

### What is a cache stampede and how do you stop it?

Many requests miss the same entry together and all hit the database. Coalesce them so one refills the entry and the rest wait. If the whole cache is down, protect the database with load shedding or a cap on downstream calls, and test with the cache off.

## Mistakes

- "Cache everything". A cache only helps for data reused by many requests and that can be a little stale. It also adds a system to run and fail.
- Treating write-behind as safe as write-through. Until the queued writes are saved, the only copy is in the cache.
- Believing the database is safe because there is a cache. When the cache is cold or down, the full load reaches the database.

## Quiz

### In cache-aside, what does the application do on a miss?

- [ ] Returns an error
- [x] Reads the database, stores the result in the cache, and returns it
- [ ] Waits until the cache fills itself
- [ ] Deletes all entries from the cache

Explanation: Cache-aside means the application loads data into the cache on demand. The cache does not know how to read the database.

### A hit takes 1 ms and a miss takes 21 ms. With a 90% hit ratio, what is the average time?

- [ ] 2.0 ms
- [x] 3.0 ms
- [ ] 5.0 ms
- [ ] 11.0 ms

Explanation: 0.9 × 1 + 0.1 × 21 = 0.9 + 2.1 = 3.0 ms.

### A key gets 2,000 requests per second and a refill takes 50 ms. About how many requests reach the database during one refill without coalescing?

- [ ] 1
- [ ] 10
- [x] 100
- [ ] 2,000

Explanation: 2,000 per second × 0.05 s = 100 requests. With coalescing only 1 goes.

### What is the main risk of write-behind?

- [ ] Reads become slower
- [ ] The cache is never stale
- [x] A change held only in the cache can be lost before it is saved to the database
- [ ] It needs two writes per request

Explanation: Write-behind finishes when the cache has the data and saves later. If the cache is lost before the save, that change is lost. The two-trip cost belongs to write-through.

### Which statement about Redis eviction is correct?

- [ ] Redis always removes the exact least recently used key
- [ ] Redis has only two eviction policies
- [x] Redis LRU is an approximation made by sampling a few keys
- [ ] LFU was in Redis from the first version

Explanation: Redis samples a few keys and evicts the best candidate among them. It documents ten policies, and LFU arrived in Redis 4.0.

## Diagram

```json
{ "kind": "graph", "caption": "Cache-aside read path for one key. The user calls the app server (1), the app asks the cache (2). On a miss the app reads the database (3) and the app then stores the value in the cache (4, dashed) before replying. On a hit the app answers after step 2 and the database is not touched.",
  "groups": [{ "id": "dc", "label": "Data centre" }],
  "nodes": [ { "id": "u", "label": "User", "x": 6, "y": 50, "shape": "client" }, { "id": "app", "label": "App server", "x": 36, "y": 50, "group": "dc" },
             { "id": "c", "label": "Cache", "x": 78, "y": 20, "shape": "cache", "group": "dc" }, { "id": "db", "label": "Database", "x": 78, "y": 82, "shape": "database", "group": "dc" } ],
  "edges": [ { "from": "u", "to": "app", "step": 1 }, { "from": "app", "to": "c", "step": 2, "label": "get key" }, { "from": "app", "to": "db", "step": 3, "label": "on a miss" }, { "from": "db", "to": "c", "step": 4, "dashed": true, "label": "fill (by the app)" } ] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A stampede avoided by request coalescing. Request A and request B ask for the same missing key. A is the one that goes to the database; the cache tells B to wait. When A has filled the cache, B receives the value. Without coalescing, B would also read the database.",
  "actors": [ { "id": "a", "label": "Request A" }, { "id": "b", "label": "Request B" }, { "id": "c", "label": "Cache" }, { "id": "d", "label": "Database" } ],
  "messages": [ { "from": "a", "to": "c", "label": "Get hot key" }, { "from": "c", "to": "a", "label": "Miss: you refill it", "dashed": true }, { "from": "b", "to": "c", "label": "Get hot key" }, { "from": "c", "to": "b", "label": "Miss: A is loading, wait", "dashed": true },
                { "from": "a", "to": "d", "label": "Read key" }, { "from": "d", "to": "a", "label": "Value", "dashed": true }, { "from": "a", "to": "c", "label": "Store value" }, { "from": "c", "to": "b", "label": "Value", "dashed": true } ] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write-through against write-behind. Write-through (messages 1 to 4): the cache writes x=5 to the database and only then tells the app it is done. Write-behind (messages 5 to 8): the cache answers done for x=6 at once, and saves it to the database later, so a change in that gap lives only in the cache.",
  "actors": [ { "id": "a", "label": "App" }, { "id": "c", "label": "Cache" }, { "id": "d", "label": "Database" } ],
  "messages": [ { "from": "a", "to": "c", "label": "Write x = 5" }, { "from": "c", "to": "d", "label": "Write x = 5" }, { "from": "d", "to": "c", "label": "Saved", "dashed": true }, { "from": "c", "to": "a", "label": "Done", "dashed": true },
                { "from": "a", "to": "c", "label": "Write x = 6" }, { "from": "c", "to": "a", "label": "Done (not saved yet)", "dashed": true }, { "from": "c", "to": "d", "label": "Later: write x = 6" }, { "from": "d", "to": "c", "label": "Saved", "dashed": true } ] }
```
