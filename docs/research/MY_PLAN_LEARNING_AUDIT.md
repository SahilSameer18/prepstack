# My Plan: learning research and output audit

Date: 23 November 2026. Application snapshot: `4d93596`.

Status: the owner approved Phase 1 on 23 Nov 2026; it is now implemented (close-out below). Phase 2 remains proposed. Sections 3–6 preserve the pre-change research and output evidence at `4d93596`, not a description of the current implementation. Placement students and working professionals receive equal priority, as requested by the owner.

## 1. Recommendation

Keep the deterministic scheduling engine. Improve the learning units it schedules, the evidence it uses to adapt, and the explanations it gives when a goal does not fit. A wholesale rewrite or an AI-generated timetable is not justified by this audit.

The largest opportunity is to connect four things: a small learning objective, an appropriate exercise, a later check without the answer visible, and a specific response when that check fails. Scheduling minutes and recording ticks are necessary parts of this system, but do not establish that a learner can apply the skill independently.

The existing product has useful foundations: curated material, budgeted study time, review ladders, result reporting, weak-topic summaries, sheet progress, change previews and recovery. Several improvements can reuse content already written in `client/src/data/roadmaps.js`.

## 2. Method and evidence boundaries

- Reviewed the current generator, adjustment/review logic, validators/model, preview/save controllers, catalog exporter, builder controls, study/review screens and existing scenario checks.
- Collected an 18-entry source register below: research, official guidance/tool documentation, seven first-person preparation discussions, and one creator-maintained preparation repository. Access depth is recorded. Indexed abstracts are distinguished from full text.
- Read the problems described in the original forum posts; comments are not treated as expert recommendations. This is a purposive sample chosen to investigate failure modes. It cannot establish how common a problem is, represent all students, or support a percentage of students who experience it.
- Added a read-only output matrix of 1,512 generated plans using the real catalogs. Counts describe this matrix, not the user population. Duplicate pedagogical behavior across paces is expected when a roadmap contains no DSA problems.
- Existing 5,000-case invariant results and 553-request disposable API journeys remain separate evidence. An invariant pass is not a learning-effectiveness result. The earlier approximate 80/100 judgment is not a measured accuracy score and should not become a product claim.
- No external accounts were contacted, private data collected, production database accessed, curriculum published, or application code changed. No competitor subscription was purchased and no fresh authenticated competitor-output benchmark was performed.

## 3. What learners describe, and what it means for the product

The following reports are qualitative signals, not prevalence estimates. Each proposed response is an inference to test in PrepStack.

| Learner problem | First-person evidence | Existing support | Proposal to discuss |
|---|---|---|---|
| Syntax familiarity does not translate into solving even an Easy problem | U1 describes being unable to turn an idea into code | Difficulty estimates, sheets, slower pace | Offer a foundation check and a worked-example-to-independent-exercise route; slower minutes alone are not instruction |
| Many solved problems do not establish performance on unfamiliar variants | U2 describes difficulty with unseen Medium problems despite repeated practice | Result labels, optional revision, mocks | Distinguish familiar recall from an unfamiliar application check; avoid equating solve count with readiness |
| A working day competes with applications, family and recovery | U3 describes insufficient time for applications and preparation | Per-day hours, rest, lighter days, pause/rebuild | Make trade-offs explicit; optional application/project tasks must consume the same budget rather than create hidden extra work |
| Weekend-only study can leave material forgotten before the next session | U4 reports this pattern | Weekend-only schedules and review ladder | Respect zero-hour weekdays; propose an optional small review allocation only if the learner chooses it |
| A placement student cannot identify the most important gap | U5 reports uncertain fundamentals and confidence in AI-assisted projects | Goal choice, known topics, weak-topic summaries | Use a short optional evidence check and project explanation, rather than infer competence from tool names or a completed project |
| Exams reduce usable preparation time while DSA, CS and development compete | U6 describes this combination | Lighter days, pause, explicit omissions, sheet choices | Explain what the remaining budget supports; optional placement requirements such as aptitude need explicit scope, not a universal assumption |
| New learning consumes the effort needed for revision | U7 describes growing revision backlog and fatigue | Review room, failure priority, recovery | Differentiate quick recall from full re-coding; reduce new work when repair needs more time, without silently abandoning curriculum |

