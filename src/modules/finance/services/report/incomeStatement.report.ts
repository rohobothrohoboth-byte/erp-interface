// src/services/finance/report/incomeStatement.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface IncomeStatementData {
    companyName?: string;
    startDate: string;
    endDate: string;
    revenue: {
        items: Array<{ code: string; name: string; amount: number; percentage: number }>;
        total: number;
    };
    costOfGoodsSold: {
        items: Array<{ code: string; name: string; amount: number; percentage: number }>;
        total: number;
    };
    grossProfit: number;
    grossMargin: number;
    operatingExpenses: {
        items: Array<{ code: string; name: string; amount: number; percentage: number }>;
        total: number;
    };
    operatingIncome: number;
    operatingMargin: number;
    otherIncome: {
        items: Array<{ code: string; name: string; amount: number }>;
        total: number;
    };
    otherExpenses: {
        items: Array<{ code: string; name: string; amount: number }>;
        total: number;
    };
    netIncome: number;
    netMargin: number;
    ebitda: number;
    ebitdaMargin: number;
    isProfitable: boolean;
    generatedDate?: string;
}

export class IncomeStatementReport {
    /**
     * ✅ Generate PDF directly using jsPDF (NO HTML)
     */
    static generatePDF(data: IncomeStatementData, companyName: string = 'RST ERP System'): jsPDF {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        const pageWidth = doc.internal.pageSize.getWidth();
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
        doc.text('INCOME STATEMENT', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(
            `For the period ${data.startDate} – ${data.endDate}`,
            pageWidth / 2,
            yPos,
            { align: 'center' }
        );
        yPos += 6;

        // Status badge
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(data.isProfitable ? 22 : 155, data.isProfitable ? 101 : 27, data.isProfitable ? 52 : 27);
        doc.text(
            data.isProfitable ? '✓ PROFITABLE' : '⚠ NET LOSS',
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
            { label: 'Revenue', amount: data.revenue.total, margin: '100.0%' },
            { label: 'Gross Profit', amount: data.grossProfit, margin: `${data.grossMargin.toFixed(1)}%` },
            { label: 'Operating Income', amount: data.operatingIncome, margin: `${data.operatingMargin.toFixed(1)}%` },
            { label: 'Net Income', amount: data.netIncome, margin: `${data.netMargin.toFixed(1)}%` },
        ];

        cards.forEach((card, index) => {
            const x = margin + index * (cardWidth + 4);
            const isHighlight = index >= 2;

            // Card background
            doc.setFillColor(isHighlight ? 239 : 248, isHighlight ? 246 : 250, isHighlight ? 255 : 252);
            doc.setDrawColor(229, 231, 235);
            doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, 'FD');

            // Label
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text(card.label, x + cardWidth / 2, yPos + 8, { align: 'center' });

            // Amount
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(isHighlight ? 29 : 15, isHighlight ? 78 : 23, isHighlight ? 216 : 42);
            doc.text(this.formatCurrency(card.amount), x + cardWidth / 2, yPos + 18, { align: 'center' });

            // Margin
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(37, 99, 235);
            doc.text(`Margin: ${card.margin}`, x + cardWidth / 2, yPos + 26, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // ============================================
        // REVENUE SECTION
        // ============================================
        yPos = this.renderSection(
            doc,
            'REVENUE',
            data.revenue.items,
            data.revenue.total,
            100,
            margin,
            yPos,
            pageWidth
        );

        // ============================================
        // COST OF GOODS SOLD
        // ============================================
        const cogsPercentage = data.revenue.total > 0 ? (data.costOfGoodsSold.total / data.revenue.total) * 100 : 0;
        yPos = this.renderSection(
            doc,
            'COST OF GOODS SOLD',
            data.costOfGoodsSold.items,
            data.costOfGoodsSold.total,
            cogsPercentage,
            margin,
            yPos,
            pageWidth
        );

        // ============================================
        // GROSS PROFIT
        // ============================================
        yPos = this.renderSummaryLine(
            doc,
            'Gross Profit',
            data.grossProfit,
            data.grossMargin,
            'margin',
            margin,
            yPos,
            pageWidth,
            '#dcfce7',
            '#166534'
        );

        // ============================================
        // OPERATING EXPENSES
        // ============================================
        const opExpPercentage = data.revenue.total > 0 ? (data.operatingExpenses.total / data.revenue.total) * 100 : 0;
        yPos = this.renderSection(
            doc,
            'OPERATING EXPENSES',
            data.operatingExpenses.items,
            data.operatingExpenses.total,
            opExpPercentage,
            margin,
            yPos,
            pageWidth
        );

        // ============================================
        // OPERATING INCOME
        // ============================================
        yPos = this.renderSummaryLine(
            doc,
            'Operating Income (EBIT)',
            data.operatingIncome,
            data.operatingMargin,
            'margin',
            margin,
            yPos,
            pageWidth,
            '#eff6ff',
            '#1d4ed8'
        );

        // ============================================
        // OTHER INCOME
        // ============================================
        if (data.otherIncome.items.length > 0) {
            const otherIncomePercentage = data.revenue.total > 0 ? (data.otherIncome.total / data.revenue.total) * 100 : 0;
            yPos = this.renderSection(
                doc,
                'OTHER INCOME',
                data.otherIncome.items,
                data.otherIncome.total,
                otherIncomePercentage,
                margin,
                yPos,
                pageWidth
            );
        }

        // ============================================
        // OTHER EXPENSES
        // ============================================
        if (data.otherExpenses.items.length > 0) {
            const otherExpPercentage = data.revenue.total > 0 ? (data.otherExpenses.total / data.revenue.total) * 100 : 0;
            yPos = this.renderSection(
                doc,
                'OTHER EXPENSES',
                data.otherExpenses.items,
                data.otherExpenses.total,
                otherExpPercentage,
                margin,
                yPos,
                pageWidth
            );
        }

        // ============================================
        // NET INCOME (Highlighted)
        // ============================================
        yPos = this.renderSummaryLine(
            doc,
            'NET INCOME',
            data.netIncome,
            data.netMargin,
            'margin',
            margin,
            yPos,
            pageWidth,
            data.netIncome >= 0 ? '#d1fae5' : '#fee2e2',
            data.netIncome >= 0 ? '#065f46' : '#991b1b',
            true
        );

        // ============================================
        // EBITDA
        // ============================================
        if (data.ebitda > 0) {
            yPos = this.renderSummaryLine(
                doc,
                'EBITDA',
                data.ebitda,
                data.ebitdaMargin,
                'margin',
                margin,
                yPos,
                pageWidth,
                '#e0e7ff',
                '#4338ca'
            );
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
            const pageHeight = doc.internal.pageSize.getHeight();

            doc.setDrawColor(203, 213, 225);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(148, 163, 184);

            doc.text(companyName, margin, pageHeight - 8);
            doc.text(`Generated: ${dateStr}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
        }

        return doc;
    }

    // ============================================================
    // HELPER: Render Section with Table
    // ============================================================
    private static renderSection(
        doc: jsPDF,
        title: string,
        items: any[],
        total: number,
        percentage: number,
        margin: number,
        yPos: number,
        pageWidth: number
    ): number {
        const pageHeight = doc.internal.pageSize.getHeight();

        // Check if we need a new page
        if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = 20;
        }

        // Section header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin, yPos);
        yPos += 2;

        // Subtitle with total
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Total: ${this.formatCurrency(total)} (${percentage.toFixed(1)}%)`, pageWidth - margin, yPos - 2, {
            align: 'right',
        });
        yPos += 4;

        // Divider
        doc.setDrawColor(203, 213, 225);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;

        if (items.length === 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(148, 163, 184);
            doc.text('No transactions found', margin, yPos);
            yPos += 8;
            return yPos;
        }

        // Table data - limit items if too many
        const displayItems = items.slice(0, 20);
        const tableData = displayItems.map(item => [
            `${item.code || ''} ${item.name || ''}`,
            this.formatCurrency(item.amount),
            `${item.percentage.toFixed(1)}%`,
        ]);

        // Add total row
        tableData.push([
            { content: 'Total', styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
            { content: this.formatCurrency(total), styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
            { content: `${percentage.toFixed(1)}%`, styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Account', 'Amount', '% of Revenue']],
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
                1: { cellWidth: 40, halign: 'right' },
                2: { cellWidth: 30, halign: 'right' },
            },
        });

        // Get the final y position from autoTable
        const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;

        return finalY + 6;
    }

    // ============================================================
    // HELPER: Render Summary Line
    // ============================================================
    private static renderSummaryLine(
        doc: jsPDF,
        label: string,
        amount: number,
        marginValue: number,
        marginLabel: string,
        margin: number,
        yPos: number,
        pageWidth: number,
        bgColor: string = '#f8fafc',
        textColor: string = '#1a1a2e',
        isLarge: boolean = false
    ): number {
        const pageHeight = doc.internal.pageSize.getHeight();

        if (yPos > pageHeight - 25) {
            doc.addPage();
            yPos = 20;
        }

        const lineHeight = isLarge ? 14 : 10;
        const padding = 3;

        // Background rectangle
        const bgColorRGB = this.hexToRgb(bgColor);
        doc.setFillColor(bgColorRGB.r, bgColorRGB.g, bgColorRGB.b);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, lineHeight + padding * 2, 2, 2, 'FD');

        const textColorRGB = this.hexToRgb(textColor);
        doc.setTextColor(textColorRGB.r, textColorRGB.g, textColorRGB.b);

        // Label
        doc.setFontSize(isLarge ? 12 : 10);
        doc.setFont('helvetica', isLarge ? 'bold' : 'normal');
        doc.text(label, margin + 4, yPos + padding + (isLarge ? 8 : 6));

        // Amount
        doc.setFontSize(isLarge ? 14 : 11);
        doc.setFont('helvetica', 'bold');
        doc.text(
            this.formatCurrency(amount),
            pageWidth - margin - 4,
            yPos + padding + (isLarge ? 8 : 6),
            { align: 'right' }
        );

        // Margin
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(
            `${marginLabel}: ${marginValue.toFixed(1)}%`,
            pageWidth - margin - 4,
            yPos + padding + (isLarge ? 8 : 6) + 4,
            { align: 'right' }
        );

        return yPos + lineHeight + padding * 2 + 4;
    }

    // ============================================================
    // HELPER: Format Currency
    // ============================================================
    private static formatCurrency(amount: number): string {
        if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
        const sign = amount < 0 ? '-' : '';
        const absAmount = Math.abs(amount);
        return `${sign}$${absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }

    // ============================================================
    // HELPER: Hex to RGB
    // ============================================================
    private static hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : { r: 248, g: 250, b: 252 };
    }

    // ============================================================
    // HTML GENERATION (for print preview)
    // ============================================================
    static generateHTML(data: IncomeStatementData, companyName: string = 'RST ERP System'): string {
        const {
            startDate = '',
            endDate = '',
            revenue,
            costOfGoodsSold,
            grossProfit = 0,
            grossMargin = 0,
            operatingExpenses,
            operatingIncome = 0,
            operatingMargin = 0,
            otherIncome,
            otherExpenses,
            netIncome = 0,
            netMargin = 0,
            ebitda = 0,
            ebitdaMargin = 0,
            isProfitable = true,
            generatedDate = new Date().toLocaleString(),
        } = data;

        const hasRevenue = revenue?.items && revenue.items.length > 0;
        const hasCOGS = costOfGoodsSold?.items && costOfGoodsSold.items.length > 0;
        const hasOperatingExpenses = operatingExpenses?.items && operatingExpenses.items.length > 0;
        const hasOtherIncome = otherIncome?.items && otherIncome.items.length > 0;
        const hasOtherExpenses = otherExpenses?.items && otherExpenses.items.length > 0;

        // Calculate percentages
        const cogsPercentage = revenue?.total && revenue.total > 0
            ? ((costOfGoodsSold?.total || 0) / revenue.total) * 100
            : 0;
        const opExpPercentage = revenue?.total && revenue.total > 0
            ? ((operatingExpenses?.total || 0) / revenue.total) * 100
            : 0;

        // Format currency for HTML
        const formatCurrency = (amount: number): string => {
            if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
            const sign = amount < 0 ? '-' : '';
            const absAmount = Math.abs(amount);
            return `${sign}$${absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        };

        const formatPercent = (value: number): string => {
            if (value === undefined || value === null || isNaN(value)) return '0.0%';
            return value.toFixed(1) + '%';
        };

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Income Statement</title>
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
        }
        .header {
            text-align: center;
            padding-bottom: 24px;
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 28px;
        }
        .company-name {
            font-size: 22px;
            font-weight: 700;
            color: #1a1a2e;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .company-name span { color: #2563eb; }
        .doc-title {
            font-size: 28px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 6px;
            letter-spacing: 1px;
        }
        .doc-period {
            font-size: 14px;
            color: #64748b;
            margin-top: 4px;
            font-weight: 400;
        }
        .status-badge {
            display: inline-block;
            margin-top: 10px;
            padding: 6px 20px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: ${isProfitable ? '#dcfce7' : '#fee2e2'};
            color: ${isProfitable ? '#166534' : '#991b1b'};
            border: 1px solid ${isProfitable ? '#86efac' : '#fca5a5'};
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 32px;
        }
        .summary-card {
            background: #f8fafc;
            border-radius: 10px;
            padding: 16px 18px;
            text-align: center;
            border: 1px solid #e9edf2;
        }
        .summary-card .label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 4px;
        }
        .summary-card .amount {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
        }
        .summary-card .margin {
            font-size: 12px;
            font-weight: 500;
            color: #2563eb;
            margin-top: 2px;
        }
        .summary-card.highlight {
            background: #eff6ff;
            border-color: #93c5fd;
        }
        .summary-card.highlight .amount { color: #1d4ed8; }
        .summary-card.danger {
            background: #fef2f2;
            border-color: #fca5a5;
        }
        .summary-card.danger .amount { color: #dc2626; }
        .section { margin-top: 28px; }
        .section-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 0 8px 0;
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 12px;
        }
        .section-header .icon { font-size: 20px; }
        .section-header .title {
            font-size: 17px;
            font-weight: 700;
            color: #0f172a;
        }
        .section-header .subtitle {
            font-size: 13px;
            font-weight: 400;
            color: #64748b;
            margin-left: auto;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        .data-table thead th {
            text-align: left;
            padding: 10px 12px;
            background: #f1f5f9;
            font-weight: 600;
            color: #334155;
            border-bottom: 2px solid #e2e8f0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .data-table tbody td {
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
        }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .data-table .amount-col {
            text-align: right;
            font-weight: 500;
        }
        .data-table .margin-col {
            text-align: right;
            font-weight: 500;
            color: #2563eb;
        }
        .data-table .total-row td {
            font-weight: 700;
            border-top: 2px solid #cbd5e1;
            padding-top: 12px;
        }
        .data-table .empty-row td {
            color: #94a3b8;
            font-style: italic;
            text-align: center;
            padding: 14px 0;
        }
        .data-table .highlight-row td {
            background: #f0f7ff;
            font-weight: 700;
            font-size: 15px;
        }
        .data-table .highlight-row .amount-col { color: #1d4ed8; }
        .data-table .negative { color: #dc2626; }
        .data-table .positive { color: #16a34a; }
        .footer {
            margin-top: 36px;
            padding-top: 18px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
        }
        .footer .company {
            font-weight: 600;
            color: #475569;
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
            .highlight-row td {
                background: #f0f7ff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .status-badge {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .summary-card.highlight {
                background: #eff6ff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
        @media (max-width: 768px) {
            .summary-grid { grid-template-columns: repeat(2, 1fr); }
            .report-container { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="company-name">${companyName}</div>
            <div class="doc-title">INCOME STATEMENT</div>
            <div class="doc-period">For the period ${startDate} – ${endDate}</div>
            <div class="status-badge">${isProfitable ? '✅ PROFITABLE' : '⚠️ NET LOSS'}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <div class="label">Revenue</div>
                <div class="amount">${formatCurrency(revenue?.total || 0)}</div>
                <div class="margin">100.0%</div>
            </div>
            <div class="summary-card">
                <div class="label">Gross Profit</div>
                <div class="amount">${formatCurrency(grossProfit)}</div>
                <div class="margin">${formatPercent(grossMargin)}</div>
            </div>
            <div class="summary-card highlight">
                <div class="label">Operating Income (EBIT)</div>
                <div class="amount">${formatCurrency(operatingIncome)}</div>
                <div class="margin">${formatPercent(operatingMargin)}</div>
            </div>
            <div class="summary-card ${netIncome >= 0 ? 'highlight' : 'danger'}">
                <div class="label">Net Income</div>
                <div class="amount">${formatCurrency(netIncome)}</div>
                <div class="margin">${formatPercent(netMargin)}</div>
            </div>
        </div>

        <!-- REVENUE -->
        <div class="section">
            <div class="section-header">
                <span class="icon">📊</span>
                <span class="title">REVENUE</span>
                <span class="subtitle">Total: ${formatCurrency(revenue?.total || 0)}</span>
            </div>
            <table class="data-table">
                <thead><tr><th>Account</th><th class="amount-col">Amount</th><th class="margin-col">% of Revenue</th></tr></thead>
                <tbody>
                    ${hasRevenue ? revenue.items.map((item: any) => `
                        <tr>
                            <td>${item.code || ''} ${item.name || ''}</td>
                            <td class="amount-col">${formatCurrency(item.amount)}</td>
                            <td class="margin-col">${formatPercent(item.percentage)}</td>
                        </tr>
                    `).join('') : `
                        <tr class="empty-row"><td colspan="3">No revenue transactions found for this period</td></tr>
                    `}
                    <tr class="total-row">
                        <td><strong>Total Revenue</strong></td>
                        <td class="amount-col"><strong>${formatCurrency(revenue?.total || 0)}</strong></td>
                        <td class="margin-col"><strong>100.0%</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- COGS -->
        <div class="section">
            <div class="section-header">
                <span class="icon">📦</span>
                <span class="title">COST OF GOODS SOLD</span>
                <span class="subtitle">Total: ${formatCurrency(costOfGoodsSold?.total || 0)}</span>
            </div>
            <table class="data-table">
                <thead><tr><th>Account</th><th class="amount-col">Amount</th><th class="margin-col">% of Revenue</th></tr></thead>
                <tbody>
                    ${hasCOGS ? costOfGoodsSold.items.map((item: any) => `
                        <tr>
                            <td>${item.code || ''} ${item.name || ''}</td>
                            <td class="amount-col">${formatCurrency(item.amount)}</td>
                            <td class="margin-col">${formatPercent(item.percentage)}</td>
                        </tr>
                    `).join('') : `
                        <tr class="empty-row"><td colspan="3">No COGS transactions found for this period</td></tr>
                    `}
                    <tr class="total-row">
                        <td><strong>Total COGS</strong></td>
                        <td class="amount-col"><strong>${formatCurrency(costOfGoodsSold?.total || 0)}</strong></td>
                        <td class="margin-col"><strong>${formatPercent(cogsPercentage)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- GROSS PROFIT -->
        <div class="section">
            <div class="section-header">
                <span class="icon">📈</span>
                <span class="title">GROSS PROFIT</span>
                <span class="subtitle">${formatCurrency(grossProfit)} (${formatPercent(grossMargin)})</span>
            </div>
            <table class="data-table">
                <tbody>
                    <tr>
                        <td>Gross Profit</td>
                        <td class="amount-col">${formatCurrency(grossProfit)}</td>
                        <td class="margin-col">${formatPercent(grossMargin)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- OPERATING EXPENSES -->
        <div class="section">
            <div class="section-header">
                <span class="icon">💼</span>
                <span class="title">OPERATING EXPENSES</span>
                <span class="subtitle">Total: ${formatCurrency(operatingExpenses?.total || 0)}</span>
            </div>
            <table class="data-table">
                <thead><tr><th>Account</th><th class="amount-col">Amount</th><th class="margin-col">% of Revenue</th></tr></thead>
                <tbody>
                    ${hasOperatingExpenses ? operatingExpenses.items.map((item: any) => `
                        <tr>
                            <td>${item.code || ''} ${item.name || ''}</td>
                            <td class="amount-col">${formatCurrency(item.amount)}</td>
                            <td class="margin-col">${formatPercent(item.percentage)}</td>
                        </tr>
                    `).join('') : `
                        <tr class="empty-row"><td colspan="3">No operating expenses found for this period</td></tr>
                    `}
                    <tr class="total-row">
                        <td><strong>Total Operating Expenses</strong></td>
                        <td class="amount-col"><strong>${formatCurrency(operatingExpenses?.total || 0)}</strong></td>
                        <td class="margin-col"><strong>${formatPercent(opExpPercentage)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- OPERATING INCOME -->
        <div class="section">
            <div class="section-header">
                <span class="icon">⚡</span>
                <span class="title">OPERATING INCOME (EBIT)</span>
                <span class="subtitle">${formatCurrency(operatingIncome)} (${formatPercent(operatingMargin)})</span>
            </div>
            <table class="data-table">
                <tbody>
                    <tr class="highlight-row">
                        <td>EBIT</td>
                        <td class="amount-col">${formatCurrency(operatingIncome)}</td>
                        <td class="margin-col">${formatPercent(operatingMargin)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${hasOtherIncome ? `
        <div class="section">
            <div class="section-header">
                <span class="icon">💰</span>
                <span class="title">OTHER INCOME</span>
                <span class="subtitle">Total: ${formatCurrency(otherIncome?.total || 0)}</span>
            </div>
            <table class="data-table">
                <thead><tr><th>Account</th><th class="amount-col">Amount</th></tr></thead>
                <tbody>
                    ${otherIncome.items.map((item: any) => `
                        <tr>
                            <td>${item.code || ''} ${item.name || ''}</td>
                            <td class="amount-col positive">+${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td><strong>Total Other Income</strong></td>
                        <td class="amount-col positive"><strong>+${formatCurrency(otherIncome?.total || 0)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        ` : ''}

        ${hasOtherExpenses ? `
        <div class="section">
            <div class="section-header">
                <span class="icon">💸</span>
                <span class="title">OTHER EXPENSES</span>
                <span class="subtitle">Total: ${formatCurrency(otherExpenses?.total || 0)}</span>
            </div>
            <table class="data-table">
                <thead><tr><th>Account</th><th class="amount-col">Amount</th></tr></thead>
                <tbody>
                    ${otherExpenses.items.map((item: any) => `
                        <tr>
                            <td>${item.code || ''} ${item.name || ''}</td>
                            <td class="amount-col negative">-${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td><strong>Total Other Expenses</strong></td>
                        <td class="amount-col negative"><strong>-${formatCurrency(otherExpenses?.total || 0)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        ` : ''}

        <!-- NET INCOME -->
        <div class="section">
            <div class="section-header">
                <span class="icon">🏆</span>
                <span class="title">NET INCOME</span>
                <span class="subtitle">${formatCurrency(netIncome)} (${formatPercent(netMargin)})</span>
            </div>
            <table class="data-table">
                <tbody>
                    <tr class="highlight-row">
                        <td>Net Income</td>
                        <td class="amount-col">${formatCurrency(netIncome)}</td>
                        <td class="margin-col">${formatPercent(netMargin)}</td>
                    </tr>
                    ${ebitda ? `
                    <tr>
                        <td>EBITDA</td>
                        <td class="amount-col">${formatCurrency(ebitda)}</td>
                        <td class="margin-col">${formatPercent(ebitdaMargin)}</td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <span class="company">${companyName}</span>
            <span>Generated: ${generatedDate}</span>
        </div>
    </div>
</body>
</html>
        `;
    }
}

// ✅ Export for compatibility
export { IncomeStatementReport as default };