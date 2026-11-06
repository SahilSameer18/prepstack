const t = require('./helpers/setup');
const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

let Project;
const VALID = { techStack: 'MERN', complexity: 'beginner' };
const gen = (acct, body = VALID, opts = {}) => t.api.post('/api/project/generate', { cookies: acct.cookies, body, ...opts });

describe('AI project ideas: generate, list, open, delete', () => {
  before(async () => { await t.start(); ({ Project } = t.getModels()); });
  after(() => t.stop());
  beforeEach(() => { t.gemini.reset(); t.gemini.reply = t.goodIdea(); });

  describe('POST /api/project/generate: success', () => {
    it('saves the idea for the logged-in user and returns it (201)', async () => {
      const acct = await t.register();
      const res = await gen(acct, { techStack: 'MERN', complexity: 'beginner', domain: 'Fintech', notes: 'keep it small' });
      assert.equal(res.status, 201);
      const p = res.body.data.project;
      assert.equal(p.title, 'Test Idea');
      assert.deepEqual(p.features, ['f1', 'f2']);
      assert.equal(p.difficulty, 'Intermediate');
      assert.equal(p.domain, 'Fintech');
      assert.equal(String(p.user), acct.id);
      assert.ok(!('__v' in p));
      assert.equal(res.body.project.title, 'Test Idea'); // legacy top-level copy
      assert.equal(await Project.countDocuments({ user: acct.id }), 1);
    });
    it('sends the user options to Gemini, defaulting domain/notes when they are blank', async () => {
      const acct = await t.register();
      await gen(acct, { techStack: 'Go + Postgres', complexity: 'advanced' });
      assert.match(t.gemini.lastPrompt, /Techstack: Go \+ Postgres/);
      assert.match(t.gemini.lastPrompt, /Complexity: advanced/);
      assert.match(t.gemini.lastPrompt, /Domain: General/);
      assert.match(t.gemini.lastPrompt, /Extra Notes: None/);
    });
    it('tells Gemini the exact JSON shape (a real schema, not an empty one)', async () => {
      const acct = await t.register();
      await gen(acct);
      const schema = t.gemini.lastConfig.responseJsonSchema;
      assert.equal(t.gemini.lastConfig.responseMimeType, 'application/json');
      assert.equal(schema.type, 'object');
      assert.deepEqual(Object.keys(schema.properties).sort(), ['description', 'difficulty', 'estimatedTime', 'features', 'resumeValue', 'tagline', 'techStack', 'title']);
      assert.deepEqual(schema.properties.difficulty.enum, ['Beginner', 'Intermediate', 'Advanced']);
      assert.ok(!('$schema' in schema));
    });
    it('accepts all three difficulties from Gemini', async () => {
      const acct = await t.register();
      for (const difficulty of ['Beginner', 'Intermediate', 'Advanced']) {
        t.gemini.reply = t.goodIdea({ difficulty });
        // a fresh user each time so the 4/hour limit is not what we are testing
        const u = await t.register();
        const res = await gen(u);
        assert.equal(res.status, 201); assert.equal(res.body.data.project.difficulty, difficulty);
      }
      void acct;
    });
    it('drops unknown extra fields Gemini adds instead of saving them', async () => {
      t.gemini.reply = t.goodIdea({ hack: 'x', user: 'someone-else' });
      const acct = await t.register();
      const res = await gen(acct);
      assert.equal(res.status, 201);
      assert.ok(!('hack' in res.body.data.project));
      assert.equal(String(res.body.data.project.user), acct.id); // the owner is always the caller
    });
  });

  describe('POST /api/project/generate: bad AI output is rejected and never saved', () => {
    const cases = [
      ['not JSON at all', 'sorry, I cannot do that', /invalid response/],
      ['an empty/blocked reply', undefined, /invalid response/],
      ['features is a string, not a list', () => t.goodIdea({ features: 'just one string' }), /incomplete response/],
      ['features contains numbers', () => t.goodIdea({ features: [1, 2] }), /incomplete response/],
      ['title missing', () => { const x = t.goodIdea(); delete x.title; return x; }, /incomplete response/],
      ['title empty', () => t.goodIdea({ title: '' }), /incomplete response/],
      ['difficulty is not one of the three', () => t.goodIdea({ difficulty: 'banana' }), /incomplete response/],
      ['difficulty "Medium"', () => t.goodIdea({ difficulty: 'Medium' }), /incomplete response/],
      ['the reply is a JSON array', () => [t.goodIdea()], /incomplete response/],
      ['the reply is JSON null', 'null', /incomplete response/],
    ];
    for (const [label, reply, message] of cases) {
      it(`${label} -> 502, nothing saved`, async () => {
        t.gemini.reply = typeof reply === 'function' ? reply() : reply;
        const acct = await t.register();
        const res = await gen(acct);
        assert.equal(res.status, 502);
        assert.match(res.body.message, message);
        assert.equal(await Project.countDocuments({ user: acct.id }), 0);
      });
    }
    it('Gemini itself failing (quota, network) -> 502 "unavailable", nothing saved', async () => {
      t.gemini.error = new Error('429 quota exceeded');
      const acct = await t.register();
      const res = await gen(acct);
      assert.equal(res.status, 502);
      assert.match(res.body.message, /unavailable right now/);
      assert.equal(await Project.countDocuments({ user: acct.id }), 0);
    });
  });

  describe('POST /api/project/generate: input validation and access', () => {
    const rejects = [
      ['nothing sent', {}, 'Tech stack is required'],
      ['no complexity', { techStack: 'MERN' }, 'Complexity is required'],
      ['tech stack too short', { techStack: 'a', complexity: 'beginner' }, 'Tech stack must be at least 2 characters'],
      ['tech stack too long', { techStack: 'x'.repeat(201), complexity: 'beginner' }, 'Tech stack cannot exceed 200 characters'],
      ['unknown complexity', { techStack: 'MERN', complexity: 'banana' }, 'Complexity must be one of: beginner, intermediate, advanced'],
      ['domain too long', { techStack: 'MERN', complexity: 'beginner', domain: 'd'.repeat(101) }, 'Domain cannot exceed 100 characters'],
      ['notes too long', { techStack: 'MERN', complexity: 'beginner', notes: 'n'.repeat(501) }, 'Notes cannot exceed 500 characters'],
    ];
    for (const [label, body, message] of rejects) {
      it(`rejects: ${label} (422) and never calls Gemini`, async () => {
        const acct = await t.register();
        const res = await gen(acct, body);
        assert.equal(res.status, 422);
        assert.equal(res.body.message, message);
        assert.equal(t.gemini.calls, 0);
      });
    }
    it('accepts complexity in any letter case', async () => {
      const acct = await t.register();
      assert.equal((await gen(acct, { techStack: 'MERN', complexity: 'ADVANCED' })).status, 201);
    });
    it('requires login (401) and does not call Gemini', async () => {
      const res = await t.api.post('/api/project/generate', { body: VALID });
      assert.equal(res.status, 401);
      assert.equal(t.gemini.calls, 0);
    });
  });

  describe('rate limit: 4 ideas per hour per user (protects the paid Gemini quota)', () => {
    it('allows 4, then answers 429 with a clear message', async () => {
      const acct = await t.register();
      const statuses = [];
      for (let i = 0; i < 6; i++) statuses.push((await gen(acct)).status);
      assert.deepEqual(statuses, [201, 201, 201, 201, 429, 429]);
      const blocked = await gen(acct);
      assert.match(blocked.body.message, /Too many Project idea generation requests/);
    });
    it('does NOT count failed requests (validation errors, Gemini failures)', async () => {
      const acct = await t.register();
      for (let i = 0; i < 6; i++) assert.equal((await gen(acct, {})).status, 422);
      t.gemini.error = new Error('boom');
      for (let i = 0; i < 3; i++) assert.equal((await gen(acct)).status, 502);
      t.gemini.error = null;
      const statuses = [];
      for (let i = 0; i < 5; i++) statuses.push((await gen(acct)).status);
      assert.deepEqual(statuses, [201, 201, 201, 201, 429]);
    });
    it('counts per USER, not per IP: another user on the same IP is not blocked', async () => {
      const a = await t.register(); const b = await t.register();
      const ip = '203.0.113.80';
      for (let i = 0; i < 4; i++) await gen(a, VALID, { ip });
      assert.equal((await gen(a, VALID, { ip })).status, 429);
      assert.equal((await gen(b, VALID, { ip })).status, 201);
    });
  });

  describe('GET /api/project (list) and GET /api/project/:id', () => {
    it('lists only my ideas, newest first, with the card fields (not the full text)', async () => {
      const acct = await t.register(); const other = await t.register();
      for (const title of ['First', 'Second', 'Third']) { t.gemini.reply = t.goodIdea({ title }); await gen(acct); await t.sleep(5); }
      t.gemini.reply = t.goodIdea({ title: 'Not mine' }); await gen(other);
      const res = await t.api.get('/api/project', { cookies: acct.cookies });
      assert.equal(res.status, 200);
      assert.deepEqual(res.body.data.projects.map((p) => p.title), ['Third', 'Second', 'First']);
      assert.deepEqual(Object.keys(res.body.data.projects[0]).sort(), ['_id', 'createdAt', 'difficulty', 'domain', 'features', 'tagline', 'techStack', 'title']);
    });
    it('returns an empty list for a new user', async () => {
      const acct = await t.register();
      assert.deepEqual((await t.api.get('/api/project', { cookies: acct.cookies })).body.data.projects, []);
    });
    it('opens one of my ideas in full', async () => {
      const acct = await t.register();
      const created = (await gen(acct)).body.data.project;
      const res = await t.api.get(`/api/project/${created._id}`, { cookies: acct.cookies });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.project.description, 'desc');
      assert.equal(res.body.data.project.resumeValue, 'resume value');
    });
    it("cannot open ANOTHER user's idea (404, same as not found)", async () => {
      const owner = await t.register(); const intruder = await t.register();
      const created = (await gen(owner)).body.data.project;
      assert.equal((await t.api.get(`/api/project/${created._id}`, { cookies: intruder.cookies })).status, 404);
    });
    it('400 for a malformed id, 404 for a well-formed id that does not exist', async () => {
      const acct = await t.register();
      const bad = await t.api.get('/api/project/not-an-id', { cookies: acct.cookies });
      assert.equal(bad.status, 400); assert.equal(bad.body.message, 'Invalid project ID format');
      assert.equal((await t.api.get(`/api/project/${new t.mongoose.Types.ObjectId()}`, { cookies: acct.cookies })).status, 404);
    });
    it('both endpoints require login (401)', async () => {
      assert.equal((await t.api.get('/api/project')).status, 401);
      assert.equal((await t.api.get(`/api/project/${new t.mongoose.Types.ObjectId()}`)).status, 401);
    });
    it('still lists, opens and deletes an OLD idea saved before difficulty was restricted', async () => {
      const acct = await t.register();
      const old = await Project.collection.insertOne({ title: 'Legacy', tagline: 't', description: 'd', techStack: 'x', difficulty: 'Medium', features: [], user: new t.mongoose.Types.ObjectId(acct.id), createdAt: new Date(), updatedAt: new Date() });
      assert.ok((await t.api.get('/api/project', { cookies: acct.cookies })).body.data.projects.some((p) => p.title === 'Legacy'));
      assert.equal((await t.api.get(`/api/project/${old.insertedId}`, { cookies: acct.cookies })).body.data.project.difficulty, 'Medium');
      assert.equal((await t.api.del(`/api/project/${old.insertedId}`, { cookies: acct.cookies })).status, 200);
    });
  });

  describe('DELETE /api/project/:id', () => {
    it('deletes my idea', async () => {
      const acct = await t.register();
      const created = (await gen(acct)).body.data.project;
      const res = await t.api.del(`/api/project/${created._id}`, { cookies: acct.cookies });
      assert.equal(res.status, 200);
      assert.equal(await Project.countDocuments({ user: acct.id }), 0);
      assert.equal((await t.api.del(`/api/project/${created._id}`, { cookies: acct.cookies })).status, 404); // already gone
    });
    it("cannot delete ANOTHER user's idea (404) and it survives", async () => {
      const owner = await t.register(); const intruder = await t.register();
      const created = (await gen(owner)).body.data.project;
      assert.equal((await t.api.del(`/api/project/${created._id}`, { cookies: intruder.cookies })).status, 404);
      assert.equal(await Project.countDocuments({ user: owner.id }), 1);
    });
    it('400 for a malformed id; 401 without login', async () => {
      const acct = await t.register();
      assert.equal((await t.api.del('/api/project/not-an-id', { cookies: acct.cookies })).status, 400);
      assert.equal((await t.api.del(`/api/project/${new t.mongoose.Types.ObjectId()}`)).status, 401);
    });
  });

  describe('Project model rules', () => {
    const base = (user) => ({ title: 't', tagline: 't', description: 'd', techStack: 'x', user });
    it('only accepts Beginner / Intermediate / Advanced as difficulty', async () => {
      const user = new t.mongoose.Types.ObjectId();
      for (const d of ['Beginner', 'Intermediate', 'Advanced']) await Project.create({ ...base(user), difficulty: d });
      for (const d of ['Medium', 'banana', 'beginner', '']) {
        await assert.rejects(Project.create({ ...base(user), difficulty: d }), (e) => e.name === 'ValidationError' && 'difficulty' in e.errors, `difficulty ${JSON.stringify(d)} should be rejected`);
      }
    });
    it('refuses a project with no owner (it could never be deleted with its user)', async () => {
      await assert.rejects(Project.create({ ...base(undefined), difficulty: 'Beginner' }), /user: Path `user` is required/);
    });
  });
});
