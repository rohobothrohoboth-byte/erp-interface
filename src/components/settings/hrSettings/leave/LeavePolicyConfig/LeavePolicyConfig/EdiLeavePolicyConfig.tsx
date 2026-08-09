import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Edit,
  Calendar,
  TrendingUp,
  Shield,
  Users,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "../../../../../ui/button";
import { Label } from "../../../../../ui/label";
import { Input } from "../../../../../ui/input";
import List from "../../../../../List/list";
import type { ListItem } from "../../../../../../types/List/list";
import type {
  LeavePolicyConfigModDto,
  UUID,
  LeavePolicyConfigListDto,
} from "../../../../../../types/core/Settings/leavePolicyConfig";
import type { NameListItem } from "../../../../../../types/NameList/nameList";
import { AccrualFrequency } from "../../../../../../types/core/enum";
import toast from "react-hot-toast";

interface EditLeavePolicyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LeavePolicyConfigListDto | null;
  fiscalYears: NameListItem[];
  onUpdateConfig: (configData: LeavePolicyConfigModDto) => Promise<void>;
}

const EditLeavePolicyConfigModal: React.FC<EditLeavePolicyConfigModalProps> = ({
                                                                                 isOpen,
                                                                                 onClose,
                                                                                 config,
                                                                                 fiscalYears = [],
                                                                                 onUpdateConfig
                                                                               }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<LeavePolicyConfigModDto | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Convert AccrualFrequency enum for dropdown
  const accrualFrequencyOptions = [
    { id: 'Monthly', name: 'Monthly', description: 'Accrued each month' },
    { id: 'Quarterly', name: 'Quarterly', description: 'Accrued every 3 months' },
    { id: 'Semi-Annually', name: 'Semi-Annually', description: 'Accrued twice a year' },
    { id: 'Annually', name: 'Annually', description: 'Accrued once per year' },
  ];

  // Initialize form when config changes
  useEffect(() => {
    if (config && isOpen) {
      setFormData({
        id: config.id,
        annualEntitlement: config.annualEntitlement,
        accrualFrequency: config.accrualFrequency || config.accrualFrequencyStr || "Monthly",
        accrualRate: config.accrualRate,
        maxDaysPerReq: config.maxDaysPerReq,
        maxCarryOverDays: config.maxCarryOverDays,
        minServiceMonths: config.minServiceMonths,
        isActive: config.isActive,
        fiscalYearId: config.fiscalYearId || (fiscalYears[0]?.id as UUID) || '' as UUID,
        rowVersion: config.rowVersion || ''
      });
      setErrors({});
      setActiveStep(1);
    }
  }, [config, isOpen, fiscalYears]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(null);
      setErrors({});
      setIsLoading(false);
      setActiveStep(1);
    }
  }, [isOpen]);

  // Prepare list items
  const fiscalYearListItems: ListItem[] = (fiscalYears || [])
      .filter(item => item && item.id && item.name)
      .map(item => ({ id: item.id, name: item.name }));

  const handleSelectFiscalYear = (item: ListItem) => {
    if (formData) {
      setFormData(prev => ({ ...prev!, fiscalYearId: item.id as UUID }));
      if (errors.fiscalYearId) setErrors(prev => ({ ...prev, fiscalYearId: undefined }));
    }
  };

  const handleSelectAccrualFrequency = (item: ListItem) => {
    if (formData) {
      setFormData(prev => ({ ...prev!, accrualFrequency: item.id }));
      if (errors.accrualFrequency) setErrors(prev => ({ ...prev, accrualFrequency: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    if (!formData) return false;
    const newErrors: Record<string, string> = {};
    if (!formData.annualEntitlement || formData.annualEntitlement <= 0) {
      newErrors.annualEntitlement = "Annual entitlement must be greater than 0";
    }
    if (!formData.accrualFrequency?.trim()) {
      newErrors.accrualFrequency = "Accrual frequency is required";
    }
    if (!formData.accrualRate || formData.accrualRate <= 0) {
      newErrors.accrualRate = "Accrual rate must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    if (!formData) return false;
    const newErrors: Record<string, string> = {};
    if (!formData.maxDaysPerReq || formData.maxDaysPerReq <0) {
      newErrors.maxDaysPerReq = "Maximum days per request must be greater than 0";
    }
    if (formData.maxCarryOverDays < 0) {
      newErrors.maxCarryOverDays = "Maximum carry over days cannot be negative";
    }
    if (formData.minServiceMonths < 0) {
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
    if (!formData || !validateStep2()) {
      toast.error('Please fix the errors in the form');
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
        isActive: formData.isActive,
        fiscalYearId: formData.fiscalYearId,
        rowVersion: formData.rowVersion
      };

      await onUpdateConfig(dataToSend);
      toast.success('Leave policy configuration updated successfully!');
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update leave policy configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Show loading state while formData is being initialized
  if (!formData) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading configuration...</p>
          </div>
        </div>
    );
  }

  const isStep1Valid = formData.annualEntitlement > 0 &&
      formData.accrualFrequency?.trim() &&
      formData.accrualRate > 0;

  const isStep2Valid = formData.maxDaysPerReq > 0 &&
      formData.maxCarryOverDays >= 0 &&
      formData.minServiceMonths > 0;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Edit size={18} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Edit Leave Policy Configuration</h2>
                <p className="text-xs text-gray-500">
                  Step {activeStep} of 2: {activeStep === 1 ? 'Accrual Settings' : 'Usage Limits'}
                </p>
              </div>
            </div>
            <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isLoading}
            >
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

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Step 1: Accrual Settings */}
            {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <h3 className="font-medium text-blue-800 flex items-center gap-2 text-sm">
                      <TrendingUp size={16} /> Accrual Settings
                    </h3>
                    <p className="text-xs text-blue-600">Define how leave days are earned over time</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Annual Entitlement <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.annualEntitlement === 0 ? "" : formData.annualEntitlement}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                            setFormData(prev => ({ ...prev!, annualEntitlement: value }));
                            if (errors.annualEntitlement) setErrors(prev => ({ ...prev, annualEntitlement: undefined }));
                          }}
                          placeholder="Enter days (e.g., 20)"
                          className={errors.annualEntitlement ? "border-red-500" : ""}
                          disabled={isLoading}
                      />
                      {errors.annualEntitlement && <p className="text-xs text-red-500">{errors.annualEntitlement}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Accrual Frequency <span className="text-red-500">*</span>
                      </Label>
                      <List
                          items={accrualFrequencyOptions as any}
                          selectedValue={formData.accrualFrequency}
                          onSelect={handleSelectAccrualFrequency}
                          label=""
                          placeholder="Select frequency"
                          required
                          disabled={isLoading}
                      />
                      {errors.accrualFrequency && <p className="text-xs text-red-500">{errors.accrualFrequency}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Accrual Rate <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          type="number"
                          min="0"
                          step="0.25"
                          value={formData.accrualRate === 0 ? "" : formData.accrualRate}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                            setFormData(prev => ({ ...prev!, accrualRate: value }));
                            if (errors.accrualRate) setErrors(prev => ({ ...prev, accrualRate: undefined }));
                          }}
                          placeholder="Enter rate (e.g., 1.67)"
                          className={errors.accrualRate ? "border-red-500" : ""}
                          disabled={isLoading}
                      />
                      {errors.accrualRate && <p className="text-xs text-red-500">{errors.accrualRate}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Fiscal Year</Label>
                      <List
                          items={fiscalYearListItems}
                          selectedValue={formData.fiscalYearId}
                          onSelect={handleSelectFiscalYear}
                          label=""
                          placeholder="Select fiscal year"
                          disabled={isLoading}
                      />
                      {errors.fiscalYearId && <p className="text-xs text-red-500">{errors.fiscalYearId}</p>}
                    </div>
                  </div>
                </div>
            )}

            {/* Step 2: Usage Limits */}
            {activeStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-3 rounded-lg mb-4">
                    <h3 className="font-medium text-purple-800 flex items-center gap-2 text-sm">
                      <Shield size={16} /> Usage Limits & Eligibility
                    </h3>
                    <p className="text-xs text-purple-600">Define maximum limits and eligibility requirements</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Max Days Per Request <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.maxDaysPerReq === 0 ? "" : formData.maxDaysPerReq}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                            setFormData(prev => ({ ...prev!, maxDaysPerReq: value }));
                            if (errors.maxDaysPerReq) setErrors(prev => ({ ...prev, maxDaysPerReq: undefined }));
                          }}
                          placeholder="Enter days (e.g., 30)"
                          className={errors.maxDaysPerReq ? "border-red-500" : ""}
                          disabled={isLoading}
                      />
                      {errors.maxDaysPerReq && <p className="text-xs text-red-500">{errors.maxDaysPerReq}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Max Carry Over Days</Label>
                      <Input
                          type="number"
                          min="0"
                          value={formData.maxCarryOverDays === 0 ? "" : formData.maxCarryOverDays}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                            setFormData(prev => ({ ...prev!, maxCarryOverDays: value }));
                            if (errors.maxCarryOverDays) setErrors(prev => ({ ...prev, maxCarryOverDays: undefined }));
                          }}
                          placeholder="Enter days (e.g., 5)"
                          className={errors.maxCarryOverDays ? "border-red-500" : ""}
                          disabled={isLoading}
                      />
                      {errors.maxCarryOverDays && <p className="text-xs text-red-500">{errors.maxCarryOverDays}</p>}
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Minimum Service Months</Label>
                      <Input
                          type="number"
                          min="0"
                          value={formData.minServiceMonths === 0 ? "" : formData.minServiceMonths}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                            setFormData(prev => ({ ...prev!, minServiceMonths: value }));
                            if (errors.minServiceMonths) setErrors(prev => ({ ...prev, minServiceMonths: undefined }));
                          }}
                          placeholder="Enter months (e.g., 6)"
                          className={errors.minServiceMonths ? "border-red-500" : ""}
                          disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">Minimum service period before employee becomes eligible</p>
                      {errors.minServiceMonths && <p className="text-xs text-red-500">{errors.minServiceMonths}</p>}
                    </div>

                    {/* Status Checkbox */}
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev!, isActive: !prev?.isActive }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                formData.isActive ? "bg-emerald-600" : "bg-gray-300"
                            }`}
                            disabled={isLoading}
                        >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.isActive ? "translate-x-6" : "translate-x-1"
                      }`} />
                        </button>
                        <span className="text-sm text-gray-700">
                      {formData.isActive ? "Active Configuration" : "Inactive Configuration"}
                    </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Inactive configurations will not be used for new leave assignments
                      </p>
                    </div>
                  </div>
                </div>
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
                        disabled={isLoading}
                    >
                      ← Back
                    </Button>
                )}
                {activeStep === 1 ? (
                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStep1Valid || isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                    >
                      Next: Usage Limits →
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isStep2Valid || isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Updating...
                          </div>
                      ) : (
                          "Update Configuration"
                      )}
                    </Button>
                )}
                <Button
                    variant="outline"
                    onClick={handleClose}
                    type="button"
                    disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default EditLeavePolicyConfigModal;