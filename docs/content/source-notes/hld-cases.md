# HLD case studies (Phase 3, 13 Nov 2026): what was written, from what, and what a reviewer must re-check

Twelve drafts in `server/src/data/notes/hld/drafts/` (not published). The strict draft checker prints `template errors: none` for all 23 HLD drafts (11 concept + 12 case). Numbers: `docs/content/checks/hld-case-check.py` with its saved output `hld-case-check-output.txt` (sections 1 to 12 per case); every input is a made-up assumption and the drafts say so. Each case has 7 topics (requirements, numbers, API and data, first design, two hard parts, failures and scaling), 4 questions, 5 quiz items and 4 to 5 diagrams. All are at or under 1,800 words (1,369 to 1,790). **No diagram has been drawn in a browser yet.**

A case study is one reasonable design with its trade-offs. Statements about what a real company did are written as "company X described in <year>" and only where a primary source was read.

| Case | Words | What a real source was read for (year) | Own reasoning (not sourced) |
|---|---|---|---|
| url-shortener | 1,784 | RFC 9110 sections 15.4.2 and 15.4.3 (301 and 302), read verbatim | scrambled counter, ranges of numbers for servers, choosing 302, alias handling, cache and delete order |
| rate-limiter | 1,584 | Redis INCR page; Stripe post "Scaling your API with rate limiters" (30 Mar 2017; **fetch summary only**) | gateway placement, the token-block hybrid, fail open or closed, local fallback limit |
| key-value-store | 1,498 | Dynamo paper section 4 and 6 (read verbatim, 2007); Cassandra Dynamo page (summary) | N = 3, W = 2, R = 2, cost reading of W = 3, differences from Dynamo |
| chat | 1,738 | RFC 6455 (2011; later part not read); Discord post (13 Jan 2017; read to the dark-launch part) | sequence number per conversation, dedupe by client id, lookup table, presence arithmetic |
| notifications | 1,626 | Apple APNs pages (read in full); Firebase lifetime page (verbatim), token and delivery pages (partly) | separate queues, reserved share for login codes, quiet hours, SMS fallback |
| news-feed | 1,723 | "Scaling Memcache at Facebook" NSDI 2013 (read to section 6.1); TAO (ATC 2013, pages 49 to 51) | the hybrid rule and its 10,000 limit, time-ordered ranking, cursor design |
| file-storage | 1,649 | Dropbox posts (2014, 2016, 2020; **summaries**); rsync report (1998; summary) | content-defined blocks (no source found), conflict-copy rule, resumable uploads |
| video-streaming | 1,369 | RFC 8216 (2017; first 100,000 of 148,000 characters only); Netflix Open Connect page (undated, read 2026; summary) | job queue, the 80 percent bit-rate rule, readiness rule |
| ride-sharing | 1,444 | H3 documentation (4.x; summary) | 3 by 3 block argument, atomic claim, offer timeout (assumption), partitioned index |
| web-crawler | 1,790 | Mercator report (2001 Compaq SRC 173, read verbatim; the 1999 paper has no readable PDF); RFC 9309 (read) | the 1 request a second gap, URL normalising, spider-trap caps |
| ticket-booking | 1,777 | PostgreSQL isolation, explicit-locking, constraints and SELECT pages (read) | optimistic versions, hold length trade-off, refund after an expired hold |
| top-k-counting | 1,784 | Count-min sketch paper (2005, full text); Flink windows and time pages (read) | merging sketches, the heap, 1 minute of lateness for a dashboard |

## Re-check list for reviewers
- Re-fetch what was read only as a summary: Stripe post, Cassandra page, Dropbox 2014/2016/2020, rsync report, H3 docs, Netflix page, RFC 8216 later part, RFC 6455 later part, Firebase token and delivery pages, Discord tombstone section (not used), Memcache paper sections 6.2 to 8 (not used).
- The crawler draft cites the Mercator **report**, not the 1999 paper; the Brin and Page paper was not read.
- Claims with **no source** found, now labelled as own reasoning or dropped: content-defined blocks in sync services, privacy effects of deduplication, why H3 uses hexagons, spider traps and URL normalising, how any company ranks a feed or fans it out, provider push rate limits, whether APNs or FCM deduplicate.
- Corrections to my brief: `SKIP LOCKED` is documented on PostgreSQL's SELECT page; the Dynamo paper is SOSP 2007 (confirmed in the text).
- The 6C news-feed simulation has about 107 followers an account on average while 6A uses 200 follows each; the draft keeps them apart, and a reviewer confirms nothing combines them.
- Diagram check in Phase 4: every picture on desktop and phone width, arrow crossings, the video architecture's unnumbered dashed edge.
