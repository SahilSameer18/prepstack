---
id: hld-consistency-cap
title: Consistency Models, CAP and PACELC
next: hld-consensus-coordination
roadmapSteps: backend:database-design, devops-cloud:monitoring-reliability
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-phase1.md. Numbers from docs/content/checks/hld-check.py. -->

## Overview

When data is copied to several machines, a read can return an old value. "Consistency" is the name for what a system promises about that. Interviewers ask for the difference between strong and eventual consistency, what CAP really says, why "pick any two of three" is a trap, what PACELC adds, and whether R + W > N means strong consistency. After this section you can define the main models in plain words, state CAP exactly, classify a system with PACELC, and explain quorums and conflicts with a worked example.

## Topic: What "consistent" means

**Definition:** A consistency model says which answers a read may return. Definitions below are from the Jepsen consistency map and the Dynamo paper. Linearizable: every operation seems to happen at one instant, in one order, and if operation A finishes before B starts then B comes after A; to the clients it acts like one copy. Read your writes: after you write, your own later reads show that write (it speaks only about one client). Monotonic reads: reads by one client never go backwards to an older state. Causal: operations that depend on each other (a reply and the post it answers) appear in that order for everyone, while unrelated operations may appear in any order. Eventual (Dynamo's wording): every update reaches every replica (copy) some time later, with no promise about when.

**Why:** Each step down the ladder lets the system answer faster or keep answering during failures, so you should name the weakest promise your feature can live with.

**Example:** (assumption, made-up) Ana posts a comment. The write goes to the leader. She refreshes and the read goes to a follower that has not received the comment yet, so her own comment is missing. That is a break of read your writes. The sequence diagram below shows it. Jepsen's pages say read your writes and causal can be kept during a partition if each client keeps talking to the same server, while linearizable cannot.

**Failure:** Using "consistent" for three different things. The C in ACID (rules of the data stay valid), the C in CAP (linearizable) and "all copies agree" are not the same, so say which one you mean.

## Topic: CAP stated exactly

**Definition:** Gilbert and Lynch (2012, restating their proof) define the three terms for a service built from many servers. Consistency means atomic: the service behaves like a single copy where each operation takes effect at one instant. Availability means every request eventually gets a response. A partition means the servers split into groups and messages between the groups may be delayed or lost for ever. CAP theorem: in a network that can lose messages, no service can both be atomic and answer every request.

**Why:** The proof is short and worth saying aloud. Split the servers into {p1} and the rest. A write is acknowledged by p1. A read arrives at a server on the other side. Every message from p1 is lost, so that server cannot tell which value is current. It can answer anyway and risk a wrong answer, or never answer.

**Example:** The partition diagram below. Client 1 writes v1 to p1. The link from p1 to p2 is cut. Client 2 reads from p2. The choice for p2 is a possibly stale answer (gives up consistency) or no answer (gives up availability).

**Failure:** Gilbert and Lynch also note that with unbounded message delay the same wrong answer can happen when no message is really lost, because a server that waits long enough may decide to answer. Do not say CAP is only about cables being cut.

## Topic: What CAP does not say

**Definition:** Three common misreadings. (1) "Pick any 2 of 3." Brewer, who proposed CAP, wrote in 2012 that this wording is misleading: the real restriction is only that perfect consistency and perfect availability cannot both hold while a partition is happening, and partitions are rare. (2) "Drop partition tolerance and get CA." Gilbert and Lynch describe partition tolerance as a fact about the network: communication is unreliable. A system on such a network does not choose to avoid it. Kleppmann (2015) adds that the terms are used in inconsistent and ambiguous ways and proposes thinking about how much an operation's delay depends on network delay. (3) "CAP limits the system all the time." Abadi: CAP only talks about behaviour during failures and allows full ACID with high availability when there are no partitions.

**Why:** Brewer also says consistency and availability are not on or off. Availability runs from 0 to 100 percent, there are many consistency levels, and the choice can differ per operation. His advice is to detect a partition, enter a partition mode that limits some operations, and repair afterwards.

**Example:** Brewer's example: Facebook keeps one main copy and users read a nearby copy, but for about 20 seconds after you write, your reads go to the main copy so you see your own change.

**Failure:** Answering "MongoDB is CP" or "Cassandra is AP" as if each were fixed. Defaults and settings change, so say what the system does in a partition and what it does normally. The next topic gives the better vocabulary.

## Topic: PACELC

**Definition:** Abadi (2012) rewrote CAP as PACELC: if there is a Partition, choose Availability or Consistency; Else, when running normally, choose Latency (fast answers) or Consistency. The second half matters because copying data always forces a choice between waiting for copies (consistent, slower) and not waiting (fast, maybe stale).

**Why:** The "else" case is the one you live in most of the time, because partitions are rare. Abadi says this latency trade-off has arguably shaped system design more than CAP.

**Example:** Abadi's 2012 classification (of default settings, and defaults change): Dynamo, Cassandra and Riak are PA/EL; fully ACID systems such as VoltDB and Megastore are PC/EC; Bigtable and HBase are PC/EC; MongoDB is PA/EC; PNUTS is PC/EL. PC/EL does not mean fully consistent: PC means it does not lower consistency further during a partition, it gives up availability instead.

**Failure:** Treating this table as current. It is a 2012 paper; vendors have added settings since. Quote the year and say "by default".

## Topic: Quorums, R + W > N, and why it is not "strong"

**Definition:** With N replicas, a write waits for W acknowledgements and a read asks R replicas. If R + W > N, every read set and every write set share at least one replica. The script tried every pair of replica sets and confirmed it: for N = 3, (W=2, R=2), (W=1, R=3), (W=3, R=1) all overlap; (W=1, R=1) does not. Dynamo's most common setting is (N, R, W) = (3, 2, 2), which survives 1 replica down for reads and for writes. Cassandra's QUORUM level is a majority, so for 3 replicas it needs 2 on each side.

**Why:** Overlap means a read meets at least one replica that has the latest acknowledged write. Dynamo notes that latency is set by the slowest of the R or W replicas, which is why they are usually below N.

**Example:** N = 3, W = 2, R = 2. Write v2 reaches replicas 1 and 2 only. A read asks replicas 2 and 3. Replica 2 has v2, replica 3 has v1; the read returns v2 because it can tell which is newer.

**Failure:** The belief "R + W > N means strong consistency". Abadi says plainly that even with R + W > N these systems cannot reach the full consistency defined by Gilbert and Lynch, and a quorum protocol alone is not enough. Dynamo's own design shows why it is "stronger" but not "linearizable": its sloppy quorum may put a write on a stand-in node instead of the usual ones, so the usual read set may miss it, and it allows concurrent writes that give several versions. Say "stronger than R + W <= N, but not linearizable".

## Topic: Conflicts: last write wins or vector clocks

**Definition:** Two writes to the same key at the same time are a conflict. Last write wins (LWW) keeps the write with the bigger timestamp. Cassandra does this per column and its documentation says it needs synchronised clocks. A vector clock (Dynamo) is a list of (node, counter) pairs kept with each version; if one version's counters are all less than or equal to the other's, it is an ancestor and can be dropped; otherwise they conflict and both are kept for the application to merge.

**Why:** LWW is simple but can throw away a newer real write; vector clocks detect the conflict but hand the work to the application.

**Example:** (made-up, F3) Server A's clock runs 5 ms fast. A writes blue at true time 100 and stamps 105. Server B, accurate, writes green at true time 103 and stamps 103. LWW keeps blue, although green was later. Vector clocks (made-up, F2): write 1 at X is {X:1}; write 2 at X is {X:2}; write 3 at Y, which saw write 2, is {X:2, Y:1}; write 4 at Z, which also saw write 2, is {X:2, Z:1}. Writes 3 and 4 conflict. The client merges them and X writes {X:3, Y:1, Z:1}, which descends from both.

**Failure:** Dynamo's cart merge never loses an "add to cart", but the paper says deleted items can come back. A good answer says what the merge rule for the product is.

## Topic: What the product shows the user

**Definition:** Pick a model per feature. The Dynamo paper describes three ways Amazon teams used it: the application merges conflicts (the shopping cart), the store applies last write wins (customer session data), and a read-heavy catalogue with R = 1 and W = N. Dynamo's cart service measured 24 hours: 99.94 percent of requests saw one version, so conflicts were rare (2007, one service).

**Why:** A cart that refuses a write during a failure loses a sale; a bank balance that shows a stale value loses trust. The trade is made per feature.

**Example:** A "like" counter can be eventually consistent. Showing Ana her own comment needs read your writes. A seat booking needs one agreed answer, so it needs a stronger store or a single owner.

**Failure:** Saying the whole system must pick one. Gilbert and Lynch also say different data, operations or users in one system can be given different levels.

## Questions

### What does CAP say?

In a network that can lose messages, a service cannot both behave like one copy (linearizable) and answer every request. When a partition happens you must give up one. It says nothing about normal operation.

### Why is "pick any 2 of 3" misleading?

Because partitions are not optional on a real network, so the choice is only what to give up while a partition lasts, and both consistency and availability come in degrees (Brewer, Kleppmann).

### What does PACELC add?

Even with no partition there is a trade-off between latency and consistency, because waiting for copies costs time. A system is described by its choice in both cases, for example PA/EL.

### Does R + W > N give strong consistency?

No. It guarantees overlap between read and write sets, which is stronger than eventual, but Abadi says it does not give the full consistency of Gilbert and Lynch.

## Mistakes

- "CAP means choose two of three, so I will drop partition tolerance."
- "R + W > N means strong consistency."
- "MongoDB is CP" or any one-word label for a system. Abadi classes MongoDB's defaults as PA/EC and says defaults change.

## Quiz

### Which setting of (N, R, W) is the common one the Dynamo paper reports?

- [ ] (3, 1, 1)
- [x] (3, 2, 2)
- [ ] (5, 1, 5)
- [ ] (2, 1, 1)

Explanation: The paper says (3, 2, 2) is the common configuration. R + W = 4 is more than N = 3.

### In the proof sketch of CAP, why can the server not answer correctly?

- [ ] Because its clock is wrong
- [x] Because messages from the other side are lost, so it cannot know the latest write
- [ ] Because writes are not allowed
- [ ] Because all servers crashed

Explanation: With messages lost it cannot tell which value was written, so it must risk a wrong answer or not answer.

### In the clock example, which value does last write wins keep?

- [ ] green, because it was written later in real time
- [x] blue, because its stamp 105 is bigger than 103
- [ ] both
- [ ] neither

Explanation: Server A's clock is 5 ms fast, so blue gets stamp 105 although green came later at true time 103.

### What does PC/EL mean for PNUTS in Abadi's article?

- [ ] Fully consistent at all times
- [x] Gives up consistency for latency normally, and during a partition gives up availability rather than lower consistency further
- [ ] Always available
- [ ] No replication

Explanation: PC means no extra loss of consistency during a partition; it loses availability instead. It is not fully consistent.

### Which claim about R + W > N is right?

- [ ] It guarantees linearizability
- [ ] It guarantees nothing
- [x] Every read set meets every write set, yet it is not the full consistency of Gilbert and Lynch
- [ ] It removes conflicts

Explanation: The script checked the overlap for every pair, but Abadi says even then the full consistency is not reached.

## Diagram

```json
{ "kind": "sequence", "caption": "A read that breaks read your writes (made-up). Ana writes a name to the leader (1) and is told OK (2). Her next read goes to a follower (3) that has not yet received the copy, so it returns the old name (4). The copy arrives later (5).",
  "actors": [ { "id": "c", "label": "Ana" }, { "id": "l", "label": "Leader" }, { "id": "f", "label": "Follower" } ],
  "messages": [ { "from": "c", "to": "l", "label": "Write name = Ana" }, { "from": "l", "to": "c", "label": "OK", "dashed": true }, { "from": "c", "to": "f", "label": "Read name" }, { "from": "f", "to": "c", "label": "Old name (copy not here yet)", "dashed": true }, { "from": "l", "to": "f", "label": "Copy name = Ana (arrives late)", "dashed": true } ] }
```

## Diagram

```json
{ "kind": "graph", "caption": "A partition with two sides. Client 1 writes v1 to p1 (1). The messages between p1 and p2 are lost (dashed line). Client 2 reads from p2 (2). Server p2 can answer with an old value or not answer at all, which is the choice CAP describes.",
  "groups": [ { "id": "s1", "label": "Side 1" }, { "id": "s2", "label": "Side 2" } ],
  "nodes": [ { "id": "c1", "label": "Client 1", "x": 8, "y": 50, "shape": "client", "group": "s1" }, { "id": "p1", "label": "Server p1", "x": 30, "y": 50, "group": "s1" },
             { "id": "p2", "label": "Server p2", "x": 62, "y": 40, "group": "s2" }, { "id": "p3", "label": "Server p3", "x": 62, "y": 82, "group": "s2" }, { "id": "c2", "label": "Client 2", "x": 90, "y": 40, "shape": "client", "group": "s2" } ],
  "edges": [ { "from": "c1", "to": "p1", "step": 1, "label": "write v1" }, { "from": "p1", "to": "p2", "dashed": true, "label": "lost" }, { "from": "c2", "to": "p2", "step": 2, "label": "read" }, { "from": "p2", "to": "p3" } ] }
```

## Diagram

```json
{ "kind": "layers", "caption": "A ladder of consistency promises from stronger at the top to weaker at the bottom, as the Jepsen consistency map orders them: linearizable is stronger than sequential, sequential is stronger than causal, and causal includes read your writes. The lower the rung, the more a system can keep answering during a partition.", "layers": [ { "label": "Linearizable: acts like one copy, respects real time" }, { "label": "Sequential: everyone sees one order, real time ignored" }, { "label": "Causal: causes appear before effects (includes read your writes)" }, { "label": "Session promises: read your writes, monotonic reads" }, { "label": "Eventual: every update reaches every copy some time later" } ] }
```
