import api from "../axios";

export async function getUserStats() {
  const response = await api.get("/api/user/stats");
  return response.data;
}

export async function getDashboardSummary() {
  const response = await api.get("/api/user/dashboard-summary");
  return response.data;
}

export async function updateUserProfile(data) {
  const response = await api.put("/api/user/profile", data);
  return response.data;
}

export async function changeUserPassword(data) {
  const response = await api.put("/api/user/change-password", data);
  return response.data;
}
