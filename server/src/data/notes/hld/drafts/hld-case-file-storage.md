---
id: hld-case-file-storage
title: "Case Study: File Storage and Sync"
next: hld-case-video-streaming
roadmapSteps: devops-cloud:cloud-aws-basics, backend:database-design
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-drafts.md. Numbers from docs/content/checks/hld-case-check.py (section 7). -->

## Overview

A file storage and sync service (like Dropbox) keeps a user's files safe in the cloud and the same on every device. This note builds one reasonable design from stated assumptions. The central trade-off is how to cut files into blocks: small blocks save upload bandwidth but create more records to track. Interviewers ask it to test storage, metadata and conflict thinking. After this note you can explain block uploads, a change list per user, and what happens when two devices edit offline.

## Topic: Requirements and scope

**Definition:** We build: upload and download files from several devices, automatic sync of changes, and version history. We leave out sharing between users, real-time co-editing of one document, search inside files and the desktop client's file-watching code.

**Why:** Sharing and co-editing each need their own design. Clarify first: how large are files, how many devices per user, and must a change reach other devices in seconds or minutes?

**Example:** Requirements: (1) a file saved on one device appears on the others; (2) a small edit to a big file must not re-upload the whole file; (3) no file is lost once the upload is acknowledged; (4) a device that was offline catches up when it reconnects. Out of scope: sharing, co-editing.

**Failure:** If requirement 2 is skipped, a 1 GB video with one changed byte costs 1 GB of upload each time. The interviewer's follow-up is "what if two devices edit the same file?"

## Topic: Numbers

**Definition:** Estimates for block count and metadata size. Every input below is an assumption, not a real company's figure.

**Why:** The numbers decide the block size and whether metadata fits one database.

**Example:** Assumption: 4 MB blocks. A 1 MB file is 1 block; a 100 MB file is 25 blocks; a 1024 MB file is 256 blocks. Changing one byte re-uploads 4 MB: 4.00% of the 100 MB file and 0.39% of the 1024 MB file. Assumption: 100 million users, 200 files each, 500 bytes of metadata a file: 10 TB of metadata (100,000,000 x 200 x 500 bytes).

**Failure:** If files average 10x more blocks than assumed, the block records grow 10x and one database no longer holds them; the metadata store must be split by user (see System Design: Replication and Partitioning).

## Topic: API and data

**Definition:** Calls: `PUT /blocks/{hash}` stores one block; `POST /files/commit` sends a file path and its ordered list of block hashes (a blocklist); `GET /changes?cursor=c` returns what changed since the cursor. Records: a file record (user id, path, version, blocklist) and a block record (hash, size, storage location).

**Why:** Splitting file content (blocks, in a block store) from file facts (metadata, in a database) lets each scale on its own. Dropbox described this split in 2014: files cut into 4 MB blocks, each hashed with SHA-256, and the metadata server stores blocklists, not file contents. Its 2016 Magic Pocket post described a block store whose blocks are never changed after writing, with edits tracked in a separate system.

**Example:** `commit {path: "/a.doc", blocks: [h1, h2, h3]}`. The server answers `need: [h2, h3]` if it lacks those blocks, as the 2014 post described.

**Failure:** The model answers "which files hold block h?" poorly unless we index that too; deleting a block safely needs a reference count (how many files use it).

## Topic: The first design

**Definition:** Parts (diagram 1): a client app, an API server, a metadata database and a block store. A request flows: client cuts the file into blocks and hashes them; asks the API which blocks are missing; uploads those; commits the blocklist.

**Why:** The API server holds no state, so it scales by adding machines. The block store is built for big, cheap, durable data; the database for small, fast, queryable records.

**Example:** Write path (diagram 2): 1 commit the blocklist; 2 server replies which blocks are missing; 3 client uploads them; 4 client commits again; 5 server records the new version and a change entry. Read path (diagram 3): 1 device asks for changes since its cursor; 2 receives changed files; 3 downloads only blocks it does not have.

**Failure:** First bottleneck: one metadata database serving the change lists of all users. Fix: partition by user id.

## Topic: Splitting files into blocks

**Definition:** The decision: cut each file into blocks and upload only the changed ones. Fixed-size blocks cut every 4 MB. Content-defined blocks cut where the content itself says so. A rolling hash (a number computed over a small sliding window of bytes that can be updated cheaply when the window moves one byte) is checked at every position; when it matches a pattern, we cut there. The rsync report by Tridgell and Mackerras (1998) describes such a rolling checksum: one part is the sum of the bytes in the window, another is a weighted sum; sliding by one byte means subtracting the byte that left and adding the one that entered, so every offset in a file can be checked cheaply. It used a stronger checksum only for blocks where the cheap one already matched.

**Why:** Fixed blocks are simple. But inserting one byte at the start shifts every later byte, so every fixed block changes. Content-defined cuts depend on nearby bytes, so they re-align after the insert. The price is more computing on the client and uneven block sizes.

**Example:** Simulation on 4 MB of random bytes with 1 byte inserted at the start: fixed 64 KB blocks, 65 of 65 differ. Content-defined blocks of about 64 KB average, 1 of 50 differ. Deduplication (keeping one copy of equal blocks) follows from hashes: assumption: 1 million users store the same 100 MB installer; 100 TB without it, 100 MB plus a small reference per user with it.

