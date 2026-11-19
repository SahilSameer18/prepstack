# Role Analyzer benchmark: how to measure whether it is right (19 Nov 2026, updated the same day after research)

**The question:** when a student pastes a resume and a job description, how often is the report right? The score is computed by code and every quote is checked against the resume, so it is *consistent*. This file says how to find out whether it also *agrees with a person* who reads the same two documents. The runner, the statistics, a keyword baseline and a **12-pair starter set** are built and tested; **the labels still need a second human reviewer, and the AI run has not been done.**

## 1. What the research said (and what it changed here)
| Finding | Source | What we did |
|---|---|---|
| **Label reliability matters more than the model.** On the one public resume-job benchmark with graded fit labels, a blind relabelling of 150 pairs agreed only weakly with the dataset (κ = 0.32); a small LLM judge did not significantly beat plain embeddings. The authors recommend unseen-resume splits, reliable labels and simple baselines | [Research Square preprint](https://www.researchsquare.com/article/rs-11697563) (a preprint; the dataset name and licence were not confirmed) | A **keyword baseline** the analyzer must beat, a **held-out split**, and labels reviewed by a second person before any number is quoted |
| LLM-written resume and job pairs exist (RJDB) but are **not human-labelled**; the largest annotated requirement data (18.6k entities from UK job ads) has **no resumes** | [RJDB, arXiv 2311.06383](https://arxiv.org/pdf/2311.06383v1.pdf); [LREC 2022 corpus](https://aclweb.org/anthology/2022.lrec-1.128.pdf) | No public set fits, so we build our own small, labelled set |
| **Small samples need honest intervals.** For counts like 7 of 9 the normal approximation is misleading; a Wilson interval is recommended. Practitioner posts estimate about 200 paired labels for a 95% interval no wider than ±5 points (not peer reviewed) | [DEV post](https://dev.to/maya_andersson_dev/your-llm-as-judge-eval-set-is-too-small-here-is-the-math-2iac); [ICLR 2025 paper on LLM judges](https://proceedings.iclr.cc/paper_files/paper/2025/file/4264ee4376776907c0b87ed70b959585-Paper-Conference.pdf) | Every proportion prints a **95% Wilson interval** |
| **Kappa has limits.** The Landis and Koch bands (0.61 to 0.80 substantial) are heuristics; some annotation work wants 0.67 or more; kappa collapses on skewed labels (resume skills are mostly "missing"); Krippendorff's alpha is the usual choice for three or more raters | [Cohen's kappa overview](https://annotation.academy/glossary/cohens-kappa); [thresholds and criticism](https://aclanthology.org/2026.aacl-long.27.pdf) | Report raw agreement **and** kappa (or alpha for three judges) **with an interval**, and do not rely on a band label |
| For plan-style outputs, research scores **feasibility** and splits failures into **types** (precedence, time, capacity) | [R-ConstraintBench](https://arxiv.org/pdf/2508.15204), [simulation-based plan evaluation](https://arxiv.org/pdf/2506.12421) | Used for the My plan evaluation (see the README "Evaluation" section) |

Gaps in the research: no source gave a complete protocol for resume-job labelling, and none covered how many examples a held-out set needs for prompt tuning. The numbers above are rules of thumb.

## 2. What is measured
| Measure | Meaning | Why it matters |
|---|---|---|
| Requirements found | Of the requirements the judges listed, how many the report mentioned | A report that skips a main requirement misleads |
| Status agrees | The report says met, partial or missing, and the judges agree | The core of the report |
| **Precision, recall and F1 per status** | For met, partial and missing: of the answers given, how many were right (precision); of the labelled ones, how many were found right (recall); and their balance (F1) | A single accuracy hides weak spots such as "partial" |
| **False reassurance** | Report says met, judges say missing | **The worst error:** the student thinks they are ready when they are not |
| False gaps | Report says missing, judges say met | Wastes the student's time and trust |
| Quotes found in the resume | The proof the report quotes is really in the resume | Already enforced by code; this checks the code |
| Score inside the judges' range | The 0 to 100 score falls in the range the judges gave | Sanity check on the arithmetic |
| Spread across repeat runs | The same pair run 3 or more times: how much the score moves | Same input should give a similar report |
| Status flips | A requirement changes between met, partial and missing across runs | Trust |
| By provider | The same numbers for each model that answered | The AI chain has four models; they may not agree |
| **Keyword baseline** | The same numbers for a rule with no AI: "met" if the resume contains the job's own word | The analyzer must clearly beat this to claim it understands evidence |

## 3. The pairs
**The starter set (built).** `server/scripts/samples/benchmark-starter.js` has **12 made-up pairs** (3 strong, 3 partial, 3 weak, 3 tricky) with 90 labelled requirements:
- Strong: React + Node full stack, Java + Spring backend, Android + Kotlin.
- Partial: Django with SQLite for a PostgreSQL job, React without TypeScript, Node + MongoDB with no authentication.
- Weak: a basic Python notebook for an ML engineer job, a C++ DSA student for a Java Spring job, MERN projects for a DevOps job.
- **Tricky:** a Java resume for a **JavaScript** job, a **MongoDB** resume for a **PostgreSQL / SQL** job, and DevOps tools that appear **only in a skills list** with no project that uses them.

**Its labels are drafts.** They were written from the resume text alone, before any analyzer run, but by one person. Every pair says so (`labelStatus`). **A second person must review them** before any result is quoted.
**4 pairs are held out** (one of each kind): do not tune the prompt or the code on them. The other 8 are for development.

**The keyword baseline on this set** (no AI; run it yourself with `npm run benchmark:analyzer -- --baseline-only`, 19 Nov 2026): status agreement **85.6%** (95% interval 77 to 91%), "partial" recall **0%** (it can never say partial; 9 labelled), macro F1 **59.8%**. The analyzer has to beat this, and the real test is the partial class and the tricky pairs. The set is dominated by literal requirements, so it is an easy test; more partial and transferable-evidence cases should be added as it grows.

**Grow it to 30 to 50, then 100 pairs.** Mix about 40% freshers, 30% with 1 to 3 years, 20% career switchers, 10% awkward cases (a job description pasted from a site with extra text, a very long one, an odd layout, a resume that tries to give the AI orders). Resumes only from people who agree, with contact details removed and names replaced; public job descriptions. **Keep real data outside the repository** (for example `C:\prepstack-data\analyzer-pairs.json`) and never commit it. Keep a second held-out group of unseen pairs.

## 4. The labels (the part only people can do)
- 2 or 3 judges, each a developer who has interviewed candidates, working **alone**.
- For every pair, each judge lists the 4 to 12 requirements of the job and marks each **met, partial or missing** from the resume, and gives an overall range for the fit.
- Measure agreement (see section 1: report raw agreement and kappa, or alpha for three judges, with an interval). Where they disagree, talk it through and write the agreed label; keep the disagreement count, because it is also a measure of how subjective the task is.
- A pair's file entry (the starter file shows the same shape):
```json
{
  "id": "switcher-01", "split": "dev", "days": 7,
  "resume": "...text with contact details removed...",
  "jobDescription": "...",
  "judgeScore": [55, 70],
  "requirements": [
    { "match": ["react", "reactjs"], "expected": "met", "importance": "must" },
    { "match": ["docker"], "expected": "missing", "importance": "must" },
    { "match": ["unit testing", "jest"], "expected": "partial", "importance": "nice" }
  ]
}
```
`match` lists the words a report requirement may use for this requirement (whole words, case ignored); the **first** term should be the job description's own wording, because the keyword baseline uses only that term.

## 5. Decide the pass marks **before** running
Suggested (the owner decides, and writes them here before the first run):
- Beats the keyword baseline on status agreement **and** on macro F1, with the intervals not overlapping on the full set.
- False reassurance at most 5%, false gaps at most 10%.
- Status agreement at least 80%; requirements found at least 85%; "partial" F1 clearly above 0.
- Score inside the judges' range at least 70%.
- Mean score spread across repeat runs at most 5 points; status flips at most 10%.
- No provider more than 10 points worse than the best on status agreement.
- The **held-out** result is looked at **once**, after the last change.

## 6. Running it
From `server/` (the baseline needs no AI; the real run uses AI calls and your `.env`; free quota applies):
```bash
npm run benchmark:analyzer -- --baseline-only
```
```bash
npm run benchmark:analyzer -- --split dev --runs 3
```
```bash
npm run benchmark:analyzer -- --split holdout --runs 3
```
- `--data <file>` uses your own labelled pairs; `--set smoke` runs the 7 older made-up pairs; `--only <id>` one pair; `--retries` and `--retry-pause` retry a run that failed. The script allows 75 s per AI call (the live site allows 20 s), skips the preview model unless `EVAL_PREVIEW=1` (it shares a 20-a-day quota with the live site), and prints a **Reliability** line (runs that answered out of runs attempted). Accuracy numbers cover only the runs that answered.
- `EVAL_MODEL=<model>` changes the first model tried. Run once per model you care about; the answering provider is recorded for every run and the report prints the numbers per provider.
- Raw results go to a temporary folder (the path is printed). Keep the numbers you decide on in `docs/research/analyzer-benchmark-results.md` (counts and intervals only, no resume text).
- Budget: 12 pairs x 3 runs = 36 calls, fine for the free tier. 100 pairs x 3 runs = 300 calls takes more than a day; run in batches and keep `--pace` at 4500 ms or more.

## 7. After the run
- Read the worst cases by hand: every false reassurance, every pair where runs disagree, every tricky pair.
- Decide what to change (the prompt, the requirement count, how "partial" is judged) using the **dev** pairs only, then run again. Look at the **holdout** result once.
- Put the headline numbers (with intervals) in the README's Evaluation section, with the dataset size and how it was labelled.

## 8. Limits
- Judges are people: two good judges can disagree. Report the agreement, not only the score.
- 12 pairs (about 90 requirements) gives a status-agreement interval about 15 points wide; it finds systematic problems, it does not give a precise accuracy. About 200 labelled pairs are needed for a narrow interval.
- The check compares the report with the judges' labels, not with who actually got hired.
- Models change and input drifts; re-run after any model or prompt change, and re-sample the labelled set from time to time.
