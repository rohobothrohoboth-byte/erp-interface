// src/pages/procurement/receiving/GRNDetail.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    FileText,
    Calendar,
    DollarSign,
    Building2,
    User,
    Hash,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Send,
    FileCheck,
    Loader2,
    Download,
    Printer,
    Paperclip,
    Eye,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    Package,
    Image,
    File,
    FileArchive,
    FileSpreadsheet,
    ExternalLink,
    Copy,
    Check
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getGoodsReceiptNoteById,
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

const GRNDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [grn, setGrn] = useState<GoodsReceiptNote | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Fetch GRN
    const fetchGRN = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await getGoodsReceiptNoteById(id);
            setGrn(data);
            console.log('✅ GRN loaded:', data);
        } catch (error: any) {
            console.error('Error fetching GRN:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load GRN');
            navigate('/procurement/receipt');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchGRN();
    }, [fetchGRN]);

    // Handle complete
    const handleComplete = async () => {
        if (!grn) return;
        if (!confirm('Are you sure you want to complete this GRN?')) return;

        setProcessing(true);
        try {
            await completeGoodsReceiptNote(grn.id);
            showToast.success('GRN completed successfully');
            fetchGRN();
        } catch (error: any) {
            console.error('Error completing GRN:', error);
            showToast.error(error?.response?.data?.message || 'Failed to complete GRN');
        } finally {
            setProcessing(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!grn) return;
        if (!confirm(`Are you sure you want to delete GRN ${grn.grnNumber}?`)) return;

        setProcessing(true);
        try {
            await deleteGoodsReceiptNote(grn.id);
            showToast.success('GRN deleted successfully');
            navigate('/procurement/receipt');
        } catch (error: any) {
            console.error('Error deleting GRN:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete GRN');
        } finally {
            setProcessing(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading GRN...</p>
                </div>
            </div>
        );
    }

    if (!grn) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">GRN not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/procurement/receipt')}
                >
                    Back to GRNs
                </Button>
            </div>
        );
    }

    const isEditable = grn.status === 'Draft';
    const isCompletable = grn.status === 'Draft';

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
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {grn.grnNumber}
                            <Badge className={statusColors[grn.status] || 'bg-gray-100'}>
                                {statusIcons[grn.status]}
                                <span className="ml-1">{statusLabels[grn.status] || grn.status}</span>
                            </Badge>
                        </h1>
                        <p className="text-sm text-gray-500">
                            PO: {grn.purchaseOrderNumber || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isEditable && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="text-red-500"
                                disabled={processing}
                            >
                                {processing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4 mr-1" />
                                )}
                                Delete
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleComplete}
                                disabled={processing}
                            >
                                {processing ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Complete GRN
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3" />
                            Total Received
                        </p>
                        <p className="text-xl font-bold text-emerald-600">
                            {formatCurrency(grn.totalReceived)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            Warehouse
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {grn.warehouseName || 'N/A'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            Received By
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {grn.receivedBy || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {formatDate(grn.receivedDate)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Package className="w-3 h-3" />
                            Items
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {grn.totalReceived} received
                        </p>
                        <div className="flex gap-2 text-xs">
                            <span className="text-green-600">{grn.totalAccepted} accepted</span>
                            <span className="text-red-600">{grn.totalRejected} rejected</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <InfoItem
                    label="GRN Number"
                    value={grn.grnNumber}
                    icon={<Hash className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Delivery Note"
                    value={grn.deliveryNoteNumber || 'N/A'}
                    icon={<FileText className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Inspected By"
                    value={grn.inspectedBy || 'Not Assigned'}
                    icon={<User className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Received Date"
                    value={formatDate(grn.receivedDate)}
                    icon={<Calendar className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Created By"
                    value={grn.receivedBy}
                    icon={<User className="w-3.5 h-3.5" />}
                />
                <InfoItem
                    label="Status"
                    value={
                        <Badge className={statusColors[grn.status] || 'bg-gray-100'}>
                            {statusLabels[grn.status] || grn.status}
                        </Badge>
                    }
                    icon={<AlertCircle className="w-3.5 h-3.5" />}
                />
            </div>

            {/* Notes */}
            {grn.notes && (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{grn.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Items */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Received Items</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Accepted</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {grn.items?.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-500 text-center">{index + 1}</td>
                                    <td className="px-4 py-3 text-gray-700">
                                        <div>
                                            <span>{item.description || 'N/A'}</span>
                                            {item.rejectionReason && (
                                                <p className="text-xs text-red-500 mt-0.5">
                                                    Rejected: {item.rejectionReason}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-medium">{item.quantityReceived}</td>
                                    <td className="px-4 py-3 text-center text-green-600 font-medium">{item.quantityAccepted}</td>
                                    <td className="px-4 py-3 text-center text-red-600 font-medium">{item.quantityRejected}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant="outline" className={
                                            item.condition === 'Good' ? 'bg-green-50 text-green-700' :
                                                item.condition === 'Damaged' ? 'bg-red-50 text-red-700' :
                                                    'bg-yellow-50 text-yellow-700'
                                        }>
                                            {item.condition || 'Good'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                        {formatCurrency(item.unitPrice || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                        {formatCurrency(item.totalAmount || 0)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-semibold">
                            <tr>
                                <td colSpan={5} className="px-4 py-3 text-right text-gray-700">Total</td>
                                <td className="px-4 py-3 text-right text-emerald-600 text-lg">
                                    {formatCurrency(grn.totalReceived)}
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// ============================================================
// INFO ITEM COMPONENT
// ============================================================

const InfoItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({
                                                                                                   label,
                                                                                                   value,
                                                                                                   icon
                                                                                               }) => (
    <div className="space-y-1">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
            {icon}
            {label}
        </p>
        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
);

export default GRNDetail;