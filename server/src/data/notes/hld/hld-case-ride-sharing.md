---
id: hld-case-ride-sharing
title: "Case Study: Ride Sharing"
lastChecked: 2026-11-13
next: hld-case-web-crawler
roadmapSteps: backend:deployment-cloud, dsa:graphs-traversal
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-cases.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-case-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A ride-sharing service shows nearby drivers to a rider and gives each ride request to one driver. This note builds one reasonable design from stated assumptions. The central trade-off is speed against exactness: a grid index (a lookup structure that finds drivers by place) checks a few cells, not every driver, and an atomic claim (one step that cannot be split) makes sure a driver gets only one ride. The numbers are examples worked out with a short program. After this note you can explain the grid search, when it gives the right answer, and how a match stays safe when drivers decline or go offline.

## Topic: Requirements and scope

**Definition:** We build: drivers send their location; a rider requests a ride and is matched to a nearby driver who accepts. We leave out pricing, route planning, arrival-time estimates, payments and ratings.

**Why:** Clarify first: how many drivers online, how fresh must positions be, and what happens when nobody is nearby?

**Example:** Requirements: (1) the location of a driver is updated every few seconds; (2) a rider's request finds the nearest available drivers fast; (3) one driver gets one ride at a time; (4) a request is not lost if a driver does not answer.

**Failure:** If requirement 3 is skipped, two riders may be promised the same driver. The follow-up: "what if the driver's phone goes offline after the offer?"

## Topic: Numbers

**Definition:** An estimate is a rough calculation done before building. Every input is an assumption, not a real company's figure.

**Why:** The update rate shows the position index must live in memory, and the request rate shows matching is small beside it.

**Example:** Assumption: 1,000,000 drivers online, one update every 4 seconds, 100 bytes each.
- Updates: 1,000,000 / 4 = 250,000 a second; x 100 bytes = 25 MB a second.
- Latest positions only: 1,000,000 x 100 bytes = 100 MB.
- Keeping every update: 25 MB x 86,400 s = 2,160,000 MB = 2.16 TB a day.
- Assumption: 100,000 ride requests a minute in the busiest hour: 100,000 / 60 = 1,667 a second.

**Failure:** If drivers update every second, updates quadruple to 1,000,000 a second; the index may then need to be shared out over several machines, one area each (our estimate, not measured).

## Topic: API and data

**Definition:** Calls: `POST /drivers/{id}/location` sends a position; `POST /rides` requests a ride from a pickup point; `POST /offers/{id}/accept` and `/decline` answer an offer. Records: a driver's status (available or reserved) and a ride (id, rider, driver, state), both in the rides database; and a driver's latest position (id, lat, lng), only in the memory index.

**Why:** The latest position changes constantly and is only useful now, so it goes in memory. Rides and driver status must survive a crash, so they go in a database that supports a conditional update (change this only if it still looks like that).

**Example:** `driver {id: 7, status: "available"}` in the database; `7 -> (12.97, 77.59)` in the index.

**Failure:** The records cannot answer "who was near this spot an hour ago" unless history is stored too; it is written separately.

## Topic: The first design

**Definition:** Parts (diagram 1): a location service with an in-memory grid index (positions only), a matching service, a rides database (rides and driver status) and a queue that carries location history to storage, which is optional and used for analysis.

**Why:** Updates are frequent and tiny, so they bypass the database; only rides and statuses, which matter for money and safety, are stored durably.

**Example:** Write path: 1 the driver app sends a position; 2 the location service moves the driver in the index; 3 the same update goes to the queue; 4 a consumer stores history. Read path (diagram 2): 1 the rider requests a ride; 2 matching asks the index for drivers near the pickup; 3 it offers the ride to one of them (see Matching).

**Failure:** First bottleneck: one index machine taking 250,000 updates a second (our estimate, not measured). Fix: partition by area, one area per machine (see System Design: Replication and Partitioning).

## Topic: Finding nearby drivers

**Definition:** The decision: divide the city into square cells and keep, for each cell, the drivers inside it. To find drivers, look in the rider's cell and the eight cells around it, a 3 by 3 block. Cells can be named by a geohash (a string that names a cell; places with a long shared prefix are close, but close places can have different prefixes; see System Design: Storage and Indexes).

**Why:** Why the block works: picture a rider at the edge of the middle cell. A step of 1 km in any direction crosses at most one cell border, so it lands in the same cell or a neighbour. With 1 km cells, every driver within 1 km is inside the block (our reasoning). Cells of any shape work if the block reaches at least the search distance in every direction. Geohash cells are rectangles: 6 characters make about 1.2 km wide by 0.6 km tall at the equator, narrower away from it, so use the cell height when you plan the distance. Checking all drivers is the rejected alternative.

