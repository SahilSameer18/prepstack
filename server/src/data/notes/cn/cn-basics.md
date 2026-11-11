---
id: cn-basics
title: Network Basics
lastChecked: 2026-11-11
next: cn-osi-tcpip-models
roadmapSteps: backend:os-networking-basics, frontend:internet-web-fundamentals
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Written from docs/content/source-notes/cn-batch-a.md (section A). Claims: docs/content/SOURCES.md. -->

## Overview

A computer network is a group of devices joined by links so they can share data. Interviewers start here because it checks that you know the plain words: node, link, topology, LAN, WAN, VPN, and the four ways a message can be sent (unicast, broadcast, multicast, anycast). These are small topics, but a wrong answer on them makes the rest of your answers look weak.

After this section you can draw the common topologies and say what happens when one cable or one device fails. You can also say which kind of network covers a room, a campus or a country, and explain a VPN in two sentences.

## Topic: Node, link and protocol

**Definition:** A node is any device on the network (a phone, a laptop, a router). A link is the cable or wireless path between two nodes. A protocol is the set of rules both sides follow. A protocol has three parts: syntax (the format and order of the data), semantics (what each part means) and timing (when to send and how fast).

**Why:** Two machines from different makers can only talk if they agree on the same rules. Without a shared protocol, the bits arrive but nobody can read them.

**Example:** Two people on a phone call. The language is the syntax, what the words mean is the semantics, and waiting for the other person to finish before you speak is the timing.

**Failure:** Interviewers ask "what is a protocol?" and many students answer only "a set of rules". Add the three parts and you stand out.

## Topic: Topologies

**Definition:** A topology is the layout, or shape, of how devices and links are joined. Star: every node connects to one central device. Bus: every node shares one cable. Ring: each node connects to two neighbours in a closed loop. Mesh: nodes connect to many other nodes (full mesh means every pair). Tree: several stars joined together by a bus (one shared cable) or a parent device. Hybrid: a mix of the above.

**Why:** The layout decides the cost, how easy it is to add a device, and what breaks when one part fails.

**Example:** In a star, one broken cable cuts off only one computer, but if the central device dies everyone is cut off. In a bus or a simple ring, one break can stop the whole network. A full mesh of n nodes (n devices) needs n × (n − 1) / 2 links: 5 nodes need 10 links and 10 nodes need 45.

**Failure:** Saying "star is the best" without the cost. A star needs more cable than a bus, and its centre is a single point of failure. Homes and offices still use it because it is easy to manage.

## Topic: Types of networks by size

**Definition:** PAN (personal area network) covers a few metres around one person. LAN (local area network) covers a room, a building or a campus. MAN (metropolitan area network) covers a city. WAN (wide area network) covers cities and countries. The internet is the biggest example.

**Why:** The size changes the technology and the speed. A LAN is fast and cheap. A WAN depends on leased lines (cables rented from a telecom company) and service providers (the companies that sell you internet access).

**Example:** Your phone and earbuds are a PAN. The Wi-Fi in your college is a LAN. The company that connects all its city offices over leased lines runs a WAN.

**Failure:** Giving hard numbers like "a PAN is exactly 10 metres". The number is a rule of thumb, not a standard. Say "a few metres".

## Topic: Intranet, extranet and VPN

**Definition:** An intranet is a private network of one organisation. An extranet lets chosen outsiders (partners, suppliers) reach part of it. A VPN (virtual private network) sends private traffic across the public internet inside an encrypted (scrambled so outsiders cannot read it) tunnel, so it behaves like a private link.

**Why:** A company would pay a lot to run its own cables between cities. A VPN gives a secure link over the existing internet at a lower cost.

**Example:** A person working from home connects through a VPN client (a program on their computer). The company network sees them as if they were inside the office. A site-to-site VPN does the same for a whole branch office through its router (the device that passes traffic between networks).

**Failure:** Thinking a VPN makes you anonymous or safe from everything. It protects the path between you and the VPN end, not what the website does with your data.

## Topic: Unicast, broadcast, multicast and anycast

**Definition:** Unicast sends to one receiver. Broadcast sends to every device on the local network. Multicast sends to a chosen group. Anycast sends to the nearest one of several machines that share the same address.

