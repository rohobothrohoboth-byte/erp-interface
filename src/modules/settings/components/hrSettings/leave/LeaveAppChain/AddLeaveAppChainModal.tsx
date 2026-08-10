import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  GitBranch,
  Info,
  Shield
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import toast from "react-hot-toast";
import type {
  LeaveAppChainAddDto,
  UUID,
} from "@/modules/core/types/Settings/leaveAppChain";

interface AddLeaveAppChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  leavePolicyId: UUID;
  onAddLeaveAppChain: (appChain: LeaveAppChainAddDto) => Promise<void>;
  existingChains?: Array<{ effectiveFrom: Date; effectiveTo: Date | null }>;
}

const AddLeaveAppChainModal: React.FC<AddLeaveAppChainModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       leavePolicyId,
                                                                       onAddLeaveAppChain,
                                                                       existingChains = [],
                                                                     }) => {
  const [effectiveFrom, setEffectiveFrom] = useState<string>("");
  const [effectiveTo, setEffectiveTo] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    effectiveFrom?: string;
    effectiveTo?: string;
    duplicate?: string;
    overlap?: string;
  }>({});

  // Check for date overlap with existing chains
  const checkDateOverlap = useCallback((fromDate: Date, toDate: Date | null): boolean => {
    return existingChains.some(chain => {
      const chainFrom = new Date(chain.effectiveFrom);
      const chainTo = chain.effectiveTo ? new Date(chain.effectiveTo) : null;

      // Check if date ranges overlap
      const fromOverlap = fromDate >= chainFrom && fromDate <= (chainTo || fromDate);
      const toOverlap = toDate && toDate >= chainFrom && toDate <= (chainTo || toDate);
      const containsOverlap = fromDate <= chainFrom && (!toDate || toDate >= chainFrom);

      return fromOverlap || toOverlap || containsOverlap;
    });
  }, [existingChains]);

  const validateForm = (): boolean => {
    const newErrors: { effectiveFrom?: string; effectiveTo?: string; overlap?: string } = {};

    if (!effectiveFrom) {
      newErrors.effectiveFrom = "Effective From date is required";
    } else {
      const fromDate = new Date(effectiveFrom);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (fromDate < today) {
        newErrors.effectiveFrom = "Effective From cannot be in the past";
      }

      // Check for overlap
      const toDate = effectiveTo ? new Date(effectiveTo) : null;
      if (checkDateOverlap(fromDate, toDate)) {
        newErrors.overlap = "This date range overlaps with an existing approval chain";
      }
    }

    if (effectiveTo) {
      const toDate = new Date(effectiveTo);
      const fromDate = new Date(effectiveFrom);

      if (toDate < fromDate) {
        newErrors.effectiveTo = "Effective To must be after Effective From";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const completeData: LeaveAppChainAddDto = {
        leavePolicyId: leavePolicyId,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      };

      console.log("Submitting approval chain:", completeData);
      await onAddLeaveAppChain(completeData);
      toast.success("Leave approval chain created successfully");
      onClose();
    } catch (error: any) {
      console.error("Error adding chain:", error);

      const errorMessage = error?.response?.data?.message || error?.message || "";

      if (errorMessage.includes("duplicate key") || errorMessage.includes("already exists")) {
        setErrors({
          duplicate: `An approval chain already exists for ${new Date(effectiveFrom).toLocaleDateString()}`
        });
        toast.error("Duplicate entry: An approval chain with this date already exists");
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to create approval chain");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, loading, onClose]);

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setEffectiveFrom(`${year}-${month}-${day}`);
      setEffectiveTo("");
      setDescription("");
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
      <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <GitBranch size={22} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Approval Chain</h2>
                        <p className="text-xs text-purple-100 mt-0.5">
                          Configure workflow validity period
                        </p>
                      </div>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                        disabled={loading}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
                  <div className="px-6 py-5 space-y-5">
                    {/* Info Banner */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-blue-800">Approval Workflow</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Define when this approval chain becomes active. You can create multiple chains for different time periods.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Error Alerts */}
                    {errors.duplicate && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50 rounded-xl p-4 border border-red-200"
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-800">Cannot Create Chain</p>
                              <p className="text-xs text-red-700 mt-1">{errors.duplicate}</p>
                            </div>
                          </div>
                        </motion.div>
                    )}

                    {errors.overlap && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-amber-50 rounded-xl p-4 border border-amber-200"
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-amber-800">Date Range Overlap</p>
                              <p className="text-xs text-amber-700 mt-1">{errors.overlap}</p>
                            </div>
                          </div>
                        </motion.div>
                    )}

                    {/* Effective From */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Calendar size={16} className="text-purple-600" />
                        Effective From
                        <span className="text-red-500 text-xs">*</span>
                      </Label>
                      <Input
                          type="date"
                          value={effectiveFrom}
                          onChange={(e) => {
                            setEffectiveFrom(e.target.value);
                            setErrors({});
                          }}
                          className={`focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                              errors.effectiveFrom ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"
                          }`}
                          disabled={loading}
                      />
                      {errors.effectiveFrom && (
                          <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                            <AlertCircle size={12} />
                            {errors.effectiveFrom}
                          </p>
                      )}
                      <p className="text-xs text-gray-500">
                        The date when this approval chain becomes active
                      </p>
                    </div>

                    {/* Effective To */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Clock size={16} className="text-purple-600" />
                        Effective To
                        <span className="text-gray-400 text-xs">(Optional)</span>
                      </Label>
                      <Input
                          type="date"
                          value={effectiveTo}
                          onChange={(e) => {
                            setEffectiveTo(e.target.value);
                            setErrors({});
                          }}
                          className={`focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors.effectiveTo ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"
                          }`}
                          disabled={loading}
                          min={effectiveFrom}
                      />
                      {errors.effectiveTo && (
                          <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                            <AlertCircle size={12} />
                            {errors.effectiveTo}
                          </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Leave empty if this chain has no expiration date
                      </p>
                    </div>

                    {/* Preview Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 mt-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Shield size={16} className="text-purple-600" />
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Chain Summary
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-xs text-gray-500">From:</span>
                          <span className="text-sm font-medium text-gray-800">
                        {effectiveFrom ? new Date(effectiveFrom).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "—"}
                      </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-gray-200">
                          <span className="text-xs text-gray-500">To:</span>
                          <span className="text-sm font-medium text-gray-800">
                        {effectiveTo ? new Date(effectiveTo).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : (
                            <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={14} />
                            No expiration
                          </span>
                        )}
                      </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-gray-200">
                          <span className="text-xs text-gray-500">Status:</span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Active from start date
                      </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Footer */}
                  <div className="border-t px-6 py-4 bg-gray-50">
                    <div className="flex justify-end gap-3">
                      <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={loading}
                          type="button"
                          className="px-6 hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </Button>
                      <Button
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 min-w-[120px] transition-all shadow-md hover:shadow-lg"
                          type="submit"
                          disabled={loading || !effectiveFrom}
                      >
                        {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating...
                            </>
                        ) : (
                            "Create Chain"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
        )}
      </AnimatePresence>
  );
};

export default AddLeaveAppChainModal;