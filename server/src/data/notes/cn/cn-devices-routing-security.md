---
id: cn-devices-routing-security
title: Devices, Routing and Network Security
lastChecked: 2026-11-11
next: cn-key-flows
roadmapSteps: backend:os-networking-basics, frontend:internet-web-fundamentals
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Written from docs/content/source-notes/cn-batch-b.md (routing and devices). RIP port, OSPF protocol number and the word "path vector" were not verified and are left out. -->

## Overview

Networks are built from a few devices: hubs, switches, routers, firewalls, proxies. Interviewers ask what each one does, at which layer, and how they differ. They also ask how routers (devices that send data between networks) learn routes (RIP, OSPF, BGP at a simple level) and about common attacks such as SYN flood, ARP spoofing and denial of service.

After this section you can compare a hub, switch and router with the right layer and domain words, say what a firewall and a proxy do, explain distance-vector against link-state routing, and describe the common attacks with one defence each.

## Topic: Hub, switch and router

**Definition:** A hub (layer 1, the plain wire level) repeats every bit it receives to all other ports (the physical connectors cables plug into). All its ports share one collision domain (an area where two devices sending at the same moment spoil each other's signal), and it is half duplex (a device can send or receive, but not both at once). A switch (layer 2) learns which MAC address (the hardware address of a network card; software can change it) sits behind which port and sends a frame (the unit of data at layer 2) only to that port. Each port is its own collision domain, but all ports are still one broadcast domain (the area that receives a message sent to everyone). A router (layer 3) connects different networks and chooses the next hop (the next device on the way) from the destination IP address using its routing table (its list of which way to send traffic for each network). Each router interface is a separate broadcast domain.

**Why:** A hub wastes bandwidth and causes collisions. A switch removes that. A router is needed to move between networks.

**Example:** A switch sees a frame from MAC A on port 1, records "A is on port 1", and floods (sends out of every other port) a frame for an unknown MAC to all other ports until it learns it. A bridge (an older device that links two parts of a network) does the same thing between two segments; a switch is a multiport bridge.

**Failure:** Saying a switch separates broadcast domains. It does not; a router (or a VLAN, a virtual split of one switch into separate networks) does.

## Topic: Router against gateway

**Definition:** A gateway is a node (any device on the network) that connects networks. In most interviews it means the default gateway: the router address a host (any computer on the network) sends traffic to when the destination is on another network. Some books use "gateway" for a device that connects networks using different protocols.

**Why:** A host only knows its own subnet (its own small local network). For everything else it sends the packet to the gateway.

**Example:** A laptop with 192.168.1.10/24 (the /24 says how much of the address names the local network) sends to 8.8.8.8 by sending the frame to the MAC address of its gateway, for example 192.168.1.1.

**Failure:** Some notes say "a router joins similar networks and a gateway joins dissimilar ones". That is loose. In an interview, say "default gateway" and explain that it is the router a host uses to leave its subnet.

## Topic: Routing protocols

**Definition:** Static routes are typed by hand. Dynamic routing protocols let routers share what they know. RIP is a distance-vector protocol (routers only tell neighbours how far away each network is): the metric (the score used to compare routes) is the hop count (the number of routers crossed), 15 is the maximum and 16 means unreachable. Each router sends its table to neighbours every 30 seconds, and a route times out after 180 seconds. OSPF is a link-state protocol (every router shares the state of its own links so all can draw the same map) used inside one autonomous system (a large network run under one routing policy, such as an ISP). Every router floods descriptions of its own links, so each router holds the same map and builds a shortest-path tree from itself. Large networks are split into areas. BGP joins the autonomous systems (large networks under one routing policy, such as an ISP, the internet provider) of the internet: it passes reachability (which networks can be reached) together with the list of systems crossed, and runs over TCP port 179 (a port is a numbered door a program listens on).

**Why:** On the real internet the best path changes when links fail, and humans cannot update tables by hand.

**Example:** Inside a company, OSPF finds the best path between buildings. Between your ISP and another ISP, BGP decides which neighbour to use.

**Failure:** Saying BGP picks the shortest path by speed. BGP follows policy (business rules) as well as path length.

## Topic: Firewalls

**Definition:** A firewall watches traffic between a trusted and an untrusted network and allows or blocks it by rules. A packet filter (a check on each packet by itself) decides by IP addresses, protocol and ports. A stateful firewall also remembers each conversation (its state), so it can allow replies to connections you started. An application-layer firewall understands protocols such as HTTP or DNS.

**Why:** It reduces what an attacker can reach.

**Example:** A rule that allows inbound traffic only on port 443 and drops the rest.

**Failure:** Believing a firewall stops everything. It cannot stop an attack that comes through an allowed port, such as a bug in your web app.

## Topic: Proxies

**Definition:** A proxy is a middleman server. A forward proxy acts for clients: it fetches pages for them, can cache (keep copies), filter and hide client addresses. A reverse proxy sits in front of servers: it looks like the server to clients and passes requests to backends (the servers behind it), doing load balancing (spreading requests across servers), caching, compression and TLS termination (ending the encryption at the proxy).

**Why:** A reverse proxy hides and protects the real servers.

**Example:** Nginx in front of three Node servers. The risks: it holds the TLS keys and, if it is only one machine, it is a single point of failure (one part whose breakdown stops everything).

**Failure:** Mixing the two. Forward proxy: on the client side. Reverse proxy: on the server side.

## Topic: Common attacks

**Definition:** Denial of service (DoS) makes a service unavailable, usually by flooding it; distributed DoS (DDoS) does this from many machines. A SYN flood sends many TCP SYNs (the first message that opens a TCP connection) and never finishes the handshake (the three-step opening of a connection), so half-open connections fill the server's queue; SYN cookies (a trick that avoids storing state for unfinished connections) are a defence. ARP spoofing sends forged ARP replies (ARP is how a machine learns the MAC address that goes with an IP address) so the attacker's MAC is tied to another machine's IP; static ARP entries (fixed, hand-set entries) and detection tools help. A man-in-the-middle attack relays and can change traffic between two parties; TLS (the protocol that encrypts and authenticates a connection) with certificate checks protects against it.

**Why:** Each attack uses a weak point in a basic protocol: TCP's handshake and ARP's trust (ARP accepts replies without checking them).

**Example:** An attacker on café Wi-Fi poisons the ARP cache (fills it with false entries) so your traffic goes through their laptop first. HTTPS stops them reading the content.

**Failure:** Saying a VPN (a private encrypted tunnel over the internet) or HTTPS stops DDoS. They do not.

## Questions

### What is the difference between a hub, a switch and a router?

A hub repeats bits to every port. A switch forwards frames to the right port using MAC addresses. A router forwards packets between networks using IP addresses.

### What is a collision domain and a broadcast domain?

A collision domain is the area where two devices sending at once can collide; each switch port is its own. A broadcast domain is the area that receives a broadcast (a message sent to everyone); switches do not split it, routers do.

### What is the difference between distance-vector and link-state routing?

Distance-vector (RIP) shares a table of distances with neighbours only. Link-state (OSPF) floods (sends to every router) information about each router's links so every router builds the full map and finds shortest paths itself.

### What is a firewall?

A system that allows or blocks traffic between networks by rules, using addresses, ports, connection state (whether a packet belongs to a conversation already started) or application data.

### What is a SYN flood?

Sending many SYN packets (the first step of opening a TCP connection) and never completing the handshake, so the server runs out of room for half-open connections.

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

Explanation: A router does not forward broadcasts (messages meant for everyone) between its interfaces. A hub and a basic switch keep one broadcast domain.

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

Explanation: BGP carries reachability (which networks can be reached) between autonomous systems. RIP and OSPF are used inside one.

### What does a reverse proxy do?

- [ ] Hides clients from websites
- [x] Sits in front of servers and passes requests to them
- [ ] Translates MAC addresses
- [ ] Assigns IP addresses

Explanation: A reverse proxy looks like the server to clients and can balance load (spread requests across servers), cache and end TLS (decrypt at the proxy).

## Diagram

```json
{ "kind": "layers", "caption": "Where common devices work in the OSI layers: the higher the layer, the more of the packet the device reads.", "layers": [{ "label": "Layer 7 - HTTP proxy, application firewall, L7 load balancer" }, { "label": "Layer 4 - L4 load balancer, stateful firewall (ports)" }, { "label": "Layer 3 - Router (IP addresses)" }, { "label": "Layer 2 - Switch, bridge (MAC addresses)" }, { "label": "Layer 1 - Hub (bits)" }] }
```
