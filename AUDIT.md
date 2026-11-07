# PrepStack code audit

Date: 2026-11-07. Report only: no code was changed by this audit.

**What this repo does:** PrepStack is a website where students track DSA sheets, read CS notes, follow roadmaps and generate AI project ideas. It has a React front end and an Express and MongoDB back end.

**Load I assumed:** a few hundred students on one server, with many of them logging in at the same time during placement season.

**What I read:** the whole server, the client's API layer and login flow, and all the docs. I did not run the tests.

Findings are numbered, so you can say "fix 1, 2 and 5".

---

## Must fix

### 1. A whole college can get locked out of logging in
`server/src/middlewares/rateLimit.middleware.js:L17-27` (used in `auth.routes.js`)

- **What this is:** Login, register and Google sign-in allow 10 tries per 15 minutes for each internet address.
- **Problem:** Students on one campus Wi-Fi share one address. The limit also counts successful logins. After 10 students log in, the 11th gets "Too many attempts" for 15 minutes.
- **Fix:** Add `skipSuccessfulRequests: true` to `authLimiter`. Wrong passwords still count, and normal logins no longer use up the limit.
- **If we skip it:** At a college placement drive, many students can't log in.

### 2. "Forgot password?" does nothing
`client/src/pages/auth/Login.jsx:L249-251`

- **What this is:** A link under the password field on the login page.
- **Problem:** It is a button with no action. There is no password reset anywhere in the app. Someone who forgets their password can never get back in, and nothing tells them so.
- **Fix:** Remove the button for now (5 lines). A real reset needs an email service, which is bigger work.
- **If we skip it:** Users click it, nothing happens, and they leave for good.

---

## Should fix

### 3. The server re-reads every DSA sheet on each dashboard and sheet-list request
`server/src/controllers/sheets.controller.js:L7`, `server/src/controllers/user.controller.js:L56-60`

- **What this is:** The dashboard and the sheet list add up all problems in all 5 sheets, about 1,400 links.
- **Problem:** They read all of it from the database every time. The sheets only change when you run the seed.
- **Fix:** Keep the sheets in server memory for 10 minutes and use that copy.
- **If we skip it:** This is fine with 8 users. At a few hundred, every page load costs a large database read.

### 4. The Google token check is only safe if `GOOGLE_CLIENT_ID` is set
`server/src/controllers/auth.controller.js:L271`, `server/server.js`

- **What this is:** The server checks that a Google sign-in token was made for your app.
- **Problem:** The startup check only covers the two JWT secrets. If `GOOGLE_CLIENT_ID` is missing on a host, the check silently stops comparing which app the token was made for.
- **Fix:** Add `GOOGLE_CLIENT_ID` to the startup check next to the two secrets.
- **If we skip it:** One missing variable on a new host weakens Google login without any error.

### 5. A Google account with no name crashes sign-up
`server/src/utils/usernameHelper.js:L16`, called from `auth.controller.js`

- **What this is:** New Google users get a username made from their display name.
- **Problem:** If Google sends no `name`, `displayName.replace` throws, and the user gets a vague error.
- **Fix:** Pass `name || email.split('@')[0]` instead of `name`.
- **If we skip it:** A rare Google account can never sign up.

### 6. The AI model name is hard-coded to a preview model, and the call has no time limit
`server/src/services/ai.service.js:L63`

- **What this is:** Project ideas use `gemini-3-flash-preview`.
- **Problem:** Google can retire preview models without much warning, and then project ideas fail for every user until you edit the code. A hung Gemini call also keeps the request open.
- **Fix:** Read the name from an environment variable, `process.env.GEMINI_MODEL || "gemini-3-flash-preview"`, and add a timeout.
- **If we skip it:** The AI feature breaks on Google's schedule.

### 7. Several docs say things that are no longer true
`README.md`, `TESTING.md`, `GROQ.md`, `docs/`

- **What this is:** The docs describe the project, the tests and old plans.
- **Problem:**
  - **README:** it still mentions `zod-to-json-schema`, which was removed, and says the AI limit is "per IP" when it is per user. Its refresh-token diagram shows the old code.
  - **`TESTING.md`:** it reads as a plan in the first person. It promises client tests and a load test that don't exist.
  - **`GROQ.md`:** it is code for a Groq fallback, but `groq-sdk` isn't installed.
  - **`docs/ISSUES.md`:** it is the old audit, mostly fixed now, and mentions a SkillBridge folder that isn't in this repo. `docs/AFTER.md` and `docs/track.md` describe other projects.
- **Fix:** Fix the three wrong README lines. Move or delete the planning files that aren't about this repo.
- **If we skip it:** A reviewer or contributor reads claims the code doesn't back up.

### 8. There are no tests on the client, and the riskiest client code is the token refresh
`client/src/api/axios.js`

- **What this is:** The code that refreshes your login and decides when to log you out.
- **Problem:** The server has 227 tests, but this has none. A wrong change could silently log everyone out, or never log them out.
- **Fix:** Add one test file for it. It should cover a 401 followed by one refresh and a retry, a refresh failure logging you out, and a timeout not logging you out.
- **If we skip it:** A future change can break login on the client with no warning.

### 9. One unused dependency
`client/package.json`

- **What this is:** `lucide-react` is installed.
- **Problem:** No file imports it. I checked with a search.
- **Fix:** `npm uninstall lucide-react`.
- **If we skip it:** It adds an extra package to download and audit.

---

## Nice to have

### 10. The project list has no limit
`server/src/controllers/project.controller.js:L35`

- **What this is:** The endpoint that lists a user's saved project ideas.
- **Problem:** It returns all of them in one response. With 4 ideas an hour, a heavy user could reach thousands of rows.
- **Fix:** Add `.limit(100)`.
- **If we skip it:** The list slows down for the heaviest users, which is rare.

### 11. Changing a password or deleting an account has no attempt limit
`server/src/routes/user.routes.js`

- **What this is:** Both ask for your current password.
- **Problem:** Someone holding a stolen session can try passwords as fast as they like.
- **Fix:** Add `authLimiter` to those two routes.
- **If we skip it:** A stolen session is easier to turn into a stolen account.

### 12. Sheet names with capital letters fail on one endpoint
`server/src/controllers/sheets.controller.js:L57`

- **What this is:** The sheet endpoint looks up a sheet by its slug.
- **Problem:** The progress endpoints lowercase the slug and this one doesn't. `/api/sheets/Love-Babbar` returns 404, but the same slug works for progress.
- **Fix:** Add `.toLowerCase()`.
- **If we skip it:** It only affects hand-typed addresses.

---

I left out two smaller items. Login timing can reveal which emails exist. The login limits live in server memory, which the README already says.

**Verdict:** The core is healthy. Fix 1 and 2 first, then 4, 5 and 6, which are quick.

**Lean:** about -490 lines of docs, or about -1,380 if you also archive the Redis note, and -1 dependency are possible.

**Not checked:** I did not run the tests or `npm audit`, and I did not open the live database or hosting. I did not read the seed data, the CS notes content, the `DEBUG-LAB` docs, the Redis doc, or most client pages line by line.
