---
id: hld-case-notifications
title: "Case Study: Notification Service"
next: hld-case-news-feed
roadmapSteps: backend:deployment-cloud, java-spring:spring-rest-api
---
<!-- Draft 13 Nov 2026, not published. Numbers from docs/content/checks/hld-case-check.py (sections 5A to 5E). Provider facts from Apple's pages "Sending notification requests to APNs" and "Handling notification responses from APNs" (read in full, accessed 13 Nov 2026) and Firebase's pages "Set the lifespan of a message", "Manage registration tokens" and "Understand message delivery" (accessed 13 Nov 2026). -->

## Overview

A notification service (a system that other services call to tell a user something by phone push, email or text message) must handle sudden bursts, mixed urgency, and providers (outside companies that do the final delivery) that fail. This note builds one design from stated assumptions, not "the" answer. The central trade-off: retry enough to never lose a message, but not so much that users get repeats or a provider is flooded. After this note you can keep login codes fast during a campaign and explain retries, send ids and dead-letter queues.

## Topic: Requirements and scope

**Definition:** We build: other services call us with "tell user U about X"; we pick a channel, check the user's preferences, send through a provider, retry failures and record the result. Non-functional: login codes arrive in seconds, nothing is lost, repeats are rare, marketing may wait. Out of scope: writing the message text, running the providers, an in-app inbox.

**Why:** An interviewer wants you to ask which messages are urgent, which channels exist and whether users can opt out. Urgency decides the queues.

**Example:** (1) A request carries user, type (login code or marketing), content, optional send time. (2) Choose the channel. (3) Respect opt-out and quiet hours (hours the user asked not to be disturbed). (4) Retry failures. (5) Keep a status per notification. Out of scope: message design.

**Failure:** Skipping "are all messages equally urgent?" leads to one queue, where a login code waits behind a campaign (Topic 5).

## Topic: Numbers

**Definition:** An estimate. Every input is an assumption: a burst of 5 million marketing pushes sent at once, one worker sends 1,000 a second (5A); 10,000 sends a second in total (5B); retries start at 1 s and double, 5 retries (5C); 1,000,000 sends, of which 0.1 percent are repeated by a retry after a lost acknowledgement (5D); one event notifies 2,000 followers on 3 channels (5E).

**Why:** The numbers decide how many workers we need and whether urgent messages need their own path.

**Example:** One worker needs 5,000 s (83.3 min) for the burst, 50 workers 100 s, 500 workers 10 s (5A). One event gives 2,000 x 3 = 6,000 deliveries (5E).

**Failure:** A burst 10x bigger (50 million) needs 500 workers 100 s (50,000,000 / 500,000). Then the limit is no longer our workers but how fast the providers accept (Topic 5).

## Topic: API and data

**Definition:** `POST /notifications {send_id, user_id, type, payload, send_at?, expires_at}` answers 202 (accepted, work comes later). `GET /notifications/{send_id}` gives the status. `PUT /users/{id}/preferences {channels, quiet_hours, marketing_opt_in}`. Records: notification (send_id, user, type, status, tries, expires), device (user, platform, token, last seen), preferences.

**Why:** The caller chooses `send_id` (for example "order-81-shipped"), so a repeated request is recognised (see System Design: APIs, Gateways and Rate Limiting). A table keyed by send id fits.

**Example:** `POST` with send_id `order-81-shipped` returns 202. The same call again returns the same record, not a second send.

**Failure:** The model cannot answer "did the user read it?". The providers' reports are limited (Topic 6).

## Topic: The first design

**Definition:** The API saves the record and puts the request on a queue chosen by type: one for login codes, one for marketing. Workers take from a queue, check preferences, wait for permission from a rate limiter for the target provider, and call it. A scheduler holds requests with a future send time. Failures go back for retry, or to a dead-letter queue (a side queue for messages that keep failing). See diagram 1.

**Why:** Queues absorb bursts and let the API answer fast (see System Design: Queues, Logs and Streaming). Separate queues keep urgent work apart.

**Example:** Write path (diagram 2): (1) a service calls the API; (2) the API inserts the record if the send id is new and queues it; (3) a worker takes it; (4) checks preferences and quiet hours; (5) asks the limiter for a slot; (6) calls the provider; (7) records the result. Read path (diagram 3): a status lookup reads the record.

**Failure:** First bottleneck: the providers' acceptance rate, then the one queue per type.

## Topic: Bursts and priorities

**Definition:** Four decisions. Separate queues and workers for login codes and marketing. A rate limit towards each provider. Preferences and quiet hours checked at send time. Scheduling for future send times.