The recurring product question is: **what should this person do next, why, and what evidence will show that it helped?** A longer checklist does not answer that question by itself.

## 4. What the learning evidence supports

These are design implications, not claims that a paper validated PrepStack.

- **Instruction should connect to application.** R1 recommends alternating worked examples and problem solving; R2 investigated explicit subgoals in introductory programming. R2 found benefits on formative quizzes and fewer failures/withdrawals, but not higher mean exam performance. It was a classroom quasi-experiment, not proof that arbitrary smaller tasks improve interview performance.
- **Recall needs to be an activity, not a completion label.** R4 reports benefits from retrieval in science-text learning. R6 finds that transfer depends on the training and test conditions. Our inference: include explanation and unfamiliar application checks; repeating the same answer is insufficient evidence of flexible skill.
- **Spacing is useful; our exact intervals are still product defaults.** R5 shows an interaction between review spacing and the intended retention interval in fact learning. It does not establish the best coding-review ladder, a universal daily percentage, or an ideal three-minute review.
- **Programming-specific evidence exists.** R3 describes a spaced/interleaved practice tool in an introductory Python course, including scheduling topics rather than only repeated questions. Its reported relationship with exam grades is observational; we must not turn that association into a promised PrepStack improvement.
- **Interruptions have a resumption cost.** R7 investigated programming task recovery and cues. Our inference: split tasks should have a useful stopping point and a short next-step cue, rather than only a fraction number. This is not evidence for one universal minimum session length.
- **Interview performance includes more than selecting the algorithm.** R8 explicitly discusses problem solving, design, implementation and testing. A mock should prompt explanation and edge-case checks, not merely add two problem links.
- **Adaptive memory algorithms are candidates, not automatic upgrades.** R9 describes review-history-based optimization; R10 models language-learning recall from learner data. These support investigating event-based adaptation. Neither proves that FSRS or a language model transfers unchanged to coding competence.

## 5. Fresh output matrix

Data: `data/my-plan-learning-matrix-2026-11-23.csv`. Read-only runner used during this audit: ignored `.tmp/planner-learning-matrix.cjs`. Full local JSON: ignored `.tmp/planner-learning-matrix.json`.

Inputs: every one of the nine roadmap slugs and five sheet slugs; six hour profiles; 4, 8, 12, 26, 40 and 52 weeks; faster/standard/slower pace. Start: 23 Nov 2026. Style: one-topic. Sheet cases use the placements goal and OS/DBMS/CN/OOP; roadmap cases use the role goal and their linked material. No solved/known work or lighter ranges are supplied in this matrix; those interactions belong to the earlier scenario/API runs.

| Profile | Monday–Friday hours each | Saturday | Sunday | Rest day |
|---|---:|---:|---:|---|
| half-hour | 0.5 | 0.5 | 0.5 | Sunday |
| college | 1 | 3 | 3 | Sunday |
| switcher | 1.5 | 3 | 3 | Sunday |
| weekends | 0 | 4 | 4 | None |
| regular | 3 | 5 | 5 | Sunday |
| intensive | 6 | 6 | 6 | Sunday |

Names label assumed budgets, not measured averages for those groups. Rest overrides the Sunday hours. The intensive profile is a stress case, not a recommendation.

The matrix is 14 sources × 6 budgets × 6 lengths × 3 paces = **1,512 outputs**: **972 role plans** and **540 sheet plans**.

| Observation | Count | Interpretation |
|---|---:|---|
| Output exceeds the 600-row save cap | 8 / 1,512 | Additional reproductions of the existing preview/save eligibility defect; not eight new root causes |
| Role plan has no separately scheduled notes/DSA/project practice within its horizon | 126 / 972 | Review flag: the plan can remain a large lesson split into parts throughout |
| First separately scheduled practice is more than 14 calendar days after start | 522 / 972 | Review flag, not a scientifically defined failure threshold |
| First separately scheduled practice is more than 28 calendar days after start | 306 / 972 | Stronger review flag; included in the previous count |
| Estimated syllabus-minute coverage is under 25% | 574 / 1,512 | Often a genuine capacity constraint; not automatically a bad scheduler |

