// src/pages/finance/ap/components/VoucherModals/VoucherExportModal.tsx
import React from 'react';
import { Download, FileText, RefreshCw } from 'lucide-react';
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
import type{ VoucherStats } from '../types/voucher.types';
import { formatCurrency } from '../utils/voucher.utils';

interface VoucherExportModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    exportFormat: string;
    onFormatChange: (format: string) => void;
    onExport: () => void;
    isExporting: boolean;
    stats: VoucherStats;
    periodName: string;
}

export const VoucherExportModal: React.FC<VoucherExportModalProps> = ({
                                                                          isOpen,
                                                                          onOpenChange,
                                                                          exportFormat,
                                                                          onFormatChange,
                                                                          onExport,
                                                                          isExporting,
                                                                          stats,
                                                                          periodName,
                                                                      }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-indigo-600">
                        <Download className="h-5 w-5" />
                        Export Report
                    </DialogTitle>
                    <DialogDescription>
                        Export the voucher report in your preferred format.
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
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="excel">Excel</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Period</Label>
                        <p className="text-sm text-gray-600">{periodName}</p>
                    </div>

                    <div>
                        <Label>Summary</Label>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>Total: <strong>{stats.totalVouchers}</strong></p>
                            <p>Amount: <strong>{formatCurrency(stats.totalAmount)}</strong></p>
                            <p>Posted: <strong>{stats.postedCount}</strong></p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={onExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};