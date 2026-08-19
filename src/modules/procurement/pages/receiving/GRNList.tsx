// src/pages/procurement/receiving/GRNList.tsx

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
    Package,
    Truck,
    User,
    Loader2,
    RefreshCw,
    XCircle
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getGoodsReceiptNotes,
    completeGoodsReceiptNote,
    deleteGoodsReceiptNote
} from '@/modules/procurement/services/grn.api';
import type { GoodsReceiptNote } from '@/modules/procurement/types/purchaseOrder.types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Completed: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <Clock className="w-4 h-4" />,
    Completed: <CheckCircle className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const GRNList = () => {
    const navigate = useNavigate();

    // State
    const [grns, setGrns] = useState<GoodsReceiptNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const ITEMS_PER_PAGE = 10;

    // Fetch GRNs
    // src/pages/procurement/receiving/GRNList.tsx

    const fetchGRNs = useCallback(async (page: number = 1) => {
        try {
            setLoading(true);
            const params: any = {
                page: page,
                pageSize: ITEMS_PER_PAGE,
                sortBy: 'ReceivedDate',
                sortOrder: 'DESC'
            };

            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            console.log('📡 Fetching GRNs with params:', params);
            const response = await getGoodsReceiptNotes(params);

            // ✅ Handle both response formats
            let data: GoodsReceiptNote[] = [];
            let total = 0;
            let pages = 1;

            if (Array.isArray(response)) {
                // Direct array response
                data = response;
                total = response.length;
                pages = Math.ceil(total / ITEMS_PER_PAGE);
            } else if (response?.data && Array.isArray(response.data)) {
                // Paginated response
                data = response.data;
                total = response.totalCount || response.total || data.length;
                pages = response.totalPages || Math.ceil(total / ITEMS_PER_PAGE);
            } else if (Array.isArray(response?.data)) {
                // Response.data is an array
                data = response.data;
                total = response.totalCount || data.length;
                pages = response.totalPages || Math.ceil(total / ITEMS_PER_PAGE);
            }

            console.log('📦 Processed data:', { data, total, pages });

            setGrns(data);
            setTotalCount(total);
            setTotalPages(pages);
            console.log(`✅ Fetched ${data.length} GRNs`);
        } catch (error: any) {
            console.error('Error fetching GRNs:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load GRNs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filterStatus]);

    // Initial load and filter changes
    useEffect(() => {
        fetchGRNs(1);
    }, [searchTerm, filterStatus]);

    // Page change
    useEffect(() => {
        if (currentPage > 1) {
            fetchGRNs(currentPage);
        }
    }, [currentPage]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        fetchGRNs(1);
    };

    // Handle complete
    const handleComplete = async (id: string) => {
        if (!confirm('Are you sure you want to complete this GRN?')) return;

        setProcessingId(id);
        try {
            await completeGoodsReceiptNote(id);
            showToast.success('GRN completed successfully');
            fetchGRNs(currentPage);
        } catch (error: any) {
            console.error('Error completing GRN:', error);
            showToast.error(error?.response?.data?.message || 'Failed to complete GRN');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this GRN?')) return;

        setProcessingId(id);
        try {
            await deleteGoodsReceiptNote(id);
            showToast.success('GRN deleted successfully');
            fetchGRNs(currentPage);
        } catch (error: any) {
            console.error('Error deleting GRN:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete GRN');
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
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
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

    if (loading && !grns.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading GRNs...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Goods Receipt Notes</h1>
                    <p className="text-sm text-gray-500">
                        {totalCount} GRNs • Manage goods receiving and inspection
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
                        onClick={() => navigate('/procurement/receipt/create')}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create GRN
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total GRNs</p>
                        <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">Draft</p>
                        <p className="text-2xl font-bold text-yellow-700">
                            {grns.filter(g => g.status === 'Draft').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Completed</p>
                        <p className="text-2xl font-bold text-green-700">
                            {grns.filter(g => g.status === 'Completed').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-red-600">Cancelled</p>
                        <p className="text-2xl font-bold text-red-700">
                            {grns.filter(g => g.status === 'Cancelled').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by GRN number, PO number, or vendor..."
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
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* GRN Cards */}
            {grns.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No GRNs found matching your criteria</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first Goods Receipt Note'}
                    </p>
                    <Button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/procurement/receipt/create')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create GRN
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {grns.map((grn) => (
                        <motion.div
                            key={grn.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="cursor-pointer"
                            onClick={() => navigate(`/procurement/receipt/${grn.id}`)}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <Package className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{grn.grnNumber}</h3>
                                                <p className="text-sm text-gray-500">
                                                    PO: {grn.purchaseOrderNumber || grn.purchaseOrderId?.substring(0, 8) || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(grn.status)}
                                    </div>

                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        {grn.warehouseName || 'Warehouse'}
                                    </p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Building2 className="w-4 h-4" />
                                            <span>Warehouse: {grn.warehouseName || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <DollarSign className="w-4 h-4" />
                                            <span>Total: {formatCurrency(grn.totalReceived)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>Received: {formatDate(grn.receivedDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <User className="w-4 h-4" />
                                            <span>Received by: {grn.receivedBy}</span>
                                        </div>
                                        {grn.deliveryNoteNumber && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FileText className="w-4 h-4" />
                                                <span>Delivery Note: {grn.deliveryNoteNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Received</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {grn.totalReceived}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Accepted</p>
                                            <p className="text-sm font-semibold text-green-600">
                                                {grn.totalAccepted}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Rejected</p>
                                            <p className="text-sm font-semibold text-red-600">
                                                {grn.totalRejected}
                                            </p>
                                        </div>
                                    </div>

                                    {grn.notes && (
                                        <div className="mt-3 text-sm text-gray-500 line-clamp-2">
                                            Notes: {grn.notes}
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/procurement/receipt/${grn.id}`);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>

                                        {grn.status === 'Draft' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 text-green-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleComplete(grn.id);
                                                    }}
                                                    disabled={processingId === grn.id}
                                                >
                                                    {processingId === grn.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                    )}
                                                    Complete
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(grn.id);
                                                    }}
                                                    disabled={processingId === grn.id}
                                                >
                                                    {processingId === grn.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                    )}
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} GRNs
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center px-3 text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default GRNList;