**Why:** In 5B (assumption: 10,000 sends a second), a code arriving just after 5,000,000 marketing messages in one shared queue waits 500 s (8.3 min). With its own queue it does not wait behind them. Rejected: only adding workers; it works (10 s with 500 workers) but costs most of the time unused, and providers cap the speed anyway. Apple's page says push traffic should be spread over many connections, that notifications may be throttled, and that a 429 means too many requests for one device token. Firebase's page says a sender over a per-device limit is reported as throttled, and a device holds at most 100 pending non-collapsible messages. Neither page I read gives a requests-per-second number, so we set our limit below the provider's agreed one (a token bucket, see the APIs note). Quiet hours are checked at send time, in the user's time zone, because preferences change while a message waits. Marketing inside quiet hours is put back with a send time at the end of them. Login codes ignore quiet hours (my choice).

**Example:** Assumption: the limiter lets marketing through at 2,000 a second. 5,000,000 take 2,500 s (41.7 min), while codes use their own allowance.

**Failure:** One shared limiter lets marketing use every slot and starve codes: reserve a share for codes. A preference checked only when queued is stale by the time of sending.

## Topic: Not losing and not repeating

**Definition:** The queue entry is removed only after the provider accepted it or we decide to stop. A crash can therefore cause a second send: at-least-once. The send id and a stored status cut repeats. Retries use backoff (growing waits): 1, 2, 4, 8, 16 s, which is 31 s after the first failure (5C), with jitter (see System Design: Reliability).

**Why:** In 5D, 1,000 of 1,000,000 sends are repeated. With the send id stored and checked, 0 duplicate pushes reach users in that model. My reasoning: a crash after the provider accepted but before we saved can still repeat one, so we call it rare, not impossible. Collapsing hides a repeat: Apple's `apns-collapse-id` merges notifications, and Firebase's collapse key replaces an older waiting one. Never use it for codes.

**Example:** What to do on errors. Apple's page: retry 5xx after 15 minutes (backoff allowed); do not retry BadDeviceToken, DeviceTokenNotForTopic, Forbidden, ExpiredToken, Unregistered or PayloadTooLarge; retry TooManyRequests after a delay. Status 410 Unregistered means send no more to that token, so remove it. Firebase: UNREGISTERED (404) and INVALID_ARGUMENT (400, if the payload is valid) mean delete the token; it treats a registration as stale after about a month without contact. Stop also at `expires_at`: a login code is useless later, so we set Apple's expiration to 0 (one attempt, not stored) or Firebase's lifetime to 0 (discarded if it cannot be delivered at once). Otherwise Firebase keeps a message up to 28 days, 4 weeks by default, and Apple stores one notification per app, up to 30 days. After the last try, the message goes to the dead-letter queue and an alarm.

**Failure:** "Delivered" is not what a 200 means. Apple describes a best-effort service. Firebase says a message id means accepted, not delivered; a delivered event exists only if exported, and it means the app's SDK on the device got it. Our status says "accepted by provider". Also retrying a dead provider without limit floods it: use a circuit breaker (Reliability).

## Topic: Failures and scaling

**Definition:** What fails: a worker, a provider, the queue. The provider outage matters most for login codes.

**Why:** Queued work survives a crash: a worker that dies does not remove its message, which returns and is sent again after the send-id check.

**Example:** A push provider is down. Retries fail, the breaker opens, the queue grows. After a few failed tries, a code switches to SMS (my choice; costs money, needs a number). The user waits seconds longer; marketing waits until the provider returns.

**Failure:** At 10x traffic: more workers help up to the providers' limits, token clean-up needs a daily job (Firebase's page suggests a stored timestamp), and the preference lookup becomes hot: cache it (see System Design: Caching).

## Questions

### How do you stop a campaign from delaying login codes?

Give codes their own queue, workers and a reserved share of the provider limit. In 5B the shared queue made a code wait 500 s.

### How do you avoid sending twice?

The caller sends a send id. We store its status and skip a known id. Crashes can still repeat one, so the design is at-least-once.

### What do you do when APNs answers Unregistered?

Stop sending to that token and remove it from the device list. Apple's page says no further pushes are needed for it.

### What does "delivered" mean?

A provider's success reply means accepted. Delivery to the device is separate, and may be unreported.

## Mistakes

- "Retry every failure." Apple's page lists errors that should not be retried, such as BadDeviceToken.
- "A send id gives exactly-once." A crash between provider and record can still repeat.
- "A 200 means the user saw it." It means the provider accepted the request.

## Quiz

### Why did the code wait 500 s in 5B?

- [ ] The provider was down
- [x] 5,000,000 messages at 10,000 a second were ahead of it in one queue
- [ ] It was retried five times
- [ ] Quiet hours applied

Explanation: 5,000,000 / 10,000 = 500 s.

### The waits in 5C are 1, 2, 4, 8, 16 s. How long after the first failure is the fifth retry?

