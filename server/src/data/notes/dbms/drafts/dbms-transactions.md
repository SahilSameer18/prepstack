---
id: dbms-transactions
title: Transactions
next: dbms-concurrency-control
roadmapSteps: backend:database-design
---

<!-- DRAFT written 10 Nov 2026 from docs/content/source-notes/dbms-batch-b.md (S1b slides ch17, S7b Wikipedia ACID and schedules, S4b supplied notes).
     Not reviewed: no lastChecked. To publish: outside reader + REVIEW_CHECKLIST.md, add lastChecked, move this file up one folder, delete the old section from dbms.legacy.js. -->

## Overview

A transaction is a group of operations that the database treats as one unit: all of it happens or none of it does. Interviewers ask about transactions because ACID, schedules and serializability test whether you understand what can go wrong when programs fail or run at the same time. After this section you can explain ACID with a bank transfer, draw the states a transaction passes through, check whether a schedule is conflict serializable using a precedence graph, and say what recoverable and cascadeless mean.

## Topic: What a transaction is

**Definition:** A transaction is a unit of program execution that reads and possibly updates data. It either completes and is committed, or it fails and is rolled back.

**Why:** Two things go wrong in real systems: programs and machines fail halfway, and many programs run at the same time. Transactions give the database a unit it can undo or protect.

**Example:** Transfer 50 from account A to account B: read A, subtract 50, write A, read B, add 50, write B. If the system stops after the third step and before the sixth, 50 has vanished.
```sql
BEGIN;
UPDATE account SET balance = balance - 50 WHERE id = 'A';
UPDATE account SET balance = balance + 50 WHERE id = 'B';
COMMIT;   -- or ROLLBACK; to undo both updates
```

**Failure:** In most databases each successful statement commits by itself unless you start a transaction or turn autocommit off. Two separate UPDATE statements outside BEGIN are two transactions, and a crash between them leaves the first one committed.

## Topic: Atomicity and durability

**Definition:** Atomicity means all operations of a transaction are reflected in the database or none are. Durability means that once the user is told the transaction completed, its changes survive software and hardware failures.

**Why:** Atomicity protects against half-finished work, such as the lost 50 above. Durability protects against losing a confirmed payment because the server restarted.

**Example:** The transfer fails after step 3. Atomicity requires the debit of A to be undone, so the database looks as if the transfer never started. If the transfer committed and the machine loses power a second later, durability requires the new balances to be there after restart.

**Failure:** Durability is a promise made after the commit is acknowledged, not before. A transaction that was still running when the machine failed has no durability promise and is rolled back.

## Topic: Consistency and isolation

**Definition:** Consistency means that a transaction run alone takes the database from one valid state to another, where valid means the rules (keys, foreign keys, and rules about the data) hold. Isolation means that each transaction behaves as if the others were not running.

**Why:** Without isolation, a reader can see a half-finished transfer. Without consistency, valid data turns into invalid data.

**Example:** For the transfer, consistency means A + B stays the same. Isolation matters if T2 reads A and B between the third and sixth step of the transfer: it sees a total that is 50 too low, even though the database is correct before and after.

**Failure:** The database can only enforce rules that were declared. If the transaction's own logic is wrong, such as adding 50 to B twice, the database does not notice, and the result is inconsistent. Also, consistency in ACID is not the same word as consistency in the CAP theorem, which is about every read seeing the latest write.

## Topic: Transaction states

**Definition:** A transaction is active while it runs, partially committed after its last statement, committed once it has finished successfully, failed when it cannot continue, and aborted after it has been rolled back.

**Why:** The states say what is true about the data at each point, and what the system has to do next.

**Example:** The transfer is active during its six steps. After the last write it is partially committed; if the commit succeeds it moves to committed. If step 5 hits a constraint violation, it becomes failed, then aborted once A has been restored.

**Failure:** After an abort the database can restart the transaction, but only if the failure was not caused by an internal logical error in the transaction itself. Otherwise it must be killed.

## Topic: Schedules and conflict serializability

**Definition:** A schedule is the time order in which the operations of several transactions run, with each transaction's own order kept. A schedule is serializable if it is equivalent to a serial one, where transactions run one after another. Two operations conflict when they come from different transactions, touch the same item, and at least one of them writes it.

**Why:** Running transactions one by one is always correct but slow. Serializability lets the database interleave them and still give the same result as some serial order.

**Example:** T1 and T2 each read and write A, then read and write B. The schedule R1(A) W1(A) R2(A) W2(A) R1(B) W1(B) R2(B) W2(B) has conflicts only from T1 to T2 (T1 touches each item first), so its precedence graph has one arrow T1 to T2 and no cycle: it is equivalent to T1 followed by T2. The schedule R1(A) R2(A) W1(A) W2(A) has R1(A) before W2(A), an arrow T1 to T2, and R2(A) before W1(A), an arrow T2 to T1. That is a cycle, so it is not conflict serializable; here T2 also overwrites the update that T1 never let it see.

**Failure:** The test is a precedence graph over the transactions: draw an arrow Ti to Tj when an operation of Ti conflicts with a later operation of Tj. A schedule is conflict serializable exactly when the graph has no cycle, and a topological order of the graph is an equivalent serial order. A wider notion, view serializability, accepts more schedules but is NP-complete to test, so databases use conflict serializability.

## Topic: Recoverable and cascadeless schedules

**Definition:** A schedule is recoverable if, whenever a transaction reads a value written by another transaction, the writer commits first. It is cascadeless if a transaction only reads an item after the transaction that last wrote it has committed.

**Why:** If a reader commits on the strength of data that is later rolled back, the commit cannot be undone, and the database is left inconsistent.

**Example:** T8 writes A. T9 reads A and commits. Then T8 aborts. T9 has committed using a value that never officially existed, so the schedule is not recoverable. If T9 had not committed yet, the schedule would be recoverable, but T9 would still have to be rolled back with T8: a cascading rollback.

**Failure:** Every cascadeless schedule is recoverable, but not every recoverable schedule is cascadeless. Cascading rollbacks can undo a lot of work, which is why systems prefer cascadeless schedules.

## Questions

### Explain ACID with an example.

Take a bank transfer. Atomicity: both the debit and the credit happen, or neither. Consistency: the total stays the same and constraints hold. Isolation: another transaction never sees the money half-moved. Durability: once the transfer is confirmed, it survives a crash.

### What states does a transaction go through?

Active while running, partially committed after the last statement, then committed. If something goes wrong it becomes failed, then aborted after rollback. After an abort it can be restarted or killed.

### What is the difference between a serial and a serializable schedule?

A serial schedule runs transactions one after another. A serializable schedule may interleave them but gives the same result as some serial schedule.

### How do you test whether a schedule is conflict serializable?

Draw a precedence graph with one node per transaction and an arrow Ti to Tj when an operation of Ti conflicts with a later operation of Tj. If the graph has no cycle, it is conflict serializable.

## Mistakes

- Saying consistency in ACID and consistency in the CAP theorem are the same thing. In ACID it means rules are kept; in CAP it means reads see the latest write.
- Saying serializable means transactions really run one after another. It means the result equals some serial order; the operations can still interleave.
- Thinking a single UPDATE outside BEGIN is not a transaction. With autocommit, each successful statement is its own transaction.

## Quiz

### A transfer debits account A, then crashes before crediting account B. Which ACID property makes the database undo the debit?

- [x] Atomicity
- [ ] Consistency
- [ ] Isolation
- [ ] Durability

Explanation: Atomicity means all operations of a transaction are reflected or none are, so the half-finished transfer is rolled back.

### Schedule: R1(A) W1(A) R2(A) W2(A) R1(B) W1(B) R2(B) W2(B). Which serial order is it equivalent to?

- [x] T1 then T2
- [ ] T2 then T1
- [ ] Both orders
- [ ] Neither: it is not serializable

Explanation: Every conflict goes from T1 to T2 because T1 touches each item first, so the precedence graph has one arrow T1 to T2 and no cycle.

### Schedule: R1(A) R2(A) W1(A) W2(A). Why is it not conflict serializable?

- [ ] Because T1 and T2 both read A
- [x] Because its precedence graph has a cycle between T1 and T2
- [ ] Because it has no commit statements
- [ ] Because two transactions cannot write the same item

Explanation: R1(A) before W2(A) gives T1 to T2, and R2(A) before W1(A) gives T2 to T1. The two arrows form a cycle.

### T8 writes A. T9 reads A and commits. T8 then aborts. What is wrong with this schedule?

- [ ] It is not serial
- [ ] It breaks durability
- [x] It is not recoverable
- [ ] Nothing: T9 read committed data

Explanation: In a recoverable schedule the writer must commit before a reader that used its data commits. T9 committed on a value that was later rolled back.

### Which statement is true?

- [ ] Every recoverable schedule is cascadeless
- [x] Every cascadeless schedule is recoverable
- [ ] Every serializable schedule is serial
- [ ] A cascadeless schedule can contain a dirty read

Explanation: Cascadeless schedules forbid reading uncommitted data, which makes them recoverable. A recoverable schedule can still read uncommitted data and cause a cascading rollback.

## Diagram

```json
{ "kind": "graph", "caption": "The states of a transaction. A failed transaction ends up aborted.", "nodes": [{ "id": "active", "label": "Active", "x": 10, "y": 50 }, { "id": "partial", "label": "Partially committed", "x": 42, "y": 20 }, { "id": "committed", "label": "Committed", "x": 84, "y": 20 }, { "id": "failed", "label": "Failed", "x": 42, "y": 80 }, { "id": "aborted", "label": "Aborted", "x": 84, "y": 80 }], "edges": [{ "from": "active", "to": "partial" }, { "from": "partial", "to": "committed" }, { "from": "active", "to": "failed" }, { "from": "partial", "to": "failed" }, { "from": "failed", "to": "aborted" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Precedence graph of R1(A) R2(A) W1(A) W2(A): the cycle between T1 and T2 means it is not conflict serializable.", "nodes": [{ "id": "t1", "label": "T1", "x": 25, "y": 50 }, { "id": "t2", "label": "T2", "x": 75, "y": 50 }], "edges": [{ "from": "t1", "to": "t2", "label": "A" }, { "from": "t2", "to": "t1", "label": "A" }] }
```
