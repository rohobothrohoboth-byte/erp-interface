import { useMemo, useState } from 'react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { showToast } from '@/shared/layout/layout';

type TerminationRecord = {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  lastWorkingDay: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
};

const INITIAL: TerminationRecord[] = [
  {
    id: 't1',
    employeeName: 'Maya Chen',
    employeeId: 'EMP-204',
    department: 'Operations',
    lastWorkingDay: '2026-08-20',
    reason: 'Resignation',
    status: 'Pending',
  },
  {
    id: 't2',
    employeeName: 'Luis Ortega',
    employeeId: 'EMP-118',
    department: 'Finance',
    lastWorkingDay: '2026-08-15',
    reason: 'End of contract',
    status: 'Pending',
  },
  {
    id: 't3',
    employeeName: 'Priya Nair',
    employeeId: 'EMP-091',
    department: 'Engineering',
    lastWorkingDay: '2026-07-31',
    reason: 'Mutual agreement',
    status: 'Approved',
  },
];

export default function Termination() {
  const [rows, setRows] = useState(INITIAL);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    employeeName: '',
    employeeId: '',
    department: '',
    lastWorkingDay: '',
    reason: 'Resignation',
    notes: '',
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.employeeName, r.employeeId, r.department, r.reason, r.status].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  const pendingCount = rows.filter((r) => r.status === 'Pending').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeName.trim() || !form.employeeId.trim() || !form.lastWorkingDay) {
      showToast.error('Employee, ID, and last working day are required');
      return;
    }
    const next: TerminationRecord = {
      id: `t-${Date.now()}`,
      employeeName: form.employeeName.trim(),
      employeeId: form.employeeId.trim(),
      department: form.department || '—',
      lastWorkingDay: form.lastWorkingDay,
      reason: form.reason,
      status: 'Pending',
    };
    setRows((prev) => [next, ...prev]);
    setForm({
      employeeName: '',
      employeeId: '',
      department: '',
      lastWorkingDay: '',
      reason: 'Resignation',
      notes: '',
    });
    showToast.success('Termination request submitted');
  };

  return (
    <ModulePageShell
      title="Employee termination"
      subtitle="Submit termination workflows and track pending exit cases."
      stats={[
        { label: 'Pending', value: pendingCount },
        { label: 'Total cases', value: rows.length },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search terminations..."
      onRefresh={() => showToast.success('Termination list refreshed')}
    >
      <div className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2"
        >
          <div className="space-y-2 md:col-span-2">
            <h2 className="text-sm font-semibold text-slate-800">New termination request</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employeeName">Employee name *</Label>
            <Input
              id="employeeName"
              value={form.employeeName}
              onChange={(e) => setForm((f) => ({ ...f, employeeName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID *</Label>
            <Input
              id="employeeId"
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastWorkingDay">Last working day *</Label>
            <Input
              id="lastWorkingDay"
              type="date"
              value={form.lastWorkingDay}
              onChange={(e) => setForm((f) => ({ ...f, lastWorkingDay: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select
              value={form.reason}
              onValueChange={(v) => setForm((f) => ({ ...f, reason: v }))}
            >
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Resignation', 'End of contract', 'Mutual agreement', 'Redundancy', 'Dismissal'].map(
                  (r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Handover, assets, exit interview notes…"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Submit termination
            </Button>
          </div>
        </form>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Last day</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{row.employeeName}</div>
                    <div className="text-xs text-slate-500">{row.employeeId}</div>
                  </td>
                  <td className="px-4 py-3">{row.department}</td>
                  <td className="px-4 py-3">{row.lastWorkingDay}</td>
                  <td className="px-4 py-3">{row.reason}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={row.status}
                      tone={
                        row.status === 'Completed' || row.status === 'Approved'
                          ? 'success'
                          : row.status === 'Cancelled'
                            ? 'danger'
                            : 'warning'
                      }
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No pending terminations match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePageShell>
  );
}
