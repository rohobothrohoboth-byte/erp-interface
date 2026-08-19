import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModulePageShell } from '@/shared/components/ModulePageShell';
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
import { createOpportunity } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';

export default function OpportunityCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    stage: 'Discovery',
    amount: 0,
    winProbability: 50,
    expectedCloseDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast.error('Opportunity name is required');
      return;
    }
    try {
      setSaving(true);
      await createOpportunity({
        ...form,
        expectedCloseDate: form.expectedCloseDate
          ? new Date(form.expectedCloseDate).toISOString()
          : undefined,
      });
      showToast.success('Opportunity created');
      navigate('/crm/sales/opportunities');
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to create opportunity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModulePageShell
      title="Create opportunity"
      subtitle="Capture a new sales opportunity in the pipeline."
      onRefresh={() => navigate('/crm/sales/opportunities')}
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Opportunity name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Select value={form.stage} onValueChange={(v) => setForm((f) => ({ ...f, stage: v }))}>
            <SelectTrigger id="stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'ClosedWon', 'ClosedLost'].map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
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
            <Label htmlFor="win">Win probability (%)</Label>
            <Input
              id="win"
              type="number"
              min={0}
              max={100}
              value={form.winProbability}
              onChange={(e) =>
                setForm((f) => ({ ...f, winProbability: Number(e.target.value) || 0 }))
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="close">Expected close date</Label>
          <Input
            id="close"
            type="date"
            value={form.expectedCloseDate}
            onChange={(e) => setForm((f) => ({ ...f, expectedCloseDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? 'Saving…' : 'Create opportunity'}
          </Button>
        </div>
      </form>
    </ModulePageShell>
  );
}
