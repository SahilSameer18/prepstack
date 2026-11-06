// Account deletion on a MongoDB REPLICA SET (what Atlas is): this exercises the real multi-document transaction path.
// The standalone-MongoDB fallback path is covered in user.test.js. Slower to start, so kept to a few focused tests.
const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

let User, Project, Progress, ExtraOwned;

describe('Account deletion on a replica set (transaction path)', () => {
  before(async () => {
    await t.start({ replSet: true });
    ({ User, Project, Progress } = t.getModels());
    await t.seedSheets();
    ExtraOwned = t.mongoose.model('ExtraOwnedRs', new t.mongoose.Schema({ user: { type: t.mongoose.Schema.Types.ObjectId, ref: 'User' } }));
  });
  after(() => t.stop());

  it('deletes the user and all their data in one transaction', async () => {
    const victim = await t.register(); const bystander = await t.register();
    for (const a of [victim, bystander]) {
      await t.api.post('/api/sheets/blind-75/progress', { cookies: a.cookies, body: { problemLink: t.L('two-sum') } });
      await Project.create({ title: 't', tagline: 't', description: 'd', techStack: 'x', difficulty: 'Beginner', user: a.id });
      await ExtraOwned.create({ user: a.id });
    }
    const res = await t.api.del('/api/user/account', { cookies: victim.cookies, body: { password: victim.password } });
    assert.equal(res.status, 200);
    assert.equal(await User.exists({ _id: victim.id }), null);
    assert.equal(await Progress.countDocuments({ user: victim.id }), 0);
    assert.equal(await Project.countDocuments({ user: victim.id }), 0);
    assert.equal(await ExtraOwned.countDocuments({ user: victim.id }), 0);
    assert.ok(await User.exists({ _id: bystander.id }));
    assert.equal(await Project.countDocuments({ user: bystander.id }), 1);
  });

  it('a wrong password deletes nothing', async () => {
    const acct = await t.register();
    await Project.create({ title: 't', tagline: 't', description: 'd', techStack: 'x', difficulty: 'Beginner', user: acct.id });
    assert.equal((await t.api.del('/api/user/account', { cookies: acct.cookies, body: { password: 'WrongPass1' } })).status, 401);
    assert.ok(await User.exists({ _id: acct.id }));
    assert.equal(await Project.countDocuments({ user: acct.id }), 1);
  });

  it('the app works normally on a replica set (register, refresh race, toggle race)', async () => {
    const acct = await t.register();
    const refreshes = await Promise.all(Array.from({ length: 5 }, () => t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } })));
    assert.ok(refreshes.every((r) => r.status === 200));
    const toggles = await Promise.all(Array.from({ length: 4 }, () => t.api.post('/api/sheets/blind-75/progress', { cookies: acct.cookies, body: { problemLink: t.L('3sum') } })));
    assert.ok(toggles.every((r) => r.status === 200));
    assert.equal((await Progress.findOne({ user: acct.id })).solvedProblems.length, 0);
  });
});
