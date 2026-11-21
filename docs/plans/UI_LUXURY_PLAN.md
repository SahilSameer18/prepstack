# UI luxury plan: from "polished template" to "ours" (planned 21 Nov 2026, not started)

Source: the honest audit of 21 Nov 2026 (overall 6.5 of 10 against "million dollar, futuristic, luxury, not generic"; distinctiveness 5, futuristic 4, luxury 5.5, typography 6, colour 6, cards 6.5).

## Rules for this work
- **Pictures first, one step at a time.** Draw with PrepStack's real styles, the owner approves, then build. Nothing is replaced without a picture the owner said yes to (the 20 Nov "replace the visual world" run went the other way and was stopped).
- **The owner decides the colour base and the typeface.** They are picked from side-by-side pictures (Phase 0), not from words.
- Same wording, logic, limits and AI calls. Content facts do not change.
- After each phase: real-browser captures (light, dark, 375 px), lint, unit and e2e tests, build; docs updated; the owner commits.

## What the audit found (the targets)
1. The amber last word in headings, on almost every page.
2. The same card everywhere: icon tile, title, grey text, pill tags, "Open".
3. The same backdrop everywhere: faint grid plus amber glow.
4. Cream plus amber on rounded white cards: cohesive but the most common "warm premium" palette.
5. Plus Jakarta Sans plus Inter: the default pair. `JetBrains Mono` is loaded but almost unused.
6. The home page explains the product with icons instead of showing it.
7. Empty gaps above the footer and empty grid slots.
8. Motion is calm but has no signature moment.

## Phases (about 3 weeks)

| Phase | Work | Size |
|---|---|---|
| 0. Look board | Draw the home hero plus one section and the DSA list in three directions: A "Same colours, new structure and type" (safest), B "Ink and paper" (neutral base, amber only on marks and actions), C "Dark first" (dark is the main look, light the alternative). The owner picks one, or mixes. | 1 day |
| 1. Foundations | Type scale and the chosen display face; mono for numbers and labels; remove the amber-last-word habit; quieter backdrop (grid and glow only on home and auth); two card kinds (flat list or ledger for data, card for real objects); fix gaps and empty slots. | 2 to 3 days |
| 2. Signature marks | A small set drawn from the product and used everywhere: the segmented strip (progress, like the report's requirement strip), the tick box, numbered steps in mono, tabular figures. | 2 days |
| 3. Home page | Real product screens instead of icon tiles, a less textbook section order, a stronger hero, scroll-linked reveals. | 3 to 4 days |
| 4. List and detail pages | DSA sheets, sheet page, notes, roadmaps, behavioral, resume guide: ledgers and tables where the data is the point. | 3 to 4 days |
| 5. App pages to the new tokens | Dashboard, My plan (Today screen unchanged), AI projects, Role Analyzer, profile, auth. They are closest already. | 1 to 2 days |
| 6. Motion and intent | Route transitions, a few signature moments, tick and progress micro-interactions; optional: a Ctrl+K "jump to" box (a new feature: needs the owner's yes). | 2 to 3 days |
| 7. Verify | Whole e2e suite, dark and phone pass, slow network, docs and README. | 1 day |

## Decisions that are the owner's (recommendation in brackets)
1. Colour base: keep cream plus amber, or move (recommend: decide from the Phase 0 pictures; amber stays as the one accent either way).
2. Display typeface (recommend: choose from three pictured pairings in Phase 0, with the mono face for numbers).
3. Whether Phase 6 includes the Ctrl+K box (recommend yes, after the rest).
4. Whether to show the Phase 0 pictures to 3 to 5 students before choosing (recommend yes: it costs an hour and removes guessing).

## Risks
- Taste is subjective and I am not a trained designer; outside eyes help.
- Many headings change markup (the amber word), and some tests and the SEO prerender read headings: the run after each phase catches this.
- A better look does not replace trust and content: the site's wording and honesty stay its strongest asset.
- No real-device testing yet; the owner's own testing is still the main check.
