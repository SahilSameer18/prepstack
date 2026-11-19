# Backend modules: the move plan (19 Nov 2026, decisions made by the owner, ready for an agent to execute)

**Read this whole file before touching anything.** It is written so an agent that has not seen the earlier conversation can do the work. The owner decided the items in section 3; everything else here is a fact read from the code on 19 Nov 2026 or an instruction.

**Phase 0 complete, 19 Nov 2026.** Branch module had no tracked or staged changes. The existing untracked .claude/ directory was left untouched. The server baseline passed 1,111 tests in 210 suites, with zero failures, cancellations or skips (about 3 minutes). Live Redis opt-in variables were cleared for the run. Phases 1 and 2 are recorded below.

**Backend modules Phases 1 and 2 complete, 19 Nov 2026.** The clock is shared independently of planner content, and AI owns the difficulty values used by the project model. Twenty-one files now live under server/src/shared, with imports, runtime paths, scripts and README updated. The full server suite passed all 1,111 tests after each phase. All 135 client tests, the build, lint and SEO passed. Phase 3 (auth and user modules) is next.

The owner authorized Phases 1 and 2 together. They were verified separately and are ready for the owner to commit together. The architecture test and the remaining feature moves stay in their later steps.

**Backend modules Phase 3 complete, 19 Nov 2026.** Fifteen files moved into auth and user modules, including the User model in auth. Callers and string-built test paths now point at the modules. The server suite passed all 1,111 tests in 210 suites; all 135 client tests, build, lint and SEO passed. Phase 4 (sheets, problem notes and notes) is next.

**Backend modules Phase 4 complete, 19 Nov 2026.** Sheets, problem notes and notes now live in their feature modules. The move includes 95 files, with all 65 Markdown files preserved and the notes folder structure kept. Imports, dynamic content paths, seed commands, tests, scripts and README now use the new locations. All 1,111 server tests and 135 client tests passed, along with build, lint and SEO. Phase 5 (AI, project, usage and analyzer) is next.

## 0. Rules for the agent (from `CLAUDE.md`, the owner's standing rules)
1. **Never stage, commit or push.** This also means **do not use `git mv`** (it stages). Move files with plain `mv` (Git sees the renames when the owner commits). After each step, stop and give the owner the commands: one `git add -A server` (and docs when changed) and a one-line `git commit -m "..."` with no `Co-Authored-By` or other trailer.
2. **Never read, edit or print `server/.env`.** One step changes a relative path that points at it (`seedConfig`, step 2); change the path string only.
3. **Do not run seed scripts, `redis:check`, `measure:*` or `test:redis-live`** (they touch real services). Check seed scripts only by loading their modules in a throwaway check or by running the test suite.
4. Never use ports 3000 or 5173 for throwaway checks (use 3100 and 5175).
5. **No behavior change.** No renamed files, no refactoring, no new features, no splitting of big files. If a step seems to need one, stop and ask the owner.
6. Keep each file's existing line endings (many files use CRLF). Do not reformat files.
7. Windows machine, Git Bash and PowerShell available. Prefer the dedicated file tools; for bulk path rewrites write a throwaway Node script in a temp folder **outside the repo** (not committed).
8. Update `README.md` for any change that touches what it describes (project structure, scripts, paths). Report what was **not** checked.

## 1. The goal
Change `server/src` from one folder per kind of file (controllers, services, models, routes, validators, utils, middlewares, data, seed) to **one folder per feature** (a module), plus a `shared/` folder. A new feature (readiness, the AI queue, the LeetCode extension, DebugLab) then lives in one place.

