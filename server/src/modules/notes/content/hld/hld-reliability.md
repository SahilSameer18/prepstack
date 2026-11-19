---
id: hld-reliability
title: Reliability: Timeouts, Retries and Failure
lastChecked: 2026-11-13
next: hld-storage-indexes
roadmapSteps: devops-cloud:monitoring-reliability, backend:deployment-cloud, fullstack:security-performance
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

Servers crash, networks drop messages and some calls are just slow. A reliable design expects this and limits the damage. The tools are timeouts (a limit on waiting), careful retries, circuit breakers, bulkheads, load shedding (refusing some work on purpose) and clear targets for how often the service must answer correctly and fast. Interviewers ask because the usual wrong answer, "just retry", can turn a small fault into a full outage. After this section you can set a timeout, explain backoff and retry budgets, and describe how an overload spreads.

## Topic: Timeouts and deadlines

**Definition:** A timeout (a limit on how long a caller waits for an answer) is set on every call to another service, even one on the same machine. A connection timeout limits the wait to set up the link; a request timeout limits the wait for the answer. A deadline (the moment by which the whole user request must be finished) is passed from service to service, and each gives the next only the time that is left (AWS Builders' Library, "Timeouts, retries and backoff with jitter"; SRE book, chapter 22).

**Why:** A call that waits forever holds a thread (a unit of work in a program), and enough of them stop the caller too. A percentile says how many requests were that fast or faster: the 99.9th percentile (p99.9) is the time that 999 of 1,000 requests beat. AWS suggests choosing the share of calls you accept to time out falsely (its example is 0.1 percent) and using the matching percentile of the other service (p99.9 there).

**Example:** (idea from the SRE book, our numbers) The user request has a deadline of 20 s. Service A uses 5 s and tells B "you have 15 s". B uses 3 s and tells C "you have 12 s". If C needs more, it refuses at once instead of working on an answer nobody will wait for.

**Failure:** "What value do you pick?" Say how: from the measured percentile and the false-timeout rate you accept, not a guess. A timeout does not prove the work was not done.

## Topic: Safe retries: idempotency, backoff, jitter and a budget

**Definition:** A retry sends the same request again. It is only safe for an idempotent operation (doing it twice has the same effect as doing it once). Creating something is often not, unless the caller sends a unique request id and the server remembers it. Backoff means waiting longer after each failure (exponential backoff doubles the wait). Jitter means adding randomness to the wait so many clients do not retry at the same moment.

**Why:** AWS calls retries "selfish": the caller spends the server's spare capacity to help itself.

**Example:** (assumption: a made-up simulation) 1,000 clients all fail at time 0, then wait 100 ms, 200 ms, 400 ms and so on, capped at 10 s. Without jitter all 1,000 retry together in every round. With full jitter (each wait a random number between 0 and the normal wait, the definition used here), the busiest 50 ms slot holds 510 clients in round 1, then 268, 124, 73, 37, 27.
- Budget (SRE chapter 21): retries may be at most 10 percent of requests. 100 requests add at most 10 retries, so load is about 1.1 times in the general case, against just under 3 times without a budget. That chapter also limits a request to three attempts.
- Do not retry client errors (4xx, the request itself was wrong): they fail again (AWS). Server errors (5xx) may pass later.
- Layers multiply. With 3 retries (4 attempts, as in SRE chapter 22), layer A tries B 4 times, each makes B try C 4 times (16), each makes C try the database 4 times: 4 x 4 x 4 = 64. Retry in one layer only.

**Failure:** "Retry on every failure" is the classic wrong answer, and retrying a non-idempotent call can double-charge a customer. Store the request id with the change.

## Topic: Circuit breaker and bulkhead

**Definition:** A circuit breaker is a small proxy (a stand-in between caller and service) with three states (Microsoft Azure Architecture Center). Closed: calls pass and failures are counted. If failures pass a set number (the threshold) within a set time, it turns Open: calls fail at once and a timer starts. After the timer it turns Half-Open: trial calls pass. If enough succeed (a setting) it closes; if one fails it opens again. A bulkhead (named after a ship's sealed hull sections) gives each dependency its own pool, such as a thread pool, so one slow part cannot use up everything.

**Why:** Without a breaker, callers wait for a timeout on every call to a dead service. Without a bulkhead, one slow dependency eats the shared pool.

**Example:** A web server gives payments and recommendations 20 threads each (assumption). If recommendations hangs, only its 20 fill; payments keeps its own.

**Failure:** AWS's timeouts article warns that breakers add behaviour that is hard to test and can slow recovery, and says it limits retries locally with a token bucket (each success adds a token, each retry spends one) to reduce that risk.

## Topic: Load shedding, queue limits and fallback

**Definition:** Load shedding means rejecting some requests cheaply when over capacity, so the rest are served well. Return HTTP 503 (service unavailable). Goodput is the part of the work handled without errors (AWS). The SRE book suggests a queue of 50 percent of the thread pool or less, serving the newest first (LIFO, last in first out), because the oldest have probably timed out. Graceful degradation means a simpler answer (no recommendations) instead of an error.

**Why:** A long queue only adds waiting. A user who waited past their own timeout gets nothing, yet the server still does the work.

**Example:** (SRE book example) 10 threads, a queue of 100 waiting requests, 100 ms per request. Every 100 ms the threads finish 10, so a request at the back waits 100 / 10 x 100 ms = 1.0 s, then 0.1 s of work: 1.1 s.

**Failure:** AWS's fallback article advises avoiding fallback; if one is essential, use it often in production. Amazon described a retail case (around 2001) where servers fell back to one database after the caches failed.

## Topic: Cascading failure and bimodal latency

**Definition:** A cascading failure (one failure causing others) is a positive feedback loop (a change that makes itself bigger) in the SRE book's words: a few servers fail, the rest get more load and fail too. Bimodal latency means requests are either fast or very slow.

**Why:** Slow requests hold threads. Fewer free threads means less capacity, so more requests time out, and clients retry.

**Example:** (idea from the SRE book, our numbers) 400 threads, 400 requests a second. 95 percent take 0.1 s; 5 percent hang for 50 s. Average thread time: 0.95 x 0.1 + 0.05 x 50 = 2.595 s. So 400 threads finish 400 / 2.595 = 154 requests a second. That serves 154 / 400 = 38.5 percent; 61.5 percent fail, although only 5 percent were bad.

**Failure:** "Just add servers" is not enough: new servers meet the same retry storm (a wave of retries from many clients at once).

## Topic: Hedged requests and the tail

**Definition:** The tail is the slowest few percent of requests. A hedged request sends a second copy to another replica (a copy of the data) after a short wait, uses the first answer, and cancels the other ("The Tail at Scale", Dean and Barroso, 2013).

**Why:** A request that needs many servers is slow if any one is slow. If each of 100 servers is fast 99 percent of the time, the chance all are fast is 0.99 multiplied by itself 100 times, 0.37. So at least one is slow with chance 1 - 0.37 = 63 percent (assuming independence).

**Example:** The paper: wait until the request is older than the 95th-percentile time, then send the copy (about 5 percent more load). In its Bigtable test reading 1,000 keys over 100 servers, a hedge after 10 ms cut the 99.9th percentile from 1,800 ms to 74 ms for 2 percent more requests.

**Failure:** Hedging helps when slowness is random interference. By our reasoning it adds load when every replica is overloaded, and it should be used only for safe-to-repeat requests.

## Topic: SLIs, SLOs, error budgets and golden signals

**Definition:** An SLI (service level indicator) is a number you measure, such as the share of requests answered in under 300 ms. An SLO (service level objective) is the target for it. An SLA (service level agreement) is a promise to customers with a penalty if broken. The error budget is the failure the SLO allows. Use percentiles, not averages: an average of 100 ms can hide 1 request in 100 that takes 10 seconds. Golden signals to watch: latency, traffic, errors, saturation (how full the service is) (SRE book, chapters 4 and 6).

**Why:** Without an agreed target, nobody can decide between shipping a feature and fixing reliability.

**Example:** 30 days = 30 x 24 x 60 = 43,200 minutes. A 99.9 percent SLO allows 43,200 x 0.001 = 43.2 minutes of failure; 99.95 percent allows 21.6; 99.99 percent allows 4.3.

**Failure:** Picking 100 percent or a target from today's performance. The SRE book advises few, loose SLOs.

## Questions

### How do you decide a timeout and what is a deadline?

Pick it from the dependency's measured percentile and the false-timeout rate you accept. A deadline is when the whole user request must finish; each service passes the remaining time on.

### How do you retry safely?

Only retry idempotent calls or calls with a request id. Use exponential backoff plus jitter, at most three attempts, a 10 percent retry budget, and retry in one layer only.

### What does a circuit breaker do?

It counts recent failures. After a threshold it opens and fails calls at once. After a timer it lets trial calls through, and closes again if they succeed.

## Mistakes

- "Retry on every failure." Retries multiply across layers (4 x 4 x 4 = 64).
- "A longer queue makes the system safer." It adds waiting.
- "More servers fix a cascading failure." Retries and slow requests arrive at the new servers too.

## Quiz

### Three layers each make up to 4 attempts in total (the first try and 3 retries). How many attempts can reach the database for one user request?

- [ ] 12
- [x] 64
- [ ] 16
- [ ] 4

Explanation: Attempts multiply: 4 x 4 x 4 = 64.

### Why is jitter added to exponential backoff?

- [ ] To make each wait longer
- [x] To spread retries so clients do not retry together
- [ ] To make the request idempotent
- [ ] To avoid timeouts

Explanation: Clients that failed together would retry together.

### What does a circuit breaker do in the Half-Open state?

- [ ] Rejects every call
- [ ] Passes every call
- [x] Lets trial calls through
- [ ] Doubles the timeout

Explanation: Success closes it; a failure opens it again.

### A 99.9 percent SLO over 30 days allows how many minutes of failure?

- [ ] 4.3
- [ ] 21.6
- [x] 43.2
- [ ] 432

Explanation: 43,200 minutes x 0.001 = 43.2.

### Each of 100 servers is slow in 1 percent of requests, independently, and a request waits for all of them. What share of requests is slow?

- [ ] 1 percent
- [ ] 10 percent
- [x] 63 percent
- [ ] 99 percent

Explanation: 1 - 0.99^100 is about 63 percent.

## Diagram

```json
{ "kind": "sequence", "caption": "Retry with backoff, then a circuit breaker opening and closing. The client calls through a breaker (1 and 2) and gets an error (3 and 4). It retries after a random wait (5), and once enough failures pass the threshold the breaker is open and fails the call at once (6). After the open timer the client calls again (7), the breaker lets a trial call through (8), the service succeeds (9) and the breaker closes (10).", "actors": [{ "id": "c", "label": "Client" }, { "id": "b", "label": "Breaker" }, { "id": "s", "label": "Service" }], "messages": [{ "from": "c", "to": "b", "label": "Call, attempt 1" }, { "from": "b", "to": "s", "label": "Forward (closed)" }, { "from": "s", "to": "b", "label": "Error 503", "dashed": true }, { "from": "b", "to": "c", "label": "Error", "dashed": true }, { "from": "c", "to": "b", "label": "Retry after random wait" }, { "from": "b", "to": "c", "label": "Open: fail at once", "dashed": true }, { "from": "c", "to": "b", "label": "Call after open timer" }, { "from": "b", "to": "s", "label": "Half-open: trial call" }, { "from": "s", "to": "b", "label": "Success", "dashed": true }, { "from": "b", "to": "c", "label": "Closed: result", "dashed": true }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Retries multiply across three layers. One user request (1) reaches layer A. A tries layer B up to 4 times (2), B tries layer C up to 4 times for each of those, so C can see 16 calls (3), and C tries the database up to 4 times for each of those, so the database can see 4 x 4 x 4 = 64 attempts (4).", "nodes": [{ "id": "u", "label": "User", "x": 10, "y": 22, "shape": "client" }, { "id": "a", "label": "Layer A", "x": 42, "y": 22 }, { "id": "b", "label": "Layer B", "x": 74, "y": 22 }, { "id": "c", "label": "Layer C", "x": 74, "y": 78 }, { "id": "d", "label": "Database", "x": 42, "y": 78, "shape": "database" }], "edges": [{ "from": "u", "to": "a", "step": 1, "label": "1" }, { "from": "a", "to": "b", "step": 2, "label": "4" }, { "from": "b", "to": "c", "step": 3, "label": "16" }, { "from": "c", "to": "d", "step": 4, "label": "64" }] }
```

## Diagram

```json
{ "kind": "layers", "caption": "A ladder of protections, from the outside in: each layer catches what the layer above lets through.", "layers": [{ "label": "Deadline: stop work nobody waits for" }, { "label": "Timeout on every call" }, { "label": "Retry with backoff, jitter and a budget" }, { "label": "Circuit breaker and bulkhead" }, { "label": "Load shedding with 503" }, { "label": "Alerts on SLO and golden signals" }] }
```
