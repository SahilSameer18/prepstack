---
id: os-introduction
title: Introduction and System Calls
lastChecked: 2026-11-12
next: os-processes
roadmapSteps: devops-cloud:linux-command-line, backend:os-networking-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (two for accuracy, one for plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and os-drafts.md. Numbers computed by docs/content/checks/os-check.py. Claims: docs/content/SOURCES.md. -->

## Overview

An operating system (OS, the main software that runs a computer and shares its parts between programs) sits between programs and the hardware (the physical parts). Questions here cover three ideas every later topic rests on: the kernel (the core of the OS) runs with more power than normal programs, programs ask the kernel for help through system calls (requests to the kernel), and the hardware can interrupt (suddenly stop) whatever is running.

After this section you can explain user mode and kernel mode, trace a system call, tell a system call from a library function, separate an interrupt from a trap, and compare monolithic and microkernel designs.

## Topic: What an operating system does

**Definition:** An OS is a program that sits between the user's programs and the hardware (CPU, memory, disks and other devices). It shares each resource among many programs and hides messy hardware details behind simple calls. The kernel is the one part of the OS that is always running. Everything else is a system program (ships with the OS but is not in the kernel, such as a shell, the program that reads your typed commands) or an application program (such as a browser).

**Why:** Without an OS, every program would use the disk, screen and memory directly, and one buggy program could damage the others.

**Example:** A program that saves a file only calls open, write and close. The file system (the part of the OS that tracks where file data sits on the disk) does the rest.

**Failure:** Saying "the OS is the kernel" or "the OS is the shell". The kernel is only the core; say what the OS does.

## Topic: User mode and kernel mode

**Definition:** The CPU (the chip that runs instructions) has two modes. In user mode a program is restricted: it cannot start input or output on a device (I/O, such as reading a disk) or run other privileged instructions (instructions only the OS may run). In kernel mode all instructions are allowed. The hardware keeps a mode bit (a single on/off flag) that says which mode is active.

**Why:** If any program could talk to the disk directly, it could read or overwrite everything, and the OS could not enforce file permissions.

**Example:** A program in user mode tries an I/O instruction. The CPU raises an exception (an error signal that jumps into the OS), and the OS will likely stop that program. A program cannot just set the mode bit to "kernel": a system call changes the mode, and returning from the call sets it back to user.

**Failure:** Saying "kernel mode is for administrators and user mode is for users". The modes belong to the code, not to a person: ordinary programs run in user mode and the kernel in kernel mode.

## Topic: System calls

**Definition:** A system call is how a program asks the kernel to do something it may not do itself, such as opening a file or creating a process (a running program). The program runs a special trap instruction (an instruction that jumps into the kernel and switches to kernel mode at the same time). The kernel does the work, then runs return-from-trap, which goes back to the program and switches to user mode. The extra details, such as which file to open, are handed over in one of three places: registers (the CPU's tiny fast storage), a block of memory, or the stack (memory set aside for a program's temporary data). Linux uses a block of memory.

**Why:** It is the controlled door a program uses to ask the kernel for help, so the kernel can check every request.

**Example:** The hardware first saves the caller's place (the program counter, which marks the next instruction, and some registers). It pushes them onto a kernel stack, a private area of memory the kernel keeps for each process, so return-from-trap can restore them. In the OSTEP textbook (Operating Systems: Three Easy Pieces) model, the kernel fills a trap table (a list of which code handles which event) once at boot, and only kernel mode may set it.

**Failure:** Describing a system call as "just calling a function". It is a jump into the kernel with a change of mode, and it costs more than a normal call. The names differ between Windows and POSIX (the standard interface of Unix-like systems).

## Topic: System call against library function

**Definition:** A library function is ordinary code that lives inside the program (supplied by a library such as the C standard library) and runs in user mode. A system call crosses into the kernel and runs in kernel mode. The library often wraps system calls so a programmer does not write the trap instruction by hand.

**Why:** Wrappers keep the API (application programming interface, the set of functions a program may call) the same while the system calls underneath differ.

**Example:** The C function `printf` is a library function that calls the system call `write`. A function that only adds up numbers needs no kernel.

**Failure:** Saying "every library function is a system call". A library function may call zero, one or several system calls.

## Topic: Interrupts and traps

**Definition:** An interrupt is a signal that makes the CPU stop and run a handler (a piece of OS code for that event). A hardware interrupt comes from a device: a disk saying "I am finished", or the timer saying "your time is up". A trap (also called an exception) is caused by the running program itself: by an error such as dividing by zero, or by a request to the OS, a system call. The CPU finds the handler through an interrupt vector (a table of handler addresses), saves where it was, runs the handler, then resumes.

**Why:** Without interrupts the CPU would have to keep checking every device. The timer interrupt also lets the OS take control back from a program that never gives it up, such as one stuck in an infinite loop.

**Example:** Program A is running. The timer fires. The hardware saves A's registers and enters kernel mode, and the handler decides whether to carry on with A or switch to program B.

**Failure:** Mixing the two. An interrupt comes from outside the running program (a device or the timer), a trap from the program itself.

## Topic: Types of operating systems

**Definition:** Multiprogramming: several jobs are kept in memory, and when one waits for I/O the OS switches to another so the CPU stays busy (the slides group this with batch systems, which run jobs without a user waiting). Multitasking or time sharing: the CPU switches so often that each user can interact with their job; response time (the time from your action to the first reply) should be under 1 second, per the slides. Real-time: fixed time limits must be met for the work to count as correct.

**Why:** Each type answers one problem: an idle CPU, slow replies, or a missed deadline.

**Example:** A car brake controller must answer within a fixed time, or the answer is wrong even if it is correct but late.

**Failure:** Saying "multitasking and multiprogramming are the same". Multiprogramming switches when a job waits. Multitasking also switches on the timer interrupt.

## Topic: Kernel designs and booting

**Definition:** A monolithic kernel puts almost all OS services (file system, scheduling, memory management) in one big program in kernel mode. A microkernel keeps only a small core in the kernel and runs the rest as separate programs in user space (where normal programs run) that talk by passing messages. A hybrid kernel mixes ideas.

Booting (starting the computer): at power-up the CPU starts at a fixed place, and a small bootstrap program kept in ROM or similar firmware storage (memory that keeps its content without power) finds the kernel on disk, loads it into memory and starts it. The kernel typically then sets up the trap table.

**Why:** A microkernel is easier to extend and more reliable because less code runs with full power, but passing messages costs speed. A monolithic kernel avoids that message cost, but all of its code runs with full power.

**Example:** The slides describe Linux as monolithic plus loadable modules (pieces of code added to the running kernel as needed), and Windows as mostly monolithic plus microkernel ideas.

**Failure:** Saying "Linux is a microkernel" or "microkernels are always better". Say "hybrid kernel" for the mixed design, not "macro kernel".

## Questions

### What is an operating system, and what does it do?

It is the software between programs and hardware. It shares the CPU, memory and devices between programs, hides hardware detail behind simple calls, and keeps programs from harming each other.

### What is a system call, and how is it different from a library function?

A system call is a request into the kernel, made with a trap instruction that switches to kernel mode. A library function is normal user-mode code that may call a system call inside, as `printf` calls `write`.

### What happens when a program calls write?

The library function puts the call number and details where the kernel expects them and runs a trap instruction. The CPU switches to kernel mode, saves the program's place and jumps to the kernel code for that call. The kernel checks the request and does the work. Return-from-trap restores the program's place and switches back to user mode.

### What is the difference between an interrupt and a trap?

An interrupt is raised by hardware, such as a disk or the timer. A trap is raised by the running program, by an error or a system call.

### Compare a monolithic kernel and a microkernel.

A monolithic kernel keeps all services in one program in kernel mode, which avoids message cost. A microkernel keeps a small core there and passes messages to the rest, which is safer and easier to extend but slower.

## Mistakes

- Saying a system call and a library function are the same thing.
- Saying the kernel turns user commands into machine commands. The shell (the program you type commands into) reads the command and asks the kernel, through system calls, to start a program; the kernel does not translate commands.
- Calling a hybrid kernel a "macro kernel".

## Quiz

### Which instruction moves the CPU from user mode into the kernel when a program makes a system call?

- [ ] A return-from-trap instruction
- [x] A trap instruction
- [ ] A jump to the library
- [ ] A write to the mode bit by the program

Explanation: Return-from-trap does the opposite.

### What happens when a program in user mode tries to run an I/O instruction directly?

- [ ] It runs normally but slowly
- [ ] The hardware retries it in kernel mode
- [x] The CPU raises an exception and the OS stops the program
- [ ] The library function runs it instead

Explanation: User mode forbids such instructions. The attempt causes an exception.

### Which is an example of a library function calling a system call?

- [ ] `write` calling `printf`
- [x] `printf` calling `write`
- [ ] A shell calling the CPU
- [ ] The timer calling the scheduler

Explanation: The slides show the C library function `printf` calling the system call `write`.

### Which event is a hardware interrupt?

- [ ] A program divides by zero
- [ ] A program calls `open`
- [x] The timer reaches zero
- [ ] A program tries to read a missing file

Explanation: Division by zero and system calls are traps caused by the program.

### What is the main cost of a microkernel compared with a monolithic kernel?

- [ ] More code runs in kernel mode
- [ ] It is harder to port to new hardware
- [x] Messages between the kernel and user programs add cost
- [ ] It cannot be protected from bad programs

Explanation: The slides name this overhead as the main drawback.

## Diagram

```json
{ "kind": "layers", "caption": "Layers of a computer, top to bottom. A system call is the door between the user-mode layers and the kernel.", "layers": [{ "label": "User programs (browser, shell, your code)" }, { "label": "Library functions (for example printf), user mode" }, { "label": "System call interface (trap into the kernel)" }, { "label": "Kernel: scheduling, memory, files, drivers (kernel mode)" }, { "label": "Hardware: CPU, memory, disks, other devices" }] }
```
