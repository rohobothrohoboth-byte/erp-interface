// src/pages/finance/ap/components/VoucherModals/VoucherApproveModal.tsx
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../../../components/ui/dialog';
import type{ Voucher } from '../types/voucher.types';

interface VoucherApproveModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    voucher: Voucher | null;
    onConfirm: () => void;
    isSubmitting?: boolean;
}

export const VoucherApproveModal: React.FC<VoucherApproveModalProps> = ({
                                                                            isOpen,
                                                                            onOpenChange,
                                                                            voucher,
                                                                            onConfirm,
                                                                            isSubmitting = false,
                                                                        }) => {
    if (!voucher) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-6 w-6" />
                        Approve Voucher
                    </DialogTitle>
                    <DialogDescription>
                        Confirm approval of this voucher. This action will mark the voucher as approved and ready for posting.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Voucher Number</span>
                            <span className="font-medium text-gray-900">{voucher.voucherNumber}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">Type</span>
                            <span className="font-medium text-gray-900">{voucher.voucherType}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">Amount</span>
                            <span className="font-medium text-gray-900">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                }).format(voucher.totalDebit)}
                            </span>
                        </div>
                        {voucher.vendorName && (
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-500">Vendor</span>
                                <span className="font-medium text-gray-900">{voucher.vendorName}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-700">
                            <p className="font-medium">Review Checklist</p>
                            <ul className="mt-1 space-y-1 list-disc list-inside text-yellow-600">
                                <li>Verify all entries are correct</li>
                                <li>Confirm voucher is balanced</li>
                                <li>Check supporting documents</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Approving...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Voucher
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};