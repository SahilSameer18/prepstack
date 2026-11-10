# Source notes: DBMS batch A (keys and constraints, functional dependencies, normalization)

Read on 10 Nov 2026. These notes are the raw material for the sections `dbms-keys-constraints`, `dbms-functional-dependency` and `dbms-normalization`. Every fact below is **restated in our own words** from a page that was actually read; nothing here was filled in from memory. A fact that no read source states is listed at the end under "Not yet sourced". Slide labels such as "7.28" are the slide numbers printed on the slides (the page labelled `7.28`).

Rule for the notes themselves (from `NOTES_TEMPLATE.md`): explain in our own words, do not copy text or pictures, put the source in the claims table.

---

## S1. Database System Concepts, 7th edition (Silberschatz, Korth, Sudarshan), slides

| | |
|---|---|
| Pages read | `https://www.db-book.com/` , `https://www.db-book.com/slides-dir/index.html` , chapter 2 slides `https://www.db-book.com/slides-dir/PDF-dir/ch2.pdf` (32 slides), chapter 7 slides `https://www.db-book.com/slides-dir/PDF-dir/ch7.pdf` (93 slides), table of contents `https://www.db-book.com/toc-dir/toc.pdf`, errata `https://www.db-book.com/errata-dir/db-errata.pdf` (last updated 4 Dec 2025) |
| Edition | 7th edition, released March 2019 (McGraw-Hill, ISBN 9780078022159) |
| Slide dates | Chapter 2 slides updated 5 Jan 2026; chapter 7 slides updated 24 Jan 2019 |
| Terms seen | The slides and figures are copyright the authors. Authorized for personal use and for courses that use the book as their prescribed text; instructors may modify them if they acknowledge the source. Any other use needs the authors' consent. **So we do not copy slide text or figures. We use the slides as a source of facts and cite them.** |
| Errata | The errata list for chapters 2 and 7 only corrects typos and figure labels (for example, a swapped attribute order in an example in section 7). None changes a definition used below. |

### Keys and the relational model (chapter 2)
- A relation has attributes (columns) and tuples (rows). Each attribute has a domain, the set of allowed values. Values are normally atomic (indivisible). The special value `null` belongs to every domain and means "unknown"; it complicates the definition of many operations. (slides 2.5)
- Tuples in a relation have no order. (2.6)
- The schema is the logical structure of the database; an instance is a snapshot of the data at one moment. (2.7)
- Super key: a set of attributes whose values are enough to identify one tuple in every possible relation. Example from the slides: `{ID}` and `{ID, name}` are both super keys of `instructor`. (2.8)
- Candidate key: a super key that is minimal (nothing can be removed from it). `{ID}` is a candidate key of `instructor`. (2.8)
- Primary key: one of the candidate keys, chosen by the designer. (2.8)
- Foreign key constraint: a value in one relation must appear in another. The relation that holds the foreign key is the referencing relation; the other is the referenced relation. Example: `dept_name` in `instructor` references `department`. (2.8)
- Join: `r ⋈θ s` is a selection with predicate θ applied to the Cartesian product of `r` and `s`. (2.21) A Cartesian product pairs every tuple of one relation with every tuple of the other. (2.17)
- Union, intersection and difference need relations of the same arity with compatible attribute domains. (2.22, 2.25, 2.26)

### Functional dependencies (chapter 7)
- A functional dependency `α → β` holds on a relation schema when, in every legal relation, any two tuples that agree on α also agree on β. A functional dependency is a generalization of the idea of a key. (7.12, 7.13)
- Tiny instance from the slides: with rows (1,4), (1,5), (3,7), `B → A` holds and `A → B` does not. (7.13)
- A specific instance can satisfy a dependency by chance (for example `name → ID` in one particular `instructor` table) even though the dependency does not hold for all legal instances. (7.16)
- Trivial dependency: one that every instance satisfies, which is the case when β is a subset of α (for example `ID, name → ID`). (7.17)
- Keys in terms of dependencies: K is a super key of R exactly when `K → R`. K is a candidate key when `K → R` and no proper subset of K determines R. (7.15)
- The closure `F+` of a set F is every dependency logically implied by F. (7.14)
- Armstrong's axioms: reflexivity (if β ⊆ α then α → β), augmentation (if α → β then γα → γβ) and transitivity (if α → β and β → γ then α → γ). They are sound (give only dependencies that hold) and complete (give all that hold). (7.39)
- Rules derived from the axioms: union, decomposition and pseudotransitivity. (7.41)
- Worked example for `F+` from the slides: with F = {A→B, A→C, CG→H, CG→I, B→H}, `A → H` by transitivity, and `AG → I` by augmenting A→C with G and then transitivity. (7.40)
- Attribute closure `α+` is the set of attributes determined by α. Method: start with α, and while any dependency β → γ has β inside the result, add γ. (7.43)
- Worked example: `(AG)+` for the same F grows AG → ABCG → ABCGH → ABCGHI, so AG is a super key. To confirm AG is a candidate key, check that neither A nor G alone determines every attribute. (7.44)
- Uses of attribute closure: test for a super key (α+ contains all attributes), test whether `α → β` holds (β is inside α+). (7.45)
- Canonical cover: a smaller set of dependencies with the same closure, no extraneous attributes and a unique left side per dependency. Used to make constraint checking cheaper. (7.46 to 7.53)
- Extraneous attribute: one that can be removed from a dependency without changing the closure. Removing from the left side can make a constraint stronger; removing from the right side can make it weaker. (7.47 to 7.49)

### Decomposition (chapter 7)
- Why decompose: joining `instructor` and `department` into one table repeats the department information on every instructor row and needs nulls for a department with no instructors. (7.4, 7.6)
- A bad decomposition loses information: splitting `employee(ID, name, street, city, salary)` into `(ID, name)` and `(name, street, city, salary)` fails when two employees share a name, because the original table cannot be rebuilt. This is a lossy decomposition. (7.6, 7.7)
- Lossless decomposition: the natural join of the pieces gives back exactly the original relation. (7.8)
- Test for a split into R1 and R2: it is lossless if `R1 ∩ R2 → R1` or `R1 ∩ R2 → R2` is in `F+`. This is sufficient, and also necessary when all the constraints are functional dependencies. (7.18)
- Example: R=(A,B,C), F={A→B, B→C}. Split into (A,B) and (B,C): the shared attribute B determines (B,C), so it is lossless. Split into (A,B) and (A,C): the shared attribute A determines (A,B), so it is also lossless. (7.19)
- Dependency preservation: checking a dependency after an update is cheap if it involves only one table. A decomposition is dependency preserving if the dependencies that can be checked inside single tables are, together, equivalent to the original set. If it is not, checking may need a join, which is expensive. (7.20, 7.55, 7.56)
- Example: R=(A,B,C), F={A→B, B→C}. Split (A,B),(B,C) is lossless and dependency preserving. Split (A,B),(A,C) is lossless but not dependency preserving, because B→C cannot be checked without computing the join. (7.26)

### Normal forms (chapter 7)
- BCNF: for every dependency `α → β` in `F+`, either it is trivial or α is a super key. Example: `in_dep(ID, name, salary, dept_name, building, budget)` is not in BCNF because `dept_name → building, budget` holds and `dept_name` is not a super key; splitting it into `instructor` and `department` gives two BCNF relations. (7.23, 7.24)
- BCNF decomposition step: for a violating `α → β`, replace R with `(α ∪ β)` and `(R − (β − α))`. (7.25) The full algorithm repeats this until every piece is in BCNF; the result is lossless. (7.62)
- Worked decomposition on a `class` relation with three dependencies ends in `course`, `classroom` and `section`. (7.63, 7.64)
- Testing for BCNF: compute α+ for a dependency's left side and check whether it contains all of R. For the original relation it is enough to check the dependencies in F. It is not enough when testing a piece of a decomposition, because a dependency like `AC → D` can hold in the piece without appearing in F. (7.60, 7.61)
- BCNF and dependency preservation can conflict: `dept_advisor(s_ID, i_ID, dept_name)` with `i_ID → dept_name` and `s_ID, dept_name → i_ID` is not in BCNF, and any decomposition loses the dependency `s_ID, dept_name → i_ID`. (7.27)
- 3NF: for every `α → β` in `F+`, one of three holds: it is trivial, α is a super key, or every attribute in `β − α` is part of some candidate key (each attribute may be in a different candidate key). BCNF implies 3NF. The third condition is a minimal relaxation of BCNF so dependencies can still be preserved. (7.28)
- Same `dept_advisor` is in 3NF: it has two candidate keys, `{s_ID, dept_name}` and `{s_ID, i_ID}`, and `dept_name` is part of a candidate key. (7.29, 7.66)
- Price of 3NF: some repetition of information and sometimes nulls. Example: R=(J,K,L) with `JK → L` and `L → K` is in 3NF but repeats the K value for the same L. (7.30, 7.31)
- Trade-off: it is always possible to get a lossless, dependency-preserving 3NF design; for BCNF a lossless design is always possible but dependency preservation may not be. If BCNF with dependency preservation is impossible, accept either losing dependency preservation or some 3NF redundancy. (7.31, 7.72, 7.73)
- Testing for 3NF is NP-hard in general, but decomposing into 3NF can be done in polynomial time. (7.67)
- 3NF decomposition algorithm: take a canonical cover; make one relation per dependency; if no relation holds a candidate key, add one; remove relations contained in others. (7.68 to 7.71)
- SQL has no direct way to declare a functional dependency except through super keys. (7.73)
- BCNF is not always enough: `inst_info(ID, child_name, phone)` has no non-trivial functional dependency, so it is in BCNF, yet adding one phone number forces one new row per child. This motivates multivalued dependencies and 4NF. (7.33, 7.34, 7.35, 7.75 to 7.82)
- First normal form: a domain is atomic when its elements are treated as indivisible; a schema is in 1NF if every attribute's domain is atomic. Non-atomic values complicate storage and encourage redundancy. (slides around 7.9x, "First Normal Form")

---

## S2. PostgreSQL documentation (version 18, "current")

| | |
|---|---|
| Pages read | `https://www.postgresql.org/docs/current/ddl-constraints.html` (section 5.5 Constraints), `https://www.postgresql.org/docs/current/tutorial-fk.html` (3.3 Foreign Keys), `https://www.postgresql.org/about/licence/` |
| Version / date | PostgreSQL 18 (header read "18.6"); no last-updated date on the pages; footer "Copyright © 1996-2026 The PostgreSQL Global Development Group" |
| Terms seen | The licence page says PostgreSQL is released under the PostgreSQL License, "a liberal Open Source license, similar to the BSD or MIT licenses". The permission covers use, copy, modify and distribute of the software **and its documentation** for any purpose without fee, provided the copyright notice and the following paragraphs appear in all copies. The pages did not state a separate documentation licence. **We restate in our own words and link to the page; we do not copy page text.** |

Facts (restated):
- CHECK: a row passes when the expression is true or NULL, so a CHECK alone does not stop NULLs; use NOT NULL for that. PostgreSQL does not support a CHECK that reads other rows or tables; for cross-row rules use UNIQUE, EXCLUDE, FOREIGN KEY or a trigger.
- NOT NULL rejects NULL in the column and is described as equivalent to `CHECK (col IS NOT NULL)` but more efficient.
- UNIQUE can cover one column or a group and creates a unique B-tree index. By default two NULLs are not considered equal, so a UNIQUE column can hold several NULLs; `NULLS NOT DISTINCT` changes that. The page notes that the SQL standard leaves the default NULL treatment to the implementation and other databases differ.
- PRIMARY KEY requires values that are unique and not null, creates a unique B-tree index and marks its columns NOT NULL. A table can have at most one primary key but any number of UNIQUE constraints. A primary key may span several columns. The page says every table should have one but PostgreSQL does not force it.
- FOREIGN KEY: values must match a row in the referenced table unless they are NULL. With no column list given, the referenced table's primary key is used. The referenced columns must be a primary key, a unique constraint, or columns of a non-partial unique index. Declaring a foreign key does **not** create an index on the referencing columns; the page advises adding one.
- NULL in a foreign key: by default a row escapes the check if any referencing column is NULL; `MATCH FULL` makes the row escape only if all referencing columns are NULL. To forbid NULL, make the columns NOT NULL.
- ON DELETE / ON UPDATE actions (default is NO ACTION for both): NO ACTION allows the statement but the foreign key must still hold at the end (so it normally errors) and can be deferred; RESTRICT blocks outright and cannot be deferred; CASCADE deletes the referencing rows (or copies the new value on update); SET NULL and SET DEFAULT set the referencing columns, and do not bypass constraints (a default that violates the key makes the statement fail). A column list for SET NULL/SET DEFAULT is allowed on ON DELETE only.
- Advice from the page: CASCADE suits parts that cannot exist without the parent; RESTRICT or NO ACTION suits independent objects; SET NULL or SET DEFAULT suits optional links.
- A self-referencing foreign key can model a tree, with NULL parent for the top node.
- The tutorial page shows the idea with two tables where a `weather` row must name a city that exists in `cities`, and an insert for a missing city fails with an error naming the constraint.

---

## S3. What popular study sites say (coverage and mistakes only, not used as a source of facts)

Pages read (10 Nov 2026): GeeksforGeeks "Introduction to Database Normalization" (last updated 5 Oct 2026), TutorialsPoint DBMS tutorial home page (no date; its FAQ was read), InterviewBit "DBMS Interview Questions" (last updated 4 Feb 2026; first part read in full, later part only as a summary, so unverified).

Use: which sub-topics interviews cover, and which mistakes are common. Items below are **flags checked against S1**, so they are safe to use as the "mistakes" part of the notes, each pointing at the S1 slide that shows the correct statement.

- InterviewBit says unique keys are essentially primary keys with NULL values. Correct difference (S2): a unique constraint may allow NULLs (several in PostgreSQL), and a table has one primary key but many unique constraints.
- InterviewBit's BCNF explanation says a non-prime attribute cannot determine a prime attribute and omits "non-trivial". Correct (S1, 7.23): for every non-trivial dependency the left side must be a super key.
- InterviewBit's 3NF and 2NF explanations are loose or garbled. Correct 3NF is the three-way condition in S1, 7.28.
- TutorialsPoint's BCNF example gives the dependency `{StudentID, Course} → Professor`, which already makes `{StudentID, Course}` a key, so that table is already in BCNF and the proposed split is not justified by the stated dependency. (A BCNF violation needs a determinant that is not a super key, S1 7.23.)
- TutorialsPoint says normalization "guarantees data integrity" and "enhances performance". Integrity comes from constraints; normalization removes redundancy and often adds joins.
- Several sites call a unique key or a primary key "always indexed" or describe NULL rules as universal. The PostgreSQL docs (S2) show these are behaviours of a particular database.
- Topic order on the sites: keys, then functional dependencies and closure, then 1NF, 2NF, 3NF, BCNF, then 4NF/5NF briefly. This matches the order in S1 closely enough to keep.

---

## S4. Your DBMS notes (PDF supplied by the project owner, 10 Nov 2026)

| | |
|---|---|
| File | `DBMS_Notes (2).pdf` (27 pages, has a text layer), kept outside the repo |
| Author / date | Not stated in the file. Title page reads "DBMS & SQL NOTES". Licence unknown |
| Coverage | Database and DBMS basics and file-system problems; ER model (entity sets, strong and weak, relationships, cardinality, attribute types); relational constraints; closure of an attribute set; keys; functional dependency; decomposition; normal forms 1NF to BCNF; transactions and states; ACID; schedules and serializability (conflict, view, recoverable, cascadeless, strict); relational algebra; file structures and B and B+ trees; SQL (DDL, DML, DCL, TCL, SELECT, WHERE, ORDER BY, aggregates, LIKE, IN, BETWEEN, joins, UNION, GROUP BY, HAVING, CREATE/ALTER/DROP) |
| How it is used | **As a source of topic coverage and of the definitions it gives that S1 does not (2NF, alternate key, composite key), restated in our words.** Because the author and licence are unknown, any fact taken only from here is marked "secondary source" in the claims table until it is confirmed by S1, S2 or the outside reader. We do not copy its text. |

Facts it gives that S1/S2 do not (restated; secondary source):
- 1NF: every cell holds one atomic value (the attribute of each row is single valued or null).
- 2NF: the relation is in 1NF and has no partial dependency. A partial dependency is `A → B` where A is part of a candidate key (a proper subset) and B is a non-prime attribute (not part of any candidate key).
- 3NF, as the notes state it: in 2NF and no transitive dependency of a non-prime attribute. **Check against S1 7.28**: the textbook's three-way condition is the exact definition; the "transitive" wording is a simplification.
- Alternate key: a candidate key that was not chosen as the primary key.
- Composite key: a key made of more than one attribute.
- Entity integrity: no attribute of a primary key may be null. Referential integrity: a foreign key value must appear in the referenced relation's key or be null.
- The notes list the same transaction states as the usual state diagram: active, partially committed, committed, failed, aborted, terminated. (Batch B material.)

