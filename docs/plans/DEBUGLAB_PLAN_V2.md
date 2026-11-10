STATUS (2026-11-10): PARKED, revised. Build after the improvement plan (IMPROVEMENT_PLAN.md) is done and real users exist; the metrics in section 14 decide. Decisions: JavaScript only to start; other languages only if users ask later (section 14 says how to measure that). This revision adds the three-tier structure (Warm-up, Repo, Incident) and fixes the problems listed in section 0. References to "Report 1" and "Report 3" and old file paths are kept for traceability but may be out of date: re-check them against the current code before starting.

# DebugLab - Complete Build Plan (v2, tiers, MVP first)

Prepared 15 Oct 2026, revised 10 Nov 2026, for PrepStack. This plan assumes the Report 1 fixes and the Report 3 analyzer port are finished first.

**Words used in this plan**
- **Tier** = the kind of content: Tier 1 Warm-up, Tier 2 Repo, Tier 3 Incident.
- **Wave** = when it ships: Wave 0 (demand test), MVP, Wave 2, Wave 3.
- **Challenge** = one playable item of any tier (the old word "incident" now means Tier 3 only).

---

## 0. Revision notes: what changed and why

### New in v2
1. Three tiers instead of one (section 3, 7, 8).
2. Wave 0 demand test before the full build (section 13).
3. An interview-context section with sources and caveats (section 1).

### Problems found in the previous plan, and the fix
| # | Problem | Fix (where) |
|---|---|---|
| 1 | Section 2 said "hidden test suite" but section 9.4 showed a visible, read-only `test.js`. | Test visibility is now defined per tier; "hidden" means hidden from the UI, not secret (D12, section 7). |
| 2 | `bestTimeSeconds` had `default: null` and was updated with `$min`. In MongoDB's comparison order null sorts below numbers, so `$min` would keep the null and never record a best time. | Remove the default; use one atomic pipeline update (section 9.3). |
| 3 | The solve endpoint used two separate updates (status/time, then `solvedAt`), which is not atomic. | Ensure-document step, then one pipeline update (section 9.3). |
| 4 | Concurrent first saves with an upsert can hit the unique index (E11000). | Retry once on E11000 (section 9.4). |
| 5 | A CSP that restricts `script-src` would break the engine's `new Function`. | The worker CSP is `connect-src 'none'` only; verify in the spike (section 6.2). |
| 6 | Deleting globals is weak on its own (code may reach them through prototypes or `globalThis`). | The CSP is the real network defence; deleted globals are defence in depth; add a sandboxed-iframe worker option to the spike (section 6.2). |
| 7 | Shadowing via function parameters is bypassable with `globalThis.setTimeout`, and `Date`, `Math.random`, `performance`, `process.nextTick`, `queueMicrotask` were not covered. | Full shadow list and a documented limitation (section 6.2, Appendix A.2). |
| 8 | `new Function` gives poor line numbers in errors. | Append `//# sourceURL=<file>` to every module (section 6.4). |
| 9 | `sim.until` hangs or runs to SIMULATION_LIMIT when a promise never resolves, and the deadlock detector was only described. | Deadlock-aware `until` with a stop predicate (Appendix A.2). |
| 10 | "Pause the timer when the tab is hidden" contradicts a timed exam simulation. | Warm-up uses a wall-clock deadline that never pauses; only untimed tiers pause (D11). |
| 11 | Drafts in `localStorage` stay behind on shared computers (campus labs). | Clear all DebugLab local data on logout; key by user id (section 10.4, 11). |
| 12 | Wave 0 as first suggested had no backend and therefore no way to measure interest. | Wave 0 includes a tiny "progress-lite" backend (open, solve) (section 13). |
| 13 | Metrics had vague thresholds ("a handful of users"). | Concrete suggested thresholds and a small-traffic fallback (section 14). |
| 14 | Caps (6 files, 60 KB) did not fit repo-style challenges. | Caps are per tier (section 6.1, 9). |
| 15 | Unhandled promise rejections and errors thrown inside timers were only mentioned in edge cases. | Specified in the engine (section 6.3, Appendix A.2). |
| 16 | A synchronous infinite loop cannot be tested by a validator running in-process. | The validator uses `worker_threads` plus `terminate()` for `expectTimeout` challenges (section 7.3). |
| 17 | The worker script's CSP header needs a path rule, and Vite hashes worker file names. | Header rule matches the hashed worker asset path (section 6.2, 13). |
| 18 | The privacy policy covered code drafts but not the new result tables. | Cascade delete and policy text cover both collections (section 9.5, 11). |
| 19 | Using company names in challenge titles or marketing could imply affiliation or real questions. | Naming rule in section 3. |

---

## 1. Interview context (research, Nov 2026)

Purpose: explain what real "debugging rounds" look like so the tiers copy the *skills*, not specific questions. Almost all sources are prep vendors, coaches and blogs; treat details as reported, not confirmed. Google's change was reported by Business Insider from an internal document and later confirmed by a Google spokesperson (per a Prepfully summary). Ask recruiters or recent candidates before relying on any detail.

| Company | Format as reported | Level | Notes |
|---|---|---|---|
| Google | Pilot "code comprehension" round: analyze an existing codebase, find bugs, improve performance, with Gemini available. Graders assess "AI fluency": prompt engineering, output validation, debugging. One source says a 200-500 line codebase. A traditional no-AI coding round is still kept. | Junior and mid-level (one source says L3/L4), select US teams (Cloud, Platforms and Devices), from H2 2026 | Pilot, US teams only; may not reach India campus hiring soon. |
| Meta | "AI-enabled coding" round replaced one of two onsite coding rounds (rolled out Oct 2025), 60 minutes, multi-file codebase, selectable AI models. One of three scenarios: build a feature, extend partial code, or debug a broken implementation. Debugging is often Part 1 (get the codebase running). Reported rubric: problem solving, code understanding, verification and debugging, communication. | Broad SWE loop | Reported bugs are basic (for example missing visited-node tracking in DFS/BFS). |
| Amazon | Classic OA1: 7 short snippets, about 20 minutes, each with a minor bug (off-by-one, loop conditions, type casting), tests must pass; older reports list C, C++, Java. Newer 2026 candidate reports describe a repo with several bugs to fix in about 60 minutes (Java/Spring Boot, Node/MERN, Python/Django), sometimes AI-assisted. | Intern, new grad, SDE-1 (SDE-2 differs) | Not in every assessment. Older data may be outdated. |
| Stripe | "Bug Squash": about 60 minutes on a realistic, unfamiliar repo; reproduce, isolate, fix, validate. A SQL variant (4-5 broken queries) exists for data engineers. | Level not clearly stated | Valued: smallest safe fix, regression test, concise root-cause explanation. |

**Skills these rounds share (what DebugLab should train):**
- Read unfamiliar code before changing it.
- Form a hypothesis, test it, and then fix; do not rewrite.
- Make the smallest safe fix; do not break working behaviour.
- Use tests (and, in incidents, logs) to confirm the fix.
- Explain the root cause in a sentence or two.
- (Emerging) verify, not trust, AI-written code.

**How the tiers map to the reports**
- Tier 1 Warm-up -> Amazon-style short snippet rounds.
- Tier 2 Repo -> Meta/Stripe/Google-style "unfamiliar codebase with failing tests".
- Tier 3 Incident -> production-style diagnosis (not a commonly reported round, but a strong interview talking point and the most distinctive content).

**Not covered (known gaps):** AI-assisted interviewing (see non-goals), languages other than JavaScript, and exact rubrics.

---

## 2. What was verified before writing (prototype)

I built a throwaway prototype of the sandbox engine (running in Node as a stand-in for a Web Worker) and tested the assumptions the whole feature depends on.

**Confirmed [Tested]:**
- Deterministic race tests work. With a virtual clock, the buggy wallet fails and the fixed wallet passes, with identical outcomes across 200 runs. A run takes about 1 to 2 ms; 1,000 simulated timer steps take about 136 ms.
- Tests must be isolated. State leaked between tests until every test got a fresh module cache and a fresh clock. Before that, the "invariant" test passed on the buggy code.
- Tests must check behaviour, not implementation. A naive "busy flag" fix passes the "exactly one succeeds" test but is caught by a liveness test (two valid $20 withdrawals must both succeed). Two different valid fixes (a promise-chain mutex, and an atomic debit inside db.js) both pass.
- In-worker timeouts cannot stop a synchronous infinite loop. Only terminating the worker from the main thread does (worked after 1.5 s).
- Deleting fetch, XMLHttpRequest and WebSocket inside the worker before user code runs works (`typeof fetch` is undefined).
- `setImmediate` does not exist in browsers. MessageChannel is the replacement and is just as fast.
- CodeMirror 6 (JavaScript mode plus a dark theme) adds roughly 500 kB raw (about 175 kB gzip) as lazy chunks; the main bundle did not change (343.5 to 343.8 kB). Monaco loads from a CDN by default and is heavy on mobile.

