import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BadgePlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import type { EducationQualAddDto } from '@/modules/hr/types/educationalqual';

interface AddEducationalQualModalProps {
  onAddEducationalQual: (educationalQual: EducationQualAddDto) => void;
  onClose: () => void;
  isOpen?: boolean; // Optional prop if you want to control it from parent
}

const AddEducationalQualModal: React.FC<AddEducationalQualModalProps> = ({ 
  onAddEducationalQual,
  onClose
}) => {
  const [newEducationalQual, setNewEducationalQual] = useState({ name: '' });

  const handleSubmit = () => {
    if (!newEducationalQual.name.trim()) return;

    onAddEducationalQual({
      name: newEducationalQual.name.trim(),
    });

    setNewEducationalQual({ name: '' });
    onClose();
  };

  const handleClose = () => {
    setNewEducationalQual({ name: '' });
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newEducationalQual.name.trim()) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-1/3 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <BadgePlus size={20} />
            <h2 className="text-lg font-bold text-gray-800">Add New</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Educational Qualification Name */}
            <div className="space-y-2">
              <Label htmlFor="educationalQualName" className="text-sm text-gray-500">
                Educational Qualification Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="educationalQualName"
                value={newEducationalQual.name}
                onChange={(e) =>
                  setNewEducationalQual((prev) => ({ ...prev, name: e.target.value }))
                }
                onKeyDown={handleKeyPress}
                placeholder="Eg. Bachelor's Degree, Master's Degree, PhD"
                className="w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                required
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2">
          <div className="flex justify-center items-center gap-3">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6"
              onClick={handleSubmit}
              disabled={!newEducationalQual.name.trim()}
            >
              Save
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer px-6"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddEducationalQualModal;