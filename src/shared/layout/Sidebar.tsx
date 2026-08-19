// src/components/Sidebar.tsx

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import {
    LayoutDashboard, Users, Building2, Trophy, Calendar,
    GraduationCap, FileSpreadsheet, ChevronDown, ChevronRight,
    ChevronLeft, Settings, BarChart4, FileText, RefreshCw,
    Warehouse, ClipboardList, FileCheck, CheckCircle2, Package,
    Briefcase, ClipboardCheck, LineChart, Building, Network,
    File, Folder, Archive, Shield, Clock, Upload,
    FolderOpen, Eye, FileSearch, Image, User, Trash2,
    Notebook, Mail, MessageSquare, DollarSign, Wallet,
    Layers, History, Target, CalendarDays, Sparkles,
    LogOut, Moon, Sun, Menu, X, Monitor, Users2,
    TrendingUp, ShoppingCart, CreditCard, Users as UsersIcon,
    UserPlus, UserCheck, UserCog, Briefcase as BriefcaseIcon,
    FileText as FileTextIcon, Calendar as CalendarIcon,
    Clock as ClockIcon, CheckSquare, Award, GitBranch,
    Clipboard, FileCheck as FileCheckIcon, UserCircle,
    PlusCircle, List, Settings as SettingsIcon, BarChart,
    PieChart, Activity, AlertCircle, Bell, Home, ChevronsRight
} from "lucide-react";
import { useModuleStore } from "@/shared/stores/module.store";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useSidebarStore } from "@/shared/stores/sidebar.store";
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { translateMenu } from '@/shared/i18n/translations/en';
import { useCompanyStore } from "@/shared/stores/company.store"; // Add this
/* ==================== TYPES ==================== */

interface PermissionMenu {
    K: string; // Menu key (GUID from API)
    L: string; // Display name
    P?: string; // Path
    I?: string; // Icon
    O?: number; // Order
    A: string[]; // Actions/permissions
    C?: PermissionMenu[] | null; // Children
}

interface PermissionModule {
    K: string; // Module key (e.g., "mod.hrm")
    L: string; // Module display name
    M: PermissionMenu[]; // Menus
}

interface NavItemProps {
    to: string;
    icon?: React.ReactElement;
    label: string;
    end?: boolean;
    isChild?: boolean;
    collapsed?: boolean;
    activeBg?: string;
    textColor?: string;
    hoverBg?: string;
    matchPaths?: string[];
    onClose?: () => void;
    labelKey?: string;
}

interface NavGroupProps {
    icon: React.ReactElement;
    label: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    collapsed?: boolean;
    hoverBg?: string;
    textColor?: string;
    activeBg?: string;
    labelKey?: string;
}

/* ==================== CONSTANTS ==================== */

const ICON_MAP: Record<string, React.ReactNode> = {
    dashboard: <LayoutDashboard size={18} />,
    layoutDashboard: <LayoutDashboard size={18} />,
    users: <UsersIcon size={18} />,
    user: <User size={18} />,
    userPlus: <UserPlus size={18} />,
    userCheck: <UserCheck size={18} />,
    userCog: <UserCog size={18} />,
    users2: <Users2 size={18} />,
    briefcase: <BriefcaseIcon size={18} />,
    clipboardCheck: <ClipboardCheck size={18} />,
    clipboard: <Clipboard size={18} />,
    fileText: <FileTextIcon size={18} />,
    calendar: <CalendarIcon size={18} />,
    clock: <ClockIcon size={18} />,
    checkSquare: <CheckSquare size={18} />,
    award: <Award size={18} />,
    gitBranch: <GitBranch size={18} />,
    fileCheck: <FileCheckIcon size={18} />,
    userCircle: <UserCircle size={18} />,
    plusCircle: <PlusCircle size={18} />,
    list: <List size={18} />,
    plus: <PlusCircle size={18} />,
    settings: <SettingsIcon size={18} />,
    barChart: <BarChart size={18} />,
    pieChart: <PieChart size={18} />,
    activity: <Activity size={18} />,
    alertCircle: <AlertCircle size={18} />,
    bell: <Bell size={18} />,
    home: <Home size={18} />,
    chevronsRight: <ChevronsRight size={18} />,
    building: <Building2 size={18} />,
    network: <Network size={18} />,
    trophy: <Trophy size={18} />,
    graduation: <GraduationCap size={18} />,
    file: <FileSpreadsheet size={18} />,
    warehouse: <Warehouse size={18} />,
    package: <Package size={18} />,
    lineChart: <LineChart size={18} />,
    folder: <Folder size={18} />,
    shield: <Shield size={18} />,
    upload: <Upload size={18} />,
    folderOpen: <FolderOpen size={18} />,
    eye: <Eye size={18} />,
    search: <FileSearch size={18} />,
    image: <Image size={18} />,
    trash: <Trash2 size={18} />,
    notebook: <Notebook size={18} />,
    mail: <Mail size={18} />,
    message: <MessageSquare size={18} />,
    dollar: <DollarSign size={18} />,
    wallet: <Wallet size={18} />,
    layers: <Layers size={18} />,
    history: <History size={18} />,
    target: <Target size={18} />,
    calendarDays: <CalendarDays size={18} />,
    monitor: <Monitor size={18} />,
    trendingUp: <TrendingUp size={18} />,
    shoppingCart: <ShoppingCart size={18} />,
    creditCard: <CreditCard size={18} />,
    sparkles: <Sparkles size={18} />,
};

const MODULE_THEMES: Record<string, { textColor: string; activeBg: string; hoverBg: string; gradient: string }> = {
    "mod.hrm": {
        textColor: "text-emerald-700 dark:text-emerald-400",
        activeBg: "bg-emerald-50 dark:bg-emerald-950/30",
        hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
        gradient: "from-emerald-500 to-teal-600"
    },
    "mod.inv": {
        textColor: "text-amber-700 dark:text-amber-400",
        activeBg: "bg-amber-50 dark:bg-amber-950/30",
        hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
        gradient: "from-amber-500 to-orange-600"
    },
    "mod.core": {
        textColor: "text-blue-700 dark:text-blue-400",
        activeBg: "bg-blue-50 dark:bg-blue-950/30",
        hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
        gradient: "from-blue-500 to-indigo-600"
    },
    "mod.crm": {
        textColor: "text-purple-700 dark:text-purple-400",
        activeBg: "bg-purple-50 dark:bg-purple-950/30",
        hoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
        gradient: "from-purple-500 to-pink-600"
    },
    "mod.fnm": {
        textColor: "text-indigo-700 dark:text-indigo-400",
        activeBg: "bg-indigo-50 dark:bg-indigo-950/30",
        hoverBg: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20",
        gradient: "from-indigo-500 to-purple-600"
    },
    "mod.pro": {
        textColor: "text-rose-700 dark:text-rose-400",
        activeBg: "bg-rose-50 dark:bg-rose-950/30",
        hoverBg: "hover:bg-rose-50/50 dark:hover:bg-rose-950/20",
        gradient: "from-rose-500 to-red-600"
    },
    "mod.flm": {
        textColor: "text-cyan-700 dark:text-cyan-400",
        activeBg: "bg-cyan-50 dark:bg-cyan-950/30",
        hoverBg: "hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20",
        gradient: "from-cyan-500 to-blue-600"
    },
    "mod.pld": {
        textColor: "text-violet-700 dark:text-violet-400",
        activeBg: "bg-violet-50 dark:bg-violet-950/30",
        hoverBg: "hover:bg-violet-50/50 dark:hover:bg-violet-950/20",
        gradient: "from-violet-500 to-purple-600"
    },
    "mod.prm": {
        textColor: "text-yellow-700 dark:text-yellow-400",
        activeBg: "bg-yellow-50 dark:bg-yellow-950/30",
        hoverBg: "hover:bg-yellow-50/50 dark:hover:bg-yellow-950/20",
        gradient: "from-yellow-500 to-amber-600"
    },
    default: {
        textColor: "text-slate-700 dark:text-slate-300",
        activeBg: "bg-slate-100 dark:bg-slate-800/50",
        hoverBg: "hover:bg-slate-100/70 dark:hover:bg-slate-800/30",
        gradient: "from-slate-500 to-gray-600"
    },
};

/* ==================== HELPERS ==================== */

const getIcon = (iconType?: string): React.ReactNode => {
    if (!iconType) return <FileText size={18} />;
    if (ICON_MAP[iconType]) return ICON_MAP[iconType];
    const lower = iconType.toLowerCase();
    if (ICON_MAP[lower]) return ICON_MAP[lower];
    return <FileText size={18} />;
};

const isDashboardMenu = (menu: PermissionMenu): boolean =>
    menu.L?.toLowerCase() === 'dashboard' || menu.K?.toLowerCase().endsWith('.db');

const isSettingsMenu = (menu: PermissionMenu): boolean =>
    menu.P === '/settings' || menu.K?.toLowerCase().includes('setting') || menu.L?.toLowerCase() === 'settings';

// Extract menu GUIDs from permissions
const extractMenuGuidsFromPermissions = (permissions: PermissionModule[]): Set<string> => {
    const menuGuids = new Set<string>();

    const walk = (menus?: PermissionMenu[] | null) => {
        menus?.forEach(menu => {
            if (menu.K) menuGuids.add(menu.K);
            walk(menu.C);
        });
    };

    permissions?.forEach(mod => walk(mod.M));

    return menuGuids;
};

// Check if a menu has children
const hasChildren = (menu: PermissionMenu): boolean => {
    return menu.C !== null && menu.C !== undefined && menu.C.length > 0;
};

// Check if a menu has a valid path
const hasValidPath = (menu: PermissionMenu): boolean => {
    return menu.P !== undefined && menu.P !== null && menu.P !== '';
};

// Get display path (fallback to # if no path)
const getMenuPath = (menu: PermissionMenu): string => {
    return hasValidPath(menu) ? menu.P! : '#';
};

// Get dashboard path from the first dashboard menu found
const getDashboardPath = (permissions: PermissionModule[], activeModule: string): string => {
    // Find the active module
    const module = permissions?.find(m => m.K === activeModule);
    if (!module?.M) return '/dashboard';

    // Look for dashboard menu in the module
    const dashboardMenu = module.M.find(m => isDashboardMenu(m));
    if (dashboardMenu && hasValidPath(dashboardMenu)) {
        return dashboardMenu.P!;
    }

    // Check children for dashboard
    for (const menu of module.M) {
        if (menu.C) {
            for (const child of menu.C) {
                if (isDashboardMenu(child) && hasValidPath(child)) {
                    return child.P!;
                }
            }
        }
    }

    // Fallback: use first menu path
    const firstMenu = module.M.find(m => hasValidPath(m));
    if (firstMenu) {
        return firstMenu.P!;
    }

    return '/dashboard';
};

/* ==================== NAV ITEM ==================== */

const NavItem = React.memo<NavItemProps>(({
                                              to, icon, label, end = false, isChild = false, collapsed = false,
                                              activeBg = "bg-emerald-50 dark:bg-emerald-950/30",
                                              textColor = "text-emerald-700 dark:text-emerald-400",
                                              hoverBg = "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
                                              matchPaths = [], onClose,
                                          }) => {
    const location = useLocation();
    const [popoverOpen, setPopoverOpen] = useState(false);

    const isActive = useCallback(() => {
        const path = location.pathname;
        const matchPattern = (p: string) => new RegExp(`^${p.replace(/:[^/]+/g, "([^/]+)").replace(/\//g, "\\/")}$`).test(path);
        if (matchPaths?.some(p => p.includes(":") ? matchPattern(p) : path === p || path.startsWith(p))) return true;
        if (end) return path === to;
        if (isChild) return path === to;
        return path.startsWith(to);
    }, [location.pathname, to, end, isChild, matchPaths]);

    const active = isActive();

    const content = (
        <div className={`flex items-center w-full px-3 py-2 rounded-lg transition-all duration-150 ${
            active ? `${activeBg} ${textColor} shadow-sm` : `text-slate-600 dark:text-slate-400 ${hoverBg}`
        } ${isChild && !collapsed ? "ml-2" : ""}`}>
            <span className={`${collapsed && !isChild ? "mx-auto" : "mr-3"} flex items-center justify-center`}>
                {isChild ? (
                    <div className={`w-1.5 h-1.5 rounded-full ${active ? textColor : "bg-slate-400 dark:bg-slate-600"}`} />
                ) : icon && React.cloneElement(icon, {
                    size: collapsed ? 20 : 18,
                    className: `transition-all duration-150 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`
                })}
            </span>
            {(!collapsed || isChild) && <span className={`flex-1 ${isChild ? "text-xs" : "text-sm font-medium"}`}>{label}</span>}
        </div>
    );

    if (collapsed && !isChild) {
        return (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <div onMouseEnter={() => setPopoverOpen(true)} onMouseLeave={() => setPopoverOpen(false)}>
                        <NavLink to={to} end={end} className="block" onClick={() => onClose?.()}>{content}</NavLink>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    side="right"
                    align="center"
                    className="w-auto px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    onMouseEnter={() => setPopoverOpen(true)}
                    onMouseLeave={() => setPopoverOpen(false)}
                >
                    {label}
                </PopoverContent>
            </Popover>
        );
    }
    return <NavLink to={to} end={end} className="block" onClick={() => onClose?.()}>{content}</NavLink>;
});
NavItem.displayName = 'NavItem';

/* ==================== NAV GROUP ==================== */

