# PrepStack: status and build order

**The one place to see what is done and what is left.** Last updated 13 Nov 2026 (after My plan Phase 2). Update this file whenever an item changes state (rule at the bottom). Details live in `IMPROVEMENT_PLAN.md` and `docs/plans/`; this file only tracks status and order. It replaces the old `ORDER.md` (deleted; its text is in git history).

**What PrepStack is:** a free interview-prep platform (no payment). Login is the gate for generating plans and saving progress. Content must be accurate, in easy words, and sourced. The goal planner "My plan" is the planned differentiator. The owner starts their own MAANG SDE prep in Dec 2026.

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
| Tests | server 762, client 85, build, lint and SEO check pass | `TESTING.md` |

## Left, in build order

| # | What | Who | Size | Notes |
|---|---|---|---|---|
| 1 | **Seed and deploy:** `npm run seed:notes` on the live database (OS, OOP and System Design are not live until then), deploy the server, then the client; open one System Design page live (it has not been seen with real data) | owner | about 30 min | deploy order in `IMPROVEMENT_PLAN.md` |
| 2 | **LLD notes** (the owner started My plan Phase 0 first, so LLD can run before or after My plan Phase 1; the owner decides): new subject `lld`, one section per classic problem (parking lot, LRU cache, elevator and so on) in Java, every program run. `awesome-low-level-design` is GPL: use problem titles only, never its code. Write the plan first (`docs/plans/LLD_NOTES_PLAN.md`), then drafts, reviews, publish, wiring (same list as System Design: `server/src/data/notes/<slug>.js`, seed, test subject lists and counts, skill catalog, Notes page card, SEO page, report-link names, docs) | Claude | about a third of the System Design effort; use few agents (cost) | build order set by the owner 13 Nov 2026 |
| 3 | **My plan (B5), the goal planner:** **Phases 0 to 2 done 13 Nov 2026** (data fixes, ref kinds, limits, catalogs; the generator core with its acceptance tests; the adjustments: review ladder, skip, move, locks, lighter days, rebuild preview with diff; the owner re-seeds the sheets with `npm run seed:all`); Phase 3 (the Plan model and the public preview API) is next. Phase 0 setup (NeetCode 150 data, ref kinds), 1 to 2 the generator, 3 to 4 the model and API, 5 to 6 the builder page and daily screens, 7 connections and close-out, 8 the student check | Claude | 16 to 18 working days in 8 phases (no timer, decided 13 Nov 2026) | `docs/plans/MY_PLAN_PLAN.md` (version 8) |
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

## Rules for the work (short)
Content: every fact from a primary source that was read; own words; easy words with the technical term kept; numbers computed by a script; reviewers re-fetch sources; publish only on the owner's word. The owner commits and runs the seeds (one-line commit message, no trailer). Recommend, then ask, for decisions. Details: `CLAUDE.md`, `docs/content/NOTES_TEMPLATE.md`, `IMPROVEMENT_PLAN.md` section 6.

## How to keep this file true
After finishing, starting or dropping any item: move it between the tables, change the "Last updated" date, and say in one line what changed in the work's own plan file. Do not let this file and `IMPROVEMENT_PLAN.md` disagree: this file wins for status, the plan file wins for detail.
