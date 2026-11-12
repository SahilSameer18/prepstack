---
id: os-deadlocks
title: Deadlocks
next: os-memory-management
roadmapSteps: java-spring:java-concurrency-basics
---

<!-- Draft 12 Nov 2026, not published. Written from docs/content/source-notes/os-oops-phase1.md. Numbers from docs/content/checks/os-check.py. -->

## Overview

A deadlock is a standstill: several threads (separate lines of work inside one program) each hold something and each wait for something another one holds, so none can move. Interviewers ask you to name the four conditions, tell the ways to handle it apart, and run the Banker's algorithm (a method that checks, before granting a request, that everyone can still finish) on a small table. The examples use made-up numbers unless a source is named.

After this section you can state the four conditions, say which one each prevention method breaks, find a safe sequence by hand, and explain how deadlock differs from starvation and livelock.

## Topic: Deadlock and its four conditions

**Definition:** A deadlock is a state where every thread in a group waits for a resource (something a thread needs, such as a lock, a file or a device) that another thread in the group holds. A lock lets one thread at a time into a protected piece of code. Deadlock can happen only when all four conditions hold at once. Mutual exclusion: only one thread can use the resource at a time. Hold and wait: a thread keeps what it has while it waits for more. No preemption (taking back by force): a resource is released only when its holder chooses to release it. Circular wait: the threads form a ring in which each waits for the next one's resource.

**Why:** The four conditions are a checklist. Make any one impossible and deadlock cannot happen.

**Example:** Two locks, L1 and L2. Thread A takes L1, then wants L2. Thread B takes L2, then wants L1. If A takes L1 and B takes L2 before either asks for the second lock, both wait forever. All four conditions are present: a lock is exclusive, each holds one while waiting for the other, nobody can take a lock away, and A waits for B who waits for A.

**Failure:** Listing three conditions or merging two. Hold and wait is one thread keeping something while it waits; circular wait is the ring across threads. Deadlock also needs unlucky timing, so testing may not find it.

## Topic: Resource-allocation graph

**Definition:** A resource-allocation graph is a drawing with a circle for each thread and a box for each resource, with a dot in the box for each instance (each identical copy of the resource). An arrow from a thread to a resource means "waiting for it". An arrow from a resource to a thread means "this thread holds it". With no cycle (a path that comes back to its start) there is no deadlock. A cycle with one instance per resource is a deadlock. A cycle with several instances only means deadlock is possible.

**Why:** It shows a deadlock at a glance.

**Example:** R1 has two instances, R2 has one. T2 holds one instance of R1 and wants R2. T1 holds R2 and wants R1. T3 holds the other instance of R1 and wants nothing. The cycle T1, R1, T2, R2, T1 exists, yet there is no deadlock: T3 finishes and releases its instance of R1, T1 gets it and finishes, and then R2 is freed for T2. With R1 a single instance held by T2, the same cycle is a real deadlock.

**Failure:** Saying "a cycle always means deadlock". That is true only when each resource has one instance.

## Topic: Prevention (break one condition)

**Definition:** Prevention designs the system so that one of the four conditions can never hold.
- Mutual exclusion: share the resource when it can be shared (many threads can read one read-only file). Not possible for things that must be exclusive.
- Hold and wait: ask for everything at the start, or ask only when holding nothing.
- No preemption: a thread that cannot get something releases everything it holds and starts again.
- Circular wait: number every resource and require threads to ask in increasing order (lock ordering).

**Why:** Asking for everything at once leaves resources idle and can starve (keep waiting forever) a thread that needs a popular resource. Lock ordering costs almost nothing while the program runs, so the OSTEP textbook (Operating Systems: Three Easy Pieces) calls it probably the most practical method.

**Example:** Hold and wait broken by asking for all locks first: a thread needs L1 and L2. It takes a guard lock G, takes L1, takes L2, then releases G. The cost: it must know all its locks in advance and holds them from the start, which lowers concurrency (work done at the same time).

