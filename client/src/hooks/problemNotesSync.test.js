import { describe, it, expect, vi } from 'vitest';
import { LOCAL_KEY, IMPORT_BATCH, isEmptyNote, readLocalNotes, toImportBatches, listToMap, mergeNotes, noteBody } from './problemNotesSync';
import { APPROACH_MAX } from '../data/problemNoteOptions';
import { createNoteSaveQueue } from './problemNotesSync';

const storage = (value) => ({ getItem: (k) => (k === LOCAL_KEY ? value : null) });
const note = (over = {}) => ({ pattern: 'Greedy', timeComplexity: 'O(N)', spaceComplexity: 'O(1)', approach: 'text', updatedAt: 1700000000000, ...over });

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const journal = (data = new Map()) => ({ getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) });
describe('ordered, recoverable note saves', () => {
  it('still saves to the server when browser storage is unavailable', async () => {
    const blocked = () => { throw new Error('storage blocked'); };
    const save = vi.fn().mockResolvedValue(), states = [];
    const q = createNoteSaveQueue({ save, remove: vi.fn(), storage: { getItem: blocked, setItem: blocked, removeItem: blocked }, userId: 'a', onStatus: (s) => states.push(s), delay: 60000 });
    q.enqueue('link', { approach: 'server copy' }); await q.flush();
    expect(save).toHaveBeenCalledTimes(1); expect(states.at(-1)).toBe('saved'); q.stop();
  });
  it('serializes edits to one problem and does not say saved while a newer write is pending', async () => {
    const first = deferred(), second = deferred();
    const save = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const states = [];
    const store = journal();
    const q = createNoteSaveQueue({ save, remove: vi.fn(), storage: store, userId: 'a', onStatus: (s) => states.push(s), delay: 60000 });
    q.enqueue('link', { approach: 'old' });
    expect(store.getItem('prepstack_problem_notes_pending_v1:a')).toContain('old');
    const done = q.flush(); await Promise.resolve();
    q.enqueue('link', { approach: 'new' });
    void q.flush();
    expect(save).toHaveBeenCalledTimes(1);
    first.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][0].approach).toBe('new');
    expect(states.at(-1)).toBe('saving');
    expect(store.getItem('prepstack_problem_notes_pending_v1:a')).toContain('new');
    second.resolve(); await done;
    expect(states.at(-1)).toBe('saved');
    expect(store.getItem('prepstack_problem_notes_pending_v1:a')).toBeNull();
    q.stop();
  });
  it('queues a clear after the running save so the deleted note cannot return', async () => {
    const waiting = deferred(); const events = [];
    const q = createNoteSaveQueue({ save: async () => { events.push('save'); await waiting.promise; }, remove: async () => events.push('delete'), storage: journal(), userId: 'a', delay: 60000 });
    q.enqueue('link', { approach: 'old' }); const done = q.flush(); await Promise.resolve();
    q.enqueue('link', null); void q.flush();
    expect(events).toEqual(['save']);
    waiting.resolve(); await done;
    expect(events).toEqual(['save', 'delete']); q.stop();
  });
  it('tracks all in-flight problems before reporting saved', async () => {
    const a = deferred(), b = deferred(); const states = [];
    const q = createNoteSaveQueue({ save: (n) => n.problemLink === 'a' ? a.promise : b.promise, remove: vi.fn(), storage: journal(), userId: 'a', onStatus: (s) => states.push(s), delay: 60000 });
    q.enqueue('a', { approach: 'A' }); q.enqueue('b', { approach: 'B' });
    const done = q.flush(); await Promise.resolve(); a.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(states.at(-1)).toBe('saving'); b.resolve(); await done;
    expect(states.at(-1)).toBe('saved'); q.stop();
  });
  it('retains failed edits and deletion tombstones across reload, isolated by account, and retries', async () => {
    const data = new Map(), states = [];
    const q = createNoteSaveQueue({ save: async () => { throw new Error('offline'); }, remove: async () => { throw new Error('offline'); }, storage: journal(data), userId: 'a', onStatus: (s) => states.push(s), delay: 60000 });
    q.enqueue('edit', { approach: 'recover me' }); q.enqueue('clear', null); await q.flush();
    expect(states.at(-1)).toBe('error'); q.stop();
    const other = createNoteSaveQueue({ save: vi.fn(), remove: vi.fn(), storage: journal(data), userId: 'b' });
    expect(other.pendingNotes()).toEqual({}); other.stop();
    const save = vi.fn().mockResolvedValue(), remove = vi.fn().mockResolvedValue();
    const restored = createNoteSaveQueue({ save, remove, storage: journal(data), userId: 'a' });
    expect(restored.pendingNotes().edit.approach).toBe('recover me');
    expect(restored.pendingNotes().clear).toBeNull();
    await restored.flush(); expect(save).toHaveBeenCalledTimes(1); expect(remove).toHaveBeenCalledWith('clear');
    expect(data.size).toBe(0); restored.stop();
  });
  it('reuses an in-flight writer on remount and waits for imports before sending a newer edit', async () => {
    const first = deferred(), loaded = deferred(), store = journal();
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue();
    const q = createNoteSaveQueue({ save, remove: vi.fn(), storage: store, userId: 'a', delay: 60000 });
    q.enqueue('link', { approach: 'old' }); const done = q.flush(); await Promise.resolve();
    q.stop();
    const remounted = createNoteSaveQueue({ save, remove: vi.fn(), storage: store, userId: 'a', ready: loaded.promise, delay: 60000 });
    expect(remounted).toBe(q);
    remounted.enqueue('link', { approach: 'new' }); void remounted.flush();
    first.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(save).toHaveBeenCalledTimes(1);
    loaded.resolve(); await done;
    expect(save.mock.calls.map(([n]) => n.approach)).toEqual(['old', 'new']); remounted.stop();
  });
  it('stops queued requests on account changes while keeping recoverable text', async () => {
    const save = vi.fn(), store = journal();
    const q = createNoteSaveQueue({ save, remove: vi.fn(), storage: store, userId: 'a', delay: 60000 });
    q.enqueue('link', { approach: 'private' }); q.stop(); await q.flush();
    expect(save).not.toHaveBeenCalled();
    expect(store.getItem('prepstack_problem_notes_pending_v1:a')).toContain('private');
  });
  it('waits for the new import gate when a remount replaces a still-pending load', async () => {
    const oldLoad = deferred(), newLoad = deferred(), store = journal(), save = vi.fn().mockResolvedValue();
    const q = createNoteSaveQueue({ save, remove: vi.fn(), storage: store, userId: 'a', ready: oldLoad.promise, delay: 60000 });
    q.enqueue('link', { approach: 'old' }); const done = q.flush(); q.stop();
    const mounted = createNoteSaveQueue({ save, remove: vi.fn(), storage: store, userId: 'a', ready: newLoad.promise, delay: 60000 });
    mounted.enqueue('link', { approach: 'new' });
    oldLoad.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(save).not.toHaveBeenCalled();
    newLoad.resolve(); await done;
    expect(save).toHaveBeenCalledTimes(1); expect(save.mock.calls[0][0].approach).toBe('new'); mounted.stop();
  });
});

