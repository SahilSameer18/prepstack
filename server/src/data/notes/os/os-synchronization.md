---
id: os-synchronization
title: Process Synchronization
lastChecked: 2026-11-12
next: os-deadlocks
roadmapSteps: java-spring:java-concurrency-basics, backend:os-networking-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and os-drafts.md. Numbers computed by docs/content/checks/os-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

Synchronization is how programs that share data take turns so the data stays correct. Without it, two threads (separate paths of execution inside one program) updating one number can lose an update. Synchronization is a large topic in common OS question lists: the race condition, the critical section (the code that touches shared data) and its three requirements, locks, semaphores (counters that make a process wait), monitors (code that lets one process in at a time), and the classic problems. After this section you can trace a race, state the three requirements and work a semaphore trace by hand.

## Topic: Race condition

**Definition:** A race condition is a bug where the result depends on the exact order in which processes or threads run their steps. The cause is a step that looks like one action but is really several. The statement counter = counter + 1 is three steps: read the counter, add 1, write it back.

**Why:** The operating system can stop a thread between any two steps, so shared data can be read while half updated.

**Example:** The counter starts at 0 and two threads each add 1, so the right answer is 2. Thread A reads 0. Thread B reads 0. A writes 1. B writes 1. The final value is 1, one update is lost. If A finishes before B starts, the answer is 2. Counting the 20 possible orders of the three steps (each thread reads, adds, then writes in that order), 18 give 1 and only the 2 one-after-the-other orders give 2.

**Failure:** Saying "the chance is tiny, so ignore it". A bug seen once in a million runs is still a bug, and hard to reproduce.

## Topic: The critical section and its three requirements

**Definition:** The critical section is the part of a process's code that touches shared data. Each process has an entry section (asks permission), the critical section, an exit section, and a remainder section (everything else). A correct solution meets three requirements. Mutual exclusion: only one process is inside its critical section at a time. Progress: if nobody is inside and some processes want in, only those processes take part in choosing who enters next, and the choice cannot be put off forever. Bounded waiting: after a process asks to enter, there is a limit on how many times others may enter first.

**Why:** Mutual exclusion removes the race. Progress and bounded waiting stop the fix from freezing the system or starving (never letting in) one process.

**Example:** Switching off interrupts (the signals that let the system change which process is running) in the entry section looks easy, but it fails with two CPUs and can let some processes starve.

**Failure:** A solution that gives mutual exclusion but not progress. If a process that has no interest in entering still blocks the other (strict taking of turns), the other waits forever.

## Topic: Peterson's solution

**Definition:** A two-process software solution. The processes share a variable turn (whose turn it is) and an array flag with one entry per process (true means "I want in"). To enter, a process sets its own flag, gives the turn to the other, and waits as long as the other's flag is set and it is the other's turn. When done, it clears its flag. It meets all three requirements, assuming reading or writing one memory location happens in a single step.

**Why:** It shows mutual exclusion is possible with plain variables. A version with only turn forces strict alternation: if one process never wants in, the other waits forever.

**Example:** P0 and P1 both want in. P0 sets flag[0] and turn = 1. P1 then sets flag[1] and turn = 0. Now turn is 0, so P1 is the one that waits and P0 enters.

**Failure:** It is not guaranteed to work on modern computer designs, because processors and compilers may reorder operations that look independent. Fixing this needs a memory barrier (an instruction that forces earlier writes to become visible to other processors first). Real code uses locks.

## Topic: Locks, mutex, spinlock and blocking locks

**Definition:** A mutex lock (mutual exclusion lock) has two operations, acquire and release, both atomic (indivisible). A process acquires the lock before the critical section and releases it after. It is built on an atomic hardware instruction such as test-and-set (set the flag to true and return the old value, in one step) or compare-and-swap (change a value only if it has the expected old value). If the waiting is done by looping and checking, it is called busy waiting and the lock is a spinlock. A blocking lock puts the waiting thread to sleep in a queue instead, so it uses no CPU while waiting.

**Why:** A lock gives programmers a simple acquire and release instead of raw hardware instructions.

**Example:** The lock flag starts false. P1 runs test-and-set: it gets back false (the old value) and the flag is now true, so P1 enters. P2 runs test-and-set: it gets back true, so it keeps looping. When P1 exits it sets the flag to false, and P2 enters. A simple spin lock gives mutual exclusion but no fairness: a thread may spin forever when many want the lock.

**Failure:** Spin locks and priority can hang the system (priority inversion). A low-priority thread holds a spin lock and is stopped, and a high-priority thread spins forever waiting for it. Priority inheritance (the waiter lends its priority to the holder) is one fix. A spinlock suits very short waits on several CPUs; a blocking lock suits longer waits.

## Topic: Semaphores

**Definition:** A semaphore is an integer variable changed only by two atomic operations: wait (also written P) and signal (also written V). Wait decreases the value, and if the value was already 0 the caller sleeps until another process signals. Signal increases it and wakes one waiting process. A counting semaphore can take any integer value, so it counts free units (a blocking implementation may show the waiting ones as negative). A binary semaphore holds only 0 or 1 and acts as a mutex lock. The initial value decides the behavior: 1 makes it a lock, 0 makes "A must happen before B" (B waits, A signals).

**Why:** A semaphore handles both exclusion and ordering, and the waiting is a sleep, not a spin.

**Example:** Producer-consumer with a buffer of 3 slots. Semaphores: empty = 3 (free slots), full = 0 (filled slots), and a mutex = 1 to protect the buffer. The producer does wait(empty), wait(mutex), adds the item, signal(mutex), signal(full). The consumer does wait(full), wait(mutex), removes an item, signal(mutex), signal(empty). Trace of (empty, full): start (3, 0); produce (2, 1); produce (1, 2); produce (0, 3); consume (1, 2); produce (0, 3); consume (1, 2). A produce at (0, 3) would block until a consume.

**Failure:** Swap the producer's first two waits and the system can deadlock: a producer holds the mutex while it waits for empty, and the consumer needs that mutex to free a slot.

## Topic: Monitors and condition variables

**Definition:** A monitor is a piece of code and data in which the shared data can be changed only by the monitor's own functions, and only one process can be inside at a time. A condition variable (a waiting line for a condition) has wait (sleep until another process signals) and signal (wake one waiting process, and do nothing if none is waiting). In C, which has no monitors, a condition variable is used together with a mutex: wait releases the mutex while sleeping and takes it back before returning.

**Why:** Semaphore code is easy to get wrong. A monitor puts the locking in one place, and a condition variable lets a thread sleep instead of spinning.

**Example:** A consumer needs the buffer to be non-empty, so it writes wait inside a loop: while (count == 0) wait. Consumer C1 sleeps. A producer adds an item and signals. Before C1 runs, consumer C2 takes the item. With if, C1 would read an empty buffer. With while it checks again and sleeps.

**Failure:** Using if instead of while. A signal is only a hint that the state may have changed. Spurious wake-ups (waking with no matching signal) are also possible, so wait is always inside a loop.

## Topic: The classic problems

**Definition:** Bounded buffer: the producer-consumer trace above. Readers-writers: many readers may read together, but a writer needs the data alone. The first solution can starve writers; the second (no new readers once a writer is waiting) can starve readers. Dining philosophers: five philosophers sit at a table with five chopsticks, one between each pair, and each needs two to eat.

**Why:** They are common practice exercises for deadlock and starvation.

**Example:** Each philosopher p picks up chopstick p, then chopstick (p + 1) % 5. If all five pick up their first chopstick at the same moment, everyone holds one and waits for the next forever. That is a deadlock. The fix: make philosopher 4 pick up the right chopstick first, which breaks the cycle of waiting.

**Failure:** Calling the fix complete. Also check for starvation and for concurrency (many eating at once).

## Questions

### What is a race condition, and how do you fix it?

It is a bug where the result depends on the order in which threads run. Two threads doing counter = counter + 1 can both read 0 and both write 1, so the final value is 1 instead of 2. The fix is a critical section protected by a lock, so one thread updates at a time.

### What are the three requirements of a critical-section solution?

Mutual exclusion (only one inside), progress (who enters next cannot be delayed forever) and bounded waiting (a limit on how many times others go first).

### What is the difference between a mutex and a semaphore?

A mutex is a lock owned by one thread: only the thread that locked it unlocks it. A semaphore is a counter with wait and signal. A binary semaphore acts like a lock, a counting semaphore lets N users in, and any thread can signal it.

### Why must a condition wait be inside a while loop?

A signal only says the state may have changed, and another thread may have used it already. The loop rechecks the condition each time.

### How does the dining philosophers problem deadlock, and how do you fix it?

If all five take their first chopstick at once, each waits forever. Making one philosopher take the right chopstick first breaks the circle.

## Mistakes

- Listing "independent and cooperative process" as types of synchronization. They are kinds of processes, and only cooperating ones (which share data) need synchronization.
- Saying a binary semaphore can count above 1. It holds only 0 or 1.
- Using if where a while is needed, or calling Peterson's solution safe on any modern machine.

## Quiz

### Two threads each run counter = counter + 1 once, starting at 0. Which final values are possible?

- [ ] Only 2
- [x] 1 or 2
- [ ] 0, 1 or 2
- [ ] Only 1

Explanation: Of the 20 possible orders of the three steps, 18 give 1 and 2 give 2.

### Which one is not one of the three requirements for a critical-section solution?

- [ ] Mutual exclusion
- [ ] Progress
- [x] Speed
- [ ] Bounded waiting

Explanation: The three requirements are mutual exclusion, progress and bounded waiting.

### Buffer of 3 slots, empty = 3, full = 0. After produce, produce, produce, consume, what are empty and full?

- [ ] empty 0, full 3
- [x] empty 1, full 2
- [ ] empty 2, full 1
- [ ] empty 3, full 0

Explanation: Three produces give empty 0, full 3. The consume frees one slot.

### Why is the wait inside a while loop and not an if?

- [ ] It makes the thread run faster
- [ ] It stops the lock from being released
- [x] The condition may be false again after waking
- [ ] It removes the need for a mutex

Explanation: Another thread can take the item first, so the loop rechecks.

### How does the dining philosophers deadlock get fixed?

- [ ] Give every philosopher a third chopstick
- [x] One philosopher picks up the right chopstick first
- [ ] Let all philosophers eat at once
- [ ] Remove all the semaphores

Explanation: Changing the order for one philosopher breaks the circle of waiting.

## Diagram

```json
{ "kind": "flow", "caption": "The shape of every process that uses a critical section.", "steps": [{ "label": "Entry section: ask permission" }, { "label": "Critical section: touch the shared data" }, { "label": "Exit section: let the next one in" }, { "label": "Remainder section: everything else" }] }
```
