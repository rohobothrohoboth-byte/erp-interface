// src/pages/finance/ap/components/VoucherHeader.tsx
import React from 'react';
import { FileText, Plus, RefreshCw, Download, Printer } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface VoucherHeaderProps {
    title: string;
    subtitle: string;
    onRefresh: () => void;
    onExport: () => void;
    onPrint: () => void;
    onAdd: () => void;
    isRefreshing?: boolean;
    isExporting?: boolean;
    isPrintDisabled?: boolean;
    isExportDisabled?: boolean;
}

export const VoucherHeader: React.FC<VoucherHeaderProps> = ({
                                                                title,
                                                                subtitle,
                                                                onRefresh,
                                                                onExport,
                                                                onPrint,
                                                                onAdd,
                                                                isRefreshing = false,
                                                                isExporting = false,
                                                                isPrintDisabled = false,
                                                                isExportDisabled = false,
                                                            }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    onClick={onRefresh}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isRefreshing}
                >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    Refresh
                </Button>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={onExport}
                    disabled={isExporting || isExportDisabled}
                >
                    <Download size={16} />
                    {isExporting ? 'Exporting...' : 'Export'}
                </Button>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={onPrint}
                    disabled={isPrintDisabled}
                >
                    <Printer size={16} />
                    Print
                </Button>
                <Button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <Plus size={16} />
                    New Voucher
                </Button>
            </div>
        </div>
    );
};