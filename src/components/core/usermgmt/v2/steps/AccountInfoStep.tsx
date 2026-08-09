// steps/AccountInfoStep.tsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, ChevronRight, X, LayoutGrid, Check, Shield, Lock, KeyRound,
  HelpCircle, AlertTriangle, Copy, CheckCircle, Sparkles,
  Building2, Mail, User, Zap, Star, Activity, Settings, Users, DollarSign, Package, Heart,
  ShoppingCart, Target, Briefcase, Folder, BarChart
} from 'lucide-react';
import { Label } from '../../../../ui/label.tsx';
import { Input } from '../../../../ui/input.tsx';
import { Button } from '../../../../ui/button.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../../ui/select.tsx';

import { authListApi } from '../../../../../services/List/auth/authList.api.ts';
import type { RoleListItem, NameListItem } from '../../../../../types/NameList/nameList.ts';
import type { EmpSearchRes } from '../../../../../types/core/EmpSearchRes.ts';
import type { WizardFormData } from '../AddAccountWizard.tsx';

// Module icon mapping based on module key
const MODULE_ICON_MAP: Record<string, string> = {
  'mod.core': 'Core',
  'mod.hrm': 'HR',
  'mod.fnm': 'Finance',
  'mod.inv': 'Inventory',
  'mod.crm': 'CRM',
  'mod.pro': 'Procurement',
  'mod.pld': 'Planning',
  'mod.prm': 'Projects',
  'mod.flm': 'Files',
  'mod.rpt': 'Reports',
};

function getModuleCategory(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('hr') || lowerName.includes('human')) return 'HR';
  if (lowerName.includes('finance')) return 'Finance';
  if (lowerName.includes('core')) return 'Core';
  if (lowerName.includes('crm')) return 'CRM';
  if (lowerName.includes('inventory')) return 'Inventory';
  if (lowerName.includes('procurement')) return 'Procurement';
  if (lowerName.includes('file')) return 'Files';
  if (lowerName.includes('report')) return 'Reports';
  if (lowerName.includes('plan')) return 'Planning';
  if (lowerName.includes('project')) return 'Projects';
  return 'Other';
}

function getModuleColor(name: string): string {
  const category = getModuleCategory(name);
  const colors: Record<string, string> = {
    'HR': 'emerald',
    'Finance': 'blue',
    'Core': 'slate',
    'CRM': 'purple',
    'Inventory': 'orange',
    'Procurement': 'amber',
    'Files': 'teal',
    'Reports': 'cyan',
    'Planning': 'indigo',
    'Projects': 'rose',
  };
  return colors[category] || 'emerald';
}

