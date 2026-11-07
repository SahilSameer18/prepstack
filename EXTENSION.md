# LeetCode auto-sync extension: plan (LeetCode only)

Status: plan agreed, all decisions made, nothing built yet. Date: 2026-11-07. Build order: do the Step 0 spike first, and stop if it fails.

## Goal

A student solves a problem on leetcode.com and gets "Accepted". PrepStack marks that problem as solved in every sheet that contains it, without the student opening PrepStack.

## What it covers (and what it does not)

Only problems whose sheet link points to leetcode.com:

| Sheet | LeetCode links |
|---|---|
| Blind 75 | 75 of 75 |
| NeetCode 150 | 151 of 151 |
| Love Babbar 450 | 23 of 450 |
| Striver A2Z | 0 of 446 (links go to takeuforward.org articles) |
| Striver SDE | 0 of 193 (same) |

About 250 of roughly 1,300 links. Other sites (GeeksforGeeks, Code360) are **out of scope** for this version. Mapping Striver's articles to LeetCode problems is a separate data job and is not part of this plan.

## How it works

```
LeetCode page ──(content script sees "Accepted")──> extension background
   ──POST /api/sheets/sync-problem  (Authorization: Bearer <personal token>)──> PrepStack server
   server: normalise the address, find sheets that contain it, add it to the user's solved list
```

- **Personal token:** the student creates it once on their PrepStack profile page and pastes it into the extension popup. The extension never sees the password or the login cookies.
- **Only adds, never removes:** the sync adds a problem to the solved list (`$addToSet`). Unticking stays a manual action on the website. Syncing the same problem twice changes nothing.

## Build steps

### Step 0: one-day spike (do this before anything else)
Check, in a real browser, how LeetCode reports a result today. The old note assumed `GET /submissions/detail/<id>/check/` returning `status_msg: "Accepted"`. LeetCode may have moved this to a GraphQL `submissionDetails` query; this has not been verified, so look at the real network calls in a clean browser profile, on both a wrong answer and an accepted one, before choosing. Decide the detection method from what is actually seen. **If no reliable signal exists, stop here.** Nothing else is built until this passes.

### Step 1: server (about 1.5 days)
- New model `ExtensionToken`: `user` (ref `User`), `tokenHash` (SHA-256, unique), `label`, `createdAt`, `lastUsedAt`. Because it has a `user` ref, the existing delete-account cascade wipes it automatically.
- Token format: `psx_` + 32 random bytes (hex). The full token is shown **once** at creation and only its hash is stored. Maximum 3 tokens per user.
- Routes (cookie login required): create token, list tokens (label and last used only), revoke token.
- `POST /api/sheets/sync-problem`: accepts a token, not a cookie. A token can call **only** this route; it cannot read or change anything else.
  - Input is validated: `problemUrl` must be on `leetcode.com` and start with `/problems/<slug>`.
  - Normalise to `https://leetcode.com/problems/<slug>/` **with the trailing slash**. All 249 LeetCode links in the seeds end with `/` (checked: 75 of 75 in Blind 75, 151 of 151 in NeetCode, 23 of 23 in Love Babbar), and none has `/description`. Matching is then an exact string compare. For safety the query also accepts the form without the slash (`$in` with both), so a future seed that drops the slash cannot silently break syncing. Add a test that loads the real seed links and checks every one is found.
  - Find sheets with `DSASheet.find({'topics.problems.link': normalised})`, then one atomic `$addToSet` per sheet on the user's progress record.
  - Reply with the sheet slugs that were updated (empty list if the problem is in no sheet).
- Own rate limit, keyed by token (for example 60 per hour).
- CORS: requests from the extension carry the origin `chrome-extension://<extension id>`. The server rejects unknown origins, so add that exact origin to `ALLOWED_ORIGINS`. Do **not** allow every `chrome-extension://` origin: that would let any extension a user has installed pass the check, and the whole point of the exact allowlist is that only known origins pass. To get one stable ID for unpacked installs (so you and your friends share it), put a fixed `key` in the extension's `manifest.json`.

### Step 2: profile page (about 0.5 day)
A small "Browser extension" card on `/profile`: create a token (shown once with a copy button), a list with last-used time, and a revoke button. Use the same wording style and 44px buttons as the other cards.

### Step 3: the extension (about 2 to 3 days, Manifest V3)
- `manifest.json`: permissions only for `https://leetcode.com/*` and the PrepStack API address. Nothing else.
- Content script on `leetcode.com/problems/*`: detects "Accepted" using the method chosen in Step 0 and reads the problem slug from the page address.
- Background service worker: sends the sync request, retries once on a network error, and ignores repeats of the same problem within a few minutes.
- Popup: paste token, save, shows "Connected" or the error, and a link to the profile page.
- Keep the token in `chrome.storage.local`. Never log it.
- Edge and Brave also accept Chromium extensions, so the same build works there.

### Step 4: tests (about 1 day)
- Server tests (same style as the existing 227): token created once and stored hashed, limit of 3, revoke stops it at once, a token cannot call any other route, bad or non-LeetCode addresses are rejected with 422, a problem in 2 sheets updates both, a problem in no sheet returns an empty list, syncing twice does not duplicate, another user's progress is untouched, rate limit gives 429, account deletion removes the tokens.
- Extension: a small test for the address normaliser. Manual checklist for the rest (submit a wrong answer and an accepted one on a real problem, token revoked, server down).

### Step 5: release
- First version: load it unpacked in Chrome (no store). Use it yourself and with a few friends for a week.
- Chrome Web Store later: one-time developer fee (about $5), a privacy policy, a screenshot set and a review that can take several days.
- Update the privacy policy page: the extension reads only the problem address on leetcode.com when a submission is accepted, and sends only that address to PrepStack.

## Estimate

| Step | Time |
|---|---|
| 0. Spike | 1 day |
| 1. Server | 1.5 days |
| 2. Profile card | 0.5 day |
| 3. Extension | 2 to 3 days |
| 4. Tests | 1 day |
| **Total before the store** | **about 6 to 7 days** |
| 5. Store review | extra waiting time, a few days to a week |

## Risks

- **LeetCode changes its page or network calls.** The extension then silently stops detecting. This needs upkeep and a visible "last synced" time in the popup so the student notices.
- **Only about 20% of the links are covered**, mostly two sheets. Real usage may not justify the upkeep.
- **Leaked token:** it can only mark problems solved, it is hashed on the server, and it is revocable. The damage is limited to fake progress.
- **Terms of use:** read LeetCode's terms before publishing in the store. The extension reads only the page the student is already on and does not scrape or automate anything.

## Decisions (made)

1. **Spike first; stop if there is no reliable signal.** Reason: the detection method is the one part we cannot control, so prove it before building the server or the popup.
2. **Unpacked only for now, store later.** Reason: test with you and 5 to 10 friends (slow internet, revoked token, rapid submissions) before paying the store fee and waiting for review.
3. **Additive only.** A failed re-submit never un-ticks. Reason: once solved, later experiments should not erase the history.
