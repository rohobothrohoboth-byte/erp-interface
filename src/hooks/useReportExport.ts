// src/hooks/useReportExport.ts
import { useState, useCallback, useMemo } from 'react';
import { showToast } from '../layout/layout';
import { ExportService, type ExportOptions, type ExportResult, type ExportFormat } from '../services/finance/export.service';
import { ReportService } from '../services/finance/report.service';

// Import all report generators
import { BalanceSheetReport } from '../services/finance/report/balanceSheet.report';
import { IncomeStatementReport } from '../services/finance/report/incomeStatement.report';
import { CashFlowReport } from '../services/finance/report/cashFlow.report';
import { TrialBalanceReport } from '../services/finance/report/trialBalance.report';
import { GeneralLedgerReport } from '../services/finance/report/generalLedger.report';
import { TaxReportReport } from '../services/finance/report/taxReport.report';
import { VATReport } from '../services/finance/report/vatReport.report';
import { WHTReport } from '../services/finance/report/whtReport.report';
import { ARReport } from '../services/finance/report/arReport.report';
import { APReport } from '../services/finance/report/apReport.report';
import { BankAccountReport } from '../services/finance/report/bankAccount.report';
import { BankTransactionReport } from '../services/finance/report/bankTransaction.report';
import { BankReconciliationReport } from '../services/finance/report/bankReconciliation.report';
import { PettyCashReport } from '../services/finance/report/pettyCash.report';
import { CollectionFollowupReport } from '../services/finance/report/collectionFollowup.report';
import { InvoicePostingReport } from '../services/finance/report/invoicePosting.report';
import { InvoiceEntryReport } from '../services/finance/report/invoiceEntry.report';
import { BudgetReport } from '../services/finance/report/budget.report';


import { VoucherReport } from '../services/finance/report/voucher.report';
import { CostControllingReport } from '../services/finance/report/costControlling.report';
import { ConsolidationReport } from '../services/finance/report/consolidation.report';
//import { ComplianceReport } from '../services/finance/report/compliance.report';
//import { VendorPortalReport } from '../services/finance/report/vendorPortal.report';
//import { IFRSReport } from '../services/finance/report/ifrs.report';
// ============================================================
// TYPES
// ============================================================
export type ReportType =
    | 'balance-sheet'
    | 'income-statement'
    | 'cash-flow'
    | 'trial-balance'
    | 'general-ledger'
    | 'tax-report'
    | 'vat-report'
    | 'wht-report'
    | 'ar-report'
    | 'ap-report'
    | 'bank-accounts'
    | 'bank-transactions'
    | 'bank-reconciliation'
    | 'petty-cash'
    | 'collection-followup'
    | 'invoice-posting'
    | 'invoice-entry'
    | 'budget'
    | 'voucher'
    | 'cost-controlling'
    | 'consolidation'
    | 'compliance'
    | 'vendor-portal'
    | 'ifrs-reports';

export interface ReportExportState {
    isRefreshing: boolean;
    exportFormat: ExportFormat;
    isExporting: boolean;
    isExportModalOpen: boolean;
    lastExportResult: ExportResult | null;
    error: string | null;
}

export interface UseReportExportReturn {
    // State
    state: ReportExportState;
    isRefreshing: boolean;
    exportFormat: ExportFormat;
    isExporting: boolean;
    isExportModalOpen: boolean;
    lastExportResult: ExportResult | null;
    error: string | null;

    // Setters
    setExportFormat: (format: ExportFormat) => void;
    setIsExportModalOpen: (open: boolean) => void;
    setError: (error: string | null) => void;

    // Handlers
    handlePrintReport: (data: any) => Promise<void>;
    handleExport: (data: any, options?: { includeComparison?: boolean; quality?: 'draft' | 'standard' | 'high' }) => Promise<ExportResult | null>;
    handleRefresh: (fetchData: () => Promise<void>) => Promise<void>;
    clearLastExportResult: () => void;

    // Config
    config: ReportConfig;
    title: string;
    reportTitles: Record<ReportType, string>;
}

