---
id: hld-case-chat
title: "Case Study: Chat System"
lastChecked: 2026-11-13
next: hld-case-notifications
roadmapSteps: backend:deployment-cloud, fullstack:deployment-scaling
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A chat system (an app where people send short messages to one person or a group and see replies at once) looks easy until messages must arrive in the right order, once, even when a phone is off. This note builds one design from stated assumptions, not "the" answer. The central trade-off: an open connection for every user gives speed but costs memory. After this note you can size the system, explain WebSocket, find a user's connection, and give every message a fixed place in its conversation.

## Topic: Requirements and scope

**Definition:** We build: send a text message to one person or to a group; receive it live when online; receive missed messages after being offline; show who is online (presence). Non-functional (about quality, not features): low delay, no message lost once the sender is told "sent", and one order for everyone. Out of scope: pictures and video, calls, end-to-end encryption, search.

**Why:** Ask first: groups or not, how many users, how long history is kept. These decide fan-out (copying one message to many people) and storage.

**Example:** (1) Send a message. (2) Receive it live. (3) Fetch what was missed. (4) Groups of up to 500 members (assumption). (5) Show online status.

**Failure:** Skipping "must it work offline?" brings the question what happens to a message sent to a phone that is off. The answer needs a store.

## Topic: Numbers

**Definition:** An estimate. Every input is an assumption:
- 50 million daily users, each sending 40 messages a day, 300 bytes stored per message with metadata.
- 10 million users connected at once, 10 KB of memory per connection, 100,000 connections per server.

**Why:** The numbers decide how many connection servers we need and how much we store.

**Example:**
- Messages: 50,000,000 x 40 = 2,000,000,000 a day. / 86,400 seconds = 23,148 a second. Peak at 3x (assumption): 69,444.
- Storage: 2,000,000,000 x 300 bytes x 365 days = 219 TB a year.
- Connections: 10,000,000 x 10 KB = 100 GB of memory. 10,000,000 / 100,000 = 100 connection servers.

**Failure:** With 10x connected users (100 million) we need 1,000 servers and a 10x bigger lookup table: a new design. 10x storage (2,190 TB a year) only means more disks.

## Topic: API and data

**Definition:** Messages travel over a live connection. An ack (short for acknowledgement, a reply that says "I got it") answers each step. `send {conversation, client_msg_id, text}` is answered by `ack {seq}`; client_msg_id is an id the client makes up, to recognise a resend. The server pushes (sends without being asked) `message {conversation, seq, sender, text, time}` and the client answers `ack {conversation, seq}`. For catch-up: `GET /conversations/{id}/messages?after=40`. A message record: conversation id, seq (a number that grows by one inside the conversation), sender, text, time.

**Why:** Every read is "messages of one conversation after number N", so we keep rows sorted by seq. A partition is the group of rows a database keeps together on one machine. Discord described in 2017 (its engineering post) a Cassandra table whose key was the channel plus a time bucket, with rows sorted by message id. It said partitions above 100 MB caused trouble, because a channel can grow for years, so it cut each channel into buckets of about 10 days. Our version: partition key (conversation, bucket), where bucket = seq divided by 10,000 and rounded down (assumption: 10,000 messages x 300 bytes = 3 MB, far under 100 MB).

**Example:** `send {c42, "9f3a", "hi"}` returns `ack {seq: 41}`. A phone that last saw seq 40 asks `after=40` and gets 41 onward.

**Failure:** This model cannot answer "find every message with this word". That needs a separate index.

## Topic: The first design

