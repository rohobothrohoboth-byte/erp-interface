import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../../ui/button";
import type {
  LeaveAppChainAddDto,
  UUID,
} from "../../../../../types/core/Settings/leaveAppChain";
import LeaveAppChainHeader from "./LeaveAppChainHeader";
import LeaveAppChainSearchFilters from "./LeaveAppChainSearchFilter";
import AddLeaveAppChainModal from "./AddLeaveAppChainModal";
import { leaveAppChainServices } from "../../../../../services/core/settings/ModHrm/leaveAppChainServices";
import LeaveAppStepCard from "./LeaveAppStep/leaveAppStepCard";
import { useNavigate } from "react-router-dom";
import AddLeaveAppStepModal from "./LeaveAppStep/AddLeaveAppStepModal";
import LeaveAppStepListModal from "./LeaveAppStep/LeaveAppStepListModal";
import { leavePolicyService } from "../../../../../services/core/settings/ModHrm/LeavePolicyService";
import type {
  LeaveAppStepAddDto,
  LeaveAppStepModDto,
} from "../../../../../types/core/Settings/leaveAppStep";
import { leaveAppStepServices } from "../../../../../services/core/settings/ModHrm/leaveAppStepService";
import { toast } from "react-hot-toast";
import { employeeService } from "../../../../../services/hr/employee/employeeName";

interface LeaveAppChainSectionProps {
  leavePolicyId: UUID;
}

