# Notes template

Every notes section (one topic area, for example "Deadlocks" in OS) follows this shape. The same shape every time means the page can be built from data, the reading time is computed, and the analyzer, the roadmaps and the DSA sheets can link to a section by its id.

This file describes the **data format that exists since stage 2**. The rules are enforced by `server/src/validators/notes.validators.js` (tests: `server/test/content-ids.test.js`); a notes data file that breaks them stops the seed before it touches the database.

## Where the data lives

One file per subject in `server/src/data/notes/` (`os.js`, `dbms.js`, `cn.js`, `oops.js`), each `{ subject, sections: [...] }`. After changing one, run `npm run seed:notes` (it wipes and re-inserts the notes collection).

**Sections written as Markdown (DBMS first).** A rewritten section is one Markdown file in `server/src/data/notes/dbms/`, named after the section id (`dbms-normalization.md`). `dbms.js` loads the sections that are not rewritten yet from `dbms.legacy.js` and replaces any of them with the Markdown file of the same id (same place in the list); a Markdown file with a new id is added at the end. When a section is published, delete its old version from `dbms.legacy.js`. The loader is `server/src/data/notes/markdownSections.js`; a starter file is `server/src/data/notes/dbms/_example.md` (files starting with `_` are ignored). The result is exactly the data described below, so the validator, the seed and the API do not change.

```markdown
---
id: dbms-normalization            (must equal the file name)
title: Normalization
lastChecked: 2026-11-10          (leave out while the section is a draft)
next: dbms-transactions          (or "none")
sheetTopics: blind-75:arrays-hashing, striver-sde:arrays-i
roadmapSteps: backend:database-design
---
## Overview               paragraphs separated by a blank line
## Topic: Second normal form      then **Definition:** **Why:** **Example:** **Failure:** (each runs until the next)
## Questions              ### the question, then the answer
## Mistakes               - one per bullet
## Quiz                   ### the question, "- [ ] option" lines, one "- [x] right option", then "Explanation: ..."
## Diagram                a fenced json block (kinds below); repeat the heading for more diagrams
```

**Drafts.** A section that has been written but not reviewed lives in `server/src/data/notes/dbms/drafts/<section-id>.md`. The loader reads only the top folder, so a draft is **not** on the site. `server/test/notes-markdown.test.js` keeps the drafts honest: each has no `lastChecked`, would pass the full template if it had one, points at a next section and roadmap step that exist, and the `next` links follow the order of the subject. To publish one: get the outside reader's answers (`REVIEW_CHECKLIST.md`), fix what they found, add `lastChecked: YYYY-MM-DD` to the header, move the file up one folder (to `server/src/data/notes/dbms/`), delete the old section from `dbms.legacy.js`, run `npm run seed:notes` and both test suites, and fill the "Checked by" and date cells of its rows in the claims table in `SOURCES.md`. The source notes behind each draft are in `docs/content/source-notes/`.

A mistake in the format (an unknown heading, two right answers, broken diagram JSON, an id that is not the file name) stops the seed with the file name and line. Windows line endings are fine. Code fence lines are dropped from an example but the code stays, and a heading or field line inside a code fence is just text. `<!-- comments -->` are ignored.

## A section

```js
{
  id: "os-deadlocks",            // permanent: <subject>-<words>; never changed, links use it (never the title)
  title: "Deadlocks",
  lastChecked: "2026-11-09",     // set ONLY when the section is rewritten to this template and reviewed
  overview: ["paragraph one", "paragraph two"],   // 60 to 120 words in total
  topics: [ { name, definition, why, example, failure } ],            // 4 to 8
  questions: [ { question, answer } ],                                // 3 to 5
  mistakes: [ "..." ],                                                // 2 to 3
  quiz: [ { question, options: [a, b, c, d], answer: 1, explanation } ],   // exactly 5; answer is the index 0 to 3
  links: { sheetTopics: ["blind-75:graph"], roadmapSteps: ["backend:database-design"], next: "os-memory-management" },
  diagrams: [ ... ],             // optional, at most 3
}
```

**`lastChecked` is the switch.** Every section must have a unique `id` and a `title`. The full template is enforced only for a section that has `lastChecked`, and the page shows such a section in the new layout. Older sections (no `lastChecked`) keep their old topic blocks until they are rewritten; the old display is removed when the last section is rewritten.

