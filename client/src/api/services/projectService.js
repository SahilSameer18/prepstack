import api from '../axios';


// service to generate project idea based on techstack , compexity , domain and notes
export const generateProjectIdea = async (data) => {
  // Gemini can take a while, so allow longer than the default 30s
  const response = await api.post('/api/project/generate', data, { timeout: 90000 });
  return response.data;
}

// service get project ideas of the logged in user, 20 at a time, newest first.
// Pass `before` (the _id of the last idea you already have) to get the next 20.
export const getAllProjects = async (before) => {
  const response = await api.get('/api/project', { params: before ? { before } : undefined });
  return response.data;
}

// service get project idea from projectId
export const getProjectById = async (projectId) => {
  const response = await api.get(`/api/project/${projectId}`);
  return response.data;
}

//service delete project idea from projectId
export const deleteProject = async (projectId) => {
  const response = await api.delete(`/api/project/${projectId}`);
  return response.data;
}