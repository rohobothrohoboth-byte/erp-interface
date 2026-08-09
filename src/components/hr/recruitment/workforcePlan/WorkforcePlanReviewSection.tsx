// src/components/hr/recruitment/workforcePlan/WorkforcePlanReviewSection.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Users,
    DollarSign,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Send,
    AlertCircle,
    User,
    Briefcase,
    Award,
    TrendingUp,
    Download,
    Printer,
    Eye,
} from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Input } from '../../../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../../ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../../ui/dialog';
import { showToast } from '../../../../layout/layout';
import {
    useWorkforcePlan,
    useApproveWorkforcePlan,
    useRejectWorkforcePlan,
    useSubmitWorkforcePlan,
} from '../../../../services/hr/recruitment/workforcePlan/workforcePlan.queries';
import { useJobRequisitions } from '../../../../services/hr/recruitment/jobRequisition/jobRequisition.queries';
import { useAuthStore } from '../../../../stores/auth.store';
import { format } from 'date-fns';

interface WorkforcePlanReviewSectionProps {
    planId?: string;
}

const WorkforcePlanReviewSection: React.FC<WorkforcePlanReviewSectionProps> = ({ planId: propPlanId }) => {
    const { planId: paramPlanId } = useParams<{ planId: string }>();
    const navigate = useNavigate();
    const { role } = useAuthStore();

    const id = propPlanId || paramPlanId || '';

    const [activeTab, setActiveTab] = useState('overview');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [approveComment, setApproveComment] = useState('');
    const [rejectComment, setRejectComment] = useState('');

    // Fetch data
    const { data: plan, isLoading, refetch } = useWorkforcePlan(id);
    const { data: requisitions = [] } = useJobRequisitions(id);

    // Mutations
    const approveMutation = useApproveWorkforcePlan({
        onSuccess: () => {
            showToast.success('Workforce plan approved successfully');
            setShowApproveModal(false);
            refetch();
        },
        onError: (error) => {
            showToast.error(error.message || 'Failed to approve plan');
        },
    });

    const rejectMutation = useRejectWorkforcePlan({
        onSuccess: () => {
            showToast.success('Workforce plan rejected');
            setShowRejectModal(false);
            refetch();
        },
        onError: (error) => {
            showToast.error(error.message || 'Failed to reject plan');
        },
    });

    const submitMutation = useSubmitWorkforcePlan({
        onSuccess: () => {
            showToast.success('Plan submitted for review successfully');
            refetch();
        },
        onError: (error) => {
            showToast.error(error.message || 'Failed to submit plan');
        },
    });

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';
    const canApprove = plan?.statusStr === 'Pending' && isHR;
    const canReject = plan?.statusStr === 'Pending' && isHR;
    const canSubmit = plan?.statusStr === 'Draft' && isHR;

    // Status badge configuration
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'Draft': {
                label: 'Draft',
                className: 'bg-gray-100 text-gray-700',
                icon: <Clock className="w-3.5 h-3.5" />,
            },
            'Pending': {
                label: 'Pending Review',
                className: 'bg-yellow-100 text-yellow-700',
                icon: <Clock className="w-3.5 h-3.5" />,
            },
            'Approved': {
                label: 'Approved',
                className: 'bg-green-100 text-green-700',
                icon: <CheckCircle className="w-3.5 h-3.5" />,
            },
            'Active': {
                label: 'Active',
                className: 'bg-blue-100 text-blue-700',
                icon: <TrendingUp className="w-3.5 h-3.5" />,
            },
            'Completed': {
                label: 'Completed',
                className: 'bg-purple-100 text-purple-700',
                icon: <Award className="w-3.5 h-3.5" />,
            },
            'Cancelled': {
                label: 'Cancelled',
                className: 'bg-red-100 text-red-700',
                icon: <XCircle className="w-3.5 h-3.5" />,
            },
            'Rejected': {
                label: 'Rejected',
                className: 'bg-red-100 text-red-700',
                icon: <XCircle className="w-3.5 h-3.5" />,
            },
        };
        const info = statusMap[status] || {
            label: status,
            className: 'bg-gray-100 text-gray-700',
            icon: <FileText className="w-3.5 h-3.5" />,
        };
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

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent" />
                <span className="ml-3 text-gray-600">Loading workforce plan...</span>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Workforce plan not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/hr/recruitment/workforce-plans')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Plans
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 p-6 max-w-7xl mx-auto"
        >
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
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
                            <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Requested by: {plan.requistionBy || 'N/A'}
              </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {canSubmit && (
                        <Button
                            onClick={() => submitMutation.mutate(id)}
                            disabled={submitMutation.isPending}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                            {submitMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit for Review
                                </>
                            )}
                        </Button>
                    )}
                    {canApprove && (
                        <Button
                            onClick={() => setShowApproveModal(true)}
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
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
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
                        <p className="text-sm text-gray-500">Approved Positions</p>
                        <p className="text-2xl font-bold text-emerald-600">{plan.appPositions || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(plan.budget || 0, plan.budgetCurrency || 'USD')}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Requisitions</p>
                        <p className="text-2xl font-bold text-gray-900">{requisitions.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Section */}
            <Card>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="p-4 border-b w-full justify-start">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
                            <TabsTrigger value="review">Review Details</TabsTrigger>
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
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Requested By</dt>
                                                <dd className="font-medium text-gray-900">{plan.requistionBy || 'N/A'}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Financials</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Total Budget</dt>
                                                <dd className="font-medium text-gray-900">
                                                    {formatCurrency(plan.budget || 0, plan.budgetCurrency || 'USD')}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Total Positions</dt>
                                                <dd className="font-medium text-gray-900">{plan.totalPositions}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Approved Positions</dt>
                                                <dd className="font-medium text-emerald-600">{plan.appPositions || 0}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Status</dt>
                                                <dd>{getStatusBadge(plan.statusStr)}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                {plan.reviewComment && plan.statusStr === 'Rejected' && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-red-700">Rejection Reason</p>
                                                <p className="text-sm text-red-600 mt-1">{plan.reviewComment}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {plan.reviewComment && plan.statusStr === 'Approved' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-green-700">Approval Note</p>
                                                <p className="text-sm text-green-600 mt-1">{plan.reviewComment}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Requisitions Tab */}
                        {activeTab === 'requisitions' && (
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-medium text-gray-700">
                                        Job Requisitions ({requisitions.length})
                                    </h3>
                                    {(plan.statusStr === 'Approved' || plan.statusStr === 'Active') && (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate(`/hr/recruitment/requisition/new?planId=${id}`)}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Briefcase className="w-4 h-4 mr-2" />
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
                                                onClick={() => navigate(`/hr/recruitment/requisition/new?planId=${id}`)}
                                            >
                                                <Briefcase className="w-4 h-4 mr-1" />
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
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-medium text-gray-900">{req.position}</p>
                                                        <Badge className={req.statusStr === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                            {req.statusStr}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                        <span>{req.department}</span>
                                                        <span>Openings: {req.numOpen}</span>
                                                        <span>Posted: {req.datePosted ? formatDate(req.datePosted) : 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/hr/recruitment/requisition/${req.id}`);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Review Details Tab */}
                        {activeTab === 'review' && (
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Review Information</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Current Status</dt>
                                                <dd>{getStatusBadge(plan.statusStr)}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Reviewed By</dt>
                                                <dd className="font-medium text-gray-900">{plan.reviewedBy || 'Not yet reviewed'}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Review Date</dt>
                                                <dd className="font-medium text-gray-900">
                                                    {plan.reviewedDate ? formatDate(plan.reviewedDate) : 'N/A'}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Requested By</dt>
                                                <dd className="font-medium text-gray-900">{plan.requistionBy || 'N/A'}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Review Comments</h4>
                                        {plan.reviewComment ? (
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan.reviewComment}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No review comments provided</p>
                                        )}
                                    </div>
                                </div>

                                {/* Review History Timeline */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Review Timeline</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Plan Created</p>
                                                <p className="text-xs text-gray-500">{formatDate(plan.createdDate)}</p>
                                            </div>
                                        </div>

                                        {plan.statusStr === 'Pending' && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                                    <Clock className="w-4 h-4 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Submitted for Review</p>
                                                    <p className="text-xs text-gray-500">Waiting for approval</p>
                                                    {canApprove && (
                                                        <p className="text-xs text-yellow-600 mt-1">
                                                            ⚡ Action required: Please review and approve
                                                        </p>
                                                    )}
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
                                                    <p className="text-xs text-gray-500">
                                                        {plan.reviewedBy ? `By: ${plan.reviewedBy}` : 'Approved'}
                                                    </p>
                                                    {plan.reviewedDate && (
                                                        <p className="text-xs text-gray-400">{formatDate(plan.reviewedDate)}</p>
                                                    )}
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
                                                    <p className="text-xs text-gray-500">
                                                        {plan.reviewedBy ? `By: ${plan.reviewedBy}` : 'Rejected'}
                                                    </p>
                                                    {plan.reviewedDate && (
                                                        <p className="text-xs text-gray-400">{formatDate(plan.reviewedDate)}</p>
                                                    )}
                                                    {plan.reviewComment && (
                                                        <p className="text-sm text-red-600 mt-1">{plan.reviewComment}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Approve Modal */}
            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Approve Workforce Plan
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            You are about to approve <strong>{plan.planCode}</strong> - {plan.title}.
                            This will allow the creation of job requisitions and postings.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="approveComment">Comment (Optional)</Label>
                            <Textarea
                                id="approveComment"
                                value={approveComment}
                                onChange={(e) => setApproveComment(e.target.value)}
                                placeholder="Add any additional notes..."
                                rows={3}
                                disabled={approveMutation.isPending}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowApproveModal(false)}
                            disabled={approveMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => approveMutation.mutate({ id, comment: approveComment })}
                            disabled={approveMutation.isPending}
                        >
                            {approveMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve Plan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            Reject Workforce Plan
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            You are about to reject <strong>{plan.planCode}</strong> - {plan.title}.
                            Please provide a reason for rejection.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="rejectComment">
                                Reason <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="rejectComment"
                                value={rejectComment}
                                onChange={(e) => setRejectComment(e.target.value)}
                                placeholder="Please provide a detailed reason for rejection..."
                                rows={4}
                                disabled={rejectMutation.isPending}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectModal(false)}
                            disabled={rejectMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => rejectMutation.mutate({ id, comment: rejectComment })}
                            disabled={rejectMutation.isPending || !rejectComment.trim()}
                        >
                            {rejectMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Rejecting...
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject Plan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default WorkforcePlanReviewSection;