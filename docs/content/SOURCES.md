# Sources

What the notes are checked against. A claim in the notes that is not in one of these (or a source added here first) does not get published. Editions are the ones to confirm when you own the book; the PostgreSQL and MySQL docs should be read at the version named in the note.

## Reference sources per subject

| Subject | Main reference | Also use |
|---|---|---|
| Operating systems | Silberschatz, Galvin, Gagne: *Operating System Concepts* | Linux man pages for real commands and defaults |
| DBMS | Korth, Silberschatz, Sudarshan: *Database System Concepts* | PostgreSQL documentation, MySQL reference manual (InnoDB chapters) for real behaviour |
| Computer networks | Kurose and Ross: *Computer Networking: A Top-Down Approach* | The RFCs (for example RFC 9293 for TCP, RFC 9110 for HTTP semantics, RFC 1035 for DNS), MDN web docs for HTTP in browsers |
| Java and OOP | Oracle Java documentation and the Java Language Specification | Joshua Bloch: *Effective Java*; Gamma et al.: *Design Patterns* (GoF) |
| Resume guide (A3) | No book yet. Advice about recruiters and ATS is general guidance, so it is written as "many" and "often", never as numbers | Product documentation of applicant tracking systems for the ATS claims; an outside reader (a recruiter or working engineer) for everything else |

## Claim table (one row per disputable claim)

Fill this in while writing each section, before it is reviewed.

| Section id | Claim | Source (book + chapter, doc + section, or RFC number) | Checked by | Date |
|---|---|---|---|---|
| resume | Many recruiters open the GitHub or LinkedIn link | None yet. General guidance. Outside reader to confirm | not yet | |
| resume | One page is the usual advice for students and freshers; a second page is fine with real content | None yet. General guidance. Outside reader to confirm | not yet | |
| resume | A bullet should say what you did, how much it changed, and how (action + what + how much + how) | None yet. Common writing pattern. Outside reader to confirm | not yet | |
| resume | Multiple columns, tables and skill bars can be misread by readers and software | None yet. Stated with "can". Needs an ATS vendor document or reader confirmation | not yet | |
| resume | There is no single ATS; some recruiters read resumes themselves; software usually extracts the text | None yet. Needs an ATS vendor document or reader confirmation | not yet | |
| resume | Hidden keyword text is a trick that is not worth the risk | None yet. Outside reader to confirm | not yet | |
| resume | Send a PDF with selectable text unless the application asks for another format | None yet. General guidance. Outside reader to confirm | not yet | |
| resume | A plain font (Arial, Calibri, Roboto) at 10 to 11 pt | None yet. Common convention. Outside reader to confirm | not yet | |
| resume | Role variants: what to stress for SDE intern, backend, frontend and data resumes | None yet. Opinion. Outside reader to confirm | not yet | |
| resume | The Role Analyzer prefers lines that show a skill being used over a skills list; never suggests adding a missing skill; removes email, phone and links before the AI reads the text; scanned PDFs fail; PDF at most 3 MB and 5 pages; it is not an ATS | server/src/services/analyzer.service.js and resume.service.js (read 9 Nov 2026) | Claude, from the code | 2026-11-09 |
| resume | The weak and strong examples and the sample resume (names, college, company, numbers) | Invented for illustration and labelled as such on the page | not applicable | |

## Outside readers (people who know the subject)

Needed to review notes before they are published. Start asking in stage 0; people take weeks to answer. A reader is one person who has agreed to read specific sections and report mistakes. Fill this table yourself.

| Subject | Name | Role / why they know it | Asked on | Agreed? | Sections they will read |
|---|---|---|---|---|---|
| OS | | | | | |
| DBMS | | | | | |
| Networks | | | | | |
| Java / OOP | | | | | |

## Students and job switchers for the stage 5 gate

Before the planner (B5) is built, the checklist and notes are shown to 3 to 5 students and 2 to 3 job switchers. If they say no, the project stops at the checklist (B4). Fill this table yourself.

| Who | Student or job switcher | Contact | Asked on | Agreed? | Seen the checklist on | What they said |
|---|---|---|---|---|---|---|
| | | | | | | |
