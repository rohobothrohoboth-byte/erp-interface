// components/finance/chart-of-accounts/modals/AccountExportModal.tsx

import React, { useState } from 'react';
import { Download, FileText, Loader2, FileJson, File, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import type { Account } from '../../../types/finance/account.types';

interface Props {
    open: boolean; // ✅ ADD THIS
    totalCount: number;
    accounts: Account[];
    exportFormat: 'csv' | 'json' | 'pdf';
    setExportFormat: (format: 'csv' | 'json' | 'pdf') => void;
    exporting: boolean;
    onExport: () => void;
    onClose: () => void;
}

export const AccountExportModal: React.FC<Props> = ({
                                                        open, // ✅ ADD THIS
                                                        totalCount,
                                                        accounts,
                                                        exportFormat,
                                                        setExportFormat,
                                                        exporting,
                                                        onExport,
                                                        onClose,
                                                    }) => {
    const [isExporting, setIsExporting] = useState(false);

    const activeCount = accounts.filter(a => a.isActive).length;
    const inactiveCount = accounts.filter(a => !a.isActive).length;

    const typeCounts = accounts.reduce((acc, a) => {
        acc[a.accountType] = (acc[a.accountType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const handleExport = async () => {
        if (isExporting || exporting) return;
        setIsExporting(true);
        try {
            await onExport();
        } finally {
            setIsExporting(false);
        }
    };

    const getFormatIcon = () => {
        switch (exportFormat) {
            case 'csv':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'json':
                return <FileJson className="h-4 w-4 text-green-600" />;
            case 'pdf':
                return <File className="h-4 w-4 text-red-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const getFormatDescription = () => {
        switch (exportFormat) {
            case 'csv':
                return 'CSV format is ideal for Excel and spreadsheet applications.';
            case 'json':
                return 'JSON format preserves all data structure and relationships.';
            case 'pdf':
                return 'PDF format is ideal for printing and sharing as a document.';
            default:
                return '';
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        // ✅ WRAPPED IN Dialog
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-indigo-600" />
                        Export Chart of Accounts
                    </DialogTitle>
                    <DialogDescription>
                        Export the chart of accounts in your preferred format.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Format Selection */}
                    <div>
                        <Label className="text-sm font-medium">Export Format</Label>
                        <Select
                            value={exportFormat}
                            onValueChange={(value: 'csv' | 'json' | 'pdf') => setExportFormat(value)}
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <span>CSV - Comma separated values</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="json">
                                    <div className="flex items-center gap-2">
                                        <FileJson className="h-4 w-4 text-green-600" />
                                        <span>JSON - Structured data</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="pdf">
                                    <div className="flex items-center gap-2">
                                        <File className="h-4 w-4 text-red-500" />
                                        <span>PDF - Document format</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-400 mt-1.5">
                            {getFormatDescription()}
                        </p>
                    </div>

                    {/* Summary Statistics */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <Label className="text-sm font-medium text-gray-700">Export Summary</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-500">Total Accounts:</span>
                                <span className="font-semibold text-gray-900">{totalCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-500">Active:</span>
                                <span className="font-semibold text-green-600">{activeCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-500">Inactive:</span>
                                <span className="font-semibold text-red-600">{inactiveCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-500">Account Types:</span>
                                <span className="font-semibold text-gray-900">{Object.keys(typeCounts).length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Account Type Breakdown */}
                    {Object.keys(typeCounts).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(typeCounts).map(([type, count]) => (
                                <span
                                    key={type}
                                    className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600 border border-gray-200"
                                >
                                    {type}: {count}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Info Message */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-blue-700 flex items-start gap-2">
                            <span>💡</span>
                            <span>
                                The export will include all accounts with their complete details including
                                codes, names, types, levels, and relationship information.
                            </span>
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isExporting || exporting}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleExport}
                        disabled={isExporting || exporting || !accounts || accounts.length === 0}
                    >
                        {(isExporting || exporting) ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                {getFormatIcon()}
                                <span className="ml-2">Export {exportFormat.toUpperCase()}</span>
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};