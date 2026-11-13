---
id: hld-case-web-crawler
title: "Case Study: Web Crawler"
next: hld-case-ticket-booking
roadmapSteps: dsa:graphs-traversal, dsa:heaps-tries, backend:deployment-cloud
---
<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-drafts.md. Numbers from docs/content/checks/hld-case-check.py (sections 10A to 10E) and hld-check.py (K1). -->

## Overview

A web crawler (a program that downloads pages by following links) feeds a search index. It must be fast, yet never hammer one site and never fetch the same thing twice. This is one reasonable design built on made-up assumptions, not the answer. After reading you can size a crawl, explain a polite scheduler, and compare a Bloom filter with an exact set for remembering URLs.

## Topic: Requirements and scope

**Definition:** We build a crawler that starts from seed URLs (a given list of first pages), downloads HTML pages, extracts links and stores the pages for a later indexer. We leave out the indexer, ranking, rendering pages that need JavaScript, and images.

**Why:** Ask first: how many pages, how fresh, one crawl or continuous?

**Example:** Requirements (all assumptions): 1. Fetch 1 billion pages in 30 days. 2. Obey robots.txt (a file where a site lists what crawlers may not fetch). 3. Never overload a site. 4. Skip pages already fetched. 5. Survive a crashed machine without starting over. Out of scope: re-crawling for freshness, JavaScript pages.

**Failure:** If "be polite" is skipped, the crawler works in a test and then takes a small site down.

## Topic: Numbers

**Definition:** The estimate that sizes the system. Every input below is an assumption.

**Why:** It tells us the download speed and whether the visited set fits in memory.

**Example:** Assumption: 1 billion pages in 30 days, 100 KB a page (script 10A). That is 386 pages a second, 38.6 MB/s (309 Mbit/s) and 100 TB of pages. Assumption: at most 1 request a second to one site (10B): 10,000 pages from one site take 10,000 s, about 2.8 hours, so about 386 sites must be crawled at the same time. Assumption: 10 billion URLs seen (10C). An exact set of 8-byte hashes is 80 GB.

**Failure:** If the page rate is 10 times higher (3,860 a second), bandwidth reaches about 3 Gbit/s and the number of sites in flight reaches about 3,860, so one machine is no longer enough.

## Topic: API and data

**Definition:** A crawler has no user API. It has internal calls: add a URL, get the next URL to fetch, store a page. Stored records: a frontier entry (URL, site, priority, last try), a visited set of URL fingerprints (short hashes), a page store (page bytes plus a content hash) and a per-site record (robots.txt rules, address, next allowed time).

**Why:** Pages are large and written once, so they go to a blob store (a store for big files). Per-site data is small and read often, so it sits in a key-value store and a cache. See System Design: Storage and Indexes.

**Example:** `next_url() -> url` and `add_urls(list)`. A page record: `url_hash, fetched_at, status, content_hash, blob_id`.

**Failure:** The data model cannot answer "which pages link to this page" without a second table of links. We chose not to store links.

## Topic: The first design

**Definition:** Diagram 1 shows the parts. The frontier (the list of URLs still to fetch) hands a URL to a fetcher. The fetcher asks DNS for the address, checks robots.txt rules, downloads the page, and stores it. A parser extracts links, a filter drops unwanted ones, and the duplicate check passes new URLs back to the frontier.

**Why:** Each part is a different bottleneck: the frontier decides order and politeness, DNS and the network make waiting time, the duplicate check guards memory.

**Example:** Fetch path: 1. Frontier gives a URL. 2. Fetcher resolves the host. 3. Fetcher checks robots.txt. 4. Fetcher downloads. 5. Page goes to the page store. 6. Parser extracts links. 7. New links return to the frontier (diagram 2).

**Failure:** The first bottleneck is one shared queue: many fetchers hit the same site at once. The next two topics fix this.

## Topic: Choosing the next page politely

**Definition:** The frontier keeps one queue per site, and a timer per site says when it may be contacted again. A fetcher takes the next URL from the site whose time has come.

**Why:** Mercator, a crawler that Heydon and Najork described in a 1999 paper and a 2001 report (I read the report in full), found that a single first-in-first-out queue holds runs of URLs from one host (relative links). Threads then hit the same server together, "socially unacceptable" in their words. One thread per server still drew complaints (back-to-back requests), so their later frontier waited ten times as long as the last download took before the next request to that host. These are what that system did, not rules. We choose a fixed gap per site (assumption: 1 request a second) because it is easy to explain. We reject "one thread per site" because it does not limit the rate.

**Example:** Script 10D (simulation: 3 sites, each polled at most once per 2 seconds). The fetch order is a.com at 0, b.com at 0.5, c.com at 1.0, a.com at 2, b.com at 2.5, a.com at 4 and so on: no site is touched twice within 2 seconds, and the crawler is never idle while any site is ready. A heap (a structure that gives the smallest value first), keyed by the next allowed time, finds the next ready site. Priorities: Mercator drew from front queues by priority with a bias to high priority; we add that only for re-crawling.

