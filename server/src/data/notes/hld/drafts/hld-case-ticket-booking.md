---
id: hld-case-ticket-booking
title: "Case Study: Ticket Booking"
next: hld-case-top-k-counting
roadmapSteps: backend:database-design, java-spring:spring-rest-api
---
<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-drafts.md. Numbers from docs/content/checks/hld-case-check.py (sections 11A to 11D). -->

## Overview

A ticket site sells a fixed number of seats, and many people want the same ones at the same second. The central trade-off is correctness against speed: one seat must never be sold twice, yet the site must not freeze when a million people arrive. This is one reasonable design built on made-up assumptions, not the answer. After reading you can stop double booking with one atomic database update, explain holds, a waiting room and payment retries, and say what happens when payment arrives after a hold ended.

## Topic: Requirements and scope

**Definition:** We build a service where a buyer picks seats for one event, holds them briefly, pays, and gets a ticket. We leave out seat maps with prices per section, resale, refunds and fraud checks.

**Why:** Ask first: is there a seat map or general entry, how many buyers at once, and who takes the payment? These decide whether a seat is a row that can be locked.

**Example:** Requirements (assumptions): 1. Show free seats. 2. Hold chosen seats for 10 minutes. 3. Charge once, then confirm the seats. 4. Never sell a seat to two buyers. 5. Stay up when 1,000,000 people arrive at once for 50,000 seats. Out of scope: refunds, resale.

**Failure:** If "never twice" is not stated as a hard rule, a design that is fast but sometimes sells two tickets passes.

## Topic: Numbers

**Definition:** The estimate that shows how much waiting, holding and admitting we must plan for. Each input is an assumption.

**Why:** The burst, not the average, is the problem.

**Example:** Assumption: 1,000,000 people arrive at once and the booking service finishes at most 2,000 purchases a second (11C). Letting everyone through takes 1,000,000 / 2,000 = 500 s, 8.3 minutes. Assumption: 50,000 seats; they sell out after at most 50,000 / 2,000 = 25 s if every admitted person buys one seat. Assumption: 70% of holds are abandoned (11B), so at the end of a 10-minute round 35,000 of the 50,000 seats are held but never bought.

**Failure:** If the arrival is 10 times bigger (10,000,000), the waiting line is 83 minutes at the same rate, so the line, not the database, is what people see first.

## Topic: API and data

**Definition:** Calls: `GET /events/{id}/seats` (list), `POST /holds` (seat ids, returns a hold id and an expiry time), `POST /orders` (hold id, payment token, idempotency key). The seat record: `event_id, seat_id, status (free, held, sold), holder_id, hold_expires_at, version`.

**Why:** One row per seat lets the database decide who gets it. A relational database (tables with rules) fits because we need transactions and constraints, see System Design: Choosing Databases.

**Example:** `seat(event_id, seat_id, status, holder_id, hold_expires_at, version)` with a primary key on `(event_id, seat_id)`. An `orders` table with a unique idempotency key.

**Failure:** "Show me the 100 best free seats" needs an index on status and section; without it the seat list scans the whole event.

## Topic: The first design

**Definition:** Diagram 1 shows it. The buyer goes through a waiting room (it admits people at a set rate) to the booking service. The service reads and changes the seat table, and calls a payment provider.

**Why:** The waiting room protects the service. The booking service holds no state, so we can run many copies, see System Design: Scaling Basics. All the correctness lives in the seat table.

**Example:** Write path (diagram 2): 1. Buyer selects seat 12A. 2. Service runs one update: set status held, holder, expiry where status is free. 3. If one row changed, return a hold; if zero, return "taken". 4. Buyer pays. 5. Service sets status sold.

**Failure:** The first bottleneck is the popular seats: all buyers aim at the same few rows, so adding servers does not help; the rows are the limit.

## Topic: Never selling a seat twice

**Definition:** The decision: the database makes the check and the write one step. Script 11A, worked by hand (assumption: 10 buyers look at the same free seat at once): if each reads "free" and then writes "mine", all 10 succeed and the seat is sold to 10 buyers. With one atomic update, `UPDATE seat SET holder = :me, status = 'held' WHERE seat_id = :s AND status = 'free'`, one buyer wins and 9 get "0 rows changed", meaning taken.

