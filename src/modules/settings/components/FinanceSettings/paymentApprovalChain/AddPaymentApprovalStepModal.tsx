import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X, BadgePlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import toast from "react-hot-toast";
import type { PaymentApprovalStepAddDto } from "@/modules/settings/components/FinanceSettings/paymentApprovalChain/types";

interface AddPaymentApprovalStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStep: (step: PaymentApprovalStepAddDto) => Promise<any>;
  employees: Array<{ id: string; name: string }>;
}

const AddPaymentApprovalStepModal: React.FC<AddPaymentApprovalStepModalProps> = ({
  isOpen,
  onClose,
  onAddStep,
  employees,
}) => {
  const [stepName, setStepName] = useState("");
  const [stepOrder, setStepOrder] = useState<number>(1);
  const [approverRole, setApproverRole] = useState<string>("FINANCE_MANAGER");
  const [isFinal, setIsFinal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>("none");

  // Approval roles for payment
  const approverRoles = [
    { value: "FINANCE_MANAGER", label: "Finance Manager" },
    { value: "DEPARTMENT_HEAD", label: "Department Head" },
    { value: "FINANCE_DIRECTOR", label: "Finance Director" },
    { value: "CFO", label: "Chief Financial Officer" },
    { value: "CEO", label: "Chief Executive Officer" },
  ];

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: employee.name,
  }));

  const resetForm = () => {
    setStepName("");
    setStepOrder(1);
    setApproverRole("FINANCE_MANAGER");
    setEmployeeId("none");
    setIsFinal(false);
  };

  const handleSubmit = async () => {
    if (!stepName.trim()) {
      toast.error("Step name is required");
      return;
    }

    if (!approverRole || approverRole.trim() === "") {
      toast.error("Approver role is required");
      return;
    }

    setIsLoading(true);
    try {
      const payload: PaymentApprovalStepAddDto = {
        step_name: stepName.trim(),
        step_order: stepOrder,
        approver_role: approverRole,
        employee_id: employeeId === "none" ? null : employeeId,
        is_final: isFinal,
      };

      console.log("Sending payload:", payload);
      await onAddStep(payload);
      toast.success("Approval step created successfully");
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create approval step");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  }, [isLoading, onClose]);

  // Escape key support
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, handleClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const selectedEmployee = employees.find((emp) => emp.id === employeeId);
  const selectedEmployeeName = employeeId === "none" ? "No Employee Selected" : (selectedEmployee?.name || "");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-2">
          <div className="flex items-center gap-2">
            <BadgePlus size={20} className="text-green-600" />
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Body */}
          <div className="px-6 py-3 space-y-3">
            {/* Step Name and Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="stepName"
                  className="text-sm text-gray-700 font-medium"
                >
                  Step Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    value={stepName}
                    onChange={(e) => setStepName(e.target.value)}
                    disabled={isLoading}
                    placeholder="e.g. Manager Approval"
                    className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="stepOrder"
                  className="block text-sm font-medium text-gray-700"
                >
                  Step Order <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={stepOrder}
                  onChange={(e) => setStepOrder(parseInt(e.target.value) || 1)}
                  disabled={isLoading}
                  placeholder="e.g. 1"
                  className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1">
              <Label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Approver Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={approverRole}
                onValueChange={setApproverRole}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <SelectValue placeholder="Select Approver Role">
                    {approverRoles.find((r) => r.value === approverRole)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {approverRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employee Selection */}
            <div className="space-y-1">
              <Label
                htmlFor="employee"
                className="block text-sm font-medium text-gray-700"
              >
                Employee (Optional)
              </Label>
              <Select
                value={employeeId}
                onValueChange={setEmployeeId}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <SelectValue placeholder="Select Employee (Optional)">
                    {selectedEmployeeName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="none">No Employee Selected</SelectItem>
                  {employeeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Boolean Options */}
            <div className="rounded-lg px-1 py-1 space-y-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFinal}
                  onChange={(e) => setIsFinal(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span className="text-sm text-gray-700">
                  Final approval step
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-2 rounded-b-xl">
            <div className="flex flex-row-reverse justify-center items-center gap-3">
              <Button
                variant="outline"
                className="cursor-pointer px-6 hover:bg-gray-100"
                onClick={handleClose}
                type="button"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-6"
                type="submit"
                disabled={isLoading || !stepName.trim() || !approverRole.trim()}
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddPaymentApprovalStepModal;
