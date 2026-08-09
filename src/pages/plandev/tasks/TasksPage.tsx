import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Search,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Eye,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Target,
    Flag,
    User,
    Building2,
    DollarSign,
    Filter,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Download,
    FileText
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { showToast } from '../../../layout/layout';
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

const statusIcons: Record<string, React.ReactNode> = {
    Pending: <Clock className="w-4 h-4" />,
    InProgress: <Loader2 className="w-4 h-4 animate-spin" />,
    Completed: <CheckCircle className="w-4 h-4" />,
    Blocked: <AlertCircle className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
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

const TasksPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Fetch project and tasks
    const fetchData = useCallback(async () => {
        if (!id) {
            setError('No project ID provided');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log(`📡 Fetching project with ID: ${id}`);
            const data = await getProjectById(id);
            setProject(data);
            setTasks(data.tasks || []);
            console.log('✅ Tasks loaded:', data.tasks?.length || 0);
        } catch (error: any) {
            console.error('Error fetching tasks:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load tasks';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (task.taskNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
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

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'text-green-600';
        if (progress >= 50) return 'text-blue-600';
        if (progress >= 25) return 'text-yellow-600';
        return 'text-gray-600';
    };

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'Pending').length,
        inProgress: tasks.filter(t => t.status === 'InProgress').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        blocked: tasks.filter(t => t.status === 'Blocked').length,
        completionRate: tasks.length > 0
            ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100)
            : 0
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading tasks...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{error || 'Project not found'}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/plandev/initiatives/active')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Initiatives
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/plandev/initiatives/${id}`)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                        <p className="text-sm text-gray-500">
                            {project.name} • {tasks.length} tasks
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setRefreshing(true);
                            fetchData();
                        }}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                    >
                        {viewMode === 'list' ? 'Grid View' : 'List View'}
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate(`/plandev/initiatives/${id}/tasks/create`)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-3">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-yellow-600">Pending</p>
                        <p className="text-xl font-bold text-yellow-700">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-blue-600">In Progress</p>
                        <p className="text-xl font-bold text-blue-700">{stats.inProgress}</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-green-600">Completed</p>
                        <p className="text-xl font-bold text-green-700">{stats.completed}</p>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-purple-600">Completion</p>
                        <p className="text-xl font-bold text-purple-700">{stats.completionRate}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search tasks by title, number, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px]"
                >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px]"
                >
                    <option value="all">All Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>

            {/* Tasks Display */}
            {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tasks found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first task'}
                    </p>
                    <Button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate(`/plandev/initiatives/${id}/tasks/create`)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                    </Button>
                </div>
            ) : viewMode === 'list' ? (
                <div className="space-y-3">
                    {filteredTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="cursor-pointer"
                            onClick={() => navigate(`/plandev/initiatives/${id}/tasks/${task.id}`)}
                        >
                            <Card className={`hover:shadow-md transition-shadow border-l-4 ${
                                task.status === 'Completed' ? 'border-l-green-500' :
                                    task.status === 'Blocked' ? 'border-l-red-500' :
                                        task.status === 'InProgress' ? 'border-l-blue-500' :
                                            task.priority === 'Critical' ? 'border-l-purple-500' :
                                                'border-l-gray-300'
                            }`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h4 className="font-medium text-gray-900">
                                                    {task.title}
                                                </h4>
                                                {task.taskNumber && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                        #{task.taskNumber}
                                                    </span>
                                                )}
                                                {getStatusBadge(task.status)}
                                                <Badge className={priorityColors[task.priority] || 'bg-gray-100 text-gray-800'}>
                                                    {task.priority}
                                                </Badge>
                                            </div>

                                            {task.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                                                {task.assignedToUserName && (
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <User className="w-3 h-3" />
                                                        <span>{task.assignedToUserName}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{formatDate(task.startDate)}</span>
                                                </div>
                                                {task.endDate && (
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>→ {formatDate(task.endDate)}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{task.estimatedHours}h est.</span>
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-500">Progress</span>
                                                    <span className={`font-medium ${getProgressColor(task.progress)}`}>
                                                        {task.progress}%
                                                    </span>
                                                </div>
                                                <Progress value={task.progress} className="h-1.5" />
                                            </div>
                                        </div>

                                        <div className="flex gap-1 ml-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/plandev/initiatives/${id}/tasks/${task.id}/edit`);
                                                }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`Delete task "${task.title}"?`)) {
                                                        showToast.info('Delete functionality coming soon');
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="cursor-pointer"
                            onClick={() => navigate(`/plandev/initiatives/${id}/tasks/${task.id}`)}
                        >
                            <Card className={`h-full hover:shadow-md transition-shadow border-t-4 ${
                                task.status === 'Completed' ? 'border-t-green-500' :
                                    task.status === 'Blocked' ? 'border-t-red-500' :
                                        task.status === 'InProgress' ? 'border-t-blue-500' :
                                            task.priority === 'Critical' ? 'border-t-purple-500' :
                                                'border-t-gray-300'
                            }`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {task.taskNumber && (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                    #{task.taskNumber}
                                                </span>
                                            )}
                                            {getStatusBadge(task.status)}
                                        </div>
                                        <Badge className={priorityColors[task.priority] || 'bg-gray-100 text-gray-800'}>
                                            {task.priority}
                                        </Badge>
                                    </div>

                                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                                        {task.title}
                                    </h4>

                                    {task.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="space-y-1 text-sm">
                                        {task.assignedToUserName && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Assigned To</span>
                                                <span className="font-medium">{task.assignedToUserName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Estimated Hours</span>
                                            <span className="font-medium">{task.estimatedHours}h</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Progress</span>
                                            <span className={`font-medium ${getProgressColor(task.progress)}`}>
                                                {task.progress}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <Progress value={task.progress} className="h-1.5" />
                                    </div>

                                    <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
                                        <span className="text-xs text-gray-400">
                                            {formatDate(task.startDate)} → {formatDate(task.endDate)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default TasksPage;