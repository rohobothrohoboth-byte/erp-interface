// AddAccountWizard.tsx - PROFESSIONAL VERSION WITH USER ID FIX

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Check, User, Shield, Key, ClipboardList, Building2,
  Save, RotateCcw, Download, Upload, AlertCircle,
  ChevronLeft, ChevronRight, HelpCircle,
  Clock, CheckCircle
} from 'lucide-react';
import { AccountInfoStep } from './steps/AccountInfoStep';
import { MenuPermissionsStep } from './steps/MenuPermissionsStep';
import { AccessPermissionsStep } from './steps/AccessPermissionsStep';
import { ReviewStep } from './steps/ReviewStep';
import type { EmpSearchRes } from '../../../../types/core/EmpSearchRes';
import { registerApi } from '../../../../services/auth/register/register.api';
import type { UUID, RegStep1 } from '../../../../types/auth/registration';
import toast from 'react-hot-toast';

export interface WizardFormData {
  step1: {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
    roleId: string;
    roleName: string;
    moduleIds: string[];
    moduleNames: string[];
    userId?: string; // ✅ Added userId
  };
  step2: { menuIds: string[]; };
  step3: { accessIds: string[]; };
}

const getDraftKey = (employeeCode: string) => `wizard-draft-${employeeCode}`;

const STEPS = [
  { id: 1, label: 'Account & Modules', icon: User, description: 'Credentials & access scope' },
  { id: 2, label: 'Menu Permissions', icon: Shield, description: 'Navigation access' },
  { id: 3, label: 'Access Permissions', icon: Key, description: 'Action privileges' },
  { id: 4, label: 'Review', icon: ClipboardList, description: 'Confirm & submit' },
];

interface Props {
  employee: EmpSearchRes;
  onDone: () => void;
  onCancel: () => void;
}

function HelpTooltip({ text }: { text: string }) {
  return (
      <div className="group relative inline-block ml-1">
        <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {text}
        </div>
      </div>
  );
}

function SaveConfirmationModal({ isOpen, onConfirm, onCancel }: any) {
  if (!isOpen) return null;
  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded p-6 max-w-md w-full mx-4 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
              <Save className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Save Progress</h3>
          </div>
          <p className="text-gray-600 mb-6">Your current progress will be saved as a draft.</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">Save Draft</button>
          </div>
        </div>
      </div>
  );
}

function RestoreDraftModal({ isOpen, onRestore, onStartNew, draftDate }: any) {
  if (!isOpen) return null;
  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded p-6 max-w-md w-full mx-4 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Restore Draft</h3>
          </div>
          <p className="text-gray-600 mb-2">You have a saved draft from {draftDate?.toLocaleString()}.</p>
          <p className="text-sm text-gray-500 mb-6">Would you like to restore it or start fresh?</p>
          <div className="flex gap-3">
            <button onClick={onStartNew} className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Start Fresh</button>
            <button onClick={onRestore} className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">Restore Draft</button>
          </div>
        </div>
      </div>
  );
}

