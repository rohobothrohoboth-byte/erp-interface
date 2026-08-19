// src/pages/finance/ap/PagePayments.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/shared/layout/layout';
import {
    PaymentsHeader,
    PaymentsStats,
    PaymentsFilters,
    PaymentsTable,
} from '@/modules/finance/pages/ap/Payments/components/index';

import { usePaymentsData } from '@/modules/finance/pages/ap/Payments/hooks/usePaymentsData';
import { ITEMS_PER_PAGE } from '@/modules/finance/pages/ap/Payments/constants/payment.constants';
import AddPaymentModal from '@/modules/finance/components/accountsPayable/AddPaymentModal/index';
//import AddPaymentModal from '@/modules/finance/components/accountsPayable/AddPaymentModal';
import EditPaymentModal from '@/modules/finance/components/accountsPayable/EditPaymentModal';
import DeletePaymentModal from '@/modules/finance/components/accountsPayable/DeletePaymentModal';
import ViewPaymentModal from '@/modules/finance/components/accountsPayable/ViewPaymentModal';
import { createPayment, updatePayment, deletePayment } from '@/modules/finance/services/finance.api';

const PagePayments: React.FC = () => {
    // State
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [deletingPayment, setDeletingPayment] = useState<any>(null);
    const [viewingPayment, setViewingPayment] = useState<any>(null);
    const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

    // Data Hook
    const {
        filteredPayments,
        stats,
        vendors,
        periods,
        bankAccounts,
        availableInvoices,
        isLoading,
        isRefreshing,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        periodFilter,
        setPeriodFilter,
        refetchAll,
    } = usePaymentsData();

    // Pagination
    const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Handlers
    const handleRefresh = async () => {
        await refetchAll();
        showToast.success('Data refreshed');
    };

    const handleAddPayment = async (data: any) => {
        try {
            // Validation
            if (!data.vendor_id) {
                showToast.error('Vendor is required');
                return;
            }
            if (!data.payment_date) {
                showToast.error('Payment date is required');
                return;
            }
            if (!data.payment_method) {
                showToast.error('Payment method is required');
                return;
            }
            if (!data.total_amount || data.total_amount <= 0) {
                showToast.error('Valid payment amount is required');
                return;
            }
            if (!data.periodId) {
                showToast.error('Financial Period is required');
                return;
            }

            const selectedPeriod = periods?.find((p: any) => p.id === data.periodId);
            if (selectedPeriod?.isClosed) {
                showToast.error('Selected period is closed. Cannot create payment.');
                return;
            }

            if (selectedPeriod) {
                const paymentDate = new Date(data.payment_date);
                const startDate = new Date(selectedPeriod.startDate);
                const endDate = new Date(selectedPeriod.endDate);
                paymentDate.setHours(0, 0, 0, 0);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);
                if (paymentDate < startDate || paymentDate > endDate) {
                    showToast.error(`Payment date must be between ${selectedPeriod.startDate.split('T')[0]} and ${selectedPeriod.endDate.split('T')[0]}`);
                    return;
                }
            }

            const vendor = vendors?.find((v: any) => v.id === data.vendor_id);
            const invoiceIds = data.invoices_to_pay?.map((inv: any) => inv.invoice_id) || [];
            const invoiceId = invoiceIds.length > 0 ? invoiceIds[0] : null;

            let bankAccountId = null;
            if (data.payment_method !== 'Cash') {
                bankAccountId = data.bank_account_id || null;
                if (!bankAccountId) {
                    showToast.error('Please select a bank account');
                    return;
                }
            }

            const payload = {
                paymentDate: new Date(data.payment_date).toISOString(),
                amount: data.total_amount,
                currency: "USD",
                paymentMethod: data.payment_method,
                paymentType: "Purchase",
                reference: data.external_bank_ref || `PAY-${Date.now()}`,
                description: data.description || `Payment to ${vendor?.name || data.vendor_id}`,
                fromAccountId: null,
                toAccountId: data.vendor_id,
                invoiceId: invoiceId,
                paymentStatus: "Pending",
                bankAccountId: bankAccountId,
                branchId: null,
                employeeId: null,
                journalEntryId: null,
                periodId: data.periodId,
            };

            await createPayment(payload);
            showToast.success('Payment created successfully');
            setIsAddModalOpen(false);
            await refetchAll();
        } catch (error: any) {
            console.error('Error creating payment:', error);
            showToast.error(error.response?.data?.message || 'Failed to create payment');
        }
    };

    const handleEditPayment = async (data: any) => {
        if (!editingPayment) return;

        try {
            if (!data.periodId) {
                showToast.error('Financial Period is required.');
                return;
            }

            const selectedPeriod = periods?.find((p: any) => p.id === data.periodId);
            if (selectedPeriod?.isClosed) {
                showToast.error('Selected period is closed. Cannot update payment.');
                return;
            }

            const payload = {
                id: editingPayment.id,
                paymentDate: data.payment_date,
                paymentMethod: data.payment_method,
                amount: editingPayment.amount,
                description: data.description || editingPayment.description,
                reference: data.external_bank_ref,
                bankAccountId: data.bank_account_id,
                periodId: data.periodId,
            };

            await updatePayment(payload);
            showToast.success('Payment updated successfully');
            setEditingPayment(null);
            await refetchAll();
        } catch (error: any) {
            showToast.error(error.response?.data?.message || 'Failed to update payment');
        }
    };

    const handleDeletePayment = async () => {
        if (!deletingPayment) return;
        try {
            await deletePayment(deletingPayment.id);
            showToast.success('Payment deleted successfully');
            setDeletingPayment(null);
            await refetchAll();
        } catch (error: any) {
            showToast.error('Failed to delete payment');
        }
    };

    if (isLoading && filteredPayments.length === 0) {
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
            <PaymentsHeader
                onRefresh={handleRefresh}
                onAdd={() => setIsAddModalOpen(true)}
                isRefreshing={isRefreshing}
            />

            {/* Stats */}
            <PaymentsStats stats={stats} />

            {/* Filters */}
            <PaymentsFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                periodFilter={periodFilter}
                onPeriodChange={setPeriodFilter}
                periods={periods}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
            />

            {/* Table */}
            <PaymentsTable
                payments={paginatedPayments}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                onView={setViewingPayment}
                onEdit={setEditingPayment}
                onDelete={setDeletingPayment}
                onAdd={() => setIsAddModalOpen(true)}
                popoverOpen={popoverOpen}
                onPopoverChange={setPopoverOpen}
            />

            {/* Modals */}
            <AddPaymentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddPayment}
                vendors={vendors || []}
                availableInvoices={availableInvoices}
                periods={periods || []}
                selectedPeriodId={periodFilter !== 'all' ? periodFilter : ''}
            />

            <EditPaymentModal
                isOpen={!!editingPayment}
                onClose={() => setEditingPayment(null)}
                onSubmit={handleEditPayment}
                payment={editingPayment}
                vendors={vendors || []}
                periods={periods || []}
            />

            <DeletePaymentModal
                isOpen={!!deletingPayment}
                onClose={() => setDeletingPayment(null)}
                onConfirm={handleDeletePayment}
                paymentNumber={deletingPayment?.paymentNumber || ''}
            />

            <ViewPaymentModal
                isOpen={!!viewingPayment}
                onClose={() => setViewingPayment(null)}
                payment={viewingPayment}
                getVendorName={(vendorId: string) => {
                    const vendor = vendors?.find((v: any) => v.id === vendorId);
                    return vendor?.name || vendor?.vendorName || 'Unknown Vendor';
                }}
            />
        </motion.div>
    );
};

export default PagePayments;