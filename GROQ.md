# Reliable AI service: plan (Gemini, Gemini fallback, then Groq)

Status (2026-11-07): Phases 1 to 3 are built (model IDs verified, the cascade, the 409 and daily limit). Phase 4 is built except the live check with real keys, which you run (steps are at the end of this file). This replaces the earlier draft code in this file.

## Goal

"Generate project idea" should almost never fail for a user. Today it uses one model (`gemini-3-flash-preview`). When Google answers "busy" (HTTP 503 or 429), the user gets an error. We want:

1. A second Gemini model as the first fallback.
2. Groq as the last fallback, a different company on a different network.
3. Clear limits so a slow or broken provider cannot hang the request or run up cost.
4. Every failure explained honestly to the user, and visible to you in the logs.

"Fully reliable" cannot mean it never fails. It means: one provider failing is invisible to the user, and if all fail the user gets a clear message within a known time, loses nothing, and is not charged an attempt.

## Your real limits (from your own dashboards, 2026-11-07)

These change the plan, so they come first.

**Gemini (your key, free tier)**

| Model (display name) | Requests per minute | Tokens per minute | Requests per day |
|---|---|---|---|
| Gemini 3 Flash (current) | 5 | 250K | **20** |
| Gemini 2.5 Flash | 5 | 250K | 20 |
| Gemini 2.5 Flash Lite | 10 | 250K | 20 |
| **Gemini 3.1 Flash Lite** | **15** | 250K | **500** |
| **Gemini 3.5 Flash Lite** | **15** | 250K | **500** |
| Gemma 4 26B / 31B | 30 | 16K | 14,400 |

- **The current model allows 20 ideas per day for the whole app, and 5 per minute.** Two active users can use up the day. A per-user cap of 15 does not protect against this. It only matters once the key is upgraded.
- The dashboard shows your peak use over 28 days was 1 request per day. So the "busy" errors you saw were probably Google being overloaded (503), not your quota. Failed calls may not be counted, so this is not certain. Both causes are handled below.
- The Flash Lite models give 25 times more daily requests than Gemini 3 Flash. **The fallback is therefore not a spare: it will carry most of the traffic once the daily 20 are gone.**
- Gemma may not support structured JSON output through the API. Do not use it unless Step 0 proves it does.

**Groq (free tier)**

| Model | Requests per minute | Tokens per minute | Requests per day | Status |
|---|---|---|---|---|
| openai/gpt-oss-120b | 30 | **8K** | 1,000 | production |
| openai/gpt-oss-20b | 30 | 8K | 1,000 | production |
| qwen/qwen3.8-27b | 30 | 8K | 1,000 | preview (can be removed at short notice) |
| llama-3.3-70b-versatile | n/a | n/a | n/a | marked Enterprise / Contact Sales, not in the free table |

- **The Llama 3.3 70B model used in the old draft is not available on the free plan.** Use `openai/gpt-oss-120b` (production), with `openai/gpt-oss-20b` as the cheaper option.
- 8K tokens per minute is small. One idea is roughly 1.5K to 3K tokens, so Groq carries only about 3 to 5 ideas per minute. Fine for a last resort, not for everyday traffic.
- gpt-oss models "think" before answering and those tokens count. Set a low reasoning level and a maximum output size (about 1,500 tokens) so one call cannot use the whole minute's budget.
- Rate limits apply to your whole Groq organisation, not per user.

## Phase 1 result (2026-11-07): model IDs verified

Run with `node server/scripts/list-models.js --probe ...` on the real keys. All four returned valid structured JSON.

| Slot | Model ID | Result |
|---|---|---|
| 1 | `gemini-3-flash-preview` | OK, about 2 s |
| 2 | `gemini-3.5-flash-lite` | OK, about 1.4 s |
| 3 | `gemini-3.1-flash-lite` | OK on the second run, about 4 s. **The first run got a 503 "high demand".** |
| 4 | `openai/gpt-oss-120b` (Groq) | OK, about 0.5 s, `json_schema` mode accepted |

