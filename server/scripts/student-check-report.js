// Read-only report for the student check (docs/research/STUDENT_CHECK.md): counts per participant, never emails, passwords or notes.
// Run from server/:  node scripts/student-check-report.js username1 username2 ...
const mongoose = require('mongoose');

const DAY_MS = 24 * 60 * 60 * 1000;

/** Counts for one person, from their user record and their plans (plain objects). */
function summarize(user, plans, now = new Date()) {
  const items = plans.flatMap((p) => p.items || []);
  const done = items.filter((i) => i.doneAt);
  const days = new Set(done.map((i) => i.completedStudyDay || new Date(i.doneAt).toISOString().slice(0, 10)));
  const lastActive = (user.refreshTokens || []).map((t) => t.lastActive).filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0] || null;
  const newest = [...plans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
  return {
    username: user.username,
    planMade: newest ? new Date(newest.createdAt).toISOString().slice(0, 10) : null,
    plans: { active: plans.filter((p) => p.status === 'active').length, paused: plans.filter((p) => p.status === 'paused').length, finished: plans.filter((p) => p.status === 'finished').length },
    tasksPlanned: items.filter((i) => !i.skipped).length,
    tasksDone: done.length,
    doneLast7Days: done.filter((i) => now - new Date(i.doneAt) <= 7 * DAY_MS).length,
    daysWithATaskDone: days.size,
    reviewsDone: items.filter((i) => i.lastReviewDay).length,
    skipped: items.filter((i) => i.skipped).length,
    moved: items.filter((i) => i.locked && i.plannedDay && i.plannedDay !== i.day).length,
    lastSessionActive: lastActive ? new Date(lastActive).toISOString().slice(0, 10) : null,
  };
}

module.exports = { summarize };

if (require.main === module) {
  const names = process.argv.slice(2);
  if (!names.length) { console.error('Usage: node scripts/student-check-report.js username1 username2 ...'); process.exit(1); }
  const connectDB = require('../src/shared/config/seedConfig'); // loads server/.env itself
  (async () => {
    await connectDB();
    const users = mongoose.connection.collection('users');
    const plansCollection = mongoose.connection.collection('plans');
    const rows = [];
    for (const name of names) {
      const user = await users.findOne({ username: name }, { projection: { username: 1, refreshTokens: { lastActive: 1 } } });
      if (!user) { rows.push({ username: name, note: 'not found' }); continue; }
      const plans = await plansCollection.find({ user: user._id }).toArray();
      rows.push(summarize(user, plans));
    }
    console.table(rows.map((r) => ({ ...r, plans: r.plans && `${r.plans.active}a/${r.plans.paused}p/${r.plans.finished}f` })));
    await mongoose.disconnect();
  })().catch((err) => { console.error('Report failed:', err.message); process.exit(1); });
}
