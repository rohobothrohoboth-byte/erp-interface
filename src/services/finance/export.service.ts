// src/services/finance/export.service.ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ReportService, type PDFGenerationResult } from './report.service';
import { BalanceSheetReport } from './report/balanceSheet.report';
import { IncomeStatementReport } from './report/incomeStatement.report';
import { CashFlowReport } from './report/cashFlow.report';
import { TrialBalanceReport } from './report/trialBalance.report';
import { GeneralLedgerReport } from './report/generalLedger.report';
import { TaxReportReport } from './report/taxReport.report';
import { VATReport } from './report/vatReport.report';
import { WHTReport } from './report/whtReport.report';
import { ARReport } from './report/arReport.report';
import { APReport } from './report/apReport.report';
import { BankAccountReport } from './report/bankAccount.report';
import { BankTransactionReport } from './report/bankTransaction.report';
import { BankReconciliationReport } from './report/bankReconciliation.report';
import { PettyCashReport } from './report/pettyCash.report';
import { CollectionFollowupReport } from './report/collectionFollowup.report';
import { InvoicePostingReport } from './report/invoicePosting.report';
import type { InvoicePostingStats, SalesInvoice } from './report/invoicePosting.report';
import { InvoiceEntryReport } from './report/invoiceEntry.report';
import type { InvoiceEntryData, InvoiceEntryStats } from './report/invoiceEntry.report';
import { BudgetReport } from './report/budget.report';
// ============================================================
// TYPES
// ============================================================
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportOptions {
    format: ExportFormat;
    filename: string;
    includeComparison?: boolean;
    password?: string;
    quality?: 'draft' | 'standard' | 'high';
}

export interface ExportResult {
    format: ExportFormat;
    filename: string;
    fileSize: number;
    mimeType: string;
    success: boolean;
    error?: string;
}

// ============================================================
// EXPORT SERVICE
// ============================================================
export class ExportService {
    private static readonly MIME_TYPES: Record<ExportFormat, string> = {
        pdf: 'application/pdf',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv;charset=utf-8',
    };

    private static readonly FILE_EXTENSIONS: Record<ExportFormat, string> = {
        pdf: 'pdf',
        excel: 'xlsx',
        csv: 'csv',
    };

    // ============================================================
    // ✅ UTILITY METHODS - DEFINED FIRST
    // ============================================================
    private static getFullFilename(filename: string, format: ExportFormat): string {
        const ext = this.FILE_EXTENSIONS[format];
        return filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
    }

    private static createSuccessResult(
        format: ExportFormat,
        filename: string,
        blobOrResult: Blob | PDFGenerationResult
    ): ExportResult {
        const blob = blobOrResult instanceof Blob ? blobOrResult : blobOrResult.blob;
        return {
            format,
            filename,
            fileSize: blob.size,
            mimeType: this.MIME_TYPES[format],
            success: true,
        };
    }

