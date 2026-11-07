What exists today (updated 2026-11-07)
Server: 469 tests (all passing on 2026-11-07) run with `cd server && npm test` (node:test, supertest, in-memory MongoDB, fake Gemini, Groq and Google sign-in; no network, no cost). Files are in server/test/, including ai-fallback.test.js for the AI provider cascade, the one-at-a-time rule, the daily limit and the hidden provider field.
Role Analyzer tests: analyzer.test.js (the API: limits, 409, consent, privacy, ownership, no resume stored), analyzer.service.test.js (score maths, quote checking, title and link rules, prompt-injection text, wrong-shaped AI replies), analyzer.context.test.js (the catalog and the copies of client data stay in sync), resume.test.js (PDF checks, scanned PDFs, redaction) and skills.test.js (skill matching and the advice for each skill). Each rule was checked by breaking the code on purpose and seeing a test fail.
Manual checks that tests cannot do: server/scripts/analyzer-eval.js runs sample resumes through the real AI (needs your keys, costs quota, run by hand). The screens have no automated tests; they were checked in a browser at phone and desktop width against a throwaway backend.
Not built yet: client tests, server unit and startup tests, the load test and the manual QA checklist. Everything below this section is the original PLAN, not a description of what exists.

PrepStack: Full Testing Plan (close the "no tests" gap)
Context
The app now has ~25 API endpoints, 33 server files and ~60 client files, but npm test prints "no test specified". Every fix so far was verified with throwaway scripts that live outside the repo, so any future change can break them silently (this already happened during the work: a 500 after a package upgrade, a wrong log path, a redirect fix that failed first). Goal: turn that verification into permanent, repeatable tests, plus a load test and a manual QA checklist for what automation cannot cover.

Decisions already made by the user
No end-to-end browser tests (Playwright). Real-browser behaviour is covered by component tests plus a one-off exploratory pass and a manual QA checklist.
No CI / GitHub Actions. Tests are run locally with npm test. (Nothing is added under .github/.)
Yes to a one-off load test (run by hand, not part of npm test).
Tooling (all devDependencies, nothing ships to production)
Where	Tools	Why
Server	Node's built-in test runner (node --test), supertest, mongodb-memory-server, autocannon (load test only)	No extra framework; the same approach already proven in my scratch scripts. Each test file runs in its own process, so env and DB are isolated.
Client	vitest, @vitest/coverage-v8, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, msw	Vite-native, no Babel setup; msw mocks the API at the network level so the real axios interceptor is exercised.
Note: the first server test run downloads a MongoDB binary (~100 MB, cached afterwards) for mongodb-memory-server.

Safety rules for every test
Never load server/.env and never touch a real database: helpers set fake secrets, NODE_ENV=test, and an in-memory MongoDB.
Gemini and Google sign-in are always faked (no real API calls, no cost).
The real rate limiters stay ON; tests get a unique X-Forwarded-For per request, except the tests that check limiting itself.
Phase 1: Server test infrastructure + API integration tests (server/test/)
Helpers (server/test/helpers/): env.js, gemini.js (controllable fake reply/error), googleAuth.js (fake verifyIdToken), app.js (boot app + in-memory Mongo, register/login/cookie helpers), fixtures.js (sheets with repeated links, stale links, 450-problem sheet).

Files and what each locks in (mapped to the fixes already made):

