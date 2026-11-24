# DebugLab: Build Plan v4 (fresh start)

**Status:** proposal, nothing built. Written 24 Nov 2026 as a clean replacement for all earlier DebugLab plans.
**Owner goal:** make PrepStack the most useful place to prepare for the debugging, code-review, optimization and AI-assisted rounds that companies now run.

---

## 0. What this plan can and cannot promise

No tool can guarantee that someone cracks an interview. This plan commits to something narrower and checkable:

1. Practice that is as close as we can get to the real rounds (real stacks, real failing tests, think-aloud reasoning, optional timing).
2. Every exercise is verified before release, so learners never practise on a broken or ambiguous item.
3. A measurement loop (before/after diagnostic, follow-up tasks, learner-reported outcomes) so we can see whether it helps, and fix it when it does not.

No marketing claim of "guaranteed", "interview-ready %", "first platform" or "used by company X" is allowed. Company names appear only as **dated, evidence-labelled research notes**, never as endorsements or as the source of exercises.

---

## 1. Evidence: what the rounds look like (as of Nov 2026)

Source: `sde_interview_formats_by_company.md` (same repo `docs/research/`). Evidence labels: **Official**, **Press**, **Candidates** (anonymous reports, treat as indicative).

| Round type | Typical shape | Evidence |
|---|---|---|
| Bug bash / debugging | Unfamiliar repo with failing tests or an issue, 45 to 60 min, no AI (Stripe, DoorDash, Cloudflare, Braze) | Candidates |
| Fix, extend, optimize with AI | ~60 min, multi-file code, AI panel; phases: bug, feature, optimize (Meta, Google pilot, LinkedIn, Atlassian) | Meta/Google: Press; others: Candidates |
| AI-assisted repo OA | DSA plus a repo bug-fix task with an AI assistant (Amazon; Spring Boot, Django, MERN reported) | Candidates |
| Integration / extend a codebase | Implement a feature against an unfamiliar codebase or API (Stripe, Shopify-style) | Candidates |
| Code review / comprehension | Review a snippet or PR, find bugs, suggest optimizations (Google EM; Datadog option) | Candidates / Press |
| Machine coding (India) | ~90 min working mini-app (Flipkart, Razorpay, Swiggy, PhonePe) | Candidates |

**What interviewers say they score** (from public guides and company posts): forming and testing hypotheses, verifying with tests, small incremental fixes, explaining aloud, and in AI rounds, checking the AI's output critically.

**Known limits:** formats vary by team and change quickly; much of this evidence is from prep sites and anonymous posts. Recheck before every public claim.

---

## 2. Skills model (what DebugLab trains)

Each exercise is tagged with the skills it exercises. Progress is shown **per skill with evidence**, never as a single "readiness score".

| # | Skill | Observable behaviour |
|---|---|---|
| S1 | Reproduce | Gets a failing run or minimal repro before changing code |
| S2 | Read unfamiliar code | Finds the entry point, data flow and relevant tests |
| S3 | Hypothesize and isolate | States a cause and narrows with evidence (logs, breakpoints, bisecting) |
| S4 | Minimal, correct fix | Fixes the cause, not the symptom; keeps other behaviour |
| S5 | Verify and prevent regression | Runs tests, adds or reasons about edge cases |
| S6 | Communicate | Explains cause, evidence and trade-offs clearly |
| S7 | Review code / diffs | Spots defects, risks and missing tests in a change |
| S8 | Verify AI output | Finds what a plausible AI patch gets wrong; accepts, edits or rejects with reasons |
| S9 | Optimize | Finds the bottleneck from evidence, improves complexity or I/O, proves no behaviour change |

---

## 3. Product design: five tracks plus a mock round

### Track A: Spot the bug (static, no code execution)
- Short code (8 to 25 lines) in **Java, Python and JavaScript** (and later C++). The learner marks the faulty line(s), picks the cause from options, and reads an explanation.
- Trains S2, S3, S7. Zero security risk, ships first.
- Everyday bug themes from the taxonomy in Appendix B (off-by-one, falsy values, missing await, mutation, shared state, state bugs after removal/resizing, wrong HTTP/status handling, N+1 queries, off-by-one in pagination, etc.).

### Track B: Local Repo Labs (real repos, run on the learner's own machine)
This is the biggest fidelity upgrade and avoids building a risky code runner.

- Each lab is a **GitHub template repo** with a README, failing tests and several planted bugs, in the stacks candidates report: **Node/Express (MERN-style)**, **Spring Boot (Java)**, **Django (Python)**, later Flask/FastAPI.
- The PrepStack page provides the briefing, staged hints, a "how to start" guide (clone, run tests, read output) and a post-mortem unlocked afterwards.
- **Verification without execution:** after fixing, the learner answers checkpoint questions that cannot be answered without doing the work (for example "what did test X expect?", "which line did you change and why?", a pasted test summary). Results are **self-reported** and labelled as such.
- Trains S1 to S6 in the same conditions as a real round (own IDE, real tooling, debugger).
- **Reference solutions** live in a separate repo/branch revealed after submission. Withheld tests are not secret, only hidden in the UI.

### Track C: Review and AI-patch (deterministic, pre-authored)
- **Diff review:** a small PR with seeded defects; the learner flags lines and writes a short review comment from structured options plus free text (stored privately).
- **AI-patch review:** a bug report plus a plausible-but-wrong "AI" patch. The learner decides accept / edit / reject and names what it breaks (missed edge case, changed behaviour, test gap). All patches are authored by us, no LLM calls, so grading is deterministic.
- Trains S7, S8. Treated as a **core mode**, because AI-allowed rounds score this skill.

### Track D: Optimize (static first)
- Given code plus evidence (a profile excerpt, query log, operation counts), the learner identifies the bottleneck and chooses or writes the improvement, then answers "how do you prove behaviour is unchanged?".
- Trains S9. Executable "make it faster" challenges come only if Track E exists.

### Track E: In-browser executable challenges (later, gated by a security spike)
- Warm-ups and small repos run in the browser, JavaScript first.
- Built only after demand is shown (Section 9) and a deployed isolation spike passes (Section 6).

### Mock Round (timed, optional)
- A composed 45 to 60 minute session: one Local Repo Lab or Track E repo, plus a think-aloud log and a self-score rubric.
- Variants: **No-AI** (bug-bash style) and **AI-allowed** (use your own tool, then answer verification questions and complete an AI-patch review).
- Timing is optional everywhere else; the default is untimed learning. Timed and untimed records are kept separate.

### Think-aloud log (all tracks)
A structured timeline the learner fills while working: **Reproduce, Hypothesis, Evidence, Fix, Verify**. A short rubric (did you reproduce first, state a hypothesis, test it, check regressions?) makes S6 trainable. Text only in v1; no audio or video stored.

### Debugging method (the thread through everything)
Reproduce, isolate, hypothesize, fix, verify. Shown in hints, post-mortems and a short **Debugging Playbook** note added to the CS notes (reading stack traces, using a debugger and breakpoints, binary search over code or commits, reading failing test output).

---

## 4. Content standards

### 4.1 Per-exercise requirements
1. A precise behaviour contract and one defensible root cause per bug.
2. **Verified before release by running real code** in the real language: the bug reproduces, the reference fix passes, and at least one structurally different correct fix passes.
3. Plausible wrong fixes (hard-coded answers, disabled checks, swallowed errors, symptom-only patches) are tested and must fail.
4. Staged hints (nudge, location, cause) and a post-mortem (cause, evidence, repair, regression risk, how to spot it next time).
5. An **unfamiliar follow-up** with the same concept in new code, to check transfer.
6. Skills tags, difficulty, estimated minutes, concept links to existing PrepStack notes.
7. Immutable `contentVersion`; any behaviour change publishes a new version.

