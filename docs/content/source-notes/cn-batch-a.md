# Computer Networks source notes, batch A (11 Nov 2026)

Scope: network basics, OSI and TCP/IP models, IP addressing and subnetting, transport layer (TCP, UDP).
Rule: facts below are restated in our own words from the source named on each line. Nothing here is copied. Terms of use are listed per source at the end.
Status: read by us; not yet checked by an outside reader.

## How the topic list was chosen (interview frequency)
The owner's CN PDF ("Computer Networking Notes for Tech Placements", 16 pages) marks these as important ("Imp" / "Most Imp"): network types, OSI model, DNS and how it works, MAC vs IP address, NIC, "what happens when you type google.com". It also lists topologies, VPN, IPv4 classes, TCP vs UDP, HTTP/HTTPS, SMTP, DHCP, FTP, ICMP, ARP, RIP, firewall, hub vs switch, subnet, gateway vs router, private vs public IP, ping/netstat/ipconfig, cast types.
Batch A covers the first half of that list. Batch B (application layer, DNS, protocols, devices, routing, security, key flows, system-design pieces) comes next.

## A. Basics (network, topology, types)
- Topologies (star, ring, bus, mesh, tree, hybrid): owner PDF pp. 1-3; Wikipedia "Network topology". Star: one central device, one cable failing cuts only that machine, the central device failing cuts everyone. Bus: shared cable, one break affects all. Ring: each node joined to two neighbours. Mesh: full or partial; many links, costly. Tree: stars joined by a bus. Hybrid: mix.
- PAN / LAN / MAN / WAN: owner PDF p. 4; Wikipedia "Computer network". Sorted by area covered. PDF says PAN is "up to 10 metres": that is a common rule of thumb, not a standard; we say "a few metres".
- Intranet / extranet / VPN: owner PDF p. 4-5; Wikipedia. A VPN carries private traffic over the public internet inside an encrypted tunnel.
- Unicast, multicast, broadcast, anycast: owner PDF p. 16; RFC 3330 (multicast 224.0.0.0/4, limited broadcast 255.255.255.255).

## B. OSI and TCP/IP models
- OSI has seven layers and was published in 1984 as ISO 7498 (Wikipedia "OSI model"). Layer order and example protocols: physical, data link, network, transport, session, presentation, application (owner PDF pp. 6-8; Wikipedia).
- TCP/IP model has four layers: link, internet, transport, application (owner PDF p. 9; Wikipedia "Internet protocol suite"). Encapsulation: each layer wraps the data from the layer above with its own header; the unit names are segment (TCP) or datagram (UDP), packet (IP), frame (link), bits.
- Mistakes found in the owner PDF (do not copy): it says the TCP/IP model came from the "1860s" (the work started in the 1960s-70s); it says the network layer "converts a logical address into a physical address" (that is ARP, which sits between layers 2 and 3; the network layer routes); the session layer "reports errors from upper layers" (no standard source says so).
- MAC address: 48 bits, first half is the manufacturer's code (OUI), can be changed in software (Wikipedia "MAC address"). The PDF says IP "uniquely identifies the device on the internet"; it identifies an interface and can change or be shared behind NAT.

