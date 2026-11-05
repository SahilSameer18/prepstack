The 7 levers, in order of impact

1. Real users and measured outcomes (biggest jump)
A project with 300 real users and retention numbers outranks a more complex project with none.

Launch to your college, placement groups, and r/developersIndia, Discord, and LinkedIn during placement season.
Track the section 13 metrics: activation, second-incident rate, solve rates, hint usage.
Put real numbers in the README: “412 users, 38% solved a second incident, median solve time 11 min.”
Collect 5 to 10 testimonials or “I got asked this in my interview” stories.

This alone can lift it a full point.

2. Make DebugLab content the moat
The engine is clever, but the incident library is what competitors can’t copy quickly.

Go past 4 to 10+ incidents, but only if solve and retention numbers justify it.
Add a second track beyond Node concurrency: SQL and indexing, REST and auth bugs, and React state bugs (stale closures are a classic interview topic).
Add a “fix it, then explain it” step: users write one sentence on the root cause and compare it to the post-mortem.
Credit real post-mortem patterns without claiming any company runs this format.

3. Close the loop with adaptive personalization
This is what makes it a platform rather than a bundle:

The analyzer finds the skill gaps, the plan includes specific DebugLab incidents and DSA problems, and the dashboard shows gap closure over time.
Re-run the analysis after 2 weeks and show the match score change.
Add spaced repetition for CS notes and failed incidents (“you missed the listener leak 5 days ago, retry?”).

“Your readiness went from 54% to 71%” is the product story and the demo.

4. Evaluate your AI instead of trusting it
This is the gap I flagged in InForge, and it applies here too.

Build a golden set of 30 to 50 resume and JD pairs and check that the match score is stable across reruns and sensible against human judgment.
Measure how often the skill-gap catalog resolves a gap correctly (precision and recall).
Report the numbers, including where it fails.

Almost no student project does this, so it stands out immediately.

5. Publish the engine as a separate open-source package
The deterministic sandbox (virtual clock, module resolver, test isolation) is genuinely novel for a student project.

Extract it as @prepstack/sim or similar, with docs, unit tests, and a playground.
Write the blog post with the 200-run determinism result and the “busy flag passes the obvious test” finding.
GitHub stars and a Hacker News or dev.to post give you outside validation no README can.

6. Production maturity
Reviewers check these quickly:

CI with tests, lint, and the incident validator blocking merges
Error monitoring (Sentry), uptime checks, and a status page
Accessibility audit with real numbers (Lighthouse, keyboard walkthrough)
Load test of the API with a short results table
Redis for rate limiting if you scale, since in-memory limiters break across instances
Fix the content rights issue: link to the DSA sheets instead of copying them

7. A business angle (optional, but “product” implies it)
You don’t need payments, but show you’ve thought about it:

A free tier plus “college/TPO dashboard” for placement cells (cohort progress, weak areas across a batch). This is a plausible B2B angle.
A one-page “why this exists, who pays, what it costs to run” doc.
What would NOT raise the score
Adding more features before you have users
More languages in DebugLab (Python, Java) too early
Leaderboards without server-side verification
AI feedback on code. It adds hype and risk, and your deterministic tests are the better selling point
A realistic path
Stage	Score
Merge + DebugLab MVP, validator, write-up	8
+ real users with retention numbers	8.5
+ AI evaluation + gap-closure loop	9
+ open-source engine with outside traction + 10 incidents






Backend depth like inforge -

1. Async AI pipeline (the centerpiece)

Move analyzer and project generation off the request path.

POST /analyze returns 202 with a job id, a BullMQ worker does the work, and the client polls /analyze/:jobId.
Job states: queued, active, completed, failed, with retries, jittered backoff, and a dead-letter list for permanent failures.
Concurrency cap tuned to Gemini’s rate limits, and your existing model cascade (3.5 then 3.1) with a small circuit breaker so you stop hammering a failing model.
Idempotency: hash the resume and JD together, so the same input returns the cached report and never double-spends quota. A double-clicked submit creates one job.
Fail-closed: a schema parse failure or timeout produces a clear “couldn’t analyze” state, never a half-baked report.

Measure first: log the current p95 for /analyze and the Gemini 429/503 rate before changing anything. “Moved to a queue because p95 was X seconds and Y% of calls failed” is the interview line, and it only works with real numbers.

2. The AI can propose but can’t invent

Apply InForge’s core invariant to the study plan.

The 10-day plan may only reference real catalog items: actual DSA problem ids, CS note sections, DebugLab incident ids, and seeded resources. A deterministic validator drops anything the AI made up.
Unmatched gaps get no resource, as SkillBridge already does for links, and the plan says so honestly.
Add a test with a hostile AI output (fake ids, injected instructions in the resume text) and show it can’t reach the DB or produce links.
3. Deterministic, explainable scoring

This borrows Evenly’s “every balance explainable” idea.

Readiness score: a pure function over a learning-event history. The score never gets stored. Each number traces back to events (“+4 for solving INC-01, −2 for a hint, +3 for closing the async gap”).
Append-only LearningEvent collection (problem solved, incident run, hint used, analysis done). Dashboard stats derive from it, so corrections never rewrite history.
Spaced repetition: an SM-2-style scheduler as a pure function. Test it with fast-check properties: next interval never shrinks after a success, the ease factor stays within bounds, and results are identical given the same history.

Property tests on a learning algorithm are rare in student projects, and they come straight from your Evenly experience.

4. Race-safe writes

PrepStack’s own earlier report flagged load-modify-save problems, so fix that class of bug.

Use atomic operators: $addToSet and $pull for solved problems, $max and $inc for time and attempts, and solvedAt set only when it’s still null.
Fix the DebugLab bug from the plan: bestTimeSeconds shouldn’t default to null if you use $min.
Version-guarded draft saves: two tabs or devices editing the same incident get a 409 on the stale write, not silent overwrite. This is your Evenly pattern.
Concurrency tests: fire 20 simultaneous requests at each endpoint and assert exactly the expected outcome.
Refresh-token family revocation on reuse, which Evenly already has, so PrepStack’s rotation is no longer a gap.
5. Redis where it earns its place
Rate limiter store so limits survive restarts.
Per-user daily AI quota as an atomic counter with a TTL. This is the cost-control feature that keeps you inside free-tier Gemini limits.
Decide and document fail-open vs fail-closed per use. SkillBridge failed open everywhere. For AI quota, failing closed is better, because an outage shouldn’t mean unlimited Gemini spend. Writing that distinction down is itself interview material.
Watch Upstash’s command quota and keep BullMQ polling settings conservative.
6. Production hygiene
Structured logs (pino) with a request id on every line, and /health and /ready endpoints reporting DB and Redis latency.
Sentry free tier with resume text and code drafts scrubbed from events.
Admin-only job inspection (bull-board or a small route) behind an allowlist, fail-closed like InForge.
Data lifecycle: TTL index to auto-delete stored resume text after N days, saved code in the account-deletion cascade, and a privacy-policy line that matches what you do.
7. Evidence
Test stack: Vitest, supertest, and mongodb-memory-server in replica-set mode if you use transactions (Atlas free tier supports them).
CI: lint, tests, incident validator, npm audit, and gitleaks, blocking merges.
Load test: autocannon or k6 against /analyze and the progress endpoints, with a short table of what broke first.
A tradeoffs doc: why Mongo for this, why polling instead of WebSockets, and what you’d change at 10x users.
Suggested order
Step	Work	Rough time
1	Baseline measurements, atomic write fixes, concurrency tests	3 to 4 days
2	Redis rate limit and AI quota, observability	2 to 3 days
3	BullMQ analyzer pipeline with cache, retries, DLQ, circuit breaker	5 to 7 days
4	Plan validator and hostile-AI tests	2 days
5	Event log, readiness score, spaced repetition with property tests	5 to 7 days
6	Load test, CI, tradeoffs doc	2 to 3 days

DebugLab sits alongside this and still follows the 2-day spike gate.
