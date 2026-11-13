---
id: hld-case-ride-sharing
title: "Case Study: Ride Sharing"
next: hld-case-web-crawler
roadmapSteps: backend:deployment-cloud, dsa:graphs-traversal
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-drafts.md. Numbers from docs/content/checks/hld-case-check.py (section 9). -->

## Overview

A ride-sharing service shows nearby drivers to a rider and gives each ride request to one driver. This note builds one reasonable design from stated assumptions. The central trade-off is speed against exactness: a grid index finds nearby drivers by checking a few cells, not every driver, and an atomic claim (one step that cannot be split) makes sure a driver gets only one ride. After this note you can explain the grid search, why it gives the right answer, and how a match stays safe when drivers decline or go offline.

## Topic: Requirements and scope

**Definition:** We build: drivers send their location; a rider requests a ride and is matched to a nearby driver who accepts. We leave out pricing, route planning and arrival-time estimates, payments and ratings.

**Why:** Pricing and routing are separate designs. Clarify first: how many drivers online, how fresh must positions be, and what happens when nobody is nearby?

**Example:** Requirements: (1) the location of a driver is updated every few seconds; (2) a rider's request finds the nearest available drivers fast; (3) one driver gets one ride at a time; (4) a request is not lost if a driver does not answer. Out of scope: pricing, routing.

**Failure:** If requirement 3 is skipped, two riders may be promised the same driver. The follow-up: "what if the driver's phone goes offline after the offer?"

## Topic: Numbers

**Definition:** Estimates for update traffic, memory and request rate. Every input is an assumption, not a real company's figure.

**Why:** The update rate shows the index must live in memory, and the request rate shows matching is small beside it.

**Example:** Assumption: 1,000,000 drivers online, one update every 4 seconds, 100 bytes each: 250,000 updates a second, 25 MB a second. Latest positions only: 1,000,000 x 100 bytes = 100 MB. Keeping every update (25 MB x 86,400 s) would add about 2.16 TB a day. Assumption: 100,000 ride requests a minute in the busiest hour: 1,667 requests a second.

**Failure:** If drivers update every second, updates quadruple to 1,000,000 a second; the index must then be split by area.

## Topic: API and data

**Definition:** Calls: `POST /drivers/{id}/location` sends a position; `POST /rides` requests a ride from a pickup point; `POST /offers/{id}/accept` and `/decline` answer an offer. Records: a driver (id, status, latest position) and a ride (id, rider, driver, state).

**Why:** The latest position changes constantly and is only useful now, so it goes in memory. Rides must survive a crash, so they go in a database.

**Example:** `driver {id: 7, status: "available", lat: 12.97, lng: 77.59}`.

**Failure:** The model cannot answer "who was near this spot an hour ago" unless history is stored too; it is written separately (see below).

## Topic: The first design

**Definition:** Parts (diagram 1): a location service with an in-memory grid index, a matching service, a rides database and a queue that carries location history to storage. 

**Why:** Updates are frequent and tiny, so they bypass the database; only the ride, which matters for money and safety, is stored durably.

**Example:** Write path (diagram 2): 1 the driver app sends a position; 2 the location service moves the driver in the index; 3 the same update goes to a queue; 4 a consumer stores history. Read path (diagram 3): 1 rider requests a ride; 2 matching asks the index for drivers near the pickup; 3 it offers the ride to a few of them.

**Failure:** First bottleneck: one index machine taking 250,000 updates a second. Fix: partition by area (see System Design: Replication and Partitioning).

## Topic: Finding nearby drivers

**Definition:** The decision: divide the city into square cells and keep, for each cell, the drivers inside it. A geohash (a string that names a cell; nearby places share a prefix, see System Design: Storage and Indexes) is one way to name cells. To find drivers, look in the rider's cell and the eight cells around it, a 3 by 3 block.

**Why:** Why the block works: if cells are 1 km wide, any point within 1 km of the rider lies in the rider's cell or a neighbour, so a driver within 1 km is never missed (our reasoning). Checking all drivers is the rejected alternative. A hexagonal grid is another option: the H3 documentation (version 4.x, read in 2026) describes H3 as a hierarchical hexagonal grid with 16 resolutions, where each cell has seven children at the next finer level, and says the sphere cannot be tiled with hexagons alone, so each resolution has 12 pentagons. The page does not say why hexagons are better, so we make no claim about it.

**Example:** Simulation (assumption: 10,000 drivers placed uniformly on a 20 km by 20 km city, 1 km cells, 1,000 requests): the grid checked 211.0 drivers a request against 10,000 for checking everyone, found a driver in 1,000 of 1,000 requests, and gave the same nearest driver as the full check in 1,000 of 1,000. Uniform positions are an assumption; real cities are uneven.

**Failure:** In thin areas the 3 by 3 block may hold nobody, or the best driver found may be farther than 1 km, where a closer driver could lie outside the block. Fix: widen to the next ring of cells until a driver is found and the best distance is within what the rings cover. Dense areas put thousands of drivers in one cell; use smaller cells there. Cell borders: a nearby driver in the next cell is why we always include neighbours.

## Topic: Matching one driver to one rider

**Definition:** The decision: send the offer to a few nearby available drivers, and make the claim atomic. Claim = one step that changes a driver from `available` to `reserved for ride r` only if still `available` (a compare-and-set). Whoever succeeds first gets the driver; the other request moves on.

**Why:** Check-then-write is wrong when requests overlap: two riders both read "available" and both write. The atomic step lets only one succeed (see System Design: Consistency and CAP). The rejected alternative: a lock that a crashed server may never release. If a lock is used, it needs a lease and a fencing token (see System Design: Consensus and Coordination).

