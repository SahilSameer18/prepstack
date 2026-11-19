---
id: hld-scaling-basics
title: Scalability, Load Balancing and Stateless Services
lastChecked: 2026-11-13
next: hld-caching
roadmapSteps: fullstack:deployment-scaling, backend:deployment-cloud
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/hld-drafts.md and hld-phase1.md. Numbers computed by docs/content/checks/hld-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

A service that works for 100 users often breaks at 100,000. Scaling means handling more load by adding machines; the load balancer (a program or device that spreads incoming requests over many servers) makes many servers look like one. Interviewers ask how you would grow a service, why servers should be stateless (keep no user data in their own memory), and how requests are spread.

After this section you can tell latency from throughput, choose between a bigger machine and more machines, compare ways of spreading requests, explain why `hash(key) mod N` breaks, and size a service with spare capacity.

## Topic: Scalability, performance, latency and throughput

**Definition:** Latency is how long one request takes to get its answer. Throughput is how many requests the system finishes per second. The SRE book (Google's free book *Site Reliability Engineering*, chapter 4) uses both as service indicators. Performance, in this note's wording, is how fast the system is for one user. Scalability is whether it keeps working well when the load grows and you add resources.

**Why:** Adding machines raises throughput; it does not make one request faster when the system is not overloaded. "Make it faster" and "handle more users" are two different questions.

**Example:** Little's law is plain arithmetic: requests in progress = requests per second × seconds each takes. At 1,000 requests per second and 100 ms (0.1 s) each, 1,000 × 0.1 = 100 requests are in progress at any moment. If a slow database pushes each request to 2 s, 1,000 × 2 = 2,000 are in progress: 20 times as many threads (workers that each handle one request at a time) and as much memory.

**Failure:** Saying "add servers" for a slow single request, or measuring only the average. A percentile is better: the 95th is the time that 95 of every 100 requests beat. The SRE book's example: a typical request takes 50 ms but 5% are 20 times slower.

## Topic: Vertical and horizontal scaling, and stateless servers

**Definition:** Vertical scaling (scale up) means moving to a bigger machine: more processor, more memory. Horizontal scaling (scale out) means adding more machines and sharing the work. State is data a server remembers between requests, such as who is logged in. A stateless server keeps no such data in its own memory; it reads it from a shared place (a database or a shared cache) for each request, so any server can answer any request.

**Why:** A bigger machine is simple but has a ceiling and is one point of failure (if it dies, everything stops). Many machines only work well if any server can take any request. A server holding a user's session in its own memory ties that user to it.

**Example:** A login session is stored on server 2. The next request goes to server 3, which has never seen it, and the user is logged out. Two fixes: sticky sessions (the balancer always sends a user to the same server), or a shared store that every server reads.

**Failure:** Sticky sessions have costs: if the server dies, its users lose their sessions, and a few heavy users can overload one server (this note's own reasoning). A shared store must itself be fast and reliable. Interviewers often ask "where does the state live?" when you only say "just add servers".

## Topic: How requests are spread

**Definition:** Three ways to pick a server:
- Round robin: each new request goes to the next server in the list, in turn.
- Least loaded: the request goes to the server with the fewest requests in progress.
- Weighted round robin: stronger servers get more.

What Google found (SRE book, chapter 20, load balancing inside a data centre):
- Simple round robin was its most common approach for years, yet it could leave about a 2x spread in processor use between the least and most loaded server. Reasons: requests cost different amounts (the most expensive can use 1,000 times the processor time of the cheapest), machines differ, and clients send at different rates.
- In least loaded, each client counts only its own requests in progress, so it cannot see other clients' load. The spread stayed near 2x.
- In weighted round robin, servers report their load in each reply, and the spread dropped greatly (the book gives no figures).

**Why:** One overloaded server answers slowly while others sit idle; the busiest server decides how much traffic the group can take.

**Example:** A small program simulated 5 servers and 1,000 requests with made-up costs from small to large. Round robin gave the busiest server 1.11 times the average work. A perfect balancer that always picks the least busy server left the busiest with 1.032 times the quietest server's work, almost level.

**Failure:** Counting requests, not cost: ten cheap requests are not the same as ten expensive ones. Also the book's "sinkhole": a broken server that returns errors fast looks lightly loaded and attracts more traffic; counting its recent errors as load fixes it. For layer 4 and layer 7 balancers, the reverse proxy and the CDN, see Computer Networks: System Design Concepts (`cn-system-design-concepts`).

## Topic: Health checks, lame duck and subsets

**Definition:**
- Health check: a small test request sent to a server to learn if it works. Servers that fail get no new traffic.
- Lame duck (SRE book, chapter 20): a shutting-down server finishes current requests but tells clients to send no new ones. The book suggests a drain interval (the wait before it really exits) of 10 to 150 seconds, depending on the clients.
- Subsetting: each client connects to only some servers, because every connection costs memory and processor time. The book says subsets are typically 20 to 100 servers; Google moved from random subsets to a fixed rule because random ones left some servers with far more connections.

**Why:** Without checks the balancer keeps sending requests to a dead server. Without lame duck, a restart cuts off requests in progress. Without subsets, thousands of clients each connected to thousands of servers waste resources.

**Example:** In the sequence diagram, the balancer asks servers A and B if they are healthy. A gives an error, B answers. The next request goes to B only.

**Failure:** Treating "the server answers" as "the server is healthy": it can answer quickly with errors. The book's random subsets (300 clients, 300 servers, 30 percent subsets) left the least loaded server with 63 percent of the average connections and the most loaded with 121 percent.

## Topic: Why `hash(key) mod N` breaks

**Definition:** To keep one user on one server, or one key (the name of a stored item, such as a user id) on one cache node, a simple rule is `hash(key) mod N`: turn the key into a number (hash) and take the remainder after dividing by N, the number of servers. It works while N stays the same. The SRE book (chapter 19) shows the same problem for network packets: when a backend is removed, `id(packet) mod N` changes and almost every packet maps to a different backend.

**Why:** Adding or removing a server is normal. If most keys move, caches go cold and sessions are lost.

**Example:** A small program counted over 100,000 keys: going from 4 to 5 servers moves 80.0% of keys (the least possible is 1/5 = 20.0%). 10 to 11 servers moves 90.8% (minimum 1/11 = 9.1%). 100 to 101 moves 99.0% (minimum 1/101 = 1.0%).

**Failure:** Thinking "mod N" is fine at scale: the bigger the group, the worse. The fix is consistent hashing (keys sit on a ring, and a new server takes only the keys next to it); see System Design: Replication, Sharding and Consistent Hashing.

## Topic: Capacity planning with headroom

**Definition:** Capacity planning finds how much load each unit (a server, or a cluster, which is a group of servers working as one) can take and how many units the peak needs. The SRE book (chapter 22, cascading failures) says to couple it with performance testing, to find the load at which the service breaks. A cascading failure is when one overloaded server fails, pushing its load onto the others, which then fail too. N+2 is commonly read as: enough units to carry the peak after one is down for planned work and another fails unexpectedly. (The chapter uses the term without defining it.)

**Why:** If you size exactly for the peak, one failure pushes the other units over their limit, and a small failure turns into a large one.

**Example:** The book's numbers: a cluster breaks at 5,000 queries per second; the peak is 19,000. 19,000 / 5,000 = 3.8, so 4 clusters carry the peak. N+2 gives 4 + 2 = 6. The book says approximately six clusters.

**Failure:** Guessing a server's capacity instead of testing it, or forgetting that when one server dies its load goes to the rest.

## Questions

### What is the difference between latency and throughput?

Latency is the time one request takes. Throughput is how many requests finish per second. More servers raise throughput. They do not make one request faster.

### Why should web servers be stateless?

A server that keeps user data in memory ties the user to it, and a crash loses the data. With a shared store, any server can serve any request, so servers can be added or replaced freely.

### Why does `hash(key) mod N` fail when N changes?

Almost every key maps to a new server: 100 to 101 servers moves 99% of keys in the example. Consistent hashing moves about 1/N.

### How many servers do I need?

Test one to find its breaking point, divide the peak by it, round up, and add spare units: 19,000 / 5,000 rounds up to 4, and N+2 gives 6.

## Mistakes

- Saying that scaling out makes each request faster. It raises how many requests finish per second.
- Keeping sessions in server memory behind a load balancer and calling it "scalable".
- Believing round robin gives an even load. Requests cost different amounts.

## Quiz

### By Little's law, how many requests are in progress at once when 1,000 requests arrive each second and each takes 100 ms?

- [ ] 10 requests in progress
- [x] 100 requests in progress
- [ ] 1,000 requests in progress
- [ ] 10,000 requests in progress

Explanation: Requests in progress = rate × time = 1,000 × 0.1 s = 100.

### The system is not overloaded. Which change makes ONE request faster?

- [ ] Adding more identical servers
- [ ] Adding a second load balancer
- [x] Reducing the work or the slow waits inside the request
- [ ] Switching from round robin to least loaded

Explanation: More servers raise throughput. One request gets faster only if its work or waiting becomes smaller.

### With 5,000 queries per second per cluster, a peak of 19,000 and N+2, how many clusters does the SRE book's example need?

- [ ] 4
- [ ] 5
- [x] 6
- [ ] 8

Explanation: 19,000 / 5,000 = 3.8, so 4 clusters carry the peak, and 2 more for N+2 makes 6.

### Going from 4 servers to 5 with `hash(key) mod N`, about what share of keys change server in the example run?

- [ ] 20%
- [ ] 50%
- [x] 80%
- [ ] 100%

Explanation: The run over 100,000 keys moved 80.0%. The best possible is 1/5 = 20%.

### Why can a sticky session cause trouble?

- [ ] It makes every request slower
- [ ] It stops the server from using memory
- [x] If the server dies the user's session is lost, and heavy users can overload one server
- [ ] It forces the use of a database

Explanation: Sticky sessions tie a user to one server, so its failure loses the session.

## Diagram

```json
{ "kind": "graph", "caption": "Stateless servers behind a load balancer. The user's request goes to the balancer (1), which sends it to any one of the servers (2). That server reads the session from the shared store (3) and reads data from the database (4). The dashed arrows are examples of the same steps for the other servers, so no server is special.",
  "groups": [{ "id": "dc", "label": "Data centre" }],
  "nodes": [ { "id": "u", "label": "User", "x": 5, "y": 50, "shape": "client" }, { "id": "lb", "label": "Load balancer", "x": 34, "y": 50, "group": "dc" },
             { "id": "s1", "label": "Server 1", "x": 61, "y": 16, "group": "dc" }, { "id": "s2", "label": "Server 2", "x": 61, "y": 50, "group": "dc" }, { "id": "s3", "label": "Server 3", "x": 61, "y": 84, "group": "dc" },
             { "id": "ss", "label": "Session store", "x": 90, "y": 28, "shape": "cache", "group": "dc" }, { "id": "db", "label": "Database", "x": 90, "y": 76, "shape": "database", "group": "dc" } ],
  "edges": [ { "from": "u", "to": "lb", "step": 1 }, { "from": "lb", "to": "s2", "step": 2 }, { "from": "lb", "to": "s1", "dashed": true }, { "from": "lb", "to": "s3", "dashed": true },
             { "from": "s2", "to": "ss", "step": 3 }, { "from": "s2", "to": "db", "step": 4 }, { "from": "s1", "to": "ss", "dashed": true }, { "from": "s3", "to": "db", "dashed": true } ] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A health check in action. The balancer asks server A if it is healthy and gets an error or no reply (checks run on a timer, not before each request), then asks server B and gets OK. When the client's request arrives, the balancer skips A and forwards it to B, which answers.",
  "actors": [ { "id": "c", "label": "Client" }, { "id": "l", "label": "Load balancer" }, { "id": "a", "label": "Server A" }, { "id": "b", "label": "Server B" } ],
  "messages": [ { "from": "l", "to": "a", "label": "Health check" }, { "from": "a", "to": "l", "label": "Error or no reply", "dashed": true }, { "from": "l", "to": "b", "label": "Health check" }, { "from": "b", "to": "l", "label": "OK", "dashed": true },
                { "from": "c", "to": "l", "label": "Request" }, { "from": "l", "to": "b", "label": "Forward (A is skipped)" }, { "from": "b", "to": "l", "label": "Response", "dashed": true }, { "from": "l", "to": "c", "label": "Response", "dashed": true } ] }
```
