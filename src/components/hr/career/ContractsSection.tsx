import React, { useMemo, useState } from 'react';
import { showToast } from '../../../layout/layout';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import HrPageShell from '../shared/HrPageShell';
import SimpleModal from '../shared/SimpleModal';
import { useContracts, useCreateContract, useDeleteContract, useTerminateContract } from '../../../services/hr/career/career.queries';
import type { EmpContractListDto } from '../../../types/hr/career';

const ContractsSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: '', contractType: 'Permanent', startDate: '', endDate: '', notes: '' });
  const { data = [], isLoading, error } = useContracts();
  const createMut = useCreateContract({
    onSuccess: () => { showToast.success('Contract created'); setOpen(false); },
    onError: (e) => showToast.error(e.message),
  });
  const termMut = useTerminateContract({
    onSuccess: () => showToast.success('Contract terminated'),
    onError: (e) => showToast.error(e.message),
  });
  const delMut = useDeleteContract({
    onSuccess: () => showToast.success('Contract deleted'),
    onError: (e) => showToast.error(e.message),
  });

  const rows = useMemo(() => data.filter((c) =>
    !search || c.contractNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    c.statusName?.toLowerCase().includes(search.toLowerCase())
  ), [data, search]);

  const terminate = (c: EmpContractListDto) => {
    const reason = window.prompt('Termination reason');
    if (!reason) return;
    termMut.mutate({ id: c.id, reason, rowVersion: c.rowVersion });
  };

  return (
    <HrPageShell
      title="Contracts" subtitle="Employee contract lifecycle"
      actionLabel="New Contract" onAction={() => setOpen(true)}
      search={search} onSearchChange={setSearch}
      loading={isLoading} error={error?.message}
    >
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Number</th><th className="p-3">Employee</th><th className="p-3">Type</th>
              <th className="p-3">Status</th><th className="p-3">Start</th><th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.contractNumber}</td>
                <td className="p-3 font-mono text-xs">{c.employeeId.slice(0, 8)}…</td>
                <td className="p-3">{c.contractType}</td>
                <td className="p-3">{c.statusName || c.status}</td>
                <td className="p-3">{c.startDate?.slice(0, 10)}</td>
                <td className="p-3 space-x-2">
                  {c.status !== 'Terminated' && (
                    <Button size="sm" variant="outline" onClick={() => terminate(c)}>Terminate</Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => delMut.mutate(c.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No contracts</td></tr>}
          </tbody>
        </table>
      </div>

      <SimpleModal open={open} title="Create Contract" onClose={() => setOpen(false)} loading={createMut.isPending}
        onSubmit={() => createMut.mutate({
          employeeId: form.employeeId.trim(),
          contractType: form.contractType,
          startDate: new Date(form.startDate).toISOString(),
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
          notes: form.notes || null,
          activateImmediately: true,
        })}>
        <div className="space-y-2"><Label>Employee ID</Label><Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></div>
        <div className="space-y-2"><Label>Type</Label><Input value={form.contractType} onChange={(e) => setForm({ ...form, contractType: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Start</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
          <div className="space-y-2"><Label>End</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
        </div>
        <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
      </SimpleModal>
    </HrPageShell>
  );
};

export default ContractsSection;
