// src/pages/finance/PettyCash.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, Plus, Search, RefreshCw, Eye, Edit, Trash2,
    TrendingUp, TrendingDown, Clock, ChevronLeft, ChevronRight,
    MoreVertical, Download, Wallet, CheckCircle, XCircle, Save, X,
    AlertCircle, Calendar, FileText, User, Printer, Loader2
} from 'lucide-react';
import {
    getPettyCashBalance, getPettyCashTransactions,
    recordPettyCashTransaction, replenishPettyCash,
    approvePettyCashTransaction,
    rejectPettyCashTransaction,
    deletePettyCashTransaction
} from '../../services/finance/finance.api';
import { showToast } from '../../layout/layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
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

// ============================================================
// TYPES
// ============================================================

interface PettyCashTransaction {
    id: string;
    transactionDate: string;
    description: string;
    amount: number;
    transactionType: string;
    category: string;
    receiptUrl?: string;
    employeeId?: string;
    employeeName?: string;
    status: string;
    dateAdd: string;
    dateMod?: string;
    periodId?: string;
    periodName?: string;
}

interface PettyCashBalance {
    id: string;
    balance: number;
    totalExpenses: number;
    totalReplenishments: number;
    dateAdd: string;
    dateMod?: string;
    periodInfo?: {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
        isClosed: boolean;
        status: string;
    };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const PettyCash: React.FC = () => {
    // State
    const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);
    const [balance, setBalance] = useState<PettyCashBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState<PettyCashTransaction | null>(null);

