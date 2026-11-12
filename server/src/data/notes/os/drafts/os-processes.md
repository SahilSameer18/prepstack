---
id: os-processes
title: Processes
next: os-threads
roadmapSteps: devops-cloud:linux-command-line
---

<!-- Draft 12 Nov 2026, not published. Written from docs/content/source-notes/os-oops-phase1.md. Numbers from docs/content/checks/os-check.py. -->

## Overview

A process is a program that is running. The OS (operating system, the main software that runs the computer) keeps a record for each process and switches the CPU (the chip that runs instructions) between processes many times a second. Questions cover states, the process control block (PCB, that record), the context switch, fork and exec (make a process, swap its program), zombie and orphan processes (leftover finished children), and copy-on-write (copy memory only when changed). Example numbers are made up.

After this section you can explain each of these, draw the state diagram, and work out how many processes a chain of fork calls creates.

## Topic: Program against process

**Definition:** A program is a passive file on disk (an executable file). A process is that program in execution, an active thing. A process has code (the text section), global variables (the data section), the heap (memory handed out while the program runs), the stack (temporary data such as function arguments, return addresses and local variables), plus the program counter (which marks the next instruction) and the CPU registers.

**Why:** The OS must track the running state, not just the file, because one program can run several times at once.

**Example:** Two users start the same editor. There is one file on disk but two processes, each with its own stack, data and place in the code.

**Failure:** Saying "a process is a program". One program can be several processes, and a program that is not running is not a process.

## Topic: Process states

**Definition:** The slides name five states: new (being created), ready (waiting for a CPU), running (instructions are executing), waiting or blocked (waiting for an event, such as a disk read), and terminated (finished). The OSTEP textbook (Operating Systems: Three Easy Pieces) uses the three main ones: running, ready, blocked. Moves: new to ready when admitted; ready to running when the scheduler (the part of the OS that picks the next process) picks it; running to ready when its turn ends; running to blocked when it starts I/O (input or output, like reading a file); blocked to ready when the I/O finishes; running to terminated when it exits.

**Why:** The OS gives the CPU only to ready processes, so a process waiting for the disk wastes no CPU time.

**Example:** Process 0 runs for 3 time units, then starts a disk read and becomes blocked. Process 1 runs meanwhile. When the read finishes, process 0 goes to ready, not straight to running.

**Failure:** Saying blocked goes straight to running. It always goes to ready first, then waits for the scheduler. The five-state and three-state models are both correct; say which one you use.

## Topic: Process control block

