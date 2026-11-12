---
id: os-memory-management
title: Memory Management
lastChecked: 2026-11-12
next: os-virtual-memory
roadmapSteps: backend:os-networking-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and os-drafts.md. Numbers computed by docs/content/checks/os-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

Main memory (RAM, the fast working storage of the computer) is shared by many programs. Memory management is how the operating system gives each program its own space, keeps programs apart, and wastes as little as possible. Interviewers ask about fragmentation (wasted memory), paging (cutting memory into equal blocks), the TLB (a small fast helper for address lookups) and segmentation (cutting it into parts that follow the program's structure). The examples use made-up numbers unless a source is named.

After this section you can split an address into page number and offset, work out fragmentation, compute an effective access time, and compare paging with segmentation.

## Topic: Logical and physical addresses, and the MMU

**Definition:** A logical address (also called a virtual address) is the address a program uses; the CPU produces it. A physical address is the real position in RAM. The MMU (memory-management unit, a piece of hardware) turns the first into the second at run time. The simplest scheme adds a relocation (base) register, a stored number added to every address the program uses, and checks the address against a limit.

**Why:** The program never needs to know where it was placed, and the hardware refuses any address outside its own space, so one program cannot damage another.

**Example:** A program is loaded at physical address 32,000. The base register holds 32,000 and the limit is 4,000. The program asks for logical address 150. The hardware checks that 150 is below 4,000, then sends 32,000 + 150 = 32,150 to memory. A request for logical address 4,500 is not below the limit, so it traps (stops with an error handed to the operating system).

**Failure:** Saying addresses in a C program are real. Any address a user program can print is virtual.

## Topic: Contiguous allocation (first, best and worst fit)

**Definition:** In contiguous allocation each process gets one unbroken block of memory. Free blocks are called holes. When a process arrives, the OS picks a hole by a rule. First fit takes the first hole that is big enough. Best fit takes the smallest hole that is big enough. Worst fit takes the largest hole.

**Why:** The rule decides how much memory is left in small useless pieces. First fit and best fit are better than worst fit in speed and use of memory.

**Example:** Holes in order are 100, 500, 200, 300 and 600 (in KB). Processes 212, 417, 112 and 426 arrive in this order.
- First fit: 212 goes into 500 (leaves 288), 417 into 600 (leaves 183), 112 into the 288 hole (leaves 176). 426 must wait.
- Best fit: 212 into 300 (88), 417 into 500 (83), 112 into 200 (88), 426 into 600 (174). All four are placed.
- Worst fit: 212 into 600 (388), 417 into 500 (83), 112 into 388 (276). 426 waits.

**Failure:** Saying best fit always wins. It places all four here, but it must search the whole list, and it leaves many tiny holes.

## Topic: Fragmentation and compaction

**Definition:** Internal fragmentation is waste inside a block that was given out: the process got more than it asked for. External fragmentation is when enough free memory exists in total but it is split into pieces too small for the request. Compaction means sliding all processes together so the free space becomes one big hole.

**Why:** Both waste memory. Compaction needs addresses worked out while the program runs, so processes can move, and it costs time because data is copied.

**Example:** Paging uses fixed-size pages (explained in the next topic), so it has internal waste only in the last page. A process of 72,766 bytes with pages of 2,048 bytes is 35 full pages plus 1,086 bytes, so it needs 36 pages (73,728 bytes). The waste is 73,728 - 72,766 = 962 bytes. External: free pieces of 20 KB, 10 KB and 5 KB cannot satisfy a request for 30 KB in one block, although 35 KB is free.

**Failure:** Mixing the two words: internal waste is inside a block, external waste is between blocks. Paging does not remove all waste: the worst case is one frame minus one byte per process, and the average is half a frame.

## Topic: Paging

**Definition:** Paging splits physical memory into fixed-size frames (slots of real memory) and the program's logical memory into pages of the same size. A page table (one per process, kept in memory) tells which frame holds each page. A logical address has two parts: the page number, used as an index into the table, and the offset, the position inside the page. The offset stays; the page number becomes the frame number.

**Why:** A process no longer needs one unbroken block, so there is no external fragmentation.

**Example:** 32-bit addresses and pages of 4 KB (4,096 bytes = 2^12). The low 12 bits are the offset and the high 20 bits are the page number, so there are 2^20 = 1,048,576 pages. Address 0x00403A7C (0x means a hexadecimal number) has page number 0x403 (1,027) and offset 0xA7C (2,684). If the table says page 0x403 is in frame 0x1F, the physical address is frame 0x1F followed by offset 0xA7C, which is 0x1FA7C. Smaller pages waste less inside the last page but need a bigger table.

**Failure:** Forgetting that the table takes memory and every access needs an extra read of it, which is why the TLB exists.

## Topic: The TLB and effective access time

**Definition:** The TLB (translation look-aside buffer) is a small, very fast cache (a short-term copy for quick reuse) of recent page-to-frame answers. If the page is in the TLB, that is a hit and no page-table read is needed. If not, it is a miss: the page table is read and the answer is put in the TLB. TLBs are small, typically 64 to 1,024 entries. Effective access time (EAT) is the average time per memory access, weighted by how often hits and misses happen. The hit ratio is the share of lookups found in the TLB.

**Why:** Without it every access costs two reads. Programs reuse nearby addresses, so most lookups hit.

**Example:** TLB lookup 20 ns, memory access 100 ns, one-level page table. A hit costs 20 + 100 = 120 ns; a miss 20 + 100 + 100 = 220 ns. At an 80% hit ratio: 0.8 x 120 + 0.2 x 220 = 140 ns. At 99%: 121 ns.

**Failure:** The follow-up is the context switch (the OS changing from one process to another). A TLB entry may carry an address-space identifier (ASID, a tag naming the process); without it the TLB must be emptied at every switch.

## Topic: Multilevel page tables

**Definition:** A multilevel page table splits the page table into pieces and keeps a small top-level table (a page directory) that points to the pieces. Pieces for unused address ranges are never created.

**Why:** A flat table (one big table) has an entry for every page the program could ever use, even if it never will. With 20-bit page numbers and 4-byte entries, that is 2^20 x 4 bytes = 4 MB per process, and 100 processes would take 400 MB for tables alone.

**Example:** Split the 20-bit page number into 10 bits and 10 bits. A piece then has 2^10 = 1,024 entries of 4 bytes, exactly one 4 KB page, and covers 1,024 x 4 KB = 4 MB of addresses. A small process using one range near the bottom and its stack near the top needs the top table plus two pieces: 3 x 4 KB = 12 KB instead of 4,096 KB.

**Failure:** The price is time: on a TLB miss the hardware must make two reads, one for the directory and one for the entry. It is a time-for-space trade. For 64-bit addresses even two levels are not enough.

## Topic: Segmentation, and how it compares with paging

**Definition:** Segmentation splits a program into parts of different sizes that follow its meaning, such as code, heap (memory taken while running) and stack. Each segment has its own base and limit in a segment table. A logical address is (segment number, offset). An offset not below the limit makes the hardware trap. The "segmentation fault" is named after this.

**Why:** Each part gets its own protection and size.

**Example:** Segment 0 base 1400, limit 1000. Segment 1 base 6300, limit 400. Segment 2 base 4300, limit 400. Segment 2, offset 53: 4300 + 53 = 4353. Segment 1, offset 852: 852 is not below 400, so it traps. Segment 0, offset 999: 1400 + 999 = 2399.

Paging: fixed-size pieces, no external waste, a little internal waste. Segmentation: variable-size pieces, external waste and costly compaction, protection per part.

**Failure:** Saying one is better. Paging avoids external waste; segmentation matches the program's structure. Some designs use both.

## Topic: Swapping

**Definition:** Swapping moves a whole process out of memory to a backing store (a disk area kept for this) and brings it back later, so the total memory of all processes can be more than RAM.

**Why:** More processes can exist than fit in memory, but moving one is slow.

**Example:** A 100 MB process on a disk moving 50 MB a second takes 100 / 50 = 2 seconds to swap out and 2 to swap in: 4 seconds in one context switch.

**Failure:** Confusing swapping with demand paging. Swapping moves whole processes; demand paging brings in single pages only when used (next section).

## Questions

### What is the difference between internal and external fragmentation?

Internal waste is unused space inside an allocated block, such as the end of the last page. External waste is free memory split into pieces too small to use. Paging has only internal waste.

### How does paging translate an address?

Split the address into page number and offset. Look up the frame in the page table, then join it to the same offset.

### Why do we need a TLB?

The page table lives in memory, so each access would need two reads. The TLB keeps recent translations, so most need one. At a 99% hit ratio the example gives 121 ns, against 140 ns at 80%.

### What is the difference between paging and segmentation?

Paging uses fixed-size pieces with no external waste. Segmentation uses variable-size pieces that follow the program's parts, with external waste.

### Why use multilevel page tables?

A flat table for a 32-bit address space with 4 KB pages and 4-byte entries is 4 MB for every process. A multilevel table builds only the pieces in use, at the cost of an extra read on a TLB miss.

## Mistakes

- Saying paging has no fragmentation. It still wastes part of the last page (962 bytes in the example).
- Saying best fit is always the best. It leaves tiny holes and searches the full list.

## Quiz

### A process of 72,766 bytes is stored in 2,048-byte pages. How much internal fragmentation is there?

- [ ] 1,086 bytes
- [x] 962 bytes
- [ ] 2,048 bytes
- [ ] 0 bytes

Explanation: 36 pages = 73,728 bytes, and 73,728 - 72,766 = 962. The 1,086 is the part used in the last page.

### With 4 KB pages and 32-bit addresses, how many bits make the page number?

- [ ] 12
- [ ] 10
- [x] 20
- [ ] 32

Explanation: 4 KB = 2^12, so 12 bits are offset and 32 - 12 = 20 bits are the page number.

### TLB lookup is 20 ns, memory access 100 ns, hit ratio 80%. What is the effective access time?

- [ ] 120 ns
- [x] 140 ns
- [ ] 220 ns
- [ ] 100 ns

Explanation: 0.8 x 120 + 0.2 x 220 = 96 + 44 = 140 ns.

### In the first-fit example (holes 100, 500, 200, 300, 600; processes 212, 417, 112, 426), what happens to process 426?

- [ ] It goes into the 600 hole
- [ ] It goes into the 500 hole
- [x] It waits: no hole is big enough
- [ ] It is split across the 176 and 183 holes

Explanation: The holes are 100, 176, 200, 300 and 183, so none holds 426. A process needs one unbroken block.

### Segment 1 has base 6300 and limit 400. What happens for offset 852?

- [ ] The address is 7152
- [x] The hardware traps: 852 is over the limit
- [ ] The address is 852
- [ ] The segment grows

Explanation: An offset must be below the limit of 400.

## Diagram

```json
{ "kind": "flow", "caption": "Paging with a TLB: the CPU gives a logical address, the page number is looked up in the TLB or the page table, and the frame number joins the offset.", "steps": [{ "label": "CPU: logical address (page, offset)" }, { "label": "TLB lookup for the page" }, { "label": "Miss: read page table in memory" }, { "label": "Frame number + offset = physical address" }] }
```
