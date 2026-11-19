// Ticking a plan item on a MongoDB REPLICA SET (what Atlas is): the plan and the sheet progress are written in one transaction, so a failure
// in either leaves both as they were. The single-server path (write the sheet first, put it back if the plan cannot be saved) is in plan-items.test.js.
const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

let Plan, Progress;
describe('Plan ticks on a replica set (transaction path)', () => {
  before(async () => {
    await t.start({ replSet: true });
    Plan = t.mongoose.model('Plan');
    Progress = t.mongoose.model('Progress');
    await Plan.init();
  });
  after(() => t.stop());

  it('notes publishing rolls back a failure after deletion, validates first, then replaces successfully', async () => {
    const Notes = t.mongoose.model('Notes');
    const { publishNotes } = require('../src/modules/notes/notesSeed');
    await Notes.init();
    await Notes.create({ subject: 'Previous notes', subjectSlug: 'previous', sections: [] });
    const before = await Notes.find({}).lean();
    await assert.rejects(publishNotes([{ subject: '', subjectSlug: 'os', sections: [] }]), /problems/);
    assert.deepEqual(await Notes.find({}).lean(), before);
    const os = require('../src/modules/notes/content/os');
    const replacement = [{ subject: os.subject, subjectSlug: 'os', sections: os.sections }];
    const insert = Notes.insertMany;
    Notes.insertMany = async () => { throw new Error('replacement failed'); };
    try { await assert.rejects(publishNotes(replacement), /replacement failed/); }
    finally { Notes.insertMany = insert; }
    assert.deepEqual(await Notes.find({}).lean(), before, 'deletion was rolled back');
    await publishNotes(replacement);
    assert.deepEqual((await Notes.find({}).lean()).map((n) => n.subjectSlug), ['os']);
  });

  const make = async () => {
    const acct = await t.register();
    const res = await t.api.post('/api/plan', { cookies: acct.cookies, body: { goalType: 'placements', style: 'one-topic', weeks: 4, weekdayHours: 3, weekendHours: 5, restDay: 6, sheetSlug: 'blind-75', subjects: ['os'] } });
    assert.equal(res.status, 201);
    return { acct, item: res.body.data.plan.items.find((i) => i.type === 'dsa') };
  };
  const tick = (acct, id, body) => t.api.patch(`/api/plan/items/${id}`, { cookies: acct.cookies, body });
  const solved = async (acct, item) => (await Progress.findOne({ user: acct.id, sheetSlug: item.sheet }))?.solvedProblems.some((p) => p.link === item.link) ?? false;

  it('rolls back sprint archiving when resuming the main plan fails in a transaction', async () => {
    const { acct } = await make();
    const main = await Plan.findOne({ user: acct.id });
    async function apply(body) {
      const preview = await t.api.post('/api/plan/lifecycle/preview', { cookies: acct.cookies, body });
      assert.equal(preview.status, 200);
      return t.api.post('/api/plan/lifecycle/apply', { cookies: acct.cookies, body: { ...body, checksum: preview.body.data.checksum } });
    }
    assert.equal((await apply({ type: 'pause' })).status, 200);
    const sprint = await Plan.create({ ...main.toObject(), _id: undefined, title: 'Sprint', status: 'active', items: [] });
    const update = Plan.updateOne;
    Plan.updateOne = function(filter, ...args) {
      if (String(filter._id) === String(main._id) && filter.status === 'paused') throw new Error('Resume failed');
      return update.call(this, filter, ...args);
    };
    try {
      assert.equal((await apply({ type: 'resume', planId: String(main._id) })).status, 500);
    } finally { Plan.updateOne = update; }
    assert.equal((await Plan.findById(sprint._id)).status, 'active');
    assert.equal((await Plan.findById(main._id)).status, 'paused');
    assert.equal((await apply({ type: 'resume', planId: String(main._id) })).status, 200);
    assert.equal((await Plan.findById(sprint._id)).status, 'finished');
    assert.equal((await Plan.findById(main._id)).status, 'active');
  });

  it('a tick writes the plan and the sheet together, and an untick removes the problem from the sheet', async () => {
    const { acct, item } = await make();
    assert.equal((await tick(acct, item.id, { done: true, result: 'hints' })).status, 200);
    assert.equal((await Plan.findOne({ user: acct.id })).items.id(item.id).result, 'hints');
    assert.equal(await solved(acct, item), true);
    assert.equal((await tick(acct, item.id, { done: false })).status, 200);
    assert.equal(await solved(acct, item), false);
  });

  it('if the sheet write fails, the plan write is rolled back (nothing is half done)', async () => {
    const { acct, item } = await make();
    const original = Progress.collection.findOneAndUpdate;
    Progress.collection.findOneAndUpdate = async () => { throw new Error('the database went away'); };
    try {
      assert.equal((await tick(acct, item.id, { done: true, result: 'alone' })).status, 500);
    } finally { Progress.collection.findOneAndUpdate = original; }
    assert.equal((await Plan.findOne({ user: acct.id })).items.id(item.id).doneAt, null, 'the plan was rolled back');
    assert.equal(await solved(acct, item), false);
  });
});
