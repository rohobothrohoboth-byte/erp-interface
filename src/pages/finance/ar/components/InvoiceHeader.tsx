// src/pages/finance/ar/components/InvoiceHeader.tsx
import React from 'react';
import { FileCheck, RefreshCw, Download, Printer } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface InvoiceHeaderProps {
    title: string;
    subtitle: string;
    onRefresh: () => void;
    onExport: () => void;
    onPrint: () => void;
    isRefreshing: boolean;
    isExporting: boolean;
    isPrintDisabled: boolean;
    isExportDisabled: boolean;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
                                                                title,
                                                                subtitle,
                                                                onRefresh,
                                                                onExport,
                                                                onPrint,
                                                                isRefreshing,
                                                                isExporting,
                                                                isPrintDisabled,
                                                                isExportDisabled,
                                                            }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                    <FileCheck className="w-6 h-6 text-white" />
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
            </div>
        </div>
    );
};