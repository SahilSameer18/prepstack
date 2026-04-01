import api from '../axios';


// service to generate project idea based on techstack , compexity , domain and notes
export const generateProjectIdea = async (data) => {
  const response = await api.post('/api/project/generate', data);
  return response.data;
}

// service get all project ideas of the logged in user
export const getAllProjects = async () => {
  const response = await api.get('/api/project');
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