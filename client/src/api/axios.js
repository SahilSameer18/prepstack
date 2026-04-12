import axios from "axios";

const api = axios.create({
  baseURL: "https://prepstack-doaw.onrender.com",
  withCredentials: true,
});

export default api;