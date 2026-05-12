import { motion } from "framer-motion";
import { useState, type FC } from "react";
import type {
  LeavePolicyConfigListDto,
  LeavePolicyConfigModDto,
  UUID,
} from "../../../../../../types/core/Settings/leavePolicyConfig";
import DeleteLeavePolicyConfigModal from "./deleteLeavePolicyConfigModal";
import EditLeavePolicyConfigModal from "./EditLeavePolicyConfigModal";
import LeavePolicyConfigHistoryTable from "./leavePolicyConfigHistoryTable";
import LeavePolicyConfigSearchFilters from "./leavePolicyConfigSearchFilter";
import {
  useAllLeavePolicyConfigs,
  useUpdateLeavePolicyConfig,
  useDeleteLeavePolicyConfig,
  useChangeStatusLeavePolicyConfig,
} from "../../../../../../services/core/settings/ModHrm/LeavePolicyConfigService/leavePolicyConfig.queries";
import { useActiveFiscalYearNames } from "../../../../../../services/core/fiscalyear/fiscNames.queries";

interface LeavePolicyConfigHistorySectionProps {
  leavePolicyId: UUID;
}

const LeavePolicyConfigHistorySection: FC<
  LeavePolicyConfigHistorySectionProps
> = ({ leavePolicyId }) => {
  // React Query: get all configs
  const {
    data: leavePolicyConfigs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAllLeavePolicyConfigs(leavePolicyId);

  // React Query: update & delete
  const updateMutation = useUpdateLeavePolicyConfig();
  const deleteMutation = useDeleteLeavePolicyConfig();
  const statusChangeMutation = useChangeStatusLeavePolicyConfig();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLeavePolicyConfig, setEditingLeavePolicyConfig] =
    useState<LeavePolicyConfigListDto | null>(null);
  const [deletingLeavePolicyConfig, setDeletingLeavePolicyConfig] =
    useState<LeavePolicyConfigListDto | null>(null);

  const itemsPerPage = 10;

  // Filtered results
  const filteredLeavePolicyConfigs = leavePolicyConfigs.filter((config) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      config.accrualFrequencyStr.toLowerCase().includes(searchLower) ||
      config.createdAt?.toLowerCase().includes(searchLower) ||
      (config.isActive ? 'active' : 'inactive').includes(searchLower)
    );
  });

  // Pagination calculations
  const totalItems = filteredLeavePolicyConfigs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedConfigs = filteredLeavePolicyConfigs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Edit handlers
  const handleEdit = (config: LeavePolicyConfigListDto) =>
    setEditingLeavePolicyConfig(config);
  const handleCloseEditModal = () => setEditingLeavePolicyConfig(null);
  
  // Delete handlers
  const handleDelete = (config: LeavePolicyConfigListDto) =>
    setDeletingLeavePolicyConfig(config);

  const handleEditLeavePolicyConfig = async (
    updated: LeavePolicyConfigModDto,
  ) => {
    if (!editingLeavePolicyConfig) return;
    try {
      await updateMutation.mutateAsync({
        ...updated,
        id: editingLeavePolicyConfig.id,
      });
      refetch();
      handleCloseEditModal();
    } catch (err) {
      console.error("Failed to update policy:", err);
    }
  };

  // Status change handler
  const handleToggleStatus = async (config: LeavePolicyConfigListDto) => {
    try {
      await statusChangeMutation.mutateAsync({
        id: config.id,
        stat: !config.isActive,
        rowVersion:config.rowVersion,
      });
      refetch();
    } catch (err) {
      console.error("Failed to change status:", err);
    }
  };
  const handleCloseDeleteModal = () => setDeletingLeavePolicyConfig(null);

  const handleDeleteLeavePolicyConfig = async (leavePolicyConfigId: UUID) => {
    if (!deletingLeavePolicyConfig) return;
    try {
      await deleteMutation.mutateAsync(leavePolicyConfigId);
      refetch();
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Failed to delete policy:", err);
    }
  };

   const { data: fy = [] } = useActiveFiscalYearNames();

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="pb-2"
      >
        <LeavePolicyConfigSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={handleSearchChange}
        />
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <span className="font-medium">
            {(error as Error)?.message || "Failed to load leave types"}
          </span>
        </motion.div>
      )}

      {/* No data message */}
      {!isLoading && totalItems === 0 && !isError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <span className="text-yellow-700 font-medium">
              No Leave Types Found
            </span>
          </div>
        </motion.div>
      )}

      {/* Table */}
      {!isLoading && totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LeavePolicyConfigHistoryTable
            leavePolicyConfig={paginatedConfigs}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </motion.div>
      )}

      {/* Edit Modal */}
      <EditLeavePolicyConfigModal
        isOpen={!!editingLeavePolicyConfig}
        onClose={handleCloseEditModal}
        onEditLeavePolicyConfig={handleEditLeavePolicyConfig}
        leavePolicyConfig={editingLeavePolicyConfig}
        leavePolicyId={leavePolicyId}
        fiscalYear={fy}
      />

      {/* Delete Modal */}
      <DeleteLeavePolicyConfigModal
        isOpen={!!deletingLeavePolicyConfig}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteLeavePolicyConfig}
        leavePolicyConfig={deletingLeavePolicyConfig}
      />
    </div>
  );
};

export default LeavePolicyConfigHistorySection;
