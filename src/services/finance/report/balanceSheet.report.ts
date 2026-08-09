// src/services/finance/report/balanceSheet.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================
// ✅ INTERFACE
// ============================================================
export interface BalanceSheetData {
    asOfDate: string;
    periodStart: string;
    periodEnd: string;
    assets: {
        currentAssets: any[];
        fixedAssets: any[];
        otherAssets: any[];
        totalCurrentAssets: number;
        totalFixedAssets: number;
        totalOtherAssets: number;
        totalAssets: number;
    };
    liabilities: {
        currentLiabilities: any[];
        longTermLiabilities: any[];
        otherLiabilities: any[];
        totalCurrentLiabilities: number;
        totalLongTermLiabilities: number;
        totalOtherLiabilities: number;
        totalLiabilities: number;
    };
    equity: {
        equityItems: any[];
        totalEquity: number;
    };
    totalLiabilitiesAndEquity: number;
    ratios: {
        currentRatio: number;
        quickRatio: number;
        debtToEquityRatio: number;
        workingCapital: number;
        equityRatio: number;
        debtRatio: number;
    };
    periodType?: string;
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

// ============================================================
// ✅ HTML RENDER HELPERS
// ============================================================

function renderAssetSectionHTML(title: string, items: any[], total: number): string {
    if (!items || items.length === 0) return '';
    return `
    <div class="category-title">
      <span>${title}</span>
      <span>${formatCurrency(total)}</span>
    </div>
    ${items.map((item: any) => `
      <div class="item-row">
        <span>
          <span class="code">${item.code || ''}</span>
          ${item.name || ''}
        </span>
        <span>
          ${formatCurrency(item.amount || 0)}
          <span class="percentage">${((item.percentage || 0)).toFixed(1)}%</span>
        </span>
      </div>
    `).join('')}
  `;
}

function renderLiabilitySectionHTML(title: string, items: any[], total: number): string {
    if (!items || items.length === 0) return '';
    return `
    <div class="category-title">
      <span>${title}</span>
      <span>${formatCurrency(total)}</span>
    </div>
    ${items.map((item: any) => `
      <div class="item-row">
        <span>
          <span class="code">${item.code || ''}</span>
          ${item.name || ''}
        </span>
        <span>
          ${formatCurrency(item.amount || 0)}
          <span class="percentage">${((item.percentage || 0)).toFixed(1)}%</span>
        </span>
      </div>
    `).join('')}
  `;
}

function renderEquitySectionHTML(items: any[]): string {
    if (!items || items.length === 0) return '';
    return items.map((item: any) => `
    <div class="item-row">
      <span>
        <span class="code">${item.code || ''}</span>
        ${item.name || ''}
      </span>
      <span>
        ${formatCurrency(item.amount || 0)}
        <span class="percentage">${((item.percentage || 0)).toFixed(1)}%</span>
      </span>
    </div>
  `).join('');
}

// ============================================================
// ✅ MAIN CLASS - CLEAN & SIMPLE
// ============================================================

export class BalanceSheetReport {
    // ============================================================
    // ✅ GENERATE PDF - SINGLE COLUMN, CLEAN DESIGN
    // ============================================================
    static generatePDF(data: BalanceSheetData, companyName: string = 'RST ERP System'): jsPDF {
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

        const isBalanced = Math.abs((data.assets?.totalAssets || 0) - (data.totalLiabilitiesAndEquity || 0)) < 0.01;

        // Safely access data
        const assets = data.assets || {
            currentAssets: [],
            fixedAssets: [],
            otherAssets: [],
            totalCurrentAssets: 0,
            totalFixedAssets: 0,
            totalOtherAssets: 0,
            totalAssets: 0
        };

        const liabilities = data.liabilities || {
            currentLiabilities: [],
            longTermLiabilities: [],
            otherLiabilities: [],
            totalCurrentLiabilities: 0,
            totalLongTermLiabilities: 0,
            totalOtherLiabilities: 0,
            totalLiabilities: 0
        };

        const equity = data.equity || {
            equityItems: [],
            totalEquity: 0
        };

        const ratios = data.ratios || {
            currentRatio: 0,
            quickRatio: 0,
            debtToEquityRatio: 0,
            workingCapital: 0,
            equityRatio: 0,
            debtRatio: 0
        };

        const periodDisplay = data.periodType === 'custom'
            ? `From ${formatDate(data.periodStart)} to ${formatDate(data.periodEnd)}`
            : `As of ${formatDate(data.asOfDate)}`;

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
        doc.text('BALANCE SHEET', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(periodDisplay, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        // Status
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
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // ============================================
        // RATIOS - SIMPLE 4 COLUMN
        // ============================================
        const cardWidth = (pageWidth - margin * 2 - 12) / 4;
        const cardHeight = 22;

        const ratioCards = [
            { label: 'Current Ratio', value: ratios.currentRatio || 0 },
            { label: 'Quick Ratio', value: ratios.quickRatio || 0 },
            { label: 'Debt to Equity', value: ratios.debtToEquityRatio || 0 },
            { label: 'Working Capital', value: ratios.workingCapital || 0, isCurrency: true },
        ];

        ratioCards.forEach((card, index) => {
            const x = margin + index * (cardWidth + 4);

            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(229, 231, 235);
            doc.roundedRect(x, yPos, cardWidth, cardHeight, 1.5, 1.5, 'FD');

            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text(card.label, x + cardWidth / 2, yPos + 6, { align: 'center' });

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            const displayValue = card.isCurrency
                ? formatCurrency(card.value as number)
                : (card.value as number).toFixed(2);
            doc.text(displayValue, x + cardWidth / 2, yPos + 16, { align: 'center' });
        });

        yPos += cardHeight + 12;

        // ============================================
        // SINGLE COLUMN - CLEAR STRUCTURE
        // ============================================
        const contentWidth = pageWidth - margin * 2;
        const leftX = margin;

        // ============================================
        // ASSETS SECTION
        // ============================================
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('ASSETS', leftX, yPos);
        yPos += 6;

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(leftX, yPos, pageWidth - margin, yPos);
        yPos += 6;

        // Current Assets
        yPos = BalanceSheetReport.renderSectionSimple(
            doc,
            'Current Assets',
            assets.currentAssets || [],
            assets.totalCurrentAssets || 0,
            leftX,
            contentWidth,
            yPos
        );

        // Fixed Assets
        yPos = BalanceSheetReport.renderSectionSimple(
            doc,
            'Fixed Assets',
            assets.fixedAssets || [],
            assets.totalFixedAssets || 0,
            leftX,
            contentWidth,
            yPos
        );

        // Other Assets
        yPos = BalanceSheetReport.renderSectionSimple(
            doc,
            'Other Assets',
            assets.otherAssets || [],
            assets.totalOtherAssets || 0,
            leftX,
            contentWidth,
            yPos
        );

        // Total Assets
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(leftX, yPos, pageWidth - margin, yPos);
        yPos += 4;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Total Assets', leftX + 2, yPos + 4);
        doc.text(
            formatCurrency(assets.totalAssets || 0),
            pageWidth - margin - 2,
            yPos + 4,
            { align: 'right' }
        );
        yPos += 10;

        // ============================================
        // LIABILITIES SECTION
        // ============================================
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('LIABILITIES', leftX, yPos);
        yPos += 6;

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(leftX, yPos, pageWidth - margin, yPos);
        yPos += 6;

        // Current Liabilities
        yPos = BalanceSheetReport.renderSectionSimple(
            doc,
            'Current Liabilities',
            liabilities.currentLiabilities || [],
            liabilities.totalCurrentLiabilities || 0,
            leftX,
            contentWidth,
            yPos
        );

        // Long-Term Liabilities
        yPos = BalanceSheetReport.renderSectionSimple(
            doc,
            'Long-Term Liabilities',
            liabilities.longTermLiabilities || [],
            liabilities.totalLongTermLiabilities || 0,
            leftX,
            contentWidth,
            yPos
        );

        // Other Liabilities
        yPos = BalanceSheetReport.renderSectionSimple(
            doc,
            'Other Liabilities',
            liabilities.otherLiabilities || [],
            liabilities.totalOtherLiabilities || 0,
            leftX,
            contentWidth,
            yPos
        );

        // Total Liabilities
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(leftX, yPos, pageWidth - margin, yPos);
        yPos += 4;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Total Liabilities', leftX + 2, yPos + 4);
        doc.text(
            formatCurrency(liabilities.totalLiabilities || 0),
            pageWidth - margin - 2,
            yPos + 4,
            { align: 'right' }
        );
        yPos += 10;

        // ============================================
        // EQUITY SECTION
        // ============================================
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('EQUITY', leftX, yPos);
        yPos += 6;

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(leftX, yPos, pageWidth - margin, yPos);
        yPos += 6;

        // Equity Items
        const equityItems = equity.equityItems || [];
        equityItems.forEach((item: any) => {
            if (yPos > pageHeight - 16) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            const displayName = `${item.code || ''} ${item.name || ''}`;
            const maxNameLength = 40;
            const truncatedName = displayName.length > maxNameLength
                ? displayName.substring(0, maxNameLength) + '…'
                : displayName;
            doc.text(truncatedName, leftX + 4, yPos + 3.5);
            doc.text(
                formatCurrency(item.amount || 0),
                pageWidth - margin - 2,
                yPos + 3.5,
                { align: 'right' }
            );
            yPos += 7;
        });

        // Total Equity
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(leftX, yPos, pageWidth - margin, yPos);
        yPos += 4;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Total Equity', leftX + 2, yPos + 4);
        doc.text(
            formatCurrency(equity.totalEquity || 0),
            pageWidth - margin - 2,
            yPos + 4,
            { align: 'right' }
        );
        yPos += 10;

        // ============================================
        // TOTAL LIABILITIES & EQUITY
        // ============================================
        doc.setDrawColor(79, 70, 229);
        doc.setLineWidth(1);
        doc.line(leftX, yPos, pageWidth - margin, yPos);
        yPos += 4;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('Total Liabilities & Equity', leftX + 2, yPos + 4);
        doc.text(
            formatCurrency(data.totalLiabilitiesAndEquity || 0),
            pageWidth - margin - 2,
            yPos + 4,
            { align: 'right' }
        );
        yPos += 12;

        // ============================================
        // VERIFICATION
        // ============================================
        if (yPos > pageHeight - 28) {
            doc.addPage();
            yPos = 20;
        }

        const bgColor = isBalanced ? [240, 253, 244] : [254, 242, 242];
        const borderColor = isBalanced ? [34, 197, 94] : [239, 68, 68];
        const textColor2 = isBalanced ? [22, 101, 52] : [153, 27, 27];

        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 16, 2, 2, 'FD');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor2[0], textColor2[1], textColor2[2]);
        doc.text(
            isBalanced ? '✓ Balance Sheet is Balanced' : '⚠ Balance Sheet is Out of Balance',
            margin + 6,
            yPos + 6.5
        );

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        const diff = Math.abs((assets.totalAssets || 0) - (data.totalLiabilitiesAndEquity || 0));
        doc.text(
            `Assets: ${formatCurrency(assets.totalAssets || 0)}  =  Liabilities: ${formatCurrency(liabilities.totalLiabilities || 0)}  +  Equity: ${formatCurrency(equity.totalEquity || 0)}`,
            margin + 6,
            yPos + 12
        );
        if (!isBalanced) {
            doc.text(
                `Difference: ${formatCurrency(diff)}`,
                pageWidth - margin - 6,
                yPos + 12,
                { align: 'right' }
            );
        }

        yPos += 20;

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
            doc.setLineWidth(0.3);
            doc.line(margin, pageHeight_ - 14, pageWidth - margin, pageHeight_ - 14);

            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(148, 163, 184);

            doc.text(companyName, margin, pageHeight_ - 7);
            doc.text(`Generated: ${dateStr}`, pageWidth / 2, pageHeight_ - 7, { align: 'center' });
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight_ - 7, { align: 'right' });
        }

