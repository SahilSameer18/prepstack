// Learning evidence is self-reported. It guides optional practice, never a
// readiness score, automatic syllabus skip or silent schedule change.
const crypto = require('node:crypto');
const gen = require('./planGenerator');
const adj = require('./planAdjust');
const { problemIdentity } = require('../sheets/problemIdentity');
const { PLAN_MAX_ITEMS } = require('../../shared/config/limits');

const MAX_ATTEMPTS = 200;
function topicOf(item) {
  if (item.topicId) return item.topicId;
  // Learn/practise/apply belong to one roadmap topic. Adjacent topics in the
  // same broad step must not combine into a false repeated-difficulty signal.
  if (item.milestoneId) return `${item.stepId}:${item.milestoneId.replace(/-(learn|practice|apply)$/, '')}`;
  return item.stepId || item.ref || item.key;
}
const plain = (value) => value?.toObject ? value.toObject() : value;

// Only the evidence for this activity counts. A stray quiz score must not turn
// an assisted solve into independent work, or override a reported practice result.
function activityOutcome(item, response, kind) {
  if (kind === 'review') return response.passed ? 'independent' : 'help';
  if (item.type === 'notes' && kind !== 'practice') {
    if (response.quizScore == null) return 'completed';
    return response.quizScore >= 4 ? 'independent' : 'help';
  }
  if (response.result === 'alone') return 'independent';
  return response.result ? 'help' : 'completed';
}

function attemptLog(plan, item, response, day, now, kind = 'task') {
  const parts = plan.items.filter((part) => gen.baseId(part) === gen.baseId(item));
  const complete = parts.every((part) => part.doneAt && !part.unscheduledMinutes);
  const event = {
    key: gen.baseId(item), topic: topicOf(item), type: item.type, kind, day, at: now,
    outcome: activityOutcome(item, response, kind),
    effort: response.effort || null, complete,
    familiar: response.familiar ?? null,
    independent: response.independent ?? null, explained: response.explained ?? null, tested: response.tested ?? null,
  };
  // A retry/untick or split part cannot inflate the evidence on the same day.
  const previous = (plan.learningAttempts || []).map(plain).filter((entry) =>
    !(entry.key === event.key && entry.kind === kind && entry.day === day));
  return [...previous, event].slice(-MAX_ATTEMPTS);
}

function startingChecks(plan) {
  const checkpoint = plan.items.find((item) => item.activity === 'checkpoint');
  return [
    { id: 'foundation', title: 'Check your coding foundation', minutes: 15,
      objective: 'In your preferred language, write a function that counts occurrences of a chosen value in a list. Explain the inputs and output. Test an empty list, a missing value and repeated values. Try without a solution, then compare with the language guide.',
      link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions' },
    ...(checkpoint ? [{ id: 'role', title: `Check: ${checkpoint.title}`, minutes: checkpoint.plannedMinutes,
      objective: checkpoint.objective, ref: checkpoint.ref, stepId: checkpoint.stepId }] : []),
  ];
}

function recommendations(plan, data, solvedLinks = []) {
  const offers = [];
  const attempts = (plan.learningAttempts || []).map(plain);
  const open = (kind, topic) => plan.items.some((item) => !item.doneAt && !item.skipped
    && item.learningKind === kind && (!topic || item.topicId === topic));
  const foundations = (plan.startingChecks || []).find((check) => check.id === 'foundation');
  if (foundations?.outcome === 'help' && !open('foundation')
    && !plan.items.some((item) => item.learningKind === 'foundation' && item.doneAt)) {
    offers.push({ id: 'foundation', kind: 'foundation', title: 'Practise the foundations', minutes: 20,
      objective: 'Use the language guide to trace a function, a loop and a condition. Modify the counting exercise to count values that meet a condition. Explain the change and test empty and repeated inputs.',
      link: startingChecks(plan)[0].link });
  }
  const roleCheck = (plan.startingChecks || []).find((check) => check.id === 'role');
  const checkpoint = plan.items.find((item) => item.activity === 'checkpoint');
  if (roleCheck?.outcome === 'help' && checkpoint && !open('repair', topicOf(checkpoint))
    && !plan.items.some((item) => item.relatedKey === 'role-starting-check' && item.doneAt)) {
    offers.push({ id: 'role-starting-check', kind: 'repair', topicId: topicOf(checkpoint),
      ref: checkpoint.ref, stepId: checkpoint.stepId, title: `Practise: ${checkpoint.title}`, minutes: 20,
      objective: `${checkpoint.objective} First explain a worked example from the linked material. Then close it and try the checkpoint independently. Record which parts you could demonstrate and test.` });
  }
  const topics = [...new Set(attempts.map((entry) => entry.topic))];
  for (const topic of topics) {
    const recent = attempts.filter((entry) => entry.topic === topic && (entry.complete || entry.kind === 'review')).slice(-4);
    if (recent.filter((entry) => entry.outcome === 'help').length < 2
      || recent.slice(-2).every((entry) => entry.outcome === 'independent') || open('repair', topic)
      || offers.some((offer) => offer.kind === 'repair' && offer.topicId === topic)) continue;
    const item = plan.items.find((entry) => topicOf(entry) === topic);
    if (!item) continue;
    offers.push({ id: `repair:${item.key}:${new Date(recent.at(-1).at).getTime()}`, kind: 'repair', topicId: topic, ref: item.ref, link: item.link,
      title: `Work through: ${item.topicTitle || item.title.replace(/^(Learn|Practise|Apply and review): /, '')}`,
      minutes: item.type === 'dsa' ? Math.round(gen.problemMinutes(item.difficulty, plan.pace) * (plan.estimateFactors?.dsa || 1)) : 20,
      objective: 'Explain the idea using a small worked example. Close the explanation and try again independently. Check an ordinary input and an edge case. This is repair practice, not a quick recall review.' });
  }
  // Absent from saved progress is only a candidate for unfamiliar practice.
  // The learner still records whether they have seen it elsewhere.
  const seen = new Set([...solvedLinks, ...(plan.solvedLinks || []), ...plan.items.filter((item) => item.link).map((item) => item.link)].map(problemIdentity));
  const completedTopics = new Set(plan.items.filter((item) => item.type === 'dsa' && item.doneAt && item.result === 'alone').map((item) => item.topicId));
  const sheet = data.sheets[plan.sheetSlug];
  if (sheet && !open('transfer')) {
    const topic = sheet.topics.find((entry) => completedTopics.has(entry.id)
      && entry.problems.some((problem) => !seen.has(problemIdentity(problem.link))));
    const problem = topic?.problems.find((entry) => !seen.has(problemIdentity(entry.link)));
    if (problem) offers.push({ id: `transfer:${problemIdentity(problem.link)}`, kind: 'transfer', topicId: topic.id,
      title: `Application check: ${problem.title}`, link: problem.link,
      minutes: Math.round(gen.problemMinutes(problem.difficulty, plan.pace) * (plan.estimateFactors?.dsa || 1)),
      objective: 'Before opening the solution, explain an approach, implement it independently, test edge cases and explain time and space cost. Record whether you had seen the question before. This is a self-check, not an automatically graded assessment.' });
  }
  const ready = plan.items.filter((item) => item.doneAt && !item.unscheduledMinutes
    && plan.items.filter((part) => gen.baseId(part) === gen.baseId(item)).every((part) => part.doneAt && !part.unscheduledMinutes));
  const roleWork = ready.find((item) => item.activity === 'project' || item.activity === 'checkpoint');
  if (plan.goalType === 'role' && roleWork && !open('transfer')
    && !plan.items.some((item) => item.learningKind === 'transfer')) {
    offers.push({ id: `transfer:role:${roleWork.key}`, kind: 'transfer', title: `Apply: ${roleWork.title}`,
      ref: roleWork.ref, stepId: roleWork.stepId, minutes: 30,
      objective: `Start from the completed activity: ${roleWork.objective || roleWork.title}. Change one requirement that affects your solution. Explain what must change, implement or demonstrate the change, and test it. Record whether you have already practised this variant. This is a self-reported application exercise, not a verified unfamiliar test.` });
  }
  const rehearsalReady = plan.goalType === 'role' ? !!roleWork
    : new Set(ready.filter((item) => item.type === 'dsa' && item.result === 'alone').map(gen.baseId)).size >= 2;
  if (rehearsalReady && !open('rehearsal') && new Set(ready.map(gen.baseId)).size >= 2 && !plan.items.some((item) => item.learningKind === 'rehearsal' && !item.skipped)) {
    const project = ready.find((item) => item.activity === 'project' || item.activity === 'checkpoint');
    offers.push({ id: 'rehearsal', kind: 'rehearsal', title: plan.goalType === 'role' ? 'Rehearse your role interview' : 'Rehearse a coding interview',
      minutes: 30, ref: project?.ref, stepId: project?.stepId,
      objective: plan.goalType === 'role'
        ? `Use completed work${project ? ` (${project.title})` : ''}. Explain the problem, your decisions and trade-offs. Demonstrate the result and tests. Ask yourself what would change under a different requirement.`
        : 'Choose a completed problem. Explain the approach aloud, code without looking at your old answer, test edge cases and discuss complexity. Familiar rehearsal does not establish performance on an unseen problem.' });
  }
  for (const type of ['dsa', 'notes', 'roadmap']) {
    if (plan.originReport) break;
    const since = plan.estimateUpdatedAt?.[type];
    const unique = new Map(attempts.filter((entry) => entry.type === type && entry.kind === 'task'
      && entry.complete && entry.effort && (!since || new Date(entry.at) > new Date(since)))
      .map((entry) => [entry.key, entry]));
    const recent = [...unique.values()].slice(-5);
    if (recent.length < 5) continue;
    const direction = recent.filter((entry) => entry.effort === 'more').length >= 3 ? 1.15
      : recent.filter((entry) => entry.effort === 'less').length >= 3 ? 0.85 : 1;
    const current = plan.estimateFactors?.[type] || 1;
    const factor = Math.max(0.5, Math.min(2, Math.round(current * direction * 100) / 100));
    if (factor !== current) offers.push({ id: `estimate:${type}`, kind: 'estimate', type, factor,
      title: `Adjust ${type} time estimates`, minutes: 0,
      objective: 'Based on your last five completed activities with effort feedback. This changes estimates for unstarted work only; it does not measure elapsed study time.' });
  }
  return offers;
}

function previewLearning(stored, data, day, offer) {
  const input = { ...stored.input };
  let tasks = [];
  if (offer.kind === 'estimate') {
    input.estimateFactors = { ...input.estimateFactors, [offer.type]: offer.factor };
  } else {
    const first = day > stored.startDate ? day : stored.startDate;
    let left = offer.minutes;
    const prefix = `learning:${crypto.createHash('sha256').update(offer.id).digest('hex').slice(0, 20)}`;
    // A skipped attempt stays in history. New episodes need distinct identities;
    // counting stored rounds keeps preview and apply deterministic.
    let episode = 1;
    let key = `${prefix}:round-${episode}`;
    while (stored.items.some(item => item.ref === key || item.key.startsWith(key + ':'))) {
      episode += 1;
      key = `${prefix}:round-${episode}`;
    }
    for (let cursor = gen.dayNumber(first); cursor <= gen.dayNumber(stored.deadline) && left; cursor += 1) {
      const date = gen.ymdOf(cursor);
      // New practice uses spare fresh room. Rebuilding reserves these minutes
      // before placing ordinary content, and keeps all completed/locked work.
      const protectedMinutes = stored.items.filter((item) => !item.skipped && item.day === date
        && (item.doneAt || item.locked || item.source !== 'planner' || item.type === 'mock' || item.type === 'behavioral')).reduce((total, item) => total + item.plannedMinutes, 0);
      const budget = gen.dayBudget(adj.hoursOn(input, date));
      const reviews = adj.dueReviews(stored.items, date).reduce((sum, item) => sum + item.plannedMinutes, 0);
      const room = Math.max(0, Math.min(budget.fresh, budget.planned - reviews) - protectedMinutes);
      if (!room || (offer.kind === 'rehearsal' && room < left)) continue;
      const minutes = Math.min(room, left);
      tasks.push({ key: `${key}:${tasks.length + 1}`, type: 'custom', source: 'learning',
        learningKind: offer.kind, relatedKey: offer.id, topicId: offer.topicId,
        ref: key, materialRef: offer.ref || null, link: offer.link || null, stepId: offer.stepId,
        title: offer.title, objective: offer.objective, plannedMinutes: minutes, day: date, plannedDay: date,
        core: false, order: -1 });
      left -= minutes;
    }
    if (left) throw new gen.PlanInputError(['This practice does not fit before the deadline. Add study time or extend the plan first.']);
    if (tasks.length > 1) tasks = tasks.map((task, index) => ({ ...task, part: { n: index + 1, of: tasks.length } }));
  }
  const result = adj.previewChange({ ...stored, input, items: [...stored.items, ...tasks] }, data, day, { type: 'rebuild' });
  if (result.error) throw new gen.PlanInputError(['Extend the deadline before adding practice.']);
  if (result.plan.coverage.importOverloads?.length) throw new gen.PlanInputError(['This practice would overload the report plan. Add study time or extend the deadline first.']);
  if (result.plan.items.length > PLAN_MAX_ITEMS) throw new gen.PlanInputError(['This change exceeds the plan item limit. Choose a smaller plan first.']);
  const checksum = crypto.createHash('sha256').update(JSON.stringify({ revision: stored.revision, day, offer, items: result.plan.items, input })).digest('hex').slice(0, 32);
  const newRefs = new Set(tasks.map(task => task.ref));
  const scheduledTasks = result.plan.items.filter(item => newRefs.has(item.ref));
  return { ...result, tasks: scheduledTasks, checksum, offer };
}

module.exports = { MAX_ATTEMPTS, attemptLog, startingChecks, recommendations, previewLearning };
