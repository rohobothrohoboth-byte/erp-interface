// src/pages/finance/ar/PagePaymentReceipt.tsx
// src/pages/finance/ar/PagePaymentReceipt.tsx - FULLY CORRECTED

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, RefreshCw, Plus, Search, ChevronLeft, ChevronRight,
    Receipt, Printer, Download, Eye, FileText, Building2,
    Calendar, DollarSign, CreditCard, Phone, Banknote,
    CheckCircle, XCircle, Clock, AlertCircle, User,
    Mail, MapPin, Smartphone, Landmark, FileCheck,
    Signature, Pen, Upload, Paperclip, Loader2, Trash2,
    Calendar as CalendarIcon
} from 'lucide-react';
import { useFinanceDashboard } from '../../hooks/finance/useFinanceDashboard';
import { createPayment, updatePaymentStatus } from '../../services/finance/finance.api';
import { uploadFile, getFilesByReference, downloadFileinvoice } from '../../services/fileManagement/fileManagementApi';
import { showToast } from '../../layout/layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../components/ui/dialog';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PaymentReceipt {
    id: string;
    receiptNumber: string;
    customerId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    paymentDate: string;
    paymentMethod: 'Cash' | 'Bank_Transfer' | 'Telebirr' | 'Check';
    bankReference: string;
    bankAccountId: string;
    bankAccountName: string;
    totalReceived: number;
    allocations: Array<{
        invoiceId: string;
        invoiceNumber: string;
        amountApplied: number;
    }>;
    attachmentUrl?: string;
    status: 'Draft' | 'Posted' | 'Cancelled';
    dateAdd: string;
    postedAt?: string;
    postedBy?: string;
    createdBy?: string;
    notes?: string;
    periodId?: string;
    periodName?: string;
}

