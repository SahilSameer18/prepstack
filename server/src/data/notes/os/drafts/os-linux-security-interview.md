---
id: os-linux-security-interview
title: Linux Basics, Security, Virtualization and Interview Questions
next: none
roadmapSteps: devops-cloud:linux-command-line, devops-cloud:docker-containers
---

<!-- Draft 12 Nov 2026, not published. Written from docs/content/source-notes/os-oops-phase1.md. Numbers from docs/content/checks/os-check.py. -->

## Overview

This last section applies the notes to Linux and adds security and virtual machines. It covers how Linux treats files, what the shell does, and the difference between kernel space (where the core of the operating system runs, with full power) and user space (where ordinary programs run, with limits). It then covers security, protection, and virtual machines (a whole computer imitated in software). After this section you can read Linux file permissions, say how the shell starts a program, name the main security threats and defences, and compare a virtual machine with a container.

## Topic: Linux files and permissions

**Definition:** Linux is a UNIX-style system. A common UNIX saying is "everything is a file": devices and some kernel (core of the operating system) information are reached through the same calls and the same folder tree as ordinary files. Devices appear under /dev. The /proc area is not stored on disk: its content is worked out when you read it. Every open file has a file descriptor (a small number per process); 0, 1 and 2 are standard input, standard output and error output. Permissions come as three groups, owner, group and others, each with read (r), write (w) and execute (x, run it).

**Why:** One small set of calls (open, read, write, close) works for files, devices and pipes (one-way channels between processes), so tools combine easily.

**Example:** `-rw-r--r--` in `ls -l` output: after the first dash (file type), owner rw- = 110 = 6, group r-- = 100 = 4, others r-- = 100 = 4, so the number is 644. Another example: 761 means rwx for the owner, rw- for the group and --x for others. `ls -l /dev/sda*` lists disk devices, each with a major and minor number (kind of device and which one).

**Failure:** Taking the saying literally. Not every resource is a file; the idea is that many things share the file calls.

## Topic: The shell, kernel space and user space

**Definition:** The shell is an ordinary user-mode program that reads a typed line and asks the kernel to start other programs (the fork and exec steps are in os-processes). The CPU has two modes: kernel mode (all instructions and devices allowed) and user mode (some instructions blocked). A system call is how a program asks the kernel for a service, switching to kernel mode and back. Linux is monolithic (one big kernel, all in kernel mode) plus loadable modules (pieces added to the kernel while it runs).

**Why:** Keeping user code out of kernel mode stops one bug from damaging everything. All input and output instructions are privileged (kernel mode only), so I/O goes through system calls.

**Example:** Typing `ls`: the shell asks the kernel for a new process and runs ls in it. A command like `cd` is built into the shell itself, because a separate process could not change the shell's own folder. A C program calling printf() calls the C library, which calls the write() system call. Kernel code and data share one address space (the range of memory addresses a program can use); libraries and tools, including shells like bash, run in user mode. Linux treats threads and processes alike as tasks; clone() lets a new task choose what it shares with its parent.

**Failure:** Saying "the kernel converts the command to machine instructions." The shell reads the command and asks the kernel, through system calls, to start a program. Also, a bug in kernel code can bring a monolithic system down, while a microkernel keeps less in kernel mode but pays for extra messages (os-introduction). On the scheduler (os-cpu-scheduling): Linux used CFS from kernel 2.6.23 and began moving to EEVDF in 6.6; which scheduler a system runs depends on its kernel version, so name the version.

## Topic: Security: threats and defences

**Definition:** Security means resources are used only as intended. Perfect security cannot be achieved, so the goal is to make attacks costly. Violations are breaches of confidentiality (reading data without permission), integrity (changing it), availability (destroying it), theft of service, and denial of service (DoS, overloading a machine so real users cannot use it). Common attacks: buffer overflow (writing more data into memory than it can hold), Trojan horse (a program that pretends to be useful), worm (spreads alone over a network), ransomware (locks data until payment), and phishing (tricking people).

**Why:** Security is as strong as its weakest link: four levels (physical, application, operating system, network), plus people.

**Example:** The course program copies a command-line argument into a 256-byte array with strcpy (a C function that copies text without checking its length). A 300-character argument needs 301 bytes with the ending zero, so 45 bytes land past the array, over nearby memory, which an attacker can use to run their own code. For passwords the system stores only a hash (a one-way scrambled form) plus salt (random extra text, so equal passwords give different hashes); Unix keeps these in a file only the superuser (the administrator account, root) can read.

**Failure:** Treating a firewall or antivirus as complete. Defence in depth (many layers) is the most common approach, together with least privilege (each program gets only the rights its job needs), patches, logging, and multi-factor authentication (two or more proofs of identity).

## Topic: Protection: rings, domains and the access matrix

**Definition:** Protection controls which process may use which object (file, device). Authentication is proving who you are (a password). Authorization is deciding what you may then do; the course calls this protection. Protection rings are layers of power: the kernel sits in the most powerful ring and user programs in a weaker one, enforced by the CPU. A system call is the gate between them. A domain is a set of access rights, each an (object, allowed operations) pair. The access matrix has domains as rows and objects as columns.

**Why:** Least privilege limits the damage of a bug, because a program can only do what its domain allows.

**Example:** Domains D1, D2; files F1, F2. D1 has F1: read, F2: read and write; D2 has F1: read and write, F2: nothing. A column (one object) is its access control list (ACL); a row (one domain) is its capability list. In UNIX, a domain is a user id; the setuid bit (a flag) makes a program run with its owner's id.

**Failure:** Thinking a login is enough. Authentication only proves who you are; without authorization every logged-in user could use every file. Also, DAC (discretionary access control, where owners set rights) can be weaker than MAC (mandatory access control, which even the root user cannot get around), as in SELinux (a Linux security system that enforces mandatory rules).

## Topic: Virtual machines and hypervisors

**Definition:** A virtual machine (VM) is a software copy of a whole computer, run by a hypervisor (virtual machine manager). The real machine is the host and each VM is a guest, usually a full operating system. Type 0: in firmware (built-in hardware software), such as IBM LPARs. Type 1: operating-system-like software on the hardware (VMware ESX; Linux with KVM and Windows with Hyper-V fall here too). Type 2: an ordinary application on a normal OS (VirtualBox, VMware Workstation).

**Why:** One machine runs several operating systems, each isolated from the others, and a VM can be copied, snapshotted (saved as it is at one moment) or moved.

**Example:** A student runs VirtualBox (Type 2) on a Windows laptop and starts a Linux guest. In the trap-and-emulate method (used at least in part by most products), the guest's privileged instructions trap to the hypervisor, which emulates (imitates in software) them. A Solaris zone is application containment, not virtualization: one kernel, the host's, runs everything, while each zone has its own applications, network settings and users. A VM has its own guest kernel.

**Failure:** Calling a container "a small VM". A container shares the host kernel, so it cannot run a different kernel. These notes use Solaris zones and BSD jails as the example; Docker is covered in the DevOps and cloud roadmap.

## Topic: Cross-topic questions: where each answer lives

**Definition:** Six cross-topic questions appear on popular interview pages. Give each a 45 to 60 second answer from its own section.

**Why:** They test whether you can compare two close ideas without mixing them.

**Example:**
- Process vs thread: os-threads.
- Microkernel vs monolithic: os-introduction.
- Zombie process, and what happens when you type a command: os-processes.
- Deadlock vs starvation: os-deadlocks and os-cpu-scheduling.
- Paging vs segmentation: os-memory-management.
- FCFS and the convoy effect: os-cpu-scheduling.

**Failure:** Reciting definitions without a number or example. Also over-correcting: a command interpreter may sit inside the kernel on some systems, so say "in UNIX-style systems". Mac OS X is a hybrid (a Mach microkernel plus BSD parts in one kernel), not a pure microkernel.

## Questions

### What does "everything is a file" mean in Linux?

Files, devices and pipes share one small set of calls (open, read, write, close) and one folder tree, with devices under /dev. It is a UNIX saying, not a literal rule.

### What is the difference between authentication and authorization?

Authentication checks who you are, for example with a password. Authorization decides what that user may do, through permissions or an access matrix. Both are needed.

### What is the difference between a virtual machine and a container?

A VM runs a whole guest operating system with its own kernel on a hypervisor. A container-style zone shares the host's single kernel and only separates applications, so it avoids running a second kernel.

### What are the three types of hypervisor?

Type 0 is in firmware, Type 1 is operating-system-like software on the hardware (or an OS with VM support, such as KVM), and Type 2 is an application on a normal OS, like VirtualBox.

## Mistakes

- Taking "everything is a file" literally, when it means many things share the file calls.
- Saying "Linux uses CFS" without a kernel version, when the move to EEVDF began in 6.6.
- Calling a container a small virtual machine, though it shares the host's kernel.

## Quiz

### What number is the permission string `-rw-r--r--`?

- [ ] 761
- [x] 644
- [ ] 444
- [ ] 755

Explanation: Owner rw- = 110 = 6, group r-- = 100 = 4, others r-- = 100 = 4.

### A program copies a 300-character argument into a 256-byte array with strcpy. How many bytes land past the array?

- [ ] 44
- [x] 45
- [ ] 300
- [ ] 256

Explanation: The text needs 301 bytes with the ending zero, so 301 - 256 = 45.

### In an access matrix, what does one column hold?

- [ ] The rights of one domain
- [x] The access list of one object
- [ ] The password of one user
- [ ] The ring number

Explanation: A column is the list of domains and their rights for one object (an ACL). A row is a capability list for one domain.

### VirtualBox on a Windows laptop running a Linux guest is which kind of hypervisor?

- [ ] Type 0
- [ ] Type 1
- [x] Type 2
- [ ] A container

Explanation: It is an application on a normal operating system, which makes it Type 2.

### What does a Solaris zone share with the host?

- [ ] Nothing, it is a full copy of the machine
- [x] The host's kernel
- [ ] Only the hardware clock
- [ ] The guest kernel

Explanation: A zone separates applications but one kernel, the host's, runs everything.

## Diagram

```json
{ "kind": "layers", "caption": "How a command reaches the hardware on Linux: user programs call the kernel through system calls.", "layers": [{ "label": "Shell and other programs (user mode)" }, { "label": "System libraries, such as the C library" }, { "label": "System call interface" }, { "label": "Kernel (kernel mode)" }, { "label": "Hardware" }] }
```
