---
id: hld-case-top-k-counting
title: "Case Study: Top-K and Click Counting"
next: none
roadmapSteps: dsa:heaps-tries, backend:deployment-cloud
---
<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-drafts.md. Numbers from docs/content/checks/hld-case-check.py (sections 12A to 12E). -->

## Overview

Many servers see a stream of events (clicks, searches, video views), and a dashboard must show the top K items of the last hour. The central trade-off is exactness against memory: counting every item exactly needs space for every item, while a small sketch gives answers that are close but never exact. After reading you can explain the count-min sketch, keep the top K in a small heap, and handle time windows and late events. This is one reasonable design built on made-up assumptions, not the answer.

## Topic: Requirements and scope

**Definition:** We build a service that takes click events and answers "top K items in the last hour", refreshed every minute. We leave out per-user history, billing and fraud filtering.

**Why:** Ask first: how many different items, how exact must the answer be, and how fresh? "Top 10 trending videos" can be approximate; "how many ad clicks do we bill" cannot.

**Example:** Requirements (assumptions): 1. Accept events from many servers. 2. Return the top K (K = 10) of the last hour. 3. Update every minute. 4. Counts may be a little too high but the real top items must appear. 5. Survive a crashed counter server. Out of scope: billing.

**Failure:** If exactness is not asked about, the interviewer's follow-up is "what if the number is used for payment?", and the whole design must change (see the last topic).

## Topic: Numbers

**Definition:** The estimate of memory for exact counting against a sketch. Each input is an assumption.

**Why:** It shows when exact counting stops fitting in memory.

**Example:** Assumption: 16 bytes per item (id and count) (12B). 100,000 items need 1.6 MB, 100,000,000 items need 1,600 MB, 1,000,000,000 items need 16 GB. Assumption: sketch error 0.1% of the total count, failure chance 1% (12A): width 2,719, depth 5, 13,595 counters, 54.4 KB at 4 bytes each. Assumption: a one-hour window made of 60 one-minute buckets (12D): 60 x 54 KB = 3.3 MB.

**Failure:** If the different items grow 10 times (a billion to ten billion), exact memory grows to 160 GB, while the sketch stays 54.4 KB. If the allowed error must be 10 times smaller, the width grows 10 times.

## Topic: API and data

**Definition:** Calls: `POST /events` (item id, event time) and `GET /top?k=10&window=1h`. Stored data: one counter structure per minute bucket, plus the current top list.

**Why:** Reads ask for a ranking, not for the count of one item, so we keep a ranking.

**Example:** A bucket: `minute, sketch (5 rows of 2,719 counters), top_list (item, estimate)`. The raw events go to a log (see System Design: Queues, Logs and Streaming) so a bucket can be rebuilt.

**Failure:** The model cannot answer "how many clicks did item X get last Tuesday" unless old buckets are kept; and a sketch cannot list its items, which is why we keep the candidate list.

## Topic: The first design

**Definition:** Diagram 1 shows it. Web servers write events to a log. Counter workers read the log, update the sketch of the current minute and a small list of top candidates. A merge step combines the 60 minute buckets and writes the top K to a cache that the dashboard reads.

**Why:** The log absorbs bursts and lets a worker restart from its position. Counting is spread over workers by item id, so one item is always counted by one worker (partitioning, see System Design: Scaling Basics).

**Example:** Write path: 1. A click is appended to the log, partitioned by item id. 2. The worker reads it. 3. It adds 1 to 5 cells of the minute's sketch. 4. It updates the top list. Read path (diagram 3): 5. A job merges buckets every minute. 6. It stores the top K in the cache. 7. The dashboard reads the cache.

**Failure:** The first bottleneck is one very popular item: all its events go to one worker. Fix: count it in several partial counters and add them.

## Topic: Counting without storing everything

**Definition:** The count-min sketch, from Cormode and Muthukrishnan (2005 journal paper; I read the full text). It is a table of counters with `d` rows and `w` columns and one hash function (a rule that turns an item into a number) per row. To add an item, add 1 to one cell in each row, the cell chosen by that row's hash. To ask for an item's count, look at its one cell in each row and take the smallest.

**Why:** The paper sets the width to ceil(e / error) and the depth to ceil(ln(1 / failure chance)). It proves that the estimate is never below the true count, and with probability at least 1 minus the failure chance it is at most the true count plus error times the total number of events. The reason is simple: other items can only add to a cell, never subtract, so every cell is too high or exact; the minimum is the least polluted. These guarantees hold when counts are only added (no negative updates). We use it because exact memory (16 GB for a billion items) is too much for one worker. We reject sampling (keeping every 100th event) because it can miss the rare items that still belong in a top list.

