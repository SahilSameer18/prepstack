import api from '../axios'

export const notesService = {
  getNotesBySubject: async (subject) => {
    const response = await api.get(`/api/notes/${subject}`);
    return response.data;
  }
};