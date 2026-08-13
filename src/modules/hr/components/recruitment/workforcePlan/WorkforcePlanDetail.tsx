// src/pages/hr/recruitment/workforcePlan/WorkforcePlanDetail.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Building2, Calendar, Users, DollarSign,
    FileText, Edit, Trash2, CheckCircle, XCircle,
    Clock, Send, Printer, Download, BarChart,
    Plus, Briefcase
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { useWorkforcePlan, useDeleteWorkforcePlan, useSubmitWorkforcePlan, useApproveWorkforcePlan, useRejectWorkforcePlan } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.queries';
import { useJobRequisitions } from '@/modules/hr/services/recruitment/jobRequisition/jobRequisition.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const WorkforcePlanDetail: React.FC = () => {
    const { planId = '' } = useParams<{ planId: string }>();
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [reviewComment, setReviewComment] = useState('');
    const [rejectComment, setRejectComment] = useState('');

    const { data: plan, isLoading, refetch } = useWorkforcePlan(planId);
    const { data: requisitions = [] } = useJobRequisitions(planId);
    const deleteMutation = useDeleteWorkforcePlan({
        onSuccess: () => {
            toast.success('Workforce plan deleted successfully');
            navigate('/hr/recruitment/workforce-plans');
        },
        onError: (error) => toast.error(error.message)
    });
    const submitMutation = useSubmitWorkforcePlan({
        onSuccess: () => {
            toast.success('Plan submitted for review');
            setShowReviewModal(false);
            refetch();
        },
        onError: (error) => toast.error(error.message)
    });
    const approveMutation = useApproveWorkforcePlan({
        onSuccess: () => {
            toast.success('Plan approved successfully');
            setShowReviewModal(false);
            refetch();
        },
        onError: (error) => toast.error(error.message)
    });
    const rejectMutation = useRejectWorkforcePlan({
        onSuccess: () => {
            toast.success('Plan rejected');
            setShowRejectModal(false);
            refetch();
        },
        onError: (error) => toast.error(error.message)
    });

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';
    const canEdit = plan?.statusStr === 'Draft' && isHR;
    const canSubmit = plan?.statusStr === 'Draft' && isHR;
    const canApprove = !!plan?.statusStr?.startsWith('Pending') && isHR;
    const canReject = !!plan?.statusStr?.startsWith('Pending') && isHR;

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            'Draft': { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
            'Pending': { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-700' },
            'Approved': { label: 'Approved', className: 'bg-green-100 text-green-700' },
            'Active': { label: 'Active', className: 'bg-blue-100 text-blue-700' },
            'Completed': { label: 'Completed', className: 'bg-purple-100 text-purple-700' },
            'Cancelled': { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
            'Rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        };
        const info = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
        return <Badge className={info.className}>{info.label}</Badge>;
    };

    const formatDate = (date: string) => {
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    // ✅ Safe currency formatter with fallback
    const formatCurrency = (amount: number | undefined | null, currency: string = 'USD') => {
        if (amount === undefined || amount === null) return 'N/A';
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount);
        } catch {
            return `${currency} ${amount}`;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Workforce plan not found</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hr/recruitment/workforce-plans')}
                        className="flex items-center gap-2 mt-0.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900">{plan.planCode}</h1>
                            {getStatusBadge(plan.statusStr)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{plan.title}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                {plan.department}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {plan.totalPositions} positions
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {canSubmit && (
                        <Button
                            onClick={() => setShowReviewModal(true)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Submit for Review
                        </Button>
                    )}
                    {canApprove && (
                        <Button
                            onClick={() => {
                                setReviewComment('');
                                approveMutation.mutate({ id: planId, comment: reviewComment });
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                        </Button>
                    )}
                    {canReject && (
                        <Button
                            onClick={() => setShowRejectModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                        </Button>
                    )}
                    {canEdit && (
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/hr/recruitment/workforce-plan/edit/${planId}`)}
                            className="text-blue-600"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    )}
                    {(plan.statusStr === 'Draft' || plan.statusStr === 'Cancelled' || plan.statusStr === 'Rejected') && (
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Positions</p>
                        <p className="text-2xl font-bold text-gray-900">{plan.totalPositions}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(plan.budget, plan.budgetCurrency)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Requisitions</p>
                        <p className="text-2xl font-bold text-gray-900">{requisitions.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="mt-1">{getStatusBadge(plan.statusStr)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Card>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="p-4 border-b w-full justify-start">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                                    <p className="text-sm text-gray-600">{plan.desc || 'No description provided'}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Plan Details</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Plan Code</dt>
                                                <dd className="font-medium text-gray-900">{plan.planCode}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Department</dt>
                                                <dd className="font-medium text-gray-900">{plan.department}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Year</dt>
                                                <dd className="font-medium text-gray-900">{plan.year}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Period</dt>
                                                <dd className="font-medium text-gray-900">
                                                    {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Financials</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Total Budget</dt>
                                                <dd className="font-medium text-gray-900">
                                                    {formatCurrency(plan.budget, plan.budgetCurrency)}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Total Positions</dt>
                                                <dd className="font-medium text-gray-900">{plan.totalPositions}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                {plan.reviewComment && plan.statusStr === 'Rejected' && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm font-medium text-red-700">Rejection Reason</p>
                                        <p className="text-sm text-red-600 mt-1">{plan.reviewComment}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Requisitions Tab */}
                        {activeTab === 'requisitions' && (
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-medium text-gray-700">Job Requisitions</h3>
                                    {['Approved', 'Approve', 'Active'].includes(plan.statusStr as string) && (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate(`/hr/recruitment/requisition/new?planId=${planId}`)}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Requisition
                                        </Button>
                                    )}
                                </div>

                                {requisitions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No requisitions created yet</p>
                                        {(plan.statusStr === 'Approved' || plan.statusStr === 'Active') && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => navigate(`/hr/recruitment/requisition/new?planId=${planId}`)}
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Create First Requisition
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {requisitions.map((req: any) => (
                                            <div
                                                key={req.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                                onClick={() => navigate(`/hr/recruitment/requisition/${req.id}`)}
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">{req.position}</p>
                                                    <p className="text-sm text-gray-500">{req.department}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                        <span>Openings: {req.numOpen}</span>
                                                        <span>Status: {req.statusStr}</span>
                                                    </div>
                                                </div>
                                                <Badge className={req.statusStr === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                    {req.statusStr}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Timeline Tab */}
                        {activeTab === 'timeline' && (
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Plan Created</p>
                                            <p className="text-xs text-gray-500">{formatDate(plan.createdDate)}</p>
                                        </div>
                                    </div>

                                    {plan.statusStr?.startsWith('Pending') && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                                <Clock className="w-4 h-4 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Submitted for Review</p>
                                                <p className="text-xs text-gray-500">Pending approval</p>
                                            </div>
                                        </div>
                                    )}

                                    {(plan.statusStr === 'Approved' || plan.statusStr === 'Active' || plan.statusStr === 'Completed') && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Approved</p>
                                                <p className="text-xs text-gray-500">Plan approved for execution</p>
                                            </div>
                                        </div>
                                    )}

                                    {plan.statusStr === 'Rejected' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Rejected</p>
                                                <p className="text-xs text-gray-500">{plan.reviewComment || 'No reason provided'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Workforce Plan</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{plan.planCode}</strong>?
                        This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(planId)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Submit for Review Modal */}
            <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit for Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Submit <strong>{plan.planCode}</strong> for review and approval.
                        </p>
                        <div className="space-y-2">
                            <Label>Comment (Optional)</Label>
                            <Textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Add any additional notes..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            onClick={() => submitMutation.mutate(planId)}
                            disabled={submitMutation.isPending}
                        >
                            {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Workforce Plan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Provide a reason for rejecting <strong>{plan.planCode}</strong>.
                        </p>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Reason <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                value={rejectComment}
                                onChange={(e) => setRejectComment(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                rows={4}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (rejectComment.trim()) {
                                    rejectMutation.mutate({ id: planId, comment: rejectComment });
                                } else {
                                    toast.error('Please provide a reason for rejection');
                                }
                            }}
                            disabled={rejectMutation.isPending || !rejectComment.trim()}
                        >
                            {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default WorkforcePlanDetail;