# PrepStack: status and build order

**Dashboard layout and signup, 16 Nov 2026.** Direct signup opens the dashboard or honors a safe explicit return link. One dashboard tab row leads directly to DSA progress, My plan, Projects, or Reports. The My plan empty state leads with Build my plan and keeps history and study settings accessible. A paused plan offers Resume. Report checklists live on their reports. The dashboard uses a neutral greeting for unconfirmed activity and offers a retry if reports fail.

**Planner realism baseline (`d92bd4d`, 16 Nov 2026):** Today fit waiting work into the learner's available minutes and kept the full backlog in Plan. Resume preserves completed work and fits pending tasks around rest days and lighter days. The preview shows extra deadline time and changes to manually moved tasks. A rebuild retains unscheduled split minutes and can restore them later.

**Uncommitted planner draft:** A one-week Full Stack plan at 30 minutes per day now schedules 147 minutes across seven parts and reports the remaining time. Today now offers the smallest waiting task when no task fits. The verified 30-minute day can therefore show a 90-minute task. Settle the intended Today behavior before shipping.

**Coverage and pace (15–16 Nov 2026):** Sheet plans target one problem per DSA topic group and three sections per selected CS subject when time permits. The plan explains omissions and shows dates, day totals and week summaries. Faster, Standard and Slower adjust DSA problem estimates. The builder disables Generate when nothing can be scheduled. Report-only plans have no pace setting, and substitute problems use the plan's pace. See `docs/plans/MY_PLAN_COVERAGE_PLAN.md` for scope and the latest short-plan results.

**Recovery follow-up complete, 15 Nov 2026:** both owner-approved phases are implemented. Phase 1 adds provider-aware problem identity, deadline extension and equivalent resources/distinct substitutes. Phase 2 adds account timezone/rollover, pause/resume with shifted tasks and reviews, review catch-up, and one paused main plan alongside one active sprint. Today keeps one Start button. Final verification: server 924 / 170 suites, client 122 / 13 files, 11 browser flows, build, lint and SEO pass; three recovery mutations caught and restored. Deployment and human validation remain.

**The one place to see what is done and what is left.** Last updated 16 Nov 2026. Use `BUILD_CHECKLIST.md` for build order and `TESTING.md` for verification. Dated phase entries below record their state at the time.

**Phase 7 complete, 15 Nov 2026:** dashboard My plan tab reuses the daily workspace and its state, comes first when a plan exists, and keeps dashboard statistics outside Today. Other tabs use goal-plan Today or the Analyzer fallback only after confirming no goal plan exists. The overview includes plan progress. Reports have explicit merge/replace previews with ownership, duplicate, stale-consent, capacity and failed-save protection; report-only plans rebuild their own tasks. Topic practice never solves individual sheet problems. Privacy and account-deletion copy include current/history plans, and seed-data imports no longer load environment files or change DNS. Final server 910 / 168 suites, client 121 / 13 files, eight browser flows, build, lint and SEO pass (37 pages, 7 indexable); two security mutations caught. The outside-link sweep had one transient GNU timeout (targeted retry 200) and one bot-blocked LabEx URL. Phase 8 real-user validation and deployment remain; see `TESTING.md`.

**Phase 6 complete, 15 Nov 2026:** private `/my-plan/study` workspace with the sacred Today screen, task results, existing notes quizzes, due and weekly reviews, starred practice, weekly checklist, skip/restore/move/minutes/custom tasks, previewed changes and Pull tomorrow, read-only history and optional revision practice. The builder links to daily study. Revision practice changes no saved completions or review dates; refreshing ends the local practice round. Final checks: server 901 / 167 suites, client 119 / 13 files, five automated browser flows at mobile and desktop widths, build, lint and SEO (37 pages, 7 indexable) pass. Three deliberate mutations caught. Phase 7 dashboard/Analyzer connections are next; see `TESTING.md` for limits.

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
| Resume guide, checklist, saved problem notes, Role Analyzer | built and live-tested (analyzer fixes after two live runs on 12 Nov) | `IMPROVEMENT_PLAN.md` A3, B2, B4, `docs/archive/ANALYZER_PLAN.md` |
| Live database seeding | OS, OOP, and System Design notes (`npm run seed:notes`) and all DSA sheets (`npm run seed:all`) seeded on live database by owner | Live MongoDB instance |
| Password reset, login lock, account deletion | built | `README.md` |
| My plan (B5) | Phases 0–7 implemented: builder, daily workspace, dashboard, report imports, reviews and read-only history; Phase 8 real-user validation remains | `docs/plans/MY_PLAN_PLAN.md` |
| Tests | Server 1068 (18 Nov), client 136 and 28 browser flows passed (16 Nov). Build, lint and SEO passed (91 indexable pages). 5,000 generated scenarios, 53 named scenarios (about 12,250 independent checks) and 900 simulated student lives found zero rule violations; no role plan is empty across 486 combinations. Eight mixed API journeys and 28 resume combinations passed. | `TESTING.md` |

## Left, in build order

The order of work, with a tick box for every feature, is in **`BUILD_CHECKLIST.md`** (root). Tick it when a feature is finished. It replaces the old table that was here (LLD notes, deploy, student check, stage 6), which is now covered there in the same order with the new work added.

Everything else that is planned, including the parked plans, is listed in `BUILD_CHECKLIST.md` sections 9 to 16.

## Open items (small, no fixed slot)
- **DSA pattern lessons (optional, not started):** 34 lessons in 13 steps in the notes format, a new `dsa` subject, Java examples run by scripts, three waves, about 6 to 7 weeks: `docs/plans/DSA_LESSONS_PLAN.md`.
- **Depth levels per subject (decided, not started):** a level for each CS subject (quick recap, full, deep dive with 26 advanced sections to write) and for DSA (from the basics, standard, quick revision): `docs/plans/MY_PLAN_DEPTH_LEVELS_PLAN.md`, about 12 to 14 days.
- **My Plan verification:** confirm the deployed revision and do the live smoke test, extend the API checks with randomized action sequences, then run the Phase 8 pilot and calibrate time estimates. The checklist already records the planned order. Dedicated short-interview scheduling remains out of scope per the 15 Nov decision.
- The three Role Analyzer changes the owner set aside (12 Nov).
- A browser check of the Behavioral page and of the real notes pages on the live site (they are open to read since 16 Nov; the signed-out flow is covered by `client/e2e/logged-out.spec.js`).
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
