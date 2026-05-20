import { useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronRight, X, LayoutGrid, Check } from 'lucide-react';
import { Label } from '../../../../ui/label';
import { Input } from '../../../../ui/input';
import { Button } from '../../../../ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../../ui/select';
import { authListApi } from '../../../../../services/List/auth/authList.api';
import type { RoleListItem, NameListItem } from '../../../../../types/NameList/nameList';
import type { EmpSearchRes } from '../../../../../types/core/EmpSearchRes';
import type { WizardFormData } from '../AddAccountWizard';

// Module card color by keyword
const MODULE_COLORS: Record<string, { card: string; icon: string }> = {
  hr:          { card: 'border-blue-200 bg-blue-50',     icon: 'bg-blue-100 text-blue-700' },
  finance:     { card: 'border-emerald-200 bg-emerald-50', icon: 'bg-emerald-100 text-emerald-700' },
  core:        { card: 'border-slate-200 bg-slate-50',   icon: 'bg-slate-100 text-slate-700' },
  crm:         { card: 'border-purple-200 bg-purple-50', icon: 'bg-purple-100 text-purple-700' },
  inventory:   { card: 'border-orange-200 bg-orange-50', icon: 'bg-orange-100 text-orange-700' },
  procurement: { card: 'border-yellow-200 bg-yellow-50', icon: 'bg-yellow-100 text-yellow-700' },
  file:        { card: 'border-teal-200 bg-teal-50',     icon: 'bg-teal-100 text-teal-700' },
};
const DEFAULT_COLOR = { card: 'border-green-200 bg-green-50', icon: 'bg-green-100 text-green-700' };

function moduleColors(name: string) {
  const key = Object.keys(MODULE_COLORS).find(k => name.toLowerCase().includes(k));
  return key ? MODULE_COLORS[key] : DEFAULT_COLOR;
}

interface Props {
  employee: EmpSearchRes;
  initialData: WizardFormData['step1'];
  onSubmit: (data: WizardFormData['step1']) => void;
  onCancel: () => void;
}

export function AccountInfoStep({ employee, initialData, onSubmit, onCancel }: Props) {
  const [form, setForm]       = useState(initialData);
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [roles, setRoles]     = useState<RoleListItem[]>([]);
  const [modules, setModules] = useState<NameListItem[]>([]);
  const [modulesFetching, setModulesFetching] = useState(true);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  useEffect(() => {
    authListApi.getAllRoles().then(setRoles).catch(() => {});
    authListApi.getAllModuleNames()
      .then(setModules)
      .catch(() => {})
      .finally(() => setModulesFetching(false));
  }, []);

  const toggleModule = (id: string) =>
    setForm(f => ({
      ...f,
      moduleIds: f.moduleIds.includes(id) ? f.moduleIds.filter(x => x !== id) : [...f.moduleIds, id],
    }));

  const toggleAllModules = () =>
    setForm(f => ({
      ...f,
      moduleIds: f.moduleIds.length === modules.length ? [] : modules.map(m => m.id),
    }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.password)                              e.password = 'Password is required';
    else if (form.password.length < 6)               e.password = 'Min. 6 characters';
    if (!form.confirmPassword)                       e.confirmPassword = 'Required';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.roleId)                                e.roleId = 'Role is required';
    if (form.moduleIds.length === 0)                 e.modules = 'Select at least one module';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const roleName = roles.find(r => r.id === form.roleId)?.role ?? form.roleId;
    const moduleNames = modules.filter(m => form.moduleIds.includes(m.id)).map(m => m.name);
    onSubmit({ ...form, roleName, moduleNames });
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Account Information</h2>
        <p className="text-sm text-gray-500 mt-1">Set credentials, role, and module access.</p>
      </div>

      {/* Employee card — commented out per request */}
      {/* <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-100">...</div> */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Credentials row ── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-md text-gray-600">Role <span className="text-red-500">*</span></Label>
            <Select value={form.roleId} onValueChange={v => setForm(f => ({ ...f, roleId: v }))}>
              <SelectTrigger className={`w-full focus:ring-green-500 ${errors.roleId ? 'border-red-400' : ''}`}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.length === 0 && <SelectItem value="__loading__" disabled>Loading…</SelectItem>}
                {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.role}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.roleId && <p className="text-xs text-red-500">{errors.roleId}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className={`pr-10 focus:ring-green-500 ${errors.password ? 'border-red-400' : ''}`}
                placeholder="Min. 6 characters"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Confirm Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                type={showCpw ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className={`pr-10 focus:ring-green-500 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                placeholder="Repeat password"
              />
              <button type="button" onClick={() => setShowCpw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* ── Module access ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-md font-semibold text-gray-700">Module Access <span className="text-red-500">*</span></p>
              <p className="text-sm text-gray-400 mt-0.5">Choose which modules this account can access</p>
            </div>
            {modules.length > 0 && (
              <button type="button" onClick={toggleAllModules}
                className="text-sm font-medium text-green-600 hover:text-green-700 underline underline-offset-2">
                {form.moduleIds.length === modules.length ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>

          {modulesFetching ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {modules.map(mod => {
                const active = form.moduleIds.includes(mod.id);
                const colors = moduleColors(mod.name);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className={`relative flex flex-col items-start gap-2 p-3 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
                      active ? `${colors.card} border-opacity-100 shadow-sm` : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    {active && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? colors.icon : 'bg-gray-100 text-emerald-500'}`}>
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 leading-tight">{mod.name}</p>
                  </button>
                );
              })}
            </div>
          )}
          {errors.modules && <p className="text-xs text-red-500">{errors.modules}</p>}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button type="button" variant="outline" onClick={onCancel} className="gap-1.5">
            <X className="w-4 h-4" /> Cancel
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{form.moduleIds.length} module(s) selected</span>
            <Button type="submit" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
