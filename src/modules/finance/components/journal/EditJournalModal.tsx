import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';

interface AccountOption {
  id: string;
  code?: string;
  name?: string;
  accountType?: string;
  normalBalance?: string;
}

interface PeriodOption {
  id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  isClosed?: boolean;
}

interface JournalLine {
  id?: string;
  accountId: string;
  accountName?: string;
  accountCode?: string;
  direction: 'Debit' | 'Credit';
  amount: number;
  description?: string;
}

interface JournalEntry {
  id: string;
  reference: string;
  entryDate: string;
  description: string;
  entryType: string;
  periodId?: string;
  branchId?: string | null;
  departmentId?: string | null;
  employeeId?: string | null;
  rowVersion?: string | null;
  isPosted: boolean;
  lines: JournalLine[];
}

interface Props {
  isOpen: boolean;
  entry: JournalEntry | null;
  accounts: AccountOption[];
  periods: PeriodOption[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const toDateInput = (value?: string) => {
  if (!value) return '';
  return value.length >= 10 ? value.slice(0, 10) : value;
};

const toUtcStartOfDay = (date: string) => `${date}T00:00:00.000Z`;

const EditJournalModal: React.FC<Props> = ({ isOpen, entry, accounts, periods, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [description, setDescription] = useState('');
  const [entryType, setEntryType] = useState('General');
  const [periodId, setPeriodId] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([]);

  useEffect(() => {
    if (!entry || !isOpen) return;
    setReference(entry.reference || '');
    setEntryDate(toDateInput(entry.entryDate));
    setDescription(entry.description || '');
    setEntryType(entry.entryType || 'General');
    setPeriodId(entry.periodId || '');
    setLines((entry.lines || []).map(line => ({
      id: line.id,
      accountId: line.accountId,
      accountName: line.accountName,
      accountCode: line.accountCode,
      direction: line.direction === 'Credit' ? 'Credit' : 'Debit',
      amount: Number(line.amount) || 0,
      description: line.description || '',
    })));
    setError('');
  }, [entry, isOpen]);

  const selectedPeriod = useMemo(() => periods.find(p => p.id === periodId), [periods, periodId]);

  const totalDebit = useMemo(
    () => lines.filter(l => l.direction === 'Debit').reduce((sum, l) => sum + (Number(l.amount) || 0), 0),
    [lines],
  );
  const totalCredit = useMemo(
    () => lines.filter(l => l.direction === 'Credit').reduce((sum, l) => sum + (Number(l.amount) || 0), 0),
    [lines],
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.005;

  const updateLine = (index: number, patch: Partial<JournalLine>) => {
    setLines(current => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const selectAccount = (index: number, accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    updateLine(index, {
      accountId,
      accountCode: account?.code,
      accountName: account?.name,
    });
  };

  const addLine = () => {
    setLines(current => [...current, {
      accountId: '',
      direction: 'Debit',
      amount: 0,
      description: description,
    }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(current => current.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!reference.trim()) return 'Reference is required.';
    if (!entryDate) return 'Entry date is required.';
    if (!periodId) return 'Financial period is required.';
    if (selectedPeriod?.isClosed) return 'Cannot edit an entry in a closed period.';
    if (selectedPeriod?.startDate && entryDate < toDateInput(selectedPeriod.startDate)) {
      return `Entry date must be on or after ${toDateInput(selectedPeriod.startDate)}.`;
    }
    if (selectedPeriod?.endDate && entryDate > toDateInput(selectedPeriod.endDate)) {
      return `Entry date must be on or before ${toDateInput(selectedPeriod.endDate)}.`;
    }
    if (lines.length < 2) return 'A journal entry must contain at least two lines.';
    if (lines.some(line => !line.accountId)) return 'Every line must have an account.';
    if (lines.some(line => Number(line.amount) <= 0)) return 'Every line amount must be greater than zero.';
    if (!isBalanced) return 'Total debit must equal total credit.';
    return '';
  };

  const handleSave = async () => {
    if (!entry) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({
        id: entry.id,
        reference: reference.trim(),
        entryDate: toUtcStartOfDay(entryDate),
        description: description.trim(),
        entryType: entryType || 'General',
        periodId,
        branchId: entry.branchId || null,
        departmentId: entry.departmentId || null,
        employeeId: entry.employeeId || null,
        rowVersion: entry.rowVersion || '',
        lines: lines.map(line => ({
          id: line.id,
          accountId: line.accountId,
          direction: line.direction,
          amount: Number(line.amount),
          description: line.description?.trim() || '',
        })),
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update journal entry.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Pencil size={20} className="text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Edit Journal Entry</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">{entry.reference} · Draft / Unposted</p>
          </div>
          <button onClick={onClose} disabled={saving} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Label>Reference *</Label>
              <Input value={reference} onChange={e => setReference(e.target.value)} disabled={saving} />
            </div>
            <div>
              <Label>Entry Date *</Label>
              <Input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} disabled={saving} />
            </div>
            <div>
              <Label>Entry Type</Label>
              <Input value={entryType} onChange={e => setEntryType(e.target.value)} disabled={saving} />
            </div>
            <div>
              <Label>Financial Period *</Label>
              <select value={periodId} onChange={e => setPeriodId(e.target.value)} disabled={saving} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select period</option>
                {periods.map(period => (
                  <option key={period.id} value={period.id} disabled={period.isClosed}>
                    {period.name || period.id}{period.isClosed ? ' (Closed)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} disabled={saving} rows={2} />
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
              <div>
                <h3 className="font-semibold text-gray-900">Journal Lines</h3>
                <p className="text-xs text-gray-500">Existing line IDs are preserved during update.</p>
              </div>
              <Button variant="outline" size="sm" onClick={addLine} disabled={saving}>
                <Plus size={15} className="mr-1" /> Add Line
              </Button>
            </div>

            <div className="divide-y">
              {lines.map((line, index) => (
                <div key={line.id || `new-${index}`} className="grid grid-cols-1 gap-3 p-4 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <Label>Account *</Label>
                    <select value={line.accountId} onChange={e => selectAccount(index, e.target.value)} disabled={saving} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                      <option value="">Select account</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code ? `${account.code} - ` : ''}{account.name || account.id}
                          {account.normalBalance ? ` (${account.normalBalance})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Direction *</Label>
                    <select value={line.direction} onChange={e => updateLine(index, { direction: e.target.value as 'Debit' | 'Credit' })} disabled={saving} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                      <option value="Debit">Debit</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Amount *</Label>
                    <Input type="number" min="0" step="0.01" value={line.amount} onChange={e => updateLine(index, { amount: Number(e.target.value) || 0 })} disabled={saving} />
                  </div>
                  <div className="md:col-span-3">
                    <Label>Description</Label>
                    <Input value={line.description || ''} onChange={e => updateLine(index, { description: e.target.value })} disabled={saving} />
                  </div>
                  <div className="flex items-end justify-end md:col-span-1">
                    <button onClick={() => removeLine(index)} disabled={saving || lines.length <= 2} className="rounded p-2 text-red-500 hover:bg-red-50 disabled:opacity-30" title="Remove line">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs uppercase text-gray-500">Total Debit</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs uppercase text-gray-500">Total Credit</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div className={`rounded-lg p-4 ${isBalanced ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-xs uppercase text-gray-500">Balance Check</div>
              <div className={`mt-1 font-semibold ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                {isBalanced ? 'Balanced' : `Difference: ${Math.abs(totalDebit - totalCredit).toFixed(2)}`}
              </div>
            </div>
          </div>

          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !isBalanced}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </div>
    </div>
  );
};

export default EditJournalModal;
