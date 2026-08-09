// src/hooks/useReportExport.ts

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { showToast } from '../../../../../layout/layout';
import * as XLSX from 'xlsx';

export const useReportExport = (reportName: string = 'report') => {
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [exporting, setExporting] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [title] = useState(`Export ${reportName}`);

    const handleExport = async (data: any) => {
        try {
            setExporting(true);

            if (exportFormat === 'pdf') {
                // Generate PDF
                const doc = new jsPDF('landscape', 'mm', 'a4');
                // ... PDF generation logic
                doc.save(`${reportName}-${new Date().toISOString().slice(0, 10)}.pdf`);
            } else if (exportFormat === 'excel') {
                // Generate Excel
                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Data');
                XLSX.writeFile(wb, `${reportName}-${new Date().toISOString().slice(0, 10)}.xlsx`);
            } else if (exportFormat === 'csv') {
                // Generate CSV
                const ws = XLSX.utils.json_to_sheet(data);
                const csv = XLSX.utils.sheet_to_csv(ws);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${reportName}-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            }

            showToast.success(`${reportName} exported successfully as ${exportFormat.toUpperCase()}`);
            setIsExportModalOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            showToast.error('Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    const handlePrintReport = (data: any) => {
        try {
            if (!data || !data.vouchers || data.vouchers.length === 0) {
                showToast.warning('No data to print');
                return;
            }

            // Use the VoucherReport class to generate PDF
            import('../pages/finance/ap/report/voucher.report').then(({ VoucherReport }) => {
                const doc = VoucherReport.generatePDF(
                    data.vouchers,
                    data.stats,
                    data.companyName || 'RST ERP System',
                    data.periodName || 'All Periods'
                );
                doc.save(`voucher-report-${new Date().toISOString().slice(0, 10)}.pdf`);
                showToast.success('Report printed successfully');
            }).catch((error) => {
                console.error('Error loading VoucherReport:', error);
                showToast.error('Failed to generate print report');
            });
        } catch (error) {
            console.error('Print error:', error);
            showToast.error('Failed to print report');
        }
    };

    const handleRefresh = (fetchData: () => void) => {
        fetchData();
        showToast.success('Data refreshed');
    };

    return {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handleExport,
        handlePrintReport,
        handleRefresh,
        title,
    };
};