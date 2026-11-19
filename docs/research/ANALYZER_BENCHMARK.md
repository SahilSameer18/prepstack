# Role Analyzer benchmark: how to measure whether it is right (19 Nov 2026)

**The question:** when a student pastes a resume and a job description, how often is the report right? Today the score is computed by code and every quote is checked against the resume, so it is *consistent*. Nobody has measured whether it agrees with a person who reads the same two documents. This file says how to find out. The runner and the scoring are built and tested; **the labelled pairs have to come from people.**

## 1. What is measured, and why
| Measure | Meaning | Why it matters |
|---|---|---|
| Requirements found | Of the requirements the judges listed, how many the report mentioned | A report that skips a main requirement misleads |
| Status agrees | The report says met, partial or missing, and the judges agree | The core of the report |
| **False reassurance** | Report says met, judges say missing | **The worst error:** the student thinks they are ready when they are not |
| False gaps | Report says missing, judges say met | Wastes the student's time and trust |
| Quotes found in the resume | The proof the report quotes is really in the resume | Already enforced by code; this checks the code |
| Score inside the judges' range | The 0 to 100 score falls in the range the judges gave | Sanity check on the arithmetic |
| Spread across repeat runs | The same pair run 3 or more times: how much the score moves | Same input should give a similar report |
| Status flips | A requirement changes between met, partial and missing across runs | Trust |
| By provider | The same numbers for each model that answered | The AI chain has four models; they may not agree |

## 2. The pairs (a dataset of 50 to 100)
- **Mix:** about 40% freshers, 30% with 1 to 3 years, 20% career switchers, 10% awkward cases (a job description pasted from a site with extra text, a very long one, an odd resume layout, a resume that tries to give the AI orders).
- **Sources:** resumes from people who agree, with their contact details removed and names replaced; job descriptions that are public. Never use a resume without the owner's permission.
- **Keep the dataset outside the repository** (for example `C:\prepstack-data\analyzer-pairs.json`). It holds real people's information. **Do not commit it.**
- The 7 made-up pairs in `server/scripts/samples/samples.js` are a smoke test, not a benchmark.

## 3. The labels (this is the part only people can do)
- 2 or 3 judges, each a developer who has interviewed candidates. Each works **alone**.
- For every pair, each judge lists the 4 to 12 requirements of the job and marks each **met, partial or missing** from the resume, and gives an overall range (for example 55 to 70) for how well the resume fits.
- Measure agreement between judges (for two judges, Cohen's kappa; below about 0.6 means the labels are too subjective to trust and the requirement should be discussed or dropped). Where they disagree, talk it through and write the agreed label.
- A pair's file entry:
```json
{
  "id": "switcher-01",
  "days": 7,
  "resume": "...text with contact details removed...",
  "jobDescription": "...",
  "judgeScore": [55, 70],
  "requirements": [
    { "match": ["react", "reactjs"], "expected": "met" },
    { "match": ["docker"], "expected": "missing" },
    { "match": ["unit testing", "jest"], "expected": "partial" }
  ]
}
```
`match` lists the words a report requirement may use for this requirement (whole words, case ignored). The runner finds the report's requirement by those words.

## 4. Decide the pass marks **before** running
Suggested (the owner decides, and writes them here before the first run):
- False reassurance at most 5%, false gaps at most 10%.
- Status agrees at least 80%; requirements found at least 85%.
- Score inside the judges' range at least 70%.
- Mean score spread across repeat runs at most 5 points; status flips at most 10%.
- No provider more than 10 points worse than the best on status agreement.

## 5. Running it
From `server/` (uses real AI calls and your `.env`; free quota applies):
```bash
npm run benchmark:analyzer -- --data C:/prepstack-data/analyzer-pairs.json --runs 3
```
- Without `--data` it runs the 7 made-up pairs (a smoke test).
- `EVAL_MODEL=<model>` changes the first model tried. Run once per model you care about; the answering provider is recorded for every run and the report prints the numbers per provider.
- Raw results are written to a temporary folder (the path is printed). Keep the numbers you decide on in `docs/research/analyzer-benchmark-results.md` (counts only, no resume text).
- Budget: about 100 pairs x 3 runs = 300 calls. At the free limits that takes more than a day; run in batches with `--only` or fewer pairs, and keep `--pace` at 4500 ms or more.

## 6. After the run
- Read the worst cases by hand: every false reassurance, every pair where runs disagree.
- Decide what to change (the prompt, the requirement count, how "partial" is judged) and run again on the **same** pairs to see if it helped.
- Put the headline numbers in the README's Role Analyzer section, with the dataset size, and remove the "not measured" limitation only when they are real.

## 7. Limits
- Judges are people: two good judges can disagree. Report the agreement, not only the score.
- 50 to 100 pairs is enough to find systematic problems, not to claim a precise accuracy.
- The check compares the report with the judges' labels, not with who actually got hired.
- Models change; re-run after any model or prompt change.
