// src/services/finance/report/invoicePosting.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface SalesInvoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    customerId?: string;
    customerName?: string;
    subTotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
    status: 'Draft' | 'Posted' | 'Unpaid' | 'Partially_Paid' | 'Paid' | 'Cancelled';
    notes?: string;
    periodId?: string;
    periodName?: string;
    postedAt?: string;
    postedBy?: string;
    items?: any[];
}

export interface InvoicePostingStats {
    totalInvoices: number;
    totalAmount: number;
    totalPaid: number;
    totalBalance: number;
    draftCount: number;
    postedCount: number;
    paidCount: number;
    cancelledCount: number;
    unpaidCount: number;
    partiallyPaidCount: number;
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

export class InvoicePostingReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY
    // ============================================================
    static generatePDF(
        invoices: SalesInvoice[],
        stats: InvoicePostingStats,
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
        doc.text('AR INVOICE POSTING REPORT', pageWidth / 2, yPos, { align: 'center' });
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
        // SUMMARY CARDS (5 columns)
        // ============================================
        const cardWidth = (pageWidth - margin * 2 - 16) / 5;
        const cardHeight = 28;
        const cards = [
            { label: 'Total Invoices', amount: stats.totalInvoices, color: '#2563eb', isCurrency: false },
            { label: 'Total Amount', amount: stats.totalAmount, color: '#2563eb', isCurrency: true },
            { label: 'Total Paid', amount: stats.totalPaid, color: '#16a34a', isCurrency: true },
            { label: 'Total Balance', amount: stats.totalBalance, color: '#dc2626', isCurrency: true },
            { label: 'Collection Rate', amount: stats.totalAmount > 0 ? (stats.totalPaid / stats.totalAmount) * 100 : 0, color: '#7c3aed', isCurrency: false, isPercentage: true },
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
            ['Draft', stats.draftCount.toString()],
            ['Posted', stats.postedCount.toString()],
            ['Unpaid', stats.unpaidCount.toString()],
            ['Partially Paid', stats.partiallyPaidCount.toString()],
            ['Paid', stats.paidCount.toString()],
            ['Cancelled', stats.cancelledCount.toString()],
            ['Total', stats.totalInvoices.toString()],
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
                    const statusColors: Record<string, number[]> = {
                        'Draft': [202, 138, 4],
                        'Posted': [22, 163, 74],
                        'Unpaid': [37, 99, 235],
                        'Partially Paid': [234, 88, 12],
                        'Paid': [99, 102, 241],
                        'Cancelled': [220, 38, 38],
                    };
                    if (statusColors[status]) {
                        data.cell.styles.textColor = statusColors[status];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            },
        });

        yPos = (doc as any).lastAutoTable?.finalY || yPos + 30;
        yPos += 8;

