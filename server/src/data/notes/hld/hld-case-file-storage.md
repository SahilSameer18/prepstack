---
id: hld-case-file-storage
title: "Case Study: File Storage and Sync"
lastChecked: 2026-11-13
next: hld-case-video-streaming
roadmapSteps: devops-cloud:cloud-aws-basics, backend:database-design
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A file storage and sync service (like Dropbox) keeps a user's files safe in the cloud and the same on every device. This note builds one reasonable design from stated assumptions. The central trade-off is how to cut files into blocks: small blocks mean less data to upload after an edit, but more records to track. The numbers are examples worked out with a short program. After this note you can explain block uploads, a change list per user, and offline edits on two devices.

## Topic: Requirements and scope

**Definition:** We build: upload and download files from several devices, automatic sync of changes, and version history. We leave out sharing, real-time co-editing, and search inside files.

**Why:** Clarify first: how large are files, how many devices per user, and must a change reach other devices in seconds or minutes?

**Example:** Requirements: (1) a file saved on one device appears on the others; (2) a small edit to a big file must not re-upload the whole file; (3) no file is lost once the upload is acknowledged; (4) a device that was offline catches up when it reconnects.

**Failure:** If requirement 2 is skipped, a 1 GB video with one changed byte costs 1 GB of upload each time.

## Topic: Numbers

**Definition:** An estimate is a rough calculation done before building. Metadata is information about a file (name, version, block list), not the file itself. Every input below is an assumption, not a real company's figure.

**Why:** The numbers decide the block size and whether metadata fits one database.

**Example:** Assumption: 4 MB blocks. A 1 MB file is 1 block; a 100 MB file is 100 / 4 = 25 blocks; a 1024 MB file is 256 blocks. Changing one byte re-uploads one 4 MB block: 4 / 100 = 4.00% of the 100 MB file, 4 / 1024 = 0.39% of the 1024 MB file.

Metadata, assumption: 100 million users, 200 files each, an average file of about 2 MB (one block), 500 bytes of metadata a file (name, version, block hash). 100,000,000 x 200 = 20,000,000,000 files; x 500 bytes = 10,000,000,000,000 bytes = 10 TB.

**Failure:** If files average 10 times more blocks, each file needs ten block hashes (32 bytes each) instead of one, the records grow about 10 times, and the metadata store must be split by user (see System Design: Replication and Partitioning).

## Topic: API and data

**Definition:** A hash is a short fingerprint calculated from data: the same data always gives the same fingerprint. SHA-256 is a standard way to make a 256-bit one. Calls: `PUT /blocks/{hash}` stores one block; `POST /files/commit` tells the server "this file is now made of these blocks", sending a file path and its ordered list of block hashes (a blocklist); `GET /changes?cursor=c` returns what changed since the cursor. Records: a file record (user id, path, version, blocklist) and a block record (hash, size, storage location).

**Why:** Splitting file content (blocks, in a block store) from file facts (metadata, in a database) lets each scale on its own. Dropbox described this split in 2014: files cut into 4 MB blocks, each hashed with SHA-256, and the metadata server stores blocklists, not file contents.

**Example:** `commit {path: "/a.doc", blocks: [h1, h2, h3]}`. The server answers `need: [h2, h3]` if it lacks those blocks, as the 2014 post described.

**Failure:** Our records answer "which files hold block h?" poorly unless we index that too. Deleting a block safely needs a reference count (how many files use it).

## Topic: The first design

**Definition:** Parts (diagram 1): a client app, a stateless API server (it remembers nothing between requests, so any machine can answer any request), a metadata database and a block store. A request flows: the client cuts the file into blocks and hashes them; asks the API which blocks are missing; uploads those straight to the block store; commits the blocklist.

**Why:** The block store is built for big, cheap, durable data; the database for small, fast, queryable records. The 2014 post said the uploading client talks directly to the block servers, so ours does too, with a signed request (one carrying proof from the API that it may upload).

**Example:** Write path (diagram 2): 1 commit the blocklist; 2 the server replies which blocks are missing; 3 the client uploads them to the block store; 4 the client commits again; 5 the server records the new version and a change entry. Read path (diagram 3): 1 a device asks for changes since its cursor; 2 it receives changed files; 3 it downloads only blocks it does not have.

