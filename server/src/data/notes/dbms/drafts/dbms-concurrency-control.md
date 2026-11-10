---
id: dbms-concurrency-control
title: Concurrency Control
next: dbms-indexing-file-organization
roadmapSteps: backend:database-design
---

<!-- DRAFT written 10 Nov 2026 from docs/content/source-notes/dbms-batch-b.md (S1b slides ch17 and ch18, S2b PostgreSQL docs 13.1 to 13.3, S8b MySQL manual, S7b Wikipedia).
     Not reviewed: no lastChecked. To publish: outside reader + REVIEW_CHECKLIST.md, add lastChecked, move this file up one folder, delete the old section from dbms.legacy.js. -->

## Overview

Concurrency control is how a database lets many transactions run at once without them corrupting each other's data. Interviewers ask about it because locks, deadlocks, isolation levels and versions are where real systems differ most, and a safe-sounding answer is often wrong for a particular database. After this section you can explain two-phase locking, handle a deadlock, name the three read problems and which isolation level stops each, say what the default is in PostgreSQL and MySQL, and describe snapshot isolation and its write skew.

## Topic: The problem: lost updates

**Definition:** When transactions run at the same time, one can overwrite or read another's half-done work. Concurrency control is the set of rules that stops this while keeping the benefits of running together.

**Why:** Running transactions together gives better use of the processor and disk and shorter response times, because short transactions do not wait behind long ones.

**Example:** Two transactions each add 50 to a balance of 100. Both read 100, T1 writes 150, then T2 writes 150. The final balance is 150 instead of 200: T1's update is lost.

**Failure:** The fix cannot be "run one at a time", which is correct but slow. The goal is schedules that are serializable and recoverable, with as much concurrency as possible.

## Topic: Locks: shared and exclusive

**Definition:** A lock controls access to a data item. A shared lock (S) allows reading. An exclusive lock (X) allows reading and writing. Any number of transactions can hold S on an item; if one holds X, no other transaction can hold any lock on it.

**Why:** Locks make conflicting operations wait for each other, which forces a safe order.

**Example:** T1 holds S on a row. T2 asks for S: granted. T3 asks for X: it waits until T1 and T2 release. If T1 holds X, both T2's S request and T3's X request wait.
```text
held \ asked   S      X
S              yes    wait
X              wait   wait
```

**Failure:** Plain reads in PostgreSQL and MySQL InnoDB do not take read locks; they read a version of the row instead (see the MVCC topic). Locks in those systems matter mainly for writes and for statements like SELECT ... FOR UPDATE.

## Topic: Two-phase locking (2PL)

**Definition:** A transaction following 2PL has a growing phase, where it may take locks but not release any, and then a shrinking phase, where it may release locks but not take new ones. This guarantees conflict-serializable schedules.

**Why:** The rule is simple and the guarantee is strong: transactions can be ordered by the moment each took its last lock.

**Example:** T1 locks A, locks B, then unlocks A, then unlocks B: legal. T1 locks A, unlocks A, then locks B: not 2PL, because it took a lock after releasing one.

**Failure:** 2PL does not prevent deadlock. Strict 2PL holds exclusive locks until commit or abort, which prevents cascading rollbacks. Rigorous 2PL holds all locks until the end, so transactions are ordered by commit time; most databases implement this and simply call it two-phase locking. 2PL is sufficient for serializability, not necessary: some serializable schedules cannot be produced under it.

## Topic: Deadlock

**Definition:** A deadlock is a set of transactions each waiting for a lock that another in the set holds, so none can move.

**Why:** Locking protocols make deadlock possible, so every database needs a way to break it.

**Example:** T1 updates row 1 and then wants row 2. T2 has updated row 2 and then wants row 1. Each waits for the other. The database detects the cycle in its wait-for graph, where an arrow T1 to T2 means T1 waits for T2, picks one transaction as the victim and rolls it back. The application receives an error and must retry the transaction.
```text
T1: UPDATE row1 ... then UPDATE row2
T2: UPDATE row2 ... then UPDATE row1   -- T1 waits for T2, T2 waits for T1
```

