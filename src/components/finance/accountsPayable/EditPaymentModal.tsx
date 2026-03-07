import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Upload } from 'lucide-react';
import type { PaymentEntry } from './types';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    external_bank_ref: string;
    payment_date: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';
    bank_account_id: string;
    attachment_url?: string;
  }) => void;
  payment: PaymentEntry | null;
}

export default function EditPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  payment
}: EditPaymentModalProps) {
  const [externalBankRef, setExternalBankRef] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr'>('Bank_Transfer');
  const [bankAccount, setBankAccount] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const bankAccounts = [
    { id: 'bank-1', name: 'Commercial Bank - Main Account', gl_code: '1010-001' },
    { id: 'bank-2', name: 'Awash Bank - Operations', gl_code: '1010-002' },
    { id: 'bank-3', name: 'Cash on Hand', gl_code: '1001-001' }
  ];

  useEffect(() => {
    if (payment) {
      setExternalBankRef(payment.external_bank_ref);
      setPaymentDate(payment.payment_date);
      setPaymentMethod(payment.payment_method);
      setBankAccount(payment.bank_account_id);
      setAttachmentUrl(payment.attachment_url || '');
    }
  }, [payment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!externalBankRef || !paymentDate || !paymentMethod || !bankAccount) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      external_bank_ref: externalBankRef,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      bank_account_id: bankAccount,
      attachment_url: attachmentUrl || undefined
    });
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit Payment Entry - {payment.internal_pv_no}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Note: You can only edit payment details. Invoice selections cannot be modified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankRef">Bank Reference Number *</Label>
              <Input
                id="bankRef"
                value={externalBankRef}
                onChange={(e) => setExternalBankRef(e.target.value)}
                placeholder="Enter bank reference/check number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank_Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Telebirr">Telebirr</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank/Cash Account *</Label>
              <Select value={bankAccount} onValueChange={setBankAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.gl_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="attachment">Attachment URL (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="attachment"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="Enter attachment URL"
                />
                <Button type="button" variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Update Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
