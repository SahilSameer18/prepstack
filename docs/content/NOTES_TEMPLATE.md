# Notes template

Every notes section (one topic area, for example "Deadlocks" in OS) follows this shape. The same shape every time means the page can be built from data, the reading time is computed, and the analyzer, the roadmaps and the DSA sheets can link to a section by its id.

This file describes the **data format that exists since stage 2**. The rules are enforced by `server/src/validators/notes.validators.js` (tests: `server/test/content-ids.test.js`); a notes data file that breaks them stops the seed before it touches the database.

## Where the data lives

One file per subject in `server/src/data/notes/` (`os.js`, `dbms.js`, `cn.js`, `oops.js`), each `{ subject, sections: [...] }`. After changing one, run `npm run seed:notes` (it wipes and re-inserts the notes collection).

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
