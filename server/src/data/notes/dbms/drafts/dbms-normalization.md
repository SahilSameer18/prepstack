---
id: dbms-normalization
title: Normalization
next: dbms-transactions
roadmapSteps: backend:database-design
---

<!-- DRAFT written 10 Nov 2026 from docs/content/source-notes/dbms-batch-a.md (S1 slides ch7: 7.4 to 7.35, 7.55 to 7.73, 7.100 to 7.101; S7 for 2NF and the anomalies; S9 and S4 for the mistakes).
     Not reviewed: no lastChecked. 2NF and the anomalies come from secondary sources (S4, S7) until the outside reader confirms them.
     To publish: outside reader + REVIEW_CHECKLIST.md, add lastChecked, move this file up one folder, delete the old section from dbms.legacy.js. -->

## Overview

Normalization is splitting a table so that each fact is stored once. Interviewers ask about it because it shows whether you understand why a bad design causes insert, update and delete problems, and whether you can name the rule a table breaks. After this section you can spot the anomalies in a table, state 1NF, 2NF, 3NF and BCNF with the dependency each one forbids, split a table without losing information, and explain why BCNF and dependency preservation sometimes conflict.

## Topic: Why normalize: the three anomalies

**Definition:** A table that mixes facts about several things repeats information, and the repetition causes insertion, update and deletion anomalies.

**Why:** Repeated facts can disagree with each other, and facts that live in the same row cannot be added or removed separately.

**Example:** Take staff(emp_id, name, dept_name, dept_building), where emp_id is the key. Insertion: a new department with no employees cannot be stored, because emp_id cannot be NULL. Update: when a department moves buildings, every one of its rows must change, and missing one leaves two different buildings for one department. Deletion: deleting the last employee of a department also deletes the department's building.

**Failure:** Normalization removes repetition but can add joins, so it is not automatically faster. It also does not by itself guarantee data integrity: constraints such as keys and foreign keys do that.

## Topic: First normal form (1NF)

**Definition:** A table is in 1NF when every column holds one indivisible value: no lists, sets or repeating groups in a cell.

**Why:** Lists inside a cell cannot be searched, constrained or joined properly, and they encourage storing the same data twice.

**Example:** student(roll_no, phones) with the cell "98100, 98200" breaks 1NF. The fix is one row per phone: student_phone(roll_no, phone), with {roll_no, phone} as the key.

**Failure:** "Indivisible" depends on how you use the value. A roll number like CS0012 is fine as one value, but if your code takes the first two letters to find the department, you are using it as two values, and the department should be its own column.

## Topic: Second normal form (2NF)

**Definition:** A table is in 2NF when it is in 1NF and has no partial dependency. A partial dependency is a column that is in no candidate key but depends on only part of a candidate key.

**Why:** A partial dependency repeats the same fact on every row that shares that part of the key.

**Example:** enrollment(student_id, course_id, student_name, grade) has the key {student_id, course_id}. student_name depends on student_id alone, so it repeats on every course a student takes. Fix: student(student_id, student_name) and enrollment(student_id, course_id, grade).

**Failure:** A partial dependency needs a key with more than one column, so a table whose candidate keys are all single columns cannot break 2NF.

## Topic: Third normal form (3NF)

**Definition:** A table is in 3NF when, for every non-trivial dependency X → Y, one of these holds: X is a super key, or every column of Y that is not in X is part of some candidate key.

**Why:** It stops a column that is not part of any key from depending on another column that is not a key, which repeats facts.

**Example:** book(book_id, author_id, author_country) has the key book_id. author_id → author_country: author_id is not a super key and author_country is in no key, so it breaks 3NF. Fix: author(author_id, author_country) and book(book_id, author_id).

**Failure:** Many sources shorten 3NF to "no transitive dependency" and leave out the second option, the case where the right side is part of a key. The three-part test above is the exact one, and the second option is what lets a table be in 3NF but not in BCNF.

## Topic: Boyce-Codd normal form (BCNF)

**Definition:** A table is in BCNF when, for every non-trivial dependency X → Y, X is a super key. It is 3NF without the second option.

**Why:** It removes the repetition that 3NF still allows.

**Example:** advising(student, teacher, subject) where each teacher teaches one subject (teacher → subject) and a student has one teacher per subject ((student, subject) → teacher). The candidate keys are {student, subject} and {student, teacher}. The table is in 3NF, because subject is part of a candidate key, but not in BCNF, because teacher is not a super key. The subject is repeated for every student of a teacher.

**Failure:** BCNF is stricter than 3NF, but it can still leave repetition when a row holds two unrelated lists, such as an instructor's phones and children in one table with no dependencies at all. That needs 4NF. And it can lose a dependency, as the next topics show.

## Topic: A split must be lossless

**Definition:** A split of R into R1 and R2 is lossless when joining the pieces gives back exactly the original rows. A test: the columns the pieces share must determine all of R1 or all of R2.

**Why:** A lossy split loses information: after the join you cannot tell which rows were real.

