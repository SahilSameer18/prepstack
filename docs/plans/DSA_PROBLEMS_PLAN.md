STATUS (2026-11-10): PLANNED, not started. Build it after `IMPROVEMENT_PLAN.md` is finished completely (stages 3 to 5). Written 10 Nov 2026 from measurements of the five sheet seed files; re-measure before starting, because sheets may have been added.

# DSA problems: one file of problems, many sheets

## 1. Why this is needed

Measured on 10 Nov 2026 from `server/src/seed/sheetSeeds/*` (reading the data only, nothing changed):

| Sheet | Problems | Main source of the links |
|---|---|---|
| Striver A2Z | 446 | takeuforward.org |
| Love Babbar | 450 | GeeksforGeeks (402 of 450), LeetCode, SPOJ and others |
| NeetCode 150 | 151 | LeetCode |
| Striver SDE | 193 | takeuforward.org |
| Blind 75 | 75 | LeetCode |

- 1,315 entries but only **1,200 distinct links**. 77 links appear in 2 or more sheets (72 in two, 5 in three).
- **Repeats inside one sheet:** Love Babbar lists the same link 27 times (for example "Merge 2 sorted arrays" under both Array and Searching & Sorting); NeetCode, Striver A2Z and Striver SDE repeat 2 each.
- **Same problem, different wording or site:** by title, 173 of 1,081 distinct titles are in 2 or more sheets (132 in two, 36 in three, 5 in four). This is approximate, because titles differ between sources.
- **Disagreeing difficulty for the same link:** `sum-of-two-integers` is Easy in Blind 75 and Medium in NeetCode 150; `word-ladder` is Hard in Love Babbar and Medium in NeetCode 150.

What this causes today:
- Progress is stored per sheet by link (`Progress { user, sheetSlug, solvedProblems: [{ link, solvedAt }] }`). Solving Two Sum in Blind 75 does **not** tick it in NeetCode 150, so students redo work and the dashboard double counts.
- The same problem is written again in every sheet, so one fix (a dead link, a wrong difficulty) must be made in several places.
- A problem has no permanent id (only sheet topics have one). The Role Analyzer and the future "My plan" cannot count "solved N of M in Graph" from real data.
- More sheets are coming. Without a shared list, every new sheet adds more repeats.

## 2. What you decided (10 Nov 2026)

1. **One file of problems**, each with a permanent id; sheets only list problem ids.
2. **Same problem on two sites:** merge when sure (the same normalized link is one problem). A same-title match on a different site goes into a short list that **you approve**; nothing is merged on a guess.
3. **Adding a new sheet later:** you paste a list; a script matches it to problems we already have, adds only the new ones, and shows what it matched for you to check.
4. **Each problem carries:** id, title, links, difficulty, topic tags and company tags.
5. **Company tags:** you will give a source or a list. Until then the field exists and stays empty. The source is recorded in `docs/content/SOURCES.md`. No company tag is ever added from memory.
6. **Other clean-ups:** you answered "I don't know". The plan includes all four below as the default; change them at the first review (section 8).
   - one difficulty per problem;
   - review of repeats inside one sheet (accidental ones removed, deliberate ones kept);
   - a check of every link;
   - one shared tag list, while each sheet keeps its own topic names.

## 3. The design

### 3.1 Files

```text
server/src/data/dsa/
  problems.js              the one list of problems
  sheets/blind-75.js       one small file per sheet
  sheets/neetcode-150.js
  sheets/love-babbar.js
  sheets/striver-a2z.js
  sheets/striver-sde.js
  tags.js                  the shared tag list (graph, dp, array, ...)
```

A problem:

```js
{
  id: 'two-sum',                       // permanent; kebab-case of the title; a clash gets a suffix, e.g. 'merge-intervals-2'
  title: 'Two Sum',
  difficulty: 'Easy',                  // Easy | Medium | Hard | Basic (exactly one, here and nowhere else)
  tags: ['array', 'hash-table'],       // only values from tags.js
  companies: [],                       // empty until a source is given (section 2, item 5)
  links: [{ url: 'https://leetcode.com/problems/two-sum/', main: true }],   // first main link is the one shown
  aliases: ['https://old.example/two-sum'],   // every older link that meant this problem (keeps old progress working)
}
```

A sheet:

```js
{
  slug: 'blind-75', name: 'Blind 75', description: '...',
  topics: [ { id: 'arrays-hashing', title: 'Arrays & Hashing', problems: ['two-sum', 'contains-duplicate'] } ],
}
```

- Topic ids stay exactly as they are now (they are linked from the skill catalog and notes). Order and grouping stay per sheet: the same problem may be under different topics in different sheets.
- "This problem appears in sheets A and B" is **worked out by code**. It is never typed, so it cannot drift.

### 3.2 What the database and the API keep

- The seed **builds the same embedded sheet documents as today** (topic, problems with title, link, difficulty, tags) from the two kinds of file, and adds the problem `id`. `GET /api/sheets` and `GET /api/sheets/:slug` keep their shape, so the sheet list page needs no change in its first step.
- `totalProblems` on a sheet is counted by problem id, not by link.

### 3.3 Progress

- New shape: one record per user, `Progress { user, solved: [{ problemId, solvedAt }] }`, unique on `user`.
- Toggle takes a problem id: `POST /api/sheets/:slug/progress` with `{ problemId }` (checked against the sheet's problems, as the link is checked today). It stays one atomic update with the E11000 retry used today.
- Ticking a problem in one sheet ticks it in every sheet that contains it.
- Per-sheet counts (`solved / total`, `lastSolvedAt`) are joined from the sheet at read time. The dashboard summary, the streak (`istDayNumber`, `currentStreak`) and `getUserStats` read the same record, so totals match everywhere (the existing "stats equal dashboard" test style).
- The API sends **problem ids** to the client for solved problems (today it sends links).

### 3.4 Notes on problems (B2, from `IMPROVEMENT_PLAN.md`)

`ProblemNote` is keyed `{ user, problemId }` (one note per user per problem, shared by every sheet). If B2 ships before this plan with links, the progress migration script also maps its notes from link to id (same alias table).

### 3.5 Role Analyzer and My plan

- The skill catalog keeps pointing at sheet topic ids (they do not change).
- The shared tag list lets **code** (not the AI) answer "how many Graph problems has this student solved": count the student's solved problems that carry the `graph` tag. This is the real signal for the analyzer (Part 2, I-5) and for My plan.
- Whether the analyzer's "likely coding topics" stays an AI guess or becomes a rule is a separate open decision (see `docs/plans/ANALYZER_PLAN.md` and the notes in `IMPROVEMENT_PLAN.md`). This plan only provides the data.

## 4. How a new sheet is added (the tool)

`server/scripts/add-sheet.js <file>` where the file is a plain list: sheet name, slug, topics, and for each problem a title and link (JSON, or CSV exported from a spreadsheet).

1. **Dry run by default.** Nothing is written until you run it with `--write`.
2. For each problem it tries, in this order:
   - the normalized link equals a link or alias of a problem we have: **same problem**;
   - the normalized title equals a title we have, but the link differs: **maybe the same**, written to a review file, not merged;
   - nothing matches: **new problem**, with a new id.
3. It prints counts (matched, maybe, new), writes `review-<slug>.md` with the maybe list, and refuses to continue past a link that is not a web address.
4. After you decide the maybe list, it writes `sheets/<slug>.js` and appends new problems to `problems.js`. Difficulty and tags of new problems are taken from the list if given, and otherwise flagged "needs a value" (the test in section 6 fails until you set them).

"Normalized link" means: lower case, no `https://` or `www.`, no `?query` or `#fragment`, no trailing `/`.

## 5. Phases

One phase at a time; after each, run both test suites and stop for your go-ahead. No commit unless you ask.

### Phase 1: build the catalog (about 2 days)
- A one-time script reads the five existing seeds and groups problems by normalized link (the certain merges only).
- It writes `problems.js` (ids, difficulty, tags, links, aliases), the five sheet files, and `docs/research/DSA_MERGE_REVIEW.md` with three lists for you:
  1. same title on different sites (**maybe the same**);
  2. same link with a different difficulty in different sheets (**pick one**);
  3. repeats inside one sheet (**accidental or on purpose**).
- No database change, no API change.
- **Done when:** the generated files load, and the counts match the table in section 1 (1,315 entries become 1,200 problems before any title-based merge).

### Phase 2: your review (about 1 day of your time)
- You go through the three lists; I apply your answers.
- Check the shared tag list against the tags already on the problems (`dp`, `array`, `string`, `graph`, `tree`, ...) and agree one spelling for each.
- Company tags: when you give a source, record it in `SOURCES.md` and fill `companies` only from it.
- **Done when:** no unanswered line in the review file.

### Phase 3: tests first (about 1 day)
In `server/test/dsa-problems.test.js` (reads the data files; no network, no database):
- problem ids are unique, kebab-case, and valid;
- every id used by a sheet exists, and every problem is in at least one sheet;
- no link or alias is used by two different problems;
- difficulty is one of the allowed values; every tag is in `tags.js`; `companies` is an array (and empty unless a source is recorded);
- every sheet topic has a permanent id (existing rule) and no topic lists the same problem twice;
- the skill catalog and the notes links still resolve (the existing `internal-links` test keeps running);
- `collectUrls` in `server/scripts/check-links.js` also lists every problem link, so `npm run check:links` covers them.
Break each rule on purpose once (mutation check) and confirm a test fails.

### Phase 4: server and client switch (about 3 days)
- New seed (`server/src/seed/dsaSeed.js`) validates first and then replaces the sheets (same "validate before wiping" rule as `notesSeed.js`). `masterSeed.js` calls it.
- New progress model and the changed controllers: `sheets.controller.js` (toggle by id, read progress), `user.controller.js` (dashboard summary, stats), `sheets.validators.js`.
- `server/scripts/migrate-progress-to-problem-ids.js [--dry-run]`:
  - for each old `Progress` document, map each `link` to a problem id through links and aliases;
  - merge the sheets of one user into one list; if the same problem was solved in several sheets, keep the **earliest** `solvedAt`;
  - a link that maps to nothing is **listed, never dropped silently**; the script stops before writing if any is unmapped, unless `--allow-unmapped` is given;
  - the old collection is **renamed, not deleted**, so it can be restored;
  - running it twice changes nothing.
- Client: `SheetsDetail.jsx` (solved list by id, the progress count, the note drawer key), `useProblemNotes.js` (keyed by id), `sheetService.js` (`toggleProblem(slug, problemId)`).
- Tests: toggle across two sheets ticks both; counts per sheet; dashboard totals equal stats; streak unchanged for old data; migration (old shape in, new shape out, idempotent, merged `solvedAt`, unmapped reported); deleting the account removes the new progress record (the existing cascade picks up the `user` field).
- **Done when:** a student's old ticks are all still ticked after the migration (checked on a copy of real data), and both suites pass.

### Phase 5: the add-sheet tool and docs (about 1.5 days)
- `server/scripts/add-sheet.js` as in section 4, with tests using a small made-up list (exact link match, alias match, same title different link, new problem, dry run writes nothing, bad link refused).
- Update `README.md`, `TESTING.md`, `docs/content/` (how to add a sheet), and `docs/README.md`.

### Phase 6: link and quality check (about 1 day)
- Run `npm run check:links` on all problem links; fix or replace dead ones in the one file.
- Spot-check 30 random problems per sheet by opening the link (difficulty, title, site).

**Total:** about 9 to 10 working days, plus your review time.

## 6. Deploy order (the new server cannot read the old progress shape)

1. Back up, then run `node scripts/migrate-progress-to-problem-ids.js --dry-run` on the live database and read the output.
2. Run `npm run seed:all` (new sheets with problem ids) on the live database.
3. Run the migration for real.
4. Deploy the server, then the client.
Until step 4 is done, the old client sends links; the new server rejects them, so do 3 and 4 close together (the same pattern as the dated-progress migration of stage 1).

## 7. Risks (stated honestly)

- **A wrong merge** would tick a problem a student did not do. Mitigation: only same-link merges happen automatically; everything else is on a review list you approve.
- **Sheet counts and percentages change once.** A shared problem is counted once per sheet as before, but a student who did a problem in another sheet now sees it ticked. Say so in the release note.
- **The migration cannot be undone by users.** The old collection is kept renamed so it can be restored by hand.
- **Titles are not reliable ids.** Ids are chosen once and never edited; a test fails if an id disappears (compare with the previous file in review).
- **Company tags** are only as good as the source you give. No source, no tags.
- **Time:** this is about two weeks of work in the middle of other stages; do not start it before the improvement plan is finished.

## 8. Open decisions for the first review

1. Clean-ups (section 2, item 6): keep all four, or drop some?
2. Is an accidental repeat inside a sheet removed, and a deliberate one (same problem under two topics) kept? The review file shows each case.
3. Which sheets will you add next, and where is each list from? (The add-sheet tool needs a plain list.)
4. The company-tag source.
5. The analyzer's "likely coding topics": AI guess, rule from tags, or removed? (Decided in the analyzer plan, not here.)
