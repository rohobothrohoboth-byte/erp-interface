import { CheckCircle2, ChevronLeft, Layout, Shield, Key } from 'lucide-react';
import { Button } from '../../../../ui/button';
import type { EmpSearchRes } from '../../../../../types/core/EmpSearchRes';
import type { WizardFormData } from '../AddAccountWizard';

interface Props {
  employee: EmpSearchRes;
  formData: WizardFormData;
  onFinish: () => void;
  onBack: () => void;
}

export function ReviewStep({ employee, formData, onFinish, onBack }: Props) {
  const initials = (employee.empFullName ?? '??')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Review & Confirm</h2>
        <p className="text-sm text-gray-500 mt-1">Check the summary before submitting.</p>
      </div>

      {/* Employee + Account info side by side */}
      <div className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
        {/* Avatar + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{employee.empFullName}</p>
            <p className="text-xs text-gray-500">{employee.code}</p>
            {employee.dept && <p className="text-xs text-gray-400">{employee.dept}</p>}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-green-200 shrink-0" />

        {/* Account info */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Account Info</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-10">Role</span>
            <span className="text-sm font-medium text-gray-800">
              {formData.step1.roleName || formData.step1.roleId || '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-10">Modules</span>
            <span className="text-sm font-medium text-gray-800">
              {formData.step1.moduleIds.length} selected
            </span>
          </div>
        </div>
      </div>

      {/* Modules */}
      <Section icon={<Layout className="w-4 h-4" />} title="Module Access">
        {formData.step1.moduleNames.length === 0 ? (
          <p className="text-sm text-gray-400">No modules selected</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {formData.step1.moduleNames.map(name => (
              <span key={name} className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                {name}
              </span>
            ))}
          </div>
        )}
      </Section>
<div className='flex w-full gap-5'>
      {/* Menu permissions */}
      <Section icon={<Shield className="w-4 h-4" />} title={`Menu Permissions (${formData.step2.menuIds.length})`}>
        {formData.step2.menuIds.length === 0 ? (
          <p className="text-sm text-gray-400">None selected</p>
        ) : (
          <p className="text-sm text-gray-600">{formData.step2.menuIds.length} menu(s) selected</p>
        )}
      </Section>

      {/* Access permissions */}
      <Section icon={<Key className="w-4 h-4" />} title={`Access Permissions (${formData.step3.accessIds.length})`}>
        {formData.step3.accessIds.length === 0 ? (
          <p className="text-sm text-gray-400">None selected</p>
        ) : (
          <p className="text-sm text-gray-600">{formData.step3.accessIds.length} action(s) selected</p>
        )}
      </Section></div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onFinish} className="bg-green-600 hover:bg-green-700 text-white px-8 gap-2">
          <CheckCircle2 className="w-4 h-4" /> Submit
        </Button>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-green-600">{icon}</span>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}
