import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { PeriodTable } from '../../components/core/period/PeriodTable';
import { ViewPeriodModal } from '../../components/core/period/ViewPeriodModal';
import EditPeriodModal from '../../components/core/period/EditPeriodModal';
import { DeletePeriodModal } from '../../components/core/period/DeletePeriodModal';
import { AddPeriodModal } from '../../components/core/period/AddPeriodModal';
import PeriodSearchFilters from '../../components/core/period/PeriodSearchFilters';
import {
  usePeriods,
  useCreatePeriod,
  useUpdatePeriod,
  useDeletePeriod,
} from '../../services/core/period/period.queries';
import type { PeriodListDto, EditPeriodDto, UUID, AddPeriodDto } from '../../types/core/period';
import type { Quarter } from '../../types/core/enum';
import toast from 'react-hot-toast';

export default function PeriodHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodListDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [newPeriod, setNewPeriod] = useState<AddPeriodDto>({
    name: "",
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quarter: "" as Quarter,
    fiscalYearId: "" as UUID,
  });

  const itemsPerPage = 10;

  const {
    data: periods = [],
    isLoading,
    error: queryError,
    refetch,
  } = usePeriods();

  const createPeriodMutation = useCreatePeriod({
    onSuccess: () => {
      setFormError(null);
      setIsModalOpen(false);
      setNewPeriod({
        name: "",
        dateStart: new Date().toISOString().split('T')[0],
        dateEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        quarter: "" as Quarter,
        fiscalYearId: "" as UUID,
      });
      toast.success("Period added successfully!");
    },
    onError: (error) => {
      setFormError(error.message || "Failed to add period");
    },
  });

  const updatePeriodMutation = useUpdatePeriod({
    onSuccess: () => {
      setFormError(null);
      setEditModalOpen(false);
      setSelectedPeriod(null);
      toast.success("Period updated successfully!");
    },
    onError: (error) => {
      setFormError(error.message || "Failed to update period");
    },
  });

  const deletePeriodMutation = useDeletePeriod({
    onSuccess: () => {
      setFormError(null);
      setDeleteModalOpen(false);
      setSelectedPeriod(null);
      toast.success("Period deleted successfully!");
    },
    onError: (error) => {
      setFormError(error.message || "Failed to delete period");
    },
  });

  // Filter periods - show ALL periods (active and inactive) for history view
  const filteredPeriods = useMemo(() => {
    if (!searchTerm.trim()) return periods;
    const term = searchTerm.toLowerCase().trim();
    return periods.filter(period =>
        period.name?.toLowerCase().includes(term) ||
        period.quarter?.toLowerCase().includes(term) ||
        period.fiscYear?.toLowerCase().includes(term)
    );
  }, [periods, searchTerm]);

  const totalItems = filteredPeriods.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedPeriods = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPeriods.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPeriods, currentPage]);

  const handleAddPeriod = async () => {
    setFormError(null);
    await createPeriodMutation.mutateAsync(newPeriod);
  };

  const handleEditPeriod = async (periodData: EditPeriodDto) => {
    setFormError(null);
    await updatePeriodMutation.mutateAsync(periodData);
  };

  const handleDeletePeriod = async (periodId: UUID) => {
    setFormError(null);
    await deletePeriodMutation.mutateAsync(periodId);
  };

  const handleViewDetails = (period: PeriodListDto) => {
    setSelectedPeriod(period);
    setViewModalOpen(true);
  };

  const handleEdit = (period: PeriodListDto) => {
    setSelectedPeriod(period);
    setEditModalOpen(true);
  };

  const handleDelete = (period: PeriodListDto) => {
    setSelectedPeriod(period);
    setDeleteModalOpen(true);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleAddPeriodClick = () => setIsModalOpen(true);

  const handleDeleteConfirmation = async () => {
    if (selectedPeriod) {
      await handleDeletePeriod(selectedPeriod.id);
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
              Period History
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View and manage all period records
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
                    Failed to load periods.{' '}
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
        {!isLoading && (
            <>
              <PeriodSearchFilters
                  searchTerm={searchTerm}
                  setSearchTerm={handleSearchChange}
                  onClearFilters={() => setSearchTerm("")}
                  onAddPeriod={handleAddPeriodClick}
                  onViewHistory={() => {}}
                  totalItems={periods.length}
                  filteredItems={filteredPeriods.length}
                  isHistoryView={true}
              />

              <PeriodTable
                  periods={paginatedPeriods}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={isLoading}
              />
            </>
        )}

        {/* Modals */}
        <AddPeriodModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            newPeriod={newPeriod}
            setNewPeriod={setNewPeriod}
            onAddPeriod={handleAddPeriod}
        />

        <ViewPeriodModal
            period={selectedPeriod}
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
        />

        {selectedPeriod && (
            <EditPeriodModal
                period={selectedPeriod}
                onEditPeriod={handleEditPeriod}
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
            />
        )}

        <DeletePeriodModal
            period={selectedPeriod}
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirmation}
        />
      </div>
  );
}