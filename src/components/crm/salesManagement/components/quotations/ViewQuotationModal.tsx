// src/components/crm/salesManagement/components/quotations/ViewQuotationModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Download,
    Printer,
    Send,
    Edit,
    FileText,
    User,
    Mail,
    Phone,
    Calendar,
    Package,
    Trash2,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
} from 'lucide-react';
import { Button } from '../../../../ui/button';
import type { QuoteDto, QuoteLineDto } from '../../../../../types/crm/crm.types';

interface ViewQuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onSend?: () => void;
    onDownload?: () => void;
    onPrint?: () => void;
    onDelete?: () => void;
    quote: QuoteDto | null;
    isLoading?: boolean;
    isSending?: boolean;
    isDownloading?: boolean;
    canEdit?: boolean;
    canSend?: boolean;
}

const statusConfig: Record<number | string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    1: {
        label: 'Draft',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: <FileText className="h-4 w-4" />,
    },
    2: {
        label: 'Sent',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: <Send className="h-4 w-4" />,
    },
    3: {
        label: 'Viewed',
        color: 'text-cyan-700',
        bgColor: 'bg-cyan-100',
        icon: <AlertCircle className="h-4 w-4" />,
    },
    4: {
        label: 'Accepted',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <CheckCircle className="h-4 w-4" />,
    },
    5: {
        label: 'Rejected',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: <X className="h-4 w-4" />,
    },
    6: {
        label: 'Expired',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        icon: <Clock className="h-4 w-4" />,
    },
};

const ViewQuotationModal: React.FC<ViewQuotationModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onEdit,
                                                                   onSend,
                                                                   onDownload,
                                                                   onPrint,
                                                                   onDelete,
                                                                   quote,
                                                                   isLoading = false,
                                                                   isSending = false,
                                                                   isDownloading = false,
                                                                   canEdit = true,
                                                                   canSend = true,
                                                               }) => {
    if (!isOpen) return null;

    // Show loading state
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8"
                >
                    <div className="flex flex-col items-center justify-center py-12">
                        <RefreshCw className="h-12 w-12 animate-spin text-indigo-600" />
                        <span className="mt-4 text-gray-600 font-medium">Loading quote details...</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!quote) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };

    // Get status - handle both number and string
    const statusNum = typeof quote.status === 'string' ? parseInt(quote.status) : quote.status;
    const statusInfo = statusConfig[statusNum] || statusConfig[1];

    // Get line items - use quoteLines from the API
    const lineItems = quote.quoteLines || [];

    console.log('View Modal - Quote:', quote);
    console.log('View Modal - Line Items:', lineItems);

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
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
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
                                            {quote.quoteNumber}
                                        </h2>
                                        <p className="text-sm text-blue-200">
                                            Created {formatDate(quote.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${statusInfo.bgColor} ${statusInfo.color}`}>
                                        {statusInfo.icon}
                                        <span>{statusInfo.label}</span>
                                    </span>
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
                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                                {canSend && onSend && (
                                    <Button
                                        size="sm"
                                        onClick={onSend}
                                        disabled={isSending}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {isSending ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-1" />
                                                Send
                                            </>
                                        )}
                                    </Button>
                                )}
                                {canEdit && onEdit && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onEdit}
                                        className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                )}
                                {onDownload && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onDownload}
                                        disabled={isDownloading}
                                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                                    >
                                        {isDownloading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4 mr-1" />
                                                PDF
                                            </>
                                        )}
                                    </Button>
                                )}
                                {onPrint && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onPrint}
                                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                                    >
                                        <Printer className="h-4 w-4 mr-1" />
                                        Print
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onDelete}
                                        className="border-red-300 text-red-600 hover:bg-red-50 ml-auto"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                )}
                            </div>

                            {/* Status Message for Non-Editable Quotes */}
                            {!canEdit && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>
                                        This quote has been <strong>{statusInfo.label.toLowerCase()}</strong> and cannot be modified.
                                    </span>
                                </div>
                            )}

                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                                    <User className="h-4 w-4 mr-2" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{quote.customerName || 'N/A'}</p>
                                    </div>
                                    {quote.customerEmail && (
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="flex items-center text-gray-900">
                                                <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                                {quote.customerEmail}
                                            </p>
                                        </div>
                                    )}
                                    {quote.customerPhone && (
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="flex items-center text-gray-900">
                                                <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                                {quote.customerPhone}
                                            </p>
                                        </div>
                                    )}
                                    {quote.validUntil && (
                                        <div>
                                            <p className="text-xs text-gray-500">Valid Until</p>
                                            <p className="flex items-center text-gray-900">
                                                <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                                {formatDate(quote.validUntil)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                                    <Package className="h-4 w-4 mr-2" />
                                    Items ({lineItems.length})
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {lineItems.length > 0 ? (
                                            lineItems.map((item: QuoteLineDto) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-gray-900">{item.productName || item.description}</td>
                                                    <td className="px-4 py-2 text-gray-600">{item.description}</td>
                                                    <td className="px-4 py-2 text-right text-gray-900">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                                                    <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(item.totalPrice)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                                    No items in this quote
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="space-y-2 max-w-xs ml-auto">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(quote.subTotal || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax (10%)</span>
                                        <span className="font-medium">{formatCurrency(quote.taxAmount || 0)}</span>
                                    </div>
                                    {quote.discountAmount && quote.discountAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Discount</span>
                                            <span className="font-medium text-red-500">-{formatCurrency(quote.discountAmount)}</span>
                                        </div>
                                    )}
                                    {quote.shippingCost && quote.shippingCost > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="font-medium">{formatCurrency(quote.shippingCost)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-indigo-600">{formatCurrency(quote.totalAmount || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {quote.notes && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
                                </div>
                            )}

                            {/* Terms */}
                            {quote.termsAndConditions && (
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Terms & Conditions:</p>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.termsAndConditions}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusInfo.bgColor} ${statusInfo.color}`}>
                                    {statusInfo.icon}
                                    <span>{statusInfo.label}</span>
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" onClick={onClose}>
                                    Close
                                </Button>
                                {canEdit && onEdit && (
                                    <Button
                                        onClick={onEdit}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Quote
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ViewQuotationModal;