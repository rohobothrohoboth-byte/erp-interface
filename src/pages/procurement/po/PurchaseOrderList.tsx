// src/pages/procurement/po/PurchaseOrderList.tsx

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    DollarSign,
    Building2,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    Truck,
    Package,
    Loader2,
    RefreshCw,
    X,
    FileCheck,
    Send,
    Printer
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { showToast } from '../../../layout/layout';
import {
    getPurchaseOrders,
    deletePurchaseOrder,
    updatePurchaseOrderStatus,
    exportPurchaseOrders
} from '../../../services/procurement/purchaseOrder.api';
import { useAuthStore } from '../../../stores/auth.store';
import type { PurchaseOrder } from '../../../types/procurement/purchaseOrder.types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Sent: 'bg-blue-100 text-blue-800 border-blue-200',
    Confirmed: 'bg-green-100 text-green-800 border-green-200',
    Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    PartiallyReceived: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <Edit className="w-3 h-3" />,
    Sent: <Send className="w-3 h-3" />,
    Confirmed: <CheckCircle className="w-3 h-3" />,
    Shipped: <Truck className="w-3 h-3" />,
    Delivered: <Package className="w-3 h-3" />,
    Cancelled: <X className="w-3 h-3" />,
    PartiallyReceived: <Package className="w-3 h-3" />,
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Sent: 'Sent',
    Confirmed: 'Confirmed',
    Shipped: 'Shipped',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    PartiallyReceived: 'Partially Received',
};

const statusOrder = ['Draft', 'Sent', 'Confirmed', 'Shipped', 'PartiallyReceived', 'Delivered', 'Cancelled'];

// ============================================================
// MODAL COMPONENTS
// ============================================================

