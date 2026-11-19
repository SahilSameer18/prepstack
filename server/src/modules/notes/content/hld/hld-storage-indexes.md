---
id: hld-storage-indexes
title: Storage, Search and Special Indexes
lastChecked: 2026-11-13
next: hld-case-url-shortener
roadmapSteps: backend:database-design, devops-cloud:cloud-aws-basics, dsa:heaps-tries
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

Every big design must say where the bytes live and how to find them quickly. This section covers three kinds of storage, a huge file system, copies against erasure coding (extra computed pieces instead of full copies), the write-heavy Bigtable design, and three special indexes: Bloom filters (a small memory trick that skips useless disk reads), inverted indexes (word to documents) and geohash (a code for places).

After this section you can pick a storage type, cost out copies, and explain how a lookup avoids reading everything.

## Topic: Object, block and file storage

**Definition:** As AWS describes them. Object storage keeps each item as an object: the data, metadata (facts about the data) and a unique id, in one flat container (a bucket, for example in Amazon S3). Block storage splits data into equal blocks with addresses and is usually the disk of one host. File storage keeps files in folders that many servers can open at once.

**Why:** AWS says block storage fits databases and virtual machine disks (pretend computers running on a real one), which need quick small reads and writes. File storage fits shared documents. Object storage fits very large unstructured data such as images and video, where durability (data is not lost over years) matters more than delay.

**Example:** A photo app keeps image files in object storage, and their ids in its database, which sits on block storage.

**Failure:** "Why not put videos in the database?" Videos are large; object storage is made for large data with high durability.

## Topic: How a big file system stores a file (GFS)

**Definition:** GFS, the Google File System (paper, 2003), is one real design, not a law.
- Storing: a file is cut into 64 MB chunks. Chunkservers hold them, by default three replicas (copies) of each.
- Finding: one coordinator (the paper calls it the "master") holds all metadata: file names, which chunks make up a file, where each chunk is.
- Reading: the client asks the master where a chunk is, then reads it from a chunkserver. File data never passes through the master.
- Writing: the master gives one replica a lease (a right that lasts a limited time, 60 seconds at first) to be primary and order the changes.

**Why:** Big chunks mean few questions to the master and little metadata, so it fits in memory: under 64 bytes per chunk, says the paper.

**Example:** Assumption: 1 PB of files, counted as 2^50 bytes. 2^50 / 2^26 (64 MB) = 16,777,216 chunks. At up to 64 bytes each: 16,777,216 x 64 = 2^30 bytes, about 1 GB.

**Failure:** A small file is one chunk, so many readers can overload the few servers holding it (the paper). The master is one machine, so file data must not flow through it.

## Topic: Replication against erasure coding

**Definition:** Replication stores whole copies. Erasure coding stores data pieces plus parity pieces (extra pieces computed from the data), so lost pieces can be rebuilt. Reed-Solomon is one such method; "6+3" means 6 data and 3 parity pieces. The Apache Hadoop HDFS documentation says 3x replication has 200 percent overhead (two extra copies) and typical coding has no more than 50 percent. A property of the code from general coding theory (the HDFS page does not state it): any 6 of the 9 pieces rebuild the data, so any 3 can be lost.

**Why:** Copies are simple and fast to read but cost space. Coding saves space at petabytes.

**Example:** To store 1 PB: 3 copies use 3.00 PB (200 percent extra). Reed-Solomon 6+3 uses 1 PB x 9/6 = 1.50 PB (50 percent extra). Reed-Solomon 10+4 uses 1 PB x 14/10 = 1.40 PB (40 percent extra).

**Failure:** The HDFS page says coding needs more processor and network work. Data is spread over many servers, so most reads and writes go off-rack (a rack is a shelf of servers; leaving it uses the slower network between racks). The page ties coding to warm and cold data (read rarely); data read often can stay as copies (our reading).

## Topic: LSM tree: memtable and SSTable

**Definition:** An LSM tree (log-structured merge tree) turns writes into sequential appends (always adding at the end of a file, cheap on a disk). Bigtable (paper, 2006) uses this design, and the paper cites the LSM-tree paper (O'Neil and others, 1996). A write goes to a commit log on disk, then into the memtable (a sorted buffer in memory). A full memtable is written out as an SSTable (a sorted file never changed afterwards). A read merges the memtable and the SSTables. Compaction merges SSTables into fewer new ones. Source: Bigtable paper, sections 4 and 5.3 to 5.4.

**Why:** Updating a file in place needs a disk seek and appending does not (our reasoning). The log lets the memtable be rebuilt after a crash.

**Example:** Write the key 7: it is added to the commit log (step 2 of the diagram), then to the memtable (step 3). When the memtable is full it becomes SSTable 1. A read of key 7 checks the memtable first, then the SSTables.

**Failure:** A read may touch many SSTables: the cost of fast writes. Bloom filters (next topic) cut the extra reads.

## Topic: Bloom filters

**Definition:** A Bloom filter is a row of bits (each 0 or 1) plus several hash functions (each turns a key into a position in the row). To add a key, set its bits to 1. To test a key: if any of its bits is 0, the key is definitely absent; if all are 1, it is probably present. So it can give a false positive (says present, wrongly) but never a false negative. The standard design cannot delete keys. Bigtable's paper (section 6) uses Bloom filters so most lookups of missing rows do not touch the disk.

**Why:** It answers "is this key not in this file?" with little memory and saves a disk read.

**Example:** Toy filter (assumption: made-up positions): 8 bits, all 0, 2 hash functions.
- Add "cat": positions 1 and 5 become 1. Add "dog": positions 3 and 5.
- Test "fish": positions 1 and 6. Bit 6 is 0, so "fish" is definitely absent.
- Test "owl": positions 1 and 3 are both 1, so it says present, though "owl" was never added: a false positive.

More bits per item means fewer false positives. For 1,000,000 items, worked out with a small program: 5 bits per item with 3 hash functions gives 9.18 percent false positives (0.62 MB); 10 bits with 7 functions gives 0.82 percent (1.25 MB).

**Failure:** A "present" answer may be wrong, so exact membership still needs the real lookup.

## Topic: Inverted index for text search

**Definition:** An inverted index maps each word to the documents that contain it. Apache Lucene (a widely used search library) documents a term dictionary (all the words) pointing to postings (for each word: the documents, how often it occurs and where). Elasticsearch (a search server built on Lucene) keeps each shard (one slice of an index) as a Lucene index.

**Why:** Scanning every document for a word is slow. With the index, a word is one lookup.

**Example:** Documents: 1 "cold coffee", 2 "hot coffee shop", 3 "hot tea". Index: coffee [1, 2], cold [1], hot [2, 3], shop [2], tea [3]. Search "hot coffee": keep only the documents in both lists, [2, 3] and [1, 2]. The answer is [2].

**Failure:** Engines write each batch of new documents as a new segment (a file never changed) and merge segments later; the Elasticsearch merge page says segments are immutable. Words must be cleaned the same way when stored and searched, for example both lower case, or "Coffee" will not find "coffee".

## Topic: Geospatial indexes: geohash

**Definition:** A geohash writes a place as a short code. It halves the map again and again, alternately by longitude and latitude, and records each choice. Nearby places get codes that start the same. Redis GEO (Redis documentation) puts the bits into one 52-bit number, kept as the score (sorting value) of a sorted set (a list kept in score order). For sizes we use the text form, where each character carries 5 bits (assumption; the Redis page does not describe it).

**Why:** "Find places near me" would otherwise compare with every place. A geohash turns it into a lookup of a few cells.

**Example:** Four characters are 20 bits: 10 for longitude, 10 for latitude. Width: 360 / 2^10 = 0.35 degrees; one degree is 111.32 km at the equator (40,075 km / 360), so about 39 km. Height: 180 / 2^10 = 0.18 degrees, at 110.57 km a degree about 19 km. The same method gives 5 characters 4.9 km x 4.9 km; 6 characters 1.2 km x 607 m.

**Failure:** Two close points can have different prefixes, on opposite sides of a cell edge, so search the cell and its 8 neighbours (Redis checks 9 areas). Redis says its distance model can be off by up to 0.5 percent, and it rejects latitudes beyond 85.05 degrees.

## Questions

### How does a big file system find and store a file?

It cuts the file into 64 MB chunks. One coordinator (the paper's master) maps files to chunks; clients read from chunkservers directly. Each chunk has three copies by default.

### Why use erasure coding instead of copies?

It costs less: Reed-Solomon 6+3 adds 50 percent against 200 percent for three copies, and any 3 of its 9 pieces can be lost. The price is more network and processor work to rebuild.

### What does a Bloom filter promise?

No false negatives. If it says absent, the key is absent. If it says present, it may be wrong, at a rate you tune by bits per item.

## Mistakes

- "A Bloom filter can say a key is missing when it is there." It cannot; false positives are the only error.
- "Erasure coding is always better than copies." It saves space but rebuilds cost more.
- "The GFS master carries the file data." Clients read data from chunkservers; the master only gives locations.

## Quiz

### A Bloom filter says "absent" for a key. What does that mean?

- [ ] The key may still be present
- [x] The key is definitely not present
- [ ] The key was deleted
- [ ] The filter is full

Explanation: Every added key sets all its bits, so one unset bit proves the key was never added.

### How much extra space does Reed-Solomon 6+3 need compared with the data itself (3 copies need 200 percent extra)?

- [ ] 25 percent
- [x] 50 percent
- [ ] 100 percent
- [ ] 200 percent

Explanation: 3 parity pieces for 6 data pieces is 3/6 = 50 percent.

### Assume 1 PB of files in 64 MB chunks and at most 64 bytes of metadata per chunk. About how much memory does the master's metadata need?

- [ ] About 1 MB
- [ ] About 16 MB
- [x] About 1 GB
- [ ] About 18 TB

Explanation: 16,777,216 chunks x 64 bytes = 2^30 bytes, about 1 GB. The paper says under 64 bytes, so this is an upper limit.

### Besides the memtable, where is every new write recorded at once, so it survives a crash?

- [ ] An SSTable
- [x] A commit log
- [ ] A Bloom filter
- [ ] The master

Explanation: The log lets the memtable be rebuilt after a crash.

### With documents 1 "cold coffee", 2 "hot coffee shop", 3 "hot tea", which documents match "hot coffee"?

- [ ] 1 and 3
- [x] 2
- [ ] 1, 2 and 3
- [ ] 3

Explanation: "hot" is in [2, 3], "coffee" in [1, 2]; only 2 is in both.

## Diagram

```json
{ "kind": "graph", "caption": "GFS-style read path (our own drawing). The client asks the metadata server (the paper's master) which chunk holds the byte range and where its copies are (1), the server answers (2), and the client reads the data directly from one chunkserver (3). The metadata server does not carry file data. The dashed lines between chunkservers show which servers keep copies of the chunk, not read traffic.", "nodes": [{ "id": "c", "label": "Client", "x": 10, "y": 50, "shape": "client" }, { "id": "m", "label": "Metadata server", "x": 50, "y": 14 }, { "id": "s1", "label": "Chunkserver 1", "x": 85, "y": 25 }, { "id": "s2", "label": "Chunkserver 2", "x": 85, "y": 55 }, { "id": "s3", "label": "Chunkserver 3", "x": 85, "y": 85 }], "edges": [{ "from": "c", "to": "m", "step": 1, "label": "where is it?" }, { "from": "m", "to": "c", "step": 2, "dashed": true }, { "from": "c", "to": "s2", "step": 3, "label": "read bytes" }, { "from": "s2", "to": "s1", "dashed": true }, { "from": "s2", "to": "s3", "dashed": true }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "LSM write path as in Bigtable: the write arrives (1), is appended to the commit log (2) and put in the memtable in memory (3); when the memtable is full it is written out as an immutable SSTable (4), and background compactions merge SSTables (5).", "steps": [{ "label": "Write arrives" }, { "label": "Append to commit log" }, { "label": "Insert in memtable" }, { "label": "Full: write SSTable" }, { "label": "Compaction merges SSTables" }] }
```
