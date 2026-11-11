# Roadmap source notes: Backend Development (11 Nov 2026)

Facts are restated in our own words. "summary" = the fetch tool's summary of a part the agent did not see verbatim. All pages below loaded (HTTP 200) on 11 Nov 2026; `npm run check:links` found no broken backend link the same day.
Status: read by us; not checked by an outside reader. Time ranges and checkpoints are our estimates and opinions (logged as such in `SOURCES.md`), not facts from the sources.

## Steps covered
os-networking-basics, nodejs-fundamentals, expressjs-routing, database-design, authentication-security, testing-debugging, docker-containers, deployment-cloud (ids unchanged; the 8 steps keep their order and titles).

## os-networking-basics
- Pages: MDN "How the web works" (current Learn-web-development URL) and MDN "Overview of HTTP". Topics found: clients and servers; the connection, TCP/IP, DNS, HTTP; what happens when you type a URL; packets; HTTP basics and status codes (301, 400, 403, 404, 503); parts of a URL. HTTP is stateless; HTTP/2 multiplexing; caching, sessions, auth are controllable features. No time stated.
- "Processes and threads" and "ports and sockets" come from our own OS and CN notes (cn-transport-layer, os-processes-threads, which is still the old text).
- Removed resources: CS50x (it is an 11-week general computer science course, not about networking), a YouTube playlist and a crash-course video (replaced by MDN pages).
- Time estimate: 10 to 15 hours = our estimate (two reading pages plus practice with our CN notes).

## nodejs-fundamentals
- Pages: Node.js Learn "Introduction to Node.js" (stated "3 min read"): runtime on V8, single process, non-blocking I/O, no thread management, ES modules vs CommonJS. "The Node.js Event Loop" ("14 min read"): phases (timers, pending callbacks, poll, check, close callbacks), setImmediate vs setTimeout, process.nextTick and its starvation risk. API docs, intro only: fs (sync, callback, promise forms; sync forms block the event loop), stream (readable, writable, duplex, transform), buffer (fixed-length bytes, Uint8Array subclass, encodings utf8 default), modules (CommonJS wrapper, caching, node: prefix). Intro text of fs, stream, buffer, modules came from the summary.
- Removed: Udemy course, a YouTube playlist, `nodejs.org/en/docs/` (replaced by the Learn pages).
- Time: 20 to 30 hours = our estimate.

## expressjs-routing
- Pages (Express 5 docs, verbatim): hello world; routing (route methods, paths, params, handlers, express.Router); using middleware (application-level, router-level, error-handling, built-in json/urlencoded/static, third-party); error handling (sync and async, default handler, four-argument handlers, define last); writing middleware (Express 5: a middleware that returns a rejected promise calls next(err) automatically).
- Removed: YouTube video and restfulapi.net (replaced by official docs). REST/status-code practice link points to our CN HTTP section.
- Time: 20 to 30 hours = our estimate.

## database-design
- Pages (MongoDB manual, loaded): CRUD (insert, find, update, delete, bulk write; writes are atomic per document); data modeling (flexible model, data accessed together stored together, one-to-one/many, embedding vs referencing); indexes (avoid collection scans, write cost, B-tree, default unique _id index, single-field, compound); aggregation (pipeline: $match, $unwind, $group, $sort, $limit). Mongoose "Schemas" guide (schemas, models, indexes, virtuals, options). learn.mongodb.com root returned no body; `learn.mongodb.com/skills` says skill badges are free (60 to 90 min each): not used as a resource because the root page could not be read.
- SQL basics and keys come from our DBMS notes (dbms-sql, dbms-indexing-file-organization, dbms-keys-constraints, dbms-transactions).
- Removed: a YouTube comparison video.
- Time: 30 to 40 hours = our estimate.

