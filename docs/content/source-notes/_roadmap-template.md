# Roadmap source notes: <roadmap name> (<date>)

Copy this file to `roadmap-<slug>.md` (for example `roadmap-backend.md`) and fill it in before writing any step. Files that start with `_` are templates.
Rule: write for a non-technical reader (easy words, each technical word explained next to it). Facts are restated in our own words, never copied. A step's time range, topics and checkpoints come from what the sources say, not from memory.

## Steps covered
List the step ids from `client/src/data/roadmaps.js` this file covers.

## Per step (repeat for each step)
### <step-id>: <title>
- **Pages read:** URL, page title, date read, and whether the whole page or only part was read.
- **Topics found (4 to 8):** one line each, with the page and section it came from.
- **Time estimate:** the range, and how it was reached (for example "official tutorial says about 2 hours; we allow 3 to 5 times for practice"). Estimates are opinion; log them as estimates in `SOURCES.md`.
- **Checkpoint ideas (2 to 3):** what a learner should be able to do or explain, each tied to a topic above.
- **Practice links:** notes section ids (`cn:cn-http-https-tls`) or sheet topic ids (`blind-75:graph`) that exist now. Mark any link that points at old (not yet rewritten) notes.
- **Resources chosen (2 to 3):** URL, why it was chosen, status code from `npm run check:links`. Official documentation first. Not allowed in a templated step: sites that need a login, a payment, or refuse scripts (Udemy, DataCamp, Towards Data Science, Coursera).
- **Mini-project:** the brief (300 characters or fewer) and the stack name for `/ai-projects?stack=`.
- **Not read / unverified:** anything stated in the step that no read page supports.

## Terms of use
One line per source: licence or "all rights reserved, restated only".

## Checks to run before the owner publishes
- `cd client && npx vitest run` (the template check in `src/data/roadmaps.test.js`)
- `cd server && node --test test/internal-links.test.js` (practice links and roadmap step links resolve)
- `cd server && npm run check:links` (outside links)
- Claims rows added to `docs/content/SOURCES.md`; two read-only AI reviewers have read the steps against these notes.
