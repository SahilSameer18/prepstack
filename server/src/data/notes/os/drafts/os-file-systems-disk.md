---
id: os-file-systems-disk
title: File Systems, I/O and Disk Scheduling
next: os-linux-security-interview
roadmapSteps: devops-cloud:linux-command-line
---

<!-- Draft 12 Nov 2026, not published. Written from docs/content/source-notes/os-oops-phase1.md. Numbers from docs/content/checks/os-check.py. -->

## Overview

A computer keeps files on a disk, and a disk is slow compared with the CPU (the processor). This section covers how the operating system (the main software of the computer) talks to devices, how a hard disk spends its time, the order of disk requests, RAID (using several disks together), and how files, inodes (the record that describes one file) and a journal (a log of changes written before the real change) are organised. Example numbers are made up unless a source is named.

After this section you can compute disk access time, count head movement for FCFS, SSTF and SCAN, find the space RAID gives, and explain hard and soft links and journaling.

## Topic: Talking to devices: polling, interrupts and DMA

**Definition:** Polling (the CPU keeps asking a device "are you done?") is simple but wastes CPU time while the device is slow. An interrupt (the device sends a signal, and the CPU jumps to a small routine called the interrupt handler) lets the CPU run other work meanwhile. DMA (direct memory access: a helper chip copies data between the device and memory, then raises one interrupt at the end) takes the copying away from the CPU.

**Why:** Copying a big block by the CPU itself keeps it busy with a boring job. DMA frees it.

**Example:** A disk read takes about 9 ms. With polling, the CPU spins for those 9 ms. With an interrupt, the system runs another process meanwhile. With DMA, the 4 KB block is also copied without the CPU (copying by the CPU itself is called programmed I/O).

**Failure:** "Interrupts are always better." For a very fast device, the interrupt costs more than a short wait, and a flood of interrupts can leave the system busy but making no progress (livelock).

## Topic: A hard disk and its access time

**Definition:** A hard disk spins platters (round plates coated to hold data) under a read-write head on a moving arm. Data sits on tracks (rings), cut into sectors (small fixed-size pieces of a track); the disk reads and writes in blocks (such as 4 KB). Time for one request = seek time (moving the arm to the right track) + rotational latency (waiting for the right spot to spin under the head) + transfer time (reading the bytes).

**Why:** Seek and rotation involve moving parts and are hundreds of times slower than the transfer of one small block (about 300 times in the example below). This is why the order of requests matters and why sequential reading (blocks that follow each other) is far faster than random reading (blocks spread around).

**Example:** A 7200 RPM disk (rotations per minute) makes one turn in 60 / 7200 = 8.33 ms, so the average rotational wait is half of that, 4.17 ms. With an average seek of 5 ms, and a transfer of 4 KB at 1 Gbit/s taking about 0.03 ms, the total is 5 + 4.17 + 0.03, about 9.2 ms (the slide adds 0.1 ms controller overhead: 9.3 ms).

**Failure:** Counting only the transfer time. An SSD (a flash drive with no moving parts) has no seek or rotation, so these formulas are for hard disks.

## Topic: Disk scheduling

**Definition:** When many requests wait, the operating system picks an order to reduce arm movement. The measure is total tracks crossed. Setup from the OSTEP textbook (Operating Systems: Three Easy Pieces): tracks 0 to 199, head at 53, queue 98 183 37 122 14 124 65 67.

**Why:** Fewer tracks crossed means less seek time.

**Example:**
- FCFS (first come, first served): 53 to 98 (45), 183 (85), 37 (146), 122 (85), 14 (108), 124 (110), 65 (59), 67 (2) = 640.
- SSTF (shortest seek time first, always the nearest request): 65, 67, 37, 14, 98, 122, 124, 183 = 236.
- SCAN (the elevator: sweep one way to the end of the disk, then back). Toward 0 first: 53 to 0 (53), then 0 to 183 (183) = 236. Toward 199 first: 53 to 199 (146), then back to 14 (185) = 331.
- LOOK (SCAN that turns around at the last request, not the disk end; a common variant not in our course slides). Toward 0 first: 53 to 14 (39), then 14 to 183 (169) = 208.

