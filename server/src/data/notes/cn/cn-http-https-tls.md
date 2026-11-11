---
id: cn-http-https-tls
title: HTTP, HTTPS and TLS
lastChecked: 2026-11-11
next: cn-dns-email
roadmapSteps: backend:os-networking-basics, frontend:internet-web-fundamentals
---

<!-- Published 11 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and two AI reviewers read it; no second person did. Written from docs/content/source-notes/cn-batch-b.md (HTTP section and the gap-fill part: MDN status pages, RFC 6585, RFC 5789). -->

## Overview

HTTP (HyperText Transfer Protocol) is the language browsers and servers speak. Backend and full-stack interviews ask about it every time: GET against POST, which status code means what, why HTTP is called stateless, how cookies and caching work, what HTTPS adds, and how HTTP/2 and HTTP/3 differ from HTTP/1.1. These are practical questions: you will meet them in every API you build.

After this section you can pick the right method and status code, explain statelessness and cookies, describe cache headers, explain what TLS gives you, and say in one line what changed in each HTTP version.

## Topic: Request, response and statelessness

**Definition:** A client (the browser or app) sends a request (method, path, headers, optional body) and the server sends a response (status code, headers, optional body). Headers are extra labelled details sent with a message. HTTP is stateless: the server does not remember earlier requests by itself. It normally runs over TCP (the reliable delivery layer), or over TLS (the protocol that encrypts and authenticates a connection) on top of TCP.

**Why:** Stateless servers are simple to scale (to add more machines as traffic grows): any server can answer any request.

**Example:** Login keeps working because the browser sends a cookie (or a token) with every request, and the server uses it to find the session.

**Failure:** Saying "HTTP keeps a session". It does not; sessions are built on top with cookies or tokens.

## Topic: Methods: safe and idempotent

**Definition:** A method is the action word of a request, such as GET or POST. A safe method does not change the server's state: GET, HEAD, OPTIONS. An idempotent method (one that gives the same result however many times you repeat it) includes PUT and DELETE, plus all the safe ones. POST is neither safe nor idempotent. PATCH (a partial update, RFC 5789) is neither safe nor idempotent by definition, though a particular patch can be made idempotent.

**Why:** Clients, proxies (middlemen that pass requests along) and browsers can retry idempotent requests safely after a failure. They must not blindly retry a non-idempotent request.

**Example:** Deleting user 5 twice leaves the same state (gone), so DELETE is idempotent. Posting "create order" twice creates two orders, so POST is not.

**Failure:** Using GET for an action that changes data. A browser, a crawler (a program that scans pages automatically) or a prefetch (loading a page early in the background) may repeat a GET.

## Topic: Status codes

**Definition:** The first digit gives the group: 1xx informational, 2xx success, 3xx redirection (go to another address), 4xx client error (the caller made a mistake), 5xx server error (the server failed). Key ones: 200 OK, 201 Created (a new resource was made, usually with a Location header that gives its address), 204 No Content, 301 Moved Permanently, 302 Found (temporary), 304 Not Modified, 307 and 308 (redirects that keep the same method), 400 Bad Request, 401 Unauthorized (no valid credentials), 403 Forbidden (understood, refused), 404 Not Found, 429 Too Many Requests, 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout.

**Why:** The code tells the client what to do next: retry, log in, fix the request, or give up.

**Example:** A reverse proxy (a server that sits in front of other servers and passes requests to them) returns 502 when the server behind it gives a bad answer and 504 when it does not answer in time. A 401 means "who are you?", 403 means the server refuses, and logging in again will not help.

**Failure:** Returning 200 with an error message inside the body. Clients and monitoring tools rely on the code.

## Topic: Cookies and sessions

**Definition:** A cookie is a small piece of data the browser stores for a site. A server sets a cookie with a Set-Cookie header; the browser sends it back in the Cookie header. Secure means the cookie is sent only over HTTPS. HttpOnly means JavaScript cannot read it, which limits damage from cross-site scripting (an attack where a bad script runs inside a good page). SameSite (Strict, Lax or None) controls whether it is sent on cross-site requests (requests that start from a different website); None needs Secure. A cookie with no expiry is a session cookie, which the browser normally drops when it closes (some browsers restore it).

**Why:** It is how a stateless protocol remembers a user.

**Example:** `Set-Cookie: sid=abc123; Secure; HttpOnly; SameSite=Lax`.