## authentication-security
- OWASP Authentication Cheat Sheet (CC BY-SA 4.0): password strength and storage, recovery, TLS only, generic error messages, throttling/lockout, MFA, OAuth 2.0/OIDC/SAML/FIDO mentioned as password-less protocols. OWASP Password Storage: Argon2id (min 19 MiB memory, t=2, p=1), scrypt, bcrypt (work factor 10 or more, 72-byte limit, legacy only), PBKDF2 600,000 iterations where FIPS is required; salting and peppering. OWASP JSON Web Token cheat sheet: threats (alg none, key confusion), revocation; signed JWTs are not confidential. RFC 7519: a JWT is a compact URL-safe claims format, signed or encrypted. oauth.net/2: OAuth 2.0 is the standard authorization protocol; grant types (authorization code, PKCE, client credentials, device code, refresh token). MDN CORS: simple, preflighted, credentialed requests. Helmet: one call sets 13 headers (summary). Express security best practices: TLS, Helmet, cookie options, brute-force protection, npm audit. express-rate-limit README (MIT): basic rate-limiting middleware.
- Cookie flags (Secure, HttpOnly, SameSite) come from the MDN cookies page read for the CN notes (see cn-batch-b.md).
- Removed: jwt.io introduction, Passport.js docs, RisingStack security checklist (not re-read; replaced).
- Statement "CORS is a browser rule, not a server defence": MDN CORS describes it as a browser mechanism using headers; the phrase "not a server defence" is our summary (general knowledge, flagged in SOURCES.md).
- Time: 30 to 40 hours = our estimate.

## testing-debugging
- Node test runner docs (stable): subtests, describe/it, skip/todo/only, filtering, watch mode, coverage, mocking timers and dates, snapshots, reporters. Jest 30.5 getting started (copyright OpenJS, not open licence). Postman Learning Center: sending requests, test scripts, collections. Node.js debugging guide ("6 min read"): --inspect (default 127.0.0.1:9229), --inspect-brk, DevTools and VS Code clients, security note about exposing the inspector. supertest README (MIT): HTTP assertions on superagent, `.expect` for status, body, header.
- Removed: the old Node debugging URL (404, replaced by the Learn page), Jest docs and Postman links (kept in topics, not as resources, to stay at 3).
- Time: 15 to 25 hours = our estimate.

## docker-containers
- Docker docs: "What is Docker?" (open platform for building, shipping, running apps in isolated containers; daemon, client, registries, images and containers), Dockerfile reference (instructions FROM, RUN, CMD, COPY, ENV, EXPOSE, WORKDIR, HEALTHCHECK and others), Compose (define and run multi-container apps from one YAML file), "What is a container?" (isolated, portable; share the host kernel unlike VMs; docker run, ps, stop). The Get started hub page returned no body; the overview page was used instead.
- Removed: two YouTube videos.
- Time: 15 to 25 hours = our estimate.

## deployment-cloud
- GitHub Actions "Understanding GitHub Actions": CI/CD platform; workflows, events, jobs, actions, runners. Railway Quick Start: deploy from GitHub (New Project, GitHub repo, Deploy Now), CLI (`railway init`, `railway up`), Docker image, template; private registries need the Pro plan. Render quick start (read, not linked): free web services spin down after 15 minutes idle, free Postgres expires after 30 days; no payment needed for the free tier. The Twelve-Factor App, "Config": keep config in environment variables, strictly apart from code; litmus test: could the codebase be open-sourced without leaking credentials.
- AWS Free Tier page now describes credits (up to $200, account closes after 6 months or when credits run out) and 30+ always-free services; the old step linked to the Free Tier page and Heroku is no longer a free option (not re-checked); the step has an AWS topic and the AWS Free Tier page as a resource again (added at the owner's request, 11 Nov 2026), worded as credits that run out; the Twelve-Factor page moved from the resources to the source notes only. Heroku is out of the topics.
- Load balancer practice link points to our CN system-design section.
- Removed: a YouTube video, `docs.railway.app` (now redirects to `docs.railway.com`).
- Time: 15 to 25 hours = our estimate.

## Not read or unverified
CS50 licence text; Node test-runner page tail; Docker workshop parts; Helmet licence; footers of GitHub Actions, Postman, Docker, Railway, AWS, Render pages; Passport.js, jwt.io and RisingStack pages (dropped, not re-read); whether Heroku still has a free tier.

## Terms of use
MDN: Creative Commons (version not named). OWASP: CC BY-SA 4.0. RFCs: IETF Trust. Node.js, Express, Jest, MongoDB, Docker, Railway, Render, GitHub pages: copyright notices, no open licence stated; we restate and link, we do not copy. express-rate-limit and supertest: MIT.
