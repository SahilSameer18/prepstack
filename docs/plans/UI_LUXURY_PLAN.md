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
| 3. Signature marks (**built 21 Nov**) | The segmented progress strip, the tick box, numbered steps in mono, used across DSA, plan and roadmaps. | Open |
| 4. Home page | Built (see Status). The live demo is now about the plan: your hours, today, missed days (decided 21 Nov). | Built, not tested |
| 5. List and detail pages | DSA sheets list and sheet page as rows with progress marks, roadmaps list and page, behavioral, resume guide. | **Done 21 Nov** (all six pages built, looked at in light and dark; not tested) |
| 6. Reading and planning screens (**built 21 Nov**, notes page, notes list and Plan tab) | The notes reading page (quiet backdrop, clear explanation, example, mistake and exercise blocks, narrow-screen diagrams and code) and the My plan Plan tab (controls grouped by purpose: schedule changes, task management, recovery, plan management). Draw each with real data first. | Open |
| 7. App pages to the same look (**built 21 Nov except auth, which the owner keeps**; profile Security/Devices/Sign out cards not restyled) | Dashboard (smaller greeting, clear selected section), AI projects, Role Analyzer, profile, login and register; confirmation dialogs the same everywhere. | Open (they are close already) |
| 8. Motion (**built 21 Nov**, parts not done, see PROJECT_STATUS) | One system: press feedback, tab movement, disclosure, dialogs, gentle page entry, a "task done" moment; consistent reduced motion; optional Ctrl+K "jump to" box (needs the owner's yes). | Open |
| 9. Verify | Whole e2e suite, server tests, build and SEO check, light, dark and 375 px captures, slow network, accessibility checklist (touch targets, keyboard and focus, Escape and focus return, names for icon buttons, text as well as colour for errors, larger text and long labels, reduced motion and transparency, dialogs with the phone keyboard open); docs and README. | Open (when the owner asks) |

## Phase 6 in detail (looked at on real pages, 21 Nov 2026)

### 6a. Notes reading page (`/notes/:subject/:section`)
**What is good and stays:** the three columns (chapter list on the left, article, "On this page" on the right), the title and meta row ("10 min read", "Last checked", "Report a mistake"), the plain-words text.
**What is wrong:**
1. Each topic is a white card, and inside it sit three more tinted boxes (Why it matters, Example, How it fails): four containers per topic, seven topics per section, and the page is about 9,400 px long. It reads as boxes, not as an article.
2. The text line is about 90 characters wide: too long for comfortable reading (65 to 70 is the target).
3. The grid and amber glow behind the article compete with the text; a reading page should be quiet.
4. The three sub-blocks use three background colours at the same loudness as the body text.
5. Not yet looked at closely: the diagrams, Common mistakes, Interview questions and Check yourself blocks at the bottom (to be checked before building).
**Plan:** each topic becomes a plain section (heading, text, a hairline); Why it matters, Example and How it fails become quiet blocks with a small uppercase label and a thin coloured rule on the left (brand, neutral, red) instead of filled boxes; a narrower reading column; no grid and glow on reading pages; the bottom blocks get the same label style. Left list and right outline unchanged (sticky). The `Accordion` used by the notes quiz and diagrams is checked on the way.

### 6b. My plan, "Plan" tab (`/my-plan/study?tab=plan`). The Today screen is not touched.
**What is wrong:**
1. Two headings for one thing ("Your study schedule" and "Placement prep, 4 weeks") and the plan facts are five stacked lines of the same size (progress, dates, pace, "On track", a long amber warning).
2. Seven buttons of the same weight in one row, including "Delete current plan" next to the ones used every day.
3. Weeks are boxes, with day timelines and task boxes inside them: cards inside cards. Each task's "Options" sits far to the right.
**Plan (nothing is hidden; every action stays visible, so no behaviour or test flow changes):**
- One heading (the plan title) and one status line of small facts (done count, dates, pace, "On track"); the warning as one short line with its disclosure.
- Actions in four labelled groups: **Adjust** (Change hours, Change pace, Lighter days), **Tasks** (Add a task), **Recovery** (Pause plan, Rebuild from today), **Plan** (Study day settings, Build another plan, and Delete current plan as a separate red text action).
- Weeks as lines (like the DSA topics): week, dates, hours, a mark per task done, a caret; inside, days on a thin line with flat task rows (square tick, title, minutes, source in muted text, Options as a small icon button with a name).

### How we do it (agreed rules)
1. For each of 6a and 6b: a picture first, drawn with the **real content** (the real OS text, the real plan from a built test plan), light and dark, then your yes.
2. Build one page, look at real screenshots in light and dark, fix, then show you.
3. No test pass until you ask; lint only.

## Phase 7 in detail (looked at on real pages, 21 Nov 2026)
**Findings**
1. Dashboard "My plan" tab: two heading levels and two tab rows stacked (Dashboard tabs, then "My plan" heading and Today/Plan/Reviews tabs in the same style), so it is unclear which row does what. The greeting is the loudest thing on the page.
2. Profile: orange word in "Your profile.", two stat cards with icon tiles, avatar in a big framed box, the form inside one large card.
3. Login and register: orange words ("back.", "crack your tech role."), three stat cards with different heights, a pill list of features.
4. AI projects, Analyzer, Reports: already close (done earlier); they get only the label and rule alignment.
**Plan**
- Dashboard: small "Dashboard" label, a smaller greeting; the top tabs stay as the one main row; the My plan inner tabs become a quiet underline row so the two rows look different; the Today screen content is not changed.
- Profile: no orange word; name as the title with the avatar; two numbers in mono without cards; form as labelled rows with hairlines (label and hint on the left, field on the right).
- Login and register: no orange word; the three facts as one mono strip with dividers; the feature pills removed (they repeat the navbar).
- Security and Devices tabs, dialogs and confirmations: same row style; destructive actions as red text.
- AI projects, Analyzer, Reports: label and rule alignment only.

## Next phases, in order (planned 21 Nov, after Phase 7)
| Step | Work | Size | Why now |
|---|---|---|---|
| 7b. Profile finish (**done 21 Nov**) | Account as labelled rows with hairlines (no big card), plain side list without icons, lighter avatar frame, Security, Devices and Sign out as rows, destructive actions as red text. Look at every tab in light and dark. Auth pages untouched. | 1 day | The owner pointed at this page: it still feels like before |
| 1+2. Site-wide polish (**done 21 Nov; backdrop kept by the owner; footer gap not changed**) | Heading weights: the heaviest weight only on page titles, section titles lighter. Backdrop: grid and glow only on home and auth, quiet on reading and app pages. Aligned figures. Spacing per page type; fix gaps above the footer. Check every page in light and dark. | 2 days | The biggest feel change for the least work |
| 3. Signature marks | Use ProgressMarks, the square tick and mono numbers wherever progress or steps show (plan weeks, reports, roadmaps). | 1 day | Ties the pages together |
| 8. Motion | One set of rules: press feedback, tab movement, opening and closing, dialogs, page entry, reduced motion everywhere; a task-done moment; the Ctrl+K box only if the owner says yes. | 2 to 3 days | After layout is stable |
| 9. Test pass | Whole e2e, server tests, build and SEO check, light, dark and phone captures, slow network, accessibility list. Fix the tests that read moved headings. | 1 to 2 days | Run before real-device testing |
Rule: a real-content screenshot, light and dark, is looked at before anything is shown to the owner. Heading font stays an open owner decision (three pictures first).

## Step 3 in detail: signature marks (planned 21 Nov, from the code)
**Today:** ProgressMarks is used on 3 pages (DSA list, sheet header, sheet topics). Other progress is still a thin bar or nothing.
**Changes (all small, no behaviour change, the Today screen is not touched)**
1. Dashboard DSA tab: each sheet card shows a thin bar (DsaDash.jsx) → ProgressMarks, same as the DSA list. Stat numbers (Problems solved, streak, sheets, overall) → mono figures.
2. Plan tab: each week line gets a ProgressMarks (done of total tasks) beside its hours, as the DSA topics have.
3. Usage limit card ("3 of 4 ideas used", StateComponents.jsx): thin bar → ProgressMarks with 4 to 5 marks.
4. Home hero demo ("Your hours" bar): left as a bar, because it shows a fit amount, not finished items.
5. One shared Tick: the square tick is written out in four places (PlanChecklist, ProblemRow, hero demo, note drawer); move it to one small component so they cannot drift apart.
6. Mono for counts and times that are still in the main font: Analyzer days number, plan preview totals.
**Not changed:** the Analyzer score and requirement strip (already marks), roadmap step numbers (already mono), round check icons used as status (matched, partly, missing), which are status, not ticks.
**Size:** about 1 day. **Risk:** the Tick change touches the sheet row and the plan checklist, so the e2e tick tests run after.

## Phase 8 in detail: motion (planned 21 Nov, from the code)
**What exists:** 23 files use framer-motion, 17 handle reduced motion, 6 do not (FAQ, hero demo, error components, the sheet note drawer, the profile delete and security cards). Durations are mixed (0.15, 0.2, 0.25, 0.3 s) with four different spring settings. A global reduced-motion rule exists in index.css. Sliding tab highlights are already one pattern (spring 0.3 s, no bounce) in 7 places. 5 pages use `page-enter`; 4 places use `active:scale`.
**Rules (one set, written once)**
1. Timing: 0.15 s for press and hover, 0.25 s for opening and closing, 0.3 s spring (no bounce) for moving highlights. No other durations. Easing is the site curve already in the CSS.
2. Press: every button and row-link gets the same small press (scale 0.98) and returns on release.
3. Disclosure (accordions, week lines, FAQ, sheet topics, notes questions): one height-and-fade pattern, the same everywhere.
4. Dialogs and drawers: fade the scrim, slide or scale the panel a few pixels; Escape closes; focus returns to the opener (checked, fixed where missing).
5. Page entry: one gentle fade-up on page content (already `page-enter`); not replayed on tab changes inside a page.
6. Reduced motion: every motion file honours it (fade only, no movement); the 6 files that do not get fixed.
7. No motion on the My plan Today screen except the tick and the done moment below.
**Owner addition (21 Nov): motion physics, micro-interactions, and slow where slow is right, not always fast.** The timing rule above is replaced by three speeds, chosen by how important the moment is:
- **Quick (0.12 to 0.2 s)**: press, hover, focus rings, toggles. The user is acting and must feel an instant answer.
- **Medium (0.25 to 0.4 s)**: opening and closing, tab highlight, dialogs, drawers.
- **Slow (0.5 to 0.9 s)**: moments that should be noticed and enjoyed: the first page reveal (staggered, about 60 ms between items), progress marks filling in one after another, the score and big numbers counting up once, the task-done squeeze and day glow, the empty-state glow, the report score strip drawing in.
**Physics:** three spring presets in one file, used everywhere instead of ad-hoc numbers: **snappy** (stiffness 420, damping 34: toggles, ticks), **smooth** (stiffness 260, damping 30: highlights, panels), **soft** (stiffness 120, damping 22, mass 1.1: large reveals and fills, a small gentle overshoot). Rules: springs for things the user moves or toggles, eased tweens for fades; motion can be interrupted mid-way and reverses from where it is; nothing bounces on the Today screen except the tick.
**Micro-interactions (each small, none decorative):** buttons lift 1 px and brighten on hover, press to 0.98; arrows in "Open" links slide 4 px; tick squeezes then fills; progress marks fill in sequence when a page first shows them (and one mark pops when you add progress); numbers count up once on first view; a tab highlight slides between tabs; chevrons rotate with the panel; inputs get a soft focus ring that grows in; a successful save shows the check morphing in; copy buttons swap their icon with a small pop; list rows slide in 8 px with a stagger on first load only; toasts slide in and out. Reduced motion: all of these become a plain fade or nothing.
**Slow motion guard:** slow motion plays once per visit per element (not on every tab switch or refilter), never blocks input, and the Today screen stays calm.

**The signature moment: task done.** Ticking a task (plan checklist, sheet row, Today) does a short squeeze-and-fill on the tick (about 0.3 s, already close in the sheet row), and when the last task of a day is ticked the day line gets one soft glow, like the sheet-complete glow that exists. Nothing loud, no confetti, no sound.
**Optional, needs the owner's yes:** a Ctrl+K "jump to" box (the 404 page already has a working jump-to list we could reuse). New feature, about 1 day, with its own keyboard and focus tests. Recommendation: yes, last, after the rest of Phase 8.
**Order:** (a) shared motion constants and the 6 reduced-motion fixes, (b) unify disclosure and press, (c) dialogs and focus return, (d) the task-done moment, (e) look at real pages with reduced motion on and off, (f) optional Ctrl+K.
**Risk:** animations cannot be judged from screenshots; I can check that nothing breaks, that reduced motion removes movement and that focus returns, but how it feels is for the owner to try on a real device. Size: 2 to 3 days (plus 1 for Ctrl+K).

## To do later (owner, 21 Nov)
- The gap above the footer on short pages (no clear fix found yet).
- The device row inside the profile Devices tab still has its tinted card.
- Phone-width (375 px) checks of the rebuilt pages; only a few were checked.
- Unused-code cleanup: capsule styles and roadmap icons are removed; nothing else known.

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
