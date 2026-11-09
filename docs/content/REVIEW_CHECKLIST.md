# Review checklist for notes

Used before any notes section is published, and again when it is updated. Wrong notes are worse than no notes, so nothing is published without every box ticked.

## The accuracy process (6 steps, every section)

1. **Write from the sources.** Draft the section using the books and docs for its subject in `SOURCES.md`.
2. **List the claims.** Write down every fact someone could dispute: numbers, defaults, version-specific behaviour, "always" and "never" statements. Put them in the claim table in `SOURCES.md` with the source and page or section.
3. **Check each claim** against that source. If two sources disagree, say so in the notes or leave the claim out.
4. **Run what can be run.** Every code sample, SQL query and command is executed once and the output compared with what the notes say.
5. **Outside reader.** A person who knows the subject (a senior student, a working engineer, a teacher) reads the section and writes down every mistake or unclear sentence. Fix them. Record who read it below.
6. **Publish with a date.** Set `lastChecked` to today. Add the "report a mistake" link. Add the review record row below.

## Checklist (tick every line)

**Shape**
- [ ] Follows `NOTES_TEMPLATE.md`: id, title, overview 60 to 120 words, 4 to 8 topics, 3 to 5 questions, 2 to 3 mistakes, 5 quiz questions, links, `lastChecked`.
- [ ] The id is unique and will not change.
- [ ] Every topic has a definition, why it matters, a concrete example and how it is probed.

**Accuracy**
- [ ] Every disputable claim is in the claim table with a source.
- [ ] No claim depends on one product's behaviour unless the product is named (for example "in PostgreSQL" or "in MySQL InnoDB").
- [ ] Code samples and queries were run and the output matches.
- [ ] Quiz answers re-checked by someone other than the author, and each explanation is correct.
- [ ] An outside reader read it (record below).

**Writing**
- [ ] Plain words; no unexplained jargon.
- [ ] No text copied from a book or site.
- [ ] Every diagram has a text caption.

**Links**
- [ ] Sheet topic, roadmap step ids and next section all exist (the link-check script from stage 2 passes).
- [ ] If the section changes what the analyzer can advise on, `skillCatalog.json` (client and server copies) is updated and the sync test passes.

## Review record

One row per section per review. Keep old rows.

| Date | Section id | Author | Outside reader (name / role) | Mistakes found | All fixed |
|---|---|---|---|---|---|
| | | | | | |