## C. IP addressing and subnetting
- IPv4 address: 32 bits, written as four decimal numbers 0-255 (RFC 791; Kurose ch. 4 slide 44). IPv6: 128 bits (RFC 8200; Kurose slide 70).
- Subnet: devices that can reach each other without passing through a router share the high-order bits (the subnet part); the remaining low-order bits identify the host (Kurose slide 47). "/x" means the first x bits are the network part (Kurose slide 50; RFC 4632).
- Classes A, B, C were first bits 0, 10, 110 (RFC 791); classless prefixes replaced classes (RFC 4632). The PDF's class A-E list is kept only as history.
- Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16; not routed on the public internet (RFC 1918). Loopback 127.0.0.0/8, link-local 169.254.0.0/16, 0.0.0.0/8 (RFC 3330).
- NAT: the router swaps (private address, port) for (its public address, a new port) on the way out, remembers the pair in a table, and swaps back for the reply (Kurose slides 66-67; RFC 3022). Kurose lists the objections: layer-3 device touching ports, breaks end-to-end, hard to reach a server behind NAT (slide 68).
- DHCP: discover, offer, request, ack; gives address, gateway, DNS server, mask (Kurose slides 52, 55). Server port 67, client port 68 (IANA). The PDF says "uses port 67" without the client side.
- Route aggregation: one prefix (200.23.16.0/20) stands for eight /23 customers (Kurose slide 59).
- IPv6 header is fixed 40 bytes; no checksum; no fragmentation by routers; hop limit (Kurose slide 70; RFC 8200). Transition by tunnelling an IPv6 packet inside IPv4 (Kurose slide 71).
- IPv4 header fields: version, header length, TTL, protocol, checksum, source, destination, identification/flags/offset for fragmentation (Kurose slide 43; RFC 791).
- ICMP: echo request type 8 and reply type 0, destination unreachable type 3, time exceeded type 11 (RFC 792). ICMP has no ports. The PDF's "ICMP uses port 7" is wrong (port 7 is the Echo service of UDP/TCP, a different thing; IANA).
- ARP: broadcast request on the local network, unicast reply, cache (RFC 826).

## D. Transport layer
- TCP: connection-oriented, reliable, in-order byte stream, full duplex, flow controlled, cumulative ACKs (Kurose ch. 3; RFC 9293). Sequence number counts bytes; the ACK number is the next byte expected.
- Three-way handshake: SYN (seq x), SYN-ACK (seq y, ack x+1), ACK (ack y+1; may already carry data). SYN and FIN each use up one sequence number; a plain ACK uses none (RFC 9293; Kurose).
- Close: FIN and ACK from each side, so four segments (or three if the second side's FIN rides with its ACK); the side that closes first waits 2 x MSL in TIME-WAIT, MSL = 2 minutes in the RFC (RFC 9293). Many systems use a shorter value; we state the RFC number and say systems differ.
- Timeout: TimeoutInterval = EstimatedRTT + 4 x DevRTT (Kurose; RFC 6298).
- Fast retransmit after three duplicate ACKs (Kurose; RFC 5681).
- Congestion control: slow start doubles cwnd per RTT (adds one MSS per ACK); at ssthresh switch to congestion avoidance (+1 MSS per RTT); on triple duplicate ACK halve; on timeout cwnd = 1 MSS and ssthresh = half the old value (RFC 5681 uses max(FlightSize/2, 2 x SMSS)) (Kurose; RFC 5681).
- Flow control: the receiver advertises a window (Kurose segment structure; RFC 9293). Flow control protects the receiver; congestion control protects the network.
- UDP: header is four 16-bit fields (source port, destination port, length, checksum); no handshake, no retransmission, no ordering; protocol number 17 (RFC 768).
- Ports: 0-1023 system, 1024-49151 user, 49152-65535 dynamic (IANA). FTP 21, SSH 22, Telnet 23, SMTP 25, DNS 53, HTTP 80, POP3 110, IMAP 143 (IANA). HTTPS 443 is general knowledge and **not yet read** in the IANA table.
- Mistake found in the PDF: "FTP uses port 27" (it is 21).
- Sockets: a TCP connection is identified by four values (source address, source port, destination address, destination port) (Kurose ch. 3 demultiplexing; general knowledge, **not re-read**).

## Not yet sourced (do not state in the notes until read)
HTTPS port 443 row; socket four-tuple slide text; any real-world TIME-WAIT figures for Linux; Nagle's algorithm; head-of-line blocking details; Kurose chapters 1, 2, 5 slides (too large for the fetch tool).

## Terms of use
- RFCs (IETF Trust): free to read; we restate, not copy.
- IANA registries: public domain dedication.
- Kurose and Ross slides: provided by the authors for teaching with a request for credit; we cite slide numbers and do not copy slides or figures.
- Wikipedia: CC BY-SA; used for secondary coverage only; no text copied.
- Owner PDF: the owner's own study material; used to decide topics and to find mistakes; not copied.
