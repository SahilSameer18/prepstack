# UI luxury plan: from "polished template" to "ours" (planned 21 Nov 2026; revised the same day)

Source: the honest audit of 21 Nov 2026 (overall 6.5 of 10 against "million dollar, futuristic, luxury, not generic"; distinctiveness 5, futuristic 4, luxury 5.5, typography 6, colour 6, cards 6.5), plus a second opinion from another agent that the owner pasted (adopted in part, see "Second opinion").

## Status (updated 21 Nov 2026)
- **Phase 0 done.** Three directions were drawn; the owner chose to **keep the current colours** and said the worry is **structure**. Colours and fonts stay as they are unless the owner asks (the fonts, Plus Jakarta Sans, Inter, JetBrains Mono and Caveat, are common defaults: a heading-font change is an open owner decision, to be picked from pictures).
- **Home page built (Phase 4 below), looked at in light and dark, not tested.** The old comparison, handwriting and the tilted `while (preparing)` chip are kept; numbers row (static, from `homeFacts.json`, no server call, full width), "How it works", "What is inside" as lines, a Role Analyzer section with an example report, plain FAQ rows. The hero demo is now about the plan (Your hours, Today, Missed days), one fixed height on all tabs, no "example" labels. The orange last word is gone on the home page only.
- **Phase 5 built, then reviewed and fixed page by page from real screenshots (21 Nov).** Done and looked at in light and dark: DSA list, sheet page (signed in and out), roadmaps list, roadmap page (opened step), behavioral prep. **Resume guide: looked at (signed in, light and dark) and aligned. Phase 5 is complete.** A first version of Phase 5 was built from pictures with short made-up text and looked cluttered with real content; the fixes below came from that.
- **Testing is deferred** at the owner's request (21 Nov): lint, unit, build, e2e and captures run in one pass when the owner asks.

## Design rules from the Phase 5 review (apply to every page)
1. Three sizes: page title, row or section title, small mono uppercase label. A group heading is always the small label, never a big title.
2. Show a mark, tag or caption only when it says something (no empty progress marks at zero, no tags column, no "example" captions).
3. Say each thing once (a time shows once, a category once per group).
4. Opened content: one label style, smaller body text, one hairline between sections; fixed columns so rows line up.
5. Buttons inside content are quiet (links or outlined); the amber button is for the main action of the page.
6. Group long lists under small labels and keep the side list in view (sticky).
7. Inactive chips have their own surface and a clear edge; the active chip has a brand edge.
8. One line between sections, never two.

## Rules for this work
- **Pictures first, one step at a time.** Draw with PrepStack's real styles, the owner approves, then build. Nothing is replaced without a picture the owner said yes to.
- The owner decides colours and typefaces, from pictures, not words.
- Same wording, logic, limits and AI calls. Content facts do not change. No invented evidence (no made-up student quotes). The My plan "Today" screen is never changed.
- Testing is one agreed pass (Phase 9), not after every step. **But every page is looked at in a real-content screenshot (light and dark) before it is shown to the owner.** Pictures are drawn with real content, not short made-up text.

## What the audit found (the targets)
1. The amber last word in headings, on almost every page.
2. The same card everywhere: icon tile, title, grey text, pill tags, "Open".
3. The same backdrop everywhere: faint grid plus amber glow.
4. Cream plus amber on rounded white cards: cohesive, but a common palette (kept by the owner's choice).
5. The default font pair; the heaviest heading weight on nearly every heading.
6. The home page explained the product with icons instead of showing it; its demo reads as a coding simulator, not a planner.
7. Empty gaps above the footer and empty grid slots.
8. Motion is calm but has no signature moment.
9. Not yet looked at: the notes reading page and the My plan "Plan" tab (many controls).

## Second opinion (another agent's advice, read 21 Nov)
**Adopted:** a plan-focused home demo; lighter heading weights; spacing rules per page type (home, app, reading, forms); the notes reading page and the My plan Plan tab as their own steps (the Plan tab prototyped with real data first); aligned figures; "Checking your session" worded differently from a failed sign-in; one motion system with a "task done" moment; an accessibility checklist for the final pass.
**Not adopted:** re-drawing three directions across five screens in light and dark (the owner already chose; only the screens not yet seen are drawn, in the chosen direction); testimonials (none exist).

## Phases (about 3 to 4 weeks)

| Phase | Work | Status |
|---|---|---|
| 0. Look board | Three directions drawn; owner kept the colours, worry is structure. | **Done** |
| 1. Quick wins across the site | Lighter heading weights (the heaviest weight only on a few big headlines), the orange last word removed on the other pages, aligned figures (tabular numbers) for hours, counts and progress, a defined style for page title, section title, card heading, label and metadata. | Open (small) |
| 2. Spacing and surface rules | Spacing per page type (home, dashboard, My plan, notes, catalogues, forms); two surface kinds (rows or ledgers for data, cards for real objects); grid and glow only on home and auth; fix gaps above footers and empty grid slots. | Open |
| 3. Signature marks | The segmented progress strip, the tick box, numbered steps in mono, used across DSA, plan and roadmaps. | Open |
| 4. Home page | Built (see Status). The live demo is now about the plan: your hours, today, missed days (decided 21 Nov). | Built, not tested |
| 5. List and detail pages | DSA sheets list and sheet page as rows with progress marks, roadmaps list and page, behavioral, resume guide. | **Done 21 Nov** (all six pages built, looked at in light and dark; not tested) |
| 6. Reading and planning screens | The notes reading page (quiet backdrop, clear explanation, example, mistake and exercise blocks, narrow-screen diagrams and code) and the My plan Plan tab (controls grouped by purpose: schedule changes, task management, recovery, plan management). Draw each with real data first. | Open |
| 7. App pages to the same look | Dashboard (smaller greeting, clear selected section), AI projects, Role Analyzer, profile, login and register; confirmation dialogs the same everywhere. | Open (they are close already) |
| 8. Motion | One system: press feedback, tab movement, disclosure, dialogs, gentle page entry, a "task done" moment; consistent reduced motion; optional Ctrl+K "jump to" box (needs the owner's yes). | Open |
| 9. Verify | Whole e2e suite, server tests, build and SEO check, light, dark and 375 px captures, slow network, accessibility checklist (touch targets, keyboard and focus, Escape and focus return, names for icon buttons, text as well as colour for errors, larger text and long labels, reduced motion and transparency, dialogs with the phone keyboard open); docs and README. | Open (when the owner asks) |

## Decisions that are the owner's (recommendation in brackets)
1. Heading font: keep Plus Jakarta Sans, or change (recommend: look at three pictured options for the home hero before deciding; change only the heading font).
2. The home demo about the plan: **decided yes (21 Nov)**, built.
2b. The fake "G → D" keyboard capsule on the signed-in hero Dashboard button: **removed 21 Nov** (nothing handled those keys). A real keyboard shortcut can come back together with the Ctrl+K box in Phase 8.
3. Whether the Ctrl+K "jump to" box is included in Phase 8 (recommend yes, last).
4. Whether to show the pictures to 3 to 5 students first (recommend yes: it costs an hour and removes guessing).

## Risks
- Taste is subjective and I am not a trained designer; outside eyes help.
- Many headings change markup, and some tests and the SEO prerender read headings: the Phase 9 pass catches this.
- The My plan Plan tab touches a feature with many rules: prototype first, and the Today screen stays untouched.
- A better look does not replace trust and content: the wording and honesty stay the site's strongest asset.
- No real-device testing yet; the owner's own testing is still the main check.
