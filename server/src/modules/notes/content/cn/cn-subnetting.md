---
id: cn-subnetting
title: Subnetting and CIDR
lastChecked: 2026-11-11
next: cn-transport-layer
roadmapSteps: backend:os-networking-basics
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Written from docs/content/source-notes/cn-batch-a.md (section C). Every number below comes from the script cn-check.js in the scratchpad. Claims: docs/content/SOURCES.md. -->

## Overview

Subnetting means cutting one big network into smaller ones. A prefix like /26 says how many of the 32 bits name the network; the rest name the host. Interviewers like this topic because it has exact answers: "how many hosts in a /26?", "what is the network address of 192.168.10.77/26?", "split 192.168.1.0/24 into four". There is nothing to guess; you follow the same steps every time.

After this section you can compute the network address, broadcast address, first and last host and host count for any prefix, split a network into equal parts, and explain why subnets exist.

## Topic: What a prefix means

**Definition:** In CIDR notation (Classless Inter-Domain Routing, a way of writing an address with its prefix length) a.b.c.d/x, the first x bits are the network part and the remaining 32 − x bits are the host part. CIDR replaced the old classes A, B and C, which had fixed sizes, with prefixes of any length.

**Why:** Devices in the same subnet (one smaller network inside a bigger one) can reach each other directly. To reach a different subnet they go through a router (a device that passes traffic between networks).

**Example:** 200.23.16.0/23 has 23 network bits, so 9 host bits: 512 addresses, from 200.23.16.0 to 200.23.17.255.

**Failure:** Remembering classes and ignoring the prefix. Today the prefix length is what counts.

## Topic: Mask, network, broadcast and host count

**Definition:** The subnet mask (a 32-bit number that marks which bits are the network part) has ones for the network bits and zeros for the host bits. Network address = the address with the host bits set to 0. Broadcast address (the address that reaches every device in the subnet) = the address with the host bits set to 1. Usable hosts = 2 to the power (32 − x), minus 2 (the network and broadcast addresses are not given to devices). This holds for /30 and shorter prefixes. The special cases /31 and /32 are outside interview level.

**Why:** A device compares its own network part to the destination's to decide: same subnet (send directly) or different (send to the gateway, the router that leads out of the subnet).

**Example:** Common sizes: /24 has 254 usable hosts, /25 has 126, /26 has 62, /27 has 30, /28 has 14, /30 has 2. The mask for /26 is 255.255.255.192. For /23 it is 255.255.254.0. For /12 it is 255.240.0.0.

**Failure:** Forgetting the "minus 2". A /30 has 4 addresses but only 2 hosts, which is why it is used for links between two routers (a point-to-point link between two routers needs only two addresses).

## Topic: Finding the subnet of an address

**Definition:** Find the octet (one of the four numbers in the address) where the prefix ends. The block size is 256 minus the mask value in that octet (for /26 the mask octet is 192, so 64. For /20 it is the third octet, 240, so 16). Then find the block that holds the address.

**Why:** It is the most asked subnet question.

**Example:** What is the network of 192.168.10.77/26? A /26 block is 64 addresses. Blocks start at .0, .64, .128, .192. 77 is in the block starting at .64. So the network is 192.168.10.64, the broadcast is 192.168.10.127, and hosts run from 192.168.10.65 to 192.168.10.126 (62 hosts). Two hosts, 192.168.10.70 and 192.168.10.100, are in the same /26, so they talk directly.

**Failure:** Doing the arithmetic on the wrong octet. For /26 the changing part is the last octet. For /20 it is the third.

## Topic: Splitting a network

**Definition:** To split a network into 2, 4, 8 equal parts, add 1, 2 or 3 bits to the prefix. Each added bit doubles the number of subnets and halves each subnet's size.

**Why:** A company can give each department its own subnet, which keeps broadcasts (messages sent to every device) small and lets firewalls (tools that block or allow traffic by rules) control traffic between departments.

**Example:** Split 192.168.1.0/24 into four. Add 2 bits to get /26. The subnets are 192.168.1.0/26 (hosts .1 to .62), 192.168.1.64/26 (.65 to .126), 192.168.1.128/26 (.129 to .190) and 192.168.1.192/26 (.193 to .254). Each has 62 hosts, so four subnets give 248 hosts, fewer than the 254 in the whole /24, because every subnet loses 2 addresses.

**Failure:** Expecting no loss. Splitting always costs the network and broadcast address of every subnet.

## Topic: Route aggregation

**Definition:** Route aggregation means one shorter prefix can stand for many longer ones, so a router needs one table entry (one line in its list of routes) instead of many. This is also called supernetting.

**Why:** Smaller routing tables, and faster lookups, across the internet.

**Example:** An ISP (internet service provider, the company that sells internet access) owns 200.23.16.0/20 (4,096 addresses, 200.23.16.0 to 200.23.31.255). It gives eight /23 blocks (512 addresses each) to eight customers: 200.23.16.0/23, 200.23.18.0/23 and so on up to 200.23.30.0/23. The rest of the internet only needs the one /20 route to the ISP.

**Failure:** If a router has two matching routes, it picks the longest prefix (the most specific one). A /24 route beats a /16 route for an address in both.

## Topic: Why subnet at all

**Definition:** Subnets cut broadcast traffic, make it possible to apply security rules between groups, and let the address plan follow the organisation.

**Why:** A flat network (one with no subnets) with thousands of devices sends every broadcast to every device.

**Example:** A college has one subnet for students, one for staff and one for servers. A firewall rule can block students from reaching the server subnet.

**Failure:** Treating subnetting (cutting a network into smaller ones) as only a maths trick. In an interview also say what it is for: broadcasts, security, and a tidy address plan.

## Questions

### How many usable hosts are in a /26?

A /26 has 6 host bits, so 64 addresses. Minus the network and broadcast addresses, 62 usable hosts.

### Find the network and broadcast address of 192.168.10.77/26.

The /26 blocks are 64 wide, and 77 is in the block that starts at 64. Network 192.168.10.64, broadcast 192.168.10.127.

### How do you split 192.168.1.0/24 into four equal subnets?

Add two bits to the prefix to get /26. The subnets start at 192.168.1.0, .64, .128 and .192, each with 62 hosts.

### What is CIDR and why did it replace classes?

CIDR writes an address with a prefix length, like /23, so a block can be any power-of-two size (such as 2, 4, 8, 16 and so on). Classes only allowed three fixed sizes. That wasted many addresses.

## Mistakes

- Giving the host count as 2 to the power n without subtracting 2.
- Saying a /30 has 4 hosts. It has 4 addresses and 2 usable hosts.
- Saying all 172.x.x.x addresses are private. Only 172.16.0.0 to 172.31.255.255 is.

## Quiz

### How many usable hosts are in a /27?

- [ ] 32
- [x] 30
- [ ] 28
- [ ] 62

Explanation: A /27 has 5 host bits, so 32 addresses. Minus 2 leaves 30 usable hosts.

### What is the broadcast address of 192.168.10.77/26?

- [ ] 192.168.10.63
- [ ] 192.168.10.100
- [x] 192.168.10.127
- [ ] 192.168.10.255

Explanation: The /26 blocks are 64 wide: .64 to .127. The last address of the block, .127, is the broadcast.

### Which mask matches /23?

- [ ] 255.255.255.0
- [x] 255.255.254.0
- [ ] 255.255.252.0
- [ ] 255.254.0.0

Explanation: A mask has 23 ones, so the first two octets are all ones and the third octet has 7 ones, which is 254.

### Splitting a /24 into four equal subnets gives which prefix?

- [ ] /25
- [x] /26
- [ ] /27
- [ ] /28

Explanation: Four subnets need two extra bits, so /24 becomes /26.

### How many /23 blocks fit inside a /20?

- [ ] 4
- [x] 8
- [ ] 16
- [ ] 32

Explanation: The difference in prefix length is 3 bits, and 2 to the power 3 is 8.

## Diagram

```json
{ "kind": "layers", "caption": "One /24 split into four /26 subnets. Each subnet has 62 usable hosts.", "layers": [{ "label": "192.168.1.0/26: hosts .1 to .62" }, { "label": "192.168.1.64/26: hosts .65 to .126" }, { "label": "192.168.1.128/26: hosts .129 to .190" }, { "label": "192.168.1.192/26: hosts .193 to .254" }] }
```
