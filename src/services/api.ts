import axios from "axios";
import { getAccessToken } from "../utils/auth.utils";
import { useAuthStore } from "../stores/auth.store";

/* =========================================
   🔥 DATE → UTC CONVERTER
========================================= */
const convertDatesToUtc = (obj: any): any => {
  if (!obj) return obj;

  if (obj instanceof Date) return obj.toISOString();

  if (typeof obj === "string") {
    if (!obj) return obj;
    if (/^\d{4}-\d{2}-\d{2}$/.test(obj)) return new Date(obj).toISOString();
    return obj;
  }

  if (Array.isArray(obj)) return obj.map(convertDatesToUtc);

  if (typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) newObj[key] = convertDatesToUtc(obj[key]);
    return newObj;
  }

  return obj;
};

/* =========================================
   🔥 AXIOS INSTANCE
========================================= */
export const api = axios.create({
  baseURL: import.meta.env.VITE_GATEWAY_URL || "http://localhost:1212",
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* =========================================
   � REQUEST INTERCEPTOR
========================================= */
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data && !(config.data instanceof FormData)) {
    config.data = convertDatesToUtc(config.data);
  }

  return config;
});

/* =========================================
   � RESPONSE INTERCEPTOR
========================================= */
let isRefreshing = false;
let failedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  failedQueue = [];
};

const redirectToLogin = () => {
  useAuthStore.getState().logout();
  // ProtectedRoute will reactively redirect once isAuthenticated becomes false
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests that come in while a refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
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
        await useAuthStore.getState().refresh();
        const newToken = getAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear auth and go to login
        processQueue(refreshError, null);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors, extract a readable message
    let message = "An unexpected error occurred";
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      if (data?.message) message = data.message;
      else if (data?.errors)
        message = Object.values(data.errors).flat().join(", ");
      else if (typeof data === "string") message = data;
      else if (!error.response)
        message = "Network error. Please check your connection.";
      else message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  },
);
