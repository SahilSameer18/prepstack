---
id: dbms-indexing-file-organization
title: Indexing & File Organization
next: dbms-sql
roadmapSteps: backend:database-design
---

<!-- DRAFT written 10 Nov 2026 from docs/content/source-notes/dbms-batch-c.md (S1c slides ch13 and ch14, S2c PostgreSQL index types and EXPLAIN, S8c MySQL clustered indexes, S7c Use The Index Luke and Wikipedia B+ tree).
     Not reviewed: no lastChecked. To publish: outside reader + REVIEW_CHECKLIST.md, add lastChecked, move this file up one folder, delete the old section from dbms.legacy.js. -->

## Overview

An index is a separate, sorted structure that lets the database find rows without reading the whole table. Interviewers ask about it because the B+ tree, clustered versus secondary indexes, and the order of columns in a multi-column index decide whether a query takes milliseconds or minutes. After this section you can explain how a B+ tree lookup works and why it stays shallow, say what an index costs, choose the column order of a composite index, and compare B+ tree and hash indexes.

## Topic: What an index is and what it costs

**Definition:** An index is a structure that stores search-key values in a form that is fast to search, each with a pointer to the row. It is a redundant copy of part of the data, kept separate from the table.

**Why:** Without an index, finding one row means reading every row. With one, the database goes straight to the row's location.

**Example:** A table of 1,000,000 students with an index on roll_no: the query WHERE roll_no = 42 reads a few index blocks and then one table block. Without the index it reads the whole table.
```sql
CREATE INDEX idx_student_roll ON student (roll_no);
```

**Failure:** An index is not free. It takes space, and every insert, update or delete that touches an indexed column must update the index as well, keeping it in order. Too many indexes slow down writes. And when a query needs a large part of the table anyway, a full scan can be the cheapest plan.

## Topic: B+ tree

**Definition:** A B+ tree is a balanced tree where all leaves are at the same depth. Internal nodes only route the search by key ranges. The leaves hold the keys with pointers to the rows, and each leaf points to the next leaf in key order.

**Why:** It is shallow even for millions of keys, because each node is about one disk block and holds around a hundred entries.

**Example:** To find 45 in a tree whose root has keys 30 and 60: 45 is at least 30 and below 60, so go to the middle child, a leaf holding 30, 40, 50. Look inside the leaf for 45: not there, so no such row. With 1,000,000 keys and about 100 entries per node, a lookup touches at most about 4 nodes. A balanced binary tree over the same keys needs about 20.

**Failure:** Each node access can be a disk read, which is why 4 versus 20 matters. Inserting into a full leaf splits it and pushes a key up to the parent; splits can reach the root and make the tree one level taller. Deleting from a node that gets too empty merges it with a neighbour or borrows entries from it. A B+ tree is not a binary tree, and it differs from a plain B-tree, where keys can also sit in internal nodes and the leaves are not linked.

## Topic: Range queries and which searches an index helps

**Definition:** A B+ tree on a column supports equality, range and sorted-order searches on that column, because the leaves are sorted and linked.

**Why:** After finding the first matching leaf entry, the database follows the leaf links until the range ends. It does not go back to the root.

**Example:** WHERE marks BETWEEN 80 AND 90 finds the leaf entry for 80 and reads along the leaves until it passes 90. PostgreSQL's B-tree supports =, <, <=, >=, > and also BETWEEN, IN, IS NULL and IS NOT NULL.
```sql
SELECT * FROM student WHERE marks BETWEEN 80 AND 90;
```

**Failure:** A LIKE pattern uses a B-tree index only when the pattern starts with fixed text, such as 'Ra%'. A pattern like '%rao' cannot use the sort order, because any name could end that way.

## Topic: Clustered and secondary indexes

**Definition:** In a clustering index, the order of the index decides the order in which the rows are stored; a secondary (non-clustering) index has an order different from the stored order. MySQL's InnoDB stores the whole table as a clustered index on the primary key.

**Why:** A clustered lookup goes straight to the row. A secondary index lookup needs an extra step to reach the row.

**Example:** In InnoDB, a secondary index on email stores each email together with the row's primary key. Finding a student by email searches the email index to get the primary key, then searches the clustered index with that key to get the full row. Without a declared primary key, InnoDB uses the first UNIQUE index whose columns are all NOT NULL, and if there is none it creates a hidden row id.

**Failure:** Because every secondary index entry carries the primary key, a long primary key makes all secondary indexes bigger. The PostgreSQL index documentation does not describe clustered indexes, so do not assume PostgreSQL behaves like InnoDB here. Also, a secondary index must have an entry for every row (it is dense), while an index that only has entries for some key values (sparse) works only on a file sorted by that key.

## Topic: Composite (multi-column) indexes

**Definition:** A composite index is one B+ tree sorted by the first column, then by the second column among rows with the same first value, and so on.

**Why:** One index can serve several queries, but only the ones that use its leading columns.

**Example:** An index on person(last_name, first_name). WHERE last_name = 'Rao' can use it, and so can WHERE last_name = 'Rao' AND first_name = 'Asha'. WHERE first_name = 'Asha' alone cannot: the names with first_name 'Asha' are scattered across all last names, so the database scans the table. Checked with a query plan in SQLite: the first two queries show an index search, the third a table scan.
```sql
CREATE INDEX idx_name ON person (last_name, first_name);
```

**Failure:** Think of a phone book sorted by surname, then first name: it does not help you find everyone called Asha. When you create a composite index, put the column you filter on by equality in most queries first. One well-ordered composite index is usually better than adding a second index on the same columns reversed.

## Topic: Hash index and hashing

**Definition:** A hash index applies a hash function to the search key to pick a bucket, a block that holds the matching entries. Different keys can land in the same bucket, so the bucket is searched.

**Why:** For a lookup of one exact value it goes almost straight to the bucket without descending a tree.

**Example:** WHERE roll_no = 42 hashes 42 to a bucket and reads it. WHERE roll_no BETWEEN 40 AND 50 cannot use the hash index, because hashing destroys the order of the keys. PostgreSQL's hash index stores a 32-bit hash and supports equality only.

**Failure:** Static hashing has a fixed number of buckets: too few and buckets overflow into chains, too many and space is wasted. Dynamic schemes (linear and extendable hashing) change the number of buckets as the table grows. If range queries are common, use an ordered index. Older textbooks discourage PostgreSQL hash indexes for performance reasons; the current PostgreSQL manual simply lists Hash as an equality-only index type.

## Topic: How rows are stored: file organization

**Definition:** A file organization is the way records are placed in a file. In a heap file a record goes anywhere there is room. In a sequential file records are ordered by a key. A hash file puts a record in the block chosen by hashing its key. In a B+ tree file organization the leaves hold the records themselves.

**Why:** The layout decides which accesses are cheap: a heap is cheap to insert into but needs an index to search; a sorted file is cheap to scan in order.

**Example:** A heap table with 1,000 blocks and no index reads all 1,000 blocks for a single lookup. Table partitioning is a related idea: a transactions table split into one table per year lets a query with year = 2019 read only that year's partition.

**Failure:** A sequential file stays sorted only if inserts are placed in order; extra inserts go to overflow blocks and the file must be reorganized from time to time. The system catalog (data dictionary) stores metadata about all of this: relation and column definitions, views, constraints, statistics such as row counts, and which indexes exist.

## Questions

### What is an index and what does it cost?

A separate sorted structure that maps search-key values to rows, so lookups avoid a full scan. It costs space and slows writes, because every insert, update or delete on indexed columns must update the index.

### How does a B+ tree lookup work, and why is it fast?

Start at the root, follow the child whose key range contains the value, repeat down to a leaf, then look in the leaf. Because each node holds about a hundred entries, the tree is only about four levels deep for a million keys.

### What is the difference between a B-tree and a B+ tree?

In a B+ tree all keys are in the leaves and the leaves are linked in order, which makes range scans easy. In a B-tree keys can also appear in internal nodes and there is no leaf list.

### How do you choose the column order of a composite index?

The index is sorted by the first column, then the second, so it helps queries that use its leading columns. Put the column you most often filter by equality first.

### When would you use a hash index instead of a B+ tree?

Only for exact-match lookups. A hash index cannot serve ranges or sorted output.

## Mistakes

- Saying an index always makes a query faster. It slows writes and costs space, and a full scan can be the best plan when much of the table is needed.
- Saying an index on (a, b) also helps a query that filters only on b. It helps only through the leading column a.
- Saying a B-tree is a binary tree. It is a balanced tree where each node holds many entries.

## Quiz

### About how many nodes does a B+ tree lookup touch for 1,000,000 keys with about 100 entries per node?

- [ ] About 1
- [x] About 4
- [ ] About 20
- [ ] About 1,000

Explanation: The height is at most about log base 50 of a million, which is 4. A balanced binary tree over the same keys needs about 20 node accesses.

### A composite index exists on person(last_name, first_name). Which query can use it for a direct search?

- [ ] WHERE first_name = 'Asha'
- [x] WHERE last_name = 'Rao'
- [ ] WHERE last_name LIKE '%rao'
- [ ] WHERE city = 'Pune'

Explanation: The index is sorted by last_name first, so a filter on last_name can use it. A filter on first_name alone, a pattern with a leading wildcard, or an unrelated column cannot.

### Why are the leaf nodes of a B+ tree linked to each other?

- [ ] To make deletes faster
- [x] To make range scans and sorted reads simple
- [ ] To let two trees share a root
- [ ] To keep the tree balanced

Explanation: After finding the first matching leaf entry, a range scan just follows the links until the range ends, without going back up the tree.

### In MySQL InnoDB, what does a secondary index entry contain?

- [ ] A pointer to the physical block of the row
- [x] The indexed columns plus the row's primary key
- [ ] A copy of the whole row
- [ ] Only the row number

Explanation: InnoDB looks up the primary key in the secondary index, then searches the clustered index with it to get the full row. That is why a long primary key makes secondary indexes larger.

### Which search can a hash index NOT serve?

- [ ] WHERE roll_no = 42
- [ ] WHERE roll_no = 7
- [x] WHERE roll_no BETWEEN 40 AND 50
- [ ] WHERE roll_no = 1000

Explanation: A hash function scatters keys, so neighbouring values are in unrelated buckets. Only exact-match lookups work.

## Diagram

```json
{ "kind": "graph", "caption": "A small B+ tree. The root keys 30 and 60 split the keys into three leaves. The leaves are linked in order, so a range scan follows the links.", "nodes": [{ "id": "root", "label": "Root: 30 | 60", "x": 50, "y": 12 }, { "id": "l1", "label": "Leaf: 10 20", "x": 15, "y": 75 }, { "id": "l2", "label": "Leaf: 30 40 50", "x": 50, "y": 75 }, { "id": "l3", "label": "Leaf: 60 70 80", "x": 85, "y": 75 }], "edges": [{ "from": "root", "to": "l1", "label": "below 30" }, { "from": "root", "to": "l2", "label": "30 to 59" }, { "from": "root", "to": "l3", "label": "60 and up" }, { "from": "l1", "to": "l2", "label": "next" }, { "from": "l2", "to": "l3", "label": "next" }] }
```
