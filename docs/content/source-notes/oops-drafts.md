# Source notes: OOP drafts (Phase 3, 12 Nov 2026)

The ten Java OOP drafts are in `server/src/data/notes/oops/drafts/` (not loaded by the site). Language: Java 27 (`javac 27`). Every Java example was compiled and run; the source and the real output (`output.txt`, with real compiler messages) are in `docs/content/checks/oops/<section-id>/`. Written by five AI writers, then checked by three accuracy reviewers (who re-fetched the primary sources and re-ran every example) and two plain-words reviewers, then corrected by ten editors. Each editor ran the full-template checker on its own file with no template errors. **The final run of the checker over all ten, the claims table and the link-fit check are Phase 4**, as the owner asked.

## Sections (checker word counts after editing)
| Section id | Words | Main sources |
|---|---|---|
| `oops-basics` | 1,653 | dev.java classes-objects, more-on-classes, packages; Oracle concept page "What Is an Object"; JLS 6.6, 8.1, 8.3, 12.4, 15.9, 4.12.5 |
| `oops-pillars` | 1,708 | dev.java inheritance; JLS 8.1.4, 8.2, 8.4.8, 8.8.7, 9.6.4.4; Java Tutorial on multiple inheritance |
| `oops-polymorphism` | 1,669 | dev.java overriding and polymorphism; JLS 8.4.5, 8.4.8, 8.4.9, 15.12.2, 15.12.4.4, 5.5 |
| `oops-abstraction` | 1,804 | dev.java abstract classes, interfaces; JLS 8.1.1.1, 9.3, 9.4, 9.4.1.3, 9.8 |
| `oops-constructors` | 1,800 | JLS SE 27 8.8.7, 8.8.9, 12.4, 12.5; dev.java more-on-classes and Object page; Object API (`finalize`) |
| `oops-relationships` | 1,643 | Wikipedia Class diagram and Object composition (named nowhere in the text); dev.java |
| `oops-java-keywords` | 1,809 | JLS 8.1.1.2, 8.4.1, 8.4.3.3, 8.4.8, 8.7, 8.9, 8.10, 15.12.4.5; Object and String API pages |
| `oops-solid-principles` | 1,639 | Wikipedia SOLID and the five principle articles (Martin 2000 paper, Feathers named SOLID around 2004) |
| `oops-design-patterns` | 1,839 | Refactoring.Guru pages for the 8 patterns (restated, nothing copied); Wikipedia pattern articles; runs |
| `oops-interview-questions` | 1,406 | the sections above; C++ Core Guidelines C.35 and cppreference for the C++ lines |

## What the runs settled
- The owner's own Singleton note said a private constructor prevents reflection: the run created a second object through reflection (`true`); a single-constant enum threw `IllegalArgumentException` (Java does not allow enum objects to be created by reflection, JLS 8.9). The lazy Singleton created 4 objects from 4 threads in most runs and 3 in some, so the quiz does not depend on the count.
- `(Dog) "text"` is a compile error (`incompatible types: String cannot be converted to Dog`), confirmed 12 Nov.
- Java 25 and later allows statements before `super(...)`/`this(...)`: a constructor with a prologue compiles on 27 and fails with `--release 24` ("flexible constructors is not supported in -source 24"). The notes state the rule for Java 27 and mention the Java 25 change.
- A private interface method compiles with `--release 9` and fails with `--release 8`. No claim is made about when default and static interface methods arrived (no source read).
- The `HashSet` result when only `equals` is overridden was `false` in every run, but Java does not promise it; the draft says "in this run".
- Overloading by return type: `method size() is already defined`; a `final` variable assigned twice: `cannot assign a value to final variable x`; many more compiler messages are in the `output.txt` files.

## Corrections the reviewers made (applied)
Wrong or incomplete in the first drafts and now fixed: `super(...)` "must come first" (Java 25+), pure virtual functions "have no body" (C++), "an unassigned field is null" (only references), `null` "assigned by yourself", covariant return types (only class types), `protected` and `private` access conditions, `static` fields exist before any object, a `new` expression can still fail, dispatch does not apply to `private` or `super.` calls, a cast between unrelated classes is a compile error, only a supertype method can be overridden (an interface counts), "default-method clash" needs the two interfaces to be unrelated, `finalize` deprecated since 9 and marked for removal since 18, the "how the five SOLID principles fit together" topic was the writers' own synthesis and was cut, Singleton "main criticism" attribution, `List.sort` with a `Comparator` as Strategy (labelled as the usual textbook example), the interview-page and owner-PDF mistakes relabelled ("wrong answers that circulate").

## Open for Phase 4
- Run the full-template checker over all ten (the editors ran it per file) and the link check; the strict checker is `scratchpad\check-drafts.js oops`.
- Definitions longer than two sentences remain in `oops-pillars` (the `super` topic, the inheritance types), `oops-constructors` (topic 1) and a few others: move the extra sentences into Why.
- Word counts: `oops-abstraction` 1,804, `oops-java-keywords` 1,809, `oops-design-patterns` 1,839, `oops-constructors` 1,800; the Overview of `oops-design-patterns` was trimmed without a recount.
- Claims still resting on fetch-tool summaries (not word for word): the Wikipedia and Refactoring.Guru statements in `oops-solid-principles`, `oops-design-patterns` and `oops-relationships`; "marked for removal since 18" comes from the accuracy report's dev.java citation and JEP 421, not from the Object API page, which shows only `forRemoval=true`.
- `oops-java-keywords` has 3 Questions and `oops-design-patterns` 3: allowed; both have 2 Mistakes.
- Link fit: the roadmap links (`java-spring:java-language-basics`, `spring-core-boot`) were chosen to satisfy the one-link rule.
- Old ids to remap at publish: `oops-constructors-destructors`, `oops-virtual-functions`, `oops-advanced-concepts`, `oops-interview-boost` (skill catalog and any roadmap `practice` targets); `oops-basics` and `oops-pillars` remain valid.
- Not covered on purpose: friend functions, namespaces, virtual inheritance, operator overloading (C++ only), the `Integer` cache, sealed classes, the JVM, collections and Java concurrency (later modules).
