import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getTasks, updateTask, deleteTask, type Task } from '@/services/task/task.api';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

const EditTaskPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { employeeId } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [task, setTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pending' as Task['status'],
        priority: 'medium' as Task['priority'],
        dueDate: '',
        category: '',
        module: ''
    });

    useEffect(() => {
        const loadTask = async () => {
            if (!id || !employeeId) {
                toast.error('Invalid task or user');
                navigate('/tasks');
                return;
            }

            setLoading(true);
            try {
                const tasks = await getTasks(employeeId);
                const foundTask = tasks.find(t => t.id === id);

                if (foundTask) {
                    setTask(foundTask);
                    setFormData({
                        title: foundTask.title,
                        description: foundTask.description || '',
                        status: foundTask.status,
                        priority: foundTask.priority,
                        dueDate: foundTask.dueDate.split('T')[0],
                        category: foundTask.category || '',
                        module: foundTask.module || '',
                    });
                } else {
                    toast.error('Task not found');
                    navigate('/tasks');
                }
            } catch (error) {
                toast.error('Failed to load task');
                console.error(error);
                navigate('/tasks');
            } finally {
                setLoading(false);
            }
        };

        loadTask();
    }, [id, employeeId, navigate]);

    // In EditTaskPage.tsx

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;
        if (!employeeId) {
            toast.error('User not authenticated');
            return;
        }

        if (!formData.title.trim()) {
            toast.error('Please enter task title');
            return;
        }
        if (!formData.dueDate) {
            toast.error('Please select due date');
            return;
        }

        setSaving(true);
        try {
            const updatedTask = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                dueDate: new Date(formData.dueDate).toISOString(),
                category: formData.category,
                module: formData.module,
            };

            // Pass employeeId as third parameter
            await updateTask(task.id, updatedTask, employeeId);

            toast.success('Task updated successfully');
            navigate('/page/task');
        } catch (error) {
            toast.error('Failed to update task');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!task) return;

        const confirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
        if (!confirmed) return;

        setDeleting(true);
        try {
            await deleteTask(task.id);
            toast.success('Task deleted successfully');
            navigate('/page/task');
        } catch (error) {
            toast.error('Failed to delete task');
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-sm text-slate-500">Loading task...</p>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-slate-500">Task not found</p>
                    <Button onClick={() => navigate('/tasks')} className="mt-4">
                        Back to Tasks
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/tasks')}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        Edit Task
                    </h1>
                </div>
                <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                    {deleting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter task title"
                        className="h-10"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Description
                    </Label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter task description"
                        rows={5}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Status
                        </Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: Task['status']) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Priority
                        </Label>
                        <Select
                            value={formData.priority}
                            onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Due Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="h-10"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Category
                        </Label>
                        <Input
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Development, Meeting, etc."
                            className="h-10"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Module
                    </Label>
                    <Input
                        value={formData.module}
                        onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                        placeholder="HRM, Auth, Finance, etc."
                        className="h-10"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/tasks')}
                        className="h-9"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 h-9"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};

export default EditTaskPage;