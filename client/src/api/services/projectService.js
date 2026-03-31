import api from '../axios';


export const generateProjectIdea = async (data) => {
  const response = await api.post('/project/generate-idea', data);
  return response.data;
}
