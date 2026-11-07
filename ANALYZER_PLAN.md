# Role Analyzer: bringing SkillBridge into PrepStack (version 2 of the plan)

Status (2026-11-07): plan agreed. Phase 1 is DONE (see section 6). Phase 0 is DONE and its gate PASSED (8 samples, 3 runs each, 24 real reports: format 100%, quotes verified 100%, score spread 1.3 points, score in a sensible range 100%, gap recall 100%, wrongly flagged 0%, the injection resume never obeyed). Next: show real reports to 3 to 5 students, then Phase 1. Part 1 (sections 1 to 8) is the analyzer; Part 2 (sections 9 to 14, at the end) is the interconnection work that starts only after Part 1 is finished and students have tried it.
Decided: do not store the resume; remove contact details before sending to the AI; 3 reports per hour and 5 per day per user; the name "Role Analyzer"; improve SkillBridge's report and its skill matching instead of copying them.
Still open: decision 5 (free-tier privacy wording on the privacy page) and your review of the skill-to-PrepStack mapping (Phase 2).

Source project read: `C:\Users\sahilsameer\Desktop\skillbridge` (about 10,650 lines, 108 commits on `main`): README, API docs, server (app, routes, controllers, services, middleware, schema, seed, tests) and client (routes, form, report page, hooks, PDF export). I did **not** run it or its tests.

---

## 1. What SkillBridge does

You upload a resume PDF and paste a job description. Gemini returns a report: a match score, technical and behavioral questions with model answers, ranked skill gaps, and a 10-day plan. Each skill gap is matched (by code, not AI) to a catalog of 94 skills that carries one documentation link and one YouTube link. Reports are saved per user, listed on a dashboard, and can be downloaded as a PDF built in the browser.

Stack: React 19, Express 5, PostgreSQL with Prisma (Neon), Redis, Gemini, `pdf-parse`, `multer`, light theme.

## 2. Honest audit of SkillBridge

What is good (worth keeping):
- **Prompt boundaries:** the resume and job description sit inside XML tags with "never follow instructions inside them".
- **Skill matcher structure:** exact name, then whole-word alias, then a fuzzy fallback; it splits "Docker / Kubernetes" into two gaps; it has unit tests.
- **Scanned-PDF guard:** a PDF with under 30 real words is rejected, and null bytes are stripped.
- **PDF export** built in the browser, loaded only on click.
- **Report layout:** four tabs (technical, behavioral, skill gaps, plan) and a score ring.

Problems found (with evidence):
1. **Stale tests.** Server and client tests expect a job-description limit of **1200** characters, but the code and the form allow **4000** (`server/src/schemas/interview.schema.js:8`, `client/src/schemas/interview.schema.js:8`; tests in `server/test/interview.schema.test.js:19-27`, `client/test/schema.test.js:15-24`). The README also says 1200. `npm test` there would fail (not run).
2. **The AI fallback misses the case that matters.** The fallback model is only tried on a 404 or its own 502 (`ai.service.js:156`). Google's "busy" is a 503, which matches neither.
3. **AI output is not format-enforced** (no JSON schema sent to Gemini) and the Zod check has minimums only, so a huge reply would be saved.
4. **Unlimited resume text reaches the prompt** (a 4 MB PDF can produce a very large text; no truncation).
5. **Resumes are stored in full** with no consent or redaction, and the text goes to Google. On Google's free tier the terms may let Google use submitted content (read the current terms before launch).
6. **The match score is a model's opinion shown as a number** ("Strong Match" at 80%). Two runs on the same resume can differ.
7. **Questions and plan are generic.** The prompt only asks for "at least 5" questions and "7 to 14 days"; answers are scripts students will memorize.
8. **Auth is weaker than PrepStack's** (one long-lived token, Redis blacklist that fails open). Not ported.
9. **Fuzzy matching gives wrong links.** For 5-letter terms the threshold is 0.80, so "Flash" matches "Flask", "Shift" matches "Swift", and "Redux" can match "Redis". Real aliases are also missed ("k8s", "node js") unless someone added them to the seed.
10. **Fake progress text** on the loading screen (steps advance on a timer, not on real progress).
11. **Catalog links are unverified** (92 YouTube links that can disappear). You decided earlier to skip link checking; the report will call them "suggested".

