---
id: hld-messaging-streaming
title: Queues, Logs and Streaming
lastChecked: 2026-11-13
next: hld-api-rate-limiting
roadmapSteps: backend:deployment-cloud, java-spring:spring-rest-api
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A message queue sits between two services so the sender does not wait for the receiver. A log keeps messages in order so many readers can read them, even again later. Interviewers ask about both when a design has bursts of work, background jobs or events. They ask follow-up questions about ordering, duplicates and what happens when the readers fall behind.

After this section you can choose between a queue and a log, explain at-most-once, at-least-once and exactly-once delivery, make a consumer safe against duplicates, and reason about a backlog.

## Topic: Why put a queue between services

**Definition:** A message queue (a waiting line for messages) lets a producer (the program that sends) hand work to a consumer (the program that processes it) without waiting. The consumer takes messages when it is ready.

**Why:** It smooths bursts (the queue absorbs a spike), decouples the two sides (one can be down or be deployed while the other runs), and allows a retry later. The costs: extra delay, duplicates, weaker ordering. Amazon Web Services (AWS, Amazon's cloud) describes its SQS standard queues as suited to background work such as resizing or encoding uploaded media, and to spreading tasks over many workers.

**Example:** A user uploads a photo. The web server stores it, puts "resize photo 81" on a queue and answers at once. Workers resize it a moment later.

**Failure:** Using a queue where the user needs the result in the same request. A queue also only moves the problem: if consumers stay slower than producers, it grows without limit.

## Topic: Queue against log

**Definition:** In a classic queue, the broker (the server that holds the messages) hides or deletes a message once a consumer has handled it. In a log, messages are added at the end of a file-like sequence and stay. Each consumer keeps its own position (an offset, the number of the next message to read). Kafka (a messaging system built around logs) divides a topic (a named stream of messages) into totally ordered partitions (ordered parts of a topic, explained next). A consumer's position is one integer per partition.

**Why:** A log lets many independent readers read the same data at their own speed, and lets one go back and read again. A queue is simpler when each message is work for exactly one worker.

**Example:**
- Amazon SQS (a queue, per the AWS developer guide). A standard queue gives at-least-once delivery: a message may arrive more than once or out of order. A received message stays in the queue but is invisible for the visibility timeout (30 seconds by default; at most 12 hours from first receipt). If the consumer does not delete it in time, it appears again. A dead-letter queue (a separate queue for messages that keep failing) takes a message after a set number of receives.
- SQS FIFO queues keep strict order within a message group. They have a throughput cap (300 calls a second per action, more with batching); high-throughput mode raises it to 30,000 but relaxes ordering within a group.
- Kafka (a log). In a classic consumer group (a set of consumers sharing one job), each partition is read by exactly one consumer of the group at a time.

**Failure:** "Kafka is a queue" or "SQS is a log". They differ in who tracks progress and whether data stays. Newer Kafka also has share groups, which let several consumers share one partition like a queue; this note covers classic consumer groups. With SQS FIFO, a dead-letter queue can break the exact order (SQS guide).

## Topic: Partitions, keys and ordering

**Definition:** A partition is one ordered slice of a topic. In Kafka the producer picks the partition. With a key (a value such as a user id), the key is turned into a number that picks the partition, so all messages with the same key go to one partition. Order is guaranteed only inside one partition.

**Why:** Partitions let many consumers work in parallel. Putting related messages in one partition keeps their order.

**Example:** A made-up rule turns each user id into a partition number (4 partitions): user-1 goes to 3, user-2 to 0, user-3 to 2, user-4 to 3, user-5 to 1, user-6 to 1. All of one user's messages stay in order; user-1 and user-4 share partition 3. Now take 6 partitions in one classic group. With 3 consumers each reads 2 partitions. With 6, each reads 1. With 10, 6 read one each and 4 have nothing to do.

**Failure:** Expecting global order across partitions, or adding consumers beyond the partition count (they sit idle). A very popular key puts all its load on one partition.

## Topic: Delivery semantics

**Definition:** At most once: a message may be lost but is never delivered again. At least once: never lost, but may come again. Exactly once: each message is processed once and only once. For a consumer crash, which one you get depends on when the consumer saves its position (Kafka design page). The producer side has its own settings.

**Why:** The consumer can crash between processing and saving. Save first, then process: a crash loses messages (at most once). Process first, then save: a crash repeats them (at least once). When a consumer crashes, another one takes over from the saved position.

**Example:** Kafka, since 0.11.0.0:
- An idempotent producer: resending creates no duplicate in the log (the broker uses a producer id and a sequence number).
- Transactions: writes to several partitions are all or none.
- Inside Kafka: the offset is saved in the same transaction as the output. That gives exactly-once in Kafka Streams.
- Outside systems: Kafka says exactly-once needs cooperation from that system, for example storing the offset together with the output.
- Default: at least once.

A simulation: 100,000 messages, each with a 0.001 chance of a crash after processing but before saving. Expected repeats: 100,000 x 0.001 = about 100; the run gave 99.

**Failure:** A better answer than "exactly-once is impossible" or "exactly-once is a switch": each message may be delivered more than once, but the effect can happen once. Kafka does that inside Kafka with transactions. For an outside system, the consumer must save the offset with the output, or remove duplicates.

## Topic: Idempotent consumers

**Definition:** An idempotent operation (doing it twice has the same effect as doing it once) makes duplicates harmless. A consumer becomes idempotent by recording the ids of messages it has handled.

**Why:** At least once is the practical default, so duplicates will come. AWS's article on idempotent APIs: the caller chooses a unique request id, the service records the id atomically (in the same step) with the change, a retry returns the same result as the first success, and the same id with different data is an error.

**Example:** In the same simulation, a consumer that remembers handled ids had 0 duplicate effects. Another simple case: if each message carries a key, writing it again replaces the row with identical data.

**Failure:** Saving the id and doing the work in two separate steps. A crash between them either skips the work or repeats it. Make it one atomic step, for example one database transaction.

## Topic: Backlog and back pressure

**Definition:** A backlog is the queue length when consumers lag. Back pressure is any way of slowing producers or limiting intake so the backlog does not grow without end. The AWS article on queue backlogs says queue systems are bimodal (two modes): fast with no backlog, and once arrivals exceed processing, delay keeps growing.

**Why:** AWS's team alarms on message age (how long messages wait) more than on queue length. Little's law (concurrency, the number of messages being worked on at the same moment, = rate x time) shows how fast things degrade: 100 messages a second at 100 ms each need 100 x 0.1 = 10 threads; if latency rises to 10 s, 100 x 10 = 1,000 (AWS example).

**Example:** Assumption: 100 messages a second arrive. A one-hour outage builds 100 x 3,600 = 360,000 waiting messages.
- Consumers handle 125 a second: they clear 25 more than arrive each second. 360,000 / 25 = 14,400 s = 240 minutes.
- At 150 a second: 360,000 / 50 = 7,200 s = 120 minutes.
- At 200 a second: 360,000 / 100 = 3,600 s = 60 minutes. This matches AWS's point that an hour-long outage needs double the normal capacity for another hour.

**Failure:** Adding consumers without checking the database behind them, which may be the real limit (own reasoning).

## Topic: Retention and replay

**Definition:** Retention is how long the log keeps messages. A Kafka consumer can rewind to an old offset and read again.

**Why:** If a consumer had a bug, fix it and re-read. A classic queue deletes on consumption, so there is nothing to replay.

**Example:** Kafka's page describes keeping messages for a period (it gives a week as an example) rather than deleting on consumption. Log compaction (trimming the log so the newest message for each key is kept) keeps at least the last value for each key.

**Failure:** Assuming data stays forever. Retention is configured; by logic, a consumer that lags beyond it loses messages (own reasoning).

## Questions

### Queue or log: how do you choose?

A queue fits one-time work for one worker. A log fits many readers, replay and ordered events per key.

### Why can a consumer see the same message twice?

It processed it, then crashed before saving its position (or deleting it). The broker sends it again, giving at-least-once delivery.

### How do you keep order for one user?

Use the user id as the key so the user's messages go to one partition. Order holds only inside a partition.

### How do you handle duplicates?

Make the consumer idempotent: store the message id in the same atomic step as the effect.

## Mistakes

- "Exactly-once delivery is impossible", or "it is a switch you turn on". The effect can happen once: Kafka does it for a whole Kafka pipeline with transactions; outside systems must cooperate.
- "A queue gives global order." SQS standard is best effort; Kafka orders only within a partition.
- "Add more consumers to go faster." In one classic Kafka consumer group, extra consumers beyond the partition count sit idle.

## Quiz

### In Kafka, what decides at-most-once or at-least-once when a consumer crashes?

- [ ] The partition count
- [x] Whether the position is saved before or after processing
- [ ] The key hash
- [ ] The producer's language

Explanation: Save before processing and a crash loses messages; save after and a crash repeats them.

### 6 partitions in one classic consumer group, 10 consumers. How many are busy?

- [ ] 10
- [ ] 4
- [x] 6
- [ ] 1

Explanation: Each partition is read by one consumer of the group, so 4 are idle.

### What does an SQS visibility timeout do?

- [ ] Deletes the message
- [x] Hides a received message from other consumers until it is deleted or the time ends
- [ ] Encrypts the message
- [ ] Orders the queue

Explanation: If the consumer does not delete the message in time, it becomes visible again.

### Which is the better alarm for a lagging consumer?

- [ ] CPU of the producer
- [x] How long messages wait
- [ ] Number of partitions
- [ ] Message size

Explanation: AWS's team measures message age, the time spent waiting.

### Why must the id and the effect be saved atomically?

- [ ] To keep messages in order
- [x] A crash between two separate steps would skip or repeat the work
- [ ] To reduce partitions
- [ ] To make the broker faster

Explanation: One atomic step keeps the duplicate check and the work consistent.

## Diagram

```json
{ "kind": "graph", "caption": "Kafka topic with three partitions. Producers choose a partition from the message key (1). A consumer group reads: each partition is read by exactly one consumer of the group (2); consumer 1 reads partitions 0 and 1, consumer 2 reads partition 2.", "groups": [{ "id": "t", "label": "Topic (Kafka)" }, { "id": "g", "label": "Consumer group" }], "nodes": [{ "id": "p1", "label": "Producer 1", "x": 8, "y": 25, "shape": "client" }, { "id": "p2", "label": "Producer 2", "x": 8, "y": 78, "shape": "client" }, { "id": "q0", "label": "Partition 0", "x": 45, "y": 15, "shape": "queue", "group": "t" }, { "id": "q1", "label": "Partition 1", "x": 45, "y": 50, "shape": "queue", "group": "t" }, { "id": "q2", "label": "Partition 2", "x": 45, "y": 85, "shape": "queue", "group": "t" }, { "id": "c1", "label": "Consumer 1", "x": 84, "y": 30, "group": "g" }, { "id": "c2", "label": "Consumer 2", "x": 84, "y": 75, "group": "g" }], "edges": [{ "from": "p1", "to": "q0", "step": 1 }, { "from": "p1", "to": "q1", "step": 1 }, { "from": "p2", "to": "q2", "step": 1 }, { "from": "q0", "to": "c1", "step": 2 }, { "from": "q1", "to": "c1", "step": 2 }, { "from": "q2", "to": "c2", "step": 2 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "At-least-once delivery with a crash: consumer 1 fetches message 7 (1, 2) and applies it (3), then crashes before saving its offset. Consumer 2 takes over, asks for the saved position, which is still 7 (4, 5), fetches message 7 again (6, 7) and applies it a second time (8). An idempotent consumer makes step 8 harmless.", "actors": [{ "id": "a", "label": "Consumer 1" }, { "id": "b", "label": "Consumer 2" }, { "id": "k", "label": "Broker" }, { "id": "d", "label": "Database" }], "messages": [{ "from": "a", "to": "k", "label": "Fetch from offset 7" }, { "from": "k", "to": "a", "label": "Message 7", "dashed": true }, { "from": "a", "to": "d", "label": "Apply 7" }, { "from": "b", "to": "k", "label": "Last saved offset?" }, { "from": "k", "to": "b", "label": "Saved offset: 7", "dashed": true }, { "from": "b", "to": "k", "label": "Fetch from offset 7" }, { "from": "k", "to": "b", "label": "Message 7 again", "dashed": true }, { "from": "b", "to": "d", "label": "Apply 7 again" }] }
```
