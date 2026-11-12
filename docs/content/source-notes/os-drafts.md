# Source notes: Operating Systems drafts (Phase 2, 12 Nov 2026)

The eleven OS drafts are in `server/src/data/notes/os/drafts/` (not loaded by the site). Each was written by one of four AI writers from the sources in `os-oops-phase1.md`, then checked by `check-drafts.js` (the real notes validator and link rules): **template errors: none for all 11**. All numbers come from `docs/content/checks/os-check.py`. The drafts have **not** yet had the two read-only reviewers or the plain-words check (Phase 4); the "to check" lists below are what those reviewers start from.

## Sections, sources and size (words counted by the checker; all above the 1,100 to 1,800 target, to be trimmed after review)
| Section id | Words | Main sources |
|---|---|---|
| `os-introduction` | 1,980 | os-book ch1, ch2; OSTEP intro, cpu-mechanisms |
| `os-processes` | 1,835 | ch3; OSTEP cpu-intro, cpu-api, cpu-mechanisms; `fork(2)`, `wait(2)`, `execve(2)` |
| `os-threads` | 1,676 | ch4; OSTEP threads-intro, threads-api; `pthreads(7)` |
| `os-ipc` | 2,171 | ch3 (IPC part); OSTEP cpu-api (pipes, signals); `pipe(7)`, `pipe(2)` |
| `os-cpu-scheduling` | 2,326 | ch5; OSTEP cpu-sched, cpu-sched-mlfq, cpu-sched-lottery, cpu-sched-multi; kernel CFS and EEVDF pages |
| `os-synchronization` | 2,269 | ch6, ch7; OSTEP threads-locks, threads-locks-usage, threads-cv, threads-sema; JLS 17.2.1 (one sentence) |
| `os-deadlocks` | 2,443 | ch8; ch5 slide 25, ch6 slide 58; OSTEP threads-bugs |
| `os-memory-management` | 2,195 | ch9; OSTEP vm-intro, vm-mechanism, vm-segmentation, vm-freespace, vm-paging, vm-tlbs, vm-smalltables |
| `os-virtual-memory` | 2,163 | ch10; OSTEP vm-beyondphys, vm-beyondphys-policy, vm-complete |
| `os-file-systems-disk` | 2,319 | ch11 to ch15; OSTEP file-devices, file-disks, file-raid, file-intro, file-implementation, file-journaling |
| `os-linux-security-interview` | 2,250 | ch16, ch17, ch18, ch20, ch2; OSTEP file-intro 39.16; man pages and kernel pages |

The slide and OSTEP locations of each claim are in the writers' reports (slide numbers for each topic); every claim they marked "verbatim-checked" can be re-found at the slide or section named there.

## Numbers and where they come from
Fork counts 2, 4, 8, 16 (n forks give 2^n processes, 2^n - 1 children); race on `counter + 1` has 6 allowed orders giving final value 1 in 4 of them and 2 in 2; producer-consumer trace; CPU scheduling examples A and B (FCFS 17.0 vs 3.0 average wait; example B FCFS 8.75, SJF 7.75, SRTF 6.5, RR q=4 11.75, RR response 4.5; priority 8.2); Banker's need matrix, one safe sequence P1,P3,P0,P2,P4 (the slides list P1,P3,P4,P2,P0; more than one exists), P1 request (1,0,2) safe, P4 request (3,3,0) unsafe; paging 20 + 12 bits, 0x403, 0xA7C, 4 MB table, frame 0x1F gives 0x1FA7C; 36 pages and 962 bytes internal fragmentation; segmentation 4353, trap, 2399; first/best/worst fit; TLB 140 ns and 121 ns; page faults FIFO 15, LRU 12, OPT 9 (slides use a 22-reference string, ours has 20, the counts match); Belady 9 and 10 (LRU 10 and 8); EAT with faults 8,199.8 ns, 41 times; disk head FCFS 640, SSTF 236, SCAN 236 (toward 0) or 331 (toward 199), C-SCAN 382, LOOK 299, C-LOOK 322; RAID 4, 2, 3 TB; inode 1,024 pointers, 48 KB + 4 MB + 4 GB + 4 TB; pipe 65,536 = 16 x 4096. Plain arithmetic shown inside the drafts (round-robin overhead 1/2, 1/5, 1/21; (n-1)q; 7200 RPM 8.33 ms per turn, 4.17 ms average wait; a 32 MB bitmap for 1 TB with 4 KB blocks; 300 - 256 = 44) is re-checked by the reviewers.

## To check in review (claims the writers marked as their own reading, not word-for-word)
- **Introduction and processes:** the copy-on-write definition (now backed by OSTEP `vm-complete`); the five-state transition list (the slide's diagram is an image); "orphan = parent ended" (ch3 slide 26, while `wait(2)` describes only adopted zombies); "the kernel sets up the trap table at boot" (OSTEP's model system, written as general); "two forks then a print gives four lines".
- **IPC, scheduling, synchronization:** pipe facts came from this file's section 7 summary, not re-read against the man page; slides call named pipes two-way while `pipe(7)` says one-way (the draft tells the reader to say which system); strict alternation breaks "progress" (writer's reasoning); swapping the two waits in the bounded buffer deadlocks (writer's reasoning); "wait releases the mutex while sleeping" (reading of OSTEP and ch7 slide 26); "starvation is not part of FCFS, the problem is the convoy effect"; lottery "long run" wording; the quiz explanation that says "the pages we read do not say which scheduler is the default" reads oddly.
- **Deadlocks, memory, virtual memory:** detection complexity and recovery options (reading); the Intel 32-bit segmentation-with-paging line (ch9 slide 59, reading); the swapping paragraph (clumsy paraphrase of ch9 slide 52); OSTEP VM chapters were read through targeted extracts, not front to back, and `vm-api` was not read; the slides' TLB example ignores the 12 ns lookup while ours uses 20 ns.
- **Files, disk, Linux:** the slides' SCAN figure of 208 cylinders (ch11 slide 21) equals our LOOK toward 0 first (39 + 169), not our SCAN 236; the draft states the direction assumption, reviewers should compare; "authorization" is mapped to the slides' word "protection"; RAID 6 capacity (2 TB for 4 disks) is in the script but no Tier 1 text read gives N - 2, so the draft leaves it out; the bitmap note does not say which bit value means free; the 7/6/1 permission example is arithmetic from the slide's bits; one slide saying Linux "3.0 introduced a new CFS" contradicts the 2.6.23 fact and was not used.
- **Chapters outside the writer's brief:** `os-linux-security-interview` cites slides from ch1, ch3 to ch6, ch8, ch9, ch12, ch13 for its cross-topic questions; reviewers check those answers against the sections they point to.

## Left out on purpose
Which scheduler is the default in Linux today; a Linux page-size figure; the Windows/UNIX "ignore deadlock" claim; "shared memory is faster than message passing"; "reentrant code has no concurrency" (a mistake on an interview page, no Tier 1 source for the right meaning in the slides); the CFQ disk scheduler as "the default"; Docker-style containers (the slides cover Solaris zones and BSD jails only); RAID 3; FFS, WAFL, NFS; whether a zombie can be killed.

## Links
Roadmap links used (all exist): `backend:os-networking-basics`, `devops-cloud:linux-command-line`, `devops-cloud:docker-containers`, `java-spring:java-concurrency-basics`. The writers chose them to satisfy the one-link rule, so fit is checked in Phase 4. Existing roadmap practice links to `os:os-processes-threads` (backend, java-spring, devops-cloud) point at the old id and are remapped to `os-processes` or `os-threads` at publish.

## Review round (12 Nov 2026, after the drafts were written)
Three read-only AI reviewers read all 11 drafts: two for accuracy (sections 1 to 6 and 7 to 11; they recomputed every number and checked every quiz) and one for plain words and house style. Six editors then applied the findings and trimmed. The reviewers' main corrections, now applied:
- **Wrong:** the race-condition count (three steps give 20 orders, 18 end at 1 and 2 at 2; the script now prints it); a Questions answer that said SCAN does not starve (the slides say it still can); "more frames always means fewer faults" (for LRU and OPT the count never rises); "thousands of times slower" for seek and rotation (about 300 times in the example).
- **Missing condition:** SJF is optimal only when all processes arrive together; end-of-file in a pipe only after the remaining bytes are read; waiting time is turnaround minus CPU time only for a job with no I/O; a counting semaphore can show waiters as negative; copy-on-write copies only a page that is still shared; avoidance does not remove any condition by design; the 4 MB flat page table needs 4-byte entries; the 4.0 TB inode limit is "by the pointers alone".
- **SCAN 236 against the slide's 208:** both are right. 236 is the full sweep to track 0; 208 (39 + 169) is the version that turns at the last request, which the draft calls LOOK. The section now says so. C-SCAN 382, LOOK 299 and C-LOOK 322 are kept and labelled; LOOK and C-LOOK are not in our slides.
- **Unsupported claims removed:** "most interviewers", "among the most asked", "Windows has no fork", "a monolithic kernel is faster", "allows more sharing than prevention", "everything is a file" as fact, and the "sources we read do not say" lines (replaced by "name the kernel version").
- **Plain words:** plain meanings added at first use; "(slides)", "(OSTEP)" and "(an example)" tags removed; repeated topics cut from `os-linux-security-interview` (it now points to the sections that explain fork/exec, zombies, FCFS and the scheduler).
- **Cuts:** page-size topic removed from `os-virtual-memory` (it is in `os-memory-management`), lottery scheduling, dispatch latency, the Java `Vector` example, the Peterson reordering example, RAID 6 and the RAID 5 small-write cost, and the original UNIX/ext2/ext3 list.

Final sizes as counted by the checker: introduction 1,813; processes 1,808; threads 1,729; ipc 1,824; cpu-scheduling 1,867; synchronization 1,911; deadlocks 1,865; memory-management 1,904; virtual-memory 1,850; file-systems-disk 2,075 plus the restored C-SCAN line; linux-security-interview 1,758. Five are 1 to 110 words over the 1,800 target; file-systems-disk is about 275 over because disk scheduling, RAID, inodes and journaling facts were kept.

**Checker lesson:** a draft has no `lastChecked`, so the validator applies only the soft check to it and "template errors: none" meant little. The checker now forces the full template; it found 16 real errors (a topic missing its Why or Example, three overviews outside 60 to 120 words, six questions in one section), which the editors fixed. The last run showed no template errors. The owner asked to re-run the checker in Phase 4, so it is not run again in Phase 2.

## Still open for Phase 4
- Claims that remain the writers' or editors' own reading: the `write()` five-step trace and the Linux "monolithic plus loadable modules" line in `os-introduction`; the five-state transition list; the reviewer-supplied figures (300 times, 9.3 ms, "the slide rounds 41 to 40", 301 and 45 bytes) were taken from the review reports and not re-read in the slide text.
- The Linux pipe(7) facts still rest on the section 7 summary above, not the man page itself.
- The two roadmap links per section were chosen to satisfy the one-link rule; fit to be checked.
- `os-linux-security-interview` now has 4 questions and mostly pointers for the cross-topic answers; decide in Phase 4 whether to restore a few spoken answers.
- Skill catalog and roadmap `practice` links that point at `os:os-processes-threads` are remapped at publish.
