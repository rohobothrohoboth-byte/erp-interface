import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '../../ui/dialog';
import { FiscalYearManagementHeader } from './FiscYearHeader';
import { AddFiscalYearModal } from './AddFiscYearModal';
import { ViewFiscModal } from './ViewFiscModal';
import { EditFiscModal } from './EditFiscModal';
import { DeleteFiscModal } from './DeleteFiscModal';
import { FiscalYearTable } from './FiscYearTable';
import { FiscYearSearch } from './FiscYearSearch';
import {
  useFiscalYears,
  useCreateFiscalYear,
  useUpdateFiscalYear,
  useDeleteFiscalYear,
} from '../../../services/core/fiscalyear/fisc.queries';
import type { FiscYearListDto, AddFiscYearDto, EditFiscYearDto, UUID } from '../../../types/core/fisc';
import ActiveFisc from './ActFiscYear';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getDefaultFiscalYear = (): AddFiscYearDto => ({
  name: '',
  dateStart: new Date().toISOString(),
  dateEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
});

export default function FiscYearSection() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [newYear, setNewYear] = useState<AddFiscYearDto>(getDefaultFiscalYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<FiscYearListDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const itemsPerPage = 10;

  const { data: years = [], isLoading, error: queryError, refetch } = useFiscalYears();

  const createMutation = useCreateFiscalYear({
    onSuccess: () => {
      setFormError(null);
      setAddModalOpen(false);
      setCurrentPage(1);
      setNewYear(getDefaultFiscalYear());
    },
    onError: (error) => setFormError(error.message || 'Failed to create fiscal year'),
  });

  const updateMutation = useUpdateFiscalYear({
    onSuccess: () => { setFormError(null); setEditModalOpen(false); setSelectedYear(null); },
    onError: (error) => setFormError(error.message || 'Failed to update fiscal year'),
  });

  const deleteMutation = useDeleteFiscalYear({
    onSuccess: () => {
      setFormError(null);
      setDeleteModalOpen(false);
      setSelectedYear(null);
      if (paginatedYears.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
    },
    onError: (error) => setFormError(error.message || 'Failed to delete fiscal year'),
  });

  // Filter by search term
  const filteredYears = useMemo(() => {
    if (!searchTerm.trim()) return years;
    const lower = searchTerm.toLowerCase();
    return years.filter(year =>
        year.name.toLowerCase().includes(lower) ||
        (year.isActive === '0' ? 'active' : 'inactive').includes(lower)
    );
  }, [years, searchTerm]);

  const activeYear = useMemo(() => years.find((y) => y.isActive === '0') || null, [years]);
  const totalPages = Math.ceil(filteredYears.length / itemsPerPage);
  const paginatedYears = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredYears.slice(start, start + itemsPerPage);
  }, [filteredYears, currentPage]);

  const displayError = queryError?.message || formError;

  const clearErrors = () => {
    setFormError(null);
    if (queryError) refetch();
  };

  const handleRefresh = () => refetch();

  const handleViewHistory = () => {
    navigate('/core/fiscal-year/history');
  };

  return (
      <div className="space-y-5">
        {/* Header - with working History button */}
        <FiscalYearManagementHeader
            setDialogOpen={setAddModalOpen}
            onViewHistory={handleViewHistory}
            totalItems={years.length}
        />

        {/* Active Fiscal Year */}
        <ActiveFisc
            activeYear={activeYear}
            loading={isLoading}
            error={displayError}
            onViewDetails={(year) => { setSelectedYear(year); setViewModalOpen(true); }}
        />

        {/* Error Message */}
        {displayError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
            <span className="text-sm text-red-700 dark:text-red-400">
              {displayError.includes("load") ? (
                  <>
                    Failed to load fiscal years.{' '}
                    <button
                        onClick={handleRefresh}
                        className="underline hover:text-red-800 font-medium"
                    >
                      Try again
                    </button>
                  </>
              ) : (
                  displayError
              )}
            </span>
                <button onClick={clearErrors} className="text-red-700 dark:text-red-400 hover:text-red-900 font-bold text-lg ml-4">×</button>
              </div>
            </div>
        )}

        {/* Search */}
        <FiscYearSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400" />
            </div>
        )}

        {/* Table */}
        {!isLoading && filteredYears.length > 0 && (
            <FiscalYearTable
                years={paginatedYears}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredYears.length}
                onPageChange={setCurrentPage}
                onViewDetails={(year) => { setSelectedYear(year); setViewModalOpen(true); }}
                onEdit={(year) => { setSelectedYear(year); setEditModalOpen(true); }}
                onDelete={(year) => { setSelectedYear(year); setDeleteModalOpen(true); }}
            />
        )}

        {/* Empty State */}
        {!isLoading && filteredYears.length === 0 && !displayError && (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No fiscal years found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {searchTerm ? "Try adjusting your search" : "Click 'Add Fiscal Year' to create one"}
              </p>
            </div>
        )}

        {/* Modals */}
        <AddFiscalYearModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            newYear={newYear}
            setNewYear={setNewYear}
            onAddFiscalYear={async () => { setFormError(null); await createMutation.mutateAsync(newYear); }}
        />

        <ViewFiscModal fiscalYear={selectedYear} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />

        <EditFiscModal
            fiscalYear={selectedYear}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={async (data: EditFiscYearDto) => { setFormError(null); await updateMutation.mutateAsync(data); }}
        />

        <DeleteFiscModal
            fiscalYear={selectedYear}
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={async () => { if (selectedYear) { setFormError(null); await deleteMutation.mutateAsync(selectedYear.id as UUID); } }}
        />
      </div>
  );
}