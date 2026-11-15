# DSA pattern lessons

Written 15 Nov 2026. Status: **decided to build** (owner, 15 Nov 2026); not started. Content plan. The code side of "From the basics" is in `docs/plans/MY_PLAN_DEPTH_LEVELS_PLAN.md`.

## 1. Why

DSA is the largest part of a big-tech interview loop, and it is the first thing a MAANG-prep student looks for. PrepStack has the problem sheets, progress tracking, a roadmap with resource links and a planner, but no lessons: a student who does not know the two-pointer pattern or dynamic programming must leave the site to learn it. The lessons close that gap and make the planner's "From the basics" level possible.

## 2. What a lesson is

A lesson is a notes section in the existing format, so everything that already works for the CS notes works for it: the Markdown loader and its validator, the seed, the quiz and its scoring, saving a quiz score to a plan task, the review ladder, the notes pages, the recap view planned for every subject, the claim rows in `docs/content/SOURCES.md`, and the numbers-from-a-script rule.

- **Subject:** a new notes subject, `dsa` ("DSA lessons"), with one Markdown file per lesson in `server/src/data/notes/dsa/`.
- **Size:** about 2,000 words and a 10-minute read, like every other section; about 35 planned minutes with its quiz.
- **Shape of a lesson** (the same blocks as every section, used for a pattern):
  - **Overview:** when to reach for the pattern, and the signals in a problem statement that point to it (sorted input, "longest substring", "all combinations", a graph in disguise).
  - **Topics** (3 to 6): each topic is one form of the pattern. *Definition:* what it is, in plain words, with the technical term kept and explained. *Why:* what it buys, with the time and space cost. *Example:* a worked trace on small numbers, step by step, with the Java code that was run. *Failure:* the usual bug or edge case (off by one, empty input, duplicates, overflow).
  - **Interview questions** (5 to 8): "What is the complexity and why?", "What changes if the input has duplicates?", "How would you do it in O(1) space?".
  - **Common mistakes** (3), a **5-question quiz**, and **diagrams** that show the state at each step.
  - **Practise:** links to the sheet topics for that pattern through the `sheetTopics` header field (all five sheets), and to the roadmap step through `roadmapSteps: dsa:<step id>`; both fields exist today.
- **Language:** the examples are in Java, like the OOP notes, and every example is compiled and run by a script in `docs/content/checks/dsa/` with its output saved beside it. The definition of each pattern is written so it does not depend on the language.
- **New diagram kind, `trace`:** a row (or grid) of cells with markers for pointers, a highlighted range and a caption, one picture per step. The four existing kinds (flow, layers, graph, sequence) cannot draw an array with two pointers moving. This needs a small change in the client diagram code and in the notes validator.

## 3. The lessons (34, in 13 steps)

The steps are the 13 steps of the DSA roadmap, which are also the `step` of every sheet topic in the plan catalog, so every sheet topic already belongs to a step.