Mistakes and loose statements found in S4 (do **not** repeat them; each is checked against the page that shows the correct statement):
- "Unique key... once assigned, its value cannot be changed, i.e. it is non-updatable." A unique constraint does not make a value unchangeable. (S2: a UNIQUE constraint only enforces uniqueness.)
- Foreign key defined as an attribute whose "values are dependent on" another attribute. The correct statement is that each value must match a value of the referenced key, or be null. (S1 2.8, S2.)
- Composite key defined as "a primary key composed of multiple attributes". A composite key is any key with several attributes, not only the primary key.
- "Left outer join... the result is 0 records from the right side if there is no match." An unmatched left row is kept and the right-side columns are NULL, not zero rows. (S1 describes the join as selection over a Cartesian product; the NULL padding for outer joins belongs to batch C and needs its own source.)
- "DELETE: delete all records from a database table." With a WHERE clause it deletes only matching rows; the notes show both forms later.
- "WHERE is given priority over HAVING": loose; WHERE filters rows before grouping, HAVING filters groups after (batch C: needs a source).
- Normal-form definitions are stated as a chain ("already in 3NF" for BCNF). The textbook defines BCNF directly (S1 7.23); the chain form is a simplification.

## S5, S6. Your SQL notes (two PDFs supplied 10 Nov 2026) — for batch C, not used yet

- `SQL Notes by Apna College (1).pdf` (29 pages, text layer): CRUD, data types, SQL command types, DDL, WHERE operators, ORDER BY, aggregate functions, GROUP BY and HAVING, DCL, TCL and transactions, joins (inner, left, right, full, cross, self), set operations and more, with small example tables and results.
- `SQL (notes) (1).pdf` (59 slides, "SQL by Apna College", text layer present, only about 10,000 characters because many slides are pictures).
- Author: Apna College (named on the files). Licence terms not seen. Same use as S4: coverage and examples to restate, nothing copied, claims confirmed against the PostgreSQL or MySQL documentation before they are published.

---

## S7. Wikipedia: Second normal form, Candidate key, Database normalization (read 10 Nov 2026)

| | |
|---|---|
| Pages | `https://en.wikipedia.org/wiki/Second_normal_form` (last edited 29 Jul 2025, read in full), `https://en.wikipedia.org/wiki/Candidate_key` (last edited 25 May 2025, read in full), `https://en.wikipedia.org/wiki/Database_normalization` (only the first 40,000 of 97,000 characters were read verbatim; the rest came as a machine summary, so **only the verbatim parts are used**) |
| Terms | Creative Commons Attribution-ShareAlike 4.0, "additional terms may apply" (page footer). We restate and cite; we do not copy text. |

