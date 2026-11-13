---
id: hld-api-rate-limiting
title: APIs, Gateways and Rate Limiting
next: hld-reliability
roadmapSteps: java-spring:spring-rest-api, fullstack:security-performance, backend:deployment-cloud
---
<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-phase1.md. Numbers from docs/content/checks/hld-check.py. -->

## Overview

An API (application programming interface, the set of requests a program may send to a service) is the front door of a system, and a rate limiter (a guard that caps how many requests a caller may send in a time) protects that door. Interviewers ask which style of API you choose, how pages of results work, how a client retries safely, and how a limiter counts. After this section you can compare REST, gRPC and GraphQL, explain cursor paging and idempotency keys, describe a gateway, compare five limiting algorithms with a trace, and explain a 429 response.

## Topic: Designing the API surface

**Definition:** REST (representational state transfer) is a style where things are resources named by addresses and you use standard HTTP methods on them. Amazon API Gateway's documentation describes RESTful APIs as HTTP-based, stateless (the server keeps no memory of the client between requests) and using GET, POST, PUT, PATCH and DELETE. Google's API design guide (AIP-121) describes resource-oriented design: a hierarchy of resources and collections, with standard methods Get, List, Create, Update and Delete. gRPC is a framework where you define a service and its methods in a .proto file (using Protocol Buffers, a compact data format, by default); the client holds a stub that calls the server like a local object. A gRPC method can be unary (one request, one response) or can stream in either or both directions, and a client can set a deadline. GraphQL has a schema (a typed description of the data), and the client query asks for exactly the fields it needs.

**Why:** The style decides who controls the shape of the answer and how easily clients differ. REST is plain HTTP and fits public APIs that browsers and many tools call. gRPC gives typed calls and streaming between services. GraphQL lets a client with its own needs pick fields without a new endpoint.

**Example:** A phone app needs a user name and the last three orders. With REST it may call two addresses. With GraphQL it sends one query naming those fields. With gRPC, a service calls another through a generated stub.

**Failure:** "GraphQL replaces REST" or "gRPC is always faster". Each choice trades something: the interviewer wants the reason tied to the clients and the data.

## Topic: Pagination

**Definition:** Pagination returns a long list in pages. Offset paging says "skip N rows, give me M". Cursor paging says "give me M rows after this marker", where the marker (cursor) is an id or an opaque token from the last page.

**Why:** PostgreSQL's documentation says the rows skipped by OFFSET still have to be computed, so a large offset can be slow, and a stable unique ORDER BY is needed or the subset is unpredictable. The cost of a cursor does not grow with how deep you are. Stripe's list API uses cursors: `starting_after` and `ending_before` take an object id, `limit` is 1 to 100 (default 10), and `has_more` tells whether there is more. Google's guide (AIP-158) uses `page_token` and `next_page_token`; the token is opaque, and an empty next token is the only signal of the end.

**Example:** My own arithmetic, assumption: newest first, 3 per page. Page 1 returns ids 10, 9, 8. Then row 11 is added. Offset paging with skip 3 now returns 8, 7, 6, so row 8 repeats. With `starting_after=8` the cursor returns 7, 6, 5. If a row is deleted from earlier pages, offset paging skips a row instead.

**Failure:** Neither guide I read describes what happens when rows change during paging; the repeat and skip above are my own example. Cursor paging also cannot jump to "page 50".

## Topic: Idempotency keys for safe retries

**Definition:** An idempotency key is a unique value the client sends with a request so the server can recognise a retry and not repeat the action.

**Why:** If the network fails after the server acted, the client cannot tell whether it worked. Retrying without a key could charge twice. AWS's idempotent-API article: the caller chooses a unique request id; the service records it atomically with the change; a retry gets the same result as the first success; the same id with different parameters is an error.

**Example:** Stripe (API version 1): send an `Idempotency-Key` header; Stripe saves the status code and body of the first request with that key and returns the saved result to retries, even a 500 error; a key can be up to 255 characters; keys may be removed after at least 24 hours; different parameters under the same key give an error; POST requests accept keys, while GET and DELETE do not need them.

**Failure:** Making the key from the data (a double-click would then be two different intended payments) or reusing one key for different actions. Also the check and the change must be one atomic step.

## Topic: API gateway

**Definition:** An API gateway is one entry point in front of many services. Amazon API Gateway's documentation calls it a front door for backend services and lists traffic management, authorization and access control, monitoring and API version management. Kong and others are other products; this section reads only AWS's.

**Why:** Common checks happen once, at the edge, instead of in every service. Throttling is one: Amazon API Gateway uses the token bucket algorithm, with a rate (tokens added per second) and a burst (bucket size), and clients may receive 429 Too Many Requests.

**Example:** Request path in the graph below: client, gateway (checks the key and the limit), then the right service. Throttling can be set per account, per stage or method, and per client with a usage plan, AWS says, and the limits are best effort targets.

**Failure:** Putting business logic in the gateway, or making it a single point of failure with no spare copies (see Computer Networks: System Design Concepts for load balancers).

## Topic: Rate limiting algorithms

**Definition:** Token bucket: a bucket holds up to B tokens and gets new ones at a steady rate; each request takes one, and with none left it is refused (AWS fairness article). Leaky bucket: requests join a queue that is emptied at a fixed rate; when it is full, new ones are dropped. Fixed window: count requests in each clock window (for example 0 to 10 s, 10 to 20 s) and refuse above the limit. Sliding window log: keep the time of every recent request and count those inside the last window. Sliding window counter: estimate the last window by weighting the previous window's count by how much of it still overlaps.

**Why:** They differ in bursts allowed, accuracy and memory.

**Example:** Script I1. Limit 5 requests per 10 seconds; five requests at 9.0 to 9.8 s, five at 10.0 to 10.8 s. Allowed: fixed window 10 of 10 (YYYYYYYYYY), sliding log 5 of 10 (YYYYYnnnnn), sliding counter 6 of 10 (YYYYYnYnnn), token bucket with 5 tokens refilled at 0.5 a second, 5 of 10. The fixed window let through 10 requests in 1.8 seconds, twice the limit. Script I2, random arrivals (assumption): the fixed window allowed 49.4 percent, the sliding counter 47.6 percent, the exact log 43.3 percent. Script I3, 1,000,000 users, limit 100 a minute, 8 bytes a number: the log needs 800 MB, the counter 16 MB, the token bucket 16 MB.

**Failure:** Calling the sliding counter exact; it is an estimate. A large bucket allows a large burst, and the AWS article warns it can defeat the point.

## Topic: HTTP 429 and Retry-After

**Definition:** 429 Too Many Requests means the user sent too many requests in a given time (RFC 6585, section 4). The response may include a Retry-After header telling how long to wait; the RFC's example is 3600 (seconds). The response should say what is wrong, and it must not be stored by a cache. The RFC does not require servers to use 429.

**Why:** A clear code lets clients back off. The AWS fairness article says rate-exceeded answers are generally 429 because the client broke its quota; some older AWS services, such as SQS (2004), return 503 for compatibility, since 429 only appeared in 2012.

**Example:** Sequence below (assumption: wait 3 s). Retry only after the wait. Add random jitter (see Reliability).

**Failure:** A 429 versus a 503: 429 blames the caller's rate, 503 means the server cannot cope.

## Topic: Distributed counting, client throttling and priorities

**Definition:** With many gateway servers, the count must be shared. The AWS fairness article describes: divide the quota by the number of servers and let each count locally (works if traffic is spread evenly); hash each key to a rate-tracker server in a separate fleet, often Redis; or share observed rates between servers asynchronously (scalability, accuracy and simplicity trade off). The hashed tracker can have a hot spot for one very busy key.

**Why:** Local counting is cheap but wrong when traffic is uneven; a central counter is accurate but is an extra step and a dependency.

**Example:** The SRE book (chapter 21) describes client-side adaptive throttling: each client tracks, over the last two minutes, how many requests it tried and how many the backend accepted; with the default K = 2, once attempts exceed about twice the accepted ones the client rejects some new requests itself, so they never reach the network. Its example gives each customer a cap in CPU-seconds per second whose sum exceeds the real capacity on purpose. It also defines criticality levels: CRITICAL_PLUS, CRITICAL (default for production), SHEDDABLE_PLUS (default for batch) and SHEDDABLE. AWS says owners set quotas per client and may give expensive APIs lower ones.

**Failure:** Treating every request alike. When the limiter store is down, decide beforehand whether to allow or refuse.

## Questions

### REST, gRPC or GraphQL?

REST suits public HTTP APIs; gRPC suits typed service-to-service calls with streaming; GraphQL suits varied clients who choose their fields. Say the reason.

### Why cursor pagination over offset?

A large offset still makes the database compute the skipped rows, and changing rows can cause repeats or skips. A cursor starts after a marker.

### How do you make a payment API safe to retry?

The client sends a unique idempotency key; the server stores the result with the key and returns it on a retry.

### Why can a fixed window allow twice the limit?

Requests just before and just after a boundary fall in different windows (I1: 10 in 1.8 s).

## Mistakes

- "The sliding window counter is exact." It estimates.
- "Retry on every failure." Honour Retry-After and limit retries.
- "Offset pages never change." New rows shift them.

## Quiz

