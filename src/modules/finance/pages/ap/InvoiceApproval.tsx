// src/pages/finance/ap/InvoiceApproval.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileCheck, RefreshCw, Search, Filter, Eye, Edit,
    CheckCircle, XCircle, Clock, DollarSign, Calendar,
    Building2, User, FileText, MessageSquare,
    ChevronLeft, ChevronRight, MoreVertical, Download,
    AlertCircle, TrendingUp, TrendingDown, Users
} from 'lucide-react';
import { getInvoices, updateInvoiceStatus } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
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

interface InvoiceApprovalItem {
    id: string;
    invoiceNumber: string;
    vendorName: string;
    vendorId?: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    taxAmount: number;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
    approvalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
    description?: string;
    department?: string;
    priority: 'High' | 'Medium' | 'Low';
    createdAt: string;
}

const InvoiceApproval: React.FC = () => {
    const [invoices, setInvoices] = useState<InvoiceApprovalItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceApprovalItem | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [approvalComment, setApprovalComment] = useState('');
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await getInvoices();
            let data = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                }
            }

            const mappedInvoices: InvoiceApprovalItem[] = data.map((inv: any) => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber || inv.invoice_no || 'INV-001',
                vendorName: inv.vendorName || inv.vendor_name || 'Unknown Vendor',
                vendorId: inv.vendorId || inv.vendor_id,
                invoiceDate: inv.invoiceDate || inv.invoice_date || new Date().toISOString(),
                dueDate: inv.dueDate || inv.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                totalAmount: inv.totalAmount || inv.total_amount || 0,
                taxAmount: inv.taxAmount || inv.tax_amount || 0,
                status: inv.status || 'Pending',
                approvalStatus: inv.approvalStatus || (inv.status === 'Paid' ? 'Approved' : 'Pending'),
                description: inv.notes || inv.description || '',
                department: inv.department || 'General',
                priority: inv.priority || 'Medium',
                createdAt: inv.dateAdd || inv.created_at || new Date().toISOString(),
            }));

            setInvoices(mappedInvoices);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            showToast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedInvoice) return;
        try {
            await updateInvoiceStatus(selectedInvoice.id, 'Approved');
            showToast.success(`Invoice ${selectedInvoice.invoiceNumber} approved`);
            setIsApproveModalOpen(false);
            setApprovalComment('');
            await fetchInvoices();
        } catch (error: any) {
            console.error('Error approving invoice:', error);
            showToast.error(error.response?.data?.message || 'Failed to approve invoice');
        }
    };

    const handleReject = async () => {
        if (!selectedInvoice) return;
        try {
            await updateInvoiceStatus(selectedInvoice.id, 'Rejected');
            showToast.success(`Invoice ${selectedInvoice.invoiceNumber} rejected`);
            setIsRejectModalOpen(false);
            setApprovalComment('');
            await fetchInvoices();
        } catch (error: any) {
            console.error('Error rejecting invoice:', error);
            showToast.error(error.response?.data?.message || 'Failed to reject invoice');
        }
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

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Approved: 'bg-green-100 text-green-700 border-green-200',
            Rejected: 'bg-red-100 text-red-700 border-red-200',
            Paid: 'bg-blue-100 text-blue-700 border-blue-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            High: 'bg-red-100 text-red-700',
            Medium: 'bg-yellow-100 text-yellow-700',
            Low: 'bg-green-100 text-green-700',
        };
        return colors[priority] || 'bg-gray-100 text-gray-700';
    };

    const getStepStatusColor = (action: string) => {
        const colors: Record<string, string> = {
            Pending: 'bg-yellow-100 text-yellow-700',
            Approved: 'bg-green-100 text-green-700',
            Rejected: 'bg-red-100 text-red-700',
        };
        return colors[action] || 'bg-gray-100 text-gray-700';
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || inv.approvalStatus === filterStatus;
        const matchesPriority = filterPriority === 'All' || inv.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Calculate stats
    const totalInvoices = invoices.length;
    const pendingCount = invoices.filter(i => i.approvalStatus === 'Pending').length;
    const approvedCount = invoices.filter(i => i.approvalStatus === 'Approved').length;
    const rejectedCount = invoices.filter(i => i.approvalStatus === 'Rejected').length;

    if (loading) {
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
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileCheck className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Invoice Approval</h1>
                        <p className="text-sm text-gray-500">Review and approve vendor invoices</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchInvoices}  // ✅ FIXED: changed from fetchData to fetchInvoices
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Download size={16} />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Invoices</p>
                                <p className="text-2xl font-bold text-blue-900">{totalInvoices}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Pending Approval</p>
                                <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Approved</p>
                                <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Rejected</p>
                                <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-700" />
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
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="md:w-40">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Priorities</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                    No invoices found
                                </td>
                            </tr>
                        ) : (
                            paginatedInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                                            <p className="text-xs text-gray-500">{formatDate(invoice.invoiceDate)}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{invoice.vendorName}</td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">
                                        {formatCurrency(invoice.totalAmount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getPriorityColor(invoice.priority)}>
                                            {invoice.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(invoice.approvalStatus)}>
                                            {invoice.approvalStatus}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedInvoice(invoice);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            {invoice.approvalStatus === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInvoice(invoice);
                                                            setIsApproveModalOpen(true);
                                                        }}
                                                        className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16} className="text-green-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInvoice(invoice);
                                                            setIsRejectModalOpen(true);
                                                        }}
                                                        className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16} className="text-red-500" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedInvoice(invoice);
                                                    setIsHistoryModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-purple-100 rounded-lg transition-colors"
                                                title="History"
                                            >
                                                <Clock size={16} className="text-purple-500" />
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
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredInvoices.length)} of {filteredInvoices.length} invoices
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages || 1}
                        </span>
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

            {/* View Invoice Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Invoice Details
                        </DialogTitle>
                        <DialogDescription>
                            View invoice information.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInvoice && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Invoice Number</p>
                                    <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Vendor</p>
                                    <p>{selectedInvoice.vendorName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p>{formatDate(selectedInvoice.invoiceDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Due Date</p>
                                    <p>{formatDate(selectedInvoice.dueDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-xl font-bold text-indigo-600">{formatCurrency(selectedInvoice.totalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tax Amount</p>
                                    <p>{formatCurrency(selectedInvoice.taxAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p>{selectedInvoice.department}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Priority</p>
                                    <Badge className={getPriorityColor(selectedInvoice.priority)}>
                                        {selectedInvoice.priority}
                                    </Badge>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p>{selectedInvoice.description}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Modal */}
            <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            Approve Invoice
                        </DialogTitle>
                        <DialogDescription>
                            Approve this invoice for payment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-700">
                            Are you sure you want to approve <strong>{selectedInvoice?.invoiceNumber}</strong>?
                        </p>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm"><span className="text-gray-500">Vendor:</span> {selectedInvoice?.vendorName}</p>
                            <p className="text-sm"><span className="text-gray-500">Amount:</span> {formatCurrency(selectedInvoice?.totalAmount || 0)}</p>
                        </div>
                        <div className="mt-3">
                            <Label>Comments (Optional)</Label>
                            <Textarea
                                value={approvalComment}
                                onChange={(e) => setApprovalComment(e.target.value)}
                                placeholder="Add approval comments..."
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-5 w-5" />
                            Reject Invoice
                        </DialogTitle>
                        <DialogDescription>
                            Reject this invoice and provide a reason.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-700">
                            Are you sure you want to reject <strong>{selectedInvoice?.invoiceNumber}</strong>?
                        </p>
                        <div className="mt-3">
                            <Label>Reason for Rejection *</Label>
                            <Textarea
                                value={approvalComment}
                                onChange={(e) => setApprovalComment(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                rows={3}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleReject}
                            disabled={!approvalComment.trim()}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approval History Modal */}
            <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            Approval History
                        </DialogTitle>
                        <DialogDescription>
                            View the approval workflow progress.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInvoice && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-4">
                                {selectedInvoice.steps?.map((step, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                {step.step}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900">{step.name}</p>
                                                <Badge className={getStepStatusColor(step.action)}>
                                                    {step.action}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">{step.approver} ({step.role})</p>
                                            {step.date && (
                                                <p className="text-xs text-gray-400">{formatDate(step.date)}</p>
                                            )}
                                            {step.comments && (
                                                <p className="text-sm text-gray-600 mt-1 italic">"{step.comments}"</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default InvoiceApproval;