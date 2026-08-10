// pages/finance/generalledgerpage/ChartOfAccountsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { showToast } from '@/shared/layout/layout';

// Hooks
import { useChartOfAccounts } from '@/modules/finance/hooks/useChartOfAccounts';
import { useAccountModals } from '@/modules/finance/components/chart-of-accounts/hooks/useAccountModals';

// Components
import {
  AccountHeader,
  AccountSummaryCards,
  AccountFilterBar,
  AccountTable,
  AccountPagination,
  AccountEmptyState,
  AccountFormModal,
  AccountDeleteModal,
  AccountBulkDeleteModal,
  AccountUsageModal,
  AccountViewModal,
  AccountHierarchyModal,
  AccountExportModal,
} from '@/modules/finance/components/chart-of-accounts/index';

// Types
import type { Account, AccountFormData } from '@/modules/finance/types/account.types';

// Constants
const ITEMS_PER_PAGE = 10;

const ChartOfAccountsPage: React.FC = () => {
  // ============================================================
  // HOOKS
  // ============================================================

  const {
    accounts,
    filteredAccounts,
    paginatedAccounts,
    accountCategories,
    departments,
    hierarchy,
    totalCount,
    totalPages,
    loading,
    isRefreshing,
    isSubmitting,
    currentPage,
    selectedIds,
    filters,
    setCurrentPage,
    setSelectedIds,
    setFilters,
    fetchData,
    createAccount,
    updateAccount,
    deleteAccount,
    bulkDeleteAccounts,
    toggleAccountStatus,
    getAccountUsage,
    exportAccounts,
  } = useChartOfAccounts();

  const {
    modals,
    formData,
    selectedAccount,
    usageInfo,
    isUsageLoading,
    exportFormat,
    exporting,
    openAddModal,
    openEditModal,
    openViewModal,
    openDeleteModal,
    openUsageModal,
    openHierarchyModal,
    openExportModal,
    closeModal,
    closeAllModals,
    handleFormChange,
    resetForm,
    setExportFormat,
    handleCloseUsageModal,
    setUsageData, // ✅ Make sure this is available
    setSelectedAccount,
  } = useAccountModals();

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleCreateAccount = useCallback(async () => {
    const success = await createAccount(formData);
    if (success) {
      closeModal('add');
      resetForm();
      showToast.success('Account created successfully');
    }
  }, [createAccount, formData, closeModal, resetForm]);

  const handleUpdateAccount = useCallback(async () => {
    if (!selectedAccount) return;
    const success = await updateAccount(selectedAccount.id, formData);
    if (success) {
      closeModal('edit');
      setSelectedAccount(null);
      resetForm();
      showToast.success('Account updated successfully');
    }
  }, [updateAccount, selectedAccount, formData, closeModal, resetForm, setSelectedAccount]);

  const handleDeleteAccount = useCallback(async () => {
    if (!selectedAccount) return;
    const success = await deleteAccount(selectedAccount.id);
    if (success) {
      closeModal('delete');
      setSelectedAccount(null);
      showToast.success('Account deleted successfully');
    }
  }, [deleteAccount, selectedAccount, closeModal, setSelectedAccount]);

  const handleBulkDelete = useCallback(async () => {
    const success = await bulkDeleteAccounts(selectedIds);
    if (success) {
      closeModal('bulkDelete');
      showToast.success(`${selectedIds.length} accounts deleted successfully`);
    }
  }, [bulkDeleteAccounts, selectedIds, closeModal]);

  const handleToggleStatus = useCallback(async (id: string) => {
    await toggleAccountStatus(id);
  }, [toggleAccountStatus]);

  // ✅ ADD THIS - handleViewUsage function
  const handleViewUsage = useCallback(async (account: Account) => {
    if (!account) return;

    // Open the usage modal
    openUsageModal(account);

    try {
      // Fetch usage data
      const info = await getAccountUsage(account.id);
      setUsageData(info);
    } catch (error) {
      console.error('Error fetching usage info:', error);
      showToast.error('Failed to load usage information');
      setUsageData(null);
    }
  }, [openUsageModal, getAccountUsage, setUsageData]);

  const handleExport = useCallback(async () => {
    if (exporting) return;
    try {
      const params: any = {};
      if (filters.filterType !== 'All') params.type = filters.filterType;
      if (filters.filterStatus !== 'All') params.isActive = filters.filterStatus === 'Active';

      await exportAccounts(params, exportFormat);
      showToast.success(`Exported successfully as ${exportFormat.toUpperCase()}`);
      closeModal('export');
    } catch (error: any) {
      showToast.error(error.message || 'Failed to export accounts');
    }
  }, [exportAccounts, exportFormat, filters, exporting, closeModal]);

  const handleClearFilters = useCallback(() => {
    setFilters({ searchTerm: '', filterType: 'All', filterStatus: 'All' });
  }, [setFilters]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  // Reset selected IDs when filters change
  useEffect(() => {
    setSelectedIds([]);
  }, [filters, setSelectedIds]);

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading && !accounts.length) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading accounts...</p>
          </div>
        </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
      >
        {/* HEADER */}
        <AccountHeader
            totalCount={totalCount}
            categoriesCount={accountCategories.length}
            selectedIds={selectedIds}
            isRefreshing={isRefreshing}
            onRefresh={fetchData}
            onAdd={openAddModal}
            onHierarchy={openHierarchyModal}
            onExport={openExportModal}
            onBulkDelete={() => closeModal('bulkDelete')}
        />

        {/* SUMMARY CARDS */}
        <AccountSummaryCards accounts={accounts} totalCount={totalCount} />

        {/* FILTERS */}
        <AccountFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
        />

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {paginatedAccounts.length === 0 ? (
              <AccountEmptyState
                  searchTerm={filters.searchTerm}
                  onClearFilters={handleClearFilters}
              />
          ) : (
              <>
                <AccountTable
                    accounts={paginatedAccounts}
                    accountCategories={accountCategories} // ✅ Pass categories for lookup
                    selectedIds={selectedIds}
                    onToggleSelection={(id) => {
                      setSelectedIds(prev =>
                          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                      );
                    }}
                    onToggleAll={() => {
                      if (selectedIds.length === paginatedAccounts.length) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(paginatedAccounts.map(a => a.id));
                      }
                    }}
                    onView={openViewModal}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onToggleStatus={handleToggleStatus}
                    onViewUsage={handleViewUsage} // ✅ Now defined
                    allSelected={selectedIds.length === paginatedAccounts.length && paginatedAccounts.length > 0}
                />

                <AccountPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredAccounts.length}
                    pageSize={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                />
              </>
          )}
        </div>

        {/* ========================================================== */}
        {/* MODALS */}
        {/* ========================================================== */}

        {/* Add/Edit Modal */}
        <AccountFormModal
            open={modals.add || modals.edit}
            mode={modals.add ? 'add' : 'edit'}
            account={selectedAccount}
            formData={formData}
            categories={accountCategories}
            departments={departments}
            isSubmitting={isSubmitting}
            onFormChange={handleFormChange}
            onSubmit={modals.add ? handleCreateAccount : handleUpdateAccount}
            onClose={() => {
              closeModal(modals.add ? 'add' : 'edit');
              resetForm();
              setSelectedAccount(null);
            }}
        />

        {/* Delete Modal */}
        <AccountDeleteModal
            open={modals.delete}
            account={selectedAccount}
            isSubmitting={isSubmitting}
            onConfirm={handleDeleteAccount}
            onClose={() => {
              closeModal('delete');
              setSelectedAccount(null);
            }}
        />

        {/* Bulk Delete Modal */}
        <AccountBulkDeleteModal
            open={modals.bulkDelete}
            count={selectedIds.length}
            isSubmitting={isSubmitting}
            onConfirm={handleBulkDelete}
            onClose={() => closeModal('bulkDelete')}
        />

        {/* Usage Modal */}
        <AccountUsageModal
            open={modals.usage}
            usageInfo={usageInfo}
            loading={isUsageLoading}
            onClose={handleCloseUsageModal}
        />

        {/* View Modal */}
        <AccountViewModal
            open={modals.view}
            account={selectedAccount}
            onClose={() => {
              closeModal('view');
              setSelectedAccount(null);
            }}
            onEdit={() => {
              if (selectedAccount) {
                closeModal('view');
                openEditModal(selectedAccount);
              }
            }}
        />

        {/* Hierarchy Modal */}
        <AccountHierarchyModal
            open={modals.hierarchy}
            hierarchy={hierarchy}
            onClose={() => closeModal('hierarchy')}
        />

        {/* Export Modal */}
        <AccountExportModal
            open={modals.export}
            totalCount={totalCount}
            accounts={accounts}
            exportFormat={exportFormat}
            exporting={exporting}
            onExportFormatChange={setExportFormat}
            onExport={handleExport}
            onClose={() => closeModal('export')}
        />
      </motion.div>
  );
};

export default ChartOfAccountsPage;