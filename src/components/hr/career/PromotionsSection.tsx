import React, { useMemo, useState } from 'react';
import { showToast } from '../../../layout/layout';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import HrPageShell from '../shared/HrPageShell';
import SimpleModal from '../shared/SimpleModal';
import { useCreatePromotion, usePromotionDecision, usePromotions } from '../../../services/hr/career/career.queries';
import type { EmpPromotionListDto } from '../../../types/hr/career';

const PromotionsSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: '', effectiveDate: '', toJobGradeId: '', toPositionId: '', toDepartmentId: '', reason: '',
  });
  const { data = [], isLoading, error } = usePromotions();
  const createMut = useCreatePromotion({
    onSuccess: () => { showToast.success('Promotion requested'); setOpen(false); },
    onError: (e) => showToast.error(e.message),
  });
  const approveMut = usePromotionDecision('approve', { onSuccess: () => showToast.success('Approved'), onError: (e) => showToast.error(e.message) });
  const rejectMut = usePromotionDecision('reject', { onSuccess: () => showToast.success('Rejected'), onError: (e) => showToast.error(e.message) });
  const applyMut = usePromotionDecision('apply', { onSuccess: () => showToast.success('Applied'), onError: (e) => showToast.error(e.message) });

  const rows = useMemo(() => data.filter((p) =>
    !search || p.employeeId.includes(search) || (p.statusName || p.status).toLowerCase().includes(search.toLowerCase())
  ), [data, search]);

  const decide = (p: EmpPromotionListDto, action: 'approve' | 'reject' | 'apply') => {
    const payload = { id: p.id, rowVersion: p.rowVersion };
    if (action === 'approve') approveMut.mutate(payload);
    else if (action === 'reject') rejectMut.mutate(payload);
    else applyMut.mutate(payload);
  };

  return (
    <HrPageShell title="Promotions" subtitle="Approve and apply employee promotions"
      actionLabel="Request Promotion" onAction={() => setOpen(true)}
      search={search} onSearchChange={setSearch} loading={isLoading} error={error?.message}>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="p-3">Employee</th><th className="p-3">Effective</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-mono text-xs">{p.employeeId}</td>
                <td className="p-3">{p.effectiveDate?.slice(0, 10)}</td>
                <td className="p-3">{p.statusName || p.status}</td>
                <td className="p-3 space-x-2">
                  {p.status === 'Pending' && (
                    <>
                      <Button size="sm" onClick={() => decide(p, 'approve')}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => decide(p, 'reject')}>Reject</Button>
                    </>
                  )}
                  {p.status === 'Approved' && (
                    <Button size="sm" className="bg-green-700 text-white" onClick={() => decide(p, 'apply')}>Apply</Button>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No promotions</td></tr>}
          </tbody>
        </table>
      </div>

      <SimpleModal open={open} title="Request Promotion" onClose={() => setOpen(false)} loading={createMut.isPending}
        onSubmit={() => createMut.mutate({
          employeeId: form.employeeId.trim(),
          effectiveDate: new Date(form.effectiveDate).toISOString(),
          toJobGradeId: form.toJobGradeId.trim(),
          toPositionId: form.toPositionId.trim(),
          toDepartmentId: form.toDepartmentId.trim(),
          reason: form.reason || null,
        })}>
        {(['employeeId', 'toJobGradeId', 'toPositionId', 'toDepartmentId'] as const).map((k) => (
          <div key={k} className="space-y-2">
            <Label>{k}</Label>
            <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </div>
        ))}
        <div className="space-y-2"><Label>Effective Date</Label><Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} /></div>
        <div className="space-y-2"><Label>Reason</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
      </SimpleModal>
    </HrPageShell>
  );
};

export default PromotionsSection;
