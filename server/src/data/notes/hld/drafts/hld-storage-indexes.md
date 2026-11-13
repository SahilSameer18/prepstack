---
id: hld-storage-indexes
title: Storage, Search and Special Indexes
next: hld-case-url-shortener
roadmapSteps: backend:database-design, devops-cloud:cloud-aws-basics, dsa:heaps-tries
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-phase1.md. Numbers from docs/content/checks/hld-check.py. -->

## Overview

Every big design must say where the bytes live and how to find them fast. This section covers the three kinds of storage, how a huge file system keeps a file, how copies compare with erasure coding, how a write-heavy store such as Bigtable works, and three special indexes: Bloom filters, inverted indexes for text and geohash for places.

Interviewers ask it in file storage, search, maps and key-value designs. After this section you can pick a storage type, compute the cost of copies, and explain how a lookup avoids reading everything.

## Topic: Object, block and file storage

**Definition:** These are AWS's descriptions. Object storage keeps each item as an object: the data, descriptive metadata (facts about the data) and a unique id, all in one flat container (an S3 bucket), with no folder tree. Block storage splits data into equal blocks, each with an address, and attaches as a disk to one server. File storage keeps files in folders that many servers can open at once. Sources: AWS "What is object storage" and "difference between block, file and object storage".

**Why:** The choice follows the access pattern. AWS says block storage suits databases and virtual machine disks, which need low delay for small reads and writes. File storage suits shared documents. Object storage suits very large amounts of data (photos, video, logs) where durability and size matter more than delay.

**Example:** A photo app stores the image files in object storage, with the user id and the object id in its database; the database itself sits on block storage.

**Failure:** The follow-up is "why not put videos in the database?". A database disk costs more and is built for small, frequent reads and writes; large files fit an object store.

## Topic: How a big file system stores a file (GFS)

**Definition:** This is the design of GFS, the Google File System (paper, 2003), not a law. A file is cut into chunks of 64 MB. One master holds all metadata (the file names, which chunks make up each file, and where each chunk is). Many chunkservers hold the chunks, by default three replicas of each. The client asks the master where a chunk is, then reads the bytes straight from a chunkserver, so file data never passes through the master. For writes, the master gives one replica a lease (a time-limited right, 60 seconds at first, renewable) to be primary and decide the order of changes. Each chunkserver keeps a 32-bit checksum (a small number that shows damage) for every 64 KB block and checks it before it returns data.

**Why:** A big chunk means fewer questions to the master and little metadata, so the master keeps it all in memory. The paper says the master holds under 64 bytes per 64 MB chunk.

**Example:** 1 PB of files is 2^50 / 2^26 = 16,777,216 chunks. At 64 bytes each, that is 2^30 bytes, about 1 GiB of metadata. In 4 KB blocks the same data would have 274,877,906,944 blocks and 16 TiB of metadata (made-up comparison).

**Failure:** The paper names the cost: a small file is one chunk, so many readers can overload the few servers holding it. The master is also one machine, which is why it must stay out of the data path.

## Topic: Replication against erasure coding

**Definition:** Replication stores whole copies. Erasure coding cuts data into k data pieces and adds m parity pieces (extra pieces computed from the data), so lost pieces can be rebuilt from the others. Reed-Solomon 6+3 means 6 data and 3 parity pieces. Source: Apache Hadoop HDFS erasure coding documentation: default 3-way replication has 200 percent extra storage, and Reed-Solomon (6,3) has 50 percent extra.

**Why:** Copies are simple and fast to read, but cost more space. Coding saves space, which matters once the data is petabytes.

**Example:** To store 1 PB: 3 copies use 3.00 PB (200 percent extra). Reed-Solomon 6+3 uses 1 PB x 9/6 = 1.50 PB (50 percent extra), with 3 parity pieces, so up to 3 lost pieces can be rebuilt. Reed-Solomon 10+4 uses 1.40 PB (40 percent extra).

**Failure:** The trade, from the HDFS page: rebuilding a lost piece means reading several others over the network and decoding, which costs network and processor time, and a read of a damaged piece needs extra reads. Most striped reads and writes cross racks (a rack is a shelf of servers). That is why hot data often stays replicated and cold data is coded.

