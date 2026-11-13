---
id: hld-case-rate-limiter
title: "Case Study: Distributed Rate Limiter"
lastChecked: 2026-11-13
next: hld-case-key-value-store
roadmapSteps: backend:deployment-cloud, fullstack:security-performance
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A rate limiter (a guard that refuses a caller who sends too many requests in a time) protects an API from overload and from one noisy caller. With one server it is a counter. With many servers the hard part is that the count must be shared, and shared fast. This note builds one design from stated assumptions, not "the" answer. The central trade-off: accuracy against speed and availability. After this note you can place the limiter, choose an algorithm, and explain what happens when its store is down.

## Topic: Requirements and scope

**Definition:** We build a check that answers "allowed or not" for each request, using a rule per user, per key (an API key a customer holds), per IP address (the number that identifies a machine on the internet) or per endpoint. Refused callers get a 429 answer with a wait time. Non-functional: the check adds little delay, works across many servers, and a failure of the limiter must not take the whole API down. Out of scope: stopping attackers who flood the network with traffic (DDoS), billing, and login-fraud rules.

**Why:** What you limit and how much burst you accept decide the algorithm, so clarify them first.

**Example:** (1) Limit 100 requests a minute per API key. (2) A lower limit on an expensive endpoint. (3) Short bursts allowed. (4) Rules changeable without a restart. (5) Return 429 and Retry-After (see System Design: APIs, Gateways and Rate Limiting).

**Failure:** If "per IP" is skipped, one anonymous caller is not limited. The follow-up: many users behind one office address share an IP, so an IP limit may refuse honest people.

## Topic: Numbers

**Definition:** The memory and request rate of the limiter. All inputs are assumptions:
- 10,000,000 active users.
- One token bucket (a count of tokens and a time) per user: two numbers, 8 bytes each.
- A key (the name that finds the bucket) of 50 bytes.
- Each user sends one request every 10 seconds on average.

**Why:** They show whether memory or rate is the limit.

**Example:** 8 + 8 + 50 = 66 bytes a user. 66 x 10,000,000 = 660,000,000 bytes = 660 MB. Request rate: 10,000,000 users / 10 seconds = 1,000,000 a second, and each request needs one store check.

**Failure:** 660 MB is small; 10x the users is 6.6 GB, still in memory. But 1,000,000 checks a second is already more than one store node should carry (our judgement, not measured), so the keys are split over several nodes from the start. At 10x the rate we need ten times as many nodes. The rate, not memory, is the limit.

## Topic: API and data

**Definition:** One internal call and two kinds of data. `allow(key, rule)` returns allowed or refused, tokens left, and seconds to wait. A rule record: rule id, what it applies to (user, key, IP, endpoint), bucket size, refill rate. A state record per key and rule: tokens left and last-refill time.

**Why:** The check reads and updates one small record by key, so a fast key-value store (a store that finds a value by key) in memory fits (see System Design: Choosing a Database).

**Example:** `allow("key:abc|POST /search", rule 7)` returns `{allowed: true, tokens: 9}`.

**Failure:** The model cannot answer "who is near their limit now" without scanning all keys. That is a report, not a request path.

## Topic: The first design

**Definition:** The gateway (the single entry point in front of services) runs the limiter check before forwarding. It reads the rule, then asks a shared store for the caller's tokens. See diagram 1.

**Why:** Every request passes the edge once, so one check protects all services. A shared store gives every gateway server the same count.

**Example:** (1) Request arrives at a gateway server. (2) The gateway finds the rule for this caller and endpoint. (3) It asks the shared store to take one token. (4) If allowed, it forwards the request; if not, it answers 429 with Retry-After. See diagram 2.

**Failure:** The first bottleneck is the store: every request makes one call to it, 1,000,000 a second in our assumption.

## Topic: Where it runs and which algorithm

**Definition:** Three places. In the client, the caller limits itself (cheap but cannot be trusted). In a gateway, one layer in front of all services. As middleware (code inside each service), where it sees business facts but is repeated everywhere. Algorithm: token bucket (tokens refill steadily, each request takes one, none left means refused).

