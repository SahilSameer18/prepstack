# PrepStack build checklist

The order of work, from now on. **Tick a box (`[x]`) when a feature is finished, tested, and the owner has the `git add` and commit commands.** The owner decides the order; an agent recommends and asks before changing it. Status and details: `PROJECT_STATUS.md`. Last updated 16 Nov 2026.

Items marked **optional** are the owner's call: whether and when. Sections 1 to 8 are the committed order, apart from those. Sections 9 to 17 are later work from the existing plans: each starts only when the owner says so, and may be reordered.

## Done

- [x] My plan phases 0 to 7: builder, daily workspace, dashboard, report imports, reviews, history (`docs/plans/MY_PLAN_PLAN.md`)
- [x] Recovery: pause and resume, study calendar, deadline extension, review catch-up, substitute problems, and one active plan alongside one paused plan
- [x] Coverage and clarity fixes: fair share with floors when time allows, not-included list, readable dates, day totals, week summaries, "my pace" (`docs/plans/MY_PLAN_COVERAGE_PLAN.md`)
- [x] Homepage and sign-up claims corrected; audit findings fixed
- [x] Competitor research written down (`docs/research/COMPETITOR_PLANNERS.md`)
- [x] Docs cleanup; plans written for depth levels and DSA lessons
- [x] Review fixes (16 Nov): no empty plan saved, the Generate button is off when no task fits, pace is refused on report plans, substitutes follow the pace, honest coverage copy
- [x] First-time experience (16 Nov) — the home page leads with My plan. Direct signup opens the dashboard, and explicit return links take learners back to where they started. The greeting uses confirmed activity, and a failed Reports read offers a retry. One dashboard tab row opens each section; the empty My plan offers Build my plan, and a paused plan offers Resume. Empty states on the analyzer, resume guide, AI projects and plan reviews pages remain open.
- [x] Scaling pass (18 Nov, branch `redis`): load test and CPU profile, plain-object reads, memoized planner dates, in-process cache in front of Redis, `npm run start:cluster` (needs Redis); 100 at once went from 24 to 122 requests a second on a laptop, 401 with four copies (`docs/research/SCALING_REPORT.md`). Still open: the plan generator off the main thread, the session cache (R3), the AI queue (R6), and the same test against the deployed server
- [x] Search optimisation (16 Nov): every notes section is its own indexable page (64 more pages, 91 in the sitemap) with its own title, description and structured data; real text in the page HTML for sections, sheets, roadmaps and the behavioral guide; the home page leads with the study plan; the Striver A2Z claim corrected from "450+" to "440+" problems
- [x] Open reading: DSA sheets, notes, roadmaps and the behavioral guide need no login; signed out, they never call a personal API and say "Sign in to save your progress" on a tick, a note or a finished quiz; the pages are now indexable (16 Nov)
- [x] Finish-date comparison in the builder preview: "when would the whole syllabus be done at these hours?" (16 Nov)
- [x] Role plans never empty (a long roadmap step is planned in parts), Today never empty while work waits on a study day, `plannedItems` counts tasks (16 Nov)

## 1. Launch the work so far

- [x] 1.1 Commit everything built so far (the owner)
- [x] 1.2 Deploy the server and the client; run `npm run seed:notes` or `seed:all` only if data changed (the owner)
- [ ] 1.3 Open one plan page live and hand-test the live site: sign up, make a plan, tick a task, change pace, pause and resume (the owner and Claude)

Decided 16 Nov: when a waiting task is bigger than the day, Today shows the smallest one (it carries on the next day); a long roadmap step is planned in parts. The deployed revision and live behavior still need confirmation in 1.3.

## 2. Close the testing gap

- [ ] 2.1 A random-walk test through the API: ticks, reviews, skips, moves, pause and resume, report imports, substitutes; no 500 answers and the plan rules hold after every step

## 3. DSA pattern lessons (optional: the owner decides whether and when; `docs/plans/DSA_LESSONS_PLAN.md`)

- [ ] 3.1 Phase 0: decisions recorded; sources of wave 1 read and logged, terms of use recorded
- [ ] 3.2 Phase 1: the `dsa` subject in the loader, validator, seed and notes pages; the `trace` diagram; links to sheet topics; the sample lesson (two pointers) end to end
- [ ] 3.3 Wave 1: 15 lessons (1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 18, 19, 20, 26, 27), each with its check script, reviewed, approved by the owner, seeded

## 4. Depth levels, code (`docs/plans/MY_PLAN_DEPTH_LEVELS_PLAN.md`; can run beside section 3)

- [ ] 4.1 Phase 0: owner decisions recorded
- [ ] 4.2 Phase 1: recap minutes and the notes level in the generator
- [ ] 4.3 Phase 2: DSA levels (quick revision; "from the basics" only if the optional DSA lessons are built)
- [ ] 4.4 Phase 3: model, validators, controller, adjust, public preview, the `levels` change with a preview
- [ ] 4.5 Phase 4: builder, preview, Plan tab and "Change depth" dialog
- [ ] 4.6 Phase 5: the recap view on the notes page and the task links
- [ ] 4.7 Phase 5b: the `tier: deep` header field, loader, validator, notes badge and the deep level in the generator
- [ ] 4.8 Phase 6: tests (unit, scenario runner with levels, API, browser, mutation checks)
- [ ] 4.9 Phase 7: docs and close-out

## 5. More DSA lessons (optional, only if section 3 is done)

- [ ] 5.1 Wave 2: 14 lessons (6, 10, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 28, 29)
- [ ] 5.2 Wave 3: 5 lessons (30 to 34, including "choosing the pattern")
- [ ] 5.3 Close-out: README, TESTING, PROJECT_STATUS, SOURCES, SEO, seed commands

## 6. Deep-dive content (26 sections, priority 1 first; section 2.4 of the depth-levels plan)

- [ ] 6.1 Operating Systems (6)
- [ ] 6.2 DBMS (5)
- [ ] 6.3 Computer Networks (5)
- [ ] 6.4 OOP in Java (4)
- [ ] 6.5 System Design (6)
- [ ] 6.6 Question banks (8 to 10 more questions for the key sections)

## 7. LLD notes

- [ ] 7.1 Write `docs/plans/LLD_NOTES_PLAN.md`
- [ ] 7.2 Sections drafted, run, reviewed
- [ ] 7.3 Published and seeded

## 8. Stage 6, small items (`IMPROVEMENT_PLAN.md` stage 6)

- [ ] 8.1 Quizzes page (B7), **optional**: the quiz data already exists in every section
- [ ] 8.2 Light theme (B12)
- [ ] 8.3 Opt-in public profile (B8)
- [ ] 8.4 CI run of the server tests (B9, optional)

## 9. The DSA problems file shared by all sheets (`docs/plans/DSA_PROBLEMS_PLAN.md`)

- [ ] 9.1 Phase 1: build the catalog (about 2 days)
- [ ] 9.2 Phase 2: the owner's review (about 1 day of the owner's time)
- [ ] 9.3 Phase 3: tests first (about 1 day)
- [ ] 9.4 Phase 4: server and client switch (about 3 days; deploy order matters: the new server cannot read the old progress shape)
- [ ] 9.5 Phase 5: the add-sheet tool and docs (about 1.5 days)
- [ ] 9.6 Phase 6: link and quality check (about 1 day)

## 10. Redis, BullMQ and background jobs (`docs/plans/REDIS_PLAN.md`; a learning track, then production steps)

Learning track:

- [ ] 10.1 L0 Why Redis exists (half a day, no code)
- [ ] 10.2 L1 Redis basics by hand (2 days)
- [ ] 10.3 L2 Redis from Node (2 days)
- [ ] 10.4 L3 The patterns PrepStack will use (3 days)
- [ ] 10.5 L4 Background jobs: the ideas (1 day, then a small build)
- [ ] 10.6 L5 BullMQ (4 days)
- [ ] 10.7 L6 Running it for real (2 days)

Production steps (each comes right after its learning modules). **Interview-practice order, set 16 Nov 2026** (`REDIS_PLAN.md` section 3c): R0, then the cache steps (10.12 and 10.16), then the limiters and locks (10.9), the session cache (10.11), the AI budget (10.10), and last the queue (10.14). Each step leaves a before-and-after measurement, tests and a short note (section 10 of the plan):

- [x] 10.8 R0 Choose the free host and connect: Aiven Valkey checked, optional connection module, fake Redis and tests built; the live test passed against the real service (18 Nov 2026, branch `redis`)
- [x] 10.9 R1 Shared limits and locks (about 3 days; after L3). Built 18 Nov 2026 (branch `redis`): a Redis rate limit store (fixed and sliding window), 12 of 14 limiters in Redis (the 7 login-related ones first, then 5 more; plan tick and problem note count in memory by default after the latency measurement, opt-in with RATE_LIMIT_REDIS), the two "being generated" locks, the junk counter and the shared AI breaker. The real Lua scripts passed on the Aiven service (18 Nov 2026, `npm run test:redis-live`: both algorithms with 50 callers at once, give-back, the lock). Measured 18 Nov 2026: a Redis limiter adds about 36 ms median per limited request (laptop to Aiven)
- [x] 10.10 R2 App-wide AI budget (built 18 Nov 2026, branch `redis`): one atomic Lua reservation per call (minute and day counters with expiry), the provider cascade skips a spent provider without calling it and tries all of them anyway when every one is spent, memory counters when Redis is off or fails; `AI_BUDGETS` is empty until the owner copies the limits from the Gemini and Groq consoles, so nothing is enforced yet. The live Lua check in `npm run test:redis-live` passed on the Aiven service (18 Nov 2026, 5 of 5)
- [x] 10.11 R3 Session check cache (built 18 Nov 2026, branch `redis`, default on, `SESSION_CACHE=off` turns it off): 5 seconds in the process and up to 30 seconds in Redis, a per-user version number raised on all eight revoke paths, never longer than the session itself. Tests cover every path, the race between a read and a revoke, expiry, Redis down. Not measured on the live site
- [ ] 10.12 R4 DSA sheet reads, content and per-user stats cache (B11; after L3). Built 18 Nov 2026 (branch `redis`); tick after the owner runs `npm run measure:cache` and the numbers are in the interview notes
- [ ] 10.13 R5 Absorb failed-login traffic (optional, after an attack)
- [ ] 10.14 R6 Background job queue for the AI features (about 1 week; after L5 and L6)
- [ ] 10.15 R7 Planned features that need Redis
- [ ] 10.16 R8 My plan: cache the public preview (not the saved plan), part of the cache steps. Built 18 Nov 2026 with 10.12

