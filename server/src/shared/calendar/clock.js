// One clock shared by plan and progress code. Tests replace now to check study dates.
const planClock = { now: () => new Date() };

module.exports = { planClock };
