import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Network } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import type { CostCenter } from './CostCenterSection';

interface EditCostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CostCenter, 'id' | 'createdAt' | 'children'>) => void;
  costCenter: CostCenter | null;
}

const EditCostCenterModal: React.FC<EditCostCenterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  costCenter,
}) => {
  const [formData, setFormData] = useState({
    costCenterCode: '',
    name: '',
    description: '',
    isGroup: false,
    status: 'Active' as 'Active' | 'Inactive',
    parentCode: '',
  });

  useEffect(() => {
    if (isOpen && costCenter) {
      setFormData({
        costCenterCode: costCenter.costCenterCode,
        name: costCenter.name,
        description: costCenter.description,
        isGroup: costCenter.isGroup,
        status: costCenter.status,
        parentCode: costCenter.parentCode || '',
      });
    }
  }, [isOpen, costCenter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: Omit<CostCenter, 'id' | 'createdAt' | 'children'> = {
      costCenterCode: formData.costCenterCode,
      name: formData.name,
      description: formData.description,
      isGroup: formData.isGroup,
      status: formData.status,
      parentCode: formData.parentCode || undefined,
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      costCenterCode: '',
      name: '',
      description: '',
      isGroup: false,
      status: 'Active',
      parentCode: '',
    });
    onClose();
  };

  if (!isOpen || !costCenter) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-800">Edit Cost Center</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Cost Center Code */}
            <div className="space-y-2">
              <Label htmlFor="costCenterCode" className="text-sm text-gray-500">
                Cost Center Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="costCenterCode"
                type="text"
                value={formData.costCenterCode}
                onChange={(e) => setFormData({ ...formData, costCenterCode: e.target.value })}
                placeholder="Enter cost center code"
                required
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-gray-500">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter cost center name"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm text-gray-500">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            {/* Is Group */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isGroup"
                checked={formData.isGroup}
                onChange={(e) => setFormData({ ...formData, isGroup: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="isGroup" className="text-sm font-medium text-gray-700">
                Is Group (Can have children)
              </label>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="status"
                checked={formData.status === 'Active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-2 rounded-b-xl">
            <div className="flex flex-row-reverse justify-center items-center gap-3">
              <Button
                variant="outline"
                className="cursor-pointer px-6 border-gray-300 hover:bg-gray-100"
                onClick={handleClose}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer px-6"
              >
                Update
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditCostCenterModal;
