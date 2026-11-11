---
id: cn-dns-email
title: DNS, Email and File Transfer
lastChecked: 2026-11-11
next: cn-devices-routing-security
roadmapSteps: backend:os-networking-basics, frontend:internet-web-fundamentals
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Written from docs/content/source-notes/cn-batch-b.md (DNS and email). The step-by-step DNS walk-through rests on RFC 1034 roles plus general knowledge (no readable page gave it); see SOURCES.md. -->

## Overview

Computers find each other by number, but people use names. DNS is the system that turns a name like example.com into an IP address, and it is marked "important" in most interview lists. Email protocols (SMTP, POP3, IMAP) and file transfer (FTP, SSH) come right after it, because they are the classic application protocols and interviewers use them to check ports and the difference between sending and reading mail.

After this section you can walk through a DNS lookup, name the common record types, explain caching and TTL, and say which email protocol sends mail and which one reads it.

## Topic: What DNS is

**Definition:** DNS is a distributed, hierarchical naming system. The names form a tree. A name is written as labels from the leaf up to the root, such as www.example.com. Each label can be up to 63 bytes and a whole name up to 255 bytes. The data is split into zones, and a name server is the authority for the zones it holds.

**Why:** Nobody remembers IP addresses, and the address of a site can change without the name changing.

**Example:** The name www.example.com is read from the right: the root, then com, then example, then www. Name servers hold the records, and resolvers ask them for programs.

**Failure:** Thinking DNS is one big server. It is spread over a huge number of servers, and a failure of one does not stop it.

## Topic: How a lookup works

