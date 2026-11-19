---
id: hld-case-news-feed
title: "Case Study: News Feed"
lastChecked: 2026-11-13
next: hld-case-file-storage
roadmapSteps: backend:database-design, fullstack:deployment-scaling
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A news feed (the home page that lists the latest posts from the people you follow) is read far more often than it is written, so the question is when to do the work: when someone posts, or when someone opens the app. This note builds one design from stated assumptions, not "the" answer. The central trade-off is copying each post to every follower against collecting posts at read time, and what to do about accounts with millions of followers. The numbers are examples worked out with a short program, not real company figures. After this note you can size the system and explain the hybrid rule.

## Topic: Requirements and scope

**Definition:** We build: post something; follow and unfollow; open a home feed of recent posts from accounts you follow, newest first, and scroll back through older ones. Non-functional: the feed opens fast, a new post appears within minutes, no post is lost. Out of scope: ranking by score, ads, likes, comments, media, search.

**Why:** Ask how many followers the biggest account can have and how fresh the feed must be. The answers pick the fan-out method (copying one thing to many places).

**Example:** (1) `POST /posts`. (2) Follow and unfollow. (3) `GET /feed` returns 20 posts. (4) Older posts through a cursor (a marker for where the last page ended). (5) A deleted post disappears from feeds.

**Failure:** Skipping "can one account have 50 million followers?" The interviewer then asks what happens when such an account posts.

## Topic: Numbers

**Definition:** An estimate is a rough calculation done before building, to see how big the job is. Every input is an assumption: 100 million daily users, 200 follows each, 20 million posts a day, 10 feed loads per user a day; 800 post ids kept per user, 8 bytes each.

**Why:** The numbers show which side, writing or reading, is the heavy one.

