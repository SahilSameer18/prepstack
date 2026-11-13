---
id: hld-reliability
title: Reliability: Timeouts, Retries and Failure
next: hld-storage-indexes
roadmapSteps: devops-cloud:monitoring-reliability, backend:deployment-cloud, fullstack:security-performance
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-phase1.md. Numbers from docs/content/checks/hld-check.py. -->

## Overview

Servers crash, networks drop messages and some calls are just slow. A reliable design expects this and limits the damage. The tools are timeouts (a limit on waiting), careful retries, circuit breakers, bulkheads, load shedding (refusing some work on purpose) and clear targets for how good the service must be.

Interviewers ask this because the usual wrong answer, "just retry", can turn a small fault into a full outage. After this section you can set a timeout, explain why retries need backoff and a budget, and describe how an overload spreads and how to stop it.

## Topic: Timeouts and deadlines

**Definition:** A timeout (a limit on how long a caller waits for an answer) is set on every call to another service, including calls to a program on the same machine. Set a connection timeout and a request timeout. A deadline (the moment by which the whole user request must be finished) is passed down from service to service, and each service gives the next one only the time that is left. Source: AWS Builders' Library, "Timeouts, retries and backoff with jitter"; Google SRE book, chapter 22.

**Why:** A call that waits forever holds a thread (a unit of work in a program), memory and a connection. Enough of them and the caller is also dead. Too short a timeout is also harmful: callers give up on calls that would have worked, retry them, and add load. AWS suggests picking the share of calls you accept to time out falsely (its example is 0.1 percent), then using the matching latency percentile of the other service (p99.9 in the example). Add extra room if the call crosses the internet, or if the 99.9th percentile is very close to the median.

**Example:** The user request has a deadline of 30 s. Service A uses 7 s, so it tells B "you have 23 s". B uses 4 s and tells C "you have 19 s". If C sees 19 s left but needs more, it can refuse at once instead of working on an answer nobody will wait for.

**Failure:** Interviewers ask "what value do you pick?". Say how you pick it: from the measured percentile of the dependency and the false-timeout rate you accept, never from a guess. A timeout does not prove the work was not done: the other side may have finished it after you gave up. That is why retries need the next topic.

## Topic: Safe retries: idempotency, backoff, jitter and a budget

