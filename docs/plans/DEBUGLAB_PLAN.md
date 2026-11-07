DebugLab - Complete Build Plan (MVP First)
Prepared 15 Oct 2026 for PrepStack. This plan assumes the Report 1 fixes and the Report 3 analyzer port are finished first. It replaces the 20-incident master plan: the good ideas are kept, the flawed parts are corrected, and the riskiest mechanism was prototyped before writing.
1. What I verified before writing this plan
I built a throwaway prototype of the sandbox engine (running in Node as a stand-in for a Web Worker) and tested the assumptions the whole feature depends on.
Confirmed [Tested]:
• Deterministic race tests work. With a virtual clock, the buggy wallet fails and the fixed wallet passes, with identical outcomes across 200 runs. A run takes about 1 to 2 ms; 1,000 simulated timer steps take about 136 ms.
• Tests must be isolated. State leaked between tests until I gave every test a fresh module cache and a fresh clock. Before that, my 'invariant' test passed on the buggy code.
• Tests must check behaviour, not implementation. A naive 'busy flag' fix passes the 'exactly one succeeds' test but is caught by a liveness test (two valid $20 withdrawals must both succeed). Two different valid fixes (a promise-chain mutex, and an atomic debit inside db.js) both pass.
• In-worker timeouts cannot stop a synchronous infinite loop. Only terminating the worker from the main thread does (worked after 1.5 s).
• Deleting fetch, XMLHttpRequest and WebSocket inside the worker before user code runs works (typeof fetch is undefined).
• setImmediate does not exist in browsers. MessageChannel is the replacement and is just as fast.
• CodeMirror 6 (JavaScript mode plus a dark theme) adds roughly 500 kB raw (about 175 kB gzip) as lazy chunks; the main bundle did not change (343.5 to 343.8 kB). Monaco loads from a CDN by default and is heavy on mobile.
Not yet verified (the Phase 1 spike must do this): real behaviour in Chrome, Firefox and Safari; the worker's CSP header actually blocking network access; behaviour on mobile; and the editing experience.
2. Product definition
One sentence: the user gets a small broken service plus the logs from its outage, edits the code until a hidden behavioural test suite passes, then reads a post-mortem explaining the root cause and the production-grade fix.
Who it is for: SDE-1 and placement-level users first. Skills trained: reading unfamiliar code, reasoning about async and concurrency, using logs and symptoms to find a root cause. Do not claim that any specific company runs this exact format; describe it as 'practical debugging practice'.
Non-goals for v1: running code on your server, AI feedback, leaderboards or badges that need trusted verification, languages other than JavaScript, editing on phones, and 20 incidents at launch.
Scope tiers:
• MVP: 4 incidents.
• Wave 2: grow to 10 incidents, only if usage justifies it.
• Wave 3: the remaining ones, selectively (several of the original 20 need reframing, see section 7.3).
3. Key decisions (with recommendations)
• D1 - Where incident content lives. Recommended: static files in the client repo (client/src/data/debuglab/<id>/), lazy-loaded per incident. The server stores only progress. Pros: no seeding, tests live next to the code they test, content ships with deploys. Con: solutions are inspectable in the bundle, which is acceptable for a self-study tool.
• D2 - Verification. Tests run in the user's browser, so 'solved' is self-reported. That is fine for a progress tracker. Do not add leaderboards or public badges without server-side verification.
• D3 - Editor. CodeMirror 6, lazy-loaded. Not Monaco.
• D4 - Language and module style. JavaScript, CommonJS (require, module.exports) so incidents look like real Node code.
• D5 - Determinism. Virtual clock and injected fakes; no assertions on real time, heap size or CPU.
• D6 - Isolation. A fresh Worker per run, a main-thread watchdog, a restrictive CSP on the worker script, and network globals deleted before user code runs.
• D7 - Navigation. Put DebugLab in the Navbar's 'More' list with a NEW badge. After the analyzer you will already have five primary links, which is too many.
• D8 - Devices. Desktop-first. On small screens show the dossier read-only with a 'best on desktop' notice.
4. Architecture
Catalog page  ->  Workspace page
                    |- Dossier (ticket, logs, hints)
                    |- Editor (CodeMirror, file tabs, test.js read-only)
                    '- Terminal (results, logs)

