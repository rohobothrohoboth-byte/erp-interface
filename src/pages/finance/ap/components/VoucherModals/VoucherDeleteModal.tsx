// src/pages/finance/ap/components/VoucherModals/VoucherDeleteModal.tsx
import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
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

interface VoucherDeleteModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    voucher: Voucher | null;
    onConfirm: () => void;
    isSubmitting?: boolean;
}

export const VoucherDeleteModal: React.FC<VoucherDeleteModalProps> = ({
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
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-6 w-6" />
                        Delete Voucher
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the voucher and all associated data.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-800">
                                    You are about to delete voucher <span className="font-bold">{voucher.voucherNumber}</span>
                                </p>
                                <p className="text-sm text-red-600 mt-1">
                                    This will permanently remove this voucher from the system.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-xs text-gray-500">Voucher Number</span>
                                <p className="font-medium text-gray-900">{voucher.voucherNumber}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Type</span>
                                <p className="font-medium text-gray-900">{voucher.voucherType}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Status</span>
                                <p className="font-medium text-gray-900">{voucher.status}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Amount</span>
                                <p className="font-medium text-gray-900">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                    }).format(voucher.totalDebit)}
                                </p>
                            </div>
                            {voucher.vendorName && (
                                <div className="col-span-2">
                                    <span className="text-xs text-gray-500">Vendor</span>
                                    <p className="font-medium text-gray-900">{voucher.vendorName}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-700">
                            <p className="font-medium">Warning</p>
                            <p className="text-yellow-600">
                                Only draft vouchers can be deleted. This action cannot be reversed.
                            </p>
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
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isSubmitting || voucher.status !== 'Draft'}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Permanently
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};