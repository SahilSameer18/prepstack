Report 1 - PrepStack: Issues You Need To Fix
Audit of the skill branch (commit dcc34e1), prepared 15 Oct 2026. Scope: the existing PrepStack client and server only. The SkillBridge folder is covered in Reports 2 and 3.
1. How to read this report
Every issue has an ID, a severity, where it lives, what is wrong, the evidence, the impact and the fix. Severity means: High = fix before adding any new feature, Medium = fix soon, Low = fix when convenient.
Evidence labels: [Tested] means I executed code or the real app to prove it. [Read] means I found it by reading code and did not execute it. Where I am less than certain I say so.
What I did
• Read all server code: app, config, middlewares, models, controllers, routes, validators, services, utils and seed scripts.
• Read the client architecture layers: routing, axios, auth context, project context and hooks, services, Navbar, protected route, legal pages, and scanned the remaining UI files with searches.
• Ran: npm run lint and npm run build on the client (both pass), npm audit on both lockfiles, npm ci on the server, the real Express app with crafted Origin headers, zod and Mongoose behaviour tests, and a data check on the five DSA seed files.
What I could not verify
• Live behaviour against your real MongoDB, Gemini key and hosting (I do not know whether the server runs on Render or Vercel, or whether NODE_ENV is set in production).
• Whether the ~1,700 DSA links are still alive (no network checks), and the accuracy of the CS notes content.
• Visual design, accessibility and performance under load.
2. Summary
• High (3): CORS regex lets any prepstack-*.vercel.app site read logged-in users' data; stale access tokens after logout and account deletion; critical and high dependency advisories (including proxy-addr and client axios and react-router).
• Medium (8): zod v4 breaks validation messages and the Gemini schema; progress endpoints accept arbitrary slugs and links; in-memory rate limits; lockfile out of sync; username uniqueness inconsistency; refresh race; AI output not validated; no tests or CI.
• Low (11): listed in sections 4 to 7.
Fix first (in this order)
1. S1 CORS allowlist.
2. D1/D2 dependency updates and D3 lockfile.
3. B1/B2 zod migration.
4. S2 token revocation behaviour.
5. B3 progress endpoint hardening.
6. S3 Redis-backed rate limits.
3. Security issues
S1 - CORS allowlist accepts attacker-controlled origins (High)
Where: server/src/app.js, the cors({ origin }) callback.
What is wrong: besides the exact allowed origins, the callback accepts any origin matching a pattern of the form https://prepstack<anything>.vercel.app. Anyone can create a Vercel project whose name starts with prepstack and receive a matching domain.
Evidence [Tested]: I started the real app and sent requests with different Origin headers. https://prepstack-ss.vercel.app was allowed (reached auth, got 401). https://evil.com was blocked. https://prepstack-evil.vercel.app was allowed. The lookalike https://prepstack.vercel.app.evil.com was blocked.
Impact: the server sends Access-Control-Allow-Credentials: true and your cookies are SameSite=None. A logged-in user who visits prepstack-evil.vercel.app has their cookies attached to cross-origin requests that the attacker's JavaScript can read. The attacker can read the current user, stats, generated projects, the active-sessions list (device names and IP addresses) and, once the analyzer exists, resume reports. This gets worse the moment resume text is stored.
Fix:
• Remove the pattern. Allow only an exact list from the ALLOWED_ORIGINS environment variable.
• If you need preview deployments, use a pattern anchored to your own Vercel team slug (check what your real preview URLs look like first), not just the project prefix.
• Add a small test that asserts the evil and lookalike origins are rejected.
S2 - Access tokens stay valid after logout, revoke and account deletion (High)
Where: server/src/middlewares/auth.middleware.js.
What is wrong: the middleware only runs jwt.verify. It never checks that the user still exists or that the session was not revoked. Access tokens live 15 minutes.
Impact [Read]:
• After logout-all, a revoked session or a password change, the old access token keeps working for up to 15 minutes. Only refresh tokens are revoked.
• After account deletion, a still-valid token can create new rows (for example GET /api/sheets/:slug/progress upserts, POST /api/project/generate inserts). That leaves orphan personal data behind after a GDPR erasure. It will do the same with resume reports.
Fix (pick one):
• Add a tokenVersion (or sessionId) claim, verify it against a short-lived cache, and bump it on logout-all, password change and deletion.
• Or accept the 15-minute window but at least check that the user exists on routes that create data, and document the behaviour in the README.
S3 - Rate limiting is in-memory and per-process (Medium)
Where: server/src/middlewares/rateLimit.middleware.js; redis and rate-limit-redis are in package.json but not used anywhere in server/src.
Impact [Read]: counters reset on every restart or cold start and are not shared across instances. The AI limiter (4 per hour per user) is your only cost guard on a paid API, and it is trivially reset. Login limits are per IP only; there is no per-account throttle.
Fix: use RedisStore with a fail-open wrapper (your own REDIS_INTEGRATION_ANALYSIS.md already designs this), add a per-account failed-login counter, and add a daily per-user cap for AI endpoints.
S4 - Username uniqueness is inconsistent (Medium)
Where: auth.controller.js (register) versus user.controller.js (updateProfile) and auth.model.js.
What is wrong: registration checks findOne({ username }) (case-sensitive) and the unique index is case-sensitive, so Admin and admin can both register. updateProfile checks case-insensitively, so the two paths disagree.
Impact [Read]: impersonation of staff-looking or existing names.
Fix: add a usernameLower field with a unique index (or a collation index with strength 2) and use it everywhere.
S5 - Refresh-token handling has race conditions (Medium)
Where: auth.controller.js refreshAccessToken and storeSessionToken.
What is wrong [Read, not reproduced]: refresh tokens are single-use. Two browser tabs that refresh at the same moment will present the same token; the loser gets 403 and the client logs the user out. The axios interceptor queues requests inside one tab only. Concurrent user.save() calls that rewrite the refreshTokens array can also raise Mongoose version errors. There is no reuse detection (a replayed old token is rejected but does not revoke the session family).
Fix: use atomic updates ($pull then $push with findOneAndUpdate) instead of load-modify-save, add a short grace window for the previous token, and revoke the family on detected reuse.
S6 - Low-severity security items
• Spoofable session IP: utils/deviceParser.js trusts the first value of the client-supplied X-Forwarded-For header. A user can put any IP in their own sessions list. Use req.ip (you already set trust proxy).
• Avatar URL is not validated: updateProfile accepts any string up to 500 chars. Require an https URL.
• Login timing: an unknown email returns before any bcrypt work, so response time reveals which emails exist. Register also returns an explicit 409 for existing emails. Decide whether that trade-off is acceptable.
• No security headers: add helmet (cheap).
• Cookies always Secure and SameSite=None: needed for a cross-site frontend, but if you move the API to a subdomain of the same site you can use Lax and drop a whole class of risk.
4. Correctness bugs
B1 - zod v4 silently ignores required_error (Medium)
Where: every file in server/src/validators/.
Evidence [Tested]: with the installed zod 4.x, z.string({ required_error: 'Username is required' }) on a missing field returns the message Invalid input: expected string, received undefined. The custom message is ignored. Users see technical text instead of your wording.
Fix: replace with the v4 form z.string({ error: 'Username is required' }) (or message) across the validators.
B2 - The Gemini JSON schema is empty, and AI output is not validated (Medium)
Where: server/src/services/ai.service.js, plus project.controller.js.
Evidence [Tested]: with zod 4.x and zod-to-json-schema 3.25, zodToJsonSchema(projectSchema) returns only { $schema: ... } with no properties. So responseJsonSchema tells Gemini nothing and structured output is not actually enforced; you rely only on the prompt and responseMimeType. Native z.toJSONSchema(projectSchema) produces the correct schema.
Also: the response goes straight from JSON.parse into projectModel.create. If Gemini returns features as a string, Mongoose throws a cast error and the user sees a generic 500.
Fix: use z.toJSONSchema (remove the zod-to-json-schema dependency; if Gemini rejects the $schema key, strip it), then projectSchema.safeParse the response and map failures to a clean 502.
B3 - Progress endpoints accept anything (Medium)
Where: sheets.controller.js, sheets.routes.js.
• GET /api/sheets/:slug/progress upserts a document for any slug, including slugs that do not exist. Every authenticated user can create unlimited junk documents. A GET should not write.
• POST /api/sheets/:slug/progress accepts any valid URL as problemLink, not only links that belong to that sheet, and solvedProblems has no size cap.
• The toggle does findOne and then a separate update, so a double click can race (add and remove in the wrong order).
Fix: validate the slug against the seeded sheets (a cached set is fine), verify the link belongs to that sheet, return an empty default on GET instead of upserting, and replace the toggle with two explicit atomic operations (add and remove) or one pipeline update.
B4 - Two stats endpoints disagree (Low)
getUserStats counts every entry in solvedProblems, including links that are no longer in a sheet or never were (see B3). getDashboardSummary filters to links that exist in the sheet. Users can see different totals on different pages. Make getUserStats reuse the dashboard logic.
B5 - Model constraints are loose (Low)
• Project.user is not required, so projects can exist without an owner.
• Project.difficulty is free text although the AI output is constrained to a few values.
• User.password has minLength: 8 but stores a bcrypt hash, so the rule means nothing; password strength is enforced only in zod.
• refreshTokens expired entries are only pruned on write; consider a cleanup or TTL approach.
• Controllers still reference a legacy topics.questions field that the schema does not define.
B6 - Blocked CORS origins return 500 (Low)
Evidence [Tested]: a request from https://evil.com is correctly stopped before any handler runs, but it surfaces as 500 Something went wrong and logs UNEXPECTED ERROR. Any scanner will flood your error logs. Pass callback(null, false) or throw an AppError(403).
B7 - Startup and process handling (Low)
Where: server/server.js.
• app.listen starts before MongoDB is connected (Mongoose buffers, but readiness is unclear).
• process.env.PORT has no fallback; if unset the server listens on a random port.
• Custom DNS servers are applied whenever NODE_ENV !== 'production', so a host that forgets to set NODE_ENV gets the override in production.
• No unhandledRejection or graceful shutdown handlers.
B8 - Client network behaviour (Low)
client/src/api/axios.js has no request timeout, so a hung AI call leaves the UI loading forever. The refresh queue handles concurrency inside one tab but not across tabs (see S5). Quiz and Aptitude are placeholders (see P1).
5. Dependencies and build health
D1 - Server advisories (High)
Evidence [Tested, npm audit on the committed lockfile]: 10 vulnerabilities (1 critical, 5 high, 3 moderate, 1 low). The critical one is proxy-addr (IP spoofing through IPv4-mapped IPv6 trust subnets). That matters because you set trust proxy and rate-limit by IP. The highs are brace-expansion, braces, chokidar, ip-address and nodemon. A fix is available for all of them.
D2 - Client advisories (High)
Evidence [Tested]: 11 vulnerabilities (8 high, 3 moderate). Direct dependencies affected: axios (prototype pollution) and react-router (open redirect). Transitive: brace-expansion, browserslist, js-yaml, nanoid, postcss, source-map-js. Fixes are available.
D3 - Server lockfile is out of sync (Medium)
Evidence [Tested]: npm ci fails with Missing: gcp-metadata@7.0.1 from lock file. This can depend on the npm version, so confirm with your own. If your host or CI uses npm ci, the build will fail. Regenerate with npm install and commit.
D4 - Dependency hygiene (Low)
• nodemon is in dependencies; move it to devDependencies.
• zod-to-json-schema becomes unnecessary after B2.
• redis and rate-limit-redis are installed but unused until S3 is done.
The client baseline is healthy: lint is clean and the build succeeds.
6. Operations and repository
• O1 - No automated tests (Medium). The server test script literally prints an error and exits; there are no client tests. Before the merge, add at least: auth flow, ownership checks, validators, and the CORS test from S1. Suggested stack: Vitest or Jest, supertest, mongodb-memory-server.
• O2 - No CI (Medium). There is no .github workflow. Run lint, build and tests on every push.
• O3 - .env.example is incomplete (Low). The code reads ALLOWED_ORIGINS, CLIENT_URL, NODE_ENV and ENABLE_CUSTOM_DNS, none of which are in server/.env.example.
• O4 - README claims do not match the code (Low). The README says tiered sliding-window limits with skipFailedRequests on auth, refresh and link limiters. In code only the AI limiter sets skipFailedRequests, and the in-memory store is fixed-window.
• O5 - Repository hygiene (Low). There is no root .gitignore. The root contains track.md and REDIS_INTEGRATION_ANALYSIS.md. The nested skillbridge-integrate/ has its own lockfiles and a test-db.js that creates a user with a hard-coded password. Remove it from main after porting.
• O6 - No health endpoint or request logging (Low). Add /health, request IDs and structured logs.
7. Data quality
Q1 - Sheet totals do not match their names (Low)
Evidence [Tested, parsing the seed files]:
• Love Babbar: 450 entries but only 423 unique links (27 duplicates).
• NeetCode 150: 151 entries, 149 unique.
• Striver A2Z: 446 entries, 444 unique.
• Striver SDE: 193 entries, 191 unique.
• Blind 75: 75 of 75 unique (clean).
Progress totals are computed on unique links, so users see 423, not 450. Either deduplicate and rename honestly, or keep the duplicates and show the real count.
Q2 - Link health (Low, unverified)
254 Love Babbar links use the older practice.geeksforgeeks.org host and one link is plain http://. I did not check whether they still resolve. Run a link-checker script before you advertise the sheets.
8. Product and legal
• P1 - Dead ends in the navigation (Low). Quiz and Aptitude render a Coming Soon page but are listed in the menu with descriptions like 'Test your knowledge'.
• P2 - Privacy Policy and delete-account text are out of date (Medium once the analyzer ships). The policy mentions Gemini only for project ideas, and the delete dialog lists account, DSA history and generated projects. Resume upload, storage and third-party processing must be added before launch (details in Report 3).
• P3 - Cascade deletion has no registry (Low). deleteAccount manually lists three collections. Every new collection must be remembered. Centralise it so a new model cannot be forgotten.
9. What is already good (do not break it)
• No secrets in the working tree or git history (the only AIza hit is a README placeholder).
• Hashed multi-device refresh tokens with single-use rotation, and bcrypt cost 12.
• Consistent { success, message, data } response contract and a clean central error handler.
• Every project query is owner-scoped (user: userId), and ID format is validated before queries.
• Account deletion uses a transaction with a fallback for standalone MongoDB.
• Classic CSRF is effectively blocked because the CORS callback rejects disallowed origins before handlers run (this makes S1 the one hole to close).
• No dangerouslySetInnerHTML, no console.log leftovers, external links use rel=noopener.