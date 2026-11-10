const ProblemNote = require('../models/problemNote.model');
const DSASheet = require('../models/sheets.model');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseFormatter');
const { deleteNoteSchema, isEmpty } = require('../validators/problemNotes.validators');

const FIELDS = ['pattern', 'timeComplexity', 'spaceComplexity', 'approach'];
const present = (n) => ({ problemLink: n.problemLink, pattern: n.pattern, timeComplexity: n.timeComplexity, spaceComplexity: n.spaceComplexity, approach: n.approach, updatedAt: n.updatedAt });
const pick = (n) => Object.fromEntries(FIELDS.map((f) => [f, n[f]]));

// Which of these links belong to a problem in some sheet. A note for any other link is refused, so nobody can fill the
// database with notes for made-up addresses (the same rule as the solved-problem toggle).
const linksInSheets = async (links) => {
  const found = await DSASheet.aggregate([
    { $match: { 'topics.problems.link': { $in: links } } },
    { $unwind: '$topics' },
    { $unwind: '$topics.problems' },
    { $match: { 'topics.problems.link': { $in: links } } },
    { $group: { _id: '$topics.problems.link' } },
  ]);
  return new Set(found.map((f) => f._id));
};

// GET /api/problem-notes
const listNotes = async (req, res, next) => {
  try {
    const notes = await ProblemNote.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(2000).lean();
    return sendSuccess(res, 200, 'Notes fetched successfully', { notes: notes.map(present) });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/problem-notes   body: one whole note. One atomic upsert; two first saves at once retry once on the unique index.
const upsertNote = async (req, res, next) => {
  try {
    const { problemLink } = req.body;
    if (!(await linksInSheets([problemLink])).has(problemLink)) return next(new AppError(400, 'This problem is not part of any sheet'));
    const run = () => ProblemNote.findOneAndUpdate(
      { user: req.user._id, problemLink },
      { $set: pick(req.body) },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    let note;
    try {
      note = await run();
    } catch (err) {
      if (err.code !== 11000) throw err;
      note = await run();
    }
    return sendSuccess(res, 200, 'Note saved successfully', { note: present(note) });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/problem-notes?problemLink=...   Deleting a note for a link that left the sheets (after a re-seed) is allowed.
const deleteNote = async (req, res, next) => {
  try {
    const parsed = deleteNoteSchema.safeParse(req.query);
    if (!parsed.success) return next(new AppError(400, 'Problem link is required'));
    const { deletedCount } = await ProblemNote.deleteOne({ user: req.user._id, problemLink: parsed.data.problemLink });
    return sendSuccess(res, 200, 'Note deleted successfully', { deleted: deletedCount === 1 });
  } catch (error) {
    return next(error);
  }
};

// POST /api/problem-notes/import   body { notes: [...] } (at most 15)
// The one-time move of notes that were kept in the browser. It only ADDS: a note the account already has, even an older one, is
// never overwritten, so an import can never destroy something written on another device. The original time is kept.
const importNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const known = await linksInSheets(notes.map((n) => n.problemLink));
    let added = 0; let kept = 0; let skipped = 0;
    for (const n of notes) {
      if (!known.has(n.problemLink) || isEmpty(n)) { skipped++; continue; }
      const at = new Date(n.updatedAt ?? Date.now());
      try {
        const r = await ProblemNote.updateOne(
          { user: req.user._id, problemLink: n.problemLink },
          { $setOnInsert: { ...pick(n), createdAt: at, updatedAt: at } },
          { upsert: true, timestamps: false }
        );
        if (r.upsertedCount) added++; else kept++;
      } catch (err) {
        if (err.code !== 11000) throw err;
        kept++; // a parallel request just created it
      }
    }
    return sendSuccess(res, 200, 'Notes imported successfully', { added, kept, skipped });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listNotes, upsertNote, deleteNote, importNotes };