**Definition:** the practice proxy is the first generated DSA item, notes item or `project:` item. A roadmap lesson links to a page that itself contains exercises and checkpoints. This metric does **not** establish that a learner performs no practice while reading that page. It establishes that the schedule does not explicitly bring that practice forward. Missing-practice cases are excluded from the two delay counts, not treated as zero delay.

Representative 12-week, standard-pace role outputs:

| Roadmap | College profile: days until first explicit practice | Switcher profile: days until first explicit practice |
|---|---:|---:|
| Frontend | 12 | 9 |
| Backend | 16 | 12 |
| Full stack | None within plan | 67 |
| Android | 50 | 38 |
| Data analytics | 16 | 12 |
| Machine learning | 47 | 36 |
| DSA | 32 | 24 |
| Java/Spring | 63 | 47 |
| DevOps/cloud | 26 | 19 |

For the college DSA profile, the first step occupies 28 sessions through 24 Dec and the first DSA problem appears on 25 Dec. These are calendar offsets, not hours of theory required by research.

## 6. Confirmed implementation findings (pre-Phase-1 baseline)

| ID | Finding and evidence | Classification | Recommended response |
|---|---|---|---|
| F1 | Public preview does not check the 600-row save cap that creation and the model enforce. Earlier real API reproductions returned preview 200 and save 422 for 662/819 rows. | Functional defect, high | Shared save-eligibility rules and an explicit preview explanation; preserve anonymous preview privacy and account-progress semantics |
| F2 | The builder exposes study style for role plans, but one-topic and mixed generated identical item arrays for all nine roadmaps at 26 weeks / 3 hours daily. The role branch does not call `sequenceItems`. | Ineffective exposed setting, medium | Hide/explain the option for role plans until a prerequisite-safe mixed policy is designed; do not shuffle roadmap steps indiscriminately |
| F3 | Roadmaps already have `goal`, `topics`, `checkpoint` and resources; the catalog exporter retains only ID/title/time/practice/project. The generator schedules one broad learning block per step. | Learning-unit quality gap, high | Reuse existing objectives and checkpoints to define actionable milestones and integrate existing practice earlier |
| F4 | Pace multiplies DSA difficulty minutes. It does not diagnose programming knowledge or skip mastered roadmap foundations. `knownTopics` is DSA-topic exclusion, not a general role-skill assessment. | Personalization boundary | Offer optional foundation/skill evidence before changing the learning path; preserve manual overrides |
| F5 | DSA estimates use Basic 30 / Easy 40 / Medium 70 / Hard 120; notes use reading × 3 + 5 quiz minutes; roadmap learning uses the midpoint of its range, with a separate 120-minute project. | Uncalibrated estimates | Display estimates honestly; distinguish learning and practice effort; check whether roadmap estimates already include practice before changing totals |
| F6 | All due-review views use three minutes. Notes reviews reopen the same five-question quiz; failed DSA recall can offer optional re-coding. | Review-mode and assessment limitation | Distinguish short recall, notes quiz and substantial repair. Do not describe an optional full re-code as fitting a three-minute review slot |
| F7 | Result-dependent ladders and weekly weak-topic reasons exist, but there is no complete per-attempt history in the plan model. | Feedback-data limitation | If adaptation is approved, define a minimal attempt record and retention policy first; completion timestamps cannot reconstruct actual study duration |
| F8 | Generated mocks are Saturday-only for non-role plans, starting at week four when Saturday has at least two hours. Role plans get none through this path; generated behavioral tasks are big-tech-only. | Goal/availability coverage limitation | Discuss role-appropriate rehearsal and flexible mock days; a learner with Saturday rest should not lose all rehearsal opportunities if another day has room |
| F9 | Mock selection uses two distinct unfinished core problems and prefers different difficulties. It does not establish a held-out unfamiliar transfer assessment. | Assessment limitation | Separate practice mocks from readiness checks, and include reasoning, tests and trade-offs appropriate to the target role |
| F10 | Existing invariants mostly validate scheduling/accounting. They do not evaluate the specificity of a lesson, unfamiliar transfer or estimate calibration. | Evaluation gap | Add independent quality criteria, representative human-reviewed schedules and stable regression examples |
| F11 | Tight sheet plans preserve broad coverage floors (one problem per DSA group, three sections per chosen CS subject when capacity permits). This is an existing owner-approved policy, not a measured novice learning strategy. | Breadth/depth trade-off | Discuss a foundations-first versus broad-revision policy only after defining learner needs; do not silently replace the approved floors |

