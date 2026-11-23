// Reuse the published roadmap's topics and checkpoints. All of these activities
// share its existing learning estimate; subdivision must never add study hours.
const INTRO_MINUTES = 60;
const PRACTICE_MINUTES = 30;
const CHECKPOINT_MINUTES = 15;
const SETUP_MINUTES = 90; // a planning estimate, not a measured learning time

function shareMinutes(total, count, index) {
  return Math.floor(total / count) + Number(index < total % count);
}

// Installing a tool must not receive the same multi-hour share as learning
// React or Python. Keep setup bounded and redistribute the remaining estimate.
function topicBudgets(topics, total) {
  const setup = topics.map(topic => /^(Starting a project with Vite|Virtual environments and installing packages)/.test(topic));
  const capped = setup.map(isSetup => isSetup ? Math.min(SETUP_MINUTES, Math.floor(total / topics.length)) : 0);
  const remaining = total - capped.reduce((sum, minutes) => sum + minutes, 0);
  const count = setup.filter(isSetup => !isSetup).length;
  if (!count) return topics.map((_, index) => shareMinutes(total, topics.length, index));
  let index = 0;
  return capped.map((minutes, topic) => setup[topic] ? minutes : shareMinutes(remaining, count, index++));
}

function roadmapMilestones(step, roadmapSlug) {
  const total = Math.round(((step.from + step.to) / 2) * 60);
  const topics = step.topics?.length ? step.topics : [step.title];
  const checkpoints = step.checkpoint || [];
  const checkpointRoom = Math.min(checkpoints.length * CHECKPOINT_MINUTES, Math.floor(total / 5));
  const budgets = topicBudgets(topics, total - checkpointRoom);
  const items = [];
  function add(id, title, minutes, activity, objective) {
    if (minutes <= 0) return;
    items.push({
      type: 'roadmap', ref: `roadmap:${roadmapSlug}`, stepId: step.id,
      milestoneId: id, title, plannedMinutes: minutes, activity, objective,
      core: true,
    });
  }
  topics.forEach((topic, index) => {
    const room = budgets[index];
    const practice = Math.min(PRACTICE_MINUTES, Math.floor(room / 3));
    const introduction = Math.min(INTRO_MINUTES, room - practice);
    const prefix = `topic-${index + 1}`;
    add(`${prefix}-learn`, `Learn: ${topic}`, introduction, 'learn', step.goal);
    add(`${prefix}-practice`, `Practise: ${topic}`, practice, 'practice',
      'Work through a small example from the linked material. Explain each step in your own words, then check it against the material.');
    add(`${prefix}-apply`, `Apply and review: ${topic}`, room - introduction - practice, 'practice',
      'Continue the examples for this topic. Try them without looking at the answer, check your work, and revisit anything you could not explain.');
  });
  // End-of-step checkpoints can depend on several topics, so they stay after
  // those topics. Early practice above never jumps to an untaught topic.
  checkpoints.forEach((checkpoint, index) => {
    add(`checkpoint-${index + 1}`, checkpoint,
      shareMinutes(checkpointRoom, checkpoints.length, index), 'checkpoint',
      'Try this checkpoint independently, then compare your work with the linked roadmap resources.');
  });
  return items;
}

module.exports = { roadmapMilestones };
