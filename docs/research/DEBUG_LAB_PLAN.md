# SDE Interview Formats by Company: Debugging, Code Review, Optimization and AI-Assisted Rounds

*Research compiled 24 Nov 2026. Evidence level is marked for each claim.*

**Evidence key**
- **Official**: stated by the company itself (careers page, engineering blog, spokesperson)
- **Press**: reported by news outlets from internal documents
- **Candidates**: anonymous candidate reports, prep sites and forums only. Treat as indicative, not guaranteed.

> Formats change fast and vary by role, level, team and country. Always ask your recruiter which rounds allow AI and what environment is used.

---

## 1. AI allowed or required (company-confirmed)

| Company | Format | Evidence |
|---|---|---|
| **Meta** | AI-enabled coding round replaced one of two onsite coding rounds (from Oct 2025). About 60 min in CoderPad with multi-file code and an AI chat panel. Phases: bug fix, then feature, then optimization. One classic no-AI coding round remains. | Press, confirmed by Meta |
| **Google** | Pilot "code comprehension" round (from mid-2026): read, debug and optimize an existing codebase with Gemini. Junior/mid-level roles on select US teams. | Press, confirmed by a Google spokesperson |
| **DoorDash** | 60-min AI-assisted working session on your own machine/IDE, replacing traditional coding rounds. A separate debugging round also exists, and one report says no AI is allowed in it. | Official (careers blog) |
| **Canva** | AI-assisted coding round replaced the CS Fundamentals round (June 2025) for backend, ML and frontend roles. | Official (engineering blog) |
| **Datadog** | AI-assisted coding interviews for certain roles, announced in advance. AI banned in other live coding. A candidate reports a choice between building a feature and code review. | Official (careers page) |
| **Amazon** | Online assessment with a DSA problem plus a repo-based AI-assistant task: fix bugs in a production-style app (MERN, Spring Boot or Django). SDE-2 reports describe a 100-minute section with one traditional and one AI-assisted problem. Proctored. Unsanctioned AI use can still disqualify you. | Candidates (company says it reworked its SDE assessments) |

## 2. AI-assisted rounds reported by candidates only

| Company | What candidates report |
|---|---|
| **LinkedIn** | One "coding with AI" round replaces one of two coding rounds. CoderPad or HackerRank with a built-in assistant. Examples: extend an interval problem in parts; debug and build a maze problem. |
| **Stripe** | An "AI programming exercise" (multi-part, HackerRank with AI chat) alongside the classic Bug Squash and Integration rounds. |
| **Microsoft** | Some loops (CoreAI, GitHub, SDE II, intern finals) have one AI-assisted round, often in VS Code with Copilot. No company-wide format. |
| **Atlassian** | AI-enabled round in HackerRank: plan a feature, then debug or extend an existing repo (Spring Boot/H2/JPA and MERN booking service reported), with Plan/Agent modes. |
| **Rippling** | Any AI tool allowed in phone screen and onsite coding; some candidates get a choice of AI or traditional. |
| **Shopify** | Often listed as AI-friendly with build-a-feature rounds, but **unverified**; one tracker found no Shopify source. |
| **Databricks** | "Vibe coding" round for Solutions Architect/Forward Deployed roles. One Senior SWE report of two AI rounds including feature work in a Java monorepo. |
| **Anthropic** | Secondary sources describe a 60 to 75 minute AI-collaborative coding round. A hiring manager reportedly stopped asking coding questions on his team; this is one team, not a company-wide policy. |
| **OpenAI / Sierra / Cursor** | Secondary source: OpenAI has candidates refactor 100+ lines of messy production-style code; Sierra has them debug agent flows; Cursor gives a day in its production codebase. |
| **Others (1 to 2 reports each)** | Snap, Brex, Ramp, Block, Whatnot, TikTok, Decagon, Instacart, Harvey, Razorpay and JioHotstar appear in one tracker. Thin evidence. |

## 3. Debugging rounds (typically no AI)

- **Stripe, "Bug Squash" / "Bug Bash"**: unfamiliar repository with a failing test or open issue, about 45 to 60 min. Candidates describe cloning a fork of a large open-source project and fixing failing tests. Widely reported as the hardest Stripe round.
- **Stripe, "Integration"**: implement a small feature in an unfamiliar codebase against a provided API/SDK, with docs and internet access.
- **DoorDash, Debugging**: about 50 minutes debugging a service (for example a dasher-assignment service, round-robin or consistent hashing code). Reported as no-AI.
- **Cloudflare**: 45-min debugging round on a working system; one reviewer found it fairly easy.
- **Braze**: debugging interview where you fix failing tests.
- **NEXT (UK)**: code debugging round with a C++ problem.
- **Coinbase**: thin or low-quality evidence of a coding-plus-debugging round on an existing codebase (concurrency and state sync). Verify before relying on it.
- **Flipkart (India)**: some drives include a "find and fix the bug" question instead of pure DSA, mainly backend/QA.
- **Debug then optimize (unnamed company, Glassdoor)**: C++/Java task with logic and runtime bugs (uninitialized variables, off-by-one, memory leaks), then optimize time/space.
- **Older Atlassian code-pairing**: zipped codebase sent before the interview; fix failing tests, add features, then critique efficiency and design.