**Not yet verified (the Phase 1 spike must do this):**
- Real behaviour in Chrome, Firefox and Safari.
- The worker's CSP header actually blocking network access, and the header rule matching Vite's hashed worker file name.
- Whether `new Function` still works with the final CSP.
- Whether a worker started from a sandboxed (opaque-origin) iframe works in all three browsers.
- Behaviour on mobile and the editing experience.
- Everything in Appendix A.2 (the v2 engine changes are a draft and have not been run).

---

## 3. Product definition

**One sentence:** DebugLab trains the debugging skills reported in modern interview rounds, in three tiers: fix quick bugs under time pressure (Warm-up), fix a small multi-file app until its tests pass (Repo), and diagnose a production incident from logs and read the post-mortem (Incident).

**Who it is for:** SDE-1 and placement-level users first. Skills trained: reading unfamiliar code, finding root causes with tests and logs, reasoning about async and concurrency (Tier 3), making minimal safe fixes.

**Naming and claims rule:** do not use company names in challenge titles, and do not claim a company asks these exact questions. Describe tiers as "inspired by publicly reported formats" (for example "online-assessment style"). All challenges are original.

**Tiers**

| | Tier 1 Warm-up | Tier 2 Repo | Tier 3 Incident |
|---|---|---|---|
| Unit | A timed set of 7 snippets | One small app, 3 to 5 bugs | One service outage |
| Time | 20-minute countdown for the set | About 25 to 45 minutes, untimed by default | About 20 to 40 minutes, count-up stopwatch |
| Files | 1 small file per snippet (at most 25 lines) | 4 to 8 files, at most about 300 lines total | 2 to 6 files, at most 250 lines total |
| Input | One-line spec comment | README task + failing tests | Ticket + logs + failing tests |
| Tests | Visible | Small visible smoke test + tests hidden from the UI, grouped per bug, + keep-working checks | Visible `test.js` |
| Hints | None (timed); explanation after submit | 2 tiers | 2 tiers |
| After | Fix explanation per snippet | Debugging walkthrough | Post-mortem |
| Skill | Spot and fix small bugs fast | Read, run tests, isolate, fix without breaking | Diagnose from symptoms, understand production failure modes |

**Non-goals for v1:** running code on your server, AI feedback or an AI-assisted mode, leaderboards or badges that need trusted verification, languages other than JavaScript, editing on phones, and a large catalogue at launch.

**Scope by wave**
- **Wave 0 (demand test):** the spike, one Warm-up set (7 snippets), INC-01, and a tiny "progress-lite" backend. No drafts, no dashboard integration.
- **MVP:** full backend, Warm-up set 1, 2 Repo challenges, 4 Incidents.
- **Wave 2:** grow only if metrics justify it (section 14): more sets and repos, 6 more incidents.
- **Wave 3:** the remaining incident ideas, selectively.

---

## 4. Key decisions

- **D1 - Where content lives.** Static files in the client repo (`client/src/data/debuglab/...`), lazy-loaded per challenge. The server stores only progress. Pros: no seeding, tests live next to the code they test, content ships with deploys. Con: solutions and hidden tests are inspectable in the bundle, which is acceptable for a self-study tool.
- **D2 - Verification.** Tests run in the user's browser, so "solved" is self-reported. That is fine for a progress tracker. Do not add leaderboards or public badges without server-side verification.
- **D3 - Editor.** CodeMirror 6, lazy-loaded. Not Monaco.
- **D4 - Language and module style.** JavaScript, CommonJS (`require`, `module.exports`) so challenges look like real Node code.
- **D5 - Determinism.** Virtual clock and injected fakes; no assertions on real time, heap size or CPU.
- **D6 - Isolation.** A fresh Worker per run, a main-thread watchdog, a `connect-src 'none'` CSP on the worker script, deleted network globals, and (if the spike proves it works) the worker started from a sandboxed opaque-origin iframe.
- **D7 - Navigation.** DebugLab goes in the Navbar's "More" list with a NEW badge. After the analyzer there are already five primary links, which is too many.
- **D8 - Devices.** Desktop-first. Tablets get stacked tabs. On phones show the instructions read-only with a "best on desktop" notice.
- **D9 - One engine for all tiers.** Same worker, runner and test API. Tiers differ only in content shape and UI mode.
- **D10 - `kind` field.** Every challenge has `kind`: `warmup` | `repo` | `incident`. The catalogue, workspace, validator, registry and backend branch on it.
- **D11 - Timers.** Warm-up is a hard countdown based on a wall-clock deadline stored locally (so a refresh does not reset it; it never pauses). Repo and Incident use a count-up stopwatch that pauses when the tab is hidden, with an optional 25-minute countdown.
- **D12 - Test visibility per tier.** Tier 1: visible. Tier 2: a small visible smoke test, plus tests hidden from the UI (not secret; see D1) grouped per bug, and keep-working checks that pass from the start. Tier 3: visible `test.js`. In every tier, failure messages describe behaviour in plain words and never print test source.
- **D13 - Challenge ids and registry.** One registry lists every valid challenge id, `kind`, and per-kind caps. A CI check keeps the registry and the content folders in sync.
- **D14 - Minimal-fix feedback (Tier 1).** After a snippet passes, show how many lines the user changed versus the original. Over 3 changed lines shows a non-blocking "can you fix it with a smaller change?" note, matching the "minimal fix" expectation reported for short-snippet rounds.

---

## 5. Architecture

```text
Catalog page (tabs: Warm-up | Repo | Incident)
   |- /debug-lab/warmup/:setId   -> WarmupSet (countdown, 7 snippets, submit)
   '- /debug-lab/:challengeId    -> Workspace (switches on kind: repo | incident)
                                    |- Left: Instructions (README | Ticket + Logs | Hints | Method)
                                    |- Centre: Editor (CodeMirror, file tabs, test.js read-only where visible)
                                    '- Bottom: Terminal (results per test or per bug group, console output)

Run button -> useChallengeRunner (main thread)
                |- new Worker(sandbox.worker.js)   [fresh per run]
                |- watchdog: terminate() after 2 s (Tier 1) or 5 s (Tier 2/3)
                '- postMessage({ files, tests: [{source, hidden}] }) / onmessage(results)

sandbox.worker.js
  |- capture postMessage ref, delete fetch/XHR/WebSocket/etc.
  |- core: virtual clock + module resolver + test runner
  '- per test: fresh clock, fresh module cache, fresh fakes

Server (Express 5 + MongoDB): progress only
  GET /progress, POST /progress/:id/open, PUT /progress/:id/draft,
  POST /progress/:id/solve, POST /sets/:setId/result ...
```

---

## 6. Sandbox engine specification

### 6.1 Worker lifecycle and protocol
- Create a new Worker for every run and terminate it after the result. This keeps state clean and makes a hang recoverable.
- Watchdog: the main thread starts a timer when it posts the job (2 s for Tier 1, 5 s for Tier 2 and 3); on expiry it calls `worker.terminate()` and shows "Execution timed out. Check for infinite loops or catastrophic regexes."
- Messages: main to worker `{ type: 'run', files, tests: [{ name, source, hidden }] }`; worker to main `{ type: 'result', results, logs }` or `{ type: 'fatal', error }`.
- Caps per kind (the worker and the server both enforce them; the worker rejects larger jobs):

| Kind | Files | Per file | Total | Logs |
|---|---|---|---|---|
| warmup | 1 | 8 KB | 8 KB | 50 lines, 5 KB |
| repo | 8 | 20 KB | 80 KB | 200 lines, 20 KB |
| incident | 6 | 20 KB | 60 KB | 200 lines, 20 KB |

### 6.2 Isolation (threat model)
The code only ever runs in the user's own browser, so the real risk is not a hostile candidate; it is **self-XSS**: a user pastes "a solution" from a stranger, and that code calls your API with the user's cookies (a same-origin fetch from a worker carries them). Defences, layered:

