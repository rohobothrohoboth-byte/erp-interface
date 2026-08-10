import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PaymentApprovalChainHeader from "@/modules/settings/components/FinanceSettings/paymentApprovalChain/PaymentApprovalChainHeader";
import PaymentApprovalChainSearchFilters from "@/modules/settings/components/FinanceSettings/paymentApprovalChain/PaymentApprovalChainSearchFilter";
import AddPaymentApprovalChainModal from "@/modules/settings/components/FinanceSettings/paymentApprovalChain/AddPaymentApprovalChainModal";
import PaymentApprovalStepCard from "@/modules/settings/components/FinanceSettings/paymentApprovalChain/PaymentApprovalStepCard";
import AddPaymentApprovalStepModal from "@/modules/settings/components/FinanceSettings/paymentApprovalChain/AddPaymentApprovalStepModal";
import PaymentApprovalStepListModal from "@/modules/settings/components/FinanceSettings/paymentApprovalChain/PaymentApprovalStepListModal";
import type {
  PaymentApprovalChain,
  PaymentApprovalChainAddDto,
  PaymentApprovalStep,
  PaymentApprovalStepAddDto,
  PaymentApprovalStepModDto,
} from "@/modules/settings/components/FinanceSettings/paymentApprovalChain/types";

const PaymentApprovalChainSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeChain, setActiveChain] = useState<PaymentApprovalChain | null>(null);
  const [steps, setSteps] = useState<PaymentApprovalStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddChainModalOpen, setIsAddChainModalOpen] = useState(false);
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [isManageStepsModalOpen, setIsManageStepsModalOpen] = useState(false);

  // Mock employees - replace with actual API call
  const employees = [
    { id: "emp-001", name: "John Doe" },
    { id: "emp-002", name: "Jane Smith" },
    { id: "emp-003", name: "Michael Johnson" },
    { id: "emp-004", name: "Sarah Williams" },
    { id: "emp-005", name: "David Brown" },
  ];

  // Load active chain and steps from localStorage
  useEffect(() => {
    loadActiveChain();
  }, []);

  const loadActiveChain = () => {
    setLoading(true);
    try {
      const storedChain = localStorage.getItem("activePaymentApprovalChain");
      const storedSteps = localStorage.getItem("paymentApprovalSteps");

      if (storedChain) {
        const chain = JSON.parse(storedChain);
        setActiveChain(chain);
      }

      if (storedSteps) {
        const parsedSteps = JSON.parse(storedSteps);
        setSteps(parsedSteps);
      }
    } catch (error) {
      console.error("Error loading approval chain:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChain = async (chainData: PaymentApprovalChainAddDto) => {
    try {
      const newChain: PaymentApprovalChain = {
        chain_id: `PAC-${Date.now()}`,
        chain_name: chainData.chain_name,
        branch_id: chainData.branch_id,
        is_active: true,
        effective_from: chainData.effective_from.toISOString().split("T")[0],
        effective_to: chainData.effective_to
          ? chainData.effective_to.toISOString().split("T")[0]
          : undefined,
        steps: [],
      };

      // Save to localStorage
      localStorage.setItem("activePaymentApprovalChain", JSON.stringify(newChain));
      setActiveChain(newChain);
      
      // Clear existing steps when new chain is created
      setSteps([]);
      localStorage.setItem("paymentApprovalSteps", JSON.stringify([]));

      toast.success("Payment approval chain created successfully");
    } catch (error: any) {
      console.error("Error creating chain:", error);
      throw error;
    }
  };

  const handleAddStep = async (stepData: PaymentApprovalStepAddDto) => {
    if (!activeChain) {
      toast.error("Cannot add step: no active approval chain found");
      return;
    }

    try {
      const employee = employees.find((emp) => emp.id === stepData.employee_id);

      const newStep: PaymentApprovalStep = {
        step_id: `STEP-${Date.now()}`,
        step_order: stepData.step_order,
        step_name: stepData.step_name,
        approver_role: stepData.approver_role,
        employee_id: stepData.employee_id || undefined,
        employee_name: employee?.name,
        is_final: stepData.is_final,
      };

      const updatedSteps = [...steps, newStep].sort(
        (a, b) => a.step_order - b.step_order
      );

      setSteps(updatedSteps);
      localStorage.setItem("paymentApprovalSteps", JSON.stringify(updatedSteps));

      toast.success("Approval step created successfully");
    } catch (error: any) {
      console.error("Error creating step:", error);
      throw error;
    }
  };

  const handleManageSteps = () => {
    setIsManageStepsModalOpen(true);
  };

  const handleUpdateStep = async (stepData: PaymentApprovalStepModDto) => {
    try {
      const employee = employees.find((emp) => emp.id === stepData.employee_id);

      const updatedSteps = steps.map((s) =>
        s.step_id === stepData.step_id
          ? {
              ...s,
              step_name: stepData.step_name,
              step_order: stepData.step_order,
              approver_role: stepData.approver_role,
              employee_id: stepData.employee_id || undefined,
              employee_name: employee?.name,
              is_final: stepData.is_final,
            }
          : s
      ).sort((a, b) => a.step_order - b.step_order);

      setSteps(updatedSteps);
      localStorage.setItem("paymentApprovalSteps", JSON.stringify(updatedSteps));

      toast.success("Approval step updated successfully");
    } catch (error: any) {
      console.error("Error updating step:", error);
      throw error;
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      const updatedSteps = steps.filter((s) => s.step_id !== stepId);

      setSteps(updatedSteps);
      localStorage.setItem("paymentApprovalSteps", JSON.stringify(updatedSteps));

      toast.success("Approval step deleted successfully");
    } catch (error: any) {
      console.error("Error deleting step:", error);
      throw error;
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
        <PaymentApprovalChainHeader />
      </motion.div>

      {/* Search Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="border rounded-lg"
      >
        <PaymentApprovalChainSearchFilters
          onAddClick={() => setIsAddChainModalOpen(true)}
          onViewHistory={() => toast.info("View history feature coming soon")}
        />

        {/* Approval Steps */}
        {loading ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-b-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading approval chain...</p>
          </div>
        ) : activeChain ? (
          <PaymentApprovalStepCard
            steps={steps}
            loading={false}
            effectiveFrom={activeChain.effective_from}
            effectiveTo={activeChain.effective_to}
            onAddStepClick={() => setIsAddStepModalOpen(true)}
            onManageStepsClick={handleManageSteps}
          />
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-b-lg">
            <p className="text-gray-500">No active approval chain found.</p>
            <p className="text-gray-500 mb-4">Please add new approval chain.</p>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AddPaymentApprovalChainModal
        isOpen={isAddChainModalOpen}
        onClose={() => setIsAddChainModalOpen(false)}
        onAddChain={handleAddChain}
      />

      <AddPaymentApprovalStepModal
        isOpen={isAddStepModalOpen}
        onClose={() => setIsAddStepModalOpen(false)}
        onAddStep={handleAddStep}
        employees={employees}
      />

      <PaymentApprovalStepListModal
        isOpen={isManageStepsModalOpen}
        onClose={() => setIsManageStepsModalOpen(false)}
        steps={steps}
        onUpdateStep={handleUpdateStep}
        onDeleteStep={handleDeleteStep}
        employees={employees}
        loading={false}
      />
    </div>
  );
};

export default PaymentApprovalChainSection;
