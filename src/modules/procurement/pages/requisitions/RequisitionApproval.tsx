// src/pages/procurement/requisitions/RequisitionApproval.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Calendar,
    DollarSign,
    User,
    Building2,
    ArrowLeft,
    MessageSquare,
    Download,
    Loader2,
    RefreshCw,
    Eye,
    AlertCircle,
    Send
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { showToast } from '@/shared/layout/layout';
import {
    getRequisitions,
    approveRequisition,
    rejectRequisition
} from '@/modules/procurement/services/requisition.api';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { Requisition } from '@/modules/procurement/types/requisition.types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    UnderReview: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Purchased: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <Clock className="w-3 h-3" />,
    Submitted: <Send className="w-3 h-3" />,
    UnderReview: <AlertCircle className="w-3 h-3" />,
    Approved: <CheckCircle className="w-3 h-3" />,
    Rejected: <XCircle className="w-3 h-3" />,
    Purchased: <FileText className="w-3 h-3" />,
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Submitted: 'Submitted',
    UnderReview: 'Under Review',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Purchased: 'Purchased',
};

const priorityColors: Record<string, string> = {
    Urgent: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-blue-100 text-blue-800 border-blue-200',
};

// ============================================================
// REJECT MODAL
// ============================================================

interface RejectModalProps {
    isOpen: boolean;
    requisitionId: string | null;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    isProcessing: boolean;
}

const RejectModal: React.FC<RejectModalProps> = ({
                                                     isOpen,
                                                     requisitionId,
                                                     onConfirm,
                                                     onCancel,
                                                     isProcessing
                                                 }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!reason.trim()) {
            showToast.error('Please provide a rejection reason');
            return;
        }
        onConfirm(reason);
        setReason('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <div className="p-2 bg-red-100 rounded-full">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-semibold">Reject Requisition</h2>
                </div>
                <p className="text-gray-600 mb-2">
                    Please provide a reason for rejecting this requisition.
                </p>
                <div className="mb-4">
                    <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                    <textarea
                        id="rejectionReason"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleConfirm}
                        disabled={isProcessing || !reason.trim()}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Rejecting...
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const RequisitionApproval = () => {
    const navigate = useNavigate();
    const { userId, userName } = useAuthStore();

    // State
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null
    });

    // In RequisitionApproval.tsx - fetchPendingApprovals

    const fetchPendingApprovals = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getRequisitions({
                status: 'Submitted,UnderReview',
                page: 1,
                pageSize: 100,
                sortBy: 'SubmittedDate',
                sortOrder: 'DESC'
            });

            console.log('📡 API Response:', response);
            console.log('📡 Response data:', response?.data);

            const data = response?.data?.data || response?.data || [];
            console.log('✅ Processed data:', data);

            setRequisitions(data);
        } catch (error: any) {
            console.error('Error fetching pending approvals:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load pending approvals');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchPendingApprovals();
    }, [fetchPendingApprovals]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchPendingApprovals();
    };

    // Handle approve
    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            await approveRequisition(id, {
                comments: `Approved by ${userName || 'System'}`
            });
            showToast.success('Requisition approved successfully');
            fetchPendingApprovals();
        } catch (error: any) {
            console.error('Error approving:', error);
            showToast.error(error?.response?.data?.message || 'Failed to approve requisition');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle reject
    const handleReject = async (id: string, reason: string) => {
        setProcessingId(id);
        try {
            await rejectRequisition(id, { rejectionReason: reason });
            showToast.success('Requisition rejected successfully');
            setRejectModal({ isOpen: false, id: null });
            fetchPendingApprovals();
        } catch (error: any) {
            console.error('Error rejecting:', error);
            showToast.error(error?.response?.data?.message || 'Failed to reject requisition');
        } finally {
            setProcessingId(null);
        }
    };

    // Open reject modal
    const openRejectModal = (id: string) => {
        setRejectModal({ isOpen: true, id });
    };

    // Close reject modal
    const closeRejectModal = () => {
        setRejectModal({ isOpen: false, id: null });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

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
        const color = statusColors[status] || 'bg-gray-100 text-gray-800';
        const icon = statusIcons[status] || null;
        const label = statusLabels[status] || status;
        return (
            <Badge className={`${color} flex items-center gap-1`}>
                {icon}
                <span>{label}</span>
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const color = priorityColors[priority] || 'bg-gray-100 text-gray-800';
        return <Badge className={color}>{priority || 'Medium'}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading pending approvals...</p>
                </div>
            </div>
        );
    }

    const pendingRequisitions = requisitions.filter(
        r => r.status === 'Submitted' || r.status === 'UnderReview'
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/procurement')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Requisition Approval</h1>
                        <p className="text-sm text-gray-500">
                            Review and approve purchase requisitions • {pendingRequisitions.length} pending
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            Pending Approval
                        </p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {pendingRequisitions.length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Approved
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                            {requisitions.filter(r => r.status === 'Approved').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-red-600 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Rejected
                        </p>
                        <p className="text-2xl font-bold text-red-700">
                            {requisitions.filter(r => r.status === 'Rejected').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Approval Items */}
            <div className="space-y-4">
                {pendingRequisitions.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">All caught up!</p>
                        <p className="text-sm text-gray-400">No pending requisitions for approval</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={handleRefresh}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                ) : (
                    pendingRequisitions.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        {/* Left Side - Details */}
                                        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/procurement/requisitions/${item.id}`)}>
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {item.requisitionNumber || item.id.substring(0, 8)}
                                                </h3>
                                                {getStatusBadge(item.status)}
                                                {getPriorityBadge(item.priority)}
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">{item.title}</p>
                                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Department</p>
                                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                                        <Building2 className="w-4 h-4" />
                                                        {item.departmentName || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Requester</p>
                                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {item.requesterName || 'Unknown'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Total Amount</p>
                                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4" />
                                                        {formatCurrency(item.totalAmount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Items</p>
                                                    <p className="font-medium text-gray-900">{item.lines?.length || 0} items</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Submitted: {formatDate(item.submittedDate)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Required: {formatDate(item.requiredDate)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Side - Actions */}
                                        <div className="flex flex-col gap-2 min-w-[180px]">
                                            <Button
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                onClick={() => handleApprove(item.id)}
                                                disabled={processingId === item.id}
                                            >
                                                {processingId === item.id ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                )}
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => openRejectModal(item.id)}
                                                disabled={processingId === item.id}
                                            >
                                                {processingId === item.id ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                )}
                                                Reject
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => navigate(`/procurement/requisitions/${item.id}`)}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Reject Modal */}
            <RejectModal
                isOpen={rejectModal.isOpen}
                requisitionId={rejectModal.id}
                onConfirm={(reason) => {
                    if (rejectModal.id) {
                        handleReject(rejectModal.id, reason);
                    }
                }}
                onCancel={closeRejectModal}
                isProcessing={processingId === rejectModal.id}
            />
        </motion.div>
    );
};

export default RequisitionApproval;