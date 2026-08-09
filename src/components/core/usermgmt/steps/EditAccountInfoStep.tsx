// steps/EditAccountInfoStep.tsx - FIXED VERSION

import { useState, useEffect, useMemo } from "react";
import {
    Save, X, LayoutGrid, Check, AlertCircle, Search,
    Settings, Users, DollarSign, Package, Heart,
    ShoppingCart, Target, Briefcase, Folder, BarChart,
    ShieldCheck, Loader2, CheckCircle, AlertTriangle, Plus, Minus, ArrowRight
} from "lucide-react";
import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { getAllModules, saveUserPermissions } from "../../../../services/auth/account/account.api";
import type { EditWizardFormData } from "../EditAccountWizard";
import type { EmpSearchRes } from "../../../../types/core/EmpSearchRes";
import toast from "react-hot-toast";

// Icon mapping
const MODULE_ICONS: Record<string, any> = {
    'mod.core': Settings,
    'mod.hrm': Users,
    'mod.fnm': DollarSign,
    'mod.inv': Package,
    'mod.crm': Heart,
    'mod.pro': ShoppingCart,
    'mod.pld': Target,
    'mod.prm': Briefcase,
    'mod.flm': Folder,
    'mod.rpt': BarChart,
    'default': LayoutGrid
};

interface ExtendedModule {
    id: string;
    name: string;
    key: string;
    desc: string;
}

interface Props {
    employee: EmpSearchRes;
    userId: string;
    initialData: EditWizardFormData["step1"];
    onSave: (data: EditWizardFormData["step1"]) => void;
    onCancel: () => void;
    saving?: boolean;
    onFormChange?: () => void;
    isAccountActive?: boolean;
    originalModules?: string[];  // ✅ For change tracking
}

export function EditAccountInfoStep({
                                        employee,
                                        userId,
                                        initialData,
                                        onSave,
                                        onCancel,
                                        saving,
                                        onFormChange,
                                        isAccountActive = true,
                                        originalModules = []  // ✅ Default to empty array
                                    }: Props) {
    const [form, setForm] = useState(() => ({
        ...initialData,
        // ✅ Ensure moduleNames is always an array
        moduleNames: initialData.moduleNames || []
    }));
    const [modules, setModules] = useState<ExtendedModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showChangesSummary, setShowChangesSummary] = useState(false);

    // ✅ Calculate changes - which modules were added or removed
    const changes = useMemo(() => {
        const current = new Set(form.moduleIds || []);
        const original = new Set(originalModules || []);

        const added = (form.moduleIds || []).filter(id => !original.has(id));
        const removed = (originalModules || []).filter(id => !current.has(id));
        const unchanged = (form.moduleIds || []).filter(id => original.has(id));

        return { added, removed, unchanged };
    }, [form.moduleIds, originalModules]);

    const hasChanges = changes.added.length > 0 || changes.removed.length > 0;

    useEffect(() => {
        console.log("EditAccountInfoStep - userId:", userId);
        console.log("EditAccountInfoStep - originalModules:", originalModules);
        console.log("EditAccountInfoStep - current modules:", form.moduleIds);
        console.log("EditAccountInfoStep - changes:", changes);
    }, [userId, originalModules, form.moduleIds]);

    // Fetch modules only (roles are separate, not saved here)
    useEffect(() => {
        const fetchModules = async () => {
            setLoading(true);
            try {
                const modulesData = await getAllModules();
                setModules(modulesData || []);
            } catch (error) {
                console.error("Failed to fetch modules:", error);
                toast.error("Failed to load modules");
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);

    const toggleModule = (id: string) => {
        setForm(prev => {
            const newModuleIds = prev.moduleIds.includes(id)
                ? prev.moduleIds.filter(x => x !== id)
                : [...prev.moduleIds, id];

            // ✅ Update module names when modules change
            const newModuleNames = modules
                .filter(m => newModuleIds.includes(m.id))
                .map(m => m.name || m.key);

            return {
                ...prev,
                moduleIds: newModuleIds,
                moduleNames: newModuleNames
            };
        });
        onFormChange?.();
    };

    const toggleAllModules = () => {
        setForm(prev => {
            const newModuleIds = prev.moduleIds.length === modules.length
                ? []
                : modules.map(m => m.id);

            const newModuleNames = modules
                .filter(m => newModuleIds.includes(m.id))
                .map(m => m.name || m.key);

            return {
                ...prev,
                moduleIds: newModuleIds,
                moduleNames: newModuleNames
            };
        });
        onFormChange?.();
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (form.moduleIds.length === 0) e.modules = "Select at least one module";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        if (!userId) {
            toast.error("User ID is missing. Please refresh and try again.");
            return;
        }

        // ✅ Show confirmation if there are changes
        if (hasChanges) {
            const addedNames = changes.added.map(id => modules.find(m => m.id === id)?.name || id);
            const removedNames = changes.removed.map(id => modules.find(m => m.id === id)?.name || id);

            let message = '⚠️ You are about to make the following changes:\n\n';
            if (addedNames.length > 0) {
                message += `➕ Added (${addedNames.length}):\n${addedNames.map(n => `  • ${n}`).join('\n')}\n\n`;
            }
            if (removedNames.length > 0) {
                message += `➖ Removed (${removedNames.length}):\n${removedNames.map(n => `  • ${n}`).join('\n')}\n\n`;
            }
            message += '\n⚠️ Removing modules will also remove their associated menus and API permissions.\n';
            message += '\nProceed with these changes?';

            if (!confirm(message)) {
                return;
            }
        }

        setIsSaving(true);
        try {
            await saveUserPermissions({
                userId: userId,
                moduleIds: form.moduleIds,
                menuIds: null,      // ✅ Preserve menus
                apiActionIds: null  // ✅ Preserve APIs
            });

            const moduleNames = modules.filter(m => form.moduleIds.includes(m.id)).map(m => m.name || m.key);

            toast.success(`✅ Updated: ${form.moduleIds.length} modules selected`);

            // ✅ Pass changes to onSave with additional info for parent
            onSave({
                ...form,
                roleName: form.roleName,
                moduleNames,
                changes: {
                    added: changes.added,
                    removed: changes.removed,
                    addedNames: changes.added.map(id => modules.find(m => m.id === id)?.name || id),
                    removedNames: changes.removed.map(id => modules.find(m => m.id === id)?.name || id),
                }
            });
        } catch (error: any) {
            console.error("Save failed:", error);
            toast.error(error.message || "Failed to save module changes");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredModules = useMemo(() => {
        if (!searchTerm) return modules;
        const term = searchTerm.toLowerCase();
        return modules.filter(m =>
            (m.name?.toLowerCase().includes(term)) ||
            (m.key?.toLowerCase().includes(term)) ||
            (m.desc?.toLowerCase().includes(term))
        );
    }, [modules, searchTerm]);

    const selectedCount = form.moduleIds.length;
    const totalModules = modules.length;

    // Helper functions for change detection
    const isNewlyAdded = (moduleId: string) => changes.added.includes(moduleId);
    const isRemoved = (moduleId: string) => changes.removed.includes(moduleId);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                <span className="ml-3 text-gray-500">Loading modules...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 🔐 Account Status Banner */}
            <div className={`p-4 rounded-xl border ${
                isAccountActive
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
            }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {isAccountActive ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                        <div>
                            <p className={`text-sm font-medium ${
                                isAccountActive ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                            }`}>
                                {isAccountActive ? '✅ Active Account' : '⛔ Inactive Account'}
                            </p>
                            <p className={`text-xs ${
                                isAccountActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                                {isAccountActive
                                    ? 'User can login and access the system'
                                    : 'Account is disabled. User cannot login.'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-4 h-4 ${
                            isAccountActive ? 'text-green-600' : 'text-red-600'
                        }`} />
                        <span className={`text-xs ${
                            isAccountActive ? 'text-green-700' : 'text-red-700'
                        }`}>
                            {isAccountActive
                                ? 'Permissions can be modified'
                                : 'Permissions cannot be modified'
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* ✅ Changes Summary Banner */}
            {hasChanges && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                {changes.added.length > 0 && (
                                    <span className="text-emerald-600 dark:text-emerald-400">+{changes.added.length} added</span>
                                )}
                                {changes.added.length > 0 && changes.removed.length > 0 && ' | '}
                                {changes.removed.length > 0 && (
                                    <span className="text-red-600 dark:text-red-400">-{changes.removed.length} removed</span>
                                )}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowChangesSummary(!showChangesSummary)}
                            className="text-xs text-amber-600 hover:text-amber-700"
                        >
                            {showChangesSummary ? 'Hide Details' : 'View Details'}
                        </button>
                    </div>

                    {/* Changes Details */}
                    {showChangesSummary && (
                        <div className="mt-2 space-y-1">
                            {changes.added.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    <span className="text-xs font-medium text-emerald-600">Added:</span>
                                    {changes.added.map(id => {
                                        const mod = modules.find(m => m.id === id);
                                        return mod ? (
                                            <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> {mod.name || mod.key}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}
                            {changes.removed.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    <span className="text-xs font-medium text-red-600">Removed:</span>
                                    {changes.removed.map(id => {
                                        const mod = modules.find(m => m.id === id);
                                        return mod ? (
                                            <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                                <Minus className="w-3 h-3" /> {mod.name || mod.key}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Warning when removing modules */}
            {changes.removed.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-800">
                                ⚠️ Removing {changes.removed.length} module(s)
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                                This will also remove all associated menus and API permissions for these modules.
                                You will need to reconfigure them in the next steps.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        Module Access
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Update module access for {employee?.empFullName || employee?.name}
                    </p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-gray-100">
                    <span className="text-sm font-medium text-gray-700">
                        {selectedCount} / {totalModules} modules
                        {hasChanges && (
                            <span className="ml-2 text-xs text-amber-600">
                                ({changes.added.length} added, {changes.removed.length} removed)
                            </span>
                        )}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Module Access */}
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <Label className="text-sm font-semibold text-gray-700">
                            Module Access <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search modules..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-gray-500"
                                />
                            </div>
                            {modules.length > 0 && (
                                <button
                                    type="button"
                                    onClick={toggleAllModules}
                                    className="text-xs font-medium text-gray-600 hover:text-gray-700 px-2 py-1.5 rounded border border-gray-200 hover:bg-gray-50"
                                >
                                    {selectedCount === totalModules ? "Deselect All" : "Select All"}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
                        {filteredModules.map((module) => {
                            const isSelected = form.moduleIds.includes(module.id);
                            const isNew = isNewlyAdded(module.id);
                            const isRemovedModule = isRemoved(module.id);
                            const Icon = MODULE_ICONS[module.key] || MODULE_ICONS.default;

                            // Determine styles based on change status
                            let borderClass = 'border-gray-200 hover:border-gray-300';
                            let bgClass = 'bg-white';
                            let indicator = null;

                            if (isNew && isSelected) {
                                borderClass = 'border-emerald-500 border-2';
                                bgClass = 'bg-emerald-50';
                                indicator = (
                                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                                        <Plus className="w-3 h-3 text-white" />
                                    </div>
                                );
                            } else if (isRemovedModule && !isSelected) {
                                borderClass = 'border-red-400 border-2 opacity-60';
                                bgClass = 'bg-red-50';
                                indicator = (
                                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                                        <Minus className="w-3 h-3 text-white" />
                                    </div>
                                );
                            } else if (isSelected) {
                                borderClass = 'border-gray-400';
                                bgClass = 'bg-gray-50';
                                indicator = (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center shadow">
                                        <Check className="w-3 h-3 text-white" />
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={module.id}
                                    type="button"
                                    onClick={() => toggleModule(module.id)}
                                    disabled={!isAccountActive}
                                    className={`
                                        relative p-3 rounded border-2 text-left transition-all
                                        ${!isAccountActive ? 'opacity-60 cursor-not-allowed' : ''}
                                        ${borderClass}
                                        ${bgClass}
                                    `}
                                >
                                    {indicator}

                                    <div className={`
                                        w-10 h-10 rounded flex items-center justify-center mb-2
                                        ${isSelected ? "bg-gray-100" : "bg-gray-50"}
                                    `}>
                                        <Icon className={`w-5 h-5 ${isSelected ? "text-gray-700" : "text-gray-400"}`} />
                                    </div>

                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                        {module.name || module.key}
                                    </p>

                                    {/* Change labels */}
                                    {isNew && isSelected && (
                                        <p className="text-xs text-emerald-600 font-medium mt-1">✨ Newly Added</p>
                                    )}
                                    {isRemovedModule && !isSelected && (
                                        <p className="text-xs text-red-600 font-medium mt-1">🗑️ Removed</p>
                                    )}

                                    {module.desc && (
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                            {module.desc}
                                        </p>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {errors.modules && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded border border-red-200">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <p className="text-xs text-red-600">{errors.modules}</p>
                        </div>
                    )}
                </div>

                {/* Selected Summary */}
                {selectedCount > 0 && (
                    <div className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-gray-600">
                                Selected Modules ({selectedCount})
                                {hasChanges && (
                                    <span className="ml-2 text-xs text-amber-600">
                                        ({changes.added.length} added, {changes.removed.length} removed)
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {modules
                                .filter(m => form.moduleIds.includes(m.id))
                                .slice(0, 6)
                                .map(module => {
                                    const isNew = isNewlyAdded(module.id);
                                    const isRemovedModule = isRemoved(module.id);
                                    return (
                                        <span
                                            key={module.id}
                                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                                isNew
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                    : isRemovedModule
                                                        ? 'bg-red-100 text-red-700 border border-red-300'
                                                        : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            {module.name || module.key}
                                            {isNew && <Plus className="w-3 h-3" />}
                                            {isRemovedModule && <Minus className="w-3 h-3" />}
                                        </span>
                                    );
                                })}
                            {selectedCount > 6 && (
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                                    +{selectedCount - 6} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="gap-1.5"
                    >
                        <X className="w-4 h-4" /> Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving || isSaving || selectedCount === 0 || !userId || !isAccountActive}
                        className={`gap-1.5 ${
                            !isAccountActive
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gray-800 hover:bg-gray-900'
                        } text-white`}
                    >
                        {(saving || isSaving) ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isAccountActive ? 'Save Module Changes' : 'Account Inactive'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}