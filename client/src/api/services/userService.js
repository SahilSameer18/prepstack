import api from "../axios";

export async function getUserStats() {
  const response = await api.get("/api/user/stats");
  return response.data;
}

export async function getDashboardSummary() {
  const response = await api.get("/api/user/dashboard-summary");
  return response.data;
}
