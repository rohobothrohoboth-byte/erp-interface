// src/components/core/usermgmt/EditAccountStepForm.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
    Shield, Key, ArrowLeft, CheckCircle, AlertCircle, Lock,
    User, Building2, Mail, Save, RotateCcw, Download, Upload,
    Clock, ChevronLeft, ChevronRight, HelpCircle, Sparkles, Copy, Zap, Star,
    ClipboardList, Eye, EyeOff
} from "lucide-react";
import { EditAccountBasicInfoStep } from "@/modules/core/components/usermgmt/steps/EditAccountBasicInfoStep";
import { EditMenuPermissionsStep } from "@/modules/core/components/usermgmt/steps/EditMenuPermissionsStep";
import { EditAccessPermissionsStep } from "@/modules/core/components/usermgmt/steps/EditAccessPermissionsStep";
import { AddAccountStepHeader } from "@/modules/core/components/usermgmt/AddAccountStepHeader";
import type { EmpSearchRes } from "@/modules/core/types/EmpSearchRes";
import type { UUID } from "@/modules/auth/types/registration";
import type {
    ModPerMenuListDto,
    NameList,
} from "@/modules/auth/types/ModPerMenu";
import type { MenuPerApiListDto } from "@/modules/auth/types/MenuPerApi";
import { perMenuApi } from "@/modules/auth/services/perMenu/perMenu.api";
import { menuPerApiApi } from "@/modules/auth/services/menuPerApi/menuPerApi.api";
import toast from "react-hot-toast";
import { Button } from "@/shared/components/ui/button";
import { DeleteAccountModal } from "@/modules/core/components/usermgmt/steps/DeleteAccountModal";

const STEPS = [
    { id: 1, title: "Module Access", icon: Shield, description: "Select modules for this account" },
    { id: 2, title: "Menu Permissions", icon: Shield, description: "Grant navigation access" },
    { id: 3, title: "Access Permissions", icon: Key, description: "Define API action privileges" },
];

interface EditAccountStepFormProps {
    onBackToAccounts: () => void;
    onAccountUpdated: (result: any) => void;
    onAccountDeleted?: (result: any) => void;
    employee?: EmpSearchRes;
    accountData?: {
        userId: string;
        modules: string[];
        moduleNames?: string[];
        permissions: string[];
        permissionNames?: string[];
        apiPermissions: string[];
        apiPermissionNames?: string[];
        isActive?: boolean;
        roleId?: string;
        appUserId?: string;
        hasAccount?: boolean;
    };
}

// Save Confirmation Modal
function SaveConfirmationModal({ isOpen, onConfirm, onCancel }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void; }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Save className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Save Progress</h3>
                </div>
                <p className="text-gray-600 mb-6">Your current progress will be saved as a draft.</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Save Draft</button>
                </div>
            </div>
        </div>
    );
}

// Restore Draft Modal
function RestoreDraftModal({ isOpen, onRestore, onStartNew, draftDate }: { isOpen: boolean; onRestore: () => void; onStartNew: () => void; draftDate: Date | null; }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Restore Draft</h3>
                </div>
                <p className="text-gray-600 mb-2">You have a saved draft from {draftDate?.toLocaleString()}.</p>
                <p className="text-sm text-gray-500 mb-6">Would you like to restore it or start fresh?</p>
                <div className="flex gap-3">
                    <button onClick={onStartNew} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Start Fresh</button>
                    <button onClick={onRestore} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Restore Draft</button>
                </div>
            </div>
        </div>
    );
}

