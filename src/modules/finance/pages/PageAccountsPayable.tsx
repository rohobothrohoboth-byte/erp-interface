// src/pages/finance/PageAccountsPayable.tsx - FIXED

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, RefreshCw, Search, Filter, DollarSign, FileText, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { useFinanceDashboard } from '@/modules/finance/hooks/useFinanceDashboard';
import { updateInvoiceStatus, createPayment } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import RecordPaymentModal from '@/modules/finance/components/accountsPayable/PaymentEntry/RecordPaymentModal';
import ViewInvoiceDocModal from '@/modules/finance/components/accountsPayable/PaymentEntry/ViewInvoiceDocModal';

interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    vendorId?: string;
    vendorName?: string;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
    status: string;
    approvalStatus?: string;
    notes?: string;
    dateAdd: string;
}

const PageAccountsPayable: React.FC = () => {
    // ✅ Use shared data from the hook
    const {
        invoices,
        vendors,
        isLoading,
        isRefreshing,
        refetchAll
    } = useFinanceDashboard({
        periodStart: new Date(new Date().getFullYear(), 0, 1).toISOString(),
        periodEnd: new Date().toISOString(),
        period: new Date().toISOString().slice(0, 7),
        periodType: 'month',
        fiscalYear: new Date().getFullYear().toString(),
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordingPaymentFor, setRecordingPaymentFor] = useState<Invoice | null>(null);
    const [viewingDocInvoice, setViewingDocInvoice] = useState<{ invoiceNumber: string; documentUrl?: string } | null>(null);
    const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
    const ITEMS_PER_PAGE = 10;

    // ✅ Memoize filtered invoices (only show approved/unpaid)
    const filteredInvoices = useMemo(() => {
        const invList = Array.isArray(invoices) ? invoices : [];

        // Filter out paid and cancelled invoices
        const unpaidInvoices = invList.filter(
            (inv: any) => inv.status !== 'Paid' && inv.status !== 'Cancelled'
        );

        // Apply search and status filters
        return unpaidInvoices.filter((inv: any) => {
            const matchesSearch = inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (inv.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, filterStatus]);

    // ✅ Memoize vendor list
    const vendorList = useMemo(() => {
        return Array.isArray(vendors) ? vendors : [];
    }, [vendors]);

    // Calculate stats
    const stats = useMemo(() => {
        const invList = Array.isArray(invoices) ? invoices : [];
        const unpaid = invList.filter((inv: any) => inv.status !== 'Paid' && inv.status !== 'Cancelled');
        return {
            totalPayables: unpaid.reduce((sum, inv) => sum + (inv.balanceDue || inv.totalAmount || 0), 0),
            pending: unpaid.filter((inv: any) => inv.status === 'Pending').length,
            approved: unpaid.filter((inv: any) => inv.status === 'Approved').length,
            vendorsCount: vendorList.length,
        };
    }, [invoices, vendorList]);

    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleRecordPayment = async (data: {
        invoice_id: string;
        external_bank_ref: string;
        payment_date: string;
        payment_method: 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';
        bank_account_id: string;
        amount_paid: number;
        attachment_url?: string;
    }) => {
        try {
            const invoice = filteredInvoices.find((inv: any) => inv.id === data.invoice_id);
            if (!invoice) {
                showToast.error('Invoice not found');
                return;
            }

            if (data.amount_paid !== invoice.totalAmount) {
                showToast.error(`Payment must match invoice amount: $${invoice.totalAmount.toFixed(2)}`);
                return;
            }

            await createPayment({
                paymentDate: data.payment_date,
                paymentType: 'Supplier',
                paymentMethod: data.payment_method,
                amount: data.amount_paid,
                description: `Payment for ${invoice.invoiceNumber}`,
                invoiceId: invoice.id,
                externalBankRef: data.external_bank_ref,
                bankAccountId: data.bank_account_id,
                attachmentUrl: data.attachment_url,
            });

            await updateInvoiceStatus(invoice.id, 'Paid');

            showToast.success('Payment recorded successfully');
            setRecordingPaymentFor(null);

            // ✅ Refresh data using the hook
            await refetchAll();
        } catch (error: any) {
            console.error('Error recording payment:', error);
            showToast.error(error.response?.data?.message || 'Failed to record payment');
        }
    };

    const handleViewDocument = (invoice: any) => {
        setViewingDocInvoice({
            invoiceNumber: invoice.invoiceNumber,
            documentUrl: undefined,
        });
    };

    const formatCurrency = (amount: number) => {
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

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Approved: 'bg-blue-100 text-blue-800 border-blue-200',
            Paid: 'bg-green-100 text-green-800 border-green-200',
            Cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const handleRefresh = async () => {
        await refetchAll();
        showToast.success('Data refreshed');
    };

    if (isLoading && invoices.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                        <CreditCard className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Accounts Payable - Payment Entry</h1>
                        <p className="text-sm text-gray-500">Record payments for approved invoices</p>
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

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Payables</p>
                    <p className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(stats.totalPayables)}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {stats.pending}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.approved}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Vendors</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.vendorsCount}</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search by invoice number or vendor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No invoices found
                                </td>
                            </tr>
                        ) : (
                            paginatedInvoices.map((invoice: any) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <span className="text-indigo-600 font-medium text-xs">
                                                        {invoice.invoiceNumber?.split('-').pop() || 'N/A'}
                                                    </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{invoice.vendorName || 'Unknown'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.invoiceDate)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                                        {formatCurrency(invoice.totalAmount || 0)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusBadge(invoice.status || 'Pending')}>
                                            {invoice.status || 'Pending'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Popover open={popoverOpen === invoice.id} onOpenChange={(open) => setPopoverOpen(open ? invoice.id : null)}>
                                            <PopoverTrigger asChild>
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-0" align="end">
                                                <div className="py-1">
                                                    {invoice.status !== 'Paid' && (
                                                        <button
                                                            onClick={() => {
                                                                setRecordingPaymentFor(invoice);
                                                                setPopoverOpen(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-indigo-600 flex items-center gap-2"
                                                        >
                                                            <DollarSign size={16} />
                                                            Record Payment
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            handleViewDocument(invoice);
                                                            setPopoverOpen(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                                    >
                                                        <FileText size={16} />
                                                        View Invoice Doc
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredInvoices.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredInvoices.length)} of {filteredInvoices.length}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 py-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <RecordPaymentModal
                isOpen={!!recordingPaymentFor}
                onClose={() => setRecordingPaymentFor(null)}
                invoice={recordingPaymentFor as any}
                onSubmit={handleRecordPayment}
            />

            <ViewInvoiceDocModal
                isOpen={!!viewingDocInvoice}
                onClose={() => setViewingDocInvoice(null)}
                invoiceNumber={viewingDocInvoice?.invoiceNumber || ''}
                documentUrl={viewingDocInvoice?.documentUrl}
            />
        </motion.div>
    );
};

export default PageAccountsPayable;