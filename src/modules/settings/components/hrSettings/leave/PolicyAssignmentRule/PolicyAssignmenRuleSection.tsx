import React, { useState } from "react";
import { motion } from "framer-motion";
import type { UUID } from "@/modules/core/types/Settings/policyAssignmentRule";
import PolicyAssignmentRuleTable from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/PolicyAssignmentRuleTable";
import type { PolicyAssignmentRuleAddDto } from "@/modules/core/types/Settings/policyAssignmentRule";
import PolicyAssignmentRuleHeader from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/policyAssignmentRuleHeader";
import AddPolicyAssignmentRuleModal from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/AddPolicyAssignmentRule";
import {
  useActivePolicyAssignmentRule,
  useCreatePolicyAssignmentRule,
} from "@/modules/core/services/settings/ModHrm/LeavePolicyAssignmentRule/policyAssignmentRule.query";
import { useNavigate } from "react-router-dom";

// Add props interface to receive leavePolicyId
interface PolicyAssignmentRuleSectionProps {
  leavePolicyId: UUID;
}
const PolicyAssignmentRuleSection: React.FC<
  PolicyAssignmentRuleSectionProps
> = ({ leavePolicyId }) => {
  const navigate = useNavigate();
  const [
    isAddPolicyAssignmentRuleModalOpen,
    setIsAddPolicyAssignmentRuleModalOpen,
  ] = useState(false);

  // React Query hooks
  const {
    data: activePolicyAssignmentRules = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useActivePolicyAssignmentRule(leavePolicyId);

  // Debug: Log the active policy data
  console.log("Active Policy Assignment Rules:", activePolicyAssignmentRules);
  console.log("Is Loading:", isLoading);
  console.log("Is Error:", isError);

  // Use the array directly since API returns an array
  const policyAssignmentRules = activePolicyAssignmentRules;

  const createMutation = useCreatePolicyAssignmentRule();

  // CRUD handlers
  const handleAddPolicyAssignmentRule = async (
    ruleData: PolicyAssignmentRuleAddDto,
  ) => {
    try {
      await createMutation.mutateAsync(ruleData);
      refetch();
      setIsAddPolicyAssignmentRuleModalOpen(false);
    } catch (err) {
      console.error("Failed to create policy assignment rule:", err);
    }
  };

  const handleViewHistory = () => {
    navigate(`/settings/hr/leave/policyAssignmentRuleHistory/${leavePolicyId}`);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PolicyAssignmentRuleHeader
          onAddClick={() => setIsAddPolicyAssignmentRuleModalOpen(true)}
          onViewHistory={handleViewHistory}
        />
        {/* Show table if there's data or loading */}
        {(policyAssignmentRules.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-0 pb-0"
          >
            <PolicyAssignmentRuleTable
              policyAssignmentRule={policyAssignmentRules}
              currentPage={1}
              totalPages={1}
              totalItems={policyAssignmentRules.length}
              isLoading={isLoading}
              onPageChange={() => {}}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Error Banner */}
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

      {/* Loading */}
      {/* {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )} */}

      {/* No data message */}
      {!isLoading && policyAssignmentRules.length === 0 && !isError && (
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

      {/* Modals */}
      <AddPolicyAssignmentRuleModal
        isOpen={isAddPolicyAssignmentRuleModalOpen}
        onClose={() => setIsAddPolicyAssignmentRuleModalOpen(false)}
        onAddPolicyAssignmentRule={handleAddPolicyAssignmentRule}
        leavePolicyId={leavePolicyId}
      />
    </div>
  );
};

export default PolicyAssignmentRuleSection;
