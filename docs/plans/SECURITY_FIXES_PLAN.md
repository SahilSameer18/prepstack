# Security follow-ups: plan (19 Nov 2026, decided to do later, nothing built)

Source: the findings in [`docs/research/SECURITY_REVIEW.md`](../research/SECURITY_REVIEW.md). The owner chose on 19 Nov 2026 to **document these now and build them later**. This file is written so an agent that has not seen the earlier conversation can do the work. Nothing here is started.

## 0. Rules for the agent (from `CLAUDE.md`)
1. **Never stage, commit or push.** Give the owner `git add` and a one-line `git commit -m "..."` after each item. No `Co-Authored-By` or other trailer.
2. **Never read, edit or print `server/.env`.** Ports 3000 and 5173 are never used for throwaway checks (use 3100 and 5175).
3. Every change comes with tests and a **mutation check** (break the rule, see a test fail, restore it). Run the full server suite (`cd server && npm test`, baseline 1128 tests on 19 Nov 2026) and, for client changes, `cd client && npm run build && npm run lint` and the Vitest suite.
4. **README:** update it only in neutral, positive wording (the owner does not want weaknesses listed there); keep the candid record in `docs/research/SECURITY_REVIEW.md` (change a finding's status there when it is fixed), `TESTING.md` and `PROJECT_STATUS.md`.
5. Keep each file's line endings (many use CRLF). No unrelated refactoring. Say what was not checked.

## 1. Order of work
| Item | Finding | Effort | Why this order |
|---|---|---|---|
| **S3** small fixes | 7, 9 | under 1 hour | Zero risk, quick wins |
| **S1** Google re-sign-in for risky actions | 4 | about half a day | Closes "a stolen session keeps access or deletes the account" |
| **S2** email confirmation, without blocking login | 3 | about 1 day | Closes sign-up squatting; larger, touches mail and the Google flow |
| **S4** login hashing cost (**measure first**) | 2 | later, after real load data | Not urgent for a small site |

Each item is its own commit.

## 2. S3: two small fixes
**Finding 9, Google email case.** In `server/src/modules/auth/auth.controller.js` (`googleLogin`), password accounts store the email lower-case (the Zod validators lower-case it) but Google's email is used as sent. Lower-case `email` right after reading the Google payload (it is used for `findOne({ email })` and for `userModel.create`). `linkGoogle` already compares in lower case.
- Test (`auth.test.js` or a new Google test file; the fake Google token helper is `t.google.token(payload)`): a password account `user@example.com` and a Google payload `User@Example.com` finds the same account (the 409 "log in with your password to link" answer, not a second account); a new Google user with a mixed-case email is stored in lower case.

**Finding 7, development mode.** `NODE_ENV=development` returns full stack traces (see `sendDevError` in `server/src/shared/http/error.middleware.js`). Production (unset or any other value) does not. Add to `server/server.js` a one-line `console.warn` at start when `NODE_ENV === 'development'` ("stack traces are returned in API errors; set NODE_ENV=production on a host"), and one comment line above `NODE_ENV=development` in `server/.env.example`. Test: skip (a log line), but check by reading the output of a start in development mode.

## 3. S1: ask for a fresh Google sign-in before risky actions on Google-only accounts
**Problem.** `PUT /api/auth/set-password` (a Google-only account with no password) needs only a valid session, and `DELETE /api/user/account` for a Google-only account needs only the account email, which the app shows. A stolen session therefore lets an attacker set a password (and keep access after the victim signs out everywhere) or delete the account.

**Change.**
- A helper in `auth.controller.js` (or a small file next to it): `verifyFreshGoogle(user, idToken)` that calls the existing `verifyGoogleToken(idToken)` and requires **all** of: the token is valid; `email_verified` is true; the payload email (lower case) equals `user.email`; the payload `sub` equals the `providerId` of the user's linked Google provider; and `iat` is within the last 5 minutes (a fresh sign-in, not an old token someone kept).
- `setPassword`: when the account has **no password**, require `idToken` and call the helper. Update `setPasswordSchema` in `auth.validators.js` to accept `idToken` (string, required by the controller for Google-only accounts).
- `deleteAccount` (`server/src/modules/user/user.controller.js`): for accounts **without a password**, require `idToken` and call the helper instead of comparing `confirmationEmail`. Update `deleteAccountSchema` in `user.validators.js` (`idToken` optional string; keep `confirmationEmail` accepted but ignored, or remove it and update the client). Accounts **with a password** keep the password check unchanged.
- Rate limits already apply (`authLimiter` on set-password, `accountActionLimiter` on delete). Errors: 401 for an invalid or stale token, 403 for a token of another Google account or another email.
- Client: `client/src/pages/Profile/components/SecurityCard.jsx` (the set-password form) and `DeleteAccountCard.jsx` show a **"Confirm with Google"** step for Google-only accounts, using the Google component already used in `SecurityCard.jsx`/`Login.jsx` (`@react-oauth/google`), and send the returned `credential` as `idToken` through `client/src/api/services/authService.js` and `userService.js`. Error and loading states as in the neighbouring forms.

**Tests (server).** A Google-only account: set password without `idToken` (refused), with a token for a different Google account (403), with a stale `iat` (401), with a different email (403), with the correct fresh token (200, then the password works); delete with no token (refused), wrong token (403), fresh correct token (200, data wiped). A password account: set-password and delete behave as before. Update the existing tests that delete a Google account with `confirmationEmail` (search `confirmationEmail` in `server/test`). Mutation checks: remove the `sub` check, remove the `iat` check. Client: a unit test if the project has a pattern for these cards; otherwise report that it was checked by hand.

## 4. S2: confirm the email address after sign-up, without blocking login
**Problem.** Sign-up has no email verification, so someone can register another person's address first (squatting). Today a password reset by the real owner signs the squatter out and Google sign-in refuses to merge (409), but the squatter's account exists until then.

**Design (decided: do not block login or gate features).**
- Model: add `emailVerified: { type: Boolean, default: false }` to the User model (`server/src/modules/auth/auth.model.js`). Google-created accounts are verified (Google proved the address): set it on creation. **Existing accounts** stay unverified until they verify; no migration needed, but a note in the Profile page asks them to verify.
- New model `EmailVerification { user (ref User, so account deletion wipes it), tokenHash (SHA-256, unique), expiresAt (24 h, with a TTL index), createdAt }`, in the same style as `passwordReset.model.js`.
- Registration (`registerUser`) creates a token (32 random bytes, only the hash stored) and sends the email **in the background** (reuse `sendInBackground` and add `verifyEmail` to `email.service.js`); sign-up never waits for or fails because of the mail.
- Routes (`auth.routes.js`): `POST /api/auth/verify-email { token }` (public, own rate limiter, uses `findOneAndDelete` so a link works once, then sets `emailVerified: true`), and `POST /api/auth/resend-verification` (login required, at most one per minute per user, own rate limiter). Add the limiters in `shared/http/rateLimit.middleware.js` following the existing pattern (so they also use Redis when it is on).
- **The squatting fix:** in `googleLogin`, when an account with the same email exists, has **no Google provider**, and `emailVerified === false`, Google has proved ownership of the address. Then, in one update: link the Google provider, **unset the password**, clear `refreshTokens` (signs the squatter out), set `emailVerified: true`, call `invalidateUser`, and start a Google session. If `emailVerified` is true keep today's behavior (409 "log in with your password to link").
- Client: a page `/verify-email?token=...` (reads the token, calls the route, shows success or an expired-link message; mark it `noindex` like the reset page), and a small banner on the Profile page for unverified accounts with a "Resend email" button. Routes in `client/src/app.routes.jsx`; SEO entry like the reset page in `client/src/seo/pages.js` (a test checks the page lists).
- Capacity: Brevo's free plan allows 300 emails a day; sign-up sends one. Mention this in the README deployment notes only if it becomes a limit.

**Tests (server).** Verification link works once, expires, a wrong or reused token is refused, one token cannot verify another user, resend has a cooldown and is login-protected, 6 parallel verifications of one token give exactly one success, account deletion removes the verification records (it has a `user` ref, so the existing cascade should handle it: assert it), registration still returns 201 when the mail sender fails. **Squatting scenario:** an attacker registers `victim@example.com` with a password and a session; the victim signs in with Google; afterwards the attacker's password no longer logs in and the attacker's old access token is refused, and the victim is signed in with Google. A **verified** password account still gets the 409. Mutation checks: skip the `unset password`, skip clearing the sessions.

## 5. S4: login hashing cost (later, measure first)
**Problem.** bcrypt cost 12 took 206 ms per hash on the developer laptop (103 ms at cost 11, 52 ms at cost 10) and a login took 1.76 s once on the free Render host (about 0.1 of a CPU). Many logins or sign-ups at once slow every request.
**Do not change anything until it is measured on a test deployment.** Order of options:
1. Keep cost 12, add a small cap on simultaneous password hashing (a queue or semaphore around `bcrypt.hash` and `bcrypt.compare`), keep the rate limits.
2. Lower the cost to 10 (the lowest OWASP bcrypt level) and **re-hash at the next successful login** (store the cost in the hash; if it differs from the target, hash again with the new cost) so existing users upgrade silently.
3. Move to Argon2id (the owner's standing preference for new password storage), only if memory use is acceptable on the host.
Tests for any option: a timing-independent check that old hashes still verify, that a login upgrades the stored hash, and that the locked-account path still performs one hash.

## 6. Findings left as they are
- **5, account enumeration** (register answers 409, a locked account answers 429): accepted trade-off, rate limited.
- **6, refresh cookie `Path`:** skipped. Changing it leaves old `Path=/` cookies in browsers and clearing a cookie needs the same path, so it adds migration risk for little gain.
- **8, session cache window** (up to 5 s in another copy's memory, up to 30 s if Redis is down during a revoke): accepted, none with one server.

## 7. Definition of done (per item)
The change is built, tests and a mutation check pass, the full server suite passes (client build, lint and Vitest also for client changes), `docs/research/SECURITY_REVIEW.md` marks the finding **Fixed** with the date, `TESTING.md` and `PROJECT_STATUS.md` have a dated line, the README is updated in neutral wording if a feature changed, and the owner has the git commands.
