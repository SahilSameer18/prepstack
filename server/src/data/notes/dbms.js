const dbmsNotes = {
  subject: "Database Management Systems",
  sections: [

    // ===========================
    // 1. INTRODUCTION
    // ===========================
    {
      title: "Introduction",
      topics: [

        {
          name: "DBMS",

          concept: [
            "Software to manage structured data",
            "Provides abstraction over file systems",
            "Handles storage, retrieval, concurrency, security"
          ],

          why: [
            "File systems fail at scalability and consistency",
            "DBMS ensures reliable multi-user access"
          ],

          deepInsight: [
            "DBMS separates logical view from physical storage",
            "Uses query optimization + indexing for performance"
          ],

          realWorld: [
            "MySQL, PostgreSQL, Oracle used in backend systems",
            "Large-scale systems use distributed DBs (e.g., Cassandra)"
          ],

          traps: [
            "DBMS is not just SQL engine",
            "Not all DBMS are relational (NoSQL exists)"
          ],

          interviewAnswer: [
            "DBMS is software that manages data efficiently with support for concurrency, security, and abstraction."
          ],

          followUps: [
            "DBMS vs RDBMS?",
            "Why not use file system?"
          ]
        }

      ]
    },

    // ===========================
    // 2. ER MODEL
    // ===========================
    {
      title: "ER Model",
      topics: [

        {
          name: "Entity vs Weak Entity",

          concept: [
            "Strong entity has primary key",
            "Weak entity depends on strong entity"
          ],

          deepInsight: [
            "Weak entity uses partial key + identifying relationship"
          ],

          traps: [
            "Weak entity cannot exist independently"
          ],

          interviewAnswer: [
            "Strong entities have unique keys, while weak entities depend on another entity for identification."
          ]
        },

        {
          name: "Cardinality",

          concept: [
            "Defines mapping between entities"
          ],

          deepInsight: [
            "Important for schema design and normalization"
          ],

          interviewAnswer: [
            "Cardinality defines how many instances of one entity relate to another."
          ]
        }

      ]
    },

    // ===========================
    // 3. KEYS & CONSTRAINTS
    // ===========================
    {
      title: "Keys & Constraints",
      topics: [

        {
          name: "Keys",

          concept: [
            "Super, Candidate, Primary, Foreign"
          ],

          deepInsight: [
            "Candidate keys are minimal super keys",
            "Primary key chosen among candidates"
          ],

          traps: [
            "Primary key cannot be NULL",
            "Foreign key can be NULL (unless constrained)"
          ],

          interviewAnswer: [
            "Keys uniquely identify tuples and maintain relationships."
          ]
        },

        {
          name: "Referential Integrity",

          deepInsight: [
            "Ensures foreign key matches primary key in parent table"
          ],

          realWorld: [
            "Used in banking systems to maintain consistency"
          ],

          traps: [
            "ON DELETE CASCADE can cause unintended data loss"
          ]
        }

      ]
    },

    // ===========================
    // 4. FUNCTIONAL DEPENDENCY
    // ===========================
    {
      title: "Functional Dependency",
      topics: [

        {
          name: "FD & Closure",

          concept: [
            "X → Y means Y depends on X"
          ],

          deepInsight: [
            "Closure helps find candidate keys",
            "Used in normalization"
          ],

          traps: [
            "Closure calculation is iterative and easy to mess up"
          ],

          interviewAnswer: [
            "Functional dependency defines relationship between attributes used in normalization."
          ]
        }

      ]
    },

    // ===========================
    // 5. NORMALIZATION
    // ===========================
    {
      title: "Normalization",
      topics: [

        {
          name: "Normal Forms",

          concept: [
            "1NF → Atomic",
            "2NF → No partial dependency",
            "3NF → No transitive dependency",
            "BCNF → Stronger than 3NF"
          ],

          deepInsight: [
            "BCNF removes anomalies better than 3NF",
            "Tradeoff between normalization and performance"
          ],

          realWorld: [
            "Highly normalized schemas used in OLTP systems",
            "Denormalization used in analytics (OLAP)"
          ],

          traps: [
            "3NF ≠ BCNF",
            "Over-normalization hurts performance"
          ],

          interviewAnswer: [
            "Normalization reduces redundancy and ensures consistency using functional dependencies."
          ],

          followUps: [
            "3NF vs BCNF?",
            "When to denormalize?"
          ]
        }

      ]
    },

    // ===========================
    // 6. TRANSACTIONS
    // ===========================
    {
      title: "Transactions",
      topics: [

        {
          name: "ACID Properties",

          concept: [
            "Atomicity, Consistency, Isolation, Durability"
          ],

          deepInsight: [
            "Isolation is hardest to implement",
            "Durability achieved via logging (WAL)"
          ],

          realWorld: [
            "Bank transfers rely on atomicity",
            "Databases use write-ahead logging"
          ],

          traps: [
            "Consistency depends on application logic",
            "Isolation levels can break full isolation"
          ],

          interviewAnswer: [
            "ACID ensures reliable execution of transactions."
          ]
        }

      ]
    },

    // ===========================
    // 7. CONCURRENCY CONTROL
    // ===========================
    {
      title: "Concurrency Control",
      topics: [

        {
          name: "Serializability",

          deepInsight: [
            "Conflict serializability easier to check than view"
          ],

          traps: [
            "View serializable but not conflict serializable cases exist"
          ],

          interviewAnswer: [
            "Ensures concurrent execution is equivalent to serial execution."
          ]
        },

        {
          name: "2PL (Two Phase Locking)",

          concept: [
            "Growing phase + shrinking phase"
          ],

          deepInsight: [
            "Ensures conflict serializability"
          ],

          traps: [
            "Can cause deadlocks"
          ]
        },

        {
          name: "Isolation Levels",

          deepInsight: [
            "Tradeoff between consistency and performance"
          ],

          realWorld: [
            "Read committed used in most systems"
          ],

          traps: [
            "Repeatable read still allows phantom reads"
          ]
        }

      ]
    },

    // ===========================
    // 8. INDEXING
    // ===========================
    {
      title: "Indexing & File Organization",
      topics: [

        {
          name: "B+ Tree",

          deepInsight: [
            "All data in leaf nodes → better range queries"
          ],

          realWorld: [
            "Used in MySQL, PostgreSQL indexes"
          ],

          traps: [
            "B-tree vs B+ tree confusion"
          ],

          interviewAnswer: [
            "B+ trees are used for efficient indexing due to balanced structure."
          ]
        },

        {
          name: "Hashing",

          deepInsight: [
            "Best for equality queries, not range queries"
          ],

          traps: [
            "Hashing fails for range queries"
          ]
        }

      ]
    },

    // ===========================
    // 9. SQL
    // ===========================
    {
      title: "SQL",
      topics: [

        {
          name: "Joins",

          deepInsight: [
            "Joins combine rows from multiple tables"
          ],

          traps: [
            "INNER vs LEFT JOIN confusion",
            "Cartesian product mistakes"
          ],

          interviewAnswer: [
            "Joins retrieve data from multiple tables based on conditions."
          ]
        },

        {
          name: "GROUP BY & HAVING",

          deepInsight: [
            "HAVING filters after aggregation"
          ],

          traps: [
            "WHERE vs HAVING confusion"
          ]
        }

      ]
    },

    // ===========================
    // 10. ADVANCED
    // ===========================
    {
      title: "Advanced Concepts",
      topics: [

        {
          name: "Query Optimization",

          deepInsight: [
            "DB chooses best execution plan using cost model"
          ],

          realWorld: [
            "Indexes drastically reduce query time"
          ]
        },

        {
          name: "CAP Theorem",

          concept: [
            "Consistency, Availability, Partition Tolerance"
          ],

          deepInsight: [
            "In distributed systems, partition tolerance is mandatory"
          ],

          traps: [
            "Not exactly 'choose any 2' in real systems"
          ],

          interviewAnswer: [
            "CAP theorem explains tradeoffs in distributed databases."
          ]
        }

      ]
    }

  ]
};

export default dbmsNotes;