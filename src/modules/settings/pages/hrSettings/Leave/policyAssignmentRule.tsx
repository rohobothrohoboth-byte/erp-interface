import React from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import PolicyAssignmentRuleSection from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/PolicyAssignmenRuleSection";
import type { UUID } from "@/modules/core/types/Settings/policyAssignmentRule";

const PolicyAssignmentRule: React.FC = () => {
  const { leavePolicyId } = useParams<{ leavePolicyId: string }>();

  if (!leavePolicyId) {
    return (
        <div className="p-6 text-center text-gray-500">
          No policy selected
        </div>
    );
  }

  return (
      <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 space-y-6"
      >
        <PolicyAssignmentRuleSection leavePolicyId={leavePolicyId as UUID} />
      </motion.section>
  );
};

export default PolicyAssignmentRule;