**Example:** emp(emp_id, name, city) with rows (1, Asha, Pune) and (2, Asha, Delhi). Split into (emp_id, name) and (name, city), sharing name. Joining on name gives four rows, two of them invented. Split instead into (emp_id, name) and (emp_id, city): the shared column emp_id determines both pieces, so the join gives back the two original rows.

**Failure:** The word "lossy" is confusing: nothing is deleted, rows are added. What is lost is the ability to know which rows were the original ones.

## Topic: Dependency preservation and the BCNF trade-off

**Definition:** A split preserves dependencies when every dependency can still be checked inside a single table, without joining. If not, enforcing the rule after an update needs a join.

**Why:** Checking a rule inside one table is cheap; checking it across a join on every update is expensive.

**Example:** Split advising into teacher_subject(teacher, subject) and student_teacher(student, teacher). It is in BCNF and lossless, but (student, subject) → teacher cannot be checked in one table any more, because student and subject are never in the same piece. The unsplit table keeps the rule, at the cost of repeating subject.

**Failure:** A lossless, dependency-preserving split into 3NF always exists. A lossless split into BCNF always exists too, but it may not preserve dependencies. So when the two goals conflict, the usual answer is to accept 3NF with a little repetition, or to accept BCNF and give up checking one rule cheaply.

## Questions

### What is normalization and why do we do it?

Splitting a table so each fact is stored once. It avoids the insertion, update and deletion anomalies that repeated facts cause.

### What is the difference between 2NF and 3NF?

2NF removes partial dependencies: a non-key column depending on part of a composite key. 3NF removes dependencies of a non-key column on another non-key column.

### What is the difference between 3NF and BCNF?

3NF lets X → Y pass if X is a super key or Y is part of a candidate key. BCNF only accepts the super key case, so it is stricter, but it may not preserve dependencies.

### What is a lossless decomposition?

A split where joining the pieces gives back exactly the original table. It holds when the shared columns determine all of one piece.

## Mistakes

- Saying normalization guarantees data integrity or faster queries. It removes repetition and often adds joins; integrity comes from constraints.
- Saying BCNF is always better than 3NF. It can lose a dependency, so 3NF is sometimes the better design.
- Saying any split that keeps all the columns is fine. The split must also be lossless.

## Quiz

### enrollment(student_id, course_id, student_name, grade) has the key {student_id, course_id}, and student_name depends only on student_id. Which normal form does it break first?

- [ ] 1NF
- [x] 2NF
- [ ] 3NF
- [ ] BCNF

Explanation: Every cell holds one value, so it is in 1NF. student_name depends on part of the key, which is a partial dependency, so it breaks 2NF.

### book(book_id, author_id, author_country) has the single-column key book_id, and author_id determines author_country. Which normal form does it break first?

- [ ] 1NF
- [ ] 2NF
- [x] 3NF
- [ ] It is in every normal form

Explanation: The key has one column, so there is no partial dependency and 2NF holds. author_id is not a super key and author_country is in no key, so 3NF breaks.

### advising(student, teacher, subject) has teacher → subject and (student, subject) → teacher. Its candidate keys are {student, subject} and {student, teacher}. Where does it stand?

- [ ] It is in BCNF
- [x] It is in 3NF but not in BCNF
- [ ] It is in 2NF but not in 3NF
- [ ] It is not in 2NF

Explanation: In teacher → subject, teacher is not a super key, so BCNF fails. But subject is part of the candidate key {student, subject}, so the second option of the 3NF test holds.

### Which test shows that a split of R into R1 and R2 is lossless?

- [x] The shared columns determine all of R1 or all of R2
- [ ] Each piece has a primary key
- [ ] Each piece has at least three columns
- [ ] The two pieces have the same number of columns

Explanation: If the shared columns determine a whole piece, each shared value matches one row there, so the join cannot invent rows.

### What can a BCNF decomposition fail to keep?

- [ ] Atomic values
- [x] Dependency preservation
- [ ] Primary keys
- [ ] Foreign keys

Explanation: A decomposition into BCNF is always lossless but may split the columns of a dependency across tables, so that rule can no longer be checked inside one table.

## Diagram

```json
{ "kind": "layers", "caption": "Each normal form is stricter than the one above it, so a table in BCNF is also in 3NF, 2NF and 1NF.", "layers": [{ "label": "Any table" }, { "label": "1NF: every value is atomic" }, { "label": "2NF: no partial dependency on a key" }, { "label": "3NF: a dependency X → Y needs X a super key or Y inside a key" }, { "label": "BCNF: every dependency X → Y has X a super key" }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "Splitting a table into BCNF, one violating dependency at a time.", "steps": [{ "label": "Find a dependency X → Y where X is not a super key" }, { "label": "Make one table with X and Y" }, { "label": "Keep the other columns, minus Y, with X, in another" }, { "label": "Check each new table again" }, { "label": "Stop when every table is in BCNF" }] }
```
