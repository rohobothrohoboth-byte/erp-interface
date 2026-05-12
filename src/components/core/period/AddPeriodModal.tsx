import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, BadgePlus } from "lucide-react";
import { Button } from "../../ui/button";
import type { AddPeriodDto, UUID } from "../../../types/core/period";
import toast from "react-hot-toast";
import List from "../../List/list";
import type { ListItem } from "../../../types/List/list";
import { fiscalYearApi } from "../../../services/core/fiscalyear/fisc.api";
import { Quarter } from "../../../types/core/enum";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "@radix-ui/react-label";

interface AddPeriodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPeriod: AddPeriodDto;
  setNewPeriod: (period: AddPeriodDto) => void;
  onAddPeriod: () => Promise<any>;
}

export const AddPeriodModal = ({
  open,
  onOpenChange,
  newPeriod,
  setNewPeriod,
  onAddPeriod,
}: AddPeriodModalProps) => {
  const [loading, setLoading] = useState(false);
  const [fiscalYears, setFiscalYears] = useState<ListItem[]>([]);
  const [loadingFiscalYears, setLoadingFiscalYears] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const quarterOptions = Object.entries(Quarter).map(([key, value]) => ({
    key,
    value,
  }));

  useEffect(() => {
    if (open) {
      fetchFiscalYears();
      setFormErrors({});
    }
  }, [open]);

  const fetchFiscalYears = async () => {
    try {
      setLoadingFiscalYears(true);
      const fiscalYearsData = await fiscalYearApi.getAllFiscalYears();
      const fiscalYearListItems: ListItem[] = fiscalYearsData.map((fy) => ({
        id: fy.id,
        name: fy.name,
      }));
      setFiscalYears(fiscalYearListItems);
    } catch (error) {
      console.error("Error fetching fiscal years:", error);
      toast.error("Failed to load fiscal years");
      setFiscalYears([]);
    } finally {
      setLoadingFiscalYears(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newPeriod.name?.trim()) {
      errors.name = "Period name is required";
    }

    if (!newPeriod.dateStart) {
      errors.dateStart = "Start date is required";
    }

    if (!newPeriod.dateEnd) {
      errors.dateEnd = "End date is required";
    }

    if (!newPeriod.quarter) {
      errors.quarterId = "Quarter is required";
    }

    if (!newPeriod.fiscalYearId) {
      errors.fiscalYearId = "Fiscal year is required";
    }

    // Date validation
    if (newPeriod.dateStart && newPeriod.dateEnd) {
      const startDate = new Date(newPeriod.dateStart);
      const endDate = new Date(newPeriod.dateEnd);

      if (endDate <= startDate) {
        errors.dateEnd = "End date must be after start date";
      }
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
      const response = await onAddPeriod();
      
      const successMessage = 
        response?.data?.message || 
        response?.message || 
        '';
      
      toast.success(successMessage);
      
      // Only close modal if successful
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.message || '';
      toast.error(errorMessage);
      console.error("Error adding period:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuarterChange = (value: string) => {
    // Convert string to Quarter type
    setNewPeriod({ ...newPeriod, quarter: value as Quarter });
    // Clear error for this field
    if (formErrors.quarterId) {
      setFormErrors((prev) => ({ ...prev, quarterId: "" }));
    }
  };

  const handleSelectFiscalYear = (item: ListItem) => {
    setNewPeriod({
      ...newPeriod,
      fiscalYearId: item.id as UUID,
    });
    // Clear error for this field
    if (formErrors.fiscalYearId) {
      setFormErrors((prev) => ({ ...prev, fiscalYearId: "" }));
    }
  };

  const handleInputChange = (field: keyof AddPeriodDto, value: string) => {
    setNewPeriod({ ...newPeriod, [field]: value });
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCancel = () => {
    if (!loading) {
      // Reset form
      setNewPeriod({
        name: "",
        dateStart: new Date().toISOString().split("T")[0],
        dateEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        quarter: "" as Quarter,
        fiscalYearId: "" as UUID,
      });
      setFormErrors({});
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    handleCancel();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <BadgePlus size={20} />
            <h2 className="text-lg font-bold text-gray-800">Add New</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6">
          <form onSubmit={handleSubmit}>
            <div className="py-4 space-y-4">
              {/* Period Name */}
              <div className="space-y-2">
                <label
                  htmlFor="periodName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Period Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="periodName"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., January 2024, Q1 Review"
                  value={newPeriod.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  disabled={loading}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Quarter and Fiscal Year Selection - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quarter Selection */}
                <div className="space-y-2">
                  <Label
                    htmlFor="quarter"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Quarter <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newPeriod.quarter}
                    onValueChange={handleQuarterChange}
                    disabled={loading}
                  >
                    <SelectTrigger
                      id="quarter"
                      className={`w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent ${
                        formErrors.quarterId ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      {quarterOptions.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          {option.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.quarterId && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.quarterId}
                    </p>
                  )}
                </div>

                {/* Fiscal Year Selection */}
                <div className="space-y-2">
                  <List
                    items={fiscalYears}
                    selectedValue={newPeriod.fiscalYearId}
                    onSelect={handleSelectFiscalYear}
                    label="Fiscal Year"
                    placeholder="Select a fiscal year"
                    required
                    disabled={loadingFiscalYears || loading}
                  />
                  {loadingFiscalYears && (
                    <p className="text-sm text-gray-500 mt-1">
                      Loading fiscal years...
                    </p>
                  )}
                  {formErrors.fiscalYearId && !loadingFiscalYears && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.fiscalYearId}
                    </p>
                  )}
                </div>
              </div>

              {/* Start and End Dates - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent ${
                      formErrors.dateStart
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={newPeriod.dateStart}
                    onChange={(e) =>
                      handleInputChange("dateStart", e.target.value)
                    }
                    required
                    disabled={loading}
                  />
                  {formErrors.dateStart && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.dateStart}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent ${
                      formErrors.dateEnd ? "border-red-500" : "border-gray-300"
                    }`}
                    value={newPeriod.dateEnd}
                    onChange={(e) =>
                      handleInputChange("dateEnd", e.target.value)
                    }
                    required
                    disabled={loading}
                  />
                  {formErrors.dateEnd && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.dateEnd}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-2">
              <div className="mx-auto flex justify-center items-center gap-1.5">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6"
                  disabled={loading || loadingFiscalYears}
                >
                  {loading ? "Adding..." : "Save Period"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer px-6"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};