    private static createErrorResult(
        format: ExportFormat,
        filename: string,
        error: any
    ): ExportResult {
        return {
            format,
            filename,
            fileSize: 0,
            mimeType: this.MIME_TYPES[format],
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }

    private static downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // ============================================================
    // ✅ PUBLIC: BALANCE SHEET
    // ============================================================
    static async exportBalanceSheet(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportBalanceSheetPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportBalanceSheetExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportBalanceSheetCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

    // ============================================================
    // ✅ PUBLIC: INCOME STATEMENT
    // ============================================================
    static async exportIncomeStatement(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportIncomeStatementPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportIncomeStatementExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportIncomeStatementCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

    // ============================================================
    // ✅ PUBLIC: CASH FLOW
    // ============================================================
    static async exportCashFlow(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportCashFlowPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportCashFlowExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportCashFlowCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

    // ============================================================
    // ✅ PUBLIC: TRIAL BALANCE
    // ============================================================
    static async exportTrialBalance(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportTrialBalancePDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportTrialBalanceExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportTrialBalanceCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

    // ============================================================
    // ✅ PUBLIC: GENERAL LEDGER
    // ============================================================
    static async exportGeneralLedger(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportGeneralLedgerPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportGeneralLedgerExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportGeneralLedgerCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

    // ============================================================
    // ✅ PUBLIC: TAX REPORT
    // ============================================================
    static async exportTaxReport(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportTaxReportPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportTaxReportExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportTaxReportCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

    // ============================================================
    // ✅ PUBLIC: VAT REPORT
    // ============================================================
    static async exportVATReport(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportVATReportPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportVATReportExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportVATReportCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

    // ============================================================
    // ✅ PUBLIC: WHT (WITHHOLDING TAX) REPORT
    // ============================================================
    static async exportWHTReport(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportWHTReportPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportWHTReportExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportWHTReportCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

    // ============================================================
    // ✅ PRIVATE: BALANCE SHEET IMPLEMENTATIONS
    // ============================================================
    private static async exportBalanceSheetPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = BalanceSheetReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Balance Sheet PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportBalanceSheetExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createBalanceSheetWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Balance Sheet Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportBalanceSheetCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createBalanceSheetCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Balance Sheet CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

    // ============================================================
    // ✅ PRIVATE: INCOME STATEMENT IMPLEMENTATIONS
    // ============================================================
    private static async exportIncomeStatementPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = IncomeStatementReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Income Statement PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportIncomeStatementExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createIncomeStatementWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Income Statement Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportIncomeStatementCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createIncomeStatementCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Income Statement CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

    // ============================================================
    // ✅ PRIVATE: CASH FLOW IMPLEMENTATIONS
    // ============================================================
    private static async exportCashFlowPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = CashFlowReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Cash Flow PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportCashFlowExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createCashFlowWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Cash Flow Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportCashFlowCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createCashFlowCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Cash Flow CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

    // ============================================================
    // ✅ PRIVATE: TRIAL BALANCE IMPLEMENTATIONS
    // ============================================================
    private static async exportTrialBalancePDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = TrialBalanceReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Trial Balance PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportTrialBalanceExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createTrialBalanceWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Trial Balance Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportTrialBalanceCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createTrialBalanceCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Trial Balance CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

    // ============================================================
    // ✅ PRIVATE: GENERAL LEDGER IMPLEMENTATIONS
    // ============================================================
    private static async exportGeneralLedgerPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = GeneralLedgerReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating General Ledger PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportGeneralLedgerExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createGeneralLedgerWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating General Ledger Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportGeneralLedgerCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createGeneralLedgerCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating General Ledger CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

    // ============================================================
    // ✅ PRIVATE: TAX REPORT IMPLEMENTATIONS
    // ============================================================
    private static async exportTaxReportPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = TaxReportReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Tax Report PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportTaxReportExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createTaxReportWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Tax Report Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportTaxReportCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createTaxReportCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Tax Report CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

    // ============================================================
    // ✅ PRIVATE: VAT REPORT IMPLEMENTATIONS
    // ============================================================
    private static async exportVATReportPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = VATReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating VAT Report PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportVATReportExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createVATReportWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating VAT Report Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportVATReportCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createVATReportCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating VAT Report CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

    // ============================================================
    // ✅ PRIVATE: WHT REPORT IMPLEMENTATIONS
    // ============================================================
    private static async exportWHTReportPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = WHTReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating WHT Report PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportWHTReportExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createWHTReportWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating WHT Report Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportWHTReportCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createWHTReportCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating WHT Report CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }
    static async exportARReport(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportARReportPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportARReportExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportARReportCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ PUBLIC: AP REPORT
// ============================================================
    static async exportAPReport(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportAPReportPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportAPReportExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportAPReportCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: AR REPORT IMPLEMENTATIONS
// ============================================================
    private static async exportARReportPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = ARReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating AR Report PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportARReportExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createARReportWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating AR Report Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportARReportCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createARReportCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating AR Report CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: AP REPORT IMPLEMENTATIONS
// ============================================================
    private static async exportAPReportPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = APReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating AP Report PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportAPReportExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createAPReportWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating AP Report Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportAPReportCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createAPReportCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating AP Report CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

    static async exportBankAccounts(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportBankAccountsPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportBankAccountsExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportBankAccountsCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ✅ PUBLIC: BANK ACCOUNTS
// ============================================================
    static async exportBankAccounts(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportBankAccountsPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportBankAccountsExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportBankAccountsCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: BANK ACCOUNTS PDF - Uses BankAccountReport
// ============================================================
    private static async exportBankAccountsPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            // ✅ Directly use BankAccountReport.generatePDF - NO separate method needed
            const doc = BankAccountReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Bank Accounts PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: BANK ACCOUNTS EXCEL
// ============================================================
    private static async exportBankAccountsExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createBankAccountsWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Bank Accounts Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: BANK ACCOUNTS CSV
// ============================================================
    private static async exportBankAccountsCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createBankAccountsCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Bank Accounts CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }
    static async exportBankTransactions(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportBankTransactionsPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportBankTransactionsExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportBankTransactionsCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: BANK TRANSACTIONS IMPLEMENTATIONS
// ============================================================
    private static async exportBankTransactionsPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = BankTransactionReport.generatePDF(data, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Bank Transactions PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportBankTransactionsExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createBankTransactionsWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Bank Transactions Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportBankTransactionsCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createBankTransactionsCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Bank Transactions CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

    static async exportBankReconciliation(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportBankReconciliationPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportBankReconciliationExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportBankReconciliationCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }
    static async exportPettyCash(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportPettyCashPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportPettyCashExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportPettyCashCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: PETTY CASH IMPLEMENTATIONS
// ============================================================
    private static async exportPettyCashPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const transactions = Array.isArray(data) ? data : (data.transactions || []);
            const balance = data.balance || null;
            const doc = PettyCashReport.generatePDF(transactions, balance, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Petty Cash PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportPettyCashExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createPettyCashWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Petty Cash Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportPettyCashCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createPettyCashCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Petty Cash CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: BANK RECONCILIATION IMPLEMENTATIONS
// ============================================================
    private static async exportBankReconciliationPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const doc = BankReconciliationReport.generatePDF(
                data.transactions || [],
                data.summary || {},
                'RST ERP System'
            );
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Bank Reconciliation PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportBankReconciliationExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createBankReconciliationWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Bank Reconciliation Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportBankReconciliationCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createBankReconciliationCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Bank Reconciliation CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

    static async exportCollectionFollowup(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportCollectionFollowupPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportCollectionFollowupExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportCollectionFollowupCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

    static async exportInvoicePosting(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportInvoicePostingPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportInvoicePostingExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportInvoicePostingCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: INVOICE POSTING IMPLEMENTATIONS
// ============================================================
    private static async exportInvoicePostingPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const invoices = Array.isArray(data) ? data : (data.invoices || []);
            const stats = data.stats || {};
            const periodName = data.periodName || 'All Periods';
            const doc = InvoicePostingReport.generatePDF(invoices, stats, 'RST ERP System', periodName);
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Invoice Posting PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportInvoicePostingExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createInvoicePostingWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Invoice Posting Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportInvoicePostingCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createInvoicePostingCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Invoice Posting CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: COLLECTION FOLLOW-UP IMPLEMENTATIONS
// ============================================================
    private static async exportCollectionFollowupPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const customers = Array.isArray(data) ? data : (data.customers || []);
            const stats = data.stats || {};
            const doc = CollectionFollowupReport.generatePDF(customers, stats, 'RST ERP System');
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Collection Follow-up PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportCollectionFollowupExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createCollectionFollowupWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Collection Follow-up Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportCollectionFollowupCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createCollectionFollowupCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Collection Follow-up CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }



    static async exportInvoiceEntry(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportInvoiceEntryPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportInvoiceEntryExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportInvoiceEntryCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: INVOICE ENTRY IMPLEMENTATIONS
// ============================================================
    private static async exportInvoiceEntryPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const invoices = Array.isArray(data) ? data : (data.invoices || []);
            const stats = data.stats || {};
            const periodName = data.periodName || 'All Periods';
            const doc = InvoiceEntryReport.generatePDF(invoices, stats, 'RST ERP System', periodName);
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Invoice Entry PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportInvoiceEntryExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createInvoiceEntryWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Invoice Entry Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportInvoiceEntryCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createInvoiceEntryCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Invoice Entry CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }



    static async exportBudget(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportBudgetPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportBudgetExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportBudgetCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ PRIVATE: BUDGET IMPLEMENTATIONS
// ============================================================
    private static async exportBudgetPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const budgets = Array.isArray(data) ? data : (data.budgets || []);
            const stats = data.stats || {};
            const periodName = data.periodName || 'All Periods';
            const doc = BudgetReport.generatePDF(budgets, stats, 'RST ERP System', periodName);
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Budget PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

    private static async exportBudgetExcel(data: any, filename: string): Promise<ExportResult> {
        try {
            const workbook = ExportService.createBudgetWorkbook(data);
            const blob = await ExportService.saveWorkbookToBlob(workbook);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('excel', filename, blob);
        } catch (error) {
            console.error('Error generating Budget Excel:', error);
            return ExportService.createErrorResult('excel', filename, error);
        }
    }

    private static async exportBudgetCSV(data: any, filename: string): Promise<ExportResult> {
        try {
            const rows = ExportService.createBudgetCSVRows(data);
            const blob = ExportService.createCSVBlob(rows);
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('csv', filename, blob);
        } catch (error) {
            console.error('Error generating Budget CSV:', error);
            return ExportService.createErrorResult('csv', filename, error);
        }
    }


    // ============================================================
// ✅ VOUCHER EXPORT
// ============================================================
    static async exportVoucher(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportVoucherPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportVoucherExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportVoucherCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

    private static async exportVoucherPDF(data: any, filename: string): Promise<ExportResult> {
        try {
            const vouchers = Array.isArray(data) ? data : (data.vouchers || []);
            const stats = data.stats || {};
            const periodName = data.periodName || 'All Periods';
            const doc = VoucherReport.generatePDF(vouchers, stats, 'RST ERP System', periodName);
            const blob = doc.output('blob');
            ExportService.downloadBlob(blob, filename);
            return ExportService.createSuccessResult('pdf', filename, blob);
        } catch (error) {
            console.error('Error generating Voucher PDF:', error);
            return ExportService.createErrorResult('pdf', filename, error);
        }
    }

// ============================================================
// ✅ COST CONTROLLING EXPORT
// ============================================================
    static async exportCostControlling(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportCostControllingPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportCostControllingExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportCostControllingCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ CONSOLIDATION EXPORT
// ============================================================
    static async exportConsolidation(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportConsolidationPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportConsolidationExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportConsolidationCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ COMPLIANCE EXPORT
// ============================================================
    static async exportCompliance(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportCompliancePDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportComplianceExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportComplianceCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ VENDOR PORTAL EXPORT
// ============================================================
    static async exportVendorPortal(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportVendorPortalPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportVendorPortalExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportVendorPortalCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }

// ============================================================
// ✅ IFRS REPORTS EXPORT
// ============================================================
    static async exportIFRSReports(data: any, options: ExportOptions): Promise<ExportResult> {
        const { format, filename } = options;
        const fullFilename = ExportService.getFullFilename(filename, format);

        try {
            switch (format) {
                case 'pdf':
                    return await ExportService.exportIFRSReportsPDF(data, fullFilename);
                case 'excel':
                    return await ExportService.exportIFRSReportsExcel(data, fullFilename);
                case 'csv':
                    return await ExportService.exportIFRSReportsCSV(data, fullFilename);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            return ExportService.createErrorResult(format, fullFilename, error);
        }
    }
// Add helper methods

    // ============================================================
    // ✅ PRIVATE: HELPER METHODS
    // ============================================================
    private static formatNumber(value: any): string {
        if (value === undefined || value === null || value === '') return '';
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num)) return String(value);
        return num.toFixed(2);
    }

    private static async saveWorkbookToBlob(workbook: XLSX.WorkBook): Promise<Blob> {
        const buffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
            bookSST: false,
        });
        return new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
    }

    private static createCSVBlob(rows: any[][]): Blob {
        const csvContent = rows
            .map(row => row.map(cell => {
                if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
                    return `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            }).join(','))
            .join('\n');

        return new Blob(['\uFEFF' + csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
    }

    // ============================================================
    // ✅ PRIVATE: ADD ITEMS HELPERS
    // ============================================================
    private static addItems(rows: any[][], items: any[], label?: string): void {
        if (!items || items.length === 0) {
            if (label) {
                rows.push([`No ${label} transactions found`, '', '', '']);
            }
            return;
        }
        items.forEach((item: any) => {
            rows.push([
                item.code || '',
                item.name || '',
                ExportService.formatNumber(item.amount),
                item.percentage !== undefined ? `${item.percentage}%` : '',
            ]);
        });
    }

    private static addItemsWithType(rows: any[][], items: any[]): void {
        if (!items || items.length === 0) {
            rows.push(['No transactions found', '', '', '']);
            return;
        }
        items.forEach((item: any) => {
            rows.push([
                item.code || '',
                item.name || '',
                ExportService.formatNumber(item.amount),
                item.type || '',
            ]);
        });
    }

    private static addItemsToCSV(rows: any[][], items: any[], label?: string): void {
        if (!items || items.length === 0) {
            if (label) {
                rows.push([`No ${label} transactions found`, '', '', '']);
            }
            return;
        }
        items.forEach((item: any) => {
            rows.push([
                item.code || '',
                item.name || '',
                ExportService.formatNumber(item.amount),
                item.percentage !== undefined ? `${item.percentage}%` : '',
            ]);
        });
    }

    private static addItemsWithTypeToCSV(rows: any[][], items: any[]): void {
        if (!items || items.length === 0) {
            rows.push(['No transactions found', '', '', '']);
            return;
        }
        items.forEach((item: any) => {
            rows.push([
                item.code || '',
                item.name || '',
                ExportService.formatNumber(item.amount),
                item.type || '',
            ]);
        });
    }

    // ============================================================
    // ✅ PRIVATE: WORKBOOK BUILDERS
    // ============================================================
    private static createBalanceSheetWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['BALANCE SHEET']);
        rows.push(['As of Date:', data.asOfDate || '']);
        rows.push(['Period:', `${data.periodStart || ''} to ${data.periodEnd || ''}`]);
        rows.push([]);

        rows.push(['ASSETS']);
        rows.push(['Code', 'Account Name', 'Amount', 'Percentage']);
        ExportService.addItems(rows, data.assets?.currentAssets, 'Current Assets');
        rows.push(['Total Current Assets', '', data.assets?.totalCurrentAssets || 0, '']);
        ExportService.addItems(rows, data.assets?.fixedAssets, 'Fixed Assets');
        rows.push(['Total Fixed Assets', '', data.assets?.totalFixedAssets || 0, '']);
        rows.push(['TOTAL ASSETS', '', data.assets?.totalAssets || 0, '100.0%']);
        rows.push([]);

        rows.push(['LIABILITIES']);
        ExportService.addItems(rows, data.liabilities?.currentLiabilities, 'Current Liabilities');
        rows.push(['Total Current Liabilities', '', data.liabilities?.totalCurrentLiabilities || 0, '']);
        ExportService.addItems(rows, data.liabilities?.longTermLiabilities, 'Long-Term Liabilities');
        rows.push(['Total Long-Term Liabilities', '', data.liabilities?.totalLongTermLiabilities || 0, '']);
        rows.push(['TOTAL LIABILITIES', '', data.liabilities?.totalLiabilities || 0, '']);
        rows.push([]);

        rows.push(['EQUITY']);
        ExportService.addItems(rows, data.equity?.equityItems, 'Equity');
        rows.push(['TOTAL EQUITY', '', data.equity?.totalEquity || 0, '']);
        rows.push([]);
        rows.push(['TOTAL LIABILITIES & EQUITY', '', data.totalLiabilitiesAndEquity || 0, '']);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 18 },
            { wch: 35 },
            { wch: 18 },
            { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Balance Sheet');
        return workbook;
    }

    private static createIncomeStatementWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['INCOME STATEMENT']);
        rows.push(['Period:', `${data.startDate || ''} to ${data.endDate || ''}`]);
        rows.push([]);

        rows.push(['REVENUE']);
        rows.push(['Code', 'Account', 'Amount', 'Percentage']);
        ExportService.addItems(rows, data.revenue?.items, 'Revenue');
        rows.push(['Total Revenue', '', data.revenue?.total || 0, '']);
        rows.push([]);

        rows.push(['COST OF GOODS SOLD']);
        ExportService.addItems(rows, data.costOfGoodsSold?.items, 'COGS');
        rows.push(['Total COGS', '', data.costOfGoodsSold?.total || 0, '']);
        rows.push([]);

        rows.push(['GROSS PROFIT', '', data.grossProfit || 0, '']);
        rows.push(['Gross Margin', '', data.grossMargin || 0, '']);
        rows.push([]);

        rows.push(['OPERATING EXPENSES']);
        ExportService.addItems(rows, data.operatingExpenses?.items, 'Operating Expenses');
        rows.push(['Total Operating Expenses', '', data.operatingExpenses?.total || 0, '']);
        rows.push([]);

        rows.push(['OPERATING INCOME', '', data.operatingIncome || 0, '']);
        rows.push(['Operating Margin', '', data.operatingMargin || 0, '']);
        rows.push([]);

        rows.push(['NET INCOME', '', data.netIncome || 0, '']);
        rows.push(['Net Margin', '', data.netMargin || 0, '']);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 25 },
            { wch: 35 },
            { wch: 18 },
            { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Income Statement');
        return workbook;
    }

    private static createCashFlowWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['CASH FLOW STATEMENT']);
        rows.push(['Period:', `${data.startDate || ''} to ${data.endDate || ''}`]);
        rows.push([]);

        rows.push(['OPERATING ACTIVITIES']);
        rows.push(['Code', 'Account', 'Amount', 'Type']);
        ExportService.addItemsWithType(rows, data.operatingActivities?.items);
        rows.push(['Net Cash from Operating Activities', '', data.operatingActivities?.total || 0, '']);
        rows.push([]);

        rows.push(['INVESTING ACTIVITIES']);
        ExportService.addItemsWithType(rows, data.investingActivities?.items);
        rows.push(['Net Cash from Investing Activities', '', data.investingActivities?.total || 0, '']);
        rows.push([]);

        rows.push(['FINANCING ACTIVITIES']);
        ExportService.addItemsWithType(rows, data.financingActivities?.items);
        rows.push(['Net Cash from Financing Activities', '', data.financingActivities?.total || 0, '']);
        rows.push([]);

        rows.push(['NET CASH FLOW', '', data.netCashFlow || 0, '']);
        rows.push(['Beginning Cash', '', data.beginningCash || 0, '']);
        rows.push(['Ending Cash', '', data.endingCash || 0, '']);
        rows.push(['Cash Change', '', data.cashChange || 0, '']);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 30 },
            { wch: 35 },
            { wch: 18 },
            { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Cash Flow');
        return workbook;
    }

    private static createTrialBalanceWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['TRIAL BALANCE']);
        rows.push(['As of:', data.asOfDate || '']);
        rows.push([]);
        rows.push(['Code', 'Account Name', 'Type', 'Opening Balance', 'Debit', 'Credit', 'Closing Balance', 'Balance Type']);

        (data.items || []).forEach((item: any) => {
            rows.push([
                item.code || '',
                item.name || '',
                item.accountType || '',
                ExportService.formatNumber(item.openingBalance),
                ExportService.formatNumber(item.debitTransactions),
                ExportService.formatNumber(item.creditTransactions),
                ExportService.formatNumber(item.closingBalance),
                item.balanceType || '',
            ]);
        });

        rows.push([]);
        rows.push([
            'TOTALS',
            '',
            '',
            '',
            ExportService.formatNumber(data.totalDebitTransactions),
            ExportService.formatNumber(data.totalCreditTransactions),
            ExportService.formatNumber(data.totalClosingDebit),
            '',
        ]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 12 },
            { wch: 30 },
            { wch: 15 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
            { wch: 15 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Trial Balance');
        return workbook;
    }

    private static createGeneralLedgerWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['GENERAL LEDGER']);
        rows.push(['Account:', `${data.accountCode || ''} - ${data.accountName || ''}`]);
        rows.push(['Period:', `${data.startDate || ''} to ${data.endDate || ''}`]);
        rows.push(['Opening Balance:', ExportService.formatNumber(data.openingBalance)]);
        rows.push([]);
        rows.push(['Date', 'Journal Ref', 'Description', 'Debit', 'Credit', 'Balance']);

        (data.entries || []).forEach((entry: any) => {
            rows.push([
                entry.date || '',
                entry.journalReference || '',
                entry.description || '',
                ExportService.formatNumber(entry.debit),
                ExportService.formatNumber(entry.credit),
                ExportService.formatNumber(entry.balance),
            ]);
        });

        rows.push([]);
        rows.push([
            'TOTALS',
            '',
            '',
            ExportService.formatNumber(data.totalDebit),
            ExportService.formatNumber(data.totalCredit),
            ExportService.formatNumber(data.closingBalance),
        ]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 15 },
            { wch: 15 },
            { wch: 35 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'General Ledger');
        return workbook;
    }

    // ============================================================
    // ✅ PRIVATE: TAX REPORT WORKBOOK & CSV
    // ============================================================
    private static createTaxReportWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['TAX REPORT']);
        rows.push(['Period:', `${data.periodStart || ''} to ${data.periodEnd || ''}`]);
        rows.push(['Status:', data.filingStatus || '']);
        rows.push([]);
        rows.push(['SUMMARY']);
        rows.push(['VAT on Sales', data.vatOnSales || 0]);
        rows.push(['VAT on Purchases', data.vatOnPurchases || 0]);
        rows.push(['VAT on Imports', data.vatOnImports || 0]);
        rows.push(['VAT on Exports', data.vatOnExports || 0]);
        rows.push(['Net VAT', data.netVat || 0]);
        rows.push(['Withholding Tax', data.withholdingTax || 0]);
        rows.push(['Total Tax Liability', data.totalTaxLiability || 0]);
        rows.push([]);
        rows.push(['TAX BREAKDOWN']);
        rows.push(['Category', 'Amount']);
        rows.push(['Sales', data.breakdown?.sales || 0]);
        rows.push(['Purchases', data.breakdown?.purchases || 0]);
        rows.push(['Imports', data.breakdown?.imports || 0]);
        rows.push(['Exports', data.breakdown?.exports || 0]);
        rows.push(['Withholding Tax', data.breakdown?.withholdingTax || 0]);
        rows.push(['Adjustments', data.breakdown?.adjustments || 0]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, ws, 'Tax Report');
        return workbook;
    }

    private static createTaxReportCSVRows(data: any): any[][] {
        const rows: any[][] = [];
        rows.push(['Tax Report']);
        rows.push(['Period:', `${data.periodStart || ''} to ${data.periodEnd || ''}`]);
        rows.push(['Status:', data.filingStatus || '']);
        rows.push([]);
        rows.push(['Category', 'Amount']);
        rows.push(['VAT on Sales', data.vatOnSales || 0]);
        rows.push(['VAT on Purchases', data.vatOnPurchases || 0]);
        rows.push(['Net VAT', data.netVat || 0]);
        rows.push(['Withholding Tax', data.withholdingTax || 0]);
        rows.push(['Total Tax Liability', data.totalTaxLiability || 0]);
        rows.push([]);
        rows.push(['Sales', data.breakdown?.sales || 0]);
        rows.push(['Purchases', data.breakdown?.purchases || 0]);
        rows.push(['Imports', data.breakdown?.imports || 0]);
        rows.push(['Exports', data.breakdown?.exports || 0]);
        rows.push(['Withholding Tax', data.breakdown?.withholdingTax || 0]);
        rows.push(['Adjustments', data.breakdown?.adjustments || 0]);
        return rows;
    }

    // ============================================================
    // ✅ PRIVATE: VAT REPORT WORKBOOK & CSV
    // ============================================================
    private static createVATReportWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['VAT REPORT']);
        rows.push(['Period:', `${data.periodStart || ''} to ${data.periodEnd || ''}`]);
        rows.push(['Status:', data.filingStatus || '']);
        rows.push([]);
        rows.push(['SUMMARY']);
        rows.push(['VAT on Sales', data.vatOnSales || 0]);
        rows.push(['VAT on Purchases', data.vatOnPurchases || 0]);
        rows.push(['VAT on Imports', data.vatOnImports || 0]);
        rows.push(['VAT on Exports', data.vatOnExports || 0]);
        rows.push(['Net VAT', data.netVatPayable || 0]);
        rows.push(['Total Sales (Net)', data.totalSales || 0]);
        rows.push(['Total Purchases (Net)', data.totalPurchases || 0]);
        rows.push([]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, ws, 'VAT Report');
        return workbook;
    }

    private static createVATReportCSVRows(data: any): any[][] {
        return [
            ['VAT Report'],
            ['Period:', `${data.periodStart || ''} to ${data.periodEnd || ''}`],
            ['Status:', data.filingStatus || ''],
            [],
            ['Category', 'Amount'],
            ['VAT on Sales', data.vatOnSales || 0],
            ['VAT on Purchases', data.vatOnPurchases || 0],
            ['VAT on Imports', data.vatOnImports || 0],
            ['VAT on Exports', data.vatOnExports || 0],
            ['Net VAT', data.netVatPayable || 0],
            ['Total Sales (Net)', data.totalSales || 0],
            ['Total Purchases (Net)', data.totalPurchases || 0],
        ];
    }

    // ============================================================
    // ✅ PRIVATE: WHT REPORT WORKBOOK & CSV
    // ============================================================
    private static createWHTReportWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['WITHHOLDING TAX REPORT']);
        rows.push(['Period:', `${data.periodStart || ''} to ${data.periodEnd || ''}`]);
        rows.push(['Status:', data.filingStatus || '']);
        rows.push([]);
        rows.push(['SUMMARY']);
        rows.push(['Total Gross', data.totalGross || 0]);
        rows.push(['Total WHT', data.totalTax || 0]);
        rows.push(['Total Net', data.totalNet || 0]);
        rows.push([]);
        rows.push(['BY TYPE']);
        rows.push(['Vendor', data.byType?.vendor || 0]);
        rows.push(['Contractor', data.byType?.contractor || 0]);
        rows.push(['Employee', data.byType?.employee || 0]);
        rows.push(['Consultant', data.byType?.consultant || 0]);
        rows.push(['Other', data.byType?.other || 0]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, ws, 'WHT Report');
        return workbook;
    }

    private static createWHTReportCSVRows(data: any): any[][] {
        return [
            ['Withholding Tax Report'],
            ['Period:', `${data.periodStart || ''} to ${data.periodEnd || ''}`],
            ['Status:', data.filingStatus || ''],
            [],
            ['Category', 'Amount'],
            ['Total Gross', data.totalGross || 0],
            ['Total WHT', data.totalTax || 0],
            ['Total Net', data.totalNet || 0],
            [],
            ['By Type'],
            ['Vendor', data.byType?.vendor || 0],
            ['Contractor', data.byType?.contractor || 0],
            ['Employee', data.byType?.employee || 0],
            ['Consultant', data.byType?.consultant || 0],
            ['Other', data.byType?.other || 0],
        ];
    }

    // ============================================================
    // ✅ PRIVATE: CSV BUILDERS (for other reports)
    // ============================================================
    private static createBalanceSheetCSVRows(data: any): any[][] {
        const rows: any[][] = [];
        rows.push(['Balance Sheet']);
        rows.push(['As of Date:', data.asOfDate || '']);
        rows.push([]);
        rows.push(['ASSETS']);
        rows.push(['Code', 'Account Name', 'Amount', 'Percentage']);

        ExportService.addItemsToCSV(rows, data.assets?.currentAssets, 'Current Assets');
        rows.push(['Total Current Assets', '', data.assets?.totalCurrentAssets || 0, '']);
        ExportService.addItemsToCSV(rows, data.assets?.fixedAssets, 'Fixed Assets');
        rows.push(['Total Fixed Assets', '', data.assets?.totalFixedAssets || 0, '']);
        rows.push(['TOTAL ASSETS', '', data.assets?.totalAssets || 0, '100.0%']);
        rows.push([]);

        rows.push(['LIABILITIES']);
        ExportService.addItemsToCSV(rows, data.liabilities?.currentLiabilities, 'Current Liabilities');
        rows.push(['Total Current Liabilities', '', data.liabilities?.totalCurrentLiabilities || 0, '']);
        ExportService.addItemsToCSV(rows, data.liabilities?.longTermLiabilities, 'Long-Term Liabilities');
        rows.push(['Total Long-Term Liabilities', '', data.liabilities?.totalLongTermLiabilities || 0, '']);
        rows.push(['TOTAL LIABILITIES', '', data.liabilities?.totalLiabilities || 0, '']);
        rows.push([]);

        rows.push(['EQUITY']);
        ExportService.addItemsToCSV(rows, data.equity?.equityItems, 'Equity');
        rows.push(['TOTAL EQUITY', '', data.equity?.totalEquity || 0, '']);
        rows.push([]);
        rows.push(['TOTAL LIABILITIES & EQUITY', '', data.totalLiabilitiesAndEquity || 0, '']);

        return rows;
    }

    private static createIncomeStatementCSVRows(data: any): any[][] {
        const rows: any[][] = [];
        rows.push(['Income Statement']);
        rows.push(['Period:', `${data.startDate || ''} to ${data.endDate || ''}`]);
        rows.push([]);

        rows.push(['REVENUE']);
        rows.push(['Code', 'Account', 'Amount', 'Percentage']);
        ExportService.addItemsToCSV(rows, data.revenue?.items);
        rows.push(['Total Revenue', '', data.revenue?.total || 0, '']);
        rows.push([]);

        rows.push(['COST OF GOODS SOLD']);
        ExportService.addItemsToCSV(rows, data.costOfGoodsSold?.items);
        rows.push(['Total COGS', '', data.costOfGoodsSold?.total || 0, '']);
        rows.push([]);

        rows.push(['GROSS PROFIT', '', data.grossProfit || 0, '']);
        rows.push(['Gross Margin', '', data.grossMargin || 0, '']);
        rows.push([]);

        rows.push(['OPERATING EXPENSES']);
        ExportService.addItemsToCSV(rows, data.operatingExpenses?.items);
        rows.push(['Total Operating Expenses', '', data.operatingExpenses?.total || 0, '']);
        rows.push([]);

        rows.push(['OPERATING INCOME', '', data.operatingIncome || 0, '']);
        rows.push(['Operating Margin', '', data.operatingMargin || 0, '']);
        rows.push([]);

        rows.push(['NET INCOME', '', data.netIncome || 0, '']);
        rows.push(['Net Margin', '', data.netMargin || 0, '']);

        return rows;
    }

    private static createCashFlowCSVRows(data: any): any[][] {
        const rows: any[][] = [];
        rows.push(['Cash Flow Statement']);
        rows.push(['Period:', `${data.startDate || ''} to ${data.endDate || ''}`]);
        rows.push([]);

        rows.push(['OPERATING ACTIVITIES']);
        rows.push(['Code', 'Account', 'Amount', 'Type']);
        ExportService.addItemsWithTypeToCSV(rows, data.operatingActivities?.items);
        rows.push(['Net Cash from Operating Activities', '', data.operatingActivities?.total || 0, '']);
        rows.push([]);

        rows.push(['INVESTING ACTIVITIES']);
        ExportService.addItemsWithTypeToCSV(rows, data.investingActivities?.items);
        rows.push(['Net Cash from Investing Activities', '', data.investingActivities?.total || 0, '']);
        rows.push([]);

        rows.push(['FINANCING ACTIVITIES']);
        ExportService.addItemsWithTypeToCSV(rows, data.financingActivities?.items);
        rows.push(['Net Cash from Financing Activities', '', data.financingActivities?.total || 0, '']);
        rows.push([]);

        rows.push(['NET CASH FLOW', '', data.netCashFlow || 0, '']);
        rows.push(['Beginning Cash', '', data.beginningCash || 0, '']);
        rows.push(['Ending Cash', '', data.endingCash || 0, '']);
        rows.push(['Cash Change', '', data.cashChange || 0, '']);

        return rows;
    }

    private static createTrialBalanceCSVRows(data: any): any[][] {
        const rows: any[][] = [];
        rows.push(['Trial Balance']);
        rows.push(['As of:', data.asOfDate || '']);
        rows.push([]);
        rows.push(['Code', 'Account Name', 'Type', 'Opening Balance', 'Debit', 'Credit', 'Closing Balance', 'Balance Type']);

        (data.items || []).forEach((item: any) => {
            rows.push([
                item.code || '',
                item.name || '',
                item.accountType || '',
                ExportService.formatNumber(item.openingBalance),
                ExportService.formatNumber(item.debitTransactions),
                ExportService.formatNumber(item.creditTransactions),
                ExportService.formatNumber(item.closingBalance),
                item.balanceType || '',
            ]);
        });

        return rows;
    }

    private static createGeneralLedgerCSVRows(data: any): any[][] {
        const rows: any[][] = [];
        rows.push(['General Ledger']);
        rows.push(['Account:', `${data.accountCode || ''} - ${data.accountName || ''}`]);
        rows.push(['Period:', `${data.startDate || ''} to ${data.endDate || ''}`]);
        rows.push(['Opening Balance:', ExportService.formatNumber(data.openingBalance)]);
        rows.push([]);
        rows.push(['Date', 'Journal Ref', 'Description', 'Debit', 'Credit', 'Balance']);

        (data.entries || []).forEach((entry: any) => {
            rows.push([
                entry.date || '',
                entry.journalReference || '',
                entry.description || '',
                ExportService.formatNumber(entry.debit),
                ExportService.formatNumber(entry.credit),
                ExportService.formatNumber(entry.balance),
            ]);
        });

        return rows;
    }


    // ============================================================
// ✅ PRIVATE: AR REPORT WORKBOOK & CSV
// ============================================================
    private static createARReportWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['ACCOUNTS RECEIVABLE REPORT']);
        rows.push(['Period:', data.periodName || data.period || '']);
        rows.push([]);
        rows.push(['SUMMARY']);
        rows.push(['Total Receivables', data.totalReceivables || 0]);
        rows.push(['Total Collected', data.totalCollected || 0]);
        rows.push(['Overdue', data.overdueReceivables || 0]);
        rows.push(['Collection Rate', `${(data.collectionRate || 0).toFixed(1)}%`]);
        rows.push([]);
        rows.push(['AGING BREAKDOWN']);
        rows.push(['0-30 Days', data.aging?.['0-30'] || 0]);
        rows.push(['31-60 Days', data.aging?.['31-60'] || 0]);
        rows.push(['61-90 Days', data.aging?.['61-90'] || 0]);
        rows.push(['90+ Days', data.aging?.['90+'] || 0]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, ws, 'AR Report');
        return workbook;
    }

    private static createAPReportWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['ACCOUNTS PAYABLE REPORT']);
        rows.push(['Period:', data.periodName || data.period || '']);
        rows.push([]);
        rows.push(['SUMMARY']);
        rows.push(['Total Payables', data.totalPayables || 0]);
        rows.push(['Total Paid', data.totalPaid || 0]);
        rows.push(['Overdue', data.overduePayables || 0]);
        rows.push(['Payment Rate', `${(data.paymentRate || 0).toFixed(1)}%`]);
        rows.push([]);
        rows.push(['AGING BREAKDOWN']);
        rows.push(['0-30 Days', data.aging?.['0-30'] || 0]);
        rows.push(['31-60 Days', data.aging?.['31-60'] || 0]);
        rows.push(['61-90 Days', data.aging?.['61-90'] || 0]);
        rows.push(['90+ Days', data.aging?.['90+'] || 0]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, ws, 'AP Report');
        return workbook;
    }

    private static createARReportCSVRows(data: any): any[][] {
        return [
            ['Accounts Receivable Report'],
            ['Period:', data.periodName || data.period || ''],
            [],
            ['Category', 'Amount'],
            ['Total Receivables', data.totalReceivables || 0],
            ['Total Collected', data.totalCollected || 0],
            ['Overdue', data.overdueReceivables || 0],
            ['Collection Rate', `${(data.collectionRate || 0).toFixed(1)}%`],
            [],
            ['Aging Breakdown'],
            ['0-30 Days', data.aging?.['0-30'] || 0],
            ['31-60 Days', data.aging?.['31-60'] || 0],
            ['61-90 Days', data.aging?.['61-90'] || 0],
            ['90+ Days', data.aging?.['90+'] || 0],
        ];
    }

    private static createAPReportCSVRows(data: any): any[][] {
        return [
            ['Accounts Payable Report'],
            ['Period:', data.periodName || data.period || ''],
            [],
            ['Category', 'Amount'],
            ['Total Payables', data.totalPayables || 0],
            ['Total Paid', data.totalPaid || 0],
            ['Overdue', data.overduePayables || 0],
            ['Payment Rate', `${(data.paymentRate || 0).toFixed(1)}%`],
            [],
            ['Aging Breakdown'],
            ['0-30 Days', data.aging?.['0-30'] || 0],
            ['31-60 Days', data.aging?.['31-60'] || 0],
            ['61-90 Days', data.aging?.['61-90'] || 0],
            ['90+ Days', data.aging?.['90+'] || 0],
        ];
    }



    private static createBankAccountsWorkbook(data: any[]): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [
            ['Bank Accounts'],
            ['Generated:', new Date().toLocaleString()],
            [],
            ['Account Name', 'Bank Name', 'Account Number', 'Type', 'Opening Balance', 'Current Balance', 'Status']
        ];

        data.forEach((account: any) => {
            rows.push([
                account.accountName,
                account.bankName,
                account.accountNumber,
                account.accountType,
                account.openingBalance || 0,
                account.currentBalance || 0,
                account.isActive ? 'Active' : 'Inactive'
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(workbook, ws, 'Bank Accounts');
        return workbook;
    }
    private static createBankAccountsWorkbook(data: any[]): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [
            ['BANK ACCOUNTS'],
            ['Generated:', new Date().toLocaleString()],
            [],
            ['Account Name', 'Bank Name', 'Account Number', 'Type', 'Opening Balance', 'Current Balance', 'Status']
        ];

        data.forEach((account: any) => {
            rows.push([
                account.accountName || '',
                account.bankName || '',
                account.accountNumber || '',
                account.accountType || '',
                account.openingBalance || 0,
                account.currentBalance || 0,
                account.isActive ? 'Active' : 'Inactive'
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 25 },
            { wch: 25 },
            { wch: 18 },
            { wch: 12 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 }
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Bank Accounts');
        return workbook;
    }

// ============================================================
// ✅ PRIVATE: BANK ACCOUNTS CSV ROWS
// ============================================================
    private static createBankAccountsCSVRows(data: any[]): any[][] {
        const rows: any[][] = [
            ['Bank Accounts'],
            ['Generated:', new Date().toLocaleString()],
            [],
            ['Account Name', 'Bank Name', 'Account Number', 'Type', 'Opening Balance', 'Current Balance', 'Status']
        ];

        data.forEach((account: any) => {
            rows.push([
                account.accountName || '',
                account.bankName || '',
                account.accountNumber || '',
                account.accountType || '',
                account.openingBalance || 0,
                account.currentBalance || 0,
                account.isActive ? 'Active' : 'Inactive'
            ]);
        });

        return rows;
    }

    private static createBankTransactionsWorkbook(data: any[]): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [
            ['BANK TRANSACTIONS'],
            ['Generated:', new Date().toLocaleString()],
            [],
            ['Date', 'Description', 'Reference', 'Account', 'Type', 'Amount', 'Status', 'Period']
        ];

        data.forEach((t: any) => {
            rows.push([
                t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : '',
                t.description || '',
                t.reference || '',
                t.bankAccountName || '',
                t.transactionType || '',
                t.amount || 0,
                t.isReconciled ? 'Reconciled' : 'Unreconciled',
                t.periodName || '',
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 15 },
            { wch: 30 },
            { wch: 20 },
            { wch: 25 },
            { wch: 12 },
            { wch: 15 },
            { wch: 12 },
            { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Bank Transactions');
        return workbook;
    }

    private static createBankTransactionsCSVRows(data: any[]): any[][] {
        const rows: any[][] = [
            ['Bank Transactions'],
            ['Generated:', new Date().toLocaleString()],
            [],
            ['Date', 'Description', 'Reference', 'Account', 'Type', 'Amount', 'Status', 'Period']
        ];

        data.forEach((t: any) => {
            rows.push([
                t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : '',
                t.description || '',
                t.reference || '',
                t.bankAccountName || '',
                t.transactionType || '',
                t.amount || 0,
                t.isReconciled ? 'Reconciled' : 'Unreconciled',
                t.periodName || '',
            ]);
        });

        return rows;
    }


    private static createBankReconciliationWorkbook(data: any): XLSX.WorkBook {
        const workbook = XLSX.utils.book_new();
        const transactions = data.transactions || [];
        const summary = data.summary || {};
        const rows: any[][] = [];

        rows.push(['BANK RECONCILIATION REPORT']);
        rows.push(['Period:', summary.periodName || 'All Periods']);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push([]);
        rows.push(['SUMMARY']);
        rows.push(['Total Transactions', summary.totalTransactions || 0]);
        rows.push(['Reconciled', summary.reconciledCount || 0]);
        rows.push(['Unreconciled', summary.unreconciledCount || 0]);
        rows.push(['Total Amount', summary.totalAmount || 0]);
        rows.push(['Reconciled Amount', summary.reconciledAmount || 0]);
        rows.push(['Unreconciled Amount', summary.unreconciledAmount || 0]);
        rows.push(['Progress', `${(summary.reconciliationProgress || 0).toFixed(1)}%`]);
        rows.push([]);
        rows.push(['TRANSACTIONS']);
        rows.push(['Date', 'Description', 'Reference', 'Account', 'Type', 'Amount', 'Status', 'Period']);

        transactions.forEach((t: any) => {
            rows.push([
                t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : '',
                t.description || '',
                t.reference || '',
                t.bankAccountName || '',
                t.transactionType || '',
                t.amount || 0,
                t.isReconciled ? 'Reconciled' : 'Unreconciled',
                t.periodName || '',
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 15 },
            { wch: 30 },
            { wch: 20 },
            { wch: 25 },
            { wch: 12 },
            { wch: 15 },
            { wch: 12 },
            { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Reconciliation');
        return workbook;
    }

    private static createBankReconciliationCSVRows(data: any): any[][] {
        const transactions = data.transactions || [];
        const summary = data.summary || {};
        const rows: any[][] = [];

        rows.push(['Bank Reconciliation Report']);
        rows.push(['Period:', summary.periodName || 'All Periods']);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push([]);
        rows.push(['Summary']);
        rows.push(['Total Transactions', summary.totalTransactions || 0]);
        rows.push(['Reconciled', summary.reconciledCount || 0]);
        rows.push(['Unreconciled', summary.unreconciledCount || 0]);
        rows.push(['Total Amount', summary.totalAmount || 0]);
        rows.push(['Reconciled Amount', summary.reconciledAmount || 0]);
        rows.push(['Unreconciled Amount', summary.unreconciledAmount || 0]);
        rows.push([]);
        rows.push(['Date', 'Description', 'Reference', 'Account', 'Type', 'Amount', 'Status', 'Period']);

        transactions.forEach((t: any) => {
            rows.push([
                t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : '',
                t.description || '',
                t.reference || '',
                t.bankAccountName || '',
                t.transactionType || '',
                t.amount || 0,
                t.isReconciled ? 'Reconciled' : 'Unreconciled',
                t.periodName || '',
            ]);
        });

        return rows;
    }
    private static createPettyCashWorkbook(data: any): XLSX.WorkBook {
        const transactions = Array.isArray(data) ? data : (data.transactions || []);
        const balance = data.balance || null;
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['PETTY CASH REPORT']);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push(['Current Balance:', balance?.balance || 0]);
        rows.push([]);
        rows.push(['TRANSACTIONS']);
        rows.push(['Date', 'Description', 'Category', 'Type', 'Amount', 'Status']);

        transactions.forEach((t: any) => {
            rows.push([
                t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : '',
                t.description || '',
                t.category || '',
                t.transactionType || '',
                t.amount || 0,
                t.status || '',
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 15 },
            { wch: 30 },
            { wch: 20 },
            { wch: 12 },
            { wch: 15 },
            { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Petty Cash');
        return workbook;
    }

    private static createPettyCashCSVRows(data: any): any[][] {
        const transactions = Array.isArray(data) ? data : (data.transactions || []);
        const balance = data.balance || null;
        const rows: any[][] = [];

        rows.push(['Petty Cash Report']);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push(['Current Balance:', balance?.balance || 0]);
        rows.push([]);
        rows.push(['Date', 'Description', 'Category', 'Type', 'Amount', 'Status']);

        transactions.forEach((t: any) => {
            rows.push([
                t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : '',
                t.description || '',
                t.category || '',
                t.transactionType || '',
                t.amount || 0,
                t.status || '',
            ]);
        });

        return rows;
    }


    // ============================================================
// ✅ PRIVATE: COLLECTION FOLLOW-UP WORKBOOK & CSV
// ============================================================
    private static createCollectionFollowupWorkbook(data: any): XLSX.WorkBook {
        const customers = Array.isArray(data) ? data : (data.customers || []);
        const stats = data.stats || {};
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['COLLECTION FOLLOW-UP REPORT']);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push(['Total Outstanding:', stats.totalOutstanding || 0]);
        rows.push(['Overdue Amount:', stats.overdueAmount || 0]);
        rows.push(['Overdue Customers:', stats.overdueCount || 0]);
        rows.push(['Collection Rate:', `${(stats.collectionRate || 0).toFixed(1)}%`]);
        rows.push([]);
        rows.push(['CUSTOMERS']);
        rows.push(['Name', 'Email', 'Phone', 'Outstanding', 'Overdue', 'Invoices', 'Days Overdue', 'Status', 'Risk Level', 'Score', 'Period']);

        customers.forEach((c: any) => {
            rows.push([
                c.name || '',
                c.email || '',
                c.phone || '',
                c.totalOutstanding || 0,
                c.overdueAmount || 0,
                c.invoiceCount || 0,
                c.daysOverdue || 0,
                c.status || 'Current',
                c.riskLevel || 'Low',
                c.collectionScore || 0,
                c.periodName || '',
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 25 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 },
            { wch: 12 },
            { wch: 12 },
            { wch: 10 },
            { wch: 8 },
            { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Collection Follow-up');
        return workbook;
    }

    private static createCollectionFollowupCSVRows(data: any): any[][] {
        const customers = Array.isArray(data) ? data : (data.customers || []);
        const stats = data.stats || {};
        const rows: any[][] = [];

        rows.push(['Collection Follow-up Report']);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push(['Total Outstanding:', stats.totalOutstanding || 0]);
        rows.push(['Overdue Amount:', stats.overdueAmount || 0]);
        rows.push(['Overdue Customers:', stats.overdueCount || 0]);
        rows.push(['Collection Rate:', `${(stats.collectionRate || 0).toFixed(1)}%`]);
        rows.push([]);
        rows.push(['Name', 'Email', 'Phone', 'Outstanding', 'Overdue', 'Invoices', 'Days Overdue', 'Status', 'Risk Level', 'Score', 'Period']);

        customers.forEach((c: any) => {
            rows.push([
                c.name || '',
                c.email || '',
                c.phone || '',
                c.totalOutstanding || 0,
                c.overdueAmount || 0,
                c.invoiceCount || 0,
                c.daysOverdue || 0,
                c.status || 'Current',
                c.riskLevel || 'Low',
                c.collectionScore || 0,
                c.periodName || '',
            ]);
        });

        return rows;
    }
// ============================================================
// ✅ PRIVATE: INVOICE POSTING WORKBOOK & CSV
// ============================================================
    private static createInvoicePostingWorkbook(data: any): XLSX.WorkBook {
        const invoices = Array.isArray(data) ? data : (data.invoices || []);
        const stats = data.stats || {};
        const periodName = data.periodName || 'All Periods';
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['AR INVOICE POSTING REPORT']);
        rows.push(['Period:', periodName]);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push([]);
        rows.push(['SUMMARY']);
        rows.push(['Total Invoices:', stats.totalInvoices || 0]);
        rows.push(['Total Amount:', stats.totalAmount || 0]);
        rows.push(['Total Paid:', stats.totalPaid || 0]);
        rows.push(['Total Balance:', stats.totalBalance || 0]);
        rows.push(['Collection Rate:', `${stats.totalAmount > 0 ? ((stats.totalPaid / stats.totalAmount) * 100).toFixed(1) : 0}%`]);
        rows.push([]);
        rows.push(['Status Breakdown']);
        rows.push(['Status', 'Count']);
        rows.push(['Draft', stats.draftCount || 0]);
        rows.push(['Posted', stats.postedCount || 0]);
        rows.push(['Unpaid', stats.unpaidCount || 0]);
        rows.push(['Partially Paid', stats.partiallyPaidCount || 0]);
        rows.push(['Paid', stats.paidCount || 0]);
        rows.push(['Cancelled', stats.cancelledCount || 0]);
        rows.push([]);
        rows.push(['INVOICES']);
        rows.push(['Invoice #', 'Customer', 'Period', 'Date', 'Due Date', 'Amount', 'Paid', 'Balance', 'Status', 'Posted At', 'Posted By']);

        invoices.forEach((inv: SalesInvoice) => {
            rows.push([
                inv.invoiceNumber || '',
                inv.customerName || '',
                inv.periodName || '',
                inv.invoiceDate || '',
                inv.dueDate || '',
                inv.totalAmount || 0,
                inv.paidAmount || 0,
                inv.balanceDue || 0,
                inv.status || 'Draft',
                inv.postedAt || 'Not Posted',
                inv.postedBy || '',
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 18 },
            { wch: 25 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 18 },
            { wch: 18 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Invoice Posting');
        return workbook;
    }

    private static createInvoicePostingCSVRows(data: any): any[][] {
        const invoices = Array.isArray(data) ? data : (data.invoices || []);
        const stats = data.stats || {};
        const periodName = data.periodName || 'All Periods';
        const rows: any[][] = [];

        rows.push(['AR Invoice Posting Report']);
        rows.push(['Period:', periodName]);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push([]);
        rows.push(['Summary']);
        rows.push(['Total Invoices:', stats.totalInvoices || 0]);
        rows.push(['Total Amount:', stats.totalAmount || 0]);
        rows.push(['Total Paid:', stats.totalPaid || 0]);
        rows.push(['Total Balance:', stats.totalBalance || 0]);
        rows.push(['Collection Rate:', `${stats.totalAmount > 0 ? ((stats.totalPaid / stats.totalAmount) * 100).toFixed(1) : 0}%`]);
        rows.push([]);
        rows.push(['Invoice #', 'Customer', 'Period', 'Date', 'Due Date', 'Amount', 'Paid', 'Balance', 'Status', 'Posted At', 'Posted By']);

        invoices.forEach((inv: SalesInvoice) => {
            rows.push([
                inv.invoiceNumber || '',
                inv.customerName || '',
                inv.periodName || '',
                inv.invoiceDate || '',
                inv.dueDate || '',
                inv.totalAmount || 0,
                inv.paidAmount || 0,
                inv.balanceDue || 0,
                inv.status || 'Draft',
                inv.postedAt || 'Not Posted',
                inv.postedBy || '',
            ]);
        });

        return rows;
    }

    private static createInvoiceEntryWorkbook(data: any): XLSX.WorkBook {
        const invoices = Array.isArray(data) ? data : (data.invoices || []);
        const stats = data.stats || {};
        const periodName = data.periodName || 'All Periods';
        const workbook = XLSX.utils.book_new();
        const rows: any[][] = [];

        rows.push(['INVOICE ENTRY REPORT']);
        rows.push(['Period:', periodName]);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push([]);
        rows.push(['SUMMARY']);
        rows.push(['Total Invoices:', stats.totalInvoices || 0]);
        rows.push(['Total Amount:', stats.totalAmount || 0]);
        rows.push(['Total Paid:', stats.totalPaid || 0]);
        rows.push(['Total Balance:', stats.totalBalance || 0]);
        rows.push(['Purchase Invoices:', stats.purchaseCount || 0]);
        rows.push(['Sales Invoices:', stats.salesCount || 0]);
        rows.push([]);
        rows.push(['Status Breakdown']);
        rows.push(['Status', 'Count']);
        rows.push(['Draft', stats.draftCount || 0]);
        rows.push(['Pending', stats.pendingCount || 0]);
        rows.push(['Approved', stats.approvedCount || 0]);
        rows.push(['Partially Paid', stats.partiallyPaidCount || 0]);
        rows.push(['Paid', stats.paidCount || 0]);
        rows.push(['Rejected', stats.rejectedCount || 0]);
        rows.push([]);
        rows.push(['INVOICES']);
        rows.push(['Invoice #', 'Type', 'Party', 'Period', 'Date', 'Due Date', 'Amount', 'Paid', 'Balance', 'Status', 'Sales Rep', 'PO #']);

        invoices.forEach((inv: InvoiceEntryData) => {
            rows.push([
                inv.invoiceNumber || '',
                inv.invoiceType || 'Purchase',
                inv.invoiceType === 'Purchase' ? (inv.vendorName || '') : (inv.customerName || ''),
                inv.periodName || '',
                inv.invoiceDate || '',
                inv.dueDate || '',
                inv.totalAmount || 0,
                inv.paidAmount || 0,
                inv.balanceDue || 0,
                inv.status || 'Draft',
                inv.salesRep || '',
                inv.purchaseOrderId || '',
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 18 },
            { wch: 12 },
            { wch: 25 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 18 },
            { wch: 18 },
        ];
        XLSX.utils.book_append_sheet(workbook, ws, 'Invoice Entry');
        return workbook;
    }

    private static createInvoiceEntryCSVRows(data: any): any[][] {
        const invoices = Array.isArray(data) ? data : (data.invoices || []);
        const stats = data.stats || {};
        const periodName = data.periodName || 'All Periods';
        const rows: any[][] = [];

        rows.push(['Invoice Entry Report']);
        rows.push(['Period:', periodName]);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push([]);
        rows.push(['Summary']);
        rows.push(['Total Invoices:', stats.totalInvoices || 0]);
        rows.push(['Total Amount:', stats.totalAmount || 0]);
        rows.push(['Total Paid:', stats.totalPaid || 0]);
        rows.push(['Total Balance:', stats.totalBalance || 0]);
        rows.push(['Purchase Invoices:', stats.purchaseCount || 0]);
        rows.push(['Sales Invoices:', stats.salesCount || 0]);
        rows.push([]);
        rows.push(['Invoice #', 'Type', 'Party', 'Period', 'Date', 'Due Date', 'Amount', 'Paid', 'Balance', 'Status', 'Sales Rep', 'PO #']);

        invoices.forEach((inv: InvoiceEntryData) => {
            rows.push([
                inv.invoiceNumber || '',
                inv.invoiceType || 'Purchase',
                inv.invoiceType === 'Purchase' ? (inv.vendorName || '') : (inv.customerName || ''),
                inv.periodName || '',
                inv.invoiceDate || '',
                inv.dueDate || '',
                inv.totalAmount || 0,
                inv.paidAmount || 0,
                inv.balanceDue || 0,
                inv.status || 'Draft',
                inv.salesRep || '',
                inv.purchaseOrderId || '',
            ]);
        });

        return rows;
    }

    private static createBudgetWorkbook(data: any): XLSX.WorkBook {
        const budgets = Array.isArray(data) ? data : (data.budgets || []);
        const stats = data.stats || {};
        const periodName = data.periodName || 'All Periods';
        const workbook = XLSX.utils.book_new();

        // ===== SUMMARY SHEET =====
        const summaryRows: any[][] = [
            ['BUDGET REPORT'],
            ['Period:', periodName],
            ['Generated:', new Date().toLocaleString()],
            [],
            ['SUMMARY'],
            ['Total Budgets:', stats.totalBudgets || 0],
            ['Total Amount:', stats.totalAmount || 0],
            ['Active:', stats.activeCount || 0],
            ['Draft:', stats.draftCount || 0],
            ['Approved:', stats.approvedCount || 0],
            ['Inactive:', stats.inactiveCount || 0],
            ['Rejected:', stats.rejectedCount || 0],
            [],
            ['Status Breakdown'],
            ['Status', 'Count', 'Amount'],
            ['Active', stats.activeCount || 0, budgets.filter((b: any) => b.status === 'Active').reduce((s: number, b: any) => s + b.totalAmount, 0)],
            ['Draft', stats.draftCount || 0, budgets.filter((b: any) => b.status === 'Draft').reduce((s: number, b: any) => s + b.totalAmount, 0)],
            ['Approved', stats.approvedCount || 0, budgets.filter((b: any) => b.status === 'Approved').reduce((s: number, b: any) => s + b.totalAmount, 0)],
            ['Inactive', stats.inactiveCount || 0, budgets.filter((b: any) => b.status === 'Inactive').reduce((s: number, b: any) => s + b.totalAmount, 0)],
            ['Rejected', stats.rejectedCount || 0, budgets.filter((b: any) => b.status === 'Rejected').reduce((s: number, b: any) => s + b.totalAmount, 0)],
            ['Total', stats.totalBudgets || 0, stats.totalAmount || 0],
        ];

        const summaryWS = XLSX.utils.aoa_to_sheet(summaryRows);
        summaryWS['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary');

        // ===== BUDGETS SHEET =====
        const budgetRows: any[][] = [
            ['Budget', 'Period', 'Start Date', 'End Date', 'Allocated', 'Spent', 'Remaining', 'Status', 'Branch', 'Department', 'Description']
        ];

        budgets.forEach((b: any) => {
            const spent = b.lines.reduce((s: number, l: any) => s + (l.spentAmount || 0), 0);
            budgetRows.push([
                b.name || '',
                b.periodName || '',
                b.startDate ? formatDateShort(b.startDate) : '',
                b.endDate ? formatDateShort(b.endDate) : '',
                b.totalAmount || 0,
                spent,
                b.totalAmount - spent,
                b.status || 'Draft',
                b.branchName || '',
                b.departmentName || '',
                b.description || '',
            ]);
        });

        const budgetWS = XLSX.utils.aoa_to_sheet(budgetRows);
        budgetWS['!cols'] = [
            { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
            { wch: 20 }, { wch: 20 }, { wch: 30 }
        ];
        XLSX.utils.book_append_sheet(workbook, budgetWS, 'Budgets');

        // ===== BUDGET LINES SHEET =====
        const hasLines = budgets.some((b: any) => b.lines.length > 0);
        if (hasLines) {
            const lineRows: any[][] = [
                ['Budget', 'Account', 'Account Code', 'Allocated', 'Spent', 'Remaining', 'Description']
            ];

            budgets.forEach((b: any) => {
                b.lines.forEach((line: any) => {
                    const remaining = line.allocatedAmount - (line.spentAmount || 0);
                    lineRows.push([
                        b.name || '',
                        line.accountName || line.accountId || 'Unknown',
                        line.accountCode || '',
                        line.allocatedAmount || 0,
                        line.spentAmount || 0,
                        remaining,
                        line.description || '',
                    ]);
                });
            });

            const lineWS = XLSX.utils.aoa_to_sheet(lineRows);
            lineWS['!cols'] = [
                { wch: 25 }, { wch: 25 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
            ];
            XLSX.utils.book_append_sheet(workbook, lineWS, 'Budget Lines');
        }

        return workbook;
    }

    private static createBudgetCSVRows(data: any): any[][] {
        const budgets = Array.isArray(data) ? data : (data.budgets || []);
        const stats = data.stats || {};
        const periodName = data.periodName || 'All Periods';
        const rows: any[][] = [];

        rows.push(['Budget Report']);
        rows.push(['Period:', periodName]);
        rows.push(['Generated:', new Date().toLocaleString()]);
        rows.push([]);
        rows.push(['Summary']);
        rows.push(['Total Budgets:', stats.totalBudgets || 0]);
        rows.push(['Total Amount:', stats.totalAmount || 0]);
        rows.push(['Active:', stats.activeCount || 0]);
        rows.push(['Draft:', stats.draftCount || 0]);
        rows.push(['Approved:', stats.approvedCount || 0]);
        rows.push(['Inactive:', stats.inactiveCount || 0]);
        rows.push(['Rejected:', stats.rejectedCount || 0]);
        rows.push([]);
        rows.push(['Budget', 'Period', 'Start Date', 'End Date', 'Allocated', 'Spent', 'Remaining', 'Status', 'Branch', 'Department', 'Description']);

        budgets.forEach((b: any) => {
            const spent = b.lines.reduce((s: number, l: any) => s + (l.spentAmount || 0), 0);
            rows.push([
                b.name || '',
                b.periodName || '',
                b.startDate || '',
                b.endDate || '',
                b.totalAmount || 0,
                spent,
                b.totalAmount - spent,
                b.status || 'Draft',
                b.branchName || '',
                b.departmentName || '',
                b.description || '',
            ]);
        });

        return rows;
    }

}

// ✅ Export for compatibility
export { ExportService as default };