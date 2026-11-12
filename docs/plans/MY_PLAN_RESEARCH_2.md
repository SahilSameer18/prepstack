# My plan: research round 2 (13 Nov 2026): students, missed days, spaced repetition

Purpose: before coding My plan, learn (1) what students say about study planners and why plans fail, (2) how other apps handle missed days and rescheduling, and (3) how spaced repetition schedules revision. All pages below were opened and read by me through reading tools; where a page could not be read, it says so. **Nothing here is a claim PrepStack will make to students.** The student material is anecdote and much of it is from companies selling something; the app documentation is how those products say they behave; the spacing evidence is from Wikipedia's summaries of studies, not the studies themselves. The proposals at the end are our own design.

## 1. What students say (anecdote; some of it from sellers)
**Read:** seven English pages about LeetCode and interview prep (two Blind threads from 2019 and 2022, a vendor blog on burnout, two personal blogs, an Educative blog, an affiliate site) and six Indian placement-prep pages (FACE Prep, Manipal Jaipur, Shobhit University, Placement Preparation.io, BeInCareer, JobRise). **Not read:** the Reddit threads (the fetch was blocked), the LeetCode discuss thread (HTTP 403), and the Indian student forums (r/developersIndia and similar). So **the Indian students' own voices are missing**; what I have is what training companies and colleges say about them. Statistics on those pages (84 percent unprepared, 42 percent rejected for formatting, 83 percent unemployed) have no usable source on the page, so none is used.

**What goes wrong, by how often the pages name it**
| Cause | English pages (7) | Indian pages (6) |
|---|---|---|
| Starting late | not a theme | 5 |
| Job hours, meetings or fatigue block study | 3 | - |
| Habit trouble, inconsistent or last-minute effort | 4 | 3 |
| No structure or plan | 4 | 2 |
| Volume over quality, "a misleading sense of progress" | 3 | - |
| Forgetting old topics, no review | 3 | 2 |
| No feedback or measurement | 3 | - |
| Overwhelm, decision fatigue, too many resources | 2 | - |
| Aptitude skipped or underestimated | - | 4 |
| Poor communication, weak resume, no mocks | 4 | 4 to 5 |
| Burnout | 2 | - |

**What the writers recommend (opinion, no data):** a tiny **5-minute starter** for each section so starting is easy on bad days; fewer, steadier sessions (3 to 5 problems a week for 12 weeks) for people with jobs; energy-based days; an **error log** (concept, pattern, implementation, edge case) with review dates; re-solving after a day, a week and 3 to 4 weeks; a weekly mock; a plan reviewed every two weeks ("a plan unchanged for a month has already silently failed"). **Wishes for a tool:** track streak, time per topic, days since a topic was last solved, and an error log with review dates; an accountability partner.

**Research (via a search summary, not the papers):** study-time estimates by undergraduates did not show the optimistic bias people assume, and procrastinating students estimated as accurately as others but started later and studied less; if-then planning raised task completion in one experiment. Evidence on student plans is thin; we treat all of this as hypotheses for the student check.

## 2. How other apps handle missed days
**Read:** Reclaim help (priorities, auto-reschedule, "Done scheduling", manual reschedule; **legacy 1.0 docs**), Runna support (skip, rearrange, calendar, "Not feeling 100%"), TrainAsONE (FAQ and feature page), a running coach's blog, Motion's auto-scheduling help. **Not read:** Reclaim 2.0 docs and any Couch to 5K page.

| Product | What a missed item does | Limits | Notes |
|---|---|---|---|
| Runna | Missed but not skipped: later workouts shift; "skip" removes it, "rearrange" keeps it | one workout at a time, same week or one week either way, only onto a free day; if more than 3 workouts or a whole week are missed a "Plan Realignment" pop-up offers options (one cannot be undone) | warns that a change "could affect training", "up to you if you go ahead"; "Not feeling 100%": 3 to 14 days at a chosen level (reduced, easy only, none) and a return ramp (slowly, balanced, quickly) |
| Reclaim (1.0) | unlocked events move to the next best time within seconds; a task never started can be re-blocked or auto-closed after N days | a dragged event is locked and never moves again | priorities P1 to P4, then soonest due date |
| Motion | overdue tasks go to "the next available slot", flagged "Could not fit" if none | deadlines first, then priority, then duration | automatic; can place a hard-deadline task outside working hours |
| TrainAsONE | the missed workout is dropped overnight and the whole plan recalculated | none stated | "follow the newly updated plan"; no make-up |
| Running coach (advice) | move by session type: recovery can be skipped; intervals at most 2 to 3 days; long run 1 to 2 days | never two key sessions back to back; "don't cancel another workout to make space"; never squeeze several misses into one week | |

