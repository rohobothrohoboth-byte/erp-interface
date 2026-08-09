// src/pages/procurement/requisitions/RequisitionList.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    Users,
    DollarSign,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    Filter,
    Download,
    Loader2,
    RefreshCw,
    X,
    FileCheck,
    Send
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { showToast } from '../../../layout/layout';
import {
    getRequisitions,
    deleteRequisition,
    submitRequisition,
    approveRequisition,
    rejectRequisition
} from '../../../services/procurement/requisition.api';
import type { Requisition } from '../../../types/procurement/requisition.types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    UnderReview: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Purchased: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <Edit className="w-3 h-3" />,
    Submitted: <Send className="w-3 h-3" />,
    UnderReview: <Clock className="w-3 h-3" />,
    Approved: <CheckCircle className="w-3 h-3" />,
    Rejected: <X className="w-3 h-3" />,
    Purchased: <FileCheck className="w-3 h-3" />,
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Submitted: 'Submitted',
    UnderReview: 'Under Review',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Purchased: 'Purchased',
};

const priorityColors: Record<string, string> = {
    Urgent: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-blue-100 text-blue-800 border-blue-200',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const RequisitionList = () => {
    const navigate = useNavigate();

    // State
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 10;

    // Fetch requisitions
    const fetchRequisitions = useCallback(async (page: number = 1) => {
        try {
            setLoading(true);
            const params: any = {
                page: page,
                pageSize: ITEMS_PER_PAGE,
                sortBy: 'SubmittedDate',
                sortOrder: 'DESC'
            };

            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            console.log('📡 Fetching requisitions with params:', params);
            const response = await getRequisitions(params);

            const data = response?.data?.data || response?.data || [];
            const total = response?.data?.totalCount || response?.data?.total || data.length || 0;
            const pages = response?.data?.totalPages || Math.ceil(total / ITEMS_PER_PAGE) || 1;

            setRequisitions(data);
            setTotalCount(total);
            setTotalPages(pages);
            console.log(`✅ Fetched ${data.length} requisitions`);
        } catch (error: any) {
            console.error('Error fetching requisitions:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load requisitions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filterStatus]);

    // Initial load and filter changes
    useEffect(() => {
        fetchRequisitions(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, filterStatus]);

    // Page change
    useEffect(() => {
        if (currentPage > 1) {
            fetchRequisitions(currentPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        fetchRequisitions(1);
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this requisition?')) return;

        setProcessingId(id);
        try {
            await deleteRequisition(id);
            showToast.success('Requisition deleted successfully');
            fetchRequisitions(currentPage);
        } catch (error: any) {
            console.error('Error deleting:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete requisition');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle submit
    const handleSubmit = async (id: string) => {
        setProcessingId(id);
        try {
            await submitRequisition(id);
            showToast.success('Requisition submitted for approval');
            fetchRequisitions(currentPage);
        } catch (error: any) {
            console.error('Error submitting:', error);
            showToast.error(error?.response?.data?.message || 'Failed to submit requisition');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle approve
    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            await approveRequisition(id, { comments: 'Approved' });
            showToast.success('Requisition approved successfully');
            fetchRequisitions(currentPage);
        } catch (error: any) {
            console.error('Error approving:', error);
            showToast.error(error?.response?.data?.message || 'Failed to approve requisition');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle reject
    const handleReject = async (id: string) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        setProcessingId(id);
        try {
            await rejectRequisition(id, { rejectionReason: reason });
            showToast.success('Requisition rejected');
            fetchRequisitions(currentPage);
        } catch (error: any) {
            console.error('Error rejecting:', error);
            showToast.error(error?.response?.data?.message || 'Failed to reject requisition');
        } finally {
            setProcessingId(null);
        }
    };

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
                day: 'numeric'
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

    if (loading && !requisitions.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading requisitions...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Requisitions</h1>
                    <p className="text-sm text-gray-500">
                        {totalCount} requisitions • Manage purchase requisitions
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
                        onClick={() => navigate('/procurement/requisitions/create')}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Requisition
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Requisitions</p>
                        <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Under Review</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {requisitions.filter(r => r.status === 'UnderReview').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Approved</p>
                        <p className="text-2xl font-bold text-green-700">
                            {requisitions.filter(r => r.status === 'Approved').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-red-600">Rejected</p>
                        <p className="text-2xl font-bold text-red-700">
                            {requisitions.filter(r => r.status === 'Rejected').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by title, description, or department..."
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
                    <option value="Submitted">Submitted</option>
                    <option value="UnderReview">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Purchased">Purchased</option>
                </select>
            </div>

            {/* Requisitions Table */}
            <Card>
                <CardContent className="p-6 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ID</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Department</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Requester</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Priority</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {requisitions.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-8 text-center text-gray-500">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p>No requisitions found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {searchTerm || filterStatus !== 'all'
                                            ? 'Try adjusting your filters'
                                            : 'Create your first requisition'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            requisitions.map((req) => (
                                <motion.tr
                                    key={req.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => navigate(`/procurement/requisitions/${req.id}`)}
                                >
                                    <td className="py-3 px-4 text-sm font-medium text-emerald-600">
                                        {req.requisitionNumber || req.id.substring(0, 8)}
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                        <div>
                                            <p className="font-medium text-gray-900 line-clamp-1">{req.title}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{req.description}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {req.departmentName || req.departmentId?.substring(0, 8)}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {req.requesterName || 'Unknown'}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Badge className={priorityColors[req.priority] || 'bg-gray-100 text-gray-800'}>
                                            {req.priority || 'Medium'}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {getStatusBadge(req.status)}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                                        {formatCurrency(req.totalAmount)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1 flex-wrap">
                                            {/* View Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/procurement/requisitions/${req.id}`);
                                                }}
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>

                                            {req.status === 'Draft' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-blue-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSubmit(req.id);
                                                        }}
                                                        disabled={processingId === req.id}
                                                        title="Submit"
                                                    >
                                                        {processingId === req.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Send className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/procurement/requisitions/${req.id}/edit`);
                                                        }}
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-red-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(req.id);
                                                        }}
                                                        disabled={processingId === req.id}
                                                        title="Delete"
                                                    >
                                                        {processingId === req.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </>
                                            )}

                                            {(req.status === 'Submitted' || req.status === 'UnderReview') && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-green-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleApprove(req.id);
                                                        }}
                                                        disabled={processingId === req.id}
                                                        title="Approve"
                                                    >
                                                        {processingId === req.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-red-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReject(req.id);
                                                        }}
                                                        disabled={processingId === req.id}
                                                        title="Reject"
                                                    >
                                                        {processingId === req.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <X className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </>
                                            )}

                                            {req.status === 'Approved' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-purple-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/procurement/po/create?requisitionId=${req.id}`);
                                                    }}
                                                    title="Create Purchase Order"
                                                >
                                                    <FileCheck className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} requisitions
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
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default RequisitionList;