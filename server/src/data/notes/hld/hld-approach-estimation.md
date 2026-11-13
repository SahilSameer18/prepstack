---
id: hld-approach-estimation
title: The Design Interview and Back-of-the-Envelope Numbers
lastChecked: 2026-11-13
next: hld-scaling-basics
roadmapSteps: backend:deployment-cloud, devops-cloud:monitoring-reliability
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A system design interview gives you one vague sentence, such as "design a photo service", and about 45 minutes. The interviewer watches how you organise the problem and whether your rough numbers are sensible.

After this section you can lay out a design answer in clear steps, tell functional from non-functional requirements, estimate traffic and storage on paper, use the latency numbers every engineer should know, and talk about availability in "nines" (99.9% is three nines).

## Topic: How to organise a 45-minute answer

**Definition:** No official rule sets the order of a design answer. A habit that works, used by public interview guides:
1. Ask questions until the task is clear.
2. Write the requirements.
3. Estimate rough numbers.
4. Sketch the data and the API (the list of calls other programs can make).
5. Draw a first design with a few boxes.
6. Go deep on one or two parts where the real difficulty is.
7. Say what can fail and what you would change if the numbers grew.
This is a habit, not a fact about how companies grade.

**Why:** Without an order, candidates draw boxes first and solve the wrong problem. The numbers (step 3) also decide the boxes: 20 requests a second and 20,000 need different designs.

**Example:** Task "design a photo-sharing service". Ask whether users upload, view or both. Write "upload a photo, view a feed, 99.9% available". Guess users and sizes. Write `POST /photos` and `GET /feed`. Draw app servers and storage. Then pick the feed or the photo storage and discuss it for ten minutes.

**Failure:** Trap: spending 20 minutes on one box, then having no time for "what happens when this fails?". Also, name the trade-off, not "the right answer": every choice has a cost.

## Topic: Functional and non-functional requirements

**Definition:** A functional requirement says what the system does ("a user can post a photo"). A non-functional requirement says how well it does it. The usual kinds:
- Latency: how long one request takes.
- Throughput: requests handled per second.
- Availability: the share of time, or of requests, that work.
- Durability: saved data is not lost.
- Consistency: everyone sees the same, latest data.
- Scale: how many users and how much data.

