---
id: dbms-advanced-concepts
title: Advanced Concepts
lastChecked: 2026-11-10
next: none
roadmapSteps: backend:database-design
---

<!-- Published 10 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date this section was checked against its sources by the author, not by a second person.
     Written from docs/content/source-notes/dbms-batch-d.md (S1d slides ch15, ch16, ch21; S7d Wikipedia CAP, shard, replication; S2d PostgreSQL chapter 26) and dbms-batch-c.md (S2c EXPLAIN, S8c MySQL EXPLAIN).
     Claims and sources: docs/content/SOURCES.md (rows for dbms-advanced-concepts). When an outside reader has gone through it, fill the "Checked by" cells of those rows. -->

## Overview

This section covers what a database does behind the scenes and what happens when one machine is not enough. Interviewers ask about query optimization to see whether you can read a plan, and about replication (keeping copies), sharding (splitting data) and the CAP theorem to see whether you can reason about trade-offs in a distributed system (one spread over several machines). After this section you can explain how a query is optimized, read the cost numbers of an EXPLAIN plan, name the join algorithms, contrast replication with sharding, and state the CAP theorem correctly, without the "pick any two" shortcut.

## Topic: How a query is optimized

**Definition:** The query processor translates a query, conceptually into relational algebra (the mathematical form of a query). Then the optimizer picks the cheapest plan from many equivalent ones. A plan says which algorithm to use for each operation. The cost of each plan is estimated from statistics kept in the catalog (the database's own records about its tables), such as the number of rows and the number of distinct values of a column.

**Why:** The difference between two plans for the same query can be enormous, in some cases seconds versus days.

**Example:** Find the titles of courses taught by Music instructors, with 1,000 instructors (20 in Music), 4,000 teaches rows and about 4 teaches rows per instructor (an invented illustration). Joining instructor and teaches first creates an intermediate result (a temporary table between steps) of 4,000 rows, and then the Music filter cuts it to 80. Filtering instructors to Music first gives 20 rows, and joining those with teaches gives 80 rows at once. Doing the selection (the filter) as early as possible is called pushing the selection down.

**Failure:** The optimizer chooses the lowest estimated cost, and estimates come from statistics that can be inaccurate. Join order matters too. A good plan computes the join with the smallest intermediate result first, and the optimizer searches for such orders using estimated costs. Equivalence rules (rules for rewriting a query without changing its answer) do not hold for every operation. For example, an outer join is not the same as an inner join with the same filter, and outer joins are not associative (changing the grouping of joins can change the result).

## Topic: Reading a query plan with EXPLAIN

**Definition:** EXPLAIN shows the plan the optimizer chose, as a tree of operations with cost estimates. PostgreSQL's EXPLAIN ANALYZE also runs the query and adds the real timings.

**Why:** It is how you find out whether an index (a lookup structure that speeds up searches) is used.

**Example:** In PostgreSQL, EXPLAIN SELECT * FROM tenk1 on a 10,000-row table prints Seq Scan on tenk1 (cost=0.00..445.00 rows=10000 width=244). Seq Scan means reading the whole table row by row. The two cost numbers are the estimated start-up cost and total cost. The 445 is 345 pages at 1.0 each plus 10,000 rows at 0.01 each. Adding WHERE unique1 = 42 gives Index Scan (a search through an index) using tenk1_unique1 with cost 0.29..8.30 and one row, far cheaper than reading the whole table.
```sql
EXPLAIN SELECT * FROM tenk1 WHERE unique1 = 42;
```

**Failure:** Costs are in arbitrary units that only make sense as a comparison between plans. A parent node's cost includes its children. MySQL has EXPLAIN too, with traditional, JSON and tree output formats, and the details of the output differ between databases.

## Topic: Join algorithms

**Definition:** The same join can be run in different ways. A nested-loop join compares every row of one table with every row of the other and needs no index. A block nested-loop join does the same one block (a chunk of rows read from disk together) at a time. An indexed nested-loop join uses an index on the inner table. A merge join needs both inputs sorted on the join key. A hash join builds a hash table (a lookup table keyed by a hash of the value) on one input.

**Why:** The right algorithm depends on table sizes, indexes and the join condition, and it is the optimizer's choice.

**Example:** The textbook's example: 5,000 student rows in 100 blocks and 10,000 takes rows in 400 blocks. A worst-case nested-loop join with student as the outer table needs 5,000 x 400 + 100 = 2,000,100 block transfers (disk reads). If the smaller table, student, fits in memory, it needs only 100 + 400 = 500.

**Failure:** A plain nested loop works for any join condition but is expensive. Merge and hash joins usually need equality conditions on the join keys. Interview answer: the database picks the algorithm, and you influence it with indexes and with queries that let the optimizer use them.

## Topic: Replication

**Definition:** Replication keeps copies of the same data on several servers. In a single-leader (primary-replica) setup, the leader takes the writes and sends the changes to the replicas, which mostly serve reads.

**Why:** It gives availability (the service keeps working) when a machine fails, lower latency (shorter waiting time) when a copy is nearby, and more read capacity.

**Example:** One primary and two replicas. A write goes to the primary and is copied to both. Replicas can answer reads. If the primary fails, a replica has to be promoted, which needs a failover procedure (switching over to a backup). Replication is usually two or three copies, in one data centre to survive machine failures or in several to survive a data-centre failure.

**Failure:** Synchronous replication waits until the copies have the change before the commit finishes, so a failover loses nothing, but it is slower. PostgreSQL's manual says a fully synchronous setup over a slow network might cut performance by more than half. Asynchronous replication does not wait, so a replica can serve slightly stale (out of date) reads (replication lag) and some committed transactions can be lost on a failover. Multi-leader setups accept writes on several nodes and need conflict handling such as last-write-wins (the newest write is kept).

## Topic: Partitioning and sharding

**Definition:** Partitioning splits a table into pieces. Horizontal partitioning splits by rows. A horizontal partition, often kept on its own server, is called a shard. Vertical partitioning splits by columns.

**Why:** One machine eventually cannot hold all the data or take all the load. Shards also make tables and indexes smaller.

**Example:** With 3 nodes and a hash of user_id mod 3 (the remainder after dividing by 3), the user with id 7 goes to node 1, and the user with id 9 goes to node 0. A lookup of one user visits one node. A range query on user_id from 7 to 9 has to ask all three. With range partitioning (each node holds a range of values) and a partitioning vector [5, 11], value 2 goes to node 0, value 8 to node 1 and value 20 to node 2, so a range query touches only a few nodes.
```text
hash: point query = 1 node, range query = all nodes
range: point query = 1 node, range query = a few nodes; a range query that fetches many blocks is served by few nodes, which wastes parallelism
```

**Failure:** Sharding makes queries more complex. A query that joins across shards is harder, backups need coordination, and schema changes (changes to the table layout) are harder. Replication copies the same data, and sharding splits different data. They are often combined, with each shard replicated. A commonly given advice is to shard only after cheaper optimizations have been tried.

## Topic: The CAP theorem

**Definition:** The CAP theorem says a distributed data store (a database spread over several machines) can provide at most two of three guarantees: consistency (every read gets the latest write or an error), availability (every request to a working node gets a response, not necessarily with the latest data) and partition tolerance (it keeps working when messages are lost or delayed).

**Why:** It forces a design decision for when the network splits (a network partition).

**Example:** Two data centres lose their connection. If a client writes to one, the system must choose. It can refuse requests that could not be consistent (keep consistency, lose availability), or answer from each side with possibly different data (keep availability, risk inconsistency). Without a partition, a system can have both.

**Failure:** "Pick any two of three" is misleading. Partitions cannot be avoided in a real distributed system, so partition tolerance is generally required and the real choice is between consistency and availability while a partition lasts. CAP consistency (latest write) is not the same as ACID consistency (constraints hold), and CAP availability is not the same as high availability. A refinement, PACELC, adds that even without a partition there is a trade-off between latency (waiting time) and consistency.

## Questions

### What does the query optimizer do?

It takes the many equivalent ways to run a query and picks the one with the lowest estimated cost, using statistics from the catalog.

### What do the two numbers in an EXPLAIN cost, such as cost=0.00..445.00, mean?

The estimated start-up cost (before the first row can be returned) and the estimated total cost, in arbitrary units used to compare plans.

### What is the difference between synchronous and asynchronous replication?

Synchronous waits for the copies before committing, so nothing is lost on failover but writes are slower. Asynchronous does not wait, so it is faster but replicas can be stale and a failover can lose recent transactions.

### What is the difference between replication and sharding?

Replication copies the same data to several nodes for availability and read capacity. Sharding splits different data across nodes for capacity.

### State the CAP theorem.

A distributed data store can give at most two of consistency, availability and partition tolerance. Since partitions cannot be avoided, the choice during a partition is between consistency and availability.

## Mistakes

- Saying CAP means you can pick any two of the three. Partition tolerance is generally required in a distributed system; the choice is consistency or availability during a partition.
- Treating replication and sharding as the same thing. One copies data, the other splits it.
- Assuming the optimizer knows the true cost. It picks the lowest estimated cost, using statistics that can be inaccurate.

## Quiz

### Instructors: 1,000 rows, 20 in Music. Teaches: 4,000 rows, about 4 per instructor. Which plan creates the smaller intermediate result?

- [ ] Join instructor and teaches first, then filter on Music
- [x] Filter instructor to Music first, then join with teaches
- [ ] Both create the same intermediate result
- [ ] Neither: the optimizer ignores the filter

Explanation: Joining first creates 4,000 rows before filtering. Filtering first leaves 20 rows to join and gives 80 rows directly. Pushing selections down shrinks the work.

### An EXPLAIN line reads Seq Scan on t (cost=0.00..445.00 rows=10000). What is 445.00?

- [ ] The number of milliseconds
- [x] The estimated total cost, in the planner's units
- [ ] The number of rows
- [ ] The number of pages

Explanation: The first number (0.00) is the estimated start-up cost and the second (445.00) the estimated total cost. They are units for comparing plans, not time.

### With hash partitioning on user_id across 3 nodes, which query is cheapest?

- [ ] A range query on user_id from 1 to 1000
- [x] A lookup of one user by user_id
- [ ] A full scan
- [ ] They all cost the same

Explanation: A point query hashes to one node. A range query must visit all nodes, because hashing scatters neighbouring values.

### Asynchronous replication: the primary commits a transaction and then fails before the replica gets it. What can happen?

- [ ] Nothing: the replica always has it
- [x] The transaction can be lost when the replica is promoted
- [ ] The replica refuses to start
- [ ] Both servers hold two copies

Explanation: Asynchronous replication does not wait for the replica, so a failover can lose the latest committed transactions. Synchronous replication avoids this at the cost of speed.

### During a network partition, a distributed store must choose between:

- [ ] Consistency and partition tolerance
- [ ] Availability and partition tolerance
- [x] Consistency and availability
- [ ] Speed and cost

Explanation: Partitions cannot be avoided, so tolerating them is generally required. While the partition lasts, the system either refuses some requests to stay consistent or answers them and risks inconsistent data.

## Diagram

```json
{ "kind": "flow", "caption": "How a query gets its plan.", "steps": [{ "label": "Parse and translate to relational algebra" }, { "label": "Generate equivalent plans" }, { "label": "Estimate each cost from statistics" }, { "label": "Pick the cheapest plan" }, { "label": "Evaluate it" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Single-leader replication: writes go to the primary, which sends the changes to the replicas. Replicas serve reads.", "nodes": [{ "id": "client", "label": "Application", "x": 12, "y": 50 }, { "id": "primary", "label": "Primary", "x": 45, "y": 50 }, { "id": "r1", "label": "Replica 1", "x": 85, "y": 22 }, { "id": "r2", "label": "Replica 2", "x": 85, "y": 78 }], "edges": [{ "from": "client", "to": "primary", "label": "writes" }, { "from": "primary", "to": "r1", "label": "changes" }, { "from": "primary", "to": "r2", "label": "changes" }] }
```
