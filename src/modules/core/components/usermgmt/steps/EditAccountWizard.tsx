// EditAccountWizard.tsx - CORRECTED VERSION

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check, User, Shield, Key, ChevronDown, AlertCircle,
    LayoutGrid, Save, ArrowLeft, ArrowRight, X, Trash2, Loader2,
    RefreshCw, Lock, Unlock, Eye, EyeOff, ShieldAlert, CheckCircle,
    AlertTriangle
} from "lucide-react";
import { EditAccountInfoStep } from "@/modules/core/components/usermgmt/steps/EditAccountInfoStep";
import { EditMenuPermissionsStep } from "@/modules/core/components/usermgmt/steps/EditMenuPermissionsStep";
import { EditAccessPermissionsStep } from "@/modules/core/components/usermgmt/steps/EditAccessPermissionsStep";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { DeleteAccountModal } from "@/modules/core/components/usermgmt/steps/DeleteAccountModal";
import { saveUserPermissions, reactivateAccount, resetPassword } from "@/modules/auth/services/account/account.api";
import type { EmpSearchRes } from "@/modules/core/types/EmpSearchRes";
import type { UUID } from "@/modules/hr/types/employee";
import toast from "react-hot-toast";

export interface EditWizardFormData {
    step1: {
        roleId: string;
        roleName: string;
        moduleIds: string[];
        moduleNames: string[];
        password?: string;
        confirmPassword?: string;
        isActive?: boolean;
        appUserId?: string;
        hasAccount?: boolean;
    };
    step2: { menuIds: string[] };
    step3: { accessIds: string[] };
}

const STEPS = [
    { id: 1, label: "Modules", icon: LayoutGrid, description: "Select module access" },
    { id: 2, label: "Menus", icon: Shield, description: "Configure menu permissions" },
    { id: 3, label: "API Access", icon: Key, description: "Set API permissions" },
];

interface Props {
    employee: EmpSearchRes;
    userId: string;
    accountData: {
        modules: string[];
        permissions: string[];
        apiPermissions: string[];
        roleId?: string;
        isActive?: boolean;
        appUserId?: string;
        hasAccount?: boolean;
        userId?: string;
    };
    onDone: () => void;
    onCancel: () => void;
}

