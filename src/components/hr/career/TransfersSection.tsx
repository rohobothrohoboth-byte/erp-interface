import React, { useMemo, useState } from 'react';
import { showToast } from '../../../layout/layout';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import HrPageShell from '../shared/HrPageShell';
import SimpleModal from '../shared/SimpleModal';
import { useCreateTransfer, useTransferDecision, useTransfers } from '../../../services/hr/career/career.queries';
import type { EmpTransferListDto } from '../../../types/hr/career';

const TransfersSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: '', effectiveDate: '', toDepartmentId: '', toPositionId: '', reason: '',
  });
  const { data = [], isLoading, error } = useTransfers();
  const createMut = useCreateTransfer({
    onSuccess: () => { showToast.success('Transfer requested'); setOpen(false); },
    onError: (e) => showToast.error(e.message),
  });
  const approveMut = useTransferDecision('approve', { onSuccess: () => showToast.success('Approved'), onError: (e) => showToast.error(e.message) });
  const rejectMut = useTransferDecision('reject', { onSuccess: () => showToast.success('Rejected'), onError: (e) => showToast.error(e.message) });
  const applyMut = useTransferDecision('apply', { onSuccess: () => showToast.success('Applied'), onError: (e) => showToast.error(e.message) });

  const rows = useMemo(() => data.filter((t) =>
    !search || t.employeeId.includes(search) || (t.statusName || t.status).toLowerCase().includes(search.toLowerCase())
  ), [data, search]);

  const decide = (t: EmpTransferListDto, action: 'approve' | 'reject' | 'apply') => {
    const payload = { id: t.id, rowVersion: t.rowVersion };
    if (action === 'approve') approveMut.mutate(payload);
    else if (action === 'reject') rejectMut.mutate(payload);
    else applyMut.mutate(payload);
  };

  return (
    <HrPageShell title="Transfers" subtitle="Department / position transfers"
      actionLabel="Request Transfer" onAction={() => setOpen(true)}
      search={search} onSearchChange={setSearch} loading={isLoading} error={error?.message}>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="p-3">Employee</th><th className="p-3">Effective</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3 font-mono text-xs">{t.employeeId}</td>
                <td className="p-3">{t.effectiveDate?.slice(0, 10)}</td>
                <td className="p-3">{t.statusName || t.status}</td>
                <td className="p-3 space-x-2">
                  {t.status === 'Pending' && (
                    <>
                      <Button size="sm" onClick={() => decide(t, 'approve')}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => decide(t, 'reject')}>Reject</Button>
                    </>
                  )}
                  {t.status === 'Approved' && (
                    <Button size="sm" className="bg-green-700 text-white" onClick={() => decide(t, 'apply')}>Apply</Button>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No transfers</td></tr>}
          </tbody>
        </table>
      </div>

      <SimpleModal open={open} title="Request Transfer" onClose={() => setOpen(false)} loading={createMut.isPending}
        onSubmit={() => createMut.mutate({
          employeeId: form.employeeId.trim(),
          effectiveDate: new Date(form.effectiveDate).toISOString(),
          toDepartmentId: form.toDepartmentId.trim(),
          toPositionId: form.toPositionId.trim(),
          reason: form.reason || null,
        })}>
        <div className="space-y-2"><Label>Employee ID</Label><Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></div>
        <div className="space-y-2"><Label>To Department ID</Label><Input value={form.toDepartmentId} onChange={(e) => setForm({ ...form, toDepartmentId: e.target.value })} /></div>
        <div className="space-y-2"><Label>To Position ID</Label><Input value={form.toPositionId} onChange={(e) => setForm({ ...form, toPositionId: e.target.value })} /></div>
        <div className="space-y-2"><Label>Effective Date</Label><Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} /></div>
        <div className="space-y-2"><Label>Reason</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
      </SimpleModal>
    </HrPageShell>
  );
};

export default TransfersSection;
