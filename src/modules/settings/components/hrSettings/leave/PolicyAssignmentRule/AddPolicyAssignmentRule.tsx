// AddPolicyAssignmentRuleModal.tsx
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X, BadgePlus, Shield, Calendar, Hash, FileText } from "lucide-react";
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
import type { PolicyAssignmentRuleAddDto } from "@/modules/core/types/Settings/policyAssignmentRule";
import { Priority } from "@/modules/core/types/enum";

interface AddPolicyAssignmentRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPolicyAssignmentRule: (policyRule: PolicyAssignmentRuleAddDto) => Promise<any>;
  leavePolicyId: string;
}

const AddPolicyAssignmentRuleModal: React.FC<AddPolicyAssignmentRuleModalProps> = ({
                                                                                     isOpen,
                                                                                     onClose,
                                                                                     onAddPolicyAssignmentRule,
                                                                                     leavePolicyId,
                                                                                   }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<string>(Priority["0"]);
  const [effectiveFrom, setEffectiveFrom] = useState<string>("");
  const [effectiveTo, setEffectiveTo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const priorityOptions = Object.entries(Priority);
  const [leaveTypeId, setLeaveTypeId] = useState<string>("");
  const [leaveTypes, setLeaveTypes] = useState<{ id: string; name: string }[]>([]);
  const resetForm = () => {
    setCode("");
    setName("");
    setPriority(Priority["0"]);
    setEffectiveFrom("");
    setEffectiveTo("");
    setActiveStep(1);
  };

  const validateStep1 = () => {
    if (!code.trim()) {
      toast.error("Code is required");
      return false;
    }
    if (!name.trim()) {
      toast.error("Name is required");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!effectiveFrom) {
      toast.error("Effective from date is required");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setActiveStep(2);
    }
  };
  useEffect(() => {
    if (isOpen) {
      fetchLeaveTypes();
    }
  }, [isOpen]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await api.get('/hrm/leave/v1/Policy/Type/Names');
      setLeaveTypes(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
  };
  const handleBack = () => {
    setActiveStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const payload: PolicyAssignmentRuleAddDto = {
        code: code.trim(),
        name: name.trim(),
        priority,
        effectiveFrom,
        effectiveTo: effectiveTo || null,
        leavePolicyId,

      };

      // Add detailed logging
      console.log("=== SUBMITTING POLICY ASSIGNMENT RULE ===");
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("leavePolicyId:", leavePolicyId);
      console.log("priority value:", priority);
      console.log("priority as number:", Number(priority));

      const response = await onAddPolicyAssignmentRule(payload);
      console.log("Response from API:", response);

      toast.success("Policy assignment rule created successfully");
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Full error object:", error);
      console.error("Error response:", error?.response?.data);
      toast.error(error?.response?.data?.message || error?.message || "Failed to create policy assignment rule");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!isLoading) onClose();
  }, [isLoading, onClose]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen && !effectiveFrom) {
      const today = new Date().toISOString().split("T")[0];
      setEffectiveFrom(today);
    }
  }, [isOpen, effectiveFrom]);

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-xl w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <BadgePlus size={20} className="text-emerald-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-800">Add Policy Assignment Rule</h2>
                <p className="text-xs text-gray-500">Step {activeStep} of 2: {activeStep === 1 ? 'Basic Information' : 'Effective Dates'}</p>
              </div>
            </div>
            <button onClick={handleClose} disabled={isLoading} className="rounded-full p-2 hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-1 rounded-full ${activeStep >= 1 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-1 rounded-full ${activeStep >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Basic Information</span>
              <span>Effective Dates</span>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="px-6 py-4 space-y-4">
              {/* Step 1: Basic Information */}
              {activeStep === 1 && (
                  <>
                    <div className="bg-amber-50 p-3 rounded-lg mb-4">
                      <h3 className="font-medium text-amber-800 flex items-center gap-2 text-sm">
                        <Shield size={16} /> Assignment Rule Details
                      </h3>
                      <p className="text-xs text-amber-600">Define the basic identifiers for this assignment rule</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700 font-medium flex items-center gap-1">
                          <Hash size={14} /> Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            disabled={isLoading}
                            placeholder="e.g., PAR-001"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <FileText size={14} /> Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            placeholder="e.g., Executive Leave Rule"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Hash size={14} /> Priority <span className="text-red-500">*</span>
                      </Label>
                      <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Higher priority rules are evaluated first</p>
                    </div>
                  </>
              )}

              {/* Step 2: Effective Dates */}
              {activeStep === 2 && (
                  <>
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <h3 className="font-medium text-blue-800 flex items-center gap-2 text-sm">
                        <Calendar size={16} /> Validity Period
                      </h3>
                      <p className="text-xs text-blue-600">Define when this assignment rule becomes active</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700 font-medium">
                          Effective From <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            value={effectiveFrom}
                            onChange={(e) => setEffectiveFrom(e.target.value)}
                            disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700 font-medium">
                          Effective To <span className="text-gray-400">(Optional)</span>
                        </Label>
                        <Input
                            type="date"
                            value={effectiveTo}
                            onChange={(e) => setEffectiveTo(e.target.value)}
                            disabled={isLoading}
                            min={effectiveFrom}
                        />
                        <p className="text-xs text-gray-500">Leave empty if no expiration</p>
                      </div>
                    </div>
                  </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose} type="button" disabled={isLoading}>
                  Cancel
                </Button>
                {activeStep === 1 ? (
                    <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Next: Effective Dates →
                    </Button>
                ) : (
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleBack} disabled={isLoading}>← Back</Button>
                      <Button
                          type="submit"
                          disabled={isLoading || !code.trim() || !name.trim() || !effectiveFrom}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isLoading ? "Saving..." : "Save Rule"}
                      </Button>
                    </div>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
  );
};

export default AddPolicyAssignmentRuleModal;