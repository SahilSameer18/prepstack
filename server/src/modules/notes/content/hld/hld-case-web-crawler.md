---
id: hld-case-web-crawler
title: "Case Study: Web Crawler"
lastChecked: 2026-11-13
next: hld-case-ticket-booking
roadmapSteps: dsa:graphs-traversal, dsa:heaps-tries, backend:deployment-cloud
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A web crawler (a program that downloads pages by following links) feeds a search index. It must be fast, yet never overload one site and never add the same URL twice. This design rests on made-up assumptions. After reading you can size a crawl, explain a polite scheduler, and compare a Bloom filter with an exact set for remembering URLs.

## Topic: Requirements and scope

**Definition:** We build a crawler that starts from seed URLs (a given list of first pages), downloads HTML pages, extracts links and stores the pages for a later indexer. We leave out the indexer, ranking and pages that need JavaScript.

**Why:** Ask first: how many pages, and how fresh?

**Example:** Requirements (all assumptions): 1. Fetch 1 billion pages in 30 days. 2. Obey robots.txt (a file where a site lists what crawlers may not fetch). 3. Never overload a site. 4. Skip URLs already seen. 5. Survive a crashed machine.

**Failure:** If "be polite" is skipped, the crawler works in a test and then takes a small site down.

## Topic: Numbers

**Definition:** An estimate is a rough calculation done before building. Every input is an assumption.

**Why:** It gives the download speed and whether the visited set fits in memory.

**Example:** Assumption: 1 billion pages in 30 days, 100 KB a page.
- Pages a second: 1,000,000,000 / (30 x 86,400 s) = 386.
- Bandwidth: 386 x 100 KB = 38.6 MB/s; x 8 = 309 Mbit/s.
- Storage: 1,000,000,000 x 100 KB = 100 TB.
- Assumption: at most 1 request a second to one site. 386 pages a second need 386 sites at once. 10,000 pages from one site take 10,000 s, about 2.8 hours.
- Assumption: 10 billion URLs seen, 8-byte hash each: 10,000,000,000 x 8 = 80 GB as an exact set.

**Failure:** At 10 times the page rate (3,860 a second), bandwidth is about 3 Gbit/s and 3,860 sites are crawled at once: one machine is not enough.

## Topic: API and data

**Definition:** A crawler has no user API. Internal calls: add a URL, get the next URL, store a page. Records: a frontier entry (URL, site, last try), a visited set of URL fingerprints (short hashes), a page store (page bytes plus a content hash, a fingerprint of the page text used to spot equal pages) and a per-site record (robots.txt rules, address, next allowed time).

**Why:** Pages are large and written once, so they go to a blob store (a store for big files). Per-site data is small and read often, so it sits in a key-value store.

**Example:** `next_url() -> url`; `add_urls(list)`; a page record: `url_hash, fetched_at, status, content_hash, blob_id`.

**Failure:** The data cannot answer "which pages link to this page" without a table of links, which we leave out.

## Topic: The first design

**Definition:** Diagram 1 shows the parts. The frontier (the URLs still to fetch) hands a URL to a fetcher. The fetcher asks DNS (the internet's address book: it turns a name like a.com into a machine address) for the address, checks robots.txt rules, downloads the page, and stores it. A parser extracts links and the seen check passes new URLs back to the frontier.

**Why:** Each part is a different bottleneck (the part that limits the whole system): the frontier decides order and politeness, DNS and the network make waiting time, the seen check guards memory.

**Example:** Fetch path: 1. Frontier gives a URL. 2. Fetcher resolves the host. 3. Fetcher checks robots.txt rules. 4. Fetcher downloads. 5. Page goes to the page store. 6. Parser extracts links. 7. New links return to the frontier. In diagram 2, DNS and robots.txt answers come from caches.

**Failure:** The first bottleneck is one shared queue: many fetchers hit the same site at once.

## Topic: Choosing the next page politely

**Definition:** The frontier keeps one queue per site, and a timer per site says when it may be contacted again. A fetcher takes the next URL from the site whose time has come.

**Why:** Mercator, a crawler that Najork and Heydon described in a 2001 report (Compaq SRC Research Report 173), found that a first-in-first-out queue (the oldest URL leaves first) holds long runs of URLs from one site, because links on a page mostly point to the same site. Fetchers then hit one server together ("socially unacceptable", the authors wrote). One fetcher per server still drew complaints, so the later version waited ten times as long as the last download took before asking the same site again. That is what that system did, not a rule. We choose a fixed gap per site (assumption: 1 request a second), easy to explain. One fetcher per site would not limit the rate.

**Example:** A small test: 3 sites, one request per site every 2 seconds, one fetcher taking 0.5 s per fetch (assumptions). The order is a.com at second 0, b.com at 0.5, c.com at 1.0, a.com at 2, b.com at 2.5, a.com at 4. No site is asked twice within 2 seconds, and the fetcher is never idle while a site is ready. A heap (a structure that gives the smallest value first), keyed by the next allowed time, finds the next ready site.

**robots.txt, from RFC 9309:** it says its rules are "not a form of access authorization", so it is a request, not security. Rules come in groups (a block of rules for one crawler name, its product token), matched without regard to case; with no matching group, use the `*` group. The longest matching path wins; on a tie, the RFC says allow should be used.
- A 4xx answer ("not found" or "not allowed") means no file: the crawler may fetch anything.
- A 5xx answer (server problem) or a network error means unreachable: assume everything is disallowed.
- A cached copy should not be kept over 24 hours unless the file is unreachable.
- A crawler that limits parsing must parse at least 500 KiB.
- RFC 9309 defines no request rate, so the one-per-second gap is our own rule.

**DNS cost (assumption: 50 ms a lookup):** at most 386 new sites a second. 386 x 0.05 s = about 19 s of waiting for every second of real time, so lookups must run at the same time and answers be kept for reuse. In Mercator's report, lookups with the operating system's resolver took 70% of each thread's time; its own parallel resolver cut that to 14%.

**Failure:** At one request a second, a site of 10,000 pages needs at least 2.8 hours, so the crawl cannot finish before its largest site does. Fix: crawl many sites at once.

## Topic: Not fetching the same thing twice

**Definition:** Before a URL enters the frontier, we check whether we have seen it. We also check whether a downloaded page has the same content as a page seen before.

**Why:** Without it the crawler loops on links that point back. Mercator (2001) kept the fingerprints of 1 billion URLs in a little over 5 GB of memory. The report calculates that a first, disk-based version would be limited to about 75 downloads a second by disk seeks (8 ms each).

**Example:** Assumption: 10 billion URLs.
- Exact set of 8-byte hashes: 80 GB. It is almost exact: about 2.7 colliding pairs are expected at 10 billion URLs (n x n / 2 / 2^64).
- A Bloom filter keeps a row of bits (0 or 1). Each URL turns on a few bits chosen by hash functions (rules that turn a URL into a number). Any bit off: definitely new. All on: probably seen. With 10 bits a URL (7 hash functions): 10 x 10,000,000,000 = 100 billion bits = 12.5 GB.
- It wrongly says "seen" for about 0.82% of new URLs (a false positive), so about 8 in 1,000 new URLs are skipped (fewer pages, since most have several links pointing to them).
- It never says "new" for a URL it holds, so such a URL is never added again. The same page under another URL, or a refetch after a crash, is a separate problem.
- That loss suits a search crawler, not an archive: use the almost exact set or store full URLs.

**Normalising URLs (our reasoning):** `HTTP://A.com:80/x/../y?b=1&a=2#top` and `http://a.com/y?a=2&b=1` are one page. Before hashing, lowercase the host, drop default ports and fragments (`#...`), resolve `..`, sort query parameters.

**Spider traps (our reasoning):** A calendar page links to "next month" forever. Cap depth, URL length and pages per site. We also compare a hash of each page body, as Mercator skipped pages whose content matched an earlier one.

**Failure:** Content hashes miss pages that differ by a visit counter.

## Topic: Failures and scaling

**Definition:** Fetchers, the frontier and the stores can fail. The crawler must continue without starting over.

**Why:** Crawls run for weeks, so crashes happen. Mercator saved its state 1 to 4 times a day.

**Example:** A fetcher dies after downloading 500 pages. Its URLs were marked "in progress" with a timeout; after it, they return to the frontier (diagram 4). Some pages are fetched twice.

**Failure:** At 10 times the rate we must split by site. Mercator gave each machine its own set of sites, so every site's queue and timer live on one machine. About 80% of links stay on the same site, so they stay on that machine. The next limit is the visited set (800 GB if exact) and bandwidth.

## Questions

### How do you avoid overloading one website?

One queue per site, a timer per site, and a heap that picks the earliest ready site.

### Bloom filter or exact set for visited URLs?

Bloom is smaller (12.5 GB against 80 GB) but about 0.82% of new URLs are wrongly skipped. Use an almost exact set when none may be lost.

### How do you escape a spider trap (an endless set of links)?

Limit depth, URL length and pages per site.

### What if robots.txt cannot be fetched?

RFC 9309: after a 4xx answer, anything may be fetched; after 5xx or no answer, assume everything is disallowed.

## Mistakes

- "Robots.txt keeps private pages safe." RFC 9309 says it is not access authorization.
- "A Bloom filter may lose a visited URL." It never does; it may skip a new one.
- "A crawler is limited by bandwidth only." Per-site gaps and DNS waits cap the speed too.

## Quiz

### How many sites must be crawled at the same time to reach 386 pages a second at 1 request a second per site?

- [ ] 1
- [ ] About 40
- [x] About 386
- [ ] About 38,600

Explanation: 386 / 1.

### A Bloom filter says a URL was "seen". What does that mean?

- [ ] It was surely fetched
- [x] It was probably fetched; a few new URLs are wrongly reported
- [ ] It was surely not fetched
- [ ] It was fetched twice

Explanation: A false positive makes the crawler skip a new URL.

### No robots.txt group (block of rules for one crawler name) matches the crawler. What does RFC 9309 say?

- [ ] Fetch nothing
- [x] Use the `*` group if there is one
- [ ] Ask the site owner
- [ ] Use the longest group

Explanation: With no `*` group either, no rules apply.

### Why one queue per site?

- [ ] To save memory
- [x] A single queue puts many URLs of one site in a row, so fetchers hit it together
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
{ "kind": "graph", "caption": "Crawler parts. The frontier gives a URL to a fetcher (1). The fetcher asks DNS (2), downloads from the internet (3) and saves the page in the page store (4). The parser reads the stored page and finds links (5); the seen check keeps only new URLs (6) and returns them to the frontier (7, dashed).", "groups": [{ "id": "dc", "label": "Crawler" }], "nodes": [{ "id": "f", "label": "Frontier", "x": 14, "y": 18, "shape": "queue", "group": "dc" }, { "id": "w", "label": "Fetcher", "x": 50, "y": 18, "group": "dc" }, { "id": "dns", "label": "DNS cache", "x": 30, "y": 52, "shape": "cache", "group": "dc" }, { "id": "net", "label": "Internet", "x": 86, "y": 18, "shape": "external" }, { "id": "s", "label": "Page store", "x": 66, "y": 52, "shape": "database", "group": "dc" }, { "id": "p", "label": "Parser", "x": 66, "y": 86, "group": "dc" }, { "id": "d", "label": "Seen check", "x": 14, "y": 86, "shape": "cache", "group": "dc" }], "edges": [{ "from": "f", "to": "w", "step": 1 }, { "from": "w", "to": "dns", "step": 2 }, { "from": "w", "to": "net", "step": 3 }, { "from": "w", "to": "s", "step": 4 }, { "from": "s", "to": "p", "step": 5 }, { "from": "p", "to": "d", "step": 6 }, { "from": "d", "to": "f", "step": 7, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Fetching one page. The fetcher asks the frontier for a URL (1, 2) and downloads the page from the site (3, 4); its DNS and robots.txt answers come from caches, so no message is drawn. The page is saved to the page store (not drawn). The fetcher sends the links it found to the seen check (5), which returns only new URLs to the frontier (6).", "actors": [{ "id": "f", "label": "Frontier" }, { "id": "w", "label": "Fetcher" }, { "id": "s", "label": "Site" }, { "id": "d", "label": "Seen check" }], "messages": [{ "from": "w", "to": "f", "label": "Next URL, please" }, { "from": "f", "to": "w", "label": "a.com/page", "dashed": true }, { "from": "w", "to": "s", "label": "GET /page" }, { "from": "s", "to": "w", "label": "Page bytes", "dashed": true }, { "from": "w", "to": "d", "label": "Links found" }, { "from": "d", "to": "f", "label": "Only new URLs" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Polite frontier. A router puts each URL in its site's queue (1). A heap holds one entry per site, ordered by the time the site may be contacted again (2). The fetcher takes the earliest ready site from the heap (3), fetches the head URL of that queue (4, dashed) and puts the site back in the heap with a later time (5, dashed).", "groups": [{ "id": "fr", "label": "Frontier" }], "nodes": [{ "id": "u", "label": "New URLs", "x": 14, "y": 50, "shape": "client" }, { "id": "qa", "label": "Queue a.com", "x": 40, "y": 14, "shape": "queue", "group": "fr" }, { "id": "qb", "label": "Queue b.com", "x": 40, "y": 50, "shape": "queue", "group": "fr" }, { "id": "qc", "label": "Queue c.com", "x": 40, "y": 86, "shape": "queue", "group": "fr" }, { "id": "h", "label": "Heap by time", "x": 66, "y": 16, "group": "fr" }, { "id": "w", "label": "Fetcher", "x": 88, "y": 66 }], "edges": [{ "from": "u", "to": "qb", "step": 1 }, { "from": "qb", "to": "h", "step": 2 }, { "from": "h", "to": "w", "step": 3 }, { "from": "w", "to": "qb", "step": 4, "dashed": true }, { "from": "w", "to": "h", "step": 5, "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A fetcher dies. The frontier hands a URL to fetcher 1 with a timeout (1). Fetcher 1 crashes and sends no reply (2). When the timeout ends, the frontier gives the URL to fetcher 2 (3), which confirms (4).", "actors": [{ "id": "f", "label": "Frontier" }, { "id": "a", "label": "Fetcher 1" }, { "id": "b", "label": "Fetcher 2" }], "messages": [{ "from": "f", "to": "a", "label": "URL x, timeout 60 s" }, { "from": "a", "to": "f", "label": "(crashed: no reply)", "dashed": true }, { "from": "f", "to": "b", "label": "Timeout: URL x again" }, { "from": "b", "to": "f", "label": "Done", "dashed": true }] }
```