Run button -> useIncidentRunner (main thread)
                |- new Worker(sandbox.worker.js)   [fresh per run]
                |- watchdog timer: terminate() after 5 s wall clock
                '- postMessage({ files, testSource }) / onmessage(results)

sandbox.worker.js
  |- capture postMessage ref, delete fetch/XHR/WebSocket/etc.
  |- core: virtual clock + module resolver + test runner
  '- per test: fresh clock, fresh module cache, fresh fakes

Server (Express 5 + MongoDB): progress only
  GET /progress, PUT /progress/:id/draft, POST /progress/:id/solve ...
5. Sandbox engine specification
5.1 Worker lifecycle and protocol
• Create a new Worker for every run and terminate it after the result. This keeps state clean and makes a hang recoverable.
• Watchdog: the main thread starts a 5-second timer when it posts the job; on expiry it calls worker.terminate() and shows 'Execution timed out. Check for infinite loops or catastrophic regexes.'
• Messages: main to worker { type: 'run', files, testSource }; worker to main { type: 'result', results, logs } or { type: 'fatal', error }.
• Caps: at most 6 files, 20 KB per file, 60 KB total; at most 200 log lines and 20 KB of log text per run; the worker rejects larger jobs.
5.2 Isolation (threat model)
The code only ever runs in the user's own browser, so the real risk is not a hostile candidate; it is self-XSS: a user pastes 'a solution' from a stranger, and that code calls your API with the user's cookies (a same-origin fetch from a worker carries them). Defences, layered:
1. Delete fetch, XMLHttpRequest, WebSocket, EventSource, importScripts, BroadcastChannel, indexedDB, caches, Worker, SharedWorker from the worker global before loading user code.
2. Capture the real postMessage in a closure first, then delete it from the global so user code cannot forge results.
3. Serve the worker script with a Content-Security-Policy header containing connect-src 'none'. Verify in a real browser that this blocks fetch from the worker (this is the main open item for the Phase 1 spike).
4. Shadow setTimeout, setInterval, clearTimeout, clearInterval, Date.now and console through function parameters, so user code uses the virtual clock and captured logger automatically.
5. Make clear in the docs that this is not a security boundary against a determined attacker; it is protection for the PrepStack site and its users.
5.3 Virtual clock
• setTimeout and setInterval inside user modules schedule on a virtual clock; they never wait in real time.
• sim.settle() repeatedly yields one real macrotask (via MessageChannel, so all microtasks finish), then jumps virtual time to the next timer and fires it, until no timers remain. It stops with SIMULATION_LIMIT after 10,000 steps (infinite timer loops).
• sim.until(promise) runs settle() alongside the promise and returns its value. Always use it in tests: awaiting a virtual-time call without advancing the clock hangs forever (this bit my own prototype).
• Also provide sim.now() (virtual ms) and sim.random() (seeded, deterministic) for incidents such as retry jitter.
• A test that finishes with promises still pending is a deadlock detector: after settle(), if a promise never resolved, report 'deadlock: operation never completed'. This makes the transfer-deadlock incident testable.
5.4 Module resolver and injected built-ins
• CommonJS require over the in-memory file list: relative paths, .js optional, circular imports allowed (register the module before executing it, as Node does).
• Injected modules (a small set, written once): events (a tiny EventEmitter with listenerCount), crypto (a deterministic fake HMAC and a timingSafeEqual shim that records calls), util, and sim. No fs, http, net or child_process.
• Unknown modules throw Cannot find module 'x', with a hint listing what is available.
5.5 Test API
test('name', async ({ require, sim, spy }) => { ... });
assert(cond, message);  assert.equal(a, b);  assert.deepEqual(a, b);
await assert.rejects(promise);  assert.throws(fn);
const calls = spy.wrap(obj, 'method');   // calls.count, calls.args
• Tests are registered once; each test then runs with a fresh clock, fresh module cache and fresh fakes.
• Result shape: { name, passed, error?, durationVirtualMs }.
• Failure messages must show expected versus actual in plain words ('paid out $100 from a $60 wallet').
5.6 What cannot be measured, and the substitute
Real heap, real timing and CPU cannot be asserted reliably in a browser. Use counters instead: listener counts, outstanding timers (clock.pending()), query-count spies, a fake stream that counts buffered bytes, a fake cursor that counts documents held, and virtual elapsed time.
6. Incident authoring standard
Content quality decides whether this feature is good or embarrassing. Every incident follows this contract.
6.1 Folder layout
client/src/data/debuglab/inc-01-wallet-double-spend/
  meta.json         id, title, track, severity, difficulty, estMinutes, tags, prepstackLinks
  files/            editable files (starting, buggy state) + test.js (read-only)
  ticket.md         customer-facing outage report
  logs.txt          telemetry and stack traces
  hints.json        tier 1 (directional), tier 2 (architectural)
  solution/         reference fix files
  variants/         wrong-fix/ and alt-fix/ files used only by the validator
  postmortem.md     root cause, timeline, why it happens in production, the fix, further reading