- [ ] 16 s
- [ ] 24 s
- [x] 31 s
- [ ] 62 s

Explanation: 1 + 2 + 4 + 8 + 16 = 31.

### Which is a correct response to APNs 410 Unregistered?

- [ ] Retry in 1 s
- [x] Remove the token
- [ ] Send twice
- [ ] Ignore it

Explanation: Apple's page says not to retry Unregistered.

### Why set expiration 0 for a login code?

- [ ] To make it faster to write
- [ ] To collapse it
- [x] So an undelivered code is not stored and delivered late
- [ ] To skip the provider

Explanation: Apple: 0 means one attempt, not stored.

### With 500 workers, how long does a 50 million burst take?

- [ ] 10 s
- [ ] 50 s
- [x] 100 s
- [ ] 500 s

Explanation: 50,000,000 / (500 x 1,000) = 100 s.

## Diagram

```json
{ "kind": "graph", "caption": "The first design. A service calls the API (1), which saves the record and puts it on the code queue or the marketing queue (2). Workers take from their queue (3), pass a rate limiter and call a provider (4). Failed messages that give up go to a dead-letter queue (5, dashed).", "groups": [{ "id": "n", "label": "Notification service" }], "nodes": [{ "id": "s", "label": "Other service", "x": 6, "y": 50, "shape": "client" }, { "id": "api", "label": "API", "x": 24, "y": 50, "group": "n" }, { "id": "qc", "label": "Code queue", "x": 44, "y": 20, "shape": "queue", "group": "n" }, { "id": "qm", "label": "Marketing queue", "x": 44, "y": 80, "shape": "queue", "group": "n" }, { "id": "w", "label": "Workers + limiter", "x": 64, "y": 50, "group": "n" }, { "id": "dl", "label": "Dead-letter queue", "x": 64, "y": 90, "shape": "queue", "group": "n" }, { "id": "p", "label": "Push, email, SMS providers", "x": 92, "y": 50, "shape": "external" }], "edges": [{ "from": "s", "to": "api", "step": 1 }, { "from": "api", "to": "qc", "step": 2 }, { "from": "api", "to": "qm", "step": 2 }, { "from": "qc", "to": "w", "step": 3 }, { "from": "qm", "to": "w", "step": 3 }, { "from": "w", "to": "p", "step": 4 }, { "from": "w", "to": "dl", "step": 5, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path. The service calls the API (1), which saves the record and queues it (2) and answers 202 (3). A worker sends to the provider (4), gets an answer (5) and records it (6).", "actors": [{ "id": "s", "label": "Service" }, { "id": "a", "label": "API" }, { "id": "w", "label": "Worker" }, { "id": "p", "label": "Provider" }], "messages": [{ "from": "s", "to": "a", "label": "POST send_id" }, { "from": "a", "to": "w", "label": "Queue message" }, { "from": "a", "to": "s", "label": "202 Accepted", "dashed": true }, { "from": "w", "to": "p", "label": "Send push" }, { "from": "p", "to": "w", "label": "Accepted", "dashed": true }, { "from": "w", "to": "a", "label": "Record: sent" }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path. The caller asks for the status of a send id (1). The API reads the stored record (2, 3) and answers with the status, for example 'accepted by provider' (4).", "actors": [{ "id": "s", "label": "Service" }, { "id": "a", "label": "API" }, { "id": "d", "label": "Status store" }], "messages": [{ "from": "s", "to": "a", "label": "GET status" }, { "from": "a", "to": "d", "label": "Read record" }, { "from": "d", "to": "a", "label": "sent, 1 try", "dashed": true }, { "from": "a", "to": "s", "label": "accepted by provider", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Retry with backoff. The worker's first send fails (1, 2). It waits 1 s (retry 1) and fails (3, 4), waits 2 s and fails, and so on up to 5 retries, 31 s after the first failure. The sixth failure sends the message to the dead-letter queue (5).", "actors": [{ "id": "w", "label": "Worker" }, { "id": "p", "label": "Provider" }, { "id": "d", "label": "Dead-letter queue" }], "messages": [{ "from": "w", "to": "p", "label": "Send, try 1" }, { "from": "p", "to": "w", "label": "Error 503", "dashed": true }, { "from": "w", "to": "p", "label": "After 1 s: retry" }, { "from": "p", "to": "w", "label": "Error 503", "dashed": true }, { "from": "w", "to": "d", "label": "After 5 retries: park" }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "What a worker does with an answer: success is recorded; a bad token is removed and not retried; a temporary error is retried with growing waits; after the last try the message is parked in the dead-letter queue.", "steps": [{ "label": "Provider answer" }, { "label": "Success: record" }, { "label": "Bad token: remove" }, { "label": "Temporary: retry later" }, { "label": "Give up: dead-letter queue" }] }
```
