import api from '../axios';

export const listNotes = async () => {
  const response = await api.get('/api/problem-notes');
  return response.data;
};

// Saves one whole note (pattern, complexities, approach) for a problem link.
export const saveNote = async (note) => {
  const response = await api.put('/api/problem-notes', note);
  return response.data;
};

export const deleteNote = async (problemLink) => {
  const response = await api.delete('/api/problem-notes', { params: { problemLink } });
  return response.data;
};

// The one-time move of the notes kept in the browser (at most 15 per call). It only adds; it never overwrites a note the account has.
export const importNotes = async (notes) => {
  const response = await api.post('/api/problem-notes/import', { notes });
  return response.data;
};
