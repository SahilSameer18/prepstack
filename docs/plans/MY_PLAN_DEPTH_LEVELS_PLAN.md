# My plan: depth levels per subject

Written 15 Nov 2026. Status: **decided to build** (owner, 15 Nov 2026); not started. Phase E of `docs/plans/MY_PLAN_COVERAGE_PLAN.md`.
Why: Planly asks a level for every subject ("start from zero", "foundations", "pattern mastery", "quick revision" for DSA; "learn in depth" or "interview preparation" for OOPs, DBMS, OS and CN). My plan today plans every subject the same way for everybody. A student who knows DBMS well and only wants a recap, and a student who is new to it, should get different plans from the same hours.

## 1. What the student sees

**Builder (`/my-plan`).** Under the subject checkboxes, one short choice for each chosen subject, and one for DSA:

| Choice | Plain-words label | What it means |
|---|---|---|
| CS subject: **Full** (default) | "Full sections: read every part" | Today's behaviour. Each section is planned as 3 times its reading time plus the 5-question quiz |
| CS subject: **Deep dive** | "Deep dive: the full sections plus the advanced ones" | Everything in Full, plus the extra advanced sections of that subject (section 2.4), each planned like a normal section. Offered for a subject only once its deep-dive sections exist |
| CS subject: **Quick recap** | "Quick recap: key ideas, interview questions and the quiz" | A shorter version of each section (overview, definitions, why it matters, interview questions, common mistakes) plus the quiz. About 40% less time per section |
| DSA: **From the basics** | "From the basics: read the pattern lesson first, then practise" | Before each group of topics, the matching DSA pattern lessons (planned in `docs/plans/DSA_LESSONS_PLAN.md`) are planned like notes sections, then the problems. Offered once the first lessons exist |
| DSA: **Standard** (default) | "Standard: the sheet as it is" | Today's behaviour |
| DSA: **Quick revision** | "Quick revision: the main problems of each topic" | A smaller set per topic group: easier problems first, about 40% of each group, at least 2 problems |

- Existing plans, shared links and the public preview without a level choice behave exactly as before (Full and Standard).
- The preview card says what the choice did: for example "Quick recap for Operating Systems and DBMS: 21 sections at about 20 min instead of 35 min" and shows the new totals and the not-included list.
- The Plan tab shows the chosen levels in one line and has a "Change depth" button: a dialog with a preview and a confirmation, like "Change pace".
- Notes pages get a "Recap view" switch. A plan task for a recap section opens the page in that view.
- The Today screen does not change (decision 33).

## 2. The content for each level

### 2.1 CS notes: what already exists (measured on the real notes, 15 Nov 2026)
Every section has the same parts: overview, 3 to 6 topics (each with Definition, Why, Example, Failure), interview questions, common mistakes, a quiz, diagrams. About 10 minutes of reading and 35 planned minutes per section (3 x reading + 5 for the quiz).

A recap built only from parts that already exist (overview, definition, why, questions, mistakes, plus the quiz as its own 5 minutes), leaving out examples, failure cases and diagrams:

| Subject | Sections | Words kept | Planned minutes per section: full / recap |
|---|---|---|---|
| Operating Systems | 11 | 54% | 36 / 22 |
| DBMS | 10 | 41% | 35 / 18 |
| Computer Networks | 10 | 62% | 30 / 21 |
| OOP in Java | 10 | 45% | 33 / 19 |
| System Design | 23 | 53% | 35 / 22 |

So no new writing is needed for version 1 of the recap, and no reseeding: the recap is a view of the existing sections.

### 2.2 The recap rule (version 1, from existing parts)
- Shown in the recap view: Overview; for each topic its Definition and Why; Interview questions; Common mistakes; Quiz.
- Hidden in the recap view (still one tap away): Example, Failure, diagrams. A "Show everything" link returns to the full page.
- Minutes: `recapMinutes = 3 x (words of the shown parts without the quiz) / 200 + 5`, computed by code from the same word counts as today (`server/src/modules/notes/notesStats.js`), so the numbers cannot drift from the text.
- The quiz is the same quiz, with the same pass rules and the same review ladder (a notes section still starts a review after 3 days).
- Version 2 (optional, after the owner reads the recap view on real sections): an authored `**Recap:**` line per topic in the Markdown, written from the section's own text, to replace the dropped examples where the recap reads too thin (OOP code examples are the likely case). It is a content job (64 sections), so it is a separate phase.

