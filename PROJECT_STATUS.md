# PrepStack: status and build order

**The one place to see what is done and what is left.** Last updated 14 Nov 2026 (after My plan Phase 5). Update this file whenever an item changes state (rule at the bottom). Details live in `IMPROVEMENT_PLAN.md` and `docs/plans/`; this file only tracks status and order. It replaces the old `ORDER.md` (deleted; its text is in git history).

**What PrepStack is:** a free interview-prep platform (no payment). Login is the gate for generating plans and saving progress. Content must be accurate, in easy words, and sourced. The goal planner "My plan" is the planned differentiator. The owner starts their own MAANG SDE prep in Dec 2026.

**Reliability follow-up, 14 Nov 2026:** early/skipped and repeat same-day reviews are refused; concurrent review replies cannot advance the same stage twice. Google conflicts retain 409 for password sign-in/linking. Problem-note saves are serialized per account/problem, retain pending edits/deletions in browser storage, recover after reload/remount and retry on reconnect. Notes publishing validates and replaces atomically on a replica set/Atlas, refuses standalone databases without clearing data, and exits unsuccessfully on failure. Keyboard focus, disclosure states, login control names and delete-dialog focus handling are fixed. Private read-only history endpoints are built; expired plans reject item edits. The owner accepted optional revision after completion (no automatic second pass), and Pull tomorrow in the Plan tab only. Those controls/history screens remain Phase 6 work; Today keeps one Start button. Last full run: server 900/client 99, build and SEO passed; eight deliberate mutations caught. Final autosave lifecycle/storage corrections passed lint, but their test/build reruns were declined; 100 client tests are now defined. Final verification remains pending (see TESTING.md). Browser keyboard checks passed at desktop/mobile widths with disposable data. Existing files/tests were reused; no new project files. See `TESTING.md` and `docs/plans/MY_PLAN_PLAN.md`. Other original audit findings (including sheet-import side effects) and independent source verification remain outside this pass.

**My plan Phase 5 completed, 14 Nov 2026:** public `/my-plan` builder, three goals, validated URL settings, live server preview, optional known DSA topics, login/sign-up return context, one-use automatic save after login, explicit replacement consent, and a read-only view of all saved weeks. Public choices come from the same source data as the generator. All seven native dropdowns (builder and project filters) now use a shared responsive SelectField; menus fit the viewport, second trigger clicks close, and scrollbar locking does not shift the desktop page. Navigation switches to its compact layout below 1280 px. The new functions have purpose comments and API requests use separate request/return statements. Full server 901/client 112, build, lint and SEO pass (36 pages, 7 indexable, no SEO warnings); two login-intent mutations caught. The previous pending autosave checks also passed. Phase 6 daily screens are next; Today remains unchanged. Details: `TESTING.md` and `docs/plans/MY_PLAN_PLAN.md`.

## Done

| Area | What exists | Where |
|---|---|---|
| Foundations (stages 0 to 2) | shared empty/limit states, progress with dates and IST streaks, limits shown on pages, permanent ids, notes validator, computed counts, note pages with quiz and diagrams, internal-link and outside-link checks | `IMPROVEMENT_PLAN.md` stages 0 to 2 |
| CS notes, 5 subjects | DBMS 10, Computer Networks 10, Operating Systems 11, OOP in Java 10, **System Design 23** (11 concepts + 12 case studies, committed 13 Nov 2026) | `server/src/data/notes/`, plans `NOTES_OS_OOP_PLAN.md`, `HLD_NOTES_PLAN.md` |
| Diagrams | flow, layers, graph (shapes, zones, numbered and dashed arrows) and sequence; 6 per section for System Design | `client/src/components/notes/` |
| Roadmaps | 9 roadmaps (the first 6 with 52 steps, then DSA, Java and Spring Boot, DevOps and cloud), all in the full template with official-doc resources | `client/src/data/roadmaps.js` |
| Behavioral guide | 50 questions in 10 groups; the story bank was **skipped** by the owner | `client/src/data/behavioralQuestions.js` |
| Resume guide, checklist, saved problem notes, Role Analyzer | built and live-tested (analyzer fixes after two live runs on 12 Nov) | `IMPROVEMENT_PLAN.md` A3, B2, B4, `docs/plans/ANALYZER_PLAN.md` |
| Password reset, login lock, account deletion | built | `README.md` |
| Tests | server 901, client 112, build, lint and SEO pass; pending checks cleared; Phase 5 login-intent mutations caught | `TESTING.md` |

