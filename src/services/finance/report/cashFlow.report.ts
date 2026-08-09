// src/services/finance/report/cashFlow.report.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CashFlowData {
    startDate: string;
    endDate: string;
    operatingActivities: {
        items: Array<{ code: string; name: string; amount: number; type: 'inflow' | 'outflow' }>;
        total: number;
    };
    investingActivities: {
        items: Array<{ code: string; name: string; amount: number; type: 'inflow' | 'outflow' }>;
        total: number;
    };
    financingActivities: {
        items: Array<{ code: string; name: string; amount: number; type: 'inflow' | 'outflow' }>;
        total: number;
    };
    netCashFlow: number;
    beginningCash: number;
    endingCash: number;
    cashChange: number;
    generatedDate?: string;
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

export class CashFlowReport {
    // ============================================================
    // ✅ GENERATE PDF DIRECTLY (NO HTML)
    // ============================================================
    static generatePDF(data: CashFlowData, companyName: string = 'RST ERP System'): jsPDF {
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

        const isPositive = data.netCashFlow >= 0;

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
        doc.text('CASH FLOW STATEMENT', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(
            `For the period ${formatDate(data.startDate)} – ${formatDate(data.endDate)}`,
            pageWidth / 2,
            yPos,
            { align: 'center' }
        );
        yPos += 6;

        // Status badge - ✅ FIXED: No "&" character
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isPositive ? 22 : 155, isPositive ? 101 : 27, isPositive ? 52 : 27);
        const statusText = isPositive ? '✓ POSITIVE CASH FLOW' : '⚠ NEGATIVE CASH FLOW';
        doc.text(statusText, pageWidth / 2, yPos, { align: 'center' });
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
            { label: 'Beginning Cash', amount: data.beginningCash, color: '#2563eb' },
            { label: 'Net Cash Flow', amount: data.netCashFlow, color: isPositive ? '#16a34a' : '#dc2626' },
            { label: 'Ending Cash', amount: data.endingCash, color: '#7c3aed' },
            { label: 'Cash Change', amount: data.cashChange, color: data.cashChange >= 0 ? '#16a34a' : '#dc2626' },
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

        yPos += cardHeight + 14;

        // ============================================
        // OPERATING ACTIVITIES
        // ============================================
        yPos = this.renderCashFlowSection(
            doc,
            'OPERATING ACTIVITIES',
            data.operatingActivities.items,
            data.operatingActivities.total,
            margin,
            yPos,
            pageWidth
        );

        // ============================================
        // INVESTING ACTIVITIES
        // ============================================
        yPos = this.renderCashFlowSection(
            doc,
            'INVESTING ACTIVITIES',
            data.investingActivities.items,
            data.investingActivities.total,
            margin,
            yPos,
            pageWidth
        );

        // ============================================
        // FINANCING ACTIVITIES
        // ============================================
        yPos = this.renderCashFlowSection(
            doc,
            'FINANCING ACTIVITIES',
            data.financingActivities.items,
            data.financingActivities.total,
            margin,
            yPos,
            pageWidth
        );

        // ============================================
        // NET CASH FLOW (Highlighted)
        // ============================================
        if (yPos > pageHeight - 30) {
            doc.addPage();
            yPos = 20;
        }

        const bgColor = isPositive ? '#f0fdf4' : '#fef2f2';
        const bgRgb = hexToRgb(bgColor);
        const textColor = isPositive ? '#16a34a' : '#dc2626';
        const textRgb = hexToRgb(textColor);

        doc.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
        doc.setDrawColor(isPositive ? 22 : 220, isPositive ? 163 : 38, isPositive ? 74 : 38);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 16, 2, 2, 'FD');

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
        doc.text('NET CASH FLOW', margin + 8, yPos + 11);
        doc.text(
            formatCurrency(data.netCashFlow),
            pageWidth - margin - 8,
            yPos + 11,
            { align: 'right' }
        );

        yPos += 22;

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
    // HELPER: Render Cash Flow Section
    // ============================================================
    private static renderCashFlowSection(
        doc: jsPDF,
        title: string,
        items: any[],
        total: number,
        margin: number,
        yPos: number,
        pageWidth: number
    ): number {
        const pageHeight = doc.internal.pageSize.getHeight();

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

        // Subtitle with total - ✅ FIXED: Proper spacing
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const totalStr = formatCurrency(total);
        doc.text(`Total: ${totalStr}`, pageWidth - margin, yPos - 2, {
            align: 'right',
        });
        yPos += 5;

        // Divider
        doc.setDrawColor(203, 213, 225);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;

        if (items.length === 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(148, 163, 184);
            doc.text('No transactions found', margin, yPos);
            yPos += 8;
            return yPos;
        }

        // ✅ FIXED: Proper table data with correct column widths
        const tableData = items.map(item => [
            `${item.code || ''} ${item.name || ''}`,
            formatCurrency(item.amount),
            item.type ? item.type.toUpperCase() : '',
        ]);

        // Add total row
        const totalColor = total >= 0 ? [22, 163, 74] : [220, 38, 38];
        tableData.push([
            { content: 'TOTAL', styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
            { content: formatCurrency(total), styles: { fontStyle: 'bold', textColor: totalColor } },
            { content: '', styles: { fontStyle: 'bold' } },
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Account', 'Amount', 'Type']],
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
                2: { cellWidth: 25, halign: 'center' },
            },
            didParseCell: (data) => {
                // Color code the type column
                if (data.section === 'body' && data.column.index === 2) {
                    const type = data.cell.raw as string;
                    if (type === 'INFLOW') {
                        data.cell.styles.textColor = [22, 163, 74];
                        data.cell.styles.fontStyle = 'bold';
                    } else if (type === 'OUTFLOW') {
                        data.cell.styles.textColor = [220, 38, 38];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            },
        });

        const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;
        return finalY + 6;
    }

    // ============================================================
    // ✅ GENERATE HTML (for print preview) - FIXED
    // ============================================================
    static generateHTML(data: any, companyName: string = 'RST ERP'): string {
        const periodDisplay = `For the period ${formatDate(data.startDate)} to ${formatDate(data.endDate)}`;
        const isPositive = data.netCashFlow >= 0;

        // ✅ FIXED: Safely access data with fallbacks
        const operatingItems = data?.operatingActivities?.items || [];
        const operatingTotal = data?.operatingActivities?.total || 0;
        const investingItems = data?.investingActivities?.items || [];
        const investingTotal = data?.investingActivities?.total || 0;
        const financingItems = data?.financingActivities?.items || [];
        const financingTotal = data?.financingActivities?.total || 0;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cash Flow Statement</title>
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
                    border-bottom: 3px solid #1a1a2e;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .report-header .company-name {
                    font-size: 22px;
                    font-weight: 700;
                    color: #1a1a2e;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                .report-header h1 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 6px;
                    letter-spacing: 1px;
                }
                .report-header .period {
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 4px;
                    font-weight: 400;
                }
                .report-header .status {
                    display: inline-block;
                    margin-top: 10px;
                    padding: 6px 20px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: ${isPositive ? '#d4edda' : '#f8d7da'};
                    color: ${isPositive ? '#155724' : '#721c24'};
                    border: 1px solid ${isPositive ? '#86efac' : '#fca5a5'};
                }
                .cash-summary {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .cash-card {
                    background: #f8fafc;
                    border-radius: 10px;
                    padding: 14px 16px;
                    text-align: center;
                    border: 1px solid #e9edf2;
                }
                .cash-card .label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #64748b;
                    margin-bottom: 4px;
                }
                .cash-card .value {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0f172a;
                }
                .cash-card.blue .value { color: #2563eb; }
                .cash-card.green .value { color: #16a34a; }
                .cash-card.purple .value { color: #7c3aed; }
                .cash-card.red .value { color: #dc2626; }
                .section {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }
                .section-title {
                    padding: 10px 16px;
                    background: #f1f5f9;
                    font-weight: 700;
                    font-size: 14px;
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #e5e7eb;
                }
                .section-title .total {
                    color: #2563eb;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 16px 6px 32px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 13px;
                }
                .item-row:last-child {
                    border-bottom: none;
                }
                .item-row .type {
                    font-size: 10px;
                    padding: 1px 10px;
                    border-radius: 10px;
                    font-weight: 600;
                }
                .item-row .type.inflow {
                    background: #d4edda;
                    color: #155724;
                }
                .item-row .type.outflow {
                    background: #f8d7da;
                    color: #721c24;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 16px;
                    font-weight: 700;
                    font-size: 14px;
                    border-top: 2px solid #1a1a2e;
                    background: #f8fafc;
                }
                .total-row.green { color: #16a34a; }
                .total-row.red { color: #dc2626; }
                .net-cash-section {
                    margin-top: 16px;
                    border: 2px solid ${isPositive ? '#16a34a' : '#dc2626'};
                    border-radius: 8px;
                    overflow: hidden;
                }
                .net-cash-section .total-row {
                    font-size: 18px;
                    padding: 14px 20px;
                    background: ${isPositive ? '#f0fdf4' : '#fef2f2'};
                    color: ${isPositive ? '#16a34a' : '#dc2626'};
                    border-top: none;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 11px;
                    color: #94a3b8;
                    text-align: center;
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
                    .cash-card {
                        background: #f8fafc !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .status {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .item-row .type {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .net-cash-section .total-row {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
                @media (max-width: 768px) {
                    .cash-summary { grid-template-columns: repeat(2, 1fr); }
                    .report-container { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="report-header">
                    <div class="company-name">${companyName}</div>
                    <h1>CASH FLOW STATEMENT</h1>
                    <div class="period">${periodDisplay}</div>
                    <div class="status">${isPositive ? '✓ Positive Cash Flow' : '⚠ Negative Cash Flow'}</div>
                </div>

                <div class="cash-summary">
                    <div class="cash-card blue">
                        <div class="label">Beginning Cash</div>
                        <div class="value">${formatCurrency(data.beginningCash)}</div>
                    </div>
                    <div class="cash-card ${isPositive ? 'green' : 'red'}">
                        <div class="label">Net Cash Flow</div>
                        <div class="value">${formatCurrency(data.netCashFlow)}</div>
                    </div>
                    <div class="cash-card purple">
                        <div class="label">Ending Cash</div>
                        <div class="value">${formatCurrency(data.endingCash)}</div>
                    </div>
                    <div class="cash-card ${data.cashChange >= 0 ? 'green' : 'red'}">
                        <div class="label">Cash Change</div>
                        <div class="value">${formatCurrency(data.cashChange)}</div>
                    </div>
                </div>

                <!-- Operating Activities -->
                <div class="section">
                    <div class="section-title">
                        <span>OPERATING ACTIVITIES</span>
                        <span class="total">${formatCurrency(operatingTotal)}</span>
                    </div>
                    ${operatingItems.map((item: any) => `
                        <div class="item-row">
                            <span>${item.code || ''} - ${item.name || ''}</span>
                            <span>
                                ${formatCurrency(item.amount || 0)}
                                <span class="type ${item.type || 'outflow'}">${(item.type || 'outflow').toUpperCase()}</span>
                            </span>
                        </div>
                    `).join('')}
                    <div class="total-row ${operatingTotal >= 0 ? 'green' : 'red'}">
                        <span>Net Cash from Operating Activities</span>
                        <span>${formatCurrency(operatingTotal)}</span>
                    </div>
                </div>

                <!-- Investing Activities -->
                <div class="section">
                    <div class="section-title">
                        <span>INVESTING ACTIVITIES</span>
                        <span class="total">${formatCurrency(investingTotal)}</span>
                    </div>
                    ${investingItems.map((item: any) => `
                        <div class="item-row">
                            <span>${item.code || ''} - ${item.name || ''}</span>
                            <span>
                                ${formatCurrency(item.amount || 0)}
                                <span class="type ${item.type || 'outflow'}">${(item.type || 'outflow').toUpperCase()}</span>
                            </span>
                        </div>
                    `).join('')}
                    <div class="total-row ${investingTotal >= 0 ? 'green' : 'red'}">
                        <span>Net Cash from Investing Activities</span>
                        <span>${formatCurrency(investingTotal)}</span>
                    </div>
                </div>

                <!-- Financing Activities -->
                <div class="section">
                    <div class="section-title">
                        <span>FINANCING ACTIVITIES</span>
                        <span class="total">${formatCurrency(financingTotal)}</span>
                    </div>
                    ${financingItems.map((item: any) => `
                        <div class="item-row">
                            <span>${item.code || ''} - ${item.name || ''}</span>
                            <span>
                                ${formatCurrency(item.amount || 0)}
                                <span class="type ${item.type || 'outflow'}">${(item.type || 'outflow').toUpperCase()}</span>
                            </span>
                        </div>
                    `).join('')}
                    <div class="total-row ${financingTotal >= 0 ? 'green' : 'red'}">
                        <span>Net Cash from Financing Activities</span>
                        <span>${formatCurrency(financingTotal)}</span>
                    </div>
                </div>

                <!-- Net Cash Flow -->
                <div class="net-cash-section">
                    <div class="total-row">
                        <span>NET CASH FLOW</span>
                        <span>${formatCurrency(data.netCashFlow)}</span>
                    </div>
                </div>

                <div class="footer">
                    Generated on ${new Date().toLocaleString()} • RST ERP System
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

// ✅ Export for compatibility
export { CashFlowReport as default };