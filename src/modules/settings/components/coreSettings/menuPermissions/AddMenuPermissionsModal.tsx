import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, BadgePlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import List from '@/modules/list/components/list';
import type { ListItem } from '@/modules/list/types/list';
import type { PerMenuAddDto, UUID } from '@/modules/core/types/Settings/menu-permissions';
import type { NameListItem } from '@/modules/list/types/NameList/nameList';
import { menuPermissionService } from '@/modules/core/services/settings/ModCore/menu-permissionservice';
import toast from 'react-hot-toast';

interface AddMenuPermissionModalProps {
  onAddPermission: (permission: PerMenuAddDto) => Promise<any>;
}

const AddMenuPermissionModal: React.FC<AddMenuPermissionModalProps> = ({ onAddPermission }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPermission, setNewPermission] = useState<PerMenuAddDto>({
    perModuleId: '' as UUID,
    key: '', 
    label: '', 
    path: '', 
    icon: '', 
    isChild: false,
    parentKey: '', 
    order: 0 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<UUID | undefined>(undefined);
  const [errors, setErrors] = useState<{
    perModuleId?: string;
    key?: string;
    label?: string;
    path?: string;
    icon?: string;
    order?: string;
    parentKey?: string;
  }>({});
  
  // Add real-time key validation
  const [existingKeys, setExistingKeys] = useState<string[]>([]);
  
  // Fetch existing keys when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchExistingKeys = async () => {
        try {
          const permissions = await menuPermissionService.getAllMenuPermissions();
          const keys = permissions.map(p => p.key);
          setExistingKeys(keys);
        } catch (error) {
          console.error('Error fetching existing keys:', error);
        }
      };
      fetchExistingKeys();
    }
  }, [isOpen]);
  const [moduleNames, setModuleNames] = useState<NameListItem[]>([]);
  const [isFetchingModules, setIsFetchingModules] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);

  // Fetch module names when modal opens
  const fetchModuleNames = async () => {
    if (isOpen) {
      setIsFetchingModules(true);
      setModuleError(null);
      try {
        const modules = await menuPermissionService.getAllModuleNames();
        
        if (Array.isArray(modules)) {
          setModuleNames(modules);
        } else {
          console.error('Modules is not an array:', modules);
          setModuleError('Invalid response format from server');
          setModuleNames([]);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load modules';
        console.error('Error fetching module names:', error);
        setModuleError(errorMessage);
        setModuleNames([]);
      } finally {
        setIsFetchingModules(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen && moduleNames.length === 0 && !isFetchingModules && !moduleError) {
      fetchModuleNames();
    }
  }, [isOpen]);


  const moduleListItems: ListItem[] = Array.isArray(moduleNames) 
    ? moduleNames
        .filter(module => module && module.id && module.name) 
        .map(module => ({
          id: module.id,
          name: module.name
        }))
    : [];

  const handleSelectModule = (item: ListItem) => {
    setSelectedModule(item.id);
    setNewPermission(prev => ({ ...prev, perModuleId: item.id as UUID }));
    if (errors.perModuleId) setErrors(prev => ({ ...prev, perModuleId: undefined }));
  };

  const validateForm = () => {
    const newErrors: {
      perModuleId?: string;
      key?: string;
      label?: string;
      path?: string;
      icon?: string;
      order?: string;
      parentKey?: string;
    } = {};

    if (!newPermission.perModuleId) {
      newErrors.perModuleId = 'Please select a module';
    }

    if (!newPermission.key.trim()) {
      newErrors.key = "Key is required";
    }


    if (!newPermission.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (!newPermission.path.trim()) {
      newErrors.path = 'Path is required';
    }

    if (!newPermission.icon.trim()) {
      newErrors.icon = 'Icon is required';
    }

    if (newPermission.order < 0) {
      newErrors.order = 'Order must be a positive number';
    }

    if (newPermission.isChild && !newPermission.parentKey.trim()) {
      newErrors.parentKey = 'Parent key is required when Is Child is true';
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
      const dataToSend = {
        perModuleId: newPermission.perModuleId,
        key: newPermission.key.trim(), 
        label: newPermission.label.trim(),
        path: newPermission.path.trim(),
        icon: newPermission.icon.trim(),
        isChild: newPermission.isChild,
        parentKey: newPermission.parentKey.trim(),
        order: newPermission.order,
      };
      

      
      const response = await onAddPermission(dataToSend);

      const successMessage =
        response?.data?.message ||
        response?.message ||
        'Menu permission added successfully!';

      toast.success(successMessage);

      // Reset form and close modal
      setNewPermission({ 
        perModuleId: '' as UUID, 
        key: '', // Will be auto-generated
        label: '', 
        path: '', 
        icon: '', 
        isChild: false, 
        parentKey: '', 
        order: 0 
      });
      setSelectedModule(undefined);
      setErrors({});
      setIsOpen(false);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add menu permission';
      
      // Show the general error message
      toast.error(errorMessage);
      
      console.error('Error adding menu permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      // Reset form when closing
      setNewPermission({ 
        perModuleId: '' as UUID, 
        key: '', // Will be auto-generated
        label: '', 
        path: '', 
        icon: '', 
        isChild: false, 
        parentKey: '', 
        order: 0 
      });
      setSelectedModule(undefined);
      setErrors({});
      setModuleError(null);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const isFormValid =
    newPermission.perModuleId &&
    newPermission.key.trim() &&
    newPermission.label.trim() &&
    newPermission.path.trim() &&
    newPermission.icon.trim() &&
    newPermission.order >= 0 &&
    (!newPermission.isChild || newPermission.parentKey.trim()) &&
    !errors.key &&
    !errors.label &&
    !errors.path &&
    !errors.icon &&
    !errors.parentKey;

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer transition-colors duration-200"
      >
        <BadgePlus size={18} className="mr-2" />
        Add Menu Permission
      </Button>

      {/* Modal */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <BadgePlus size={20} className="text-emerald-600" />
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Add Menu Permission
                  </h2>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                disabled={isLoading}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column */}
                <div className="space-y-2">
                  {/* Module Selection - Full Width */}
                  <div className="space-y-2 min-h-[76px]">
                    <Label className="text-sm font-medium text-gray-700">
                      Select Module <span className="text-red-500">*</span>
                    </Label>

                    {isFetchingModules ? (
                      <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
                        <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                        <span className="text-sm text-gray-600">
                          Loading modules...
                        </span>
                      </div>
                    ) : moduleError ? (
                      <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">{moduleError}</p>
                      </div>
                    ) : (
                      <>
                        <List
                          items={moduleListItems}
                          selectedValue={selectedModule}
                          onSelect={handleSelectModule}
                          label=""
                          placeholder="Select a module"
                          required
                          disabled={isLoading}
                        />
                        {errors.perModuleId && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.perModuleId}
                          </p>
                        )}
                        {moduleListItems.length === 0 && !moduleError && (
                          <p className="text-sm text-amber-600 mt-1">
                            No modules available
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {/* Menu key */}
                  <div className="space-y-2 min-h-[76px]">
                    <Label
                      htmlFor="key"
                      className="text-sm font-medium text-gray-700"
                    >
                      Key{" "}
                    </Label>
                    <Input
                      id="key"
                      value={newPermission.key}
                      onChange={(e) => {
                        setNewPermission((prev) => ({
                          ...prev,
                          key: e.target.value,
                        }));
                        if (errors.key)
                          setErrors((prev) => ({ ...prev, key: undefined }));
                      }}
                      onBlur={() => {
                        const value = newPermission.key.trim();

                        if (value && existingKeys.includes(value)) {
                          toast.error("This menu key already exists");
                          setErrors((prev) => ({
                            ...prev,
                            key: "This key already exists",
                          }));
                        }
                      }}
                      placeholder="Enter menu key"
                      className={`w-full ${
                        errors.key
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : ""
                      }`}
                      disabled={isLoading || isFetchingModules}
                      aria-invalid={!!errors.key}
                      aria-describedby={errors.key ? "key-error" : undefined}
                    />
                    {errors.key && (
                      <p id="key-error" className="text-sm text-red-500">
                        {errors.key}
                      </p>
                    )}
                  </div>

                  {/* Path */}
                  <div className="space-y-2 min-h-[76px]">
                    <Label
                      htmlFor="path"
                      className="text-sm font-medium text-gray-700"
                    >
                      Path <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="path"
                      value={newPermission.path}
                      onChange={(e) => {
                        setNewPermission((prev) => ({
                          ...prev,
                          path: e.target.value,
                        }));
                        if (errors.path)
                          setErrors((prev) => ({ ...prev, path: undefined }));
                      }}
                      placeholder="Enter menu path (e.g., /dashboard)"
                      className={`w-full ${
                        errors.path
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : ""
                      }`}
                      disabled={isLoading || isFetchingModules}
                      aria-invalid={!!errors.path}
                      aria-describedby={errors.path ? "path-error" : undefined}
                    />
                    {errors.path && (
                      <p id="path-error" className="text-sm text-red-500">
                        {errors.path}
                      </p>
                    )}
                  </div>
                  {/* Menu Type - Is Child Checkbox */}
                  <div className="space-y-2 min-h-[76px]">
                    <Label className="text-sm font-medium text-gray-700">
                      Menu Type
                    </Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Checkbox
                        id="isChild"
                        checked={newPermission.isChild}
                        onCheckedChange={(checked) => {
                          setNewPermission((prev) => ({
                            ...prev,
                            isChild: checked as boolean,
                            parentKey: checked ? prev.parentKey : "",
                          }));
                        }}
                        disabled={isLoading || isFetchingModules}
                      />
                      <Label
                        htmlFor="isChild"
                        className="text-sm font-medium text-gray-700"
                      >
                        Is Child Menu
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-2">
                  {/* Order */}
                  <div className="space-y-2 min-h-[76px]">
                    <Label
                      htmlFor="order"
                      className="text-sm font-medium text-gray-700"
                    >
                      Order <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="order"
                      type="number"
                      min="0"
                      value={
                        newPermission.order === 0 ? "" : newPermission.order
                      }
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? 0
                            : parseInt(e.target.value) || 0;
                        setNewPermission((prev) => ({ ...prev, order: value }));
                        if (errors.order)
                          setErrors((prev) => ({ ...prev, order: undefined }));
                      }}
                      placeholder="Enter display order (e.g., 1, 2, 3...)"
                      className={`w-full ${
                        errors.order
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : ""
                      }`}
                      disabled={isLoading || isFetchingModules}
                      aria-invalid={!!errors.order}
                      aria-describedby={
                        errors.order ? "order-error" : undefined
                      }
                    />
                    {errors.order && (
                      <p id="order-error" className="text-sm text-red-500">
                        {errors.order}
                      </p>
                    )}
                  </div>

                  {/* Menu Name/Label */}
                  <div className="space-y-2 min-h-[76px]">
                    <Label
                      htmlFor="label"
                      className="text-sm font-medium text-gray-700"
                    >
                      Label <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="label"
                      value={newPermission.label}
                      onChange={(e) => {
                        setNewPermission((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }));
                        if (errors.label)
                          setErrors((prev) => ({ ...prev, label: undefined }));
                      }}
                      placeholder="Enter menu name/label"
                      className={`w-full ${
                        errors.label
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : ""
                      }`}
                      disabled={isLoading || isFetchingModules}
                      aria-invalid={!!errors.label}
                      aria-describedby={
                        errors.label ? "label-error" : undefined
                      }
                    />
                    {errors.label && (
                      <p id="label-error" className="text-sm text-red-500">
                        {errors.label}
                      </p>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="space-y-2 min-h-[76px]">
                    <Label
                      htmlFor="icon"
                      className="text-sm font-medium text-gray-700"
                    >
                      Icon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="icon"
                      value={newPermission.icon}
                      onChange={(e) => {
                        setNewPermission((prev) => ({
                          ...prev,
                          icon: e.target.value,
                        }));
                        if (errors.icon)
                          setErrors((prev) => ({ ...prev, icon: undefined }));
                      }}
                      placeholder="Enter icon name (e.g., dashboard, users)"
                      className={`w-full ${
                        errors.icon
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : ""
                      }`}
                      disabled={isLoading || isFetchingModules}
                      aria-invalid={!!errors.icon}
                      aria-describedby={errors.icon ? "icon-error" : undefined}
                    />
                    {errors.icon && (
                      <p id="icon-error" className="text-sm text-red-500">
                        {errors.icon}
                      </p>
                    )}
                  </div>

                  {/* Parent Key - Always reserve space but conditionally show content */}
                  <div className="space-y-2 min-h-[76px]">
                    {newPermission.isChild ? (
                      <>
                        <Label
                          htmlFor="parentKey"
                          className="text-sm font-medium text-gray-700"
                        >
                          Parent Key <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="parentKey"
                          value={newPermission.parentKey}
                          onChange={(e) => {
                            setNewPermission((prev) => ({
                              ...prev,
                              parentKey: e.target.value,
                            }));
                            if (errors.parentKey)
                              setErrors((prev) => ({
                                ...prev,
                                parentKey: undefined,
                              }));
                          }}
                          placeholder="Enter parent menu key"
                          className={`w-full ${
                            errors.parentKey
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : ""
                          }`}
                          disabled={isLoading || isFetchingModules}
                          aria-invalid={!!errors.parentKey}
                          aria-describedby={
                            errors.parentKey ? "parentKey-error" : undefined
                          }
                        />
                        {errors.parentKey && (
                          <p
                            id="parentKey-error"
                            className="text-sm text-red-500"
                          >
                            {errors.parentKey}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="opacity-0 pointer-events-none">
                        <Label className="text-sm font-medium text-gray-700">
                          -
                        </Label>
                        <div className="h-10 w-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
              <div className="flex justify-center items-center gap-3">
                <Button
                  variant="outline"
                  className="cursor-pointer px-6 min-w-[100px]"
                  onClick={handleClose}
                  disabled={isLoading || isFetchingModules}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6 min-w-[100px] shadow-sm hover:shadow transition-shadow duration-200"
                  onClick={handleSubmit}
                  disabled={
                    !isFormValid ||
                    isLoading ||
                    isFetchingModules ||
                    moduleError !== null ||
                    moduleListItems.length === 0
                  }
                  type="button"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    "Add Permission"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default AddMenuPermissionModal;