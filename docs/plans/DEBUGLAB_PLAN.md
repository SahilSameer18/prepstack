# DebugLab - Build Plan v3

**STATUS: NEXT AFTER MY PLAN FIXES. Owner confirmed this implementation order on 23 Nov 2026.** Finish and verify the remaining My Plan fixes first, then start DebugLab Phase 0 and the isolation spike. No DebugLab implementation or security approval is complete. Purchasing services, deployment and pilot recruitment remain separate decisions. This owner instruction supersedes the earlier parked priority and unrelated launch/improvement prerequisites; old Report 1/3 references do not establish readiness.

Prepared 15 Oct 2026; v2 dated 10 Nov. This revision replaces v2's unsafe execution guidance and defective engine sketches rather than retaining them as implementation templates.

## 0. Revision scope and evidence

This update incorporates the supplied DebugLab audit. Its competitor observations and prototype experiments were not independently rerun for this documentation change. Repository contracts checked directly: the global parser in `server/src/app.js`, `user` ownership discovery and `wipeUserData` in `server/src/modules/user/user.controller.js`, and pipeline options in `server/src/modules/sheets/problemProgress.js`.

| Audit finding | Revised requirement |
|---|---|
| Comparable products exist | Honest positioning and evidence limits (1) |
| Interview formats overstated | Source limits; untimed default (1, 2) |
| Same-origin worker retains capabilities | Separate runner site and blocking deployed isolation spike (3) |
| Timer/Date/hrtime prototype defects | Small simulator contract, not Node compatibility (4) |
| Cart percentage example is not a real bug | Fixed coupon, integer cents, explicit rounding (Appendix C) |
| Wallet tests accept incorrect debits | Observable balance/ledger and useful completion (Appendix D) |
| Pipeline enablement omitted | Explicit Mongoose option and validated literals (6) |
| Ownership/deletion names wrong | `user` references and existing deletion discovery (6) |
| Larger router parser runs too late | Scoped parser before global parser; byte budgets (6) |
| Timestamp draft merging loses edits | Revision checks, conflicts and reset tombstones (7) |
| Pilot omits Repo | Warm-ups plus one Repo and one Incident (9) |
| Metrics lack supporting writes | Deduplicated attempt/run records from pilot onward (6, 10) |
| Passing tests is not skill transfer | Explanation and unfamiliar follow-up (5, 10) |
| PrepStack integration underspecified | Explicit planner, review and Analyzer contracts (8) |
| Estimate arithmetic incorrect | Historical 24-35 days; re-estimate after spike/slice (9) |

Historical Node repeatability, Chrome CSP probes and editor bundle measurements are background observations only. They do not establish cross-browser isolation, production fidelity or the revised schedule. Repeating the same schedule 200 times checks reproducibility, not concurrency coverage.

## 1. Positioning, alternatives and interview evidence

**Guided debugging practice connected to your interview preparation.** Original reviewed exercises and a useful learning loop are proposed differentiators. Do not claim a unique category, first platform, verified production experience, interview-readiness percentage or guaranteed success.

The supplied audit reported the following public-page comparisons; these are not completed authenticated competitor assessments or independently refreshed feature claims:

