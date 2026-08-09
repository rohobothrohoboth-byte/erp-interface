import { motion } from 'framer-motion';
import { Users, Sparkles, Building2, UserCheck, Clock } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

// ============================================================
// TYPES
// ============================================================

interface EmployeeManagementHeaderProps {
  totalEmployees?: number;
  activeEmployees?: number;
  onLeaveEmployees?: number;
  loading?: boolean;
}

// ============================================================
// STAT CARD COMPONENT
// ============================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'amber' | 'blue';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, loading }) => {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
  };

  const classes = colorClasses[color];

  if (loading) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl px-5 py-3 shadow-sm border border-slate-200 dark:border-slate-700 min-w-[90px] text-center animate-pulse">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto mb-2" />
          <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-10 mx-auto" />
        </div>
    );
  }

  return (
      <div
          className={`bg-white dark:bg-slate-900 rounded-xl px-5 py-3 shadow-sm border ${classes.border} min-w-[90px] text-center hover:shadow-md transition-all hover:scale-105`}
      >
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Icon className={`w-3.5 h-3.5 ${classes.text}`} />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {label}
          </p>
        </div>
        <p className={`text-xl font-bold ${classes.text}`}>{value}</p>
      </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const EmployeeManagementHeader: React.FC<EmployeeManagementHeaderProps> = ({
                                                                             totalEmployees = 0,
                                                                             activeEmployees = 0,
                                                                             onLeaveEmployees = 0,
                                                                             loading = false,
                                                                           }) => {
  const { t } = useLanguage();

  return (
      <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
      >
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          {/* Left: Title */}
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">
                {t.employee || 'Employee'} {t.management || 'Management'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                {t.employeeManagementDescription ||
                    'Manage and track all employee information in one place'}
              </p>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex items-center gap-3">
            <StatCard
                label={t.total || 'Total'}
                value={totalEmployees}
                icon={Users}
                color="blue"
                loading={loading}
            />
            <StatCard
                label={t.active || 'Active'}
                value={activeEmployees}
                icon={UserCheck}
                color="emerald"
                loading={loading}
            />
            <StatCard
                label={t.onLeave || 'On Leave'}
                value={onLeaveEmployees}
                icon={Clock}
                color="amber"
                loading={loading}
            />
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full mt-1" />
      </motion.div>
  );
};

export default EmployeeManagementHeader;