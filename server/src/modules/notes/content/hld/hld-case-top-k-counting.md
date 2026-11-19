---
id: hld-case-top-k-counting
title: "Case Study: Top-K and Click Counting"
lastChecked: 2026-11-13
next: none
roadmapSteps: dsa:heaps-tries, backend:deployment-cloud
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

Many servers see a stream of events (clicks, searches, video views), and a dashboard must show the top K items of the last hour. The central trade-off is exactness against memory: counting every item exactly needs space for every item, while a small sketch gives answers that are close but may be too high. After reading you can explain the count-min sketch, keep the top K in a small heap (a list that always shows which entry is the smallest), and handle time windows and late events.

## Topic: Requirements and scope

**Definition:** We build a service that takes click events and answers "top K items in the last hour", refreshed every minute. We leave out per-user history and billing.

**Why:** Ask first how exact the answer must be. "Top 10 trending videos" can be approximate; "ad clicks to bill" cannot.

**Example:** Requirements (assumptions): 1. Accept events from many servers. 2. Return the top K (K = 10) of the last hour. 3. Update every minute. 4. Counts may be a little too high; the real top items should appear (not guaranteed, see below). 5. Survive a crashed counter server.

**Failure:** If exactness is not asked about, the follow-up is "what if the number is used for payment?" (see Failures and scaling).

## Topic: Numbers

**Definition:** An estimate is a rough calculation done before building. Each input is an assumption.

**Why:** It shows when exact counting stops fitting in memory.

**Example:** Exact counting, 16 bytes per item (id and count): 100,000 items x 16 = 1,600,000 bytes = 1.6 MB; 100,000,000 items = 1,600 MB; 1,000,000,000 items = 16 GB. A sketch of width 2,719 and depth 5 (sizing: see Counting without storing everything): 2,719 x 5 = 13,595 counters x 4 bytes = 54.4 KB. A one-hour window made of 60 one-minute buckets: 60 x 54.4 KB = 3,264 KB = 3.3 MB.

**Failure:** With ten billion items, exact memory is 160 GB; the sketch stays 54.4 KB. If the allowed error must be 10 times smaller, the width grows 10 times.

## Topic: API and data

**Definition:** Calls: `POST /events` (item id, event time) and `GET /top?k=10&window=1h`. Stored: one sketch and one candidate list per minute, plus the current top list.

**Why:** Reads ask for a ranking, so we keep a ranking.

**Example:** A bucket: `minute, sketch (5 rows of 2,719 counters), candidates (item, estimate)`. The raw events go to a log (a record of events written in order and never changed; see System Design: Queues, Logs and Streaming) so a bucket can be rebuilt.

**Failure:** We cannot answer "clicks for item X last Tuesday" unless old buckets are kept. A sketch cannot list its items, so we keep candidate lists.

## Topic: The first design

**Definition:** Diagram 1 shows it. Web servers write events to the log. Counter workers read the log, update the sketch of the current minute and a small list of top candidates. A merge step combines the 60 minute buckets and writes the top K to a cache that the dashboard reads.

**Why:** The log absorbs bursts and lets a worker restart from its position. Counting is split over workers by item id, so one item is counted by one worker (see System Design: Scaling Basics).

**Example:** Write path: 1. A click is appended to the log, partitioned by item id. 2. The worker reads it. 3. It adds 1 to 5 cells of the minute's sketch. 4. It updates the candidate list. Read path: 5. A job merges buckets every minute. 6. It stores the top K in the cache. 7. The dashboard reads the cache.

**Failure:** The first bottleneck is one very popular item: all its events go to one worker. Fix: count it in several partial counters and add them.

## Topic: Counting without storing everything

**Definition:** The count-min sketch (Cormode and Muthukrishnan, 2005). It is a table of counters with `d` rows and `w` columns and one hash function (a rule that turns an item into a number) per row. To add an item, add 1 to one cell in each row, the cell chosen by that row's hash. To ask for an item's count, read its cell in each row and take the smallest. Picture: 3 rows, 4 columns; "cat" hashes to column 2, 4 and 1 in rows 1, 2, 3. Adding "cat" adds 1 to those three cells; asking reads them and takes the smallest.

**Why:** Other items can only add to a cell, never subtract, so each cell is equal to or higher than the true count (when counts are only added). The smallest cell is the one disturbed least. The paper sizes it: width = e (about 2.718) divided by the error you accept, rounded up; depth = ln(1 / failure chance), rounded up. It proves the estimate is never below the true count and, with chance at least 1 minus the failure chance, at most the true count plus (error x total events), for one query. We use it because 16 GB for a billion items is too much for one worker. Sampling (keeping every 100th event) is rejected: it can miss rare items.

