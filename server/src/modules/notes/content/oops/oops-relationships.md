---
id: oops-relationships
title: Relationships Between Classes
lastChecked: 2026-11-12
next: oops-java-keywords
roadmapSteps: java-spring:java-language-basics
---

<!-- Published 13 Nov 2026 WITHOUT an outside reader (none has agreed yet; see docs/content/SOURCES.md). lastChecked is the date the author checked this section against its sources, and AI reviewers read it (accuracy and plain words); no second person did. Written from docs/content/source-notes/os-oops-phase1.md and oops-drafts.md. Java examples compiled and run with Java 27; files in docs/content/checks/oops/. Claims: docs/content/SOURCES.md. -->

## Overview

Classes (blueprints for objects) work together, and the kind of link says who owns whom. "Has-a" means one object holds another: association (a lasting link), aggregation (a group whose members can live without it) and composition (a whole that owns its parts). "Is-a" is inheritance: a class building on another class. Interviewers ask the differences and also ask why "composition over inheritance" is common advice.

After this section you can name each link, show it in Java, and explain a case where inheritance breaks and an object kept inside another fixes it.

## Topic: Has-a and is-a

**Definition:** "Has-a" means one object holds a reference (an address) to another and uses it. "Is-a" means a class extends another (inheritance: a child class takes the members, meaning the fields and methods, of its parent), so a child object can be used wherever the parent is expected.

**Why:** Choosing the wrong link makes code hard to change or confusing: a child inherits everything from its parent, while a held object shows only what you choose to pass on.

**Example:** A `Car` is a `Vehicle`, and a `Car` has an `Engine`.

```java
class Vehicle { String move() { return "moves"; } }
class Car extends Vehicle { }          // is-a
// class Car { Engine engine; }        // has-a: a field that holds another object
// Vehicle v = new Car();
// "a " + v.getClass().getSimpleName() + " " + v.move()
```

Run, this gave `a Car moves`: the `Car` works where a `Vehicle` is expected.

**Failure:** Using "is-a" when the truth is "has-a", such as writing `class Car extends Engine`. A car is not an engine; it has one.

## Topic: Association

**Definition:** An association is a link where one class keeps a reference to another for a longer time, such as a `Doctor` who keeps a current `Patient` (it may be one-way). In UML (a standard set of drawing rules for software designs) it is a solid line.

**Why:** Naming how strong a link is tells you how much one class breaks when the other changes. Aggregation and composition are special kinds of association.

**Example:** The field is the association.

```java
class Doctor {
    Patient current;                              // association: kept as a field
    void see(Patient p) { current = p; }
}
```

After `see(new Patient("Meena"))` the doctor still kept `Meena`.

**Failure:** Calling every link "association". A class that only borrows another for one call is a dependency (next topic).

## Topic: Dependency

**Definition:** A dependency is a weak link: one class uses another only briefly, for example as a method parameter (a value passed into a method) or a local variable. In UML it is a dashed line with an open arrow.

**Why:** A dependency is the lightest link, so changing the used class breaks the least code.

**Example:** The `treat` method uses a `Patient` and forgets it.

```java
void treat(Patient p) { System.out.println("treating " + p.name); }
```

After `treat(new Patient("Ravi"))` the doctor still kept `Meena`: the parameter was not stored.

**Failure:** Mixing up dependency (a short use, such as a parameter) with association (a lasting field).

## Topic: Aggregation

**Definition:** Aggregation is a has-a link where the parts can exist without the whole. A `Team` holds `Player` objects that were made elsewhere and passed in. It is drawn with an empty diamond on the whole.

**Why:** It says "this is a group, but the members are not owned by it", so dropping the group does not drop the members. UML itself gives aggregation no extra rules beyond association, so in Java code the two look the same.

**Example:**

```java
class Player { String name; Player(String n) { name = n; } }
class Team {
    List<Player> players = new ArrayList<>();   // a list that holds Player objects
    void add(Player p) { players.add(p); }
}
// Player asha = new Player("Asha");
// Team t = new Team(); t.add(asha); t = null;   // throw the team away
// asha.name  -> still "Asha"
```

Run, this gave `player still here: Asha`.

**Failure:** Treating the diamond as something Java checks. No Java keyword enforces aggregation, and books differ a little on what it means, so state your definition when you answer.

## Topic: Composition

**Definition:** Composition is a stronger has-a link: the whole controls its parts' lifetime, usually by creating them. A part belongs to one whole, and when the whole is gone, its parts go with it. It is drawn with a filled diamond on the whole.

**Why:** It keeps the parts private and under one owner, so no outside code can keep a part or change it without the owner knowing.

**Example:**

```java
class Room { String label; Room(String l) { label = l; } }
class House {
    private List<Room> rooms = new ArrayList<>();
    House() { rooms.add(new Room("kitchen")); rooms.add(new Room("hall")); }   // the constructor runs when the house is built
    int roomCount() { return rooms.size(); }
}
```

The `House` makes its rooms and never hands them out. `new House().roomCount()` gave `rooms inside a house: 2`.

**Failure:** Thinking a keyword makes it composition. It is a design choice: rooms created inside and kept private. Java frees an object only when nothing points to it, so the parts go with the whole only if no outside code still holds one.

## Topic: One-to-many (multiplicity)

**Definition:** Multiplicity says how many objects sit on each end of a link: `1` exactly one, `0..1` zero or one, `0..*` zero or more, `1..*` one or more. One-to-many in Java is usually a `List` field.

**Why:** The number changes the code: one partner is a plain field, many partners need a list and a loop.

**Example:** One `Team` has `0..*` players: `List<Player> players`. One `House` has `1..*` rooms in the example above.

**Failure:** Writing a list when the rule is exactly one, or the other way round. Another mistake is forgetting that an empty list is allowed when the number starts at zero.

## Topic: Composition over inheritance

**Definition:** The advice is to build behaviour by holding objects that do the work, rather than extending a class just to reuse its code. Inheritance is fixed when the code is written, and a child class cannot choose: it gets every inherited method of its parent (the public and protected ones), including ones that do not suit it.

**Why:** A child that inherits too much can break code written for the parent.

**Example:** `Square extends Rectangle`, and a `Square` keeps all its sides equal. Code written for any `Rectangle` sets the width to 5, then the height to 2, and expects area 10.

```java
class Rectangle {
    protected int w, h;
    Rectangle(int w, int h) { this.w = w; this.h = h; }
    void setWidth(int w) { this.w = w; }
    void setHeight(int h) { this.h = h; }
    int area() { return w * h; }
}
class Square extends Rectangle {
    Square(int s) { super(s, s); }
    @Override void setWidth(int w) { this.w = w; this.h = w; }
    @Override void setHeight(int h) { this.w = h; this.h = h; }
}
static int test(Rectangle r) { r.setWidth(5); r.setHeight(2); return r.area(); }
```

For a `Rectangle` the test gave `10`. For a `Square` the height step also set the width to 2, so it gave `4`. The fix is to hold one side and offer only `area()`: `new SquareShape(4).area()` gave `16`.

**Failure:** Saying inheritance is bad. It fits a true is-a where the child can do everything the parent can. The question to ask is whether the child can always be used in place of the parent.

## Topic: Reading UML arrows in words

**Definition:** In a class diagram (a drawing of classes and their links), a solid line is an association, an empty diamond marks the whole in aggregation, a filled diamond marks the whole in composition, a dashed arrow is a dependency, and a hollow triangle arrow points from a child to its parent in inheritance. A dashed line with a hollow triangle means a class implements an interface.

**Why:** Each mark has one meaning, so a small drawing can be read aloud as a sentence.

**Example:** A line from `Team` to `Player` with an empty diamond at `Team` and `0..*` at `Player` reads: a team has zero or more players, and the players can live without it.

**Failure:** Putting the diamond on the part instead of the whole.

## Questions

### What are the relationships between classes?

Association (one class keeps a reference to another), aggregation (a has-a where parts can live alone), composition (a has-a where the whole controls its parts), dependency (a short-lived use) and inheritance (is-a).

### What is the difference between aggregation and composition?

Both are has-a. In aggregation the parts can exist without the whole. In composition the whole controls the parts' lifetime and they end with it. Java enforces neither; it is a design choice, and books differ a little on aggregation.

### Why prefer composition over inheritance?

Inheritance gives the child its parent's inherited methods, so code written for the parent may break, as with `Square` and `Rectangle`. Holding an object lets me show only what I want. Inheritance still fits a true is-a.

### How do you show one-to-many?

With a collection field, such as a `List` of the many objects, and a multiplicity like `0..*` on the diagram.

## Mistakes

- Saying a Java keyword makes aggregation or composition. None does; it is how you write the classes.
- Using inheritance for code reuse when the child is not truly a parent, such as `Square extends Rectangle` when the two setters must stay independent.
- Mixing up dependency (a short use, such as a parameter) with association (a lasting link).

## Quiz

### A `Team` receives `Player` objects made elsewhere. When the team is dropped, the players are still used. Which link is this?

- [ ] Composition
- [ ] Inheritance
- [x] Aggregation
- [ ] Dependency

Explanation: Parts that live on without the whole are shown as aggregation.

### A `House` creates its own `Room` objects and never hands them out. Which link fits best?

- [ ] Inheritance
- [x] Composition
- [ ] Aggregation
- [ ] Dependency

Explanation: The whole controls the parts' lifetime, usually by creating them, so composition fits.

### A `Rectangle` class has `setWidth`, `setHeight` and `area`. `Square extends Rectangle` and its two setters each change both sides. A test sets width 5, then height 2, and expects area 10. Why does it get 4 for a `Square`?

- [ ] The area method contains a bug
- [ ] Java cannot multiply two ints here
- [ ] The test used a wrong size value
- [x] Its setters change both sides

Explanation: The child changed what a setter means, so code written for `Rectangle` broke.

### What does a dashed arrow in a class diagram mean?

- [ ] Inheritance
- [ ] Composition
- [x] Dependency
- [ ] Aggregation

Explanation: A dashed line with an open arrow shows a short use of one class by another.

### How is one-to-many usually written in Java?

- [x] A `List` field
- [ ] A single `int` field
- [ ] A `main` method
- [ ] A `Doctor` class

Explanation: A list holds many references, which gives a multiplicity of `0..*`.

## Diagram

```json
{ "kind": "graph", "caption": "Team has many Player objects (aggregation, labelled has). House owns its Room objects (composition, labelled owns). Car extends Vehicle (inheritance). Diamonds are not drawn here.", "nodes": [{ "id": "team", "label": "Team", "x": 12, "y": 20 }, { "id": "player", "label": "Player", "x": 50, "y": 20 }, { "id": "house", "label": "House", "x": 12, "y": 55 }, { "id": "room", "label": "Room", "x": 50, "y": 55 }, { "id": "car", "label": "Car", "x": 12, "y": 90 }, { "id": "vehicle", "label": "Vehicle", "x": 50, "y": 90 }], "edges": [{ "from": "team", "to": "player", "label": "has 0..*" }, { "from": "house", "to": "room", "label": "owns 1..*" }, { "from": "car", "to": "vehicle", "label": "is a" }] }
```
