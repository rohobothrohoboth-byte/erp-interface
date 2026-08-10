import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import List from "@/modules/list/components/list";
import type { ListItem } from "@/modules/list/types/list";
import type {
  LeavePolicyConfigListDto,
  LeavePolicyConfigModDto,
  UUID,
} from "@/modules/core/types/Settings/leavePolicyConfig";
import type { NameListItem } from "@/modules/list/types/NameList/nameList";
import toast from "react-hot-toast";
import { AccrualFrequency } from "@/modules/core/types/enum";

interface EditLeavePolicyConfigModalProps {
  onClose: () => void;
  isOpen: boolean;
  leavePolicyId: UUID;
  leavePolicyConfig: LeavePolicyConfigListDto | null;
  fiscalYear: NameListItem[];
  onEditLeavePolicyConfig: (
    leavePolicyConfig: LeavePolicyConfigModDto,
  ) => Promise<void>;
}

const EditLeavePolicyConfigModal: React.FC<EditLeavePolicyConfigModalProps> = ({
  isOpen,
  onClose,
  leavePolicyId,
  leavePolicyConfig,
  fiscalYear,
  onEditLeavePolicyConfig,
}) => {
  const [formData, setFormData] = useState<
    Omit<LeavePolicyConfigModDto, "id" | "rowVersion" | "isActive"> & {
      id: UUID;
      rowVersion: string;
      isActive: boolean;
    }
  >({
    id: "" as UUID,
    annualEntitlement: 0,
    accrualFrequency: "",
    accrualRate: 0,
    maxDaysPerReq: 0,
    maxCarryOverDays: 0,
    minServiceMonths: 0,
    fiscalYearId: "" as UUID,
    rowVersion: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<{
    annualEntitlement?: string;
    accrualFrequency?: string;
    accrualRate?: string;
    maxDaysPerReq?: string;
    maxCarryOverDays?: string;
    minServiceMonths?: string;
    fiscalYearId?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  // Accrual frequency options
  const accrualFrequencyOptions = Object.entries(AccrualFrequency).map(
    ([key, value]) => ({
      id: key,
      name: value,
    }),
  );

  // Get the current fiscal year ID from the fiscalYear list
  // Assuming the first item in fiscalYear array is the active/current one
  const activeFiscalYearId = (fiscalYear[0]?.id as UUID) || ("" as UUID);

  // Initialize form with existing data when modal opens
  useEffect(() => {
    if (leavePolicyConfig && fiscalYear.length > 0) {
      // Find the fiscal year ID by matching the fiscalYear name from leavePolicyConfig
      // with the fiscalYear list
      const fiscalYearItem = fiscalYear.find(
        (fy) => fy.name === leavePolicyConfig.fiscalYear,
      );

      const fiscalYearId = (fiscalYearItem?.id as UUID) || activeFiscalYearId;

      // Convert accrualFrequencyStr back to enum key for the form
      const accrualFrequencyKey = Object.entries(AccrualFrequency).find(
        ([key, value]) => value === leavePolicyConfig.accrualFrequencyStr
      )?.[0] || leavePolicyConfig.accrualFrequency || "";

      setFormData({
        id: leavePolicyConfig.id,
        annualEntitlement: leavePolicyConfig.annualEntitlement || 0,
        accrualFrequency: accrualFrequencyKey,
        accrualRate: leavePolicyConfig.accrualRate || 0,
        maxDaysPerReq: leavePolicyConfig.maxDaysPerReq || 0,
        maxCarryOverDays: leavePolicyConfig.maxCarryOverDays || 0,
        minServiceMonths: leavePolicyConfig.minServiceMonths || 0,
        fiscalYearId: fiscalYearId,
        rowVersion: leavePolicyConfig.rowVersion || "",
        isActive: leavePolicyConfig.isActive ?? true,
      });
    }
  }, [leavePolicyConfig, fiscalYear, activeFiscalYearId]);

  const handleSelectAccrualFrequency = (item: ListItem) => {
    setFormData((prev) => ({ ...prev, accrualFrequency: item.id }));
    if (errors.accrualFrequency)
      setErrors((prev) => ({ ...prev, accrualFrequency: undefined }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.annualEntitlement || formData.annualEntitlement <= 0) {
      newErrors.annualEntitlement = "Annual entitlement must be greater than 0";
    }

    if (!formData.accrualFrequency.trim()) {
      newErrors.accrualFrequency = "Accrual frequency is required";
    }

    if (!formData.accrualRate || formData.accrualRate <= 0) {
      newErrors.accrualRate = "Accrual rate must be greater than 0";
    }

    if (!formData.maxDaysPerReq || formData.maxDaysPerReq <= 0) {
      newErrors.maxDaysPerReq =
        "Maximum days per request must be greater than 0";
    }

    if (formData.maxCarryOverDays < 0) {
      newErrors.maxCarryOverDays = "Maximum carry over days cannot be negative";
    }

    if (formData.minServiceMonths < 0) {
      newErrors.minServiceMonths = "Minimum service months cannot be negative";
    }

    if (!formData.fiscalYearId ) {
      newErrors.fiscalYearId = "Fiscal year is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!leavePolicyConfig) {
      toast.error("No configuration data found");
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend: LeavePolicyConfigModDto = {
        id: formData.id,
        annualEntitlement: Number(formData.annualEntitlement),
        accrualFrequency: formData.accrualFrequency,
        accrualRate: Number(formData.accrualRate),
        maxDaysPerReq: Number(formData.maxDaysPerReq),
        maxCarryOverDays: Number(formData.maxCarryOverDays),
        minServiceMonths: Number(formData.minServiceMonths),
        fiscalYearId: formData.fiscalYearId,
        rowVersion: formData.rowVersion,
        isActive: formData.isActive,
      };

      console.log("Sending data to API:", dataToSend);

      await onEditLeavePolicyConfig(dataToSend);

      toast.success("Leave policy configuration updated successfully!");
      handleClose();
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to update leave policy configuration";
      toast.error(errorMessage);
      console.error("Error updating leave policy configuration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        id: "" as UUID,
        annualEntitlement: 0,
        accrualFrequency: "",
        accrualRate: 0,
        maxDaysPerReq: 0,
        maxCarryOverDays: 0,
        minServiceMonths: 0,
        fiscalYearId: activeFiscalYearId,
        rowVersion: "",
        isActive: true,
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

  if (!isOpen || !leavePolicyConfig) return null;

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
        className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[80vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-green-500" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Edit Leave Policy Configuration
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

        {/* Body */}
        <div className="px-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column */}
            <div>
              {/* Annual Entitlement */}
              <div className="space-y-1 min-h-[76px]">
                <Label className="text-sm font-medium text-gray-700">
                  Annual Entitlement <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.annualEntitlement || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      annualEntitlement: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={`w-full ${
                    errors.annualEntitlement
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.annualEntitlement && (
                  <p className="text-sm text-red-500">
                    {errors.annualEntitlement}
                  </p>
                )}
              </div>

              {/* Accrual Rate */}
              <div className="space-y-1 min-h-[76px]">
                <Label className="text-sm font-medium text-gray-700">
                  Accrual Rate <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.accrualRate || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accrualRate: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={`w-full ${
                    errors.accrualRate
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.accrualRate && (
                  <p className="text-sm text-red-500">{errors.accrualRate}</p>
                )}
              </div>

              {/* Max Days Per Request */}
              <div className="space-y-1 min-h-[76px]">
                <Label className="text-sm font-medium text-gray-700">
                  Max Days Per Request <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.maxDaysPerReq || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxDaysPerReq: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={`w-full ${
                    errors.maxDaysPerReq
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.maxDaysPerReq && (
                  <p className="text-sm text-red-500">{errors.maxDaysPerReq}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Minimum Service Months */}
              <div className="space-y-1 min-h-[76px]">
                <Label className="text-sm font-medium text-gray-700">
                  Minimum Service Months
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minServiceMonths || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minServiceMonths: parseInt(e.target.value) || 0,
                    }))
                  }
                  className={`w-full ${
                    errors.minServiceMonths
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.minServiceMonths && (
                  <p className="text-sm text-red-500">
                    {errors.minServiceMonths}
                  </p>
                )}
              </div>

              {/* Accrual Frequency */}
              <div className="space-y-1 min-h-[76px]">
                <Label className="text-sm font-medium text-gray-700">
                  Accrual Frequency <span className="text-red-500">*</span>
                </Label>
                <List
                  items={accrualFrequencyOptions as any}
                  selectedValue={formData.accrualFrequency as UUID}
                  onSelect={handleSelectAccrualFrequency}
                  label=""
                  placeholder="Select frequency"
                  required
                  disabled={isLoading}
                />
                {errors.accrualFrequency && (
                  <p className="text-sm text-red-500">
                    {errors.accrualFrequency}
                  </p>
                )}
              </div>

              {/* Max Carry Over Days */}
              <div className="space-y-1 min-h-[76px]">
                <Label className="text-sm font-medium text-gray-700">
                  Max Carry Over Days
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.maxCarryOverDays || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxCarryOverDays: parseInt(e.target.value) || 0,
                    }))
                  }
                  className={`w-full ${
                    errors.maxCarryOverDays
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.maxCarryOverDays && (
                  <p className="text-sm text-red-500">
                    {errors.maxCarryOverDays}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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

export default EditLeavePolicyConfigModal;
