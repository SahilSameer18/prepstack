# Plan: Operating Systems and OOP notes, in four phases (12 Nov 2026, updated the same day)

**Status: Phases 1, 2 and 3 done 12 Nov 2026. 11 OS drafts and 10 OOP drafts (Java 27, every example compiled and run) are in `server/src/data/notes/os/drafts/` and `oops/drafts/`, reviewed by accuracy and plain-words reviewers and corrected by editors (records: `docs/content/source-notes/os-drafts.md` and `oops-drafts.md`; numbers: `docs/content/checks/os-check.py`; Java runs: `docs/content/checks/oops/`). Not published. Phase 4 (the full checker run, the claims table, link fit, publish wiring, tests, browser check, then the owner commits and runs the seed) has not started; OS is published first.** Phase 1 was done the same day (see `docs/content/source-notes/os-oops-phase1.md`). Plan approved by the owner on 12 Nov 2026. The owner accepted the OOP language (Java) and the section lists. Later the same day the owner added a research list with corrections, then a second, longer research audit; both are built in below. After the second audit the owner approved four changes: **11 OS sections, 10 OOP sections, four study aids instead of fifteen, and an audit of the existing notes in Phase 1**. Open: the owner's own PDFs and an outside reader.
Method: the one that produced the DBMS and Networks notes (`docs/content/NOTES_TEMPLATE.md`, `REVIEW_CHECKLIST.md`, `SOURCES.md`). Owner's rules: interview-first, easy words a non-technical person can follow (keep the technical term, add its plain meaning, never lose meaning), nothing copied, every claim sourced, every number computed, publish only on the owner's word.

## Where the notes stand today (measured 12 Nov 2026)
| Subject | Sections | Words | State |
|---|---|---|---|
| Operating Systems | 9 (`os-introduction`, `os-processes-threads`, `os-cpu-scheduling`, `os-synchronization`, `os-deadlocks`, `os-memory-management`, `os-disk-scheduling`, `os-system-concepts`, `os-interview-boost`) | about 2,900 | Old JS text. No quizzes, diagrams or sources. `os-interview-boost` has 15 words. Memory management has 370 words for paging, segmentation and virtual memory together |
| OOP | 9 (`oops-basics`, `oops-pillars`, `oops-polymorphism`, `oops-constructors-destructors`, `oops-virtual-functions`, `oops-relationships`, `oops-advanced-concepts`, `oops-solid-principles`, `oops-interview-boost`) | about 700 | Two sections have about 265 words; the other seven have 15 to 35 words, practically empty. The names point at C++ |

The skill catalog points at 10 of these section ids, so a changed id must be remapped there (the tests catch a missing id).

## Where the content comes from
**Rule:** a *fact* may rest only on a Tier 1 source. Tier 2 sources give topic lists, question lists and mistakes to check, never facts. Every source is read, restated in our own words, cited by page or chapter in `SOURCES.md`, and nothing is copied. Free pages are read with the web-fetch agent; PDFs and PPTX files are saved and read locally (`pdf-parse`, and unzip for PPTX, as done for the Kurose slides). Anything we cannot read is listed as "not read" and used for no claim. Videos cannot be read by our tools, so a video is never a source.

Status tags: **verified 12 Nov** = we fetched and read it today. **reported** = it comes from the owner's research list and still has to be checked in Phase 1 before any fact rests on it.

### Tier 1: primary sources for facts
**Operating Systems**
| Source | What we take from it | Status and limits |
|---|---|---|
| *Operating Systems: Three Easy Pieces* (OSTEP), pages.cs.wisc.edu/~remzi/OSTEP/ | Main textbook, in simple dialogue style: processes and the process API, direct execution, CPU scheduling (FIFO, SJF, MLFQ, lottery, multi-CPU), address spaces, address translation, segmentation, free space, paging, TLBs, advanced page tables, swapping, locks, condition variables, semaphores, concurrency bugs, I/O devices, disks, RAID, files and directories, file system implementation, journaling | **Verified 12 Nov:** version 1.10 (Nov 2023); each chapter is a free PDF ("is and will always be free in PDF form"); no licence line, so restate only. Chapter list below. The page count (717 pages) is **reported**, not stated on the page. The preface PDF could not be read by the fetch tool (compressed); it is read locally |
| *Operating System Concepts* slides, os-book.com (10th edition, 9th as backup) | The standard algorithms and their usual worked cases: FCFS, SJF, round robin, priority, Banker's algorithm, page replacement, disk scheduling; topic order | **Verified 12 Nov:** PowerPoint (.pptx) files, copyright Silberschatz, Galvin and Gagne 2018. Use is authorised "for personal use, and for use in conjunction with a course" using the book; modification needs acknowledgement. So: read and restate for study, never repost or copy a slide or figure. The slides are short and assume the book; full worked examples come from OSTEP or are computed by our own script |
| Linux man pages, man7.org | What real Linux and POSIX do, labelled as Linux or POSIX in the notes | **Verified 12 Nov:** `fork(2)` (man-pages 6.19) says parent and child run in separate memory spaces, that Linux implements `fork()` with copy-on-write pages, and that the cost is duplicating page tables and creating a task structure. `pthreads(7)` covers POSIX threads and LinuxThreads vs NPTL. No licence line in the fetched text |
| Linux kernel documentation (docs.kernel.org, kernel.org/doc) | Confirm how a real system behaves. Hard to read; not used to learn a topic | **Verified 12 Nov:** the CFS design page says "CFS is making room for EEVDF"; the EEVDF page says the kernel "began transitioning to EEVDF in version 6.6 (as a new option in 2024)". **No page we read says which scheduler is the default for normal tasks today.** So the notes never write "Linux uses CFS"; they write "Linux began moving from CFS to EEVDF in 6.6" and name the scheduler classes only as the pages do. The memory page says page size is "architecture specific" and gives no x86-64 figure, so a "4 KB page" claim needs another source (for example `getpagesize(2)`) before it is stated for Linux |
| Wikipedia | Definitions of named algorithms (Banker's, LRU, Belady's anomaly, round robin, Peterson's) and where to find better references | CC BY-SA; nothing copied. **Each definition is checked against OSTEP or the os-book slides before use** (owner's correction). The second research says not to use Wikipedia to verify definitions at all; our rule already is that Wikipedia verifies nothing, it only names the thing to look up |
| Berkeley CS162 | Was planned as a second opinion on depth | **Verified 12 Nov: not readable.** The semester pages (fa23, sp22) and the archive redirect to a Berkeley login. Dropped as a source unless a public copy is found; its project work (Pintos) is far beyond placement level anyway |

