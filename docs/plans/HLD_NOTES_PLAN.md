# Plan: System Design (HLD) notes, in four phases (13 Nov 2026)

**Status: Phase 1 (sources and verification) done 13 Nov 2026. The owner approved both recommendations the same day ("Yes, both"): the diagram upgrade (built and tested, see "Phase 1b" below) and two extra case studies (12 in all). Next: Phase 2 (concept drafts), waiting for the owner's go. Results: `docs/content/source-notes/hld-phase1.md`.**

## Phase 1b: diagram upgrade (done 13 Nov 2026, not committed)
The shared diagram component now draws, for every subject: **graphs of up to 14 parts** with node shapes (`database` cylinder, `queue`, `cache`, `client`, `external`), **zone boxes** (`groups`, up to 3, for a data centre or a region), **numbered arrows** (`step`, the order of a request path) and **dashed arrows** (`dashed`, asynchronous paths); a **new `sequence` diagram** (2 to 5 actors, 1 to 12 numbered messages) for Raft, two-phase commit, retries and cache flows; and **up to 6 diagrams per section for the `hld` subject** (3 for every other subject, enforced in the validator). Wide pictures keep a readable size on a phone and scroll sideways inside their card. Files: `server/src/validators/notes.validators.js`, `client/src/components/notes/diagramLayout.js`, `Diagram.jsx`, tests in `diagramLayout.test.js` and `server/test/content-ids.test.js` (26 new tests), rules in `docs/content/NOTES_TEMPLATE.md`. Checked: server 761 tests, client 85 tests, build, lint, seo-check; a sample request-path diagram and a Raft write sequence were drawn in the browser (desktop looked right; at phone width the text is small unless the picture scrolls, which is why the minimum width was added). **Not yet checked:** a real HLD section on the live notes page, which needs a published HLD subject (Phase 4).

**Rules for the diagram work in Phase 2 and 3:** every concept section gets 1 to 3 diagrams and every case study 4 to 6 (main architecture with numbered request path; write path; read path; one failure or scaling picture; a sequence diagram where order in time matters). Place nodes so no arrow crosses another box (the layout draws straight lines). Every diagram is our own drawing from our own design, never copied or traced from a paper or book, and has a caption that also explains it in words.

