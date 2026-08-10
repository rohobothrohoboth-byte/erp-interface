// src/pages/hr/leave/LeaveApprovalPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle, XCircle, Clock, Eye, Search, X, RefreshCw,
    ChevronLeft, ChevronRight, MoreVertical, Loader2, AlertCircle,
    FileText, User, GitBranch, Shield, Users
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { leaveApi } from '@/modules/hr/services/leave/leave.api';
import { api } from '@/shared/services/api';
import { useLeaveNotificationIntegration } from '@/modules/hr/hooks/leave/useLeaveNotificationIntegration';
import { useAuthStore } from '@/shared/stores/auth.store';
import toast from 'react-hot-toast';
import type { LeaveRequestListDto } from '@/modules/hr/types/leaverequest';
import type { LeaveAppStepListDto } from '@/modules/core/types/Settings/leaveAppStep';
import LeaveRequestDetailModal from '@/modules/hr/components/annualLeave/AllLeave/LeaveRequestDetailModal';
import ErrorBoundary from '@/shared/components/ui/ErrorBoundary';

interface ExtendedLeaveRequest extends LeaveRequestListDto {
    currentStepName?: string;
    currentStepOrder?: number;
    nextApproverRole?: string;
    approvalChainId?: string;
    approvalChainName?: string;
    stepStatus?: string;
    requestStatus?: string;
    totalSteps?: number;
    employeeId?: string;
}

const LeaveApprovalPage: React.FC = () => {
    const { role, employeeId, employeeName: currentUserName } = useAuthStore();
    const [leaveRequests, setLeaveRequests] = useState<ExtendedLeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState<ExtendedLeaveRequest | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [approvalComment, setApprovalComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [approvalSteps, setApprovalSteps] = useState<LeaveAppStepListDto[]>([]);
    const [workflowLoading, setWorkflowLoading] = useState(false);
    const [totalStepsCache, setTotalStepsCache] = useState<Record<string, number>>({});

    const { notifyLeaveRequestApproved, notifyLeaveRequestRejected } = useLeaveNotificationIntegration();

    const isSubmittingRef = React.useRef(false);
    const itemsPerPage = 10;

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
            console.error(`Error fetching steps count for chain ${chainId}:`, error);
            return 0;
        }
    };
// src/pages/hr/leave/LeaveApprovalPage.tsx

    // src/pages/hr/leave/LeaveApprovalPage.tsx - Update fetchLeaveRequests

    const fetchLeaveRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await leaveApi.getAllLeaveRequests();
            const requests = Array.isArray(data) ? data : [];

            const enrichedRequests = await Promise.all(requests.map(async (req) => {
                const statusDisplay = (req as any).statusStr || 'Pending';
                let currentAppStep = (req as any).currentStepOrder ?? (req as any).CurrentAppStep ?? 0;
                const approvalChainId = (req as any).approvalChainId;
                const employeeName = (req as any).employee || (req as any).employeeName || 'Unknown';
                // IMPORTANT: Get the employeeId from the request data
                const employeeId = (req as any).employeeId || (req as any).EmployeeId || '';
                const leaveType = (req as any).leaveType || 'Leave Request';
                const daysRequestedStr = (req as any).daysRequestedStr || '0 days';

                let totalSteps = 0;

                if (approvalChainId && statusDisplay === 'Pending') {
                    totalSteps = await fetchTotalStepsForChain(approvalChainId);
                    if (currentAppStep === 0 && statusDisplay === 'Pending') {
                        currentAppStep = 1;
                    }
                }

                const showStepOrder = statusDisplay === 'Pending' ? currentAppStep : undefined;

                console.log('🔍 Leave request data:', {
                    id: req.id,
                    employeeName: employeeName,
                    employeeId: employeeId,
                    leaveType: leaveType,
                    status: statusDisplay
                });

                return {
                    id: req.id,
                    employeeId: employeeId,  // This should be the GUID
                    employee: employeeName,
                    employeeName: employeeName,
                    leaveType: leaveType,
                    startDate: (req as any).startDate,
                    endDate: (req as any).endDate,
                    daysRequested: 0,
                    daysRequestedStr: daysRequestedStr,
                    status: statusDisplay === 'Pending' ? '0' : statusDisplay === 'Approved' ? '1' : '2',
                    statusStr: statusDisplay,
                    comments: (req as any).comments,
                    rowVersion: (req as any).rowVersion || (req as any).xmin || '0',
                    approvalChainId: approvalChainId,
                    currentStepOrder: showStepOrder,
                    currentStepName: showStepOrder && showStepOrder > 0 ? `Step ${showStepOrder}` : undefined,
                    totalSteps: totalSteps > 0 ? totalSteps : undefined,
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

    const fetchApprovalWorkflow = async (request: ExtendedLeaveRequest) => {
        if (!request.approvalChainId) {
            toast.error('No approval chain associated with this request');
            return;
        }

        setWorkflowLoading(true);
        try {
            const response = await api.get(`/hrm/leave/v1/Policy/Chain/Step/All/${request.approvalChainId}`);
            let steps = response.data?.data || [];
            if (!Array.isArray(steps) && steps && typeof steps === 'object') {
                steps = Object.values(steps);
            }

            setApprovalSteps(steps);
            setShowWorkflowModal(true);
        } catch (error: any) {
            console.error('Error fetching workflow:', error);
            toast.error(error?.response?.data?.message || error?.message || 'Failed to load approval workflow');
        } finally {
            setWorkflowLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const filteredRequests = leaveRequests.filter(request => {
        let matchesTab = false;
        const requestStatus = request.statusStr;

        if (activeTab === 'all') matchesTab = true;
        else if (activeTab === 'pending') matchesTab = requestStatus === 'Pending';
        else if (activeTab === 'approved') matchesTab = requestStatus === 'Approved';
        else if (activeTab === 'rejected') matchesTab = requestStatus === 'Rejected';

        const matchesSearch = !searchTerm ||
            (request.employee?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
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

    // src/pages/hr/leave/LeaveApprovalPage.tsx - Update handleApprove
// src/pages/hr/leave/LeaveApprovalPage.tsx - Update handleApprove

    const handleApprove = async () => {
        if (!selectedRequest) return;

        if (isSubmittingRef.current) return;
        if (selectedRequest.statusStr !== 'Pending') {
            toast.error('This request cannot be approved');
            setShowApproveModal(false);
            return;
        }

        isSubmittingRef.current = true;
        setActionLoading(true);

        try {
            await leaveApi.approveLeaveRequest(
                selectedRequest.id,
                approvalComment,
                selectedRequest.rowVersion || '0'
            );

            // Get the employeeId from the selected request
            // After the API updates, the selectedRequest might not have the latest employeeId
            // So we should try multiple sources
            let employeeId = selectedRequest.employeeId;

            // If employeeId is empty, try to get it from the employee name
            if (!employeeId && selectedRequest.employee) {
                try {
                    // Fetch all employees and find by name
                    const response = await api.get('/hrm/profile/v1/Employee/AllEmployee');
                    const employees = response.data?.data || [];
                    const employee = employees.find((e: any) =>
                        e.empFullName === selectedRequest.employee ||
                        e.empFullNameAm === selectedRequest.employee ||
                        e.code === selectedRequest.employee
                    );
                    if (employee) {
                        employeeId = employee.id;
                        console.log('✅ Found employeeId from name lookup:', employeeId);
                    }
                } catch (error) {
                    console.error('Error looking up employee by name:', error);
                }
            }

            console.log('📧 Final employeeId for notification:', employeeId);
            console.log('📧 Employee name:', selectedRequest.employee);

            // Only send notification if we have a valid employeeId
            if (employeeId && employeeId !== '00000000-0000-0000-0000-000000000000') {
                await notifyLeaveRequestApproved(
                    employeeId,
                    selectedRequest.employee || 'Employee',
                    selectedRequest.leaveType || 'Leave',
                    parseInt(selectedRequest.daysRequestedStr) || 0,
                    currentUserName || 'System',
                    role || 'Manager',
                    selectedRequest.currentStepOrder ? selectedRequest.currentStepOrder + 1 : undefined,
                    selectedRequest.totalSteps
                );
                console.log('✅ Approval notification sent successfully');
            } else {
                console.warn('⚠️ No employeeId found for request, skipping notification');
                // Still show success, but log the warning
            }

            toast.success('Leave request approved successfully');
            setTotalStepsCache({});
            await fetchLeaveRequests();
            setShowApproveModal(false);
            setApprovalComment('');
            setSelectedRequest(null);
        } catch (error: any) {
            console.error('Approve error:', error);
            toast.error(error?.response?.data?.message || error?.message || 'Failed to approve');
        } finally {
            setActionLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        if (!approvalComment.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        if (selectedRequest.statusStr !== 'Pending') {
            toast.error('This request cannot be rejected');
            setShowRejectModal(false);
            return;
        }

        setActionLoading(true);
        try {
            await leaveApi.rejectLeaveRequest(
                selectedRequest.id,
                approvalComment,
                selectedRequest.rowVersion || '0'
            );

            await notifyLeaveRequestRejected(
                selectedRequest.employeeId || selectedRequest.employee || '',
                selectedRequest.employee || 'Employee',
                selectedRequest.leaveType || 'Leave',
                parseInt(selectedRequest.daysRequestedStr) || 0,
                approvalComment,
                currentUserName || 'System'
            );

            toast.success('Leave request rejected');
            setTotalStepsCache({});
            await fetchLeaveRequests();
            setShowRejectModal(false);
            setApprovalComment('');
            setSelectedRequest(null);
        } catch (error: any) {
            console.error('Reject error:', error);
            toast.error(error?.response?.data?.message || error?.message || 'Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };

    const StatCard = ({ title, value, color, icon: Icon }: { title: string; value: number; color: string; icon: any }) => (
        <Card className="border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: color }}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                    <Icon className="w-8 h-8 text-gray-300" />
                </div>
            </CardContent>
        </Card>
    );

    const StatusBadge = ({ statusStr, currentStep, totalSteps }: { statusStr: string; currentStep?: number; totalSteps?: number }) => {
        const config: Record<string, { color: string; bg: string; icon: any; label: string }> = {
            pending: { color: 'text-yellow-800', bg: 'bg-yellow-100', icon: Clock, label: 'Pending' },
            approved: { color: 'text-green-800', bg: 'bg-green-100', icon: CheckCircle, label: 'Approved' },
            rejected: { color: 'text-red-800', bg: 'bg-red-100', icon: XCircle, label: 'Rejected' },
        };

        let statusKey = 'pending';
        const statusLower = statusStr?.toLowerCase() || 'pending';

        if (statusLower === 'pending') statusKey = 'pending';
        else if (statusLower === 'approved') statusKey = 'approved';
        else if (statusLower === 'rejected') statusKey = 'rejected';

        const { color, bg, icon: Icon, label } = config[statusKey];

        return (
            <div className="flex flex-col gap-1">
                <Badge className={`${bg} ${color} border-0 px-2 py-1 flex items-center gap-1 w-fit`}>
                    <Icon className="w-3 h-3" />
                    {label}
                </Badge>
                {statusKey === 'pending' && currentStep && currentStep > 0 && totalSteps && totalSteps > 0 && (
                    <span className="text-xs text-gray-500">Step {currentStep} of {totalSteps}</span>
                )}
            </div>
        );
    };

    const StepProgressIndicator = ({ currentStep, totalSteps, status }: { currentStep?: number; totalSteps?: number; status?: string }) => {
        if (status === 'Approved') {
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Fully Approved</span>
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
                        <span className="text-xs text-red-600 font-medium">Rejected</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                    </div>
                </div>
            );
        }

        if (status === 'Pending' && currentStep && currentStep > 0 && totalSteps && totalSteps > 0) {
            const progress = (currentStep / totalSteps) * 100;
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                            Step {currentStep} of {totalSteps}
                        </div>
                        <span className="text-xs text-gray-500">in progress</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">Waiting for step {currentStep} approval</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600 font-medium">Pending</span>
                </div>
                <p className="text-xs text-gray-400">Awaiting initial review</p>
            </div>
        );
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

    const WorkflowModal = () => {
        const getStepStatus = (stepOrder: number) => {
            const currentStep = selectedRequest?.currentStepOrder || 1;
            const requestStatus = selectedRequest?.statusStr;

            if (requestStatus === 'Rejected') {
                if (stepOrder === currentStep) return 'rejected';
                if (stepOrder < currentStep) return 'completed';
                return 'pending';
            }

            if (requestStatus === 'Approved') return 'completed';

            if (stepOrder < currentStep) return 'completed';
            if (stepOrder === currentStep) return 'current';
            return 'pending';
        };

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-full">
                                <GitBranch className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Approval Workflow</h2>
                                <p className="text-xs text-gray-500">
                                    {selectedRequest?.statusStr === 'Rejected'
                                        ? `Request rejected at step ${selectedRequest?.currentStepOrder}`
                                        : selectedRequest?.statusStr === 'Approved'
                                            ? 'Request fully approved'
                                            : 'Step-by-step approval process'}
                                </p>
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
                                <p>No approval steps configured for this chain</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">
                                            {selectedRequest?.statusStr === 'Rejected' ? 'Rejected at:' : 'Current Progress:'}
                                        </span>
                                        <span className={`text-sm font-semibold ${selectedRequest?.statusStr === 'Rejected' ? 'text-red-600' : 'text-purple-600'}`}>
                                            {selectedRequest?.statusStr === 'Rejected'
                                                ? `Step ${selectedRequest?.currentStepOrder} of ${approvalSteps.length}`
                                                : selectedRequest?.statusStr === 'Approved'
                                                    ? 'Completed'
                                                    : `Step ${selectedRequest?.currentStepOrder || 1} of ${approvalSteps.length}`}
                                        </span>
                                    </div>
                                    {selectedRequest?.statusStr !== 'Rejected' && selectedRequest?.statusStr !== 'Approved' && (
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${((selectedRequest?.currentStepOrder || 1) / approvalSteps.length) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                    {selectedRequest?.statusStr === 'Rejected' && (
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full"
                                                style={{ width: `${((selectedRequest?.currentStepOrder || 1) / approvalSteps.length) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {approvalSteps
                                    .sort((a, b) => (a.StepOrder || a.stepOrder || 0) - (b.StepOrder || b.stepOrder || 0))
                                    .map((step, index) => {
                                        const stepOrder = step.StepOrder || step.stepOrder || 0;
                                        const stepName = step.StepName || step.stepName || 'Unnamed Step';
                                        const roleStr = step.RoleStr || step.roleStr || step.Role || step.role || 'Not Assigned';
                                        const employee = step.Employee || step.employee;

                                        const stepStatus = getStepStatus(stepOrder);

                                        let statusText = '';
                                        let bgColor = '';
                                        let borderColor = '';
                                        let icon = null;

                                        if (stepStatus === 'completed') {
                                            statusText = 'Completed';
                                            bgColor = 'bg-green-50';
                                            borderColor = 'border-green-200';
                                            icon = <CheckCircle className="w-4 h-4 text-green-500" />;
                                        } else if (stepStatus === 'current') {
                                            statusText = 'Current - Waiting';
                                            bgColor = 'bg-purple-50';
                                            borderColor = 'border-purple-200';
                                            icon = <Clock className="w-4 h-4 text-purple-500" />;
                                        } else if (stepStatus === 'rejected') {
                                            statusText = 'Rejected';
                                            bgColor = 'bg-red-50';
                                            borderColor = 'border-red-200';
                                            icon = <XCircle className="w-4 h-4 text-red-500" />;
                                        } else {
                                            statusText = 'Pending';
                                            bgColor = 'bg-gray-50';
                                            borderColor = 'border-gray-200';
                                            icon = null;
                                        }

                                        return (
                                            <div key={step.Id || step.id || index} className="flex items-start gap-4 mb-6">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${stepStatus === 'completed' ? 'bg-green-500 text-white' : stepStatus === 'current' ? 'bg-purple-600 text-white ring-2 ring-purple-300' : stepStatus === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                        {stepStatus === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                                                            stepStatus === 'rejected' ? <XCircle className="w-4 h-4" /> :
                                                                stepOrder}
                                                    </div>
                                                    {index < approvalSteps.length - 1 && (
                                                        <div className={`w-0.5 h-12 mt-1 ${stepStatus === 'completed' ? 'bg-green-400' : stepStatus === 'current' ? 'bg-purple-300' : stepStatus === 'rejected' ? 'bg-red-300' : 'bg-gray-300'}`} />
                                                    )}
                                                </div>
                                                <div className={`flex-1 p-3 rounded-lg border ${bgColor} ${borderColor}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium text-gray-900">{stepName}</h3>
                                                            {icon}
                                                        </div>
                                                        <Badge className={`${stepStatus === 'completed' ? 'bg-green-100 text-green-700' : stepStatus === 'current' ? 'bg-purple-100 text-purple-700' : stepStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'} border-0`}>
                                                            {statusText}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                        <Users className="w-3 h-3" />
                                                        <span>Approver Role: {roleStr}</span>
                                                    </div>
                                                    {employee && (
                                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                            <User className="w-3 h-3" />
                                                            <span>Specific Approver: {employee}</span>
                                                        </div>
                                                    )}
                                                    {stepStatus === 'current' && selectedRequest?.statusStr !== 'Rejected' && (
                                                        <div className="mt-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded inline-block">
                                                            ⏳ Waiting for {roleStr} to approve
                                                        </div>
                                                    )}
                                                    {stepStatus === 'rejected' && (
                                                        <div className="mt-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded inline-block">
                                                            ❌ Rejected by {roleStr}
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
    };

    return (
        <ErrorBoundary>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leave Approval</h1>
                        <p className="text-sm text-gray-500 mt-1">Review and manage employee leave requests with multi-step approval workflow</p>
                    </div>
                    <Button variant="outline" onClick={fetchLeaveRequests} disabled={loading} className="flex items-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Requests" value={stats.total} color="#6B7280" icon={FileText} />
                    <StatCard title="Pending" value={stats.pending} color="#EAB308" icon={Clock} />
                    <StatCard title="Approved" value={stats.approved} color="#22C55E" icon={CheckCircle} />
                    <StatCard title="Rejected" value={stats.rejected} color="#EF4444" icon={XCircle} />
                </div>

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
                                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {loading && paginatedRequests.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Loading...</td></tr>
                            ) : paginatedRequests.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center"><AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p>No leave requests found</p></td></tr>
                            ) : (
                                paginatedRequests.map((request, index) => {
                                    const isPending = request.statusStr === 'Pending';
                                    const isApproved = request.statusStr === 'Approved';
                                    const isRejected = request.statusStr === 'Rejected';
                                    const hasWorkflow = isPending && request.approvalChainId;

                                    return (
                                        <motion.tr key={request.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{request.employee || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{request.leaveType || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(request.startDate)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(request.endDate)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{request.daysRequestedStr}</td>
                                            <td className="px-4 py-3"><StatusBadge statusStr={request.statusStr} currentStep={request.currentStepOrder} totalSteps={request.totalSteps} /></td>
                                            <td className="px-4 py-3"><StepProgressIndicator currentStep={request.currentStepOrder} totalSteps={request.totalSteps} status={request.statusStr} /></td>
                                            <td className="px-4 py-3 text-right">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className="p-1 rounded-full hover:bg-gray-100">
                                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-48 p-1" align="end">
                                                        <button onClick={() => { setSelectedRequest(request); setDetailModalOpen(true); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                                                            <Eye className="w-4 h-4" /> View Details
                                                        </button>
                                                        {hasWorkflow && (
                                                            <button onClick={() => { setSelectedRequest(request); fetchApprovalWorkflow(request); }} className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded flex items-center gap-2">
                                                                <GitBranch className="w-4 h-4" /> View Workflow
                                                            </button>
                                                        )}
                                                        {isPending && (
                                                            <>
                                                                <button onClick={() => { setSelectedRequest(request); setApprovalComment(''); setShowApproveModal(true); }} className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded flex items-center gap-2">
                                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                                </button>
                                                                <button onClick={() => { setSelectedRequest(request); setApprovalComment(''); setShowRejectModal(true); }} className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded flex items-center gap-2">
                                                                    <XCircle className="w-4 h-4" /> Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {isApproved && <span className="block px-3 py-2 text-sm text-gray-400">Already Approved</span>}
                                                        {isRejected && <span className="block px-3 py-2 text-sm text-gray-400">Already Rejected</span>}
                                                    </PopoverContent>
                                                </Popover>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
                            <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-50">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-50">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Approve Modal */}
                {showApproveModal && selectedRequest && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-100 rounded-full"><CheckCircle className="w-6 h-6 text-green-600" /></div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Approve Leave Request</h2>
                                        {selectedRequest.currentStepOrder && selectedRequest.currentStepOrder > 0 && selectedRequest.totalSteps ? (
                                            <p className="text-xs text-gray-500">Step {selectedRequest.currentStepOrder} of {selectedRequest.totalSteps}</p>
                                        ) : selectedRequest.statusStr === 'Pending' ? <p className="text-xs text-gray-500">Initial Approval</p> : null}
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">Approve leave request for <span className="font-medium">{selectedRequest.employee}</span>?</p>
                                {selectedRequest.currentStepOrder && selectedRequest.currentStepOrder > 0 && selectedRequest.totalSteps && (
                                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                        <p className="text-sm text-blue-800"><strong>Current Step:</strong> Step {selectedRequest.currentStepOrder} of {selectedRequest.totalSteps}</p>
                                        <p className="text-xs text-blue-600 mt-1">{selectedRequest.currentStepOrder === selectedRequest.totalSteps ? 'This is the final step. Approval will complete the request.' : `After approval, will move to step ${selectedRequest.currentStepOrder + 1}`}</p>
                                    </div>
                                )}
                                <div className="mb-4">
                                    <Label>Comments (Optional)</Label>
                                    <Textarea value={approvalComment} onChange={(e) => setApprovalComment(e.target.value)} placeholder="Add approval comments..." className="mt-1" rows={3} />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setShowApproveModal(false)} disabled={actionLoading}>Cancel</Button>
                                    <Button onClick={handleApprove} disabled={actionLoading || selectedRequest.statusStr !== 'Pending'} className="bg-green-600 hover:bg-green-700">
                                        {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Confirm Approval
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && selectedRequest && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-100 rounded-full"><XCircle className="w-6 h-6 text-red-600" /></div>
                                    <h2 className="text-xl font-semibold text-gray-900">Reject Leave Request</h2>
                                </div>
                                <p className="text-gray-600 mb-4">Reject leave request for <span className="font-medium">{selectedRequest.employee}</span>?</p>
                                <div className="mb-4">
                                    <Label>Reason <span className="text-red-500">*</span></Label>
                                    <Textarea value={approvalComment} onChange={(e) => setApprovalComment(e.target.value)} placeholder="Please provide a reason for rejection..." className="mt-1" rows={3} required />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setShowRejectModal(false)} disabled={actionLoading}>Cancel</Button>
                                    <Button onClick={handleReject} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
                                        {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Confirm Rejection
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Workflow Modal */}
                {showWorkflowModal && <WorkflowModal />}

                {/* Detail Modal */}
                <LeaveRequestDetailModal isOpen={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedRequest(null); }} leave={selectedRequest} />
            </motion.div>
        </ErrorBoundary>
    );
};

export default LeaveApprovalPage;