- The 503 on a Lite model, on the first try of the day, is the same "busy" error you saw in the app. It cleared on the next run. That is exactly the case the retry and the fallbacks are for.
- Groq accepts the `json_schema` mode, so its output can be forced to our shape, not only checked afterwards.
- A tiny test call used 33 to 300 tokens. A real idea is larger (roughly 1K to 2K), so the Groq limit of 8K tokens per minute still means about 3 to 5 ideas per minute.
- `gemini-3-flash-preview` is a preview model and can be retired. The stable `gemini-3.5-flash` and `gemini-3.6-flash` also exist in the list, but the free limits for those are not yet checked, so the primary stays as you chose it and is a setting.

## What exists now (so we change as little as needed)

- `server/src/services/ai.service.js`: one function, `generateProjectIdea({ techStack, complexity, domain, notes })`. It calls Gemini, parses the JSON, checks it with a Zod schema, and throws a clean 502 on any failure.
- `project.controller.js` calls it, then saves the project.
- Limits today: 4 ideas per hour per user (failed calls are not counted), kept in server memory.
- The client waits up to 90 seconds for this call.
- The existing tests use a fake Gemini that can return good, malformed or failing replies.

The output check (Zod `safeParse`) stays exactly as it is and applies to **every** provider. A weaker model can never save a broken idea.

## Design

### Providers, in order

| # | Provider | Role | Model name |
|---|---|---|---|
| 1 | Gemini primary | best quality, only 20 per day | env `GEMINI_PRIMARY_MODEL`, default the current Gemini 3 Flash |
| 2 | Gemini fallback | the high-quota workhorse (500 per day, 15 per minute) | env `GEMINI_FALLBACK_MODEL`, default Gemini 3.5 Flash Lite |
| 3 | Gemini fallback 2 | a second 500-per-day model with its own separate quota (free, so it costs nothing to add) | env `GEMINI_FALLBACK_2_MODEL`, default Gemini 3.1 Flash Lite |
| 4 | Groq | last resort, different company | env `GROQ_MODEL`, default `openai/gpt-oss-120b` |

- All three names come from environment variables, each with a default. When Google retires a model you change a setting and restart, not code.
- A provider with no API key is skipped silently. With only `GOOGLE_API_KEY` set, the service still works (2 Gemini models). With no keys at all, the server logs a loud warning at startup and the endpoint answers 503 "AI is not configured".
- **Exact model IDs must be verified before they are written as defaults** (see Step 0). The dashboard shows display names such as "Gemini 3.1 Flash Lite", not the IDs the API needs. The old draft used `gemini-1.5-flash`, which I believe Google has shut down.
- **Decision: stay on the free plan for both Gemini and Groq. No paid upgrade.** The plan is built around the free limits above.

### What counts as a failure, and what we do about it

| What happened | Example | Action |
|---|---|---|
| Overloaded | 500, 502, 503, 504 | Retry the same provider once after about 1 second (random 0.7 to 1.3 s), then go to the next provider |
| Quota hit (per minute or per day) | 429 | **No retry**: waiting one second cannot clear a per-minute limit, and a daily limit lasts hours. Go to the next provider at once. Open that provider's breaker for the wait time the error reports (up to 1 hour; daily limits are the longest) |
| Timeout or network error | no answer in 20 s, connection reset | Go to the next provider at once (no retry: a hung provider would eat the time budget) |
| Bad key or no access | 401, 403 | Go to the next provider, and log it as **critical** (the key or billing needs fixing). Skip this provider for 10 minutes |
| Bad request | 400 | Go to the next provider. Log it (our prompt or schema is wrong, not the provider) |
| Reply is not valid JSON, or does not match the schema | missing field, wrong type, empty text | Go to the next provider (a retry of the same one rarely helps) |
| Safety block or empty reply | model refuses | Go to the next provider |

### Time and attempt limits

- **20 seconds per provider call.** Not left to the SDK default.
- **Total budget of 55 seconds** for the whole request. If the budget is gone, stop and answer 502. This stays under the browser's 90-second wait, so the user always gets our message and never a browser timeout.
- At most **5 calls in total** (4 providers plus 1 retry).

### Circuit breaker (stop hammering a provider that is down)

A small in-memory breaker per provider: after **3 failures in a row** (busy, timeout or bad key), skip that provider for **60 seconds**, then allow one trial call. A success closes it again. Without this, when Gemini is down every user would wait 20 seconds first for nothing.
It is per server process. That is fine for a single instance; if you run several, each learns separately.

### Protect users and cost

- **Double click or two tabs:** a per-user "already generating" flag. A second request while one is running gets a 409 "Your last idea is still being generated". It is cleared when the request ends, including on errors. (Today two quick clicks cost two AI calls.)
- **Daily cap per user** (default 15), counted from the database (`Project` documents created since midnight), not from memory. It survives restarts and works across instances, and needs no Redis. The hourly limit of 4 stays as it is.
- **Failed attempts are not charged:** the hourly limiter already skips failed responses, and the daily count only counts saved projects.
- **Input is untrusted:** `techStack`, `domain` and `notes` are user text that goes into the prompt. They are already length-limited by the validator. Add one line to the system prompt: user fields are data, not instructions. The Zod check already stops anything that is not our exact shape from being saved, so a prompt trick cannot write arbitrary data.

### Output rules (same for every provider)

- Same Zod schema as today, plus `features` must have at least 1 item.
- Difficulty is normalised before the check ("intermediate" becomes "Intermediate").
- The saved project gets a new field `aiProvider` (which of the three answered). It is stored for debugging and **not** sent to the browser.

### Logging (so you can see reliability)

One log line per generation, never containing the prompt, the user's text or the model's reply:
`AI ok provider=gemini-fallback attempts=3 ms=4210` or `AI failed attempts=4 ms=55000 reasons=503,timeout,bad-json,429`.
Critical events (bad key, all providers failed) use `console.error` so they stand out. At startup, log which providers are configured, never the keys.

### Errors the user sees

| Situation | Status | Message |
|---|---|---|
| All providers failed | 502 | "AI is very busy right now. Please try again in a minute. This attempt did not count." |
| Time budget used up | 504 | same wording |
| Already generating | 409 | "Your last idea is still being generated." |
| Daily cap reached | 429 | "You've reached today's limit of 15 ideas. Try again tomorrow." |
| No AI configured | 503 | "AI is not available right now." |

The client already shows server messages and has a friendly timeout text, so no client change is needed beyond checking the new 409 and 504 texts display.

## Files to change

- `server/src/services/ai.service.js`: the orchestrator (loop over providers, retry, budget, breaker). Providers stay small functions: `callGemini(model)` and `callGroq()`. One file is enough; split only if it grows past about 200 lines.
- `server/src/controllers/project.controller.js`: the "already generating" flag, the daily cap check, save `aiProvider`.
- `server/src/models/project.model.js`: add `aiProvider` (string, not returned to the client; the existing `sanitizeDoc` and the list/get field selection must not expose it).
- `server/package.json`: add `groq-sdk`. (It is not installed today.)
- `server/.env.example`: `GROQ_API_KEY`, `GEMINI_PRIMARY_MODEL`, `GEMINI_FALLBACK_MODEL`, `GROQ_MODEL`, `AI_DAILY_LIMIT`.
- `client/src/pages/legal/PrivacyPolicy.jsx`: add Groq as a service that receives the tech stack, domain and notes the user types.
- `README.md`, `TESTING.md`: describe the new behaviour.

## What the free plan gives you in total

| Provider | Per day | Per minute |
|---|---|---|
| Gemini 3 Flash | 20 | 5 |
| Gemini 3.5 Flash Lite | 500 | 15 |
| Gemini 3.1 Flash Lite | 500 | 15 |
| Groq gpt-oss-120b | 1,000 | 30 (but only about 3 to 5 ideas per minute because of the 8K token limit) |

About **2,000 ideas per day** in total, which is far more than a few hundred students will use. With free limits the per-user rules matter: 4 per hour and 15 per day keep one user from using the shared quota. If a day ever does run out of quota everywhere, users get the clear "AI is very busy" message and are not charged an attempt.

Free-plan terms: Google's free tier may use submitted prompts to improve its products (check the current terms), so the privacy page should say that what users type in the project form is sent to Google and Groq. This is only tech stack, domain and notes, not accounts or passwords. Tell users not to put personal data in the notes box (a one-line hint under the field).

