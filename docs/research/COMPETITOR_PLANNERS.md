# Competitor planner comparison (My plan)

Started 15 Nov 2026. Purpose: compare the output of PrepStack's My plan with other free interview planners on the **same input**. Facts below were observed on the live pages; anything not seen is marked "not seen". Nothing here is copied from the competitors' content (problem names are listed only as facts about what they output).

## The common input (use it for every tool)

| Field | Value |
|---|---|
| Goal | Big-tech SDE interviews (DSA first, plus CS basics, system design, behavioral if the tool has them) |
| Sheet / list | NeetCode 150 where the tool lets you choose, otherwise its own list |
| Start date | Monday 16 Nov 2026 |
| Length | 8 weeks (56 days) |
| Hours | 3 h on weekdays, 5 h on weekend days, so **25 h a week**; Sunday off |

Where a tool cannot take a field the closest allowed value was used and is written down in the run log.

## 1. techinterview.org "Coding Interview Study Plan Generator"

- URL: https://www.techinterview.org/study-plan/ (page says "Updated June 30, 2026"). Run on 15 Nov 2026.
- Access: no signup. Cookie banner (analytics, Google AdSense ads): rejected.
- Inputs (3 only): hours per week slider (3 to 30, default 10), weeks until the interview slider (1 to 24, default 8), focus (Balanced, Coding only, Senior/staff).
- Output unit: **week by week**. No days, no dates, no start date, no rest day, no weekday/weekend split.
- Buttons: "Print / save", "Copy link to this plan". No checkboxes, no saved progress (nothing stored except a cookie consent flag and PostHog analytics keys in local storage).
- Problem links go to **leetcode.com**; each problem also links to a pattern page on techinterview.org.

### Run log (all on 15 Nov 2026)

| Run | Hours/wk | Weeks | Focus | Result summary |
|---|---|---|---|---|
| A (the common input) | 25 | 8 | Balanced | 63 problems over 8 weeks: 14 easy, 36 medium, 7 hard, 6 system design. "About 4.2 hrs/week of new problems." Week hours: 4.4, 4.6, 4.3, 4.8, 4.3, 4.3, 4.8, 2.0. Message: "You'll have spare time most weeks, use it to redo problems you struggled with and run a few mock interviews." |
| B | 25 | 8 | Coding only | 57 problems: 14 easy, 36 medium, 7 hard. About 3.5 hrs/week. Week hours: 3.5, 3.5, 3.5, 4, 3.6, 4, 3.7, 1.9. |
| C | 10 | 8 | Balanced | **Identical to run A**: 63 problems, same weeks. |
| D | 5 | 2 | Balanced | 23 problems over 2 weeks (9 easy, 12 medium, 2 hard). About 5.1 hrs/week (5.6 and 4.6): the plan is **larger than the 5 hours entered**, and no warning was seen. |
| E | 30 | 24 | Balanced | "63 problems over **21 weeks**" (asked for 24). About 1.6 hrs/week of new problems. |

### Run A in full (the common input), week by week

- Week 1 (~4.4 h): Two Sum, Valid Anagram, Contains Duplicate, Group Anagrams, Product of Array Except Self, Valid Parentheses, Min Stack, Daily Temperatures, Valid Palindrome, Two Sum II, 3Sum.
- Week 2 (~4.6 h): Container With Most Water, Trapping Rain Water, Best Time to Buy and Sell Stock, Longest Substring Without Repeating, Longest Repeating Character Replacement, Minimum Window Substring, Binary Search, Search in Rotated Sorted Array, Find Minimum in Rotated Sorted Array.
- Week 3 (~4.3 h): Koko Eating Bananas, Reverse Linked List, Merge Two Sorted Lists, Linked List Cycle, Remove Nth Node From End, LRU Cache, Invert Binary Tree, Maximum Depth of Binary Tree, Same Tree, Binary Tree Level Order Traversal, Validate BST.
- Week 4 (~4.8 h): LCA of a BST, Serialize and Deserialize Binary Tree, Implement Trie, Word Search II, Kth Largest Element, Find Median from Data Stream, Subsets, Combination Sum.
- Week 5 (~4.3 h): Permutations, Word Search, Number of Islands, Clone Graph, Course Schedule, Pacific Atlantic Water Flow, Word Ladder, Climbing Stairs.
- Week 6 (~4.3 h): House Robber, Coin Change, Longest Increasing Subsequence, Word Break, Edit Distance, Maximum Subarray, Jump Game, Merge Intervals.
- Week 7 (~4.8 h): Insert Interval, Non-overlapping Intervals, then system design: URL shortener, news feed, chat system, rate limiter.
- Week 8 (~2 h): system design: a RAG system, a key-value store.

### What it does / does not do (observed)

- Does: pattern order (arrays, stack, two pointers, sliding window, binary search, linked list, trees, tries, heap, backtracking, graphs, DP, greedy, intervals), mixes Easy/Medium/Hard, adds 6 system design topics (Balanced), free, no signup, link to share, print.
- Does not (not seen): days or dates; use of the hours beyond a small cap (25 h and 10 h gave the same plan, about 4 to 5 h a week of problems); revision or spaced repetition (only a sentence telling you to redo problems); reviews; behavioral questions; CS subjects (OS, DBMS, networks, OOP); saved progress; rescheduling when behind; pause; timezone; substitute a problem; pick a sheet; skip problems you already solved.
- Odd: the plan is the same 63-problem list at any hours (a fixed list, stretched or squeezed); hours entered below the plan's size are not respected (run D).

## 2. PracHub "Free Coding Interview Study Plan Generator"

- Article: https://prachub.com/resources/free-coding-interview-study-plan-generator-build-a-7-14-or-30-day-plan (dated August 28, 2026). Run on 15 Nov 2026.
- **The tool itself is hosted on a different address**: https://prachub-interview-tools.nianxiaoming.chatgpt.site/study-plan-generator/ (a chatgpt.site subdomain, not prachub.com). Page says "No signup, no network requests, inputs stay in this browser."
- Inputs: target company (text), target role (text, default Software Engineer), start date, window (7, 14 or 30 days only), focused minutes per day (one number, default 90), weakest topics (check up to 4 of 8: arrays and hashing, two pointers, trees, graphs, DP, debugging, communication, system design), confirmed interview rounds (online assessment, live coding, system design, behavioral).
- Output: a **dated table, one row per day**: Day, Date, Focus, Required output, Practice. Buttons: Copy Markdown, Download CSV, Print / save PDF. No checkboxes seen, no saved progress ("stores nothing").
- Test values used: company "Example Co" (made up), role Software Engineer, start 2026-11-16, 30 days (the longest allowed; the common input is 56 days, so it cannot be matched), 180 minutes a day (the 3 h weekday figure; it has no weekday/weekend split, no rest day), weak topics: arrays and hashing, trees, graphs, DP; rounds: live coding, system design, behavioral.