**Failure:** Storing a login token where any script can read it. HttpOnly cookies are safer than values in local storage (the browser's script-readable storage) against script injection (a bad script getting into the page).

## Topic: Caching

**Definition:** A cache is a stored copy of a response that is reused later. Cache-Control: max-age=N says the response is fresh (can be reused without asking) for N seconds. no-cache means a copy may be stored but must be checked with the server first. no-store means do not store it. The check uses a validator (a tag that tells whether the copy is still current): the server sends an ETag (a version label for the content), the client sends it back in If-None-Match, and the server answers 304 Not Modified with no body if nothing changed. Last-Modified with If-Modified-Since works the same way.

**Why:** Fewer bytes over the network and faster pages.

**Example:** A logo file gets max-age of a year; the HTML page uses no-cache with an ETag so it is always checked, but usually costs only a tiny 304.

**Failure:** Thinking no-cache means "never store". That is no-store.

## Topic: HTTPS and TLS

**Definition:** HTTPS is HTTP carried over TLS (Transport Layer Security, the standard that secures a connection). TLS gives encryption (nobody on the path can read the data), integrity (changes are noticed) and authentication (the server proves its identity with a certificate, a digital ID issued by a trusted authority). The handshake (the opening exchange before real data flows) agrees on a TLS version and a cipher suite (the chosen set of encryption methods) and creates a shared secret key. TLS 1.3 needs about one round trip (one message out and one back) and encrypts the handshake after the server's first reply. TLS 1.0 and 1.1 should not be used any more. TLS 1.3 is specified in RFC 8446; the RFC site marks that document as replaced by a newer one, RFC 9846. HTTPS uses port 443; plain HTTP uses port 80.

**Why:** Without it, anyone on the same Wi-Fi or any router on the path can read or change a request, including passwords.

**Example:** The browser sends ClientHello (its opening message), the server answers with its key share (its part of the secret-key exchange) and certificate, the client checks the certificate and sends Finished. After that, HTTP flows inside the encrypted channel.

**Failure:** Saying HTTPS hides which site you visit from everyone. The IP address (the server's network address) is still visible to the network, and the server name may be visible too.

## Topic: HTTP/1.1, HTTP/2 and HTTP/3

**Definition:** HTTP/2 puts many request and response streams (separate conversations) on one TCP connection and compresses headers, so pages load with fewer connections. But one lost TCP packet stalls every stream, because TCP does not know about streams (TCP head-of-line blocking: one stuck item holds up everything behind it). HTTP/3 runs over QUIC, a newer transport that runs on UDP (a lighter transport without TCP's built-in ordering or guaranteed delivery) and gives each stream its own loss handling and includes TLS 1.3. If UDP is blocked, clients fall back to (switch to) a TCP-based version.

**Why:** Pages need many files; opening many connections is slow and costly.

**Example:** A page with 80 small files on HTTP/1.1 needs several connections; on HTTP/2 it can use one.

HTTP/1.1 (the older version) sends one request at a time per connection, so browsers open several connections.

**Failure:** Saying HTTP/2 solves all head-of-line blocking. It fixes it at the HTTP level but not at the TCP level; HTTP/3 does that.

## Topic: WebSocket

**Definition:** A WebSocket starts as an HTTP GET with an Upgrade: websocket header (a request to switch protocols). The server answers 101 Switching Protocols, and the same connection becomes a two-way message channel. ws:// uses port 80 and wss:// (over TLS) uses port 443.

**Why:** Chat, live scores and trading screens need the server to push data without being asked.

**Example:** A chat app opens one WebSocket and both sides send messages whenever they like.

**Failure:** Using polling (asking the server again and again) every second when a WebSocket would be lighter. The opposite also fails: using WebSocket for a plain page load.

## Questions

### What is the difference between GET and POST?

GET reads data, is safe and idempotent (repeating it gives the same result), and its parameters are in the URL. POST sends data in the body to create or process something; it is not idempotent, so repeating it can repeat the effect.

### What is the difference between 401 and 403?

401 means the request has no valid credentials, so log in. 403 means the server knows who you are but does not allow this.

### Why is HTTP called stateless and how do we keep a login?

The server keeps no memory between requests by itself. We keep a login by sending a cookie or a token on every request, which the server uses to find the user.

### What does HTTPS add to HTTP?

TLS: encryption, integrity and server authentication through a certificate.

### How is HTTP/3 different from HTTP/2?

HTTP/2 runs on TCP, so one lost packet can stall all streams. HTTP/3 runs on QUIC over UDP, which handles loss per stream and includes TLS 1.3.

## Mistakes

- Saying PUT and POST are the same. PUT is idempotent (it replaces a resource, meaning a thing the server holds, at a known address); POST is not.
- Saying HTTPS makes a site safe. It protects the connection, not the site's own bugs.
- Using 404 for everything or 200 for errors.

## Quiz

### Which method is NOT idempotent?

- [ ] GET
- [ ] PUT
- [ ] DELETE
- [x] POST

Explanation: Repeating a POST can repeat its effect, such as creating two orders. GET, PUT and DELETE are idempotent: they give the same result when repeated.

### A reverse proxy waited for the backend and got no answer in time. Which code is expected?

- [ ] 400
- [ ] 404
- [ ] 502
- [x] 504

Explanation: 504 Gateway Timeout means the upstream (the server behind the proxy) did not answer in time. 502 means it gave an invalid answer.

### What does a server return when the client's ETag still matches?

- [ ] 200 with the full body
- [ ] 204 with a new ETag
- [x] 304 with no body
- [ ] 404

Explanation: 304 Not Modified tells the client to use its stored copy and sends no body.

### What does the HttpOnly cookie flag do?

- [ ] Sends the cookie only over HTTPS
- [x] Stops JavaScript from reading the cookie
- [ ] Stops the cookie from expiring
- [ ] Sends the cookie only to other sites

Explanation: HttpOnly hides the cookie from scripts, which limits damage from script injection. Secure is the flag for HTTPS only.

### Which protocol does HTTP/3 run on?

- [ ] TCP
- [x] QUIC over UDP
- [ ] ICMP
- [ ] ARP

Explanation: HTTP/3 uses QUIC, which is built on UDP.

## Diagram

```json
{ "kind": "flow", "caption": "A TLS 1.3 connection in outline: hello, server key and certificate, client Finished, then encrypted HTTP.", "steps": [{ "label": "Client: ClientHello with key share" }, { "label": "Server: ServerHello, certificate, encrypted parameters" }, { "label": "Client: checks certificate, sends Finished" }, { "label": "HTTP flows inside the encrypted channel" }] }
```
