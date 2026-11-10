// Pure helpers for problem notes (kept out of the hook so they can be tested without a browser).
import { TIME_COMPLEXITIES, SPACE_COMPLEXITIES, COMMON_PATTERNS, APPROACH_MAX } from '../data/problemNoteOptions';

// Before notes were saved to the account they lived in this key of the browser's localStorage: { [problemLink]: note }.
export const LOCAL_KEY = 'prepstack_problem_notes_v1';
export const IMPORT_BATCH = 15; // the server accepts at most 15 notes per import request (its body limit is 100 KB)

export const isEmptyNote = (n) => !n || !(n.pattern || n.timeComplexity || n.spaceComplexity || (n.approach || '').trim());

// The old browser notes, or {} when there are none or the stored text is damaged.
export const readLocalNotes = (storage) => {
  try {
    const parsed = JSON.parse(storage.getItem(LOCAL_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const choice = (value, list) => (list.includes(value) ? value : '');

// The browser notes as import batches. Empty notes are left out; a value that is not one of the drawer's choices becomes empty;
// a note longer than the server's limit is cut to it.
export const toImportBatches = (localMap, size = IMPORT_BATCH) => {
  const notes = Object.entries(localMap || {})
    .filter(([link, n]) => typeof link === 'string' && link && n && typeof n === 'object' && !isEmptyNote(n))
    .map(([problemLink, n]) => ({
      problemLink,
      pattern: choice(n.pattern, COMMON_PATTERNS),
      timeComplexity: choice(n.timeComplexity, TIME_COMPLEXITIES),
      spaceComplexity: choice(n.spaceComplexity, SPACE_COMPLEXITIES),
      approach: String(n.approach || '').slice(0, APPROACH_MAX),
      ...(Number.isInteger(n.updatedAt) && n.updatedAt >= 0 ? { updatedAt: n.updatedAt } : {}),
    }))
    .filter((n) => !isEmptyNote(n));
  const batches = [];
  for (let i = 0; i < notes.length; i += size) batches.push(notes.slice(i, i + size));
  return batches;
};

export const listToMap = (list) => Object.fromEntries((list || []).map((n) => [n.problemLink, n]));

// What to show: the account's notes, plus any browser note the account does not have yet (until the import has moved it).
export const mergeNotes = (localMap, serverMap) => ({ ...(localMap || {}), ...(serverMap || {}) });

// The whole note as the server wants it.
export const noteBody = (problemLink, n) => ({
  problemLink,
  pattern: n.pattern || '',
  timeComplexity: n.timeComplexity || '',
  spaceComplexity: n.spaceComplexity || '',
  approach: n.approach || '',
});
