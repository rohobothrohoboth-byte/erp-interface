// RST_ERP_UI/src/pages/hr/leave/MyLeaveRequestsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle, XCircle, Clock, Eye, Search, X, RefreshCw,
    ChevronLeft, ChevronRight, Loader2, AlertCircle,
    FileText, User, GitBranch, Calendar, TrendingUp, Users
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { leaveApi } from '@/modules/hr/services/leave/leave.api';
import { api } from '@/shared/services/api';
import toast from 'react-hot-toast';
import LeaveRequestDetailModal from '@/modules/hr/components/annualLeave/AllLeave/LeaveRequestDetailModal';
import ErrorBoundary from '@/shared/components/ui/ErrorBoundary';

interface MyLeaveRequest {
    id: string;
    employee: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    daysRequestedStr: string;
    statusStr: string;
    currentStepOrder?: number;
    totalSteps?: number;
    approvalChainId?: string;
    comments?: string;
}

const MyLeaveRequestsPage: React.FC = () => {
    const [leaveRequests, setLeaveRequests] = useState<MyLeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState<MyLeaveRequest | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [approvalSteps, setApprovalSteps] = useState<any[]>([]);
    const [workflowLoading, setWorkflowLoading] = useState(false);
    const [totalStepsCache, setTotalStepsCache] = useState<Record<string, number>>({});

    const itemsPerPage = 10;

    // Fetch total steps for a chain
    const fetchTotalStepsForChain = async (chainId: string): Promise<number> => {
        if (totalStepsCache[chainId]) {
            return totalStepsCache[chainId];
        }
        try {
            const response = await api.get(`/hrm/leave/v1/Policy/Chain/Step/All/${chainId}`);
            const steps = response.data?.data || [];
            const count = Array.isArray(steps) ? steps.length : 0;
            setTotalStepsCache(prev => ({ ...prev, [chainId]: count }));
            return count;
        } catch (error) {
            console.error('Error fetching steps count:', error);
            return 0;
        }
    };

    // Fetch my leave requests
    const fetchMyLeaveRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await leaveApi.getMyLeaveRequests();
            const requests = Array.isArray(data) ? data : [];

            const enrichedRequests = await Promise.all(requests.map(async (req) => {
                const statusDisplay = (req as any).statusStr || 'Pending';
                let currentAppStep = (req as any).currentStepOrder ?? (req as any).CurrentAppStep ?? 0;
                const approvalChainId = (req as any).approvalChainId;
                const employeeName = (req as any).employee || 'You';
                const leaveType = (req as any).leaveType || 'Leave Request';
                const daysRequestedStr = (req as any).daysRequestedStr || '0 days';

                let totalSteps = 0;

                if (approvalChainId && statusDisplay === 'Pending') {
                    totalSteps = await fetchTotalStepsForChain(approvalChainId);
                    if (currentAppStep === 0 && statusDisplay === 'Pending') {
                        currentAppStep = 1;
                    }
                }

                return {
                    id: req.id,
                    employee: employeeName,
                    leaveType: leaveType,
                    startDate: (req as any).startDate,
                    endDate: (req as any).endDate,
                    daysRequestedStr: daysRequestedStr,
                    statusStr: statusDisplay,
                    currentStepOrder: currentAppStep > 0 ? currentAppStep : undefined,
                    totalSteps: totalSteps,
                    approvalChainId: approvalChainId,
                    comments: (req as any).comments,
                };
            }));

            setLeaveRequests(enrichedRequests);
        } catch (error: any) {
            console.error('Error fetching leave requests:', error);
            toast.error(error?.message || 'Failed to load leave requests');
            setLeaveRequests([]);
        } finally {
            setLoading(false);
        }
    }, [totalStepsCache]);

    // Fetch approval workflow for a request
    const fetchApprovalWorkflow = async (request: MyLeaveRequest) => {
        let chainId = request.approvalChainId;

        if (!chainId && request.id) {
            try {
                const requestDetail = await leaveApi.getLeaveRequestById(request.id);
                chainId = (requestDetail as any).approvalChainId;
            } catch (error) {
                console.error('Error getting chain ID:', error);
                toast.error('Could not fetch approval chain information');
                return;
            }
        }

        if (!chainId) {
            toast.error('No approval chain associated with this request');
            return;
        }

        setWorkflowLoading(true);
        try {
            const response = await api.get(`/hrm/leave/v1/Policy/Chain/Step/All/${chainId}`);
            let steps = response.data?.data || [];
            if (!Array.isArray(steps) && steps && typeof steps === 'object') {
                steps = Object.values(steps);
            }
            setApprovalSteps(steps);
            setShowWorkflowModal(true);
        } catch (error: any) {
            console.error('Error fetching workflow:', error);
            toast.error(error?.message || 'Failed to load approval workflow');
        } finally {
            setWorkflowLoading(false);
        }
    };

    useEffect(() => {
        fetchMyLeaveRequests();
    }, [fetchMyLeaveRequests]);

    const filteredRequests = leaveRequests.filter(request => {
        let matchesTab = false;
        if (activeTab === 'all') matchesTab = true;
        else if (activeTab === 'pending') matchesTab = request.statusStr === 'Pending';
        else if (activeTab === 'approved') matchesTab = request.statusStr === 'Approved';
        else if (activeTab === 'rejected') matchesTab = request.statusStr === 'Rejected';

        const matchesSearch = !searchTerm ||
            (request.leaveType?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = {
        total: leaveRequests.length,
        pending: leaveRequests.filter(r => r.statusStr === 'Pending').length,
        approved: leaveRequests.filter(r => r.statusStr === 'Approved').length,
        rejected: leaveRequests.filter(r => r.statusStr === 'Rejected').length,
    };

    const formatDate = (date: string | Date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    // Step Progress Indicator for My Requests
    const StepProgressIndicator = ({ currentStep, totalSteps, status }: { currentStep?: number; totalSteps?: number; status?: string }) => {
        if (status === 'Approved') {
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Approved</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                    </div>
                </div>
            );
        }

        if (status === 'Rejected') {
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 font-medium">Rejected</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                    </div>
                </div>
            );
        }

        if (currentStep && currentStep > 0 && totalSteps && totalSteps > 0) {
            const progress = (currentStep / totalSteps) * 100;
            const isLastStep = currentStep === totalSteps;

            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className={`${isLastStep ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'} px-2 py-1 rounded-full text-xs font-medium`}>
                            Step {currentStep} of {totalSteps}
                        </div>
                        {isLastStep ? (
                            <span className="text-xs text-amber-500">Final review</span>
                        ) : (
                            <span className="text-xs text-gray-500">In progress</span>
                        )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className={`${isLastStep ? 'bg-amber-500' : 'bg-purple-600'} h-1.5 rounded-full transition-all duration-300`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400">
                        {isLastStep ? 'Your request is in the final approval stage' : `Waiting for step ${currentStep} approval`}
                    </p>
                </div>
            );
        }

        if (status === 'Pending') {
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600 font-medium">Pending</span>
                    </div>
                    <p className="text-xs text-gray-400">Awaiting initial review</p>
                </div>
            );
        }

        return null;
    };

    // Workflow Modal for My Requests
    const WorkflowModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <GitBranch className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Approval Workflow</h2>
                            <p className="text-xs text-gray-500">Your request approval process</p>
                        </div>
                    </div>
                    <button onClick={() => setShowWorkflowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {workflowLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
                            <p className="text-gray-500">Loading workflow...</p>
                        </div>
                    ) : !approvalSteps || approvalSteps.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No approval steps configured</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Progress Header */}
                            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Your Request Progress:</span>
                                    <span className="text-sm font-semibold text-purple-600">
                                        Step {selectedRequest?.currentStepOrder || 1} of {approvalSteps.length}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${((selectedRequest?.currentStepOrder || 1) / approvalSteps.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {approvalSteps
                                .sort((a, b) => (a.StepOrder || a.stepOrder || 0) - (b.StepOrder || b.stepOrder || 0))
                                .map((step, index) => {
                                    const stepOrder = step.StepOrder || step.stepOrder || 0;
                                    const stepName = step.StepName || step.stepName || 'Unnamed Step';
                                    const roleStr = step.RoleStr || step.roleStr || step.Role || step.role || 'Not Assigned';
                                    const currentStepOrder = selectedRequest?.currentStepOrder || 1;
                                    const isPastStep = stepOrder < currentStepOrder;
                                    const isCurrentStep = stepOrder === currentStepOrder;
                                    const isFutureStep = stepOrder > currentStepOrder;

                                    let stepStatus = '';
                                    let stepBgColor = '';
                                    let stepBorderColor = '';
                                    let statusBadgeColor = '';

                                    if (isPastStep) {
                                        stepStatus = 'Completed';
                                        stepBgColor = 'bg-green-50';
                                        stepBorderColor = 'border-green-200';
                                        statusBadgeColor = 'bg-green-100 text-green-700';
                                    } else if (isCurrentStep) {
                                        stepStatus = 'Current';
                                        stepBgColor = 'bg-purple-50';
                                        stepBorderColor = 'border-purple-200';
                                        statusBadgeColor = 'bg-purple-100 text-purple-700';
                                    } else {
                                        stepStatus = 'Pending';
                                        stepBgColor = 'bg-gray-50';
                                        stepBorderColor = 'border-gray-200';
                                        statusBadgeColor = 'bg-gray-100 text-gray-500';
                                    }

                                    return (
                                        <div key={step.Id || step.id || index} className="flex items-start gap-4 mb-6">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                                    isPastStep ? 'bg-green-500 text-white' :
                                                        isCurrentStep ? 'bg-purple-600 text-white ring-2 ring-purple-300' :
                                                            'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {isPastStep ? <CheckCircle className="w-4 h-4" /> : stepOrder}
                                                </div>
                                                {index < approvalSteps.length - 1 && (
                                                    <div className={`w-0.5 h-12 mt-1 ${
                                                        isPastStep ? 'bg-green-400' :
                                                            isCurrentStep ? 'bg-purple-300' :
                                                                'bg-gray-300'
                                                    }`} />
                                                )}
                                            </div>
                                            <div className={`flex-1 p-3 rounded-lg border ${stepBgColor} ${stepBorderColor}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-gray-900">{stepName}</h3>
                                                    </div>
                                                    <Badge className={`${statusBadgeColor} border-0`}>
                                                        {stepStatus}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                    <Users className="w-3 h-3" />
                                                    <span>Reviewer: {roleStr}</span>
                                                </div>
                                                {isCurrentStep && (
                                                    <div className="mt-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded inline-block">
                                                        ⏳ Waiting for {roleStr} to review
                                                    </div>
                                                )}
                                                {isPastStep && (
                                                    <div className="mt-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded inline-block">
                                                        ✓ Approved by {roleStr}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
                <div className="border-t px-6 py-4 bg-gray-50">
                    <Button onClick={() => setShowWorkflowModal(false)} className="w-full">Close</Button>
                </div>
            </motion.div>
        </div>
    );

    return (
        <ErrorBoundary>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Track the status of your leave requests and approval progress
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchMyLeaveRequests}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-gray-400">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Requests</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-gray-700">{stats.total}</div></CardContent>
                    </Card>
                    <Card className="border-l-4 border-yellow-400">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div></CardContent>
                    </Card>
                    <Card className="border-l-4 border-purple-400">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {leaveRequests.filter(r => r.statusStr === 'Pending' && r.currentStepOrder && r.currentStepOrder > 0).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-green-400">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-green-600">{stats.approved}</div></CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                                <TabsList>
                                    <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                                    <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                                    <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                                    <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by leave type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status / Progress</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {loading && paginatedRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                        Loading...
                                    </td>
                                </tr>
                            ) : paginatedRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p>No leave requests found</p>
                                        <p className="text-xs text-gray-400 mt-1">Submit a leave request to get started</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequests.map((request, index) => (
                                    <motion.tr
                                        key={request.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{request.leaveType}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(request.startDate)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(request.endDate)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{request.daysRequestedStr}</td>
                                        <td className="px-4 py-3">
                                            <StepProgressIndicator
                                                currentStep={request.currentStepOrder}
                                                totalSteps={request.totalSteps}
                                                status={request.statusStr}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedRequest(request); setDetailModalOpen(true); }}
                                                    className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {request.statusStr === 'Pending' && request.currentStepOrder && request.currentStepOrder > 0 && (
                                                    <button
                                                        onClick={() => fetchApprovalWorkflow(request)}
                                                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="View Workflow"
                                                    >
                                                        <GitBranch className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
                            <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Workflow Modal */}
                {showWorkflowModal && <WorkflowModal />}

                {/* Detail Modal */}
                <LeaveRequestDetailModal
                    isOpen={detailModalOpen}
                    onClose={() => { setDetailModalOpen(false); setSelectedRequest(null); }}
                    leave={selectedRequest}
                />
            </motion.div>
        </ErrorBoundary>
    );
};

export default MyLeaveRequestsPage;