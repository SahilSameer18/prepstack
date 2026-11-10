---
id: dbms-er-model
title: ER Model
next: dbms-keys-constraints
roadmapSteps: backend:database-design
---

<!-- DRAFT written 10 Nov 2026 from docs/content/source-notes/dbms-batch-d.md (S1d slides ch6, S4d supplied notes).
     Not reviewed: no lastChecked. To publish: outside reader + REVIEW_CHECKLIST.md, add lastChecked, move this file up one folder, delete the old section from dbms.legacy.js. -->

## Overview

The entity-relationship model is a way to design a database on paper before building it: you draw the things you store, their properties and how they relate. Interviewers ask about it because a good answer needs the vocabulary (entity, relationship, cardinality, weak entity) and the rules for turning a diagram into tables. After this section you can read an ER diagram, state each cardinality and participation, explain a weak entity set with an example, and convert a design into relational tables with the right keys.

## Topic: Entities and attributes

**Definition:** An entity is an object that exists and can be told apart from other objects. An entity set is a group of entities of the same type with the same properties. Attributes are the descriptive properties, and some of them together form the primary key that identifies each entity.

**Why:** Deciding what the entities are is the first step of a design, and every later step builds on it.

**Example:** For a college: Student(roll_no, name, date_of_birth) and Course(course_id, title, credits). roll_no identifies a student and course_id identifies a course, so they are the primary keys, underlined in the diagram. A rectangle in the diagram is an entity set.

**Failure:** No two entities of a set may have exactly the same values for all attributes. If that could happen, add an attribute that tells them apart.

## Topic: Types of attributes

**Definition:** A simple attribute cannot be split further. A composite attribute is made of parts. A single-valued attribute has one value per entity and a multivalued attribute can have several. A derived attribute can be computed from others.

**Why:** Each type is stored differently when you build the tables.

**Example:** age is derived from date_of_birth, so it need not be stored. name can be composite (first_name, middle_initial, last_name). phone_numbers is multivalued, because a student can have several. roll_no is simple and single-valued.

**Failure:** A multivalued attribute cannot sit in a single column without breaking first normal form, so it needs its own table in the relational design.

## Topic: Relationships, degree and roles

**Definition:** A relationship is an association among entities, and a relationship set is a group of such associations. Its degree is the number of entity sets that take part: binary for two, ternary for three. A relationship set can have its own attributes. When one entity set appears twice, each appearance plays a role.

**Why:** Relationships are where the questions are: which students take which courses, and with what grade.

**Example:** enrolls connects Student and Course and has its own attribute grade. A ternary relationship: students work on projects under an instructor, so proj_guide connects instructor, student and project. A role example: Course appears twice in prerequisite, once as the course and once as the prerequisite course. A diamond in the diagram is a relationship set.

**Failure:** Most relationships are binary. A ternary relationship is worth using only when the three-way association cannot be broken into two-way ones without losing meaning.

## Topic: Cardinality and participation

**Definition:** Mapping cardinality says how many entities on one side can be associated with an entity on the other side: one to one, one to many, many to one or many to many. Participation says whether every entity must take part: total participation means every entity does, partial means some may not.

**Why:** These two constraints decide where the keys go when the design becomes tables.

**Example:** One department has many students, and each student belongs to exactly one department: one to many from department to student, with total participation of student. A student can take many courses and a course can have many students: many to many. In a diagram a directed arrow means "one" and a plain line means "many", and a double line means total participation. A line can also carry a range l..h: 1..1 means exactly one, 0..* means any number including none.

**Failure:** Do not mix cardinality with participation. "Each student has at most one advisor" is a maximum (cardinality); "every student must have an advisor" is a minimum of one (total participation).

## Topic: Weak entity sets

**Definition:** A weak entity set is an entity set whose entities cannot be identified by their own attributes alone. They depend on an identifying (owner) entity set through an identifying relationship. They are identified by the owner's primary key plus extra attributes called the discriminator.

**Why:** Some things only make sense inside another thing, and without this idea their key would be ambiguous.

**Example:** A section of a course: sec_id, semester and year do not identify a section alone, because many courses have a section "1" in "Fall 2026". Together with the owner's key course_id they do. The primary key of Section is (course_id, sec_id, semester, year). In a diagram the weak entity is a double rectangle, its discriminator has a dashed underline, and the identifying relationship is a double diamond.

**Failure:** A weak entity depends on its owner's existence. An entity set that is not weak is a strong entity set. The relationship between a weak set and its owner needs no table of its own, because the weak entity's table already contains the owner's key.

## Topic: Keys of relationship sets

**Definition:** The primary key of a relationship set is made of the primary keys of the entity sets that take part, plus its own attributes if any. The choice of the minimal key depends on the cardinality.

**Why:** It tells you how many times the same pair can be related.

**Example:** For many to many, such as enrolls, the key is both keys together: (roll_no, course_id). For one to many, the key of the "many" side is enough: each student has one department, so roll_no alone identifies the relationship. For one to one, either side's key works.

**Failure:** If the same pair of entities may be related more than once (for example a student retaking a course in different semesters), the key needs an extra attribute such as semester.

## Topic: From an ER diagram to tables

**Definition:** Every entity set and relationship set can be written as a table. Strong entity sets become tables with the same attributes. A weak entity set becomes a table that also holds the owner's key. A composite attribute becomes one column per part. A multivalued attribute becomes a separate table. A many-to-many relationship becomes a table of the two keys plus its own attributes. A one-to-many relationship becomes a foreign key column on the "many" side.

**Why:** The result is the schema you will actually create.

**Example:** For the college design:
```sql
CREATE TABLE department (dept_id INT PRIMARY KEY, name VARCHAR(50));
CREATE TABLE student (roll_no INT PRIMARY KEY, name VARCHAR(50),
                      dept_id INT NOT NULL REFERENCES department(dept_id));  -- one to many, total on student
CREATE TABLE student_phone (roll_no INT REFERENCES student(roll_no), phone VARCHAR(15),
                            PRIMARY KEY (roll_no, phone));                   -- multivalued attribute
CREATE TABLE course (course_id INT PRIMARY KEY, title VARCHAR(80));
CREATE TABLE enrollment (roll_no INT REFERENCES student(roll_no), course_id INT REFERENCES course(course_id),
                         grade CHAR(1), PRIMARY KEY (roll_no, course_id));   -- many to many
CREATE TABLE section (course_id INT REFERENCES course(course_id), sec_id INT, semester VARCHAR(10), year INT,
                      PRIMARY KEY (course_id, sec_id, semester, year));      -- weak entity
```

**Failure:** If participation on the "many" side is partial, the foreign key column must allow NULL for entities with no partner, which is why some designers use a separate table for that relationship. A subgroup of an entity set, such as instructor as a kind of person, can be built either as one table for the general set plus one per subgroup holding the general key, or as one table per subgroup with all attributes; the first needs a join to read one entity, the second can repeat data.

## Questions

### What is the difference between a strong and a weak entity set?

A strong entity set has its own primary key. A weak one does not, and is identified by the key of its owner entity set plus a discriminator.

### What are the cardinalities of a binary relationship?

One to one, one to many, many to one and many to many.

### How do you represent a many-to-many relationship as tables?

As a table holding the primary keys of both entity sets, plus any attributes of the relationship. Together the keys form the primary key.

### How do you handle a multivalued attribute?

Put it in its own table with the entity's primary key and the attribute, one row per value.

## Mistakes

- Treating a multivalued attribute as a column holding a list. It needs its own table.
- Mixing up participation and cardinality. One is the minimum (must it take part), the other the maximum (how many).
- Storing a derived attribute such as age, which goes out of date. Compute it from date_of_birth.

## Quiz

### Students and courses: a student can take many courses and a course has many students. How is the relationship stored?

- [ ] A column on the student table
- [ ] A column on the course table
- [x] A separate table with the keys of both
- [ ] It is not stored

Explanation: A many-to-many relationship needs its own table of the two keys, plus the relationship's own attributes such as grade.

### What is the primary key of a weak entity set?

- [ ] Its discriminator alone
- [ ] Any attribute it has
- [x] The owner's primary key plus the discriminator
- [ ] It has none and needs none

Explanation: A weak entity cannot be identified by its own attributes, so it uses the owner's key with the discriminator.

### A student has several phone numbers. How is this stored in tables?

- [ ] Several columns phone1, phone2, phone3
- [ ] One column with the numbers separated by commas
- [x] A separate table (roll_no, phone) with one row per number
- [ ] On the course table

Explanation: A multivalued attribute gets its own table, so each value is one row and every column holds one value.

### Each student belongs to exactly one department, and a department has many students. Where does the foreign key go?

- [ ] In the department table
- [x] In the student table, as dept_id
- [ ] In a separate table of both keys
- [ ] Nowhere

Explanation: For one to many, the key of the "one" side goes into the table of the "many" side. Because every student must have a department, the column is NOT NULL.

### Which attribute is a derived attribute?

- [ ] roll_no
- [ ] name
- [x] age, computed from date_of_birth
- [ ] phone_numbers

Explanation: A derived attribute can be calculated from other attributes, so storing it risks it going out of date.

## Diagram

```json
{ "kind": "graph", "caption": "A many-to-many relationship: Student and Course are connected through the relationship set Enrolls, which has its own attribute grade.", "nodes": [{ "id": "student", "label": "Student (roll_no)", "x": 15, "y": 50 }, { "id": "enrolls", "label": "Enrolls (grade)", "x": 50, "y": 50 }, { "id": "course", "label": "Course (course_id)", "x": 85, "y": 50 }], "edges": [{ "from": "student", "to": "enrolls", "label": "many" }, { "from": "enrolls", "to": "course", "label": "many" }] }
```

## Diagram

```json
{ "kind": "graph", "caption": "A weak entity: Section cannot be identified without its owner Course, so its key includes course_id.", "nodes": [{ "id": "course", "label": "Course (course_id)", "x": 20, "y": 50 }, { "id": "has", "label": "Identifying relationship", "x": 50, "y": 50 }, { "id": "section", "label": "Section (sec_id, semester, year)", "x": 82, "y": 50 }], "edges": [{ "from": "course", "to": "has", "label": "owner" }, { "from": "has", "to": "section", "label": "weak entity" }] }
```