function Button({ children, onClick, variant, className, disabled, ...props }: any) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded";
  const variants = {
    default: "bg-gray-800 text-white hover:bg-gray-900",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
  };
  const variantStyles = variants[variant as keyof typeof variants] || variants.default;
  return (
      <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variantStyles} ${className || ''}`} {...props}>
        {children}
      </button>
  );
}

export function AddAccountWizard({ employee, onDone, onCancel }: Props) {
  const [step, setStep] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [savedDraftDate, setSavedDraftDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string>(''); // ✅ Track created user ID

  const [formData, setFormData] = useState<WizardFormData>({
    step1: {
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: '',
      roleName: '',
      moduleIds: [],
      moduleNames: [],
      userId: '', // ✅ Initialize userId
    },
    step2: { menuIds: [] },
    step3: { accessIds: [] },
  });

  useEffect(() => {
    const draftKey = getDraftKey(employee.code);
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const { timestamp, formData: savedData } = JSON.parse(savedDraft);
        setSavedDraftDate(new Date(timestamp));
        setShowRestoreModal(true);
      } catch (e) { console.error(e); }
    }
  }, [employee.code]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (step > 1 || formData.step1.moduleIds.length > 0 || formData.step1.password) saveDraft();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [formData, step]);

  const goNext = () => setStep(s => Math.min(STEPS.length, s + 1));
  const goBack = () => setStep(s => Math.max(1, s - 1));

  // ✅ Updated: Handle Step 1 and capture userId
  const handleStep1 = async (data: WizardFormData['step1']) => {
    setFormData(f => ({ ...f, step1: data }));

    try {
      // ✅ Validate required fields
      if (!employee?.id) {
        toast.error('Employee ID is missing. Please select an employee first.');
        return;
      }

      if (!data.userName) {
        toast.error('Please enter a username.');
        return;
      }

      if (!data.email) {
        toast.error('Please enter an email address.');
        return;
      }

      // ✅ Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        toast.error('Please enter a valid email address.');
        return;
      }

      if (!data.roleId) {
        toast.error('Please select a role for the user.');
        return;
      }

      if (!data.moduleIds || data.moduleIds.length === 0) {
        toast.error('Please select at least one module for the user.');
        return;
      }

      if (!data.password) {
        toast.error('Please enter a password.');
        return;
      }

      if (data.password !== data.confirmPassword) {
        toast.error('Passwords do not match. Please re-enter.');
        return;
      }

      if (data.password.length < 8) {
        toast.error('Password must be at least 8 characters long.');
        return;
      }

      // ✅ Prepare request data with ALL required fields
      const regStep1Data: RegStep1 = {
        employeeId: employee.id as UUID,
        userName: data.userName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword || data.password,
        roleId: data.roleId,
        perModules: data.moduleIds as UUID[],
        // Optional fields
        firstName: employee.empFullName?.split(' ')[0] || '',
        lastName: employee.empFullName?.split(' ').slice(1).join(' ') || '',
        fullName: employee.empFullName || '',
      };

      console.log('📤 Sending registration data:', regStep1Data);

      const step1Result = await registerApi.step1(regStep1Data);

      console.log('📥 Registration result:', step1Result);

      const newUserId = step1Result?.userId || step1Result?.data?.userId || step1Result?.id;

      if (newUserId) {
        setCreatedUserId(newUserId);
        setFormData(f => ({
          ...f,
          step1: { ...f.step1, userId: newUserId }
        }));
        toast.success('✅ User account created successfully!');
        goNext();
      } else {
        throw new Error('No userId returned from account creation');
      }
    } catch (error: any) {
      console.error('❌ Failed to create user:', error);

      // ✅ Display the actual error message from the API
      const errorMessage = error.message || 'Failed to create user account. Please check all fields and try again.';
      toast.error(errorMessage);
    }
  };

  const handleStep2 = (data: WizardFormData['step2']) => {
    setFormData(f => ({ ...f, step2: data }));
    goNext();
  };

  const handleStep3 = (data: WizardFormData['step3']) => {
    setFormData(f => ({ ...f, step3: data }));
    goNext();
  };

  // ✅ Updated: Use the stored userId for API calls
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      const userId = createdUserId || formData.step1.userId;

      if (!userId) {
        throw new Error('No userId found. Please go back and create the account first.');
      }

      // Step 2: Menu permissions (if not already saved)
      if (formData.step2.menuIds.length > 0) {
        await registerApi.step2({
          userId: userId as UUID,
          perMenus: formData.step2.menuIds as UUID[]
        });
        console.log('✅ Menu permissions saved');
      }

      // Step 3: Access permissions (if not already saved)
      if (formData.step3.accessIds.length > 0) {
        await registerApi.step3({
          userId: userId as UUID,
          perAccess: formData.step3.accessIds as UUID[]
        });
        console.log('✅ Access permissions saved');
      }

      toast.success("Account created successfully with all permissions!");
      localStorage.removeItem(getDraftKey(employee.code));
      onDone();

    } catch (error: any) {
      console.error('❌ Account creation error:', error);

      const errorMessage = error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          error.response?.data?.errors?.join(', ') ||
          error.message ||
          "Failed to complete account setup";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the functions (saveDraft, restoreDraft, exportConfig, importConfig)

  // ⚠️ IMPORTANT: Keep all the existing functions here (saveDraft, restoreDraft, etc.)
  // They are unchanged from your original code

  const saveDraft = useCallback(() => {
    setIsSaving(true);
    const draft = {
      timestamp: new Date().toISOString(),
      step,
      formData,
      employeeCode: employee.code,
    };
    localStorage.setItem(getDraftKey(employee.code), JSON.stringify(draft));
    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 500);
  }, [formData, step, employee.code]);

  const restoreDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(getDraftKey(employee.code));
    if (savedDraft) {
      try {
        const { step: savedStep, formData: savedData } = JSON.parse(savedDraft);
        setFormData(savedData);
        setStep(savedStep);
        setShowRestoreModal(false);
      } catch (e) { console.error(e); }
    }
  }, [employee.code]);

  const startFresh = useCallback(() => {
    localStorage.removeItem(getDraftKey(employee.code));
    setShowRestoreModal(false);
  }, [employee.code]);

  const exportConfig = useCallback(() => {
    const exportData = {
      employee: { code: employee.code, name: employee.empFullName },
      permissions: formData,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-${employee.code}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [employee, formData]);

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
            if (imported.permissions) setFormData(imported.permissions);
            setStep(1);
          } catch (err) { console.error(err); }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const initials = (employee.empFullName ?? '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const currentStep = STEPS.find(s => s.id === step)!;
  const completionPercentage = ((step - 1) / 3) * 100;

  const permissionSummary = useMemo(() => ({
    modules: formData.step1.moduleIds.length,
    menus: formData.step2.menuIds.length,
    actions: formData.step3.accessIds.length,
  }), [formData]);

  return (
      <div className="flex h-[calc(100vh-100px)] bg-white border border-gray-200">
        {/* Sidebar - unchanged */}
        <aside className="w-72 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="px-6 pt-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{employee.empFullName}</p>
                <p className="text-sm text-gray-500">{employee.code}</p>
                {employee.dept && <p className="text-xs text-gray-400 mt-1">{employee.dept}</p>}
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 py-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Setup Progress</p>
            <div className="space-y-1">
              {STEPS.map((s) => {
                const completed = step > s.id;
                const active = step === s.id;
                const Icon = s.icon;
                return (
                    <div key={s.id} className={`relative rounded ${active ? 'bg-gray-100' : ''}`}>
                      <div className="flex items-center gap-4 px-3 py-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded ${completed ? 'bg-gray-600 text-white' : active ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {completed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${active ? 'text-gray-900' : completed ? 'text-gray-700' : 'text-gray-500'}`}>{s.label}</p>
                          <p className="text-xs text-gray-400">{s.description}</p>
                        </div>
                        {completed && <CheckCircle className="w-4 h-4 text-gray-600" />}
                      </div>
                    </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 space-y-3">
            {/* Progress - unchanged */}
            <div className="bg-white rounded p-3 border border-gray-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-700">{Math.round(completionPercentage)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-600 rounded-full" style={{ width: `${completionPercentage}%` }} />
              </div>
            </div>

            <div className="bg-white rounded p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Permissions</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-semibold text-gray-800">{permissionSummary.modules}</p><p className="text-xs text-gray-400">Modules</p></div>
                <div><p className="text-lg font-semibold text-gray-800">{permissionSummary.menus}</p><p className="text-xs text-gray-400">Menus</p></div>
                <div><p className="text-lg font-semibold text-gray-800">{permissionSummary.actions}</p><p className="text-xs text-gray-400">Actions</p></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowSaveModal(true)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-gray-300 bg-white hover:bg-gray-50">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={exportConfig} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-gray-300 bg-white hover:bg-gray-50">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button onClick={importConfig} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-gray-300 bg-white hover:bg-gray-50">
                <Upload className="w-3.5 h-3.5" /> Import
              </button>
            </div>

            {lastSaved && (
                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString()}
                </p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                    {currentStep.icon && <currentStep.icon className="w-4 h-4 text-gray-600" />}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">{currentStep.label}</h1>
                  {isSaving && <div className="flex items-center gap-1 text-xs text-gray-500">Saving...</div>}
                </div>
                <p className="text-sm text-gray-500 ml-11">{currentStep.description}</p>
              </div>
              {step > 1 && step < 4 && (
                  <div className="flex gap-2">
                    <button onClick={goBack} className="p-2 rounded hover:bg-gray-100"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={goNext} className="p-2 rounded hover:bg-gray-100"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
                  </div>
              )}
            </div>

            <div className="bg-white rounded border border-gray-200 p-6">
              {step === 1 && (
                  <AccountInfoStep
                      employee={employee}
                      initialData={formData.step1}
                      onSubmit={handleStep1}
                      onCancel={onCancel}
                  />
              )}
              {step === 2 && (
                  <MenuPermissionsStep
                      selectedModuleIds={formData.step1.moduleIds}
                      initialData={formData.step2}
                      onSubmit={handleStep2}
                      onBack={goBack}
                  />
              )}
              {step === 3 && (
                  <AccessPermissionsStep
                      selectedMenuIds={formData.step2.menuIds}
                      initialData={formData.step3}
                      onSubmit={handleStep3}
                      onBack={goBack}
                      userId={createdUserId || formData.step1.userId || ''} // ✅ Pass the real userId
                  />
              )}
              {step === 4 && (
                  <ReviewStep
                      employee={employee}
                      formData={formData}
                      onFinish={handleFinalSubmit}
                      onBack={goBack}
                      isSubmitting={isSubmitting}
                  />
              )}
            </div>
          </div>
        </main>

        <SaveConfirmationModal isOpen={showSaveModal} onConfirm={() => { saveDraft(); setShowSaveModal(false); }} onCancel={() => setShowSaveModal(false)} />
        <RestoreDraftModal isOpen={showRestoreModal} onRestore={restoreDraft} onStartNew={startFresh} draftDate={savedDraftDate} />
      </div>
  );
}