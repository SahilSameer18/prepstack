---
id: os-virtual-memory
title: Virtual Memory and Page Replacement
lastChecked: 2026-11-12
next: os-file-systems-disk
roadmapSteps: backend:os-networking-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and os-drafts.md. Numbers computed by docs/content/checks/os-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

Virtual memory means the memory a program thinks it has is not the same as the real memory (RAM, the computer's fast working memory) in the machine. Only the pages (equal-sized program pieces) in use stay in RAM; the rest stay on disk. Interviewers ask about page faults (using a page that is not in RAM), page replacement (choosing which page to remove), Belady's anomaly (more memory making things worse) and thrashing (spending all the time moving pages).

After this section you can explain demand paging, walk through a page fault, count faults for FIFO, LRU and optimal, and explain Belady's anomaly and thrashing. Example numbers are made up unless a source is named.

## Topic: Virtual memory and demand paging

**Definition:** Virtual memory means a program's address space (the addresses it can use) can be larger than RAM, because only part of the program needs to be in RAM. Demand paging means a page is brought into RAM only when the program needs it. A page that is not in RAM stays on disk, in swap space (a disk area kept for this) or, for program code, in the program file.

**Why:** Programs rarely use all their code at once, so loading everything wastes memory and time. Loading less lets more programs run together and start faster.

**Example:** A program has 100 pages but a run touches only 12 of them. With demand paging only those 12 are read from disk. With "load everything first" all 100 are read.

**Failure:** Confusing demand paging with swapping. Swapping moves a whole process out of memory and back. Demand paging moves single pages, and only when they are needed. "Unused memory is moved to disk" describes swapping.

## Topic: Valid bit, page fault steps and their cost

**Definition:** Each page-table entry (the record for one page) has a valid-invalid bit, a flag saying whether the page is in RAM. Valid means it is in RAM. Invalid means it is not there, or it is not part of the program's space at all. A page fault is the trap (a jump into the operating system, the OS) caused by using an invalid entry. Steps:
1. The trap enters the OS.
2. The OS checks its own record of which addresses the program may use. If the address is not legal, the program is stopped.
3. If it is legal but not in RAM, the OS finds a free frame (a slot in RAM that holds one page).
4. It schedules a disk read into that frame.
5. It updates the tables and sets the bit to valid.
6. It restarts the instruction that failed.

**Why:** The program does not know any of this happened; it only sees that one instruction took long.

**Example:** The program reads an address in page 7, which is marked invalid. The OS sees page 7 is legal and on disk, reads it into a free frame, marks page 7 valid, and the same read instruction runs again and now works. Cost: effective access time (EAT, the average time per access) is (1 - p) x memory time + p x fault time, where p is the share of accesses that fault. Memory access 200 ns, fault service 8 ms (8,000,000 ns), one fault in 1,000 accesses: 0.999 x 200 + 0.001 x 8,000,000 = 199.8 + 8,000 = 8,199.8 ns, about 41 times slower than 200 ns (the course slides round this to 40).

**Failure:** Saying a page fault is an error. Often it is a normal event the OS handles; only an illegal address ends the program.

## Topic: Copy-on-write

**Definition:** Copy-on-write (COW) means two processes share the same pages after a copy is requested, and a page is copied only when one of them writes to it. The OS maps the shared pages read-only. A write traps, and the OS then makes a private copy for the writer.

**Why:** In UNIX, `fork()` makes a child process that starts as a copy of the parent. Copying the whole address space is slow, and often the child immediately calls `exec()` (which replaces its program), so the copy would be thrown away. COW avoids that waste.

**Example:** A parent has 1,000 pages. After `fork()` the child shares all 1,000 and nothing is copied. If the child writes to one page, only that page is copied, so 1 page is copied instead of 1,000. If the child calls `exec()` at once, almost nothing is copied.

**Failure:** Thinking `fork()` always copies memory at once. The course slides also describe `vfork()`, where the parent pauses while the child uses the parent's space, meant for a child that will call `exec()`.

## Topic: FIFO, LRU and optimal replacement

**Definition:** When RAM is full and a new page must come in, a page-replacement algorithm picks a victim (the page to remove). FIFO (first in, first out) removes the page that has been in RAM longest. LRU (least recently used) removes the page not used for the longest time. Optimal (OPT) removes the page that will not be used for the longest time in the future. OPT cannot be built, because it needs the future, so it is only a standard to compare against.

**Why:** The goal is the fewest faults.

**Example:** Reference string (the list of page numbers the program uses, in order) 7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1, with 3 frames. FIFO: 7, 0, 1 fault and fill the frames. 2 faults and removes 7. 0 is a hit (already in RAM). 3 faults and removes 0. Then 0 is needed at once and faults again: FIFO removed a page the program was about to use. Total faults over 20 references: FIFO 15, LRU 12, OPT 9. (The slides' string has two more references and gives the same 15, 12, 9.)

**Failure:** Saying LRU is optimal. It is better than FIFO here, but OPT beats it. LRU needs extra work on every access to track use.

## Topic: Belady's anomaly

**Definition:** Belady's anomaly is when giving a process more frames makes FIFO produce more faults, not fewer.

**Why:** FIFO ignores how recently a page was used. LRU and OPT are stack algorithms: with N + 1 frames they always hold everything they hold with N frames, so their faults never rise when frames are added.

**Example:** Reference string 1 2 3 4 1 2 5 1 2 3 4 5. FIFO with 3 frames: 9 faults. FIFO with 4 frames: 10 faults. LRU on the same string: 10 faults with 3 frames and 8 with 4.

**Failure:** Saying more frames always means fewer faults. For LRU and OPT the count never goes up (it stays the same or falls), but it is not always lower. FIFO can give more faults, as on this string.

## Topic: Approximating LRU (second chance and clock)

**Definition:** True LRU needs special hardware or slow bookkeeping. So hardware sets a reference bit (also called the use bit) on a page whenever it is used. In second chance, the OS goes through pages in FIFO order: a page whose bit is 0 is removed; a page whose bit is 1 gets the bit cleared to 0 and is skipped once. The clock version keeps the pages in a circle with a hand that moves on.

**Why:** It gets close to LRU with little cost.

**Example:** Frames hold pages A, B, C with reference bits 1, 0, 1, hand at A. A has bit 1, so clear it and move on. B has bit 0, so B is the victim. A's bit is now 0.

**Failure:** Saying the bit tells the order of use. It tells only used or not used since last cleared. A common improvement also looks at the modify bit (set when the page has been written to): a page not used and not modified is the best victim.

## Topic: Thrashing and the working set

**Definition:** Thrashing is when a process does not have enough frames, so it keeps faulting, and the system spends its time moving pages instead of running programs. The working set is the set of pages a process used in its most recent window of references. The working-set rule: add the working-set sizes of all processes into D; if D is more than m, the number of frames, suspend a process.

**Why:** Thrashing feeds itself. CPU use drops, the OS thinks it should run more programs, adds one, and the faults grow. Demand paging works because of locality (a program stays inside a small set of pages for a while); thrashing appears when these sets do not all fit.

**Example:** 100 frames and 3 processes, each with a working set of 40 pages. D = 120 is more than 100, so they thrash. Suspend one process: D = 80, which fits. This is admission control (deciding how many programs to let in).

**Failure:** Answering "buy more RAM" only. Asked how to detect thrashing, say a high fault rate with low CPU use.

## Questions

### What is demand paging, and how is it different from swapping?

Demand paging loads a page into memory when the program needs it (first use, or again after it was removed). Swapping moves a whole process between memory and disk. They are not the same thing.

### What happens on a page fault?

The hardware traps to the OS. The OS checks that the address is legal, finds a free frame (or picks a victim), reads the page from disk, updates the page table and restarts the instruction.

### Compare FIFO, LRU and optimal.

FIFO removes the oldest page, LRU the page unused for longest, and OPT the page not needed for longest in the future. On the 20-reference example with 3 frames they give 15, 12 and 9 faults. OPT is only a standard to compare against.

### What is Belady's anomaly?

With FIFO, adding frames can raise the fault count: 9 faults with 3 frames and 10 with 4 on one string. LRU and OPT do not have this problem.

### What is thrashing, and what stops it?

The system spends most of its time moving pages because processes lack enough frames. Fixes are to give each process its working set or to run fewer processes at once.

## Mistakes

- Saying demand paging means moving unused memory to disk. That is swapping; demand paging loads a page when it is needed.
- Saying a page fault means the program made an error. Usually it is a normal event the OS handles.

## Quiz

### On the 20-reference string with 3 frames, how many faults does FIFO give?

- [ ] 9
- [ ] 12
- [x] 15
- [ ] 20

Explanation: FIFO gives 15, LRU gives 12 and the optimal algorithm gives 9.

### Which of these is a stack algorithm that never shows Belady's anomaly?

- [ ] FIFO
- [x] LRU
- [ ] Random
- [ ] First fit

Explanation: LRU with N + 1 frames always holds what it holds with N frames. FIFO does not, and first fit is not a replacement algorithm.

### Memory access is 200 ns and a fault takes 8 ms. With one fault per 1,000 accesses, what is the effective access time?

- [ ] 199.8 ns
- [ ] 8,000 ns
- [x] 8,199.8 ns
- [ ] 8,200 ns

Explanation: 0.999 x 200 + 0.001 x 8,000,000 = 8,199.8 ns, about 41 times slower.

### When does copy-on-write copy a page?

- [ ] At fork, for the whole address space
- [x] When one process writes to a shared page
- [ ] When the second process reads it
- [ ] When memory is full

Explanation: Both processes share the pages read-only; the first write traps and only that page is copied.

### Three processes have working sets of 40 pages each and 100 frames exist. What is expected?

- [ ] Good performance, since each set is under 100
- [x] Thrashing, since 120 is above 100
- [ ] Belady's anomaly
- [ ] No page faults

Explanation: D = 120 is more than m = 100, so the processes keep taking frames from each other.

## Diagram

```json
{ "kind": "flow", "caption": "Steps of a page fault: trap, legal check, find a frame, read from disk, update the table, restart the instruction.", "steps": [{ "label": "Trap to the OS" }, { "label": "Check the address is legal" }, { "label": "Find a free frame (or pick a victim)" }, { "label": "Read the page from disk" }, { "label": "Update tables, set valid bit" }, { "label": "Restart the instruction" }] }
```