## 3. Report v2: the improvements

### 3.1 Matching a skill gap to the catalog (replaces the fuzzy fallback)

Order of attempts:
1. **Closed list.** The prompt carries the catalog's skill names (about 400 extra tokens), and the reply schema says each gap's `skillKey` must be one of them or `"none"`. The server checks the key is in the catalog. This removes most guessing.
2. **Exact name or whole-word alias** match, as SkillBridge does it (for gaps where the AI answered `"none"` or an invalid key).
3. **Careful fuzzy** only for terms of 7 or more letters, at most one edit, same first letter, never a word that is itself another catalog skill. A fuzzy result is shown as **"Did you mean X?"**, never as a fact, and gets no resource links.
4. **No match:** the gap still links to PrepStack by category (section 4), just with no external links.
Every gap also carries a `category` from a fixed set (`dsa`, `cs-core`, `stack`, `soft`, `other`), so even unmatched gaps get a useful PrepStack action.

### 3.2 An explainable score (replaces "the model picked 78")
- The AI lists the job's **requirements** (each marked must-have or nice-to-have) and for each says **met, partly met, or missing**, with a **short quote from the resume** that proves it.
- The **code computes the score** from those marks (must-haves weigh more). Same marks, same score, and every point is traceable.
- The server checks that each quote really appears in the redacted resume. A quote that is not found shows as "not verified" (it is not silently dropped).
- Labelled "estimate" everywhere. Evidence quotes are stored only as short snippets (up to about 120 characters, after redaction); the full resume is never stored.

### 3.3 The report sections
1. **Verdict:** estimated readiness, the top 3 priorities (each tied to a requirement, with a rough time to fix), and the main reason for the score.
2. **Requirements checklist:** met, partly met, missing, with evidence.
3. **Skill gaps:** severity, why it matters for this job, and the PrepStack actions (section 4).
4. **Likely questions:** technical questions grouped by requirement, each with *why they ask*, *which part of your resume to use*, and *likely follow-ups*. Hints, not scripts. Behavioral questions are picked from PrepStack's own bank (`client/src/data/behavioralQuestions.js`), and the AI only writes which of your experiences fits each one.
5. **Study plan:** the student says how many days until the interview (default 10). The plan is built from **real PrepStack items** (a sheet topic, a notes section, a roadmap step). The AI only picks and orders item ids from a list the server provides; ids it makes up are dropped by code.
6. **Resume tweaks:** keywords the job asks for that the resume lacks, linked to the Resume Guide page.
7. **Likely coding topics** for the role, mapped to DSA sheet topics, with the student's own solved counts.

### 3.4 Proving it is better (Phase 0)
Before building any screen, write the new prompt, schema and matcher, and compare old against new on 5 to 8 real resume and job pairs with a script like `server/scripts/compare-models.js`. Measure: format pass rate, share of quotes verified, score spread over 3 runs of the same input, and whether the skill matching picks the right skill. About 20 AI requests, mostly on the Flash Lite models.

## 4. How it complements PrepStack

PrepStack gives practice material: DSA sheets, CS notes (OS, DBMS, networks, OOP), six roadmaps, AI project ideas, behavioral and resume guides. The Role Analyzer answers a different question: **"what should I practise for THIS job?"** Together they close a loop: the analyzer finds the gaps, PrepStack is where you fix them, and (Phase 5) a later re-run shows the progress.

Every skill gap links to PrepStack's own content **first** (chosen by code from a mapping, not by the AI, so nothing is invented). SkillBridge's external docs and videos come second.