**Why:** The right choice saves bandwidth (the amount of data a link can carry). Sending a video stream once to a group is cheaper than sending a separate copy to each viewer.

**Example:** Opening a web page is unicast. When a laptop joins Wi-Fi, its first DHCP (Dynamic Host Configuration Protocol, the service that hands out addresses) request is broadcast because it does not know the server yet. IPv4 multicast uses addresses 224.0.0.0/4, and the "limited broadcast" address is 255.255.255.255. Content delivery networks (CDNs, groups of servers placed around the world) often use anycast so a user reaches the closest server.

**Failure:** Mixing up multicast and broadcast. Broadcast reaches everyone on the segment (the local part of the network), multicast reaches only those who joined the group.

## Questions

### What is the difference between a LAN and a WAN?

A LAN covers a small place such as a home, office or campus and is usually owned by one organisation. A WAN covers a large area such as cities or countries. It usually uses links rented from providers. The internet is a huge network of many networks.

### What is a topology and which one is common in offices?

A topology is the layout of nodes and links. Most offices use a star: every computer connects to a switch (a box that passes data between the devices plugged into it). It is easy to add or remove a machine, and one bad cable only cuts off one machine. The weak point is the central switch.

### What is a VPN and why would a company use one?

A VPN builds an encrypted tunnel over the public internet between a user or office and the company network. The company gets a private link without paying for its own cables. Remote staff and branch offices use it to reach internal systems safely.

### What are the three parts of a protocol?

Syntax is the format of the data, semantics is the meaning of each part, and timing is when data is sent and how fast.

## Mistakes

- Saying a star topology has no weak point. If the central device fails, the whole network fails.
- Calling every network a "LAN" or "WAN" by speed alone. The names come from the area covered, not the speed.
- Saying a VPN encrypts everything you do online. It encrypts the tunnel only (the path between you and the VPN end).

## Quiz

### In a star topology, what happens if the central switch fails?

- [ ] Only one computer loses connection
- [x] Every computer connected to it loses connection
- [ ] Traffic switches automatically to a ring
- [ ] Nothing, because the nodes talk to each other directly

Explanation: All traffic in a star passes through the central device, so its failure cuts off every node. A broken cable cuts off only one machine.

### How many links does a full mesh of 10 nodes need?

- [ ] 10
- [ ] 20
- [x] 45
- [ ] 90

Explanation: A full mesh needs n × (n − 1) / 2 links. For 10 nodes that is 10 × 9 / 2 = 45.

### Which type of network covers a whole city?

- [ ] PAN
- [ ] LAN
- [x] MAN
- [ ] VPN

Explanation: A metropolitan area network covers a city. A PAN is personal, a LAN is a building or campus, and a VPN is a private tunnel, not a size.

### A laptop joining Wi-Fi asks for an address before it knows any server. Which kind of sending is that?

- [ ] Unicast
- [ ] Multicast
- [x] Broadcast
- [ ] Anycast

Explanation: The laptop does not know the DHCP server (the machine that hands out addresses), so it sends the request to everyone on the local network.

### What does a VPN do?

- [ ] Makes the internet faster
- [ ] Stops every website from tracking you
- [x] Carries private traffic over the public internet inside an encrypted tunnel
- [ ] Replaces the need for a firewall

Explanation: A VPN is an encrypted tunnel over a public network. It does not speed up the connection or replace other security tools.

## Diagram

```json
{ "kind": "graph", "caption": "A star topology: every computer connects to the central switch. If the switch fails, all of them lose the network.", "nodes": [{ "id": "sw", "label": "Switch", "x": 50, "y": 50 }, { "id": "a", "label": "PC A", "x": 15, "y": 20 }, { "id": "b", "label": "PC B", "x": 85, "y": 20 }, { "id": "c", "label": "PC C", "x": 15, "y": 80 }, { "id": "d", "label": "PC D", "x": 85, "y": 80 }], "edges": [{ "from": "a", "to": "sw" }, { "from": "b", "to": "sw" }, { "from": "c", "to": "sw" }, { "from": "d", "to": "sw" }] }
```