6.2 The validator (runs in CI, blocks merges)
A Node script runs every incident and enforces:
1. The buggy version fails at least 2 tests, including the one that captures the symptom.
2. The reference solution passes all tests.
3. Every variants/alt-fix/* (other valid solutions) passes all tests.
4. Every variants/wrong-fix/* (plausible but wrong fixes) fails at least one test.
5. Results are identical across 200 runs.
6. A full run takes under 200 ms; no real timers, no real Date, no network.
7. Size limits: each file at most 80 lines, whole incident at most 250 lines; stated difficulty and estimated minutes present.
6.3 Test design rules (learned from the prototype)
• Assert invariants and behaviour (money paid out never exceeds balance), not implementation details (did you call lock()).
• Add a liveness test so 'reject everything' style fixes fail.
• Accept multiple valid fixes; write at least one alternative solution to prove it.
• Isolate every test; never rely on state left by an earlier test.
• Make failure messages teach: say what was observed and what was expected.
7. Incident catalogue
7.1 MVP (4 incidents, SDE-1 level)
INC-01 Flash-sale wallet double spend (P1, concurrency). Files: walletService.js, db.js, test.js. Bug: check-then-act across an await. Tests: exactly one of two $50 withdrawals on $60 succeeds; money paid out never exceeds balance; two $20 withdrawals both succeed (liveness); a sequential withdrawal still works. Valid fixes: per-wallet promise-chain mutex; atomic conditional debit in db.js; version check with retry. Wrong fixes: global busy flag, re-reading balance after the write, adding a delay. Prototype-verified.
INC-02 The N+1 dashboard waterfall (P2, database). Files: dashboardController.js, projectRepo.js (fake database that counts queries and adds 20 ms virtual latency each), test.js. Bug: one awaited query per project inside a loop. Tests: output identical; at most 2 queries (spy); virtual elapsed time at most 60 ms; empty list works; order preserved. Valid fixes: one batched $in query plus an in-memory join. Wrong fix: Promise.all over 50 queries (latency drops, database load does not; the post-mortem explains why batching still matters).
INC-03 The listener leak (P1, Node internals). Files: server.js, metrics.js (shared emitter), test.js. Bug: each request adds a metric listener and never removes it. Tests: after 1,000 requests that close, listener count is back to the baseline; while a request is open it receives events; after it closes it does not; a second long-lived subscriber keeps working. Valid fixes: remove on close, once, a single fan-out listener. Wrong fixes: removeAllListeners (breaks the other subscriber), setMaxListeners(0) (hides the warning, count still wrong).
INC-04 The parallel refresh lockout (P1, auth). Files: apiClient.js, tokenService.js (fake server that rotates refresh tokens and revokes the session on reuse), test.js. Bug: four parallel requests with an expired token trigger four refresh calls. Tests: exactly one refresh call; all four requests succeed with the new token; the session is not revoked; if the refresh fails, all four reject and the next request starts a fresh refresh; a later expiry refreshes again. Valid fix: share one in-flight refresh promise and clear it when settled. Wrong fixes: caching the token forever; serialising refreshes (still reuses the old token). This one mirrors the pattern in PrepStack's own axios.js, which is a good talking point.
7.2 Wave 2 (to reach 10)
• Lost update with version check and retry (optimistic concurrency).
• Payment idempotency key with STARTED and COMPLETED states.
• Retry storm without jitter (assert spread of retry times with the seeded sim.random).
• Cache stampede fixed with single-flight (assert one backend call).
• Prototype pollution in a deep merge.
• Timing-unsafe signature compare (spy on the injected timingSafeEqual).
7.3 Wave 3 (remaining, only if metrics justify)
• Feasible with the same engine: transfer deadlock (detect via pending promises), circuit breaker (virtual clock), cache-aside invalidation race, session fixation, stream backpressure (fake writable with a high-water mark), timer leak (assert outstanding timers are zero), multi-document write rollback (fake database with sessions), cursor streaming (fake cursor that counts documents held), ReDoS (the watchdog reports a timeout).
• Reframe or cut: the unindexed-sort memory spill (#18). It depends on a real database's planner; a fake would teach the fake. Turn it into a non-code multiple-choice 'which index would you create' question, or drop it.
• Rewrite any incident whose original description relied on real heap or timing measurements.
8. Backend plan
The server only stores progress. It never runs user code. All code below follows PrepStack's real conventions: CommonJS, sendSuccess and AppError, authMiddleware, zod v4 (error: messages, not required_error), and atomic updates (the load-modify-save pattern caused the problems listed in Report 1, B3 and S5).
8.1 Files
server/src/models/incidentProgress.model.js
server/src/data/debuglabRegistry.js        list of valid incident ids (id, title, track, severity)
server/src/validators/debuglab.validators.js
server/src/controllers/debuglab.controller.js
server/src/routes/debuglab.routes.js       mounted at /api/debug-lab
8.2 Model
const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 60 },
  content: { type: String, required: true, maxlength: 20000 },
}, { _id: false });
const incidentProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  incidentId: { type: String, required: true, maxlength: 60 },
  status: { type: String, enum: ['in_progress', 'solved'], default: 'in_progress' },
  draftFiles: { type: [fileSchema], default: [], validate: (v) => v.length <= 6 },
  attempts: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  timeSpentSeconds: { type: Number, default: 0 },
  bestTimeSeconds: { type: Number, default: null },
  solvedAt: { type: Date, default: null },
  lastRunAt: { type: Date, default: null },
}, { timestamps: true, toJSON: { transform: (doc, ret) => { delete ret.__v; return ret; } } });
incidentProgressSchema.index({ userId: 1, incidentId: 1 }, { unique: true });
Changes from the old plan: no unattempted status (no document means unattempted); no redundant single-field indexes (the compound index already covers userId); size limits on every field.
8.3 Endpoints (all behind authMiddleware)
• GET /api/debug-lab/progress: one lightweight entry per incident (status, attempts, best time), no code.
• GET /api/debug-lab/progress/:incidentId: includes draftFiles.
• PUT /api/debug-lab/progress/:incidentId/draft: body { files, elapsedSeconds, ran? }. One findOneAndUpdate with upsert, $set: { draftFiles }, $max: { timeSpentSeconds } (monotonic, so a stale client cannot reset it), and $inc: { attempts: 1 } plus lastRunAt when ran is true.
• POST /api/debug-lab/progress/:incidentId/solve: body { elapsedSeconds, hintsUsed }. Sets status: 'solved', $min: { bestTimeSeconds }, $max: { hintsUsed }; sets solvedAt only if it is still null (a separate updateOne with solvedAt: null in the filter).
• DELETE /api/debug-lab/progress/:incidentId/draft: resets the draft (keeps solved status and stats).
8.4 Rules
• Validate incidentId against the registry before any write. This avoids the junk-document problem found in the sheets endpoints (Report 1, B3). Add a CI check that the registry matches the incident folders in the client.
• Validators (zod v4): at most 6 files, file name pattern like walletService.js, content at most 20,000 characters, total at most 60,000, elapsedSeconds an integer from 0 to 86,400.
• Body limit: set express.json({ limit: '100kb' }) on this router explicitly.
• Rate limits: per-user key (like aiProjectLimiter): about 120 draft saves per minute and 30 solves per minute, Redis-backed if you completed that fix.
• Cascade and stats: add IncidentProgress to the shared deleteUserData helper; add incidentsSolved to getDashboardSummary and getUserStats.
• Legal: mention saved code drafts in the Privacy Policy and the delete-account dialog.
9. Frontend plan
9.1 File map
client/src/pages/DebugLab/DebugLab.jsx             catalog
client/src/pages/DebugLab/IncidentWorkspace.jsx    three-pane workspace
client/src/pages/DebugLab/components/              IncidentCard, TrackSection, Dossier, EditorPane,
                                                   FileTabs, TerminalPane, TestResultCard, HintPanel,
                                                   PostMortemModal, TimerBar
client/src/hooks/useIncidentRunner.js              worker lifecycle, watchdog, results
client/src/hooks/useDebugLabProgress.js            fetch progress, autosave, solve
client/src/api/services/debugLabService.js         uses the shared api instance
client/src/debuglab/sandbox.worker.js              worker entry (loads core)
client/src/debuglab/core.js                        engine (Appendix A)
client/src/data/debuglab/<incident-id>/            content (section 6.1)
9.2 Routing and navigation
• In app.routes.jsx: lazy DebugLab and IncidentWorkspace, routes /debug-lab and /debug-lab/:incidentId, inside MainLayout, wrapped in ProtectedRoute.
• In components/Navbar.jsx: add to exploreLinks with a NEW badge (not mainLinks).
• Use PrepStack's own colour palette. Do not reuse the SkillBridge token classes (they are not defined in PrepStack; see Report 3, section 6.3).
9.3 Catalog page
• Summary strip: incidents solved, current streak is optional, average solve time.
• Track sections with cards: title, severity badge (P1 red, P2 amber), difficulty, estimated minutes, tags, status.
• Filters: severity, status, track; search by title or tag.
• Wave 2 and 3 incidents appear as 'Coming soon' cards only if you want a roadmap; otherwise hide them.
9.4 Workspace
• Layout: left dossier (tabs: Ticket, Logs, Hints), centre editor with file tabs, bottom or right terminal. Resizable panes on desktop; stacked tabs on tablet; read-only dossier with a notice on phones.
• Editor: CodeMirror 6, JavaScript mode, line numbers, bracket matching, undo history. test.js is visible but read-only so users see exactly what is expected. Show a dirty marker per file and a 'Reset file' and 'Reset all' (with confirmation).
• Run flow (state machine): idle -> running -> passed | failed | timeout | error. Run with the button or Ctrl/Cmd+Enter. Disable Run while running; always terminate the worker at the end.
• Results: a card per test with expected versus actual; captured console.log output below; clear messages for timeout, syntax error and Cannot find module.
• Autosave: write drafts to localStorage immediately (keyed by user and incident) and to the server with a 3-second debounce; on load, use whichever copy has the newer timestamp.
• Timer: a count-up stopwatch by default; an optional 25-minute countdown mode. Pause when the tab is hidden.
• Hints: two tiers, revealed one at a time; each reveal increments hintsUsed.
• Solved state: when all tests pass, call solve, show a short celebration and unlock the post-mortem.
• Post-mortem modal: root cause, timeline, 'why this happens in production', a diff of buggy versus reference code (a small diff library), and links to PrepStack content (for example /roadmaps/backend, /notes/os).
• Accessibility: keyboard-reachable panes, aria-live region for test results, visible focus, colour is never the only status signal.
9.5 Edge cases to handle
• Syntax errors in user code (show the message; line numbers are limited with new Function, so consider a quick pre-parse in a later iteration).
• Deleted or renamed files, empty files, files over the size cap.
• Very large console.log output (truncate), and unhandled promise rejections inside user code (report as a failed test, not a crash).
• Offline or failed autosave (keep local draft, show a small 'not synced' indicator).
• Browser without module-worker support (show a clear message).
10. Security and privacy checklist
• No user code ever runs on the server.
• Worker isolation as in section 5.2, with the CSP header and deleted network globals verified in real browsers.
• Server caps on file count and size; incidentId checked against the registry; per-user rate limits; explicit body limit.
• Saved code is personal data: include it in account deletion and in the Privacy Policy.
• Incident content contains no real secrets, hostnames or customer data; use obviously fake values.
• Do not trust solve for anything public. If leaderboards or badges are ever added, add server-side verification first.
11. Test plan
• Engine unit tests (Vitest): the prototype cases (buggy fails, fixed passes, naive fix caught, alternative fix passes); per-test isolation; sim.until; SIMULATION_LIMIT; deadlock detection; module resolver (relative paths, circular imports, missing module).
• Incident validator: run in CI for every incident (section 6.2).
• API tests (supertest, mongodb-memory-server): registry validation, size limits, atomic upserts, monotonic time, solvedAt set once, ownership, cascade delete.
• Client tests: the runner hook with a mocked worker (success, failure, timeout, fatal error); autosave merge logic.
• Browser matrix (manual): Chrome, Firefox and Safari: worker starts, MessageChannel works, CSP blocks fetch, infinite loop is terminated, editor works with keyboard.
• Build checks: lint and build clean; confirm the editor and engine stay out of the main bundle.
12. Phased execution
Estimates are rough, for one developer.
• Phase 0 - Prerequisites: Report 1 fixes and the analyzer finished (test runner, CI, deleteUserData helper, theme decision exist).
• Phase 1 - Browser spike (1 to 2 days). A throwaway page: real Worker, watchdog, CSP header, deleted globals, CodeMirror, INC-01 end to end. Go/no-go: works in Chrome, Firefox and Safari; infinite loop terminated; fetch blocked; editing feels fine. If not, stop here, having spent two days.
• Phase 2 - Engine package (3 to 4 days). Productionise Appendix A: timer shadowing, events and crypto shims, spies, seeded random, deadlock detection, result protocol, caps, unit tests, validator CLI.
• Phase 3 - Backend (1 to 2 days). Section 8, with API tests.
• Phase 4 - Frontend (5 to 7 days). Catalog, workspace, runner hook, autosave, hints, post-mortem, routing, Navbar, responsive behaviour, accessibility.
• Phase 5 - MVP content (4 to 6 days). INC-01 to INC-04, each through the validator, with tickets, logs, hints, post-mortems.
• Phase 6 - Polish and release (2 to 3 days). Browser matrix, copy and legal text, README, feature announcement, monitoring of server errors.
MVP total: about 16 to 23 working days. Wave 2 (six more incidents) adds about 6 to 9 days. Wave 3 only after the metrics below justify it.
13. Metrics for deciding what to build next
You do not need a separate analytics product; IncidentProgress already records most of it.
• Share of active users who open at least one incident within four weeks (suggested target to expand: 15 percent or more; adjust to your traffic).
• Attempt-to-solve rate per incident and median solve time (too easy under 3 minutes, too hard if under 20 percent solve).
• Hint usage per incident and drop-off point (opened but never ran).
• Repeat usage: users who solve a second and third incident.
• Support signals: bug reports about the sandbox, and tests that users report as unfair.
If fewer than a handful of users reach a second incident, improve the first four before writing more.
14. Risks and mitigations
• Content cost is the real cost. Mitigation: ship 4, enforce the validator, measure, then expand.
• Flaky or unfair tests. Mitigation: determinism check in CI, behaviour-based tests, alternative and wrong-fix variants, a visible 'report an issue with this test' link.
• Browser differences. Mitigation: Phase 1 spike across all three browsers before any other work.
• Self-XSS from pasted code. Mitigation: layered isolation (section 5.2), plus a visible warning: 'Only run code you wrote or understand.'
• Perceived difficulty for beginners. Mitigation: SDE-1 level first, graded hints, estimated time shown on every card.
• Maintenance burden of the engine. Mitigation: keep it small (about 100 lines of core), well tested, with no dependencies.
• Scope creep (AI feedback, leaderboards, more languages). Mitigation: explicit non-goals until the metrics support them.
15. Definition of done (MVP)
• Four incidents pass the validator in CI; each shows a ticket, logs, two hints, editable files, a read-only test file and a post-mortem.
• A user can edit, run, see exact failures, fix the bug, see all tests pass, mark it solved, and read the post-mortem.
• Drafts survive reloads and devices; time and attempts are recorded; progress appears in the catalog and dashboard.
• Infinite loops are terminated; network access from user code is blocked in Chrome, Firefox and Safari.
• Account deletion removes all IncidentProgress; the Privacy Policy mentions saved code.
• Lint, build and all tests pass; the editor and engine are lazy-loaded; no new critical or high audit findings.
Appendix A. Engine core (prototype code)
This is the exact code the prototype ran (in Node), with browser-safe pieces. It passed: the buggy wallet fails both tests, the fixed wallet passes both, a naive 'busy flag' fix is caught by the liveness test, an alternative atomic-debit fix passes, and 200 repeated runs gave identical results. Not yet covered by the prototype: shadowing setTimeout, setInterval and Date.now for user modules, the events and crypto shims, spy, seeded random, and deadlock detection (all described in section 5 and built in Phase 2).
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
Example test file for INC-01
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

