---
id: hld-case-key-value-store
title: "Case Study: Distributed Key-Value Store"
next: hld-case-chat
roadmapSteps: backend:database-design, devops-cloud:cloud-aws-basics
---
<!-- Draft 13 Nov 2026, not published. Numbers from docs/content/checks/hld-case-check.py (3A to 3E) and hld-check.py (E1, E2, F1, F2). Design follows the Dynamo paper (2007, sections 4.1 to 4.7, 6.1, 6.2) and says where it differs. -->

## Overview

A key-value store (a database that finds a value by its key and nothing else) must keep working when machines fail. This note builds one design from stated assumptions, close to the one the Dynamo paper described, and says where it differs. The central trade-off is availability against consistency: this design stays writable during failures and lets copies disagree for a while. After this note you can explain the ring, quorum choices, hinted handoff, vector clocks and repair.

## Topic: Requirements and scope

**Definition:** We build `get(key)` and `put(key, value)` over many machines. Non-functional: always accept writes, grow by adding machines, survive a machine failing, and let the user tune how strict reads and writes are. Out of scope: transactions (several changes as one unit), range scans, secondary indexes, and several data centres.

**Why:** Each item left out would add its own machinery. Ask first: "which is worse, a refused write or an old read?"

**Example:** (1) A value up to a small size. (2) Writes succeed while a copy is down. (3) Each key has 3 copies. (4) Add a machine without stopping. (5) The client can tune strictness.

**Failure:** If "never refuse a write" is not agreed, the answer becomes a different design (a strict one with a leader, see System Design: Consistency and CAP). The follow-up: what does the client see when two writes clash?

## Topic: Numbers

**Definition:** Machine count and load. Assumptions (3A, 3E): 10 TB of data, 3 copies, 2 TB per machine kept under 60% full, 100,000 reads and 20,000 writes a second.

**Why:** They decide how many machines share the work and how many operations each handles.

**Example:** 10 TB with 3 copies is 30 TB. Each node uses at most 2 × 0.6 = 1.2 TB, so 30 / 1.2 = 25 nodes (3A). Each write goes to 3 copies: 60,000 replica writes a second. Reads that ask 2 copies: 200,000 replica reads. Together 260,000 over 25 nodes is 10,400 operations a second per node (3E).

**Failure:** If data were 10x larger, 250 nodes. If the load were 10x higher, per-node work would be 104,000 a second, so you add nodes for load, not only for size.

## Topic: API and data

**Definition:** `get(key)` returns one value or several conflicting values plus a context (a small label that records which version was read). `put(key, context, value)` stores a value. A record: key, value (bytes), version label (a vector clock, below). The Dynamo paper (section 4.1) described this same two-call interface.

**Why:** Only lookups by key are needed, so the key can be hashed and placed on any machine without a central directory.

**Example:** `get("cart:42")` returns `["milk"]` with context c1; `put("cart:42", c1, ["milk", "eggs"])` writes the next version.

**Failure:** The store cannot answer "all carts that contain milk". A second system (see System Design: Choosing Databases) must do that.

## Topic: The first design

**Definition:** Every node is equal. A client sends a request to any node; that node, or the first node in the key's list of replicas, acts as coordinator (the node that runs the request) and talks to the copies. See diagram 1.

**Why:** No leader means no single point of failure and no failover wait. Dynamo (2007) also let any node take a request, and either forwarded it or a client library sent it straight to the coordinator.

**Example:** Write: (1) client sends `put`; (2) coordinator hashes the key onto the ring; (3) sends to the 3 nodes of the preference list; (4) replies when W have confirmed. Read: the same with R replies. See diagrams 2 and 3.

**Failure:** The first bottleneck is the slowest of the W or R nodes a request waits for. Dynamo noted the same.

## Topic: Spreading and copying the data

