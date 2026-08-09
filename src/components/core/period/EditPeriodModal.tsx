import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, PenBox, Calendar } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import type { EditPeriodDto, PeriodListDto, UUID } from "../../../types/core/period";
import toast from "react-hot-toast";
import { Quarter } from "../../../types/core/enum";
import { fiscalYearApi } from "../../../services/core/fiscalyear/fisc.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

interface EditPeriodModalProps {
  period: PeriodListDto;
  onEditPeriod: (period: EditPeriodDto) => Promise<any>;
  isOpen: boolean;
  onClose: () => void;
}

const quarterOptions = Object.entries(Quarter).map(([key, value]) => ({ key, value }));

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
    quarter: period.quarter || "" as any,
    fiscalYearId: period.fiscalYearId || "" as UUID,
    rowVersion: period.rowVersion || "",
  });
  const [loading, setLoading] = useState(false);
  const [fiscalYears, setFiscalYears] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingFiscalYears, setLoadingFiscalYears] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const parseDisplayDate = (displayDate: string): string => {
        if (!displayDate) return "";
        try {
          const date = new Date(displayDate);
          if (isNaN(date.getTime())) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } catch {
          return "";
        }
      };

      const dateStart = period.dateStart?.includes("-")
          ? period.dateStart.split("T")[0]
          : parseDisplayDate(period.dateStartStr || "");
      const dateEnd = period.dateEnd?.includes("-")
          ? period.dateEnd.split("T")[0]
          : parseDisplayDate(period.dateEndStr || "");

      setEditedPeriod({
        id: period.id,
        name: period.name,
        dateStart: dateStart,
        dateEnd: dateEnd,
        isActive: period.isActive,
        quarter: period.quarter || "" as any,
        fiscalYearId: period.fiscalYearId || "" as UUID,
        rowVersion: period.rowVersion || "",
      });

      fetchFiscalYears();
    }
  }, [period, isOpen]);

  const fetchFiscalYears = async () => {
    try {
      setLoadingFiscalYears(true);
      const fiscalYearsData = await fiscalYearApi.getAllFiscalYears();
      setFiscalYears(fiscalYearsData);
    } catch (error) {
      console.error("Error fetching fiscal years:", error);
      toast.error("Failed to load fiscal years");
    } finally {
      setLoadingFiscalYears(false);
    }
  };

  const handleSubmit = async () => {
    if (!editedPeriod.name || !editedPeriod.dateStart || !editedPeriod.dateEnd || !editedPeriod.quarter || !editedPeriod.fiscalYearId) {
      toast.error("Please fill all required fields");
      return;
    }

    const startDate = new Date(editedPeriod.dateStart);
    const endDate = new Date(editedPeriod.dateEnd);
    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);
    try {
      await onEditPeriod(editedPeriod);
      toast.success("Period updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update period");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <PenBox className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Edit Period
              </h2>
            </div>
            <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Period Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Period Name <span className="text-red-500">*</span>
              </Label>
              <Input
                  type="text"
                  placeholder="e.g., Q1 2024"
                  value={editedPeriod.name}
                  onChange={(e) => setEditedPeriod(prev => ({ ...prev, name: e.target.value }))}
                  className="h-9 text-sm"
                  required
                  disabled={loading}
              />
            </div>

            {/* Quarter and Fiscal Year */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Quarter <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={editedPeriod.quarter}
                    onValueChange={(value) => setEditedPeriod(prev => ({ ...prev, quarter: value as any }))}
                    disabled={loading}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    {quarterOptions.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          {option.value}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Fiscal Year <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={editedPeriod.fiscalYearId}
                    onValueChange={(value) => setEditedPeriod(prev => ({ ...prev, fiscalYearId: value as UUID }))}
                    disabled={loadingFiscalYears || loading}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYears.map((fy) => (
                        <SelectItem key={fy.id} value={fy.id}>
                          {fy.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start and End Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="date"
                    value={editedPeriod.dateStart}
                    onChange={(e) => setEditedPeriod(prev => ({ ...prev, dateStart: e.target.value }))}
                    className="h-9 text-sm"
                    required
                    disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="date"
                    value={editedPeriod.dateEnd}
                    onChange={(e) => setEditedPeriod(prev => ({ ...prev, dateEnd: e.target.value }))}
                    className="h-9 text-sm"
                    required
                    disabled={loading}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Status
              </Label>
              <Select
                  value={editedPeriod.isActive}
                  onValueChange={(value) => setEditedPeriod(prev => ({ ...prev, isActive: value }))}
                  disabled={loading}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Active</SelectItem>
                  <SelectItem value="1">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex justify-center gap-2">
              <Button
                  className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                  onClick={handleSubmit}
                  disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-5 h-8 text-sm"
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