**Definition:** Your program asks a resolver (usually your ISP's or a public one). If the resolver has the answer cached, it replies at once. If not, it asks a root server, which points to the servers for the top-level domain (.com), which point to the authoritative server for example.com, which gives the final answer. The resolver caches it and replies. When a server does the chasing for you, the query is recursive. When it only answers "ask this other server", it is iterative.

**Why:** No server needs to know everything, and the tree spreads the load.

**Example:** For www.example.com: browser cache, then the operating system cache, then the resolver, then root → .com → example.com's server. Each step may be skipped if a cache has the answer.

**Failure:** Saying the root server knows the IP of every site. It only knows where the top-level domain servers are.

## Topic: Record types

**Definition:** A (type 1): name to IPv4 address. NS (2): which servers are authoritative for a zone. CNAME (5): this name is an alias for another name. PTR (12): address back to name (reverse lookup). MX (15): the mail servers for a domain, each with a preference number (the lowest number is tried first). TXT (16): free text, used for things like domain checks. (AAAA, for IPv6, is the same idea as A.)

**Why:** One name can serve the website, the mail and other services, each by its own record.

**Example:** A CNAME www → example.com means a lookup of www is restarted at example.com. MX records: `10 mail1.example.com` is tried before `20 mail2.example.com`.

**Failure:** A name that has a CNAME cannot have other records, and an MX record should name a host that has an A record, not a CNAME.

## Topic: Caching and TTL

**Definition:** Every record carries a TTL: the number of seconds it may be cached. 0 means do not cache. After the TTL, the cache must ask again.

**Why:** Caching removes most lookups. The trade-off is that a change takes up to the TTL to spread.

**Example:** Before moving a site to a new server, lower its TTL a day earlier, so the change spreads fast.

**Failure:** Expecting a DNS change to be instant everywhere. Old answers live in caches until their TTL ends.

## Topic: DNS transport

**Definition:** DNS normally uses UDP port 53 because queries and answers are small; messages over UDP are limited to 512 bytes in the original standard. Larger answers and zone transfers between servers use TCP.

**Why:** UDP avoids the handshake, so a lookup costs one round trip.

**Example:** If an answer is too large, the server marks it truncated and the client repeats the query over TCP.

**Failure:** Saying DNS "only uses UDP". The first design used UDP only, but TCP is used for large answers and zone transfers.

## Topic: Email: SMTP, POP3 and IMAP

**Definition:** SMTP sends mail. Servers hand mail to each other over SMTP on port 25 (relay); a user's mail program submits mail on port 587 and normally must log in. POP3 (port 110) lets a client fetch mail from the server, usually downloading and then deleting it. IMAP (port 143, or 993 with TLS from the start) keeps the mail and folders on the server so many devices see the same mailbox.

**Why:** Sending and reading are different jobs and use different protocols.

**Example:** You send from your phone by submission to the server (587). That server uses the MX record of the recipient's domain to find the next server and relays it over SMTP (25). The recipient reads it with IMAP.

**Failure:** Saying POP3 or IMAP sends mail. They only read it; SMTP sends.

## Topic: FTP and SSH

**Definition:** FTP moves files using two connections: a control connection (port 21) for commands and a separate data connection (port 20 in active mode; passive mode uses another port) for the files. SSH (port 22) gives secure remote login and can carry other traffic over an encrypted channel.

**Why:** FTP sends passwords in plain text. SSH encrypts everything, so it replaced Telnet and plain FTP for admin work.

**Example:** `ssh user@server` opens a shell; file copy over SSH is the safe replacement for FTP.

**Failure:** Saying FTP uses port 27 (a printed mistake in some notes). The control port is 21.

## Questions

### What happens when you type a domain name? Explain DNS resolution.

The browser and operating system check their caches. If nothing is cached, the resolver asks a root server, then the top-level domain server, then the domain's authoritative server, gets the IP address, caches it for the TTL and returns it.

### What is the difference between recursive and iterative queries?

In a recursive query the server finds the final answer for the client. In an iterative query the server returns the best answer it has, often a referral to another server, and the client continues.

### What is a CNAME record and how is it different from an A record?

An A record maps a name to an IP address. A CNAME maps a name to another name, so the lookup restarts at the target name.

### SMTP vs POP3 vs IMAP?

SMTP sends mail between servers and from users to servers. POP3 downloads mail from the server, usually removing it there. IMAP keeps the mail on the server and syncs it across devices.

## Mistakes

- Saying DNS uses only UDP or only TCP. It uses both.
- Saying the DNS change is instant. TTL caches delay it.
- Mixing the ports: SMTP 25, DNS 53, POP3 110, IMAP 143.

## Quiz

### Which record type gives the mail servers of a domain?

- [ ] A
- [ ] CNAME
- [x] MX
- [ ] PTR

Explanation: MX records name the mail servers, each with a preference number. The lowest number is tried first.

### Which port does DNS use for ordinary queries?

- [ ] 25
- [x] 53
- [ ] 80
- [ ] 443

Explanation: DNS queries go to port 53, normally over UDP.

### What does TTL mean in a DNS record?

- [ ] The size of the record
- [x] How many seconds the record may be cached
- [ ] The number of servers that hold the record
- [ ] The number of hops to the server

Explanation: TTL limits cache time. A TTL of 0 means the record must not be cached.

### Which protocol keeps mail on the server so several devices see the same mailbox?

- [ ] SMTP
- [ ] POP3
- [x] IMAP
- [ ] FTP

Explanation: IMAP leaves messages and folders on the server. POP3 usually downloads and removes them, and SMTP only sends.

### Which record is an alias for another name?

- [ ] NS
- [x] CNAME
- [ ] TXT
- [ ] MX

Explanation: A CNAME says the name is an alias for another name, and the lookup restarts there.

## Diagram

```json
{ "kind": "flow", "caption": "A DNS lookup when nothing is cached: resolver asks root, then the top-level domain server, then the authoritative server.", "steps": [{ "label": "Browser asks the resolver" }, { "label": "Resolver asks a root server" }, { "label": "Root points to the .com servers" }, { "label": ".com points to example.com's server" }, { "label": "Authoritative server returns the IP; resolver caches it" }] }
```
