// Disposable browser-test server. The shared harness replaces real databases, AI and email.
const t = require('./setup');
const express = require('express');
t.env({ ALLOWED_ORIGINS: 'http://localhost:5175' });
const sheets = t.sheetSeedData();
let listener;

async function start() {
  const app = await t.start();
  const { DSASheet, Notes } = t.getModels();
  await DSASheet.insertMany(sheets);
  const data = require('../../src/data/notes/os');
  await Notes.create({ subject: data.subject, subjectSlug: 'os', sections: data.sections });
  const fixture = express();
  fixture.use(express.json());
  const { planClock } = require('../../src/services/planData');
  fixture.post('/__test/clock', (req, res) => {
    const instant = req.body.now ? new Date(req.body.now) : null;
    if (instant && Number.isNaN(instant.getTime())) return res.status(400).json({ message: 'Invalid fixture date' });
    planClock.now = instant ? () => new Date(instant) : () => new Date();
    res.json({ now: planClock.now().toISOString() });
  });
  fixture.post('/__test/report', async (req, res) => {
    if (!t.mongoose.isValidObjectId(req.body.user)) return res.status(400).json({ message: 'Invalid fixture user' });
    if (!await t.getModels().User.exists({ _id: req.body.user })) return res.status(404).json({ message: 'Fixture user not found' });
    const Report = t.mongoose.model('InterviewReport');
    const report = await Report.create({
      user: req.body.user, title: 'Frontend role connection', jobDescription: 'Disposable browser fixture', days: 7, score: 60,
      plan: [
        { day: 1, items: [
          { task: 'Practice arrays from this report', ref: 'dsa:blind-75:arrays-hashing' },
          { task: 'Already finished report task', done: true, doneAt: new Date() },
        ] },
        { day: 2, items: [{ task: 'Explain a frontend tradeoff' }] },
        { day: 3, items: [{ task: 'Build a small frontend', ref: 'roadmap:frontend' }] },
      ],
    });
    res.json({ id: String(report._id) });
  });
  // This wrapper exists only in the test process, never in the deployed app.
  fixture.post('/__test/scenario', async (req, res) => {
    if (!t.mongoose.isValidObjectId(req.body.user)) return res.status(400).json({ message: 'Invalid fixture user' });
    const Plan = t.mongoose.model('Plan');
    const doc = await Plan.findOne({ user: req.body.user });
    if (!doc) return res.status(404).json({ message: 'Fixture plan not found' });
    const item = doc.items.find((entry) => entry.type === 'dsa' && !entry.part);
    item.doneAt = planClock.now();
    item.result = 'solution';
    item.reviewStage = 0;
    item.reviewLadder = 'solution';
    const user = await t.getModels().User.findById(req.body.user).lean();
    const { studyDay, calendarSettings } = require('../../src/utils/studyCalendar');
    item.reviewBaseDay = studyDay(planClock.now(), calendarSettings(user));
    item.nextReviewDay = item.reviewBaseDay;
    if (req.body.complete) doc.items = [item];
    if (req.body.expired) doc.deadline = '2020-01-01';
    await doc.save();
    res.json({ id: String(item._id) });
  });
  fixture.use(app);
  listener = fixture.listen(3100, 'localhost', () => console.log('Browser fixture ready on 3100'));
}

async function stop() {
  listener?.close();
  await t.stop();
  process.exit();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
start().catch((error) => { console.error(error); process.exit(1); });
