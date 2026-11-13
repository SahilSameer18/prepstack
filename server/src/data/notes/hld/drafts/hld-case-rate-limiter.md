---
id: hld-case-rate-limiter
title: "Case Study: Distributed Rate Limiter"
next: hld-case-key-value-store
roadmapSteps: backend:deployment-cloud, fullstack:security-performance
---
<!-- Draft 13 Nov 2026, not published. Numbers from docs/content/checks/hld-case-check.py (sections 2A to 2D). Sources read: Redis INCR page, Stripe engineering blog post of 30 March 2017. -->

## Overview

A rate limiter (a guard that refuses a caller who sends too many requests in a time) protects an API from overload and from one noisy caller. With one server it is a counter. With many servers the hard part is that the count must be shared, and shared fast. This note builds one design from stated assumptions, not "the" answer. The central trade-off is accuracy against speed and availability. After this note you can place the limiter, choose an algorithm, and explain what happens when its store is down.

## Topic: Requirements and scope

**Definition:** We build a check that answers "allowed or not" for each request, using a rule per user, per key (an API key a customer holds), per IP address or per endpoint. Refused callers get a 429 answer with a wait time. Non-functional: the check adds little delay, works across many servers, and a failure of the limiter must not take the whole API down. Out of scope: defence against huge network floods, billing, and login-fraud rules.

**Why:** The algorithm is decided by what you limit and how much burst you accept, so clarify these first.

**Example:** (1) Limit 100 requests a minute per API key. (2) A lower limit on an expensive endpoint. (3) Short bursts allowed. (4) Rules changeable without a restart. (5) Return 429 and Retry-After (see System Design: APIs, Gateways and Rate Limiting). Out: counting clicks or billing.

**Failure:** If "per IP" is skipped, one anonymous caller is not limited. The follow-up: many users behind one office address share an IP, so an IP limit may refuse honest people.

## Topic: Numbers

**Definition:** The memory and request rate of the limiter. All inputs are assumptions: 10,000,000 active users; a token bucket (a count of tokens and a time) is 8 bytes each, plus a 50-byte key; each user sends one request every 10 seconds on average (2C).

**Why:** They show whether memory or request rate is the limit.

**Example:** 8 + 8 + 50 = 66 bytes a user; 10,000,000 users is 660 MB. The request rate is 1,000,000 a second (2C), so each request needs a store check at that rate.

**Failure:** 660 MB is small. If users were 10x more, 6.6 GB still fits in memory. If the rate were 10x higher (10,000,000 checks a second), no single store keeps up and we must split keys across stores. Rate, not memory, is the limit.

## Topic: API and data

**Definition:** One internal call and two kinds of data. `allow(key, rule)` returns allowed or refused, tokens left, and seconds to wait. A rule record: rule id, what it applies to (user, key, IP, endpoint), bucket size, refill rate. A state record per key and rule: tokens left and last-refill time.

**Why:** The check reads and updates one small record by key, so a fast key-value store (a store that finds a value by key) in memory fits (see System Design: Choosing Databases). Rules change rarely and are read all the time.

**Example:** `allow("key:abc|POST /search", rule 7)` returns `{allowed: true, tokens: 9}`. The state key joins who and what.

**Failure:** The model cannot answer "who is near their limit now" without scanning all keys. That is a report, not a request path.

## Topic: The first design

**Definition:** The gateway (the single entry point in front of services) runs the limiter check before forwarding. It reads the rule, then asks a shared store for the caller's tokens. See diagram 1.

**Why:** The edge is where every request passes once, so one check protects all services. A shared store makes the count the same on every gateway server.

**Example:** (1) Request arrives at a gateway server. (2) The gateway finds the rule for this caller and endpoint. (3) It asks the shared store to take one token. (4) If allowed, it forwards the request; if not, it answers 429 with Retry-After. See diagram 2.

**Failure:** The first bottleneck is the store: every request makes one call to it, 1,000,000 a second in our assumption.

