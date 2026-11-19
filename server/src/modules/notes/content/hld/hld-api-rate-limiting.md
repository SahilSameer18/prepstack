---
id: hld-api-rate-limiting
title: APIs, Gateways and Rate Limiting
lastChecked: 2026-11-13
next: hld-reliability
roadmapSteps: java-spring:spring-rest-api, fullstack:security-performance, backend:deployment-cloud
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

An API (application programming interface, the requests a program may send to a service) is the front door of a system, and a rate limiter (a guard that caps how many requests a caller may send in a time) protects it. Interviewers ask which API style you choose, how pages of results work, how a client retries safely, and how a limiter counts. After this section you can compare REST, gRPC and GraphQL, explain cursor paging and idempotency keys, describe a gateway, trace four limiting algorithms, and explain the 429 "too many requests" reply.

## Topic: Designing the API surface

**Definition:** REST (representational state transfer) is a style where things are resources named by addresses, and you use standard HTTP methods on them. Amazon API Gateway's documentation describes RESTful APIs as HTTP-based and stateless (the server keeps no memory of the client between requests). gRPC is a framework where you define a service and its methods in a .proto file; the client calls the server through a stub (generated code) like a local object, and a method can stream. GraphQL has a schema (a typed description of the data), and the client's query asks for exactly the fields it needs.

**Why:** Own reasoning: REST is plain HTTP and fits public APIs. gRPC gives typed calls and streaming between services. GraphQL lets a client pick fields without a new endpoint.

**Example:** (own example) A phone app needs a user name and the last three orders. REST may need two addresses; GraphQL one query naming those fields.

**Failure:** "GraphQL replaces REST" or "gRPC is always faster". Tie your reason to the clients and the data.

## Topic: Pagination

**Definition:** Pagination returns a long list in pages. Offset paging says "skip N rows, give me M". Cursor paging says "give me M rows after this marker", where the marker (cursor) is an id or an opaque token (a marker the client does not look inside) from the last page.

**Why:** PostgreSQL's documentation says an offset query still computes the skipped rows, so page 1,000 is slower than page 1. A cursor starts at the marker, so every page costs about the same. Stripe's list API uses cursors: `starting_after` takes an object id, `limit` is 1 to 100 (default 10), and `has_more` says whether there is more. Google's guide (AIP-158) ends the list with an empty `next_page_token`.

**Example:** (own example, assumption: newest first, 3 per page) Page 1 returns ids 10, 9, 8. Then row 11 is added. Offset paging with skip 3 now returns 8, 7, 6, so row 8 repeats. With `starting_after=8` the cursor returns 7, 6, 5.

**Failure:** Neither guide describes rows changing during paging; the repeat above is our own example. Cursor paging cannot jump to "page 50".

## Topic: Idempotency keys for safe retries

**Definition:** Idempotent means doing it twice has the same effect as doing it once. An idempotency key is a unique value the client sends with a request so the server can recognise a retry and not repeat the action.

**Why:** If the network fails after the server acted, the client cannot tell whether it worked, and a retry could charge twice. AWS's idempotent-API article: the caller chooses a unique request id; the service records it atomically (all-or-nothing, in one step) with the change; a retry gets the first result; the same id with different parameters is an error.

**Example:** Stripe (API version 1): the client sends an `Idempotency-Key` header. Stripe saves the status code and body of the first request that began running and returns them to retries, even a 500 error (the server failed). Requests that fail validation or clash with a running one are not saved. A key can be up to 255 characters, and keys may be removed after at least 24 hours.

**Failure:** Making the key from the data: two real, identical payments would share a key and the second would never be charged. Use a fresh random id for each new action, and reuse it only for retries of that action.

## Topic: API gateway

**Definition:** An API gateway is one entry point in front of many services. Amazon API Gateway's documentation calls it a front door for backend services, covering traffic management, access control, monitoring and API version management. This note uses it as the example.

**Why:** Common checks happen once, at the edge. Throttling (slowing or refusing callers who send too much) is one: Amazon API Gateway uses a token bucket (explained below), and clients may receive 429.

**Example:** In the graph below the gateway checks the key and the limit, then forwards to the right service. AWS says limits can be set per account, stage (a version of the API), method, or customer (a usage plan), and are goals AWS tries to meet, not exact guarantees.

**Failure:** Putting business logic in the gateway, or making it a single point of failure (one part whose failure stops everything). See Computer Networks: System Design Concepts for load balancers.

## Topic: Rate limiting algorithms

