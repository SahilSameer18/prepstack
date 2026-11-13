---
id: hld-choosing-databases
title: Choosing a Database
next: hld-replication-partitioning
roadmapSteps: backend:database-design, java-spring:spring-rest-api
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-phase1.md. Numbers from docs/content/checks/hld-check.py. -->

## Overview

A system design answer almost always names a database, and the interviewer wants to hear why. This section teaches you to start from questions (what does the data look like, how is it read and written, how correct must it be, how big will it get) and only then pick a kind of store: tables, key-value, wide-column, document, graph, or a globally consistent relational database. Each kind is shown through a real system paper or the official documentation. After this section you can justify a choice in one minute and name what you give up.

## Topic: Start from the questions, not the product

**Definition:** Five questions decide the choice. (1) Shape of the data: rows with links between them, one blob per key, nested documents, or a web of connections? (2) Access patterns (the exact reads and writes the application makes): by key, by range, by many fields, by walking links? (3) Read to write ratio. (4) How correct must reads be: always the latest value, or slightly old is fine? (5) Scale: how much data and how many requests?

**Why:** A product name hides these trade-offs. Two products with similar names can answer the five questions very differently, and the same product can be a good or bad fit for two features of one application.

**Example:** (assumption, made-up) One table has 1 billion rows of 200 bytes. That is 1,000,000,000 x 200 = 200 GB of table data. An index of 16 bytes per row adds 16 GB, so 216 GB in all. Dean's talk (about 2007, order of magnitude only) says reading 1 MB from disk takes about 30 ms and from memory about 250 microseconds, so disk is 120 times slower. These numbers tell you what to ask next: can the hot part sit in memory, and is the problem size or the access pattern?

**Failure:** Answering "I would use database X" with no reason. The follow-up is "what would make you change your mind?", so tie every choice to one of the five questions.

## Topic: Relational tables, SQL and transactions

**Definition:** A relational database keeps data in tables of rows and columns, links rows with keys, answers questions in SQL (a language for asking for data by its content), and groups several changes into one transaction (all of them happen, or none do). The DBMS notes teach this in full (see Database Management Systems: Normalization, Transactions and Indexing), so here it is only the baseline the other kinds are compared with.

**Why:** When the access patterns are not known yet, or many different questions are asked of the same data, tables with joins (combining rows from several tables in one query) and indexes let you ask new questions later without redesigning the data.

**Example:** "All orders of user 17 with their items" is one query over an orders table and an items table joined on the order id. A transfer between two accounts is one transaction: both balance changes commit together.

**Failure:** One database server eventually has limits on size and request rate. The next section (Replication, Sharding and Consistent Hashing) covers copies and splitting. Do not say tables "cannot scale" or that another kind "always scales": say what you would do when one server is not enough.

## Topic: Key-value stores (Dynamo)

**Definition:** A key-value store keeps a value under a key and offers little more than get(key) and put(key, value). In the Dynamo paper (Amazon, 2007) the value is an opaque array of bytes (the store does not look inside it), and the key is hashed to decide which machines hold it. Dynamo aims to be always writable (a write is never refused because some machines are down). The price is that two writes to the same key can conflict, and the conflict is resolved when the data is read, not when it is written.

**Why:** If a product must accept writes even during failures, and every access is "by key", this is the simplest model, and it spreads easily over many machines.

**Example:** (assumption) A shopping cart stored under the key `cart:user-17`. Adding an item is one put. Reading the cart is one get. Dynamo's paper used exactly this kind of cart as its main case.

**Failure:** There is no "find all carts that contain item 9", because the store only knows keys. A question about the inside of values needs a second copy of the data built for that question, or a different kind of store. Another probe: what happens when two writes conflict? (The consistency note, Consistency Models, CAP and PACELC, answers that.)

## Topic: Wide-column stores (Bigtable and Cassandra)

**Definition:** The Bigtable paper (Google, 2006) describes a sorted map from (row key, column name, timestamp) to a value. Rows are kept in sorted order of the row key. Column names are grouped into column families (a family is the unit for access rules and is meant to stay few in number), and a cell can hold several versions marked by time. A range of rows is a tablet (the unit that is moved between servers). Data is stored in SSTables (immutable sorted files); new writes go to a commit log and an in-memory sorted buffer first. Apache Cassandra's documentation calls its own model a partitioned wide-column model, built from Dynamo's replication ideas and Bigtable's data and storage model: a row is found by its partition key (hashed to place it on machines) and sorted inside the partition by clustering columns.

**Why:** Sorted rows make a read of a short range of rows cheap and let you choose keys so that data read together sits together. Huge write volume is handled because writes are appended, not changed in place.

**Example:** (assumption) Row key `user-17`, column family `orders`, one column per order such as `orders:1001`, each with a timestamp. "All orders of user 17" reads one row. In Bigtable, every read or write inside one row is atomic.

**Failure:** Treating it like tables: Bigtable has no full relational model, and Cassandra has no joins. A row key that is wrong for the questions you ask turns every query into a scan of many rows or partitions.

## Topic: Document and graph stores

**Definition:** A document store keeps nested records (documents), for example JSON-like objects with lists inside. MongoDB's official data-modeling pages say the core idea is that data accessed together should be stored together, and that you can model a link either by embedding (putting the related data inside the document) or by referencing (keeping it in another collection and pointing to it). Documents in one collection need not have the same fields, and a fixed structure can still be enforced by schema validation. A graph database such as Neo4j stores nodes (things), relationships (named, directed links between two nodes) and properties (key-value facts on both). Neo4j's documentation says relationships are stored with the nodes they join and no JOIN is used.

