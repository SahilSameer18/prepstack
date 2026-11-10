---
id: dbms-sql
title: SQL
lastChecked: 2026-11-10
next: dbms-advanced-concepts
roadmapSteps: backend:database-design
---

<!-- Published 10 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date this section was checked against its sources by the author, not by a second person.
     Written from docs/content/source-notes/dbms-batch-c.md (S1c slides ch3 and ch4, S2c PostgreSQL docs, S8c MySQL manual, S6c supplied SQL notes for coverage and mistakes).
     Claims and sources: docs/content/SOURCES.md (rows for dbms-sql). When an outside reader has gone through it, fill the "Checked by" cells of those rows. -->

## Overview

SQL is the language you use to ask a relational database for data, and interviewers use it to see whether you think in sets rather than loops. The questions that come up again and again are joins, GROUP BY with HAVING, subqueries, NULL, and window functions. After this section you can say in what order a query is evaluated, choose the right join and predict its output, explain why WHERE x = NULL finds nothing, avoid the NOT IN trap, and use a window function to rank rows without collapsing them.

## Topic: What order a query runs in

**Definition:** A query is evaluated logically in an order different from the one it is written in. The database first takes the rows from FROM and its joins, then filters them with WHERE, then forms groups with GROUP BY, and then filters the groups with HAVING. The SELECT list is then computed, and ORDER BY and LIMIT apply last.

**Why:** It explains most "why does this query fail or give a strange answer" cases, such as why WHERE cannot use an aggregate.

**Example:** For SELECT city, count(*) FROM student WHERE marks >= 70 GROUP BY city HAVING count(*) >= 2, the rows with marks below 70 are removed first, then the rest are grouped by city, then groups with fewer than two rows are dropped.
```sql
SELECT city, count(*) FROM student
WHERE marks >= 70 GROUP BY city HAVING count(*) >= 2 ORDER BY city;
```

**Failure:** LIMIT without ORDER BY returns an unpredictable set of rows, so always pair them, with a unique order. A large OFFSET can be slow, because the skipped rows are still computed.

## Topic: NULL and three-valued logic

**Definition:** NULL means an unknown value or no value. Any ordinary comparison with NULL gives unknown, not true or false, and a WHERE condition that comes out unknown is treated as false.

**Why:** It is the cause of many silent wrong answers: rows that vanish from a result, or conditions that never match.

**Example:** WHERE salary = NULL returns no rows, even when salary is NULL, because NULL = NULL is unknown. The test is WHERE salary IS NULL. Arithmetic with NULL gives NULL: 5 + NULL is NULL. The logic tables: true AND unknown is unknown; false AND unknown is false; true OR unknown is true; false OR unknown is unknown.
```sql
SELECT 1 WHERE NULL = NULL;     -- no rows
SELECT 1 WHERE NULL IS NULL;    -- one row
```

**Failure:** Never write expression = NULL. If you need NULL-safe equality, In PostgreSQL, IS NOT DISTINCT FROM treats two NULLs as equal. Remember it also when filtering: WHERE x <> 5 does not return rows where x is NULL.

## Topic: Joins

**Definition:** A join combines rows of two tables using a condition. INNER JOIN keeps only matching pairs. LEFT JOIN also keeps every left row, with NULLs for the right columns when nothing matches. RIGHT JOIN is the mirror image. FULL JOIN keeps unmatched rows from both sides. CROSS JOIN pairs every row with every row. A self join joins a table to itself using two aliases.

**Why:** Related data lives in different tables, and joins put it back together.

**Example:** customer has Alice (1), Bob (2), Carol (3). orders has 101 Laptop and 102 Phone for Alice, 103 Headphones for Bob, and 104 Keyboard with no customer.
```text
INNER JOIN:  Alice Laptop | Alice Phone | Bob Headphones
LEFT JOIN:   Alice Laptop | Alice Phone | Bob Headphones | Carol NULL
RIGHT JOIN:  Alice Laptop | Alice Phone | Bob Headphones | NULL Keyboard
FULL JOIN:   the four matches above plus Carol NULL and NULL Keyboard
CROSS JOIN:  3 customers x 4 orders = 12 rows
```
The customers who have no orders: LEFT JOIN orders o ON c.id = o.customer_id WHERE o.order_id IS NULL gives Carol.

**Failure:** With an outer join, where you put a condition matters. A condition in ON is applied before the unmatched rows are added back; a condition in WHERE is applied after. LEFT JOIN orders o ON c.id = o.customer_id AND o.product = 'Phone' still lists Bob and Carol with NULL, but putting o.product = 'Phone' in WHERE leaves only Alice, because Bob's and Carol's NULL fails the test. Also, MySQL's JOIN syntax lists inner, cross, left, right and natural joins and no FULL JOIN; a workaround is a LEFT JOIN UNION a RIGHT JOIN, and UNION also removes duplicate rows. NATURAL JOIN matches on every column with the same name, so an unrelated column with the same name (like dept_name in two tables) silently changes the result; use ON or USING.

## Topic: GROUP BY and HAVING

**Definition:** GROUP BY puts rows with the same values in the listed columns into one group, so an aggregate such as count, sum, avg, min or max is computed per group. WHERE filters rows before grouping. HAVING filters the groups after grouping.

**Why:** It answers "per" questions: students per city, average salary per department.

**Example:** student rows: Delhi 90 and 70, Mumbai 95 and 92, Pune 60.
```text
GROUP BY city:                             Delhi 2 (max 90) | Mumbai 2 (max 95) | Pune 1 (max 60)
WHERE marks >= 70, then GROUP BY city:     Delhi 2 | Mumbai 2
GROUP BY city HAVING count(*) >= 2:        Delhi 2 | Mumbai 2
GROUP BY city HAVING max(marks) >= 92:     Mumbai 2
```

**Failure:** A column in the select list that is not in GROUP BY must be inside an aggregate, otherwise the query is wrong. PostgreSQL and MySQL also accept a non-grouped column that is functionally dependent on the grouped columns, for example when the grouped column is the primary key. MySQL 8.4 (ONLY_FULL_GROUP_BY, on by default) rejects a query whose non-aggregated column is neither grouped nor dependent on grouped columns, with an error; ANY_VALUE() is its workaround. HAVING is how you filter groups on the aggregate values of the same query; WHERE cannot use that query's own aggregates.

## Topic: Subqueries

**Definition:** A subquery is a query inside another query. It can return one value (a scalar subquery), a list of values (for IN), or just whether any row exists (EXISTS). A correlated subquery refers to the outer row.

**Why:** It lets one question depend on the answer to another: "students scoring above the class average".

**Example:** With marks 90, 70, 95, 92 and 60 for ids 1 to 5, the class average is 81.4, so the students above it are ids 1, 3 and 4 (marks 90, 95 and 92).
```sql
SELECT id, marks FROM student
WHERE marks > (SELECT avg(marks) FROM student);   -- ids 1, 3, 4
```
EXISTS is true when the subquery returns at least one row, whatever the columns are: WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id).

**Failure:** NOT IN with a NULL in the subquery returns no rows at all. If table a has 1, 2, 3 and table b has 2 and NULL, a.v NOT IN (SELECT v FROM b) returns nothing, because the comparison with NULL is unknown, not true. NOT EXISTS (SELECT 1 FROM b WHERE b.v = a.v) returns 1 and 3 as expected. Prefer NOT EXISTS when the subquery column can be NULL.

## Topic: UNION, INTERSECT and EXCEPT

**Definition:** Set operations combine the results of two queries that have the same number of columns with compatible types. UNION gives rows in either, INTERSECT rows in both, EXCEPT rows in the first but not the second. They remove duplicates unless you add ALL.

**Why:** Some questions are about sets of results, such as "customers who are also suppliers".

**Example:** Query 1 returns Alice, Bob, Bob. Query 2 returns Bob, Dev.
```text
UNION:      Alice, Bob, Dev
UNION ALL:  Alice, Bob, Bob, Bob, Dev
INTERSECT:  Bob
EXCEPT:     Alice
```

**Failure:** UNION ALL is usually cheaper than UNION because it skips removing duplicates, so use it when duplicates are impossible or wanted. In PostgreSQL, INTERSECT binds tighter than UNION and EXCEPT, so a UNION b INTERSECT c means a UNION (b INTERSECT c). In PostgreSQL, a LIMIT written after the last query applies to the whole combined result, not to the last query.

## Topic: Window functions

**Definition:** A window function computes a value for each row from a set of related rows (its window) but keeps every row in the result. It is written as a function followed by OVER (PARTITION BY ... ORDER BY ...). An ordinary aggregate with GROUP BY would collapse the rows into one per group.

**Why:** It answers "rank within a group", "running total" and "compare each row with its group average", which are common interview problems.

**Example:** emps: Asha dev 5000, Ravi dev 4000, Meena dev 6000, Kiran ops 3000, Zoya ops 3500.
```sql
SELECT name, dept, salary,
       row_number() OVER (PARTITION BY dept ORDER BY salary DESC) AS pos
FROM emps;
-- Meena dev 1, Asha dev 2, Ravi dev 3, Zoya ops 1, Kiran ops 2
```
avg(salary) OVER (PARTITION BY dept) puts 5000 on every dev row and 3250 on every ops row. sum(salary) OVER (ORDER BY salary) gives a running total: 3000, 6500, 10500, 15500, 21500.

