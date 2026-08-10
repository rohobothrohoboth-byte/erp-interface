// src/services/finance/report/costControlling.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CostCenterData {
    id: string;
    code: string;
    name: string;
    type: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
    variancePercentage: number;
    status: string;
    periodName?: string;
    manager?: string;
}

export interface ProfitCenterData {
    id: string;
    code: string;
    name: string;
    type: string;
    revenueAmount: number;
    costAmount: number;
    profitAmount: number;
    profitMargin: number;
    status: string;
    periodName?: string;
    manager?: string;
}

export interface InternalOrderData {
    id: string;
    code: string;
    name: string;
    type: string;
    budgetAmount: number;
    actualAmount: number;
    availableAmount: number;
    priority: string;
    status: string;
    periodName?: string;
    responsiblePerson?: string;
}

export interface COStats {
    totalCostCenters: number;
    totalProfitCenters: number;
    totalInternalOrders: number;
    activeCostCenters: number;
    activeProfitCenters: number;
    activeOrders: number;
    totalBudget: number;
    totalActual: number;
    totalVariance: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    avgProfitMargin: number;
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

export class CostControllingReport {
    static generatePDF(
        costCenters: CostCenterData[],
        profitCenters: ProfitCenterData[],
        internalOrders: InternalOrderData[],
        stats: COStats,
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
        doc.text('COST CONTROLLING REPORT', pageWidth / 2, yPos, { align: 'center' });
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
            { label: 'Cost Centers', amount: stats.totalCostCenters, color: '#2563eb', isCurrency: false },
            { label: 'Profit Centers', amount: stats.totalProfitCenters, color: '#16a34a', isCurrency: false },
            { label: 'Internal Orders', amount: stats.totalInternalOrders, color: '#7c3aed', isCurrency: false },
            { label: 'Total Budget', amount: stats.totalBudget, color: '#2563eb', isCurrency: true },
            { label: 'Total Actual', amount: stats.totalActual, color: '#ea580c', isCurrency: true },
            { label: 'Total Variance', amount: stats.totalVariance, color: '#dc2626', isCurrency: true },
            { label: 'Profit Margin', amount: stats.avgProfitMargin, color: '#059669', isCurrency: false, isPercentage: true },
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

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(rgb.r, rgb.g, rgb.b);
            const displayValue = card.isCurrency
                ? formatCurrency(card.amount as number)
                : card.isPercentage
                    ? (card.amount as number).toFixed(1) + '%'
                    : String(card.amount);
            doc.text(displayValue, x + cardWidth / 2, yPos + 21, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // Cost Centers Table
        if (costCenters.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Cost Centers', margin, yPos);
            yPos += 6;

            const tableData = costCenters.map(c => [
                c.code || '',
                c.name || '',
                c.type || '',
                c.periodName || '',
                c.budgetAmount || 0,
                c.actualAmount || 0,
                c.variance || 0,
                c.variancePercentage || 0,
                c.status || 'Active',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Code', 'Name', 'Type', 'Period', 'Budget', 'Actual', 'Variance', 'Var %', 'Status']],
                body: tableData,
                margin: { left: margin, right: margin },
                styles: { fontSize: 7, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }, textColor: [30, 41, 59] },
                headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7 },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 25, halign: 'right' },
                    5: { cellWidth: 25, halign: 'right' },
                    6: { cellWidth: 25, halign: 'right' },
                    7: { cellWidth: 20, halign: 'right' },
                    8: { cellWidth: 20, halign: 'center' },
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;
        }

        // Profit Centers Table
        if (profitCenters.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Profit Centers', margin, yPos);
            yPos += 6;

            const tableData = profitCenters.map(p => [
                p.code || '',
                p.name || '',
                p.type || '',
                p.periodName || '',
                p.revenueAmount || 0,
                p.costAmount || 0,
                p.profitAmount || 0,
                p.profitMargin || 0,
                p.status || 'Active',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Code', 'Name', 'Type', 'Period', 'Revenue', 'Cost', 'Profit', 'Margin %', 'Status']],
                body: tableData,
                margin: { left: margin, right: margin },
                styles: { fontSize: 7, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }, textColor: [30, 41, 59] },
                headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7 },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 25, halign: 'right' },
                    5: { cellWidth: 25, halign: 'right' },
                    6: { cellWidth: 25, halign: 'right' },
                    7: { cellWidth: 20, halign: 'right' },
                    8: { cellWidth: 20, halign: 'center' },
                },
            });

            yPos = (doc as any).lastAutoTable?.finalY || yPos + 20;
            yPos += 8;
        }

        // Internal Orders Table
        if (internalOrders.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Internal Orders', margin, yPos);
            yPos += 6;

            const tableData = internalOrders.map(o => [
                o.code || '',
                o.name || '',
                o.type || '',
                o.periodName || '',
                o.budgetAmount || 0,
                o.actualAmount || 0,
                o.availableAmount || 0,
                o.priority || 'Medium',
                o.status || 'Planning',
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Code', 'Name', 'Type', 'Period', 'Budget', 'Actual', 'Available', 'Priority', 'Status']],
                body: tableData,
                margin: { left: margin, right: margin },
                styles: { fontSize: 7, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }, textColor: [30, 41, 59] },
                headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7 },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 25, halign: 'right' },
                    5: { cellWidth: 25, halign: 'right' },
                    6: { cellWidth: 25, halign: 'right' },
                    7: { cellWidth: 20, halign: 'center' },
                    8: { cellWidth: 20, halign: 'center' },
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

export default CostControllingReport;