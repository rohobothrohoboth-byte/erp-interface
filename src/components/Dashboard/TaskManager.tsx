import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Circle, Clock, Calendar, Flag,
    Search, ChevronDown, AlertCircle, Loader2
} from 'lucide-react';
import { format, formatDistanceToNow, isBefore, differenceInDays } from 'date-fns';
import { getTasks, updateTaskStatus, getTaskStats } from '../../services/task/task.api';
import type { Task, TaskStats } from '../../services/task/task.api';
import { useAuthStore } from '../../stores/auth.store';
import { useLanguage } from '../../i18n/LanguageContext';
import toast from 'react-hot-toast';

interface TaskManagerProps {
    compact?: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = ({ compact = false }) => {
    const { employeeId } = useAuthStore();
    const { t } = useLanguage();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<TaskStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTask, setExpandedTask] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!employeeId) return;
        setLoading(true);
        try {
            const [tasksData, statsData] = await Promise.all([
                getTasks(employeeId),
                getTaskStats(employeeId)
            ]);
            setTasks(tasksData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleStatus = async (taskId: string, currentStatus: Task['status']) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        try {
            await updateTaskStatus(taskId, newStatus);
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined } : t
            ));
            toast.success(newStatus === 'completed' ? t.taskCompleted : t.taskPending);
        } catch (error) {
            toast.error(t.taskUpdated || 'Failed to update task');
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'high': return <Flag className="w-4 h-4 text-orange-500" />;
            case 'medium': return <Flag className="w-4 h-4 text-yellow-500" />;
            default: return <Flag className="w-4 h-4 text-green-500" />;
        }
    };

    const getPriorityLabel = (priority: string): string => {
        switch (priority) {
            case 'urgent': return t.urgent;
            case 'high': return t.high;
            case 'medium': return t.medium;
            default: return t.low;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{t.completed}</span>;
            case 'in_progress':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{t.inProgress}</span>;
            case 'pending':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">{t.pending}</span>;
            case 'overdue':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{t.overdue || 'Overdue'}</span>;
            default: return null;
        }
    };

    const getDueDateStatus = (dueDate: string, status: string) => {
        if (status === 'completed') return 'text-green-500';
        const date = new Date(dueDate);
        const now = new Date();
        if (isBefore(date, now)) return 'text-red-500';
        if (differenceInDays(date, now) <= 2) return 'text-orange-500';
        return 'text-slate-400';
    };

    const filteredTasks = useMemo(() => {
        let filtered = tasks;

        if (filter !== 'all') {
            filtered = filtered.filter(t => t.status === filter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(term) ||
                t.description?.toLowerCase().includes(term)
            );
        }

        return filtered.sort((a, b) => {
            if (a.status === 'overdue' && b.status !== 'overdue') return -1;
            if (a.status !== 'overdue' && b.status === 'overdue') return 1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [tasks, filter, searchTerm]);

    const filterLabels = {
        all: t.all || 'All',
        pending: t.pending,
        in_progress: t.inProgress,
        completed: t.completed,
        overdue: t.overdue || 'Overdue'
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">{t.noTasks || 'No tasks assigned'}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header with Stats */}
            {!compact && stats && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.total}</p>
                            <p className="text-xs text-slate-500">{t.total || 'Total'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            <p className="text-xs text-slate-500">{t.pending}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                            <p className="text-xs text-slate-500">{t.inProgress}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            <p className="text-xs text-slate-500">{t.completed}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                            <p className="text-xs text-slate-500">{t.overdue || 'Overdue'}</p>
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${stats.completionRate}%` }}
                        />
                    </div>
                    <p className="text-xs text-center text-slate-500 mt-2">{stats.completionRate}% {t.completionRate || 'completion rate'}</p>
                </div>
            )}

            {/* Filters */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap gap-2 mb-3">
                    {(['all', 'pending', 'in_progress', 'completed', 'overdue'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${filter === f ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            {filterLabels[f]}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t.search || 'Search tasks...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Task List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                <AnimatePresence>
                    {filteredTasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${task.status === 'completed' ? 'opacity-75' : ''}`}
                        >
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => handleToggleStatus(task.id, task.status)}
                                        className="flex-shrink-0 mt-0.5"
                                    >
                                        {task.status === 'completed' ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-slate-400 hover:text-emerald-500 transition-colors" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {task.title}
                                                    </p>
                                                    {getStatusBadge(task.status)}
                                                </div>
                                                {expandedTask === task.id && task.description && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="text-xs text-slate-500 mt-2"
                                                    >
                                                        {task.description}
                                                    </motion.p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                                >
                                                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${expandedTask === task.id ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                            <div className="flex items-center gap-1">
                                                {getPriorityIcon(task.priority)}
                                                <span className="capitalize">{getPriorityLabel(task.priority)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span className={getDueDateStatus(task.dueDate, task.status)}>
                                                    {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            {task.status !== 'completed' && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                                                </div>
                                            )}
                                            {task.module && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span>{task.module}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TaskManager;