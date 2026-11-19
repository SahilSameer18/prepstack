---
id: oops-pillars
title: The Four Pillars and Inheritance
lastChecked: 2026-11-12
next: oops-polymorphism
roadmapSteps: java-spring:java-language-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (accuracy and plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and oops-drafts.md. Java examples compiled and run with Java 27; files in docs/content/checks/oops/. Claims: docs/content/SOURCES.md. -->

## Overview

This section names the four pillars of OOP (object-oriented programming) and goes deep on inheritance, where a class (a plan for objects) takes over the fields and methods (its data and its actions) of another class. Encapsulation keeps data private, abstraction shows what a thing does and hides how, and polymorphism lets one call act differently depending on the object. Questions cover `extends` (names the parent class), `super` (reaches the parent), overriding (a new version of an inherited method), `final` (blocks change), and why Java allows only one parent class.

After this section you can name the pillars, explain inheritance in a minute, and predict small programs.

## Topic: The four pillars

**Definition:** The four pillars are encapsulation (data kept private and reached only through methods), abstraction (showing what a thing does and hiding how), inheritance (a class gets the members, meaning fields and methods, of another class) and polymorphism (one call behaves differently depending on the object). Inheritance is the rest of this section.

**Why:** Each pillar matches a real Java tool: private fields, abstract classes and interfaces, `extends`, and overriding.

**Example:**

```java
class Animal { String sound() { return "..."; } }
class Dog extends Animal {                    // inheritance
    private int age = 3;                      // encapsulation
    int getAge() { return age; }
    String sound() { return "woof"; }
}
// Animal a = new Dog();
// a.sound()           -> woof   (polymorphism)
// ((Dog) a).getAge()  -> 3
```

`Animal` gives the simple outline `sound()` (abstraction); `Dog` fills it in. The run printed `woof` and then `3`.

**Failure:** Mixing up encapsulation and abstraction. Encapsulation is about guarding data inside a class. Abstraction is about the simple outline other code sees.

## Topic: Inheritance with extends, and Object at the top

**Definition:** Inheritance lets a new class, the subclass (child), reuse a class that already exists, the superclass (parent). You write `class Dog extends Animal`; a Java class other than `Object` has exactly one direct superclass. If you write no `extends`, that parent is `Object`, the class at the very top of the family tree, so every class descends from `Object`.

**Why:** You write shared code once, in the superclass, instead of copying it into every subclass.

**Example:**

```java
class Animal { String name = "Rex"; }
class Dog extends Animal {
    void bark() { System.out.println(name + " barks"); }
}
// Dog d = new Dog();
// d.bark()                                     -> Rex barks
// Animal.class.getSuperclass().getSimpleName() -> Object
// d instanceof Animal                          -> true
```

`instanceof` asks whether an object is of a type. The run printed `Rex barks`, `Object` (the parent of `Animal`) and `true`.

**Failure:** Reversing the direction. A `Dog` is an `Animal`, but not every `Animal` is a `Dog`. Use the is-a test: only write `extends` if "subclass is a superclass" is true in plain speech. "Car is an Engine" is false; a car has an engine, so use a field instead.

## Topic: What a subclass receives

**Definition:** A subclass receives the fields and methods that are `public` or `protected`, and the package-private ones if it is in the same package. Private members are not inherited, so subclass code cannot name them. Constructors are not inherited either. The private data is still part of every object, and it can be reached through the superclass's own public or protected methods.

**Why:** It shows that a subclass cannot break the rules the superclass set for its own data.

**Example:**

```java
class Animal {
    private String secret;
    Animal(String s) { secret = s; }
    String getSecret() { return secret; }
}
class Dog extends Animal {
    Dog() { super("bone"); }
    void show() { System.out.println(getSecret()); }
}
```

`new Dog().show()` printed `bone`. If `show` used `secret` directly the compiler says `secret has private access in Animal`.

**Failure:** Saying "private members do not exist in the child object". The data is there and `getSecret()` reads it. What is missing is the right to use the name `secret` in the subclass.

## Topic: The super keyword

**Definition:** `super` points at the superclass part of the current object. `super.describe()` calls the superclass's version of a method, and `super.name` reaches a field the subclass has re-declared with the same name. `super(args)` calls a superclass constructor (a special method that sets up a new object); a constructor holds at most one such call, either `super(...)` or `this(...)`. Before Java 25 that call had to be the first statement; now code may come before it as long as it does not use the object being built. If the constructor has neither call, Java adds `super()` with no arguments.

**Why:** The superclass knows how to set up its own fields, so the subclass asks it to.

**Example:**

```java
class Animal {
    String name;
    Animal(String name) { this.name = name; }
    String describe() { return "animal " + name; }
}
class Dog extends Animal {
    Dog(String name) { super(name); }
    String describe() { return "dog, and also " + super.describe(); }
}
```

`new Dog("Rex").describe()` gave `dog, and also animal Rex`. A `Dog` constructor that first checks `if (name == null) throw ...` and then calls `super(name.trim())` also compiled and printed `Rex` for `" Rex "`.

**Failure:** A subclass of `Animal` with no constructor fails when `Animal` has only `Animal(String)`. The compiler reports `constructor Animal in class Animal cannot be applied to given types`, then says it required a `String` and found no arguments, because the hidden `super()` finds nothing to call.

## Topic: Overriding and @Override

**Definition:** Overriding means a subclass writes its own version of an inherited instance method (an ordinary method, not marked `static`), with the same name and the same parameter types. The annotation `@Override` (a tag the compiler reads) says "I mean to override". If no inherited method (from a parent class or an interface) matches, the compiler stops with an error.

**Why:** A spelling slip would otherwise create a new, unrelated method and the old behaviour would run without a warning.

**Example:**

```java
class Animal { String sound() { return "..."; } }
class Dog extends Animal {
    @Override String sound() { return "woof"; }
}
// Animal a = new Dog();
// a.sound() -> woof    new Animal().sound() -> ...
```

The output was `woof` and then `...`. With `@Override String sond()` the compiler said `sond() in Dog does not override or implement a method from a supertype`.

**Failure:** Thinking overriding is only allowed with `@Override`. The annotation is optional; it is a safety check. The full rules (access, return type, `static`) are in the next section.

## Topic: Stopping inheritance with final

**Definition:** `final` on a class means no class may extend it. `final` on a method means no subclass may override it. A class cannot be both `final` and `abstract` (abstract means incomplete, meant to be extended).

**Why:** You use `final` when a class or method must keep its exact behaviour. The standard `String` class is declared final.

**Example:**

```java
class Animal { final String breathe() { return "breathes"; } }
class Dog extends Animal { }
// new Dog().breathe() -> breathes
```

The `Dog` object used the inherited final method and printed `breathes`. Overriding `breathe()` in `Dog` gives `breathe() in Dog cannot override breathe() in Animal` followed by `overridden method is final`. Extending a final class `Dog` gives `cannot inherit from final Dog`.

**Failure:** Thinking `final` on a variable means the same. On a variable it means the value can be set only once; the object it points at can still change.

## Topic: Types of inheritance, multiple inheritance and the diamond problem

**Definition:** Common interview names: single (one subclass, one superclass), multilevel (a chain, `Puppy` extends `Dog` extends `Animal`) and hierarchical (`Dog` and `Cat` both extend `Animal`). Java lets a class extend only one class, but it may implement several interfaces (contracts that list methods to provide). The diamond problem is two parents that come from the same grandparent, both supply the same method, and the child cannot tell which to use (the drawn shape is a diamond).

**Why:** A reason usually given for one parent class is that two parents could bring two sets of fields that clash. Interfaces avoid this because an interface holds no per-object fields.

**Example:**

```java
interface Walker  { default String move() { return "walk"; } }
interface Swimmer { default String move() { return "swim"; } }
class Duck implements Walker, Swimmer {
    public String move() { return Walker.super.move() + " and " + Swimmer.super.move(); }
}
// new Duck().move() -> walk and swim
```

A default method is a method with a body inside an interface. The run printed `walk and swim`.

**Failure:** Saying Java has no multiple inheritance at all. It has none for classes; it has it for interfaces. Without its own `move()`, `Duck` fails with `class Duck inherits unrelated defaults for move() from types Walker and Swimmer`.

## Questions

### What are the four pillars of OOP?

Encapsulation: keep data private behind methods. Abstraction: show what a thing does, hide how. Inheritance: a class takes the members of another. Polymorphism: one call, different behaviour depending on the object.

### Why does Java not support multiple inheritance of classes?

A reason usually given: two parent classes could both bring fields, constructors or a same-named method, and the child could not tell which to use. Java avoids this for classes. A class can still implement many interfaces.

### What is the difference between super and this?

`this` is the current object. `super` is its superclass part: `super(...)` calls a parent constructor and `super.method()` calls the parent's version.

### What is the root class in Java?

`Object`. A class with no `extends` has it as the direct superclass, so every class descends from it.

## Mistakes

- Saying a subclass does not inherit anything private, so the data is missing from the object. The data is there; the subclass just cannot name it.
- Using inheritance for "has-a" ideas. If "X is a Y" sounds wrong, use a field instead.

## Quiz

### How many direct superclasses can a Java class other than `Object` have?

- [ ] None
- [x] One
- [ ] Two
- [ ] Any number

Explanation: Such a class has one direct superclass. If none is written, it is `Object`.

### What does `@Override` do?

- [ ] It makes the method run faster than others
- [x] The compiler checks the override is real
- [ ] It lets the method be called without an object
- [ ] It stops other classes from calling the method

Explanation: The method must override one from a supertype (a parent class or an interface). It changes nothing at run time; it only turns a mistaken method name into a compile error.

### What happens when a class extends a `final` class?

- [ ] It compiles with a warning
- [ ] Its methods become final
- [x] A compile error
- [ ] The final class becomes abstract

Explanation: The compiler reports `cannot inherit from final`.

### A subclass constructor has no `super(...)` line and the superclass has only a constructor that needs a String. What happens?

- [ ] Java passes an empty string
- [ ] Java passes null
- [x] A compile error
- [ ] The superclass constructor is skipped

Explanation: Java adds `super()` with no arguments, and there is no such constructor.

### Which statement about private members and inheritance is right?

- [ ] The object has no space for them
- [ ] Subclass code can use their names
- [x] Data is kept, but names are blocked
- [ ] They turn into protected members

Explanation: The subclass cannot use the name, but the superclass's methods still work on the data.

## Diagram

```json
{ "kind": "graph", "caption": "A small class family: every class descends from Object.", "nodes": [{ "id": "obj", "label": "Object", "x": 50, "y": 8 }, { "id": "animal", "label": "Animal", "x": 50, "y": 38 }, { "id": "dog", "label": "Dog", "x": 25, "y": 70 }, { "id": "cat", "label": "Cat", "x": 75, "y": 70 }, { "id": "puppy", "label": "Puppy", "x": 25, "y": 95 }], "edges": [{ "from": "animal", "to": "obj", "label": "extends" }, { "from": "dog", "to": "animal", "label": "extends" }, { "from": "cat", "to": "animal", "label": "extends" }, { "from": "puppy", "to": "dog", "label": "extends" }] }
```