The SRE book (Google's free book *Site Reliability Engineering*, chapter 4) lists the first four as things you can measure.

**Why:** They pick the design. A bank balance needs consistency and durability; a "likes" counter may be a few seconds old.

**Example:** Photo service (assumption): a photo page opens in under 300 ms for 99% of requests; 99.9% of requests succeed; an uploaded photo is never lost; the like count may be a few seconds old.

**Failure:** Words with no numbers ("fast and scalable"): the interviewer asks "how fast? how many?". Also asking for everything: say which of consistency, latency and availability you would give up first.

## Topic: Estimating traffic and storage

**Definition:** Back-of-the-envelope means a quick estimate with round numbers. Traffic: requests per day divided by seconds in a day gives requests per second (QPS, queries per second). A day has 86,400 seconds; round to about 100,000 for a first estimate. Peak is the busiest moment, so multiply the average by a peak factor, such as 2. Storage: new data per day, times days kept, times copies. Units: a byte is about one letter; a kilobyte (KB) is about a thousand bytes, a megabyte (MB) a million, a gigabyte (GB) a billion, a terabyte (TB) a trillion (computers count in powers of two, so a KB is really 1,024 bytes).

**Why:** The result tells you whether one machine is enough. The busiest second breaks a system, not the average. The SRE book's example: 200 requests in every even second and none in odd seconds has the same average as a steady 100 a second, but twice the peak.

**Example:** Assumptions, not real data: 100,000,000 daily active users, each doing 20 reads and 2 writes a day.
- Average reads: 100,000,000 × 20 / 86,400 = 23,148 per second. Writes: 100,000,000 × 2 / 86,400 = 2,315 per second.
- Peak at 2 times average: 46,296 reads and 4,630 writes per second.
- New data: 100,000,000 × 2 = 200,000,000 writes a day. At 1 KB each that is 200,000,000 KB. 1,000,000 KB is 1 GB, so 200 GB a day.
- Kept 5 years: 200 GB × 365 × 5 = 365,000 GB = 365 TB. With 3 copies: 1,095 TB.

**Failure:** Sizing with the average and forgetting the peak; forgetting copies (they triple the storage here); mixing bits and bytes (8 bits make 1 byte; network speeds are often quoted in bits). Say your arithmetic aloud so a wrong step is easy to fix.

## Topic: The latency ladder

**Definition:** Latency is the time one operation takes. A millisecond (ms) is a thousandth of a second, a microsecond (µs) a millionth, a nanosecond (ns) a billionth. A Google engineer, Jeff Dean, showed this table in a talk. The numbers are old, so treat them as orders of magnitude (the right count of zeros). A round trip is the time for a message to go and the answer to come back; a data centre is a building full of servers.

| Step | Time |
|---|---|
| L1 cache (the smallest memory inside the processor) | 0.5 ns |
| Main memory | 100 ns |
| Round trip inside one data centre | 500 µs |
| Disk seek (the head moves to the data) | 10 ms |
| Read 1 MB in order from disk | 30 ms |
| Packet from California to the Netherlands and back | 150 ms |

**Why:** Each step down is far slower, so a design that reads from disk or crosses the ocean on every request is slow. That is the reason for caches (copies kept close at hand; see System Design: Caching) and for servers near users.

**Example:** One memory read takes 100 ns. Scale that to 1 second (multiply by 10,000,000). A data centre round trip (500 µs) becomes 5,000 seconds, 83 minutes. A disk seek (10 ms) becomes 100,000 seconds, 1.16 days. California to the Netherlands and back (150 ms) becomes 17.4 days.

**Failure:** Quoting the table as exact for today's hardware; solid-state disks and faster networks have changed several values.

## Topic: Availability and the nines

**Definition:** Availability is the share of time (or of requests) in which the service works. People say "nines": 99.9% is "three nines". The SRE book (chapter 4) calls Google Compute Engine's published target of 99.95% "three and a half nines". Downtime allowed:

| Availability | Per year | Per 30 days |
|---|---|---|
| 99.9% | 525.6 min (8.76 h) | 43.2 min |
| 99.95% | 262.8 min | 21.6 min |
| 99.99% | 52.6 min | 4.3 min |

**Why:** Each extra nine is ten times less downtime and costs more effort. Services in a chain lower availability: two in a row, each 99.9%, give 0.999 × 0.999 = 99.8001%. Two copies side by side, where either can answer, fail only when both fail: 1 − 0.001 × 0.001 = 99.9999%, if they fail independently.

**Example:** A checkout needs a login, a cart and a payment service in a row, each 99.95%. If they fail independently, 0.9995 × 0.9995 × 0.9995 = 99.8501%. Downtime a year is (1 − 0.998501) × 525,600 minutes, about 788 minutes (13.1 hours), three times that of one service.

**Failure:** Claiming "100%", or ignoring dependencies. "More copies is always more available" is wrong when the copies fail together (same data centre, same bad release), because they are not independent.

## Topic: SLI, SLO, SLA and the error budget

**Definition:** Three words from the SRE book (chapter 4). An SLI (service level indicator) is something you measure, such as request latency or error rate. An SLO (service level objective) is a target for it, for example "99.9% of requests succeed". An SLA (service level agreement) is a contract with users that says what happens if targets are missed, for example a refund; if nothing happens, it is an SLO, not an SLA. The error budget is the amount of failure the SLO still allows.

**Why:** It turns "be reliable" into something you can count. The book says to look at percentiles (the 99th percentile is the time that 99 of every 100 requests beat), because an average hides slow requests: its example is a typical request of 50 ms while 5% are 20 times slower.

**Example:** SLO 99.9% over 30 days leaves 43.2 minutes of failure; 99.95% leaves 21.6; 99.99% leaves 4.3. Many teams slow risky releases once it is used up.

**Failure:** Saying "SLA" for an internal target; picking a target from today's performance (the book advises against it); having many SLOs (the book advises few, loose at first).

## Questions

### How would you structure a system design answer?

I ask questions, list the requirements, estimate traffic and storage, sketch the API and data, draw a first design, go deep on one or two hard parts, and finish with failures and trade-offs. It is one way to use the time, not a rule.

### How do you estimate the load on a system?

Requests per day divided by 86,400 seconds gives requests per second. I multiply by a peak factor, for example 2, because the busiest moment sets the size. For storage: record size, times records per day, times days kept, times copies.

### What does 99.9% availability allow, and what is the difference between an SLO and an SLA?

About 8.76 hours a year, or 43.2 minutes in 30 days. An SLO is a target for something you measure. An SLA is a contract that says what happens when the target is missed.

## Mistakes

- Drawing boxes before asking questions or writing requirements.
- Sizing with the average load and forgetting the peak, or forgetting the copies in a storage estimate.
- Quoting the availability of one service when the request passes through several in a row, or saying replicas always raise availability.

## Quiz

### 100,000,000 users each make 20 reads a day. What is the average read rate (86,400 seconds in a day)?

- [ ] About 2,315 per second
- [x] About 23,148 per second
- [ ] About 231,481 per second
- [ ] About 46,296 per second

Explanation: 100,000,000 × 20 = 2,000,000,000 reads a day; divided by 86,400 this is 23,148 per second. 46,296 is the peak at twice the average.

### Two services are called one after the other. Each is 99.9% available and they fail independently. What is the availability of the whole request?

- [ ] 99.9%
- [ ] 99.9999%
- [x] 99.8001%
- [ ] 100%

Explanation: Both must work, so you multiply: 0.999 × 0.999 = 0.998001.

### In Jeff Dean's table (old numbers), roughly how many times slower is one disk seek than one main memory reference?

- [ ] About 100 times
- [ ] About 1,000 times
- [x] About 100,000 times
- [ ] About 10 million times

Explanation: A seek is 10,000,000 ns and a memory reference is 100 ns, so the ratio is 100,000.

### An SLO of 99.9% is set over 30 days. How much failure does the error budget allow?

- [ ] 4.3 minutes
- [ ] 21.6 minutes
- [x] 43.2 minutes
- [ ] 8.76 hours

Explanation: 30 days is 43,200 minutes and 0.1% of that is 43.2 minutes. 8.76 hours is for a whole year.

### A photo service has these four requirements. Which one is non-functional?

- [ ] A user can upload a photo
- [ ] A user can follow another user
- [x] A photo page opens in under 300 ms for 99% of requests
- [ ] A user can delete a comment

Explanation: Functional requirements say what the system does. A target for speed, availability, durability or scale says how well it must do it.

## Diagram

```json
{ "kind": "flow", "caption": "One way to spend 45 minutes on a design answer, in order: clarify the task, write the requirements, estimate numbers, sketch the data and API, draw a first design, go deep on one or two parts, then failures and trade-offs.", "steps": [{ "label": "1 Clarify the task" }, { "label": "2 Requirements" }, { "label": "3 Rough numbers" }, { "label": "4 Data and API" }, { "label": "5 First design" }, { "label": "6 Deep dive" }, { "label": "7 Failures, trade-offs" }] }
```

## Diagram

```json
{ "kind": "layers", "caption": "The latency ladder from Jeff Dean's talk (old numbers, orders of magnitude only), fastest at the top: L1 cache 0.5 ns, L2 cache 7 ns, main memory 100 ns, 1 MB read from memory 250 microseconds, data centre round trip 500 microseconds, disk seek 10 ms, 1 MB read from disk 30 ms, California to the Netherlands and back 150 ms.", "layers": [{ "label": "L1 cache reference: 0.5 ns" }, { "label": "L2 cache reference: 7 ns" }, { "label": "Main memory reference: 100 ns" }, { "label": "Read 1 MB from memory: 250 us" }, { "label": "Round trip in one data centre: 500 us" }, { "label": "Disk seek: 10 ms" }, { "label": "Read 1 MB from disk: 30 ms" }, { "label": "California to Netherlands and back: 150 ms" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Traffic estimate with the example numbers (assumptions). 100 million daily users make 20 reads each, which is 23,148 reads per second on average, and 2 writes each, which is 2,315 writes per second. Peak reads are twice the average, 46,296 per second.",
  "nodes": [ { "id": "u", "label": "100M users a day", "x": 12, "y": 50, "shape": "client" }, { "id": "r", "label": "Reads 23,148/s", "x": 50, "y": 18 }, { "id": "p", "label": "Peak 46,296/s", "x": 86, "y": 18 }, { "id": "w", "label": "Writes 2,315/s", "x": 50, "y": 82 } ],
  "edges": [ { "from": "u", "to": "r", "label": "20 reads each" }, { "from": "u", "to": "w", "label": "2 writes each" }, { "from": "r", "to": "p", "label": "x2 peak" } ] }
```

## Diagram

```json
{ "kind": "graph", "caption": "Storage estimate from the same example. The writes add 200 GB a day. Kept for 5 years that is 365 TB, and with 3 copies it is 1,095 TB.",
  "nodes": [ { "id": "d", "label": "200 GB a day", "x": 14, "y": 50, "shape": "database" }, { "id": "f", "label": "365 TB in 5 years", "x": 50, "y": 50, "shape": "database" }, { "id": "c", "label": "1,095 TB, 3 copies", "x": 86, "y": 50, "shape": "database" } ],
  "edges": [ { "from": "d", "to": "f", "label": "x 5 years" }, { "from": "f", "to": "c", "label": "x 3" } ] }
```
