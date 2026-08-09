// src/pages/finance/portal/PaymentTracking.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, DollarSign,
    AlertCircle, CheckCircle, Clock, X, Calendar,
    Truck, Users, Building2, FileText, Send,
    TrendingUp, TrendingDown, Activity, Shield,
    Wallet, Banknote, ArrowRight, ArrowLeft, Copy
} from 'lucide-react';
import { useReportExport } from '../../../hooks/useReportExport';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';
import {
    getPortalPayments,
    updatePaymentStatus,
} from '../../../services/finance/finance.api';

interface PortalPayment {
    id: string;
    paymentId: string;
    invoiceId: string;
    invoiceNumber: string;
    vendorId: string;
    vendorName: string;
    vendorCode: string;
    amount: number;
    currency: string;
    paymentDate: string;
    paymentMethod: 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Check' | 'Digital Wallet' | 'Other';
    status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled' | 'Refunded';
    reference: string;
    transactionId: string;
    bankName: string;
    accountNumber: string;
    notes: string;
    processedBy: string;
    processedDate: string;
    completedDate: string;
    failureReason: string;
    createdAt: string;
    updatedAt: string;
    rowVersion?: string;
}

interface PaymentStats {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    refunded: number;
    totalAmount: number;
    completedAmount: number;
    pendingAmount: number;
    avgProcessingTime: number;
    totalVendors: number;
}

