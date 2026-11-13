---
id: hld-choosing-databases
title: Choosing a Database
lastChecked: 2026-11-13
next: hld-replication-partitioning
roadmapSteps: backend:database-design, java-spring:spring-rest-api
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A system design answer almost always names a database, and the interviewer wants to hear why. Start from questions about the data and only then pick a kind of store: tables, key-value, wide-column, document, graph, or a globally consistent relational database (each is explained below). After this section you can justify a choice in one minute and name what you give up.

## Topic: Start from the questions, not the product

**Definition:** Five questions decide the choice:
1. Shape of the data: rows with links between them, one blob per key, nested documents, or a web of connections?
2. Access patterns (the exact reads and writes the application makes): by key, by range, by many fields, by walking links?
3. How many reads for each write?
4. How correct must reads be: always the latest value, or slightly old is fine?
5. Scale: how much data and how many requests?

**Why:** A product name hides these trade-offs; one product can fit one feature and not another.

**Example:** (assumption) One table has 1 billion rows of 200 bytes. Table data: 1,000,000,000 × 200 bytes = 200 GB. An index (a sorted list that lets the database find a row fast) adds 16 bytes per row: 1,000,000,000 × 16 bytes = 16 GB. Total: 200 + 16 = 216 GB. Disk is much slower than memory (about 120 times for a 1 MB read in Dean's old numbers), so ask: can the busy part of the 216 GB sit in memory?

**Failure:** Answering "I would use database X" with no reason. The follow-up is "what would change your mind?", so tie every choice to one of the five questions.

## Topic: Relational tables, SQL and transactions

**Definition:** A relational database keeps data in tables of rows and columns, links rows with keys, answers questions in SQL (a language for asking for data by its content), and groups several changes into one transaction (all of them happen, or none do). See Database Management Systems: Normalization, Transactions and Indexing; here it is the baseline.

**Why:** When the access patterns are not known yet, tables with joins (combining rows from several tables in one query) and indexes let you ask new questions later without redesigning the data.

**Example:** "All orders of user 17 with their items" is one query joining an orders table and an items table. A transfer between two accounts is one transaction.

**Failure:** Saying tables "cannot scale" or that another kind "always scales". Say what you would do when one server is not enough: copy the data for reads and split it for size (see Replication, Sharding and Consistent Hashing).

## Topic: Key-value stores (Dynamo)

**Definition:** A key-value store keeps a value under a key and offers little more than get and put. In the Dynamo paper (Amazon, 2007) the value is an opaque array of bytes (the store does not look inside it), and the key is turned into a number (hashed) that decides which machines hold it. put also carries a context, a note about which earlier version the write is based on. Dynamo aims to be "always writeable": a write is accepted while some machines are down, as long as W machines can be reached (W is set per service). Two writes to one key can conflict; the conflict is resolved when the data is read.

**Why:** If a product must accept writes even during failures, and every access is by key, this is the simplest model, and it spreads easily over many machines.

**Example:** (assumption) A shopping cart under the key `cart:user-17`: adding an item is one put, reading the cart is one get. Dynamo's paper uses a shopping cart as a leading example.

**Failure:** There is no "find all carts that contain item 9", because the store only knows keys. A question about the inside of values needs a second copy built for it, or a different kind of store. What happens when two writes conflict is covered in Consistency Models, CAP and PACELC.

## Topic: Wide-column stores (Bigtable and Cassandra)

**Definition:** The Bigtable paper (Google, 2006) describes a sorted map from (row key, column name, timestamp) to a value.
- Rows are kept in sorted order of the row key. Column names are grouped into column families (a few groups that share access rules).
- A tablet is a block of neighbouring rows that can be moved to another machine.
- Data sits in SSTables (files of sorted rows never changed once written). New writes go first to a commit log (a file where each write is noted, so a crash does not lose it) and to a sorted list in memory.

Apache Cassandra's documentation says it is built from Dynamo's replication ideas and Bigtable's data model. A row is found by its partition key (hashed to place it on machines) and sorted inside the partition by clustering columns.

**Why:** Sorted rows make a short range read cheap, and keys can be chosen so data read together sits together. This note's reasoning: writes go to a log and memory and files are never changed in place, so writes are cheap, and these stores are often chosen for heavy write loads.

**Example:** (assumption) Row key `user-17`, column family `orders`, one column per order such as `orders:1001`. "All orders of user 17" reads one row. In Bigtable, every read or write inside one row is atomic (it happens fully or not at all).

**Failure:** Treating it like tables: Cassandra has no joins. A wrong row key turns every query into a scan of many rows.

## Topic: Document and graph stores

**Definition:** A document store keeps nested records (documents), for example JSON-like objects with lists inside. MongoDB's data-modeling pages say data accessed together should be stored together. A link can be modelled by embedding (putting the related data inside the document) or by referencing (keeping it in another collection, a group of documents like a table, and pointing to it). Schema validation (a rule that every document must have certain fields) can enforce structure.

A graph database such as Neo4j stores nodes (things), relationships (named, directed links between two nodes) and properties (key-value facts on both). Neo4j's documentation says relationships are stored with the nodes they join, so no JOIN is used.

**Why:** A document fits one screen's worth of data read in one go. A graph is built for questions about links, such as friends of friends.

**Example:** (assumption) A product page: embed the product details and the five latest reviews in one document, and keep older reviews in a separate collection, as MongoDB's own example does.

**Failure:** Embedding everything, then needing a part on its own. Do not say a document or graph store is faster; say what you would measure.

## Topic: A globally consistent relational database (Spanner)

**Definition:** Spanner (Google, 2012) keeps data in tables, runs transactions, supports SQL, and copies data to several data centres. Its promise is external consistency: if transaction T1 finishes before T2 starts, T1 gets the smaller commit timestamp. This needs clocks that admit they may be wrong. Google's clock service, TrueTime, returns the time as a range that contains the true time; the paper says the uncertainty is generally below 10 ms. Spanner waits until the range is narrow.

**Why:** Some products need tables, transactions and the latest answer across continents; the paper says users found Bigtable hard to use for that.

**Example:** The paper says most applications would copy data over 3 to 5 data centres in one region; its first user, F1, used five copies across the United States.

**Failure:** Saying it "has no trade-off". It buys correctness with waiting and with special clocks. The paper is from 2012 and describes Google's system.

## Topic: Design the tables for the queries

**Definition:** Denormalisation means storing the same fact in more than one place so each query reads one place. Cassandra's documentation says to list the queries first, make a table for each, accept duplicated data, and expect no joins, no foreign keys (a column that points to a row in another table), no cascading deletes (deleting a row also deletes the rows that point to it) and a fixed sort order.

**Why:** A read that gathers pieces from many partitions (slices of the data, each on some machine) is slow. One query on one partition is the cheap case.

**Example:** (example, not run) Query: the 10 latest orders of a user.
```
CREATE TABLE orders_by_user (
  user_id int, placed_at timestamp, order_id int, total int,
  PRIMARY KEY (user_id, placed_at, order_id)
) WITH CLUSTERING ORDER BY (placed_at DESC, order_id DESC);
SELECT * FROM orders_by_user WHERE user_id = 17 LIMIT 10;
```
`user_id` picks the machine; `placed_at` sorts the rows inside it, newest first; so the SELECT reads the first 10 rows of one partition. `order_id` is in the key so two orders at the same time do not replace each other. "Orders by day" would need a second table.

**Failure:** What Cassandra's documentation warns against: designing tables before the queries, normalising (storing each fact only once) and expecting joins, relying on foreign keys, and expecting to sort by any column. The application must keep every copy in step.

## Questions

### How do you choose a database for a new system?

I list five things: the shape of the data, the exact reads and writes, reads per write, how fresh reads must be, and the size. Tables and SQL when questions vary and transactions matter. Key-value when every access is by key. Wide-column when I can design rows around the queries. Document when a page reads one nested record. Graph when the questions are about links.

### What does Dynamo give up to always accept writes?

It gives up one agreed version at write time. Replicas may hold different versions, and the conflict is settled at read time, by a simple rule or by the application.

### When would you use Spanner-style storage?

When the product needs SQL tables, transactions and the latest answer across regions. The cost: waiting out clock uncertainty and copying data between distant data centres.

## Mistakes

- Choosing the product before the access patterns.
- Using a wide-column store like tables, with joins and foreign keys.
- Believing a key-value store can search by anything inside the value.

## Quiz

### Which operations does a client mainly use in Dynamo's interface?

- [ ] SQL joins and transactions
- [x] get(key) and put(key, context, object)
- [ ] Graph traversals
- [ ] Range scans over sorted rows

Explanation: Dynamo's interface is get and put on keys; the value is opaque to the store.

### Why does Cassandra's documentation recommend one table per query?

- [ ] Because joins are faster than in SQL
- [ ] Because tables take no disk space
- [x] Because there are no joins, and a read of one partition is the cheap case
- [ ] Because sorting is done by the client

Explanation: Cassandra has no joins, so each query gets a table that already holds what it needs.

### In the made-up example, 1 billion rows of 200 bytes plus a 16 byte index per row is how much in all?

- [ ] 200 GB
- [ ] 16 GB
- [x] 216 GB
- [ ] 2,160 GB

Explanation: 200 GB of rows plus 1,000,000,000 × 16 bytes = 16 GB of index is 216 GB.

### What does MongoDB's data-modeling guidance say about what to store together?

- [ ] Data that has the same type
- [ ] Data with the same author
- [x] Data that is accessed together
- [ ] Data that is updated least

Explanation: The official pages say so, using embedding or references.

### Which property does Spanner's paper claim for transactions?

- [ ] Eventual consistency only
- [x] External consistency, using TrueTime
- [ ] No transactions at all
- [ ] Consistency only inside one data centre

Explanation: TrueTime exposes clock uncertainty so Spanner can wait it out.

## Diagram

```json
{ "kind": "layers", "caption": "A decision ladder, read from the top. Start with the questions and let each answer narrow the kind of store: first the shape of the data, then the exact reads and writes, then how fresh a read must be, then the size, and only last a product name.", "layers": [{ "label": "1. Shape of the data: rows with links, one blob per key, nested record, or web of links?" }, { "label": "2. Exact reads and writes: by key, by range, by many fields, by walking links?" }, { "label": "3. Read to write ratio and how fresh a read must be" }, { "label": "4. Size and request rate (do the numbers first)" }, { "label": "5. Pick the kind of store, then a product, and name what you give up" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "One user's data placed two ways. In relational tables (top box) the app asks the orders table by user id (1) and joins the items table (2): the data is split into pieces and joined when asked. In a key-value store (bottom box) the same user's data is one value under one key and a single get (1) returns it, but the store cannot answer questions about the inside of values.",
  "groups": [{ "id": "t", "label": "Relational tables" }, { "id": "k", "label": "Key-value store" }],
  "nodes": [ { "id": "app", "label": "App", "x": 8, "y": 50, "shape": "client" },
             { "id": "o", "label": "Orders table", "x": 45, "y": 14, "shape": "database", "group": "t" },
             { "id": "i", "label": "Items table", "x": 80, "y": 14, "shape": "database", "group": "t" },
             { "id": "kv", "label": "user:17 = one value", "x": 55, "y": 80, "shape": "database", "group": "k" } ],
  "edges": [ { "from": "app", "to": "o", "step": 1, "label": "by user id" }, { "from": "o", "to": "i", "step": 2, "label": "join" }, { "from": "app", "to": "kv", "step": 1, "label": "get" } ] }
```