        return doc;
    }

    // ============================================================
    // HELPER: Render Section - Simple & Clean
    // ============================================================
    private static renderSectionSimple(
        doc: jsPDF,
        title: string,
        items: any[],
        total: number,
        x: number,
        width: number,
        yPos: number
    ): number {
        const pageHeight = doc.internal.pageSize.getHeight();

        if (items.length === 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(71, 85, 105);
            doc.text(title, x + 2, yPos + 3.5);
            doc.text(
                formatCurrency(total),
                x + width - 2,
                yPos + 3.5,
                { align: 'right' }
            );
            yPos += 7;
            return yPos;
        }

        // Category title
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text(title, x + 2, yPos + 3.5);
        doc.text(
            formatCurrency(total),
            x + width - 2,
            yPos + 3.5,
            { align: 'right' }
        );
        yPos += 6;

        // Items - indented
        items.forEach((item: any) => {
            if (yPos > pageHeight - 14) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            const displayName = `${item.code || ''} ${item.name || ''}`;
            const maxNameLength = 45;
            const truncatedName = displayName.length > maxNameLength
                ? displayName.substring(0, maxNameLength) + '…'
                : displayName;
            doc.text(truncatedName, x + 6, yPos + 3);
            doc.text(
                formatCurrency(item.amount || 0),
                x + width - 2,
                yPos + 3,
                { align: 'right' }
            );
            yPos += 6;
        });

        return yPos + 1;
    }

    // ============================================================
    // ✅ GENERATE HTML (for print preview)
    // ============================================================
    static generateHTML(data: BalanceSheetData, companyName: string = 'RST ERP'): string {
        const periodDisplay = data.periodType === 'custom'
            ? `From ${formatDate(data.periodStart)} to ${formatDate(data.periodEnd)}`
            : `As of ${formatDate(data.asOfDate)}`;

        const isBalanced = Math.abs((data.assets?.totalAssets || 0) - (data.totalLiabilitiesAndEquity || 0)) < 0.01;

        const ratios = data.ratios || {
            currentRatio: 0,
            quickRatio: 0,
            debtToEquityRatio: 0,
            workingCapital: 0,
            equityRatio: 0,
            debtRatio: 0
        };

        const assets = data.assets || {
            currentAssets: [],
            fixedAssets: [],
            otherAssets: [],
            totalCurrentAssets: 0,
            totalFixedAssets: 0,
            totalOtherAssets: 0,
            totalAssets: 0
        };

        const liabilities = data.liabilities || {
            currentLiabilities: [],
            longTermLiabilities: [],
            otherLiabilities: [],
            totalCurrentLiabilities: 0,
            totalLongTermLiabilities: 0,
            totalOtherLiabilities: 0,
            totalLiabilities: 0
        };

        const equity = data.equity || {
            equityItems: [],
            totalEquity: 0
        };

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Balance Sheet</title>
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
      background: ${isBalanced ? '#dcfce7' : '#fee2e2'};
      color: ${isBalanced ? '#166534' : '#991b1b'};
      border: 1px solid ${isBalanced ? '#86efac' : '#fca5a5'};
    }
    
    .ratios-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 24px;
    }
    .ratio-card {
      padding: 10px 14px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      background: #f8fafc;
      text-align: center;
    }
    .ratio-card .label {
      font-size: 9px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .ratio-card .value {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
      margin-top: 2px;
    }
    
    .section {
      margin-bottom: 4px;
    }
    .section-title {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-weight: 700;
      font-size: 12px;
      color: #475569;
      border-bottom: 1px solid #e5e7eb;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0 3px 16px;
      font-size: 11px;
      border-bottom: 1px solid #f8fafc;
    }
    .item-row .code {
      color: #94a3b8;
      font-size: 10px;
      margin-right: 8px;
    }
    .item-row .percentage {
      color: #94a3b8;
      font-size: 10px;
      width: 50px;
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-weight: 700;
      font-size: 13px;
      border-top: 2px solid #1a1a2e;
      margin-top: 2px;
    }
    .total-row.indigo { color: #4f46e5; }
    
    .verification {
      margin-top: 20px;
      padding: 10px 16px;
      border-radius: 6px;
      border: 1px solid ${isBalanced ? '#22c55e' : '#ef4444'};
      background: ${isBalanced ? '#f0fdf4' : '#fef2f2'};
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .verification .icon { font-size: 18px; }
    .verification .text {
      font-size: 12px;
      font-weight: 500;
      color: ${isBalanced ? '#166534' : '#991b1b'};
    }
    .verification .detail {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
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
      .ratio-card { background: #f8fafc !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .status { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .verification { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
    @media (max-width: 768px) {
      .ratios-grid { grid-template-columns: 1fr 1fr; }
      .report-container { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="report-header">
      <div class="company-name">${companyName}</div>
      <h1>BALANCE SHEET</h1>
      <div class="period">${periodDisplay}</div>
      <div class="status">${isBalanced ? '✓ Balanced' : '⚠ Out of Balance'}</div>
    </div>
    
    <div class="ratios-grid">
      <div class="ratio-card">
        <div class="label">Current Ratio</div>
        <div class="value">${(ratios.currentRatio || 0).toFixed(2)}</div>
      </div>
      <div class="ratio-card">
        <div class="label">Quick Ratio</div>
        <div class="value">${(ratios.quickRatio || 0).toFixed(2)}</div>
      </div>
      <div class="ratio-card">
        <div class="label">Debt to Equity</div>
        <div class="value">${(ratios.debtToEquityRatio || 0).toFixed(2)}</div>
      </div>
      <div class="ratio-card">
        <div class="label">Working Capital</div>
        <div class="value">${formatCurrency(ratios.workingCapital || 0)}</div>
      </div>
    </div>
    
    <!-- ASSETS -->
    <div class="section">
      <div style="font-size: 14px; font-weight: 700; color: #1a1a2e; padding: 6px 0 2px 0;">ASSETS</div>
      <div style="border-bottom: 1px solid #e5e7eb; margin-bottom: 4px;"></div>
      
      <div class="section-title">
        <span>Current Assets</span>
        <span>${formatCurrency(assets.totalCurrentAssets || 0)}</span>
      </div>
      ${assets.currentAssets.map((item: any) => `
        <div class="item-row">
          <span><span class="code">${item.code}</span>${item.name}</span>
          <span>${formatCurrency(item.amount)} <span class="percentage">${(item.percentage || 0).toFixed(1)}%</span></span>
        </div>
      `).join('')}
      
      <div class="section-title">
        <span>Fixed Assets</span>
        <span>${formatCurrency(assets.totalFixedAssets || 0)}</span>
      </div>
      ${assets.fixedAssets.map((item: any) => `
        <div class="item-row">
          <span><span class="code">${item.code}</span>${item.name}</span>
          <span>${formatCurrency(item.amount)} <span class="percentage">${(item.percentage || 0).toFixed(1)}%</span></span>
        </div>
      `).join('')}
      
      <div class="section-title">
        <span>Other Assets</span>
        <span>${formatCurrency(assets.totalOtherAssets || 0)}</span>
      </div>
      ${assets.otherAssets.map((item: any) => `
        <div class="item-row">
          <span><span class="code">${item.code}</span>${item.name}</span>
          <span>${formatCurrency(item.amount)} <span class="percentage">${(item.percentage || 0).toFixed(1)}%</span></span>
        </div>
      `).join('')}
      
      <div class="total-row">
        <span>Total Assets</span>
        <span>${formatCurrency(assets.totalAssets || 0)}</span>
      </div>
    </div>
    
    <!-- LIABILITIES -->
    <div class="section" style="margin-top: 16px;">
      <div style="font-size: 14px; font-weight: 700; color: #1a1a2e; padding: 6px 0 2px 0;">LIABILITIES</div>
      <div style="border-bottom: 1px solid #e5e7eb; margin-bottom: 4px;"></div>
      
      <div class="section-title">
        <span>Current Liabilities</span>
        <span>${formatCurrency(liabilities.totalCurrentLiabilities || 0)}</span>
      </div>
      ${liabilities.currentLiabilities.map((item: any) => `
        <div class="item-row">
          <span><span class="code">${item.code}</span>${item.name}</span>
          <span>${formatCurrency(item.amount)} <span class="percentage">${(item.percentage || 0).toFixed(1)}%</span></span>
        </div>
      `).join('')}
      
      <div class="section-title">
        <span>Long-Term Liabilities</span>
        <span>${formatCurrency(liabilities.totalLongTermLiabilities || 0)}</span>
      </div>
      ${liabilities.longTermLiabilities.map((item: any) => `
        <div class="item-row">
          <span><span class="code">${item.code}</span>${item.name}</span>
          <span>${formatCurrency(item.amount)} <span class="percentage">${(item.percentage || 0).toFixed(1)}%</span></span>
        </div>
      `).join('')}
      
      <div class="section-title">
        <span>Other Liabilities</span>
        <span>${formatCurrency(liabilities.totalOtherLiabilities || 0)}</span>
      </div>
      ${liabilities.otherLiabilities.map((item: any) => `
        <div class="item-row">
          <span><span class="code">${item.code}</span>${item.name}</span>
          <span>${formatCurrency(item.amount)} <span class="percentage">${(item.percentage || 0).toFixed(1)}%</span></span>
        </div>
      `).join('')}
      
      <div class="total-row">
        <span>Total Liabilities</span>
        <span>${formatCurrency(liabilities.totalLiabilities || 0)}</span>
      </div>
    </div>
    
    <!-- EQUITY -->
    <div class="section" style="margin-top: 16px;">
      <div style="font-size: 14px; font-weight: 700; color: #1a1a2e; padding: 6px 0 2px 0;">EQUITY</div>
      <div style="border-bottom: 1px solid #e5e7eb; margin-bottom: 4px;"></div>
      
      ${equity.equityItems.map((item: any) => `
        <div class="item-row">
          <span><span class="code">${item.code}</span>${item.name}</span>
          <span>${formatCurrency(item.amount)} <span class="percentage">${(item.percentage || 0).toFixed(1)}%</span></span>
        </div>
      `).join('')}
      
      <div class="total-row">
        <span>Total Equity</span>
        <span>${formatCurrency(equity.totalEquity || 0)}</span>
      </div>
      
      <div class="total-row indigo" style="border-top: 2px solid #4f46e5; margin-top: 6px; font-size: 14px;">
        <span>Total Liabilities &amp; Equity</span>
        <span>${formatCurrency(data.totalLiabilitiesAndEquity || 0)}</span>
      </div>
    </div>
    
    <div class="verification">
      <span class="icon">${isBalanced ? '✅' : '⚠️'}</span>
      <div>
        <div class="text">${isBalanced ? 'Balance Sheet is Balanced' : 'Balance Sheet is Out of Balance'}</div>
        <div class="detail">
          Assets: ${formatCurrency(assets.totalAssets || 0)}  =  Liabilities: ${formatCurrency(liabilities.totalLiabilities || 0)}  +  Equity: ${formatCurrency(equity.totalEquity || 0)}
          ${!isBalanced ? ` (Difference: ${formatCurrency(Math.abs((assets.totalAssets || 0) - (data.totalLiabilitiesAndEquity || 0)))})` : ''}
        </div>
      </div>
    </div>
    
    <div class="footer">
      Generated on ${new Date().toLocaleString()} • RST ERP System
    </div>
  </div>
</body>
</html>`;
    }
}

// ✅ Export for compatibility
export { BalanceSheetReport as default };