The best way to think about this is: **Keep the Scheduling Engine 100% pure code, but use AI as an intelligent "Co-Pilot" around it.**

Calendar math, time budgets (the 85% rule), dependency ordering, and spaced repetition intervals must **always stay pure code**. LLMs are notoriously bad at date arithmetic (they hallucinate dates, miss days of the week, exceed daily hours, invent non-existent problem links, and take 15 seconds to return JSON). Pure code executes in **5 milliseconds**, costs **$0**, never hallucinates, and is 100% testable.

However, there are **4 high-impact areas** where AI and smart automation can dramatically enhance "My Plan" without touching the core calendar math:

---

### 1. AI Weekly Study Coach (Smart Performance Debrief)
* **How it works:** At the end of every week (or during the Monday Weekly Review), your pure code calculates the raw numbers:
  * *14 items completed, 3 carried over, 2 DP problems marked "Needed solution", OS Deadlocks quiz scored 2/5.*
* **Where AI fits:** Instead of the student just seeing raw percentages, pass those summary numbers into a quick, low-token AI prompt to generate a **3-sentence personalized coach note**:
  > *"You crushed your Trees and Graphs targets this week (100% solved alone). However, Dynamic Programming and OS Deadlocks showed struggle. I've prioritized those 2 review items for Monday before you start new topics."*
* **Why it's great:** It feels like having a personal mentor tracking your prep, but uses almost zero AI tokens.

---

### 2. The "Needed Solution" 1-Click Concept Extractor
* **The Problem:** When a student marks a problem *"Needed the solution"*, they usually read the editorial and forget *why* they got stuck.
* **Where AI fits:** Add an optional button on failed problems: **"Explain my block in 1 sentence"**.
  * The user types: *"I tried using two pointers but it failed on negative numbers."*
  * AI returns: *"Trap: Two pointers requires a monotonic (sorted) condition. For negative numbers with subarray sums, use a Hash Map prefix sum ($O(N)$)."*
  * This 1-line takeaway automatically attaches to the item's **Review card** for Day 3!

---

### 3. Role Analyzer $\rightarrow$ Auto-Configured Plan (The Bridge)
* **How it works today:** A user manually selects: "Placements in 12 weeks, 3 hours/day, Backend roadmap".
* **Where AI fits (Automated Setup):** On the Role Analyzer report page, the user clicks **"Create tailored plan for this job"**.
  * The AI analyzes the job description's seniority and tech stack against the user's resume gaps.
  * It auto-fills the `/my-plan` form with recommended settings:
    * *Target:* Full Stack SDE
    * *Suggested timeline:* 8 weeks
    * *Priority focus:* Relational DBs & Concurrency
    * *PrepStack roadmaps to include:* Backend + System Design
  * The pure code generator then builds the exact schedule instantly!

---

### 4. Non-AI Smart Automation: LeetCode Profile Auto-Sync
*(This is automation via web APIs rather than LLMs, but solves the biggest student friction point).*
* **The Problem:** A student who joins PrepStack and has already solved 150 problems on LeetCode doesn't want to manually re-tick 150 checkboxes.
* **The Automation:** In the plan setup step *"Topics/problems you already know"*, add a field: **"Import LeetCode Username"**.
  * Your server queries LeetCode's public GraphQL endpoint (`https://leetcode.com/graphql`) for that username's list of solved problem slugs.
  * Your backend matches those slugs against your sheet problem links and automatically marks them as **"Already Solved"** in the plan.
  * Instant, accurate schedule without starting from zero!

---

### Summary & Recommended Strategy

| Area | Engine | Why |
|---|:---:|---|
| **Schedule Generation & Dates** | **100% Pure Code** | Instant (5ms), zero hallucination, zero API costs, 100% reliable. |
| **Spaced Repetition & Day Limits** | **100% Pure Code** | Strict mathematical rules (70% new, 15% reviews, 15% buffer). |
| **Weekly Review Summary** | **Lightweight AI** | Personal coaching feel, high motivation. |
| **Failed Problem Takeaway** | **Lightweight AI** | Micro-insights attached to review cards. |
| **Job Description $\rightarrow$ Plan Preset** | **AI (Role Analyzer)** | Bridges the two systems automatically. |
| **Solved Problems Import** | **API Automation** | Eliminates manual ticking on day one. |

**Recommended roadmap:** Build **Version 1 with pure code** (Phases 0–7 as currently planned). Then, in **Version 1.1**, add the AI Weekly Coach and LeetCode sync as delightful enhancements on top of an already indestructible engine!
