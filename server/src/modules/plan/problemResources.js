const crypto = require('node:crypto');
const { problemIdentity } = require('../sheets/problemIdentity');
const { problemMinutes } = require('./planGenerator');

// Independently published equivalent exercises, checked against the provider's
// question pages on 15 Nov 2026. These are resources, not copied statements.
const resources = {
  'https://leetcode.com/problems/meeting-rooms-ii/': [
    { title: 'Meeting Rooms II on NeetCode', url: 'https://neetcode.io/problems/meeting-schedule-ii/question' },
  ],
  'https://leetcode.com/problems/alien-dictionary/': [
    { title: 'Alien Dictionary on NeetCode', url: 'https://neetcode.io/problems/foreign-dictionary/question' },
  ],
};

function alternativeResources(link) {
  return resources[problemIdentity(link)] || [];
}

// Suggestions are real, unscheduled problems in the same topic. The original
// remains a distinct identity even when the learner chooses another exercise.
function substituteOptions(plan, original, data, solved) {
  if (original.type !== 'dsa') return [];
  const scheduled = new Set(plan.items.map((item) => problemIdentity(item.link)));
  const seen = new Set(scheduled);
  const options = [];
  for (const [sheetSlug, sheet] of Object.entries(data.sheets)) {
    for (const topic of sheet.topics) {
      if (topic.id !== original.topicId && topic.title.trim().toLowerCase() !== original.topicTitle?.trim().toLowerCase()) continue;
      for (const problem of topic.problems) {
        const link = problemIdentity(problem.link);
        if (seen.has(link) || solved.has(link)) continue;
        seen.add(link);
        const option = { sheetSlug, link: problem.link, title: problem.title, difficulty: problem.difficulty, topicId: topic.id, topicTitle: topic.title, plannedMinutes: Math.max(1, Math.round(problemMinutes(problem.difficulty, plan.pace) * (plan.estimateFactors?.dsa || 1))) };
        option.checksum = crypto.createHash('sha256').update(JSON.stringify({ revision: plan.updatedAt, original: original.key, option })).digest('hex').slice(0, 32);
        options.push(option);
      }
    }
  }
  return options.sort((a, b) => Number(b.difficulty === original.difficulty) - Number(a.difficulty === original.difficulty)).slice(0, 8);
}

module.exports = { alternativeResources, substituteOptions };
