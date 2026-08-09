// src/pages/finance/ap/InvoiceEntry.tsx

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReportExport } from '../../../hooks/useReportExport';
import { showToast } from '../../../layout/layout';
import { useAuthStore } from '../../../stores/auth.store';
import { useInvoiceData } from './invoice/hooks/useInvoiceData';
import { useInvoiceForm } from './invoice/hooks/useInvoiceForm';
import { useInvoiceAttachments } from './invoice/hooks/useInvoiceAttachments';
import {
    InvoiceHeader,
    InvoiceStats,
    InvoiceFilters,
    InvoiceTable,
    InvoiceAddModal,
    InvoiceEditModal,
    InvoiceViewModal,
    InvoiceDeleteModal,
    InvoiceAmendmentModal,
    InvoiceExportModal,
} from './invoice/components';
import { ITEMS_PER_PAGE, AMENDMENT_REASONS } from './invoice/constants/invoice.constants';
import { canEditInvoice, canRequestAmendment, buildInvoicePayload } from './invoice/utils/invoice.utils';
import {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getPurchaseOrdersByVendor
} from '../../../services/finance/finance.api';

const InvoiceEntry: React.FC = () => {
    // State
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [amendmentModalOpen, setAmendmentModalOpen] = useState(false);

    // Purchase Orders State
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [loadingPurchaseOrders, setLoadingPurchaseOrders] = useState(false);

    // Auth
    const { role: authRole } = useAuthStore();
    const userRole = authRole || '';
    const normalizedRole = userRole.toLowerCase();

    // Hooks
    const {
        invoices,
        filteredInvoices,
        stats,
        vendors,
        customers,
        periods,
        loading,
        loadingPeriods,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        filterPeriodId,
        setFilterPeriodId,
        dateRange,
        setDateRange,
        fetchData,
        getPeriodStatus,
    } = useInvoiceData();

    const {
        formData,
        setFormData,
        resetForm,
        addItem,
        removeItem,
        updateItem,
        setEditFormData,
        validateForm,
    } = useInvoiceForm();

    const {
        attachments,
        pendingFiles,
        uploadingFiles,
        loadingAttachments,
        fileInputRef,
        editFileInputRef,
        fetchAttachments,
        handleFileUpload,
        handleAddModalFileSelect,
        uploadPendingFiles,
        handleDeleteAttachment,
        handleDownloadAttachment, // ✅ This comes from useInvoiceAttachments
    } = useInvoiceAttachments();

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('invoice-entry');

    const isRefreshing = loading;
    const isAuthorizedToApprove = (): boolean => {
        const authorizedRoles = ['admin', 'financemanager', 'superadmin'];
        return authorizedRoles.includes(normalizedRole);
    };

    // ✅ REMOVED duplicate handleDownloadAttachment - it's already in useInvoiceAttachments

    // ✅ ADD handleDownloadAndSave function
    const handleDownloadAndSave = async (attachment: any) => {
        try {
            const blob = await handleDownloadAttachment(attachment);

            if (!blob || blob.size === 0) {
                showToast.error('File is empty or corrupted');
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.fileName || 'download';
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

    // Fetch Purchase Orders
    const fetchPurchaseOrders = async (vendorId: string) => {
        if (!vendorId) {
            setPurchaseOrders([]);
            return;
        }

        try {
            setLoadingPurchaseOrders(true);
            const response = await getPurchaseOrdersByVendor(vendorId);

            let data = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                }
            }
            setPurchaseOrders(data);
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
            setPurchaseOrders([]);
        } finally {
            setLoadingPurchaseOrders(false);
        }
    };

    // Handlers
    const handleViewInvoice = async (invoice: any) => {
        console.log('📎 Viewing invoice:', invoice.id);
        setSelectedInvoice(invoice);
        setIsViewModalOpen(true);

        // ✅ Fetch attachments for this invoice
        const fetchedAttachments = await fetchAttachments(invoice.id);
        console.log('📎 Fetched attachments for view:', fetchedAttachments);
    };
    const handleFileUploadWithId = (files: FileList, invoiceId: string) => {
        if (!invoiceId) {
            showToast.error('No invoice selected. Please save the invoice first.');
            return;
        }
        handleFileUpload(files, invoiceId);
    };
    const handleEditInvoice = (invoice: any) => {
        if (!canEditInvoice(invoice)) {
            showToast.warning(`Invoice ${invoice.invoiceNumber} is ${invoice.status} and cannot be edited.`);
            return;
        }

        // ✅ Make sure periodId is set
        setSelectedInvoice(invoice);
        setEditFormData(invoice);

        // ✅ Ensure periodId is set in formData
        if (invoice.periodId) {
            setFormData(prev => ({ ...prev, periodId: invoice.periodId }));
        }

        setIsEditModalOpen(true);
        fetchAttachments(invoice.id);

        if (invoice.invoiceType === 'Purchase' && invoice.vendorId) {
            fetchPurchaseOrders(invoice.vendorId);
        }
    };

    // ✅ VALIDATION FUNCTION
    const validateInvoice = (): boolean => {
        const { valid, errors } = validateForm(formData, periods);
        if (!valid) {
            showToast.error(errors.join(', '));
            return false;
        }

        if (!formData.periodId) {
            showToast.error('Financial Period is required');
            return false;
        }

        const selectedPeriod = periods.find(p => p.id === formData.periodId);
        if (selectedPeriod?.isClosed) {
            showToast.error('Selected period is closed. Cannot create/update invoice.');
            return false;
        }

        if (formData.invoiceType === 'Purchase' && !formData.vendorId) {
            showToast.error('Vendor is required for Purchase invoices');
            return false;
        }
        if (formData.invoiceType === 'Sales' && !formData.customerId) {
            showToast.error('Customer is required for Sales invoices');
            return false;
        }

        // Validate all items have description and positive quantity/price
        for (const item of formData.items) {
            if (!item.description || item.description.trim() === '') {
                showToast.error('All items must have a description');
                return false;
            }
            if (item.quantity <= 0) {
                showToast.error('All items must have a quantity greater than 0');
                return false;
            }
            if (item.unitPrice <= 0) {
                showToast.error('All items must have a unit price greater than 0');
                return false;
            }
        }

        return true;
    };

    // ✅ CREATE INVOICE
    const handleAddInvoice = async () => {
        if (!validateInvoice()) return;

        try {
            const payload = buildInvoicePayload({ formData, isUpdate: false });
            console.log('📤 Sending create invoice payload:', JSON.stringify(payload, null, 2));

            const response = await createInvoice(payload);
            const newInvoiceId = response.data?.id || response.id;

            showToast.success('Invoice created successfully');
            setIsAddModalOpen(false);
            resetForm();

            if (pendingFiles.length > 0 && newInvoiceId) {
                await uploadPendingFiles(newInvoiceId);
            }

            await fetchData();
        } catch (error: any) {
            console.error('❌ Error creating invoice:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error data:', error.response?.data);

            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                showToast.error(errors.join(', '));
            } else if (error.response?.data?.message) {
                showToast.error(error.response.data.message);
            } else {
                showToast.error('Failed to create invoice');
            }
        }
    };

    // ✅ UPDATE INVOICE
    const handleUpdateInvoice = async () => {
        if (!selectedInvoice) return;
        if (!validateInvoice()) return;

        try {
            // ✅ Ensure periodId is set
            if (!formData.periodId) {
                const fallbackPeriodId = selectedInvoice.periodId || periods.find(p => !p.isClosed)?.id || '';
                if (fallbackPeriodId) {
                    setFormData(prev => ({ ...prev, periodId: fallbackPeriodId }));
                    // Wait for state update
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }

            const payload = buildInvoicePayload({
                formData,
                invoiceId: selectedInvoice.id,
                rowVersion: selectedInvoice.rowVersion || '',
                isUpdate: true
            });

            console.log('📤 UPDATE INVOICE PAYLOAD:', JSON.stringify(payload, null, 2));
            console.log('📤 periodId in payload:', payload.PeriodId);
            console.log('📤 lines periodId:', payload.Lines && payload.Lines.length > 0 ? payload.Lines[0]?.PeriodId : 'No lines');

            // ✅ Validate payload before sending
            if (!payload.PeriodId) {
                console.error('❌ PeriodId is missing from payload!');
                showToast.error('Period is required. Please select a period.');
                return;
            }

            if (!payload.Lines || payload.Lines.length === 0) {
                console.error('❌ No lines in payload!');
                showToast.error('At least one invoice item is required.');
                return;
            }

            const response = await updateInvoice(payload);
            console.log('✅ Update response:', response);

            showToast.success('Invoice updated successfully');
            setIsEditModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('❌ Error updating invoice:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error data:', error.response?.data);

            if (error.response?.status === 401) {
                showToast.error('Your session has expired. Please log in again.');
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                showToast.error(errors.join(', '));
            } else if (error.response?.data?.message) {
                showToast.error(error.response.data.message);
            } else {
                showToast.error('Failed to update invoice');
            }
        }
    };

    // ✅ DELETE INVOICE
    const handleDeleteInvoice = async () => {
        if (!selectedInvoice) return;
        try {
            await deleteInvoice(selectedInvoice.id);
            showToast.success('Invoice deleted successfully');
            setIsDeleteModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting invoice:', error);
            showToast.error('Failed to delete invoice');
        }
    };

    // ✅ AMENDMENT SUBMIT
    const handleSubmitAmendment = async (data: any) => {
        try {
            console.log('📤 Amendment data:', data);
            showToast.success('Amendment submitted successfully');
            setAmendmentModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('Error submitting amendment:', error);
            showToast.error('Failed to submit amendment');
        }
    };

    // ✅ OPEN ADD MODAL
    const handleOpenAddModal = () => {
        resetForm();
        setPurchaseOrders([]);

        // ✅ Set default period from the filter or first available
        const defaultPeriodId = filterPeriodId !== 'all' ? filterPeriodId : periods.find(p => !p.isClosed)?.id || '';
        if (defaultPeriodId) {
            setFormData(prev => ({ ...prev, periodId: defaultPeriodId }));
        }

        setIsAddModalOpen(true);
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <InvoiceHeader
                title="Invoice Entry"
                subtitle="Create and manage purchase and sales invoices"
                onRefresh={() => handleRefresh(fetchData)}
                onExport={() => setIsExportModalOpen(true)}
                onPrint={() => handlePrintReport({
                    invoices: filteredInvoices,
                    stats,
                    periodName: periods.find(p => p.id === filterPeriodId)?.name || 'All Periods'
                })}
                onAdd={handleOpenAddModal}
                isRefreshing={isRefreshing}
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
                filterType={filterType}
                onTypeChange={setFilterType}
                filterStatus={filterStatus}
                onStatusChange={setFilterStatus}
                dateRange={dateRange}
                onDateFromChange={(date) => setDateRange(prev => ({ ...prev, from: date ? new Date(date) : undefined }))}
                onDateToChange={(date) => setDateRange(prev => ({ ...prev, to: date ? new Date(date) : undefined }))}
                onApplyDateRange={fetchData}
                onClearFilters={() => {
                    setSearchTerm('');
                    setFilterStatus('All');
                    setFilterType('All');
                    setDateRange(undefined);
                    fetchData();
                }}
            />

            {/* Table */}
            <InvoiceTable
                invoices={paginatedInvoices}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                onView={handleViewInvoice}
                onEdit={handleEditInvoice}
                onDelete={(invoice) => {
                    setSelectedInvoice(invoice);
                    setIsDeleteModalOpen(true);
                }}
                canEdit={canEditInvoice}
            />

            {/* Add Modal */}
            <InvoiceAddModal
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                formData={formData}
                setFormData={setFormData}
                vendors={vendors}
                customers={customers}
                periods={periods}
                pendingFiles={pendingFiles}
                uploadingFiles={uploadingFiles}
                fileInputRef={fileInputRef}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onUpdateItem={updateItem}
                onFileSelect={handleAddModalFileSelect}
                onSubmit={handleAddInvoice}
                purchaseOrders={purchaseOrders}
                loadingPurchaseOrders={loadingPurchaseOrders}
                onVendorChange={(vendorId) => {
                    if (formData.invoiceType === 'Purchase' && vendorId) {
                        fetchPurchaseOrders(vendorId);
                    } else {
                        setPurchaseOrders([]);
                    }
                }}
                onCancel={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                    setPurchaseOrders([]);
                }}
                getPeriodStatus={getPeriodStatus}
            />

            {/* Edit Modal */}
            <InvoiceEditModal
                isOpen={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                formData={formData}
                setFormData={setFormData}
                selectedInvoice={selectedInvoice}
                vendors={vendors}
                customers={customers}
                periods={periods}
                attachments={attachments}
                uploadingFiles={uploadingFiles}
                editFileInputRef={editFileInputRef}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onUpdateItem={updateItem}
                onFileUpload={handleFileUploadWithId} // ✅ Use the wrapped function
                onDeleteAttachment={handleDeleteAttachment}
                onDownloadAttachment={handleDownloadAndSave} // ✅ Use download and save
                onSubmit={handleUpdateInvoice}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setPurchaseOrders([]);
                }}
                getPeriodStatus={getPeriodStatus}
                purchaseOrders={purchaseOrders}
                loadingPurchaseOrders={loadingPurchaseOrders}
                onVendorChange={(vendorId) => {
                    if (formData.invoiceType === 'Purchase' && vendorId) {
                        fetchPurchaseOrders(vendorId);
                    } else {
                        setPurchaseOrders([]);
                    }
                }}
            />

            {/* View Modal */}
            <InvoiceViewModal
                isOpen={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                invoice={selectedInvoice}
                attachments={attachments}
                loadingAttachments={loadingAttachments}
                onDownloadAttachment={handleDownloadAttachment} // ✅ Returns blob for preview
                onDownloadAndSave={handleDownloadAndSave} // ✅ Saves file
                onRequestAmendment={() => {
                    setIsViewModalOpen(false);
                    setAmendmentModalOpen(true);
                }}
                canRequestAmendment={canRequestAmendment(selectedInvoice, userRole)}
                isAuthorizedToApprove={isAuthorizedToApprove()}
            />

            {/* Delete Modal */}
            <InvoiceDeleteModal
                isOpen={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                invoice={selectedInvoice}
                onConfirm={handleDeleteInvoice}
            />

            {/* Amendment Modal */}
            <InvoiceAmendmentModal
                isOpen={amendmentModalOpen}
                onOpenChange={setAmendmentModalOpen}
                invoice={selectedInvoice}
                amendmentReasons={AMENDMENT_REASONS}
                onConfirm={handleSubmitAmendment}
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
                    periodName: periods.find(p => p.id === filterPeriodId)?.name || 'All Periods'
                })}
                isExporting={exporting}
                stats={stats}
                periodName={periods.find(p => p.id === filterPeriodId)?.name || 'All Periods'}
                filterStatus={filterStatus}
                filterType={filterType}
                totalFiltered={filteredInvoices.length}
            />
        </motion.div>
    );
};

export default InvoiceEntry;