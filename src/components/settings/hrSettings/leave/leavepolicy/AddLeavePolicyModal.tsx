// AddLeavePolicyModal.tsx - Complete working version
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  X,
  BadgePlus,
  ChevronLeft,
  ChevronRight,
  Shield,
  DollarSign,
  Paperclip,
  Hash,
  FileText,
  CheckCircle
} from "lucide-react";
import { Button } from "../../../../ui/button";
import { Label } from "../../../../ui/label";
import { Input } from "../../../../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../ui/dropdown-menu";
import toast from "react-hot-toast";
import type {
  LeavePolicyAddDto,
  LeaveTypeOptionDto,
  UUID,
} from "../../../../../types/core/Settings/leavepolicy";

interface AddLeavePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLeavePolicy: (policy: LeavePolicyAddDto) => Promise<void>;
  leaveTypeOptions: LeaveTypeOptionDto[];
  loading?: boolean;
}

const AddLeavePolicyModal: React.FC<AddLeavePolicyModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onAddLeavePolicy,
                                                                   leaveTypeOptions = [],
                                                                   loading: externalLoading = false,
                                                                 }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<LeavePolicyAddDto>({
    code: "",
    name: "",
    allowEncashment: false,
    requiresAttachment: false,
    leaveTypeId: "" as UUID,
  });

  const [isLeaveTypeDropdownOpen, setIsLeaveTypeDropdownOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeOptionDto | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loading = externalLoading || internalLoading;

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      allowEncashment: false,
      requiresAttachment: false,
      leaveTypeId: "" as UUID,
    });
    setSelectedLeaveType(null);
    setFormErrors({});
    setActiveStep(1);
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Policy name is required";
    if (!formData.code.trim()) errors.code = "Policy code is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.leaveTypeId) errors.leaveTypeId = "Leave type is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 1 && validateStep1()) {
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep(1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLeaveTypeSelect = (leaveType: LeaveTypeOptionDto) => {
    setSelectedLeaveType(leaveType);
    setFormData((prev) => ({ ...prev, leaveTypeId: leaveType.id }));
    setIsLeaveTypeDropdownOpen(false);

    if (formErrors.leaveTypeId) {
      setFormErrors((prev) => ({ ...prev, leaveTypeId: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) {
      toast.error("Please select a leave type");
      return;
    }

    setInternalLoading(true);
    try {
      await onAddLeavePolicy(formData);
      toast.success("Leave policy created successfully");
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create leave policy");
    } finally {
      setInternalLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!loading) {
      resetForm();
      onClose();
    }
  }, [loading, onClose]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const isValidStep1 = formData.name.trim() && formData.code.trim();
  const isValidStep2 = formData.leaveTypeId;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <BadgePlus size={18} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Create Leave Policy</h2>
                <p className="text-xs text-gray-500">
                  Step {activeStep} of 2: {activeStep === 1 ? "Basic Information" : "Configuration"}
                </p>
              </div>
            </div>
            <button
                onClick={handleClose}
                disabled={loading}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-1 rounded-full transition-all ${activeStep >= 1 ? "bg-emerald-600" : "bg-gray-200"}`} />
              <div className={`flex-1 h-1 rounded-full transition-all ${activeStep >= 2 ? "bg-emerald-600" : "bg-gray-200"}`} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Basic Info</span>
              <span>Configuration</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-5">
              {/* Step 1: Basic Information */}
              {activeStep === 1 && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Shield size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Basic Policy Information</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Enter the core details for this leave policy
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Policy Name */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <FileText size={14} /> Policy Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Executive Annual Leave Policy"
                            className={formErrors.name ? "border-red-500" : ""}
                            disabled={loading}
                        />
                        {formErrors.name && (
                            <p className="text-xs text-red-500">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Policy Code */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Hash size={14} /> Policy Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="e.g., EXEC-AL-001"
                            className={formErrors.code ? "border-red-500" : ""}
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500">
                          Unique identifier for this policy
                        </p>
                        {formErrors.code && (
                            <p className="text-xs text-red-500">{formErrors.code}</p>
                        )}
                      </div>
                    </div>
                  </>
              )}

              {/* Step 2: Configuration */}
              {activeStep === 2 && (
                  <>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Shield size={18} className="text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Policy Configuration</span>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">
                        Configure leave type association and additional settings
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Leave Type Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Leave Type <span className="text-red-500">*</span>
                        </Label>
                        <DropdownMenu
                            open={isLeaveTypeDropdownOpen}
                            onOpenChange={setIsLeaveTypeDropdownOpen}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-full justify-between ${
                                    formErrors.leaveTypeId ? "border-red-500" : "border-gray-200"
                                } hover:bg-gray-50`}
                                disabled={loading}
                            >
                          <span className={!selectedLeaveType ? "text-gray-400" : "text-gray-700"}>
                            {selectedLeaveType?.name || "Select leave type"}
                          </span>
                              <span className="text-gray-400">▼</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-60 overflow-y-auto">
                            {leaveTypeOptions.length > 0 ? (
                                leaveTypeOptions.map((lt) => (
                                    <DropdownMenuItem
                                        key={lt.id}
                                        onClick={() => handleLeaveTypeSelect(lt)}
                                        className="text-sm cursor-pointer hover:bg-emerald-50"
                                    >
                                      {lt.name}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  No leave types available
                                </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {formErrors.leaveTypeId && (
                            <p className="text-xs text-red-500">{formErrors.leaveTypeId}</p>
                        )}
                      </div>

                      {/* Options Section */}
                      <div className="space-y-3 pt-2">
                        <p className="text-sm font-medium text-gray-700">Additional Options</p>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-emerald-50">
                                <DollarSign size={16} className="text-emerald-600" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Allow Encashment</span>
                                <p className="text-xs text-gray-500">Employees can cash out unused leave days</p>
                              </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.allowEncashment}
                                onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      allowEncashment: e.target.checked,
                                    })
                                }
                                className="h-4 w-4 accent-emerald-600 cursor-pointer"
                                disabled={loading}
                            />
                          </label>

                          <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-blue-50">
                                <Paperclip size={16} className="text-blue-600" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Requires Attachment</span>
                                <p className="text-xs text-gray-500">Supporting documents required for approval</p>
                              </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.requiresAttachment}
                                onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      requiresAttachment: e.target.checked,
                                    })
                                }
                                className="h-4 w-4 accent-emerald-600 cursor-pointer"
                                disabled={loading}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Summary Card */}
                      {selectedLeaveType && (
                          <div className="bg-gray-50 rounded-lg p-4 mt-2">
                            <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                              <CheckCircle size={12} className="text-emerald-600" />
                              Policy Summary
                            </p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Policy Name:</span>
                                <span className="font-medium text-gray-700">{formData.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Policy Code:</span>
                                <span className="font-mono text-gray-700">{formData.code}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Leave Type:</span>
                                <span className="text-gray-700">{selectedLeaveType.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Encashment:</span>
                                <span className="text-gray-700">{formData.allowEncashment ? "Yes" : "No"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Attachment Required:</span>
                                <span className="text-gray-700">{formData.requiresAttachment ? "Yes" : "No"}</span>
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                  </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Step {activeStep} of 2
                </div>
                <div className="flex gap-3">
                  {activeStep === 2 && (
                      <Button
                          type="button"
                          variant="outline"
                          onClick={handleBack}
                          className="flex items-center gap-1"
                          disabled={loading}
                      >
                        <ChevronLeft size={16} />
                        Back
                      </Button>
                  )}
                  {activeStep === 1 ? (
                      <Button
                          type="button"
                          onClick={handleNext}
                          disabled={!isValidStep1 || loading}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                      >
                        Next
                        <ChevronRight size={16} />
                      </Button>
                  ) : (
                      <Button
                          type="submit"
                          disabled={!isValidStep2 || loading}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {loading ? "Creating..." : "Create Policy"}
                      </Button>
                  )}
                  <Button
                      variant="outline"
                      onClick={handleClose}
                      type="button"
                      disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
  );
};

export default AddLeavePolicyModal;