### 2.3 DSA: what already exists
- **From the basics** uses the DSA pattern lessons (a new notes subject, `dsa`, planned in `docs/plans/DSA_LESSONS_PLAN.md`: about 34 lessons of about 35 planned minutes each, 13 steps that are the `step` ids of the plan catalog). Each lesson links to its steps through the existing `roadmapSteps` and `sheetTopics` header fields. The plan places a step's lessons before the first problem of that step's topics, as ordinary notes items (quiz, review ladder and recap view work as for every other subject). About 20 hours in total for all 34 lessons, instead of the 375 hours of learning time that the roadmap steps list. The roadmap step stays as the "go deeper" link with its resources; its hours are not scheduled.
- **Quick revision** uses a rule, since the sheets have no "must-do" mark: per topic group, keep the non-Hard problems in sheet order up to 40% of the group (at least 2, never more than the group). Version 2: a curated `mustDo` flag per problem in the shared problem file planned in `docs/plans/DSA_PROBLEMS_PLAN.md`.
- **Standard** is today.

### 2.4 Deep dive: the advanced sections each subject needs

Today every section is a 10-minute read with 3 to 8 topics. That is right for revision, but follow-up questions in big-tech interviews go deeper. The deep-dive tier adds extra sections, flagged `tier: deep` in their header, that are planned only for students who choose Deep dive for that subject. A deep-dive section follows the same format and the same rules (primary sources read, own words, every number from a script, quiz, diagrams, claim rows in `docs/content/SOURCES.md`). The list below comes from a whole-word search of all notes on 15 Nov 2026: the number is how many note files mention the topic at all.

| Subject | Deep-dive section (working title) | Why it is asked | Mentions in the notes today |
|---|---|---|---|
| **Operating Systems** | The Linux scheduler in depth (CFS, real-time classes, priorities, load balancing across CPUs) | Follow-up to CPU scheduling | CFS in 2 files, one line each |
| | I/O in depth: page cache, buffered and direct I/O, mmap, zero-copy, select, poll, epoll | How servers handle many connections | page cache 0, epoll 0 |
| | Containers: namespaces and cgroups, and how they differ from virtual machines | Common "how does Docker work" question | cgroups 0; Docker 1 file |
| | Memory in depth: allocators, NUMA, huge pages, memory-mapped files | Performance and systems roles | NUMA 0 |
| | Concurrency in depth: lock-free structures, memory models and barriers, futexes | Follow-up to synchronization | one file, in passing |
| | File system reliability: journaling, copy-on-write file systems, log-structured designs | Follow-up to file systems | checkpoint and redo, one line each |
| **DBMS** | Crash recovery: write-ahead logging, checkpoints, ARIES (analysis, redo, undo) | "How does a database not lose committed data" | WAL 0, ARIES 0 |
| | MVCC and isolation inside real engines: PostgreSQL against InnoDB, snapshot isolation, gap and next-key locks | Follow-up to concurrency control | one file, short |
| | Storage engines: B-tree against LSM-tree, compaction, write amplification | Choosing a database | LSM in one System Design file |
| | Query execution and optimization in depth: statistics, cost models, join ordering, reading plans | Follow-up to EXPLAIN and joins | the base topics exist |
| | Distributed transactions: two-phase commit, sagas, the outbox pattern, change data capture | Microservice and data questions | 2PC 0, saga 0, outbox 0, CDC 0 |
| **Computer Networks** | TCP in depth: flow control, congestion control (Reno, CUBIC, BBR), retransmission, TIME_WAIT | The most asked deep networking topic | congestion control: one line; slow start in 1 file |
| | HTTP/2, HTTP/3 and QUIC in depth | Web performance questions | QUIC in 3 files, a few lines |
| | Routing in depth: OSPF, BGP, anycast and how traffic really crosses the internet | Follow-up to routing | BGP and OSPF in 1 file, a line each |
| | TLS 1.3, certificates and PKI, mutual TLS | Security questions | TLS basics exist |
| | Load balancing in depth: L4 against L7, health checks, connection draining, consistent hashing in practice | System design follow-up | the base section exists |
| **OOP in Java** | The Java memory model and concurrency (volatile, happens-before, locks, executors, CompletableFuture) | Java interviews | not covered as a section |
| | JVM internals: heap layout, garbage collectors, class loading | Java interviews | not covered as a section |
| | Collections in depth: how HashMap and ConcurrentHashMap work, the equals and hashCode contract | The most asked Java deep question | not covered as a section |
| | Design patterns in depth with trade-offs, linked to the low-level design notes | Design interviews | the base section exists |
| **System Design** | Distributed transactions and consistency in practice (two-phase commit, sagas, outbox, idempotency keys) | Almost every case study uses them | 2PC, saga, outbox 0; idempotency in 3 files |
| | Multi-region design: active-active, latency, failover, data residency | Senior-level follow-up | 0 |
| | Overload control: backpressure, load shedding, circuit breakers, bulkheads | Reliability questions | backpressure 0; reliability section exists |
| | Conflict resolution: CRDTs, vector clocks, last-write-wins and their costs | Key-value and collaboration systems | CRDT 0; vector clocks in 2 files |
| | Probabilistic data structures in depth: HyperLogLog, count-min sketch, Bloom filters | Counting and top-k problems | HyperLogLog 0; count-min and Bloom in 1 to 2 files |
| | Observability: metrics, logs, traces, SLOs and alerting | Senior-level follow-up | to be checked before writing |

That is 26 deep-dive sections (6 OS, 5 DBMS, 5 CN, 4 OOP, 6 System Design, with one of them to be checked first) in addition to the 64 sections that exist. Priority 1 (write first, they are asked most): crash recovery, TCP in depth, distributed transactions, MVCC in real engines, I/O and epoll, JVM and collections internals, overload control. Each section is about one working day of content work with the usual review, so the whole tier is about 5 to 6 weeks of content work and is its own plan when the owner starts it.

Also part of this tier, section by section: more interview questions. Each existing section has 3 to 5; a deep-dive level can add a "question bank" of 8 to 10 more per key section (follow-up and "what if" questions with short answers), reviewed the same way.

## 3. How the generator uses a level

Input: `levels` = `{ dsa: 'basics' | 'standard' | 'revision', os: 'full' | 'recap', dbms: ..., cn: ..., oops: ..., hld: ... }`; missing = Full / Standard.

0. **Deep dive.** A subject at Deep dive adds its `tier: deep` sections after the full sections of the same subject (the deep ones depend on the basic ones), as ordinary notes items. A subject with no deep sections published treats Deep dive as Full and the builder does not offer it.
1. **Notes items.** A recap section becomes one item: same `ref`, same title, `depth: 'recap'`, `plannedMinutes = recapMinutes`, and a link to the recap view. A full section is unchanged. The server computes the recap minutes where it already computes `readMinutes` (`planData.js`), so `data.notes[subject]` carries both numbers.
2. **DSA revision.** The trimmed list is made before the fair share (like known topics and solved problems), so the floors, the Hard-first trim and the budget work on the smaller set.
3. **DSA basics.** The lessons of each step are notes items of the `dsa` subject, placed before the first problem of that step's topics (the plan catalog already orders the steps). They form one group per step in the fair share, with the 3-section floor spread over the steps in order, and are trimmed from the end like any group. A step with no topics in the plan gets no lesson. Until the lessons of a step exist, that step has none (the level is offered only when at least the first wave of lessons is published).
4. **Pace** (D1) still multiplies DSA problem minutes only. It does not scale notes or learning blocks.
5. **Fair share and floors** stay: 1 problem per topic group, 3 sections per subject (recap sections count the same), Hard problems trimmed first.
6. **Coverage list** (`byGroup`) names the level: "Operating Systems (recap): 8 of 11 sections".
7. **Rebuilds, hours, lighter days and pace changes** read the stored levels, so they keep them. A new `levels` change goes through the same preview, checksum and consent as the others.

## 4. Data, API and links

- **Model** (`plan.model.js`): `levels: { type: Mixed, default: {} }` with a validator for the allowed keys and values. Plans without it read as Full and Standard.
- **Validators** (`plan.validators.js`): `levels` on the form (optional object of the allowed keys/values), change type `levels` with its `levels` payload; a `levels` field on any other change type is refused (same rule as pace).
- **Controller** (`plan.controller.js`): `toInput`, `toStored`, `presentPlan`, create, `changeFrom`, apply (`$set` levels), public preview.
- **Adjust** (`planAdjust.js`): `previewChange` handles `levels` and keeps `stored.input.levels` otherwise.
- **Builder link** (`planBuilder.js`): `levels=dsa:revision,os:recap` in the address; unknown keys or values stay in the address so the form can explain them, as for other fields.
- **Notes API** (`notes.controller.js`): each section also returns `recapMinutes` (already has `readMinutes`).

## 5. Client work

| Where | Change |
|---|---|
| `PlanBuilderForm.jsx`, `planBuilder.js` | A "How deep?" group: a select per chosen subject and one for DSA; plain labels from section 1; in the address and in the request |
| `PlanPreview.jsx`, `PlanCoverage.jsx` | One line on what the levels changed; the coverage list shows "(recap)" |
| `StudySchedule.jsx`, `StudyDialogs.jsx`, `MyPlanStudy.jsx` | A line with the levels and a "Change depth" button; the dialog with a select per subject, preview and confirm |
| `pages/csNotes/NotesDetail.jsx` and the notes components | `?view=recap`: show only the recap parts (section 2.2), a "Show everything" link, a short banner "Recap view: about N minutes"; the quiz is always shown |
| `utils/reportLinks.js`, plan task links | A recap task links to `/notes/<subject>/<id>?view=recap` |
| Study task screen (`StudyStart.jsx`) | The notes quiz works as today for recap sections |

## 6. Phases, order and size

| # | Phase | What is done when it is finished | Size |
|---|---|---|---|
| 0 | Owner decisions (section 9) | Answers recorded in this file | 0.5 day |
| 1 | Server: recap minutes and the notes level | `recapMinutes` in `notesStats.js` and `planData.js`; the generator uses `levels` for CS subjects; tests with made-up and real data | 2 days |
| 2 | Server: DSA levels | Quick revision filter; basics learning blocks from the DSA roadmap; both inside the fair share | 3 days |
| 3 | Server: model, validators, controller, adjust, public preview | `levels` stored, previewed, changed with consent, kept by every other change | 1.5 days |
| 4 | Client: builder, preview, Plan tab, change dialog | The student can choose, see the effect and change it later | 2 days |
| 5 | Client: recap view on the notes page and the task links | A recap task opens the recap view; "Show everything" works; mobile checked | 1.5 days |
| 5b | Server and client: the `tier: deep` header field, the loader, the validator, the notes page ("Deep dive" badge), and the `deep` level in the generator | Deep-dive sections can be added one at a time with no other code change | 1.5 days |
| 6 | Tests across all of it | Section 7 | 2 days |
| 7 | Docs and close-out | README, TESTING, PROJECT_STATUS, HANDOFF, `MY_PLAN_PLAN.md` decisions; owner's `git add` and commit commands | 0.5 day |
| 8 (content) | DSA pattern lessons: its own plan, `docs/plans/DSA_LESSONS_PLAN.md` (about 34 lessons) | The "From the basics" level for DSA depends on the first wave | see that plan |
| 9 (content) | The 26 deep-dive sections of section 2.4, and the question banks | Each reviewed like every other section; priority 1 first | about 5 to 6 weeks |
| 10 (content) | Authored `**Recap:**` lines and curated `mustDo` problems | Content jobs; each reviewed by the owner | not sized |

About 13 to 15 working days for the code phases (0 to 7, with 5b). The content phases (8 to 10) run on their own plans and each level appears in the builder as soon as its content exists. Phases 1 and 5 can run side by side with 2.

## 7. Tests

