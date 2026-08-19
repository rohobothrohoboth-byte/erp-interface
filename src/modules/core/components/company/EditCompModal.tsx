import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, PenBox } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import type { CompListDto } from '@/modules/core/types/comp';
import { amharicRegex } from '@/shared/utils/amharic-regex';
import toast from 'react-hot-toast';

interface EditCompModalProps {
  company: CompListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: CompListDto) => Promise<any>;
}

const EditCompModal: React.FC<EditCompModalProps> = ({
                                                       company,
                                                       isOpen,
                                                       onClose,
                                                       onSave
                                                     }) => {
  const [editedCompany, setEditedCompany] = useState({ name: '', nameAm: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setEditedCompany({
        name: company.name || '',
        nameAm: company.nameAm || ''
      });
    }
  }, [company]);

  const handleAmharicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || amharicRegex.test(value)) {
      setEditedCompany(prev => ({ ...prev, nameAm: value }));
    }
  };

  const handleSubmit = async () => {
    if (!editedCompany.name.trim() || !editedCompany.nameAm.trim() || !company) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);

    try {
      await onSave({
        ...company,
        name: editedCompany.name.trim(),
        nameAm: editedCompany.nameAm.trim()
      });
      toast.success('Company updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update company');
      console.error('Error updating company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !company) return null;

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
                Edit Company
              </h2>
            </div>
            <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                disabled={isLoading}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="space-y-4">
              {/* Company Name (Amharic) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  የኩባንያው ስም (አማርኛ) <span className="text-red-500">*</span>
                </Label>
                <Input
                    value={editedCompany.nameAm}
                    onChange={handleAmharicChange}
                    placeholder="ምሳሌ፡ አክሜ ኢንት"
                    className="h-9 text-sm"
                    disabled={isLoading}
                />
              </div>

              {/* Company Name (English) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    value={editedCompany.name}
                    onChange={(e) => setEditedCompany(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Eg. Acme Int"
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
                  className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                  onClick={handleSubmit}
                  disabled={!editedCompany.name.trim() || !editedCompany.nameAm.trim() || isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 h-8 text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default EditCompModal;