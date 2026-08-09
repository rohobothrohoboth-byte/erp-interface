// components/finance/chart-of-accounts/modals/AccountViewModal.tsx

import React from 'react';
import {
    Layers,
    CheckCircle,
    XCircle,
    Calendar,
    Clock,
    User,
    Building2,
    Hash,
    FileText,
    Folder,
    Tag,
    Package,
    MapPin,
    Barcode,
    Users,
    Briefcase,
    DollarSign,
    CalendarDays,
    Link as LinkIcon,
    BarChart3,
    Edit,
    TrashIcon
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import type { Account } from '../../../types/finance/account.types';

interface Props {
    open: boolean; // ✅ ADD THIS - Required for Dialog
    account: Account | null;
    onClose: () => void;
    onEdit?: () => void;
}

export const AccountViewModal: React.FC<Props> = ({
                                                      open,  // ✅ ADD THIS
                                                      account,
                                                      onClose,
                                                      onEdit
                                                  }) => {
    // ============================================================
    // HELPERS
    // ============================================================

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Asset: 'bg-blue-100 text-blue-700 border-blue-200',
            Liability: 'bg-red-100 text-red-700 border-red-200',
            Equity: 'bg-purple-100 text-purple-700 border-purple-200',
            Revenue: 'bg-green-100 text-green-700 border-green-200',
            Expense: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, React.ReactNode> = {
            Asset: <Folder className="h-5 w-5 text-blue-600" />,
            Liability: <Folder className="h-5 w-5 text-red-600" />,
            Equity: <Folder className="h-5 w-5 text-purple-600" />,
            Revenue: <FileText className="h-5 w-5 text-green-600" />,
            Expense: <FileText className="h-5 w-5 text-orange-600" />,
        };
        return icons[type] || <Folder className="h-5 w-5 text-gray-600" />;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const formatShortDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const hasAssetDetails = account?.usefulLife || account?.salvageValue ||
        account?.acquisitionDate || account?.location ||
        account?.serialNumber || account?.manufacturer ||
        account?.model || account?.assignedTo ||
        account?.departmentId;

    // ============================================================
    // USAGE SECTION
    // ============================================================

    const renderUsageSection = () => {
        if (!account) return null;

        const hasUsageData = account.childCount !== undefined || account.usageCount !== undefined;
        if (!hasUsageData) return null;

        return (
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-gray-600" />
                    <h4 className="text-sm font-semibold text-gray-700">Usage Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {/* Child Accounts */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                            <Folder className="h-3 w-3" />
                            <span>Child Accounts</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-gray-900">
                                {account.childCount || 0}
                            </p>
                            {account.childCount && account.childCount > 0 ? (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                    Has Children
                                </Badge>
                            ) : (
                                <Badge className="bg-gray-100 text-gray-500 border-gray-200">
                                    No Children
                                </Badge>
                            )}
                        </div>
                        {account.childCount && account.childCount > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                This account has {account.childCount} child account(s)
                            </p>
                        )}
                    </div>

                    {/* Usage Count */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                            <LinkIcon className="h-3 w-3" />
                            <span>Usage Count</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-gray-900">
                                {account.usageCount || 0}
                            </p>
                            {account.usageCount && account.usageCount > 0 ? (
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                    In Use
                                </Badge>
                            ) : (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                    Not Used
                                </Badge>
                            )}
                        </div>
                        {account.usageCount && account.usageCount > 0 ? (
                            <p className="text-xs text-yellow-600 mt-1">
                                ⚠️ This account is used in {account.usageCount} transaction(s)
                            </p>
                        ) : (
                            <p className="text-xs text-green-600 mt-1">
                                ✅ This account is not used in any transactions
                            </p>
                        )}
                    </div>
                </div>

                {/* Delete Eligibility */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                        <TrashIcon className="h-3 w-3" />
                        <span>Delete Eligibility</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge
                            className={
                                (account.childCount === 0 || !account.childCount) &&
                                (account.usageCount === 0 || !account.usageCount)
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : 'bg-red-100 text-red-700 border-red-200'
                            }
                        >
                            {(account.childCount === 0 || !account.childCount) &&
                            (account.usageCount === 0 || !account.usageCount) ? (
                                <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Can Delete
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Cannot Delete
                                </>
                            )}
                        </Badge>
                        {account.childCount && account.childCount > 0 && (
                            <span className="text-xs text-red-600">
                                Has {account.childCount} child account(s)
                            </span>
                        )}
                        {account.usageCount && account.usageCount > 0 && (
                            <span className="text-xs text-red-600">
                                Used in {account.usageCount} transaction(s)
                            </span>
                        )}
                    </div>
                    {(account.childCount && account.childCount > 0) ||
                    (account.usageCount && account.usageCount > 0) ? (
                        <p className="text-xs text-gray-500 mt-2">
                            💡 Delete child accounts or remove transactions before deleting this account
                        </p>
                    ) : (
                        <p className="text-xs text-green-600 mt-2">
                            ✅ This account can be safely deleted
                        </p>
                    )}
                </div>
            </div>
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        // ✅ WRAPPED IN Dialog
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {!account ? (
                    // No Account State
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-indigo-600" />
                                Account Details
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-8 text-center text-gray-500">
                            <p>No account data available</p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={onClose}>Close</Button>
                        </DialogFooter>
                    </>
                ) : (
                    // Account Data State
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-indigo-600" />
                                Account Details
                            </DialogTitle>
                            <DialogDescription>
                                Complete information for account <span className="font-medium">{account.code}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Status Banner */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white shadow-sm">
                                        {getTypeIcon(account.accountType)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{account.name}</h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-sm text-gray-500">{account.code}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(account.accountType)}`}>
                                                {account.accountType}
                                            </span>
                                            <Badge className={account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                {account.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                {account.level && (
                                    <Badge variant="outline" className="bg-gray-100">
                                        Level {account.level}
                                    </Badge>
                                )}
                            </div>

                            {/* Basic Information */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                                        <Tag className="h-3 w-3" />
                                        <span>Account Code</span>
                                    </div>
                                    <p className="font-mono font-medium">{account.code}</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                                        <FileText className="h-3 w-3" />
                                        <span>Account Name</span>
                                    </div>
                                    <p className="font-medium">{account.name}</p>
                                </div>

                                {account.nameAm && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                                            <FileText className="h-3 w-3" />
                                            <span>Name (Amharic)</span>
                                        </div>
                                        <p className="font-medium">{account.nameAm}</p>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                                        <Folder className="h-3 w-3" />
                                        <span>Account Type</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(account.accountType)}
                                        <span>{account.accountType}</span>
                                    </div>
                                </div>

                                {account.accountSubType && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                                            <Tag className="h-3 w-3" />
                                            <span>Sub Type</span>
                                        </div>
                                        <p>{account.accountSubType}</p>
                                    </div>
                                )}

                                {account.parentName && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                                            <LinkIcon className="h-3 w-3" />
                                            <span>Parent Account</span>
                                        </div>
                                        <p className="text-sm">{account.parentName}</p>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span>Opening Balance</span>
                                    </div>
                                    <p className="font-medium">{formatCurrency(account.openingBalance || 0)}</p>
                                </div>

                                {account.openingBalanceDate && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>Opening Balance Date</span>
                                        </div>
                                        <p className="text-sm">{formatShortDate(account.openingBalanceDate)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {account.description && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                                        <FileText className="h-3 w-3" />
                                        <span>Description</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{account.description}</p>
                                </div>
                            )}

                            {/* Asset Details */}
                            {hasAssetDetails && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="h-4 w-4 text-gray-600" />
                                        <h4 className="text-sm font-semibold text-gray-700">Asset Details</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 bg-blue-50/30 rounded-lg p-3 border border-blue-100">
                                        {account.usefulLife && (
                                            <div className="bg-white rounded p-2 border border-gray-200">
                                                <div className="text-xs text-gray-500">Useful Life</div>
                                                <div className="font-medium">{account.usefulLife} years</div>
                                            </div>
                                        )}
                                        {account.salvageValue !== undefined && account.salvageValue !== null && (
                                            <div className="bg-white rounded p-2 border border-gray-200">
                                                <div className="text-xs text-gray-500">Salvage Value</div>
                                                <div className="font-medium">{formatCurrency(account.salvageValue)}</div>
                                            </div>
                                        )}
                                        {account.acquisitionDate && (
                                            <div className="bg-white rounded p-2 border border-gray-200">
                                                <div className="text-xs text-gray-500">Acquisition Date</div>
                                                <div className="font-medium">{formatShortDate(account.acquisitionDate)}</div>
                                            </div>
                                        )}
                                        {account.location && (
                                            <div className="bg-white rounded p-2 border border-gray-200">
                                                <div className="text-xs text-gray-500">Location</div>
                                                <div className="font-medium">{account.location}</div>
                                            </div>
                                        )}
                                        {account.serialNumber && (
                                            <div className="bg-white rounded p-2 border border-gray-200">
                                                <div className="text-xs text-gray-500">Serial Number</div>
                                                <div className="font-mono text-sm">{account.serialNumber}</div>
                                            </div>
                                        )}
                                        {account.manufacturer && (
                                            <div className="bg-white rounded p-2 border border-gray-200">
                                                <div className="text-xs text-gray-500">Manufacturer</div>
                                                <div className="font-medium">{account.manufacturer}</div>
                                            </div>
                                        )}
                                        {account.model && (
                                            <div className="bg-white rounded p-2 border border-gray-200">
                                                <div className="text-xs text-gray-500">Model</div>
                                                <div className="font-medium">{account.model}</div>
                                            </div>
                                        )}
                                        {account.assignedTo && (
                                            <div className="bg-white rounded p-2 border border-gray-200">
                                                <div className="text-xs text-gray-500">Assigned To</div>
                                                <div className="font-medium">{account.assignedTo}</div>
                                            </div>
                                        )}
                                        {account.departmentName && (
                                            <div className="bg-white rounded p-2 border border-gray-200">
                                                <div className="text-xs text-gray-500">Department</div>
                                                <div className="font-medium">{account.departmentName}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Usage Section */}
                            {renderUsageSection()}

                            {/* Audit Information */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-gray-600" />
                                    <h4 className="text-sm font-semibold text-gray-700">Audit Information</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div>
                                        <div className="text-xs text-gray-500">Created</div>
                                        <div className="text-sm">{formatDate(account.dateAdd || null)}</div>
                                    </div>
                                    {account.dateMod && (
                                        <div>
                                            <div className="text-xs text-gray-500">Last Modified</div>
                                            <div className="text-sm">{formatDate(account.dateMod)}</div>
                                        </div>
                                    )}
                                    {account.rowVersion && (
                                        <div className="col-span-2">
                                            <div className="text-xs text-gray-500">Row Version</div>
                                            <div className="text-xs font-mono text-gray-400 truncate">{account.rowVersion}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={onClose}>Close</Button>
                            {onEdit && (
                                <Button
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                    onClick={onEdit}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Account
                                </Button>
                            )}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};