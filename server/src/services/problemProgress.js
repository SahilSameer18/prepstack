const Progress = require('../models/progress.model');
const { problemIdentity, normalizedSolves } = require('../utils/problemIdentity');

// Normalize legacy aliases inside the atomic update, not in a read/replace
// cycle. Concurrent toggles continue to operate on the latest stored array.
function normalizedListExpression(entries) {
  const aliases = [...new Set(entries.map((entry) => entry.link))];
  const branches = aliases.filter((link) => link !== problemIdentity(link)).map((link) => ({
    case: { $eq: ['$$entry.link', { $literal: link }] },
    then: { $literal: problemIdentity(link) },
  }));
  const canonical = branches.length
    ? { $switch: { branches, default: '$$entry.link' } }
    : '$$entry.link';
  const earlier = {
    $cond: [
      { $and: [
        { $ne: [{ $ifNull: ['$$this.solvedAt', null] }, null] },
        { $or: [
          { $eq: [{ $ifNull: ['$$previous.solvedAt', null] }, null] },
          { $lt: ['$$this.solvedAt', '$$previous.solvedAt'] },
        ] },
      ] },
      '$$this', '$$previous',
    ],
  };
  return {
    $reduce: {
      input: { $map: {
        input: { $ifNull: ['$solvedProblems', []] }, as: 'entry',
        in: { $mergeObjects: ['$$entry', { link: canonical }] },
      } },
      initialValue: [],
      in: { $let: {
        vars: { previous: { $arrayElemAt: [{ $filter: { input: '$$value', as: 'record', cond: { $eq: ['$$record.link', '$$this.link'] } } }, 0] } },
        in: { $cond: [
          { $in: ['$$this.link', { $map: { input: '$$value', as: 'record', in: '$$record.link' } }] },
          { $map: { input: '$$value', as: 'record', in: { $cond: [{ $eq: ['$$record.link', '$$this.link'] }, earlier, '$$record'] } } },
          { $concatArrays: ['$$value', ['$$this']] },
        ] },
      } },
    },
  };
}

// mode is chosen by server code: toggle, done or undone. Return the actual
// pre-write state so a failed plan save can compensate only its own change.
async function writeProblemProgress({ user, sheetSlug, link, mode, session = null, studyDay = null }) {
  const canonical = problemIdentity(link);
  const filter = { user, sheetSlug };
  const options = session ? { session } : {};
  const snapshot = await Progress.findOne(filter, null, options).lean();
  if (!snapshot && mode === 'undone') return { changed: false, previous: null, progress: { ...filter, solvedProblems: [] } };
  const literal = { $literal: canonical };
  const present = { $in: [literal, { $map: { input: '$$list', as: 'entry', in: '$$entry.link' } }] };
  const remove = { $filter: { input: '$$list', as: 'entry', cond: { $ne: ['$$entry.link', literal] } } };
  const record = { link: literal, solvedAt: new Date() };
  if (studyDay) record.studyDay = { $literal: studyDay };
  const add = { $cond: [present, '$$list', { $concatArrays: ['$$list', [record]] }] };
  const next = mode === 'toggle' ? { $cond: [present, remove, add] } : mode === 'done' ? add : remove;
  const pipeline = [{ $set: {
    solvedProblems: { $let: { vars: { list: normalizedListExpression(snapshot?.solvedProblems || []) }, in: next } },
    createdAt: { $ifNull: ['$createdAt', '$$NOW'] },
  } }];
  let before;
  try {
    before = await Progress.findOneAndUpdate(filter, pipeline, { ...options, upsert: true, updatePipeline: true, returnDocument: 'before' }).lean();
  } catch (error) {
    if (error.code !== 11000) throw error;
    before = await Progress.findOneAndUpdate(filter, pipeline, { ...options, updatePipeline: true, returnDocument: 'before' }).lean();
  }
  const previous = normalizedSolves(before?.solvedProblems).find((entry) => entry.link === canonical);
  const changed = mode === 'toggle' || (mode === 'done' ? !previous : !!previous);
  const progress = await Progress.findOne(filter, null, options).lean();
  return { changed, previous: previous?.solvedAt ?? null, previousStudyDay: previous?.studyDay ?? null, progress };
}

module.exports = { writeProblemProgress };
