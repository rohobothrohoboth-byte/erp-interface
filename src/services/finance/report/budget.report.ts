// src/services/finance/report/budget.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface BudgetLine {
    id?: string;
    accountId: string;
    accountName?: string;
    accountCode?: string;
    allocatedAmount: number;
    spentAmount: number;
    description?: string;
    periodId?: string;
}

export interface BudgetData {
    id: string;
    name: string;
    description?: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    status: string;
    branchId?: string;
    branchName?: string;
    departmentId?: string;
    departmentName?: string;
    periodId?: string;
    periodName?: string;
    lines: BudgetLine[];
    dateAdd: string;
    dateMod?: string;
    rowVersion?: string;
}

export interface BudgetStats {
    totalBudgets: number;
    totalAmount: number;
    activeCount: number;
    draftCount: number;
    inactiveCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalAllocated: number;
    totalSpent: number;
    totalRemaining: number;
    utilizationRate: number;
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

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        Active: '#16a34a',
        Draft: '#ca8a04',
        Inactive: '#6b7280',
        Approved: '#2563eb',
        Rejected: '#dc2626',
    };
    return colors[status] || '#6b7280';
}

export class BudgetReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY
    // ============================================================
    static generatePDF(
        budgets: BudgetData[],
        stats: BudgetStats,
        companyName: string = 'RST ERP System',
        periodName: string = 'All Periods'
    ): jsPDF {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 18;
        let yPos = 20;

        // Calculate totals
        const totalAllocated = stats.totalAllocated || budgets.reduce((sum, b) => sum + b.totalAmount, 0);
        const totalSpent = stats.totalSpent || budgets.reduce((sum, b) =>
            sum + b.lines.reduce((s, l) => s + (l.spentAmount || 0), 0), 0
        );
        const totalRemaining = totalAllocated - totalSpent;
        const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

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
        doc.text('BUDGET REPORT', pageWidth / 2, yPos, { align: 'center' });
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
        // SUMMARY CARDS (6 columns)
        // ============================================
        const cardWidth = (pageWidth - margin * 2 - 20) / 6;
        const cardHeight = 28;
        const cards = [
            { label: 'Total Budgets', amount: stats.totalBudgets, color: '#2563eb', isCurrency: false },
            { label: 'Total Allocated', amount: totalAllocated, color: '#2563eb', isCurrency: true },
            { label: 'Total Spent', amount: totalSpent, color: '#ea580c', isCurrency: true },
            { label: 'Total Remaining', amount: totalRemaining, color: '#16a34a', isCurrency: true },
            { label: 'Active', amount: stats.activeCount, color: '#16a34a', isCurrency: false },
            { label: 'Utilization', amount: utilizationRate, color: '#7c3aed', isCurrency: false, isPercentage: true },
        ];

        cards.forEach((card, index) => {
            const x = margin + index * (cardWidth + 4);
            const rgbColor = hexToRgb(card.color);

            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(229, 231, 235);
            doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, 'FD');

            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text(card.label, x + cardWidth / 2, yPos + 8, { align: 'center' });

            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(rgbColor.r, rgbColor.g, rgbColor.b);
            const displayValue = card.isCurrency
                ? formatCurrency(card.amount as number)
                : card.isPercentage
                    ? (card.amount as number).toFixed(1) + '%'
                    : String(card.amount);
            doc.text(displayValue, x + cardWidth / 2, yPos + 22, { align: 'center' });
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
            ['Active', stats.activeCount.toString(), formatCurrency(
                budgets.filter(b => b.status === 'Active').reduce((sum, b) => sum + b.totalAmount, 0)
            )],
            ['Draft', stats.draftCount.toString(), formatCurrency(
                budgets.filter(b => b.status === 'Draft').reduce((sum, b) => sum + b.totalAmount, 0)
            )],
            ['Approved', stats.approvedCount.toString(), formatCurrency(
                budgets.filter(b => b.status === 'Approved').reduce((sum, b) => sum + b.totalAmount, 0)
            )],
            ['Inactive', stats.inactiveCount.toString(), formatCurrency(
                budgets.filter(b => b.status === 'Inactive').reduce((sum, b) => sum + b.totalAmount, 0)
            )],
            ['Rejected', stats.rejectedCount.toString(), formatCurrency(
                budgets.filter(b => b.status === 'Rejected').reduce((sum, b) => sum + b.totalAmount, 0)
            )],
            ['Total', stats.totalBudgets.toString(), formatCurrency(stats.totalAmount)],
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Status', 'Count', 'Amount']],
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
                1: { cellWidth: 30, halign: 'center' },
                2: { cellWidth: 40, halign: 'right' },
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 0) {
                    const status = data.cell.raw as string;
                    const color = getStatusColor(status);
                    const rgb = hexToRgb(color);
                    data.cell.styles.textColor = [rgb.r, rgb.g, rgb.b];
                    data.cell.styles.fontStyle = 'bold';
                }
                if (data.section === 'body' && data.column.index === 2) {
                    data.cell.styles.textColor = [37, 99, 235];
                    data.cell.styles.fontStyle = 'bold';
                }
                if (data.section === 'body' && data.column.index === 0 && data.cell.raw === 'Total') {
                    data.cell.styles.textColor = [15, 23, 42];
                }
            },
        });

        yPos = (doc as any).lastAutoTable?.finalY || yPos + 30;
        yPos += 8;

        // ============================================
        // BUDGETS TABLE
        // ============================================
        if (budgets.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Budget List', margin, yPos);
            yPos += 6;

            const tableData = budgets.map(b => [
                b.name || '',
                b.periodName || '',
                formatDateShort(b.startDate),
                formatDateShort(b.endDate),
                b.totalAmount || 0,
                b.lines.reduce((sum, l) => sum + (l.spentAmount || 0), 0) || 0,
                b.totalAmount - b.lines.reduce((sum, l) => sum + (l.spentAmount || 0), 0) || 0,
                b.status || 'Draft',
                b.branchName || '',
                b.departmentName || '',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Budget', 'Period', 'Start', 'End', 'Allocated', 'Spent', 'Remaining', 'Status', 'Branch', 'Department']],
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
                    1: { cellWidth: 25 },
                    2: { cellWidth: 20, halign: 'center' },
                    3: { cellWidth: 20, halign: 'center' },
                    4: { cellWidth: 25, halign: 'right' },
                    5: { cellWidth: 25, halign: 'right' },
                    6: { cellWidth: 25, halign: 'right' },
                    7: { cellWidth: 20, halign: 'center' },
                    8: { cellWidth: 'auto' },
                    9: { cellWidth: 'auto' },
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 7) {
                        const status = data.cell.raw as string;
                        const color = getStatusColor(status);
                        const rgb = hexToRgb(color);
                        data.cell.styles.textColor = [rgb.r, rgb.g, rgb.b];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    if (data.section === 'body' && data.column.index === 4) {
                        data.cell.styles.textColor = [37, 99, 235];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    if (data.section === 'body' && data.column.index === 5) {
                        data.cell.styles.textColor = [234, 88, 12];
                    }
                    if (data.section === 'body' && data.column.index === 6) {
                        const remaining = data.cell.raw as number;
                        data.cell.styles.textColor = remaining >= 0 ? [22, 163, 74] : [220, 38, 38];
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;
        }

        // ============================================
        // BUDGET LINES DETAIL (if budgets have lines)
        // ============================================
        const hasLines = budgets.some(b => b.lines.length > 0);
        if (hasLines) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Budget Lines Detail', margin, yPos);
            yPos += 6;

            const lineData: any[][] = [];
            budgets.forEach(b => {
                b.lines.forEach(line => {
                    const remaining = line.allocatedAmount - (line.spentAmount || 0);
                    lineData.push([
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

            if (lineData.length > 0) {
                autoTable(doc, {
                    startY: yPos,
                    head: [['Budget', 'Account', 'Code', 'Allocated', 'Spent', 'Remaining', 'Description']],
                    body: lineData,
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
                        2: { cellWidth: 20, halign: 'center' },
                        3: { cellWidth: 25, halign: 'right' },
                        4: { cellWidth: 25, halign: 'right' },
                        5: { cellWidth: 25, halign: 'right' },
                        6: { cellWidth: 'auto' },
                    },
                    didParseCell: (data) => {
                        if (data.section === 'body' && data.column.index === 3) {
                            data.cell.styles.textColor = [37, 99, 235];
                            data.cell.styles.fontStyle = 'bold';
                        }
                        if (data.section === 'body' && data.column.index === 4) {
                            data.cell.styles.textColor = [234, 88, 12];
                        }
                        if (data.section === 'body' && data.column.index === 5) {
                            const remaining = data.cell.raw as number;
                            data.cell.styles.textColor = remaining >= 0 ? [22, 163, 74] : [220, 38, 38];
                            data.cell.styles.fontStyle = 'bold';
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
    // ✅ GENERATE HTML (for print preview)
    // ============================================================
    static generateHTML(data: any, companyName: string = 'RST ERP'): string {
        let budgets: BudgetData[] = [];
        let stats: BudgetStats = {
            totalBudgets: 0,
            totalAmount: 0,
            activeCount: 0,
            draftCount: 0,
            inactiveCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
            totalAllocated: 0,
            totalSpent: 0,
            totalRemaining: 0,
            utilizationRate: 0,
        };

        if (Array.isArray(data)) {
            budgets = data;
        } else if (data && typeof data === 'object') {
            budgets = Array.isArray(data.budgets) ? data.budgets : [];
            stats = data.stats || stats;
        }

        const periodName = budgets.find(b => b.periodName)?.periodName || 'All Periods';
        const totalAllocated = stats.totalAllocated || budgets.reduce((sum, b) => sum + b.totalAmount, 0);
        const totalSpent = stats.totalSpent || budgets.reduce((sum, b) =>
            sum + b.lines.reduce((s, l) => s + (l.spentAmount || 0), 0), 0
        );
        const totalRemaining = totalAllocated - totalSpent;
        const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

        // Calculate branch distribution
        const branchMap: Record<string, { count: number; amount: number }> = {};
        budgets.forEach(b => {
            const key = b.branchName || 'Unassigned';
            if (!branchMap[key]) branchMap[key] = { count: 0, amount: 0 };
            branchMap[key].count++;
            branchMap[key].amount += b.totalAmount;
        });

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Budget Report</title>
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
            grid-template-columns: repeat(6, 1fr);
            gap: 8px;
            margin-bottom: 24px;
        }
        .summary-card {
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            background: #f8fafc;
            text-align: center;
        }
        .summary-card .label {
            font-size: 7px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .summary-card .value {
            font-size: 14px;
            font-weight: 700;
            margin-top: 2px;
        }
        .summary-card.blue .value { color: #2563eb; }
        .summary-card.green .value { color: #16a34a; }
        .summary-card.orange .value { color: #ea580c; }
        .summary-card.purple .value { color: #7c3aed; }
        .summary-card.red .value { color: #dc2626; }
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
            font-size: 10px;
        }
        table thead th {
            background: #f1f5f9;
            padding: 5px 8px;
            text-align: left;
            font-weight: 700;
            font-size: 9px;
            text-transform: uppercase;
            color: #475569;
            border-bottom: 1px solid #e5e7eb;
        }
        table tbody td {
            padding: 4px 8px;
            border-bottom: 1px solid #f1f5f9;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .status-active { color: #16a34a; font-weight: 600; }
        .status-draft { color: #ca8a04; font-weight: 600; }
        .status-inactive { color: #6b7280; font-weight: 600; }
        .status-approved { color: #2563eb; font-weight: 600; }
        .status-rejected { color: #dc2626; font-weight: 600; }
        .branch-distribution {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 8px;
            margin-top: 8px;
        }
        .branch-item {
            padding: 8px 12px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .branch-item .branch-name {
            font-weight: 500;
            font-size: 11px;
        }
        .branch-item .branch-amount {
            font-weight: 600;
            font-size: 11px;
            color: #2563eb;
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
            .branch-distribution { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="report-header">
            <div class="company-name">${companyName}</div>
            <h1>BUDGET REPORT</h1>
            <div class="period">Period: ${periodName}</div>
            <div class="generated">Generated on ${formatDate(new Date().toISOString())}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card blue">
                <div class="label">Total Budgets</div>
                <div class="value">${stats.totalBudgets}</div>
            </div>
            <div class="summary-card blue">
                <div class="label">Total Allocated</div>
                <div class="value">${formatCurrency(totalAllocated)}</div>
            </div>
            <div class="summary-card orange">
                <div class="label">Total Spent</div>
                <div class="value">${formatCurrency(totalSpent)}</div>
            </div>
            <div class="summary-card green">
                <div class="label">Total Remaining</div>
                <div class="value">${formatCurrency(totalRemaining)}</div>
            </div>
            <div class="summary-card green">
                <div class="label">Active</div>
                <div class="value">${stats.activeCount}</div>
            </div>
            <div class="summary-card purple">
                <div class="label">Utilization</div>
                <div class="value">${utilizationRate.toFixed(1)}%</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Status Breakdown</div>
            <table>
                <thead><tr><th>Status</th><th class="text-center">Count</th><th class="text-right">Amount</th></tr></thead>
                <tbody>
                    <tr><td class="status-active">Active</td><td class="text-center">${stats.activeCount}</td><td class="text-right">${formatCurrency(budgets.filter(b => b.status === 'Active').reduce((sum, b) => sum + b.totalAmount, 0))}</td></tr>
                    <tr><td class="status-draft">Draft</td><td class="text-center">${stats.draftCount}</td><td class="text-right">${formatCurrency(budgets.filter(b => b.status === 'Draft').reduce((sum, b) => sum + b.totalAmount, 0))}</td></tr>
                    <tr><td class="status-approved">Approved</td><td class="text-center">${stats.approvedCount}</td><td class="text-right">${formatCurrency(budgets.filter(b => b.status === 'Approved').reduce((sum, b) => sum + b.totalAmount, 0))}</td></tr>
                    <tr><td class="status-inactive">Inactive</td><td class="text-center">${stats.inactiveCount}</td><td class="text-right">${formatCurrency(budgets.filter(b => b.status === 'Inactive').reduce((sum, b) => sum + b.totalAmount, 0))}</td></tr>
                    <tr><td class="status-rejected">Rejected</td><td class="text-center">${stats.rejectedCount}</td><td class="text-right">${formatCurrency(budgets.filter(b => b.status === 'Rejected').reduce((sum, b) => sum + b.totalAmount, 0))}</td></tr>
                    <tr style="border-top: 2px solid #1a1a2e; font-weight: 700;"><td>Total</td><td class="text-center">${stats.totalBudgets}</td><td class="text-right">${formatCurrency(stats.totalAmount)}</td></tr>
                </tbody>
            </table>
        </div>

        ${Object.keys(branchMap).length > 0 ? `
        <div class="section">
            <div class="section-title">Branch Distribution</div>
            <div class="branch-distribution">
                ${Object.entries(branchMap).map(([name, data]) => `
                    <div class="branch-item">
                        <span class="branch-name">${name}</span>
                        <span class="branch-amount">${data.count} budgets - ${formatCurrency(data.amount)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${budgets.length > 0 ? `
        <div class="section">
            <div class="section-title">Budget List</div>
            <table>
                <thead>
                    <tr>
                        <th>Budget</th>
                        <th>Period</th>
                        <th>Start</th>
                        <th>End</th>
                        <th class="text-right">Allocated</th>
                        <th class="text-right">Spent</th>
                        <th class="text-right">Remaining</th>
                        <th>Status</th>
                        <th>Branch</th>
                        <th>Department</th>
                    </tr>
                </thead>
                <tbody>
                    ${budgets.map(b => `
                        <tr>
                            <td><strong>${b.name || ''}</strong></td>
                            <td>${b.periodName || ''}</td>
                            <td>${formatDateShort(b.startDate)}</td>
                            <td>${formatDateShort(b.endDate)}</td>
                            <td class="text-right" style="color: #2563eb; font-weight: 600;">${formatCurrency(b.totalAmount || 0)}</td>
                            <td class="text-right" style="color: #ea580c;">${formatCurrency(b.lines.reduce((sum, l) => sum + (l.spentAmount || 0), 0))}</td>
                            <td class="text-right" style="color: ${(b.totalAmount - b.lines.reduce((sum, l) => sum + (l.spentAmount || 0), 0)) >= 0 ? '#16a34a' : '#dc2626'}; font-weight: 600;">${formatCurrency(b.totalAmount - b.lines.reduce((sum, l) => sum + (l.spentAmount || 0), 0))}</td>
                            <td class="status-${(b.status || 'draft').toLowerCase()}">${b.status || 'Draft'}</td>
                            <td>${b.branchName || '-'}</td>
                            <td>${b.departmentName || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${budgets.some(b => b.lines.length > 0) ? `
        <div class="section">
            <div class="section-title">Budget Lines Detail</div>
            <table>
                <thead>
                    <tr>
                        <th>Budget</th>
                        <th>Account</th>
                        <th>Code</th>
                        <th class="text-right">Allocated</th>
                        <th class="text-right">Spent</th>
                        <th class="text-right">Remaining</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${budgets.flatMap(b => b.lines.map(line => `
                        <tr>
                            <td>${b.name}</td>
                            <td>${line.accountName || 'Unknown'}</td>
                            <td>${line.accountCode || ''}</td>
                            <td class="text-right" style="color: #2563eb; font-weight: 600;">${formatCurrency(line.allocatedAmount || 0)}</td>
                            <td class="text-right" style="color: #ea580c;">${formatCurrency(line.spentAmount || 0)}</td>
                            <td class="text-right" style="color: ${(line.allocatedAmount - (line.spentAmount || 0)) >= 0 ? '#16a34a' : '#dc2626'}; font-weight: 600;">${formatCurrency(line.allocatedAmount - (line.spentAmount || 0))}</td>
                            <td>${line.description || '-'}</td>
                        </tr>
                    `)).join('')}
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

export { BudgetReport as default };