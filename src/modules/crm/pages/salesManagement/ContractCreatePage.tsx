import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModulePageShell } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { createContract } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';

export default function ContractCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    partyName: '',
    value: 0,
    startDate: '',
    endDate: '',
    terms: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast.error('Contract title is required');
      return;
    }
    try {
      setSaving(true);
      await createContract({
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      } as any);
      showToast.success('Contract created');
      navigate('/crm/sales/contracts');
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to create contract');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModulePageShell title="Create contract" subtitle="Draft a new customer contract.">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="party">Counterparty</Label>
          <Input
            id="party"
            value={form.partyName}
            onChange={(e) => setForm((f) => ({ ...f, partyName: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Contract value</Label>
          <Input
            id="value"
            type="number"
            min={0}
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) || 0 }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start">Start date</Label>
            <Input
              id="start"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">End date</Label>
            <Input
              id="end"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="terms">Terms</Label>
          <Textarea
            id="terms"
            rows={4}
            value={form.terms}
            onChange={(e) => setForm((f) => ({ ...f, terms: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? 'Saving…' : 'Create contract'}
          </Button>
        </div>
      </form>
    </ModulePageShell>
  );
}