Lock ordering: if both threads take L1 first and L2 second, B cannot hold L2 while waiting for L1. A total order ranks every lock; a partial order ranks only some (OSTEP's Linux example has groups of orders). A function given two locks can fix the order by comparing their addresses (places in memory).

**Failure:** Saying prevention is cheap. Breaking hold and wait wastes resources, and taking a resource back is impossible for something like a printer in the middle of a job. Ordering is only a convention: one careless piece of code brings the deadlock back.

## Topic: Avoidance and the Banker's algorithm

**Definition:** Avoidance does not remove any of the four conditions by design; instead, before granting each request the system checks that it can still finish everyone; if not, the thread waits. Each thread must declare its maximum need in advance. A state is safe if some order (a safe sequence) lets every thread get its remaining need, finish and give everything back. A safe state means no deadlock. An unsafe state means deadlock is possible, not that it has happened. The Banker's algorithm does the check: Allocation is what a thread holds, Max the most it will ask for, Available what is free, and Need = Max minus Allocation. Repeatedly find a thread whose Need fits in Available, let it finish, and add its Allocation back.

**Why:** OSTEP says avoidance is useful only where all tasks and their needs are known in advance, such as some embedded systems (small computers built into devices).

**Example:** The textbook example, checked with a program. Resources A, B, C have 10, 5 and 7 instances. Available is (3,3,2).

| Process | Allocation | Max | Need |
|---|---|---|---|
| P0 | 0,1,0 | 7,5,3 | 7,4,3 |
| P1 | 2,0,0 | 3,2,2 | 1,2,2 |
| P2 | 3,0,2 | 9,0,2 | 6,0,0 |
| P3 | 2,1,1 | 2,2,2 | 0,1,1 |
| P4 | 0,0,2 | 4,3,3 | 4,3,1 |

A safe sequence is P1, P3, P0, P2, P4. Available goes (3,3,2), (5,3,2), (7,4,3), (7,5,3), (10,5,5), (10,5,7).

P1 asks for (1,0,2). It fits its Need and Available, and the state stays safe, so it is granted.

From the original table, P4 asks for (3,3,0). It fits P4's Need and Available, but Available would become (0,0,2) and no process could finish. The state is unsafe, so P4 must wait.

**Failure:** Thinking an unsafe state is a deadlock. It is a state the system refuses to enter.

## Topic: Detection, recovery and ignoring the problem

**Definition:** Detection lets deadlocks happen and then looks for them. With single-instance resources the system keeps a wait-for graph (threads only, an arrow means "waits for") and looks for a cycle. With several instances it runs a table check like the Banker's safety check on what each thread currently requests; a thread that cannot finish is deadlocked. Recovery: abort (stop) all deadlocked processes, abort one at a time until the cycle breaks, or take resources from a victim (the one chosen to lose) and roll it back (return it to an earlier saved state). Ignoring the problem means doing nothing.

**Why:** OSTEP says many database systems run a detector from time to time, and that for rare deadlocks restarting is a practical answer, like restarting a computer that froze once a year.

**Example:** In the course table of five processes and three resource types, the check finds a finishing order, so there is no deadlock. After one extra request, four processes cannot finish, and those four are deadlocked.

**Failure:** A victim chosen again and again starves, so past rollbacks are added to the cost. Running the detector at random times can show many cycles, so you cannot tell which thread caused it. The Java language rules (JLS 17) say Java neither prevents nor requires detection of deadlock.

## Topic: Deadlock, starvation and livelock

**Definition:** In a deadlock, nobody moves and nothing changes. In starvation, one thread waits a very long time, or forever, while the system as a whole keeps working. In livelock, threads keep running and changing state but make no progress, like two people in a corridor who both step aside the same way again and again.

**Why:** The fixes differ: prevention, avoidance or detection for deadlock; fair rules for starvation; a way to break the repeating pattern for livelock.

**Example:** Starvation: with priority scheduling (highest priority first), a low-priority process may never run while higher ones keep arriving. The fix is aging (slowly raising a process's priority the longer it waits). Livelock: OSTEP's trylock code (trylock tries a lock and returns at once if it is taken) takes L1, tries L2, and if that fails releases L1 and starts over. Two threads doing this together can repeat forever. The fix is a random wait before retrying.

**Failure:** Calling every stuck program a deadlock. Ask: all blocked (deadlock), running but useless (livelock), or only one thread left out (starvation)?

## Questions

### What are the four conditions for deadlock?

Mutual exclusion, hold and wait, no preemption and circular wait. All four must hold together; break any one and deadlock cannot occur.

### What is the difference between deadlock prevention and avoidance?

Prevention makes one of the four conditions impossible by design, for example by ordering locks. Avoidance does not remove any condition by design. It checks each request and grants it only if the state stays safe, so a circular wait never forms.

### How do you handle deadlock in practice?

Take locks in a fixed order, which avoids circular wait. Databases often detect deadlocks and recover. For rare deadlocks, restarting can be accepted.

## Mistakes

- Saying a cycle in a resource-allocation graph always means deadlock. It does only when every resource has a single instance.
- Saying an unsafe state is the same as a deadlock. Unsafe means deadlock is possible, not that it has happened.
- Saying the Banker's algorithm is how real systems handle deadlock. It suits only places where all needs are known in advance.

## Quiz

### Which set lists the four necessary conditions for deadlock?

- [ ] Mutual exclusion, starvation, no preemption, circular wait
- [x] Mutual exclusion, hold and wait, no preemption, circular wait
- [ ] Mutual exclusion, hold and wait, preemption, circular wait
- [ ] Hold and wait, aging, no preemption, circular wait

Explanation: Starvation and aging are different topics, and preemption would remove a condition.

### In a resource-allocation graph, when does a cycle prove a deadlock?

- [ ] Always
- [ ] When there are two threads
- [x] When every resource type in the cycle has a single instance
- [ ] When there are more than three threads

Explanation: With several instances, a thread outside the cycle may release one.

### With Available (3,3,2), P4 has Need (4,3,1) and asks for (3,3,0). What is the result?

- [ ] Granted: the state stays safe
- [ ] Refused: more than P4's Need
- [x] P4 must wait: unsafe state
- [ ] Refused: more than Available

Explanation: (3,3,0) is within Need and Available, but afterwards Available is (0,0,2) and no process can finish.

### Which prevention method is called the most practical one?

- [ ] Asking for all resources at the start
- [ ] Taking resources back from threads
- [x] Taking locks in a fixed order
- [ ] Making every resource shareable

Explanation: It removes circular wait at almost no cost. The others waste resources or are impossible for exclusive ones.

### Two threads each take L1, try L2, release L1 if L2 is busy, and retry at the same moment, over and over. What is this?

- [ ] Deadlock
- [x] Livelock
- [ ] A safe state
- [ ] Aging

Explanation: The threads keep running but make no progress.

## Diagram

```json
{ "kind": "graph", "caption": "Deadlock as a cycle: thread A holds lock L1 and waits for L2, thread B holds L2 and waits for L1. Each lock has one instance, so the cycle is a real deadlock.", "nodes": [{ "id": "a", "label": "Thread A", "x": 12, "y": 50 }, { "id": "l1", "label": "Lock L1", "x": 50, "y": 15 }, { "id": "b", "label": "Thread B", "x": 88, "y": 50 }, { "id": "l2", "label": "Lock L2", "x": 50, "y": 85 }], "edges": [{ "from": "l1", "to": "a", "label": "held by" }, { "from": "a", "to": "l2", "label": "waits for" }, { "from": "l2", "to": "b", "label": "held by" }, { "from": "b", "to": "l1", "label": "waits for" }] }
```