**Definition:** A retry sends the same request again. It is only safe for an idempotent operation (doing it twice has the same effect as doing it once). Reading is usually idempotent. Creating something is often not, unless the caller sends a unique request id and the server remembers it (AWS's EC2 RunInstances uses such a token). Backoff means waiting longer after each failure (exponential backoff doubles the wait). Jitter means adding randomness to the wait so many clients do not retry at the same moment. Source: AWS timeouts article; SRE book chapters 21 and 22.

**Why:** Retries help when a failure is brief or partial, but they take more of the server's capacity. When the server is near overload, retries make it worse. AWS calls retries "selfish" for this reason. Failed clients that wait the same time come back together and collide again.

**Example:** (assumption: a made-up simulation) 1,000 clients all fail at time 0. Each waits 100 ms, then 200 ms, then 400 ms and so on, capped at 10 s. Without jitter all 1,000 retry together every round: the busiest 50 ms slot has [1000, 1000, 1000, 1000, 1000, 1000] clients for retries 1 to 6. With full jitter (each wait is a random number between 0 and the normal wait) the busiest slot has [510, 268, 124, 73, 37, 27]. Rules from the SRE book: limit a request to about three attempts, and give each client a retry budget of 10 percent, meaning retries may be at most 10 percent of its requests, so the worst case is about 1.1 times the normal load instead of about 3 times. Also retry client errors such as HTTP 4xx rarely: the same request will usually fail again, while 5xx errors may pass later (AWS).

**Failure:** "Retry on every failure" is the classic wrong answer. Also: retrying a non-idempotent call double-charges a customer. The fix is a request id the server stores together with the change, so the second try returns the first result.

## Topic: Retries multiply across layers

**Definition:** If each layer in a chain of services retries, the attempts multiply. With 3 retries a layer makes up to 4 attempts. Rule from the SRE book: retry at one layer, usually the one just above the failing part, and let the other layers pass the error up.

**Why:** The bottom service sees the product of all layers, not the sum, and it is the one already failing.

**Example:** A user request goes through 3 layers, each trying up to 4 times: 4 x 4 x 4 = 64 attempts hit the database for one user request. For a made-up chain of 5 layers: 4^5 = 1,024 attempts at the bottom.

**Failure:** The interviewer asks "your services call each other three deep, where do you retry?". Answer: in one place, with a budget, and with a short deadline so the user is not kept waiting while the layers below keep trying.

## Topic: Circuit breaker and bulkhead

**Definition:** These are Microsoft Azure Architecture Center descriptions. A circuit breaker is a small proxy (a stand-in that sits between caller and service) with three states. Closed: calls pass and recent failures are counted. If failures pass a threshold in a time window, it turns Open: calls fail at once, without touching the service, and a timer starts. When the timer ends it turns Half-Open: a few trial calls are let through. If they succeed it closes; if one fails it opens again. A bulkhead (named after the sealed sections of a ship's hull) gives each dependency or each customer group its own pool, for example a separate connection pool or thread pool, so one slow part cannot use up everything.

**Why:** Without a breaker, callers wait for a timeout on every call to a service that is dead, holding threads. Without a bulkhead, one slow dependency eats the shared pool and then calls to healthy dependencies fail too. Half-Open exists so a recovering service is not flooded.

**Example:** A web server calls payments and recommendations. Each gets its own pool of 20 threads (assumption). If recommendations hangs, its 20 threads fill and recommendation calls fail fast, but payments still has its own 20.

**Failure:** AWS's timeouts article warns that breakers add behaviour that is hard to test and can slow recovery, and says Amazon prefers a local token bucket for retries (retry while tokens last, then at a slow fixed rate). Azure also notes the breaker does not help if the timeouts are very long, and that one breaker over many shards can block healthy shards.

## Topic: Load shedding, queue limits, graceful degradation and fallback

**Definition:** Load shedding means rejecting some requests cheaply when the server is over capacity, so the rest are served well. Return HTTP 503 (service unavailable). Goodput (useful work finished in time) matters, not throughput (all work started). A queue should be short: the SRE book suggests a queue around 50 percent of the thread pool or less, and serving the newest requests first (LIFO, last in first out) or using CoDel (an algorithm that drops requests that waited too long). Graceful degradation means giving a simpler answer (for example, no recommendations) instead of an error. Source: AWS load-shedding article; SRE chapter 22.

**Why:** A long queue only adds waiting. A user whose request has waited past their own timeout gets nothing, yet the server still does the work.

**Example:** (SRE book example) A queue ten times the thread count, with 100 ms per request: a full queue means 10 x 100 ms = 1.0 s of waiting plus 100 ms of work, 1.1 s in all. A shorter queue turns that into a fast "no".

**Failure:** AWS's fallback article says a fallback path is rarely exercised, hard to test, and often makes an outage worse; in its historical account a fallback after a cache failure overloaded the database. Use a fallback only if you run it all the time. Also keep health checks the highest priority when shedding, and test the system beyond its breaking point.

## Topic: Cascading failure and bimodal latency

**Definition:** A cascading failure (one failure causing others) is a positive feedback loop (a change that makes itself bigger) in the words of the SRE book: a few servers fail, the rest get more load and fail too. Bimodal latency means requests are either fast or very slow, with little in between.

**Why:** Slow requests hold threads. Fewer free threads means less capacity, so more requests wait or time out, and clients retry.

**Example:** (assumption, SRE example shape) 1,000 threads, 1,000 requests a second. 95 percent take 0.1 s, 5 percent hang for 100 s until timeout. Average thread time per request: 0.95 x 0.1 + 0.05 x 100 = 5.095 s. The threads finish only 1,000 / 5.095 = 196 requests a second. So 19.6 percent are served and 80.4 percent fail, although only 5 percent were bad.

**Failure:** "Just add servers" is not enough: new servers meet the same retry storm. Shed load, cut retries, and shorten the timeout so slow requests free their threads.

## Topic: Hedged requests and the tail

**Definition:** The tail is the slowest few percent of requests. A hedged request sends a second copy of the request to another replica (a copy of the data) after a short wait, and uses whichever answer comes first, then cancels the other. Source: "The Tail at Scale", Dean and Barroso, 2013.

**Why:** A request that needs many servers is slow if any one is slow. If each of 100 servers is slow 1 percent of the time, the chance that at least one is slow is 1 - 0.99^100 = 63 percent. The paper's measured service: one leaf server finishes 99 percent of requests in 10 ms, but waiting for all leaves takes 140 ms at the 99th percentile.

**Example:** The paper says: wait until the request is older than the 95th-percentile time, then send the copy. This adds about 5 percent load. In its Bigtable test reading 1,000 keys over 100 servers, a hedge after 10 ms cut the 99.9th percentile from 1,800 ms to 74 ms for 2 percent more requests. Tied requests (copies sent at once that tell each other to cancel) cut duplicate work further.

**Failure:** Hedging only helps when slowness is random interference, not when every replica is overloaded: then it adds load. Only hedge safe-to-repeat requests.

## Topic: SLIs, SLOs, error budgets and golden signals

**Definition:** An SLI (service level indicator) is a number you measure, such as the share of requests answered in under 300 ms. An SLO (service level objective) is the target for it. An SLA (service level agreement) is a promise to customers with a penalty if broken. The error budget is the failure the SLO allows. Use percentiles, not averages, because averages hide the slow tail. The four golden signals to watch: latency, traffic, errors and saturation (how full the service is). Alert on symptoms users feel (high errors) more than on causes (one busy disk). Source: SRE book chapters 4 and 6.

**Why:** Without an agreed target, nobody can decide between shipping a feature and fixing reliability. A slow error is worse than a fast one, and latency rises before a service is full, so watch the 99th percentile over a short window.

**Example:** A 99.9 percent SLO over 30 days allows 30 x 24 x 60 x 0.001 = 43.2 minutes of failure. 99.95 percent allows 21.6 minutes and 99.99 percent allows 4.3 minutes. When the budget is gone, stop risky releases.

**Failure:** Picking 100 percent or a target from today's performance. The SRE book advises few SLOs, loose to start, not copied from current numbers.

## Questions

### How do you decide a timeout and what is a deadline?

Pick the timeout from the measured latency percentile of the dependency and the false-timeout rate you accept. A deadline is the time by which the whole user request must finish; each service passes the remaining time on, for example 30 s, then 23 s, then 19 s.

### How do you retry safely?

Only retry idempotent calls or calls with a request id. Wait with exponential backoff plus jitter, limit to about three attempts, keep a retry budget of 10 percent, and retry in one layer only.

### What does a circuit breaker do?

It counts recent failures. After a threshold it opens and fails calls at once. After a timer it lets a few trial calls through, and closes again if they succeed.

### What is load shedding?

Rejecting some requests cheaply with 503 when over capacity, so the accepted ones finish in time. It protects goodput.

### Why do hedged requests help?

When a request waits on many servers, the slowest one sets the time. Sending a copy to another replica after a short wait avoids a slow one at a small extra load.

## Mistakes

- "Retry on every failure." Retries multiply across layers (4 x 4 x 4 = 64) and push an overloaded service over.
- "A longer queue makes the system safer." It adds waiting, and users have already given up.
- "More servers fix a cascading failure." Retries and slow requests arrive at the new servers too.

## Quiz

### Three layers each make up to 4 attempts. How many attempts can reach the database for one user request?

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

Explanation: Without jitter, clients that failed together retry together; in the example 1,000 clients all hit one 50 ms slot every round.

### What does a circuit breaker do in the Half-Open state?

- [ ] Rejects every call
- [ ] Passes every call
- [x] Lets a few trial calls through
- [ ] Doubles the timeout

Explanation: If the trial calls succeed it closes; if one fails it opens again.

### A 99.9 percent SLO over 30 days allows how many minutes of failure?

- [ ] 4.3
- [ ] 21.6
- [x] 43.2
- [ ] 432

Explanation: 43,200 minutes in 30 days x 0.001 = 43.2.

### 100 servers are each slow 1 percent of the time, and a request needs all of them. About how many requests are slow?

- [ ] 1 percent
- [ ] 10 percent
- [x] 63 percent
- [ ] 99 percent

Explanation: 1 - 0.99^100 is about 63 percent.

## Diagram

```json
{ "kind": "sequence", "caption": "Retry with backoff, then a circuit breaker opening and closing. The client calls through a breaker (1 and 2) and gets an error (3 and 4). It retries after a random wait (5) and the breaker, now open, fails the call at once (6). After the open timer the client calls again (7), the breaker lets one trial through (8), the service succeeds (9) and the breaker closes (10).", "actors": [{ "id": "c", "label": "Client" }, { "id": "b", "label": "Breaker" }, { "id": "s", "label": "Service" }], "messages": [{ "from": "c", "to": "b", "label": "Call, attempt 1" }, { "from": "b", "to": "s", "label": "Forward (closed)" }, { "from": "s", "to": "b", "label": "Error 503", "dashed": true }, { "from": "b", "to": "c", "label": "Error", "dashed": true }, { "from": "c", "to": "b", "label": "Retry after random wait" }, { "from": "b", "to": "c", "label": "Open: fail at once", "dashed": true }, { "from": "c", "to": "b", "label": "Call after open timer" }, { "from": "b", "to": "s", "label": "Half-open: one trial" }, { "from": "s", "to": "b", "label": "Success", "dashed": true }, { "from": "b", "to": "c", "label": "Closed: result", "dashed": true }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Retries multiply across three layers. One user request (1) reaches layer A. A tries layer B up to 4 times (2), B tries layer C up to 4 times for each of those, so C can see 16 calls (3), and C tries the database up to 4 times for each of those, so the database can see 4 x 4 x 4 = 64 attempts (4).", "nodes": [{ "id": "u", "label": "User", "x": 7, "y": 50, "shape": "client" }, { "id": "a", "label": "Layer A", "x": 28, "y": 50 }, { "id": "b", "label": "Layer B", "x": 50, "y": 50 }, { "id": "c", "label": "Layer C", "x": 72, "y": 50 }, { "id": "d", "label": "Database", "x": 93, "y": 50, "shape": "database" }], "edges": [{ "from": "u", "to": "a", "step": 1, "label": "1" }, { "from": "a", "to": "b", "step": 2, "label": "4" }, { "from": "b", "to": "c", "step": 3, "label": "16" }, { "from": "c", "to": "d", "step": 4, "label": "64" }] }
```

## Diagram

```json
{ "kind": "layers", "caption": "A ladder of protections, from the outside in: each layer limits the damage the layer below it cannot.", "layers": [{ "label": "Deadline: stop work nobody waits for" }, { "label": "Timeout on every call" }, { "label": "Retry with backoff, jitter and a budget" }, { "label": "Circuit breaker and bulkhead" }, { "label": "Load shedding with 503" }, { "label": "Alerts on SLO and golden signals" }] }
```
