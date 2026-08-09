// components/settings/coreSettings/modules/AddModuleModal.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, LayoutGrid } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { coreModuleApi } from '../../../../services/core/settings/ModCore/core-module.api';
import type { CreateModuleDto, ModuleDto } from '../../../../services/core/settings/ModCore/core-module.api';
import toast from 'react-hot-toast';

interface AddModuleModalProps {
    onAddModule: (module: CreateModuleDto) => Promise<ModuleDto>;
    onClose: () => void;
    onModuleAdded?: () => void;
}

const AddModuleModal: React.FC<AddModuleModalProps> = ({ onAddModule, onClose, onModuleAdded }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [existingKeys, setExistingKeys] = useState<string[]>([]);

    const [newModule, setNewModule] = useState<CreateModuleDto>({
        key: '',
        desc: '',
        icon: '',
        order: 0
    });

    const [errors, setErrors] = useState<{
        key?: string;
        desc?: string;
        icon?: string;
        order?: string;
    }>({});

    // Fetch existing modules to check for duplicate keys
    const fetchExistingModules = async () => {
        try {
            const modules = await coreModuleApi.getAllModules();
            const keys = modules.map(m => m.key);
            setExistingKeys(keys);
        } catch (error) {
            console.error('Error fetching existing modules:', error);
        }
    };

    useEffect(() => {
        fetchExistingModules();
    }, []);

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!newModule.key.trim()) {
            newErrors.key = 'Module key is required';
        } else if (existingKeys.includes(newModule.key.trim())) {
            newErrors.key = 'This module key already exists';
        } else if (!/^[a-z.]+$/.test(newModule.key)) {
            newErrors.key = 'Key must contain only lowercase letters and dots (e.g., mod.newmodule)';
        }

        if (!newModule.desc.trim()) {
            newErrors.desc = 'Module description is required';
        }

        if (newModule.order !== undefined && newModule.order < 0) {
            newErrors.order = 'Order must be a positive number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateKeyFromDesc = (desc: string): string => {
        return 'mod.' + desc
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '.')
            .replace(/^\.+|\.+$/g, '');
    };

    const handleDescChange = (value: string) => {
        setNewModule(prev => ({ ...prev, desc: value }));
        if (errors.desc) setErrors(prev => ({ ...prev, desc: undefined }));

        // Auto-generate key from description if key is empty or was auto-generated
        if (!newModule.key || newModule.key === generateKeyFromDesc(newModule.desc)) {
            const autoKey = generateKeyFromDesc(value);
            setNewModule(prev => ({ ...prev, key: autoKey }));
            if (errors.key && !existingKeys.includes(autoKey)) {
                setErrors(prev => ({ ...prev, key: undefined }));
            }
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsLoading(true);

        try {
            const dataToSend: CreateModuleDto = {
                key: newModule.key.trim(),
                desc: newModule.desc.trim(),
                icon: newModule.icon?.trim() || '',
                order: newModule.order || 0
            };

            console.log('Sending data to API:', dataToSend);

            await onAddModule(dataToSend);

            toast.success(`Module "${newModule.desc}" added successfully!`);

            // Reset form
            setNewModule({
                key: '',
                desc: '',
                icon: '',
                order: 0
            });
            setErrors({});

            // Notify parent to refresh module list
            if (onModuleAdded) {
                onModuleAdded();
            }

            onClose();

        } catch (error: any) {
            const errorMessage = error.message || 'Failed to add module';
            toast.error(errorMessage);
            console.error('Error adding module:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    const isFormValid = () => {
        return newModule.key.trim() &&
            newModule.desc.trim() &&
            !errors.key &&
            !errors.desc &&
            (newModule.order === undefined || newModule.order >= 0);
    };

    const commonIcons = [
        'Settings', 'Users', 'DollarSign', 'Package', 'Heart',
        'ShoppingCart', 'Target', 'Briefcase', 'Folder', 'BarChart',
        'LayoutDashboard', 'Building', 'MapPin', 'Network', 'Calendar',
        'Shield', 'History', 'Database', 'GraduationCap', 'Clock'
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
             onClick={(e) => {
                 if (e.target === e.currentTarget && !isLoading) {
                     onClose();
                 }
             }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <LayoutGrid size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">
                                Add New Module
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Create a new module for the system
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        disabled={isLoading}
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="space-y-5">
                        {/* Module Key */}
                        <div className="space-y-2">
                            <Label htmlFor="key" className="text-sm font-medium text-gray-700">
                                Module Key <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="key"
                                value={newModule.key}
                                onChange={(e) => {
                                    setNewModule(prev => ({ ...prev, key: e.target.value }));
                                    if (errors.key) setErrors(prev => ({ ...prev, key: undefined }));
                                }}
                                onBlur={() => {
                                    if (newModule.key && existingKeys.includes(newModule.key)) {
                                        toast.error("This module key already exists");
                                        setErrors(prev => ({ ...prev, key: "This key already exists" }));
                                    }
                                }}
                                placeholder="e.g., mod.newmodule"
                                className={`font-mono text-sm ${errors.key ? "border-red-300 focus:ring-red-500" : ""}`}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500">
                                Use format: <span className="font-mono">mod.modulename</span> (lowercase, dots for hierarchy)
                            </p>
                            {errors.key && (
                                <p className="text-sm text-red-500 mt-1">{errors.key}</p>
                            )}
                        </div>

                        {/* Module Description / Name */}
                        <div className="space-y-2">
                            <Label htmlFor="desc" className="text-sm font-medium text-gray-700">
                                Module Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="desc"
                                value={newModule.desc}
                                onChange={(e) => handleDescChange(e.target.value)}
                                placeholder="e.g., Learning Management System"
                                className={errors.desc ? "border-red-300 focus:ring-red-500" : ""}
                                disabled={isLoading}
                            />
                            {errors.desc && (
                                <p className="text-sm text-red-500 mt-1">{errors.desc}</p>
                            )}
                        </div>

                        {/* Module Icon */}
                        <div className="space-y-2">
                            <Label htmlFor="icon" className="text-sm font-medium text-gray-700">
                                Icon Name <span className="text-gray-400 text-xs">(optional)</span>
                            </Label>
                            <Input
                                id="icon"
                                value={newModule.icon}
                                onChange={(e) => {
                                    setNewModule(prev => ({ ...prev, icon: e.target.value }));
                                    if (errors.icon) setErrors(prev => ({ ...prev, icon: undefined }));
                                }}
                                placeholder="e.g., GraduationCap, BookOpen, Award"
                                disabled={isLoading}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs text-gray-500">Suggested icons:</span>
                                {commonIcons.slice(0, 10).map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => {
                                            setNewModule(prev => ({ ...prev, icon }));
                                            if (errors.icon) setErrors(prev => ({ ...prev, icon: undefined }));
                                        }}
                                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                            {errors.icon && (
                                <p className="text-sm text-red-500 mt-1">{errors.icon}</p>
                            )}
                        </div>

                        {/* Module Order */}
                        <div className="space-y-2">
                            <Label htmlFor="order" className="text-sm font-medium text-gray-700">
                                Display Order <span className="text-gray-400 text-xs">(optional)</span>
                            </Label>
                            <Input
                                id="order"
                                type="number"
                                min="0"
                                value={newModule.order === 0 ? '' : newModule.order}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                    setNewModule(prev => ({ ...prev, order: value }));
                                    if (errors.order) setErrors(prev => ({ ...prev, order: undefined }));
                                }}
                                placeholder="Enter display order (1, 2, 3...)"
                                className={errors.order ? "border-red-300 focus:ring-red-500" : ""}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500">
                                Modules will be displayed in ascending order. Leave 0 for automatic placement.
                            </p>
                            {errors.order && (
                                <p className="text-sm text-red-500 mt-1">{errors.order}</p>
                            )}
                        </div>

                        {/* Preview Section */}
                        {(newModule.key || newModule.desc) && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                    Preview
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                        <LayoutGrid className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">
                                            {newModule.desc || 'Module Name'}
                                        </p>
                                        <p className="text-xs text-gray-400 font-mono">
                                            {newModule.key || 'mod.module'}
                                        </p>
                                    </div>
                                    {newModule.icon && (
                                        <div className="px-2 py-1 bg-white rounded border border-gray-200">
                                            <span className="text-xs font-mono text-gray-600">
                                                icon: {newModule.icon}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
                    <div className="flex justify-center items-center gap-3">
                        <Button
                            variant="outline"
                            className="cursor-pointer px-6 min-w-[100px]"
                            onClick={onClose}
                            disabled={isLoading}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6 min-w-[100px] shadow-sm hover:shadow transition-shadow duration-200"
                            onClick={handleSubmit}
                            disabled={!isFormValid() || isLoading}
                            type="button"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </div>
                            ) : (
                                "Add Module"
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AddModuleModal;