**Failure:** First bottleneck: one metadata database serving the change lists of all users. Fix: partition by user id (one group of users per machine).

## Topic: Splitting files into blocks

**Definition:** The decision: cut each file into blocks and upload only the changed ones. Fixed-size blocks cut every 4 MB. Content-defined blocks cut where the content itself says so.
- A rolling hash is a fingerprint of a small window of bytes. When the window moves one byte, the fingerprint is updated cheaply.
- At every position we check the fingerprint; when it fits a chosen pattern, we cut the file there.
- This cutting rule is our own design (known as content-defined chunking); we read no primary source for it.

The rsync report (Tridgell and Mackerras, web copy dated 1998) uses a similar sliding checksum for a different job: finding old blocks inside a new file at any offset. It does not cut files.

**Why:** Fixed blocks are simple. But inserting one byte at the start shifts every later byte, so every fixed block changes. Content-defined cuts depend only on the few bytes just before them, so after the insert the later cuts land on the same bytes again. The price: more client work and uneven blocks.

**Example:** We tested a 4 MB file of random bytes and inserted one byte at the very start. With fixed 64 KB blocks, 4 MB gives 64 blocks and the extra byte a 65th tiny one; all 65 differ. With content-defined cuts (a 16 KB minimum, about 82 KB on average in this run) there were 50 blocks and only 1 differed.

Deduplication (keeping one copy of equal blocks) follows from hashes. Assumption: 1 million users store the same 100 MB installer: 1,000,000 x 100 MB = 100,000,000 MB = 100 TB without it; 100 MB plus a small reference per user with it.

**Failure:** Very small blocks mean huge block records; very large ones re-upload too much. Dropbox's 2014 post described 4 MB blocks, one company's choice in that year, not a rule. The same post says it used rsync and compression inside requests, so it did not always send a whole block; our example ignores that.

## Topic: Metadata and syncing devices

**Definition:** Our design: the metadata store keeps, per user, a numbered change list (file added, edited, moved, deleted). A device remembers a cursor, the last change number it has seen, and asks for changes after it. Dropbox's 2020 post described unique file ids that survive moves; we reuse that idea so a rename is one change, not a delete plus an add.

**Why:** Asking "what changed since cursor 40?" is cheap and works after any offline time. Comparing whole folder trees each time would be slow. The rejected alternative: the server pushes every change to every device and keeps no cursor; a device that was off would miss changes.

**Example:** Both devices start from version 5 of `a.doc`. Device A reconnects first and commits; the file becomes version 6. Device B, which edited offline, commits later, but its change was made on version 5. The server sees that version 6 exists, so it keeps both: B's edit is saved as `a (conflicted copy).doc`.

Dropbox's 2020 post gave a harder case. Device A moves folder X into folder Y while device B, offline, moves Y into X. Both moves together would put each folder inside the other. It said its new engine keeps the original directories, with the result depending on which client uploads first.

**Failure:** The block store must not lose blocks. Dropbox's 2016 post described new blocks first replicated, later erasure coded (the data is split into pieces plus extra repair pieces, so a lost piece can be rebuilt without keeping full copies; see System Design: Storage and Indexes). Our reasoning: coding saves space, but rebuilding a lost piece means reading several other disks. One user's changes are written in order, so that list lives on one partition.

## Topic: Failures and scaling

**Definition:** Failures: an upload breaks halfway, a block server is lost, the metadata database fails over.

**Why:** Losing a file is worse than slow sync.

**Example:** A 100 MB upload (25 blocks) breaks after 10 blocks. The client reconnects, asks which of the 25 hashes the server holds, and uploads 15. The user sees the progress bar continue. Other devices see the file only after the final commit.

**Failure:** With ten times more users, metadata (10 TB to 100 TB under our assumptions) needs more partitions, and the change-list lookups need caching. Users with huge folders overload their one partition.

## Questions

### How do you upload a small edit to a big file?

Cut the file into blocks, hash them, ask the server which hashes it lacks, upload only those, then commit the new blocklist.

### Why content-defined blocks?

With fixed blocks, one inserted byte shifts everything and all blocks change (65 of 65 in our test). Content-defined cuts re-align, so 1 of 50 changed.

### What if two devices edit the same file offline?

The second commit is based on an old version, so the server saves it as a conflict copy and keeps both.

## Mistakes

- "Store whole files and re-upload on every change." This wastes bandwidth; the block split fixes it.
- "Fixed blocks are enough for any edit." An insert near the start changes every block.
- "Last write wins is fine." It silently destroys one user's edit; keep a conflict copy.

## Quiz

### A 1024 MB file uses 4 MB blocks. One byte changes in place. What percent is re-uploaded?

- [ ] 4.00%
- [x] 0.39%
- [ ] 25%
- [ ] 100%

Explanation: One block of 4 MB out of 1024 MB is 0.39%.

### What does a rolling hash let us do?

- [ ] Encrypt blocks
- [x] Find cut points cheaply at every position in a file
- [ ] Delete duplicate files
- [ ] Order the change list

Explanation: It is updated with a little work per byte as the window moves, so every position can be checked.

### Why keep metadata separate from the block store?

- [ ] Blocks cannot be hashed
- [ ] Databases cannot hold numbers
- [x] Each part scales on its own and has different needs
- [ ] It avoids erasure coding

Explanation: Small queryable records and big durable data suit different stores.

### What is a cursor?

- [ ] A file lock
- [x] The last change number a device has seen
- [ ] A block hash
- [ ] A conflict copy

Explanation: The device asks for changes after it.

### Two offline devices edit one file. What does our design do?

- [ ] Drops the second edit
- [x] Keeps both, saving the later one as a conflict copy
- [ ] Locks the file forever
- [ ] Deletes the older version

Explanation: The second commit names an old version, so it cannot replace the newer one.

## Diagram

```json
{ "kind": "graph", "caption": "Main architecture (our own design). The client sends commit and change requests (1) to a stateless API server, which reads and writes file records in the metadata database (2). The client uploads blocks straight to the block store (3), as Dropbox described in 2014; the API server checks with the block store which blocks exist (4, dashed).", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "c", "label": "Client app", "x": 10, "y": 50, "shape": "client" }, { "id": "api", "label": "API server", "x": 50, "y": 20, "group": "dc" }, { "id": "m", "label": "Metadata DB", "x": 88, "y": 20, "shape": "database", "group": "dc" }, { "id": "b", "label": "Block store", "x": 50, "y": 82, "shape": "database", "group": "dc" }], "edges": [{ "from": "c", "to": "api", "step": 1 }, { "from": "api", "to": "m", "step": 2 }, { "from": "c", "to": "b", "step": 3 }, { "from": "api", "to": "b", "step": 4, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path: the client commits the list of block hashes, the server names the missing blocks, the client uploads only those straight to the block store, then commits again and the server records a new version.", "actors": [{ "id": "c", "label": "Client" }, { "id": "a", "label": "API server" }, { "id": "s", "label": "Block store" }], "messages": [{ "from": "c", "to": "a", "label": "Commit blocklist" }, { "from": "a", "to": "c", "label": "Need blocks h2, h3", "dashed": true }, { "from": "c", "to": "s", "label": "Upload h2, h3" }, { "from": "c", "to": "a", "label": "Commit again" }, { "from": "a", "to": "c", "label": "New version saved", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path: a device sends its cursor, receives the changed files, and downloads only the blocks it does not already have straight from the block store.", "actors": [{ "id": "d", "label": "Device" }, { "id": "a", "label": "API server" }, { "id": "s", "label": "Block store" }], "messages": [{ "from": "d", "to": "a", "label": "Changes since cursor 40?" }, { "from": "a", "to": "d", "label": "Changes 41 to 45", "dashed": true }, { "from": "d", "to": "s", "label": "Get missing blocks" }, { "from": "s", "to": "d", "label": "Blocks", "dashed": true }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "Conflict case: both devices start from version 5, the first commit becomes version 6, the second commit names version 5, so the server keeps it as a conflict copy.", "steps": [{ "label": "A and B at version 5" }, { "label": "A commits: version 6" }, { "label": "B commits on version 5" }, { "label": "Server sees mismatch" }, { "label": "B saved as conflict copy" }] }
```
