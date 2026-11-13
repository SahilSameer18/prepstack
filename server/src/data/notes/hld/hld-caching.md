---
id: hld-caching
title: Caching
lastChecked: 2026-11-13
next: hld-choosing-databases
roadmapSteps: backend:database-design, fullstack:deployment-scaling
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A cache is a small, fast store that keeps copies of data that is slow to get, so that repeated requests are answered quickly. Almost every design answer adds one, so interviewers push on how data gets in, how it gets out, how it stays correct, and what happens when the cache is gone.

After this section you can name the usual write and read patterns, compare LRU and LFU eviction, explain a cache stampede (many requests refilling one entry at once), and say why a service should not depend on its cache to stay alive.

## Topic: Why cache, and when not to

**Definition:** A cache holds copies of results. A hit is a request answered from the cache. A miss is a request the cache cannot answer, so the original source (often a database) must be asked. The hit ratio is hits divided by all requests. An AWS Builders' Library article on caching (Jas Chhabra, 2019) says a cache pays off only if many requests can reuse a result, and only if callers can live with eventual consistency (the cached copy may be a little out of date).

**Why:** It lowers latency (the time one request takes) and the load on the database. The effect of the hit ratio is large and not linear.

**Example:** Made-up latencies: a hit takes 1 ms; a miss takes 21 ms (1 ms cache look-up plus 20 ms database). With 10,000 requests per second, average time = hit share × 1 + miss share × 21, and database load = miss share × 10,000.

| Hit ratio | Average time | Requests reaching the database per second |
|---|---|---|
| 50% | 11.0 ms | 5,000 |
| 90% | 0.9 × 1 + 0.1 × 21 = 3.0 ms | 0.1 × 10,000 = 1,000 |
| 99% | 1.2 ms | 100 |

Going from 90% to 99% cuts the database load tenfold.

**Failure:** Caching data that is never asked for twice (the article: if every request is unique, the hit rate is negligible). The Azure Architecture Center adds that sensitive data may be inappropriate in a cache many users share. "Cache everything" is not a design.

## Topic: Cache-aside and read-through

**Definition:** In cache-aside (lazy loading) the application manages the cache. It looks in the cache first. On a miss it reads the database, stores the result in the cache with an expiry time (after that time the entry is thrown away), and returns it. When it changes data, it writes the database and then removes (invalidates) the cache entry; the next read refills it. The Azure page and the ElastiCache documentation describe it this way. Read-through looks the same to the caller, but the cache itself loads the missing item.

**Why:** Only data that is asked for gets cached, and if a cache node fails and is replaced by an empty one, the application still works, only slower (ElastiCache documentation).

**Example:** Read key 42: the application asks the cache, gets a miss, reads the database, and stores the value with an expiry. A miss costs three trips (ElastiCache). On updates the Azure page says to write the database first, then delete the cache entry. If you delete first, another reader can miss, read the old row, and put the stale (out of date) value back.

**Failure:** Stale data between a write and the next read; the Azure page says cache-aside does not guarantee consistency. If the invalidate fails, the entry stays old until its expiry.

## Topic: Write-through, write-behind and refresh-ahead

**Definition:**
- Write-through: a write finishes only when both the database and the cache have it. ElastiCache lists the gain (never stale) and the cost (two trips per write; unread data still fills the cache). In its description the application writes both; in an inline cache (the cache sits in the data path) the cache writes the database.
- Write-behind: the write goes to the cache and is saved to the database later. Oracle Coherence (a data grid product) queues changes and writes them after a delay.
- Refresh-ahead: the cache reloads a recently used entry before it expires. In Coherence, with an expiry of 60 s and a factor of 0.5, an access after 30 s returns the cached value and starts a reload.

**Why:** Write-through suits data that must be read back fresh. Write-behind gives faster writes. Refresh-ahead avoids a slow miss for popular entries, but only if the cache guesses well.

**Example:** In the sequence diagram, write-through answers "done" after the database confirms; write-behind answers as soon as the cache has the value.

**Failure:** Until the queue is saved, the cache holds the only up-to-date copy, as Oracle notes, so be sure that losing it is acceptable. Refresh-ahead with bad guesses sends needless reads to the database.

## Topic: Eviction: LRU and LFU

**Definition:** A cache has limited memory, so when it is full it evicts (throws out) something. LRU (least recently used) removes the entry that has gone longest without being used. LFU (least frequently used) removes the entry used the fewest times. Redis offers ten policies, among them random, LRU, LFU and noeviction (refuse new data with an error). Exact LRU costs more memory, so Redis checks a small random sample of keys (`maxmemory-samples`, 5 in its example) and evicts the best candidate, keeping a pool of good candidates since version 3.0. Redis LFU, since version 4.0, keeps an approximate counter that decays every minute by default.

**Why:** The right policy keeps what will be asked for again.

**Example:** A trace is a list of requests replayed against the cache. This one has 20,000 requests over 1,000 keys, a few very popular (made up). Hit ratio at cache sizes 50, 100 and 200 keys:

| Policy | 50 | 100 | 200 |
|---|---|---|---|
| LRU | 46.3% | 57.8% | 69.8% |
| LFU | 59.9% | 68.2% | 76.5% |

Adding a one-time scan (1,000 keys never asked again) and counting only the 20,000 regular requests changed the ratio by at most 0.4 points: LRU at size 200 fell from 69.8% to 69.4%; LFU did not change.

**Failure:** Saying "LFU is better than LRU". This is one made-up trace that suits LFU, and the simulated LFU never forgets counts, unlike Redis LFU. Redis calls allkeys-lru a good default. Eviction is not expiry: eviction happens when memory is full, expiry when time runs out.

## Topic: Expiry and stale data

**Definition:** A TTL (time to live) is a lifetime set on an entry; after it, the entry counts as not found. The AWS article describes a soft and a hard TTL: after the soft TTL the client tries to refresh, but if the source fails it keeps serving the cached value until the hard TTL. Negative caching stores a "not found" or error answer with its own TTL.

**Why:** Without a TTL, a missed invalidation leaves stale data forever. The article warns that TTL and size numbers picked by guess and never revisited have caused real outages.

**Example:** Soft TTL 1 minute, hard TTL 10 minutes (assumption). At minute 2 a read tries to refresh the entry. If the database is down, the cache still serves the old value until minute 10.

**Failure:** Caching a failure with no TTL, so it lasts too long.

## Topic: Stampede, cold caches and cache addiction

**Definition:** A stampede (thundering herd) is many requests missing the same entry at once and all going to the database. Request coalescing (joining the requests into one) means one request refills the entry while the others wait; the AWS article says libraries and servers such as Nginx and Varnish can do this. Cache addiction is the article's name for a service that depends on its cache: a cold or failed cache sends a surge to the database.

**Why:** A popular entry that expires makes a burst of identical database reads.

**Example:** Made-up: a popular key gets 2,000 requests per second, and a refill takes 50 ms. About 2,000 × 0.05 = 100 requests arrive while the first one refills, and each goes to the database. With coalescing, 1 database read refills the entry and the rest wait for it.

**Failure:** If the cache is out for a long time, falling back to the database can bring it down. The article's defences: load shedding (refusing some requests cheaply), capping the rate of calls to the database, an in-memory fallback cache, and load-testing with the cache off. Jacob Gabrielson's AWS article on avoiding fallback (2019) describes an Amazon retail outage around 2001 in which a cache failure sent every web server straight to the database.

## Questions

### What are the cache patterns and how do they differ?

Cache-aside: the application checks the cache, loads from the database on a miss and fills the cache; on writes it updates the database, then deletes the entry. Read-through: the cache loads on a miss. Write-through: writes go to both together. Write-behind: the cache saves later. Refresh-ahead: the cache reloads popular entries before they expire.

### What is the difference between write-through and write-behind?

Write-through finishes after the database write, so the data is safe and the cache is fresh if both writes succeed, but writes are slower. Write-behind finishes after the cache write, so writes are faster, but the data exists only in the cache until saved.

### What is a cache stampede and how do you stop it?

Many requests miss the same entry together and all hit the database. Coalesce them so one refills the entry and the rest wait. If the whole cache is down, shed load or cap calls to the database, and test with the cache off.

## Mistakes

- "Cache everything". A cache only helps for data many requests reuse and that can be a little stale.
- Treating write-behind as safe as write-through. Until the queued writes are saved, the only copy is in the cache.
- Believing the database is safe because there is a cache. When the cache is cold or down, the full load reaches it.

## Quiz

### In cache-aside, what does the application do on a miss?

- [ ] Returns an error
- [x] Reads the database, stores the result in the cache, and returns it
- [ ] Waits until the cache fills itself
- [ ] Deletes all entries from the cache

Explanation: Cache-aside means the application loads data into the cache on demand.

### A hit takes 1 ms and a miss takes 21 ms. With a 90% hit ratio, what is the average time?

- [ ] 2.0 ms
- [x] 3.0 ms
- [ ] 5.0 ms
- [ ] 11.0 ms

Explanation: 0.9 × 1 + 0.1 × 21 = 0.9 + 2.1 = 3.0 ms.

### A key gets 2,000 requests per second and a refill takes 50 ms. About how many requests (including the first) reach the database during one refill without coalescing?

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

Explanation: The two-trip cost belongs to write-through.

### Which statement about Redis eviction is correct?

- [ ] Redis always removes the exact least recently used key
- [ ] Redis has only two eviction policies
- [x] Redis LRU is an approximation made by sampling a few keys
- [ ] LFU was in Redis from the first version

Explanation: Redis documents ten policies, and LFU arrived in Redis 4.0.

## Diagram

```json
{ "kind": "sequence", "caption": "Cache-aside read of key 42. The app asks the cache (1) and gets a miss (2). It reads the database (3), gets the value (4), and then stores the value in the cache with an expiry (5) before replying. On a hit the app would stop after step 2 and the database would not be touched.",
  "actors": [ { "id": "a", "label": "App" }, { "id": "c", "label": "Cache" }, { "id": "d", "label": "Database" } ],
  "messages": [ { "from": "a", "to": "c", "label": "Get key 42" }, { "from": "c", "to": "a", "label": "Miss", "dashed": true }, { "from": "a", "to": "d", "label": "Read key 42" }, { "from": "d", "to": "a", "label": "Value", "dashed": true }, { "from": "a", "to": "c", "label": "Store value + expiry" } ] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A stampede avoided by request coalescing. Request A and request B ask for the same missing key. A is the one that goes to the database; the cache tells B to wait. When A has filled the cache, B receives the value. Without coalescing, B would also read the database. This is one way to build it (our design); Nginx and Varnish instead fetch the value on the caller's behalf.",
  "actors": [ { "id": "a", "label": "Request A" }, { "id": "b", "label": "Request B" }, { "id": "c", "label": "Cache" }, { "id": "d", "label": "Database" } ],
  "messages": [ { "from": "a", "to": "c", "label": "Get hot key" }, { "from": "c", "to": "a", "label": "Miss: refill it", "dashed": true }, { "from": "b", "to": "c", "label": "Get hot key" }, { "from": "c", "to": "b", "label": "Miss: wait for A", "dashed": true },
                { "from": "a", "to": "d", "label": "Read key" }, { "from": "d", "to": "a", "label": "Value", "dashed": true }, { "from": "a", "to": "c", "label": "Store value" }, { "from": "c", "to": "b", "label": "Value", "dashed": true } ] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write-through against write-behind with an inline cache (the cache itself writes the database). Write-through (messages 1 to 4): the cache writes x=5 to the database and only then tells the app it is done. Write-behind (messages 5 to 8): the cache answers done for x=6 at once, and saves it to the database later, so a change in that gap lives only in the cache.",
  "actors": [ { "id": "a", "label": "App" }, { "id": "c", "label": "Cache" }, { "id": "d", "label": "Database" } ],
  "messages": [ { "from": "a", "to": "c", "label": "Write x = 5" }, { "from": "c", "to": "d", "label": "Write x = 5" }, { "from": "d", "to": "c", "label": "Saved", "dashed": true }, { "from": "c", "to": "a", "label": "Done", "dashed": true },
                { "from": "a", "to": "c", "label": "Write x = 6" }, { "from": "c", "to": "a", "label": "Done (not saved yet)", "dashed": true }, { "from": "c", "to": "d", "label": "Later: write x = 6" }, { "from": "d", "to": "c", "label": "Saved", "dashed": true } ] }
```