Relevant code: `server/src/modules/plan/{planGenerator,planAdjust,plan.controller,plan.model,plan.validators}.js`, `server/scripts/build-plan-catalogs.js`, `client/src/data/roadmaps.js`, `client/src/components/plan/{PlanBuilderForm,PlanPreview,StudyStart,StudyReview}.jsx`, `client/src/utils/studyPlan.js` and `server/test/helpers/plan-scenarios.js`.

There is no demonstrated reason here to remove pause/resume, canonical problem identity, deadline extensions, preview consent, read-only history or the existing Today layout.

The separate style probe used all nine roadmaps at 26 weeks, three hours every day with Sunday rest, no extra subjects, no prior progress and the same start date. Comparing the complete generated item arrays for one-topic and mixed returned equality in all nine cases. This is a reproducible no-effect result, not an assertion that every valid style must produce a different schedule on every input.

## 7. Proposed approach and trade-offs

| Approach | Value | Cost/risk | Recommendation |
|---|---|---|---|
| Keep today's rules and only add tests | Low migration cost | Leaves broad lessons and limited skill adaptation intact | Necessary foundation, insufficient by itself |
| Deterministic scheduler + curated milestones + bounded feedback-based changes | Explainable scheduling, reusable content, more specific work and repair | Requires content review, stable identities and clear adaptation rules | Preferred direction for discussion |
| Let an LLM write/replace the whole schedule | Flexible wording and synthesis | Estimates, dependencies, task identities and omissions still need deterministic validation; adds cost and variability | Do not make this the scheduling authority |
| Replace the ladder immediately with FSRS/another learned model | Potential recall personalization | Flashcard success is not coding transfer; existing attempt history is incomplete | Investigate after defining review events and comparing against the current baseline |

Proposed loop: identify the relevant gap → teach a small objective → attempt appropriate practice → check later without the answer → explain and preview the next adjustment. A failure should select a suitable repair task, rather than only push a date or label the learner behind.

Keep Today to its existing items/time/one Start. Put explanations and choices in the builder, Plan, Reviews and task detail. No mandatory timer, new short-interview scheduler, paid feature or broad analytics service is proposed by this audit.

## 8. Two implementation phases to discuss

### Phase 1: trustworthy scheduling and explicit work

1. Resolve preview/save eligibility, including item limits, no-work states and account-specific solved progress. A public preview must remain safe to cache and contain no private progress. Do not simply reject every large anonymous preview and thereby block a signed-in learner whose saved progress reduces the plan below the cap.
2. Clarify/hide ineffective role-style controls. Extend preview/save/change tests with both role and placement counterexamples.
3. Reuse existing roadmap topics, goals and checkpoints for named milestones and earlier explicit practice. Review prerequisite order, effort totals and whether learning ranges include practice; splitting the same number into new labels is insufficient.
4. Preserve old plan identities and completed work. Introduce a content/generation version or an explicit compatible mapping if milestone identities change. An old plan rebuild must not invent new unsolved copies of completed material.
5. Commit the mixed API random walk in the existing test structure. Keep independent accounting checks and test preview-to-save contracts, not just generator output in isolation.

### Phase 2: evidence-based adaptation and preparation quality

