// src/pages/procurement/receiving/QualityInspection.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Calendar,
    Package,
    User,
    Building2,
    Eye,
    Plus,
    Clock,
    Loader2,
    RefreshCw,
    ClipboardCheck,
    Users,
    FileText,
    Filter,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getGoodsReceiptNotes,
    completeGoodsReceiptNote
    } from '@/modules/procurement/services/grn.api';
import type { GoodsReceiptNote } from '@/modules/procurement/types/purchaseOrder.types';
// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Completed: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <Clock className="w-4 h-4" />,
    Completed: <CheckCircle className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
};

const statusLabels: Record<string, string> = {
    Draft: 'Pending Inspection',
    Completed: 'Completed',
    Cancelled: 'Failed',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const QualityInspection = () => {
    const navigate = useNavigate();

    // State
    const [inspections, setInspections] = useState<GoodsReceiptNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const ITEMS_PER_PAGE = 10;

    // Fetch GRNs for inspection
    const fetchInspections = useCallback(async (page: number = 1) => {
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

            console.log('📡 Fetching inspections with params:', params);
            const response = await getGoodsReceiptNotes(params);

            // Handle both response formats
            let data: GoodsReceiptNote[] = [];
            let total = 0;
            let pages = 1;

            if (Array.isArray(response)) {
                data = response;
                total = response.length;
                pages = Math.ceil(total / ITEMS_PER_PAGE);
            } else if (response?.data && Array.isArray(response.data)) {
                data = response.data;
                total = response.totalCount || response.total || data.length;
                pages = response.totalPages || Math.ceil(total / ITEMS_PER_PAGE);
            } else if (Array.isArray(response?.data)) {
                data = response.data;
                total = response.totalCount || data.length;
                pages = response.totalPages || Math.ceil(total / ITEMS_PER_PAGE);
            }

            setInspections(data);
            setTotalCount(total);
            setTotalPages(Math.max(pages, 1));
            console.log(`✅ Fetched ${data.length} inspections`);
        } catch (error: any) {
            console.error('Error fetching inspections:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load inspections');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filterStatus]);

    // Initial load and filter changes
    useEffect(() => {
        fetchInspections(1);
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    // Page change
    useEffect(() => {
        if (currentPage > 1) {
            fetchInspections(currentPage);
        }
    }, [currentPage]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        fetchInspections(1);
    };

    // Handle quick complete inspection
    const handleQuickComplete = async (id: string) => {
        if (!confirm('Are you sure you want to complete this inspection?')) return;

        setProcessingId(id);
        try {
            await completeGoodsReceiptNote(id);
            showToast.success('Inspection completed successfully');
            fetchInspections(currentPage);
        } catch (error: any) {
            console.error('Error completing inspection:', error);
            showToast.error(error?.response?.data?.message || 'Failed to complete inspection');
        } finally {
            setProcessingId(null);
        }
    };

    // Calculate quality score for a GRN
    const calculateQualityScore = (grn: GoodsReceiptNote): number => {
        if (grn.totalReceived === 0) return 0;
        return Math.round((grn.totalAccepted / grn.totalReceived) * 100);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    if (loading && !inspections.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading inspections...</p>
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/procurement/receipt')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quality Inspection</h1>
                        <p className="text-sm text-gray-500">
                            {totalCount} inspections • Verify received goods quality
                        </p>
                    </div>
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
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-700">
                            {inspections.filter(i => i.status === 'Draft').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Completed</p>
                        <p className="text-2xl font-bold text-green-700">
                            {inspections.filter(i => i.status === 'Completed').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-red-600">Failed</p>
                        <p className="text-2xl font-bold text-red-700">
                            {inspections.filter(i => i.status === 'Cancelled').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by GRN, PO, or warehouse..."
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
                    <option value="Draft">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Failed</option>
                </select>
            </div>

            {/* Inspection Cards */}
            {inspections.length === 0 ? (
                <div className="text-center py-12">
                    <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No inspections found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create a GRN to start an inspection'}
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
                <div className="grid grid-cols-1 gap-4">
                    {inspections.map((inspection) => {
                        const isPending = inspection.status === 'Draft';
                        const isCompleted = inspection.status === 'Completed';
                        const isFailed = inspection.status === 'Cancelled';
                        const statusKey = isPending ? 'Draft' : isCompleted ? 'Completed' : 'Cancelled';
                        const qualityScore = calculateQualityScore(inspection);

                        return (
                            <motion.div
                                key={inspection.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="cursor-pointer"
                                onClick={() => navigate(`/procurement/receipt/${inspection.id}`)}
                            >
                                <Card className={`hover:shadow-lg transition-shadow border-l-4 ${
                                    isCompleted ? 'border-l-green-500' :
                                        isFailed ? 'border-l-red-500' :
                                            'border-l-yellow-500'
                                }`}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                            {/* Left Side */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        isCompleted ? 'bg-green-100' :
                                                            isFailed ? 'bg-red-100' :
                                                                'bg-yellow-100'
                                                    }`}>
                                                        {isCompleted ? (
                                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                                        ) : isFailed ? (
                                                            <XCircle className="w-5 h-5 text-red-600" />
                                                        ) : (
                                                            <Clock className="w-5 h-5 text-yellow-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {inspection.grnNumber}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            PO: {inspection.purchaseOrderNumber || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <Badge className={`${statusColors[statusKey]} flex items-center gap-1 ml-2`}>
                                                        {statusIcons[statusKey]}
                                                        {statusLabels[statusKey]}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Received Date</p>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {formatDate(inspection.receivedDate)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Warehouse</p>
                                                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" />
                                                            {inspection.warehouseName || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Items</p>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {inspection.totalAccepted}/{inspection.totalReceived} accepted
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Quality Score</p>
                                                        {inspection.totalReceived > 0 ? (
                                                            <p className={`text-sm font-bold ${getScoreColor(qualityScore)}`}>
                                                                {qualityScore}%
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-gray-400">N/A</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Quality Score Bar */}
                                                {inspection.totalReceived > 0 && (
                                                    <div className="mt-3">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${getProgressColor(qualityScore)}`}
                                                                style={{ width: `${Math.min(qualityScore, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {inspection.notes && (
                                                    <div className="mt-3 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                                                        📝 {inspection.notes}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Side - Actions */}
                                            <div className="lg:w-64 flex flex-col gap-2">
                                                {isPending && (
                                                    <Button
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/procurement/inspection/${inspection.id}/perform`);
                                                        }}
                                                    >
                                                        <ClipboardCheck className="w-4 h-4 mr-2" />
                                                        Start Inspection
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/procurement/receipt/${inspection.id}`);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Button>

                                                {isPending && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full text-green-600 border-green-200 hover:bg-green-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleQuickComplete(inspection.id);
                                                        }}
                                                        disabled={processingId === inspection.id}
                                                    >
                                                        {processingId === inspection.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                        )}
                                                        Quick Complete
                                                    </Button>
                                                )}

                                                {isCompleted && (
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-green-600 border-green-200 bg-green-50"
                                                        disabled
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Passed ✓
                                                    </Button>
                                                )}

                                                {isFailed && (
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-red-600 border-red-200 bg-red-50"
                                                        disabled
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Failed ✗
                                                    </Button>
                                                )}

                                                {inspection.completedDate && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 justify-center mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Completed: {formatDate(inspection.completedDate)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} inspections
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

export default QualityInspection;