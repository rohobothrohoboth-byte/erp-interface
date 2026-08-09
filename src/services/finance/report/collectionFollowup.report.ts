// src/services/finance/report/collectionFollowup.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CollectionCustomer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    totalOutstanding: number;
    overdueAmount: number;
    invoiceCount: number;
    daysOverdue: number;
    lastPaymentDate?: string;
    aging: {
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
    status: 'Current' | 'Overdue' | 'Critical';
    contactPerson?: string;
    notes?: string[];
    collectionScore?: number;
    riskLevel?: 'Low' | 'Medium' | 'High';
    periodId?: string;
    periodName?: string;
}

export interface CollectionStats {
    totalOutstanding: number;
    overdueAmount: number;
    criticalCount: number;
    overdueCount: number;
    currentCount: number;
    collectionRate: number;
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

export class CollectionFollowupReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY
    // ============================================================
    static generatePDF(
        customers: CollectionCustomer[],
        stats: CollectionStats,
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

        const totalCustomers = customers.length;
        const periodName = customers.find(c => c.periodName)?.periodName || 'All Periods';

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
        doc.text('COLLECTION FOLLOW-UP REPORT', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Period: ${periodName}`, pageWidth / 2, yPos, { align: 'center' });
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
            { label: 'Total Outstanding', amount: stats.totalOutstanding, color: '#2563eb', isCurrency: true },
            { label: 'Overdue Amount', amount: stats.overdueAmount, color: '#dc2626', isCurrency: true },
            { label: 'Overdue Customers', amount: stats.overdueCount, color: '#ca8a04', isCurrency: false },
            { label: 'Collection Rate', amount: stats.collectionRate, color: '#7c3aed', isCurrency: false, isPercentage: true },
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
                : card.isPercentage
                    ? (card.amount as number).toFixed(1) + '%'
                    : String(card.amount);
            doc.text(displayValue, x + cardWidth / 2, yPos + 20, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // ============================================
        // STATUS BREAKDOWN
        // ============================================
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Status Breakdown', margin, yPos);
        yPos += 6;

        const statusData = [
            ['Current', stats.currentCount.toString()],
            ['Overdue', stats.overdueCount.toString()],
            ['Critical', stats.criticalCount.toString()],
            ['Total', totalCustomers.toString()],
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
                1: { cellWidth: 40, halign: 'center' },
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 0) {
                    const status = data.cell.raw as string;
                    if (status === 'Current') {
                        data.cell.styles.textColor = [22, 163, 74];
                        data.cell.styles.fontStyle = 'bold';
                    } else if (status === 'Overdue') {
                        data.cell.styles.textColor = [202, 138, 4];
                        data.cell.styles.fontStyle = 'bold';
                    } else if (status === 'Critical') {
                        data.cell.styles.textColor = [220, 38, 38];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            },
        });

        yPos = (doc as any).lastAutoTable?.finalY || yPos + 30;
        yPos += 8;

        // ============================================
        // CUSTOMERS TABLE
        // ============================================
        if (customers.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Customer List', margin, yPos);
            yPos += 6;

            const tableData = customers.map(c => [
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

            autoTable(doc, {
                startY: yPos,
                head: [['Customer', 'Email', 'Phone', 'Outstanding', 'Overdue', 'Invoices', 'Days OD', 'Status', 'Risk', 'Score', 'Period']],
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
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 25, halign: 'center' },
                    3: { cellWidth: 30, halign: 'right' },
                    4: { cellWidth: 30, halign: 'right' },
                    5: { cellWidth: 15, halign: 'center' },
                    6: { cellWidth: 15, halign: 'center' },
                    7: { cellWidth: 20, halign: 'center' },
                    8: { cellWidth: 15, halign: 'center' },
                    9: { cellWidth: 15, halign: 'center' },
                    10: { cellWidth: 'auto' },
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 7) {
                        const status = data.cell.raw as string;
                        if (status === 'Current') {
                            data.cell.styles.textColor = [22, 163, 74];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (status === 'Overdue') {
                            data.cell.styles.textColor = [202, 138, 4];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (status === 'Critical') {
                            data.cell.styles.textColor = [220, 38, 38];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    if (data.section === 'body' && data.column.index === 8) {
                        const risk = data.cell.raw as string;
                        if (risk === 'Low') {
                            data.cell.styles.textColor = [22, 163, 74];
                        } else if (risk === 'Medium') {
                            data.cell.styles.textColor = [202, 138, 4];
                        } else if (risk === 'High') {
                            data.cell.styles.textColor = [220, 38, 38];
                        }
                    }
                    if (data.section === 'body' && data.column.index === 3) {
                        data.cell.styles.textColor = [37, 99, 235];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    if (data.section === 'body' && data.column.index === 4) {
                        data.cell.styles.textColor = [220, 38, 38];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    if (data.section === 'body' && data.column.index === 9) {
                        const score = data.cell.raw as number;
                        if (score >= 70) {
                            data.cell.styles.textColor = [22, 163, 74];
                        } else if (score >= 40) {
                            data.cell.styles.textColor = [202, 138, 4];
                        } else {
                            data.cell.styles.textColor = [220, 38, 38];
                        }
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;
        }

        // ============================================
        // AGING SUMMARY
        // ============================================
        const agingTotals = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
        customers.forEach(c => {
            if (c.aging) {
                agingTotals['0-30'] += c.aging['0-30'] || 0;
                agingTotals['31-60'] += c.aging['31-60'] || 0;
                agingTotals['61-90'] += c.aging['61-90'] || 0;
                agingTotals['90+'] += c.aging['90+'] || 0;
            }
        });

        if (Object.values(agingTotals).some(v => v > 0)) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Aging Summary', margin, yPos);
            yPos += 6;

            const agingData = [
                ['0-30 Days', formatCurrency(agingTotals['0-30'])],
                ['31-60 Days', formatCurrency(agingTotals['31-60'])],
                ['61-90 Days', formatCurrency(agingTotals['61-90'])],
                ['90+ Days', formatCurrency(agingTotals['90+'])],
                ['Total', formatCurrency(Object.values(agingTotals).reduce((a, b) => a + b, 0))],
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
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 1) {
                        data.cell.styles.textColor = [37, 99, 235];
                        data.cell.styles.fontStyle = 'bold';
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
    // ✅ GENERATE HTML (for print preview)
    // ============================================================
    static generateHTML(data: any, companyName: string = 'RST ERP'): string {
        let customers: CollectionCustomer[] = [];
        let stats: CollectionStats = {
            totalOutstanding: 0,
            overdueAmount: 0,
            criticalCount: 0,
            overdueCount: 0,
            currentCount: 0,
            collectionRate: 0,
        };

        if (Array.isArray(data)) {
            customers = data;
        } else if (data && typeof data === 'object') {
            customers = Array.isArray(data.customers) ? data.customers : [];
            stats = data.stats || stats;
        }

        const totalCustomers = customers.length;
        const periodName = customers.find(c => c.periodName)?.periodName || 'All Periods';

        const agingTotals = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
        customers.forEach(c => {
            if (c.aging) {
                agingTotals['0-30'] += c.aging['0-30'] || 0;
                agingTotals['31-60'] += c.aging['31-60'] || 0;
                agingTotals['61-90'] += c.aging['61-90'] || 0;
                agingTotals['90+'] += c.aging['90+'] || 0;
            }
        });

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Collection Follow-up Report</title>
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
        .summary-card.blue .value { color: #2563eb; }
        .summary-card.red .value { color: #dc2626; }
        .summary-card.yellow .value { color: #ca8a04; }
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
        .status-current { color: #16a34a; font-weight: 600; }
        .status-overdue { color: #ca8a04; font-weight: 600; }
        .status-critical { color: #dc2626; font-weight: 600; }
        .risk-low { color: #16a34a; font-weight: 600; }
        .risk-medium { color: #ca8a04; font-weight: 600; }
        .risk-high { color: #dc2626; font-weight: 600; }
        .score-high { color: #16a34a; font-weight: 700; }
        .score-medium { color: #ca8a04; font-weight: 700; }
        .score-low { color: #dc2626; font-weight: 700; }
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
            <h1>COLLECTION FOLLOW-UP REPORT</h1>
            <div class="period">Period: ${periodName}</div>
            <div class="generated">Generated on ${formatDate(new Date().toISOString())}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card blue">
                <div class="label">Total Outstanding</div>
                <div class="value">${formatCurrency(stats.totalOutstanding)}</div>
            </div>
            <div class="summary-card red">
                <div class="label">Overdue Amount</div>
                <div class="value">${formatCurrency(stats.overdueAmount)}</div>
            </div>
            <div class="summary-card yellow">
                <div class="label">Overdue Customers</div>
                <div class="value">${stats.overdueCount}</div>
            </div>
            <div class="summary-card purple">
                <div class="label">Collection Rate</div>
                <div class="value">${stats.collectionRate.toFixed(1)}%</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Status Breakdown</div>
            <table>
                <thead><tr><th>Status</th><th class="text-center">Count</th></tr></thead>
                <tbody>
                    <tr><td>Current</td><td class="text-center">${stats.currentCount}</td></tr>
                    <tr><td>Overdue</td><td class="text-center">${stats.overdueCount}</td></tr>
                    <tr><td>Critical</td><td class="text-center">${stats.criticalCount}</td></tr>
                    <tr style="border-top: 2px solid #1a1a2e; font-weight: 700;"><td>Total</td><td class="text-center">${totalCustomers}</td></tr>
                </tbody>
            </table>
        </div>

        ${customers.length > 0 ? `
        <div class="section">
            <div class="section-title">Customer List</div>
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th class="text-right">Outstanding</th>
                        <th class="text-right">Overdue</th>
                        <th class="text-center">Invoices</th>
                        <th class="text-center">Days OD</th>
                        <th class="text-center">Status</th>
                        <th class="text-center">Risk</th>
                        <th class="text-center">Score</th>
                        <th>Period</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(c => `
                        <tr>
                            <td><strong>${c.name || ''}</strong></td>
                            <td>${c.email || ''}</td>
                            <td>${c.phone || ''}</td>
                            <td class="text-right" style="color: #2563eb; font-weight: 600;">${formatCurrency(c.totalOutstanding || 0)}</td>
                            <td class="text-right" style="color: #dc2626; font-weight: 600;">${formatCurrency(c.overdueAmount || 0)}</td>
                            <td class="text-center">${c.invoiceCount || 0}</td>
                            <td class="text-center">${c.daysOverdue || 0}</td>
                            <td class="text-center"><span class="status-${(c.status || 'current').toLowerCase()}">${c.status || 'Current'}</span></td>
                            <td class="text-center"><span class="risk-${(c.riskLevel || 'low').toLowerCase()}">${c.riskLevel || 'Low'}</span></td>
                            <td class="text-center"><span class="${(c.collectionScore || 0) >= 70 ? 'score-high' : (c.collectionScore || 0) >= 40 ? 'score-medium' : 'score-low'}">${c.collectionScore || 0}%</span></td>
                            <td>${c.periodName || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${Object.values(agingTotals).some(v => v > 0) ? `
        <div class="section">
            <div class="section-title">Aging Summary</div>
            <table>
                <thead><tr><th>Aging Period</th><th class="text-right">Amount</th></tr></thead>
                <tbody>
                    <tr><td>0-30 Days</td><td class="text-right">${formatCurrency(agingTotals['0-30'])}</td></tr>
                    <tr><td>31-60 Days</td><td class="text-right">${formatCurrency(agingTotals['31-60'])}</td></tr>
                    <tr><td>61-90 Days</td><td class="text-right">${formatCurrency(agingTotals['61-90'])}</td></tr>
                    <tr><td>90+ Days</td><td class="text-right">${formatCurrency(agingTotals['90+'])}</td></tr>
                    <tr style="border-top: 2px solid #1a1a2e; font-weight: 700;"><td>Total</td><td class="text-right">${formatCurrency(Object.values(agingTotals).reduce((a, b) => a + b, 0))}</td></tr>
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

// ✅ Export for compatibility
export { CollectionFollowupReport as default };