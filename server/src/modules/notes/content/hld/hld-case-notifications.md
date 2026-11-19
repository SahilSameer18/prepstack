---
id: hld-case-notifications
title: "Case Study: Notification Service"
lastChecked: 2026-11-13
next: hld-case-news-feed
roadmapSteps: backend:deployment-cloud, java-spring:spring-rest-api
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A notification service (a system that other services call to tell a user something by push, email or text message) must handle sudden bursts, mixed urgency, and providers (outside companies that do the final delivery) that fail. A push is a pop-up message an app sends to a phone. This note builds one design from stated assumptions, not "the" answer. The central trade-off: retry enough to never lose a message, but not so much that users get repeats. After this note you can keep login codes fast during a campaign and explain retries and send ids.

## Topic: Requirements and scope

**Definition:** We build: other services call us with "tell user U about X"; we pick a channel, check the user's preferences, send through a provider, retry failures and record the result. Non-functional: login codes arrive in seconds, nothing is lost, repeats are rare, marketing may wait. Out of scope: message text, running the providers, an in-app inbox.

**Why:** Ask which messages are urgent and whether users can opt out. Urgency decides the queues.

**Example:** (1) A request carries user, type (login code or marketing), content, optional send time. (2) Choose the channel. (3) Respect opt-out and quiet hours (hours the user asked not to be disturbed). (4) Retry failures. (5) Keep a status per notification.

**Failure:** Skipping "are all messages equally urgent?" leads to one queue where a login code waits behind a campaign.

## Topic: Numbers

**Definition:** An estimate. Every input is an assumption:
- A burst of 5 million marketing pushes at once; one worker (a program that takes jobs and does them) sends 1,000 a second; the system sends 10,000 a second in total.
- Retries start at 1 second and double, 5 retries.
- Of 1,000,000 sends, 0.1 percent are repeated by a retry after a lost acknowledgement.
- One event notifies 2,000 followers on 3 channels.

**Why:** They decide how many workers we need and whether urgent messages need their own path.

**Example:**
- One worker: 5,000,000 / 1,000 = 5,000 s (83.3 min). 50 workers: 5,000,000 / 50,000 = 100 s. 500 workers: 10 s.
- One event: 2,000 x 3 = 6,000 deliveries.

**Failure:** A burst 10x bigger (50 million) with 500 workers takes 50,000,000 / (500 x 1,000) = 100 s. Then the limit is no longer our workers but how fast the providers accept (see Bursts and priorities).

## Topic: API and data

**Definition:** `POST /notifications {send_id, user_id, type, payload, send_at?, expires_at}` answers 202 (accepted, work comes later). The payload is the message content. `GET /notifications/{send_id}` gives the status. `PUT /users/{id}/preferences {channels, quiet_hours, marketing_opt_in}`. Records: notification (send_id, user, type, status, tries, expires), device (user, platform, token, last seen), preferences. A device token is an address the push provider gives for one app on one phone.

**Why:** The caller chooses `send_id` (for example "order-81-shipped"), so a repeated request is recognised (see System Design: APIs, Gateways and Rate Limiting).

**Example:** `POST` with send_id `order-81-shipped` returns 202. Repeated, it returns the same record, not a second send.

**Failure:** The model cannot answer "did the user read it?". The providers' reports are limited (see Not losing and not repeating).

## Topic: The first design

**Definition:** The API saves the record and puts the request on a queue (a waiting line of jobs) chosen by type: one for login codes, one for marketing. Workers take from a queue, check preferences, wait for permission from a rate limiter for the target provider, and call it. A scheduler holds requests with a future send time. Failures go back for retry, or to a dead-letter queue (a side queue for messages that keep failing). See diagram 1.

**Why:** Queues absorb bursts and let the API answer fast (see System Design: Queues, Logs and Streaming). Separate queues keep urgent work apart.

**Example:** Write path (diagram 2): (1) a service calls the API; (2) the API inserts the record if the send id is new and queues it; (3) a worker takes it; (4) checks preferences and quiet hours; (5) asks the limiter for a slot; (6) calls the provider; (7) records the result.

**Failure:** First bottleneck: the providers' acceptance rate, then the one queue per type.

## Topic: Bursts and priorities

**Definition:** Four decisions. Separate queues and workers for login codes and marketing. A rate limit towards each provider. Preferences and quiet hours checked at send time. Scheduling for future send times.

**Why:**
- Shared queue (assumption: 10,000 sends a second in total): a code arriving just after 5,000,000 marketing messages waits 5,000,000 / 10,000 = 500 s (8.3 min). With its own queue it does not wait.
- Rejected: only adding workers. 500 workers clear the burst in 10 s but sit idle most of the day (our reasoning), and providers cap the speed anyway.
- Provider limits. Apple's page says push traffic should be spread over many connections, that notifications may be throttled (slowed or refused on purpose), and that a 429 means too many requests for one device token. Firebase's page says a message above a per-device limit is reported as throttled, and a device holds at most 100 pending non-collapsible messages (messages not allowed to replace an older waiting one). Neither page gives a requests-per-second number, so we set our limit below the rate agreed with the provider.
- Quiet hours are checked at send time, in the user's time zone, because preferences change while a message waits. Marketing that arrives during quiet hours is rescheduled for when they end. Login codes ignore quiet hours (our choice).

