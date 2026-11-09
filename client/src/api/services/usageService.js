import api from "../axios";

// How much of today's allowance (project ideas, role reports) the user has used: { projects, reports }, each { used, allowed, resetsAt }.
export async function getUsage() {
  const response = await api.get("/api/usage");
  return response.data;
}
