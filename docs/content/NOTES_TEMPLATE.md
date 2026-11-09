# Notes template

Every notes section (one topic, for example "Deadlock" in OS) follows this shape. Same shape every time means the page can be built from data, the reading time can be computed, and the analyzer, the roadmaps and the sheet can link to a section by its id.

Written for stage 0 of `IMPROVEMENT_PLAN.md`. The data format (JSON or Markdown files, and how diagrams are stored) is decided in stage 2. This file fixes the **content shape**, which does not change with the format.

## The shape

| Part | Rule |
|---|---|
| `id` | Stable, lowercase, words joined with `-`, for example `os-deadlock`. **Never changed after publishing.** Links from sheets, roadmaps and analyzer advice use this id, not the title. |
| `title` | The name students search for, for example "Deadlock in operating systems". |
| `subject` | One of `os`, `dbms`, `networks`, `java-oop`. |
| Overview | 60 to 120 words. What it is, why an interviewer asks about it, and what the reader can do after this section. |
| Reading time | **Computed from the word count** (about 200 words a minute, rounded up). Never typed by hand. |
| Topics | 4 to 8. Each one has the five parts below. |
| Interview questions | 3 to 5, each with a short model answer (3 to 6 sentences) that a student could say aloud. |
| Common mistakes | 2 to 3 wrong beliefs or wrong answers interviewers hear often, each with the correction. |
| Quiz | 5 multiple-choice questions, 4 options each, one correct, and a one or two sentence explanation for the correct answer. |
| Links | The related sheet topic, the roadmap step ids that use this section, and the next section to read. |
| `lastChecked` | Date (YYYY-MM-DD) of the last accuracy review, see `REVIEW_CHECKLIST.md`. |

### One topic inside a section

1. **Definition:** one or two sentences. No jargon that is not explained in the same section.
2. **Why it matters:** what goes wrong, or what gets slow, without it.
3. **Example:** a small concrete one: numbers, a table, 5 to 15 lines of code, or a step-by-step trace. Never only a description.
4. **How it fails or what interviewers probe:** the edge case, the trade-off, the follow-up question.
5. **Diagram (optional):** only when a picture explains it faster than text (a state machine, a layered model, a timeline). Every diagram has a one-line text caption so it also works for screen readers and search engines.

## Writing rules

- Plain words. A sentence a second-year student can read once and understand.
- Every claim that someone could dispute (a number, a default value, a version, "always" or "never") has a source in `SOURCES.md` before it is published.
- No filler ("In today's world...", "It is important to note...").
- One idea per paragraph. Lists only for real lists.
- Code samples are run before they are published.
- Do not copy text from books or sites. Explain it in your own words; the source is a reference, not a script.

## Skeleton to copy

```md
id: os-example
title: ...
subject: os
lastChecked: YYYY-MM-DD

## Overview
(60 to 120 words)

## Topics
### 1. <name>
- Definition:
- Why it matters:
- Example:
- How it fails or is probed:
- Diagram (optional): <caption>

(4 to 8 topics)

## Interview questions
1. Question: ...
   Answer: ...

## Common mistakes
1. Wrong belief: ...  Correction: ...

## Quiz
1. Question: ...
   A) ...  B) ...  C) ...  D) ...
   Answer: B
   Why: ...

## Links
- Sheet topic: ...
- Roadmap steps: ...
- Next section: ...
```
