import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    FileText,
    Calendar,
    DollarSign,
    Building2,
    User,
    Hash,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Send,
    FileCheck,
    Loader2,
    Download,
    Printer,
    Paperclip,
    Eye,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    Package,
    Receipt,
    ExternalLink,
    Copy,
    Check,
    Save,
    X
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { showToast } from '../../../layout/layout';
import {
    getInvoiceById,
    updateInvoiceStatus

} from '../../../services/procurement/invoice.api';

import type{

    Invoice,
    InvoiceLineItem
} from '../../../services/procurement/invoice.api';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Sent: 'bg-blue-100 text-blue-800 border-blue-200',
    Verified: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Paid: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <Clock className="w-4 h-4" />,
    Sent: <Send className="w-4 h-4" />,
    Verified: <CheckCircle className="w-4 h-4" />,
    Approved: <CheckCircle className="w-4 h-4" />,
    Rejected: <XCircle className="w-4 h-4" />,
    Paid: <CheckCircle className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Sent: 'Sent',
    Verified: 'Verified',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Paid: 'Paid',
    Cancelled: 'Cancelled',
};

const statusOrder = ['Draft', 'Sent', 'Verified', 'Approved', 'Paid'];

// ============================================================
// SUB-COMPONENTS
// ============================================================

const StatusTimeline: React.FC<{ currentStatus: string }> = ({ currentStatus }) => {
    const currentIndex = statusOrder.indexOf(currentStatus);

    return (
        <div className="flex items-center gap-2 py-4 overflow-x-auto">
            {statusOrder.map((status, index) => {
                const isCompleted = currentIndex >= index;
                const isCurrent = status === currentStatus;
                const isRejected = currentStatus === 'Rejected' || currentStatus === 'Cancelled';

                return (
                    <React.Fragment key={status}>
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isRejected && (status === 'Rejected' || status === 'Cancelled')
                                        ? 'bg-red-100 text-red-600 border-2 border-red-400'
                                        : isCompleted
                                            ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-400'
                                            : 'bg-gray-100 text-gray-300 border-2 border-gray-200'
                                } ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}
                            >
                                {isRejected && (status === 'Rejected' || status === 'Cancelled') ? (
                                    <XCircle className="w-5 h-5" />
                                ) : isCompleted ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <Clock className="w-5 h-5" />
                                )}
                            </div>
                            <span
                                className={`text-xs text-center ${
                                    isRejected && (status === 'Rejected' || status === 'Cancelled')
                                        ? 'text-red-600 font-medium'
                                        : isCompleted
                                            ? 'text-gray-700 font-medium'
                                            : 'text-gray-400'
                                }`}
                            >
                                {statusLabels[status]}
                            </span>
                        </div>
                        {index < statusOrder.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 ${
                                    isRejected && (status === 'Rejected' || status === 'Cancelled')
                                        ? 'bg-red-400'
                                        : isCompleted
                                            ? 'bg-emerald-400'
                                            : 'bg-gray-200'
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

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

// ============================================================
// MAIN COMPONENT
// ============================================================

const InvoiceDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Fetch invoice
    const fetchInvoice = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await getInvoiceById(id);
            setInvoice(data);
            console.log('✅ Invoice loaded:', data);
        } catch (error: any) {
            console.error('Error fetching invoice:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load invoice');
            navigate('/procurement/invoice');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchInvoice();
    }, [fetchInvoice]);

    // Handle status update
    const handleStatusUpdate = async (status: Invoice['status']) => {
        if (!invoice) return;
        if (!confirm(`Are you sure you want to update this invoice to ${status}?`)) return;

        setProcessing(true);
        try {
            await updateInvoiceStatus({ id: invoice.id, status });
            showToast.success(`Invoice status updated to ${status}`);
            fetchInvoice();
        } catch (error: any) {
            console.error('Error updating status:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Invoice not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/procurement/invoice')}
                >
                    Back to Invoices
                </Button>
            </div>
        );
    }

    const canEdit = invoice.status === 'Draft';
    const canSend = invoice.status === 'Draft';
    const canVerify = invoice.status === 'Sent';
    const canApprove = invoice.status === 'Verified';
    const canPay = invoice.status === 'Approved';
    const canCancel = ['Draft', 'Sent', 'Verified'].includes(invoice.status);

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
                        onClick={() => navigate('/procurement/invoice')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {invoice.invoiceNumber}
                            <Badge className={statusColors[invoice.status] || 'bg-gray-100'}>
                                {statusIcons[invoice.status]}
                                <span className="ml-1">{statusLabels[invoice.status] || invoice.status}</span>
                            </Badge>
                        </h1>
                        <p className="text-sm text-gray-500">
                            PO: {invoice.purchaseOrderNumber || 'N/A'} • {invoice.vendorName || 'Unknown Vendor'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/procurement/invoice/${invoice.id}/edit`)}
                            className="flex items-center gap-1.5 text-blue-600"
                            disabled={processing}
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Button>
                    )}
                    {canSend && (
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStatusUpdate('Sent')}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Send to Vendor
                        </Button>
                    )}
                    {canVerify && (
                        <Button
                            className="bg-yellow-600 hover:bg-yellow-700"
                            onClick={() => handleStatusUpdate('Verified')}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Verify
                        </Button>
                    )}
                    {canApprove && (
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusUpdate('Approved')}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                        </Button>
                    )}
                    {canPay && (
                        <Button
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => handleStatusUpdate('Paid')}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Pay
                        </Button>
                    )}
                    {canCancel && (
                        <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleStatusUpdate('Cancelled')}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Timeline */}
            <Card>
                <CardContent className="p-6">
                    <StatusTimeline currentStatus={invoice.status} />
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3" />
                            Total Amount
                        </p>
                        <p className="text-xl font-bold text-emerald-600">
                            {formatCurrency(invoice.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-400">
                            Net: {formatCurrency(invoice.netAmount)} • Tax: {formatCurrency(invoice.taxAmount)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            Vendor
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {invoice.vendorName || 'N/A'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Invoice Date
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {formatDate(invoice.invoiceDate)}
                        </p>
                        <p className="text-xs text-gray-400">
                            Due: {formatDate(invoice.dueDate)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Receipt className="w-3 h-3" />
                            Attachments
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {invoice.attachmentCount || 0} files
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <InfoItem
                    label="Invoice Number"
                    value={invoice.invoiceNumber}
                    icon={<Hash className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Purchase Order"
                    value={invoice.purchaseOrderNumber || 'N/A'}
                    icon={<Package className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Payment Terms"
                    value={invoice.paymentTerms || 'N/A'}
                    icon={<Clock className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Vendor"
                    value={invoice.vendorName || 'N/A'}
                    icon={<Building2 className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Approved By"
                    value={invoice.approvedBy || 'Pending'}
                    icon={<User className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Received Date"
                    value={invoice.receivedDate ? formatDate(invoice.receivedDate) : 'N/A'}
                    icon={<Calendar className="w-3.5 h-3.5" />}
                />
            </div>

            {/* Notes */}
            {invoice.notes && (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{invoice.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Line Items */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {invoice.lineItems?.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-500 text-center">{index + 1}</td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {item.description || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                        {formatCurrency(item.unitPrice)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                        {item.discount ? formatCurrency(item.discount) : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                        {item.taxAmount ? formatCurrency(item.taxAmount) : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                        {formatCurrency(item.totalAmount)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-semibold">
                            <tr>
                                <td colSpan={5} className="px-4 py-3 text-right text-gray-700">Total</td>
                                <td className="px-4 py-3 text-right text-emerald-600 text-lg">
                                    {formatCurrency(invoice.totalAmount)}
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default InvoiceDetail;