| # | Lesson | Step | What it teaches | Wave |
|---|---|---|---|---|
| 1 | Big-O and how to count work | big-o-arrays-hashing | Counting steps, best/average/worst, space, amortized cost, the common growth rates and how to read a limit like 10^5 | 1 |
| 2 | Arrays and strings | big-o-arrays-hashing | Traversal, in-place changes, prefix sums, two-dimensional arrays, string basics | 1 |
| 3 | Hash maps and sets | big-o-arrays-hashing | Counting, grouping, the two-sum pattern, how a hash map works and when it is slow | 1 |
| 4 | Two pointers | two-pointers-sliding-window | Opposite ends, same direction, fast and slow, and why sorting often comes first | 1 |
| 5 | Sliding window | two-pointers-sliding-window | Fixed and variable windows, what to keep in the window, when it fails | 1 |
| 6 | Sorting and what it unlocks | sorting-binary-search | Comparison sorts and their costs, stability, custom comparators, sorting as a first step | 2 |
| 7 | Binary search | sorting-binary-search | On an index, on a rotated array, on the answer; the off-by-one traps | 1 |
| 8 | Linked lists | linked-lists-stacks-queues | Reverse, merge, cycle detection, dummy nodes, fast and slow pointers | 1 |
| 9 | Stacks and the monotonic stack | linked-lists-stacks-queues | Matching, next greater element, evaluating expressions | 1 |
| 10 | Queues, deques and the monotonic queue | linked-lists-stacks-queues | FIFO, circular queues, sliding window maximum | 2 |
| 11 | Binary trees and traversals | trees-bst | Pre, in, post order, level order, recursion on trees, iterative versions | 1 |
| 12 | Binary search trees | trees-bst | The ordering rule, search, insert, delete, validating, balance and why it matters | 1 |
| 13 | Tree patterns | trees-bst | Depth and height, paths and sums, lowest common ancestor, serialize and rebuild | 2 |
| 14 | Heaps and priority queues | heaps-tries | Top-k, merge k lists, the two-heap median, how a heap is stored in an array | 2 |
| 15 | Tries | heaps-tries | Prefix search, autocomplete, word search, memory cost | 2 |
| 16 | Recursion | recursion-backtracking | Base case and the recursive step, the call stack, turning recursion into a loop | 2 |
| 17 | Backtracking | recursion-backtracking | Subsets, permutations, combinations, pruning, avoiding duplicates | 2 |
| 18 | Graph representations | graphs-traversal | Adjacency list and matrix, directed and weighted, grids as graphs | 1 |
| 19 | BFS and DFS | graphs-traversal | Traversal, connected components, shortest path by edges, flood fill | 1 |
| 20 | Topological sort and cycles | graphs-traversal | Ordering with dependencies, detecting cycles in directed and undirected graphs | 1 |
| 21 | Union-Find | graphs-traversal | Union by rank, path compression, components and cycles | 2 |
| 22 | Shortest paths | graphs-shortest-paths-mst | Dijkstra, Bellman-Ford, when each applies, negative edges | 2 |
| 23 | Minimum spanning trees | graphs-shortest-paths-mst | Kruskal, Prim, the cut and cycle rules | 2 |
| 24 | Greedy reasoning | greedy-intervals | When greedy works, exchange arguments, classic choices | 2 |
| 25 | Intervals | greedy-intervals | Merge, insert, overlap counting, meeting rooms, sweep line | 2 |
| 26 | Dynamic programming basics | dynamic-programming | From recursion to memoization to a table, the state, the transition, the order | 1 |
| 27 | One-dimensional DP | dynamic-programming | Climbing stairs, house robber, coin change, longest increasing subsequence | 1 |
| 28 | Two-dimensional DP | dynamic-programming | Grids, longest common subsequence, edit distance | 2 |
| 29 | Knapsack and partition DP | dynamic-programming | Zero-one and unbounded knapsack, subset sum, space optimization | 2 |
| 30 | Bit manipulation | bit-manipulation-math | Masks, shifts, XOR tricks, counting bits, subsets by bits | 3 |
| 31 | Math for interviews | bit-manipulation-math | gcd, primes and the sieve, modular arithmetic, overflow | 3 |
| 32 | How to approach an interview problem | interview-practice | Clarify, examples, brute force, improve, code, test; talking while you solve | 3 |
| 33 | Choosing the pattern | interview-practice | A signals-to-pattern guide that points to every other lesson, and choosing the data structure | 3 |
| 34 | Complexity, testing and debugging | interview-practice | Stating and proving complexity, edge-case lists, dry runs, the usual bugs | 3 |

- **Wave 1 (15 lessons):** the patterns asked most, enough for a student to start from the basics: 1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 18, 19, 20, 26, 27. About 2.5 weeks.
- **Wave 2 (14 lessons):** 6, 10, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 28, 29. About 2.5 weeks.
- **Wave 3 (5 lessons):** 30 to 34, including the "choosing the pattern" guide. About 1 week.

## 4. Sources

Facts come from primary sources that were actually read, restated in our own words; interview sites only help choose topics and question styles (rule 4 in `CLAUDE.md`). Candidates to read and log in `docs/content/source-notes/dsa-*.md` before each wave, with the terms of use of each recorded first:

- *Algorithms*, 4th edition, Sedgewick and Wayne, and its book site (algs4.cs.princeton.edu) for the standard data structures and algorithms and their costs.
- MIT OpenCourseWare 6.006 (Introduction to Algorithms) lecture notes.
- cp-algorithms.com for graph, number theory and string algorithms.
- *The Competitive Programmer's Handbook* (Laaksonen) for DP, graphs and bit techniques.
- The Java SE documentation for the costs and behaviour of the collection classes used in the examples.
- The owner's own PDFs, where the owner provides them (the same way the OS and OOP notes were done).

Every claim about a cost, a rule or a behaviour gets a row in `docs/content/SOURCES.md`; every number in an example comes from a script.

## 5. Quality rules and checks (the existing ones)

- Easy words a non-technical reader can follow; each technical term is kept and explained at first use. No "master/slave".
- Each example is compiled and run by `docs/content/checks/dsa/<lesson>.java` and its output is saved; the lesson shows only numbers and traces that script produced.
- Two read-only AI reviewers per wave (accuracy against the source notes, and plain words), writing findings to files and replying with counts; fixes; then the strict draft check. Publish only on the owner's word.
- Agents write findings to files and report counts only (cost rule); no extra review rounds unless the owner asks.

## 6. What has to change in the code (phase 1)