**Why:** A document fits one screen's worth of data read in one go. A graph fits questions about links, such as friends of friends.

**Example:** (assumption) A product page: embed the product details and the five latest reviews in one document, and keep all older reviews in a separate collection, because MongoDB's own example says infrequently read reviews can live apart.

**Failure:** Embedding everything because it is easy, then needing a part on its own. We do not claim a speed figure for either kind: the sources read give none that we can state.

## Topic: A globally consistent relational database (Spanner)

**Definition:** Spanner (Google, 2012) keeps data in schematized semi-relational tables, supports general transactions and an SQL-based query language, and copies data to several data centres. It gives external consistency: if transaction T1 finishes before T2 starts, T1's commit timestamp is smaller. This relies on TrueTime, a clock service that returns time as an interval (the true time lies inside it); the paper says the uncertainty is generally below 10 ms. When the uncertainty is large, Spanner waits it out.

**Why:** Some products need tables, transactions and the latest answer even across continents, and the Spanner paper says users found Bigtable hard to use for that.

**Example:** The paper says most applications would replicate over 3 to 5 data centres in one region, and its first user, F1, used five replicas across the United States.

**Failure:** Saying it "has no trade-off". It buys correctness with waiting and with special clocks. Also say the paper is from 2012 and describes Google's system.

## Topic: Design the tables for the queries, and the SQL-against-NoSQL mistakes

**Definition:** Denormalisation means storing the same fact in more than one place so each query reads one place. Cassandra's documentation says its data modelling is query-driven: you list the queries first, then make a table for each, accept duplicated data, and expect no joins, no foreign keys and a sort order fixed by the clustering columns.

**Why:** In a store that spreads data over machines, a read that must gather pieces from many partitions (slices of the data, each on some machine) is slow and costs coordination. One query on one partition is the cheap case.

**Example:** (example, not run) Query: the 10 latest orders of a user.
```
CREATE TABLE orders_by_user (
  user_id int, placed_at timestamp, order_id int, total int,
  PRIMARY KEY (user_id, placed_at)
) WITH CLUSTERING ORDER BY (placed_at DESC);
SELECT * FROM orders_by_user WHERE user_id = 17 LIMIT 10;
```
A second query, "orders by day", needs a second table.

**Failure:** The usual mistakes, taken from what Cassandra's documentation warns against: designing tables before the queries, normalising and expecting joins, relying on foreign keys or cascading deletes, and expecting to sort by any column. The cost of denormalisation is that every copy must be kept in step by the application.

## Questions

### How do you choose a database for a new system?

I list five things: the shape of the data, the exact reads and writes, the read to write ratio, how fresh reads must be, and the size. Tables and SQL when questions vary and transactions matter. Key-value when every access is by key. Wide-column when there is huge write volume and I can design rows around the queries. Document when a page reads one nested record. Graph when the questions are about links.

### Why would you denormalise?

To make each important query read one table or one partition. The price is duplicated data that I must keep consistent, and a new table for a new query.

### What does Dynamo give up to always accept writes?

It gives up having one agreed version at write time. Replicas may hold different versions, and the conflict is settled at read time, by a simple rule or by the application.

### When would you use Spanner-style storage?

When the product needs SQL tables, transactions and the latest answer across regions. I would say what it costs: clock uncertainty is waited out, and data is copied between distant data centres.

## Mistakes

- Choosing the product first and the access patterns later.
- Using a wide-column store like tables with joins, foreign keys and any ORDER BY.
- Believing a key-value store can search by anything inside the value.

## Quiz

### In Dynamo's interface, what operations does a client mainly use?

- [ ] SQL joins and transactions
- [x] get(key) and put(key, context, object)
- [ ] Graph traversals
- [ ] Range scans over sorted rows

Explanation: The Dynamo paper describes a simple interface with get and put on keys. The value is opaque to the store.

### Why does Cassandra's documentation recommend one table per query?

- [ ] Because joins are faster than in SQL
- [ ] Because tables are free
- [x] Because there are no joins, and a read of one partition is the cheap case
- [ ] Because sorting is done by the client

Explanation: Cassandra has no joins, so each query is backed by a table that already holds what it needs, even if data is duplicated.

### In the made-up example, 1 billion rows of 200 bytes plus a 16 byte index per row is how much in all?

- [ ] 200 GB
- [ ] 16 GB
- [x] 216 GB
- [ ] 2,160 GB

Explanation: 1,000,000,000 x 200 bytes is 200 GB, the index adds 1,000,000,000 x 16 bytes = 16 GB, so 216 GB.

### What does MongoDB's data-modeling guidance say about what to store together?

- [ ] Data that has the same type
- [ ] Data with the same author
- [x] Data that is accessed together
- [ ] Data that is updated least

Explanation: The official pages say data that is accessed together should be stored together, using embedding or references.

### Which property does Spanner's paper claim for transactions?

- [ ] Eventual consistency only
- [x] External consistency, using TrueTime
- [ ] No transactions at all
- [ ] Consistency only inside one data centre

Explanation: If T1 commits before T2 starts, T1's timestamp is smaller. TrueTime exposes clock uncertainty so Spanner can wait it out.

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
             { "id": "kv", "label": "Key user:17 = one value", "x": 55, "y": 80, "shape": "database", "group": "k" } ],
  "edges": [ { "from": "app", "to": "o", "step": 1, "label": "by user id" }, { "from": "o", "to": "i", "step": 2, "label": "join" }, { "from": "app", "to": "kv", "step": 1, "label": "get" } ] }
```
