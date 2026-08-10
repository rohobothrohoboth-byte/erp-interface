import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle,
    Circle,
    Clock,
    Calendar,
    Flag,
    Search,
    ChevronDown,
    AlertCircle,
    Loader2,
    Plus,
    Edit,
    Trash2,
    X,
    Bell
} from 'lucide-react';
import { format, formatDistanceToNow, isBefore, differenceInDays } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { getTasks, getTaskStats, updateTaskStatus, createTask, deleteTask, updateTask, type Task, type TaskStats } from '@/modules/task/services/task.api';
import { createNotification as createNotificationApi } from '@/modules/notification/services/notification.api';
import { useAuthStore } from '@/shared/stores/auth.store';
import toast from 'react-hot-toast';

const TaskManagement: React.FC = () => {
    const navigate = useNavigate();
    const { employeeId, userName } = useAuthStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<TaskStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium' as Task['priority'],
        dueDate: '',
        category: '',
        module: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadData = async () => {
        if (!employeeId) {
            console.log('No employeeId found');
            setLoading(false);
            return;
        }

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
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [employeeId]);

    // Helper function to create notification - FIXED
    const createNotification = async (userId: string, title: string, message: string, type: string = 'task', priority: string = 'medium') => {
        try {
            await createNotificationApi({
                userId: userId,
                title: title,
                message: message,
                type: type as any,
                priority: priority as any
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    };

    const handleToggleStatus = async (taskId: string, currentStatus: Task['status']) => {
        if (!employeeId) {
            toast.error('User not authenticated');
            return;
        }

        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        setActionLoading(taskId);

        try {
            await updateTaskStatus(taskId, newStatus);

            // Update local state
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined } : t
            ));

            // Refresh stats
            const newStats = await getTaskStats(employeeId);
            setStats(newStats);

            // Send notification when task is completed
            if (newStatus === 'completed') {
                const completedTask = tasks.find(t => t.id === taskId);
                if (completedTask) {
                    await createNotification(
                        completedTask.assignedTo,
                        'Task Completed',
                        `Task "${completedTask.title}" has been marked as completed.`,
                        'task',
                        'medium'
                    );
                }
            }

            toast.success(`Task marked as ${newStatus === 'completed' ? 'completed' : 'pending'}`);
        } catch (error) {
            toast.error('Failed to update task status');
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        setActionLoading(taskId);
        try {
            const taskToDelete = tasks.find(t => t.id === taskId);
            await deleteTask(taskId);

            // Send notification for task deletion
            if (taskToDelete) {
                await createNotification(
                    taskToDelete.assignedTo,
                    'Task Deleted',
                    `Task "${taskToDelete.title}" has been deleted.`,
                    'task',
                    'low'
                );
            }

            toast.success('Task deleted successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to delete task');
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            toast.error('Please enter task title');
            return;
        }
        if (!formData.dueDate) {
            toast.error('Please select due date');
            return;
        }
        if (!employeeId) {
            toast.error('User not authenticated');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingTask) {
                // Update existing task
                await updateTask(editingTask.id, {
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    dueDate: new Date(formData.dueDate).toISOString(),
                    category: formData.category,
                    module: formData.module,
                });

                // Send notification for task update
                await createNotification(
                    editingTask.assignedTo,
                    'Task Updated',
                    `Task "${formData.title}" has been updated.`,
                    'task',
                    formData.priority
                );

                toast.success('Task updated successfully');
            } else {
                // Create new task
                const newTask = await createTask({
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    dueDate: new Date(formData.dueDate).toISOString(),
                    assignedTo: employeeId,
                    assignedBy: employeeId,
                    category: formData.category,
                    module: formData.module,
                    status: 'pending',
                });

                // Send notification for new task
                await createNotification(
                    employeeId,
                    'New Task Created',
                    `Task "${formData.title}" has been created and assigned to you. Due date: ${new Date(formData.dueDate).toLocaleDateString()}`,
                    'task',
                    formData.priority
                );

                toast.success('Task created successfully');
            }

            setIsModalOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            toast.error('Failed to save task');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const openEditPage = (task: Task) => {
        navigate(`/tasks/${task.id}/edit`);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            dueDate: '',
            category: '',
            module: ''
        });
    };

    // Check for overdue tasks and send notifications
    useEffect(() => {
        const checkOverdueTasks = async () => {
            const now = new Date();
            const overdueTasks = tasks.filter(task =>
                task.status !== 'completed' &&
                new Date(task.dueDate) < now &&
                !task.notificationSent // You'd need to add this flag to your Task model
            );

            for (const task of overdueTasks) {
                await createNotification(
                    task.assignedTo,
                    'Task Overdue',
                    `Task "${task.title}" is overdue. Due date was ${new Date(task.dueDate).toLocaleDateString()}`,
                    'task',
                    'urgent'
                );
            }
        };

        if (tasks.length > 0) {
            checkOverdueTasks();
        }
    }, [tasks]);

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'high': return <Flag className="w-4 h-4 text-orange-500" />;
            case 'medium': return <Flag className="w-4 h-4 text-yellow-500" />;
            default: return <Flag className="w-4 h-4 text-green-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Completed</span>;
            case 'in_progress':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">In Progress</span>;
            case 'pending':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>;
            default:
                return null;
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

    const filteredTasks = React.useMemo(() => {
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
            if (a.status !== 'completed' && b.status === 'completed') return -1;
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [tasks, filter, searchTerm]);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header with Stats */}
                {stats && (
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.total}</p>
                                <p className="text-xs text-slate-500">Total</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                <p className="text-xs text-slate-500">Pending</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                                <p className="text-xs text-slate-500">In Progress</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                <p className="text-xs text-slate-500">Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                                <p className="text-xs text-slate-500">Overdue</p>
                            </div>
                        </div>
                        <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                style={{ width: `${stats.completionRate}%` }}
                            />
                        </div>
                        <p className="text-xs text-center text-slate-500 mt-2">{stats.completionRate}% completion rate</p>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {(['all', 'pending', 'in_progress', 'completed', 'overdue'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                                    filter === f
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                        <Button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Task
                        </Button>
                    </div>
                </div>

                {/* Task List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                    <AnimatePresence>
                        {filteredTasks.length === 0 ? (
                            <div className="p-8 text-center">
                                <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No tasks found</p>
                            </div>
                        ) : (
                            filteredTasks.map((task, index) => (
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
                                                disabled={actionLoading === task.id}
                                                className="flex-shrink-0 mt-0.5"
                                            >
                                                {actionLoading === task.id ? (
                                                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                                                ) : task.status === 'completed' ? (
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
                                                            onClick={() => openEditPage(task)}
                                                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                                        >
                                                            <Edit className="w-3 h-3 text-slate-400" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(task.id)}
                                                            disabled={actionLoading === task.id}
                                                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                                        >
                                                            <Trash2 className="w-3 h-3 text-red-400" />
                                                        </button>
                                                        {task.description && (
                                                            <button
                                                                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                                            >
                                                                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${expandedTask === task.id ? 'rotate-180' : ''}`} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        {getPriorityIcon(task.priority)}
                                                        <span className="capitalize">{task.priority}</span>
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
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Create Task Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-white dark:bg-slate-900 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-slate-800 dark:text-slate-200">
                            {editingTask ? 'Edit Task' : 'Create New Task'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter task title"
                                className="h-9 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Description
                            </Label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter task description"
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Priority
                            </Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Due Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="h-9 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Category
                            </Label>
                            <Input
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g., Development, Meeting"
                                className="h-9 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Module
                            </Label>
                            <Input
                                value={formData.module}
                                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                                placeholder="e.g., HRM, Auth, Task"
                                className="h-9 text-sm"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex justify-center gap-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={!formData.title.trim() || !formData.dueDate || isSubmitting}
                            className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                        >
                            {isSubmitting ? 'Saving...' : (editingTask ? 'Update' : 'Create')}
                        </Button>
                        <Button
                            variant="outline"
                            className="px-5 h-8 text-sm"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TaskManagement;