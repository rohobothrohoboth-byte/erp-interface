import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { AddPeriodDto, UUID } from "@/modules/core/types/period";
import toast from "react-hot-toast";
import { fiscalYearApi } from "@/modules/core/services/fiscalyear/fisc.api";
import { Quarter } from "@/modules/core/types/enum";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

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
  const [fiscalYears, setFiscalYears] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingFiscalYears, setLoadingFiscalYears] = useState(false);

  const quarterOptions = Object.entries(Quarter).map(([key, value]) => ({ key, value }));

  useEffect(() => {
    if (open) {
      fetchFiscalYears();
    }
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPeriod.name || !newPeriod.dateStart || !newPeriod.dateEnd || !newPeriod.quarter || !newPeriod.fiscalYearId) {
      toast.error("Please fill all required fields");
      return;
    }

    const startDate = new Date(newPeriod.dateStart);
    const endDate = new Date(newPeriod.dateEnd);
    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);
    try {
      await onAddPeriod();
      toast.success("Period added successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add period");
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
  };

  if (!open) return null;

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Add Period
              </h2>
            </div>
            <button
                onClick={() => onOpenChange(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-5 space-y-4">
              {/* Period Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Period Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="text"
                    placeholder="e.g., Q1 2024"
                    value={newPeriod.name}
                    onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
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
                      value={newPeriod.quarter}
                      onValueChange={(value) => setNewPeriod({ ...newPeriod, quarter: value as Quarter })}
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
                      value={newPeriod.fiscalYearId}
                      onValueChange={(value) => setNewPeriod({ ...newPeriod, fiscalYearId: value as UUID })}
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
                      value={newPeriod.dateStart}
                      onChange={(e) => setNewPeriod({ ...newPeriod, dateStart: e.target.value })}
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
                      value={newPeriod.dateEnd}
                      onChange={(e) => setNewPeriod({ ...newPeriod, dateEnd: e.target.value })}
                      className="h-9 text-sm"
                      required
                      disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-center gap-2">
                <Button
                    type="submit"
                    className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                    disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="px-5 h-8 text-sm"
                    disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
  );
};