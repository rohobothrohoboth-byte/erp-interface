// AddLeavePolicyConfigModal.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  BadgePlus,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  Shield,
  Users
} from "lucide-react";
import { Button } from "../../../../../ui/button";
import { Label } from "../../../../../ui/label";
import { Input } from "../../../../../ui/input";
import List from "../../../../../List/list";
import type { ListItem } from "../../../../../../types/List/list";
import type {
  LeavePolicyConfigAddDto,
  UUID,
} from "../../../../../../types/core/Settings/leavePolicyConfig";
import type { NameListItem } from "../../../../../../types/NameList/nameList";
import toast from "react-hot-toast";
import { useCreateLeavePolicyConfig } from "../../../../../../services/core/settings/ModHrm/LeavePolicyConfigService/leavePolicyConfig.queries";

interface AddLeavePolicyConfigModalProps {
  onClose: () => void;
  isOpen: boolean;
  leavePolicyId: UUID;
  fiscalYear: NameListItem[] | null | undefined;
}

const AddLeavePolicyConfigModal: React.FC<AddLeavePolicyConfigModalProps> = ({
                                                                               isOpen,
                                                                               onClose,
                                                                               leavePolicyId,
                                                                               fiscalYear,
                                                                             }) => {
  const activeFiscalYearId = (fiscalYear && fiscalYear.length > 0)
      ? fiscalYear[0]?.id as UUID
      : "" as UUID;

  const [activeStep, setActiveStep] = useState(1);
  const [newConfig, setNewConfig] = useState<LeavePolicyConfigAddDto>({
    annualEntitlement: 0,
    accrualFrequency: "",
    accrualRate: 0,
    maxDaysPerReq: 0,
    maxCarryOverDays: 0,
    minServiceMonths: 0,
    fiscalYearId: activeFiscalYearId,
    leavePolicyId: leavePolicyId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createMutation = useCreateLeavePolicyConfig();
  const isLoading = createMutation.isPending;

  const accrualFrequencyOptions = [
    { id: 'Monthly', name: 'Monthly', description: 'Accrued each month' },
    { id: 'Quarterly', name: 'Quarterly', description: 'Accrued every 3 months' },
    { id: 'Semi-Annually', name: 'Semi-Annually', description: 'Accrued twice a year' },
    { id: 'Annually', name: 'Annually', description: 'Accrued once per year' },
  ];

  useEffect(() => {
    if (fiscalYear && fiscalYear.length > 0 && fiscalYear[0]?.id) {
      setNewConfig(prev => ({ ...prev, fiscalYearId: fiscalYear[0]?.id as UUID }));
    }
  }, [fiscalYear]);

  const handleSelectAccrualFrequency = (item: ListItem) => {
    setNewConfig((prev) => ({ ...prev, accrualFrequency: item.id }));
    if (errors.accrualFrequency) setErrors((prev) => ({ ...prev, accrualFrequency: undefined }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!newConfig.annualEntitlement || newConfig.annualEntitlement <= 0) {
      newErrors.annualEntitlement = "Annual entitlement must be greater than 0";
    }
    if (!newConfig.accrualFrequency.trim()) {
      newErrors.accrualFrequency = "Accrual frequency is required";
    }
    if (!newConfig.accrualRate || newConfig.accrualRate <= 0) {
      newErrors.accrualRate = "Accrual rate must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!newConfig.maxDaysPerReq || newConfig.maxDaysPerReq <= 0) {
      newErrors.maxDaysPerReq = "Maximum days per request must be greater than 0";
    }
    if (newConfig.maxCarryOverDays < 0) {
      newErrors.maxCarryOverDays = "Maximum carry over days cannot be negative";
    }
    if (newConfig.minServiceMonths < 0) {
      newErrors.minServiceMonths = "Minimum service months must be 0 or greater";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 1 && validateStep1()) {
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const dataToSend: LeavePolicyConfigAddDto = {
        annualEntitlement: Number(newConfig.annualEntitlement),
        accrualFrequency: newConfig.accrualFrequency,
        accrualRate: Number(newConfig.accrualRate),
        maxDaysPerReq: Number(newConfig.maxDaysPerReq),
        maxCarryOverDays: Number(newConfig.maxCarryOverDays),
        minServiceMonths: Number(newConfig.minServiceMonths),
        fiscalYearId: newConfig.fiscalYearId,
        leavePolicyId: leavePolicyId,
      };

      await createMutation.mutateAsync(dataToSend);
      toast.success("Leave policy configuration added successfully!");
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add leave policy configuration");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNewConfig({
        annualEntitlement: 0,
        accrualFrequency: "",
        accrualRate: 0,
        maxDaysPerReq: 0,
        maxCarryOverDays: 0,
        minServiceMonths: 0,
        fiscalYearId: (fiscalYear && fiscalYear.length > 0) ? fiscalYear[0]?.id as UUID : "" as UUID,
        leavePolicyId: leavePolicyId,
      });
      setErrors({});
      setActiveStep(1);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6"
          onClick={(e) => { if (e.target === e.currentTarget && !isLoading) handleClose(); }}
      >
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <BadgePlus size={20} className="text-emerald-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-800">Add Leave Policy Configuration</h2>
                <p className="text-xs text-gray-500">Step {activeStep} of 2: {activeStep === 1 ? 'Accrual Settings' : 'Usage Limits'}</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100" disabled={isLoading}>
              <X size={20} />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-1 rounded-full transition-all ${activeStep >= 1 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-1 rounded-full transition-all ${activeStep >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Accrual Settings</span>
              <span>Usage Limits</span>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            {(!fiscalYear || fiscalYear.length === 0) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-yellow-700">No fiscal years available. Please add a fiscal year first.</span>
                </div>
            )}

            {activeStep === 1 ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <h3 className="font-medium text-blue-800 flex items-center gap-2 text-sm">
                      <TrendingUp size={16} /> Accrual Settings
                    </h3>
                    <p className="text-xs text-blue-600">Define how leave days are earned over time</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Annual Entitlement <span className="text-red-500">*</span></Label>
                      <Input
                          type="number" min="0" step="0.5"
                          value={newConfig.annualEntitlement === 0 ? "" : newConfig.annualEntitlement}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                            setNewConfig((prev) => ({ ...prev, annualEntitlement: value }));
                            if (errors.annualEntitlement) setErrors((prev) => ({ ...prev, annualEntitlement: undefined }));
                          }}
                          placeholder="Enter days (e.g., 20)"
                          className={errors.annualEntitlement ? "border-red-500" : ""}
                      />
                      {errors.annualEntitlement && <p className="text-xs text-red-500">{errors.annualEntitlement}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Accrual Frequency <span className="text-red-500">*</span></Label>
                      <List
                          items={accrualFrequencyOptions as any}
                          selectedValue={newConfig.accrualFrequency}
                          onSelect={handleSelectAccrualFrequency}
                          label="" placeholder="Select frequency" required
                      />
                      {errors.accrualFrequency && <p className="text-xs text-red-500">{errors.accrualFrequency}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Accrual Rate <span className="text-red-500">*</span></Label>
                      <Input
                          type="number" min="0" step="0.25"
                          value={newConfig.accrualRate === 0 ? "" : newConfig.accrualRate}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                            setNewConfig((prev) => ({ ...prev, accrualRate: value }));
                            if (errors.accrualRate) setErrors((prev) => ({ ...prev, accrualRate: undefined }));
                          }}
                          placeholder="Enter rate (e.g., 1.67)"
                          className={errors.accrualRate ? "border-red-500" : ""}
                      />
                      {errors.accrualRate && <p className="text-xs text-red-500">{errors.accrualRate}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Fiscal Year</Label>
                      <Input value={fiscalYear?.[0]?.name || "No fiscal year"} disabled className="bg-gray-50" />
                    </div>
                  </div>
                </div>
            ) : (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-3 rounded-lg mb-4">
                    <h3 className="font-medium text-purple-800 flex items-center gap-2 text-sm">
                      <Shield size={16} /> Usage Limits & Eligibility
                    </h3>
                    <p className="text-xs text-purple-600">Define maximum limits and eligibility requirements</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Max Days Per Request <span className="text-red-500">*</span></Label>
                      <Input
                          type="number" min="0" step="0.5"
                          value={newConfig.maxDaysPerReq === 0 ? "" : newConfig.maxDaysPerReq}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                            setNewConfig((prev) => ({ ...prev, maxDaysPerReq: value }));
                            if (errors.maxDaysPerReq) setErrors((prev) => ({ ...prev, maxDaysPerReq: undefined }));
                          }}
                          placeholder="Enter days (e.g., 30)"
                          className={errors.maxDaysPerReq ? "border-red-500" : ""}
                      />
                      {errors.maxDaysPerReq && <p className="text-xs text-red-500">{errors.maxDaysPerReq}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Max Carry Over Days</Label>
                      <Input
                          type="number" min="0"
                          value={newConfig.maxCarryOverDays === 0 ? "" : newConfig.maxCarryOverDays}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                            setNewConfig((prev) => ({ ...prev, maxCarryOverDays: value }));
                            if (errors.maxCarryOverDays) setErrors((prev) => ({ ...prev, maxCarryOverDays: undefined }));
                          }}
                          placeholder="Enter days (e.g., 5)"
                          className={errors.maxCarryOverDays ? "border-red-500" : ""}
                      />
                      {errors.maxCarryOverDays && <p className="text-xs text-red-500">{errors.maxCarryOverDays}</p>}
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Minimum Service Months</Label>
                      <Input
                          type="number" min="0"
                          value={newConfig.minServiceMonths === 0 ? "" : newConfig.minServiceMonths}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                            setNewConfig((prev) => ({ ...prev, minServiceMonths: value }));
                            if (errors.minServiceMonths) setErrors((prev) => ({ ...prev, minServiceMonths: undefined }));
                          }}
                          placeholder="Enter months (e.g., 6)"
                          className={errors.minServiceMonths ? "border-red-500" : ""}
                      />
                      <p className="text-xs text-gray-500">Minimum service period before employee becomes eligible</p>
                      {errors.minServiceMonths && <p className="text-xs text-red-500">{errors.minServiceMonths}</p>}
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
            <div className="flex justify-end items-center gap-3">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>Cancel</Button>
              {activeStep === 1 ? (
                  <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Next: Usage Limits →
                  </Button>
              ) : (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleBack} disabled={isLoading}>← Back</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!fiscalYear || fiscalYear.length === 0 || isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isLoading ? "Saving..." : "Add Configuration"}
                    </Button>
                  </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
  );
};

export default AddLeavePolicyConfigModal;