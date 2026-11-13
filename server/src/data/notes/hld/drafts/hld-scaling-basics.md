---
id: hld-scaling-basics
title: Scalability, Load Balancing and Stateless Services
next: hld-caching
roadmapSteps: fullstack:deployment-scaling, backend:deployment-cloud
---

<!-- Draft 13 Nov 2026, not published. Written from docs/content/source-notes/hld-phase1.md. Numbers from docs/content/checks/hld-check.py. -->

## Overview

A service that works for 100 users often breaks at 100,000. Scaling means handling more load by adding machines, and the load balancer (a program or device that spreads incoming requests over many servers) is the part that makes many servers look like one. Interviewers ask how you would grow a service, why servers should be stateless (keep no user data in their own memory), and how requests get spread.

After this section you can tell latency from throughput, choose between a bigger machine and more machines, compare ways of spreading requests, explain why `hash(key) mod N` breaks, and size a service with spare capacity.

## Topic: Scalability, performance, latency and throughput

**Definition:** Latency is how long one request takes to get its answer. Throughput is how many requests the system finishes in a period, usually per second (the SRE book, chapter 4, uses exactly these two as service indicators). Performance is how fast the system is for one user at today's load. Scalability is whether it keeps working well when the load grows, by adding resources. A system can be fast for one user and still not scale.

**Why:** Adding machines raises throughput; it does not make one request faster. Interviewers test this: "how do you make it faster?" and "how do you handle more users?" are two different questions.

**Example:** Little's law is plain arithmetic: requests in progress = requests per second × seconds each takes. At 1,000 requests per second and 100 ms (0.1 s) each, 1,000 × 0.1 = 100 requests are in progress at any moment. If a slow database pushes each request to 2 s, 1,000 × 2 = 2,000 are in progress: the same traffic now holds 20 times as many threads and as much memory. The AWS Builders' Library queue article uses the same law: 100 messages a second at 100 ms need about 10 threads; at 10 s they need about 1,000.

**Failure:** Saying "add servers" for a slow single request, or measuring only the average. The SRE book advises percentiles: its example is a typical request of 50 ms where 5% of requests are 20 times slower, which an average hides.

## Topic: Vertical and horizontal scaling, and stateless servers

**Definition:** Vertical scaling (scale up) means moving to a bigger machine: more processor, more memory. Horizontal scaling (scale out) means adding more machines and sharing the work. State is data a server remembers between requests, such as who is logged in. A stateless server keeps no such data in its own memory; it reads it from a shared place (a database or a shared cache) for each request, so any server can answer any request.

**Why:** A bigger machine is simple but has a ceiling and is one point of failure (if it dies, everything stops). Many machines have no such ceiling, but only work well if any server can take any request. A server that holds a user's session in its own memory ties that user to it.

**Example:** Login session stored on server 2. The next request goes to server 3, which has never seen the session, and the user is logged out. Two fixes. One: sticky sessions (the balancer always sends a user to the same server). Two: store sessions in a shared store that every server reads. The Azure Architecture Center (cache-aside page) warns against depending on client-server affinity for session state in a web farm.

**Failure:** Sticky sessions have costs: if the server dies, its users lose their sessions; and a few heavy users can overload one server while others idle. With a shared store the load spreads, but that store is now something to make fast and reliable (the next section, on caching, covers one such store). Saying "just scale horizontally" without saying where the state lives is the usual follow-up.

## Topic: How requests are spread

**Definition:** Round robin sends each new request to the next server in the list, in turn. Least loaded sends it to the server with the fewest requests in progress. Weighted round robin gives each server a score and sends more to the stronger ones. The SRE book (chapter 20, load balancing inside a data centre) describes how Google used these: simple round robin was its most common approach for years, yet it can leave about a 2x spread in processor use between the least and most loaded server. Reasons the book lists: requests cost different amounts (the dearest can use 1,000 times the processor time of the cheapest), machines differ in speed, and clients send at different rates. In its least-loaded version each client counts only its own requests in progress, so it cannot see other clients' load, and in large services the spread stayed near 2x too. In weighted round robin the servers report their rate, errors and processor use in each reply, and the spread dropped greatly (the book gives no figures).

**Why:** One overloaded server answers slowly while others sit idle, and the busiest server decides how much traffic the group can take.

**Example:** A simulation with made-up request costs (from our script): requests of very different cost sent to a group of servers. Round robin left the busiest server with 1.24 times the work of the quietest (1.11 times the average). Least loaded, in an ideal version that sees all the work, gave 1.032. The real systems in the book are less ideal than this simulation.

**Failure:** Counting requests, not cost: ten cheap requests are not the same as ten dear ones. Also the "sinkhole" in the book: a broken server that returns errors fast looks lightly loaded and so attracts more traffic; counting its recent errors as load fixes it. For the layers of a balancer (layer 4 and layer 7), the reverse proxy and the CDN, see Computer Networks: System Design Concepts (`cn-system-design-concepts`).

## Topic: Health checks, lame duck and subsets

**Definition:** A health check is a small test request sent to a server to learn if it is working; servers that fail get no new traffic. The SRE book (chapter 20) describes the lame duck state: a server that is shutting down still serves current requests but tells clients to send no new ones. The book suggests a drain interval of 10 to 150 seconds before the server exits, depending on how complex the clients are. Subsetting means each client connects to only some servers, because each connection costs memory and processor time for health checking at both ends. The book says subsets are typically 20 to 100 servers, and that it moved from random to deterministic subsetting because random subsets left some servers with far more connections than others.

**Why:** Without checks the balancer keeps sending requests to a dead server. Without lame duck, a restart cuts off requests in progress. Without subsets, thousands of clients each holding connections to thousands of servers waste resources.

**Example:** In the sequence diagram below, the balancer asks servers A and B if they are healthy. A fails, B answers. The next request goes to B only.

**Failure:** Treating "the server answers" as "the server is healthy": a server can answer quickly with errors. The book's own example of random subsetting (300 clients, 300 servers, 30 percent subsets) left the least loaded server with 63 percent of the average and the most loaded with 121 percent.

## Topic: Why `hash(key) mod N` breaks

**Definition:** To keep one user on one server, or one key on one cache node, a simple rule is `hash(key) mod N`: turn the key into a number (hash) and take the remainder after dividing by N, the number of servers. It works while N stays the same. The SRE book (chapter 19) notes that when a backend is removed, N changes and almost every connection maps to a different backend.

**Why:** Adding or removing a server is normal (growth, crashes, deployments). If most keys move each time, caches go cold and sessions are lost together.

**Example:** Computed by our script over many keys: going from 4 to 5 servers moves 80.0% of keys (the least possible is 1/5 = 20.0%). 10 to 11 servers moves 90.8% (minimum 1/11 = 9.1%). 100 to 101 moves 99.0% (minimum 1/101 = 1.0%).

**Failure:** Thinking "mod N" is fine at scale: the bigger the group, the worse the move. The fix is consistent hashing (keys sit on a ring, and a new server only takes the keys next to it). See `hld-replication-partitioning` for it.

## Topic: Capacity planning with headroom

**Definition:** Capacity planning finds how much load each unit (a server, a cluster) can take and how many units are needed for the peak. The SRE book (chapter 22, cascading failures) says to couple it with performance testing, to find the load at which the service breaks. N+2 means enough units to carry the peak after one is down for planned work and another fails unexpectedly: the peak needs N units, so you run N + 2.

**Why:** If you size exactly for the peak, one failure pushes the other units over their limit, and a small failure turns into a large one. The same chapter notes that capacity planning lowers the chance of a cascading failure but does not remove it.

**Example:** The book's numbers: each cluster breaks at 5,000 queries per second and the peak is 19,000. 19,000 / 5,000 = 3.8, so 4 clusters carry the peak. N+2 gives 4 + 2 = 6. The book says approximately six clusters. The book also notes that spreading load evenly is often not true in practice, because of geography.

**Failure:** Counting a server's capacity from a guess, not a test; counting average load; or forgetting that when one server dies its load goes to the rest. Also, the number must be measured in a resource (such as processor use), because requests differ in cost.

## Questions

### What is the difference between latency and throughput?

Latency is the time one request takes. Throughput is how many requests finish per second. More servers raise throughput. They do not make one request faster.

### Why should web servers be stateless?

If a server keeps user data in its own memory, the user must keep going to that server, and a crash loses the data. If the state is in a shared store, any server can serve any request, so you can add, remove or replace servers freely.

### How does a load balancer choose a server?

Round robin goes in turn. Least loaded picks the server with the fewest requests in progress. Weighted round robin sends more to stronger servers. Round robin can leave a big gap, because requests cost different amounts; the SRE book mentions about a 2x spread in processor use.

### Why does `hash(key) mod N` fail when N changes?

Almost every key maps to a new server. Going from 100 to 101 servers moves 99% of keys in our test. Consistent hashing moves about 1/N.

### How many servers do I need?

Test one to find its breaking point, divide the peak by it, round up, and add spare units. The book's example: 19,000 / 5,000 rounds up to 4, and N+2 gives 6.

## Mistakes

- Saying that scaling out makes each request faster. It raises how many requests can be done at once.
- Keeping sessions in server memory behind a load balancer and calling the service "scalable".
- Believing round robin gives an even load. Requests cost different amounts, so the loads end up uneven.

## Quiz

### By Little's law, how many requests are in progress at once when 1,000 requests arrive each second and each takes 100 ms?

- [ ] 10 requests in progress
- [x] 100 requests in progress
- [ ] 1,000 requests in progress
- [ ] 10,000 requests in progress

Explanation: Requests in progress = rate × time = 1,000 × 0.1 s = 100.

### Which change makes ONE request faster?

- [ ] Adding more identical servers
- [ ] Adding a second load balancer
- [x] Reducing the work or the slow waits inside the request path
- [ ] Switching from round robin to least loaded

Explanation: More servers raise throughput. A single request gets faster only if the work it does or the waiting it does becomes smaller.

### With 5,000 queries per second per cluster, a peak of 19,000 and N+2, how many clusters does the SRE book's example need?

- [ ] 4
- [ ] 5
- [x] 6
- [ ] 8

Explanation: 19,000 / 5,000 = 3.8, so 4 clusters carry the peak, and 2 more for N+2 makes 6.

### Going from 4 servers to 5 with `hash(key) mod N`, about what share of keys change server in our test?

- [ ] 20%
- [ ] 50%
- [x] 80%
- [ ] 100%

Explanation: The script measured 80.0%. The best possible is 1/5 = 20%, which consistent hashing approaches.

### Why can a sticky session cause trouble?

- [ ] It makes every request slower
- [ ] It stops the server from using memory
- [x] If the server dies the user's session is lost, and heavy users can overload one server
- [ ] It forces the use of a database

Explanation: Sticky sessions tie a user to one server. That server holds the session, so its failure loses the session, and the balancer cannot spread that user's load.

## Diagram

```json
{ "kind": "graph", "caption": "Stateless servers behind a load balancer. The user's request goes to the balancer (1), which sends it to any one of the servers (2). That server reads the session from the shared store (3) and reads data from the database (4). The dashed arrows show that every other server can do the same, so no server is special.",
  "groups": [{ "id": "dc", "label": "Data centre" }],
  "nodes": [ { "id": "u", "label": "User", "x": 6, "y": 50, "shape": "client" }, { "id": "lb", "label": "Load balancer", "x": 28, "y": 50, "group": "dc" },
             { "id": "s1", "label": "Server 1", "x": 54, "y": 16, "group": "dc" }, { "id": "s2", "label": "Server 2", "x": 54, "y": 50, "group": "dc" }, { "id": "s3", "label": "Server 3", "x": 54, "y": 84, "group": "dc" },
             { "id": "ss", "label": "Session store", "x": 86, "y": 28, "shape": "cache", "group": "dc" }, { "id": "db", "label": "Database", "x": 86, "y": 76, "shape": "database", "group": "dc" } ],
  "edges": [ { "from": "u", "to": "lb", "step": 1 }, { "from": "lb", "to": "s2", "step": 2 }, { "from": "lb", "to": "s1", "dashed": true }, { "from": "lb", "to": "s3", "dashed": true },
             { "from": "s2", "to": "ss", "step": 3 }, { "from": "s2", "to": "db", "step": 4 }, { "from": "s1", "to": "ss", "dashed": true }, { "from": "s3", "to": "db", "dashed": true } ] }
```

## Diagram

```json
{ "kind": "sequence", "caption": "A health check in action. The balancer asks server A if it is healthy and gets a failure, then asks server B and gets OK. When the client's request arrives, the balancer skips A and forwards it to B, which answers.",
  "actors": [ { "id": "c", "label": "Client" }, { "id": "l", "label": "Load balancer" }, { "id": "a", "label": "Server A" }, { "id": "b", "label": "Server B" } ],
  "messages": [ { "from": "l", "to": "a", "label": "Health check" }, { "from": "a", "to": "l", "label": "Failed", "dashed": true }, { "from": "l", "to": "b", "label": "Health check" }, { "from": "b", "to": "l", "label": "OK", "dashed": true },
                { "from": "c", "to": "l", "label": "Request" }, { "from": "l", "to": "b", "label": "Forward (A is skipped)" }, { "from": "b", "to": "l", "label": "Response", "dashed": true }, { "from": "l", "to": "c", "label": "Response", "dashed": true } ] }
```
