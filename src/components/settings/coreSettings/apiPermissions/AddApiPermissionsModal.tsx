import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BadgePlus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import type { PerApiAddDto } from '../../../../types/core/Settings/api-permission';
import toast from 'react-hot-toast';

interface AddApiPermissionModalProps {
  onAddPermission: (permission: PerApiAddDto) => Promise<any>;
}

const AddApiPermissionsModal: React.FC<AddApiPermissionModalProps> = ({ onAddPermission }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPermission, setNewPermission] = useState<PerApiAddDto>({
    perMenuKey: '',
    key: '',
    desc: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    perMenuKey?: string;
    key?: string;
    desc?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { perMenuKey?: string; key?: string; desc?: string; } = {};

    if (!newPermission.perMenuKey.trim()) {
      newErrors.perMenuKey = 'Menu key is required';
    }

    if (!newPermission.key.trim()) {
      newErrors.key = 'API key is required';
    }

    if (!newPermission.desc.trim()) {
      newErrors.desc = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      await onAddPermission({
        perMenuKey: newPermission.perMenuKey.trim().toLowerCase(),
        key: newPermission.key.trim().toLowerCase(),
        desc: newPermission.desc.trim(),
      });

      toast.success('Access permission added successfully!');
      setNewPermission({ perMenuKey: '', key: '', desc: '' });
      setErrors({});
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add Access permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNewPermission({ perMenuKey: '', key: '', desc: '' });
      setErrors({});
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
        <Button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <BadgePlus size={18} className="mr-2" />
          Add Access Permission
        </Button>
    );
  }

  return (
      <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              handleClose();
            }
          }}
      >
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full md:w-1/3 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <BadgePlus size={20} className="text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-800">Add Access Permission</h2>
            </div>
            <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="perMenuKey" className="text-sm font-medium text-gray-700">
                Menu Key <span className="text-red-500">*</span>
              </Label>
              <Input
                  id="perMenuKey"
                  value={newPermission.perMenuKey}
                  onChange={(e) => {
                    setNewPermission(prev => ({ ...prev, perMenuKey: e.target.value }));
                    if (errors.perMenuKey) setErrors(prev => ({ ...prev, perMenuKey: undefined }));
                  }}
                  placeholder="hr.employee, finance.payroll, crm.contacts"
                  className={errors.perMenuKey ? 'border-red-300' : ''}
                  disabled={isLoading}
              />
              {errors.perMenuKey && <p className="text-sm text-red-500">{errors.perMenuKey}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="key" className="text-sm font-medium text-gray-700">
                Access Key <span className="text-red-500">*</span>
              </Label>
              <Input
                  id="key"
                  value={newPermission.key}
                  onChange={(e) => {
                    setNewPermission(prev => ({ ...prev, key: e.target.value }));
                    if (errors.key) setErrors(prev => ({ ...prev, key: undefined }));
                  }}
                  placeholder="api.module.feature.action"
                  className={errors.key ? 'border-red-300' : ''}
                  disabled={isLoading}
              />
              {errors.key && <p className="text-sm text-red-500">{errors.key}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="desc" className="text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input
                  id="desc"
                  value={newPermission.desc}
                  onChange={(e) => {
                    setNewPermission(prev => ({ ...prev, desc: e.target.value }));
                    if (errors.desc) setErrors(prev => ({ ...prev, desc: undefined }));
                  }}
                  placeholder="Enter permission description"
                  className={errors.desc ? 'border-red-300' : ''}
                  disabled={isLoading}
              />
              {errors.desc && <p className="text-sm text-red-500">{errors.desc}</p>}
            </div>
          </div>

          <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
            <div className="flex justify-center items-center gap-3">
              <Button
                  variant="outline"
                  className="cursor-pointer px-6 min-w-[100px]"
                  onClick={handleClose}
                  disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6 min-w-[100px]"
                  onClick={handleSubmit}
                  disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default AddApiPermissionsModal;