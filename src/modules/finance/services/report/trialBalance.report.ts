// src/services/finance/report/trialBalance.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export class TrialBalanceReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY (NO HTML)
    // ============================================================
    static generatePDF(data: any, companyName: string = 'RST ERP System'): jsPDF {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let yPos = 18;

        // ✅ FIX: Properly access data with correct property names
        const items = data?.items || [];
        const asOfDate = data?.asOfDate || data?.endDate || new Date().toISOString().split('T')[0];
        const isBalanced = data?.isBalanced !== undefined ? data.isBalanced : true;

        // Use the correct property names from the page data
        const totalOpeningDebit = data?.totalOpeningDebit || 0;
        const totalDebitTransactions = data?.totalDebitTransactions || 0;
        const totalCreditTransactions = data?.totalCreditTransactions || 0;
        const totalClosingDebit = data?.totalClosingDebit || 0;
        const totalClosingCredit = data?.totalClosingCredit || 0;

        console.log('📊 Trial Balance PDF Data:', {
            itemsCount: items.length,
            totalClosingDebit,
            totalClosingCredit,
            isBalanced,
            asOfDate
        });

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
        doc.text('TRIAL BALANCE', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`As of ${formatDate(asOfDate)}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 6;

        // Status badge
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isBalanced ? 22 : 155, isBalanced ? 101 : 27, isBalanced ? 52 : 27);
        doc.text(
            isBalanced ? '✓ BALANCED' : '⚠ OUT OF BALANCE',
            pageWidth / 2,
            yPos,
            { align: 'center' }
        );
        yPos += 10;

        doc.setDrawColor(203, 213, 225);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        // ============================================
        // SUMMARY CARDS (4 columns)
        // ============================================
        const cardWidth = (pageWidth - margin * 2 - 12) / 4;
        const cardHeight = 24;
        const cards = [
            { label: 'Total Accounts', value: items.length, color: '#2563eb', isCurrency: false },
            { label: 'Total Debits', value: totalClosingDebit, color: '#16a34a', isCurrency: true },
            { label: 'Total Credits', value: totalClosingCredit, color: '#dc2626', isCurrency: true },
            { label: 'Status', value: isBalanced ? 'Balanced ✓' : 'Unbalanced ✗', color: isBalanced ? '#16a34a' : '#dc2626', isCurrency: false },
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
            const displayValue = card.isCurrency
                ? formatCurrency(card.value as number)
                : String(card.value);
            doc.text(displayValue, x + cardWidth / 2, yPos + 18, { align: 'center' });
        });

        yPos += cardHeight + 10;

        // ============================================
        // TRIAL BALANCE TABLE
        // ============================================
        if (items.length === 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(148, 163, 184);
            doc.text('No accounts found for this period.', pageWidth / 2, yPos + 20, {
                align: 'center',
            });
        } else {
            // ✅ FIX: Build table data with correct property access
            const tableData = items.map((item: any) => {
                // Handle both possible property naming conventions
                const code = item.code || item.accountCode || '';
                const name = item.name || item.accountName || '';
                const accountType = item.accountType || item.type || '';
                const openingBalance = item.openingBalance || 0;
                const debitTransactions = item.debitTransactions || item.debit || 0;
                const creditTransactions = item.creditTransactions || item.credit || 0;
                const closingBalance = item.closingBalance || item.balance || 0;
                const balanceType = item.balanceType || (closingBalance > 0 ? 'Debit' : closingBalance < 0 ? 'Credit' : 'Zero');

                return [
                    code,
                    name,
                    accountType,
                    openingBalance,
                    debitTransactions,
                    creditTransactions,
                    closingBalance,
                    balanceType,
                ];
            });

            // Add total row
            tableData.push([
                { content: 'TOTAL', styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
                { content: '', styles: { fontStyle: 'bold' } },
                { content: '', styles: { fontStyle: 'bold' } },
                { content: totalOpeningDebit, styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
                { content: totalDebitTransactions, styles: { fontStyle: 'bold', textColor: [37, 99, 235] } },
                { content: totalCreditTransactions, styles: { fontStyle: 'bold', textColor: [220, 38, 38] } },
                { content: totalClosingDebit, styles: { fontStyle: 'bold', textColor: isBalanced ? [22, 163, 74] : [220, 38, 38] } },
                { content: isBalanced ? 'Balanced' : 'Unbalanced', styles: { fontStyle: 'bold', textColor: isBalanced ? [22, 163, 74] : [220, 38, 38] } },
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Code', 'Account Name', 'Type', 'Opening Balance', 'Debit', 'Credit', 'Closing Balance', 'Balance Type']],
                body: tableData,
                margin: { left: margin, right: margin },
                styles: {
                    fontSize: 7.5,
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
                    0: { cellWidth: 18, halign: 'left' },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 22, halign: 'left' },
                    3: { cellWidth: 28, halign: 'right' },
                    4: { cellWidth: 28, halign: 'right' },
                    5: { cellWidth: 28, halign: 'right' },
                    6: { cellWidth: 28, halign: 'right' },
                    7: { cellWidth: 22, halign: 'center' },
                },
                didParseCell: (data) => {
                    // Color code balance type
                    if (data.section === 'body' && data.column.index === 7) {
                        const type = data.cell.raw as string;
                        if (type === 'Debit' || type === 'debit') {
                            data.cell.styles.textColor = [30, 64, 175];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (type === 'Credit' || type === 'credit') {
                            data.cell.styles.textColor = [153, 27, 27];
                            data.cell.styles.fontStyle = 'bold';
                        } else {
                            data.cell.styles.textColor = [107, 114, 128];
                        }
                    }
                    // Color code debit column
                    if (data.section === 'body' && data.column.index === 4) {
                        const value = data.cell.raw as number;
                        if (value > 0) {
                            data.cell.styles.textColor = [37, 99, 235];
                        }
                    }
                    // Color code credit column
                    if (data.section === 'body' && data.column.index === 5) {
                        const value = data.cell.raw as number;
                        if (value > 0) {
                            data.cell.styles.textColor = [220, 38, 38];
                        }
                    }
                    // Total row styling
                    if (data.section === 'body' && data.row.index === tableData.length - 1) {
                        data.cell.styles.fillColor = [248, 250, 252];
                    }
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
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
            doc.line(margin, pageHeight_ - 14, pageWidth - margin, pageHeight_ - 14);

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(148, 163, 184);

            doc.text(companyName, margin, pageHeight_ - 7);
            doc.text(`Generated: ${dateStr}`, pageWidth / 2, pageHeight_ - 7, { align: 'center' });
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight_ - 7, { align: 'right' });
        }

        return doc;
    }

    // ============================================================
    // ✅ GENERATE HTML (for print preview)
    // ============================================================
    static generateHTML(data: any, companyName: string = 'RST ERP'): string {
        const items = data?.items || [];
        const asOfDate = data?.asOfDate || data?.endDate || new Date().toISOString().split('T')[0];
        const isBalanced = data?.isBalanced !== undefined ? data.isBalanced : true;
        const totalOpeningDebit = data?.totalOpeningDebit || 0;
        const totalDebitTransactions = data?.totalDebitTransactions || 0;
        const totalCreditTransactions = data?.totalCreditTransactions || 0;
        const totalClosingDebit = data?.totalClosingDebit || 0;
        const totalClosingCredit = data?.totalClosingCredit || 0;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Trial Balance</title>
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
                .report-header .status {
                    display: inline-block;
                    margin-top: 10px;
                    padding: 6px 20px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: ${isBalanced ? '#d4edda' : '#f8d7da'};
                    color: ${isBalanced ? '#155724' : '#721c24'};
                    border: 1px solid ${isBalanced ? '#86efac' : '#fca5a5'};
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
                table td:last-child {
                    text-align: center;
                }
                table td:nth-child(4),
                table td:nth-child(5),
                table td:nth-child(6),
                table td:nth-child(7) {
                    text-align: right;
                }
                table tfoot td {
                    font-weight: 700;
                    padding: 10px 12px;
                    border-top: 2px solid #1a1a2e;
                    background: #f8fafc;
                }
                table tfoot td:nth-child(4),
                table tfoot td:nth-child(5),
                table tfoot td:nth-child(6),
                table tfoot td:nth-child(7) {
                    text-align: right;
                }
                .balance-type {
                    display: inline-block;
                    padding: 2px 12px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 600;
                }
                .balance-type.debit { background: #dbeafe; color: #1e40af; }
                .balance-type.credit { background: #fee2e2; color: #991b1b; }
                .balance-type.zero { background: #f3f4f6; color: #6b7280; }
                .balance-type.balanced { background: #d4edda; color: #155724; }
                .balance-type.unbalanced { background: #f8d7da; color: #721c24; }
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
                    .status {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .balance-type {
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
                    <h1>TRIAL BALANCE</h1>
                    <div class="period">As of ${formatDate(asOfDate)}</div>
                    <div class="status">${isBalanced ? '✓ Balanced' : '✗ Out of Balance'}</div>
                </div>
                <div class="summary-cards">
                    <div class="summary-card blue">
                        <div class="label">Total Accounts</div>
                        <div class="value">${items.length}</div>
                    </div>
                    <div class="summary-card green">
                        <div class="label">Total Debits</div>
                        <div class="value">${formatCurrency(totalClosingDebit)}</div>
                    </div>
                    <div class="summary-card red">
                        <div class="label">Total Credits</div>
                        <div class="value">${formatCurrency(totalClosingCredit)}</div>
                    </div>
                    <div class="summary-card ${isBalanced ? 'green' : 'red'}">
                        <div class="label">Status</div>
                        <div class="value">${isBalanced ? 'Balanced ✓' : 'Unbalanced ✗'}</div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Account Name</th>
                            <th>Type</th>
                            <th>Opening Balance</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Closing Balance</th>
                            <th>Balance Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item: any) => {
            const code = item.code || item.accountCode || '';
            const name = item.name || item.accountName || '';
            const accountType = item.accountType || item.type || '';
            const openingBalance = item.openingBalance || 0;
            const debitTransactions = item.debitTransactions || item.debit || 0;
            const creditTransactions = item.creditTransactions || item.credit || 0;
            const closingBalance = item.closingBalance || item.balance || 0;
            const balanceType = item.balanceType || (closingBalance > 0 ? 'Debit' : closingBalance < 0 ? 'Credit' : 'Zero');
            const balanceTypeClass = balanceType.toLowerCase();
            return `
                            <tr>
                                <td><strong>${code}</strong></td>
                                <td>${name}</td>
                                <td>${accountType}</td>
                                <td>${openingBalance !== 0 ? formatCurrency(openingBalance) : '-'}</td>
                                <td style="color: #2563eb;">${debitTransactions > 0 ? formatCurrency(debitTransactions) : '-'}</td>
                                <td style="color: #dc2626;">${creditTransactions > 0 ? formatCurrency(creditTransactions) : '-'}</td>
                                <td style="font-weight: 600;">${closingBalance > 0 ? formatCurrency(closingBalance) : '-'}</td>
                                <td><span class="balance-type ${balanceTypeClass}">${balanceType}</span></td>
                            </tr>
                            `;
        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>TOTAL</strong></td>
                            <td><strong>${formatCurrency(totalOpeningDebit)}</strong></td>
                            <td style="color: #2563eb;"><strong>${formatCurrency(totalDebitTransactions)}</strong></td>
                            <td style="color: #dc2626;"><strong>${formatCurrency(totalCreditTransactions)}</strong></td>
                            <td style="color: ${isBalanced ? '#16a34a' : '#dc2626'};"><strong>${formatCurrency(totalClosingDebit)}</strong></td>
                            <td><span class="balance-type ${isBalanced ? 'balanced' : 'unbalanced'}">${isBalanced ? 'Balanced' : 'Unbalanced'}</span></td>
                        </tr>
                    </tfoot>
                </table>
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
export { TrialBalanceReport as default };