**Example:** Simulation (12A to 12C; assumption: 1,000,000 events over 100,000 items with a skewed spread). With error 0.1% and failure chance 1%, the sketch is 2,719 x 5. The allowed error is 0.1% of 1,000,000 = 1,000. The measured overcount of the true top 10 was between 54 and 143. Over 2,000 random items the largest overcount was 318. The sketch found all 10 of the true top 10, and its counts were never lower than the true counts. The paper's bound is the guarantee; our simulation only shows this data. The error and failure figures are our assumptions.

**Top K with a heap:** Keep a min-heap (a structure whose smallest entry is on top) of K items. For each event, estimate the item's count; if it is higher than the heap's smallest, put it in (or update it). The heap holds K entries, so memory is tiny. Because estimates are never too low, a real top item is not missed (our reasoning); an item with an inflated estimate may enter the list. For heavy hitters (items above a given share) the paper says every one is found and listing a non-heavy item has bounded chance.

**Failure:** Many items with similar counts: the error of up to 1,000 is larger than the gaps between ranks, so the order near the bottom of the top list is wrong. Fix: a wider sketch, or recount the K candidates exactly from the log.

## Topic: Windows and late events

**Definition:** A window is a span of time we count over. A tumbling window has a fixed size and no overlap; a sliding window has a fixed size and a step smaller than the size, so an event belongs to several windows. Both descriptions follow the Apache Flink documentation (read: the windows page and the time page of the current release). A watermark is a marker saying "no more events older than this time should arrive". Flink says a Watermark(t) declares that event time has reached t.

**Why:** We want "the last hour" every minute. Instead of re-counting 60 minutes, keep one sketch per minute (a tumbling window of 1 minute) and add the last 60 (a sliding hour); 60 buckets, 3.3 MB (12D). Merging is cell-by-cell addition of tables with the same size and hash functions; the paper notes that sketches are linear and so suit data spread over several sites. That is how counts from many servers are combined (our reasoning on how to apply it: all workers must use the same hash functions). Event time (when the click happened) differs from arrival time, so late events exist.

**Example:** Simulation (12E; assumption: 100,000 events, 5% arrive 3 minutes late, a minute closes 1 minute after its end). If lateness over 1 minute is dropped, 5,041 events (5.0%) miss their minute. If we allow 5 minutes of lateness, 0 are dropped, but each minute's result is final 5 minutes later. Flink's default allowed lateness is 0 and elements behind the watermark are dropped; with allowed lateness, the window state is kept longer and late elements still update it. Flink also says an operator reading several inputs uses the minimum of their event times, so one slow server holds back the watermark. We choose 1 minute of lateness for a dashboard and fix drops later from the log.

**Failure:** A late event after the window is final is lost from the sketch. For a dashboard that is fine. Not for money.

## Topic: Failures and scaling

**Definition:** Counter workers, the log and the cache can fail.

**Why:** The worker holds the only copy of a minute's sketch, so a crash loses it unless we can rebuild.

**Example:** A worker dies mid-minute. A new one reads the log from the last saved position (offset), and rebuilds the minute's sketch from the events. For one minute this takes the time to re-read that minute. The dashboard shows the old top list meanwhile. Exact against approximate: when a count is billed, count exactly from the log in a batch job (a job that runs over stored data), and use the sketch only for the live view.

**Failure:** At 10 times the events we add partitions and workers; the sketch size does not depend on the event count, only on the allowed error. The next limit is merge time for the 60 buckets and the log's retention.

## Questions

### Why does the sketch never undercount?

Collisions (two items in one cell) only add. Every cell holds at least the true count, so the minimum does too.

### How do you get the top K?

Keep a min-heap of K items, updated from the sketch's estimate on each event.

### How do you count the last hour?

One sketch per minute; add the newest 60 cell by cell.

### When must the count be exact?

When it decides money, such as billing: count from the log, not the sketch.

## Mistakes

- "The sketch can lose a popular item." It overcounts, never undercounts, so a true top item is not missed.
- "Drop late events always." That loses 5.0% in our simulation (12E); allow some lateness.
- "A sketch is exact if wide enough." It is approximate by design; the error is bounded, not zero.

## Quiz

### Two items share a cell in one row. What is true of the estimate?

- [ ] It can be too low
- [x] It can only be too high or exact
- [ ] It is always exact
- [ ] It becomes negative

Explanation: The shared cell has both counts added.

### How does the sketch answer a count query?

- [ ] The largest cell
- [ ] The average cell
- [x] The smallest of the item's cells, one per row
- [ ] The first row

