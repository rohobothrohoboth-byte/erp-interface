import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, BadgePlus } from "lucide-react";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import toast from "react-hot-toast";
import type { PaymentApprovalChainAddDto } from "./types";

interface AddPaymentApprovalChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChain: (chain: PaymentApprovalChainAddDto) => Promise<void>;
}

const AddPaymentApprovalChainModal: React.FC<AddPaymentApprovalChainModalProps> = ({
  isOpen,
  onClose,
  onAddChain,
}) => {
  const [formData, setFormData] = useState<PaymentApprovalChainAddDto>({
    chain_name: '',
    branch_id: undefined,
    effective_from: new Date(),
    effective_to: null,
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mock branches - replace with actual API call
  const branches = [
    { id: 'BOLE_01', name: 'Bole Branch' },
    { id: 'PIASSA_01', name: 'Piassa Branch' },
    { id: 'MERKATO_01', name: 'Merkato Branch' },
    { id: 'HEAD_OFFICE', name: 'Head Office' },
  ];

  useEffect(() => {
    if (isOpen) {
      setFormErrors({});
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      chain_name: '',
      branch_id: undefined,
      effective_from: new Date(),
      effective_to: null,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.chain_name.trim()) errors.chain_name = "Chain name is required";
    if (!formData.effective_from) errors.effective_from = "Effective From is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
      await onAddChain(formData);
      toast.success("Payment approval chain added successfully");
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add payment approval chain");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <BadgePlus size={20} className="text-green-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Add Payment Approval Chain
              </h2>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-5 py-3 space-y-3">
            {/* Chain Name */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700 font-medium">
                Chain Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                name="chain_name"
                value={formData.chain_name}
                onChange={handleChange}
                placeholder="e.g. Major Expense Approval Chain"
                className={`w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  formErrors.chain_name ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {formErrors.chain_name && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.chain_name}
                </p>
              )}
            </div>

            {/* Branch (Optional) */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700 font-medium">
                Branch (Optional)
              </Label>
              <Select
                value={formData.branch_id || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    branch_id: value === "none" ? undefined : value,
                  }))
                }
                disabled={loading}
              >
                <SelectTrigger className="w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <SelectValue placeholder="Select branch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Effective From */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700 font-medium">
                Effective From <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                name="effective_from"
                value={new Date(formData.effective_from).toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    effective_from: new Date(e.target.value),
                  }))
                }
                className={`w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  formErrors.effective_from ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {formErrors.effective_from && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.effective_from}
                </p>
              )}
            </div>

            {/* Effective To */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700 font-medium">
                Effective To
              </Label>
              <Input
                type="date"
                name="effective_to"
                value={
                  formData.effective_to
                    ? new Date(formData.effective_to).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    effective_to: e.target.value ? new Date(e.target.value) : null,
                  }))
                }
                className="w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-2 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="px-6 min-w-25"
                onClick={handleCancel}
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
                {loading ? "Saving..." : "Save Chain"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddPaymentApprovalChainModal;
