// The app-wide AI budget (src/services/aiBudget.js, phase 6 R2): the Lua reservation runs for real on ioredis-mock, the memory fallback is tested
// without Redis, and the provider cascade must skip a spent provider without calling it, but never turn a wrong number into "AI is down".
const t = require('./helpers/setup');
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const RedisMock = require('ioredis-mock');
const redisConfig = require('../src/config/redis');
const { reserveBudget, hasBudget, resetBudgetMemory } = require('../src/services/aiBudget');

const ai = require(path.join(t.SERVER_ROOT, 'src', 'services', 'ai.service.js'));
const { MODELS: M, gemini, goodIdea } = t;
const set = (budgets) => { process.env.AI_BUDGETS = JSON.stringify(budgets); };
const T0 = Date.UTC(2026, 10, 18, 12, 0, 30); // 18 Nov 2026, 12:00:30 UTC
const MINUTE = 60000;
const DAY = 24 * 60 * MINUTE;

describe('AI budget reservation', () => {
  let redis;
  beforeEach(async () => { redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); resetBudgetMemory(); delete process.env.AI_BUDGETS; delete process.env.AI_BUDGET_DAY_TIMEZONE; });
  afterEach(() => { redisConfig.setRedisForTests(null); resetBudgetMemory(); delete process.env.AI_BUDGETS; });

  it('does nothing without AI_BUDGETS: always allowed, nothing written', async () => {
    for (let i = 0; i < 50; i += 1) assert.equal(await reserveBudget('gemini:x', { now: T0 }), true);
    assert.equal(await hasBudget('gemini:x', T0), true);
    assert.equal((await redis.keys('*aibudget*')).length, 0);
  });

  it('a provider with no entry has no limit, even when others do', async () => {
    set({ 'gemini:a': { perMinute: 1 } });
    assert.equal(await reserveBudget('gemini:a', { now: T0 }), true);
    assert.equal(await reserveBudget('gemini:a', { now: T0 }), false);
    for (let i = 0; i < 10; i += 1) assert.equal(await reserveBudget('groq:b', { now: T0 }), true);
  });

  it('per minute: the limit is allowed, the next is refused, and the next minute starts again', async () => {
    set({ 'gemini:a': { perMinute: 5 } });
    const results = [];
    for (let i = 0; i < 6; i += 1) results.push(await reserveBudget('gemini:a', { now: T0 }));
    assert.deepEqual(results, [true, true, true, true, true, false]);
    assert.equal(await reserveBudget('gemini:a', { now: T0 + MINUTE }), true);
  });

  it('per day: spread over minutes it still runs out, and the next day starts again (the day follows the configured time zone)', async () => {
    set({ 'gemini:a': { perDay: 3 } });
    for (let i = 0; i < 3; i += 1) assert.equal(await reserveBudget('gemini:a', { now: T0 + i * 10 * MINUTE }), true);
    assert.equal(await reserveBudget('gemini:a', { now: T0 + 40 * MINUTE }), false);
    assert.equal(await reserveBudget('gemini:a', { now: T0 + DAY }), true);
    // 05:00 UTC is still the day before in Los Angeles (UTC-8): the same budget day as 23:00 UTC the day before
    process.env.AI_BUDGET_DAY_TIMEZONE = 'America/Los_Angeles';
    set({ 'gemini:b': { perDay: 1 } });
    assert.equal(await reserveBudget('gemini:b', { now: Date.UTC(2026, 10, 18, 23, 0) }), true);
    assert.equal(await reserveBudget('gemini:b', { now: Date.UTC(2026, 10, 19, 5, 0) }), false, 'same Los Angeles day');
    assert.equal(await reserveBudget('gemini:b', { now: Date.UTC(2026, 10, 19, 9, 0) }), true, 'after Los Angeles midnight');
  });

  it('50 simultaneous reservations against a limit of 5 allow exactly 5 (atomic)', async () => {
    set({ 'gemini:a': { perMinute: 5, perDay: 100 } });
    const results = await Promise.all(Array.from({ length: 50 }, () => reserveBudget('gemini:a', { now: T0 })));
    assert.equal(results.filter(Boolean).length, 5);
  });

  it('a family key (gemini, groq) covers every model, and an exact key wins over it', async () => {
    set({ gemini: { perMinute: 2 }, 'gemini:special': { perMinute: 5 } });
    assert.equal(await reserveBudget('gemini:other', { now: T0 }), true);
    assert.equal(await reserveBudget('gemini:other', { now: T0 }), true);
    assert.equal(await reserveBudget('gemini:other', { now: T0 }), false);
    for (let i = 0; i < 5; i += 1) assert.equal(await reserveBudget('gemini:special', { now: T0 }), true);
    assert.equal(await reserveBudget('gemini:special', { now: T0 }), false);
  });

  it('hasBudget looks without counting, and { force } counts without checking', async () => {
    set({ 'gemini:a': { perMinute: 2 } });
    for (let i = 0; i < 10; i += 1) assert.equal(await hasBudget('gemini:a', T0), true);
    await reserveBudget('gemini:a', { now: T0 }); await reserveBudget('gemini:a', { now: T0 });
    assert.equal(await hasBudget('gemini:a', T0), false);
    assert.equal(await reserveBudget('gemini:a', { now: T0, force: true }), true, 'forced past the limit');
  });

  it('the count is kept in Redis: a restart (empty memory) does not reset it', async () => {
    set({ 'gemini:a': { perMinute: 2 } });
    await reserveBudget('gemini:a', { now: T0 }); await reserveBudget('gemini:a', { now: T0 });
    resetBudgetMemory();
    assert.equal(await reserveBudget('gemini:a', { now: T0 }), false);
  });

  it('every key has an expiry', async () => {
    set({ 'gemini:a': { perMinute: 5, perDay: 20 } });
    await reserveBudget('gemini:a');
    const found = await redis.keys('*aibudget*');
    assert.equal(found.length, 2);
    for (const key of found) assert.ok((await redis.pttl(key)) > 0, key);
  });

  it('counts in memory without Redis, and when Redis fails; invalid settings mean no limit', async () => {
    set({ 'gemini:a': { perMinute: 2 } });
    for (const client of [null, Object.assign(new RedisMock(), { eval: async () => { throw new Error('connection lost'); }, mget: async () => { throw new Error('connection lost'); } })]) {
      redisConfig.setRedisForTests(client);
      resetBudgetMemory();
      assert.deepEqual([await reserveBudget('gemini:a', { now: T0 }), await reserveBudget('gemini:a', { now: T0 }), await reserveBudget('gemini:a', { now: T0 })], [true, true, false]);
      assert.equal(await hasBudget('gemini:a', T0), false);
    }
    const warn = console.warn; console.warn = () => {};
    try { process.env.AI_BUDGETS = '{not json'; assert.equal(await reserveBudget('gemini:a', { now: T0 }), true); } finally { console.warn = warn; }
  });
});

