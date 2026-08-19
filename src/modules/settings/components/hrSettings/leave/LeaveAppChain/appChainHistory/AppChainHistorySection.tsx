import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { XCircleIcon, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import AppChainSearchFilters from "@/modules/settings/components/hrSettings/leave/LeaveAppChain/appChainHistory/AppChainSearchFilter";
import AppChainHistoryTable from "@/modules/settings/components/hrSettings/leave/LeaveAppChain/appChainHistory/AppChainHistoryTable";
import type {
  LeaveAppChainListDto,
  LeaveAppChainModDto,
  UUID,
} from "@/modules/core/types/Settings/leaveAppChain";
import { leaveAppChainServices } from "@/modules/core/services/settings/ModHrm/leaveAppChainServices";
import EditAppChainModal from "@/modules/settings/components/hrSettings/leave/LeaveAppChain/appChainHistory/EditAppChainModal";
import DeleteAppChainModal from "@/modules/settings/components/hrSettings/leave/LeaveAppChain/appChainHistory/DeleteAppChainModal";

const AppChainHistorySection: React.FC = () => {
  const { leavePolicyId } = useParams<{ leavePolicyId: string }>();
  const navigate = useNavigate();

  const [appChains, setAppChains] = useState<LeaveAppChainListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Don't call services if no policyId
  const { listByPolicy, update, changeStatus, remove } = leaveAppChainServices(leavePolicyId as UUID);
  const [editingAppChain, setEditingAppChain] = useState<LeaveAppChainListDto | null>(null);
  const [deletingAppChain, setDeletingAppChain] = useState<LeaveAppChainListDto | null>(null);

  const itemsPerPage = 10;

  // Navigate back to policy configuration
  const handleBackToConfig = () => {
    navigate(`/hr/leave/policy/config/${leavePolicyId}`);
  };

  // Filter based on search term
  const filteredAppChain = appChains.filter((appChain) => {
    const searchLower = searchTerm.toLowerCase();
    return (
        (appChain.effectiveFromStr || "").toLowerCase().includes(searchLower) ||
        (appChain.effectiveToStr || "").toLowerCase().includes(searchLower) ||
        (appChain.isActiveStr || "").toLowerCase().includes(searchLower) ||
        (appChain.leavePolicy || "").toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalItems = filteredAppChain.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAppChains = filteredAppChain.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const fetchAppChains = async () => {
    if (!leavePolicyId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await listByPolicy.refetch();
      if (result.data) {
        setAppChains(result.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch approval chains:", err);
      setError(err?.message || "Failed to load approval chains. Please try again later.");
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
      const result = await update.mutateAsync(appChain);
      setAppChains((prev) => prev.map((ac) => (ac.id === result.id ? result : ac)));
      setError(null);
    } catch (err: any) {
      console.error("Failed to update approval chain:", err);
      setError(err?.message || "Failed to update approval chain. Please try again.");
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
      setError(err?.message || "Failed to delete approval chain. Please try again.");
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
      await fetchAppChains();
      setError(null);
    } catch (err) {
      console.error("Failed to toggle approval chain status:", err);
      setError("Failed to update approval chain status. Please try again.");
    }
  };

  if (!leavePolicyId) {
    return (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <p className="text-red-500">Invalid policy ID</p>
            <Button onClick={() => navigate("/hr/leave/policies")} className="mt-4">
              Go Back to Policies
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Back Button Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
                variant="outline"
                onClick={handleBackToConfig}
                className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Configuration
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Approval Chain History
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View and manage all approval chains for this leave policy
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{error}</span>
                <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 font-bold text-lg ml-4">
                  ×
                </button>
              </div>
            </motion.div>
        )}

        {/* Search and Filters */}
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

        {/* No results message */}
        {!loading && totalItems === 0 && appChains.length > 0 && !error && (
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
                    No approval chains match your search criteria. Try adjusting your search terms.
                  </p>
                </div>
              </div>
            </motion.div>
        )}

        {/* No data message */}
        {!loading && appChains.length === 0 && !error && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-50 to-red-100 border-l-4 border-yellow-500 rounded-lg shadow-sm p-6 mb-6"
            >
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-yellow-400 mr-3" />
                <div>
                  <h3 className="text-yellow-800 font-medium">No Approval Chains Found</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    There are currently no approval chains for this policy.
                  </p>
                  <Button
                      onClick={handleBackToConfig}
                      variant="outline"
                      className="mt-3 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                  >
                    Go Back to Configuration
                  </Button>
                </div>
              </div>
            </motion.div>
        )}

        {/* Approval Chains Table */}
        {!loading && totalItems > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-0 pb-0"
            >
              <AppChainHistoryTable
                  AppChainHistorys={paginatedAppChains}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  isLoading={loading}
                  onPageChange={setCurrentPage}
                  onEdit={setEditingAppChain}
                  onDelete={setDeletingAppChain}
                  onToggleStatus={handleToggleStatus}
                  leavePolicyId={leavePolicyId}
              />
            </motion.div>
        )}

        {/* Edit Modal */}
        <EditAppChainModal
            isOpen={!!editingAppChain}
            onClose={() => setEditingAppChain(null)}
            onEditLeaveAppChain={handleEditAppChain}
            appChain={editingAppChain}
            leavePolicyId={leavePolicyId as UUID}
        />

        {/* Delete Modal */}
        <DeleteAppChainModal
            appChain={deletingAppChain}
            isOpen={!!deletingAppChain}
            onClose={() => setDeletingAppChain(null)}
            onConfirm={handleDeleteAppChain}
        />
      </div>
  );
};

export default AppChainHistorySection;