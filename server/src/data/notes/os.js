const operatingSystemsNotes = {
  subject: "Operating Systems",
  sections: [

    // ===========================
    // 1. INTRODUCTION
    // ===========================
    {
      title: "Introduction",
      topics: [

        {
          name: "Operating System Overview",

          concept: [
            "Acts as interface between user and hardware",
            "Manages CPU, memory, I/O devices, files",
            "Provides abstraction and virtualization",
            "Ensures isolation and security"
          ],

          why: [
            "Simplifies programming",
            "Prevents direct unsafe hardware access"
          ],

          deepInsight: [
            "OS is both resource manager and control program",
            "Virtualization allows multiple programs to share hardware efficiently"
          ],

          realWorld: [
            "Linux kernel manages processes, memory, scheduling",
            "Android is based on Linux kernel"
          ],

          traps: [
            "OS is not just UI (GUI is only a part)",
            "Kernel ≠ entire OS"
          ],

          interviewAnswer: [
            "An OS manages hardware resources and provides abstractions for applications.",
            "It ensures efficient execution, isolation, and security."
          ],

          followUps: [
            "What is kernel?",
            "User mode vs kernel mode?"
          ]
        }

      ]
    },

    // ===========================
    // 2. PROCESSES & THREADS
    // ===========================
    {
      title: "Processes & Threads",
      topics: [

        {
          name: "Process",

          concept: [
            "Program in execution",
            "Own address space",
            "Represented by PCB"
          ],

          deepInsight: [
            "Process isolation via virtual memory",
            "Context switch is expensive due to memory switch"
          ],

          realWorld: [
            "Chrome uses multi-process architecture"
          ],

          pcbContains: [
            "PID, PC, Registers",
            "Memory, Scheduling info"
          ],

          flow: [
            "New → Ready → Running → Waiting → Terminated"
          ],

          traps: [
            "Process ≠ program",
            "Processes don't share memory"
          ],

          interviewAnswer: [
            "A process is an executing program with its own address space and resources."
          ],

          followUps: [
            "Process vs thread?",
            "Context switching?"
          ]
        },

        {
          name: "Thread",

          concept: [
            "Lightweight execution unit",
            "Shared memory, separate stack"
          ],

          deepInsight: [
            "Fast switching but synchronization needed"
          ],

          realWorld: [
            "Used in servers for concurrency"
          ],

          traps: [
            "Threads can cause race conditions"
          ],

          interviewAnswer: [
            "Thread is a lightweight unit sharing memory within a process."
          ]
        },

        {
          name: "Context Switching",

          concept: [
            "Switching CPU from one process/thread to another"
          ],

          flow: [
            "Save state → Update PCB → Load next process"
          ],

          deepInsight: [
            "Pure overhead, reduces performance"
          ],

          traps: [
            "Too frequent switching harms CPU utilization"
          ],

          interviewAnswer: [
            "Context switching saves current state and loads another process state."
          ]
        }

      ]
    },

    // ===========================
    // 3. CPU SCHEDULING
    // ===========================
    {
      title: "CPU Scheduling",
      topics: [

        {
          name: "Scheduling Goals",

          concept: [
            "Maximize CPU utilization",
            "Minimize waiting, turnaround, response time",
            "Ensure fairness"
          ]
        },

        {
          name: "SJF",

          deepInsight: [
            "Optimal avg waiting time (greedy)"
          ],

          traps: [
            "Starvation possible",
            "Needs burst prediction"
          ],

          interviewAnswer: [
            "SJF minimizes average waiting time but is impractical."
          ]
        },

        {
          name: "Round Robin",

          deepInsight: [
            "Time quantum critical"
          ],

          traps: [
            "Too small → overhead",
            "Too large → FCFS"
          ],

          interviewAnswer: [
            "Fair scheduling using time slices."
          ]
        },

        {
          name: "MLFQ",

          deepInsight: [
            "Dynamic priority scheduling"
          ],

          realWorld: [
            "Basis for modern OS schedulers"
          ],

          interviewAnswer: [
            "MLFQ adjusts priorities based on behavior."
          ]
        }

      ]
    },

    // ===========================
    // 4. SYNCHRONIZATION
    // ===========================
    {
      title: "Synchronization",
      topics: [

        {
          name: "Critical Section",

          concept: [
            "Code accessing shared resource"
          ],

          conditions: [
            "Mutual Exclusion",
            "Progress",
            "Bounded Waiting"
          ]
        },

        {
          name: "Mutex vs Semaphore",

          deepInsight: [
            "Mutex has ownership, semaphore doesn't"
          ],

          traps: [
            "Binary semaphore ≠ mutex"
          ],

          interviewAnswer: [
            "Mutex is lock, semaphore is signaling mechanism."
          ]
        },

        {
          name: "Race Condition",

          concept: [
            "Unpredictable results due to concurrent access"
          ],

          interviewAnswer: [
            "Occurs when multiple threads access shared data without synchronization."
          ]
        }

      ]
    },

    // ===========================
    // 5. DEADLOCKS
    // ===========================
    {
      title: "Deadlocks",
      topics: [

        {
          name: "Conditions",

          concept: [
            "Mutual Exclusion",
            "Hold & Wait",
            "No Preemption",
            "Circular Wait"
          ]
        },

        {
          name: "Handling",

          concept: [
            "Prevention, Avoidance, Detection, Ignore"
          ],

          deepInsight: [
            "Banker's algorithm avoids unsafe states"
          ],

          traps: [
            "Deadlock ≠ starvation"
          ],

          interviewAnswer: [
            "Deadlock occurs when processes wait indefinitely due to circular dependency."
          ]
        }

      ]
    },

    // ===========================
    // 6. MEMORY MANAGEMENT
    // ===========================
    {
      title: "Memory Management",
      topics: [

        {
          name: "Paging",

          deepInsight: [
            "Removes external but not internal fragmentation"
          ],

          flow: [
            "Virtual → Page table → Frame → Physical address"
          ],

          interviewAnswer: [
            "Paging divides memory into pages and frames."
          ]
        },

        {
          name: "TLB",

          concept: [
            "Cache for page table"
          ],

          deepInsight: [
            "Improves access time significantly"
          ]
        },

        {
          name: "Page Replacement",

          concept: [
            "FIFO, LRU, Optimal"
          ],

          traps: [
            "LRU ≠ optimal"
          ]
        },

        {
          name: "Thrashing",

          concept: [
            "Too many page faults"
          ],

          solution: [
            "Working set model"
          ],

          interviewAnswer: [
            "System spends more time paging than executing."
          ]
        }

      ]
    },

    // ===========================
    // 7. DISK SCHEDULING
    // ===========================
    {
      title: "Disk Scheduling",
      topics: [

        {
          name: "Algorithms",

          concept: [
            "FCFS, SSTF, SCAN, CSCAN, LOOK"
          ],

          deepInsight: [
            "SCAN = elevator algorithm"
          ]
        }

      ]
    },

    // ===========================
    // 8. SYSTEM CONCEPTS
    // ===========================
    {
      title: "System Concepts",
      topics: [

        {
          name: "System Calls",

          concept: [
            "Interface between user and kernel"
          ]
        },

        {
          name: "IPC",

          concept: [
            "Shared memory, message passing"
          ],

          traps: [
            "Shared memory faster but complex"
          ]
        },

        {
          name: "Kernel Types",

          concept: [
            "Monolithic, Microkernel, Hybrid"
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
            "Process vs Thread?",
            "What is context switching?",
            "Explain deadlock",
            "What is thrashing?",
            "How virtual memory works?"
          ]
        }

      ]
    }

  ]
};

module.exports = operatingSystemsNotes;