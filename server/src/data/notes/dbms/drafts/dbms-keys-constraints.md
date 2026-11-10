---
id: dbms-keys-constraints
title: Keys & Constraints
next: dbms-functional-dependency
roadmapSteps: backend:database-design
---

<!-- DRAFT written 10 Nov 2026 from docs/content/source-notes/dbms-batch-a.md (S1 slides ch2, S2 PostgreSQL docs, S8 MySQL manual, S4/S7/S9 for alternate and composite key).
     Not reviewed: no lastChecked. To publish: outside reader + REVIEW_CHECKLIST.md, add lastChecked, move this file up one folder (to ../), delete the old section from dbms.legacy.js. -->

## Overview

A key is the rule that says which rows are different, and a constraint is a rule the database enforces so bad data never gets in. Interviewers ask about keys to see whether you can tell a super key from a candidate key, explain primary versus unique, and say what happens to child rows when a parent row is deleted. After this section you can define each key in one sentence, show it on a small table, and name the points where MySQL and PostgreSQL behave differently.

## Topic: Super key and candidate key

**Definition:** A super key is any set of columns whose values are enough to tell every row apart. A candidate key is a super key with nothing to spare: remove any column from it and it stops being unique.

**Why:** Without keys, a table cannot say which row an update or a reference points at, because two rows could look exactly the same.

**Example:** Take student(roll_no, email, name, phone), where roll_no and email are each unique. {roll_no}, {email}, {roll_no, name} and {email, phone} are all super keys. Only {roll_no} and {email} are candidate keys: take name out of {roll_no, name} and what is left, {roll_no}, still works, so {roll_no, name} had a column to spare.

**Failure:** A key is a rule about every possible row, not about the rows you can see. If every name in today's five rows is different, that does not make name a key, because tomorrow two students can share one. Never decide a key from a sample.

## Topic: Primary key

**Definition:** One candidate key is chosen by the designer as the primary key. Its values must be unique and never NULL, and a table has at most one.

**Why:** Foreign keys and indexes need one agreed way to point at a row.

**Example:** CREATE TABLE student (roll_no INT PRIMARY KEY, email VARCHAR(100) UNIQUE, name VARCHAR(50) NOT NULL); A second row with roll_no 7 is rejected if 7 already exists, and so is a row with roll_no NULL.
```sql
INSERT INTO student (roll_no, email, name) VALUES (7, 'a@x.com', 'Asha');
INSERT INTO student (roll_no, email, name) VALUES (7, 'b@x.com', 'Ravi');   -- rejected: duplicate key
INSERT INTO student (roll_no, email, name) VALUES (NULL, 'c@x.com', 'Meena'); -- rejected: NULL in primary key
```

**Failure:** A primary key can have several columns. In PostgreSQL a table may exist with no primary key at all, even though its documentation recommends one for every table. Do not say "every table must have one" as if it were a database rule.

## Topic: Unique key and NULL

**Definition:** A UNIQUE constraint stops two rows from sharing the same value in a column or group of columns. Unlike a primary key, a table can have many of them, and a UNIQUE column can allow NULL.

**Why:** It protects a second candidate key, such as email, without making it the primary key.

**Example:** With email UNIQUE, two rows with email 'a@x.com' are rejected. Two rows with email NULL are accepted in PostgreSQL and in MySQL, because two NULLs are not treated as equal to each other.

**Failure:** The common wrong answer is "a unique column can hold only one NULL". PostgreSQL and MySQL allow many. The PostgreSQL documentation says the SQL standard leaves this to the implementation, so other databases can differ, and PostgreSQL has an option, NULLS NOT DISTINCT, to change it. Say which database you mean.

## Topic: Alternate key and composite key

**Definition:** An alternate key is a candidate key that was not chosen as the primary key. A composite key is a key made of more than one column.

**Why:** The names let you describe a design in one breath: "roll_no is the primary key and email is an alternate key."

**Example:** In enrollment(student_id, course_id, grade), neither column is unique alone, because one student takes many courses and one course has many students. The pair {student_id, course_id} is a composite key.

**Failure:** A composite key is not automatically the primary key, and a primary key is not automatically composite: the words describe the size of a key and its role separately. These two names are not used by the main textbook, so say what you mean by them when you use them.

## Topic: Foreign key and referential integrity

**Definition:** A foreign key is a column, or group of columns, whose values must match a value of a key in another table, or be NULL. The table that holds it is the referencing table and the other is the referenced table. Keeping this true is called referential integrity.

**Why:** It stops orphan rows, such as an enrollment for a student who does not exist.

**Example:** enrollment.student_id REFERENCES student(roll_no). Inserting an enrollment for student 99 is rejected when no student has roll_no 99. Inserting one with student_id NULL is accepted unless the column is declared NOT NULL.
```sql
CREATE TABLE enrollment (
  student_id INT REFERENCES student(roll_no),
  course_id  INT,
  grade      CHAR(1)
);
```

**Failure:** The referenced columns should be the primary key or another unique key. PostgreSQL refuses anything else. MySQL InnoDB does not force it, but its manual advises against it. Also, PostgreSQL does not create an index on the referencing column, so add one yourself or joins and parent deletes get slow; MySQL creates one for you if it is missing.

## Topic: What happens on delete