## 11. My plan, later ideas

- [ ] 11.1 Phase 8: a real-student check of My plan (3 to 5 students and 2 to 3 job switchers), then fix what they find
- [ ] 11.2 Time-per-problem protocol (`docs/research/TIME_CALIBRATION.md`) and, from real minutes, better default minutes
- [ ] 11.3 Version 1.1 idea: weekly study note (a little AI on top of the code numbers)
- [ ] 11.4 Version 1.1 idea: "explain my block" on a failed problem
- [ ] 11.5 Version 1.1 idea: Role Analyzer report to a ready-made plan
- [ ] 11.6 Version 1.1 idea: LeetCode solved-problem import
- [ ] 11.7 Curated "must-do" problems per topic (replaces the quick-revision rule) and authored recap lines
- [ ] 11.8 Plan export to a file or calendar

A dedicated 1–2 week interview scheduler was dropped on 15 Nov. The recovery flow already supports running a short ordinary plan while the main plan is paused. Revisit dedicated scheduling only if the owner reopens it, using the short-plan examples in `docs/plans/MY_PLAN_COVERAGE_PLAN.md`.

## 12. Role Analyzer

- [ ] 12.1 The three Role Analyzer changes the owner set aside on 12 Nov (the owner decides which to do)
- [ ] 12.2 Part 2, "interconnection": the rest of PrepStack changes because of the analyzer (`docs/archive/ANALYZER_PLAN.md`, section 12; starts only if students say yes)

## 13. LeetCode auto-sync extension (`docs/plans/EXTENSION.md`)

- [ ] 13.1 Step 0: one-day spike
- [ ] 13.2 Step 1: server (about 1.5 days)
- [ ] 13.3 Step 2: profile page (about 0.5 day)
- [ ] 13.4 Step 3: the extension, Manifest V3 (about 2 to 3 days)
- [ ] 13.5 Step 4: tests (about 1 day)
- [ ] 13.6 Step 5: release

## 14. DebugLab (`docs/plans/DEBUGLAB_PLAN.md`; three tiers, demand test first)

- [ ] 14.1 Phase 0: prerequisites (the earlier fixes and the analyzer finished, a test runner, CI, the `deleteUserData` helper)
- [ ] 14.2 Phase 1: browser spike (1 to 2 days)
- [ ] 14.3 Phase 1.5: Wave 0 demand test (4 to 7 days): the spike, one warm-up set, one incident, a tiny "progress-lite" backend
- [ ] 14.4 Decision point: continue only if the demand test justifies it
- [ ] 14.5 Phase 2: engine package (3 to 4 days)
- [ ] 14.6 Phase 3: backend (2 to 3 days)
- [ ] 14.7 Phase 4: frontend (6 to 8 days)
- [ ] 14.8 Phase 5: MVP content (6 to 8 days beyond Wave 0)
- [ ] 14.9 Phase 6: polish and release (2 to 3 days)
- [ ] 14.10 Wave 2 and Wave 3 incidents, only if the numbers justify them

## 15. Growth (`docs/research/GROWTH_IDEAS.md`)

- [ ] 15.1 Real users: launch to the college, placement groups and developer communities in placement season
- [ ] 15.2 Real numbers in the README (users, retention, plans made) once they exist
- [ ] 15.3 Real student stories, with each person's permission
- [ ] 15.4 Adaptive personalisation: the analyzer's gaps feed the plan, and the dashboard shows gaps closing

## 16. Other ideas, not planned yet

- [ ] 16.1 In-browser code editor with graded practice (write `docs/plans/PRACTICE_EDITOR_PLAN.md` first; the shape discussed on 15 Nov: about 50 original problems, JavaScript and Python graded in the browser, results feeding the review ladder)
- [ ] 16.2 College dashboard

## In parallel, the owner

- [ ] The owner uses My plan daily from December for their own MAANG prep and notes what feels wrong
- [ ] Find 3 to 5 students and 2 to 3 job switchers to try My plan
- [ ] Find one outside reader for each notes subject, each roadmap and the behavioral guide
