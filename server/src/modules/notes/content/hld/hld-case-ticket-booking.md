---
id: hld-case-ticket-booking
title: "Case Study: Ticket Booking"
lastChecked: 2026-11-13
next: hld-case-top-k-counting
roadmapSteps: backend:database-design, java-spring:spring-rest-api
---
<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A ticket site sells a fixed number of seats, and many people want the same ones at the same second. The central trade-off is correctness against speed: one seat must never be sold twice, yet the site must not freeze when a million people arrive. The design rests on made-up assumptions. After reading you can stop double booking with one atomic database update (one step that cannot be split; here in PostgreSQL), explain holds, a waiting room and payment retries, and say what happens when payment arrives after a hold ended.

## Topic: Requirements and scope

**Definition:** We build a service where a buyer picks seats for one event, holds them briefly, pays, and gets a ticket. We leave out seat maps with prices, resale and fraud checks.

**Why:** Ask first: is there a seat map or general entry, and how many buyers at once? These decide whether each seat can be its own record in the database.

**Example:** Requirements (assumptions): 1. Show free seats. 2. Hold chosen seats for 10 minutes. 3. Charge once, then confirm the seats. 4. Never sell a seat to two buyers. 5. Stay up when 1,000,000 people arrive at once for 50,000 seats.

**Failure:** If "never twice" is not a hard rule, a fast design that sometimes double-sells passes.

## Topic: Numbers

**Definition:** An estimate is a rough calculation done before building. Each input is an assumption.

**Why:** The burst, not the average, is the problem.

**Example:** Assumption: 1,000,000 people arrive at once and the booking service finishes at most 2,000 purchases a second.
- Letting everyone through: 1,000,000 / 2,000 = 500 s, 8.3 minutes.
- 50,000 seats at 2,000 a second: 50,000 / 2,000 = 25 s at the earliest to sell out, if every admitted person buys one seat. After that the rest of the line gets seats only from holds that expire.
- Suppose all 50,000 seats get held and 70% of holds are abandoned (never paid): 0.70 x 50,000 = 35,000 seats sit held for up to 10 minutes without being bought.

**Failure:** With 10,000,000 people the line takes 5,000 s = 83 minutes at the same rate: the line is what people see first.

## Topic: API and data

**Definition:** Calls: `GET /events/{id}/seats` (list), `POST /holds` (seat ids, returns a hold id and an expiry time), `POST /orders` (hold id, payment token, idempotency key). The seat record: `event_id, seat_id, status (free, held, sold), holder_id, hold_expires_at, version`.

**Why:** One row per seat lets the database decide who gets it. A relational database (tables with rules) fits because we need transactions (a group of steps that succeed or fail together) and constraints (rules the database enforces, such as no two rows with the same seat); see System Design: Choosing Databases.

**Example:** `seat` has a primary key on `(event_id, seat_id)`. An `orders` table has a unique idempotency key.

**Failure:** "Show the 100 best free seats" needs an index on status and section, or it scans the whole event.

## Topic: The first design

**Definition:** Diagram 1 shows it. The buyer goes through a waiting room (it admits people at a set rate) to the booking service. The service reads and changes the seat table, and calls a payment provider.

**Why:** The waiting room protects the service. The booking service forgets everything between requests, so we can run many copies. All the correctness lives in the seat table.

**Example:** Write path (diagram 2): 1. Buyer selects seat 12A. 2. Service runs one update: set status held, holder, expiry where the seat is free. 3. If one row changed, return a hold; if zero, return "taken". 4. Buyer pays. 5. Service sets status sold.

**Failure:** The first bottleneck is the popular seats: all buyers aim at the same few rows.

## Topic: Never selling a seat twice

**Definition:** The decision: the database makes the check and the write one step. Example with 10 buyers who look at the same free seat at the same moment (assumption): if each reads "free" and then writes "mine", all 10 succeed. With one atomic update, one buyer wins and 9 get "0 rows changed", meaning taken:

`UPDATE seat SET holder_id = :me, status = 'held', hold_expires_at = now() + interval '10 minutes' WHERE event_id = :e AND seat_id = :s AND (status = 'free' OR (status = 'held' AND hold_expires_at < now()))`

In plain words: make me the holder, but only if this seat is free, or its hold has run out. The database says how many rows it changed: 1 means we got the seat, 0 means someone else did. Use the database clock `now()`, not the servers' clocks.

