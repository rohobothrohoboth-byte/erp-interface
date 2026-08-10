import React from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import PolicyAssignmentRuleHistorySection from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/PolicyAssignmentRuleHistory/PolicyAssignmentRuleHistorySection";
import PolicyAssignmentRuleHistoryHeader from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/PolicyAssignmentRuleHistory/PolicyAssignmentRuleHistoryHeader";
import type { UUID } from "@/modules/core/types/Settings/policyAssignmentRule";

const PolicyAssignmentRuleHistory: React.FC = () => {
  const { leavePolicyId } = useParams<{ leavePolicyId: string }>();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Use the PolicyAssignmentRuleHistoryHeader component */}
      <PolicyAssignmentRuleHistoryHeader />

      {/* Policy Assignment Rule History Section */}
      <PolicyAssignmentRuleHistorySection
        leavePolicyId={leavePolicyId as UUID}
      />
    </motion.section>
  );
};

export default PolicyAssignmentRuleHistory;