Explanation: The smallest is least affected by collisions.

### 60 one-minute buckets of 54 KB. How much memory?

- [ ] 54 KB
- [x] About 3.3 MB
- [ ] 330 MB
- [ ] 16 GB

Explanation: 60 x 54.4 KB is 3,264 KB.

### What does Flink do by default with elements behind the watermark?

- [ ] Keeps them forever
- [x] Drops them (allowed lateness is 0)
- [ ] Doubles them
- [ ] Sends an email

Explanation: Allowed lateness is a setting that keeps window state longer.

### Which count must be exact?

- [ ] Trending searches
- [x] Ad clicks that are billed
- [ ] Popular videos
- [ ] Hot hashtags

Explanation: Money needs exact counts from the stored log.

## Diagram

```json
{ "kind": "graph", "caption": "Counting pipeline. Web servers append events to a log (1). Counter workers read the log (2) and update the minute's sketch (3). A merge job adds the 60 newest sketches and keeps the top K (4), and writes it to a cache (5) that the dashboard reads (6).", "groups": [{ "id": "dc", "label": "Our system" }], "nodes": [{ "id": "w", "label": "Web servers", "x": 8, "y": 50, "shape": "client" }, { "id": "l", "label": "Event log", "x": 30, "y": 50, "shape": "queue", "group": "dc" }, { "id": "c", "label": "Counter workers", "x": 52, "y": 20, "group": "dc" }, { "id": "s", "label": "Minute sketches", "x": 52, "y": 80, "shape": "database", "group": "dc" }, { "id": "m", "label": "Merge, top K", "x": 76, "y": 80, "group": "dc" }, { "id": "k", "label": "Cache", "x": 92, "y": 50, "shape": "cache", "group": "dc" }], "edges": [{ "from": "w", "to": "l", "step": 1 }, { "from": "l", "to": "c", "step": 2 }, { "from": "c", "to": "s", "step": 3 }, { "from": "s", "to": "m", "step": 4 }, { "from": "m", "to": "k", "step": 5 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "One click. The server appends the event to the log (1). The worker reads it (2), adds 1 to one cell in each of the 5 rows (3) and asks for the item's estimate, the smallest of the 5 cells (4). If the estimate beats the heap's smallest entry, the heap is updated (5).", "actors": [{ "id": "s", "label": "Web server" }, { "id": "l", "label": "Log" }, { "id": "w", "label": "Worker" }, { "id": "h", "label": "Sketch and heap" }], "messages": [{ "from": "s", "to": "l", "label": "Append click" }, { "from": "w", "to": "l", "label": "Read next event" }, { "from": "w", "to": "h", "label": "Add 1 in 5 rows" }, { "from": "h", "to": "w", "label": "Estimate = min of 5", "dashed": true }, { "from": "w", "to": "h", "label": "Update top-K heap" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Sliding hour from minute buckets. Each minute has its own sketch (1). Every minute the merge adds the newest 60 sketches cell by cell (2) and the oldest bucket is dropped (3, dashed). The result is the count for the last hour.", "groups": [{ "id": "b", "label": "Minute buckets" }], "nodes": [{ "id": "m1", "label": "Minute 1", "x": 15, "y": 20, "shape": "database", "group": "b" }, { "id": "m2", "label": "Minute 2", "x": 15, "y": 50, "shape": "database", "group": "b" }, { "id": "m3", "label": "Minute 60", "x": 15, "y": 80, "shape": "database", "group": "b" }, { "id": "a", "label": "Add cell by cell", "x": 55, "y": 50 }, { "id": "r", "label": "Last-hour top K", "x": 88, "y": 50, "shape": "cache" }], "edges": [{ "from": "m1", "to": "a", "step": 1 }, { "from": "m2", "to": "a", "step": 1 }, { "from": "m3", "to": "a", "step": 1 }, { "from": "a", "to": "r", "step": 2 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A late event. The minute 10:05 ends and, after the allowed lateness, is closed (1). A click from 10:05 then arrives late (2). The worker sees it is behind the watermark and drops it (3), or, if lateness is allowed, adds it to the minute (4).", "actors": [{ "id": "e", "label": "Late click" }, { "id": "w", "label": "Worker" }, { "id": "b", "label": "Minute 10:05" }], "messages": [{ "from": "w", "to": "b", "label": "Close minute" }, { "from": "e", "to": "w", "label": "Click from 10:05" }, { "from": "w", "to": "e", "label": "Behind watermark: dropped", "dashed": true }, { "from": "w", "to": "b", "label": "Or add if lateness allowed" }] }
```