**What to copy for a study planner**
1. **Skip and move are different actions** (Runna): "skip" removes it from the plan but keeps the topic visible; "move" keeps it with a new date.
2. **Cap how far an item moves and protect the key days** (running coach): a missed item moves a few days at most, never onto a mock or checkpoint day, and several misses are not squeezed into one day.
3. **A threshold that asks the student** (Runna): behind by a set amount, the app suggests a realignment and lets the student choose; a warning, not a block.
4. **A short time-boxed adjustment with a return ramp** (Runna): "lighter days" for exams or travel.
5. **A manual move is locked** (Reclaim): a rebuild does not undo what the student placed by hand.
6. **Order when there is not enough room** (Motion): dated items first, then priority; what does not fit is shown ("could not fit"), not hidden.

**What would be wrong for a study planner**
1. **Silently dropping a missed item** (TrainAsONE): a student would lose a topic with no trace.
2. **Treating items as independent** ("a single skipped run won't matter"): DSA topics build on each other, so a skip needs a prerequisite warning.
3. **Moving work into overloaded or out-of-hours slots with no preview** (Motion): a silent growing backlog; our days stay at 85 percent and changes are previewed.

## 3. How spaced repetition schedules revision
**Read:** the Anki manual (deck options, studying, the algorithm FAQ), the FSRS explainers (Expertium, Domenic Denicola, Borretti), RemNote help, the SuperMemo SM-2 text, Wikipedia on the spacing and testing effects, and five coding-practice pages (two Red-Green-Code posts, a Blind thread, StudyCards AI which sells a product). **Not read:** the Cepeda and Roediger studies themselves, and the NeetCodeSRS page (it redirected).