**Example:** Rider R1 and R2 both pick driver 7. Both send a claim; the store accepts R1 and refuses R2, which tries driver 9. Offers carry a timeout (assumption: 15 seconds). A decline or timeout frees the driver and the offer goes to the next candidate. An offline driver simply never answers, so the timeout handles it the same as a decline.

**Failure:** A driver accepts after the timeout. The accept names the offer id; the server checks the offer is still open and rejects a late one. Request rate is modest: 1,667 a second under our assumption, so the claim store is not the first limit.

## Topic: Failures and scaling

**Definition:** Failures: the index machine loses its memory, a matching server crashes mid-offer, a driver goes offline.

**Why:** The index is only a cache of the latest positions, so losing it must be cheap to repair.

**Example:** The index machine restarts empty. Drivers send their next update within 4 seconds (assumption), and the index fills again. For a short time riders see fewer drivers. Rides in the database are untouched.

**Failure:** At 10x drivers, the index is split by city area; drivers near an area border are stored in the area of their cell, and a search near the border also asks the neighbouring area.

## Questions

### How do you find nearby drivers fast?

Keep drivers in grid cells in memory. Look at the rider's cell and its eight neighbours; if nobody is found, widen the ring.

### Why does the 3 by 3 block give the right answer?

With 1 km cells, anything within 1 km is inside the block. In our simulation the answer matched the full check 1,000 of 1,000 times.

### How do you stop two riders getting one driver?

An atomic claim: change the driver from available to reserved only if still available. One request wins.

### What if the driver does not answer?

The offer times out and goes to the next driver.

## Mistakes

- "Store every location update in the main database." 250,000 writes a second is too much; keep the latest in memory.
- "Check all drivers." It is 10,000 against 211 in our simulation.
- "Read the driver's status, then write it." Two riders can both read available.

## Quiz

### How many updates a second: 1,000,000 drivers, one update every 4 seconds?

- [ ] 25,000
- [x] 250,000
- [ ] 1,000,000
- [ ] 4,000,000

Explanation: 1,000,000 divided by 4.

### In our simulation, how many drivers did the grid check per request?

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
{ "kind": "graph", "caption": "Main architecture (our own design). The driver app sends positions (1) to the location service, which updates the in-memory grid index (2) and puts history on a queue (3). The rider's request reaches matching (4), which asks the index for nearby drivers (5) and saves the ride in the rides database (6).", "groups": [{ "id": "dc", "label": "Data centre" }], "nodes": [{ "id": "d", "label": "Driver app", "x": 6, "y": 20, "shape": "client" }, { "id": "l", "label": "Location service", "x": 36, "y": 20, "group": "dc" }, { "id": "i", "label": "Grid index", "x": 68, "y": 20, "shape": "cache", "group": "dc" }, { "id": "q", "label": "History queue", "x": 36, "y": 50, "shape": "queue", "group": "dc" }, { "id": "m", "label": "Matching", "x": 68, "y": 80, "group": "dc" }, { "id": "r", "label": "Rider app", "x": 6, "y": 80, "shape": "client" }, { "id": "db", "label": "Rides DB", "x": 36, "y": 80, "shape": "database", "group": "dc" }], "edges": [{ "from": "d", "to": "l", "step": 1 }, { "from": "l", "to": "i", "step": 2 }, { "from": "l", "to": "q", "step": 3, "dashed": true }, { "from": "r", "to": "db", "step": 4 }, { "from": "m", "to": "i", "step": 5 }, { "from": "m", "to": "db", "step": 6 }] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "Matching: the rider requests a ride, matching finds nearby drivers in the index, claims one atomically and offers the ride; if the driver declines, the next one is tried.", "actors": [{ "id": "r", "label": "Rider" }, { "id": "m", "label": "Matching" }, { "id": "i", "label": "Grid index" }, { "id": "d", "label": "Driver" }], "messages": [{ "from": "r", "to": "m", "label": "Request ride" }, { "from": "m", "to": "i", "label": "Drivers near pickup?" }, { "from": "i", "to": "m", "label": "Drivers 7, 9, 12", "dashed": true }, { "from": "m", "to": "i", "label": "Claim driver 7 if available" }, { "from": "m", "to": "d", "label": "Offer (15 s)" }, { "from": "d", "to": "m", "label": "Decline", "dashed": true }, { "from": "m", "to": "i", "label": "Release 7, claim 9" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "The 3 by 3 search. The rider is in the middle cell. The search reads that cell and the eight around it, nine in all, so any driver within one cell width of the rider is included. Drivers outside the block are not read.", "nodes": [{ "id": "a", "label": "NW", "x": 20, "y": 15 }, { "id": "b", "label": "N", "x": 50, "y": 15 }, { "id": "c", "label": "NE", "x": 80, "y": 15 }, { "id": "d", "label": "W", "x": 20, "y": 50 }, { "id": "e", "label": "Rider cell", "x": 50, "y": 50, "shape": "client" }, { "id": "f", "label": "E", "x": 80, "y": 50 }, { "id": "g", "label": "SW", "x": 20, "y": 85 }, { "id": "h", "label": "S", "x": 50, "y": 85 }, { "id": "i", "label": "SE", "x": 80, "y": 85 }], "edges": [{ "from": "e", "to": "b" }, { "from": "e", "to": "d" }, { "from": "e", "to": "f" }, { "from": "e", "to": "h" }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "Failure case: the index machine restarts empty, drivers send their next position within about 4 seconds (assumption), the index fills again, and matching returns to normal. Rides in the database are never lost.", "steps": [{ "label": "Index machine restarts" }, { "label": "Index is empty" }, { "label": "Drivers send updates" }, { "label": "Index refilled" }] }
```
