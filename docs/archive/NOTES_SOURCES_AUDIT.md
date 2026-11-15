# Audit of sources and inspiration for the CS notes

Read on **10 Nov 2026** from the public pages of each site (nothing behind a login). Purpose: decide which sources the notes are *checked against* (accuracy) and which sites *teach us a structure* (inspiration), before the notes are rewritten in stage 3. We take structure and ideas only. The notes themselves are written in our own words, and every fact still needs its own row in the claims table in `docs/content/SOURCES.md`.

## How far to trust this audit

- Each site was read by fetching its home page and one or two content pages. Pages are summarised, never copied.
- Some tools returned only a PDF, or only a summary of the tail of a long page. Anything marked **not verified** was not read as text. Several courses' lecture notes and slides (CMU, Stanford, Berkeley) are PDFs that could not be read, so those courses are marked structure inspiration only.
- Eight claims that matter most (RFC status, database defaults, Java edition, and the examples of mistakes on interview sites) were re-checked a second time on the live page. All were confirmed. The one exception is noted: the MIT licence name is inferred from its link.
- Versions and dates change. Re-check a source's version when you cite it.

## Verdict per source

| Source | Use as | Version / date seen | Reuse terms seen | Main reason |
|---|---|---|---|---|
| Database System Concepts (db-book.com) | **Accuracy** | 7th ed., Mar 2019 | Slides: personal use and courses using the book; full-book terms not seen | Named authors, dated edition, errata, slides by chapter. Chapter text itself not read |
| Operating System Concepts (os-book.com) | Inspiration | 10th ed. (page dated 2018) | not found | Free bundle per chapter (slides, exercises, study guide) is a good model. Content not read |
| Computer Networking (Kurose, Ross) | Inspiration | 9th ed., 2025 | © 2010-2025 authors | Self-test questions after each section. Answers not read |
| Java Language Specification (Oracle) | **Accuracy** | Java SE 27, released Sep 2026 | © Oracle; licence page not read | Official, versioned, dated. Dense: for checking, not for reading |
| The Java Tutorials (Oracle) | Inspiration | updated Oct 2024, written for JDK 8 | © Oracle | Good lesson order, but dated for modern Java (records, sealed classes, pattern matching missing) |
| Effective Java, 3rd ed. (Bloch) | Inspiration | 2017, covers up to Java 9 | © publisher | One rule per numbered item suits revision. Not safe for modern Java |
| PostgreSQL manual | **Accuracy** | 18.6 is "current"; 19 is a release candidate | © PostgreSQL Global Development Group; legal page not read | Exact, versioned, section numbers, correction form on each page |
| MySQL reference manual | **Accuracy** | 8.4 (the site's "current" is 9.7) | © Oracle | Exact, versioned. Describes InnoDB, not "MySQL in general" |
| RFCs (rfc-editor.org) | **Accuracy** | per RFC | IETF Trust | The normative source for protocols. Check the "obsolete" banner |
| Use The Index, Luke | **Accuracy** (indexing) and inspiration | © 2010-2026, "actively maintained" | All rights reserved | Vendor-tested indexing claims, one concept per page |
| OSTEP (Three Easy Pieces) | Inspiration | v1.10, Nov 2023 | free to read; no licence name seen | Three-part structure, a "crux" per chapter, a per-chapter errata log. Chapter text unreadable (PDF) |
| Beej's Guide to Network Programming | Inspiration | v3.3.3, Oct 2026 | not seen on the pages read | Call-order and one-key-fact-per-call format. Snippets omit error checking |
| CMU 15-445 (Fall 2026) | Inspiration | Fall 2026 | not seen | Good topic order for databases. Notes not readable. Far deeper than interviews |
| Stanford CS144 (Fall 2026) | Inspiration | Fall 2026 | not seen | TCP, then congestion, then routing order. Practice exams with answers |
| Berkeley CS162 (Fall 2026) | Inspiration | Fall 2026 | not seen | OS topic order. Public exam archive with solutions back to 1999 |
| MIT 6.1810 (OCW, Fall 2023) | **Neither** | Fall 2023 | CC BY-NC-SA 4.0 (name inferred from the licence link) | Short syllabus, kernel-lab course. NonCommercial term may restrict reuse |
| MDN | Inspiration (page layout) | pages dated 2026 | not checked | Lead definition first, diagrams early, last-modified and report-a-problem links |
| react.dev | Inspiration (teaching pattern) | - | not checked | "Broken first, then why, then fix", Pitfall and Deep Dive callouts, challenges with hint and solution |
| Stripe docs | Inspiration (small parts) | - | not checked | Effort card at the top, numbered steps, test-data tables |
| VisuAlgo | Inspiration | active | citation required; copying and hosting its files not allowed | Analysis, then algorithm, then quiz flow. Animations are expensive to build |
| Wizard Zines / jvns.ca | Inspiration | dated posts | © Julia Evans | "Gotchas" and "what is hidden" patterns. Experience stated as fact in places |
| System Design Primer (GitHub) | Inspiration | 377k stars; no update date shown | licence file linked; name not verified | Four-step method and trade-off framing. Numbers and links may be old |
| Designing Data-Intensive Applications | **Accuracy** (cite only) | 2017 | © 2014-2019 author | Reputation only; the pages read hold no claims. Not verified here |
| GeeksforGeeks | Topic checklist only | pages dated Sep-Oct 2026 | not checked | Broad topic lists. See the mistakes below |
| InterviewBit | Topic checklist only | OS guide Feb 2026, networking Mar 2026 | not checked | Question lists with answers. See the mistakes below |
| Educative | Neither for our subjects | - | - | No OS, DBMS or networks course visible. System design course: 77 of 220 lessons free |
| TUF and CodeHelp | Done earlier | 7 Nov 2026 | - | See `COMPETITOR_STUDY.md` |

## Accuracy sources: how to cite, and the traps

These are the facts a note author must not get wrong.

**PostgreSQL vs MySQL (verified on the live pages).** The default isolation level is **Read Committed in PostgreSQL** and **REPEATABLE READ in MySQL InnoDB**. PostgreSQL treats Read Uncommitted as Read Committed; InnoDB's READ UNCOMMITTED allows dirty reads. A note must say which database it describes. Never write a vendor behaviour as a general rule.

**RFCs.** Check the top banner and the Obsoletes and Updates lines before citing. Replacements seen: RFC 793 by **RFC 9293** (TCP, Internet Standard); the older HTTP RFCs (7231 and others) by **RFC 9110** (HTTP semantics); **RFC 8446 (TLS 1.3) is now marked obsolete, see RFC 9846** (verified; status "Proposed Standard"). RFC 1035 (DNS) has a long list of updates, so cite the updates with it.

**Java.** The Java Tutorials and Effective Java are valid for classic object-oriented ideas but they stop at JDK 8 and Java 9. For anything modern (records, sealed classes, pattern matching, switch expressions) cite the Java Language Specification for the edition you mean and say the version in the note.

**Citation format for the claims table** (what to write in the Source column):
- PostgreSQL: `PostgreSQL 18 docs, section 13.2 Transaction Isolation, Table 13.1`
- MySQL: `MySQL 8.4 Reference Manual, section 17.7.2.1 Transaction Isolation Levels`
- RFC: `RFC 9293 (TCP, STD 7), section 3.3.2 State Machine Overview`
- Book: `Silberschatz, Korth, Sudarshan, Database System Concepts, 7th ed., chapter and section`
- Use The Index, Luke: `Winand, Use The Index, Luke, The Where Clause > Concatenated Indexes, <URL>`
- OSTEP: `Arpaci-Dusseau, Operating Systems: Three Easy Pieces, v1.10, chapter number and title`
- JLS: `Java Language Specification, Java SE 27, chapter and section`

## What the good sources do that we should take (structure ideas)

1. **Lead with the definition, then the picture, then detail** (MDN). A reader gets the answer in the first lines.
2. **A small facts strip at the top**: minutes to revise, difficulty, **last reviewed date** (Stripe's effort card, MDN's last-modified line). It builds trust cheaply. We already have reading time and last checked.
3. **"Wrong first" explanations** (react.dev): show the common wrong idea or broken query, say why it fails, then show the fix. Use Use The Index, Luke's "broken query next to the fixed query" for databases.
4. **A gotchas list per topic** (jvns.ca) and **a Pitfall callout** for the one rule that is most often missed (react.dev).
5. **A "crux" question per chapter** (OSTEP) and a **short self-test per section** (Kurose and Ross knowledge checks; VisuAlgo's mini quiz). We already plan quizzes and one checkpoint question.
6. **Past exams with answers as a model for question style** (Berkeley CS162's archive, Stanford CS144's practice exams).
7. **Call-order tables and one key fact per call** (Beej) for things like the TCP socket call sequence.
8. **A fixed method for open design questions** (System Design Primer's four steps: requirements, high-level design, core components, scale) and the **trade-off framing** ("everything is a trade-off").
9. **Inline "in this article" list and a short "See also"** (MDN), flat and short.

**Topic order from the strongest courses** (for deciding the order inside a subject, not for interview weight):
- Databases (CMU): relational model and SQL, storage, indexes, query execution and optimisation, concurrency control, recovery, distributed.
- Networks (CS144): datagrams and layering, reliability, TCP, congestion control, packet switching, routing.
- OS (CS162): fundamentals, threads and processes, synchronisation, scheduling, deadlock, virtual memory, I/O, file systems.
Our current order (ER model first for databases) follows the classic textbook order. Which order suits interview revision best is a decision for the stage 3 plan; the audit does not settle it.

## What not to copy (observed)

- **MDN's full reference sidebar** (172 header links, 60 status codes): too heavy for revision.
- **Hub pages that give one line per topic and link out** (the GeeksforGeeks pages read). Our section carries the worked example on the same page.
- **Sign-up, OTP and career-funnel gates** and "free mock test" forms that collect employer and graduation data (InterviewBit pages read).
- **Course upsell blocks in the body**, and pages with no author or reviewer shown.
- **Large animation engines** (VisuAlgo): high cost. Our static data diagrams are enough for stage 3.
- **Project-heavy depth** (CMU, CS144, CS162 labs): far beyond interview preparation.

**Mistakes the auditor noticed on interview sites** (each re-checked on the live page on 10 Nov 2026; shown so our notes avoid them, not to criticise):
- GeeksforGeeks DBMS tutorial: says a NoSQL database stores data as key-value pairs, then lists MongoDB and Cassandra as NoSQL examples. NoSQL covers several data models.
- InterviewBit networking guide: says a gateway can connect dissimilar networks while a router can only connect similar ones. A router connects different link types routinely.
- InterviewBit OS guide: lists "independent process" and "cooperative process" as the two types of process synchronization. Those are types of process, not of synchronization.
- GeeksforGeeks deadlock page: presents the four conditions as if they were enough on their own. They are necessary, and sufficient only in some cases (for example single-instance resources). (Not re-checked on the live page.)
Our rule: a note states the exact condition under which a statement is true, and every claim has a source.

## Topic coverage checklist (union of what the interview sites cover)

This is a list of candidate topics to **decide on by interview frequency**, not an instruction to cover everything. We compare it with our current sections in stage 3.

- **OS:** kernel and system calls, boot; process and PCB, states, scheduling (FCFS, SJF, RR, priority, MLFQ); synchronization (race condition, critical section, Peterson, semaphores, mutex vs semaphore, monitors, priority inversion, producer-consumer, dining philosophers); deadlock (four conditions, prevention, avoidance with Banker's algorithm, detection and recovery); memory (paging, segmentation, TLB, page replacement, Belady's anomaly, thrashing, fragmentation, copy-on-write, demand paging); file systems (inodes, allocation, free space); disk scheduling; threads; zombie and orphan processes; RAID.
- **DBMS:** architecture; ER model; keys; functional dependencies with closure and Armstrong's axioms; 1NF to BCNF (4NF and 5NF rarely asked), decomposition; relational algebra; SQL joins and nested queries; ACID; schedules and serializability; lock, graph and timestamp protocols; log-based recovery; B and B+ tree, hash and bitmap indexes; query optimization; SQL vs NoSQL with the data models named correctly; isolation levels.
- **Networks:** OSI and TCP/IP; framing, error detection (CRC), flow control, sliding window (GBN, SR), ARQ; classful and CIDR addressing, subnetting, NAT, ARP, DHCP, ICMP; routing (distance vector, link state); TCP three-way handshake, termination, states and congestion control; TCP vs UDP; DNS, HTTP and HTTPS, SMTP, TLS handshake; ping, TTL, traceroute; VLAN; firewalls and VPN.
- **System design (later):** performance vs scalability, latency vs throughput, horizontal vs vertical scaling, DNS, CDN, L4 vs L7 load balancing, reverse proxy, SQL vs NoSQL, replication and sharding, caching strategies, queues, TCP vs UDP, REST vs RPC, CAP at definition level, latency numbers.

## Not verified, or not done

- Lecture and chapter text of the textbooks and the CMU, Stanford and Berkeley courses was not read (PDFs or paywalled). They are not "accuracy references" until a person with the book checks the section being cited.
- Licence pages of the Java specification, PostgreSQL and the System Design Primer were not opened. Do not reuse text, diagrams or code from any of them without reading their terms. Our notes are in our own words, so this is not a blocker.
- GeeksforGeeks interview-question lists, InterviewBit's DBMS guide, and Educative lesson bodies were not read.
- Page weight, ads and pop-ups could not be measured through the tools used.
- Dates and versions are as seen on 10 Nov 2026.