**Definition:** The ring (hash positions on a circle) maps a key to the first node clockwise. Each machine takes many positions, called virtual nodes. Copies go to the next machines clockwise, skipping repeats of one machine: the preference list, N = 3. See System Design: Replication and Partitioning, which teaches these ideas and E1, E2, F1.

**Why:** Virtual nodes spread load. E1 (assumption: 5 servers, 100 virtual nodes each): adding a server moves 19.3% of keys against the ideal 20.0%, and the busiest node holds 1.14x the average. With 1 each the busiest held 2.00x. Examples from E2: user-1 goes to A, D, C. The choice of quorum (3B, assumption: each node up with probability 0.99, independent): W = 1 succeeds 99.99990%; W = 2, 99.9702%; W = 3, 97.0299%. When R + W > N every read set meets every write set (F1). I choose N = 3, W = 2, R = 2, the setting the Dynamo paper called common (section 6.1), which survives one node down for reads and writes. R + W > N does not make reads strongly consistent (see System Design: Consistency and CAP).

**Example:** A write to a key whose list is A, D, C: the coordinator sends to all three and replies after 2 confirm. Read: asks all three, waits for 2.

**Failure:** Rejected: hash mod N, which moves almost every key when N changes. Where I differ from Dynamo: I use random positions per node (its first strategy). The paper moved to equal-sized fixed partitions (section 6.2) because bootstrapping and Merkle-tree recalculation were slow; I stay simple and accept that cost.

## Topic: Staying correct after failures

**Definition:** Four tools. Hinted handoff: if a node in the list is down, the write goes to the next healthy node with a hint naming the intended owner; it hands the data over when the owner returns (Dynamo 4.6). Vector clocks (a list of node and counter pairs on each version): they show whether one version came from another or whether two are in conflict. Merkle-tree repair (below). Client merge.