**Why:** The PostgreSQL documentation (read: the transaction isolation page and the explicit locking page) says that when a second update finds a row already changed by another transaction, it waits for that first one to finish and then re-checks its WHERE condition on the new version of the row (in the default Read Committed level). So the loser sees `status = 'held'`, fails the condition and changes nothing. That is why a single conditional update is safe. Alternatives:
- Row lock: `SELECT ... FOR UPDATE` locks the rows until the transaction ends; others wait. The documentation warns that waiting transactions wait without limit and that it is a bad idea to hold transactions open for long (for example while waiting for user input), so we never hold the lock during payment.
- `SKIP LOCKED` (SELECT reference page): rows that are locked are skipped. The page calls this an inconsistent view of the data, fine for "any free seat" but wrong for "seat 12A".
- Unique constraint (the documentation: no two rows may have equal values in the listed columns, backed by an index): a `tickets` table with `UNIQUE (event_id, seat_id)` makes a second insert fail. It is a good second safety net behind the update.
- Optimistic version (our reasoning): read the row with `version = 7`, update `WHERE version = 7`, and treat "0 rows" as a conflict. It is the same idea as the atomic update; use it when the change depends on data read earlier.

We reject a cache or a distributed lock alone: a cache answer can be old, and a lock holder that is paused can write after its lock expired. The database must still reject the stale write; see System Design: Consensus and Coordination for fencing tokens (a number that grows with each lock grant, so the database can refuse an older one).

**Example:** Trace with 2 buyers: A and B both send the update at time 0. The database lets A change the row first. B's update waits, re-checks `status = 'free'`, finds `held`, changes 0 rows. B sees "taken".

**Failure:** Two seats in one order: two updates in different order can deadlock (each waits for the other). The documentation advises taking locks in a consistent order, so sort seat ids, and retry if the database aborts one transaction.

## Topic: Holds, waiting rooms and payment

**Definition:** A hold keeps the seat for one buyer until `hold_expires_at`. A waiting room admits people to the booking service at a fixed rate. An idempotency key (a unique id per order attempt, so a repeated request has the same effect as one) protects payment retries.

**Why:** Payment takes time, so the seat must be reserved meanwhile without locking a row for minutes. The hold length is a trade-off (11B). Assumption: 70% of holds are abandoned. With a 10-minute hold, an abandoned seat is back only after 10 minutes; with 2 minutes it returns 5 times sooner (10 / 2), but an honest buyer typing a card number may lose the seat during payment. We pick 10 minutes for a first design and shorten it for the last seats. We reject holding a database lock for the whole payment.

**Waiting room (11C):** admit at most the rate the service can finish, here 2,000 a second (assumption). Others wait in a line with a position number. This is rate limiting at the front; see System Design: API Design and Rate Limiting. The service stays inside its capacity at the cost of an 8.3-minute wait for the last person.

**Payment retries (11D):** assumption: 1% of payment requests time out and the buyer presses again. Without a key that is 1,000 duplicate charges per 100,000 orders; with one key per order the provider or our `orders` table returns the first result, 0 duplicates. The key is saved in the same transaction as the order, see System Design: Queues, Logs and Streaming.

**Example:** Expired hold: a seat is held until 10:10. The payment succeeds at 10:11. Meanwhile the seat was freed and bought by another person at 10:10:30. Our rule: confirm only if the hold is still ours (`UPDATE ... WHERE holder = :me AND status = 'held'`); if 0 rows change, refund the payment automatically and tell the buyer. To make this rare, we extend the hold when the buyer starts payment.

**Failure:** Expiry work by a timer that frees seats can lag. We treat a held seat with a past expiry as free in the update condition, so no timer is needed for correctness.

## Topic: Failures and scaling

**Definition:** The database, the booking service and the payment provider can each fail. Correctness must hold through a crash.

**Why:** A crash between "payment taken" and "seat sold" is the worst case: money without a ticket.

**Example:** The service crashes after payment succeeded. On restart, a job finds orders that are paid but not confirmed, and confirms them if the hold is still ours, otherwise refunds.

**Failure:** At 10 times the traffic one database holds all seats of the event. Split by event (each event on one shard, see System Design: Replication and Partitioning); a single hot event still lives on one primary, so the waiting room matters even more.

## Questions

### How do you stop two people buying the same seat?

One atomic update: set the owner where the status is still free. Check the number of rows changed.

### Why not a distributed lock?

A paused lock holder can write late. The database must still check, so the lock adds cost without removing the need for the check.

### How long should a hold last?

Longer holds help slow buyers but lock abandoned seats; 10 minutes against 2 minutes returns seats 5 times sooner.

### What if the payment arrives after the hold expired?

Confirm only if the seat is still ours; otherwise refund automatically.

## Mistakes

- "Read the seat, check it is free, then write." That is the race (11A): 10 buyers all pass the check.
- "A cache of free seats prevents double sale." The cache can be stale; only the database write decides.
- "Retry the payment until it works." Without an idempotency key a retry can charge twice.