Facts (restated):
- 2NF: the table is in 1NF and has no partial dependency. A partial dependency means a non-prime attribute (one that is in no candidate key) depends on only a proper subset of some candidate key; equivalently every non-prime attribute depends on the whole of every candidate key. (2NF page)
- Worked example for 2NF (2NF page): a table of toothbrushes with composite key {Manufacturer, Model}; the column ManufacturerCountry depends on Manufacturer alone, so it violates 2NF; the fix moves it to a separate Manufacturer-to-country table. A second illustration: key {Country, District} with a CountryLeader column that depends on Country only, so the leader repeats for every district.
- Candidate key: a minimal super key; a relation can have several, of different sizes. Prime attribute: in some candidate key; non-prime: in none. A chosen candidate key is called the primary key; a candidate key not chosen is sometimes called an alternate key. A single table instance is not enough to prove that a set is a key. The page gives a way to find candidate keys with attribute closure. (Candidate key page)
- Anomalies, from the verbatim part of the normalization page: **insertion** (a new faculty member with no course cannot be stored unless the course code is allowed to be null); **update** (an employee's address repeated on one row per skill; a partial update leaves conflicting addresses); **deletion** (deleting a faculty member's last course row also removes the faculty member's details). Most 3NF relations are free of these anomalies.
- Normal forms in the table on that page: 3NF means every non-trivial dependency starts with a super key or ends with a prime attribute; BCNF means every non-trivial dependency starts with a super key ("a stricter form of 3NF"). History: Codd defined 1NF in 1970 and 2NF and 3NF in 1971; BCNF came in 1974 with Raymond Boyce.
- Not stated on these pages: a definition of composite key (only a link), the 3NF versus BCNF difference in words.

## S8. MySQL 8.4 Reference Manual (read 10 Nov 2026)

| | |
|---|---|
| Pages | `https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html` (15.1.20.5 FOREIGN KEY Constraints), `https://dev.mysql.com/doc/refman/8.4/en/create-table.html` (15.1.20 CREATE TABLE, the index section), `https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html` (17.7.2.1 Transaction Isolation Levels) |
| Version / date | Manual version 8.4; no date shown on the pages |
| Terms | Footer "© 2026 Oracle" with Terms of Use and Trademark links. No reuse licence stated. We restate and cite; we do not copy. |

Facts (restated):
- Foreign key actions in InnoDB: CASCADE deletes or updates the child rows with the parent; SET NULL sets the child columns to NULL (they must not be NOT NULL); RESTRICT rejects the change; **NO ACTION is equivalent to RESTRICT in InnoDB** and is rejected at once; SET DEFAULT is parsed but InnoDB and NDB reject table definitions that use it. When no action is written, the default is NO ACTION. (This differs from PostgreSQL, where NO ACTION can be deferred and RESTRICT cannot; S2.)
- MySQL requires an index on the foreign key columns and on the referenced columns; if the referencing table has no usable index MySQL creates one automatically. (PostgreSQL does not create one; S2.) InnoDB does not itself require the referenced columns to be UNIQUE or NOT NULL, and the manual advises referencing only keys that are both; referencing a non-unique index is described as deprecated.
- InnoDB uses MATCH SIMPLE behaviour, which lets a foreign key be fully or partly NULL.
- A UNIQUE index requires all values to be different, and for all engines allows several NULL values in a column that can hold NULL. A PRIMARY KEY is a unique index whose columns must be NOT NULL; if you do not declare that, MySQL does it silently. A table has at most one primary key.
- Default isolation level for InnoDB: REPEATABLE READ (PostgreSQL's default is Read Committed; S2 and the audit). Each of the four standard levels is available.

## S9. GeeksforGeeks articles (read 10 Nov 2026; coverage and mistakes, not a source of facts)

Pages: keys in the relational model (last updated 24 Apr 2026), attribute closure (24 Apr 2026), Armstrong's axioms (28 Feb 2026), lossless join and dependency preserving decomposition (23 Jul 2025), database normalization introduction (5 Oct 2026). All under `https://www.geeksforgeeks.org/dbms/...`.

Topic coverage worth matching: keys (candidate, super, alternate, foreign, partial, primary, secondary, unique, composite, surrogate), closure of attributes with candidate-key finding and prime/non-prime attributes, the three axioms and the union, decomposition and pseudotransitivity rules, lossless and dependency-preserving decomposition with a worked split `R(A,B,C,D)` with `A → BC` into `R1(A,B,C)` and `R2(A,D)`, and a past exam question about `A → B`, `C → D` split into `R1(A,B)`, `R2(C,D)` (dependency preserving, not lossless).

Mistakes found (do not repeat; each is checked against S1, S2 or S8):
- Says an alternate key "is also referred to as a secondary key", which contradicts its own Secondary Key section (a non-unique search key).
- Says a composite key acts as the primary key when there is none. Having several columns does not make a key the primary key.
- Says a unique key allows only one NULL per column. In PostgreSQL and MySQL a UNIQUE column may hold several NULLs (S2, S8); SQL Server differs, so this is DBMS-specific.
- Says a foreign key refers to "the primary key in another table". It may reference any candidate key (S1 2.8, S2).
- Says a decomposition must be both lossless and dependency preserving. It must be lossless; dependency preservation is desirable but BCNF may not allow it (S1 7.27, 7.73).
- Claims that attribute closure "improves query performance" and that dependency preservation "improves data integrity" and "query performance" are unsupported.
- The closure example refers to a dependency set that the page never lists, so it cannot be checked from the page.

---

## Still open after the second round of reading

1. **2NF** now has a definition and a worked example from S7 (Wikipedia, CC BY-SA, page notes it has no inline citations) and S4 (your notes). Neither is an authoritative textbook. The book chapter itself (not the slides) has not been read, so 2NF stays marked "secondary source" until the outside reader or the book confirms it.
2. **Alternate key:** defined by S4, S7 and S9, all agreeing. **Composite key:** defined by S4 and S9 only. Both are secondary sources.
3. **Anomalies:** worked examples are in S7 (Database normalization page, verbatim part). Secondary source.
4. The **book itself** (chapters, not slides) has not been read. Any definition that matters should be checked against it by the outside reader.
5. **Outside reader for DBMS:** nobody has agreed yet (see the table in `SOURCES.md`). Nothing in batch A gets `lastChecked` until someone does.
## Claims to put in the claims table when the sections are drafted

Each row: section id, the claim, the source and slide or page, checked by, date. Draft rows are in the section drafts; nothing is marked checked until the outside reader signs off.
