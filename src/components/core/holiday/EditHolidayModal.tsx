import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, PenBox, Calendar } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import type { EditHolidayDto, HolidayListDto, UUID } from '../../../types/core/holiday';
import toast from 'react-hot-toast';

interface EditHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (holidayData: EditHolidayDto) => Promise<any>;
  holiday: HolidayListDto | null;
}

export const EditHolidayModal: React.FC<EditHolidayModalProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    onSave,
                                                                    holiday,
                                                                  }) => {
  const [formData, setFormData] = useState<EditHolidayDto>({
    id: '' as UUID,
    name: '',
    date: '',
    isPublic: true,
    rowVersion: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (holiday) {
      const formatDateForInput = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        id: holiday.id,
        name: holiday.name || '',
        date: formatDateForInput(holiday.date),
        isPublic: holiday.isPublic ?? true,
        rowVersion: holiday.rowVersion || '',
      });
    }
  }, [holiday]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
      toast.success('Holiday updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update holiday');
    } finally {
      setIsLoading(false);
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
                Edit Holiday
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
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-9 text-sm"
                    required
                    disabled={isLoading}
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="h-9 text-sm"
                    required
                    disabled={isLoading}
                />
              </div>

              {/* Fiscal Year (Read-only) */}
              {holiday?.fiscalYearName && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Fiscal Year
                    </Label>
                    <Input
                        type="text"
                        value={holiday.fiscalYearName}
                        disabled
                        className="h-9 text-sm bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    />
                  </div>
              )}

              {/* Is Public Switch */}
              <div className="flex items-center justify-between pt-2">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Public Holiday
                </Label>
                <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                    disabled={isLoading}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-center gap-2">
                <Button
                    type="submit"
                    className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                    disabled={!formData.name || !formData.date || isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
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