**Example:** Our test: 1,000,000 events over 100,000 items with a skewed spread, error 0.1%, failure chance 1% (assumptions). The allowed error is 0.1% of 1,000,000 = 1,000. The ten most clicked items were counted too high by only 54 to 143; among 2,000 random items the worst overcount was 318. Ranking all the estimates found all 10 of the true top 10. One run, simple hash (CRC32, a seed per row); the paper's bound is the guarantee.

**Top K with a heap:** Keep a min-heap (the smallest of the K entries on top) of K items. For each event, estimate the item's count; if it beats the smallest, replace it (or update the item). Memory is tiny. But a true top item can be pushed out if K other items have estimates above its true count, which can happen when counts lie within the error of each other. The paper's own method keeps every item whose estimate is above a chosen share of all events so far; it shows every item above the share is found.

**Failure:** Many items with similar counts: the error of up to 1,000 is larger than the gaps between ranks, so the order near the bottom of the list is wrong. The error is a share of the total, so it grows with the window. Fix: a wider sketch, or recount the K candidates exactly from the log. Exact counting per worker is the usual first answer.

## Topic: Windows and late events

**Definition:** Apache Flink is a widely used program for processing streams of events. A window is a span of time we count over. A tumbling window is a fixed block of time with no overlap (10:00 to 10:01, then 10:01 to 10:02). A sliding window has a fixed size but moves forward in smaller steps (the last 60 minutes, every minute), so one event falls in many windows. A watermark is a marker saying "we expect no more events older than this time".

**Why:** We want "the last hour" every minute. Keep one sketch per minute (a tumbling window of 1 minute) and add the last 60 (a sliding hour). Adding two tables cell by cell works when both have the same size and hash functions; the paper notes this property (linearity) suits data spread over machines. We use it for the 60 minutes and for partial counters of a very popular item. An item just below the cut-off in every minute could still top the hour, so each minute keeps more candidates than K (our reasoning: 10 x K) and the hour is ranked from all of them; the guarantee is not complete. Event time (when the click happened) differs from arrival time, so late events exist.

**Example:** We close each minute 1 minute after it ends. Assumption: 100,000 events, 5% arrive 3 minutes late. 5% of 100,000 = 5,000 miss their minute (a test draw gave 5,041, 5.0%); allowing 5 minutes of lateness loses none, but each minute's result is final 5 minutes later. Flink's default allowed lateness is 0 and events behind the watermark are dropped; with allowed lateness, late events still update the window. Flink also says an operator reading several input streams uses the minimum of their event times, so one slow input stream (for example a quiet log partition) holds back the watermark.

**Failure:** We choose 1 minute of lateness for a dashboard and accept losing the 5%, repairing from the log. If lateness is mostly under 1 minute, the loss is small. Not fine for money.

## Topic: Failures and scaling

**Definition:** Counter workers, the log and the cache can fail.

**Why:** The worker holds the only copy of a minute's sketch.

**Example:** A worker dies mid-minute. A new one reads the log from the last saved position (offset) and rebuilds the sketch; the dashboard shows the old list meanwhile. For counts that are billed, use exact counting: a batch job (a program that runs over stored data) counts from the log. Use the sketch only for the live view.

**Failure:** With ten times the events we add partitions and workers; the sketch size depends only on the allowed error. The next limit is merge time and the log's retention.

## Questions

### Why does the sketch never undercount?

When counts are only added, collisions (two items in one cell) only add. Every cell holds at least the true count, so the minimum does too.

### How do you get the top K?

A min-heap of K items, updated from the sketch's estimate; recount the candidates if exact order matters.

### How do you count the last hour?

One sketch per minute; add the newest 60 cell by cell.

### When must the count be exact?

When it decides money, such as billing: count from the log, not the sketch.

## Mistakes

- "The sketch can lose a popular item." It never loses count, but a K-item list can still drop a true top item when counts are within the error of each other.
- "Drop late events always." If many events are late, they are lost (5% in our assumed case); set the lateness to match how late events really arrive.
- "A sketch is exact if wide enough." The error is bounded, not zero.

## Quiz

### Two items share one cell in one row. What is true of the count read from that row for either item?

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

### What does Flink do by default with an event that arrives after the watermark has passed its time?

