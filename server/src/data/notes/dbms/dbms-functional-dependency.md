---
id: dbms-functional-dependency
title: Functional Dependency
lastChecked: 2026-11-10
next: dbms-normalization
roadmapSteps: backend:database-design
---

<!-- Published 10 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date this section was checked against its sources by the author, not by a second person.
     Written from docs/content/source-notes/dbms-batch-a.md (S1 slides ch7: 7.11 to 7.17, 7.38 to 7.54; S9 for coverage).
     Claims and sources: docs/content/SOURCES.md (rows for dbms-functional-dependency). When an outside reader has gone through it, fill the "Checked by" cells of those rows. -->

## Overview

A functional dependency says that if two rows agree on some columns, they must agree on certain others. It is the tool behind keys and normalization, so interviewers use it to check that you can reason about a schema without looking at any data. After this section you can read a dependency, tell a trivial one from a non-trivial one, use Armstrong's rules, compute the closure of a set of columns step by step, and use that closure to prove that a set of columns is a key.

## Topic: What a functional dependency is

**Definition:** X → Y holds on a table design when, in every legal table, any two rows that have the same values in X also have the same values in Y. We say X determines Y.

**Why:** It captures real-world rules, such as "a roll number has exactly one name", that column types cannot express.

**Example:** In student(roll_no, name, dept, hod), roll_no → name holds. dept → hod holds if every department has one head. name → roll_no does not hold, because two students can have the same name.

**Failure:** Direction matters: A → B does not mean B → A. With rows (A, B) = (1, 4), (1, 5), (3, 7), B → A holds on this data because each B value goes with one A, but A → B fails because A = 1 goes with both 4 and 5.

## Topic: Trivial and non-trivial dependencies

**Definition:** X → Y is trivial when Y is already inside X. Every table satisfies a trivial dependency. Otherwise it is non-trivial.

**Why:** Normal-form rules only look at non-trivial dependencies; the trivial ones tell you nothing about the design.

**Example:** {roll_no, name} → roll_no is trivial. roll_no → name is non-trivial.

**Failure:** The rule is about the right side being inside the left side. A → AB is not trivial, because B is not on the left.

## Topic: A dependency is a rule, not a pattern in the data

**Definition:** A dependency has to hold for every legal table, not just the rows you see. A particular table can satisfy it by chance.

**Why:** If you read dependencies off sample data you end up with false rules and a wrong design.

**Example:** If every name in today's instructor table happens to be different, the table satisfies name → ID. That is a coincidence, not a rule, because two instructors can later share a name.

**Failure:** To find the dependencies, ask what the data means ("can two students have the same name?"), not what the rows look like. A table can show you that a dependency does not hold, one counter-example is enough, but it can never prove one.

## Topic: Keys written as dependencies

**Definition:** K is a super key exactly when K → every column of the table. K is a candidate key when it is a super key and no smaller part of K is one.

**Why:** It turns "is this a key?" into a calculation you can do on paper.

**Example:** For R(A, B, C, D, E) with A → B, B → C and CD → E: the set {A, D} determines all five columns, so it is a super key. A alone does not reach D or E, and D alone reaches nothing else, so {A, D} is a candidate key.

**Failure:** A super key test is not enough for a candidate key. You must also check that no smaller part works, which means checking each way of removing one column.

## Topic: Armstrong's axioms

**Definition:** Three rules produce every dependency that follows from a given set. Reflexivity: if Y is inside X then X → Y. Augmentation: if X → Y then XZ → YZ. Transitivity: if X → Y and Y → Z then X → Z. They are sound (they only produce true dependencies) and complete (they produce all of them).

**Why:** They let you prove that a dependency follows from the ones you were given, instead of guessing.

**Example:** Given A → B and B → C. Transitivity gives A → C. Augmenting A → C with D gives AD → CD. Three more rules follow from these: union (X → Y and X → Z give X → YZ), decomposition (X → YZ gives X → Y and X → Z) and pseudotransitivity (X → Y and YW → Z give XW → Z).

**Failure:** Decomposition only splits the right side. AB → C does not give A → C. A → C would be a stronger rule, and AB → C alone does not imply it.

## Topic: Attribute closure

