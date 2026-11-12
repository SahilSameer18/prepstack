---
id: oops-solid-principles
title: SOLID Principles
next: oops-design-patterns
roadmapSteps: java-spring:java-language-basics, java-spring:spring-core-boot
---

<!-- Draft 12 Nov 2026, not published. Examples compiled and run with Java 27; files in docs/content/checks/oops/oops-solid-principles/. -->

## Overview

SOLID is a set of five design principles (rules of thumb for how to arrange classes) for object-oriented code: single responsibility, open-closed, Liskov substitution, interface segregation and dependency inversion. Interviewers ask for them to see whether you can build code that is easy to change. According to Wikipedia, Robert C. Martin introduced the basic principles in a 2000 paper and Michael Feathers coined the name SOLID around 2004. Some ideas are older.

After this section you can state each principle in one sentence, show a bad and a fixed Java example for it, and explain what the Square and Rectangle example breaks.

## Topic: Single responsibility

**Definition:** A class should have one reason to change. A "reason" is a person or team (an actor) who might ask you to edit the class.

**Why:** If one class does two jobs, a change for one job can break the other, and the two jobs cannot be reused apart.

**Example:** The bad class works out a total and also decides how to print it. The fixed version keeps the total in `Invoice` and gives each print format its own class.

```java
class BadInvoice {
    double price = 100; int qty = 3;
    double total() { return price * qty; }
    String printText() { return "Invoice total: " + total(); }  // two reasons to change
}
class Invoice {
    final double price; final int qty;
    Invoice(double price, int qty) { this.price = price; this.qty = qty; }
    double total() { return price * qty; }
}
class TextPrinter { String print(Invoice i) { return "Invoice total: " + i.total(); } }
class CsvPrinter  { String print(Invoice i) { return "total," + i.total(); } }
```

Real output: `S bad : Invoice total: 300.0` and `S good: Invoice total: 300.0 | total,300.0`. A new CSV format needed no edit to `Invoice`.

**Failure:** Reading "one reason" as "one method per class". The rule counts reasons for change (actors), not methods. Splitting every method into its own class makes code harder to follow without helping.

## Topic: Open-closed

**Definition:** Code should be open for extension (you can add new behaviour) and closed for modification (you do not edit code that already works). Bertrand Meyer named it in 1988; later it came to mean: depend on an interface (a list of methods a class promises to offer), then add new classes that implement it.

**Why:** Each edit to tested code risks breaking it.

**Example:** The bad method picks a formula with `if` tests on a name, so a new shape needs an edit, and an unknown name silently gives -1. In the fixed version each shape is a class with its own `area()`. Here `implements` means the class provides what the interface lists, and a `record` is a short class that only carries values.

```java
static double badArea(String kind, double a, double b) {
    if (kind.equals("rect")) return a * b;
    if (kind.equals("circle")) return 3.14 * a * a;
    return -1;
}
interface Shape { double area(); }
record Triangle(double b, double h) implements Shape { public double area() { return 0.5 * b * h; } }
// Rect and Circle are records like Triangle
// totalArea(List<Shape>) loops and calls area(); it never changes
```

Real output: `O bad : triangle -> -1.0` and `O good: 19.14` (a rectangle 2 by 3, a circle of radius 1 and a triangle 4 by 5: 6 + 3.14 + 10).

**Failure:** Thinking you must predict every future change. You cannot, so close the code against the kinds of change that actually happen. Advice: add the interface once a second variant appears.

## Topic: Liskov substitution

**Definition:** Code that works with a base class must keep working when given any subclass, without knowing which one it got. A subclass must behave like its parent, not just match its method names. Barbara Liskov introduced it in 1987.

**Why:** If a subclass breaks the parent's promises, every piece of code that uses the parent must check which child it has. The promises are what a method demands before it runs and what it guarantees afterwards (called preconditions and postconditions); a subclass may not demand more or promise less.

**Example:** A `Square` extends `Rectangle` and keeps width equal to height. A method sets width 5 and height 4 and expects area 20.

```java
class Rectangle {
    protected int width, height;
    void setWidth(int w)  { width = w; }
    void setHeight(int h) { height = h; }
    int area() { return width * height; }
}
class Square extends Rectangle {
    @Override void setWidth(int w)  { width = w;  height = w; }
    @Override void setHeight(int h) { width = h;  height = h; }
}
static int resizeTo5by4(Rectangle r) { r.setWidth(5); r.setHeight(4); return r.area(); }
```

Real output: `L Rectangle: 20` and `L Square   : 16`. For the square, setting height to 4 also set the width to 4, so 4 times 4 is 16. The code compiles; the behaviour is wrong. A square is a rectangle in maths, but this `Square` does not behave like this `Rectangle`.

**Failure:** Saying "it extends, so it is a subtype". Java checks only that the method shapes fit (names, types, access, exceptions), not that behaviour fits. The fix is a design change, for example both classes implement a read-only `Shape` and neither extends the other.

## Topic: Interface segregation

**Definition:** No class should be forced to depend on methods it does not use. Split a large interface into small ones, so each user sees only what it needs.

