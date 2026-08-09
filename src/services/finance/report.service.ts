// src/services/finance/report.service.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

export interface ReportOptions {
    title: string;
    subtitle?: string;
    companyName?: string;
    dateRange?: string;
    showFooter?: boolean;
    showPageNumbers?: boolean;
    orientation?: 'portrait' | 'landscape';
    fontSize?: number;
    pageSize?: 'a4' | 'letter' | 'legal';
    margins?: { top: number; bottom: number; left: number; right: number };
}

export interface TableColumn {
    header: string;
    accessor: string;
    align?: 'left' | 'center' | 'right';
    width?: number;
    format?: (value: any) => string;
}

export interface PDFGenerationResult {
    blob: Blob;
    pageCount: number;
    fileSize: number;
}

export class ReportService {
    private static companyName = 'RST ERP System';
    private static companyLogo?: string;

    static setCompanyName(name: string): void {
        this.companyName = name;
    }

    static setCompanyLogo(logo: string): void {
        this.companyLogo = logo;
    }

    // ============================================================
    // GENERATE PDF FROM HTML - FIXED VERSION
    // ============================================================
    static async generatePDFFromHTML(
        htmlContent: string,
        filename: string = 'report.pdf'
    ): Promise<PDFGenerationResult> {
        const startTime = performance.now();

        // Create container
        const container = document.createElement('div');
        container.innerHTML = htmlContent;

        // ✅ CRITICAL FIX: Match the HTML template's max-width
        // The template uses max-width: 1000px, so we set container to match
        const CONTAINER_WIDTH = 1000; // Match the template's max-width
        const PADDING = 40;

        Object.assign(container.style, {
            position: 'fixed',
            left: '-9999px',
            top: '0',
            width: `${CONTAINER_WIDTH + PADDING * 2}px`, // 1080px total
            padding: `${PADDING}px`,
            backgroundColor: '#ffffff',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#1a1a2e',
            boxSizing: 'border-box',
            display: 'block',
        });

        document.body.appendChild(container);

        try {
            // Wait for rendering
            await new Promise(resolve => setTimeout(resolve, 500));

            // Get content height
            const contentHeight = container.scrollHeight;
            console.log(`📊 Container: ${CONTAINER_WIDTH}px × ${contentHeight}px`);

            // Render to canvas with matching dimensions
            const canvas = await html2canvas(container, {
                scale: 2, // High quality (2x)
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: CONTAINER_WIDTH + PADDING * 2,
                height: contentHeight,
                windowWidth: CONTAINER_WIDTH + PADDING * 2,
                windowHeight: contentHeight,
                onclone: (clonedDoc: Document) => {
                    this.sanitizeStyles(clonedDoc);
                },
            });

            console.log(`📊 Canvas: ${canvas.width}×${canvas.height}px`);

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true,
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;

            // Calculate image dimensions to fit A4
            const availableWidth = pageWidth - margin * 2;
            const imgWidth = availableWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            console.log(`📊 PDF: ${pageWidth}×${pageHeight}mm, Image: ${imgWidth}×${imgHeight}mm`);

            const imgData = canvas.toDataURL('image/png', 1.0);

            if (imgHeight <= pageHeight - margin * 2) {
                // Single page - centered
                const yOffset = (pageHeight - imgHeight) / 2;
                pdf.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
            } else {
                // Multi-page
                const pageContentHeight = pageHeight - margin * 2;
                const pixelsPerMm = canvas.width / imgWidth;
                const pagePixels = pageContentHeight * pixelsPerMm;

                let yPosition = 0;
                let pageNum = 0;

                while (yPosition < canvas.height) {
                    if (pageNum > 0) {
                        pdf.addPage();
                    }

                    const currentPagePixels = Math.min(pagePixels, canvas.height - yPosition);
                    const currentPageHeightMm = currentPagePixels / pixelsPerMm;

                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvas.width;
                    pageCanvas.height = currentPagePixels;

                    const ctx = pageCanvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(
                            canvas,
                            0,
                            yPosition,
                            canvas.width,
                            currentPagePixels,
                            0,
                            0,
                            canvas.width,
                            currentPagePixels
                        );

                        pdf.addImage(
                            pageCanvas.toDataURL('image/png', 1.0),
                            'PNG',
                            margin,
                            margin,
                            imgWidth,
                            currentPageHeightMm
                        );
                    }

                    yPosition += currentPagePixels;
                    pageNum++;
                }
            }

            const blob = pdf.output('blob');
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            console.log(`📊 PDF generated in ${duration}s | ${(blob.size / 1024).toFixed(2)} KB`);

            return {
                blob,
                pageCount: pdf.internal.pages.length - 1,
                fileSize: blob.size,
            };
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            if (container.parentNode) {
                document.body.removeChild(container);
            }
        }
    }

    // ============================================================
    // SANITIZE STYLES
    // ============================================================
    private static sanitizeStyles(clonedDoc: Document): void {
        const styles = clonedDoc.querySelectorAll('style');
        styles.forEach((style: HTMLStyleElement) => {
            if (style.textContent) {
                style.textContent = style.textContent
                    .replace(/oklch\([^)]*\)/g, '#2563eb')
                    .replace(/color-mix\([^)]*\)/g, '#2563eb')
                    .replace(/print-color-adjust:\s*exact/g, 'print-color-adjust: exact !important')
                    .replace(/-webkit-print-color-adjust:\s*exact/g, '-webkit-print-color-adjust: exact !important');
            }
        });

        // Fix any inline styles that might cause issues
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el: Element) => {
            if (el instanceof HTMLElement) {
                // Ensure backgrounds are preserved
                if (el.style.backgroundColor && !el.style.backgroundColor.includes('!important')) {
                    el.style.setProperty('background-color', el.style.backgroundColor, 'important');
                }
            }
        });
    }

    // ============================================================
    // GENERATE PDF FROM DATA (DIRECT, NO HTML)
    // ============================================================
    static generatePDFFromData(
        title: string,
        data: any[],
        columns: TableColumn[],
        options: ReportOptions = {}
    ): jsPDF {
        const {
            subtitle = '',
            companyName = this.companyName,
            dateRange = '',
            showFooter = true,
            showPageNumbers = true,
            orientation = 'portrait',
            fontSize = 10,
            pageSize = 'a4',
            margins = { top: 20, bottom: 15, left: 15, right: 15 },
        } = options;

        const doc = new jsPDF({
            orientation,
            unit: 'mm',
            format: pageSize,
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = margins.left;
        const contentWidth = pageWidth - margin * 2;

        let yPos = margins.top;

        // --- HEADER ---
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(companyName, margin, yPos);
        yPos += 10;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin, yPos);
        yPos += 8;

        if (subtitle) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(subtitle, margin, yPos);
            yPos += 6;
        }

        if (dateRange) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`Period: ${dateRange}`, margin, yPos);
            yPos += 6;
        }

        // --- DIVIDER ---
        doc.setDrawColor(203, 213, 225);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // --- TABLE ---
        const tableHeaders = columns.map(c => c.header);
        const tableRows = data.map(item =>
            columns.map(col => {
                const value = item[col.accessor];
                return col.format ? col.format(value) : (value !== undefined ? String(value) : '');
            })
        );

        autoTable(doc, {
            head: [tableHeaders],
            body: tableRows,
            startY: yPos,
            theme: 'striped',
            styles: {
                fontSize,
                cellPadding: 4,
                textColor: [30, 41, 59],
                lineColor: [203, 213, 225],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [51, 65, 85],
                textColor: [255, 255, 255],
                fontSize: fontSize + 1,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            columnStyles: columns.reduce((acc, col, index) => {
                acc[index] = {
                    halign: col.align || 'left',
                    cellWidth: col.width ? (col.width * contentWidth) / 100 : 'auto',
                };
                return acc;
            }, {} as Record<number, any>),
        });

        // --- FOOTER ---
        if (showFooter) {
            const totalPages = doc.internal.pages.length - 1;
            const dateStr = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);

                doc.setDrawColor(203, 213, 225);
                doc.line(margin, pageHeight - margins.bottom, pageWidth - margin, pageHeight - margins.bottom);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(148, 163, 184);

                doc.text(companyName, margin, pageHeight - margins.bottom + 6);

                doc.text(
                    `Generated: ${dateStr}`,
                    pageWidth / 2,
                    pageHeight - margins.bottom + 6,
                    { align: 'center' }
                );

                if (showPageNumbers) {
                    doc.text(
                        `Page ${i} of ${totalPages}`,
                        pageWidth - margin,
                        pageHeight - margins.bottom + 6,
                        { align: 'right' }
                    );
                }
            }
        }

        return doc;
    }

    // ============================================================
    // DOWNLOAD METHODS
    // ============================================================
    static downloadPDF(doc: jsPDF, filename: string): void {
        doc.save(filename);
    }

    static downloadBlobAsPDF(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}