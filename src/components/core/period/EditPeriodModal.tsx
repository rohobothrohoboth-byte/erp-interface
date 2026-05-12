import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, PenBox } from "lucide-react";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import type {
  EditPeriodDto,
  PeriodListDto,
  UUID,
} from "../../../types/core/period";
import toast from "react-hot-toast";
import { PeriodStat, Quarter } from "../../../types/core/enum";
import List from "../../List/list";
import type { ListItem } from "../../../types/List/list";
import { fiscalYearApi } from "../../../services/core/fiscalyear/fisc.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface EditPeriodModalProps {
  period: PeriodListDto;
  onEditPeriod: (period: EditPeriodDto) => Promise<any>;
  isOpen: boolean;
  onClose: () => void;
}
const quarterOptions = Object.entries(Quarter).map(([key, value]) => ({
  key,
  value,
}));

const EditPeriodModal: React.FC<EditPeriodModalProps> = ({
  period,
  onEditPeriod,
  isOpen,
  onClose,
}) => {
  const [editedPeriod, setEditedPeriod] = useState<EditPeriodDto>({
    id: period.id,
    name: period.name,
    dateStart: "",
    dateEnd: "",
    isActive: period.isActive,
    quarter: period.quarter || ("" as UUID),
    fiscalYearId: period.fiscalYearId || ("" as UUID),
    rowVersion: period.rowVersion || "",
  });

  const [loading, setLoading] = useState(false);
  const [fiscalYears, setFiscalYears] = useState<ListItem[]>([]);
  // const [quarters, setQuarters] = useState<ListItem[]>([]);
  const [loadingFiscalYears, setLoadingFiscalYears] = useState(false);
  // const [loadingQuarters, setLoadingQuarters] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const periodStatusOptions = Object.entries(PeriodStat);

  useEffect(() => {
    if (isOpen) {
      // Parse the display dates to get actual date values for the input fields
      const parseDisplayDate = (displayDate: string): string => {
        if (!displayDate) return "";

        try {
          // Try to parse the display date (e.g., "January 01, 2024")
          const date = new Date(displayDate);
          if (isNaN(date.getTime())) {
            // If parsing fails, try alternative formats or return empty
            console.warn("Could not parse date:", displayDate);
            return "";
          }

          // Format as YYYY-MM-DD for input[type="date"]
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");

          return `${year}-${month}-${day}`;
        } catch (error) {
          console.error("Error parsing date:", displayDate, error);
          return "";
        }
      };

      // If the period has raw date values, use them directly
      // Otherwise, parse from the display strings
      const dateStart =
        period.dateStart &&
        typeof period.dateStart === "string" &&
        period.dateStart.includes("-")
          ? period.dateStart.split("T")[0] // Already in ISO format, extract date part
          : parseDisplayDate(period.dateStartStr || "");

      const dateEnd =
        period.dateEnd &&
        typeof period.dateEnd === "string" &&
        period.dateEnd.includes("-")
          ? period.dateEnd.split("T")[0] // Already in ISO format, extract date part
          : parseDisplayDate(period.dateEndStr || "");

      setEditedPeriod({
        id: period.id,
        name: period.name,
        dateStart: dateStart,
        dateEnd: dateEnd,
        isActive: period.isActive,
        quarter: period.quarter || ("" as Quarter),
        fiscalYearId: period.fiscalYearId || ("" as UUID),
        rowVersion: period.rowVersion || "",
      });

      fetchFiscalYears();
      // fetchQuarters();
    }
  }, [period, isOpen]);

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

  const handleSelectFiscalYear = (item: ListItem) => {
    setEditedPeriod((prev) => ({ ...prev, fiscalYearId: item.id }));
  };

  const handleSelectQuarter = (value: string) => {
    setEditedPeriod((prev) => ({ ...prev, quarter: value as Quarter }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditedPeriod((prev) => ({ ...prev, name: value }));
  };

  const handleDateStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditedPeriod((prev) => ({ ...prev, dateStart: value }));
  };

  const handleDateEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditedPeriod((prev) => ({ ...prev, dateEnd: value }));
  };

  const handleStatusChange = (value: string) => {
    setEditedPeriod((prev) => ({ ...prev, isActive: value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!editedPeriod.name?.trim()) {
      errors.name = "Period name is required";
    }

    if (!editedPeriod.dateStart) {
      errors.dateStart = "Start date is required";
    }

    if (!editedPeriod.dateEnd) {
      errors.dateEnd = "End date is required";
    }

    if (!editedPeriod.quarter) {
      errors.quarterId = "Quarter is required";
    }

    if (!editedPeriod.fiscalYearId) {
      errors.fiscalYearId = "Fiscal year is required";
    }

    // Date validation
    if (editedPeriod.dateStart && editedPeriod.dateEnd) {
      const startDate = new Date(editedPeriod.dateStart);
      const endDate = new Date(editedPeriod.dateEnd);

      if (endDate <= startDate) {
        errors.dateEnd = "End date must be after start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    // Date validation
    const startDate = new Date(editedPeriod.dateStart);
    const endDate = new Date(editedPeriod.dateEnd);

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setLoading(true);

      // Convert dates to ISO format for backend
      const payload: EditPeriodDto = {
        ...editedPeriod,
        dateStart: new Date(editedPeriod.dateStart).toISOString(),
        dateEnd: new Date(editedPeriod.dateEnd).toISOString(),
      };

      const response = await onEditPeriod(payload);
 const successMessage = 
        response?.data?.message || 
        response?.message || 
        '';
      
      toast.success(successMessage);
    } catch (error: any) {
      const errorMessage = error.message || '';
      toast.error(errorMessage);
      console.error("Error updating period:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
            <PenBox size={20} />
            <h2 className="text-lg font-bold text-gray-800">Edit Period</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6">
          <div className="py-4 space-y-4">
            {/* Period Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm text-gray-500">
                Period Name <span className="text-red-500">*</span>
              </Label>
              <input
                id="edit-name"
                value={editedPeriod.name}
                onChange={handleNameChange}
                placeholder="Q1 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
              />
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
                  value={editedPeriod.quarter}
                  onValueChange={handleSelectQuarter}
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
                  selectedValue={editedPeriod.fiscalYearId}
                  onSelect={handleSelectFiscalYear}
                  label="Fiscal Year"
                  placeholder="Select a fiscal year"
                  required
                  disabled={loadingFiscalYears}
                />
                {loadingFiscalYears && (
                  <p className="text-sm text-gray-500 mt-1">
                    Loading fiscal years...
                  </p>
                )}
              </div>
            </div>

            {/* Start and End Dates - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-dateStart"
                  className="text-sm text-gray-500"
                >
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <input
                  id="edit-dateStart"
                  type="date"
                  value={editedPeriod.dateStart}
                  onChange={handleDateStartChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dateEnd" className="text-sm text-gray-500">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <input
                  id="edit-dateEnd"
                  type="date"
                  value={editedPeriod.dateEnd}
                  onChange={handleDateEndChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="quarter"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editedPeriod.isActive}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger
                    id="quarter"
                    className={`w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent ${
                      formErrors.quarter ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodStatusOptions.map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.isActive && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.isActive}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6"
              onClick={handleSubmit}
              disabled={
                !editedPeriod.name ||
                !editedPeriod.dateStart ||
                !editedPeriod.dateEnd ||
                !editedPeriod.quarter ||
                !editedPeriod.fiscalYearId ||
                loading
              }
            >
              {loading ? "Updating..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer px-6"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditPeriodModal;