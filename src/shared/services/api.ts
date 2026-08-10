// services/api.ts

import axios from "axios";
import { getAccessToken } from "@/modules/auth/utils/auth.utils";
import { useAuthStore } from "@/shared/stores/auth.store";

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
const fallbackUrl = "http://192.168.1.7:5000";
/* =========================================
   🔥 GET BASE URL WITH FALLBACK
========================================= */
const getBaseUrl = (): string => {
    // ✅ Check environment variable first
    const envUrl = import.meta.env.VITE_GATEWAY_URL;
    if (envUrl) {

        return envUrl;
    }




    return fallbackUrl;
};

/* =========================================
   🔥 AXIOS INSTANCE - Gateway
========================================= */
const BASE_URL = getBaseUrl();

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// ✅ Log the base URL on creation


/* =========================================
   🔥 REQUEST INTERCEPTOR
========================================= */
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data && !(config.data instanceof FormData)) {
        config.data = convertDatesToUtc(config.data);
    }

    // Log outgoing requests


    return config;
});

/* =========================================
   🔥 TASK DIRECT API
========================================= */
export const taskDirectApi = axios.create({
    baseURL: import.meta.env.VITE_TASK_DIRECT_URL || fallbackUrl+"/api/auth/v1",
    timeout: 10000,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

taskDirectApi.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* =========================================
   🔥 RESPONSE INTERCEPTOR
========================================= */
let isRefreshing = false;
let failedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) =>
        error ? reject(error) : resolve(token)
    );
    failedQueue = [];
};

const redirectToLogin = () => {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};

api.interceptors.response.use(
    (response) => {

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // ✅ Log detailed error info
        console.error(`❌ API Error: ${error.message}`);
        console.error(`   URL: ${originalRequest?.url}`);
        console.error(`   Method: ${originalRequest?.method?.toUpperCase()}`);
        console.error(`   Status: ${error.response?.status}`);

        // ✅ Handle network errors (server not reachable)
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            console.error('🔴 SERVER NOT REACHABLE');
            console.error(`   Please ensure the server is running at: ${api.defaults.baseURL}`);
            return Promise.reject(new Error(
                `Cannot connect to server at ${api.defaults.baseURL}. Please check if the server is running.`
            ));
        }

        // Handle 400 Bad Request
        if (error.response?.status === 400) {
            console.error('🔴 400 BAD REQUEST');
            console.error('   URL:', originalRequest?.url);
            console.error('   Response:', error.response?.data);

            let errorMessage = 'Bad request. Please check your data.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                if (typeof errors === 'object') {
                    errorMessage = Object.entries(errors)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('; ');
                } else {
                    errorMessage = errors;
                }
            }
            return Promise.reject(new Error(errorMessage));
        }

        // Handle 401 Unauthorized - Token refresh logic
        if (error.response?.status === 401 && !originalRequest._retry) {
            const url = originalRequest.url || '';
            const isAuthService = url.includes('/auth/') || url.includes('/api/auth/');

            // Skip token refresh for auth endpoints
            if (isAuthService) {
                console.warn(`⚠️ 401 on auth endpoint ${url} - skipping refresh`);
                return Promise.reject(error);
            }

            // If already refreshing, queue this request
            if (isRefreshing) {
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
                // Attempt to refresh the token
                await useAuthStore.getState().refresh();
                const newToken = getAccessToken();

                // Process queued requests
                processQueue(null, newToken);

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clear queue and redirect to login
                processQueue(refreshError, null);
                redirectToLogin();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('🔴 403 FORBIDDEN');
            console.error('   URL:', originalRequest?.url);
            return Promise.reject(new Error('You do not have permission to perform this action'));
        }

        // Handle 404 Not Found
        if (error.response?.status === 404) {
            console.error('🔴 404 NOT FOUND');
            console.error('   URL:', originalRequest?.url);
            return Promise.reject(new Error('Resource not found. Please check the URL.'));
        }

        // Handle 500 Server Error
        if (error.response?.status >= 500) {
            console.error('🔴 SERVER ERROR (5xx)');
            console.error('   URL:', originalRequest?.url);
            return Promise.reject(new Error('Server error. Please try again later.'));
        }

        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            console.error('🔴 TIMEOUT ERROR');
            return Promise.reject(new Error('Request timed out. Please try again.'));
        }

        // Handle all other errors
        let message = "An unexpected error occurred";
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }

        console.error("❌ API Error:", message);
        return Promise.reject(new Error(message));
    }
);

// ✅ Helper function to check if the API is reachable
export const checkApiHealth = async (): Promise<boolean> => {
    try {

        await api.get('/health', { timeout: 5000 });

        return true;
    } catch (error) {
        console.error('❌ API health check failed:', error);
        return false;
    }
};

// ✅ Helper function to get the current API base URL
export const getApiBaseUrl = (): string => {
    return api.defaults.baseURL || fallbackUrl;
};

// ✅ Helper function to test connection
export const testApiConnection = async (): Promise<string> => {
    try {
        const baseUrl = getApiBaseUrl();

        const response = await api.get('/health', { timeout: 5000 });
        return `✅ Connected to ${baseUrl} (Status: ${response.status})`;
    } catch (error: any) {
        return `❌ Cannot connect to ${getApiBaseUrl()}: ${error.message}`;
    }
};

export default api;