**Failure:** Very small blocks mean huge block records; very large ones re-upload too much. Dropbox's 2014 post described 4 MB blocks; that is one company's choice in that year, not a rule. We did not find a primary source on privacy effects of deduplication, so we make no claim.

## Topic: Metadata and syncing devices

**Definition:** Our design: the metadata store keeps, per user, a numbered change list (file added, edited, moved, deleted). A device remembers a cursor, the last change number it has seen, and asks for changes after it. Dropbox's 2020 post described giving files unique ids that survive moves; we reuse that idea so a rename is one change, not a delete plus an add.

**Why:** Asking "what changed since cursor 40?" is cheap and works after any offline time. Comparing whole folder trees each time would be slow. The rejected alternative: the server pushes every change to every device and keeps no cursor; a device that was off would miss changes.

**Example:** Device A edits `a.doc` offline, device B edits it too. A reconnects and commits at version 5, becoming version 6. B then commits based on version 5; the server sees version 6 exists, so it keeps both: B's edit is saved as a conflict copy `a (conflicted copy).doc`. Dropbox's 2020 post gave a conflict example about two offline folder moves that would create a cycle and said its new engine keeps the original directories, with the result depending on which client uploads first. Resumable uploads: the client uploads block by block, so after a break it asks which blocks are stored and sends only the rest.

**Failure:** The block store must not lose blocks. Dropbox's 2016 post described new blocks first replicated, later erasure coded for storage efficiency (see System Design: Storage and Indexes). Copies are fast to read; coding saves space but makes rebuilds costlier. For the change list, a user's changes must be written in order, so one user's list lives on one partition (see System Design: Consistency and CAP).

## Topic: Failures and scaling

**Definition:** Failures: an upload breaks halfway, a block server is lost, the metadata database fails over.

**Why:** Losing a file is worse than slow sync, so durability beats speed.

**Example:** A 100 MB upload (25 blocks) breaks after 10 blocks. The client reconnects, asks which of the 25 hashes the server holds, and uploads 15. The user sees the progress bar continue. The file only appears for other devices after the final commit, so nobody sees a half-uploaded file.

**Failure:** At 10x users, metadata (10 TB to 100 TB under our assumptions) needs more partitions, and the change-list lookups need caching. Hot users with huge folders become a hot partition.

## Questions

### How do you upload a small edit to a big file?

Cut the file into blocks, hash them, ask the server which hashes it lacks, upload only those, then commit the new blocklist.

### Why content-defined blocks?

With fixed blocks, one inserted byte shifts everything and all blocks change (65 of 65 in our simulation). Content-defined cuts re-align, so 1 of 50 changed.

### How does a device catch up after being offline?

It sends its cursor and gets the changes after it, then downloads the blocks it lacks.

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

Explanation: It is updated by one subtraction and one addition per byte, so every position can be checked.

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
{ "kind": "graph", "caption": "Main architecture (our own design). The client sends block and commit requests (1) to a stateless API server, which reads and writes file records in the metadata database (2) and stores blocks in the block store (3). The client uploads blocks and asks for changes through the same API.", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "c", "label": "Client app", "x": 8, "y": 50, "shape": "client" }, { "id": "api", "label": "API server", "x": 42, "y": 50, "group": "dc" }, { "id": "m", "label": "Metadata DB", "x": 82, "y": 20, "shape": "database", "group": "dc" }, { "id": "b", "label": "Block store", "x": 82, "y": 80, "shape": "database", "group": "dc" }], "edges": [{ "from": "c", "to": "api", "step": 1 }, { "from": "api", "to": "m", "step": 2 }, { "from": "api", "to": "b", "step": 3 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path: the client commits the list of block hashes, the server names the missing blocks, the client uploads only those, then commits again and the server records a new version.", "actors": [{ "id": "c", "label": "Client" }, { "id": "a", "label": "API server" }, { "id": "s", "label": "Block store" }], "messages": [{ "from": "c", "to": "a", "label": "Commit blocklist" }, { "from": "a", "to": "c", "label": "Need blocks h2, h3", "dashed": true }, { "from": "c", "to": "s", "label": "Upload h2, h3" }, { "from": "c", "to": "a", "label": "Commit again" }, { "from": "a", "to": "c", "label": "New version saved", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path: a device sends its cursor, receives the changed files, and downloads only the blocks it does not already have.", "actors": [{ "id": "d", "label": "Device" }, { "id": "a", "label": "API server" }, { "id": "s", "label": "Block store" }], "messages": [{ "from": "d", "to": "a", "label": "Changes since cursor 40?" }, { "from": "a", "to": "d", "label": "Changes 41 to 45", "dashed": true }, { "from": "d", "to": "s", "label": "Get missing blocks" }, { "from": "s", "to": "d", "label": "Blocks", "dashed": true }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "Conflict case: both devices start from version 5, the first commit becomes version 6, the second commit names version 5, so the server keeps it as a conflict copy.", "steps": [{ "label": "A and B at version 5" }, { "label": "A commits: version 6" }, { "label": "B commits on version 5" }, { "label": "Server sees mismatch" }, { "label": "B saved as conflict copy" }] }
```
