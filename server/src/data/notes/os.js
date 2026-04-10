const operatingSystemsNotes = {
  subject: "Operating Systems",
  sections: [

    // ===========================
    // 1. INTRODUCTION
    // ===========================
    {
      "title": "Introduction",
      "topics": [
        {
          "name": "Operating System Overview",
          "concept": [
            "Acts as interface between user and hardware",
            "Manages CPU, memory, I/O devices, files",
            "Provides abstraction and virtualization",
            "Ensures isolation and security"
          ],
          "why": [
            "Simplifies programming by providing high-level abstractions",
            "Prevents direct unsafe hardware access, ensuring system stability and security"
          ],
          "deepInsight": [
            "OS is both a resource manager and control program, overseeing critical resources like CPU, memory, and I/O devices while ensuring fairness and efficiency.",
            "Virtualization allows multiple programs to share hardware efficiently, giving the illusion of dedicated resources for each program."
          ],
          "realWorld": [
            "Linux kernel manages processes, memory, scheduling, and device drivers; it's the backbone of many systems, including Android.",
            "Android, a popular mobile OS, is based on the Linux kernel, leveraging its power for process management and resource allocation."
          ],
          "traps": [
            "OS is not just the graphical user interface (GUI); it also includes essential components like the kernel, system libraries, and system utilities.",
            "The kernel is a core part of the OS, but it does not represent the entire OS; other components like the shell, file systems, and system services are crucial as well."
          ],
          "interviewAnswer": [
            "An operating system is software that manages hardware resources and provides an abstraction layer for applications. It ensures efficient execution, isolation between programs, and enforces security.",
            "The OS is crucial for multitasking, memory management, device control, and providing a safe environment for applications to run."
          ],
          "followUps": [
            "What is a kernel, and what is its role in an operating system?",
            "Can you explain the difference between user mode and kernel mode?"
          ]
        }
      ]
    },

    // ===========================
    // 2. PROCESSES & THREADS
    // ===========================
    {
      title: "Processes & Threads",

      overview: [
        "Core execution units in an operating system",
        "Processes provide isolation, threads provide concurrency"
      ],

      topics: [

        {
          name: "Process",

          concept: [
            "A process is a program in execution",
            "Each process has its own virtual address space",
            "Managed using Process Control Block (PCB)"
          ],

          pcbContains: [
            "PID, Program Counter, CPU registers",
            "Process state, scheduling info",
            "Memory info, I/O status"
          ],

          flow: [
            "New → Ready → Running → Waiting → Terminated"
          ],

          deepInsight: [
            "Processes are isolated using virtual memory",
            "Inter-process communication (IPC) is required to share data",
            "Heavyweight: creation and switching is costly"
          ],

          realWorld: [
            "Google Chrome uses multi-process architecture for stability (tab isolation)"
          ],

          traps: [
            "Process ≠ program (program is static, process is executing)",
            "Processes do not share memory by default"
          ],

          interviewAnswer: [
            "A process is an independent execution unit with its own memory space and system resources managed by the OS."
          ],

          followUps: [
            "Why are processes expensive?",
            "How do processes communicate?",
            "What is fork()?"
          ]
        },

        {
          name: "Thread",

          concept: [
            "A thread is a lightweight unit of execution within a process",
            "Threads share code, data, and heap of the process",
            "Each thread has its own stack and registers"
          ],

          deepInsight: [
            "Thread creation and switching is faster than processes",
            "Shared memory makes communication easy but unsafe",
            "Requires synchronization (mutex, semaphore)"
          ],

          types: [

            {
              name: "User-Level Threads",
              point: "Managed by user libraries, fast but no true parallelism (in some models)"
            },

            {
              name: "Kernel-Level Threads",
              point: "Managed by OS, slower but supports true parallel execution"
            }

          ],

          realWorld: [
            "Web servers handle multiple requests using threads for concurrency"
          ],

          traps: [
            "Threads share memory → leads to race conditions",
            "Crash in one thread can crash entire process"
          ],

          interviewAnswer: [
            "A thread is a lightweight execution unit within a process that shares memory but has its own execution context."
          ],

          followUps: [
            "Difference between user and kernel threads?",
            "What is race condition?",
            "Why are threads faster?"
          ]
        },

        {
          name: "Process vs Thread (Very Important)",

          comparison: [
            "Process → independent, Thread → dependent",
            "Process → separate memory, Thread → shared memory",
            "Process → heavy, Thread → lightweight",
            "Process communication → IPC, Thread → direct memory access",
            "Context switch → costly (process), cheaper (thread)"
          ],

          deepInsight: [
            "Threads improve performance but reduce safety",
            "Processes provide isolation but reduce speed"
          ],

          traps: [
            "Threads are not always better (synchronization overhead)",
            "Multi-threading can lead to deadlocks"
          ],

          interviewAnswer: [
            "Processes are independent execution units with separate memory, while threads are lightweight units within a process that share memory for faster communication."
          ]
        },

        {
          name: "Context Switching",

          concept: [
            "Switching CPU from one process/thread to another"
          ],

          flow: [
            "Save current state → Update PCB/TCB → Load next state → Resume execution"
          ],

          types: [
            "Process context switch (expensive)",
            "Thread context switch (faster)"
          ],

          deepInsight: [
            "No useful work is done during context switch (pure overhead)",
            "Too many switches → performance degradation",
            "Critical in multitasking systems"
          ],

          traps: [
            "Context switching is NOT free",
            "High concurrency can reduce performance due to overhead"
          ],

          interviewAnswer: [
            "Context switching is the process of saving the state of the current execution unit and loading the state of another to enable multitasking."
          ],

          followUps: [
            "Why is process switching more expensive?",
            "What is TCB?",
            "How does context switching affect CPU utilization?"
          ]
        }

      ]
    },

    // ===========================
    // 3. CPU SCHEDULING
    // ===========================
    {
      "title": "CPU Scheduling",
      "topics": [
        {
          "name": "Scheduling Goals",
          "concept": [
            "The primary goal of CPU scheduling is to maximize CPU utilization by ensuring that the CPU is always active, reducing idle time.",
            "Minimizing waiting time, turnaround time, and response time is crucial for improving system performance and providing a better user experience. These metrics are important in time-sharing systems and batch systems.",
            "Fairness ensures that all processes get a reasonable share of the CPU time, preventing any single process from monopolizing the system's resources."
          ]
        },

        {
          "name": "SJF",
          "deepInsight": [
            "Shortest Job First (SJF) is considered an optimal scheduling algorithm because it minimizes the average waiting time for a set of processes. It works on the greedy principle, always selecting the process with the shortest burst time to execute next.",
            "However, SJF requires knowledge of the process burst time in advance, which is often impractical in real-world scenarios."
          ],
          "traps": [
            "Starvation is a possibility with SJF, as processes with longer burst times may never get a chance to execute if shorter processes keep arriving.",
            "SJF requires burst time prediction, which may not always be accurate, leading to poor scheduling decisions."
          ],
          "interviewAnswer": [
            "Shortest Job First minimizes the average waiting time, making it optimal in that sense. However, it is impractical for real-world systems because it requires knowledge of the process burst time in advance, and it can lead to starvation."
          ]
        },

        {
          "name": "Round Robin",
          "deepInsight": [
            "Round Robin (RR) is a preemptive scheduling algorithm that allocates a fixed time slice (time quantum) to each process. After the time quantum expires, the process is preempted and the next process in the queue is scheduled.",
            "The length of the time quantum is critical in Round Robin scheduling. If it is too small, the system spends too much time switching between processes, causing significant overhead. If it's too large, the system behaves similarly to First-Come, First-Served (FCFS), where processes with longer burst times could monopolize the CPU."
          ],
          "traps": [
            "If the time quantum is too small, the overhead from frequent context switches can become excessive, leading to poor system performance.",
            "If the time quantum is too large, Round Robin essentially degenerates into FCFS, where the fairness of the system is compromised, and processes may suffer from longer waiting times."
          ],
          "interviewAnswer": [
            "Round Robin provides fair scheduling by dividing CPU time into time slices. However, the efficiency of the algorithm depends heavily on selecting an optimal time quantum."
          ]
        },

        {
          "name": "MLFQ",
          "deepInsight": [
            "Multilevel Feedback Queue (MLFQ) is a sophisticated scheduling algorithm that dynamically adjusts process priorities based on their behavior (i.e., how much CPU time they consume).",
            "A process starts in the highest priority queue. If it uses up its time quantum, it is moved to a lower-priority queue. If a process is interactive and doesn't use up its time slice, it may be moved back to a higher-priority queue to ensure it gets CPU time quickly."
          ],
          "realWorld": [
            "MLFQ is the foundation for many modern operating system schedulers, including those used in UNIX-like systems. It helps balance both interactive and CPU-bound tasks, offering fairness and responsiveness."
          ],
          "interviewAnswer": [
            "MLFQ is a dynamic priority scheduling algorithm where processes' priorities change based on their behavior. It’s designed to efficiently manage both interactive and compute-heavy processes."
          ]
        }
      ]
    },

    // ===========================
    // 4. SYNCHRONIZATION
    // ===========================
    {
      "title": "Synchronization",
      "topics": [
        {
          "name": "Critical Section",
          "concept": [
            "A critical section is a part of the code where a shared resource (like a variable, file, or device) is accessed by multiple threads or processes. To avoid data corruption or inconsistency, the critical section must be managed carefully to ensure that only one thread accesses the resource at a time."
          ],
          "conditions": [
            "Mutual Exclusion: Only one thread can be in the critical section at a time, preventing race conditions.",
            "Progress: If no thread is currently in the critical section and one or more threads are requesting access, then the system must allow at least one of them to enter the critical section in a finite amount of time.",
            "Bounded Waiting: There must be a limit on the number of times other threads can enter the critical section before a waiting thread is allowed to enter. This ensures that no thread will wait indefinitely."
          ]
        },

        {
          "name": "Mutex vs Semaphore",
          "deepInsight": [
            "A Mutex (short for 'mutual exclusion') is a synchronization primitive that ensures that only one thread can access a critical section at a time. It also has ownership, meaning the thread that locks the mutex must be the one that unlocks it. This prevents issues like double unlocking or unlocking by another thread.",
            "A Semaphore is a signaling mechanism used to control access to shared resources by multiple threads. Semaphores can be used to signal or block threads, but they do not have ownership. Unlike mutexes, semaphores allow multiple threads to access resources based on the semaphore's value."
          ],
          "traps": [
            "A binary semaphore, which only has two values (0 or 1), is sometimes confused with a mutex. However, the main difference is that a binary semaphore does not have ownership, and other threads can signal it, whereas only the thread that locked a mutex can unlock it."
          ],
          "interviewAnswer": [
            "A mutex is a locking mechanism that ensures mutual exclusion with ownership, while a semaphore is a signaling mechanism used for controlling access to shared resources."
          ]
        },

        {
          "name": "Race Condition",
          "concept": [
            "A race condition occurs when multiple threads or processes attempt to modify shared data concurrently without proper synchronization, leading to unpredictable results. The final value of the shared data depends on the non-deterministic order in which the threads execute, making the system's behavior unreliable and difficult to reproduce."
          ],
          "interviewAnswer": [
            "A race condition happens when multiple threads access shared data concurrently without proper synchronization mechanisms, leading to unpredictable and incorrect results."
          ]
        }
      ]
    },

    // ===========================
    // 5. DEADLOCKS
    // ===========================
    {
  title: "Deadlocks",

  overview: [
    "A deadlock is a state where processes are permanently blocked waiting for resources",
    "Occurs due to cyclic dependency in resource allocation"
  ],

  topics: [

    {
      name: "Necessary Conditions (Coffman Conditions)",

      concept: [
        "Deadlock occurs only if ALL 4 conditions hold simultaneously"
      ],

      conditions: [
        "Mutual Exclusion → Resource is non-shareable",
        "Hold and Wait → Process holds resources while waiting",
        "No Preemption → Resources cannot be taken forcibly",
        "Circular Wait → Processes form a cycle"
      ],

      deepInsight: [
        "Breaking ANY one condition prevents deadlock",
        "Circular wait is easiest to visualize using graphs"
      ],

      traps: [
        "All 4 conditions are necessary together",
        "Mutual exclusion is often unavoidable"
      ],

      interviewAnswer: [
        "Deadlock occurs only when all four Coffman conditions hold simultaneously."
      ],

      followUps: [
        "Which condition is easiest to break?",
        "Can deadlock occur if one condition is missing?",
        "Give real-life example"
      ]
    },

    {
      name: "Resource Allocation Graph (RAG)",

      concept: [
        "Graph representation of processes and resources",
        "Used to detect deadlocks"
      ],

      rules: [
        "Process → Resource (request edge)",
        "Resource → Process (allocation edge)"
      ],

      deepInsight: [
        "Cycle ⇒ Deadlock (only in single instance case)",
        "Multiple instances → cycle may not mean deadlock"
      ],

      traps: [
        "Cycle ≠ always deadlock (important)"
      ],

      interviewAnswer: [
        "RAG is used to detect deadlocks by checking for cycles in the graph."
      ],

      followUps: [
        "How to detect deadlock using graph?",
        "Single vs multiple instance difference?"
      ]
    },

    {
      name: "Deadlock Prevention",

      concept: [
        "Break at least one Coffman condition to prevent deadlock"
      ],

      methods: [
        "Remove hold & wait",
        "Allow preemption",
        "Impose resource ordering"
      ],

      deepInsight: [
        "Guarantees no deadlock but reduces efficiency",
        "Resource utilization becomes poor"
      ],

      traps: [
        "Not practical in real systems due to strict constraints"
      ],

      interviewAnswer: [
        "Deadlock prevention works by eliminating one of the necessary conditions."
      ]
    },

    {
      name: "Deadlock Avoidance",

      concept: [
        "Grant request only if system remains in safe state"
      ],

      keyIdea: [
        "Safe state → all processes can complete"
      ],

      algorithm: [
        "Banker’s Algorithm"
      ],

      deepInsight: [
        "Requires prior knowledge of maximum needs",
        "Rarely used in real-world systems"
      ],

      traps: [
        "Unsafe state ≠ deadlock",
        "Needs future knowledge"
      ],

      interviewAnswer: [
        "Deadlock avoidance ensures system stays in safe state using algorithms like Banker’s."
      ]
    },

    {
      name: "Detection & Recovery",

      concept: [
        "Allow deadlock to occur, then detect and recover"
      ],

      detection: [
        "Wait-for graph cycle detection"
      ],

      recovery: [
        "Terminate processes",
        "Rollback",
        "Preempt resources"
      ],

      deepInsight: [
        "More practical approach in real systems",
        "Used when deadlocks are rare"
      ],

      traps: [
        "Recovery can be costly (data loss possible)"
      ],

      interviewAnswer: [
        "Deadlock detection identifies cycles and recovery resolves them by terminating or rolling back processes."
      ]
    },

    {
      name: "Ignore (Ostrich Algorithm)",

      concept: [
        "Ignore deadlocks assuming they are rare"
      ],

      realWorld: [
        "Used in UNIX-like systems"
      ],

      deepInsight: [
        "Simplest approach with zero overhead",
        "Acceptable when deadlocks are very rare"
      ],

      traps: [
        "System may hang if deadlock actually occurs"
      ],

      interviewAnswer: [
        "Ostrich algorithm ignores deadlocks assuming they rarely happen."
      ]
    },

    {
      name: "Banker’s Algorithm",

      concept: [
        "Checks if system is in safe state before allocation",
        "Simulates allocation before granting request"
      ],

      dataStructures: [
        "Available",
        "Max",
        "Allocation",
        "Need = Max - Allocation"
      ],

      flow: [
        "Check Need ≤ Available",
        "Pretend allocation",
        "Find safe sequence"
      ],

      deepInsight: [
        "Safe sequence guarantees no deadlock",
        "Unsafe state is risky but not deadlock"
      ],

      traps: [
        "Unsafe ≠ deadlock",
        "Not practical due to unknown future needs"
      ],

      interviewAnswer: [
        "Banker’s algorithm avoids deadlock by ensuring the system stays in a safe state."
      ],

      followUps: [
        "Find safe sequence",
        "Safe vs unsafe state?"
      ]
    },

    {
      name: "Deadlock vs Starvation vs Livelock",

      comparison: [
        "Deadlock → stuck forever",
        "Starvation → never gets resource",
        "Livelock → active but no progress"
      ],

      deepInsight: [
        "Starvation solved using aging",
        "Livelock wastes CPU without progress"
      ],

      traps: [
        "Deadlock = blocked, Livelock = running",
        "Starvation ≠ deadlock"
      ],

      interviewAnswer: [
        "Deadlock is circular waiting, starvation is unfair scheduling, and livelock is continuous activity without progress."
      ]
    }

  ]
},

    // ===========================
    // 6. MEMORY MANAGEMENT
    // ===========================
    {
      title: "Memory Management",
      overview: [
        "Manages how processes use main memory efficiently",
        "Ensures isolation, protection, and optimal utilization"
      ],

      topics: [

        {
          name: "Paging",

          concept: [
            "Divides virtual memory into fixed-size pages",
            "Physical memory divided into frames",
            "Page table maps pages → frames"
          ],

          flow: [
            "CPU generates virtual address → Page number + offset",
            "Page table lookup → Frame number",
            "Frame + offset → Physical address"
          ],

          deepInsight: [
            "Eliminates external fragmentation",
            "Still suffers from internal fragmentation (last page partially filled)",
            "Page size is a tradeoff: small = less waste, large = fewer entries"
          ],

          traps: [
            "Paging does NOT remove internal fragmentation",
            "Page table lookup adds overhead (needs optimization via TLB)"
          ],

          interviewAnswer: [
            "Paging is a memory management technique where virtual memory is divided into pages and mapped to physical frames using a page table, eliminating external fragmentation."
          ],

          followUps: [
            "What happens during a page fault?",
            "How does multi-level paging reduce memory usage?",
            "What is inverted page table?"
          ]
        },

        {
          name: "TLB (Translation Lookaside Buffer)",

          concept: [
            "Small, fast associative cache for page table entries",
            "Stores recent virtual → physical mappings"
          ],

          flow: [
            "CPU → Check TLB",
            "Hit → Direct frame access",
            "Miss → Page table lookup → Update TLB"
          ],

          deepInsight: [
            "Reduces effective memory access time (EMAT)",
            "Associative search makes it extremely fast",
            "Hit ratio is critical for performance"
          ],

          formula: [
            "EMAT = (hit_ratio × memory_time) + (miss_ratio × (memory_time + page_table_time))"
          ],

          traps: [
            "TLB miss ≠ page fault",
            "TLB is hardware, not part of main memory"
          ],

          interviewAnswer: [
            "TLB is a fast cache that stores recent page table entries to reduce address translation time."
          ],

          followUps: [
            "What is TLB hit ratio?",
            "Difference between TLB miss and page fault?",
            "What is associative memory?"
          ]
        },

        {
          name: "Page Replacement",

          concept: [
            "Used when a page fault occurs and memory is full",
            "OS must replace an existing page"
          ],

          algorithms: [
            "FIFO (First In First Out)",
            "LRU (Least Recently Used)",
            "Optimal (replace page not used for longest future time)"
          ],

          deepInsight: [
            "Optimal is theoretical (used as benchmark)",
            "LRU approximates optimal but is costly to implement",
            "FIFO can suffer from Belady’s Anomaly"
          ],

          traps: [
            "LRU ≠ Optimal",
            "FIFO can sometimes increase page faults when frames increase"
          ],

          interviewAnswer: [
            "Page replacement algorithms decide which page to remove when memory is full during a page fault."
          ],

          followUps: [
            "What is Belady’s Anomaly?",
            "Why is LRU difficult to implement?",
            "Which algorithm is best in practice?"
          ]
        },

        {
          name: "Thrashing",

          concept: [
            "Condition where system spends most time handling page faults",
            "Occurs when working set does not fit in memory"
          ],

          causes: [
            "High degree of multiprogramming",
            "Insufficient frames per process"
          ],

          solution: [
            "Working Set Model",
            "Page Fault Frequency (PFF) control",
            "Reduce multiprogramming level"
          ],

          deepInsight: [
            "CPU utilization drops sharply during thrashing",
            "OS may mistakenly increase processes, worsening the problem"
          ],

          interviewAnswer: [
            "Thrashing is a condition where excessive page faults cause the system to spend more time swapping pages than executing processes."
          ],

          followUps: [
            "How does OS detect thrashing?",
            "What is working set?",
            "Difference between thrashing and high paging?"
          ]
        }

      ]
    },

    // ===========================
    // 7. DISK SCHEDULING
    // ===========================
    {
      title: "Disk Scheduling",

      overview: [
        "Determines the order in which disk I/O requests are serviced",
        "Goal: minimize seek time and improve throughput"
      ],

      keyMetric: [
        "Seek Time = time taken for disk arm to move to desired track",
        "Performance depends heavily on head movement"
      ],

      topics: [

        {
          name: "Disk Scheduling Algorithms",

          algorithms: [

            {
              name: "FCFS (First Come First Serve)",

              concept: [
                "Serves requests in arrival order"
              ],

              example: [
                "Queue: 98, 183, 37 → processed in same order"
              ],

              deepInsight: [
                "Simple but inefficient due to large head movement"
              ],

              pros: [
                "Fair",
                "No starvation"
              ],

              cons: [
                "Poor performance",
                "High seek time"
              ]
            },

            {
              name: "SSTF (Shortest Seek Time First)",

              concept: [
                "Selects request closest to current head position"
              ],

              deepInsight: [
                "Greedy approach minimizes immediate seek time",
                "Can cause starvation for far requests"
              ],

              pros: [
                "Better performance than FCFS"
              ],

              cons: [
                "Starvation possible"
              ],

              traps: [
                "Local optimization ≠ global optimal"
              ]
            },

            {
              name: "SCAN (Elevator Algorithm)",

              concept: [
                "Head moves in one direction servicing requests, then reverses"
              ],

              flow: [
                "Move → serve requests → reach end → reverse direction"
              ],

              deepInsight: [
                "Provides better uniform wait time than SSTF",
                "Behaves like an elevator"
              ],

              pros: [
                "No starvation",
                "Better than SSTF in fairness"
              ],

              cons: [
                "Edge tracks may wait longer"
              ]
            },

            {
              name: "C-SCAN (Circular SCAN)",

              concept: [
                "Head moves in one direction only",
                "After reaching end, jumps to beginning"
              ],

              deepInsight: [
                "Provides more uniform wait time than SCAN"
              ],

              pros: [
                "Better fairness than SCAN"
              ],

              cons: [
                "Extra jump increases seek time"
              ]
            },

            {
              name: "LOOK",

              concept: [
                "Like SCAN but only goes as far as last request (not disk end)"
              ],

              deepInsight: [
                "Avoids unnecessary movement to disk edges"
              ],

              pros: [
                "More efficient than SCAN"
              ],

              cons: [
                "Slightly complex implementation"
              ]
            }

          ],

          comparison: [
            "FCFS → simplest but worst performance",
            "SSTF → fastest but may starve",
            "SCAN → balanced",
            "C-SCAN → uniform wait time",
            "LOOK → optimized SCAN"
          ],

          traps: [
            "SCAN goes to disk end, LOOK does NOT",
            "SSTF can starve requests",
            "C-SCAN does NOT reverse direction"
          ],

          interviewAnswer: [
            "Disk scheduling algorithms decide the order of servicing disk I/O requests to minimize seek time. Common algorithms include FCFS, SSTF, SCAN, C-SCAN, and LOOK, each balancing performance and fairness differently."
          ],

          followUps: [
            "Calculate total seek time for a given request sequence",
            "Which algorithm is best and why?",
            "Difference between SCAN and LOOK?",
            "Why does SSTF cause starvation?"
          ]
        }

      ]
    },

    // ===========================
    // 8. SYSTEM CONCEPTS
    // ===========================
    {
      title: "System Concepts",
      overview: [
        "Core concepts that define interaction between user programs and OS",
        "Focus on abstraction, communication, and kernel design"
      ],
      topics: [
        {
          name: "System Calls",
          concept: [
            "Interface between user space and kernel space",
            "Allows user programs to request OS services"
          ],
          flow: [
            "User program → System call → Trap → Kernel mode → Service → Return to user mode"
          ],
          types: [
            "Process control (fork, exec)",
            "File management (open, read, write)",
            "Device management",
            "Information maintenance"
          ],
          deepInsight: [
            "System calls involve context switching (user → kernel mode)",
            "They are implemented via software interrupts (traps)"
          ],
          examples: [
            "read(), write(), fork(), exec()"
          ],
          traps: [
            "System call ≠ function call",
            "System calls are expensive due to mode switching"
          ],
          interviewAnswer: [
            "System calls provide a controlled interface for user programs to interact with the operating system kernel."
          ],
          followUps: [
            "Difference between system call and library call?",
            "What is a trap?",
            "Why are system calls costly?"
          ]
        },
        {
          name: "Inter Process Communication (IPC)",
          concept: [
            "Mechanism for processes to communicate and synchronize",
            "Two main models: Shared Memory and Message Passing"
          ],
          types: [
            {
              name: "Shared Memory",
              concept: ["Processes share a common memory region"],
              deepInsight: [
                "Fastest IPC (no kernel involvement after setup)",
                "Requires synchronization (semaphores/mutex)"
              ],
              pros: ["High performance"],
              cons: ["Complex to implement", "Prone to race conditions"]
            },
            {
              name: "Message Passing",
              concept: ["Processes communicate via send/receive messages"],
              deepInsight: [
                "Safer than shared memory",
                "Kernel mediates communication"
              ],
              pros: ["Simple and secure"],
              cons: ["Slower due to system calls"]
            }
          ],
          comparison: [
            "Shared Memory → faster, complex",
            "Message Passing → slower, safer"
          ],
          traps: [
            "Shared memory requires synchronization",
            "Message passing always involves kernel overhead"
          ],
          interviewAnswer: [
            "IPC allows processes to communicate using shared memory or message passing, balancing performance and safety."
          ],
          followUps: [
            "Which IPC is faster and why?",
            "What problems occur in shared memory?",
            "What is a race condition?"
          ]
        },
        {
          name: "Kernel Types",
          concept: [
            "Kernel is the core component of OS managing resources",
            "Different architectures based on design philosophy"
          ],
          types: [
            {
              name: "Monolithic Kernel",
              concept: ["Entire OS runs in kernel space"],
              examples: ["Linux"],
              deepInsight: ["Fast but less secure (large codebase in kernel)"],
              pros: ["High performance"],
              cons: ["Difficult to maintain", "Bug can crash entire system"]
            },
            {
              name: "Microkernel",
              concept: ["Minimal kernel; services run in user space"],
              examples: ["MINIX"],
              deepInsight: [
                "Better modularity and security",
                "Communication via message passing"
              ],
              pros: ["More secure and maintainable"],
              cons: ["Performance overhead due to IPC"]
            },
            {
              name: "Hybrid Kernel",
              concept: ["Combination of monolithic and microkernel"],
              examples: ["Windows, macOS"],
              deepInsight: ["Attempts to balance performance and modularity"]
            }
          ],
          comparison: [
            "Monolithic → fast but risky",
            "Microkernel → safe but slower",
            "Hybrid → balanced approach"
          ],
          traps: [
            "Linux is monolithic (not microkernel)",
            "Microkernel still uses IPC heavily"
          ],
          interviewAnswer: [
            "Kernel types define OS architecture: monolithic for performance, microkernel for modularity, and hybrid for balance."
          ],
          followUps: [
            "Why is microkernel more secure?",
            "Why is Linux not microkernel?",
            "Where is IPC used in microkernel?"
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