| Where | Change |
|---|---|
| `server/src/data/notes/dsa.js` and `dsa/` | The new subject, loaded like `hld.js` |
| `server/src/seed/notesSeed.js` | Seed the `dsa` subject (`npm run seed:notes`, run by the owner) |
| `server/src/validators/notes.validators.js` | Accept the `trace` diagram kind and its limits; the diagram count rule for `dsa` |
| `server/src/services/planData.js`, `planGenerator.js` | `dsa` is loaded as notes data and labelled "DSA lessons", but is not one of the default or chosen CS subjects: it is planned only through the DSA level |
| `server/src/services/skills.service.js`, `skillCatalog.json` | Label for the subject; map catalog skills with `dsaTopics` to lessons |
| `server/scripts/analyzer-eval.js` | Include the new subject in the references |
| `server/scripts/dsa-lesson-links.js` (new) | Writes the `sheetTopics` header of each lesson from the plan catalog, so every sheet topic of a step links to that step's lessons |
| `client/src/pages/csNotes/Notes.jsx`, `NotesDetail.jsx` | A "DSA lessons" card; the page for a lesson shows the Practise links |
| `client/src/components/notes/Diagram.jsx`, `diagramLayout.js` | The `trace` diagram |
| `client/src/pages/DsaSheets/*` | A "Learn this pattern" link on each topic that has lessons |
| `client/src/seo/pages.js`, `utils/reportLinks.js`, `utils/planBuilder.js` | Page entry, labels, links |
| Tests | Loader and validator tests, a test that every lesson id is in the plan catalog's step list, link tests, a client test of the `trace` diagram layout |

## 7. How it ties into the rest of PrepStack

- **My plan, "From the basics":** a step's lessons are planned before its problems (see the depth-levels plan). About 20 hours for all 34 lessons.
- **Standard and Quick revision for DSA:** unchanged by the lessons; the recap view works on lessons too.
- **DSA sheets pages:** each topic shows "Learn this pattern" and each lesson shows the sheet topics to practise.
- **Role Analyzer:** skills that map to DSA topics can point to a lesson.
- **Roadmaps:** the DSA roadmap steps keep their resource lists as "go deeper".

## 8. Phases, order and size

| # | Phase | Done when | Size |
|---|---|---|---|
| 0 | Decisions (section 10); read and log the sources of wave 1; record the terms of use | Answers in this file; `docs/content/source-notes/dsa-wave1.md` | 1 day |
| 1 | Plumbing (section 6) and the `trace` diagram, with one sample lesson end to end (lesson 4, two pointers) | The sample lesson is seeded locally, readable, quiz works, links work | 3 days |
| 2 | Wave 1 (15 lessons), each with its check script and run output | The owner approves the wave | about 2.5 weeks |
| 3 | Wave 2 (14 lessons) | The owner approves the wave | about 2.5 weeks |
| 4 | Wave 3 (5 lessons) | The owner approves the wave | about 1 week |
| 5 | Close-out: README, TESTING, PROJECT_STATUS, SOURCES, SEO, seed commands for the owner | The owner seeds and commits | 0.5 day |

About 6 to 7 weeks in all. The planner's "From the basics" level becomes available when wave 1 is published, so its code can be finished in parallel (depth-levels plan, phase 2).

## 9. Risks

- **Writing speed.** 34 lessons is about 70,000 words. Waves publish on their own, so the first wave is useful on its own.
- **Code correctness.** Every example is compiled and run by a script; a lesson with no script output is not published.
- **Sameness.** The pattern template repeats on purpose (students learn where to look), but each lesson needs its own failure cases and its own worked trace, not a copy of the structure.
- **Sources and wording.** Only restated facts and our own examples; nothing is copied from the sources or from interview sites.

## 10. Decisions for the owner (recommended answers first)

1. The 34-lesson list and its three waves as written? **Recommended: yes; the owner can add or drop lessons before wave 1 starts.**
2. Java for the code, like the OOP notes? **Recommended: yes for version 1. C++ and Python tabs are a later addition and would double the check scripts.**
3. A new `dsa` subject on the notes pages ("DSA lessons")? **Recommended: yes.**
4. The `trace` diagram kind (array cells with pointers) as part of phase 1? **Recommended: yes; without it the pointer patterns cannot be drawn.**
5. Start with the sample lesson (two pointers) to approve the format before wave 1? **Recommended: yes.**
6. Wave order: wave 1 first, then wave 2, then wave 3? **Recommended: yes.**

## 11. What we are not doing

- No videos, no live coding environment, no AI-written lessons shipped without the script run and the reviews.
- No copying of text, code or problem statements from any book, course or interview site.
- No change to the problem sheets themselves.
- No C++ or Python examples in version 1.
- No per-problem solutions or editorials in this plan (the lessons teach patterns; the sheets hold the problems).