const PaymentTracking: React.FC = () => {
    const [items, setItems] = useState<PortalPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterMethod, setFilterMethod] = useState('All');
    const [filterVendor, setFilterVendor] = useState('All');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<PortalPayment | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateStatus, setUpdateStatus] = useState('');

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('portal-payments');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (dateRange.from) params.fromDate = dateRange.from;
            if (dateRange.to) params.toDate = dateRange.to;
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterMethod !== 'All') params.method = filterMethod;
            if (filterVendor !== 'All') params.vendorId = filterVendor;
            if (searchTerm) params.search = searchTerm;

            const response = await getPortalPayments(params);

            let data: PortalPayment[] = [];
            if (response?.data) {
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                }
            }
            setItems(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            showToast.error('Failed to load payments');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [dateRange, filterStatus, filterMethod, filterVendor, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): PaymentStats => {
        const filtered = items;
        const pending = filtered.filter(c => c.status === 'Pending').length;
        const processing = filtered.filter(c => c.status === 'Processing').length;
        const completed = filtered.filter(c => c.status === 'Completed').length;
        const failed = filtered.filter(c => c.status === 'Failed').length;
        const cancelled = filtered.filter(c => c.status === 'Cancelled').length;
        const refunded = filtered.filter(c => c.status === 'Refunded').length;
        const totalAmount = filtered.reduce((sum, c) => sum + (c.amount || 0), 0);
        const completedAmount = filtered.filter(c => c.status === 'Completed').reduce((sum, c) => sum + (c.amount || 0), 0);
        const pendingAmount = filtered.filter(c => c.status === 'Pending' || c.status === 'Processing').reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalVendors = new Set(filtered.map(c => c.vendorId)).size;

        return {
            total: filtered.length,
            pending,
            processing,
            completed,
            failed,
            cancelled,
            refunded,
            totalAmount,
            completedAmount,
            pendingAmount,
            avgProcessingTime: 3.5,
            totalVendors,
        };
    };

    const stats = getStats();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            notation: 'compact',
            compactDisplay: 'short',
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Processing: 'bg-blue-100 text-blue-700 border-blue-200',
            Completed: 'bg-green-100 text-green-700 border-green-200',
            Failed: 'bg-red-100 text-red-700 border-red-200',
            Cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
            Refunded: 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getMethodColor = (method: string) => {
        const colors: Record<string, string> = {
            'Bank Transfer': 'bg-blue-100 text-blue-700 border-blue-200',
            'Credit Card': 'bg-purple-100 text-purple-700 border-purple-200',
            Cash: 'bg-green-100 text-green-700 border-green-200',
            Check: 'bg-orange-100 text-orange-700 border-orange-200',
            'Digital Wallet': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            Other: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[method] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.paymentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesMethod = filterMethod === 'All' || item.paymentMethod === filterMethod;
        const matchesVendor = filterVendor === 'All' || item.vendorId === filterVendor;
        return matchesSearch && matchesStatus && matchesMethod && matchesVendor;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const vendors = [...new Set(items.map(c => c.vendorId).filter(Boolean))];
    const methods = [...new Set(items.map(c => c.paymentMethod).filter(Boolean))];

    const handleView = (item: PortalPayment) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedItem || !updateStatus) return;

        try {
            setIsUpdating(true);
            await updatePaymentStatus(selectedItem.id, { status: updateStatus });
            showToast.success(`Payment status updated to ${updateStatus}`);
            await fetchData();
            setIsUpdateModalOpen(false);
            setUpdateStatus('');
            setSelectedItem(null);
        } catch (error: any) {
            console.error('Error updating payment status:', error);
            showToast.error(error.response?.data?.message || 'Failed to update payment status');
        } finally {
            setIsUpdating(false);
        }
    };

    const openUpdateModal = (item: PortalPayment) => {
        setSelectedItem(item);
        setUpdateStatus(item.status);
        setIsUpdateModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <CreditCard className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
                        <p className="text-sm text-gray-500">Track and manage vendor payments</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => handleRefresh(fetchData)}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={exporting}
                    >
                        <Download size={16} />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport({ payments: filteredItems, stats })}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Total Payments</p>
                                <p className="text-2xl font-bold text-emerald-900">{stats.total}</p>
                                <p className="text-xs text-emerald-600 mt-1">{stats.completed} completed</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-xl">
                                <CreditCard className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Completed Amount</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.completedAmount)}</p>
                                <p className="text-xs text-green-600 mt-1">Paid successfully</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <DollarSign className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Pending Amount</p>
                                <p className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.pendingAmount)}</p>
                                <p className="text-xs text-yellow-600 mt-1">Awaiting processing</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-xl">
                                <Clock className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Processing</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.processing}</p>
                                <p className="text-xs text-orange-600 mt-1">In progress</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-xl">
                                <Activity className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Avg Processing Time</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.avgProcessingTime}h</p>
                                <p className="text-xs text-purple-600 mt-1">Average time</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <Clock className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search payments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger className="md:w-44">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Methods</SelectItem>
                        {methods.map((method) => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterVendor} onValueChange={setFilterVendor}>
                    <SelectTrigger className="md:w-40">
                        <Truck className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Vendors</SelectItem>
                        {vendors.map((vendor) => {
                            const vendorItem = items.find(i => i.vendorId === vendor);
                            return vendorItem ? (
                                <SelectItem key={vendor} value={vendor}>{vendorItem.vendorName}</SelectItem>
                            ) : null;
                        })}
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="w-40"
                        placeholder="From"
                    />
                    <span className="text-gray-400">to</span>
                    <Input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="w-40"
                        placeholder="To"
                    />
                </div>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('All');
                        setFilterMethod('All');
                        setFilterVendor('All');
                        setDateRange({ from: '', to: '' });
                        fetchData();
                    }}
                    className="flex items-center gap-2"
                >
                    <X size={16} />
                    Clear Filters
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <CreditCard className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No payments found</p>
                                        <p className="text-sm text-gray-400">No payments recorded yet</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.paymentId}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.invoiceNumber}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.vendorName}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getMethodColor(item.paymentMethod)}>{item.paymentMethod}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(item.amount)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleView(item)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => openUpdateModal(item)}
                                                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                                title="Update Status"
                                            >
                                                <Send size={16} className="text-yellow-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} payments
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-emerald-600" />
                            Payment Details
                        </DialogTitle>
                        <DialogDescription>
                            View payment information and status
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Payment ID</p>
                                    <p className="font-medium">{selectedItem.paymentId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Invoice</p>
                                    <p className="font-medium">{selectedItem.invoiceNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Vendor</p>
                                    <p className="font-medium">{selectedItem.vendorName}</p>
                                    <p className="text-xs text-gray-500">{selectedItem.vendorCode}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedItem.amount)}</p>
                                    <p className="text-xs text-gray-500">{selectedItem.currency}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <Badge className={getMethodColor(selectedItem.paymentMethod)}>{selectedItem.paymentMethod}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.paymentDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Reference</p>
                                    <p className="font-medium">{selectedItem.reference}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Transaction ID</p>
                                    <p className="font-medium">{selectedItem.transactionId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Bank</p>
                                    <p className="font-medium">{selectedItem.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Number</p>
                                    <p className="font-medium">{selectedItem.accountNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Processed By</p>
                                    <p className="font-medium">{selectedItem.processedBy}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Processed Date</p>
                                    <p className="font-medium">{formatDateTime(selectedItem.processedDate)}</p>
                                </div>
                                {selectedItem.completedDate && (
                                    <div>
                                        <p className="text-sm text-gray-500">Completed Date</p>
                                        <p className="font-medium">{formatDateTime(selectedItem.completedDate)}</p>
                                    </div>
                                )}
                                {selectedItem.failureReason && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Failure Reason</p>
                                        <p className="font-medium text-red-600">{selectedItem.failureReason}</p>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Notes</p>
                                    <p className="font-medium text-gray-600">{selectedItem.notes || 'No notes'}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => openUpdateModal(selectedItem)}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Update Status
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Status Modal */}
            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-yellow-500" />
                            Update Payment Status
                        </DialogTitle>
                        <DialogDescription>
                            Update the status of this payment
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-500">Payment</p>
                                <p className="font-medium">{selectedItem.paymentId}</p>
                                <p className="text-sm text-gray-500">Current Status</p>
                                <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                            </div>
                            <div>
                                <Label>New Status</Label>
                                <Select
                                    value={updateStatus}
                                    onValueChange={(value) => setUpdateStatus(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Failed">Failed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        <SelectItem value="Refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            onClick={handleUpdateStatus}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-emerald-600" />
                            Export Payments
                        </DialogTitle>
                        <DialogDescription>
                            Export payments in your preferred format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF - Document</SelectItem>
                                    <SelectItem value="excel">Excel - Spreadsheet</SelectItem>
                                    <SelectItem value="csv">CSV - Comma separated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Total: <strong>{filteredItems.length}</strong></p>
                                <p>Completed: <strong>{stats.completed}</strong></p>
                                <p>Total Amount: <strong>{formatCurrency(stats.totalAmount)}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleExport({ payments: filteredItems, stats })}
                            disabled={exporting}
                        >
                            {exporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default PaymentTracking;