Another option is H3, a hexagon grid. Its documentation (version 4.x, read in 2026) says hexagons have 6 neighbours, all at the same distance, while squares have 8 at two distances, and that rings of hexagon neighbours approximate circles. We use squares to make the argument simple.

**Example:** The block gives the true nearest driver only when that driver is within about 1 km. Simulation: a 20 km by 20 km city, 1 km cells, 1,000 rider requests, drivers spread evenly (assumption).
- Dense, 10,000 drivers: the grid checked 211.0 drivers a request against 10,000 for checking everyone, found a driver in 1,000 of 1,000 requests, and matched the true nearest in 1,000 of 1,000.
- Thin, 100 drivers: the block held any driver in only 910 of 1,000 requests, and matched the true nearest in 877 of those 910.

Real cities are uneven, so test your own data.

**Failure:** In areas with few drivers the 3 by 3 block may be empty. Then search the next ring of cells, and keep going outward. A driver found at 1.5 km might not be the closest, because one at 1.2 km could sit in a cell just outside the block. So keep widening until the best driver found is closer than the distance the rings cover. Dense areas put thousands of drivers in one cell; use smaller cells there.

## Topic: Matching one driver to one rider

**Definition:** The decision: offer the ride to one driver at a time, nearest first, and make the claim atomic. A claim is one step that changes a driver from `available` to `reserved for ride r`, but only if the driver is still available at that moment. This is called compare-and-set. It is atomic: no other request can slip in between the check and the change. Whoever succeeds first gets the driver; the other request moves on.

**Why:** Check-then-write is wrong when requests overlap: two riders both read "available" and both write. The atomic step lets only one succeed (see System Design: Consistency and CAP). The rejected alternative: a lock (a flag one request holds while it works), because a crashed server may never release it. A lock needs a lease (a lock that expires by itself) and a fencing token (a growing number that lets the store reject an old lock holder); see System Design: Consensus and Coordination.

**Example:** Riders R1 and R2 both pick driver 7. Both send a claim; the rides database accepts R1 and refuses R2, which tries driver 9. Offers carry a timeout (assumption: 15 seconds). A decline or timeout releases the driver and the offer goes to the next candidate. An offline driver never answers, so the timeout handles it like a decline.

**Failure:** A driver accepts after the timeout. The accept names the offer id; the server checks the offer is still open and rejects a late one. Request rate is modest: 1,667 a second, so the database that records claims is not the first thing to run out of capacity (our estimate, not measured).

## Topic: Failures and scaling

**Definition:** Failures: the index machine loses its memory, a matching server crashes mid-offer, a driver goes offline.

**Why:** The index holds only positions, so losing it is cheap to repair. Reservations are in the database and survive.

**Example:** The index machine restarts empty. Drivers send their next update within 4 seconds (assumption), and the index fills again. For a short time riders see fewer drivers. Rides and reservations are untouched, so no driver is offered twice.

**Failure:** With ten times more drivers, the index is split by city area; a driver is stored in the area of their cell, and a search near the border also asks the neighbouring area.

## Questions

### How do you find nearby drivers fast?

Keep drivers in grid cells in memory. Look at the rider's cell and its eight neighbours; if nobody is found, widen the ring.

### Why does the 3 by 3 block give the right answer?

Only if the nearest driver is within 1 km; otherwise widen the ring. With 10,000 drivers it matched the full check 1,000 of 1,000 times. With 100 drivers in the same city it found any driver in 910 of 1,000 requests and the true nearest in 877 of them.

### How do you stop two riders getting one driver?

An atomic claim: change the driver from available to reserved only if still available. One request wins.

### What if the driver does not answer?

The offer times out and goes to the next driver.

## Mistakes

- "Store every location update in the main database." 250,000 writes a second is too much; keep the latest in memory.
- "Check all drivers." It is 10,000 against 211 in our dense simulation.
- "Read the driver's status, then write it." Two riders can both read available.

## Quiz

### How many updates a second: 1,000,000 drivers, one update every 4 seconds?

- [ ] 25,000
- [x] 250,000
- [ ] 1,000,000
- [ ] 4,000,000

Explanation: 1,000,000 divided by 4.

### In our dense simulation (10,000 drivers), how many drivers did the grid check per request?

- [ ] 10,000
- [ ] 1,000
- [x] About 211
- [ ] 9

