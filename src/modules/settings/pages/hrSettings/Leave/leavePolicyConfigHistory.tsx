import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import LeavePolicyConfigHistorySection from "@/modules/settings/components/hrSettings/leave/LeavePolicyConfig/leavePolicyConfigHistory/leavePolicyConfigHistorySection";
import LeavePolicyConfigHistoryHeader from "@/modules/settings/components/hrSettings/leave/LeavePolicyConfig/leavePolicyConfigHistory/leavePolicyConfigHistoryHeader";
import type { UUID } from "@/modules/core/types/Settings/leavePolicyConfig";

const LeaveAppChainHistory: React.FC = () => {
  const { leavePolicyId } = useParams<{ leavePolicyId: string }>();
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      {/* Use the AppChainHistoryHeader component */}
      <LeavePolicyConfigHistoryHeader />

      {/* Leave Type Section */}
      <LeavePolicyConfigHistorySection leavePolicyId={leavePolicyId as UUID} />
    </motion.section>
  );
};

export default LeaveAppChainHistory;