describe('the provider cascade and the AI budget', () => {
  const PARAMS = { techStack: 'MERN Stack', complexity: 'beginner', domain: '', notes: '' };
  let redis;
  beforeEach(async () => { redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); resetBudgetMemory(); gemini.reset(); gemini.reply = goodIdea(); delete process.env.AI_BUDGETS; });
  afterEach(() => { redisConfig.setRedisForTests(null); resetBudgetMemory(); delete process.env.AI_BUDGETS; gemini.reset(); });

  it('a spent provider is skipped without a call, and the next provider answers', async () => {
    set({ [`gemini:${M.primary}`]: { perDay: 1 } });
    await ai.generateProjectIdea(PARAMS);
    assert.deepEqual(gemini.models, [M.primary]);
    await ai.generateProjectIdea(PARAMS);
    assert.deepEqual(gemini.models, [M.primary, M.fallback], 'the primary model was not called a second time');
  });

  it('when EVERY provider is spent it tries them anyway (a wrong number can never mean "AI is down")', async () => {
    set({ gemini: { perDay: 1 } });
    for (let i = 0; i < 3; i += 1) await ai.generateProjectIdea(PARAMS);
    assert.deepEqual(gemini.models, [M.primary, M.fallback, M.fallback2], 'one call each, then all three are spent');
    await ai.generateProjectIdea(PARAMS);
    assert.equal(gemini.models.length, 4, 'the fourth request still reached a provider');
    assert.equal(gemini.models[3], M.primary);
  });

  it('with no budget set every call goes to the primary model, as before', async () => {
    for (let i = 0; i < 4; i += 1) await ai.generateProjectIdea(PARAMS);
    assert.deepEqual(gemini.models, [M.primary, M.primary, M.primary, M.primary]);
    assert.equal((await redis.keys('*aibudget*')).length, 0);
  });
});
