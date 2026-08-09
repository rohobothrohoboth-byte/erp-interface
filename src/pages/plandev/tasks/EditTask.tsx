import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    Loader2,
    Target,
    Calendar,
    User,
    AlertCircle,
    Clock,
    Trash2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { showToast } from '../../../layout/layout';
import { motion } from 'framer-motion';
import { getProjectById } from '../../../services/plandev/project.api';
import type { Project, Task } from '../../../types/plandev/types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    InProgress: 'bg-blue-100 text-blue-800 border-blue-200',
    Completed: 'bg-green-100 text-green-800 border-green-200',
    Blocked: 'bg-red-100 text-red-800 border-red-200',
    Cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

const EditTask = () => {
    const navigate = useNavigate();
    const { id, taskId } = useParams<{ id: string; taskId: string }>();
    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState<Project | null>(null);
    const [task, setTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedToUserId: '',
        assignedToUserName: '',
        priority: 'Medium',
        status: 'Pending',
        startDate: '',
        endDate: '',
        estimatedHours: 0,
        taskType: ''
    });

    useEffect(() => {
        if (id && taskId) {
            fetchData();
        }
    }, [id, taskId]);

    const fetchData = async () => {
        try {
            const data = await getProjectById(id!);
            setProject(data);

            // Find the task from the project's tasks
            const foundTask = data.tasks?.find(t => t.id === taskId);
            if (foundTask) {
                setTask(foundTask);
                setFormData({
                    title: foundTask.title || '',
                    description: foundTask.description || '',
                    assignedToUserId: foundTask.assignedToUserId || '',
                    assignedToUserName: foundTask.assignedToUserName || '',
                    priority: foundTask.priority || 'Medium',
                    status: foundTask.status || 'Pending',
                    startDate: foundTask.startDate ? foundTask.startDate.split('T')[0] : '',
                    endDate: foundTask.endDate ? foundTask.endDate.split('T')[0] : '',
                    estimatedHours: foundTask.estimatedHours || 0,
                    taskType: foundTask.taskType || ''
                });
            } else {
                showToast.error('Task not found');
                navigate(`/plandev/strategic-plans/${id}/tasks`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast.error('Failed to load task');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast.success('Task updated successfully!');
            navigate(`/plandev/strategic-plans/${id}/tasks`);
        } catch (error) {
            showToast.error('Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                <span>{status}</span>
            </Badge>
        );
    };

    if (!task) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-4xl mx-auto"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/plandev/strategic-plans/${id}/tasks`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{project?.name}</span>
                            {task.taskNumber && (
                                <span className="text-xs text-gray-400">#{task.taskNumber}</span>
                            )}
                            {getStatusBadge(task.status)}
                        </div>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    onClick={() => {
                        if (confirm(`Delete task "${task.title}"?`)) {
                            showToast.info('Delete functionality coming soon');
                        }
                    }}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-600" />
                        Task Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                            </label>
                            <Input
                                required
                                placeholder="Enter task title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <Textarea
                                placeholder="Enter task description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="InProgress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Blocked">Blocked</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Estimated Hours */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Hours
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    placeholder="Enter estimated hours"
                                    value={formData.estimatedHours}
                                    onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Assigned To */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assigned To
                            </label>
                            <Input
                                placeholder="Enter assignee name"
                                value={formData.assignedToUserName}
                                onChange={(e) => setFormData({ ...formData, assignedToUserName: e.target.value })}
                            />
                        </div>

                        {/* Task Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Task Type
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.taskType}
                                onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                            >
                                <option value="">Select task type</option>
                                <option value="Planning">Planning</option>
                                <option value="Design">Design</option>
                                <option value="Development">Development</option>
                                <option value="Testing">Testing</option>
                                <option value="Deployment">Deployment</option>
                                <option value="Support">Support</option>
                                <option value="Training">Training</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(`/plandev/strategic-plans/${id}/tasks`)}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Task
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default EditTask;