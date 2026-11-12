---
id: os-ipc
title: Inter-Process Communication
lastChecked: 2026-11-12
next: os-cpu-scheduling
roadmapSteps: backend:os-networking-basics, devops-cloud:linux-command-line
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and os-drafts.md. Numbers computed by docs/content/checks/os-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

Inter-process communication, or IPC, is how separate running programs (processes) pass information to each other. Each process has its own private memory, so the operating system (the main software of the computer) has to provide a way to talk. Questions here cover the two models, shared memory and message passing, then pipes (one-way channels between two programs) and the producer-consumer example (one program makes items, another uses them). Examples use made-up numbers.

After this section you can compare the two models, explain how a pipe behaves when it is empty, full or closed, and describe send and receive in their blocking (the caller waits) and non-blocking (the caller carries on) forms.

## Topic: Why processes need IPC, and the two models

**Definition:** A process is a running program with its own private memory. Processes are independent (they do not affect each other) or cooperating (one can affect or be affected by another, for example by sharing data). Cooperating processes need IPC. Reasons: sharing information, speeding up a job by splitting it, splitting a program into pieces, and convenience. There are two models. In shared memory, the processes use an area of memory they both can reach. In message passing, they exchange messages with two operations, send and receive.

**Why:** Without IPC, a helper could not return a result to the main process.

**Example:** Two processes split a big sum, each adding half; one shares or sends its result and the other adds both.

**Failure:** Calling "independent and cooperating" types of synchronization (keeping shared work in a safe order). They are two kinds of process.

## Topic: Shared memory against message passing

**Definition:** With shared memory, the programs set up and manage the shared area themselves; the operating system only helps create it. The processes must make sure they do not read and write the area at clashing moments. That is called synchronization and is covered in the Process Synchronization section. With message passing, the processes share no variables. The operating system supplies send and receive, and the message size is either fixed or variable.

**Why:** Shared memory leaves all coordination to the programmers; message passing uses the OS for every exchange.

**Example:** POSIX (the standard set of UNIX-style system calls) shared memory: one process creates the area with shm_open (by name), sets its size with ftruncate, and maps it into its memory with mmap. It then uses the pointer (a memory address) that mmap returns. These are POSIX calls.

**Failure:** Answering "shared memory is always faster". Say what each model leaves to the programmer: message passing leaves the coordination to the OS's send and receive, while shared memory leaves it to the programs.

## Topic: Producer-consumer, the standard IPC example

**Definition:** One process, the producer, makes items. Another, the consumer, uses them. A buffer (a waiting area for items) sits between them. With an unbounded buffer (no practical size limit), the producer never waits and the consumer waits if the buffer is empty. With a bounded buffer (a fixed size), the producer also waits when the buffer is full.

**Why:** It is the pattern behind jobs such as one program writing logs while another reads them.

**Example:** A shared-memory bounded buffer of 4 slots with two counters: in (next slot to fill) and out (next slot to empty), both wrapping around with the remainder operation %. The buffer is empty when in == out, and full when (in + 1) % 4 == out. After three items go in, in is 3 and (3 + 1) % 4 = 0 equals out, so it is full. The design stores only 3 items in 4 slots, because one slot must stay unused to tell full from empty. A counter of full slots would let all slots be used, but then both sides update that counter, which is a race condition (a bug where the result depends on who runs first): with the counter at 5, the two updates can leave 4 or 6 instead of 5.

**Failure:** Forgetting that the shared-memory version has no waiting built in: the loops just spin (keep checking) until the other side acts. Semaphores (counters that control access), in the Process Synchronization section, fix this.

## Topic: Pipes and named pipes (FIFO)

**Definition:** A pipe is a one-way channel of bytes (a byte stream) with a read end and a write end. There are no message boundaries: the reader just gets bytes, not "the first message". An ordinary pipe (Windows calls it an anonymous pipe) cannot be reached from outside the process that created it. Ordinary pipes join related processes, usually parent and child; processes can also use one if they inherited it from a common ancestor, as in a shell pipeline. A named pipe (also called a FIFO, first in first out) can be used without a parent-child relationship, and several processes can use it.

**Why:** A pipe lets two programs work as producer and consumer with no shared variables written by hand.

**Example:** `grep -o foo file | wc -l` counts how many times foo appears: grep writes into a pipe, wc reads from it. Facts from the Linux manual page pipe(7):

- Reading from an empty pipe blocks (the reader waits).
- Writing to a full pipe blocks, or fails with the error code EAGAIN if the pipe is set to non-blocking (the call returns at once instead of waiting).
- The capacity is 65,536 bytes, which is 16 pages of 4096 bytes (a page is a block of memory; 16 x 4096 = 65,536), since Linux 2.6.11 with 4 KiB pages. If a writer sends 70,000 bytes and nobody reads, the first 65,536 bytes fit and the remaining 4,464 (70,000 - 65,536) must wait for a reader.
- When every write end is closed and the bytes still in the pipe have been read, the next read returns end-of-file (a signal that no more data will come).
- Writing with no read end open raises SIGPIPE (a signal that normally ends the writer).

**Failure:** Forgetting to close the unused write end: the reader then never sees end-of-file and waits forever. The blocking and end-of-file facts above come from the Linux pipe page, so say which system you mean.

