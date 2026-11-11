---
id: cn-system-design-concepts
title: Load Balancers, Proxies and CDN
lastChecked: 2026-11-11
next: none
roadmapSteps: backend:os-networking-basics, frontend:internet-web-fundamentals
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Written from docs/content/source-notes/cn-batch-b.md, including the "Gap-fill read on 11 Nov 2026" part (Wikipedia Load balancing, Content delivery network, Anycast; nginx and AWS load balancer docs; MDN CDN). The "layer 4 / layer 7" names are our reading of the AWS network and application balancers; the sources do not use those words. -->

## Overview

When one server cannot handle all the traffic, networks add helpers in front of it: a load balancer to spread requests, a reverse proxy to hide and protect the servers, and a CDN (content delivery network) to keep copies of files close to users. Backend and system-design interviews ask these as soon as the answer "scale the server" comes up. They tie together the earlier sections: TCP, HTTP, TLS, DNS and caching.

After this section you can explain what each helper does, name the common balancing methods, say what layer 4 and layer 7 balancing mean, and describe what a CDN stores and how a request reaches it.

## Topic: Load balancer

**Definition:** A load balancer (a device or program that spreads requests across servers) receives requests and sends each to one of several identical servers. Common methods: round robin (take turns; it can be weighted so a stronger server gets more), least connections (pick the server with the fewest open connections) and hash (for example IP hash: the same client address always goes to the same server unless that server is down). It also does health checks (regular tests of whether each server works): servers that fail are not sent traffic until they recover. In nginx (a popular web server and proxy program), round robin is the default method.

**Why:** One server has a limit, and a single server is a single point of failure (one part whose breakdown stops everything).

**Example:** Three Node servers behind a balancer. If one crashes, the health check notices and the balancer stops sending it requests.

**Failure:** The balancer itself can become the single point of failure, so production systems run more than one.

## Topic: Layer 4 and layer 7 balancing

**Definition:** A balancer that works at the TCP level (the reliable-delivery layer) is called "layer 4". It picks a server for each connection from the addresses and ports (the AWS Network Load Balancer hashes them, meaning it turns them into a number to choose with) and keeps that connection on one server. A balancer that understands HTTP is called "layer 7". It applies rules to the request and can route `/api` to one group of servers and `/images` to another (the AWS Application Load Balancer).

**Why:** Layer 7 is more flexible; layer 4 is simpler and faster.