**robots.txt, from RFC 9309 (read in full):** it says its rules are "not a form of access authorization", so it is a request, not security. Rules are grouped by product token (the crawler's name), matched without regard to case; with no matching group, use the `*` group. The longest matching path wins; on a tie, allow wins. If the file is missing (a 4xx answer), the crawler may fetch anything. If it cannot be reached (5xx or network error), the crawler must assume everything is disallowed. A crawler should not use a cached copy for more than 24 hours unless the file is unreachable, and must parse at least 500 KiB. RFC 9309 defines no request rate, so the one-per-second gap is our own rule.

**DNS cost (10E, assumption: 1,000 new sites a second, 50 ms each):** 1,000 x 0.05 s = 50 s of waiting per second, so lookups must run in parallel and be cached. Mercator's report: lookups took 70% of each thread's time until a parallel resolver cut it to 14%.

**Failure:** One huge site with 10,000 pages needs 2.8 hours, so a crawl is never faster than its largest site. Fix: crawl many sites at once, cap pages per site.

## Topic: Not fetching the same thing twice

**Definition:** Before a URL enters the frontier, we check whether we have seen it. We also check whether a downloaded page has the same content as a page seen before.

**Why:** Without it the crawler loops on links that point back.

**Example:** Assumption: 10 billion URLs (10C). An exact set of 8-byte hashes is 80 GB. A Bloom filter (a bit array that answers "possibly seen" or "definitely not seen"; see System Design: Storage and Indexes) with 10 bits a URL and 7 hash functions is 12.5 GB and wrongly says "seen" for about 0.82% of new URLs (K1). With 15 bits and 10 hashes: 18.8 GB and about 0.07%. A false positive means a new page is skipped. A Bloom filter never says "new" for a URL it holds, so no page is fetched twice, but about 8 in 1,000 new pages are lost. For a search crawler that loss is usually acceptable; for an archive it is not, so it needs the exact set. The 2001 Mercator report describes an in-memory table of 8-byte checksums, a little over 5 GB for 1 billion URLs, and a first disk-based version limited to about 75 downloads a second by disk seeks.

**Normalising URLs (our reasoning):** `HTTP://A.com/x/../y` and `http://a.com/y` are one page. Before hashing, lowercase the scheme and host, remove default ports and fragments (`#...`), resolve `..`, and sort query parameters.

**Spider traps and content (our reasoning):** A calendar page links to "next month" forever. Cap the depth from the seed, the URL length and the pages per site. Mercator skipped a page whose content matched an earlier page under a different URL; we compare a hash of the page body.

**Failure:** Content hashes miss pages that differ by a visit counter; near-duplicate detection is left out.

## Topic: Failures and scaling

**Definition:** Fetchers, the frontier and the stores can fail. The crawler must continue without refetching everything.

**Why:** Crawls run for weeks, so a crash is certain. Mercator saved its state to disk 1 to 4 times a day and could resume from the last save; work after it was lost.

**Example:** A fetcher dies after downloading 500 pages. Its URLs were marked "in progress" with a timeout; after it, they return to the frontier (diagram 4). Some pages are fetched again; stored pages are not lost.

**Failure:** At 10 times the rate we must split by site: Mercator partitioned host names among its machines, so every site's queue, timer and visited data live on one machine, and a link to another machine's site is sent over (about 80% of links were relative and stayed local). The next limit is the visited set (800 GB if exact) and bandwidth.

## Questions

### How do you avoid overloading one website?

One queue per site, a timer for the next allowed request, and a heap that picks the earliest ready site.

### Bloom filter or exact set for visited URLs?

Bloom is smaller (12.5 GB against 80 GB for 10 billion URLs) but about 0.82% of new URLs are wrongly skipped. Use exact when no page may be lost.

### How do you escape a spider trap?

Limit depth, URL length and pages per site, and normalise URLs before checking.

### What if robots.txt cannot be fetched?

RFC 9309: if the server answers 4xx, anything may be fetched; if it errors (5xx) or is unreachable, assume everything is disallowed.

## Mistakes

- "Robots.txt keeps private pages safe." RFC 9309 says it is not access authorization.
- "A Bloom filter may lose a visited URL." It never does; its error is the other way, skipping a new page.
- "More fetcher threads is always faster." Per-site gaps and DNS waits cap the speed.

## Quiz

### How many sites must be in flight to reach 386 pages a second at 1 request a second per site?

- [ ] 1
- [ ] About 40
- [x] About 386
- [ ] About 38,600

Explanation: 386 pages a second divided by 1 page a second per site (10B).

### A Bloom filter says a URL was "seen". What does that mean?

- [ ] It was surely fetched
- [x] It was probably fetched; a few new URLs are wrongly reported
- [ ] It was surely not fetched
- [ ] It was fetched twice

Explanation: A false positive makes the crawler skip a new page.

### No robots.txt group matches the crawler. What does RFC 9309 say?

- [ ] Fetch nothing
- [x] Use the `*` group if there is one
- [ ] Ask the site owner
- [ ] Use the longest group

Explanation: With no `*` group either, no rules apply.

### Why one queue per site?

- [ ] To save memory
- [x] A single queue puts many URLs of one host in a row, so fetchers hit it together
- [ ] To sort by size
- [ ] To avoid DNS

Explanation: Per-site queues with a timer give a rate limit per site.

### Which stops an endless calendar of links?

- [ ] A bigger Bloom filter
- [x] A depth limit and a pages-per-site cap
- [ ] More fetchers
- [ ] A shorter DNS cache

Explanation: The URLs are all new, so only a limit stops them.

## Diagram

```json
{ "kind": "graph", "caption": "Crawler parts. The frontier gives a URL to a fetcher (1). The fetcher asks DNS (2), downloads from the internet (3) and saves the page in the page store (4). The parser reads the stored page and finds links (5); the duplicate check keeps only new URLs (6) and returns them to the frontier (7, dashed).", "groups": [{ "id": "dc", "label": "Crawler" }], "nodes": [{ "id": "f", "label": "Frontier", "x": 10, "y": 20, "shape": "queue", "group": "dc" }, { "id": "w", "label": "Fetcher", "x": 40, "y": 20, "group": "dc" }, { "id": "dns", "label": "DNS cache", "x": 40, "y": 60, "shape": "cache", "group": "dc" }, { "id": "net", "label": "Internet", "x": 90, "y": 20, "shape": "external" }, { "id": "s", "label": "Page store", "x": 70, "y": 60, "shape": "database", "group": "dc" }, { "id": "p", "label": "Parser", "x": 70, "y": 90, "group": "dc" }, { "id": "d", "label": "Seen check", "x": 15, "y": 90, "shape": "cache", "group": "dc" }], "edges": [{ "from": "f", "to": "w", "step": 1 }, { "from": "w", "to": "dns", "step": 2 }, { "from": "w", "to": "net", "step": 3 }, { "from": "w", "to": "s", "step": 4 }, { "from": "s", "to": "p", "step": 5 }, { "from": "p", "to": "d", "step": 6 }, { "from": "d", "to": "f", "step": 7, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Fetching one page. The fetcher asks the frontier for a URL (1, 2), checks the site's robots.txt rules (3), downloads the page (4, 5) and stores it with its content hash (6). It then sends the links it found to the seen check (7), which returns only new ones (8).", "actors": [{ "id": "f", "label": "Frontier" }, { "id": "w", "label": "Fetcher" }, { "id": "s", "label": "Site" }, { "id": "d", "label": "Page store" }], "messages": [{ "from": "w", "to": "f", "label": "Next URL, please" }, { "from": "f", "to": "w", "label": "a.com/page", "dashed": true }, { "from": "w", "to": "s", "label": "GET /robots.txt (cached)" }, { "from": "w", "to": "s", "label": "GET /page" }, { "from": "s", "to": "w", "label": "Page bytes", "dashed": true }, { "from": "w", "to": "d", "label": "Save page and hash" }, { "from": "w", "to": "f", "label": "New links (after seen check)" }, { "from": "f", "to": "w", "label": "Next URL of another site", "dashed": true }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Polite frontier. A router puts each URL in its site's queue (1). A heap holds one entry per site, ordered by the time the site may be contacted again (2). The fetcher takes the earliest ready site from the heap (3), fetches the head URL of that queue (4) and puts the site back with a later time (5, dashed).", "groups": [{ "id": "fr", "label": "Frontier" }], "nodes": [{ "id": "u", "label": "New URLs", "x": 8, "y": 50, "shape": "client" }, { "id": "qa", "label": "Queue a.com", "x": 38, "y": 15, "shape": "queue", "group": "fr" }, { "id": "qb", "label": "Queue b.com", "x": 38, "y": 50, "shape": "queue", "group": "fr" }, { "id": "qc", "label": "Queue c.com", "x": 38, "y": 85, "shape": "queue", "group": "fr" }, { "id": "h", "label": "Heap by time", "x": 68, "y": 50, "group": "fr" }, { "id": "w", "label": "Fetcher", "x": 92, "y": 50 }], "edges": [{ "from": "u", "to": "qb", "step": 1 }, { "from": "qb", "to": "h", "step": 2 }, { "from": "h", "to": "w", "step": 3 }, { "from": "w", "to": "qb", "step": 4, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A fetcher dies. The frontier hands a URL to fetcher 1 with a timeout (1). Fetcher 1 crashes and sends no reply (2). When the timeout ends, the frontier gives the URL to fetcher 2 (3), which confirms (4).", "actors": [{ "id": "f", "label": "Frontier" }, { "id": "a", "label": "Fetcher 1" }, { "id": "b", "label": "Fetcher 2" }], "messages": [{ "from": "f", "to": "a", "label": "URL x, timeout 60 s" }, { "from": "a", "to": "f", "label": "(crashed: no reply)", "dashed": true }, { "from": "f", "to": "b", "label": "Timeout: URL x again" }, { "from": "b", "to": "f", "label": "Done", "dashed": true }] }
```
