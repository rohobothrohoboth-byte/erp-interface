import { motion } from 'framer-motion';
import { X, BadgePlus, Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import type { AddFiscYearDto } from '@/modules/core/types/fisc';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface AddFiscalYearModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newYear: AddFiscYearDto;
  setNewYear: (year: AddFiscYearDto) => void;
  onAddFiscalYear: () => Promise<any>;
}

export const AddFiscalYearModal = ({
                                     open,
                                     onOpenChange,
                                     newYear,
                                     setNewYear,
                                     onAddFiscalYear
                                   }: AddFiscalYearModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newYear.name || !newYear.dateStart || !newYear.dateEnd) {
      toast.error('Please fill all required fields');
      return;
    }

    const startDate = new Date(newYear.dateStart);
    const endDate = new Date(newYear.dateEnd);

    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setIsLoading(true);

    try {
      await onAddFiscalYear();
      toast.success('Fiscal year added successfully');
      setNewYear({ name: '', dateStart: '', dateEnd: '' });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add fiscal year');
    } finally {
      setIsLoading(false);
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
                Add Fiscal Year
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
              {/* Fiscal Year Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Fiscal Year Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="text"
                    placeholder="e.g., FY 2025"
                    value={newYear.name}
                    onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
                    className="h-9 text-sm"
                    required
                    disabled={isLoading}
                />
              </div>

              {/* Start and End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      type="date"
                      value={newYear.dateStart ? newYear.dateStart.split('T')[0] : newYear.dateStart}
                      onChange={(e) => setNewYear({ ...newYear, dateStart: e.target.value })}
                      className="h-9 text-sm"
                      required
                      disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      type="date"
                      value={newYear.dateEnd ? newYear.dateEnd.split('T')[0] : newYear.dateEnd}
                      onChange={(e) => setNewYear({ ...newYear, dateEnd: e.target.value })}
                      className="h-9 text-sm"
                      required
                      disabled={isLoading}
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
                    disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="px-5 h-8 text-sm"
                    disabled={isLoading}
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