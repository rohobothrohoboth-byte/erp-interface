// src/pages/Modules.tsx

import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import {
  Briefcase, LogOut, User, Settings, Shield,
  Sparkles, CheckCircle, Clock,
  Sun, Moon, Activity, LayoutDashboard,
  HelpCircle, ChevronRight, Globe, Zap,
  Users, Package, TrendingUp, DollarSign, ClipboardList,
  FolderOpen, Target, Heart, CreditCard, ShoppingCart, FileText, Cpu,
  Folder, BarChart, AlertCircle, Calendar, Check, Copy, Eye, EyeOff, Key, Lock,
  MoreVertical, PenBox, RefreshCw, Search, Trash2, XCircle, Plus, Star,
  Building2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useAuthStore } from "@/shared/stores/auth.store";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useThemeStore } from "@/shared/stores/theme.store";
import { useModuleStore } from "@/shared/stores/module.store";
import { authListApi } from "@/modules/list/services/auth/authList.api";
import NotificationCenter from '@/modules/dashboard/components/NotificationCenter';
import TaskManager from '@/modules/dashboard/components/TaskManager';
import TaskCalendar from '@/modules/dashboard/components/TaskCalendar';
import api from "@/shared/services/api";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "@/modules/auth/types/auth.types";

/* ==================== TYPES ==================== */

interface ModuleFromAPI {
  id: string;
  name: string;
  key: string;
  icon?: string;
  order?: number;
}

interface UserPermissions {
  userId: string;
  employeeId: string;
  modules: string[];
  menus: string[];
}

/* ==================== DYNAMIC MODULE CONFIG BUILDER ==================== */

const ICON_COMPONENT_MAP: Record<string, React.ElementType> = {
  Settings, Users, DollarSign, Package, Heart, ShoppingCart, Target,
  Briefcase, Folder, FolderOpen, BarChart, TrendingUp, CreditCard, Cpu,
  ClipboardList, LayoutDashboard, FileText, Shield, Activity, Zap, Globe,
  Calendar, Check, Copy, Eye, EyeOff, Key, Lock, MoreVertical, PenBox,
  RefreshCw, Search, Trash2, XCircle, Plus, Star, AlertCircle,
  LogOut, User, Sparkles, CheckCircle, Clock, Sun, Moon,
  HelpCircle, ChevronRight,
};

const GRADIENT_MAP: Record<string, string> = {
  "mod.core": "from-blue-500 to-indigo-600",
  "mod.hrm": "from-emerald-500 to-teal-600",
  "mod.fnm": "from-indigo-500 to-purple-600",
  "mod.inv": "from-amber-500 to-orange-600",
  "mod.crm": "from-purple-500 to-pink-600",
  "mod.pro": "from-rose-500 to-red-600",
  "mod.pld": "from-violet-500 to-purple-600",
  "mod.prm": "from-yellow-500 to-amber-600",
  "mod.flm": "from-cyan-500 to-blue-600",
  "mod.rpt": "from-slate-500 to-gray-600",
  "default": "from-slate-500 to-gray-600",
};

const PATH_MAP: Record<string, string> = {
  "mod.core": "/core",
  "mod.hrm": "/hr",
  "mod.fnm": "/finance",
  "mod.inv": "/inventory",
  "mod.crm": "/crm",
  "mod.pro": "/procurement",
  "mod.pld": "/plandev",
  "mod.prm": "/project-management",
  "mod.flm": "/file",
  "mod.rpt": "/reports",
  "default": "/dashboard",
};

const DESCRIPTION_MAP: Record<string, string> = {
  "mod.core": "coreSystem",
  "mod.hrm": "hrManagement",
  "mod.fnm": "finance",
  "mod.inv": "inventory",
  "mod.crm": "crm",
  "mod.pro": "procurement",
  "mod.pld": "planAndDevelopment",
  "mod.prm": "projectManagement",
  "mod.flm": "fileManagement",
  "mod.rpt": "reportsAndAnalytics",
  "default": "moduleAccessHint",
};

function getIconComponent(iconName?: string): React.ElementType {
  if (iconName && ICON_COMPONENT_MAP[iconName]) {
    return ICON_COMPONENT_MAP[iconName];
  }
  return LayoutDashboard;
}

function getGradient(moduleKey: string): string {
  return GRADIENT_MAP[moduleKey] || GRADIENT_MAP.default;
}

function getPath(moduleKey: string): string {
  return PATH_MAP[moduleKey] || PATH_MAP.default;
}

