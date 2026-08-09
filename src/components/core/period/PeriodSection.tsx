import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import PeriodSearchFilters from "./PeriodSearchFilters";
import { PeriodTable } from "./PeriodTable";
import { ViewPeriodModal } from "./ViewPeriodModal";
import EditPeriodModal from "./EditPeriodModal";
import { DeletePeriodModal } from "./DeletePeriodModal";
import { AddPeriodModal } from "./AddPeriodModal";
import type {
  AddPeriodDto,
  PeriodListDto,
  EditPeriodDto,
  UUID,
} from "../../../types/core/period";
import {
  usePeriods,
  useCreatePeriod,
  useUpdatePeriod,
  useDeletePeriod,
} from "../../../services/core/period/period.queries";
import toast from "react-hot-toast";
import type { Quarter } from "../../../types/core/enum";

function PeriodSection() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodListDto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [newPeriod, setNewPeriod] = useState<AddPeriodDto>({
    name: "",
    dateStart: new Date().toISOString().split("T")[0],
    dateEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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
        dateStart: new Date().toISOString().split("T")[0],
        dateEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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
      setIsEditModalOpen(false);
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
      setIsDeleteModalOpen(false);
      setSelectedPeriod(null);
      toast.success("Period deleted successfully!");
    },
    onError: (error) => {
      setFormError(error.message || "Failed to delete period");
    },
  });

  // Filter periods - show only active periods
  const filteredPeriods = useMemo(() => {
    let filtered = periods.filter((period) => period.isActive === "0");

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
          (period) =>
              period.name?.toLowerCase().includes(term) ||
              period.quarter?.toLowerCase().includes(term) ||
              period.fiscYear?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [periods, searchTerm]);

  const totalItems = filteredPeriods.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPeriods.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPeriods, currentPage]);

  const handleAddPeriod = async () => {
    await createPeriodMutation.mutateAsync(newPeriod);
  };

  const handleEditPeriod = async (periodData: EditPeriodDto) => {
    await updatePeriodMutation.mutateAsync(periodData);
  };

  const handleDeletePeriod = async (periodId: UUID) => {
    await deletePeriodMutation.mutateAsync(periodId);
  };

  const handleViewDetails = (period: PeriodListDto) => {
    setSelectedPeriod(period);
    setIsViewModalOpen(true);
  };

  const handleEdit = (period: PeriodListDto) => {
    setSelectedPeriod(period);
    setIsEditModalOpen(true);
  };

  const handleDelete = (period: PeriodListDto) => {
    setSelectedPeriod(period);
    setIsDeleteModalOpen(true);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleAddPeriodClick = () => setIsModalOpen(true);
  const handleViewHistory = () => navigate("/core/fiscal-year/period-history");
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const displayError = queryError?.message || formError;

  const clearErrors = () => {
    setFormError(null);
    if (queryError) refetch();
  };

  const handleRefresh = () => refetch();

  return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Active Periods
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage financial periods and quarters
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

        {/* Search Filters */}
        <PeriodSearchFilters
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            onClearFilters={() => setSearchTerm("")}
            onAddPeriod={handleAddPeriodClick}
            onViewHistory={handleViewHistory}
            totalItems={periods.length}
            filteredItems={filteredPeriods.length}
            isHistoryView={false}
        />

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400" />
            </div>
        )}

        {/* Period Table */}
        {!isLoading && (
            <PeriodTable
                periods={currentItems}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={isLoading}
            />
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
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
        />

        {selectedPeriod && (
            <EditPeriodModal
                period={selectedPeriod}
                onEditPeriod={handleEditPeriod}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        )}

        <DeletePeriodModal
            period={selectedPeriod}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeletePeriod}
        />
      </div>
  );
}

export default PeriodSection;