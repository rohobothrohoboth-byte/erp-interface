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

// ✅ Normalize permission keys and preserve hierarchy
const normalizePermissions = (data: any[]): NormalizedModule[] => {
  if (!data || !Array.isArray(data)) return [];

  const normalizeMenu = (menu: any): NormalizedMenu => {
    const children = (menu.c || menu.C || []).map((child: any) => normalizeMenu(child));

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

  const buildMenuTree = (menus: any[], parentId: string | null = null): NormalizedMenu[] => {
    return menus
        .filter(menu => {
          const menuParentId = menu.ParentId || menu.parentId || null;
          return menuParentId === parentId;
        })
        .sort((a, b) => (a.O || a.o || 0) - (b.O || b.o || 0))
        .map(menu => normalizeMenu(menu));
  };

  return data.map((module: any) => {
    const menus = module.menus || module.M || module.m || [];
    return {
      K: module.k || module.K || '',
      L: module.l || module.L || '',
      M: buildMenuTree(menus, null),
    };
  });
};

// ============================================================
// MENU CATALOG (full menu hierarchy, keyed by menu key)
// ============================================================
// The runtime /Menu/structure endpoint can return the user's menus without
// their parent/group containers (orphaned), which makes the sidebar render
// flat. We fetch the full menu catalog (every menu + its ParentKey + label)
// and use it to rebuild the correct hierarchy, re-inserting any missing
// ancestor groups with their real labels/icons.

interface CatalogEntry {
  label: string;
  path: string;
  icon: string;
  order: number;
  parentKey: string;
}

const fetchMenuCatalog = async (): Promise<Record<string, CatalogEntry>> => {
  try {
    if (!api || typeof api.get !== 'function') return {};
    const res = await api.get('/auth/v1/Permission/AllPerMenu');
    const list = res?.data?.data || res?.data || [];
    if (!Array.isArray(list)) return {};

    const map: Record<string, CatalogEntry> = {};
    for (const m of list) {
      const key = m.key || m.Key;
      if (!key) continue;
      map[key] = {
        label: m.label || m.Label || key,
        path: m.path || m.Path || '',
        icon: m.icon || m.Icon || '',
        order: m.order ?? m.Order ?? 0,
        parentKey: m.parentKey || m.ParentKey || '',
      };
    }
    return map;
  } catch (error) {
    console.warn('⚠️ Could not fetch menu catalog, using raw menu structure:', error);
    return {};
  }
};

// Rebuild each module's menu tree from the user's permitted menus plus the
// catalog, so parent/group nodes always appear and children nest correctly.
const normalizeWithCatalog = (
    data: any[],
    catalog: Record<string, CatalogEntry>
): NormalizedModule[] => {
  if (!data || !Array.isArray(data)) return [];

  return data.map((module: any): NormalizedModule => {
    const moduleKey = module.k || module.K || '';
    const moduleLabel = module.l || module.L || '';
    const rawMenus = module.menus || module.M || module.m || [];

    // Flatten the menus the user is permitted to see (any nesting depth).
    const permitted = new Map<string, { A: string[]; P: string; L: string; I: string; O: number }>();
    const collect = (menus: any[]) => {
      for (const mu of menus || []) {
        const key = mu.k || mu.K;
        if (!key) continue;
        permitted.set(key, {
          A: mu.a || mu.A || [],
          P: mu.p || mu.P || '',
          L: mu.l || mu.L || '',
          I: mu.i || mu.I || '',
          O: mu.o ?? mu.O ?? 0,
        });
        const children = mu.c || mu.C;
        if (children && children.length) collect(children);
      }
    };
    collect(rawMenus);

    // Include each permitted menu plus all of its ancestors (from the catalog).
    const include = new Set<string>();
    for (const key of permitted.keys()) {
      let k: string = key;
      let guard = 0;
      while (k && !include.has(k) && guard++ < 25) {
        include.add(k);
        const parent = catalog[k]?.parentKey;
        k = parent && parent !== k ? parent : '';
      }
    }

    const nodes = new Map<string, NormalizedMenu>();
    for (const key of include) {
      const cat = catalog[key];
      const perm = permitted.get(key);
      nodes.set(key, {
        K: key,
        L: perm?.L || cat?.label || key,
        P: perm?.P || cat?.path || '',
        I: cat?.icon || perm?.I || '',
        O: cat?.order ?? perm?.O ?? 0,
        A: perm?.A || [],
        C: [],
      });
    }

    // Link children to parents using the catalog's ParentKey.
    const roots: NormalizedMenu[] = [];
    for (const [key, node] of nodes) {
      const parentKey = catalog[key]?.parentKey || '';
      const parent = parentKey ? nodes.get(parentKey) : undefined;
      if (parent) {
        (parent.C as NormalizedMenu[]).push(node);
      } else {
        roots.push(node);
      }
    }

    const sortRec = (list: NormalizedMenu[]) => {
      list.sort((a, b) => (a.O || 0) - (b.O || 0));
      for (const n of list) {
        if (n.C && n.C.length) sortRec(n.C as NormalizedMenu[]);
        else n.C = null;
      }
    };
    sortRec(roots);

    return { K: moduleKey, L: moduleLabel, M: roots };
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
                // Rebuild the hierarchy from the full menu catalog so parent
                // groups always render and children nest correctly, even when
                // /Menu/structure returns them orphaned. Fall back to the raw
                // structure if the catalog is unavailable.
                const catalog = await fetchMenuCatalog();
                if (signal?.aborted) return;

                const normalizedPermissions = catalog && Object.keys(catalog).length > 0
                    ? normalizeWithCatalog(menuData, catalog)
                    : normalizePermissions(menuData);
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