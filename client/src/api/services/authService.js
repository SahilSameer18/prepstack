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
  try {
    const response = await api.get("/api/auth/current-user");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

// export async function updateProfile({ name, email, password }) {
//   const response = await api.put("/api/auth/profile",
//     {
//       name,
//       email,
//       password
//     });
//   return response.data;
// }

// export async function changePassword({ oldPassword, newPassword }) {
//   const response = await api.put("/api/auth/password",
//     {
//       oldPassword,
//       newPassword
//     });
//   return response.data;
// }