Explanation: The 3 by 3 block of 1 km cells held about 211 drivers on average.

### Why include the eight neighbouring cells?

- [ ] To use more memory
- [x] A close driver may be just across a cell border
- [ ] To count drivers
- [ ] To avoid the queue

Explanation: Distance, not cell, decides who is near.

### What makes a claim atomic?

- [ ] A long timeout
- [ ] Two reads
- [x] Changing status only if it is still available, in one step
- [ ] A bigger grid

Explanation: Only one of overlapping requests can succeed.

### What happens when a driver is offline after an offer?

- [ ] The ride is lost
- [ ] The rider waits forever
- [x] The offer times out and goes to another driver
- [ ] The driver is removed

Explanation: A timeout treats silence as a decline.

## Diagram

```json
{ "kind": "graph", "caption": "Main architecture (our own design). The driver app sends positions (1) to the location service, which updates the in-memory grid index (2) and puts history on a queue (3). The rider's request reaches matching (4), which asks the index for nearby drivers (5) and claims the driver and saves the ride in the rides database (6).", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "d", "label": "Driver app", "x": 12, "y": 18, "shape": "client" }, { "id": "l", "label": "Location service", "x": 45, "y": 18, "group": "dc" }, { "id": "i", "label": "Grid index", "x": 82, "y": 18, "shape": "cache", "group": "dc" }, { "id": "q", "label": "History queue", "x": 45, "y": 51, "shape": "queue", "group": "dc" }, { "id": "r", "label": "Rider app", "x": 12, "y": 84, "shape": "client" }, { "id": "m", "label": "Matching", "x": 45, "y": 84, "group": "dc" }, { "id": "db", "label": "Rides DB", "x": 82, "y": 84, "shape": "database", "group": "dc" }], "edges": [{ "from": "d", "to": "l", "step": 1 }, { "from": "l", "to": "i", "step": 2 }, { "from": "l", "to": "q", "step": 3, "dashed": true }, { "from": "r", "to": "m", "step": 4 }, { "from": "m", "to": "i", "step": 5 }, { "from": "m", "to": "db", "step": 6 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Matching, after the rider's request has reached matching. It asks the index for drivers near the pickup (1, 2), claims driver 7 in the rides database only if still available (3) and offers the ride to that one driver (4). If the driver declines (5), it releases 7 and claims the next, 9 (6). One offer at a time.", "actors": [{ "id": "m", "label": "Matching" }, { "id": "i", "label": "Grid index" }, { "id": "db", "label": "Rides DB" }, { "id": "d", "label": "Driver" }], "messages": [{ "from": "m", "to": "i", "label": "Drivers near pickup?" }, { "from": "i", "to": "m", "label": "Drivers 7, 9, 12", "dashed": true }, { "from": "m", "to": "db", "label": "Claim 7 if available" }, { "from": "m", "to": "d", "label": "Offer (15 s)" }, { "from": "d", "to": "m", "label": "Decline", "dashed": true }, { "from": "m", "to": "db", "label": "Release 7, claim 9" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "The 3 by 3 search. The rider is in the middle cell. The lines go from the middle cell to the four side cells and the four corner cells: nine cells in all are read, so any driver within one cell width of the rider is included. Drivers outside the block are not read.", "nodes": [{ "id": "a", "label": "NW", "x": 20, "y": 15 }, { "id": "b", "label": "N", "x": 50, "y": 15 }, { "id": "c", "label": "NE", "x": 80, "y": 15 }, { "id": "d", "label": "W", "x": 20, "y": 50 }, { "id": "e", "label": "Rider cell", "x": 50, "y": 50, "shape": "client" }, { "id": "f", "label": "E", "x": 80, "y": 50 }, { "id": "g", "label": "SW", "x": 20, "y": 85 }, { "id": "h", "label": "S", "x": 50, "y": 85 }, { "id": "i", "label": "SE", "x": 80, "y": 85 }], "edges": [{ "from": "e", "to": "a" }, { "from": "e", "to": "b" }, { "from": "e", "to": "c" }, { "from": "e", "to": "d" }, { "from": "e", "to": "f" }, { "from": "e", "to": "g" }, { "from": "e", "to": "h" }, { "from": "e", "to": "i" }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "Failure case: the index machine restarts empty, drivers send their next position within about 4 seconds (assumption), the index fills again, and matching returns to normal. Rides and reservations in the database are never lost.", "steps": [{ "label": "Index machine restarts" }, { "label": "Index is empty" }, { "label": "Drivers send updates" }, { "label": "Index refilled" }] }
```