### The 30-day output (run on the values above)

- Header: target Example Co, Software Engineer; window 30 days; daily time 180 minutes; plan ends Tue, Dec 15.
- Every study day has the same time split: "18m recall, 99m timed work, 45m review/tests, 18m explain" (180 minutes).
- Day 1 Mon 16 Nov: Baseline and logistics (one unfamiliar timed problem, confirm language/platform/round rules, write two weaknesses).
- Days 2 to 14: arrays and hashing, trees and recursion, graphs and BFS/DFS, system design, dynamic programming, behavioral, two pointers and sliding window, intervals and sorting, debugging and testing, communication, then the weak topics again. Day 15 and Day 28: "Full simulation" (180 minutes, covering the chosen rounds). Day 30: "Repair and taper".
- **Every study day is one focused problem**, then "write adversarial tests, then redo the core pattern from memory".
- **The practice links repeat**: only 4 named problems appear in the whole 30 days (Find the Earliest Pair with a Target Sum; Reconstruct tree from inorder and postorder; Solve grid shortest path with BFS; Merge Overlapping Intervals) plus one system design item (Design a least-recently-used cache). The other days link to generic "Browse interview questions", "Browse coding and algorithm questions" or "Behavioral and leadership questions" pages. Days 2 to 4 repeat on Days 12 to 14 and again on Days 22 to 24.
- Ends with: "Adjustment rule: after each session, move any no-hint failure or weak-test pattern into the next two available review days. Your invitation and recruiter guidance override this plan." (advice text, not an automatic feature).
- A second run with 7 days and 60 minutes did not regenerate the table (the page kept the 30-day result). Not retried, so the 7-day output was **not seen**.

### What it does / does not do (observed)

- Does: dated daily rows, a fixed minute split for each day, simulation days, company/role fields, weak-topic emphasis, export to CSV, Markdown and print. Free, no signup, nothing stored.
- Does not (not seen): a real problem list (only 4 named problems in 30 days), a sheet (NeetCode, Striver and so on), problem difficulty, weekday/weekend hours, a rest day, more than 30 days, progress tracking, automatic revision (only a text rule), reschedule when behind, pause, timezone, substitute a problem, CS subjects.

## 3. Planly (takeuforward / TUF), to do by the owner

- Page: https://takeuforward.org/planly . Pricing page lists Planly inside paid plans (Basic 4,398 INR for 12 months, Core 6,298, Max 11,999, DSA PASS 2,999 for 12 months, Company PASS 1,424 for 2 months). Whether the free tier makes a plan: **not seen**.
- From the page text only: asks a few questions about goals, level, subjects and available time; lists "Personalised weekly sprints", "Solve & Practice", "Track your time", "Progress tracker", "Missed a Day/Task?".
- Fill in after the owner runs it with the common input:

| Question | Planly result |
|---|---|
| Which inputs did it ask? | |
| Can it take 25 h/week, 8 weeks, start 16 Nov, Sunday off? | |
| Week 1: problems, order, minutes per day | |
| Total problems and hours over 8 weeks | |
| Does it include CS notes, system design, behavioral? | |
| Reviews or revision: when, how many | |
| "Missed a Day/Task?": what exactly happens | |
| Can you pause, extend the deadline, change the hours later? Is there a preview before the change? | |
| Timezone or day-start setting | |
| Swap a problem (paywalled or dead link) | |
| Saved progress, login, cost (free tier or paid) | |
| Screenshots saved where | |

## 4. PrepStack My plan on the same input (owner to run; engineering numbers measured 15 Nov 2026)

Measured with the real generator on the real sheets (start Mon 16 Nov 2026, 8 weeks, 3 h weekdays, 5 h weekends, no rest day, NeetCode 150, subjects OS, DBMS, CN, OOP): **137 items = 111 DSA problems, 8 notes sections, 4 mocks, 14 behavioral; about 136 planned hours of new work; 63% of the 202-hour syllabus fits and the plan says so ("core does not fit")**. Rest day variants and other sheets were also generated (see the conversation notes). The owner should run the same input in the app and record:

| Question | PrepStack result |
|---|---|
| Week 1 problems, order, minutes per day | |
| Total problems and hours | |
| Reviews: first review dates after Day 1 | |
| What the app says when the syllabus does not fit | |
| Change preview (rebuild, hours, lighter days) | |
| Pause, resume, deadline extension | |
| Timezone and study-day start | |
| Substitute a problem | |
| Screenshots saved where | |

## Early comparison (only what was seen)

| Question | techinterview.org | PracHub tool | Planly | PrepStack My plan |
|---|---|---|---|---|
| Free, no signup | yes | yes | not seen | free; login to save |
| Saves progress | no | no | listed ("Progress tracker") | yes |
| Plan unit | week | day, dated | weekly sprints (page) | day, dated, with minutes |
| Uses hours entered | barely (25 h and 10 h gave the same plan; 5 h gave more than 5 h) | one number for all days | not seen | weekday and weekend hours, rest day, 85% budget |
| Real problem list | fixed 63 problems | 4 named problems repeated | not seen | NeetCode 150 and 4 other sheets |
| CS subjects | no | no | not seen | yes (OS, DBMS, CN, OOP, system design) |
| Revision / reviews | a sentence only | a text rule only | not seen | scheduled ladder by how you solved it |
| Behind / pause / change | no | no | "Missed a Day/Task?" (not seen) | rebuild, pause, resume, extend, each with preview |
| Export | print, link | CSV, Markdown, print | not seen | none |

## Open items

- Owner runs Planly and PrepStack with the common input and fills sections 3 and 4.
- Not done: LeetCode study plans, NeetCode (free tier has lists and progress, no plan), AlgoMonster (no tool seen), AlgoCademy and Solvi (seen only in search snippets).
- Ideas that came from this look (owner decides): export the plan to a file or calendar; Easy-to-Hard mixing is already done; a "plan is larger than your hours" warning is already done by the generator (core-does-not-fit notice).

## 3a. Planly: what was seen without logging in (15 Nov 2026, built-in browser, not logged in)

- Entry page https://takeuforward.org/planly shows "59.7K+ plans created with Planly" (their own claim, not checked) and the first question inline. The wizard runs at https://takeuforward.org/planly/draft with a progress bar of several steps, "Prev" / "Next", "Discard my plan", and a note "Draft saved locally".
- **Questions seen, in order (4 before the halfway page):**
  1. Which role are you preparing for? (SDE Intern, Software Engineer)
  2. How much experience do you have? (0 - 2 years, 2 - 5 years, 5+ years)
  3. What kind of companies are you mainly targeting? (Startups, FAANG, All Product Based Companies, Open to all)
  4. Which region's companies are you preparing for? (India, US/Europe/Others)
  - Then a "You're halfway there!" summary (Role, Experience, Targets, Company region) with "Let's continue".
- Answers used: Software Engineer, 0 - 2 years, FAANG, India. These are test choices; no personal data was entered.
- **Login wall:** pressing "Let's continue" opens "Save your goals and build your plan: Log in or sign up to save your selections and create your personalised study plan." with "Skip for now" and "Get started". "Skip for now" returns to the halfway page; pressing "Let's continue" again shows the same prompt. So the plan, and the second half of the questions (which presumably ask about subjects and available time), were **not reachable without an account**. Nothing was entered for login or sign-up.
- Not seen yet: the second-half questions (hours, deadline, start date, subjects), the generated plan, the "Missed a Day/Task?" screen, any pause or change settings, and what the free tier gives.
- Note for comparison: Planly's first four questions are about the person (role, experience, company type, region), not about time or deadline. PrepStack asks about the goal, weeks, hours, rest day, study style, sheet and subjects up front, and shows a public preview before login.

## 3b. Planly: after the owner logged in (15 Nov 2026, built-in browser)

- The owner's account already had one plan named "Planner test" (made by the owner; not made by Claude). Nothing was created or changed by Claude after login.
- **Free limit, as shown on screen:** the Planly home says "You've used your one free Planly plan. Upgrade to Plus to create another plan." The plan card says "Your 2 free days have ended. Upgrade to Plus to continue this plan from where you left off. Your progress is saved." Opening the plan shows a full-screen "Your 2 free days have ended" box with a "Plus" button over the plan. So **free = one plan and about 2 days of it; the rest needs the paid Plus plan.** Claude did not click Upgrade and did not work around the box.
- **What is visible behind the box (page text only):** the plan page lists "Sprint 1, 0/7 days completed", a "Review & Complete" button for the sprint, tabs for the current and upcoming sprints, then days: "Day 1 - 13th Nov (Friday), 7 tasks" marked Today, and Day 2 to Day 7 (14 to 19 Nov) marked Upcoming. So the plan is cut into **weekly sprints of 7 days**, starting on the day it was made (a Friday), with no rest day visible, and Day 1 had 7 tasks. The tasks themselves were not read (they are behind the paywall box).
- Planly home also shows a "+1 Daily Check in" button (a coin reward) and tabs "Active" and "Completed" for plans. The plan card has a "⋮" menu (not opened, blocked by the box).
- **Not seen because of the paywall:** the task names, minutes, the second half of the questions (hours, deadline, subjects), "Missed a Day/Task?", pause, deadline change, reviews or revision, and how the sprint review works.

## Planly: comparison facts so far

| Question | Planly (seen) |
|---|---|
| Access | login needed to build; one free plan, about 2 days; then paid (Plus) |
| Plan shape | weekly sprints of 7 days, daily rows, starts the day you make it |
| Day 1 size | 7 tasks (time not seen) |
| Questions up front | role, experience, company type, region (hours and deadline not seen) |
| Daily reward | "+1 Daily Check in" (coins) |
| Rest of the plan | locked behind Plus after 2 days |

## 3c. Planly: the owner's existing plan, checked 15 Nov 2026 (read only)

