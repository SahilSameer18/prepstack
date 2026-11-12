---
id: os-cpu-scheduling
title: CPU Scheduling
next: os-synchronization
roadmapSteps: backend:os-networking-basics, devops-cloud:linux-command-line
---

<!-- Draft 12 Nov 2026, not published. Written from docs/content/source-notes/os-oops-phase1.md. Numbers from docs/content/checks/os-check.py. -->

## Overview

A computer has more programs waiting to run than it has CPU cores (the parts that run instructions). CPU scheduling is the operating system's rule for deciding which waiting program gets the CPU next, and for how long. Questions in this area cover the algorithms (first come first served, shortest job first, round robin, priority) and their weak points: the convoy effect (short jobs stuck behind a long one), starvation (a job never gets its turn) and the time quantum (the slice of CPU time each job gets). After this section you can work out waiting time on paper and compare the algorithms. Job times in the examples are made up.

## Topic: Criteria, preemption and the dispatcher

**Definition:** The CPU scheduler picks one process from the ready queue (the line of processes that are ready to run). We judge it by: CPU utilization (how busy the CPU is kept), throughput (processes finished per unit of time), turnaround time (finish time minus arrival time), waiting time (time spent in the ready queue) and response time (time from arrival until the process first runs; the textbook says until the first response is produced, the same idea when the process answers on its first turn).

Scheduling is non-preemptive (a process keeps the CPU until it finishes or starts waiting) or preemptive (the system can take the CPU away, for example when a timer goes off). The dispatcher hands the CPU to the chosen process by doing a context switch (saving one process's state and loading another's).

**Why:** No single number is best, so each algorithm below wins on one criterion and loses on another.

**Example:** A job arrives at time 2, starts running at time 5 and finishes at time 11. Turnaround = 11 - 2 = 9. Response = 5 - 2 = 3. If it needs 6 units of CPU, waiting = 9 - 6 = 3 (when the job does no I/O, waiting is turnaround minus CPU time).

**Failure:** Saying "modern systems are non-preemptive". Virtually all modern systems, including Windows, macOS, Linux and UNIX, use preemptive scheduling.

## Topic: First come, first served (FCFS) and the convoy effect

**Definition:** FCFS runs processes in the order they arrive and never preempts. It is simple. Its weakness is the convoy effect: short processes queue behind one long process, like small shopping carts stuck behind one huge cart.

**Why:** Average waiting time depends on arrival order, and FCFS cannot fix a bad order.

**Example:** Example A: P1 needs 24, P2 needs 3, P3 needs 3, all arrive at time 0. Order P1, P2, P3: waits are 0, 24, 27, so the average waiting time is (0 + 24 + 27) / 3 = 17.0 and the average turnaround is (24 + 27 + 30) / 3 = 27.0. Order P2, P3, P1: waits 0, 3, 6, average 3.0.
Example B (arrival time / burst, where burst is the CPU time needed): P1 0/8, P2 1/4, P3 2/9, P4 3/5. FCFS gives waits 0, 7, 10, 18, an average of 8.75.

**Failure:** Calling the convoy effect starvation. FCFS never starves a job; the problem is a long wait behind a long job.

## Topic: Shortest job first (SJF) and shortest remaining time first (SRTF)

**Definition:** SJF runs the process with the shortest next CPU burst (the stretch of CPU time it will use before it next waits). When all the processes are ready at the same time, SJF gives the smallest average waiting time. When processes arrive at different times, as in example B, the preemptive version, SRTF, does better (6.5 against 7.75): when a new process arrives the choice is made again, and a newcomer with less time left than the running one takes over.

**Why:** Running short jobs first stops them waiting behind long ones.

**Example:** Example A under SJF runs P2, P3, P1: average wait 3.0, against 17.0. In example B, non-preemptive SJF runs P1 (0 to 8), then P2, P4, P3, with waits 0, 7, 9, 15, an average of 7.75. SRTF runs P1 0 to 1, P2 1 to 5, P4 5 to 10, P1 10 to 17, P3 17 to 26. Waits: P1 9, P2 0, P3 15, P4 2, so the average is 26 / 4 = 6.5.

