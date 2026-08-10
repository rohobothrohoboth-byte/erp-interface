// src/services/finance/report/bankReconciliation.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface BankReconciliationData {
    id: string;
    bankAccountId: string;
    bankAccountName?: string;
    transactionDate: string;
    transactionType: string;
    amount: number;
    description: string;
    reference: string;
    isReconciled: boolean;
    reconciliationDate?: string;
    dateAdd: string;
    dateMod?: string;
    periodId?: string;
    periodName?: string;
}

export interface ReconciliationSummaryData {
    bankAccountId?: string;
    bankAccountName?: string;
    totalTransactions: number;
    reconciledCount: number;
    unreconciledCount: number;
    totalAmount: number;
    reconciledAmount: number;
    unreconciledAmount: number;
    reconciliationProgress: number;
    periodId?: string;
    periodName?: string;
}

// ============================================================
// ✅ STANDALONE HELPER FUNCTIONS
// ============================================================

function formatCurrency(amount: number): string {
    if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
    const sign = amount < 0 ? '-' : '';
    const absAmount = Math.abs(amount);
    return `${sign}$${absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
}

function formatDateShort(dateString: string): string {
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
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : { r: 0, g: 0, b: 0 };
}

// ✅ Default summary data
function getDefaultSummary(): ReconciliationSummaryData {
    return {
        totalTransactions: 0,
        reconciledCount: 0,
        unreconciledCount: 0,
        totalAmount: 0,
        reconciledAmount: 0,
        unreconciledAmount: 0,
        reconciliationProgress: 0,
    };
}

export class BankReconciliationReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY
    // ============================================================
    static generatePDF(
        data: BankReconciliationData[],
        summary: ReconciliationSummaryData,
        companyName: string = 'RST ERP System'
    ): jsPDF {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 18;
        let yPos = 20;

        const transactions = Array.isArray(data) ? data : [];
        const summaryData = summary || getDefaultSummary();

        const totalTransactions = transactions.length;
        const reconciledCount = transactions.filter(t => t.isReconciled).length;
        const unreconciledCount = transactions.filter(t => !t.isReconciled).length;
        const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const reconciledAmount = transactions.filter(t => t.isReconciled).reduce((sum, t) => sum + (t.amount || 0), 0);
        const unreconciledAmount = transactions.filter(t => !t.isReconciled).reduce((sum, t) => sum + (t.amount || 0), 0);
        const progress = totalTransactions > 0 ? (reconciledCount / totalTransactions) * 100 : 0;

        // ============================================
        // HEADER
        // ============================================
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(companyName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('BANK RECONCILIATION REPORT', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const periodDisplay = summaryData.periodName || 'All Periods';
        doc.text(`Period: ${periodDisplay}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on ${formatDate(new Date().toISOString())}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setDrawColor(203, 213, 225);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // ============================================
        // SUMMARY CARDS (4 columns)
        // ============================================
        const cardWidth = (pageWidth - margin * 2 - 12) / 4;
        const cardHeight = 26;
        const cards = [
            { label: 'Total Transactions', value: totalTransactions, color: '#7c3aed', isCurrency: false },
            { label: 'Reconciled', value: reconciledCount, color: '#16a34a', isCurrency: false },
            { label: 'Unreconciled', value: unreconciledCount, color: '#ca8a04', isCurrency: false },
            { label: 'Total Amount', value: totalAmount, color: '#2563eb', isCurrency: true },
        ];

        cards.forEach((card, index) => {
            const x = margin + index * (cardWidth + 4);
            const rgbColor = hexToRgb(card.color);

            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(229, 231, 235);
            doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, 'FD');

            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text(card.label, x + cardWidth / 2, yPos + 8, { align: 'center' });

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(rgbColor.r, rgbColor.g, rgbColor.b);
            const displayValue = card.isCurrency
                ? formatCurrency(card.value as number)
                : String(card.value);
            doc.text(displayValue, x + cardWidth / 2, yPos + 20, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // ============================================
        // SUMMARY BREAKDOWN
        // ============================================
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Reconciliation Summary', margin, yPos);
        yPos += 6;

        const summaryTableData = [
            ['Total Transactions', totalTransactions.toString()],
            ['Reconciled', reconciledCount.toString()],
            ['Unreconciled', unreconciledCount.toString()],
            ['Reconciled Amount', formatCurrency(reconciledAmount)],
            ['Unreconciled Amount', formatCurrency(unreconciledAmount)],
            ['Progress', `${progress.toFixed(1)}%`],
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: summaryTableData,
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 9,
                cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
                textColor: [30, 41, 59],
            },
            headStyles: {
                fillColor: [241, 245, 249],
                textColor: [51, 65, 85],
                fontStyle: 'bold',
                fontSize: 8,
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 50, halign: 'right' },
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 1) {
                    data.cell.styles.textColor = [37, 99, 235];
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });

        yPos = (doc as any).lastAutoTable?.finalY || yPos + 30;
        yPos += 8;

        // ============================================
        // TRANSACTIONS TABLE
        // ============================================
        if (transactions.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Transaction List', margin, yPos);
            yPos += 6;

            const tableData = transactions.map(item => [
                formatDateShort(item.transactionDate),
                item.description || '',
                item.reference || '',
                item.bankAccountName || '',
                item.transactionType || '',
                item.amount || 0,
                item.isReconciled ? 'Reconciled' : 'Unreconciled',
                item.periodName || '',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Description', 'Reference', 'Account', 'Type', 'Amount', 'Status', 'Period']],
                body: tableData,
                margin: { left: margin, right: margin },
                styles: {
                    fontSize: 7,
                    cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
                    textColor: [30, 41, 59],
                },
                headStyles: {
                    fillColor: [241, 245, 249],
                    textColor: [51, 65, 85],
                    fontStyle: 'bold',
                    fontSize: 7,
                    halign: 'left',
                },
                columnStyles: {
                    0: { cellWidth: 25, halign: 'center' },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 25, halign: 'center' },
                    3: { cellWidth: 'auto' },
                    4: { cellWidth: 20, halign: 'center' },
                    5: { cellWidth: 30, halign: 'right' },
                    6: { cellWidth: 20, halign: 'center' },
                    7: { cellWidth: 'auto' },
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 4) {
                        const type = data.cell.raw as string;
                        if (type === 'Deposit' || type === 'Replenishment') {
                            data.cell.styles.textColor = [22, 163, 74];
                            data.cell.styles.fontStyle = 'bold';
                        } else {
                            data.cell.styles.textColor = [220, 38, 38];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    if (data.section === 'body' && data.column.index === 5) {
                        const value = data.cell.raw as number;
                        if (value > 0) {
                            data.cell.styles.textColor = [37, 99, 235];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    if (data.section === 'body' && data.column.index === 6) {
                        const status = data.cell.raw as string;
                        if (status === 'Reconciled') {
                            data.cell.styles.textColor = [22, 163, 74];
                            data.cell.styles.fontStyle = 'bold';
                        } else {
                            data.cell.styles.textColor = [202, 138, 4];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;
        }

        // ============================================
        // FOOTER
        // ============================================
        const totalPages = doc.internal.pages.length - 1;
        const dateStr = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            const pageHeight_ = doc.internal.pageSize.getHeight();

            doc.setDrawColor(203, 213, 225);
            doc.line(margin, pageHeight_ - 15, pageWidth - margin, pageHeight_ - 15);

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(148, 163, 184);

            doc.text(companyName, margin, pageHeight_ - 8);
            doc.text(`Generated: ${dateStr}`, pageWidth / 2, pageHeight_ - 8, { align: 'center' });
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight_ - 8, { align: 'right' });
        }

        return doc;
    }

    // ============================================================
    // ✅ GENERATE HTML (for print preview) - FIXED
    // ============================================================
    static generateHTML(data: any, companyName: string = 'RST ERP'): string {
        // ✅ CRITICAL FIX: Safely extract transactions with proper typing
        let transactions: BankReconciliationData[] = [];
        let summaryData: ReconciliationSummaryData;

        // Handle null/undefined
        if (!data) {
            summaryData = getDefaultSummary();
            return this.getEmptyHTML(companyName);
        }

        // If data is an array, use it directly
        if (Array.isArray(data)) {
            transactions = data;
            summaryData = getDefaultSummary();
        }
        // If data is an object
        else if (typeof data === 'object') {
            // Check for transactions property
            if (data.transactions && Array.isArray(data.transactions)) {
                transactions = data.transactions;
                // Use provided summary or create default with calculated values
                if (data.summary && typeof data.summary === 'object') {
                    summaryData = {
                        totalTransactions: data.summary.totalTransactions || 0,
                        reconciledCount: data.summary.reconciledCount || 0,
                        unreconciledCount: data.summary.unreconciledCount || 0,
                        totalAmount: data.summary.totalAmount || 0,
                        reconciledAmount: data.summary.reconciledAmount || 0,
                        unreconciledAmount: data.summary.unreconciledAmount || 0,
                        reconciliationProgress: data.summary.reconciliationProgress || 0,
                        periodId: data.summary.periodId || '',
                        periodName: data.summary.periodName || '',
                        bankAccountId: data.summary.bankAccountId || '',
                        bankAccountName: data.summary.bankAccountName || '',
                    };
                } else {
                    summaryData = getDefaultSummary();
                }
            }
            // Check for items property
            else if (data.items && Array.isArray(data.items)) {
                transactions = data.items;
                summaryData = data.summary ? { ...getDefaultSummary(), ...data.summary } : getDefaultSummary();
            }
            // If data itself has reconciliation properties, it might be the summary
            else if (data.totalTransactions !== undefined) {
                summaryData = {
                    totalTransactions: data.totalTransactions || 0,
                    reconciledCount: data.reconciledCount || 0,
                    unreconciledCount: data.unreconciledCount || 0,
                    totalAmount: data.totalAmount || 0,
                    reconciledAmount: data.reconciledAmount || 0,
                    unreconciledAmount: data.unreconciledAmount || 0,
                    reconciliationProgress: data.reconciliationProgress || 0,
                    periodId: data.periodId || '',
                    periodName: data.periodName || '',
                    bankAccountId: data.bankAccountId || '',
                    bankAccountName: data.bankAccountName || '',
                };
                // Try to find transactions in a property
                for (const key of Object.keys(data)) {
                    if (Array.isArray(data[key]) && data[key].length > 0) {
                        const firstItem = data[key][0];
                        if (firstItem && (firstItem.transactionDate || firstItem.amount !== undefined)) {
                            transactions = data[key];
                            break;
                        }
                    }
                }
            } else {
                summaryData = getDefaultSummary();
            }
        } else {
            summaryData = getDefaultSummary();
        }

        // If we still have no transactions, try to find any array
        if (transactions.length === 0 && data && typeof data === 'object' && !Array.isArray(data)) {
            for (const key of Object.keys(data)) {
                const value = data[key];
                if (Array.isArray(value) && value.length > 0) {
                    const firstItem = value[0];
                    if (firstItem && (firstItem.transactionDate || firstItem.amount !== undefined || firstItem.id)) {
                        transactions = value;
                        break;
                    }
                }
            }
        }

        // If we still have no transactions, check if data itself is a transaction
        if (transactions.length === 0 && data && typeof data === 'object' && !Array.isArray(data)) {
            if (data.id && data.transactionDate !== undefined) {
                transactions = [data];
            }
        }

        // If still no transactions, return empty
        if (transactions.length === 0) {
            return this.getEmptyHTML(companyName);
        }

        // Calculate values from transactions
        const totalTransactions = transactions.length;
        const reconciledCount = transactions.filter(t => t.isReconciled).length;
        const unreconciledCount = transactions.filter(t => !t.isReconciled).length;
        const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const reconciledAmount = transactions.filter(t => t.isReconciled).reduce((sum, t) => sum + (t.amount || 0), 0);
        const unreconciledAmount = transactions.filter(t => !t.isReconciled).reduce((sum, t) => sum + (t.amount || 0), 0);
        const progress = totalTransactions > 0 ? (reconciledCount / totalTransactions) * 100 : 0;
        const periodDisplay = summaryData.periodName || 'All Periods';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bank Reconciliation Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', -apple-system, Arial, sans-serif;
            background: #ffffff;
            color: #1a1a2e;
            padding: 40px;
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
        }
        .report-container {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 50px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }
        .report-header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .report-header .company-name {
            font-size: 20px;
            font-weight: 700;
            color: #1a1a2e;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .report-header h1 {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
            letter-spacing: 1px;
        }
        .report-header .period {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
            font-weight: 400;
        }
        .report-header .generated {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 2px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
        }
        .summary-card {
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            background: #f8fafc;
            text-align: center;
        }
        .summary-card .label {
            font-size: 9px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .summary-card .value {
            font-size: 16px;
            font-weight: 700;
            margin-top: 2px;
        }
        .summary-card.purple .value { color: #7c3aed; }
        .summary-card.green .value { color: #16a34a; }
        .summary-card.yellow .value { color: #ca8a04; }
        .summary-card.blue .value { color: #2563eb; }
        .summary-breakdown {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
        }
        .summary-breakdown .item {
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            background: #f8fafc;
            display: flex;
            justify-content: space-between;
        }
        .summary-breakdown .item .label {
            color: #64748b;
            font-size: 11px;
            font-weight: 500;
        }
        .summary-breakdown .item .value {
            font-weight: 700;
            font-size: 13px;
            color: #1a1a2e;
        }
        .summary-breakdown .item .value.green { color: #16a34a; }
        .summary-breakdown .item .value.yellow { color: #ca8a04; }
        .summary-breakdown .item .value.blue { color: #2563eb; }
        .section { margin-bottom: 20px; }
        .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #1a1a2e;
            padding: 6px 0 4px 0;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }
        table thead th {
            background: #f1f5f9;
            padding: 6px 10px;
            text-align: left;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            color: #475569;
            border-bottom: 1px solid #e5e7eb;
        }
        table tbody td {
            padding: 5px 10px;
            border-bottom: 1px solid #f1f5f9;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .status-reconciled { color: #16a34a; font-weight: 600; }
        .status-unreconciled { color: #ca8a04; font-weight: 600; }
        .type-deposit { color: #16a34a; font-weight: 600; }
        .type-withdrawal { color: #dc2626; font-weight: 600; }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 4px;
        }
        .progress-bar .fill {
            height: 100%;
            background: #16a34a;
            border-radius: 4px;
            transition: width 0.5s;
        }
        .footer {
            margin-top: 24px;
            padding-top: 14px;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
        }
        @media print {
            body { padding: 0; background: #ffffff; }
            .report-container { border: none; border-radius: 0; box-shadow: none; padding: 20px 30px; max-width: 100%; }
            .summary-card { background: #f8fafc !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .page-break { page-break-before: always; }
            .progress-bar .fill { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media (max-width: 768px) {
            .summary-grid { grid-template-columns: 1fr 1fr; }
            .summary-breakdown { grid-template-columns: 1fr; }
            .report-container { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="report-header">
            <div class="company-name">${companyName}</div>
            <h1>BANK RECONCILIATION REPORT</h1>
            <div class="period">Period: ${periodDisplay}</div>
            <div class="generated">Generated on ${formatDate(new Date().toISOString())}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card purple">
                <div class="label">Total Transactions</div>
                <div class="value">${totalTransactions}</div>
            </div>
            <div class="summary-card green">
                <div class="label">Reconciled</div>
                <div class="value">${reconciledCount}</div>
            </div>
            <div class="summary-card yellow">
                <div class="label">Unreconciled</div>
                <div class="value">${unreconciledCount}</div>
            </div>
            <div class="summary-card blue">
                <div class="label">Total Amount</div>
                <div class="value">${formatCurrency(totalAmount)}</div>
            </div>
        </div>

        <div class="summary-breakdown">
            <div class="item">
                <span class="label">Reconciled Amount</span>
                <span class="value green">${formatCurrency(reconciledAmount)}</span>
            </div>
            <div class="item">
                <span class="label">Unreconciled Amount</span>
                <span class="value yellow">${formatCurrency(unreconciledAmount)}</span>
            </div>
            <div class="item" style="grid-column: span 2;">
                <span class="label">Reconciliation Progress (${progress.toFixed(1)}%)</span>
                <span class="value blue">${reconciledCount} / ${totalTransactions}</span>
            </div>
            <div class="item" style="grid-column: span 2;">
                <div class="progress-bar">
                    <div class="fill" style="width: ${Math.min(100, progress)}%;"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Transaction List</div>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Reference</th>
                        <th>Account</th>
                        <th>Type</th>
                        <th class="text-right">Amount</th>
                        <th class="text-center">Status</th>
                        <th>Period</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(item => `
                        <tr>
                            <td>${formatDateShort(item.transactionDate)}</td>
                            <td>${item.description || ''}</td>
                            <td style="font-family: monospace;">${item.reference || ''}</td>
                            <td>${item.bankAccountName || ''}</td>
                            <td class="text-center"><span class="${item.transactionType === 'Deposit' || item.transactionType === 'Replenishment' ? 'type-deposit' : 'type-withdrawal'}">${item.transactionType || ''}</span></td>
                            <td class="text-right" style="color: #2563eb; font-weight: 500;">${formatCurrency(item.amount || 0)}</td>
                            <td class="text-center"><span class="${item.isReconciled ? 'status-reconciled' : 'status-unreconciled'}">${item.isReconciled ? 'Reconciled' : 'Unreconciled'}</span></td>
                            <td>${item.periodName || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="footer">
            Generated on ${new Date().toLocaleString()} • RST ERP System
        </div>
    </div>
</body>
</html>`;
    }

    // ============================================================
    // ✅ HELPER: Empty HTML
    // ============================================================
    private static getEmptyHTML(companyName: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bank Reconciliation Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', -apple-system, Arial, sans-serif;
            background: #ffffff;
            color: #1a1a2e;
            padding: 40px;
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
        }
        .report-container {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 50px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }
        .report-header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .report-header .company-name {
            font-size: 20px;
            font-weight: 700;
            color: #1a1a2e;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .report-header h1 {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
            letter-spacing: 1px;
        }
        .report-header .period {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
            font-weight: 400;
        }
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #94a3b8;
        }
        .empty-state .icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state .title { font-size: 16px; font-weight: 600; color: #64748b; margin-bottom: 4px; }
        .empty-state .subtitle { font-size: 13px; color: #94a3b8; }
        .footer {
            margin-top: 24px;
            padding-top: 14px;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
        }
        @media print {
            body { padding: 0; background: #ffffff; }
            .report-container { border: none; border-radius: 0; box-shadow: none; padding: 20px 30px; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="report-header">
            <div class="company-name">${companyName}</div>
            <h1>BANK RECONCILIATION REPORT</h1>
            <div class="period">No transactions found</div>
        </div>
        <div class="empty-state">
            <div class="icon">📋</div>
            <div class="title">No Reconciliation Data</div>
            <div class="subtitle">There are no bank reconciliation transactions to display.</div>
        </div>
        <div class="footer">
            Generated on ${new Date().toLocaleString()} • RST ERP System
        </div>
    </div>
</body>
</html>`;
    }
}

// ✅ Export for compatibility
export { BankReconciliationReport as default };