**Definition:** The closure of a set of columns X, written X+, is every column that X determines. To compute it, start with X, then keep adding the right side of any dependency whose left side is already inside the result, until nothing new is added.

**Why:** One method answers the two questions interviewers ask most: is X a super key (X+ is every column), and does X → Y hold (Y is inside X+).

**Example:** R(A, B, C, D, E) with A → B, B → C and CD → E. Find (AD)+. Start with AD. A → B adds B, giving ABD. B → C adds C, giving ABCD. CD → E adds E, giving ABCDE. That is every column, so AD is a super key. A+ is ABC and D+ is D, so neither part alone is a key, and AD is a candidate key.

**Failure:** Do not stop after one pass: a rule that was not usable at first can become usable after other columns were added, as CD → E did here. Stop only when a full pass adds nothing.

## Topic: Canonical cover

**Definition:** A canonical cover is a simpler set of dependencies with the same closure, with no extra column in any dependency and each left side appearing once.

**Why:** Checking fewer, simpler dependencies after every update is cheaper.

**Example:** From {A → B, B → C, A → C}, the dependency A → C is already implied by A → B and B → C, so it can go. The canonical cover is {A → B, B → C}.

**Failure:** Know the idea; it is a smaller topic than closure. Be careful about direction when removing a column from a dependency: removing one from the left side can make the rule stronger, and removing one from the right can make it weaker.

## Questions

### What is a functional dependency?

X → Y means that rows with the same X values always have the same Y values. For example, roll_no → name: one roll number, one name.

### How do you find the candidate keys of a table from its dependencies?

Compute the closure of a set of columns. If the closure is every column it is a super key. A candidate key is a super key where removing any column breaks that.

### What is the difference between a trivial and a non-trivial dependency?

Trivial means the right side is inside the left side, like AB → A, so it always holds. Non-trivial means the right side has at least one column that is not on the left.

### Does A → B mean B → A?

No. dept → hod can hold while hod → dept does not, if one person heads two departments.

## Mistakes

- Reading a dependency off a few rows. One counter-example disproves a dependency, but no number of rows proves one.
- Treating A → B as if it also meant B → A.
- Assuming AB → C gives A → C. It does not, unless other dependencies imply it.

## Quiz

### A table has columns (A, B) and rows (1, 4), (1, 5), (3, 7). Which dependency does this data satisfy?

- [ ] A → B
- [x] B → A
- [ ] Both A → B and B → A
- [ ] Neither

Explanation: Each B value (4, 5, 7) goes with exactly one A, so B → A holds on this data. A = 1 goes with both 4 and 5, so A → B fails.

### R(A, B, C, D) has A → B and B → C. What is the closure of {A}?

- [ ] {A, B}
- [x] {A, B, C}
- [ ] {A, B, C, D}
- [ ] {A, C}

Explanation: Start with A. A → B adds B. B → C adds C. Nothing determines D, so D is not in the closure.

### R(A, B, C, D) has A → B and B → C. Which set is a candidate key?

- [ ] {A}
- [x] {A, D}
- [ ] {A, B, D}
- [ ] {B, D}

Explanation: A+ is ABC, which lacks D, but AD+ is ABCD, so {A, D} is a key. Neither A nor D alone is a key, so it is minimal. {A, B, D} is a super key with a column to spare, and {B, D} only reaches BCD.

### Which of these dependencies is trivial?

- [x] AB → A
- [ ] A → AB
- [ ] A → B
- [ ] B → A

Explanation: A dependency is trivial when its right side is inside its left side. A is inside AB. In A → AB the column B is not on the left.

### You know AB → C. Can you conclude A → C?

- [ ] Yes, by the decomposition rule
- [ ] Yes, by reflexivity
- [x] No, not from AB → C alone
- [ ] Yes, by augmentation

Explanation: A → C is a stronger rule than AB → C. The decomposition rule splits a right side, not a left side. You could only conclude it if the other dependencies imply A → C.

## Diagram

```json
{ "kind": "flow", "caption": "How to compute the closure of a set of columns X.", "steps": [{ "label": "Start with result = X" }, { "label": "Find a dependency whose left side is inside result" }, { "label": "Add its right side to result" }, { "label": "Repeat until nothing new is added" }, { "label": "Compare result with all columns" }] }
```
