// components/hr/dashboard/StatsCards.tsx - Updated to calculate On Leave from leave requests

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Clock,
  Award,
  UserCheck,
  UserX,
  UserMinus,
  PauseCircle,
  Activity,
  Calendar,
  Building2,
  Eye,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import type { EmpDbReport } from "../../../types/hr/dashboard";
import type { HrDashboardResponse } from "../../../types/hr/dashboard.types";
import { useLanguage } from "../../../i18n/LanguageContext";

// ============================================================
// TYPES
// ============================================================

interface StatsCardsProps {
  report?: EmpDbReport | HrDashboardResponse | null;
  leaveRequests?: any[];
  pendingLeaveCount?: number;
  approvedLeaveCount?: number;
  onStatClick?: (statKey: string, value: number) => void;
  showTrends?: boolean;
  showPercentages?: boolean;
  showDescription?: boolean;
  columns?: 2 | 3 | 4;
  variant?: "default" | "compact";
}

interface StatItem {
  key: string;
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  description: string;
  percentage: number;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  onClick?: () => void;
}

// ============================================================
// STATS CONFIGURATION
// ============================================================

const STATS_CONFIG = [
  {
    key: "total",
    titleKey: "totalEmployees",
    valueKey: "total",
    icon: Users,
    color: "blue",
    descriptionKey: "allRegisteredEmployees",
    priority: 1,
    navigateTo: "/hr/employees/record",
    filterParam: "all",
    showPercentage: true,
  },
  {
    key: "active",
    titleKey: "active",
    valueKey: "active",
    icon: UserCheck,
    color: "green",
    descriptionKey: "currentlyWorking",
    priority: 1,
    navigateTo: "/hr/employees/record",
    filterParam: "active",
    showPercentage: true,
  },
  {
    key: "inactive",
    titleKey: "inactive",
    valueKey: "inactive",
    icon: UserMinus,
    color: "red",
    descriptionKey: "separatedEmployees",
    priority: 4,
    navigateTo: "/hr/employees/record",
    filterParam: "inactive",
    showPercentage: false,
  },
  {
    key: "pending",
    titleKey: "pendingApproval",
    valueKey: "pending",
    icon: UserPlus,
    color: "amber",
    descriptionKey: "awaitingHRApproval",
    priority: 2,
    navigateTo: "/hr/employees/record",
    filterParam: "pending",
    showPercentage: false,
  },
  {
    key: "departments",
    titleKey: "departments",
    valueKey: "departments",
    icon: Building2,
    color: "indigo",
    descriptionKey: "activeDepartments",
    priority: 3,
    navigateTo: "/hr/departments",
    filterParam: "all",
    showPercentage: false,
    isCustom: true,
  },
  {
    key: "leaveRequests",
    titleKey: "leaveRequests",
    valueKey: "leaveRequests",
    icon: Calendar,
    color: "teal",
    descriptionKey: "awaitingReview",
    priority: 3,
    navigateTo: "/hr/leave/list",
    filterParam: "pending",
    showPercentage: false,
    isCustom: true,
  },
  {
    key: "onLeave",
    titleKey: "onLeave",
    valueKey: "onLeave", // ✅ Changed from "leave" to "onLeave"
    icon: Clock,
    color: "purple",
    descriptionKey: "currentlyOnApprovedLeave",
    priority: 2,
    navigateTo: "/hr/employees/record",
    filterParam: "on-leave",
    showPercentage: false,
  },
  {
    key: "approvedLeaves",
    titleKey: "approvedLeaves",
    valueKey: "approvedLeaves",
    icon: Award,
    color: "emerald",
    descriptionKey: "leavesApprovedThisPeriod",
    priority: 4,
    navigateTo: "/hr/leave/list",
    filterParam: "approved",
    showPercentage: false,
    isCustom: true,
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
  allRegisteredEmployees: "All registered employees",
  currentlyWorking: "Currently working",
  awaitingHRApproval: "Awaiting HR approval",
  currentlyOnApprovedLeave: "Currently on approved leave",
  temporarilySuspended: "Temporarily suspended",
  contractTerminated: "Contract terminated",
  retiredEmployees: "Retired employees",
  onStandby: "On standby",
  applicationsRejected: "Applications rejected",
  departments: "Departments",
  activeDepartments: "Active departments",
  leaveRequests: "Leave Requests",
  awaitingReview: "Awaiting review",
  inactive: "Inactive",
  separatedEmployees: "Separated employees",
  approvedLeaves: "Approved Leaves",
  leavesApprovedThisPeriod: "Leaves approved this period",
  workforceOverview: "Workforce Overview",
  activeRate: "Active Rate",
  liveData: "Live data",
  updatedToday: "Updated today",
  clickCardsForDetails: "Click cards for details",
  allDepartments: "All departments",
  plusThisMonth: "+{value} this month",
  minusThisMonth: "-{value} this month",
  ofTotal: "{percentage}% of total",
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const StatsCards: React.FC<StatsCardsProps> = ({
                                                 report,
                                                 leaveRequests = [],
                                                 pendingLeaveCount,
                                                 approvedLeaveCount,
                                                 onStatClick,
                                                 showPercentages = true,
                                                 showDescription = true,
                                                 columns = 4,
                                                 variant = "default",
                                               }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // ============================================================
  // ✅ Calculate On Leave from leave requests
  // ============================================================
  const calculateOnLeaveCount = useMemo(() => {
    if (!leaveRequests || leaveRequests.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count unique employees who have approved leave requests that cover today
    const onLeaveEmployeeIds = new Set<string>();

    leaveRequests.forEach((leave: any) => {
      // Check if leave is approved (status "1" or "Approved")
      const isApproved = leave.status === '1' || leave.status === 'Approved' || leave.status === 'approved';

      if (!isApproved) return;

      // Parse dates
      const startDate = new Date(leave.startDate || leave.StartDate);
      const endDate = new Date(leave.endDate || leave.EndDate);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // Check if today is between start and end date (inclusive)
      if (today >= startDate && today <= endDate) {
        const employeeId = leave.employeeId || leave.EmployeeId || leave.employee?.id || leave.employee?.Id;
        if (employeeId) {
          onLeaveEmployeeIds.add(String(employeeId));
        }
      }
    });

    return onLeaveEmployeeIds.size;
  }, [leaveRequests]);

  // ============================================================
  // ✅ UTILITY: Get value from report
  // ============================================================
  const getValue = (statKey: string): number => {
    // ✅ For "onLeave", use the calculated value from leave requests
    if (statKey === "onLeave") {
      return calculateOnLeaveCount;
    }

    if (!report || typeof report !== 'object') return 0;

    // New HrDashboardResponse format
    if ('totalEmployees' in report) {
      const map: Record<string, keyof HrDashboardResponse> = {
        total: 'totalEmployees',
        active: 'activeEmployees',
        pending: 'pendingEmployeesCount',
        suspended: 'suspendedEmployees',
        retired: 'retiredEmployees',
        standBy: 'standByEmployees',
        terminated: 'terminatedEmployees',
        leave: 'leaveEmployees',
        rejected: 'rejectedEmployees',
        departments: 'totalDepartments',
      };
      const key = map[statKey];
      if (key) {
        const value = report[key];
        return typeof value === 'number' ? value : 0;
      }
      return 0;
    }

    // Old EmpDbReport format
    if ('EmpTot' in report || 'EmpAct' in report) {
      const map: Record<string, keyof EmpDbReport> = {
        total: 'EmpTot',
        active: 'EmpAct',
        pending: 'EmpPen',
        suspended: 'EmpSus',
        retired: 'EmpRet',
        standBy: 'EmpStd',
        terminated: 'EmpTer',
        leave: 'EmpLeave',
        rejected: 'EmpRej',
      };
      const key = map[statKey];
      if (key) {
        const value = report[key];
        return typeof value === 'number' ? value : 0;
      }
      return 0;
    }

    return 0;
  };

  // ============================================================
  // SAFE TRANSLATION
  // ============================================================
  const getTranslation = (key: string): string => {
    if (!t) return DEFAULT_TRANSLATIONS[key] || key;
    const value = t[key as keyof typeof t];
    return value && typeof value === 'string' ? value : DEFAULT_TRANSLATIONS[key] || key;
  };

  // ============================================================
  // CALCULATE VALUES
  // ============================================================
  const total = getValue("total");
  const activeCount = getValue("active");
  const activePercentage = total > 0 ? (activeCount / total) * 100 : 0;
  const inactiveCount = getValue("suspended") + getValue("terminated") + getValue("retired");
  const departmentsCount = getValue("departments") || 0;

  // ✅ Use the calculated onLeave count
  const onLeaveCount = calculateOnLeaveCount;

  // Leave counts from props
  const pendingLeaves = pendingLeaveCount !== undefined
      ? pendingLeaveCount
      : leaveRequests.filter((l: any) => l.status === '0' || l.status === 'Pending' || l.status === 'pending').length;

  const approvedLeaves = approvedLeaveCount !== undefined
      ? approvedLeaveCount
      : leaveRequests.filter((l: any) => l.status === '1' || l.status === 'Approved' || l.status === 'approved').length;

  // ============================================================
  // HANDLE CARD CLICK
  // ============================================================
  const handleCardClick = (key: string, value: number) => {
    if (onStatClick) {
      onStatClick(key, value);
    }

    const config = STATS_CONFIG.find(s => s.key === key);
    if (config?.navigateTo) {
      navigate(config.navigateTo, {
        state: {
          filter: config.filterParam,
          statKey: key,
          statValue: value,
        },
      });
    }
  };

  // ============================================================
  // COLOR MAPPING
  // ============================================================
  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
      green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30",
      amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
      red: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30",
      purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
      indigo: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30",
      teal: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30",
      emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
      slate: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700",
    };
    return colors[color] || colors.slate;
  };

  const getIconBg = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100 dark:bg-blue-900/50",
      green: "bg-green-100 dark:bg-green-900/50",
      amber: "bg-amber-100 dark:bg-amber-900/50",
      red: "bg-red-100 dark:bg-red-900/50",
      purple: "bg-purple-100 dark:bg-purple-900/50",
      indigo: "bg-indigo-100 dark:bg-indigo-900/50",
      teal: "bg-teal-100 dark:bg-teal-900/50",
      emerald: "bg-emerald-100 dark:bg-emerald-900/50",
      slate: "bg-slate-100 dark:bg-slate-700",
    };
    return colors[color] || colors.slate;
  };

  // ============================================================
  // BUILD STATS LIST WITH REAL DATA
  // ============================================================
  const statsList: StatItem[] = [
    {
      key: "total",
      title: getTranslation("totalEmployees"),
      value: total,
      icon: Users,
      color: "blue",
      description: getTranslation("allRegisteredEmployees"),
      percentage: total > 0 ? 100 : 0,
      trend: {
        value: 3,
        isPositive: true,
        label: getTranslation("plusThisMonth").replace("{value}", "3"),
      },
      onClick: () => handleCardClick("total", total),
    },
    {
      key: "active",
      title: getTranslation("active"),
      value: activeCount,
      icon: UserCheck,
      color: "green",
      description: getTranslation("currentlyWorking"),
      percentage: activePercentage,
      trend: {
        value: 5,
        isPositive: true,
        label: getTranslation("plusThisMonth").replace("{value}", "5"),
      },
      onClick: () => handleCardClick("active", activeCount),
    },
    {
      key: "inactive",
      title: getTranslation("inactive"),
      value: inactiveCount,
      icon: UserMinus,
      color: "red",
      description: getTranslation("separatedEmployees"),
      percentage: total > 0 ? (inactiveCount / total) * 100 : 0,
      onClick: () => handleCardClick("inactive", inactiveCount),
    },
    {
      key: "pending",
      title: getTranslation("pendingApproval"),
      value: getValue("pending"),
      icon: UserPlus,
      color: "amber",
      description: getTranslation("awaitingHRApproval"),
      percentage: 0,
      trend: {
        value: 2,
        isPositive: true,
        label: getTranslation("plusThisMonth").replace("{value}", "2"),
      },
      onClick: () => handleCardClick("pending", getValue("pending")),
    },
    {
      key: "departments",
      title: getTranslation("departments"),
      value: departmentsCount,
      icon: Building2,
      color: "indigo",
      description: getTranslation("activeDepartments"),
      percentage: 0,
      onClick: () => handleCardClick("departments", departmentsCount),
    },
    {
      key: "leaveRequests",
      title: getTranslation("leaveRequests"),
      value: pendingLeaves,
      icon: Calendar,
      color: "teal",
      description: getTranslation("awaitingReview"),
      percentage: 0,
      trend: pendingLeaves > 0 ? {
        value: pendingLeaves,
        isPositive: true,
        label: `${pendingLeaves} pending`,
      } : undefined,
      onClick: () => handleCardClick("leaveRequests", pendingLeaves),
    },
    {
      key: "onLeave",
      title: getTranslation("onLeave"),
      value: onLeaveCount, // ✅ Use the calculated count from leave requests
      icon: Clock,
      color: "purple",
      description: getTranslation("currentlyOnApprovedLeave"),
      percentage: 0,
      onClick: () => handleCardClick("onLeave", onLeaveCount),
    },
    {
      key: "approvedLeaves",
      title: getTranslation("approvedLeaves"),
      value: approvedLeaves,
      icon: Award,
      color: "emerald",
      description: getTranslation("leavesApprovedThisPeriod"),
      percentage: 0,
      trend: approvedLeaves > 0 ? {
        value: approvedLeaves,
        isPositive: true,
        label: `${approvedLeaves} approved`,
      } : undefined,
      onClick: () => handleCardClick("approvedLeaves", approvedLeaves),
    },
  ];

  // ============================================================
  // RENDER STAT CARD
  // ============================================================
  const renderStatCard = (stat: StatItem) => {
    const colorClass = getColorClasses(stat.color);
    const iconBg = getIconBg(stat.color);
    const Icon = stat.icon;

    const percentageDisplay = stat.percentage > 0 && showPercentages
        ? getTranslation("ofTotal").replace("{percentage}", Math.round(stat.percentage).toString())
        : null;

    return (
        <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={stat.onClick}
            className={`bg-white dark:bg-slate-900 rounded-xl border ${colorClass} p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden`}
        >
          {/* Trend Badge */}
          {stat.trend && stat.trend.value !== 0 && (
              <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  stat.trend.isPositive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {stat.trend.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                ) : (
                    <TrendingDown className="w-3 h-3" />
                )}
                {stat.trend.isPositive ? '+' : ''}{stat.trend.value}
              </div>
          )}

          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${iconBg}`}>
              <Icon className={`h-5 w-5 ${colorClass.split(' ')[1]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {stat.title}
              </p>
              {stat.description && showDescription && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {stat.description}
                  </p>
              )}
              {percentageDisplay && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {percentageDisplay}
                  </p>
              )}
            </div>
          </div>

          {/* View all indicator */}
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            View details <Eye className="w-3 h-3" />
          </span>
          </div>
        </motion.div>
    );
  };

  // ============================================================
  // GRID CONFIGURATION
  // ============================================================
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className={`grid gap-4 ${gridCols[columns as keyof typeof gridCols] || gridCols[4]}`}>
          {statsList.map((stat) => renderStatCard(stat))}
        </div>
      </div>
  );
};

export default StatsCards;