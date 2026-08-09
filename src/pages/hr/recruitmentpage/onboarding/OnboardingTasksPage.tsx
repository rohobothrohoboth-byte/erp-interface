// src/pages/hr/recruitmentpage/onboarding/OnboardingTasksPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    Plus,
    Search,
    RefreshCw,
    Loader2,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    ListChecks,
    Filter,
    Download,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { useOnboardingTasks, useDeleteOnboardingTask } from '../../../../services/hr/recruitment/onboardingTask/onboardingTask.queries';
import { useAuthStore } from '../../../../stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface OnboardingTask {
    id: string;
    taskName: string;
    description: string;
    sequenceOrder: number;
    status: string;
    scheduledDate?: string;
    assignedTo?: string;
    isMandatory?: boolean;
    createdAt: string;
}

const OnboardingTasksPage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data: tasks = [], isLoading, refetch } = useOnboardingTasks();
    const deleteMutation = useDeleteOnboardingTask({
        onSuccess: () => {
            toast.success('Task deleted successfully');
            setShowDeleteModal(false);
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to delete task'),
    });

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';

    const filteredTasks = tasks?.filter(task => {
        const matchesTab = activeTab === 'all' || task.status?.toLowerCase() === activeTab;
        const matchesSearch = task.taskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'Pending': {
                label: 'Pending',
                className: 'bg-yellow-100 text-yellow-700',
                icon: <Clock className="w-3.5 h-3.5" />,
            },
            'InProgress': {
                label: 'In Progress',
                className: 'bg-blue-100 text-blue-700',
                icon: <Loader2 className="w-3.5 h-3.5" />,
            },
            'Completed': {
                label: 'Completed',
                className: 'bg-green-100 text-green-700',
                icon: <CheckCircle className="w-3.5 h-3.5" />,
            },
            'Verified': {
                label: 'Verified',
                className: 'bg-purple-100 text-purple-700',
                icon: <CheckCircle className="w-3.5 h-3.5" />,
            },
            'Overdue': {
                label: 'Overdue',
                className: 'bg-red-100 text-red-700',
                icon: <XCircle className="w-3.5 h-3.5" />,
            },
        };
        const info = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700', icon: null };
        return (
            <Badge className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${info.className}`}>
                {info.icon}
                {info.label}
            </Badge>
        );
    };

    const formatDate = (date: string) => {
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header with Back button */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate('/hr/recruitment/onboarding')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Onboarding Tasks</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage employee onboarding tasks</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    {isHR && (
                        <Button
                            onClick={() => navigate('/settings/hr/onboarding-tasks')}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Task
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {tasks.filter(t => t.status === 'Pending').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">In Progress</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {tasks.filter(t => t.status === 'InProgress').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-bold text-green-600">
                            {tasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="inprogress">In Progress</TabsTrigger>
                                <TabsTrigger value="completed">Completed</TabsTrigger>
                                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <div className="space-y-4">
                {filteredTasks && filteredTasks.length > 0 ? (
                    filteredTasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-purple-50 rounded-lg">
                                                    <ClipboardList className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-gray-900">{task.taskName}</h3>
                                                        {getStatusBadge(task.status)}
                                                        <span className="text-xs text-gray-400">#{task.sequenceOrder}</span>
                                                        {task.isMandatory && (
                                                            <Badge className="bg-red-100 text-red-700 text-[10px]">
                                                                Required
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                                        {task.scheduledDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                Scheduled: {formatDate(task.scheduledDate)}
                                                            </span>
                                                        )}
                                                        {task.assignedTo && (
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-3.5 h-3.5" />
                                                                {task.assignedTo}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <ListChecks className="w-3.5 h-3.5" />
                                                            Order: {task.sequenceOrder}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/hr/recruitment/onboarding/task/${task.id}`)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                View
                                            </Button>
                                            {isHR && task.status !== 'Verified' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/settings/hr/onboarding-tasks/edit/${task.id}`)}
                                                    className="text-blue-600"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                            {isHR && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedTask(task.id);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No onboarding tasks found</p>
                            <p className="text-sm text-gray-400">Create a task to get started</p>
                            {isHR && (
                                <Button
                                    onClick={() => navigate('/settings/hr/onboarding-tasks')}
                                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Task
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">Are you sure you want to delete this task? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteMutation.isPending}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => selectedTask && deleteMutation.mutate(selectedTask)} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default OnboardingTasksPage;