- The plan "Planner test" (7-day Sprint 1, Day 1 = Fri 13 Nov) is locked: a full-screen "Your 2 free days have ended" box has no close button, only a Plus button. Claude did not remove it or try other addresses to get around it.
- The TUF dashboard (https://takeuforward.org/dashboard, opened by the owner) shows **"Today's Task: Programming and What Are Computers?" with a lock and "Your access to Planly has ended."** So the locked task for a plan answered as Software Engineer, 0 to 2 years, FAANG, India starts with a beginner lesson, not a problem. This is one task on one plan; the rest of the plan is unseen.
- Dashboard numbers seen (their content size, not a plan detail): DSA progress 0/1468 (Basic 292, Core 850, Pro 313); subject-wise: DSA 1/1096, System Design 0/104, Core Subjects 0/966, Data Engineering 0/324. Popular topics shown: Striver's 180 (179 topics, 65 hrs), Striver's A2Z DSA Sheet (495 topics, 132 hrs), a Low Level Design course (72 topics).
- Still unseen (needs Plus): every task name and its minutes, the "7 tasks" of Day 1, any rest day, reviews, "Missed a Day/Task?", pause, deadline and hours settings.

## 3d. Planly: full wizard run with the common input (15 Nov 2026, second account, built-in browser)

Claude filled the form on the owner's second, logged-in account. Test choices only; no personal data. Everything below was seen on screen.

### Questions in order (6 steps, progress bar at the top, "Draft saved" shown)

1. **Role:** SDE Intern, Software Engineer. Chose Software Engineer. (If SDE Intern is chosen, the experience question is skipped: a first wrong click showed this.)
2. **Experience:** 0 - 2 years, 2 - 5 years, 5+ years. Chose 0 - 2 years.
3. **Companies:** Startups, FAANG, All Product Based Companies, Open to all. Chose FAANG.
4. **Region:** India, US/Europe/Others. Chose India. Then a "You're halfway there!" summary.
5. **Recommended subjects:** DSA and OOPs pre-selected as "Recommended" for this goal; extra: DBMS, Operating Systems, Computer Networks, LLD. Added DBMS, OS and CN. A note says: "We don't currently cover HLD; we plan to add it within the next 6-12 months." (TUF has no high-level system design; it offers LLD only.)
6. **Level per subject:** DSA: Start from zero / DSA Foundations / Pattern Mastery ("master problem-solving over 1-2 months") / Quick Revision ("I have 15-20 days"). Chose Pattern Mastery. OOPs: Learn from Fundamentals / Interview Preparation. DBMS, OS, CN: Learn in Depth / Interview Preparation. Chose Interview Preparation for all four.
7. **Review your personalized roadmap:** buttons "Remove solved", "Version history", "Ask Tufy" (an AI helper). Text: "We've planned 179.4 hours of focused learning for you." DSA 65h 38m, OOPS 16h 33m, DBMS 57h 20m, Operating Systems 15h 35m, Computer Networks 24h 16m. DSA topics and hours: Arrays 5h 8m, Hashing 2h 4m, Binary Search 4h 52m, Sliding Window and Two Pointers 2h 57m, Recursion and Backtracking 3h 18m, Linked List 5h 47m, Stack and Queues 4h 47m, Greedy 2h 13m, Heaps 2h 19m, Binary Trees 3h 36m, Binary Search Trees 2h, Graphs 12h 29m, Dynamic Programming 8h 17m, Tries 2h 1m, Strings 1h 45m, Bit Manipulation 1h 47m, Mathematics 18 min. Each topic and each item has a remove (trash) button; the page held 666 removable entries across the five subjects. Item names include Striver-style problems (Majority Element, Kadane's Algorithm, 3 Sum, Next Permutation, Trapping Rainwater, Count Inversions) and OS/CN topics.
8. **Weekly availability:** one counter per weekday (hours), default 4 each = 28 h a week, with "Est. days: 45". Banner: "You can finish earlier by adding more hours on any day." and **"Free plans with these subjects allow up to 4 hours a day. Upgrade to Plus for more."** Set Mon to Fri = 3, Sat = 4, Sun = 4 (the cap is 4, so the common input of 5 h on weekends was not possible) = 23 h a week; the estimate changed to **55 days**. There is no start-date field and no rest-day field (a rest day is a day set to 0 hours; not tried).
9. **Finalise your plan, "Your sprint preview":** 9 sprints. Buttons "Sprint 1" to "Sprint 9", then "Name my plan".

### The schedule preview (9 sprints, about 60 days of days listed)

| Sprint | Subjects | Estimated | Days listed |
|---|---|---|---|
| 1 | DSA + OOPS | 21h 11m | 7 |
| 2 | DSA + OOPS | 20h 43m | 7 |
| 3 | DSA + OOPS | 22h 6m | 7 |
| 4 | DSA + Operating System | 21h 14m | 7 |
| 5 | DSA + Operating System | 12h 32m | 4 |
| 6 | Computer Networks + DBMS | 19h 15m | 7 |
| 7 | Computer Networks + DBMS | 22h 21m | 7 |
| 8 | Computer Networks + DBMS | 21h 41m | 7 |
| 9 | DBMS | 18h 19m | 7 |

- The sprint hours add up to the 179.4 h of the roadmap. The days listed add up to about 60, while the earlier estimate said 55 days. (Not explained on the page.)
- Sprint 1 Day 1: 3h 45m; Day 2 2h 42m; Day 3 2h 41m; Day 4 2h 56m; Day 5 2h 57m; Day 6 2h 52m; Day 7 3h 18m. Day 1 lists 9 items: Majority Element-I 17 min, Kadane's Algorithm 19, Majority Element-II 25, Maximum Product Subarray 18, Sort an array of 0's 1's and 2's 24, 3 Sum 37, Next Permutation 26, 4 Sum 27, Merge two sorted arrays without extra space 32 (sum 225 min = 3h 45m). So the per-item minutes are **17 to 37 minutes**, much lower than PrepStack's Easy 40 / Medium 70 / Hard 120, and the day is filled to the hour limit.
- Order is by subject blocks: DSA with OOPs for 3 sprints, DSA with OS, then CN with DBMS, DBMS last. DSA topics come in the order of the roadmap list above (arrays, hashing, binary search, ...). The sprint view shows **no rest day, no review items and no mock/behavioral items** in what was read (only the first sprint's Day 1 items were opened).
- Sprints are 7 days, starting the day the plan is made (the first plan's Day 1 was a Friday). One sprint (Sprint 5) is only 4 days long.


## 3e. Planly: the saved plan and its screens (15 Nov 2026, second account)

- **Plan details step:** Total sprints 9, Subjects 5, Study hours 179h 22m, Est. duration 60 days, Est. completion 14 Jan 2027 (after choosing the start). Plan name (up to 60 characters, required). Start: Today / Tomorrow / Custom date. "Today" was disabled with the text "There isn't enough time left today for your allocated study hours. Choose tomorrow or a later date, we'll adjust your roadmap from there." Chose Tomorrow = Mon 16 Nov 2026. Button "Generate plan".
- **After generating:** the Planly home says "You've used your one free Planly plan. Upgrade to Plus to create another plan." The card shows "Scheduled: 16 Nov 2026, Upcoming, Starts tomorrow". Card menu: **Rename, Delete permanently** only.
- **Plan page (/planly/prepstack-comparison):** "PROGRESS 0%, 0 / 9 sprints completed", banner "Starts tomorrow", tabs Current Sprint / Upcoming / Completed, "Sprint 1, 0/7 days completed" with Day 1 (Mon 16 Nov) to Day 7 (Sun 22 Nov). Text: "Browse your schedule now. Task timers and progress tracking become available when your plan starts." Pressing a task action before the start shows "Study actions are blocked for this plan." Each task row has an estimate ("Est. 27 min"), a star icon and an open arrow.
- **Plan actions menu (three dots):** View progress, **Revision list (0)**, **Adjust plan**, Rename plan, All plans.
- **Adjust plan:** a dialog "Adjust your weekly study availability. Tell us how much time you can give each day. We'll recreate your roadmap around this." Banner: "Preview to see your updated schedule. More hours may bring your finish date earlier or leave it unchanged." Seven day counters (current 3,3,3,3,3,4,4), a copy-to-all-days icon next to Monday, buttons Cancel and **Preview my plan**. Nothing was changed. **No deadline change, pause, rest day or skip option was seen in this dialog or the menu.** Hours-only changes do come with a preview.
- **Day contents seen (the plan re-fitted to the Monday start):**
  - Day 1, Mon 16 Nov: 7 topics, 2h 46m. Majority Element-I 17m, Kadane's Algorithm 19m, Majority Element-II 25m, Maximum Product Subarray 18m, Sort an array of 0's 1's and 2's 24m, 3 Sum 37m, Next Permutation 26m (166 min of the 180 min limit = 92%).
  - Day 2, Tue 17 Nov: 6 topics, 2h 39m. 4 Sum 27m, Merge two sorted arrays without extra space 32m, Trapping Rainwater 29m, Count Inversions 23m, Reverse Pairs 31m, Two Sum 17m (159 min = 88%). Two Sum, an easy problem, comes after 4 Sum and Trapping Rainwater.
  - Days 3 to 7: not opened (the day sheet stayed on Day 2 when other days were pressed).
- **Preview vs saved plan:** in the preview step Sprint 1 Day 1 was 3h 45m with 9 items (it assumed a start today, a Sunday with 4 h). After choosing Monday the saved Day 1 is 2h 46m with 7 items. The availability step said "Est. days 55", the details step said 60 days, and the completion date is 14 Jan 2027 (60 days from 16 Nov).

## 4a. PrepStack numbers on a like-for-like input (measured 15 Nov 2026, real generator, real sheets)

- Input: start Mon 16 Nov 2026, 9 weeks, 3 h Mon to Fri, 4 h Sat and Sun (23 h a week, the same as the Planly run), no rest day, Striver SDE sheet, OS, DBMS, CN, OOP notes. Result: 135 items; syllabus 15,769 minutes (263 h), planned 7,423 minutes (124 h). Days 1 to 3: Day 1 Pascal's Triangle 40 + Set Matrix Zeros 70; Day 2 Stock Buy and Sell 40 + Next Permutation 70; Day 3 Introduction and System Call 35 + Kadane's Algorithm 70.
- PrepStack time per problem (decision 29 in the plan file): Basic 30, Easy 40, Medium 70, Hard 120. Per sheet at those numbers: Blind 75 = 75 problems, 83 h (66 min each); NeetCode 150 = 179 h (72 min); Striver SDE = 193 problems, 242 h (75 min); Striver A2Z = 446 problems, 527 h; Love Babbar = 450 problems, 523 h.
- Planly per problem (same problems): Next Permutation 26 min against PrepStack's 70; Kadane's Algorithm 19 against 70 (a Medium). Planly planned its whole DSA part (17 topics) in 65h 38m. So Planly's estimate per problem is roughly **one third to two fifths of PrepStack's**. Neither number has been tested against real students; the basis of Planly's minutes was not stated.
- Day size: Planly puts 6 to 7 problems in a 3 h day; PrepStack puts 2 to 3 (70% new work, 15% reviews, 15% free).

## 5. Patterns and small things (Planly vs PrepStack My plan)

1. **Opposite planning models.** Planly: pick levels, get the whole course (179.4 h), the finish date is the output (55 then 60 days). PrepStack: pick a deadline (weeks), the content is fitted, what does not fit is shown as "core does not fit". Planly is friendlier to a beginner; PrepStack is safer for a fixed interview date.
2. **Per-subject levels.** Planly asks a depth level per subject (DSA: Start from zero, Foundations, Pattern Mastery, Quick Revision; OOPs, DBMS, OS, CN: Learn in Depth or Interview Preparation). PrepStack has no per-subject depth (only known topics, style and which subjects).
3. **Content is theirs.** Planly's DSA plan is TUF's own Striver course; PrepStack links to LeetCode/GFG for the problems and has its own notes for CS subjects.
4. **No high-level system design at TUF** ("We don't currently cover HLD; we plan to add it within the next 6-12 months", LLD only). PrepStack has 23 system design sections (11 concepts, 12 cases).
5. **Free limits.** Planly free: one plan, up to 4 h a day, a plan locks after 2 free days. PrepStack: fully free.
6. **No rest day, Sunday studied by default**, 7-day sprints starting the day of the plan (one sprint was 4 days). PrepStack has a rest day, an 85% budget and Monday-based weeks.
7. **No reviews seen.** "Revision list" is a list of starred tasks (the star icon on each task), not a schedule. PrepStack schedules reviews by how you solved a problem.
8. **No mocks or behavioral items** seen in Sprint 1; PrepStack adds mocks from week 4 and behavioral questions in the last two weeks.
9. **Change tools.** Planly: hours only (with a preview), rename, delete; "Missed a Day/Task?" is listed on the landing page but could not be reached (plan not started). PrepStack: rebuild, hours, lighter days, pause and resume, deadline extension, review catch-up, study calendar, substitute problem, each with a preview.
10. **Planly extras PrepStack lacks:** task timers ("Track your time"), a coin check-in reward, an AI helper ("Ask Tufy"), "Remove solved" and removing any topic or item before generating, "Version history" of the roadmap review, a per-task estimate, a star per task, a Today/Tomorrow/Custom start choice and a copy-hours-to-all-days button.
11. **Preview mismatch.** Planly's preview (3h 45m, 9 items on Day 1) differs from the saved Day 1 (2h 46m, 7 items) because the start changed; the length estimate went 45, 55, 60 days. PrepStack's preview week and saved plan come from the same code.
12. **Topic order.** Planly DSA order: Arrays, Hashing, Binary Search, Sliding Window and Two Pointers, Recursion and Backtracking, Linked List, Stack and Queues, Greedy, Heaps, Binary Trees, BSTs, Graphs, DP, Tries, Strings, Bit Manipulation, Mathematics (Strings and Mathematics last). Within a day it follows Striver's list order (easy problems can come after hard ones).
13. **Subject blocks.** Planly runs DSA with OOPs, then DSA with OS, then CN with DBMS, then DBMS alone. DBMS "Interview Preparation" is 57h 20m, larger than OOPs, OS and CN combined (56h 24m); not explained on the page.
14. **Claims.** The Planly landing page said "59.7K+ plans created" on one load and "58.7K+" on a later load (their own number, not checked).
15. **Account state.** The first account's plan was created on 13 Nov and locked after 2 days. The second account's plan shows "Starts tomorrow", so the 2-day clock probably starts when the plan starts (inferred, not seen).

## 6. Ideas that follow from this (owner decides)

- Per-subject depth level in the builder (a short "start from zero / interview recap" choice).
- Check the time per problem against real students: ask pilot students to log the actual minutes for about 20 problems each, then adjust the 40/70/120 numbers. Planly's are about 2.5 to 3 times lower.
- Export the plan to a file or calendar (PracHub offers it).
- "Missed a Day/Task?" on Planly could not be tested; check it from a plan that has started (needs Plus, or a plan that began before its free days ended).


## 7. Behaviour log: every behaviour seen, tool by tool (15 Nov 2026)

"Seen" means it happened on screen during these runs. "Inferred" means it was concluded from other things seen, not tested directly. Nothing here was tested beyond what is written.

### 7.1 techinterview.org generator

1. Opens with no signup; a cookie banner (analytics and Google AdSense ads) appears with Reject and Accept. Reject was pressed; the page kept working and stored a consent flag and PostHog analytics keys in local storage.
2. Two sliders and one dropdown: hours per week (min 3, max 30, step 1, default 10), weeks until the interview (min 1, max 24, step 1, default 8), focus (balanced, coding, senior).
3. Pressing "Build my plan" shows the plan on the same page at once, no loading step and no page change. Running it again replaces the plan.
4. The summary line gives the count of problems, the split easy/medium/hard/system design, and "about X hrs/week of new problems". When the plan is lighter than your hours it adds "You'll have spare time most weeks..."; that sentence was missing at 5 h and 2 weeks.
5. The plan is a fixed list stretched or squeezed over the weeks: 25 h and 10 h a week gave the same 63 problems; 57 problems with focus "coding"; 23 problems for 2 weeks.
6. Asking for 24 weeks returned "21 weeks" (it dropped the last empty weeks); weekly load fell to about 1.6 h.
7. At 5 h a week for 2 weeks it planned 5.6 h and 4.6 h, more than the hours entered; no warning appeared.
8. Each problem is a link to leetcode.com, plus a pattern link to a techinterview.org page. Difficulty tags EASY / MEDIUM / HARD / SYS DESIGN.
9. No checkboxes, no progress, nothing saved; only "Print / save" and "Copy link to this plan" buttons.
10. The last week is shorter (about 2 h) because only the remaining problems are placed.
11. Order of patterns is fixed: Arrays and Hashing, Stack, Two Pointers, Sliding Window, Binary Search, Linked List, Trees, Tries, Heap, Backtracking, Graphs, DP, Greedy, Intervals, then system design (balanced focus). Easy problems come first inside a pattern.

### 7.2 PracHub generator

1. The article page on prachub.com has a "Use the free interactive generator" section; the tool opens at a different address (`prachub-interview-tools.nianxiaoming.chatgpt.site`), not on prachub.com. A banner says "No signup, no network requests, inputs stay in this browser".
2. Form fields: company (text), role (text, default Software Engineer), start date (default today), window (7, 14 or 30 days), minutes per day (default 90), weak topics (check up to four of eight), confirmed rounds (four checkboxes).
3. "Generate my dated plan" fills a table on the same page without loading. The header repeats target, window, daily time and the end date.
4. One row per day with date, a focus, a required output and one practice link. Every study day has the same time split of the daily minutes (18m recall, 99m timed work, 45m review/tests, 18m explain at 180 minutes).
5. The plan uses calendar days with no rest day, and the window cannot go past 30 days.
6. Day 1 is a baseline day and day 30 is "Repair and taper"; days 15 and 28 are "Full simulation" at the full daily time. The cycle of topics repeats every 10 days, so the same problem links return (4 named problems in 30 days; other days link to generic browse pages).
7. Weak topics change the order and focus, not the amount of work. Choosing system design or behavioral rounds adds days for them.
8. Ends with an "Adjustment rule" text (move a failed problem into the next two review days); it is advice, nothing moves by itself.
9. Buttons: Copy Markdown, Download CSV, Print / save PDF. Nothing is saved or tracked.
10. A second run (7 days, 60 minutes, topics and rounds unchecked) did not replace the table (the page still showed the 30-day plan), so the 7-day plan was not seen. Cause not known.

### 7.3 Planly (TUF)

Entry and login
1. The landing page at /planly shows a headline, "59.7K+ plans created" (a later load showed "58.7K+"), the first four questions as a preview, and "Create my plan, takes less than 3 minutes".
2. Pressing "Create my plan" opens a full-screen wizard at /planly/draft; later steps appear in the address as step=1 to step=6 and view=preview or view=details.
3. Logged out, the first four questions work. Pressing "Let's continue" on the halfway page opens a login box ("Save your goals and build your plan"). "Skip for now" only closes the box; pressing continue again shows it again. The plan cannot be built logged out.
4. The page keeps a draft ("Draft saving..." then "Draft saved") and offers "Discard my plan". The first draft was still there when the account changed.
5. A logged-in new account sees the same landing page; an account that already has a plan sees "Know what to study every day and readjust as you go", a "Generate my plan" button, and Active / Completed tabs with the plan card.

Wizard rules
6. Next is disabled until an answer is chosen on each question. Prev goes back; the earlier answers stay selected.
7. Choosing "SDE Intern" skips the experience question. "Software Engineer" adds it.
8. The subjects step pre-selects subjects marked "Recommended" for the goal (DSA, OOPs); other subjects appear as "+ DBMS", "+ Operating Systems", "+ Computer Networks", "+ LLD". Clicking one moves it into the selected list and shifts the page; clicks aimed at the old position missed (so clicking several in a row needs a pause).
9. LLD shows a note "Basic system design may come up" and "We don't currently cover HLD; we plan to add it within the next 6-12 months".
10. The level step is an accordion per subject; each needs one choice before Next turns on. DSA has four levels, the other subjects two.
11. A mascot ("Tufy") appears between steps with a typed message ("Locked in! Levels locked. Here's a roadmap built around..."), which takes a few seconds before the next page content shows.
12. The roadmap review step lists subjects with hours; each subject expands to topics (with hours) and items. Every topic and item has a remove button; items are removed one by one (666 removable entries across five subjects). Buttons: "Remove solved", "Version history", "Ask Tufy".
13. The availability step has a counter per weekday with minus and plus buttons. The default is 4 hours each day (28 h a week) and the page says "Est. days: 45". Plus is disabled at 4 hours with the tooltip "Free plans allow up to 4 hours a day. Upgrade to Plus for more." Lowering Monday to Friday to 3 changed the estimate to 55 days and the total to 23 h.
14. The schedule step ("Your sprint preview") shows tabs Sprint 1 to Sprint 9, each with the subjects for that sprint, the sprint's estimated hours and the days with their hours. Only the first day's items open in the preview.
15. The plan details step shows totals (sprints, subjects, hours, estimated duration and completion). The completion date shows a dash until a start is chosen. The plan name must be filled in (counter x/60); "Generate plan" stays disabled until then.
16. Start choices: Today, Tomorrow, Custom date. "Today" is disabled when today has too little time left, with a message that the roadmap will be adjusted from the chosen date. Choosing Tomorrow set "Start date: 16 Nov 2026" and the completion date 14 Jan 2027.

After generating
17. Generating returns to the Planly home. The card shows the name, "Scheduled: 16 Nov 2026, Upcoming" and "Starts tomorrow". The home now says "You've used your one free Planly plan. Upgrade to Plus to create another plan." The "Generate my plan" button stays visible.
18. Clicking the plan card did not open it; opening the plan needed its address (/planly/<name-in-lowercase-with-dashes>) or the menu. (Inferred: the card is not a link until the plan starts.)
19. The plan page shows 0% progress, "0 / 9 sprints completed", a "Starts tomorrow" banner, Sprint 1 with seven dated days (Mon 16 to Sun 22 Nov), and tabs Current Sprint, Upcoming, Completed.
20. Day 1 opens in a bottom sheet showing "Day 1, schedule preview", the number of topics and the planned time; pressing another day while the sheet is open kept showing Day 2 (the sheet must be closed first). A message says task timers and progress tracking start when the plan starts. Pressing a task action shows the toast "Study actions are blocked for this plan."
21. Each task row shows an estimate, a star and an arrow. The star feeds "Revision list (n)".
22. The three-dot menu on the plan page: View progress, Revision list (0), Adjust plan, Rename plan, All plans. The menu on the home card: Rename, Delete permanently.
23. "Adjust plan" opens a dialog to change weekly hours only, with a copy-to-all-days icon, "Cancel" and "Preview my plan". The text says more hours may bring the finish date earlier or leave it unchanged.
24. The saved plan's Day 1 (2h 46m, 7 items) differs from the preview's Day 1 (3h 45m, 9 items) because the start moved from a Sunday to a Monday and the days were re-fitted. Estimated days went 45, 55, 60 along the wizard.
25. Per-day fill is high: Day 1 used 166 of 180 minutes (92%), Day 2 159 of 180 (88%); no reviews, rest day, mock or behavioral item was visible in Sprint 1.
26. Easy problems can follow harder ones (Two Sum after Trapping Rainwater on Day 2) because the order follows Striver's list.

Free limit behaviour
27. First account: the plan page and card show "Your 2 free days have ended. Upgrade to Plus to continue this plan from where you left off. Your progress is saved." A full-screen box with only a Plus button covers the plan; "Today's Task" on the TUF dashboard is locked ("Your access to Planly has ended"). The box has no close button.
28. Second account: after generating, the home says the one free plan is used; the free days probably start when the plan starts (inferred).
29. The dashboard of TUF shows DSA progress 0/1468 (Basic 292, Core 850, Pro 313) and subject progress for DSA, System Design, Core Subjects and Data Engineering; a "Daily Check in" with a coin count; and a "Plus" button.

Not seen (could not be reached)
30. "Missed a Day/Task?", task timers, the progress screen, the revision list, what a started day looks like, pause, deadline change and the Plus screens.

### 7.4 PrepStack My plan (seen during the manual run on 15 Nov 2026)

1. Public /my-plan opens with defaults (placements, 12 weeks, start today, 3 h weekdays, 5 h weekends, rest day Sunday, one topic at a time, Blind 75, four CS subjects) and shows the numbers and week 1 at once.
2. Bug found and fixed: on a Sunday start with Sunday as the rest day the preview said "No tasks fit in this calendar week"; now it shows the first week that has tasks. The Plan tab started at "Week 2" for the same reason; now it counts from the first week with tasks.
3. Sign-up page had invented claims ("Join thousands of students", a student quote); removed.
4. Generating a plan while logged in saves it; the page then shows "You already have a plan", links to view the saved plan or open the daily plan, and a checkbox to keep the old plan as history and replace it.
5. /my-plan/study opens on Today: date, task count and time ("Mon, 16 Nov: 3 tasks, 2 h"), one Start button, the list of tasks with minutes. Nothing else is on the screen (tabs Plan, Reviews, Starred, History sit above).
6. Start opens the first task (title, a link to the coding problem in a new tab, "Can't access this problem?" for substitutes, and three results: Solved alone, With hints, Needed the solution). Choosing a result returns to Today with that task removed and the time reduced (3 tasks 2 h to 2 tasks 1 h 20 min).
7. The Plan tab shows the study calendar and day start (Asia/Kolkata, 0:00 by default), buttons Study day settings and Pause plan, the progress text ("1 of 121 tasks complete, 40 min completed", the dates, "On track"), actions (Rebuild from today, Change hours, Lighter days, Add a task, Build another plan, Delete current plan) and the weeks.
8. On a phone width the Today screen keeps the same single-button layout.
9. In earlier runs (server tests and browser specs): every change shows a preview and needs a checksum; pause and resume move the whole calendar; one active plan and one paused plan; a substitute never marks the original solved; a split problem ticks its sheet only when its last part is done; reviews are due by how the problem was solved; deadlines can be extended by a rebuild or on resume.


## 8. PrepStack My plan: the same input in the app (15 Nov 2026, local test account, built-in browser)

Input (as close to the Planly run as the form allows): goal Big-tech SDE, start Mon 16 Nov 2026, 9 weeks, 3 h Mon to Fri, 4 h Sat and Sun (23 h a week), no rest day, study style "one topic at a time", sheet Striver SDE, subjects OS, DBMS, CN, OOP. The builder settings were opened through its settings link, then "Generate my plan" was pressed on a fresh account.

### 8.1 Output (public preview and saved plan agree)

- Preview card: "123.7 h of 262.8 h of your syllabus fits before 17 Jan 2027. Estimated finish: 17 Jan 2027." and "119 syllabus items (139.1 h) could not fit. Core topics come first; add time or choose a smaller syllabus."
- Saved plan: 135 items (103 DSA problems, 12 notes sections, 6 mock interviews, 14 behavioral questions), 135.1 h, 63 days (16 Nov 2026 to 17 Jan 2027), at most 4 items and 204 minutes on any day, 14.0 to 16.3 hours of tasks per week (of 23 h available; reviews are extra and are scheduled later). Notices: planned-85, core-first, core-does-not-fit.
- DSA: 103 problems = 29 Easy, 57 Medium, 17 Hard; 116.7 h. **Topics placed: Arrays (4 parts), Binary Search, Linked List (3 parts), Stack and Queue (2), Binary Tree (3), Binary Search Tree (2), Graph - I (one part).** In the sheet order. **Not placed at all: Dynamic Programming, Greedy, Heaps, Strings, Tries, Recursion and Backtracking, Graph beyond part I.** (90 DSA problems left out.)
- CS notes asked for four subjects: **OS 11 of 11 sections placed (6.5 h); DBMS 1 of 10 (Introduction, on 16 Jan); CN 0 of 10; OOP 0 of 10.** 29 of 40 sections were left out ("no-room" reason for 89 left-out items, "extra" for 30).
- Day 1 to Day 7 (week 1): Mon Pascal's Triangle 40 + Set Matrix Zeros 70 (110 min); Tue Stock Buy and Sell 40 + Next Permutation 70 (110); Wed Introduction and System Calls 35 + Kadane's Algorithm 70 (105); Thu Majority Element 40 + Sort 0s 1s 2s 70 (110); Fri 2-Sum 40 + Rotate Matrix 70 (110); Sat Merge Overlapping Subintervals 70 + Find the Duplicate 70 (140); Sun Processes 35 + Merge Two Sorted Arrays Without Extra Space 120 (155). Week 1 = 14.0 h. The first week is Arrays only, plus two OS notes.
- Today (Mon 16 Nov, before starting): "Mon, 16 Nov: 2 tasks, 1 h 50 min", one Start button, the two tasks with minutes.
- Mock interviews start in week 4 on Saturdays (90 minutes), one per week afterwards; behavioral questions (10 minutes each) in the last two weeks.

### 8.2 Other lengths, same input (generator run, not in the UI)

| Weeks | Items | CS sections placed | Left out | DSA topics placed |
|---|---|---|---|---|
| 9, one topic at a time (the run above) | 135 | OS 11, DBMS 1 | DSA 90, DBMS 9, CN 10, OOP 10 | 8: Arrays, Binary Search, Linked List, Stack and Queue, Binary Tree, BST, Graph |
| 9, "mix topics from the start" | 144 | OS 11, DBMS 10, CN 5 | DSA 97, CN 5, OOP 10 | 7: Arrays, Linked List, Binary Search, Stack and Queue, Binary Tree, BST |
| 16, one topic at a time | 233 | OS 11, DBMS 10, CN 10, OOP 6 | DSA 30, OOP 4 | 13, adds Greedy, Heaps, Trie, Recursion and Backtracking, Dynamic Programming |
| 26, one topic at a time | 278 | all 40 | none | 16 |

### 8.3 UI observations (PrepStack)

Builder and preview
1. The preview card leads with the number that matters ("123.7 h of 262.8 h of your syllabus fits before 17 Jan 2027") and an orange warning when work does not fit. Good.
2. The warning counts items ("119 syllabus items (139.1 h) could not fit") but **never names what is missing** (no list of topics or subjects such as Dynamic Programming, CN, OOP). The student cannot tell that two of the four chosen subjects are absent.
3. "Estimated finish" equals the deadline when things do not fit, so the line adds nothing in that case.
4. "Your first week" uses raw dates ("DAY 2026-11-16"), repeats the label "Study tasks" on every day, shows no day total, no weekday name, and tags tasks with raw ids ("Striver SDE: arrays-i", "OS notes: os-introduction"). The saved plan shows nicer text ("Mon, 16 Nov", "Striver SDE: Arrays - I").
5. The form fields were filled from the settings link correctly (goal, 9 weeks, start date, hours, rest day, style, sheet, subjects); the link makes a comparison easy to repeat.

Saved plan, Plan tab
6. The top of the tab shows study calendar settings and Study day settings and Pause plan buttons first, before the plan summary.
7. The summary shows "0 of 135 tasks complete, 0 min completed", the dates as "2026-11-16 to 2027-01-17" (raw date format), "On track", and the orange line "119 syllabus items did not fit. Change your hours or rebuild to review coverage." (no link to a coverage list was seen).
8. Actions: Rebuild from today, Change hours, Lighter days, Add a task, Build another plan, Delete current plan.
9. Weeks appear as closed rows with only dates ("Week 1 · Mon, 16 Nov to Sun, 22 Nov"): **no hours, no topic names, no task counts per week** until a week is opened.
10. An opened week lists days ("Mon, 16 Nov") with a checkbox per task, the minutes, a source tag and an Options link. No day total.

Today
11. The Today screen follows the sacred rule (date, count and time, one Start button, the list).

### 8.4 Side by side with Planly (same goal, 23 h a week, start Mon 16 Nov)

| | PrepStack (Striver SDE, 9 weeks) | Planly (Pattern Mastery, interview prep levels) |
|---|---|---|
| Plan length | 63 days, fixed by the deadline | 60 days, set by the hours |
| Total planned | 135 h of tasks (135 items) | 179.4 h (666 listed entries) |
| DSA | 103 problems, 116.7 h, 8 topic groups, DP and others missing | 17 topics, 65 h 38 m, DP 8 h 17 m, Graphs 12 h 29 m, nothing missing |
| CS subjects chosen | OS full; DBMS 1 section; CN and OOP none | OOPs 16 h 33 m, DBMS 57 h 20 m, OS 15 h 35 m, CN 24 h 16 m, all included |
| Day 1 | 2 problems, 1 h 50 m | 7 problems, 2 h 46 m |
| Minutes per problem | 40 / 70 / 120 | about 17 to 37 |
| Tasks per day | 2 to 4 | 6 to 7 |
| Reviews, mocks, behavioral | yes (reviews scheduled by how you solved; mocks from week 4; behavioral last 2 weeks) | not seen in Sprint 1 |
| What does not fit | said, but not named | not applicable (it plans everything and sets the end date) |
| Rest day | none set in this run (field exists) | none (a day set to 0 hours) |
| Price | free | 1 free plan, 4 h a day cap, locks after 2 days |
