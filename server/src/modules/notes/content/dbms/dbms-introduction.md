---
id: dbms-introduction
title: Introduction
lastChecked: 2026-11-10
next: dbms-er-model
roadmapSteps: backend:database-design
---

<!-- Published 10 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date this section was checked against its sources by the author, not by a second person.
     Written from docs/content/source-notes/dbms-batch-d.md (S1d slides ch1, S4d supplied notes for the definitions of database and DBMS).
     Claims and sources: docs/content/SOURCES.md (rows for dbms-introduction). When an outside reader has gone through it, fill the "Checked by" cells of those rows. -->

## Overview

A database management system, or DBMS, is the software that stores data and lets many programs read and change it safely. Interviewers open with this topic to see whether you know why we use a DBMS instead of plain files, and whether you can name its parts. After this section you can list the problems of file-based storage with an example for each. You can also explain schema (the structure), instance (the data at one moment) and data independence, say what DDL and DML are, and describe what happens inside the system when a query (a request for data) arrives.

## Topic: Why a DBMS and not files

**Definition:** Early applications kept data directly in files. That caused redundancy (the same data stored in many places) and inconsistency (those copies disagreeing), difficulty accessing data, and data isolation (data scattered in separate files and formats). It also caused integrity problems (rules about valid data are not enforced), lost atomicity (an operation is not all-or-nothing), trouble with concurrent users (many people using the data at once), and security problems. A DBMS offers solutions to all of these.

**Why:** Each problem is something you would otherwise have to rebuild inside every program.

**Example:** Redundancy: a customer's address is copied into the billing file and the shipping file, and one copy is updated. Difficult access: a new question needs a new program. Integrity: the rule "balance must be above zero" is buried in code and is easy to miss when you change it. Atomicity: a transfer fails halfway and the money has gone. Concurrency: two people read a balance of 100 and each withdraw 50 at the same moment, and the balance can end at 50 instead of 0. Security: it is hard to let someone see some data and not all.

**Failure:** A DBMS is the software and a database is the data; keep the two words apart.

## Topic: Data models and the relational model

**Definition:** A data model is a set of tools for describing data, the relationships between data, their meaning and their constraints (the rules the data must follow). The relational model stores all data in tables with rows and columns.

**Why:** The model decides how you think about the data and which queries are easy.

**Example:** A student table has columns roll_no, name and dept, and one row per student. Other models exist: the entity-relationship model (mainly for design), object-based models, semi-structured models such as XML, and the older network and hierarchical models. The relational model came from Ted Codd, who received the Turing Award (a major prize in computing) in 1981.

**Failure:** The entity-relationship model is mostly a design tool: you draw a design in it and then turn it into relational tables. NoSQL systems (non-relational databases, which do not use the table model) appeared in the 2000s for big-data storage.

## Topic: Schema, instance and data independence

**Definition:** The logical schema is the overall logical structure of the database, such as which tables and columns exist. The physical schema is how the data is physically stored. An instance is the actual content at one moment in time. Physical data independence means you can change the physical schema without changing the logical schema. In other words, you can change how data is stored without changing how it is described.

**Why:** Programs depend on the logical schema, so storage can be improved without rewriting them.

**Example:** The schema student(roll_no, name, dept) stays the same while rows come and go; the set of rows at 10 a.m. is an instance. Adding an index (a lookup structure that speeds up searches) or moving a table to faster storage is a physical change, and the queries written against student keep working.

**Failure:** A useful comparison for programmers: the schema is like a type and the instance is like the value of a variable of that type.

## Topic: DDL, DML and SQL

**Definition:** A data definition language (DDL) defines the schema. A data manipulation language (DML) reads and changes the data, and is also called the query language. SQL (the standard language for talking to databases) has both. A declarative language says what data you want. A procedural one also says how to get it.

**Why:** Declarative queries are usually easier to use, and they leave the DBMS free to choose how to run them (see the optimizer, the part that picks the best way to run a query).

**Example:** CREATE TABLE instructor (...) is DDL; the DBMS stores the definition in the data dictionary. The data dictionary holds metadata (data about data) such as the schema, integrity constraints (rules the data must obey) and who may access what. SELECT name FROM instructor WHERE dept_name = 'Comp. Sci.' is DML, and says what, not how.
```sql
SELECT name FROM instructor WHERE dept_name = 'Comp. Sci.';
```

**Failure:** SQL is not a general-purpose language: it does not handle user input, screen output or network communication. Applications are written in a language such as Java or Python and send SQL to the database, through embedded SQL (SQL written inside the program) or an interface such as JDBC or ODBC (standard connection tools between programs and databases).

