// src/pages/finance/budget/PageBudget.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { useBudgets } from '@/modules/finance/hooks/useBudgets';
import { useReportExport } from '@/shared/hooks/useReportExport';
import {
  BudgetHeader,
  BudgetStats,
  BudgetFilters,
  BudgetTable,
  BudgetForm,
  BudgetViewModal,
  BudgetDeleteModal,
  BudgetToggleModal,
  BudgetExportModal,
} from '@/modules/finance/pages/budgeting/components/index';
import type { Budget, BudgetLine } from '@/modules/finance/types/budget/types/index';
import { showToast } from '@/shared/layout/layout';

// Default form data
const DEFAULT_FORM_DATA = {
  name: '',
  budgetCodeId: '',  // ✅ Changed from 'code' to 'budgetCodeId'
  description: '',
  totalAmount: 0,
  startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
  endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
  branchId: '',
  departmentId: '',
  periodId: '',
  status: 'Draft',
  lines: [{ accountId: '', allocatedAmount: 0, description: '', periodId: '' }] as BudgetLine[],
};

const PageBudget: React.FC = () => {
  // ✅ Use the custom hook - include budgetCodes and fetchBudgetCodes
  const {
    budgets,
    filteredBudgets,
    paginatedBudgets,
    branches,
    departments,
    accounts,
    periods,
    budgetCodes, // ✅ Add this
    loading,
    isRefreshing,
    isSubmitting,
    currentPage,
    totalPages,
    selectedBudget,
    stats,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPeriodId,
    setFilterPeriodId,
    fetchData,
    fetchPeriods,
    fetchBudgetCodes, // ✅ Add this
    createBudget,
    updateBudget,
    deleteBudget,
    toggleBudgetStatus,
    setSelectedBudget,
    setCurrentPage,
  } = useBudgets();

  // Local state
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [rowVersion, setRowVersion] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [loadingCodes, setLoadingCodes] = useState(true);

  // Export hook
  const {
    exportFormat,
    setExportFormat,
    exporting,
    isExportModalOpen,
    setIsExportModalOpen,
    handlePrintReport,
    handleExport,
    handleRefresh,
    title,
  } = useReportExport('budget');

  // ✅ Fetch periods on mount
  useEffect(() => {
    const loadPeriods = async () => {
      setLoadingPeriods(true);
      try {
        await fetchPeriods();
      } catch (error) {
        console.error('Error loading periods:', error);
      } finally {
        setLoadingPeriods(false);
      }
    };
    loadPeriods();
  }, []);

  // ✅ Fetch budget codes on mount
  useEffect(() => {
    const loadCodes = async () => {
      setLoadingCodes(true);
      try {
        await fetchBudgetCodes();
      } catch (error) {
        console.error('Error loading budget codes:', error);
      } finally {
        setLoadingCodes(false);
      }
    };
    loadCodes();
  }, []);

  // Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: 'bg-green-100 text-green-700 border-green-200',
      Draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Inactive: 'bg-gray-100 text-gray-700 border-gray-200',
      Approved: 'bg-blue-100 text-blue-700 border-blue-200',
      Rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Form handlers
  const resetForm = () => {
    const activePeriod = periods.find((p: any) => !p.isClosed);
    setFormData({
      ...DEFAULT_FORM_DATA,
      periodId: activePeriod?.id || '',
      budgetCodeId: '',  // ✅ Changed from 'code' to 'budgetCodeId'
      lines: [{ accountId: '', allocatedAmount: 0, description: '', periodId: activePeriod?.id || '' }],
    });
    setRowVersion('');
  };


  const handleFormChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLine = () => {
    const activePeriod = periods.find((p: any) => !p.isClosed);
    setFormData({
      ...formData,
      lines: [...formData.lines, {
        accountId: '',
        allocatedAmount: 0,
        description: '',
        periodId: activePeriod?.id || formData.periodId || ''
      }],
    });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length > 1) {
      setFormData({
        ...formData,
        lines: formData.lines.filter((_, i) => i !== index),
      });
    }
  };

  const updateLine = (index: number, field: keyof BudgetLine, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  // Modal handlers
  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  // src/pages/finance/budget/PageBudget.tsx

  const openEditModal = (budget: Budget) => {
    console.log('🔍 [openEditModal] Budget:', budget);
    console.log('🔍 [openEditModal] budgetCodeId:', budget.budgetCodeId);
    console.log('🔍 [openEditModal] budgetCode:', budget.budgetCode);

    setSelectedBudget(budget);
    setFormData({
      name: budget.name,
      budgetCodeId: budget.budgetCodeId || '',  // ✅ Use budgetCodeId
      description: budget.description || '',
      totalAmount: budget.totalAmount,
      startDate: budget.startDate.split('T')[0],
      endDate: budget.endDate.split('T')[0],
      branchId: budget.branchId || '',
      departmentId: budget.departmentId || '',
      periodId: budget.periodId || '',
      status: budget.status,
      lines: budget.lines.map(line => ({
        id: line.id,
        accountId: line.accountId,
        allocatedAmount: line.allocatedAmount,
        description: line.description || '',
        periodId: line.periodId || budget.periodId || '',
      })),
    });
    setRowVersion(budget.rowVersion || '');
    setIsEditModalOpen(true);
  };

  const openViewModal = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsViewModalOpen(true);
  };

  // Submit handlers
  const handleCreateBudget = async () => {
    console.log('🔍 [handleCreateBudget] Form data:', formData);
    console.log('🔍 [handleCreateBudget] BudgetCodeId selected:', formData.budgetCodeId);

    if (!formData.periodId) {
      showToast.error('Please select a financial period');
      return;
    }

    const selectedPeriod = periods.find(p => p.id === formData.periodId);
    if (selectedPeriod?.isClosed) {
      showToast.error('Selected period is closed. Cannot create budget.');
      return;
    }

    if (!formData.budgetCodeId) {
      showToast.error('Please select a budget code');
      return;
    }

    const success = await createBudget(formData);
    if (success) {
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  // src/pages/finance/budget/PageBudget.tsx

  const handleUpdateBudget = async () => {
    if (!selectedBudget) {
      showToast.error('No budget selected');
      return;
    }

    console.log('🔍 [handleUpdateBudget] formData:', formData);
    console.log('🔍 [handleUpdateBudget] budgetCodeId:', formData.budgetCodeId);

    const selectedPeriod = periods.find(p => p.id === formData.periodId);
    if (selectedPeriod?.isClosed) {
      showToast.error('Selected period is closed. Cannot update budget.');
      return;
    }

    if (!formData.budgetCodeId) {
      showToast.error('Please select a budget code');
      return;
    }

    const success = await updateBudget(selectedBudget.id, formData, rowVersion);
    if (success) {
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!selectedBudget) return;
    const success = await deleteBudget(selectedBudget.id);
    if (success) {
      setIsDeleteModalOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedBudget) return;
    const success = await toggleBudgetStatus(selectedBudget.id);
    if (success) {
      setIsToggleModalOpen(false);
    }
  };

  // Loading state
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
        <BudgetHeader
            onRefresh={() => handleRefresh(fetchData)}
            onExport={() => setIsExportModalOpen(true)}
            onPrint={() => handlePrintReport({
              budgets: filteredBudgets,
              stats,
              periodName: periods.find(p => p.id === filterPeriodId)?.name || 'All Periods'
            })}
            onCreate={openAddModal}
            isRefreshing={isRefreshing}
            exporting={exporting}
            hasData={filteredBudgets.length > 0}
        />

        {/* Stats */}
        <BudgetStats stats={stats} />

        {/* Filters */}
        <BudgetFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterPeriodId={filterPeriodId}
            onPeriodChange={setFilterPeriodId}
            periods={periods}
            onClearFilters={() => {
              setSearchTerm('');
              setFilterStatus('All');
              setFilterPeriodId('all');
              fetchData();
            }}
        />

        {/* Table */}
        <BudgetTable
            budgets={paginatedBudgets}
            onView={openViewModal}
            onEdit={openEditModal}
            onToggleStatus={(budget) => {
              setSelectedBudget(budget);
              setIsToggleModalOpen(true);
            }}
            onDelete={(budget) => {
              setSelectedBudget(budget);
              setIsDeleteModalOpen(true);
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredBudgets.length}
            itemsPerPage={10}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
        />

        {/* ✅ Add/Edit Budget Modal */}
        <Dialog
            open={isAddModalOpen || isEditModalOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }
            }}
        >
          <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isAddModalOpen ? (
                    <>
                      <Plus className="h-5 w-5 text-indigo-600" />
                      Create Budget
                    </>
                ) : (
                    <>
                      <Edit className="h-5 w-5 text-indigo-600" />
                      Edit Budget
                    </>
                )}
              </DialogTitle>
              <DialogDescription>
                {isAddModalOpen
                    ? 'Create a new budget with allocation lines.'
                    : 'Update the budget details.'}
              </DialogDescription>
            </DialogHeader>

            <BudgetForm
                formData={formData}
                onFormChange={handleFormChange}
                onLineAdd={addLine}
                onLineRemove={removeLine}
                onLineUpdate={updateLine}
                accounts={accounts}
                branches={branches}
                departments={departments}
                periods={periods}
                budgetCodes={budgetCodes} // ✅ Pass budget codes
                loadingPeriods={loadingPeriods}
                loadingCodes={loadingCodes}
                isSubmitting={isSubmitting}
                onSubmit={isAddModalOpen ? handleCreateBudget : handleUpdateBudget}
                onCancel={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                mode={isAddModalOpen ? 'add' : 'edit'}
                title={isAddModalOpen ? 'Create Budget' : 'Edit Budget'}
                description={isAddModalOpen
                    ? 'Create a new budget with allocation lines.'
                    : 'Update the budget details.'}
            />
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <BudgetViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            budget={selectedBudget}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
        />

        {/* Delete Modal */}
        <BudgetDeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteBudget}
            budgetName={selectedBudget?.name || ''}
            isSubmitting={isSubmitting}
        />

        {/* Toggle Modal */}
        <BudgetToggleModal
            isOpen={isToggleModalOpen}
            onClose={() => setIsToggleModalOpen(false)}
            onConfirm={handleToggleStatus}
            budgetName={selectedBudget?.name || ''}
            currentStatus={selectedBudget?.status || ''}
            isSubmitting={isSubmitting}
        />

        {/* Export Modal */}
        <BudgetExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onExport={() => handleExport({
              budgets: filteredBudgets,
              stats,
              periodName: periods.find(p => p.id === filterPeriodId)?.name || 'All Periods'
            })}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            exporting={exporting}
            budgets={filteredBudgets}
            stats={stats}
            periodName={periods.find(p => p.id === filterPeriodId)?.name || 'All Periods'}
            formatCurrency={formatCurrency}
        />
      </motion.div>
  );
};

export default PageBudget;