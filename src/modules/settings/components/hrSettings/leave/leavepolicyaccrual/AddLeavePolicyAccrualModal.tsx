import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Settings, BadgePlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import toast from 'react-hot-toast';
import type { UUID } from '@/modules/core/types/Settings/leavepolicy';
import List from '@/modules/list/components/list';
import type { ListItem } from '@/modules/list/types/list';

interface AddLeavePolicyAccrualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accrualData: any) => Promise<void>;
  policyId: UUID;
  policyName: string;
}

const AddLeavePolicyAccrualModal: React.FC<AddLeavePolicyAccrualModalProps> = ({
  isOpen,
  onClose,
  onSave,
  policyId,
}) => {
  const [formData, setFormData] = useState({
    entitlement: '',
    frequency: '',
    accrualRate: '',
    minServiceMonths: '',
    maxCarryoverDays: '',
    carryoverExpiryDays: ''
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Convert frequency options to ListItem format
  const frequencyOptions: ListItem[] = [
    { id: 'Monthly' as UUID, name: 'Monthly' },
    { id: 'Annual' as UUID, name: 'Annual' },
  ];

  // Find the selected frequency item to pass to List component
  const selectedFrequencyItem = frequencyOptions.find(item => item.id === formData.frequency);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setFormErrors({});
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      entitlement: '',
      frequency: '',
      accrualRate: '',
      minServiceMonths: '',
      maxCarryoverDays: '',
      carryoverExpiryDays: ''
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.entitlement || parseFloat(formData.entitlement) <= 0) {
      errors.entitlement = "Annual entitlement must be greater than 0";
    }

    if (!formData.frequency) {
      errors.frequency = "Accrual frequency is required";
    }

    if (!formData.accrualRate || parseFloat(formData.accrualRate) <= 0) {
      errors.accrualRate = "Accrual rate must be greater than 0";
    }

    if (!formData.minServiceMonths || parseInt(formData.minServiceMonths) < 0) {
      errors.minServiceMonths = "Minimum service months must be a valid number";
    }

    if (!formData.maxCarryoverDays || parseFloat(formData.maxCarryoverDays) < 0) {
      errors.maxCarryoverDays = "Maximum carryover days must be a valid number";
    }

    if (!formData.carryoverExpiryDays || parseInt(formData.carryoverExpiryDays) < 0) {
      errors.carryoverExpiryDays = "Carryover expiry must be a valid number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setLoading(true);

    try {
      await onSave({
        ...formData,
        leavePolicyId: policyId,
        entitlement: parseFloat(formData.entitlement),
        accrualRate: parseFloat(formData.accrualRate),
        minServiceMonths: parseInt(formData.minServiceMonths),
        maxCarryoverDays: parseFloat(formData.maxCarryoverDays),
        carryoverExpiryDays: parseInt(formData.carryoverExpiryDays),
      });

      toast.success("Accrual rule added successfully");
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add accrual rule';
      toast.error(errorMessage);
      console.error("Error adding accrual rule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFrequencySelect = (item: ListItem) => {
    handleChange('frequency', item.id);
  };

  const handleCancel = () => {
    if (!loading) {
      resetForm();
      setFormErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <BadgePlus className="h-5 w-5" />
            <h2 className="text-lg font-bold text-gray-800">Add New</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6">
            <div className="py-4 space-y-4">
              {/* Annual Entitlement */}
              <div>
                <label htmlFor="entitlement" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Entitlement (days) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="entitlement"
                    step="0.5"
                    min="0.5"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                      focus:outline-none focus:ring-emerald-500 focus:border-emerald-500
                      text-sm transition-colors ${formErrors.entitlement ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="e.g., 20"
                    value={formData.entitlement}
                    onChange={(e) => handleChange('entitlement', e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {formErrors.entitlement && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.entitlement}</p>
                )}
              </div>

              {/* Frequency and Accrual Rate - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Accrual Frequency - Using List Component */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accrual Frequency <span className="text-red-500">*</span>
                  </label>
                  <List
                    items={frequencyOptions}
                    selectedValue={selectedFrequencyItem ? selectedFrequencyItem.id : undefined}
                    onSelect={handleFrequencySelect}
                    label=""
                    placeholder="Select frequency"
                    required
                    disabled={loading}
                  />
                  {formErrors.frequency && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.frequency}</p>
                  )}
                </div>

                {/* Accrual Rate */}
                <div>
                  <label htmlFor="accrualRate" className="block text-sm font-medium text-gray-700 mb-1">
                    Accrual Rate (days/period) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="accrualRate"
                      step="0.01"
                      min="0.01"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                        focus:outline-none focus:ring-emerald-500 focus:border-emerald-500
                        text-sm transition-colors ${formErrors.accrualRate ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="e.g., 1.67"
                      value={formData.accrualRate}
                      onChange={(e) => handleChange('accrualRate', e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {formErrors.accrualRate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.accrualRate}</p>
                  )}
                </div>
              </div>

              {/* Service and Carryover Settings - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Minimum Service Months */}
                <div>
                  <label htmlFor="minServiceMonths" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Service Months <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="minServiceMonths"
                      min="0"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                        focus:outline-none focus:ring-emerald-500 focus:border-emerald-500
                        text-sm transition-colors ${formErrors.minServiceMonths ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="e.g., 3"
                      value={formData.minServiceMonths}
                      onChange={(e) => handleChange('minServiceMonths', e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {formErrors.minServiceMonths && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.minServiceMonths}</p>
                  )}
                </div>

                {/* Maximum Carryover Days */}
                <div>
                  <label htmlFor="maxCarryoverDays" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Carryover Days <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="maxCarryoverDays"
                      step="0.5"
                      min="0"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                        focus:outline-none focus:ring-emerald-500 focus:border-emerald-500
                        text-sm transition-colors ${formErrors.maxCarryoverDays ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="e.g., 10"
                      value={formData.maxCarryoverDays}
                      onChange={(e) => handleChange('maxCarryoverDays', e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Settings className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {formErrors.maxCarryoverDays && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.maxCarryoverDays}</p>
                  )}
                </div>

                {/* Carryover Expiry Days */}
                <div>
                  <label htmlFor="carryoverExpiryDays" className="block text-sm font-medium text-gray-700 mb-1">
                    Carryover Expiry (days) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="carryoverExpiryDays"
                      min="0"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                        focus:outline-none focus:ring-emerald-500 focus:border-emerald-500
                        text-sm transition-colors ${formErrors.carryoverExpiryDays ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="e.g., 90"
                      value={formData.carryoverExpiryDays}
                      onChange={(e) => handleChange('carryoverExpiryDays', e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {formErrors.carryoverExpiryDays && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.carryoverExpiryDays}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 rounded-b-xl">
            <div className="flex flex-row-reverse justify-center items-center gap-3">
              <Button
                variant="outline"
                className="cursor-pointer px-6 border-gray-300 hover:bg-gray-100"
                onClick={handleCancel}
                type="button"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-6"
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddLeavePolicyAccrualModal;