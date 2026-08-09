// src/pages/hr/recruitmentpage/onboarding/OnboardingTaskDetail.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ClipboardList,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    ListChecks,
    AlertCircle,
    Save,
    UserCheck,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Loader2,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import {
    useOnboardingTask,
    useDeleteOnboardingTask,
    useUpdateOnboardingTask,
    useUpdateOnboardingTaskStatus
} from '../../../../services/hr/recruitment/onboardingTask/onboardingTask.queries';
import { useAuthStore } from '../../../../stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OnboardingTaskDetail: React.FC = () => {
    const { taskId = '' } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [form, setForm] = useState({
        taskName: '',
        description: '',
        sequenceOrder: 1,
        assignedTo: '',
        scheduledDate: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ✅ Fetch real data from API
    const { data: task, isLoading, refetch } = useOnboardingTask(taskId);

    // ✅ Mutations
    const deleteMutation = useDeleteOnboardingTask({
        onSuccess: () => {
            toast.success('Task deleted successfully');
            navigate('/hr/recruitment/onboarding/tasks');
        },
        onError: (error) => toast.error(error.message || 'Failed to delete task'),
    });

    const updateMutation = useUpdateOnboardingTask({
        onSuccess: () => {
            toast.success('Task updated successfully');
            setIsEditing(false);
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to update task'),
    });

    const statusMutation = useUpdateOnboardingTaskStatus({
        onSuccess: (data) => {
            toast.success(`Task status updated to ${data.status}`);
            setIsUpdatingStatus(false);
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to update status'),
    });

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';
    const canEdit = isHR && task?.status !== 'Verified' && task?.status !== 'Completed';

    // ✅ Populate form when task data loads
    useEffect(() => {
        if (task) {
            setForm({
                taskName: task.taskName || '',
                description: task.description || '',
                sequenceOrder: task.sequenceOrder || 1,
                assignedTo: task.assignedTo || '',
                scheduledDate: task.scheduledDate?.split('T')[0] || '',
            });
        }
    }, [task]);

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
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.taskName.trim()) {
            newErrors.taskName = 'Task name is required';
        }
        if (!form.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!form.sequenceOrder || form.sequenceOrder < 1) {
            newErrors.sequenceOrder = 'Sequence order must be at least 1';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = () => {
        if (!validate() || !task) return;
        updateMutation.mutate({
            id: taskId,
            taskName: form.taskName,
            description: form.description,
            sequenceOrder: form.sequenceOrder,
            rowVersion: task.rowVersion || '',
        });
    };

    const handleStatusChange = (newStatus: string) => {
        if (!task) return;
        setIsUpdatingStatus(true);
        statusMutation.mutate({
            id: taskId,
            status: newStatus,
        });
    };

    const handleDelete = () => {
        deleteMutation.mutate(taskId);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent" />
                <span className="ml-3 text-gray-600">Loading task details...</span>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Task not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/hr/recruitment/onboarding/tasks')}
                >
                    Back to Tasks
                </Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate('/hr/recruitment/onboarding/tasks')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{task.taskName}</h1>
                    <p className="text-sm text-gray-500 mt-1">Task #{task.sequenceOrder}</p>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(task.status)}
                    {task.isMandatory && (
                        <Badge className="bg-red-100 text-red-700">Required</Badge>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                {canEdit && (
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-blue-600"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? 'Cancel Edit' : 'Edit'}
                    </Button>
                )}
                {task.status === 'Pending' && (
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleStatusChange('InProgress')}
                        disabled={isUpdatingStatus}
                    >
                        {isUpdatingStatus ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Clock className="w-4 h-4 mr-2" />
                        )}
                        Start Task
                    </Button>
                )}
                {task.status === 'InProgress' && (
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleStatusChange('Completed')}
                        disabled={isUpdatingStatus}
                    >
                        {isUpdatingStatus ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Mark Complete
                    </Button>
                )}
                {task.status === 'Completed' && isHR && (
                    <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleStatusChange('Verified')}
                        disabled={isUpdatingStatus}
                    >
                        {isUpdatingStatus ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Verify Task
                    </Button>
                )}
                {isHR && (
                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteModal(true)}
                        className="text-red-600"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                )}
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="md:col-span-2">
                    <CardContent className="p-6">
                        {isEditing ? (
                            // Edit Form
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Task Name</Label>
                                    <Input
                                        value={form.taskName}
                                        onChange={(e) => setForm(f => ({ ...f, taskName: e.target.value }))}
                                        className={errors.taskName ? 'border-red-500' : ''}
                                        disabled={updateMutation.isPending}
                                    />
                                    {errors.taskName && <p className="text-xs text-red-500">{errors.taskName}</p>}
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Description</Label>
                                    <Textarea
                                        value={form.description}
                                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                        rows={4}
                                        className={errors.description ? 'border-red-500' : ''}
                                        disabled={updateMutation.isPending}
                                    />
                                    {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Sequence Order</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={form.sequenceOrder}
                                        onChange={(e) => setForm(f => ({ ...f, sequenceOrder: parseInt(e.target.value) || 1 }))}
                                        className={errors.sequenceOrder ? 'border-red-500' : ''}
                                        disabled={updateMutation.isPending}
                                    />
                                    {errors.sequenceOrder && <p className="text-xs text-red-500">{errors.sequenceOrder}</p>}
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Assigned To</Label>
                                    <Input
                                        value={form.assignedTo}
                                        onChange={(e) => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                                        placeholder="Department or person"
                                        disabled={updateMutation.isPending}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Scheduled Date</Label>
                                    <Input
                                        type="date"
                                        value={form.scheduledDate}
                                        onChange={(e) => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                                        disabled={updateMutation.isPending}
                                    />
                                </div>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={handleUpdate}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        ) : (
                            // View Mode
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500">Description</p>
                                    <p className="text-sm text-gray-700 mt-1">{task.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Sequence Order</p>
                                        <p className="text-sm font-medium text-gray-900">{task.sequenceOrder}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Assigned To</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {task.assignedTo || 'Not Assigned'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Created Date</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatDate(task.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Scheduled Date</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatDate(task.scheduledDate)}
                                        </p>
                                    </div>
                                    {task.completedDate && (
                                        <div>
                                            <p className="text-xs text-gray-500">Completed Date</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatDate(task.completedDate)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <div className="mt-1">{getStatusBadge(task.status)}</div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Assigned Employee</p>
                            <div className="mt-1">
                                <p className="font-medium text-gray-900">{task.employeeName || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{task.employeePosition || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{task.employeeDepartment || 'N/A'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Contact</p>
                            <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5" />
                                    {task.employeeEmail || 'N/A'}
                                </p>
                                {task.employeePhone && (
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" />
                                        {task.employeePhone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {task.isMandatory && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">Required Task</span>
                                </div>
                                <p className="text-xs text-red-600 mt-1">
                                    This task must be completed before onboarding is finalized.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{task.taskName}</strong>?
                        This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default OnboardingTaskDetail;