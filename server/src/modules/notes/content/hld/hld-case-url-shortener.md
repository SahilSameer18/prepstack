---
id: hld-case-url-shortener
title: "Case Study: URL Shortener"
lastChecked: 2026-11-13
next: hld-case-rate-limiter
roadmapSteps: backend:database-design, java-spring:spring-rest-api
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A URL shortener (a service that turns a long web address into a short one and sends visitors from the short one to the long one) is a small problem with real choices inside it. This note builds one design from stated assumptions, not "the" answer. The central trade-off: codes that never repeat, and a redirect that is fast yet sees every click. After this note you can size the system, choose a code scheme with reasons, and explain 301 against 302.

## Topic: Requirements and scope

**Definition:** We build two things: create a short link for a long URL (optionally with a custom alias, a name the user picks), and open a short link to be sent on to the long URL. Non-functional (about speed and size, not features): redirects are fast and almost always available, and a code never points to two URLs. Out of scope: accounts, spam checks, click analytics.

**Why:** Reads far outnumber writes, so protect the redirect.

**Example:** (1) Create: long URL in, short code out. (2) Open: short code in, redirect out. (3) Optional expiry date. (4) Optional custom alias. (5) A code is never reused for another URL while it exists. Out of scope: login, counting clicks (see Case Study: Top-K and Click Counting).

**Failure:** Skipping "can links expire or be deleted?" bites later: what happens to a deleted link that browsers remember (see Fast redirects)?

## Topic: Numbers

**Definition:** An estimate of traffic and storage. Every input is an assumption: 100 million new links a month, 100 reads per write, 500 bytes a record, kept 5 years, and a peak of 2 times the average.

**Why:** The numbers decide code length, whether one database is enough, and how much cache pays off.

**Example:**
- Writes: 100,000,000 / (30 x 86,400 seconds) = 38.6 a second.
- Reads: 38.6 x 100 = 3,858 a second; at the peak, x 2 = 7,716.
- Five years: 100,000,000 x 12 x 5 = 6,000,000,000 links; x 500 bytes = 3.0 TB.
- Codes of 7 characters from 62 symbols: 62^7 = 3,521,614,606,208. 6 billion / 3.52 trillion = 0.17 percent of them used.

**Failure:** If reads were 10x higher (77,160 a second at the peak), one database would not cope (our judgement, not measured), so a cache becomes required. If storage were 10x larger (30 TB), you split the table across machines (see System Design: Replication, Sharding and Consistent Hashing).

## Topic: API and data

**Definition:** Two calls and one table. `POST /links` with the long URL, optional alias and optional expiry returns the code. `GET /{code}` answers with a redirect (a reply that tells the browser to go to another address). One record per link: code (the primary key, the field that finds the record), long URL, created time, expiry time, owner.

**Why:** Every read asks for one exact key: no combining of tables and no ranges of keys. A key-value store (a store that finds a value by its key) or a simple table with the code as primary key fits (see System Design: Choosing a Database).

**Example:** `POST /links {"url": "https://example.com/very/long", "alias": "spring-sale"}` returns `{"code": "spring-sale"}`. `GET /spring-sale` returns a redirect with the long URL in the Location header (the line of the reply that carries the new address).

**Failure:** The model cannot answer "all links of one owner, newest first" well. Add a second index on owner if that matters.

## Topic: The first design

**Definition:** Clients call a few identical app servers behind a load balancer (a machine that spreads requests, see Computer Networks: System Design Concepts). The app uses a cache (fast memory store) in front of the database. A small number service hands out numbers. See diagram 1.

**Why:** App servers keep nothing between requests, so any server can take any request and we add more when reads grow. The cache takes repeated reads off the database, which holds the real data.

**Example:** Read path: (1) the browser asks the app; (2) the app checks the cache; (3) on a miss it reads the database and fills the cache; (4) it replies with a redirect. Write path: (1) the app gets the next number, (2) turns it into a code, (3) writes the record, (4) returns the code. See diagrams 2 and 3.

**Failure:** The first bottleneck is the database read rate at the peak of 7,716 reads a second (our judgement), and then the single place that hands out numbers.

## Topic: Making short codes

**Definition:** Base 62 means counting with 62 symbols: 0 to 9 are the values 0 to 9, a to z are 10 to 35, and A to Z are 36 to 61. So 62 is written `10`. Counter 1,000,000: divide by 62 again and again and keep the remainders: 2, 9, 12 (the letter c), 4. Read backwards they give `4c92`. Counter 6,000,000,000 gives `6y3o5y`. Four ways to get a code:
- (a) Counter written in base 62.
- (b) Scrambled counter: multiply the counter by a fixed large number (2,718,281,829) and keep the remainder after dividing by 62^7 (modulo).
- (c) Random code, tried again if it already exists.
- (d) The first characters of a hash (a fixed-size fingerprint) of the URL.

**Why:**
- (a) never repeats, but is guessable: a visitor can try the next number.
- (b) neighbouring counters look unrelated: 1 to 5 give `02XXDhj`, `05VVgyC`, `08TSTPV`, `0bRQx7e`, `0ePOaox`. But this multiplier is 19 modulo 62, so the last character steps by 19 each time (j, C, V, e, x) and the first characters move slowly. It hides the order only from a casual look, not from someone who studies the codes. A program found no repeat in the first 1,000,000 counters.
- (c) If a share p of codes is used, a random try fails with chance p, so the average number of tries is 1 / (1 - p): 1.00 at 0.17 percent used, 2.00 at 50 percent, 10.00 at 90 percent (assumption: uniform random choice). Each try needs a database check that is atomic (one step that cannot be split), or two servers may take the same code.
- (d) two URLs can share the cut hash, and the same URL always gets one code, so two users cannot have separate links.
- Our choice (reasoning): (b), because it never repeats and needs no check. A custom alias is just stored if it is free.

**Example:** One counter is a bottleneck and a single point of failure (one part whose failure stops everything). Fix: each app server asks the number service for a block of 1,000 numbers (assumption) and hands them out itself. A crashed server loses its unused numbers; gaps cost nothing in a space of 3.5 trillion.

**Failure:** Custom aliases must use the same atomic "insert if absent" step, or two users can claim one alias. Keep aliases apart from generated codes (for example a reserved length).

## Topic: Fast redirects

**Definition:** Hit ratio is the share of reads answered by the cache. Assumption: a program simulated 100,000 links where a few links get most of the reads, with a cache that drops the entry unused longest. A cache holding 0.5% of links: 43.8% hit; 1%: 50.3%; 5%: 66.0%; 10%: 72.5%.

**Why:** At the 7,716 peak, a 1% cache leaves 100 - 50.3 = 49.7 percent for the database: 7,716 x 0.497 = about 3,835 a second. A 10% cache leaves 27.5 percent: about 2,122. Each step buys less.
A 301 means "moved for good". RFC 9110 (the web protocol standard) section 15.4.2 says it is heuristically cacheable (a browser may keep it without being told how long), so it may never ask us again. A 302 means "moved for now": section 15.4.3 says the client keeps using the original address. Rejected: 301. It cuts load, but a browser that remembers it never reaches us, so clicks are missed and a changed or expired link keeps working for that browser. We choose 302 and send a Cache-Control header (a reply line saying how long a copy may be kept) of no-store or a short time (our design). Every click is then a request, so we write it to a log for the counting service.

**Example:** Expiry: store the expiry time in the record; on a read, if it has passed, answer "not found" and drop the cache entry. Give cache entries a time to live (how long an entry may stay) no longer than the link's remaining life. See System Design: Caching.

**Failure:** A deleted link stays reachable until its cache entry goes. Delete the database row first, then the cache entry (our reasoning); a short time to live covers a reader refilling the cache between the two steps. When a popular link is not in the cache, many requests may miss at once and all hit the database (a cache stampede).

## Topic: Failures and scaling

**Definition:** What fails: a cache node, the database leader, an app server. Servers are replaceable. The cache and database need a plan. See diagram 4.

**Why:** Reads must survive failures that writes may not. Replicas (extra copies of the database) serve reads.

**Example:** The cache dies: reads go to the database. With a 1% cache the database took 3,835 reads a second at the peak; with no cache it takes all 7,716, so it may slow down. Fix: more replicas and a warm-up. Users see slower redirects, not errors.

