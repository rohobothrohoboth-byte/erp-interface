// src/pages/finance/budget/components/BudgetExportModal.tsx

import React from 'react';
import { Download, RefreshCw, FileText } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import type { BudgetStats } from '@/modules/finance/pages/budgeting/types';

interface BudgetExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: () => void;
    exportFormat: string;
    setExportFormat: (format: string) => void;
    exporting: boolean;
    budgets: any[];
    stats: BudgetStats;
    periodName: string;
    formatCurrency: (amount: number) => string;
}

export const BudgetExportModal: React.FC<BudgetExportModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onExport,
                                                                        exportFormat,
                                                                        setExportFormat,
                                                                        exporting,
                                                                        budgets,
                                                                        stats,
                                                                        periodName,
                                                                        formatCurrency,
                                                                    }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-indigo-600" />
                        Export Budget Report
                    </DialogTitle>
                    <DialogDescription>
                        Export the budget report in your preferred format.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label>Export Format</Label>
                        <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-red-500" />
                                        PDF - Printable Document
                                    </div>
                                </SelectItem>
                                <SelectItem value="excel">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-green-600" />
                                        Excel - Spreadsheet
                                    </div>
                                </SelectItem>
                                <SelectItem value="csv">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        CSV - Comma separated values
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Period</Label>
                        <div className="text-sm text-gray-600">{periodName}</div>
                    </div>

                    <div>
                        <Label>Summary</Label>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>Total Budgets: <strong>{budgets.length}</strong></p>
                            <p>Total Amount: <strong>{formatCurrency(stats.totalAmount)}</strong></p>
                            <p>Active: <strong>{stats.active}</strong> | Draft: <strong>{stats.draft}</strong></p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-400 space-y-1">
                        <p>📄 PDF: Professional formatted report</p>
                        <p>📊 Excel: Full data with multiple sheets</p>
                        <p>📋 CSV: Raw data for further analysis</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={exporting}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={onExport}
                        disabled={exporting || !budgets || budgets.length === 0}
                    >
                        {exporting ? (
                            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Exporting...</>
                        ) : (
                            <><Download className="h-4 w-4 mr-2" /> Export {exportFormat.toUpperCase()}</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};