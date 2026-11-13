---
id: hld-case-url-shortener
title: "Case Study: URL Shortener"
next: hld-case-rate-limiter
roadmapSteps: backend:database-design, java-spring:spring-rest-api
---
<!-- Draft 13 Nov 2026, not published. Numbers from docs/content/checks/hld-case-check.py (sections 1A to 1E). Redirect rules from RFC 9110 sections 15.4.2 and 15.4.3. -->

## Overview

A URL shortener (a service that turns a long web address into a short one and sends visitors from the short one to the long one) is a small problem with real choices inside it. This note builds one design from stated assumptions, not "the" answer. The central trade-off is how to make short codes that never repeat, and how to make the redirect fast and still count clicks. After this note you can size the system, choose a code scheme with reasons, and explain 301 against 302.

## Topic: Requirements and scope

**Definition:** We build two things: create a short link for a long URL (optionally with a custom alias, a name the user picks), and open a short link to be sent on to the long URL. Non-functional (about speed and size, not features): redirects must be fast and almost always available, and a short code must never point to two different URLs. Out of scope: user accounts, spam checks, and click analytics.

**Why:** An interviewer wants to hear you ask first. Reads outnumber writes by a lot, so the redirect is the path to protect.

**Example:** (1) Create: long URL in, short code out. (2) Open: short code in, redirect out. (3) Optional expiry date. (4) Optional custom alias. (5) A code is never reused for another URL while it exists. Out of scope: login, counting clicks (see hld-case-top-k-counting).

**Failure:** Skipping "can links expire or be deleted?" changes the design later: an interviewer will ask what happens to a deleted link that browsers remember (see Fast redirects).

## Topic: Numbers

**Definition:** An estimate of traffic and storage. Every input is an assumption: 100 million new links a month, 100 reads per write, 500 bytes a record, kept 5 years (script 1A).

**Why:** The numbers decide the code length, whether one database is enough, and how much cache pays off.

**Example:** Assumption-based results: 38.6 writes a second on average, 3,858 reads a second, 7,716 at a peak of 2x (the 2x peak is also an assumption). After 5 years: 6,000,000,000 links and 3.0 TB. Codes of 7 characters from a-z, A-Z, 0-9 (62 symbols) give 62^7 = 3,521,614,606,208 codes (1B), so 6 billion links use 0.170% of them.

**Failure:** If reads were 10x higher (about 77,000 a second at the peak), one database could not answer them and a cache becomes required. If storage were 10x larger (30 TB), you split the table across machines (see System Design: Replication and Partitioning).

## Topic: API and data

**Definition:** Two calls and one table. `POST /links` with the long URL, optional alias and optional expiry returns the code. `GET /{code}` answers with a redirect. Optionally `DELETE /{code}`. One record per link: code (the key), long URL, created time, expiry time, owner.

**Why:** Every read is "give me the record for this exact key", and nothing needs joins or ranges. A key-value store (a store that finds a value by its key) or a simple table with the code as primary key (see System Design: Choosing Databases) fits. About 500 bytes a record is the assumption from the numbers topic.

**Example:** `POST /links {"url": "https://example.com/very/long", "alias": "spring-sale"}` returns `{"code": "spring-sale"}`. `GET /spring-sale` returns a redirect with the long URL in the Location header.

**Failure:** The model cannot answer "all links of one owner, newest first" or "which links point to this site" well. Add a second index on owner if that matters.

## Topic: The first design

**Definition:** Clients call a few identical app servers behind a load balancer (a machine that spreads requests, see Computer Networks: System Design Concepts). The app uses a cache (fast memory store) in front of the database. A small code-number service hands out numbers. See diagram 1.

**Why:** App servers hold no state, so we add more when reads grow. The cache takes repeated reads off the database. The database is the one source of truth.

**Example:** Read path: (1) browser asks the app for the code; (2) the app checks the cache; (3) on a miss, it reads the database and fills the cache; (4) it replies with a redirect. Write path: (1) the app gets the next number, (2) turns it into a code, (3) writes the record to the database, (4) returns the code. See diagrams 2 and 3.

**Failure:** The first bottleneck is the database read rate at the peak of 7,716 reads a second, and then the single place that hands out numbers.

## Topic: Making short codes

**Definition:** Four ways to get a code. (a) Counter plus base 62: take the next number and write it in base 62 (digits and letters). Counter 62 becomes `10`; counter 1,000,000 becomes `4c92`; counter 6,000,000,000 becomes `6y3o5y`, six characters (1C). (b) Scrambled counter: multiply the counter by a fixed number and keep the remainder modulo 62^7; counters 1 to 5 give `02TDK01`, `05Nhu02` and so on, and the script found no repeat in the first 1,000,000 counters (1C). (c) Random code with a collision check: pick random characters and try again if the code exists. (d) Hash of the long URL: cut the first characters of a hash (a fixed-size fingerprint) of the URL.

**Why:** The comparison. Length (1B): 7 characters is plenty. Collisions (1D, assumption: random choice): the chance a new random code is taken equals the share used. At 0.17% used, 1.00 tries on average; at 50%, 2.00; at 90%, 10.00. Our design stays near 0.17%, so retries are rare, but each needs a database check and it needs the check to be atomic (one step that cannot be split) or two servers may take the same code. A hash cut short can give the same code for two different URLs, so it also needs a check, and the same URL then always gets one code, which cannot give two users separate links. A plain counter never collides but is guessable: a visitor can try the next number. My reasoning: the scramble hides the order, but anyone who sees a few pairs can work out the multiplier, so it is obscurity, not security. I choose the scrambled counter; a custom alias is just stored if it is free.

**Example:** One counter is a bottleneck and a single point of failure. Fix: each app server asks the number service for a block, for example 1,000 numbers (assumption), and hands them out itself. The service is called once per 1,000 writes. A crashed server loses its unused numbers; that is fine, as gaps cost nothing in a space of 3.5 trillion.

**Failure:** Custom aliases must use the same atomic "insert if absent" step, or two users can claim one alias. Aliases must also be kept apart from generated codes (for example a reserved length), or a generated code later hits a user's alias.

## Topic: Fast redirects

**Definition:** A redirect is a reply that sends the browser to another address. Hit ratio is the share of reads answered by the cache. Assumption for 1E: 100,000 links, reads spread unevenly (a few links get most reads), least-recently-used eviction (throw out the entry unused longest), by simulation. Cache holding 0.5% of links: 43.8% hit; 1%: 50.3%; 5%: 66.0%; 10%: 72.5%.

**Why:** At the 7,716 peak, a 1% cache leaves 49.7% of reads for the database: about 3,835 a second. A 10% cache leaves 27.5%: about 2,122 (my arithmetic). The gains slow down, so a bigger cache buys less each time. The hit ratio depends on how uneven real reads are, which is an assumption here. RFC 9110 section 15.4.2 says a 301 (Moved Permanently) tells everyone to use the new address in future, and the response is heuristically cacheable, so a browser may keep it and not ask us again. Section 15.4.3 says a 302 (Found) means a temporary move, so the client keeps using the original address, and that section does not make it cacheable by default. Rejected: 301. It cuts load, but a browser that remembers the redirect never reaches us, so clicks are not counted and a changed or expired link keeps working for that browser. We choose 302, accept the extra load, and count clicks elsewhere (see hld-case-top-k-counting).

**Example:** Read-heavy load (100 reads per write): a hit costs one cache lookup; a miss one database read plus a cache fill. Expiry: store the expiry time in the record; on a read, if it has passed, answer "not found" and drop the cache entry. Give cache entries a time to live no longer than the link's remaining life. See System Design: Caching.

**Failure:** A deleted link stays reachable until its cache entry goes: delete from the database and the cache together. A popular cold key can send many misses at once (stampede, see Caching).

## Topic: Failures and scaling

**Definition:** What fails: a cache node, the database leader, an app server. Servers are replaceable. The cache and database need a plan. See diagram 4.

**Why:** Redirects matter more than creating links, so reads must survive failures that writes may not. Replicas (extra copies of the database) serve reads (see Replication and Partitioning).

**Example:** The cache dies: reads go to the database. With a 1% cache the database took 3,835 reads a second at the peak; with no cache it takes all 7,716, so it may slow down. The fix is more replicas and a warm-up. Users see slower redirects, not errors.

**Failure:** At 10x traffic, replicas stop being enough for writes and size: shard by code (see Replication and Partitioning) and add cache nodes.

## Questions

### Why not hash the long URL and take the first 7 characters?

Two different URLs can give the same 7 characters, so you still need a check and a retry, and the same URL always gives the same code.

### How do many servers make codes without clashing?

Each takes a block of numbers from a number service, such as 1,000, and uses its own block alone.

### 301 or 302?

302. A 301 can be cached by the browser, so clicks are lost and links cannot be changed.

### What if the cache is empty after a restart?

Reads go to the database. Warm the cache or add replicas to cover the load.

## Mistakes

- "A hash of the URL has no collisions." A short cut of a hash can repeat.
- "Use 301 because it is faster." The browser may stop asking us, so clicks are not counted and expiry fails.
- "A scrambled counter is secret." It hides the order only.

## Quiz

### How many characters of a-z, A-Z and 0-9 does a 7-character code have room for?

