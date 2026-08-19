// src/services/finance/report/generalLedger.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface GeneralLedgerData {
    accountCode: string;
    accountName: string;
    accountType?: string;
    startDate: string;
    endDate: string;
    openingBalance: number;
    entries: Array<{
        date: string;
        journalReference: string;
        description: string;
        debit: number;
        credit: number;
        balance: number;
    }>;
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
    generatedDate?: string;
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
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
}

function formatDateLong(dateString: string): string {
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

export class GeneralLedgerReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY (NO HTML)
    // ============================================================
    static generatePDF(data: GeneralLedgerData, companyName: string = 'RST ERP System'): jsPDF {
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

        const accountInfo = data.accountCode ? `${data.accountCode} - ${data.accountName}` : data.accountName || 'All Accounts';

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
        doc.text('GENERAL LEDGER', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(
            `${formatDateLong(data.startDate)} – ${formatDateLong(data.endDate)}`,
            pageWidth / 2,
            yPos,
            { align: 'center' }
        );
        yPos += 6;

        // Account info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(accountInfo, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setDrawColor(203, 213, 225);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // ============================================
        // SUMMARY CARDS (4 columns)
        // ============================================
        const cardWidth = (pageWidth - margin * 2 - 12) / 4;
        const cardHeight = 24;
        const cards = [
            { label: 'Opening Balance', amount: data.openingBalance, color: '#2563eb' },
            { label: 'Total Debits', amount: data.totalDebit, color: '#16a34a' },
            { label: 'Total Credits', amount: data.totalCredit, color: '#dc2626' },
            { label: 'Closing Balance', amount: data.closingBalance, color: '#7c3aed' },
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
            doc.text(card.label, x + cardWidth / 2, yPos + 7, { align: 'center' });

            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(rgbColor.r, rgbColor.g, rgbColor.b);
            doc.text(formatCurrency(card.amount), x + cardWidth / 2, yPos + 18, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // ============================================
        // ENTRIES TABLE
        // ============================================
        if (data.entries.length === 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(148, 163, 184);
            doc.text('No entries found for this account in the selected period.', pageWidth / 2, yPos + 20, {
                align: 'center',
            });
            yPos += 40;
        } else {
            const tableData = data.entries.map(entry => [
                formatDate(entry.date),
                entry.journalReference || '-',
                entry.description || '',
                entry.debit || 0,
                entry.credit || 0,
                entry.balance || 0,
            ]);

            // Add total row
            tableData.push([
                { content: 'TOTAL', styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
                { content: '', styles: { fontStyle: 'bold' } },
                { content: '', styles: { fontStyle: 'bold' } },
                { content: data.totalDebit, styles: { fontStyle: 'bold', textColor: [37, 99, 235] } },
                { content: data.totalCredit, styles: { fontStyle: 'bold', textColor: [220, 38, 38] } },
                { content: data.closingBalance, styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
            ]);

            // Calculate column widths based on content
            const colWidths = ['auto', 30, 'auto', 35, 35, 35];

            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Journal Ref', 'Description', 'Debit', 'Credit', 'Balance']],
                body: tableData,
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
                    halign: 'left',
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 30, halign: 'center' },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 35, halign: 'right' },
                    4: { cellWidth: 35, halign: 'right' },
                    5: { cellWidth: 35, halign: 'right' },
                },
                didParseCell: (data) => {
                    // Color code debit and credit columns
                    if (data.section === 'body' && data.column.index === 3) {
                        const value = data.cell.raw as number;
                        if (value > 0) {
                            data.cell.styles.textColor = [37, 99, 235];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    if (data.section === 'body' && data.column.index === 4) {
                        const value = data.cell.raw as number;
                        if (value > 0) {
                            data.cell.styles.textColor = [220, 38, 38];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    if (data.section === 'body' && data.column.index === 5) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
                didDrawPage: (data) => {
                    // Update yPos after table
                },
            });

            const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos = finalY + 10;
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
        // Safely access data with fallbacks
        const accountCode = data?.accountCode || '';
        const accountName = data?.accountName || 'All Accounts';
        const accountType = data?.accountType || '';
        const accountInfo = accountCode ? `${accountCode} - ${accountName}` : accountName;
        const startDate = data?.startDate || new Date().toISOString().split('T')[0];
        const endDate = data?.endDate || new Date().toISOString().split('T')[0];
        const periodDisplay = `${formatDateLong(startDate)} to ${formatDateLong(endDate)}`;

        const entries = data?.entries || [];
        const openingBalance = data?.openingBalance || 0;
        const totalDebit = data?.totalDebit || 0;
        const totalCredit = data?.totalCredit || 0;
        const closingBalance = data?.closingBalance || 0;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>General Ledger</title>
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
                    border-bottom: 3px solid #1a1a2e;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .report-header .company-name {
                    font-size: 22px;
                    font-weight: 700;
                    color: #1a1a2e;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                .report-header .company-name span { color: #2563eb; }
                .report-header h1 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 6px;
                    letter-spacing: 1px;
                }
                .report-header .period {
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 4px;
                    font-weight: 400;
                }
                .report-header .account-info {
                    font-size: 13px;
                    color: #2563eb;
                    font-weight: 600;
                    margin-top: 8px;
                    padding: 6px 20px;
                    background: #eff6ff;
                    border-radius: 20px;
                    display: inline-block;
                    border: 1px solid #93c5fd;
                }
                .report-header .account-type {
                    font-size: 11px;
                    color: #64748b;
                    margin-top: 4px;
                    font-weight: 400;
                }

                .summary-cards {
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
                    font-size: 10px;
                    text-transform: uppercase;
                    color: #64748b;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .summary-card .value {
                    font-size: 18px;
                    font-weight: 700;
                    margin-top: 4px;
                }
                .summary-card.blue .value { color: #2563eb; }
                .summary-card.green .value { color: #16a34a; }
                .summary-card.red .value { color: #dc2626; }
                .summary-card.purple .value { color: #7c3aed; }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }
                table thead th {
                    background: #f1f5f9;
                    padding: 10px 12px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    color: #334155;
                    border-bottom: 2px solid #1a1a2e;
                }
                table tbody td {
                    padding: 8px 12px;
                    border-bottom: 1px solid #f1f5f9;
                    color: #1e293b;
                }
                table tbody tr:hover {
                    background: #f8fafc;
                }
                table tbody tr:last-child td {
                    border-bottom: none;
                }
                table thead th:nth-child(4),
                table thead th:nth-child(5),
                table thead th:nth-child(6) {
                    text-align: right;
                }
                table tbody td:nth-child(4),
                table tbody td:nth-child(5),
                table tbody td:nth-child(6) {
                    text-align: right;
                }
                table .credit { color: #dc2626; font-weight: 600; }
                table .debit { color: #2563eb; font-weight: 600; }
                table .balance { 
                    font-weight: 700;
                    color: #1a1a2e;
                }
                table tfoot td {
                    font-weight: 700;
                    padding: 10px 12px;
                    border-top: 2px solid #1a1a2e;
                    background: #f8fafc;
                }
                table tfoot td:nth-child(4),
                table tfoot td:nth-child(5),
                table tfoot td:nth-child(6) {
                    text-align: right;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #94a3b8;
                }
                .empty-state .icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                }
                .empty-state .title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 4px;
                }
                .empty-state .subtitle {
                    font-size: 13px;
                    color: #94a3b8;
                }

                .footer {
                    margin-top: 24px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 11px;
                    color: #94a3b8;
                    text-align: center;
                }

                @media print {
                    body { padding: 0; background: #ffffff; }
                    .report-container {
                        border: none;
                        border-radius: 0;
                        box-shadow: none;
                        padding: 30px 40px;
                        max-width: 100%;
                    }
                    .summary-card {
                        background: #f8fafc !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .account-info {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    table thead th {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }

                @media (max-width: 768px) {
                    .report-container { padding: 20px; }
                    .summary-cards { grid-template-columns: repeat(2, 1fr); }
                    table { font-size: 10px; }
                    table thead th, table tbody td, table tfoot td { padding: 4px 6px; }
                }
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="report-header">
                    <div class="company-name">${companyName}</div>
                    <h1>GENERAL LEDGER</h1>
                    <div class="period">${periodDisplay}</div>
                    <div class="account-info">${accountInfo}</div>
                    ${accountType ? `<div class="account-type">Account Type: ${accountType}</div>` : ''}
                </div>

                <div class="summary-cards">
                    <div class="summary-card blue">
                        <div class="label">Opening Balance</div>
                        <div class="value">${formatCurrency(openingBalance)}</div>
                    </div>
                    <div class="summary-card green">
                        <div class="label">Total Debits</div>
                        <div class="value">${formatCurrency(totalDebit)}</div>
                    </div>
                    <div class="summary-card red">
                        <div class="label">Total Credits</div>
                        <div class="value">${formatCurrency(totalCredit)}</div>
                    </div>
                    <div class="summary-card purple">
                        <div class="label">Closing Balance</div>
                        <div class="value">${formatCurrency(closingBalance)}</div>
                    </div>
                </div>

                ${entries.length === 0 ? `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <div class="title">No Entries Found</div>
                    <div class="subtitle">There are no journal entries for this account in the selected period.</div>
                </div>
                ` : `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Journal Ref</th>
                            <th>Description</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.map((entry: any) => `
                            <tr>
                                <td>${formatDate(entry.date)}</td>
                                <td><strong>${entry.journalReference || '-'}</strong></td>
                                <td>${entry.description || ''}</td>
                                <td class="debit">${entry.debit && entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
                                <td class="credit">${entry.credit && entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
                                <td class="balance">${formatCurrency(entry.balance)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>TOTAL</strong></td>
                            <td class="debit"><strong>${formatCurrency(totalDebit)}</strong></td>
                            <td class="credit"><strong>${formatCurrency(totalCredit)}</strong></td>
                            <td class="balance"><strong>${formatCurrency(closingBalance)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                `}

                <div class="footer">
                    Generated on ${new Date().toLocaleString()} • RST ERP System
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

// ✅ Export for compatibility
export { GeneralLedgerReport as default };