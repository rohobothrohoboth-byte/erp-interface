// RST_ERP_UI/src/components/core/usermgmt/AddAccountStepForm.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Check, User, Shield, Key, ClipboardList, Building2,
  Save, RotateCcw, Download, Upload,
  ChevronLeft, ChevronRight, HelpCircle,
  Clock, CheckCircle, Lock, Eye, EyeOff, Sparkles, Copy, Zap, Star
} from 'lucide-react';



import { MenuPermissionsStep } from './v2/steps/MenuPermissionsStep';
import { AccessPermissionsStep } from './steps/AccessPermissionsStep';


import { AccountReviewStep } from './steps/AccountReviewStep';
import type { EmpSearchRes } from '../../../types/core/EmpSearchRes';
import type { RegStep1, RegStep2, UUID } from '../../../types/auth/registration';
import type { ModPerMenuListDto, NameList } from '../../../types/auth/ModPerMenu';
import type { MenuPerApiListDto } from '../../../types/auth/MenuPerApi';
import { registerApi } from '../../../services/auth/register/register.api';
import { perMenuApi } from '../../../services/auth/perMenu/perMenu.api';
import { menuPerApiApi } from '../../../services/auth/menuPerApi/menuPerApi.api';
import toast from 'react-hot-toast';
import { accountApi } from '../../../services/auth/account/account.api';
import { authListApi } from '../../../services/List/auth/authList.api';
import type { RoleListItem, NameListItem } from '../../../types/NameList/nameList';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import * as Yup from 'yup';
import { Formik, Form, ErrorMessage } from 'formik';

const STEPS = [
  { id: 1, label: 'Account & Modules', icon: User, description: 'Credentials & access scope' },
  { id: 2, label: 'Menu Permissions', icon: Shield, description: 'Navigation access' },
  { id: 3, label: 'API Permissions', icon: Key, description: 'Action privileges' },
  { id: 4, label: 'Review', icon: ClipboardList, description: 'Confirm & submit' },
];

interface AddAccountStepFormProps {
  onBackToAccounts: () => void;
  onAccountAdded: (result: any) => void;
  employee?: EmpSearchRes;
}

