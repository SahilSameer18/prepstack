---
id: hld-replication-partitioning
title: Replication, Sharding and Consistent Hashing
next: hld-consistency-cap
roadmapSteps: backend:database-design, devops-cloud:cloud-aws-basics
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-phase1.md. Numbers from docs/content/checks/hld-check.py. -->

## Overview

Two ideas let a data system survive failures and grow past one machine. Replication keeps copies of the same data on several machines. Sharding (also called partitioning) splits the data so each machine holds only a part. Interviewers ask which copy takes writes, what an acknowledged write guarantees, how data is split, and why plain hash-mod-N breaks when a machine is added. After this section you can explain leaders and followers, quorums, range against hash sharding, hot partitions, and consistent hashing with its numbers.

## Topic: Why replicate, and leader-follower replication

**Definition:** A replica is a copy of data on another machine. We replicate so the data stays available when a machine dies and so reads can be served by more machines. The cost is that copies can disagree for a while. In leader-follower replication one copy (the leader) takes the writes and decides their order, and the others (followers) copy it. The same shape appears in different systems with different details. Kafka: each partition has one leader and zero or more followers, all writes go to the leader, reads can go to the leader or a follower, and followers pull the data from the leader. GFS (Google's file system, 2003): the master gives a lease (a time-limited right, 60 seconds at first and extended while writes continue) to one replica, the primary, which orders all changes to a chunk. Raft (a consensus algorithm, a way for machines to agree): the leader appends a command to its log (an ordered list of commands) and sends it to the other servers.

**Why:** One place that orders the writes keeps every copy in the same order, which is much simpler than letting every copy accept writes.

**Example:** Kafka with replication factor 3 (the number of copies, leader included) has 1 leader and 2 followers. Raft with 5 servers: an entry is committed (safe) once it is on a majority, which is 3 of 5, so up to 2 servers may be down (the majority maths is in the Consensus note).

**Failure:** Describing leader-follower as if it were one design. Say which system you mean: Kafka's rule is about in-sync followers, GFS uses a lease from a master, Raft uses a majority. Also say "leader and follower", not other words for them.

## Topic: Synchronous or asynchronous, and the acknowledged write that is lost

**Definition:** Synchronous replication: the leader waits until the followers have the write before it answers "done". Asynchronous: it answers first and copies later. Abadi (2012) describes the trade-off: waiting keeps copies the same but latency is set by the slowest copy; not waiting is fast but the update may be only on the leader when the client hears "done". Kafka shows both on one dial, the producer setting `acks`: with `acks=1` the leader answers after writing only to its own log; with `acks=all` it answers when all the in-sync replicas (followers that are close enough behind the leader) have the message. Kafka calls a message committed only when all in-sync replicas have it, and consumers only see committed messages.

**Why:** Fast answers and safe answers pull in opposite directions. Dynamo's paper makes the same point for its write count W: a low W means a write can be reported as done while only a few nodes hold it, so there is a window in which it can be lost.

**Example:** (assumption, made-up) A client writes x = 5 with `acks=1`. The leader saves it and answers "ok". The leader crashes before any follower copies it. A follower, which was in sync before the write, becomes the new leader. It has no x = 5, so the write the client was told about is gone. The sequence diagram below draws this. With `acks=all` the leader would have waited, so every in-sync follower would hold x = 5.

**Failure:** Thinking more replicas always means more safety or availability. Kafka's own text gives a counter-case: with only one replica left in sync, `acks=all` still succeeds, and the write can be lost if that replica also fails. The setting `min.insync.replicas` refuses writes when too few replicas are in sync, which protects the data but makes the partition unavailable for writes. These are Kafka's rules as written in its current design page, not general theory.

## Topic: Leaderless replication and quorums

**Definition:** In leaderless replication no copy is special; a client or a coordinator (the node that handles one request) sends a write to all replicas and counts the answers. Dynamo (Amazon, 2007) copies each key on N nodes. A write is reported successful when W of them have it, and a read waits for R answers. Apache Cassandra, which borrowed Dynamo's replication ideas, sends every write to all replicas and lets the client choose how many must answer, for example ONE, QUORUM (a majority) or ALL. Dynamo also uses a sloppy quorum: if a node in the usual list is down, the next healthy node takes the write and keeps a hint to pass it back when the first node returns (hinted handoff). Replicas that still differ are fixed in the background by comparing hash trees (Merkle trees), which Cassandra calls anti-entropy.

**Why:** No leader to lose means writes can continue while some nodes are down. The Consistency note (Consistency Models, CAP and PACELC) shows when R + W > N makes a read meet the latest write.

**Example:** N = 3, W = 2: the write is a success once 2 of the 3 nodes hold it, and the third catches up later. If one node is down the write still works.

**Failure:** No leader also means nobody decides an order. Two clients can write the same key at the same time, and the replicas end up with two versions that someone must reconcile. That is the conflict problem from the Consistency note.

## Topic: Sharding by range or by hash, and the hot partition

**Definition:** Sharding splits the data so each shard (a part) lives on its own machines, and replication then copies each shard. For the basics see Database Management Systems: Advanced Concepts (replication, partitioning and sharding); this note adds how real systems choose. Range sharding keeps keys in sorted order and cuts them into ranges. Bigtable (Google, 2006) does this: rows are sorted by row key and a tablet is a row range, so reading a short range of rows touches few machines. Hash sharding hashes the key first. Dynamo hashes the key with MD5 to a 128-bit number that picks the nodes. Cassandra hashes the partition key to a token.

**Why:** Range sharding makes range reads cheap. Hash sharding spreads keys evenly. Which fits depends on the access pattern, so name the pattern before the choice.

**Example:** (assumption, made-up) 10,000 different keys, 200,000 requests, with a few very popular keys (key number r is asked in proportion to 1/r). Hash them over 8 shards: the requests per shard are 17,464, 17,402, 28,427, 40,791, 15,837, 27,574, 26,244 and 26,261. The average is 200,000 / 8 = 25,000, so the busiest shard has 40,791 / 25,000 = 1.63 times the average. The single hottest key alone gets 10.2 percent of all requests.

**Failure:** A hot partition (one shard that gets far more traffic than the rest). Hashing spreads different keys, but one very popular key still lives on one shard. Dynamo's own paper says its scheme assumes the access pattern is not highly skewed.

## Topic: Why hash mod N fails

**Definition:** The simple rule is: shard number = hash(key) mod N, where N is the number of servers (mod is the remainder after division). It works until N changes.

**Why:** When N changes, almost every remainder changes, so almost every key must move to another server, which means a flood of data copying and cold caches.

**Example:** Take hash values 0 to 19 and change N from 4 to 5. Only hashes 0, 1, 2 and 3 have the same remainder under both (0 to 3 mod 4 equals 0 to 3 mod 5). The other 16 of 20 move, which is 80 percent. For 17: 17 mod 4 = 1 but 17 mod 5 = 2, so it moves; for 20: 0 and 0, so it stays. On 100,000 made-up keys with MD5 hashes the script gives: 4 to 5 servers moves 80.0 percent (the least possible is 1/5 = 20.0 percent); 10 to 11 moves 90.8 percent (least 9.1); 100 to 101 moves 99.0 percent (least 1.0).

**Failure:** Saying "we just add a server" with mod N. The interviewer's follow-up is "how many keys move?", and the answer is nearly all of them.

## Topic: Consistent hashing, the ring and virtual nodes

**Definition:** Consistent hashing treats the hash output as a circle (a ring, where the largest value wraps to the smallest). Each node gets a position on the ring. A key is hashed to a position and belongs to the first node you meet walking clockwise. When a node joins or leaves, only its immediate neighbour's keys are affected (Dynamo paper). A node with one random position gets an uneven share, so Dynamo gives each node many positions, called virtual nodes or tokens. Cassandra's documentation adds the cost: every token adds neighbours, which raises repair work and the chance of outages hitting shared ranges.

**Why:** Adding a node should move about 1/(new count) of the keys, taken only by the new node, not reshuffle everything.

**Example:** (assumption, made-up) 100,000 keys, servers A to D, then E joins (ideal: 1/5 = 20.0 percent of keys move). With 1 position per server 17.3 percent move and the busiest node has 2.00 times the average load (quietest 0.07). With 10: 25.0 percent move, busiest 1.64. With 100: 19.3 percent move, busiest 1.14, quietest 0.89. With 200: 18.6 percent, busiest 1.15. Compare 80.0 percent for mod N. In the run every moved key went to the new node E.

**Failure:** Believing more virtual nodes is always better: in this run 200 was no better than 100 for the busiest node, and Cassandra's documentation lists extra repair and neighbour costs. Also, the ring does not remove hot keys.

## Topic: Replica placement and resharding

**Definition:** To place N copies on the ring, walk clockwise and take the next N different physical servers, skipping virtual nodes of a server already chosen (Dynamo's preference list; Cassandra does the same). Dynamo spreads the list across data centres, and Cassandra's NetworkTopologyStrategy spreads replicas across racks. Resharding means changing how data is split while the system runs. Dynamo's new node receives key ranges from its neighbours, which offer and then transfer them after the new node confirms. The Dynamo paper reports that its first scheme made bootstrapping slow (almost a day in busy season), so it later moved to equal-size fixed partitions that can be moved as one file. Bigtable splits a tablet that has grown too large, and its reads and writes continue during splits. Spanner (2012) says it reshards data automatically.

**Why:** Data and traffic change, so the split must be able to change without a stop.

**Example:** (made-up, E2 in the script) With 5 servers and 100 positions each, the 3 copies of user-1 sit on A, D, C; user-2 on E, C, B; user-3 on D, C, B.

**Failure:** Claiming zero-cost resharding. Dynamo's account shows moving data is slow and must run at low priority so customers are not hurt. We leave out any zero-downtime recipe that no source we read describes.

## Questions

### Explain leader-follower replication and its risk.

The leader takes all writes and fixes their order, and followers copy it. The risk is the gap between "acknowledged" and "copied": with an asynchronous setting such as Kafka's `acks=1`, a leader that crashes right after answering can lose that write. Waiting for in-sync followers closes the gap but adds latency.

### Why does hash mod N fail, and what fixes it?

Changing N changes nearly every remainder, so about 80 percent of keys move when going from 4 to 5 servers in my run. Consistent hashing puts servers and keys on a ring, so a new server takes only the keys between it and its neighbour, about 19.3 percent with 100 virtual nodes in the run.

### Range sharding against hash sharding?

Range keeps neighbouring keys together, which is good for range reads (Bigtable). Hash spreads keys evenly (Dynamo, Cassandra) but makes range reads touch many shards, and a very popular key still makes a hot shard.

### What is a virtual node?

One server holding many positions on the ring. It evens out each server's share and spreads the load of a failed server over many others.

## Mistakes

- Saying hash sharding removes hot spots. One very popular key still lands on one shard (10.2 percent of all requests in the example).
- Believing more replicas always means more availability or safety. A rule such as Kafka's minimum in-sync replicas can refuse writes when too few replicas are in sync.
- Saying consistent hashing means no data moves. It means only about 1/N moves, and moving is still slow and costly.

## Quiz

### Going from 4 to 5 servers with hash mod N, about how many keys move in the script run?

- [ ] 20.0 percent
- [ ] 50.0 percent
- [x] 80.0 percent
- [ ] 99.0 percent

Explanation: The run moved 80.0 percent. The ideal minimum is 1/5 = 20.0 percent. The 99.0 percent figure is for 100 to 101 servers.

### In Kafka, what does `acks=1` mean?

- [ ] The producer waits for all in-sync replicas
- [x] The leader answers after writing to its own log only
- [ ] The message is never written to disk
- [ ] Followers must write before the leader

Explanation: With `acks=1` the leader answers after its own write, so a leader crash before copying can lose the message.

### With one position per server, the busiest node had how much of the average load in the ring run?

- [ ] 1.14 times
- [ ] 1.64 times
- [x] 2.00 times
- [ ] 0.07 times

Explanation: 2.00 times with 1 position, 1.64 with 10 and 1.14 with 100 positions.

### In Dynamo, a key is stored on which nodes?

- [ ] Every node in the cluster
- [ ] The node with the closest hash value in either direction
- [x] The first N distinct nodes found walking clockwise on the ring
- [ ] Only the leader chosen by a master

Explanation: The coordinator and its N-1 clockwise successors hold the key, skipping virtual nodes of the same physical node.

### Which statement about range sharding is right (Bigtable)?

- [ ] Rows are placed by a hash of the key
- [x] Rows are sorted by key and a tablet is a row range
- [ ] It cannot be split while running
- [ ] It needs a quorum for every read

Explanation: Bigtable keeps rows in sorted order, so a short range of rows is on few machines, and a tablet that grows too large is split.

## Diagram

```json
{ "kind": "graph", "caption": "A hash ring of servers A to D with a new server E (clockwise from top: A, B, C, E, D). Key k is hashed to a spot on the ring and belongs to the first server clockwise from it, here B (1). When E joins between C and D, only D hands over keys, the ones between C and E, and the other servers keep theirs.",
  "nodes": [ { "id": "a", "label": "A", "x": 50, "y": 8 }, { "id": "b", "label": "B", "x": 90, "y": 50 }, { "id": "c", "label": "C", "x": 50, "y": 92 },
             { "id": "e", "label": "E (new)", "x": 22, "y": 78 }, { "id": "d", "label": "D", "x": 8, "y": 40 }, { "id": "k", "label": "Key k", "x": 70, "y": 14, "shape": "client" } ],
  "edges": [ { "from": "a", "to": "b" }, { "from": "b", "to": "c" }, { "from": "c", "to": "e" }, { "from": "e", "to": "d" }, { "from": "d", "to": "a" }, { "from": "k", "to": "b", "step": 1, "label": "first node clockwise" } ] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Asynchronous replication loses an acknowledged write (Kafka with acks=1, a made-up value x = 5). The client is told the write worked (2) after only the leader saved it. The leader crashes before copying, so the controller picks the follower as new leader (3, 4), and a later read finds x missing (5, 6).",
  "actors": [ { "id": "c", "label": "Client" }, { "id": "l", "label": "Leader" }, { "id": "f", "label": "Follower" }, { "id": "k", "label": "Controller" } ],
  "messages": [ { "from": "c", "to": "l", "label": "Write x = 5" }, { "from": "l", "to": "c", "label": "OK (saved on leader only)", "dashed": true }, { "from": "k", "to": "l", "label": "Ping: no answer, leader is down" }, { "from": "k", "to": "f", "label": "You are the new leader" }, { "from": "c", "to": "f", "label": "Read x" }, { "from": "f", "to": "c", "label": "x not found (write lost)", "dashed": true } ] }
```
