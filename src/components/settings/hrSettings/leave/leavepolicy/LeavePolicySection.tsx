import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type {
  LeavePolicyListDto,
  LeavePolicyAddDto,
  LeavePolicyModDto,
  LeaveTypeOptionDto,
  UUID,
} from "../../../../../types/core/Settings/leavepolicy";
import LeavePolicyHeader from "./LeavePolicyHeader";
import LeavePolicySearchFilters from "./LeavePolicySearchFilter";
import AddLeavePolicyModal from "./AddLeavePolicyModal";
import EditLeavePolicyModal from "./EditLeavePolicyModal";
import DeleteLeavePolicyModal from "./DeleteLeavePolicyModal";
import LeavePolicyTable from "./LeavePolicyTable";
import { leavePolicyService } from "../../../../../services/core/settings/ModHrm/LeavePolicyService";
import { hrmLeaveListApi } from "../../../../../services/List/hrmLeave/hrmLeaveList.api";
import AssignPolicyConfirmationModal from "./AssignPolicyConfirmationModal";

const LeavePolicySection: React.FC = () => {
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicyListDto[]>([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState<
    LeaveTypeOptionDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
   const [isAssignPolicyModalOpen, setIsAssignPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicyListDto | null>(
    null
  );
  const [deletingPolicy, setDeletingPolicy] =
    useState<LeavePolicyListDto | null>(null);

  const itemsPerPage = 10;

  // Fetch policies and leave types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [policies, leaveTypes] = await Promise.all([
          leavePolicyService.getAllLeavePolicies(),
          hrmLeaveListApi.getAllLeaveTypes(),
        ]);
        setLeavePolicies(policies);
        setLeaveTypeOptions(
          leaveTypes.map((lt) => ({ id: lt.id, name: lt.name }))
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load leave policies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredLeavePolicies = leavePolicies.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalItems = filteredLeavePolicies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedPolicies = filteredLeavePolicies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // CRUD handlers
  const handleAddLeavePolicy = async (policyData: LeavePolicyAddDto) => {
    try {
      const newPolicy = await leavePolicyService.createLeavePolicy(policyData);
      setLeavePolicies((prev) => [...prev, newPolicy]);
      setIsAddPolicyModalOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to create leave policy. Please try again.");
    }
  };

  const handleEditLeavePolicy = async (updatedPolicy: LeavePolicyModDto) => {
    try {
      const result = await leavePolicyService.updateLeavePolicy(updatedPolicy);
      setLeavePolicies((prev) =>
        prev.map((p) => (p.id === result.id ? result : p))
      );
      setEditingPolicy(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update leave policy. Please try again.");
    }
  };

  const handleDeleteLeavePolicy = async (policyId: UUID) => {
    try {
      await leavePolicyService.deleteLeavePolicy(policyId);
      setLeavePolicies((prev) => prev.filter((p) => p.id !== policyId));
      setDeletingPolicy(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete leave policy. Please try again.");
    }
  };
      const handleToggleStatus = async (leavePolicy: LeavePolicyListDto) => {
        try {
          const statusPayload = {
            id: leavePolicy.id,
            stat: !leavePolicy.status,
          };
          // await changeStatus.mutateAsync(statusPayload);
          // // Refetch data instead of manual state update to ensure consistency
          // await fetchAppChains();
          setError(null);
        } catch (err) {
          console.error("Failed to toggle approval chain status:", err);
          setError("Failed to update approval chain status. Please try again.");
        }
      };

     const handleAssignPolicy = () => {
       setIsAssignPolicyModalOpen(false);
     };


  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <LeavePolicyHeader />
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}

      {/* Search Filters */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-2"
        >
          <LeavePolicySearchFilters
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            onAddClick={() => setIsAddPolicyModalOpen(true)}
            onAssignPolicy={() => setIsAssignPolicyModalOpen(true)}
          />
        </motion.div>
      )}

      {/* LeavePolicyTable always visible */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-0 pb-0"
        >
          <LeavePolicyTable
            leavePolicies={paginatedPolicies}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            isLoading={loading}
            onPageChange={setCurrentPage}
            onEdit={setEditingPolicy as any}
            onDelete={setDeletingPolicy as any}
            onToggleStatus={handleToggleStatus}
          />
        </motion.div>
      )}

      {/* Modals */}
      <AddLeavePolicyModal
        isOpen={isAddPolicyModalOpen}
        onClose={() => setIsAddPolicyModalOpen(false)}
        onAddLeavePolicy={handleAddLeavePolicy}
        leaveTypeOptions={leaveTypeOptions}
      />
      <EditLeavePolicyModal
        isOpen={!!editingPolicy}
        onClose={() => setEditingPolicy(null)}
        onSave={handleEditLeavePolicy}
        policy={editingPolicy}
        leaveTypeOptions={leaveTypeOptions}
      />
      <DeleteLeavePolicyModal
        isOpen={!!deletingPolicy}
        onClose={() => setDeletingPolicy(null)}
        onConfirm={() =>
          deletingPolicy && handleDeleteLeavePolicy(deletingPolicy.id)
        }
        policy={deletingPolicy}
      />
      <AssignPolicyConfirmationModal
        isOpen={isAssignPolicyModalOpen}
        onClose={() => setIsAssignPolicyModalOpen(false)}
        onConfirm={handleAssignPolicy}
      />
    </div>
  );
};

export default LeavePolicySection;
