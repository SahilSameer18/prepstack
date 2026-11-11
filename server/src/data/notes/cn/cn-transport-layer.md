---
id: cn-transport-layer
title: Transport Layer: TCP and UDP
lastChecked: 2026-11-11
next: cn-http-https-tls
roadmapSteps: backend:os-networking-basics, frontend:internet-web-fundamentals
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Written from docs/content/source-notes/cn-batch-a.md (section D). Numbers computed by cn-check.js. Claims: docs/content/SOURCES.md. -->

## Overview

The transport layer carries data between two programs, not just two machines. It uses ports to tell programs apart, and it offers two main choices: TCP, which is reliable and ordered, and UDP, which is light and fast but promises nothing. This is the most asked part of networking: TCP against UDP, the three-way handshake, how a connection closes, and how TCP slows down when the network is crowded.

After this section you can compare TCP and UDP, trace the handshake with real sequence numbers, explain flow control against congestion control, and give the common port numbers.

## Topic: Ports and sockets

**Definition:** A port is a 16-bit number that names a program on a machine. Ports 0 to 1023 are system (well-known) ports, 1024 to 49151 are registered (user) ports, and 49152 to 65535 are dynamic ports that clients use for short-lived connections. Common ports: FTP 21, SSH 22, Telnet 23, SMTP 25, DNS 53, DHCP 67 and 68, HTTP 80, POP3 110, IMAP 143, HTTPS 443.

**Why:** One machine runs many network programs at once. The port tells the operating system which program gets the data.

**Example:** A browser connects from a dynamic port such as 50000 to the server's port 443. A TCP connection is named by four values together: source address, source port, destination address and destination port. The dynamic range has 16,384 ports (49152 to 65535).

**Failure:** Saying "one port can only serve one client". A server port serves thousands of clients, because each connection has a different four-value name.

## Topic: TCP against UDP

**Definition:** TCP sets up a connection first, then gives a reliable, in-order stream of bytes. It retransmits lost data, controls flow and congestion, and works both ways at once (full duplex). UDP has no connection. Its header is only four fields of 16 bits (source port, destination port, length, checksum), which is 8 bytes. It does not retransmit, reorder or guarantee delivery.

**Why:** Reliability costs time. Web pages, files and email need every byte, so they use TCP. Live video, voice calls and games prefer a fast answer over a perfect one, so they use UDP. DNS queries normally use UDP too.

**Example:** A DNS query is one small UDP message and one answer. If it is lost, the program just asks again. A file download over UDP would arrive with holes unless the program added its own checks.

**Failure:** Saying "UDP is unreliable so nobody uses it". It is used a lot, and HTTP/3 even builds its own reliability on top of UDP (through QUIC).

## Topic: Three-way handshake

**Definition:** TCP opens a connection with three segments. 1) Client sends SYN with its starting sequence number x. 2) Server answers SYN-ACK with its own starting number y and acknowledgement x + 1. 3) Client sends ACK with acknowledgement y + 1; this third segment may already carry data.

**Why:** Both sides agree on starting sequence numbers and confirm each can send and receive.

**Example:** Client starts at 1000, server at 5000. SYN seq=1000. SYN-ACK seq=5000 ack=1001. ACK seq=1001 ack=5001. Now the client sends 300 bytes starting at seq=1001; the server replies ack=1301. A SYN and a FIN each use up one sequence number, a plain ACK uses none.

**Failure:** A SYN flood sends many SYNs and never completes the handshake, so the server's table of half-open connections fills. SYN cookies are a common defence: the server packs the connection details into its own sequence number and stores nothing until the final ACK comes back.

## Topic: Closing a connection

