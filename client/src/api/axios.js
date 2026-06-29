import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ─── Logout callback ───────────────────────────────────────────────────────────
// AuthContext registers this so the interceptor can clear user state on
// refresh failure without importing React hooks here.
let logoutCallback = null;
export const setLogoutCallback = (fn) => {
  logoutCallback = fn;
};

// ─── Token-refresh state ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];   // requests waiting while a refresh is in-flight

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  );
  failedQueue = [];
};

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,   // pass through successful responses

  async (error) => {
    const originalRequest = error.config;

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest._retry;

    // Never attempt a refresh on these endpoints — a 401 here is a genuine
    // "credentials wrong" error, not an expired access token.
    const isRefreshEndpoint = originalRequest.url?.includes("/api/auth/refresh");
    const isLoginEndpoint   = originalRequest.url?.includes("/api/auth/login");
    const isRegisterEndpoint = originalRequest.url?.includes("/api/auth/register");
    const isPublicAuthEndpoint = isRefreshEndpoint || isLoginEndpoint || isRegisterEndpoint;

    if (is401 && !alreadyRetried && !isPublicAuthEndpoint) {
      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use `api` (not bare axios) so the baseURL is applied correctly.
        // Using bare axios with a relative URL would hit the Vite dev server
        // (localhost:5173) instead of the actual API backend.
        await api.post("/api/auth/refresh", {}, { withCredentials: true });

        processQueue(null);               // unblock all queued requests
        return api(originalRequest);      // retry the original request
      } catch (refreshError) {
        processQueue(refreshError);       // reject all queued requests
        if (logoutCallback) logoutCallback();   // clear user from React state
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
