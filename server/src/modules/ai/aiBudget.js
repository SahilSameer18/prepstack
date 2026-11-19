// An app-wide budget of AI calls per provider (docs/plans/REDIS_PLAN.md, phase 6, step R2).
// The free AI tiers allow only so many requests a minute and a day for the WHOLE app, and the app used to learn it was over a limit from a failed
// call and a wait. Now a call is reserved first, and a provider whose budget is spent is skipped without being called.
//
// The numbers come from the owner's own AI consoles (they change, so they are not in the code):
//   AI_BUDGETS='{"gemini:gemini-3-flash-preview":{"perMinute":5,"perDay":20},"groq":{"perMinute":30,"perDay":1000}}'
// A key is a provider name or just its family (gemini, groq). A provider with no entry has no limit, and with no AI_BUDGETS nothing is limited,
// so a missing or wrong number can never block AI by itself.
// With Redis on, the counters are shared by every server copy (one atomic Lua script reserves a call); without it, or when it fails, they count in
// this process's memory, which is exact for one server. The day starts at midnight in AI_BUDGET_DAY_TIMEZONE (default America/Los_Angeles, where
// Google resets its daily quotas); every key has an expiry.
const { getRedis, redisKey } = require('../../shared/config/redis');

// ARGV: minute limit, day limit (0 = no limit). Check both, then count both, in one step: two callers can never both take the last call.
const RESERVE = `
local minute = tonumber(redis.call('GET', KEYS[1]) or '0')
local day = tonumber(redis.call('GET', KEYS[2]) or '0')
if tonumber(ARGV[1]) > 0 and minute >= tonumber(ARGV[1]) then return 0 end
if tonumber(ARGV[2]) > 0 and day >= tonumber(ARGV[2]) then return 0 end
if redis.call('INCR', KEYS[1]) == 1 then redis.call('EXPIRE', KEYS[1], 120) end
if redis.call('INCR', KEYS[2]) == 1 then redis.call('EXPIRE', KEYS[2], 129600) end
return 1`;

let parsedFor = null;
let parsed = {};
const config = () => {
  const raw = process.env.AI_BUDGETS || '';
  if (raw === parsedFor) return parsed;
  parsedFor = raw;
  parsed = {};
  if (!raw.trim()) return parsed;
  try {
    const value = JSON.parse(raw);
    for (const [name, limits] of Object.entries(value)) {
      const perMinute = Number(limits?.perMinute) > 0 ? Math.floor(Number(limits.perMinute)) : 0;
      const perDay = Number(limits?.perDay) > 0 ? Math.floor(Number(limits.perDay)) : 0;
      if (perMinute || perDay) parsed[name] = { perMinute, perDay };
    }
  } catch {
    console.warn('AI_BUDGETS is not valid JSON: no AI budget is applied');
  }
  return parsed;
};
const limitsFor = (name) => { const all = config(); return all[name] || all[String(name).split(':')[0]] || null; };

const safe = (name) => String(name).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
const dayOf = (now) => new Intl.DateTimeFormat('en-CA', { timeZone: process.env.AI_BUDGET_DAY_TIMEZONE || 'America/Los_Angeles' }).format(new Date(now)); // 2026-11-18
const keys = (name, now) => [redisKey('aibudget', safe(name), 'min', String(Math.floor(now / 60000))), redisKey('aibudget', safe(name), 'day', dayOf(now))];

// ---- this process's memory (no Redis, or Redis failed) ----
const memory = new Map(); // key -> { n, expiresAt }
const memoryCount = (key, now) => { const entry = memory.get(key); return entry && entry.expiresAt > now ? entry.n : 0; };
const memoryAdd = (key, now, ttlMs) => {
  if (memory.size > 2000) for (const [k, v] of memory) if (v.expiresAt <= now) memory.delete(k);
  const entry = memory.get(key);
  if (entry && entry.expiresAt > now) entry.n += 1; else memory.set(key, { n: 1, expiresAt: now + ttlMs });
};

/** true = the call may be made (and is counted); false = this provider's budget is spent. { force } counts the call without checking. */
async function reserveBudget(name, { now = Date.now(), force = false } = {}) {
  const limits = limitsFor(name);
  if (!limits) return true;
  const [minuteKey, dayKey] = keys(name, now);
  const client = getRedis();
  if (client) {
    try {
      const ok = await client.eval(RESERVE, 2, minuteKey, dayKey, force ? 0 : limits.perMinute, force ? 0 : limits.perDay);
      return Number(ok) === 1;
    } catch { /* Redis failed: count here */ }
  }
  if (!force && ((limits.perMinute && memoryCount(minuteKey, now) >= limits.perMinute) || (limits.perDay && memoryCount(dayKey, now) >= limits.perDay))) return false;
  memoryAdd(minuteKey, now, 120000);
  memoryAdd(dayKey, now, 129600000);
  return true;
}

/** Look without counting: is there budget left for this provider? */
async function hasBudget(name, now = Date.now()) {
  const limits = limitsFor(name);
  if (!limits) return true;
  const [minuteKey, dayKey] = keys(name, now);
  const client = getRedis();
  let minute;
  let day;
  if (client) {
    try { [minute, day] = (await client.mget(minuteKey, dayKey)).map((v) => Number(v || 0)); } catch { minute = undefined; }
  }
  if (minute === undefined) { minute = memoryCount(minuteKey, now); day = memoryCount(dayKey, now); }
  return !((limits.perMinute && minute >= limits.perMinute) || (limits.perDay && day >= limits.perDay));
}

const resetBudgetMemory = () => memory.clear();

module.exports = { reserveBudget, hasBudget, resetBudgetMemory, RESERVE };