**Why:** The PostgreSQL documentation says that when a second transaction tries to change a row that a first one has already changed, the second waits until the first finishes. It then checks the WHERE condition again against the changed row (default Read Committed level). So the loser sees `held`, fails the condition and changes nothing. Alternatives:
- Row lock: `SELECT ... FOR UPDATE` locks the row until the transaction ends; others wait. The documentation says waits have no limit and holding transactions open long (for example while waiting for user input) is a bad idea, so we never hold a lock during payment.
- Unique constraint: `UNIQUE (event_id, seat_id)` on a `tickets` table makes a second insert fail. A safety net behind the update.
- `SKIP LOCKED` skips locked rows; the documentation calls the result an inconsistent view of the data. Our reasoning: it can suit "give me any free seat", not "seat 12A".
- Optimistic version (our reasoning): update `WHERE version = 7`; 0 rows means a conflict.

We reject a cache or a distributed lock alone (our reasoning): a cache answer can be old, and a lock holder that freezes can write after its lock has run out. The database must still reject the stale write.

**Example:** A and B both send the update at time 0. The database lets A change the row first. B waits, re-checks, finds `held`, changes 0 rows and sees "taken". With read-then-write, all 10 buyers are told they succeeded, and the last write decides who holds the row.

**Failure:** Two seats in one order go in one transaction (all or nothing), but two updates in different order can deadlock (each waits for the other). The documentation advises taking locks in a consistent order, so sort seat ids, and retry if the database aborts one transaction.

## Topic: Holds, waiting rooms and payment

**Definition:** A hold keeps the seat for one buyer until `hold_expires_at`. A waiting room admits people to the booking service at a fixed rate. An idempotency key (a unique id per order attempt, so a repeated request has the same effect as one) protects payment retries.

**Why:** Payment takes time, so the seat must be reserved meanwhile without locking a row for minutes. With a 10-minute hold, an abandoned seat is free again only after 10 minutes. With a 2-minute hold it is free after 2 minutes, 5 times sooner (10 / 2), but a buyer still typing a card number may lose the seat. We pick 10 minutes first. We reject holding a database lock for the whole payment.

**Waiting room:** admit at most the rate the service can finish, here 2,000 a second (assumption). Others wait in a line with a position number (rate limiting at the front; see System Design: APIs, Gateways and Rate Limiting). The cost is an 8.3-minute wait for the last person.

**Payment retries:** suppose 1% of payment requests time out, the money was in fact taken, and the buyer presses pay again. Without a key that is 1% of 100,000 = 1,000 double charges per 100,000 orders. With one key per order, the provider or our `orders` table returns the first result: 0 duplicates. The key is saved in the same transaction as the order (see System Design: Choosing Databases).

**Example:** A seat is held until 10:10. The payment succeeds at 10:11, but another person bought the freed seat at 10:10:30. Our rule: confirm only if the hold is still ours (`UPDATE ... SET status = 'sold' WHERE ... AND holder_id = :me AND status = 'held'`); if 0 rows change, refund the payment with a new key (`k1-refund`; one key names one operation) and tell the buyer. To make this rare, add a few minutes to the hold when the buyer starts to pay.

**Failure:** A timer that frees expired seats can lag; our update treats an expired hold as free, so no timer is needed for correctness.

## Topic: Failures and scaling

**Definition:** The database, the booking service and the payment provider can each fail. Correctness must hold through a crash.

**Why:** A crash between "payment taken" and "seat sold" is the worst case: money without a ticket.

**Example:** The service crashes after payment succeeded. On restart, a job finds orders that are paid but not confirmed, and confirms them if the hold is still ours, otherwise refunds.

**Failure:** With ten times the traffic, one database holds all seats of the event. Split by event (each event on one shard, a slice of the data on its own machine; see System Design: Replication and Partitioning). A single hot event still lives on one primary (the main copy), so the waiting room matters even more, and it must be fair: a position number, no cutting the line.

## Questions

### How do you stop two people buying the same seat?

One atomic update: set the owner where the seat is still free. Check the number of rows changed.

### Why not a distributed lock?

A frozen lock holder can write late, so the database must still check (our reasoning).

### How long should a hold last?

