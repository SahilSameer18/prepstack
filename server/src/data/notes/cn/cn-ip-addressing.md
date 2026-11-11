---
id: cn-ip-addressing
title: IP Addressing, NAT, DHCP and ARP
lastChecked: 2026-11-11
next: cn-subnetting
roadmapSteps: backend:os-networking-basics, frontend:internet-web-fundamentals
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Written from docs/content/source-notes/cn-batch-a.md (section C). Numbers computed in the scratchpad script cn-check.js. Claims: docs/content/SOURCES.md. -->

## Overview

An IP address tells the network where a device sits, like a postal address. Interviews ask about IPv4 against IPv6, private against public addresses, how NAT lets many devices share one public address, how DHCP gives a new device its address, and how ARP finds the MAC address for an IP. These topics connect to each other, so a clear story helps: a laptop joins Wi-Fi, gets an address from DHCP, uses ARP to reach the router, and NAT changes its address for the internet.

After this section you can explain each step and give the right numbers: 32 and 128 bits, the three private ranges, and ports 67 and 68.

## Topic: IPv4 and IPv6

**Definition:** An IPv4 address has 32 bits, written as four numbers from 0 to 255 (for example 192.168.1.10). That gives 4,294,967,296 addresses. An IPv6 address has 128 bits, written in hexadecimal groups. IPv6 has a fixed 40-byte header, no header checksum, and routers do not break packets into fragments; the sender must do that.

**Why:** IPv4 addresses were running out. IPv6 gives so many addresses (2 to the power 128) that every device can have its own.

**Example:** The two versions live together during the move. One way is tunnelling: an IPv6 packet is carried inside an IPv4 packet across the old parts of the network.

**Failure:** Saying IPv6 is "faster because it is newer". The fixed header and no checksum make router work simpler, but the main reason for IPv6 is the address space.

## Topic: Private, public and special addresses

**Definition:** Three ranges are reserved for private use and are not routed on the public internet: 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. Other special ones: 127.0.0.0/8 is loopback (your own machine), 169.254.0.0/16 is link-local (what a device gives itself when DHCP fails), 255.255.255.255 is the limited broadcast, and 224.0.0.0/4 is multicast.

**Why:** Private ranges let every home and company reuse the same numbers inside, and only the public addresses must be unique on the internet.

**Example:** 172.16.0.0/12 means 172.16.0.0 to 172.31.255.255. So 172.20.5.9 is private, but 172.32.0.1 is public. The common mistake is to think all of 172.x is private.

**Failure:** If an interviewer asks "is 192.168.1.1 reachable from the internet?", the answer is no: it is a private address, and the internet does not route it.

## Topic: NAT

**Definition:** Network address translation lets many private devices share one public address. When a packet goes out, the NAT router swaps the private (address, port) for its own public address and a new port, and writes the pair in a table. When the reply comes back to that public port, the router looks up the table and swaps back.

**Why:** It saves public addresses and keeps internal addresses from showing outside. This is not a security feature: NAT is not a firewall.

**Example:** Host 10.0.0.1 port 3345 calls a server at 128.119.40.186 port 80. The router (public 138.76.29.7) sends it as 138.76.29.7 port 5001 and stores "5001 ↔ 10.0.0.1:3345". The reply to 138.76.29.7:5001 is turned back into 10.0.0.1:3345.

**Failure:** Outside machines cannot start a connection to a device behind NAT, because no table entry exists yet. That is why hosting a server at home needs port forwarding. NAT is also criticised because a router (which should only handle addresses) changes port numbers too.

## Topic: DHCP

**Definition:** DHCP gives a device its address automatically when it joins a network. It also hands out the subnet mask, the default gateway and the DNS server. The four steps are: the client broadcasts Discover, a server replies with Offer, the client sends Request for the offered address, and the server confirms with Acknowledge. The server listens on UDP port 67 and the client on port 68.

**Why:** Typing addresses by hand does not scale, and DHCP lets addresses be reused when devices leave. An address is "leased" for a limited time, and the client asks to renew it.

**Example:** A phone joins Wi-Fi. It does not know any address, so Discover is a broadcast. If a DHCP server is on another subnet, a relay agent on the router passes the messages across.

**Failure:** If no DHCP server answers, many systems give themselves a 169.254.x.x address. That device can talk only to others on the same link.

## Topic: ARP and ICMP

**Definition:** ARP finds the MAC address that goes with an IP address on the local network: the asker broadcasts "who has this IP?" and the owner replies directly (unicast). Answers are kept in a cache. ICMP carries error and test messages for IP. Ping uses ICMP echo request (type 8) and echo reply (type 0). "Destination unreachable" is type 3 and "time exceeded" is type 11. ICMP has no ports.

**Why:** A frame needs a MAC address, but programs only know IP addresses. ICMP lets routers tell senders what went wrong.

**Example:** To send to 192.168.1.20 on the same subnet, a host uses ARP to get that machine's MAC. To send to an outside address it ARPs for the default gateway's MAC instead. Traceroute works by sending packets with small time-to-live values and reading the "time exceeded" replies from each router.

**Failure:** ARP replies are accepted without any proof, so an attacker on the same network can send false replies (ARP spoofing) and receive another device's traffic.

## Topic: IPv4 header and fragmentation

**Definition:** The IPv4 header carries a version, header length, total length, an identification and fragment offset (for fragmentation), time to live (TTL), the protocol number (6 is TCP, 17 is UDP), a header checksum, and the source and destination addresses. TTL goes down by one at each router; at zero the packet is dropped and an ICMP time-exceeded message is sent.

**Why:** TTL stops packets from looping forever. The protocol field tells the receiver which transport protocol gets the data.

**Example:** If a packet is larger than a link can carry (the MTU), an IPv4 router may break it into fragments, and the final receiver puts them together. IPv6 routers do not fragment.

**Failure:** Thinking IP is reliable. IP does not promise delivery, order or no duplicates. TCP adds that on top.

## Questions

### What is the difference between IPv4 and IPv6?

IPv4 has 32-bit addresses, about 4.3 billion in total. IPv6 has 128-bit addresses, so the supply is practically unlimited. IPv6 also has a simpler fixed header with no checksum, and routers do not fragment packets.

### How does NAT work?

The NAT router replaces the private source address and port with its own public address and a new port, and remembers the mapping in a table. When the reply returns, it uses the table to send it to the right private device.

### How does a device get an IP address on a new network?

By DHCP. It broadcasts Discover, a server offers an address, the client requests it, and the server acknowledges. The server also supplies the gateway, mask and DNS server.

### What does ARP do?

It finds the MAC address for an IP address on the local network, using a broadcast request and a unicast reply.

### Is 172.32.0.1 a private address?

No. The private range is 172.16.0.0 to 172.31.255.255 (172.16.0.0/12). 172.32.0.1 is just outside it.

## Mistakes

- Saying ICMP uses a port number. ICMP has types and codes, not ports.
- Saying DHCP uses only port 67. The server uses 67 and the client uses 68.
- Thinking an IP address identifies a person or a machine forever. It identifies a network interface, it can change, and many devices can share one public address through NAT.

## Quiz

### Which range is NOT private?

- [ ] 10.20.30.40
- [ ] 192.168.5.5
- [ ] 172.16.9.9
- [x] 172.32.0.1

Explanation: The private range is 172.16.0.0 to 172.31.255.255. 172.32.0.1 is just outside it and is a public address.

### How many bits are in an IPv6 address?

- [ ] 32
- [ ] 64
- [x] 128
- [ ] 256

Explanation: IPv6 addresses are 128 bits. IPv4 addresses are 32 bits.

### In the DHCP exchange, which message is broadcast first?

- [x] Discover
- [ ] Offer
- [ ] Request
- [ ] Acknowledge

Explanation: The client has no address and does not know the server, so it begins with a broadcast Discover.

### What does the NAT router store in its table?

- [ ] The MAC address of every website
- [x] The pairing of each private address and port with the public address and port it was given
- [ ] The DNS records of the network
- [ ] The password of each device

Explanation: The table lets the router change returning packets back to the right private address and port.

### What does ARP find?

- [ ] The IP address for a domain name
- [x] The MAC address for an IP address on the local network
- [ ] The fastest route to a server
- [ ] The port of a program

Explanation: ARP turns an IP address into a MAC address on the same network. DNS finds IP addresses for names.

## Diagram

```json
{ "kind": "flow", "caption": "NAT on the way out and the way back: the router swaps the private address and port for its public one, then reverses it for the reply.", "steps": [{ "label": "Host 10.0.0.1:3345 sends to 128.119.40.186:80" }, { "label": "NAT rewrites source to 138.76.29.7:5001 and stores the pair" }, { "label": "Server replies to 138.76.29.7:5001" }, { "label": "NAT looks up the pair and delivers to 10.0.0.1:3345" }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "DHCP in four steps: Discover, Offer, Request, Acknowledge.", "steps": [{ "label": "Client broadcasts Discover" }, { "label": "Server sends Offer" }, { "label": "Client sends Request" }, { "label": "Server sends Acknowledge" }] }
```
