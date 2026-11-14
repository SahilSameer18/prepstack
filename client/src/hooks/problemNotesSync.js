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

// Reuse the same writer when a drawer remounts while a request is still in flight.
const queuesByStorage = new WeakMap();
// A single writer per problem; the account's pending snapshots include deletion tombstones.
export const createNoteSaveQueue = ({ save, remove, storage, userId, onStatus = () => {}, delay = 600, ready = Promise.resolve() }) => {
  if (!queuesByStorage.has(storage)) queuesByStorage.set(storage, new Map());
  const accountQueues = queuesByStorage.get(storage);
  if (accountQueues.has(userId)) {
    const existing = accountQueues.get(userId);
    existing.connect(onStatus, ready);
    return existing;
  }
  const storageKey = `prepstack_problem_notes_pending_v1:${userId}`;
  const pending = new Map();
  const timers = new Map();
  const running = new Map();
  const failed = new Set();
  let stopped = false;
  try {
    const saved = JSON.parse(storage.getItem(storageKey) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      for (const [link, note] of Object.entries(saved)) {
        if (note === null || (note && typeof note === 'object' && !Array.isArray(note))) pending.set(link, { note });
      }
    }
  } catch { /* Damaged or unavailable storage must not block account notes. */ }
  const persist = () => {
    try {
      if (pending.size) storage.setItem(storageKey, JSON.stringify(Object.fromEntries([...pending].map(([link, entry]) => [link, entry.note]))));
      else storage.removeItem(storageKey);
    } catch { /* Server saves still work without browser storage. */ }
  };
  const status = () => onStatus(failed.size ? 'error' : pending.size || running.size ? 'saving' : 'saved');
  const drain = (link) => {
    clearTimeout(timers.get(link)); timers.delete(link);
    if (running.has(link)) return running.get(link);
    const job = (async () => {
      while (pending.has(link) && !stopped) {
        // If a remount replaces the load/import gate while we wait, honor the newer gate too.
        let loading;
        do { loading = ready; await loading; } while (loading !== ready);
        if (stopped) break;
        const entry = pending.get(link);
        try {
          if (isEmptyNote(entry.note)) await remove(link); else await save(noteBody(link, entry.note));
          failed.delete(link);
          if (pending.get(link) === entry) pending.delete(link);
          persist();
        } catch {
          failed.add(link);
          break; // Keep the latest snapshot for an edit, reconnect or explicit flush to retry.
        }
      }
    })();
    const completion = job.finally(() => { running.delete(link); status(); });
    running.set(link, completion);
    status();
    return completion;
  };
  const queue = {
    connect(listener, loaded) { onStatus = listener; ready = loaded; stopped = false; },
    pendingNotes: () => Object.fromEntries([...pending].map(([link, entry]) => [link, entry.note])),
    enqueue(link, note) {
      if (stopped) return;
      pending.set(link, { note: isEmptyNote(note) ? null : noteBody(link, note) });
      failed.delete(link); persist();
      clearTimeout(timers.get(link));
      timers.set(link, setTimeout(() => drain(link), delay));
      status();
    },
    flush: () => Promise.all([...pending.keys()].map(drain)),
    stop() { stopped = true; for (const timer of timers.values()) clearTimeout(timer); timers.clear(); },
  };
  accountQueues.set(userId, queue);
  return queue;
};
