---
id: oops-basics
title: Classes, Objects and Encapsulation
lastChecked: 2026-11-12
next: oops-pillars
roadmapSteps: java-spring:java-language-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (accuracy and plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and oops-drafts.md. Java examples compiled and run with Java 27; files in docs/content/checks/oops/. Claims: docs/content/SOURCES.md. -->

## Overview

OOP (object-oriented programming) means writing a program as small things that hold data and the actions on that data. In Java, a class is the plan and an object is one thing built from the plan. This section covers `new`, access modifiers (words that say who may use a member, which is a field or a method), encapsulation (keeping data private behind methods), `this` (the object running the code) and `null` (no object at all).

After this section you can explain each of these in about a minute and predict what a short piece of code prints.

## Topic: Class and object

**Definition:** A class is a blueprint that says what data a thing holds (fields: variables that belong to an object) and what it can do (methods: named blocks of code). An object is one thing made from that blueprint, with its own values in the fields.

**Why:** Without classes you would keep loose variables for every dog, account or order, and nothing would tie the data to the code that works on it.

**Example:**

```java
class Dog {
    String name;
    int age;
    void bark() { System.out.println(name + " says woof"); }
}
// in the starting method:
Dog a = new Dog();  a.name = "Rex";  a.age = 3;
Dog b = new Dog();  b.name = "Milo";
a.bark();  b.bark();
System.out.println(a.age + " " + b.age);
```

Output: `Rex says woof`, then `Milo says woof`, then `3 0`. The two objects share one plan but keep separate values. `b.age` is `0` because Java gives a number field the value 0 when you do not set it.

**Failure:** Saying "a class takes up memory" as soon as it is written. Memory for an object is allocated when `new` runs. (A class's `static` fields, which belong to the class and not to any object, exist once, when the class is first used.)

## Topic: Creating objects with new, and reference variables

**Definition:** `new Dog("Rex")` builds a new object and gives back a reference (a handle that points to it). A variable such as `Dog a` does not hold the object. It holds a reference to it, so it is called a reference variable. Several variables can point at the same object.

**Why:** Knowing this explains why changing an object through one variable shows up through another.

**Example:**

```java
class Dog {
    String name;
    Dog(String name) { this.name = name; }
}
// in the starting method:
Dog a = new Dog("Rex");
Dog b = a;                 // copies the reference, not the object
Dog c = new Dog("Rex");    // a second, separate object
b.name = "Max";
System.out.println(a.name);      // Max
System.out.println(a == b);      // true
System.out.println(a == c);      // false
```

Output: `Max`, `true`, `false`. The `==` check on references asks "do they point to the same object?", not "do they look the same?".

**Failure:** Believing that `Dog d;` creates a Dog. It creates only a variable that points at no object yet. `null` is a separate value: you can assign it, and a reference field that you never set also starts as `null`. A `new` expression that completes normally always gives a new object. Java may free an object once nothing refers to it (the garbage collector, the automatic clean-up of unused objects, decides when).

## Topic: Access modifiers

**Definition:** An access modifier is a keyword that says who may use a field or method. For members Java has four levels: `private` (only the same class), no keyword, called package-private (any class in the same package, which is a folder-like group of classes), `protected` (the same package, plus subclasses, which are classes that build on another class) and `public` (everyone). A top-level class can be only `public` or package-private.

| Level | Same class | Same package | Subclass in other package | Everyone |
|---|---|---|---|---|
| `public` | yes | yes | yes | yes |
| `protected` | yes | yes | yes (code inside the subclass, through a subclass-type reference) | no |
| none | yes | yes | no | no |
| `private` | yes (the same top-level class, nested classes included) | no | no | no |

**Why:** Hiding what outsiders do not need to touch lets you change the inside later without breaking the code that uses the class.

**Example:** The class `Item` has one member at each level.

```java
package shop;
public class Item {
    private int cost = 5;
    int stock = 7;
    protected String tag = "new";
    public String name = "pen";
}
```

Code in package `app` that is not a subclass can read only `name`; it printed `pen`. Reading the others stops the compiler with `cost has private access in Item`, `stock is not public in Item; cannot be accessed from outside package` and `tag has protected access in Item`.

**Failure:** Saying `protected` means "subclasses only". It also lets the whole package in. Another slip is thinking that leaving out the keyword means public. It means package-private.

## Topic: Encapsulation, getters and setters

**Definition:** Encapsulation means keeping a class's data private and letting other code reach it only through the class's methods. A getter is a method that returns a field; a setter is a method that changes one. Rules about what values are allowed go inside these methods.

**Why:** If the field is public, any code can store a wrong value, such as a negative balance, and you would have to check every place that touches it.

**Example:**

```java
class Account {
    private int balance;
    void deposit(int amount) {
        if (amount <= 0) throw new IllegalArgumentException("deposit must be positive"); // stops with an error
        balance += amount;
    }
    int getBalance() { return balance; }
}
```

After `deposit(100)` the balance is `100`. A call `deposit(-5)` is rejected with the message `deposit must be positive` and the balance stays `100`.

**Failure:** Adding a getter and setter for every private field and calling that encapsulation. A setter that accepts anything protects nothing. The point is to expose actions with rules (`deposit`), not raw fields.

## Topic: The this keyword

**Definition:** Inside an instance method or constructor (a special method that sets up a new object), `this` means the object that is running the code right now. It is most often used when a parameter has the same name as a field: `this.count` is the field and `count` is the parameter. `this(...)` can also call another constructor of the same class.

**Why:** Without `this`, a parameter called `count` would hide the field of the same name and the assignment would change only the parameter.

**Example:**

```java
class Counter {
    int count;
    Counter add(int count) {
        this.count += count;
        return this;        // lets calls be chained
    }
}
// new Counter().add(2).add(3) leaves count at 5
```

The program printed `5`.

**Failure:** `this` does not exist in a `static` method, because there is no current object. Compiling `this.count` there gives `non-static variable this cannot be referenced from a static context`.

## Topic: null and NullPointerException

**Definition:** `null` is the value of a reference variable that points to no object. Using a null reference to call a method or read a field throws a NullPointerException (a runtime error that stops the program unless the code handles it).

**Why:** The error message names the empty variable, so you can find the missing object quickly.

**Example:**

```java
String s = null;
System.out.println(s == null);   // true
System.out.println(s.length());  // throws
```

Output: `true`, then `Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "s" is null`.

**Failure:** Thinking `null` is an empty object or the number zero. It is the absence of any object. Checking `s == null` before use is safe; calling `s.equals(...)` on a null `s` is not.

## Topic: Packages

**Definition:** A package is a named group of related classes, set with the `package` line at the top of a file. Another package's public classes are used by the full name or by an `import` line (`import` lets you use a class from another package by its short name). Names are written in lowercase, often starting with a reversed web address such as `com.example.shop`. A file with no `package` line belongs to the unnamed package.

**Why:** Packages stop two classes with the same name from clashing and give package-private access its meaning.

**Example:**

```java
package app;        // first line of Main.java
import shop.Item;   // lets Main write Item instead of shop.Item
```

With these two lines, `Main` creates an `Item` and printed `pen` (the public `name`).

**Failure:** Thinking `import java.awt.*;` also imports `java.awt.color`. Those are separate packages; the star covers one package only.

## Questions

### What is the difference between a class and an object?

A class is the blueprint: it says which fields and methods exist. An object is one real thing built from it with `new`, holding its own values. Many objects can come from one class.

### What does the new keyword do?

It builds a new object of the class, runs a constructor to set it up, and gives back a reference to it. A variable holds that reference, not the object.

### What is encapsulation and why use it?

Keep the data private and let outside code reach it only through methods. The class can then check every change, so it never holds a wrong value, and its inside can change without breaking users.

## Mistakes

- Saying a class uses memory as soon as it is written. The memory is allocated for an object when `new` runs.
- Saying protected members are visible to subclasses only. The same package can see them too.

## Quiz

### What does `Dog b = a;` do when `a` already refers to a Dog object?

- [ ] Creates a second copy of the Dog object
- [x] Makes `b` refer to the same object
- [ ] Creates an empty Dog
- [ ] Makes `a` refer to nothing

Explanation: Only the reference is copied, so both variables point at one object.

### Which access level allows the same package but never a subclass in another package?

- [ ] private: the same class only
- [ ] public: every class at all
- [ ] protected: package and subclasses
- [x] no keyword: the package only

Explanation: No keyword means same package only. Protected also allows subclasses outside the package.

### What happens when you call `s.length()` and `s` is `null`?

- [ ] It returns 0
- [x] A NullPointerException is thrown
- [ ] The compiler stops with an error
- [ ] It returns an empty string

Explanation: The call fails at run time because there is no object to run the method on.

### Which line of code creates an object?

- [ ] `Dog d;`
- [ ] `Dog d = null;`
- [x] `Dog d = new Dog();`
- [ ] `class Dog {}`

Explanation: Only `new` builds an object. The others declare a variable or a class.

### Why is the balance field in an Account class usually private?

- [ ] Because private fields use less memory
- [ ] Because Java refuses to compile a class with public fields
- [x] Because every change then goes through methods
- [ ] Because subclasses can then reach it more easily

Explanation: Private data forces every change through methods, where rules such as "no negative deposit" are enforced.