## 2. Facts (read from the code, 19 Nov 2026)
- `server/src` has 161 files: 96 `.js` and `.json` files plus 65 `.md` note files under `data/notes/`. The table in section 5 covers all of them (the note folders are listed as whole folders).
- Server suite on 19 Nov 2026: **1111 tests, 0 failures** (`cd server && npm test`). Record the number you see at step 0; that is the baseline.
- `server.js` (root of `server/`) requires four files that move: `src/config/database`, `src/config/redis`, `src/services/ai.service`, `src/services/email.service`. `cluster.js` and `src/app.js` stay where they are; `app.js` requires every route file and every middleware it uses. The Render start command stays `node server.js`.
- **40 test files** reach `src` files, many through strings built with `path.join(SERVER_ROOT, 'src', ...)` that a plain search for `require('../src/` will miss: `test/ai-budget`, `ai-fallback`, `analyzer-plan`, `analyzer.context`, `analyzer.service`, `analyzer`, `auth`, `cache-memory`, `cache`, `content-cache`, `content-ids`, `internal-links`, `lock`, `notes-markdown`, `notes`, `plan-adjust`, `plan-api`, `plan-catalog`, `plan-coverage`, `plan-day`, `plan-finish-all`, `plan-generator`, `plan-items`, `plan-replset`, `plan-role-partial`, `plan-scenarios`, `problem-notes`, `progress-dates`, `rate-limit-store`, `redis-config`, `redis-limits-http`, `redis-live`, `resume`, `seo-content`, `session-cache`, `skills`, `usage` (all `.test.js`), and the helpers `test/helpers/browser-server.js`, `plan-scenarios.js`, `setup.js`. At each step search `test/` for the old path of every file you moved, in all three forms: `../src/...`, `'src', 'x', 'y.js'` and template strings.
- **11 scripts** reach `src`: `scripts/analyzer-eval`, `build-plan-catalogs`, `build-seo-content`, `check-links`, `compare-models`, `load-test`, `measure-cache`, `measure-limits`, `migrate-solved-at`, `plan-fuzz`, `plan-scenarios` (some use template strings such as `` `../src/data/notes/${slug}.js` `` and `readText('src/seed/sheetSeeds/blind75.js')`).
- **Code that builds paths at run time** (must be fixed by hand, a rewriter will not catch them):
  - `src/services/planData.js` lines 12 and 17: `path.join('..', 'seed', 'sheetSeeds', file)` and `path.join('..', 'data', 'notes', subject)`.
  - `src/seed/seedConfig.js` line 13: `path.join(__dirname, '../../.env')` (one level deeper after the move: `../../../.env`).
  - `src/data/notes/{cn,dbms,hld,oops,os}.js` read their `.md` folders with `__dirname`, so **the whole `data/notes/` folder must move as one unit** with its structure unchanged; then nothing inside needs editing.
- `package.json` scripts: `seed:notes` (`src/seed/notesSeed.js`) and `seed:all` (`src/seed/masterSeed.js`) must point at the new paths.
- Documents naming old paths (53 references): `IMPROVEMENT_PLAN.md`, `TESTING.md`, `docs/HANDOFF.md`, `docs/archive/ANALYZER_PLAN.md` (25 of them), `docs/archive/HLD_NOTES_PLAN.md`, `docs/content/NOTES_TEMPLATE.md`, `docs/content/SOURCES.md`, `docs/plans/DEBUGLAB_PLAN.md`, `DSA_LESSONS_PLAN.md`, `MY_PLAN_COVERAGE_PLAN.md`, `MY_PLAN_DEPTH_LEVELS_PLAN.md`, `MY_PLAN_PLAN.md`. Plus 5 client comments naming server files: `client/src/components/notes/diagramLayout.js`, `client/src/data/behavioralQuestions.js`, `problemNoteOptions.js`, `resumeGuide.js`, `client/src/pages/project/AIProjectIdeas.jsx`. Comments only; update the path text. Two of those files have sync tests (behavioral questions and problem note options) that read the server copy by path: they are in the test list above.
- **Why the plan has two small code changes:** a dry run (a script that assigned every file to a module and printed who imports whom) showed that a plain move would create circles between modules: sheets and plan, user and plan, auth and user, ai and project, project and usage and analyzer. After the placement in section 5 and the two code changes in step 1, the same dry run reported **no cycles and nothing in `shared` importing a module**.

