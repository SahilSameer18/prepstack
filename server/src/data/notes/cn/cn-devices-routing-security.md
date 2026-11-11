---
id: cn-devices-routing-security
title: Devices, Routing and Network Security
lastChecked: 2026-11-11
next: cn-key-flows
roadmapSteps: backend:os-networking-basics, frontend:internet-web-fundamentals
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Written from docs/content/source-notes/cn-batch-b.md (routing and devices). RIP port, OSPF protocol number and the word "path vector" were not verified and are left out. -->

## Overview

Networks are built from a few devices: hubs, switches, routers, firewalls, proxies. Interviewers ask what each one does, at which layer, and how they differ. They also ask how routers learn routes (RIP, OSPF, BGP at a simple level) and about common attacks such as SYN flood, ARP spoofing and denial of service.

After this section you can compare a hub, switch and router with the right layer and domain words, say what a firewall and a proxy do, explain distance-vector against link-state routing, and describe the common attacks with one defence each.

## Topic: Hub, switch and router

**Definition:** A hub (layer 1) repeats every bit it receives to all other ports; all its ports share one collision domain and it is half duplex. A switch (layer 2) learns which MAC address sits behind which port and sends a frame only to that port; each port is its own collision domain, but all ports are still one broadcast domain. A router (layer 3) connects different networks and chooses the next hop from the destination IP address using its routing table; each router interface is a separate broadcast domain.

**Why:** A hub wastes bandwidth and causes collisions. A switch removes that. A router is needed to move between networks.

**Example:** A switch sees a frame from MAC A on port 1, records "A is on port 1", and floods a frame for an unknown MAC to all other ports until it learns it. A bridge does the same thing between two segments; a switch is a multiport bridge.

**Failure:** Saying a switch separates broadcast domains. It does not; a router (or a VLAN) does.

## Topic: Router against gateway

**Definition:** A gateway is a node that connects networks; in most interviews it means the default gateway: the router address a host sends traffic to when the destination is on another network. Some books use "gateway" for a device that connects networks using different protocols.

**Why:** A host only knows its own subnet. For everything else it sends the packet to the gateway.

**Example:** A laptop with 192.168.1.10/24 sends to 8.8.8.8 by sending the frame to the MAC address of its gateway, for example 192.168.1.1.

**Failure:** Some notes say "a router joins similar networks and a gateway joins dissimilar ones". That is loose. In an interview, say "default gateway" and explain that it is the router a host uses to leave its subnet.

## Topic: Routing protocols

**Definition:** Static routes are typed by hand. Dynamic routing protocols let routers share what they know. RIP is a distance-vector protocol: the metric is the hop count, 15 is the maximum and 16 means unreachable; each router sends its table to neighbours every 30 seconds and a route times out after 180 seconds. OSPF is a link-state protocol used inside one autonomous system: every router floods descriptions of its own links, so each router holds the same map and builds a shortest-path tree from itself; large networks are split into areas. BGP joins the autonomous systems (large networks under one routing policy, such as an ISP) of the internet: it passes reachability together with the list of systems crossed, and runs over TCP port 179.

**Why:** On the real internet the best path changes when links fail, and humans cannot update tables by hand.

**Example:** Inside a company, OSPF finds the best path between buildings. Between your ISP and another ISP, BGP decides which neighbour to use.

**Failure:** Saying BGP picks the shortest path by speed. BGP follows policy (business rules) as well as path length.

## Topic: Firewalls

**Definition:** A firewall watches traffic between a trusted and an untrusted network and allows or blocks it by rules. A packet filter decides by IP addresses, protocol and ports. A stateful firewall also remembers each conversation, so it can allow replies to connections you started. An application-layer firewall understands protocols such as HTTP or DNS.

**Why:** It reduces what an attacker can reach.

**Example:** A rule that allows inbound traffic only on port 443 and drops the rest.

**Failure:** Believing a firewall stops everything. It cannot stop an attack that comes through an allowed port, such as a bug in your web app.

## Topic: Proxies

