// src/services/finance/report/pettyCash.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PettyCashTransaction {
    id: string;
    transactionDate: string;
    description: string;
    amount: number;
    transactionType: string;
    category: string;
    receiptUrl?: string;
    employeeId?: string;
    employeeName?: string;
    status: string;
    dateAdd: string;
    dateMod?: string;
}

export interface PettyCashBalance {
    id: string;
    balance: number;
    totalExpenses: number;
    totalReplenishments: number;
    dateAdd: string;
    dateMod?: string;
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

export class PettyCashReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY
    // ============================================================
    static generatePDF(
        transactions: PettyCashTransaction[],
        balance: PettyCashBalance,
        companyName: string = 'RST ERP System'
    ): jsPDF {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 18;
        let yPos = 20;

        const totalTransactions = transactions.length;
        const totalExpenses = transactions.filter(t => t.transactionType === 'Expense' || t.transactionType === 'Withdrawal').reduce((sum, t) => sum + t.amount, 0);
        const totalReplenishments = transactions.filter(t => t.transactionType === 'Replenishment').reduce((sum, t) => sum + t.amount, 0);
        const pendingCount = transactions.filter(t => t.status === 'Pending').length;
        const approvedCount = transactions.filter(t => t.status === 'Approved').length;

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
        doc.text('PETTY CASH REPORT', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(11);
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
        const cardHeight = 28;
        const cards = [
            { label: 'Current Balance', amount: balance?.balance || 0, color: '#16a34a', isCurrency: true },
            { label: 'Total Expenses', amount: totalExpenses, color: '#dc2626', isCurrency: true },
            { label: 'Replenishments', amount: totalReplenishments, color: '#2563eb', isCurrency: true },
            { label: 'Transactions', amount: totalTransactions, color: '#7c3aed', isCurrency: false },
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
                ? formatCurrency(card.amount as number)
                : String(card.amount);
            doc.text(displayValue, x + cardWidth / 2, yPos + 20, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // ============================================
        // SUMMARY BREAKDOWN
        // ============================================
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Transaction Summary', margin, yPos);
        yPos += 6;

        const summaryData = [
            ['Total Transactions', totalTransactions.toString()],
            ['Pending', pendingCount.toString()],
            ['Approved', approvedCount.toString()],
            ['Total Expenses', formatCurrency(totalExpenses)],
            ['Total Replenishments', formatCurrency(totalReplenishments)],
            ['Current Balance', formatCurrency(balance?.balance || 0)],
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: summaryData,
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
                item.category || '',
                item.transactionType || '',
                item.amount || 0,
                item.status || '',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Description', 'Category', 'Type', 'Amount', 'Status']],
                body: tableData,
                margin: { left: margin, right: margin },
                styles: {
                    fontSize: 8,
                    cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
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
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 20, halign: 'center' },
                    4: { cellWidth: 30, halign: 'right' },
                    5: { cellWidth: 20, halign: 'center' },
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 3) {
                        const type = data.cell.raw as string;
                        if (type === 'Replenishment') {
                            data.cell.styles.textColor = [22, 163, 74];
                            data.cell.styles.fontStyle = 'bold';
                        } else {
                            data.cell.styles.textColor = [220, 38, 38];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    if (data.section === 'body' && data.column.index === 4) {
                        data.cell.styles.textColor = [37, 99, 235];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    if (data.section === 'body' && data.column.index === 5) {
                        const status = data.cell.raw as string;
                        if (status === 'Approved') {
                            data.cell.styles.textColor = [22, 163, 74];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (status === 'Pending') {
                            data.cell.styles.textColor = [202, 138, 4];
                            data.cell.styles.fontStyle = 'bold';
                        } else {
                            data.cell.styles.textColor = [220, 38, 38];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;

            // ============================================
            // SUMMARY BY CATEGORY
            // ============================================
            const categorySummary = new Map<string, { count: number; total: number }>();
            transactions.forEach(t => {
                const category = t.category || 'Other';
                if (!categorySummary.has(category)) {
                    categorySummary.set(category, { count: 0, total: 0 });
                }
                const entry = categorySummary.get(category)!;
                entry.count++;
                entry.total += t.amount;
            });

            if (categorySummary.size > 0) {
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text('Summary by Category', margin, yPos);
                yPos += 6;

                const categoryData = Array.from(categorySummary.entries()).map(([category, data]) => [
                    category,
                    data.count.toString(),
                    formatCurrency(data.total),
                ]);

                autoTable(doc, {
                    startY: yPos,
                    head: [['Category', 'Count', 'Total Amount']],
                    body: categoryData,
                    margin: { left: margin, right: margin },
                    styles: {
                        fontSize: 8,
                        cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
                        textColor: [30, 41, 59],
                    },
                    headStyles: {
                        fillColor: [241, 245, 249],
                        textColor: [51, 65, 85],
                        fontStyle: 'bold',
                        fontSize: 7,
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 25, halign: 'center' },
                        2: { cellWidth: 45, halign: 'right' },
                    },
                    didParseCell: (data) => {
                        if (data.section === 'body' && data.column.index === 2) {
                            data.cell.styles.textColor = [37, 99, 235];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    },
                });

                yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
                yPos += 8;
            }

            // ============================================
            // SUMMARY BY STATUS
            // ============================================
            const statusSummary = new Map<string, number>();
            transactions.forEach(t => {
                const status = t.status || 'Pending';
                if (!statusSummary.has(status)) {
                    statusSummary.set(status, 0);
                }
                statusSummary.set(status, statusSummary.get(status)! + 1);
            });

            if (statusSummary.size > 0) {
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text('Summary by Status', margin, yPos);
                yPos += 6;

                const statusData = Array.from(statusSummary.entries()).map(([status, count]) => [
                    status,
                    count.toString(),
                ]);

                autoTable(doc, {
                    startY: yPos,
                    head: [['Status', 'Count']],
                    body: statusData,
                    margin: { left: margin, right: margin },
                    styles: {
                        fontSize: 8,
                        cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
                        textColor: [30, 41, 59],
                    },
                    headStyles: {
                        fillColor: [241, 245, 249],
                        textColor: [51, 65, 85],
                        fontStyle: 'bold',
                        fontSize: 7,
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 30, halign: 'center' },
                    },
                    didParseCell: (data) => {
                        if (data.section === 'body' && data.column.index === 0) {
                            const status = data.cell.raw as string;
                            if (status === 'Approved') {
                                data.cell.styles.textColor = [22, 163, 74];
                                data.cell.styles.fontStyle = 'bold';
                            } else if (status === 'Pending') {
                                data.cell.styles.textColor = [202, 138, 4];
                                data.cell.styles.fontStyle = 'bold';
                            } else {
                                data.cell.styles.textColor = [220, 38, 38];
                                data.cell.styles.fontStyle = 'bold';
                            }
                        }
                    },
                });

                yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
                yPos += 8;
            }
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
    // ✅ GENERATE HTML (for print preview)
    // ============================================================
    static generateHTML(data: any, companyName: string = 'RST ERP'): string {
        let transactions: PettyCashTransaction[] = [];
        let balance: PettyCashBalance | null = null;

        if (Array.isArray(data)) {
            transactions = data;
        } else if (data && typeof data === 'object') {
            transactions = Array.isArray(data.transactions) ? data.transactions : [];
            balance = data.balance || null;
        }

        const totalTransactions = transactions.length;
        const totalExpenses = transactions.filter(t => t.transactionType === 'Expense' || t.transactionType === 'Withdrawal').reduce((sum, t) => sum + t.amount, 0);
        const totalReplenishments = transactions.filter(t => t.transactionType === 'Replenishment').reduce((sum, t) => sum + t.amount, 0);
        const pendingCount = transactions.filter(t => t.status === 'Pending').length;
        const approvedCount = transactions.filter(t => t.status === 'Approved').length;

        const categorySummary = new Map<string, { count: number; total: number }>();
        transactions.forEach(t => {
            const category = t.category || 'Other';
            if (!categorySummary.has(category)) {
                categorySummary.set(category, { count: 0, total: 0 });
            }
            const entry = categorySummary.get(category)!;
            entry.count++;
            entry.total += t.amount;
        });

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Petty Cash Report</title>
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
        .report-header .generated {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
            font-weight: 400;
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
        .summary-card.green .value { color: #16a34a; }
        .summary-card.red .value { color: #dc2626; }
        .summary-card.blue .value { color: #2563eb; }
        .summary-card.purple .value { color: #7c3aed; }
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
        .status-approved { color: #16a34a; font-weight: 600; }
        .status-pending { color: #ca8a04; font-weight: 600; }
        .status-rejected { color: #dc2626; font-weight: 600; }
        .type-expense { color: #dc2626; font-weight: 600; }
        .type-replenishment { color: #16a34a; font-weight: 600; }
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
        }
        @media (max-width: 768px) {
            .summary-grid { grid-template-columns: 1fr 1fr; }
            .report-container { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="report-header">
            <div class="company-name">${companyName}</div>
            <h1>PETTY CASH REPORT</h1>
            <div class="generated">Generated on ${formatDate(new Date().toISOString())}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card green">
                <div class="label">Current Balance</div>
                <div class="value">${formatCurrency(balance?.balance || 0)}</div>
            </div>
            <div class="summary-card red">
                <div class="label">Total Expenses</div>
                <div class="value">${formatCurrency(totalExpenses)}</div>
            </div>
            <div class="summary-card blue">
                <div class="label">Replenishments</div>
                <div class="value">${formatCurrency(totalReplenishments)}</div>
            </div>
            <div class="summary-card purple">
                <div class="label">Transactions</div>
                <div class="value">${totalTransactions}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Transaction List</div>
            ${transactions.length === 0 ? `
                <p style="text-align: center; color: #94a3b8; padding: 20px;">No transactions found.</p>
            ` : `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th class="text-right">Amount</th>
                            <th class="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(t => `
                            <tr>
                                <td>${formatDateShort(t.transactionDate)}</td>
                                <td>${t.description || ''}</td>
                                <td>${t.category || ''}</td>
                                <td class="text-center"><span class="${t.transactionType === 'Replenishment' ? 'type-replenishment' : 'type-expense'}">${t.transactionType || ''}</span></td>
                                <td class="text-right" style="color: #2563eb; font-weight: 500;">${formatCurrency(t.amount || 0)}</td>
                                <td class="text-center"><span class="status-${(t.status || 'pending').toLowerCase()}">${t.status || 'Pending'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>

        ${categorySummary.size > 0 ? `
        <div class="section">
            <div class="section-title">Summary by Category</div>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th class="text-center">Count</th>
                        <th class="text-right">Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from(categorySummary.entries()).map(([category, data]) => `
                        <tr>
                            <td>${category}</td>
                            <td class="text-center">${data.count}</td>
                            <td class="text-right">${formatCurrency(data.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="section">
            <div class="section-title">Summary by Status</div>
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th class="text-center">Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Approved</td><td class="text-center">${approvedCount}</td></tr>
                    <tr><td>Pending</td><td class="text-center">${pendingCount}</td></tr>
                    <tr><td>Rejected</td><td class="text-center">${transactions.filter(t => t.status === 'Rejected').length}</td></tr>
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
}

// ✅ Export for compatibility
export { PettyCashReport as default };