- **Generator unit tests** (`plan-coverage.test.js` style, small made-up data): recap minutes; Full unchanged; revision keeps non-Hard first, 40%, minimum 2; basics adds one block per step before its first topic and none for steps with no topics; floors and the fair share with recap and basics items; known topics and solved problems with levels; pace does not touch notes or learning blocks; deterministic; rebuild keeps the level.
- **Real-data checks**: the minutes in section 2.1 come from a script, not from typing: add a test that recomputes the table from the notes and compares.
- **Scenario runner**: add `levels` to `test/helpers/plan-scenarios.js` (every subject and DSA level at random) so the 800-scenario test and `node scripts/plan-fuzz.js 3000` cover them; new rules: a recap section never plans more minutes than the full one; a level never loses a chosen subject's floor; the byGroup totals still add up.
- **API tests** (`plan-api.test.js`): create with levels; refuse unknown subjects or values; preview and apply a `levels` change; the checksum belongs to its change; another user cannot touch the plan; the other change types keep the levels; the public preview accepts levels and leaks no problem names.
- **Client tests**: builder link round trip with levels; label and validation; the recap view shows exactly the recap parts and hides the others; the Today screen text is unchanged.
- **Browser specs**: choose Quick recap in the builder and see the minutes change; save; change depth with a preview; open a recap task and see the recap view, then "Show everything"; phone width (375 px) for the builder group, the dialog and the notes recap view.
- **Mutation checks** on the recap rules, the 40% rule, the basics placement, and the wiring of `levels` through create, preview, apply and rebuild; each must make a test fail.

## 8. Risks and how they are handled

- **A recap without examples can read thin** (OOP code examples above all). The recap view always has "Show everything"; version 2 adds authored recap lines where needed; the owner reads the recap view of one section per subject before phase 5 is called done.
- **Learning blocks are long** (for example 20 to 30 hours per DSA step). They are split over days like any long item and sit inside the fair share, so short plans trim the later steps. The preview shows the effect before the student saves.
- **The quick revision rule is only a rule** until `mustDo` flags exist; the label says "the main problems of each topic" and the coverage list names what is left out.
- **Changing the minutes of a section after a plan exists**: a plan stores its item minutes, and only a rebuild or a levels change re-plans, so saved plans never shift by themselves.
- **Cost of generation**: one more pass over the items; the measured cost today is 0.05 to 0.1 s per plan and up to about 0.4 s for the largest case; the levels must not add more than 10% (a test checks this on the largest case).

## 9. Decisions for the owner (recommended answers first)

1. Names of the levels in the UI: "Full sections / Quick recap" and "From the basics / Standard / Quick revision"? **Recommended: yes.**
2. Recap parts: overview, definitions, why, questions, mistakes and the quiz, without examples, failure cases and diagrams? **Recommended: yes for version 1; add authored recap lines later where it reads thin.**
3. Quick revision: 40% of each group, at least 2 problems, non-Hard first? **Recommended: yes until curated `mustDo` flags exist.**
4. Basics for DSA: use the DSA roadmap step learning time (midpoint) as the learning block? **Recommended: yes.**
5. Defaults stay Full and Standard, so nothing changes for anyone who does not choose? **Recommended: yes.**
6. Apply levels to System Design (HLD) too? **Recommended: yes; it is a chosen subject like the others.**
7. Should a recap section still count as a normal notes section for the review ladder and the quiz pass rule? **Recommended: yes, identical.**
8. Deep dive as a third CS level, with the deep sections flagged `tier: deep` in their header and planned only at that level? **Recommended: yes.**
9. The 26 deep-dive sections of section 2.4 as the starting list, priority 1 first? **Recommended: yes; the owner can add or drop sections before the content plan starts.**
10. DSA "From the basics" built on the pattern lessons (not on the roadmap's learning hours)? The lessons are optional (owner, 16 Nov 2026): without them the level is simply not offered, and quick revision and standard still work. **Recommended: yes; the level is offered once the first wave of lessons is published.**

## 10. What we are not doing

- No content is written inside phases 0 to 7 of this plan. The DSA lessons and the deep-dive sections are content jobs with their own plans; the code reads them as they appear. No videos and no "from zero" programming course.
- No AI choosing levels for the student, and no AI in the scheduler.
- No per-topic custom depth (only per subject, and one for DSA).
- No change to the Today screen, the review ladder, mocks, behavioral questions, pause, resume, sprints or the study calendar.
- No timer, no coins, no paywall.
- No change to roadmap ("role") plans in this work.
- No reseeding of the notes: the recap is a view of the existing sections.