**Definition:** Clients hold a WebSocket (see Keeping millions of connections open) to a connection server, picked by a load balancer (see Computer Networks: System Design Concepts). Connection servers pass messages to a chat service. The chat service keeps no state of its own: the next seq of a conversation is taken with one atomic increment (one step no other request can interrupt) on a counter in the message store (our design). A lookup store says which connection server holds each user. Offline phones get a push notification (a message the phone's system shows even when the app is closed; see Case Study: Notification Service). See diagram 1.

**Why:** Connection servers scale with the user count, the chat service with the message rate. The lookup store finds the target.

**Example:** Write path (diagrams 2 and 3): (1) the sender's client sends over its connection; (2) the connection server forwards to the chat service; (3) it takes the next seq and stores the message; (4) it acks the sender with the seq; (5) it looks up each member's connection server; (6) those servers push; (7) recipients ack. Read path (diagram 4): a client reconnects, says its last seq, and gets everything after it.

**Failure:** The first bottleneck is connection memory (100 GB), then the lookup store, then one very busy conversation.

## Topic: Keeping millions of connections open

**Definition:** We choose WebSocket. RFC 6455 (2011) defines it as two-way messages over one connection. It starts as a normal web request that asks to upgrade. The server agrees with the reply 101 (Switching Protocols). After that, either side sends frames (pieces of a message) at any time. A ping frame is answered with a pong (unless the connection is closing), and the RFC says a ping can be a keepalive (a regular "still there?").

**Why:** Rejected: long polling (the client asks, the server holds the request open until it has news, then the client asks again). RFC 6455's introduction says such HTTP tricks need more than one connection per client and attach a header (extra labelled lines) to every message the client sends. Chat has traffic both ways, so one connection is cheaper. The price: memory per connection, and a crash drops 100,000 users.

**Example:** Finding a user: when a connection opens, its server writes `user 7 -> server 17` in a fast key-value lookup store, with an expiry that each heartbeat (ping and pong every 30 s, assumption) renews. On close it deletes the entry. Presence (online status) is "an entry exists". Cost: 10,000,000 users / 30 s = 333,333 heartbeats a second, 14 times the 23,148 messages a second (333,333 / 23,148 = 14.4), so the lookup store must be sized for them. Telling every contact about every status change would add far more, so send a status change only to people who have that contact open.

**Failure:** A server dies and 100,000 clients reconnect at once. Fix: each waits a random time before retrying (jitter, see System Design: Reliability). A stale lookup entry points to the dead server; the push fails and the message is treated as for an offline user.

## Topic: Delivering messages in order, once, to everyone

**Definition:** The chat service gives each message the next number of its conversation (seq). Clients sort by seq, never by their own clock. A message is stored first, then the sender gets the ack, then delivery starts. Delivery is at-least-once (a message may arrive more than once, never zero times; see System Design: Queues, Logs and Streaming), and the client keeps a seq it already has only once.

**Why:** Clocks disagree. Two senders: B's message reached the server first and got seq 1, A's got seq 2, though A typed first by A's clock. Everyone sorts by seq, so everyone sees B then A. The order is agreed, not "true". Cost: all messages of one conversation pass one counter. Rejected: one counter for all conversations (a bottleneck). A gap (have 5 and 7) tells a client to ask for 6.

**Example:**
- Lost ack: A sends id `9f3a`; stored as seq 41; the ack is lost; A resends `9f3a`; the service finds it stored and returns 41 again (the check and the write are one atomic step, our design).
- Offline user (assumption: 5 messages an hour for 8 hours): 5 x 8 = 40 messages wait. B returns, says "last seq 40", and receives the rest in order. If 20 percent of 50 million users, 10,000,000, were offline like this (busier than the average above, assumption): 10,000,000 x 40 = 400,000,000 messages x 300 bytes = 120 GB.
- Group of 500: about 500 deliveries (499 recipients, rounded), one stored copy. If 1 percent of 23,148 messages a second go to such groups: 231.5 x 500 = 115,741 deliveries a second.

**Failure:** "Exactly once" is not something the network can promise: it gives at-least-once, and the client's check on seq makes the effect once. A crash after storing and before acking is safe: A retries with the same id.

## Topic: Failures and scaling

**Definition:** The parts that can fail: a connection server, the chat service, a store node, the lookup store. The connection server matters most: it holds state, but nothing is lost, because the message was stored first.

**Why:** Storing before delivering turns a delivery failure into a delay, not a loss.

**Example:** A connection server dies. Its 100,000 users see "connecting". Clients retry after random waits, new lookup entries appear, each client asks `after=<last seq>`, and missed messages show in order. See diagram 5.

**Failure:** At 10x traffic: 1,000 connection servers, and 100,000,000 / 30 = 3,333,333 heartbeats a second, so the lookup store must be sharded (split over several machines; see System Design: Replication, Sharding and Consistent Hashing). A hot conversation still hits one counter.

## Questions

### Why WebSocket and not polling?

Chat talks both ways. One WebSocket connection avoids a new request and header for each message (RFC 6455), at the cost of memory per connection.

### How do you find the server that holds a user's connection?

A lookup store maps user to connection server. The server writes it on connect, renews it on each heartbeat, and removes it on close.

### What if the receiver is offline?

The message is already stored. On reconnecting, the client sends its last seq and gets everything after it.

## Mistakes

- "Order by the sender's timestamp." Phone clocks disagree. Use a server seq per conversation.
- "Exactly-once delivery is on." The network repeats; a client that drops a seq it already has makes the effect once.
- "Deliver first, store later." A crash then loses a message the sender was told was sent.

## Quiz

### How is the 100 GB of connection memory worked out?

- [ ] 100 servers x 100 GB
- [x] 10 million connections x 10 KB
- [ ] 2 billion messages x 300 bytes
- [ ] 23,148 messages a second x 10 KB

Explanation: 10,000,000 x 10 KB = 100 GB.

### What does the server answer to a WebSocket upgrade request?

- [ ] 301
- [ ] 200 with a cookie
- [x] 101 Switching Protocols
- [ ] 404

Explanation: RFC 6455 section 1.3: HTTP status 101, plus a `Sec-WebSocket-Accept` header that proves the server understood the request.

### Why sort by seq and not by the sender's clock?

- [ ] Seq is shorter
- [x] Every client sees the same order, and clocks may disagree
- [ ] Clocks are always wrong
- [ ] It saves memory

Explanation: The server saw B's message first, so B comes first for everyone.

### A sender's ack is lost and it resends. Why is there no duplicate?

- [ ] The network drops copies
- [ ] The receiver's clock decides
- [x] The service finds the same client message id already stored
- [ ] Resends are forbidden

Explanation: The id `9f3a` maps to seq 41 again.

### One message to a group of 500 members costs about how many deliveries?

- [ ] 1
- [ ] 50
- [x] 500
- [ ] 5,000

Explanation: One stored copy, about 500 deliveries.

## Diagram

```json
{ "kind": "graph", "caption": "The first design. A phone keeps a WebSocket to a connection server (1). That server passes messages to the chat service (2), which stores them (3) and looks up where each member is connected (4). Connection servers and stores sit in one data centre. A push service outside it (5, dashed) wakes phones that are offline.", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "u", "label": "Phone", "x": 10, "y": 20, "shape": "client" }, { "id": "cs", "label": "Connection servers", "x": 50, "y": 20, "group": "dc" }, { "id": "ch", "label": "Chat service", "x": 90, "y": 20, "group": "dc" }, { "id": "lk", "label": "Lookup store", "x": 50, "y": 80, "shape": "cache", "group": "dc" }, { "id": "ms", "label": "Message store", "x": 90, "y": 80, "shape": "database", "group": "dc" }, { "id": "pu", "label": "Push service", "x": 10, "y": 80, "shape": "external" }], "edges": [{ "from": "u", "to": "cs", "step": 1 }, { "from": "cs", "to": "ch", "step": 2 }, { "from": "ch", "to": "ms", "step": 3 }, { "from": "ch", "to": "lk", "step": 4 }, { "from": "ch", "to": "pu", "step": 5, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path, part 1: store first. Sender A's message goes through its connection server to the chat service, which stores it with the next seq and only then acks A through the same connection server.", "actors": [{ "id": "a", "label": "Sender A" }, { "id": "x", "label": "Connection server" }, { "id": "c", "label": "Chat service" }, { "id": "s", "label": "Message store" }], "messages": [{ "from": "a", "to": "x", "label": "send id 9f3a" }, { "from": "x", "to": "c", "label": "Forward" }, { "from": "c", "to": "s", "label": "Store as seq 41" }, { "from": "s", "to": "c", "label": "Stored", "dashed": true }, { "from": "c", "to": "x", "label": "ack seq 41", "dashed": true }, { "from": "x", "to": "a", "label": "ack seq 41", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path, part 2: deliver. The chat service asks the lookup store where receiver B is, gets server 17, and tells that connection server to push seq 41. The server pushes it to B, and B's ack comes back.", "actors": [{ "id": "c", "label": "Chat service" }, { "id": "l", "label": "Lookup store" }, { "id": "x", "label": "Server 17" }, { "id": "b", "label": "Receiver B" }], "messages": [{ "from": "c", "to": "l", "label": "Where is B?" }, { "from": "l", "to": "c", "label": "Server 17", "dashed": true }, { "from": "c", "to": "x", "label": "Push seq 41" }, { "from": "x", "to": "b", "label": "Push seq 41" }, { "from": "b", "to": "x", "label": "ack seq 41", "dashed": true }, { "from": "x", "to": "c", "label": "ack seq 41", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path after being offline. B reconnects through a connection server and says its last seq is 40. The chat service reads the messages after 40 from the store and pushes 41 and 42 in order. B acks the last one.", "actors": [{ "id": "b", "label": "Receiver B" }, { "id": "x", "label": "Connection server" }, { "id": "c", "label": "Chat service" }, { "id": "s", "label": "Message store" }], "messages": [{ "from": "b", "to": "x", "label": "Connect, last seq 40" }, { "from": "x", "to": "c", "label": "Last seq 40" }, { "from": "c", "to": "s", "label": "Read after 40" }, { "from": "s", "to": "c", "label": "Seq 41, 42", "dashed": true }, { "from": "c", "to": "b", "label": "Push 41, 42", "dashed": true }, { "from": "b", "to": "x", "label": "ack seq 42", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A connection server fails. The phone sees its connection to server 17 break, waits a random time and connects to server 4. It says its last seq and the chat service sends the missed messages. Nothing was lost because messages were stored before delivery.", "actors": [{ "id": "p", "label": "Phone" }, { "id": "y", "label": "Server 4" }, { "id": "c", "label": "Chat service" }], "messages": [{ "from": "p", "to": "y", "label": "Connect after random wait" }, { "from": "y", "to": "c", "label": "Last seq 40" }, { "from": "c", "to": "y", "label": "Seq 41 onward", "dashed": true }, { "from": "y", "to": "p", "label": "Seq 41 onward", "dashed": true }] }
```

## Diagram

```json
{ "kind": "layers", "caption": "How one conversation is stored. The partition key is the conversation plus a bucket (seq divided by 10,000), so a partition stays small. Inside it rows are sorted by seq, so 'after 40' is a short range read.", "layers": [{ "label": "Conversation c42, bucket 0 (one partition)" }, { "label": "seq 39: sender, text, time" }, { "label": "seq 40: sender, text, time" }, { "label": "seq 41: sender, text, time" }, { "label": "seq 42: sender, text, time" }] }
```
