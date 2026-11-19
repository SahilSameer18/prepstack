// Phase 5 through HTTP and the AI service: the login-related limiters count in Redis (and keep their old rules about WHICH requests count),
// the "being generated now" lock is shared with other servers, and an open AI breaker is shared. Redis is ioredis-mock (the Lua is real).
const t = require('./helpers/setup');
const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const RedisMock = require('ioredis-mock');
const path = require('node:path');
const redisConfig = require('../src/shared/config/redis');

const ai = require(path.join(t.SERVER_ROOT, 'src', 'services', 'ai.service.js'));
const { MODELS: M, gemini, apiError, goodIdea } = t;
const VALID = { techStack: 'MERN Stack', complexity: 'beginner' };
const rl = (name, id) => redisConfig.redisKey('rl', name, id);

describe('login-related limiters on Redis', () => {
  let redis;
  before(async () => { await t.start(); });
  after(async () => { redisConfig.setRedisForTests(null); await t.stop(); });
  beforeEach(async () => { redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); delete process.env.RATE_LIMIT_MEMORY_ONLY; });
  afterEach(() => redisConfig.setRedisForTests(null));

  const failedLogin = (ip, i) => t.api.post('/api/auth/login', { body: { email: `nobody${i}@example.com`, password: 'Wrong1234x' }, ip });

  it('login: 10 FAILED attempts from one address are allowed, the 11th is refused, and the count lives in Redis', async () => {
    const ip = '203.0.113.10';
    for (let i = 0; i < 10; i += 1) assert.equal((await failedLogin(ip, i)).status, 401);
    assert.equal(await redis.zcard(rl('login', ip)), 10);
    assert.equal((await failedLogin(ip, 11)).status, 429);
    assert.equal((await failedLogin('203.0.113.11', 1)).status, 401, 'another address is not affected');
  });

  it('login: successful logins do not count (a whole college behind one address can still log in)', async () => {
    const acct = await t.register();
    const ip = '203.0.113.20';
    for (let i = 0; i < 14; i += 1) assert.equal((await t.api.post('/api/auth/login', { body: { email: acct.email, password: acct.password }, ip })).status, 200);
    assert.equal(await redis.zcard(rl('login', ip)), 0, 'each success gave its hit back');
  });

  it('the count is kept in Redis: without Redis the memory store has no history, with it back the refusal returns', async () => {
    const ip = '203.0.113.30';
    for (let i = 0; i < 10; i += 1) await failedLogin(ip, i);
    assert.equal((await failedLogin(ip, 20)).status, 429);
    redisConfig.setRedisForTests(null);
    assert.equal((await failedLogin(ip, 21)).status, 401, 'Redis is off: this server counts in memory from zero, and nothing is blocked');
    redisConfig.setRedisForTests(redis);
    assert.equal((await failedLogin(ip, 22)).status, 429, 'the shared count was never lost');
  });

  it('RATE_LIMIT_MEMORY_ONLY=login puts login back in memory, and nothing is written to Redis for it', async () => {
    process.env.RATE_LIMIT_MEMORY_ONLY = 'login';
    const ip = '203.0.113.40';
    for (let i = 0; i < 3; i += 1) await failedLogin(ip, i);
    assert.equal(await redis.exists(rl('login', ip)), 0);
    for (let i = 3; i < 10; i += 1) await failedLogin(ip, i);
    assert.equal((await failedLogin(ip, 30)).status, 429, 'it still limits, in memory');
  });

  it('sign-up: every request counts, 30 per address, the 31st is refused', async () => {
    const ip = '203.0.113.50';
    let last;
    for (let i = 0; i < 31; i += 1) last = await t.register({ ip });
    assert.equal(last.res.status, 429);
    assert.equal(Number(await redis.get(rl('register', ip))), 31);
  });

  it('forgot password: every request counts, 5 per address, the 6th is refused', async () => {
    const ip = '203.0.113.60';
    const statuses = [];
    for (let i = 0; i < 6; i += 1) statuses.push((await t.api.post('/api/auth/forgot-password', { body: { email: `x${i}@example.com` }, ip })).status);
    assert.ok(statuses.slice(0, 5).every((status) => status !== 429), 'the first five are answered (whatever the mail setup says): ' + statuses.join(','));
    assert.equal(statuses[5], 429);
  });

  it('every limiter key has an expiry', async () => {
    await failedLogin('203.0.113.70', 1);
    await t.api.post('/api/auth/forgot-password', { body: { email: 'a@example.com' }, ip: '203.0.113.70' });
    const keys = await redis.keys('*:rl:*');
    assert.ok(keys.length >= 2);
    for (const key of keys) assert.ok((await redis.pttl(key)) > 0, `${key} has no expiry`);
  });
});

