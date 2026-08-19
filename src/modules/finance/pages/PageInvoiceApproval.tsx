// src/pages/finance/PageInvoiceApproval.tsx - FULLY FIXED

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FileCheck, RefreshCw, Filter, Search, Eye, CheckCircle, XCircle, Clock,
    DollarSign, Calendar, Building2, FileText, User,
    CreditCard, AlertCircle, Paperclip, Download, Loader2,
    Tag, Users, Briefcase, Building, Calendar as CalendarIcon
} from 'lucide-react';
import { useFinanceDashboard } from '@/modules/finance/hooks/useFinanceDashboard';
import { updateInvoiceStatus } from '@/modules/finance/services/finance.api';
import { getFilesByReference, downloadFileinvoice } from '@/modules/file/services/fileManagement/fileManagementApi';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';

interface InvoiceItem {
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    periodId?: string;
}

interface InvoiceAttachment {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadDate: string;
    uploadedBy: string;
    filePath: string;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceType: 'Purchase' | 'Sales';
    invoiceDate: string;
    dueDate: string;
    vendorId?: string;
    vendorName?: string;
    customerId?: string;
    customerName?: string;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
    status: string;
    approvalStatus?: string;
    notes?: string;
    branchId?: string;
    departmentId?: string;
    dateAdd: string;
    dateMod?: string;
    items?: InvoiceItem[];
    taxAmount?: number;
    subTotal?: number;
    withholdingTax?: number;
    attachments?: InvoiceAttachment[];
    salesRep?: string;
    purchaseOrderId?: string;
    periodId?: string;
    periodName?: string;
}