| A gap is about... | PrepStack action on the gap card |
|---|---|
| Data structures, algorithms, Big O, system design basics | Open the matching DSA sheet, with the user's solved count |
| Operating systems, networks, databases and indexing, OOP, design patterns | Open that CS Notes subject (`os`, `cn`, `dbms`, `oops`) |
| A stack or tool (React, Node, Express, Django, Spring Boot, Flutter, Android, ML...) | Open the matching roadmap, and "Make a project idea with X" (opens AI Projects with the stack filled in) |
| Behavioral questions | Link to Behavioral Prep |
| The resume itself | Link to the Resume Guide |

### Where it lives in the product

**Navbar** (`client/src/components/Navbar.jsx`). Today: main bar = DSA Sheets, AI Projects, Roadmaps; "Explore" menu = CS Notes, Behavioral Prep, Resume Guide, Quiz, Aptitude.
- **Add "Role Analyzer" to the main bar**, after AI Projects: `DSA Sheets | AI Projects | Role Analyzer | Roadmaps | Explore`. It is a headline feature, not a side page. (The mobile menu already merges all links.)
- Housekeeping that frees space and removes dead ends: hide **Quiz** and **Aptitude** (empty "coming soon" pages) until they exist.

**Other places it appears**
- **Home page:** a card in the feature grid (`BentoGrid.jsx`) and a second button in the hero ("Check your resume against a job").
- **Dashboard** (`UnifiedDashboard.jsx`): a "Recent role reports" strip beside DSA progress and saved project ideas.
- **Resume Guide page** (`/resume`): a banner "Already have a resume? Check it against a job" linking to the analyzer.
- **Behavioral Prep page:** "Practise for a specific job" link.
- **DSA sheet and CS notes pages:** after a report, the gap cards deep-link here; a small "Needed for your report: <role>" badge can show on the linked sheet or notes subject.
- **AI Projects page:** accepts a stack from a link (`?stack=React`) so the gap action can prefill it.
- **Footer** "Learn" list: add "Role Analyzer".
- **Profile page:** a stat "Role reports: N".

**Routes:** `/analyzer` (form) and `/analyzer/:id` (report), both behind login like the other private pages, and marked noindex in `client/src/seo/pages.js`.

## 5. How it is built inside PrepStack (not copied)

| SkillBridge | PrepStack version |
|---|---|
| PostgreSQL + Prisma, 9 tables | MongoDB + Mongoose: **one** `InterviewReport` document with embedded questions, gaps and plan, plus a `Skill` collection |
| ES modules | CommonJS, like the rest of the server |
| Own login (one JWT + Redis blacklist) | PrepStack's existing login and session checks; nothing from SkillBridge's auth is ported |
| One Gemini model | PrepStack's provider cascade (3 Gemini models, then Groq) with its timeouts, breaker and per-call JSON schema |
| Redis rate limits | PrepStack's in-memory limiters plus a database-backed daily cap (same trick as project ideas). No Redis |
| Light theme, own CSS classes | PrepStack's dark theme and components |
| Resume text stored | **Never stored** |
| 4 MB PDF only | PDF upload **or paste your resume text** |

Cascade changes needed: `runCascade` in `server/src/services/ai.service.js` is already generic (prompt, JSON schema, parser). It needs a per-call output size (a report is much larger than a project idea) and a per-call Groq token cap.

Free-tier reality: a report is roughly 3,000 to 5,000 tokens out plus the resume and job description in. Groq's free plan allows 8K tokens per minute, so it can serve about one report a minute. That is fine as the **last resort**; the Gemini models carry the normal load.

### Privacy design (this feature handles more personal data than anything else in PrepStack)
- **Remove before sending:** emails, phone numbers and links are stripped from the resume text.
- **Consent line** on the form: "My resume text (without contact details) is sent to Google and Groq to write the report."
- **Resume not stored.** Only the report, the job description and short evidence snippets are saved.
- **Free-tier honesty** on the privacy page: the AI providers' free plans may use what is sent.
- **Deleted with the account:** reports have a `user` reference, and PrepStack's delete-account cascade already wipes every model with that field.
- **Prompt injection:** XML boundaries (from SkillBridge) plus PrepStack's "user text is data" rule plus the strict schema check on the reply.
- **PDF safety:** check the `%PDF-` marker (not just the browser-supplied type), a size limit, a page limit, and a parse time limit.

