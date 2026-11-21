# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

College students (above all final-year students heading into campus placements), early-career engineers, and people switching into a software developer (SDE) job. They have 0 to 5 years of experience and are aiming at MAANG-level and other big product companies. They start in India; the owner's plan is to take the product across India and then worldwide. Many read English as a second language and are not "technical" readers of design or jargon: they need plain words. They open PrepStack in short sessions beside a laptop, with a fixed number of hours a day and a deadline (a placement season or an interview date).

## Product Purpose

A free interview-preparation platform. It turns a person's goal and daily hours into one workable day-by-day plan over curated DSA sheets, CS notes, roadmaps, a behavioral-interview guide, a resume guide, a Role Analyzer (resume against a job description) and AI project ideas. Success means a student knows exactly what to study today and keeps going until the interview.

Planned next, in this order: a debug lab, then an in-browser coding environment (compiler and judge, like LeetCode and GeeksforGeeks) so people can code without leaving PrepStack.

## Positioning

One free, plain-words plan that fits the learner's own hours, over sheets and notes that are checked against their sources. A neighbouring sheet site or notes site gives a list; PrepStack gives the day.

## Operating Context

Free-tier infrastructure today: the client on Vercel, the server on Render (it can be asleep for a while on the first request), the database on MongoDB Atlas. Reading is open without an account (DSA sheets, notes, roadmaps, the behavioral guide); an account is needed to generate and save a plan, save progress and use the tools. The owner works step by step, decides every product question, and runs the seeds and the commits.

## Capabilities and Constraints

- The "Today" screen of My plan is fixed by the owner: today's tasks, the time needed and one big Start button. Nothing else is ever added to it.
- Every fact in educational content comes from a primary source that was actually read, in the owner's plain-words style. Numbers in examples come from scripts or shown arithmetic. Nothing is invented.
- Free today. The owner plans premium features later; what they are is undecided. (The repository rules still say "PrepStack is free" and must be updated when that is decided.)
- A signed-out page never calls a personal API.
- Terms the owner has ruled out: master/slave wording.
- Undecided: which features become premium; pricing; the future debug lab and code environment designs.

## Brand Commitments

The name PrepStack. The owner's ambition is for it to become a recognised brand (India first, then global) once it earns a good response. The owner wants the product to feel like a luxury, premium, million-dollar product, with calm and smooth motion, and wants it NOT to look AI-made or "vibe coded": no generic template look. The owner also finds text cluttered in places: fewer words per screen.

## Evidence on Hand

Real content and data in the repository: 5 DSA sheets with 1,276 problems from published lists (Blind 75, NeetCode 150, Striver SDE, Striver A2Z, Love Babbar), CS notes in 5 subjects with checked sources, 9 roadmaps, 50 behavioral questions, a resume guide. There are no customers, testimonials, press, usage numbers or reviews yet: none may be invented or implied.

## Product Principles

1. Plain words first: easy language a non-technical reader can follow, with the technical term kept and explained.
2. One thing at a time: each screen and card carries one idea; fewer words, more space.
3. Honest: no invented numbers, quotes, progress or claims, and no pretending the server is faster than it is.
4. Calm focus: today's work stays small and unmistakable; effects never compete with the task.
5. Open to read, account to keep: learning material is free to read; saving and generating need a login.

## Accessibility & Inclusion

Readable at small sizes and in plain English for second-language readers; touch targets of at least 44 px; text contrast of at least WCAG AA; reduced-motion respected everywhere; usable on a phone.