## Topic: Sockets and signals

**Definition:** A socket is one endpoint of communication, written as an IP address (the number that names a machine on a network) joined with a port (a number that names a service on that machine), such as 161.25.19.8:1625. The address 127.0.0.1, called loopback, means the machine you are on. A signal is a short message the system sends to a process. In most UNIX shells, control-c sends SIGINT (interrupt, normally ends the process) and control-z sends SIGTSTP (stop, pauses it).

**Example:** A client connects to a server on port 1625 at 127.0.0.1, so both run on one machine. Pressing control-c in the terminal gives the running program SIGINT.

**Why:** Sockets let processes on different machines, or the same one, talk. Signals announce events, not data.

**Failure:** Saying signals carry data. They only announce an event. Normal users can only send signals to their own processes; only the superuser (root) can signal other users' processes.

## Topic: Direct and indirect communication, blocking and non-blocking

**Definition:** In direct communication the processes name each other: send(P, message) and receive(Q, message). A link is made automatically, joins exactly one pair, and there is exactly one link per pair. In indirect communication the messages go through a mailbox (also called a port) with a unique id. Processes talk only if they share a mailbox, a mailbox can serve many processes, and a pair can share several mailboxes.

- A blocking send makes the sender wait until the message is received. A blocking receive waits until a message is available.
- A non-blocking (asynchronous) send lets the sender carry on. A non-blocking receive returns either a valid message or a null message (nothing).
- If both are blocking, that is a rendezvous (a meeting where both sides wait for each other).
- Buffering (the message queue on the link) has three forms: zero capacity (a rendezvous), bounded capacity (sender waits if the queue is full), and unbounded capacity (sender never waits).

**Why:** These choices decide whether a slow receiver can slow the sender.

**Example:** P1, P2 and P3 share mailbox A. P1 sends and both P2 and P3 do receive. Who gets the message? Fixes: allow a link for at most two processes, allow one receiver at a time, or let the system pick one and tell the sender.

**Failure:** Confusing "blocking" with "broken". Blocking is a normal waiting state, and the producer with a bounded queue relies on it.

## Questions

### What are the two models of IPC, and how do they differ?

Shared memory: processes use a common area of memory and must synchronize their own access. Message passing: processes use send and receive supplied by the operating system, and share no variables.

### How does a pipe behave?

It is a one-way stream of bytes with a read end and a write end. Reading from an empty pipe waits. Writing to a full pipe waits (capacity 65,536 bytes on Linux). Once all write ends are closed and the remaining bytes are read, the reader gets end-of-file. Writing with no reader raises SIGPIPE.

### What is the difference between direct and indirect communication?

Direct: each process names the other in send and receive, with one link per pair. Indirect: messages go to a shared mailbox, so many processes can use it.

### What are blocking and non-blocking send and receive?

Blocking calls wait (a send until the message is received, a receive until one arrives); non-blocking calls return at once. If both block, it is a rendezvous.

### What is the producer-consumer problem?

A producer makes items and a consumer uses them through a buffer; with a bounded buffer, the producer waits when it is full.

## Mistakes

- Saying pipes let a process talk to itself. They join two processes, usually related ones.
- Saying a pipe is two-way. An ordinary pipe is one-way.

## Quiz

### When all the write ends of a pipe are closed and the bytes left in it have been read, what does the next read return?

- [ ] An error that stops the program
- [x] End-of-file
- [ ] The last message again
- [ ] Nothing, it waits forever

Explanation: The Linux manual page says reading returns end-of-file once every write end is closed and the remaining bytes are read. It waits forever only if some write end is still open.

### What is the capacity of a Linux pipe in the manual page, and why?

- [ ] 4,096 bytes (1 page)
- [ ] 16,384 bytes (4 pages)
- [x] 65,536 bytes (16 pages)
- [ ] Unlimited

Explanation: 16 x 4096 = 65,536 bytes since Linux 2.6.11 with 4 KiB pages. When it is full, a write waits (or fails with EAGAIN if non-blocking).

### In message passing, what is a rendezvous?

- [ ] A send that never waits
- [x] Both send and receive are blocking
- [ ] A mailbox shared by three processes
- [ ] A pipe with no write end

Explanation: If both send and receive block, the sender and the receiver wait for each other and meet.

### A shared-memory circular buffer has 4 slots, using in and out. How many items can it hold with the check (in + 1) % 4 == out?

- [ ] 4
- [x] 3
- [ ] 2
- [ ] 5

Explanation: One slot is left unused so that full and empty can be told apart. A 10-slot version holds 9.

### Which statement about ordinary pipes is correct?

- [ ] They connect a process to itself
- [ ] They are two-way
- [x] They are one-way, between related processes
- [ ] They need a mailbox id

Explanation: An ordinary pipe has a write end and a read end, and it is used between related processes, usually parent and child.

## Diagram

```json
{ "kind": "flow", "caption": "An ordinary pipe between a parent and its child: bytes go one way, from the write end to the read end.", "steps": [{ "label": "Parent creates the pipe" }, { "label": "Parent starts a child; both can reach the pipe" }, { "label": "Writer puts bytes in the write end" }, { "label": "Reader takes bytes from the read end" }, { "label": "All write ends closed: reader gets end-of-file" }] }
```
