// src/pages/crm/realEstate/CommissionsPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign,
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
    Users,
    User,
    Calendar,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    FileText,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { Skeleton } from '../../../components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';
import { showToast } from '../../../layout/layout';
import { getCommissions, deleteCommission, approveCommission, payCommission } from '../../../services/crm/crm.api';
import type { Commission } from '../../../types/crm/crm.types';
import AddCommissionModal from '../../../components/crm/realEstate/AddCommissionModal';
import EditCommissionModal from '../../../components/crm/realEstate/EditCommissionModal';
import ViewCommissionModal from '../../../components/crm/realEstate/ViewCommissionModal';

const ITEMS_PER_PAGE = 10;

const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
        'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Approved': 'bg-green-100 text-green-700 border-green-200',
        'Paid': 'bg-blue-100 text-blue-700 border-blue-200',
        'Disputed': 'bg-red-100 text-red-700 border-red-200',
    };
    return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Pending': return <Clock className="h-3 w-3" />;
        case 'Approved': return <CheckCircle className="h-3 w-3" />;
        case 'Paid': return <DollarSign className="h-3 w-3" />;
        case 'Disputed': return <XCircle className="h-3 w-3" />;
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

const CommissionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterAgent, setFilterAgent] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'pay' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [agents, setAgents] = useState<string[]>([]);

    useEffect(() => {
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            if (filterAgent !== 'all') params.agentId = filterAgent;
            if (searchTerm) params.search = searchTerm;

            const response = await getCommissions(params);
            const data = response.data?.data || response.data || [];
            setCommissions(Array.isArray(data) ? data : []);

            // Extract unique agent names for filter
            const agentNames = data.map((c: Commission) => c.agentName).filter(Boolean);
            setAgents([...new Set(agentNames)]);
        } catch (error) {
            console.error('Error fetching commissions:', error);
            showToast.error('Failed to load commissions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCommission) return;
        try {
            setIsProcessing(true);
            await deleteCommission(selectedCommission.id);
            showToast.success('Commission deleted successfully');
            setIsDeleteModalOpen(false);
            fetchCommissions();
        } catch (error) {
            showToast.error('Failed to delete commission');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedCommission) return;
        try {
            setIsProcessing(true);
            await approveCommission(selectedCommission.id);
            showToast.success('Commission approved successfully');
            setIsActionModalOpen(false);
            fetchCommissions();
        } catch (error) {
            showToast.error('Failed to approve commission');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePay = async () => {
        if (!selectedCommission) return;
        try {
            setIsProcessing(true);
            await payCommission(selectedCommission.id);
            showToast.success('Commission paid successfully');
            setIsActionModalOpen(false);
            fetchCommissions();
        } catch (error) {
            showToast.error('Failed to pay commission');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleView = (commission: Commission) => {
        setSelectedCommission(commission);
        setIsViewModalOpen(true);
    };

    const handleEdit = (commission: Commission) => {
        setSelectedCommission(commission);
        setIsEditModalOpen(true);
    };

    const handleActionClick = (commission: Commission, action: 'approve' | 'pay') => {
        setSelectedCommission(commission);
        setActionType(action);
        setIsActionModalOpen(true);
    };

    const handleActionConfirm = () => {
        if (actionType === 'approve') handleApprove();
        else if (actionType === 'pay') handlePay();
    };

    const filteredCommissions = commissions.filter(c => {
        const search = searchTerm.toLowerCase();
        return c.transactionNumber?.toLowerCase().includes(search) ||
            c.agentName?.toLowerCase().includes(search) ||
            c.transactionId?.toLowerCase().includes(search);
    });

    const totalPages = Math.ceil(filteredCommissions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCommissions = filteredCommissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const stats = {
        total: commissions.length,
        pending: commissions.filter(c => c.status === 'Pending').length,
        approved: commissions.filter(c => c.status === 'Approved').length,
        paid: commissions.filter(c => c.status === 'Paid').length,
        totalAmount: commissions.reduce((sum, c) => sum + (c.amount || 0), 0),
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
                        <DollarSign className="h-6 w-6 text-indigo-600" />
                        Commissions
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage agent commissions and payouts
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={fetchCommissions}
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
                        Add Commission
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
                                <DollarSign className="h-6 w-6 text-blue-700" />
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
                                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total Value</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {formatCurrency(stats.totalAmount)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-purple-700" />
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
                        placeholder="Search commissions..."
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
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Disputed">Disputed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterAgent} onValueChange={setFilterAgent}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Agent" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Agents</SelectItem>
                        {agents.map((agent) => (
                            <SelectItem key={agent} value={agent}>
                                {agent}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setFilterAgent('all');
                        fetchCommissions();
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedCommissions.length === 0 ? (
                    <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No commissions found</h3>
                        <p className="text-gray-500">Create your first commission.</p>
                        <Button
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Commission
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Percentage</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedCommissions.map((commission) => (
                                <tr
                                    key={commission.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleView(commission)}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{commission.transactionNumber || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(commission.createdAt)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-900">{commission.agentName || 'N/A'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {formatCurrency(commission.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {commission.percentage}%
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={`${getStatusBadge(commission.status)} flex items-center gap-1 w-fit`}>
                                            {getStatusIcon(commission.status)}
                                            {commission.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className="bg-gray-100 text-gray-700">
                                            {commission.isBuyerAgent ? 'Buyer Agent' :
                                                commission.isSellerAgent ? 'Seller Agent' : 'Agent'}
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
                                                <DropdownMenuItem onClick={() => handleView(commission)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {commission.status === 'Pending' && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleEdit(commission)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleActionClick(commission, 'approve')}>
                                                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {commission.status === 'Approved' && (
                                                    <DropdownMenuItem onClick={() => handleActionClick(commission, 'pay')}>
                                                        <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                                                        Pay
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        setSelectedCommission(commission);
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
                {paginatedCommissions.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredCommissions.length)} of {filteredCommissions.length} commissions
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
            <AddCommissionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchCommissions}
            />

            <EditCommissionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchCommissions}
                commission={selectedCommission}
            />

            <ViewCommissionModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedCommission(null);
                }}
                commission={selectedCommission}
                onEdit={() => {
                    if (selectedCommission) {
                        setIsViewModalOpen(false);
                        handleEdit(selectedCommission);
                    }
                }}
                onDelete={() => {
                    if (selectedCommission) {
                        setIsViewModalOpen(false);
                        setSelectedCommission(selectedCommission);
                        setIsDeleteModalOpen(true);
                    }
                }}
                onApprove={() => {
                    if (selectedCommission) {
                        setIsViewModalOpen(false);
                        handleActionClick(selectedCommission, 'approve');
                    }
                }}
                onPay={() => {
                    if (selectedCommission) {
                        setIsViewModalOpen(false);
                        handleActionClick(selectedCommission, 'pay');
                    }
                }}
            />

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Commission
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this commission? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCommission && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedCommission.agentName || 'Commission'}</p>
                                <p className="text-sm text-gray-500">Amount: {formatCurrency(selectedCommission.amount)}</p>
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
                                    Delete Commission
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
                            {actionType === 'approve' && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {actionType === 'pay' && <DollarSign className="h-5 w-5 text-blue-600" />}
                            {actionType === 'approve' && 'Approve Commission'}
                            {actionType === 'pay' && 'Pay Commission'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'approve' && 'Are you sure you want to approve this commission? This will mark it as approved and ready for payment.'}
                            {actionType === 'pay' && 'Are you sure you want to pay this commission? This will mark it as paid.'}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCommission && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedCommission.agentName || 'Commission'}</p>
                                <p className="text-sm text-gray-500">
                                    Amount: {formatCurrency(selectedCommission.amount)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Current status: {selectedCommission.status}
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
                                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' :
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
                                    {actionType === 'approve' && <CheckCircle className="h-4 w-4 mr-2" />}
                                    {actionType === 'pay' && <DollarSign className="h-4 w-4 mr-2" />}
                                    {actionType === 'approve' && 'Approve Commission'}
                                    {actionType === 'pay' && 'Pay Commission'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default CommissionsPage;