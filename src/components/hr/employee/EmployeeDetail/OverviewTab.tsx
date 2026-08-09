import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Star,
  Award,
  UserCheck,
  Calendar,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Users,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity
} from 'lucide-react';
import { EmpPhotoCircle } from '../../../ui/EmpPhoto';
import { useEmpDetailLeave, useEmpDetailOverview } from '../../../../services/hr/employee/empDetail/empDetail.queries';
import { useLanguage } from '../../../../i18n/LanguageContext';
// ============ Helper Components ============

const WORKING_DAYS = 23;

const COLOR_MAP: Record<string, { color: string; track: string; text: string; icon: React.ReactNode }> = {
  vacation: {
    color: 'bg-emerald-500',
    track: 'bg-emerald-100',
    text: 'text-emerald-700',
    icon: <Briefcase className="w-3 h-3" />
  },
  sick: {
    color: 'bg-blue-500',
    track: 'bg-blue-100',
    text: 'text-blue-700',
    icon: <Activity className="w-3 h-3" />
  },
  personal: {
    color: 'bg-purple-500',
    track: 'bg-purple-100',
    text: 'text-purple-700',
    icon: <Users className="w-3 h-3" />
  },
  annual: {
    color: 'bg-emerald-500',
    track: 'bg-emerald-100',
    text: 'text-emerald-700',
    icon: <Calendar className="w-3 h-3" />
  },
};

// Loading Skeleton Component
const DetailSkeleton = ({ rows = 4 }: { rows?: number }) => {
  const { t } = useLanguage();
  return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-5 w-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="p-5 space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-5 w-full bg-slate-100 rounded animate-pulse" />
              </div>
          ))}
        </div>
      </div>
  );
};

// Error Component
const DetailError = ({ message }: { message: string }) => {
  const { t } = useLanguage();
  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-8 text-center border border-red-200"
      >
        <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">{t.failedToLoadData || 'Failed to Load Data'}</h3>
        <p className="text-red-600">{message}</p>
      </motion.div>
  );
};

// Read Card Component
interface ReadCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: string;
  gradient?: string;
  bgGradient?: string;
}

const ReadCard = ({
                    title,
                    icon,
                    children,
                    badge,
                    gradient = "from-emerald-500 to-teal-600",
                    bgGradient = "from-emerald-50 to-teal-50"
                  }: ReadCardProps) => {
  return (
      <motion.div
          whileHover={{ y: -2 }}
          className="relative group h-full"
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

        <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
          <div className={`bg-gradient-to-r ${bgGradient} px-5 py-4 border-b border-slate-100`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 bg-gradient-to-r ${gradient} rounded-xl shadow-md`}>
                  <div className="text-white">{icon}</div>
                </div>
                <h3 className="text-base font-semibold text-slate-800">{title}</h3>
              </div>
              {badge && (
                  <span className="px-2.5 py-1 bg-white/80 backdrop-blur-sm text-xs font-medium text-slate-600 rounded-full shadow-sm">
                {badge}
              </span>
              )}
            </div>
          </div>

          <div className="p-5 flex-1">
            {children}
          </div>
        </div>
      </motion.div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  color: string;
  bg: string;
  trend?: number;
}

const StatCard = ({ icon, label, value, color, bg, trend }: StatCardProps) => {
  const { t } = useLanguage();
  const hasTrend = trend !== undefined && trend !== 0;
  const isPositive = trend && trend > 0;

  return (
      <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center text-center gap-2 hover:shadow-md transition-all duration-300"
      >
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color} mb-1`}>
          {icon}
        </div>
        <span className="text-2xl font-bold text-slate-800">{value ?? '—'}</span>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        {hasTrend && (
            <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}% {t.fromLastMonth || 'from last month'}</span>
            </div>
        )}
      </motion.div>
  );
};

