---
id: hld-consistency-cap
title: Consistency Models, CAP and PACELC
lastChecked: 2026-11-13
next: hld-consensus-coordination
roadmapSteps: backend:database-design, devops-cloud:monitoring-reliability
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

When data is copied to several machines, a read can return an old value. "Consistency" is what a system promises about that. Interviewers ask what CAP really says, why "pick any two of three" is a trap, what PACELC adds, and whether "read count plus write count bigger than copy count" (R + W > N) means strong consistency. After this section you can define the main models, state CAP exactly, classify a system with PACELC, and explain quorums and conflicts with an example.

## Topic: What "consistent" means

**Definition:** A consistency model says which answers a read may return. The first four come from the Jepsen consistency map (Jepsen is a group that tests databases); the last is Dynamo's wording.
- Linearizable: the system behaves as if there were one copy. Each operation seems to happen at one moment, and if A finishes before B starts, everyone sees A first.
- Sequential: everyone sees all operations in one order, which need not follow real time.
- Causal: operations that depend on each other (a reply and its post) appear in that order for everyone; unrelated ones may appear in any order.
- Read your writes: after you write, your own later reads show it. Monotonic reads: one client's reads never go back to an older state.
- Eventual: all updates reach all replicas (copies) eventually. Dynamo gives no time limit.

**Why:** Each step down lets the system answer faster or keep answering during failures. Name the weakest your feature can live with.

**Example:** (assumption, made-up) Ana posts a comment to the leader. She refreshes, and the read goes to a follower that has not received it yet, so her comment is missing. That breaks read your writes (see the sequence diagram). Jepsen says read your writes and causal can survive a network split if each client keeps the same server; linearizable cannot.

**Failure:** Using "consistent" for three things: the C in ACID (the usual promises of a database transaction: data rules stay valid), the C in CAP (linearizable) and "all copies agree". Say which one you mean.

## Topic: CAP stated exactly

**Definition:** Gilbert and Lynch (2012) define the terms. Consistency means atomic: the service behaves like a single copy. Availability means every request eventually gets a response. A network partition means the network splits the servers into groups, and messages between groups may be lost for ever. CAP theorem: in a network that can lose messages, no service can both be atomic and answer every request.

**Why:** The proof is short enough to say aloud. Cut server p1 off from all others. p1 acknowledges a write. A read arrives at a server on the other side. Every message from p1 is lost, so that server cannot know the current value. It can answer and risk being wrong, or never answer.

**Example:** In the partition diagram, client 1 writes v1 to p1 and the link from p1 to p2 is cut. Client 2 reads from p2. It can give a possibly stale answer (gives up consistency) or no answer (gives up availability).

**Failure:** With unbounded message delay the same wrong answer can happen even when no message is lost, because a server that waits long enough may decide to answer. 

## Topic: What CAP does not say

**Definition:** Three misreadings:
- "Pick any 2 of 3." Eric Brewer, who proposed CAP, wrote in 2012 that this wording is misleading. The limit is only that perfect consistency and perfect availability cannot both hold during a partition, and partitions are rare.
- "Drop partition tolerance and get CA." Martin Kleppmann (2015) reads partition tolerance as an assumption: partitions are among the faults the system must expect, not a feature you can switch off. A system called "CA" just stops working in a partition. That is a failure, not a safe third choice.
- "CAP limits the system all the time." Daniel Abadi: CAP only talks about failures. With no partition, full ACID with high availability is allowed.

**Why:** Brewer adds that consistency and availability come in degrees, and the choice can differ per operation. His advice: detect a partition, switch to a mode where some actions are refused, then repair.

**Example:** Brewer's example: Facebook keeps one main copy and users read a nearby copy, but for about 20 seconds after you write, your reads go to the main copy. The effect is read your writes.

**Failure:** Answering "MongoDB is CP" or "Cassandra is AP" as if each were fixed. Say what it does in a partition and what it does normally.

## Topic: PACELC

**Definition:** Abadi (2012) rewrote CAP as PACELC. If there is a Partition, choose Availability or Consistency; Else, when running normally, choose Latency (fast answers) or Consistency. So "PA/EL" means: in a partition favour Availability; normally favour Latency.

**Why:** The "else" case is the one you live in most of the time. Abadi says it has arguably shaped system design more than CAP.

**Example:** Abadi's 2012 classes, for default versions and original designs (he notes some settings became adjustable):
- Dynamo, Cassandra: PA/EL (available in a partition, fast normally).
- Bigtable, HBase: PC/EC (consistent in both cases).
- MongoDB: PA/EC.
- PNUTS (a Yahoo database): PC/EL.

PC does not mean fully consistent. It means no further loss of consistency in a partition: availability is given up instead.

**Failure:** Treating the list as current. It is from 2012. Quote the year and say "by default".

## Topic: Quorums, R + W > N, and why it is not "strong"

**Definition:** With N replicas (copies), a write waits for W acknowledgements and a read asks R replicas. If R + W > N, every read set and write set share at least one replica. For N = 3, listing every pair of sets shows (W=2, R=2), (W=1, R=3) and (W=3, R=1) all overlap; (W=1, R=1) does not. The Dynamo paper says (N, R, W) = (3, 2, 2) is the common configuration. With a strict quorum it survives 1 replica down for reads and for writes. Dynamo's sloppy quorum (a stand-in node takes the write when a usual node is down) tolerates more for writes.

**Why:** Overlap means a read meets at least one replica with the latest acknowledged write. The slowest of the R or W replicas sets latency, so they are usually below N.

**Example:** N = 3, W = 2, R = 2. Write v2 reaches replicas 1 and 2 only. A read asks replicas 2 and 3. Replica 2 has v2, replica 3 has v1. The read returns v2, the newer one.

**Failure:** The belief "R + W > N means strong consistency". Abadi says a quorum protocol alone is not enough for Gilbert and Lynch's consistency. This note's own reasoning for Dynamo: a stand-in node may hold a write outside the usual read set, and two clients can write at once and leave several versions. A strict quorum also needs extra steps to be linearizable.

## Topic: Conflicts: last write wins or vector clocks

**Definition:** Two writes to the same key at the same time are a conflict. Last write wins (LWW) keeps the write with the bigger timestamp. Cassandra does this per column and needs synchronised clocks. A vector clock (Dynamo) is a list of (server, counter) pairs kept with each version. If every counter of version 1 is no larger than the same counter in version 2, version 2 contains version 1, so version 1 can be dropped. Otherwise both are kept for the application to merge.

**Why:** LWW is simple but can lose a newer real write. Vector clocks detect the conflict but hand the work to the application.

**Example:** (made-up) LWW: server A's clock runs 5 ms fast. It writes blue at true time 100 and stamps 105. Accurate server B writes green at true time 103, stamp 103. LWW keeps blue, although green was later.

Vector clocks (made-up), servers X, Y, Z:
- Write 1 at X: {X:1}. Write 2 at X: {X:2}.
- Write 3 at Y, which saw write 2: {X:2, Y:1}. Write 4 at Z, which saw write 2: {X:2, Z:1}.
- Writes 3 and 4 conflict: neither contains the other. X merges them as {X:3, Y:1, Z:1}, which contains both.

**Failure:** Merging two carts keeps every item from both, so a removed item can come back (the Dynamo paper says so). Say what the merge rule is.

## Topic: What the product shows the user

**Definition:** Pick a model per feature. The Dynamo paper describes three uses at Amazon: the application merges conflicts (the shopping cart), the store applies last write wins (session data), and a read-heavy catalogue uses R = 1 and W = N. In 24 hours, 99.94 percent of cart requests saw one version (2007, one service).

**Why:** A cart that refuses a write loses a sale. A stale bank balance loses trust.

