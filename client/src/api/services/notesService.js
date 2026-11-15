import api from '../axios'

export const notesService = {
  // Every subject with its section count, topic count, reading time and last checked date (no sections)
  getNotesSummary: async () => {
    const response = await api.get('/api/notes');
    return response.data;
  },
  getNotesBySubject: async (subject, signal) => {
    const response = await api.get(`/api/notes/${subject}`, { signal });
    return response.data;
  }
};