export function EditAccountWizard({ employee, userId, accountData, onDone, onCancel }: Props) {
    const [step, setStep] = useState(1);
    const [savingStates, setSavingStates] = useState({ 1: false, 2: false, 3: false });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [accountStatus, setAccountStatus] = useState(accountData.isActive ?? true);
    const [passwordResetDone, setPasswordResetDone] = useState(false);

    const [formData, setFormData] = useState<EditWizardFormData>({
        step1: {
            roleId: accountData.roleId ?? "",
            roleName: "",
            moduleIds: accountData.modules ?? [],
            moduleNames: [],
        },
        step2: { menuIds: accountData.permissions ?? [] },
        step3: { accessIds: accountData.apiPermissions ?? [] },
    });

    useEffect(() => {
        setFormData({
            step1: {
                roleId: accountData.roleId ?? "",
                roleName: "",
                moduleIds: accountData.modules ?? [],
                moduleNames: [],
            },
            step2: { menuIds: accountData.permissions ?? [] },
            step3: { accessIds: accountData.apiPermissions ?? [] },
        });
        setAccountStatus(accountData.isActive ?? true);
        setShowPasswordReset(false);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordResetDone(false);
    }, [accountData]);

    const handleResetPassword = useCallback(async () => {
        const appUserId = accountData?.appUserId;

        console.log('=== PASSWORD RESET DEBUG ===');
        console.log('userId prop (Employee ID):', userId);
        console.log('appUserId from accountData:', appUserId);

        if (!appUserId || appUserId === '00000000-0000-0000-0000-000000000000') {
            toast.error("No user account found. Please create an account first.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsResettingPassword(true);
        try {
            await resetPassword(appUserId, newPassword);
            setPasswordResetDone(true);
            setShowPasswordReset(false);
            toast.success("Password reset successfully! You can now reactivate the account.");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to reset password";
            toast.error(errorMessage);
        } finally {
            setIsResettingPassword(false);
        }
    }, [accountData?.appUserId, newPassword, confirmPassword]);

    const handleReactivateAccount = useCallback(async () => {
        setIsReactivating(true);
        try {
            await reactivateAccount(userId);
            setAccountStatus(true);
            toast.success("Account reactivated successfully! User can now log in with the new password.");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to reactivate account";
            toast.error(errorMessage);
        } finally {
            setIsReactivating(false);
        }
    }, [userId]);

    const handleStep1Save = useCallback(async (data: EditWizardFormData["step1"]) => {
        setSavingStates(prev => ({ ...prev, 1: true }));
        try {
            await saveUserPermissions({
                userId: userId,
                moduleIds: data.moduleIds,
            });
            setFormData((f) => ({ ...f, step1: data }));
            setCompletedSteps(prev => new Set([...prev, 1]));
            toast.success(`Module access updated: ${data.moduleIds.length} modules selected`);
            setStep(2);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to save module access";
            toast.error(errorMessage);
        } finally {
            setSavingStates(prev => ({ ...prev, 1: false }));
            setIsSidebarOpen(false);
        }
    }, [userId]);

    const handleStep2Save = useCallback(async (data: EditWizardFormData["step2"]) => {
        setSavingStates(prev => ({ ...prev, 2: true }));
        try {
            await saveUserPermissions({
                userId: userId,
                menuIds: data.menuIds,
            });
            setFormData((f) => ({ ...f, step2: data }));
            setCompletedSteps(prev => new Set([...prev, 2]));
            toast.success(`Menu permissions updated: ${data.menuIds.length} menus selected`);
            setStep(3);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to save menu permissions";
            toast.error(errorMessage);
        } finally {
            setSavingStates(prev => ({ ...prev, 2: false }));
            setIsSidebarOpen(false);
        }
    }, [userId]);

    const handleStep3Save = useCallback(async (data: EditWizardFormData["step3"]) => {
        setSavingStates(prev => ({ ...prev, 3: true }));
        try {
            await saveUserPermissions({
                userId: userId,
                apiActionIds: data.accessIds,
            });
            setFormData((f) => ({ ...f, step3: data }));
            setCompletedSteps(prev => new Set([...prev, 3]));
            toast.success(`API permissions updated: ${data.accessIds.length} actions selected`);
            onDone();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to save API permissions";
            toast.error(errorMessage);
        } finally {
            setSavingStates(prev => ({ ...prev, 3: false }));
            setIsSidebarOpen(false);
        }
    }, [userId, onDone]);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else onCancel();
    };

    const goToStep = (targetStep: number) => {
        if (targetStep >= 1 && targetStep <= 3) {
            setStep(targetStep);
            setIsSidebarOpen(false);
        }
    };

    const progress = ((step - 1) / (STEPS.length - 1)) * 100;
    const currentStep = STEPS.find(s => s.id === step)!;
    const Icon = currentStep.icon;

    const totalModules = formData.step1.moduleIds.length;
    const totalMenus = formData.step2.menuIds.length;
    const totalApis = formData.step3.accessIds.length;

    const isStepCompleted = (stepId: number) => {
        return completedSteps.has(stepId);
    };

    const isAccountActive = accountStatus === true;

    return (
        <>
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                                {employee?.empFullName?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {employee?.empFullName}
                                </p>
                                <p className="text-xs text-gray-500">{employee?.code}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded border border-gray-200 bg-white"
                        >
                            <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isSidebarOpen ? "rotate-180" : ""}`} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row min-h-[600px]">
                    {/* Sidebar */}
                    <aside className={`
                        fixed lg:relative inset-y-0 left-0 z-40
                        w-80 lg:w-72
                        bg-white
                        border-r border-gray-200
                        transform transition-transform duration-300 ease-in-out
                        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                        lg:transform-none
                        flex flex-col
                        shadow-xl lg:shadow-none
                    `}>
                        <div className="hidden lg:block p-5 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg">
                                    {employee?.empFullName?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        {employee?.empFullName}
                                    </p>
                                    <p className="text-xs text-gray-500">{employee?.code}</p>
                                </div>
                            </div>
                        </div>

                        {/* INACTIVE ACCOUNT SECTION */}
                        {!isAccountActive && (
                            <>
                                <div className="p-4 border-b border-gray-200 bg-yellow-50">
                                    <p className="text-sm font-medium text-yellow-800">⚠️ INACTIVE ACCOUNT MODE</p>
                                </div>

                                {/* Step 1: Reset Password */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className={`p-3 rounded-lg ${passwordResetDone ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {passwordResetDone ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                                                    )}
                                                    <p className="text-sm font-medium">
                                                        {passwordResetDone ? '✅ Password Reset Complete' : '🔐 Step 1: Reset Password'}
                                                    </p>
                                                </div>
                                                <p className="text-xs mt-1 text-gray-600">
                                                    {passwordResetDone
                                                        ? 'Password has been reset. Now reactivate the account.'
                                                        : 'Set a new password for this account (required before reactivation)'
                                                    }
                                                </p>
                                            </div>
                                            {!passwordResetDone && (
                                                <Button
                                                    onClick={() => setShowPasswordReset(!showPasswordReset)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                                                >
                                                    <RefreshCw className="w-3 h-3 mr-1" />
                                                    Reset Password
                                                </Button>
                                            )}
                                            {passwordResetDone && (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            )}
                                        </div>

                                        {showPasswordReset && !passwordResetDone && (
                                            <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="mt-3 pt-3 border-t border-amber-200 space-y-2">
                                                <div>
                                                    <Label className="text-xs">New Password</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            placeholder="Enter new password"
                                                            className="pr-10"
                                                            required
                                                            minLength={6}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2"
                                                        >
                                                            {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Confirm Password</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="password"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="Confirm new password"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        type="submit"
                                                        disabled={isResettingPassword}
                                                        size="sm"
                                                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                                                    >
                                                        {isResettingPassword ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                                        Set New Password
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowPasswordReset(false);
                                                            setNewPassword("");
                                                            setConfirmPassword("");
                                                        }}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>

                                {/* Step 2: Reactivate Account */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className={`p-3 rounded-lg ${passwordResetDone ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200'}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Unlock className="w-4 h-4 text-emerald-600" />
                                                    <p className="text-sm font-medium">🚀 Step 2: Reactivate Account</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {passwordResetDone
                                                        ? 'Ready to reactivate. Click the button to restore access.'
                                                        : 'Reset password first, then you can reactivate the account.'
                                                    }
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handleReactivateAccount}
                                                disabled={isReactivating || !passwordResetDone}
                                                size="sm"
                                                className={`${passwordResetDone ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'} text-white`}
                                                title={!passwordResetDone ? "Please reset password first" : "Reactivate account"}
                                            >
                                                {isReactivating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                                                Reactivate Account
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Inactive Account Warning */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-600" />
                                            <div>
                                                <p className="text-sm font-medium text-red-800">Account Inactive</p>
                                                <p className="text-xs text-red-600">
                                                    This account is currently disabled. Follow the steps above to reactivate.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ACTIVE ACCOUNT SECTION */}
                        {isAccountActive && (
                            <>
                                <div className="p-4 border-b border-gray-200 bg-green-50">
                                    <p className="text-sm font-medium text-green-800">✅ ACTIVE ACCOUNT MODE</p>
                                </div>

                                <div className="p-4 border-b border-gray-200">
                                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-green-800">✅ Account Status</p>
                                                <p className="text-xs text-green-600">
                                                    Active - User can login
                                                </p>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-b border-gray-200">
                                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">🔐 Password Change</p>
                                                <p className="text-xs text-blue-600">
                                                    Active users can change their password via Profile Settings using their current password.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Permission Steps */}
                        <div className="flex-1 p-4 space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                                Permission Steps
                            </p>
                            {STEPS.map((s) => {
                                const isActive = step === s.id;
                                const isCompleted = isStepCompleted(s.id);
                                const StepIcon = s.icon;

                                return (
                                    <div
                                        key={s.id}
                                        className={`
                                            flex items-center gap-3 px-3 py-3 rounded cursor-pointer
                                            ${isActive
                                            ? "bg-gray-100 border-l-4 border-gray-600"
                                            : "hover:bg-gray-50"
                                        }
                                        `}
                                        onClick={() => goToStep(s.id)}
                                    >
                                        <div className={`
                                            w-8 h-8 rounded flex items-center justify-center
                                            ${isCompleted
                                            ? "bg-gray-600 text-white"
                                            : isActive
                                                ? "bg-gray-700 text-white ring-2 ring-gray-300"
                                                : "bg-gray-100 text-gray-400"
                                        }
                                        `}>
                                            {isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                                                {s.label}
                                            </p>
                                            <p className="text-xs text-gray-400">{s.description}</p>
                                        </div>
                                        {isCompleted && <Check className="w-4 h-4 text-gray-600" />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary and Delete */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="bg-white rounded p-3 border border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 mb-2">Permission Summary</p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div><p className="text-xl font-bold text-gray-700">{totalModules}</p><p className="text-xs text-gray-400">Modules</p></div>
                                    <div><p className="text-xl font-bold text-gray-700">{totalMenus}</p><p className="text-xs text-gray-400">Menus</p></div>
                                    <div><p className="text-xl font-bold text-gray-700">{totalApis}</p><p className="text-xs text-gray-400">APIs</p></div>
                                </div>
                            </div>
                            <Button onClick={() => setShowDeleteModal(true)} variant="outline" className="w-full mt-3 border-red-200 text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                            </Button>
                        </div>

                        <div className="lg:hidden p-4 border-t">
                            <Button onClick={() => setIsSidebarOpen(false)} className="w-full">Close Menu</Button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 flex flex-col">
                        <div className="p-6 border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-gray-100">
                                        <Icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{currentStep.label}</h2>
                                        <p className="text-sm text-gray-500">{currentStep.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-600">Step {step} of {STEPS.length}</p>
                                    <p className="text-xs text-gray-400">{Math.round(progress)}% Complete</p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gray-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            {step === 1 && (
                                <EditAccountInfoStep
                                    employee={employee}
                                    userId={userId}
                                    initialData={formData.step1}
                                    onSave={handleStep1Save}
                                    onCancel={handleBack}
                                    saving={savingStates[1]}
                                    isAccountActive={isAccountActive}
                                    originalModules={accountData?.modules || []}
                                />
                            )}
                            {step === 2 && (
                                <EditMenuPermissionsStep
                                    selectedModuleIds={formData.step1.moduleIds}
                                    userId={userId}
                                    initialData={formData.step2}
                                    onSave={handleStep2Save}
                                    onCancel={handleBack}
                                    saving={savingStates[2]}
                                    originalMenuIds={accountData?.permissions || []}
                                />
                            )}
                            {step === 3 && (
                                <EditAccessPermissionsStep
                                    selectedMenuIds={formData.step2.menuIds}
                                    userId={userId}
                                    initialData={formData.step3}
                                    onSave={handleStep3Save}
                                    onCancel={handleBack}
                                    saving={savingStates[3]}
                                    originalApiActionIds={accountData?.apiPermissions || []}
                                />
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <Button variant="outline" onClick={handleBack} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> {step === 1 ? "Cancel" : "Back"}
                                </Button>
                                {step < 3 ? (
                                    <Button onClick={handleNext} className="gap-2 bg-gray-800 hover:bg-gray-900 text-white">
                                        Next <ArrowRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleStep3Save(formData.step3)}
                                        disabled={savingStates[3]}
                                        className="gap-2 bg-gray-800 hover:bg-gray-900 text-white"
                                    >
                                        {savingStates[3] ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <DeleteAccountModal userId={userId as UUID} isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
        </>
    );
}