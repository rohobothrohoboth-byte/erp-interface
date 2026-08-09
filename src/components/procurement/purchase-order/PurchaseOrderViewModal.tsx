// src/components/procurement/purchase-order/PurchaseOrderViewModal.tsx

import React, { useState } from 'react';
import {
    X,
    Edit,
    FileText,
    Building2,
    Calendar,
    DollarSign,
    Truck,
    Package,
    CheckCircle,
    Clock,
    Printer,
    Send,
    AlertCircle,
    User,
    Hash,
    XCircle,
    CreditCard,
    MapPin,
    FileCheck,
    Loader2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { showToast } from '../../../layout/layout';
import { updatePurchaseOrderStatus } from '../../../services/procurement/purchaseOrder.api';
import type { PurchaseOrder } from '../../../types/procurement/purchaseOrder.types';

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

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <Edit className="w-3 h-3" />,
    Sent: <Send className="w-3 h-3" />,
    Pending: <Clock className="w-3 h-3" />,
    Confirmed: <CheckCircle className="w-3 h-3" />,
    Approved: <CheckCircle className="w-3 h-3" />,
    Shipped: <Truck className="w-3 h-3" />,
    Delivered: <Package className="w-3 h-3" />,
    Cancelled: <X className="w-3 h-3" />,
    Rejected: <X className="w-3 h-3" />,
    PartiallyReceived: <Package className="w-3 h-3" />,
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Sent: 'Sent',
    Pending: 'Pending Approval',
    Confirmed: 'Confirmed',
    Approved: 'Approved',
    Shipped: 'Shipped',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    Rejected: 'Rejected',
    PartiallyReceived: 'Partially Received',
};

const statusOrder = ['Draft', 'Sent', 'Pending', 'Confirmed', 'Approved', 'Shipped', 'PartiallyReceived', 'Delivered', 'Cancelled'];

// ============================================================
// INTERFACE
// ============================================================

interface PurchaseOrderViewModalProps {
    isOpen: boolean;
    purchaseOrder: PurchaseOrder | null;
    onClose: () => void;
    onEdit: () => void;
    onPrint?: () => void;
    onStatusChange?: () => void;  // ✅ Callback when status changes
    isApprovalMode?: boolean;      // ✅ Show Approve/Reject buttons
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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

const formatShortDate = (dateString: string) => {
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

// ============================================================
// SUB-COMPONENTS
// ============================================================

const InfoItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({
                                                                                                   label,
                                                                                                   value,
                                                                                                   icon
                                                                                               }) => (
    <div className="space-y-1">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
            {icon}
            {label}
        </p>
        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
);

const StatusTimeline: React.FC<{ currentStatus: string }> = ({ currentStatus }) => {
    const currentIndex = statusOrder.indexOf(currentStatus);

    return (
        <div className="flex items-center gap-2 py-2 overflow-x-auto">
            {statusOrder.map((status, index) => {
                const isCompleted = currentIndex >= index;
                const isCurrent = status === currentStatus;

                return (
                    <React.Fragment key={status}>
                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    isCompleted
                                        ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-400'
                                        : 'bg-gray-100 text-gray-300 border-2 border-gray-200'
                                } ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}
                            >
                                {isCompleted ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    <Clock className="w-4 h-4" />
                                )}
                            </div>
                            <span
                                className={`text-[10px] text-center ${
                                    isCompleted ? 'text-gray-700 font-medium' : 'text-gray-400'
                                }`}
                            >
                                {statusLabels[status]}
                            </span>
                        </div>
                        {index < statusOrder.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 ${
                                    isCompleted ? 'bg-emerald-400' : 'bg-gray-200'
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const PurchaseOrderViewModal: React.FC<PurchaseOrderViewModalProps> = ({
                                                                                  isOpen,
                                                                                  purchaseOrder,
                                                                                  onClose,
                                                                                  onEdit,
                                                                                  onPrint,
                                                                                  onStatusChange,
                                                                                  isApprovalMode = false,
                                                                              }) => {
    const [processing, setProcessing] = useState(false);

    if (!isOpen || !purchaseOrder) return null;

    const isEditable = purchaseOrder.status === 'Draft';
    const isPendingApproval = purchaseOrder.status === 'Sent' || purchaseOrder.status === 'Pending';
    const isApproved = purchaseOrder.status === 'Confirmed' || purchaseOrder.status === 'Approved';
    const isRejected = purchaseOrder.status === 'Cancelled' || purchaseOrder.status === 'Rejected';

    const handleApprove = async () => {
        setProcessing(true);
        try {
            await updatePurchaseOrderStatus(purchaseOrder.id, { status: 'Confirmed' });
            showToast.success('Purchase order approved successfully');
            if (onStatusChange) onStatusChange();
            onClose();
        } catch (error: any) {
            console.error('Error approving:', error);
            showToast.error(error?.response?.data?.message || 'Failed to approve purchase order');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        setProcessing(true);
        try {
            await updatePurchaseOrderStatus(purchaseOrder.id, { status: 'Cancelled' });
            showToast.success('Purchase order rejected successfully');
            if (onStatusChange) onStatusChange();
            onClose();
        } catch (error: any) {
            console.error('Error rejecting:', error);
            showToast.error(error?.response?.data?.message || 'Failed to reject purchase order');
        } finally {
            setProcessing(false);
        }
    };

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden mx-4">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                {purchaseOrder.purchaseOrderNumber}
                                <Badge className={statusColors[purchaseOrder.status] || 'bg-gray-100'}>
                                    {statusIcons[purchaseOrder.status]}
                                    <span className="ml-1">{statusLabels[purchaseOrder.status] || purchaseOrder.status}</span>
                                </Badge>
                            </h2>
                            <p className="text-sm text-gray-500">{purchaseOrder.description || 'No description'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="flex items-center gap-1.5"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Print</span>
                        </Button>
                        {isEditable && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onEdit}
                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                            >
                                <Edit className="w-4 h-4" />
                                <span className="hidden sm:inline">Edit</span>
                            </Button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)] space-y-6">
                    {/* Status Timeline */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <StatusTimeline currentStatus={purchaseOrder.status} />
                    </div>

                    {/* ✅ Approval Actions - Show when in approval mode */}
                    {isApprovalMode && isPendingApproval && (
                        <div className="flex gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Pending Approval
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    This purchase order is waiting for your approval.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={handleApprove}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleReject}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <XCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Reject
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ✅ Approval Status - Show when already approved/rejected */}
                    {isApprovalMode && isApproved && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-800">Approved</p>
                                <p className="text-xs text-green-600">This purchase order has been approved.</p>
                            </div>
                        </div>
                    )}

                    {isApprovalMode && isRejected && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <div>
                                <p className="text-sm font-medium text-red-800">Rejected</p>
                                <p className="text-xs text-red-600">This purchase order has been rejected.</p>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <DollarSign className="w-3 h-3" />
                                    Total Amount
                                </p>
                                <p className="text-xl font-bold text-emerald-600">
                                    {formatCurrency(purchaseOrder.totalAmount)}
                                </p>
                                <p className="text-xs text-gray-400">{purchaseOrder.currency || 'USD'}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <Package className="w-3 h-3" />
                                    Items
                                </p>
                                <p className="text-xl font-bold text-gray-900">
                                    {purchaseOrder.lines?.length || 0}
                                </p>
                                <p className="text-xs text-gray-400">Line items</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    Order Date
                                </p>
                                <p className="text-lg font-medium text-gray-900">
                                    {formatShortDate(purchaseOrder.orderDate)}
                                </p>
                                <p className="text-xs text-gray-400">Date created</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <User className="w-3 h-3" />
                                    Created By
                                </p>
                                <p className="text-lg font-medium text-gray-900">
                                    {purchaseOrder.createdByUserName || 'System'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formatDate(purchaseOrder.dateAdd)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <InfoItem
                            label="Vendor"
                            value={
                                <div>
                                    <span className="font-medium">{purchaseOrder.vendorName || 'Unknown'}</span>
                                    {purchaseOrder.vendorId && (
                                        <span className="text-xs text-gray-400 block mt-0.5">
                                            ID: {purchaseOrder.vendorId.substring(0, 8)}
                                        </span>
                                    )}
                                </div>
                            }
                            icon={<Building2 className="w-3.5 h-3.5" />}
                        />
                        <InfoItem
                            label="Payment Terms"
                            value={purchaseOrder.paymentTerms}
                            icon={<CreditCard className="w-3.5 h-3.5" />}
                        />
                        <InfoItem
                            label="Expected Delivery"
                            value={purchaseOrder.expectedDeliveryDate ? formatShortDate(purchaseOrder.expectedDeliveryDate) : 'N/A'}
                            icon={<Truck className="w-3.5 h-3.5" />}
                        />
                        <InfoItem
                            label="Period"
                            value={purchaseOrder.periodName || 'N/A'}
                            icon={<Calendar className="w-3.5 h-3.5" />}
                        />
                        <InfoItem
                            label="Requisition"
                            value={purchaseOrder.requisitionNumber || 'N/A'}
                            icon={<FileCheck className="w-3.5 h-3.5" />}
                        />
                        <InfoItem
                            label="Shipping Address"
                            value={purchaseOrder.shippingAddress || 'N/A'}
                            icon={<MapPin className="w-3.5 h-3.5" />}
                        />
                    </div>

                    {/* Description */}
                    {purchaseOrder.description && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 font-medium mb-1">Description</p>
                            <p className="text-sm text-gray-700">{purchaseOrder.description}</p>
                        </div>
                    )}

                    {/* Line Items Table */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Line Items</h3>
                            <span className="text-sm text-gray-500">
                                {purchaseOrder.lines?.length || 0} items
                            </span>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Unit Price
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tax %
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {purchaseOrder.lines?.map((line, index) => (
                                    <tr key={line.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-500 text-center">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            <div>
                                                <span>{line.description}</span>
                                                {line.unitOfMeasure && (
                                                    <span className="text-xs text-gray-400 ml-2">
                                                            ({line.unitOfMeasure})
                                                        </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {line.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600">
                                            {formatCurrency(line.unitPrice)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600">
                                            {line.taxRate || 0}%
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                            {formatCurrency(line.totalAmount)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-semibold">
                                <tr>
                                    <td colSpan={5} className="px-4 py-3 text-right text-gray-700">
                                        Total
                                    </td>
                                    <td className="px-4 py-3 text-right text-emerald-600 text-lg">
                                        {formatCurrency(purchaseOrder.totalAmount)}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Audit Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
                        <div className="space-y-1">
                            <p className="font-medium text-gray-700">Created</p>
                            <p>{formatDate(purchaseOrder.dateAdd)}</p>
                            <p>By: {purchaseOrder.createdByUserName || 'System'}</p>
                        </div>
                        {purchaseOrder.dateMod && (
                            <div className="space-y-1">
                                <p className="font-medium text-gray-700">Last Modified</p>
                                <p>{formatDate(purchaseOrder.dateMod)}</p>
                                {purchaseOrder.updatedByUserName && (
                                    <p>By: {purchaseOrder.updatedByUserName}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Status: </span>
                        <Badge className={statusColors[purchaseOrder.status] || 'bg-gray-100'}>
                            {statusIcons[purchaseOrder.status]}
                            <span className="ml-1">{statusLabels[purchaseOrder.status] || purchaseOrder.status}</span>
                        </Badge>
                        {purchaseOrder.rowVersion && (
                            <span className="text-xs text-gray-400 ml-2">
                                v{purchaseOrder.rowVersion.substring(0, 8)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {isEditable && (
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={onEdit}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit PO
                            </Button>
                        )}
                        {isApprovalMode && isPendingApproval && (
                            <>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={handleApprove}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={handleReject}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <XCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Reject
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderViewModal;