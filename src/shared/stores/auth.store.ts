// src/stores/auth.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { loginApi, refreshTokenApi, fetchMenuStructure, fetchPermissionKeys } from "@/shared/services/auth.api";
import { queryClient } from "@/shared/lib/queryClient";
import type { JwtPayload } from "@/modules/auth/types/auth.types";
import api from "@/shared/services/api";

// ============================================================
// TYPES
// ============================================================

interface NormalizedMenu {
  K: string;
  L: string;
  P?: string;
  I?: string;
  O?: number;
  A?: string[];
  ParentId?: string | null;
  C?: NormalizedMenu[] | null;
}

interface NormalizedModule {
  K: string;
  L: string;
  M: NormalizedMenu[];
}

interface AuthState {
  // Auth State
  token: string | null;
  userId: string | null;
  employeeId: string | null;
  userName: string | null;
  role: string | null;
  permissions: NormalizedModule[] | null;
  permissionHash: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMenuLoaded: boolean;

  // Organization Details
  branchId: string | null;
  branchName: string | null;
  branchCode: string | null;
  departmentId: string | null;
  departmentName: string | null;
  positionId: string | null;
  positionName: string | null;
  jobGradeId: string | null;
  jobGradeName: string | null;

  // Actions
  init: () => Promise<() => void>;
  login: (username: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
  logoutOnExpiration: () => void;
  setToken: (token: string, signal?: AbortSignal) => Promise<void>;
  clearToken: () => void;
  isTokenExpired: () => boolean;
  fetchMenuStructure: (signal?: AbortSignal) => Promise<void>;
  hasPermission: (permission: string) => Promise<boolean>;
  fetchOrganizationDetails: (userId: string, signal?: AbortSignal) => Promise<void>;
}

// ============================================================
// HELPERS
// ============================================================

// ✅ Normalize permission keys and preserve hierarchy (nested C or flat ParentId)
const normalizePermissions = (data: any[]): NormalizedModule[] => {
  if (!data || !Array.isArray(data)) return [];

  const getMenuId = (menu: any): string =>
    String(menu.Id || menu.id || menu.k || menu.K || '');

  const normalizeMenu = (menu: any, allMenus: any[] = []): NormalizedMenu => {
    const nested = (menu.c || menu.C || []).map((child: any) => normalizeMenu(child, allMenus));
    const menuId = getMenuId(menu);

    // Flat ParentId payloads: attach children that point at this menu id/key
    const fromFlat =
      nested.length === 0 && allMenus.length > 0
        ? allMenus
            .filter((candidate) => {
              const parent = candidate.ParentId || candidate.parentId || null;
              if (parent == null) return false;
              return String(parent) === menuId || String(parent) === String(menu.k || menu.K || '');
            })
            .sort((a, b) => (a.O || a.o || 0) - (b.O || b.o || 0))
            .map((child) => normalizeMenu(child, allMenus))
        : [];

    const children = nested.length > 0 ? nested : fromFlat;

    return {
      K: menu.k || menu.K || '',
      L: menu.l || menu.L || '',
      P: menu.p || menu.P || '',
      I: menu.i || menu.I || '',
      O: menu.o || menu.O || 0,
      A: menu.a || menu.A || [],
      ParentId: menu.ParentId || menu.parentId || null,
      C: children.length > 0 ? children : null,
    };
  };

  const buildMenuTree = (menus: any[]): NormalizedMenu[] => {
    const hasNestedChildren = menus.some((menu) => (menu.c || menu.C || []).length > 0);

    // Already nested from Menu/structure — keep top-level nodes as-is
    if (hasNestedChildren) {
      return menus
        .slice()
        .sort((a, b) => (a.O || a.o || 0) - (b.O || b.o || 0))
        .map((menu) => normalizeMenu(menu, menus));
    }

    // Flat list: roots have null ParentId, children hang off ParentId
    return menus
      .filter((menu) => {
        const menuParentId = menu.ParentId || menu.parentId || null;
        return menuParentId == null || menuParentId === '';
      })
      .sort((a, b) => (a.O || a.o || 0) - (b.O || b.o || 0))
      .map((menu) => normalizeMenu(menu, menus));
  };

  return data.map((module: any) => {
    const menus = module.menus || module.M || module.m || [];
    return {
      K: module.k || module.K || '',
      L: module.l || module.L || '',
      M: buildMenuTree(Array.isArray(menus) ? menus : []),
    };
  });
};

// ✅ Clear all auth storage
const clearAllAuthStorage = () => {
  // Clear cookies
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("expiresAt", { path: "/" });

  // Clear localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("expiresAt");
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");
  localStorage.removeItem("auth-storage");

  // Clear sessionStorage
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("expiresAt");
  sessionStorage.removeItem("auth_token");

  // Clear all cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};

// ============================================================
// STORE
// ============================================================

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
          // ============================================================
          // INITIAL STATE
          // ============================================================
          token: null,
          userId: null,
          employeeId: null,
          userName: null,
          role: null,
          permissions: null,
          permissionHash: null,
          isAuthenticated: false,
          isLoading: true,
          isMenuLoaded: false,
          branchId: null,
          branchName: null,
          branchCode: null,
          departmentId: null,
          departmentName: null,
          positionId: null,
          positionName: null,
          jobGradeId: null,
          jobGradeName: null,

          // ============================================================
          // TOKEN HELPERS
          // ============================================================

          isTokenExpired: () => {
            const expiresAt = Cookies.get("expiresAt") || localStorage.getItem("expiresAt");
            if (!expiresAt) return true;
            return new Date(expiresAt) < new Date();
          },

          // ============================================================
          // ORGANIZATION DETAILS
          // ============================================================

          fetchOrganizationDetails: async (userId: string, signal?: AbortSignal) => {
            try {
              if (!api || typeof api.get !== 'function') {
                console.warn('⚠️ API not available, skipping organization details');
                return;
              }

              if (signal?.aborted) {
                console.log('⏹️ fetchOrganizationDetails cancelled');
                return;
              }

              try {
                const userResponse = await api.get(`/auth/v1/User/${userId}`, { signal });
                if (signal?.aborted) return;

                const userData = userResponse?.data?.data || userResponse?.data || {};
                const employeeId = userData?.EmployeeId || userData?.employeeId;

                if (employeeId) {
                  try {
                    const employeeResponse = await api.get(`/auth/v1/Employee/${employeeId}`, { signal });
                    if (signal?.aborted) return;

                    const employeeData = employeeResponse?.data?.data || employeeResponse?.data || {};

                    if (employeeData) {
                      const branchId = employeeData.BranchId || null;
                      const departmentId = employeeData.DepartmentId || null;
                      const positionId = employeeData.PositionId || null;

                      let branchName = null;
                      let branchCode = null;
                      if (branchId && api && typeof api.get === 'function' && !signal?.aborted) {
                        try {
                          const branchResponse = await api.get(`/auth/v1/Branch/${branchId}`, { signal });
                          if (!signal?.aborted) {
                            const branchData = branchResponse?.data?.data || branchResponse?.data || {};
                            branchName = branchData?.Name || branchData?.name || null;
                            branchCode = branchData?.Code || branchData?.code || null;
                          }
                        } catch (branchError) {
                          if (!signal?.aborted) {
                            console.error('❌ Error fetching branch:', branchError);
                          }
                        }
                      }

                      let departmentName = null;
                      if (departmentId && api && typeof api.get === 'function' && !signal?.aborted) {
                        try {
                          const deptResponse = await api.get(`/auth/v1/Department/${departmentId}`, { signal });
                          if (!signal?.aborted) {
                            const deptData = deptResponse?.data?.data || deptResponse?.data || {};
                            departmentName = deptData?.Name || deptData?.name || null;
                          }
                        } catch (deptError) {
                          if (!signal?.aborted) {
                            console.error('❌ Error fetching department:', deptError);
                          }
                        }
                      }

                      let positionName = null;
                      if (positionId && api && typeof api.get === 'function' && !signal?.aborted) {
                        try {
                          const positionResponse = await api.get(`/auth/v1/Position/${positionId}`, { signal });
                          if (!signal?.aborted) {
                            const positionData = positionResponse?.data?.data || positionResponse?.data || {};
                            positionName = positionData?.Name || positionData?.name || null;
                          }
                        } catch (positionError) {
                          if (!signal?.aborted) {
                            console.error('❌ Error fetching position:', positionError);
                          }
                        }
                      }

                      if (!signal?.aborted) {
                        set({
                          branchId: branchId || null,
                          branchName: branchName || null,
                          branchCode: branchCode || null,
                          departmentId: departmentId || null,
                          departmentName: departmentName || null,
                          positionId: positionId || null,
                          positionName: positionName || null,
                        });
                      }
                      return;
                    }
                  } catch (employeeError) {
                    if (!signal?.aborted) {
                      console.warn('⚠️ Could not fetch employee details:', employeeError);
                    }
                  }
                }
              } catch (userError) {
                if (!signal?.aborted) {
                  console.warn('⚠️ Could not fetch user details:', userError);
                }
              }

              // Fallback: Get from User endpoint directly
              if (api && typeof api.get === 'function' && !signal?.aborted) {
                try {
                  const profileResponse = await api.get(`/auth/v1/User/${userId}`, { signal });
                  if (!signal?.aborted) {
                    const profileData = profileResponse?.data?.data || profileResponse?.data || {};
                    if (profileData) {
                      set({
                        branchId: profileData.BranchId || profileData.branchId || null,
                        branchName: profileData.BranchName || profileData.branchName || null,
                        branchCode: profileData.BranchCode || profileData.branchCode || null,
                        departmentId: profileData.DepartmentId || profileData.departmentId || null,
                        departmentName: profileData.DepartmentName || profileData.departmentName || null,
                        positionId: profileData.PositionId || profileData.positionId || null,
                        positionName: profileData.PositionName || profileData.positionName || null,
                      });
                    }
                  }
                } catch (profileError) {
                  if (!signal?.aborted) {
                    console.warn('⚠️ Could not fetch from profile endpoint:', profileError);
                  }
                }
              }
            } catch (error) {
              if (!signal?.aborted) {
                console.error('❌ Error fetching organization details:', error);
              }
            }
          },

          // ============================================================
          // INIT
          // ============================================================

          init: async () => {
            const abortController = new AbortController();
            const signal = abortController.signal;

            try {
              // Check for logout redirect
              const isLogoutRedirect = sessionStorage.getItem('logout_redirect') === 'true';
              if (isLogoutRedirect) {
                sessionStorage.removeItem('logout_redirect');
                set({ isLoading: false });
                return () => abortController.abort();
              }

              // Check if on setup page
              const isSetupPage = window.location.pathname === '/setup';
              if (isSetupPage) {
                try {
                  if (!api || typeof api.get !== 'function') {
                    console.warn('⚠️ API not available, skipping setup check');
                    set({ isLoading: false });
                    return () => abortController.abort();
                  }

                  const response = await api.get('/auth/v1/Setup/status', { signal });
                  if (signal.aborted) return () => abortController.abort();

                  const status = response?.data?.data || response?.data || {};
                  const isSetupComplete = status?.isSetupComplete || false;
                  const userCount = status?.userCount || 0;

                  if (isSetupComplete || userCount > 0) {
                    window.location.href = '/login';
                    set({ isLoading: false });
                    return () => abortController.abort();
                  }
                } catch (error) {
                  if (!signal.aborted) {
                    console.error('❌ Failed to check setup status:', error);
                  }
                }
                set({ isLoading: false });
                return () => abortController.abort();
              }

              // Get token from storage
              const token = Cookies.get("accessToken") ||
                  localStorage.getItem("accessToken") ||
                  sessionStorage.getItem("accessToken");

              if (token) {
                try {
                  const decoded = jwtDecode<JwtPayload>(token);
                  const currentTime = Math.floor(Date.now() / 1000);
                  const isExpired = decoded.exp ? decoded.exp < currentTime : false;

                  if (isExpired) {
                    try {
                      await get().refresh();
                      set({ isLoading: false });
                      return () => abortController.abort();
                    } catch (refreshError) {
                      get().logoutOnExpiration();
                      set({ isLoading: false });
                      return () => abortController.abort();
                    }
                  }

                  // Set token and fetch data
                  await get().setToken(token, signal);
                  if (signal.aborted) return () => abortController.abort();

                  const userId = decoded.userId || null;
                  if (userId) {
                    await get().fetchOrganizationDetails(userId, signal);
                  }

                  if (!signal.aborted) {
                    await get().fetchMenuStructure(signal);
                  }
                } catch (error) {
                  if (!signal.aborted) {
                    console.error("❌ Failed to decode token:", error);
                  }
                  get().logoutOnExpiration();
                  set({ isLoading: false });
                  return () => abortController.abort();
                }
              } else {
                // Redirect to login if on protected page
                const protectedPaths = [
                  '/modules', '/hr', '/finance', '/core', '/crm',
                  '/inventory', '/procurement', '/file', '/plandev',
                  '/project-management'
                ];
                const currentPath = window.location.pathname;
                const isProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));

                if (isProtectedPath) {
                  window.location.href = '/login';
                }

                set({ isLoading: false });
              }
            } catch (error) {
              if (!signal.aborted) {
                console.error('❌ Init error:', error);
              }
              set({ isLoading: false });
            }

