import { create } from "zustand";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { loginApi, refreshTokenApi } from "../services/auth.api";
import type { JwtPayload } from "../types/auth/auth.types";
interface Module {
  K: string; 
  L: string;
  M: any[]; 
} 
interface AuthState {
  token: string | null;
  employeeId: string | null;
  userName: string | null;
  role: string | null;
  permissions: Module[] | null; // parsed once (IMPORTANT)
  isAuthenticated: boolean;
  isLoading: boolean;

  init: () => void;
  login: (username: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;

  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({

  token: null,
  employeeId: null,
  userName: null,
  role: null,
  permissions: null,
  isAuthenticated: false,
  isLoading: true,

  //  Run once on app start
  init: () => {
    const token = Cookies.get("accessToken");

    if (token) {
      get().setToken(token);
    }

    set({ isLoading: false });
  },

  //  LOGIN
  login: async (username, password) => {
    const tokens = await loginApi({ username, password });

    const expiresDate = new Date(tokens.expiresDate);
    const secure = import.meta.env.PROD;

    Cookies.set("accessToken", tokens.accessToken, {
      expires: expiresDate,
      secure,
      sameSite: "lax",
      path: "/",
    });

    Cookies.set("expiresAt", tokens.expiresDate, {
      expires: expiresDate,
      secure,
      sameSite: "lax",
      path: "/",
    });

    get().setToken(tokens.accessToken);
  },

  //  REFRESH
  refresh: async () => {
    const tokens = await refreshTokenApi();

    const expiresDate = new Date(tokens.expiresDate);
    const secure = import.meta.env.PROD;

    Cookies.set("accessToken", tokens.accessToken, {
      expires: expiresDate,
      secure,
      sameSite: "lax",
      path: "/",
    });

    Cookies.set("expiresAt", tokens.expiresDate, {
      expires: expiresDate,
      secure,
      sameSite: "lax",
      path: "/",
    });

    get().setToken(tokens.accessToken);
  },

  //  LOGOUT
  logout: () => {
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("expiresAt", { path: "/" });

    get().clearToken();
  },

  // TOKEN PARSE (single source of truth)
  setToken: (token: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);

      let parsedPermissions = null;

      try {
        parsedPermissions = decoded.permissions
          ? JSON.parse(decoded.permissions as unknown as string)
          : null;
      } catch {
        parsedPermissions = null;
      }

      set({
        token,
        employeeId: decoded.employeeId ?? null,
        userName: decoded.userName ?? null,
        role: decoded.role ?? null,
        permissions: parsedPermissions,
        isAuthenticated: true,
      });
    } catch {
      set({
        token: null,
        employeeId: null,
        userName: null,
        role: null,
        permissions: null,
        isAuthenticated: false,
      });
    }
  },

  //  CLEAR STATE
  clearToken: () => {
    set({
      token: null,
      employeeId: null,
      userName: null,
      role: null,
      permissions: null,
      isAuthenticated: false,
    });
  },
}));