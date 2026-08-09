import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Plus, AlertCircle, Shield } from "lucide-react";
import { Button } from "../../../../../ui/button";
import { Label } from "../../../../../ui/label";
import { Input } from "../../../../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../ui/select";
import toast from "react-hot-toast";
import type {
  LeaveAppStepAddDto,
  UUID,
} from "../../../../../../types/core/Settings/leaveAppStep";
import { ApprovalRole } from "../../../../../../types/core/enum";
import type { NameListDto } from "../../../../../../types/hr/NameListDto";
import { leaveAppStepServices } from "../../../../../../services/core/settings/ModHrm/leaveAppStepService";

interface AddLeaveAppStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveAppChainId: string;
  employees: NameListDto[];
  existingSteps?: Array<{ stepOrder: number; stepName: string; isFinal?: boolean }>;
  onSuccess?: () => void;
}

const AddLeaveAppStepModal: React.FC<AddLeaveAppStepModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     leaveAppChainId,
                                                                     employees,
                                                                     existingSteps = [],
                                                                     onSuccess,
                                                                   }) => {
  const [stepName, setStepName] = useState("");
  const [stepOrder, setStepOrder] = useState<number>(1);
  const [role, setRole] = useState<string>("");
  const [isFinal, setIsFinal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>("none");

  const { create: createStepMutation } = leaveAppStepServices(leaveAppChainId);

  const roleOptions = useMemo(
      () => Object.entries(ApprovalRole).map(([key, value]) => ({ key, value })),
      [],
  );

  const employeeOptions = useMemo(
      () =>
          (employees || [])
              .filter((emp) => emp && emp.id && emp.name)
              .map((employee) => ({
                value: employee.id,
                label: employee.name,
              })),
      [employees],
  );

  // Check if there's already a final step
  const hasExistingFinalStep = useCallback(() => {
    return existingSteps.some(step => step.isFinal === true);
  }, [existingSteps]);

  // Get existing final step details
  const getExistingFinalStep = useCallback(() => {
    return existingSteps.find(step => step.isFinal === true);
  }, [existingSteps]);

  // Get the next available order number
  const getNextAvailableOrder = useCallback(() => {
    if (existingSteps.length === 0) return 1;
    const usedOrders = existingSteps.map(s => s.stepOrder).sort((a, b) => a - b);
    for (let i = 1; i <= usedOrders.length + 1; i++) {
      if (!usedOrders.includes(i)) {
        return i;
      }
    }
    return usedOrders.length + 1;
  }, [existingSteps]);

  // Get all available orders
  const getAvailableOrders = useCallback(() => {
    const usedOrders = existingSteps.map(s => s.stepOrder);
    const available = [];
    for (let i = 1; i <= existingSteps.length + 1; i++) {
      if (!usedOrders.includes(i)) {
        available.push(i);
      }
    }
    return available;
  }, [existingSteps]);

  const resetForm = useCallback(() => {
    setStepName("");
    setStepOrder(getNextAvailableOrder());
    setRole("");
    setEmployeeId("none");
    // If there's already a final step, force isFinal to false and disable the option
    setIsFinal(false);
  }, [getNextAvailableOrder]);

  const handleFinalStepChange = (checked: boolean) => {
    if (checked && hasExistingFinalStep()) {
      const finalStep = getExistingFinalStep();
      toast.error(
          `Cannot mark as final. This approval workflow already has a final step: "${finalStep?.stepName}" (Order ${finalStep?.stepOrder})`,
          { duration: 5000 }
      );
      return;
    }
    setIsFinal(checked);
  };

  const handleSubmit = async () => {
    // Check if trying to add another step when final step exists
    if (hasExistingFinalStep()) {
      const finalStep = getExistingFinalStep();
      toast.error(
          `Cannot add more steps. The approval workflow already has a final step "${finalStep?.stepName}" (Order ${finalStep?.stepOrder}). No steps can be added after a final step.`,
          { duration: 5000 }
      );
      return;
    }

    if (!stepName.trim()) {
      toast.error("Step name is required");
      return;
    }

    if (!role || role.trim() === "") {
      toast.error("Approval role is required");
      return;
    }

    if (!leaveAppChainId) {
      toast.error("Chain ID is missing");
      return;
    }

    // Check if trying to add a final step when one already exists
    if (isFinal && hasExistingFinalStep()) {
      toast.error("Cannot create another final step. Only one final approval step is allowed.");
      return;
    }

    // Check if step order is already taken
    const isOrderTaken = existingSteps.some(s => s.stepOrder === stepOrder);
    if (isOrderTaken) {
      const availableOrders = getAvailableOrders();
      toast.error(`Step order ${stepOrder} is already taken. Available orders: ${availableOrders.join(", ")}`);
      setStepOrder(getNextAvailableOrder());
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        StepName: stepName.trim(),
        StepOrder: stepOrder,
        Role: role,
        EmployeeId: employeeId === "none" ? null : (employeeId as UUID),
        IsFinal: isFinal,
        LeaveAppChainId: leaveAppChainId,
        TimeoutHours: 7,
      };

      console.log("Creating step:", payload);
      await createStepMutation.mutateAsync(payload);

      toast.success(`Approval step "${stepName}" created successfully`);
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error:", error);
      console.error("Error response:", error?.response?.data);

      // Check for specific error messages
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create approval step";

      if (errorMessage.includes("duplicate") || errorMessage.includes("already exists")) {
        toast.error(`Step order ${stepOrder} is already taken. Please use order ${getNextAvailableOrder()}`);
        setStepOrder(getNextAvailableOrder());
      } else if (errorMessage.includes("final") || errorMessage.toLowerCase().includes("final")) {
        toast.error("Cannot create another final step. This workflow already has a final step.");
        setIsFinal(false);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      console.log("=== AddLeaveAppStepModal Debug ===");
      console.log("Existing steps:", existingSteps);
      console.log("Has final step:", hasExistingFinalStep());
      console.log("Final step details:", getExistingFinalStep());
      console.log("Available orders:", getAvailableOrders());

      setStepOrder(getNextAvailableOrder());
      setIsFinal(false);
    }
  }, [isOpen, existingSteps, getNextAvailableOrder, hasExistingFinalStep, getExistingFinalStep]);

  const finalStepExists = hasExistingFinalStep();
  const finalStep = getExistingFinalStep();
  const availableOrders = getAvailableOrders();

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <Plus size={20} className="text-purple-600" />
              <h2 className="text-lg font-semibold">Add Approval Step</h2>
            </div>
            <button
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-full p-2 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {finalStepExists ? (
              // Show disabled state when final step exists
              <div className="px-6 py-8">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield size={32} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">Workflow Complete</h3>
                  <p className="text-sm text-amber-700 mb-4">
                    This approval workflow already has a final step.
                  </p>
                  <div className="bg-white rounded-lg p-3 mb-4 text-left">
                    <p className="text-xs text-gray-500 mb-1">Final Step:</p>
                    <p className="font-medium text-gray-800">
                      Step {finalStep?.stepOrder}: {finalStep?.stepName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    No more steps can be added after the final step. The workflow will end here.
                  </p>
                  <Button
                      variant="outline"
                      onClick={handleClose}
                      className="mt-4"
                  >
                    Close
                  </Button>
                </div>
              </div>
          ) : (
              // Normal form when no final step exists
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="px-6 py-4 space-y-4">
                  {/* Current Steps Summary */}
                  {existingSteps.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-2">Current Approval Flow:</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {existingSteps
                              .sort((a, b) => a.stepOrder - b.stepOrder)
                              .map((step, idx) => (
                                  <React.Fragment key={step.stepOrder}>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            {step.stepOrder}. {step.stepName}
                          </span>
                                    {idx < existingSteps.length - 1 && (
                                        <span className="text-gray-400 text-xs">→</span>
                                    )}
                                  </React.Fragment>
                              ))}
                        </div>
                      </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stepName" className="text-sm text-gray-700 font-medium">
                        Step Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          id="stepName"
                          value={stepName}
                          onChange={(e) => setStepName(e.target.value)}
                          disabled={isLoading}
                          placeholder="e.g. Manager Approval"
                          required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stepOrder" className="block text-sm font-medium text-gray-700">
                        Step Order <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          id="stepOrder"
                          type="number"
                          min={availableOrders[0] || 1}
                          max={availableOrders[availableOrders.length - 1] || existingSteps.length + 1}
                          value={stepOrder}
                          onChange={(e) => {
                            let value = parseInt(e.target.value);
                            if (isNaN(value)) value = getNextAvailableOrder();
                            if (availableOrders.includes(value)) {
                              setStepOrder(value);
                            } else {
                              toast.error(`Order ${value} is not available. Available: ${availableOrders.join(", ")}`);
                              setStepOrder(getNextAvailableOrder());
                            }
                          }}
                          disabled={isLoading}
                          required
                      />
                      {existingSteps.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            Available orders: {availableOrders.join(", ")}
                          </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Approval Role <span className="text-red-500">*</span>
                    </Label>
                    <Select value={role} onValueChange={setRole} disabled={isLoading}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Approval Role" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {roleOptions.map((option) => (
                            <SelectItem key={option.key} value={option.key}>
                              {option.value}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee" className="block text-sm font-medium text-gray-700">
                      Specific Approver (Optional)
                    </Label>
                    <Select value={employeeId} onValueChange={setEmployeeId} disabled={isLoading}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any user with selected role" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        <SelectItem value="none">Any user with selected role</SelectItem>
                        {employeeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      If assigned, only this specific person can approve. Leave empty for role-based approval.
                    </p>
                  </div>

                  <div className="rounded-lg px-1 py-2 space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={isFinal}
                          onChange={(e) => handleFinalStepChange(e.target.checked)}
                          disabled={isLoading || hasExistingFinalStep()}
                          className="h-4 w-4 accent-purple-600"
                      />
                      <span className="text-sm text-gray-700">Final approval step</span>
                    </label>
                    {isFinal && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          Warning: Once marked as final, no more steps can be added to this workflow.
                        </p>
                    )}
                    {hasExistingFinalStep() && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          This workflow already has a final step. Cannot add another final step.
                        </p>
                    )}
                  </div>
                </div>

                <div className="border-t px-6 py-4 rounded-b-xl">
                  <div className="flex flex-row-reverse justify-center items-center gap-3">
                    <Button
                        variant="outline"
                        className="cursor-pointer px-6 border-gray-300 hover:bg-gray-100"
                        onClick={handleClose}
                        type="button"
                        disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer px-6"
                        type="submit"
                        disabled={isLoading || !stepName.trim() || !role}
                    >
                      {isLoading ? "Creating..." : "Create Step"}
                    </Button>
                  </div>
                </div>
              </form>
          )}
        </motion.div>
      </div>
  );
};

export default AddLeaveAppStepModal;