**Definition:** Sources: Cloudflare's engineering blog for the window methods, Stripe's rate-limiter post and AWS's fairness article for token bucket, NGINX's blog for leaky bucket.
- Token bucket: a bucket holds up to B tokens and gets new ones at a steady rate. Each request takes one; with none left it is refused.
- Leaky bucket (NGINX): requests join a queue that empties at a fixed rate; overflow is discarded.
- Fixed window: a counter that resets at the start of each period (0 to 10 s, 10 to 20 s); refuse above the limit.
- Sliding window log: store every request's timestamp and count those in the last period.
- Sliding window counter: keep this window's count and the last one's. Estimate = (last count x share of it still overlapping) + this count. Cloudflare's example: 42 x ((60 - 15) / 60) + 18 = 49.5.

**Why:** They differ in bursts allowed, accuracy and memory.

**Example:** Limit 5 per 10 s; five requests at 9.0 to 9.8 s, five at 10.0 to 10.8 s. Y is allowed, n is refused.
- Fixed window: YYYYYYYYYY. At 10.0 the count restarts, so all 10 pass: 10 requests in 1.8 s.
- Sliding log: YYYYYnnnnn. At 10.0 the log still holds the first five.
- Sliding counter: YYYYYnYnnn. At 10.0 the estimate is 5 x 1.00 = 5, refused. At 10.2 it is 5 x 0.98 = 4.9, allowed. So it can overshoot slightly.
- Token bucket (starts full with 5 tokens, refills 1 token per 2 s, which is 5 per 10 s): YYYYYnnnnn.

With 20,000 random requests (about one a second), the fixed window allowed 49.4 percent, the sliding counter 47.6, the exact log 43.3.

Memory, 1,000,000 users, limit 100 a minute, 8 bytes a number: log = 1,000,000 x 100 x 8 B = 800 MB; counter or bucket = 1,000,000 x 2 x 8 B = 16 MB.

**Failure:** Calling the sliding counter exact; it is an estimate (Cloudflare assumes a steady rate in the last period). A very large bucket allows a huge burst, which AWS warns can defeat the limit.

## Topic: HTTP 429 and Retry-After

**Definition:** 429 Too Many Requests means the user sent too many requests in a given time (RFC 6585). The reply may carry a Retry-After header (a labelled line of extra information) saying how long to wait; the RFC's example is 3600 seconds. A cache (a stored copy) must not store it. The RFC does not require servers to use 429.

**Why:** A clear code lets clients back off. The AWS fairness article says rate-exceeded answers are generally 429. Some AWS services that predate 429 (the first was the queue service SQS in 2004) return 503 (server unavailable).

**Example:** In the sequence below (assumption: wait 3 s) the client retries only after the wait, plus jitter (a small random extra wait, so clients do not retry together).

**Failure:** Usually 429 means the caller sent too many and 503 means the server is unavailable; older services use 503 for both (own reasoning).

## Topic: Distributed counting, client throttling and priorities

**Definition:** With many gateway servers the count must be shared. The AWS fairness article describes three ways:
- Divide the quota by the number of servers; each counts locally. This works if traffic is spread evenly.
- Use consistent hashing on the throttle key (the key becomes a number, so one caller always meets the same tracker server). Some teams use Redis, a fast in-memory store. A very busy key can overload one tracker.
- Share observed rates between servers, later rather than at once.

**Why:** Local counting is cheap but wrong when traffic is uneven. A central counter is accurate but is an extra step.