**Example:** Assumption: the limiter lets marketing through at 2,000 a second. 5,000,000 / 2,000 = 2,500 s (41.7 min), while codes use their own allowance.

**Failure:** One shared limiter lets marketing use every slot and starve codes: reserve a share for codes.

## Topic: Not losing and not repeating

**Definition:** We remove a job from the queue only after the provider accepts it. If the worker crashes after the provider accepted but before the job is removed, the job is sent again. This is at-least-once: a message may be sent more than once, never zero times. The send id and a stored status cut repeats. Retries use backoff (growing waits): 1, 2, 4, 8, 16 s, which is 1 + 2 + 4 + 8 + 16 = 31 s after the first failure, with jitter (random extra waits, see System Design: Reliability: Timeouts, Retries and Failure). This schedule suits a short network error or a provider that states no wait.

**Why:** Of 1,000,000 sends, 0.1 percent = 1,000 are repeated. With the send id stored and checked, 0 duplicate pushes reach users in that model. A crash after the provider accepted but before we saved can still repeat one (our reasoning), so repeats are rare, not impossible. Both providers can merge messages that share a label (Apple's `apns-collapse-id`, Firebase's collapse key), so a second message replaces a waiting first one. That suits "new score" updates but is wrong for login codes, where each message matters.

**Example:** Errors, in a pattern. Temporary errors (server busy, status 5xx, "too many requests"): retry later. Permanent errors (token wrong, expired or no longer registered): do not retry, remove the token.
- APNs (Apple's push service for iPhones), Apple's page: retry a 5xx only after 15 minutes (backoff allowed). Do not retry BadDeviceToken, DeviceTokenNotForTopic, Forbidden, ExpiredToken, Unregistered or PayloadTooLarge. Retry TooManyRequests after a delay. Status 410 Unregistered: send no more to that token.
- Firebase (FCM, Google's push service): UNREGISTERED (404) and INVALID_ARGUMENT (400, if the payload is valid) mean delete the token. Its default stale-token test is a month without contact; for Android, FCM itself expires a token after 270 days of inactivity.
- Expiry: stop at `expires_at`, because a login code is useless later. Apple lets us set how long it keeps an undelivered push (the expiration); 0 means it tries once and does not store it. Firebase's lifetime 0 (Android and Web) discards a message that cannot be delivered at once; on iOS use the same Apple setting. Otherwise Firebase keeps a message up to 28 days (4 weeks by default) and Apple stores one notification per app, for up to 30 days.
- After the last try, the message goes to the dead-letter queue.

**Failure:** "Delivered" is not what a 200 means. Apple describes best effort (no promise). Firebase says a message id means accepted, not delivered; a delivered event exists only if you turn on an export, and it means the app on the phone got it. Our status says "accepted". Retrying a dead provider without limit floods it: use a circuit breaker (stop calling it for a while).

## Topic: Failures and scaling

**Definition:** What fails: a worker, a provider, the queue. The provider outage matters most for login codes.

**Why:** A worker that dies does not remove its message, which returns and is sent again after the send-id check.

**Example:** A push provider is down. Retries fail, the breaker opens, the queue grows. After a few failed tries, a code switches to SMS (our choice; costs money, needs a number). The user waits seconds longer; marketing waits until the provider returns.

**Failure:** At 10x traffic: more workers help up to the providers' limits. Old device tokens must be removed by a job that runs every day (Firebase's page suggests storing a timestamp with each token). User preferences are read very often, so keep a copy in a cache (see System Design: Caching).

## Questions

### How do you stop a campaign from delaying login codes?

Give codes their own queue, workers and a reserved share of the provider limit. In a shared queue behind 5 million messages at 10,000 a second, a code waits 500 s.

### How do you avoid sending twice?

The caller sends a send id. We store its status and skip a known id. Crashes can still repeat one, so the design is at-least-once.

### What do you do when Apple's push service answers Unregistered?

Stop sending to that token and remove it from the device list. Apple's page says no further pushes are needed for it.

## Mistakes

- "Retry every failure." Apple's page lists errors that should not be retried, such as BadDeviceToken.
- "A send id gives exactly-once." A crash between provider and record can still repeat.
- "A 200 means the user saw it." It means the provider accepted the request.

## Quiz

### Assumption: the system sends 10,000 messages a second, and 5,000,000 marketing messages are in one shared queue when a login code arrives. How long does the code wait?

- [ ] 5 s
- [ ] 50 s
- [x] 500 s
- [ ] 5,000 s

Explanation: 5,000,000 / 10,000 = 500 s.

### Retries wait 1, 2, 4, 8 and 16 seconds in turn. How long after the first failure does the fifth retry start?

- [ ] 16 s
- [ ] 24 s
- [x] 31 s
- [ ] 62 s

Explanation: The fifth retry starts after 1 + 2 + 4 + 8 + 16 = 31 s.

### Which is a correct response to Apple's 410 Unregistered?

- [ ] Retry in 1 s
- [x] Remove the token
- [ ] Send twice
- [ ] Ignore it

Explanation: Apple's page says not to retry Unregistered.

### Why set Apple's expiration to 0 for a login code?

- [ ] To make it faster to write
- [ ] To collapse it
- [x] So APNs tries once and does not keep the code to deliver it much later
- [ ] To skip the provider

Explanation: Apple: 0 means one attempt, not stored (it may still arrive with a short delay).

### Assumption: one worker sends 1,000 pushes a second. How long do 500 workers need for 50 million pushes?

- [ ] 10 s
- [ ] 50 s
- [x] 100 s
- [ ] 500 s

Explanation: 50,000,000 / (500 x 1,000) = 100 s.

## Diagram

```json
{ "kind": "graph", "caption": "The first design. A calling service calls the API (1), which saves the record and puts it on the code queue or the marketing queue (2). Workers take from their queue (3), pass a rate limiter and call the providers (push, email, SMS) (4). Messages that give up go to the dead-letter queue (\"Dead letters\", 5, dashed).", "groups": [{ "id": "n", "label": "Notification service" }], "nodes": [{ "id": "s", "label": "Caller", "x": 6, "y": 25, "shape": "client" }, { "id": "api", "label": "API", "x": 50, "y": 25, "group": "n" }, { "id": "qc", "label": "Code queue", "x": 30, "y": 52, "shape": "queue", "group": "n" }, { "id": "qm", "label": "Marketing queue", "x": 68, "y": 52, "shape": "queue", "group": "n" }, { "id": "w", "label": "Workers + limiter", "x": 64, "y": 82, "group": "n" }, { "id": "dl", "label": "Dead letters", "x": 32, "y": 82, "shape": "queue", "group": "n" }, { "id": "p", "label": "Providers", "x": 98, "y": 82, "shape": "external" }], "edges": [{ "from": "s", "to": "api", "step": 1 }, { "from": "api", "to": "qc", "step": 2 }, { "from": "api", "to": "qm", "step": 2 }, { "from": "qc", "to": "w", "step": 3 }, { "from": "qm", "to": "w", "step": 3 }, { "from": "w", "to": "p", "step": 4 }, { "from": "w", "to": "dl", "step": 5, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path (the preference, quiet-hours and limiter checks are not drawn). The service calls the API, which saves the record, queues the job and answers 202. A worker takes the job, sends to the provider, gets an answer and records the result through the API.", "actors": [{ "id": "s", "label": "Service" }, { "id": "a", "label": "API" }, { "id": "q", "label": "Queue" }, { "id": "w", "label": "Worker" }, { "id": "p", "label": "Provider" }], "messages": [{ "from": "s", "to": "a", "label": "POST send_id" }, { "from": "a", "to": "q", "label": "Save, queue" }, { "from": "a", "to": "s", "label": "202 Accepted", "dashed": true }, { "from": "q", "to": "w", "label": "Job" }, { "from": "w", "to": "p", "label": "Send push" }, { "from": "p", "to": "w", "label": "Accepted", "dashed": true }, { "from": "w", "to": "a", "label": "Record: sent" }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path. The caller asks for the status of a send id (1). The API reads the stored record (2, 3) and answers with the status, for example 'accepted by provider' (4).", "actors": [{ "id": "s", "label": "Service" }, { "id": "a", "label": "API" }, { "id": "d", "label": "Status store" }], "messages": [{ "from": "s", "to": "a", "label": "GET status" }, { "from": "a", "to": "d", "label": "Read record" }, { "from": "d", "to": "a", "label": "sent, 1 try", "dashed": true }, { "from": "a", "to": "s", "label": "accepted by provider", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Retry with backoff, shortened: only the first retry is drawn. The worker's first send to an email provider (assumption: one that states no wait) fails (1, 2). It waits 1 s and fails again (3, 4). Retries 2 to 5 wait 2, 4, 8 and 16 s and are not drawn; after the last one, 31 s after the first failure, the message goes to the dead-letter queue (5).", "actors": [{ "id": "w", "label": "Worker" }, { "id": "p", "label": "Email provider" }, { "id": "d", "label": "Dead-letter queue" }], "messages": [{ "from": "w", "to": "p", "label": "Send, try 1" }, { "from": "p", "to": "w", "label": "Timeout", "dashed": true }, { "from": "w", "to": "p", "label": "After 1 s: retry" }, { "from": "p", "to": "w", "label": "Timeout", "dashed": true }, { "from": "w", "to": "d", "label": "After 5 retries: park" }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "What a worker does with an answer: success is recorded; a bad token is removed and not retried; a temporary error is retried with growing waits; after the last try the message is parked in the dead-letter queue.", "steps": [{ "label": "Provider answer" }, { "label": "Success: record" }, { "label": "Bad token: remove" }, { "label": "Temporary: retry later" }, { "label": "Give up: dead-letter queue" }] }
```