**Failure:** Window functions are allowed only in SELECT and ORDER BY, not in WHERE, GROUP BY or HAVING. To keep only the top 2 per department, wrap the query as a subquery and filter on pos < 3. With ORDER BY inside OVER, the default window runs from the first row of the partition to the current row and its ties; without it, it is the whole partition. Rows that tie on the ORDER BY value get row_number values in no guaranteed order.

## Topic: Views and CTEs

**Definition:** A view is a saved query that you use like a table. A CTE (common table expression, WITH) is a named temporary result that exists only for one statement.

**Why:** Views hide columns from some users and name a complicated query once. CTEs break a long query into readable steps.

**Example:** CREATE VIEW faculty AS SELECT id, name, dept_name FROM instructor hides the salary column. A query on faculty is the saved query substituted into it. WITH regional_sales AS (SELECT ...) SELECT ... FROM regional_sales names an intermediate result.

**Failure:** An ordinary view stores the query, not the rows, so it always shows current data. In PostgreSQL a CTE can wrap SELECT, INSERT, UPDATE, DELETE or MERGE.

## Questions

### What is the difference between WHERE and HAVING?

WHERE filters rows before grouping and cannot use aggregates. HAVING filters groups after grouping and can use aggregates.

### What is the difference between INNER JOIN and LEFT JOIN?

INNER keeps only rows that match on both sides. LEFT also keeps every left row, with NULLs in the right columns when nothing matches.

### Why does WHERE x = NULL return nothing, and how do you test for NULL?

A comparison with NULL is unknown, and WHERE treats unknown as false. Use IS NULL or IS NOT NULL.

### What is the difference between UNION and UNION ALL?

UNION removes duplicate rows, UNION ALL keeps them and is usually cheaper.

### What is a window function and how is it different from GROUP BY?

It computes a value per row over a window of related rows and keeps all rows. GROUP BY collapses each group into one row.

## Mistakes

- Writing WHERE column = NULL. It never matches; use IS NULL.
- Using NOT IN against a subquery that can return NULL. It returns no rows; use NOT EXISTS.
- Putting a condition on the right table of a LEFT JOIN in WHERE, which usually turns it into an inner join because the NULL rows fail the test (an IS NULL test is the exception). Put it in ON if you want to keep the unmatched left rows.

## Quiz

### In which order are WHERE, GROUP BY and HAVING applied?

- [ ] HAVING, GROUP BY, WHERE
- [x] WHERE, GROUP BY, HAVING
- [ ] GROUP BY, WHERE, HAVING
- [ ] WHERE, HAVING, GROUP BY

Explanation: Rows are filtered first (WHERE), then grouped (GROUP BY), then the groups are filtered (HAVING). That is why HAVING can use aggregates and WHERE cannot.

### customer has Alice, Bob and Carol, and Carol has no orders. What does customer LEFT JOIN orders return for Carol?

- [ ] Carol is left out
- [x] Carol with NULL in the orders columns
- [ ] An error
- [ ] Carol repeated for every order

Explanation: A LEFT JOIN keeps every left row; when nothing matches, the right columns are NULL.

### Table a has 1, 2, 3 and table b has 2 and NULL. What does SELECT v FROM a WHERE v NOT IN (SELECT v FROM b) return?

- [ ] 1 and 3
- [ ] 1, 2 and 3
- [x] No rows
- [ ] 2

Explanation: For 1, the comparison with the NULL in b is unknown, so NOT IN is not true. No row passes. NOT EXISTS would return 1 and 3.

### What does WHERE salary = NULL return?

- [ ] Rows where salary is NULL
- [ ] Rows where salary is not NULL
- [x] No rows
- [ ] All rows

Explanation: NULL = NULL is unknown, not true, and WHERE keeps only rows where the condition is true. Use IS NULL.

### Query 1 returns Alice, Bob, Bob and query 2 returns Bob, Dev. How many rows does UNION ALL return?

- [ ] 3
- [ ] 4
- [x] 5
- [ ] 2

Explanation: UNION ALL keeps every row: Alice, Bob, Bob, Bob, Dev. UNION would remove duplicates and give 3.

## Diagram

```json
{ "kind": "flow", "caption": "The order in which the parts of a query are applied.", "steps": [{ "label": "FROM and joins" }, { "label": "WHERE filters rows" }, { "label": "GROUP BY makes groups" }, { "label": "HAVING filters groups" }, { "label": "SELECT list" }, { "label": "ORDER BY, then LIMIT" }] }
```
