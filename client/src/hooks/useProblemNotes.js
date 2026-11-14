import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { listNotes, saveNote, deleteNote, importNotes } from '../api/services/problemNoteService';
import { LOCAL_KEY, readLocalNotes, toImportBatches, listToMap, mergeNotes, createNoteSaveQueue } from './problemNotesSync';

const memoryOnlyStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

// Ordered writes and an account-specific journal protect unsaved edits across navigation/reload.
export const useProblemNotes = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [visible, setVisible] = useState({ userId: null, notes: {} });
  const [saveStatus, setSaveStatus] = useState('saved');
  const mapRef = useRef({});
  const queueRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    mapRef.current = {};
    let live = true;
    let allowWrites;
    let storage;
    try { storage = window.localStorage; } catch { storage = memoryOnlyStorage; }
    const ready = new Promise((resolve) => { allowWrites = resolve; });
    const edited = new Set();
    const queue = createNoteSaveQueue({ save: saveNote, remove: deleteNote, storage, userId, ready,
      onStatus: (status) => { if (live) setSaveStatus(status); } });
    const recovered = queue.pendingNotes();
    queueRef.current = { queue, edited };
    const apply = (base) => {
      const next = { ...base };
      for (const [link, note] of Object.entries({ ...recovered, ...queue.pendingNotes() })) { if (note) next[link] = note; else delete next[link]; }
      for (const link of edited) { if (mapRef.current[link]) next[link] = mapRef.current[link]; else delete next[link]; }
      mapRef.current = next; setVisible({ userId, notes: next });
    };
    (async () => {
      let loaded = {};
      try {
        const serverMap = listToMap((await listNotes())?.data?.notes);
        if (!live) return;
        const local = readLocalNotes(storage);
        loaded = mergeNotes(local, serverMap);
        apply(loaded);
        for (const batch of toImportBatches(local)) { if (!live) return; await importNotes(batch); }
        if (!live) return;
        try { storage.removeItem(LOCAL_KEY); } catch { /* Keep account notes working. */ }
        if (Object.keys(local).length) {
          const fresh = listToMap((await listNotes())?.data?.notes);
          if (live) apply(fresh);
        }
      } catch { if (live) { apply(loaded); setSaveStatus('error'); } }
      finally { allowWrites(); }
      if (live) void queue.flush();
    })();
    const flush = () => { void queue.flush(); };
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('online', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      live = false;
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('online', flush);
      window.removeEventListener('pagehide', flush);
      queue.stop(); // Pending text stays recoverable even if the browser cancels a request.
      queueRef.current = null;
    };
  }, [userId]);

  const changeNote = (link, note) => {
    const current = queueRef.current;
    if (!current) return;
    const next = { ...mapRef.current };
    if (note) next[link] = note; else delete next[link];
    mapRef.current = next; setVisible({ userId, notes: next });
    current.edited.add(link);
    current.queue.enqueue(link, note);
  };
  const updateNote = (link, updates) => changeNote(link, { ...(mapRef.current[link] || {}), ...updates, problemLink: link });
  const clearNote = (link) => changeNote(link, null);
  return { notesMap: visible.userId === userId ? visible.notes : {}, updateNote, clearNote, saveStatus };
};
