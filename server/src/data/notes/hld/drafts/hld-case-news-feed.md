---
id: hld-case-news-feed
title: "Case Study: News Feed"
next: hld-case-file-storage
roadmapSteps: backend:database-design, fullstack:deployment-scaling
---
<!-- Draft 13 Nov 2026, not published. Numbers from docs/content/checks/hld-case-check.py (sections 6A to 6D) and shown arithmetic. Company facts: "Scaling Memcache at Facebook" (NSDI 2013, pages 385 to 393 read; later pages not read) and "TAO: Facebook's Distributed Data Store for the Social Graph" (USENIX ATC 2013, pages 49 to 51 read closely). Both are 2013 papers. -->

## Overview

A news feed (the home page that lists the latest posts from the people you follow) is read far more often than it is written, so the question is when to do the work: when someone posts, or when someone opens the app. This note builds one design from stated assumptions, not "the" answer. The central trade-off is copying each post to every follower against collecting posts at read time, and what to do about accounts with millions of followers. After this note you can size the system and explain the hybrid rule.

## Topic: Requirements and scope

**Definition:** We build: post something; follow and unfollow; open a home feed of recent posts from accounts you follow, newest first, and scroll back through older ones. Non-functional: the feed opens fast, a new post appears within seconds to minutes (eventually, not instantly), no post is lost. Out of scope: machine-learned ranking, ads, likes and comments, storing images and video, search.

**Why:** An interviewer wants you to ask how big accounts get, how fresh the feed must be, and whether the order is by time or by score. The answers pick the fan-out method (fan-out: copying one thing to many places).

**Example:** (1) `POST /posts`. (2) Follow and unfollow. (3) `GET /feed` returns 20 posts. (4) Older posts through a cursor (a marker for where the last page ended). (5) A deleted post disappears from feeds. Out of scope: ranking by score.

**Failure:** Skipping "can one account have 50 million followers?" The interviewer then asks what happens when such an account posts (Topic 5).

## Topic: Numbers

**Definition:** An estimate. Every input is an assumption: 100 million daily users, 200 follows each, 20 million posts a day, 10 feed loads per user a day (6A); 800 post ids kept per user, 8 bytes each (6B).

**Why:** The numbers show which side, writing or reading, is the heavy one.

**Example:** Copying each post to 200 followers writes 4,000,000,000 feed entries a day, 46,296 a second. Feed loads are 11,574 a second. If each load merged 200 timelines at read time, that is 2,314,815 timeline reads a second (6A). Ready-made lists for all users: 640 GB for one copy (6B), 1,920 GB with 3 copies (my arithmetic).

**Failure:** If users followed 2,000 accounts instead of 200, copying would cost 10x, about 463,000 writes a second, and the choice in Topic 5 would shift towards reading.

## Topic: API and data

**Definition:** `POST /posts {text}`; `POST /follow {user}`; `GET /feed?limit=20&cursor=...` returns posts and a `next_cursor`. Records: post (post id, author, text, time), follow (follower, followed), and a feed list per user: post ids only, newest first, at most 800.

**Why:** Post ids are made so a bigger id means a newer post (the time is inside the id), so ordering by id is ordering by time. A feed list holds only ids, which keeps it small (6B) and lets a deleted or edited post be fixed in one place. Posts and follows fit a database sharded by id (see System Design: Choosing Databases); the lists fit a fast key-value store.

**Example:** User 7's list: `[905, 902, 899, ...]`. `GET /feed?limit=2` returns posts 905 and 902 and `next_cursor=902`.

**Failure:** The model cannot answer "the most liked posts of my friends" or a search. Those need other indexes.

## Topic: The first design

**Definition:** The post service saves the post and puts a "new post" event on a queue (see System Design: Queues, Logs and Streaming). Fan-out workers read the author's followers and add the post id to each follower's feed list. The feed service reads the list, fetches the posts from a cache (see System Design: Caching) or the post store, and returns a page. See diagram 1.

**Why:** The queue lets the author get an answer at once while copying happens later.

**Example:** Write path (diagram 2): (1) the author posts; (2) the post is saved; (3) the event is queued and the author gets "posted"; (4) a worker reads the followers; (5) it adds the id to each list, cut to 800. Read path (diagram 3): (1) `GET /feed`; (2) read the id list; (3) read posts from cache, or the store on a miss; (4) add posts of big accounts (Topic 5); (5) return the page and cursor.

**Failure:** The first bottleneck is the copying: 46,296 list writes a second on average, and much more when a big account posts (Topic 5).

## Topic: Fan-out on write, on read, or both

**Definition:** Fan-out on write (push): at posting, copy the post id into every follower's list. Fan-out on read (pull): at feed time, fetch recent posts of each followed account and merge them. Hybrid: copy for ordinary accounts; for accounts above a follower limit, do not copy, and read their posts at feed time. The limit of 10,000 followers is an assumption.

