import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, Circle,
    Flag, Clock, Plus, X, User, Users, Send, Trash2, Edit, AlertCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
    isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, isToday } from 'date-fns';
import { getTasks, updateTaskStatus, createTask, deleteTask, updateTask, type Task } from '@/modules/task/services/task.api';
import { getEmployeesForAssignment } from '@/modules/task/services/task.api';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import toast from 'react-hot-toast';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { getAllAppUsers } from '@/modules/auth/services/account/account.api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';

interface TaskCalendarProps {
    compact?: boolean;
}

interface Employee {
    id: string;
    name: string;
    email: string;
    department?: string;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ compact = false }) => {
    const { employeeId, userName, role } = useAuthStore();
    const { t } = useLanguage();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium' as Task['priority'],
        assignedTo: employeeId || '',
        category: '',
        module: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<Task | null>(null);
    const [reassignTask, setReassignTask] = useState<Task | null>(null);
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [isReassigning, setIsReassigning] = useState(false);

    // Weekday names for calendar
    const weekdays = [
        t.sunday?.substring(0, 3) || 'Sun',
        t.monday?.substring(0, 3) || 'Mon',
        t.tuesday?.substring(0, 3) || 'Tue',
        t.wednesday?.substring(0, 3) || 'Wed',
        t.thursday?.substring(0, 3) || 'Thu',
        t.friday?.substring(0, 3) || 'Fri',
        t.saturday?.substring(0, 3) || 'Sat'
    ];

    // Check if user can assign tasks
    const canAssignTasks = React.useMemo(() => {
        const roleLower = role?.toLowerCase() || '';
        return roleLower === 'president' ||
            roleLower === 'pre' ||
            roleLower === 'admin' ||
            roleLower === 'administrator' ||
            roleLower === 'ceo' ||
            roleLower === 'manager' ||
            roleLower === 'supervisor';
    }, [role]);

    useEffect(() => {
        if (employeeId) {
            loadTasks();
        }
    }, [employeeId]);

    useEffect(() => {
        if (canAssignTasks && employeeId) {
            loadEmployees();
        }
    }, [canAssignTasks, employeeId]);

    const loadTasks = async () => {
        if (!employeeId) return;
        setLoading(true);
        try {
            const tasksData = await getTasks(employeeId);
            setTasks(tasksData);
        } catch (error) {
            console.error('Error loading tasks:', error);
            toast.error(t.taskCreated || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const loadEmployees = async () => {
        setLoadingEmployees(true);
        try {
            const employeesList = await getEmployeesForAssignment(employeeId);
            if (employeesList && employeesList.length > 0) {
                setEmployees(employeesList);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            setEmployees([]);
        } finally {
            setLoadingEmployees(false);
        }
    };

    const handleToggleStatus = async (taskId: string, currentStatus: Task['status']) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        try {
            await updateTaskStatus(taskId, newStatus);
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: newStatus } : t
            ));
            if (selectedDate) {
                const updatedTasks = tasks.map(t =>
                    t.id === taskId ? { ...t, status: newStatus } : t
                );
                setSelectedTasks(updatedTasks.filter(t => isSameDay(new Date(t.dueDate), selectedDate)));
            }
            toast.success(newStatus === 'completed' ? t.taskCompleted : t.taskPending);
        } catch (error) {
            toast.error(t.taskUpdated || 'Failed to update task');
        }
    };

    const handleDeleteTask = async (taskToDelete: Task) => {
        try {
            await deleteTask(taskToDelete.id);
            toast.success(t.taskDeleted);
            setSelectedTaskForDelete(null);
            loadTasks();
            if (selectedDate) {
                setSelectedTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
            }
        } catch (error) {
            toast.error(t.taskUpdated || 'Failed to delete task');
        }
    };

    const handleReassignTask = async () => {
        if (!reassignTask || !selectedAssignee) {
            toast.error(t.selectEmployee || 'Please select an employee');
            return;
        }

        setIsReassigning(true);
        try {
            await updateTask(reassignTask.id, { assignedTo: selectedAssignee });
            const assignedEmployee = employees.find(e => e.id === selectedAssignee);
            toast.success(t.taskReassigned);
            setReassignTask(null);
            setSelectedAssignee('');
            await loadTasks();
            if (selectedDate) {
                const updatedTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), selectedDate));
                setSelectedTasks(updatedTasks);
            }
        } catch (error) {
            toast.error(t.taskUpdated || 'Failed to reassign task');
            console.error(error);
        } finally {
            setIsReassigning(false);
        }
    };

    const handleAddTask = async () => {
        if (!formData.title.trim()) {
            toast.error(t.fillRequiredFields || 'Please enter task title');
            return;
        }
        if (!selectedDate) {
            toast.error(t.selectDate || 'Please select a date');
            return;
        }

        setIsSubmitting(true);
        try {
            const targetEmployeeId = canAssignTasks && formData.assignedTo ? formData.assignedTo : employeeId;

            const taskData = {
                title: formData.title,
                description: formData.description || '',
                priority: formData.priority,
                dueDate: selectedDate.toISOString(),
                assignedTo: targetEmployeeId!,
                assignedBy: employeeId!,
                status: 'pending',
                category: formData.category || 'Calendar',
                module: formData.module || 'Task',
                createdAt: new Date().toISOString(),
            };

            const newTask = await createTask(taskData);
            toast.success(t.taskCreated);
            setFormData({ title: '', description: '', priority: 'medium', assignedTo: '', category: '', module: '' });
            setIsAddTaskModalOpen(false);
            await loadTasks();

            const updatedTasksOnDate = tasks.filter(t => isSameDay(new Date(t.dueDate), selectedDate));
            setSelectedTasks([...updatedTasksOnDate, newTask]);
        } catch (error: any) {
            console.error('Error response:', error.response?.data);
            toast.error(t.taskUpdated || 'Failed to add task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        const tasksOnDate = tasks.filter(task => isSameDay(new Date(task.dueDate), date));
        setSelectedTasks(tasksOnDate);
        setIsModalOpen(true);
    };

    const openAddTaskModal = (date: Date) => {
        setSelectedDate(date);
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            assignedTo: employeeId || '',
            category: '',
            module: ''
        });
        setIsAddTaskModalOpen(true);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
            case 'high': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
            case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
            default: return 'text-green-500 bg-green-50 dark:bg-green-900/20';
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

    const getDayStatus = (date: Date) => {
        const tasksOnDay = tasks.filter(task => isSameDay(new Date(task.dueDate), date));
        const completedCount = tasksOnDay.filter(t => t.status === 'completed').length;
        const totalCount = tasksOnDay.length;
        if (totalCount === 0) return null;
        if (completedCount === totalCount && totalCount > 0) return 'completed';
        return 'has-tasks';
    };

    const days = eachDayOfInterval({
        start: startOfWeek(currentMonth, { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    });

    const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const getEmployeeName = (empId: string) => {
        const employee = employees.find(e => e.id === empId);
        return employee?.name || empId.substring(0, 8);
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Calendar Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                {t.taskCalendar}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={previousMonth}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-400" />
                            </button>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {format(currentMonth, 'MMMM yyyy')}
                            </span>
                            <button
                                onClick={nextMonth}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800">
                    {weekdays.map(day => (
                        <div key={day} className="bg-slate-50 dark:bg-slate-900/50 py-2 text-center">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {compact ? day.charAt(0) : day}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800">
                    {days.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isTodayDate = isToday(day);
                        const dayStatus = getDayStatus(day);
                        const tasksOnDay = tasks.filter(t => isSameDay(new Date(t.dueDate), day));
                        const urgentCount = tasksOnDay.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;

                        return (
                            <div
                                key={idx}
                                className={`
                                    relative min-h-[80px] p-2 bg-white dark:bg-slate-900 
                                    ${!isCurrentMonth ? 'opacity-40' : ''}
                                    ${isSelected ? 'ring-2 ring-emerald-500 ring-inset' : ''}
                                    hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group
                                `}
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-start">
                                        <span className={`
                                            text-sm w-6 h-6 flex items-center justify-center rounded-full mb-1
                                            ${isTodayDate ? 'bg-emerald-500 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        <button
                                            onClick={() => openAddTaskModal(day)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                        >
                                            <Plus className="w-3 h-3 text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="mt-auto">
                                        {urgentCount > 0 && (
                                            <div className="flex items-center gap-0.5 mb-0.5">
                                                <AlertCircle className="w-2.5 h-2.5 text-red-500" />
                                                <span className="text-[10px] text-red-500">{urgentCount}</span>
                                            </div>
                                        )}

                                        {dayStatus === 'completed' && tasksOnDay.length > 0 && (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        )}
                                        {dayStatus === 'has-tasks' && urgentCount === 0 && tasksOnDay.length > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500" />
                                                <span className="text-[10px] text-emerald-500">{tasksOnDay.length}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleDateClick(day)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        aria-label={`View tasks for ${format(day, 'MMMM dd, yyyy')}`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                {!compact && (
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-slate-500">{t.allTasksDone || 'All tasks done'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500" />
                            <span className="text-slate-500">{t.hasPendingTasks || 'Has pending tasks'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            <span className="text-slate-500">{t.urgentTasks || 'Urgent tasks'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Plus className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-500">{t.clickToManage || 'Click + or date to manage'}</span>
                        </div>
                        {canAssignTasks && (
                            <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-blue-500" />
                                <span className="text-slate-500">{t.canAssignTasks || 'Can assign tasks'}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* View Tasks Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-white dark:bg-slate-900 max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{t.tasksFor || 'Tasks for'} {selectedDate && format(selectedDate, 'MMMM dd, yyyy')}</DialogTitle>
                        <DialogDescription>
                            {selectedTasks.length} {selectedTasks.length !== 1 ? t.tasks || 'tasks' : t.task || 'task'} {t.onThisDay || 'on this day'}.
                            {canAssignTasks && ` ${t.clickToManage || 'Click the user icon to reassign tasks.'}`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end mb-2">
                        <Button
                            size="sm"
                            onClick={() => selectedDate && openAddTaskModal(selectedDate)}
                            className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            {t.addTask}
                        </Button>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto py-2">
                        {selectedTasks.length === 0 ? (
                            <div className="text-center py-8">
                                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">{t.noTasks || 'No tasks for this day'}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => selectedDate && openAddTaskModal(selectedDate)}
                                    className="mt-3"
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    {t.addTask}
                                </Button>
                            </div>
                        ) : (
                            selectedTasks.map((task) => (
                                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 group">
                                    <button
                                        onClick={() => handleToggleStatus(task.id, task.status)}
                                        className="flex-shrink-0 mt-0.5"
                                    >
                                        {task.status === 'completed' ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-slate-400 hover:text-emerald-500 transition-colors" />
                                        )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {task.title}
                                        </p>
                                        {task.description && (
                                            <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)} flex items-center gap-1`}>
                                                <Flag className="w-3 h-3" />
                                                {getPriorityLabel(task.priority)}
                                            </span>

                                            {task.assignedTo !== employeeId && (
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {t.assignedTo || 'Assigned to'}: {getEmployeeName(task.assignedTo)}
                                                </span>
                                            )}
                                            {task.assignedBy !== employeeId && task.assignedBy !== task.assignedTo && (
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {t.createdBy || 'Created by'}: {getEmployeeName(task.assignedBy)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {canAssignTasks && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setReassignTask(task);
                                                    setSelectedAssignee(task.assignedTo);
                                                }}
                                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                                title={t.reassignTask}
                                            >
                                                <Users className="w-3 h-3 text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedTaskForDelete(task)}
                                                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
                                                title={t.deleteTask}
                                            >
                                                <Trash2 className="w-3 h-3 text-red-400" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>{t.close || 'Close'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Task Modal */}
            <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
                <DialogContent className="bg-white dark:bg-slate-900 max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t.addTask} {t.for || 'for'} {selectedDate && format(selectedDate, 'MMMM dd, yyyy')}</DialogTitle>
                        <DialogDescription>
                            {t.fillRequiredFields || 'Fill in the task details below.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {t.taskTitle} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder={t.taskTitle}
                                className="h-9 text-sm"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {t.taskDescription}
                            </Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder={t.taskDescription}
                                rows={3}
                                className="text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {t.priority}
                            </Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: Task['priority']) => setFormData({...formData, priority: value})}
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">{t.low}</SelectItem>
                                    <SelectItem value="medium">{t.medium}</SelectItem>
                                    <SelectItem value="high">{t.high}</SelectItem>
                                    <SelectItem value="urgent">{t.urgent}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {t.category || 'Category'}
                            </Label>
                            <Input
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                placeholder={t.category || 'e.g., Meeting, Development, Review'}
                                className="h-9 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {t.module || 'Module'}
                            </Label>
                            <Input
                                value={formData.module}
                                onChange={(e) => setFormData({...formData, module: e.target.value})}
                                placeholder={t.module || 'e.g., HRM, Finance, Task'}
                                className="h-9 text-sm"
                            />
                        </div>

                        {canAssignTasks && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {t.assignedTo || 'Assign To'}
                                </Label>
                                <Select
                                    value={formData.assignedTo || employeeId}
                                    onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                                >
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder={t.selectEmployee || 'Select employee'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={employeeId!}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5">
                                                    <AvatarFallback className="text-xs bg-emerald-500 text-white">
                                                        {userName?.charAt(0) || 'M'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{t.myself || 'Myself'} ({userName || 'Current User'})</span>
                                            </div>
                                        </SelectItem>

                                        {employees.map(emp => (
                                            <SelectItem key={emp.employeeId} value={emp.employeeId}>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarFallback className="text-xs">
                                                            {emp.name?.charAt(0) || 'E'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{emp.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex justify-center gap-2">
                        <Button
                            onClick={handleAddTask}
                            disabled={!formData.title.trim() || isSubmitting}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 h-9 text-sm"
                        >
                            {isSubmitting ? t.adding || 'Adding...' : t.addTask}
                        </Button>
                        <Button
                            variant="outline"
                            className="px-5 h-9 text-sm"
                            onClick={() => setIsAddTaskModalOpen(false)}
                        >
                            {t.cancel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!selectedTaskForDelete} onOpenChange={() => setSelectedTaskForDelete(null)}>
                <DialogContent className="bg-white dark:bg-slate-900 max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t.deleteTask}</DialogTitle>
                        <DialogDescription>
                            {t.confirmDelete || 'This action cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-slate-500">
                        {t.confirmDelete || 'Are you sure you want to delete'} "{selectedTaskForDelete?.title}"?
                    </p>
                    <DialogFooter className="flex justify-center gap-2">
                        <Button
                            onClick={() => selectedTaskForDelete && handleDeleteTask(selectedTaskForDelete)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {t.deleteTask}
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedTaskForDelete(null)}>
                            {t.cancel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reassign Task Modal */}
            <Dialog open={!!reassignTask} onOpenChange={() => {
                setReassignTask(null);
                setSelectedAssignee('');
            }}>
                <DialogContent className="bg-white dark:bg-slate-900 max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t.reassignTask}</DialogTitle>
                        <DialogDescription>
                            {t.confirmReassign || 'Assign'} "{reassignTask?.title}" {t.toDifferentEmployee || 'to a different employee.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {t.assignedTo || 'Assign To'}
                            </Label>
                            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder={t.selectEmployee || 'Select employee'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5">
                                                    <AvatarFallback className="text-xs">
                                                        {emp.name?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {emp.name} {emp.id === employeeId ? `(${t.myself || 'You'})` : ''}
                                                {emp.department && (
                                                    <span className="text-xs text-slate-400 ml-1">
                                                        ({emp.department})
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-center gap-2">
                        <Button
                            onClick={handleReassignTask}
                            disabled={!selectedAssignee || isReassigning}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {isReassigning ? t.reassigning || 'Reassigning...' : t.reassignTask}
                        </Button>
                        <Button variant="outline" onClick={() => setReassignTask(null)}>
                            {t.cancel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TaskCalendar;