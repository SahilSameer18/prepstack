---
id: hld-case-key-value-store
title: "Case Study: Distributed Key-Value Store"
lastChecked: 2026-11-13
next: hld-case-chat
roadmapSteps: backend:database-design, devops-cloud:cloud-aws-basics
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A key-value store (a database that finds a value by its key and nothing else) must keep working when machines fail. This note builds one design from stated assumptions, close to the Dynamo paper (2007), and says where it differs. The central trade-off is availability (the store keeps accepting requests) against consistency (every reader sees the same, latest value): this design stays writable during failures and lets copies disagree for a while. After this note you can explain the ring, quorums, hinted handoff, vector clocks and repair.

## Topic: Requirements and scope

**Definition:** We build `get(key)` and `put(key, value)` over many machines. Non-functional: always accept writes, grow by adding machines, survive a machine failing, and let the user tune how strict reads and writes are. Out of scope: transactions (several changes as one unit), range scans (reading all keys between two values), secondary indexes (finding values by something other than the key), and several data centres.

**Why:** Each item left out would add machinery. Ask first: "which is worse, a refused write or an old read?"

**Example:** (1) Small values. (2) Writes succeed while a copy is down. (3) Three copies per key. (4) Add machines live. (5) Tunable strictness.

**Failure:** If "never refuse a write" is not agreed, the answer becomes a different design (a strict one with a leader, see System Design: Consistency Models, CAP and PACELC).

## Topic: Numbers

**Definition:** Machine count and load. Assumptions: 10 TB of data, 3 copies of everything, 2 TB per machine kept under 60% full, 100,000 reads and 20,000 writes a second.

**Why:** They decide how many machines share the work.

**Example:**
- Data with copies: 10 TB x 3 = 30 TB. Usable per node: 2 TB x 0.6 = 1.2 TB. Nodes: 30 / 1.2 = 25.
- Each write goes to 3 copies: 20,000 x 3 = 60,000 replica writes a second.
- Each read asks 2 copies (R = 2, set below): 100,000 x 2 = 200,000 replica reads a second.
- Together 260,000 over 25 nodes is 10,400 operations a second per node.

**Failure:** If data were 10x larger, 250 nodes. If the load were 10x higher, per-node work would be 2,600,000 / 25 = 104,000 a second, so you add nodes for load, not only for size.

## Topic: API and data

**Definition:** `get(key)` returns one value or several conflicting values plus a context (a small label that records which version was read). `put(key, context, value)` stores a value. A record: key, value (bytes), version label (a vector clock, below). Dynamo (section 4.1) had this two-call interface.

**Why:** Only lookups by key are needed, so a hashed key can be placed on any machine without a central directory.

**Example:** `get("cart:42")` returns `["milk"]` with context c1; `put("cart:42", c1, ["milk", "eggs"])` writes the next version.

**Failure:** The store cannot answer "all carts that contain milk". A second system (see System Design: Choosing a Database) must do that.

## Topic: The first design

**Definition:** Every node is equal. N is the number of copies of each key (here 3); the key's preference list is the N nodes that hold them. W is how many copies must confirm a write before it counts as done; R is how many must answer a read. Such a required group is a quorum. A client sends a request to any node. That node, or if it is not in the key's list the first node of the list, acts as coordinator (the node that runs the request). See diagram 1.

**Why:** No leader means no single point of failure and no failover wait. Dynamo (2007) also let any node take a request.

**Example:** Write: (1) client sends `put`; (2) coordinator hashes the key onto the ring (next topic); (3) sends to the 3 nodes of the preference list; (4) replies when W have confirmed. Read: the same, with R replies. See diagrams 2 and 3.

**Failure:** The first bottleneck is the slowest of the W or R nodes a request waits for (Dynamo noted the same).

## Topic: Spreading and copying the data

**Definition:** A hash turns a key into a number. Place all numbers round a circle, the ring. Each machine sits at many points on it, called virtual nodes. A key is stored on the first node you meet going clockwise from its number. Copies go to the next different machines clockwise: the preference list. See System Design: Replication, Sharding and Consistent Hashing.

**Why:**
- Virtual nodes spread load (assumption: 5 servers, 100 virtual nodes each): adding a server moves 19.3% of keys against the ideal 20.0%, and the busiest node holds 1.14x the average. With 1 each, the busiest held 2.00x. Example: user-1 goes to A, D, C.
- The quorum rule: if R + W is more than N, at least one copy that took the latest write is among the copies asked for any read.
- A write succeeds if at least W of its 3 nodes are up. Assumption: each node is up with probability 0.99, failures independent. W = 1: 99.99990%. W = 2: 99.9702%. W = 3: 97.0299%. With W = 3 a write fails 2.97% of the time against 0.03% for W = 2, about 100 times more.
- Our choice: N = 3, W = 2, R = 2, the setting the Dynamo paper called common (section 6.1). 2 + 2 = 4 is more than 3, and one node can be down for reads and writes.
- Overlap alone does not make reads strongly consistent: with a sloppy quorum (counting nodes outside the list when listed ones are down) the latest write may sit outside the copies asked, and two simultaneous writes give conflicting versions (see System Design: Consistency Models, CAP and PACELC). This is our reasoning.

**Example:** A write to a key whose list is A, D, C: the coordinator sends to all three and replies after 2 confirm. Read: asks all three, waits for 2.

**Failure:** Rejected: hash mod M (M is the number of nodes). When a node is added, the divisor changes and almost every key moves. Where we differ from Dynamo: we use random positions per node, its first strategy. The paper later moved to equal-sized fixed pieces (section 6.2) because adding a node and recomputing repair trees were slow; we accept that cost.

## Topic: Staying correct after failures

**Definition:** Four tools.
- Hinted handoff: if a node in the list is down, the write goes to the next healthy node with a hint naming the intended owner; it hands the data over when the owner returns (Dynamo section 4.6).
- Vector clocks: a list of node and counter pairs on each version. Version A is newer than B if every counter in A is at least as big as in B. If neither is, they are in conflict, and the client merges them.
- Merkle-tree repair: split a key range into small groups, hash each group, then hash pairs of hashes up to one top hash. If two nodes' top hashes are equal, their data is equal; if not, compare the two halves, and go down to the groups that differ.
- Client merge, for example joining two carts.

**Why:** Without hinted handoff a strict quorum would refuse writes when a node is down. The cost: a sloppy quorum can place a write outside the list, so a read soon after may miss it (our reasoning). Hinted handoff works best when failures are short; for lasting ones Dynamo uses repair.

**Example:**
- Vector clocks (made-up object, servers X, Y, Z). Write 1 at X: {X:1}. Write 2 at X: {X:2}. Y saw write 2 and writes {X:2, Y:1}. Z saw write 2 and writes {X:2, Z:1}. The first has Y:1 and the second has no Y; the second has Z:1 and the first has no Z. Neither is bigger on every counter: conflict. The client merges them (for a cart, joins the items) and X writes {X:3, Y:1, Z:1}, bigger than both.
- Merkle tree (assumption: 1,048,576 keys in a range, 32-byte hashes, one key differs). 2^20 = 1,048,576, so 20 levels. At each level a node sends 2 child hashes: 2 x 20 = 40 hashes x 32 bytes = 1,280 bytes (the other node sends the same, plus the roots). Sending every key's hash would be 1,048,576 x 32 = 33.6 MB.

**Failure:** Merging can bring back deleted items: the paper said a deleted cart item can reappear when two versions are joined. Cassandra's documentation says it settles concurrent updates to a key with last-write-wins timestamps, not vector clocks. That can lose the later write when clocks differ (our example: server A's clock runs 5 ms fast and stamps "blue" 105 at true time 100; accurate server B stamps "green" 103 at true time 103; the larger stamp, "blue", wins).

## Topic: Failures and scaling

**Definition:** What fails: a node for minutes (hinted handoff), a node for good (repair on a replacement), and a whole data centre (out of scope here).

**Why:** A node down for good needs its data rebuilt from the other two copies. Dynamo used an administrator's command to add or remove a node, because short outages are common and should not move data.

**Example:** Node D is down while a client writes. The coordinator writes to A, C and the next healthy node with a hint for D (see diagram 4). The client sees success. When D returns, the hint is delivered and deleted.

**Failure:** At 10x traffic, add nodes; each takes keys from its neighbours. During the move, both old and new owners must serve reads (our reasoning). Repair traffic and hot keys become the next limits.

## Questions

### What does N = 3, W = 2, R = 2 give?

Three copies; a write needs 2 confirmations, a read 2 answers. They overlap (R + W > N), and one node can be down.

### Two clients write at once during a failure. What happens?

Both versions are kept; the vector clocks show a conflict; the next reader gets both and merges.

### Why Merkle trees?

They find which keys differ using few hashes: 40 for a million keys, instead of one per key.

## Mistakes

- "R + W > N gives strong consistency." It gives overlap only.
- "Last write wins is safe." Clocks differ, so the real later write can lose.
- "More copies always means more availability." W = 3 reduces write availability.

## Quiz

### Assumption: 10 TB of data, 3 copies, each node holds 2 TB but is kept under 60% full. How many nodes?

- [ ] 15
- [x] 25
- [ ] 30
- [ ] 50

Explanation: 30 TB / 1.2 TB = 25.

### What does a hinted handoff do?

- [ ] Deletes old data
- [x] Stores a write for a down node on another and hands it back later
- [ ] Locks the key
- [ ] Merges conflicts

