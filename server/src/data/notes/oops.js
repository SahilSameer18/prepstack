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
            "Encapsulates data and behavior together"
          ],

          why: [
            "Improves modularity and maintainability",
            "Enables scalable system design"
          ],

          deepInsight: [
            "OOP models real-world entities using abstraction",
            "Helps manage complexity in large codebases"
          ],

          realWorld: [
            "Used heavily in backend systems (Java, C++)",
            "Design patterns rely on OOP principles"
          ],

          interviewAnswer: [
            "OOP is a paradigm that organizes code using objects to improve modularity and reuse."
          ]
        },

        {
          name: "Class vs Object",

          concept: [
            "Class → blueprint",
            "Object → instance"
          ],

          deepInsight: [
            "Class defines structure, object holds actual state"
          ],

          traps: [
            "Class does not occupy memory, object does"
          ],

          interviewAnswer: [
            "Class defines structure, object is its runtime instance."
          ]
        },

        {
          name: "Memory Model",

          concept: [
            "Stack stores references",
            "Heap stores objects"
          ],

          deepInsight: [
            "Object lifetime depends on memory management (GC or manual)"
          ],

          traps: [
            "Without 'new' doesn't always mean stack (language-specific)"
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
            "Wrapping data + methods",
            "Data hiding via access modifiers"
          ],

          deepInsight: [
            "Ensures controlled access to data",
            "Improves maintainability"
          ],

          realWorld: [
            "Private variables accessed via getters/setters"
          ],

          interviewAnswer: [
            "Encapsulation bundles data and methods and restricts direct access."
          ]
        },

        {
          name: "Abstraction",

          concept: [
            "Hides implementation details"
          ],

          deepInsight: [
            "Focuses on 'what' not 'how'"
          ],

          realWorld: [
            "APIs expose functionality without revealing logic"
          ],

          traps: [
            "Abstraction ≠ encapsulation"
          ],

          interviewAnswer: [
            "Abstraction hides complexity and shows only essential features."
          ]
        },

        {
          name: "Inheritance",

          concept: [
            "Reuse properties of parent class"
          ],

          deepInsight: [
            "Represents 'is-a' relationship"
          ],

          traps: [
            "Overuse leads to tight coupling"
          ],

          interviewAnswer: [
            "Inheritance allows a class to acquire properties of another."
          ]
        },

        {
          name: "Polymorphism",

          concept: [
            "Same interface, different behavior"
          ],

          deepInsight: [
            "Achieved via overloading and overriding"
          ],

          interviewAnswer: [
            "Polymorphism allows same function to behave differently."
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

export default oopNotes;