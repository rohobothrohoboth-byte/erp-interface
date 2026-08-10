// src/pages/procurement/invoices/InvoiceList.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    DollarSign,
    Building2,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    Filter,
    Download,
    Receipt,
    User,
    Loader2,
    RefreshCw
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
import type {Invoice} from '@/modules/procurement/services/invoice.api';

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
    Draft: <FileText className="w-4 h-4" />,
    Sent: <Clock className="w-4 h-4" />,
    Verified: <CheckCircle className="w-4 h-4" />,
    Approved: <CheckCircle className="w-4 h-4" />,
    Rejected: <AlertCircle className="w-4 h-4" />,
    Paid: <CheckCircle className="w-4 h-4" />,
    Cancelled: <AlertCircle className="w-4 h-4" />,
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

const InvoiceList = () => {
    const navigate = useNavigate();

    // State
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch invoices
    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            console.log('📡 Fetching invoices with params:', params);
            const data = await getInvoices(params);
            setInvoices(data);
            console.log(`✅ Fetched ${data.length} invoices`);
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

    // Handle status update
    const handleStatusUpdate = async (id: string, status: Invoice['status']) => {
        if (!confirm(`Are you sure you want to update this invoice to ${status}?`)) return;

        setProcessingId(id);
        try {
            await updateInvoiceStatus({ id, status });
            showToast.success(`Invoice status updated to ${status}`);
            fetchInvoices();
        } catch (error: any) {
            console.error('Error updating status:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update status');
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
                    <p className="mt-4 text-gray-600">Loading invoices...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-sm text-gray-500">
                        {invoices.length} invoices • Manage vendor invoices
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
                        onClick={() => navigate('/procurement/invoice/create')}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            {invoices.filter(i => i.status === 'Sent' || i.status === 'Verified').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Approved</p>
                        <p className="text-2xl font-bold text-green-700">
                            {invoices.filter(i => i.status === 'Approved').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-600">Paid</p>
                        <p className="text-2xl font-bold text-purple-700">
                            {invoices.filter(i => i.status === 'Paid').length}
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
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Verified">Verified</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Paid">Paid</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Invoice Cards */}
            {invoices.length === 0 ? (
                <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No invoices found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first invoice'}
                    </p>
                    <Button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/procurement/invoice/create')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {invoices.map((invoice) => {
                        const canVerify = invoice.status === 'Sent';
                        const canApprove = invoice.status === 'Verified';
                        const canPay = invoice.status === 'Approved';
                        const canCancel = invoice.status === 'Draft' || invoice.status === 'Sent' || invoice.status === 'Verified';

                        return (
                            <motion.div
                                key={invoice.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                className="cursor-pointer"
                                onClick={() => navigate(`/procurement/invoice/${invoice.id}`)}
                            >
                                <Card className="h-full hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                    <Receipt className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        PO: {invoice.purchaseOrderNumber || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            {getStatusBadge(invoice.status)}
                                        </div>

                                        <p className="text-sm font-medium text-gray-700 mb-3">
                                            {invoice.title || 'Invoice'}
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Building2 className="w-4 h-4" />
                                                {invoice.vendorName || 'Unknown Vendor'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <DollarSign className="w-4 h-4" />
                                                Total: {formatCurrency(invoice.totalAmount)}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                Invoice: {formatDate(invoice.invoiceDate)}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                Due: {formatDate(invoice.dueDate)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500">Net Amount</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(invoice.netAmount)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500">Tax</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(invoice.taxAmount)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/procurement/invoice/${invoice.id}`);
                                                }}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>

                                            {canVerify && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 text-yellow-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(invoice.id, 'Verified');
                                                    }}
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
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 text-green-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(invoice.id, 'Approved');
                                                    }}
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

                                            {canPay && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 text-purple-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(invoice.id, 'Paid');
                                                    }}
                                                    disabled={processingId === invoice.id}
                                                >
                                                    {processingId === invoice.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                    )}
                                                    Pay
                                                </Button>
                                            )}

                                            {canCancel && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(invoice.id, 'Cancelled');
                                                    }}
                                                    disabled={processingId === invoice.id}
                                                >
                                                    {processingId === invoice.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 mr-2" />
                                                    )}
                                                    Cancel
                                                </Button>
                                            )}
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

export default InvoiceList;