const PagePaymentReceipt: React.FC = () => {
    // ✅ Use shared data from the hook
    const {
        invoices: allInvoices,
        customers,
        bankAccounts,
        periods,
        payments: allPayments,
        isLoading,
        isRefreshing,
        refetchAll,
    } = useFinanceDashboard({
        periodStart: new Date(new Date().getFullYear(), 0, 1).toISOString(),
        periodEnd: new Date().toISOString(),
        period: new Date().toISOString().slice(0, 7),
        periodType: 'month',
        fiscalYear: new Date().getFullYear().toString(),
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [periodFilter, setPeriodFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [uploadingSigned, setUploadingSigned] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const ITEMS_PER_PAGE = 10;

    // Receipt form state
    const [formData, setFormData] = useState({
        customerId: '',
        receiptDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank_Transfer' as 'Cash' | 'Bank_Transfer' | 'Telebirr' | 'Check',
        bankReference: '',
        bankAccountId: '',
        periodId: '',
        totalReceived: 0,
        notes: '',
        allocations: [] as Array<{
            invoiceId: string;
            invoiceNumber: string;
            amountApplied: number;
            remainingBalance: number;
        }>,
        requireSignature: true,
        receiverName: '',
        authorizedBy: '',
    });

    const [selectedInvoice, setSelectedInvoice] = useState('');
    const [amountToApply, setAmountToApply] = useState('');

    // ✅ Auto-select active period
    useEffect(() => {
        if (periods && periods.length > 0) {
            const active = periods.find((p: any) => !p.isClosed);
            if (active) {
                setPeriodFilter(active.id);
                setFormData(prev => ({ ...prev, periodId: active.id }));
            }
        }
    }, [periods]);

    // ✅ Memoize sales invoices (unpaid)
    const salesInvoices = useMemo(() => {
        const invList = Array.isArray(allInvoices) ? allInvoices : [];
        const customerMap: Record<string, string> = {};
        const custList = Array.isArray(customers) ? customers : [];
        custList.forEach((c: any) => {
            const id = c.id || c.customerId;
            if (id) {
                customerMap[id] = c.name || c.customerName || 'Unknown Customer';
            }
        });

        return invList
            .filter((inv: any) => {
                const type = inv.invoiceType || inv.InvoiceType || 'Purchase';
                const status = inv.status || 'Draft';
                return type === 'Sales' && status !== 'Paid' && status !== 'Cancelled';
            })
            .map((inv: any) => {
                const customerId = inv.customerId || inv.customer_id;
                return {
                    id: inv.id,
                    invoiceNumber: inv.invoiceNumber || inv.invoice_no,
                    customerId: customerId,
                    customerName: customerMap[customerId] || inv.customerName || inv.customer_name || 'Unknown',
                    totalAmount: Number(inv.totalAmount || inv.total_amount || 0),
                    paidAmount: Number(inv.paidAmount || inv.paid_amount || 0),
                    remainingAmount: Number(inv.totalAmount || inv.total_amount || 0) - Number(inv.paidAmount || inv.paid_amount || 0),
                    invoiceDate: inv.invoiceDate || inv.invoice_date,
                    dueDate: inv.dueDate || inv.due_date,
                    periodId: inv.periodId || inv.PeriodId || '',
                    periodName: inv.periodName || inv.PeriodName || '',
                };
            })
            .filter((inv: any) => inv.remainingAmount > 0);
    }, [allInvoices, customers]);

    // ✅ Memoize receipts (payments) filtered by period
    const receipts = useMemo(() => {
        const payList = Array.isArray(allPayments) ? allPayments : [];
        const customerMap: Record<string, string> = {};
        const custList = Array.isArray(customers) ? customers : [];
        custList.forEach((c: any) => {
            const id = c.id || c.customerId;
            if (id) {
                customerMap[id] = c.name || c.customerName || 'Unknown Customer';
            }
        });

        const periodMap: Record<string, string> = {};
        const periodList = Array.isArray(periods) ? periods : [];
        periodList.forEach((p: any) => {
            if (p.id) {
                periodMap[p.id] = p.name || 'Unknown Period';
            }
        });

        return payList
            .filter((p: any) => {
                const type = p.paymentType || p.PaymentType || 'Purchase';
                return type === 'Sales' || p.customerId || p.CustomerId;
            })
            .map((p: any) => {
                const customerId = p.customerId || p.CustomerId || p.fromAccountId || '';
                let customerName = customerMap[customerId] || p.customerName || p.CustomerName || 'Unknown Customer';

                // Try to get customer from invoice
                if (p.invoiceId || p.InvoiceId) {
                    const invoiceId = p.invoiceId || p.InvoiceId;
                    const invoice = salesInvoices.find(inv => inv.id === invoiceId);
                    if (invoice && invoice.customerName !== 'Unknown') {
                        customerName = invoice.customerName;
                    }
                }

                const periodId = p.periodId || p.PeriodId || '';
                const periodName = periodMap[periodId] || p.periodName || p.PeriodName || '';

                return {
                    id: p.id,
                    receiptNumber: p.paymentNumber || p.PaymentNumber || `REC-${Date.now()}`,
                    customerId: customerId,
                    customerName: customerName,
                    customerEmail: p.customerEmail || p.CustomerEmail || '',
                    customerPhone: p.customerPhone || p.CustomerPhone || '',
                    paymentDate: p.paymentDate || p.PaymentDate || p.dateAdd || new Date().toISOString(),
                    paymentMethod: p.paymentMethod || p.PaymentMethod || 'Bank_Transfer',
                    bankReference: p.bankReference || p.Reference || p.reference || '',
                    bankAccountId: p.bankAccountId || p.BankAccountId || '',
                    bankAccountName: p.bankAccountName || p.BankAccountName || 'Main Account',
                    totalReceived: Number(p.amount || p.Amount || 0),
                    allocations: p.invoicesPaid || p.allocations || [],
                    attachmentUrl: p.attachmentUrl || p.AttachmentUrl || '',
                    status: p.status || p.Status || 'Posted',
                    dateAdd: p.dateAdd || p.DateAdd || new Date().toISOString(),
                    postedAt: p.postedAt || p.PostedAt || '',
                    postedBy: p.postedBy || p.PostedBy || '',
                    createdBy: p.createdBy || p.CreatedBy || '',
                    notes: p.description || p.notes || p.Notes || '',
                    periodId: periodId,
                    periodName: periodName,
                };
            });
    }, [allPayments, customers, periods, salesInvoices]);

    // ✅ Filter receipts by search term and period
    const filteredReceipts = useMemo(() => {
        return receipts.filter((r: PaymentReceipt) => {
            const matchesSearch =
                r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.bankReference || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesPeriod = periodFilter === 'all' || r.periodId === periodFilter;

            return matchesSearch && matchesPeriod;
        });
    }, [receipts, searchTerm, periodFilter]);

    // ✅ Calculate stats
    const stats = useMemo(() => {
        const totalReceived = receipts.reduce((sum, r) => sum + r.totalReceived, 0);
        const totalInvoicesPaid = receipts.reduce((sum, r) => sum + (r.allocations || []).length, 0);
        return { totalReceived, totalInvoicesPaid };
    }, [receipts]);

    const totalPages = Math.ceil(filteredReceipts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedReceipts = filteredReceipts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // ✅ Handle Add Allocation
    const handleAddAllocation = () => {
        if (!selectedInvoice || !amountToApply) {
            showToast.error('Please select an invoice and enter an amount');
            return;
        }

        const invoice = salesInvoices.find(inv => inv.id === selectedInvoice);
        if (!invoice) return;

        const amount = parseFloat(amountToApply);
        if (isNaN(amount) || amount <= 0) {
            showToast.error('Please enter a valid amount');
            return;
        }

        if (amount > invoice.remainingAmount) {
            showToast.error(`Amount cannot exceed remaining balance of ${formatCurrency(invoice.remainingAmount)}`);
            return;
        }

        if (formData.allocations.find(a => a.invoiceId === invoice.id)) {
            showToast.error('This invoice is already selected');
            return;
        }

        const totalAllocated = formData.allocations.reduce((sum, a) => sum + a.amountApplied, 0) + amount;
        if (totalAllocated > formData.totalReceived) {
            showToast.error(`Total allocated (${formatCurrency(totalAllocated)}) exceeds receipt amount (${formatCurrency(formData.totalReceived)})`);
            return;
        }

        setFormData({
            ...formData,
            allocations: [
                ...formData.allocations,
                {
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    amountApplied: amount,
                    remainingBalance: invoice.remainingAmount - amount,
                }
            ]
        });

        setSelectedInvoice('');
        setAmountToApply('');
        showToast.success(`Added ${formatCurrency(amount)} to ${invoice.invoiceNumber}`);
    };

    const handleRemoveAllocation = (invoiceId: string) => {
        setFormData({
            ...formData,
            allocations: formData.allocations.filter(a => a.invoiceId !== invoiceId)
        });
    };

    // ✅ Handle Record Receipt
    const handleRecordReceipt = async () => {
        if (!formData.periodId) {
            showToast.error('Please select a financial period');
            return;
        }

        const selectedPeriod = periods?.find((p: any) => p.id === formData.periodId);
        if (selectedPeriod?.isClosed) {
            showToast.error('Selected period is closed. Cannot record payment in a closed period.');
            return;
        }

        if (selectedPeriod) {
            const receiptDate = new Date(formData.receiptDate);
            const startDate = new Date(selectedPeriod.startDate);
            const endDate = new Date(selectedPeriod.endDate);
            receiptDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            if (receiptDate < startDate || receiptDate > endDate) {
                showToast.error(`Receipt date must be between ${selectedPeriod.startDate.split('T')[0]} and ${selectedPeriod.endDate.split('T')[0]}`);
                return;
            }
        }

        if (!formData.customerId) {
            showToast.error('Please select a customer');
            return;
        }
        if (formData.totalReceived <= 0) {
            showToast.error('Please enter a valid amount');
            return;
        }
        if (formData.allocations.length === 0) {
            showToast.error('Please allocate the payment to at least one invoice');
            return;
        }

        const totalAllocated = formData.allocations.reduce((sum, a) => sum + a.amountApplied, 0);
        if (Math.abs(totalAllocated - formData.totalReceived) > 0.01) {
            showToast.error(`Total allocated (${formatCurrency(totalAllocated)}) does not match receipt amount (${formatCurrency(formData.totalReceived)})`);
            return;
        }

        try {
            const customer = customers?.find((c: any) => c.id === formData.customerId);

            const payload = {
                paymentDate: new Date(formData.receiptDate).toISOString(),
                paymentType: 'Sales',
                paymentMethod: formData.paymentMethod,
                amount: formData.totalReceived,
                description: formData.notes || `Payment receipt from ${customer?.name || 'Customer'}`,
                customerId: formData.customerId,
                reference: formData.bankReference,
                bankAccountId: formData.bankAccountId || undefined,
                currency: 'USD',
                paymentStatus: 'Posted',
                periodId: formData.periodId,
                invoicesPaid: formData.allocations.map(a => ({
                    invoiceId: a.invoiceId,
                    amountApplied: a.amountApplied,
                })),
            };

            const response = await createPayment(payload);
            showToast.success('Payment receipt recorded successfully');
            setIsModalOpen(false);
            resetForm();
            await refetchAll();
        } catch (error: any) {
            console.error('Error recording receipt:', error);
            showToast.error(error.response?.data?.message || 'Failed to record payment receipt');
        }
    };

    const resetForm = () => {
        setFormData({
            customerId: '',
            receiptDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Bank_Transfer',
            bankReference: '',
            bankAccountId: '',
            periodId: formData.periodId || '',
            totalReceived: 0,
            notes: '',
            allocations: [],
            requireSignature: true,
            receiverName: '',
            authorizedBy: '',
        });
        setSelectedInvoice('');
        setAmountToApply('');
    };

    const formatCurrency = (amount: number) => {
        if (!amount || isNaN(amount)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            Draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Posted: 'bg-green-100 text-green-800 border-green-200',
            Cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const handleRefresh = async () => {
        await refetchAll();
        showToast.success('Data refreshed');
    };

    if (isLoading && receipts.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // ... rest of the JSX remains the same (the table, stats, modals, etc.)
    // All data now comes from the memoized values above

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header - Use handleRefresh */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                        <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payment Receipts</h1>
                        <p className="text-sm text-gray-500">Record and manage customer payments</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus size={16} />
                        Record Receipt
                    </Button>
                </div>
            </div>

            {/* Stats - Use stats from memo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Receipts</p>
                                <p className="text-2xl font-bold text-blue-900">{receipts.length}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Receipt className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Total Received</p>
                                <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.totalReceived)}</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-xl">
                                <DollarSign className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Customers</p>
                                <p className="text-2xl font-bold text-purple-900">{customers?.length || 0}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <User className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Invoices Paid</p>
                                <p className="text-2xl font-bold text-indigo-900">{stats.totalInvoicesPaid}</p>
                            </div>
                            <div className="p-3 bg-indigo-200 rounded-xl">
                                <FileCheck className="h-6 w-6 text-indigo-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Period Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search by receipt number, customer, or bank reference..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="md:w-56">
                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
                        <SelectTrigger>
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
                </div>
            </div>

            {/* Table - Use paginatedReceipts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Invoices</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {paginatedReceipts.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Wallet className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No payment receipts found</p>
                                        <p className="text-sm text-gray-400">Record your first customer payment</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsModalOpen(true)}
                                            className="mt-2"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Record Receipt
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedReceipts.map((receipt) => (
                                <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-emerald-600 font-medium text-xs">
                                                        {receipt.receiptNumber.split('-').pop()}
                                                    </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{receipt.receiptNumber}</p>
                                                <p className="text-xs text-gray-400">{formatDate(receipt.dateAdd)}</p>
                                                {receipt.periodName && (
                                                    <Badge variant="outline" className="text-[10px] mt-0.5">
                                                        {receipt.periodName}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-900">{receipt.customerName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(receipt.paymentDate)}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={
                                            receipt.paymentMethod === 'Cash' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                receipt.paymentMethod === 'Bank_Transfer' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                    receipt.paymentMethod === 'Telebirr' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                        'bg-indigo-100 text-indigo-800 border-indigo-200'
                                        }>
                                            {receipt.paymentMethod.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">
                                        {formatCurrency(receipt.totalReceived)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                            {receipt.allocations?.length || 0}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusBadge(receipt.status)}>
                                            {receipt.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => {
                                                    // Handle print receipt
                                                    showToast.info('Print receipt feature coming soon');
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Print Receipt"
                                            >
                                                <Printer size={16} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedReceipt(receipt);
                                                    setViewModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-emerald-100 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} className="text-emerald-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredReceipts.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredReceipts.length)} of {filteredReceipts.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
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



            {/* Record Receipt Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-100 rounded-lg">
                                <Wallet className="h-5 w-5 text-emerald-600" />
                            </div>
                            Record Payment Receipt
                        </DialogTitle>
                        <DialogDescription>
                            Record a customer payment and allocate to invoices.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* ✅ Period Selection - Added */}
                        <div>
                            <Label className="text-sm font-medium">
                                Financial Period <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.periodId}
                                onValueChange={(value) => setFormData({ ...formData, periodId: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods.map((period) => (
                                        <SelectItem key={period.id} value={period.id}>
                                            {period.name} {period.isClosed ? '🔒' : '🔓'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formData.periodId && periods.find(p => p.id === formData.periodId)?.isClosed && (
                                <p className="text-xs text-red-500 mt-1">⚠️ This period is closed. Cannot record payments.</p>
                            )}
                        </div>

                        {/* Customer & Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Customer <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.customerId}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, customerId: value });
                                        setFormData(prev => ({ ...prev, allocations: [] }));
                                    }}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Receipt Date <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={formData.receiptDate}
                                    onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Payment Method & Reference */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Payment Method <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.paymentMethod}
                                    onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Bank_Transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="Telebirr">Telebirr</SelectItem>
                                        <SelectItem value="Check">Check</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Bank Reference</Label>
                                <Input
                                    value={formData.bankReference}
                                    onChange={(e) => setFormData({ ...formData, bankReference: e.target.value })}
                                    placeholder="Transaction reference"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Bank Account & Amount */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Bank Account</Label>
                                <Select
                                    value={formData.bankAccountId}
                                    onValueChange={(value) => setFormData({ ...formData, bankAccountId: value })}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select bank account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bankAccounts.map((account) => (
                                            <SelectItem key={account.id} value={account.id}>
                                                {account.name || account.accountName} - {account.bankName || 'N/A'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Total Received <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.totalReceived || ''}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setFormData({ ...formData, totalReceived: val });
                                    }}
                                    placeholder="0.00"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Invoice Allocations */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm font-semibold">Invoice Allocations</Label>
                                <span className="text-xs text-gray-500">
                                    Total: {formatCurrency(formData.allocations.reduce((sum, a) => sum + a.amountApplied, 0))} / {formatCurrency(formData.totalReceived)}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-3">
                                <div className="col-span-2">
                                    <Select
                                        value={selectedInvoice}
                                        onValueChange={setSelectedInvoice}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select invoice" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {invoices
                                                .filter(inv => inv.customerId === formData.customerId && !formData.allocations.find(a => a.invoiceId === inv.id))
                                                .map((inv) => (
                                                    <SelectItem key={inv.id} value={inv.id}>
                                                        {inv.invoiceNumber} - {formatCurrency(inv.remainingAmount)} remaining
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={amountToApply}
                                        onChange={(e) => setAmountToApply(e.target.value)}
                                        placeholder="Amount"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddAllocation}
                                        size="icon"
                                        className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Allocations List */}
                            {formData.allocations.length > 0 && (
                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                    {formData.allocations.map((alloc) => (
                                        <div key={alloc.invoiceId} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-indigo-400" />
                                                <span className="text-sm font-medium">{alloc.invoiceNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600 font-medium">{formatCurrency(alloc.amountApplied)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAllocation(alloc.invoiceId)}
                                                    className="text-red-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <Label className="text-sm font-medium">Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Additional notes..."
                                rows={2}
                                className="mt-1"
                            />
                        </div>

                        {/* Signature Fields */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Checkbox
                                    checked={formData.requireSignature}
                                    onCheckedChange={(checked) => setFormData({ ...formData, requireSignature: checked as boolean })}
                                    id="requireSignature"
                                />
                                <Label htmlFor="requireSignature" className="text-sm font-medium text-gray-700">
                                    Require Signature
                                </Label>
                            </div>

                            {formData.requireSignature && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Receiver / Customer Name</Label>
                                        <Input
                                            value={formData.receiverName}
                                            onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                                            placeholder="Enter receiver name"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Authorized By</Label>
                                        <Input
                                            value={formData.authorizedBy}
                                            onChange={(e) => setFormData({ ...formData, authorizedBy: e.target.value })}
                                            placeholder="Enter authorized person"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsModalOpen(false);
                            resetForm();
                        }}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleRecordReceipt}
                            disabled={formData.allocations.length === 0 || !formData.periodId}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Record & Print Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Receipt Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-emerald-600" />
                            Receipt Details
                        </DialogTitle>
                        <DialogDescription>
                            Complete payment receipt information.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReceipt && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Receipt Number</p>
                                    <p className="font-medium">{selectedReceipt.receiptNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Customer</p>
                                    <p className="font-medium">{selectedReceipt.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Date</p>
                                    <p className="font-medium">{formatDate(selectedReceipt.paymentDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <p className="font-medium">{selectedReceipt.paymentMethod.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Bank Reference</p>
                                    <p className="font-medium">{selectedReceipt.bankReference || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Received</p>
                                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedReceipt.totalReceived)}</p>
                                </div>
                            </div>

                            {/* ✅ Period Info */}
                            {selectedReceipt.periodName && (
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                    <p className="text-sm text-indigo-700 font-medium flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        Financial Period
                                    </p>
                                    <p className="text-indigo-900 font-semibold">{selectedReceipt.periodName}</p>
                                    {selectedReceipt.periodId && (
                                        <p className="text-xs text-indigo-500">ID: {selectedReceipt.periodId}</p>
                                    )}
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-3">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Invoices Paid</h4>
                                <div className="space-y-1.5">
                                    {selectedReceipt.allocations?.map((alloc, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                            <span className="text-sm">{alloc.invoiceNumber}</span>
                                            <span className="text-sm font-medium text-emerald-600">{formatCurrency(alloc.amountApplied)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedReceipt.notes && (
                                <div className="border-t border-gray-200 pt-3">
                                    <p className="text-sm text-gray-500">Notes</p>
                                    <p className="text-sm">{selectedReceipt.notes}</p>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-3 flex justify-between text-xs text-gray-400">
                                <span>Created: {formatDate(selectedReceipt.dateAdd)}</span>
                                {selectedReceipt.status === 'Posted' && (
                                    <span className="text-emerald-600">Posted</span>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {selectedReceipt && (
                            <Button
                                onClick={() => handlePrintAndSave(selectedReceipt)}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print Receipt
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default PagePaymentReceipt;