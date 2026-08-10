// src/pages/modules/HR.tsx

// src/pages/modules/HR.tsx

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import {
    RefreshCw,
    FileDown,
    LayoutDashboard,
    Clock,
    PlusCircle,
    Calendar,
    Users,
    Eye,
    Download,
    AlertCircle,
    Sparkles,
    Dot,
    TrendingUp,
    Shield,
    Briefcase,
} from "lucide-react";

// Hooks
import { useThemeStore } from "@/shared/stores/theme.store";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import {
    useEmpDbRepo,
    usePendEmpList,
    useRecentActivities,
    useUpcomingEvents,
    usePendingLeaveRequests,
    useLeaveStatistics,
} from "@/modules/hr/services/dashboard/dashboard.queries";

// Components
import StatsCards from "@/modules/hr/components/dashboard/StatsCards";
import PendingActivity from "@/modules/hr/components/dashboard/PendingActivity";
import OnLeaveEmployee from "@/modules/hr/components/dashboard/OnLeaveEmployee";
import RecentActivity from "@/modules/hr/components/dashboard/RecentActivity";
import UpcomingEvents from "@/modules/hr/components/dashboard/UpcomingEvents";
import DepartmentDistribution from "@/modules/hr/components/dashboard/DepartmentDistribution";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { showToast } from "@/shared/layout/layout";
import PendingEmployeeUpdates from "@/modules/hr/components/dashboard/PendingEmpUpdates";

// ✅ Import the helper
import { invalidateHrQueries } from "@/shared/lib/queryClient";

// ============== Helper Functions ==============
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// ============== Main Component ==============
function Dashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isDarkMode } = useThemeStore();
    const { role, user } = useAuthStore();
    const { t } = useLanguage();
    const prefersReducedMotion = useReducedMotion();

    // ============== State ==============
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);

    // ✅ Add abort controller ref
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    // ✅ Cleanup function for abort controller
    const cleanup = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    // ============== Queries ==============
    const {
        data: report,
        isLoading: reportLoading,
        error: reportError,
        refetch: refetchReport,
        isFetching: isReportFetching,
        dataUpdatedAt: reportUpdatedAt,
    } = useEmpDbRepo();

    const {
        data: pendingEmployees = [],
        isLoading: pendingLoading,
        error: pendingError,
        refetch: refetchPending,
        isFetching: isPendingFetching,
    } = usePendEmpList();

    const {
        data: pendLeaveReq = [],
        isLoading: pendLeaveReqLoading,
        error: pendLeaveReqError,
        refetch: refetchLeave,
        isFetching: isLeaveFetching,
    } = usePendingLeaveRequests();

    const {
        data: leaveStats,
        isLoading: leaveStatsLoading,
        refetch: refetchLeaveStats,
    } = useLeaveStatistics();

    const {
        data: activities = [],
        isLoading: activitiesLoading,
        refetch: refetchActivities,
    } = useRecentActivities(10);

    const {
        data: events = [],
        isLoading: eventsLoading,
        refetch: refetchEvents,
    } = useUpcomingEvents();

    // ============================================================
    // ✅ DEPARTMENT DISTRIBUTION DATA
    // ============================================================
    const departmentData = useMemo(() => {
        if (report?.employeesByDepartment) {
            return Object.entries(report.employeesByDepartment).map(([name, count]) => ({
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name: name,
                employeeCount: typeof count === 'number' ? count : 0,
            })).sort((a, b) => b.employeeCount - a.employeeCount);
        }
        return [];
    }, [report]);

    // ============================================================
    // ✅ ON LEAVE EMPLOYEE IDS
    // ============================================================
    const onLeaveEmployeeIds = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ids = new Set<string>();

        pendLeaveReq.forEach((leave: any) => {
            const isApproved = leave.status === '1' || leave.status === 'Approved' || leave.status === 'approved';
            if (!isApproved) return;

            const startDate = new Date(leave.startDate || leave.StartDate);
            const endDate = new Date(leave.endDate || leave.EndDate);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            if (today >= startDate && today <= endDate) {
                const employeeId = leave.employeeId || leave.EmployeeId || leave.employee?.id || leave.employee?.Id;
                if (employeeId) {
                    ids.add(String(employeeId));
                }
            }
        });

        return ids;
    }, [pendLeaveReq]);

    // ============== Effects ==============
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (reportUpdatedAt) {
            setLastRefreshTime(new Date(reportUpdatedAt));
        }
    }, [reportUpdatedAt]);

    // ✅ Main data fetch effect with abort controller
    useEffect(() => {
        isMountedRef.current = true;

        const fetchData = async () => {
            // ✅ Create new abort controller for this fetch
            abortControllerRef.current = new AbortController();

            try {
                await Promise.all([
                    refetchReport(),
                    refetchPending(),
                    refetchLeave(),
                    refetchLeaveStats(),
                    refetchActivities(),
                    refetchEvents(),
                ]);

                if (isMountedRef.current) {
                    setLastRefreshTime(new Date());
                }
            } catch (error: any) {
                // ✅ Ignore abort/cancellation errors
                if (error?.name === 'AbortError' ||
                    error?.name === 'CancelledError' ||
                    error?.message === 'CancelledError') {
                    console.log('⏹️ Data fetch aborted');
                    return;
                }
                console.error('Initial dashboard fetch failed:', error);
            } finally {
                abortControllerRef.current = null;
            }
        };

        fetchData();

        return () => {
            isMountedRef.current = false;
            cleanup();
        };
    }, []);

    // ✅ Auto-refresh interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isRefreshing && isMountedRef.current) {
                handleRefresh();
            }
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isRefreshing]);

    // ============== Computed Values ==============
    const isAnyFetching = isReportFetching || isPendingFetching || isLeaveFetching;
    const hasError = reportError || pendingError || pendLeaveReqError;
    const hasData = report && report.totalEmployees > 0;

    // ============== Handlers ==============
    const handleStatClick = useCallback((statKey: string, value: number) => {
        navigate("/hr/employees/record", {
            state: { statKey, value },
        });
    }, [navigate]);

    const handleRefresh = useCallback(async () => {
        if (isRefreshing || !isMountedRef.current) return;

        setIsRefreshing(true);

        try {
            // ✅ Cancel any ongoing requests
            cleanup();

            // ✅ Create new abort controller
            abortControllerRef.current = new AbortController();

            // ✅ Use helper to invalidate all HR queries
            invalidateHrQueries(queryClient);

            await Promise.all([
                refetchReport(),
                refetchPending(),
                refetchLeave(),
                refetchLeaveStats(),
                refetchActivities(),
                refetchEvents(),
            ]);

            if (isMountedRef.current) {
                setLastRefreshTime(new Date());
                showToast.success('Dashboard refreshed successfully');
            }
        } catch (error: any) {
            // ✅ Ignore abort/cancellation errors
            if (error?.name === 'AbortError' ||
                error?.name === 'CancelledError' ||
                error?.message === 'CancelledError') {
                console.log('⏹️ Refresh aborted');
                return;
            }
            if (isMountedRef.current) {
                showToast.error('Failed to refresh dashboard');
                console.error('Refresh error:', error);
            }
        } finally {
            if (isMountedRef.current) {
                setIsRefreshing(false);
            }
            abortControllerRef.current = null;
        }
    }, [refetchReport, refetchPending, refetchLeave, refetchLeaveStats, refetchActivities, refetchEvents, isRefreshing, queryClient, cleanup]);

    const handleExport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
        try {
            showToast.loading('Generating export...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            showToast.dismiss();
            showToast.success(`Dashboard exported as ${format.toUpperCase()}`);
            setShowExportModal(false);
        } catch (error) {
            showToast.error('Failed to export dashboard');
        }
    }, []);

    const handleQuickAction = useCallback((action: string) => {
        switch (action) {
            case 'addEmployee':
                navigate('/hr/employees/record/Add');
                break;
            case 'newLeave':
                navigate('/hr/leave/list');
                break;
            case 'viewAllEmployees':
                navigate('/hr/employees/record');
                break;
            case 'viewLeaveRequests':
                navigate('/hr/leave/list');
                break;
            default:
                showToast.info(`Action: ${action}`);
        }
    }, [navigate]);

    // ============== Animations ==============
    const itemVariants = useMemo(() => ({
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: prefersReducedMotion ? "tween" : "spring",
                stiffness: 260,
                damping: 20,
                duration: prefersReducedMotion ? 0.3 : undefined,
            },
        },
    }), [prefersReducedMotion]);

    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.08,
            },
        },
    }), []);

    // ============================================================
    // LOADING STATE
    // ============================================================
    if (reportLoading && !hasData) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 rounded-full" />
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium">Loading dashboard...</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Please wait while we fetch your data</p>
                </div>
            </div>
        );
    }

    // ============================================================
    // ERROR STATE
    // ============================================================
    if (hasError && !hasData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700 max-w-md shadow-lg">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Failed to Load Dashboard</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Unable to load dashboard data. Please check your connection and try again.
                    </p>
                    <Button onClick={handleRefresh} className="mt-6">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }



    // ============================================================
    // RENDER DASHBOARD
    // ============================================================
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 pb-8"
        >
            {/* ============================================================ */}
            {/* HERO HEADER SECTION */}
            {/* ============================================================ */}
            <motion.div variants={itemVariants}>
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl shadow-xl shadow-emerald-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"/>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"/>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2"/>

                    <div className="relative px-6 py-6 md:px-8 md:py-7">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                                    <LayoutDashboard className="w-6 h-6 text-white"/>
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                                        HR Dashboard
                                        <span className="ml-3 text-sm font-normal text-white/70">
                                            {role || 'User'}
                                        </span>
                                    </h1>
                                    <p className="text-white/80 text-sm mt-0.5 flex items-center gap-2">
                                        <span>Real-time overview of HR metrics, activities, and alerts</span>
                                        <span className="hidden sm:inline-flex items-center gap-1 text-white/60">
                                            <Dot className="w-4 h-4"/>
                                            <span className="flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"/>
                                                Live
                                            </span>
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                    <Clock className="w-4 h-4 text-white/70"/>
                                    <span className="text-sm text-white font-mono">
                                        {formatTime(currentTime)}
                                    </span>
                                    <span className="text-white/30">|</span>
                                    <span className="text-sm text-white/80">
                                        {formatDate(currentTime)}
                                    </span>
                                </div>

                                {hasData && (
                                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                        <Users className="w-4 h-4 text-white/70"/>
                                        <span className="text-sm text-white font-medium">
                                            {report?.totalEmployees || 0}
                                        </span>
                                        <span className="text-white/50">employees</span>
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="text-white hover:bg-white/20 hover:text-white border border-white/20"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}/>
                                    <span className="hidden sm:inline ml-1.5">
                                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                    </span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowExportModal(true)}
                                    className="text-white hover:bg-white/20 hover:text-white border border-white/20"
                                >
                                    <Download className="w-4 h-4"/>
                                    <span className="hidden sm:inline ml-1.5">Export</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ============================================================ */}
            {/* QUICK ACTION BAR */}
            {/* ============================================================ */}
            <motion.div variants={itemVariants}>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleQuickAction('addEmployee')}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                    >
                        <PlusCircle className="w-4 h-4 mr-1.5"/>
                        Add Employee
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('newLeave')}
                        className="border-slate-200 dark:border-slate-700"
                    >
                        <Calendar className="w-4 h-4 mr-1.5"/>
                        New Leave Request
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('viewAllEmployees')}
                        className="border-slate-200 dark:border-slate-700"
                    >
                        <Users className="w-4 h-4 mr-1.5"/>
                        View All Employees
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('viewLeaveRequests')}
                        className="border-slate-200 dark:border-slate-700 relative"
                    >
                        <Eye className="w-4 h-4 mr-1.5"/>
                        Pending Leaves
                        {pendLeaveReq.length > 0 && (
                            <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0.5">
                                {pendLeaveReq.length}
                            </Badge>
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* ============================================================ */}
            {/* STATS CARDS */}
            {/* ============================================================ */}
            <motion.div variants={itemVariants}>
                <StatsCards
                    report={report}
                    leaveRequests={pendLeaveReq}
                    pendingLeaveCount={leaveStats?.pending || 0}
                    approvedLeaveCount={leaveStats?.approved || 0}
                    onStatClick={handleStatClick}
                    showPercentages={true}
                    showDescription={true}
                    columns={4}
                    key={reportUpdatedAt}
                />
            </motion.div>

            {/* ============================================================ */}
            {/* DEPARTMENT DISTRIBUTION */}
            {/* ============================================================ */}
            <motion.div variants={itemVariants}>
                <DepartmentDistribution
                    departments={departmentData}
                    totalEmployees={report?.totalEmployees || 0}
                    variant="bar"
                    showPercentages={true}
                    onDepartmentClick={(id) => {
                        navigate(`/hr/employees/record`, {
                            state: { departmentId: id }
                        });
                    }}
                />
            </motion.div>

            {/* ============================================================ */}
            {/* MAIN CONTENT - 3 Columns */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Pending Activities & Pending Updates */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <PendingActivity pendingEmployees={pendingEmployees}/>
                    <PendingEmployeeUpdates/>
                </motion.div>

                {/* Column 2: On Leave Employees & Quick Stats */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400"/>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    On Leave Today
                                </h3>
                            </div>
                            <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"/>
                                Live
                            </Badge>
                        </div>
                        <div className="p-3">
                            <OnLeaveEmployee limit={4}/>
                        </div>
                    </div>

                    {hasData && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400"/>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Active Rate</p>
                                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                            {report?.totalEmployees > 0
                                                ? ((report.activeEmployees / report.totalEmployees) * 100).toFixed(1)
                                                : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                        <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400"/>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Departments</p>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {report?.totalDepartments || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Column 3: Recent Activity & Upcoming Events */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <RecentActivity
                        activities={activities}
                        loading={activitiesLoading}
                        maxItems={4}
                    />

                    <UpcomingEvents
                        events={events}
                        loading={eventsLoading}
                    />
                </motion.div>
            </div>

            {/* ============================================================ */}
            {/* FOOTER STATUS BAR */}
            {/* ============================================================ */}
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.3}}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
                <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">Live</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3"/>
                        <span>Updated: {lastRefreshTime ? lastRefreshTime.toLocaleTimeString() : 'Never'}</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <div className="flex items-center gap-1.5">
                        <Shield className="w-3 h-3"/>
                        <span>Data source: HRM Database</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                    {isAnyFetching && (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <RefreshCw className="w-3 h-3 animate-spin"/>
                            Syncing...
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3"/>
                        v2.0
                    </span>
                    {hasData && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Users className="w-3 h-3"/>
                            {report?.totalEmployees} employees
                        </span>
                    )}
                </div>
            </motion.div>

            {/* ============================================================ */}
            {/* EXPORT MODAL */}
            {/* ============================================================ */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowExportModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                                <FileDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    Export Dashboard
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Choose your preferred export format
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            {['pdf', 'excel', 'csv'].map((format) => (
                                <Button
                                    key={format}
                                    variant="outline"
                                    className="w-full justify-start hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                    onClick={() => handleExport(format as 'pdf' | 'excel' | 'csv')}
                                >
                                    <FileDown className="w-4 h-4 mr-2"/>
                                    {format.toUpperCase()} Export
                                    <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                                        {format === 'pdf' ? 'Document' : format === 'excel' ? 'Spreadsheet' : 'Data'}
                                    </span>
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full mt-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            onClick={() => setShowExportModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default Dashboard;