cors-health-headers.test.js: exact-origin allowlist, ALLOWED_ORIGINS parsing, 403 (not 500) for bad origins, helmet headers, /health 200/503, access log content (no query/body/secret leakage).
auth.test.js: register/login validation messages, case-insensitive usernames and the parallel sign-up race (one 201, rest 409), Google login/link/set-password (faked), sessions list/revoke (ownership, 404s), refresh rotation, 2/5/30 parallel refreshes, grace window then 403, tampered/legacy/expired tokens, Bearer header, logout/logout-all/change-password revocation, deleted-user token, auth + refresh rate limits (429).
sheets.test.js: public list/detail, progress GET is read-only, toggle add/remove, not-in-sheet 400, other-sheet 400, stale link removable, unknown slug 404, upper-case slug, parallel toggles keep the right parity, auth required.
projects.test.js: generate with good and bad Gemini replies (wrong types, missing fields, bad difficulty, array, throw) -> 201/502 and nothing saved wrongly, input validation, per-user limiter (failed calls not counted), ownership isolation on list/get/delete, invalid id 400.
user.test.js: stats == dashboard (stale links, repeated links), profile update rules incl. avatar https-only, change-password rules, delete account (wrong password, Google-only email confirmation, cascade removes every user-owned model incl. a test-only one), other users untouched. account-replset.test.js repeats delete on a replica set (real transaction path).
notes.test.js: public CS notes list/by-subject/404. Conversion source: my 12 scratch scripts (pairA..G, stress, cascade) become real assertions instead of printed output.
Phase 2: Server unit + process tests
unit/validators.test.js, unit/utils.test.js (tokens: unique jwtid, hashing; usernameHelper; deviceParser UA/IP incl. spoofed X-Forwarded-For; userResponse; responseFormatter; AppError), unit/error-middleware.test.js (Cast/Validation/Duplicate/JWT mapping, dev vs prod body).
process/startup.test.js (spawns the real server.js, cwd outside the repo): DB down -> exit 1 and never listens, graceful SIGTERM (in-process emit, since Windows cannot deliver it), unhandled rejection -> exit 1, DNS override only with ENABLE_CUSTOM_DNS=true, clashing usernames -> server stays up and logs the index warning.
Scripts: npm test, npm run test:coverage (Node's built-in coverage report; aim for >= 85% lines on controllers/middleware/utils, reported not enforced).
Phase 3: Client tests (client/src/**/*.test.jsx)
Infra: vitest.config.js, src/test/setup.js (jest-dom, msw lifecycle, storage reset), src/test/handlers.js, src/test/render.jsx (Router + AuthProvider + ProjectProvider + Toaster), src/test/factories.js. Mock @react-oauth/google; skip animation details.

Logic: extractError, avatar, useProblemNotes (load, update, clear, corrupt JSON, storage error), axios interceptor (401 -> one refresh -> retry, parallel 401s share one refresh, refresh 403 logs out, refresh timeout/network does NOT log out, auth endpoints never refresh, 30 s / 90 s timeouts), AuthProvider/useAuth.
Components/pages: ProtectedRoute, Navbar/Footer (links per auth state), Login, Register (rules + server error shown), Sheets (list + API-failure fallback), SheetsDetail + ProblemRow + ProblemNoteDrawer (optimistic toggle and revert on failure, chips/text, clear, localStorage persistence), the six Profile cards (identity dirty/validation/save, password flows, sessions list/revoke, sign-out confirm, delete wrong-password and success -> lands on /register), AIProjectIdeas (success, 429 message, 502, friendly timeout), dashboards, Notes/NotesDetail, roadmaps, NotFound, legal pages (guard against re-introducing wrong claims such as "quiz attempts").
Scripts: npm test, npm run test:watch, npm run test:coverage.
Phase 4: One-off load test (server/scripts/load-test.js, not part of npm test)
Starts its own stack (in-memory Mongo, faked Gemini, seeded with 5 large sheets), then drives autocannon scenarios: public sheet list and a 450-problem sheet, authenticated progress read, toggle storm, refresh storm on one cookie, login burst from many unique IPs. Reports requests/s, p50/p99 latency, error counts and memory, and flags anything slow or erroring. Results are summarised in docs/LOAD_TEST.md with the caveat that they depend on this machine.

Phase 5: Exploratory pass + manual QA checklist
One-off pass in the built-in browser: visit every route at desktop and 375 px mobile width, check for error screens, console errors and horizontal overflow, and exercise the main forms. Findings are reported to you; I only fix what you approve.
docs/TESTING.md gets a manual QA checklist for what automation cannot do: real Google sign-in, real Gemini, deployed CORS (ALLOWED_ORIGINS, cookies on the live domain), real browsers/devices, and a pre-release smoke run.
Phase 6: Prove the tests work, then document
Mutation check: for ~15 key fixes (CORS regex back, refresh race back, revocation off, avatar rule off, progress GET writes, case-sensitive usernames, stats mismatch, cascade list, /health removed, ...) temporarily break the code and confirm at least one test fails; restore and record the table in docs/TESTING.md.
Add docs/TESTING.md (how to run, layout, helpers, how to add a test, fix-to-test map, known gaps), a short README "Testing" section, and coverage/ to .gitignore.
Final: full server + client suites green, lint clean, build ok, npm audit --omit=dev still 0, coverage numbers reported.
Working method
One phase at a time. After each phase: run the suite, show results, and stop for your go-ahead. No commits unless asked; I give a commit message at the end.

Verification (end to end)
cd server && npm test and cd client && npm test both pass; coverage reports generated.
Mutation table shows every sampled fix is caught.
npm run lint and npm run build (client) unchanged; no real network or real DB used by any test.
Load-test report and exploratory-pass findings delivered separately.
Out of scope (stated honestly)
Real Google sign-in, real Gemini, your live database and hosting, cross-browser testing, and automated browser E2E (you chose not to). These are covered only by the manual QA checklist.