import React, { useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';

interface Account { id: string; code?: string; name?: string; normalBalance?: string; }
interface Period { id: string; name?: string; startDate?: string; endDate?: string; isClosed?: boolean; }
interface Line { accountId: string; direction: 'Debit' | 'Credit'; amount: number; description: string; }

interface Props {
  isOpen: boolean;
  accounts: Account[];
  periods: Period[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

const CreateJournalModal: React.FC<Props> = ({ isOpen, accounts, periods, onClose, onSave }) => {
  const [reference, setReference] = useState('');
  const [entryDate, setEntryDate] = useState(today());
  const [description, setDescription] = useState('');
  const [entryType, setEntryType] = useState('General');
  const [periodId, setPeriodId] = useState('');
  const [lines, setLines] = useState<Line[]>([
    { accountId: '', direction: 'Debit', amount: 0, description: '' },
    { accountId: '', direction: 'Credit', amount: 0, description: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const debit = useMemo(() => lines.filter(l => l.direction === 'Debit').reduce((s, l) => s + Number(l.amount || 0), 0), [lines]);
  const credit = useMemo(() => lines.filter(l => l.direction === 'Credit').reduce((s, l) => s + Number(l.amount || 0), 0), [lines]);
  const balanced = Math.abs(debit - credit) < 0.005;

  if (!isOpen) return null;

  const updateLine = (index: number, patch: Partial<Line>) => setLines(current => current.map((line, i) => i === index ? { ...line, ...patch } : line));
  const addLine = () => setLines(current => [...current, { accountId: '', direction: 'Debit', amount: 0, description: '' }]);
  const removeLine = (index: number) => { if (lines.length > 2) setLines(current => current.filter((_, i) => i !== index)); };

  const reset = () => {
    setReference(''); setEntryDate(today()); setDescription(''); setEntryType('General'); setPeriodId('');
    setLines([{ accountId: '', direction: 'Debit', amount: 0, description: '' }, { accountId: '', direction: 'Credit', amount: 0, description: '' }]);
    setError('');
  };

  const save = async () => {
    if (!reference.trim()) return setError('Reference is required.');
    if (!entryDate) return setError('Entry date is required.');
    if (!periodId) return setError('Financial period is required.');
    if (lines.some(l => !l.accountId)) return setError('Every line must have an account.');
    if (lines.some(l => Number(l.amount) <= 0)) return setError('Every line amount must be greater than zero.');
    if (!balanced) return setError('Total debit must equal total credit.');

    setSaving(true); setError('');
    try {
      await onSave({
        reference: reference.trim(),
        entryDate: `${entryDate}T00:00:00.000Z`,
        description: description.trim(),
        entryType: entryType || 'General',
        periodId,
        totalDebit: debit,
        totalCredit: credit,
        lines: lines.map(line => ({ ...line, amount: Number(line.amount) })),
      });
      reset();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create journal entry.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div><h2 className="text-xl font-bold text-gray-900">New Journal Entry</h2><p className="text-sm text-gray-500">Create an unposted draft journal entry</p></div>
          <button onClick={onClose} disabled={saving} className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X size={21} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div><Label>Reference *</Label><Input value={reference} onChange={e => setReference(e.target.value)} disabled={saving} placeholder="JE-0013" /></div>
            <div><Label>Entry Date *</Label><Input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} disabled={saving} /></div>
            <div><Label>Entry Type</Label><Input value={entryType} onChange={e => setEntryType(e.target.value)} disabled={saving} /></div>
            <div><Label>Financial Period *</Label><select value={periodId} onChange={e => setPeriodId(e.target.value)} disabled={saving} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="">Select period</option>{periods.map(p => <option key={p.id} value={p.id} disabled={p.isClosed}>{p.name || p.id}{p.isClosed ? ' (Closed)' : ''}</option>)}</select></div>
            <div className="md:col-span-4"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} disabled={saving} rows={2} /></div>
          </div>

          <div className="mt-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3"><div><h3 className="font-semibold">Journal Lines</h3><p className="text-xs text-gray-500">Select an account and enter either debit or credit.</p></div><Button variant="outline" size="sm" onClick={addLine} disabled={saving}><Plus size={15} className="mr-1" /> Add Line</Button></div>
            <div className="divide-y">{lines.map((line, index) => <div key={index} className="grid grid-cols-1 gap-3 p-4 md:grid-cols-12">
              <div className="md:col-span-4"><Label>Account *</Label><select value={line.accountId} onChange={e => updateLine(index, { accountId: e.target.value })} disabled={saving} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="">Select account</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.code ? `${a.code} - ` : ''}{a.name || a.id}{a.normalBalance ? ` (${a.normalBalance})` : ''}</option>)}</select></div>
              <div className="md:col-span-2"><Label>Direction *</Label><select value={line.direction} onChange={e => updateLine(index, { direction: e.target.value as 'Debit' | 'Credit' })} disabled={saving} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="Debit">Debit</option><option value="Credit">Credit</option></select></div>
              <div className="md:col-span-2"><Label>Amount *</Label><Input type="number" min="0" step="0.01" value={line.amount} onChange={e => updateLine(index, { amount: Number(e.target.value) || 0 })} disabled={saving} /></div>
              <div className="md:col-span-3"><Label>Description</Label><Input value={line.description} onChange={e => updateLine(index, { description: e.target.value })} disabled={saving} /></div>
              <div className="flex items-end justify-end md:col-span-1"><button onClick={() => removeLine(index)} disabled={saving || lines.length <= 2} className="rounded p-2 text-red-500 hover:bg-red-50 disabled:opacity-30"><Trash2 size={17} /></button></div>
            </div>)}</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3"><div className="rounded-lg bg-gray-50 p-4"><div className="text-xs uppercase text-gray-500">Debit</div><div className="font-semibold">{debit.toFixed(2)}</div></div><div className="rounded-lg bg-gray-50 p-4"><div className="text-xs uppercase text-gray-500">Credit</div><div className="font-semibold">{credit.toFixed(2)}</div></div><div className={`rounded-lg p-4 ${balanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}><div className="text-xs uppercase">Balance</div><div className="font-semibold">{balanced ? 'Balanced' : `Difference ${Math.abs(debit - credit).toFixed(2)}`}</div></div></div>
          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-4"><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving || !balanced}>{saving ? 'Saving...' : 'Create Draft'}</Button></div>
      </div>
    </div>
  );
};

export default CreateJournalModal;
