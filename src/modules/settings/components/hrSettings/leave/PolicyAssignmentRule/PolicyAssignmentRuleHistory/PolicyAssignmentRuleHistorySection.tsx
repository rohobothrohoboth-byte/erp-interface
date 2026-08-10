import { motion } from "framer-motion";
import { useState, type FC } from "react";
import type {
  PolicyAssignmentRuleListDto,
  PolicyAssignmentRuleModDto,
  UUID,
} from "@/modules/core/types/Settings/policyAssignmentRule";
import DeletePolicyAssignmentRuleModal from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/PolicyAssignmentRuleHistory/deletePolicyAssignmentRuleModal";
import EditPolicyAssignmentRuleModal from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/PolicyAssignmentRuleHistory/EditPolicyAssignmentRuleModal";
import PolicyAssignmentRuleHistoryTable from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/PolicyAssignmentRuleHistory/PolicyAssignmentRuleHistoryTable";
import PolicyAssignmentRuleSearchFilter from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/PolicyAssignmentRuleHistory/PolicyAssignmentRuleSearchFilter";
import {
  useAllPolicyAssignmentRules,
  useUpdatePolicyAssignmentRule,
  useDeletePolicyAssignmentRule,
  useChangeStatusPolicyAssignmentRule,
} from "@/modules/core/services/settings/ModHrm/LeavePolicyAssignmentRule/policyAssignmentRule.query";
import { useActiveFiscalYearNames } from "@/modules/core/services/fiscalyear/fiscNames.queries";
import RuleConditionModal from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/PolicyAssignmentRuleHistory/RuleCondtionsModal";

interface PolicyAssignmentRuleHistorySectionProps {
  leavePolicyId: UUID;
}

const PolicyAssignmentRuleHistorySection: FC<
  PolicyAssignmentRuleHistorySectionProps
> = ({ leavePolicyId }) => {
  // React Query: get all policy assignment rules
  const {
    data: policyAssignmentRules = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAllPolicyAssignmentRules(leavePolicyId);

  // React Query: update & delete
  const updateMutation = useUpdatePolicyAssignmentRule();
  const deleteMutation = useDeletePolicyAssignmentRule();
  const statusChangeMutation = useChangeStatusPolicyAssignmentRule();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPolicyAssignmentRule, setEditingPolicyAssignmentRule] =
    useState<PolicyAssignmentRuleListDto | null>(null);
  const [deletingPolicyAssignmentRule, setDeletingPolicyAssignmentRule] =
    useState<PolicyAssignmentRuleListDto | null>(null);

  // --- New states for RuleConditionModal ---
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] =
    useState<PolicyAssignmentRuleListDto | null>(null);

  const itemsPerPage = 10;

  // Filtered results
  const filteredPolicyAssignmentRules = policyAssignmentRules.filter((rule) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      rule.name.toLowerCase().includes(searchLower) ||
      rule.code.toLowerCase().includes(searchLower) ||
      (rule.isActive ? "active" : "inactive").includes(searchLower)
    );
  });

  // Pagination calculations
  const totalItems = filteredPolicyAssignmentRules.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedRules = filteredPolicyAssignmentRules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Edit handlers
  const handleEdit = (rule: PolicyAssignmentRuleListDto) =>
    setEditingPolicyAssignmentRule(rule);
  const handleCloseEditModal = () => setEditingPolicyAssignmentRule(null);

  const handleEditPolicyAssignmentRule = async (
    updated: PolicyAssignmentRuleModDto,
  ) => {
    if (!editingPolicyAssignmentRule) return;
    try {
      await updateMutation.mutateAsync({
        ...updated,
        id: editingPolicyAssignmentRule.id,
      });
      refetch();
      handleCloseEditModal();
    } catch (err) {
      console.error("Failed to update policy assignment rule:", err);
    }
  };

  // Status change handler
  const handleToggleStatus = async (rule: PolicyAssignmentRuleListDto) => {
    try {
      await statusChangeMutation.mutateAsync({
        id: rule.id,
        stat: !rule.isActive,
      });
      refetch();
    } catch (err) {
      console.error("Failed to change status:", err);
    }
  };

  // Delete handlers
  const handleDelete = (rule: PolicyAssignmentRuleListDto) =>
    setDeletingPolicyAssignmentRule(rule);
  const handleCloseDeleteModal = () => setDeletingPolicyAssignmentRule(null);

  const handleDeletePolicyAssignmentRule = async () => {
    if (!deletingPolicyAssignmentRule) return;
    try {
      await deleteMutation.mutateAsync(deletingPolicyAssignmentRule.id as UUID);
      refetch();
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Failed to delete policy assignment rule:", err);
    }
  };

  // --- Condition modal handlers ---
  const handleConditionClick = (rule: PolicyAssignmentRuleListDto) => {
    setSelectedRule(rule);
    setConditionModalOpen(true);
  };
  const handleCloseConditionModal = () => {
    setSelectedRule(null);
    setConditionModalOpen(false);
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
        <PolicyAssignmentRuleSearchFilter
          searchTerm={searchTerm}
          setSearchTerm={handleSearchChange}
        />
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <span className="font-medium">
            {(error as Error)?.message ||
              "Failed to load policy assignment rules"}
          </span>
        </motion.div>
      )}

      {/* No data */}
      {!isLoading && totalItems === 0 && !isError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <span className="text-yellow-700 font-medium">
              No Policy Assignment Rules Found
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
          <PolicyAssignmentRuleHistoryTable
            policyAssignmentRule={paginatedRules}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onConditionClick={handleConditionClick} // <-- passes rule to modal
          />
        </motion.div>
      )}

      {/* Modals */}
      <EditPolicyAssignmentRuleModal
        isOpen={!!editingPolicyAssignmentRule}
        onClose={handleCloseEditModal}
        onEditPolicyAssignmetRule={handleEditPolicyAssignmentRule}
        policyAssignmetRule={editingPolicyAssignmentRule}
      />

      <DeletePolicyAssignmentRuleModal
        isOpen={!!deletingPolicyAssignmentRule}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeletePolicyAssignmentRule}
        leavePolicyConfig={deletingPolicyAssignmentRule}
      />

      {selectedRule && (
        <RuleConditionModal
          isOpen={conditionModalOpen}
          onClose={handleCloseConditionModal}
          ruleId={selectedRule.id}
          ruleName={selectedRule.name}
        />
      )}
    </div>
  );
};

export default PolicyAssignmentRuleHistorySection;