## Quiz

### 10 buyers read "free" and then write "mine". What happens?

- [ ] One wins
- [ ] None wins
- [x] All 10 can succeed
- [ ] The database picks the fastest

Explanation: Check and write are two steps; the atomic update joins them.

### What does a conditional update return to the loser?

- [ ] An error always
- [x] Zero rows changed
- [ ] The winner's name
- [ ] One row

Explanation: The WHERE condition no longer matches after the winner's change.

### Why not hold a row lock during payment?

- [ ] Locks are free
- [x] Waiting transactions wait without limit, and long open transactions are a bad idea
- [ ] Payment is fast
- [ ] Locks cannot be released

Explanation: The PostgreSQL documentation advises against holding transactions open while waiting for user input.

### 1,000,000 people, 2,000 purchases a second. How long to admit all?

- [ ] 25 s
- [x] 500 s
- [ ] 50 s
- [ ] 2,000 s

Explanation: 1,000,000 / 2,000 = 500 s.

### What does an idempotency key prevent?

- [ ] A slow page
- [x] A repeated request being charged twice
- [ ] A stale cache
- [ ] A deadlock

Explanation: The repeat returns the first result.

## Diagram

```json
{ "kind": "graph", "caption": "Ticket booking. Buyers enter a waiting room (1), which admits them at a fixed rate to the booking service (2). The service updates seats in the database (3) and calls the payment provider (4).", "groups": [{ "id": "dc", "label": "Our system" }], "nodes": [{ "id": "u", "label": "Buyers", "x": 8, "y": 50, "shape": "client" }, { "id": "w", "label": "Waiting room", "x": 33, "y": 50, "shape": "queue", "group": "dc" }, { "id": "b", "label": "Booking service", "x": 58, "y": 50, "group": "dc" }, { "id": "db", "label": "Seat table", "x": 58, "y": 85, "shape": "database", "group": "dc" }, { "id": "p", "label": "Payment provider", "x": 90, "y": 50, "shape": "external" }], "edges": [{ "from": "u", "to": "w", "step": 1 }, { "from": "w", "to": "b", "step": 2 }, { "from": "b", "to": "db", "step": 3 }, { "from": "b", "to": "p", "step": 4 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Two buyers want one seat. Both send the conditional update (1, 2). The database lets buyer A change the row first (3), so A gets a hold (4). Buyer B's update re-checks the condition, finds the seat held, changes 0 rows (5) and B is told it is taken (6).", "actors": [{ "id": "a", "label": "Buyer A" }, { "id": "b", "label": "Buyer B" }, { "id": "d", "label": "Database" }], "messages": [{ "from": "a", "to": "d", "label": "Hold 12A if free" }, { "from": "b", "to": "d", "label": "Hold 12A if free" }, { "from": "d", "to": "a", "label": "1 row changed", "dashed": true }, { "from": "d", "to": "b", "label": "0 rows changed", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Payment after the hold expired. The buyer pays (1) and the provider takes the money (2). The service tries to confirm the seat (3), but the seat is no longer the buyer's, so 0 rows change (4). The service refunds (5) and tells the buyer (6).", "actors": [{ "id": "u", "label": "Buyer" }, { "id": "s", "label": "Service" }, { "id": "p", "label": "Payment" }, { "id": "d", "label": "Seat table" }], "messages": [{ "from": "u", "to": "s", "label": "Pay (hold ended)" }, { "from": "s", "to": "p", "label": "Charge, key k1" }, { "from": "s", "to": "d", "label": "Confirm if still mine" }, { "from": "d", "to": "s", "label": "0 rows changed", "dashed": true }, { "from": "s", "to": "p", "label": "Refund, key k1" }, { "from": "s", "to": "u", "label": "Seat lost, refunded", "dashed": true }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Waiting room. A burst of buyers arrives at once (1) and waits in a line. A gate releases people at the rate the booking service can finish, for example 2,000 a second (2). The service sees a steady flow (3).", "groups": [{ "id": "dc", "label": "Our system" }], "nodes": [{ "id": "u", "label": "1,000,000 buyers", "x": 10, "y": 50, "shape": "client" }, { "id": "q", "label": "Line", "x": 40, "y": 50, "shape": "queue", "group": "dc" }, { "id": "g", "label": "Gate: 2,000 a s", "x": 65, "y": 50, "group": "dc" }, { "id": "b", "label": "Booking service", "x": 90, "y": 50, "group": "dc" }], "edges": [{ "from": "u", "to": "q", "step": 1 }, { "from": "q", "to": "g", "step": 2 }, { "from": "g", "to": "b", "step": 3 }] }
```