**OOP (Java is the example language; decided 12 Nov)**
| Source | What we take from it | Status and limits |
|---|---|---|
| dev.java/learn (current Oracle tutorials) | **First choice** for classes, objects, interfaces, packages, inheritance, generics, lambdas, records and sealed classes | **Reported**; page list is checked in Phase 1 |
| Oracle Java Tutorials, "Object-Oriented Programming Concepts" lesson only | The plain explanation of object, class, inheritance, interface and package using real-world objects | The tutorials say they were written for JDK 8 and point to dev.java, so the notes use them only for these concept pages (owner's correction; to be checked in Phase 1) |
| Java Language Specification (JLS) | Final word on exact rules. Chapter 8 (classes, constructors, abstract classes, enums, records) and chapter 17 (threads and locks: every object has a monitor; Java neither prevents nor requires deadlock detection; `wait` belongs in a loop because of spurious wake-ups) | **Reported.** The research lists cited editions SE 21 to SE 25 (the second one says "SE 25 is the current one"); an earlier audit found SE 27, and the Java compiler on this computer is version 27. Phase 1 reads the newest edition and cites that |
| C++ Core Guidelines (isocpp.github.io) and cppreference.com | C++ differences only: constructors and destructors, `virtual`, multiple inheritance, rule of three, five and zero. For example, the rule that a base class destructor should be public and virtual, or protected and non-virtual | **Reported.** Skipped unless a C++ difference is needed; no C++ compiler on this computer, so C++ lines are marked "read, not run" |
| Robert Martin's SOLID articles (butunclebob.com) | The exact meaning of each of the five principles | **Reported.** Martin's originals may only exist as archived copies, so a link may be dead; Phase 1 checks it. The research list notes that Wikipedia credits Michael Feathers with the acronym SOLID for principles named by Robert C. Martin; Phase 1 checks that wording on the Wikipedia page |
| *Design Patterns* (Gamma, Helm, Johnson, Vlissides, "Gang of Four") | The source of the patterns (not Robert Martin). Pattern names and intent | A book we cannot read. Patterns are described from Wikipedia and Java standard-library examples; no claim rests on the book alone (owner's correction) |
| Refactoring.Guru, refactoring.guru/design-patterns/java (**adopted 12 Nov, the owner left the choice to me**) | Readable explainer for pattern intent, problem, solution and when to use; 22 patterns in its Java catalog (not 23) | Checked 12 Nov. Copyright: link the page, cite text only in small parts, no diagram and no code sample copied (Content Usage Policy). Facts checked against Wikipedia and a Java library example |
| Wikipedia | Definitions of the principles and patterns | CC BY-SA; nothing copied; each definition checked against a primary source |

### Tier 2: study aids (topic lists, question lists, mistakes only; never a source of facts)
| Aid | Use |
|---|---|
| GitHub, **four aids only (owner approved 12 Nov):** `Krishnagangwal/CS-Fundamentals` (OS and Java OOP topic lists), `Snailclimb/JavaGuide` (Java concurrency, collections, JVM; English version), `ashishps1/awesome-low-level-design` (LLD problems and patterns with Java), and the OOPJ-Interview-Guide repository (Java OOP questions) | **Reported.** Phase 1 checks that each exists, its licence and what it really contains. The research shows a different repository (`JayrajSinh16/CS-Fundamentals-Interview`) beside the Krishnagangwal link, so Phase 1 first finds which one holds the OS and OOP files. That repository is said to hold textbook PDFs from other authors: we look at the topic list only and download or copy nothing. Star counts and scores in the research are not used. Used to cover topics and to collect interview questions, whose answers are then checked against Tier 1 |
| Not used (dropped from the longer list of about fifteen) | `Devinterview-io/java-interview-questions`, `epigone707/CSInterview`, `kunal-kushwaha/DSA-Bootcamp-Java` and the other OS note repositories named in the second research. They repeat the same topics; if Phase 1 finds a topic gap that none of the four fills, one of them can be looked at for that topic only |
| Interview pages: GeeksforGeeks, InterviewBit | Count which topics are asked and collect the standard questions. Their answers are checked against Tier 1 (the audit already found one mistake: "independent and cooperative process" listed as types of synchronization) |
| Videos: Gate Smashers OS, Kunal Kushwaha Java OOP, Neso Academy and Jenny's Lectures | For the owner to learn from or compare topic order. Not readable by our tools, so never cited |
| Books: *Java Concurrency in Practice* (Goetz), *Effective Java* (Bloch) | Named as the books that concurrency and Java rules usually point to. Not readable by us, so no claim rests on them |

### Which source feeds which section
| OS section | OSTEP chapters (verified list) | os-book chapters | Also |
|---|---|---|---|
| 1 Introduction and system calls | Intro chapters | 1 Introduction, 2 OS Services | `syscalls(2)`-style man pages |
| 2 Processes | 4 Processes, 5 Process API, 6 Direct Execution | 3 Processes | `fork(2)`; states, control block, context switch, orphan and zombie processes |
| 3 Threads and multithreading | 26 Concurrency and Threads, 27 Thread API | 4 Threads and Concurrency | `pthreads(7)`; thread vs process, user-level vs kernel-level threads, thread pools, thread safety |
| 4 Inter-process communication | (process API chapters) | 3 Processes (IPC part) | `pipe(7)` and similar man pages, to be read |
| 5 CPU scheduling | 7 CPU Scheduling, 8 Multi-level Feedback, 9 Lottery, 10 Multi-CPU | 5 CPU Scheduling | kernel scheduler pages (CFS to EEVDF caveat) |
| 6 Synchronization | 28 Locks, 29 Locked Data Structures, 30 Condition Variables, 31 Semaphores | 6, 7 | `pthreads(7)`; Java side in JLS chapter 17; semaphore with a producer-consumer example |
| 7 Deadlocks | 32 Concurrency Bugs | 8 Deadlocks | deadlock vs starvation vs livelock comparison |
| 8 Memory management | 13 Address Spaces, 14 Memory API, 15 Address Translation, 16 Segmentation, 17 Free Space, 18 Paging, 19 TLBs, 20 Advanced Page Tables | 9 Main Memory | kernel memory page (page size is architecture specific); paging together with the TLB |
| 9 Virtual memory and page replacement | 21 Swapping Mechanisms, 22 Swapping Policies, 23 Complete VM Systems | 10 Virtual Memory | page faults and thrashing |
| 10 File systems and disk scheduling | 36 I/O Devices, 37 Hard Disk Drives, 38 RAID, 39 Files and Directories, 40 File System Implementation, 42 Journaling | 11 to 15 | I/O devices kept short here |
| 11 Linux basics, security, virtualization and interview questions | | 16 Security, 17 Protection, 18 Virtual Machines, 20 The Linux System (chapter numbers checked in Phase 1) | man pages; interview pages (Tier 2). Security and virtualization stay short |

OOP sections draw on dev.java, the Oracle concept pages and the JLS for Java rules, Wikipedia and Java standard-library examples for patterns, and the C++ guidelines only for the "in C++" lines.

## How each section is written (owner's five steps, added 12 Nov)
1. Learn the topic from OSTEP, dev.java (or a video the owner likes).
2. Write the definition in our own simple words, with one everyday analogy.
3. Check every exact fact against a Tier 1 source (OSTEP, the os-book slides, man pages, JLS).
4. Add the standard interview questions from the Tier 2 pages and check each answer against Tier 1; keep any wrong answer as a "mistake" item.
5. Mark anything Linux-specific, POSIX-specific or Java-specific as such, so it is never presented as general operating-system theory.

## The four phases

### Phase 1: sources, verification and section lists (about 2 to 3 days)
1. **Check the "reported" items** with the web-fetch agent: dev.java page list, the Oracle concept lesson list and its JDK 8 notice, the newest JLS edition and the chapter 17 wording, Martin's SOLID article (alive or archived), the Wikipedia SOLID wording, the C++ Core Guidelines destructor rule, and the six GitHub repos (exist, licence, contents). Record each result as verified or not.
2. **Read the main sources:** the OSTEP chapters above (save the PDFs, read locally), the os-book OS10 slides for chapters 3 to 15 (unzip the PPTX, read the text), the man pages, the kernel scheduler pages, dev.java and the Oracle concept pages. Record what was read, what was only partly read and the licence line in `docs/content/source-notes/os-batch-a.md`, `os-batch-b.md` and `oops-batch-a.md` (same format as the Networks notes). Page size, default scheduler and similar facts get their own line with the source.
3. **Count the topics interviews ask** from the Tier 2 pages (and the owner's PDFs if any), and list the mistakes found in them.
4. **Audit the existing notes** (owner approved 12 Nov): compare today's OS and OOP sections with the topic lists, and write a gap list of missing topics and wrong statements (the audit already found one wrong item: "independent and cooperative process" listed as types of synchronization). The list tells each draft what to add and what to correct.
5. **Confirm the section lists** below, with any change proposed in easy words; the owner approves any change before drafting.
**Output:** source notes, a verification table, the gap list, the confirmed lists. **Gate:** the owner approves.

OS sections (approved, 11, changed from 10 on 12 Nov after the second research): introduction and system calls; processes; threads and multithreading; inter-process communication; CPU scheduling; synchronization; deadlocks; memory management (paging, segmentation and the TLB); virtual memory and page replacement (page faults, thrashing); file systems and disk scheduling; Linux basics, security, virtualization and interview questions (security and virtualization short). Old ids kept where the topic survives (`os-processes-threads` becomes the processes section and the threads section gets a new id, `os-cpu-scheduling`, `os-synchronization`, `os-deadlocks`, `os-memory-management`; `os-system-concepts` becomes the introduction or is merged). Remapping the skill catalog is part of Phase 4.
OOP sections (approved, 10, changed from 9 on 12 Nov): classes, objects and encapsulation; inheritance; polymorphism (compile time and run time, dynamic method dispatch); abstraction, abstract classes and interfaces (including default methods); constructors, destructors and object lifetime (constructor chaining, initialization order); relationships (association, aggregation, composition, and composition over inheritance); **Java keywords and object behaviour** (new: `static`, `final`, `equals()` and `hashCode()`, pass-by-value, immutability, records and enums); SOLID principles; design patterns used in interviews and design problems (singleton, factory, observer, strategy, builder, plus decorator, state and adapter from the owner's cheat sheet: 8 topics, the template maximum; no claim that they are "the most asked", because no source states it); interview questions and common mistakes. Old ids kept for `oops-basics`, `oops-pillars`, `oops-polymorphism`, `oops-solid-principles`. The JVM, garbage collection, collections and Java concurrency stay outside this set as later separate modules (the research suggests the same); only the OOP-related parts are touched here.

**Note layout:** the second research proposes a 12-part layout (definition, why, how it works inside, analogy, diagram, example, comparison table, interview questions, mistakes, quick revision, sources, 5-question check). We keep our validator-enforced template. "How it works inside" goes into the Why and Example fields, comparisons go into the Mistakes and the diagrams, and tables and a quick-revision list are not added now because the page does not render them.

### Phase 2: Operating Systems drafts (about 4 days)
1. Each section is a Markdown draft in `server/src/data/notes/os/drafts/`, in the full template (overview 60 to 120 words, 4 to 8 topics with definition, why, example and failure, 3 to 5 questions, 2 to 3 mistakes, exactly 5 quiz questions, 1 to 3 diagrams). Easy words with the technical term kept and a plain meaning beside it.
2. **Every number is computed by a script** (Python is available): scheduling charts and average waiting times for FCFS, SJF, round robin and priority; page-fault counts for FIFO, LRU and optimal on a reference string, plus a Belady's anomaly example; Banker's algorithm safe sequences; effective access time with a TLB; disk-head movement for FCFS, SSTF, SCAN and C-SCAN; address splits for paging. Quiz answers come from the same scripts.
3. Real behaviour is checked against man pages and kernel docs and written "in Linux" (for example the `fork` copy-on-write cost), with the scheduler caveat above.
4. Claims rows in `SOURCES.md` for every disputable claim.
**Output:** 11 OS drafts, scripts, claims rows.

### Phase 3: OOP drafts (about 3 days)
1. Same template and easy-words rule, in `server/src/data/notes/oops/drafts/`.
2. **Code examples are run:** Java examples are compiled and run with the Java compiler on this computer (Java 27) and the note shows the real output. C++ lines come from the C++ guidelines and cppreference and are marked "read, not run".
3. Patterns are described from Wikipedia and the Java standard library, not copied from the Gang of Four book; SOLID from Martin's articles (or their archived copy) and Wikipedia.
4. Claims rows in `SOURCES.md`.
**Output:** 10 OOP drafts, runnable examples, claims rows.

### Phase 4: review, publish and wire up (about 2 to 3 days)
1. **Two read-only AI reviewers per subject** compare every draft with the source notes: wrong or missing conditions, numbers, code output, wording a non-technical person could not follow. A third check compares the plain-words edits with the originals so no meaning is lost (the DBMS and Networks method). Apply the fixes.
2. Publish on the owner's word: add `lastChecked`, move drafts up, make `os.js` and `oops.js` Markdown loaders (like `dbms.js`), delete the old sections.
3. **Must-cover check** (from the second research): before publishing, confirm each of these is in a draft with a source: Java is pass-by-value; `equals()` and `hashCode()` and how HashMap uses them; dynamic method dispatch; constructor chaining and initialization order; composition over inheritance; deadlock vs starvation vs livelock in one comparison; a semaphore with a producer-consumer example; paging together with the TLB; page faults and thrashing; orphan and zombie processes; file systems and I/O not skipped.
4. Update `skillCatalog.json` (the OS and OOP ids, now 11 and 10), `content-ids.test.js` (counts), `notes-markdown.test.js` for OS and OOP, `README.md`, `TESTING.md`, `IMPROVEMENT_PLAN.md`.
5. Full server and client suites, the build, `npm run check:links`, and a browser check of one OS and one OOP page on an isolated stack (never ports 3000 or 5173).
6. The owner commits and runs `npm run seed:notes`.
**Output:** published OS and OOP notes, updated tests and docs, commit commands.

## Time and order
About 12 to 14 working days (one day more than before: the extra OS and OOP sections and the audit): 3 + 4.5 + 3.5 + 2 to 3. OS first (asked more in interviews), OOP second. After Phase 1 I re-estimate, as happened with DBMS and Networks. The writing, not the code, is what runs over.

## What will not be perfect (said up front)
- No outside reader has read the DBMS, Networks, roadmaps, behavioral or these notes, unless the owner finds one. The notes say "checked by the author and two AI reviewers", not "reviewed by a second person".
- Books we cannot read (Silberschatz, Design Patterns, Effective Java, Java Concurrency in Practice) are used for no claim; videos are never cited.
- The slides we read are copyrighted: they are studied and restated, never copied or reposted.
- C++ claims cannot be run here.
- Real operating systems differ from textbooks; the notes say "in Linux" or "in POSIX" where the difference matters, and do not claim a default scheduler or a page size that no source we read states.
- A claim on this list marked "reported" is not used until Phase 1 has verified it.

## Decisions
**Decided by the owner on 12 Nov 2026**
1. **OOP language: Java** for all examples, with a short "in C++" line only where C++ really differs. Java is run here, so every example is checked; C++ lines are "read, not run".
2. **Section lists: OS 11 and OOP 10** (first approved as 10 and 9; changed on 12 Nov after the second research), keeping old ids where the topic survives. Phase 1 may propose changes; the owner approves them before drafting.
3a. **Second research (12 Nov), owner approved four changes:** threads and multithreading as their own OS section plus a short security and virtualization part; a new OOP section "Java keywords and object behaviour"; four GitHub study aids instead of fifteen; an audit of the existing notes in Phase 1.
3. **Source rules from the owner's research (12 Nov):** dev.java first and the Oracle tutorial only for its OOP concept pages; no claim that Linux "uses CFS" without the EEVDF caveat; patterns come from the Gang of Four book (read through Wikipedia and the Java library), not from Robert Martin; Wikipedia only for definitions, each checked against a textbook; Tier 2 aids give topics and mistakes, never facts; the five-step writing workflow above.

**Decided 12 Nov after the Phase 1 audit (the owner said "do what is good" and delegated the choice; recommended and recorded here)**
6. **Refactoring.Guru is a source for the patterns section**, restated in our words and cited by page; no diagram or code sample copied; our Java examples are written and run by us.
7. **The patterns section has 8 topics:** singleton, factory, observer, strategy, builder, decorator, state, adapter.
8. **Owner's goal (12 Nov): the owner starts MAANG SDE preparation next month (December 2026) and is building PrepStack for their own use too.** So the order of work is by usefulness for that preparation: OS first, then OOP, each subject published as soon as it passes review rather than waiting for both. Depth beyond the textbook level (for example Java concurrency, memory model, JVM) is not added to these sections; it is listed as later modules. The owner's system-design notes (HLD and LLD problems) are kept for Stage 6.

9. **LLD notes (12 Nov, agreed with the owner):** a separate notes subject (one section per classic design problem, Java code run), built after the HLD / system design notes, not as part of this plan.

**Still open**
4. **The owner's own PDFs: received and read on 12 Nov** ("Operating System Notes.pdf", 12 pages; "Object Oriented Programming (1) (1).pdf", 16 pages, written in C++). Topics and mistakes are in `docs/content/source-notes/os-oops-phase1.md`; they are not a source of facts. Done.
5. **Outside reader.** None yet. Someone who knows OS or OOP, even for one section, is worth more than any extra check I can run.
