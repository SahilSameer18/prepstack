import { useState, useEffect } from 'react';
import { notesService } from '../api/services/notesService';

export const useNotes = (subject) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        // data.data is the actual payload from our API format: {success: true, data: { ... }}
        const response = await notesService.getNotesBySubject(subject);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    if (subject) {
      fetchNotes();
    }
  }, [subject]);

  return { data, loading, error };
};