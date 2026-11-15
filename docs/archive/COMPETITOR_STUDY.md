# Blueprint of TUF and CodeHelp

Written 7 Nov 2026 from the public, logged-out pages of [takeuforward.org](https://takeuforward.org/) and [codehelp.in](https://codehelp.in/). Nothing behind a login was seen. All user numbers are the sites' own claims and are not verified. Prices are as shown on the pages that day (both sites ran Diwali sale banners).

The comparison with PrepStack is not written yet: see the last section.

---

## 1. The shared pattern

Both sites are built in five layers:

1. **Landing page** sells the product: a hero, a learner count, two buttons ("free" and "paid") and an app preview.
2. **Catalog** lists sheets, courses and paths as cards with sizes (modules, topics, hours).
3. **Item page** has a progress panel, topic accordions or a problem table, and a login prompt.
4. **Problem page** teaches or tests one item.
5. **Personal spaces and community** (plan, notes, lists, leaderboard, forum) bring users back.

A paywall and a login wall run through all five layers. Counters like `0 / 495` show everywhere and push the visitor to log in.

Look and feel: dark theme, a left sidebar once inside the app, breadcrumb plus big title plus tabs on each page, cards with stats, progress bars, a sale banner on top.

---

## 2. TUF (takeuforward.org)

### 2.1 Structure

```
/ (landing)
├── /prep-hub ── tabs: DSA · Core CS · System Design · Data Engineering
│     ├── DSA sheets: A2Z (495 topics, 132h) · 180 · 75 · 150 · Blind 75 (69)
│     │       └── each sheet ──> "Zen mode" (/learning/dsa/...) and "Plan Now" (Planly)
│     ├── Core CS: DBMS (217 topics, 59h) · OS (156, 28h) · CN (148, 25h) + 3 "Interview prep" versions
│     ├── System Design view: OOPS (33 topics, 8h) · LLD (71, 31h). No HLD course yet
│     └── C++ for Beginners (free certification)
├── /practice
│     ├── /dsa: 1,468 problems ──> problem page ──> Solution · Submissions · Peer solutions
│     │        └── company pages (51), e.g. Amazon ── login-locked
│     ├── /sql: 91 problems
│     └── Quantitative, logical, verbal aptitude: 25 topics, only one marked Free
├── /planly ── "Create my plan" ── /dashboard (the daily planner)
├── /community ── feed, interview experiences (511 stories, 239 companies), success stories
├── /hall-of-fame ── achievements ──> community stories
├── /potd ── problem of the day ──> problem page ──> /leaderboard
├── /blogs ── articles (about 64 pages, with view counts)
├── /goodies ── store for coins, /leaderboard (coins, trophies, titles)
├── My Space (login only): NoteSpace, Lists, CodeSpace, Buganizer
├── /ide ── online compiler
└── /pricing ── TUF+ plans and single passes
```

Layout: left sidebar groups (Prep: Dashboard, Prep Hub; Practice: DSA, SQL, Aptitude; Planly; Community; Additional; My Space), a top bar with search, coins, a streak flame and a "Plus" button. The problem page is a split screen: the statement and tabs on the left, a code editor with a test-case panel on the right.

### 2.2 How the parts feed each other

- **Sheet to Planly:** every sheet page has a "Plan Now" button.
- **Sheet to learning path:** every sheet has a "Zen mode" button.
- **Problem to company page:** a company tile opens its question list (locked).
- **Problem of the day to leaderboard to goodies:** coins and prizes.
- **Community to problems:** posts link to specific problems.
- **Every locked page** sends the visitor to `/get-started?next=<same page>`, so they return after login.

### 2.3 Planly

From the public page and a screenshot:

- It asks a few questions (under 3 minutes) and builds a plan. "57.1K+ plans created".
- The 7-step story on the page: About you, Understanding your goals, Personalised weekly sprints, Solve & Practice, Track your time, Progress tracker, Missed a Day/Task?
- A plan is a list of sprints by topic, each with a status and an hours estimate. The example on the page:

| Sprint | Topics | Status | Estimate |
|---|---|---|---|
| 1 | Arrays, Strings & Hashing | Completed | 12h |
| 2 | Sorting & Binary Search | Completed | 13h 30m |
| 3 | Linked Lists, Stacks & Queues | In progress | 15h |
| 4 | Trees & Binary Search Trees | Upcoming | 16h |
| 5 | Graphs & Dynamic Programming | Upcoming | 18h |

- The example is DSA-only, and nothing on the page mentions resumes, jobs or companies.
- **Not public:** the questions it asks, how it builds the plan, how it handles missed days, and what a sprint links to.

### 2.4 Zenkai (the latest big upgrade)

- Launched around September 2026 as a "learning + practice platform", broader than DSA.
- Reported parts: Planly (sprints, daily tasks for learning, practice and revision, a learning timer), TUFY (the AI assistant), company prep, notes and code spaces, personalised solution notes, and open coding practice (unlimited runs and submits).
- It is included in existing TUF+ plans. AI features come with usage limits.
- Before Zenkai, a post by Striver said practice runs were limited to 3 as a trial of TUF+.
- Striver reports 1M+ users and record usage after the new UI, and says "some people loved it, some didn't". A community post mentions high load and plan-migration confusion.
- The official guide is login-gated, so this comes from public posts and search summaries and is thinner than the guide.

### 2.5 Access and money

| Item | Access |
|---|---|
| Prep Hub, sheet pages, practice list, blogs, problem of the day, leaderboard view | Open |
| Progress tracking, planner, notes, lists, CodeSpace, company pages | Login |
| Premium content, videos, AI | Paid |

- **TUF+ (12 months):** Basic ₹7,331, Core ₹10,498, Max ₹19,999. Durations of 24 months, 48 months and lifetime exist, but their prices were not readable.
- **Single passes:** Company PASS ₹1,424 for 2 months, DSA PASS ₹2,999 for 12 months.
- **TUFY credits:** 10,000 / 15,000 / 25,000 by plan (3,500 and 5,000 with the passes). What they buy is not explained.
- **Coins:** separate from TUFY credits. The store lists, for example, 7-day Max access for 5,000 coins and a 1:1 session with Striver for 1,00,000 coins ("Coming Soon"). The page says the values are placeholders until 1 Jan 2027.
- **Login:** OTP gives a 1-day session, Google gives 30 days.
- **Max plan roadmap:** AI content and assessment (Q1/Q2 2027), HLD practice (Q2/Q3 2027), Backend Principles (Q3 2027).

---

## 3. CodeHelp (codehelp.in)

### 3.1 Structure

```
/ (landing: pricing, free resources, features, testimonials)
├── /codehelp-one ── plans ──> /checkout (3 plan links)
├── /pricing-comparison
├── /courses (10 cards) ──> /course/<slug> ──> Buy / Start Free Course
├── /sheets: Love Babbar 450 (437 problems), Blind 75 ──> problem pages (login) or GfG / LeetCode links
├── /mock-test (19) ──> /mock-test/test/<slug> (45 min, 30 Qs)
├── /articles ──> /articles/<slug>        /tutorials   /interview-experience
├── /core-subjects <──> /courses          /quick-compiler    /code-playground
├── /dashboard, /learn, /community ── login only
├── /help (FAQs, tickets), legal pages (privacy, terms, refund)
└── /login (sign up and log in are the same page)
```

Layout: two headers. A marketing header (Courses, Explore, Practice, Pricing) on public pages, and an app header (Dashboard, Courses, Learn, Practice, Community, Help, night mode, search) inside. A sheet page has a table (Done, Problem, Links, Acceptance, Difficulty, Bookmark), filters on the right (Categories, Patterns, Companies, Difficulty), "Random Question", and padlock icons on locked rows.

### 3.2 How the parts connect

It is a hub with spokes. The homepage and header link to each section, and each section ends at login or checkout. Few pages link to each other: an article on "Reverse a Vector" has no visible link to the same problem in the sheet. Sheet problems link out to GeeksforGeeks or LeetCode, and internal problem pages need login.

### 3.3 Plans (CodeHelp ONE)

| Plan | Billing | AI tokens per day | Compiler runs per day |
|---|---|---|---|
| Basic | ₹499 for 1 month | 25K | 50 |
| Plus | ₹4,999 for 1 year (₹417/month) | 50K | 100 |
| Pro (marked Popular) | ₹6,999 for 2 years (₹292/month) | 75K | 300 |

All three include every course (current and future), core CS subjects, mock tests, contests, unlimited run/submit, 400+ coding problems, live group sessions, interview experiences, articles and tutorials. The comparison table has a "Free Plan" column, but its ticks did not load.

### 3.4 Courses (from the course pages)

| Course | Hours | Sections | Students | Price |
|---|---|---|---|---|
| DSA RED | 285 | 41 | 3k+ | ₹4,100 (₹7,000 crossed out) |
| Low Level Design (SUPRA) | 71 | 21 | 6k+ | ₹2,199 |
| Web Dev MERN | 149 | 22 | 17k+ | ₹3,500 |
| GoAt DSA | 1 | 23 | 2+ | Free plan |
| DBMS Placement Sheet | 11 | 5 | 2+ | Free plan |

All are in Hindi. DSA, LLD and MERN are taught by Love Babbar and Lakshay Kumar. The refund policy is "strict no refund and no cancellation". The company behind the site is Sorting Code Help Technologies Pvt Ltd, with servers on AWS in India.

---

## 4. Loose ends and missing things

### TUF

- Numbers that disagree: 18,87,716 learners (homepage), 83,193 (leaderboard), 10,000 (sheet pages), "100k+" and "1M+" elsewhere.
- The A2Z sub-counts add up to 480, not 495. The practice splits add up to 1,455, not 1,468. The C++ page says "9 modules, 29 topics" but lists 10 modules totalling 120. Blind 75 shows 68 on the card and 69 on the page.
- The leaderboard "starts 1 Jan 2027" yet already shows monthly coins. Store prices are placeholders.
- The homepage "0+" subscriber counters (may be script-loaded, not confirmed).
- Naming drifts: Online Compiler, IDE, CodeSpace, Workspace; Lists vs Revision Lists; Quantitative vs Aptitude.
- The community feed mixes interview prep with market news and job ads. Promo banners and "Spin Now" appear on almost every page.
- Missing: a resume tool, live mock interviews, a clear explanation of TUFY credits, per-problem free/paid labels, and a High Level Design course (dated 2027).

### CodeHelp

- `/courses` lists LLD and MERN as "0.0 Hours, 0 Sections" and priced, while their own pages show 71 and 149 hours. GoAt DSA is 199.8 hours in the list and 1 hour on its page.
- "FREE Web dev Course" is labelled "Subscription Only" while the homepage lists it as free. Other pages use "Free plan".
- Run-together prices ("₹3,000₹1" for C++ and Java), "0k+" counters, and a title saying "100+ courses" with 10 listed.
- Two different headers, menus with no visible targets, and `/tutorials`, `/code-playground` and `/community` showing only a login page.
- Mock tests say "30 Qs" but each counts as "0/1 Quizzes".
- Typos and mixed tags in articles ("OOOP", "LInkedList"); the same text in two homepage blurbs.
- Missing: a resume tool, a personal study plan, live mock interviews, more than two sheets, and links between articles and sheet problems.

---

## 5. TUF logged in (a free account, 7 Nov 2026)

Added after signing in to a free account. Nothing was bought, spun, redeemed, posted or submitted. The Planly draft that was started to read its questions was discarded.

### 5.1 The app shell

- **Left sidebar (225px):** PREP (Dashboard, Prep Hub, Practice > DSA / SQL / Aptitude, Planly, Community), ADDITIONAL (Blogs, Unlock > Goodies / Gamification, Dev Tools > IDE), MY SPACE (NoteSpace, All Lists, CodeSpace, Buganizer). The footer holds a notifications line, the user (name, "Free", an Upgrade pill).
- **Top bar:** search, a coin count, a streak flame, and a gold "Plus" button.
- **Right rail on most pages:** a discount-spin banner, a "special offer" card (DSA PASS, 25% + 10% off), Problem of the Day (+20 coins), a Daily Planner box, and a trending list. Free users also see ad blocks (for example a third-party "Claim your Gemini student plan" ad).
- **Dashboard:** greeting ("Long day, sahil?"), "Pin your subjects", the Planly card ("57.1K+ plans created"), "Explore Popular Topics" cards, DSA progress ring (0 / 1468 with Basic 292, Core 850, Pro 313), Interview Experiences card (511 stories, 239 companies).
- **First-visit tour ("Meet Zenkai"), 3 slides:** a connected new experience; "Your plans have been upgraded" (Sprint is now Plus Basic, Pinnacle is now Plus Core, Subject Plans are now Subject Passes, validity kept); "Everything now lives inside PrepHub" (sheets, roadmaps, subjects, practice paths, notes, saved learning).
- **Profile menu:** Profile, Account, Troubleshooting, Notifications, Refer & Earn, Theme switch, Logout. The only notification was "your account is ready".
- **Account page:** plan overview ("No active plan"), purchase history, and a "Delete your TUF Account" danger zone.

### 5.2 Planly, step by step (5 steps, draft auto-saved)

1. **About you:** role (SDE Intern / Software Engineer), experience (0-2, 2-5, 5+ years), target companies (Startups / FAANG / All product-based / Open to all), region (India / US-Europe-Others).
2. **Build your preparation:** recommended subjects pre-ticked (DSA, OOPs, DBMS, Operating Systems, Computer Networks), each with a level. DSA: Start from zero / DSA Foundations / Pattern Mastery / Quick Revision. The others: a depth option (for example "Learn in Depth" or "Learn from Fundamentals") vs "Interview Preparation". Extra subjects: LLD. A note says "We don't currently cover HLD; we plan to add it within the next 6-12 months."
3. **Review your roadmap:** "We've planned 179.4 hours of focused learning" with a per-subject estimate (DSA 65h 38m, OOPS 16h 33m, DBMS 57h 20m, OS 15h 35m, CN 24h 16m). Subjects expand into modules with a time and a delete icon ("Already covered some topics? Remove them"). A TUFY chat panel to adjust the syllabus is a Plus feature (shown locked with an Upgrade button).
4. **Weekly availability:** hours per day for each weekday (default 4), "Est. days: 45", total 28 hours a week. "Free plans with these subjects allow up to 4 hours a day."
5. **Confirm** creates the plan (not pressed).

### 5.3 Prep Hub and the learning page

- **Prep Hub is grouped by goal:** "Start Coding" (C++ for Beginners, free certification), "Learn From Zero" (A2Z), "Interview Prep - India" (Striver's 180, Striver's 75), "Interview Prep - US/Europe/Others" (Striver's 150, Blind 75).
- **Sheet page:** title, "online / learners" counts, an Overall Progress panel, a "Plus" teaser strip, a "Zen mode" row and a "Planly" row, then topic rows with `0 / n` counters. Three tabs under it: About this sheet, Feature comparison, FAQs.
- **A2Z description:** about 450 learning items (400+ problems, 50 theory lessons) in 19 modules and 95 sections, roughly six months at a steady pace. (The card says 20 modules.)
- **Free vs Plus (the sheet's own comparison):** free gets the full curriculum, free questions, community-written editorials, some videos with ads, notes made by hand, and code saved only in the browser. Plus adds Planly, premium questions on dedicated servers, a video for every problem, section-wise videos (jump to Brute/Better/Optimal), engineer-written editorials, TUFY (guide-me hints, contextual code hints, AI code review, ask inside videos, deeper problem explanation, learning assistant), revision images, AI-generated notes, company tags, contests, code saved on the server, submission notes and a Study Mode.
- **Zen mode (learning page):** a left tree of sections and lessons with durations and "Free" or "Free Trial Included" tags, a video player ("You can drag this player anywhere"), and a right panel with Editorial and Discussion tabs, a table of contents and a progress percentage.

### 5.4 Practice

- **List:** 1,468 problems with Difficulty (Basic / Core / Pro), Companies, Topics and Resources columns, filters, "Company Asked / Pattern Based / Asked Frequency" views, and a Top Companies panel (51).
- **Problem page:** a split screen. Left: Problem / Solution / Submissions / Peer Solutions tabs, Hints and Companies chips, the statement, a "Now Your Turn!" quiz, an "Explain problem" button, constraints, hints, "Frequently Occurring Doubts" and interview follow-ups, plus an "Advertisements" block. Right: a code editor with multiple tabs, a language picker, Run and Submit, a floating "Guide Me" TUFY button, and a Sample / Hidden test-case panel. A footer row has likes, a timer and note icons.
- **Solution tab (free account):** Brute / Better / Optimal tabs show "Free trial not available. Upgrade to Plus", with a teaser list of what the video and editorial cover.
- **Submissions:** "No submissions till date." **Peer Solutions:** open, with titles, tags and upvotes (16 pages).
- **Company page (Amazon):** company facts (established, employees, "Last synced" date) and three blurred, padlocked charts (Your Progress, Topics asked, Patterns asked), a mascot, and "Company Pass" / "Plus" buttons.

### 5.5 My Space and tools

- **NoteSpace:** empty until you save notes on problems.
- **Lists:** "No List yet", with Add List and Smart List.
- **CodeSpace:** "Free plan limits: 10 files and 5 folders" with a usage counter (0/10, 0/5) and an "Open IDE" button.
- **IDE:** free, with file tabs, a language picker (C++ shown), Run, Input and Output panes, and a status bar (encoding, spaces, line and column).
- **Buganizer:** a bug-tracking page with a "Production Outages" status board ("No outages at the moment"). Priority support is Plus.

### 5.6 Gamification and community

- **Coins and streak:** the account started with 1 coin and a 0 streak. POTD gives +20.
- **Leaderboard:** a podium for the top 5, a ranked table, and your own row highlighted with "You're 10.2k coins away from Rank #1". It lists about 83k learners. Tabs for Trophies and Titles show the same coin board when opened by link.
- **Store (Goodies):** your balance, three featured reward cards, category tabs (All, Merchandise, TUF Plus, Coupons, Experiences) and Redeem buttons. Prices are placeholders until 1 Jan 2027.
- **Community:** a Feed plus Interview Experience (with a "Share" prompt), Success Stories and My Drops. Interview posts carry a company tag, role details and per-round write-ups.
- The Zenkai guide post could not be opened even logged in; its link redirects to the community feed.

### 5.7 Design system (measured from the live page)

| Item | What it uses |
|---|---|
| Theme | Dark by default, with a light theme behind a switch in the profile menu |
| Fonts | DM Sans (main, variable weight) with Geist as backup |
| Type sizes | Body 14px; page title 20px bold; section and card titles 14px medium; helper text 12px; buttons 11-12px medium |
| Dark background | Page `#070709`; panels `#101012` / `#131316` / `#1a1a1e`; cards `#17181a` to `#242528` |
| Text | Primary `#fcfcfd`, secondary `#c1c4cc`, tertiary `#8d93a1`, faint `#646b78` |
| Lines | `#1f2023` to `#333438` |
| Brand | Blue `#327cf6` for buttons and links, orange `#ea763f` as the second brand colour; green, red, yellow, purple and pink ramps for status |
| Light theme | Page `#f4f4f6`, text `#232529` |
| Corners | Base radius 10px, layout radius 12px, buttons 6-8px, pills fully round |
| Buttons | Small and compact: 24-32px high. Primary solid blue, secondary outlined blue, "Plus" as a dark amber chip |
| Tokens | About 305 CSS variables, including groups for gamification, quiz, timer, TUFY and plus layouts |
| Look | Floating rounded panels on a near-black page, small text, dense layout, a pink mascot for empty and locked states, blurred previews with padlocks for paid content |

### 5.8 Loose ends found while logged in

- The step label and the address disagree (the page says "Step 2 of 5" while the address says `step=3`, and the roadmap step shows as `step=4`).
- A "Diwali spin" popup opens over pages (it appeared on a sheet page), plus banners on every page. Ads appear for free users.
- The Trophies and Titles tabs open the same coin board, so they may not be live yet.
- The Zenkai guide post is not reachable and the notification list holds only one welcome message.
- Planly's free cap is 4 hours a day, and syllabus edits via TUFY are Plus-only, so a free user can only delete modules by hand.
- No HLD yet (planned in 6-12 months), and the Max plan lists AI and HLD items dated 2027.
- A2Z shows 20 modules on the card and 19 in its description.

### 5.9 Sheets, CS subjects and notes in depth

**The five DSA sheets** (all open to a free account to browse; progress is saved on login):

| Sheet | Problems | Modules | Basic / Core / Pro bars | Shape |
|---|---|---|---|---|
| Striver's A2Z | 495 | 20 (16 contests, about 132 h) | 84 / 287 / 109 | Beginner topics to advanced, in a fixed order, "about six months" |
| Striver's 180 | 179 | 17 | 3 / 107 / 69 | Grouped by problem-solving pattern inside each topic |
| Striver's 150 | 150 | 17 | 13 / 95 / 42 | Same idea, shorter (for the US/Europe path) |
| Striver's 75 | 75 | 12 | not read | The "Blind 75 alternative" (India path) |
| Blind 75 | 69 (card says 68) | 10 | 6 / 42 / 10 | The classic list by topic (Array 9, DP 11, Tree 10, ...) |

**How a sheet is built.** Sheet, then topic (for example Arrays, 32), then sub-sections (Fundamentals 6, Logic Building 5, FAQs (Medium) 15, FAQs (Hard) 6) and a timed contest per topic ("3 problems, 2 hours", with a Start contest button), then the problem rows. A toolbar has search, filter, a view toggle and expand-all. The open sections are kept in the address (`?open=1997,2027`), so a refresh or a shared link keeps them open.

**What one problem row holds** (this is the heart of the design). A checkbox to mark it complete, the title with a difficulty chip, then small icons:
- Zen mode (locked on the free plan).
- The practice page.
- A written article.
- A video.
- A LeetCode link (greyed with "LeetCode unavailable" on the row I checked).
- Notes.
- Bookmark.
- A "more" menu.

**The written articles (TUF's "notes" for DSA).** Open to everyone. They have a breadcrumb, a view count (326.1k on Linear Search), a "last updated" date, likes, and a right-hand "Reading progress" box with an "On this page" outline. Structure: problem statement and two examples, Approach, Algorithm (numbered reasoning steps), Dry Run (an image), Solution (language tabs: C++, Python, Java, JavaScript, with commented code), Complexity Analysis (time and space with the reason), FAQs. Three article categories exist: data structures and algorithms, interview preparation, and database management systems.

**Personal notes.** The row's Notes icon opens a small editor: a rich-text toolbar (bold, italic, underline, lists, links, code, quote), a 10,000-character counter, a Save button, and a "Note generation prompt" with a Generate button for AI notes (a Plus feature). Saved notes appear in NoteSpace, which is empty until you save one. (I opened the editor and closed it without saving.)

**Core CS subjects use the same page template as the sheets** (progress panel, Zen mode, Planly button, expandable modules, Know more tabs). Sizes read from the pages:

| Subject | Modules | Items | Extras |
|---|---|---|---|
| DBMS | 23 | 217 | Modules run from SQL basics through joins (35), subqueries (25), indexing, query optimisation, transactions, recovery, distributed databases and NoSQL |
| Operating Systems | 14 | 156 | Processes, scheduling, threads, synchronisation (17), deadlocks, IPC, memory, paging, file systems, disk scheduling, security and virtualisation |
| Computer Networks | 14 to 15 | 148 | 36 quizzes; models, data link, IP, routing, transport, application layer, NAT, switching, security, cryptography, wireless, performance |
| Java OOPs | 6 | 33 | 20 lessons, 13 practice exercises, 18 quizzes |
| Low Level Design | 13 | 71 | SOLID, UML, creational / structural / behavioural patterns, concurrency, and 26 interview problems (12 full worked systems) |

Each subject also has an "Interview prep" version (DBMS, OS, CN) with slightly fewer items.

**A lesson page** has three panes: a left curriculum tree (with durations and "Free" or "Free Trial Included" tags, and the subject's progress counter), a middle video player ("Free Preview", drag-able), and a right panel with Editorial (a written version of the lesson in a friendly, story-driven style) and Discussion tabs, plus a table of contents with a percentage. Under the video: like, dislike, notes, bookmark and a "Completed" toggle with previous and next arrows. Lessons can sit beside quizzes (for example "7 MCQs, 30 mins").

**Quizzes and practice.** DSA problems have a "Now Your Turn!" multiple-choice warm-up inside the problem page. Subjects have module quizzes. Aptitude and SQL practice also exist (not explored on request; the little I read: 25 aptitude topics with 4 practice sets and 2 mocks each, only the first topic free, and 91 SQL problems).

**Loose ends in this area:**
- The DBMS description says "14 modules with 94 lessons", while the page shows 23 modules and 217 items.
- CN says 15 modules but lists 14.
- A2Z says 19 modules in one place and 20 in another.
- Blind 75's difficulty bars add up to 58 against 69 problems, and A2Z's add up to 480 against 495.
- A LeetCode link is greyed out on a basic problem.
- Free users can read the articles and watch preview lessons, but Zen mode, full editorials and videos are locked.

### 5.10 The Profile page (a public portfolio)

The address is `takeuforward.org/profile/<username>`, a public, shareable page. It uses a different layout from the app: a floating top bar (Dashboard, Explore, Pricing with a "SPIN & WIN" tag, avatar menu) and no sidebar.

- **Header card:** a cover image and an avatar, both editable; display name, `@handle`, a small tag ("Other", a role or interest label), a profile-views counter ("1 profile views"), and an "Edit Profile" button.
- **About:** a short bio, with an empty state ("Tell your story").
- **Featured Projects:** the user's best work, with an "Add projects" button.
- **Consistency:** a 12-month activity heatmap (a GitHub-style grid) with a platform filter ("All", "TUF": "1 platform connected", so other coding platforms can be linked), a time-range picker, and four counters: contributions, active days, best streak, contests.
- **DSA Progress:** a ring (0 / 1468) with Basic, Core and Pro counts, and a topic-wise analysis listing 23 topics (Arrays, Binary Search, DP, Graphs, ..., Pattern Printing, Range Data Structures, Ordered Sets and Maps).
- **Right column:** Public URL (with a copy button), At a Glance (problems solved, best streak, global rank), Skills, Work Experience, Education, and Coding Profiles and Social Links.
- Every section has a dashed empty state with a one-line prompt and a blue action link, the same pattern as the rest of the app.
- Observed gaps: the "Other" tag is not explained; no certificates section is visible although the home page promises "Profile - One in All Portfolio" and "Certificate"; and the global rank shows 0 until you earn activity.

### 5.11 The dashboard in detail, and the light theme

**TUF does have a dashboard** (`/dashboard`, also open to logged-out visitors with a "Log in to sync" prompt). It is a short single page (about 1,100px tall) with a main column and a right rail:

- **Main column, top to bottom:**
  1. A promo banner (a discount-spin wheel, "Only 100 spots available").
  2. A greeting with a gentle line ("Long day, sahil? One last push before calling it a day.").
  3. "Pin your subjects": a dashed "+" tile where subjects get pinned (the picker was not opened).
  4. The Planly card ("Know what to study every day and readjust as you go", "57.1K+ plans created", Build my plan).
  5. A strip, "Start with your first problem".
  6. "Explore Popular Topics": cards you scroll sideways (Striver's 180, A2Z, LLD, DBMS), each with topic count, hours and an Explore button.
  7. "Must-Have for Interviews": an Interview Experiences card (511 stories, 239 companies, round-wise, Read stories).
- **Right rail:**
  - A DSA Progress ring with Basic / Core / Pro counts and carousel dots (a second slide).
  - A "special offer" card.
  - Problem of the Day (+20 coins, "3 hrs left", Solve Problem).
  - A Daily Planner ("No tasks for today", Add tasks).
- **What it lacks, compared with a progress dashboard:** it has no per-sheet progress cards, no recent activity, no saved items and no reports. Progress shows only as one DSA ring, and the page is mostly entry points and promotions.
- **Logged-in home page:** shows a "Go to dashboard" button and a Planly "Today's task" preview with a checklist (for example "Solve DSA practice", "Revise LLD", "OOPS practice 45 min"), which is the clearest picture of how Planly's daily tasks look.

**Light theme** (a `theme` cookie plus a switch in the logged-in profile menu; checked on the dashboard, A2Z sheet, problem page and an earlier company page):
- Same layout, spacing and components as dark; only colours change.
- Page `#f4f4f6`, text `#232529`, card borders `#d4dae2`, brand blue `#327cf6` unchanged. Body text contrast is 14:1 and muted text is 9.6:1, both good.
- White-on-blue buttons measure about 3.9:1 (below the 4.5:1 guideline for small text), the same in both themes.
- Promo banners stay dark in the light theme, and the "Plus" chip turns pale amber.
- The code editor stays a light editor with the same syntax colours; the mascot and blurred locked charts look the same.
- Not checked in light: the lesson page, the profile page, modals and the Planly flow.

### 5.12 Still not seen

TUFY chat itself, Refer & Earn, Troubleshooting, a generated Planly plan and the Daily Planner with tasks, the aptitude and SQL pages in depth (skipped on request), and any paid content.

---

## 6. What was not seen

- Anything behind login: dashboards, Planly's real questions, TUFY, solutions, video lists, CodeHelp's problem pages and quizzes.
- The Zenkai guide itself.
- Traffic, quality and user satisfaction. All user numbers are self-reported.
- Some pages (a CodeHelp article, TUF's IDE) came back empty to the text reader, probably because they load with scripts.
- Pages were read as text and four pages were also seen on screen, so spacing, colours and animation are described only roughly.

## 7. Comparison with PrepStack

PrepStack facts used here were measured from the repo on 7 Nov 2026: 5 DSA sheets (about 1,300 problem links to LeetCode, GeeksforGeeks and similar), 4 CS subjects (38 note sections, about 4,400 words in total (OS about 2,800; DBMS, CN and OOPs 450 to 700 each)), 6 role roadmaps (8 to 9 steps each), an AI project-idea generator, the Role Analyzer, a Behavioral page (22 questions), a Resume Guide, a dashboard with DSA / Projects / Reports tabs, a profile and sessions page, and no ads, payments or accounts tiers. Quiz and Aptitude pages exist but are hidden.

### 7.1 Side by side

| Area | TUF | CodeHelp | PrepStack | Who leads |
|---|---|---|---|---|
| DSA sheets | 5 sheets, 1,468 problems on its own pages | 2 sheets (450 and 75), mostly links out | 5 sheets (Blind 75, NeetCode 150, Striver SDE, Striver A2Z, Love Babbar 450), links out | TUF; PrepStack has the same well-known lists |
| Solving a problem | Own editor, run and submit, hidden tests, solutions, peer solutions | Partial, login needed | None: links to LeetCode and GfG | TUF |
| Learning content | Video + written editorial + quizzes for DSA and CS (DBMS 217 items, OS 156, CN 148) | Paid courses, free articles, mock tests | 4 CS notes subjects, short sections, no video, no quiz | TUF, by a wide margin |
| Personal notes | Per-problem editor (10,000 chars), AI notes (paid), saved to the account | Saved questions | Notes are saved only in the browser | TUF |
| Study planner | Planly (5 steps, hours per day, sprints, daily tasks, TUFY) | None | Role Analyzer builds a day-by-day plan from a real job, but it is not tracked day to day | TUF for tracking; PrepStack for job relevance |
| AI help | TUFY: hints, code review, notes, doubts (paid credits) | AI support with daily token limits (paid) | AI project ideas and the Role Analyzer (free, capped per day); no coding help | Different jobs |
| Resume vs job | None seen | None seen | **Role Analyzer: computed score, checked quotes, links to your own content, PDF** | **PrepStack** |
| Project ideas | None seen | None seen | **AI project generator, saved ideas** | **PrepStack** |
| Role roadmaps (web, Android, data, ML) | Not the focus | A "guided path" label only | **6 roadmaps** | **PrepStack** |
| Company-wise prep | 51 companies (paid) | None seen | None | TUF |
| Interview stories | 511 stories, 239 companies | A page behind login | 22 behavioral questions with STAR guidance | TUF |
| Community, coins, leaderboard, store | Yes | Some (Discord) | None | TUF (and not necessarily better) |
| Public profile | Portfolio page with heatmap | Dashboard only | Private profile and sessions manager | TUF |
| Dashboard | Short, promo-heavy, one DSA ring | Not seen | **Tabs for DSA, Projects, Reports with real counts** | PrepStack, for what it shows |
| Price | ₹7,331 to ₹19,999 a year, plus passes | ₹499 to ₹6,999 | Free | PrepStack for cost |
| Ads and popups | Ads for free users, spin popups, banners | Sale banners | None | PrepStack |
| Themes | Dark and light, about 305 tokens | Dark with a toggle | Dark only | TUF |

### 7.2 Design comparison

| | TUF | PrepStack |
|---|---|---|
| Fonts | DM Sans (Geist backup) | Plus Jakarta Sans (headings), Inter (body), JetBrains Mono (code) |
| Page colour and cards | `#070709`, cards `#17181a` to `#242528` | `#060608`, cards `#0c0c0e`, elevated `#16161c` |
| Accent | Blue `#327cf6`, orange `#ea763f` | Amber `#ffa116` (LeetCode-like), status colours green, yellow, red |
| Density | Compact: 14px body, 11-12px controls | Roomier, larger headings |
| Layout | Left sidebar app with floating rounded panels | Top navigation with page-style layouts |
| Empty and locked states | Mascot, one line, one blue button; blurred, padlocked previews; free-plan limits shown in the page | Plain empty states |
| Themes | Dark and light via a switch | Dark only |
| Systems | About 305 design tokens | Fewer tokens; many colours are written directly in components |

### 7.3 My opinion

1. **Do not try to be TUF.** TUF is a learning platform with its own judge, videos, editorials, a planner, AI credits, community and a store, paid for by plans and ads. That is years of content and a team. PrepStack as a tracker that links out will always look thin beside it on those points.
2. **PrepStack's real edge is job targeting.** Neither site reads a resume against a job, and neither makes project ideas or role roadmaps. Those match a different need: "I have a specific job and a specific resume." Plus it is free, ad-free and honest about its limits. I would build the identity around that.
3. **The weakest area is the notes.** About 4,400 words across four subjects is small next to TUF's single DBMS course. Either deepen it or present it as quick revision. Do not claim equivalence.
4. **Best things to build next (cheap, and they fit PrepStack):**
   - **A daily checklist for the Role Analyzer plan.** TUF's Planly is generic by topic. A plan from a real job description that you tick off day by day is something TUF cannot do. Effort: medium, about 2 to 3 days.
   - **Notes saved to the account** (today they live only in the browser), with a notes list page. Effort: small to medium.
   - **Per-sheet progress cards on the dashboard**, with a streak. Effort: small.
   - **Keep the open state in the address** (TUF stores which sections are open in the URL). Effort: small.
   - **Show limits in the page**, such as "3 of 5 reports left today". Effort: small.
   - **Quizzes for the CS notes** (the hidden Quiz page is a stub). Value is real, but only worth it with checked questions. Effort: medium and content-heavy.
5. **Probably skip:** videos, your own judge or compiler (sandboxing and security cost), coins and a store, ads, spin popups, paid tiers, and a light theme (your components use many fixed colours, so it would be a large refactor).
6. **What to copy from TUF's design:** one consistent empty-state pattern, locked content shown as a preview with a clear reason, and compact controls. **What not to copy:** the promo popups, ad blocks and the numbers that disagree with each other. Your cleaner look is a strength.
7. **Honest caveats:** I measured TUF and CodeHelp logged out (TUF also logged in on a free account), and I do not know what your students want most. Before building any of the above, show the Role Analyzer to 3 to 5 students and ask which gap hurts them.

---

## 8. How the pieces connect: the final map

This section answers one question: what links to what, and why. It is built from the logged-out pages of both sites and the logged-in pages of TUF.

### 8.1 TUF: five hub objects, one shared progress store, one repeated shell

**Hub 1: the problem page.** It is the most linked-to page in the site. Pages that send you to it: every sheet row, the practice list, company pages, the Problem of the Day, community posts, and your lists. It sends you onward to: its solution tabs (editorial and video), peer solutions, your submissions, its hints and company tags, the written article, your notes, your lists, the AI helper (TUFY), and the timer. Finishing a problem is the main event that updates everything else (see the progress store).

**Hub 2: the sheet or subject page** (Prep Hub). A sheet or subject is a list of modules, and each module is a list of items (problems or lessons). Every one of these pages has the same two buttons: "Zen mode" (the guided learning path: video, written editorial, quizzes, discussion) and "Plan Now" (Planly). So a sheet is the entry to both learning and planning.

**Hub 3: Planly.** It reads the list of subjects and levels from the Prep Hub, turns them into a roadmap with hours, adds your weekly availability, and produces daily tasks. Those tasks come back in a Daily Planner box that sits in the right rail of almost every page and on the dashboard and home page. The AI helper edits the plan (a paid feature), and a free-plan limit caps hours per day.

**Hub 4: the progress store.** One record of what you solved feeds many places at once: the counters on every sheet and topic row, the DSA ring on the dashboard and practice page, the heatmap and topic analysis on your public profile, your streak in the top bar, and your rank on the leaderboard.

**Hub 5: coins.** Solving the Problem of the Day gives coins. Coins show in the top bar, rank you on the leaderboard, and can be spent in the store (for example Plus days). Trophies and titles are listed on the same page.

**The community** connects back to the rest in a lighter way: interview-experience posts carry company tags, the Hall of Fame links to stories, and posts link to problems.

**The shell is the glue.** A left sidebar (Prep, Additional, My Space), a top bar (search, coins, streak, Plus), and a right rail (offer, Problem of the Day, Daily Planner, trending) repeat on nearly every page. The user is never more than one click from a planner, a daily problem or an upgrade.

**The paywall sits deep, not at the door.** Almost everything is browsable. Locks appear at the point of need (the solution, Zen mode, company data, AI edits, planner hours, file limits), each with a teaser and an upgrade button.

```
Sheet / subject ──> Zen mode (video + editorial + quiz)
      │        └──> Planly ──> Daily Planner (right rail, dashboard, home)
      └──> problem row ──> problem page ──> solution · peers · submissions · AI helper
                │   └─────> article · video · notes · bookmark · lists
                └──> PROGRESS STORE ──> sheet counters · dashboard ring · profile heatmap
                                    └──> streak + coins ──> leaderboard ──> store
Company page ──> problem list (locked)   Community post ──> problem page
```

### 8.2 CodeHelp: separate sections joined by login, one subscription and shared quotas

CodeHelp has no single hub object. Its sections are mostly separate:

- Courses, sheets, mock tests, articles and core subjects each live on their own list page and end at login or checkout.
- The few real links: core subjects and courses switch views of the same content, sheets link out to LeetCode and GeeksforGeeks, and the homepage menu chips jump to sections.
- What actually joins everything is the account: one subscription (CodeHelp ONE) unlocks all courses, and daily AI tokens and compiler runs are shared across them.
- Progress counters exist (`0/437`, `0/75`, `0/1 quizzes`), but I saw no shared dashboard connecting them, and no planner.

```
Home ──> Courses ──> course page ──> Buy / free start
   ├──> Sheets ──> problem (login) or LeetCode / GfG
   ├──> Mock tests · Articles · Core subjects (<──> Courses) · Tutorials
   └──> Login ──> Dashboard   (one subscription + shared daily quotas join them)
```

### 8.3 What the two maps show

1. **TUF treats one thing, the problem, as the centre.** Everything else (sheets, planner, company pages, community, coins) points at it and is fed by it. CodeHelp treats the course as the centre and lets sections stand alone.
2. **A shared progress record is what makes a site feel connected.** On TUF, one action updates six places. On CodeHelp, the counters are per section.
3. **Repeating the same side panels on every page** (planner, daily problem, offer) keeps the user moving inside the product.
4. **Dead ends are covered by a button.** Locked or empty pages almost always show one action: log in, upgrade, create a plan, open the IDE.
5. **TUF's connections are also where its inconsistencies come from** (different counts for the same sheet on different pages), because the same number is shown in many places.

### 8.4 PrepStack today, in the same terms (for reference)

- **Its connected piece is the Role Analyzer:** a report links to the DSA sheet, the CS notes, the roadmaps, the Behavioral page and the AI project generator (`/ai-projects?stack=...`), and back to the dashboard's Reports tab.
- **The dashboard** pulls DSA progress, saved project ideas and reports into three tabs.
- **Project ideas** connect in two places only: from the analyzer's gap cards and from the dashboard. The page does not link to roadmaps, sheets or notes.
- **The sheets, notes, roadmaps, behavioral and resume pages** are mostly standalone lists; progress is tracked only for DSA sheet problems.

---

## 9. Their weaknesses, and what PrepStack can do about each

Every weakness below was seen on the live sites (marked "seen") or comes from TUF's own public posts (marked "reported"). Nothing here is a guess about quality.

### 9.1 TUF's weaknesses

| # | Weakness | Evidence | What PrepStack can do |
|---|---|---|---|
| T1 | The useful parts are paid and deep: solutions, videos, Zen mode, company data, AI edits, server-saved code. Plans are ₹7,331 to ₹19,999 a year. | Seen: locked Solution tab, "Upgrade to view in Zen Mode" on a basic problem, locked company page, "code is stored only in your browser" on Free | Stay free. Save notes and progress on the account for free, and say so on the page |
| T2 | Ads and pressure on free users. | Seen: ad blocks (a Gemini ad, a Dell ad), a spin popup over a sheet page, "Only 100 spots available", banners on every page | Stay ad-free and popup-free, and make that a stated promise |
| T3 | The same numbers disagree across pages. | Seen: 18,87,716 / 83,193 / 10,000 learners; A2Z sub-counts add to 480 not 495; C++ page lists 120 items but says 29; DBMS says 14 modules on one line and shows 23 | Compute every count in one place and test it. Never hand-type totals |
| T4 | The planner is generic. It asks role, years, target companies and region, then plans by subject. It never sees a resume or a job. | Seen: the five Planly steps | PrepStack's analyzer already plans from a real job and resume. The gap to fill is tracking it day by day |
| T5 | Free users cannot edit the generated plan except by deleting modules. AI edits are Plus. The free cap is 4 hours a day. | Seen on the review step and the availability step | Let anyone reorder and tick off their own plan |
| T6 | No resume or job analysis, no project ideas, no role roadmaps (web, Android, ML). Content stops at DSA, CS core and LLD. | Seen: navigation and Prep Hub | These are PrepStack's own territory |
| T7 | Half-finished gamification. | Seen: leaderboard "starts 1 Jan 2027" but shows monthly coins; store prices are "placeholder"; Trophies and Titles tabs show the coin board; a 1:1 session at 1,00,000 coins is "Coming Soon" | Do not ship a feature until its parts work |
| T8 | HLD is missing and the paid Max plan lists 2027 items (AI content, HLD, Backend Principles). | Seen: Planly note "plan to add it within 6-12 months"; Max plan dates | Be explicit about what exists today |
| T9 | Rollout pain after Zenkai. | Reported: high load and plan-migration confusion; plans renamed (Sprint, Pinnacle, Subject Plans) | Keep plan or feature names stable |
| T10 | Community feed mixes interview prep with market news and job ads; the Zenkai guide post could not be opened. | Seen | A smaller, focused feed (or none) is fine |
| T11 | Dense, small type (11-14px) with many widgets per page. | Measured: body 14px, controls 11-12px | Keep larger, calmer pages |
| T12 | Naming drift (CodeSpace / Workspace / IDE / Online Compiler; Lists / Revision Lists). | Seen | One name per thing |

### 9.2 CodeHelp's weaknesses

| # | Weakness | Evidence | What PrepStack can do |
|---|---|---|---|
| C1 | Only two DSA sheets, no personal plan, no company pages, no gamification, no resume or project tools. | Seen | PrepStack has five sheets and two unique tools |
| C2 | Much of the "free" content is behind a login or shows only a login page. | Seen: Tutorials, Code Playground, Community, Dashboard, problem pages | Keep public pages genuinely readable (the SEO prerender already helps) |
| C3 | Pricing page glitches and mismatched labels. | Seen: "₹4991 month access", "₹3,000₹1", priced courses showing "0.0 Hours", "FREE Web dev course" marked "Subscription Only", "100+ courses" with 10 listed | Test every label against the data |
| C4 | A confusing offer: courses are priced and also "included in subscription". Strict no-refund policy. | Seen | Simple, honest terms |
| C5 | Two different headers (marketing vs app) and menu items with no visible target. | Seen | One consistent navigation |
| C6 | Content is siloed: an article on "Reverse a Vector" does not link to the same problem in its own sheet. | Seen | Link related things both ways |
| C7 | Acceptance shows 0% on externally linked rows. | Seen on a locked row | Hide a number when it is not known |
| C8 | Courses are in Hindi only. | Seen on every course page | Not a PrepStack problem; note as a possible audience gap |

### 9.3 What would make PrepStack great, ordered by value, with effort

These are the moves where PrepStack can match a strength of theirs or fix one of the weaknesses above. Effort is a rough guess for one developer.

| Order | Move | Why (their gap) | Effort |
|---|---|---|---|
| 1 | **One shared progress record** feeding sheet counters, a dashboard "DSA by sheet" view, a streak and the profile | TUF's best idea (T3 shows how not to do it) | Medium |
| 2 | **Track the analyzer plan day by day** with a checklist and "today" on the dashboard | T4, T5: Planly cannot plan from a job | Medium |
| 3 | **Notes saved to the account**, listed on one page, linked from sheet rows | T1: TUF's free code is browser-only; PrepStack keeps it | Small to medium |
| 4 | **Show limits on the page** ("2 of 5 reports left today", "3 ideas left") and **keep open sections in the address** | TUF does this well; it is cheap trust | Small |
| 5 | **Link the pieces both ways:** roadmaps to project ideas, sheet topics to notes, project ideas back to roadmaps | C6, T6: neither site connects learning to building | Small |
| 6 | **A consistent empty and locked state** (illustration, one line, one button) | A TUF strength | Small |
| 7 | **A public, opt-in profile** with sheet progress, analyzer score history and saved projects | TUF has a portfolio but no projects or job scores | Medium |
| 8 | **Quizzes for the CS notes**, only with checked questions | TUF and CodeHelp both have quizzes | Medium and content-heavy |
| 9 | **Deeper CS notes** | The weakest content area (about 4,400 words) | Large |
| 10 | **Company tags on problems** | TUF paywalls this. The data's source and accuracy need care | Medium to large, with a data risk |

### 9.4 Things that look attractive but carry real cost

- **Your own code judge or compiler:** needs sandboxing and security, ongoing cost and abuse handling.
- **Video:** the cost is in making it, not in the code.
- **User-submitted interview stories:** needs moderation and privacy care. Worth doing later, with rules.
- **AI hints on sheet problems:** the problem statements belong to LeetCode and others, and free AI quota is limited. If tried, base hints on the title and topic only, and cap use.
- **Coins and a store:** TUF's version is still unfinished; the effect on learning is unproven.
- **Light theme:** PrepStack uses many fixed colours, so it is a large refactor. Do it only after a token cleanup.



#	Feature	Who has it	What PrepStack lacks today	Effort
1	Shared progress hub: per-sheet progress cards, a streak, and a “today” view on the dashboard	TUF (one progress record feeds sheets, dashboard, profile, leaderboard)	The dashboard shows a DSA total, not progress by sheet, and has no streak	Small to medium
2	Daily checklist for a plan: tick tasks off day by day, with a “today” box	TUF (Planly and its Daily Planner)	The Role Analyzer’s plan is read-only, so students can’t track it	Medium
3	Notes saved to your account: one notes page, opened from sheet rows	TUF (NoteSpace)	Notes live only in the browser and can be lost	Small to medium
4	Limits shown on the page: “2 of 5 reports left today”, plus open sections kept in the URL	TUF (CodeSpace limits, ?open=)	Users find limits only after hitting an error	Small
5	Quizzes for CS notes: a few multiple-choice questions per section	Both (TUF module quizzes, CodeHelp mock tests)	The Quiz page is a hidden stub	Medium, and needs checked questions
6	Interview stories: structured posts by company and round	TUF (511 stories)	Only 22 behavioral questions	Medium, but needs moderation and privacy care, so later

---

Sources: [TUF home](https://takeuforward.org/), [Prep Hub](https://takeuforward.org/prep-hub), [TUF+ pricing](https://takeuforward.org/pricing), [Planly](https://takeuforward.org/planly), [Goodies](https://takeuforward.org/goodies), [Leaderboard](https://takeuforward.org/leaderboard?board=coins), [CodeHelp home](https://codehelp.in/), [CodeHelp ONE](https://codehelp.in/codehelp-one), [Pricing comparison](https://codehelp.in/pricing-comparison), [Courses](https://codehelp.in/courses), [Sheets](https://codehelp.in/sheets)
