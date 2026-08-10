// src/services/finance/report/taxReport.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================
// ✅ INTERFACE
// ============================================================
export interface TaxReportData {
    period: string;
    periodStart: string;
    periodEnd: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    vatOnSales: number;
    vatOnPurchases: number;
    vatOnImports: number;
    vatOnExports: number;
    netVat: number;
    withholdingTax: number;
    totalTaxLiability: number;
    transactions: number;
    vatRate: number;
    filingStatus: 'Pending' | 'Filed' | 'Overdue' | 'Refunded';
    breakdown: {
        sales: number;
        purchases: number;
        imports: number;
        exports: number;
        withholdingTax: number;
        adjustments: number;
    };
    previousPeriod?: {
        period: string;
        netVat: number;
        withholdingTax: number;
        totalTax: number;
        change: number;
        changePercentage: number;
    };
    rateDistribution: {
        rate: number;
        amount: number;
        count: number;
    }[];
    accountSummary: {
        accountType: string;
        count: number;
        taxableAmount: number;
        taxAmount: number;
    }[];
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

// ============================================================
// ✅ HTML RENDER HELPERS
// ============================================================

function getStatusBadge(status: string): string {
    const colors: Record<string, { bg: string; text: string }> = {
        Filed: { bg: '#dcfce7', text: '#166534' },
        Pending: { bg: '#fef3c7', text: '#92400e' },
        Overdue: { bg: '#fee2e2', text: '#991b1b' },
        Refunded: { bg: '#f3e8ff', text: '#6b21a8' },
    };
    const color = colors[status] || { bg: '#f3f4f6', text: '#374151' };
    return `<span style="background:${color.bg};color:${color.text};padding:2px 10px;border-radius:12px;font-size:10px;font-weight:600;">${status}</span>`;
}

// ============================================================
// ✅ MAIN CLASS
// ============================================================

export class TaxReportReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY (NO HTML)
    // ============================================================
    static generatePDF(data: TaxReportData, companyName: string = 'RST ERP System'): jsPDF {
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

        const isPayable = data.netVat >= 0;

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
        doc.text('TAX REPORT', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(
            `For the period ${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)}`,
            pageWidth / 2,
            yPos,
            { align: 'center' }
        );
        yPos += 6;

        // Status badge
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const statusColors = {
            Filed: [22, 101, 52],
            Pending: [146, 64, 14],
            Overdue: [153, 27, 27],
            Refunded: [107, 33, 168],
        };
        const color = statusColors[data.filingStatus] || [55, 65, 81];
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(
            `${data.filingStatus.toUpperCase()}`,
            pageWidth / 2,
            yPos,
            { align: 'center' }
        );
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
            { label: 'VAT on Sales', amount: data.vatOnSales, color: '#2563eb' },
            { label: 'VAT on Purchases', amount: data.vatOnPurchases, color: '#ea580c' },
            { label: 'Net VAT', amount: data.netVat, color: isPayable ? '#dc2626' : '#16a34a' },
            { label: 'Total Tax Liability', amount: data.totalTaxLiability, color: '#7c3aed' },
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
            doc.text(formatCurrency(card.amount), x + cardWidth / 2, yPos + 20, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // ============================================
        // TAX BREAKDOWN TABLE
        // ============================================
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Tax Breakdown', margin, yPos);
        yPos += 6;

        const breakdownData = [
            ['Sales', formatCurrency(data.breakdown.sales)],
            ['Purchases', formatCurrency(data.breakdown.purchases)],
            ['Imports', formatCurrency(data.breakdown.imports)],
            ['Exports', formatCurrency(data.breakdown.exports)],
            ['Withholding Tax', formatCurrency(data.breakdown.withholdingTax)],
            ['Adjustments', formatCurrency(data.breakdown.adjustments)],
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Category', 'Amount']],
            body: breakdownData,
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
        // RATE DISTRIBUTION
        // ============================================
        if (data.rateDistribution.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('VAT Rate Distribution', margin, yPos);
            yPos += 6;

            const rateData = data.rateDistribution.map(item => [
                `${item.rate}%`,
                formatCurrency(item.amount),
                item.count.toString(),
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Rate', 'Amount', 'Transactions']],
                body: rateData,
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
                    0: { cellWidth: 30, halign: 'center' },
                    1: { cellWidth: 50, halign: 'right' },
                    2: { cellWidth: 30, halign: 'center' },
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;
        }

        // ============================================
        // ACCOUNT SUMMARY
        // ============================================
        if (data.accountSummary.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Account Summary', margin, yPos);
            yPos += 6;

            const accountData = data.accountSummary.map(item => [
                item.accountType,
                item.count.toString(),
                formatCurrency(item.taxableAmount),
                formatCurrency(item.taxAmount),
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Account Type', 'Count', 'Taxable Amount', 'Tax Amount']],
                body: accountData,
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
                    3: { cellWidth: 40, halign: 'right' },
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;
        }

        // ============================================
        // PREVIOUS PERIOD COMPARISON
        // ============================================
        if (data.previousPeriod) {
            const prev = data.previousPeriod;
            const changeColor = prev.change >= 0 ? [220, 38, 38] : [22, 163, 74];

            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFillColor(238, 242, 255);
            doc.setDrawColor(99, 102, 241);
            doc.setLineWidth(0.5);
            doc.roundedRect(margin, yPos, pageWidth - margin * 2, 30, 2, 2, 'FD');

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(79, 70, 229);
            doc.text('Comparison with Previous Period', margin + 6, yPos + 6);
            yPos += 2;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            doc.text(`Previous Period: ${prev.period}`, margin + 6, yPos + 14);
            doc.text(`Previous Total Tax: ${formatCurrency(prev.totalTax)}`, margin + 6, yPos + 22);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
            doc.text(
                `Change: ${formatCurrency(prev.change)} (${prev.changePercentage.toFixed(1)}%)`,
                pageWidth - margin - 6,
                yPos + 18,
                { align: 'right' }
            );

            yPos += 34;
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
    static generateHTML(data: TaxReportData, companyName: string = 'RST ERP'): string {
        const isPayable = data.netVat >= 0;

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Report</title>
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
        .report-header .status {
            display: inline-block;
            margin-top: 8px;
            padding: 4px 18px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: ${data.filingStatus === 'Filed' ? '#dcfce7' : data.filingStatus === 'Pending' ? '#fef3c7' : data.filingStatus === 'Overdue' ? '#fee2e2' : '#f3e8ff'};
            color: ${data.filingStatus === 'Filed' ? '#166534' : data.filingStatus === 'Pending' ? '#92400e' : data.filingStatus === 'Overdue' ? '#991b1b' : '#6b21a8'};
            border: 1px solid ${data.filingStatus === 'Filed' ? '#86efac' : data.filingStatus === 'Pending' ? '#fcd34d' : data.filingStatus === 'Overdue' ? '#fca5a5' : '#d8b4fe'};
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
        .summary-card.orange .value { color: #ea580c; }
        .summary-card.red .value { color: #dc2626; }
        .summary-card.green .value { color: #16a34a; }
        .summary-card.purple .value { color: #7c3aed; }

        .section {
            margin-bottom: 20px;
        }
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
        table tbody tr:hover {
            background: #f8fafc;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: 700; }
        .text-blue { color: #2563eb; }
        .text-red { color: #dc2626; }
        .text-green { color: #16a34a; }
        .text-purple { color: #7c3aed; }
        
        .comparison-box {
            margin-top: 16px;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #818cf8;
            background: #eef2ff;
        }
        .comparison-box .title {
            font-weight: 700;
            color: #4f46e5;
            font-size: 12px;
            margin-bottom: 4px;
        }
        .comparison-box .row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            padding: 2px 0;
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
            .report-container { border: none; border-radius: 0; box-shadow: none; padding: 30px 40px; max-width: 100%; }
            .summary-card { background: #f8fafc !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .status { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .comparison-box { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            table thead th { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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
            <h1>TAX REPORT</h1>
            <div class="period">For the period ${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)}</div>
            <div class="status">${data.filingStatus.toUpperCase()}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card blue">
                <div class="label">VAT on Sales</div>
                <div class="value">${formatCurrency(data.vatOnSales)}</div>
            </div>
            <div class="summary-card orange">
                <div class="label">VAT on Purchases</div>
                <div class="value">${formatCurrency(data.vatOnPurchases)}</div>
            </div>
            <div class="summary-card ${isPayable ? 'red' : 'green'}">
                <div class="label">Net VAT ${isPayable ? 'Payable' : 'Refundable'}</div>
                <div class="value">${formatCurrency(Math.abs(data.netVat))}</div>
            </div>
            <div class="summary-card purple">
                <div class="label">Total Tax Liability</div>
                <div class="value">${formatCurrency(data.totalTaxLiability)}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Tax Breakdown</div>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Sales</td><td class="text-right text-blue">${formatCurrency(data.breakdown.sales)}</td></tr>
                    <tr><td>Purchases</td><td class="text-right text-orange">${formatCurrency(data.breakdown.purchases)}</td></tr>
                    <tr><td>Imports</td><td class="text-right text-purple">${formatCurrency(data.breakdown.imports)}</td></tr>
                    <tr><td>Exports</td><td class="text-right text-green">${formatCurrency(data.breakdown.exports)}</td></tr>
                    <tr><td>Withholding Tax</td><td class="text-right text-purple">${formatCurrency(data.breakdown.withholdingTax)}</td></tr>
                    ${data.breakdown.adjustments !== 0 ? `<tr><td>Adjustments</td><td class="text-right ${data.breakdown.adjustments >= 0 ? 'text-green' : 'text-red'}">${formatCurrency(data.breakdown.adjustments)}</td></tr>` : ''}
                </tbody>
            </table>
        </div>

        ${data.rateDistribution.length > 0 ? `
        <div class="section">
            <div class="section-title">VAT Rate Distribution</div>
            <table>
                <thead>
                    <tr>
                        <th>Rate</th>
                        <th class="text-right">Amount</th>
                        <th class="text-center">Transactions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.rateDistribution.map(item => `
                        <tr>
                            <td>${item.rate}%</td>
                            <td class="text-right text-purple">${formatCurrency(item.amount)}</td>
                            <td class="text-center">${item.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${data.accountSummary.length > 0 ? `
        <div class="section">
            <div class="section-title">Account Summary</div>
            <table>
                <thead>
                    <tr>
                        <th>Account Type</th>
                        <th class="text-center">Count</th>
                        <th class="text-right">Taxable Amount</th>
                        <th class="text-right">Tax Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.accountSummary.map(item => `
                        <tr>
                            <td>${item.accountType}</td>
                            <td class="text-center">${item.count}</td>
                            <td class="text-right">${formatCurrency(item.taxableAmount)}</td>
                            <td class="text-right text-purple">${formatCurrency(item.taxAmount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${data.previousPeriod ? `
        <div class="comparison-box">
            <div class="title">Comparison with Previous Period</div>
            <div class="row">
                <span>Previous Period: <strong>${data.previousPeriod.period}</strong></span>
                <span>Previous Total Tax: ${formatCurrency(data.previousPeriod.totalTax)}</span>
            </div>
            <div class="row">
                <span></span>
                <span style="color: ${data.previousPeriod.change >= 0 ? '#dc2626' : '#16a34a'}; font-weight: 700;">
                    Change: ${formatCurrency(data.previousPeriod.change)} (${data.previousPeriod.changePercentage.toFixed(1)}%)
                </span>
            </div>
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

// ✅ Export for compatibility
export { TaxReportReport as default };