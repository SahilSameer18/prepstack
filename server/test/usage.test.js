// GET /api/usage: the "used / allowed today" numbers the forms show. They must match the limits the real checks enforce.
const t = require('./helpers/setup');
const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const limits = require('../src/config/limits');

const HOUR = 60 * 60 * 1000;
const RESUME_TEXT = [
  'Priya Example, final year computer science student',
  'Built TaskFlow, a task manager, with React hooks and a Node.js REST API. Stored data in MongoDB with indexes.',
  'Fixed 14 UI bugs as a web development intern and added two Express.js endpoints with validation and tests.',
  'Skills: JavaScript, React, Node.js, Express.js, MongoDB, Git. Solved 220 problems on LeetCode this year.',
].join('\n');
const JD = 'Junior Full Stack Developer. You will build features across the stack. Must have: React, Node.js, MongoDB, Docker.';
const ENV_KEYS = ['AI_DAILY_LIMIT', 'ANALYZER_DAILY_LIMIT'];
const SAVED_ENV = {};
let Project, Report;
const oid = (id) => new t.mongoose.Types.ObjectId(id);
const usage = async (acct) => (await t.api.get('/api/usage', { cookies: acct.cookies })).body.data;
const addProjects = (acct, n, ageMs = 1000) => Project.collection.insertMany(Array.from({ length: n }, (_, i) => ({ user: oid(acct.id), title: `p${i}`, createdAt: new Date(Date.now() - ageMs), updatedAt: new Date() })));
const addReports = (acct, n, ageMs = 1000) => Report.collection.insertMany(Array.from({ length: n }, () => ({ user: oid(acct.id), title: 't', jobDescription: 'j', days: 7, score: 50, createdAt: new Date(Date.now() - ageMs), updatedAt: new Date() })));

describe('GET /api/usage', () => {
  before(async () => { await t.start(); ({ Project } = t.getModels()); Report = t.mongoose.model('InterviewReport'); });
  after(() => t.stop());
  beforeEach(() => { for (const k of ENV_KEYS) { SAVED_ENV[k] = process.env[k]; delete process.env[k]; } t.gemini.reset(); t.groq.reset(); });
  afterEach(() => { for (const k of ENV_KEYS) { if (SAVED_ENV[k] === undefined) delete process.env[k]; else process.env[k] = SAVED_ENV[k]; } });

  it('401 when not logged in', async () => {
    assert.equal((await t.api.get('/api/usage')).status, 401);
  });

  it('a new user has used nothing, and the allowed numbers are the limit constants (15 ideas, 5 reports)', async () => {
    const acct = await t.register();
    const u = await usage(acct);
    assert.deepEqual(u, { projects: { used: 0, allowed: 15, resetsAt: null }, reports: { used: 0, allowed: 5, resetsAt: null } });
    assert.equal(u.projects.allowed, limits.projectsPerDay());
    assert.equal(u.reports.allowed, limits.reportsPerDay());
  });

  it('counts only the last 24 hours, and only this user\'s own items', async () => {
    const acct = await t.register(); const other = await t.register();
    await addProjects(acct, 2); await addProjects(acct, 3, 25 * HOUR); await addProjects(other, 4);
    await addReports(acct, 1); await addReports(acct, 2, 25 * HOUR); await addReports(other, 3);
    const u = await usage(acct);
    assert.equal(u.projects.used, 2);
    assert.equal(u.reports.used, 1);
  });

  it('resetsAt is when the oldest item in the window drops out (24 hours after it was made)', async () => {
    const acct = await t.register();
    const oldest = Date.now() - 5 * HOUR;
    await addProjects(acct, 1, 5 * HOUR); await addProjects(acct, 1, 1 * HOUR);
    const u = await usage(acct);
    assert.ok(Math.abs(new Date(u.projects.resetsAt).getTime() - (oldest + 24 * HOUR)) < 2000);
    assert.equal(u.reports.resetsAt, null);
  });

  it('follows the environment settings for the daily limits', async () => {
    process.env.AI_DAILY_LIMIT = '3'; process.env.ANALYZER_DAILY_LIMIT = '2';
    const acct = await t.register();
    const u = await usage(acct);
    assert.equal(u.projects.allowed, 3);
    assert.equal(u.reports.allowed, 2);
  });

  it('when it says used = allowed for ideas, generating really is refused (429) before any AI call', async () => {
    process.env.AI_DAILY_LIMIT = '2';
    const acct = await t.register();
    await addProjects(acct, 2);
    const u = await usage(acct);
    assert.equal(u.projects.used, u.projects.allowed);
    const res = await t.api.post('/api/project/generate', { cookies: acct.cookies, body: { techStack: 'MERN Stack', complexity: 'beginner' } });
    assert.equal(res.status, 429);
    assert.match(res.body.message, /limit of 2 project ideas per 24 hours/);
    assert.equal(t.gemini.calls, 0);
  });

  it('when it says used = allowed for reports, creating one really is refused (429) before any AI call', async () => {
    process.env.ANALYZER_DAILY_LIMIT = '2';
    const acct = await t.register();
    await addReports(acct, 2);
    const u = await usage(acct);
    assert.equal(u.reports.used, u.reports.allowed);
    const res = await t.api.post('/api/analyzer', { cookies: acct.cookies, body: { jobDescription: JD, resumeText: RESUME_TEXT, days: 7, consent: true } });
    assert.equal(res.status, 429);
    assert.match(res.body.message, /limit of 2 reports per 24 hours/);
    assert.equal(t.gemini.calls, 0);
  });

  it('one more allowed than used: the real request is not refused for the daily limit', async () => {
    process.env.AI_DAILY_LIMIT = '2';
    t.gemini.reply = t.goodIdea();
    const acct = await t.register();
    await addProjects(acct, 1);
    assert.equal((await usage(acct)).projects.used, 1);
    const res = await t.api.post('/api/project/generate', { cookies: acct.cookies, body: { techStack: 'MERN Stack', complexity: 'beginner' } });
    assert.equal(res.status, 201);
    assert.equal((await usage(acct)).projects.used, 2);
  });
});
