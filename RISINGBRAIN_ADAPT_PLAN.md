# What to adapt from RisingBrain: plan

Written 16 Nov 2026 after a logged-in review of https://risingbrain.org. Status: **proposed**. The owner decides which items to build and when; nothing here is started. When the owner picks items, copy them into `BUILD_CHECKLIST.md` and tick them there.

Rule for every item: the idea is borrowed, the content and code are our own. Nothing is copied from RisingBrain.

## What RisingBrain is (short)

A free, founder-led placement site built on one educator's YouTube audience. A pattern-first DSA sheet (620 problems in 3 sheets), core CS notes with quizzes (OOP, SQL, DBMS, OS, CN), aptitude, puzzles and 40 interview write-ups. Dashboard with streak, heatmap and progress bars. No plan, no schedule, no time estimates, no sources for its notes.

## Good in RisingBrain

- A cue line on every pattern: "when the problem says X, reach for this".
- One row per problem: tick, LeetCode, GFG, video, hint, bookmark, note.
- Streak, month calendar and a 12-month activity heatmap.
- A small first step ("the first pattern takes about 10 minutes") and reading without sign-up.
- Breadth: aptitude, puzzles, real interview stories including rejections.
- An audience, which is their real advantage.

## Good in PrepStack (keep and protect)

- My plan: paced days, fair share, review ladder, pause and resume, recovery. RisingBrain has none of this.
- Sourced notes with numbers from scripts; system design and behavioral coverage.
- Honest copy: no invented user counts.
- Already present: a streak on the dashboard (`UnifiedDashboard.jsx`) and per-problem notes (`useProblemNotes`).

## Items

Each item is optional and small. Order is my recommendation.

### A. Cue lines on DSA sheet topics (about 1.5 days)
- Add one cue line per sheet topic: "when the problem says …" plus one line on the idea, in our own words.
- Same text later feeds the optional DSA pattern lessons (`docs/plans/DSA_LESSONS_PLAN.md`).
- Content rule: written from our own understanding, checked against the problems in each topic; logged in `docs/content/SOURCES.md` if it states a fact.
- Done when: every sheet topic shows its cue; a test fails if a topic has none.

### B. Activity heatmap on the dashboard tab (about 1.5 days)
- A 12-month grid of days with something solved or done. The streak already exists.
- Goes on the dashboard or the My plan history tab. **Never on the Today screen** (owner rule, decision 33 of `docs/plans/MY_PLAN_PLAN.md`).
- Check first what activity data the server already stores (solve dates, plan task ticks); add nothing new if it is enough.
- Done when: grid matches stored dates, empty state is clear, works at phone width, tests added.

### C. "First step in 10 minutes" start (about 0.5 day)
- Homepage line and a first-task hint in the plan builder result. Only claim a time we can back with our own minute figures.
- Done when: the claim matches the actual first task minutes.

### D. Read without login (about 0.5 day, check first)
- Confirm notes, roadmaps and sheets can be read signed out; login only gates plan generation and saving progress (existing rule 6 in `CLAUDE.md`).
- Done when: a signed-out visitor can open each public page; a test lists the gated routes.

### E. One-row problem actions (check first, then 1 to 2 days)
- Compare our sheet row with theirs: tick, problem link, hint, bookmark, note. Note exists. Decide which of hint, bookmark and video link we add. A video or hint needs a source we have actually read, so this may stay small.
- Done when: the owner picks the gaps; each added action has a test.

### F. Pattern tags and a pattern view (after the shared problems file; about 3 days on top of it)
- Why: RisingBrain files each problem under the pattern that solves it (topic, then pattern, then problems). Our sheets are mostly by topic. Recognising the pattern is the real interview skill.
- Add a pattern tag to each problem in the shared DSA problems file (`docs/plans/DSA_PROBLEMS_PLAN.md`, checklist section 9). Our own groups, built from our problems and our reading; do not copy their list. A problem may carry two tags.
- Offer two views of the same problems: "by topic" (as now) and "by pattern". No new sheet; existing sheets and progress keep working.
- My plan can use the tags to mix patterns in the last weeks, so review is not always grouped by pattern.
- Ties to the optional DSA pattern lessons (`docs/plans/DSA_LESSONS_PLAN.md`): one lesson per pattern, linked to its problems. Item A's cue lines become the lesson openers.
- Needs: checklist section 9 done first. Without it, tags would have to be added to every sheet separately.
- Limits to say plainly: pattern boundaries are a judgement; small groups (5 or 6 problems) are mostly labels; a grouped list is easier than a real interview, hence the mixed review.
- Done when: every problem has at least one tag, both views show the same totals, the progress numbers match, tests cover the tag file and the views.

### G. Later, only with permission
- Real interview stories (checklist 15.3), each with the person's consent.
- A quiz score screen per notes section (checklist 8.1 Quizzes page, optional).

## What we are not doing

- Aptitude and puzzles: large content work, not our edge.
- Unsourced numbers or counters like "100k learners".
- Putting a streak, graph or menu on the Today screen.
- Copying their green-on-black look; the redesign stays cream and orange.
- Copying their content or their interview write-ups.
- Chasing their breadth instead of making the plan and content accurate.

## Not checked in the review

- The hint panel, bookmarks and notes on a single RisingBrain problem.
- What the quiz score screen looks like after submitting.
- Desktop layout (the pane was phone width).
- Any paid or mentorship features (none were visible).

## Decisions for the owner

1. Which of A to F to build, and in what order (recommended: A, B, C, D, E, then F after checklist section 9).
2. Whether the cue lines should wait for the DSA lessons or ship alone (recommended: ship alone).
