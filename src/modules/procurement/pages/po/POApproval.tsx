// src/pages/procurement/po/POApproval.tsx

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
    Building2,
    ArrowLeft,
    MessageSquare,
    Download,
    User,
    TrendingUp,
    Loader2,
    RefreshCw,
    Eye,
    Package,
    Truck
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getPurchaseOrders,
    updatePurchaseOrderStatus,
    getPurchaseOrderById
} from '@/modules/procurement/services/purchaseOrder.api';
import { PurchaseOrderViewModal } from '@/modules/procurement/components/purchase-order/PurchaseOrderViewModal';
import type { PurchaseOrder } from '@/modules/procurement/types/purchaseOrder.types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Sent: 'bg-blue-100 text-blue-800 border-blue-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Confirmed: 'bg-green-100 text-green-800 border-green-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    PartiallyReceived: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Sent: 'Sent',
    Pending: 'Sent',
    Confirmed: 'Confirmed',
    Approved: 'Confirmed',
    Shipped: 'Shipped',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    Rejected: 'Rejected',
    PartiallyReceived: 'Partially Received',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const POApproval = () => {
    const navigate = useNavigate();

    // State
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('Sent');

    // View Modal State
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    // Fetch purchase orders pending Approval
    const fetchPendingApprovals = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getPurchaseOrders({
                status: 'Sent',
                page: 1,
                pageSize: 50,
                sortBy: 'OrderDate',
                sortOrder: 'DESC'
            });

            const data = response?.data?.data || response?.data || [];
            console.log('✅ Fetched purchase orders:', data);
            setPurchaseOrders(data);
        } catch (error: any) {
            console.error('Error fetching purchase orders:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load purchase orders');
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

    // ✅ Handle View Details - Fetch full PO data
    const handleViewDetails = async (id: string) => {
        setViewLoading(true);
        try {
            const response = await getPurchaseOrderById(id);
            const data = response?.data?.data || response?.data;
            console.log('✅ Full PO data:', data);
            setSelectedPO(data);
            setIsViewModalOpen(true);
        } catch (error: any) {
            console.error('Error fetching PO details:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load purchase order details');
        } finally {
            setViewLoading(false);
        }
    };

    // Handle approve
    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            await updatePurchaseOrderStatus(id, { status: 'Confirmed' });
            showToast.success('Purchase order approved successfully');
            fetchPendingApprovals();
        } catch (error: any) {
            console.error('Error approving purchase order:', error);
            showToast.error(error?.response?.data?.message || 'Failed to approve purchase order');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle reject
    const handleReject = async (id: string) => {
        setProcessingId(id);
        try {
            await updatePurchaseOrderStatus(id, { status: 'Cancelled' });
            showToast.success('Purchase order rejected successfully');
            fetchPendingApprovals();
        } catch (error: any) {
            console.error('Error rejecting purchase order:', error);
            showToast.error(error?.response?.data?.message || 'Failed to reject purchase order');
        } finally {
            setProcessingId(null);
        }
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
        const label = statusLabels[status] || status;
        return <Badge className={color}>{label}</Badge>;
    };

    // Filter purchase orders
    const filteredOrders = purchaseOrders.filter(po => {
        if (filter === 'pending') {
            return po.status === 'Sent' || po.status === 'Pending';
        }
        if (filter === 'approved') {
            return po.status === 'Confirmed' || po.status === 'Approved';
        }
        if (filter === 'rejected') {
            return po.status === 'Cancelled' || po.status === 'Rejected';
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading approvals...</p>
                </div>
            </div>
        );
    }

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
                        onClick={() => navigate('/procurement/po')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">PO Approval</h1>
                        <p className="text-sm text-gray-500">
                            Review and approve purchase orders
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
                            {purchaseOrders.filter(po => po.status === 'Sent' || po.status === 'Pending').length}
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
                            {purchaseOrders.filter(po => po.status === 'Confirmed' || po.status === 'Approved').length}
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
                            {purchaseOrders.filter(po => po.status === 'Cancelled' || po.status === 'Rejected').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                <Button
                    variant={filter === 'pending' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('pending')}
                    className={filter === 'pending' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                    <Clock className="w-4 h-4 mr-2" />
                    Pending ({purchaseOrders.filter(po => po.status === 'Sent' || po.status === 'Pending').length})
                </Button>
                <Button
                    variant={filter === 'approved' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('approved')}
                    className={filter === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approved ({purchaseOrders.filter(po => po.status === 'Confirmed' || po.status === 'Approved').length})
                </Button>
                <Button
                    variant={filter === 'rejected' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('rejected')}
                    className={filter === 'rejected' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejected ({purchaseOrders.filter(po => po.status === 'Cancelled' || po.status === 'Rejected').length})
                </Button>
            </div>

            {/* Approval Items */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No purchase orders found</p>
                        <p className="text-sm text-gray-400">
                            {filter === 'pending' ? 'All caught up! No pending approvals.' :
                                filter === 'approved' ? 'No approved purchase orders yet.' :
                                    'No rejected purchase orders.'}
                        </p>
                    </div>
                ) : (
                    filteredOrders.map((po) => (
                        <motion.div
                            key={po.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        {/* Left Side - Details */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {po.purchaseOrderNumber}
                                                </h3>
                                                {getStatusBadge(po.status)}
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 mb-3">
                                                {po.description || 'No description'}
                                            </p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                                                <div>
                                                    <p className="text-gray-500">Vendor</p>
                                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                                        <Building2 className="w-4 h-4" />
                                                        {po.vendorName || 'Unknown'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Total Amount</p>
                                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4" />
                                                        {formatCurrency(po.totalAmount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Items</p>
                                                    <p className="font-medium text-gray-900">
                                                        {po.lines?.length || 0} items
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Created</p>
                                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(po.dateAdd)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side - Actions */}
                                        <div className="flex flex-col gap-2 min-w-[180px]">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => handleViewDetails(po.id)}
                                                disabled={viewLoading}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </Button>

                                            {(po.status === 'Sent' || po.status === 'Pending') && (
                                                <>
                                                    <Button
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApprove(po.id)}
                                                        disabled={processingId === po.id}
                                                    >
                                                        {processingId === po.id ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                        )}
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleReject(po.id)}
                                                        disabled={processingId === po.id}
                                                    >
                                                        {processingId === po.id ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                        )}
                                                        Reject
                                                    </Button>
                                                </>
                                            )}

                                            {(po.status === 'Confirmed' || po.status === 'Approved') && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-emerald-600"
                                                    onClick={() => navigate(`/procurement/po/${po.id}/receive`)}
                                                >
                                                    <Package className="w-4 h-4 mr-2" />
                                                    Receive
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* View Modal */}
            <PurchaseOrderViewModal
                isOpen={isViewModalOpen}
                purchaseOrder={selectedPO}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedPO(null);
                }}
                onEdit={() => {
                    if (selectedPO) {
                        setIsViewModalOpen(false);
                        navigate(`/procurement/po/${selectedPO.id}/edit`);
                    }
                }}
                isApprovalMode={true}
                onStatusChange={() => {
                    fetchPendingApprovals();
                }}
            />
        </motion.div>
    );
};

export default POApproval;