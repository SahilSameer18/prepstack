import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export async function getProfile() {
  const response = await api.get("/api/user/profile");
  return response.data;
}

export async function updateProfile(data) {
  const response = await api.put("/api/user/profile", data);
  return response.data;
}

export async function changePassword(data) {
  const response = await api.put("/api/user/change-password", data);
  return response.data;
}