export const EditAccountStepForm: React.FC<EditAccountStepFormProps> = ({
                                                                            onBackToAccounts,
                                                                            onAccountUpdated,
                                                                            onAccountDeleted,
                                                                            employee,
                                                                            accountData,
                                                                        }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [savedDraftDate, setSavedDraftDate] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // ============================================================
    // Form State - Complete with names for display
    // ============================================================
    const initialFormData = {
        step1: {
            modules: accountData?.modules || [],
            moduleNames: accountData?.moduleNames || [],
        },
        step2: {
            permissions: accountData?.permissions || [],
            permissionNames: accountData?.permissionNames || [],
        },
        step3: {
            apiPermissions: accountData?.apiPermissions || [],
            apiPermissionNames: accountData?.apiPermissionNames || [],
        },
    };

    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>(accountData?.userId || "");
    const [isUpdateComplete, setIsUpdateComplete] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isAccountActive, setIsAccountActive] = useState<boolean>(accountData?.isActive !== false);

    // Real data state for permissions (Step 2)
    const [permissionsData, setPermissionsData] = useState<ModPerMenuListDto[]>([]);
    const [flattenedPermissions, setFlattenedPermissions] = useState<
        Array<NameList & { moduleId: UUID; moduleName: string }>
    >([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const [permissionsError, setPermissionsError] = useState<string | null>(null);

    // Real data state for API permissions (Step 3)
    const [apiPermissionsData, setApiPermissionsData] = useState<MenuPerApiListDto[]>([]);
    const [flattenedApiPermissions, setFlattenedApiPermissions] = useState<
        Array<NameList & { menuId: UUID; menuName: string }>
    >([]);
    const [isLoadingApiPermissions, setIsLoadingApiPermissions] = useState(false);
    const [apiPermissionsError, setApiPermissionsError] = useState<string | null>(null);

    // ============================================================
    // Draft Management
    // ============================================================
    const getDraftKey = useCallback(() => `edit-account-draft-${userId || accountData?.userId || 'temp'}`, [userId, accountData?.userId]);

    const saveDraft = useCallback(() => {
        if (!userId) return;
        setIsSaving(true);
        const draft = {
            timestamp: new Date().toISOString(),
            step: currentStep,
            formData,
            userId,
            employeeId: employee?.id,
        };
        localStorage.setItem(getDraftKey(), JSON.stringify(draft));
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 500);
    }, [currentStep, formData, userId, employee?.id, getDraftKey]);

    // Auto-save every 30 seconds
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if ((currentStep > 1 || formData.step1.modules.length > 0) && userId) {
                saveDraft();
            }
        }, 30000);
        return () => clearInterval(autoSaveInterval);
    }, [formData, currentStep, userId, saveDraft]);

    // Check for saved draft on mount
    useEffect(() => {
        if (!userId) return;
        const savedDraft = localStorage.getItem(getDraftKey());
        if (savedDraft) {
            try {
                const { timestamp, formData: savedData } = JSON.parse(savedDraft);
                if (savedData.step1.modules.length > 0 || savedData.step2.permissions.length > 0) {
                    setSavedDraftDate(new Date(timestamp));
                    setShowRestoreModal(true);
                }
            } catch (e) {
                console.error('Error parsing draft:', e);
            }
        }
    }, [userId, getDraftKey]);

    const restoreDraft = useCallback(() => {
        const savedDraft = localStorage.getItem(getDraftKey());
        if (savedDraft) {
            try {
                const { step: savedStep, formData: savedData, userId: savedUserId } = JSON.parse(savedDraft);
                setFormData(savedData);
                setCurrentStep(savedStep || 1);
                if (savedUserId) setUserId(savedUserId);
                setShowRestoreModal(false);
                toast.success('Draft restored successfully!');
            } catch (e) {
                console.error('Error restoring draft:', e);
                toast.error('Failed to restore draft');
            }
        }
    }, [getDraftKey]);

    const startFresh = useCallback(() => {
        localStorage.removeItem(getDraftKey());
        setShowRestoreModal(false);
        setFormData(initialFormData);
        setCurrentStep(1);
        toast.info('Started fresh');
    }, [getDraftKey, initialFormData]);

    // ============================================================
    // Export/Import
    // ============================================================
    const exportConfig = useCallback(() => {
        const exportData = {
            employee: {
                id: employee?.id,
                code: employee?.code,
                name: employee?.empFullName,
            },
            userId,
            permissions: formData,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edit-permissions-${employee?.code}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [employee, userId, formData]);

    const importConfig = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const imported = JSON.parse(event.target?.result as string);
                        if (imported.permissions) {
                            setFormData(imported.permissions);
                            if (imported.userId) setUserId(imported.userId);
                            setCurrentStep(1);
                            toast.success('Configuration imported successfully!');
                        }
                    } catch (err) {
                        console.error(err);
                        toast.error('Invalid configuration file');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }, []);

    // ============================================================
    // Permission Summary
    // ============================================================
    const permissionSummary = useMemo(() => ({
        modules: formData.step1.modules.length,
        menus: formData.step2.permissions.length,
        actions: formData.step3.apiPermissions.length,
        total: formData.step2.permissions.length + formData.step3.apiPermissions.length,
    }), [formData]);

    // ============================================================
    // Helper functions
    // ============================================================
    const getEmployeeEmail = () => {
        if (!employee) return "";
        if (employee.code) {
            if (employee.code.includes("@")) {
                return employee.code;
            }
            return `${employee.code.toLowerCase()}@company.com`;
        }
        return "";
    };

    const getEmployeeDisplayName = () => {
        if (!employee) return "";
        return employee.empFullName || "";
    };

    const getEmployeeCode = () => {
        if (!employee) return "";
        return employee.code || "";
    };

    const getInitials = () => {
        const name = employee?.empFullName || "??";
        return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    };

    // ============================================================
    // Fetch permissions
    // ============================================================
    useEffect(() => {
        const fetchPermissionsData = async () => {
            if (currentStep === 2 && formData.step1.modules.length > 0 && userId) {
                setIsLoadingPermissions(true);
                setPermissionsError(null);
                try {
                    const selectedModuleIds = formData.step1.modules.map((id) => id as UUID);
                    const userIdTyped = userId as UUID;
                    const filteredPermissions = await perMenuApi.getFilteredPermissionsForUser(
                        userIdTyped,
                        selectedModuleIds,
                    );
                    setPermissionsData(filteredPermissions);
                    const flattened = await perMenuApi.getFlattenedPermissionsForUser(
                        userIdTyped,
                        selectedModuleIds,
                    );
                    setFlattenedPermissions(flattened);
                    if (filteredPermissions.length === 0) {
                        toast("No permissions found for the selected modules", {
                            icon: "⚠️",
                            style: { background: "#fef3c7", color: "#92400e" },
                        });
                    }
                } catch (error: any) {
                    console.error("Error fetching permissions:", error);
                    setPermissionsError(error.message || "Failed to load permissions");
                    toast.error("Could not load permissions. Please try again.");
                    setPermissionsData([]);
                    setFlattenedPermissions([]);
                } finally {
                    setIsLoadingPermissions(false);
                }
            }
        };
        fetchPermissionsData();
    }, [currentStep, formData.step1.modules, userId]);

    useEffect(() => {
        const fetchApiPermissionsData = async () => {
            if (currentStep === 3 && userId && formData.step2.permissions.length > 0) {
                setIsLoadingApiPermissions(true);
                setApiPermissionsError(null);
                try {
                    const selectedMenuIds = formData.step2.permissions.map((id) => id as UUID);
                    const userIdTyped = userId as UUID;
                    const filteredApiPermissions = await menuPerApiApi.getFilteredPerApisForUser(
                        userIdTyped,
                        selectedMenuIds,
                    );
                    setApiPermissionsData(filteredApiPermissions);
                    const flattened = await menuPerApiApi.getFlattenedPerApisForUser(
                        userIdTyped,
                        selectedMenuIds,
                    );
                    setFlattenedApiPermissions(flattened);
                    if (filteredApiPermissions.length === 0) {
                        toast("No API permissions found for the selected menus", {
                            icon: "⚠️",
                            style: { background: "#fef3c7", color: "#92400e" },
                        });
                    }
                } catch (error: any) {
                    console.error("Error fetching API permissions:", error);
                    setApiPermissionsError(error.message || "Failed to load API permissions");
                    toast.error("Could not load API permissions. Please try again.");
                    setApiPermissionsData([]);
                    setFlattenedApiPermissions([]);
                } finally {
                    setIsLoadingApiPermissions(false);
                }
            }
        };
        fetchApiPermissionsData();
    }, [currentStep, userId, formData.step2.permissions]);

    // ============================================================
    // Transform functions
    // ============================================================
    const getPermissionsForStep2 = () => {
        if (flattenedPermissions.length > 0) {
            return flattenedPermissions.map((permission) => ({
                id: permission.id,
                name: permission.name,
                module: permission.moduleName,
                description: `Permission for ${permission.moduleName} module`,
            }));
        }
        if (permissionsData.length > 0) {
            const permissions: any[] = [];
            for (const moduleGroup of permissionsData) {
                for (const permission of moduleGroup.perMenuList) {
                    permissions.push({
                        id: permission.id,
                        name: permission.name,
                        module: moduleGroup.perModule,
                        description: `Permission for ${moduleGroup.perModule} module`,
                    });
                }
            }
            return permissions;
        }
        return [];
    };

    const getFilteredDetailedPermissions = () => {
        if (formData.step2.permissions.length === 0 || flattenedApiPermissions.length === 0) {
            return [];
        }
        return flattenedApiPermissions.map((apiPermission) => ({
            id: apiPermission.id,
            name: apiPermission.name,
            mainPermissionId: apiPermission.menuId,
            action: "access",
            resource: apiPermission.name.toLowerCase().replace(/\s+/g, "_"),
            description: `API access for ${apiPermission.menuName}`,
        }));
    };

    const getMainPermissionsList = () => {
        if (apiPermissionsData.length > 0) {
            return apiPermissionsData.map((menuGroup) => ({
                id: menuGroup.perMenuId,
                name: menuGroup.perMenu,
                description: `Menu: ${menuGroup.perMenu}`,
            }));
        }
        return [];
    };

    // ============================================================
    // Navigation
    // ============================================================
    const goNext = () => setCurrentStep(prev => Math.min(STEPS.length, prev + 1));
    const goBack = () => setCurrentStep(prev => Math.max(1, prev - 1));

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        scrollToTop();
    }, [currentStep]);

    // ============================================================
    // Clear data
    // ============================================================
    const clearTemporaryData = () => {
        localStorage.removeItem("editAccountFormData");
        localStorage.removeItem(getDraftKey());
        setFormData({
            step1: { modules: [], moduleNames: [] },
            step2: { permissions: [], permissionNames: [] },
            step3: { apiPermissions: [], apiPermissionNames: [] },
        });
        setCurrentStep(1);
        setUserId("");
        setIsUpdateComplete(false);
        setPermissionsData([]);
        setFlattenedPermissions([]);
        setPermissionsError(null);
        setApiPermissionsData([]);
        setFlattenedApiPermissions([]);
        setApiPermissionsError(null);
    };

    // ============================================================
    // Step handlers
    // ============================================================
    const handleStep1Submit = async (step1Data: any) => {
        console.log('📝 STEP 1: Saving modules...', step1Data.modules);
        setLoading(true);
        setError(null);
        try {
            if (!employee?.id || !userId) {
                throw new Error("Employee ID or User ID not found");
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const updatedFormData = {
                step1: {
                    modules: step1Data.modules || [],
                    moduleNames: step1Data.moduleNames || [],
                },
                step2: {
                    permissions: formData.step2.permissions || [],
                    permissionNames: formData.step2.permissionNames || [],
                },
                step3: {
                    apiPermissions: formData.step3.apiPermissions || [],
                    apiPermissionNames: formData.step3.apiPermissionNames || [],
                },
            };

            setFormData(updatedFormData);
            localStorage.setItem("editAccountFormData", JSON.stringify(updatedFormData));
            saveDraft();

            toast.success("Module access updated successfully!");
            goNext();
        } catch (error: any) {
            console.error("Failed to update module access:", error);
            setError(error.message || "Failed to update account. Please try again.");
            toast.error(error.message || "Failed to update account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async (step2Data: any) => {
        // ✅ Capture modules BEFORE any state changes
        const currentModules = formData.step1.modules || [];
        const currentModuleNames = formData.step1.moduleNames || [];

        console.log('📝 STEP 2: Current modules (BEFORE):', currentModules);
        console.log('📝 STEP 2: Selected menus count:', step2Data.permissions?.length || 0);

        if (currentModules.length === 0) {
            const errorMsg = "Please select at least one module in Step 1 first.";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!userId) {
            const errorMsg = "User ID not found. Please complete Step 1 first.";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (flattenedPermissions.length === 0 && !isLoadingPermissions) {
            const errorMsg = "No permissions available for the selected modules.";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const updatedFormData = {
                step1: {
                    modules: currentModules,
                    moduleNames: currentModuleNames,
                },
                step2: {
                    permissions: step2Data.permissions || step2Data.menuIds || [],
                    permissionNames: step2Data.permissionNames || [],
                },
                step3: {
                    apiPermissions: formData.step3.apiPermissions || [],
                    apiPermissionNames: formData.step3.apiPermissionNames || [],
                },
            };

            console.log('📝 STEP 2: Updated formData - modules:', updatedFormData.step1.modules);
            console.log('📝 STEP 2: Updated formData - menus:', updatedFormData.step2.permissions.length);

            setFormData(updatedFormData);
            localStorage.setItem("editAccountFormData", JSON.stringify(updatedFormData));
            saveDraft();

            toast.success("Menu permissions updated successfully!");
            goNext();
        } catch (error: any) {
            console.error("❌ Failed to update permissions:", error);
            const errorMessage = error.message || "Failed to update menu permissions. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleStep3Submit = async (step3Data: any) => {
        console.log('📝 STEP 3: Saving API permissions...', step3Data.accessIds?.length || 0);

        if (formData.step2.permissions.length === 0) {
            const errorMsg = "Please select at least one permission in Step 2 first.";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!userId) {
            const errorMsg = "User ID not found. Please complete previous steps first.";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (flattenedApiPermissions.length === 0 && !isLoadingApiPermissions) {
            const errorMsg = "No API permissions available for the selected menus.";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const updatedFormData = {
                step1: {
                    modules: formData.step1.modules || [],
                    moduleNames: formData.step1.moduleNames || [],
                },
                step2: {
                    permissions: formData.step2.permissions || [],
                    permissionNames: formData.step2.permissionNames || [],
                },
                step3: {
                    apiPermissions: step3Data.accessIds || [],
                    apiPermissionNames: step3Data.apiPermissionNames || [],
                },
            };

            setFormData(updatedFormData);
            localStorage.setItem("editAccountFormData", JSON.stringify(updatedFormData));
            saveDraft();

            setIsUpdateComplete(true);

            const finalData = {
                userId: userId,
                employeeId: employee?.id || "",
                employeeCode: getEmployeeCode(),
                employeeName: getEmployeeDisplayName(),
                email: getEmployeeEmail(),
                modules: formData.step1.modules,
                moduleNames: formData.step1.moduleNames,
                permissions: formData.step2.permissions,
                permissionNames: formData.step2.permissionNames,
                detailedPermissions: step3Data.accessIds || [],
                isActive: isAccountActive,
            };

            toast.success("Account updated successfully!");
            clearTemporaryData();

            onAccountUpdated({
                success: true,
                message: "Account updated successfully",
                accountId: userId,
                ...finalData,
            });
        } catch (error: any) {
            console.error("Failed to update account:", error);
            setError(error.message || "Failed to complete account update. Please try again.");
            toast.error(error.message || "Failed to complete account update. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        scrollToTop();
        if (currentStep > 1) {
            goBack();
        } else {
            clearTemporaryData();
            onBackToAccounts();
        }
    };

    // ============================================================
    // Load saved data from localStorage
    // ============================================================
    useEffect(() => {
        const savedFormData = localStorage.getItem("editAccountFormData");
        if (savedFormData) {
            try {
                const parsedData = JSON.parse(savedFormData);
                setFormData({
                    step1: { ...initialFormData.step1, ...parsedData.step1 },
                    step2: { ...initialFormData.step2, ...parsedData.step2 },
                    step3: { ...initialFormData.step3, ...parsedData.step3 },
                });
            } catch (error) {
                console.error("Error loading saved form data:", error);
            }
        }
        scrollToTop();
    }, []);

    // ============================================================
    // Debug: Log state changes at each step
    // ============================================================
    useEffect(() => {
        console.log(`📊 STEP ${currentStep} state:`, {
            modules: formData.step1.modules.length,
            moduleNames: formData.step1.moduleNames.length,
            menus: formData.step2.permissions.length,
            apiActions: formData.step3.apiPermissions.length,
        });
    }, [currentStep, formData]);

    // ============================================================
    // Render - Success Screen
    // ============================================================
    if (isUpdateComplete && userId) {
        return (
            <div className="w-full max-w-6xl mx-auto p-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Updated Successfully!</h2>
                    <p className="text-gray-500 mb-6">
                        The account has been updated with all permissions configured.
                    </p>
                    <button
                        onClick={onBackToAccounts}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        Back to Accounts
                    </button>
                </div>
            </div>
        );
    }

    // ============================================================
    // Main Render
    // ============================================================
    const currentStepInfo = STEPS.find(s => s.id === currentStep)!;
    const completionPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    return (
        <div className="w-full">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                </Button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
                    >
                        <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                        onClick={exportConfig}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
                    >
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                    <button
                        onClick={importConfig}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
                    >
                        <Upload className="w-3.5 h-3.5" /> Import
                    </button>
                </div>
            </div>

            {/* Account Status Banner */}
            <div className={`mb-4 p-4 rounded-xl border ${
                isAccountActive
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
            }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {isAccountActive ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
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
                        <Lock className={`w-4 h-4 ${
                            isAccountActive ? 'text-green-600' : 'text-red-600'
                        }`} />
                        <span className={`text-xs ${
                            isAccountActive ? 'text-green-700' : 'text-red-700'
                        }`}>
                            {isAccountActive
                                ? 'Password can be changed via Profile Settings'
                                : 'Password change disabled'
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Header with steps */}
            <div className="mb-6">
                <AddAccountStepHeader
                    steps={STEPS}
                    currentStep={currentStep}
                    onStepClick={(step) => {
                        if (step < currentStep) {
                            scrollToTop();
                            setCurrentStep(step);
                        }
                    }}
                />
            </div>

            {/* Permission Summary Bar */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-500">Permissions Summary</span>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-600">
                                <span className="font-semibold text-gray-800">{permissionSummary.modules}</span> Modules
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">
                                <span className="font-semibold text-gray-800">{permissionSummary.menus}</span> Menus
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">
                                <span className="font-semibold text-gray-800">{permissionSummary.actions}</span> Actions
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Progress</span>
                            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gray-700 rounded-full transition-all duration-500"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{Math.round(completionPercentage)}%</span>
                        </div>
                        {lastSaved && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteAccountModal
                userId={accountData?.userId as any}
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    if (onAccountDeleted) onAccountDeleted({ success: true });
                    else onBackToAccounts();
                }}
            />

            {/* Module Selection Info */}
            {currentStep === 2 && formData.step1.modules.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                        Showing permissions for{" "}
                        <span className="font-semibold">{formData.step1.modules.length}</span> selected module(s)
                    </p>
                </div>
            )}

            {/* Menu Selection Info */}
            {currentStep === 3 && formData.step2.permissions.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                        Showing API permissions for{" "}
                        <span className="font-semibold">{formData.step2.permissions.length}</span> selected menu(s)
                    </p>
                    {formData.step1.modules.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                            Based on {formData.step1.modules.length} selected module(s)
                        </p>
                    )}
                </div>
            )}

            {/* Permissions API Error */}
            {permissionsError && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-700 text-sm">{permissionsError}</p>
                </div>
            )}

            {/* API Permissions Error */}
            {apiPermissionsError && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-700 text-sm">{apiPermissionsError}</p>
                </div>
            )}

            {/* Loading state for permissions (Step 2) */}
            {currentStep === 2 && isLoadingPermissions && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
                        <span className="text-blue-700">Loading permissions for selected modules...</span>
                    </div>
                </div>
            )}

            {/* Loading state for API permissions (Step 3) */}
            {currentStep === 3 && isLoadingApiPermissions && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
                        <span className="text-blue-700">Loading API permissions for selected menus...</span>
                    </div>
                </div>
            )}

            {/* No permissions warning (Step 2) */}
            {currentStep === 2 &&
                !isLoadingPermissions &&
                flattenedPermissions.length === 0 &&
                formData.step1.modules.length > 0 && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700 text-sm">No permissions found for the selected modules.</p>
                    </div>
                )}

            {/* No API permissions warning (Step 3) */}
            {currentStep === 3 &&
                !isLoadingApiPermissions &&
                flattenedApiPermissions.length === 0 &&
                formData.step2.permissions.length > 0 && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700 text-sm">No API permissions found for the selected menus.</p>
                    </div>
                )}

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            <div>
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <EditAccountBasicInfoStep
                            key="step1"
                            initialData={formData.step1}
                            onSubmit={handleStep1Submit}
                            onBack={handleBack}
                            isLoading={loading}
                            employee={{
                                id: employee?.id || "",
                                name: getEmployeeDisplayName(),
                                employeeCode: getEmployeeCode(),
                                email: getEmployeeEmail(),
                            }}
                            onAccountDeleted={onAccountDeleted}
                            onBackToAccounts={onBackToAccounts}
                            isEditMode={true}
                            originalModules={accountData?.modules || []}
                            isAccountActive={accountData?.isActive ?? true}
                        />
                    )}

                    {currentStep === 2 && (
                        <EditMenuPermissionsStep
                            key="step2"
                            selectedModuleIds={formData.step1.modules}
                            userId={userId}
                            initialData={formData.step2}
                            onSave={handleStep2Submit}
                            onCancel={handleBack}
                            saving={loading}
                            onFormChange={() => {}}
                            originalMenuIds={accountData?.permissions || []}
                        />
                    )}

                    {currentStep === 3 && (
                        <EditAccessPermissionsStep
                            key="step3"
                            selectedMenuIds={formData.step2.permissions}
                            selectedModuleIds={
                                (formData.step1?.modules && formData.step1.modules.length > 0)
                                    ? formData.step1.modules
                                    : (accountData?.modules && accountData.modules.length > 0)
                                        ? accountData.modules
                                        : []
                            }
                            userId={userId}
                            initialData={{ accessIds: formData.step3.apiPermissions || [] }}
                            onSave={handleStep3Submit}
                            onCancel={handleBack}
                            saving={loading}
                            onFormChange={() => {}}
                            originalApiActionIds={accountData?.apiPermissions || []}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <SaveConfirmationModal
                isOpen={showSaveModal}
                onConfirm={() => { saveDraft(); setShowSaveModal(false); }}
                onCancel={() => setShowSaveModal(false)}
            />
            <RestoreDraftModal
                isOpen={showRestoreModal}
                onRestore={restoreDraft}
                onStartNew={startFresh}
                draftDate={savedDraftDate}
            />

            {/* Saving indicator */}
            {isSaving && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg">
                    Saving...
                </div>
            )}
        </div>
    );
};