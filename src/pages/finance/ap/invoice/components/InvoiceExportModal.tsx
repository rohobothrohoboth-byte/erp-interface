// src/pages/finance/ap/invoice/components/InvoiceExportModal.tsx

import React from 'react';
import { Download, RefreshCw, FileText } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Label } from '../../../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../../../components/ui/dialog';
import type{ InvoiceStats } from '../types/invoice.types';
import { formatCurrency } from '../utils/invoice.utils';

interface InvoiceExportModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    exportFormat: string;
    onFormatChange: (format: string) => void;
    onExport: () => void;
    isExporting: boolean;
    stats: InvoiceStats;
    periodName: string;
    filterStatus: string;
    filterType: string;
    totalFiltered: number;
}

export const InvoiceExportModal: React.FC<InvoiceExportModalProps> = ({
                                                                          isOpen,
                                                                          onOpenChange,
                                                                          exportFormat,
                                                                          onFormatChange,
                                                                          onExport,
                                                                          isExporting,
                                                                          stats,
                                                                          periodName,
                                                                          filterStatus,
                                                                          filterType,
                                                                          totalFiltered,
                                                                      }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-indigo-600" />
                        Export Invoice Entry Report
                    </DialogTitle>
                    <DialogDescription>
                        Export the invoice entry report in your preferred format.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <Label>Export Format</Label>
                        <Select value={exportFormat} onValueChange={onFormatChange}>
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
                            <p>Total Invoices: <strong>{stats.totalInvoices}</strong></p>
                            <p>Total Amount: <strong>{formatCurrency(stats.totalAmount)}</strong></p>
                            <p>Total Balance: <strong>{formatCurrency(stats.totalBalance)}</strong></p>
                            <p>Purchase: <strong>{stats.purchaseCount}</strong> | Sales: <strong>{stats.salesCount}</strong></p>
                            <p>Status: <strong>{filterStatus === 'All' ? 'All' : filterStatus}</strong></p>
                            <p>Type: <strong>{filterType === 'All' ? 'All' : filterType}</strong></p>
                            <p>Filtered Results: <strong>{totalFiltered}</strong></p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-400 space-y-1">
                        <p>📄 PDF: Professional formatted report</p>
                        <p>📊 Excel: Full data with multiple sheets</p>
                        <p>📋 CSV: Raw data for further analysis</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={onExport}
                        disabled={isExporting || stats.totalInvoices === 0}
                    >
                        {isExporting ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Export {exportFormat.toUpperCase()}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};