describe('isEmptyNote', () => {
  it('is empty when every part is empty or only spaces', () => {
    expect(isEmptyNote({ pattern: '', timeComplexity: '', spaceComplexity: '', approach: '  ' })).toBe(true);
    expect(isEmptyNote({})).toBe(true);
    expect(isEmptyNote(undefined)).toBe(true);
  });
  it('is not empty when any part is filled', () => {
    expect(isEmptyNote({ approach: 'x' })).toBe(false);
    expect(isEmptyNote({ pattern: 'Greedy' })).toBe(false);
    expect(isEmptyNote({ spaceComplexity: 'O(1)' })).toBe(false);
  });
});

describe('readLocalNotes', () => {
  it('reads the old browser notes', () => {
    expect(readLocalNotes(storage(JSON.stringify({ 'https://a.dev/x': note() })))).toEqual({ 'https://a.dev/x': note() });
  });
  it('gives {} for nothing, damaged text, an array or a non-object', () => {
    expect(readLocalNotes(storage(null))).toEqual({});
    expect(readLocalNotes(storage('{oops'))).toEqual({});
    expect(readLocalNotes(storage('[1,2]'))).toEqual({});
    expect(readLocalNotes(storage('5'))).toEqual({});
  });
  it('gives {} when the browser refuses to read storage', () => {
    expect(readLocalNotes({ getItem: () => { throw new Error('blocked'); } })).toEqual({});
  });
});

describe('toImportBatches', () => {
  it('makes batches of at most 15, in order, nothing lost', () => {
    const map = Object.fromEntries(Array.from({ length: 37 }, (_, i) => [`https://a.dev/${i}`, note()]));
    const batches = toImportBatches(map);
    expect(batches.map((b) => b.length)).toEqual([15, 15, 7]);
    expect(IMPORT_BATCH).toBe(15);
    expect(batches.flat().map((n) => n.problemLink)).toEqual(Object.keys(map));
  });
  it('leaves out empty notes and damaged entries', () => {
    const batches = toImportBatches({ 'https://a.dev/1': { approach: '' }, 'https://a.dev/2': null, 'https://a.dev/3': 'text', 'https://a.dev/4': note() });
    expect(batches.flat().map((n) => n.problemLink)).toEqual(['https://a.dev/4']);
  });
  it('an empty map gives no batches', () => {
    expect(toImportBatches({})).toEqual([]);
    expect(toImportBatches(undefined)).toEqual([]);
  });
  it('turns a value that is not one of the drawer choices into empty, and drops a note that has nothing else', () => {
    const [[n]] = toImportBatches({ 'https://a.dev/1': note({ pattern: 'Magic', timeComplexity: 'fast', spaceComplexity: 'big' }) });
    expect([n.pattern, n.timeComplexity, n.spaceComplexity]).toEqual(['', '', '']);
    expect(toImportBatches({ 'https://a.dev/1': { pattern: 'Magic', approach: '' } })).toEqual([]);
  });
  it('cuts a note to the server limit', () => {
    const [[n]] = toImportBatches({ 'https://a.dev/1': note({ approach: 'x'.repeat(APPROACH_MAX + 500) }) });
    expect(n.approach.length).toBe(APPROACH_MAX);
  });
  it('keeps the original time when it is a whole number, and drops it otherwise', () => {
    const [[a, b]] = toImportBatches({ 'https://a.dev/1': note({ updatedAt: 1700000000000 }), 'https://a.dev/2': note({ updatedAt: 'yesterday' }) });
    expect(a.updatedAt).toBe(1700000000000);
    expect('updatedAt' in b).toBe(false);
  });
});

describe('listToMap and mergeNotes', () => {
  it('turns the server list into a map by link', () => {
    expect(listToMap([{ problemLink: 'a', approach: '1' }, { problemLink: 'b', approach: '2' }])).toEqual({ a: { problemLink: 'a', approach: '1' }, b: { problemLink: 'b', approach: '2' } });
    expect(listToMap(undefined)).toEqual({});
  });
  it('shows the browser notes the account does not have yet, and the account wins when both have one', () => {
    const merged = mergeNotes({ a: { approach: 'browser a' }, b: { approach: 'browser b' } }, { a: { approach: 'server a' } });
    expect(merged).toEqual({ a: { approach: 'server a' }, b: { approach: 'browser b' } });
  });
});

describe('noteBody', () => {
  it('sends the whole note with empty strings for missing parts, and nothing extra', () => {
    expect(noteBody('https://a.dev/1', { pattern: 'Trie', approach: 'x', updatedAt: 5, junk: 1 })).toEqual({
      problemLink: 'https://a.dev/1', pattern: 'Trie', timeComplexity: '', spaceComplexity: '', approach: 'x',
    });
  });
});
