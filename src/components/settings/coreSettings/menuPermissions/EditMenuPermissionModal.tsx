import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, PenBox } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Checkbox } from '../../../ui/checkbox';
import List from '../../../List/list';
import type {
  PerMenuModDto,
  PerMenuListDto,
  UUID
} from '../../../../types/core/Settings/menu-permissions';
import type { ModPerMenuListDto } from '../../../../types/core/Settings/menu-permissions';
import toast from 'react-hot-toast';

interface EditMenuPermissionModalProps {
  permission: PerMenuListDto | null;
  modules?: ModPerMenuListDto[];
  onEditPermission: (permission: PerMenuModDto) => Promise<any>;
  onClose?: () => void;
}

const EditMenuPermissionModal: React.FC<EditMenuPermissionModalProps> = ({
                                                                           permission,
                                                                           modules = [],
                                                                           onEditPermission,
                                                                           onClose
                                                                         }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedPermission, setEditedPermission] = useState<PerMenuModDto>({
    id: '' as UUID,
    perModuleId: '' as UUID,
    key: '',
    label: '',
    path: '',
    icon: '',
    isChild: false,
    parentKey: '',
    order: 0
  });

  // Open modal when permission changes - NO HARDCODED MAPPINGS
  useEffect(() => {
    if (permission) {
      setEditedPermission({
        id: permission.id,
        perModuleId: permission.perModuleId,
        key: permission.key || '',
        label: permission.label || permission.name || '',
        path: permission.path || '',
        icon: permission.icon || '',
        isChild: permission.isChild || false,
        parentKey: permission.parentKey || '',
        order: permission.order || 0,
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [permission]);

  // Convert modules to list items format
  const moduleListItems = (() => {
    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      return [];
    }
    return modules
        .filter(module => module)
        .map(module => ({
          id: module.perModuleId || module.id,
          name: module.perModule || module.desc || module.name
        }))
        .filter(item => item.id && item.name);
  })();

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPermission(prev => ({ ...prev, label: e.target.value }));
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPermission(prev => ({ ...prev, key: e.target.value }));
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPermission(prev => ({ ...prev, path: e.target.value }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPermission(prev => ({ ...prev, icon: e.target.value }));
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
    setEditedPermission(prev => ({ ...prev, order: value }));
  };

  const handleParentKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPermission(prev => ({ ...prev, parentKey: e.target.value }));
  };

  const handleModuleSelect = (item: { id: UUID; name: string }) => {
    setEditedPermission(prev => ({ ...prev, perModuleId: item.id }));
  };

  const handleChildToggle = (checked: boolean) => {
    setEditedPermission(prev => ({
      ...prev,
      isChild: checked,
      parentKey: checked ? prev.parentKey : "",
    }));
  };

  const handleSubmit = async () => {
    if (!editedPermission.label.trim()) {
      toast.error('Label is required');
      return;
    }
    if (!editedPermission.path.trim()) {
      toast.error('Path is required');
      return;
    }
    if (!editedPermission.icon.trim()) {
      toast.error('Icon is required');
      return;
    }
    if (!editedPermission.perModuleId) {
      toast.error('Please select a module');
      return;
    }
    if (editedPermission.isChild && !editedPermission.parentKey.trim()) {
      toast.error('Parent Key is required for child menus');
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: PerMenuModDto = {
        id: editedPermission.id,
        perModuleId: editedPermission.perModuleId,
        key: editedPermission.key,
        label: editedPermission.label,
        path: editedPermission.path,
        icon: editedPermission.icon,
        isChild: editedPermission.isChild,
        parentKey: editedPermission.parentKey,
        order: editedPermission.order
      };

      await onEditPermission(updateData);
      toast.success("Menu permission updated successfully!");
      handleClose();
    } catch (error: any) {
      console.error("Error updating menu permission:", error);
      toast.error(error.message || "Failed to update menu permission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      onClose?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
      <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6"
          onClick={handleBackdropClick}
      >
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onKeyDown={handleKeyDown}
        >
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <PenBox size={20} className="text-emerald-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-800">Edit Menu Permission</h2>
                <p className="text-sm text-gray-500">Editing: {editedPermission.label || editedPermission.key}</p>
              </div>
            </div>
            <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                disabled={isSubmitting}
                aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Module <span className="text-red-500">*</span>
                  </Label>
                  {moduleListItems.length === 0 ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <p className="text-sm text-amber-600">Loading modules...</p>
                      </div>
                  ) : (
                      <List
                          items={moduleListItems}
                          selectedValue={editedPermission.perModuleId}
                          onSelect={handleModuleSelect}
                          label=""
                          placeholder="Select a module"
                          required
                          disabled={isSubmitting}
                      />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-key" className="text-sm font-medium text-gray-700">
                    Key <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="edit-key"
                      value={editedPermission.key}
                      onChange={handleKeyChange}
                      placeholder="Enter menu key"
                      className="w-full"
                      disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-path" className="text-sm font-medium text-gray-700">
                    Path <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="edit-path"
                      value={editedPermission.path}
                      onChange={handlePathChange}
                      placeholder="Enter menu path"
                      className="w-full"
                      disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                        id="edit-isChild"
                        checked={editedPermission.isChild}
                        onCheckedChange={handleChildToggle}
                        disabled={isSubmitting}
                    />
                    <Label htmlFor="edit-isChild" className="text-sm font-medium text-gray-700">
                      Is Child Menu
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-order" className="text-sm font-medium text-gray-700">
                    Order
                  </Label>
                  <Input
                      id="edit-order"
                      type="number"
                      min="0"
                      value={editedPermission.order === 0 ? "" : editedPermission.order}
                      onChange={handleOrderChange}
                      placeholder="Enter display order"
                      className="w-full"
                      disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-label" className="text-sm font-medium text-gray-700">
                    Label <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="edit-label"
                      value={editedPermission.label}
                      onChange={handleLabelChange}
                      placeholder="Enter menu label"
                      className="w-full"
                      disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-icon" className="text-sm font-medium text-gray-700">
                    Icon <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="edit-icon"
                      value={editedPermission.icon}
                      onChange={handleIconChange}
                      placeholder="Enter icon name"
                      className="w-full"
                      disabled={isSubmitting}
                  />
                </div>

                {editedPermission.isChild && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-parentKey" className="text-sm font-medium text-gray-700">
                        Parent Key <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          id="edit-parentKey"
                          value={editedPermission.parentKey}
                          onChange={handleParentKeyChange}
                          placeholder="Enter parent menu key"
                          className="w-full"
                          disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500">Enter the parent menu key</p>
                    </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
            <div className="flex justify-center items-center gap-3">
              <Button
                  variant="outline"
                  className="cursor-pointer px-6 min-w-[100px]"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  type="button"
              >
                Cancel
              </Button>
              <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6 min-w-[100px]"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  type="button"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default EditMenuPermissionModal;