## Topic: What is inside a DBMS

**Definition:** A DBMS has three main parts: the storage manager, the query processor and the transaction manager.

**Why:** Naming the parts shows you understand a query does not just "run".

**Example:** The storage manager talks to the operating system's files and holds the data files, the data dictionary and the indexes. It includes the buffer manager, which keeps copies of disk blocks in memory. The query processor has a DDL interpreter, a DML compiler that turns a query into a plan and picks the cheapest one, and an evaluation engine that executes the plan. The steps are parsing and translation (reading the query and converting it to an internal form), optimization (choosing the cheapest plan), then evaluation (running the plan). The transaction management component keeps the database consistent despite crashes. A transaction is one unit of work that must happen completely or not at all. Its concurrency-control manager controls how concurrent transactions interact.

**Failure:** The optimizer chooses among several plans using estimated costs. A query can therefore be fast or slow depending on the plan and on the indexes available, not only on how it is written.

## Topic: Tiers, users and the administrator

**Definition:** A tier is one layer of the setup. In a two-tier design the application runs on the client (the user's machine) and talks to the database server. In a three-tier design the client is only a front end that talks to an application server, which talks to the database. The database administrator (DBA) is the person responsible for the system's schema, storage, access and upkeep.

**Why:** Web applications are typically built three-tier: the browser talks to an application server, not to the database.

**Example:** The DBA defines the schema and storage structures, grants access, does routine maintenance and backups, keeps enough disk space, and watches for jobs that slow the system down. Users include naive users who use ready-made applications, application programmers, sophisticated users who write queries or use analysis tools, and specialized users with CAD (computer-aided design) or multimedia data.

**Failure:** Do not confuse the DBA's job with the programmer's: the DBA manages the system, the programmer writes the application.

## Questions

### What are the advantages of a DBMS over a file system?

It avoids redundancy and inconsistency, makes new queries easy, lets integrity rules be declared once in the database, makes updates atomic (all-or-nothing), controls concurrent access and lets access be granted to part of the data.

### What is the difference between a schema and an instance?

The schema is the structure of the database; the instance is the data it holds at a given moment.

### What is physical data independence?

The ability to change how data is stored, such as adding an index, without changing the logical schema or the programs that use it.

### What happens inside the DBMS when you run a query?

The query is parsed and translated, the optimizer picks the cheapest plan, and the evaluation engine executes it against the data.

## Mistakes

- Saying SQL is a database. SQL is a language; MySQL and PostgreSQL are database systems that use it.
- Using database and DBMS as the same word. The database is the data; the DBMS is the software that manages it.
- Thinking SQL alone can build a whole application. It does not handle user input, output or the network, so a host language is needed.

## Quiz

### Two people read a balance of 100 and each withdraw 50 at the same time. Which file-system problem is this?

- [ ] Data redundancy
- [ ] Security problems
- [x] Concurrent access by multiple users
- [ ] Data isolation

Explanation: Uncontrolled concurrent access (many users at once) can leave the balance wrong, because both updates start from the same value. A DBMS controls this.

### Which component records the definitions from CREATE TABLE in the data dictionary?

- [ ] The buffer manager
- [x] The DDL interpreter
- [ ] The evaluation engine
- [ ] The concurrency-control manager

Explanation: The DDL interpreter (the slides also call it the DDL compiler) interprets DDL statements and records the definitions in the data dictionary.

### The rows of the student table at 10 a.m. are best described as:

- [ ] The logical schema
- [ ] The physical schema
- [x] An instance
- [ ] The data dictionary

Explanation: An instance is the actual content of the database at a particular moment. The schema is the structure.

### What does physical data independence allow?

- [ ] Changing the columns of a table without changing queries
- [x] Changing how data is stored without changing the logical schema
- [ ] Running queries without a schema
- [ ] Removing the need for indexes

Explanation: It is the ability to change the physical schema, for example by adding an index, while the logical schema and programs stay the same.

### In a three-tier architecture, what does the client talk to?

- [ ] The database server directly
- [x] An application server
- [ ] The data dictionary
- [ ] The DBA

Explanation: The client is a front end with no direct database calls (it never asks the database itself). The application server talks to the database.

## Diagram

```json
{ "kind": "layers", "caption": "A three-tier application: the client never talks to the database directly.", "layers": [{ "label": "Client (front end)" }, { "label": "Application server" }, { "label": "Database system" }] }
```

## Diagram

```json
{ "kind": "flow", "caption": "The three steps of query processing.", "steps": [{ "label": "Parse and translate" }, { "label": "Optimize: choose the cheapest plan" }, { "label": "Evaluate the plan" }] }
```
