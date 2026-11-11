---
id: cn-osi-tcpip-models
title: OSI and TCP/IP Models
lastChecked: 2026-11-11
next: cn-ip-addressing
roadmapSteps: backend:os-networking-basics, frontend:internet-web-fundamentals
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Written from docs/content/source-notes/cn-batch-a.md (section B). Claims: docs/content/SOURCES.md. -->

## Overview

The OSI model splits network work into seven layers, and the TCP/IP model that the internet actually uses splits it into four. Interviewers ask "name the seven layers" in almost every networking round, and then follow with "at which layer does a router work?" or "what is a packet and what is a frame?". A layer model matters because each layer does one job and only talks to the layer above and below it.

After this section you can list both models in order, say what each layer does, place common protocols and devices on the right layer, and explain encapsulation with the correct names for the data at each step.

## Topic: Why layers

**Definition:** A layered model divides the job of sending data into steps. Each layer has one task, uses the services of the layer below, and offers a service to the layer above. The same layer on two machines (its peer) follows the same protocol.

**Why:** You can change one layer without touching the others. Wi-Fi can replace Ethernet below, and your browser does not need to change.

**Example:** A web browser (top layer) only asks "send this request to that server". It does not care if the data travels over cable or wireless.

**Failure:** Treating the layers as a strict rule of real software. The internet's own model is the four-layer TCP/IP one; the seven-layer OSI model is mostly a teaching and reference tool.

## Topic: The seven OSI layers