describe('every limiter counts in Redis, and keeps its own rule about which requests count', () => {
  let redis;
  before(async () => { await t.start(); await t.seedSheets(); });
  after(async () => { redisConfig.setRedisForTests(null); await t.stop(); });
  beforeEach(async () => { redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); delete process.env.RATE_LIMIT_MEMORY_ONLY; delete process.env.RATE_LIMIT_REDIS; gemini.reset(); gemini.reply = goodIdea(); });
  afterEach(() => { redisConfig.setRedisForTests(null); delete process.env.RATE_LIMIT_REDIS; });

  it('all 14 limiters use the Redis store: none was left on the default in-memory store', () => {
    const { limiterNames } = require('../src/shared/http/rateLimit.middleware');
    assert.deepEqual([...limiterNames].sort(), ['account-action', 'ai-project', 'analyzer', 'forgot-password', 'link-google', 'login', 'plan-change', 'plan-generate', 'plan-preview', 'plan-tick', 'problem-note', 'refresh', 'register', 'reset-password']);
  });

  it('plan preview (public, per address): every request counts, 20 a minute, the 21st is refused', async () => {
    const ip = '198.51.100.10';
    const body = { goalType: 'placements', style: 'one-topic', weeks: 4, weekdayHours: 2, weekendHours: 3, restDay: null, sheetSlug: 'blind-75', subjects: ['os'] };
    const statuses = [];
    for (let i = 0; i < 21; i += 1) statuses.push((await t.api.post('/api/plan/preview', { body, ip })).status);
    assert.ok(statuses.slice(0, 20).every((status) => status === 200), statuses.join(','));
    assert.equal(statuses[20], 429);
    assert.equal(Number(await redis.get(rl('plan-preview', ip))), 21);
  });

  it('project ideas: only SAVED ideas count (failed attempts give their hit back), 4 an hour per user, keyed by user id', async () => {
    const acct = await t.register();
    const gen = () => t.api.post('/api/project/generate', { cookies: acct.cookies, body: VALID });
    gemini.error = apiError(400, 'bad');
    for (let i = 0; i < 3; i += 1) assert.notEqual((await gen()).status, 201);
    assert.equal(Number((await redis.get(rl('ai-project', acct.id))) || 0), 0, 'three failures left no hits behind');
    gemini.error = null;
    for (let i = 0; i < 4; i += 1) assert.equal((await gen()).status, 201);
    assert.equal(Number(await redis.get(rl('ai-project', acct.id))), 4);
    assert.equal((await gen()).status, 429);
    const other = await t.register();
    assert.equal((await t.api.post('/api/project/generate', { cookies: other.cookies, body: VALID })).status, 201, 'another user is not affected');
  });

  it('problem notes: per signed-in user; counted in memory by default (a Redis count costs about 36 ms), in Redis when RATE_LIMIT_REDIS names it', async () => {
    const acct = await t.register();
    const save = () => t.api.put('/api/problem-notes', { cookies: acct.cookies, body: { problemLink: t.L('two-sum'), pattern: 'Two Pointers', approach: 'Sort first.' } });
    assert.equal((await save()).status, 200);
    assert.equal(await redis.exists(rl('problem-note', acct.id)), 0, 'default: no Redis round trip');
    process.env.RATE_LIMIT_REDIS = 'problem-note';
    assert.equal((await save()).status, 200);
    assert.equal(Number(await redis.get(rl('problem-note', acct.id))), 1, 'opted in: counted in Redis');
  });

  it('plan generates count in Redis, and plan ticks per signed-in user in memory unless opted in', async () => {
    const acct = await t.register();
    const made = await t.api.post('/api/plan', { cookies: acct.cookies, body: { goalType: 'placements', style: 'one-topic', weeks: 4, weekdayHours: 2, weekendHours: 3, restDay: null, sheetSlug: 'blind-75', subjects: [] } });
    assert.equal(made.status, 201);
    assert.equal(Number(await redis.get(rl('plan-generate', acct.id))), 1, 'a saved plan counts once');
    const itemId = made.body.data.plan.items[0].id;
    await t.api.patch('/api/plan/items/' + itemId, { cookies: acct.cookies, body: { starred: true } });
    assert.equal(await redis.exists(rl('plan-tick', acct.id)), 0, 'plan ticks count in memory by default');
    process.env.RATE_LIMIT_REDIS = 'plan-tick';
    await t.api.patch('/api/plan/items/' + itemId, { cookies: acct.cookies, body: { starred: true } });
    assert.equal(Number(await redis.get(rl('plan-tick', acct.id))), 1, 'opted in: counted in Redis');
  });
});

