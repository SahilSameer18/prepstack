import api from '../axios';

// Create a report. `form` is a FormData (jobDescription, days, consent, and either a "resume" PDF or resumeText).
// The AI can take a while, so allow longer than the default 30s.
export const createReport = async (form) => {
  const response = await api.post('/api/analyzer', form, { timeout: 120000 });
  return response.data;
};

export const listReports = async (limit = 6) => {
  const response = await api.get('/api/analyzer', { params: { limit } });
  return response.data;
};

export const getReport = async (id) => {
  const response = await api.get(`/api/analyzer/${id}`);
  return response.data;
};

// Tick (done: true) or untick one item of the study plan. The server sets the state, it does not flip it.
export const setPlanItem = async (id, day, index, done) => {
  const response = await api.patch(`/api/analyzer/${id}/plan`, { day, index, done });
  return response.data;
};

// The latest report's plan for today, for the dashboard card (data is null when there is no report or plan).
export const getToday = async () => {
  const response = await api.get('/api/analyzer/today');
  return response.data;
};

export const deleteReport =async (id) => {
  const response = await api.delete(`/api/analyzer/${id}`);
  return response.data;
};
