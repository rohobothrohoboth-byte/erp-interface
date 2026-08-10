import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BadgePlus, Building2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import type { AddCompDto } from '@/modules/core/types/comp';
import { amharicRegex } from '@/shared/utils/amharic-regex';
import toast from 'react-hot-toast';

interface AddCompModalProps {
  onAddCompany: (company: AddCompDto) => Promise<any>;
}

const AddCompModal: React.FC<AddCompModalProps> = ({ onAddCompany }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', nameAm: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleAmharicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || amharicRegex.test(value)) {
      setNewCompany((prev) => ({ ...prev, nameAm: value }));
    }
  };

  const handleSubmit = async () => {
    if (!newCompany.name.trim() || !newCompany.nameAm.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await onAddCompany({
        name: newCompany.name.trim(),
        nameAm: newCompany.nameAm.trim(),
      });

      const successMessage =
          response?.data?.message ||
          response?.message ||
          'Company added successfully';

      toast.success(successMessage);

      setNewCompany({ name: '', nameAm: '' });
      setIsOpen(false);

    } catch (error: any) {
      const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to add company';

      toast.error(errorMessage);
      console.error('Error adding company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewCompany({ name: '', nameAm: '' });
    setIsOpen(false);
  };

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  return (
      <>
        {/* Trigger Button */}
        <Button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2"
        >
          <BadgePlus size={16} />
          Add Company
        </Button>

        {/* Modal */}
        {isOpen && (
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
                      <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                      Add New Company
                    </h2>
                  </div>
                  <button
                      onClick={handleClose}
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
                          value={newCompany.nameAm}
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
                          value={newCompany.name}
                          onChange={(e) => setNewCompany((prev) => ({ ...prev, name: e.target.value }))}
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
                        disabled={!newCompany.name.trim() || !newCompany.nameAm.trim() || isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                        variant="outline"
                        className="px-5 h-8 text-sm"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
        )}
      </>
  );
};

export default AddCompModal;