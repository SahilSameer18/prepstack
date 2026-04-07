import api from '../axios';


export async function dsaSheet() {
  const response = await api.get('/api/sheets');
  return response.data;
}

export async function getSheetBySlug(slug) {
  const response = await api.get(`/api/sheets/${slug}`);
  return response.data;
}

export async function getSheetProgress(slug) {
  const response = await api.get(`/api/sheets/${slug}/progress`);
  return response.data;
}

export async function toggleProblem(slug, problemLink) {
  const response = await api.post(`/api/sheets/${slug}/progress`, { problemLink });
  return response.data;
}

