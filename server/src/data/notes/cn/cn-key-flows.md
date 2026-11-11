---
id: cn-key-flows
title: What Happens When You Type a URL
lastChecked: 2026-11-11
next: cn-system-design-concepts
roadmapSteps: backend:os-networking-basics, frontend:internet-web-fundamentals
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Pulls together the other CN drafts; the order of steps follows the owner's PDF (p. 13), with details from batch A and B notes. Claims: docs/content/SOURCES.md. -->

## Overview

"What happens when you type google.com in the browser and press Enter?" is the most asked networking question of all. It is a test of whether you can connect everything: DNS, TCP, TLS, HTTP, caching and rendering. A good answer is a short story in order, with one sentence per step and the right protocol names.

After this section you can tell that story in about two minutes, go deeper on any step if the interviewer asks, and say where each step can fail or be skipped.

## Topic: Step 1: the browser checks its caches

**Definition:** Before using the network, the browser looks for a fresh copy of the page in its cache. It also looks for the IP address of the host in its own cache and then in the operating system's cache.

**Why:** The fastest request is the one never sent.

**Example:** A page with `Cache-Control: max-age=3600` fetched ten minutes ago is shown straight from the cache.

**Failure:** Starting the story with DNS and forgetting caches. Interviewers often ask "what if it is cached?".

## Topic: Step 2: DNS lookup

**Definition:** If the IP address is unknown, the operating system asks a DNS resolver, normally over UDP port 53. The resolver answers from its cache or walks root, top-level domain and authoritative servers, then returns the IP address.

**Why:** Connections need an IP address, not a name.

**Example:** `www.example.com` becomes an IP address, for example 203.0.113.10 (a made-up address reserved for examples).

**Failure:** If DNS fails, nothing else happens: the browser shows "server not found".

## Topic: Step 3: TCP connection (HTTP/1.1 and HTTP/2)

**Definition:** The browser opens a TCP connection to the server's port (80 for HTTP, 443 for HTTPS) with the three-way handshake: SYN, SYN-ACK, ACK. To send the packets, the computer uses ARP to learn the MAC address of its default gateway, and the packets are routed hop by hop.

**Why:** TCP gives a reliable stream for HTTP.

**Example:** One round trip for the handshake, before any HTTP is sent.

**Failure:** A server that is down or a firewall that drops the SYN makes the browser wait and then time out.

## Topic: Step 4: TLS handshake for HTTPS

**Definition:** For https:// the browser and server run a TLS handshake: they agree on a version and keys, and the browser checks the server's certificate. After that, everything is encrypted.

**Why:** It protects the page and any form data from being read or changed on the path.

**Example:** A bad certificate shows the browser a warning page and the connection stops.

**Failure:** Skipping this step in the story when the URL is https.

## Topic: Step 5: HTTP request and response

**Definition:** The browser sends an HTTP request such as `GET / HTTP/1.1` with headers (host, cookies, accept). The server code runs and sends a response with a status code, headers and a body, often HTML. The browser may keep the connection open for the next requests.

**Why:** This is the actual work: the page content.

**Example:** `200 OK` with HTML; or `301` redirecting from http to https, which restarts the story at the new address.

**Failure:** Forgetting redirects. A single typed URL often causes two or three requests.

## Topic: Step 6: rendering

**Definition:** The browser reads the HTML, finds more files (CSS, JavaScript, images, fonts) and fetches each one, often over the same connection with HTTP/2. If the response allows caching, the browser stores it. Then it builds the page and draws it.

**Why:** One URL means many requests. This is why caching, compression and CDNs matter.

**Example:** A page with 60 files makes 60 small requests, after the first HTML request.

**Failure:** Saying the browser draws the page only after everything arrives. It draws as it goes.

## Questions

### What happens when you type google.com in your browser?

Check caches, look up the IP with DNS, open a TCP connection with the three-way handshake, do a TLS handshake for HTTPS, send an HTTP request, receive the response, fetch the extra files and render the page.

### Where is ARP used in this story?

Before the first packet leaves the machine, the computer needs the MAC address of its default gateway. It finds it with ARP on the local network.

### What can make this process slow?

A slow DNS lookup, many round trips for TCP and TLS, a slow server, large uncompressed files, many separate requests, or no caching.

### How would HTTP/3 change the story?

There is no TCP handshake. The browser uses QUIC over UDP, and its own handshake carries TLS 1.3, so one handshake replaces both steps 3 and 4.

## Mistakes

- Skipping DNS or saying DNS happens after the TCP connection. DNS comes first because TCP needs an IP address.
- Forgetting HTTPS adds a TLS handshake.
- Not mentioning caches at several levels (browser, OS, DNS resolver, CDN).

## Quiz

### What comes first when you type a URL and the page is not cached?

- [ ] The TCP handshake
- [x] A DNS lookup
- [ ] The HTTP request
- [ ] Rendering

Explanation: TCP needs an IP address, so the name must be resolved first.

### Which protocol finds the MAC address of the default gateway?

- [ ] DNS
- [ ] DHCP
- [x] ARP
- [ ] ICMP

Explanation: ARP maps an IP address to a MAC address on the local network.

### For an https:// URL, when does the TLS handshake happen?

- [ ] Before DNS
- [ ] After the HTTP response
- [x] After the TCP handshake (HTTP over TCP) and before the HTTP request
- [ ] Only after the page has loaded

Explanation: TLS runs on top of the TCP connection, and HTTP is sent inside the encrypted channel.

### What does a 301 response cause the browser to do?

- [ ] Show an error
- [x] Request the new address given in the response
- [ ] Close the connection forever
- [ ] Ignore the page

Explanation: A 301 says the page moved permanently, so the browser requests the new address, which repeats the story.

### Why does one page load make many requests?

- [ ] TCP splits every message into many requests
- [x] The HTML refers to more files such as CSS, JavaScript and images
- [ ] DNS sends a request for every word
- [ ] Browsers repeat each request three times

Explanation: After the HTML arrives, the browser fetches every file it refers to.

## Diagram

```json
{ "kind": "flow", "caption": "Typing a URL, in order: caches, DNS, TCP, TLS, HTTP, then rendering.", "steps": [{ "label": "Check browser and OS caches" }, { "label": "DNS lookup gives the IP" }, { "label": "TCP three-way handshake" }, { "label": "TLS handshake (https)" }, { "label": "HTTP request and response" }, { "label": "Fetch extra files and render" }] }
```