**Definition:** A forward proxy acts for clients: it fetches pages for them, can cache, filter and hide client addresses. A reverse proxy sits in front of servers: it looks like the server to clients and passes requests to backends, doing load balancing, caching, compression and TLS termination.

**Why:** A reverse proxy hides and protects the real servers.

**Example:** Nginx in front of three Node servers. The risks: it holds the TLS keys and, if it is only one machine, it is a single point of failure.

**Failure:** Mixing the two. Forward proxy: on the client side. Reverse proxy: on the server side.

## Topic: Common attacks

**Definition:** Denial of service (DoS) makes a service unavailable, usually by flooding it; distributed DoS (DDoS) does this from many machines. A SYN flood sends many TCP SYNs and never finishes the handshake, so half-open connections fill the server's queue; SYN cookies are a defence. ARP spoofing sends forged ARP replies so the attacker's MAC is tied to another machine's IP; static ARP entries and detection tools help. A man-in-the-middle attack relays and can change traffic between two parties; TLS with certificate checks protects against it.

**Why:** Each attack uses a weak point in a basic protocol: TCP's handshake and ARP's trust.

**Example:** An attacker on café Wi-Fi poisons ARP so your traffic goes through their laptop first. HTTPS stops them reading the content.

**Failure:** Saying a VPN or HTTPS stops DDoS. They do not.

## Questions

### What is the difference between a hub, a switch and a router?

A hub repeats bits to every port. A switch forwards frames to the right port using MAC addresses. A router forwards packets between networks using IP addresses.

### What is a collision domain and a broadcast domain?

A collision domain is the area where two devices sending at once can collide; each switch port is its own. A broadcast domain is the area that receives a broadcast; switches do not split it, routers do.

### What is the difference between distance-vector and link-state routing?

Distance-vector (RIP) shares a table of distances with neighbours only. Link-state (OSPF) floods information about each router's links so every router builds the full map and finds shortest paths itself.

### What is a firewall?

A system that allows or blocks traffic between networks by rules, using addresses, ports, connection state or application data.

### What is a SYN flood?

Sending many SYN packets and never completing the handshake, so the server runs out of room for half-open connections.

## Mistakes

- Saying a switch works at layer 3 or a router at layer 2.
- Saying RIP's limit is 16 hops. The limit is 15; 16 means unreachable.
- Saying a firewall is the same as antivirus.

## Quiz

### Which device creates a separate broadcast domain on each of its interfaces?

- [ ] Hub
- [ ] Switch
- [x] Router
- [ ] Repeater

Explanation: A router does not forward broadcasts between its interfaces. A hub and a basic switch keep one broadcast domain.

### What does a switch learn and store?

- [ ] IP address to domain name
- [x] MAC address to port
- [ ] Domain name to IP
- [ ] Port number to program

Explanation: A switch's table maps the source MAC of each frame to the port it arrived on.

### In RIP, what hop count means unreachable?

- [ ] 15
- [x] 16
- [ ] 30
- [ ] 255

Explanation: RIP allows up to 15 hops, and 16 stands for infinity (unreachable).

### Which protocol joins autonomous systems on the internet?

- [ ] RIP
- [ ] OSPF
- [x] BGP
- [ ] ARP

Explanation: BGP carries reachability between autonomous systems. RIP and OSPF are used inside one.

### What does a reverse proxy do?

- [ ] Hides clients from websites
- [x] Sits in front of servers and passes requests to them
- [ ] Translates MAC addresses
- [ ] Assigns IP addresses

Explanation: A reverse proxy looks like the server to clients and can balance load, cache and end TLS.

## Diagram

```json
{ "kind": "layers", "caption": "Where common devices work in the OSI layers: the higher the layer, the more of the packet the device reads.", "layers": [{ "label": "Layer 7 - HTTP proxy, application firewall, L7 load balancer" }, { "label": "Layer 4 - L4 load balancer, stateful firewall (ports)" }, { "label": "Layer 3 - Router (IP addresses)" }, { "label": "Layer 2 - Switch, bridge (MAC addresses)" }, { "label": "Layer 1 - Hub (bits)" }] }
```