**Why:** From 6A, 20,000,000 posts a day is 231 posts a second but 11,574 feed loads a second. Reading dominates, as Facebook described in 2013 (users read about ten times more than they create), so work done once at posting is cheaper than work done at every load. Pure pull costs 2,314,815 timeline reads a second; pure push costs 46,296 writes. The catch is big accounts. 6C (simulation, 1,000,000 accounts, follower counts drawn from a Pareto shape, an assumption): the top 0.1 percent of accounts hold 23.7 percent of all follower links, the top 1 percent hold 40.4 percent. Only 595 accounts (0.060 percent) have more than 10,000 followers, yet reading them at feed time avoids 20.7 percent of all copies. 6D (assumption: 50 million followers, 20,000 feed writes a second per worker): one worker needs 2,500 s (42 min); 250 workers finish in 10 s. Rejected: pure push, for those bursts; pure pull, for the read load.

**Example:** Hybrid cost, my arithmetic with an assumption that a user follows 5 big accounts: one list read plus 5 account timelines is 6 reads a load, 11,574 x 6 = 69,444 reads a second, against 2,314,815 for pure pull.

**Failure:** The limit is a tuning knob: lower raises read cost, higher raises posting bursts. When an account crosses it, older copies stay and new posts are pulled. Skipping copies to users who have not opened the app for a long time is another saving (my idea).

## Topic: Building and ranking one feed

**Definition:** At read time: take the user's id list, add recent posts of big accounts followed, merge by id, load the posts, drop deleted or hidden ones, cut a page, return a cursor. Hot lists and posts sit in a cache. Ranking is by time, newest first.

**Why:** Facebook's Memcache paper (2013) describes a look-aside cache (read the cache first; on a miss read the database and fill it). On a write it deleted the cached value rather than updating it, because a delete is idempotent (doing it twice is the same as once). It treated the chance of reading slightly stale data as a setting to tune, and used leases (a token given to one reader to refill a missed key) so one miss does not send a crowd to the database: for a set of keys prone to this, the peak database query rate fell from 17,000 to 1,300 a second. The TAO paper (2013) said Facebook resolved data and checked privacy each time content was viewed, because the result differs per viewer, and kept lists of edges newest first. We copy the shape, not their numbers. Time order is my stated design choice: no source I read explains how any company scores posts. A scored ranking would load a larger set (say 800 candidates), sort by score, and the cursor would then depend on the score. Cursor not offset (see System Design: APIs, Gateways and Rate Limiting): new posts at the top would shift offset pages and repeat items.

**Example:** User 7's list `[905, 902, 899]`; one big account has posts 903 and 900. Merged: 905, 903, 902, 900, 899. Page of 2 with `next_cursor=903`; the next page asks for ids below 903.

**Failure:** If a feed list is lost, rebuild it by pull: read recent posts of 200 follows once. Many lost at once causes a stampede; see Caching. A deleted post still in a list is dropped when its body is loaded.

## Topic: Failures and scaling

**Definition:** What fails: fan-out workers, a feed-store node, a cache node. The queue backlog matters most: it makes feeds late, not wrong.

**Why:** The post is saved before copying starts, so a worker crash delays a post and loses nothing.

**Example:** Workers fall behind. Authors still see "posted", and followers see the post minutes later; the backlog drains as workers catch up. Facebook described in 2013 a small pool of spare cache servers, about 1 percent of the cluster, that took over for failed ones to protect the database.

**Failure:** At 10x followers: about 463,000 copies a second, so lower the limit. At 10x users the lists reach 6.4 TB for one copy (10 x 640 GB). Shard lists by user id (see System Design: Replication and Partitioning).

## Questions

### Push or pull for a feed?

Both. Copy the post id to followers for ordinary accounts; for accounts above a limit, read their posts at feed time. 6A shows pure pull would read 2.3 million timelines a second.

### What happens when a celebrity posts?

Copying to 50 million followers would take one worker 42 minutes (6D). So we do not copy; followers' feeds pull that account's recent posts.

### Why store ids and not full posts?

Lists stay small (640 GB for everyone), and a deleted or edited post is fixed in one place.

### How do you page through a feed?

With a cursor, the id of the last post shown. Offset paging repeats posts when new ones arrive.

## Mistakes

- "Always copy to followers." One 50-million-follower post is 2,500 s of work for one worker.
- "Always read at feed time." That is 2,314,815 reads a second in 6A.
- "Use page numbers." New posts shift the pages; use a cursor.

## Quiz

### In 6A, why is pure pull costly?

- [ ] Posts are large
- [x] Each of 11,574 loads a second merges 200 timelines
- [ ] Users follow nobody
- [ ] Ids are random

Explanation: 11,574 x 200 = 2,314,815 reads a second.

### Which accounts does the hybrid rule read at feed time?

- [ ] All new accounts
- [x] Accounts above the follower limit
- [ ] Accounts with no posts
- [ ] Deleted accounts

Explanation: The limit of 10,000 is an assumption.

### In 6C, what share of copies is avoided by reading accounts above 10,000 followers?

- [ ] 0.06 percent
- [ ] 2.6 percent
- [x] 20.7 percent
- [ ] 40.4 percent

Explanation: Only 595 accounts, but a fifth of all copies (simulation).

### Why did Facebook's cache delete a value on a write, as described in 2013?

- [ ] Deletes are free
- [x] A delete is idempotent, so it can safely be repeated
- [ ] Caches cannot update
- [ ] Reads need it empty

Explanation: Memcache paper, page 386.

### 50 million followers, 20,000 writes a second per worker. How many workers finish in 10 s?

- [ ] 25
- [ ] 100
- [x] 250
- [ ] 2,500

Explanation: 50,000,000 / 10 s / 20,000 = 250 (6D).

## Diagram

```json
{ "kind": "graph", "caption": "The first design. An author posts (1) to the post service, which saves the post and queues an event (2). Fan-out workers take the event (3) and add the post id to each follower's feed list (4, dashed, in the background). A reader's request (5) goes to the feed service, which reads the list and the posts from the cache and stores.", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "u", "label": "Author", "x": 5, "y": 20, "shape": "client" }, { "id": "r", "label": "Reader", "x": 5, "y": 80, "shape": "client" }, { "id": "ps", "label": "Post service", "x": 28, "y": 20, "group": "dc" }, { "id": "q", "label": "Fan-out queue", "x": 50, "y": 20, "shape": "queue", "group": "dc" }, { "id": "w", "label": "Fan-out workers", "x": 72, "y": 20, "group": "dc" }, { "id": "fs", "label": "Feed service", "x": 28, "y": 80, "group": "dc" }, { "id": "fl", "label": "Feed lists + cache", "x": 72, "y": 50, "shape": "cache", "group": "dc" }, { "id": "pd", "label": "Post store", "x": 72, "y": 85, "shape": "database", "group": "dc" }], "edges": [{ "from": "u", "to": "ps", "step": 1 }, { "from": "ps", "to": "q", "step": 2 }, { "from": "q", "to": "w", "step": 3 }, { "from": "w", "to": "fl", "step": 4, "dashed": true }, { "from": "r", "to": "fs", "step": 5 }, { "from": "fs", "to": "fl" }, { "from": "fs", "to": "pd" }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path. The author posts (1). The post service saves it, queues an event (2) and answers (3). A worker asks who follows the author (4, 5), then adds the post id to their lists (6).", "actors": [{ "id": "a", "label": "Author" }, { "id": "p", "label": "Post service" }, { "id": "w", "label": "Fan-out worker" }, { "id": "l", "label": "Feed lists" }], "messages": [{ "from": "a", "to": "p", "label": "POST /posts" }, { "from": "p", "to": "w", "label": "Event: new post 905" }, { "from": "p", "to": "a", "label": "Posted", "dashed": true }, { "from": "w", "to": "p", "label": "Who follows author?" }, { "from": "p", "to": "w", "label": "Follower list", "dashed": true }, { "from": "w", "to": "l", "label": "Add 905 to each list" }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path. The reader asks for the feed (1). The feed service reads the id list (2, 3) and the recent posts of big accounts (4, 5), merges them by id, loads the post bodies from the cache (6, 7) and returns a page with a cursor (8).", "actors": [{ "id": "r", "label": "Reader" }, { "id": "f", "label": "Feed service" }, { "id": "l", "label": "Feed lists" }, { "id": "c", "label": "Post cache" }], "messages": [{ "from": "r", "to": "f", "label": "GET /feed" }, { "from": "f", "to": "l", "label": "Read id list" }, { "from": "l", "to": "f", "label": "905, 902, 899", "dashed": true }, { "from": "f", "to": "l", "label": "Big accounts' posts" }, { "from": "l", "to": "f", "label": "903, 900", "dashed": true }, { "from": "f", "to": "c", "label": "Load bodies" }, { "from": "c", "to": "f", "label": "Posts", "dashed": true }, { "from": "f", "to": "r", "label": "Page + cursor", "dashed": true }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "One celebrity post under the hybrid rule. An ordinary author's post is copied to followers' lists (1). A celebrity's post is stored once in the celebrity's own timeline (2) and is not copied. When a follower opens the feed, the feed service reads the follower's list (3) and the celebrity timeline (4) and merges them.", "nodes": [{ "id": "o", "label": "Ordinary author", "x": 8, "y": 15, "shape": "client" }, { "id": "c", "label": "Celebrity", "x": 8, "y": 85, "shape": "client" }, { "id": "fl", "label": "Follower's feed list", "x": 50, "y": 15, "shape": "cache" }, { "id": "ct", "label": "Celebrity timeline", "x": 50, "y": 85, "shape": "database" }, { "id": "fs", "label": "Feed service", "x": 90, "y": 50 }], "edges": [{ "from": "o", "to": "fl", "step": 1 }, { "from": "c", "to": "ct", "step": 2 }, { "from": "fs", "to": "fl", "step": 3 }, { "from": "fs", "to": "ct", "step": 4 }] }
```

## Diagram

```json
{ "kind": "layers", "caption": "One feed page is built from the bottom up: post bodies, then the merged id list, then the page with a cursor.", "layers": [{ "label": "Page of 20 posts + next cursor" }, { "label": "Merged ids, newest first" }, { "label": "Ready-made list (800 ids) + big accounts' recent ids" }, { "label": "Post bodies from cache, then post store" }] }
```