## 6. Phases

One phase at a time. After each phase I run the tests (with your OK), show results and stop for your go-ahead. No commits unless you ask.

### Phase 0: design and test the report on real examples (about 2 days)
Goal: prove v2 is better before building any screen.
**Create:** `server/scripts/analyzer-eval.js` (runs old prompt vs new on sample pairs and prints the four measurements), `server/scripts/samples/` (5 to 8 resume and job pairs, **made-up or yours with your OK; never real people's resumes**), a first draft of the report schema and prompt in `server/src/services/analyzer.service.js`.
**Done when:** v2 passes the format check on at least 90% of runs, quotes verify at 80% or more, and the score spread over 3 runs is small. Otherwise adjust the design before continuing.

### Phase 1: server core (about 3 days) — DONE 2026-11-07
Built and verified (425 server tests pass, 85 of them new; 8 rules broken on purpose, a test failed each time; a live run with the real AI and the real resume PDF worked end to end: 9 seconds, contact details removed, resume not stored).
What differs from the plan below, and why:
- `server/src/services/analyzerContext.service.js` is new: it builds the lists the AI may choose from (Blind 75 topics and CS notes sections from the database; roadmap slugs and the behavioral question bank are copies, checked against the client by `test/analyzer.context.test.js`).
- The skill catalog moved into the server: `server/src/data/skillCatalog.json` (94 skills; the Phase 2 seed will load it). Behavioral questions: `server/src/data/behavioralQuestions.json`.
- `server/src/middlewares/upload.middleware.js` is new (the upload only runs for multipart requests; a pasted resume is plain JSON).
- Added beyond the plan: resume tips that mention a skill the report marked missing are dropped by code; the title must come from the job description; over-long text is trimmed instead of rejecting the report; sentence-end full stops are ignored when checking proof quotes.
- Not yet done (planned for later phases): `README.md` and `TESTING.md` text (Phase 4), the skills catalog in the database and the PrepStack mapping (Phase 2), all screens (Phase 3).

Original plan for this phase:
Goal: send a resume and a job description, get a validated report saved.
**Create**
- `server/src/models/interviewReport.model.js` (user ref, title, jobDescription, requirements with marks and evidence snippets, computed score, questions, gaps, plan, aiProvider; index on `{ user, createdAt: -1 }`).
- `server/src/validators/analyzer.validators.js` (job description 30 to 4000 characters; pasted resume 100 to 12000; days until interview 3 to 30; report id).
- `server/src/services/analyzer.service.js` (final prompt, Zod report schema with **maximum** sizes and field caps, score computation, evidence check, calls `runCascade`).
- `server/src/services/resume.service.js` (PDF to text with `pdf-parse`, `%PDF-` check, limits, scanned guard, null-byte strip, redaction, truncation to a token budget).
- `server/src/controllers/analyzer.controller.js` (generate, list with clamped pagination, get one, delete), `server/src/routes/analyzer.routes.js` (`/api/analyzer`).
- `server/test/analyzer.test.js`, `server/test/resume.test.js`.
**Modify**
- `server/src/services/ai.service.js` (export `runCascade`; optional output cap per call), `server/src/app.js` (mount the route), `server/src/middlewares/rateLimit.middleware.js` (analyzer limiter: 3 per hour per user, failed requests not counted), `server/package.json` (add `multer`, `pdf-parse`), `server/test/helpers/setup.js` (fake PDF buffer), `server/.env.example`.
**Rules:** one report at a time per user (409); daily cap of 5 from the database; friendly 502/504 when every provider fails; no resume text in logs or responses.

### Phase 2: skills catalog and the PrepStack mapping (about 2 days)
**Create**
- `server/src/models/skill.model.js`.
- `server/src/seed/skillsSeed.js` (the 94 skills and links, converted from SkillBridge's `prisma/seed.js`, plus a `prepstack` object on each skill that can list several things: `{ dsaTopics: [{ sheet, topic }], notes: [{ subject, section }], roadmap, projectStack }`, plus a `category`; **you review this mapping**. The analyzer only uses the first item for now; the later interconnection work (Part 2, section 9 onwards) uses all of them, so keeping the object shape from day one avoids a data migration).
- `server/src/services/skillMatcher.service.js` (port with the closed-list step, the careful fuzzy rule, and "did you mean" results), `server/test/skillMatcher.test.js` (include "Flash" must not match "Flask", "Shift" must not match "Swift", "k8s" must match Kubernetes).
**Modify:** `server/src/seed/masterSeed.js` (idempotent), `server/src/controllers/analyzer.controller.js` (attach the matched skill and its PrepStack action to each gap).

### Phase 3: client (about 3 days)
**Create**
- `client/src/pages/analyzer/Analyzer.jsx` (job description, PDF upload or paste, days until interview, consent checkbox).
- `client/src/pages/analyzer/AnalyzerReport.jsx` (verdict and top 3, requirements checklist, gaps with PrepStack actions, questions, plan, resume tweaks, estimate label on the score).
- `client/src/pages/analyzer/components/` (ResumeUpload, JobDescriptionInput, RequirementRow, SkillGapCard, ScoreRing).
- `client/src/api/services/analyzerService.js`.
**Modify:** `client/src/app.routes.jsx` (two protected routes), `client/src/components/Navbar.jsx` (main-bar link; hide Quiz and Aptitude), `client/src/components/Footer.jsx`, `client/src/components/homePage/BentoGrid.jsx` and `HeroSection.jsx` (card and button), `client/src/pages/Dashboard/UnifiedDashboard.jsx` (recent reports strip), `client/src/pages/Resume.jsx` and `client/src/pages/Behavioral.jsx` (links), `client/src/pages/project/AIProjectIdeas.jsx` (accept `?stack=`), `client/src/pages/Profile/components/ProfileHero.jsx` (report count), `client/src/seo/pages.js`, `client/src/pages/legal/PrivacyPolicy.jsx` and `TermsOfUse.jsx`.

### Phase 4: PDF export, docs, live check (about 1.5 days)
**Create:** `client/src/components/pdf/AnalyzerReportPDF.jsx`, `client/src/utils/exportReportPdf.js` (ported from SkillBridge, PrepStack branding, links to PrepStack pages, loaded only on click).
**Modify:** `client/package.json` (add `@react-pdf/renderer`), `README.md`, `TESTING.md`.
**Live check (you run it with real keys):** a real PDF resume, a pasted resume, a scanned PDF (rejected), a prompt-injection resume, every provider failing, the PDF download, and the same input three times to see the score spread.

### Phase 5: close the loop (optional, later, about 2 days)
Re-run the same role and show the score change and the gaps closed using PrepStack progress; a deterministic "skills the job asks for vs what the resume mentions" panel from the catalog, as an evidence check next to the AI score.

Total: about 11.5 days for Phases 0 to 4.

## 7. Decisions

Decided: 1) do not store the resume; 2) remove contact details; 3) 3 per hour and 5 per day; 4) name "Role Analyzer".
Still open:
5. **Free-tier privacy wording.** Are you comfortable telling users the free AI plans may use what is sent? If not, the only fix is a paid plan.
6. **Skill mapping review** (Phase 2): I write the first version of the 94-row mapping, you review it.
7. **Evidence snippets.** Store short quote snippets (about 120 characters, after redaction) so the report can show proof, or store only the met / partly met / missing marks. Recommended: short snippets.
8. **Sample data for Phase 0.** Made-up resumes and job descriptions (recommended), or your own resume with your OK.

## 8. Risks (stated honestly)
- Resumes are personal data. Removing contact details lowers the risk but cannot remove names or work history.
- A report costs much more of the free AI quota than a project idea; the daily cap exists to protect it.
- A richer report is more likely to fail the format check; forgiving parsing and the provider chain reduce this but do not remove it.
- Groq as last resort will be slow and weaker for a reply this large.
- The skill links are unverified YouTube links; some will go dead.
- The score stays an estimate, even when it is computed from evidence.
- All of this is tested with fakes except Phase 0 and the Phase 4 live check, which use the real models.


---

# Part 2: Interconnection (after Phases 0 to 5 are done)

Status: planned, **not started**. It starts only when (a) Phases 0 to 5 above are finished, and (b) 3 to 5 real students have used the analyzer and said it is worth building on. If they are lukewarm, we stop after Part 1 and spend the days elsewhere.

## 9. Goal of Part 2

After Part 1, the analyzer is a good feature that **links to** the rest of PrepStack. Part 2 makes the rest of PrepStack **change because of it**, so a student feels one product and not six pages:

- The student sets one **target role** from a report.
- Every page then answers: "how does this help my target?"
- The student's real progress (DSA solved, project ideas built) feeds back into the analyzer, so a re-run shows what improved.

Rules that keep it safe:
1. **No target, no change.** Without a target role, every page behaves exactly as it does today. New parts appear only for users who set one.
2. **Compute, don't store.** Readiness, gaps left and "today's plan" are calculated when the page loads (like today's dashboard summary), so there is no extra stored number that can go stale.
3. **One vocabulary.** Every link goes through one skill mapping. Nothing is hand-linked.
4. **Honest labels.** Readiness is an estimate and says so everywhere.
5. **Only real signals.** Today the server tracks DSA problems solved and generated project ideas. Notes and roadmaps are not tracked on the server; they will not count as "done" unless we add a clear "I've studied this" button (optional step I-7).

## 10. The story we are building towards

A student pastes a job description, and the report says TypeScript and testing are missing. They press **"Make this my target"**.

- **Navbar:** a small chip appears: "Full Stack Engineer, 60% ready".
- **Dashboard:** a new top section with a readiness ring, "3 gaps left", and **"Today: Day 3, Unit testing"** with links to the exact sheet topic or notes section for the day.
- **DSA sheets:** the topics the job needs carry a small "Needed for your target" badge, and a filter "Show only target topics".
- **CS Notes:** sections in the plan are marked "Day 5 of your plan".
- **Roadmaps:** the steps that cover a gap are highlighted.
- **AI Projects:** an offer "Build a TypeScript project to close your gap", with the stack already filled in.
- **Behavioral Prep:** the 4 questions chosen for this job are pinned at the top.
- **Resume Guide:** the honest resume tweaks from the report are shown on the page.

Two weeks later they re-run the report. It says **"Readiness 60% to 74%. Closed: TypeScript, Testing"**, because they solved the matching problems and built a TypeScript project.

## 11. The building blocks

### 11.1 The shared skill vocabulary (the foundation)
Built in Phase 2 of Part 1 and hardened here. Each skill carries an object (not a single link):

```
prepstack: {
  dsaTopics: [{ sheet: 'blind-75', topic: 'Graphs' }],
  notes:     [{ subject: 'dbms', section: 'Normalization' }],
  roadmap:   'backend' | null,
  projectStack: 'TypeScript + React' | null,
}
```
- A test loads every mapped reference and checks it still exists in the sheet seeds, the notes data and the roadmaps (the same way the Phase 0 eval script reads them). If someone renames a topic, the test fails instead of a link silently breaking.
- Reading rule: the app asks the mapping, never a hard-coded string.