**Failure:** The operating system does not know the next burst, it can only estimate it, commonly by exponential averaging (guessing the next value by mixing the newest value with the older guess): new estimate = a x last real burst + (1 - a) x old estimate, where a is a number between 0 and 1, often one half. With old estimate 10, last real burst 6 and a = 1/2: 0.5 x 6 + 0.5 x 10 = 8.

## Topic: Round robin (RR) and the time quantum

**Definition:** Each process gets a small slice of CPU time, the time quantum q (usually 10 to 100 milliseconds). When it ends, a timer interrupt (a signal from the hardware clock) preempts the process and puts it at the back of the ready queue. With n processes, no process waits more than (n - 1) x q before its next turn.

**Why:** Every process gets quick turns, so interactive programs respond fast.

**Example:** Example A with q = 4: P1 runs 0 to 4, P2 4 to 7, P3 7 to 10, then P1 runs alone 10 to 30. Waits are 4 (P2), 7 (P3), 6 (P1), average 5.67. Example B with q = 4: average waiting 11.75 but average response 4.5, against 8.75 (FCFS) and 7.75 (SJF), where response equals waiting. So RR is worse on waiting and better on response.
Quantum trade-off, with a switch cost of 1 time unit: q = 1 wastes 1 / (1 + 1) = 50% of the time, q = 4 wastes 1 / 5 = 20%, q = 20 wastes 1 / 21, about 4.8%. A huge q behaves like FCFS.

**Failure:** Saying a smaller quantum is always better. Context switches are pure overhead.

## Topic: Priority scheduling, starvation and aging

**Definition:** Each process has a priority number and the CPU goes to the highest priority. Here a smaller number means a higher priority (other systems may do the opposite). Low-priority processes can starve (wait a very long or unlimited time) if high-priority ones keep arriving. Aging fixes it by slowly raising the priority of a process the longer it waits.

**Why:** Some work matters more, such as system tasks over a background download.

**Example:** All arrive at 0, non-preemptive, lower number is higher priority. P1 burst 10 priority 3, P2 burst 1 priority 1, P3 burst 2 priority 4, P4 burst 1 priority 5, P5 burst 5 priority 2. Order P2, P5, P1, P3, P4. Waits 0, 1, 6, 16, 18, total 41, average 41 / 5 = 8.2.

**Failure:** Priorities without aging: a steady stream of high-priority jobs keeps a low-priority job waiting forever.

## Topic: Multilevel queue and multilevel feedback queue

**Definition:** A multilevel queue (MLQ) splits the ready queue into several queues, for example one per type of process. A multilevel feedback queue (MLFQ) lets a process move between queues based on how it behaves. The basic rules, from the OSTEP textbook (Operating Systems: Three Easy Pieces): the highest queue runs first; equal priority runs round robin; a new job starts in the top queue; a job moves down one queue once it has used up its total time allowance at that level, even if it gave up the CPU many times (this stops cheating with tiny input or output calls); and after some period S all jobs move back to the top queue, called the priority boost.

**Why:** MLFQ learns from behavior without knowing job length: short and interactive jobs stay high, long CPU-heavy jobs sink but still get a turn after the boost.

**Example:** Three queues: Q0 is RR with q = 8 ms, Q1 is RR with q = 16 ms, Q2 is FCFS. A 30 ms job gets 8 ms in Q0, 16 ms in Q1 (24 ms in total), and finishes its last 6 ms in Q2.

**Failure:** Forgetting the boost: a long job can starve under a steady stream of short jobs.

## Topic: Multiprocessor scheduling and Linux

**Definition:** With several CPUs, each processor schedules itself, from one common ready queue or from its own private queue. A single queue needs locking, which scales badly as CPUs are added, and it can lose cache affinity (a process runs faster where its recently used data is still in the CPU's cache, a small fast memory). Private queues scale better and keep affinity, but can leave one CPU idle while another is overloaded, so load balancing moves tasks between CPUs.

**Why:** Moving a task to balance load throws away its cache contents.

**Example:** Linux used CFS (Completely Fair Scheduler) from kernel 2.6.23 and began moving to EEVDF (Earliest Eligible Virtual Deadline First, a newer fairness rule) in 6.6. CFS runs the task with the smallest virtual run time (a count of the CPU time it has had) next. Which scheduler a given system runs depends on its kernel version, so name the version.

**Failure:** Answering "one queue is simplest, so best". It becomes a lock bottleneck as CPUs grow.

## Questions

### Compare FCFS, SJF and round robin using numbers.

With bursts 24, 3, 3: FCFS in that order gives an average wait of 17.0 (convoy effect). SJF gives 3.0 but needs the burst lengths in advance. Round robin with q = 4 gives 5.67, with quick first turns.

### How do you choose the time quantum in round robin?

Large compared with the context switch time, but small enough for good response. Too large turns into FCFS; too small wastes time switching.

### What are starvation and aging?

Starvation: a low-priority process never gets the CPU. Aging: raise its priority as it waits.

### What is a multilevel feedback queue?

Several queues, highest first. A new job starts at the top and moves down when it uses up its allowance, so short jobs stay high. A periodic boost to the top stops long jobs starving.

### What does the Linux scheduler use?

Linux used CFS from kernel 2.6.23 and began moving to EEVDF in 6.6. Which scheduler a given system runs depends on its kernel version, so I would name the version.

## Mistakes

- Saying SJF can be built exactly. The next burst can only be estimated.
- Saying "Linux uses CFS" without a version. Linux used CFS from kernel 2.6.23 and began moving to EEVDF in 6.6.

## Quiz

### Processes P1, P2, P3 with bursts 24, 3, 3 arrive together and run FCFS in that order. What is the average waiting time?

- [ ] 3.0
- [ ] 8.5
- [x] 17.0
- [ ] 27.0

Explanation: The waits are 0, 24 and 27, total 51, and 51 / 3 = 17.0. 27.0 is the average turnaround, not the waiting time.

### In example B (P1 0/8, P2 1/4, P3 2/9, P4 3/5), which algorithm gives the smallest average waiting time?

- [ ] FCFS at 8.75
- [ ] Non-preemptive SJF at 7.75
- [x] SRTF at 6.5
- [ ] Round robin with q = 4 at 11.75

Explanation: SRTF can switch to a newly arrived short job, so it beats SJF, FCFS and RR here.

### What happens to round robin as the time quantum becomes very large?

- [ ] It becomes priority scheduling
- [x] It behaves like FCFS
- [ ] It becomes SJF
- [ ] It starts to starve processes

Explanation: Each process finishes in its first turn, which is the FCFS order.

### Which technique fixes starvation in priority scheduling?

- [ ] Raising the time quantum
- [ ] Context switching more often
- [x] Aging, which slowly raises the priority of a waiting process
- [ ] Running the longest job first

Explanation: A waiting process eventually becomes the highest priority.

### Which statement about Linux scheduling is correct?

- [ ] Linux has always used EEVDF
- [ ] Linux began moving from CFS to EEVDF in kernel 2.6.23
- [x] Linux used CFS from kernel 2.6.23 and began moving to EEVDF in 6.6
- [ ] Linux scheduling is non-preemptive

Explanation: Which scheduler a system runs depends on its kernel version.

## Diagram

```json
{ "kind": "layers", "caption": "An example multilevel feedback queue: new jobs start at the top, and a job that uses up its time at a level moves down one level.", "layers": [{ "label": "Q0: round robin, quantum 8 ms (new jobs start here)" }, { "label": "Q1: round robin, quantum 16 ms" }, { "label": "Q2: first come, first served" }] }
```
