# My plan: coverage and clarity fixes (proposed, not approved)

Written 15 Nov 2026 after running My plan, Planly (TUF), techinterview.org and PracHub on the same input. Evidence: `docs/research/COMPETITOR_PLANNERS.md` (sections 3 to 8). **Status: a proposal. The owner has not decided anything here; every "recommended" is a recommendation only.** Nothing in this file is built yet.

## 1. What the comparison showed (the facts that drive this plan)

Input used: big-tech goal, Striver SDE sheet, OS + DBMS + CN + OOP, start Mon 16 Nov 2026, 9 weeks, 3 h Mon to Fri, 4 h Sat and Sun (23 h a week), no rest day.

| # | Finding | Evidence |
|---|---|---|
| F1 | The plan fills the days in sheet order and cuts the tail. In 9 weeks it places 8 DSA topic groups and **drops Dynamic Programming, Greedy, Heaps, Strings, Tries, Recursion and Backtracking and most of Graphs.** | 103 DSA problems placed, 90 left out (reason "no-room") |
| F2 | Of the four CS subjects the student chose, **OS gets 11 of 11 sections, DBMS 1 of 10, CN 0 of 10, OOP 0 of 10.** | 29 of 40 sections left out |
| F3 | The screens say "119 syllabus items (139.1 h) could not fit" but **never name what is missing.** | preview card, Plan tab line |
| F4 | A longer plan fixes it (16 weeks: OS, DBMS, CN full, OOP 6 of 10, DP present; 26 weeks: everything), so the problem is the squeeze, not the sheet. | generator runs, section 8.2 of the research file |
| F5 | Our time per problem (Easy 40, Medium 70, Hard 120, about 72 min on average) is **2.5 to 3 times Planly's** (about 17 to 37 min for the same problems). The number decides coverage: see Phase D. | Day 1 and Day 2 of both plans; sensitivity table in Phase D |
| F6 | UI: the preview shows raw dates ("DAY 2026-11-16") and raw ids ("arrays-i"); the Plan tab shows ISO dates and weeks as closed rows with no topics, hours or counts; no day totals. | screenshots on 15 Nov |
| F7 | A first-week bug (empty week when the start day is the rest day) was found and fixed on 15 Nov. | done, tests added |

## 2. Goal and how we will know it worked

**Goal:** when a student asks for a subject or a sheet and the time is short, the plan covers every chosen subject and every DSA topic group a little instead of dropping the tail, and the screens say exactly what was cut.

**Acceptance (run the same input again and record it in `docs/research/COMPETITOR_PLANNERS.md`, section 9):**
1. Every chosen CS subject has at least 3 sections in the plan (or all of them if it has fewer).
2. Every DSA topic group of the chosen sheet has at least 1 problem, unless the plan is shorter than 2 weeks.
3. Total planned minutes stay within the same 85% budget (70% new work, 15% reviews), within 5 points.
4. The preview and the Plan tab list what is **not included** and what is **only partly included**, by subject and topic, in plain words.
5. The same input always gives the same plan (deterministic), and a longer plan never contains less than a shorter one for the same input.
6. The Today screen is unchanged (the sacred-screen test still passes).

## 3. The work, in recommended order

### Phase A: say what is missing (recommended first; about 1 to 1.5 days)
- **Server** (`planGenerator.js`, `planAdjust.js` preview shape, `plan.controller.js` presenters): add a small `coverageByGroup` list to `coverage` and to the public preview: one entry per DSA topic group and per chosen subject with `{ label, kind: dsa|notes, total, placed, minutes, state: all|part|none }`, built from what was placed and the existing `leftOut`. No change to how the plan is made.
- **Client:** preview card shows "Not included: Dynamic Programming, Greedy, ... Computer Networks, OOP in Java" and "Only partly included: DBMS (1 of 10)"; the Plan tab line "119 syllabus items did not fit" gets a "See what is not included" section (a list, not a new screen). Wording in plain words, no raw ids.
- **Tests:** totals add up (placed + left out = syllabus); every group appears once; public preview shape (the existing test that lists the exact keys is updated); a client render test; mutation checks on the state calculation.
- **Done when:** acceptance point 4 holds.

### Phase B: spread the squeeze (the main fix; about 4 to 6 days; needs the owner's decision first)
Today the generator puts all content in one list (`sequenceItems`) and `fillDays` places it in order, so what does not fit is the tail. Recommended change, for sheet goals (big-tech and placements) only:
1. When the syllabus is larger than the capacity, compute a **fair share per group**: each DSA topic group and each chosen subject gets a share of the new-work minutes in proportion to its syllabus minutes, with a minimum (1 problem per topic group, 3 sections per subject).
2. Inside a group, keep problems in the sheet's order and **trim Hard problems first, then the last ones**, so the must-do start of each topic stays.
3. Keep the dependency order of topics and the current day-filling, mock and behavioral rules, review ladder and part splitting. Only the choice of what goes in the list changes.
4. If even the minimums do not fit, say so in the notices (new notice id) and keep the minimums in this order: DSA groups, then subjects in the order the student chose.
5. Plans that already fit (long plans) are unchanged. Roadmap ("role") goals are not changed in this phase.
- **Files:** `server/src/services/planGenerator.js` (a new selection step before `fillDays`; `sequenceItems` and `fillDays` stay), `server/test/plan-generator.test.js`, `plan-adjust.test.js` (rebuilds use the same generator), `plan-api.test.js`, `docs/plans/MY_PLAN_PLAN.md` (decision 28 to 40 wording on "core first").
- **Tests (new):** the acceptance checks on the real sheets for 6 inputs (4, 9, 16 and 26 weeks, both styles); determinism; a longer plan is a superset by minutes; known topics and solved problems are excluded before the share is computed; a rebuild from today keeps done work and re-spreads only what is left; mutation checks on the minimum rules and the trim order.
- **Risk:** changes the core of a well-tested engine, so some existing tests that assume "core first, tail cut" will change. Mitigation: do it behind the full test suite and run the section 8 input before and after; keep the old behaviour out of the code (no switches, no "legacy mode"), as the owner prefers.
- **Done when:** acceptance points 1, 2, 3 and 5 hold on the real data.

### Phase C: screen clarity (about 1 to 2 days; can run beside Phase A)
- Preview "Your first week": weekday and date in words ("Mon, 16 Nov"), the day's total time, readable source tags (the saved plan already formats them), the label "Study tasks" once.
- Plan tab: dates in words, a one-line summary on every closed week (topics and hours, for example "Arrays, 14 h"), day totals inside an opened week.
- Keep the Today screen exactly as it is.
- **Files:** `client/src/components/plan/PlanPreview.jsx`, `StudySchedule.jsx`, `client/src/utils/studyPlan.js` (`formatPlanDate` already exists), `MyPlanStudy.jsx` summary block.
- **Tests:** client unit tests for the formatters, the browser spec updated for the week summary, the sacred-screen test unchanged.
- **Done when:** a screenshot check at 375 px and desktop width shows no raw dates or ids on the preview or Plan tab.

### Phase D: time per problem (about 2 to 3 days for D1, 0.5 day for D2, then the December pilot)

**What we know (15 Nov 2026).** The planner's numbers are Basic 30, Easy 40, Medium 70, Hard 120 minutes ("solve it, check the solution, redo the weak part", decision 29). How much they matter, measured with the real generator on the section 8 input (Striver SDE, OS + DBMS + CN + OOP, 23 h a week):