## 4. Code review rounds

- **Google (engineering managers)**: review a snippet, find bugs, recommend optimizations. Long-standing; candidates can sometimes choose it instead of a coding round.
- **Datadog**: code-review option inside its AI interview (candidate-reported).
- Prep sites say some teams add a pull-request review round next to normal coding. I could not verify specific SDE-level companies beyond this.

## 5. Optimization as a phase

Optimization is mostly a **phase inside** other formats, not a standalone round:
- Meta: phase 3 of the AI-enabled round
- Google: "read, debug, and optimize" in code comprehension
- Amazon OA: bug fixing in a repo, plus optimized DSA solutions
- Datadog: stated preference for simple, performant code

## 6. India-specific formats

- **Machine coding (about 90 min, build a working mini-app)**: Flipkart (signature round), Razorpay (SDE-2+), Swiggy (SDE-2+), PhonePe, Meesho (sometimes), Setu. Typical problems: Splitwise clone, parking lot, flight booking, payment app with cashback.
- **CRED**: 24-hour take-home before live rounds.
- **Amazon India**: AI-assisted repo OA reported for SDE-1, SDE-1 FTC (Spring Boot) and SDE-2.
- **Atlassian India**: AI-enabled round reported for Backend Engineer II (remote, India).

## 7. Reported as not allowing AI (weak signal)

One candidate-report tracker lists Eightfold, Intuit, Airbnb, Apple, Bloomberg and Salesforce as "no AI allowed" (1 to 4 reports each). A figure attributed to Karat says about 62% of organisations still prohibit AI in technical interviews; the underlying survey could not be checked.

---

## What is usually being scored
- Reasoning and hypothesis-forming, not just the final fix
- Verification: running tests, reproducing the bug, small incremental changes
- In AI rounds: specific prompts, critically reviewing AI output, and being able to explain every line
- Communication while working

## Preparation checklist
1. Clone a small open-source repo, spend 15 minutes mapping it, then fix a bug you planted or add a feature.
2. Practice reading failing tests and tracing faults with a debugger or breakpoints.
3. Learn the stacks Amazon-style assessments use (Spring Boot, Django, MERN).
4. For India product companies, practice 90-minute machine coding problems end to end.
5. Ask your recruiter: Is AI allowed in each round? Which tool? Is there a practice environment?

## Gaps in this research
- Not confirmed: Uber, Netflix, Apple, Walmart, PhonePe (AI/debugging), Meesho (AI/debugging).
- Much of the data comes from prep businesses and anonymous posts; only Meta, Google, DoorDash, Canva and Datadog have official or press-confirmed statements.
- Formats may differ by team and level and may have changed since these reports.

---

## Sources
- Meta AI-enabled round: https://dglearning.substack.com/p/inside-metas-new-ai-enabled-coding and https://www.hellointerview.com/learn/ai-coding/overview/introduction
- Google code comprehension: https://www.entrepreneur.com/business-news/google-is-testing-a-new-rule-transform-job-interviews and https://www.finalroundai.com/blog/google-code-comprehension-interview
- DoorDash: https://careersatdoordash.com/blog/doordash-is-rebuilding-its-engineering-interviews-around-ai/ and https://leetcode.com/discuss/interview-experience/7392565
- Canva tracker: https://www.genaidojo.io/guides/companies-using-ai-in-technical-interviews
- Datadog policy: https://careers.datadoghq.com/candidate-experience/interviewing-at-datadog-ai-guidelines/
- Company tracker (evidence tiers, 38 companies): https://aicodinginterview.com/blog/companies-that-allow-ai-in-coding-interviews/
- Amazon OA: https://leetcode.com/discuss/post/8279707/amazon-oa-sde-1-assessment-experience-ne-becb/ and https://igotanoffer.com/en/advice/amazon-online-assessment
- Stripe Bug Squash and Integration: https://www.tryexponent.com/guides/stripe-software-engineer-interview and https://www.teamblind.com/post/why-isnt-stripes-bug-squash-debugging-interview-style-more-widely-used-hkzsddkz
- LinkedIn: https://www.hellointerview.com/blog/linkedin-ai-enabled-coding
- Microsoft: https://www.calibrd.com/interview-prep/microsoft-interview and https://prachub.com/resources/microsoft-ai-assisted-coding-interview-guide-2026-tools-rules-and-scoring
- Atlassian: https://prachub.com/resources/atlassian-ai-assisted-coding-interview-guide-2026-repository-tasks-agent-use-and-values and https://leetcode.com/discuss/post/8585621/atlassian-backend-engineer-ii-interview-uqrkz/
- Databricks: https://nyrion.ai/companies
- Anthropic: https://www.techinterview.org/post/3233474914/anthropic-interview-process-ai-collaborative-2026/ and https://newsletter.pragmaticengineer.com/p/the-pulse-anthropic-kills-the-coding
- OpenAI/Sierra/Cursor: https://www.tryexponent.com/courses/software-engineering/swe-intro/ai-companies-coding
- Cloudflare / Braze / NEXT Glassdoor reviews: https://www.glassdoor.co.uk/Interview/Cloudflare-Interview-RVW72593443.htm, https://www.glassdoor.com.br/Entrevista/Braze-Entrevista-E1879400-RVW29328898.htm, https://www.glassdoor.co.uk/Interview/NEXT-Interview-E7749-RVW56901435.htm
- Google EM code review: https://igotanoffer.com/en/advice/google-code-review-interview
- Flipkart (find-and-fix, machine coding): https://claveprep.com/blog/flipkart-interview-process-2026-guide
- India machine coding (Razorpay, Swiggy, CRED): https://systemcraft.in/companies/razorpay, https://spacecomplexity.ai/blog/swiggy-software-engineer-interview, https://www.aceround.app/blog/razorpay-phonepe-swiggy-cred-interview-india/
- Debug-then-optimize report: https://fr.glassdoor.ca/Entretien/They-gave-a-debugging-task-in-C-or-Java-where-the-code-had-logical-or-runtime-issues—like-uninitialized-variables-off-QTN_8794240.htm