// Attendance Bars Component
const AttendanceBars = memo(({ filledDays }: { filledDays: number }) => (
    <div className="w-full flex gap-0.5 mt-2">
      {Array.from({ length: WORKING_DAYS }).map((_, i) => (
          <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < filledDays ? 'bg-emerald-500' : 'bg-emerald-100'}`}
          />
      ))}
    </div>
));

// Leave Progress Bar Component
const LeaveProgressBar = ({ leave }: { leave: any }) => {
  const { t } = useLanguage();
  const used = parseFloat(leave.usedDays) || 0;
  const total = parseFloat(leave.totalDays) || 0;
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const colors = COLOR_MAP[leave.leaveType.toLowerCase()] ?? {
    color: 'bg-gray-500',
    track: 'bg-gray-100',
    text: 'text-gray-700',
    icon: <Calendar className="w-3 h-3" />
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded ${colors.track}`}>
              {colors.icon}
            </div>
            <span className="text-sm font-medium text-slate-700">{leave.leaveType}</span>
          </div>
          <span className={`text-xs font-semibold ${colors.text}`}>
          {used}/{total} {t.days || 'days'}
        </span>
        </div>
        <div className="relative">
          <div className={`h-2 rounded-full ${colors.track} overflow-hidden`}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-full rounded-full ${colors.color} relative`}
            >
              {pct > 10 && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                  </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
  );
};

// ============ Main Component ============

export const OverviewTab = memo(function OverviewTab({ employeeId }: { employeeId: string }) {
  const { t } = useLanguage();
  const { data, isLoading, error } = useEmpDetailOverview(employeeId);
  const { data: leaveData, isLoading: leaveLoading } = useEmpDetailLeave(employeeId);

  const attendPct = data?.attendPer ? Number(data.attendPer) : 0;
  const filledDays = Math.round((attendPct / 100) * WORKING_DAYS);
  const attendDisplay = `${attendPct}%`;
  const currentMonth = data?.attendMonth ?? new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const statCards = useMemo(() => [
    { icon: <Clock className="h-5 w-5" />, label: t.tenure || 'Tenure', value: data?.tenure, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 2.5 },
    { icon: <Star className="h-5 w-5" />, label: t.performance || 'Performance', value: data?.perStr, color: 'text-amber-600', bg: 'bg-amber-50', trend: 0.8 },
    { icon: <Award className="h-5 w-5" />, label: t.training || 'Training', value: data?.training, color: 'text-blue-600', bg: 'bg-blue-50', trend: 1.2 },
  ], [data?.tenure, data?.perStr, data?.training, t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-slate-100 mx-auto mb-3" />
                <div className="h-6 bg-slate-100 rounded w-1/2 mx-auto mb-2" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mx-auto" />
              </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DetailSkeleton rows={2} />
          <DetailSkeleton rows={4} />
        </div>
      </div>
  );

  if (error) return <DetailError message={error.message} />;
  if (!data) return null;

  return (
      <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
      >
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => (
              <motion.div key={card.label} variants={itemVariants}>
                <StatCard {...card} />
              </motion.div>
          ))}

          {/* Attendance Card */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center text-center gap-2 hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{attendDisplay}</span>
              <span className="text-xs text-slate-400">{currentMonth}</span>
              <AttendanceBars filledDays={filledDays} />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide pt-1">{t.attendanceRate || 'Attendance Rate'}</span>
              {attendPct > 80 ? (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>{t.excellent || 'Excellent'}</span>
                  </div>
              ) : attendPct > 60 ? (
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{t.good || 'Good'}</span>
                  </div>
              ) : attendPct > 0 ? (
                  <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{t.needsImprovement || 'Needs Improvement'}</span>
                  </div>
              ) : null}
            </div>
          </motion.div>
        </div>

        {/* Reports To + Leave Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports To Card */}
          <motion.div variants={itemVariants}>
            <ReadCard
                title={t.reportsTo || 'Reports To'}
                icon={<UserCheck className="w-4 h-4" />}
                gradient="from-blue-500 to-indigo-600"
                bgGradient="from-blue-50 to-indigo-50"
            >
              <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl">
                <EmpPhotoCircle size={48} name={data.repToName} />
                <div>
                  <p className="font-semibold text-slate-800 text-lg">{data.repToName || '—'}</p>
                  <p className="text-sm text-slate-500">{data.repToPos || t.noReportingManager || 'No reporting manager'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-xs text-slate-400">{t.directReport || 'Direct Report'}</span>
                  </div>
                </div>
              </div>
            </ReadCard>
          </motion.div>

          {/* Time Off Balance Card */}
          <motion.div variants={itemVariants}>
            <ReadCard
                title={t.timeOffBalance || 'Time Off Balance'}
                icon={<Calendar className="w-4 h-4" />}
                gradient="from-purple-500 to-pink-600"
                bgGradient="from-purple-50 to-pink-50"
            >
              {leaveLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex justify-between mb-2">
                            <div className="h-4 bg-slate-200 rounded w-1/3" />
                            <div className="h-4 bg-slate-200 rounded w-1/4" />
                          </div>
                          <div className="h-2 bg-slate-100 rounded" />
                        </div>
                    ))}
                  </div>
              ) : (!leaveData || leaveData.length === 0) ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">{t.leavePolicyNotConfigured || 'Leave policy is not configured.'}</p>
                    <p className="text-xs text-slate-400 mt-1">{t.contactHrAdmin || 'Contact HR administrator'}</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                    {leaveData.map((leave) => (
                        <LeaveProgressBar key={leave.leavePolicyId} leave={leave} />
                    ))}

                    {/* Summary Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{t.totalLeaveDays || 'Total Leave Days'}</span>
                        <span className="font-semibold text-slate-700">
                      {leaveData.reduce((acc, l) => acc + (parseFloat(l.totalDays) || 0), 0)} {t.days || 'days'}
                    </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>{t.usedThisYear || 'Used This Year'}</span>
                        <span className="font-semibold text-slate-700">
                      {leaveData.reduce((acc, l) => acc + (parseFloat(l.usedDays) || 0), 0)} {t.days || 'days'}
                    </span>
                      </div>
                    </div>
                  </div>
              )}
            </ReadCard>
          </motion.div>
        </div>
      </motion.div>
  );
});

export default OverviewTab;