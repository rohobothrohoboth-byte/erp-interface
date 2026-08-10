import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, PenBox, Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { EditFiscYearDto, FiscYearListDto, UUID } from '@/modules/core/types/fisc';
import toast from 'react-hot-toast';

interface EditFiscModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fiscalYearData: EditFiscYearDto) => Promise<any>;
  fiscalYear: FiscYearListDto | null;
}

export const EditFiscModal: React.FC<EditFiscModalProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              onSave,
                                                              fiscalYear,
                                                            }) => {
  const [formData, setFormData] = useState<EditFiscYearDto>({
    id: '' as UUID,
    name: '',
    dateStart: '',
    dateEnd: '',
    isActive: '0',
    rowVersion: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (fiscalYear) {
      const formatDateForInput = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        id: fiscalYear.id,
        name: fiscalYear.name || '',
        dateStart: formatDateForInput(fiscalYear.dateStart),
        dateEnd: formatDateForInput(fiscalYear.dateEnd),
        isActive: fiscalYear.isActive || '0',
        rowVersion: fiscalYear.rowVersion || '',
      });
    }
  }, [fiscalYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
      toast.success('Fiscal year updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update fiscal year');
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
                Edit Fiscal Year
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
              {/* Fiscal Year Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Fiscal Year Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="text"
                    placeholder="e.g., FY 2025"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                      value={formData.dateStart}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateStart: e.target.value }))}
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
                      value={formData.dateEnd}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateEnd: e.target.value }))}
                      className="h-9 text-sm"
                      required
                      disabled={isLoading}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Status
                </Label>
                <Select
                    value={formData.isActive}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
                    disabled={isLoading}
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
                    type="submit"
                    className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                    disabled={isLoading}
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