import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { XCircleIcon } from "lucide-react";
import AppChainSearchFilters from "./AppChainSearchFilter";
import AppChainHistoryTable from "./AppChainHistoryTable";
import type {
  LeaveAppChainListDto,
  LeaveAppChainModDto,
  UUID,
} from "../../../../../../types/core/Settings/leaveAppChain";
import { leaveAppChainServices } from "../../../../../../services/core/settings/ModHrm/leaveAppChainServices";
import EditAppChainModal from "./EditAppChainModal";
import DeleteAppChainModal from "./DeleteAppChainModal";
interface LeaveAppChainHistorySectionProps {
  leavePolicyId: UUID;
}

const AppChainHisotrySection: React.FC<LeaveAppChainHistorySectionProps> = ({
  leavePolicyId,
}) => {
  const [appChains, setAppChains] = useState<LeaveAppChainListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { listByPolicy, update, changeStatus, remove } =
    leaveAppChainServices(leavePolicyId);
  const [editingAppChain, setEditingAppChain] =
    useState<LeaveAppChainListDto | null>(null);
  const [deletingAppChain, setDeletingAppChain] =
    useState<LeaveAppChainListDto | null>(null);

  const itemsPerPage = 10;

  // Filter leave types based on search term
  const filteredAppChain = appChains.filter((appChain) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      appChain.effectiveFromStr.toLowerCase().includes(searchLower) ||
      appChain.effectiveToStr.toLowerCase().includes(searchLower) ||
      appChain.isActiveStr.toLowerCase().includes(searchLower) ||
      appChain.leavePolicy.toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalItems = filteredAppChain.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAppChains = filteredAppChain.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset to first page when search changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const fetchAppChains = async () => {
    try {
      setLoading(true);
      setError(null);

      if (leavePolicyId) {
        const result = await listByPolicy.refetch();
        if (result.data) {
          setAppChains(result.data);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch approval chains:", err);
      const errorMessage =
        err?.message ||
        "Failed to load approval chains. Please try again later.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leavePolicyId) {
      fetchAppChains();
    }
  }, [leavePolicyId]);

  const handleEditAppChain = async (appChain: LeaveAppChainModDto) => {
    try {
      const modData: LeaveAppChainModDto = {
        id: appChain.id,
        leavePolicyId: appChain.leavePolicyId,
        effectiveFrom: appChain.effectiveFrom,
        effectiveTo: appChain.effectiveTo,
        isActive: appChain.isActive,
        rowVersion: appChain.rowVersion,
      };

      const result = await update.mutateAsync(modData);
      setAppChains((prev) =>
        prev.map((ac) => (ac.id === result.id ? result : ac)),
      );
      setError(null);
    } catch (err: any) {
      console.error("Failed to update approval chain:", err);
      const errorMessage =
        err?.message || "Failed to update approval chain. Please try again.";
      setError(errorMessage);
      throw err;
    }
  };

  const handleDeleteAppChain = async (appChainId: UUID) => {
    try {
      await remove.mutateAsync(appChainId);
      setAppChains((prev) => prev.filter((ac) => ac.id !== appChainId));
      setError(null);
      setDeletingAppChain(null);
    } catch (err: any) {
      console.error("Failed to delete approval chain:", err);
      const errorMessage =
        err?.message || "Failed to delete approval chain. Please try again.";
      setError(errorMessage);
    }
  };

  const handleToggleStatus = async (appChain: LeaveAppChainListDto) => {
    try {
      const statusPayload = {
        id: appChain.id,
        stat: !appChain.isActive,
        rowVersion: appChain.rowVersion,
      };
      await changeStatus.mutateAsync(statusPayload);
      // Refetch data instead of manual state update to ensure consistency
      await fetchAppChains();
      setError(null);
    } catch (err) {
      console.error("Failed to toggle approval chain status:", err);
      setError("Failed to update approval chain status. Please try again.");
    }
  };

  const handleEdit = (appChain: LeaveAppChainListDto) => {
    setEditingAppChain(appChain);
  };

  const handleCloseEditModal = () => {
    setEditingAppChain(null);
  };

  const handleDelete = (appChain: LeaveAppChainListDto) => {
    setDeletingAppChain(appChain);
  };

  const handleCloseDeleteModal = () => {
    setDeletingAppChain(null);
  };

  return (
    <div className="space-y-6">
      {/* Error message for API errors */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {error.includes("load") ? (
                <>
                  Failed to load leave AppChian.{" "}
                  <button
                    onClick={fetchAppChains}
                    className="underline hover:text-red-800 font-semibold focus:outline-none"
                  >
                    Try again
                  </button>{" "}
                  later.
                </>
              ) : error.includes("create") ? (
                "Failed to create leave AppChian. Please try again."
              ) : error.includes("update") ? (
                "Failed to update leave AppChian. Please try again."
              ) : error.includes("delete") ? (
                "Failed to delete leave AppChian. Please try again."
              ) : (
                error
              )}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Search and Filters Section for Approval Chains */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="pb-2"
      >
        <AppChainSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={handleSearchChange}
        />
      </motion.div>
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}

      {/* No leave types message - Show when not loading and filteredAppChain array is empty */}
      {!loading && totalItems === 0 && !error && appChains.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-red-100 border-l-4 border-yellow-500 rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-yellow-800 font-medium">No Results Found</h3>
              <p className="text-yellow-700 text-sm mt-1">
                No approval chains match your search criteria. Try adjusting
                your search terms.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* No data message - Show when not loading and appChains array is empty */}
      {!loading && appChains.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-red-100 border-l-4 border-yellow-500 rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-yellow-800 font-medium">
                No Approval Chains Found
              </h3>
              <p className="text-yellow-700 text-sm mt-1">
                There are currently no approval chains in the system. Please add
                an approval chain to get started.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leave Types Table */}
      {!loading && totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-0 pb-0 -mt-2"
        >
          <AppChainHistoryTable
            AppChainHistorys={paginatedAppChains}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            isLoading={loading}
            onPageChange={setCurrentPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </motion.div>
      )}
      {/* Edit Leave Type Modal */}
      <EditAppChainModal
        isOpen={!!editingAppChain}
        onClose={handleCloseEditModal}
        onEditLeaveAppChain={handleEditAppChain}
        appChain={editingAppChain}
        leavePolicyId={leavePolicyId}
      />

      {/* Delete Leave app chain Modal */}
      <DeleteAppChainModal
        appChain={deletingAppChain}
        isOpen={!!deletingAppChain}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteAppChain}
      />
    </div>
  );
};

export default AppChainHisotrySection;
