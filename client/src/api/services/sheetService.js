import api from '../axios';


export async function dsaSheet() {
  const response = await api.get('/api/sheets');
  return response.data;
}

export async function getSheetBySlug(slug) {
  const response = await api.get(`/api/sheets/${slug}`);
  return response.data;
}