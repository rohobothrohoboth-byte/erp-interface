// components/finance/chart-of-accounts/modals/AccountDeleteModal.tsx

import React from 'react';
import { AlertCircle, Trash2, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import type { Account } from '../../../../types/finance/account.types';

interface AccountDeleteModalProps {
    open: boolean;
    account: Account | null;
    isSubmitting: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export const AccountDeleteModal: React.FC<AccountDeleteModalProps> = ({
                                                                          open,
                                                                          account,
                                                                          isSubmitting,
                                                                          onConfirm,
                                                                          onClose,
                                                                      }) => {
    if (!account) return null;

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Delete Account
                    </DialogTitle>
                    <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete <strong>{account.name}</strong>?
                    </p>
                    {account.childCount && account.childCount > 0 && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            ⚠️ This account has {account.childCount} child account(s).
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-4">
                        Code: <span className="font-mono">{account.code}</span>
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
                                Delete
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};