1. **CSP on the worker script (the main network defence).** Serve the worker script with `Content-Security-Policy: connect-src 'none'`. Do **not** add `script-src` restrictions: the engine uses `new Function` and a restrictive `script-src` would break it. Verify in a real browser that fetch from the worker is blocked. The header rule must match the production file name (Vite hashes worker assets, for example `/assets/sandbox.worker-*.js`; on Vercel use a path pattern in `vercel.json`).
2. **Delete network globals** (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `importScripts`, `BroadcastChannel`, `indexedDB`, `caches`, `Worker`, `SharedWorker`) from the worker global before loading user code. This is defence in depth only; user code may still reach some APIs through prototypes, so do not rely on it alone.
3. **Capture the real `postMessage`** in a closure first, then delete it from the global so user code cannot forge results.
4. **Shadow environment names through function parameters** so user modules use the virtual clock and captured logger: `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `queueMicrotask`, `Date` (virtual `now()` and `new Date()` with no arguments), `performance` (`now` only), `process` (small shim: `nextTick`, `env`, `hrtime`), `Math` (seeded `random`), and `console`. **Known limitation:** code can still reach the real globals through `globalThis`; challenges and tests must not depend on preventing that, and the validator must not accept fixes that rely on it.
5. **Optional hardening (evaluate in the spike):** start the worker from a sandboxed iframe (`sandbox="allow-scripts"`, no `allow-same-origin`) so it has an opaque origin and sends no cookies. If a browser does not support it, fall back to the CSP approach and record the result.
6. Make clear in the docs that this is not a security boundary against a determined attacker; it is protection for the PrepStack site and its users. Show the warning "Only run code you wrote or understand."

### 6.3 Virtual clock
- `setTimeout` and `setInterval` inside user modules schedule on a virtual clock; they never wait in real time.
- `sim.settle()` repeatedly yields one real macrotask (via MessageChannel, so all microtasks finish), then jumps virtual time to the next timer and fires it, until no timers remain. It stops with `SIMULATION_LIMIT` after 10,000 steps (infinite timer loops).
- `sim.until(promise)` runs the clock until the promise settles and returns its value (or throws its error). Always use it in tests: awaiting a virtual-time call without advancing the clock hangs forever (this bit the prototype). If no timers remain and the promise is still pending, `until` throws `DeadlockError: operation never completed`. This makes the transfer-deadlock incident testable.
- Also provide `sim.now()` (virtual ms) and `sim.random()` (seeded, deterministic) for incidents such as retry jitter.
- Errors thrown inside a timer callback fail the current test (they propagate through `settle`). Unhandled promise rejections are collected by the worker (`unhandledrejection` listener) and fail the test that was running, with the rejection message.

### 6.4 Module resolver and injected built-ins
- CommonJS `require` over the in-memory file list: relative paths, `.js` optional, circular imports allowed (register the module before executing it, as Node does).
- Every module is wrapped with `//# sourceURL=<file name>` so stack traces show the user's file name.
- Injected modules (a small set, written once): `events` (a tiny EventEmitter with `listenerCount`), `crypto` (a deterministic fake HMAC and a `timingSafeEqual` shim that records calls), `util`, and `sim`. No `fs`, `http`, `net` or `child_process`.
- Unknown modules throw `Cannot find module 'x'`, with a hint listing what is available.

### 6.5 Test API
```js
test('name', async ({ require, sim, spy }) => { ... });
assert(cond, message);  assert.equal(a, b);  assert.deepEqual(a, b);
await assert.rejects(promise);  assert.throws(fn);
const calls = spy.wrap(obj, 'method');   // calls.count, calls.args
```
- Tests are registered once; each test then runs with a fresh clock, fresh module cache and fresh fakes.
- **Group convention (Tier 2):** hidden tests are named `[bug-1] ...`, `[bug-2] ...`, and keep-working checks `[keep] ...`. The UI groups results by prefix and shows "Bug 1: 2 of 3 checks pass".
- Result shape: `{ name, group?, hidden?, passed, error?, durationVirtualMs }`.
- Failure messages must show expected versus actual in plain words ("paid out $100 from a $60 wallet").

### 6.6 What cannot be measured, and the substitute
Real heap, real timing and CPU cannot be asserted reliably in a browser. Use counters instead: listener counts, outstanding timers (`clock.pending()`), query-count spies, a fake stream that counts buffered bytes, a fake cursor that counts documents held, and virtual elapsed time.

---

## 7. Content authoring standard (per tier)

Content quality decides whether this feature is good or embarrassing. Every challenge follows these contracts. All content is original; no company names in titles; no real secrets, hostnames or customer data.

### 7.1 Folder layouts

```text
client/src/data/debuglab/
  warmups/set-01/
    meta.json                 id, title, language, timeLimitMin: 20, order of snippets
    w01-off-by-one/
      meta.json               category, difficulty, expectTimeout?: true
      index.js                buggy code, at most 25 lines, with a one-line spec comment
      test.js                 table-driven cases (visible)
      fix.md                  the minimal fix and why
      solution.js             reference fix (used by the validator and the diff note)
  repos/repo-01-<name>/
    meta.json                 id, title, difficulty, estMinutes, tags, bugCount, prepstackLinks
    README.md                 the task given to the user (what the app should do, how to run tests)
    files/                    editable source files + smoke.test.js (visible, read-only)
    tests.hidden.js           grouped [bug-N] and [keep] tests
    hints.json                tier 1 (directional), tier 2 (architectural)
    solution/                 reference fix files
    variants/                 wrong-fix/ and alt-fix/ used only by the validator
    walkthrough.md            how to find each bug (reproduce, isolate, fix), and the minimal fix
  incidents/inc-01-wallet-double-spend/
    meta.json                 id, title, track, severity, difficulty, estMinutes, tags, prepstackLinks
    files/                    editable files (starting, buggy state) + test.js (read-only)
    ticket.md                 customer-facing outage report
    logs.txt                  telemetry and stack traces
    hints.json                tier 1 (directional), tier 2 (architectural)
    solution/                 reference fix files
    variants/                 wrong-fix/ and alt-fix/ files used only by the validator
    postmortem.md             root cause, timeline, why it happens in production, the fix, further reading
```

### 7.2 Tier-specific design rules

**Tier 1 (Warm-up)**
- One bug per snippet (a second small side-effect bug is allowed, such as mutating the input). Real Tier 1 rounds use minor bugs, so no tricks.
- The reference fix changes at most 3 lines.
- Cover a mix of categories across a set (see Appendix B), and include at least one infinite-loop snippet per set so users learn to recognise it.
- No hints while the set is timed. After submit, show `fix.md` for every snippet.

**Tier 2 (Repo)**
- 3 to 5 bugs with realistic roles: one that stops the app from loading or running, one logic bug, one edge case. Bugs must be independent: fixing bug N flips exactly group N from red to green.
- Include `[keep]` tests that pass on the buggy repo and must still pass after the fix, so rewriting wholesale or breaking working features is caught.
- The README states expected behaviour and how to run the tests; it does not name the bugs.
- Teach the loop in the walkthrough: reproduce, isolate, hypothesise, smallest fix, re-run, explain root cause in one sentence.

**Tier 3 (Incident)**
- Assert invariants and behaviour (money paid out never exceeds balance), not implementation details (did you call `lock()`).
- Add a liveness test so "reject everything" fixes fail.
- Accept multiple valid fixes; write at least one alternative solution to prove it.
- Isolate every test; never rely on state left by an earlier test.
- Failure messages teach: say what was observed and what was expected.

### 7.3 The validator (runs in CI, blocks merges)
A Node script runs every challenge and enforces:

**All tiers**
1. The buggy version fails at least one test (Tier 3: at least 2, including the one that captures the symptom).
2. The reference solution passes all tests.
3. Every `variants/alt-fix/*` passes all tests.
4. Every `variants/wrong-fix/*` fails at least one test.
5. Results are identical across 200 runs (for `expectTimeout` challenges, 3 runs).
6. A full run takes under 200 ms; no real timers, no real `Date`, no network. Challenges with `expectTimeout: true` are run in a `worker_threads` Worker with a 500 ms watchdog and must time out in the buggy version and pass in the fixed version.
7. Stated difficulty and estimated minutes present; registry entry exists and matches `kind`.

**Tier 1 only:** each snippet is at most 25 lines; the reference fix differs from the buggy code by at most 3 changed lines (line diff); each snippet has a one-line spec comment; `fix.md` exists.

