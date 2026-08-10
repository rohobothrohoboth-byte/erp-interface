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
import { createOrder } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';

export default function OrderCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    orderNumber: '',
    customerName: '',
    amount: 0,
    priority: 'Medium',
    expectedDelivery: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      showToast.error('Customer name is required');
      return;
    }
    try {
      setSaving(true);
      await createOrder({
        ...form,
        expectedDelivery: form.expectedDelivery
          ? new Date(form.expectedDelivery).toISOString()
          : undefined,
      });
      showToast.success('Order created');
      navigate('/crm/sales/orders');
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModulePageShell title="Create order" subtitle="Enter sales order details.">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order number</Label>
            <Input
              id="orderNumber"
              value={form.orderNumber}
              onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))}
              placeholder="Auto if blank"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer">Customer *</Label>
          <Input
            id="customer"
            required
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
            <Label htmlFor="delivery">Expected delivery</Label>
            <Input
              id="delivery"
              type="date"
              value={form.expectedDelivery}
              onChange={(e) => setForm((f) => ({ ...f, expectedDelivery: e.target.value }))}
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
            {saving ? 'Saving…' : 'Create order'}
          </Button>
        </div>
      </form>
    </ModulePageShell>
  );
}
