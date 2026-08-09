import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  PauseCircle,
  UserX,
  Award,
  Activity,
  Calendar,
  Eye,
  Building2
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';

// ============================================================
// TYPES
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
  totalDepartments: number;
  totalPositions: number;
  employeesByDepartment: Record<string, number>;
  employeesByPosition: Record<string, number>;
  employeesByStatus: Record<string, number>;
  generatedAt: string;
  cacheDurationSeconds: number;
}

interface EmployeeStatsCardsProps {
  data?: HrDashboardResponse | any; // ✅ Allow any type
  loading?: boolean;
  onStatClick?: (statKey: string, value: number) => void;
}

// ============================================================
// STATS CONFIGURATION
// ============================================================

const STATS_CONFIG = [
  { key: "total", titleKey: "totalEmployees", icon: Users, color: "blue" as const },
  { key: "active", titleKey: "active", icon: UserCheck, color: "green" as const },
  { key: "pending", titleKey: "pending", icon: UserPlus, color: "amber" as const },
  { key: "onLeave", titleKey: "onLeave", icon: Clock, color: "purple" as const },
  { key: "suspended", titleKey: "suspended", icon: PauseCircle, color: "red" as const },
  { key: "terminated", titleKey: "terminated", icon: UserX, color: "red" as const },
  { key: "retired", titleKey: "retired", icon: Award, color: "slate" as const },
  { key: "standby", titleKey: "standby", icon: Activity, color: "slate" as const },
  { key: "rejected", titleKey: "rejected", icon: UserX, color: "slate" as const },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({
                                                                 data,
                                                                 loading = false,
                                                                 onStatClick,
                                                               }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // ✅ Map data from backend format to component format
  const mappedData = {
    totalEmployees: data?.EmpTot ?? data?.totalEmployees ?? 0,
    activeEmployees: data?.EmpAct ?? data?.activeEmployees ?? 0,
    pendingEmployeesCount: data?.EmpPen ?? data?.pendingEmployeesCount ?? 0,
    suspendedEmployees: data?.EmpSus ?? data?.suspendedEmployees ?? 0,
    retiredEmployees: data?.EmpRet ?? data?.retiredEmployees ?? 0,
    standByEmployees: data?.EmpStd ?? data?.standByEmployees ?? 0,
    terminatedEmployees: data?.EmpTer ?? data?.terminatedEmployees ?? 0,
    leaveEmployees: data?.EmpLeave ?? data?.leaveEmployees ?? 0,
    rejectedEmployees: data?.EmpRej ?? data?.rejectedEmployees ?? 0,
    totalDepartments: data?.totalDepartments ?? 0,
    totalPositions: data?.totalPositions ?? 0,
  };

  // ✅ Debug: Log mapped data
  console.log('📊 Mapped Stats Data:', mappedData);

  // Get translations
  const getTrans = (key: string): string => {
    if (t && typeof t === 'function') {
      return t(key) || key;
    }
    return key;
  };

  // Handle card click
  const handleCardClick = (statKey: string, value: number) => {
    if (onStatClick) {
      onStatClick(statKey, value);
    }

    navigate('/hr/employees/record', {
      state: {
        filter: statKey,
        filterValue: statKey === 'total' ? 'all' : statKey,
      },
    });
  };

  // Loading state
  if (loading) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
              <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 animate-pulse"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-12" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 mt-2" />
              </div>
          ))}
        </div>
    );
  }

  // No data state
  if (!data || mappedData.totalEmployees === 0) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8 text-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No Data Available
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Unable to load employee statistics.
          </p>
        </div>
    );
  }

  // Stats with mapped values
  const stats = [
    { key: "total", title: getTrans("totalEmployees"), value: mappedData.totalEmployees, icon: Users, color: "blue" as const },
    { key: "active", title: getTrans("active"), value: mappedData.activeEmployees, icon: UserCheck, color: "green" as const },
    { key: "pending", title: getTrans("pending"), value: mappedData.pendingEmployeesCount, icon: UserPlus, color: "amber" as const },
    { key: "onLeave", title: getTrans("onLeave"), value: mappedData.leaveEmployees, icon: Clock, color: "purple" as const },
    { key: "suspended", title: getTrans("suspended"), value: mappedData.suspendedEmployees, icon: PauseCircle, color: "red" as const },
    { key: "terminated", title: getTrans("terminated"), value: mappedData.terminatedEmployees, icon: UserX, color: "red" as const },
    { key: "retired", title: getTrans("retired"), value: mappedData.retiredEmployees, icon: Award, color: "slate" as const },
    { key: "standby", title: getTrans("standby"), value: mappedData.standByEmployees, icon: Activity, color: "slate" as const },
    { key: "rejected", title: getTrans("rejected"), value: mappedData.rejectedEmployees, icon: UserX, color: "slate" as const },
  ];

  return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-3">
          {stats.map((stat) => (
              <motion.div
                  key={stat.key}
                  whileHover={{ y: -2 }}
                  onClick={() => handleCardClick(stat.key, stat.value)}
                  className={`bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                      stat.value === 0 ? 'opacity-50' : ''
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <stat.icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                View all {stat.title.toLowerCase()} <Eye className="w-3 h-3" />
              </span>
                </div>
              </motion.div>
          ))}
        </div>
      </div>
  );
};

export default EmployeeStatsCards;