## 3. Decisions made by the owner (19 Nov 2026)
1. **Direct file imports** between modules (no `index.js` per module). Rules are enforced by an architecture test (step 7).
2. **Tests stay in `server/test/`**; only their require paths change.
3. **The DSA module is named `sheets`.**
4. **The User model lives in `auth`** (with the login middleware), not in `user`. This is required to avoid a circle, not a style choice.
5. **One step at a time, the owner commits after each step.**

## 4. Target layout
```
server/
  server.js  cluster.js                 (stay; update the 4 requires in server.js)
  src/
    app.js                              (stays; update its requires)
    shared/
      config/     database, limits, redis, seedConfig
      http/       error.middleware, rateLimit.middleware, validate.middleware, AppError, responseFormatter
      infra/      cache, lock, rateLimitStore, sessionCache
      calendar/   studyCalendar, istDay, planDay, clock (new, step 1)
      usage/      usage.service
      content/    roadmapCatalog.json, behavioralQuestions.json, contentLinks
    modules/
      auth/  user/  sheets/  problem-notes/  notes/  plan/  analyzer/  project/  ai/  usage/
```
File names do not change. Inside a module the files are flat, except `modules/sheets/seeds/` and `modules/notes/content/`.

## 5. File-by-file map (paths relative to `server/src/`)
| From | To | Done |
|---|---|---|
| `app.js` | stays | |
| `config/database.js` | `shared/config/database.js` | Done, Phase 2 |
| `config/limits.js` | `shared/config/limits.js` | Done, Phase 2 |
| `config/redis.js` | `shared/config/redis.js` | Done, Phase 2 |
| `controllers/analyzer.controller.js` | `modules/analyzer/analyzer.controller.js` | |
| `controllers/auth.controller.js` | `modules/auth/auth.controller.js` | Done, Phase 3 |
| `controllers/notes.controller.js` | `modules/notes/notes.controller.js` | Done, Phase 4 |
| `controllers/plan.controller.js` | `modules/plan/plan.controller.js` | |
| `controllers/planRecovery.controller.js` | `modules/plan/planRecovery.controller.js` | |
| `controllers/problemNotes.controller.js` | `modules/problem-notes/problemNotes.controller.js` | Done, Phase 4 |
| `controllers/project.controller.js` | `modules/project/project.controller.js` | |
| `controllers/sheets.controller.js` | `modules/sheets/sheets.controller.js` | Done, Phase 4 |
| `controllers/usage.controller.js` | `modules/usage/usage.controller.js` | |
| `controllers/user.controller.js` | `modules/user/user.controller.js` | Done, Phase 3 |
| `data/behavioralQuestions.json` | `shared/content/behavioralQuestions.json` | Done, Phase 2 |
| `data/notes/` (whole folder, 71 files, structure kept) | `modules/notes/content/` | Done, Phase 4 |
| `data/planCatalog.json` | `modules/plan/planCatalog.json` | |
| `data/problemNoteOptions.js` | `modules/problem-notes/problemNoteOptions.js` | Done, Phase 4 |
| `data/roadmapCatalog.json` | `shared/content/roadmapCatalog.json` | Done, Phase 2 |
| `data/skillCatalog.json` | `modules/analyzer/skillCatalog.json` | |
| `middlewares/auth.middleware.js` | `modules/auth/auth.middleware.js` | Done, Phase 3 |
| `middlewares/error.middleware.js` | `shared/http/error.middleware.js` | Done, Phase 2 |
| `middlewares/rateLimit.middleware.js` | `shared/http/rateLimit.middleware.js` | Done, Phase 2 |
| `middlewares/upload.middleware.js` | `modules/analyzer/upload.middleware.js` | |
| `middlewares/validate.middleware.js` | `shared/http/validate.middleware.js` | Done, Phase 2 |
| `models/auth.model.js` | `modules/auth/auth.model.js` | Done, Phase 3 |
| `models/interviewReport.model.js` | `modules/analyzer/interviewReport.model.js` | |
| `models/notes.model.js` | `modules/notes/notes.model.js` | Done, Phase 4 |
| `models/passwordReset.model.js` | `modules/auth/passwordReset.model.js` | Done, Phase 3 |
| `models/plan.model.js` | `modules/plan/plan.model.js` | |
| `models/problemNote.model.js` | `modules/problem-notes/problemNote.model.js` | Done, Phase 4 |
| `models/progress.model.js` | `modules/sheets/progress.model.js` | Done, Phase 4 |
| `models/project.model.js` | `modules/project/project.model.js` | |
| `models/sheets.model.js` | `modules/sheets/sheets.model.js` | Done, Phase 4 |
| `routes/analyzer.routes.js` | `modules/analyzer/analyzer.routes.js` | |
| `routes/auth.routes.js` | `modules/auth/auth.routes.js` | Done, Phase 3 |
| `routes/notes.routes.js` | `modules/notes/notes.routes.js` | Done, Phase 4 |
| `routes/plan.routes.js` | `modules/plan/plan.routes.js` | |
| `routes/problemNotes.routes.js` | `modules/problem-notes/problemNotes.routes.js` | Done, Phase 4 |
| `routes/project.routes.js` | `modules/project/project.routes.js` | |
| `routes/sheets.routes.js` | `modules/sheets/sheets.routes.js` | Done, Phase 4 |
| `routes/usage.routes.js` | `modules/usage/usage.routes.js` | |
| `routes/user.routes.js` | `modules/user/user.routes.js` | Done, Phase 3 |
| `seed/masterSeed.js` | `modules/sheets/seeds/masterSeed.js` | Done, Phase 4 |
| `seed/notesSeed.js` | `modules/notes/notesSeed.js` | Done, Phase 4 |
| `seed/seedConfig.js` | `shared/config/seedConfig.js` | Done, Phase 2 |
| `seed/sheetSeeds/` (whole folder, 5 files, structure kept) | `modules/sheets/seeds/sheetSeeds/` | Done, Phase 4 |
| `services/ai.service.js` | `modules/ai/ai.service.js` | |
| `services/aiBudget.js` | `modules/ai/aiBudget.js` | |
| `services/analyzer.service.js` | `modules/analyzer/analyzer.service.js` | |
| `services/analyzerContext.service.js` | `modules/analyzer/analyzerContext.service.js` | |
| `services/cache.js` | `shared/infra/cache.js` | Done, Phase 2 |
| `services/email.service.js` | `modules/auth/email.service.js` | Done, Phase 3 |
| `services/lock.js` | `shared/infra/lock.js` | Done, Phase 2 |
| `services/planAdjust.js` | `modules/plan/planAdjust.js` | |
| `services/planData.js` | `modules/plan/planData.js` | |
| `services/planGenerator.js` | `modules/plan/planGenerator.js` | |
| `services/planRecovery.js` | `modules/plan/planRecovery.js` | |
| `services/planReport.js` | `modules/plan/planReport.js` | |
| `services/problemProgress.js` | `modules/sheets/problemProgress.js` | Done, Phase 4 |
| `services/problemResources.js` | `modules/plan/problemResources.js` | |
| `services/rateLimitStore.js` | `shared/infra/rateLimitStore.js` | Done, Phase 2 |
| `services/resume.service.js` | `modules/analyzer/resume.service.js` | |
| `services/sessionCache.js` | `shared/infra/sessionCache.js` | Done, Phase 2 |
| `services/skills.service.js` | `modules/analyzer/skills.service.js` | |
| `services/usage.service.js` | `shared/usage/usage.service.js` | Done, Phase 2 |
| `utils/AppError.js` | `shared/http/AppError.js` | Done, Phase 2 |
| `utils/deviceParser.js` | `modules/auth/deviceParser.js` | Done, Phase 3 |
| `utils/googleClient.js` | `modules/auth/googleClient.js` | Done, Phase 3 |
| `utils/clock.js` (added in Phase 1) | `shared/calendar/clock.js` | Done, Phase 2 |
| `utils/istDay.js` | `shared/calendar/istDay.js` | Done, Phase 2 |
| `utils/notesStats.js` | `modules/notes/notesStats.js` | Done, Phase 4 |
| `utils/planDay.js` | `shared/calendar/planDay.js` | Done, Phase 2 |
| `utils/problemIdentity.js` | `modules/sheets/problemIdentity.js` | Done, Phase 4 |
| `utils/responseFormatter.js` | `shared/http/responseFormatter.js` | Done, Phase 2 |
| `utils/studyCalendar.js` | `shared/calendar/studyCalendar.js` | Done, Phase 2 |
| `utils/tokens.js` | `modules/auth/tokens.js` | Done, Phase 3 |
| `utils/userResponse.js` | `modules/auth/userResponse.js` | Done, Phase 3 |
| `utils/usernameHelper.js` | `modules/auth/usernameHelper.js` | Done, Phase 3 |
| `validators/analyzer.validators.js` | `modules/analyzer/analyzer.validators.js` | |
| `validators/auth.validators.js` | `modules/auth/auth.validators.js` | Done, Phase 3 |
| `validators/contentLinks.js` | `shared/content/contentLinks.js` | Done, Phase 2 |
| `validators/notes.validators.js` | `modules/notes/notes.validators.js` | Done, Phase 4 |
| `validators/plan.validators.js` | `modules/plan/plan.validators.js` | |
| `validators/problemNotes.validators.js` | `modules/problem-notes/problemNotes.validators.js` | Done, Phase 4 |
| `validators/project.validators.js` | `modules/project/project.validators.js` | |
| `validators/sheets.validators.js` | `modules/sheets/sheets.validators.js` | Done, Phase 4 |
| `validators/user.validators.js` | `modules/user/user.validators.js` | Done, Phase 3 |