    // Modal states
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isReplenishModalOpen, setIsReplenishModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [exporting, setExporting] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        transactionType: 'Expense',
        category: 'Miscellaneous',
        receiptUrl: '',
        employeeId: '',
    });

    const [replenishData, setReplenishData] = useState({
        amount: 0,
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        approvedBy: '',
    });

    const ITEMS_PER_PAGE = 10;

    // ============================================================
    // DATA FETCHING
    // ============================================================

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);
            const [balanceRes, transactionsRes] = await Promise.all([
                getPettyCashBalance(),
                getPettyCashTransactions(),
            ]);

            const balanceData = balanceRes.data?.data || balanceRes.data || {};
            const transactionsData = transactionsRes.data?.data || transactionsRes.data || [];

            setBalance(balanceData);
            setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        } catch (error) {
            console.error('Error fetching petty cash data:', error);
            showToast.error('Failed to load petty cash data');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleAddTransaction = async () => {
        if (!formData.description || formData.amount <= 0) {
            showToast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                amount: formData.amount,
                description: formData.description,
                transactionType: formData.transactionType,
                category: formData.category,
                transactionDate: new Date(formData.transactionDate).toISOString(),
                reference: `PC-${Date.now()}`,
            };

            console.log('📤 Sending payload:', payload);

            await recordPettyCashTransaction(payload);

            showToast.success('Transaction recorded successfully');
            setIsAddModalOpen(false);
            resetForm();
            await fetchData();
        } catch (error: any) {
            console.error('Error recording transaction:', error);
            const errorMsg = error.response?.data?.message ||
                error.response?.data?.errors ||
                'Failed to record transaction';

            if (typeof errorMsg === 'object') {
                const errors = Object.values(errorMsg).flat().join(', ');
                showToast.error(`Validation failed: ${errors}`);
            } else {
                showToast.error(errorMsg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleApproveTransaction = async (transaction: PettyCashTransaction) => {
        try {
            await approvePettyCashTransaction(transaction.id);
            showToast.success('Transaction approved successfully');
            await fetchData(); // Refresh the list
        } catch (error: any) {
            console.error('Error approving transaction:', error);
            const errorMsg = error.response?.data?.message || 'Failed to approve transaction';
            showToast.error(errorMsg);
        }
    };

    const handleRejectTransaction = async (transaction: PettyCashTransaction) => {
        try {
            await rejectPettyCashTransaction(transaction.id);
            showToast.success('Transaction rejected successfully');
            await fetchData(); // Refresh the list
        } catch (error: any) {
            console.error('Error rejecting transaction:', error);
            const errorMsg = error.response?.data?.message || 'Failed to reject transaction';
            showToast.error(errorMsg);
        }
    };

    const handleDeleteTransaction = async () => {
        if (!selectedTransaction) return;

        try {
            await deletePettyCashTransaction(selectedTransaction.id);
            showToast.success('Transaction deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedTransaction(null);
            await fetchData(); // Refresh the list
        } catch (error: any) {
            console.error('Error deleting transaction:', error);
            const errorMsg = error.response?.data?.message || 'Failed to delete transaction';
            showToast.error(errorMsg);
        }
    };
    const handleReplenish = async () => {
        if (replenishData.amount <= 0 || !replenishData.description) {
            showToast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await replenishPettyCash({
                amount: replenishData.amount,
                description: replenishData.description,
                transactionDate: new Date(replenishData.transactionDate).toISOString(),
                approvedBy: replenishData.approvedBy || 'System',
            });

            showToast.success('Petty cash replenished successfully');
            setIsReplenishModalOpen(false);
            setReplenishData({
                amount: 0,
                description: '',
                transactionDate: new Date().toISOString().split('T')[0],
                approvedBy: ''
            });
            await fetchData();
        } catch (error) {
            console.error('Error replenishing petty cash:', error);
            showToast.error('Failed to replenish petty cash');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            transactionDate: new Date().toISOString().split('T')[0],
            description: '',
            amount: 0,
            transactionType: 'Expense',
            category: 'Miscellaneous',
            receiptUrl: '',
            employeeId: '',
        });
    };



    const handleExport = async () => {
        setExporting(true);
        try {
            // TODO: Implement export logic
            showToast.success(`Report exported as ${exportFormat.toUpperCase()}`);
            setIsExportModalOpen(false);
        } catch (error) {
            console.error('Error exporting:', error);
            showToast.error('Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    const handlePrintReport = () => {
        window.print();
    };

    const handleRefresh = () => {
        fetchData();
    };

    // ============================================================
    // HELPERS
    // ============================================================

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
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

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'Approved': 'bg-green-100 text-green-700 border-green-200',
            'Completed': 'bg-green-100 text-green-700 border-green-200',
            'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Rejected': 'bg-red-100 text-red-700 border-red-200',
            'Cancelled': 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getTransactionTypeColor = (type: string) => {
        return type === 'Expense' || type === 'Withdrawal'
            ? 'bg-rose-100 text-rose-700 border-rose-200'
            : 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    // ============================================================
    // FILTERING & PAGINATION
    // ============================================================

    const filteredTransactions = transactions.filter(t =>
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading petty cash data...</p>
                </div>
            </div>
        );
    }

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Petty Cash</h1>
                    <p className="text-sm text-gray-500">Manage petty cash transactions</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={handleRefresh}
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
                    >
                        <Download size={16} />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handlePrintReport}
                        disabled={!transactions || transactions.length === 0}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        onClick={() => setIsReplenishModalOpen(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                        <DollarSign size={16} />
                        Replenish
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Plus size={16} />
                        Add Transaction
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {balance && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-emerald-700 font-medium">Current Balance</p>
                                    <p className="text-2xl font-bold text-emerald-900">{formatCurrency(balance.balance)}</p>
                                    {balance.periodInfo && (
                                        <p className="text-xs text-emerald-600 mt-1">
                                            Period: {balance.periodInfo.name}
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 bg-emerald-200 rounded-lg">
                                    <Wallet className="h-6 w-6 text-emerald-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-rose-700 font-medium">Total Expenses</p>
                                    <p className="text-2xl font-bold text-rose-900">{formatCurrency(balance.totalExpenses)}</p>
                                </div>
                                <div className="p-3 bg-rose-200 rounded-lg">
                                    <TrendingDown className="h-6 w-6 text-rose-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Replenishments</p>
                                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(balance.totalReplenishments)}</p>
                                </div>
                                <div className="p-3 bg-blue-200 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-blue-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-700 font-medium">Transactions</p>
                                    <p className="text-2xl font-bold text-purple-900">{transactions.length}</p>
                                </div>
                                <div className="p-3 bg-purple-200 rounded-lg">
                                    <Clock className="h-6 w-6 text-purple-700" />
                                </div>
                            </div>
                            <p className="text-xs text-purple-600 mt-1">
                                {transactions.filter(t => t.status === 'Pending').length} pending
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search by description or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No transactions found
                                </td>
                            </tr>
                        ) : (
                            paginatedTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(transaction.transactionDate)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.description}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{transaction.category}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTransactionTypeColor(transaction.transactionType)}>
                                            {transaction.transactionType}
                                        </Badge>
                                    </td>
                                    <td className={`px-4 py-3 text-sm text-right font-medium ${transaction.transactionType === 'Expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {transaction.transactionType === 'Expense' ? '-' : ''}{formatCurrency(transaction.amount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(transaction.status)}>
                                            {transaction.status || 'Pending'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-0" align="end">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTransaction(transaction);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                                    >
                                                        <Eye size={16} />
                                                        View Details
                                                    </button>
                                                    {transaction.status === 'Pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveTransaction(transaction)}
                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-green-600 flex items-center gap-2"
                                                            >
                                                                <CheckCircle size={16} />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectTransaction(transaction)}
                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-red-600 flex items-center gap-2"
                                                            >
                                                                <XCircle size={16} />
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTransaction(transaction);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
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
                {filteredTransactions.length > 0 && totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
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
                )}
            </div>

            {/* ============================================================ */}
            {/* MODALS */}
            {/* ============================================================ */}

            {/* Add Transaction Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-indigo-600" />
                            Record Petty Cash Transaction
                        </DialogTitle>
                        <DialogDescription>
                            Enter the transaction details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Date *</Label>
                            <Input
                                type="date"
                                value={formData.transactionDate}
                                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Description *</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g., Office supplies"
                            />
                        </div>
                        <div>
                            <Label>Amount *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.amount || ''}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <Label>Transaction Type *</Label>
                            <Select
                                value={formData.transactionType}
                                onValueChange={(value) => setFormData({ ...formData, transactionType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Expense">Expense</SelectItem>
                                    <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                                    <SelectItem value="Replenishment">Replenishment</SelectItem>
                                    <SelectItem value="Deposit">Deposit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Stationery">Stationery</SelectItem>
                                    <SelectItem value="Meals">Meals</SelectItem>
                                    <SelectItem value="Transport">Transport</SelectItem>
                                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                                    <SelectItem value="Travel">Travel</SelectItem>
                                    <SelectItem value="Utilities">Utilities</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Receipt URL (Optional)</Label>
                            <Input
                                value={formData.receiptUrl}
                                onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                                placeholder="https://example.com/receipt.pdf"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsAddModalOpen(false);
                            resetForm();
                        }}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={handleAddTransaction}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Record
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Replenish Modal */}
            <Dialog open={isReplenishModalOpen} onOpenChange={setIsReplenishModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Replenish Petty Cash
                        </DialogTitle>
                        <DialogDescription>
                            Add funds to the petty cash account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Amount *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={replenishData.amount || ''}
                                onChange={(e) => setReplenishData({ ...replenishData, amount: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <Label>Description *</Label>
                            <Input
                                value={replenishData.description}
                                onChange={(e) => setReplenishData({ ...replenishData, description: e.target.value })}
                                placeholder="e.g., Petty cash replenishment"
                            />
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={replenishData.transactionDate}
                                onChange={(e) => setReplenishData({ ...replenishData, transactionDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Approved By (Optional)</Label>
                            <Input
                                value={replenishData.approvedBy}
                                onChange={(e) => setReplenishData({ ...replenishData, approvedBy: e.target.value })}
                                placeholder="e.g., Finance Manager"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReplenishModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleReplenish}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Replenish
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Transaction Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Transaction Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">{formatDate(selectedTransaction.transactionDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className={`font-medium ${selectedTransaction.transactionType === 'Expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {selectedTransaction.transactionType === 'Expense' ? '-' : ''}{formatCurrency(selectedTransaction.amount)}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{selectedTransaction.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <p className="font-medium">{selectedTransaction.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge className={getTransactionTypeColor(selectedTransaction.transactionType)}>
                                        {selectedTransaction.transactionType}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedTransaction.status)}>
                                        {selectedTransaction.status || 'Pending'}
                                    </Badge>
                                </div>
                                {selectedTransaction.receiptUrl && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Receipt</p>
                                        <a
                                            href={selectedTransaction.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline"
                                        >
                                            View Receipt
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Transaction Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Transaction
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this transaction?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-500">This action cannot be undone.</p>
                        {selectedTransaction && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium">{selectedTransaction.description}</p>
                                <p className="text-sm text-gray-500">{formatCurrency(selectedTransaction.amount)}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteTransaction}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            Export Petty Cash Report
                        </DialogTitle>
                        <DialogDescription>
                            Export the petty cash report in your preferred format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select
                                value={exportFormat}
                                onValueChange={(value: any) => setExportFormat(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-red-500" />
                                            PDF - Printable Document
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="excel">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-600" />
                                            Excel - Spreadsheet
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="csv">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            CSV - Comma separated values
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Current Balance: <strong>{formatCurrency(balance?.balance || 0)}</strong></p>
                                <p>Total Transactions: <strong>{transactions.length}</strong></p>
                                <p>Pending: <strong>{transactions.filter(t => t.status === 'Pending').length}</strong></p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 space-y-1">
                            <p>📄 PDF: Professional formatted report</p>
                            <p>📊 Excel: Full data with multiple sheets</p>
                            <p>📋 CSV: Raw data for further analysis</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={handleExport}
                            disabled={exporting || !transactions || transactions.length === 0}
                        >
                            {exporting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export {exportFormat.toUpperCase()}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default PettyCash;