**Failure:** Prevention schemes use timestamps. Wait-die: an older transaction may wait for a younger one, but a younger one that wants a lock held by an older one is rolled back. Wound-wait: an older transaction forces the younger holder to roll back, and a younger one may wait for an older one. To cut deadlocks in practice, keep transactions short, touch rows in the same order every time, and index the columns used in locking statements. Which transaction becomes the victim is hard to predict, so never rely on it.

## Topic: Isolation levels and read problems

**Definition:** The SQL standard describes three read problems. A dirty read sees another transaction's uncommitted change. A non-repeatable read gets a different value when it reads the same row twice because another transaction committed a change. A phantom read gets a different set of rows when it repeats a query because another transaction committed inserts or deletes. Four isolation levels allow progressively fewer of them.

**Why:** A weaker level gives more concurrency; a stronger level gives more protection. The application picks per transaction.

**Example:** Under the standard, the levels allow these problems:
```text
level              dirty read   non-repeatable read   phantom read
read uncommitted   possible     possible              possible
read committed     no           possible              possible
repeatable read    no           no                    possible
serializable       no           no                    no
```
A phantom: T1 runs SELECT count(*) FROM instructor WHERE dept = 'Physics' and gets 3. T2 inserts a Physics instructor and commits. T1 runs the same query again and gets 4.

**Failure:** Products do not follow the table exactly, so always say which database you mean. PostgreSQL's default is Read Committed, and its Read Uncommitted behaves like Read Committed, so it never shows dirty reads; its Repeatable Read does not allow phantoms. MySQL InnoDB's default is REPEATABLE READ and it does allow dirty reads at READ UNCOMMITTED. The textbook lists serializable as the standard's default, which is not what these databases do.

## Topic: Multiversion concurrency (MVCC) and snapshot isolation

**Definition:** Multiversion concurrency keeps old versions of a row so that a reader can use the version that matches its snapshot and does not wait for writers. Snapshot isolation gives each transaction a snapshot of the committed data taken when it starts; its own writes are visible to it, others' are not.

**Why:** Reads never block writes and writes never block reads, and the speed is similar to read committed.

**Example:** T1 starts, then T2 updates a row and commits. T1 still reads the old value, because it works from its snapshot. If T1 then tries to update the same row, the first-committer-wins rule makes it fail, because another transaction already wrote that row. In PostgreSQL at Repeatable Read the error is "could not serialize access due to concurrent update" and the application retries.

**Failure:** Snapshot isolation is not the same as serializable. Write skew: two accounts X and Y each hold 50 and a rule says X + Y must stay at least 0. T1 reads both (100) and takes 80 from X. T2 reads both (100) and takes 80 from Y. They write different rows, so both commit, and the total is -60. PostgreSQL's Serializable level adds checks that stop this and makes one of the two transactions fail with an error to retry.

## Topic: Phantoms, gap locks and locking granularity

**Definition:** A phantom is a conflict between a query on a range and an insert into that range, even though they touch no common row. Locking only the rows found cannot see it. Index locking, or InnoDB's next-key lock (a lock on an index record plus the gap before it), blocks inserts into the range.

**Why:** Without it, a transaction that counts rows or finds a maximum can be made wrong by an insert it never saw.

**Example:** Two transactions both read the largest order number, 40, and each creates order 41. Both get the same number, which no serial order would allow. Under InnoDB's default REPEATABLE READ, a locking read of the range blocks the other insert until the first transaction ends.

**Failure:** Locks can be taken at different sizes (database, table, row). Fine locks give more concurrency but cost more to manage; coarse locks the opposite. Intention locks (IS, IX, SIX) let a transaction lock a table without checking every row lock below it. InnoDB turns gap locking off at READ COMMITTED, which is why phantoms can occur there.

## Questions

### What is two-phase locking, and what does it guarantee?

A transaction first only acquires locks, then only releases them. It guarantees conflict-serializable schedules. It does not prevent deadlock, and the strict and rigorous versions also avoid cascading rollbacks.

### What is a deadlock and how is it handled?

Transactions each wait for a lock another holds. The database finds the cycle in its wait-for graph, rolls back one victim, and the application retries. To reduce them, keep transactions short and lock in a consistent order.

### Name the isolation levels and the problems each one allows.

Read uncommitted allows dirty, non-repeatable and phantom reads. Read committed allows non-repeatable and phantom reads. Repeatable read allows phantom reads under the standard. Serializable allows none. Real databases differ, so name the database.

### What is MVCC and what is write skew?

MVCC keeps row versions so readers use a snapshot and do not block writers. Snapshot isolation can still let two transactions write different rows based on a state the other changes, which breaks a rule across rows. That is write skew.

## Mistakes

- Saying serializable is the default in every database. PostgreSQL defaults to Read Committed and MySQL InnoDB to REPEATABLE READ.
- Saying two-phase locking prevents deadlocks. It guarantees serializability, not freedom from deadlock.
- Saying repeatable read always allows phantoms. That is the standard's table; PostgreSQL's Repeatable Read does not allow them.

## Quiz

### What is PostgreSQL's default isolation level?

- [ ] Read uncommitted
- [x] Read committed
- [ ] Repeatable read
- [ ] Serializable

Explanation: PostgreSQL defaults to Read Committed. MySQL InnoDB defaults to REPEATABLE READ, and the textbook lists serializable as the standard's default.

### T1 runs the same count query twice. In between, T2 inserts a matching row and commits. T1's second result is larger. Which problem is this?

- [ ] Dirty read
- [ ] Non-repeatable read
- [x] Phantom read
- [ ] Lost update

Explanation: A phantom read means the set of rows matching a query changed because of committed inserts or deletes. A non-repeatable read is a change to a row already read.

### Which transaction breaks two-phase locking?

- [ ] Lock A, lock B, unlock A, unlock B
- [ ] Lock A, lock B, unlock B, unlock A
- [x] Lock A, unlock A, lock B, unlock B
- [ ] Lock A, lock B, unlock both at commit

Explanation: After the first unlock the transaction is in its shrinking phase and may not take another lock. Locking B after unlocking A breaks the rule.

### How does a database detect a deadlock?

- [ ] By checking whether any transaction is older than the others
- [x] By finding a cycle in the wait-for graph
- [ ] By counting how many locks a transaction holds
- [ ] By waiting for the transaction to commit

Explanation: An arrow from Ti to Tj means Ti waits for a lock Tj holds. The system is deadlocked exactly when this graph has a cycle.

### Two accounts hold 50 each, and X + Y must stay at least 0. Under snapshot isolation, T1 reads both and withdraws 80 from X while T2 reads both and withdraws 80 from Y. What happens?

- [ ] One of them is blocked by a read lock
- [ ] The second one fails because both withdrew from the same row
- [x] Both commit and the total becomes -60 (write skew)
- [ ] Both are rolled back

Explanation: They write different rows, so first-committer-wins sees no conflict. Each acted on a snapshot that the other changes, which is write skew. A serializable level would stop it.

## Diagram

```json
{ "kind": "graph", "caption": "A wait-for graph with a cycle: T1 waits for T2 and T2 waits for T1, so the transactions are deadlocked.", "nodes": [{ "id": "t1", "label": "T1", "x": 25, "y": 50 }, { "id": "t2", "label": "T2", "x": 75, "y": 50 }], "edges": [{ "from": "t1", "to": "t2", "label": "waits for row 2" }, { "from": "t2", "to": "t1", "label": "waits for row 1" }] }
```

## Diagram

```json
{ "kind": "layers", "caption": "The four standard isolation levels, from most protection at the top to most concurrency at the bottom. Each lower level allows more read problems.", "layers": [{ "label": "Serializable" }, { "label": "Repeatable read" }, { "label": "Read committed" }, { "label": "Read uncommitted" }] }
```