const PageInvoiceApproval: React.FC = () => {
    // ✅ Use shared data from the hook
    const {
        invoices: allInvoices,
        vendors,
        customers,
        periods,
        isLoading,
        isRefreshing,
        refetchAll,
        loadJournalEntries,
    } = useFinanceDashboard({
        periodStart: new Date(new Date().getFullYear(), 0, 1).toISOString(),
        periodEnd: new Date().toISOString(),
        period: new Date().toISOString().slice(0, 7),
        periodType: 'month',
        fiscalYear: new Date().getFullYear().toString(),
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'Purchase' | 'Sales'>('all');
    const [periodFilter, setPeriodFilter] = useState<string>('all');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [approvalComment, setApprovalComment] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [attachments, setAttachments] = useState<InvoiceAttachment[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);

    // ✅ Memoize filtered invoices
    const filteredInvoices = useMemo(() => {
        const invList = Array.isArray(allInvoices) ? allInvoices : [];

        return invList.filter((invoice: any) => {
            const matchesSearch =
                invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (invoice.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (invoice.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());

            const status = invoice.approvalStatus || invoice.status;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'pending' && (status === 'Pending' || status === 'Pending_Approval' || status === 'Draft')) ||
                (statusFilter === 'approved' && (invoice.status === 'Paid' || status === 'Approved')) ||
                (statusFilter === 'rejected' && (invoice.status === 'Cancelled' || status === 'Rejected'));

            const matchesType = typeFilter === 'all' || invoice.invoiceType === typeFilter;

            const matchesPeriod = periodFilter === 'all' ||
                invoice.periodId === periodFilter ||
                invoice.PeriodId === periodFilter;

            return matchesSearch && matchesStatus && matchesType && matchesPeriod;
        });
    }, [allInvoices, searchTerm, statusFilter, typeFilter, periodFilter]);

    // ✅ Memoize stats
    const stats = useMemo(() => {
        const invList = Array.isArray(allInvoices) ? allInvoices : [];
        const pending = invList.filter(i =>
            i.status === 'Pending' || i.status === 'Draft' || i.approvalStatus === 'Pending'
        ).length;
        const approved = invList.filter(i =>
            i.status === 'Paid' || i.status === 'Approved' || i.approvalStatus === 'Approved'
        ).length;
        const rejected = invList.filter(i =>
            i.status === 'Cancelled' || i.status === 'Rejected' || i.approvalStatus === 'Rejected'
        ).length;
        const purchase = invList.filter(i => i.invoiceType === 'Purchase').length;
        const sales = invList.filter(i => i.invoiceType === 'Sales').length;

        return {
            total: invList.length,
            pending,
            approved,
            rejected,
            purchase,
            sales,
        };
    }, [allInvoices]);

    // ✅ Get vendor/customer names from shared data
    const getVendorName = (vendorId: string): string => {
        if (!vendorId) return 'Unknown Vendor';
        const vendor = vendors?.find((v: any) => v.id?.toLowerCase() === vendorId?.toLowerCase());
        return vendor?.name || vendor?.vendorName || vendor?.displayName || 'Unknown Vendor';
    };

    const getCustomerName = (customerId: string): string => {
        if (!customerId) return 'Unknown Customer';
        const customer = customers?.find((c: any) => c.id?.toLowerCase() === customerId?.toLowerCase());
        return customer?.name || customer?.customerName || customer?.displayName || 'Unknown Customer';
    };

    const getPartyName = (invoice: Invoice | null): string => {
        if (!invoice) return 'N/A';
        if (invoice.invoiceType === 'Purchase') {
            return invoice.vendorName || getVendorName(invoice.vendorId || '') || 'Unknown Vendor';
        } else {
            return invoice.customerName || getCustomerName(invoice.customerId || '') || 'Unknown Customer';
        }
    };

    const getPartyIcon = (invoiceType: string) => {
        if (invoiceType === 'Purchase') {
            return <Building2 className="h-4 w-4 text-blue-500" />;
        } else {
            return <User className="h-4 w-4 text-green-500" />;
        }
    };

    // ✅ Fetch attachments for viewing invoice
    const fetchAttachmentsForInvoice = async (invoiceId: string) => {
        try {
            setLoadingAttachments(true);
            const response = await getFilesByReference('invoice', invoiceId, 'invoice_attachment');
            let attachmentsData = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    attachmentsData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    attachmentsData = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    attachmentsData = response.data.$values;
                }
            }
            setAttachments(attachmentsData);
            return attachmentsData;
        } catch (error) {
            console.error('Error fetching attachments:', error);
            return [];
        } finally {
            setLoadingAttachments(false);
        }
    };

    const handleDownloadAttachment = async (attachment: InvoiceAttachment) => {
        try {
            const blob = await downloadFileinvoice(attachment.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            showToast.error('Failed to download attachment');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
        return '📎';
    };

    const handleApprove = async (invoiceId: string, comment: string) => {
        try {
            await updateInvoiceStatus(invoiceId, 'Paid');
            showToast.success('Invoice approved successfully');
            await refetchAll();
        } catch (error: any) {
            console.error('Error approving invoice:', error);
            showToast.error(error.response?.data?.message || 'Failed to approve invoice');
        }
    };

    const handleReject = async (invoiceId: string, comment: string) => {
        try {
            await updateInvoiceStatus(invoiceId, 'Cancelled');
            showToast.success('Invoice rejected');
            await refetchAll();
        } catch (error: any) {
            console.error('Error rejecting invoice:', error);
            showToast.error(error.response?.data?.message || 'Failed to reject invoice');
        }
    };

    const handleViewClick = async (invoice: Invoice) => {
        setViewingInvoice(invoice);
        setViewModalOpen(true);
        await fetchAttachmentsForInvoice(invoice.id);
    };

    const formatCurrency = (amount: number | undefined | null): string => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return '$0.00';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (invoice: Invoice) => {
        const status = invoice.approvalStatus || invoice.status;
        const colors: Record<string, string> = {
            Approved: 'bg-green-100 text-green-800 border-green-200',
            Paid: 'bg-green-100 text-green-800 border-green-200',
            Rejected: 'bg-red-100 text-red-800 border-red-200',
            Cancelled: 'bg-red-100 text-red-800 border-red-200',
            Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Pending_Approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Draft: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusLabel = (invoice: Invoice) => {
        const status = invoice.approvalStatus || invoice.status;
        const labels: Record<string, string> = {
            Approved: 'Approved',
            Paid: 'Paid',
            Rejected: 'Rejected',
            Cancelled: 'Cancelled',
            Pending: 'Pending',
            Pending_Approval: 'Pending Approval',
            Draft: 'Draft',
        };
        return labels[status] || status;
    };

    const getTypeBadge = (invoiceType: string) => {
        if (invoiceType === 'Purchase') {
            return <Badge className="bg-blue-100 text-blue-700 border-blue-200">AP - Purchase</Badge>;
        } else {
            return <Badge className="bg-green-100 text-green-700 border-green-200">AR - Sales</Badge>;
        }
    };

    const isPending = (invoice: Invoice) => {
        const status = invoice.approvalStatus || invoice.status;
        return status === 'Pending' || status === 'Pending_Approval' || status === 'Draft';
    };

    const handleApproveClick = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setActionType('approve');
        setApprovalComment('');
        setModalOpen(true);
    };

    const handleRejectClick = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setActionType('reject');
        setApprovalComment('');
        setModalOpen(true);
    };

    const handleConfirmAction = () => {
        if (!selectedInvoice) return;

        if (actionType === 'approve') {
            handleApprove(selectedInvoice.id, approvalComment);
        } else {
            if (!approvalComment.trim()) {
                showToast.error('Please provide a reason for rejection');
                return;
            }
            handleReject(selectedInvoice.id, approvalComment);
        }

        setModalOpen(false);
        setSelectedInvoice(null);
        setApprovalComment('');
    };

    const handleRefresh = async () => {
        await refetchAll();
        showToast.success('Data refreshed');
    };

    if (isLoading && allInvoices.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // ... rest of the JSX remains the same (too long to repeat, but all data now comes from props)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header - Use handleRefresh instead of fetchInvoices */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                        <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Invoice Approval</h1>
                        <p className="text-sm text-gray-500">Review and approve purchase and sales invoices</p>
                    </div>
                </div>
                <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isRefreshing}
                >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {/* Stats Cards - Use stats from memo */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700 font-medium">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-gray-200 rounded-lg">
                                <FileCheck className="h-5 w-5 text-gray-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-lg">
                                <Clock className="h-5 w-5 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Approved</p>
                                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Rejected</p>
                                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Purchase (AP)</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.purchase}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Building2 className="h-5 w-5 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Sales (AR)</p>
                                <p className="text-2xl font-bold text-green-900">{stats.sales}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <User className="h-5 w-5 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters - Use filteredInvoices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search by invoice number, vendor, or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="md:w-44">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Periods</SelectItem>
                        {periods?.map((period: any) => (
                            <SelectItem key={period.id} value={period.id}>
                                {period.name} {period.isClosed ? '🔒' : '🔓'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                    <SelectTrigger className="md:w-40">
                        <Tag className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Invoice Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Purchase">Purchase (AP)</SelectItem>
                        <SelectItem value="Sales">Sales (AR)</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Invoice List - Use filteredInvoices */}
            <div className="space-y-3">
                {filteredInvoices.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No invoices to review</p>
                        <p className="text-sm text-gray-400">All invoices have been processed</p>
                    </div>
                ) : (
                    filteredInvoices.map((invoice: any) => (

                        <motion.div
                            key={invoice.id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {invoice.invoiceNumber}
                                            </h3>
                                            {getTypeBadge(invoice.invoiceType)}
                                            <Badge className={getStatusBadge(invoice)}>
                                                {getStatusLabel(invoice)}
                                            </Badge>
                                            {/* ✅ Period Badge */}
                                            {invoice.periodName && (
                                                <Badge variant="outline" className="text-xs">
                                                    {invoice.periodName}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                {getPartyIcon(invoice.invoiceType)}
                                                {getPartyName(invoice)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14}/>
                                                Due: {formatDate(invoice.dueDate)}
                                            </span>
                                            {invoice.balanceDue > 0 && (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <AlertCircle size={14}/>
                                                    Balance: {formatCurrency(invoice.balanceDue)}
                                                </span>
                                            )}
                                            {invoice.attachments && invoice.attachments.length > 0 && (
                                                <span className="flex items-center gap-1 text-blue-600">
                                                    <Paperclip size={14}/>
                                                    {invoice.attachments.length} file(s)
                                                </span>
                                            )}
                                            {invoice.invoiceType === 'Sales' && invoice.salesRep && (
                                                <span className="flex items-center gap-1 text-purple-600">
                                                    <User size={14}/>
                                                    Rep: {invoice.salesRep}
                                                </span>
                                            )}
                                            {invoice.invoiceType === 'Purchase' && invoice.purchaseOrderId && (
                                                <span className="flex items-center gap-1 text-orange-600">
                                                    <FileText size={14}/>
                                                    PO: {invoice.purchaseOrderId}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-indigo-600">
                                            {formatCurrency(invoice.totalAmount)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(invoice.invoiceDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                {invoice.notes && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {invoice.notes}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 flex-wrap">
                                    {isPending(invoice) && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => handleApproveClick(invoice)}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <CheckCircle className="h-4 w-4"/>
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRejectClick(invoice)}
                                                className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
                                            >
                                                <XCircle className="h-4 w-4"/>
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex items-center gap-2"
                                                onClick={() => handleViewClick(invoice)}
                                            >
                                                <Eye className="h-4 w-4"/>
                                                View Details
                                            </Button>
                                        </>
                                    )}
                                    {(invoice.status === 'Paid' || invoice.approvalStatus === 'Approved') && (
                                        <>
                                            <span
                                                className="text-sm text-green-600 font-medium flex items-center gap-2">
                                                <CheckCircle size={16}/>
                                                Approved & Paid
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex items-center gap-2"
                                                onClick={() => handleViewClick(invoice)}
                                            >
                                                <Eye className="h-4 w-4"/>
                                                View Details
                                            </Button>
                                        </>
                                    )}
                                    {(invoice.status === 'Cancelled' || invoice.approvalStatus === 'Rejected') && (
                                        <>
                                            <span className="text-sm text-red-600 font-medium flex items-center gap-2">
                                                <XCircle size={16}/>
                                                Rejected
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex items-center gap-2"
                                                onClick={() => handleViewClick(invoice)}
                                            >
                                                <Eye className="h-4 w-4"/>
                                                View Details
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>


            {/* Approve/Reject Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle
                            className={`flex items-center gap-2 ${actionType === 'approve' ? 'text-green-600' : 'text-red-600'}`}>
                            {actionType === 'approve' ? (
                                <CheckCircle className="h-5 w-5"/>
                            ) : (
                                <XCircle className="h-5 w-5"/>
                            )}
                            {actionType === 'approve' ? 'Approve Invoice' : 'Reject Invoice'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'approve'
                                ? 'Confirm approval of this invoice'
                                : 'Provide a reason for rejection'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                {getTypeBadge(selectedInvoice?.invoiceType || 'Purchase')}
                                <p className="text-sm font-medium text-gray-900">{selectedInvoice?.invoiceNumber}</p>
                            </div>
                            <p className="text-sm text-gray-600">{getPartyName(selectedInvoice)}</p>
                            <p className="text-lg font-bold text-indigo-600">{formatCurrency(selectedInvoice?.totalAmount || 0)}</p>
                            {/* ✅ Period info */}
                            {selectedInvoice?.periodName && (
                                <p className="text-xs text-gray-400">Period: {selectedInvoice.periodName}</p>
                            )}
                        </div>

                        {actionType === 'reject' && (
                            <div>
                                <label className="text-sm font-medium text-gray-700">Reason for Rejection *</label>
                                <Textarea
                                    value={approvalComment}
                                    onChange={(e) => setApprovalComment(e.target.value)}
                                    placeholder="Please provide a reason for rejection..."
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>
                        )}

                        {actionType === 'approve' && (
                            <div>
                                <label className="text-sm font-medium text-gray-700">Comments (Optional)</label>
                                <Textarea
                                    value={approvalComment}
                                    onChange={(e) => setApprovalComment(e.target.value)}
                                    placeholder="Add any comments..."
                                    rows={2}
                                    className="mt-1"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            onClick={handleConfirmAction}
                            disabled={actionType === 'reject' && !approvalComment.trim()}
                        >
                            {actionType === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Invoice Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600"/>
                            Invoice Details
                        </DialogTitle>
                        <DialogDescription>
                            Complete invoice information with attachments
                        </DialogDescription>
                    </DialogHeader>

                    {viewingInvoice && (
                        <div className="space-y-6 py-4">
                            {/* Invoice Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-xl font-bold text-gray-900">{viewingInvoice.invoiceNumber}</h3>
                                        {getTypeBadge(viewingInvoice.invoiceType)}
                                        {/* ✅ Period badge */}
                                        {viewingInvoice.periodName && (
                                            <Badge variant="outline" className="text-xs">
                                                {viewingInvoice.periodName}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <Badge className={getStatusBadge(viewingInvoice)}>
                                            {getStatusLabel(viewingInvoice)}
                                        </Badge>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(viewingInvoice.dateAdd)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {formatCurrency(viewingInvoice.totalAmount)}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200"/>

                            {/* Party Info */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    {getPartyIcon(viewingInvoice.invoiceType)}
                                    {viewingInvoice.invoiceType === 'Purchase' ? 'Vendor' : 'Customer'}
                                </p>
                                <p className="font-medium">{getPartyName(viewingInvoice)}</p>
                                {viewingInvoice.invoiceType === 'Purchase' && viewingInvoice.vendorId && (
                                    <p className="text-xs text-gray-400">ID: {viewingInvoice.vendorId}</p>
                                )}
                                {viewingInvoice.invoiceType === 'Sales' && viewingInvoice.customerId && (
                                    <p className="text-xs text-gray-400">ID: {viewingInvoice.customerId}</p>
                                )}
                                {viewingInvoice.invoiceType === 'Sales' && viewingInvoice.salesRep && (
                                    <p className="text-xs text-gray-400">Sales Rep: {viewingInvoice.salesRep}</p>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Invoice Date</p>
                                    <p className="font-medium">{formatDate(viewingInvoice.invoiceDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Due Date</p>
                                    <p className="font-medium">{formatDate(viewingInvoice.dueDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Status</p>
                                    <Badge className={getStatusBadge(viewingInvoice)}>
                                        {getStatusLabel(viewingInvoice)}
                                    </Badge>
                                </div>
                            </div>

                            {/* ✅ Period Info */}
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                <p className="text-sm text-indigo-700 font-medium flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4"/>
                                    Financial Period
                                </p>
                                <p className="text-indigo-900 font-semibold">
                                    {viewingInvoice.periodName || 'Not Assigned'}
                                </p>
                                {viewingInvoice.periodId && (
                                    <p className="text-xs text-indigo-500">ID: {viewingInvoice.periodId}</p>
                                )}
                            </div>

                            {/* Amounts */}
                            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(viewingInvoice.totalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Paid Amount</p>
                                    <p className="text-lg font-bold text-green-600">{formatCurrency(viewingInvoice.paidAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Balance Due</p>
                                    <p className={`text-lg font-bold ${viewingInvoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(viewingInvoice.balanceDue)}
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            {viewingInvoice.items && viewingInvoice.items.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Invoice Items</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-gray-500 font-medium">Description</th>
                                                <th className="px-3 py-2 text-right text-gray-500 font-medium">Qty</th>
                                                <th className="px-3 py-2 text-right text-gray-500 font-medium">Unit Price</th>
                                                <th className="px-3 py-2 text-right text-gray-500 font-medium">Total</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                            {viewingInvoice.items.map((item, index) => {
                                                const qty = item.quantity || 0;
                                                const price = item.unitPrice || 0;
                                                const itemTotal = item.total || (qty * price);
                                                return (
                                                    <tr key={index}>
                                                        <td className="px-3 py-2">{item.description || 'N/A'}</td>
                                                        <td className="px-3 py-2 text-right">{qty}</td>
                                                        <td className="px-3 py-2 text-right">{formatCurrency(price)}</td>
                                                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(itemTotal)}</td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                            <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan={3} className="px-3 py-2 text-right font-medium">Sub Total:</td>
                                                <td className="px-3 py-2 text-right">{formatCurrency(viewingInvoice.subTotal || viewingInvoice.totalAmount)}</td>
                                            </tr>
                                            {viewingInvoice.taxAmount && viewingInvoice.taxAmount > 0 && (
                                                <tr>
                                                    <td colSpan={3} className="px-3 py-2 text-right font-medium">Tax (15%):</td>
                                                    <td className="px-3 py-2 text-right">{formatCurrency(viewingInvoice.taxAmount)}</td>
                                                </tr>
                                            )}
                                            {(viewingInvoice as any).withholdingTax && (viewingInvoice as any).withholdingTax > 0 && (
                                                <tr className="text-red-600">
                                                    <td colSpan={3} className="px-3 py-2 text-right font-medium">Withholding Tax (2%):</td>
                                                    <td className="px-3 py-2 text-right">-{formatCurrency((viewingInvoice as any).withholdingTax)}</td>
                                                </tr>
                                            )}
                                            <tr>
                                                <td colSpan={3} className="px-3 py-2 text-right font-bold">Total:</td>
                                                <td className="px-3 py-2 text-right font-bold text-indigo-600">
                                                    {formatCurrency(viewingInvoice.totalAmount)}
                                                </td>
                                            </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Attachments Section */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" />
                                        Attachments
                                        {attachments.length > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {attachments.length}
                                            </Badge>
                                        )}
                                    </h4>
                                </div>

                                {loadingAttachments ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                                        <span className="ml-2 text-sm text-gray-500">Loading attachments...</span>
                                    </div>
                                ) : attachments.length > 0 ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <span className="text-xl">{getFileIcon(attachment.fileType)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-700 truncate">
                                                            {attachment.fileName}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {formatFileSize(attachment.fileSize)} • {formatDate(attachment.uploadDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleDownloadAttachment(attachment)}
                                                        className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download size={14} className="text-blue-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                        <Paperclip className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                                        <p className="text-sm text-gray-400">No attachments</p>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {viewingInvoice.notes && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Notes / Comments</p>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-700">{viewingInvoice.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Status Messages */}
                            {viewingInvoice.status === 'Paid' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <p className="text-sm text-green-700">This invoice has been fully paid</p>
                                </div>
                            )}
                            {viewingInvoice.status === 'Cancelled' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    <p className="text-sm text-red-700">This invoice has been cancelled/rejected</p>
                                </div>
                            )}
                            {viewingInvoice.status === 'Pending' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <p className="text-sm text-yellow-700">This invoice is pending approval</p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {viewingInvoice && isPending(viewingInvoice) && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        setViewModalOpen(false);
                                        handleApproveClick(viewingInvoice);
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setViewModalOpen(false);
                                        handleRejectClick(viewingInvoice);
                                    }}
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            </div>
                        )}
                        <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default PageInvoiceApproval;