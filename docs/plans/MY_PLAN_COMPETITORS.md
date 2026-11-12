# My plan: what the existing planners do (research, 13 Nov 2026)

Purpose: before building My plan (`docs/plans/MY_PLAN_PLAN.md`), look at what students already use, try it, and decide what to copy, what to skip and what nobody does. Method: I opened each product in the browser and used every feature I could use **without an account** (I do not create accounts or sign in on other people's sites). Where a feature needs a login, I say so and describe it only from what the page shows. Nothing here was copied; these are my notes about behaviour.

## What I used, and how far I could go
| Product | What I did | What I could not do |
|---|---|---|
| **Grind 75** (techinterviewhandbook.org/grind75) | Used the whole planner: changed weeks and hours, read the result, ticked and unticked a question, checked how it stores state | nothing; it needs no account |
| **Tech Interview Handbook study plan** (article) | Read the 3-month plan | not interactive |
| **LeetCode Study Plans** (leetcode.com/studyplan) | Opened the list and the Top Interview 150 plan | tracking progress needs a login (the page says "Sign in to view lists and track study progress") |
| **NeetCode roadmap** (neetcode.io/roadmap) | Opened the roadmap graph | progress needs sign-in; the Pro plan was not tried |
| **roadmap.sh** (Backend) | Opened the roadmap | tracking, "Personalize" and the AI tutor need sign-up |
| **takeUforward, Striver's A2Z sheet** | Opened the sheet page and the "Planly" planner | Planly asks to log in or sign up ("Manage your study plans"); it is described as a Plus feature |
| **DailyDSAPrep** (dailydsaprep.vercel.app) | Opened the home page | the dashboard needs sign-in |
| Indian placement platforms and trackers (DinoCode, Let's Code, InterviewBit, PerCoder, "Placement Panic Solver", PrepTrack, Notion 90-day templates) | found through two web searches only | **not used**; their claims are self-described and unverified |

## What each one really does
**Grind 75 (closest to My plan).** Inputs: weeks (a slider), hours per week (a slider), difficulty (Easy, Medium, Hard) and topics. Output: "Grind N questions" with a time needed and the line "Fits into your schedule". Try: 8 weeks and 8 hours a week gave 75 questions and 64 hours; **4 weeks and 3 hours a week gave 18 questions and 12 hours**, so it picks a smaller set that fits instead of overflowing. Questions are ordered and grouped by week (13, 12, 8, 8, 8, 9, 7, 10 questions in the 8-week plan), each with a **per-question time estimate** (15 to 45 minutes, not one number per difficulty), a difficulty colour, a link to the problem and a "mark as complete" button. You can regroup by weeks, topics or difficulty. **The settings live in the address** (`?hours=3&weeks=4`), so a plan can be shared as a link. **Ticks are kept in the browser only** (local storage), with a counter ("COMPLETED 1 / 18"); there is no account, so ticks do not follow you to another device. What it does not do: no days, only weeks; no rest days or different weekday and weekend hours; no deadline date; no "I fell behind" rebuild; DSA only (no CS subjects, no projects, no jobs).

**Tech Interview Handbook 3-month plan.** A fixed plan of weeks 1 to 4 (topic study) and weeks 5 to 12 (in-depth practice), every topic with a **priority (High, Mid, Low) and a time required** (for example Array High 2 hours, Dynamic programming Low 4 hours). It names three ways to study: breadth-first, depth-first, and depth-first-then-breadth, says which to use for how much time is left, and says to **keep the estimates conservative so you do not burn out**. Its advice for planning: "break down the dates left and hours left per day". It is an article, not a tool.

**LeetCode Study Plans.** Curated lists grouped by pattern (Top Interview 150, LeetCode 75, Binary Search, SQL 50, company "Sprint" lists such as an Amazon, Google, TikTok and Apple list). A **Start** button, tags, solution links. No schedule, no time estimates, no days; progress needs a login.

**NeetCode roadmap.** A **graph of 18 topics with the order they depend on** (Arrays and Hashing leads to Two Pointers, Stack, Binary Search and so on), a progress bar under each node. Sign-in to track. A reviewer quoted in a search result said the main practical value of the paid plan was the progress tracker.

**roadmap.sh.** Roadmaps as graphs with markers for "personal recommendation", "alternative option" and "order not strict". "Join 183,857+ others tracking their progress on this roadmap" (sign-up). Projects, an AI tutor and "Personalize". No schedule and no time.

**takeUforward (Striver's A2Z).** A 495-item sheet with an overall progress bar and an Easy / Medium / Hard split (84 / 287 / 109), a **Zen mode** (a focus view), a timed coding environment, "Revision Pictures" for quick review and **Planly, a personalised planner** that sits behind a login and the paid Plus plan. The page says the sheet takes "approximately six months at a steady pace".

**DailyDSAPrep.** Its idea: **connect your LeetCode and Codeforces accounts so solved problems are detected automatically**, streaks, a weekly leaderboard, a contests calendar, Striver and NeetCode sheets mapped to LeetCode.

## What this tells us
**What is common to all of them:** they are DSA-only. Only Grind 75 turns time into a plan, and only at week level. None of them (that I could try) schedules days with a weekday and weekend split and a rest day, rebuilds when you fall behind, puts CS notes, a roadmap, behavioral questions and a job description in the same plan, or keeps the ticks in an account without a paywall.

**What is good and worth copying:** Grind 75's instant result with no signup, its "pick a smaller set that fits" behaviour, its per-question time estimates and shareable link; the Tech Interview Handbook's priorities and its advice to plan conservatively; NeetCode's order by dependency; TUF's focus mode; DailyDSAPrep's automatic solved detection.

**Where My plan can be better than all of them:** one plan for DSA, the four CS notes, a roadmap and behavioral questions; days with different weekday and weekend hours; a "rebuild from today" button; a plan that can start from a real job description (the Role Analyzer); ticks that follow the student; and honest numbers ("covers X of Y hours").

## Proposed changes to the My plan plan (for the owner to decide; none made yet)
1. **(Adopted on 13 Nov 2026 in this form: the form and its preview are open, generating the plan needs login.) Instant plan preview without login.** Like Grind 75, let anyone fill the form and see the plan; saving it asks them to log in. Also put the form settings in the address so a plan can be shared as a link. (Helps the first minute of use and search traffic; needs a public preview route and a public page.)
2. **When time is too short, pick a smaller set instead of cutting the tail.** Grind 75 picks fewer questions; our sheets include the Blind 75 inside the larger lists, so the plan can switch to the 75 core problems first and only then drop topics from the end. (Replaces the "drop the tail" rule in step 5 of the generator.)
3. **Plan at 85 percent of the stated hours.** The Tech Interview Handbook says to keep estimates conservative to avoid burning out; the plan fills 85 percent of each day and says so, so a bad day does not break it. (A fixed rule, not a switch.)
4. **Topic priorities for the big-tech preset.** High, Mid and Low for the DSA topics, written by us and shown to the student, so short plans do the High topics first. We have no source that counts how often a topic is asked, so the labels say "core" and "extra" and we make no frequency claim.
5. **Study order by dependency.** Use the order of our DSA roadmap (nine to thirteen steps in a sensible order) as the topic order, so a plan follows how the topics build on each other.
6. **Two study styles, one choice with a default.** "One topic at a time, then mix" (the default) or "mix from the start", following the three strategies in the handbook. One question in the form, no hidden options.
7. **A day view with a focus start.** From "Today", a "Start" button opens the first item and a simple timer (TUF has a focus mode). Optional later: record the minutes actually spent to improve the estimates.
8. **"On track" status.** A small line on the plan: "2 days behind" or "on track", with the rebuild button next to it. None of the products I tried says this.
9. **Do not do in v1:** automatic solved detection from LeetCode or Codeforces (DailyDSAPrep): it depends on their public interfaces and terms, and our sheets already let the student tick. Leaderboards and contests: not part of a personal plan.
10. **Per-problem time estimates later.** Grind 75 gives 15 to 45 minutes per question. Our sheets have only the difficulty, so v1 keeps the difficulty numbers; the minutes actually spent (item 7) are the data to improve them.

Sources: the pages I opened in the browser (techinterviewhandbook.org/grind75, techinterviewhandbook.org/coding-interview-study-plan, leetcode.com/studyplan, neetcode.io/roadmap, roadmap.sh/backend, takeuforward.org/prep-hub/strivers-a2z-dsa-sheet, dailydsaprep.vercel.app) and two web searches for the wider list.

---

# Planly (takeUforward), used end to end (13 Nov 2026, the owner logged in; I did the steps)

The owner logged in on the TUF tab; I used Planly from the Striver's A2Z sheet page. **I did not see the first wizard steps** (goal, role and subjects): the draft I opened was already at "Review your roadmap", showing "Role: -" and "Subjects: 1 selected". Everything below was done and seen on screen.

## The flow
1. **Review your roadmap.** "We've planned 192.7 hours of focused learning for you." The plan covers the whole A2Z sheet (496 items, "Est. 192h 42m"). "Already covered some topics? Remove them." Changing topics, problems, priorities or the learning path ("Customize your plan with TUFY") is **a Plus feature**.
2. **Setup weekly availability.** One number per **day of the week** (Monday to Sunday), default 5 hours on weekdays and 6 on weekends, with "+" and "-" and a copy-to-all-days icon. **Zero is allowed, so a rest day works** (Sunday at 0 changed "Est. days" from 41 to 48). The page shows the total ("37 hours for your weekly schedule") and a live "Est. days" (39 at the defaults; Monday 5 to 4 gave 41). **Maximum 6 hours a day on a free plan.** There is no deadline field: the finish date comes out of the hours.
3. **Finalise your plan.** A required plan name (60 characters), "When do you want to start?" (Today, Tomorrow, Custom), a **sprint preview** (Sprint 1 to 6, each sprint seven days, each day listing items with a minute estimate), then "Est days 39", "Est date of completion 21 Dec 2026", "Total hours 192h 42m", "Total sprints 6". Day totals are not filled to the hours: Day 1 "Est. 3h 21m" on a 5-hour Friday, then 4h 52m, 5h 54m, 5h, 5h, 4h 57m, 4h 53m (items are whole lessons of 8 to 43 minutes and are not split).
4. **Plan dashboard.** Plan name, started date, current sprint, a progress ring (0%), sprints 0/6, topics 0/496, **time spent against the estimate (0 min / 192h 42m)**, a sprint strip (Day 1 to Day 7), "Today's task" with each item's estimate, "Today's progress" (topics, time spent, last active, progress), "Est. completion on 21 Dec 2026". **Free: one active plan** ("Generate another plan" is greyed out). Menu: Pause plan, Rename, Delete permanently.
5. **Full plan page.** Tabs Current sprint, Upcoming, Completed; each day with **Time spent and Est. time** columns; a star on every item that puts it on a **Revision list**; "Take a break"; and a **"Review & Complete"** button on the sprint, whose tooltip says "Complete the sprint to unlock personalised notes and quizzes tailored to your progress".
6. **Study view** (opened by the blue arrow on "START DAY 1 - TASK 1"). "Planly by takeUforward", a **timer that starts by itself** (0:03, with a pause button), "Task 1 / 7" selector, the lesson (video and editorial with a contents list and read percentage), a discussion tab, a star, and a **"Completed" checkbox**. Ticking it stopped the timer (0:13).
7. **After completing one task.** Back on the plan: "Today's tasks" (6 left) and "Completed tasks" (Breaking The Myth: **13 sec actual against 8 min estimated**), the next task offered ("START DAY 1 - TASK 2"), Tasks 1/7, Time spent 13 sec, Progress 14%; the header went from 2 coins to **12 coins** and the streak from **0 to 1**.
8. **Review & Complete (sprint performance).** Time spent, Tasks (1 / 97), Days taken (1 / 7), Allocated time (33h 57m) with a "0.00x time efficiency", a **daily chart of actual against allocated time**, and a per-module line ("Fundamentals of Programming, 1/7 tasks, 1 completed task finished within the allocated time", "1 efficient", "0 fast first-correct"). Buttons: Cancel, Complete Sprint 1. (I cancelled.)
9. **Take a break.** "Taking a break! We'll hold your spot. Everything you've done stays saved. Come back whenever you're ready and we'll shift your plan around the break." After pausing: a "Paused" tag and "You've paused your plan. Resume to keep your progress going", the page shows overall progress, days completed (0 / 39), tasks completed (1 / 496), paused on, est. completion, "Resume plan".
10. **Adjust plan (only while paused).** "Adjust your weekly study availability. We'll recreate your roadmap around this", the same seven day counters, **"Preview my plan"**, which opens **"Preview adjusted plan"**: total sprints, weekly hours, est. completion, "What will change: Your completion date stays the same" (or earlier), "6 sprints affected: upcoming work is regrouped into seven-day sprints", **"Started work is protected: started and completed history stays unchanged"**, a line per sprint ("Rescheduled, 7 to 7 days"), then "Confirm Adjustment". (I did not confirm.)

## What I could not check
Missed days and how they are handled (it is the same day, so no day was missed); what a Plus plan changes; the first wizard steps (goal and subject choice); the revision list screen; the personalised notes and quizzes after a sprint review.

## Planly's limits that matter to us
- **A free plan cannot be deleted.** Hovering "Delete permanently" says: "Free Planly plans cannot be deleted. Upgrade to Plus to delete this plan." **The test plan I made on the owner's account ("Planner test", now paused, one task done) therefore cannot be removed without paying.** I did not pay and did not try. We need a free delete, and the delete-account flow must remove plans too.
- One active plan, six hours a day maximum, no edits to the content of a plan without Plus.
- Their plan is built from lessons with video lengths, not from problems; the item times are fixed lesson lengths.

## What this adds to the proposals
11. **A preview before any rebuild.** Planly's best idea: before a rebuild or availability change shows the result: the new finish date ("stays the same" or "N days earlier or later"), which days move, and that done work is protected. Our "Rebuild from today" and "change my hours" get the same preview, then a confirm. (Adopt.)
12. **Track the real time spent against the estimate**, with a timer in a "Start" view that stops when the item is ticked, and show "time spent / planned" per item, per day and overall. This is also the data to improve our estimates. (This replaces the optional item 7's "record minutes later": do it from the start.)
13. **A sprint review.** At the end of each week: planned against actual time, what was done, what moves, and an offer to rebuild. Planly ties it to personalised notes and quizzes; our version links the weak topics to the notes sections and quizzes we already have (and later to B7 quizzes).
14. **A revision list** (star an item to revise it later) as a simple saved list, linked to the weekly revision block.
15. **Pause and "adjust availability"** exist only behind a pause in Planly; ours lets the student change hours at any time, with the preview in item 11.
16. **Free delete and free multiple plans in the future.** Do not copy the paywalled delete; a deleted plan is gone, and the account deletion removes plans.
17. **Rewards:** coins and a streak (Planly). We already have a streak; coins are not planned.
18. **Do not copy:** items that are whole lessons which leave a day only 3h 21m full; our items are small problems and notes sections, so days can be filled closer to the hours (still keeping the 85 percent rule).