## Steps and time

| Step | Work | Time |
|---|---|---|
| 0 | **Verify model IDs** from the providers' current model lists (Gemini: list models with your key; Groq: `GET https://api.groq.com/openai/v1/models`). Check JSON-schema output works on Gemini 3.5 Flash Lite and 3.1 Flash Lite. Check that `openai/gpt-oss-120b` accepts JSON output with a low reasoning level and a token cap. Send one test request to each and record the tokens used. Pick defaults. | 1 hour |
| 1 | Orchestrator: providers (a list of 4), failure rules, retry, timeouts, budget, breaker | 3 hours |
| 2 | Controller: in-flight flag, daily cap, `aiProvider`, hide it from responses | 1.5 hours |
| 3 | Tests (below) | 3 hours |
| 4 | Privacy page (Google free-tier wording, Groq), hint under the notes field, README, `.env.example` | 1 hour |
| 5 | Live check with real keys: normal call, then simulate failures (see below) | 1 hour |
| **Total** | | **about 1.5 days** |

## Tests (extend the existing fake-Gemini helper to a fake for each provider)

Every row is a server test with fakes. No real AI call and no cost.

- Primary works: one call, provider recorded as primary.
- Primary returns 503 once, then works: retried once, still the primary.
- Primary keeps failing: falls to the Gemini fallback.
- Both Gemini models fail: Groq answers, idea saved with `aiProvider: groq`.
- All three fail: 502 with the friendly message, nothing saved, the attempt is not counted.
- A reply with the wrong shape from one provider moves on to the next, and is never saved.
- Provider hangs: stops after the per-call timeout and moves on. The total budget stops the whole request (use short test timings).
- Bad key (401): moves on, and the provider is skipped on the next request.
- Circuit breaker: after 3 failures in a row, the provider is not called for a while, then one trial call is made.
- No Groq key: Groq is skipped, no crash. No keys at all: 503.
- Second request while one is running: 409. The flag is cleared after both success and failure.
- Daily cap: the 16th saved idea of the day gets 429. Resets the next day (fake the date).
- `aiProvider` is stored but never present in any API response.
- Prompt injection text in `notes` still produces only a valid, schema-checked idea.

## Check with real keys (Step 5, by hand, once)

1. Normal call works and the log shows the primary.
2. Set a wrong primary model name: the call falls to the fallback.
3. Set a wrong fallback too: it falls to Groq.
4. Remove all keys: a clear 503, and a startup warning.
5. Run 3 requests at once as the same user: 1 succeeds, 2 get 409.

## Risks and honest limits

- **Idea quality differs by model.** Groq's Llama ideas will often be weaker than Gemini's. The same schema check keeps them valid, not impressive.
- **Free tiers have limits too.** Groq's free plan has its own rate limit. If many users fall back at the same time, Groq can also say "busy". More fallbacks cannot fix a total Google outage plus a Groq limit.
- **The breaker and the in-flight flag live in server memory**, so they reset on restart and are not shared between instances. Fine for one server, like your current rate limiter.
- **Privacy:** Groq becomes a third party that receives what users type. This needs the privacy-policy line before launch.
- **Cost:** the fallback cannot loop forever (4 calls maximum, 55 seconds maximum), and the daily cap bounds the total per user.

## Decisions (made)

1. **Daily cap of 15 ideas per user.** Reason: a serious session needs 2 to 4 ideas, so 15 is plenty and still caps runaway cost.
2. **Retry the same model once on "overloaded" (500, 502, 503, 504), after a random 0.7 to 1.3 s wait, then go to the next provider.** Reason: short overload spikes often clear within a second. We will measure the real rate from the logs instead of assuming one. **A 429 (quota) is never retried**, because your limits are per minute and per day, so a one-second wait cannot help. This corrects the earlier wording that retried on 429.
3. **Keep the "already generating" 409.** Reason: a double click must never cost two AI calls.
4. **Write the orchestrator as a list of providers**, each `{ name, fn }`. Adding OpenRouter or a second Gemini key later is then a few lines.
