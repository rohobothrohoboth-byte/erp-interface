import { motion } from "framer-motion";
import React, { useState } from "react";
import type { LeavePolicyConfigAddDto, LeavePolicyConfigListDto, UUID } from "../../../../../types/core/Settings/leavePolicyConfig";
import LeavePolicyConfigHeader from "./LeavePolicyConfig/leaveConfigHeader";
import LeaveAppChainSection from "../LeaveAppChain/LeaveAppChainSection";
import LeavePolicyConfigTable from "./LeavePolicyConfig/LeavePolicyConfigTable";
import PolicyAssignmentRuleSection from "../PolicyAssignmentRule/PolicyAssignmenRuleSection";
import { useActiveFiscalYearNames } from "../../../../../services/core/fiscalyear/fiscNames.queries";
import { useNavigate } from "react-router-dom";
import { useActiveLeavePolicyConfig, useCreateLeavePolicyConfig } from "../../../../../services/core/settings/ModHrm/LeavePolicyConfigService/leavePolicyConfig.queries";
import AddLeavePolicyConfig from "./LeavePolicyConfig/AddLeavePolicyConfig";

interface LeavePolicyConfigSectionProps {
  leavePolicyId: UUID;
}

//    const [loading, setLoading] = useState(true);
//    const [error, setError] = useState<string | null>(null);
const mockActiveConfig: LeavePolicyConfigListDto[] = [{
  id: "bf250852-ed18-4dfa-931e-c726f191e38a",
  annualEntitlement: 30,
  accrualFrequency: "MONTHLY",
  accrualRate: 2.5,
  maxDaysPerReq: 25,
  maxCarryOverDays: 15,
  minServiceMonths: 6,
  isActive: true,

  annualEntitlementStr: "30 days",
  accrualFrequencyStr: "Monthly",
  accrualRateStr: "2.5",
  maxDaysPerReqStr: "25",
  maxCarryOverDaysStr: "15",
  minServiceMonthsStr: "6",
  isActiveStr: "Active",

  leavePolicy: "Executive & Senior Leave Policy",
  fiscalYear: "2025/2026",
  isDeleted: false,
  rowVersion: "AAAdE",
  createdAt: "2025-10-01T10:00:00Z",
  createdAtAm: "2025-10-01T10:00:00Z",
  modifiedAtAm: "2025-10-01T10:00:00Z",
  modifiedAt: "2025-10-01T10:00:00Z",
}];

const LeavePolicyConfigSection: React.FC<LeavePolicyConfigSectionProps> = ({
  leavePolicyId,
}) => {
    const navigate = useNavigate();
      const {
        data: activeConfig,
        isLoading,
        isError,
        error,
      } = useActiveLeavePolicyConfig(leavePolicyId);

    const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
      const [editingPolicy, setEditingPolicy] = useState<LeavePolicyConfigListDto | null>(
        null
      );
      const [deletingPolicy, setDeletingPolicy] =
        useState<LeavePolicyConfigListDto | null>(null);

      const { data: fy = [] } = useActiveFiscalYearNames();
      const createPolicyConfig = useCreateLeavePolicyConfig();
      const handleAddLeavePolicyConfig = async (leavePolicyConfig: LeavePolicyConfigAddDto) => {
       
        try {
          await createPolicyConfig.mutateAsync(leavePolicyConfig);
        } catch (err) {
          console.error("Failed to create policy:", err);
         
        }
      };
    
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <LeaveAppChainSection leavePolicyId={leavePolicyId} />
      </motion.div>
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{error.message}</span>
            <button
              onClick={() => {}}
              className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border rounded-lg">
      
        <LeavePolicyConfigHeader
          onAddClick={() => setIsAddPolicyModalOpen(true)}
          onViewHistory={() =>
            navigate(
              `/settings/hr/leave/leavePolicyConfigHistory/${leavePolicyId}`,
            )
          }
          
        />
        <LeavePolicyConfigTable
          leavePolicyConfig={activeConfig ? [activeConfig] : []}
          currentPage={1}
          totalPages={1}
          totalItems={activeConfig ? 1 : 0}
          isLoading={isLoading}
          onPageChange={() => {}}
          onEdit={setEditingPolicy as any}
          onDelete={setDeletingPolicy as any}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="pb-2"
      ></motion.div>

      {/* Modals */}
      <AddLeavePolicyConfig
        isOpen={isAddPolicyModalOpen}
        onClose={() => setIsAddPolicyModalOpen(false)}
        leavePolicyId={leavePolicyId}
        fiscalYear={fy}
        onAddLeavePolicyConfig={handleAddLeavePolicyConfig}
        // leaveTypeOptions={leaveTypeOptions}
      />
      <PolicyAssignmentRuleSection leavePolicyId={leavePolicyId} />
    </div>
  );
};

export default LeavePolicyConfigSection;