describe('the "being generated now" lock is shared between servers', () => {
  let redis;
  before(async () => { await t.start(); });
  after(async () => { redisConfig.setRedisForTests(null); await t.stop(); });
  beforeEach(async () => { redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); gemini.reset(); gemini.reply = goodIdea(); });
  afterEach(() => redisConfig.setRedisForTests(null));
  const gen = (acct) => t.api.post('/api/project/generate', { cookies: acct.cookies, body: VALID });

  it('a lock held by another server blocks this one with a 409; once it is gone the idea is made', async () => {
    const acct = await t.register();
    const key = redisConfig.redisKey('lock', 'project', acct.id);
    await redis.set(key, 'another-server', 'PX', 60000);
    assert.equal((await gen(acct)).status, 409);
    assert.equal(gemini.calls, 0, 'no AI call was made');
    await redis.del(key);
    assert.equal((await gen(acct)).status, 201);
  });

  it('a double click makes one idea, and the lock is released afterwards', async () => {
    const acct = await t.register();
    gemini.script[M.primary] = [{ reply: goodIdea(), delayMs: 120 }];
    const [a, b] = await Promise.all([gen(acct), gen(acct)]);
    assert.deepEqual([a.status, b.status].sort(), [201, 409]);
    assert.equal(await redis.exists(redisConfig.redisKey('lock', 'project', acct.id)), 0);
    gemini.script = {};
    assert.equal((await gen(acct)).status, 201);
  });

  it('the lock is released even when the AI fails', async () => {
    const acct = await t.register();
    gemini.error = apiError(400, 'bad');
    await gen(acct);
    assert.equal(await redis.exists(redisConfig.redisKey('lock', 'project', acct.id)), 0);
  });
});

describe('the AI circuit breaker is shared', () => {
  let redis;
  const P = `gemini:${M.primary}`;
  const sharedKey = (name) => redisConfig.redisKey('breaker', name.toLowerCase().replace(/[^a-z0-9-]+/g, '-'));
  before(async () => { await t.start(); });
  after(async () => { redisConfig.setRedisForTests(null); await t.stop(); });
  beforeEach(async () => { redis = new RedisMock(); await redis.flushall(); redisConfig.setRedisForTests(redis); gemini.reset(); gemini.reply = goodIdea(); });
  afterEach(() => redisConfig.setRedisForTests(null));

  it('a provider another server found failing is skipped here', async () => {
    await redis.set(sharedKey(P), String(Date.now() + 60000), 'PX', 60000);
    await ai.generateProjectIdea({ techStack: 'MERN Stack', complexity: 'beginner', domain: '', notes: '' });
    assert.deepEqual(gemini.models, [M.fallback], 'the primary model was not called');
  });

  it('a provider that fails here is published for the others, with an expiry', async () => {
    gemini.script[M.primary] = [{ error: apiError(429, '{"error":{"code":429,"message":"quota","details":[{"retryDelay":"30s"}]}}') }];
    await ai.generateProjectIdea({ techStack: 'MERN Stack', complexity: 'beginner', domain: '', notes: '' });
    await t.sleep(30);
    const until = Number(await redis.get(sharedKey(P)));
    assert.ok(until > Date.now(), 'the open-until time is in Redis');
    assert.ok((await redis.pttl(sharedKey(P))) > 0);
  });

  it('an expired shared mark does not skip the provider', async () => {
    await redis.set(sharedKey(P), String(Date.now() - 1000));
    await ai.generateProjectIdea({ techStack: 'MERN Stack', complexity: 'beginner', domain: '', notes: '' });
    assert.deepEqual(gemini.models, [M.primary]);
  });

  it('without Redis each server keeps its own state, as before', async () => {
    redisConfig.setRedisForTests(null);
    gemini.script[M.primary] = [{ error: apiError(401) }];
    await ai.generateProjectIdea({ techStack: 'MERN Stack', complexity: 'beginner', domain: '', notes: '' });
    await ai.generateProjectIdea({ techStack: 'MERN Stack', complexity: 'beginner', domain: '', notes: '' });
    assert.deepEqual(gemini.models, [M.primary, M.fallback, M.fallback]);
  });
});