**Example:** The SRE book (chapter 21) describes client-side adaptive throttling. Each client tracks, over the last two minutes, how many requests it tried and how many the backend accepted. Once attempts exceed twice the accepted ones (the book's default), the client rejects some new requests itself.

**Failure:** Treating every request alike. When the limiter store is down, decide beforehand whether to allow or refuse (own reasoning).

## Questions

### REST, gRPC or GraphQL?

REST suits public HTTP APIs; gRPC suits typed service-to-service calls with streaming; GraphQL suits varied clients who choose their fields. Say the reason.

### Why cursor pagination over offset?

A large offset still makes the database compute the skipped rows, and changing rows can cause repeats or skips. A cursor starts after a marker.

### How do you make a payment API safe to retry?

The client sends a unique idempotency key; the server stores the result with the key and returns it on a retry.

### Why can a fixed window allow twice the limit?

Requests just before and just after a boundary fall in different windows: 5 at 9.0-9.8 s and 5 at 10.0-10.8 s all pass, 10 in 1.8 s.

## Mistakes

- "The sliding window counter is exact." It estimates.
- "Retry on every failure." Wait as long as Retry-After says, and stop after a few tries.
- "Offset pages never change." New rows shift them.

## Quiz

### Limit 5 per 10 s, windows 0-10 s and 10-20 s. Five requests come at 9.0-9.8 s, five at 10.0-10.8 s. How many does a fixed window allow?

- [ ] 5
- [ ] 6
- [x] 10
- [ ] 0

Explanation: Each batch falls in its own window.

### Which HTTP status code means too many requests?

- [ ] 404, not found
- [x] 429
- [ ] 301, moved
- [ ] 201, created

Explanation: RFC 6585 defines 429 for this.

### What does Stripe's API return to a retry with the same idempotency key?

- [ ] A new charge
- [x] The saved result of the first request
- [ ] Always 200
- [ ] Nothing

Explanation: Stripe saves the status code and body of the first request and replays it.

### Why is the sliding window log costly?

- [ ] It uses no memory
- [x] It stores one timestamp per recent request
- [ ] It ignores time
- [ ] It needs a second server

Explanation: 800 MB against 16 MB.

### Which describes the token bucket?

- [ ] Count per clock window
- [x] Tokens refill steadily and each request takes one
- [ ] Store all timestamps
- [ ] Queue drained at a fixed rate

Explanation: A queue drained at a fixed rate is the leaky bucket.

## Diagram

```json
{ "kind": "graph", "caption": "Request path through a gateway: the client sends a request (1); the gateway checks the caller's count in the counter store (2) and, if allowed, forwards to the right service (3). Over the limit, it answers 429 instead.", "groups": [{ "id": "edge", "label": "Edge" }], "nodes": [{ "id": "c", "label": "Client", "x": 10, "y": 50, "shape": "client" }, { "id": "g", "label": "Gateway + limiter", "x": 40, "y": 50, "group": "edge" }, { "id": "r", "label": "Counter store", "x": 40, "y": 12, "shape": "cache", "group": "edge" }, { "id": "a", "label": "Orders service", "x": 82, "y": 28 }, { "id": "b", "label": "Users service", "x": 82, "y": 78 }], "edges": [{ "from": "c", "to": "g", "step": 1 }, { "from": "g", "to": "r", "step": 2 }, { "from": "g", "to": "a", "step": 3 }, { "from": "g", "to": "b", "step": 3 }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Fixed window, limit 5 per 10 s: five requests at 9.0 to 9.8 s are allowed (1), the counter resets at 10.0 (2), five more are allowed (3). Result: 10 requests in 1.8 s (4), twice the limit.", "groups": [{ "id": "f", "label": "Fixed window" }], "nodes": [{ "id": "f1", "label": "9.0-9.8 s: 5 allowed", "x": 20, "y": 22, "group": "f" }, { "id": "f2", "label": "10.0 s: count resets", "x": 72, "y": 22, "group": "f" }, { "id": "f3", "label": "10.0-10.8 s: 5 pass", "x": 72, "y": 78, "group": "f" }, { "id": "f4", "label": "10 in 1.8 s", "x": 20, "y": 78, "group": "f" }], "edges": [{ "from": "f1", "to": "f2", "step": 1 }, { "from": "f2", "to": "f3", "step": 2 }, { "from": "f3", "to": "f4", "step": 3 }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Sliding window log, limit 5 per 10 s: five requests at 9.0 to 9.8 s are allowed (1), at 10.0 the log still holds them (2), so the next five are refused (3). Result: 5 of 10 allowed (4).", "groups": [{ "id": "s", "label": "Sliding window log" }], "nodes": [{ "id": "s1", "label": "9.0-9.8 s: 5 allowed", "x": 20, "y": 22, "group": "s" }, { "id": "s2", "label": "10.0 s: 5 in log", "x": 72, "y": 22, "group": "s" }, { "id": "s3", "label": "10.0-10.8 s: refused", "x": 72, "y": 78, "group": "s" }, { "id": "s4", "label": "5 of 10 allowed", "x": 20, "y": 78, "group": "s" }], "edges": [{ "from": "s1", "to": "s2", "step": 1 }, { "from": "s2", "to": "s3", "step": 2 }, { "from": "s3", "to": "s4", "step": 3 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A 429 with Retry-After: the client's request is over its limit, so the gateway answers 429 with Retry-After 3 (1, 2). The client waits 3 seconds (an assumed value), asks again (3), and this time the request is forwarded and succeeds (4, 5, 6).", "actors": [{ "id": "c", "label": "Client" }, { "id": "g", "label": "Gateway" }, { "id": "s", "label": "Service" }], "messages": [{ "from": "c", "to": "g", "label": "GET /items" }, { "from": "g", "to": "c", "label": "429, Retry-After: 3", "dashed": true }, { "from": "c", "to": "g", "label": "GET /items, 3 s later" }, { "from": "g", "to": "s", "label": "Forward" }, { "from": "s", "to": "g", "label": "200 OK", "dashed": true }, { "from": "g", "to": "c", "label": "200 OK", "dashed": true }] }
```
