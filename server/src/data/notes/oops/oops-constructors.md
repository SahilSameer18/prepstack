---
id: oops-constructors
title: Constructors and Object Lifetime
lastChecked: 2026-11-12
next: oops-relationships
roadmapSteps: java-spring:java-language-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (accuracy and plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and oops-drafts.md. Java examples compiled and run with Java 27; files in docs/content/checks/oops/. Claims: docs/content/SOURCES.md. -->

## Overview

A constructor is a special method that sets up a new object. Interviewers ask when the compiler (the tool that turns your code into a program) adds one, how `this(...)` and `super(...)` (calls to another constructor) link constructors together, in what order an object is set up, and what happens when an object is no longer needed. Java has no destructor (code that runs when an object ends), so the last answer differs from C++, another programming language.

After this section you can write overloaded constructors (several with the same name but different inputs), predict the printed order of a setup, and explain garbage collection in a few sentences.

## Topic: What a constructor is, and the default constructor

**Definition:** A constructor has the same name as its class and no return type (the type of value a method gives back). `new` runs it to set up the new object's fields (variables stored in each object). If a class declares no constructor, the compiler adds a default constructor: no parameters (inputs), the same access as the class (who may use it), and a body that calls `super()`, the parent's no-argument constructor. The compiler adds nothing once you write any constructor yourself.

**Why:** Every object must be set up by some constructor, so this rule guarantees one always exists. A constructor can also be `private`, so code outside the class cannot call `new`; a class of only `static` helper methods does this.

**Example:** `class Plain { int n; }` has no constructor, yet `new Plain().n` works and printed `0`, the default value of an `int` field. With `class Util { private Util() { } }`, the line `new Util()` in another class is refused: `Util() has private access in Util`.

**Failure:** A class `Child extends Base` (a child built on the parent `Base`), where `Base` has only `Base(int x)`, fails to compile. The default constructor of `Child` calls `super()`, and `Base` has none. The compiler said: `constructor Base in class Base cannot be applied to given types; required: int found: no arguments`. Fix: add `Base()` or write `super(5)`.

## Topic: Overloaded constructors and chaining

**Definition:** One constructor can start with `this(...)` to call another constructor in the same class, or `super(...)` to call the parent's. A constructor has at most one such call, and if you write neither, the compiler starts the body with `super();`.

**Why:** Chaining keeps the setup code in one place instead of copying it into every constructor. Before Java 25 the call had to be the first statement; since Java 25 a few statements may come before it, as long as they do not use the object being built (they may assign its own fields).

**Example:**

```java
class Account {
    String owner;
    int balance;
    Account() { this("unknown", 0); }
    Account(String owner) { this(owner, 0); }
    Account(String owner, int balance) {
        this.owner = owner;   // this means the object being built
        this.balance = balance;
    }
    public String toString() { return owner + ":" + balance; }
}
```

`new Account()` gave `unknown:0` and `new Account("Ravi")` gave `Ravi:0`.

**Failure:** Two constructors that call each other through `this(...)` form a loop. The compiler said: `recursive constructor invocation`. Code before `super(...)` compiled with Java 27 but failed with `--release 24`: `flexible constructors is not supported in -source 24`.

## Topic: Setup order for one object

**Definition:** The first time `new Dog()` runs, the class itself is set up once: the code in its `static` blocks runs and its static fields get their values, parent class first. Then each new object is built: fields get default values, the parent constructor runs, then the class's field initializers and instance initializer blocks (code blocks in braces inside the class) in file order, then the rest of the constructor body.

**Why:** A child object is built on top of its parent, so the parent part must be ready first. Statements written before `super(...)` (Java 25 and later) run before the parent constructor. If a constructor starts with `this(...)`, the initializers run only in the constructor that finally calls `super`.

**Example:**

```java
class Animal {
    static { System.out.println("1 Animal static block"); }
    String kind = init("3 Animal field");   // init prints its text and returns it
    { System.out.println("4 Animal instance block"); }
    Animal() { System.out.println("5 Animal constructor"); }
    static String init(String s) { System.out.println(s); return s; }
}
class Dog extends Animal {
    static { System.out.println("2 Dog static block"); }
    String name = init("6 Dog field");
    { System.out.println("7 Dog instance block"); }
    Dog() { System.out.println("8 Dog constructor"); }
}
```

The first `new Dog()` printed 1 to 8 in that order. A second `new Dog()` printed only 3 to 8, because the `static` parts run once.

**Failure:** Saying the child constructor body runs first. The body of `Dog()` runs last. Also, expecting the static blocks to run again for every new object; they run once, when the class is first used.

## Topic: Constructors are not inherited; a copy constructor

**Definition:** A subclass (a class that extends another) does not get its parent's constructors; it must declare its own and call `super(...)` if the parent needs arguments. Java has no built-in copy constructor (a constructor that makes a copy of an object); you write one that takes the same class and copies its fields.

**Why:** Plain assignment `b = a` copies only the reference (the address of the object), so both names point at one object. A copy constructor gives a second, separate object.

**Example:** Added to the `Account` class above:

```java
Account(Account other) { this(other.owner, other.balance); }
// Account a = new Account("Asha", 100);
// Account b = new Account(a);  b.balance = 5;
// printing a and b gave  Asha:100 Asha:5
```

**Failure:** `new Child(5)` does not compile when `Child` has only a no-argument constructor: a parent constructor such as `Base(int)` is not a constructor of `Child`. Also, a shallow copy copies each field as it is; if a field holds a reference, only the address is copied, so both objects point to the same inner object.

## Topic: Calling an overridable method inside a constructor

**Definition:** A constructor can call a method that a subclass overrides (replaces with its own version). Java still runs the subclass version, but the subclass fields have not been set up yet, so a normal field holds its default value, unless it is assigned before `super(...)` (Java 25 and later) or is a `final` constant.

**Why:** The code looks right but gives a wrong value in a child class.

**Example:**

```java
class Base {
    Base() { System.out.println("Base sees: " + describe()); }
    String describe() { return "base"; }
}
class Child extends Base {
    private String label = "ready";
    Child() { System.out.println("Child sees: " + describe()); }
    @Override String describe() { return "label=" + label; }
}
```

`@Override` is a tag that makes the compiler check this replaces a parent method. `new Child()` printed `Base sees: label=null` and then `Child sees: label=ready`. With `label` written as `private final String label = "ready";` (a `final` field, set once, with a constant value), it printed `Base sees: label=ready`. With `label = "early";` placed before `super();` in the constructor, it printed `label=early`.

**Failure:** Calling `private`, `static` or `final` methods in a constructor does not hit this trap, because a child class cannot replace them.

## Topic: Object lifetime and garbage collection

**Definition:** An object lives while code can still reach it through a reference (a variable holding its address). When no running code can reach it, the garbage collector (the part of Java that frees memory) may reclaim it, at a time Java does not fix.

**Why:** You do not free memory yourself, and Java has no destructors. A file or network connection is not released by the garbage collector in time, so you close those yourself. The `finalize` method of `Object` is deprecated (officially discouraged) since Java 9 and marked for removal (to be deleted in a future Java) since Java 18; its API page suggests a `close` method plus `AutoCloseable` (a promise that lets `try` close the object) with `try`-with-resources (a `try` that closes things for you).

**Example:**

```java
class Door implements AutoCloseable {
    final String name;
    Door(String name) { this.name = name; System.out.println("open " + name); }
    public void close() { System.out.println("close " + name); }
}
try (Door d = new Door("A")) { System.out.println("inside"); }
// with two doors: try (Door d = new Door("A"); Door e = new Door("B")) { ... }
```

One door printed `open A`, `inside`, `close A`. With two doors, the last one opened closed first: `open A`, `open B`, `inside`, `close B`, `close A`.

**Failure:** Saying `System.gc()` or setting a variable to `null` frees an object at a chosen moment. Neither promises when. In C++ a destructor exists; Java has none.

## Questions

### When does the compiler add a default constructor?

Only when the class declares no constructor at all. It has no parameters, the same access as the class, and calls `super()`.

### What is the order of setup when you create a subclass object?

The first time, the class is set up once (static parts, parent first). Then the parent constructor runs, then the class's field initializers and instance blocks in file order, then the rest of the constructor body. Statements before `super(...)` (Java 25 and later) run before the parent constructor.

### What do `this(...)` and `super(...)` do?

`this(...)` calls another constructor of the same class. `super(...)` calls a parent constructor. A constructor has at most one such call (before Java 25 it must be first), and with none the compiler inserts `super()`.

### Does Java have destructors?

No. Unreachable objects are reclaimed by the garbage collector at a time Java does not fix. `finalize` is deprecated and marked for removal. For things like files, use `AutoCloseable` and `try`-with-resources.

## Mistakes

- Saying constructors are inherited. They are not; a subclass must declare its own.
- Calling an overridable method from a constructor and trusting the child fields. A normal field still holds its default value.
- Saying the compiler always adds a no-argument constructor. It does so only when you write no constructor.

## Quiz

### What does the compiler do if a class declares no constructor?

- [ ] It stops with a compile error for the class
- [x] It adds a default constructor
- [ ] It adds one separate constructor for each field
- [ ] It makes the whole class abstract

Explanation: A default constructor is added only when there is none, and it calls the parent's no-argument constructor.

### In `new Dog()`, which of these finishes first?

- [ ] The Dog constructor body
- [ ] The Dog field initializers
- [x] The Animal constructor
- [ ] The Dog instance blocks

Explanation: The parent constructor completes before the child's field initializers, instance blocks and constructor body. Statements written before `super(...)` (Java 25 and later) would run even earlier.

### How many times does a `static` block run for ten `new Dog()` calls?

- [x] Once
- [ ] Ten
- [ ] Zero
- [ ] Twice, parent and child

Explanation: A static block runs when the class is set up, which happens once. The parent's and the child's each run once.

### `Base()` calls a method that `Child` replaced, and that method reads a normal field of `Child` set on its own line. What does it see?

- [ ] The value set in the field line
- [ ] A compile error
- [ ] A run-time error
- [x] The default, `null`

Explanation: The parent constructor runs before the child's field initializers, so the field is still at its default.

### What is true of `finalize` in Java?

- [ ] It is the right way to release files
- [x] It is deprecated and marked for removal
- [ ] It is required for every class
- [ ] It runs at once when an object becomes unreachable

Explanation: The Object API page says it is deprecated since Java 9 and for removal, and suggests `close` with `AutoCloseable`.

## Diagram

```json
{ "kind": "flow", "caption": "Order of setup the first time new Dog() runs.", "steps": [{ "label": "Static parts, Animal then Dog" }, { "label": "Dog constructor starts, calls Animal constructor" }, { "label": "Animal fields and blocks" }, { "label": "Animal body" }, { "label": "Dog fields and blocks" }, { "label": "Dog body" }] }
```
