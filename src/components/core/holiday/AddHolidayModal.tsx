import { motion } from 'framer-motion';
import { X, BadgePlus, Calendar } from 'lucide-react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { AddHolidayDto, UUID } from '../../../types/core/holiday';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface AddHolidayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newHoliday: AddHolidayDto;
  setNewHoliday: (holiday: AddHolidayDto) => void;
  onAddHoliday: () => Promise<any>;
  fiscalYears: Array<{ id: string; name: string }>;
}

export const AddHolidayModal = ({
                                  open,
                                  onOpenChange,
                                  newHoliday,
                                  setNewHoliday,
                                  onAddHoliday,
                                  fiscalYears = []
                                }: AddHolidayModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newHoliday.name || !newHoliday.date || !newHoliday.fiscalYearId) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);

    try {
      await onAddHoliday();
      toast.success('Holiday added successfully');
      setNewHoliday({
        name: '',
        date: '',
        isPublic: true,
        fiscalYearId: '' as UUID
      });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add holiday');
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
                Add Holiday
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
              {/* Holiday Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Holiday Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="text"
                    placeholder="e.g., New Year's Day"
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                    className="h-9 text-sm"
                    required
                    disabled={isLoading}
                />
              </div>

              {/* Holiday Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="date"
                    value={newHoliday.date ? newHoliday.date.split('T')[0] : newHoliday.date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                    className="h-9 text-sm"
                    required
                    disabled={isLoading}
                />
              </div>

              {/* Fiscal Year */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Fiscal Year <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={newHoliday.fiscalYearId}
                    onValueChange={(value) => setNewHoliday({ ...newHoliday, fiscalYearId: value as UUID })}
                    disabled={isLoading}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYears.map((fiscalYear) => (
                        <SelectItem key={fiscalYear.id} value={fiscalYear.id}>
                          {fiscalYear.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Is Public Switch */}
              <div className="flex items-center justify-between pt-2">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Public Holiday
                </Label>
                <Switch
                    checked={newHoliday.isPublic}
                    onCheckedChange={(checked) => setNewHoliday({ ...newHoliday, isPublic: checked })}
                    disabled={isLoading}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
                {newHoliday.isPublic
                    ? 'This holiday will be visible to all employees'
                    : 'This holiday will be for specific groups only'
                }
              </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-center gap-2">
                <Button
                    type="submit"
                    className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                    disabled={!newHoliday.name || !newHoliday.date || !newHoliday.fiscalYearId || isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
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