### 4.2 Authenticity and legal
- Exercises are **original**, built from reported *themes* (for example state bugs in round-robin or consistent hashing, booking-service API bugs, failing-test repo fixes), never copies of actual interview questions or competitor challenges.
- Do not state or imply that any company uses an exercise. Company mentions only in dated research notes with an evidence label.
- Open-source repos used as teaching material must have compatible licences and be credited.

### 4.3 Catalogue targets (quality over volume)
| Phase | Target |
|---|---|
| First release | 15 Track A items, 1 diagnostic set, Debugging Playbook |
| Labs release | 3 Local Repo Labs (Express, Spring Boot, Django), each 3 to 5 bugs |
| Review release | 6 diff reviews, 6 AI-patch items, 4 optimize items |
| MVP | About 40 Track A, 6 labs, 12 review/AI-patch, 8 optimize, 2 mock rounds |

Everyone gets the same quality bar: a smaller catalogue that is correct beats a large one with ambiguous answers.

---

## 5. PrepStack integration (planned, not assumed)

Fits the existing design rules: code decides, plans are previewed before saving, Today stays simple.

- **Plan:** DebugLab items become versioned plan items with estimated minutes, added only through the existing preview-and-confirm flow. Never auto-insert or replace work.
- **Reviews:** reuse the existing result model (solved alone / with hints / needed the solution). Spaced reviews re-serve the **unfamiliar follow-up**, not the same exercise, so recall is real.
- **Skills view:** per-skill evidence (for example "S3: 4 solved alone, 3 with hints"), no readiness percentage.
- **Notes link-ups:** each exercise links to the relevant OS, DBMS, OOP or framework note, and to the Debugging Playbook.
- **Role Analyzer:** map analyzer skill gaps to DebugLab skill tags and tracks; if no suitable exercise exists, show none (never invent links).
- **Today:** unchanged (today's items, time needed, one Start). Explanations, logs and results live in detail views.
- **Public vs login:** reading Track A and lab briefings can be public; saving progress needs login, matching current rules.

---

## 6. Architecture and security

### 6.1 Phases 1 to 3 need no code execution
Track A, labs, review, AI-patch and optimize are content plus lightweight progress storage. Learner code never runs on our servers or app origin.

### 6.2 Track E (executable) rules, carried over as hard gates
- Never run learner code on the API server.
- Never run it in an authenticated PrepStack-origin worker or iframe (CSP and shadowed globals are not a boundary).
- Candidate designs, tested in this order in a **deployed spike** across Chrome, Firefox and Safari:
  1. **Hosted sandbox** (for example Sandpack or a similar hosted iframe): record limits, licence, offline behaviour, network control.
  2. **Own cross-site runner**: separate registrable domain, no shared cookies or storage, opaque-origin sandboxed frame if workers allow, fresh disposable worker per run, external watchdog, strict message validation, bounded payloads.
- Probe matrix: network (fetch, XHR, WebSocket, imports), storage and cookies, parent access, forged or stale messages, floods and infinite loops, CSP of the main app unaffected.
- **Exit:** a written pass/fail matrix. Any app-origin access or uncontrolled network blocks release; a disclaimer is not a fix.

### 6.3 Backend (lean)
Use `server/src/modules/debuglab/` and existing shared HTTP, auth and rate-limit conventions.

| Model | Purpose | Key |
|---|---|---|
| `DebugLabProgress` | Per-user, per-item summary: status, best result mode (alone/hints/solution), hints used, version | unique `(user, itemId, contentVersion)` |
| `DebugLabAttempt` | Bounded attempt record: mode (timed/untimed), timestamps, hint events, think-aloud log (private), checkpoint answers | unique `(user, attemptId)` |

- All owned data uses a `user` reference so existing account-deletion discovery and `wipeUserData` cover it; add tests for both deletion paths.
- Idempotent writes: same attempt ID returns the existing record; conflicting reuse returns 409; hints and results recorded once; summaries derived from deduplicated attempts.
- Free-text limits in UTF-8 bytes (think-aloud log and notes: start at 8 KiB each), validated by Zod. Install any larger parser **before** the global parser and prove ordering with HTTP tests; do not raise limits for other APIs.
- Retention: keep the latest 200 attempts per user plus lifetime counters (to be reviewed and disclosed before the pilot). Free-text is private, deleted with the account, never used for analytics.
- Any aggregation pipeline needs Mongoose's pipeline option, validated inputs and `$literal` for validated values.
- Rate-limit writes and reuse Redis-optional infrastructure; the feature must work with Redis off.

### 6.4 Frontend
- Lazy-load the workspace; signed-out pages never call personal APIs.
- Keyboard accessibility, visible focus, no layout overflow on phones (labs are desktop-first; reading works everywhere).
- Clear states: loading, saved, offline, conflict, failed save. A failed save must never say "Saved".

---

## 7. Measurement: does it actually help?

Define this **before** collecting data; agree pass thresholds and rationale in advance (no invented gates).

### 7.1 Diagnostic and follow-ups
- **Diagnostic A/B:** two equivalent sets (same skills, different items). Learners take A at the start and B after practice. Compare per-skill results.
- **Unfamiliar follow-ups:** after each exercise, a new item testing the same concept.
- **Process signals:** time to first hypothesis, whether a repro was made first (from the think-aloud log), hints used, regressions introduced (labs: checkpoint answers).

### 7.2 Pilot design
- 8 to 15 people: placement students and working professionals, with enough language familiarity (record language gaps separately from debugging difficulty).
- Observe at least 3 in a live session while they think aloud.
- Optional: one real-style mock round at the start and one at the end, scored with the rubric by someone other than the author.
- **Outcome follow-up:** after 4 to 8 weeks, ask voluntarily whether they met a debugging/AI-assisted round and how it went (self-reported, small sample, never generalized).

### 7.3 Metrics (with denominators)
| Question | Measure |
|---|---|
| Do they start? | Unique openers / people shown the entry point |
| Do they finish? | Items completed / items started, by track and mode |
| Do they return? | Learners active on a later day / cohort with a full observation window |
| Do they improve? | Diagnostic B vs A per skill; follow-up success rate |
| Is it usable? | Errors, timeouts and confusion points from sessions |
| Is content correct? | Reports of ambiguous items; items re-versioned |

State sample size, missing data and observation window with every number. Report honestly when the pilot does not show improvement.

---

## 8. Quality, safety and fairness

- **Cheating via self-report:** checkpoint questions, reference reveal only after submission, and results labelled as private self-reports. No leaderboards, certificates or hiring scores.
- **Content defects:** every item has a "report a problem" link; a defect pulls the item until fixed and re-versioned.
- **Accessibility:** screen-reader-friendly code viewing for Track A, keyboard-only flows, no colour-only signals.
- **Privacy wording:** disclose what is stored (progress, private logs, attempt metadata), retention and deletion before collecting anything.
- **Wellbeing:** tone encourages and normalizes getting stuck; hints are never framed as failure.

---

## 9. Phases, estimates and exit criteria

Rough solo-developer working days. They are assumptions to **re-estimate after Phase 1**, content authoring dominates, and learner observation is calendar time, not coding time.

| Phase | Work | Est. days | Exit evidence |
|---|---|---|---|
| 0. Contracts | Skills tags, item schema, progress model, retention, privacy wording | 2 to 3 | Reviewed schema and decisions |
| 1. Foundation (Track A) | 15 verified static items (Java/Python/JS), item player UI, hints, explanations, note links, minimal progress, Debugging Playbook, diagnostic A/B | 8 to 12 | Items verified by running code; students use it |
| 2. Demand and usability check | Observe 5 to 8 learners; fix confusing items | Calendar 1 to 2 weeks | Real usage data; owner decides to continue and what to improve |
| 3. Local Repo Labs | 3 labs (Express, Spring Boot, Django) with README, failing tests, hints, checkpoints, post-mortems; lab runner guide | 10 to 15 | Each lab: bugs reproduce, reference and alternative fixes pass, wrong fixes fail |
| 4. Review, AI-patch, optimize | 6 diff reviews, 6 AI-patch items, 4 optimize items; deterministic grading | 6 to 9 | All items verified; grading tests pass |
| 5. Think-aloud and Mock Round | Log UI, rubric, No-AI and AI-allowed mock rounds | 5 to 8 | End-to-end journeys in browser and API |
| 6. Observed pilot | 8 to 15 learners; diagnostic A/B, follow-ups, session observation | Calendar 3 to 4 weeks | Report with real counts and honest limits |
| 7. Integration | Plan items, review ladder, skills view, Analyzer mapping | 6 to 10 | Existing plan flows, deletion and archives tested |
| 8. Track E decision | Run the deployed isolation spike (hosted sandbox first); build executable tiers only if it passes and demand exists | Spike 5 to 8; build 15 to 25 | Pass/fail matrix; owner decision |

Phases 1 to 5 total roughly **31 to 47** working days before integration and the optional executable tier. Treat these as planning ranges, not promises.

---

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Content effort is the real bottleneck | Start with 15 items; reuse templates; verify by running real code; cut scope before cutting quality |
| Self-reported lab results can be faked | Checkpoint questions; labelled private; aim is learning, not certification |
| Formats change | Recheck research monthly; keep skills-based, not company-based |
| Language/stack coverage is wide | Start with the three stacks candidates report; add by demand |
| Security of executable code | Deferred, spike-gated, no app-origin or API-server execution |
| Low usage | Phase 2 checks demand before the heavy investment |
| Copyright or authenticity issues | Original exercises, themes not questions, credited open-source |
| Solo maintainability | Registry-driven content, tests that validate every item, small API surface |

---

## 11. Release gates (checklist)

- [ ] Every shipped item verified by running real code; one defensible cause each; wrong variants fail.
- [ ] No exercise copies an actual interview question or competitor challenge; company claims are dated and evidence-labelled.
- [ ] Ownership, auth, limits and parser order covered by HTTP tests; new models removed by account deletion in both paths.
- [ ] Idempotency tests: duplicate requests, retries and first-create races do not double-count.
- [ ] Privacy and retention wording shown before anything is stored; free-text never used for analytics.
- [ ] Keyboard, focus, phone layout and screen-reader checks done for Track A and the workspace.
- [ ] Diagnostic sets are equivalent in skills and difficulty (reviewed by someone other than the author).
- [ ] Track E: deployed Chrome/Firefox/Safari isolation matrix passes with recorded headers and versions, or Track E is not released.
- [ ] README and status docs updated with actual test counts only after something ships.
- [ ] Owner approves deployment and pilot recruitment separately.

---

## 12. Decisions needed from the owner

1. Which three stacks for the first labs (suggested: Express, Spring Boot, Django)?
2. Languages for Track A at launch (suggested: Java, Python, JavaScript)?
3. Retention limit and privacy wording for private think-aloud logs.
4. Who reviews diagnostic equivalence and mock-round scoring besides the author?
5. Whether to invite pilot users from placement students, working professionals, or both.

---

## Appendix A: Track A item format and sample

```yaml
id: a-java-roundrobin-remove
contentVersion: 1
track: spot-the-bug
language: java
skills: [S2, S3]
difficulty: 2
minutes: 4
notes: [oop/state-and-invariants, debugging-playbook]
code: |
  class RoundRobin {
    private final List<String> workers = new ArrayList<>(List.of("a","b","c"));
    private int next = 0;
    String pick() {
      String w = workers.get(next);
      next = (next + 1) % workers.size();
      return w;
    }
    void remove(String w) { workers.remove(w); }
  }
faultyLines: [8]   # remove(): next is not updated
question: "pick(), pick(), remove(\"c\"), pick() throws IndexOutOfBoundsException. What is the cause?"
options:
  - "remove() leaves next pointing past the end of the shrunken list"   # correct
  - "pick() should use workers.size() - 1"
  - "List.of() creates an immutable list"
  - "The modulo operator is wrong for three workers"
explanation: >
  After two picks next is 2. Removing "c" shrinks the list to size 2, so index 2 is
  out of range. remove() must keep next valid (adjust it when an earlier index is
  removed, and wrap it when it reaches the new size).
hints: ["Trace the value of next after each call.", "Look at what remove() does to next.", "The list shrank but next did not."]
followUp: a-python-pool-remove-2   # same invariant, new code
```

Note: `new ArrayList<>(List.of(...))` is used so `remove` works; the item must be compiled and run in Java before release.

## Appendix B: Bug taxonomy (author from this list, everyday bugs first)

1. Off-by-one and boundary errors; empty or single-element inputs
2. Falsy/null/undefined handling; wrong defaults (`||` vs `??`)
3. Async mistakes: missing await, unhandled rejection, race between requests
4. Mutation and aliasing: sorting/reversing in place, shared references
5. State that must stay consistent after add/remove/resize (round-robin, hashing rings, caches)
6. Wrong status codes, validation, error propagation in HTTP handlers
7. Middleware and request-flow order (Express), dependency injection and transaction scope (Spring), ORM query and migration issues (Django)
8. Data-access issues: N+1 queries, missing indexes, wrong join, pagination off-by-one
9. Concurrency: lost update, double spend, deadlock, stuck lock
10. Resource and lifecycle leaks: listeners, connections, timers, file handles
11. Numeric issues: rounding, overflow, integer cents for money
12. Config/env/time-zone/date bugs
13. Performance: quadratic loops, repeated work, missing caching, blocking I/O
14. Test gaps and misleading tests; fix that only satisfies the visible test

## Appendix C: Local Repo Lab spec

- Repo layout: `README` (scenario, how to run tests), `src/` (app), `tests/` (failing tests), `hints.md` (not linked, revealed in app), `LAB.json` (id, version, skills, bug count).
- 3 to 5 independent bugs, with order and dependencies declared. Tests fail before the fix and pass after; each bug has its own failing test where possible.
- Authoring validation script runs: baseline fails, reference fix passes, an alternative fix passes, each wrong variant fails.
- App page: briefing, "start in your editor" steps, staged hints, think-aloud log, checkpoint questions, post-mortem after submit.
- Keep repos small (about 15 to 40 files), fast to start (under 2 minutes from clone to first test run), no paid services, no secrets.

## Appendix D: Mock round rubric (self- or peer-scored, 0 to 2 each)

1. Reproduced the failure before changing code
2. Stated a hypothesis out loud (or in the log) before editing
3. Used evidence to narrow it (logs, breakpoint, test output)
4. Fixed the cause with a minimal change
5. Ran tests and considered edge cases
6. Explained the cause and trade-offs clearly
7. (AI-allowed variant) Checked the AI's output and caught at least one defect or risk

Scores are practice feedback, not a readiness or hiring score.

## Appendix E: What stays from the earlier plan, and what changed

**Kept:** original-content rule, no overclaiming, untimed default, security gate for any executable code, ownership/deletion/idempotency/parser-order rules, plan integration only through preview-and-confirm, honest pilot reporting.

**Changed:** static tier and local repo labs ship before any in-browser runner; Java and Python from day one; AI-patch review is a core mode; think-aloud log and optional mock round added; pilot measures improvement and transfer, not just usage; everyday reported bug themes replace exotic first challenges.