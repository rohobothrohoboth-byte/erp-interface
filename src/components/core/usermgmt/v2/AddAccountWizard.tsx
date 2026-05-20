import { useState } from 'react';
import { Check, User, Shield, Key, ClipboardList } from 'lucide-react';
import { AccountInfoStep } from './steps/AccountInfoStep';
import { MenuPermissionsStep } from './steps/MenuPermissionsStep';
import { AccessPermissionsStep } from './steps/AccessPermissionsStep';
import { ReviewStep } from './steps/ReviewStep';
import type { EmpSearchRes } from '../../../../types/core/EmpSearchRes';

export interface WizardFormData {
  step1: { password: string; confirmPassword: string; roleId: string; roleName: string; moduleIds: string[]; moduleNames: string[]; };
  step2: { menuIds: string[]; };
  step3: { accessIds: string[]; };
}

// Step 2 (Module Access) is now embedded inside Step 1
const STEPS = [
  { id: 1, label: 'Account & Modules', icon: User },
  { id: 2, label: 'Menu Permissions',  icon: Shield },
  { id: 3, label: 'Access Permissions',icon: Key },
  { id: 4, label: 'Review',            icon: ClipboardList },
];

interface Props {
  employee: EmpSearchRes;
  onDone: () => void;
  onCancel: () => void;
}

export function AddAccountWizard({ employee, onDone, onCancel }: Props) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<WizardFormData>({
    step1: { password: '', confirmPassword: '', roleId: '', roleName: '', moduleIds: [], moduleNames: [] },
    step2: { menuIds: [] },
    step3: { accessIds: [] },
  });

  const goNext = () => setStep(s => Math.min(STEPS.length, s + 1));
  const goBack = () => setStep(s => Math.max(1, s - 1));

  const handleStep1 = (data: WizardFormData['step1']) => {
    setFormData(f => ({ ...f, step1: data }));
    goNext();
  };
  const handleStep2 = (data: WizardFormData['step2']) => {
    setFormData(f => ({ ...f, step2: data }));
    goNext();
  };
  const handleStep3 = (data: WizardFormData['step3']) => {
    setFormData(f => ({ ...f, step3: data }));
    goNext();
  };

  const initials = (employee.empFullName ?? '??')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-[calc(100vh-120px)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Left step rail — white bg to contrast with gray-50 layout ── */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col py-8 px-4">
        {/* Employee card */}
        <div className="mb-8 px-1">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm mb-2">
            {initials}
          </div>
          <p className="text-xs font-semibold text-gray-800 truncate">{employee.empFullName}</p>
          <p className="text-xs text-gray-400 truncate">{employee.code}</p>
        </div>

        {/* Steps */}
        <div className="flex flex-col">
          {STEPS.map((s, i) => {
            const done   = step > s.id;
            const active = step === s.id;
            const Icon   = s.icon;
            return (
              <div key={s.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                    done   ? 'bg-green-500 text-white' :
                    active ? 'bg-green-600 text-white ring-4 ring-green-100' :
                             'bg-gray-100 text-gray-400'
                  }`}>
                    {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-0.5 h-7 mt-0.5 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className="pt-1 pb-7">
                  <p className={`text-xs font-medium leading-tight ${
                    active ? 'text-green-700' : done ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50/40">
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
          />
        )}
        {step === 4 && (
          <ReviewStep
            employee={employee}
            formData={formData}
            onFinish={onDone}
            onBack={goBack}
          />
        )}
      </main>
    </div>
  );
}