// Password requirements
const PASSWORD_REQUIREMENTS = [
  { text: 'At least 8 characters', check: (pw: string) => pw.length >= 8 },
  { text: 'Contains uppercase letter', check: (pw: string) => /[A-Z]/.test(pw) },
  { text: 'Contains lowercase letter', check: (pw: string) => /[a-z]/.test(pw) },
  { text: 'Contains number', check: (pw: string) => /[0-9]/.test(pw) },
  { text: 'Contains special character', check: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

// Role-based module recommendations
const MODULE_RECOMMENDATIONS: Record<string, string[]> = {
  'Admin': ['Core System Management', 'Human Resource Management', 'Financial Management', 'Customer Relationship Management', 'Inventory Management', 'File Management'],
  'HR Manager': ['Human Resource Management', 'Core System Management', 'File Management'],
  'Finance Manager': ['Financial Management', 'Core System Management'],
  'Team Lead': ['Human Resource Management', 'Customer Relationship Management', 'Core System Management'],
  'Employee': ['Human Resource Management', 'File Management'],
};

interface Props {
  employee: EmpSearchRes;
  initialData: WizardFormData['step1'];
  onSubmit: (data: WizardFormData['step1']) => void;
  onCancel: () => void;
}

export function AccountInfoStep({ employee, initialData, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState(initialData);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [modules, setModules] = useState<NameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // ✅ Generate username from employee name
  const generateUsername = useCallback(() => {
    if (employee.empFullName) {
      const username = employee.empFullName
          .toLowerCase()
          .replace(/\s+/g, '.')
          .replace(/[^a-z0-9.]/g, '');
      if (!form.userName) {
        setForm(f => ({ ...f, userName: username }));
      }
    }
  }, [employee.empFullName, form.userName]);

  // ✅ Generate email from employee name
  const generateEmail = useCallback(() => {
    if (employee.empFullName && !form.email) {
      const username = employee.empFullName
          .toLowerCase()
          .replace(/\s+/g, '.')
          .replace(/[^a-z0-9.]/g, '');
      const domain = 'company.com';
      setForm(f => ({ ...f, email: `${username}@${domain}` }));
    }
  }, [employee.empFullName, form.email]);

  // Auto-generate username and email when employee loads
  useEffect(() => {
    if (employee.empFullName) {
      generateUsername();
      generateEmail();
    }
  }, [employee.empFullName, generateUsername, generateEmail]);

  // Fetch roles and modules from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesData, modulesData] = await Promise.all([
          authListApi.getAllRoles(),
          authListApi.getAllModuleNames()
        ]);
        setRoles(rolesData);
        setModules(modulesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Generate secure password
  const generateSecurePassword = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    setForm(f => ({ ...f, password, confirmPassword: password }));
  }, []);

  // Copy generated password
  const copyGeneratedPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  // Toggle module selection
  const toggleModule = (id: string) => {
    setForm(f => ({
      ...f,
      moduleIds: f.moduleIds.includes(id) ? f.moduleIds.filter(x => x !== id) : [...f.moduleIds, id],
    }));
  };

  // Select/Deselect all modules
  const toggleAllModules = () => {
    setForm(f => ({
      ...f,
      moduleIds: f.moduleIds.length === modules.length ? [] : modules.map(m => m.id),
    }));
  };

  // Apply module recommendations based on selected role
  const applyRecommendations = () => {
    const roleName = roles.find(r => r.id === form.roleId)?.role || '';
    const recommendedModules = MODULE_RECOMMENDATIONS[roleName] || [];
    if (recommendedModules.length > 0) {
      const recommendedIds = modules
          .filter(m => recommendedModules.includes(m.name))
          .map(m => m.id);
      setForm(f => ({ ...f, moduleIds: [...new Set([...f.moduleIds, ...recommendedIds])] }));
    }
  };

  // ✅ UPDATE: Include userName and email in validation
  const validate = () => {
    const e: Record<string, string> = {};

    // ✅ Validate userName
    if (!form.userName || form.userName.trim() === '') {
      e.userName = 'Username is required';
    } else if (form.userName.length < 3) {
      e.userName = 'Username must be at least 3 characters';
    }

    // ✅ Validate email
    if (!form.email || form.email.trim() === '') {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address';
    }

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must contain uppercase letter';
    else if (!/[a-z]/.test(form.password)) e.password = 'Must contain lowercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Must contain a number';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    if (!form.roleId) e.roleId = 'Please select a role';
    if (form.moduleIds.length === 0) e.modules = 'Please select at least one module';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ✅ UPDATE: Include userName and email in submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const roleName = roles.find(r => r.id === form.roleId)?.role ?? form.roleId;
    const moduleNames = modules.filter(m => form.moduleIds.includes(m.id)).map(m => m.name);

    // ✅ Include userName and email
    onSubmit({
      ...form,
      userName: form.userName.trim(),
      email: form.email.trim(),
      roleName,
      moduleNames
    });
  };

  // Calculate password strength
  const passwordStrength = () => {
    const pw = form.password;
    if (!pw) return 0;
    let strength = 0;
    if (pw.length >= 8) strength++;
    if (/[A-Z]/.test(pw)) strength++;
    if (/[a-z]/.test(pw)) strength++;
    if (/[0-9]/.test(pw)) strength++;
    if (/[^A-Za-z0-9]/.test(pw)) strength++;
    return strength;
  };

  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength()] || '';
  const strengthColor = ['', 'red', 'orange', 'yellow', 'green'][passwordStrength()] || '';

  const passedRequirements = PASSWORD_REQUIREMENTS.filter(req => req.check(form.password)).length;
  const totalRequirements = PASSWORD_REQUIREMENTS.length;

  const roleName = roles.find(r => r.id === form.roleId)?.role || '';
  const hasRecommendations = MODULE_RECOMMENDATIONS[roleName]?.length > 0 && form.roleId;

  const getIconComponent = (iconName?: string) => {
    const iconMap: Record<string, any> = {
      'Settings': Settings,
      'Users': Users,
      'DollarSign': DollarSign,
      'Package': Package,
      'Heart': Heart,
      'ShoppingCart': ShoppingCart,
      'Target': Target,
      'Briefcase': Briefcase,
      'Folder': Folder,
      'BarChart': BarChart,
    };
    const Icon = iconMap[iconName || ''] || LayoutGrid;
    return <Icon className="w-5 h-5" />;
  };

  return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Account Information</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Set up credentials and module access</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                {employee.empFullName?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{employee.empFullName}</h4>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {employee.code}
                </span>
                  {employee.dept && (
                      <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {employee.dept}
                  </span>
                  )}
                </div>
              </div>
              <div className="px-2 py-1 rounded-full bg-white dark:bg-slate-700 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> New Account
              </div>
            </div>
          </div>

          {/* ✅ Account Credentials (Username & Email) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Credentials</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Username <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      type="text"
                      value={form.userName || ''}
                      onChange={e => setForm(f => ({ ...f, userName: e.target.value }))}
                      className={`pl-10 h-11 rounded-lg ${errors.userName ? 'border-red-300' : ''}`}
                      placeholder="Enter username"
                  />
                </div>
                {errors.userName && <p className="text-xs text-red-500">{errors.userName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      type="email"
                      value={form.email || ''}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className={`pl-10 h-11 rounded-lg ${errors.email ? 'border-red-300' : ''}`}
                      placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Role & Password Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Authentication</h3>
              {!form.password && (
                  <button
                      type="button"
                      onClick={generateSecurePassword}
                      className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Generate Password
                  </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select value={form.roleId} onValueChange={v => setForm(f => ({ ...f, roleId: v }))}>
                  <SelectTrigger className={`w-full h-11 rounded-lg ${errors.roleId ? 'border-red-300' : ''}`}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                    {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.role}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.roleId && <p className="text-xs text-red-500">{errors.roleId}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className={`pl-10 pr-10 h-11 rounded-lg ${errors.password ? 'border-red-300' : ''}`}
                      placeholder="Enter password"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength */}
                {form.password && (
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                              className={`h-full transition-all duration-300 rounded-full bg-${strengthColor}-500`}
                              style={{ width: `${(passwordStrength() / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium text-${strengthColor}-600`}>{strengthText}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {passedRequirements}/{totalRequirements} requirements met
                      </div>
                    </div>
                )}
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      type={showCpw ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      className={`pl-10 pr-10 h-11 rounded-lg ${errors.confirmPassword ? 'border-red-300' : ''}`}
                      placeholder="Confirm password"
                  />
                  <button
                      type="button"
                      onClick={() => setShowCpw(!showCpw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                )}
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Generated Password Success */}
          {generatedPassword && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700 dark:text-emerald-300">Secure password generated!</span>
                </div>
                <button
                    type="button"
                    onClick={copyGeneratedPassword}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                >
                  {copiedPassword ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedPassword ? 'Copied!' : 'Copy'}
                </button>
              </div>
          )}

          {/* Module Access */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Module Access</h3>
                <span className="text-xs text-slate-400">({form.moduleIds.length} selected)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasRecommendations && (
                    <button
                        type="button"
                        onClick={() => setShowRecommendations(!showRecommendations)}
                        className="text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      {showRecommendations ? 'Hide' : 'Show'} Recommendations
                    </button>
                )}
                {modules.length > 0 && (
                    <button
                        type="button"
                        onClick={toggleAllModules}
                        className="text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      {form.moduleIds.length === modules.length ? 'Deselect All' : 'Select All'}
                    </button>
                )}
              </div>
            </div>

            {/* Recommendations Panel */}
            {showRecommendations && hasRecommendations && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Recommended for {roleName}
                  </span>
                    </div>
                    <button
                        type="button"
                        onClick={applyRecommendations}
                        className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-800 text-emerald-600 hover:text-emerald-700"
                    >
                      Apply All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MODULE_RECOMMENDATIONS[roleName]?.map(name => {
                      const module = modules.find(m => m.name === name);
                      const isSelected = module && form.moduleIds.includes(module.id);
                      return (
                          <span
                              key={name}
                              className={`text-xs px-2 py-1 rounded-lg ${
                                  isSelected
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white dark:bg-slate-800 text-emerald-700 border border-emerald-200'
                              }`}
                          >
                      {isSelected ? <Check className="w-3 h-3 inline mr-1" /> : <Star className="w-3 h-3 inline mr-1" />}
                            {name}
                    </span>
                      );
                    })}
                  </div>
                </div>
            )}

            {/* Modules Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-28 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-4">
                  {modules.map(mod => {
                    const active = form.moduleIds.includes(mod.id);
                    const color = getModuleColor(mod.name);
                    const IconComponent = getIconComponent(mod.icon);

                    return (
                        <button
                            key={mod.id}
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            className={`group relative p-4 rounded-xl border-2 text-left transition-all ${
                                active
                                    ? `bg-${color}-50 dark:bg-${color}-950/30 border-${color}-200 shadow-sm`
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          {active && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5 text-white"/>
                              </div>
                          )}
                          <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/50 flex items-center justify-center mb-3`}>
                            {IconComponent}
                          </div>
                          <p className="text-sm font-medium text-slate-700">{mod.name}</p>
                          <p className="text-xs text-slate-400 mt-1">{getModuleCategory(mod.name)}</p>
                          {mod.order > 0 && (
                              <p className="text-xs text-slate-400 mt-1">Order: {mod.order}</p>
                          )}
                        </button>
                    );
                  })}
                </div>
            )}

            {errors.modules && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500"/>
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.modules}</p>
                </div>
            )}
          </div>

          {/* Summary */}
          {form.moduleIds.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">Selected Modules</span>
                  <span className="text-xs text-slate-400">{form.moduleIds.length} / {modules.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.moduleIds.slice(0, 8).map(id => {
                    const mod = modules.find(m => m.id === id);
                    return mod ? (
                        <span key={id} className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700">
                    {mod.name}
                  </span>
                    ) : null;
                  })}
                  {form.moduleIds.length > 8 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600">
                  +{form.moduleIds.length - 8} more
                </span>
                  )}
                </div>
              </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onCancel} className="gap-2 rounded-lg">
              <X className="w-4 h-4" /> Cancel
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">
                  {form.moduleIds.length} module{form.moduleIds.length !== 1 ? 's' : ''} selected
                </p>
                {form.roleId && (
                    <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1 justify-end">
                      <CheckCircle className="w-3 h-3" /> Ready
                    </p>
                )}
              </div>
              <Button type="submit" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-6">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
  );
}