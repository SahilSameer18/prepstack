---
id: hld-approach-estimation
title: The Design Interview and Back-of-the-Envelope Numbers
next: hld-scaling-basics
roadmapSteps: backend:deployment-cloud, devops-cloud:monitoring-reliability
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-phase1.md. Numbers from docs/content/checks/hld-check.py. -->

## Overview

A system design interview gives you one vague sentence, such as "design a photo service", and about 45 minutes. The interviewer watches how you organise the problem, whether you ask what the system must do, and whether your rough numbers are sensible. Nobody expects exact answers.

After this section you can lay out a design answer in clear steps, tell functional from non-functional requirements, estimate traffic and storage on paper, use the latency numbers every engineer should know, and talk about availability in "nines" (99.9% and so on).

## Topic: How to organise a 45-minute answer

**Definition:** No official rule sets the order of a design answer. One way to organise the time, used by public interview guides, is: (1) ask questions until the task is clear, (2) write the requirements, (3) estimate rough numbers, (4) sketch the data and the API (the list of calls other programs can make), (5) draw a first design with a few boxes, (6) go deep on one or two parts where the real difficulty is, (7) say what can fail and what you would change if the numbers grew. This is a habit that works, not a fact about how companies grade.

**Why:** Without an order, candidates draw boxes first and find out later that they solved the wrong problem. The numbers (step 3) also decide the boxes: 20 requests a second and 20,000 need different designs.

**Example:** Task "design a photo-sharing service". Step 1: ask whether users upload, view or both. Step 2: write "upload a photo, view a feed, 99.9% available". Step 3: guess users and sizes. Step 4: write `POST /photos` and `GET /feed`. Step 5: draw app servers and storage. Step 6: pick the feed or the photo storage and discuss it for ten minutes.

**Failure:** Usual probes: "why did you spend 20 minutes on one box?" (time) and "what happens when this box fails?" (step 7). Also naming "the right answer" instead of the trade-off: every choice has a cost, so say it.

## Topic: Functional and non-functional requirements