        // ============================================
        // INVOICES TABLE
        // ============================================
        if (invoices.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Invoice List', margin, yPos);
            yPos += 6;

            const tableData = invoices.map(inv => [
                inv.invoiceNumber || '',
                inv.customerName || '',
                inv.periodName || '',
                formatDateShort(inv.invoiceDate),
                formatDateShort(inv.dueDate),
                inv.totalAmount || 0,
                inv.paidAmount || 0,
                inv.balanceDue || 0,
                inv.status || 'Draft',
                inv.postedAt ? formatDateShort(inv.postedAt) : 'Not Posted',
                inv.postedBy || '',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Invoice #', 'Customer', 'Period', 'Date', 'Due', 'Amount', 'Paid', 'Balance', 'Status', 'Posted At', 'Posted By']],
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
                    0: { cellWidth: 25 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 20, halign: 'center' },
                    4: { cellWidth: 20, halign: 'center' },
                    5: { cellWidth: 25, halign: 'right' },
                    6: { cellWidth: 25, halign: 'right' },
                    7: { cellWidth: 25, halign: 'right' },
                    8: { cellWidth: 25, halign: 'center' },
                    9: { cellWidth: 25, halign: 'center' },
                    10: { cellWidth: 20, halign: 'center' },
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 8) {
                        const status = data.cell.raw as string;
                        const statusColors: Record<string, number[]> = {
                            'Draft': [202, 138, 4],
                            'Posted': [22, 163, 74],
                            'Unpaid': [37, 99, 235],
                            'Partially_Paid': [234, 88, 12],
                            'Paid': [99, 102, 241],
                            'Cancelled': [220, 38, 38],
                        };
                        if (statusColors[status]) {
                            data.cell.styles.textColor = statusColors[status];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    if (data.section === 'body' && data.column.index === 5) {
                        data.cell.styles.textColor = [37, 99, 235];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    if (data.section === 'body' && data.column.index === 7) {
                        const balance = data.cell.raw as number;
                        data.cell.styles.textColor = balance > 0 ? [220, 38, 38] : [22, 163, 74];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    if (data.section === 'body' && data.column.index === 6) {
                        data.cell.styles.textColor = [22, 163, 74];
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
        let invoices: SalesInvoice[] = [];
        let stats: InvoicePostingStats = {
            totalInvoices: 0,
            totalAmount: 0,
            totalPaid: 0,
            totalBalance: 0,
            draftCount: 0,
            postedCount: 0,
            paidCount: 0,
            cancelledCount: 0,
            unpaidCount: 0,
            partiallyPaidCount: 0,
        };

        if (Array.isArray(data)) {
            invoices = data;
        } else if (data && typeof data === 'object') {
            invoices = Array.isArray(data.invoices) ? data.invoices : [];
            stats = data.stats || stats;
        }

        const totalInvoices = invoices.length;
        const periodName = invoices.find(inv => inv.periodName)?.periodName || 'All Periods';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AR Invoice Posting Report</title>
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
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
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
            font-size: 8px;
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
        .status-draft { color: #ca8a04; font-weight: 600; }
        .status-posted { color: #16a34a; font-weight: 600; }
        .status-unpaid { color: #2563eb; font-weight: 600; }
        .status-partially_paid { color: #ea580c; font-weight: 600; }
        .status-paid { color: #6366f1; font-weight: 600; }
        .status-cancelled { color: #dc2626; font-weight: 600; }
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
            <h1>AR INVOICE POSTING REPORT</h1>
            <div class="period">Period: ${periodName}</div>
            <div class="generated">Generated on ${formatDate(new Date().toISOString())}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card blue">
                <div class="label">Total Invoices</div>
                <div class="value">${stats.totalInvoices}</div>
            </div>
            <div class="summary-card blue">
                <div class="label">Total Amount</div>
                <div class="value">${formatCurrency(stats.totalAmount)}</div>
            </div>
            <div class="summary-card green">
                <div class="label">Total Paid</div>
                <div class="value">${formatCurrency(stats.totalPaid)}</div>
            </div>
            <div class="summary-card red">
                <div class="label">Total Balance</div>
                <div class="value">${formatCurrency(stats.totalBalance)}</div>
            </div>
            <div class="summary-card purple">
                <div class="label">Collection Rate</div>
                <div class="value">${stats.totalAmount > 0 ? ((stats.totalPaid / stats.totalAmount) * 100).toFixed(1) : 0}%</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Status Breakdown</div>
            <table>
                <thead><tr><th>Status</th><th class="text-center">Count</th></tr></thead>
                <tbody>
                    <tr><td class="status-draft">Draft</td><td class="text-center">${stats.draftCount}</td></tr>
                    <tr><td class="status-posted">Posted</td><td class="text-center">${stats.postedCount}</td></tr>
                    <tr><td class="status-unpaid">Unpaid</td><td class="text-center">${stats.unpaidCount}</td></tr>
                    <tr><td class="status-partially_paid">Partially Paid</td><td class="text-center">${stats.partiallyPaidCount}</td></tr>
                    <tr><td class="status-paid">Paid</td><td class="text-center">${stats.paidCount}</td></tr>
                    <tr><td class="status-cancelled">Cancelled</td><td class="text-center">${stats.cancelledCount}</td></tr>
                    <tr style="border-top: 2px solid #1a1a2e; font-weight: 700;"><td>Total</td><td class="text-center">${totalInvoices}</td></tr>
                </tbody>
            </table>
        </div>

        ${invoices.length > 0 ? `
        <div class="section">
            <div class="section-title">Invoice List</div>
            <table>
                <thead>
                    <tr>
                        <th>Invoice #</th>
                        <th>Customer</th>
                        <th>Period</th>
                        <th>Date</th>
                        <th>Due</th>
                        <th class="text-right">Amount</th>
                        <th class="text-right">Paid</th>
                        <th class="text-right">Balance</th>
                        <th class="text-center">Status</th>
                        <th class="text-center">Posted At</th>
                        <th>Posted By</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoices.map(inv => `
                        <tr>
                            <td><strong>${inv.invoiceNumber || ''}</strong></td>
                            <td>${inv.customerName || ''}</td>
                            <td>${inv.periodName || ''}</td>
                            <td>${formatDateShort(inv.invoiceDate)}</td>
                            <td>${formatDateShort(inv.dueDate)}</td>
                            <td class="text-right" style="color: #2563eb; font-weight: 600;">${formatCurrency(inv.totalAmount || 0)}</td>
                            <td class="text-right" style="color: #16a34a; font-weight: 600;">${formatCurrency(inv.paidAmount || 0)}</td>
                            <td class="text-right" style="color: ${(inv.balanceDue || 0) > 0 ? '#dc2626' : '#16a34a'}; font-weight: 600;">${formatCurrency(inv.balanceDue || 0)}</td>
                            <td class="text-center"><span class="status-${(inv.status || 'draft').toLowerCase()}">${inv.status || 'Draft'}</span></td>
                            <td class="text-center">${inv.postedAt ? formatDateShort(inv.postedAt) : 'Not Posted'}</td>
                            <td>${inv.postedBy || ''}</td>
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

export { InvoicePostingReport as default };