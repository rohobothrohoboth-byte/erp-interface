import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Pencil } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export interface AccountFormValue {
  id?: string;
  code: string;
  name: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  normalBalance: 'Debit' | 'Credit';
  accountSubType?: string;
  description?: string;
  openingBalance: number;
  isActive: boolean;
}

interface Props {
  isOpen: boolean;
  account?: Partial<AccountFormValue> | null;
  onClose: () => void;
  onSave: (value: AccountFormValue) => Promise<void>;
}

const defaultNormalBalance = (type: AccountFormValue['accountType']): AccountFormValue['normalBalance'] => {
  return type === 'Asset' || type === 'Expense' ? 'Debit' : 'Credit';
};

const AccountFormModal: React.FC<Props> = ({ isOpen, account, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<AccountFormValue>({
    code: '',
    name: '',
    accountType: 'Asset',
    normalBalance: 'Debit',
    accountSubType: '',
    description: '',
    openingBalance: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!isOpen) return;
    const type = (account?.accountType as AccountFormValue['accountType']) || 'Asset';
    setForm({
      id: account?.id,
      code: account?.code || '',
      name: account?.name || '',
      accountType: type,
      normalBalance: account?.normalBalance === 'Credit' || account?.normalBalance === 'Debit'
        ? account.normalBalance
        : defaultNormalBalance(type),
      accountSubType: account?.accountSubType || '',
      description: account?.description || '',
      openingBalance: Number(account?.openingBalance) || 0,
      isActive: account?.isActive !== false,
    });
    setError('');
  }, [account, isOpen]);

  const isEdit = Boolean(account?.id);

  const normalBalanceExplanation = useMemo(
    () => `${form.accountType} accounts normally carry a ${form.normalBalance.toLowerCase()} balance.`,
    [form.accountType, form.normalBalance],
  );

  const changeType = (accountType: AccountFormValue['accountType']) => {
    setForm(current => ({
      ...current,
      accountType,
      normalBalance: defaultNormalBalance(accountType),
    }));
  };

  const handleSave = async () => {
    if (!form.code.trim()) return setError('Account code is required.');
    if (!/^\d+$/.test(form.code.trim())) return setError('Account code should contain only numbers.');
    if (!form.name.trim()) return setError('Account name is required.');
    if (form.openingBalance < 0) return setError('Opening balance cannot be negative.');

    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, code: form.code.trim(), name: form.name.trim() });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save account.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            {isEdit ? <Pencil size={19} className="text-indigo-600" /> : <Plus size={19} className="text-indigo-600" />}
            <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Account' : 'Add Account'}</h2>
          </div>
          <button onClick={onClose} disabled={saving} className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X size={21} /></button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <div>
            <Label>Account Code *</Label>
            <Input value={form.code} onChange={e => setForm(v => ({ ...v, code: e.target.value }))} disabled={saving} placeholder="1001" />
          </div>
          <div>
            <Label>Account Name *</Label>
            <Input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} disabled={saving} placeholder="Cash / Bank" />
          </div>
          <div>
            <Label>Account Type *</Label>
            <select value={form.accountType} onChange={e => changeType(e.target.value as AccountFormValue['accountType'])} disabled={saving} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
              <option value="Equity">Equity</option>
              <option value="Revenue">Revenue</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          <div>
            <Label>Normal Balance *</Label>
            <select value={form.normalBalance} onChange={e => setForm(v => ({ ...v, normalBalance: e.target.value as 'Debit' | 'Credit' }))} disabled={saving} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="Debit">Debit</option>
              <option value="Credit">Credit</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">{normalBalanceExplanation}</p>
          </div>
          <div>
            <Label>Account Sub Type</Label>
            <Input value={form.accountSubType || ''} onChange={e => setForm(v => ({ ...v, accountSubType: e.target.value }))} disabled={saving} />
          </div>
          <div>
            <Label>Opening Balance</Label>
            <Input type="number" min="0" step="0.01" value={form.openingBalance} onChange={e => setForm(v => ({ ...v, openingBalance: Number(e.target.value) || 0 }))} disabled={saving} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <textarea value={form.description || ''} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} disabled={saving} rows={3} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(v => ({ ...v, isActive: e.target.checked }))} disabled={saving} />
            Active account
          </label>
        </div>

        {error && <div className="mx-6 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Account'}</Button>
        </div>
      </div>
    </div>
  );
};

export default AccountFormModal;