### 11.2 The target role (the spine)
New model `Goal`, one per user (unique index on `user`):
```
{ user, report (ref InterviewReport), title, baselineScore, setAt,
  gaps: [{ skillKey, closed: bool, closedBy: 'progress' | 'manual' | 'rerun', closedAt }] }
```
- Has a `user` reference, so PrepStack's delete-account cascade wipes it automatically.
- Deleting a report removes a goal that points at it.
- One active goal per user for now (a second "Make this my target" replaces the first, after a confirm).

### 11.3 The computed goal view
`GET /api/goal` calculates, at request time, from the goal, the report, the skill mapping, the user's DSA progress and their saved project ideas:
- `readiness` (see 11.4), `gapsOpen`, `gapsClosed`
- per gap: the signals found (for example "solved 14 of 20 problems in Graphs", "1 project idea with TypeScript", "marked learned")
- `neededTopics` (sheet topics the target needs, for the badges)
- `today`: the plan day for today (from `setAt`), with its real PrepStack items
- `pinnedBehavioral`: the question ids chosen by the report
No derived number is stored. If the user has no goal, it returns `null`.

### 11.4 Readiness (a small, deterministic rule)
- Start from the report's score (it is computed from the requirement marks).
- A gap counts as **closed** when one of these is true: DSA coverage of its mapped topics reaches a threshold (proposed 60% of those problems solved), or the user marked it learned, or a re-run shows it met.
- Readiness = the same weighted arithmetic as the report score, with closed gaps counted as met. Same inputs always give the same number.
- Labelled "estimate" in every place it is shown.

### 11.5 Progress feeds the analyzer (the return path)
- `analyze()` gets a `progress` argument built by the server: for each skill with a DSA mapping, how many mapped problems the user solved.
- **The code applies it, not the AI:** after the AI marks requirements, a requirement for a skill with strong DSA progress is raised to "met" with the proof source "PrepStack progress" (shown differently from a resume quote). The AI is never told to trust app data it could be tricked about; this stays in code.
- Re-running for the same job compares with the earlier report: score before and after, gaps closed, gaps still open.

### 11.6 Shared client pieces
New folder `client/src/components/goal/`: `SkillChip`, `GapCard`, `ReadinessRing`, `TargetBadge`, `GoalBanner` ("From your report: Full Stack Engineer"), `TodayPlan`. One style, one wording ("gap", "target", "readiness"). Plus `client/src/context/GoalContext.jsx` and `client/src/hooks/useGoal.js`: loaded once after login, `null` when there is no goal, so pages simply render nothing extra.

## 12. Phases for Part 2

One phase at a time, with the same working method as Part 1: after each phase run the tests (with your OK), show results, stop for your go-ahead, no commits unless you ask.

### Phase I-1: harden the vocabulary (about 1 day)
**Modify:** `server/src/models/skill.model.js` and `server/src/seed/skillsSeed.js` (the object shape above, filled in for all 94 skills; you review the mapping).
**Create:** `server/test/skillMapping.test.js` (every mapped reference must exist; no skill points at nothing and also names nothing useful; counts reported).
**Done when:** the dangling-link test passes and fails when I rename a topic on purpose.

### Phase I-2: the target role on the server (about 2 days)
**Create:** `server/src/models/goal.model.js`; `server/src/services/goal.service.js` (computes the view and readiness); `server/src/controllers/goal.controller.js`; `server/src/routes/goal.routes.js` (`POST /api/goal`, `GET /api/goal`, `PATCH /api/goal/gaps/:skillKey`, `DELETE /api/goal`); `server/test/goal.test.js`.
**Modify:** `server/src/app.js` (mount), `server/src/controllers/user.controller.js` (so account deletion is verified to wipe the goal; the existing cascade should already do it), `server/src/controllers/analyzer.controller.js` (deleting a report removes a goal that uses it).
**Tests:** one goal per user; a goal from someone else's report is refused; readiness is the same for the same inputs; closing rules (progress, manual, re-run); no goal returns `null`; deleting the report, the account or the goal leaves nothing behind; a user cannot read another user's goal.

### Phase I-3: client foundation (about 2 days)
**Create:** the `components/goal/` pieces, `GoalContext.jsx`, `useGoal.js`, `client/src/api/services/goalService.js`.
**Modify:** `client/src/main.jsx` or the layout (provider), `client/src/components/Navbar.jsx` (target chip), `client/src/pages/Dashboard/UnifiedDashboard.jsx` (goal section with ring, gaps left and today's plan), `client/src/pages/analyzer/AnalyzerReport.jsx` (the "Make this my target" button).
**Done when:** with no goal the app looks exactly as before (checked page by page), and with a goal the chip and dashboard section appear on phone and desktop.

### Phase I-4: badges and pre-fills across pages (about 2 days)
**Modify:** `client/src/pages/DsaSheets/SheetsDetail.jsx` (topic badge and "target topics only" filter), `client/src/pages/csNotes/NotesDetail.jsx` (plan-day markers), `client/src/pages/roadmaps/RoadmapDetail.jsx` (highlight gap steps), `client/src/pages/project/AIProjectIdeas.jsx` (pre-filled stack and the "close your gap" offer), `client/src/pages/Behavioral.jsx` (pinned questions), `client/src/pages/Resume.jsx` (tweaks panel), `client/src/pages/Profile/` (goal card), `client/src/components/homePage/HeroSection.jsx` (for a logged-in user with a goal: "Continue your plan").
**Rule for every page:** hidden completely when there is no goal; text and icon, never colour alone (accessibility).

### Phase I-5: progress feeds the analyzer, and re-run comparison (about 1.5 days)
**Modify:** `server/src/services/analyzer.service.js` (a `progress` argument and the code step that applies it; proof source "PrepStack progress"), `server/src/controllers/analyzer.controller.js` (build the progress facts; the "re-run for the same job" option and the before and after comparison), `client/src/pages/analyzer/AnalyzerReport.jsx` (comparison panel, progress-based proof shown differently).
**Tests:** progress never lowers a mark; progress alone cannot make an unrelated skill "met"; a resume trying to claim progress does not matter (progress comes only from the server); the comparison lists closed and still-open gaps correctly.

### Phase I-6: polish, docs, live check (about 1 day)
Update `README.md`, `TESTING.md` and the privacy page (the goal stores the report link and gap marks, never the resume). Live check (you, with real keys): set a goal, solve a few matching problems, see the badges and the ring move, re-run the report and read the comparison; on phone and desktop.

### Phase I-7 (optional, later): "I've studied this" for notes (about 1 day)
A small server-side toggle per notes section so notes can count as a real signal. Not part of the first Part 2 release.

Total for I-1 to I-6: about 9.5 days.

## 13. Decisions needed before Part 2 starts
1. **Closing threshold:** is 60% of the mapped DSA problems the right line for "gap closed by progress"?
2. **One goal or several:** one active goal (recommended), or a list of saved goals?
3. **Notes tracking:** add the "I've studied this" toggle (I-7) now, or leave notes out of readiness?
4. **Where the chip lives:** the navbar (recommended), the dashboard only, or both.

## 14. Risks of Part 2 (stated honestly)
- **Many pages get touched.** Each is a chance to break an existing layout; the rule "no goal means unchanged" plus a page-by-page check on phone and desktop is the guard.
- **The mapping needs upkeep.** The dangling-link test catches renames; it cannot tell that a mapping is a poor choice. You review it once, and again when content changes.
- **Readiness can mislead.** It rewards problems solved, which is only part of being ready. The label "estimate" and the per-gap signals shown next to it keep it honest.
- **Progress is only as good as what we track.** DSA and project ideas are tracked; notes, roadmaps and behavioral practice are not (until I-7).
- **Free AI quota.** Re-runs spend the same quota as first reports (3 an hour, 5 a day), so a heavy re-runner uses the daily cap.
- **Scope creep.** This part must not start before the students gate; building it for an unproven feature is the largest risk in the whole plan.