**Why:** Without hinted handoff a strict quorum would refuse writes when a node is down. The cost: a "sloppy" quorum (the paper's term) can accept a write on nodes outside the list, so a read soon after may miss it. Dynamo also said hinted handoff works best when failures are short; for lasting ones it uses repair.

**Example:** F2 trace, made-up object. Write 1 at X: {X:1}. Write 2 at X: {X:2}. Y saw write 2 and writes: {X:2, Y:1}. Z saw write 2 and writes: {X:2, Z:1}. Neither descends from the other: conflict. The client reads both, merges them (for a cart, joins the items), and X writes {X:3, Y:1, Z:1}, which descends from both. Merkle tree (3C, assumption: 1,048,576 keys in a range, 32-byte hashes, one key differs): 20 levels; comparing roots then walking down takes 40 hashes, 1,280 bytes, instead of 33.6 MB for every key's hash. The cost of W = 3: a write fails if any copy is down, so 2.97% of writes fail against 0.03% for W = 2 (3B), about 100 times more.

**Failure:** Merging can bring back deleted items (the paper said so for carts). Cassandra's documentation says it does not use vector clocks but last-write-wins timestamps, which can lose a later write when clocks differ (F3). Clock sizes can grow: Dynamo cut the oldest pair past a threshold, such as 10.

## Topic: Failures and scaling

**Definition:** What fails: a node for minutes (hinted handoff), a node for good (repair on a replacement), and a whole data centre (out of scope here).

**Why:** A node that is down for good needs its data rebuilt from the other two copies. Dynamo used an explicit command from an administrator to add or remove a node, because short outages are common and should not trigger moving data.

**Example:** Node D is down while a client writes. The coordinator writes to A, C and the next healthy node with a hint for D (see diagram 4). The client sees success. When D returns, the hint is delivered and deleted. A replacement for a lost node copies its ranges, comparing Merkle trees to find differences.

**Failure:** At 10x traffic, add nodes; each takes keys from its neighbours. During the move, both old and new owners must serve reads. At 10x, repair traffic and hot keys become the next limits.

## Questions

### What does N = 3, W = 2, R = 2 give?

Three copies; a write needs 2 confirmations, a read 2 answers. They overlap (R + W > N), and one node can be down.

### Two clients write at once during a failure. What happens?

Both versions are kept; the vector clocks show a conflict; the next reader gets both and merges.

### Why Merkle trees?

They find which keys differ using few hashes (3C: 40 hashes instead of one per key).

### Why not W = 3?

Any one copy down fails the write: 2.97% against 0.03% of writes (3B).

## Mistakes

- "R + W > N gives strong consistency." It gives overlap only.
- "Last write wins is safe." Clocks differ (F3).
- "More copies always means more availability." W = 3 reduces write availability.

## Quiz

### 10 TB, 3 copies, 2 TB nodes kept under 60% full. How many nodes?

- [ ] 15
- [x] 25
- [ ] 30
- [ ] 50

Explanation: 3A: 30 / 1.2 = 25.

### What does a hinted handoff do?

- [ ] Deletes old data
- [x] Stores a write for a down node on another and hands it back later
- [ ] Locks the key
- [ ] Merges conflicts

Explanation: Dynamo section 4.6.

### Versions {X:2, Y:1} and {X:2, Z:1}. Relationship?

- [ ] First is newer
- [ ] Second is newer
- [x] Conflict
- [ ] Equal

Explanation: F2.

### Which write has the lowest chance of success when each node is up 99%?

- [ ] W = 1
- [ ] W = 2
- [x] W = 3
- [ ] All the same

Explanation: 3B: 97.0299%.

### How many hashes does the 3C walk need?

- [ ] 1,048,576
- [x] 40
- [ ] 20,000
- [ ] 1

Explanation: 3C: 40 hashes, 1,280 bytes.

## Diagram

```json
{ "kind": "graph", "caption": "The first design. A client sends a request (1) to any node, which becomes coordinator. It sends the request to the three nodes of the key's list (2). All nodes are equal and there is no leader.", "groups": [{ "id": "ring", "label": "Cluster" }], "nodes": [{ "id": "c", "label": "Client", "x": 6, "y": 50, "shape": "client" }, { "id": "k", "label": "Coordinator", "x": 36, "y": 50, "group": "ring" }, { "id": "a", "label": "Node A", "x": 74, "y": 14, "shape": "database", "group": "ring" }, { "id": "d", "label": "Node D", "x": 74, "y": 50, "shape": "database", "group": "ring" }, { "id": "e", "label": "Node C", "x": 74, "y": 86, "shape": "database", "group": "ring" }], "edges": [{ "from": "c", "to": "k", "step": 1 }, { "from": "k", "to": "a", "step": 2 }, { "from": "k", "to": "d", "step": 2 }, { "from": "k", "to": "e", "step": 2 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write with W = 2. The coordinator sends the value to the three copies. After two confirm, it tells the client the write succeeded. The third copy may confirm later.", "actors": [{ "id": "c", "label": "Client" }, { "id": "k", "label": "Coordinator" }, { "id": "a", "label": "Copy 1" }, { "id": "b", "label": "Copy 2" }], "messages": [{ "from": "c", "to": "k", "label": "put(key, value)" }, { "from": "k", "to": "a", "label": "Write" }, { "from": "k", "to": "b", "label": "Write" }, { "from": "a", "to": "k", "label": "Done", "dashed": true }, { "from": "b", "to": "k", "label": "Done", "dashed": true }, { "from": "k", "to": "c", "label": "Success (W = 2)", "dashed": true }] }
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
{ "kind": "flow", "caption": "Merkle-tree repair (3C). Two nodes compare the top hash of a key range. If it differs, they compare the next level, and repeat for 20 levels until they reach the one key that differs. Only that key is copied.", "steps": [{ "label": "Compare top hash" }, { "label": "Differs: compare children" }, { "label": "Walk down 20 levels" }, { "label": "Copy the one key" }] }
```
