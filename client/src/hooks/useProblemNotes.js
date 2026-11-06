import { useState } from 'react';

// Per-problem approach notes. They live only in this browser's localStorage (never sent to the server),
// keyed by the problem link.
const STORAGE_KEY = 'prepstack_problem_notes_v1';

const saveNotes = (notesMap) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notesMap));
  } catch (e) {
    console.error('Failed saving note to localStorage', e);
  }
};

export const useProblemNotes = () => {
  const [notesMap, setNotesMap] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const updateNote = (link, updates) => {
    setNotesMap((prev) => {
      const current = prev[link] || {};
      const updated = { ...current, ...updates, updatedAt: Date.now() };
      const nextMap = { ...prev, [link]: updated };
      saveNotes(nextMap);
      return nextMap;
    });
  };

  const clearNote = (link) => {
    setNotesMap((prev) => {
      const nextMap = { ...prev };
      delete nextMap[link];
      saveNotes(nextMap);
      return nextMap;
    });
  };

  return { notesMap, updateNote, clearNote };
};