**Example:** Send all requests with a certain cookie to the same server so a session (one user's ongoing visit) is kept ("sticky sessions").

**Failure:** Sticky sessions (sending a user to the same server every time) have no automatic failover (switching to a backup): if that server dies, the session is lost. They also make servers keep state (remember things between requests), which makes scaling and failure recovery harder. Often it is better to keep session data in a shared store (a place all servers can read from and write to).

## Topic: Reverse proxy

**Definition:** A reverse proxy (a middleman server) sits in front of the servers and looks like the real server to the client. It can balance load, cache responses (keep copies to reuse), compress, end TLS (decrypt at the proxy) and add authentication (checking who the user is).

**Why:** The servers' own addresses are not shown to clients, which makes direct attacks harder, and one place handles certificates and caching.

**Example:** Nginx terminates HTTPS (ends the encryption there) and forwards plain HTTP to the app servers inside the private network.

**Failure:** It holds the private TLS keys (the secret codes that prove the server's identity) and is a single point of failure unless duplicated.

## Topic: CDN

**Definition:** A content delivery network is a group of servers in many places. It keeps copies of static files (files that are the same for every user: images, scripts, styles, videos) near users. The origin server is where the files really live. With pull caching, the first request for a file travels to the origin and later requests are answered from the nearby copy until it expires. With push caching the files are loaded onto the edge (the CDN servers near users) in advance.

**Why:** Shorter distance means lower delay (latency), and the origin server carries less load.

**Example:** A user in Mumbai gets your logo from an edge server in India instead of from a server in the United States. The CDN sends users to a nearby edge with DNS-based routing (DNS gives different answers to different places) or anycast (one IP address shared by servers in many places, where routers pick the nearest).

**Failure:** Old copies. If you update a file but the edge still has the old one, users see the old file until it expires or you clear it. Names with a version in the file name avoid this.

## Topic: Caching layers

**Definition:** A page can be cached (stored for reuse) in the browser, at the CDN, at a reverse proxy and in the application (for example in memory). Each layer uses cache headers (labels sent with a response) such as Cache-Control and ETag (a version label for the content) to decide how long to keep it.

**Why:** Each layer you add removes work from the layer behind it.

**Example:** Static files get long max-age and a version in the name; personal pages get `Cache-Control: private` so a shared cache (one that serves many users) must not store them.

**Failure:** Caching a personal page in a shared cache would show one person's data to another.

## Topic: Putting it together

**Definition:** A typical path: the user's DNS lookup (the step that turns the site name into an address) points to the CDN. The CDN answers static files itself and sends other requests to the load balancer. The balancer sends each to a healthy app server (one that passes its health check). The app server talks to a database.

**Why:** Each piece solves one problem: distance, load, failure, or hiding the servers.

**Example:** For a request to `/logo.png`, the CDN replies. For `/api/orders`, the CDN forwards to the balancer, then to a server.

**Failure:** Adding all of them to a small project. A small app can run on one server; add these only when traffic or availability needs them.

## Questions

### What is a load balancer and what methods does it use?

It spreads requests over several servers. Common methods are round robin (take turns), least connections (fewest open connections) and IP hash (the client address decides the server). It also removes servers that fail health checks.

### What is the difference between layer 4 and layer 7 load balancing?

Layer 4 decides from IP address and port only. Layer 7 reads the HTTP request, such as the URL or a cookie (a small piece of data the browser stores), so it can route by content.

### What is a CDN and why use one?

A set of edge servers (servers close to users) around the world that keep copies of static files near users. It reduces delay and lowers the load on the origin server (the server where the files really live).

### Forward proxy vs reverse proxy?

A forward proxy (a middleman for clients) acts for clients going out to the internet. A reverse proxy acts for servers, receiving requests from the internet and passing them to backends (the servers behind it).

## Mistakes

- Thinking a load balancer makes the system fully reliable. The balancer can fail too.
- Using sticky sessions as the default way to keep login state.
- Caching personal responses in a shared cache.

## Quiz

### Which method sends each request to the server with the fewest open connections?

- [ ] Round robin
- [x] Least connections
- [ ] IP hash
- [ ] Random DNS

Explanation: Least connections picks the server that currently has the fewest open connections.

### What can a layer 7 load balancer do that a layer 4 one cannot?

- [ ] Use IP addresses
- [x] Route by URL or cookie
- [ ] Use ports
- [ ] Forward TCP

Explanation: Layer 7 reads the HTTP request, so it can route by path, header or cookie.

### What does a CDN mainly store?

- [ ] The database
- [x] Copies of static files near users
- [ ] Users' passwords
- [ ] DNS root records

Explanation: A CDN caches (keeps copies of) static content on edge servers so users get it from a nearby place.

### Why is a single reverse proxy a risk?

- [ ] It cannot use HTTPS
- [ ] It makes servers visible to clients
- [x] It is a single point of failure and holds TLS keys
- [ ] It removes the need for servers

Explanation: Everything passes through it, so if it fails the service stops (a single point of failure), and it holds the private keys for TLS.

### What does a health check do?

- [ ] Encrypts traffic
- [x] Finds failed servers so the balancer stops sending them requests
- [ ] Changes DNS records
- [ ] Compresses files

Explanation: Health checks test servers regularly and remove failed ones until they recover.

## Diagram

```json
{ "kind": "flow", "caption": "A request to a busy site: DNS leads to the CDN, which answers static files itself and forwards the rest to the load balancer and then an app server.", "steps": [{ "label": "User resolves the site name with DNS" }, { "label": "CDN edge: answers static files from its cache" }, { "label": "Load balancer: picks a healthy server" }, { "label": "App server and database" }] }
```
