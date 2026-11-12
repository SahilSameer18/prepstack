---
id: oops-design-patterns
title: Design Patterns
lastChecked: 2026-11-12
next: oops-interview-questions
roadmapSteps: java-spring:java-language-basics, java-spring:spring-core-boot
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (accuracy and plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and oops-drafts.md. Java examples compiled and run with Java 27; files in docs/content/checks/oops/. Claims: docs/content/SOURCES.md. -->

## Overview

A design pattern is a named, reusable way to arrange classes to solve a problem that keeps coming up. Interviewers ask to see whether you can name the problem, pick one, and say when it is too much. It covers eight: Singleton, Factory Method, Observer, Strategy, Builder, Decorator, State and Adapter.

After this section you can explain each in under a minute, write a small Java version, and say when not to use it.

## Topic: Singleton

**Definition:** What it does: keeps one object of a class and gives one global way to reach it. The class hides its constructor (the method that sets up an object) and offers a static method (called on the class, not on an object) that returns it.

**Why:** Some things should exist once, such as a shared connection. Some people call it an anti-pattern because it adds global state (data any code can reach and change). Refactoring.Guru adds that it can hide bad design, needs care with threads (independent lines of running code), and is hard to unit test.

**Example:** The lazy form (made only when first asked for) is not safe with threads. Two threads can both see `instance == null`:

```java
static class LazyUnsafe {
    static int created = 0;
    private static LazyUnsafe instance;
    private LazyUnsafe() { created++; try { Thread.sleep(50); } catch (InterruptedException e) { } }
    static LazyUnsafe get() { if (instance == null) instance = new LazyUnsafe(); return instance; }
}
// 4 threads call get(): "instances created: 4"
```

The sleep makes the race (two threads rushing to do the same step) easy to see. The count was 4 in this run and 3 in some others. Thread-safe forms: create the object eagerly, a holder, a single-constant enum, or double-checked locking (check twice, with a lock around the second check, and mark the field `volatile` so every thread sees the newest value). With it the same 4 threads created 1 object:

```java
private static volatile Checked instance;
static Checked get() {
    if (instance == null) { synchronized (Checked.class) { if (instance == null) instance = new Checked(); } }
    return instance;
}
```

The holder is a private nested class that holds the object (`private static class Box { static final Holder INSTANCE = new Holder(); }`); it is set up when first used, once, one thread at a time. Reflection (code that inspects and changes classes while the program runs) can call a private constructor: it gave a second holder object. On an enum it threw `IllegalArgumentException`.

**Failure:** Believing "private constructor means only one object". Also do not use a singleton just to avoid passing an object around.

## Topic: Factory Method

**Definition:** What it does: a parent class declares a method that creates an object, and subclasses decide which class to create. The calling code uses only the shared interface (the list of methods every kind offers).

**Why:** Code that says `new Truck()` everywhere must be edited, and given `if` chains, whenever a new kind such as a ship is added.

**Example:**

```java
interface Notification { String send(String m); }
class Email implements Notification { public String send(String m) { return "email: " + m; } }
class Sms implements Notification { public String send(String m) { return "sms: " + m; } }
abstract class Notifier {
    abstract Notification create();                 // the factory method
    String notifyUser(String m) { return create().send(m); }
}
class EmailNotifier extends Notifier { Notification create() { return new Email(); } }
class SmsNotifier extends Notifier { Notification create() { return new Sms(); } }
```

`notifyUser("hi")` on each gave `email: hi | sms: hi`.

**Failure:** Do not use it when there is one product and no sign of more. A plain static method with a `switch` (picks one of several paths by value) that returns objects is a different, smaller idea, often called a simple factory.

## Topic: Observer

**Definition:** What it does: a publisher keeps a list of subscribers and calls each one when something happens. The publisher knows only a small interface, not the subscriber classes.

**Why:** Otherwise the publisher is edited for every new listener, or listeners keep asking "anything new?".

**Example:** A `Consumer<String>` is an object that takes a string and does something with it.

```java
class Channel {
    private final List<Consumer<String>> subscribers = new ArrayList<>();
    void subscribe(Consumer<String> s) { subscribers.add(s); }
    void upload(String title) { for (Consumer<String> s : subscribers) s.accept(title); }
}
Channel ch = new Channel();
ch.subscribe(t -> System.out.println("Ann got: " + t));
ch.subscribe(t -> System.out.println("Raj got: " + t));
ch.upload("Video 1");
```

Output: `Ann got: Video 1` then `Raj got: Video 1`.

**Failure:** Do not rely on the order of notification. The publisher holds each subscriber, so one that is never removed cannot be freed by the garbage collector (the part of Java that frees unused objects), the lapsed listener problem. Unsubscribe when done.

## Topic: Strategy

**Definition:** What it does: puts each interchangeable way of doing a job in its own class behind one interface; the user class holds one and can swap it.

**Why:** A class full of `if` branches choosing between ways of working is hard to change.

**Example:** `Discount` is the interface; each lambda (a short unnamed function) is one strategy:

```java
interface Discount { double apply(double price); }
Discount tenOff = p -> p * 0.9;
Discount flat20 = p -> p - 20;

List<String> words = new ArrayList<>(List.of("pear", "fig", "banana"));
words.sort(Comparator.comparingInt(String::length));
words.sort(Comparator.reverseOrder());
```

`tenOff.apply(150)` and `flat20.apply(150)` gave `135.0 vs 130.0`. The sorts gave `[fig, pear, banana]` by length, then `[pear, fig, banana]` in reverse alphabetical order (`Comparator.reverseOrder()`). A `Comparator` (an object that says how to order two items) works like a strategy: a swappable rule you hand to `sort`. (This is the usual textbook example; the Java API pages do not use the word.)

**Failure:** Do not use it when there are few ways of working and they rarely change; a lambda often does the job.

## Topic: Builder

**Definition:** What it does: builds a complex object step by step, so you call only the steps you need.

**Why:** A constructor with many optional values becomes a long, easy-to-mix-up list of arguments.

**Example:**

```java
class Pizza {
    private final String size; private final boolean cheese, olives;
    private Pizza(Builder b) { size = b.size; cheese = b.cheese; olives = b.olives; }
    static class Builder {
        private String size = "medium"; private boolean cheese, olives;
        Builder size(String s) { size = s; return this; }
        Builder cheese() { cheese = true; return this; }
        Builder olives() { olives = true; return this; }
        Pizza build() { return new Pizza(this); }
    }
}
Pizza p = new Pizza.Builder().size("large").cheese().build();
```

Printing `p` gave `large pizza, cheese=true, olives=false`.

**Failure:** For a class with only a few fields, a plain constructor is simpler, because the pattern adds a class.

## Topic: Decorator

**Definition:** What it does: adds behaviour to an object by wrapping it in another object with the same interface. The wrapper forwards the call and adds something before or after.

**Why:** A subclass for every combination (milk, sugar, both) multiplies fast.

**Example:**

```java
interface Coffee { double cost(); String name(); }
class Plain implements Coffee { public double cost() { return 50; } public String name() { return "coffee"; } }
class Milk implements Coffee {
    private final Coffee inner; Milk(Coffee c) { inner = c; }
    public double cost() { return inner.cost() + 10; } public String name() { return inner.name() + " + milk"; }
}
// Sugar is the same: adds 2 and " + sugar"
Coffee c = new Sugar(new Milk(new Plain()));
System.out.println(c.name() + " costs " + c.cost());
```

Output: `coffee + milk + sugar costs 62.0` (50 + 10 + 2). Wikipedia says Java's I/O streams (code that reads text or files) use this pattern.

**Failure:** Removing one wrapper from the middle of a stack is hard, and the order of wrappers can matter.

## Topic: State

**Definition:** What it does: an object changes behaviour when its inner state changes, by handing the work to a separate object for the current state.

**Why:** Otherwise every method has `if (state == ...)` checks, edited for each new state.

**Example:**

```java
interface DoorState { DoorState press(); String name(); }
class Closed implements DoorState { public DoorState press() { return new Open(); } public String name() { return "closed"; } }
class Open implements DoorState { public DoorState press() { return new Closed(); } public String name() { return "open"; } }
class Door {
    private DoorState state = new Closed();
    void press() { state = state.press(); }
    String show() { return state.name(); }
}
```

Printing `show()` after each press gave `closed -> open -> closed`.

**Failure:** It is overkill for few states that rarely change; a field and a `switch` are enough. It looks like Strategy, but states may know each other and usually choose the next state; strategies do not know each other and are chosen from outside.

## Topic: Adapter

**Definition:** What it does: lets a class with the wrong interface work where another interface is expected. The adapter wraps it and translates calls.

**Why:** You cannot edit the old or third-party class, but your code expects a different shape.

**Example:**

```java
interface Celsius { double celsius(); }
class OldThermometer { double readFahrenheit() { return 98.6; } }
class ThermometerAdapter implements Celsius {
    private final OldThermometer old;
    ThermometerAdapter(OldThermometer o) { old = o; }
    public double celsius() { return (old.readFahrenheit() - 32) * 5 / 9; }
}
```

Output: `Adapter: 37.0 C` from 98.6 F.

**Failure:** It adds classes, and sometimes it is simpler to change the service class itself. Adapter changes the interface; Decorator keeps the interface the same (or adds to it) and adds behaviour.

## Questions

### What is the problem with a singleton?

It is global state: any code can reach and change it, so dependencies are hidden and tests are harder. The lazy form can also create more than one object with threads.

### How do you make a singleton thread-safe in Java?

Create it eagerly, use the holder (a private nested class), use double-checked locking with `volatile`, or use a single-constant enum. The enum also resists reflection, because Java does not allow enum objects to be created that way.

### How do Strategy and State differ?

In Strategy the caller picks the object that does the work. In State the object stands for the current state and usually decides the next one.

## Mistakes

- Saying a private constructor makes a singleton safe. Reflection created a second object in the run above. An enum refuses, because Java does not allow enum objects to be created by reflection.
- Using a pattern because it has a name. Use it only when the problem in its "Why" shows up.

## Quiz

### What can happen when several threads call the lazy `get()` at the same time?

- [ ] Every thread waits until the first one has finished
- [x] More than one object can be created
- [ ] They all get the same single object
- [ ] Java throws an exception at once

Explanation: Each thread can see no instance yet and make its own. In the run the count was 4; in other runs it was 3, so the count is not fixed.

### Which singleton form could not be built a second time through reflection (`IllegalArgumentException`)?

- [ ] The lazy form
- [ ] The holder form
- [x] The enum
- [ ] Double-checked locking

Explanation: Java does not let reflection build enum objects, so the enum keeps its one instance.

### Which pattern does `list.sort(Comparator.reverseOrder())` show?

- [x] Strategy
- [ ] Builder
- [ ] Adapter
- [ ] Singleton

Explanation: The `Comparator` is a swappable way of ordering that the caller hands to `sort`.

### `new Sugar(new Milk(new Plain()))` wraps each object in another with the same interface. Which pattern is this?

- [ ] State
- [ ] Observer
- [ ] Factory Method
- [x] Decorator

Explanation: Each wrapper has the same interface as what it wraps and adds to the result: 50 + 10 + 2 = 62.0.

### An old thermometer reports Fahrenheit, but your code wants Celsius and you cannot edit the old class. What do you write?

- [ ] A Builder that creates the old class step by step
- [x] An Adapter that converts the reading
- [ ] An Observer that watches the old class
- [ ] A State object for each temperature

Explanation: The adapter presents the interface you need and translates the old class's answer.
