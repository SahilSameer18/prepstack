---
id: oops-abstraction
title: Abstraction, Abstract Classes and Interfaces
lastChecked: 2026-11-12
next: oops-constructors
roadmapSteps: java-spring:java-language-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (accuracy and plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and oops-drafts.md. Java examples compiled and run with Java 27; files in docs/content/checks/oops/. Claims: docs/content/SOURCES.md. -->

## Overview

Abstraction means showing a simple contract (a promise of what something does) and hiding how it is done. In Java the main tools are the abstract class (a class, which is a blueprint for objects, that cannot be created directly) and the interface (a list of things a class promises to do). Interviewers ask when to use which, whether an interface can hold code, and what happens when two default methods (methods with a ready-made body inside an interface) clash.

After this section you can define each, choose between an abstract class and an interface, and fix a clash between two default methods.

## Topic: Abstraction as a contract

**Definition:** Abstraction is exposing what something does and hiding how it does it. The user of a type (a class or interface name that says what something is) sees a short list of actions, not the steps inside.

**Why:** Code that depends only on the contract keeps working when the inside changes. In Java the contract is written as an abstract method (a method with a name and parameters but no body) in an abstract class or an interface.

**Example:** A caller asks a `Shape` for its `area()`. It does not care whether the shape is a square or a rectangle. Each kind of shape supplies its own way to work out the area.

```java
interface Shape { double area(); }
// Square.area() returns side * side; Rect.area() returns w * h
Shape[] all = { new Square(3), new Rect(2, 5) };
for (Shape s : all) System.out.println(s.area());   // 9.0 then 10.0
```

**Failure:** Mixing abstraction with encapsulation (hiding fields, the variables kept inside an object, with `private`, which lets only code in the same class use them). Abstraction is about the contract you show; encapsulation is about protecting the data behind it. Also, `abstract` is only one tool; an interface also gives abstraction.

## Topic: Abstract classes

**Definition:** An abstract class is declared with `abstract`. Using `new` on it is a compile-time error (the compiler, the tool that turns code into a program, refuses to build it). A subclass (a class that extends, meaning builds on, another class) must give a body to every inherited abstract method, or be abstract too.

**Why:** It lets related classes share fields, constructors (special methods that set up a new object) and working code, while forcing each one to supply the missing parts. It may have abstract methods, but it does not have to. A class that is not abstract must not have an abstract method. An anonymous subclass such as `new Shape("x") { ... }` is a different thing and does compile.

**Example:**

```java
abstract class Shape {
    private final String name;
    Shape(String name) { this.name = name; }
    abstract double area();
    String describe() { return name + " with area " + area(); }
}
class Square extends Shape {
    private final double side;
    Square(double side) { super("Square"); this.side = side; }
    double area() { return side * side; }
}
// new Shape("x") -> error: Shape is abstract; cannot be instantiated
// new Square(3).describe() -> Square with area 9.0
```

The constructor of `Shape` still runs when a `Square` is built, through `super("Square")`.

**Failure:** Saying an abstract class cannot have a constructor. It can, and it runs when a subclass object is built. The other error is saying it must have an abstract method; it may have none.

## Topic: Interfaces

**Definition:** An interface is a contract that classes can promise to follow. Its members (fields and methods) are `public` (anyone can use them) unless marked `private`. A method with no `private`, `default` or `static` is abstract.

**Why:** Unrelated classes can share a contract without sharing a parent class. Fields in an interface are always `public static final`: `static` means one copy for the whole interface, `final` means the name can never be pointed at another value. So an interface cannot hold per-object state (data kept separately in each object). It may also have a default method (has a body, so classes get it free), a static method (belongs to the interface itself) and, since Java 9, a private method (usable only inside the interface, to share code between default methods).

**Example:**

```java
interface Greeter {
    int MAX = 3;                       // public static final
    String name();                     // abstract
    default String greet() { return prefix() + name(); }
    private String prefix() { return "Hello, "; }
}
class Ravi implements Greeter {
    public String name() { return "Ravi"; }
}
```

A class that supplies `name()` gets `greet()` without writing it. `new Ravi().greet()` gives `Hello, Ravi`. Writing `Greeter.MAX = 4;` fails: `cannot assign a value to static final variable MAX`. Compiling a private interface method with `--release 8` (compile using Java 8 rules) fails with `private interface methods are not supported in -source 8`; with `--release 9` it compiles.

**Failure:** Saying interface methods are "always abstract". Default, static and private methods have bodies. Also, a `default` method needs a body; a `private` method cannot be abstract.

## Topic: One parent class, many interfaces

**Definition:** Every class except `Object` (the built-in class every class comes from) has exactly one direct superclass (the class it extends), which is `Object` for an ordinary class that writes none. It may implement (promise to follow) a comma-separated list of interfaces. So a class can get contracts and default methods from many interfaces, but fields and constructors from only one parent class.

**Why:** One effect is that Java never has two parent classes with the same field. Interfaces give the "can do" side without that clash, because they hold no per-object fields. They can still clash on a default method; see the topic on two default methods.

**Example:** `class Person implements Greeter, Logger` uses `greet()` from one interface and `tag()` from another.

```java
interface Logger { default String tag() { return "[log]"; } }
class Person implements Greeter, Logger {
    public String name() { return "Asha"; }
}
System.out.println(new Person().greet() + " " + new Person().tag());
// Hello, Asha [log]
```

**Failure:** Writing `class A extends B, C`, which does not compile. C++ (another programming language) does allow several parent classes; its Core Guidelines advise making a base class used as an interface purely abstract, with functions declared `= 0` that a derived class must override.

## Topic: Abstract class or interface

**Definition:** Use an abstract class when related classes need shared fields, constructors or ready-made code. Use an interface when you need only a contract, or when unrelated classes must share it, or a class already has a parent.

**Why:** A wrong choice is costly: a class that extends an abstract class can never extend another, but it can implement ten interfaces.

**Example:** `Dog` and `Cat` share a `name` field and a `describe()` method: use an abstract `Animal`. `Dog` and `Robot` both can `Walk`: use an interface `Walker`.

**Failure:** Answering "an interface has no code and an abstract class has". The real differences are state (data kept separately in each object), constructors and the one-parent limit.

## Topic: When two default methods clash

**Definition:** If a class inherits a default method with the same name and parameters from two interfaces that are not related (neither extends the other), the compiler refuses to build it. The class must write its own version, and `A.super.hi()` inside it calls the version from interface `A`.

**Why:** Without a rule, the program would not know which body to run. This is the diamond problem: the trouble when a class could get the same method by two routes and Java cannot tell which one to use. A method written in a class (or inherited from a parent class) wins over an interface default. If one interface extends the other and overrides the method, the lower one wins and nothing clashes.

**Example:**

```java
interface A { default String hi() { return "A"; } }
interface B { default String hi() { return "B"; } }
class Both implements A, B {
    public String hi() { return A.super.hi() + B.super.hi(); }
}
class Base { public String hi() { return "Base"; } }
class Mixed extends Base implements A { }
interface B2 extends A { default String hi() { return "B2"; } }
class Related implements A, B2 { }
```

Without the method in `Both`, the compiler says: `types A and B are incompatible; class Both inherits unrelated defaults for hi() from types A and B`. With it, `new Both().hi()` gives `AB`. `new Mixed().hi()` gives `Base` because the class method won. `new Related().hi()` gives `B2` because `B2` extends `A`.

**Failure:** Saying Java has no diamond problem at all. It has a version of it with defaults.

## Topic: Functional interface

**Definition:** A functional interface has exactly one abstract method, not counting methods every object already has, such as `equals`. A lambda (a short inline function) can stand in for it.

**Why:** It lets you pass a small piece of behaviour as an argument instead of writing a whole class. It must also not be declared `sealed`.

**Example:**

```java
interface Rule { boolean ok(int n); }
Rule even = n -> n % 2 == 0;   // % gives the remainder, so true when n is even
System.out.println(even.ok(4) + " " + even.ok(5));   // true false
```

**Failure:** Thinking a functional interface cannot have default methods. They do not count towards the one abstract method.

## Questions

### What is abstraction?

Showing what something does and hiding how. In Java you write the promise as an abstract method in an abstract class or an interface, and each class fills in the how.

### Abstract class or interface: which do you pick?

An abstract class if the classes are closely related and share fields or code. An interface if I only need a contract, the classes are unrelated, or a class needs many contracts. A class extends one class but implements many interfaces.

### Can an abstract class have a constructor? Can an interface?

An abstract class can; it runs when a subclass is built. An interface cannot, because it has no per-object state.

### Two interfaces give the same default method. What happens?

If neither interface extends the other, the class does not compile until it writes its own method. It can call one with `A.super.hi()`. A method from a class always beats an interface default.

## Mistakes

- Saying an interface cannot contain code. It can have default, static and private methods.
- Saying an abstract class is useless because you cannot create one. A variable of that type can hold an object of any class that extends it.

## Quiz

### What happens when you write `new Shape("x")` and `Shape` is abstract?

- [ ] It runs the constructor of `Shape`
- [ ] It creates an empty object
- [x] It fails to compile
- [ ] It throws an exception at run time

Explanation: Using `new` on an abstract class is a compile-time error.

### Which statement about interface fields is correct?

- [x] They are public static final
- [ ] They are private by default
- [ ] They belong to each object
- [ ] Implementing classes can change their value

Explanation: Every interface field is shared and the name is never reassigned.

### A class needs shared fields and a constructor for its subclasses. What fits best?

- [ ] An interface
- [ ] A functional interface
- [ ] A default method
- [x] An abstract class

Explanation: Interfaces cannot hold per-object fields or constructors.

### Interfaces A and B (neither extends the other) both have `default String hi()`. Class Both implements both and writes nothing. What happens?

- [ ] A wins because it comes first
- [x] It does not compile
- [ ] B wins because it comes last
- [ ] It runs both methods

Explanation: The class must write its own `hi()` and may call `A.super.hi()`.

### How many classes can a Java class directly extend (build on)?

- [ ] As many as it likes
- [ ] Two
- [x] One
- [ ] None, since a class may only implement

Explanation: A class extends one class (`Object` if none is written) but may implement many interfaces.

## Diagram

```json
{ "kind": "graph", "caption": "Square and Circle extend the abstract class Shape; Dog implements the interface Walker.", "nodes": [{ "id": "shape", "label": "Shape (abstract)", "x": 25, "y": 15 }, { "id": "square", "label": "Square", "x": 10, "y": 75 }, { "id": "circle", "label": "Circle", "x": 40, "y": 75 }, { "id": "walker", "label": "Walker (interface)", "x": 75, "y": 15 }, { "id": "dog", "label": "Dog", "x": 75, "y": 75 }], "edges": [{ "from": "square", "to": "shape", "label": "extends" }, { "from": "circle", "to": "shape", "label": "extends" }, { "from": "dog", "to": "walker", "label": "implements" }] }
```
