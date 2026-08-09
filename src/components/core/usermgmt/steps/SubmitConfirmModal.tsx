import { CheckCircle2, X, User, Shield, Key } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { WizardFormData } from '../../usermgmt/v2/AddAccountWizard';

import type { EmpSearchRes } from '../../../../types/core/EmpSearchRes';

interface Props {
  employee: EmpSearchRes;
  formData: WizardFormData;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function SubmitConfirmModal({ employee, formData, onConfirm, onCancel, loading }: Props) {
  const initials = (employee.empFullName ?? '??')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Confirm account creation</h3>
              <p className="text-xs text-gray-400 mt-0.5">Review before submitting</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-5 space-y-4">
          {/* Employee */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{employee.empFullName}</p>
              <p className="text-xs text-gray-400">{employee.code}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-blue-50 border border-blue-100">
              <User className="w-4 h-4 text-blue-600 mb-1" />
              <p className="text-xs font-semibold text-blue-700 text-center leading-tight">
                {formData.step1.roleName || '—'}
              </p>
              <p className="text-[10px] text-blue-500 mt-0.5">Role</p>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-purple-50 border border-purple-100">
              <Shield className="w-4 h-4 text-purple-600 mb-1" />
              <p className="text-xs font-semibold text-purple-700">{formData.step2.menuIds.length}</p>
              <p className="text-[10px] text-purple-500 mt-0.5">Menus</p>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <Key className="w-4 h-4 text-emerald-600 mb-1" />
              <p className="text-xs font-semibold text-emerald-700">{formData.step3.accessIds.length}</p>
              <p className="text-[10px] text-emerald-500 mt-0.5">Actions</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center">
            This will create a new account with the permissions above. This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-5 pb-5">
          <Button variant="outline" onClick={onCancel} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Create account
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