**Definition:** A functional requirement says what the system does ("a user can post a photo"). A non-functional requirement says how well: latency (how long one request takes), throughput (requests handled per second), availability (the share of time, or of requests, that work), durability (saved data is not lost), consistency (everyone sees the same, latest data) and scale (how many users and how much data). The SRE book (Google's *Site Reliability Engineering*, chapter 4) defines latency, throughput, availability and durability as things you can measure.

**Why:** The non-functional requirements pick the design. A bank balance needs consistency and durability; a "likes" counter may show an old number for a few seconds.

**Example:** "Photo service" as numbers (assumption): a photo page opens in under 300 ms; 99.9% of requests succeed; an uploaded photo is never lost; the like count may be a few seconds old.

**Failure:** Words with no numbers ("fast and scalable"); the interviewer asks "how fast? how many?". Also asking for everything: you cannot have the strongest consistency, lowest latency and highest availability at no cost, so say which you would give up first.

## Topic: Estimating traffic and storage

**Definition:** Back-of-the-envelope means a quick estimate with round numbers. Traffic: requests per day divided by seconds in a day gives requests per second (QPS, queries per second). A day has 86,400 seconds; round to about 100,000 (86,400 is 14 percent lower, good enough for a first estimate). Peak is higher than average, so multiply by a peak factor. Storage: new data per day, times days kept, times copies.

**Why:** The result tells you whether one machine is enough and whether the data fits on one disk. The busiest second breaks a system, not the average. The SRE book's example: a service handling 200 requests in every even second and none in odd seconds has the same average as a steady 100 a second, but its peak is twice the average.

**Example:** Assumptions, not real data: 100,000,000 daily active users (people who use it each day), each doing 20 reads and 2 writes a day.
- Average read QPS: 100,000,000 × 20 / 86,400 = 23,148. Write QPS: 100,000,000 × 2 / 86,400 = 2,315.
- Peak at 2 times average (assumption): 46,296 reads and 4,630 writes per second.
- New data at 1 KB a write: 100,000,000 × 2 × 1 KB = 200 GB a day. Kept 5 years, no copies: 200 GB × 365 × 5 = 365 TB. With 3 copies: 1,095 TB.
- Read traffic at 2 KB a read: 23,148 × 2 KB = 46.3 MB per second.

**Failure:** Sizing with the average and forgetting the peak; forgetting copies (they triple the storage here); mixing reads and writes (10 times apart here, and reads need caches and copies while writes need something else). Say your arithmetic aloud; a wrong number with clear steps is easy to fix.

## Topic: Powers of two and units

**Definition:** Computers count in powers of two. Each step of 10 in the power gives about a thousand times more: 2^10 = 1,024 bytes (KB, close to 10^3); 2^20 = 1,048,576 (MB, 10^6); 2^30 = 1,073,741,824 (GB, 10^9); 2^40 = 1,099,511,627,776 (TB, 10^12); 2^50 = 1,125,899,906,842,624 (PB, 10^15).

**Why:** In an estimate only the rough size matters, so treat KB, MB, GB, TB and PB as steps of 1,000. It keeps the sums easy to do aloud.

**Example:** 1 billion rows of 200 bytes: 10^9 × 200 = 200 GB. This fits on one disk but not in the memory of an ordinary server.

**Failure:** Mixing bits and bytes (8 bits make 1 byte; network speeds are often quoted in bits) or losing three zeros between MB and GB. Write the unit on every number.

## Topic: The latency ladder

**Definition:** Latency is the time one operation takes. Jeff Dean (Google) showed a table of times every engineer should know in a talk about 2007. The numbers are about 2007, so treat them as orders of magnitude (the right count of zeros), not today's exact values. Fastest to slowest: L1 cache (the smallest memory inside the processor) 0.5 ns; L2 cache 7 ns; main memory 100 ns; read 1 MB in order from memory 250,000 ns (250 µs); round trip inside one data centre 500 µs; disk seek (the head moves to the data) 10 ms; read 1 MB in order from disk 30 ms; a packet from California to the Netherlands and back 150 ms. A nanosecond (ns) is a billionth of a second.

**Why:** It tells you what to avoid. Each step down is far slower, so a design that reads from disk or crosses the ocean on every request is slow. That is the reason for caches (see `hld-caching`) and for keeping servers near users.

**Example:** Imagine a main memory reference took 1 second. A round trip inside the data centre would take 5,000 seconds (83 minutes), a disk seek 100,000 seconds (1.16 days), California to the Netherlands and back 17.4 days. A disk seek is 100,000 times a memory reference; reading 1 MB from disk (30 ms) is 120 times slower than from memory (250 µs).

**Failure:** Quoting the table as exact for today's hardware (solid-state disks and faster networks have changed several values). Say "about 2007, orders of magnitude" when you use it.

## Topic: Availability and the nines

**Definition:** Availability is the share of time (or of requests) in which the service works. People say "nines": 99.9% is "three nines". The SRE book (chapter 4) notes Google Compute Engine's published target of 99.95%, which it calls "three and a half nines". Downtime allowed (per year, per 30 days, per day): 99%: 5,256 min (87.6 h), 432 min, 864 s. 99.9%: 525.6 min (8.76 h), 43.2 min, 86.4 s. 99.95%: 262.8 min, 21.6 min, 43.2 s. 99.99%: 52.6 min, 4.3 min, 8.6 s. 99.999%: 5.3 min, 0.4 min, 0.9 s.

**Why:** Each extra nine is ten times less downtime and costs more effort. Services in a chain also lower availability: if a request needs two services in a row, each 99.9%, then 0.999 × 0.999 = 99.8001%. Two copies in parallel, where either can answer, fail only when both fail: 1 − 0.001 × 0.001 = 99.9999%, if they fail independently.

**Example:** A checkout needs a login, a cart and a payment service in a row, each 99.95%. If they fail independently, 0.9995 × 0.9995 × 0.9995 = 99.8501%. Downtime a year is (1 − 0.998501) × 525,600 minutes, about 788 minutes (13.1 hours), three times the 262.8 minutes of one service.

**Failure:** Claiming "100%", or ignoring dependencies. "More copies is always more available" is wrong when the copies fail together (same data centre, same bad release, same overloaded database), because the independence assumption fails.

## Topic: SLI, SLO, SLA and the error budget

**Definition:** Three words from the SRE book (chapter 4). An SLI (service level indicator) is something you measure, such as request latency or error rate. An SLO (service level objective) is a target for it, for example "99.9% of requests succeed". An SLA (service level agreement) is a contract with users that says what happens if targets are missed, often money back; if nothing happens, it is an SLO, not an SLA. The error budget is the amount of failure the SLO still allows.

**Why:** It turns "be reliable" into something you can count. The book also says to look at percentiles (the 99th is the value that 99 of 100 requests beat), because an average hides slow requests: its example is a typical request of 50 ms while 5% are 20 times slower.

**Example:** SLO 99.9% over 30 days leaves 43.2 minutes of failure; 99.95% leaves 21.6; 99.99% leaves 4.3. When the month's budget is used up, the team stops shipping risky changes.

**Failure:** Saying "SLA" for an internal target; picking a target from today's performance (the book advises against it); having many SLOs (the book advises few, loose at first, tightened over time).

## Questions

### How would you structure a system design answer?

I ask questions to pin down the task, list functional and non-functional requirements, estimate traffic and storage, sketch the API and data, draw a first design, go deep on one or two hard parts, and finish with failures and trade-offs. It is one way to use the time, not a rule.

### How do you estimate the load on a system?

Requests per day divided by 86,400 seconds gives average requests per second. I multiply by a peak factor, say 2, because the busiest moment sets the size. For storage: record size, times records per day, times days kept, times copies.

### What latency numbers should I remember?

Memory about 100 ns, a round trip in one data centre about 500 µs, a disk seek about 10 ms, an ocean round trip about 150 ms (Dean's table, about 2007, orders of magnitude). Each step is far slower, so I keep slow steps off the request path.

### What does 99.9% availability allow, and what is the difference between an SLO and an SLA?

About 8.76 hours of downtime a year, or 43.2 minutes in 30 days. An SLO is a target for something you measure. An SLA is a contract that says what happens when the target is missed.

## Mistakes

- Drawing boxes before asking questions or writing requirements. The requirements and numbers decide the boxes.
- Sizing with the average load and forgetting the peak, or forgetting the copies in a storage estimate.
- Quoting the availability of one service when the request passes through several in a row, or saying that adding replicas always raises availability.

## Quiz

### 100,000,000 users each make 20 reads a day. What is the average read rate (86,400 seconds in a day)?

- [ ] About 2,315 per second
- [x] About 23,148 per second
- [ ] About 231,481 per second
- [ ] About 46,296 per second

Explanation: 100,000,000 × 20 = 2,000,000,000 reads a day; divided by 86,400 this is 23,148 per second. 46,296 is the peak if peak is twice the average.

### Two services are called one after the other. Each is 99.9% available and they fail independently. What is the best availability of the whole request?

- [ ] 99.9%
- [ ] 99.9999%
- [x] 99.8001%
- [ ] 100%

Explanation: Both must work, so you multiply: 0.999 × 0.999 = 0.998001. 99.9999% is the figure for two copies in parallel where either can answer.

### In Jeff Dean's table (about 2007), roughly how many times slower is one disk seek than one main memory reference?

- [ ] About 100 times
- [ ] About 1,000 times
- [x] About 100,000 times
- [ ] About 10 million times

Explanation: A seek is 10,000,000 ns and a memory reference is 100 ns, so the ratio is 100,000. These are orders of magnitude, not exact values for today.

### An SLO of 99.9% is set over 30 days. How much failure does the error budget allow?

- [ ] 4.3 minutes
- [ ] 21.6 minutes
- [x] 43.2 minutes
- [ ] 8.76 hours

Explanation: 30 days is 43,200 minutes and 0.1% of that is 43.2 minutes. 8.76 hours is the allowance for a whole year.

### Which of these is a non-functional requirement?

- [ ] A user can upload a photo
- [ ] A user can follow another user
- [x] A photo page opens in under 300 ms for 99% of requests
- [ ] A user can delete a comment

Explanation: Functional requirements say what the system does. A target for speed, availability, durability or scale says how well it must do it.

## Diagram

```json
{ "kind": "flow", "caption": "One way to spend 45 minutes on a design answer, in order: clarify the task, write the requirements, estimate numbers, sketch the data and API, draw a first design, deep dive on one or two parts, then failures and trade-offs.", "steps": [{ "label": "1 Clarify the task" }, { "label": "2 Requirements" }, { "label": "3 Rough numbers" }, { "label": "4 Data and API" }, { "label": "5 First design" }, { "label": "6 Deep dive" }, { "label": "7 Failures and trade-offs" }] }
```

## Diagram

```json
{ "kind": "layers", "caption": "The latency ladder from Jeff Dean's talk (about 2007, orders of magnitude only), fastest at the top: L1 cache 0.5 ns, L2 cache 7 ns, main memory 100 ns, 1 MB read from memory 250 microseconds, data centre round trip 500 microseconds, disk seek 10 ms, 1 MB read from disk 30 ms, California to the Netherlands and back 150 ms.", "layers": [{ "label": "L1 cache reference: 0.5 ns" }, { "label": "L2 cache reference: 7 ns" }, { "label": "Main memory reference: 100 ns" }, { "label": "Read 1 MB from memory: 250 us" }, { "label": "Round trip in one data centre: 500 us" }, { "label": "Disk seek: 10 ms" }, { "label": "Read 1 MB from disk: 30 ms" }, { "label": "California to Netherlands and back: 150 ms" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "An estimate from users to storage, with the example numbers (assumptions). 100 million daily users make 23,148 reads and 2,315 writes per second on average; peak reads are 46,296 per second. The writes add 200 GB a day, which is 365 TB in 5 years, or 1,095 TB with 3 copies.",
  "nodes": [ { "id": "u", "label": "100M users a day", "x": 8, "y": 50, "shape": "client" }, { "id": "r", "label": "Reads 23,148/s", "x": 33, "y": 18 }, { "id": "p", "label": "Peak 46,296/s", "x": 66, "y": 18 }, { "id": "w", "label": "Writes 2,315/s", "x": 33, "y": 82 }, { "id": "d", "label": "200 GB a day", "x": 56, "y": 82, "shape": "database" }, { "id": "f", "label": "365 TB in 5 years", "x": 80, "y": 82, "shape": "database" }, { "id": "c", "label": "1,095 TB with 3 copies", "x": 80, "y": 50, "shape": "database" } ],
  "edges": [ { "from": "u", "to": "r", "label": "20 reads each" }, { "from": "u", "to": "w", "label": "2 writes each" }, { "from": "r", "to": "p", "label": "x2 peak" }, { "from": "w", "to": "d", "label": "x1 KB" }, { "from": "d", "to": "f" }, { "from": "f", "to": "c", "label": "x3" } ] }
```