| Part | Rule |
|---|---|
| Overview | 60 to 120 words in total: what it is, why an interviewer asks about it, what the reader can do after this section. |
| Reading time | **Computed** from the text (200 words a minute, rounded up). Never typed. |
| Topics | 4 to 8. Each has the four parts below. |
| Questions | 3 to 5, each with a short answer a student could say aloud. |
| Mistakes | 2 to 3 wrong beliefs or wrong answers interviewers hear often. |
| Quiz | Exactly 5 multiple-choice questions, 4 different options, one correct (`answer`, an index), and a one or two sentence `explanation`. |
| Links | `sheetTopics`: `"<sheetSlug>:<topicId>"`; `roadmapSteps`: `"<roadmapSlug>:<stepId>"`; `next`: a section id of the same subject, or `null` for the last. At least one sheet topic or roadmap step. `server/test/internal-links.test.js` fails if any of them does not exist. |
| `lastChecked` | Date `YYYY-MM-DD` of the last accuracy review (see `REVIEW_CHECKLIST.md`). |

### One topic inside a section

1. **definition:** one or two sentences. No jargon that is not explained in the same section.
2. **why:** what goes wrong, or gets slow, without it.
3. **example:** a small concrete one: numbers, a table, a few lines of code, or a step-by-step trace. Never only a description.
4. **failure:** how it fails or what interviewers probe: the edge case, the trade-off, the follow-up question.

## Diagrams

Only where a picture explains faster than text, not on every topic. A diagram is plain data (never raw SVG); one component draws it with the site's colours. Every diagram has a `caption`, which is shown under it and read by screen readers.

| kind | data | limits |
|---|---|---|
| `flow` | `{ kind: "flow", caption, steps: [{ label }] }` | 2 to 8 steps, drawn in a row (or stacked if too wide) with arrows |
| `layers` | `{ kind: "layers", caption, layers: [{ label }] }` | 2 to 8 layers, stacked top to bottom |
| `graph` | `{ kind: "graph", caption, nodes: [{ id, label, x, y }], edges: [{ from, to, label? }] }` | 2 to 10 nodes; `x` and `y` are 0 to 100 (percent of the drawing area); node ids unique; every edge between existing, different nodes |

## Writing rules

- **Interview utility over academic depth**: Explain concepts so a student can state them aloud to an interviewer in 45–60 seconds. Do not write a textbook chapter when a crisp definition, diagram, and code snippet do the job better.
- **High-frequency topics first**: Focus depth on the concepts asked in 80% of interviews (e.g., in DBMS: B+ Trees, Isolation Levels, Normalization, Joins). Keep niche/obscure topics concise.
- **We are not writing a book, we are targeting interviews**
- Plain words. A sentence a second-year student can read once and understand.
- Every claim that someone could dispute (a number, a default value, a version, "always" or "never") has a source in `SOURCES.md` before it is published.
- No filler ("In today's world...", "It is important to note...").
- One idea per paragraph. Lists only for real lists.
- Code samples are run before they are published.
- Do not copy text from books or sites. Explain it in your own words; the source is a reference, not a script.

## Roadmap steps

Roadmaps are in `client/src/data/roadmaps.js`. A step is `{ id, title, desc, resources }` (2 to 3 https resources, free, prefer official documentation), with permanent ids unique inside the roadmap. A step that has started the full template must finish it (`client/src/data/roadmaps.test.js`):

| Field | Rule |
|---|---|
| `goal` | One sentence that starts "After this step you can " |
| `time` | An honest range, for example "20 to 30 hours" |
| `topics` | 4 to 8 concrete topics |
| `practice` | At least one `{ kind: "notes" \| "sheet", target, label }`; target `"os:os-deadlocks"` or `"blind-75:graph"` |
| `checkpoint` | 2 to 3 things you should be able to do or explain |
| `project` | `{ brief, stack }`; the page links to the AI project generator with the stack filled in |

A step is linkable as `/roadmaps/<slug>#<stepId>`.

## Before publishing a rewritten section

Follow `REVIEW_CHECKLIST.md` (claims table in `SOURCES.md`, run the code, outside reader), then set `lastChecked`, re-seed, and run both test suites.