Explanation: Dynamo section 4.6.

### Two copies of one key carry the version labels {X:2, Y:1} and {X:2, Z:1}. How do the two versions relate?

- [ ] First is newer
- [ ] Second is newer
- [x] Conflict
- [ ] Equal

Explanation: Each has a counter the other lacks, so neither is bigger on every counter.

### Each node is up 99% of the time. Which setting gives the lowest chance that a write succeeds?

- [ ] W = 1
- [ ] W = 2
- [x] W = 3
- [ ] All the same

Explanation: W = 3 needs all 3 nodes: 97.0299%.

### A key range of 1,048,576 keys is compared with a Merkle tree of 20 levels, and one node sends 2 hashes per level. How many hashes does it send?

- [ ] 1,048,576
- [x] 40
- [ ] 20,000
- [ ] 1

Explanation: 2 x 20 = 40 hashes, 1,280 bytes.

## Diagram

```json
{ "kind": "graph", "caption": "The first design. A client sends a request (1) to any node; if that node is not in the key's list it forwards to the first node of the list, which acts as coordinator. The coordinator sends the request to the three nodes of the key's list (2). All nodes are equal and there is no leader.", "groups": [{ "id": "ring", "label": "Cluster" }], "nodes": [{ "id": "c", "label": "Client", "x": 6, "y": 50, "shape": "client" }, { "id": "k", "label": "Coordinator", "x": 36, "y": 50, "group": "ring" }, { "id": "a", "label": "Node A", "x": 74, "y": 14, "shape": "database", "group": "ring" }, { "id": "d", "label": "Node D", "x": 74, "y": 50, "shape": "database", "group": "ring" }, { "id": "e", "label": "Node C", "x": 74, "y": 86, "shape": "database", "group": "ring" }], "edges": [{ "from": "c", "to": "k", "step": 1 }, { "from": "k", "to": "a", "step": 2 }, { "from": "k", "to": "d", "step": 2 }, { "from": "k", "to": "e", "step": 2 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write with W = 2. The coordinator sends the value to the three copies; two are drawn and the third works the same. After two confirm, it tells the client the write succeeded. The third copy may confirm later.", "actors": [{ "id": "c", "label": "Client" }, { "id": "k", "label": "Coordinator" }, { "id": "a", "label": "Copy 1" }, { "id": "b", "label": "Copy 2" }], "messages": [{ "from": "c", "to": "k", "label": "put(key, value)" }, { "from": "k", "to": "a", "label": "Write" }, { "from": "k", "to": "b", "label": "Write" }, { "from": "a", "to": "k", "label": "Done", "dashed": true }, { "from": "b", "to": "k", "label": "Done", "dashed": true }, { "from": "k", "to": "c", "label": "Success (W = 2)", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read with R = 2. The coordinator asks the copies and waits for two answers. If they hold versions that conflict, it returns both to the client with their context so the client can merge.", "actors": [{ "id": "c", "label": "Client" }, { "id": "k", "label": "Coordinator" }, { "id": "a", "label": "Copy 1" }, { "id": "b", "label": "Copy 2" }], "messages": [{ "from": "c", "to": "k", "label": "get(key)" }, { "from": "k", "to": "a", "label": "Read" }, { "from": "k", "to": "b", "label": "Read" }, { "from": "a", "to": "k", "label": "Version 1", "dashed": true }, { "from": "b", "to": "k", "label": "Version 2", "dashed": true }, { "from": "k", "to": "c", "label": "Both, if conflict", "dashed": true }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Hinted handoff. Node D is down. The coordinator writes to A and C (1, 2) and to the next healthy node E with a hint that the copy belongs to D (3). When D returns, E hands the data back (4, dashed).", "nodes": [{ "id": "k", "label": "Coordinator", "x": 10, "y": 50 }, { "id": "a", "label": "Node A", "x": 50, "y": 12, "shape": "database" }, { "id": "c", "label": "Node C", "x": 50, "y": 50, "shape": "database" }, { "id": "e", "label": "Node E + hint", "x": 50, "y": 88, "shape": "database" }, { "id": "d", "label": "Node D (was down)", "x": 90, "y": 88, "shape": "external" }], "edges": [{ "from": "k", "to": "a", "step": 1 }, { "from": "k", "to": "c", "step": 2 }, { "from": "k", "to": "e", "step": 3 }, { "from": "e", "to": "d", "step": 4, "dashed": true }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "Merkle-tree repair. Two nodes compare the top hash of a key range. If it differs, they compare the next level, and repeat for 20 levels until they reach the one key that differs. Only that key is copied.", "steps": [{ "label": "Compare top hash" }, { "label": "Differs: compare children" }, { "label": "Walk down 20 levels" }, { "label": "Copy the one key" }] }
```
