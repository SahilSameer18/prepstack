const { z } = require('zod');
const { TIME_COMPLEXITIES, SPACE_COMPLEXITIES, COMMON_PATTERNS, APPROACH_MAX } = require('../data/problemNoteOptions');
const { PROBLEM_NOTE_IMPORT_BATCH } = require('../config/limits');

// A choice from the drawer's chips, or '' for "not set"
const choice = (list, label) => z.enum([...list, ''], { error: `${label} must be one of the choices or empty` }).default('');

const noteFields = {
  problemLink: z.string({ error: 'Problem link is required' }).trim().url('Problem link must be a valid URL').max(500, 'Problem link is too long'),
  pattern: choice(COMMON_PATTERNS, 'Pattern'),
  timeComplexity: choice(TIME_COMPLEXITIES, 'Time complexity'),
  spaceComplexity: choice(SPACE_COMPLEXITIES, 'Space complexity'),
  approach: z.string({ error: 'Approach must be text' }).max(APPROACH_MAX, `Your note is too long. Keep it under ${APPROACH_MAX} characters.`).default(''),
};

const isEmpty = (n) => !n.pattern && !n.timeComplexity && !n.spaceComplexity && !n.approach.trim();

// Save one note: the whole note is replaced. A note with nothing in it is not saved (delete it instead).
const upsertNoteSchema = z.object(noteFields).refine((n) => !isEmpty(n), { message: 'The note is empty. Delete it instead.', path: ['approach'] });

// Move the notes that were kept in the browser to the account. updatedAt is the browser's time in milliseconds.
const importNotesSchema = z.object({
  notes: z.array(z.object({ ...noteFields, updatedAt: z.number().int().min(0).optional() }))
    .min(1, 'Send at least one note')
    .max(PROBLEM_NOTE_IMPORT_BATCH, `Send at most ${PROBLEM_NOTE_IMPORT_BATCH} notes at a time`),
});

const deleteNoteSchema = z.object({
  problemLink: z.string({ error: 'Problem link is required' }).trim().min(1).max(500, 'Problem link is too long'),
});

module.exports = { upsertNoteSchema, importNotesSchema, deleteNoteSchema, isEmpty };