- [ ] Adds it to the window anyway
- [x] Drops it (allowed lateness is 0)
- [ ] Holds it for 5 minutes
- [ ] Asks the sender to resend

Explanation: Allowed lateness is a setting that keeps window state longer.

### Which count must be exact?

- [ ] Trending searches
- [x] Ad clicks that are billed
- [ ] Popular videos
- [ ] Hot hashtags

Explanation: Money needs exact counts from the stored log.

## Diagram

```json
{ "kind": "graph", "caption": "Counting pipeline. Web servers append events to a log (1). Counter workers read the log (2) and update the minute's sketch and candidate list (3). A merge job adds the 60 newest sketches and keeps the top K (4), and writes it to a cache (5) that the dashboard reads (6).", "groups": [{ "id": "dc", "label": "Our system" }], "nodes": [{ "id": "w", "label": "Web servers", "x": 12, "y": 18, "shape": "client" }, { "id": "l", "label": "Event log", "x": 44, "y": 18, "shape": "queue", "group": "dc" }, { "id": "c", "label": "Workers", "x": 82, "y": 18, "group": "dc" }, { "id": "s", "label": "Minute sketches", "x": 82, "y": 52, "shape": "database", "group": "dc" }, { "id": "m", "label": "Merge, top K", "x": 82, "y": 86, "group": "dc" }, { "id": "k", "label": "Cache", "x": 44, "y": 86, "shape": "cache", "group": "dc" }, { "id": "dash", "label": "Dashboard", "x": 12, "y": 86, "shape": "client" }], "edges": [{ "from": "w", "to": "l", "step": 1 }, { "from": "l", "to": "c", "step": 2 }, { "from": "c", "to": "s", "step": 3 }, { "from": "s", "to": "m", "step": 4 }, { "from": "m", "to": "k", "step": 5 }, { "from": "k", "to": "dash", "step": 6 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "One click. The server appends the event to the log (1). The worker reads it (2), adds 1 to one cell in each of the 5 rows (3) and asks for the item's estimate, the smallest of the 5 cells (4). If the estimate beats the heap's smallest entry, the heap is updated (5).", "actors": [{ "id": "s", "label": "Web server" }, { "id": "l", "label": "Log" }, { "id": "w", "label": "Worker" }, { "id": "h", "label": "Sketch and heap" }], "messages": [{ "from": "s", "to": "l", "label": "Append click" }, { "from": "w", "to": "l", "label": "Read next event" }, { "from": "w", "to": "h", "label": "Add 1 in 5 rows" }, { "from": "h", "to": "w", "label": "Estimate = min of 5", "dashed": true }, { "from": "w", "to": "h", "label": "Update top-K heap" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Sliding hour from minute buckets. Each minute has its own sketch (1). Every minute the merge adds the newest 60 sketches cell by cell (2) to give the count for the last hour. The oldest bucket then falls out of the window and a new one comes in.", "groups": [{ "id": "b", "label": "Minute buckets" }], "nodes": [{ "id": "m1", "label": "Minute 1", "x": 15, "y": 20, "shape": "database", "group": "b" }, { "id": "m2", "label": "Minutes 2 to 59", "x": 15, "y": 50, "shape": "database", "group": "b" }, { "id": "m3", "label": "Minute 60", "x": 15, "y": 80, "shape": "database", "group": "b" }, { "id": "a", "label": "Add cell by cell", "x": 55, "y": 50 }, { "id": "r", "label": "Last-hour top K", "x": 88, "y": 50, "shape": "cache" }], "edges": [{ "from": "m1", "to": "a", "step": 1 }, { "from": "m2", "to": "a", "step": 1 }, { "from": "m3", "to": "a", "step": 1 }, { "from": "a", "to": "r", "step": 2 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A late event. The minute 10:05 ends and, after the allowed lateness, is closed (1). A click from 10:05 then arrives late (2). The worker sees it is behind the watermark and drops it (3), or, if lateness is allowed, adds it to the minute (4).", "actors": [{ "id": "e", "label": "Late click" }, { "id": "w", "label": "Worker" }, { "id": "b", "label": "Minute 10:05" }], "messages": [{ "from": "w", "to": "b", "label": "Close minute" }, { "from": "e", "to": "w", "label": "Click from 10:05" }, { "from": "w", "to": "e", "label": "Behind watermark: dropped", "dashed": true }, { "from": "w", "to": "b", "label": "If allowed: add click" }] }
```
