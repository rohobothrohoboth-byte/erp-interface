import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    FileText,
    Calendar,
    DollarSign,
    Building2,
    Download,
    Eye,
    AlertCircle,
    Clock,
    User,
    MessageSquare,
    Loader2,
    RefreshCw,
    Filter,
    Search
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { showToast } from '../../../layout/layout';
import {
    getInvoices,
    updateInvoiceStatus

} from '../../../services/procurement/invoice.api';

import type{

    Invoice
} from '../../../services/procurement/invoice.api';

// ============================================================
// TYPES
// ============================================================

interface VerificationItem extends Invoice {
    discrepancies: string[];
    verificationDate: string;
    comments: string;
}

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Sent: 'bg-blue-100 text-blue-800 border-blue-200',
    Verified: 'bg-green-100 text-green-800 border-green-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Paid: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <FileText className="w-4 h-4" />,
    Sent: <Clock className="w-4 h-4" />,
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

// ============================================================
// MAIN COMPONENT
// ============================================================

const InvoiceVerification = () => {
    const navigate = useNavigate();

    // State
    const [invoices, setInvoices] = useState<VerificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch invoices for verification
    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            console.log('📡 Fetching invoices for verification:', params);
            const data = await getInvoices(params);

            // Map to verification items with mock discrepancies (to be replaced with real data)
            const verificationData: VerificationItem[] = data.map(invoice => ({
                ...invoice,
                discrepancies: invoice.status === 'Sent' ? ['Pending verification'] : [],
                verificationDate: invoice.approvedDate || '',
                comments: invoice.notes || ''
            }));

            setInvoices(verificationData);
            console.log(`✅ Fetched ${data.length} invoices for verification`);
        } catch (error: any) {
            console.error('Error fetching invoices:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load invoices');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filterStatus]);

    // Initial load and filter changes
    useEffect(() => {
        fetchInvoices();
    }, [searchTerm, filterStatus]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchInvoices();
    };

    // Handle verify
    const handleVerify = async (id: string) => {
        if (!confirm('Are you sure you want to verify this invoice?')) return;

        setProcessingId(id);
        try {
            await updateInvoiceStatus({ id, status: 'Verified' });
            showToast.success('Invoice verified successfully');
            fetchInvoices();
        } catch (error: any) {
            console.error('Error verifying invoice:', error);
            showToast.error(error?.response?.data?.message || 'Failed to verify invoice');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle approve
    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this invoice?')) return;

        setProcessingId(id);
        try {
            await updateInvoiceStatus({ id, status: 'Approved' });
            showToast.success('Invoice approved successfully');
            fetchInvoices();
        } catch (error: any) {
            console.error('Error approving invoice:', error);
            showToast.error(error?.response?.data?.message || 'Failed to approve invoice');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle reject
    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this invoice?')) return;

        setProcessingId(id);
        try {
            await updateInvoiceStatus({ id, status: 'Rejected' });
            showToast.success('Invoice rejected');
            fetchInvoices();
        } catch (error: any) {
            console.error('Error rejecting invoice:', error);
            showToast.error(error?.response?.data?.message || 'Failed to reject invoice');
        } finally {
            setProcessingId(null);
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

    if (loading && !invoices.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading invoices for verification...</p>
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
                        onClick={() => navigate('/procurement/invoice')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Invoice Verification</h1>
                        <p className="text-sm text-gray-500">
                            {invoices.length} invoices • Verify against PO and GRN
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Invoices</p>
                        <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-700">
                            {invoices.filter(i => i.status === 'Sent').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Verified</p>
                        <p className="text-2xl font-bold text-green-700">
                            {invoices.filter(i => i.status === 'Verified').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-red-600">Rejected</p>
                        <p className="text-2xl font-bold text-red-700">
                            {invoices.filter(i => i.status === 'Rejected').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by invoice number, PO, or vendor..."
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
                    <option value="Sent">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            {/* Verification Cards */}
            {invoices.length === 0 ? (
                <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No invoices pending verification</p>
                    <p className="text-sm text-gray-400 mt-1">
                        All invoices have been verified
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {invoices.map((invoice) => {
                        const canVerify = invoice.status === 'Sent';
                        const canApprove = invoice.status === 'Verified';
                        const canReject = invoice.status === 'Sent' || invoice.status === 'Verified';

                        return (
                            <motion.div
                                key={invoice.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className={`hover:shadow-lg transition-shadow border-l-4 ${
                                    invoice.status === 'Verified' || invoice.status === 'Approved'
                                        ? 'border-l-green-500' :
                                        invoice.status === 'Rejected'
                                            ? 'border-l-red-500' :
                                            'border-l-yellow-500'
                                }`}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                            {/* Left Side */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <FileText className="w-5 h-5 text-emerald-600" />
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {invoice.invoiceNumber}
                                                    </h3>
                                                    {getStatusBadge(invoice.status)}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                                                    <div>
                                                        <p className="text-gray-500">PO Number</p>
                                                        <p className="font-medium text-gray-900">
                                                            {invoice.purchaseOrderNumber || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Vendor</p>
                                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                                            <Building2 className="w-4 h-4" />
                                                            {invoice.vendorName || 'Unknown'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Total Amount</p>
                                                        <p className="font-medium text-gray-900">
                                                            {formatCurrency(invoice.totalAmount)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Invoice Date</p>
                                                        <p className="font-medium text-gray-900">
                                                            {formatDate(invoice.invoiceDate)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Due Date</p>
                                                        <p className="font-medium text-gray-900">
                                                            {formatDate(invoice.dueDate)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Received Date</p>
                                                        <p className="font-medium text-gray-900">
                                                            {invoice.receivedDate ? formatDate(invoice.receivedDate) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {invoice.notes && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-600 flex items-start gap-2">
                                                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                                                            {invoice.notes}
                                                        </p>
                                                    </div>
                                                )}

                                                {invoice.approvedBy && (
                                                    <div className="mt-3 text-sm text-gray-500 flex items-center gap-4">
                                                        <span>
                                                            Verified by: <span className="font-medium text-gray-700">
                                                                {invoice.approvedBy}
                                                            </span>
                                                        </span>
                                                        {invoice.approvedDate && (
                                                            <span>
                                                                Date: <span className="font-medium text-gray-700">
                                                                    {formatDate(invoice.approvedDate)}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Side - Actions */}
                                            <div className="flex flex-col gap-2 min-w-[180px]">
                                                {canVerify && (
                                                    <Button
                                                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                                                        onClick={() => handleVerify(invoice.id)}
                                                        disabled={processingId === invoice.id}
                                                    >
                                                        {processingId === invoice.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                        )}
                                                        Verify
                                                    </Button>
                                                )}

                                                {canApprove && (
                                                    <Button
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApprove(invoice.id)}
                                                        disabled={processingId === invoice.id}
                                                    >
                                                        {processingId === invoice.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                        )}
                                                        Approve
                                                    </Button>
                                                )}

                                                {canReject && (
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                                        onClick={() => handleReject(invoice.id)}
                                                        disabled={processingId === invoice.id}
                                                    >
                                                        {processingId === invoice.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                        )}
                                                        Reject
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => navigate(`/procurement/invoice/${invoice.id}`)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default InvoiceVerification;