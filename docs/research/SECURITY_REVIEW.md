# Security review of login, sessions and account actions (19 Nov 2026)

**What this is:** one reviewer's reading of the auth code plus attack-style tests and a few read-only probes of the live API. It is **not a penetration test** and not an audit. It found no way to take over an account without already holding a stolen session or the person's email inbox, and it found one real bug (fixed) and several things worth deciding.

## 1. What was reviewed
- Read in full: `modules/auth/` (controller, routes, validators, tokens, middleware, model), `modules/user/user.controller.js` (change password, delete account), `shared/http/` (app wiring in `app.js`, error handler, rate limiters), `shared/infra/sessionCache.js`.
- New attack-style tests: `server/test/auth-attacks.test.js` (8 tests, below).
- Read-only probes of the live API (`prepstack-doaw.onrender.com`), no account touched: a foreign and a `null` Origin on state-changing routes, an `alg: none` token, an operator object in the login body, malformed JSON, and a CORS preflight from a foreign origin.
- `npm audit --omit=dev` on the server: **0 vulnerabilities**.

## 2. What holds up (with the evidence)
| Area | Result | Evidence |
|---|---|---|
| Passwords | bcrypt cost 12, 8 to 72 characters with upper, lower, number | `auth.validators.js`, `auth.controller.js` |
| Refresh tokens | stored only as SHA-256 hashes, single use, rotated by one atomic compare-and-swap | code; **new test:** 20 refreshes at the same moment give no 500, exactly one rotation, the session survives |
| Stolen refresh token | replay after the 10 s grace window deletes the whole session | `auth.test.js` (existing) |
| Revoking a session | takes effect at once (access token checked against the live session) | `auth.test.js`, `session-cache.test.js` |
| Cross-user session use | a token for user A with user B's session id is refused; B cannot revoke or see A's session by guessing an id | **new tests** |
| Cross-site requests (CSRF) | cookies are `SameSite=None`, so the real protection is the exact-match Origin allowlist: **any request with a foreign or `null` Origin is refused with 403 before a handler runs** | **new test** on logout, logout-all, refresh, revoke, change password and delete account (and nothing changed afterwards); live probe returned 403 for both Origins and for a foreign preflight |
| Forged tokens | wrong secret, tampered, expired, and `alg: none` are refused | `auth.test.js`; live probe `alg: none` returned 403 |
| Operator injection (NoSQL) | objects instead of strings are refused by the validators on login, forgot password, reset password and Google sign-in; no session starts | **new test**; live probe |
| Password reset | 32 random bytes, only the hash is stored, works once for 1 hour, signs out every device, lifts the login lock; one token used by 6 requests at once works exactly once; a token cannot reset another account | `password-reset.test.js`, **new tests** |
| Login lock | 10 wrong passwords in 15 minutes lock the account even from many addresses; the counter is atomic | `login-lock.test.js` (existing) |
| Error output | production answers with a generic message, no stack | live probe with malformed JSON |
| Reset link leakage | the client sends `Referrer-Policy: strict-origin-when-cross-origin`, so the token in the URL is not sent to other sites | `client/vercel.json` |
| Outbound requests | no server-side fetch of a user-supplied URL (no SSRF surface today) | search of `src/` |
| Secrets | the server refuses to start without both token secrets and warns when one is under 32 characters | `server.js` |

## 3. Findings
Severity is my judgment. "Fixed" means changed and tested in this review; the rest are for the owner to decide.

| # | Severity | Finding | What an attacker or user sees | Recommendation | Status |
|---|---|---|---|---|---|
| 1 | Low | **A malformed or oversize JSON body answered 500** and logged an "unexpected error" instead of 400 or 413 | Any client can fill the log with fake errors; honest clients get a misleading error | Map the body-parser errors (done in `error.middleware.js`) | **Fixed**, test `auth-attacks.test.js` (a mutation that removes the fix makes it fail) |
| 2 | **Medium (availability)** | **Hashing is expensive on the free host.** Cost-12 bcrypt on about 0.1 of a CPU: the live log showed a login taking **1.76 s**. The per-address limit is 10 attempts per 15 minutes, but many addresses together can exhaust the CPU, and a locked account still pays one hash per attempt (to keep timing equal) | A modest flood of login or register requests makes every request slow | Measure login latency under load; consider Argon2id or a lower cost per OWASP guidance, and a small cap on simultaneous hashing; keep the limits | **Planned** (S4 in [docs/plans/SECURITY_FIXES_PLAN.md](../plans/SECURITY_FIXES_PLAN.md)) |
| 3 | Low to Medium | **No email verification at sign-up.** Anyone can register someone else's address first (squatting, "pre-hijacking") | The real owner is told "account exists"; Google sign-in refuses to merge (409). Mitigated: a password reset signs out every session, and the owner can reset | Verify the address before the account is usable (Brevo SMTP already exists), or at least before Google can be linked | **Planned** (S2 in [docs/plans/SECURITY_FIXES_PLAN.md](../plans/SECURITY_FIXES_PLAN.md)) |
| 4 | Low to Medium | **A stolen session can set a password on a Google-only account**, and can delete a Google-only account by typing the account email (which the app shows) | The attacker keeps access after the victim signs out everywhere; or deletes the account | Require a fresh Google ID token to set a password or delete a Google-only account | **Planned** (S1 in [docs/plans/SECURITY_FIXES_PLAN.md](../plans/SECURITY_FIXES_PLAN.md)) |
| 5 | Low | **Account enumeration:** register answers 409 for a taken email or username; a locked account answers 429 | Someone can learn which emails have accounts. Forgot-password is uniform and the lock is a documented trade-off | Accept (rate-limited), or make register uniform too | Open (accepted trade-off today) |
| 6 | Low | The refresh cookie is sent on every API path (no `Path`) | A little extra exposure in transit and in proxies | Set `Path=/api/auth` (cookie clearing must use the same path) | Open |
| 7 | Info | The development setting (`NODE_ENV=development`, the default in `.env.example`) returns full stack traces. Production (unset or any other value) does not | Only if someone deploys with `development` | Keep the example, add a warning line | **Planned** (S3 in [docs/plans/SECURITY_FIXES_PLAN.md](../plans/SECURITY_FIXES_PLAN.md)) |
| 8 | Info | A cached session can stay valid on another server copy for up to 5 s (memory) or 30 s (Redis down during a revoke) | None with one server | Documented in the README limitations | Accepted |
| 9 | Info | Google sign-in uses Google's email as sent; password accounts store it lower-case | A rare duplicate-account mismatch | Lower-case it on Google sign-in | **Planned** (S3 in [docs/plans/SECURITY_FIXES_PLAN.md](../plans/SECURITY_FIXES_PLAN.md)) |

## 4. Not reviewed (so do not read this as clearance)
- The Google ID-token check itself (it uses Google's library) and Google client configuration.
- The resume upload path: parsing untrusted PDFs with a third-party reader, and prompt-injection of the AI (the analyzer has its own tests, not reviewed here).
- Every other route's ownership checks (plan, notes, reports have tests with an "outsider", but they were not re-audited), and GET routes with side effects (none known, none searched for).
- Hosting configuration: MongoDB Atlas network access and user rights, Render, Vercel and Aiven settings, secret rotation, backups.
- Fuzzing, load-based abuse, timing measurements, and the dependency tree beyond `npm audit` on the server (the client was not audited).
- The 5 second and 30 second windows of the session cache under a real multi-copy deployment.

## 5. Suggested order
1. Decide findings 3 and 4 (the two that let a stolen session or a squatted address matter more than it should).
2. Measure finding 2 on the live host before changing the hash.
3. Findings 6, 7 and 9 are small changes that can ship together.
4. Ask one outside reviewer who knows web security to read this file and the auth module, or run a scoped test, before the site has many users.
