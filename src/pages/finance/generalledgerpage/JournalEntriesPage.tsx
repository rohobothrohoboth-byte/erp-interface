// pages/finance/generalledgerpage/JournalEntriesPage.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Plus, RefreshCw, BarChart3, Download,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useJournalEntries } from '../../../hooks/finance/useJournalEntries';
import { journalEntryHelpers } from '../../../utils/finance/journalEntryHelpers';
import { showToast } from '../../../layout/layout';
import { Label } from '../../../components/ui/label';

// Components
import { JournalEntrySummaryCards } from '../../../components/finance/journal-entries/JournalEntrySummaryCards';
import { JournalEntryFilters } from '../../../components/finance/journal-entries/journalEntryFilters';
import { JournalEntryList } from '../../../components/finance/journal-entries/JournalEntryList';
import { JournalEntryForm } from '../../../components/finance/journal-entries/JournalEntryForm';
import { JournalEntryActionModal } from '../../../components/finance/journal-entries/JournalEntryActionModals';
import { JournalEntryViewModal } from '../../../components/finance/journal-entries/JournalEntryViewModal';

import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../components/ui/dialog';

const JournalEntriesPage: React.FC = () => {
  const {
    // State
    entries,
    accounts,
    costCenters,
    financialPeriods,
    branches,      // ✅ ADD THIS
    employees,     // ✅ ADD THIS
    summary,
    loading,
    isRefreshing,
    isSubmitting,
    currentPage,
    totalCount,
    totalPages,
    selectedEntry,
    filters,
    setFilters,
    formData,
    modals,
    rejectReason,
    setRejectReason,
    reverseReason,
    setReverseReason,
    reverseDate,
    setReverseDate,
    exportFormat,
    setExportFormat,
    exporting,

    // Actions
    fetchData,
    createEntry,
    updateEntry,
    deleteEntry,
    postEntry,
    unpostEntry,
    approveEntry,
    rejectEntry,
    reverseEntry,
    exportEntries,
    openModal,
    closeModal,
    openEditModal,
    openAddModal,
    setFormField,
    addLine,
    removeLine,
    updateLine,
    setSelectedEntry,
    setCurrentPage,
    departments,
  } = useJournalEntries();

  // Handlers
  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      filterStatus: 'All',
      filterType: 'All',
      selectedPeriod: 'all',
    });
  };

  const handleExport = async () => {
    await exportEntries();
  };

  // Loading state
  if (loading && !entries.length) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading journal entries...</p>
          </div>
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
              <p className="text-sm text-gray-500">
                {totalCount} entries • {summary?.postedEntries || 0} posted
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
                onClick={() => openModal('summary')}
                variant="outline"
                className="flex items-center gap-2"
            >
              <BarChart3 size={16} />
              Summary
            </Button>
            <Button
                onClick={() => openModal('export')}
                variant="outline"
                className="flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </Button>
            <Button
                onClick={fetchData}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} />
              New Entry
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <JournalEntrySummaryCards summary={summary} />

        {/* Filters */}
        <JournalEntryFilters
            filters={filters}
            onFiltersChange={setFilters}
            financialPeriods={financialPeriods}
            onClearFilters={handleClearFilters}
        />

        {/* Entries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <JournalEntryList
              entries={entries}
              accounts={accounts}
              // ✅ Pass filter props
              filterStatus={filters.filterStatus}
              filterType={filters.filterType}
              searchTerm={filters.searchTerm}
              selectedPeriod={filters.selectedPeriod}
              onView={(entry) => {
                setSelectedEntry(entry);
                openModal('view');
              }}
              onEdit={openEditModal}
              onPost={(entry) => {
                setSelectedEntry(entry);
                openModal('post');
              }}
              onUnpost={(entry) => {
                setSelectedEntry(entry);
                openModal('unpost');
              }}
              onApprove={(entry) => {
                setSelectedEntry(entry);
                openModal('approve');
              }}
              onReject={(entry) => {
                setSelectedEntry(entry);
                setRejectReason('');
                openModal('reject');
              }}
              onReverse={(entry) => {
                setSelectedEntry(entry);
                setReverseDate(new Date().toISOString().split('T')[0]);
                setReverseReason('');
                openModal('reverse');
              }}
              onDelete={(entry) => {
                setSelectedEntry(entry);
                openModal('delete');
              }}
          />

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* ============ MODALS ============ */}

        {/* Add Entry Modal */}
        <Dialog open={modals.add} onOpenChange={(open) => !open && closeModal('add')}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                New Journal Entry
              </DialogTitle>
              <DialogDescription>
                Create a new journal entry with multiple lines. <span className="text-red-500">*</span> Required fields
              </DialogDescription>
            </DialogHeader>
            <JournalEntryForm
                formData={formData}
                onFormChange={setFormField}
                onAddLine={addLine}
                onRemoveLine={removeLine}
                onUpdateLine={updateLine}
                accounts={accounts}
                costCenters={costCenters}
                branches={branches}      // ✅ Pass branches
                employees={employees}    // ✅ Pass employees
                financialPeriods={financialPeriods}
                isSubmitting={isSubmitting}
                onSubmit={() => createEntry(formData)}
                onCancel={() => closeModal('add')}
                mode="add"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Entry Modal */}
        <Dialog open={modals.edit} onOpenChange={(open) => !open && closeModal('edit')}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Edit Journal Entry
              </DialogTitle>
              <DialogDescription>
                Update the journal entry details. <span className="text-red-500">*</span> Required fields
              </DialogDescription>
            </DialogHeader>
            <JournalEntryForm
                formData={formData}
                onFormChange={setFormField}
                onAddLine={addLine}
                onRemoveLine={removeLine}
                onUpdateLine={updateLine}
                accounts={accounts}
                costCenters={costCenters}
                branches={branches}      // ✅ Pass branches
                employees={employees}    // ✅ Pass employees
                financialPeriods={financialPeriods}
                isSubmitting={isSubmitting}
                onSubmit={() => updateEntry(formData)}
                onCancel={() => closeModal('edit')}
                mode="edit"
            />
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={modals.view} onOpenChange={(open) => !open && closeModal('view')}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <JournalEntryViewModal
                entry={selectedEntry}
                accounts={accounts}
                costCenters={costCenters}
                departments={departments}  // ✅ Pass costCenters as departments
                branches={branches}
                employees={employees}
                onClose={() => closeModal('view')}
                onEdit={() => {
                  closeModal('view');
                  openEditModal(selectedEntry);
                }}
            />
          </DialogContent>
        </Dialog>

        {/* Action Modals */}
        <JournalEntryActionModal
            open={modals.delete}
            onOpenChange={(open) => !open && closeModal('delete')}
            entry={selectedEntry}
            isSubmitting={isSubmitting}
            onConfirm={deleteEntry}
            type="delete"
        />

        <JournalEntryActionModal
            open={modals.post}
            onOpenChange={(open) => !open && closeModal('post')}
            entry={selectedEntry}
            isSubmitting={isSubmitting}
            onConfirm={postEntry}
            type="post"
        />

        <JournalEntryActionModal
            open={modals.unpost}
            onOpenChange={(open) => !open && closeModal('unpost')}
            entry={selectedEntry}
            isSubmitting={isSubmitting}
            onConfirm={unpostEntry}
            type="unpost"
        />

        <JournalEntryActionModal
            open={modals.approve}
            onOpenChange={(open) => !open && closeModal('approve')}
            entry={selectedEntry}
            isSubmitting={isSubmitting}
            onConfirm={approveEntry}
            type="approve"
        />

        <JournalEntryActionModal
            open={modals.reject}
            onOpenChange={(open) => !open && closeModal('reject')}
            entry={selectedEntry}
            isSubmitting={isSubmitting}
            onConfirm={rejectEntry}
            type="reject"
            rejectReason={rejectReason}
            onRejectReasonChange={setRejectReason}
        />

        <JournalEntryActionModal
            open={modals.reverse}
            onOpenChange={(open) => !open && closeModal('reverse')}
            entry={selectedEntry}
            isSubmitting={isSubmitting}
            onConfirm={reverseEntry}
            type="reverse"
            reverseReason={reverseReason}
            onReverseReasonChange={setReverseReason}
            reverseDate={reverseDate}
            onReverseDateChange={setReverseDate}
        />

        {/* Summary Modal */}
        <Dialog open={modals.summary} onOpenChange={(open) => !open && closeModal('summary')}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Journal Entry Summary
              </DialogTitle>
            </DialogHeader>
            {summary && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-xl font-bold">{summary.totalEntries}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Posted</p>
                      <p className="text-xl font-bold text-green-600">{summary.postedEntries}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Unposted</p>
                      <p className="text-xl font-bold text-yellow-600">{summary.unpostedEntries}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-gray-500">Total Debit</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {journalEntryHelpers.formatCurrency(summary.totalDebit)}
                      </p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-lg">
                      <p className="text-xs text-gray-500">Total Credit</p>
                      <p className="text-lg font-bold text-rose-600">
                        {journalEntryHelpers.formatCurrency(summary.totalCredit)}
                      </p>
                    </div>
                  </div>
                  {summary.periodName && (
                      <p className="text-sm text-gray-500">Period: {summary.periodName}</p>
                  )}
                  {summary.entriesByType && Object.keys(summary.entriesByType).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">By Type</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(summary.entriesByType).map(([type, count]) => (
                              <span key={type} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {type}: {count}
                              </span>
                          ))}
                        </div>
                      </div>
                  )}
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => closeModal('summary')}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Modal */}
        <Dialog open={modals.export} onOpenChange={(open) => !open && closeModal('export')}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-indigo-600" />
                Export Journal Entries
              </DialogTitle>
              <DialogDescription>
                Export the journal entries in your preferred format.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Export Format</Label>
                <Select
                    value={exportFormat}
                    onValueChange={(value: any) => setExportFormat(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV - Comma separated values</SelectItem>
                    <SelectItem value="json">JSON - Structured data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Summary</Label>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Total Entries: <strong>{totalCount}</strong></p>
                  <p>
                    Period: <strong>
                    {filters.selectedPeriod !== 'all'
                        ? financialPeriods.find(p => p.id === filters.selectedPeriod)?.name || 'Selected'
                        : 'All Periods'}
                  </strong>
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => closeModal('export')}>Cancel</Button>
              <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleExport}
                  disabled={exporting || !entries || entries.length === 0}
              >
                {exporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export {exportFormat.toUpperCase()}
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
  );
};

export default JournalEntriesPage;