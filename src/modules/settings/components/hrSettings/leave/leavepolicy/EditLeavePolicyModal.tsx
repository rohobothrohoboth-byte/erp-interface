// EditLeavePolicyModal.tsx - Update the initialization and submission

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Edit } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import type {
  UUID,
  LeavePolicyModDto,
  LeavePolicyListDto,
  LeaveTypeOptionDto,
} from "@/modules/core/types/Settings/leavepolicy";
import { Check } from "lucide-react";

interface EditLeavePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: LeavePolicyListDto | null;
  leaveTypeOptions: LeaveTypeOptionDto[];
  onSave: (updatedPolicy: LeavePolicyModDto) => Promise<void>;
}

const EditLeavePolicyModal: React.FC<EditLeavePolicyModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     policy,
                                                                     leaveTypeOptions,
                                                                     onSave,
                                                                   }) => {
  const [formData, setFormData] = useState<Partial<LeavePolicyModDto> | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeOptionDto | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isActiveDropdownOpen, setIsActiveDropdownOpen] = useState(false);

  // Initialize form when modal opens or policy changes
  useEffect(() => {
    if (isOpen && policy) {
      // IMPORTANT: Include the rowVersion from the original policy
      setFormData({
        id: policy.id,
        code: policy.code || '',
        name: policy.name || '',
        leaveTypeId: policy.leaveTypeId || '',
        allowEncashment: policy.allowEncashment || false,
        requiresAttachment: policy.requiresAttachment || false,
        status: policy.status === "Active" ? "Active" : "Inactive",
        rowVersion: (policy as any).rowVersion || (policy as any).rowVersion || '', // Get rowVersion
      });

      const selected = leaveTypeOptions.find(
          (lt) => lt.id === policy.leaveTypeId
      ) || null;
      setSelectedLeaveType(selected);
      setFormErrors({});
    }
  }, [isOpen, policy, leaveTypeOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (formData) {
      let newValue: any = type === "checkbox" ? checked : value;
      setFormData({ ...formData, [name]: newValue });
    }

    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLeaveTypeSelect = (leaveType: LeaveTypeOptionDto) => {
    setSelectedLeaveType(leaveType);
    if (formData) setFormData({ ...formData, leaveTypeId: leaveType.id });
    setIsDropdownOpen(false);
    if (formErrors.leaveTypeId)
      setFormErrors((prev) => ({ ...prev, leaveTypeId: "" }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData?.name?.trim()) errors.name = "Policy Name is required";
    if (!formData?.code?.trim()) errors.code = "Code is required";
    if (!formData?.status) errors.status = "Status is required";
    if (!formData?.leaveTypeId) errors.leaveTypeId = "Leave Type is required";
    if (!formData?.rowVersion) errors.rowVersion = "RowVersion is required"; // Add validation
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    // Prepare the data for submission - MUST include rowVersion
    const submitData: LeavePolicyModDto = {
      id: formData.id!,
      code: formData.code!,
      name: formData.name!,
      leaveTypeId: formData.leaveTypeId!,
      allowEncashment: formData.allowEncashment || false,
      requiresAttachment: formData.requiresAttachment || false,
      status: formData.status === "Active" ? "Active" : "Inactive",
      rowVersion: formData.rowVersion!, // CRITICAL: Include rowVersion
    };

    console.log('Submitting update with data:', submitData);

    setLoading(true);
    try {
      await onSave(submitData);
      toast.success("Leave policy updated successfully");
      onClose();
    } catch (error: any) {
      const errorMsg = error.message || "Failed to update leave policy";
      toast.error(errorMsg);
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  if (!isOpen || !formData) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-screen">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-3 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <Edit size={20} />
              <h2 className="text-lg font-bold text-gray-800">
                Edit Leave Policy
              </h2>
            </div>
            <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700 font-medium">
                  Policy Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Eg. Annual Leave Policy 2024"
                    required
                />
                {formErrors.name && (
                    <p className="text-red-500 text-sm">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Code */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700 font-medium">
                    Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      name="code"
                      value={formData.code || ''}
                      onChange={handleChange}
                      placeholder="Eg. POL24"
                      required
                  />
                  {formErrors.code && (
                      <p className="text-red-500 text-sm">{formErrors.code}</p>
                  )}
                </div>

                {/* Leave Type */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700 font-medium">
                    Leave Type <span className="text-red-500">*</span>
                  </Label>
                  <DropdownMenu
                      open={isDropdownOpen}
                      onOpenChange={setIsDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                          variant="outline"
                          className="w-full justify-between border-gray-300"
                      >
                        {selectedLeaveType?.name || "Select a leave type"}
                        <svg
                            className={`h-4 w-4 opacity-50 transition-transform ${
                                isDropdownOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) max-h-60 overflow-y-auto">
                      {leaveTypeOptions.map((lt) => {
                        const isSelected = selectedLeaveType?.id === lt.id;
                        return (
                            <DropdownMenuItem
                                key={lt.id}
                                onClick={() => handleLeaveTypeSelect(lt)}
                                className={`flex items-center justify-between ${
                                    isSelected ? "bg-gray-50" : ""
                                }`}
                            >
                              <span>{lt.name}</span>
                              {isSelected && (
                                  <Check className="h-4 w-4 text-gray-600" />
                              )}
                            </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {formErrors.leaveTypeId && (
                      <p className="text-red-500 text-sm">
                        {formErrors.leaveTypeId}
                      </p>
                  )}
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-700 font-medium">
                  Status <span className="text-red-500">*</span>
                </Label>
                <DropdownMenu
                    open={isActiveDropdownOpen}
                    onOpenChange={setIsActiveDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between border-gray-300"
                    >
                      {formData.status === "Active" ? "Active" : "Inactive"}
                      <svg
                          className={`h-4 w-4 opacity-50 transition-transform ${
                              isActiveDropdownOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                    <DropdownMenuItem
                        onClick={() => {
                          if (formData) setFormData({ ...formData, status: "Active" });
                          setIsActiveDropdownOpen(false);
                          if (formErrors.status)
                            setFormErrors((prev) => ({ ...prev, status: "" }));
                        }}
                        className="flex items-center justify-between"
                    >
                      <span>Active</span>
                      {formData.status === "Active" && (
                          <Check className="h-4 w-4 text-gray-600" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                          if (formData) setFormData({ ...formData, status: "Inactive" });
                          setIsActiveDropdownOpen(false);
                          if (formErrors.status)
                            setFormErrors((prev) => ({ ...prev, status: "" }));
                        }}
                        className="flex items-center justify-between"
                    >
                      <span>Inactive</span>
                      {formData.status === "Inactive" && (
                          <Check className="h-4 w-4 text-gray-600" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {formErrors.status && (
                    <p className="text-red-500 text-sm">{formErrors.status}</p>
                )}
              </div>

              {/* Boolean checkboxes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="allowEncashment"
                        checked={formData.allowEncashment || false}
                        onChange={handleChange}
                        className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="text-sm text-gray-700">
                    Allow Encashment
                  </span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="requiresAttachment"
                        checked={formData.requiresAttachment || false}
                        onChange={handleChange}
                        className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="text-sm text-gray-700">
                    Requires Attachment
                  </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose} type="button">
                Cancel
              </Button>
              <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
  );
};

export default EditLeavePolicyModal;