## 6. Who may import whom
```
shared           imports nothing from modules
ai               -> shared
auth             -> shared
notes            -> shared
sheets           -> auth, shared
project          -> ai, auth, shared
problem-notes    -> auth, sheets, shared
user             -> auth, project, sheets, shared
usage            -> analyzer, auth, project, shared
analyzer         -> ai, auth, notes, sheets, shared
plan             -> analyzer, auth, notes, sheets, shared
(src/app.js and server.js may import every module's routes; they are not modules)
```
No cycles. The architecture test (step 7) checks exactly this table.

## 7. Order of work
Each step ends with: the full server suite passes with the **same number of tests as the baseline**, then **stop and hand the owner the git commands** (rule 1). Do not start the next step until the owner says so.

| Step | What | Check |
|---|---|---|
| 0 | **Baseline.** `cd server && npm test` (about several minutes; run with a long timeout or in the background). Record the pass count. Check that the working tree has no unrelated uncommitted work (`git status`); if it has, tell the owner and wait. | Count recorded |
| 1 | **Two small code changes, files still in place.** (a) Make `planClock` its own file `src/utils/clock.js` (today `src/services/planData.js` line 31 defines `const planClock = { now: () => new Date() };` and exports it at line 74; remove it from there), and change every user to import it from the new file: `src/controllers/plan.controller.js`, `planRecovery.controller.js`, `sheets.controller.js`, `user.controller.js`, `src/services/planData.js` itself, and in tests `test/plan-api.test.js`, `test/plan-items.test.js` and `test/helpers/browser-server.js`. Tests set `planClock.now` to play a plan on another day, so the tests must receive the very same object. (b) Move the constant `const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];` (line 5 of `src/models/project.model.js`) into `src/services/ai.service.js` and export it; `project.model.js` then imports it from there (keep its existing `projectModel.DIFFICULTIES = DIFFICULTIES;` line). Today `ai.service.js` line 13 imports it from the model, which is the circle to remove. No other file uses it. | Same count passes |
| 2 | **`shared/`** per the table. Fix `seedConfig`'s `.env` path string (`../../.env` becomes `../../../.env`); never open the `.env`. `utils/clock.js` becomes `shared/calendar/clock.js`. | Pass |
| 3 | **`modules/auth`**, then **`modules/user`**. | Pass; the login, refresh, revoke and delete-account tests are in `auth.test.js`, `user.test.js`, `session-cache.test.js`, `account-replset.test.js`, `password-reset.test.js` |
| 4 | **`modules/sheets`, `modules/problem-notes`, `modules/notes`.** Move `data/notes/` as one folder. Update `package.json` `seed:*` scripts and the scripts that read these files. | Pass; load (do not run) the seed modules |
| 5 | **`modules/ai`, `modules/project`, `modules/usage`, `modules/analyzer`.** | Pass |
| 6 | **`modules/plan`** (largest). Fix the two run-time paths in `planData.js`: they must now point at `../sheets/seeds/sheetSeeds/` and `../notes/content/`. | Pass |
| 7 | **Architecture test** `server/test/architecture.test.js`: parse every `require(...)` in `src/` (and the string-built ones are already gone), map each file to its module by folder (`shared`, or `modules/<name>`), and assert (a) no cycles between modules, (b) `shared` imports no module, (c) every module imports only what section 6 allows. Do a **mutation check**: add a forbidden import, see the test fail, remove it. Remove the now-empty old folders (`controllers`, `services`, `routes`, `models`, `validators`, `utils`, `middlewares`, `data`, `seed`). | New test passes; suite count is the baseline plus the new test |
| 8 | **Docs and comments.** README (project structure section and any path it names), `TESTING.md`, the documents and client comments in section 2, `docs/HANDOFF.md`, `PROJECT_STATUS.md` (one dated line), `BUILD_CHECKLIST.md` if it has an item for this. Then search the whole repo for each old folder name (`src/services/`, `src/controllers/`, and so on) and fix what is left (history files that record the past may keep old paths if clearly dated). | Search finds no stale path |
| 9 | **Final report.** Run the full server suite, then `cd client && npm run build && npm run lint`. Start the server once on a spare port (3100) with Redis off and request one public route per module (for example `/health`, `/api/sheets`, `/api/notes`, `/api/plan/options`) and one protected route to see a 401. Report the numbers and **what was not checked** (real seeds, live Redis, the deployed site). | Report |

