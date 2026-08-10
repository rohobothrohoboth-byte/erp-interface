import { useState } from 'react';
import { CheckCircle2, ChevronLeft, Layout, Shield, Key } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { SubmitConfirmModal } from '@/modules/core/components/usermgmt/steps/SubmitConfirmModal';

import type { EmpSearchRes } from '@/modules/core/types/EmpSearchRes';
import type { EditWizardFormData } from '@/modules/core/components/usermgmt/steps/EditAccountWizard';

import type { WizardFormData } from '@/modules/core/components/usermgmt/v2/AddAccountWizard';

interface Props {
  employee: EmpSearchRes;
  formData: EditWizardFormData;
  onFinish: () => void;
  onBack: () => void;
}

export function EditReviewStep({ employee, formData, onFinish, onBack }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);

  const initials = (employee.empFullName ?? '??')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onFinish();
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  // Adapt EditWizardFormData to WizardFormData shape for SubmitConfirmModal
  const modalFormData: WizardFormData = {
    step1: {
      password: formData.step1.password ?? '',
      confirmPassword: formData.step1.confirmPassword ?? '',
      roleId: formData.step1.roleId,
      roleName: formData.step1.roleName,
      moduleIds: formData.step1.moduleIds,
      moduleNames: formData.step1.moduleNames,
    },
    step2: formData.step2,
    step3: formData.step3,
  };

  return (
    <>
      {showConfirm && (
        <SubmitConfirmModal
          employee={employee}
          formData={modalFormData}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          loading={submitting}
        />
      )}

      <div className="space-y-4 w-full">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Review &amp; Confirm</h2>
          <p className="text-sm text-gray-500 mt-1">Check the summary before saving changes.</p>
        </div>

        {/* Employee + Account info */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{employee.empFullName}</p>
              <p className="text-xs text-gray-500">{employee.code}</p>
              {employee.dept && <p className="text-xs text-gray-400">{employee.dept}</p>}
            </div>
          </div>
          <div className="hidden sm:block w-px bg-green-200 shrink-0" />
          <div className="block sm:hidden h-px bg-green-200 w-full" />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Account Info</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-14">Role</span>
              <span className="text-sm font-medium text-gray-800">
                {formData.step1.roleName || formData.step1.roleId || '—'}
              </span>
            </div>
            {formData.step1.password && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14">Password</span>
                <span className="text-sm font-medium text-green-600">Will be updated</span>
              </div>
            )}
          </div>
        </div>

        {/* Module access */}
        <ReviewSection icon={<Layout className="w-4 h-4" />} title={`Module Access — ${formData.step1.moduleIds.length} selected`}>
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
        </ReviewSection>

        {/* Menu + Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Menu permissions */}
          <ReviewSection icon={<Shield className="w-4 h-4" />} title={`Menu Permissions (${formData.step2.menuIds.length})`}>
            {formData.step2.menuIds.length === 0 ? (
              <p className="text-sm text-gray-400">None selected</p>
            ) : (
              <div className="space-y-3">
                {MOCK_MODULE_MENU_TREE.map(mod => {
                  const leafIds = mod.menus.flatMap(m =>
                    m.isParent && m.children ? m.children.map(c => c.id) : [m.id]
                  );
                  const selectedLeafs = leafIds.filter(id => formData.step2.menuIds.includes(id));
                  if (selectedLeafs.length === 0) return null;

                  const nameMap: Record<string, string> = {};
                  mod.menus.forEach(m => {
                    if (m.isParent && m.children) m.children.forEach(c => { nameMap[c.id] = c.name; });
                    else nameMap[m.id] = m.name;
                  });

                  return (
                    <div key={mod.perModuleId}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        {mod.perModule}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLeafs.map(id => (
                          <span key={id} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                            {nameMap[id] ?? id}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ReviewSection>

          {/* Access permissions */}
          <ReviewSection icon={<Key className="w-4 h-4" />} title={`Access Permissions (${formData.step3.accessIds.length})`}>
            {formData.step3.accessIds.length === 0 ? (
              <p className="text-sm text-gray-400">None selected</p>
            ) : (
              <div className="space-y-1.5">
                {MOCK_MENU_APIS.map(menu => {
                  const count = menu.perApiList.filter(a => formData.step3.accessIds.includes(a.id)).length;
                  if (count === 0) return null;
                  return (
                    <div key={menu.perMenuId} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 truncate">{menu.perMenu}</span>
                      <span className="text-xs font-semibold text-emerald-600 shrink-0 ml-2">
                        {count}/{menu.perApiList.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </ReviewSection>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={onBack} className="gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            onClick={() => setShowConfirm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Save All Changes
          </Button>
        </div>
      </div>
    </>
  );
}

function ReviewSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
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