- [ ] 62 million
- [ ] 916 million
- [x] 3.5 trillion
- [ ] 218 trillion

Explanation: 62^7 = 3,521,614,606,208 (1B).

### In this design, what is the chance a new random code is already taken?

- [ ] Always 50%
- [x] The share of the code space already used
- [ ] Zero
- [ ] Equal to the cache hit ratio

Explanation: 1D: at 0.17% used about 1 try, at 90% about 10.

### Why does a 301 make click counting hard?

- [ ] It is slower
- [x] A browser may remember it and not contact us again
- [ ] It deletes the link
- [ ] It needs a cookie

Explanation: RFC 9110 15.4.2 says a 301 is heuristically cacheable.

### How do servers avoid one counter bottleneck?

- [ ] Use random codes only
- [x] Each takes a block of numbers and hands them out itself
- [ ] Hash each URL
- [ ] Drop the database

Explanation: One call per block, for example 1,000 numbers.

### Cache size 1% of links gave which hit ratio in 1E?

- [ ] 43.8%
- [x] 50.3%
- [ ] 66.0%
- [ ] 72.5%

Explanation: 1E, an assumption-based simulation.

## Diagram

```json
{ "kind": "graph", "caption": "The first design. A user sends a short-link request (1) to the app servers. The app checks the cache (2); on a miss it reads the database (3). For a new link, the app gets numbers from the number service (4, dashed). The cache, database and number service sit in one data centre.", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "u", "label": "User", "x": 6, "y": 50, "shape": "client" }, { "id": "app", "label": "App servers", "x": 36, "y": 50, "group": "dc" }, { "id": "c", "label": "Cache", "x": 72, "y": 16, "shape": "cache", "group": "dc" }, { "id": "db", "label": "Database", "x": 72, "y": 50, "shape": "database", "group": "dc" }, { "id": "n", "label": "Number service", "x": 36, "y": 88, "group": "dc" }], "edges": [{ "from": "u", "to": "app", "step": 1 }, { "from": "app", "to": "c", "step": 2 }, { "from": "app", "to": "db", "step": 3 }, { "from": "app", "to": "n", "step": 4, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path. The app gets a number from its own block, turns it into a code, stores the record, and returns the code. If the block is used up, it asks the number service for another block first.", "actors": [{ "id": "u", "label": "User" }, { "id": "a", "label": "App" }, { "id": "n", "label": "Number service" }, { "id": "d", "label": "Database" }], "messages": [{ "from": "u", "to": "a", "label": "Create link" }, { "from": "a", "to": "n", "label": "Next block (if empty)" }, { "from": "n", "to": "a", "label": "1,000 numbers", "dashed": true }, { "from": "a", "to": "d", "label": "Insert code if absent" }, { "from": "d", "to": "a", "label": "Stored", "dashed": true }, { "from": "a", "to": "u", "label": "Short code", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path. The app asks the cache first. On a miss it reads the database, fills the cache, and the user gets a 302 redirect either way.", "actors": [{ "id": "u", "label": "Browser" }, { "id": "a", "label": "App" }, { "id": "c", "label": "Cache" }, { "id": "d", "label": "Database" }], "messages": [{ "from": "u", "to": "a", "label": "GET /code" }, { "from": "a", "to": "c", "label": "Look up code" }, { "from": "c", "to": "a", "label": "Miss", "dashed": true }, { "from": "a", "to": "d", "label": "Read record" }, { "from": "d", "to": "a", "label": "Long URL", "dashed": true }, { "from": "a", "to": "c", "label": "Fill cache", "dashed": true }, { "from": "a", "to": "u", "label": "302 + Location", "dashed": true }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Scaling the reads. Writes go to the database leader (1). Reads go to a replica (2). The leader copies changes to the replica in the background (3, dashed). If the cache is lost, reads still work through the replica.", "nodes": [{ "id": "a", "label": "App servers", "x": 10, "y": 50 }, { "id": "l", "label": "Leader", "x": 60, "y": 18, "shape": "database" }, { "id": "r", "label": "Replica", "x": 60, "y": 82, "shape": "database" }], "edges": [{ "from": "a", "to": "l", "step": 1 }, { "from": "a", "to": "r", "step": 2 }, { "from": "l", "to": "r", "step": 3, "dashed": true }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "Counter to code. The counter 1,000,000 is divided by 62 again and again; the remainders are the digits 4, c, 9 and 2, written as the code 4c92 (script 1C).", "steps": [{ "label": "Counter 1,000,000" }, { "label": "Divide by 62 repeatedly" }, { "label": "Digits 4, c, 9, 2" }, { "label": "Code 4c92" }] }
```