**Why:** Gateway, because a client cannot be trusted and middleware repeats work. Stripe described in 2017 that it used the token bucket algorithm and kept the buckets in a central Redis-based store, with a bucket for each user (its post, 30 March 2017). Our reasoning for token bucket: bursts of real users are normal, and the bucket size says how big a burst we accept. It keeps two numbers per user: 16 MB per million users, against 800 MB for a log of 100 timestamps each. Rejected: fixed window (counts per clock window). With a limit of 5 per 10 seconds, five requests at 9.0 to 9.8 seconds and five at 10.0 to 10.8 seconds are all allowed: 10 requests in 1.8 seconds, twice the limit (see System Design: APIs, Gateways and Rate Limiting).
Rules live in a rules store, are copied into each gateway's memory, and are refreshed on a short timer (assumption: every few seconds), so a change needs no restart. Stripe also described kill switches (turn a limiter off fast), feature flags (turn it on for some users only) and a dark launch (run it first only to watch what it would block).

**Example:** Assumption: capacity 10 tokens, refill 5 a second, bucket starts full. 15 requests arrive at time 0: 10 take a token, 5 are refused. After 1 second the bucket holds 5 tokens, so of the next 15 requests 5 are allowed.

**Failure:** A large bucket allows a large burst.

## Topic: Counting across many servers

**Definition:** The count is shared by many gateway servers. Three ways: a central store, local counters synced later, or a quota split.

**Why:** Read-then-write is unsafe. Assumption: limit 5, and ten requests all read the counter (0) before any of them writes it: all ten are allowed. An atomic increment (one step no other request can interrupt) allows only 5. This bug, which depends on whose step lands first, is a race.
In Redis, the INCR page describes INCR as atomic and shows two counter patterns. In the first, INCR and EXPIRE (a time after which the key disappears) run in a MULTI/EXEC block (commands run together), so the key always gets an expiry. In the second, a client that does INCR but not EXPIRE would leak the key, and the page fixes that with a Lua script (code that runs inside Redis as one step). The page does not show a token bucket. A bucket has two fields (tokens and time), so its read-change-write must also be one step; running it as a Lua script is our own design choice.
Quota split (assumption: limit 100 a minute, 5 servers): each server gets 20, so a user whose requests all land on one server can use only 20 of 100 (20%). If each server instead checks its own counter against the full 100, one user spread over 5 servers can send 500 a minute, 5x the limit.

**Example:** Choice: a central Redis. A hash (a function that turns the key into a number) picks the store node, so the same key always goes to the same node. One atomic script per check. Accurate, at one network step per request. Rejected: local counters synced later, fast but they overshoot while out of date. A hybrid: servers take a block of tokens from the store and spend them locally (our own reasoning).

**Failure:** One very busy key lands on one store node (a hot spot). Fix: each gateway first spends a small allowance kept in its own memory, and only then asks the store (our own reasoning).

## Topic: Failures and scaling

**Definition:** The limiter's store goes down. Two choices: fail open (allow every request) or fail closed (refuse every request).

**Why:** Failing open keeps the API up but removes protection exactly when the system is hurt. Failing closed protects the backend but makes the limiter the one part whose failure stops everyone. Stripe described in 2017 that limiter errors at every level should fail open, so a bug or a Redis outage does not break API requests. Our choice: fail open for ordinary calls, with a fallback to a local limit of quota divided by servers (20 of 100 in the quota split above) so a flood is still kept within a limit. Fail closed for sensitive actions like password attempts.

**Example:** Redis is unreachable. The gateway waits a short time (assumption), then uses its local counter and logs the failure. Users see normal answers; a heavy sender meets the stricter local limit sooner. See diagram 4.

**Failure:** At 10x traffic, add store nodes and split keys by hash. If the store fails for long, alerts must fire: an unnoticed fail-open leaves the API unprotected.

## Questions

### Why not read the counter, add one, and write it back?

Overlapping requests all read the same number, so all pass: with a limit of 5, ten overlapping requests all get through. Use an atomic increment or a script.

### Central store or local counters?

Central is accurate but costs a step per request. Local is fast, but a user spread over 5 servers can reach 5x the limit. We choose central with hashing.

### Fail open or closed?

Open for general APIs so a store outage is not an API outage, with a local backup limit. Closed for sensitive actions.

### Why token bucket?

It allows controlled bursts and uses little memory: a bucket of 10 tokens lets a burst of 10 through, and it stores two numbers per user.

## Mistakes

- "Each server checks its own counter against the full limit." One user gets servers times the limit.
- "A fixed window is exact." It allows double around the boundary.
- "If the limiter fails, refuse everything to be safe." That turns the limiter into an outage.

## Quiz

### Assumption: limit 5. Ten requests all read the counter before any of them writes it back. How many are allowed?

- [ ] 5
- [ ] 0
- [x] 10
- [ ] 15

Explanation: Each request saw 0, so each one passes. An atomic increment would allow 5.

