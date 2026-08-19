// src/pages/hr/recruitmentpage/onboarding/OnboardingAssignmentPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    UserCheck,
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
    Briefcase,
    Filter,
    Download,
    Mail,
    Phone,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import {
    useOnboardingAssignments,
    useDeleteOnboardingAssignment
} from '@/modules/hr/services/recruitment/onboardingAssignment/onboardingAssignment.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface OnboardingAssignment {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    employeePhone?: string;
    position: string;
    department: string;
    taskName: string;
    taskDescription: string;
    taskId: string;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Verified' | 'Overdue';
    scheduledDate: string;
    completedDate: string | null;
    assignedBy: string;
    assignedDate: string;
    priority: 'High' | 'Medium' | 'Low';
}

const OnboardingAssignmentPage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

    // ✅ Fetch real data from API
    const { data: assignments = [], isLoading, refetch } = useOnboardingAssignments();
    const deleteMutation = useDeleteOnboardingAssignment({
        onSuccess: () => {
            toast.success('Assignment deleted successfully');
            setShowDeleteModal(false);
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to delete assignment'),
    });

    const isHR = ['admin','super_admin','superadmin','hr','hr manager','hrmanager','hr admin','ceo','manager','mgr'].includes((role || '').toLowerCase());

    // ✅ Filter assignments based on tab and search
    const filteredAssignments = assignments?.filter(assignment => {
        const matchesTab = activeTab === 'all' || assignment.status?.toLowerCase() === activeTab;
        const matchesSearch = assignment.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.taskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.department?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // ✅ Calculate stats from real data
    const stats = {
        total: assignments.length,
        pending: assignments.filter(a => a.status === 'Pending').length,
        inProgress: assignments.filter(a => a.status === 'InProgress').length,
        completed: assignments.filter(a => a.status === 'Completed' || a.status === 'Verified').length,
        overdue: assignments.filter(a => a.status === 'Overdue').length,
    };

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

    const handleDelete = () => {
        if (selectedAssignment) {
            deleteMutation.mutate(selectedAssignment);
        }
    };

    const handleViewAssignment = (assignmentId: string) => {
        navigate(`/hr/recruitment/onboarding/assignment/${assignmentId}`);
    };

    const handleEditAssignment = (assignmentId: string) => {
        navigate(`/hr/recruitment/onboarding/assignment/edit/${assignmentId}`);
    };

    const handleAssignTask = () => {
        navigate('/hr/recruitment/onboarding/assignments/new');
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Onboarding Assignments</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage employee onboarding assignments</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    {isHR && (
                        <Button onClick={handleAssignTask} className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Assign Task
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Assignments</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-yellow-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">In Progress</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                                <TabsTrigger value="inprogress">In Progress ({stats.inProgress})</TabsTrigger>
                                <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
                                <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search assignments..."
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
                {filteredAssignments && filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment, index) => (
                        <motion.div
                            key={assignment.id}
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
                                                    <UserCheck className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {assignment.employeeName}
                                                        </h3>
                                                        {getStatusBadge(assignment.status)}
                                                        {assignment.priority && getPriorityBadge(assignment.priority)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <Briefcase className="w-3.5 h-3.5 inline mr-1" />
                                                        {assignment.position} - {assignment.department}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Task: {assignment.taskName}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Scheduled: {formatDate(assignment.scheduledDate)}
                                                        </span>
                                                        {assignment.completedDate && (
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                                Completed: {formatDate(assignment.completedDate)}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            {assignment.employeeEmail}
                                                        </span>
                                                        {assignment.employeePhone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="w-3.5 h-3.5" />
                                                                {assignment.employeePhone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewAssignment(assignment.id)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                View
                                            </Button>
                                            {isHR && assignment.status !== 'Verified' && assignment.status !== 'Completed' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditAssignment(assignment.id)}
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
                                                        setSelectedAssignment(assignment.id);
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
                            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No assignments found</p>
                            <p className="text-sm text-gray-400">Assign onboarding tasks to employees</p>
                            {isHR && (
                                <Button
                                    onClick={handleAssignTask}
                                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Assignment
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
                        <DialogTitle>Delete Assignment</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">Are you sure you want to delete this assignment? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteMutation.isPending}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default OnboardingAssignmentPage;