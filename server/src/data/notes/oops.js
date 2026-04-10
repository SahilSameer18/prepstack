const oopNotes = {
  subject: "Object Oriented Programming",
  sections: [

    // ===========================
    // 1. BASICS
    // ===========================
    {
  title: "Basics",
  topics: [

    {
      name: "OOP Overview",

      concept: [
        "Programming paradigm based on objects and classes",
        "Encapsulates data (state) and behavior (methods) together",
        "Supports abstraction, encapsulation, inheritance, and polymorphism"
      ],

      why: [
        "Improves modularity and code organization",
        "Enhances reusability and scalability",
        "Simplifies maintenance of large codebases"
      ],

      deepInsight: [
        "OOP abstracts real-world entities into software models",
        "Encapsulation hides internal implementation and exposes only necessary interfaces",
        "OOP enables loose coupling and high cohesion in system design"
      ],

      realWorld: [
        "Widely used in backend systems (Java, C++)",
        "Design patterns like Singleton, Factory, Observer rely on OOP",
        "Frameworks like Spring and Django are heavily OOP-driven"
      ],

      interviewAnswer: [
        "OOP is a programming paradigm that organizes code using objects and classes to achieve modularity, reusability, and abstraction."
      ]
    },

    {
      name: "Class vs Object",

      concept: [
        "Class → blueprint or template defining properties and behavior",
        "Object → runtime instance of a class with actual values",
        "Multiple objects can be created from a single class"
      ],

      deepInsight: [
        "Class defines structure, object represents real data",
        "Objects occupy memory at runtime, classes define compile-time structure",
        "Interaction between objects forms the core of OOP systems"
      ],

      traps: [
        "Class does not occupy memory until objects are created",
        "Object creation involves constructor invocation",
        "Confusing class with object leads to design issues"
      ],

      interviewAnswer: [
        "A class is a blueprint that defines properties and behavior, while an object is an instance of that class created at runtime."
      ]
    },

    {
      name: "Memory Model",

      concept: [
        "Stack stores function calls, local variables, and references",
        "Heap stores dynamically allocated objects",
        "Memory is divided based on lifetime and scope"
      ],

      deepInsight: [
        "Stack allocation is fast but limited in size",
        "Heap allocation is flexible but slower and requires management",
        "Garbage Collection (GC) automatically frees unused heap memory in languages like Java",
        "Memory leaks occur when unused objects are not released (in manual memory management)"
      ],

      traps: [
        "Stack vs Heap behavior is language-dependent",
        "Using 'new' typically allocates on heap (but not always universally true)",
        "Returning references to local stack variables can cause undefined behavior (in some languages)"
      ]
    }

  ]
},

    // ===========================
    // 2. PILLARS
    // ===========================
    {
  title: "Pillars of OOP",
  topics: [

    {
      name: "Encapsulation",

      concept: [
        "Wrapping data and methods into a single unit (class)",
        "Restricting direct access using access modifiers (private, protected, public)"
      ],

      deepInsight: [
        "Ensures controlled access through well-defined interfaces (getters/setters)",
        "Improves maintainability and flexibility by hiding internal implementation",
        "Enables validation and security checks before modifying data"
      ],

      realWorld: [
        "Private variables accessed via getters/setters",
        "Bank account class controlling balance updates via methods"
      ],

      interviewAnswer: [
        "Encapsulation is the bundling of data and methods into a single unit while restricting direct access using access modifiers."
      ]
    },

    {
      name: "Abstraction",

      concept: [
        "Hides implementation details and exposes only essential features",
        "Achieved using abstract classes and interfaces"
      ],

      deepInsight: [
        "Focuses on 'what' the system does rather than 'how' it does it",
        "Reduces complexity by hiding unnecessary details",
        "Improves code extensibility and design flexibility"
      ],

      realWorld: [
        "APIs expose functionality without revealing internal logic",
        "Driving a car without knowing engine internals"
      ],

      traps: [
        "Abstraction ≠ Encapsulation (abstraction hides complexity, encapsulation hides data)",
        "Interfaces provide 100% abstraction (in traditional OOP languages)"
      ],

      interviewAnswer: [
        "Abstraction is the process of hiding implementation details and exposing only the essential functionality."
      ]
    },

    {
      name: "Inheritance",

      concept: [
        "Mechanism where a child class acquires properties and behavior of a parent class",
        "Promotes code reuse and hierarchical relationships"
      ],

      deepInsight: [
        "Represents 'is-a' relationship (e.g., Dog is an Animal)",
        "Supports method overriding for runtime polymorphism",
        "Can lead to tight coupling if overused"
      ],

      realWorld: [
        "Base class Vehicle → derived classes Car, Bike",
        "UI frameworks with base components extended by custom components"
      ],

      traps: [
        "Overuse leads to rigid and tightly coupled design",
        "Prefer composition over inheritance in many real-world scenarios"
      ],

      interviewAnswer: [
        "Inheritance allows a class to reuse properties and methods of another class, forming an 'is-a' relationship."
      ]
    },

    {
      name: "Polymorphism",

      concept: [
        "Same interface, different implementations",
        "Allows methods to behave differently based on context"
      ],

      deepInsight: [
        "Achieved via method overloading (compile-time) and overriding (runtime)",
        "Improves flexibility and scalability of code",
        "Runtime polymorphism uses dynamic method dispatch"
      ],

      interviewAnswer: [
        "Polymorphism allows a single interface to be used for different data types or implementations, enabling flexible and reusable code."
      ]
    }

  ]
},

    // ===========================
    // 3. POLYMORPHISM (IMPORTANT)
    // ===========================
    {
      title: "Polymorphism",
      topics: [

        {
          name: "Overloading vs Overriding",

          deepInsight: [
            "Overloading → compile-time resolution",
            "Overriding → runtime (dynamic dispatch)"
          ],

          traps: [
            "Return type alone can't overload",
            "Overriding requires same signature"
          ],

          interviewAnswer: [
            "Overloading is compile-time, overriding is runtime polymorphism."
          ]
        },

        {
          name: "Runtime Polymorphism",

          deepInsight: [
            "Uses vtable for dynamic dispatch"
          ],

          realWorld: [
            "Used in plugin systems and frameworks"
          ]
        }

      ]
    },

    // ===========================
    // 4. CONSTRUCTORS
    // ===========================
    {
      title: "Constructors & Destructors",
      topics: [

        {
          name: "Constructor",

          concept: [
            "Initializes object"
          ],

          deepInsight: [
            "Constructor chaining in inheritance"
          ],

          traps: [
            "Default constructor not created if parameterized exists (C++)"
          ]
        },

        {
          name: "Copy Constructor",

          deepInsight: [
            "Used for deep copy"
          ],

          traps: [
            "Shallow copy causes memory issues"
          ]
        },

        {
          name: "Destructor",

          deepInsight: [
            "Releases resources (important in C++)"
          ],

          realWorld: [
            "Used for memory/file cleanup"
          ]
        }

      ]
    },

    // ===========================
    // 5. VIRTUAL FUNCTIONS
    // ===========================
    {
      title: "Virtual Functions",
      topics: [

        {
          name: "Virtual Function",

          concept: [
            "Resolved at runtime"
          ],

          deepInsight: [
            "Uses vtable for dynamic binding"
          ],

          traps: [
            "Constructor cannot be virtual"
          ],

          interviewAnswer: [
            "Virtual functions enable runtime polymorphism."
          ]
        },

        {
          name: "Abstract Class",

          deepInsight: [
            "Defines contract for derived classes"
          ],

          interviewAnswer: [
            "Abstract class cannot be instantiated and enforces implementation."
          ]
        }

      ]
    },

    // ===========================
    // 6. OBJECT RELATIONSHIPS
    // ===========================
    {
      title: "Relationships",
      topics: [

        {
          name: "Association vs Aggregation vs Composition",

          deepInsight: [
            "Aggregation = weak HAS-A",
            "Composition = strong ownership"
          ],

          realWorld: [
            "Car HAS-A engine (composition)"
          ],

          traps: [
            "Composition implies lifecycle dependency"
          ],

          interviewAnswer: [
            "Composition is strong relationship, aggregation is weak."
          ]
        }

      ]
    },

    // ===========================
    // 7. ADVANCED
    // ===========================
    {
      title: "Advanced Concepts",
      topics: [

        {
          name: "Deep vs Shallow Copy",

          deepInsight: [
            "Deep copy duplicates memory, shallow copies reference"
          ],

          traps: [
            "Shallow copy causes double free issues"
          ]
        },

        {
          name: "Object Slicing",

          deepInsight: [
            "Occurs when derived assigned to base"
          ],

          traps: [
            "Loses derived-specific data"
          ]
        }

      ]
    },

    // ===========================
    // 8. SOLID PRINCIPLES
    // ===========================
    {
      title: "SOLID Principles",
      topics: [

        {
          name: "SOLID",

          deepInsight: [
            "Foundation of scalable system design"
          ],

          realWorld: [
            "Used in large-scale backend architectures"
          ],

          interviewAnswer: [
            "SOLID principles improve maintainability and flexibility of code."
          ],

          followUps: [
            "Real example of SRP?",
            "Violation of LSP?"
          ]
        }

      ]
    },

    // ===========================
    // 9. INTERVIEW BOOST
    // ===========================
    {
      title: "Interview Boost",
      topics: [

        {
          name: "Must Know Questions",

          list: [
            "Encapsulation vs Abstraction?",
            "Overloading vs Overriding?",
            "Virtual function and vtable?",
            "What is object slicing?",
            "Explain SOLID with examples?"
          ]
        }

      ]
    }

  ]
};

module.exports = oopNotes;