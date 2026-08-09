import React, { useMemo, useState } from 'react';
import { showToast } from '../../../layout/layout';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import HrPageShell from '../shared/HrPageShell';
import SimpleModal from '../shared/SimpleModal';
import { useCreateJobOffer, useJobOfferAction, useJobOffers } from '../../../services/hr/jobOffer/jobOffer.queries';

const JobOfferSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ jobApplicationId: '', offeredSalary: '', currency: 'ETB', startDate: '', notes: '' });
  const { data = [], isLoading, error } = useJobOffers();
  const createMut = useCreateJobOffer({
    onSuccess: () => { showToast.success('Offer created'); setOpen(false); },
    onError: (e) => showToast.error(e.message),
  });
  const submitMut = useJobOfferAction('submit', { onSuccess: () => showToast.success('Submitted'), onError: (e) => showToast.error(e.message) });
  const approveMut = useJobOfferAction('approve', { onSuccess: () => showToast.success('Approved'), onError: (e) => showToast.error(e.message) });
  const acceptMut = useJobOfferAction('accept', { onSuccess: () => showToast.success('Accepted'), onError: (e) => showToast.error(e.message) });
  const hireMut = useJobOfferAction('hire', { onSuccess: () => showToast.success('Hired — employee created'), onError: (e) => showToast.error(e.message) });

  const rows = useMemo(() => data.filter((o) =>
    !search || String(o.jobApplicationId || '').includes(search) || String(o.status || '').toLowerCase().includes(search.toLowerCase())
  ), [data, search]);

  return (
    <HrPageShell title="Job Offers" subtitle="Offer → accept → hire into Profile"
      actionLabel="New Offer" onAction={() => setOpen(true)}
      search={search} onSearchChange={setSearch} loading={isLoading} error={error?.message}>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Application</th><th className="p-3">Salary</th><th className="p-3">Status</th><th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-mono text-xs">{String(o.jobApplicationId).slice(0, 8)}…</td>
                <td className="p-3">{o.offeredSalary ?? '—'} {o.currency || ''}</td>
                <td className="p-3">{String(o.statusName || o.status)}</td>
                <td className="p-3 space-x-1">
                  <Button size="sm" variant="outline" onClick={() => submitMut.mutate({ id: o.id })}>Submit</Button>
                  <Button size="sm" onClick={() => approveMut.mutate({ id: o.id, rowVersion: o.rowVersion })}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => acceptMut.mutate({ id: o.id, rowVersion: o.rowVersion })}>Accept</Button>
                  <Button size="sm" className="bg-green-700 text-white" onClick={() => hireMut.mutate({ id: o.id, rowVersion: o.rowVersion })}>Hire</Button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No offers</td></tr>}
          </tbody>
        </table>
      </div>

      <SimpleModal open={open} title="Create Job Offer" onClose={() => setOpen(false)} loading={createMut.isPending}
        onSubmit={() => createMut.mutate({
          jobApplicationId: form.jobApplicationId.trim(),
          offeredSalary: form.offeredSalary ? Number(form.offeredSalary) : null,
          currency: form.currency,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
          notes: form.notes || null,
        })}>
        <div className="space-y-2"><Label>Job Application ID</Label><Input value={form.jobApplicationId} onChange={(e) => setForm({ ...form, jobApplicationId: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Salary</Label><Input value={form.offeredSalary} onChange={(e) => setForm({ ...form, offeredSalary: e.target.value })} /></div>
          <div className="space-y-2"><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
        </div>
        <div className="space-y-2"><Label>Start date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
        <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
      </SimpleModal>
    </HrPageShell>
  );
};

export default JobOfferSection;