            // Return cleanup function
            return () => {
              abortController.abort();
            };
          },

          // ============================================================
          // LOGIN
          // ============================================================

          login: async (username, password) => {
            try {
              if (typeof loginApi !== 'function') {
                throw new Error("Authentication service is not available. Please try again later.");
              }

              const tokens = await loginApi({ username, password });

              if (!tokens || !tokens.accessToken) {
                throw new Error("No authentication token received.");
              }

              const expiresDate = new Date(tokens.expiresDate);
              const isProduction = import.meta.env.PROD || import.meta.env.NODE_ENV === "production";

              // Clear existing auth data
              clearAllAuthStorage();

              // Set new auth data
              Cookies.set("accessToken", tokens.accessToken, {
                expires: expiresDate,
                secure: isProduction,
                sameSite: "lax",
                path: "/",
              });

              Cookies.set("expiresAt", tokens.expiresDate, {
                expires: expiresDate,
                secure: isProduction,
                sameSite: "lax",
                path: "/",
              });

              localStorage.setItem("accessToken", tokens.accessToken);
              localStorage.setItem("expiresAt", tokens.expiresDate);
              sessionStorage.setItem("accessToken", tokens.accessToken);
              sessionStorage.setItem("expiresAt", tokens.expiresDate);

              const loginData = tokens.data || tokens || {};

              set({
                token: tokens.accessToken,
                userId: loginData.userId ?? null,
                employeeId: loginData.employeeId ?? null,
                userName: loginData.userName ?? null,
                role: loginData.role ?? null,
                isAuthenticated: true,
                isLoading: false,
                branchId: loginData.branchId ?? null,
                branchName: loginData.branchName ?? null,
                branchCode: loginData.branchCode ?? null,
                departmentId: loginData.departmentId ?? null,
                departmentName: loginData.departmentName ?? null,
                positionId: loginData.positionId ?? null,
                positionName: loginData.positionName ?? null,
                jobGradeId: loginData.jobGradeId ?? null,
                jobGradeName: loginData.jobGradeName ?? null,
              });

              // Fetch organization details if not in login response
              if (!loginData.branchName && !loginData.departmentName && !loginData.positionName) {
                const userId = loginData.userId || null;
                if (userId) {
                  await get().fetchOrganizationDetails(userId);
                }
              }

              await get().fetchMenuStructure();

              // Clear logout redirect flag
              sessionStorage.removeItem('logout_redirect');
            } catch (error) {
              console.error("Login failed:", error);
              throw error;
            }
          },

          // ============================================================
          // REFRESH
          // ============================================================

          refresh: async () => {
            try {
              if (typeof refreshTokenApi !== 'function') {
                throw new Error("Refresh service is not available.");
              }

              const tokens = await refreshTokenApi();

              if (!tokens || !tokens.accessToken) {
                throw new Error("No token received from refresh.");
              }

              const expiresDate = new Date(tokens.expiresDate);
              const isProduction = import.meta.env.PROD || import.meta.env.NODE_ENV === "production";

              Cookies.set("accessToken", tokens.accessToken, {
                expires: expiresDate,
                secure: isProduction,
                sameSite: "lax",
                path: "/",
              });

              Cookies.set("expiresAt", tokens.expiresDate, {
                expires: expiresDate,
                secure: isProduction,
                sameSite: "lax",
                path: "/",
              });

              localStorage.setItem("accessToken", tokens.accessToken);
              localStorage.setItem("expiresAt", tokens.expiresDate);

              await get().setToken(tokens.accessToken);

              console.log("Token refreshed successfully");
            } catch (error) {
              console.error("Token refresh failed:", error);
              get().logoutOnExpiration();
              throw error;
            }
          },

          // ============================================================
          // LOGOUT
          // ============================================================

          logout: () => {
            sessionStorage.setItem('logout_redirect', 'true');
            clearAllAuthStorage();
            queryClient.clear();

            set({
              token: null,
              userId: null,
              employeeId: null,
              userName: null,
              role: null,
              permissions: null,
              permissionHash: null,
              isAuthenticated: false,
              isLoading: false,
              isMenuLoaded: false,
              branchId: null,
              branchName: null,
              branchCode: null,
              departmentId: null,
              departmentName: null,
              positionId: null,
              positionName: null,
              jobGradeId: null,
              jobGradeName: null,
            });

            window.location.href = '/login';
          },

          logoutOnExpiration: () => {
            sessionStorage.setItem('logout_redirect', 'true');
            clearAllAuthStorage();
            queryClient.clear();

            set({
              token: null,
              userId: null,
              employeeId: null,
              userName: null,
              role: null,
              permissions: null,
              permissionHash: null,
              isAuthenticated: false,
              isLoading: false,
              isMenuLoaded: false,
              branchId: null,
              branchName: null,
              branchCode: null,
              departmentId: null,
              departmentName: null,
              positionId: null,
              positionName: null,
              jobGradeId: null,
              jobGradeName: null,
            });

            if (window.location.pathname !== '/login' && window.location.pathname !== '/setup') {
              window.location.href = '/login';
            }
          },

          // ============================================================
          // SET TOKEN
          // ============================================================

          setToken: async (token: string, signal?: AbortSignal) => {
            try {
              if (signal?.aborted) return;

              const decoded = jwtDecode<JwtPayload>(token);
              const permissionHash = decoded.ph || null;

              // ✅ Direct object update (fixes thenable error)
              set({
                token,
                userId: decoded.userId ?? null,
                employeeId: decoded.employeeId ?? null,
                userName: decoded.userName ?? null,
                role: decoded.role ?? null,
                permissionHash: permissionHash,
                isAuthenticated: true,
                isLoading: false,
                branchId: decoded.branchId ?? null,
                branchName: decoded.branchName ?? null,
                branchCode: decoded.branchCode ?? null,
                departmentId: decoded.departmentId ?? null,
                departmentName: decoded.departmentName ?? null,
                positionId: decoded.positionId ?? null,
                positionName: decoded.positionName ?? null,
                jobGradeId: decoded.jobGradeId ?? null,
                jobGradeName: decoded.jobGradeName ?? null,
              });

              const isSettingsPage = window.location.pathname?.startsWith('/settings');
              if (!isSettingsPage) {
                await get().fetchMenuStructure(signal);
              } else {
                set({ isMenuLoaded: true });
              }
            } catch (error) {
              if (!signal?.aborted) {
                console.error("Failed to decode token:", error);
              }
              // ✅ Direct object update
              set({
                token: null,
                userId: null,
                employeeId: null,
                userName: null,
                role: null,
                permissions: null,
                permissionHash: null,
                isAuthenticated: false,
                isLoading: false,
                isMenuLoaded: false,
                branchId: null,
                branchName: null,
                branchCode: null,
                departmentId: null,
                departmentName: null,
                positionId: null,
                positionName: null,
                jobGradeId: null,
                jobGradeName: null,
              });
            }
          },

          // ============================================================
          // FETCH MENU STRUCTURE
          // ============================================================

          fetchMenuStructure: async (signal?: AbortSignal) => {
            try {
              if (signal?.aborted) return;

              if (get().isMenuLoaded && get().permissions && get().permissions.length > 0) {
                return;
              }

              const token = get().token;
              if (!token) {
                console.warn("No token available, skipping menu fetch");
                return;
              }

              if (typeof fetchMenuStructure !== 'function') {
                console.warn("fetchMenuStructure not available, using empty permissions");
                set({
                  permissions: [],
                  isMenuLoaded: true,
                });
                return;
              }

              const menuData = await fetchMenuStructure();
              if (signal?.aborted) return;

              if (menuData && Array.isArray(menuData) && menuData.length > 0) {
                const normalizedPermissions = normalizePermissions(menuData);
                set({
                  permissions: normalizedPermissions,
                  isMenuLoaded: true,
                });
              } else {
                console.warn("Menu data is empty or invalid:", menuData);
                set({
                  permissions: [],
                  isMenuLoaded: true,
                });
              }
            } catch (error) {
              if (!signal?.aborted) {
                console.error("Failed to fetch menu structure:", error);
              }
              set({
                permissions: [],
                isMenuLoaded: true,
              });
            }
          },

          // ============================================================
          // HAS PERMISSION
          // ============================================================

          hasPermission: async (permission: string): Promise<boolean> => {
            try {
              const { permissions } = get();

              if (permissions && permissions.length > 0) {
                const allApiKeys: string[] = [];
                for (const module of permissions) {
                  if (module.M) {
                    for (const menu of module.M) {
                      if (menu.A && Array.isArray(menu.A)) {
                        allApiKeys.push(...menu.A);
                      }
                      if (menu.C) {
                        const flattenChildren = (children: any[]) => {
                          for (const child of children) {
                            if (child.A && Array.isArray(child.A)) {
                              allApiKeys.push(...child.A);
                            }
                            if (child.C) {
                              flattenChildren(child.C);
                            }
                          }
                        };
                        flattenChildren(menu.C);
                      }
                    }
                  }
                }
                return allApiKeys.includes(permission);
              }

              if (typeof fetchPermissionKeys !== 'function') {
                console.warn("fetchPermissionKeys not available");
                return false;
              }

              const permissionKeys = await fetchPermissionKeys();
              return permissionKeys.includes(permission);
            } catch (error) {
              console.error("Failed to check permission:", error);
              return false;
            }
          },

          // ============================================================
          // CLEAR TOKEN
          // ============================================================

          clearToken: () => {
            clearAllAuthStorage();

            set({
              token: null,
              userId: null,
              employeeId: null,
              userName: null,
              role: null,
              permissions: null,
              permissionHash: null,
              isAuthenticated: false,
              isLoading: false,
              isMenuLoaded: false,
              branchId: null,
              branchName: null,
              branchCode: null,
              departmentId: null,
              departmentName: null,
              positionId: null,
              positionName: null,
              jobGradeId: null,
              jobGradeName: null,
            });
          },
        }),
        {
          name: "auth-storage",
          partialize: (state) => ({
            userId: state.userId,
            employeeId: state.employeeId,
            userName: state.userName,
            role: state.role,
            permissionHash: state.permissionHash,
            token: state.token,
            isAuthenticated: state.isAuthenticated,
            permissions: state.permissions,
            branchId: state.branchId,
            branchName: state.branchName,
            branchCode: state.branchCode,
            departmentId: state.departmentId,
            departmentName: state.departmentName,
            positionId: state.positionId,
            positionName: state.positionName,
            jobGradeId: state.jobGradeId,
            jobGradeName: state.jobGradeName,
          }),
          merge: (persistedState, currentState) => {
            const state = { ...currentState, ...persistedState };

            if (state.token) {
              try {
                const decoded = jwtDecode<JwtPayload>(state.token);
                const currentTime = Math.floor(Date.now() / 1000);
                if (decoded.exp && decoded.exp < currentTime) {
                  clearAllAuthStorage();
                  return {
                    ...state,
                    token: null,
                    isAuthenticated: false,
                    userId: null,
                    employeeId: null,
                    userName: null,
                    role: null,
                    permissions: null,
                    permissionHash: null,
                    isMenuLoaded: false,
                  };
                }
              } catch {
                return {
                  ...state,
                  token: null,
                  isAuthenticated: false,
                };
              }
            }

            return state;
          },
        }
    )
);

export default useAuthStore;