### Limit 5 per 10 s; five requests at 9.0 to 9.8 s, five at 10.0 to 10.8 s. How many does a fixed window allow?

- [ ] 5
- [ ] 6
- [x] 10
- [ ] 0

Explanation: Each batch falls in its own window (I1).

### Which HTTP status code means too many requests?

- [ ] 404
- [x] 429
- [ ] 301
- [ ] 201

Explanation: RFC 6585 defines 429 for this.

### What does the Stripe v1 API return to a retry with the same idempotency key?

- [ ] A new charge
- [x] The saved result of the first request
- [ ] Always 200
- [ ] Nothing

Explanation: Stripe saves the status code and body of the first request and replays it.

### Why is the sliding window log costly?

- [ ] It uses no memory
- [x] It stores one timestamp per recent request
- [ ] It ignores time
- [ ] It needs 429

Explanation: I3: 800 MB against 16 MB for 1,000,000 users.

### Which describes the token bucket?

- [ ] Count per clock window
- [x] Tokens refill steadily and each request takes one
- [ ] Store all timestamps
- [ ] Queue drained at a fixed rate

Explanation: The bucket size allows a burst; the refill rate sets the long-run rate.

## Diagram

```json
{ "kind": "graph", "caption": "Request path through a gateway: the client sends a request (1); the gateway checks the caller's count in the counter store (2) and, if allowed, forwards to the right service (3). Over the limit, it answers 429 instead.", "groups": [{ "id": "edge", "label": "Edge" }], "nodes": [{ "id": "c", "label": "Client", "x": 8, "y": 50, "shape": "client" }, { "id": "g", "label": "Gateway + limiter", "x": 38, "y": 50, "group": "edge" }, { "id": "r", "label": "Counter store", "x": 38, "y": 12, "shape": "cache", "group": "edge" }, { "id": "a", "label": "Orders service", "x": 80, "y": 28 }, { "id": "b", "label": "Users service", "x": 80, "y": 78 }], "edges": [{ "from": "c", "to": "g", "step": 1 }, { "from": "g", "to": "r", "step": 2 }, { "from": "g", "to": "a", "step": 3 }, { "from": "g", "to": "b", "step": 3 }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Trace I1, limit 5 per 10 s. Top row, fixed window: five requests at 9.0 to 9.8 s (1), the counter resets at 10.0 (2), five more are allowed (3): 10 in 1.8 s. Bottom row, sliding log: five allowed (1), at 10.0 it still counts them (2), the next five are refused (3): 5 of 10.", "groups": [{ "id": "f", "label": "Fixed window" }, { "id": "s", "label": "Sliding window log" }], "nodes": [{ "id": "f1", "label": "9.0-9.8 s: 5 allowed", "x": 12, "y": 18, "group": "f" }, { "id": "f2", "label": "10.0 s: count resets", "x": 40, "y": 18, "group": "f" }, { "id": "f3", "label": "10.0-10.8 s: 5 allowed", "x": 68, "y": 18, "group": "f" }, { "id": "f4", "label": "10 in 1.8 s", "x": 92, "y": 18, "group": "f" }, { "id": "s1", "label": "9.0-9.8 s: 5 allowed", "x": 12, "y": 80, "group": "s" }, { "id": "s2", "label": "10.0 s: last 10 s has 5", "x": 40, "y": 80, "group": "s" }, { "id": "s3", "label": "10.0-10.8 s: 5 refused", "x": 68, "y": 80, "group": "s" }, { "id": "s4", "label": "5 of 10", "x": 92, "y": 80, "group": "s" }], "edges": [{ "from": "f1", "to": "f2", "step": 1 }, { "from": "f2", "to": "f3", "step": 2 }, { "from": "f3", "to": "f4", "step": 3 }, { "from": "s1", "to": "s2", "step": 1 }, { "from": "s2", "to": "s3", "step": 2 }, { "from": "s3", "to": "s4", "step": 3 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A 429 with Retry-After: the client's request is over its limit, so the gateway answers 429 with Retry-After 3 (1, 2). The client waits 3 seconds (an assumed value), asks again (3), and this time the request is forwarded and succeeds (4, 5, 6).", "actors": [{ "id": "c", "label": "Client" }, { "id": "g", "label": "Gateway" }, { "id": "s", "label": "Service" }], "messages": [{ "from": "c", "to": "g", "label": "GET /items" }, { "from": "g", "to": "c", "label": "429, Retry-After: 3", "dashed": true }, { "from": "c", "to": "g", "label": "GET /items (3 s later)" }, { "from": "g", "to": "s", "label": "Forward" }, { "from": "s", "to": "g", "label": "200 OK", "dashed": true }, { "from": "g", "to": "c", "label": "200 OK", "dashed": true }] }
```
