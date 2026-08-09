import React, { useMemo, useState } from 'react';
import { showToast } from '../../../layout/layout';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import HrPageShell from '../shared/HrPageShell';
import SimpleModal from '../shared/SimpleModal';
import {
  useCreateTermination,
  useOffboardingTasks,
  useTerminationAction,
  useTerminations,
  useUpdateOffboardingTask,
} from '../../../services/hr/termination/termination.queries';
import type { EmpTerminationListDto } from '../../../types/hr/termination';

const TerminationSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<EmpTerminationListDto | null>(null);
  const [form, setForm] = useState({
    employeeId: '', lastWorkingDate: '', reason: '', terminationType: 'Voluntary', exitInterviewNotes: '',
  });

  const { data = [], isLoading, error } = useTerminations();
  const { data: tasks = [] } = useOffboardingTasks(selected?.id);
  const createMut = useCreateTermination({
    onSuccess: () => { showToast.success('Termination request created'); setOpen(false); },
    onError: (e) => showToast.error(e.message),
  });
  const approveMut = useTerminationAction('approve', { onSuccess: () => showToast.success('Approved'), onError: (e) => showToast.error(e.message) });
  const rejectMut = useTerminationAction('reject', { onSuccess: () => showToast.success('Rejected'), onError: (e) => showToast.error(e.message) });
  const applyMut = useTerminationAction('apply', { onSuccess: () => showToast.success('Applied — employee terminated & settlement hooked'), onError: (e) => showToast.error(e.message) });
  const taskMut = useUpdateOffboardingTask({
    onSuccess: () => showToast.success('Checklist updated'),
    onError: (e) => showToast.error(e.message),
  });

  const rows = useMemo(() => data.filter((t) =>
    !search || t.employeeId.includes(search) || t.reason.toLowerCase().includes(search.toLowerCase())
  ), [data, search]);

  return (
    <HrPageShell title="Terminations" subtitle="Exit requests, offboarding checklist, final-pay hooks"
      actionLabel="New Termination" onAction={() => setOpen(true)}
      search={search} onSearchChange={setSearch} loading={isLoading} error={error?.message}>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Employee</th><th className="p-3">Last day</th><th className="p-3">Status</th>
                <th className="p-3">Offboarding</th><th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className={`border-t cursor-pointer ${selected?.id === t.id ? 'bg-green-50' : ''}`} onClick={() => setSelected(t)}>
                  <td className="p-3 font-mono text-xs">{t.employeeId.slice(0, 8)}…</td>
                  <td className="p-3">{t.lastWorkingDate?.slice(0, 10)}</td>
                  <td className="p-3">{t.statusName || t.status}</td>
                  <td className="p-3">{t.offboardingCompleted}/{t.offboardingTotal}</td>
                  <td className="p-3 space-x-1" onClick={(e) => e.stopPropagation()}>
                    {t.status === 'Pending' && (
                      <>
                        <Button size="sm" onClick={() => approveMut.mutate({ id: t.id, rowVersion: t.rowVersion })}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => rejectMut.mutate({ id: t.id, rowVersion: t.rowVersion })}>Reject</Button>
                      </>
                    )}
                    {t.status === 'Approved' && (
                      <Button size="sm" className="bg-green-700 text-white" onClick={() => applyMut.mutate({ id: t.id, rowVersion: t.rowVersion })}>Apply</Button>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No terminations</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Offboarding checklist</h2>
          {!selected && <p className="text-sm text-gray-500">Select a termination to manage checklist / exit notes.</p>}
          {selected && (
            <>
              <p className="text-xs text-gray-600">Settlement: {selected.settlementStatus || '—'} {selected.settlementNotes ? `— ${selected.settlementNotes}` : ''}</p>
              {selected.exitInterviewNotes && (
                <p className="text-sm bg-gray-50 rounded p-2"><span className="font-medium">Exit interview:</span> {selected.exitInterviewNotes}</p>
              )}
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-2 border rounded p-2">
                    <div>
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="text-xs text-gray-500">{task.category} · {task.status}</div>
                    </div>
                    {task.status !== 'Completed' && (
                      <Button size="sm" variant="outline" onClick={() => taskMut.mutate({
                        id: task.id, status: 'Completed', rowVersion: task.rowVersion,
                      })}>Complete</Button>
                    )}
                  </li>
                ))}
                {!tasks.length && <li className="text-sm text-gray-500">No checklist tasks</li>}
              </ul>
            </>
          )}
        </div>
      </div>

      <SimpleModal open={open} title="Create Termination" onClose={() => setOpen(false)} loading={createMut.isPending}
        onSubmit={() => createMut.mutate({
          employeeId: form.employeeId.trim(),
          lastWorkingDate: new Date(form.lastWorkingDate).toISOString(),
          reason: form.reason.trim(),
          terminationType: form.terminationType,
          exitInterviewNotes: form.exitInterviewNotes || null,
          requestFinalPay: true,
          requestLeaveSettlement: true,
          seedDefaultChecklist: true,
        })}>
        <div className="space-y-2"><Label>Employee ID</Label><Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></div>
        <div className="space-y-2"><Label>Last working date</Label><Input type="date" value={form.lastWorkingDate} onChange={(e) => setForm({ ...form, lastWorkingDate: e.target.value })} /></div>
        <div className="space-y-2"><Label>Type</Label><Input value={form.terminationType} onChange={(e) => setForm({ ...form, terminationType: e.target.value })} /></div>
        <div className="space-y-2"><Label>Reason</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
        <div className="space-y-2"><Label>Exit interview notes</Label><Textarea value={form.exitInterviewNotes} onChange={(e) => setForm({ ...form, exitInterviewNotes: e.target.value })} /></div>
      </SimpleModal>
    </HrPageShell>
  );
};

export default TerminationSection;