- **The idea in plain words:** ask again just before you would forget; each correct answer lengthens the wait; a wrong answer shortens it.
- **Fixed ladders:** SM-2 is "1 day, 6 days, then multiply by an ease factor (starts 2.5)"; coding pages suggest 1, 3, 7, 14 (30) days, or doubling (1, 2, 4, 8 ... days), with failure meaning reset or shorten; Anki's default-style ladder quoted on Blind: 1, 7, 16, 35 days.
- **FSRS** (the modern Anki scheduler) predicts for every card how fast it fades and needs hundreds of reviews to fit; the sources warn against hand-tuning it. **We do not copy it.**
- **Workload is the real problem.** Anki's own rough statement: 20 new cards a day gives about 200 reviews a day. Its remedies: fewer new cards, a daily review cap, lower target retention, and **"stop introducing new cards until you catch up with that backlog"**; late reviews are not punished, they just wait. A higher retention target "leads to shorter intervals and more reviews per day".
- **Evidence (from Wikipedia's summaries):** spaced practice beat massed practice in 259 of 271 comparisons (a count of comparisons, not an effect size); the benefit is strongest when gaps are days to weeks; retrieval practice beats restudy, but the page lacks effect sizes and the effect is disputed for complex material. **No controlled study of LeetCode review was found**; the coding schedules are opinion.
- **Arithmetic (mine):** if every new problem is reviewed 6 times, 5 new problems a day means 30 reviews a day at steady state, which is 7 to 17 hours a week at 2 to 5 minutes each: **too heavy**. So the ladder must be shorter for problems solved alone, and capped.

## 4. What this changes in My plan (proposals; none applied yet)
| # | Proposal | Why (source) |
|---|---|---|
| R1 | **A three-button result when you tick an item:** "Solved alone", "With hints", "Needed the solution" (one tap). It drives the review ladder, the weekly review's weak topics and an honest picture of the week. | students ask for feedback and an error log; coding pages review by how it went |
| R2 | **A short review ladder driven by R1.** Alone: review at day 7 and day 30, then done. With hints: day 3, 14, 45. Needed the solution: day 1, 4, 14, 45. A passed review moves to the next gap; a failed review goes back to the first gap. A review is a 2 to 3 minute recall (name the pattern, the key idea, the complexity, one edge case); a full re-code only after a failed review. CS notes sections are reviewed by **retaking their 5-question quiz** (score 4 of 5 or more passes) at day 3, 10 and 30. | sources agree on growing gaps; the exact numbers are our design; the quiz already exists |
| R3 | **A daily review cap and a backlog rule.** Reviews may use up to 15 percent of a day's minutes, oldest and failed first; what does not fit waits, nothing is deleted; **no new item is added while the overdue reviews are more than one day's cap.** This replaces the plain weekly revision block. | Anki: cap reviews, stop new cards while behind |
| R4 | **Skip and Move are separate.** Skip keeps the topic on a visible "skipped" list and warns when later topics build on it (using our dependency order). Move keeps the item with a new date, a few days at most, never onto a mock or checkpoint day. | Runna, running coach |
| R5 | **Never silently remove or silently move.** Yesterday's missed items show at the top of today as "carried over" (a view only; the plan's dates change only when the student rebuilds). At 2 or more days behind, or 3 or more missed items, the plan suggests a rebuild with the preview already decided in the plan. | TrainAsONE (wrong), Runna's threshold, our rule of previews |
| R6 | **Lighter days.** The student can set 1 to 14 days at fewer hours (exams, travel, illness), with a return to normal after it, through the same preview and confirm. | Runna "Not feeling 100%" |
| R7 | **Manual moves are locked** and a rebuild works around them. | Reclaim |
| R8 | **Start small.** The Start button opens the smallest item of the day first, and "just open it and read for 5 minutes" counts as starting. | the "5-minute starter" idea from the Blind threads |
| R9 | **Overflow order:** dated items (a behavioral week, mock blocks) first, then core, then extra; anything left out is listed as "could not fit". | Motion |
| R10 | **Not copied:** FSRS or any per-item learned model; SM-2 ease factors; auto-moving items; coins or accountability features in version 1. | complexity, data needs, our rules |

**Effect on the plan:** the generator and data model grow (a result and a due-date per item, review items, date-range hours, locked items, skipped state); tests and the weekly review grow with them. I estimate **3 to 4 more working days**, so about 16 to 18 in total.

## 5. Open questions for the student check (from section 1; hypotheses, not facts)
Do you plan around a job or classes? When did you last fall behind, and what happened next? Do you forget solved problems after a week? Would a one-tap "how did it go" at each tick annoy you or help? Would you use a "lighter days" button? Does a plan that tells you how far behind you are motivate or discourage you? Is aptitude part of your placement preparation (the Indian pages name it 4 times in 6; PrepStack removed its aptitude pages on 7 Nov, so this is a product question for the owner, not part of this plan)?

## Sources read (final URLs)
Students: teamblind.com (posts amsqo1ua, ex7dkd6s), dev.to (LeetCode burnout while working), cnatural.substack.com, old.stonecharioteer.com, educative.io blog, macmyths.com, faceprep.in, jaipur.manipal.edu, shobhituniversity.ac.in, placementpreparation.io, beincareer.com, jobrise.io; research via search summaries (research.vu.nl, appam.confex.com). Missed days: help.reclaim.ai (6207587, 6937489, 5105077), support.runna.com (15012850, 13531498), intercom.help/runna (10137793), taow.trainasone.com (two pages), blog.runningcoach.me, usemotion.com help. Spaced repetition: docs.ankiweb.net (deck-options, studying, what-spaced-repetition-algorithm), expertium.github.io/Algorithm.html, domenic.me/fsrs, borretti.me, help.remnote.com, super-memory.com/english/ol/sm2.htm, en.wikipedia.org (SuperMemo, Spacing effect, Testing effect), redgreencode.com (tip 10 and 2023 tips), teamblind.com (when-to-redo-failed-leetcode-questions), studycardsai.com.
