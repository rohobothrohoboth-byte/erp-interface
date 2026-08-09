// src/components/finance/accountsPayable/DeletePaymentModal.tsx

import { AlertTriangle, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface DeletePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    paymentNumber: string;
    paymentId?: string;  // ✅ Added
    vendorName?: string;  // ✅ Added
    amount?: number;  // ✅ Added
    periodName?: string;  // ✅ Added
    status?: string;  // ✅ Added
    loading?: boolean;  // ✅ Added
}

export default function DeletePaymentModal({
                                               isOpen,
                                               onClose,
                                               onConfirm,
                                               paymentNumber,
                                               paymentId,
                                               vendorName,
                                               amount,
                                               periodName,
                                               status,
                                               loading = false
                                           }: DeletePaymentModalProps) {
    const formatCurrency = (amount: number): string => {
        if (!amount || isNaN(amount)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getStatusColor = (status: string): string => {
        if (!status) return 'bg-gray-100 text-gray-800';
        switch (status?.toLowerCase()) {
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'posted':
            case 'paid':
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled':
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-blue-100 text-blue-800';
            case 'partially_paid': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        Delete Payment
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. The payment entry will be permanently removed.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Payment Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Payment Number</span>
                            <span className="text-sm font-semibold text-gray-900">{paymentNumber}</span>
                        </div>
                        {vendorName && (
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-gray-500">Vendor</span>
                                <span className="text-sm font-medium text-gray-900">{vendorName}</span>
                            </div>
                        )}
                        {amount && (
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-gray-500">Amount</span>
                                <span className="text-sm font-bold text-red-600">{formatCurrency(amount)}</span>
                            </div>
                        )}
                        {periodName && (
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-gray-500">Period</span>
                                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {periodName}
                                </Badge>
                            </div>
                        )}
                        {status && (
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-gray-500">Status</span>
                                <Badge className={getStatusColor(status)}>
                                    {status.replace('_', ' ')}
                                </Badge>
                            </div>
                        )}
                        {paymentId && (
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-gray-500">ID</span>
                                <span className="text-xs text-gray-400 font-mono">{paymentId.substring(0, 8)}...</span>
                            </div>
                        )}
                    </div>

                    {/* Warning Message */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-red-700 font-medium">
                                Are you sure you want to delete this payment?
                            </p>
                            <p className="text-xs text-red-600 mt-0.5">
                                This will permanently remove the payment record and cannot be undone.
                                {periodName && ` The payment is associated with period "${periodName}".`}
                            </p>
                        </div>
                    </div>

                    {/* Additional Warning for Posted/Paid Payments */}
                    {status && (status.toLowerCase() === 'posted' || status.toLowerCase() === 'paid' || status.toLowerCase() === 'completed') && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-orange-700 font-medium">
                                    Warning: Payment is {status}
                                </p>
                                <p className="text-xs text-orange-600 mt-0.5">
                                    This payment has already been processed. Deleting it may affect financial records.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <AlertTriangle className="h-4 w-4 mr-2 animate-pulse" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Delete Payment
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}