**Failure:** At 10x traffic, replicas stop being enough: split the table by code across machines (sharding) and add cache nodes.

## Questions

### Why not hash the long URL and take the first 7 characters?

Two different URLs can give the same 7 characters, so you still need a check and a retry, and the same URL always gives the same code.

### How do many servers make codes without clashing?

Each takes a block of numbers, such as 1,000, from a number service and uses its block alone.

### 301 or 302?

302. A 301 can be remembered by the browser, so clicks are missed and links cannot be changed for that browser.

## Mistakes

- "A hash of the URL has no collisions." A short cut can repeat.
- "Use 301 because it is faster." The browser may stop asking us, so clicks are missed and expiry fails.
- "A scrambled counter is secret." It hides the order only from a casual look; the last character still steps by a fixed amount.

## Quiz

### How many different codes can 7 characters from a-z, A-Z and 0-9 make?

- [ ] 62 million
- [ ] 916 million
- [x] 3.5 trillion
- [ ] 218 trillion

Explanation: 62^7 = 3,521,614,606,208.

### If a service picks random codes, what is the chance a new random code is already taken?

- [ ] Always 50%
- [x] The share of the code space already used
- [ ] Zero
- [ ] Equal to the cache hit ratio

Explanation: At 0.17% used about 1 try; at 90% about 10.

### Why does a 301 make click counting hard?

- [ ] It is slower
- [x] A browser may remember it and not contact us again
- [ ] It deletes the link
- [ ] It needs a cookie

Explanation: RFC 9110 section 15.4.2 says a 301 is heuristically cacheable.

### How do servers avoid one counter bottleneck?

- [ ] Use random codes only
- [x] Each takes a block of numbers and hands them out itself
- [ ] Hash each URL
- [ ] Give every server the same counter

Explanation: One call per block, for example 1,000 numbers.

### In the simulation above, a cache holding 10 percent of the links answered 72.5 percent of reads. What share of reads still reaches the database?

- [ ] 72.5%
- [x] 27.5%
- [ ] 10%
- [ ] 50%

Explanation: 100 - 72.5 = 27.5 percent.

## Diagram

```json
{ "kind": "graph", "caption": "The first design. A user sends a short-link request (1) to the app servers. The app checks the cache (2); on a miss it reads the database (3). For a new link, the app gets numbers from the number service (4, dashed).", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "u", "label": "User", "x": 6, "y": 50, "shape": "client" }, { "id": "app", "label": "App servers", "x": 36, "y": 50, "group": "dc" }, { "id": "c", "label": "Cache", "x": 72, "y": 16, "shape": "cache", "group": "dc" }, { "id": "db", "label": "Database", "x": 72, "y": 50, "shape": "database", "group": "dc" }, { "id": "n", "label": "Number service", "x": 36, "y": 88, "group": "dc" }], "edges": [{ "from": "u", "to": "app", "step": 1 }, { "from": "app", "to": "c", "step": 2 }, { "from": "app", "to": "db", "step": 3 }, { "from": "app", "to": "n", "step": 4, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path. The app gets a number from its own block, turns it into a code, stores the record, and returns the code. If the block is used up, it first asks the number service (\"Numbers\") for another block.", "actors": [{ "id": "u", "label": "User" }, { "id": "a", "label": "App" }, { "id": "n", "label": "Numbers" }, { "id": "d", "label": "Database" }], "messages": [{ "from": "u", "to": "a", "label": "Create link" }, { "from": "a", "to": "n", "label": "Get block if empty" }, { "from": "n", "to": "a", "label": "1,000 numbers", "dashed": true }, { "from": "a", "to": "d", "label": "Insert if absent" }, { "from": "d", "to": "a", "label": "Stored", "dashed": true }, { "from": "a", "to": "u", "label": "Short code", "dashed": true }] }
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
{ "kind": "flow", "caption": "Counter to code. The counter 1,000,000 is divided by 62 again and again. The remainders come out as 2, 9, c (the value 12) and 4; read backwards they give the code 4c92.", "steps": [{ "label": "Counter 1,000,000" }, { "label": "Divide by 62 repeatedly" }, { "label": "Remainders 2, 9, c, 4" }, { "label": "Read backwards: 4c92" }] }
```