**Definition:** Each side closes its own direction with a FIN, and the other side acknowledges it. That makes four segments (or three if the second side's FIN is sent together with its ACK). The side that closes first waits in TIME-WAIT for 2 × MSL before it is fully done; the RFC value for MSL is 2 minutes, so 4 minutes. Real systems often use a shorter time.

**Why:** TIME-WAIT makes sure the last ACK arrives and old duplicate segments from this connection die out before the same four-value name is reused.

**Example:** The client sends FIN seq=1301 (after the 300 bytes), the server acks 1302, the server sends its own FIN, and the client sends the final ACK and waits.

**Failure:** Thinking TIME-WAIT is a bug. It is on purpose.

## Topic: Reliability, timeout and fast retransmit

**Definition:** The receiver sends a cumulative acknowledgement: the number of the next byte it expects. The sender times out when no ACK arrives. The timeout is EstimatedRTT + 4 × DevRTT, so in the textbook formula an estimate of 100 ms and a deviation of 10 ms give 140 ms. Real systems round the timeout up (RFC 6298 says at least 1 second). If the sender receives three duplicate ACKs for the same number, it resends that segment at once without waiting (fast retransmit).

**Why:** Waiting for the timer is slow. Three duplicate ACKs is a strong hint that one segment was lost while later ones arrived.

**Example:** Segments 1 to 5 are sent. Segment 2 is lost. The receiver keeps replying "I want 2" for 3, 4 and 5, so the sender sees three duplicates and resends 2.

**Failure:** Saying TCP acknowledges every segment individually. The ACK is cumulative: "everything before this byte arrived".

## Topic: Flow control and congestion control

**Definition:** Flow control protects the receiver: it advertises a window (how many bytes it can still accept). Congestion control protects the network: the sender keeps its own window, cwnd, and changes it. This follows the usual textbook (Reno) model. Slow start begins at a small window (the textbook value is 1 MSS; real systems start at 1, 2, 4 or 10) and doubles each round trip until it reaches ssthresh; then congestion avoidance adds 1 MSS per round trip. On three duplicate ACKs the window is halved. On a timeout cwnd drops back to 1 MSS and ssthresh becomes half the old window.

**Why:** Without congestion control, every sender would push as hard as possible and the network would collapse.

**Example:** With ssthresh 8, the cwnd per round trip is 1, 2, 4, 8, 9, 10, 11, 12, 13. If a loss shows at cwnd 12: three duplicate ACKs give 6; a timeout gives cwnd 1 and ssthresh 6.

**Failure:** Mixing the two. Flow control answers "how fast can the receiver take it?". Congestion control answers "how fast can the network take it?". The sender uses the smaller of the two windows. (The real rule in RFC 5681 is a little more exact: the new ssthresh is the larger of half the unacknowledged data and 2 × MSS. Halving is the simple textbook version.)

## Questions

### What is the difference between TCP and UDP?

TCP is connection-oriented, reliable and ordered, and it controls flow and congestion. UDP has no connection and no guarantees, and its header is only 8 bytes. TCP suits web pages and files. UDP suits live media, games and DNS.

### Explain the three-way handshake.

The client sends SYN with its sequence number. The server replies SYN-ACK with its own number and acknowledges the client's number plus one. The client sends ACK for the server's number plus one. After that, data can flow in both directions.

### What is the difference between flow control and congestion control?

Flow control stops a fast sender from overloading a slow receiver, using the receiver's advertised window. Congestion control stops senders from overloading the network, using the sender's congestion window.

### Why does TCP use TIME-WAIT?

To make sure the final ACK reaches the other side and old duplicate segments disappear before the same connection name is used again.

### How can UDP be reliable?

It cannot by itself. An application can add its own acknowledgements, numbering and retransmission on top, as QUIC does.

## Mistakes

- Saying TCP is "always better" than UDP. They solve different problems.
- Saying all three handshake segments carry data. They are control segments, and data may ride on the third.
- Saying the sequence number counts segments. It counts bytes.

## Quiz

### How many header fields does UDP have?

- [ ] Two
- [x] Four
- [ ] Six
- [ ] Ten

Explanation: UDP has source port, destination port, length and checksum, each 16 bits, 8 bytes in all.

### The client starts at sequence 1000. What ack value does the SYN-ACK carry?

- [ ] 1000
- [x] 1001
- [ ] 1002
- [ ] 5001

Explanation: The SYN uses one sequence number, so the server acknowledges 1000 + 1 = 1001.

### After the client sends 300 bytes starting at sequence 1001, what ack does the server send?

- [ ] 1300
- [x] 1301
- [ ] 1302
- [ ] 300

Explanation: The ack is the next byte expected: 1001 + 300 = 1301.

### Which event makes TCP cut its congestion window to 1 MSS in the textbook model?

- [ ] Three duplicate ACKs
- [x] A retransmission timeout
- [ ] A successful handshake
- [ ] The receiver advertising a larger window

Explanation: A timeout is treated as heavy congestion, so cwnd falls to 1 MSS and ssthresh becomes half the old window. Three duplicate ACKs only halve the window.

### Which port does DNS normally use?

- [ ] 25
- [x] 53
- [ ] 80
- [ ] 110

Explanation: DNS uses port 53. Port 25 is SMTP, 80 is HTTP and 110 is POP3.

## Diagram

```json
{ "kind": "flow", "caption": "The TCP three-way handshake with sample sequence numbers: client starts at 1000, server at 5000.", "steps": [{ "label": "Client: SYN seq=1000" }, { "label": "Server: SYN-ACK seq=5000 ack=1001" }, { "label": "Client: ACK seq=1001 ack=5001" }, { "label": "Data flows both ways" }] }
```
