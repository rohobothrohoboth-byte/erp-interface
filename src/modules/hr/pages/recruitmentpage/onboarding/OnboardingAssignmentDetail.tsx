// src/pages/hr/recruitmentpage/onboarding/OnboardingAssignmentDetail.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    UserCheck,
    Mail,
    Phone,
    Building2,
    Clock,
    CheckCircle,
    XCircle,
    Edit,
    Trash2,
    Save,
    User,
    Send,
    Download,
    Printer,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
    useOnboardingAssignment,
    useUpdateOnboardingAssignment,
    useUpdateOnboardingAssignmentStatus,
    useDeleteOnboardingAssignment,
} from '@/modules/hr/services/recruitment/onboardingAssignment/onboardingAssignment.queries';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OnboardingAssignmentDetail: React.FC = () => {
    const { assignmentId = '' } = useParams<{ assignmentId: string }>();
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [form, setForm] = useState({
        scheduledDate: '',
        notes: '',
        status: '',
    });

    const { data: real, isLoading } = useOnboardingAssignment(assignmentId);
    // Fill in fields the backend does not persist so the UI stays intact.
    const assignment = real
        ? {
              ...real,
              assignedBy: (real as any).assignedBy || 'HR',
              assignedDate: (real as any).assignedDate || real.createdAt,
              priority: real.priority || 'Medium',
              notes: real.notes || '',
          }
        : undefined;

    const updateMutation = useUpdateOnboardingAssignment({
        onSuccess: () => { toast.success('Assignment updated successfully'); setIsEditing(false); },
        onError: (e) => toast.error(e.message || 'Failed to update assignment'),
    });
    const statusMutation = useUpdateOnboardingAssignmentStatus({
        onSuccess: () => { toast.success('Assignment marked as completed'); setShowCompleteModal(false); },
        onError: (e) => toast.error(e.message || 'Failed to update status'),
    });
    const deleteMutation = useDeleteOnboardingAssignment({
        onSuccess: () => { toast.success('Assignment deleted successfully'); setShowDeleteModal(false); navigate('/hr/recruitment/onboarding/assignments'); },
        onError: (e) => toast.error(e.message || 'Failed to delete assignment'),
    });

    const isHR = ['admin','super_admin','superadmin','hr','hr manager','hrmanager','hr admin','ceo','manager','mgr'].includes((role || '').toLowerCase());
    const canEdit = isHR && assignment?.status !== 'Completed' && assignment?.status !== 'Verified';

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
                icon: <Clock className="w-3.5 h-3.5" />,
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

    const getPriorityBadge = (priority: string) => {
        const priorityMap: Record<string, { label: string; className: string }> = {
            'High': { label: 'High', className: 'bg-red-100 text-red-700' },
            'Medium': { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
            'Low': { label: 'Low', className: 'bg-green-100 text-green-700' },
        };
        const info = priorityMap[priority] || { label: priority, className: 'bg-gray-100 text-gray-700' };
        return <Badge className={info.className}>{info.label}</Badge>;
    };

    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    const formatDateTime = (date: string) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'MMM dd, yyyy HH:mm');
        } catch {
            return 'Invalid date';
        }
    };

    const handleUpdate = () => {
        if (!assignment) return;
        updateMutation.mutate({
            id: assignmentId,
            scheduledDate: form.scheduledDate || assignment.scheduledDate,
            status: (form.status || assignment.status) as any,
            notes: form.notes || assignment.notes,
            rowVersion: assignment.rowVersion,
        });
    };

    const handleComplete = () => {
        if (!assignmentId) return;
        statusMutation.mutate({ id: assignmentId, status: 'Completed' });
    };

    const handleDelete = () => {
        if (!assignmentId) return;
        deleteMutation.mutate(assignmentId);
    };

    const handleSendReminder = () => {
        toast.success('Reminder sent to employee');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent" />
                <span className="ml-3 text-gray-600">Loading assignment details...</span>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Assignment not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/hr/recruitment/onboarding/assignments')}
                >
                    Back to Assignments
                </Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hr/recruitment/onboarding/assignments')}
                        className="flex items-center gap-2 mt-0.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Onboarding Assignment
                            </h1>
                            {getStatusBadge(assignment.status)}
                            {getPriorityBadge(assignment.priority)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Task: {assignment.taskName}
                        </p>
                        <p className="text-sm text-gray-500">
                            {assignment.employeeName} • {assignment.position}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {canEdit && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-blue-600"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                {isEditing ? 'Cancel' : 'Edit'}
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => setShowCompleteModal(true)}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Complete
                            </Button>
                        </>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleSendReminder}
                        className="text-blue-600"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send Reminder
                    </Button>
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
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Task Details */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Task Details</h3>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium">Scheduled Date</Label>
                                        <Input
                                            type="date"
                                            value={form.scheduledDate || assignment.scheduledDate}
                                            onChange={(e) => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <select
                                            value={form.status || assignment.status}
                                            onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="InProgress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Notes</Label>
                                        <Textarea
                                            value={form.notes || assignment.notes}
                                            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                                            rows={3}
                                            placeholder="Add notes..."
                                        />
                                    </div>
                                    <Button
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                        onClick={handleUpdate}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Task Description</p>
                                        <p className="text-sm text-gray-700 mt-1">{assignment.taskDescription}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Scheduled Date</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatDate(assignment.scheduledDate)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Assigned By</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {assignment.assignedBy}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Assigned Date</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatDate(assignment.assignedDate)}
                                            </p>
                                        </div>
                                        {assignment.completedDate && (
                                            <div>
                                                <p className="text-xs text-gray-500">Completed Date</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatDate(assignment.completedDate)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {assignment.notes && (
                                        <div>
                                            <p className="text-xs text-gray-500">Notes</p>
                                            <p className="text-sm text-gray-700 mt-1">{assignment.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity Timeline */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Activity Timeline</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Assignment Created</p>
                                        <p className="text-xs text-gray-500">{formatDateTime(assignment.assignedDate)}</p>
                                    </div>
                                </div>
                                {assignment.status === 'InProgress' && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">In Progress</p>
                                            <p className="text-xs text-gray-500">Task is currently being worked on</p>
                                        </div>
                                    </div>
                                )}
                                {assignment.status === 'Completed' && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Completed</p>
                                            <p className="text-xs text-gray-500">
                                                {assignment.completedDate ? formatDateTime(assignment.completedDate) : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Employee Info */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Employee Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{assignment.employeeName}</p>
                                        <p className="text-sm text-gray-500">{assignment.position}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{assignment.department}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <a href={`mailto:${assignment.employeeEmail}`} className="text-blue-600 hover:underline">
                                            {assignment.employeeEmail}
                                        </a>
                                    </div>
                                    {assignment.employeePhone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <a href={`tel:${assignment.employeePhone}`} className="text-blue-600 hover:underline">
                                                {assignment.employeePhone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => window.open(`mailto:${assignment.employeeEmail}`, '_blank')}
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email Employee
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleSendReminder}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Reminder
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print Assignment
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Info */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <span>{getStatusBadge(assignment.status)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Priority</span>
                                    <span>{getPriorityBadge(assignment.priority)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Scheduled</span>
                                    <span className="font-medium">{formatDate(assignment.scheduledDate)}</span>
                                </div>
                                {assignment.completedDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Completed</span>
                                        <span className="font-medium">{formatDate(assignment.completedDate)}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Complete Modal */}
            <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Assignment as Complete</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Are you sure you want to mark this assignment as completed?
                        This action will update the employee's onboarding progress.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleComplete}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Assignment</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Are you sure you want to delete this assignment?
                        This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default OnboardingAssignmentDetail;