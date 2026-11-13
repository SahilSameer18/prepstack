# HLD concept drafts (Phase 2, 13 Nov 2026): what was written, from what, and what a reviewer must re-check

Drafts are in `server/src/data/notes/hld/drafts/` (not published, no `lastChecked`). The strict draft checker prints `template errors: none` for all 11. Numbers come from `docs/content/checks/hld-check.py` (output saved next to it as `hld-check-output.txt`; every figure in a worked example is a line of that output or arithmetic shown in the text). The only link error for these files is expected: `hld-storage-indexes` points to `hld-case-url-shortener`, which is written in Phase 3.

| Section | Topics / questions / diagrams | Words by the checker | Main primary sources |
|---|---|---|---|
| hld-approach-estimation | 7 / 4 / 3 | 2,099 | Dean's talk (full text read), SRE ch. 4 |
| hld-scaling-basics | 6 / 5 / 2 | 2,055 | SRE ch. 19, 20, 22 |
| hld-caching | 7 / 3 / 3 | 2,487 | Redis eviction page (read in full), Azure cache-aside page (read in full), AWS ElastiCache docs (read in full), AWS caching article, Oracle Coherence guide |
| hld-choosing-databases | 7 / 4 / 2 | 1,988 | Dynamo, Bigtable, Spanner papers (text read); Cassandra, MongoDB, Neo4j docs |
| hld-replication-partitioning | 7 / 4 / 2 | 2,326 | Dynamo, Kafka design page, GFS, Raft (text read); Cassandra docs |
| hld-consistency-cap | 7 / 4 / 3 | 2,075 | Gilbert and Lynch 2012, Abadi PACELC, Dynamo (text read); Jepsen, Brewer, Kleppmann abstract |
| hld-consensus-coordination | 6 / 4 / 3 | 2,012 | Raft, Chubby, Spanner, Bigtable (text read); Kleppmann locking page; SRE ch. 23 |
| hld-messaging-streaming | 7 / 4 / 2 | 1,690 | Kafka design page (read in full); AWS SQS docs; AWS queue-backlog article |
| hld-api-rate-limiting | 7 / 4 / 3 | 1,807 | AWS fairness article, SRE ch. 21, RFC 6585, Stripe, Google AIP, gRPC, GraphQL docs |
| hld-reliability | 8 / 5 / 3 | 2,336 | AWS timeouts article, Azure circuit breaker and bulkhead pages (read in full), Tail at Scale (text read), SRE ch. 4, 6, 21, 22 |
| hld-storage-indexes | 7 / 5 / 2 | 1,927 | GFS and Bigtable (text read); AWS storage pages, HDFS erasure coding page, Redis GEO, Lucene, Wikipedia (quadtree) |

**Length:** every draft is over the 1,800-word target (1,690 to 2,487). The Phase 4 editors trim them, as for OS and OOP.

## What a reviewer must re-fetch or verify (these rest on a fetch tool's summary, not on text a writer read in full)
- **SRE book** ch. 4, 6, 19, 20, 21, 22, 23: the 10 to 150 s lame-duck interval; subset size 20 to 100; the random-subsetting figures (300 and 300, 30%, 63% to 121%); round robin 2x spread; K = 2 and the two-minute window; 10% retry budget; queue about 50% of the thread pool; the N+2 example; 2f + 1; six replicas.
- **AWS Builders' Library:** timeouts and retries article (read only as a long summary: the false-timeout percentile rule, token bucket for retries); caching, queue-backlog and fairness articles (the last 20% of fairness was never read verbatim); idempotent APIs, load shedding and fallback (from the notes list, not re-read by writers).
- **AWS** SQS pages (visibility timeout default 30 s and maximum 12 h, dead-letter queue, FIFO), API Gateway throttling pages, AWS object/block/file storage pages.
- **Other docs:** Oracle Coherence (write-behind and refresh-ahead), Cassandra, MongoDB and Neo4j pages, Jepsen model pages (the hierarchy lines), HDFS erasure coding (the page does not state how many failures RS(6,3) survives; the draft's "survives 3" comes from the 3 parity pieces), Lucene codec page (inverted index), Stripe, Google AIP, gRPC, GraphQL, PostgreSQL pages.
- **Kleppmann** critique: only the abstract was read (the draft uses it for "definitions are ambiguous" only). The Redis author's rebuttal to Kleppmann's locking article was not read, so Redlock is described only as Kleppmann's critique.
- **Raft §5.3** was read only near the "majority" lines; a reviewer reads the whole section.
- **Quadtree** rests on Wikipedia (secondary): replace it with a primary source or drop the claim.
- **Redis version facts** ("LFU since 4.0", "LRM new in 8.6") come from the current page; check the versions.

## Claims that are the writers' own reasoning (labelled in the drafts; reviewers decide whether to keep)
- Why R + W > N is "stronger but not strong" in Dynamo's design (from Dynamo 4.4 and 4.6; Abadi states the fact, not the reasons).
- Kafka `acks=1`: a leader crash can lose an acknowledged write (inferred from the definition of committed).
- A Bloom filter never gives a false negative (from the mechanism; Bigtable says only "might contain").
- Sticky-session costs; the offset-paging example (ids 10, 9, 8 and row 11); the rule of thumb for choosing REST, gRPC or GraphQL; the 3 s wait in the 429 diagram.
- Definitions of fixed window, sliding window log, sliding window counter and leaky bucket: **no primary source was read**; a reviewer finds one or the definitions are written as "the algorithm in this note's example" only.

## Corrections to my own brief
- The brief said a one-time scan hurt LRU more than LFU on the C2 trace. The output does not show that: LRU lost 2.2, 2.9 and 3.7 points and LFU lost 2.9, 3.3 and 3.6; LFU was ahead everywhere. The drafts say what the numbers show.
- The brief's "Your sections" part was empty for one writer; the sections were given in the task text. No effect on the drafts.

## Left out because no primary source supports it
Per-product throughput figures; frequency claims ("most asked"); chunk deduplication; a zero-downtime resharding recipe; sequential-key hot spots under range sharding; "millions of connections per second" for a graph database; GraphQL single endpoint; HTTP/2 for gRPC; TLS termination for gateways; the FIFO deduplication window.

## Diagrams
Every draft has 2 to 3 diagrams in the new kinds (numbered graphs with shapes and zones, sequence diagrams, layers). **None has been drawn in a browser yet**; one writer said so for its node positions. Phase 4 includes a visual check of every diagram (desktop and phone width) and fixes crossed arrows.