The course slide shows 208 for SCAN, but that is really this turn-at-the-last-request version; the full sweep to track 0 gives 236. Interview answer: SCAN 236 toward 0, 331 toward 199. C-SCAN and C-LOOK sweep one way only and jump back instead of reversing. For the same queue, going toward track 199 first: C-SCAN moves 382 in total (including the jump back to track 0), LOOK moves 299 and C-LOOK moves 322 (including its jump). LOOK and C-LOOK are common variants that our course slides do not cover.

**Failure:** SSTF can starve (keep ignoring) far requests when near ones keep arriving; SCAN greatly reduces that, though the slides say starvation is still possible. Totals depend on the start direction, so always say which.

## Topic: RAID

**Definition:** RAID (redundant array of inexpensive disks) joins several disks to look like one. RAID 0 (striping) splits blocks across disks and stores no copies. RAID 1 (mirroring) keeps two copies of every block. RAID 5 stores data plus parity (a check value made by XOR, which gives 1 when the number of 1s is odd), spread across all disks.

**Why:** RAID 0 gives speed and full space. RAID 1 and RAID 5 survive one failed disk.

**Example:** Four disks of 1 TB each. RAID 0: 4 TB. RAID 1: 2 TB, half is copies. RAID 5: 3 TB, one disk's worth holds parity. Parity example: data bits 0 0 1 1 give parity 0; if the third disk dies, the rest must still have an even count of 1s, so the lost bit is 1.

**Failure:** Saying RAID always stores copies. RAID 0 keeps none, and one failed disk loses everything. RAID is not a backup.

## Topic: Files, directories and links

**Definition:** A file is a named stream of bytes. A directory (folder) is a file holding (name, inode number) pairs. A path (like /home/a/notes.txt) names a file by walking directories. A hard link is a second name for the same inode. A soft link (symbolic link) is a small file that holds a path to another name.

**Why:** The inode keeps a link count (how many names point to it). The file is freed only when the count reaches zero.

**Example:** `ln a b` makes b a hard link: both names show the same inode, the count is 2, and after `rm a` the data is still reachable as b. `ln -s a c` makes c a soft link. After `rm a`, c still exists but points to nothing (a dangling link). Opening a file returns a file descriptor (a small number per process) that leads to the open-file table, which holds the current position in the file (the offset). This is OSTEP's model; the textbook slides keep the file pointer per process, so name your source.

**Failure:** Hard links cannot point to a directory or to a file on another file system (inode numbers are unique only inside one). A soft link can, but it can dangle.

## Topic: Allocation methods and inodes

**Definition:** Allocation is how the file system chooses disk blocks for a file. Contiguous: one run of neighbouring blocks, so only the start and length are stored. Linked: each block holds the number of the next block (FAT, the file allocation table, moves these pointers into one table at the start of the disk). Indexed: an index block, or the inode itself, lists all the file's blocks.

**Why:** Contiguous is fast but suffers external fragmentation (free space split in pieces too small to use). Linked has no such waste but is slow for random access (jumping straight to any part of a file): to find block 5 you must follow the pointers through the blocks before it. Indexed gives direct access.

**Example:** One layout (not every file system): an inode with 12 direct pointers, 1 single, 1 double and 1 triple indirect pointer (a pointer to a block of pointers), with 4 KB blocks and 4-byte pointers, so one block holds 4096 / 4 = 1,024 pointers. Direct: 12 x 4 KB = 48 KB. Single indirect adds 4 MB, double 4 GB, triple 4 TB. By the pointers alone the largest file is about 4.0 TB (real limits also depend on the size field). A 100 KB file needs 25 blocks: 12 direct, 13 via the single indirect block.

**Failure:** Calling this every file system's layout. ext4 and XFS use extents (a start plus a length).

## Topic: Free space and caching

**Definition:** A bitmap uses one bit per block to say free or used. A free list links the free blocks. A cache keeps recently used disk blocks in memory.

**Why:** Allocation must find free blocks fast. Caching avoids slow repeat reads.

**Example:** A 1 TB disk with 4 KB blocks has 2^40 / 2^12 = 2^28 blocks, so the bitmap has 2^28 bits = 2^25 bytes = 32 MB.

