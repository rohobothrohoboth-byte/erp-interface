// src/services/finance/report/consolidation.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface EntityData {
    id: string;
    code: string;
    name: string;
    type: string;
    country: string;
    currency: string;
    consolidationMethod: string;
    ownershipPercentage: number;
    revenue: number;
    expenses: number;
    profit: number;
    assets: number;
    liabilities: number;
    equity: number;
    status: string;
}

export interface ConsolidationGroupData {
    id: string;
    name: string;
    parentEntityName: string;
    entityNames: string[];
    periodName?: string;
    status: string;
    consolidationDate: string;
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
}

export interface EliminationEntryData {
    description: string;
    entityName: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    type: string;
}

export interface ConsolidationStats {
    totalEntities: number;
    totalGroups: number;
    activeEntities: number;
    completedGroups: number;
    totalRevenue: number;
    totalProfit: number;
    totalAssets: number;
    totalEquity: number;
    eliminationCount: number;
    eliminationAmount: number;
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

export class ConsolidationReport {
    static generatePDF(
        entities: EntityData[],
        groups: ConsolidationGroupData[],
        eliminations: EliminationEntryData[],
        stats: ConsolidationStats,
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
        doc.text('CONSOLIDATION REPORT', pageWidth / 2, yPos, { align: 'center' });
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
        const cardWidth = (pageWidth - margin * 2 - 25) / 7;
        const cardHeight = 28;
        const cards = [
            { label: 'Entities', amount: stats.totalEntities, color: '#2563eb', isCurrency: false },
            { label: 'Groups', amount: stats.totalGroups, color: '#7c3aed', isCurrency: false },
            { label: 'Total Revenue', amount: stats.totalRevenue, color: '#16a34a', isCurrency: true },
            { label: 'Total Profit', amount: stats.totalProfit, color: '#059669', isCurrency: true },
            { label: 'Total Assets', amount: stats.totalAssets, color: '#2563eb', isCurrency: true },
            { label: 'Total Equity', amount: stats.totalEquity, color: '#7c3aed', isCurrency: true },
            { label: 'Eliminations', amount: stats.eliminationCount, color: '#dc2626', isCurrency: false },
        ];

        cards.forEach((card, index) => {
            const x = margin + index * (cardWidth + 4);
            const rgb = hexToRgb(card.color);

            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(229, 231, 235);
            doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, 'FD');

            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text(card.label, x + cardWidth / 2, yPos + 7, { align: 'center' });

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(rgb.r, rgb.g, rgb.b);
            const displayValue = card.isCurrency ? formatCurrency(card.amount as number) : String(card.amount);
            doc.text(displayValue, x + cardWidth / 2, yPos + 21, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // Entities Table
        if (entities.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Entities', margin, yPos);
            yPos += 6;

            const tableData = entities.map(e => [
                e.code || '',
                e.name || '',
                e.type || '',
                e.country || '',
                e.currency || '',
                e.consolidationMethod || '',
                `${e.ownershipPercentage}%`,
                e.status || 'Active',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Code', 'Name', 'Type', 'Country', 'Currency', 'Method', 'Ownership', 'Status']],
                body: tableData,
                margin: { left: margin, right: margin },
                styles: { fontSize: 7, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }, textColor: [30, 41, 59] },
                headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7 },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 20 },
                    4: { cellWidth: 15 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 20, halign: 'center' },
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
        return `<html>...</html>`;
    }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 0, g: 0, b: 0 };
}

export default ConsolidationReport;