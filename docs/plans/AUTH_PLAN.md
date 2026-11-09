# Auth improvement plan

Status (2026-11-09): Phases 1 and 2 are built and tested (481 server tests pass; each fix and each lock rule was broken on purpose to confirm a test fails). Phase 3 (password reset by email, with Brevo): built on 2026-11-09. Server: email service, reset token model, forgot-password and reset-password endpoints, limits, 23 tests, 504 server tests pass. Real-inbox test passed: the reset email arrived in the owner's Gmail Inbox (free Gmail sender through Brevo). Client: ForgotPassword and ResetPassword pages, "Forgot password?" link on the login page, noindex SEO entries, Privacy Policy updated. Left: the owner's click-through of the emailed link, and README/TESTING updates (test count is now 504). Phase 4 waits for a domain.

Phase 2 as built: `loginFailures { count, windowStart, lockedUntil }` on the user; one atomic pipeline update per wrong password; the 11th attempt gets 429 (also for the correct password); a correct password after the lock ends clears the counter. Tests are in `server/test/login-lock.test.js` (12 tests).

## Why

Auth is rated 8 out of 10. This plan closes the gaps that keep it from a 9. In order of harm to users:

1. No way back into an account after a forgotten password.
2. No email check at sign-up (anyone can register with someone else's email).
3. A stolen refresh token is not caught when it is replayed.
4. Login limits count the internet address only, not the account.
5. Small gaps: no attempt limit on password change and account deletion, the Google client ID is not checked at startup, and login timing reveals which emails exist.
6. Cookies use `SameSite=None` (needs a custom domain to change).

Even with everything done, auth stays near 9: there is no multi-factor option and no check against known leaked passwords.

## How we work

One phase at a time. After each phase I run the server tests (with your OK), show the results and stop for your go-ahead. No commits unless you ask; a commit message at the end of each phase. I never read `server/.env` and never touch port 3000 or your real database.

---

## Phase 1: quick fixes (DONE)

Goal: close the cheap gaps first.

**1a. Catch a replayed refresh token**
- Today: reusing an old refresh token after the 10-second grace window is rejected (403), but the thief's own session stays valid and the real user is logged out.
- Change: when an old token matches a session's previous token hash but the grace window is over, delete that whole session. Both sides are signed out and the real user logs in again.
- Files: modify `server/src/controllers/auth.controller.js` (the fallback part of `refreshAccessToken`).

**1b. Attempt limit on password change and account deletion**
- Today: a stolen session can guess the current password with no limit.
- Change: add the failed-attempts-only limiter (`authLimiter`, 10 failures per 15 minutes) to `PUT /change-password` and `DELETE /account`.
- Files: modify `server/src/routes/user.routes.js`.

**1c. Check the Google client ID at startup**
- Today: if `GOOGLE_CLIENT_ID` is missing, the check that a sign-in token was made for your app silently weakens.
- Change: add it to the startup check next to the two JWT secrets, so the server refuses to start without it.
- Files: modify `server/server.js`. (Tests set a fake value, so they are unaffected.)

**1d. Same speed for unknown email and wrong password**
- Today: an unknown email returns before any password work, so response time shows which emails exist.
- Change: when the user is not found, still compare against a fixed dummy hash.
- Files: modify `server/src/controllers/auth.controller.js` (`loginUser`).

**Tests** (modify `server/test/auth.test.js` and `server/test/user.test.js`):
- A replayed old refresh token after the grace window deletes that session and signs out the thief and the real user.
- Replay inside the grace window still works as today.
- 10 wrong passwords on change-password then 429, and the same on delete-account; correct attempts are not counted.
- The server refuses to start without `GOOGLE_CLIENT_ID` (small process test, or a unit test of the check).
- An unknown email and a wrong password both take the password-compare path (assert the compare function is called).

**Done when:** all server tests pass.

---

## Phase 2: per-account login throttle (about 3 hours)

Goal: stop someone with many internet addresses from guessing one account's password.

**Design**
- Count failed password logins per account (by email). After 10 failures inside 15 minutes, further password logins for that account answer 429 until the 15 minutes have passed.
- A successful login resets the count. Google sign-in and refresh are not affected.
- Stored on the user document (atomic `$inc`, a `lockedUntil` date), so it survives restarts and works across servers.
- The catch: an attacker can lock a victim out by failing on purpose. To limit this the lock lasts only 15 minutes and does not block Google sign-in or already logged-in devices.
- For emails that do not exist, there is nothing to count; the existing per-address limit still applies.

**Files**
- Modify `server/src/models/auth.model.js` (add `loginFailures: { count, windowStart, lockedUntil }`).
- Modify `server/src/controllers/auth.controller.js` (`loginUser`).
- Modify `server/src/utils/userResponse.js` only if needed (the new fields must not be sent to the browser).
- Modify `server/test/auth.test.js`.

**Tests:** the 11th wrong password in 15 minutes from different addresses gets 429; the right password during the lock still gets 429 (no information leak); the lock ends after 15 minutes (fake the clock); success resets the count; Google sign-in and refresh still work during a lock; the new fields are never in any API response.

**Done when:** full server suite passes.

---

## Phase 3: password reset and email check (DECISION NEEDED, about 1.5 to 2 days)

Goal: users who forget their password can get back in, and nobody can squat on another person's email.

### Option A: reset and verification by email (the standard way)

**Needs from you:** an email sender. Free plans usually require a verified sender address or domain (Brevo, Resend), or Gmail SMTP with an app password for low volume. I have not checked which one fits you. Emails must not land in spam, so test with a real inbox.

**Design**
- `POST /api/auth/forgot-password`: always answers "if that email exists, we sent a link" (so it does not reveal which emails exist). Rate-limited per address and per email.
- The email holds a link with a random token. Only its hash is stored. It is valid for 1 hour and can be used once.
- `POST /api/auth/reset-password`: checks the token, sets the new password (same strength rules as sign-up), signs out every device.
- Google-only accounts get an email that says they use Google sign-in (or can set a password).
- Email verification at sign-up (optional step 3b): a `emailVerified` flag; an unverified account can use the app, but Google sign-in on the same email takes it over only after clearing the password and sessions (see Option B's rule), which closes the squatting hole.

**Files to create**
- `server/src/services/email.service.js` (one `sendEmail` function; reads the provider settings from env).
- `server/src/models/passwordReset.model.js` (user ref, token hash, expiry with a TTL index; it has a `user` ref so account deletion wipes it automatically).
- `client/src/pages/auth/ForgotPassword.jsx` and `client/src/pages/auth/ResetPassword.jsx`.
- `server/test/password-reset.test.js` (with a fake email service: no real emails in tests).

**Files to modify**
- `server/src/controllers/auth.controller.js` (two new handlers; also session revoke on reset).
- `server/src/routes/auth.routes.js`, `server/src/validators/auth.validators.js`, `server/src/middlewares/rateLimit.middleware.js`.
- `server/.env.example` (`EMAIL_PROVIDER`, `EMAIL_FROM`, key or SMTP settings, `CLIENT_URL` for the link), and your `server/.env`.
- `client/src/app.routes.jsx` (two new public routes), `client/src/pages/auth/Login.jsx` (bring back "Forgot password?" linked to the new page), `client/src/api/services/authService.js`.
- `client/src/pages/legal/PrivacyPolicy.jsx` (the email provider is a new third party that receives your email address), `README.md`.
- `client/src/seo/pages.js` (the two new routes as noindex pages).

**Tests:** a reset request for a real and an unknown email give the same answer and timing shape; the token works once and only for 1 hour; a wrong or reused token is refused; a reset signs out all devices and the old password stops working; the new password must follow the rules; the rate limit stops a flood of requests; Google-only accounts are handled; no token or hash appears in any response or log.

### Option B: no email, use Google as the way back in (cheap)

- When a Google sign-in has a verified email that matches an existing password account that is not yet linked, link it, **delete the old password, sign out every device**, and start a new session. The user can set a new password later from the profile page.
- This helps people who forgot a password and use a Gmail address, and it closes the squatting hole (an attacker's password is wiped).
- It does **not** help someone whose email is not a Google account, and it surprises users who still remember their password (their password stops working until they set one again). Needs a clear message on the sign-in page.
- Files: modify `server/src/controllers/auth.controller.js` (`googleLogin`), `client/src/pages/auth/Login.jsx` (message), `server/test/auth-google.test.js` (the existing "refuses to auto-merge into an existing password account (409)" test changes), `client/src/pages/legal/PrivacyPolicy.jsx`, `README.md`.
- About 0.5 day.

**My recommendation:** Option A is the complete answer, and Option B can be a stopgap. Doing only B leaves non-Google users with no recovery.

---

## Phase 4: SameSite=Lax (later, needs a custom domain)

- Today the site and the API are on different addresses, so cookies must use `SameSite=None`. The defence against cross-site requests is the CORS origin check.
- If both live under one domain you own (for example `yourdomain.com` and `api.yourdomain.com`), cookies can use `Lax`.
- Files: modify `server/src/controllers/auth.controller.js` (cookie options), `server/src/controllers/user.controller.js` (cookie clearing), `server/.env.example`, tests that assert cookie flags.
- Not started until you have a domain.

---

## Decisions (made 2026-11-07)

1. **Option A: email reset.** Option B (Google rule) is not part of the first version.
2. **Sender: Brevo** (free plan, 300 emails per day, one verified sender address, no domain needed). The email service reads the provider from env, so it can move to Resend once a domain is owned. Check Brevo's current plan page before signing up, and test delivery to a real inbox (a Gmail sender address may land in spam).
3. **Password reset only.** Email verification at sign-up (step 3b) comes later.
4. **Phase 2 lock accepted:** 15 minutes after 10 failed password logins, not applied to Google sign-in or logged-in devices.

## Risks (stated honestly)

- Email deliverability is the main unknown for Option A: reset mails can land in spam, and free plans have daily limits.
- The account lock in Phase 2 can be used to annoy a specific user; the short window and the Google and refresh exceptions limit the harm.
- Option B changes behaviour users may not expect; it needs a clear message and a test for the old 409 behaviour.
- Everything here is tested with fakes. Real email delivery can only be checked by you, with a real inbox.