**Tier 2 only:** every hidden test is named with `[bug-N]` or `[keep]`; the buggy repo fails every `[bug-N]` group and passes every `[keep]` test; fixing only bug N (partial-fix variants in `variants/partial-N/`) turns exactly group N green; at most 8 files and 300 lines in total.

**Tier 3 only:** each file at most 80 lines, whole incident at most 250 lines.

---

## 8. Catalogue

### 8.1 Tier 1 - Warm-up sets
- **set-01 (MVP):** 7 snippets, specified in Appendix B (off-by-one, default sort, falsy zero, missing await, `var` in a loop, floating-point money, infinite loop).
- **set-02 (Wave 2):** empty-array reduce, mutating the input, `==` vs `===` surprises, wrong comparison operator, string vs number concatenation, shallow copy of nested data, `parseInt` without radix or on a non-string, off-by-one in slicing.

### 8.2 Tier 2 - Repo challenges
- **repo-01 (MVP): Shopping cart service.** Spec in Appendix C.
- **repo-02 (MVP): Rate-limited notes API.** Suggested bugs: wrong named export so the module fails to load; a window boundary off-by-one in the limiter; pagination drops the last page.
- **Wave 2 ideas:** LRU cache with a stale-entry bug; a task scheduler with timezone/date handling; **"Review the AI patch"** challenges. In these, the user gets a plausible-looking but wrong fix (as an AI assistant might write it) and must find why it fails the tests and correct it. They train "output validation", reported as part of newer rounds, and need no AI calls or cost.

### 8.3 Tier 3 - Incidents (MVP: 4, SDE-1 level)
**INC-01 Flash-sale wallet double spend (P1, concurrency).** Files: `walletService.js`, `db.js`, `test.js`. Bug: check-then-act across an `await`. Tests: exactly one of two $50 withdrawals on $60 succeeds; money paid out never exceeds balance; two $20 withdrawals both succeed (liveness); a sequential withdrawal still works. Valid fixes: per-wallet promise-chain mutex; atomic conditional debit in `db.js`; version check with retry. Wrong fixes: global busy flag, re-reading balance after the write, adding a delay. Prototype-verified.

**INC-02 The N+1 dashboard waterfall (P2, database).** Files: `dashboardController.js`, `projectRepo.js` (fake database that counts queries and adds 20 ms virtual latency each), `test.js`. Bug: one awaited query per project inside a loop. Tests: output identical; at most 2 queries (spy); virtual elapsed time at most 60 ms; empty list works; order preserved. Valid fixes: one batched `$in` query plus an in-memory join. Wrong fix: `Promise.all` over 50 queries (latency drops, database load does not; the post-mortem explains why batching still matters).

**INC-03 The listener leak (P1, Node internals).** Files: `server.js`, `metrics.js` (shared emitter), `test.js`. Bug: each request adds a metric listener and never removes it. Tests: after 1,000 requests that close, listener count is back to the baseline; while a request is open it receives events; after it closes it does not; a second long-lived subscriber keeps working. Valid fixes: remove on close, `once`, a single fan-out listener. Wrong fixes: `removeAllListeners` (breaks the other subscriber), `setMaxListeners(0)` (hides the warning, count still wrong).

**INC-04 The parallel refresh lockout (P1, auth).** Files: `apiClient.js`, `tokenService.js` (fake server that rotates refresh tokens and revokes the session on reuse), `test.js`. Bug: four parallel requests with an expired token trigger four refresh calls. Tests: exactly one refresh call; all four requests succeed with the new token; the session is not revoked; if the refresh fails, all four reject and the next request starts a fresh refresh; a later expiry refreshes again. Valid fix: share one in-flight refresh promise and clear it when settled. Wrong fixes: caching the token forever; serialising refreshes (still reuses the old token). This mirrors the pattern in PrepStack's own `axios.js`, which is a good talking point.

### 8.4 Wave 2 incidents (to reach 10)
- Lost update with version check and retry (optimistic concurrency).
- Payment idempotency key with STARTED and COMPLETED states.
- Retry storm without jitter (assert spread of retry times with the seeded `sim.random`).
- Cache stampede fixed with single-flight (assert one backend call).
- Prototype pollution in a deep merge.
- Timing-unsafe signature compare (spy on the injected `timingSafeEqual`).

