const { DAY_MS } = require('../config/limits');

const since = () => new Date(Date.now() - DAY_MS);

// How many items of a model (saved project ideas, saved reports) a user created in the last 24 hours.
// The controllers use this for the real limit check, and dailyUsage uses it for the numbers on the page.
const countLast24h = (Model, userId) => Model.countDocuments({ user: userId, createdAt: { $gte: since() } });

// used / allowed for the last 24 hours, and when the oldest counted item drops out of the window (one more can be made then).
const dailyUsage = async (Model, userId, allowed) => {
  const [used, oldest] = await Promise.all([
    countLast24h(Model, userId),
    Model.findOne({ user: userId, createdAt: { $gte: since() } }).sort({ createdAt: 1 }).select('createdAt').lean(),
  ]);
  return { used, allowed, resetsAt: oldest ? new Date(oldest.createdAt.getTime() + DAY_MS) : null };
};

module.exports = { countLast24h, dailyUsage };
