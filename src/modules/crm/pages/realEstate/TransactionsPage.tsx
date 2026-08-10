// src/pages/crm/realEstate/TransactionsPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    DollarSign,
    Users,
    Home,
    Calendar,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    User,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { showToast } from '@/shared/layout/layout';
import { getTransactions, deleteTransaction, acceptTransaction, closeTransaction } from '@/modules/crm/services/crm.api';
import type { RealEstateTransaction } from '@/modules/crm/types/crm.types';
import AddTransactionModal from '@/modules/crm/components/realEstate/AddTransactionModal';
import EditTransactionModal from '@/modules/crm/components/realEstate/EditTransactionModal';
import ViewTransactionModal from '@/modules/crm/components/realEstate/ViewTransactionModal';

const ITEMS_PER_PAGE = 10;

const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
        'Negotiation': 'bg-blue-100 text-blue-700 border-blue-200',
        'Accepted': 'bg-green-100 text-green-700 border-green-200',
        'PendingInspection': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'PendingFinancing': 'bg-orange-100 text-orange-700 border-orange-200',
        'PendingAppraisal': 'bg-purple-100 text-purple-700 border-purple-200',
        'Closing': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Completed': 'bg-green-100 text-green-700 border-green-200',
        'Cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Negotiation': return <TrendingUp className="h-3 w-3" />;
        case 'Accepted': return <CheckCircle className="h-3 w-3" />;
        case 'PendingInspection': return <Clock className="h-3 w-3" />;
        case 'PendingFinancing': return <Clock className="h-3 w-3" />;
        case 'PendingAppraisal': return <Clock className="h-3 w-3" />;
        case 'Closing': return <Calendar className="h-3 w-3" />;
        case 'Completed': return <CheckCircle className="h-3 w-3" />;
        case 'Cancelled': return <XCircle className="h-3 w-3" />;
        default: return <Clock className="h-3 w-3" />;
    }
};