// Password requirements
const PASSWORD_REQUIREMENTS = [
  { text: 'At least 8 characters', check: (pw: string) => pw.length >= 8 },
  { text: 'Contains uppercase letter', check: (pw: string) => /[A-Z]/.test(pw) },
  { text: 'Contains lowercase letter', check: (pw: string) => /[a-z]/.test(pw) },
  { text: 'Contains number', check: (pw: string) => /[0-9]/.test(pw) },
  { text: 'Contains special character', check: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

// Module recommendations
const MODULE_RECOMMENDATIONS: Record<string, string[]> = {
  'Admin': ['Core', 'HR Management', 'Finance', 'CRM', 'Inventory', 'File Management'],
  'HR Manager': ['HR Management', 'Core', 'File Management'],
  'Finance Manager': ['Finance', 'Core'],
  'Team Lead': ['HR Management', 'CRM', 'Core'],
  'Employee': ['HR Management', 'File Management'],
};

const getValidationSchema = () => Yup.object({
  password: Yup.string().required('Password is required').min(8, 'Must be at least 8 characters'),
  confirmPassword: Yup.string().required('Confirm password is required').oneOf([Yup.ref('password')], 'Passwords must match'),
  role: Yup.string().required('Role is required'),
  modules: Yup.array().of(Yup.string()).min(1, 'Please select at least one module'),
});

// Step 1 Component with password strength and generator
function AccountInfoStep({ employee, initialData, onSubmit, onBack, isLoading }: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roleOptions, setRoleOptions] = useState<RoleListItem[]>([]);
  const [moduleOptions, setModuleOptions] = useState<NameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    Promise.all([
      authListApi.getAllRoles(),
      authListApi.getAllModuleNames()
    ]).then(([roles, modules]) => {
      setRoleOptions(roles);
      setModuleOptions(modules);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
    return password;
  };

  const getPasswordStrength = (pw: string) => {
    if (!pw) return 0;
    return PASSWORD_REQUIREMENTS.filter(r => r.check(pw)).length;
  };

  const strengthText = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

  const initialValues = {
    password: initialData.password || '',
    confirmPassword: initialData.confirmPassword || '',
    role: initialData.role || '',
    modules: initialData.modules || [],
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;

  return (
      <Formik initialValues={initialValues} validationSchema={getValidationSchema()} onSubmit={onSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => {
          const strength = getPasswordStrength(values.password);
          const roleName = roleOptions.find(r => r.id === values.role)?.role || '';
          const recommendations = MODULE_RECOMMENDATIONS[roleName] || [];

          return (
              <Form className="space-y-6">
                {/* Password Section */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-base font-medium mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Security</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Password *</Label>
                      <div className="relative mt-1">
                        <input name="password" type={showPassword ? 'text' : 'password'} value={values.password} onChange={handleChange} onBlur={handleBlur}
                               className={`w-full px-3 py-2 border rounded-lg pr-20 ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'}`}
                               placeholder="Enter password" />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <button type="button" onClick={() => setFieldValue('password', generatePassword())} className="p-1 text-gray-500 hover:text-gray-700" title="Generate password">
                            <Zap className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-gray-500 hover:text-gray-700">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {values.password && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full ${strengthColor[strength]} transition-all`} style={{ width: `${(strength / 5) * 100}%` }} />
                              </div>
                              <span className="text-xs text-gray-500">{strengthText[strength]}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {PASSWORD_REQUIREMENTS.map((req, i) => (
                                  <span key={i} className={`text-xs ${req.check(values.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            {req.check(values.password) ? '✓' : '○'} {req.text}
                          </span>
                              ))}
                            </div>
                          </div>
                      )}
                      <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Confirm Password *</Label>
                      <div className="relative mt-1">
                        <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                               className={`w-full px-3 py-2 border rounded-lg pr-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                               placeholder="Confirm password" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>
                </div>

                {/* Role Section */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-base font-medium mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Role & Access</h3>
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Role *</Label>
                    <Select value={values.role} onValueChange={(v) => setFieldValue('role', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select a role" /></SelectTrigger>
                      <SelectContent>
                        {roleOptions.map(r => <SelectItem key={r.id} value={r.id}>{r.role}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <ErrorMessage name="role" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  {recommendations.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium flex items-center gap-1"><Star className="w-4 h-4" /> Recommended for {roleName}</span>
                          <button type="button" onClick={() => {
                            const recommendedIds = moduleOptions.filter(m => recommendations.includes(m.name)).map(m => m.id);
                            setFieldValue('modules', [...new Set([...values.modules, ...recommendedIds])]);
                          }} className="text-xs text-blue-600 hover:text-blue-700">Apply All</button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {recommendations.map(name => <span key={name} className="text-xs px-2 py-0.5 bg-white rounded text-blue-600">{name}</span>)}
                        </div>
                      </div>
                  )}

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-sm font-medium">Modules *</Label>
                      <button type="button" onClick={() => setShowRecommendations(!showRecommendations)} className="text-xs text-blue-600">Show Recommendations</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {moduleOptions.map(m => (
                          <label key={m.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer">
                            <Checkbox checked={values.modules.includes(m.id)} onCheckedChange={(c) => {
                              if (c) setFieldValue('modules', [...values.modules, m.id]);
                              else setFieldValue('modules', values.modules.filter((id: string) => id !== m.id));
                            }} />
                            <span className="text-sm">{m.name}</span>
                          </label>
                      ))}
                    </div>
                    <ErrorMessage name="modules" component="div" className="text-red-500 text-xs mt-1" />
                    {values.modules.length > 0 && (
                        <div className="mt-3 p-2 bg-gray-100 rounded-lg">
                          <p className="text-xs text-gray-500">{values.modules.length} module(s) selected</p>
                        </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? 'Creating...' : 'Continue'}
                  </Button>
                </div>
              </Form>
          );
        }}
      </Formik>
  );
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

export const AddAccountStepForm: React.FC<AddAccountStepFormProps> = ({ onBackToAccounts, onAccountAdded, employee }) => {
  const [step, setStep] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [savedDraftDate, setSavedDraftDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    step1: { password: '', confirmPassword: '', role: '', roleName: '', modules: [] as string[], moduleNames: [] as string[] },
    step2: { permissions: [] as string[], permissionNames: [] as string[] },
    step3: { apiPermissions: [] as string[], apiPermissionNames: [] as string[] },
  });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  const [permissionsData, setPermissionsData] = useState<ModPerMenuListDto[]>([]);
  const [flattenedPermissions, setFlattenedPermissions] = useState<Array<NameList & { moduleId: UUID; moduleName: string }>>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [apiPermissionsData, setApiPermissionsData] = useState<MenuPerApiListDto[]>([]);
  const [flattenedApiPermissions, setFlattenedApiPermissions] = useState<Array<NameList & { menuId: UUID; menuName: string }>>([]);
  const [isLoadingApiPermissions, setIsLoadingApiPermissions] = useState(false);

  const getEmployeeDisplayName = useCallback(() => employee?.empFullName || '', [employee]);
  const getEmployeeCode = useCallback(() => employee?.code || '', [employee]);

  const getDraftKey = useCallback(() => `account-draft-${employee?.code}`, [employee?.code]);

  useEffect(() => {
    if (!employee?.code) return;
    const savedDraft = localStorage.getItem(getDraftKey());
    if (savedDraft) {
      try {
        const { timestamp, step: savedStep, formData: savedData, userId: savedUserId } = JSON.parse(savedDraft);
        setSavedDraftDate(new Date(timestamp));
        setShowRestoreModal(true);
      } catch (e) { console.error(e); }
    }
  }, [employee?.code, getDraftKey]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (step > 1 || formData.step1.modules.length > 0 || formData.step1.password) saveDraft();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [formData, step]);

  useEffect(() => {
    if (step === 2 && formData.step1.modules.length > 0 && userId) {
      setIsLoadingPermissions(true);
      const selectedModuleIds = formData.step1.modules.map(id => id as UUID);
      perMenuApi.getFilteredPermissionsForUser(userId as UUID, selectedModuleIds).then(setPermissionsData).catch(console.error).finally(() => setIsLoadingPermissions(false));
      perMenuApi.getFlattenedPermissionsForUser(userId as UUID, selectedModuleIds).then(setFlattenedPermissions).catch(console.error);
    }
  }, [step, formData.step1.modules, userId]);

  useEffect(() => {
    if (step === 3 && userId && formData.step2.permissions.length > 0) {
      setIsLoadingApiPermissions(true);
      const selectedMenuIds = formData.step2.permissions.map(id => id as UUID);
      menuPerApiApi.getFilteredPerApisForUser(userId as UUID, selectedMenuIds).then(setApiPermissionsData).catch(console.error).finally(() => setIsLoadingApiPermissions(false));
      menuPerApiApi.getFlattenedPerApisForUser(userId as UUID, selectedMenuIds).then(setFlattenedApiPermissions).catch(console.error);
    }
  }, [step, userId, formData.step2.permissions]);

  const getPermissionsForStep2 = () => flattenedPermissions.map(p => ({ id: p.id, name: p.name, module: p.moduleName, description: `Permission for ${p.moduleName}` }));

  const getFilteredDetailedPermissions = () => flattenedApiPermissions.map(p => ({ id: p.id, name: p.name, mainPermissionId: p.menuId, action: 'access', resource: p.name.toLowerCase().replace(/\s+/g, '_'), description: `API access for ${p.menuName}` }));

  const getMainPermissionsList = () => apiPermissionsData.map(g => ({ id: g.perMenuId, name: g.perMenu, description: `Menu: ${g.perMenu}` }));

  const goNext = () => setStep(s => Math.min(STEPS.length, s + 1));
  const goBack = () => setStep(s => Math.max(1, s - 1));

  const saveDraft = useCallback(() => {
    setIsSaving(true);
    const draft = { timestamp: new Date().toISOString(), step, formData, userId, employeeCode: employee?.code };
    localStorage.setItem(getDraftKey(), JSON.stringify(draft));
    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 500);
  }, [step, formData, userId, employee?.code, getDraftKey]);

  const restoreDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(getDraftKey());
    if (savedDraft) {
      try {
        const { step: savedStep, formData: savedData, userId: savedUserId } = JSON.parse(savedDraft);
        setFormData(savedData);
        setStep(savedStep);
        setUserId(savedUserId || '');
        setShowRestoreModal(false);
      } catch (e) { console.error(e); }
    }
  }, [getDraftKey]);

  const startFresh = useCallback(() => {
    localStorage.removeItem(getDraftKey());
    setShowRestoreModal(false);
  }, [getDraftKey]);

  const exportConfig = useCallback(() => {
    const exportData = { employee: { code: employee?.code, name: employee?.empFullName }, permissions: formData, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-${employee?.code}-${Date.now()}.json`;
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
            if (imported.permissions) { setFormData(imported.permissions); setStep(1); }
          } catch (err) { console.error(err); }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleStep1 = async (step1Data: any) => {
    setLoading(true);
    try {
      if (!employee?.id) throw new Error('Employee ID not found');
      const result = await registerApi.step1({ employeeId: employee.id as UUID, password: step1Data.password, roleId: step1Data.role, perModules: step1Data.modules.map((id: string) => id as UUID) });
      if (!result.userId) throw new Error('No userId returned');
      setUserId(result.userId);
      setFormData(prev => ({ ...prev, step1: { ...step1Data, roleName: step1Data.roleName || '', moduleNames: step1Data.moduleNames || [] } }));
      toast.success('Account created!');
      goNext();
    } catch (error: any) { toast.error(error.message || 'Failed to create account'); }
    finally { setLoading(false); }
  };

  const handleStep2 = async (step2Data: any) => {
    if (!userId) { toast.error('Please complete Step 1 first'); return; }
    setLoading(true);
    try {
      await registerApi.step2({ userId, perMenus: step2Data.permissions.map((id: string) => id as UUID) });
      setFormData(prev => ({ ...prev, step2: { permissions: step2Data.permissions, permissionNames: step2Data.permissionNames || [] } }));
      toast.success('Menu permissions saved!');
      goNext();
    } catch (error: any) { toast.error(error.message || 'Failed to save permissions'); }
    finally { setLoading(false); }
  };

  const handleStep3 = async (step3Data: { apiPermissions: string[], apiPermissionNames?: string[] }) => {
    if (!userId) { toast.error('User ID not found'); return; }
    setFormData(prev => ({ ...prev, step3: { apiPermissions: step3Data.apiPermissions, apiPermissionNames: step3Data.apiPermissionNames || [] } }));
    toast.success('API permissions selected!');
    goNext();
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    try {
      if (!userId) throw new Error('User ID not found');
      const result = await accountApi.step3({ userId: userId as UUID, perAccess: formData.step3.apiPermissions as UUID[] });
      if (result) {
        toast.success("Account created successfully!");
        localStorage.removeItem(getDraftKey());
        setIsRegistrationComplete(true);
        onAccountAdded({ success: true, accountId: userId });
      } else throw new Error('Failed to save permissions');
    } catch (error: any) { toast.error(error.message || "Failed to create account"); }
    finally { setLoading(false); }
  };

  const handleBack = () => {
    if (step > 1) goBack();
    else {
      localStorage.removeItem(getDraftKey());
      onBackToAccounts();
    }
  };

  const initials = (employee?.empFullName ?? '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const currentStep = STEPS.find(s => s.id === step)!;
  const completionPercentage = ((step - 1) / 3) * 100;

  const permissionSummary = useMemo(() => ({
    modules: formData.step1.modules.length,
    menus: formData.step2.permissions.length,
    actions: formData.step3.apiPermissions.length,
    total: formData.step2.permissions.length + formData.step3.apiPermissions.length,
  }), [formData]);

  if (isRegistrationComplete && userId) {
    return (
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Account Created Successfully!</h2>
            <p className="text-gray-500 mb-6">The account has been created with all permissions configured.</p>
            <button onClick={onBackToAccounts} className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">Back to Accounts</button>
          </div>
        </div>
    );
  }

  return (
      <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{employee?.empFullName}</p>
                <p className="text-xs text-gray-500">{employee?.code}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-3">Setup Progress</p>
            <div className="space-y-1">
              {STEPS.map((s, i) => {
                const completed = step > s.id;
                const active = step === s.id;
                const Icon = s.icon;
                return (
                    <div key={s.id} className={`relative rounded-lg transition-colors ${active ? 'bg-gray-100' : ''}`}>
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${completed ? 'bg-green-600 text-white' : active ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {completed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${active ? 'text-gray-900' : completed ? 'text-gray-700' : 'text-gray-500'}`}>{s.label}</p>
                          <p className="text-xs text-gray-400">{s.description}</p>
                        </div>
                        {completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                    </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-700">{Math.round(completionPercentage)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-700 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs font-medium text-gray-500 mb-2">Permissions</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-semibold text-gray-800">{permissionSummary.modules}</p><p className="text-xs text-gray-400">Modules</p></div>
                <div><p className="text-lg font-semibold text-gray-800">{permissionSummary.menus}</p><p className="text-xs text-gray-400">Menus</p></div>
                <div><p className="text-lg font-semibold text-gray-800">{permissionSummary.actions}</p><p className="text-xs text-gray-400">Actions</p></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowSaveModal(true)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={exportConfig} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button onClick={importConfig} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition">
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
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentStep.label}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{currentStep.description}</p>
              </div>
              {step > 1 && step < 4 && (
                  <div className="flex gap-2">
                    <button onClick={goBack} className="p-2 rounded-lg hover:bg-gray-100 transition"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                    <button onClick={goNext} className="p-2 rounded-lg hover:bg-gray-100 transition"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
                  </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              {step === 1 && <AccountInfoStep employee={employee} initialData={formData.step1} onSubmit={handleStep1} onBack={handleBack} isLoading={loading} />}
              {step === 2 && <MenuPermissionsStep initialData={formData.step2} onSubmit={handleStep2} onBack={handleBack} isLoading={loading || isLoadingPermissions} permissions={getPermissionsForStep2()} selectedModules={formData.step1.modules} />}
              {step === 3 && <AccessPermissionsStep initialData={formData.step3} onSubmit={handleStep3} onBack={handleBack} isLoading={loading || isLoadingApiPermissions} apiPermissions={getFilteredDetailedPermissions()} selectedPermissions={formData.step2.permissions} mainPermissionsList={getMainPermissionsList()} />}
              {step === 4 && <AccountReviewStep employeeName={getEmployeeDisplayName()} employeeCode={getEmployeeCode()} employeeDept={employee?.dept} formData={formData} onSubmit={handleFinalConfirm} onBack={handleBack} isLoading={loading} />}
            </div>
          </div>

          {isSaving && (
              <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg">
                Saving...
              </div>
          )}
        </main>

        <SaveConfirmationModal isOpen={showSaveModal} onConfirm={() => { saveDraft(); setShowSaveModal(false); }} onCancel={() => setShowSaveModal(false)} />
        <RestoreDraftModal isOpen={showRestoreModal} onRestore={restoreDraft} onStartNew={startFresh} draftDate={savedDraftDate} />
      </div>
  );
};