const LeaveAppChainSection: React.FC<LeaveAppChainSectionProps> = ({
                                                                     leavePolicyId,
                                                                   }) => {
  const [leavePolicyName, setLeavePolicyName] = useState<string>("Leave Policy");
  const [policyLoading, setPolicyLoading] = useState<boolean>(true);
  const [activeChainId, setActiveChainId] = useState<UUID | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [existingSteps, setExistingSteps] = useState<Array<{ stepOrder: number; stepName: string; isFinal?: boolean }>>([]);

  // Modal states
  const [isAddAppChainModalOpen, setIsAddAppChainModalOpen] = useState(false);
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [isManageStepsModalOpen, setIsManageStepsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Services
  const { create, activeAppChain, refetchActiveChain } = leaveAppChainServices(leavePolicyId);
  const { listByChain, create: createStep, update: updateStep, remove: deleteStep, refetch: refetchSteps } = leaveAppStepServices(activeChainId ?? undefined);

  const { getAllNames } = employeeService();
  const employees = getAllNames.data ?? [];

  // Fetch leave policy name
  useEffect(() => {
    const fetchLeavePolicyName = async () => {
      if (!leavePolicyId) {
        setPolicyLoading(false);
        return;
      }
      try {
        setPolicyLoading(true);
        const policy = await leavePolicyService.getLeavePolicyById(leavePolicyId);
        setLeavePolicyName(policy.name);
      } catch (err: any) {
        console.error("Failed to fetch policy:", err);
        setLeavePolicyName("Leave Policy");
      } finally {
        setPolicyLoading(false);
      }
    };
    fetchLeavePolicyName();
  }, [leavePolicyId]);

  // Set active chain ID when loaded - handle 404 gracefully
  useEffect(() => {
    if (activeAppChain.data) {
      setActiveChainId(activeAppChain.data.id);
    } else if (activeAppChain.error?.message?.includes("404")) {
      setActiveChainId(null);
    } else if (activeAppChain.data === null && !activeAppChain.isLoading) {
      setActiveChainId(null);
    }

    if (isInitialLoad && !activeAppChain.isLoading) {
      setIsInitialLoad(false);
    }
  }, [activeAppChain.data, activeAppChain.isLoading, activeAppChain.error, isInitialLoad]);

  // Update existing steps when steps data changes - FIXED: Use correct property names
  useEffect(() => {
    if (listByChain.data && listByChain.data.length > 0) {
      const steps = listByChain.data.map(s => ({
        stepOrder: s.stepOrder,
        stepName: s.stepName,
        isFinal: s.isFinal
      }));
      setExistingSteps(steps);
      console.log("Updated existing steps:", steps);
    } else if (listByChain.data && listByChain.data.length === 0) {
      setExistingSteps([]);
    }
  }, [listByChain.data]);

  // Handle successful chain creation
  const handleAddLeaveAppChain = useCallback(async (appChainData: LeaveAppChainAddDto) => {
    try {
      const payload = { ...appChainData, leavePolicyId };
      await create.mutateAsync(payload);
      toast.success("Leave approval chain created successfully");
      await refetchActiveChain();
    } catch (err: any) {
      console.error("Failed to create chain:", err);
      toast.error(err?.message || "Failed to create leave approval chain");
      throw err;
    }
  }, [create, leavePolicyId, refetchActiveChain]);

  const handleAddStep = useCallback(async (stepData: LeaveAppStepAddDto) => {
    if (!activeChainId) {
      toast.error("Cannot add step: no active approval chain found");
      return;
    }

    try {
      await createStep.mutateAsync(stepData);
      toast.success("Approval step created successfully");
      await refetchSteps();
    } catch (err: any) {
      console.error("Failed to create step:", err);
      toast.error(err?.message || "Failed to create approval step");
      throw err;
    }
  }, [activeChainId, createStep, refetchSteps]);

  const handleUpdateStep = useCallback(async (stepData: LeaveAppStepModDto) => {
    try {
      await updateStep.mutateAsync(stepData);
      toast.success("Approval step updated successfully");
      await refetchSteps();
    } catch (err: any) {
      console.error("Failed to update step:", err);
      toast.error(err?.message || "Failed to update approval step");
      throw err;
    }
  }, [updateStep, refetchSteps]);

  const handleDeleteStep = useCallback(async (stepId: UUID) => {
    try {
      await deleteStep.mutateAsync(stepId);
      toast.success("Approval step deleted successfully");
      await refetchSteps();
    } catch (err: any) {
      console.error("Failed to delete step:", err);
      toast.error(err?.message || "Failed to delete approval step");
      throw err;
    }
  }, [deleteStep, refetchSteps]);

  const handleViewHistory = useCallback(() => {
    navigate(`/hr/leave/approval-chain-history/${leavePolicyId}`);
  }, [navigate, leavePolicyId]);

  const isLoadingSteps = listByChain.isLoading || (activeAppChain.isLoading && !isInitialLoad);
  const showLoadingSpinner = activeAppChain.isLoading && isInitialLoad;
  const hasNoActiveChain = !activeAppChain.isLoading && !activeAppChain.data && !showLoadingSpinner;

  return (
      <div className="space-y-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
          <LeaveAppChainHeader
              leavePolicyName={policyLoading ? "Loading..." : leavePolicyName}
          />
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border rounded-lg bg-white shadow-sm overflow-hidden"
        >
          <LeaveAppChainSearchFilters
              onAddClick={() => setIsAddAppChainModalOpen(true)}
              onViewHistory={handleViewHistory}
          />

          {showLoadingSpinner ? (
              <div className="text-center py-12 border-t border-gray-200">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-4"></div>
              </div>
          ) : activeAppChain.data ? (
              <LeaveAppStepCard
                  steps={listByChain.data ?? []}
                  loading={isLoadingSteps}
                  effectiveFrom={activeAppChain.data.effectiveFromStr}
                  effectiveTo={activeAppChain.data.effectiveToStr}
                  onAddStepClick={() => setIsAddStepModalOpen(true)}
                  onManageStepsClick={() => setIsManageStepsModalOpen(true)}
              />
          ) : hasNoActiveChain ? (
              <div className="text-center py-12 border-t border-gray-200 bg-gray-50">
                <div className="max-w-sm mx-auto">
                  <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium mb-2">No Active Approval Chain</p>
                  <p className="text-gray-400 text-sm mb-6">
                    Click the "Add New" button above to create an approval workflow for this policy.
                  </p>
                  <Button
                      onClick={() => setIsAddAppChainModalOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Create Approval Chain
                  </Button>
                </div>
              </div>
          ) : null}
        </motion.div>

        {/* Add Leave Approval Chain Modal */}
        <AddLeaveAppChainModal
            isOpen={isAddAppChainModalOpen}
            onClose={() => setIsAddAppChainModalOpen(false)}
            onAddLeaveAppChain={handleAddLeaveAppChain}
            leavePolicyId={leavePolicyId}
        />

        {/* Add Approval Step Modal */}
        {activeChainId && (
            <AddLeaveAppStepModal
                isOpen={isAddStepModalOpen}
                onClose={() => setIsAddStepModalOpen(false)}
                leaveAppChainId={activeChainId}
                employees={employees}
                existingSteps={existingSteps}
                onSuccess={() => {
                  refetchSteps();
                }}
            />
        )}

        {/* Manage Steps Modal */}
        <LeaveAppStepListModal
            isOpen={isManageStepsModalOpen}
            onClose={() => setIsManageStepsModalOpen(false)}
            steps={listByChain.data ?? []}
            onUpdateStep={handleUpdateStep}
            onDeleteStep={handleDeleteStep}
            employees={employees}
            loading={isLoadingSteps}
        />
      </div>
  );
};

export default LeaveAppChainSection;