const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const TransactionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<RealEstateTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState<RealEstateTransaction | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'accept' | 'close' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            if (searchTerm) params.search = searchTerm;

            const response = await getTransactions(params);
            const data = response.data?.data || response.data || [];
            setTransactions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            showToast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTransaction) return;
        try {
            setIsProcessing(true);
            await deleteTransaction(selectedTransaction.id);
            showToast.success('Transaction deleted successfully');
            setIsDeleteModalOpen(false);
            fetchTransactions();
        } catch (error) {
            showToast.error('Failed to delete transaction');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAccept = async () => {
        if (!selectedTransaction) return;
        try {
            setIsProcessing(true);
            await acceptTransaction(selectedTransaction.id);
            showToast.success('Transaction accepted successfully');
            setIsActionModalOpen(false);
            fetchTransactions();
        } catch (error) {
            showToast.error('Failed to accept transaction');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = async () => {
        if (!selectedTransaction) return;
        try {
            setIsProcessing(true);
            await closeTransaction(selectedTransaction.id);
            showToast.success('Transaction closed successfully');
            setIsActionModalOpen(false);
            fetchTransactions();
        } catch (error) {
            showToast.error('Failed to close transaction');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleView = (transaction: RealEstateTransaction) => {
        setSelectedTransaction(transaction);
        setIsViewModalOpen(true);
    };

    const handleEdit = (transaction: RealEstateTransaction) => {
        setSelectedTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const handleActionClick = (transaction: RealEstateTransaction, action: 'accept' | 'close') => {
        setSelectedTransaction(transaction);
        setActionType(action);
        setIsActionModalOpen(true);
    };

    const handleActionConfirm = () => {
        if (actionType === 'accept') handleAccept();
        else if (actionType === 'close') handleClose();
    };

    const filteredTransactions = transactions.filter(t => {
        const search = searchTerm.toLowerCase();
        return t.transactionNumber?.toLowerCase().includes(search) ||
            t.propertyTitle?.toLowerCase().includes(search) ||
            t.buyerName?.toLowerCase().includes(search) ||
            t.sellerName?.toLowerCase().includes(search);
    });

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const stats = {
        total: transactions.length,
        negotiation: transactions.filter(t => t.status === 'Negotiation').length,
        accepted: transactions.filter(t => t.status === 'Accepted').length,
        closing: transactions.filter(t => t.status === 'Closing').length,
        completed: transactions.filter(t => t.status === 'Completed').length,
        totalValue: transactions.reduce((sum, t) => sum + (t.salePrice || 0), 0),
    };

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                            <div className="flex-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32 mt-1" />
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-indigo-600" />
                        Transactions
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage real estate transactions and deals
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={fetchTransactions}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={16} />
                        New Transaction
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Active</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {stats.negotiation + stats.accepted}
                                </p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Closing</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.closing}</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-lg">
                                <Calendar className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Value</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {formatCurrency(stats.totalValue)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-700" />
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
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Accepted">Accepted</SelectItem>
                        <SelectItem value="PendingInspection">Pending Inspection</SelectItem>
                        <SelectItem value="PendingFinancing">Pending Financing</SelectItem>
                        <SelectItem value="PendingAppraisal">Pending Appraisal</SelectItem>
                        <SelectItem value="Closing">Closing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        fetchTransactions();
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No transactions found</h3>
                        <p className="text-gray-500">Create your first real estate transaction.</p>
                        <Button
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Transaction
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parties</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedTransactions.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleView(transaction)}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{transaction.transactionNumber}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(transaction.createdAt)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-900">{transaction.propertyTitle}</p>
                                        <p className="text-xs text-gray-500">{transaction.propertyAddress}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                                    <User className="h-3 w-3" /> Buyer: {transaction.buyerName || 'N/A'}
                                                </span>
                                            <span className="text-xs text-gray-600 flex items-center gap-1">
                                                    <User className="h-3 w-3" /> Seller: {transaction.sellerName || 'N/A'}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {formatCurrency(transaction.salePrice)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={`${getStatusBadge(transaction.status)} flex items-center gap-1 w-fit`}>
                                            {getStatusIcon(transaction.status)}
                                            {transaction.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleView(transaction)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {(transaction.status === 'Negotiation' || transaction.status === 'PendingInspection') && (
                                                    <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                )}
                                                {transaction.status === 'Negotiation' && (
                                                    <DropdownMenuItem onClick={() => handleActionClick(transaction, 'accept')}>
                                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                        Accept
                                                    </DropdownMenuItem>
                                                )}
                                                {transaction.status === 'Closing' && (
                                                    <DropdownMenuItem onClick={() => handleActionClick(transaction, 'close')}>
                                                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                                        Close Deal
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        setSelectedTransaction(transaction);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {paginatedTransactions.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchTransactions}
            />

            <EditTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchTransactions}
                transaction={selectedTransaction}
            />

            <ViewTransactionModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedTransaction(null);
                }}
                transaction={selectedTransaction}
                onEdit={() => {
                    if (selectedTransaction) {
                        setIsViewModalOpen(false);
                        handleEdit(selectedTransaction);
                    }
                }}
                onDelete={() => {
                    if (selectedTransaction) {
                        setIsViewModalOpen(false);
                        setSelectedTransaction(selectedTransaction);
                        setIsDeleteModalOpen(true);
                    }
                }}
                onAccept={() => {
                    if (selectedTransaction) {
                        setIsViewModalOpen(false);
                        handleActionClick(selectedTransaction, 'accept');
                    }
                }}
                onClose={() => {
                    if (selectedTransaction) {
                        setIsViewModalOpen(false);
                        handleActionClick(selectedTransaction, 'close');
                    }
                }}
            />

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Transaction
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedTransaction.transactionNumber}</p>
                                <p className="text-sm text-gray-500">{selectedTransaction.propertyTitle}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Transaction
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Action Modal */}
            <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {actionType === 'accept' && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {actionType === 'close' && <FileText className="h-5 w-5 text-blue-600" />}
                            {actionType === 'accept' && 'Accept Transaction'}
                            {actionType === 'close' && 'Close Deal'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'accept' && 'Are you sure you want to accept this transaction? This will move it to the next stage.'}
                            {actionType === 'close' && 'Are you sure you want to close this deal? This will mark the transaction as completed.'}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedTransaction.transactionNumber}</p>
                                <p className="text-sm text-gray-500">
                                    Current status: {selectedTransaction.status}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleActionConfirm}
                            disabled={isProcessing}
                            className={
                                actionType === 'accept' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                    'bg-blue-600 hover:bg-blue-700 text-white'
                            }
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {actionType === 'accept' && <CheckCircle className="h-4 w-4 mr-2" />}
                                    {actionType === 'close' && <FileText className="h-4 w-4 mr-2" />}
                                    {actionType === 'accept' && 'Accept Transaction'}
                                    {actionType === 'close' && 'Close Deal'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default TransactionsPage;