// components/hr/dashboard/StatsCards.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    UserCheck,
    UserX,
    UserPlus,
    TrendingUp,
    TrendingDown,
    Calendar,
    Building2,
    UserMinus,
    PauseCircle,
    Award,
    Activity,
    Eye
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';

// ============================================================
// TYPES - Supports both old and new API formats
// ============================================================

interface HrDashboardResponse {
    totalEmployees: number;
    activeEmployees: number;
    pendingEmployeesCount: number;
    suspendedEmployees: number;
    retiredEmployees: number;
    standByEmployees: number;
    terminatedEmployees: number;
    leaveEmployees: number;
    rejectedEmployees: number;
    pendingEmployeesList?: any[];
    pendingEducationExperienceList?: any[];
    totalDepartments: number;
    totalPositions: number;
    totalJobGrades: number;
    employeesByDepartment: Record<string, number>;
    employeesByPosition: Record<string, number>;
    employeesByStatus: Record<string, number>;
    generatedAt: string;
    cacheDurationSeconds: number;
}

interface EmpDbReport {
    EmpTot: number;
    EmpAct: number;
    EmpPen: number;
    EmpSus: number;
    EmpRet: number;
    EmpStd: number;
    EmpTer: number;
    EmpLeave: number;
    EmpRej: number;
}

interface StatsCardsProps {
    report?: HrDashboardResponse | EmpDbReport;
    previousPeriod?: {
        totalEmployees?: number;
        activeEmployees?: number;
    };
    onStatClick?: (statKey: string, value: number) => void;
    showPercentages?: boolean;
    showDescription?: boolean;
    columns?: 1 | 2 | 3 | 4;
    variant?: "default" | "compact";
}

// ============================================================
// STATS CONFIGURATION
// ============================================================

const STATS_CONFIG = [
    {
        key: "total",
        titleKey: "totalEmployees",
        icon: Users,
        color: "blue",
        descriptionKey: "allActiveEmployees",
        priority: 1,
        navigateTo: "/hr/employees/record",
        filterParam: "all",
    },
    {
        key: "active",
        titleKey: "active",
        icon: UserCheck,
        color: "green",
        descriptionKey: "currentlyWorking",
        priority: 1,
        navigateTo: "/hr/employees/record",
        filterParam: "active",
    },
    {
        key: "pending",
        titleKey: "pending",
        icon: UserPlus,
        color: "amber",
        descriptionKey: "awaitingApproval",
        priority: 2,
        navigateTo: "/hr/employees/record",
        filterParam: "pending",
    },
    {
        key: "onLeave",
        titleKey: "onLeave",
        icon: UserMinus,
        color: "purple",
        descriptionKey: "currentlyOnLeave",
        priority: 2,
        navigateTo: "/hr/employees/record",
        filterParam: "on-leave",
    },
    {
        key: "suspended",
        titleKey: "suspended",
        icon: PauseCircle,
        color: "red",
        descriptionKey: "temporarilySuspended",
        priority: 3,
        navigateTo: "/hr/employees/record",
        filterParam: "suspended",
    },
    {
        key: "terminated",
        titleKey: "terminated",
        icon: UserX,
        color: "red",
        descriptionKey: "contractTerminated",
        priority: 3,
        navigateTo: "/hr/employees/record",
        filterParam: "terminated",
    },
    {
        key: "retired",
        titleKey: "retired",
        icon: Award,
        color: "slate",
        descriptionKey: "retiredEmployees",
        priority: 4,
        navigateTo: "/hr/employees/record",
        filterParam: "retired",
    },
    {
        key: "standby",
        titleKey: "standby",
        icon: Activity,
        color: "slate",
        descriptionKey: "onStandby",
        priority: 4,
        navigateTo: "/hr/employees/record",
        filterParam: "standby",
    },
    {
        key: "rejected",
        titleKey: "rejected",
        icon: UserX,
        color: "slate",
        descriptionKey: "applicationsRejected",
        priority: 5,
        navigateTo: "/hr/employees/record",
        filterParam: "rejected",
    },
];

// ============================================================
// DEFAULT TRANSLATIONS
// ============================================================

