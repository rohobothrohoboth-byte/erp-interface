// src/services/finance/report/voucher.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface VoucherLine {
    id?: string;
    accountId: string;
    accountName?: string;
    accountCode?: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
    periodId?: string;
}

export interface VoucherData {
    id: string;
    voucherNumber: string;
    voucherType: 'Payment' | 'Receipt' | 'Journal' | 'Contra' | 'Transfer';
    vendorId?: string;
    vendorName?: string;
    voucherDate: string;
    description?: string;
    totalDebit: number;
    totalCredit: number;
    status: 'Draft' | 'Pending' | 'Approved' | 'Posted' | 'Rejected' | 'Void';
    periodId?: string;
    periodName?: string;
    lines: VoucherLine[];
    approvedBy?: string;
    approvedAt?: string;
    postedBy?: string;
    postedAt?: string;
    dateAdd: string;
    dateMod?: string;
    rowVersion?: string;
}

export interface VoucherStats {
    totalVouchers: number;
    totalAmount: number;
    draftCount: number;
    pendingCount: number;
    approvedCount: number;
    postedCount: number;
    rejectedCount: number;
    voidCount: number;
    paymentCount: number;
    receiptCount: number;
    journalCount: number;
}

function formatCurrency(amount: number): string {
    if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
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

export class VoucherReport {
    static generatePDF(
        vouchers: VoucherData[],
        stats: VoucherStats,
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

        // HEADER
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(companyName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('VOUCHER REPORT', pageWidth / 2, yPos, { align: 'center' });
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

        // Summary Cards
        const cardWidth = (pageWidth - margin * 2 - 20) / 6;
        const cardHeight = 28;
        const cards = [
            { label: 'Total Vouchers', amount: stats.totalVouchers, color: '#2563eb', isCurrency: false },
            { label: 'Total Amount', amount: stats.totalAmount, color: '#2563eb', isCurrency: true },
            { label: 'Posted', amount: stats.postedCount, color: '#16a34a', isCurrency: false },
            { label: 'Pending', amount: stats.pendingCount, color: '#ca8a04', isCurrency: false },
            { label: 'Rejected', amount: stats.rejectedCount, color: '#dc2626', isCurrency: false },
            { label: 'Approval Rate', amount: stats.totalVouchers > 0 ? ((stats.approvedCount + stats.postedCount) / stats.totalVouchers) * 100 : 0, color: '#7c3aed', isCurrency: false, isPercentage: true },
        ];

        cards.forEach((card, index) => {
            const x = margin + index * (cardWidth + 4);
            const rgb = hexToRgb(card.color);

            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(229, 231, 235);
            doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, 'FD');

            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text(card.label, x + cardWidth / 2, yPos + 8, { align: 'center' });

            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(rgb.r, rgb.g, rgb.b);
            const displayValue = card.isCurrency
                ? formatCurrency(card.amount as number)
                : card.isPercentage
                    ? (card.amount as number).toFixed(1) + '%'
                    : String(card.amount);
            doc.text(displayValue, x + cardWidth / 2, yPos + 22, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // Status Breakdown
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Status Breakdown', margin, yPos);
        yPos += 6;

        const statusData = [
            ['Draft', stats.draftCount.toString()],
            ['Pending', stats.pendingCount.toString()],
            ['Approved', stats.approvedCount.toString()],
            ['Posted', stats.postedCount.toString()],
            ['Rejected', stats.rejectedCount.toString()],
            ['Void', stats.voidCount.toString()],
            ['Total', stats.totalVouchers.toString()],
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Status', 'Count']],
            body: statusData,
            margin: { left: margin, right: margin },
            styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, textColor: [30, 41, 59] },
            headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 8 },
            columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 40, halign: 'center' } },
        });

        yPos = (doc as any).lastAutoTable?.finalY || yPos + 30;
        yPos += 8;

        // Vouchers Table
        if (vouchers.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Voucher List', margin, yPos);
            yPos += 6;

            const tableData = vouchers.map(v => [
                v.voucherNumber || '',
                v.voucherType || 'Journal',
                v.vendorName || '',
                v.periodName || '',
                formatDateShort(v.voucherDate),
                v.totalDebit || 0,
                v.totalCredit || 0,
                v.status || 'Draft',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Voucher #', 'Type', 'Vendor', 'Period', 'Date', 'Debit', 'Credit', 'Status']],
                body: tableData,
                margin: { left: margin, right: margin },
                styles: { fontSize: 7, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }, textColor: [30, 41, 59] },
                headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7 },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 20, halign: 'center' },
                    5: { cellWidth: 25, halign: 'right' },
                    6: { cellWidth: 25, halign: 'right' },
                    7: { cellWidth: 20, halign: 'center' },
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;
        }

        // Footer
        const totalPages = doc.internal.pages.length - 1;
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

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

    static generateHTML(data: any, companyName: string = 'RST ERP'): string {
        // Implementation similar to other reports
        return `<html>...</html>`;
    }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 0, g: 0, b: 0 };
}

export default VoucherReport;