const NavGroup = React.memo<NavGroupProps>(({
                                                icon, label, children, isOpen, onToggle, collapsed = false,
                                                hoverBg = "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
                                                textColor = "text-emerald-700 dark:text-emerald-400",
                                                activeBg = "bg-emerald-50 dark:bg-emerald-950/30",
                                            }) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    if (collapsed) {
        return (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <button
                        onMouseEnter={() => setPopoverOpen(true)}
                        onMouseLeave={() => setPopoverOpen(false)}
                        className={`w-full flex items-center justify-center px-3 py-2 rounded-lg ${hoverBg} text-slate-600 dark:text-slate-400`}
                    >
                        {React.cloneElement(icon, { size: 18 })}
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    side="right"
                    align="start"
                    className="w-48 p-1 ml-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    onMouseEnter={() => setPopoverOpen(true)}
                    onMouseLeave={() => setPopoverOpen(false)}
                >
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">
                        {label}
                    </div>
                    <div className="py-1">{children}</div>
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <div className="mb-0.5">
            <button
                onClick={onToggle}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg ${hoverBg} text-slate-700 dark:text-slate-300`}
            >
                <div className="flex items-center min-w-0">
                    <span className="mr-3 flex-shrink-0">{React.cloneElement(icon, { size: 16 })}</span>
                    <span className="truncate text-sm font-medium">{label}</span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                >
                    <ChevronDown size={14} className="flex-shrink-0 text-slate-400" />
                </motion.div>
            </button>
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                        className="overflow-hidden pl-4 pr-2 mt-0.5 space-y-0.5"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
NavGroup.displayName = 'NavGroup';

/* ==================== SIDEBAR ==================== */

interface SidebarProps {
    onClose?: () => void;
    isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, isCollapsed: propCollapsed }) => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const rawActiveModule = useModuleStore((s) => s.activeModule);
    const { setActiveModule } = useModuleStore();
    const storeCollapsed = useSidebarStore((s) => s.collapsed);
    const toggleSidebar = useSidebarStore((s) => s.toggleCollapsed);
    // Local open-group state keyed by menu key. Supports arbitrarily nested groups;
    // the sidebar store only tracked a single open group per module, which could not
    // express nested sub-groups (e.g. Recruitment > Job Requisitions > All Requisitions).
    const [openGroupKeys, setOpenGroupKeys] = useState<Record<string, boolean>>({});
    const toggleGroupKey = useCallback((key: string) => {
        setOpenGroupKeys(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);
    const { role, userName, permissions: rawPermissions, token, userId } = useAuthStore();
    const prefersReducedMotion = useReducedMotion();
    const { company, isLoading: companyLoading, fetchCompany } = useCompanyStore();
    const collapsed = propCollapsed ?? storeCollapsed;

    // Use permissions directly from auth store
    const permissions = useMemo(() => {
        if (!rawPermissions) return [];
        if (Array.isArray(rawPermissions)) return rawPermissions;
        return [];
    }, [rawPermissions]);

    // Extract user menu GUIDs (including children)
    const userMenuGuids = useMemo(() => {
        if (!permissions?.length) return new Set<string>();
        return extractMenuGuidsFromPermissions(permissions);
    }, [permissions]);



    // ACTIVE MODULE - Use first module from permissions as fallback
    const activeModule = useMemo(() => {
        if (rawActiveModule) {
            // Check if the raw module exists in permissions
            if (permissions?.some((m: PermissionModule) => m.K === rawActiveModule)) {
                return rawActiveModule;
            }
        }

        // Auto-select first available module
        if (permissions && permissions.length > 0) {
            // Try HRM first
            const hrModule = permissions.find((m: PermissionModule) => m.K === 'mod.hrm');
            if (hrModule) return hrModule.K;
            // Then Core
            const coreModule = permissions.find((m: PermissionModule) => m.K === 'mod.core');
            if (coreModule) return coreModule.K;
            // Then any module
            return permissions[0].K;
        }

        return 'mod.core';
    }, [rawActiveModule, permissions]);

    // Auto-select first module
    useEffect(() => {
        if (!rawActiveModule && permissions && permissions.length > 0) {
            const hrModule = permissions.find((m: PermissionModule) => m.K === 'mod.hrm');
            const coreModule = permissions.find((m: PermissionModule) => m.K === 'mod.core');
            const firstModule = hrModule || coreModule || permissions[0];
            if (firstModule && firstModule.K) {
                setActiveModule(firstModule.K);
            }
        }
    }, [rawActiveModule, permissions, setActiveModule]);

    // Fetch permissions if needed
    useEffect(() => {
        if ((!permissions || permissions.length === 0) && token && userId) {
            const { fetchMenuStructure } = useAuthStore.getState();
            fetchMenuStructure();
        }
    }, [permissions, token, userId]);
    useEffect(() => {
        if (!company && !companyLoading) {
            fetchCompany();
        }
    }, [company, companyLoading, fetchCompany]);
    const theme = MODULE_THEMES[activeModule] || MODULE_THEMES.default;
    const isPrivileged = role === 'admin' || role === 'ceo' || role === 'vice.ceo' || role === 'auditor' || role === 'super_admin';

    // ✅ Get dashboard path dynamically from permissions
    const dashboardPath = useMemo(() => {
        return getDashboardPath(permissions, activeModule);
    }, [permissions, activeModule]);

    const getTranslatedLabel = useCallback((menuKey: string, originalLabel: string): string => {
        return translateMenu(menuKey, originalLabel, t);
    }, [t]);

    const handleNavClick = useCallback(() => {
        if (onClose && window.innerWidth < 1024) onClose();
    }, [onClose]);

    const NavItemWithClose = useCallback((props: Omit<NavItemProps, 'onClose'>) => {
        const translatedLabel = props.labelKey
            ? getTranslatedLabel(props.labelKey, props.label)
            : props.label;
        return <NavItem {...props} label={translatedLabel} onClose={handleNavClick} />;
    }, [handleNavClick, getTranslatedLabel]);

    const NavGroupWithTheme = useCallback((props: Omit<NavGroupProps, 'hoverBg' | 'textColor' | 'activeBg'>) => {
        const translatedLabel = props.labelKey
            ? getTranslatedLabel(props.labelKey, props.label)
            : props.label;
        return <NavGroup {...props} label={translatedLabel} {...theme} collapsed={collapsed} />;
    }, [theme, collapsed, getTranslatedLabel]);

    // ✅ Filter menus by user permissions and preserve hierarchy
    const filterMenusByPermissions = useCallback((
        menus: PermissionMenu[],
        userMenuGuids: Set<string>,
        isPrivileged: boolean
    ): PermissionMenu[] => {
        if (isPrivileged || !userMenuGuids || userMenuGuids.size === 0) {
            return menus;
        }

        return menus
            .map(menu => {
                const hasDirectAccess = userMenuGuids.has(menu.K);

                let filteredChildren: PermissionMenu[] = [];
                if (menu.C && menu.C.length > 0) {
                    filteredChildren = filterMenusByPermissions(menu.C, userMenuGuids, isPrivileged);
                }

                if (hasDirectAccess || filteredChildren.length > 0) {
                    return {
                        ...menu,
                        C: filteredChildren.length > 0 ? filteredChildren : menu.C
                    };
                }

                return null;
            })
            .filter(Boolean) as PermissionMenu[];
    }, []);

    // ✅ RENDER MENUS
    const renderMenus = useCallback(() => {
        const commonProps = { collapsed, ...theme };

        const activeData = permissions?.find((m: PermissionModule) => m.K === activeModule);

        if (!activeData) {
            const coreData = permissions?.find((m: PermissionModule) => m.K === 'mod.core');
            if (coreData) {
                setActiveModule('mod.core');
                return [];
            }
            return <div className="px-3 py-8 text-center">
                <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No modules available</p>
            </div>;
        }

        if (!activeData.M?.length) {
            return <div className="px-3 py-8 text-center">
                <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No menus available for this module</p>
            </div>;
        }

        // Filter out dashboard and settings menus
        let filteredMenus = activeData.M
            .filter(m => !isDashboardMenu(m) && !isSettingsMenu(m));

        // Filter by user permissions while preserving hierarchy
        const hierarchicalMenus = filterMenusByPermissions(filteredMenus, userMenuGuids, isPrivileged);

        // Sort menus by order
        hierarchicalMenus.sort((a, b) => (a.O || 0) - (b.O || 0));

        // Recursively render a menu node. A node is a GROUP when it has children
        // that are themselves renderable (have a path OR their own renderable
        // children). Otherwise it is a leaf link. This lets multi-level menus
        // (e.g. Recruitment > Job Requisitions > All Requisitions) render fully,
        // instead of dropping path-less group nodes and their nested pages.
        const isRenderable = (m: PermissionMenu): boolean => {
            const kids = (m.C || []).filter(Boolean);
            return hasValidPath(m) || kids.some(isRenderable);
        };

        const renderNode = (menu: PermissionMenu, depth: number): React.ReactNode => {
            const kids = (menu.C || []).filter(Boolean).filter(isRenderable);
            kids.sort((a, b) => (a.O || 0) - (b.O || 0));

            if (kids.length > 0) {
                return (
                    <NavGroupWithTheme
                        key={menu.K}
                        icon={getIcon(menu.I)}
                        label={menu.L}
                        labelKey={menu.K}
                        isOpen={!!openGroupKeys[menu.K]}
                        onToggle={() => toggleGroupKey(menu.K)}
                    >
                        {kids.map((child) => renderNode(child, depth + 1))}
                    </NavGroupWithTheme>
                );
            }

            if (!hasValidPath(menu)) {
                return null;
            }

            return (
                <NavItemWithClose
                    key={menu.K}
                    to={getMenuPath(menu)}
                    icon={depth === 0 ? getIcon(menu.I) : undefined}
                    label={menu.L}
                    labelKey={menu.K}
                    isChild={depth > 0}
                    {...commonProps}
                />
            );
        };

        return hierarchicalMenus.map((menu: PermissionMenu) => renderNode(menu, 0));
    }, [
        permissions,
        activeModule,
        collapsed,
        theme,
        openGroupKeys,
        toggleGroupKey,
        NavItemWithClose,
        NavGroupWithTheme,
        isPrivileged,
        userMenuGuids,
        filterMenusByPermissions,
        setActiveModule
    ]);

    const showSettings = useMemo(() => {
        if (isPrivileged) return true;
        return permissions?.some((m: PermissionModule) =>
            m.M?.some((menu: PermissionMenu) => isSettingsMenu(menu) || menu.C?.some((c: PermissionMenu) => isSettingsMenu(c)))
        );
    }, [permissions, isPrivileged]);

    return (
        <motion.aside
            initial={false}
            animate={{width: collapsed ? 68 : 260}}
            transition={{duration: prefersReducedMotion ? 0 : 0.2, ease: "easeInOut"}}
            className="h-screen bg-white dark:bg-slate-900 flex flex-col shadow-lg border-r border-slate-200 dark:border-slate-800 relative z-40"
        >
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md lg:hidden"
                >
                    <X size={20} className="text-slate-500"/>
                </button>
            )}

            {collapsed && (
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors"
                    title={t.expandSidebar || "Expand sidebar"}
                >
                    <ChevronRight size={12}/>
                </button>
            )}

            {/* In the Sidebar render, replace the logo section */}
            <div
                className={`flex-shrink-0 px-4 py-4 flex items-center ${collapsed ? "justify-center" : "justify-between"} border-b border-slate-200 dark:border-slate-800`}>
                <button onClick={() => navigate("/modules")} className="flex items-center gap-3 group cursor-pointer">
                    {/* Dynamic Logo - LARGER */}
                    <div
                        className="w-12 h-12 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 object-cover shadow-md overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                        {companyLoading ? (
                            <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-slate-700"/>
                        ) : company?.logoUrl ? (
                            <img
                                src={company.logoUrl}
                                alt={company.name || "Company Logo"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                        const fallback = document.createElement('span');
                                        fallback.className = 'w-full h-full flex items-center justify-center text-lg font-bold text-emerald-600 dark:text-emerald-400';
                                        fallback.textContent = company?.name?.charAt(0)?.toUpperCase() || 'B';
                                        parent.appendChild(fallback);
                                    }
                                }}
                            />
                        ) : (
                            <span
                                className="w-full h-full flex items-center justify-center text-lg font-bold text-emerald-600 dark:text-emerald-400">
          {company?.name?.charAt(0)?.toUpperCase() || 'B'}
        </span>
                        )}
                    </div>

                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            {/* Slogan - BIGGER AND BOLD - No organization name */}
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {company?.motto || '"Yes We Can."'}
                            </p>
                        </div>
                    )}
                </button>

                {/* Toggle button */}
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors shadow-sm"
                >
                    {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
                </button>
            </div>
            {!collapsed && (
                <div
                    className="mx-2 mt-3 p-2 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                            <span
                                className="text-white text-xs font-bold">{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{userName || t.user || 'User'}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{role || t.employee || 'Employee'}</p>
                        </div>
                        <Sparkles className="w-3 h-3 text-amber-500"/>
                    </div>
                </div>
            )}

            <div className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
                <div className={`space-y-0.5 ${collapsed ? "px-2" : "px-2"}`}>
                    <NavItemWithClose
                        to={dashboardPath}
                        icon={<LayoutDashboard size={18}/>}
                        label={t.dashboard || "Dashboard"}
                        end
                        {...theme}
                        collapsed={collapsed}
                    />
                    {renderMenus()}
                </div>
            </div>

            {showSettings && (
                <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-slate-800">
                    <NavItemWithClose
                        to="/settings"
                        icon={<Settings size={18}/>}
                        label={t.settings || "Settings"}
                        {...theme}
                        collapsed={collapsed}
                    />
                    {!collapsed ? (
                        <p className="mt-2 text-[9px] text-slate-400 text-center">{t.version || 'Version'} 2.0.0</p>
                    ) : (
                        <button
                            onClick={toggleSidebar}
                            className="mt-2 w-full flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                            title={t.expandSidebar || "Expand sidebar"}
                        >
                            <ChevronRight size={14}/>
                        </button>
                    )}
                </div>
            )}
        </motion.aside>
    );
};

export default React.memo(Sidebar);