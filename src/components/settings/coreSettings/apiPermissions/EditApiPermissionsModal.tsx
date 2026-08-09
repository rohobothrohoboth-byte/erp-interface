import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, PenBox } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import type { PerApiListDto, PerApiModDto, UUID } from '../../../../types/core/Settings/api-permission';
import toast from 'react-hot-toast';

interface EditApiPermissionModalProps {
  permission: PerApiListDto;
  onEditPermission: (permission: PerApiModDto) => Promise<any>;
  isOpen: boolean;
  onClose: () => void;
}

const EditApiPermissionModal: React.FC<EditApiPermissionModalProps> = ({
                                                                         permission,
                                                                         onEditPermission,
                                                                         isOpen,
                                                                         onClose
                                                                       }) => {
  const [editedPermission, setEditedPermission] = useState<PerApiModDto>({
    id: permission.id,
    perMenuKey: permission.perMenuKey || '',
    key: permission.key,
    desc: permission.name
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ key?: string; desc?: string; perMenuKey?: string }>({});

  useEffect(() => {
    setEditedPermission({
      id: permission.id,
      perMenuKey: permission.perMenuKey || '',
      key: permission.key,
      desc: permission.name
    });
  }, [permission]);

  const validateForm = () => {
    const newErrors: { key?: string; desc?: string; perMenuKey?: string } = {};
    if (!editedPermission.key.trim()) newErrors.key = 'Key is required';
    if (!editedPermission.desc.trim()) newErrors.desc = 'Description is required';
    if (!editedPermission.perMenuKey.trim()) newErrors.perMenuKey = 'Menu key is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onEditPermission(editedPermission);
      toast.success('API permission updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update API permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full md:w-1/3 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <PenBox size={20} className="text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-800">Edit Access Permission</h2>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100" disabled={isSubmitting}>
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Menu Key <span className="text-red-500">*</span>
              </Label>
              <Input
                  value={editedPermission.perMenuKey}
                  onChange={(e) => {
                    setEditedPermission(prev => ({ ...prev, perMenuKey: e.target.value }));
                    if (errors.perMenuKey) setErrors(prev => ({ ...prev, perMenuKey: undefined }));
                  }}
                  placeholder="hr.employee, finance.payroll"
                  className={errors.perMenuKey ? 'border-red-300' : ''}
                  disabled={isSubmitting}
              />
              {errors.perMenuKey && <p className="text-sm text-red-500">{errors.perMenuKey}</p>}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Access Key <span className="text-red-500">*</span>
              </Label>
              <Input
                  value={editedPermission.key}
                  onChange={(e) => {
                    setEditedPermission(prev => ({ ...prev, key: e.target.value }));
                    if (errors.key) setErrors(prev => ({ ...prev, key: undefined }));
                  }}
                  placeholder="api.module.feature.action"
                  className={errors.key ? 'border-red-300' : ''}
                  disabled={isSubmitting}
              />
              {errors.key && <p className="text-sm text-red-500">{errors.key}</p>}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input
                  value={editedPermission.desc}
                  onChange={(e) => {
                    setEditedPermission(prev => ({ ...prev, desc: e.target.value }));
                    if (errors.desc) setErrors(prev => ({ ...prev, desc: undefined }));
                  }}
                  placeholder="Enter permission description"
                  className={errors.desc ? 'border-red-300' : ''}
                  disabled={isSubmitting}
              />
              {errors.desc && <p className="text-sm text-red-500">{errors.desc}</p>}
            </div>
          </div>

          <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
            <div className="flex justify-center items-center gap-3">
              <Button variant="outline" className="cursor-pointer px-6" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default EditApiPermissionModal;