**Example:** (this note's own examples) A "like" counter can be eventually consistent. Ana seeing her own comment needs read your writes. A seat booking needs one agreed answer: a stronger store or a single owner.

**Failure:** Saying the whole system must pick one level. Different data, operations or users can get different levels (Gilbert and Lynch).

## Questions

### What does CAP say?

In a network that can lose messages, a service cannot both behave like one copy and answer every request. During a partition you give up one.

### Why is "pick any 2 of 3" misleading?

The real limit applies only while a partition lasts (Brewer). And partition tolerance is not a feature you can drop: partitions are among the faults the system must expect (Kleppmann).

### What does PACELC add?

Even with no partition, waiting for copies costs time: latency against consistency. A system is described by both choices, for example PA/EL.

### Does R + W > N give strong consistency?

No, not by itself. Every read set meets every write set, which is stronger than eventual. But Abadi says a quorum protocol alone is not enough for Gilbert and Lynch's consistency.

## Mistakes

- "CAP means choose two of three, so I will drop partition tolerance."
- "R + W > N means strong consistency."
- "MongoDB is CP" or any one-word label. Abadi's 2012 paper gives MongoDB's original default as PA/EC.

## Quiz

### Which setting of (N, R, W) does the Dynamo paper call the common configuration?

- [ ] (3, 1, 1)
- [x] (3, 2, 2)
- [ ] (5, 1, 5)
- [ ] (2, 1, 1)

Explanation: R + W = 4 is more than N = 3.

### In the proof sketch of CAP, why can the cut-off server not answer correctly?

- [ ] Because its clock is wrong
- [x] Because messages from the other side are lost, so it cannot know the latest write
- [ ] Because writes are not allowed
- [ ] Because all servers crashed

Explanation: It must risk a wrong answer or not answer.

### In the clock example, which value does last write wins keep?

- [ ] green, because it was written later in real time
- [x] blue, because its stamp 105 is bigger than 103
- [ ] both
- [ ] neither

Explanation: Server A's clock is 5 ms fast, so blue gets 105 although green came later.

### What does PC/EL mean for PNUTS in Abadi's article?

- [ ] Fully consistent and never fast
- [x] Fast but weaker normally; gives up availability in a partition
- [ ] Available in a partition, consistent normally
- [ ] No replication, so no trade-off

Explanation: PC means availability is given up in a partition; it is not fully consistent.

### Which claim about R + W > N is right?

- [ ] It guarantees linearizability
- [ ] It guarantees nothing
- [x] Read and write sets overlap, yet that alone is not full consistency
- [ ] It removes write conflicts

Explanation: Abadi says a quorum protocol alone is not enough.

## Diagram

```json
{ "kind": "sequence", "caption": "A read that breaks read your writes (made-up). Ana writes a name to the leader (1) and is told OK (2). Her next read goes to a follower (3) that has not yet received the copy, so it returns the old name (4). The copy arrives later (5).",
  "actors": [ { "id": "c", "label": "Ana" }, { "id": "l", "label": "Leader" }, { "id": "f", "label": "Follower" } ],
  "messages": [ { "from": "c", "to": "l", "label": "Write name = Ana" }, { "from": "l", "to": "c", "label": "OK", "dashed": true }, { "from": "c", "to": "f", "label": "Read name" }, { "from": "f", "to": "c", "label": "Old name, copy missing", "dashed": true }, { "from": "l", "to": "f", "label": "Copy name, late", "dashed": true } ] }
```

## Diagram

```json
{ "kind": "graph", "caption": "A partition with two sides. Client 1 writes v1 to p1 (1). The messages between p1 and p2 are lost (dashed line). Client 2 reads from p2 (2). Server p2 can answer with an old value or not answer at all, which is the choice CAP describes.",
  "groups": [ { "id": "s1", "label": "Side 1" }, { "id": "s2", "label": "Side 2" } ],
  "nodes": [ { "id": "c1", "label": "Client 1", "x": 8, "y": 50, "shape": "client", "group": "s1" }, { "id": "p1", "label": "Server p1", "x": 32, "y": 50, "group": "s1" },
             { "id": "p2", "label": "Server p2", "x": 66, "y": 50, "group": "s2" }, { "id": "c2", "label": "Client 2", "x": 92, "y": 50, "shape": "client", "group": "s2" } ],
  "edges": [ { "from": "c1", "to": "p1", "step": 1 }, { "from": "p1", "to": "p2", "dashed": true, "label": "lost" }, { "from": "c2", "to": "p2", "step": 2, "label": "read" } ] }
```

## Diagram

```json
{ "kind": "layers", "caption": "A ladder of consistency promises, stronger at the top. Linearizable, sequential and causal are in the order the Jepsen map gives, and causal implies read your writes and monotonic reads. Eventual consistency is not on that map; it is added here as the weakest promise (Dynamo's wording). The lower the rung, the more a system can keep answering during a partition.", "layers": [ { "label": "Linearizable: acts like one copy, respects real time" }, { "label": "Sequential: everyone sees one order, real time ignored" }, { "label": "Causal: causes appear before effects (includes read your writes)" }, { "label": "Session promises: read your writes, monotonic reads" }, { "label": "Eventual: all updates reach all copies, no time limit" } ] }
```
