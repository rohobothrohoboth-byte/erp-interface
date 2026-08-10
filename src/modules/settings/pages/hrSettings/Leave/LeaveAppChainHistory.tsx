import { motion } from "framer-motion";
import AppChainHistoryHeader from "@/modules/settings/components/hrSettings/leave/LeaveAppChain/appChainHistory/AppChainHistoryHeader";
import { useParams } from "react-router-dom";
import type { UUID } from "@/modules/core/types/Settings/leaveAppChain";
import AppChainHistorySection from "@/modules/settings/components/hrSettings/leave/LeaveAppChain/appChainHistory/AppChainHistorySection";

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
      <AppChainHistoryHeader />

      {/* Leave Type Section */}
      <AppChainHistorySection leavePolicyId={leavePolicyId as UUID} />
    </motion.section>
  );
};

export default LeaveAppChainHistory;