**Why:** A fat interface forces a class to write empty or failing methods, and it changes whenever any method changes.

**Example:** A `FatMachine` demands `print` and `scan`, so an old printer must fake `scan` by throwing `UnsupportedOperationException` (an error that says "this is not supported"). After the split, a printer-only class never has to mention scanning.

```java
interface FatMachine { void print(String d); String scan(); }
class OldPrinter implements FatMachine {
    public void print(String d) { System.out.println("printing " + d); }
    public String scan() { throw new UnsupportedOperationException("no scanner"); }
}
interface Printer { void print(String d); }
interface Scanner { String scan(); }
class SimplePrinter implements Printer { public void print(String d) { /* prints */ } }
static String scanIt(Scanner s) { return s.scan(); }
// scanIt(new SimplePrinter());
```

Real output: calling `scan()` on `OldPrinter` gives `java.lang.UnsupportedOperationException: no scanner`, a crash at run time. With the split, the last line stops the build: `incompatible types: SimplePrinter cannot be converted to Scanner`.

**Failure:** Splitting into one-method interfaces by habit. Split by what each user needs, not by method count (our advice).

## Topic: Dependency inversion

**Definition:** The code that holds the main rules (high-level) should not depend on the code that does the detailed work (low-level, such as sending an email); both should depend on an abstraction (an interface). Passing the ready-made helper into a constructor (a special method that sets up a new object) is called constructor injection, one way to apply the principle.

**Why:** If `OrderService` builds its own `EmailSender`, you cannot test it without sending email, and you cannot swap in SMS.

**Example:** No framework is needed. The bad class fixes its helper with `new`; the fixed one receives any `MessageSender`.

```java
class BadOrderService {
    private final EmailSender sender = new EmailSender();   // fixed to one class
    void place(String item) { sender.send("Order placed: " + item); }
}
interface MessageSender { void send(String m); }
class OrderService {
    private final MessageSender sender;
    OrderService(MessageSender sender) { this.sender = sender; }
    void place(String item) { sender.send("Order placed: " + item); }
}
new OrderService(m -> System.out.println("FAKE : " + m)).place("book");  // m -> ... is a short unnamed method
new OrderService(new EmailSender()::send).place("book");                 // passes the send method on
```

Real output: `new BadOrderService().place("book")` always prints `EMAIL: Order placed: book`. The fixed one prints `FAKE : Order placed: book` for the test and `EMAIL: Order placed: book` for the real sender.

**Failure:** Calling any use of `new` a violation. In our view, plain data objects and `String` are fine; the principle is about replaceable collaborators.

## Questions

### What does SOLID stand for?

Single responsibility, open-closed, Liskov substitution, interface segregation, dependency inversion. They are five design guidelines for code that is easy to change.

### Why does a Square class that extends Rectangle break Liskov substitution?

Code that sets width and height separately expects the area to be their product. A square ties the two together, so the same code gets 16 instead of 20.

### What is the difference between dependency inversion and dependency injection?

Dependency inversion is the principle: depend on abstractions. Dependency injection is a way to supply the chosen implementation from outside, for example through a constructor.

### How would you make a method that uses `if` on a type name follow open-closed?

Make one interface, give each type its own class, and let the caller use the interface. A new type is then a new class, with no edit to the old code.

## Mistakes

- Treating SOLID as strict laws. They are design guides: use them to question a design, not to approve or reject it.
- Using inheritance because the real-world words fit (a square "is a" rectangle). Liskov substitution is about behaviour: the subclass must keep the parent's promises.

## Quiz

### According to Wikipedia, who coined the name SOLID, around 2004?

- [x] Michael Feathers
- [ ] Robert Cecil Martin
- [ ] Bertrand Meyer
- [ ] Barbara Liskov

Explanation: Martin introduced the principles in a 2000 paper. Feathers coined the acronym around 2004.

### A method sets width 5 and height 4 and expects an area of 20. It gets 20 for a `Rectangle` and 16 for a `Square` that extends it. Which principle does this break?

- [ ] Single responsibility
- [ ] Interface segregation
- [x] Liskov substitution
- [ ] Open-closed

Explanation: The Square cannot be used where the Rectangle code expects independent width and height.

### A large interface forces a class to write a method it does not need. Which principle says to split the interface?

- [ ] Dependency inversion principle
- [ ] Single responsibility principle
- [ ] Open-closed
- [x] Interface segregation

Explanation: The class was forced to depend on methods it does not use. Smaller interfaces remove the fake methods.

### What makes `OrderService(MessageSender sender)` easier to test than one that calls `new EmailSender()` inside?

- [ ] It runs faster than before
- [x] A fake sender can be passed in
- [ ] It uses fewer lines of code
- [ ] It no longer needs an interface

Explanation: The class depends on an interface and receives the sender from outside, so a test passes a fake.

### Adding a new shape to `totalArea(List<Shape>)` needs which change?

- [ ] Write new `if` tests inside `totalArea`
- [ ] Copy and edit each existing shape class
- [x] Add one new class that implements `Shape`
- [ ] Split the `Shape` interface once per new shape

Explanation: That is open-closed: extend by adding a class and leave the working code alone.