## Topic: Where it runs and which algorithm

**Definition:** Three places. In the client, the caller limits itself (cheap but cannot be trusted). In a gateway, one layer in front of all services. As middleware (code inside each service), where it sees business facts but is repeated everywhere. Algorithm: token bucket (tokens refill steadily, each request takes one, none left means refused).

**Why:** Gateway, because a client cannot be trusted and middleware repeats work. Stripe described in 2017 that it used the token bucket algorithm and kept the buckets in a central Redis-based store, with a bucket for each user (its post, 30 March 2017). My reasoning for token bucket: bursts of real users are normal, and the bucket size says how big a burst we accept. Rejected: fixed window, which counts per clock window and lets through twice the limit around a boundary: 10 requests in 1.8 seconds against a limit of 5 per 10 seconds (I1 in System Design: APIs, Gateways and Rate Limiting). Memory is also small for the bucket (I3, same section).

**Example:** 2D, assumption: capacity 10 tokens, refill 5 a second. 15 requests at time 0: 10 allowed. 15 more at time 1: 5 allowed (5 tokens refilled). Rules: kept in a rules store, copied into each gateway's memory, refreshed on a short timer (assumption: every few seconds), so a change needs no restart. Stripe described kill switches and feature flags to turn a limiter off, and "dark launch": run it first only to watch what it would block.

**Failure:** A large bucket allows a large burst and can defeat the point. Per-IP limits hurt people behind a shared address.

## Topic: Counting across many servers

**Definition:** The count is shared by many gateway servers. Three ways: a central store, local counters synced later, or a quota split.

**Why:** The naive way breaks. 2A, assumption: limit 5 and 10 requests that all read the counter before any writes it: read-then-write lets all 10 through; with an atomic increment (one step no other request can interleave) only 5 are allowed. Redis's INCR page describes INCR as an atomic increment and gives a rate-limiter pattern: INCR a counter and set EXPIRE (a time after which the key disappears) in one MULTI/EXEC block (a group of commands run together), because if the INCR happens and the EXPIRE does not, the key leaks. For a token bucket, which has two fields, the same page fixes its own race with a Lua script (code that runs inside Redis as one step). Quota split (2B, assumption: limit 100 a minute, 5 servers): each server gets 20, so a user whose requests all land on one server can use only 20 of 100 (20%). If each server instead checks its own counter against the full 100, one user can send 500 a minute, 5x the limit.

**Example:** Choice: a central Redis, keys spread over several nodes by hash of the key, atomic script per check. Accurate; costs one network step per request. Rejected: local counters synced later, which are fast but allow overshoot while they are out of date. A hybrid: servers take a block of tokens from the store and spend them locally (my own reasoning).

**Failure:** One very busy key lands on one store node (a hot spot). Fix: a small local allowance first, then the store.

## Topic: Failures and scaling

**Definition:** The limiter's store goes down. Two choices: fail open (allow every request) or fail closed (refuse every request).

**Why:** Failing open keeps the API up but removes protection exactly when the system is hurt. Failing closed protects the backend but makes the limiter a single point of failure that stops everyone. Stripe described in 2017 that limiter errors at every level should fail open, so a bug or a Redis outage does not break API requests. My choice: fail open for ordinary calls, with a fallback to a local limit of quota divided by servers (20 of 100 in 2B) so a flood is still bounded. Fail closed for sensitive actions like password attempts.

**Example:** Redis is unreachable. The gateway waits a short time (assumption), then uses its local counter and logs the failure. A user sees normal answers; a user who sends many requests meets the stricter local limit sooner. See diagram 4.

**Failure:** At 10x traffic, add store nodes and split keys by hash; if the store fails for long, alerts must fire, as a silent fail open is a hole.

## Questions

### Why not read the counter, add one, and write it back?

Overlapping requests all read the same number, so all pass. In 2A, 10 requests were allowed with a limit of 5. Use an atomic increment or a script.

