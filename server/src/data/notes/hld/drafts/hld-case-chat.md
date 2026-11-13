---
id: hld-case-chat
title: "Case Study: Chat System"
next: hld-case-notifications
roadmapSteps: backend:deployment-cloud, fullstack:deployment-scaling
---
<!-- Draft 13 Nov 2026, not published. Numbers from docs/content/checks/hld-case-check.py (sections 4A to 4E) and shown arithmetic. WebSocket facts from RFC 6455 (December 2011). Storage example from Discord's 2017 engineering post. -->

## Overview

A chat system (an app where people send short messages to one person or a group and see replies at once) looks easy until messages must arrive in the right order, once, even when a phone is off. This note builds one design from stated assumptions, not "the" answer. The central trade-off: keeping a connection open for every user gives speed but costs memory. After this note you can size the system, explain WebSocket, find a user's connection, and give every message a fixed place in its conversation.

## Topic: Requirements and scope

**Definition:** We build: send a text message to one person or to a group; receive it live when online; receive missed messages after being offline; show who is online (presence). Non-functional (about quality, not features): low delay, no message lost once the sender is told "sent", and the same order for everyone in a conversation. Out of scope: pictures and video, calls, end-to-end encryption, search.

**Why:** An interviewer wants you to ask first: one-to-one or groups, how many users, how long history is kept. These decide fan-out (copying one message to many people) and storage.

**Example:** (1) Send a message to a conversation. (2) Receive it live. (3) Fetch what was missed. (4) Groups of up to 500 members (assumption). (5) Show online status. Out of scope: media, calls.

**Failure:** Skipping "must it work offline?" The interviewer then asks what happens to a message sent to a phone that is off. The answer needs a store (see The first design).

## Topic: Numbers

**Definition:** An estimate. Every input is an assumption: 50 million daily users, 40 messages sent each, 300 bytes stored per message with metadata (4A); 10 million users connected at once, 10 KB memory per connection, 100,000 connections per server (4B).

**Why:** The numbers decide how many connection servers we need and how much we store.

**Example:** 2,000,000,000 messages a day, 23,148 a second on average, 69,444 at a peak of 3x (the 3x is an assumption). Storage: 219 TB a year. Connections: 100 GB of memory in all, so 100 connection servers.

**Failure:** If connected users were 10x (100 million), we would need 1,000 servers (100,000,000 / 100,000) and the lookup table of Topic 5 would be 10x bigger. That changes the design more than 10x storage (2,190 TB a year), which only means more disks.

## Topic: API and data

**Definition:** Messages travel over a live connection. `send {conversation, client_msg_id, text}` is answered by `ack {seq}`. The server pushes `message {conversation, seq, sender, text, time}` and the client answers `ack {conversation, seq}`. For catch-up: `GET /conversations/{id}/messages?after=40`. One message record: conversation id, seq (a number that grows by one inside the conversation), sender, text, time. A second, temporary table maps user to the server holding the connection.

**Why:** Every read is "messages of one conversation after number N". So key by conversation and keep rows sorted by seq. Discord described in 2017 (its engineering post on storing messages) a Cassandra table keyed by channel id plus a time bucket, with rows sorted by message id. It said partitions (the pieces of a table kept together) above 100 MB hurt, so it cut each channel into buckets of about 10 days of messages. We borrow only the shape: one conversation's messages sit together, in order.

**Example:** `send {c42, "9f3a", "hi"}` returns `ack {seq: 41}`. A phone that last saw seq 40 asks `after=40` and gets 41 onward.

**Failure:** This model cannot answer "find every message with this word" or "all messages by one sender". That needs a separate index.

## Topic: The first design

**Definition:** Clients hold a WebSocket (see Topic 5) to a connection server, picked by a load balancer (see Computer Networks: System Design Concepts). Connection servers pass messages to a chat service (stateless: it keeps nothing between requests). It stamps the seq and writes to the message store. A lookup store says which connection server holds each user. Offline phones get a push notification (see Case Study: Notification Service). See diagram 1.

**Why:** Connection servers only hold connections, so they scale with the user count. The chat service scales with message rate. The lookup store finds the target.

**Example:** Write path (diagram 2): (1) sender's client sends over its connection; (2) the connection server forwards to the chat service; (3) it takes the next seq and stores the message; (4) it acks the sender with the seq; (5) it looks up each member's connection server; (6) those servers push; (7) recipients ack. Read path (diagram 3): a client reconnects, says its last seq, and gets everything after.

**Failure:** The first bottleneck is connection memory (100 GB), then the lookup store, then one very busy conversation.

## Topic: Keeping millions of connections open

**Definition:** We choose WebSocket. RFC 6455 (2011) defines it as two-way messages over one TCP connection. It starts as an HTTP GET that asks to upgrade. The server answers 101 (Switching Protocols) and a `Sec-WebSocket-Accept` value computed from the client's random key, which shows it understood. Then either side sends frames (pieces of a message) at any time. A ping frame must be answered with a pong, and the RFC says a ping can be a keepalive (a regular "still there?").

**Why:** Rejected: long polling (the client asks and the server holds the request open until it has news, then the client asks again). RFC 6455's introduction says such HTTP tricks need more than one TCP connection per client and put an HTTP header on every message. Chat has traffic both ways, so one connection is cheaper. The price (4B, assumptions): each connection holds memory, and servers are no longer interchangeable, because a crash drops 100,000 users.

**Example:** Finding a user: when a connection opens, its server writes `user 7 -> server 17` in a fast key-value lookup store, with an expiry that each heartbeat (ping and pong every 30 s, assumption) renews. On close it deletes the entry. Presence (online status) is "an entry exists". Its cost, my arithmetic: 10,000,000 users / 30 s = 333,333 heartbeats a second, 14 times the 23,148 messages a second. So send status changes only to people who have that contact open.

**Failure:** A server dies and 100,000 clients reconnect at once. Fix: each waits a random time before retrying (jitter, see System Design: Reliability). A stale lookup entry points to the dead server; the push fails, and the message is treated as for an offline user.

## Topic: Delivering messages in order, once, to everyone

**Definition:** The chat service gives each message the next number of its conversation (seq). Clients sort by seq, never by their own clock. A message is stored first, then the sender gets the ack, then delivery starts. Delivery is at-least-once (see System Design: Queues, Logs and Streaming), and the client throws away a seq it already has.

**Why:** Clocks disagree. In 4D, B's message reached the server first and got seq 1, A's got seq 2, though A typed first by A's clock; everyone sorts by seq, so everyone sees B then A. The order is agreed, not "true". Cost: all messages of one conversation pass one place at a time, so we assign each conversation to one chat-service shard. Rejected: one counter for all conversations (a bottleneck) and client clocks (they disagree). A gap (have 5 and 7) tells a client to ask for 6.

**Example:** A sends id `9f3a`; stored as seq 41; the ack is lost; A resends `9f3a`; the service finds it stored and returns 41 again. B is offline: at 5 messages an hour for 8 hours, 40 wait (4E). If 20 percent of 50 million users are offline, that is 400,000,000 messages, 120 GB. B returns, says "last seq 40", and receives the rest in order. A group of 500 members costs 500 deliveries for one message (4C), one stored copy. If 1 percent of all messages go to such groups, that adds 115,741 deliveries a second on average.

**Failure:** "Exactly-once" is not a network switch: the network gives at-least-once and the client's check on seq makes the effect once. Crash after storing and before acking: A retries with the same id, so no duplicate. A group of millions needs another design; ours is for 500.

## Topic: Failures and scaling

**Definition:** The parts that can fail: a connection server, the chat service, a store node, the lookup store. The connection server matters most: it holds state, but nothing is lost, because the message was stored first.

**Why:** Storing before delivering turns every delivery failure into a delay, not a loss.

**Example:** A connection server dies. Its 100,000 users see "connecting". Clients retry after random waits, new lookup entries appear, each client asks `after=<last seq>`, and missed messages show in order. See diagram 4.

**Failure:** At 10x traffic: 1,000 connection servers, presence at 3,333,333 heartbeats a second (100,000,000 / 30), so the lookup store must be sharded (see System Design: Replication and Partitioning). Storage becomes 2,190 TB a year. A hot conversation still sits on one shard.

## Questions

### Why WebSocket and not polling?

Chat talks both ways often. One WebSocket connection avoids a new request and an HTTP header for each message (RFC 6455). The cost is memory per connection.

### How do you find the server that holds a user's connection?

A lookup store maps user to connection server. The server writes it on connect, renews it on each heartbeat, and removes it on close.

### How do you order messages in a group?

The chat service gives each message the next seq of that conversation. Clients sort by seq, not by their clocks.

### What if the receiver is offline?

The message is already stored. On reconnecting, the client sends its last seq and gets everything after it. A push notification can wake the phone.

## Mistakes

- "Order by the sender's timestamp." Phone clocks disagree. Use a server seq per conversation.
- "Exactly-once delivery is on." The network repeats; a client that drops a seq it already has makes the effect once.
- "Deliver first, store later." A crash then loses a message the sender was told was sent.

## Quiz

### Where does 100 GB in 4B come from?

- [ ] 100 servers x 100 GB
- [x] 10 million connections x 10 KB (assumptions)
- [ ] 2 billion messages x 300 bytes
- [ ] 23,148 x 10 KB

Explanation: 10,000,000 x 10 KB = 100 GB.

### What does the server answer to a WebSocket upgrade request?

- [ ] 301
- [ ] 200 with a cookie
- [x] 101 Switching Protocols
- [ ] 404

