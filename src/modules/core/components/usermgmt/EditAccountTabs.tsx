// src/components/core/usermgmt/EditAccountTabs.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Shield, Key, ArrowLeft, CheckCircle, AlertCircle, Lock,
    Save, RotateCcw, Download, Upload,
    Clock, LayoutDashboard, ListChecks, KeyRound,
    RefreshCw, AlertTriangle, Loader2, X
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { DeleteAccountModal } from "@/modules/core/components/usermgmt/steps/DeleteAccountModal";
import { EditAccountBasicInfoStep } from "@/modules/core/components/usermgmt/steps/EditAccountBasicInfoStep";
import { EditMenuPermissionsStep } from "@/modules/core/components/usermgmt/steps/EditMenuPermissionsStep";
import { EditAccessPermissionsStep } from "@/modules/core/components/usermgmt/steps/EditAccessPermissionsStep";
import type { EmpSearchRes } from "@/modules/core/types/EmpSearchRes";
import type { UUID } from "@/modules/auth/types/registration";
import type {
    ModPerMenuListDto,
    NameList,
} from "@/modules/auth/types/ModPerMenu";
import type { MenuPerApiListDto } from "@/modules/auth/types/MenuPerApi";
import { perMenuApi } from "@/modules/auth/services/perMenu/perMenu.api";
import { menuPerApiApi } from "@/modules/auth/services/menuPerApi/menuPerApi.api";
import { saveUserPermissions } from "@/modules/auth/services/account/account.api";
import toast from "react-hot-toast";

// ============================================================
// Tabs Components (Custom implementation)
// ============================================================
const Tabs = ({ value, onValueChange, children }: any) => {
    const [activeTab, setActiveTab] = useState(value);

    useEffect(() => {
        if (value !== activeTab) {
            setActiveTab(value);
        }
    }, [value]);

    const handleTabChange = (tabValue: string) => {
        setActiveTab(tabValue);
        if (onValueChange) {
            onValueChange(tabValue);
        }
    };

    const childrenArray = React.Children.toArray(children);
    const tabsList = childrenArray.find((child: any) => child.type === TabsList);
    const tabsContents = childrenArray.filter((child: any) => child.type === TabsContent);

    return (
        <div>
            {tabsList && React.cloneElement(tabsList as React.ReactElement, {
                activeTab,
                onTabChange: handleTabChange
            })}
            {tabsContents.map((content: any) =>
                React.cloneElement(content as React.ReactElement, {
                    activeTab
                })
            )}
        </div>
    );
};

const TabsList = ({ children, activeTab, onTabChange, className = "" }: any) => {
    return (
        <div className={`flex space-x-1 rounded-xl bg-gray-100 p-1 ${className}`}>
            {React.Children.map(children, (child: any) => {
                if (child.type === TabsTrigger) {
                    return React.cloneElement(child, {
                        activeTab,
                        onTabChange
                    });
                }
                return child;
            })}
        </div>
    );
};

