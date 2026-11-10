import { useCallback, useEffect, useRef, useState } from 'react';
import { listNotes, saveNote, deleteNote, importNotes } from '../api/services/problemNoteService';
import { LOCAL_KEY, readLocalNotes, toImportBatches, listToMap, mergeNotes, isEmptyNote, noteBody } from './problemNotesSync';

const SAVE_DELAY_MS = 600; // wait for a pause in typing before saving

// Per-problem notes (pattern, complexity, approach), saved to the account.
// - Typing shows at once and is saved after a short pause (one save per problem, the whole note).
// - Notes that used to live only in this browser are moved to the account once; the browser copy is removed only after the
//   server has confirmed every batch, so a failed import never loses anything and is tried again on the next visit.
// - saveStatus is 'saved', 'saving' or 'error' (the last save failed; the next change tries again).
export const useProblemNotes = () => {
  const [notesMap, setNotesMap] = useState({});
  const [saveStatus, setSaveStatus] = useState('saved');
  const mapRef = useRef({});
  const timers = useRef(new Map()); // link -> pending save

  const setMap = useCallback((next) => { mapRef.current = next; setNotesMap(next); }, []);

  const send = useCallback(async (link) => {
    const n = mapRef.current[link];
    try {
      if (isEmptyNote(n)) await deleteNote(link); else await saveNote(noteBody(link, n));
      if (timers.current.size === 0) setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, []);

  const schedule = useCallback((link) => {
    clearTimeout(timers.current.get(link));
    setSaveStatus('saving');
    timers.current.set(link, setTimeout(() => { timers.current.delete(link); send(link); }, SAVE_DELAY_MS));
  }, [send]);

  // Save everything that is still waiting (the page is being left or hidden).
  const flush = useCallback(() => {
    for (const [link, id] of [...timers.current]) { clearTimeout(id); timers.current.delete(link); send(link); }
  }, [send]);

  useEffect(() => {
    let live = true;
    (async () => {
      let serverMap = {};
      try {
        serverMap = listToMap((await listNotes())?.data?.notes);
      } catch {
        return; // not signed in or offline: show nothing, and leave the browser notes where they are
      }
      if (!live) return;
      const local = readLocalNotes(localStorage);
      setMap(mergeNotes(local, serverMap));
      const batches = toImportBatches(local);
      if (batches.length === 0) { if (Object.keys(local).length) { try { localStorage.removeItem(LOCAL_KEY); } catch { /* ignore */ } } return; }
      try {
        for (const batch of batches) await importNotes(batch);
        try { localStorage.removeItem(LOCAL_KEY); } catch { /* ignore */ }
        if (live) {
          const fresh = listToMap((await listNotes())?.data?.notes);
          // keep anything typed while the import ran
          setMap({ ...fresh, ...Object.fromEntries([...timers.current.keys()].map((l) => [l, mapRef.current[l]])) });
        }
      } catch {
        // the browser copy stays; it is imported on the next visit
      }
    })();
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => { live = false; document.removeEventListener('visibilitychange', onHide); flush(); };
  }, [setMap, flush]);

  const updateNote = (link, updates) => {
    const next = { ...mapRef.current, [link]: { ...(mapRef.current[link] || {}), ...updates, problemLink: link } };
    setMap(next);
    schedule(link);
  };

  const clearNote = (link) => {
    clearTimeout(timers.current.get(link));
    timers.current.delete(link);
    const next = { ...mapRef.current };
    delete next[link];
    setMap(next);
    setSaveStatus('saving');
    deleteNote(link).then(() => { if (timers.current.size === 0) setSaveStatus('saved'); }).catch(() => setSaveStatus('error'));
  };

  return { notesMap, updateNote, clearNote, saveStatus };
};
