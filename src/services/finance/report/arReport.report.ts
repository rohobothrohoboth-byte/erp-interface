// src/services/finance/report/arReport.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ARReportData {
    period: string;
    periodName?: string;
    periodId?: string;
    totalReceivables: number;
    currentReceivables: number;
    overdueReceivables: number;
    collectionRate: number;
    avgDaysOutstanding: number;
    totalCollected: number;
    totalPayments: number;
    averagePayment: number;
    customerCount: number;
    invoiceCount: number;
    aging: {
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
    topCustomers: Array<{
        name: string;
        amount: number;
        invoiceCount: number;
        percentage: number;
        periodName?: string;
    }>;
    topPayingCustomers: Array<{
        name: string;
        amount: number;
        paymentCount: number;
        percentage: number;
        periodName?: string;
    }>;
    monthlyTrend: Array<{
        month: string;
        amount: number;
        collected: number;
        balance: number;
    }>;
    statusBreakdown: {
        draft: number;
        posted: number;
        paid: number;
        partiallyPaid: number;
        overdue: number;
    };
    periodBreakdown?: Array<{
        periodId: string;
        periodName: string;
        totalAmount: number;
        collectedAmount: number;
        balanceAmount: number;
        invoiceCount: number;
    }>;
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

export class ARReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY
    // ============================================================
    static generatePDF(data: ARReportData, companyName: string = 'RST ERP System'): jsPDF {
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
        doc.text('ACCOUNTS RECEIVABLE REPORT', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const periodDisplay = data.periodName || data.period || 'N/A';
        doc.text(`Period: ${periodDisplay}`, pageWidth / 2, yPos, { align: 'center' });
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
            { label: 'Total Receivables', amount: data.totalReceivables, color: '#2563eb' },
            { label: 'Total Collected', amount: data.totalCollected, color: '#16a34a' },
            { label: 'Overdue', amount: data.overdueReceivables, color: '#dc2626' },
            { label: 'Collection Rate', amount: data.collectionRate, color: '#7c3aed', isPercentage: true },
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
            const displayValue = card.isPercentage
                ? (card.amount as number).toFixed(1) + '%'
                : formatCurrency(card.amount as number);
            doc.text(displayValue, x + cardWidth / 2, yPos + 20, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // ============================================
        // AGING BREAKDOWN
        // ============================================
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Aging Breakdown', margin, yPos);
        yPos += 6;

        const agingData = [
            ['0-30 Days', formatCurrency(data.aging['0-30'] || 0)],
            ['31-60 Days', formatCurrency(data.aging['31-60'] || 0)],
            ['61-90 Days', formatCurrency(data.aging['61-90'] || 0)],
            ['90+ Days', formatCurrency(data.aging['90+'] || 0)],
            ['Total', formatCurrency(data.totalReceivables)],
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Aging Period', 'Amount']],
            body: agingData,
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
        });

        yPos = (doc as any).lastAutoTable?.finalY || yPos + 30;
        yPos += 8;

        // ============================================
        // STATUS BREAKDOWN
        // ============================================
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Status Breakdown', margin, yPos);
        yPos += 6;

        const statusData = [
            ['Draft', data.statusBreakdown.draft.toString()],
            ['Posted', data.statusBreakdown.posted.toString()],
            ['Partially Paid', data.statusBreakdown.partiallyPaid.toString()],
            ['Overdue', data.statusBreakdown.overdue.toString()],
            ['Paid', data.statusBreakdown.paid.toString()],
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Status', 'Count']],
            body: statusData,
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
                1: { cellWidth: 40, halign: 'right' },
            },
        });

        yPos = (doc as any).lastAutoTable?.finalY || yPos + 30;
        yPos += 8;

        // ============================================
        // TOP CUSTOMERS
        // ============================================
        if (data.topCustomers && data.topCustomers.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Top Customers by Receivables', margin, yPos);
            yPos += 6;

            const topCustomerData = data.topCustomers.map(item => [
                item.name,
                item.invoiceCount.toString(),
                formatCurrency(item.amount),
                item.percentage.toFixed(1) + '%',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Customer', 'Invoices', 'Amount', 'Percentage']],
                body: topCustomerData,
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
                    2: { cellWidth: 40, halign: 'right' },
                    3: { cellWidth: 25, halign: 'right' },
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;
        }

        // ============================================
        // PERIOD BREAKDOWN
        // ============================================
        if (data.periodBreakdown && data.periodBreakdown.length > 1) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Period Breakdown', margin, yPos);
            yPos += 6;

            const periodData = data.periodBreakdown.map(item => [
                item.periodName,
                item.invoiceCount.toString(),
                formatCurrency(item.totalAmount),
                formatCurrency(item.collectedAmount),
                formatCurrency(item.balanceAmount),
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Period', 'Invoices', 'Total', 'Collected', 'Balance']],
                body: periodData,
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
                    2: { cellWidth: 35, halign: 'right' },
                    3: { cellWidth: 35, halign: 'right' },
                    4: { cellWidth: 35, halign: 'right' },
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
    // ✅ GENERATE HTML (for print preview)
    // ============================================================
    static generateHTML(data: ARReportData, companyName: string = 'RST ERP'): string {
        const periodDisplay = data.periodName || data.period || 'N/A';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accounts Receivable Report</title>
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
        .summary-card.blue .value { color: #2563eb; }
        .summary-card.green .value { color: #16a34a; }
        .summary-card.red .value { color: #dc2626; }
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
        .footer {
            margin-top: 24px;
            padding-top: 14px;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
        }
        @media print {
            body { padding: 0; }
            .report-container { border: none; border-radius: 0; box-shadow: none; padding: 30px 40px; max-width: 100%; }
            .summary-card { background: #f8fafc !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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
            <h1>ACCOUNTS RECEIVABLE REPORT</h1>
            <div class="period">Period: ${periodDisplay}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card blue">
                <div class="label">Total Receivables</div>
                <div class="value">${formatCurrency(data.totalReceivables)}</div>
            </div>
            <div class="summary-card green">
                <div class="label">Total Collected</div>
                <div class="value">${formatCurrency(data.totalCollected)}</div>
            </div>
            <div class="summary-card red">
                <div class="label">Overdue</div>
                <div class="value">${formatCurrency(data.overdueReceivables)}</div>
            </div>
            <div class="summary-card purple">
                <div class="label">Collection Rate</div>
                <div class="value">${data.collectionRate.toFixed(1)}%</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Aging Breakdown</div>
            <table>
                <thead><tr><th>Aging Period</th><th class="text-right">Amount</th></tr></thead>
                <tbody>
                    <tr><td>0-30 Days</td><td class="text-right">${formatCurrency(data.aging['0-30'] || 0)}</td></tr>
                    <tr><td>31-60 Days</td><td class="text-right">${formatCurrency(data.aging['31-60'] || 0)}</td></tr>
                    <tr><td>61-90 Days</td><td class="text-right">${formatCurrency(data.aging['61-90'] || 0)}</td></tr>
                    <tr><td>90+ Days</td><td class="text-right">${formatCurrency(data.aging['90+'] || 0)}</td></tr>
                    <tr style="font-weight:700;border-top:2px solid #1a1a2e;"><td>Total</td><td class="text-right">${formatCurrency(data.totalReceivables)}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Status Breakdown</div>
            <table>
                <thead><tr><th>Status</th><th class="text-right">Count</th></tr></thead>
                <tbody>
                    <tr><td>Draft</td><td class="text-right">${data.statusBreakdown.draft}</td></tr>
                    <tr><td>Posted</td><td class="text-right">${data.statusBreakdown.posted}</td></tr>
                    <tr><td>Partially Paid</td><td class="text-right">${data.statusBreakdown.partiallyPaid}</td></tr>
                    <tr><td>Overdue</td><td class="text-right">${data.statusBreakdown.overdue}</td></tr>
                    <tr><td>Paid</td><td class="text-right">${data.statusBreakdown.paid}</td></tr>
                </tbody>
            </table>
        </div>

        ${data.topCustomers && data.topCustomers.length > 0 ? `
        <div class="section">
            <div class="section-title">Top Customers by Receivables</div>
            <table>
                <thead><tr><th>Customer</th><th class="text-center">Invoices</th><th class="text-right">Amount</th><th class="text-right">%</th></tr></thead>
                <tbody>
                    ${data.topCustomers.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td class="text-center">${item.invoiceCount}</td>
                            <td class="text-right">${formatCurrency(item.amount)}</td>
                            <td class="text-right">${item.percentage.toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${data.periodBreakdown && data.periodBreakdown.length > 1 ? `
        <div class="section">
            <div class="section-title">Period Breakdown</div>
            <table>
                <thead><tr><th>Period</th><th class="text-center">Invoices</th><th class="text-right">Total</th><th class="text-right">Collected</th><th class="text-right">Balance</th></tr></thead>
                <tbody>
                    ${data.periodBreakdown.map(item => `
                        <tr>
                            <td>${item.periodName}</td>
                            <td class="text-center">${item.invoiceCount}</td>
                            <td class="text-right">${formatCurrency(item.totalAmount)}</td>
                            <td class="text-right">${formatCurrency(item.collectedAmount)}</td>
                            <td class="text-right">${formatCurrency(item.balanceAmount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="footer">
            Generated on ${new Date().toLocaleString()} • RST ERP System
        </div>
    </div>
</body>
</html>`;
    }
}

export { ARReport as default };