### Limit 100 a minute, 5 servers, each checking its own counter against the full limit. What is the most one user can send in a minute?

- [ ] 100
- [ ] 20
- [x] 500
- [ ] 50

Explanation: 5 servers x 100 = 500.

### Capacity 10 tokens, refill 5 a second, bucket starts full. 15 requests arrive at time 0 and 15 more at 1 second. How many of the second 15 are allowed?

- [ ] 10
- [x] 5
- [ ] 15
- [ ] 0

Explanation: The first 15 empty the bucket (10 allowed). One second refills 5 tokens, so 5 of the next 15 pass.

### What did Stripe describe in 2017 about limiter errors?

- [ ] They should refuse all requests
- [x] They should fail open
- [ ] They should be ignored in logs
- [ ] They should restart the API

Explanation: Stripe engineering blog, 30 March 2017.

### With 10 million users and one request each 10 seconds, what limits the store?

- [ ] Memory of 660 MB
- [x] A request rate of 1,000,000 a second
- [ ] Rule size
- [ ] Key length

Explanation: 660 MB is small; the rate is large.

## Diagram

```json
{ "kind": "graph", "caption": "The first design. A client sends a request (1) to a gateway server, which keeps its rules in memory. It asks the shared counter store to take a token (2). If allowed, the gateway forwards to the service (3); if not, it answers 429.", "groups": [{ "id": "edge", "label": "Edge" }], "nodes": [{ "id": "c", "label": "Client", "x": 8, "y": 50, "shape": "client" }, { "id": "g", "label": "Gateway servers", "x": 38, "y": 50, "group": "edge" }, { "id": "s", "label": "Counter store", "x": 38, "y": 14, "shape": "cache", "group": "edge" }, { "id": "r", "label": "Rules store", "x": 38, "y": 88, "shape": "database", "group": "edge" }, { "id": "a", "label": "Service", "x": 82, "y": 50 }], "edges": [{ "from": "c", "to": "g", "step": 1 }, { "from": "g", "to": "s", "step": 2 }, { "from": "g", "to": "a", "step": 3 }, { "from": "r", "to": "g", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "The decision. The gateway asks the store to take a token in one atomic step. With tokens left it forwards and the service answers. For a later request the store has none left, so the gateway answers 429 and a wait time.", "actors": [{ "id": "c", "label": "Client" }, { "id": "g", "label": "Gateway" }, { "id": "s", "label": "Store" }, { "id": "v", "label": "Service" }], "messages": [{ "from": "c", "to": "g", "label": "Request" }, { "from": "g", "to": "s", "label": "Take a token" }, { "from": "s", "to": "g", "label": "Allowed, 9 left", "dashed": true }, { "from": "g", "to": "v", "label": "Forward" }, { "from": "v", "to": "c", "label": "200 OK", "dashed": true }, { "from": "c", "to": "g", "label": "Later request" }, { "from": "g", "to": "s", "label": "Take a token" }, { "from": "s", "to": "g", "label": "None left", "dashed": true }, { "from": "g", "to": "c", "label": "429, Retry-After", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A small version of the read-then-write race. Two requests both read the counter as 4 before either writes. Each writes 5 and each is allowed, though the limit allows only one more. An atomic increment would give one of them 5 and the other 6; 6 is over the limit, so that request is refused.", "actors": [{ "id": "a", "label": "Request A" }, { "id": "s", "label": "Store" }, { "id": "b", "label": "Request B" }], "messages": [{ "from": "a", "to": "s", "label": "Read counter" }, { "from": "s", "to": "a", "label": "4", "dashed": true }, { "from": "b", "to": "s", "label": "Read counter" }, { "from": "s", "to": "b", "label": "4", "dashed": true }, { "from": "a", "to": "s", "label": "Write 5" }, { "from": "b", "to": "s", "label": "Write 5" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "When the store is down. The gateway tries the store (1) and gets no answer (2, dashed). It falls back to a local limit of quota divided by servers (3) and forwards allowed requests to the service (4).", "nodes": [{ "id": "g", "label": "Gateway", "x": 12, "y": 50 }, { "id": "s", "label": "Store (down)", "x": 50, "y": 16, "shape": "external" }, { "id": "l", "label": "Local limit", "x": 50, "y": 84, "shape": "cache" }, { "id": "v", "label": "Service", "x": 88, "y": 84 }], "edges": [{ "from": "g", "to": "s", "step": 1 }, { "from": "g", "to": "l", "step": 3 }, { "from": "l", "to": "v", "step": 4 }, { "from": "s", "to": "g", "step": 2, "dashed": true }] }
```