| Alternative | Reported overlap |
|---|---|
| [BrokenRepo](https://brokenrepo.tech/) | Browser repos, hints, tests and progress; close to Repo tier |
| [Recticode](https://www.recticode.com/) | Local multi-file payment/race debugging; Repo/Incident overlap |
| [Errloom](https://github.com/OSP06/errloom) | Browser incident simulations, logs and explanations |
| [Debug React](https://debugreact.com/) | Debugging, explanation and proposed-patch review |
| [BrokenCode](https://www.brokencode.in/) | Fault identification and explanations; Warm-up overlap |
| [Codewars debugging collection](https://www.codewars.com/collections/debugging-problems) | Established short debugging exercises |
| [SadServers](https://sadservers.com/) | Adjacent live Linux/DevOps troubleshooting |

Recheck details before competitive marketing; do not copy challenges. Reviewing an AI patch is also an existing concept, not a uniqueness claim.

Primary sources read for this revision:

- [Stripe's engineering guide](https://stripe.com/guides/atlas/scaling-eng) describes Bug Squash using a historical open-source bug. This supports debugging practice, not a universal current interview round, fixed duration or SQL requirement.
- [Mongoose 9 migration guide](https://mongoosejs.com/docs/migrating_to_9.html) explains pipeline enablement and the absence of pipeline casting.
- [MDN worker IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/indexedDB) documents worker storage access. Deleting an own property is not proof an inherited capability disappeared.
- [MDN iframe reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe) informs sandbox/origin decisions; it does not certify the proposed runner.

The [Amazon university SDE OA page](https://www.amazon.jobs/content/en/how-we-hire/university/sde-oa) could not be retrieved in this revision because its redirect failed. The supplied audit found no support for the old seven-snippets/20-minute attribution; remove that attribution. Google/Meta details from secondary reports are not build requirements. Optional timed practice needs no employer claim.

## 2. Product scope and decisions

A tier is an exercise type; a wave is a release stage. Challenge means any playable item; Incident means Tier 3 only.

| Tier | Learner task | Proposed authoring scope |
|---|---|---|
| Warm-up | Repair a focused bug against a short specification | One small file; visible behavior tests |
| Repo | Understand an unfamiliar small app and repair several bugs | Up to eight files; explicit behavior contracts |
| Incident | Diagnose symptoms/logs, test a hypothesis and repair a simulated failure | Up to six files; controlled reproduction and post-mortem |

- JavaScript first, with a documented CommonJS-like in-memory loader. This is a teaching simulator, not Node.js, a real database or a live production environment.
- Untimed practice is the default in every tier. Timing is optional; distinguish timed and untimed records and active practice from elapsed time. A later seven-question/20-minute preset is not an employer format claim.
- Browser execution only; never run submitted code on the API server. Bundled tests and solutions remain inspectable even when withheld in the interface.
- Private self-reported results; no public leaderboard, certificates or hiring score. A short reference fix is guidance, not a line-count grading rule.
- Reuse one engine across tiers and lazy-load the editor/workspace. Inspect existing components before adding dependencies.
- Desktop/laptop editing first. Small screens need readable content and honest editing limitations, without overflow. Keyboard accessibility is required.
- No AI grading, extra languages, full Node/browser emulation or large catalogue in the pilot.

## 3. Isolation: blocking design gate

### Candidate architecture

Trusted PrepStack editor -> restricted cross-site runner frame -> fresh disposable worker for each run. The app owns authentication, drafts, persistence and an external watchdog; the runner receives only bounded exercise inputs.

**Do not execute learner code in an authenticated PrepStack-origin worker.** CSP, shadowed globals and deleted properties are defense in depth, not a security boundary. A function wrapper does not contain hostile JavaScript.

Propose a dedicated HTTPS runner site with no shared credentials, cookies, sensitive storage or privileged endpoints. Prefer a separate registrable domain to avoid shared cookie scope. Do not add it to authenticated API CORS permissions or send account tokens. Hosting is a candidate design to prove, not already purchased or approved infrastructure.

Test an opaque-origin sandboxed frame first; worker creation/loading may prevent that design. An origin-preserving frame on the separate site is a possible fallback only after passing the same security checks. Never fall back to the authenticated app origin. Record actual iframe permissions, URLs, allowed imports and document/worker headers before continuing.

Confine any dynamic-compilation permission to the runner; never weaken the main app CSP. Deny network and unnecessary script sources with deployed policies. Preload trusted assets; learner-selected remote imports/packages are unsupported. Test same-origin imports explicitly: allowed runner assets must contain no app credentials or sensitive services.

### Protocol and resource contract

- Validate source window, expected origin where available, run/session IDs and exact message shape. Pin a transferred MessagePort to the intended frame/run. An opaque frame's `null` origin alone is not trustworthy.
- Nonces prevent routing mix-ups, not forged success reports. Treat all output/results as untrusted self-reports; never interpret messages as privileged commands.
- Never evaluate returned data or insert it as HTML. Ignore stale messages after navigation/reset. Bound payloads, pending timers, simulated steps, logs and message frequency.
- Keep the watchdog outside the worker. Terminate on timeout, cancel, errors and navigation; create a fresh worker/module registry for the next run.
- A worker is not a guaranteed browser-wide memory quota. Test allocation/message floods and document residual browser denial-of-service limits.

### Required deployed spike matrix

Run Chrome, Firefox and Safari with actual deployed headers and record versions/policies:

1. Legitimate compilation, trusted assets, normal tests and external termination work.
2. Fetch, XHR, WebSocket, EventSource, dynamic imports and `importScripts` cannot reach external canary endpoints. Record behavior of same-origin imports too.
3. Probe `globalThis`, prototypes, IndexedDB, Cache Storage, cookies, nested workers and exposed SharedWorker/BroadcastChannel/service-worker capabilities. Prove PrepStack storage canaries cannot be read/modified; prevent unwanted runner persistence.
4. Forged/stale messages, huge output, log floods, infinite loops and unresolved promises cannot authorize app writes; ordinary navigation recovers after termination.
5. Test parent access, navigation, forms, popups and unwanted permissions; runner mechanisms cannot make authenticated API requests.
6. Main app CSP remains intact; unsupported/error states are usable.

**Exit: reproducible probes and a written pass/fail matrix. App-origin access or uncontrolled network capabilities block the pilot.** Revise the design or reduce scope when it fails; a disclaimer is not a fix.

## 4. Simulator contract; executable prototype withdrawn

Expose only reviewed APIs required by exercises: in-memory modules, bounded console, assertions/spies, seeded randomness and a small `sim` API (`now`, `delay`, `until`). List every import and behavior. Unsupported modules fail explicitly; no fs, network, child processes or real secrets.

- Virtual time is not CPU performance. Fixture query/listener/operation counters are not real database throughput, heap measurements or cryptographic timing evidence.
- If timer APIs are exposed, define ordering, cancellation and intervals. A zero-delay interval must repeat until cancelled/budget exhaustion or be explicitly unsupported; it must not silently become one-shot through a truthiness check.
- Omit Date/process shims until needed. If exposed, test `Date()` returning a string, constructed Dates and `Date.now()` separately. For simulated 1,500 ms from zero, normalized `hrtime` is `[1, 500000000]`: 1,500 ms = 1 s + 500,000,000 ns. Test previous-tuple subtraction/bigint if supported.
- Define native promise/microtask interaction and same-time ordering. Pending work must complete, fail meaningfully or be terminated, never pass unresolved.
- Use distinct forced schedules and seeded schedules for races. Repeating an identical seed checks repeatability only. Record seed/order/version on failures.
- Fresh module state per run; allowlisted relative paths, explicit circular-import policy and useful source filenames. No claim of exact Node compatibility.

The former engine code is removed as an implementation blueprint. Implement these contracts during the spike/slice and test each exposed capability before using it in content.

## 5. Authoring, assessment and catalogue

Registry metadata: stable ID, immutable `contentVersion`, tier, prerequisites/concepts, editable file inventory, fixture API, visible/withheld tests, hint ladder and solution/post-mortem references. Validate every ID/link and declared size. Publish changed behavior under a new version; never silently reinterpret saved results.

Each challenge requires:

1. A precise behavior contract, reproducible broken baseline and simulator limitations.
2. Bug-specific and keep-working tests. Declare loader/prerequisite dependencies; test each bug independently after prerequisites are repaired.
3. A reference solution and a structurally different correct implementation. Grade behavior rather than exact patch, line count or chosen lock technique.
4. Plausible wrong fixes that must fail: hard-coded answers, removed validation, disabled work, swallowed errors and challenge-specific shortcuts.
5. Safety AND useful completion for concurrency, including observable fixture state and multiple controlled interleavings.
6. Staged hints and a post-mortem explaining cause, evidence, repair and regression risk. Withheld tests are hidden in the UI, not secret.
7. Brief symptom/hypothesis/root-cause/self-review prompts and an unfamiliar follow-up. No AI grading is needed to gather evidence of understanding.

Run reviewed fixtures in disposable workers/processes with external timeouts in the authoring validator; never accept end-user submissions into CI or the API runtime. Broken baseline fails, both correct solutions pass, all wrong variants fail. Hardware/browser-specific performance budgets must be measured; remove the blanket 200 ms promise.

**Pilot proposal:** three representative short warm-ups, one complete Cart Repo and one Wallet Incident, plus an unfamiliar follow-up. Selection and size are assumptions to validate. The other Appendix B exercises remain candidates, not discarded content.

Later MVP candidates: seven warm-ups, two repos (cart, rate limiter), four incidents (wallet race, N+1 queries, listener leak, parallel token refresh). Counters illustrate N+1/leaks without pretending to measure a production environment. Caching/retry/pagination/stale-state/resource-cleanup challenges and additional languages wait for evidence and reviewed contracts.

## 6. Backend, payloads and telemetry

Use `server/src/modules/debuglab/` and existing shared HTTP/auth conventions when a build is authorized. Inspect actual frontend route/layout files then; obsolete v2 paths are not a migration instruction. No API-side execution service.

### Owned data

All owned models use `user` with `ref` to the existing user model, matching current deletion discovery and `wipeUserData`. Do not invent a `userId` ownership field or `deleteUserData` helper.

| Proposed model | Purpose and index |
|---|---|
| ChallengeProgress | Summary and optional draft revision/tombstone; unique `(user, challengeId, contentVersion)` |
| DebugLabAttempt | Minimal bounded attempt/run observations; unique `(user, attemptId)` |
| WarmupSetResult | Optional set summaries; unique `(user, setId, contentVersion, mode)` |

Test account deletion for every new model in both existing deletion paths. All reads/writes are owner-scoped; ignore supplied ownership. Store no code/log copy solely for analytics. Private explanation storage, if added, needs its own retention/consent decision.

Proposal: retain at most 200 recent attempt sessions per owner plus lifetime summary counters, with bounded run metadata inside each attempt. Review this policy before the pilot, disclose it and never compute historical cohort metrics from a truncated window without stating the limit.

### Proposed personal API, all authenticated

| Route under `/api/debug-lab` | Contract |
|---|---|
| GET `/progress` | Owned versioned summaries/drafts; private/no-store |
| POST `/challenges/:id/open` | Create/reuse a validated owner-scoped attempt ID with server timestamp |
| POST `/attempts/:attemptId/runs` | Deduplicated run start; required in pilot |
| PUT `/attempts/:attemptId/runs/:runId/result` | Record pass/fail/timeout/error once; retry-safe self-report |
| PUT `/attempts/:attemptId/hints/:hintId` | Record a valid hint once; no duplicate counter increments |
| PUT `/challenges/:id/draft` | Validated editable file map, expected revision and content version |
| DELETE `/challenges/:id/draft` | Revision-checked reset; advance revision, preserve tombstone |
| POST `/sets/:setId/results` | Optional mode-separated summary of identified attempts |

Identical retries return existing results without incrementing counters. Conflicting reuse of an ID returns 409. Validate/bound IDs, attempt/run counts, mode/version and file inventory; do not let learners replace fixture/test files. A new practice session gets a new attempt ID. Draft saves are not run attempts. Pilot telemetry includes open/run/result/hints rather than unsupported open/solve-only metrics.

Prefer ordinary atomic updates where sufficient. Necessary pipelines explicitly use `updatePipeline: true` and `returnDocument: 'after'`. Validate/cast all inputs first; Mongoose does not cast pipelines. Construct only allowlisted fields and use `$literal` for validated values that must not be interpreted as aggregation expressions. Never splice request bodies into MongoDB stages.

Save first solve time once, keep status monotonic per mode/version and count unique sessions/runs once. Avoid null-default minima for best time. Derive summaries from deduplicated records or use a tested transaction; a crash/retry between writes must not double-count. Handle a known unique-index first-create race with a bounded retry, not blanket retries on database errors.

### Byte limits and parser order

Proposed starting budgets, to validate in the spike (KiB = 1,024 bytes):

| Tier | Files | Per-file source | Total source | Logs: count / text |
|---|---:|---:|---:|---:|
| Warm-up | 1 | 8 KiB | 8 KiB | 50 / 5 KiB |
| Repo | 8 | 20 KiB | 80 KiB | 200 / 20 KiB |
| Incident | 6 | 20 KiB | 60 KiB | 200 / 20 KiB |

Use UTF-8 bytes (`Buffer.byteLength`, `TextEncoder`), not string length. Bound filenames, file/message count and serialized envelope separately. Proposed JSON transport limit is 512 KiB including escaping and metadata; preflight the actual serialized body. Keep one canonical policy across client/server.

The current global `express.json()` runs before routers. A larger parser installed only inside the later DebugLab router cannot override it. Install the scoped DebugLab parser BEFORE the global parser, preserving subsequent cookie/auth/CORS/route behavior; prove ordering through HTTP tests. Do not increase every API's limit.

Test a valid >100 KiB DebugLab envelope within source limits, Unicode, JSON-escaping-heavy text, exact/over source and transport boundaries, malformed JSON and unchanged non-DebugLab limits. Use clear 400/413/422 responses. Reuse rate-limit infrastructure and bound draft/run writes; tune quotas from evidence.

## 7. Drafts and frontend behavior

Do not choose competing drafts by client timestamps.

- Atomically match owner/challenge/contentVersion and expected `draftRevision`, then increment revision. Stale updates return 409/current revision. First-create races cannot overwrite an existing draft.
- Serialize saves per challenge: one request in flight, newer edits coalesced into the next request. Ignore stale responses and expose Saving/Saved/Offline/Conflict states. Never discard unsaved text on failure.
- Conflicts preserve both copies for explicit review/copy/export/merge. A timeout does not prove the write failed; read current revision/state before replaying a potentially applied write.
- Reset advances revision and retains a tombstone so stale offline saves cannot resurrect old text. A content-version change offers old-draft export and a new-version draft, without silently applying incompatible edits.
- In-memory drafts suffice for the pilot. Server/offline drafts follow only after revision tests pass. Browser persistence, if added, is opt-in on shared computers, owner/challenge/version scoped and cleared through existing logout/account-switch handling.
- Lazy-load editor and runner; send exercise code to the runner only when Run is selected. Public reading uses static data; authenticated workspace/saving follows current route policy. Signed-out pages never call personal APIs.
- Keyboard controls, visible focus, editor shortcuts, file tabs, safe output announcements, modal focus return and narrow-layout overflow need browser review.
- Handle loading, cancel, pass/fail, timeout, runner unavailable and failed persistence. A successful local run with a failed save must remain visible and must not say Saved. Keep mode/version labels explicit.

## 8. PrepStack integration, separately approved after pilot

Proposed loop: **learn a concept -> debug -> explain -> attempt an unfamiliar follow-up.** Integration is proposed scope, not an existing differentiator or automatic release commitment.

- Map registry concepts/prerequisites to real notes and roadmap IDs; validate links and offer relevant lesson/follow-up references.
- My Plan uses explicit versioned challenge references and estimated minutes. Preview capacity/deadline effects, preserve completed work and require confirmation through existing change flows. Never silently insert practice or replace tasks.
- Opening/running/passing a familiar exercise does not automatically advance a review ladder. Define later recall/follow-up policy separately; prevent duplicate credit and distinguish source tasks from later practice episodes.
- Today remains unchanged: today's items, needed time and one Start. Put explanations, results and settings in detail surfaces/other tabs.
- Analyzer links require registry-validated skill mappings; no suitable challenge means no link, not invented content.
- Test legacy/archived plans, pause/resume, lower hours, version changes and failed previews before integration ships.

## 9. Execution phases and estimates

All phases remain unstarted. The owner authorized DebugLab as the next implementation priority after the remaining My Plan fixes are completed and verified. This does not authorize deployment, purchasing services or collecting pilot data.

| Phase | Work | Exit evidence |
|---|---|---|
| 0. Contracts | Recheck architecture; settle candidate threat model, fixture APIs, ownership, attempts and byte budgets | Reviewed contracts and unresolved decisions |
| 1. Isolation spike | Prove cross-site frame/worker and deployed policies in three browsers | Reproducible security matrix; no app-origin fallback |
| 2. Vertical slice | One exercise end to end: safe run, owned attempts, retry-safe result, usable UI | Browser/API success/failure journeys; revised forecast |
| 3. Pilot content | Three warm-ups, one Repo, one Incident, unfamiliar follow-up | Correct alternatives/wrong variants and all validators pass |
| 4. Observed pilot | JavaScript-comfortable students and professionals; distinguish language gaps | Actual counts, comprehension and transfer observations |
| 5. MVP decision | Keep, revise or stop; selectively add catalogue/drafts/integration | Owner-approved scope based on evidence |

The old estimates sum to **24-35 working days**, not 20-30: (1-2) + (4-7) + (3-4) + (2-3) + (6-8) + (6-8) + (2-3) = 24-35. This historical arithmetic is not a forecast for the new boundary. Re-estimate after the spike/slice with reused versus new work separated, so pilot engine/content is not counted twice. Learner observation, hosting setup and decisions are separate calendar dependencies.

## 10. Pilot measures and growth decisions

A proposed five-to-ten-person observed usability sample is not representative proof. Include placement students and working professionals with enough JavaScript familiarity for the selected exercises; record syntax/tooling gaps separately from debugging difficulty.

| Question | Required denominator/evidence |
|---|---|
| Do people try it? | Unique openers / eligible people shown entry; record exposure or omit this rate |
| Can they start? | Attempts with Run / opened attempts in a matching versioned cohort |
| Can they finish? | Self-reported passing attempts / attempts with Run; separate hints/mode |
| Do they return? | Learners opening on a later server day / initial cohort with complete observation window |
| Do they understand? | Explanation rubric and unfamiliar follow-up observations, with actual counts |
| Is it usable? | Timeout/error/conflict observations split by browser/exercise/version |

Deduplicate retries and distinguish never-run, abandoned and unresolved-result attempts. Define one reporting timezone for later-day return; latest timestamp subtraction is insufficient. State sample size, missing data, observation window and retention truncation. No invented 10%/40%/25%/20% pass gates: agree any future threshold and rationale before collecting results.

Understanding means identifying cause, preserving behavior and transferring the concept; speed alone is insufficient. Language confusion suggests prerequisite/onboarding work; poor transfer suggests changing exercises. Additional languages, content and integrations require evidence and an owner decision.

## 11. Verification and release gates

- [ ] Deployed isolation matrix passes in Chrome, Firefox and Safari with exact headers/versions recorded.
- [ ] Auth, ownership, limits and actual parser order have HTTP tests.
- [ ] Installed-Mongoose pipeline behavior, first-create races, duplicate requests and summary recovery are tested.
- [ ] All new owned data is removed by account deletion; opted-in local data clears on logout/account switch.
- [ ] Supported draft saving handles reordered responses, offline replay, conflicts, resets and content versions without losing work.
- [ ] Broken baselines fail, distinct correct repairs pass and plausible wrong repairs fail; races test safety and useful completion.
- [ ] Pilot includes every tier and an unfamiliar follow-up; private results are labelled self-reported.
- [ ] Loading/error/empty states, keyboard/focus and responsive behavior receive browser checks.
- [ ] Privacy wording covers drafts, local execution, attempt retention and self-reported results before collection.
- [ ] Implementation close-out runs server/client tests, build and lint, recording actual evidence in status/testing docs.
- [ ] Owner approves deployment/pilot separately; this update sends no invitations and collects no learner data.

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

**w06 Floating-point rounding (toy inputs only)** (category: numbers)
```js
// Returns the cart total in dollars, rounded to 2 decimals.
function cartTotal(items) {
  return items.reduce((sum, it) => sum + it.price * it.qty, 0);
}
module.exports = { cartTotal };
```
Fix: `return Math.round(items.reduce((sum, it) => sum + it.price * it.qty, 0) * 100) / 100;`. Tests: `[{ price: 0.1, qty: 3 }]` gives 0.3; `[]` gives 0; `[{ price: 2, qty: 2 }]` gives 4.

The preceding rounding example is not a general money-handling recipe. The Repo challenge uses integer cents and an explicit rounding policy.

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
- Untimed practice is the default. A 20-minute set is an optional preset, without employer attribution. A set is "solved" for a snippet when all its tests pass.
- Do not name a company anywhere in set-01.

## Appendix C. Repo 01 - Shopping Cart service

Draft teaching contract, not tax advice. Implement and validate actual fixture files before shipping. Use integer cents throughout.

**Assumed rules:** nonnegative integer prices/quantities; fixed coupon capped at subtotal; coupon applied before tax; 8% tax rounded once to nearest cent (half up for nonnegative inputs); empty cart totals zero. Reject invalid values; never mutate input carts. Bound integer amounts so arithmetic remains safe.

Example: subtotal 10,000 cents; fixed coupon 1,000; taxable subtotal = 10,000 - 1,000 = 9,000; tax = 9,000 * 8 / 100 = 720; total = 9,000 + 720 = **9,720 cents**. The wrong tax-first calculation gives 10,000 + 800 - 1,000 = **9,800 cents**. A percentage-only discount and proportional tax commute without extra rules; the old example was not a valid bug.

Proposed faults: module/export failure, wrong fixed-coupon tax base, empty-cart reduction failure. Declare the loader dependency and test arithmetic/empty-cart bugs independently after repairing it. Keep-working tests cover no coupon, coupon above subtotal, quantities, input preservation, rounding boundaries and invalid inputs. Include distinct correct implementations and wrong variants: percentage substitution, tax-first, negative totals, omitted rounding and input mutation. No exact patch grading.

## Appendix D. Incident 01 - Wallet race and conservation

Draft simulator contract; the fixture API and checks still need implementation. This is not a banking engine or real database transaction system. Use integer cents and bounded safe amounts.

The trusted fixture exposes actual `readBalance(walletId)` and committed ledger entries to the harness. A returned success response alone is insufficient. Per wallet:

- Ending balance = starting balance - sum of committed debits.
- Balance never becomes negative, including intermediate committed states.
- Each successful request commits its requested amount exactly once; each committed debit corresponds to a successful request.
- Rejection changes neither balance nor ledger. Independent wallets make useful progress.

| Case, using fresh assumed fixtures | Required observation |
|---|---|
| Start 6,000; withdraw 5,000 | One success, balance 1,000, exactly one 5,000 debit. A 10,000 debit fails even if the response says success |
| Start 6,000; two concurrent 5,000 requests | Exactly one succeeds, balance 1,000, one debit, no negative intermediate balance |
| Start 6,000; two concurrent 2,000 requests | Both succeed, balance 2,000, two distinct 2,000 debits, no lost update |
| Start 6,000; request 7,000 | Rejected, balance 6,000, no committed debit |
| Rejection followed by affordable request | Later request succeeds; no stuck lock or permanent busy flag |
| Hold wallet A at a controlled fixture barrier; withdraw from B | B completes without releasing A; independent balances/ledgers remain correct |
| Multiple requests across wallets and controlled orders | Per-wallet conservation and defined useful completion; seed/order recorded |

Reject over-debit, no-debit success, double commit, lost update, reject-all/global-busy and stuck-lock patches. The cross-wallet progress requirement explicitly rules out globally blocking repairs; accept different synchronization techniques that meet the contract. Use controlled barriers, not fragile wall-clock timing assertions. Test multiple forced schedules plus seeded runs; repeating one schedule is not coverage.

At least one structurally different correct repair must pass. Specify the fake database's atomic/locking primitives before authoring; do not expect learners to implement real database transactions inside the simulator. The post-mortem separates observed simulation behavior from real multi-process/database guarantees.

---