| Minutes (Basic/Easy/Medium/Hard) | Syllabus | 9 weeks: DSA problems / topic groups | 9 weeks: CS sections placed | Left out | 16 weeks: left out |
|---|---|---|---|---|---|
| 30 / 40 / 70 / 120 (now) | 263 h | 103 / 8 | OS 11, DBMS 1, CN 0, OOP 0 | 119 | 34 |
| 25 / 30 / 50 / 90 (25% lower) | 198 h | 129 / 12 | OS 11, DBMS 3 | 89 | 0 |
| 20 / 25 / 42 / 72 (40% lower) | 167 h | 161 / 13 | OS 11, DBMS 5 | 55 | 0 |
| 15 / 20 / 30 / 45 (about Planly's size) | 123 h | 191 / 16 | all 40 sections | 0 | 0 |

So the minutes decide almost everything: at Planly-like times the whole 9-week plan fits; at ours it does not.

- **D1 (recommended): a "my pace" choice, not a new fixed number.** In the builder: Faster, Standard (today's numbers) or Slower, as a multiplier on the minutes (0.6, 1.0, 1.4). The plan stores the pace; the preview says "Planned at standard pace: Medium 70 min" and shows how the coverage changes with the pace. Rebuild and change-hours keep the pace, and a change of pace goes through the same preview and consent as other changes. Files: `planGenerator.js` (`problemMinutes` takes a pace), `plan.model.js` (a `pace` field, default standard), `plan.validators.js`, `plan.controller.js`, the builder form and `usePlanBuilder.js`, the Plan tab change dialog. Tests: pace multiplies planned minutes for every item type that uses problem minutes; the default plan is unchanged; a rebuild keeps the pace; invalid pace is refused.
- **D2:** a short protocol file, `docs/research/TIME_CALIBRATION.md`, for collecting real minutes per problem by hand (no timer in the app), to set the default numbers later.

### Phase E: depth choice per subject (later; decision after Phase B)
- "From the basics" or "Interview recap" per CS subject and "Full sheet" or "Must-do only" for DSA. Phase B's share and trim machinery is the base. It needs content tiers (which sections are the recap) that do not exist yet, so it waits.

### Phase F: close-out (about 0.5 day, after A to C)
- Re-run the section 8 input in the app, record the new result in `docs/research/COMPETITOR_PLANNERS.md` section 9.
- Update `README.md` (My Plan section), `TESTING.md` counts, `PROJECT_STATUS.md`, `docs/plans/MY_PLAN_PLAN.md`, `docs/HANDOFF.md`. Give the owner the `git add` and one-line `git commit` commands. Run server and client tests, build, lint, and the browser specs.

## 3b. Every scenario, not only one (added 15 Nov 2026 at the owner's request)

The first comparison used one case: 8 to 9 weeks, a student who knows basic to intermediate DSA, 23 h a week. A plan must work for every kind of student. `server/scripts/plan-scenarios.js` (read only; `cd server && node scripts/plan-scenarios.js`) runs the real generator on 320 combinations: 5 goal/sheet pairs (big-tech with NeetCode 150 or Striver SDE; placements with Striver A2Z, Blind 75 or Love Babbar), 8 lengths (1, 2, 4, 6, 8, 12, 16, 26 weeks), 4 daily-hour levels (1, 2, 3, 5 hours on weekdays, one more at weekends, Sunday off), both styles, all four CS subjects chosen, nothing solved.

**Result (15 Nov 2026):** no errors and no empty plans, but **284 of 320 plans cut something; in 262 of those (92%) at least one chosen CS subject has 0 sections, and in 221 (78%) fewer than half of the DSA topic groups are placed.** Examples: a placements plan on Striver A2Z at 2 h on weekdays places 2 of 56 topic groups in 1 week, 6 of 56 in 8 weeks, 18 of 56 in 26 weeks, and drops CN and OOP even at 26 weeks; a Blind 75 plan at 1 h on weekdays places 7 of 17 groups in 8 weeks and none of the four CS subjects at 1 or 2 weeks. So the problem in section 1 is the normal case, not a corner.

| Scenario | What the code does today | Gap | Where it is handled |
|---|---|---|---|
| Short deadline (1 to 2 weeks), interview soon | Fills the first topics of the sheet in order | A one-week plan should reach many patterns, not finish Arrays; what a good one-week plan contains is an open question (no data for "most important problems"; only 77 of 1,201 problems appear in more than one sheet, so "problems every sheet agrees on" does not work) | Phase B (breadth first), plus an owner decision on a sprint mode |
| Medium deadline (4 to 8 weeks), few hours | Cuts the tail; chosen subjects drop out | F1 to F3 | Phase A and B |
| Long deadline (6 months) | Fits most things | Large sheets (A2Z 446, Love Babbar 450) still cut; CN and OOP missing at 26 weeks on A2Z | Phase B (fair share) |
| Low hours (1 h a day) | Plan exists but covers 2 to 7 topic groups | Same | Phase A and B; the preview must say it plainly |
| High hours (5 h a day) | Fits more; budget stays 85% | Fine, checked in the sweep | Sweep test |
| Complete beginner (needs prerequisites: loops, complexity, recursion basics) | Starts at the first sheet topic | No "from zero" path; Planly asks a level per subject | Phase E (levels), needs content |
| Basic to intermediate (the case we tested) | As above | F1 to F3 | Phase A and B |
| Advanced, revision only (15 to 20 days) | Plan the whole sheet; the student can mark known topics by hand | No "quick revision" level | Phase E |
| Already solved many problems | Sheet progress is excluded before planning | Fine; needs a test in the sweep with solved problems | Sweep test |
| Works on weekends only (weekday hours 0) | Allowed if one day has hours | Not in the sweep yet | Add to the sweep |
| Exam break or illness | Pause and resume, lighter days, review catch-up | Done | Already built |
| Starts on a rest day or a weekend | Fixed 15 Nov (first week) | Done | Fixed |
| Role switch (roadmap goals) | Separate roadmap generator | Not swept, not changed here | Out of scope for this plan; add to the sweep later |
| Different CS subject choices (one, two, none) | Subjects chosen are placed in the order given | "None" and "System Design" not in the sweep | Add to the sweep |
| Different time per problem | One fixed set of minutes | Phase D (pace choice) | Phase D |

**Rule for this plan:** every phase is tested with the sweep, not with one example. The sweep becomes a test file in Phase B (invariants below), and `plan-scenarios.js` stays as the human-readable report.

**Invariants the sweep test must check (new, Phase B):**
1. No plan is empty and none throws for a valid input.
2. For every plan that cuts something, each chosen CS subject has at least min(3, its sections) sections, unless the plan has fewer than 14 study hours in total.
3. For every plan, the DSA groups placed are never fewer than min(groups, a floor set by the hours); the floor is an owner decision (recommended: at least one problem in every topic group when the new-work minutes allow it).
4. Total planned minutes are within the 85% budget; a longer plan never contains fewer minutes of the same input.
5. The output is identical for the same input (deterministic).

## 4. Order and size (recommended)

| Order | Phase | Size | Depends on |
|---|---|---|---|
| 1 | A: say what is missing | 1 to 1.5 days | none |
| 2 | C: screen clarity | 1 to 2 days | none (parallel with A) |
| 3 | B: spread the squeeze | 4 to 6 days | owner decision, A for the screen |
| 4 | F: close-out | 0.5 day | A to C |
| 4b | D1: "my pace" choice (Faster, Standard, Slower) | 2 to 3 days | owner decision |
| 5 | D2: time calibration protocol | 0.5 day, then the pilot | pilot starts |
| later | E: depth choice | not sized | B, content tiers |

About 8 to 10 working days for A, B, C and F.

## 5. Decisions the owner must make (recommend, then ask)

1. Do Phase B (spread the squeeze), or only Phase A (name what is missing)? **Recommended: do both; A alone makes the problem visible but does not fix it.**
2. Minimum per chosen subject: 3 sections? **Recommended: 3** (or all if it has fewer).
3. Trim order inside a topic: Hard problems first? **Recommended: yes, then the last problems of the topic.**
4. Show the "not included" list to logged-out visitors in the public preview? **Recommended: yes.** It is the honest part of the preview.
5. Phase E (depth levels) now or after the pilot? **Recommended: after.**
6. Time per problem: add the "my pace" choice (D1) and keep today's numbers (D2 sets better defaults later)? Or lower the default numbers now? **Recommended: D1 plus D2.** If you prefer to lower the defaults now, the least risky step is about 25% lower (Easy 30, Medium 50, Hard 90).
7. Pace multipliers 0.6, 1.0 and 1.4? **Recommended: yes.**
8. What should a 1 to 2 week plan contain? **Recommended: ask the owner for the 10 to 15 patterns they would drill first for a short interview and make that an owner-written list, instead of the first topics of the sheet.** We have no data to rank "most important" problems.
9. Floor for DSA topic groups in a short or low-hours plan (invariant 3): at least one problem in every group when the new-work minutes allow it? **Recommended: yes.**
10. Beginners and advanced students (Phase E): a level choice per subject now, or after the pilot? **Recommended: after the pilot, but write the "from zero" and "quick revision" cases into the pilot questions.**

### Decisions recorded (owner answers, 15 Nov 2026)

- **Minutes:** a "my pace" choice (Faster, Standard, Slower) and the current defaults (30/40/70/120) stay until the December pilot sets them. (Decision 6.)
- **Floors:** every chosen CS subject gets at least 3 sections and every DSA topic group at least 1 problem, when the minutes allow it. (Decisions 2 and 9.)
- **Short plans (1 to 2 weeks):** the owner dropped this (15 Nov 2026): no special handling and no pattern list needed.
- **Scope (which phases):** not answered yet; the owner asked to see this plan first.
- Still open: decisions 1, 3, 4, 5, 10 (recommended answers stand until the owner says otherwise).

## 6. What we are not doing (on purpose)

- **No video lessons or our own full course.** Planly's plan is built on TUF's own course; we keep linking to the original problem sites and our own notes.
- **No coin rewards, streak games or daily check-in rewards.**
- **No AI helper inside the planner** (like "Ask Tufy"). The schedule stays plain code; the AI is not in the scheduler.
- **No task timer.** This is the owner's rule; time is collected by hand (Phase D).
- **No new fixed default for the minutes (30/40/70/120), and no copying of Planly's 17 to 37 minutes.** A pace choice lets each student correct the numbers (D1).
- **No packing 6 to 7 problems into a day** to look more complete. A fuller list with unrealistic times is worse than a smaller honest one.
- **No paywall, plan caps or hour caps.** PrepStack stays free.
- **No change to the Today screen** (decision 33: today's items, the time, one Start button).
- **No removal of reviews, mock interviews or behavioral questions** to match competitors; they are the difference.
- **No changes to pause, resume, sprints, the study calendar, deadline extension or substitutes.**
- **No change to roadmap ("role") plans** in this work; only sheet goals.
- **No automatic deadline extension.** A longer plan is the student's choice and needs a preview.
- **No in-browser code editor now.** It is parked.
- **No plan export to a file or calendar now.** A good idea (PracHub has it), not in this plan.
- **No new subjects and no change to the notes** (high-level system design stays as it is; the LLD notes are a separate item in `PROJECT_STATUS.md`).
- **No claim that PrepStack is "better than Planly".** We have not seen Planly's paid screens (missed-day handling, timers, revision). What we can say, as measured: it is free, and it has reviews, previews and pause that Planly's free pages did not show.

## 7. Status (15 Nov 2026, evening): built, tested, not committed

| Phase | State | Notes |
|---|---|---|
| 0 Before numbers | Done | Sweep and the 9-week case saved (section 8 of the research file) |
| A Name what is missing | Done | `coverage.byGroup` (topic group or subject: total, placed, state); preview card, Plan tab "See what is not in your plan", rebuild/pace preview |
| B Fair share with floors | Done | One-problem floor per topic group (groups merge "Arrays - I..IV"), 3-section floor per chosen subject, Hard trimmed first, extras (non-core) only with what is left, part-done rebuild items always kept, re-choice until nothing is left over after packing. Roadmap ("role") plans unchanged |
| B-short (1 to 2 week plans) | Dropped by the owner (15 Nov 2026): short plans need no special handling | |
| C Screen clarity | Done | Dates in words, day totals ("2 tasks · 1 h 50 min"), week summary line, readable preview week; Today screen unchanged (a browser spec checks it) |
| D1 My pace | Done | Faster 0.6 / Standard 1.0 / Slower 1.4; builder, link, saved plan, "Change pace" with preview and consent; rebuilds keep it |
| D2 Time calibration protocol | Not started | `docs/research/TIME_CALIBRATION.md` still to write |
| E Depth levels | Not started | Later |

**What changed against the plan text (owner to confirm or reverse):**
1. The floor is per merged topic group, not per sub-topic ("Arrays - I" and "Arrays - II" share one problem). The per-sub-topic floor was too heavy (it broke the 3-section floor of CS subjects on 4-week plans).
2. Extra (non-core) topics also keep their one-problem floor instead of being dropped first. This follows the owner's floor decision ("every topic group at least 1 problem").
3. When the packing of whole items leaves something over, the choice is made again with a little less room. A normal plan now fills about 2 to 4 percent less of its room than the old tail-cut plan (8,454 against 8,718 minutes on the 12-week NeetCode example, 5,653 against 5,865 at 8 weeks, 4,306 against 4,380 at 6), in exchange for covering every topic.
4. For a study day with less than 30 minutes of room (a 30-minute day), the minimum size of a split part is scaled down; before, such days stayed about half empty.

**Measured after (Striver SDE, 9 weeks, 23 h a week, OS + DBMS + CN + OOP, standard pace):** 153 items, 122.6 h; all 20 topic groups and subjects present (20 only partly); CS sections OS 6 of 11, DBMS 6 of 10, CN 5 of 10, OOP 5 of 10; before it was 135 items with OS 11, DBMS 1, CN 0, OOP 0 and 8 of 16 topic groups absent. At the faster pace: 213 items, 157 DSA problems, 38 left out; slower: 112 items, 75 DSA problems, 140 left out.
**Sweep (320 requests):** plans with a chosen subject at 0 sections 262 → 86; with fewer than half of the topic groups 221 → 26.
**Scenario runner (`node scripts/plan-fuzz.js 3000 <seed>`):** 9,000 requests on three seeds (fresh plans, and changes mid-plan with work ticked off): 0 rule violations; 800 of them run in `test/plan-scenarios.test.js`. Deliberately broken versions of the generator were caught (6 of 6 breaks).

**Known limits, said plainly:**
- Packing: on days where items are close to the size of the day (for example Medium problems at the slower pace on 1.5-hour days), 20 to 35 percent of a day can stay empty. This is the old splitting rule, not changed.
- A plan for the biggest sheet at 26 weeks takes the server about 0.4 s to calculate (normal plans 0.05 to 0.1 s); the preview is limited to 20 a minute per IP.
- Not covered by an automated random test: the item routes (ticks, reviews, skips, moves), pause and resume, report imports and substitutes through the API. They have their own tests (plan-items, plan-api, plan-replset, browser specs), but no random walk over them.
