// components/finance/chart-of-accounts/modals/AccountBulkDeleteModal.tsx

import React from 'react';
import { AlertCircle, Trash2, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

interface AccountBulkDeleteModalProps {
    open: boolean;
    count: number;
    isSubmitting: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export const AccountBulkDeleteModal: React.FC<AccountBulkDeleteModalProps> = ({
                                                                                  open,
                                                                                  count,
                                                                                  isSubmitting,
                                                                                  onConfirm,
                                                                                  onClose,
                                                                              }) => {
    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Bulk Delete Accounts
                    </DialogTitle>
                    <DialogDescription>
                        You are about to delete {count} account(s).
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-gray-700 font-medium">This action cannot be undone.</p>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            Only accounts with no child accounts and no transactions will be deleted.
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                        {count} account(s) selected for deletion.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete All ({count})
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};