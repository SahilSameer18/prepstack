import api from "../axios";

export async function register({ name, email, password }) {
  const response = await api.post("/api/auth/register",
    {
      username: name,
      email,
      password
    });
  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/api/auth/login",
    {
      email,
      password
    });
  return response.data;
}

export async function logout() {
  const response = await api.post("/api/auth/logout");
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/api/auth/current-user");
  return response.data;
}


