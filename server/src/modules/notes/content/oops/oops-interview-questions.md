---
id: oops-interview-questions
title: Interview Questions and Common Mistakes
lastChecked: 2026-11-12
next: none
roadmapSteps: java-spring:java-language-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (accuracy and plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and oops-drafts.md. Java examples compiled and run with Java 27; files in docs/content/checks/oops/. Claims: docs/content/SOURCES.md. -->

## Overview

OOP (object-oriented programming, building programs from objects that hold data and the code that works on it) questions come in clusters: abstract class against interface, overloading against overriding, `==` against `equals`, and whether Java passes by value (Java hands a copy of each value to a method). This section gives a spoken answer for each cluster and points to the section that explains the idea in full. It also corrects a few wrong answers.

After this section you can answer each cluster in under a minute, say what is Java-only, and name the rule that makes a common wrong answer wrong.

## Topic: Abstract class, interface and concrete class

**Definition:** A concrete class can be instantiated (made into an object with `new`). An abstract class is declared `abstract`, cannot be instantiated, and may mix finished methods with methods that have no body. An interface is a contract of methods a class promises to provide; a class extends one class but can implement many interfaces.

**Why:** A common rule of thumb: use an abstract class when subclasses share state and code, and an interface when unrelated classes need the same ability. Full rules are in "Abstraction, Abstract Classes and Interfaces".

**Example:**

```java
static abstract class Shape { abstract double area(); }
Shape s = new Shape();
```

The compiler says: `Shape is abstract; cannot be instantiated`. A `Duck implements Swims, Flies` compiles, and `d.move() + " " + d.fly()` prints `swim fly`.

**Failure:** Saying "an interface has no code". Since Java 8 an interface can have default methods (methods with a body).

## Topic: Overloading, overriding and hiding

**Definition:** Overloading is two methods with the same name but different parameters (different types or a different number of them), declared in one class or inherited by it; the compiler picks one from the declared types of the arguments. Overriding is a subclass giving its own body to an inherited instance method (an ordinary method, not `static`); the object's real class decides at run time. Hiding is a `static` method or a field with the same name in a subclass; the declared type of the variable decides.

**Why:** Mixing these up causes most "what does this print" mistakes. See "Polymorphism" and "Java Keywords and Object Behaviour".

**Example:** With `Animal a = new Dog();` and `Object o = "hello";`:

```
a.sound()          -> Woof           (overriding)
a.name             -> animal-field   (field hiding)
a.kind()           -> Animal.kind    (static hiding)
show(o)            -> show(Object)   (overloading)
show("hello")      -> show(String)
```

`o` holds a string, yet `show(Object)` runs, because overloads are chosen at compile time from the declared type.

**Failure:** Saying methods can be overloaded by return type. A signature is the method name plus its parameter types, and two methods `int size()` and `long size()` fail with `method size() is already defined`.

## Topic: Equality, hashCode and passing values

**Definition:** `==` on objects asks whether both sides are the same object; `equals` asks whether they mean the same thing, and unless a class overrides it, `equals` behaves like `==`. Equal objects must have equal `hashCode` values (a number that a hash collection such as `HashSet` uses to decide where to look for an item), so you override both together.

**Why:** A hash collection uses the hash code to find where to look, then `equals`. Also, Java passes by value: each argument's value is copied into the parameter, and for an object that value is a reference (a handle to the object).

**Example:** A class `P` overrides only `equals`; a subclass `Q` adds `hashCode`.

```
new String("java") == new String("java")        -> false
new String("java").equals(new String("java"))   -> true
set.contains(new P(1)) with equals only         -> false
set.contains(new Q(1)) with hashCode added      -> true
```

For parameters: `swap(x, y)` left `x.n` and `y.n` at `1 2`, because the method swapped its own copies of the references. `bump(x)` changed the object (`x.n` became 2). `reset(x)`, which assigns a new object to the parameter, left `x.n` at 2.

**Failure:** Saying "objects are passed by reference". If that were true, `swap` would work. The method can change the object it is given, but not which object the caller's variable points to. The `false` for the set is what this run printed; Java does not promise it, since unequal objects may share a hash code, but with `equals` alone the set can miss an equal object.

## Topic: Composition against inheritance

**Definition:** Inheritance is an "is a" relationship (a `Dog` is an `Animal`). Composition is a "has a" relationship: one object holds another as a field and uses it. See "Relationships Between Classes".

**Why:** A subclass gets every public method of its parent. Composition exposes only what you choose.

**Example:** `Bag extends ArrayList<String>` lets any caller use `bag.clear()`; after `add` then `clear`, `bag.size()` printed `0`. `Basket` holds a private list and offers only `add` and `count`; `basket.count()` printed `1`. Calling `new Basket().clear()` fails with `cannot find symbol`.

**Failure:** Saying "never use inheritance". Use it when the subclass can stand in everywhere the parent is used (the Liskov rule, see "SOLID Principles"); otherwise prefer composition.

## Topic: Static, instance and final

**Definition:** `static` means one copy for the class, `final` means assigned once; the full rules are in "Java Keywords and Object Behaviour".

**Why:** Interviewers often ask what `final` really fixes.

**Example:** A `final List<String> l` still accepts `l.add("still allowed")` and printed `[still allowed]`.

**Failure:** Saying `final` makes an object unchangeable. It fixes the variable, not the object it points to.

## Topic: Other languages and wrong answers

**Definition:** Some questions name C++, or repeat answers that are wrong. Answer with Java's rule.

**Why:** A question that names another language needs that language's answer, and a Java rule must not be passed off as a general OOP rule.

**Example:** "Does Java support multiple inheritance?" Not of classes (`extends A, B` is a compile error), but of types through interfaces. Another wrong answer: "a class always starts with all fields null". A field that holds an object reference and is never assigned is `null` (a number field starts at 0, a `boolean` at `false`); a local variable never assigned cannot be read: `variable local might not have been initialized`. Running it printed `null` for a `Dog field;`.

**Failure:** Saying "structs live on the stack, classes on the heap" (stack: space for a call's local variables; heap: space for objects). Java has no struct, and where an object lives depends on how it is created, not on `struct` against `class`. Java also has no friend functions.

## Questions

### What is the difference between an abstract class and an interface?

Abstract class when subclasses share state and code and form one family. Interface when different classes need the same ability. A class extends one class but implements many interfaces. Since Java 8 an interface can also carry default methods. Details: "Abstraction, Abstract Classes and Interfaces".

### What is the difference between overloading, overriding and hiding?

Overloading: same name, different parameters, chosen by the compiler from declared types. Overriding: a subclass replaces an instance method, chosen at run time by the real class. Hiding: static methods and fields, chosen by declared type.

### Why override hashCode when you override equals?

Equal objects must give equal hash codes, and hash collections use the hash code to find where to look, so with only `equals` a `HashSet` can miss an equal object.

### Does Java pass objects by reference?

No. Java copies the value of each argument into the parameter; for an object that value is a reference. The method can change the object but cannot make the caller's variable point to another object.

## Mistakes

- Comparing strings with `==`, or overriding `equals` without `hashCode`.
- Describing `final` as "the object cannot change".
- Presenting Java rules as general OOP rules, for example saying "OOP has no multiple inheritance".

## Quiz

### What does `String a = new String("java"); String b = new String("java"); System.out.println(a == b);` print?

- [ ] true
- [x] false
- [ ] a compile error
- [ ] null

Explanation: `==` compares references, and `new` makes two separate objects. `a.equals(b)` would print true.

### Which change makes two methods in one class a valid overload?

- [ ] Only a new return type
- [ ] Only a new parameter name
- [x] Another parameter count or type
- [ ] Only a different method body and a new return type

Explanation: A signature is the name and the parameter types, so a different type or a different number of parameters gives a valid overload. A different return type alone gives "is already defined".

### A method receives a Box reference and runs `a = new Box(99);`. What happens to the caller's variable?

- [ ] It now points to the new Box
- [x] It is unchanged
- [ ] It becomes null
- [ ] The compiler rejects the line

Explanation: The parameter is a copy of the reference, so the caller's variable still points to the old Box. Assigning to the copy does not move it.

### Which statement about `final List<String> l` is true?

- [ ] You cannot add items to it
- [ ] It must be empty forever
- [ ] It cannot be read
- [x] `l` cannot be reassigned

Explanation: `final` fixes the variable, not the list. The run showed `l.add` still works.

### Which is allowed in Java?

- [ ] Extending two classes at once
- [ ] Creating an object of an abstract class
- [x] A class implementing two interfaces
- [ ] Two methods differing only in return type

Explanation: A class has one superclass but may implement many interfaces. The other three fail to compile.
