// src/services/finance/report/bankAccount.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface BankAccountData {
    id: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    accountType: string;
    openingBalance: number;
    currentBalance: number;
    isActive: boolean;
    branchId?: string;
    branchName?: string;
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

export class BankAccountReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY
    // ============================================================
    static generatePDF(data: BankAccountData[], companyName: string = 'RST ERP System'): jsPDF {
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

        const totalBalance = data.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
        const activeAccounts = data.filter(acc => acc.isActive).length;

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
        doc.text('BANK ACCOUNTS', pageWidth / 2, yPos, { align: 'center' });
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
        const cardHeight = 26;
        const cards = [
            { label: 'Total Accounts', value: data.length, color: '#7c3aed', isCurrency: false },
            { label: 'Active Accounts', value: activeAccounts, color: '#16a34a', isCurrency: false },
            { label: 'Total Balance', value: totalBalance, color: '#2563eb', isCurrency: true },
            { label: 'Avg Balance', value: data.length > 0 ? totalBalance / data.length : 0, color: '#d97706', isCurrency: true },
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
        // ACCOUNTS TABLE
        // ============================================
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Account List', margin, yPos);
        yPos += 6;

        if (data.length === 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(148, 163, 184);
            doc.text('No bank accounts found.', pageWidth / 2, yPos + 20, { align: 'center' });
            yPos += 40;
        } else {
            const tableData = data.map(account => [
                account.accountName || '',
                account.bankName || '',
                account.accountNumber || '',
                account.accountType || '',
                formatCurrency(account.currentBalance || 0),
                account.isActive ? 'Active' : 'Inactive',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Account Name', 'Bank', 'Account Number', 'Type', 'Balance', 'Status']],
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
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 35, halign: 'center' },
                    3: { cellWidth: 25, halign: 'center' },
                    4: { cellWidth: 35, halign: 'right' },
                    5: { cellWidth: 25, halign: 'center' },
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 5) {
                        const status = data.cell.raw as string;
                        if (status === 'Active') {
                            data.cell.styles.textColor = [22, 163, 74];
                            data.cell.styles.fontStyle = 'bold';
                        } else {
                            data.cell.styles.textColor = [220, 38, 38];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    if (data.section === 'body' && data.column.index === 4) {
                        const value = data.cell.raw as number;
                        if (value > 0) {
                            data.cell.styles.textColor = [37, 99, 235];
                        }
                    }
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;

            // Summary by type
            const typeSummary = new Map<string, { count: number; balance: number }>();
            data.forEach(acc => {
                const type = acc.accountType || 'Other';
                if (!typeSummary.has(type)) {
                    typeSummary.set(type, { count: 0, balance: 0 });
                }
                const entry = typeSummary.get(type)!;
                entry.count++;
                entry.balance += acc.currentBalance || 0;
            });

            if (typeSummary.size > 0) {
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text('Summary by Account Type', margin, yPos);
                yPos += 6;

                const typeData = Array.from(typeSummary.entries()).map(([type, data]) => [
                    type,
                    data.count.toString(),
                    formatCurrency(data.balance),
                ]);

                autoTable(doc, {
                    startY: yPos,
                    head: [['Account Type', 'Count', 'Total Balance']],
                    body: typeData,
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
                });

                yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
                yPos += 8;
            }

            // Totals
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.5);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 6;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text(`Total Accounts: ${data.length}`, margin, yPos + 3);
            doc.text(`Active: ${activeAccounts}`, margin + 70, yPos + 3);
            doc.text(`Total Balance: ${formatCurrency(totalBalance)}`, pageWidth - margin, yPos + 3, { align: 'right' });
            yPos += 10;
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
    static generateHTML(data: BankAccountData[], companyName: string = 'RST ERP'): string {
        const totalBalance = data.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
        const activeAccounts = data.filter(acc => acc.isActive).length;

        const typeSummary = new Map<string, { count: number; balance: number }>();
        data.forEach(acc => {
            const type = acc.accountType || 'Other';
            if (!typeSummary.has(type)) {
                typeSummary.set(type, { count: 0, balance: 0 });
            }
            const entry = typeSummary.get(type)!;
            entry.count++;
            entry.balance += acc.currentBalance || 0;
        });

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bank Accounts</title>
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
        .summary-card.purple .value { color: #7c3aed; }
        .summary-card.green .value { color: #16a34a; }
        .summary-card.blue .value { color: #2563eb; }
        .summary-card.orange .value { color: #d97706; }
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
        .status-active { color: #16a34a; font-weight: 600; }
        .status-inactive { color: #dc2626; font-weight: 600; }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-weight: 700;
            border-top: 2px solid #1a1a2e;
            margin-top: 4px;
            font-size: 13px;
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
            <h1>BANK ACCOUNTS</h1>
            <div class="generated">Generated on ${formatDate(new Date().toISOString())}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card purple">
                <div class="label">Total Accounts</div>
                <div class="value">${data.length}</div>
            </div>
            <div class="summary-card green">
                <div class="label">Active Accounts</div>
                <div class="value">${activeAccounts}</div>
            </div>
            <div class="summary-card blue">
                <div class="label">Total Balance</div>
                <div class="value">${formatCurrency(totalBalance)}</div>
            </div>
            <div class="summary-card orange">
                <div class="label">Avg Balance</div>
                <div class="value">${data.length > 0 ? formatCurrency(totalBalance / data.length) : formatCurrency(0)}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Account List</div>
            ${data.length === 0 ? `
                <p style="text-align: center; color: #94a3b8; padding: 20px;">No bank accounts found.</p>
            ` : `
                <table>
                    <thead>
                        <tr>
                            <th>Account Name</th>
                            <th>Bank</th>
                            <th>Account Number</th>
                            <th>Type</th>
                            <th class="text-right">Balance</th>
                            <th class="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(account => `
                            <tr>
                                <td><strong>${account.accountName || ''}</strong></td>
                                <td>${account.bankName || ''}</td>
                                <td style="font-family: monospace;">${account.accountNumber || ''}</td>
                                <td>${account.accountType || ''}</td>
                                <td class="text-right" style="color: #2563eb; font-weight: 500;">${formatCurrency(account.currentBalance || 0)}</td>
                                <td class="text-center"><span class="${account.isActive ? 'status-active' : 'status-inactive'}">${account.isActive ? 'Active' : 'Inactive'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>

        ${typeSummary.size > 0 ? `
        <div class="section">
            <div class="section-title">Summary by Account Type</div>
            <table>
                <thead>
                    <tr>
                        <th>Account Type</th>
                        <th class="text-center">Count</th>
                        <th class="text-right">Total Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from(typeSummary.entries()).map(([type, data]) => `
                        <tr>
                            <td>${type}</td>
                            <td class="text-center">${data.count}</td>
                            <td class="text-right">${formatCurrency(data.balance)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="total-row">
            <span>Total Accounts: ${data.length}</span>
            <span>Active: ${activeAccounts}</span>
            <span>Total Balance: ${formatCurrency(totalBalance)}</span>
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
export { BankAccountReport as default };