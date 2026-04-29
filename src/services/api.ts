import axios from "axios";
import { isExpiringSoon } from "../../src/utils/token.utils";
import { getAccessToken, getExpiresAt, refresh } from "../utils/auth.utils";

/* =========================================
   🔥 DATE → UTC CONVERTER
========================================= */
const convertDatesToUtc = (obj: any): any => {
  if (!obj) return obj;

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (typeof obj === "string") {
    if (!obj) return obj;

    // match YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(obj)) {
      return new Date(obj).toISOString();
    }

    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDatesToUtc);
  }

  if (typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = convertDatesToUtc(obj[key]);
    }
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
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================
   🔐 REQUEST INTERCEPTOR
========================================= */
api.interceptors.request.use(async (config) => {
  let token = getAccessToken();
  const expiresAt = getExpiresAt();

  // 🔄 refresh token if expiring
  if (token && expiresAt && isExpiringSoon(expiresAt)) {
    await refresh();
    token = getAccessToken();
  }

  // 🔑 attach token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔥 convert dates globally (skip FormData — it can't be iterated)
  if (config.data && !(config.data instanceof FormData)) {
    config.data = convertDatesToUtc(config.data);
  }

  return config;
});

/* =========================================
   🚨 RESPONSE INTERCEPTOR (INLINE ERROR HANDLING)
========================================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred";

    if (axios.isAxiosError(error)) {
      const data = error.response?.data;

      if (data?.message) {
        message = data.message;
      } else if (data?.errors) {
        message = Object.values(data.errors).flat().join(", ");
      } else if (typeof data === "string") {
        message = data;
      } else if (!error.response) {
        message = "Network error. Please check your connection.";
      } else {
        message = error.message;
      }

      if (error.response?.status === 401) {
        // optional: handle logout
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error("API Error:", message);

    return Promise.reject(new Error(message));
  },
);
