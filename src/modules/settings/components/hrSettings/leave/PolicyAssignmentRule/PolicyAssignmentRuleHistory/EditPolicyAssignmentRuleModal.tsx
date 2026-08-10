import { useState, useEffect } from "react";
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
import type { UUID } from "@/modules/core/types/Settings/policyAssignmentRule";
import toast from "react-hot-toast";
import { Priority } from "@/modules/core/types/enum";
import type { PolicyAssignmentRuleListDto, PolicyAssignmentRuleModDto } from "@/modules/core/types/Settings/policyAssignmentRule";

interface EditPolicyAssignmentRuleModalProps {
  onClose: () => void;
  isOpen: boolean;
  policyAssignmetRule: PolicyAssignmentRuleListDto | null;
  onEditPolicyAssignmetRule: (
    policyAssignmentRule: PolicyAssignmentRuleModDto,
  ) => Promise<void>;
}

const EditPolicyAssignmentRuleModal: React.FC<EditPolicyAssignmentRuleModalProps> = ({
  isOpen,
  onClose,
  policyAssignmetRule,
  onEditPolicyAssignmetRule,
}) => {
  const [formData, setFormData] = useState<PolicyAssignmentRuleModDto>({
    id: "" as UUID,
    code: "",
    name: "",
    priority: Priority["0"],
    isActive: true,
    effectiveFrom: "",
    effectiveTo: null,
    rowVersion: "",
  });

  const [errors, setErrors] = useState<{
    code?: string;
    name?: string;
    priority?: string;
    effectiveFrom?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const priorityOptions = Object.entries(Priority);

  useEffect(() => {
    if (policyAssignmetRule) {
      const formatDate = (date?: string | null) =>
        date ? date.split("T")[0] : "";
       const priorityKey =
         Object.entries(Priority).find(
           ([key, label]) => label === policyAssignmetRule.priority,
         )?.[0] ?? "0";
      setFormData({
        id: policyAssignmetRule.id,
        code: policyAssignmetRule.code || "",
        name: policyAssignmetRule.name || "",
        priority: priorityKey,
        isActive: policyAssignmetRule.isActive ?? true,
        effectiveFrom: formatDate(policyAssignmetRule.effectiveFrom) || "",
        effectiveTo: formatDate(policyAssignmetRule.effectiveTo )|| null,
        rowVersion: policyAssignmetRule.rowVersion || "",
      });
    }
  }, [policyAssignmetRule]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Code is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = "Effective from date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      await onEditPolicyAssignmetRule(formData);
      toast.success("Policy assignment rule updated successfully");
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update policy assignment rule");
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        id: "" as UUID,
        code: "",
        name: "",
        priority: Priority["0"],
        isActive: true,
        effectiveFrom: "",
        effectiveTo: null,
        rowVersion: "",
      });
      setErrors({});
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      handleClose();
    }
  };
  if (!isOpen || !policyAssignmetRule) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <BadgePlus size={20} className="text-green-500" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Edit Policy Assignment Rule
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close modal"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className={`w-full ${
                    errors.code
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                  placeholder="e.g. PAR-001"
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`w-full ${
                    errors.name
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                  placeholder="e.g. Executive Leave Rule"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger className="w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Effective From <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      effectiveFrom: e.target.value,
                    }))
                  }
                  className={`w-full ${
                    errors.effectiveFrom
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.effectiveFrom && (
                  <p className="text-sm text-red-500">{errors.effectiveFrom}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Effective To <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  type="date"
                  value={formData.effectiveTo || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      effectiveTo: e.target.value || null,
                    }))
                  }
                  disabled={isLoading}
                  min={formData.effectiveFrom}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditPolicyAssignmentRuleModal;