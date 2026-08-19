// src/pages/procurement/invoices/PaymentProcessing.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    DollarSign,
    Calendar,
    Building2,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    CreditCard,
    Banknote,
    Users,
    FileText,
    ArrowRight,
    Loader2,
    RefreshCw,
    XCircle
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getInvoices,
    updateInvoiceStatus

} from '@/modules/procurement/services/invoice.api';

import type {

    Invoice
} from '@/modules/procurement/services/invoice.api';

// ============================================================
// TYPES
// ============================================================

interface Payment extends Invoice {
    paymentMethod: 'bank_transfer' | 'cheque' | 'credit_card' | 'cash';
    paymentReference: string;
    processedBy: string;
}

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Sent: 'bg-blue-100 text-blue-800 border-blue-200',
    Verified: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Paid: 'bg-purple-100 text-purple-800 border-purple-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <FileText className="w-4 h-4" />,
    Sent: <Clock className="w-4 h-4" />,
    Verified: <CheckCircle className="w-4 h-4" />,
    Approved: <CheckCircle className="w-4 h-4" />,
    Paid: <CheckCircle className="w-4 h-4" />,
    Rejected: <XCircle className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Sent: 'Sent',
    Verified: 'Verified',
    Approved: 'Approved',
    Paid: 'Paid',
    Rejected: 'Rejected',
    Cancelled: 'Cancelled',
};

const paymentMethodIcons: Record<string, React.ReactNode> = {
    bank_transfer: <Banknote className="w-4 h-4" />,
    cheque: <FileText className="w-4 h-4" />,
    credit_card: <CreditCard className="w-4 h-4" />,
    cash: <DollarSign className="w-4 h-4" />,
};

const paymentMethodLabels: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    credit_card: 'Credit Card',
    cash: 'Cash',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const PaymentProcessing = () => {
    const navigate = useNavigate();

    // State
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch payments (invoices ready for payment)
    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            console.log('📡 Fetching payments:', params);
            const data = await getInvoices(params);

            // Filter to show only Approved or Paid invoices for payment processing
            const paymentData = data
                .filter(invoice => ['Approved', 'Paid'].includes(invoice.status))
                .map(invoice => ({
                    ...invoice,
                    paymentMethod: (invoice as any).paymentMethod || 'bank_transfer',
                    paymentReference: (invoice as any).paymentReference || '',
                    processedBy: (invoice as any).processedBy || ''
                })) as Payment[];

            setPayments(paymentData);
            console.log(`✅ Fetched ${paymentData.length} payments`);
        } catch (error: any) {
            console.error('Error fetching payments:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load payments');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filterStatus]);

    // Initial load and filter changes
    useEffect(() => {
        fetchPayments();
    }, [searchTerm, filterStatus]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchPayments();
    };

    // Handle process payment
    const handleProcessPayment = async (id: string) => {
        if (!confirm('Are you sure you want to mark this invoice as Paid?')) return;

        setProcessingId(id);
        try {
            await updateInvoiceStatus({ id, status: 'Paid' });
            showToast.success('Payment processed successfully');
            fetchPayments();
        } catch (error: any) {
            console.error('Error processing payment:', error);
            showToast.error(error?.response?.data?.message || 'Failed to process payment');
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

    const getDaysOverdue = (dueDate: string) => {
        if (!dueDate) return 0;
        const due = new Date(dueDate);
        const now = new Date();
        const diff = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
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

    if (loading && !payments.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading payments...</p>
                </div>
            </div>
        );
    }

    // Calculate total amount for Approved invoices
    const totalApproved = payments
        .filter(p => p.status === 'Approved')
        .reduce((acc, p) => acc + p.totalAmount, 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
                    <p className="text-sm text-gray-500">
                        {payments.length} invoices • Process and track vendor payments
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
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/procurement/payment/create')}
                    >
                        <Banknote className="w-4 h-4 mr-2" />
                        Make Payment
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Invoices</p>
                        <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">Pending Payment</p>
                        <p className="text-2xl font-bold text-yellow-700">
                            {payments.filter(p => p.status === 'Approved').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Paid</p>
                        <p className="text-2xl font-bold text-green-700">
                            {payments.filter(p => p.status === 'Paid').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Total Amount</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(totalApproved)}
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
                    <option value="Approved">Pending Payment</option>
                    <option value="Paid">Paid</option>
                </select>
            </div>

            {/* Payment Cards */}
            {payments.length === 0 ? (
                <div className="text-center py-12">
                    <Banknote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No payments found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'All invoices have been paid'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => {
                        const daysOverdue = getDaysOverdue(payment.dueDate);
                        const isPending = payment.status === 'Approved';
                        const isPaid = payment.status === 'Paid';

                        return (
                            <motion.div
                                key={payment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className={`hover:shadow-lg transition-shadow border-l-4 ${
                                    isPaid ? 'border-l-green-500' :
                                        isPending ? 'border-l-yellow-500' :
                                            'border-l-gray-500'
                                }`}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            {/* Left Side */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {payment.invoiceNumber}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            PO: {payment.purchaseOrderNumber || 'N/A'}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(payment.status)}
                                                    {daysOverdue > 0 && isPending && (
                                                        <Badge className="bg-red-100 text-red-800 border-red-200">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            {daysOverdue}d Overdue
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Vendor</p>
                                                        <p className="font-medium text-gray-900">
                                                            {payment.vendorName || 'Unknown'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Amount</p>
                                                        <p className="font-medium text-gray-900">
                                                            {formatCurrency(payment.totalAmount)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Due Date</p>
                                                        <p className={`font-medium ${daysOverdue > 0 && isPending ? 'text-red-600' : 'text-gray-900'}`}>
                                                            {formatDate(payment.dueDate)}
                                                            {daysOverdue > 0 && isPending && (
                                                                <span className="text-xs ml-1 text-red-500">
                                                                    ({daysOverdue}d overdue)
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Payment Method</p>
                                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                                            {paymentMethodIcons[payment.paymentMethod] || <Banknote className="w-4 h-4" />}
                                                            {paymentMethodLabels[payment.paymentMethod] || 'Bank Transfer'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {payment.notes && (
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        {payment.notes}
                                                    </div>
                                                )}

                                                {isPaid && payment.paidBy && (
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        Paid by: <span className="font-medium text-gray-700">
                                                            {payment.paidBy}
                                                        </span>
                                                        {payment.paidDate && (
                                                            <span className="ml-3">
                                                                on {formatDate(payment.paidDate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Side */}
                                            <div className="flex flex-col gap-2 min-w-[160px]">
                                                {isPending && (
                                                    <>
                                                        <Button
                                                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleProcessPayment(payment.id);
                                                            }}
                                                            disabled={processingId === payment.id}
                                                        >
                                                            {processingId === payment.id ? (
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <Banknote className="w-4 h-4 mr-2" />
                                                            )}
                                                            Mark as Paid
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full text-blue-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/procurement/invoice/payment/${payment.id}/schedule`);
                                                            }}
                                                            disabled={processingId === payment.id}
                                                        >
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            Schedule Payment
                                                        </Button>
                                                    </>
                                                )}

                                                {isPaid && (
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-green-600 border-green-200 bg-green-50"
                                                        disabled
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Paid
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => navigate(`/procurement/invoice/${payment.id}`)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Button>

                                                {isPaid && payment.paymentReference && (
                                                    <div className="text-xs text-gray-400 text-center">
                                                        Ref: {payment.paymentReference}
                                                    </div>
                                                )}
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

export default PaymentProcessing;