// src/pages/procurement/po/POTracking.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Truck,
    Package,
    CheckCircle,
    Clock,
    AlertCircle,
    MapPin,
    Calendar,
    DollarSign,
    Building2,
    Eye,
    Download,
    Filter,
    Loader2,
    RefreshCw,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { getPurchaseOrders, getPurchaseOrderById } from '@/modules/procurement/services/purchaseOrder.api';
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
    'In Transit': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    PartiallyReceived: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Delayed: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <Clock className="w-4 h-4" />,
    Sent: <Clock className="w-4 h-4" />,
    Pending: <Clock className="w-4 h-4" />,
    Confirmed: <CheckCircle className="w-4 h-4" />,
    Approved: <CheckCircle className="w-4 h-4" />,
    Shipped: <Truck className="w-4 h-4" />,
    'In Transit': <Truck className="w-4 h-4" />,
    Delivered: <CheckCircle className="w-4 h-4" />,
    Cancelled: <AlertCircle className="w-4 h-4" />,
    Rejected: <AlertCircle className="w-4 h-4" />,
    PartiallyReceived: <Package className="w-4 h-4" />,
    Delayed: <AlertCircle className="w-4 h-4" />,
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Sent: 'Sent',
    Pending: 'Pending Approval',
    Confirmed: 'Confirmed',
    Approved: 'Approved',
    Shipped: 'Shipped',
    'In Transit': 'In Transit',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    Rejected: 'Rejected',
    PartiallyReceived: 'Partially Received',
    Delayed: 'Delayed',
};

