# Student check: a two-week test of My plan with real people (kit, 19 Nov 2026)

**Why:** everything so far was tested by code and by the owner. Nobody outside has used My plan end to end, so we do not know whether it is the differentiator we think it is. This check is small on purpose: **5 students or switchers, two weeks, watched closely**. Five people who are watched teach more than fifty who are not.

## 1. Who
- 3 to 5 students preparing for campus placements (pre-final or final year).
- 2 to 3 working developers switching to a product company.
- Prefer people with a real deadline in the next 2 to 4 months. People who "might start someday" tell you little.
- Not friends who will be polite. Ask them to be harsh.

## 2. What to tell them (a message you can send)
> I built a free interview-prep planner and I want to know where it fails. Please use it for two weeks for your real preparation. I will watch how it goes and ask you a few questions at the end. It is fine if it is confusing or you stop using it: that is exactly what I want to learn. I will only look at counts (tasks done, days active), not your notes.

Tell them: what is stored (their plan and progress), that you will look only at counts, and that **they can delete their account at any time** (Profile, Delete account) and everything is removed. Do not ask for passwords. Each person makes their own account.

## 3. The protocol
| When | What you do |
|---|---|
| **Day 0 (20 minutes, call or in person)** | Share the link. Say nothing else. Watch them go from the home page to a saved plan **without helping**. Write down every hesitation, wrong click and question. Stop at 10 minutes of being stuck and note where. |
| **Day 1** | A single message: "Did you start?" Do not explain anything. |
| **Day 3** | A message: "How is it going? What is annoying?" Write the answer down word for word. |
| **Day 7** | Run the report (section 5). A 10-minute call: what did you do, what did you skip, why. |
| **Day 14** | Run the report again. A 20-minute interview (section 6). |

Rules for you: do not explain features, do not fix their plan for them, do not defend the product. If they are confused, that is the result.

## 4. Decide the success rules **before** you start
Write your thresholds here now, so you cannot move the goalposts later. Suggested:
- **Onboarding:** at least 4 of 5 reach a saved plan within 10 minutes with no help.
- **Use:** at least 3 of 5 complete half of the tasks planned for week 1.
- **Return:** at least 3 of 5 are active in week 2 (a task done on at least 3 different days).
- **Recovery:** of those who miss 2 or more days, at least half come back and use pause, rebuild or lighter days, or simply carry on, instead of quitting.
- **Trust:** at least 3 of 5 say the finish date and daily time felt realistic.

## 5. The numbers (a read-only script)
From `server/` (the script loads your `.env` itself, reads the database and prints counts only, never emails or passwords). It takes the usernames of the participants:

```bash
node scripts/student-check-report.js username1 username2 username3
```

It prints, for each person: when the plan was made, tasks planned and done, tasks done in the last 7 days, number of different days with a task done, reviews done, tasks skipped or moved, paused or finished plans, and the last time a session was active. Save the output for day 7 and day 14 in this folder (`docs/research/student-check/`) so the two can be compared.

## 6. The day-14 interview (ask these, write the answers word for word)
1. In your own words, what is PrepStack for?
2. What did you do the first time you opened it? What was confusing?
3. Show me what you did yesterday. Was the amount of work for the day right?
4. Did you ever feel behind? What did you do about it? (Did you find pause, rebuild, lighter days?)
5. Which part did you use most? Which part did you never open?
6. What did you use instead of PrepStack for the same job (LeetCode lists, a spreadsheet, ChatGPT, nothing)? Why?
7. Was anything wrong or untrustworthy (a date, a time estimate, a note)?
8. If PrepStack disappeared tomorrow, what would you miss? Would you be annoyed or relieved?
9. Would you tell a friend to use it? What would you say?
10. What is the one thing you would change first?

## 7. After the two weeks
- Put the numbers, the answers and your decisions in `docs/research/student-check/RESULTS.md`.
- For every problem found, write: who hit it, what happened, and a proposed fix. Fix the ones that stopped someone from using it before adding anything new.
- Decide, using the rules in section 4: **keep going as planned**, **change the product**, or **drop a part**. The owner decides; record the decision and the reason.

## 8. Limits of this check
Five people cannot prove anything statistically. They show where the product fails and whether the idea is wanted at all. A good result is a reason to try with more people, not proof.