const DEFAULT_TRANSLATIONS: Record<string, string> = {
    totalEmployees: "Total Employees",
    active: "Active",
    pending: "Pending",
    onLeave: "On Leave",
    suspended: "Suspended",
    terminated: "Terminated",
    retired: "Retired",
    standby: "Standby",
    rejected: "Rejected",
    allActiveEmployees: "All active employees",
    currentlyWorking: "Currently working",
    awaitingApproval: "Awaiting approval",
    currentlyOnLeave: "Currently on leave",
    temporarilySuspended: "Temporarily suspended",
    contractTerminated: "Contract terminated",
    retiredEmployees: "Retired employees",
    onStandby: "On standby",
    applicationsRejected: "Applications rejected",
    workforceOverview: "Workforce Overview",
    activeRate: "Active Rate",
    liveData: "Live data",
    updatedToday: "Updated today",
    clickCardsForDetails: "Click cards for details",
    allDepartments: "All departments",
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getValue = (report: any, key: string): number => {
    if (!report) return 0;

    // New HrDashboardResponse format
    if ('totalEmployees' in report) {
        const map: Record<string, keyof HrDashboardResponse> = {
            total: 'totalEmployees',
            active: 'activeEmployees',
            pending: 'pendingEmployeesCount',
            suspended: 'suspendedEmployees',
            retired: 'retiredEmployees',
            standby: 'standByEmployees',
            terminated: 'terminatedEmployees',
            onLeave: 'leaveEmployees',
            rejected: 'rejectedEmployees',
        };
        const mappedKey = map[key];
        return mappedKey ? (report[mappedKey] as number) || 0 : 0;
    }

    // Old EmpDbReport format
    const map: Record<string, keyof EmpDbReport> = {
        total: 'EmpTot',
        active: 'EmpAct',
        pending: 'EmpPen',
        suspended: 'EmpSus',
        retired: 'EmpRet',
        standby: 'EmpStd',
        terminated: 'EmpTer',
        onLeave: 'EmpLeave',
        rejected: 'EmpRej',
    };
    const mappedKey = map[key];
    return mappedKey ? (report[mappedKey] as number) || 0 : 0;
};

const getTranslation = (t: any, key: string): string => {
    if (!t) return DEFAULT_TRANSLATIONS[key] || key;
    const value = t[key as keyof typeof t];
    return value && typeof value === 'string' ? value : DEFAULT_TRANSLATIONS[key] || key;
};

// ============================================================
// STAT CARD COMPONENT
// ============================================================

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    change?: number;
    color: 'blue' | 'green' | 'amber' | 'purple' | 'slate';
    footer?: string;
    description?: string;
    onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, change, color, footer, description, onClick }: StatCardProps) => {
    const colorConfig = {
        blue: {
            iconBg: 'bg-blue-50 dark:bg-blue-950/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-100 dark:border-blue-900/30',
            changeBg: 'bg-blue-50 dark:bg-blue-950/30',
            changeText: 'text-blue-600 dark:text-blue-400',
            hover: 'hover:border-blue-200 dark:hover:border-blue-800',
        },
        green: {
            iconBg: 'bg-green-50 dark:bg-green-950/30',
            iconColor: 'text-green-600 dark:text-green-400',
            border: 'border-green-100 dark:border-green-900/30',
            changeBg: 'bg-green-50 dark:bg-green-950/30',
            changeText: 'text-green-600 dark:text-green-400',
            hover: 'hover:border-green-200 dark:hover:border-green-800',
        },
        amber: {
            iconBg: 'bg-amber-50 dark:bg-amber-950/30',
            iconColor: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-100 dark:border-amber-900/30',
            changeBg: 'bg-amber-50 dark:bg-amber-950/30',
            changeText: 'text-amber-600 dark:text-amber-400',
            hover: 'hover:border-amber-200 dark:hover:border-amber-800',
        },
        purple: {
            iconBg: 'bg-purple-50 dark:bg-purple-950/30',
            iconColor: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-100 dark:border-purple-900/30',
            changeBg: 'bg-purple-50 dark:bg-purple-950/30',
            changeText: 'text-purple-600 dark:text-purple-400',
            hover: 'hover:border-purple-200 dark:hover:border-purple-800',
        },
        slate: {
            iconBg: 'bg-slate-50 dark:bg-slate-800',
            iconColor: 'text-slate-600 dark:text-slate-400',
            border: 'border-slate-100 dark:border-slate-700',
            changeBg: 'bg-slate-50 dark:bg-slate-800',
            changeText: 'text-slate-600 dark:text-slate-400',
            hover: 'hover:border-slate-200 dark:hover:border-slate-600',
        }
    };

    const colors = colorConfig[color];
    const hasValidChange = change !== undefined && !isNaN(change) && change !== 0;
    const isPositive = hasValidChange && change > 0;
    const isNegative = hasValidChange && change < 0;

    return (
        <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={onClick}
            className={`bg-white dark:bg-slate-900 rounded-lg border ${colors.border} ${colors.hover} p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {value}
                    </p>
                </div>
                <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                    <Icon className={`w-4 h-4 ${colors.iconColor}`} />
                </div>
            </div>

            {(footer || description || hasValidChange) && (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                        {description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                        {hasValidChange && (
                            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${colors.changeBg}`}>
                                {isPositive && <TrendingUp size={10} className={colors.changeText} />}
                                {isNegative && <TrendingDown size={10} className={colors.changeText} />}
                                <span className={`text-xs font-medium ${colors.changeText}`}>
                                    {isPositive ? '+' : ''}{change.toFixed(1)}%
                                </span>
                            </div>
                        )}
                    </div>
                    {footer && !description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {footer}
                        </p>
                    )}
                </div>
            )}

            {/* View all indicator */}
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    View all {title.toLowerCase()} <Eye className="w-3 h-3" />
                </span>
            </div>
        </motion.div>
    );
};

// ============================================================
// MAIN STATS CARDS COMPONENT
// ============================================================

const StatsCards: React.FC<StatsCardsProps> = ({
                                                   report,
                                                   previousPeriod,
                                                   onStatClick,
                                                   showPercentages = true,
                                                   showDescription = true,
                                                   columns = 4,
                                                   variant = "default",
                                               }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Get values from report (supports both formats)
    const total = getValue(report, 'total');
    const active = getValue(report, 'active');
    const pending = getValue(report, 'pending');
    const onLeave = getValue(report, 'onLeave');
    const suspended = getValue(report, 'suspended');
    const terminated = getValue(report, 'terminated');
    const retired = getValue(report, 'retired');
    const standby = getValue(report, 'standby');
    const rejected = getValue(report, 'rejected');

    // Calculate rates
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
    const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;
    const leaveRate = total > 0 ? Math.round((onLeave / total) * 100) : 0;

    // Calculate changes
    const totalChange = previousPeriod?.totalEmployees
        ? ((total - previousPeriod.totalEmployees) / previousPeriod.totalEmployees) * 100
        : undefined;

    const activeChange = previousPeriod?.activeEmployees
        ? ((active - previousPeriod.activeEmployees) / previousPeriod.activeEmployees) * 100
        : undefined;

    // Handle card click navigation
    const handleCardClick = (statKey: string, value: number) => {
        if (onStatClick) {
            onStatClick(statKey, value);
        }

        // Navigate to employee list with filter
        navigate('/hr/employees/record', {
            state: {
                filter: statKey,
                filterValue: statKey === 'total' ? 'all' : statKey
            }
        });
    };

    // Translation helper
    const getTrans = (key: string): string => getTranslation(t, key);

    // Grid columns
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    };

    // Stats data
    const stats = [
        {
            key: "total",
            title: getTrans("totalEmployees"),
            value: total,
            icon: Users,
            color: "blue" as const,
            description: getTrans("allActiveEmployees"),
            change: totalChange,
        },
        {
            key: "active",
            title: getTrans("active"),
            value: active,
            icon: UserCheck,
            color: "green" as const,
            description: getTrans("currentlyWorking"),
            change: activeChange,
            footer: `${activeRate}% ${getTrans("activeRate")}`,
        },
        {
            key: "pending",
            title: getTrans("pending"),
            value: pending,
            icon: UserPlus,
            color: "amber" as const,
            description: getTrans("awaitingApproval"),
            footer: `${pendingRate}% of total`,
        },
        {
            key: "onLeave",
            title: getTrans("onLeave"),
            value: onLeave,
            icon: UserMinus,
            color: "purple" as const,
            description: getTrans("currentlyOnLeave"),
            footer: `${leaveRate}% of total`,
        },
        {
            key: "suspended",
            title: getTrans("suspended"),
            value: suspended,
            icon: PauseCircle,
            color: "red" as const,
            description: getTrans("temporarilySuspended"),
        },
        {
            key: "terminated",
            title: getTrans("terminated"),
            value: terminated,
            icon: UserX,
            color: "red" as const,
            description: getTrans("contractTerminated"),
        },
        {
            key: "retired",
            title: getTrans("retired"),
            value: retired,
            icon: Award,
            color: "slate" as const,
            description: getTrans("retiredEmployees"),
        },
        {
            key: "standby",
            title: getTrans("standby"),
            value: standby,
            icon: Activity,
            color: "slate" as const,
            description: getTrans("onStandby"),
        },
        {
            key: "rejected",
            title: getTrans("rejected"),
            value: rejected,
            icon: UserX,
            color: "slate" as const,
            description: getTrans("applicationsRejected"),
        },
    ];

    // Filter stats for compact view
    const displayStats = variant === "compact"
        ? stats.filter(s => s.value > 0 && ['total', 'active', 'pending', 'onLeave'].includes(s.key))
        : stats;

    return (
        <div className="space-y-4">
            {/* Summary Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {getTrans("workforceOverview")}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {total.toLocaleString()} {getTrans("totalEmployees").toLowerCase()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {getTrans("active")}: {active}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                        <div className="text-right">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{getTrans("activeRate")}</p>
                            <p className="text-base font-bold text-green-600 dark:text-green-400">
                                {activeRate}%
                            </p>
                        </div>
                        <div className="w-24">
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${activeRate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
                className={`grid gap-3 ${gridCols[columns]}`}
            >
                {displayStats.map((stat) => (
                    <StatCard
                        key={stat.key}
                        title={stat.title}
                        value={stat.value.toLocaleString()}
                        icon={stat.icon}
                        color={stat.color}
                        description={showDescription ? stat.description : undefined}
                        footer={stat.footer}
                        change={stat.change}
                        onClick={() => handleCardClick(stat.key, stat.value)}
                    />
                ))}
            </motion.div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>{getTrans("liveData")}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>{getTrans("updatedToday")}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                    <Eye className="h-3 w-3" />
                    <span>{getTrans("clickCardsForDetails")}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" />
                    <span>{getTrans("allDepartments")}</span>
                </div>
                {report && 'totalDepartments' in report && (
                    <>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                            <span>{report.totalDepartments} departments</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StatsCards;