**Example:**
- Copying: 20,000,000 posts x 200 followers = 4,000,000,000 feed entries a day (a feed entry is one post id added to one follower's list). A day has 86,400 seconds: 4,000,000,000 / 86,400 = 46,296 writes a second.
- Reading: 100,000,000 users x 10 loads = 1,000,000,000 loads a day, which is 11,574 loads a second.
- Pure pull: each load merges 200 timelines (a timeline is the recent posts of one account), so 11,574 x 200 = 2,314,815 timeline reads a second.
- Lists: 800 x 8 bytes = 6,400 bytes a user; x 100,000,000 = 640 GB.

**Failure:** If every user followed 2,000 accounts instead of 200 (ten times more), copying would be about 463,000 writes a second, and the choice below would shift towards reading.

## Topic: API and data

**Definition:** `POST /posts {text}`; `POST /follow {user}`; `GET /feed?limit=20&cursor=...` returns posts and a `next_cursor`. Records: post (id, author, text, time), follow (follower, followed), and a feed list per user: post ids only, newest first, at most 800.

**Why:** Post ids are made so a bigger id means a newer post (the time is inside the id), so ordering by id is ordering by time. A list holds only ids: it stays small, and a deleted or edited post is fixed in one place. Posts and follows go in a database split across machines by id (sharding, see System Design: Choosing Databases). The lists go in a key-value store (a simple, fast store that finds a value by its name).

**Example:** `GET /feed?limit=2` returns posts 905 and 902 and `next_cursor=902`.

**Failure:** This storage cannot answer "the most liked posts of my friends" or a search. Those need other indexes.

## Topic: The first design

**Definition:** The post service saves the post and puts a "new post" event on a queue (see System Design: Queues, Logs and Streaming). Fan-out workers (programs that do the copying) read the author's followers and add the post id to each follower's feed list. The feed service reads the list, fetches the posts from a cache (a fast store that keeps copies of data that is slow to fetch, see System Design: Caching) or the post store, and returns a page (diagram 1).

**Why:** The queue lets the author get an answer at once; copying happens later.

**Example:** Write path (diagram 2): (1) the author posts and the post is saved; (2) the author gets "posted" and an event goes on the queue; (3) a worker takes the event and asks who follows the author; (4) it adds the id to each follower's list, cut to 800. Read path (diagram 3): (1) `GET /feed`; (2) read the id list; (3) add recent posts of big accounts the user follows; (4) read posts from cache, or the store on a miss; (5) return the page and cursor.

**Failure:** The first bottleneck (the part that limits the whole system) is the copying: 46,296 list writes a second, and far more when a big account posts.

## Topic: Fan-out on write, on read, or both

**Definition:** "On write" means at the moment someone posts; "on read" means at the moment someone opens the feed.
- On write (push): copy the post id into every follower's list.
- On read (pull): fetch recent posts of each followed account and merge them.
- Hybrid: copy for ordinary accounts. For a big account (a "celebrity", with more followers than a limit), do not copy; read its posts at feed time. The limit of 10,000 followers is an assumption.

**Why:** 20,000,000 posts a day is 231 posts a second, but there are 11,574 feed loads a second. Reading dominates, so work done once at posting is cheaper than work done at every load: pure push costs 46,296 writes a second, pure pull 2,314,815 reads. The catch is big accounts.
- We made up 1,000,000 accounts where a few have very many followers and most have few (a Pareto shape).
- The top 1 percent of accounts hold 40.4 percent of all follows.
- Only 595 accounts have more than 10,000 followers, yet reading them at feed time avoids 20.7 percent of all copies.
- One post by an account with 50 million followers (assumption) at 20,000 list writes a second per worker: 50,000,000 / 20,000 = 2,500 seconds (42 minutes) for one worker. With 250 workers: 2,500 / 250 = 10 seconds.

Rejected: pure push, for those bursts; pure pull, for the read load. Facebook's 2013 Memcache paper says users read about an order of magnitude more than they create, but its TAO paper says it pulls the social graph at view time rather than pushing it. Our hybrid pushes for ordinary accounts because our own numbers say reading dominates; that is our own reasoning, not Facebook's.

**Example:** Hybrid cost, assuming a user follows 5 big accounts: one list read plus 5 account timelines is 6 reads a load, so 11,574 x 6 = 69,444 reads a second, against 2,314,815 for pure pull.

**Failure:** The limit is a setting you adjust. Lower means more reading at feed time; higher means more copying when a big account posts.

## Topic: Building and ranking one feed

**Definition:** At read time: take the user's id list, add recent posts of big accounts followed, merge by id, load the posts, drop deleted or hidden ones, cut a page, return a cursor. Ranking is by time, newest first.

**Why:** Three ideas from Facebook's Memcache paper (2013), which we borrow:
- Look-aside cache: read the cache first; on a miss (value not there) read the database and fill the cache.
- Delete on write: it deleted the cached value rather than updating it, because a delete is idempotent (doing it twice is the same as once).
- Leases: a lease is a token given to one reader to refill a missed key, so one miss does not send a crowd to the database. By default a server gave out one token per key every 10 seconds, and a lease also stopped a stale value being written back. For one set of keys prone to this, the peak database query rate fell from 17,000 to 1,300 a second.

From the TAO paper (2013) we borrow newest-first lists of each person's connections (called edges). TAO checked at every view whether this viewer may see the content.

Time order is our own choice. Use a cursor, not an offset: an offset says "skip the first 20 posts", and if new posts arrive at the top, the same posts show up again on the next page (see System Design: APIs, Gateways and Rate Limiting).

**Example:** User 7's list `[905, 902, 899]`; one big account has posts 903 and 900. Merged: 905, 903, 902, 900, 899. Page of 2 with `next_cursor=903`; the next page asks for ids below 903.

**Failure:** A lost feed list is rebuilt by pull: read recent posts of 200 follows once. Many lost at once swamp the database (see System Design: Caching).

## Topic: Failures and scaling

**Definition:** What fails: fan-out workers, a feed-store node, a cache node. The backlog (jobs waiting in the queue) matters most: it makes feeds late, not wrong.

**Why:** The post is saved before copying starts, so a worker crash delays a post and loses nothing.

**Example:** Workers fall behind. Authors still see "posted"; followers see the post minutes later. Facebook described in 2013 a small pool of spare cache servers (Gutter), about 1 percent of a cluster, that took over for failed ones; their entries expire quickly, so data may be slightly stale.

**Failure:** With ten times more follows, copying is about 463,000 writes a second, so lower the limit. With ten times more users the lists reach 6.4 TB (10 x 640 GB), so shard them by user id (see System Design: Replication and Partitioning).

## Questions

### Push or pull for a feed?

Both. Copy the post id to followers for ordinary accounts; for accounts above a limit, read their posts at feed time. In our numbers pure pull would read 2.3 million timelines a second.

### What happens when a celebrity posts?

Copying to 50 million followers would take one worker 42 minutes, so we do not copy; feeds pull that account's posts.

### How do you page through a feed?

With a cursor, the id of the last post shown.

## Mistakes

- "Always copy to followers." One 50-million-follower post is 2,500 seconds of work for one worker.
- "Always read at feed time." That is 2,314,815 reads a second in our numbers.
- "Use page numbers." New posts shift the pages; use a cursor.

## Quiz

### In our numbers, why is pure pull costly?

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

### In our made-up test of 1,000,000 accounts, what share of copies is avoided by reading accounts above 10,000 followers?

- [ ] 0.06 percent
- [ ] 2.6 percent
- [x] 20.7 percent
- [ ] 40.4 percent

Explanation: Only 595 accounts, but a fifth of all copies.

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

Explanation: 50,000,000 / 10 s / 20,000 = 250.

## Diagram

```json
{ "kind": "graph", "caption": "The first design. An author posts (1) to the post service, which saves the post and queues an event (2). Fan-out workers take the event (3) and add the post id to each follower's feed list (4, dashed, in the background). A reader's request (5) goes to the feed service, which reads the list (6) and the posts (7).", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "u", "label": "Author", "x": 8, "y": 18, "shape": "client" }, { "id": "r", "label": "Reader", "x": 8, "y": 84, "shape": "client" }, { "id": "ps", "label": "Posts", "x": 34, "y": 18, "group": "dc" }, { "id": "q", "label": "Queue", "x": 58, "y": 18, "shape": "queue", "group": "dc" }, { "id": "w", "label": "Workers", "x": 84, "y": 18, "group": "dc" }, { "id": "fs", "label": "Feed service", "x": 34, "y": 84, "group": "dc" }, { "id": "fl", "label": "Feed lists", "x": 84, "y": 51, "shape": "cache", "group": "dc" }, { "id": "pd", "label": "Post store", "x": 84, "y": 84, "shape": "database", "group": "dc" }], "edges": [{ "from": "u", "to": "ps", "step": 1 }, { "from": "ps", "to": "q", "step": 2 }, { "from": "q", "to": "w", "step": 3 }, { "from": "w", "to": "fl", "step": 4, "dashed": true }, { "from": "r", "to": "fs", "step": 5 }, { "from": "fs", "to": "fl", "step": 6 }, { "from": "fs", "to": "pd", "step": 7 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Write path, after the post is saved and the author has been told \"posted\". The post service puts an event on the queue (1). A worker takes it (2) and asks who follows the author (3, 4), then adds the post id to their lists (5).", "actors": [{ "id": "p", "label": "Post service" }, { "id": "q", "label": "Queue" }, { "id": "w", "label": "Worker" }, { "id": "l", "label": "Feed lists" }], "messages": [{ "from": "p", "to": "q", "label": "Event: new post 905" }, { "from": "q", "to": "w", "label": "Deliver event" }, { "from": "w", "to": "p", "label": "Who follows author?" }, { "from": "p", "to": "w", "label": "Follower list", "dashed": true }, { "from": "w", "to": "l", "label": "Add 905 to each list" }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Read path. The reader asks for the feed (1). The feed service reads the user's id list and the list of big accounts followed (2, 3), then those accounts' recent posts (4, 5), merges them by id, loads the post bodies from the cache (6, 7) and returns a page with a cursor (8).", "actors": [{ "id": "r", "label": "Reader" }, { "id": "f", "label": "Feed service" }, { "id": "l", "label": "Feed lists" }, { "id": "c", "label": "Post cache" }], "messages": [{ "from": "r", "to": "f", "label": "GET /feed" }, { "from": "f", "to": "l", "label": "Read my lists" }, { "from": "l", "to": "f", "label": "905, 902, 899", "dashed": true }, { "from": "f", "to": "l", "label": "Big accounts' posts" }, { "from": "l", "to": "f", "label": "903, 900", "dashed": true }, { "from": "f", "to": "c", "label": "Load bodies" }, { "from": "c", "to": "f", "label": "Posts", "dashed": true }, { "from": "f", "to": "r", "label": "Page + cursor", "dashed": true }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "One big-account post under the hybrid rule. An ordinary author's post is copied to followers' lists (1). A big account's post is stored once in that account's own timeline (2) and is not copied. When a follower opens the feed, the feed service reads the follower's list (3) and the big account's timeline (4) and merges them.", "nodes": [{ "id": "o", "label": "Ordinary author", "x": 8, "y": 15, "shape": "client" }, { "id": "c", "label": "Big account", "x": 8, "y": 85, "shape": "client" }, { "id": "fl", "label": "Follower's list", "x": 50, "y": 15, "shape": "cache" }, { "id": "ct", "label": "Big-account timeline", "x": 50, "y": 85, "shape": "database" }, { "id": "fs", "label": "Feed service", "x": 90, "y": 50 }], "edges": [{ "from": "o", "to": "fl", "step": 1 }, { "from": "c", "to": "ct", "step": 2 }, { "from": "fs", "to": "fl", "step": 3 }, { "from": "fs", "to": "ct", "step": 4 }] }
```

## Diagram

```json
{ "kind": "layers", "caption": "One feed page is built from the bottom up: post bodies, then the merged id list, then the page with a cursor.", "layers": [{ "label": "Page of 20 posts + next cursor" }, { "label": "Merged ids, newest first" }, { "label": "Ready-made list (800 ids) + big accounts' recent ids" }, { "label": "Post bodies from cache, then post store" }] }
```