**Failure:** A cache holds writes in memory before they reach the disk, so a crash can lose recent writes unless the program forces them out (fsync, a call that forces data onto the disk).

## Topic: Crash consistency and journaling

**Definition:** A file system can be left inconsistent (its records disagree) if the machine crashes in the middle of an update. A journal is a note written before the real change; after a crash, the system reads the note and finishes or skips the change.

**Why:** Appending one block needs three writes: the inode, the bitmap and the data. If only the bitmap is written, the block is marked used but no file owns it (a leak). If only the inode is written, it points to a block the bitmap calls free. The older repair tool, fsck, scans the whole disk after a crash, which is slow.

**Example:** Journal steps: (1) write the transaction (one group of changes treated as a single unit: begin mark, new inode, new bitmap, data) to the journal; (2) write the end mark (commit); (3) copy the changes to their real places (checkpoint). After a crash, committed transactions are replayed (redo logging); uncommitted ones are skipped. Metadata journaling is the usual choice. Metadata means information about the data, such as the inode and bitmap. It logs only that and writes the data first, so an inode never points to garbage.

**Failure:** "A journal prevents data loss." It keeps the file system consistent; the last few seconds of writes can still be lost. The end mark must come last, or a half-written transaction would look complete.

## Questions

### Compare polling, interrupts and DMA.

Polling keeps the CPU asking the device. An interrupt lets the CPU do other work until the device signals. DMA also copies the data without the CPU.

### Compare FCFS, SSTF and SCAN on a queue.

Using head 53 and queue 98 183 37 122 14 124 65 67 on tracks 0 to 199: FCFS crosses 640 tracks, SSTF 236, SCAN 236 going toward 0 first or 331 going toward 199 first. SSTF can starve far requests; SCAN sweeps both ways and so greatly reduces this, though the slides say starvation is still possible.

### What is the difference between a hard link and a soft link?

A hard link is another name for the same inode, so the data stays until every name is removed. A soft link is a small file holding a path, so it breaks if the target is removed.

### How does the OS find a file's blocks?

Through the inode: 12 direct pointers reach the first 48 KB, a single indirect pointer adds 4 MB, and double and triple indirect pointers reach more.

### How does journaling help after a crash?

Each change is first written to a log. After a crash, committed entries are replayed and unfinished ones ignored, with no full disk scan.

## Mistakes

- Saying RAID always stores copies. RAID 0 stores none.
- Quoting a disk scheduling total without saying which way the head moves first.

## Quiz

### Head at 53, queue 98 183 37 122 14 124 65 67. How many tracks does FCFS cross?

- [ ] 236
- [ ] 331
- [x] 640
- [ ] 299

Explanation: 45 + 85 + 146 + 85 + 108 + 110 + 59 + 2 = 640.

### Four disks of 1 TB each in RAID 5 give how much usable space?

- [ ] 4 TB
- [ ] 2 TB
- [x] 3 TB
- [ ] 1 TB

Explanation: One disk's worth holds parity: (4 - 1) x 1 TB = 3 TB.

### An inode has 12 direct pointers, 4 KB blocks and 4-byte pointers. How much data do the direct pointers reach?

- [ ] 12 KB
- [x] 48 KB
- [ ] 4 MB
- [ ] 4 GB

Explanation: 12 x 4 KB = 48 KB.

### After `rm a`, which link still works if `b` is a hard link and `c` is a soft link to `a`?

- [ ] c only
- [x] b only
- [ ] Both
- [ ] Neither

Explanation: The hard link b keeps the inode alive. The soft link c holds the path "a", which no longer exists.

### In journaling, why is the commit (end) mark written after the other blocks of the transaction?

- [ ] To make the journal smaller
- [x] So a half-written transaction never looks complete
- [ ] Because data must come last on the disk
- [ ] To avoid using the bitmap

Explanation: If the end mark reached the disk first, recovery could replay a transaction with a garbage block.

## Diagram

```json
{ "kind": "flow", "caption": "Journaling an update: log it, commit it, then copy it to its real place.", "steps": [{ "label": "Write begin mark, inode, bitmap and data to the journal" }, { "label": "Write the end (commit) mark" }, { "label": "Checkpoint: copy changes to their real places" }, { "label": "After a crash: replay committed entries" }] }
```
