// components/settings/coreSettings/modules/EditModuleModal.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, LayoutGrid } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import type { CreateModuleDto, ModuleDto } from '../../../../services/core/settings/ModCore/core-module.api';
import toast from 'react-hot-toast';

interface EditModuleModalProps {
    module: ModuleDto;
    onUpdateModule: (id: string, data: Partial<CreateModuleDto>) => Promise<ModuleDto>;
    onClose: () => void;
    onRefresh?: () => void;
}

const EditModuleModal: React.FC<EditModuleModalProps> = ({
                                                             module,
                                                             onUpdateModule,
                                                             onClose,
                                                             onRefresh
                                                         }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateModuleDto>>({
        key: module.key,
        desc: module.desc,
        icon: module.icon || '',
        order: module.order || 0
    });
    const [errors, setErrors] = useState<{
        key?: string;
        desc?: string;
        icon?: string;
        order?: string;
    }>({});

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.key?.trim()) {
            newErrors.key = 'Module key is required';
        } else if (!/^[a-z.]+$/.test(formData.key)) {
            newErrors.key = 'Key must contain only lowercase letters and dots (e.g., mod.modulename)';
        }

        if (!formData.desc?.trim()) {
            newErrors.desc = 'Module description is required';
        }

        if (formData.order !== undefined && formData.order < 0) {
            newErrors.order = 'Order must be a positive number';
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
            const response = await onUpdateModule(module.id, formData);
            console.log('Update response:', response);
            toast.success(`Module updated successfully`);

            // Refresh the parent list
            if (onRefresh) {
                await onRefresh();
            }

            onClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update module';
            toast.error(errorMessage);
            console.error('Error updating module:', error);
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

    const commonIcons = [
        'Settings', 'Users', 'DollarSign', 'Package', 'Heart',
        'ShoppingCart', 'Target', 'Briefcase', 'Folder', 'BarChart',
        'LayoutDashboard', 'Building', 'MapPin', 'Network', 'Calendar',
        'Shield', 'History', 'Database', 'GraduationCap', 'Clock',
        'Award', 'BookOpen', 'ClipboardCheck', 'CreditCard', 'Truck'
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
                                Edit Module
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Update module information
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
                                value={formData.key}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, key: e.target.value }));
                                    if (errors.key) setErrors(prev => ({ ...prev, key: undefined }));
                                }}
                                placeholder="e.g., mod.modulename"
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
                                value={formData.desc}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, desc: e.target.value }));
                                    if (errors.desc) setErrors(prev => ({ ...prev, desc: undefined }));
                                }}
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
                                value={formData.icon}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, icon: e.target.value }));
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
                                            setFormData(prev => ({ ...prev, icon }));
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
                                value={formData.order === 0 ? '' : formData.order}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                    setFormData(prev => ({ ...prev, order: value }));
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
                        {(formData.key || formData.desc) && (
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
                                            {formData.desc || 'Module Name'}
                                        </p>
                                        <p className="text-xs text-gray-400 font-mono">
                                            {formData.key || 'mod.module'}
                                        </p>
                                    </div>
                                    {formData.icon && (
                                        <div className="px-2 py-1 bg-white rounded border border-gray-200">
                                            <span className="text-xs font-mono text-gray-600">
                                                icon: {formData.icon}
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
                            disabled={!formData.key?.trim() || !formData.desc?.trim() || isLoading}
                            type="button"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </div>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EditModuleModal;