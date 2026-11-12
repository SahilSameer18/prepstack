---
id: oops-java-keywords
title: Java Keywords and Object Behaviour
lastChecked: 2026-11-12
next: oops-solid-principles
roadmapSteps: java-spring:java-language-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (accuracy and plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and oops-drafts.md. Java examples compiled and run with Java 27; files in docs/content/checks/oops/. Claims: docs/content/SOURCES.md. -->

## Overview

This section covers the Java words and rules that decide how an object behaves: `static` (belongs to the class, not to one object), `final` (cannot be changed after it is set), how the values you hand to a method are passed, `equals()` and `hashCode()` (how two objects are compared, and how a number helps collections find them), immutability (an object that never changes after creation), records (short classes that only carry values) and enums (a fixed set of named choices). The details here are the rules of Java; other languages differ.

After this section you can explain each of these, predict the output of short code, and fix a broken `equals`.

## Topic: static

**Definition:** A `static` member (a field or a method) belongs to the class itself, so there is one copy however many objects exist. A non-static member (an instance member) belongs to each object and needs an object to use it.

**Why:** Shared data such as a counter, and helper methods that need no object, should not be copied into every object. A `static { ... }` block (a static initializer) runs once, when the class is first used. A static method cannot be overridden (replaced in a subclass so the object's real class decides which runs). A subclass method with the same signature (the name plus the parameter types) only hides it, so the variable's declared type decides which one runs.

**Example:**

```java
class Counter {
    static int created = 0;
    int id;
    static { System.out.println("Counter loaded"); }
    Counter() { created++; id = created; }
    static String who() { return "Counter"; }
}
class Sub extends Counter {
    static String who() { return "Sub"; }
}
// in the starting method:
System.out.println("start");
new Counter(); Counter c = new Counter();
System.out.println(Counter.created + " " + c.id);
Counter s = new Sub();
System.out.println(s.who() + " " + Sub.who());
```

Output: `start`, then `Counter loaded`, then `2 2`, then `Counter Sub`. The block ran after "start", at the first use, and only once. `s.who()` printed `Counter`: the variable's type chose the method, not the object.

**Failure:** Using `this` or an instance field inside a static method. It does not compile, because a static method runs with no object.

## Topic: final

**Definition:** `final` on a variable means it can be given a value only once; on a method, a subclass cannot override or hide it; on a class, nobody can extend it (make a subclass of it). A final reference (a variable that points to an object) cannot be pointed at a different object, but the object it points to can still change.

**Why:** It protects values and designs you do not want changed: a constant, a method whose behaviour must stay fixed, a class that must not be subclassed.

**Example:** This code does not compile:

```java
final int x = 1;
x = 2;
```

The compiler refuses with `error: cannot assign a value to final variable x`, shows the line `x = 2;` with a caret under it, and ends with `1 error`. But this runs fine and prints `[Asha]`:

```java
final List<String> names = new ArrayList<>();
names.add("Asha");
```

The variable `names` always points to the same list, yet the list grew.

**Failure:** Saying `final` means the object cannot change (is immutable). It only fixes the variable. Also, a `static final` field is one shared constant, while a plain `final` field is set once per object.

## Topic: Pass by value

**Definition:** When you call a method, Java copies each argument's value (what you hand to the method) into the method's parameter (the variable in the method's header). For a number the copy is the number; for an object the copy is the reference (the link to the object), so caller and method hold two links to one object.

**Why:** It tells you what a method can and cannot do to your variables.

**Example:**

```java
static class Box { int n; Box(int n) { this.n = n; } }
static void reassign(Box b) { b = new Box(99); }
static void mutate(Box b)   { b.n = 99; }
// in the starting method:
Box box = new Box(1);
reassign(box); System.out.println(box.n);
mutate(box);   System.out.println(box.n);
```

Output: `1` then `99`. Reassigning the parameter moved only the method's own link. Changing a field went through the shared link, so the caller saw it.

**Failure:** Saying "Java passes objects by reference". If it did, `reassign` would have changed `box`. The test: can the method make the caller's variable point somewhere else? In Java it never can.

## Topic: equals() and hashCode()

**Definition:** `equals` says whether two objects count as the same; by default it is true only when both variables point to the very same object. `hashCode` returns a number that `HashSet` and `HashMap` (collections that store items by a number worked out from each item) use to decide where to look.

**Why:** A good `equals` is reflexive (an object equals itself), symmetric (if a equals b then b equals a), transitive (a equals b and b equals c means a equals c), consistent (the same answer each time while nothing changes), and false for `null`. Equal objects must give equal hash codes; unequal objects may give the same or different ones. A `HashSet` first jumps to a spot using the hash code, and only then calls `equals`. If two equal objects give different hash codes, the set will usually look in the wrong spot, and Java gives no guarantee.

**Example:** Class `P` overrides only `equals`. Class `Q` extends `P` and adds `hashCode`.

```java
class P {
    int x;
    P(int x) { this.x = x; }
    public boolean equals(Object o) { return o instanceof P p && p.x == x; }
}
class Q extends P {
    Q(int x) { super(x); }
    public int hashCode() { return x; }
}
// in the starting method:
System.out.println(new P(1).equals(new P(1)));   // true
Set<P> s = new HashSet<>(); s.add(new P(1));
System.out.println(s.contains(new P(1)));        // false
Set<Q> t = new HashSet<>(); t.add(new Q(1));
System.out.println(t.contains(new Q(1)));        // true
String s1 = new String("hi"), s2 = new String("hi");
System.out.println((s1 == s2) + " " + s1.equals(s2));  // false true
```

In this run the set of `P` objects did not find an object that `equals` called equal, because the default hash codes of two separate objects almost always differ. Java does not promise the answer: once the `hashCode` rule is broken, the result of `contains` is not defined. The last line shows `==` compares links, while `String.equals` compares the characters.

**Failure:** Overriding `equals` without `hashCode`: it looks fine until the object goes into a hash collection. Use the same fields in both. Also, `equals(Object)` must accept any object; without a type check (`instanceof`, which asks whether an object is of a type) it can throw an error instead of answering false.

## Topic: Immutability

**Definition:** An immutable object cannot change after it is built. One common recipe (from Oracle's Java tutorial): make the class `final`, make every field `private final`, give no setter methods (methods that change a field), and copy any changeable object you receive or hand out (a defensive copy).

**Why:** An immutable object can be shared freely, and it is safe to use as a `HashMap` key because its `hashCode` never changes. `String` objects are immutable.

**Example:**

```java
final class Money {
    private final int cents;
    private final List<String> notes;
    Money(int cents, List<String> notes) {
        this.cents = cents;
        this.notes = List.copyOf(notes);   // a copy, not the caller's list
    }
    int cents() { return cents; }
    List<String> notes() { return notes; }
}
// in the starting method:
List<String> src = new ArrayList<>(List.of("a"));
Money m = new Money(500, src);
src.add("b");
System.out.println(m.notes());
```

It prints `[a]`: the copy kept the object safe.

**Failure:** Storing the caller's list directly (`this.notes = notes`). The field is final, yet the caller can still change the list through its own variable. Also, `List.copyOf` copies the list, not the items in it; if the items can change, copy them too.

## Topic: Records and enums

**Definition:** A record is a short way to write a class that only carries values. An enum is a class with a fixed set of named instances, called constants.

**Why:** From the header `record Point(int x, int y)` the compiler makes `private final` fields, one accessor (a method that returns a field) for each of `x` and `y`, and `equals`, `hashCode` and `toString`, so the routine code is not repeated by hand. A record is final. A compact constructor is written without parentheses; it still receives the header values and can run checks before the fields are set. An enum stops invalid values: only the listed constants exist. It can have fields, a constructor and methods.

**Example:**

```java
record Point(int x, int y) {
    Point { if (x < 0) throw new IllegalArgumentException("x < 0"); }
}
enum Level { LOW(1), HIGH(10);
    private final int weight;
    Level(int w) { weight = w; }
    int weight() { return weight; } }
// in the starting method:
Point p = new Point(1, 2);
System.out.println(p + " " + p.x() + " " + p.equals(new Point(1, 2)));
Level l = Level.HIGH;
switch (l) {   // picks one path by the value of l
    case LOW  -> System.out.println("low");
    case HIGH -> System.out.println("high " + l.weight());
}
System.out.println(Arrays.toString(Level.values()));
```

Output: `Point[x=1, y=2] 1 true`, then `high 10`, then `[LOW, HIGH]` (`Level.values()` lists every constant). In the same run the two hash codes of equal points were also equal.

**Failure:** Expecting a record to be fully frozen. It has no setters, but a list inside it can still change, so the Immutability limits apply.

## Questions

### Does Java pass objects by reference?

No. Java copies the argument's value into the parameter. For an object, that value is the reference, so the method can change the object but cannot make the caller's variable point to another one.

### What is the difference between == and equals()?

`==` on objects asks whether both variables point to the same object. `equals` asks whether they count as equal, and the default `equals` does the same as `==` until a class overrides it. Two `new String("hi")` are not `==` but are `equals`.

### Why override hashCode when you override equals?

Equal objects must have equal hash codes. A `HashSet` or `HashMap` uses the hash code to find the spot, so with only `equals` overridden it can fail to find an object that is equal.

## Mistakes

- Overriding `equals` without `hashCode`, so hash collections can miss equal objects.
- Using `==` to compare the contents of two objects. It compares links.

## Quiz

### A method does `b = new Box(99);` on its parameter. What happens to the caller's variable?

- [ ] It points to the new Box
- [x] It is unchanged
- [ ] It becomes null
- [ ] The code does not compile

Explanation: The parameter holds a copy of the reference, so reassigning it moves only the method's own link.

### Which statement about a `final` reference variable is true?

- [ ] The object it points to cannot change
- [ ] It cannot be read after it is set
- [x] It cannot point to another object
- [ ] Its class cannot be extended

Explanation: `final` fixes the variable. The object may still change.

### A class overrides `equals` but not `hashCode`. What can go wrong?

- [x] A HashSet may miss an equal object
- [ ] The class stops compiling until `hashCode` is added
- [ ] `equals` returns false for equal objects
- [ ] `==` starts to compare fields

Explanation: Equal objects must give equal hash codes, otherwise a hash collection may look in the wrong place.

### A subclass declares a static method with the same signature as one in its superclass. What is this called?

- [ ] Overriding
- [ ] Overloading
- [ ] Shadowing
- [x] Hiding

Explanation: A static method is hidden, not overridden, so the declared type of the variable decides which runs.

### Which is NOT part of making a class immutable?

- [ ] Private final fields
- [x] A setter for each field
- [ ] Defensive copies of changeable inputs
- [ ] A final class

Explanation: A setter changes the object after creation, which an immutable class must not allow.
