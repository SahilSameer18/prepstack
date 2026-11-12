---
id: oops-polymorphism
title: Polymorphism
lastChecked: 2026-11-12
next: oops-abstraction
roadmapSteps: java-spring:java-language-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (accuracy and plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and oops-drafts.md. Java examples compiled and run with Java 27; files in docs/content/checks/oops/. Claims: docs/content/SOURCES.md. -->

## Overview

Polymorphism means "many forms": the same method call can do different work. Java has two kinds. Overloading (several methods with one name and different parameters) is settled by the compiler before the program runs. Overriding (a subclass replacing a method it inherited from its parent class) is settled while the program runs, by the real type of the object. This section covers the rules of each, casting, and code-output puzzles.

After this section you can state both kinds with their exact rules and predict what overloaded and overridden calls print.

## Topic: Overloading, chosen at compile time

**Definition:** Overloading means a class has several methods (including methods it inherits) with the same name but different parameter lists, meaning a different number of parameters or different parameter types. The compiler picks one while compiling, using the number and types of the arguments (the values you pass) in your call. The return type plays no part in the choice.

**Why:** One clear name like `add` works for whole numbers, decimals and three numbers, so callers need not remember several names.

**Example:**

```java
static int add(int a, int b) { return a + b; }
static double add(double a, double b) { return a + b; }
static int add(int a, int b, int c) { return a + b + c; }
// add(1, 2)   add(1.5, 2)   add(1, 2, 3)
```

The three calls printed `3`, `3.5` and `6`.

**Failure:** Probe: can you add `String get(int a)` next to `int get(int a)`? No. The compiler says `method get(int) is already defined in class`, because only the return type differs. Overloading is also not "runtime polymorphism": which overload runs is fixed before the program starts.

## Topic: Overriding and its rules

**Definition:** Overriding means a subclass gives its own body to an inherited instance method (an ordinary method that belongs to each object, not marked `static`). Inside the new body, `super.name()` runs the parent's version.

**Why:** Code written for the superclass keeps working when it is given a subclass object, because the rules below keep the override compatible:

- The name and parameter types are the same.
- A `void` or primitive (`int`, `double`...) return type stays exactly the same. A method that returns a class type may return a subclass of it (a covariant return, meaning a more specific type).
- The access cannot be weaker (`public` is the widest; a `public` method cannot become package-private).
- It may throw only the same checked exceptions (errors the compiler forces you to handle) or narrower ones, never new or broader ones.
- A `final` method cannot be overridden, and a `static` method can only be hidden (see the static topic below).

**Example:**

```java
class Animal {
    Animal make() { return new Animal(); }
    public String name() { return "animal"; }
}
class Dog extends Animal {
    @Override Dog make() { return new Dog(); }      // covariant return
    @Override public String name() { return "dog"; }
}
```

With `Animal a = new Dog();`, `a.make()` made a `Dog` and `a.name()` printed `dog`. The compiler rejects a package-private `name()` in `Dog` with `attempting to assign weaker access privileges; was public`, and a `run()` that adds `throws Exception` with `overridden method does not throw Exception`.

**Failure:** Probe: `Dog` has `name(String x)` and `Animal` has `name()`. Is that an override? No, it is an overload, and the superclass method stays untouched.

## Topic: Dynamic method dispatch and hidden fields

**Definition:** Dynamic method dispatch (also called virtual method invocation) means that for an instance method that can be overridden (not `private`, not called with `super.`), the version that runs is chosen when the program runs, from the real class of the object, not from the type of the variable. A subclass field with the same name as a superclass field hides it (both exist; you reach one or the other), and a field is looked up by the type of the variable.

**Why:** You can write code against `Animal` and have each `Dog` or `Cat` do its own thing, without any `if` on the type.

**Example:**

```java
class Animal { String type = "animal"; String sound() { return "..."; } }
class Dog extends Animal {
    String type = "dog";
    @Override String sound() { return "woof"; }
}
Animal a = new Dog();
a.sound();        // woof
a.type;           // animal
((Dog) a).type;   // dog
```

The three lines printed `woof`, `animal` and `dog`.

**Failure:** Probe: `a.type` on an `Animal a = new Dog();`: does it give `dog`? No, it gives `animal`. Only instance methods follow the object; fields and `static` methods follow the variable's type.

## Topic: Static methods are hidden, not overridden

**Definition:** If a subclass declares a `static` method (one that belongs to the class, not to an object) with the same name and parameter types as a superclass `static` method, it hides the parent's one. Which one runs depends on the type of the variable, not on the object. An instance method with the same signature as an inherited `static` method is a compile error, and so is the reverse.

**Why:** A `static` method belongs to the class, so there is no object to look at when choosing.

**Example:**

```java
class Animal { static String kind() { return "animal"; } }
class Dog extends Animal { static String kind() { return "dog"; } }
Animal a = new Dog();
a.kind();      // animal
Dog.kind();    // dog
```

It printed `animal` and `dog`. Writing `void info()` in `Dog` over an inherited `static void info()` gives `overridden method is static`.

**Failure:** Probe: `a.kind()` is called through an `Animal` variable that holds a `Dog`. Which class's method runs? `Animal`'s. It looks like overriding only until you call it through a parent variable.

## Topic: Upcasting, downcasting and ClassCastException

**Definition:** Upcasting means treating a subclass object as its superclass type, for example `Animal a = new Dog();`. It needs no cast. Downcasting means going back to the subclass with an explicit cast, `(Dog) a`. The compiler allows it when the types are related (casting `(Dog) "text"` is a compile error). At run time Java checks the real class and throws a ClassCastException (an error for a cast that does not fit) if the object is not that type. `instanceof` answers whether an object is of a type.

**Why:** A superclass variable only offers the superclass's methods. A downcast is how you reach a subclass method, such as `bark()`.

**Example:**

```java
Animal a = new Dog();
Dog d = (Dog) a;                        // fine
d.bark();                               // woof
Animal c = new Cat();
System.out.println(c instanceof Dog);   // false
Dog bad = (Dog) c;                      // throws
```

The run printed `woof` and `false`; the last cast threw `ClassCastException: class Cat cannot be cast to class Dog`.

**Failure:** Probe: after `(Dog) a`, did the object change? No; the cast only changes how the compiler sees the variable. An `instanceof` check before the cast avoids the exception.

## Topic: Overload resolution surprises

**Definition:** The compiler picks an overload using the types it can see at compile time, choosing the most specific parameter type that fits. It tries three steps in order: first without boxing (turning `int` into an `Integer` object), then with boxing, then with variable-length arguments. A widening (using a smaller number type where a bigger one is wanted, `int` to `long`) counts as the first step. If two choices fit equally well, it reports an error as ambiguous.

**Why:** This is where many "what does this print?" questions on overloading come from.

**Example:**

```java
static void show(Object o) { System.out.println("Object"); }
static void show(String s) { System.out.println("String"); }
static void num(long x)    { System.out.println("long"); }
static void num(Integer x) { System.out.println("Integer"); }
static void greet(Animal a) { System.out.println("greet Animal"); }
static void greet(Dog d)    { System.out.println("greet Dog"); }
```

With `Animal a = new Dog();`, the calls and their results:

- `show(null)` printed `String`
- `show((Object) "hi")` printed `Object` (a cast tells the compiler to treat the value as that type)
- `num(5)` printed `long`
- `num(Integer.valueOf(5))` printed `Integer`
- `greet(a)` printed `greet Animal`
- `greet(new Dog())` printed `greet Dog`

With `show(String)` and `show(Integer)` side by side, `show(null)` fails with `reference to show is ambiguous`, since `null` fits both.

**Failure:** Probe: `greet(a)` where `a` holds a `Dog`: which method runs? `greet(Animal)`, because overloads are chosen from the variable's type. Overriding looks at the object; overloading does not.

## Questions

### What is the difference between overloading and overriding?

Overloading: same name, different parameters, and the compiler picks one while compiling. Overriding: a subclass replaces an inherited instance method with the same signature (name plus parameter types), and the real object type decides at run time.

### Can you overload a method by changing only its return type?

No. The compiler picks an overload from the number and types of the arguments. Two methods differing only in return type give a compile error.

### What are the main rules for overriding a method?

Same name and parameters; access not weaker; no new checked exceptions. Also, the return type is the same, or a subclass for class types.

### Why does `greet(a)` run the `Animal` version even when `a` holds a `Dog`?

Overloads are chosen by the compiler from the type of the variable. Only overridden instance methods look at the real object at run time.

## Mistakes

- Saying overloading is runtime polymorphism. Overloads are picked by the compiler from the argument types.
- Believing a downcast always works because the compiler accepted it. It can still throw ClassCastException.

## Quiz

### Which of these can you use to overload a method?

- [ ] A different return type only
- [ ] A different access modifier only
- [x] A different parameter list
- [ ] A different parameter name only

Explanation: Overloads must differ in their parameter list. Return type, access and parameter names do not count.

### `Animal a = new Dog();` and both classes have an instance method `sound()`. Which version does `a.sound()` run?

- [ ] Animal's, because of the variable type
- [x] Dog's, because of the object type
- [ ] Whichever is declared first
- [ ] Neither; it is a compile error

Explanation: Instance methods are chosen at run time from the real class of the object.

### Both classes have a field `type`. What does `a.type` give for `Animal a = new Dog();`?

- [ ] Dog's value, because the object is really a Dog
- [ ] A compile error, as the field name is ambiguous
- [x] Animal's value, because the variable is an Animal
- [ ] Both values joined together as one string

Explanation: Fields are hidden, not overridden, so the variable's type decides.

### Which change in an overriding method is NOT allowed?

- [ ] Returning a subclass of a class-type return type
- [x] Making a public method package-private
- [ ] Adding `@Override`
- [ ] Making a protected method public

Explanation: Access can be widened but not narrowed.

### When does a ClassCastException happen?

- [ ] When you assign a superclass object to a subclass variable without a cast
- [ ] When you assign a subclass object to a superclass variable
- [x] When a downcast meets an object that is not of that type
- [ ] When two overloads match equally well

Explanation: An upcast is always safe. A downcast is checked at run time. An ambiguous overload is a compile error.
