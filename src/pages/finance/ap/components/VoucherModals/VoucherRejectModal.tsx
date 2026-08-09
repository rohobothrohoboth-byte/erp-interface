// src/pages/finance/ap/components/VoucherModals/VoucherRejectModal.tsx
import React from 'react';
import { X, AlertCircle, FileText, User, Calendar } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Label } from '../../../../../components/ui/label';
import { Textarea } from '../../../../../components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../../../components/ui/dialog';
import type{ Voucher } from '../types/voucher.types';
import { formatDate } from '../utils/voucher.utils';

interface VoucherRejectModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    voucher: Voucher | null;
    rejectionReason: string;
    onReasonChange: (reason: string) => void;
    onConfirm: () => void;
    isSubmitting?: boolean;
}

export const VoucherRejectModal: React.FC<VoucherRejectModalProps> = ({
                                                                          isOpen,
                                                                          onOpenChange,
                                                                          voucher,
                                                                          rejectionReason,
                                                                          onReasonChange,
                                                                          onConfirm,
                                                                          isSubmitting = false,
                                                                      }) => {
    if (!voucher) return null;

    const commonReasons = [
        'Incorrect account code used',
        'Amount mismatch with supporting documents',
        'Missing required approvals',
        'Duplicate entry',
        'Invalid vendor information',
        'Period mismatch',
        'Insufficient supporting documentation',
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <X className="h-6 w-6" />
                        Reject Voucher
                    </DialogTitle>
                    <DialogDescription>
                        Provide a reason for rejecting this voucher. This will be recorded for audit purposes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Voucher Summary */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Voucher</span>
                            <span className="font-medium text-gray-900">{voucher.voucherNumber}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Type</span>
                            <span className="font-medium text-gray-900">{voucher.voucherType}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Date</span>
                            <span className="font-medium text-gray-900">{formatDate(voucher.voucherDate)}</span>
                        </div>
                        {voucher.vendorName && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Vendor</span>
                                <span className="font-medium text-gray-900">{voucher.vendorName}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Amount</span>
                            <span className="font-medium text-gray-900">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                }).format(voucher.totalDebit)}
                            </span>
                        </div>
                    </div>

                    {/* Rejection Reason */}
                    <div>
                        <Label className="text-sm font-medium">
                            Rejection Reason <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            value={rejectionReason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="Please provide a detailed reason for rejecting this voucher..."
                            rows={4}
                            className="mt-1.5"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                            {rejectionReason.length}/500 characters
                        </p>
                    </div>

                    {/* Common Reasons */}
                    <div>
                        <Label className="text-sm font-medium">Common Reasons</Label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {commonReasons.map((reason) => (
                                <button
                                    key={reason}
                                    onClick={() => onReasonChange(reason)}
                                    className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-700">
                            <p className="font-medium">Confirmation Required</p>
                            <p className="text-red-600">
                                Rejecting this voucher will require the creator to make corrections and resubmit for approval.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            onReasonChange('');
                        }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isSubmitting || !rejectionReason.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Rejecting...
                            </>
                        ) : (
                            <>
                                <X className="h-4 w-4 mr-2" />
                                Reject Voucher
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};