**Definition:** The OSI model was published in 1984 as ISO 7498. From the bottom: 1 Physical (raw bits on cable, light or radio), 2 Data link (frames between neighbouring devices, with MAC addresses and error checking), 3 Network (packets between networks, with IP addresses and routing), 4 Transport (end-to-end delivery between programs, with ports: TCP and UDP), 5 Session (starting, keeping and ending a conversation), 6 Presentation (data format, compression, encryption), 7 Application (what the user's program uses: HTTP, DNS, SMTP).

**Why:** Knowing the layer tells you which tool and which kind of fault to look at. A dead cable is layer 1. A wrong IP is layer 3. A closed port is layer 4.

**Example:** A switch reads the MAC address in a frame, so it works at layer 2. A router reads the IP address in a packet, so it works at layer 3. A hub just repeats bits, so it works at layer 1. A common memory trick for layers 7 down to 1: "All People Seem To Need Data Processing".

**Failure:** Sessions and presentation are rarely separate layers in real internet software; browsers and libraries do that work inside the application. Do not invent separate "session protocols" for the internet in an interview.

## Topic: The four TCP/IP layers

**Definition:** Link (the local network: Ethernet, Wi-Fi), Internet (IP, ICMP: addressing and routing), Transport (TCP, UDP), Application (HTTP, DNS, SMTP and the rest). The TCP/IP application layer covers OSI layers 5, 6 and 7 together.

**Why:** This is the stack that real computers implement. Operating systems provide the transport and internet layers; applications sit on top.

**Example:** Your browser (application) hands data to TCP (transport), which hands it to IP (internet), which hands it to the Wi-Fi card (link).

**Failure:** Saying "the network layer converts a logical address into a physical address". That job belongs to ARP. The network layer's job is routing: choosing the path for a packet across networks.

## Topic: Encapsulation

**Definition:** As data moves down the layers, each layer adds its own header around the data it received (and the link layer also adds a trailer). On the receiving side each layer removes its header on the way up. The data unit has a name at each level: application data, then a TCP segment (or UDP datagram), then an IP packet, then a link-layer frame, then bits on the wire.

**Why:** The headers carry the information each layer needs: ports for the transport layer, IP addresses for the network layer, MAC addresses for the link layer.

**Example:** A request goes browser → HTTP message → TCP segment (adds ports) → IP packet (adds source and destination IP) → Ethernet frame (adds source and destination MAC). At every router the frame is thrown away and rebuilt for the next link, but the IP packet inside stays the same (apart from its time-to-live).

**Failure:** Saying the MAC address stays the same all the way to the server. MAC addresses only matter on one link; they change at every router. The IP addresses stay the same end to end (unless NAT rewrites them).

## Topic: Where devices and protocols sit

**Definition:** Hub: layer 1. Switch and bridge: layer 2. Router: layer 3. Load balancers and firewalls can work at layer 4 or layer 7, depending on the type. ARP sits between layers 2 and 3. TCP and UDP are layer 4. HTTP, DNS, SMTP, FTP are layer 7.

**Why:** Interviewers use "at which layer does X work" as a quick test of whether you understand what X reads in a packet.

**Example:** A layer 4 load balancer chooses a server using IP address and port. A layer 7 load balancer can read the URL or a cookie to choose.

**Failure:** Calling ARP "layer 3" or "layer 2" without explanation. It is usually described as sitting between them: it uses IP addresses to find MAC addresses.

## Questions

### Name the seven OSI layers in order.

From the top: Application, Presentation, Session, Transport, Network, Data link, Physical. From the bottom: Physical, Data link, Network, Transport, Session, Presentation, Application.

### What is the difference between OSI and TCP/IP?

OSI is a seven-layer reference model made as an international standard. TCP/IP has four layers and is what the internet really uses. TCP/IP merges OSI's session, presentation and application layers into one application layer, and its link layer covers OSI's physical and data link layers.

### What is encapsulation?

Each layer wraps the data from the layer above with its own header on the sending side, and the receiving side removes the headers one layer at a time. The unit is called a segment at TCP, a packet at IP and a frame at the link layer.

### Which address changes at each router, MAC or IP?

The MAC address changes at every hop because it only identifies a device on one link. The IP addresses stay the same from source to destination unless NAT changes them.

## Mistakes

- Saying a router works at layer 2 or a switch at layer 3. A plain switch uses MAC addresses (layer 2); a router uses IP addresses (layer 3). Layer 3 switches exist, but they are a separate device.
- Believing the TCP/IP model is just the OSI model with fewer layers. It was designed first for the real internet protocols, and the layers do not map one to one.
- Using "packet", "frame" and "segment" as the same word. Each belongs to a different layer.

## Quiz

### At which OSI layer does a switch normally work?

- [ ] Layer 1, physical
- [x] Layer 2, data link
- [ ] Layer 3, network
- [ ] Layer 4, transport

Explanation: A switch learns MAC addresses and forwards frames, which is layer 2 work. A hub is layer 1 and a router is layer 3.

### Which address changes at every router along the path?

- [ ] The destination IP address
- [ ] The source IP address
- [x] The MAC addresses on the link
- [ ] The destination port

Explanation: MAC addresses identify devices on one link, so the frame is rebuilt at each hop. The IP packet inside keeps the same IP addresses.

### How many layers does the TCP/IP model have?

- [ ] Three
- [x] Four
- [ ] Five
- [ ] Seven

Explanation: The TCP/IP model has link, internet, transport and application layers. Seven is the OSI model.

### What is the name for the data unit at the TCP level?

- [ ] Frame
- [ ] Packet
- [x] Segment
- [ ] Bit

Explanation: TCP data is a segment, IP data is a packet, and link-layer data is a frame.

### Which job belongs to the network layer?

- [ ] Turning an IP address into a MAC address
- [x] Choosing the path of a packet across networks
- [ ] Encrypting the web page
- [ ] Turning bits into radio signals

Explanation: Routing is the network layer's job. Finding a MAC address for an IP address is ARP, and radio signals are the physical layer.

## Diagram

```json
{ "kind": "layers", "caption": "The seven OSI layers from top to bottom. The TCP/IP model joins the top three into one application layer and the bottom two into one link layer.", "layers": [{ "label": "7 Application (HTTP, DNS, SMTP)" }, { "label": "6 Presentation (format, encryption)" }, { "label": "5 Session (open, keep, close)" }, { "label": "4 Transport (TCP, UDP, ports)" }, { "label": "3 Network (IP, routing)" }, { "label": "2 Data link (MAC, frames)" }, { "label": "1 Physical (bits)" }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "Encapsulation on the sending side: each layer adds its own header.", "steps": [{ "label": "Application data" }, { "label": "TCP segment (adds ports)" }, { "label": "IP packet (adds IP addresses)" }, { "label": "Frame (adds MAC addresses)" }, { "label": "Bits on the wire" }] }
```