## Phase 1 result (13 Nov 2026)
- **Read and checked:** nine primary papers (Dynamo, GFS, Bigtable, MapReduce, Spanner, Chubby, Raft, Tail at Scale, Abadi's PACELC) and Dean's numbers talk, extracted to text and checked; the Gilbert and Lynch "Perspectives on the CAP Theorem" paper; Kafka's design page (read from its source repository, because the website only shows a redirect page); SRE book chapters 4, 6, 19 to 23; seven AWS Builders' Library articles; Kleppmann on CAP and on fencing tokens; Brewer's CAP article. Every fact in the notes is limited to what is listed in the source note.
- **Not read:** the original 2002 Gilbert and Lynch paper (its text came out garbled; the 2012 paper by the same authors states the same definitions), the AWS terms of use, Hello Interview's individual pages (all rights reserved: titles only), and books and videos (never cited).
- **Licence findings:** the SRE book is CC BY-NC-ND (restate only); the AWS articles are all rights reserved; Hello Interview is all rights reserved; the System Design Primer is CC BY 4.0; **awesome-low-level-design is GPL-3.0, so for LLD we use its problem titles only and never its code**.
- **Corrections to the owner's folder** (not carried over): MongoDB is not simply "CP" (Abadi calls it PA/EC); even R + W > N does not give full consistency in the Gilbert and Lynch sense; plus the items listed earlier.
- **Case-study check:** all ten chosen case studies appear in public interview lists. Two common ones are missing and cover ideas the ten do not: **ticket booking** (seat holds, double booking, payment idempotency) and **top-K / click counting** (streaming counts, windows, late data). Recommendation: add both (12 case studies, about 2 more days).
- **Diagrams (the owner's point):** today's diagram component draws only three simple kinds, at most 3 per section, up to 10 boxes, no database or queue shapes, no zones, no numbered steps, no message-over-time view. That is too little for system design. **Recommendation: upgrade the shared diagram component first (Phase 1b, about 2 days)**: graphs of up to 14 parts with shapes (database, queue, cache, client), zone boxes, numbered and dashed arrows; a new sequence diagram kind for Raft, two-phase commit, retries and cache flows; up to 6 diagrams per HLD section. Details in `hld-phase1.md` section 7. It also helps LLD later (class and sequence views).
- **Kafka facts** come from the repository's current design text; any Kafka fact in the notes is labelled as Kafka's behaviour from version 0.11 on, not as general theory. First of the three next pieces in the owner's order: **HLD notes, then LLD notes, then My plan** (`docs/plans/MY_PLAN_PLAN.md`). Method: the one that produced the DBMS, Networks, OS and OOP notes (`docs/content/NOTES_TEMPLATE.md`, `REVIEW_CHECKLIST.md`, `SOURCES.md`), with the lessons from the OS and OOP work built in (below). Owner's rules: accurate and big-tech level, easy words a non-technical person can follow (keep the technical term, add its plain meaning, never lose meaning), nothing copied, every claim sourced, every number computed, publish only on the owner's word, free for everyone with an account.

## Owner decisions (13 Nov 2026)
1. **Shape: concepts plus case studies.** One notes subject, "System Design", with about 11 concept sections and about 10 case-study sections, each a full worked design.
2. **Depth: big-tech level.** Includes consensus (Raft, quorums), consistency models, failure handling (timeouts, retries, backoff with jitter, load shedding), back-of-envelope numbers and trade-offs. Every claim from a source we read.
3. **Which case studies: "whatever is required"** (delegated). My choice, from what big-tech design rounds ask and from the owner's own list: URL shortener, rate limiter, key-value store, chat, notification service, news feed, file storage, video streaming, ride sharing, web crawler (ten). The owner's folder lists six of these (URL shortener, rate limiter, chat, video, ride sharing, notifications).
4. **Subject slug `hld`** (ids like `hld-caching`; the Notes card is renamed "System Design (HLD)"; LLD will be `lld` later). This is my technical choice so that links read `/notes/hld/hld-caching`.

## What the notes already cover (read from the repo, 13 Nov 2026)
- **Networks:** `cn-system-design-concepts` (load balancer, layer 4 and 7, reverse proxy, CDN, caching layers, putting it together) and `cn-key-flows` (what happens when you type a URL).
- **DBMS:** `dbms-advanced-concepts` (query optimisation, EXPLAIN, join algorithms, **replication, partitioning and sharding, the CAP theorem**), plus transactions, concurrency control and indexing.
- So the HLD notes **point to** those sections and add what they do not have (the system-level view, consistency models, consensus, messaging, reliability, estimation and the case studies). A short recap where needed, never a copy.
- **The Notes page** already has a "System Design" card marked "coming soon" (`client/src/pages/csNotes/Notes.jsx`).

## The owner's folder (`Desktop\system-design`, read again 13 Nov; two commits, seven files)
- **HLD content:** a 4-step interview framework (requirements, estimation, high-level design, deep dive), seven building blocks (scaling and load balancing, caching, replication and sharding, CAP and PACELC, queues against streams, consistent hashing, rate limiting) and a resource list. Used as **topic ideas only**; nothing is copied.
- **Things not to carry over:** throughput numbers with no source ("10k to 50k messages a second" for queues, "millions" for Kafka); "MongoDB with majority write" listed as CP without conditions; "sliding window counter, highly accurate" (it is an approximation); "master-replica" wording (we say leader and follower); links to `decision-frameworks.md` and `case-studies/`, which do not exist; the case-study list was never written.

## Where the content comes from
**Rule (as before):** a *fact* may rest only on a Tier 1 source. Tier 2 gives topic lists and question lists, never facts. Every source is read, restated in our own words, cited by section in `SOURCES.md`, nothing copied. PDFs are saved and read locally with `pdf-parse`. Videos and books we cannot read (DDIA, Alex Xu) are never cited. **Every example in a case study is labelled "assumption" and its numbers are computed by a script.**

**Tier 1: primary sources for facts (what the first check on 13 Nov found)**
| Source | What we take from it | Status and limits |
|---|---|---|
| Google *Site Reliability Engineering* book (sre.google/sre-book) | Service level objectives, monitoring, load balancing, handling overload, **cascading failures** (retry multiplication, backoff, retry budgets, load shedding, deadlines, queue sizing), distributed consensus, data integrity | **Read 13 Nov (chapter 22 and the contents).** Free HTML. Licence **CC BY-NC-ND 4.0**: restate in our words and cite, never copy text or figures. Numbers in chapter 22 are examples, labelled as such |
| AWS Builders' Library: "Timeouts, retries, and backoff with jitter" and others | Timeouts, retry rules, jitter, token-bucket throttling, idempotency | **Read 13 Nov** (that article). "All rights reserved", terms not yet read: restate only. The article list is script-loaded, so other articles are found one by one in Phase 1 |
| Raft (raft.github.io and the paper "In Search of an Understandable Consensus Algorithm") | Replicated state machine, leader election, log replication, majority rule (a 5-server cluster survives 2 failures) | **Site read 13 Nov** (CC BY 3.0). The paper PDF is read locally in Phase 1 for election and log details |
| The original system papers: **Dynamo (2007), GFS (2003), Bigtable (2006), MapReduce (2004), Spanner (2012)** | The designs the industry copies: consistent hashing, quorums, sloppy quorum and hinted handoff, chunk servers, tablets, partitioned batch work, globally consistent transactions | **Reported.** The five PDFs download (HTTP 200) but the fetch tool returns them as binary: Phase 1 saves them and extracts the text locally. Titles, authors and years are checked from the text, not assumed |
| Apache Cassandra documentation (Dynamo architecture page) | How a real system implements consistent hashing, vnodes, quorums (R + W > N), gossip, Merkle-tree repair, hinted handoff | **Read 13 Nov.** Apache 2.0. Cassandra uses last-write-wins timestamps, not Dynamo's vector clocks (the page says so) |
| Redis documentation (eviction) | The ten eviction policies, LRU and LFU as approximations (sampling), `maxmemory` | **Read 13 Nov.** No licence notice found: use for behaviour facts, restate |
| Apache Kafka documentation | Partitions, consumer groups, offsets, delivery semantics, retention | **Not readable by the fetch tool** (it returns a redirect page). Phase 1 tries versioned or repository URLs; if unreadable, Kafka facts are left out |
| Brewer, "CAP twelve years later"; Gilbert and Lynch (the proof); Abadi (PACELC); Kleppmann, "A Critique of the CAP Theorem" and the fencing-token article | The exact statements of CAP and PACELC and the usual misreadings | **Reported.** Phase 1 finds readable copies (arXiv and author pages) |
| Jeff Dean's "numbers everybody should know" (latency table) and Norvig's version | Order-of-magnitude latencies for memory, disk, network | **Reported.** Read in Phase 1; shown as orders of magnitude with the year, never as exact current values |
| Azure Architecture Center (44 cloud design patterns) and the AWS Well-Architected Framework | Pattern names and problem framing; vocabulary | **Read 13 Nov (lists).** No licence notice found: names and framing only, mechanics checked against Tier 1 |

**Tier 2: study aids (topics, questions and mistakes only; never facts)**
| Aid | Use |
|---|---|
| *System Design Primer* (donnemartin, **CC BY 4.0**) | Topic checklist and about 20 case-study names (URL shortener, rate limiter, web crawler, news feed and others), CAP and consistency framing; the best coverage list. Because the licence allows reuse we may credit it, but our text is our own |
| *Hello Interview* "System Design in a Hurry" (added 13 Nov from the owner's research paste) | Free guide pages: topic order and problem list only. **Not read yet**: Phase 1 reads the free pages and records the terms; free against paid pages is unconfirmed. No text copied |
| *System Design 101* (ByteByteGo, **CC BY-NC-ND 4.0**) | Guide titles as a checklist (consistent hashing, sharding algorithms, eviction strategies, delivery semantics). **No text or diagram is adapted** (no derivatives, no commercial use) |
| awesome-scalability (MIT, a link list) | Finding primary sources (Brewer, Dean, Vogels, Netflix and Dropbox posts) |
| The owner's `system-design/HLD` notes | Topics and the interview framework; see the list of things not to carry over |
| Interview pages (GeeksforGeeks, InterviewBit, design-question lists) | Count which designs and topics are asked; answers checked against Tier 1 |

## Section lists
**Concept sections (11)**
| id | Title | Main content | Sources |
|---|---|---|---|
| `hld-approach-estimation` | The Design Interview and Back-of-the-Envelope Numbers | the 4-step framework, requirements (functional and not), QPS, storage and bandwidth maths, powers of two, latency numbers, availability in nines | primer, Dean, scripts |
| `hld-scaling-basics` | Scalability, Load Balancing and Stateless Services | scalability against performance, latency against throughput, vertical and horizontal, stateless servers, balancing algorithms, health checks | SRE ch. 19, 20; pointer to the CN section |
| `hld-caching` | Caching | cache-aside, write-through, write-behind, refresh-ahead, eviction (LRU, LFU), invalidation, stampede, hit ratio, where caches live | Redis docs, primer; pointer to CN |
| `hld-choosing-databases` | Choosing a Database | relational against key-value, document, wide-column, graph; when each fits; denormalisation; read replicas | Cassandra and Bigtable, DBMS pointers |
| `hld-replication-partitioning` | Replication, Sharding and Consistent Hashing | leader-follower, multi-leader, leaderless; shard keys, hot partitions, resharding; consistent hashing with a computed ring | Dynamo, Cassandra docs; pointer to DBMS |
| `hld-consistency-cap` | Consistency Models, CAP and PACELC | strong, eventual, causal, read-your-writes; CAP exactly as proved; PACELC; quorum R + W > N with a computed table; conflict resolution (last-write-wins, vector clocks) | Gilbert and Lynch, Brewer, Abadi, Dynamo, Cassandra |
| `hld-consensus-coordination` | Consensus and Coordination | replicated state machine, Raft (election, log, majority), why 2f + 1 servers, split brain, fencing tokens, leader election, lock services | Raft paper, SRE ch. 23, Kleppmann |
| `hld-messaging-streaming` | Queues, Logs and Streaming | queue against log, partitions, consumer groups, offsets, delivery semantics, ordering, back pressure, dead-letter queues, idempotent consumers | Kafka docs if readable, AWS and SRE, primer |
| `hld-api-rate-limiting` | APIs, Gateways and Rate Limiting | REST and RPC choices, pagination, idempotency keys, gateway, token bucket, leaky bucket, fixed and sliding windows (computed), distributed counters | AWS Builders' Library, SRE, a runnable simulation |
| `hld-reliability` | Reliability: Timeouts, Retries and Failure | SLI, SLO, error budgets; timeouts, retries with backoff and jitter, retry budgets, circuit breaker, bulkhead, load shedding, cascading failures, N + 2 capacity, graceful degradation; metrics, logs, traces and the four golden signals | SRE ch. 4, 6, 21, 22; AWS timeouts article |
| `hld-storage-indexes` | Storage, Search and Special Indexes | object against block against file storage, chunking and deduplication, replication against erasure coding (overhead computed), Bloom filters (false-positive rate computed), inverted index, geohash and quadtree | GFS, Bigtable, papers, scripts |

**Case-study sections (12: the ten first chosen, plus ticket booking and top-K / click counting added on 13 Nov 2026)**, each in the same shape: requirements, estimation, API and data model, high-level design, the hard parts (two deep dives), failure cases and scaling, follow-up questions. In the template each topic is one design decision with its definition, why (trade-off), example (numbers or a flow) and failure (what the interviewer probes).
`hld-case-url-shortener`, `hld-case-rate-limiter`, `hld-case-key-value-store`, `hld-case-chat`, `hld-case-notifications`, `hld-case-news-feed`, `hld-case-file-storage`, `hld-case-video-streaming`, `hld-case-ride-sharing`, `hld-case-web-crawler`, `hld-case-ticket-booking`, `hld-case-top-k-counting`.

**Reading order (`next` chain):** the concept sections in the order above, then the case studies from easiest to hardest in the order above.

## How each section is written
1. Learn the topic from Tier 1 (papers, docs, SRE and AWS).
2. Write the definition in our own simple words with one everyday analogy; keep every technical term with its plain meaning beside it.
3. Check every exact fact against a Tier 1 source; every number from a script (`docs/content/checks/hld-check.py` and per-section scripts).
4. Add the standard interview questions from Tier 2 and check each answer against Tier 1; keep any wrong answer as a "mistake" item.
5. Mark anything system-specific (Cassandra, Redis, Kafka, Dynamo) as such, never as general theory.
6. **Lessons from OS and OOP applied:** the draft checker forces the full template (a draft has no `lastChecked`, so the validator would otherwise skip it); reviewers re-fetch primary sources instead of trusting summaries; examples that print a number or a trace are run; no frequency claims ("most asked"); no source-name tags in learner text; one full teaching place per topic and one-line pointers elsewhere; sections stay at about 1,800 words or fewer; plain meanings at first use.

## The four phases

### Phase 1: sources, verification and the section lists (about 3 days)
1. Download the five system papers and the Raft paper, extract the text locally, read them, and record title, authors, year and the page of each fact in `docs/content/source-notes/hld-batch-a.md` (and `-b`, `-c`).
2. Read the remaining Tier 1 pages: SRE chapters 4, 6, 19 to 23; the AWS Builders' Library articles on retries, load shedding and avoiding fallback (found one by one); Kafka's design documentation by another URL; Cassandra and Redis pages in full; the CAP papers; Dean's numbers.
3. Check the licence and terms of each source (AWS Builder Terms, Azure, Redis) and record them.
4. Count the designs and topics interview pages ask and list the wrong answers found there.
5. Confirm the section lists below with any change proposed in easy words; the owner approves a change before drafting.
**Output:** source notes, a verification table, the confirmed lists. **Gate:** the owner approves.

### Phase 2: concept drafts (about 6 days)
Each section is a Markdown draft in `server/src/data/notes/hld/drafts/` in the full template (overview 60 to 120 words, 4 to 8 topics with definition, why, example and failure, 3 to 5 questions, 2 to 3 mistakes, exactly 5 quiz questions, at most 3 diagrams). **Every number is computed by a script:** QPS and storage for the example systems, latency and powers-of-two tables, availability in nines and downtime per year, the consistent-hashing ring with the share of keys that move when a node is added, the quorum table for N = 3 and 5, token bucket and window counts on a fixed request trace, retry amplification (for example the 4-layer, 3-retry multiplication), LRU and LFU hit ratios on a fixed trace, Bloom filter false-positive rates, erasure coding against replication overhead.
**Output:** 11 concept drafts, scripts, claims rows.

### Phase 3: case-study drafts (about 9 days)
Twelve drafts in the same folder. Each has an estimation script and, where it helps, a small simulation that is run and whose output is shown (a base-62 id space and collision odds for the URL shortener, a token-bucket run for the rate limiter, a ring and replica placement for the key-value store, the fan-out arithmetic for the news feed, the crawl frontier order). Each design states its assumptions and its trade-offs; no design is called "the" answer.
**Output:** 12 case drafts, scripts, claims rows.

### Phase 4: review, publish and wire up (about 4 days)
1. **Reviewers:** two read-only accuracy reviewers (they re-fetch the sources and recompute every number) and one plain-words reviewer, then editors, as for OS and OOP; a final strict-checker run over every draft.
2. **Publish on the owner's word:** add `lastChecked`, move the drafts up, `hld.js` becomes a Markdown loader like `cn.js`.
3. **Wire up the new subject** (everything that lists the subjects today): `server/src/data/notes/hld.js`; `server/src/seed/notesSeed.js`; the subject lists in `server/test/content-ids.test.js`, `internal-links.test.js`, `skills.test.js` and the section counts; `skillCatalog.json` mappings (System Design, caching, load balancing and message-queue skills point at the new sections); the Notes page card (remove "coming soon", slug `hld`); `client/src/seo/pages.js` and the prerender count with `seo-check`; the subject names in `client/src/utils/reportLinks.js`; the Analyzer context and prompt if they list subjects; README, TESTING, `IMPROVEMENT_PLAN.md`, `SOURCES.md`. A test fails if a subject is missing from any of these lists.
4. Full server and client suites, the build, `npm run check:links`, and a browser check of one concept page and one case-study page on an isolated stack (never ports 3000 or 5173).
5. The owner commits and runs `npm run seed:notes`.
**Output:** published HLD notes, updated tests and docs, commit commands.

## Time and order
About 24 working days of work: 3 (Phase 1, done) + 2 (Phase 1b, done) + 6 + 9 + 4 (with parallel writers and editors the elapsed time is much shorter, as in OS and OOP). Concepts first, then case studies, because the case studies point back to the concepts. After Phase 1 I re-estimate. When My plan is built, the big-tech preset takes these sections automatically.

## What will not be perfect (said up front)
- No outside reader has read these notes unless the owner finds one; the notes say "checked by the author and AI reviewers".
- Books we cannot read (DDIA, Alex Xu) and videos are used for no claim.
- The SRE book and the ByteByteGo guides are licensed no-derivatives: we learn from them and restate, never copy text or diagrams.
- Real systems differ from papers; every system-specific fact is labelled with its system and version.
- Case-study designs are **one reasonable design with its trade-offs**, built on stated assumptions, not the one right answer.
- Numbers from papers are dated (2003 to 2012); latency numbers are orders of magnitude.
- Kafka's own documentation may stay unreadable by our tools; then its facts are left out.

## Still open
Nothing blocks Phase 2. The slug `hld` (decision 4) and the other case-study picks (decision 3) stand unless changed.