1. Add an optional foundation/skill check for both personas. Use weak-topic results and actual demonstrations, not an unexplained experience label as a proxy for skill.
2. Define recall, quiz and repair modes, their budget treatment and the evidence needed to progress. Keep the existing ladder as a measurable baseline while evaluating alternatives.
3. Introduce unfamiliar application checks, project explanations and role-appropriate rehearsal. Schedule them on an available day, with prerequisite and workload checks.
4. Discuss optional low-friction effort feedback and minimal attempt events. Use measured outcomes to adjust estimates within safe limits and through existing previews; do not infer time from elapsed time between page open and completion.
5. Evaluate on held-out tasks and real sessions when available. This is a later measurement step, not a reason to delay the offline fixes above. Keep target scope and omissions explicit, especially when selected material greatly exceeds the budget.

Phase 1 was subsequently approved by the owner and implemented; see section 11. Phase 2 data collection, onboarding and review-policy changes remain proposals for the owner's decision.

The existing depth-level and DSA-lesson proposals should be reconciled with this work, not duplicated in another content system. For unfamiliar assessment, record whether the learner has seen the question before; an exercise absent from their saved sheet progress is not guaranteed to be unfamiliar. An initial assessment can use a clear manual rubric rather than require building an online judge or trusting an AI grade. Proposed outcomes include explaining the approach, implementing independently, checking edge cases and identifying the relevant complexity.

## 9. Audit and acceptance matrix

Retain the existing deterministic/property tests, but cross the following dimensions. A scenario should record expected behavior before output is inspected; otherwise the generator can become its own oracle.

| Dimension | Required scenarios and assertions |
|---|---|
| Starting knowledge | No language fluency; syntax-only novice; strong basics/weak DSA; experienced but rusty; known topic with failed delayed check. Do not treat these as equivalent just because hours match. |
| Target | Campus placement; frontend/backend/full-stack switch; big-tech; DSA-only revision; partial role report. Explain scope differences without claiming unsupported company frequencies. |
| Capacity | 0.5/1/1.5/3/6-hour days, uneven weekdays, weekend-only, Saturday rest, overlapping obligations, no usable time. No impossible default additions. |
| Horizon | 4/8/12/26/40/52 weeks; near/exact/past deadline; no room for full syllabus. Never equate a finish date for selected work with complete readiness. |
| Curriculum | All five sheets/nine roadmaps; huge first step; no exercise refs; known/solved/duplicate items; missing or updated content. No silent identity changes or duplicated minute credit. |
| Reviews | Alone/hints/solution, quiz fail/pass, repeated familiar quiz, failed recall needing re-code, repeated failures, high overdue load, early/same-day submissions. Check repair effort as well as dates. |
| Recovery | Miss 1/3/7/14/30 days; pause before/after due review; resume after deadline; one active plus paused plan; extended deadline. Preserve completed work and honest omissions. |
| Calendar | Late study, UTC± offsets, DST transitions, leap day, changed timezone/rollover and sleeping-tab return. Recorded completion days stay stable. |
| Mutation order | Tick then sheet sync; substitute then rebuild; partial solve then deadline change; merge report then pace/hours change; untick after review. Check invariants after each successful and refused operation. |
| Concurrent/failing operations | Duplicate clicks, two devices, stale preview, simultaneous review/tick, database write failure, source change between preview and apply. Failed actions must not lose work. |
| Human-readable output | Clear next objective, usable material, a specific completion/checkpoint, visible omitted scope, attainable practical work. A title repeated 20 times is a review flag even when all arithmetic passes. |

Non-negotiable technical gates: zero unexplained loss of completed work, false full-completion credit, ownership leaks, duplicate action identities or silent data-changing failures in the tested scenarios. A high average score must never hide these failures.

Track separate measurements instead of one invented accuracy percentage:

- Scheduling-rule pass rate and critical-failure count, with exact tested inputs.
- Preview/save agreement after classifying intentional account-state/progress differences.
- Time to first meaningful explicit practice and quality of the objective/checkpoint, reviewed against prerequisites. A first-week target is a proposed product target, not a research-proven universal deadline.
- Familiar recall versus unfamiliar application performance.
- Estimate calibration by task type and learner, with sample count and variability; initially use manual observations or optional feedback if approved.
- Return and successful recovery after missed work; completion alone can reward an easy plan that teaches little.

