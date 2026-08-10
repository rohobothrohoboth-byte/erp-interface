// src/pages/finance/portal/InvoiceSubmission.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Plus, Upload,
    AlertCircle, CheckCircle, Clock, X, Calendar,
    DollarSign, Truck, Users, Building2, FileCheck,
    AlertTriangle, TrendingUp, TrendingDown, Activity,
    EyeOff, FilePlus, Send, Archive, Trash2, Edit
} from 'lucide-react';
import { useReportExport } from '@/shared/hooks/useReportExport';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
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
import {
    getPortalInvoices,
    submitPortalInvoice,
    getInvoiceTracking,
    updatePortalInvoice,
    deletePortalInvoice,
} from '@/modules/finance/services/finance.api';

interface PortalInvoice {
    id: string;
    invoiceNumber: string;
    vendorId: string;
    vendorName: string;
    vendorCode: string;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    invoiceDate: string;
    dueDate: string;
    receivedDate: string;
    status: 'Draft' | 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Paid' | 'Overdue' | 'Cancelled';
    type: 'Purchase' | 'Sales' | 'Credit' | 'Debit';
    category: string;
    description: string;
    reference: string;
    poNumber: string;
    grnNumber: string;
    tracking: InvoiceTracking[];
    attachments: InvoiceAttachment[];
    notes: string;
    submittedBy: string;
    submittedDate: string;
    approvedBy: string;
    approvedDate: string;
    rejectionReason: string;
    createdAt: string;
    updatedAt: string;
    rowVersion?: string;
}

interface InvoiceTracking {
    id: string;
    status: string;
    date: string;
    note: string;
    updatedBy: string;
}

interface InvoiceAttachment {
    id: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    uploadDate: string;
    downloadUrl: string;
}

interface InvoiceStats {
    total: number;
    draft: number;
    submitted: number;
    underReview: number;
    approved: number;
    rejected: number;
    paid: number;
    overdue: number;
    cancelled: number;
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
    totalVendors: number;
    avgProcessingTime: number;
}

const InvoiceSubmission: React.FC = () => {
    const [items, setItems] = useState<PortalInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [filterVendor, setFilterVendor] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<PortalInvoice | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [submitData, setSubmitData] = useState({
        vendorId: '',
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        amount: '',
        taxAmount: '',
        description: '',
        poNumber: '',
        category: '',
        notes: '',
        attachments: [] as File[],
    });
    const [editData, setEditData] = useState<Partial<PortalInvoice>>({});

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('portal-invoices');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (dateRange.from) params.fromDate = dateRange.from;
            if (dateRange.to) params.toDate = dateRange.to;
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterType !== 'All') params.type = filterType;
            if (filterVendor !== 'All') params.vendorId = filterVendor;
            if (filterCategory !== 'All') params.category = filterCategory;
            if (searchTerm) params.search = searchTerm;

            const response = await getPortalInvoices(params);

            let data: PortalInvoice[] = [];
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
            console.error('Error fetching invoices:', error);
            showToast.error('Failed to load invoices');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [dateRange, filterStatus, filterType, filterVendor, filterCategory, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): InvoiceStats => {
        const filtered = items;
        const draft = filtered.filter(c => c.status === 'Draft').length;
        const submitted = filtered.filter(c => c.status === 'Submitted').length;
        const underReview = filtered.filter(c => c.status === 'UnderReview').length;
        const approved = filtered.filter(c => c.status === 'Approved').length;
        const rejected = filtered.filter(c => c.status === 'Rejected').length;
        const paid = filtered.filter(c => c.status === 'Paid').length;
        const overdue = filtered.filter(c => c.status === 'Overdue').length;
        const cancelled = filtered.filter(c => c.status === 'Cancelled').length;
        const totalAmount = filtered.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
        const paidAmount = filtered.filter(c => c.status === 'Paid').reduce((sum, c) => sum + (c.totalAmount || 0), 0);
        const overdueAmount = filtered.filter(c => c.status === 'Overdue').reduce((sum, c) => sum + (c.totalAmount || 0), 0);
        const totalVendors = new Set(filtered.map(c => c.vendorId)).size;

        return {
            total: filtered.length,
            draft,
            submitted,
            underReview,
            approved,
            rejected,
            paid,
            overdue,
            cancelled,
            totalAmount,
            paidAmount,
            overdueAmount,
            totalVendors,
            avgProcessingTime: 5.2,
        };
    };

    const stats = getStats();

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
            Draft: 'bg-gray-100 text-gray-700 border-gray-200',
            Submitted: 'bg-blue-100 text-blue-700 border-blue-200',
            UnderReview: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Approved: 'bg-green-100 text-green-700 border-green-200',
            Rejected: 'bg-red-100 text-red-700 border-red-200',
            Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            Overdue: 'bg-orange-100 text-orange-700 border-orange-200',
            Cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Purchase: 'bg-blue-100 text-blue-700 border-blue-200',
            Sales: 'bg-green-100 text-green-700 border-green-200',
            Credit: 'bg-purple-100 text-purple-700 border-purple-200',
            Debit: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesVendor = filterVendor === 'All' || item.vendorId === filterVendor;
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        return matchesSearch && matchesStatus && matchesType && matchesVendor && matchesCategory;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const vendors = [...new Set(items.map(c => c.vendorId).filter(Boolean))];
    const categories = [...new Set(items.map(c => c.category).filter(Boolean))];

    const handleView = (item: PortalInvoice) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const handleEdit = (item: PortalInvoice) => {
        setSelectedItem(item);
        setEditData(item);
        setIsEditModalOpen(true);
    };

    const handleDelete = (item: PortalInvoice) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleViewTracking = async (item: PortalInvoice) => {
        try {
            const response = await getInvoiceTracking(item.id);
            if (response?.data) {
                const trackingData = Array.isArray(response.data) ? response.data : [response.data];
                setSelectedItem({ ...item, tracking: trackingData });
                setIsTrackingModalOpen(true);
            } else {
                setSelectedItem(item);
                setIsTrackingModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching tracking:', error);
            showToast.error('Failed to load tracking information');
            // Still open with whatever tracking we have
            setSelectedItem(item);
            setIsTrackingModalOpen(true);
        }
    };

    const handleSubmitInvoice = async () => {
        if (!submitData.vendorId || !submitData.invoiceDate || !submitData.dueDate || !submitData.amount) {
            showToast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);

            // Create FormData for file uploads
            const formData = new FormData();
            formData.append('vendorId', submitData.vendorId);
            formData.append('invoiceNumber', submitData.invoiceNumber || `INV-${Date.now()}`);
            formData.append('invoiceDate', new Date(submitData.invoiceDate).toISOString());
            formData.append('dueDate', new Date(submitData.dueDate).toISOString());
            formData.append('amount', submitData.amount);
            formData.append('taxAmount', submitData.taxAmount || '0');
            formData.append('description', submitData.description || '');
            formData.append('poNumber', submitData.poNumber || '');
            formData.append('category', submitData.category || '');
            formData.append('notes', submitData.notes || '');

            submitData.attachments.forEach(file => {
                formData.append('attachments', file);
            });

            await submitPortalInvoice(formData);
            showToast.success('Invoice submitted successfully');
            await fetchData();
            setIsSubmitModalOpen(false);
            setSubmitData({
                vendorId: '',
                invoiceNumber: '',
                invoiceDate: '',
                dueDate: '',
                amount: '',
                taxAmount: '',
                description: '',
                poNumber: '',
                category: '',
                notes: '',
                attachments: [],
            });
        } catch (error: any) {
            console.error('Error submitting invoice:', error);
            showToast.error(error.response?.data?.message || 'Failed to submit invoice');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateInvoice = async () => {
        if (!selectedItem) return;

        try {
            setSubmitting(true);
            await updatePortalInvoice({
                id: selectedItem.id,
                ...editData,
                rowVersion: selectedItem.rowVersion,
            });
            showToast.success('Invoice updated successfully');
            await fetchData();
            setIsEditModalOpen(false);
            setSelectedItem(null);
            setEditData({});
        } catch (error: any) {
            console.error('Error updating invoice:', error);
            showToast.error(error.response?.data?.message || 'Failed to update invoice');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteInvoice = async () => {
        if (!selectedItem) return;

        try {
            setDeleting(true);
            await deletePortalInvoice(selectedItem.id);
            showToast.success('Invoice deleted successfully');
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        } catch (error: any) {
            console.error('Error deleting invoice:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete invoice');
        } finally {
            setDeleting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSubmitData({ ...submitData, attachments: files });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
                    <div className="p-2 bg-teal-100 rounded-lg">
                        <FileText className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Invoice Submission</h1>
                        <p className="text-sm text-gray-500">Submit and track vendor invoices</p>
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
                        onClick={() => handlePrintReport({ invoices: filteredItems, stats })}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => setIsSubmitModalOpen(true)}
                    >
                        <Plus size={16} />
                        Submit Invoice
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-teal-700 font-medium">Total Invoices</p>
                                <p className="text-2xl font-bold text-teal-900">{stats.total}</p>
                                <p className="text-xs text-teal-600 mt-1">{stats.paid} paid</p>
                            </div>
                            <div className="p-3 bg-teal-200 rounded-xl">
                                <FileText className="h-6 w-6 text-teal-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Under Review</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.underReview}</p>
                                <p className="text-xs text-yellow-600 mt-1">Pending approval</p>
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
                                <p className="text-sm text-orange-700 font-medium">Overdue</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.overdue}</p>
                                <p className="text-xs text-orange-600 mt-1">{formatCurrency(stats.overdueAmount)}</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Amount</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalAmount)}</p>
                                <p className="text-xs text-green-600 mt-1">All invoices</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <DollarSign className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Active Vendors</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.totalVendors}</p>
                                <p className="text-xs text-purple-600 mt-1">Total vendors</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <Users className="h-6 w-6 text-purple-700" />
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
                        placeholder="Search invoices..."
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
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="UnderReview">Under Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Purchase">Purchase</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Credit">Credit</SelectItem>
                        <SelectItem value="Debit">Debit</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterVendor} onValueChange={setFilterVendor}>
                    <SelectTrigger className="md:w-44">
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

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
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
                        setFilterType('All');
                        setFilterVendor('All');
                        setFilterCategory('All');
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No invoices found</p>
                                        <p className="text-sm text-gray-400">Submit your first invoice</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.invoiceNumber}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.vendorName}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(item.totalAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.dueDate)}</td>
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
                                                onClick={() => handleViewTracking(item)}
                                                className="p-1 hover:bg-purple-100 rounded-lg transition-colors"
                                                title="Track"
                                            >
                                                <Activity size={16} className="text-purple-500" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} className="text-yellow-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
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
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} invoices
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
                            <FileText className="h-5 w-5 text-teal-600" />
                            Invoice Details
                        </DialogTitle>
                        <DialogDescription>
                            View invoice information and status
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Invoice Number</p>
                                    <p className="font-medium">{selectedItem.invoiceNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Vendor</p>
                                    <p className="font-medium">{selectedItem.vendorName}</p>
                                    <p className="text-xs text-gray-500">{selectedItem.vendorCode}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedItem.totalAmount)}</p>
                                    <p className="text-xs text-gray-500">Subtotal: {formatCurrency(selectedItem.amount)} + Tax: {formatCurrency(selectedItem.taxAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Currency</p>
                                    <p className="font-medium">{selectedItem.currency}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Invoice Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.invoiceDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Due Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.dueDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">PO Number</p>
                                    <p className="font-medium">{selectedItem.poNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">GRN Number</p>
                                    <p className="font-medium">{selectedItem.grnNumber || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{selectedItem.description}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Notes</p>
                                    <p className="font-medium text-gray-600">{selectedItem.notes || 'No notes'}</p>
                                </div>
                            </div>

                            {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Attachments</h4>
                                    <div className="space-y-2">
                                        {selectedItem.attachments.map((attachment, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={16} className="text-gray-500" />
                                                    <span className="text-sm font-medium">{attachment.fileName}</span>
                                                    <span className="text-xs text-gray-400">{attachment.fileSize}</span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-xs"
                                                    onClick={() => window.open(attachment.downloadUrl, '_blank')}
                                                >
                                                    <Download size={14} className="mr-1" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Submission Info</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">Submitted By:</span>
                                        <span className="ml-2 font-medium">{selectedItem.submittedBy}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Submitted Date:</span>
                                        <span className="ml-2 font-medium">{formatDateTime(selectedItem.submittedDate)}</span>
                                    </div>
                                    {selectedItem.approvedBy && (
                                        <>
                                            <div>
                                                <span className="text-gray-500">Approved By:</span>
                                                <span className="ml-2 font-medium">{selectedItem.approvedBy}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Approved Date:</span>
                                                <span className="ml-2 font-medium">{formatDateTime(selectedItem.approvedDate)}</span>
                                            </div>
                                        </>
                                    )}
                                    {selectedItem.rejectionReason && (
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Rejection Reason:</span>
                                            <span className="ml-2 font-medium text-red-600">{selectedItem.rejectionReason}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tracking Modal */}
            <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            Invoice Tracking
                        </DialogTitle>
                        <DialogDescription>
                            Track the status and history of this invoice
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Invoice</p>
                                    <p className="font-medium">{selectedItem.invoiceNumber}</p>
                                </div>
                                <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                            </div>

                            <div className="relative pl-8 space-y-4">
                                {selectedItem.tracking && selectedItem.tracking.length > 0 ? (
                                    selectedItem.tracking.map((track, idx) => (
                                        <div key={track.id || idx} className="relative">
                                            {idx < selectedItem.tracking.length - 1 && (
                                                <div className="absolute left-[-20px] top-5 w-[2px] h-full bg-gray-200"></div>
                                            )}
                                            <div className="flex items-start gap-4">
                                                <div className="relative z-10">
                                                    <div className={`w-3 h-3 rounded-full mt-1.5 ${idx === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium text-sm">{track.status}</p>
                                                        <p className="text-xs text-gray-400">{formatDateTime(track.date)}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{track.note}</p>
                                                    <p className="text-xs text-gray-400">By: {track.updatedBy}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No tracking information available</p>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTrackingModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Submit Invoice Modal */}
            <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FilePlus className="h-5 w-5 text-teal-600" />
                            Submit Invoice
                        </DialogTitle>
                        <DialogDescription>
                            Fill in the invoice details and submit for approval
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Vendor *</Label>
                                <Select
                                    value={submitData.vendorId}
                                    onValueChange={(value) => setSubmitData({ ...submitData, vendorId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {items.map((inv) => (
                                            <SelectItem key={inv.vendorId} value={inv.vendorId}>
                                                {inv.vendorName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Invoice Number</Label>
                                <Input
                                    value={submitData.invoiceNumber}
                                    onChange={(e) => setSubmitData({ ...submitData, invoiceNumber: e.target.value })}
                                    placeholder="e.g., INV-2025-001"
                                />
                            </div>
                            <div>
                                <Label>Invoice Date *</Label>
                                <Input
                                    type="date"
                                    value={submitData.invoiceDate}
                                    onChange={(e) => setSubmitData({ ...submitData, invoiceDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Due Date *</Label>
                                <Input
                                    type="date"
                                    value={submitData.dueDate}
                                    onChange={(e) => setSubmitData({ ...submitData, dueDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Amount (Subtotal) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={submitData.amount}
                                    onChange={(e) => setSubmitData({ ...submitData, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label>Tax Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={submitData.taxAmount}
                                    onChange={(e) => setSubmitData({ ...submitData, taxAmount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Description *</Label>
                                <Input
                                    value={submitData.description}
                                    onChange={(e) => setSubmitData({ ...submitData, description: e.target.value })}
                                    placeholder="Brief description of the invoice"
                                />
                            </div>
                            <div>
                                <Label>PO Number</Label>
                                <Input
                                    value={submitData.poNumber}
                                    onChange={(e) => setSubmitData({ ...submitData, poNumber: e.target.value })}
                                    placeholder="PO-2025-001"
                                />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Input
                                    value={submitData.category}
                                    onChange={(e) => setSubmitData({ ...submitData, category: e.target.value })}
                                    placeholder="e.g., IT Services"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Notes</Label>
                                <Input
                                    value={submitData.notes}
                                    onChange={(e) => setSubmitData({ ...submitData, notes: e.target.value })}
                                    placeholder="Additional notes"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Attachments</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-400 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <Upload className="h-8 w-8 text-gray-400" />
                                        <span className="text-sm text-gray-500">
                                            {submitData.attachments.length > 0
                                                ? `${submitData.attachments.length} files selected`
                                                : 'Click to upload files'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            PDF, Excel, Images (Max 10MB per file)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={handleSubmitInvoice}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Invoice'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-yellow-500" />
                            Edit Invoice
                        </DialogTitle>
                        <DialogDescription>
                            Update invoice information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Invoice Number</Label>
                                <Input
                                    value={editData.invoiceNumber || ''}
                                    onChange={(e) => setEditData({ ...editData, invoiceNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={editData.status || ''}
                                    onValueChange={(value) => setEditData({ ...editData, status: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Submitted">Submitted</SelectItem>
                                        <SelectItem value="UnderReview">Under Review</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Invoice Date</Label>
                                <Input
                                    type="date"
                                    value={editData.invoiceDate || ''}
                                    onChange={(e) => setEditData({ ...editData, invoiceDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    value={editData.dueDate || ''}
                                    onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editData.amount || ''}
                                    onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <Label>Tax Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editData.taxAmount || ''}
                                    onChange={(e) => setEditData({ ...editData, taxAmount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Description</Label>
                                <Input
                                    value={editData.description || ''}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Notes</Label>
                                <Input
                                    value={editData.notes || ''}
                                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            onClick={handleUpdateInvoice}
                            disabled={submitting}
                        >
                            {submitting ? 'Updating...' : 'Update Invoice'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Confirm Delete
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this invoice? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="py-4">
                            <p className="text-sm text-gray-600">
                                <strong>{selectedItem.invoiceNumber}</strong> - {selectedItem.vendorName}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeleteInvoice}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete Invoice'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-teal-600" />
                            Export Invoices
                        </DialogTitle>
                        <DialogDescription>
                            Export invoices in your preferred format.
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
                                <p>Under Review: <strong>{stats.underReview}</strong></p>
                                <p>Total Amount: <strong>{formatCurrency(stats.totalAmount)}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => handleExport({ invoices: filteredItems, stats })}
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

export default InvoiceSubmission;