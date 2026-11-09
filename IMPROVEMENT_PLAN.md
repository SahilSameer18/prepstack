# PrepStack improvement plan

Written 7 Nov 2026, order and gaps revised 9 Nov 2026. Status: **planned, nothing started.** Follow the stage order in section 5. Related plan: `docs/plans/REDIS_PLAN.md` (Redis, BullMQ and background jobs: a separate learning track; its production steps start only after B3 and B4).

**Updated 7 Nov 2026 (planner positioning):** the Role Analyzer and the planner are one connected system, not two separate plans. The analyzer **checks** a job; "My plan" **schedules** your days. There is only one daily plan, one place to see it, and a stop point if students find it confusing. See section 4, "How the Role Analyzer and the planner fit together".

This plan covers two tracks that run side by side:

- **Track A: Content.** Make the CS notes, roadmaps, resume guide and behavioral guide genuinely good.
- **Track B: Features.** Connect the pieces so PrepStack feels like one product: shared progress, tracked plans, a goal planner, saved notes.

It comes from the study of TUF and CodeHelp in `docs/research/COMPETITOR_STUDY.md` (sections 8 and 9). **Nothing from those sites is to be copied.** They were studied to learn how a product's pieces connect and where products go wrong, not to take their text, structure or design.

---

## 0. How to use this plan

- Work in the stage order of section 5, and top to bottom inside each stage. Every item has **Done when** so you know it is finished.
- Effort numbers are rough guesses for one developer, in working days. Treat them as order of magnitude, and re-estimate after the first item of each track.
- Items marked **DECIDE** need an answer from you before starting (all listed in section 8).
- Each item should ship on its own. Never leave the site half-changed overnight.

---

## 1. Where PrepStack is today (measured 7 Nov 2026)

| Area | What exists | Gaps found |
|---|---|---|
| DSA sheets | 5 sheets (Blind 75, NeetCode 150, Striver SDE, Striver A2Z, Love Babbar 450), about 1,300 problem links out to LeetCode, GeeksforGeeks and similar. Each problem has a title, link, difficulty and tags | Links only. Progress is a list of solved links per sheet |
| Progress data | `Progress`: one document per user per sheet, `solvedProblems` = array of `{ link, solvedAt }` (since 9 Nov 2026; ticks from before have `solvedAt: null`) | Old ticks have no date, so the streak and "last solved" only count ticks made since the change. No heatmap or "solved this week" yet |
| Problem notes | A notes box per problem | Saved only in the browser (`localStorage`). Lost on another device or after clearing data |
| CS notes | 4 subjects, 38 sections, 84 topics, about 4,400 words in total | OS about 2,800 words; DBMS about 450; CN about 460; OOPs about 700. Topics are bullet lists (concept, insight, real world, traps). No quizzes, no links to sheets or roadmaps |
| Roadmaps | 6 tracks (Frontend, Backend, Full Stack MERN, Android, Data Analytics, Machine Learning), 9 steps each (54 steps) | A step is a title, one line, and 2 to 3 external links. No checkpoints, no projects, no links to PrepStack pages, no progress tracking |
| Resume guide | Rewritten in stage 1 (A3): 6 section cards with tips, what recruiters look for, weak and strong bullets and mistakes; basics (one page, bullet formula, file format, ATS notes, links); role notes; a fictional sample resume; a checklist PDF. Login-only | Needs an outside reader before it counts as reviewed. Its claims are listed in `docs/content/SOURCES.md` |
| Behavioral guide | 22 questions: 13 Personal, 4 Teamwork, 4 Problem Solving, **1 Leadership**. Each has a tip and one example answer | Thin: no failure, conflict, ownership, deadline, ambiguity or feedback questions. No story-building help |
| Role Analyzer | Built, tested, live-checked. 120-skill catalog, 53 skills without PrepStack lessons | Plan is read-only. Skill advice links to thin notes |
| AI project ideas | Cascade of Gemini then Groq, capped per user. The form shows how many are left today (`GET /api/usage`) | Not linked to roadmaps |
| Dashboard | Tabs: DSA, Projects, Reports. The DSA tab has a streak tile (IST days) and per-sheet cards with the last solved date | No "today" card yet (B4) |
| Quiz and Aptitude | Removed in stage 0 (B10, 9 Nov 2026): pages, routes and SEO entries are gone | The Quiz comes back later from the notes quizzes (B7) |
| Tests | 542 server tests and 21 client tests (token refresh, raw-color guard, resume PDF), 9 Nov 2026 | No CI |
| Accounts | Password reset by email, a per-account login lock, up to 10 device sessions (built and tested) | Login cookies use SameSite=None; changing that needs the website and the API on one domain |

---

## 2. Rules for all the work

1. **Original content only.** Write it yourself or with AI help and then check it. Do not paste, translate or closely rewrite text from TUF, CodeHelp, GeeksforGeeks, LeetCode, books or videos. Short factual points are fine; facts are not owned, wording is.
2. **Accuracy beats volume.** A wrong CS fact does more harm than a thin page. Every technical claim passes the review checklist in section 6.
3. **One source of truth for numbers.** Counts (sections, problems, questions) are computed from data, never typed by hand. This is where TUF's pages contradict each other, and a test should keep PrepStack from doing the same.
4. **No new AI cost for core features.** Plans and checklists are generated by code. AI stays for project ideas and the analyzer, with their existing limits.
5. **Free, ad-free, honest.** Say what exists today. No "coming soon" features in menus.
6. **Each step is small, tested and live-checked** before the next starts, like the Role Analyzer phases.
7. **When new data is stored, update the privacy policy, the account-deletion cascade (a `user` reference gives this automatically) and the README.**

---

## 3. Track A: Content

### A1. CS notes (the biggest content gap)

**Goal.** Notes a student can actually revise from the night before an interview, correct, and linked to practice.

**The standard every section must meet (write this down as the template):**

| Part | Rule |
|---|---|
| Overview | 60 to 120 words: what it is, why interviewers ask it |
| Topics | 4 to 8 per section. Each topic: a plain definition, why it matters, one worked example or small diagram, how it fails or is misused |
| Interview questions | 3 to 5 real-style questions per section, each with a short correct answer |
| Common mistakes | 2 to 3 per section |
| Quiz | 5 multiple-choice questions per section, each with a one-line explanation |
| Links | To the related sheet topic, to the related roadmap step, and to the next section |
| Reading time | Stated, computed from word count |

**Subject plans.** Keep the existing section titles where they are right, and fill the gaps. The lists below are proposals to confirm against a standard interview syllabus. **DECIDE** each before writing.

| Subject | Existing sections | Proposed additions | Target size |
|---|---|---|---|
| Operating Systems | Introduction, Processes & Threads, CPU Scheduling, Synchronization, Deadlocks, Memory Management, Disk Scheduling, System Concepts, Interview Boost | Paging and virtual memory in detail, page replacement algorithms, file systems, system calls and IPC, containers vs virtual machines | about 6,000 words |
| DBMS | Introduction, ER Model, Keys & Constraints, Functional Dependency, Normalization, Transactions, Concurrency Control, Indexing & File Organization, SQL, Advanced Concepts | SQL joins and subqueries with worked examples, window functions, query optimisation basics, isolation levels, SQL vs NoSQL, scaling basics (replication, sharding) | about 7,000 words |
| Computer Networks | Basics, OSI, TCP/IP, IP Addressing, Transport, Application, Protocols, Devices, Key Flows, System Design Concepts | What happens when you type a URL, HTTP and HTTPS and TLS, DNS in depth, TCP handshake and congestion basics, sockets, REST and WebSockets | about 5,500 words |
| OOP | Basics, Pillars, Polymorphism, Constructors & Destructors, Virtual Functions, Relationships, Advanced Concepts, SOLID, Interview Boost | The language question: the current titles read as C++-flavoured. **DECIDE:** C++ or Java (or both examples). Design patterns (the common 6 to 8), low-level design starter problems | about 5,000 words |
| System Design basics (new) | none | For job switchers and senior-ish interviews: scalability basics, caching, load balancing, databases choice, a few worked designs. Only start after the four above | about 4,000 words |

**Work order inside A1:** DBMS first (most asked, thinnest), then CN, then OOP, then deepen OS, then System Design basics.

**Process per section:** outline, draft, fact-check against the review checklist (section 6), add quiz, link, publish. Aim for one subject to completion before starting the next.

**Data change needed:** the notes shape today is `{ title, overview, topics: [...] }` with free-form topic fields, and a section is found by its title. Give every section a stable `id` (never the title) and add `questions`, `mistakes`, `quiz`, `links`, optional `diagrams` and `lastChecked`; reading time is computed from the word count. Validate it with the existing `sectionSchema`. This also needs updates to the notes seed, the notes API tests, the analyzer's references (from titles to ids) and the client notes page.

**Shape decided in stage 2 planning (9 Nov 2026).** A section id is `<subject>-<words>` (for example `os-deadlocks`) and never changes. Ids are always required and unique. The full template (overview, 4 to 8 topics each with definition, why, example and how it fails, 3 to 5 questions, 2 to 3 mistakes, a 5-question quiz, links that resolve) is enforced only on a section that has `lastChecked`, so old sections keep working until they are rewritten and the strict check turns on section by section. A rewritten section is shown in the new layout; an old one shows its old topic blocks inside the same page frame until the last section is rewritten (end of stage 3), when the old renderer is deleted. Section pages are at `/notes/:subject/:sectionId`. Reading time, counts and the latest checked date come from the data through `GET /api/notes`, not typed by hand.

**Page redesign and diagrams (decided 7 Nov).** The notes and roadmap pages are redesigned together with the content: one clear layout for overview, topics, interview questions, mistakes, quiz and links, with a "Report a mistake" link and a "last checked" date on every section. A small component draws a diagram from inline SVG data where a topic needs one, not on every topic. This is done in stage 2, before the writing starts. **Effort:** about 3 days for the two pages and 1 to 2 days for the diagram component.

**Decided 9 Nov 2026:** a diagram is plain data (kinds: `flow`, `layers`, `graph`, each with a text caption) drawn by one SVG component that takes its colours from the design tokens. "Report a mistake" is an email link with the section id and title filled in (the address is still to be chosen).

**Effort:** about 3 to 4 working days per subject for writing and checking (DBMS, CN, OOP), 2 days to deepen OS, 4 days for System Design basics; 2 days for the data shape and ids, plus the redesign and diagrams above. **Total about 22 to 27 days.**

**Done when:**
- Every section meets the template above (a script checks the counts: topics, questions, quiz length, links).
- All quizzes score correctly in a test.
- No section has a claim that fails the review checklist.
- The analyzer's `skillCatalog.json` mappings are updated to point at the new sections (see A5).
- Every section shows its reading time, its "last checked" date and a "Report a mistake" link.
- Diagrams render where a topic has one.
- Every link between notes, sheets and roadmaps resolves (an automatic test).

### A2. Roadmaps

**Goal.** A roadmap should tell you what to do, in what order, how to know you are done, and what to build.

**Step template (replace today's title + one line + links):**

| Field | Rule |
|---|---|
| Title and goal | One sentence: "After this step you can ..." |
| Topics checklist | 4 to 8 concrete topics |
| Time estimate | Hours or weeks, stated as a range |
| Resources | 2 to 3, free, prefer official documentation. Each link checked |
| Practice | A link to a PrepStack sheet topic, notes section or both |
| Checkpoint | 2 to 3 things you should be able to do or explain |
| Mini-project | A short build brief, with a link to the AI project generator pre-filled (`/ai-projects?stack=...`) |

**Scope.** 54 existing steps across 6 roadmaps. Do not add new tracks until the existing ones meet the template. Optional later tracks (confirm demand first): Java and Spring backend, DevOps basics, System Design, DSA-only path.

**Data change:** the step moves from a string plus a `details` entry (matched by position) to one structured object with a stable `id`. Update the Roadmap pages (redesigned in stage 2), the SEO data (`seo/pages.js`), the analyzer's roadmap list (a server copy exists and a sync test guards it), and the tests.

**Shape decided in stage 2 planning (9 Nov 2026).** The dead string list `steps` is dropped and `details` becomes `steps[]` of objects `{ id, title, desc, resources, ... }` with the template fields (goal, topics, time, practice, checkpoint, project) added as they are written; a step that has all of them is checked against the template. Android keeps its 8 real steps (its ninth string had no content). Steps get an anchor `#<stepId>`. The four hand-copied slug lists (`seo/pages.js`, `reportLinks.js`, `skills.service.js`, `analyzerContext.service.js`) get a sync test against `roadmaps.js`.

**Link health:** add a small script that checks every roadmap and catalog link (status codes only) and reports broken ones. Run it before each release.

**Effort:** about 1 day per roadmap for content, 2 days for the new data shape, 1 day for the link-check script (the page redesign is counted in A1). **Total about 9 days.**

**Done when:** all 54 steps use the template, every link returns a good response, and every step links to at least one in-app page.

### A3. Resume guide

**Status: built 9 Nov 2026 (stage 1); not yet reviewed.** Content is in `client/src/data/resumeGuide.js`, the page in `client/src/pages/Resume.jsx`, the checklist PDF in `client/src/components/pdf/ResumeChecklistPDF.jsx` (a test checks it is one page). The page stays login-only (decided). Wording is advice, with no statistics. Still open: an outside reader (a recruiter or working engineer) must check it, and the claims table in `docs/content/SOURCES.md` has no outside sources yet.

**Goal.** A guide that a fresher can follow to build a resume that the Role Analyzer would score well.

**Content plan:**
- Keep the 6 section cards, and add to each one: 2 to 3 before/after examples (weak bullet, then strong bullet), a short "common mistakes" list, and one line on what recruiters scan for.
- Add: the one-page rule and when to break it, the bullet formula (action + what + how much + how), how to describe projects, links and profiles, file format and naming, honest notes about ATS (what it does and does not do).
- Add role variants as short notes: SDE intern, backend, frontend, data. Show how the skills section and projects change.
- Add a fictional example resume (clearly marked as fictional).
- Add "Check yours with the Role Analyzer" at the end of each section, linking to `/analyzer`.
- Add a downloadable one-page checklist (a simple PDF or printable page).

**Effort:** about 4 days (writing 3, page work 1). **Done when:** every section has examples and mistakes, the example resume exists, and every claim about ATS is stated carefully (see section 6).

### A4. Behavioral guide

**Goal.** Move from 22 questions, mostly "Personal", to a guide that teaches how to build and tell stories.

**Content plan:**
- Grow the bank to about 50 questions across these categories: Personal, Teamwork, Conflict, Failure and learning, Leadership, Ownership, Deadlines and pressure, Ambiguity, Feedback, Motivation and "why this company". Leadership today has 1 question.
- Each question gets: what the interviewer is checking, a STAR skeleton, one example answer written for a fresher, and 2 common mistakes.
- Add a **story bank**: a worksheet where a student writes 5 to 6 stories once (project, team, failure, conflict, leadership, learning) and sees which questions each story can answer.
- Keep the page's STAR explanation, with a short worked example.

**Dependencies (important):**
- The Role Analyzer picks behavioral questions **by id from a bank copied into the server** (`server/src/data/behavioralQuestions.json`). When the bank grows, update that copy and keep the sync test passing (it fails if ids or text differ).
- The prompt asks the AI to choose from the bank. Re-run the live analyzer check after the bank changes.

**Effort:** about 5 days for content, 1 day for the page, 0.5 day for the server copy and tests. If the story bank is saved to the account, add it to B2. **Done when:** about 50 questions with all fields, the story bank works, the sync test passes, and a live analyzer run still picks sensible questions.

### A5. Tie-ins that must follow content changes

- **`skillCatalog.json`:** 53 of 120 skills have no PrepStack lessons today. After each notes subject and each roadmap is finished (not at the end), update each skill's `prepstack` mapping using the stable ids (notes section id, roadmap step id, project stack). The existing tests check that mappings point at real content. In stage 2 every one of the 120 skills also gets a typed, permanent skill `id` (a lower-case slug), with a uniqueness test and a lookup by id; the analyzer still chooses skills by name until My Plan needs ids. Analyzer references to notes, sheet topics and roadmap steps use ids, and the server adds the readable titles when a report is read. Saved reports keep their old title-style references (their links go to the subject page).
- **SEO:** update `client/src/seo/pages.js` and run the build's SEO check whenever pages are added.
- **README and TESTING.md:** update the counts and test totals (computed, not typed).
- **Quiz and Aptitude pages:** removed in stage 0 (B10). The Quiz page comes back later from the section quizzes (B7). Aptitude is out of scope.

---

## 4. Track B: Features

### How the Role Analyzer and the planner fit together (read before B4 and B5)

**The risk.** If both show "a plan", a student asks, "Which plan do I follow? Do I need both?" Two similar entry points can also look like the same feature twice.

**The rules that prevent this:**

1. **Different jobs, different words.**
   - **Role Analyzer = check.** "How well does my resume match this job, and what am I missing?" It stays as it is.
   - **My plan = schedule.** "What do I do each day until my goal?"
2. **One place for the daily plan.** The only daily checklist lives in **My plan** (a tab on the dashboard). A Role Analyzer report keeps its analysis, and its plan section gets one button: **Add to My plan**. The report no longer pretends to be the daily plan.
3. **One active plan at first.** A student never chooses between two plans. If they press "Add to My plan" while a plan exists, ask: *add these tasks to my current plan* or *replace my plan* (see decision 11).
4. **The pieces feed each other.**
   - The analyzer's gaps (for example "missing Docker") become tasks in My plan, tagged with where they came from.
   - After a report, the natural next step is "Schedule it", which opens My plan with the new tasks.
5. **Navigation shows the difference.** Role Analyzer stays in the main menu ("Check a job"). My plan is on the dashboard. The dashboard's tabs become: **My plan, DSA, Projects, Reports**.
6. **One shared checklist component** (B4) is used by both the report page and My plan. Never build a second one.
7. **Test the wording, not just the code.** After the first version, show it to 3 to 5 students and ask, "What is this page for? Which one would you open first?" If they hesitate, change the words or the layout before building more.

**Fallback if it still confuses people.** Build only B4 (tick-off boxes on the analyzer report plus a "Today" card on the dashboard) and stop. It is smaller, cannot clash with anything, and the full planner can be added later.

### B1. Shared progress record (do this first)

**Status: built 9 Nov 2026 (stage 1).** Each tick stores `{ link, solvedAt }`. The API still sends plain links, so the sheet page did not change. The dashboard summary returns `streak` (days in a row, counted in IST) and each sheet's `lastSolvedAt`. One-time migration: `node scripts/migrate-solved-at.js [--dry-run]`; it was run on the database used by the local server. **Before deploying the server, run it on the live database first** (the new code cannot read old data, so the live site shows 0 solved until the migration is run and the new code is live). Tests: `server/test/progress-dates.test.js` (20), plus updated `sheets.test.js` and `user.test.js`.

**Why.** Everything else (streak, "today", plans, profile) needs dates on progress.

**Data change.** `Progress.solvedProblems` is an array of link strings. Change each entry to `{ link, solvedAt }`, with a one-time migration that gives existing entries a `solvedAt` of the migration date (clearly flagged as unknown, so streaks do not count old data). Keep the existing toggle endpoint working through the migration.

**New API:** a summary per sheet (solved, total, last solved) and a streak calculation, inside the existing dashboard summary so the page keeps one round trip.

**UI:** a "DSA by sheet" view on the dashboard (a progress card per sheet), and a streak counter.

**Tests:** migration (old shape in, new shape out, idempotent), toggle add and remove, streak across days and timezones (decide the rule: user local day vs UTC), totals match the dashboard (the existing stats-equals-dashboard test style).

**Effort:** 3 to 4 days. **Done when:** old users' progress is intact after migration, the dashboard shows per-sheet cards and a streak, and numbers match everywhere.

### B2. Notes saved to the account

**Why.** Today notes live only in the browser and can vanish.

**Plan.**
- New collection `ProblemNote { user, sheetSlug, problemLink, text, updatedAt }`, text limited (suggest 5,000 characters), one note per user per problem.
- API: list, upsert, delete. Rate-limited like other write routes.
- Client: on the first load after the update, move the existing browser notes to the account automatically, once, with no prompt (decision 7), then save to the server. Keep a quiet local copy for offline. It runs exactly once and never overwrites a newer note already on the server.
- A "My notes" page listing notes by sheet with search. The account-deletion cascade needs no change (the `user` field is picked up automatically), but add a test.
- Update the privacy policy: notes are now stored on the server. Revise the line saying notes stay in the browser.
- Optional later: story bank from A4 uses the same pattern.

**Effort:** 3 days. **Done when:** a note survives a new device, import works exactly once, deletion removes notes, and the privacy page matches.

### B3. Limits shown on the page, and state kept in the address

**Status: built 9 Nov 2026 (stage 1).** `server/src/config/limits.js` holds all limit numbers, and the real checks and the page read from it. `GET /api/usage` returns used, allowed and resetsAt for ideas and reports over the last 24 hours. Both forms show what is left and disable the button at the limit. Hourly limits are not shown as counts (they live in server memory). Sheet topic state in the address was not needed and is not done. Tests: `server/test/usage.test.js` (8).

- Add a small endpoint (or extend an existing one) returning "used / allowed today" for the analyzer and project ideas. Show "2 of 5 reports left today" on both forms.
- Keep tab and open-section state in the URL where it helps (the dashboard tabs already do this; sheet topics could follow).
- **Effort:** 1 to 1.5 days. **Done when:** the numbers on screen match the server's real limits (test that they come from the same constants).

### B4. One shared checklist, first used on Role Analyzer reports

**Why.** The report's day-by-day plan is read-only, so students cannot track it. This item also creates the checklist component that My plan (B5) will reuse.

**Plan.**
- Build the checklist as **one reusable component** (for example `PlanChecklist`) with a tick, a "done at" time, a progress line and a "today" highlight. B5 uses the same component.
- Add `done` (with `doneAt`) to each plan item in `InterviewReport`. Add `PATCH /api/analyzer/:id/plan` to toggle an item.
- Report page: a checkbox per plan item, a "progress: 4 of 12" line, and a "today" highlight computed from the report's creation date and plan day.
- Dashboard: a small "Today" card showing the next unfinished items from the latest report.
- Reports saved before this change get `done: false` on read.
- **Effort:** 3 days. **Done when:** ticks persist, the dashboard card shows the right day, and old reports still open.

### B5. Goal planner

**Why.** The analyzer needs a specific job. A planner helps college students and job switchers who have a target but no posting.

**What it is.** **My plan**: one daily checklist (the B4 component), started in three ways. All three end in the same single plan.

| Entry | Inputs |
|---|---|
| From a Role Analyzer report | The analyzer itself does not change. On the report, press **Add to My plan** and its plan items and gap tasks are added (merge or replace, see decision 11) |
| "Placements in N weeks" | Weeks left, hours per day, which sheet and subjects |
| "Switch to role X in N weeks" | Target role (one of the roadmaps), weeks left, hours per day |

**How it relates to the Role Analyzer:** read "How the Role Analyzer and the planner fit together" at the top of section 4. In short: the analyzer checks, My plan schedules, and there is only one daily plan.

**Merging tasks from a report.** Each task keeps a `source` (`planner`, `analyzer:<reportId>`). When added from a report, tasks are fitted into the free time of the existing plan, respecting the hours per day. Tasks from the report that point at gaps (a missing skill) link to the same pages the report links to.

**How the plan is made (by code, not AI):**
- Pick the content: sheet topics (from the chosen sheet), notes sections, roadmap steps and project briefs.
- Estimate time: problems by difficulty (suggest easy 20 min, medium 35, hard 60, adjustable), notes sections by reading time plus quiz time, roadmap steps by their stated estimate.
- Fit the content into the available days: fill each day up to the hours per day, keep topics in learning order, leave a lighter review day each week.
- Each item links to its page, can be ticked, moved to another day, or removed. If the student falls behind, offer one button, "Rebuild from today", which re-fits the remaining items.

**Data:** `Plan { user, goalType, targetRole, startDate, hoursPerDay, items: [{ type, ref, title, minutes, day, doneAt }] }`. One active plan per user at first.

**UI:** a "Plan" tab on the dashboard, a form with 3 to 4 questions, and the checklist.

**Limits and honesty:** show "this plan covers X of Y hours of your syllabus" if the time is too short. Do not promise results.

**Dependencies:** B1 (dates on progress), B4 (checklist), A1 and A2 (content to plan with). A planner pointed at thin notes is a weak product, so do the first content pass on DBMS and OS before launching it.

**Effort:** 7 to 9 days. **Done when:** a plan builds for each entry, totals fit the hours, ticking updates the dashboard, rebuild works, and tests cover generation edge cases (too little time, empty sheet, rebuild after a missed week).

### B6. Consistent empty, locked and limit states

**Status: built 9 Nov 2026 (stage 1).** `client/src/components/ui/StateComponents.jsx` has `EmptyState`, `LimitState` and `UsageNotice`; `PageErrorState` takes a `title`, and `InlineErrorAlert` has `role="alert"`. The hand-written empty and error screens on the Projects tab, Reports tab, Sheets, Notes and Behavioral pages now use them, and the loaders were tidied (one spinner for buttons, shared skeletons). Left as they are: the one-line "no devices" note in the Profile sessions card, and the Sheets page fetch failure (it already falls back to a built-in list). The Projects tab still shows no error when its list fails to load.

A single set of small components for: empty (icon, one line, one button), at-limit (what the limit is, when it resets), and error. Replace the ad hoc versions across the dashboard, analyzer, projects and notes pages. **Effort:** 2 days.

### B7. Quizzes

Build after A1. Static, reviewed questions in the repo. Scoring on the client, with an optional best score saved to the account. Add the missing client tests for it. **Effort:** 4 to 5 days (mostly question quality).

### B8. Opt-in public profile (later)

A shareable page showing sheet progress, streak, and (only if the user turns it on) analyzer score history and saved projects. Privacy first: off by default, with a clear preview and an off switch. Only after B1. **Effort:** 4 days.

### B9. Foundations worth doing alongside

**Status (9 Nov 2026):** the first two items below are done. Client tests run with `cd client && npm test` (Vitest). `client/src/api/axios.test.js` has 14 tests for the token refresh; `client/src/test/colorGuard.test.js` has 5 tests that fail on a raw color. Each rule was checked by breaking the code on purpose. The CI and counts items are still open.

- Client test setup, then tests for the token refresh (`client/src/api/axios.js`): a 401 then a refresh and retry, a failed refresh logs out, a timeout does not log out. **1 day.** This also gives later client work (the notes import, the checklist, quiz scoring) a place for its tests.
- A guard test that fails when a component uses a raw color (a hex value, `rgb()` or a Tailwind palette class such as `text-zinc-400`) instead of a named token. It keeps the tokens the only source of colors, which is what makes the light theme (B12) cheap. **0.5 day.**
- A basic CI run of the server tests (stage 6, optional). **0.5 day.** (You decided against CI earlier; revisit if the team grows.)
- A check that run-together numbers cannot appear: counts shown on pages come from one function. **0.5 day.**

### B10. Remove the Quiz and Aptitude pages (decided 7 Nov)

**Status: done 9 Nov 2026.** The two pages and `ComingSoon.jsx` (used only by them) are deleted, with their routes, SEO entries, the menu and footer comments and the README bullet. Not part of B10: the "System Design" card marked coming soon on the Notes page.

Remove the two hidden routes, their page files, the "coming soon" SEO entries, any menu or footer link, and the line about them in the README's Known Limitations. The Quiz page returns later as B7. **Effort:** 0.5 day. **Done when:** no route, link or SEO entry mentions them, the build's SEO check passes, and the README matches.

### B11. Cache the DSA sheet reads (decided 9 Nov: with Redis, not before)

The dashboard and the sheet list read all 5 sheets (about 1,300 links) from the database on every request, and the sheets only change when the seed runs. **Decision: no cache now.** It is built as step R4 of `docs/plans/REDIS_PLAN.md`, so it is also the first real use of Redis. Until then both endpoints keep reading from the database: heavier, but never wrong. **Done when** (in R4): the second request does not read the sheets from the database, totals still match everywhere (the stats-equals-dashboard tests), the seed clears the cached copy, and the endpoints still work when Redis is down.
### B12. Light theme (later)

The colors are named tokens in `client/src/index.css`, so a light theme is a second set of values, a toggle, a small script in `index.html` that sets the theme before the first paint, and a check of every page for contrast (the amber accent needs a darker value on white). From now on new pages use tokens only (the guard test in B9 enforces it). **Effort:** 3 to 4 days. **Done when:** every page is checked in both themes at phone and desktop width, and the loading screen and the PDF report are unaffected. Start after the notes and roadmap redesign (stage 2) is stable.

---

## 5. Implementation order (revised 9 Nov 2026)

This replaces the earlier six-phase table. It orders the work by what depends on what, and every item in this plan has a place in it (see the coverage line below the table).

| Stage | What | Why this position |
|---|---|---|
| 0. Cleanup and foundations (about 1 week) | Deploy and verify the pending fixes; remove the Quiz and Aptitude pages (B10, decision 4); client test setup plus the token-refresh tests and the raw-color guard test (B9); write the notes template, review checklist and sources file; start finding outside readers and students now | Small, unblocks the rest, and people take weeks to find |
| 1. Foundations (1 to 2 weeks) | B6 shared states, then B1 progress with dates and IST streaks, then B3 limits on the page; A3 resume guide in parallel | B6 first, because B1, B3 and every later page use those components. B1 before anything that plans |
| 2. Content foundation (about 13 working days, re-estimated 9 Nov) | Five sub-phases, each with tests: **2.1** section ids, notes validator, computed counts and reading time, ids on every DSA sheet topic (2 days); **2.2** analyzer references by id, permanent ids for the 120 catalog skills (2.5 days); **2.3** notes pages, quiz and diagram components, report-a-mistake link, last checked date (4 days); **2.4** roadmap steps as objects with ids and the roadmap pages (3 days); **2.5** internal-link test and the external link-check script (1.5 days); plus half a day to update this plan | Must exist before writing. This is the biggest hidden risk |
| 3. Notes and checklist (about 3 weeks) | A1 DBMS, then update `skillCatalog.json` for it; B2 notes sync (and the privacy policy); B4 checklist and "Today" card; A1 networks, then update the catalog | The catalog and server copies are updated after each subject, not at the end |
| 4. Roadmaps and behavioral (about 2.5 weeks) | A2 content for 6 roadmaps; A4 behavioral (server copy, the live analyzer check, the story bank on top of B2) | The story bank needs B2. The live check needs AI quota |
| 5. Student gate, then B5 | Show the checklist to 3 to 5 students and 2 to 3 job switchers. Before the planner: DBMS and OS at the template, B1 and B4 live. A1 Java OOP and OS depth run alongside | If they say no, stop at B4 (as planned) |
| 6. Later | B7 quizzes (from the notes quiz data), System Design basics, B8 public profile, B12 light theme, CI | All depend on earlier content or user feedback |

**Stage 0 status (9 Nov 2026):** done: B10, B9 (client test setup, token-refresh tests, raw-color guard test), and the notes template, review checklist and sources file in `docs/content/`. Yours to do: deploy and check the pending fixes on Render and Vercel; fill in the outside readers table and the students table in `docs/content/SOURCES.md` (start asking now, people take weeks).

**Stage 1 status (9 Nov 2026):** built: B6, B1, B3 and A3. Not done by me: the forms (AI ideas, Analyzer) and the new Resume guide page and its PDF have not been looked at in a browser at phone and desktop width, because those pages need login. Yours to do: run the progress migration on the live database, then deploy the server (in that order); get an outside reader for the Resume guide; keep asking readers and students (`docs/content/SOURCES.md`).

**Coverage:** A1 (stages 2, 3, 5, 6), A2 (2, 4), A3 (1), A4 (4), A5 (3, 4), B1 (1), B2 (3), B3 (1), B4 (3), B5 (5), B6 (1), B7 (6), B8 (6), B9 (0; CI in 6), B10 (0), B11 (with Redis: step R4 of the Redis plan), B12 (6).

**Time:** about 12 to 13 weeks for stages 0 to 5 (my estimate; stage 2 was re-estimated on 9 Nov at about 13 working days instead of 1.5 weeks; re-estimate again after the first notes subject). Stage 6 adds about 3 weeks.

**Rules that decide this order**
- **Stable ids before content.** A roadmap step is a plain string matched by position to a separate details list, and a notes section is found by its title. Everything that links (notes, roadmaps, sheets, the skill catalog, planner items, quizzes) needs ids first.
- **Shared states (B6) before the pages that use them.**
- **Client test setup (B9) before logic-heavy UI** such as the notes import and the checklist.
- **After each notes subject and each roadmap:** update the skill catalog mapping, the server copies, the SEO data, and re-run the live analyzer check when the behavioral bank changes.
- **B1 before B5, B4 before the gate, B2 before the story bank.**
- **Redis, BullMQ and background jobs** (`docs/plans/REDIS_PLAN.md`) run alongside as a learning track. Its production steps start after B3 and B4, so the same controllers are not edited twice. The DSA sheet cache (B11) is built there, as R4, not before.

**Gate before the planner (stage 5).** Show the dashboard and a report with tick-off boxes to 3 to 5 students and 2 to 3 job switchers (section 9). Go on to B5 only if most of them say they would use a daily checklist and they understand what each page is for. If not, **stop at B4** and spend the planner's days on content.

---

## 6. Quality gates

### Content review checklist (every section, every roadmap step, every guide)

- The accuracy process below was followed (run the code, claim table, independent review, outside reader).
- Each technical statement was checked against at least one reliable source (official docs, a standard textbook, the language or protocol specification). Keep a short list of the sources used, in a notes file, not on the page.
- Examples run or were traced by hand.
- Numbers, limits and defaults are stated with the version or context they depend on.
- No wording copied from any other site, book or video.
- Reading level is plain English.
- Links work and point to free pages.
- For the resume guide and behavioral guide: advice is stated as guidance, not guarantees ("recruiters often ...", not "ATS always ...").
- A second pair of eyes (a friend or a senior student) read it once.

### Accuracy process for notes and technical content (added 7 Nov 2026)

The content is drafted by Claude and the owner cannot judge every technical claim alone, so accuracy rests on checks that do not depend on one person's knowledge. Every section goes through all of these:

1. **Run it.** Every SQL example runs on a real database; every Java example is compiled and run; complexity and algorithm claims are checked with small scripts. A wrong example must fail automatically.
2. **Claim table.** For each factual claim, record its source (RFC, official docs, or a named textbook chapter) in the sources notes file. A claim with no source is marked unverified and does not ship.
3. **Independent review.** After drafting, a separate reviewing agent with fresh context fetches the official sources, tries to refute each claim, and lists every disagreement. Disagreements go to the owner with evidence.
4. **Plain-words explanation.** Where the owner cannot judge a claim, it is explained simply with a source link, so it can be confirmed by opening the link.
5. **Outside reader, mandatory per subject.** One senior student, friend or mentor reads each finished subject once before it goes live. This is the only check that is not from an AI.
6. **After launch.** A "report a mistake" link and a "last checked" date on every notes section. Fixes ship straight away, not in the next phase.

Reference sources: OS (Silberschatz, *Operating System Concepts*); DBMS (Korth and Silberschatz, plus the PostgreSQL or MySQL docs); Networks (Kurose and Ross, plus the RFCs); Java and OOP (official Java docs, *Effective Java*, GoF).

Honest limit: this lowers the chance of a wrong fact a lot, but it cannot make it zero.

### Code gates (every feature item)

- Tests for the happy path and the edge cases listed in the item.
- A deliberate break of each new rule to confirm a test fails (as done for the analyzer).
- `npm run lint`, `npm run build` (including the SEO check) and the full server tests pass.
- Check in a browser at phone and desktop width using a throwaway backend, not the real database.
- If it uses the AI, run the live check once with real keys.
- Update `README.md` and `TESTING.md` with computed counts.

---

## 7. Risks and how to reduce them

| Risk | Reduction |
|---|---|
| Links between notes, roadmaps and sheets break when a title changes | Stable ids (stage 2), analyzer references by id, an automatic internal-link test |
| Re-seeding the notes and the sheets (needed after stage 2 data changes) wipes and re-inserts them | Users' progress is keyed by problem link, so it is safe; run the seed only on a database you are sure about |
| Old saved Analyzer reports keep title-style references | Their links go to the subject page, not the section; accepted |
| Hand-typed ids on about 100 DSA sheet topics may contain mistakes | Uniqueness test and the internal-link test |
| Raw colors creep back into components and block the light theme | The guard test in B9 |
| Writing takes longer than planned | Finish one subject fully before the next. Cut scope by reducing topics per section, not the template |
| Wrong technical content | The review checklist; ask a senior student to read each subject once |
| The planner is good but the notes are thin | Launch the planner only after DBMS and OS reach the template |
| Migration damages progress | Test the migration on a copy; make it idempotent; keep a backup before running it on real data |
| New stored data (notes, plans) raises privacy duties | Update the privacy policy first; cascade deletion test; no hidden data collection |
| Quiz questions with wrong answers | Review each question; each answer has a one-line explanation that must hold up |
| Scope creep from "everything" | This plan lists the non-goals below; anything not listed waits |
| No evidence students want a planner | Ask 3 to 5 students and 2 to 3 job switchers before building B5 (section 9). The gate in section 5 can stop the work at B4 |
| Two plans confuse users (analyzer plan vs My plan) | One place for the daily plan, one active plan, "check" vs "schedule" wording, an Add to My plan button, and a wording test with students (section 4) |

---

## 8. Decisions needed from you

**Decided (7 Nov 2026):**
- **#1 OOP notes language: Java.**
- **#4 Quiz and Aptitude: remove both hidden pages** (quizzes can come back later as B7).
- **#9 Content review: Sahil and Claude together.**
- **#10 New roadmap tracks: none.** Instead, improve the existing roadmaps, and redesign the UI of the roadmap and notes pages together with the content.
- **Content target: MAANG level.** This raises the depth of every section in A1 and A2, so re-estimate the writing days after the first subject (DBMS).

- **#2 Notes scope: the full proposed list.** Add diagrams where they help understanding (not on every topic).
- **#5 Streak rule: Indian time (IST).**
- **#6 Planner estimates: use 20 / 35 / 60 minutes by difficulty** (Claude's call; adjustable later).
- **#7 Notes import: move browser notes to the account automatically, no prompt.**
- **#13 Dashboard tab order: DSA first until My plan exists, then My plan first.**

- **#3 System Design basics: include**, written after the four main subjects.
- **#8 Public profile: include later** (B8, last optional item).
- **#11 Report tasks when a plan exists: ask each time**, merge is the default.

- **Story bank (A4): saved to the account** (add to B2; privacy policy line needed).
- **Time available: full-time**, so the 11 to 12 week order in section 5 holds (stages 0 to 5).
- **Outside readers: maybe.** Find one per subject before that subject finishes (college groups, seniors, Reddit); do not depend on it.
- **Student validation: no one lined up yet.** Find 3 to 5 students and 2 to 3 job switchers before the stage 5 gate. If none are found, the gate answer is "stop at B4".

- **#12 Plan name: "My Plan"** (tab and "Add to My plan" button). The small dashboard card is called **"Today"**.

**All 13 decisions are now made.** Status: still planning, no work started.

**Decided 9 Nov 2026 (order, light theme and Redis), answered by you:**
- **Implementation order:** the stage table in section 5.
- **First work: stage 0 cleanups.**
- **Light theme (B12): stage 6, after the main work.**
- **DSA sheet cache (B11): no cache now; it is built with Redis (step R4 of `docs/plans/REDIS_PLAN.md`).**
- **Redis, BullMQ and background jobs: learned alongside the app work, in the evenings.** Redis host: Aiven for Valkey (free plan). Details and the still-open Redis questions are in section 8 of the Redis plan.

**Decided 9 Nov 2026 (stage 2 design), answered by you:**
- **Diagrams:** small data shapes drawn by one SVG component, not hand-written SVG.
- **"Report a mistake":** an email link (address to be chosen).
- **DSA sheet topic ids:** a typed id on every topic.
- **The two product PDFs** (`PrepStack_Five_Connected_Systems.pdf` and `PrepStack_Strategic_Differentiation_Guidance.pdf`, now in the docs folder): to be decided later. Parked, not part of the plan yet.

---

## 9. Validate with students before the big pieces

Before B5 (planner) and before writing System Design basics, ask 3 to 5 college students and 2 to 3 job switchers:

- What are you preparing for, and by when?
- Where do you get stuck: what to study, in what order, or how much time it needs?
- Would a daily checklist help, or would you ignore it?
- Which of these would you actually use: tracked plan, saved notes, quizzes, public profile?
- What was missing or wrong in the notes, roadmap or resume guide you tried?
- Show them the dashboard and a Role Analyzer report and ask: "What is this page for? Which one would you open first, and why?" Note any moment of hesitation. This tests whether the analyzer and My plan are understood as different things.

Record answers in a short file. If most say they would not use a planner, stop at B4 and spend the days on content.

---

## 10. Non-goals (for now)

- Videos, your own code judge or compiler, coins or a store, ads, paid tiers, user-submitted interview stories, AI hints on sheet problems, a community feed. (A light theme is no longer a non-goal: it is B12, after the main work.)
- Copying any other site's text, structure or design.
- New AI features. The two unique ones (project ideas and the Role Analyzer) stay as they are, improved only by better content and links.

---

## 11. Appendix: working templates

### A. Notes section template

```
Section title
Overview (60-120 words)
Topics (4-8): definition / why it matters / example / how it goes wrong
Interview questions (3-5): question + short answer
Common mistakes (2-3)
Quiz (5 MCQs): question, 4 options, correct answer, one-line explanation
Links: sheet topic, roadmap step, next section
```

### B. Roadmap step template

```
Title + goal ("After this step you can ...")
Topics checklist (4-8)
Time estimate (range)
Resources (2-3 free, checked)
Practice (links to sheet topic / notes)
Checkpoint (2-3 things you can do or explain)
Mini-project (brief + project-generator link)
```

### C. Behavioral question template

```
Question
What the interviewer checks
STAR skeleton (Situation / Task / Action / Result prompts)
Example answer (for a fresher)
Common mistakes (2)
```

### D. Resume bullet formula

```
Action verb + what you did + how (tools) + result (number or outcome)
Weak:   "Worked on a login system"
Strong: "Built JWT login with refresh-token rotation in Node.js, cutting repeat logins by ..."  (use only true numbers)
```

### E. Files each task is likely to touch

| Task | Likely files |
|---|---|
| Stage 2 content foundation | notes model and seed, `server/src/validators/` (notes schema), `server/src/services/analyzerContext.service.js` (references by id), `client/src/data/roadmaps.js`, `client/src/pages/csNotes/*`, `client/src/pages/roadmaps/*`, a new diagram component, a link-check script, internal-link and sync tests |
| B10 Quiz and Aptitude removal | `client/src/app.routes.jsx`, `client/src/pages/Quiz.jsx` and `Aptitude.jsx`, `client/src/seo/pages.js`, menu and footer links, README (Known Limitations) |
| B11 sheet cache (with Redis, R4) | `server/src/controllers/sheets.controller.js`, `server/src/controllers/user.controller.js`, the seed scripts, tests |
| B12 light theme | `client/src/index.css` (a second set of values), a theme toggle component, an early script in `client/index.html`, every page checked |
| A1 notes | `server/src/data/notes/*.js`, `server/src/validators/` (notes schema), notes controller and tests, `client/src/pages/csNotes/*`, `server/src/data/skillCatalog.json`, `client/src/seo/pages.js` |
| A2 roadmaps | `client/src/data/roadmaps.js`, roadmap pages, `server/src/services/analyzerContext.service.js` (slug copy), sync test, `client/src/seo/pages.js` |
| A3 resume | `client/src/pages/Resume.jsx` |
| A4 behavioral | `client/src/data/behavioralQuestions.js`, `server/src/data/behavioralQuestions.json`, `client/src/pages/Behavioral.jsx`, `server/test/analyzer.context.test.js` (sync test) |
| B1 progress | `server/src/models/progress.model.js`, sheets controller, user dashboard summary, migration script, dashboard components, tests |
| B2 notes sync | new model and routes, `client/src/hooks/useProblemNotes.js`, sheet pages, privacy policy, tests |
| B3 limits | analyzer and project controllers or a small status route, forms |
| B4 checklist | `server/src/models/interviewReport.model.js`, analyzer controller and routes, `client/src/pages/analyzer/AnalyzerReport.jsx`, a new shared `PlanChecklist` component, dashboard "Today" card |
| B5 planner (My plan) | new `Plan` model, a generation service, routes, validators, the "My plan" dashboard tab (using `PlanChecklist`), an "Add to My plan" button on `AnalyzerReport.jsx`, tests |
