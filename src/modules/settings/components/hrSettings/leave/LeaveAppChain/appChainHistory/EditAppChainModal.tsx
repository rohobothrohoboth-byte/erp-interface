import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Edit } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import toast from "react-hot-toast";
import type {
  LeaveAppChainListDto,
  LeaveAppChainModDto,
  UUID,
} from "@/modules/core/types/Settings/leaveAppChain";

interface EditLeaveAppChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  appChain: LeaveAppChainListDto | null;
  onEditLeaveAppChain: (appChain: LeaveAppChainModDto) => Promise<void>;
  leavePolicyId: UUID;
}

const EditAppChainModal: React.FC<EditLeaveAppChainModalProps> = ({
  isOpen,
  onClose,
  appChain,
  onEditLeaveAppChain,
  leavePolicyId,
}) => {
  const [formData, setFormData] = useState<LeaveAppChainModDto>({
    id: "" as UUID,
    leavePolicyId:"" as UUID,
    effectiveFrom: new Date(),
    effectiveTo: null,
    isActive: true,
    rowVersion: "",
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Create a proper close handler
  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [onClose, loading]);

  // Initialize form when appChain changes
  useEffect(() => {
    if (appChain) {
      setFormData({
        id: appChain.id,
        leavePolicyId: leavePolicyId,
        effectiveFrom: new Date(appChain.effectiveFrom),
        effectiveTo: appChain.effectiveTo
          ? new Date(appChain.effectiveTo)
          : null,
        isActive: appChain.isActive,
        rowVersion: appChain.rowVersion || "",
      });
      setFormErrors({});
    }
  }, [appChain]);

  // Add escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.effectiveFrom)
      errors.effectiveFrom = "Effective From is required";
    if (!formData.effectiveTo) errors.effectiveTo = "Effective To is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "effectiveFrom" || name === "effectiveTo") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? new Date(value) : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setLoading(true);
    try {
      await onEditLeaveAppChain(formData);
      toast.success("Leave AppChain updated successfully");
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update leave AppChain");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appChain) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Edit size={20} className="text-green-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Edit Leave AppChain
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Effective From */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700 font-medium">
                Effective From <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                name="effectiveFrom"
                value={
                  new Date(formData.effectiveFrom).toISOString().split("T")[0]
                }
                onChange={handleChange}
                className={`w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  formErrors.effectiveFrom ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {formErrors.effectiveFrom && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.effectiveFrom}
                </p>
              )}
            </div>

            {/* Effective To */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700 font-medium">
                Effective To <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                name="effectiveTo"
                value={
                  formData.effectiveTo
                    ? new Date(formData.effectiveTo).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleChange}
                className={`w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  formErrors.effectiveTo ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {formErrors.effectiveTo && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.effectiveTo}
                </p>
              )}
            </div>

            {/* Is Active Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded bg-green-600"
                disabled={loading}
              />
              <Label htmlFor="isActive" className="text-sm text-gray-700">
                Is Active
              </Label>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="px-6 min-w-[100px]"
                onClick={handleClose}
                disabled={loading}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="flex cursor-pointer items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap w-full sm:w-auto"
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditAppChainModal;
