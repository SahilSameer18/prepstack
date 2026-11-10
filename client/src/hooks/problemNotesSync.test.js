import { describe, it, expect } from 'vitest';
import { LOCAL_KEY, IMPORT_BATCH, isEmptyNote, readLocalNotes, toImportBatches, listToMap, mergeNotes, noteBody } from './problemNotesSync';
import { APPROACH_MAX } from '../data/problemNoteOptions';

const storage = (value) => ({ getItem: (k) => (k === LOCAL_KEY ? value : null) });
const note = (over = {}) => ({ pattern: 'Greedy', timeComplexity: 'O(N)', spaceComplexity: 'O(1)', approach: 'text', updatedAt: 1700000000000, ...over });

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
