// src/components/finance/accountsPayable/EditPaymentModal.tsx

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  Banknote, Calendar, FileText, Wallet, Phone, CreditCard,
  PenBox, AlertCircle, Save, RefreshCw, Calendar as CalendarIcon
} from 'lucide-react';
import { showToast } from '../../../layout/layout';
import type { PaymentEntry } from './types';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    external_bank_ref: string;
    payment_date: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';
    bank_account_id: string;
    periodId?: string;  // ✅ Added
  }) => void;
  payment: PaymentEntry | null;
  bankAccounts?: { id: string; name: string; accountNumber?: string; bankName?: string; currentBalance?: number }[];
  periods?: any[];  // ✅ Added
}

export default function EditPaymentModal({
                                           isOpen,
                                           onClose,
                                           onSubmit,
                                           payment,
                                           bankAccounts = [],
                                           periods = []
                                         }: EditPaymentModalProps) {
  const [externalBankRef, setExternalBankRef] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr'>('Bank_Transfer');
  const [bankAccount, setBankAccount] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');  // ✅ Added
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (payment) {
      setExternalBankRef(payment.external_bank_ref || payment.reference || '');
      setPaymentDate(payment.payment_date || '');
      setPaymentMethod(payment.payment_method || 'Bank_Transfer');
      setBankAccount(payment.bank_account_id || '');
      // ✅ Set period from payment
      setSelectedPeriodId(payment.periodId || '');
    }
  }, [payment]);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash': return <Wallet className="h-4 w-4" />;
      case 'Bank_Transfer': return <Banknote className="h-4 w-4" />;
      case 'Check': return <FileText className="h-4 w-4" />;
      case 'Telebirr': return <Phone className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate Period
    if (!selectedPeriodId) {
      showToast?.error('Financial Period is required');
      return;
    }

    // ✅ Validate period is open
    const selectedPeriod = periods.find(p => p.id === selectedPeriodId);
    if (selectedPeriod?.isClosed) {
      showToast?.error('Selected period is closed. Cannot update payment in a closed period.');
      return;
    }

    // ✅ Validate payment date is within period range
    if (selectedPeriod && paymentDate) {
      const date = new Date(paymentDate);
      const startDate = new Date(selectedPeriod.startDate);
      const endDate = new Date(selectedPeriod.endDate);

      date.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (date < startDate || date > endDate) {
        showToast?.error(`Payment date must be between ${selectedPeriod.startDate.split('T')[0]} and ${selectedPeriod.endDate.split('T')[0]}`);
        return;
      }
    }

    if (!externalBankRef) {
      showToast?.error('Bank reference is required');
      return;
    }
    if (!paymentDate) {
      showToast?.error('Payment date is required');
      return;
    }
    if (!paymentMethod) {
      showToast?.error('Payment method is required');
      return;
    }
    if (paymentMethod !== 'Cash' && !bankAccount) {
      showToast?.error('Bank account is required');
      return;
    }

    // ✅ Check balance if not cash
    if (paymentMethod !== 'Cash' && bankAccount) {
      const selectedAccount = bankAccounts.find(a => a.id === bankAccount);
      const amount = payment?.amount || 0;
      if (selectedAccount && selectedAccount.currentBalance !== undefined && selectedAccount.currentBalance < amount) {
        showToast?.error(`Insufficient balance in selected account. Available: ${formatCurrency(selectedAccount.currentBalance)}, Required: ${formatCurrency(amount)}`);
        return;
      }
    }

    setLoading(true);

    onSubmit({
      external_bank_ref: externalBankRef,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      bank_account_id: paymentMethod === 'Cash' ? 'cash-account' : bankAccount,
      periodId: selectedPeriodId,  // ✅ Include PeriodId
    });

    setLoading(false);
  };

  if (!payment) return null;

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <PenBox className="h-5 w-5 text-indigo-600" />
              </div>
              Edit Payment
            </DialogTitle>
            <DialogDescription>
              Update payment details. Period and invoice selections are tracked for audit purposes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                You can only edit payment details. Invoice selections cannot be modified.
              </p>
            </div>

            {/* ✅ Period Selection - Added */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Financial Period <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                <SelectTrigger className="h-10">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Select period" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {periods.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No periods found</div>
                  ) : (
                      periods.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            <div className="flex items-center gap-2">
                              <span>{period.name}</span>
                              {period.isClosed ? (
                                  <span className="text-xs text-red-500">🔒 Closed</span>
                              ) : (
                                  <span className="text-xs text-green-500">🔓 Open</span>
                              )}
                            </div>
                          </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {selectedPeriodId && periods.find(p => p.id === selectedPeriodId)?.isClosed && (
                  <p className="text-xs text-red-500">⚠️ This period is closed. Cannot update payments.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Reference Number <span className="text-red-500">*</span>
                </Label>
                <Input
                    value={externalBankRef}
                    onChange={(e) => setExternalBankRef(e.target.value)}
                    placeholder="Enter bank reference"
                    className="h-10"
                    required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Payment Date <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-10"
                    required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger className="h-10">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(paymentMethod)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-emerald-500" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="Bank_Transfer">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-blue-500" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="Check">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-500" />
                        Check
                      </div>
                    </SelectItem>
                    <SelectItem value="Telebirr">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-orange-500" />
                        Telebirr
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Bank Account {paymentMethod !== 'Cash' && <span className="text-red-500">*</span>}
                </Label>
                {paymentMethod === 'Cash' ? (
                    <div className="h-10 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center px-3 text-sm text-emerald-700">
                      <Wallet className="h-4 w-4 mr-2" />
                      Cash Payment (No bank account required)
                    </div>
                ) : (
                    <Select value={bankAccount} onValueChange={setBankAccount}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-gray-500">No bank accounts found</div>
                        ) : (
                            bankAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  <div className="flex items-center justify-between w-full gap-3">
                                    <span>{account.name}</span>
                                    {account.accountNumber && (
                                        <span className="text-xs text-gray-400">({account.accountNumber})</span>
                                    )}
                                    {account.currentBalance !== undefined && (
                                        <span className={`text-xs font-medium ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {formatCurrency(account.currentBalance)}
                                        </span>
                                    )}
                                  </div>
                                </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Amount</span>
                <span className="font-bold text-indigo-600">{formatCurrency(payment.amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Vendor</span>
                <span className="font-medium">{payment.vendorName || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Payment Number</span>
                <span className="font-mono text-sm">{payment.paymentNumber}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Payment
                    </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}