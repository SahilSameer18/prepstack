---
id: hld-replication-partitioning
title: Replication, Sharding and Consistent Hashing
lastChecked: 2026-11-13
next: hld-consistency-cap
roadmapSteps: backend:database-design, devops-cloud:cloud-aws-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

Two ideas let a data system survive failures and grow past one machine. Replication keeps copies of the same data on several machines. Sharding (also called partitioning) splits the data so each machine holds a part. Interviewers ask which copy takes writes, what an acknowledged write guarantees, and why plain hash-mod-N breaks. After this section you can explain leaders and followers, quorums, range against hash sharding, hot partitions, and consistent hashing.

## Topic: Why replicate, and leader-follower replication

**Definition:** A replica is a copy of data on another machine. We replicate so the data survives a dead machine and more machines can serve reads. The cost: copies can disagree for a while. In leader-follower replication one copy (the leader) takes the writes and decides their order; the others (followers) copy it.

**Why:** One place that orders the writes keeps every copy in the same order. Kafka's design page calls a leader who chooses the order the simplest and fastest way.

**Example:** Three systems use this shape, with different details:
- Kafka (a message system): each partition (one slice of a topic) has one leader and zero or more followers. Writes go to the leader and followers pull the data. Replication factor 3 (copies, leader included) is 1 leader and 2 followers.
- GFS (Google's file system, 2003): the coordinator server (the paper calls it the master) gives a lease (a time-limited right, 60 seconds at first) to one copy, which orders the changes to a chunk (a big block of a file).
- Raft (a way for machines to agree): the leader adds a command to its log (an ordered list of commands) and sends it on. An entry is committed (safe) once a majority (more than half) has it: 3 of 5.

**Failure:** Describing leader-follower as one design. Say which system: Kafka uses in-sync followers, GFS a lease, Raft a majority.

## Topic: Synchronous or asynchronous, and the acknowledged write that is lost

**Definition:** Synchronous replication: the leader waits until the followers have the write before it answers "done". Asynchronous: it answers first and copies later. Abadi (2012) describes the trade-off: waiting keeps copies the same but is as slow as the slowest copy; not waiting is fast but the update may be only on the leader when the client hears "done". Kafka puts both on one dial, the `acks` setting of the producer (the program that sends data). With `acks=1` the leader answers after writing to its own log (its file of messages). With `acks=all` it answers when every in-sync replica (a follower that has kept up with the leader) has the message. Kafka calls a message committed when all in-sync replicas have it; consumers see only committed messages.

**Why:** Fast and safe pull in opposite directions. Dynamo's low write count W has the same risk.

**Example:** (assumption) A client writes x = 5 with `acks=1`. The leader saves it and answers "ok". The leader crashes before any follower copies it. In Kafka one server, the controller, watches the others and picks a new leader from the in-sync followers. That follower has no x = 5, so the acknowledged write is gone. With `acks=all` every in-sync follower would hold it.

**Failure:** Thinking more replicas always means more safety. Kafka's text gives a counter-case: with only one replica left in sync, `acks=all` still succeeds, and the write is lost if that replica also fails. The setting `min.insync.replicas` (only with `acks=all`) refuses writes when too few replicas are in sync, which protects data but makes the partition unavailable for writes. These are Kafka's rules, not general theory.

## Topic: Leaderless replication and quorums

**Definition:** In leaderless replication no copy is special. A coordinator (the node that handles a request) sends a write to all replicas and counts the answers. In Dynamo (Amazon, 2007):
- N nodes hold each key. A write succeeds when W of them have it; a read waits for R answers.
- If a node in the usual list is down, the next healthy node takes the write and keeps a hint to pass back when the first node returns. This is a sloppy quorum with hinted handoff.
- Replicas that still differ are fixed in the background by comparing Merkle trees (trees of hash values that show quickly which data differs). Dynamo and Cassandra call this anti-entropy.

Cassandra, which borrowed these ideas, lets the client choose how many replicas must answer: ONE, QUORUM (a majority) or ALL.

**Why:** No leader to lose means writes continue while some nodes are down. Consistency Models, CAP and PACELC shows when R + W > N makes a read meet the latest write.

**Example:** N = 3, W = 2: the write succeeds once 2 of the 3 nodes hold it; the third catches up later. With one node down the write still works.

**Failure:** Nobody decides an order: two clients can write the same key at once, leaving two versions to reconcile.

## Topic: Sharding by range or by hash, and the hot partition

**Definition:** Sharding splits the data so each shard (a part) lives on its own machines, and replication then copies each shard. Basics: Database Management Systems: Advanced Concepts. Range sharding keeps keys in sorted order and cuts them into ranges. Bigtable (Google, 2006) does this: rows are sorted by row key and a tablet is a row range, so reading a short range touches few machines. Hash sharding hashes the key first. Dynamo hashes the key with MD5 to pick the nodes; Cassandra hashes the partition key to a token.

**Why:** Range sharding makes range reads cheap; hash sharding spreads keys evenly. Name the access pattern before the choice.

**Example:** (assumption, made-up) 10,000 keys, 200,000 requests: key 1 is asked twice as often as key 2, three times as often as key 3, and so on. Hashed over 8 shards, the requests per shard were 17,464, 17,402, 28,427, 40,791, 15,837, 27,574, 26,244 and 26,261. A fair share is 200,000 / 8 = 25,000. The busiest shard got 40,791, which is 40,791 / 25,000 = 1.63 times the fair share. The hottest key alone got 10.2 percent of all requests.

**Failure:** A hot partition: one shard gets far more traffic than the rest. Hashing spreads different keys, but one very popular key still lives on one shard. Dynamo's paper assumes the traffic is not highly skewed (a few keys getting most of it), or that there are enough popular keys to spread. One key with 10 percent of all requests breaks that.

## Topic: Why hash mod N fails, and consistent hashing

**Definition:** The simple rule is shard number = hash(key) mod N, where N is the number of servers (mod is the remainder after division). It works until N changes. Take hash values 0 to 19 and change N from 4 to 5. A remainder is what is left after dividing: 17 divided by 4 leaves 1, but by 5 leaves 2, so hash 17 moves. Only hashes 0 to 3 keep the same remainder, so 16 of 20 move: 80 percent. A program over 100,000 keys found: 4 to 5 servers moves 80.0 percent, 10 to 11 moves 90.8, 100 to 101 moves 99.0.

Consistent hashing treats the hash output as a circle (a ring, where the largest value wraps to the smallest). Each node gets a position on the ring. A key belongs to the first node clockwise. With one position per server, a joining node takes keys only from its neighbour (Dynamo paper); with virtual nodes (many positions per server, tokens in Cassandra) it takes a little from each server. To place N copies of a key, take the next N different physical servers clockwise, skipping positions of a server already chosen (Dynamo's preference list). Cassandra notes that every token adds neighbours, which raises repair work.

**Why:** Adding a node should move about 1/(new count) of the keys, all taken by the new node. A node with one random position gets an uneven share, so virtual nodes even it out.

**Example:** (assumption, made-up) 100,000 keys on servers A to D, then E joins (ideal: 1/5 = 20.0 percent move). The moved share is near 20 percent but not exact, as positions are random.

| Positions per server | Keys moved | Busiest node (times average) | Quietest node |
|---|---|---|---|
| 1 | 17.3% | 2.00 | 0.07 |
| 10 | 25.0% | 1.64 | 0.49 |
| 100 | 19.3% | 1.14 | 0.89 |

Compare 80.0 percent for mod N. Every moved key went to E.

**Failure:** Believing more virtual nodes is always better: Cassandra lists extra repair costs. The ring does not remove hot keys, and moving data is slow: Dynamo's first scheme took almost a day to add a node in busy season, and the work ran at low priority.

## Questions

### Explain leader-follower replication and its risk.

The leader takes all writes and fixes their order; followers copy it. The risk is the gap between "acknowledged" and "copied": with an asynchronous setting such as Kafka's `acks=1`, a leader that crashes right after answering can lose that write. Waiting for in-sync followers closes the gap but adds latency.

### Why does hash mod N fail, and what fixes it?

Changing N changes nearly every remainder: 80 percent of keys move from 4 to 5 servers. Consistent hashing puts servers and keys on a ring, so a new server takes only the keys next to it, about 19.3 percent with 100 positions per server in the example.

### Range sharding against hash sharding?

Range keeps neighbouring keys together, good for range reads (Bigtable). Hash spreads keys evenly (Dynamo, Cassandra) but range reads touch many shards, and a popular key still makes a hot shard.

## Mistakes

- Saying hash sharding removes hot spots. One very popular key still lands on one shard.
- Believing more replicas always means more availability or safety.
- Saying consistent hashing means no data moves. About 1 divided by the new number of servers moves, and moving is slow and costly.

## Quiz

### Going from 4 to 5 servers with hash mod N, about how many keys move in the example run?

- [ ] 20.0 percent
- [ ] 50.0 percent
- [x] 80.0 percent
- [ ] 99.0 percent

Explanation: The ideal minimum is 1/5 = 20.0 percent. 99.0 percent is for 100 to 101 servers.

### In Kafka, what does `acks=1` mean?

- [ ] The producer waits for all in-sync replicas
- [x] The leader answers after writing to its own log only
- [ ] The message is never written to disk
- [ ] Followers must write before the leader

Explanation: The leader answers after its own write, so a leader crash before copying can lose the message.

### With one position per server, the busiest node had how much of the average load in the ring example?

- [ ] 1.14 times
- [ ] 1.64 times
- [x] 2.00 times
- [ ] 0.07 times

Explanation: 2.00 times with 1 position, 1.64 with 10 and 1.14 with 100 positions.

### In Dynamo, a key is stored on which nodes?

- [ ] Every node in the cluster
- [ ] The node with the closest hash value in either direction
- [x] The first N distinct nodes found walking clockwise on the ring
- [ ] Only a single leader chosen in advance

Explanation: The coordinator and its N-1 clockwise successors hold the key.

### Which statement about range sharding is right (Bigtable)?

- [ ] Rows are placed by a hash of the key
- [x] Rows are sorted by key and a tablet is a row range
- [ ] It cannot be split while running
- [ ] It needs a quorum for every read

Explanation: A short range of rows is on few machines.

## Diagram

```json
{ "kind": "graph", "caption": "A hash ring of servers A to D with a new server E (clockwise from top: A, B, C, E, D), one position per server. Key k is hashed to a spot on the ring and belongs to the first server clockwise from it, here B (1). When E joins between C and D, only D hands over keys, the ones between C and E, and the other servers keep theirs.",
  "nodes": [ { "id": "a", "label": "A", "x": 50, "y": 8 }, { "id": "b", "label": "B", "x": 90, "y": 50 }, { "id": "c", "label": "C", "x": 50, "y": 92 },
             { "id": "e", "label": "E (new)", "x": 22, "y": 78 }, { "id": "d", "label": "D", "x": 8, "y": 40 }, { "id": "k", "label": "Key k", "x": 78, "y": 22, "shape": "client" } ],
  "edges": [ { "from": "a", "to": "b" }, { "from": "b", "to": "c" }, { "from": "c", "to": "e" }, { "from": "e", "to": "d" }, { "from": "d", "to": "a" }, { "from": "k", "to": "b", "step": 1, "label": "first node clockwise" } ] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Asynchronous replication loses an acknowledged write (Kafka with acks=1, a made-up value x = 5). The client is told the write worked (2) after only the leader saved it. The leader crashes before copying. The controller sees that the leader's heartbeats (regular signs of life) have stopped and makes the follower the new leader (3). A later read finds x missing (4, 5).",
  "actors": [ { "id": "c", "label": "Client" }, { "id": "l", "label": "Leader" }, { "id": "f", "label": "Follower" }, { "id": "k", "label": "Controller" } ],
  "messages": [ { "from": "c", "to": "l", "label": "Write x = 5" }, { "from": "l", "to": "c", "label": "OK (leader only)", "dashed": true }, { "from": "k", "to": "f", "label": "Leader gone: lead" }, { "from": "c", "to": "f", "label": "Read x" }, { "from": "f", "to": "c", "label": "x missing (lost)", "dashed": true } ] }
```
