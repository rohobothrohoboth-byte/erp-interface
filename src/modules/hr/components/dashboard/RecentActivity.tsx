// components/hr/dashboard/RecentActivity.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  ChevronRight,
  UserPlus,
  TrendingUp,
  UserMinus,
  Calendar,
  Sparkles,
  Activity,
  User,
  CheckCircle,
  Clock
} from 'lucide-react';

// ✅ Match backend response structure
export interface ActivityItem {
  employeeId: string;
  employeeName: string;
  employeeNameAm?: string;
  employeeCode: string;
  departmentName: string;
  positionName: string;
  status: string;
  activityDate: string;
  activityType: 'status_change' | 'hired' | 'promoted' | 'left' | 'on_leave';
}

interface RecentActivityProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
  maxItems?: number;
  compact?: boolean;
  loading?: boolean;
}

const getStatusConfig = (status: string, activityType: string) => {
  // If activityType is provided, use it
  if (activityType === 'hired') {
    return {
      icon: UserPlus,
      color: 'emerald',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      label: 'Hired',
    };
  }
  if (activityType === 'promoted') {
    return {
      icon: TrendingUp,
      color: 'blue',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      label: 'Promoted',
    };
  }
  if (activityType === 'left') {
    return {
      icon: UserMinus,
      color: 'red',
      bg: 'bg-red-50 dark:bg-red-950/30',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      label: 'Left',
    };
  }
  if (activityType === 'on_leave') {
    return {
      icon: Calendar,
      color: 'amber',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      label: 'On Leave',
    };
  }

  // Default based on status
  if (status === 'Active') {
    return {
      icon: CheckCircle,
      color: 'emerald',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      label: 'Active',
    };
  }
  if (status === 'Pending') {
    return {
      icon: Clock,
      color: 'amber',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      label: 'Pending',
    };
  }

  return {
    icon: User,
    color: 'slate',
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    label: status || 'Updated',
  };
};

const getInitials = (name: string): string =>
    name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || '??';

const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
};

const RecentActivity: React.FC<RecentActivityProps> = ({
                                                         activities,
                                                         onViewAll,
                                                         maxItems = 5,
                                                         compact = false,
                                                         loading = false,
                                                       }) => {
  const displayActivities = activities.slice(0, maxItems);

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      window.location.href = '/hr/activities';
    }
  };

  // Loading state
  if (loading) {
    return (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Activity</h2>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
            ))}
          </div>
        </Card>
    );
  }

  if (compact) {
    return (
        <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Recent Updates</h3>
                {activities.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activities.length}
                    </Badge>
                )}
              </div>
              {activities.length > 0 && (
                  <button
                      onClick={handleViewAll}
                      className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                  >
                    View all
                    <ChevronRight className="w-3 h-3" />
                  </button>
              )}
            </div>

            <div className="space-y-2">
              {displayActivities.map((activity, index) => {
                const statusConfig = getStatusConfig(activity.status, activity.activityType);
                const Icon = statusConfig.icon;

                return (
                    <motion.div
                        key={activity.employeeId || index}
                        variants={itemVariants}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${statusConfig.bg}`}>
                          <Icon className={`h-3 w-3 ${statusConfig.text}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{activity.employeeName}</p>
                          <p className="text-xs text-gray-400">{activity.positionName} • {activity.departmentName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0 text-xs px-2`}>
                          {statusConfig.label}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(activity.activityDate)}</p>
                      </div>
                    </motion.div>
                );
              })}
            </div>

            {activities.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No recent activities</p>
                  <p className="text-xs text-gray-400 mt-1">New updates will appear here</p>
                </div>
            )}
          </div>
        </Card>
    );
  }

  return (
      <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
      >
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          {/* Header with Gradient */}
          <div className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 rounded-full"></div>
                    <div className="relative bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                      <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      Recent Activity
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Latest employee status changes
                    </p>
                  </div>
                </div>

                {activities.length > 0 && (
                    <button
                        onClick={handleViewAll}
                        className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-all group"
                    >
                      View all
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
              </div>
            </div>
          </div>

          {/* Activity List */}
          <div className="p-5">
            {activities.length === 0 ? (
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-full mb-4">
                    <Sparkles className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    No recent activity
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Employee activity will appear here as changes occur
                  </p>
                </motion.div>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {displayActivities.map((activity, index) => {
                      const statusConfig = getStatusConfig(activity.status, activity.activityType);
                      const Icon = statusConfig.icon;

                      return (
                          <motion.div
                              key={activity.employeeId || index}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit={{ opacity: 0, x: -20 }}
                              whileHover={{ scale: 1.01 }}
                              className="group relative bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-start gap-4">
                              {/* Avatar/Icon */}
                              <div className="relative z-10">
                                <div className={`p-2.5 rounded-xl ${statusConfig.bg} border ${statusConfig.border} shadow-sm group-hover:scale-105 transition-transform`}>
                                  <Icon className={`h-5 w-5 ${statusConfig.text}`} />
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                      {activity.employeeName}
                                    </h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                      {activity.positionName} • {activity.departmentName}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0 px-3 py-1 text-xs font-medium`}>
                                      {statusConfig.label}
                                    </Badge>
                                    <span className="text-xs text-slate-400 mt-1">{formatTime(activity.activityDate)}</span>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                  Code: {activity.employeeCode}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
            )}
          </div>

          {/* Footer Stats */}
          {activities.length > 0 && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                                    {activities.length} activity {activities.length !== 1 ? 'items' : 'item'}
                                </span>
                  </div>
                </div>
              </motion.div>
          )}
        </Card>
      </motion.div>
  );
};

export default RecentActivity;