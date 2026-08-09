// src/components/crm/realEstate/ViewCommissionModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    DollarSign,
    User,
    Edit,
    Trash2,
    FileText,
    Percent,
    Clock,
    CheckCircle,
    TrendingUp,
    Calendar,
    Link,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { showToast } from '../../../layout/layout';
import type { Commission } from '../../../types/crm/crm.types';

interface ViewCommissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    commission: Commission | null;
    onEdit?: () => void;
    onDelete?: () => void;
    onApprove?: () => void;
    onPay?: () => void;
}

const ViewCommissionModal: React.FC<ViewCommissionModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     commission,
                                                                     onEdit,
                                                                     onDelete,
                                                                     onApprove,
                                                                     onPay,
                                                                 }) => {
    if (!isOpen || !commission) return null;

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
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

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
            case 'Pending': return <Clock className="h-4 w-4" />;
            case 'Approved': return <CheckCircle className="h-4 w-4" />;
            case 'Paid': return <DollarSign className="h-4 w-4" />;
            case 'Disputed': return <Link className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const canEdit = commission.status === 'Pending';
    const canApprove = commission.status === 'Pending';
    const canPay = commission.status === 'Approved';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-white/20 rounded-lg p-2">
                                        <DollarSign className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">
                                            Commission Details
                                        </h2>
                                        <p className="text-sm text-blue-200">
                                            Transaction: {commission.transactionNumber || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge className={getStatusBadge(commission.status)}>
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(commission.status)}
                                            {commission.status}
                                        </span>
                                    </Badge>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto p-6 max-h-[calc(90vh-180px)]">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {formatCurrency(commission.amount)}
                                    </p>
                                    <p className="text-xs text-gray-500">Amount</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {commission.percentage}%
                                    </p>
                                    <p className="text-xs text-gray-500">Percentage</p>
                                </div>
                            </div>

                            {/* Agent Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Agent
                                </h3>
                                <p className="font-medium">{commission.agentName || 'N/A'}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {commission.isBuyerAgent && (
                                        <Badge className="bg-blue-100 text-blue-700">Buyer Agent</Badge>
                                    )}
                                    {commission.isSellerAgent && (
                                        <Badge className="bg-green-100 text-green-700">Seller Agent</Badge>
                                    )}
                                </div>
                            </div>

                            {/* Transaction Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Transaction
                                </h3>
                                <p className="font-medium">{commission.transactionNumber || 'N/A'}</p>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Created</p>
                                    <p className="font-medium">{formatDate(commission.createdAt)}</p>
                                </div>
                                {commission.paymentDate && (
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-500">Payment Date</p>
                                        <p className="font-medium">{formatDate(commission.paymentDate)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {commission.notes && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{commission.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                            {canEdit && onEdit && (
                                <Button
                                    onClick={onEdit}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                            {canApprove && onApprove && (
                                <Button
                                    onClick={onApprove}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            )}
                            {canPay && onPay && (
                                <Button
                                    onClick={onPay}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Pay
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="destructive"
                                    onClick={onDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ViewCommissionModal;