## Topic: LSM tree: memtable and SSTable

**Definition:** An LSM tree (log-structured merge tree) turns writes into sequential appends. This is how Bigtable (paper, 2006) works. A write goes to a commit log on disk and then into the memtable (a sorted buffer in memory). When the memtable is full it is written as an SSTable (a sorted file that is never changed after it is written, with a block index to find a key). A read looks in the memtable and in the SSTables and merges the answer. Background compactions merge SSTables into fewer new ones; a major compaction rewrites all of them into one. Source: Bigtable paper, sections 4 and 5.3 to 5.4.

**Why:** Random writes to disk are slow; appending is fast. The log makes the memtable recoverable after a crash.

**Example:** Write k=7: it is appended to the log, then put in the memtable (1 and 2 in the diagram). After the memtable is full, it becomes SSTable 1. A later write of k=7 goes to the new memtable. A read of k=7 checks the memtable first, then the SSTables.

**Failure:** Reads may touch many SSTables, which is the cost of fast writes. Compaction uses disk and network in the background. Bloom filters (next topic) reduce the extra reads.

## Topic: Bloom filters

**Definition:** A Bloom filter is a bit array plus k hash functions (functions that turn a key into array positions). To add a key, set its k bits to 1. To test a key, check its k bits: if any is 0 the key is definitely absent; if all are 1 it is probably present. So it can give a false positive (says present, wrong) but never a false negative (a key that was added always has all its bits set). Bigtable's paper, section 6, says a client can ask for Bloom filters per SSTable group so most lookups of missing rows do not touch the disk.

**Why:** It answers "is this key not in this file?" with a small amount of memory, saving a disk read.

**Example:** The false positive rate is (1 - e^(-kn/m))^k for m bits and n items. For 1,000,000 items: 5 bits each with 3 hashes gives 9.18 percent (0.62 MB); 8 bits and 6 hashes gives 2.16 percent (1.00 MB); 10 bits and 7 hashes gives 0.82 percent (1.25 MB); 15 bits and 10 hashes gives 0.07 percent (1.88 MB). A 1 percent rate needs about 9.59 bits an item. In a test with 10,000 items, 8 bits and 6 hashes, 2.13 percent of 20,000 absent keys were wrongly reported present, against 2.16 percent from the formula.

**Failure:** A standard Bloom filter cannot delete a key. If asked for exact membership, a Bloom filter is not enough: a "present" answer still needs the real lookup.

## Topic: Inverted index for text search

**Definition:** An inverted index maps each word to the list of documents that contain it, the reverse of a document listing its words. Apache Lucene's file format documentation describes a term dictionary (all terms) pointing to postings: for each term, the documents, how often it occurs and its positions. Elasticsearch shards are Lucene indexes (Elasticsearch documentation).

**Why:** Scanning every document for a word is slow. With the index, a word is one lookup.

**Example:** Documents: 1 "cold coffee", 2 "hot coffee shop", 3 "hot tea". Index: coffee [1, 2], cold [1], hot [2, 3], shop [2], tea [3]. Search "hot coffee" (documents with both words): intersect [2, 3] with [1, 2] to get [2].

**Failure:** Updating is costly, so engines write new immutable segments and merge them (Elasticsearch describes immutable segments). Search needs the same word cleaning at index time and query time, such as lower-casing, or words will not match.

## Topic: Geospatial indexes: geohash and quadtree

**Definition:** A geohash turns latitude and longitude into one string by taking bits alternately from each, so nearby points share a prefix. Redis GEO (Redis documentation) interleaves the bits into a 52-bit number kept as the score in a sorted set. A quadtree splits an area into four parts and splits any part again if it holds too many points (description from Wikipedia).

**Why:** "Find places near me" would otherwise compare to every place. Both turn it into a lookup of a few cells.

**Example:** Each geohash character adds 5 bits, alternating longitude and latitude. The cell is 360 degrees divided by 2 to the power of the longitude bits wide, and 180 degrees divided by 2 to the power of the latitude bits tall. At the equator one degree of longitude is about 111.32 km (40,075 km / 360) and one degree of latitude about 110.57 km. Approximate sizes: 4 characters 39 km x 19 km; 5 characters 4.9 km x 4.9 km; 6 characters 1.2 km x 607 m; 7 characters 153 m x 152 m; 8 characters 38 m x 19 m.

**Failure:** Two points can be close but have different prefixes, on opposite sides of a cell edge. Search the cell and its neighbours; Redis checks 1+8 areas. Cells shrink in width away from the equator. Redis says the Earth model can be off by up to 0.5 percent and areas near the poles cannot be indexed.

## Questions

### When do you pick object, block or file storage?

Object storage for large unstructured data such as photos and logs. Block storage for database and virtual machine disks. File storage for shared folders.

### How does a big file system find and store a file?

It cuts the file into 64 MB chunks. One master maps files to chunks and chunkservers (GFS design); clients read data from chunkservers directly. Each chunk has three copies by default.

### Why use erasure coding instead of copies?

It costs less: Reed-Solomon 6+3 adds 50 percent against 200 percent for three copies, and survives 3 lost pieces. The price is slower rebuilds and extra reads.

### What does a Bloom filter promise?

No false negatives. If it says absent, the key is absent. If it says present, it may be wrong, at a rate you tune by bits per item.

### How does an LSM tree handle a write?

Append to a log, put in the memtable, flush to an immutable SSTable later, and merge SSTables by compaction.

## Mistakes

- "A Bloom filter can say a key is missing when it is there." It cannot; false positives are the only error.
- "Erasure coding is always better than copies." It saves space but makes rebuilds and some reads more costly.
- "The GFS master carries the file data." Clients read data from chunkservers; the master only gives locations.

## Quiz

### A Bloom filter says "absent" for a key. What does that mean?

- [ ] The key may still be present
- [x] The key is definitely not present
- [ ] The key was deleted
- [ ] The filter is full

Explanation: Every added key sets all its bits, so one unset bit proves the key was never added.

### How much extra space does Reed-Solomon 6+3 need compared with 3 copies (200 percent extra)?

- [ ] 25 percent
- [x] 50 percent
- [ ] 100 percent
- [ ] 200 percent

Explanation: 3 parity pieces for 6 data pieces is 3/6 = 50 percent.

### About how much master metadata do 1 PB of data in 64 MB chunks need at 64 bytes a chunk?

- [ ] 1 MiB
- [ ] 16 MiB
- [x] 1 GiB
- [ ] 16 TiB

Explanation: 16,777,216 chunks x 64 bytes = 2^30 bytes = 1 GiB.

### In an LSM tree, where does a new write go first, besides the memory buffer?

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

Explanation: "hot" is in [2, 3], "coffee" in [1, 2]; the overlap is [2].

## Diagram

```json
{ "kind": "graph", "caption": "GFS-style read path (our own drawing). The client asks the master which chunk holds the byte range and where its copies are (1), the master answers (2), and the client reads the data directly from one chunkserver (3). The master does not carry file data. The other chunkservers hold the other copies.", "nodes": [{ "id": "c", "label": "Client", "x": 10, "y": 50, "shape": "client" }, { "id": "m", "label": "Metadata master", "x": 50, "y": 14 }, { "id": "s1", "label": "Chunkserver 1", "x": 85, "y": 25 }, { "id": "s2", "label": "Chunkserver 2", "x": 85, "y": 55 }, { "id": "s3", "label": "Chunkserver 3", "x": 85, "y": 85 }], "edges": [{ "from": "c", "to": "m", "step": 1, "label": "where is it?" }, { "from": "m", "to": "c", "step": 2, "dashed": true }, { "from": "c", "to": "s2", "step": 3, "label": "read bytes" }, { "from": "s2", "to": "s1", "dashed": true }, { "from": "s2", "to": "s3", "dashed": true }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "LSM write path as in Bigtable: the write is appended to the commit log, then put in the memtable in memory; when the memtable is full it is written out as an immutable SSTable, and background compactions merge SSTables.", "steps": [{ "label": "Write arrives" }, { "label": "Append to commit log" }, { "label": "Insert in memtable" }, { "label": "Full: write SSTable" }, { "label": "Compaction merges SSTables" }] }
```
