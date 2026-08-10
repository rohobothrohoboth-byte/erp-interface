// src/pages/finance/ar/PageInvoicePosting.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReportExport } from '@/shared/hooks/useReportExport';
import { showToast } from '@/shared/layout/layout';
import {
    InvoiceHeader,
    InvoiceStats,
    InvoiceFilters,
    InvoiceTable,
    InvoiceViewModal,
    InvoicePostModal,
    InvoiceExportModal,
    InvoiceAttachments,
} from '@/modules/finance/pages/ar/components/index';
import { useInvoiceData } from '@/modules/finance/pages/ar/hooks/useInvoiceData';
import { useInvoicePosting } from '@/modules/finance/pages/ar/hooks/useInvoicePosting';
import type { SalesInvoice, PostingData } from '@/modules/finance/pages/ar/types/invoice.types';
import { ITEMS_PER_PAGE } from '@/modules/finance/pages/ar/constants/invoice.constants';
import { getFilesByReference, downloadFileinvoice, uploadFile } from '@/modules/file/services/fileManagement/fileManagementApi';

const PageInvoicePosting: React.FC = () => {
    // State
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [postModalOpen, setPostModalOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Custom Hooks
    const {
        invoices,
        filteredInvoices,
        stats,
        customers,
        accounts,
        periods,
        loading,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        periodFilter,
        setPeriodFilter,
        fetchData,
        fetchPeriods,
    } = useInvoiceData();

    const {
        postingData,
        setPostingData,
        isPosting,
        setDefaultAccounts,
        confirmPostInvoice,
    } = useInvoicePosting(accounts, periods, fetchData);

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('invoice-posting');

    // Effects
    useEffect(() => {
        fetchPeriods();
    }, []);

    useEffect(() => {
        fetchData();
    }, [periodFilter]);

    useEffect(() => {
        if (accounts.length > 0) {
            setDefaultAccounts(accounts);
        }
    }, [accounts]);

    // Handlers
    const handleViewInvoice = async (invoice: SalesInvoice) => {
        setSelectedInvoice(invoice);
        setViewModalOpen(true);
        await fetchAttachmentsForInvoice(invoice.id);
    };

    const handlePostInvoice = (invoice: SalesInvoice) => {
        setSelectedInvoice(invoice);
        setPostingData({
            ...postingData,
            postingDate: new Date().toISOString().split('T')[0],
            description: `Posting invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
            periodId: invoice.periodId || postingData.periodId || '',
        });
        setPostModalOpen(true);
    };

    const handlePostingDataChange = (data: Partial<PostingData>) => {
        setPostingData(prev => ({ ...prev, ...data }));
    };

    const handleConfirmPost = async () => {
        const success = await confirmPostInvoice(selectedInvoice);
        if (success) {
            setPostModalOpen(false);
        }
    };

    // Attachment Handlers
    const fetchAttachmentsForInvoice = async (invoiceId: string) => {
        try {
            setLoadingAttachments(true);
            const response = await getFilesByReference('invoice', invoiceId, 'invoice_attachment');
            let attachmentsData = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    attachmentsData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    attachmentsData = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    attachmentsData = response.data.$values;
                }
            }
            setAttachments(attachmentsData);
        } catch (error) {
            console.error('Error fetching attachments:', error);
        } finally {
            setLoadingAttachments(false);
        }
    };

    // ✅ Update the download handler to return the blob
    const handleDownloadAttachment = async (attachment: any) => {
        try {
            console.log('📥 Downloading attachment:', attachment);
            const blob = await downloadFileinvoice(attachment.id);

            if (!blob || blob.size === 0) {
                showToast.error('File is empty or corrupted');
                return null;
            }

            // ✅ For preview, return the blob
            return blob;
        } catch (error: any) {
            console.error('Failed to download attachment:', error);
            showToast.error(error?.message || 'Failed to download attachment');
            return null;
        }
    };

    // ✅ Separate download function for actual downloads (with save dialog)
    const handleDownloadAndSave = async (attachment: any) => {
        try {
            const blob = await downloadFileinvoice(attachment.id);

            if (!blob || blob.size === 0) {
                showToast.error('File is empty or corrupted');
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast.success('File downloaded successfully');
        } catch (error: any) {
            console.error('Failed to download:', error);
            showToast.error(error?.message || 'Failed to download file');
        }
    };

    // ✅ File upload handler
    const handleFileUpload = async (files: FileList) => {
        if (!selectedInvoice) {
            showToast.error('No invoice selected');
            return;
        }

        try {
            setUploadingFiles(true);
            const fileArray = Array.from(files);

            for (const file of fileArray) {
                if (file.size > 10 * 1024 * 1024) {
                    showToast.error(`${file.name} exceeds 10MB limit`);
                    continue;
                }

                const allowedTypes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];

                if (!allowedTypes.includes(file.type)) {
                    showToast.error(`${file.name} is not a supported file type`);
                    continue;
                }

                await uploadFile({
                    file,
                    module: 'invoice',
                    referenceId: selectedInvoice.id,
                    category: 'invoice_attachment',
                    documentType: file.type.includes('pdf') ? 'PDF' : 'Image',
                    description: `Attachment for invoice ${selectedInvoice.invoiceNumber}`,
                    isPublic: false,
                    isShared: false,
                    sharingLevel: 'Private',
                });
                showToast.success(`Uploaded ${file.name}`);
            }

            await fetchAttachmentsForInvoice(selectedInvoice.id);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error: any) {
            showToast.error(error.response?.data?.message || 'Failed to upload files');
        } finally {
            setUploadingFiles(false);
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <InvoiceHeader
                title="AR Invoice Posting"
                subtitle="Post sales invoices to General Ledger"
                onRefresh={() => handleRefresh(fetchData)}
                onExport={() => setIsExportModalOpen(true)}
                onPrint={() => handlePrintReport({
                    invoices: filteredInvoices,
                    stats,
                    periodName: periods.find(p => p.id === periodFilter)?.name || 'All Periods'
                })}
                isRefreshing={loading}
                isExporting={exporting}
                isPrintDisabled={filteredInvoices.length === 0}
                isExportDisabled={filteredInvoices.length === 0}
            />

            {/* Stats */}
            <InvoiceStats stats={stats} />

            {/* Filters */}
            <InvoiceFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                periodFilter={periodFilter}
                onPeriodChange={setPeriodFilter}
                periods={periods}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
            />

            {/* Table */}
            <InvoiceTable
                invoices={paginatedInvoices}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                onView={handleViewInvoice}
                onPost={handlePostInvoice}
                popoverOpen={popoverOpen}
                onPopoverChange={setPopoverOpen}
            />


            <InvoiceViewModal
                isOpen={viewModalOpen}
                onOpenChange={setViewModalOpen}
                invoice={selectedInvoice}
                attachments={attachments}
                loadingAttachments={loadingAttachments}
                onPost={() => {
                    setViewModalOpen(false);
                    if (selectedInvoice) handlePostInvoice(selectedInvoice);
                }}
                onUpload={handleFileUpload}
                onDownload={handleDownloadAttachment}
                onDownloadAndSave={handleDownloadAndSave}

                uploadingFiles={uploadingFiles}
                fileInputRef={fileInputRef}
            />



            {/* Post Modal */}
            <InvoicePostModal
                isOpen={postModalOpen}
                onOpenChange={setPostModalOpen}
                invoice={selectedInvoice}
                postingData={postingData}
                onPostingDataChange={handlePostingDataChange}
                onConfirm={handleConfirmPost}
                isPosting={isPosting}
                accounts={accounts}
                periods={periods}
            />

            {/* Export Modal */}
            <InvoiceExportModal
                isOpen={isExportModalOpen}
                onOpenChange={setIsExportModalOpen}
                exportFormat={exportFormat}
                onFormatChange={setExportFormat}
                onExport={() => handleExport({
                    invoices: filteredInvoices,
                    stats,
                    periodName: periods.find(p => p.id === periodFilter)?.name || 'All Periods'
                })}
                isExporting={exporting}
                stats={stats}
                periodName={periods.find(p => p.id === periodFilter)?.name || 'All Periods'}
                statusFilter={statusFilter}
                totalFiltered={filteredInvoices.length}
            />
        </motion.div>
    );
};

export default PageInvoicePosting;