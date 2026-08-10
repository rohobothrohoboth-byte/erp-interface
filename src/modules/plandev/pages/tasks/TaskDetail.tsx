import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Target,
    Loader2,
    Calendar,
    User,
    Tag,
    AlertCircle,
    CheckCircle,
    Clock,
    Building2,
    DollarSign,
    Flag,
    Users,
    FileText
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { showToast } from '@/shared/layout/layout';
import { motion } from 'framer-motion';
import { getProjectById } from '@/modules/plandev/services/project.api';
import type { Project, Task } from '@/modules/plandev/types/types';

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

const statusIcons: Record<string, React.ReactNode> = {
    Pending: <Clock className="w-4 h-4" />,
    InProgress: <Loader2 className="w-4 h-4 animate-spin" />,
    Completed: <CheckCircle className="w-4 h-4" />,
    Blocked: <AlertCircle className="w-4 h-4" />,
    Cancelled: <AlertCircle className="w-4 h-4" />,
};

const priorityColors: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-800',
    Medium: 'bg-blue-100 text-blue-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const TaskDetail = () => {
    const navigate = useNavigate();
    const { id, taskId } = useParams<{ id: string; taskId: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [task, setTask] = useState<Task | null>(null);

    // Fetch project and find the task
    const fetchData = useCallback(async () => {
        if (!id || !taskId) {
            setError('Missing required parameters');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log(`📡 Fetching project with ID: ${id}`);
            const result = await getProjectById(id);
            setProject(result);

            // Find the task from the project's tasks
            const foundTask = result.tasks?.find(t => t.id === taskId);

            if (foundTask) {
                setTask(foundTask);
                console.log('✅ Task found:', foundTask);
            } else {
                setError('Task not found');
            }
        } catch (error: any) {
            console.error('❌ Error fetching task:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load task';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id, taskId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        if (!task) return;
        if (!confirm(`Are you sure you want to delete task "${task.title}"? This action cannot be undone.`)) return;

        try {
            showToast.info('Delete functionality: Call deleteTask API');
            navigate(`/plandev/strategic-plans/${id}/tasks`);
        } catch (error: any) {
            console.error('❌ Error deleting task:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete task');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {statusIcons[status] || <AlertCircle className="w-4 h-4" />}
                <span>{status}</span>
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading task...</p>
                </div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{error || 'Task not found'}</p>
                <Button
                    className="mt-4"
                    onClick={() => navigate(`/plandev/strategic-plans/${id}/tasks`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tasks
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-5xl mx-auto"
        >
            {/* Header */}
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
                        <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">Project: {project?.name}</span>
                            {task.taskNumber && (
                                <span className="text-xs text-gray-400">#{task.taskNumber}</span>
                            )}
                            {getStatusBadge(task.status)}
                            <Badge className={priorityColors[task.priority] || 'bg-gray-100 text-gray-800'}>
                                {task.priority}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/plandev/strategic-plans/${id}/tasks/${task.id}/edit`)}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Tag className="w-4 h-4" />
                            Status
                        </div>
                        {getStatusBadge(task.status)}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Clock className="w-4 h-4" />
                            Estimated Hours
                        </div>
                        <p className="font-medium">{task.estimatedHours}h</p>
                        <p className="text-xs text-gray-400">Actual: {task.actualHours}h</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Calendar className="w-4 h-4" />
                            Dates
                        </div>
                        <p className="text-sm font-medium">Start: {formatDate(task.startDate)}</p>
                        {task.endDate && (
                            <p className="text-sm font-medium">End: {formatDate(task.endDate)}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Target className="w-4 h-4" />
                            Progress
                        </div>
                        <p className="font-medium">{task.progress}%</p>
                        <Progress value={task.progress} className="h-1.5 mt-1" />
                    </CardContent>
                </Card>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <User className="w-4 h-4" />
                            Assigned To
                        </div>
                        <p className="font-medium">{task.assignedToUserName || 'Unassigned'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <FileText className="w-4 h-4" />
                            Task Type
                        </div>
                        <p className="font-medium">{task.taskType || 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Flag className="w-4 h-4" />
                            Order
                        </div>
                        <p className="font-medium">#{task.order || 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-600" />
                        Description
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700">{task.description || 'No description provided'}</p>
                </CardContent>
            </Card>

            {/* Subtasks (if any) */}
            {task.subtasks && task.subtasks.length > 0 && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-500" />
                            Subtasks ({task.subtasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {task.subtasks.map((subtask: Task) => (
                                <li key={subtask.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(subtask.status)}
                                        <span className="text-sm">{subtask.title}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{subtask.progress}%</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/plandev/strategic-plans/${id}/tasks`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tasks
                </Button>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => navigate(`/plandev/strategic-plans/${id}`)}
                >
                    <Target className="w-4 h-4 mr-2" />
                    View Strategic Plan
                </Button>
            </div>
        </motion.div>
    );
};

export default TaskDetail;