// src/components/crm/realEstate/ViewTransactionModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    FileText,
    DollarSign,
    Calendar,
    Users,
    Building2,
    User,
    Edit,
    Trash2,
    Home,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Link,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { showToast } from '../../../layout/layout';
import type { RealEstateTransaction } from '../../../types/crm/crm.types';

interface ViewTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: RealEstateTransaction | null;
    onEdit?: () => void;
    onDelete?: () => void;
    onAccept?: () => void;
    onClose?: () => void;
}

const ViewTransactionModal: React.FC<ViewTransactionModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       transaction,
                                                                       onEdit,
                                                                       onDelete,
                                                                       onAccept,
                                                                       onClose: onCloseDeal,
                                                                   }) => {
    if (!isOpen || !transaction) return null;

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
            case 'Negotiation': return <TrendingUp className="h-4 w-4" />;
            case 'Accepted': return <CheckCircle className="h-4 w-4" />;
            case 'PendingInspection': return <Clock className="h-4 w-4" />;
            case 'PendingFinancing': return <Clock className="h-4 w-4" />;
            case 'PendingAppraisal': return <Clock className="h-4 w-4" />;
            case 'Closing': return <Calendar className="h-4 w-4" />;
            case 'Completed': return <CheckCircle className="h-4 w-4" />;
            case 'Cancelled': return <TrendingDown className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const canEdit = transaction.status === 'Negotiation' || transaction.status === 'PendingInspection';
    const canAccept = transaction.status === 'Negotiation';
    const canCloseDeal = transaction.status === 'Closing';

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
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-white/20 rounded-lg p-2">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">
                                            {transaction.transactionNumber}
                                        </h2>
                                        <p className="text-sm text-blue-200">
                                            {transaction.propertyTitle}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge className={getStatusBadge(transaction.status)}>
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(transaction.status)}
                                            {transaction.status}
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
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {formatCurrency(transaction.salePrice)}
                                    </p>
                                    <p className="text-xs text-gray-500">Sale Price</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(transaction.depositAmount)}
                                    </p>
                                    <p className="text-xs text-gray-500">Deposit</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(transaction.commissionAmount)}
                                    </p>
                                    <p className="text-xs text-gray-500">Commission</p>
                                </div>
                            </div>

                            {/* Parties */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <User className="h-4 w-4" /> Buyer
                                    </h3>
                                    <p className="font-medium">{transaction.buyerName || 'N/A'}</p>
                                    {transaction.buyerAgentName && (
                                        <p className="text-sm text-gray-500">Agent: {transaction.buyerAgentName}</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <User className="h-4 w-4" /> Seller
                                    </h3>
                                    <p className="font-medium">{transaction.sellerName || 'N/A'}</p>
                                    {transaction.sellerAgentName && (
                                        <p className="text-sm text-gray-500">Agent: {transaction.sellerAgentName}</p>
                                    )}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Offer Date</p>
                                    <p className="font-medium">{formatDate(transaction.offerDate)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Acceptance Date</p>
                                    <p className="font-medium">{formatDate(transaction.acceptanceDate)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Closing Date</p>
                                    <p className="font-medium">{formatDate(transaction.closingDate)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Possession Date</p>
                                    <p className="font-medium">{formatDate(transaction.possessionDate)}</p>
                                </div>
                            </div>

                            {/* Notes */}
                            {transaction.notes && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{transaction.notes}</p>
                                </div>
                            )}

                            {/* Property Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Home className="h-4 w-4" /> Property
                                </h3>
                                <p className="font-medium">{transaction.propertyTitle}</p>
                                <p className="text-sm text-gray-500">{transaction.propertyAddress}</p>
                            </div>
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
                            {canAccept && onAccept && (
                                <Button
                                    onClick={onAccept}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept
                                </Button>
                            )}
                            {canCloseDeal && onCloseDeal && (
                                <Button
                                    onClick={onCloseDeal}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Close Deal
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

export default ViewTransactionModal;