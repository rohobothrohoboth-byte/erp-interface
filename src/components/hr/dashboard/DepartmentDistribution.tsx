// components/hr/dashboard/DepartmentDistribution.tsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    TrendingUp,
    ChevronRight,
    PieChart,
    BarChart3,
    User,
    Briefcase
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

// ============================================================
// TYPES
// ============================================================

interface DepartmentData {
    id: string;
    name: string;
    nameAm?: string;
    employeeCount: number;
    color?: string;
}

interface DepartmentDistributionProps {
    departments: DepartmentData[];
    totalEmployees?: number;
    loading?: boolean;
    onDepartmentClick?: (departmentId: string) => void;
    maxItems?: number;
    showPercentages?: boolean;
    variant?: 'bar' | 'list' | 'compact';
}

// ============================================================
// COLORS
// ============================================================

const DEPARTMENT_COLORS = [
    { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', bar: 'from-emerald-500 to-teal-500' },
    { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', bar: 'from-blue-500 to-indigo-500' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', bar: 'from-purple-500 to-pink-500' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', bar: 'from-orange-500 to-amber-500' },
    { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', bar: 'from-red-500 to-rose-500' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', bar: 'from-cyan-500 to-sky-500' },
    { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', bar: 'from-violet-500 to-purple-500' },
    { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-600 dark:text-fuchsia-400', bar: 'from-fuchsia-500 to-pink-500' },
    { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', bar: 'from-amber-500 to-yellow-500' },
    { bg: 'bg-lime-100 dark:bg-lime-900/30', text: 'text-lime-600 dark:text-lime-400', bar: 'from-lime-500 to-green-500' },
    { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400', bar: 'from-rose-500 to-red-500' },
    { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', bar: 'from-teal-500 to-cyan-500' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const DepartmentDistribution: React.FC<DepartmentDistributionProps> = ({
                                                                           departments = [],
                                                                           totalEmployees,
                                                                           loading = false,
                                                                           onDepartmentClick,
                                                                           maxItems = 10,
                                                                           showPercentages = true,
                                                                           variant = 'bar',
                                                                       }) => {
    const { t } = useLanguage();

    // ============================================================
    // CALCULATE TOTALS & SORT
    // ============================================================

    const sortedDepartments = useMemo(() => {
        // Filter out departments with 0 employees and "Unassigned" if there are other departments
        let filtered = [...departments].filter(dept => dept.employeeCount > 0);

        // If there's an "Unassigned" department and there are other departments,
        // rename it to show the actual count of employees without a department
        const unassignedIndex = filtered.findIndex(d =>
            d.name === 'Unassigned' || d.name === 'unassigned' || d.name === 'null' || d.name === 'undefined'
        );

        if (unassignedIndex !== -1 && filtered.length > 1) {
            const unassigned = filtered[unassignedIndex];
            // Keep it but with a better label
            filtered[unassignedIndex] = {
                ...unassigned,
                name: 'No Department',
                id: 'no-department',
            };
        }

        return filtered
            .sort((a, b) => b.employeeCount - a.employeeCount)
            .slice(0, maxItems);
    }, [departments, maxItems]);

    const total = useMemo(() => {
        if (totalEmployees !== undefined) return totalEmployees;
        return departments.reduce((sum, dept) => sum + dept.employeeCount, 0);
    }, [departments, totalEmployees]);

    const maxCount = useMemo(() => {
        if (sortedDepartments.length === 0) return 1;
        return sortedDepartments[0].employeeCount;
    }, [sortedDepartments]);

    // ============================================================
    // GET COLOR FOR DEPARTMENT
    // ============================================================

    const getDepartmentColor = (index: number) => {
        return DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length];
    };

    // ============================================================
    // FORMAT DEPARTMENT NAME
    // ============================================================

    const formatDepartmentName = (name: string): string => {
        if (!name || name === 'null' || name === 'undefined') {
            return 'No Department';
        }
        if (name === 'Unassigned' || name === 'unassigned') {
            return 'No Department';
        }
        // Capitalize first letter
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                            <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                            <div className="w-10 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ============================================================
    // NO DATA STATE
    // ============================================================

    if (sortedDepartments.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t.departmentDistribution || 'Department Distribution'}
                    </h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                        <Building2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t.noDepartmentData || 'No department data available'}
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // RENDER BAR VIEW
    // ============================================================

    const renderBarView = () => (
        <div className="space-y-3">
            {sortedDepartments.map((dept, index) => {
                const percentage = total > 0 ? (dept.employeeCount / total) * 100 : 0;
                const barWidth = total > 0 ? (dept.employeeCount / maxCount) * 100 : 0;
                const colors = getDepartmentColor(index);
                const displayName = formatDepartmentName(dept.name);
                const isUnassigned = displayName === 'No Department';

                return (
                    <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onDepartmentClick?.(dept.id)}
                        className={`group cursor-pointer ${onDepartmentClick ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg p-1 -m-1 transition-colors' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Department Name with Icon */}
                            <div className="flex items-center gap-2 min-w-[130px]">
                                <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                                    {isUnassigned ? (
                                        <User className={`w-3.5 h-3.5 ${colors.text}`} />
                                    ) : (
                                        <Building2 className={`w-3.5 h-3.5 ${colors.text}`} />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {displayName}
                                    {isUnassigned && (
                                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                      (No department assigned)
                    </span>
                                    )}
                </span>
                            </div>

                            {/* Bar */}
                            <div className="flex-1 min-w-[40px]">
                                <div className="relative h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${barWidth}%` }}
                                        transition={{ duration: 0.6, delay: index * 0.05 }}
                                        className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
                                    />
                                    {percentage > 8 && (
                                        <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-medium text-white drop-shadow-md">
                      {percentage.toFixed(0)}%
                    </span>
                                    )}
                                </div>
                            </div>

                            {/* Count and Percentage */}
                            <div className="flex items-center gap-2 min-w-[80px] justify-end">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {dept.employeeCount}
                </span>
                                {showPercentages && percentage <= 8 && (
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                    ({percentage.toFixed(1)}%)
                  </span>
                                )}
                                {onDepartmentClick && (
                                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );

    // ============================================================
    // RENDER LIST VIEW
    // ============================================================

    const renderListView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedDepartments.map((dept, index) => {
                const percentage = total > 0 ? (dept.employeeCount / total) * 100 : 0;
                const colors = getDepartmentColor(index);
                const displayName = formatDepartmentName(dept.name);
                const isUnassigned = displayName === 'No Department';

                return (
                    <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onDepartmentClick?.(dept.id)}
                        className={`bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 ${
                            onDepartmentClick ? 'cursor-pointer hover:shadow-md transition-all hover:border-emerald-200 dark:hover:border-emerald-800' : ''
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                                    {isUnassigned ? (
                                        <User className={`w-5 h-5 ${colors.text}`} />
                                    ) : (
                                        <Building2 className={`w-5 h-5 ${colors.text}`} />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {displayName}
                                    </p>
                                    {isUnassigned && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            No department assigned
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                    {dept.employeeCount}
                                </p>
                                {showPercentages && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        {percentage.toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );

    // ============================================================
    // RENDER COMPACT VIEW
    // ============================================================

    const renderCompactView = () => (
        <div className="flex flex-wrap gap-2">
            {sortedDepartments.map((dept, index) => {
                const percentage = total > 0 ? (dept.employeeCount / total) * 100 : 0;
                const colors = getDepartmentColor(index);
                const displayName = formatDepartmentName(dept.name);
                const isUnassigned = displayName === 'No Department';

                return (
                    <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => onDepartmentClick?.(dept.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 ${
                            onDepartmentClick ? 'cursor-pointer hover:shadow-md transition-all hover:border-emerald-200 dark:hover:border-emerald-800' : ''
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {displayName}
            </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {dept.employeeCount}
            </span>
                        {showPercentages && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                ({percentage.toFixed(0)}%)
              </span>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl">
                        <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t.departmentDistribution || 'Department Distribution'}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            {total} {t.totalEmployees?.toLowerCase() || 'employees'} • {sortedDepartments.length} {t.departments?.toLowerCase() || 'departments'}
                        </p>
                    </div>
                </div>

                {/* Total indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {total}
          </span>
                </div>
            </div>

            {/* Department Distribution */}
            {variant === 'list' && renderListView()}
            {variant === 'compact' && renderCompactView()}
            {variant === 'bar' && renderBarView()}
        </div>
    );
};

export default DepartmentDistribution;