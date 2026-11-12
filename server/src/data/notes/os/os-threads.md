---
id: os-threads
title: Threads and Multithreading
lastChecked: 2026-11-12
next: os-ipc
roadmapSteps: java-spring:java-concurrency-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and os-drafts.md. Numbers computed by docs/content/checks/os-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A thread is one line of execution inside a process (a running program). Threads in one process share its memory, so they cooperate easily but can corrupt shared data. Questions here cover how a thread differs from a process, why threads are cheaper, how user and kernel threads relate (the kernel is the core of the operating system), what a thread pool is, and why shared data needs locks (a lock lets only one thread use a piece of data at a time).

After this section you can list what threads share and what they keep private, name the three threading models, state how Linux threads work, and show a lost update with real numbers.

## Topic: Thread against process

**Definition:** A thread has its own program counter (which marks the next instruction), its own registers (the CPU's tiny fast storage) and its own stack (space for local variables and function calls). It runs inside a process and shares that process's address space (the memory the process can use).

On POSIX (the standard interface of Unix-like systems), pthreads(7) says threads of one process share global memory (data and heap) and also the process ID, open files, signal settings (what the process does on each signal, a message from the OS) and the working directory. Each thread keeps its own thread ID, signal mask (the list of signals it is currently ignoring) and `errno` (the last error code).

**Why:** Sharing memory makes communication simple, and the OS keeps less per thread than per process. A process switch must change the page table (the map of addresses to memory); a switch between two threads of one process does not (the OSTEP textbook, Operating Systems: Three Easy Pieces).

**Example:** (Made-up numbers.) A process has 3 threads. There is one copy of the code, one set of global variables, one heap and one list of open files, but 3 stacks and 3 sets of registers.

**Failure:** Saying threads share the stack. Each thread has its own, which is why local variables are safe. A related warning: never return a pointer to a variable on a thread's stack, because it is freed when the thread function returns.

## Topic: Why use threads

**Definition:** There are two main reasons. First, parallelism (doing parts of one job at the same time): on a machine with several CPUs, a thread per CPU can speed up work such as adding two large arrays. Second, to avoid blocking on slow I/O (input or output, like waiting for a network reply): while one thread waits, the scheduler (the part of the OS that picks what runs next) can run another. Other reasons are responsiveness, easy resource sharing, lower cost than creating a process, and scalability on multicore machines.

**Why:** A program with one thread is stuck whenever that one thread waits.

**Example:** A web server uses one thread per request. If one request waits for a disk, the other requests keep running.

**Failure:** Saying threads always make a program faster. Extra threads on one CPU only give concurrency (tasks making progress by taking turns), not parallelism (tasks running at the same instant), though they still help while another thread waits. Splitting work, balancing it and testing it is hard.

## Topic: User threads, kernel threads and the models

**Definition:** User threads are managed by a library in user space (the program's own side, outside the kernel, the core of the OS). Kernel threads are managed by the OS itself, and virtually all general-purpose systems support them. The models say how the two connect.

- Many-to-one: many user threads on a single kernel thread, so if one blocks (waits, for example for a disk), all block, and they cannot run in parallel.
- One-to-one: each user thread has its own kernel thread, giving more concurrency but with a cost per thread; Windows and Linux use this.
- Many-to-many: many user threads mapped to many kernel threads; it is not common.

**Why:** The model decides what happens when a thread blocks, and whether threads can use several CPUs.

**Example:** With the many-to-one model, 10 user threads share 1 kernel thread. One of them waits for the disk, and all 10 stop. With one-to-one, only that one stops.

**Failure:** Saying many-to-many is the best and most used. It is not very common. Pthreads is a specification (an API standard), not an implementation, so it can be built either way.

## Topic: Linux threads

**Definition:** Linux treats a thread as a task and creates it with the `clone()` system call, which lets the new task share the address space of its parent. pthreads(7) describes two Linux implementations. The old LinuxThreads (unsupported since glibc 2.4, the C library) gave each thread its own PID (process ID number). The modern NPTL (Native POSIX Thread Library) uses the one-to-one model, is based on futex (a fast kernel locking tool), and all threads share one PID.

**Why:** Many people think a Linux thread and a process are completely different things. Linux calls both tasks, and what differs is how much a new task shares with its parent.

**Example:** A Linux program starts 4 threads. Under NPTL they all report the same PID.

**Failure:** Saying each Linux thread has its own PID in modern systems. With NPTL, all threads of a process share the same PID.

## Topic: Thread pools

**Definition:** A thread pool creates a fixed number of threads at the start. They wait for work, and new tasks are handed to a free thread instead of making a new one.

**Why:** Using a ready thread is usually a little faster than creating one. It also limits the number of threads to the pool size, so a flood of requests cannot create thousands. A pool of the wrong size either leaves CPUs idle or makes tasks wait too long.

**Example:** A pool of 4 threads gets 10 tasks. Four run at the same time (on a machine with at least 4 CPUs) and 6 wait in a queue (a waiting line) until a thread is free.

**Failure:** Saying a pool always makes work faster. It does not help if the pool size does not fit the work.

## Topic: Thread safety and shared data

**Definition:** Code is thread safe when several threads can run it at the same time and still get correct results. The problem is a race condition: the result depends on the exact timing of the threads. The code that touches shared data is a critical section, and mutual exclusion means only one thread may be in it at a time. A lock (also called a mutex, short for mutual exclusion lock) gives this: a thread locks before entering and unlocks when done, and others wait.

**Why:** An update like `counter = counter + 1` is really three steps: read, add, write. A thread switch between the steps loses an update. Locks and other tools are covered in the synchronization section.

**Example:** The counter starts at 0. Two threads each do read, add one, write, once. Counting the 20 possible orders of the three steps (each thread reads, adds, then writes in that order), 18 give 1 and only the 2 one-after-the-other orders give 2. So the final value is either 1 or 2. For example, if thread 1 reads 0, thread 2 reads 0, both add 1 and both write, the result is 1, though two increments ran. Local variables on a stack are safe because they are private; the shared counter is not.

**Failure:** Saying "it works on my machine, so it is safe". A race happens only with bad timing, so tests may pass. Another mistake: locking too little. Every access to the shared data needs the same lock.

## Topic: Multithreading against multitasking

**Definition:** Multitasking means the OS switches between several processes (separate programs) so they seem to run together. Multithreading means one process has several threads. The first is about sharing the CPU between programs; the second is about the structure inside a single program. Concurrency and parallelism are as defined above; parallelism needs more than one core.

**Why:** The two differ in cost and safety: threads share memory, processes do not.

**Example:** Chrome is multiprocess: it makes a new renderer process for each website opened, so trouble in one site does not hang the whole browser. Each of those processes can have many threads inside.

**Failure:** Saying multithreading and multitasking are the same, or that concurrency and parallelism are the same. On one core you can have concurrency but not parallelism.

## Questions

### What is the difference between a process and a thread?

A process has its own address space. Threads in one process share the code, data, heap and open files, but each has its own stack, registers and program counter. A thread is cheaper to create and switch.

### Why do we use threads?

To use several CPUs at once, and so that one slow I/O does not stop the whole program. They also make sharing data easy and are cheaper than processes.

### What are the multithreading models?

Many-to-one (many user threads on one kernel thread), one-to-one (one kernel thread per user thread, used by Windows and Linux), and many-to-many (many user threads over several kernel threads, not common).

### What is a thread pool, and why use it?

A fixed set of threads waiting for tasks. It avoids the cost of creating a thread per task and caps the number of threads.

### Why does shared data need a lock?

Because two threads can mix up the read, add and write steps of an update and lose one. A lock lets only one thread in the critical section at a time.

## Mistakes

- Saying Linux modern threads have different PIDs. NPTL threads share one PID.
- Believing that if a program passes tests, a race condition is not there.

## Quiz

### Which of these does each thread have its own copy of?

- [ ] The heap
- [ ] Open files
- [x] The stack
- [ ] Global variables

Explanation: Threads share the heap, global data and open files. Each has its own stack, registers and program counter.

### Which threading model maps each user thread to its own kernel thread?

- [ ] Many-to-one
- [x] One-to-one
- [ ] Many-to-many
- [ ] Zero-to-one

Explanation: One-to-one is used by Windows and Linux. In many-to-one, one blocking thread blocks all.

### With NPTL on Linux, how many PIDs does a process with 4 threads have?

- [x] 1
- [ ] 2
- [ ] 4
- [ ] 5

Explanation: pthreads(7) says all NPTL threads share one PID. The old LinuxThreads gave each thread a separate one.

### Two threads each add 1 to a shared counter that starts at 0, with no lock. Which final values are possible?

- [ ] Only 2
- [ ] Only 1
- [x] 1 or 2
- [ ] 0, 1 or 2

Explanation: Of the 20 possible orders of the three steps, 18 give 1 and only the 2 one-after-the-other orders give 2. If both read 0 before either writes, the result is 1.

### What is the main benefit of a thread pool?

- [ ] It removes the need for locks
- [x] It reuses threads and caps their number
- [ ] It makes every task run at the same instant
- [ ] It gives each thread its own address space

Explanation: A pool saves creation time and caps the thread count. It does not remove races.

## Diagram

```json
{ "kind": "layers", "caption": "Inside one process: the top layer is shared by all threads, the bottom layer is private to each thread.", "layers": [{ "label": "Shared by all threads: code, global data, heap, open files, process ID" }, { "label": "Private to each thread: stack, registers, program counter, thread ID" }] }
```
