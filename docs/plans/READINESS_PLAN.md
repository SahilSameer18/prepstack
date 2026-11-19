# Readiness by topic: a plan (19 Nov 2026, revised the same day, proposed, no code written, the owner decides)

## 1. The idea in one line
Show a learner **which topics they can solve without hints a week or more later**, instead of how many problems they have solved, and let the plan act on it. It must work for a student who **only tracks DSA sheets** and never builds a plan. Pitch: "We measure what interviews measure."

## 2. Why (research, with how strong each piece is)
| Finding | Source | Strength |
|---|---|---|
| People with 300 to 600 solved problems still freeze or fail on new ones; the count is a poor measure | LeetCode discussion posts, AlgoCademy and other blogs | Anecdotes, many from sites that sell courses |
| "Can you re-solve it from scratch after about a week?" is the commonly used test of real learning | Several study-plan blogs | Opinion, no study of coding |
| Practice testing and spread-out practice are the only two of ten study techniques rated high in utility | Dunlosky and others 2013, *Psychological Science in the Public Interest* | Strong, but read through summaries, not the full text |
| The best gap between study sessions grows with the time until the final test (839 assessments, 317 experiments) | Cepeda and others 2006, *Psychological Bulletin* | Strong, but it studied verbal recall, not coding; the full paper was not read |
| Interviewers score four things: communication, problem solving (hints needed lowers it), technical skill, testing (typical and corner cases, self-correcting bugs) | techinterviewhandbook.org/coding-signals, by an ex-Meta staff engineer | One author's synthesis; the page cites no company's official rubric |
| Planning fatigue and quitting around week five are common | DEV posts, Levelop | Anecdotes |

**Honest limit:** nothing above proves that PrepStack users want this, or that a readiness view improves interview results. Only a real-student check can show that.

## 3. Is it unique? No, not on its own
Free or indie tools already track pattern mastery and spaced re-solving: CodeSteward (per-pattern mastery), DSAPrep, LeetTrack (Obsidian), PatternBank, Smarana, and the Leetcode Anki extension. I did not check NeetCode or AlgoMonster features. What none of them seems to do (not verified for every tool) is combine this with a plan that fits your hours, survives missed weeks, and shows an honest finish date, in one free place with CS notes. **The combination is the differentiator, not the chart.**

## 4. What PrepStack already stores (read from the code, 19 Nov 2026)
- **My plan items** (`plan.model.js`): `result` (alone, hints, solution), `sheet`, `topicId`, `topicTitle`, `difficulty`, `doneAt`, `quizScore`, and the review state (`reviewLadder`, `reviewStage`, `nextReviewDay`, `lastFailedDay`, `lastReviewDay`).
- **Review ladders** by first result (`planAdjust.js`): alone 7 then 30 days; hints 3, 14, 45; solution 1, 4, 14, 45; notes 3, 10, 30. A passed review moves up one gap; a failed one goes back to the first gap.
- **The weekly review** (`plan.controller.js`, `weakTopics`) lists weak items for one week only.
- **Sheet-only tracking** (`progress.model.js`): only the problem link, when it was ticked and the study day. **No answer (alone, hints, solution), no review, no history.** Problem notes (`problemNote.model.js`) hold pattern, complexity and own words, not how it went.

## 5. What is missing
1. **No history.** A review only changes the item's current state, so "re-solved alone on day 8" cannot be shown afterwards.
2. **A review answer is only pass or fail.** The interview signal is hint level on the re-solve.
3. **Readiness is per item and per week, not per topic across weeks.**
4. **Plans are rebuilt and deleted**, so anything kept only inside a plan is lost with it.
5. **Sheet-only students have nothing to measure**, so a plan-only readiness view would be empty for them.
6. **Topics differ by sheet.** NeetCode topics are close to patterns; Striver's are categories. A shared pattern list belongs to `DSA_PROBLEMS_PLAN.md` (checklist section 9), so the first version uses the sheet's own topic.

## 6. Proposed design: one history for everyone
**One event log, written from every place a problem is solved or revisited.** A small separate collection `ReviewEvent { user (ref User, so account deletion wipes it), problemLink, sheet, topicId, day, kind: first | review, outcome: alone | hints | solution | fail | unknown }`. It is separate from plans so it survives a rebuild. No backfill: it starts the day it ships and says so.

**Three writers:**
1. **My plan:** when a task is marked done and when a review is recorded (the plan keeps its own schedule as today).
2. **The DSA sheet tick:** after ticking a problem, an **optional, skippable** choice "Solved alone / With hints / Needed the solution". Skipping records `unknown` and the tick works exactly as today. Signed-out pages stay unchanged (no personal API call; they keep the "Sign in to save your progress" message).
3. **The sheet "Revisit" marker:** a problem due again (by the same ladder gaps, computed from the log) shows a small "Revisit" mark on the sheet; solving it again records a review event with the same three answers.

**Who owns the schedule when both exist:** a problem that belongs to an active My plan item is scheduled by the plan, as today; the "Revisit" marker applies only to problems outside an active plan. One rule, no double reminders.

**Measure (per topic, shown as counts, never one magic score):** problems first solved; of those, re-solved at least 7 days later; of those, re-solved alone. Example: "Two pointers: 4 of 6 re-solved alone after a week." A topic with fewer than 3 re-solves shows "not enough data yet". `unknown` first answers count as solved but never as evidence of readiness.

**Where it shows:** a **Readiness view** reachable from the dashboard DSA progress and from the My plan workspace (a tab, never on Today, which stays sacred). Weakest topics first, with links to practice them. The weekly review links to it.

## 7. Phases (about 9 to 10 days of building, plus the real-student check)
| # | Phase | Done when |
|---|---|---|
| 0 | Owner decisions (section 9) | Answers recorded |
| 1 | Event log: model, indexes and caps, account-deletion cascade, privacy page line, written by My plan done and review; tests (ownership, caps, cascade, nothing written on a refused review) | Events appear for every plan path; mutation checks pass |
| 2 | Sheet tick: optional three-answer choice, server write, limiter, signed-out behavior unchanged; tests including "skipping changes nothing" | Existing progress and sheet tests pass unchanged; browser check |
| 3 | Readiness function over events plus a script that prints the numbers for made-up students (labelled assumptions), then `GET /api/readiness` | Function matches the script; no 500 on empty data |
| 4 | Readiness view: loading, empty, error and "not enough data" states; 375 px and desktop | Browser check on ports 3100 and 5175 |
| 5 | Sheet "Revisit" marker for problems outside an active plan; solving it records a review | Tests for plan-owned versus sheet-owned problems |
| 6 | Docs: README, TESTING, STATUS, CHECKLIST, this plan | Updated in the same change |
| 7 | Real-student check (3 to 5 students, 2 to 3 job switchers): do they open it, and does it change what they practice? | Owner decides to keep, change or drop |

## 8. Later, separate plans (not part of this one)
- **Interview-date-aware spacing.** The ladders are fixed. The Cepeda result suggests wider gaps when the interview is further away. This changes the planner and needs its own plan.
- **Weak topics feed the plan** (extra practice added automatically). Also a planner change.
- **Interview-habit checklist** per solve (clarified, talked through, edge cases, tested). It adds a step, so test with students first; never on Today.
- **Real minutes per problem** from the LeetCode sync extension.

## 9. Decisions for the owner (recommend, then ask)
1. **One history for plan and sheet users** (recommended) or plan-only (simpler, but empty for sheet-only students).
2. **Review answers** in My plan: keep pass or fail, or change to alone, with hints, failed (recommended: three answers; alone counts as a pass and the other two as before, so the ladder rules do not change).
3. **Sheet tick prompt:** optional and skippable (recommended), or required.
4. **Event storage:** separate `ReviewEvent` collection (recommended) or fields inside existing documents.
5. **Pattern list:** start with the sheet's own topics (recommended) or wait for the shared problems file.
6. **Threshold** for "not enough data": 3 re-solves per topic (recommended).
7. **Order:** this before the other open items, or after the real-student check of the current My plan (recommended: start the student check now, in parallel, since it decides whether this is the right bet).

## 10. Risks
- **Most users skip the answer or never re-solve**, so most topics show "not enough data" for weeks. Mitigation: optional and quick, say so plainly, show counts.
- **The DSA pages are the most visited part of the site**, and a new click on every tick can reduce ticking. Mitigation: skippable, measured with students before wide release.
- **A new write on every tick and review** adds load on the free host. Mitigation: one small capped, indexed insert; measured with the existing load test.
- **Two schedulers** (plan and sheet) could double-remind. Mitigation: the plan-owns-its-problems rule in section 6, with tests.
- The metric is a proxy. A topic marked ready is not a promise of passing an interview. The view will say so.