Explanation: RFC 6455 section 1.3: HTTP status 101 plus a `Sec-WebSocket-Accept` header.

### Why sort by seq and not by the sender's clock?

- [ ] Seq is shorter
- [x] Every client sees the same order, and clocks may disagree
- [ ] Clocks are always wrong
- [ ] It saves memory

Explanation: In 4D the server's order was B then A, and all clients follow it.

### A sender's ack is lost and it resends. Why is there no duplicate?

- [ ] The network drops copies
- [ ] The receiver's clock decides
- [x] The service finds the same client message id already stored
- [ ] Resends are forbidden

Explanation: The id `9f3a` maps to seq 41 again.

### One message to a group of 500 costs how many deliveries?

- [ ] 1
- [ ] 50
- [x] 500
- [ ] 5,000

Explanation: 4C: one stored copy, 500 deliveries.

## Diagram

```json
{ "kind": "graph", "caption": "The first design. A phone keeps a WebSocket to a connection server (1). That server passes messages to the chat service (2), which stores them (3) and looks up where each member is connected (4). Connection servers and stores sit in one data centre. A push service (5, dashed) wakes phones that are offline.", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "u", "label": "Phone", "x": 6, "y": 50, "shape": "client" }, { "id": "cs", "label": "Connection servers", "x": 32, "y": 50, "group": "dc" }, { "id": "ch", "label": "Chat service", "x": 60, "y": 50, "group": "dc" }, { "id": "ms", "label": "Message store", "x": 88, "y": 20, "shape": "database", "group": "dc" }, { "id": "lk", "label": "Lookup store", "x": 88, "y": 80, "shape": "cache", "group": "dc" }, { "id": "pu", "label": "Push service", "x": 60, "y": 90, "shape": "external" }], "edges": [{ "from": "u", "to": "cs", "step": 1 }, { "from": "cs", "to": "ch", "step": 2 }, { "from": "ch", "to": "ms", "step": 3 }, { "from": "ch", "to": "lk", "step": 4 }, { "from": "ch", "to": "pu", "step": 5, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path. A sends a message (1). The chat service stores it with the next seq (2, 3) and acks A (4). Only then does it ask the lookup store where B is (5, 6) and push to B (7). B acks the seq (8).", "actors": [{ "id": "a", "label": "Sender A" }, { "id": "c", "label": "Chat service" }, { "id": "s", "label": "Message store" }, { "id": "b", "label": "Receiver B" }], "messages": [{ "from": "a", "to": "c", "label": "send id 9f3a" }, { "from": "c", "to": "s", "label": "Store as seq 41" }, { "from": "s", "to": "c", "label": "Stored", "dashed": true }, { "from": "c", "to": "a", "label": "ack seq 41", "dashed": true }, { "from": "c", "to": "s", "label": "Where is B?" }, { "from": "s", "to": "c", "label": "Server 17", "dashed": true }, { "from": "c", "to": "b", "label": "Push seq 41" }, { "from": "b", "to": "c", "label": "ack seq 41", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path after being offline. B reconnects and says its last seq is 40 (1). The service reads messages after 40 from the store (2, 3) and pushes 41 and 42 in order (4, 5). B acks the last one (6).", "actors": [{ "id": "b", "label": "Receiver B" }, { "id": "c", "label": "Chat service" }, { "id": "s", "label": "Message store" }], "messages": [{ "from": "b", "to": "c", "label": "Connect, last seq 40" }, { "from": "c", "to": "s", "label": "Read after 40" }, { "from": "s", "to": "c", "label": "Seq 41, 42", "dashed": true }, { "from": "c", "to": "b", "label": "Push seq 41" }, { "from": "c", "to": "b", "label": "Push seq 42" }, { "from": "b", "to": "c", "label": "ack seq 42", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A connection server fails. The client sees the broken connection (1), waits a random time and connects to another server (2). It says its last seq (3) and gets the missed messages (4). Nothing was lost because messages were stored before delivery.", "actors": [{ "id": "p", "label": "Phone" }, { "id": "x", "label": "Server 17 (dead)" }, { "id": "y", "label": "Server 4" }, { "id": "c", "label": "Chat service" }], "messages": [{ "from": "p", "to": "x", "label": "Connection breaks" }, { "from": "p", "to": "y", "label": "Connect after random wait" }, { "from": "p", "to": "c", "label": "Last seq 40" }, { "from": "c", "to": "p", "label": "Seq 41 onward", "dashed": true }] }
```

## Diagram

```json
{ "kind": "layers", "caption": "How one conversation is stored. The partition key is the conversation, and inside it rows are sorted by seq, so 'after 40' is a short range read.", "layers": [{ "label": "Conversation c42 (one partition)" }, { "label": "seq 39: sender, text, time" }, { "label": "seq 40: sender, text, time" }, { "label": "seq 41: sender, text, time" }, { "label": "seq 42: sender, text, time" }] }
```