### Central store or local counters?

Central is accurate but costs a step per request. Local is fast but a user spread over 5 servers can reach 5x the limit (2B). I choose central with hashing.

### Fail open or closed?

Open for general APIs so a store outage is not an API outage, with a local backup limit. Closed for sensitive actions.

### Why token bucket?

It allows controlled bursts and uses little memory.

## Mistakes

- "Each server checks its own counter against the full limit." One user gets servers times the limit.
- "A fixed window is exact." It allows double around the boundary.
- "If the limiter fails, refuse everything to be safe." That turns the limiter into an outage.

## Quiz

### Limit 5, ten overlapping read-then-write requests: how many are allowed?

- [ ] 5
- [ ] 0
- [x] 10
- [ ] 15

Explanation: 2A.

### Limit 100 a minute, 5 servers, each checking the full limit locally. Most one user can send?

- [ ] 100
- [ ] 20
- [x] 500
- [ ] 50

Explanation: 2B: 5 times 100.

### Capacity 10, refill 5 a second. 15 requests at 0 and 15 at 1 second. Allowed in the second batch?

- [ ] 10
- [x] 5
- [ ] 15
- [ ] 0

Explanation: 2D.

### What did Stripe describe in 2017 about limiter errors?

- [ ] They should refuse all requests
- [x] They should fail open
- [ ] They should be ignored in logs
- [ ] They should restart the API

Explanation: Stripe engineering blog, 30 March 2017.

### What limits the store in 2C?

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
{ "kind": "sequence", "caption": "The decision. The gateway asks the store to take a token in one atomic step. With tokens left it forwards and the service answers. With none left it answers 429 and a wait time (the second request).", "actors": [{ "id": "c", "label": "Client" }, { "id": "g", "label": "Gateway" }, { "id": "s", "label": "Store" }, { "id": "v", "label": "Service" }], "messages": [{ "from": "c", "to": "g", "label": "Request" }, { "from": "g", "to": "s", "label": "Take a token (atomic)" }, { "from": "s", "to": "g", "label": "Allowed, 9 left", "dashed": true }, { "from": "g", "to": "v", "label": "Forward" }, { "from": "v", "to": "c", "label": "200 OK", "dashed": true }, { "from": "c", "to": "g", "label": "Request (no tokens)" }, { "from": "g", "to": "c", "label": "429, Retry-After", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "The race in 2A. Two requests both read the counter as 4 before either writes. Each writes 5 and each is allowed, though the limit allows only one more. An atomic increment would give one of them 5 and the other 6.", "actors": [{ "id": "a", "label": "Request A" }, { "id": "s", "label": "Store" }, { "id": "b", "label": "Request B" }], "messages": [{ "from": "a", "to": "s", "label": "Read counter" }, { "from": "s", "to": "a", "label": "4", "dashed": true }, { "from": "b", "to": "s", "label": "Read counter" }, { "from": "s", "to": "b", "label": "4", "dashed": true }, { "from": "a", "to": "s", "label": "Write 5" }, { "from": "b", "to": "s", "label": "Write 5" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "When the store is down. The gateway tries the store (1) and gets no answer (2, dashed). It falls back to a local limit of quota divided by servers (3) and forwards allowed requests to the service (4).", "nodes": [{ "id": "g", "label": "Gateway", "x": 12, "y": 50 }, { "id": "s", "label": "Store (down)", "x": 50, "y": 16, "shape": "external" }, { "id": "l", "label": "Local limit", "x": 50, "y": 84, "shape": "cache" }, { "id": "v", "label": "Service", "x": 88, "y": 84 }], "edges": [{ "from": "g", "to": "s", "step": 1 }, { "from": "g", "to": "l", "step": 3 }, { "from": "l", "to": "v", "step": 4 }, { "from": "s", "to": "g", "step": 2, "dashed": true }] }
```
