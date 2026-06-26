import axios from "axios";
import { AuthProvider } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// ====================
// Refresh Queue
// ====================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// ====================
// Token Helpers (In-Memory)
// ====================

let accessToken = null;

export const updateToken = (token) => {
  accessToken = token;

  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

const getToken = () => {
  return accessToken;
};

// ====================
// Init Token
// ====================

const token = getToken();

if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

// ====================
// Request Interceptor
// ====================

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ====================
// Response Interceptor
// ====================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ====================
    // Refresh Token Logic
    // ====================

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          },
        );

        const newToken = response.data.token;

        updateToken(newToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        updateToken(null);

        const publicPaths = ["/", "/register"];
        if (
          !publicPaths.includes(window.location.pathname) &&
          !window.location.pathname.startsWith("/admin")
        ) {
          window.location.href = "/";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ====================
    // Other Errors
    // ====================

    switch (error.response?.status) {
      case 400:
        console.error("Bad Request");
        break;

      case 403:
        console.error("Forbidden");
        break;

      case 404:
        console.error("Not Found");
        break;

      case 500:
        console.error("Server Error");
        break;

      default:
        break;
    }

    return Promise.reject(error);
  },
);

export default api;
