// components/finance/chart-of-accounts/modals/AccountUsageModal.tsx

import React from 'react';
import { Link as LinkIcon, Loader2, FileText, Folder, DollarSign, AlertCircle, X, CheckCircle, Copy } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import type { UsageInfo } from '@/modules/finance/types/account.types';

interface AccountUsageModalProps {
    open: boolean;
    usageInfo: UsageInfo | null;
    loading?: boolean;
    onClose: () => void;
}

export const AccountUsageModal: React.FC<AccountUsageModalProps> = ({
                                                                        open,
                                                                        usageInfo,
                                                                        loading = false,
                                                                        onClose,
                                                                    }) => {
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast.success(`${label} copied to clipboard`);
        }).catch(() => {
            showToast.error('Failed to copy');
        });
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading usage information...</p>
                </div>
            );
        }

        if (!usageInfo) {
            return (
                <div className="py-8 text-center">
                    <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto" />
                    <p className="mt-2 text-sm text-gray-600">No usage information available</p>
                </div>
            );
        }

        const canDelete = usageInfo.canBeDeleted !== undefined ? usageInfo.canBeDeleted : usageInfo.canDelete;

        return (
            <div className="space-y-4 py-4">
                {/* Account Info - Removed UUID display */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium uppercase">Account</p>
                        <p className="font-medium text-gray-900 mt-1">{usageInfo.accountName}</p>
                        {usageInfo.accountCode && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400 font-mono">{usageInfo.accountCode}</span>
                                <button
                                    onClick={() => copyToClipboard(usageInfo.accountCode!, 'Account code')}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Copy code"
                                >
                                    <Copy className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium uppercase">Status</p>
                        <div className="mt-1">
                            <Badge className={canDelete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                {canDelete ? 'Available' : 'In Use'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Usage Statistics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                            <FileText className="h-3 w-3" />
                            <span>Journal Lines</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{usageInfo.journalLineCount || 0}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {usageInfo.journalLineCount === 0 ? 'Not used in any journal' : 'Used in journal entries'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                            <Folder className="h-3 w-3" />
                            <span>Child Accounts</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{usageInfo.hasChildren ? 'Yes' : 'No'}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {usageInfo.hasChildren ? 'Has child accounts' : 'No child accounts'}
                        </p>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                        <p className="text-xs text-emerald-700 font-medium uppercase">Total Debit</p>
                        <p className="text-lg font-bold text-emerald-900">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                            }).format(usageInfo.totalDebit || 0)}
                        </p>
                    </div>
                    <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
                        <p className="text-xs text-rose-700 font-medium uppercase">Total Credit</p>
                        <p className="text-lg font-bold text-rose-900">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                            }).format(usageInfo.totalCredit || 0)}
                        </p>
                    </div>
                </div>

                {/* Delete Eligibility */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium uppercase">Delete Eligibility</p>
                    <div className="mt-1 flex items-center gap-2">
                        <Badge className={
                            canDelete
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                        }>
                            {canDelete ? (
                                <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Can Delete
                                </>
                            ) : (
                                <>
                                    <X className="h-3 w-3 mr-1" />
                                    Cannot Delete
                                </>
                            )}
                        </Badge>
                    </div>
                    {usageInfo.reason && (
                        <p className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {usageInfo.reason}
                        </p>
                    )}
                    {canDelete && !usageInfo.reason && (
                        <p className="text-sm text-green-600 mt-2 flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            This account is not used in any transactions and has no child accounts.
                        </p>
                    )}
                </div>

                {/* ⚠️ Developer Info - Only visible in development */}
                {import.meta.env.DEV && (
                    <div className="bg-gray-100 rounded-lg p-2 border border-gray-300">
                        <p className="text-xs text-gray-400 font-mono">
                            ID: {usageInfo.accountId}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-blue-600" />
                        Account Usage Information
                    </DialogTitle>
                    <DialogDescription>
                        View how this account is being used in the system.
                    </DialogDescription>
                </DialogHeader>
                {renderContent()}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};