const progressMap: Record<string, number> = {
    Draft: 10,
    Sent: 25,
    Pending: 25,
    Confirmed: 40,
    Approved: 40,
    Shipped: 60,
    'In Transit': 75,
    Delivered: 100,
    Cancelled: 0,
    Rejected: 0,
    PartiallyReceived: 85,
    Delayed: 30,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const POTracking = () => {
    const navigate = useNavigate();

    // State
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // View Modal State
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    // Fetch purchase orders with tracking statuses
    const fetchTrackingData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getPurchaseOrders({
                page: 1,
                pageSize: 100,
                sortBy: 'OrderDate',
                sortOrder: 'DESC'
            });

            const data = response?.data?.data || response?.data || [];
            console.log('✅ Fetched tracking data:', data);
            setPurchaseOrders(data);
        } catch (error: any) {
            console.error('Error fetching tracking data:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load tracking data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchTrackingData();
    }, [fetchTrackingData]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchTrackingData();
    };

    // ✅ Handle View Details - Open modal
    const handleViewDetails = async (po: PurchaseOrder) => {
        setViewLoading(true);
        try {
            // If we already have the full data, use it
            if (po.lines && po.vendorName) {
                setSelectedPO(po);
                setIsViewModalOpen(true);
            } else {
                // Fetch full PO data
                const response = await getPurchaseOrderById(po.id);
                const data = response?.data?.data || response?.data;
                setSelectedPO(data);
                setIsViewModalOpen(true);
            }
        } catch (error: any) {
            console.error('Error fetching PO details:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load purchase order details');
            // Fallback: use the data we have
            setSelectedPO(po);
            setIsViewModalOpen(true);
        } finally {
            setViewLoading(false);
        }
    };

    // Filter tracking data
    const filteredOrders = purchaseOrders.filter(po => {
        const matchesSearch = po.purchaseOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Get progress percentage
    const getProgress = (status: string) => {
        return progressMap[status] || 0;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        return statusIcons[status] || <Clock className="w-4 h-4" />;
    };

    // Get status label
    const getStatusLabel = (status: string) => {
        return statusLabels[status] || status;
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    // Format date
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

    // Generate tracking updates based on status
    const getTrackingUpdates = (po: PurchaseOrder) => {
        const updates = [];

        // Order placed
        updates.push({
            date: po.dateAdd,
            status: 'Order Placed',
            location: 'System',
            description: `Purchase order ${po.purchaseOrderNumber} created`
        });

        // Confirmed
        if (po.confirmedDate || po.status === 'Confirmed' || po.status === 'Approved') {
            updates.push({
                date: po.confirmedDate || po.dateMod || po.dateAdd,
                status: 'Confirmed',
                location: 'Vendor',
                description: 'Order confirmed by vendor'
            });
        }

        // Shipped
        if (po.shippedDate || po.status === 'Shipped') {
            updates.push({
                date: po.shippedDate || po.dateMod || po.dateAdd,
                status: 'Shipped',
                location: 'Vendor Warehouse',
                description: 'Items have been shipped'
            });
        }

        // In Transit
        if (po.status === 'In Transit') {
            updates.push({
                date: po.dateMod || po.dateAdd,
                status: 'In Transit',
                location: 'Transit',
                description: 'Package is in transit'
            });
        }

        // Delivered
        if (po.receivedDate || po.status === 'Delivered') {
            updates.push({
                date: po.receivedDate || po.dateMod || po.dateAdd,
                status: 'Delivered',
                location: 'Delivery Location',
                description: 'Items have been delivered'
            });
        }

        return updates;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading tracking data...</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">PO Tracking</h1>
                    <p className="text-sm text-gray-500">
                        Track purchase orders in real-time
                    </p>
                </div>
                <div className="flex gap-2">
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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-3">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg font-bold text-gray-900">{purchaseOrders.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-purple-600">Shipped</p>
                        <p className="text-lg font-bold text-purple-700">
                            {purchaseOrders.filter(p => p.status === 'Shipped').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-indigo-200 bg-indigo-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-indigo-600">In Transit</p>
                        <p className="text-lg font-bold text-indigo-700">
                            {purchaseOrders.filter(p => p.status === 'In Transit').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-red-600">Delayed</p>
                        <p className="text-lg font-bold text-red-700">
                            {purchaseOrders.filter(p => p.status === 'Delayed').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-green-600">Delivered</p>
                        <p className="text-lg font-bold text-green-700">
                            {purchaseOrders.filter(p => p.status === 'Delivered').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search PO number, vendor, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]"
                >
                    <option value="all">All Status</option>
                    <option value="Shipped">Shipped</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Delayed">Delayed</option>
                    <option value="PartiallyReceived">Partially Received</option>
                </select>
            </div>

            {/* Tracking Cards */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No tracking records found matching your criteria</p>
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
                    filteredOrders.map((po) => {
                        const progress = getProgress(po.status);
                        const updates = getTrackingUpdates(po);
                        const recentUpdates = updates.slice(-3);

                        return (
                            <motion.div
                                key={po.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                            {/* Left Side */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {po.purchaseOrderNumber}
                                                    </h3>
                                                    <Badge className={`${getStatusColor(po.status)} flex items-center gap-1`}>
                                                        {getStatusIcon(po.status)}
                                                        {getStatusLabel(po.status)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {po.description || 'No description'}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <Building2 className="w-4 h-4" />
                                                    {po.vendorName || 'Unknown Vendor'}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Total Amount</p>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {formatCurrency(po.totalAmount)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Items</p>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {po.lines?.length || 0}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Order Date</p>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {formatDate(po.orderDate)}
                                                        </p>
                                                    </div>
                                                    {po.expectedDeliveryDate && (
                                                        <div>
                                                            <p className="text-xs text-gray-500">Expected Delivery</p>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {formatDate(po.expectedDeliveryDate)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress & Updates */}
                                            <div className="lg:w-80">
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-500">Progress</span>
                                                        <span className={`font-medium ${
                                                            progress >= 75 ? 'text-green-600' :
                                                                progress >= 50 ? 'text-blue-600' :
                                                                    progress >= 25 ? 'text-yellow-600' :
                                                                        'text-red-600'
                                                        }`}>
                                                            {progress}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${
                                                                progress >= 75 ? 'bg-green-500' :
                                                                    progress >= 50 ? 'bg-blue-500' :
                                                                        progress >= 25 ? 'bg-yellow-500' :
                                                                            'bg-red-500'
                                                            }`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-xs font-medium text-gray-500">Recent Updates</p>
                                                    {recentUpdates.length > 0 ? (
                                                        recentUpdates.map((update, index) => (
                                                            <div key={index} className="flex items-start gap-2 text-xs">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                                                                <div>
                                                                    <p className="font-medium text-gray-700">{update.status}</p>
                                                                    <p className="text-gray-500">{update.description}</p>
                                                                    <p className="text-gray-400">
                                                                        {formatDate(update.date)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gray-400">No updates available</p>
                                                    )}
                                                </div>

                                                {/* ✅ View Details Button - Opens Modal */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(po);
                                                    }}
                                                    disabled={viewLoading}
                                                >
                                                    {viewLoading ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Eye className="w-4 h-4 mr-2" />
                                                    )}
                                                    View Details
                                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* ✅ Purchase Order View Modal */}
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
                isApprovalMode={false}
            />
        </motion.div>
    );
};

export default POTracking;