## 8. How to move a step's files safely
1. Create the target folders, `mv` the files listed for the step, keep file contents unchanged except the require paths.
2. Write a throwaway script that, for the moved files, recomputes every relative `require('...')` specifier in (a) the moved files, (b) every file in `src/`, `test/`, `scripts/`, `server.js` that requires a moved file. Handle `require(` with a string, with a template string, and `path.join(...)` forms by hand when the script flags them (search for `'src'`, `"src"`, `src/`, `__dirname` in `test/` and `scripts/`).
3. After the rewrite, load every moved file once with Node to catch a wrong path (`node -e "require('./src/...')"` with `MONGO_URI`, `REDIS_URL` unset), then run the full suite.
4. If a circle or a forbidden import appears that this plan did not predict, **stop and tell the owner**; do not invent a fix.

## 9. Not in this change
Splitting big files (`plan.controller.js` is 945 lines, `auth.controller.js` 647), renaming files, changing any behavior, moving tests next to the code, the readiness work, an `index.js` per module.

## 10. Risks
- A wrong path breaks the server at start-up. Mitigation: one module group per step, the full suite after each, the owner's commit between steps.
- String-built test and script paths are easy to miss (section 2 lists the files).
- The seed scripts read files by path and write to a real database when run; they are never run here.
- Other branches or uncommitted work touching `src` would conflict; step 0 checks the working tree.
- No user-visible benefit; it pays off with the next features.

## 11. Definition of done
All of: section 5 table fully applied; no old folder left; the architecture test exists and passes and fails on a forbidden import; server suite count equals the baseline plus 1; client build and lint pass; README, TESTING and the listed docs and comments updated; a report that says what was not checked; the owner has the git commands for each step.
