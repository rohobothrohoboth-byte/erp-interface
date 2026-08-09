import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { FiscalYearTable } from '../../components/core/fiscalyear/FiscYearTable';
import { FiscYearSearch } from '../../components/core/fiscalyear/FiscYearSearch';
import { ViewFiscModal } from '../../components/core/fiscalyear/ViewFiscModal';
import { EditFiscModal } from '../../components/core/fiscalyear/EditFiscModal';
import { DeleteFiscModal } from '../../components/core/fiscalyear/DeleteFiscModal';
import {
  useFiscalYears,
  useUpdateFiscalYear,
  useDeleteFiscalYear
} from '../../services/core/fiscalyear/fisc.queries';
import type { FiscYearListDto, EditFiscYearDto, UUID } from '../../types/core/fisc';

export default function FiscalYearHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<FiscYearListDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const itemsPerPage = 10;

  const {
    data: years = [],
    isLoading,
    error: queryError,
    refetch,
  } = useFiscalYears();

  const updateFiscalYearMutation = useUpdateFiscalYear({
    onSuccess: () => {
      setFormError(null);
      setEditModalOpen(false);
      setSelectedYear(null);
    },
    onError: (error) => {
      setFormError(error.message || 'Failed to update fiscal year');
    },
  });

  const deleteFiscalYearMutation = useDeleteFiscalYear({
    onSuccess: () => {
      setFormError(null);
      setDeleteModalOpen(false);
      setSelectedYear(null);
    },
    onError: (error) => {
      setFormError(error.message || 'Failed to delete fiscal year');
    },
  });

  const filteredYears = useMemo(() => {
    if (!searchTerm.trim()) return years;
    const term = searchTerm.toLowerCase().trim();
    return years.filter(year =>
        year.name.toLowerCase().includes(term) ||
        year.dateStartStr.toLowerCase().includes(term) ||
        year.dateEndStr.toLowerCase().includes(term) ||
        (year.isActive === '0' && 'active'.includes(term)) ||
        (year.isActive === '1' && 'inactive'.includes(term))
    );
  }, [years, searchTerm]);

  const totalItems = filteredYears.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedYears = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredYears.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredYears, currentPage]);

  const handleYearUpdate = async (updatedYear: EditFiscYearDto) => {
    setFormError(null);
    const startDate = new Date(updatedYear.dateStart);
    const endDate = new Date(updatedYear.dateEnd);
    if (endDate <= startDate) {
      setFormError('End date must be after start date');
      return;
    }
    await updateFiscalYearMutation.mutateAsync(updatedYear);
  };

  const handleYearDelete = async (yearId: UUID) => {
    setFormError(null);
    await deleteFiscalYearMutation.mutateAsync(yearId);
  };

  const handleViewDetails = (year: FiscYearListDto) => {
    setSelectedYear(year);
    setViewModalOpen(true);
  };

  const handleEdit = (year: FiscYearListDto) => {
    setSelectedYear(year);
    setEditModalOpen(true);
  };

  const handleDelete = (year: FiscYearListDto) => {
    setSelectedYear(year);
    setDeleteModalOpen(true);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleDeleteConfirmation = async () => {
    if (selectedYear) {
      await handleYearDelete(selectedYear.id);
    }
  };

  const handleRefresh = () => refetch();

  const displayError = queryError?.message || formError;

  const clearErrors = () => {
    setFormError(null);
    if (queryError) refetch();
  };

  return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Fiscal Year History
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View and manage all fiscal year records
            </p>
          </div>
        </div>

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

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400" />
            </div>
        )}

        {/* Content */}
        {!isLoading && !displayError && (
            <>
              <FiscYearSearch searchTerm={searchTerm} onSearchChange={handleSearchChange} />

              <FiscalYearTable
                  years={paginatedYears}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
              />
            </>
        )}

        {/* Modals */}
        <ViewFiscModal fiscalYear={selectedYear} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />

        <EditFiscModal
            fiscalYear={selectedYear}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleYearUpdate}
        />

        <DeleteFiscModal
            fiscalYear={selectedYear}
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirmation}
        />
      </div>
  );
}