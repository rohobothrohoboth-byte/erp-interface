import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModulePageShell } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { createQuote } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';

export default function QuotationCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    customerName: '',
    amount: 0,
    validUntil: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast.error('Quote title is required');
      return;
    }
    try {
      setSaving(true);
      await createQuote({
        ...form,
        validUntil: form.validUntil
          ? new Date(form.validUntil).toISOString()
          : undefined,
      });
      showToast.success('Quote created');
      navigate('/crm/sales/quotes');
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to create quote');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModulePageShell
      title="Create quote"
      subtitle="Prepare a new quotation for a customer."
    >
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
          <Label htmlFor="customer">Customer</Label>
          <Input
            id="customer"
            value={form.customerName}
            onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valid">Valid until</Label>
            <Input
              id="valid"
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={4}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? 'Saving…' : 'Create quote'}
          </Button>
        </div>
      </form>
    </ModulePageShell>
  );
}
