import { useMemo, useState } from 'react';
import { Loader2, UserX, PauseCircle, LogOut, Ban } from 'lucide-react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { showToast } from '@/shared/layout/layout';
import { useEmployeeList } from '@/modules/hr/services/employee/emp.queries';
import {
  useTerminateEmployee,
  useSuspendEmployee,
  useRetireEmployee,
  useStandByEmployee,
} from '@/modules/hr/services/employee/empStatus/empStatus.queries';
import type { EmployeeListDto } from '@/modules/hr/types/employee';
import type { UUID } from 'crypto';

type StatusAction = 'terminate' | 'suspend' | 'retire' | 'standby';

const statusTone = (state: string): 'success' | 'warning' | 'danger' | 'neutral' | 'info' => {
  const s = (state || '').toLowerCase();
  if (s.includes('active') || s.includes('approved')) return 'success';
  if (s.includes('terminat')) return 'danger';
  if (s.includes('suspend') || s.includes('standby') || s.includes('probation')) return 'warning';
  if (s.includes('retire')) return 'neutral';
  if (s.includes('leave')) return 'info';
  return 'neutral';
};

export default function Termination() {
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<{ id: string; action: StatusAction } | null>(null);

  const { data: employees = [], isLoading, isError, error, refetch } = useEmployeeList();

  const terminate = useTerminateEmployee();
  const suspend = useSuspendEmployee();
  const retire = useRetireEmployee();
  const standby = useStandByEmployee();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      [e.empFullName, e.code, e.department, e.position, e.empState]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [employees, search]);

  const activeCount = employees.filter((e) => {
    const s = (e.empState || '').toLowerCase();
    return s.includes('active') || s.includes('approved');
  }).length;
  const terminatedCount = employees.filter((e) =>
    (e.empState || '').toLowerCase().includes('terminat')
  ).length;

  const runAction = async (emp: EmployeeListDto, action: StatusAction) => {
    const labels: Record<StatusAction, string> = {
      terminate: 'terminate',
      suspend: 'suspend',
      retire: 'retire',
      standby: 'move to standby',
    };
    if (!window.confirm(`Are you sure you want to ${labels[action]} ${emp.empFullName}?`)) {
      return;
    }
    setPending({ id: emp.id as string, action });
    try {
      const id = emp.id as UUID;
      switch (action) {
        case 'terminate':
          await terminate.mutateAsync(id);
          break;
        case 'suspend':
          await suspend.mutateAsync(id);
          break;
        case 'retire':
          await retire.mutateAsync(id);
          break;
        case 'standby':
          await standby.mutateAsync(id);
          break;
      }
      showToast.success(`${emp.empFullName} ${labels[action]}d successfully`);
    } catch (err) {
      showToast.error(err);
    } finally {
      setPending(null);
    }
  };

  const isBusy = (id: string, action: StatusAction) =>
    pending?.id === id && pending?.action === action;
  const rowBusy = (id: string) => pending?.id === id;

  return (
    <ModulePageShell
      title="Employee status & termination"
      subtitle="Terminate, suspend, retire, or set employees to standby."
      stats={[
        { label: 'Employees', value: employees.length },
        { label: 'Active', value: activeCount },
        { label: 'Terminated', value: terminatedCount },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search employees..."
      onRefresh={() => refetch()}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading employees...
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 py-12 text-center">
          <p className="text-sm text-rose-700">
            {error?.message || 'Failed to load employees.'}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id as string} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{emp.empFullName}</div>
                    <div className="text-xs text-slate-500">{emp.code}</div>
                  </td>
                  <td className="px-4 py-3">{emp.department || '—'}</td>
                  <td className="px-4 py-3">{emp.position || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={emp.empState || 'Unknown'} tone={statusTone(emp.empState)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        disabled={rowBusy(emp.id as string)}
                        onClick={() => runAction(emp, 'terminate')}
                      >
                        {isBusy(emp.id as string, 'terminate') ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserX className="mr-1 h-3.5 w-3.5" />
                        )}
                        Terminate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-200 text-amber-700 hover:bg-amber-50"
                        disabled={rowBusy(emp.id as string)}
                        onClick={() => runAction(emp, 'suspend')}
                      >
                        {isBusy(emp.id as string, 'suspend') ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Ban className="mr-1 h-3.5 w-3.5" />
                        )}
                        Suspend
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-100"
                        disabled={rowBusy(emp.id as string)}
                        onClick={() => runAction(emp, 'retire')}
                      >
                        {isBusy(emp.id as string, 'retire') ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <LogOut className="mr-1 h-3.5 w-3.5" />
                        )}
                        Retire
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-sky-200 text-sky-700 hover:bg-sky-50"
                        disabled={rowBusy(emp.id as string)}
                        onClick={() => runAction(emp, 'standby')}
                      >
                        {isBusy(emp.id as string, 'standby') ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <PauseCircle className="mr-1 h-3.5 w-3.5" />
                        )}
                        Standby
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    {search ? 'No employees match your search.' : 'No employees found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </ModulePageShell>
  );
}