export interface ReportConfig {
    generateHTML: (data: any, companyName: string) => string;
    exportMethod: (data: any, options: ExportOptions) => Promise<ExportResult>;
    getFilename: (data: any) => string;
    getTitle: () => string;
    getDateField: (data: any) => string;
    getExportLabel: () => string;
}

// ============================================================
// REPORT CONFIGURATIONS
// ============================================================
const reportConfigs: Record<ReportType, ReportConfig> = {
    'balance-sheet': {
        generateHTML: BalanceSheetReport.generateHTML,
        exportMethod: ExportService.exportBalanceSheet.bind(ExportService),
        getFilename: (data) => `Balance-Sheet-${data.asOfDate || 'as-of-date'}`,
        getTitle: () => 'Balance Sheet',
        getDateField: (data) => data.asOfDate || '',
        getExportLabel: () => 'Balance Sheet',
    },
    'income-statement': {
        generateHTML: IncomeStatementReport.generateHTML,
        exportMethod: ExportService.exportIncomeStatement.bind(ExportService),
        getFilename: (data) => `Income-Statement-${data.endDate || data.startDate || 'period'}`,
        getTitle: () => 'Income Statement',
        getDateField: (data) => data.endDate || data.startDate || '',
        getExportLabel: () => 'Income Statement',
    },
    'cash-flow': {
        generateHTML: CashFlowReport.generateHTML,
        exportMethod: ExportService.exportCashFlow.bind(ExportService),
        getFilename: (data) => `Cash-Flow-${data.endDate || data.startDate || 'period'}`,
        getTitle: () => 'Cash Flow Statement',
        getDateField: (data) => data.endDate || data.startDate || '',
        getExportLabel: () => 'Cash Flow Statement',
    },
    'trial-balance': {
        generateHTML: TrialBalanceReport.generateHTML,
        exportMethod: ExportService.exportTrialBalance.bind(ExportService),
        getFilename: (data) => `Trial-Balance-${data.asOfDate || 'as-of-date'}`,
        getTitle: () => 'Trial Balance',
        getDateField: (data) => data.asOfDate || '',
        getExportLabel: () => 'Trial Balance',
    },
    'general-ledger': {
        generateHTML: GeneralLedgerReport.generateHTML,
        exportMethod: ExportService.exportGeneralLedger.bind(ExportService),
        getFilename: (data) => `General-Ledger-${data.accountCode || 'all'}-${data.startDate || ''}`,
        getTitle: () => 'General Ledger',
        getDateField: (data) => data.startDate || '',
        getExportLabel: () => 'General Ledger',
    },
    'tax-report': {
        generateHTML: TaxReportReport.generateHTML,
        exportMethod: ExportService.exportTaxReport.bind(ExportService),
        getFilename: (data) => `Tax-Report-${data.period || 'period'}`,
        getTitle: () => 'Tax Report',
        getDateField: (data) => data.period || '',
        getExportLabel: () => 'Tax Report',
    },
    'vat-report': {
        generateHTML: VATReport.generateHTML,
        exportMethod: ExportService.exportVATReport.bind(ExportService),
        getFilename: (data) => `VAT-Report-${data.period || 'period'}`,
        getTitle: () => 'VAT Report',
        getDateField: (data) => data.period || '',
        getExportLabel: () => 'VAT Report',
    },
    'wht-report': {
        generateHTML: WHTReport.generateHTML,
        exportMethod: ExportService.exportWHTReport.bind(ExportService),
        getFilename: (data) => `WHT-Report-${data.period || 'period'}`,
        getTitle: () => 'Withholding Tax Report',
        getDateField: (data) => data.period || '',
        getExportLabel: () => 'Withholding Tax Report',
    },
    'ar-report': {
        generateHTML: ARReport.generateHTML,
        exportMethod: ExportService.exportARReport.bind(ExportService),
        getFilename: (data) => `AR-Report-${data.periodName || data.period || 'period'}`,
        getTitle: () => 'Accounts Receivable Report',
        getDateField: (data) => data.periodName || data.period || '',
        getExportLabel: () => 'AR Report',
    },
    'ap-report': {
        generateHTML: APReport.generateHTML,
        exportMethod: ExportService.exportAPReport.bind(ExportService),
        getFilename: (data) => `AP-Report-${data.periodName || data.period || 'period'}`,
        getTitle: () => 'Accounts Payable Report',
        getDateField: (data) => data.periodName || data.period || '',
        getExportLabel: () => 'AP Report',
    },
    'bank-accounts': {
        generateHTML: BankAccountReport.generateHTML,
        exportMethod: ExportService.exportBankAccounts.bind(ExportService),
        getFilename: () => `Bank-Accounts-${new Date().toISOString().slice(0, 7)}`,
        getTitle: () => 'Bank Accounts',
        getDateField: () => '',
        getExportLabel: () => 'Bank Accounts',
    },
    'bank-transactions': {
        generateHTML: BankTransactionReport.generateHTML,
        exportMethod: ExportService.exportBankTransactions.bind(ExportService),
        getFilename: () => `Bank-Transactions-${new Date().toISOString().slice(0, 7)}`,
        getTitle: () => 'Bank Transactions',
        getDateField: () => '',
        getExportLabel: () => 'Bank Transactions',
    },
    'bank-reconciliation': {
        generateHTML: BankReconciliationReport.generateHTML,
        exportMethod: ExportService.exportBankReconciliation.bind(ExportService),
        getFilename: (data) => `Bank-Reconciliation-${data?.periodName || 'period'}`,
        getTitle: () => 'Bank Reconciliation',
        getDateField: (data) => data?.periodName || '',
        getExportLabel: () => 'Bank Reconciliation',
    },
    'petty-cash': {
        generateHTML: PettyCashReport.generateHTML,
        exportMethod: ExportService.exportPettyCash,
        getFilename: () => `Petty-Cash-${new Date().toISOString().slice(0, 7)}`,
        getTitle: () => 'Petty Cash Report',
        getDateField: () => '',
        getExportLabel: () => 'Petty Cash',
    },
    'collection-followup': {
        generateHTML: CollectionFollowupReport.generateHTML,
        exportMethod: ExportService.exportCollectionFollowup,
        getFilename: (data) => `Collection-Followup-${data?.periodName || 'period'}`,
        getTitle: () => 'Collection Follow-up Report',
        getDateField: (data) => data?.periodName || '',
        getExportLabel: () => 'Collection Follow-up',
    },
    'invoice-posting': {
        generateHTML: InvoicePostingReport.generateHTML,
        exportMethod: ExportService.exportInvoicePosting,
        getFilename: (data) => `Invoice-Posting-${data?.periodName || 'period'}`,
        getTitle: () => 'Invoice Posting Report',
        getDateField: (data) => data?.periodName || '',
        getExportLabel: () => 'Invoice Posting',
    },
    'invoice-entry': {
        generateHTML: InvoiceEntryReport.generateHTML,
        exportMethod: ExportService.exportInvoiceEntry,
        getFilename: (data) => `Invoice-Entry-${data?.periodName || 'period'}`,
        getTitle: () => 'Invoice Entry Report',
        getDateField: (data) => data?.periodName || '',
        getExportLabel: () => 'Invoice Entry',
    },
    'budget': {
        generateHTML: BudgetReport.generateHTML,
        exportMethod: ExportService.exportBudget,
        getFilename: (data) => `Budget-Report-${data?.periodName || 'period'}`,
        getTitle: () => 'Budget Report',
        getDateField: (data) => data?.periodName || '',
        getExportLabel: () => 'Budget',
    },
    'voucher': {
        generateHTML: VoucherReport.generateHTML,
        exportMethod: ExportService.exportVoucher,
        getFilename: (data) => `Voucher-Report-${data?.periodName || 'period'}`,
        getTitle: () => 'Voucher Report',
        getDateField: (data) => data?.periodName || '',
        getExportLabel: () => 'Voucher',
    },
    'cost-controlling': {
        generateHTML: CostControllingReport.generateHTML,
        exportMethod: ExportService.exportCostControlling,
        getFilename: (data) => `Cost-Controlling-${data?.periodName || 'period'}`,
        getTitle: () => 'Cost Controlling Report',
        getDateField: (data) => data?.periodName || '',
        getExportLabel: () => 'Cost Controlling',
    },
    'consolidation': {
        generateHTML: ConsolidationReport.generateHTML,
        exportMethod: ExportService.exportConsolidation,
        getFilename: (data) => `Consolidation-${data?.periodName || 'period'}`,
        getTitle: () => 'Consolidation Report',
        getDateField: (data) => data?.periodName || '',
        getExportLabel: () => 'Consolidation',
    },

};

const reportTitles: Record<ReportType, string> = {
    'balance-sheet': 'Export Balance Sheet',
    'income-statement': 'Export Income Statement',
    'cash-flow': 'Export Cash Flow Statement',
    'trial-balance': 'Export Trial Balance',
    'general-ledger': 'Export General Ledger',
    'tax-report': 'Export Tax Report',
    'vat-report': 'Export VAT Report',
    'wht-report': 'Export Withholding Tax Report',
    'ar-report': 'Export AR Report',
    'ap-report': 'Export AP Report',
    'bank-accounts': 'Export Bank Accounts',
    'bank-transactions': 'Export Bank Transactions',
    'bank-reconciliation': 'Export Bank Reconciliation',
    'petty-cash': 'Export Petty Cash Report',
    'collection-followup': 'Export Collection Follow-up Report',
    'invoice-posting': 'Export Invoice Posting Report',
    'invoice-entry': 'Export Invoice Entry Report',
    'budget': 'Export Budget Report',
    'voucher': 'Export Voucher Report',
    'cost-controlling': 'Export Cost Controlling Report',
    'consolidation': 'Export Consolidation Report',
    'compliance': 'Export Compliance Report',
    'vendor-portal': 'Export Vendor Portal Report',
    'ifrs-reports': 'Export IFRS Reports',
};

// ============================================================
// HOOK
// ============================================================
export function useReportExport(reportType: ReportType): UseReportExportReturn {
    const [state, setState] = useState<ReportExportState>({
        isRefreshing: false,
        exportFormat: 'pdf',
        isExporting: false,
        isExportModalOpen: false,
        lastExportResult: null,
        error: null,
    });

    const config = reportConfigs[reportType];
    const title = reportTitles[reportType];

    // ============================================================
    // SETTERS
    // ============================================================
    const setExportFormat = useCallback((format: ExportFormat) => {
        setState(prev => ({ ...prev, exportFormat: format }));
    }, []);

    const setIsExportModalOpen = useCallback((open: boolean) => {
        setState(prev => ({ ...prev, isExportModalOpen: open }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error }));
    }, []);

    const clearLastExportResult = useCallback(() => {
        setState(prev => ({ ...prev, lastExportResult: null }));
    }, []);

    // ============================================================
    // ✅ HANDLE PRINT REPORT - FIXED
    // ============================================================
    const handlePrintReport = useCallback(async (data: any) => {
        if (!data) {
            showToast.warning('No data available to print');
            return;
        }

        try {
            showToast.info('Preparing print preview...');

            // ✅ FIX: If data has transactions and summary, pass the whole object
            // The generateHTML method should handle extracting transactions
            const htmlContent = config.generateHTML(data, 'RST ERP System');

            const printWindow = window.open('', '_blank', 'width=1200,height=900,scrollbars=yes');
            if (!printWindow) {
                showToast.error('Please allow popups for this site');
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${config.getTitle()} - Print</title>
                    <meta charset="UTF-8">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Segoe UI', -apple-system, Arial, sans-serif; 
                            padding: 30px 20px;
                            background: #ffffff;
                            color: #1a1a2e;
                        }
                        .print-container {
                            max-width: 1100px;
                            margin: 0 auto;
                        }
                        @media print {
                            body { padding: 10px; }
                            .page-break { page-break-before: always; }
                            .no-print { display: none !important; }
                        }
                        @media (max-width: 768px) {
                            body { padding: 15px; }
                        }
                    </style>
                    <link rel="stylesheet" href="/src/styles/report.css">
                </head>
                <body>
                    <div class="print-container">
                        ${htmlContent}
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                setTimeout(function() {
                                    window.close();
                                }, 1000);
                            }, 600);
                        };
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();

            showToast.success('Print preview ready');
        } catch (error) {
            console.error('Error preparing print:', error);
            showToast.error('Failed to prepare print preview');
            setError(error instanceof Error ? error.message : 'Print preparation failed');
        }
    }, [config, setError]);

    // ============================================================
    // HANDLE EXPORT
    // ============================================================
    const handleExport = useCallback(async (
        data: any,
        options?: { includeComparison?: boolean; quality?: 'draft' | 'standard' | 'high' }
    ): Promise<ExportResult | null> => {
        if (!data) {
            showToast.warning('No data available to export');
            setState(prev => ({ ...prev, error: 'No data available' }));
            return null;
        }

        const { exportFormat } = state;

        setState(prev => ({ ...prev, isExporting: true, error: null }));

        try {
            showToast.info(`Generating ${exportFormat.toUpperCase()} file...`);

            const filename = config.getFilename(data);
            const exportOptions: ExportOptions = {
                format: exportFormat,
                filename,
                includeComparison: options?.includeComparison || false,
                quality: options?.quality || 'standard',
            };

            const result = await config.exportMethod(data, exportOptions);

            if (result.success) {
                showToast.success(`${exportFormat.toUpperCase()} exported successfully`);
                setState(prev => ({
                    ...prev,
                    isExportModalOpen: false,
                    lastExportResult: result,
                }));
            } else {
                showToast.error(`Export failed: ${result.error || 'Unknown error'}`);
                setState(prev => ({ ...prev, error: result.error || 'Export failed' }));
            }

            return result;
        } catch (error) {
            console.error(`Error exporting ${exportFormat}:`, error);
            const errorMessage = error instanceof Error ? error.message : `Failed to export ${exportFormat.toUpperCase()}`;
            showToast.error(errorMessage);
            setState(prev => ({ ...prev, error: errorMessage }));
            return null;
        } finally {
            setState(prev => ({ ...prev, isExporting: false }));
        }
    }, [state.exportFormat, config]);

    // ============================================================
    // HANDLE REFRESH
    // ============================================================
    const handleRefresh = useCallback(async (fetchData: () => Promise<void>) => {
        setState(prev => ({ ...prev, isRefreshing: true, error: null }));

        try {
            await fetchData();
            showToast.success('Data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
            showToast.error(errorMessage);
            setState(prev => ({ ...prev, error: errorMessage }));
        } finally {
            setState(prev => ({ ...prev, isRefreshing: false }));
        }
    }, []);

    // ============================================================
    // MEMOIZED RETURN
    // ============================================================
    return useMemo(() => ({
        // State
        state,
        isRefreshing: state.isRefreshing,
        exportFormat: state.exportFormat,
        isExporting: state.isExporting,
        isExportModalOpen: state.isExportModalOpen,
        lastExportResult: state.lastExportResult,
        error: state.error,

        // Setters
        setExportFormat,
        setIsExportModalOpen,
        setError,

        // Handlers
        handlePrintReport,
        handleExport,
        handleRefresh,
        clearLastExportResult,

        // Config
        config,
        title,
        reportTitles,
    }), [
        state,
        setExportFormat,
        setIsExportModalOpen,
        setError,
        handlePrintReport,
        handleExport,
        handleRefresh,
        clearLastExportResult,
        config,
        title,
        reportTitles,
    ]);
}

// ============================================================
// EXPORT HELPERS (for components)
// ============================================================
export const exportFormatLabels: Record<ExportFormat, string> = {
    pdf: 'PDF Document',
    excel: 'Excel Spreadsheet',
    csv: 'CSV File',
};

export const exportFormatIcons: Record<ExportFormat, string> = {
    pdf: '📄',
    excel: '📊',
    csv: '📋',
};

export const exportFormatDescriptions: Record<ExportFormat, string> = {
    pdf: 'Best for printing and sharing',
    excel: 'Editable spreadsheet format',
    csv: 'Comma-separated values for data analysis',
};