## Left, in build order

| # | What | Who | Size | Notes |
|---|---|---|---|---|
| 1 | **Seed and deploy:** `npm run seed:notes` on the live database (OS, OOP and System Design are not live until then), deploy the server, then the client; open one System Design page live (it has not been seen with real data) | owner | about 30 min | deploy order in `IMPROVEMENT_PLAN.md` |
| 2 | **LLD notes** (the owner started My plan Phase 0 first, so LLD can run before or after My plan Phase 1; the owner decides): new subject `lld`, one section per classic problem (parking lot, LRU cache, elevator and so on) in Java, every program run. `awesome-low-level-design` is GPL: use problem titles only, never its code. Write the plan first (`docs/plans/LLD_NOTES_PLAN.md`), then drafts, reviews, publish, wiring (same list as System Design: `server/src/data/notes/<slug>.js`, seed, test subject lists and counts, skill catalog, Notes page card, SEO page, report-link names, docs) | Claude | about a third of the System Design effort; use few agents (cost) | build order set by the owner 13 Nov 2026 |
| 3 | **My plan (B5): Phases 0 to 5 done.** Generator, adjustment rules, model/API, item routes, public builder and login/save flow built. **Phase 6 is next:** Today, daily actions, reviews and weekly-plan controls. Then Phase 7 connections/close-out and Phase 8 student check. Owner runs live seeds/deploys. | Claude | no timer in version 1 | `docs/plans/MY_PLAN_PLAN.md` |
| 4 | **Student check on the working My plan:** 3 to 5 students and 2 to 3 job switchers; start finding them now, people take weeks. Also find one outside reader per notes subject and per roadmap (none yet) | owner | weeks of waiting | `docs/content/SOURCES.md` tables; if they say no, stop at the checklist (B4) |
| 5 | **Stage 6 (later):** B7 quizzes (the quiz data already exists in every section), the DSA problems plan (one problem file for many sheets), Redis and background jobs (an evening learning track; the DSA cache is built there), B12 light theme, B8 public profile, CI | Claude | after My plan | `IMPROVEMENT_PLAN.md` stage 6, `docs/plans/DSA_PROBLEMS_PLAN.md`, `docs/plans/REDIS_PLAN.md` |

**Parked (not in the order):** DebugLab (`docs/plans/DEBUGLAB_PLAN.md`), the LeetCode extension (`docs/plans/EXTENSION.md`), Analyzer Part 2 (starts only if students say yes), growth ideas (`docs/research/GROWTH_IDEAS.md`), a college dashboard.

## Open items (small, no fixed slot)
- The three Role Analyzer changes the owner set aside (12 Nov).
- A browser check of the Behavioral page and of the real notes pages (both need a login).
- The Cassandra example in System Design was read, not run; the System Design claim table in `docs/content/SOURCES.md` has only the heaviest claims.
- About half of the 120 catalog skills have no PrepStack lessons yet (the System Design and LLD notes cover some).
- No outside reader has read any notes subject, roadmap or the behavioral guide: the notes say "checked by the author and AI reviewers".
- Known limitations: rate limits live in server memory; free AI tiers can fail; reset emails go from a free address (README).

## Handoff
Another agent can continue from `docs/HANDOFF.md` (state, API contract, client conventions, practical notes) and `AGENTS.md`.

## Rules for the work (short)
Content: every fact from a primary source that was read; own words; easy words with the technical term kept; numbers computed by a script; reviewers re-fetch sources; publish only on the owner's word. The owner commits and runs the seeds (one-line commit message, no trailer). Recommend, then ask, for decisions. Details: `CLAUDE.md`, `docs/content/NOTES_TEMPLATE.md`, `IMPROVEMENT_PLAN.md` section 6.

## How to keep this file true
After finishing, starting or dropping any item: move it between the tables, change the "Last updated" date, and say in one line what changed in the work's own plan file. Do not let this file and `IMPROVEMENT_PLAN.md` disagree: this file wins for status, the plan file wins for detail.
