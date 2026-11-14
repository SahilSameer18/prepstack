import api from '../axios';

// Axios gives us the server response in response.data; its data field contains the actual payload.

// Load the sheets, roadmaps and topics offered by the public builder.
export async function getPlanOptions(signal) {
  const response = await api.get('/api/plan/options', { signal });
  return response.data.data;
}

// Calculate a preview without saving a plan. A signal cancels an outdated request.
export async function previewPlan(settings, signal) {
  const response = await api.post('/api/plan/preview', settings, { signal });
  return response.data.data;
}

// Read the signed-in user's current plan. This request does not change it.
export async function getPlan(signal) {
  const response = await api.get('/api/plan', { signal });
  return response.data.data;
}

// Save a plan after login. Replacing an existing plan needs explicit consent.
export async function createPlan(settings) {
  const response = await api.post('/api/plan', settings);
  return response.data.data;
}