### 8.5 Wave 3 (remaining, only if metrics justify)
- Feasible with the same engine: transfer deadlock (detect via the deadlock-aware `until`), circuit breaker (virtual clock), cache-aside invalidation race, session fixation, stream backpressure (fake writable with a high-water mark), timer leak (assert outstanding timers are zero), multi-document write rollback (fake database with sessions), cursor streaming (fake cursor that counts documents held), ReDoS (the watchdog reports a timeout).
- **Reframe or cut:** the unindexed-sort memory spill (#18). It depends on a real database's planner; a fake would teach the fake. Turn it into a non-code multiple-choice "which index would you create" question, or drop it.
- Rewrite any incident whose original description relied on real heap or timing measurements.
- Keep fakes thin and document where they differ from real Node/MongoDB, so users do not learn the fake.

### 8.6 Analyzer integration (after MVP)
The Role Analyzer already keeps plan links only if they point at content that exists. Add a `debuglab` link type to the skill catalog (for example skills such as concurrency, async programming, debugging, caching) that maps to challenge ids, validated against the registry. A job description that mentions debugging or concurrency then links to the matching challenge. This is the loop that makes DebugLab part of PrepStack rather than a bolt-on.

---

## 9. Backend plan

The server only stores progress. It never runs user code. All code follows PrepStack's conventions: CommonJS, `sendSuccess` and `AppError`, `authMiddleware`, zod v4 (`error:` messages, not `required_error`), and atomic updates (the load-modify-save pattern caused the problems listed in Report 1, B3 and S5).

### 9.1 Files
```text
server/src/models/challengeProgress.model.js
server/src/models/warmupSetResult.model.js
server/src/data/debuglabRegistry.js        valid ids: { id, kind, title, setId?, track?, severity?, caps }
server/src/validators/debuglab.validators.js
server/src/controllers/debuglab.controller.js
server/src/routes/debuglab.routes.js       mounted at /api/debug-lab
```

### 9.2 Models
```js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 60 },
  content: { type: String, required: true, maxlength: 20000 },
}, { _id: false });

const challengeProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: String, required: true, maxlength: 60 },
  kind: { type: String, enum: ['repo', 'incident', 'warmup'], required: true },
  status: { type: String, enum: ['in_progress', 'solved'], default: 'in_progress' },
  draftFiles: { type: [fileSchema], default: [], validate: (v) => v.length <= 8 },
  attempts: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  timeSpentSeconds: { type: Number, default: 0 },
  // NO default here: a null default breaks $min (null sorts below numbers in MongoDB).
  bestTimeSeconds: { type: Number },
  solvedAt: { type: Date },            // absent until solved
  lastRunAt: { type: Date },
  lastOpenedAt: { type: Date },
}, { timestamps: true, toJSON: { transform: (doc, ret) => { delete ret.__v; return ret; } } });
challengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

const warmupSetResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  setId: { type: String, required: true, maxlength: 60 },
  attempts: { type: Number, default: 0 },
  bestSolved: { type: Number, default: 0 },       // snippets solved in the best attempt
  bestSeconds: { type: Number },                  // time of the best attempt (no null default)
  lastAttemptAt: { type: Date },
}, { timestamps: true, toJSON: { transform: (doc, ret) => { delete ret.__v; return ret; } } });
warmupSetResultSchema.index({ userId: 1, setId: 1 }, { unique: true });
```
Notes:
- No `unattempted` status: no document means unattempted.
- No redundant single-field indexes: the compound indexes already cover `userId`.
- Warm-up snippets are not stored individually; the in-progress set lives in localStorage and only the result is saved.
- `kind` is stored for fast filtering but the registry is the source of truth; ignore any `kind` sent by the client.

### 9.3 Endpoints (all behind `authMiddleware`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/debug-lab/progress` | `{ challenges: [...], sets: [...] }`: one light entry each (status, attempts, best time), no code. |
| GET | `/api/debug-lab/progress/:challengeId` | Includes `draftFiles`. |
| POST | `/api/debug-lab/progress/:challengeId/open` | Records `lastOpenedAt` (needed for the "opened at least once" metric). Upsert with `$setOnInsert` defaults. |
| PUT | `/api/debug-lab/progress/:challengeId/draft` | Repo and incident only. Body `{ files, elapsedSeconds, ran? }`. |
| POST | `/api/debug-lab/progress/:challengeId/solve` | Body `{ elapsedSeconds, hintsUsed }`. |
| DELETE | `/api/debug-lab/progress/:challengeId/draft` | Resets the draft (keeps solved status and stats). |
| POST | `/api/debug-lab/sets/:setId/result` | Warm-up set result. Body `{ solved, elapsedSeconds }`. |

**Draft save** (one `findOneAndUpdate`, `upsert: true`, `new: true`, Mongoose `setDefaultsOnInsert` on):
```js
const update = {
  $set: { draftFiles: files, kind },
  $max: { timeSpentSeconds: elapsedSeconds },   // monotonic: a stale client cannot reset it
};
if (ran) { update.$inc = { attempts: 1 }; update.$set.lastRunAt = new Date(); }
```

**Solve** (ensure the document exists, then one atomic pipeline update):
```js
// 1) ensure-document step (idempotent)
await ChallengeProgress.updateOne(
  { userId, challengeId },
  { $setOnInsert: { kind, status: 'in_progress' } },
  { upsert: true }
);
// 2) single atomic update using an aggregation pipeline
await ChallengeProgress.updateOne({ userId, challengeId }, [{
  $set: {
    status: 'solved',
    solvedAt: { $ifNull: ['$solvedAt', '$$NOW'] },                          // set once
    bestTimeSeconds: { $min: ['$bestTimeSeconds', elapsedSeconds] },        // array-form $min ignores missing/null
    hintsUsed: { $max: [{ $ifNull: ['$hintsUsed', 0] }, hintsUsed] },
    timeSpentSeconds: { $max: [{ $ifNull: ['$timeSpentSeconds', 0] }, elapsedSeconds] },
    updatedAt: '$$NOW',
  },
}]);
```
Verify in the API tests that Mongoose 9 passes the pipeline through unchanged and that `solvedAt` stays fixed on a second solve.

**Warm-up set result** (same two-step pattern):
```js
const s = solved, t = elapsedSeconds;
await WarmupSetResult.updateOne({ userId, setId }, { $setOnInsert: { bestSolved: 0 } }, { upsert: true });
await WarmupSetResult.updateOne({ userId, setId }, [{
  $set: {
    attempts: { $add: [{ $ifNull: ['$attempts', 0] }, 1] },
    lastAttemptAt: '$$NOW',
    // all expressions read the OLD document, so bestSeconds compares against the old bestSolved
    bestSeconds: { $cond: [
      { $gt: [s, { $ifNull: ['$bestSolved', -1] }] }, t,
      { $cond: [ { $eq: [s, { $ifNull: ['$bestSolved', -1] }] }, { $min: ['$bestSeconds', t] }, '$bestSeconds' ] },
    ] },
    bestSolved: { $max: [{ $ifNull: ['$bestSolved', 0] }, s] },
    updatedAt: '$$NOW',
  },
}]);
```
The client computes `solved` from the real test run, but it is self-reported (D2). Do not show these numbers publicly.

### 9.4 Rules
- Validate `challengeId` and `setId` against the registry before any write. This avoids the junk-document problem found in the sheets endpoints (Report 1, B3). Add a CI check that the registry matches the content folders in the client.
- Take `kind` and caps from the registry, not from the request.
- **Validators (zod v4):** per-kind file count (repo up to 8, incident up to 6); file name pattern like `^[A-Za-z0-9_.-]{1,40}\.js$` (no path separators, no duplicates); content at most 20,000 characters per file and per-kind total (80,000 for repo, 60,000 for incident); `elapsedSeconds` an integer from 0 to 86,400; `solved` an integer within the set's snippet count; `hintsUsed` an integer from 0 to 2.
- **Body limit:** set `express.json({ limit: '120kb' })` on this router explicitly.
- **Duplicate-key retry:** if an upsert throws E11000 (two first-time requests at once), retry the operation once.
- **Rate limits:** per-user key (like `aiProjectLimiter`): about 120 draft saves per minute (the client debounce makes about 20 a minute in normal use), 30 solves per minute, 60 opens per minute; Redis-backed if you completed that fix.
- **Cascade and stats:** add `ChallengeProgress` and `WarmupSetResult` to the shared `deleteUserData` helper; add `challengesSolved` (split by kind) to `getDashboardSummary` and `getUserStats`.
- **Legal:** mention saved code drafts and DebugLab results in the Privacy Policy and the delete-account dialog.

### 9.5 Wave 0 "progress-lite"
Only `GET /progress`, `POST /progress/:id/open`, `POST /progress/:id/solve` and `POST /sets/:setId/result`, with the registry and rate limits. No drafts yet (drafts stay in localStorage). About 1 to 2 days, and it gives you the numbers for the go/no-go in section 14.

---

## 10. Frontend plan

### 10.1 File map
```text
client/src/pages/DebugLab/DebugLab.jsx             catalog (tabs: Warm-up | Repo | Incident)
client/src/pages/DebugLab/WarmupSet.jsx            timed set: countdown, snippet navigator, submit, results
client/src/pages/DebugLab/ChallengeWorkspace.jsx   repo and incident workspace (switches on kind)
client/src/pages/DebugLab/components/              ChallengeCard, TrackSection, Dossier, EditorPane, FileTabs,
                                                   TerminalPane, TestResultCard, BugChecklist, HintPanel,
                                                   SnippetEditor, SnippetNavigator, FixSizeNote,
                                                   PostMortemModal, WalkthroughModal, TimerBar, MethodPanel
client/src/hooks/useChallengeRunner.js             worker lifecycle, watchdog, results
client/src/hooks/useDebugLabProgress.js            fetch progress, autosave, open, solve
client/src/hooks/useCountdown.js                   wall-clock deadline countdown (survives refresh)
client/src/api/services/debugLabService.js         uses the shared api instance
client/src/debuglab/sandbox.worker.js              worker entry (loads core)
client/src/debuglab/core.js                        engine (Appendix A)
client/src/data/debuglab/...                       content (section 7.1)
```

### 10.2 Routing and navigation
- In `app.routes.jsx`: lazy `DebugLab`, `WarmupSet` and `ChallengeWorkspace`; routes `/debug-lab`, `/debug-lab/warmup/:setId` and `/debug-lab/:challengeId`, inside `MainLayout`, wrapped in `ProtectedRoute`.
- In `components/Navbar.jsx`: add to `exploreLinks` with a NEW badge (not `mainLinks`).
- Use PrepStack's own colour palette. Do not reuse the SkillBridge token classes (they are not defined in PrepStack; see Report 3, section 6.3).

### 10.3 Catalog page
- Summary strip: challenges solved (by tier), best Warm-up score, optional streak.
- Tabs for the three tiers; cards show title, difficulty, estimated minutes, tags and status. Tier 3 cards also show the severity badge (P1 red, P2 amber).
- Filters: status, tag, severity (Tier 3); search by title or tag.
- A short "How a debugging round works" panel (the Method page): reproduce, isolate, hypothesise, smallest fix, verify, explain. This is static content and costs about a day.
- "Request another language" link (opens a prefilled GitHub issue); counts of requests are the language-demand signal (section 14).
- Wave 2 and 3 items appear as "Coming soon" only if you want a roadmap; otherwise hide them.

### 10.4 Workspaces

**Warm-up set (Tier 1)**
- A 20-minute countdown from a wall-clock deadline saved in localStorage (never pauses; auto-submits at zero).
- Snippet navigator with solved/unsolved markers; each snippet has its own small editor, a Run button, and the one-line spec. Each Run uses a fresh worker with a 2-second watchdog; a timeout shows "Possible infinite loop".
- Submit runs all 7 snippets, computes `solved`, posts the set result, then shows each `fix.md` and the minimal-fix note (D14).
- Offer "Retry" (starts a new attempt) and "Review explanations" at any time after submit.

**Repo and Incident workspace (Tiers 2 and 3)**
- Layout: left Instructions panel (Repo: README, Hints, Method. Incident: Ticket, Logs, Hints), centre editor with file tabs, bottom or right terminal. Resizable panes on desktop; stacked tabs on tablet; read-only instructions with a notice on phones.
- Editor: CodeMirror 6, JavaScript mode, line numbers, bracket matching, undo history. Visible test files are read-only so users see exactly what is expected. Dirty marker per file, "Reset file" and "Reset all" (with confirmation).
- Run flow (state machine): `idle -> running -> passed | failed | timeout | error`. Run with the button or Ctrl/Cmd+Enter. Disable Run while running; always terminate the worker at the end.
- Results: Tier 2 shows a `BugChecklist` (one row per bug group, with the plain-language failure message, never test source) plus keep-working checks; Tier 3 shows a card per test with expected versus actual. Captured `console.log` output sits below. Clear messages for timeout, syntax error and "Cannot find module".
- Autosave: write drafts to `localStorage` immediately (keyed by user id and challenge id) and to the server with a 3-second debounce; on load, use whichever copy has the newer timestamp. **On logout, clear every DebugLab key from localStorage** (shared campus computers).
- Timer: count-up stopwatch by default (pauses when the tab is hidden); optional 25-minute countdown.
- Hints: two tiers, revealed one at a time; each reveal increments `hintsUsed`.
- Solved state: when all tests pass (Tier 2: all `[bug-N]` and `[keep]` groups), call solve, show a short celebration and unlock the walkthrough (Tier 2) or post-mortem (Tier 3).
- Post-mortem modal (Tier 3): root cause, timeline, "why this happens in production", a diff of buggy versus reference code (a small diff library), and links to PrepStack content (for example `/roadmaps/backend`, `/notes/os`).
- Accessibility: keyboard-reachable panes, `aria-live` region for test results, visible focus, colour is never the only status signal, and the Warm-up countdown announces only at 10, 5 and 1 minutes (not every second).

### 10.5 Edge cases to handle
- Syntax errors in user code (show the message with the file name; `sourceURL` gives usable stack traces, but line numbers may be offset, so consider a quick pre-parse later).
- Deleted or renamed files, empty files, files over the size cap.
- Very large `console.log` output (truncate); unhandled promise rejections inside user code (report as a failed test, not a crash).
- Offline or failed autosave (keep the local draft, show a small "not synced" indicator).
- Browser without module-worker support (show a clear message).
- A Warm-up deadline passing while the tab was closed (on return, show the results screen for the saved attempt, or an "attempt expired" message).
- Two tabs open on the same challenge (last write wins; show a notice if the other tab's draft is newer).

---

## 11. Security and privacy checklist
- No user code ever runs on the server.
- Worker isolation as in section 6.2, with the CSP header and deleted network globals verified in real browsers.
- Server caps on file count and size per kind; `challengeId` checked against the registry; per-user rate limits; explicit body limit.
- Saved code is personal data: include it, and the Warm-up results, in account deletion and in the Privacy Policy.
- Local drafts are cleared on logout.
- Challenge content contains no real secrets, hostnames or customer data; use obviously fake values.
- Do not trust `solve` or set results for anything public. If leaderboards or badges are ever added, add server-side verification first.
- Hidden tests and solutions are in the client bundle (D1); do not put anything sensitive in them.

---

## 12. Test plan
- **Engine unit tests (Vitest):** the prototype cases (buggy fails, fixed passes, naive fix caught, alternative fix passes); per-test isolation; `sim.until`; `SIMULATION_LIMIT`; deadlock detection; virtual `Date` and seeded `Math.random`; errors in timers and unhandled rejections fail the right test; module resolver (relative paths, circular imports, missing module, `sourceURL` in stack traces).
- **Challenge validator:** run in CI for every challenge with the per-tier rules (section 7.3), including the `expectTimeout` path using `worker_threads`.
- **API tests (supertest, mongodb-memory-server):** registry validation, per-kind size limits, atomic upserts, E11000 retry, monotonic time, `solvedAt` set once, `bestTimeSeconds` records on first solve and only decreases, Warm-up best-score logic, ownership, cascade delete of both collections.
- **Client tests:** the runner hook with a mocked worker (success, failure, timeout, fatal error); autosave merge logic; the countdown (deadline survives reload, never pauses, auto-submit); logout clears DebugLab storage; `BugChecklist` grouping from test names.
- **Browser matrix (manual):** Chrome, Firefox and Safari: worker starts, MessageChannel works, CSP blocks fetch from the worker, `new Function` still works, an infinite loop is terminated within the watchdog time, the editor works with the keyboard.
- **Build checks:** lint and build clean; confirm the editor and engine stay out of the main bundle; confirm the worker CSP header is present on the production worker file.

---

## 13. Phased execution
Estimates are rough, for one developer, and are not measured.

- **Phase 0 - Prerequisites.** Report 1 fixes and the analyzer finished (test runner, CI, `deleteUserData` helper, theme decision exist).
- **Phase 1 - Browser spike (1 to 2 days).** A throwaway page: real Worker, watchdog, CSP header (with the production-style hashed path rule), deleted globals, sandboxed-iframe worker variant, CodeMirror, INC-01 end to end. Go/no-go: works in Chrome, Firefox and Safari; infinite loop terminated; fetch blocked; `new Function` works; editing feels fine. If not, stop here, having spent two days.
- **Phase 1.5 - Wave 0 demand test (about 4 to 7 days after the spike).** Productionise just enough of the engine (virtual clock, module resolver, runner), the Warm-up set UI, Warm-up set 1 (7 snippets, Appendix B), INC-01, the Method panel, and "progress-lite" (section 9.5). Release to real users and watch the metrics in section 14 for 3 to 4 weeks. Decide go/no-go before continuing.
- **Phase 2 - Engine package (3 to 4 days).** Productionise Appendix A.2: shadowing, `events` and `crypto` shims, spies, seeded random, deadlock detection, result protocol, caps, unit tests, validator CLI (all tiers).
- **Phase 3 - Backend (2 to 3 days).** Section 9, with API tests.
- **Phase 4 - Frontend (6 to 8 days).** Catalog with tabs, workspace, `BugChecklist`, runner hook, autosave, hints, post-mortem and walkthrough, routing, Navbar, responsive behaviour, accessibility.
- **Phase 5 - MVP content (about 6 to 8 days beyond Wave 0).** Tier 2 repo-01 and repo-02 (about 1.5 to 2 days each), INC-02 to INC-04 (about 1 to 1.5 days each); each through the validator, with hints and write-ups.
- **Phase 6 - Polish and release (2 to 3 days).** Browser matrix, copy and legal text, README, feature announcement, monitoring of server errors.

**Totals (rough):** Wave 0 about 6 to 10 days including the spike. Full MVP about 20 to 30 working days in total (Wave 0 work is reused). Wave 2 (set-02, more repos, six more incidents, analyzer integration) adds about 8 to 12 days. Wave 3 only after the metrics justify it.

---

## 14. Metrics for deciding what to build next
Most data comes from `ChallengeProgress` and `WarmupSetResult` (opens, runs, solves, time, hints). No separate analytics product is needed.

**Wave 0 go/no-go (suggested thresholds; adjust to your traffic):**
- At least 10% of active users open DebugLab within four weeks.
- At least 40% of openers run code.
- At least 25% of those who run code solve a challenge (or solve at least 3 of 7 Warm-up snippets).
- At least 20% of solvers return for a second challenge or a second Warm-up attempt.
- **Small-traffic fallback:** if you have fewer than about 100 active users, percentages are noise. Ask 5 to 10 users directly (a short feedback link) and treat those answers as the signal.

**Ongoing**
- Attempt-to-solve rate per challenge and median solve time (too easy under 3 minutes for Tier 3; too hard if under 20% solve).
- Warm-up: median snippets solved in 20 minutes, which snippets are most often missed, how many users retry.
- Hint usage per challenge and drop-off point (opened but never ran).
- Which tier users open first and which they finish (if most stop after Tier 1, Tier 1 is the product).
- Language demand: number of "request another language" clicks or issues.
- Support signals: bug reports about the sandbox, and tests that users report as unfair.

If fewer than a handful of users reach a second challenge, improve the existing content before writing more.

---

## 15. Risks and mitigations
- **Content cost is the real cost.** Mitigation: Wave 0 first, enforce the validator, measure, then expand.
- **Flaky or unfair tests.** Mitigation: determinism check in CI, behaviour-based tests, alternative and wrong-fix variants, a visible "report an issue with this test" link.
- **Browser differences.** Mitigation: Phase 1 spike across all three browsers before any other work.
- **Self-XSS from pasted code.** Mitigation: layered isolation (section 6.2), plus the visible warning "Only run code you wrote or understand."
- **Tier 1 looks too easy or trivial.** Mitigation: category labels, the minimal-fix note, an explanation after every snippet, and harder set-02.
- **JavaScript only does not match Java/C++/Python-heavy campus rounds.** Mitigation: say so clearly in the UI, measure demand (section 14), and evaluate a second language (for example Python via a WebAssembly runtime, which is heavy) only if users ask.
- **Fidelity: fakes may teach the fake.** Mitigation: keep fakes thin, document differences, cut incidents that depend on real planners or real heap.
- **Interview formats change (AI assistance, new rounds).** Mitigation: section 1 is dated; revisit it every few months; "Review the AI patch" challenges give a cheap path to the AI-era skill.
- **Perceived difficulty for beginners.** Mitigation: Tier 1 first, graded hints, estimated time on every card.
- **Maintenance burden of the engine.** Mitigation: keep it small (about 100 to 150 lines of core), well tested, with no dependencies.
- **Scope creep (AI feedback, leaderboards, more languages).** Mitigation: explicit non-goals until the metrics support them.
- **Misleading claims about companies.** Mitigation: naming rule in section 3; no company names in titles.

---

## 16. Definition of done

**Wave 0**
- Warm-up set 1 (7 snippets) and INC-01 pass the validator in CI.
- A user can run, see failures, fix, and submit a Warm-up set within a 20-minute countdown; can solve INC-01; results are recorded (opens, solves, set result).
- Infinite loops are terminated; network access from user code is blocked in Chrome, Firefox and Safari.
- Account deletion removes all DebugLab data.

**MVP**
- Warm-up set 1, 2 Repo challenges and 4 Incidents pass the per-tier validator in CI.
- Warm-up: countdown, navigator, submit, per-snippet explanation, minimal-fix note.
- Repo: README, visible smoke test, hidden grouped tests, bug checklist, 2 hint tiers, walkthrough.
- Incident: ticket, logs, 2 hints, editable files, read-only test file, post-mortem.
- Drafts survive reloads and devices; time and attempts are recorded; progress appears in the catalog and dashboard.
- Account deletion removes all `ChallengeProgress` and `WarmupSetResult` data; the Privacy Policy mentions saved code; local DebugLab data is cleared on logout.
- Lint, build and all tests pass; the editor and engine are lazy-loaded; no new critical or high audit findings.

---

## Appendix A. Engine core

### A.1 Prototype code (verified in Node)
This is the exact code the prototype ran (in Node), with browser-safe pieces. It passed: the buggy wallet fails both tests, the fixed wallet passes both, a naive "busy flag" fix is caught by the liveness test, an alternative atomic-debit fix passes, and 200 repeated runs gave identical results. Not covered by the prototype: shadowing of timers, `Date` and `console`; the `events` and `crypto` shims; `spy`; seeded random; and deadlock detection.

```js
function yieldMacrotask() {
  return new Promise((resolve) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = () => { port1.close(); port2.close(); resolve(); };
    port2.postMessage(0);
  });
}
function makeClock() {
  let now = 0, seq = 0; const q = [];
  const add = (fn, ms, every) => { const t = { id: ++seq, at: now + ms, fn, every, dead: false }; q.push(t); return t.id; };
  return {
    now: () => now,
    setTimeout: (fn, ms = 0) => add(fn, ms),
    setInterval: (fn, ms = 0) => add(fn, ms, ms),
    clear: (id) => { const t = q.find(x => x.id === id); if (t) t.dead = true; },
    pending: () => q.filter(t => !t.dead).length,
    async settle(maxSteps = 10000) {
      for (let i = 0; i < maxSteps; i++) {
        await yieldMacrotask();
        const live = q.filter(t => !t.dead).sort((a, b) => a.at - b.at || a.id - b.id);
        if (!live.length) return;
        const t = live[0]; now = t.at;
        if (t.every) t.at = now + t.every; else t.dead = true;
        t.fn();
      }
      throw new Error('SIMULATION_LIMIT: too many timer steps (infinite timer loop?)');
    },
  };
}
function makeRequire(files, injected) {
  const cache = new Map();
  const norm = (p) => { const n = p.startsWith('./') ? p.slice(2) : p; return n.endsWith('.js') ? n.slice(0, -3) : n; };
  const req = (p) => {
    if (injected[p]) return injected[p];
    const name = norm(p), f = files.find(x => norm(x.name) === name);
    if (!f) throw new Error('Cannot find module ' + p);
    if (cache.has(name)) return cache.get(name).exports;
    const mod = { exports: {} }; cache.set(name, mod);   // set before running: circular imports work like Node
    new Function('module', 'exports', 'require', f.content)(mod, mod.exports, req);
    return mod.exports;
  };
  return req;
}
async function runIncident({ files, testSource }) {
  const results = []; const tests = [];
  const test = (name, fn) => tests.push({ name, fn });
  const assert = (c, m) => { if (!c) { const e = new Error(m || 'Assertion failed'); e.name = 'AssertionError'; throw e; } };
  new Function('test', 'assert', testSource)(test, assert);   // registration only, no shared state
  for (const t of tests) {
    const clock = makeClock();                                 // fresh clock and fresh modules per test
    const delay = (ms) => new Promise(r => clock.setTimeout(r, ms));
    const sim = { delay, now: clock.now, settle: clock.settle,
      until: async (p) => { const [r] = await Promise.all([p, clock.settle()]); return r; } };
    const require = makeRequire(files, { sim });
    try { await t.fn({ require, sim }); results.push({ name: t.name, passed: true }); }
    catch (e) { results.push({ name: t.name, passed: false, error: e.name + ': ' + e.message }); }
  }
  return results;
}
```

### A.2 Draft v2 changes (UNVERIFIED: build and test these in Phase 2)
These are the planned changes on top of A.1. They have not been run.

```js
// 1) settle() accepts a stop predicate so sim.until can stop as soon as the promise is done
//    (replace the settle in makeClock)
async settle(maxSteps = 10000, stop = () => false) {
  for (let i = 0; i < maxSteps; i++) {
    await yieldMacrotask();
    if (stop()) return;
    const live = q.filter(t => !t.dead).sort((a, b) => a.at - b.at || a.id - b.id);
    if (!live.length) return;
    const t = live[0]; now = t.at;
    if (t.every) t.at = now + t.every; else t.dead = true;
    t.fn();                       // errors thrown by a timer callback propagate and fail the test
  }
  throw new Error('SIMULATION_LIMIT: too many timer steps (infinite timer loop?)');
}

// 2) deadlock-aware sim.until
const until = async (p) => {
  let done = false, failed = false, value, error;
  p.then((v) => { done = true; value = v; }, (e) => { done = true; failed = true; error = e; });
  await clock.settle(10000, () => done);
  await yieldMacrotask();                      // flush trailing microtasks
  if (!done) { const e = new Error('deadlock: operation never completed (no timers left, promise still pending)'); e.name = 'DeadlockError'; throw e; }
  if (failed) throw error;
  return value;
};

// 3) seeded random (mulberry32) and virtual Date
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeVirtualDate(clock, RealDate) {
  const BASE = 1700000000000;                  // fixed epoch for determinism
  function VDate(...a) { return a.length ? new RealDate(...a) : new RealDate(BASE + clock.now()); }
  VDate.now = () => BASE + clock.now();
  VDate.parse = RealDate.parse; VDate.UTC = RealDate.UTC; VDate.prototype = RealDate.prototype;
  return VDate;
}

// 4) per-test environment that is passed to every module as function parameters
function makeEnv(clock, logs, seed = 1) {
  const rnd = mulberry32(seed);
  const log = (...a) => { if (logs.length < 200) logs.push(a.map(String).join(' ').slice(0, 500)); };
  return {
    setTimeout: clock.setTimeout, setInterval: clock.setInterval,
    clearTimeout: clock.clear, clearInterval: clock.clear,
    queueMicrotask: (fn) => Promise.resolve().then(fn),
    Date: makeVirtualDate(clock, Date),
    performance: { now: clock.now },
    process: { env: {}, nextTick: (fn, ...a) => Promise.resolve().then(() => fn(...a)),
               hrtime: Object.assign(() => [0, clock.now() * 1e6], { bigint: () => BigInt(clock.now()) * 1000000n }) },
    Math: Object.assign(Object.create(Math), { random: rnd }),
    console: { log, info: log, warn: log, error: log },
  };
}

// 5) makeRequire wraps each module with the shadowed names and a sourceURL
function makeRequire(files, injected, env) {
  const cache = new Map();
  const names = ['module', 'exports', 'require', ...Object.keys(env)];
  const vals = Object.values(env);
  const norm = (p) => { const n = p.startsWith('./') ? p.slice(2) : p; return n.endsWith('.js') ? n.slice(0, -3) : n; };
  const req = (p) => {
    if (injected[p]) return injected[p];
    const name = norm(p), f = files.find((x) => norm(x.name) === name);
    if (!f) throw new Error('Cannot find module ' + p + ' (available: ' + files.map((x) => x.name).join(', ') + ')');
    if (cache.has(name)) return cache.get(name).exports;
    const mod = { exports: {} }; cache.set(name, mod);
    new Function(...names, f.content + '\n//# sourceURL=' + f.name)(mod, mod.exports, req, ...vals);
    return mod.exports;
  };
  return req;
}

// 6) spy helper for tests
const spy = { wrap(obj, key) {
  const orig = obj[key]; const calls = { count: 0, args: [] };
  obj[key] = function (...a) { calls.count++; calls.args.push(a); return orig.apply(this, a); };
  return calls;
} };

// 7) unhandled rejections inside user code fail the running test (in the worker entry)
//    self.addEventListener('unhandledrejection', (e) => { current.unhandled = String(e.reason); e.preventDefault(); });
```

### A.3 Main-thread runner with watchdog (sketch)
```js
function runInWorker(job, { timeoutMs = 5000 } = {}) {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./sandbox.worker.js', import.meta.url), { type: 'module' });
    const timer = setTimeout(() => { worker.terminate(); resolve({ type: 'timeout' }); }, timeoutMs);
    worker.onmessage = (e) => { clearTimeout(timer); worker.terminate(); resolve(e.data); };
    worker.onerror = (e) => { clearTimeout(timer); worker.terminate(); resolve({ type: 'fatal', error: e.message }); };
    worker.postMessage({ type: 'run', ...job });
  });
}
```
Notes: module workers need Safari 15 or later (check the spike). The CSP response header must be set on the production worker file, whose name Vite hashes.

---

## Appendix B. Tier 1, set-01 (7 snippets)

Each snippet: a one-line spec comment, the buggy code, the minimal fix, and the tests (visible). All files export with `module.exports`. Tests use the standard test API. Run these through the validator before shipping (the sketches below have not been run).

**w01 Off-by-one in a loop** (category: off-by-one)
```js
// Returns the sum of the first n numbers in the array.
function sumFirst(nums, n) {
  let total = 0;
  for (let i = 0; i <= n; i++) total += nums[i];
  return total;
}
module.exports = { sumFirst };
```
Fix: `i < n`. Tests: `sumFirst([1,2,3,4], 2) === 3`; `sumFirst([5], 1) === 5`; `sumFirst([], 0) === 0`.

**w02 Default sort and mutation** (category: sorting, mutation)
```js
// Returns the 3 highest scores, largest first. Must not change the input array.
function top3(scores) {
  return scores.sort().reverse().slice(0, 3);
}
module.exports = { top3 };
```
Fix: `return [...scores].sort((a, b) => b - a).slice(0, 3);`. Tests: `top3([5, 100, 25, 9])` equals `[100, 25, 9]`; the input array is unchanged after the call.

**w03 Falsy zero** (category: falsy values)
```js
// Returns the user's discount percent. If none is set, the default is 10.
function getDiscount(user) {
  return user.discount || 10;
}
module.exports = { getDiscount };
```
Fix: `user.discount ?? 10`. Tests: `{ discount: 0 }` gives 0; `{}` gives 10; `{ discount: 25 }` gives 25.

**w04 Missing await** (category: async)
```js
// Adds up the price of every id. fetchPrice(id) is async and returns a number.
async function getTotal(ids, fetchPrice) {
  let total = 0;
  for (const id of ids) {
    total += fetchPrice(id);
  }
  return total;
}
module.exports = { getTotal };
```
Fix: `total += await fetchPrice(id);`. Tests: with `fetchPrice = async (id) => ({ a: 5, b: 7 })[id]`, `await getTotal(['a','b'], fetchPrice)` is 12; an empty list gives 0.

**w05 `var` in a loop closure** (category: scoping)
```js
// Returns n functions; the function at index i must return i.
function makeCounters(n) {
  const fns = [];
  for (var i = 0; i < n; i++) {
    fns.push(() => i);
  }
  return fns;
}
module.exports = { makeCounters };
```
Fix: `let i`. Tests: `makeCounters(3).map((f) => f())` equals `[0, 1, 2]`; `makeCounters(0)` equals `[]`.

**w06 Floating-point money** (category: numbers)
```js
// Returns the cart total in dollars, rounded to 2 decimals.
function cartTotal(items) {
  return items.reduce((sum, it) => sum + it.price * it.qty, 0);
}
module.exports = { cartTotal };
```
Fix: `return Math.round(items.reduce((sum, it) => sum + it.price * it.qty, 0) * 100) / 100;`. Tests: `[{ price: 0.1, qty: 3 }]` gives 0.3; `[]` gives 0; `[{ price: 2, qty: 2 }]` gives 4.

**w07 Infinite loop** (category: loops; `expectTimeout: true` on the buggy version)
```js
// Returns the index of target in arr, or -1 if it is not there.
function firstIndexOf(arr, target) {
  let i = 0;
  while (i < arr.length) {
    if (arr[i] === target) return i;
  }
  return -1;
}
module.exports = { firstIndexOf };
```
Fix: add `i++` inside the loop. Tests: `firstIndexOf([4,5,6], 5) === 1`; `firstIndexOf([4,5,6], 9) === -1`; `firstIndexOf([], 1) === -1`. The buggy version hangs when the target is not at index 0, so the 2-second watchdog reports "Possible infinite loop".

**Set-level notes**
- Order: easy to harder; w07 last so a timeout does not cost the user the other six.
- The 20-minute countdown applies to the whole set. A set is "solved" for a snippet when all its tests pass.
- Do not name a company anywhere in set-01.

---

## Appendix C. Tier 2, repo-01: Shopping cart service (spec)

**Files (about 5):** `cart.js` (add/remove items, totals), `pricing.js` (discounts and tax), `format.js` (money formatting), `index.js` (exports), `smoke.test.js` (visible: "adding one item gives a total").

**Bugs (independent)**
1. **bug-1, loads or runs wrong:** `index.js` re-exports a name that `cart.js` does not export (for example `addItem` vs `add`), so `require('./index')` yields `undefined` functions. Group `[bug-1]`: the public API exists and `addItem` is callable.
2. **bug-2, logic:** the percentage coupon is applied to the total after tax instead of before (or tax is applied to the discounted amount in the wrong order). Group `[bug-2]`: specific totals with a 10% coupon and 8% tax.
3. **bug-3, edge case:** removing the last item leaves a `NaN` total, or an empty cart formats as `$NaN`. Group `[bug-3]`: empty cart total is 0 and formats as `$0.00`.

**Keep-working checks `[keep]` (pass on the buggy repo):** adding two items sums correctly with no coupon; quantity updates; money formatting of whole-dollar amounts.

**Partial-fix variants for the validator:** fixing only bug-1, only bug-2, or only bug-3 turns exactly that group green.

**Hints:** tier 1 "Run the smoke test first. What does `require('./index')` actually give you?"; tier 2 "Compare the order of operations in `pricing.js` with the README's rules."

**Walkthrough:** show the loop (reproduce with the smoke test, isolate which function returns the wrong value, hypothesise, smallest fix, re-run, explain the root cause in one sentence) applied to each bug.

---

## Appendix D. Example test file for INC-01

```js
test('two concurrent $50 withdrawals on a $60 wallet: exactly one succeeds', async ({ require, sim }) => {
  const { withdraw } = require('./walletService');
  const r = await sim.until(Promise.all([withdraw('u1', 50), withdraw('u1', 50)]));
  assert(r.filter(x => x.ok).length === 1, 'expected exactly 1 success, got ' + r.filter(x => x.ok).length);
});
test('invariant: money paid out never exceeds starting balance', async ({ require, sim }) => {
  const { withdraw } = require('./walletService');
  const r = await sim.until(Promise.all([withdraw('u1', 50), withdraw('u1', 50)]));
  const paid = r.filter(x => x.ok).length * 50;
  assert(paid <= 60, 'paid out $' + paid + ' from a $60 wallet');
});
test('liveness: two concurrent $20 withdrawals both succeed', async ({ require, sim }) => {
  const { withdraw } = require('./walletService');
  const r = await sim.until(Promise.all([withdraw('u1', 20), withdraw('u1', 20)]));
  assert(r.every(x => x.ok), 'a valid request was rejected: ' + JSON.stringify(r));
});
```