**Definition:** The process control block (PCB, also called a task control block) is the record the OS keeps for each process. It holds the process state, program counter, CPU registers, scheduling information (such as priority), memory-management information (where the process's memory is), accounting information (CPU time used), and I/O status (open files and devices). The list of all these records is called the process list.

**Why:** A stopped process saves its state in its PCB, so it can carry on exactly where it left off.

**Example:** In Linux the PCB is a C structure called `task_struct`. It holds the process identifier, the state, a pointer to the parent, the list of children, open files and the address space (the memory the process may use).

**Failure:** Saying the PCB holds the program's code and data. It holds what is needed to resume the process; the memory part only describes the process's memory.

## Topic: Context switch

**Definition:** A context switch is the moment the OS stops one process and starts another. It saves the old process's registers and program counter into its PCB (or onto the kernel stack, a private area of memory the kernel keeps for each process), loads the saved values of the new one, and returns into the new process. It may start with a system call (a request from a program to the OS) or with a timer interrupt (a signal from the clock that gives the OS control back).

**Why:** It lets a few CPUs run many processes. It is also pure overhead, because the system does no useful work while switching. A more complex OS and PCB make it slower.

**Example:** Process A is running. The timer fires and the hardware saves A's registers and enters the kernel. The OS saves A's state, loads B's, and returns, so B runs. If a switch took 1 unit and a turn lasted 9 units, one tenth of the time would be lost.

**Failure:** Saying a context switch only happens on I/O. It also happens on a timer interrupt when the process has used its turn.

## Topic: Creating processes with fork, exec and wait

**Definition:** In POSIX systems (the standard Unix-like interface, including Linux), `fork()` creates a new process that is an almost exact copy of the caller. Parent and child both continue after the `fork()` line. The parent gets the child's PID (process identifier, a number); the child gets 0. The child has its own memory (a copy made lazily; see copy-on-write), registers and program counter.

`exec` (the Linux call is `execve`) replaces the running program of the calling process with a new one; it creates no new process, and the PID and open files stay (unless they were marked to close when a new program starts). `wait()` makes the parent pause until a child ends and returns its exit status (a number saying how it ended).

**Why:** Keeping fork and exec apart lets a shell (the program that reads your typed commands) do work between them in the child, such as pointing the output to a file, before the new program starts.

**Example:** This is the POSIX/Linux way (Windows creates processes with CreateProcess); the code is not run here.

```c
pid_t rc = fork();
if (rc == 0) { execvp("wc", args); }   /* child becomes wc */
else { wait(NULL); }                   /* parent waits */
```

Counting processes: every `fork()` call doubles the number of processes. After 1 call there are 2, after 2 calls 4, after 3 calls 8, after 4 calls 16. So n calls in a row, with no conditions, give 2^n processes in total and 2^n - 1 children. Which of parent and child prints first is not fixed.

**Failure:** Saying fork runs the child from `main()`. The child starts at the return of `fork()`. Check yourself: `fork(); fork(); printf("hi");` prints four lines, because two forks give 4 processes, but their order can change.

## Topic: Zombie and orphan processes

**Definition:** A zombie is a child that has ended but whose parent has not yet called `wait()`. The kernel keeps its PID, exit status (how it ended) and a process-table slot (a place in the list of processes) so the parent can still read the result. An orphan is a child whose parent has ended first. On Linux, when a parent ends, its remaining children, including zombies, are adopted by `init` (the first process the system starts) or by the nearest subreaper (a process set up to take over such children), which calls wait on them to clean them up (reap them).

**Why:** The zombie state lets a parent learn the exit status. Without reaping, finished children keep using process-table slots.

**Example:** A parent forks 3 children and sleeps without ever calling `wait()`. When the children finish, there are 3 zombie entries, until the parent waits or itself ends.

**Failure:** Saying a zombie is still running. It has finished; only the kernel's record remains until it is reaped.

## Topic: Copy-on-write

**Definition:** Copy-on-write (COW) means the parent and child share the same memory pages (blocks of memory) at first, and a page is copied only when one of them writes to it. The man page `fork(2)` says parent and child run in separate memory spaces and that Linux implements `fork()` with copy-on-write pages. The cost of fork is then only copying the page tables (the maps from addresses to memory) and creating a task structure (Linux's record for a process).

**Why:** Copying all memory on every fork is slow, especially when the child calls exec and throws the copy away.

**Example:** A parent has 1,000 pages. It forks, and the child runs exec at once. With COW almost no page is copied. Without it, 1,000 pages would be copied and then discarded.

**Failure:** Saying fork copies nothing. Page tables and a task structure are still created, and a shared page is copied when either side writes to it.

## Questions

### What is the difference between a program and a process?

A program is a passive file on disk. A process is that program running, with its own memory, registers and state. One program can be many processes.

### Draw and explain the process states.

New, ready, running, waiting (blocked) and terminated. The scheduler moves ready to running; running goes back to ready when its turn ends, or to blocked when it waits for I/O; blocked goes to ready when the I/O is done.

### What does a context switch do and why is it costly?

It saves the running process's registers and program counter, loads the next one's, and returns into it. It is pure overhead, because no useful work is done meanwhile.

### What do fork, exec and wait do?

Fork makes a near copy of the caller; the parent gets the child's PID, the child gets 0. Exec replaces the program in the calling process. Wait pauses the parent until a child ends.

### What is the difference between a zombie and an orphan process?

A zombie is a finished child nobody has waited for yet. An orphan is a child whose parent has ended. On Linux, when a parent ends, its remaining children, including zombies, are adopted by init or the nearest subreaper, which calls wait on them.

## Mistakes

- Saying exec creates a new process. It replaces the program; the PID stays.
- Saying a zombie and an orphan are the same. A zombie is removed only when its parent, or the process that adopts it, calls wait.
- Saying three forks in a row give 3 or 6 processes. They give 2^3 = 8.

## Quiz

### What value does `fork()` return in the child process?

- [ ] The PID of the parent
- [ ] The PID of the child
- [x] 0
- [ ] -1

Explanation: The parent receives the new child's PID and the child receives 0.

### A program calls `fork()` three times in a row with no conditions. How many processes exist in total at the end?

- [ ] 3
- [ ] 6
- [x] 8
- [ ] 9

Explanation: Each fork doubles the count: 2, 4, 8.

### Which transition is NOT possible in the usual process state diagram?

- [ ] Running to ready
- [ ] Running to blocked
- [x] Blocked to running
- [ ] Blocked to ready

Explanation: When the event ends, a blocked process goes to ready and waits for the scheduler. It never goes straight to running.

### What does the Linux man page say about how fork copies memory?

- [ ] It copies every page at once
- [x] Copy-on-write: pages are copied only when written to
- [ ] Parent and child share one memory space forever
- [ ] The child never gets its own memory

Explanation: The man page says parent and child run in separate memory spaces, and Linux defers the copying with copy-on-write. The main cost is copying page tables and creating a task structure.

### What is a zombie process?

- [ ] A process whose parent has ended
- [ ] A process stuck in an infinite loop
- [x] A finished child whose parent has not yet called wait
- [ ] A process using all the CPU

Explanation: A child whose parent ended first is an orphan.

## Diagram

```json
{ "kind": "graph", "caption": "Process states and the moves between them.", "nodes": [{ "id": "new", "label": "New", "x": 8, "y": 50 }, { "id": "ready", "label": "Ready", "x": 35, "y": 50 }, { "id": "running", "label": "Running", "x": 65, "y": 50 }, { "id": "blocked", "label": "Blocked", "x": 50, "y": 90 }, { "id": "done", "label": "Terminated", "x": 92, "y": 50 }], "edges": [{ "from": "new", "to": "ready", "label": "admitted" }, { "from": "ready", "to": "running", "label": "scheduled" }, { "from": "running", "to": "ready", "label": "turn over" }, { "from": "running", "to": "blocked", "label": "waits for I/O" }, { "from": "blocked", "to": "ready", "label": "I/O done" }, { "from": "running", "to": "done", "label": "exit" }] }
```