## AGENT SUGGESTIONS

Edits I'd make
Add a "Tier 0: Spot the bug" (static, no execution)
Short code, the learner picks the faulty line and the cause, with an explanation. No runner and no isolation risk.
Ship it before the isolation spike. It's the cheapest way to see whether students use DebugLab at all.
Allow Java and Python here, since your audience's reported OAs use Spring Boot and Django.
Move AI-patch review into the pilot
Add one Warm-up-sized challenge where the learner gets a pre-written, plausible-but-wrong AI diff and must find what breaks.
It uses the same test harness, needs no LLM calls, and covers the AI-allowed formats. Section 1 currently dismisses it as an existing concept, which is true but misses the point: those interviews score this skill.
Add a hosted-sandbox option to the Phase 1 spike
Test Sandpack or a similar hosted iframe against your probe matrix before building your own runner. Record its limits and licensing. If it passes, you skip the riskiest build.
Change the pilot content themes
Replace "wallet race" as the main Incident with everyday bugs candidates actually report: round-robin or consistent-hashing state bugs, a booking-service API bug, and a failing-test repo fix.
Keep the wallet race as a later challenge.
Add a "debugging method" element
A short reproduce, isolate, hypothesize, fix, verify routine shown in hints and the post-mortem, since your simulator has no real debugger.
Fix two small things
Label Amazon "candidate-reported" in Section 1 instead of "could not be retrieved," because the OA format is well covered by candidate posts.
Rework the Section 9 phases to start with Tier 0, and keep the "re-estimate after the spike" rule.
What to leave alone

Sections 3 to 7 and 11 (security, authoring standards, byte limits, draft revisions, release gates) are good as written. Don't trim them, just don't build the heavy parts, such as server drafts and the full telemetry, before the pilot shows demand.


The feature is the right one. The way you plan to build it is heavier than it needs to be.

Why the feature is right
The research shows debugging and code-comprehension rounds at Stripe, DoorDash, Meta, Google, Atlassian, Amazon's OA and others, and the trend is growing.
Most prep sites still teach blank-editor problem solving, and PrepStack already has the planner, reviews and Analyzer that DebugLab can plug into. That connection is something standalone debugging sites don't offer.
It also fits your product philosophy: deterministic code decides, not AI.
Where I'd change the approach

1. Don't start with a custom code runner. Your plan puts a cross-site sandbox and a three-browser security matrix first. That is the most expensive and riskiest part, and you don't yet know if students will use the feature. Start with a static "spot the bug" tier (no code execution), and add real execution only if people use it.

2. Don't make it JavaScript-only. Amazon India's OA is reported as bug fixing in Spring Boot, Django or MERN. Java and Python spot-the-bug challenges match your audience better than a JavaScript simulator.

3. Add the AI angle. Many of the newer rounds allow AI and score how you check its output. A challenge where the learner reviews a plausible-but-wrong AI diff is cheap to build and fits those formats.

4. Use everyday bugs. Candidates report fairly ordinary tasks (round-robin or hashing state bugs, API and booking-service bugs, fixing failing tests), not exotic ones. Base your first challenges on those.

What this means in practice

Build the smallest version first: about 10 to 15 spot-the-bug challenges in Java, Python and JavaScript, with explanations, hints and links into your existing notes. Put it in front of students, then decide whether the heavy runner is worth building.

Your plan's quality bar and security thinking are good, so keep them for the executable tiers. What changes is the order: validate demand before building the hardest part.