function getDescriptionKey(moduleKey: string): string {
  return DESCRIPTION_MAP[moduleKey] || DESCRIPTION_MAP.default;
}

/* ==================== MODULES PAGE ==================== */

function Modules() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    logout,
    isAuthenticated,
    isLoading,
    role,
    userName,
    token,
    userId: storeUserId,
    permissions: rawPermissions,
    branchName,
    departmentName,
    positionName,
    branchId,
    departmentId,
    positionId
  } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { setActiveModule } = useModuleStore();
  const [helpOpen, setHelpOpen] = useState(false);
  const [modulesFromAPI, setModulesFromAPI] = useState<ModuleFromAPI[]>([]);
  const [userModuleKeys, setUserModuleKeys] = useState<string[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');

  // ✅ Organization display name
  const orgDisplay = useMemo(() => {
    const parts = [];
    if (branchName) parts.push(branchName);
    if (departmentName) parts.push(departmentName);
    if (positionName) parts.push(positionName);
    return parts.length > 0 ? parts.join(' • ') : 'No Organization Assigned';
  }, [branchName, departmentName, positionName]);

  // ✅ Short org display for mobile
  const shortOrgDisplay = useMemo(() => {
    if (branchName && departmentName) {
      return `${branchName} • ${departmentName}`;
    }
    return branchName || departmentName || 'No Org';
  }, [branchName, departmentName]);

  // ✅ Check if user has org info
  const hasOrgInfo = useMemo(() => {
    return !!(branchName || departmentName || positionName);
  }, [branchName, departmentName, positionName]);

  // ✅ Use permissions directly from auth store (already processed)
  const permissions = useMemo(() => {
    if (!rawPermissions) return [];
    if (Array.isArray(rawPermissions)) return rawPermissions;
    return [];
  }, [rawPermissions]);

  // ✅ Get userId from JWT token or store
  const userId = useMemo(() => {
    if (storeUserId) return storeUserId;
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.userId || null;
    } catch {
      return null;
    }
  }, [token, storeUserId]);

  // Fetch all available modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoadingModules(true);
        const data = await authListApi.getAllModuleNames();

        setModulesFromAPI(data);
      } catch (error) {
        console.error('❌ Error fetching modules:', error);
        setModulesFromAPI([]);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, []);

  // ✅ Fetch user's permissions using userId
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!userId) {
        console.warn('⚠️ No userId available');
        setLoadingPermissions(false);
        return;
      }

      try {
        setLoadingPermissions(true);
        const response = await api.get(`/auth/v1/Permission/GetPerMenuByUser/${userId}`);

        // Backend may return PascalCase (Modules) or camelCase (modules)
        const raw = response.data?.data ?? response.data ?? {};
        const moduleGuids: string[] = raw.modules ?? raw.Modules ?? [];

        if (Array.isArray(moduleGuids) && moduleGuids.length > 0) {
          const moduleGuidToKeyMap = new Map<string, string>();
          modulesFromAPI.forEach((module) => {
            if (module.id && module.key) {
              moduleGuidToKeyMap.set(String(module.id).toLowerCase(), module.key);
            }
          });

          const userKeys = moduleGuids
            .map((guid) => moduleGuidToKeyMap.get(String(guid).toLowerCase()))
            .filter((key): key is string => Boolean(key));

          if (userKeys.length > 0) {
            setUserModuleKeys(userKeys);
          } else {
            // GUID map miss — fall back to already-loaded menu structure / token
            const structureKeys = getModuleKeysFromMenuStructure();
            const tokenKeys = getModuleKeysFromToken();
            setUserModuleKeys(structureKeys.length > 0 ? structureKeys : tokenKeys);
          }
        } else {
          console.warn('⚠️ No modules found in permissions response');
          const structureKeys = getModuleKeysFromMenuStructure();
          const tokenKeys = getModuleKeysFromToken();
          setUserModuleKeys(structureKeys.length > 0 ? structureKeys : tokenKeys);
        }
      } catch (error) {
        console.error('❌ Error fetching permissions:', error);
        const tokenKeys = getModuleKeysFromToken();
        setUserModuleKeys(tokenKeys.length > 0 ? tokenKeys : []);
      } finally {
        setLoadingPermissions(false);
      }
    };

    if (modulesFromAPI.length > 0 && userId) {
      fetchUserPermissions();
    } else if (modulesFromAPI.length > 0 && !userId) {
      setLoadingPermissions(false);
    }
  }, [userId, modulesFromAPI]);

  const getModuleKeysFromToken = (): string[] => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) return [];

      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.permissionKeys) {
        try {
          const permissionKeys = typeof payload.permissionKeys === 'string'
              ? JSON.parse(payload.permissionKeys)
              : payload.permissionKeys;
          if (Array.isArray(permissionKeys)) {
            const moduleKeys = permissionKeys
                .map((key: string) => {
                  const parts = key.split('.');
                  return parts.length >= 2 ? `mod.${parts[0]}` : null;
                })
                .filter((key: string | null): key is string => key !== null);
            return [...new Set(moduleKeys)];
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse permission keys:', e);
        }
      }
      return [];
    } catch (error) {
      console.error('❌ Error extracting permissions:', error);
      return [];
    }
  };

  const getModuleKeysFromMenuStructure = (): string[] => {
    if (!Array.isArray(rawPermissions) || rawPermissions.length === 0) return [];
    return [...new Set(rawPermissions.map((m: any) => m.K || m.k).filter(Boolean))];
  };

  // ✅ 1. Timer effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ✅ 2. Auth check effect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const formatTime = useCallback((d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), []);
  const formatDate = useCallback((d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), []);

  const isAdmin = role === "admin";
  const isCEO = role === "ceo";
  const isViceCEO = role === "vice.ceo" || role === "vice_ceo";
  const isAuditor = role === "auditor";
  const isSuperAdmin = userId === "229031cf-fada-40ea-9757-4033e6e10c21";
  const isPrivilegedRole = isAdmin || isCEO || isViceCEO || isAuditor || isSuperAdmin;

  const getTranslatedModuleName = useCallback((moduleKey: string, defaultName: string): string => {
    const translationKey = `module.${moduleKey}`;
    if (t[translationKey as keyof typeof t]) {
      return t[translationKey as keyof typeof t] as string;
    }
    return defaultName;
  }, [t]);

  const getModuleDescription = useCallback((descriptionKey: string): string => {
    const translationKey = DESCRIPTION_MAP[descriptionKey] || DESCRIPTION_MAP.default;
    if (t[translationKey as keyof typeof t]) {
      return t[translationKey as keyof typeof t] as string;
    }
    return t.moduleAccessHint || 'Click to access';
  }, [t]);

  // ✅ accessibleModules
  const accessibleModules = useMemo(() => {


    if (loadingModules || loadingPermissions) {
      return [];
    }

    if (modulesFromAPI.length === 0) {
      return [];
    }

    // Super admin gets all modules
    if (isSuperAdmin) {

      return modulesFromAPI.map(module => ({
        key: module.key,
        name: getTranslatedModuleName(module.key, module.name),
        icon: getIconComponent(module.icon),
        gradient: getGradient(module.key),
        path: getPath(module.key),
        descriptionKey: module.key,
        order: module.order || 0,
      }));
    }

    if (userModuleKeys.length === 0) {

      return [];
    }

    const userModuleKeySet = new Set(userModuleKeys);
    const accessible = modulesFromAPI
        .filter(module => userModuleKeySet.has(module.key))
        .map(module => ({
          key: module.key,
          name: getTranslatedModuleName(module.key, module.name),
          icon: getIconComponent(module.icon),
          gradient: getGradient(module.key),
          path: getPath(module.key),
          descriptionKey: module.key,
          order: module.order || 0,
        }));


    return accessible;
  }, [modulesFromAPI, userModuleKeys, isSuperAdmin, loadingModules, loadingPermissions, getTranslatedModuleName]);

  // ✅ 3. Set active module when permissions are loaded
  useEffect(() => {
    if (!loadingPermissions && !loadingModules && accessibleModules.length > 0) {
      let targetModule = accessibleModules.find(m => m.key === 'mod.hrm');
      if (!targetModule) {
        targetModule = accessibleModules.find(m => m.key === 'mod.core');
      }
      if (!targetModule) {
        targetModule = accessibleModules[0];
      }

      if (targetModule && targetModule.key) {

        setActiveModule(targetModule.key);
      }
    }
  }, [loadingPermissions, loadingModules, accessibleModules, setActiveModule]);

  const sortedModules = useMemo(() => {
    return [...accessibleModules].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [accessibleModules]);

  const singleModule = sortedModules.length === 1;

  const handleModuleClick = useCallback((moduleKey: string, path: string) => {
    setActiveModule(moduleKey);
    navigate(path);
  }, [navigate, setActiveModule]);

  if (isLoading || loadingModules || loadingPermissions) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
        </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-y-auto">
        {/* Background Grid */}
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Header - Sticky */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 shadow-sm">
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">RST ERP</h1>
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">{t.enterpriseResourcePlanning}</p>
              </div>
            </div>

            {/* Center - Organization Info - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-4 text-slate-500 dark:text-slate-400 flex-1 justify-center min-w-0">
              {hasOrgInfo ? (
                  <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    {branchName && (
                        <>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Building2 size={12} className="text-emerald-500" />
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                            {branchName}
                          </span>
                          </div>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                        </>
                    )}
                    {departmentName && (
                        <>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Users size={12} className="text-blue-500" />
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                            {departmentName}
                          </span>
                          </div>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                        </>
                    )}
                    {positionName && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Briefcase size={12} className="text-purple-500" />
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                          {positionName}
                        </span>
                        </div>
                    )}
                  </div>
              ) : (
                  <div className="text-xs text-slate-400">No Organization Assigned</div>
              )}

              {/* Date/Time */}
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 flex-shrink-0">
                <Activity size={14} />
                <span className="text-sm font-mono">{formatDate(currentTime)} • {formatTime(currentTime)}</span>
              </div>
            </div>

            {/* Center - Short Org Info (Mobile/Tablet) */}
            <div className="flex lg:hidden items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px] sm:max-w-[150px] flex-1 justify-center">
              <Building2 size={10} className="text-emerald-500 flex-shrink-0" />
              <span className="truncate">{shortOrgDisplay}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button onClick={toggleDarkMode} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {isDarkMode ? <Sun size={16} className="sm:w-5 sm:h-5" /> : <Moon size={16} className="sm:w-5 sm:h-5" />}
              </button>

              <Popover open={helpOpen} onOpenChange={setHelpOpen}>
                <PopoverTrigger asChild>
                  <button className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 sm:w-64 p-0 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.helpAndSupport}</p>
                  </div>
                  <div className="p-2">
                    {[
                      { icon: Globe, label: t.documentation, onClick: () => window.open('/docs', '_blank') },
                      { icon: HelpCircle, label: t.faq, onClick: () => navigate('/faq') },
                      { icon: Zap, label: t.contactSupport, onClick: () => window.open('mailto:support@rst.com') }
                    ].map(item => (
                        <button
                            key={item.label}
                            onClick={() => { item.onClick(); setHelpOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <item.icon className="w-4 h-4" /> {item.label}
                        </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <NotificationCenter />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-white dark:ring-slate-800 shadow-lg cursor-pointer">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs sm:text-sm">
                        {userName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
                  <DropdownMenuLabel>
                    <div className="text-sm font-semibold">{userName || t.employee}</div>
                    <div className="text-xs text-slate-500 capitalize">{role || t.employee}</div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      {branchName && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Building2 size={12} className="text-emerald-500" />
                            <span>{branchName}</span>
                          </div>
                      )}
                      {departmentName && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Users size={12} className="text-blue-500" />
                            <span>{departmentName}</span>
                          </div>
                      )}
                      {positionName && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Briefcase size={12} className="text-purple-500" />
                            <span>{positionName}</span>
                          </div>
                      )}
                      {!branchName && !departmentName && !positionName && (
                          <div className="text-xs text-slate-400 italic">No organization assigned</div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" /> {t.profile}
                  </DropdownMenuItem>
                  {isPrivilegedRole && (
                      <DropdownMenuItem onSelect={() => navigate("/settings")}>
                        <Settings className="w-4 h-4 mr-2" /> {t.settings}
                      </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => navigate("/modules")}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> {t.dashboard}
                  </DropdownMenuItem>
                  {isSuperAdmin && (
                      <DropdownMenuItem onSelect={() => navigate("/admin")}>
                        <Shield className="w-4 h-4 mr-2" /> {t.adminPanel}
                      </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" /> {t.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content - SCROLLABLE */}
        <main className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6 lg:py-8">
          {/* Welcome Section */}
          <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-500 flex-shrink-0" />
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-200 truncate">
                {t.welcomeBack}, {userName || t.employee}
              </h2>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1">
              <span>{sortedModules.length} {sortedModules.length !== 1 ? t.modules : t.module} {t.available}</span>
              <span className="hidden xs:inline">•</span>
              <span className="capitalize">{t.role}: {role || t.employee}</span>
              {hasOrgInfo && (
                  <>
                    <span className="hidden xs:inline">•</span>
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs md:text-sm">
                  <Building2 size={12} className="text-emerald-500 flex-shrink-0" />
                  <span className="truncate max-w-[60px] xs:max-w-[80px] sm:max-w-[120px] md:max-w-[200px]">{branchName}</span>
                      {departmentName && (
                          <>
                            <span className="text-slate-300 hidden xs:inline">|</span>
                            <Users size={12} className="text-blue-500 flex-shrink-0 hidden xs:inline" />
                            <span className="truncate max-w-[60px] xs:max-w-[80px] sm:max-w-[120px] md:max-w-[150px] hidden xs:inline">{departmentName}</span>
                          </>
                      )}
                </span>
                  </>
              )}
            </p>
          </div>

          {/* FULLY SCROLLABLE LAYOUT */}
          <div className="flex flex-col lg:flex-row lg:gap-4 xl:gap-6">
            {/* Modules Grid - ALL modules visible, page scrolls naturally */}
            <div className="flex-1 min-w-0">
              {sortedModules.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 md:py-12 lg:py-16 bg-white/50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                    <Shield className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-2 sm:mb-3 md:mb-4" />
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-600">{t.noModulesAvailable}</h3>
                    <p className="text-xs sm:text-sm text-slate-500">{t.contactAdmin}</p>
                  </div>
              ) : (
                  <div className={`grid gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 ${
                      singleModule
                          ? 'grid-cols-1 max-w-xs sm:max-w-sm mx-auto lg:max-w-none'
                          : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
                  }`}>
                    {sortedModules.map((module, index) => {
                      const IconComponent = module.icon;
                      return (
                          <motion.div
                              key={module.key}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.3 }}
                              whileHover={{ scale: 1.02, y: -4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleModuleClick(module.key, module.path)}
                              className="group cursor-pointer"
                          >
                            <div className="relative p-2.5 sm:p-3 md:p-4 lg:p-5 xl:p-6 rounded-lg sm:rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                              <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                              </div>
                              <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200 mb-0.5 sm:mb-1 truncate">
                                {module.name}
                              </h3>
                              <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5 md:mb-2 lg:mb-3 line-clamp-2 hidden sm:block">
                                {getModuleDescription(module.descriptionKey)}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] sm:text-[10px] md:text-xs text-slate-400">{t.clickToAccess}</span>
                                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                              </div>
                            </div>
                          </motion.div>
                      );
                    })}
                  </div>
              )}
            </div>

            {/* Tasks Section - Scrolls with page */}
            <div className="mt-3 sm:mt-4 md:mt-6 lg:mt-0 lg:w-64 xl:w-72 2xl:w-80 lg:shrink-0">
              <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                  <button
                      className={`flex-1 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:py-3 text-[10px] sm:text-xs md:text-sm font-medium transition-colors ${
                          activeTab === 'list'
                              ? 'text-emerald-600 border-b-2 border-emerald-500'
                              : 'text-slate-500 hover:text-slate-700'
                      }`}
                      onClick={() => setActiveTab('list')}
                  >
                    {t.listView}
                  </button>
                  <button
                      className={`flex-1 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:py-3 text-[10px] sm:text-xs md:text-sm font-medium transition-colors ${
                          activeTab === 'calendar'
                              ? 'text-emerald-600 border-b-2 border-emerald-500'
                              : 'text-slate-500 hover:text-slate-700'
                      }`}
                      onClick={() => setActiveTab('calendar')}
                  >
                    {t.calendarView}
                  </button>
                </div>
                <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 max-h-[250px] sm:max-h-[300px] md:max-h-[350px] lg:max-h-[450px] xl:max-h-[500px] overflow-y-auto">
                  {activeTab === 'list' ? (
                      <TaskManager compact={true} />
                  ) : (
                      <TaskCalendar compact={true} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-4 sm:mt-6 md:mt-8 lg:mt-12 py-2 sm:py-3 md:py-4 lg:py-6 border-t border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-3 sm:px-4 text-center">
            <p className="text-[8px] sm:text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} RST ERP. {t.allRightsReserved} • {t.version} 2.0.0
            </p>
          </div>
        </footer>

        <style>{`
        .bg-grid-slate-100 { 
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E"); 
          background-repeat: repeat; 
          background-size: 32px 32px; 
        }
        .dark .bg-grid-slate-100 { 
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E"); 
        }
        @media (min-width: 480px) {
          .xs\\:inline { display: inline; }
        }
        @media (max-width: 479px) {
          .xs\\:inline { display: none; }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Ensure the page scrolls naturally */
        html, body {
          overflow-y: auto !important;
          height: auto !important;
        }
        #root {
          height: auto !important;
          min-height: 100vh;
        }
      `}</style>
      </div>
  );
}

export default Modules;