const TabsTrigger = ({ value, children, activeTab, onTabChange, className = "" }: any) => {
    const isActive = activeTab === value;
    return (
        <button
            onClick={() => onTabChange(value)}
            className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all
                ${isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }
                ${className}
            `}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ value, children, activeTab, className = "" }: any) => {
    if (activeTab !== value) return null;
    return <div className={`mt-4 ${className}`}>{children}</div>;
};

// ============================================================
// Props Interface
// ============================================================
interface EditAccountTabsProps {
    onBackToAccounts: () => void;
    onAccountUpdated: (result: any) => void;
    onAccountDeleted?: (result: any) => void;
    employee?: EmpSearchRes;
    accountData?: {
        userId: string;           // ✅ MUST be AppUser ID
        appUserId?: string;        // ✅ Explicit AppUser ID (fallback)
        modules: string[];
        moduleNames?: string[];
        permissions: string[];
        permissionNames?: string[];
        apiPermissions: string[];
        apiPermissionNames?: string[];
        isActive?: boolean;
        roleId?: string;
        hasAccount?: boolean;
    };
}

// ============================================================
// Main Component
// ============================================================
export const EditAccountTabs: React.FC<EditAccountTabsProps> = ({
                                                                    onBackToAccounts,
                                                                    onAccountUpdated,
                                                                    onAccountDeleted,
                                                                    employee,
                                                                    accountData,
                                                                }) => {
    // ============================================================
    // ✅ FIX: Ensure we're using AppUser ID, not Employee ID
    // ============================================================
    const [userId] = useState<string>(() => {
        // Get the ID from accountData
        let id = accountData?.userId || "";

        // ✅ Check if this is an Employee ID (starts with 019f)
        const isEmployeeId = id.startsWith('019f') && id.length === 36;

        if (isEmployeeId) {
            console.warn('⚠️ WARNING: userId appears to be an Employee ID, not AppUser ID');
            console.warn('   Employee ID:', id);
            console.warn('   Expected: AppUser ID (different format)');

            // ✅ If we have accountData.appUserId, use that instead
            if (accountData?.appUserId) {
                console.warn('   ✅ Using appUserId instead:', accountData.appUserId);
                return accountData.appUserId;
            }

            // ✅ If employee has appUserId, use that
            if (employee?.appUserId) {
                console.warn('   ✅ Using employee.appUserId instead:', employee.appUserId);
                return employee.appUserId;
            }

            // ⚠️ Fallback: try to get from localStorage or context
            console.error('❌ No valid AppUser ID found!');
            console.error('   Please ensure accountData.userId is the AppUser ID');
        }

        return id;
    });

    // ✅ Track employee ID separately for reference
    const employeeId = employee?.id || "";

    // ✅ Debug logging
    useEffect(() => {
        console.log('📊 EditAccountTabs Debug:');
        console.log('  ✅ Using AppUser ID:', userId);
        console.log('  📋 Employee ID (reference only):', employeeId);
        console.log('  📋 accountData?.userId:', accountData?.userId);
        console.log('  📋 accountData?.appUserId:', accountData?.appUserId);
        console.log('  📋 employee?.appUserId:', employee?.appUserId);

        // ✅ Validate that userId is not an Employee ID
        if (userId?.startsWith('019f')) {
            console.error('❌ CRITICAL: Still using Employee ID as userId!');
            console.error('   This will cause all permission operations to fail.');
        }
    }, [userId, employeeId, accountData, employee]);

    // ============================================================
    // State
    // ============================================================
    const [activeTab, setActiveTab] = useState("modules");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpdateComplete, setIsUpdateComplete] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isAccountActive] = useState<boolean>(accountData?.isActive !== false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // ============================================================
    // Form State - Shared across all tabs
    // ============================================================
    const [formData, setFormData] = useState({
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
    });

    // ============================================================
    // Real data state for permissions
    // ============================================================
    const [permissionsData, setPermissionsData] = useState<ModPerMenuListDto[]>([]);
    const [flattenedPermissions, setFlattenedPermissions] = useState<
        Array<NameList & { moduleId: UUID; moduleName: string }>
    >([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const [permissionsError, setPermissionsError] = useState<string | null>(null);

    const [apiPermissionsData, setApiPermissionsData] = useState<MenuPerApiListDto[]>([]);
    const [flattenedApiPermissions, setFlattenedApiPermissions] = useState<
        Array<NameList & { menuId: UUID; menuName: string }>
    >([]);
    const [isLoadingApiPermissions, setIsLoadingApiPermissions] = useState(false);
    const [apiPermissionsError, setApiPermissionsError] = useState<string | null>(null);

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

    // ✅ Clear menu cache to force refresh
    const clearMenuCache = useCallback(() => {
        const cacheKeys = [
            'menu-structure',
            'user-menus',
            'user-menu-guid',
            'user-menu-guids',
            'auth-menu-structure',
            'user-modules',
            'accessible-modules'
        ];
        cacheKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        console.log('🧹 Menu cache cleared');
    }, []);

    // ============================================================
    // Draft Management
    // ============================================================
    const getDraftKey = useCallback(() => `edit-account-draft-${userId}`, [userId]);

    const saveDraft = useCallback(() => {
        if (!userId) return;
        setIsSavingDraft(true);
        try {
            const draft = {
                timestamp: new Date().toISOString(),
                formData,
                userId,
                employeeId: employee?.id,
            };
            localStorage.setItem(getDraftKey(), JSON.stringify(draft));
            setLastSaved(new Date());
        } catch (error) {
            console.error("Failed to save draft:", error);
        } finally {
            setIsSavingDraft(false);
        }
    }, [formData, userId, employee?.id, getDraftKey]);

    // Auto-save every 30 seconds
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (formData.step1.modules.length > 0 && userId) {
                saveDraft();
            }
        }, 30000);
        return () => clearInterval(autoSaveInterval);
    }, [formData, userId, saveDraft]);

    // ============================================================
    // Fetch permissions - ✅ Uses AppUser ID
    // ============================================================
    useEffect(() => {
        const fetchPermissionsData = async () => {
            if (formData.step1.modules.length > 0 && userId) {
                setIsLoadingPermissions(true);
                setPermissionsError(null);
                try {
                    const selectedModuleIds = formData.step1.modules.map((id) => id as UUID);
                    const userIdTyped = userId as UUID;

                    // ✅ Using AppUser ID (userId)
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
                } catch (error: any) {
                    console.error("Error fetching permissions:", error);
                    setPermissionsError(error.message || "Failed to load permissions");
                    setPermissionsData([]);
                    setFlattenedPermissions([]);
                } finally {
                    setIsLoadingPermissions(false);
                }
            }
        };
        fetchPermissionsData();
    }, [formData.step1.modules, userId]);

    useEffect(() => {
        const fetchApiPermissionsData = async () => {
            if (userId && formData.step2.permissions.length > 0) {
                setIsLoadingApiPermissions(true);
                setApiPermissionsError(null);
                try {
                    const selectedMenuIds = formData.step2.permissions.map((id) => id as UUID);
                    const userIdTyped = userId as UUID;

                    // ✅ Using AppUser ID (userId)
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
                } catch (error: any) {
                    console.error("Error fetching API permissions:", error);
                    setApiPermissionsError(error.message || "Failed to load API permissions");
                    setApiPermissionsData([]);
                    setFlattenedApiPermissions([]);
                } finally {
                    setIsLoadingApiPermissions(false);
                }
            }
        };
        fetchApiPermissionsData();
    }, [userId, formData.step2.permissions]);

    // ============================================================
    // Transform functions for step components
    // ============================================================
    const getPermissionsForStep2 = useCallback(() => {
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
    }, [flattenedPermissions, permissionsData]);

    const getFilteredDetailedPermissions = useCallback(() => {
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
    }, [formData.step2.permissions, flattenedApiPermissions]);

    const getMainPermissionsList = useCallback(() => {
        if (apiPermissionsData.length > 0) {
            return apiPermissionsData.map((menuGroup) => ({
                id: menuGroup.perMenuId,
                name: menuGroup.perMenu,
                description: `Menu: ${menuGroup.perMenu}`,
            }));
        }
        return [];
    }, [apiPermissionsData]);

    // ============================================================
    // Step Handlers - REPLACE (not merge) permissions
    // ✅ All use AppUser ID (userId)
    // ============================================================
    const handleStep1Change = (step1Data: any) => {
        setHasChanges(true);
        setFormData(prev => ({
            ...prev,
            step1: {
                modules: step1Data.modules || [],
                moduleNames: step1Data.moduleNames || [],
            }
        }));
        saveDraft();
    };

    const handleStep2Change = (step2Data: any) => {
        setHasChanges(true);
        setFormData(prev => ({
            ...prev,
            step2: {
                permissions: step2Data.permissions || step2Data.menuIds || [],
                permissionNames: step2Data.permissionNames || [],
            }
        }));
        saveDraft();
    };

    const handleStep3Change = (step3Data: any) => {
        setHasChanges(true);
        setFormData(prev => ({
            ...prev,
            step3: {
                apiPermissions: step3Data.accessIds || [],
                apiPermissionNames: step3Data.apiPermissionNames || [],
            }
        }));
        saveDraft();
    };

    // ✅ MODULE PERMISSIONS - REPLACES all existing modules
    // ✅ Uses AppUser ID (userId)
    const handleStep1Submit = async (step1Data: any) => {
        console.log('=== 📤 SAVING MODULE PERMISSIONS ===');
        console.log('Selected modules:', step1Data.modules);
        console.log('Count:', step1Data.modules.length);
        console.log('✅ Using AppUser ID:', userId);

        setLoading(true);
        setError(null);
        try {
            if (!userId) {
                throw new Error("User ID (AppUser) not found");
            }

            // ✅ REPLACE all modules with the new selection
            // ✅ Using AppUser ID (userId)
            const response = await saveUserPermissions({
                userId: userId, // ← AppUser ID
                moduleIds: step1Data.modules || [],
            });

            console.log('✅ Modules saved:', response);

            setFormData(prev => ({
                ...prev,
                step1: {
                    modules: step1Data.modules || [],
                    moduleNames: step1Data.moduleNames || [],
                }
            }));

            // ✅ Clear cache to refresh menu structure
            clearMenuCache();

            toast.success(`Module access updated: ${step1Data.modules.length} modules selected`);
            setActiveTab("menus");
        } catch (error: any) {
            console.error("Failed to update module access:", error);
            const errorMessage = error.message || "Failed to update account. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ✅ MENU PERMISSIONS - REPLACES all existing menus
    // ✅ Uses AppUser ID (userId)
    const handleStep2Submit = async (step2Data: any) => {
        console.log('=== 📤 SAVING MENU PERMISSIONS ===');
        console.log('Selected menus:', step2Data.permissions?.length || 0);
        console.log('✅ Using AppUser ID:', userId);

        if (formData.step1.modules.length === 0) {
            const errorMsg = "Please select at least one module first.";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // ✅ REPLACE all menus with the new selection
            // ✅ Using AppUser ID (userId)
            const response = await saveUserPermissions({
                userId: userId, // ← AppUser ID
                menuIds: step2Data.permissions || step2Data.menuIds || [],
            });

            console.log('✅ Menus saved:', response);

            setFormData(prev => ({
                ...prev,
                step2: {
                    permissions: step2Data.permissions || step2Data.menuIds || [],
                    permissionNames: step2Data.permissionNames || [],
                }
            }));

            // ✅ Clear cache to refresh menu structure
            clearMenuCache();

            toast.success(`Menu permissions updated: ${step2Data.permissions?.length || 0} menus selected`);
            setActiveTab("apis");
        } catch (error: any) {
            console.error("Failed to update permissions:", error);
            const errorMessage = error.message || "Failed to update menu permissions. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ✅ API PERMISSIONS - REPLACES all existing API actions
    // ✅ Uses AppUser ID (userId)
    const handleStep3Submit = async (step3Data: any) => {
        console.log('=== 📤 SAVING API PERMISSIONS ===');
        console.log('Selected APIs:', step3Data.accessIds?.length || 0);
        console.log('✅ Using AppUser ID:', userId);

        if (formData.step2.permissions.length === 0) {
            const errorMsg = "Please select at least one menu permission first.";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // ✅ REPLACE all API actions with the new selection
            // ✅ Using AppUser ID (userId)
            const response = await saveUserPermissions({
                userId: userId, // ← AppUser ID
                apiActionIds: step3Data.accessIds || [],
            });

            console.log('✅ APIs saved:', response);

            setFormData(prev => ({
                ...prev,
                step3: {
                    apiPermissions: step3Data.accessIds || [],
                    apiPermissionNames: step3Data.apiPermissionNames || [],
                }
            }));

            setIsUpdateComplete(true);
            setHasChanges(false);

            const finalData = {
                userId: userId, // ← AppUser ID
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

            // ✅ Clear cache to refresh menu structure
            clearMenuCache();

            // Clear draft
            localStorage.removeItem(getDraftKey());

            onAccountUpdated({
                success: true,
                message: "Account updated successfully",
                accountId: userId,
                ...finalData,
            });
        } catch (error: any) {
            console.error("Failed to update account:", error);
            const errorMessage = error.message || "Failed to complete account update. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (activeTab === "modules") {
            onBackToAccounts();
        } else if (activeTab === "menus") {
            setActiveTab("modules");
        } else if (activeTab === "apis") {
            setActiveTab("menus");
        }
    };

    // ============================================================
    // Clear cache when component unmounts if changes were made
    // ============================================================
    useEffect(() => {
        return () => {
            if (hasChanges) {
                clearMenuCache();
            }
        };
    }, [hasChanges, clearMenuCache]);

    // ============================================================
    // Render - Success Screen
    // ============================================================
    if (isUpdateComplete && userId) {
        return (
            <div className="w-full max-w-6xl mx-auto p-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Updated Successfully!</h2>
                    <p className="text-gray-500 mb-6">
                        The account has been updated with all permissions configured.
                    </p>
                    <Button
                        onClick={() => {
                            clearMenuCache();
                            onBackToAccounts();
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Back to Accounts
                    </Button>
                </div>
            </div>
        );
    }

    // ============================================================
    // Main Render
    // ============================================================
    const getTabBadge = (tab: string) => {
        if (tab === "modules") return formData.step1.modules.length;
        if (tab === "menus") return formData.step2.permissions.length;
        if (tab === "apis") return formData.step3.apiPermissions.length;
        return 0;
    };

    const progressPercentage = Math.min(100,
        ((formData.step1.modules.length > 0 ? 33 : 0) +
            (formData.step2.permissions.length > 0 ? 33 : 0) +
            (formData.step3.apiPermissions.length > 0 ? 34 : 0))
    );

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2 px-3 py-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                </Button>

                <div className="flex items-center gap-2">
                    {lastSaved && (
                        <span className="text-xs text-gray-400 flex items-center gap-1 mr-2">
                            <Clock className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString()}
                        </span>
                    )}
                    <Button
                        onClick={saveDraft}
                        variant="outline"
                        size="sm"
                        disabled={isSavingDraft || !userId}
                        className="gap-1.5"
                    >
                        {isSavingDraft ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Save className="w-3.5 h-3.5" />
                        )}
                        Save Draft
                    </Button>
                    <Button
                        onClick={() => {
                            clearMenuCache();
                            window.location.reload();
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </Button>
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

            {/* Delete Button */}
            <div className="flex justify-end mb-4">
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="gap-1.5"
                >
                    <AlertTriangle className="w-4 h-4" /> Delete Account
                </Button>
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
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                                {progressPercentage}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="modules" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Module Access</span>
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {getTabBadge("modules")}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="menus" className="flex items-center gap-2">
                        <ListChecks className="w-4 h-4" />
                        <span>Menu Permissions</span>
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {getTabBadge("menus")}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="apis" className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4" />
                        <span>API Permissions</span>
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {getTabBadge("apis")}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Module Access - REPLACES all modules */}
                <TabsContent value="modules" className="mt-0">
                    <EditAccountBasicInfoStep
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
                        onFormChange={handleStep1Change}
                    />
                </TabsContent>

                {/* Tab 2: Menu Permissions - REPLACES all menus */}
                <TabsContent value="menus" className="mt-0">
                    {formData.step1.modules.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded border border-gray-200">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">Please select modules first in the Module Access tab.</p>
                            <Button onClick={() => setActiveTab("modules")} variant="outline" className="mt-4">
                                Go to Module Access
                            </Button>
                        </div>
                    ) : (
                        <EditMenuPermissionsStep
                            selectedModuleIds={formData.step1.modules}
                            userId={userId} // ✅ AppUser ID
                            // ✅ Only pass saved permissions, NOT all menus
                            initialData={{
                                menuIds: formData.step2.permissions || [],
                                permissionNames: formData.step2.permissionNames || []
                            }}
                            onSave={handleStep2Submit}
                            onCancel={handleBack}
                            saving={loading}
                            onFormChange={(data: any) => {
                                if (data?.menuIds) {
                                    handleStep2Change({ permissions: data.menuIds, permissionNames: data.permissionNames });
                                }
                            }}
                            originalMenuIds={accountData?.permissions || []}
                        />
                    )}
                </TabsContent>

                {/* Tab 3: API Permissions - REPLACES all API actions */}
                <TabsContent value="apis" className="mt-0">
                    {formData.step2.permissions.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded border border-gray-200">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">Please select menu permissions first in the Menu Permissions tab.</p>
                            <Button onClick={() => setActiveTab("menus")} variant="outline" className="mt-4">
                                Go to Menu Permissions
                            </Button>
                        </div>
                    ) : (
                        <EditAccessPermissionsStep
                            selectedMenuIds={formData.step2.permissions}
                            selectedModuleIds={formData.step1.modules}
                            userId={userId} // ✅ AppUser ID
                            // ✅ Only pass saved API permissions, NOT all APIs
                            initialData={{
                                accessIds: formData.step3.apiPermissions || []
                            }}
                            onSave={handleStep3Submit}
                            onCancel={handleBack}
                            saving={loading}
                            onFormChange={(data: any) => {
                                if (data?.accessIds) {
                                    handleStep3Change({ accessIds: data.accessIds });
                                }
                            }}
                            originalApiActionIds={accountData?.apiPermissions || []}
                        />
                    )}
                </TabsContent>
            </Tabs>

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
        </div>
    );
};