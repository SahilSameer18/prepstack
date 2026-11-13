# Instructions for AI agents working on PrepStack

1. **Read `PROJECT_STATUS.md` first.** It says what is done, what is left and the build order. Work on the next item unless the owner says otherwise. When you finish, start or drop an item, update `PROJECT_STATUS.md` (move the row, change the date) and the work's own plan file under `docs/plans/`.
2. **The owner decides; you recommend.** Give a recommendation, then ask. Never record your own pick as decided. Do not start My plan before the LLD notes are done (the owner's order).
3. **Git:** never stage, commit or push. Give the `git add` and one-line `git commit -m` commands instead. No `Co-Authored-By` or other trailers. Never touch `server/.env`. Never use ports 3000 or 5173 for throwaway checks (use 3100 and 5175).
4. **Content rules** (full rules: `docs/content/NOTES_TEMPLATE.md`, `REVIEW_CHECKLIST.md`, `IMPROVEMENT_PLAN.md` section 6):
   - Every fact comes from a primary source that was actually read; interview sites and the owner's notes only choose topics and questions. Restate in your own words; never copy.
   - Easy words a non-technical person can follow; keep the technical term and add its plain meaning at first use. Never say "master/slave" (leader/follower).
   - Every number in an example comes from a script in `docs/content/checks/` (output saved beside it) or from arithmetic shown in the text. Label made-up inputs "assumption".
   - Add claims to `docs/content/SOURCES.md`. Run the strict draft check before publishing. Reviewers re-fetch sources and re-run numbers. Publish only on the owner's word.
5. **PrepStack is free** (no payment). Logging in is the gate for generating plans and saving progress.
6. **Cost matters.** Prefer scripts and short reports over many agents; agents write findings to files and reply with counts only. No extra review rounds after the editors unless the owner asks.
7. **Before reporting done:** run the server and client tests, the build and lint (`cd client && npm run build && npm run lint`), and say what was not checked.
