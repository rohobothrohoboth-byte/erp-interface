// src/services/auth.api.ts

import type { AuthTokens, LoginRequest } from "@/modules/auth/types/auth.types";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/shared/stores/auth.store";
import { api } from "@/shared/services/api";

// Resolve the access-token expiry as an absolute ISO timestamp. Prefer the value
// the server sends; otherwise read the JWT `exp` claim. NEVER default to "now" —
// doing so writes an already-expired cookie and forces an immediate logout.
const resolveExpiry = (token?: string | null, provided?: string | null): string => {
  if (provided) {
    const d = new Date(provided);
    if (!isNaN(d.getTime()) && d.getTime() > Date.now()) return d.toISOString();
  }
  if (token) {
    try {
      const { exp } = jwtDecode<{ exp?: number }>(token);
      if (exp) return new Date(exp * 1000).toISOString();
    } catch {
      // fall through to conservative default below
    }
  }
  // Conservative fallback matching the server's 30-minute access-token lifetime.
  return new Date(Date.now() + 30 * 60 * 1000).toISOString();
};

let isLoggingOut = false;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ============ RESPONSE INTERCEPTOR ON GATEWAY API ============
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const isAuthEndpoint = originalRequest?.url?.includes('/Login') ||
          originalRequest?.url?.includes('/RefreshToken');

      if (error.response?.status === 401 && !isAuthEndpoint) {
        if (originalRequest._retry) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const { refresh } = useAuthStore.getState();
          await refresh();

          const newToken = Cookies.get('accessToken') || localStorage.getItem('accessToken');
          processQueue(null, newToken);

          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);

        } catch (refreshError) {
          processQueue(refreshError as Error, null);

          if (!isLoggingOut) {
            isLoggingOut = true;


            const { logout } = useAuthStore.getState();
            logout();

            Cookies.remove('accessToken', { path: '/' });
            Cookies.remove('expiresAt', { path: '/' });
            localStorage.removeItem('accessToken');
            localStorage.removeItem('expiresAt');
            localStorage.removeItem('auth-storage');
            sessionStorage.clear();

            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }

            setTimeout(() => { isLoggingOut = false; }, 1000);
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (error.response?.status === 401 && isAuthEndpoint) {
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
);

// ============ LOGIN ============
export const loginApi = async (payload: LoginRequest): Promise<any> => {
  try {
    const res = await api.post("/auth/v1/Login", payload);

    if (!res.data.success) {
      throw new Error(res.data.message || "Login failed");
    }

    const data = res.data.data;
    const token = data.token;
    const expiresDate = resolveExpiry(token, data.expiresDate);

    return {
      accessToken: token,
      expiresDate: expiresDate,
      data: data,
      userId: data.userId,
      employeeId: data.employeeId,
      userName: data.userName,
      email: data.email,
      branchId: data.branchId,
      branchName: data.branchName,
      branchCode: data.branchCode,
      departmentId: data.departmentId,
      departmentName: data.departmentName,
      positionId: data.positionId,
      positionName: data.positionName,
      jobGradeId: data.jobGradeId,
      jobGradeName: data.jobGradeName,
      role: data.role,
    };
  } catch (error: any) {
    console.error("Login API error:", error);

    // ✅ Safe error handling
    const errorMessage = error?.response?.data?.message
        || error?.message
        || "Login failed";

    throw new Error(errorMessage);
  }
};

// ============ REFRESH TOKEN ============
export const refreshTokenApi = async (): Promise<AuthTokens> => {
  try {
    const accessToken = Cookies.get('accessToken') || localStorage.getItem('accessToken');

    const res = await api.post(
        "/auth/v1/RefreshToken",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Token refresh failed");
    }

    // Backend returns LoginResDto: { accessToken, refreshToken, expiresDate }.
    const data = res.data.data || res.data;
    const token = data?.accessToken || data?.token;
    const expiresDate = resolveExpiry(token, data?.expiresDate);

    return {
      accessToken: token,
      expiresDate: expiresDate,
    };
  } catch (error: any) {
    console.error("Refresh token error:", error);

    // ✅ Safe error handling
    const errorMessage = error?.response?.data?.message
        || error?.message
        || "Token refresh failed";

    throw new Error(errorMessage);
  }
};

// ============ TOKEN EXPIRATION CHECK ============
export const isTokenExpired = (): boolean => {
  const expiresAt = Cookies.get('expiresAt') || localStorage.getItem('expiresAt');
  if (!expiresAt) return true;
  return new Date(expiresAt) < new Date();
};

// ============ AUTO CHECK TOKEN EXPIRATION ============
export const setupTokenExpirationCheck = () => {
  const interval = setInterval(() => {
    const { isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated && isTokenExpired()) {


      const { refresh } = useAuthStore.getState();
      refresh().catch(() => {

        const { logout } = useAuthStore.getState();
        logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      });
    }
  }, 60000);

  return () => clearInterval(interval);
};

// ============ FETCH MENU STRUCTURE ============
export const fetchMenuStructure = async (): Promise<any[]> => {
  try {
    const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');

    if (!token) {
      console.warn("No token available for menu fetch");
      return [];
    }

    const response = await api.get("/auth/v1/Menu/structure", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data?.data || response.data || [];

    return data;
  } catch (error) {
    // ✅ Safe error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Failed to fetch menu structure:", errorMessage);
    return [];
  }
};

// ============ FETCH PERMISSION KEYS ============
export const fetchPermissionKeys = async (): Promise<string[]> => {
  try {
    const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');

    if (!token) {
      console.warn("No token available for permission fetch");
      return [];
    }

    const response = await api.get("/auth/v1/Menu/permissions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data?.data || response.data || [];
    console.log(`🔑 Permission keys loaded: ${data.length}`);
    return data;
  } catch (error) {
    // ✅ Safe error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Failed to fetch permissions:", errorMessage);
    return [];
  }
};

// ============ EXPORT ============
export const authApi = {
  login: loginApi,
  refresh: refreshTokenApi,
  fetchMenuStructure,
  fetchPermissionKeys,
  isTokenExpired,
  setupTokenExpirationCheck,
};

export default api;