## 10. Source register

Accessed 23 Nov 2026. Notes paraphrase the source; they do not copy teaching material. Source-specific limitations apply throughout this document.

| ID | Source and access depth | Relevant evidence and boundary |
|---|---|---|
| R1 | [IES/WWC: Organizing Instruction and Study](https://ies.ed.gov/ncee/wwc/PracticeGuide/1), recommendations read | Separates evidence levels for spacing, example/problem alternation, quizzes and explanation. General educational guidance, not a coding-planner trial. |
| R2 | [Margulieux, Morrison & Decker, 2020](https://link.springer.com/article/10.1186/s40594-020-00222-7), abstract, study context and limitations read | Programming subgoals study; benefits and lack of mean exam improvement both matter. Groups were not individually randomized. |
| R3 | [YeckehZaare, Resnick & Ericson, ICER 2019](https://doi.org/10.1145/3291279.3339411), indexed publisher abstract read; direct full text blocked | Programming-specific spaced/interleaved practice tool. Observational association with grades is not a causal effect or a PrepStack forecast. |
| R4 | [Karpicke & Blunt, 2011](https://pubmed.ncbi.nlm.nih.gov/21252317/), indexed abstract read; direct page incomplete | Retrieval versus concept mapping in science learning. Does not establish optimal interview-prep task timing. |
| R5 | [Cepeda et al., 2008, author institutional record](https://digitalcommons.usf.edu/psy_facpub/1766/), abstract read | Spacing interacts with the intended retention horizon. Fact-learning results do not validate exact coding intervals. |
| R6 | [Pan & Rickard, 2018](https://pdf.retrievalpractice.org/transfer/Pan_Rickard_2018.pdf), abstract and selected methods read | Transfer from testing depends on conditions. We did not reanalyze its data or claim a coding-specific effect size. |
| R7 | [DeLine & Parnin, CHI 2010](https://www.microsoft.com/en-us/research/publication/evaluating-cues-for-resuming-interrupted-programming-tasks/), official research summary read | Task-resumption cues studied with programmers; supports investigating context cues, not a guaranteed effect on students. |
| R8 | [Microsoft Careers: Technical interviewing](https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing.html), guidance read | Problem solving, design, coding, testing and explaining complexity. Employer guidance, not universal hiring criteria. |
| R9 | [FSRS4Anki tutorial](https://github.com/open-spaced-repetition/fsrs4anki/blob/main/docs/tutorial.md), optimization/evaluation sections read | Parameters and evaluation use review histories. This audit did not implement or benchmark FSRS. |
| R10 | [Settles & Meeder, ACL 2016](https://research.duolingo.com/papers/settles.acl16.pdf), abstract and introduction read | Trainable recall model fitted to language-learning data. Its reported gains must not be promised for coding preparation. |
| U1 | [Beginner struggles with Easy problems](https://www.reddit.com/r/leetcode/comments/1qcq8my/leetcode_beginner_even_easy_problems_feel_hard/), original post and sampled comments read | Individual report of difficulty translating syntax/logic into a solution. |
| U2 | [Repeated practice but inconsistent unfamiliar Mediums](https://www.reddit.com/r/leetcode/comments/1gpz9gq/completed_300_problems_still_cant_solve_mediums/), post and sampled discussion read | Individual report separates familiar solutions from unseen variants. No population success rate inferred. |
| U3 | [Working professional balancing applications and study](https://www.reddit.com/r/leetcode/comments/1ifzgsv/people_who_are_working_how_do_you_manage_time_for/), original post and sampled comments read | Competing obligations; comments include extreme routines, which are not adopted as advice. |
| U4 | [Weekend preparation and forgetting](https://www.reddit.com/r/leetcode/comments/1jmiuio/balancing_work_and_interview_prep/), original post and sampled comments read | Individual experience with long gaps and full-time work. |
| U5 | [Placement student uncertain about skill and AI-assisted projects](https://www.reddit.com/r/developersIndia/comments/1u85grv/final_year_student_placements_have_started_and_i/), original post read | Self-described gap between familiarity and independent implementation. |
| U6 | [Exams, lost DSA momentum and competing placement subjects](https://www.reddit.com/r/PlacementsPrep/comments/1ry09do/tier_3_college_placements_in_julyaug_lost_dsa/), original post read | Individual account of workload and prioritization needs. No claim about all colleges or employers. |
| U7 | [Revision while completing the SDE sheet](https://www.reddit.com/r/LeetcodeChallenge/comments/1uxr99i/how_did_you_guys_manage_revision_while_completing/), original post and sampled comments read | Individual accounts of revision backlog and recognizing approaches. |
| C1 | [Tech Interview Handbook, creator repository](https://github.com/yangshun/tech-interview-handbook), README read | Creator recommends consistent practice and pattern understanding. Live planner pages were blocked, so no fresh output or pricing comparison is claimed. |

Some Nature, Amazon, Tech Interview Handbook and short Reddit URLs could not be fully fetched. Accessible alternatives are identified above. Search-only leads and inaccessible full texts were not silently counted as fully reviewed studies. No claim is made that this is a systematic literature review of every relevant publication.

## 11. Phase 1 close-out, 23 Nov 2026

F1–F3 and the permanent API regression gap in F10 are addressed: previews explicitly report shared save eligibility, a separate private endpoint includes owned progress without public caching, the ineffective role-style choice is removed, and new role plans schedule topic-specific learning/example practice/checkpoints. Role plans store a curriculum snapshot and generation version; legacy plans retain their original task shape. A newly reproduced split-skip bug was also fixed: completed parts remain completed when the remainder is skipped.

The new milestone activities share the original lesson estimate, so subdivision adds no hours. Introduction, short practice and checkpoint allocations are explicit planning assumptions. Standalone notes/problems/projects keep their previous estimates. Vite setup and virtual-environment setup are capped at 90 minutes, with the remaining estimate assigned to the other topics; tool setup no longer receives the same multi-hour share as learning React or Python. Phase 2 calibration is still needed.

All nine roadmap orders were reviewed against their basic dependencies. Frontend, Android, data analytics and DevOps retained their overall step order. Backend now states the JavaScript prerequisite. Full stack teaches Vite setup first and moves security before deployment. Machine learning introduces training/test separation before preprocessing and moves evaluation before deep learning. Java language basics precede object-oriented details. Recursion/backtracking now precedes trees/heaps/graphs in DSA, and generated sheet topic order follows the updated catalog. Focused dependency tests cover every roadmap; sources are in `docs/content/SOURCES.md`. This is an ordering review, not a new live check of every external resource or a claim that all alternative sequences are wrong.

The repeated matrix still contains 1,512 inputs, with 972 role outputs. With explicit `activity` fields included in the practice proxy, no sampled role output lacks scheduled practice or waits more than 14 days. For the college and switcher profiles at 12 weeks, all nine roadmaps now first schedule short example practice after two and one calendar days respectively. This is an improvement in explicit scheduling, not a measured increase in competence; example practice is different from solving a full unseen DSA problem.

Storage remains bounded at 600 rows. Twelve outputs in the new matrix exceed that limit, versus eight before the change. The four additional cases are long DSA-roadmap plans whose more detailed tasks need more records. They are now explicitly blocked before save, rather than offered as saveable. Supporting larger plans without losing detail requires a separate storage/performance decision; no limit was silently raised and no curriculum was silently dropped to evade it. Low coverage in tight budgets remains honest, and some packing gaps increase when lesson order is protected.

Verified: full server 1,160 tests, client 217, build/lint/SEO, 5,000 seeded scenarios, 314 mixed API requests, follow-up matrix and four in-memory mutations. Browser results and the initial timeout/rerun details are in `TESTING.md`. No deployment or new Phase 2 assessment/data-collection system was performed.