**Definition:** ON DELETE and ON UPDATE say what the database does to child rows when the parent row is deleted or changed. CASCADE follows the change, SET NULL blanks the link, RESTRICT and NO ACTION refuse it, and SET DEFAULT puts a default value in.

**Why:** The right choice depends on the relationship: order items should disappear with their order, but a product that has orders should not be deletable.

**Example:** order_item(order_id) REFERENCES orders ON DELETE CASCADE. Deleting order 5 also deletes its items. With ON DELETE RESTRICT the same delete fails while any item of order 5 exists.

**Failure:** The default is NO ACTION. In PostgreSQL, NO ACTION can be postponed to the end of the transaction while RESTRICT cannot. In MySQL InnoDB, NO ACTION behaves exactly like RESTRICT. SET NULL needs a column that allows NULL, and InnoDB rejects SET DEFAULT.

## Topic: NOT NULL and CHECK

**Definition:** NOT NULL rejects a missing value. CHECK rejects a row when its condition is false.

**Why:** They keep a rule that belongs to a single row (a price must be positive) inside the database instead of in every program that writes to it.

**Example:** price NUMERIC CHECK (price > 0): a price of -5 or 0 is rejected.
```sql
CREATE TABLE product (id INT PRIMARY KEY, price NUMERIC CHECK (price > 0));
INSERT INTO product VALUES (1, -5);   -- rejected
INSERT INTO product VALUES (2, NULL); -- accepted
```

**Failure:** A CHECK passes when its condition comes out as NULL, and most comparisons with NULL come out as NULL. So CHECK (price > 0) does not stop price being NULL; add NOT NULL for that. PostgreSQL's CHECK also cannot look at other rows or other tables.

## Questions

### What is the difference between a primary key and a unique key?

A table has one primary key and it can never be NULL. A table can have many unique keys, and a unique column can usually hold NULL: PostgreSQL and MySQL allow several NULLs there.

### What is the difference between a super key and a candidate key?

A super key is any set of columns that identifies a row. A candidate key is a super key with no column to spare. Every candidate key is a super key, but not the other way round.

### Can a foreign key be NULL, and what can it point at?

Yes, unless the column is declared NOT NULL; a NULL foreign key is not checked. It should point at a primary key or another unique key of the referenced table.

### What happens when you delete a parent row that still has child rows?

It depends on the ON DELETE rule: CASCADE deletes the children, SET NULL blanks their link, and RESTRICT or NO ACTION refuses the delete. The default is NO ACTION.

## Mistakes

- Saying a unique column can hold only one NULL. In PostgreSQL and MySQL it can hold many.
- Saying a foreign key must point at the primary key. It can point at any unique key, though the primary key is the usual target.
- Treating a column that happens to be unique in a few sample rows as a key. A key must hold for all possible data.

## Quiz

### In student(roll_no, email, name), roll_no and email are each unique. Which set is a super key but not a candidate key?

- [ ] {roll_no}
- [ ] {email}
- [x] {roll_no, name}
- [ ] {name}

Explanation: {roll_no, name} identifies every row, but name can be removed and it still does, so it is not minimal. {roll_no} and {email} are minimal, and {name} is not unique.

### In PostgreSQL, a UNIQUE column already has one row with NULL. You insert a second row with NULL in that column. What happens?

- [ ] The insert is rejected as a duplicate
- [x] The insert is accepted, because two NULLs are not treated as equal
- [ ] The first NULL is replaced by the second
- [ ] The insert is rejected unless the column is the primary key

Explanation: By default PostgreSQL does not treat two NULLs as equal in a unique constraint, so both rows stay. MySQL behaves the same way. NULLS NOT DISTINCT in PostgreSQL changes this.

### order_item has a foreign key to orders with ON DELETE CASCADE. You delete order 5. What happens to its items?

- [ ] The delete fails while items exist
- [x] The items of order 5 are deleted too
- [ ] The order_id of those items becomes NULL
- [ ] The items stay and keep the old order_id

Explanation: CASCADE carries the delete down to the child rows. RESTRICT would refuse the delete and SET NULL would blank the order_id.

### price NUMERIC CHECK (price > 0). Which insert is accepted?

- [ ] price = -5
- [ ] price = 0
- [x] price = NULL
- [ ] price = -0.01

Explanation: A CHECK rejects a row only when its condition is false. With NULL the condition is unknown, so the row passes. Add NOT NULL to block it.

### In MySQL InnoDB, how does ON DELETE NO ACTION differ from ON DELETE RESTRICT?

- [ ] NO ACTION lets the delete happen and fixes the children later
- [ ] NO ACTION waits until the transaction commits
- [x] It does not differ: InnoDB treats them the same
- [ ] RESTRICT cascades the delete

Explanation: In InnoDB, NO ACTION is equivalent to RESTRICT and refuses the change at once. In PostgreSQL they differ: NO ACTION can be deferred and RESTRICT cannot.

## Diagram

```json
{ "kind": "layers", "caption": "Each layer is a smaller group inside the one above it: every candidate key is a super key, and the primary key is the one candidate key you chose.", "layers": [{ "label": "Any set of columns" }, { "label": "Super keys: identify every row" }, { "label": "Candidate keys: super keys with no column to spare" }, { "label": "Primary key: the one candidate key you chose" }] }
```
