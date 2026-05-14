import { memo, useState } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { useEmpDetailFamily } from '../../../../services/hr/employee/empDetail/empDetail.queries';
import { Field } from './shared';
import { DetailSkeleton, DetailError } from './LoadState';
import type { EmpDetailFamilyMember } from '../../../../types/hr/employee/empDetail';

export const FamilyTab = memo(function FamilyTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading, error } = useEmpDetailFamily(employeeId);
  const [openId, setOpenId] = useState<string | null>(null);

  if (isLoading) return <DetailSkeleton rows={3} />;
  if (error) return <DetailError message={error.message} />;

  const members: EmpDetailFamilyMember[] = data?.family ?? [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
          <Users className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Family Members</h3>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No family members on record.</p>
      ) : (
        <div className="space-y-2">
          {members.map((m) => {
            const isOpen = openId === m.id;
            const fullName = m.fullName || [m.firstName, m.middleName, m.lastName].filter(Boolean).join(' ') || 'Unknown';
            return (
              <div key={m.id} className={`rounded-xl border transition-all ${isOpen ? 'border-green-200 shadow-sm' : 'border-gray-100'}`}>
                <button
                  className="flex items-center justify-between w-full px-4 py-3 text-left"
                  onClick={() => setOpenId(isOpen ? null : m.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xs font-bold shrink-0">
                      {(m.firstName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{fullName}</p>
                      <p className="text-xs text-gray-400">{m.relation}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <Field label="Full Name"   value={fullName} />
                      <Field label="Nationality" value={m.nationality} />
                      <Field label="Gender"      value={m.gender} />
                      <Field label="Relation"    value={m.relation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