interface DeleteModalProps {
    isOpen: boolean;
    purchaseOrder: PurchaseOrder | null;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, purchaseOrder, onConfirm, onCancel, isDeleting }) => {
    if (!isOpen || !purchaseOrder) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <div className="p-2 bg-red-100 rounded-full">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-semibold">Delete Purchase Order</h2>
                </div>
                <p className="text-gray-600 mb-2">
                    Are you sure you want to delete <strong>{purchaseOrder.purchaseOrderNumber}</strong>?
                </p>
                <p className="text-sm text-gray-500 mb-6">
                    This action cannot be undone. This will permanently delete the purchase order and all its lines.
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

interface StatusUpdateModalProps {
    isOpen: boolean;
    purchaseOrder: PurchaseOrder | null;
    currentStatus: string;
    onConfirm: (status: string) => void;
    onCancel: () => void;
    isUpdating: boolean;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
                                                                 isOpen,
                                                                 purchaseOrder,
                                                                 currentStatus,
                                                                 onConfirm,
                                                                 onCancel,
                                                                 isUpdating
                                                             }) => {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    useEffect(() => {
        setSelectedStatus(currentStatus);
    }, [currentStatus]);

    if (!isOpen || !purchaseOrder) return null;

    const availableStatuses = statusOrder.filter(s => s !== currentStatus);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center gap-3 text-blue-600 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                        <FileCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-semibold">Update Status</h2>
                </div>
                <p className="text-gray-600 mb-2">
                    Update status for <strong>{purchaseOrder.purchaseOrderNumber}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    Current status: <Badge className={statusColors[currentStatus]}>{statusLabels[currentStatus]}</Badge>
                </p>
                <div className="space-y-2 mb-6">
                    {availableStatuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                                selectedStatus === status
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge className={statusColors[status]}>
                                        {statusIcons[status]}
                                        <span className="ml-1">{statusLabels[status]}</span>
                                    </Badge>
                                </div>
                                {selectedStatus === status && (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => onConfirm(selectedStatus)}
                        disabled={isUpdating || selectedStatus === currentStatus}
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Update Status
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

interface ViewModalProps {
    isOpen: boolean;
    purchaseOrder: PurchaseOrder | null;
    onClose: () => void;
    onEdit: () => void;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, purchaseOrder, onClose, onEdit }) => {
    if (!isOpen || !purchaseOrder) return null;

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
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{purchaseOrder.purchaseOrderNumber}</h2>
                            <p className="text-sm text-gray-500">{purchaseOrder.description || 'No description'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                        {purchaseOrder.status === 'Draft' && (
                            <Button variant="outline" size="sm" onClick={onEdit}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Bar */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <Badge className={statusColors[purchaseOrder.status] || 'bg-gray-100'}>
                            {statusIcons[purchaseOrder.status]}
                            <span className="ml-1">{statusLabels[purchaseOrder.status] || purchaseOrder.status}</span>
                        </Badge>
                        <span className="text-sm text-gray-400">|</span>
                        <span className="text-sm text-gray-500">Created: {formatDate(purchaseOrder.dateAdd)}</span>
                        {purchaseOrder.createdByUserName && (
                            <>
                                <span className="text-sm text-gray-400">|</span>
                                <span className="text-sm text-gray-500">By: {purchaseOrder.createdByUserName}</span>
                            </>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500">Vendor</p>
                            <p className="font-medium">{purchaseOrder.vendorName || 'Unknown'}</p>
                            {purchaseOrder.vendorId && (
                                <p className="text-xs text-gray-400">ID: {purchaseOrder.vendorId.substring(0, 8)}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(purchaseOrder.totalAmount)}</p>
                            <p className="text-xs text-gray-400">{purchaseOrder.currency || 'USD'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500">Items</p>
                            <p className="font-medium">{purchaseOrder.lines?.length || 0} items</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500">Order Date</p>
                            <p className="font-medium">{formatDate(purchaseOrder.orderDate)}</p>
                        </div>
                        {purchaseOrder.expectedDeliveryDate && (
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Expected Delivery</p>
                                <p className="font-medium">{formatDate(purchaseOrder.expectedDeliveryDate)}</p>
                            </div>
                        )}
                        {purchaseOrder.paymentTerms && (
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Payment Terms</p>
                                <p className="font-medium">{purchaseOrder.paymentTerms}</p>
                            </div>
                        )}
                        {purchaseOrder.shippingAddress && (
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Shipping Address</p>
                                <p className="font-medium">{purchaseOrder.shippingAddress}</p>
                            </div>
                        )}
                        {purchaseOrder.periodName && (
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Period</p>
                                <p className="font-medium">{purchaseOrder.periodName}</p>
                            </div>
                        )}
                        {purchaseOrder.requisitionNumber && (
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Requisition</p>
                                <p className="font-medium">{purchaseOrder.requisitionNumber}</p>
                            </div>
                        )}
                    </div>

                    {/* Lines Table */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Line Items</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y">
                                {purchaseOrder.lines?.map((line, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-gray-700">{line.description}</td>
                                        <td className="px-4 py-2 text-right">{line.quantity}</td>
                                        <td className="px-4 py-2 text-right">{formatCurrency(line.unitPrice)}</td>
                                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(line.totalAmount)}</td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-semibold">
                                <tr>
                                    <td colSpan={3} className="px-4 py-2 text-right">Total</td>
                                    <td className="px-4 py-2 text-right text-emerald-600">
                                        {formatCurrency(purchaseOrder.totalAmount)}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Status Timeline</h3>
                        <div className="flex items-center gap-2">
                            {statusOrder.map((status, index) => {
                                const isCompleted = statusOrder.indexOf(purchaseOrder.status) >= index;
                                return (
                                    <div key={status} className="flex items-center">
                                        <div className={`flex items-center gap-1 ${isCompleted ? 'text-emerald-600' : 'text-gray-300'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                                {isCompleted ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <Clock className="w-4 h-4" />
                                                )}
                                            </div>
                                            <span className={`text-xs ${isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                                                {statusLabels[status]}
                                            </span>
                                        </div>
                                        {index < statusOrder.length - 1 && (
                                            <div className={`w-8 h-0.5 ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const PurchaseOrderList = () => {
    const navigate = useNavigate();
    const { userId, userName } = useAuthStore();

    // State
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [exporting, setExporting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Modal states
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState('');

    const ITEMS_PER_PAGE = 10;

    // Fetch purchase orders
    const fetchPurchaseOrders = useCallback(async (page: number = 1) => {
        try {
            setLoading(true);
            const params: any = {
                page: page,
                pageSize: ITEMS_PER_PAGE,
                sortBy: 'OrderDate',
                sortOrder: 'DESC'
            };

            if (searchTerm) params.search = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            console.log('📡 Fetching purchase orders with params:', params);
            const response = await getPurchaseOrders(params);

            const data = response?.data?.data || response?.data || [];
            const total = response?.data?.totalCount || response?.data?.total || data.length || 0;
            const pages = response?.data?.totalPages || Math.ceil(total / ITEMS_PER_PAGE) || 1;

            setPurchaseOrders(data);
            setTotalCount(total);
            setTotalPages(pages);
            console.log(`✅ Fetched ${data.length} purchase orders`);
        } catch (error: any) {
            console.error('Error fetching purchase orders:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load purchase orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filterStatus]);

    // Initial load and filter changes
    useEffect(() => {
        fetchPurchaseOrders(1);
    }, [searchTerm, filterStatus]);

    // Page change
    useEffect(() => {
        if (currentPage > 1) {
            fetchPurchaseOrders(currentPage);
        }
    }, [currentPage]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        fetchPurchaseOrders(1);
    };

    // Handle export
    const handleExport = async () => {
        setExporting(true);
        try {
            const params: any = {
                format: 'csv'
            };
            if (filterStatus !== 'all') params.status = filterStatus;

            const response = await exportPurchaseOrders(params);

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `purchase-orders-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast.success('Purchase orders exported successfully');
        } catch (error: any) {
            console.error('Error exporting:', error);
            showToast.error('Failed to export purchase orders');
        } finally {
            setExporting(false);
        }
    };

    // Handle delete
    const handleDeleteConfirm = async () => {
        if (!selectedPO) return;

        setDeletingId(selectedPO.id);
        try {
            await deletePurchaseOrder(selectedPO.id);
            showToast.success('Purchase order deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedPO(null);
            fetchPurchaseOrders(currentPage);
        } catch (error: any) {
            console.error('Error deleting:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete purchase order');
        } finally {
            setDeletingId(null);
        }
    };

    // Handle status update
    const handleStatusUpdateConfirm = async (status: string) => {
        if (!selectedPO) return;

        setUpdatingId(selectedPO.id);
        try {
            await updatePurchaseOrderStatus(selectedPO.id, { status });
            showToast.success(`Status updated to ${statusLabels[status]}`);
            setIsStatusModalOpen(false);
            setSelectedPO(null);
            fetchPurchaseOrders(currentPage);
        } catch (error: any) {
            console.error('Error updating status:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
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
    const handleEdit = (po: PurchaseOrder) => {
        navigate(`/procurement/po/${po.id}/edit`);
    };
    const openViewModal = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setIsViewModalOpen(true);
    };

    const openDeleteModal = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setIsDeleteModalOpen(true);
    };

    const openStatusModal = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setStatusToUpdate(po.status);
        setIsStatusModalOpen(true);
    };

    if (loading && !purchaseOrders.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading purchase orders...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
                    <p className="text-sm text-gray-500">
                        {totalCount} purchase orders • Manage and track all purchase orders
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleExport}
                        disabled={exporting || purchaseOrders.length === 0}
                    >
                        {exporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => navigate('/procurement/po/create')}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create PO
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">In Progress</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {purchaseOrders.filter(p => p.status === 'Sent' || p.status === 'Confirmed').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-600">Shipped</p>
                        <p className="text-2xl font-bold text-purple-700">
                            {purchaseOrders.filter(p => p.status === 'Shipped').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Total Value</p>
                        <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(purchaseOrders.reduce((acc, p) => acc + (p.totalAmount || 0), 0))}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by PO number, vendor, or description..."
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
                    {statusOrder.map((status) => (
                        <option key={status} value={status}>{statusLabels[status]}</option>
                    ))}
                </select>
            </div>

            {/* PO Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {purchaseOrders.map((po) => (
                    <motion.div
                        key={po.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2 }}
                        className="cursor-pointer"
                    >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3" onClick={() => openViewModal(po)}>
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{po.purchaseOrderNumber}</h3>
                                            <p className="text-sm text-gray-500">{po.description || 'No description'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={statusColors[po.status] || 'bg-gray-100 text-gray-800'}>
                                            {statusIcons[po.status]}
                                            <span className="ml-1">{statusLabels[po.status] || po.status}</span>
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4" onClick={() => openViewModal(po)}>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Building2 className="w-4 h-4" />
                                        {po.vendorName || 'Unknown Vendor'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <DollarSign className="w-4 h-4" />
                                        {formatCurrency(po.totalAmount)} · {po.lines?.length || 0} items
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        Created: {formatDate(po.dateAdd)}
                                    </div>
                                    {po.expectedDeliveryDate && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Truck className="w-4 h-4" />
                                            Expected: {formatDate(po.expectedDeliveryDate)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    {po.periodName && (
                                        <Badge variant="outline" className="bg-gray-50">{po.periodName}</Badge>
                                    )}
                                    {po.createdByUserName && (
                                        <Badge variant="outline" className="bg-gray-50">{po.createdByUserName}</Badge>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => openViewModal(po)}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View
                                    </Button>
                                    {po.status === 'Draft' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                            onClick={() => handleEdit(po)}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                    {po.status === 'Confirmed' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-emerald-600"
                                            onClick={() => navigate(`/procurement/po/${po.id}/receive`)}
                                        >
                                            <Package className="w-4 h-4 mr-2" />
                                            Receive
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-500 hover:text-blue-700"
                                        onClick={() => openStatusModal(po)}
                                        disabled={po.status === 'Delivered' || po.status === 'Cancelled'}
                                    >
                                        <FileCheck className="w-4 h-4" />
                                    </Button>
                                    {po.status !== 'Delivered' && po.status !== 'Cancelled' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => openDeleteModal(po)}
                                            disabled={deletingId === po.id}
                                        >
                                            {deletingId === po.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {purchaseOrders.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No purchase orders found matching your criteria</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={handleRefresh}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} orders
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center px-3 text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ViewModal
                isOpen={isViewModalOpen}
                purchaseOrder={selectedPO}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedPO(null);
                }}
                // ✅ Pass the edit handler that navigates
                onEdit={() => {
                    if (selectedPO) {
                        setIsViewModalOpen(false);
                        navigate(`/procurement/po/${selectedPO.id}/edit`);
                    }
                }}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                purchaseOrder={selectedPO}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedPO(null);
                }}
                isDeleting={deletingId === selectedPO?.id}
            />

            <StatusUpdateModal
                isOpen={isStatusModalOpen}
                purchaseOrder={selectedPO}
                currentStatus={selectedPO?.status || 'Draft'}
                onConfirm={handleStatusUpdateConfirm}
                onCancel={() => {
                    setIsStatusModalOpen(false);
                    setSelectedPO(null);
                }}
                isUpdating={updatingId === selectedPO?.id}
            />
        </motion.div>
    );
};

export default PurchaseOrderList;