Longer holds help slow buyers but lock abandoned seats; 2 minutes returns them 5 times sooner than 10.

### What if the payment arrives after the hold expired?

Confirm only if the seat is still ours; otherwise refund automatically.

## Mistakes

- "Read the seat, check it is free, then write." That is the race: 10 buyers all pass the check.
- "A cache of free seats prevents double sale." The cache can be stale; only the database write decides.
- "Retry the payment until it works." Without an idempotency key a retry can charge twice.

## Quiz

### 10 buyers read "free" and then write "mine", with no atomic update. What happens?

- [ ] One wins
- [ ] None wins
- [x] All 10 can succeed
- [ ] The database picks the fastest

Explanation: Check and write are two steps; the atomic update joins them.

### In PostgreSQL's default Read Committed level, what does a conditional update return to the loser?

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
{ "kind": "graph", "caption": "Ticket booking. Buyers enter a waiting room (1), which admits them at a fixed rate to the booking service (2). The service updates seats in the database (3) and calls the payment provider (4).", "groups": [{ "id": "dc", "label": "Our system" }], "nodes": [{ "id": "u", "label": "Buyers", "x": 12, "y": 50, "shape": "client" }, { "id": "w", "label": "Waiting room", "x": 38, "y": 50, "shape": "queue", "group": "dc" }, { "id": "b", "label": "Booking", "x": 64, "y": 50, "group": "dc" }, { "id": "db", "label": "Seat table", "x": 64, "y": 85, "shape": "database", "group": "dc" }, { "id": "p", "label": "Payment", "x": 90, "y": 50, "shape": "external" }], "edges": [{ "from": "u", "to": "w", "step": 1 }, { "from": "w", "to": "b", "step": 2 }, { "from": "b", "to": "db", "step": 3 }, { "from": "b", "to": "p", "step": 4 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Two buyers want one seat. Both send the conditional update (1, 2). B waits while A's change is made (3). A gets 1 row changed (4); B re-checks, finds the seat held and gets 0 rows changed (5), so B is told it is taken.", "actors": [{ "id": "a", "label": "Buyer A" }, { "id": "b", "label": "Buyer B" }, { "id": "d", "label": "Database" }], "messages": [{ "from": "a", "to": "d", "label": "Hold 12A if free" }, { "from": "b", "to": "d", "label": "Hold 12A if free" }, { "from": "d", "to": "b", "label": "Row locked by A: B waits", "dashed": true }, { "from": "d", "to": "a", "label": "1 row changed", "dashed": true }, { "from": "d", "to": "b", "label": "Re-check: 0 rows", "dashed": true }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Payment after the hold expired. The buyer pays (1) and the provider takes the money (2). The service tries to confirm the seat (3), but the seat is no longer the buyer's, so 0 rows change (4). The service refunds with a new key, k1-refund (5) and tells the buyer (6).", "actors": [{ "id": "u", "label": "Buyer" }, { "id": "s", "label": "Service" }, { "id": "p", "label": "Payment" }, { "id": "d", "label": "Seat table" }], "messages": [{ "from": "u", "to": "s", "label": "Pay (hold ended)" }, { "from": "s", "to": "p", "label": "Charge, key k1" }, { "from": "s", "to": "d", "label": "Confirm if still mine" }, { "from": "d", "to": "s", "label": "0 rows changed", "dashed": true }, { "from": "s", "to": "p", "label": "Refund (new key)" }, { "from": "s", "to": "u", "label": "Seat lost, refunded", "dashed": true }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Waiting room. A burst of buyers arrives at once (1) and waits in a line. A gate releases people at the rate the booking service can finish, for example 2,000 a second (2). The booking service sees a steady flow (3).", "groups": [{ "id": "dc", "label": "Our system" }], "nodes": [{ "id": "u", "label": "1M buyers", "x": 12, "y": 50, "shape": "client" }, { "id": "q", "label": "Line", "x": 38, "y": 50, "shape": "queue", "group": "dc" }, { "id": "g", "label": "Gate 2,000/s", "x": 64, "y": 50, "group": "dc" }, { "id": "b", "label": "Booking", "x": 88, "y": 50, "group": "dc" }], "edges": [{ "from": "u", "to": "q", "step": 1 }, { "from": "q", "to": "g", "step": 2 }, { "from": "g", "to": "b", "step": 3 }] }
```
