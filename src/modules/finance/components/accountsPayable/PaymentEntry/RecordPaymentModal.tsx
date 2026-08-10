import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { Invoice } from '@/modules/finance/components/accountsPayable/types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSubmit: (data: {
    invoice_id: string;
    external_bank_ref: string;
    payment_date: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';
    bank_account_id: string;
    amount_paid: number;
    attachment_url?: string;
  }) => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSubmit
}) => {

  const [externalBankRef, setExternalBankRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr'>('Bank_Transfer');
  const [bankAccount, setBankAccount] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  // Set the amount to the total invoice amount when invoice changes
  useEffect(() => {
    if (invoice) {
      setAmountPaid(invoice.total_amount.toString());
    }
  }, [invoice]);
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const bankAccounts = [
    { id: 'bank-1', name: 'Commercial Bank - Main Account', gl_code: '1010-001' },
    { id: 'bank-2', name: 'Awash Bank - Operations', gl_code: '1010-002' },
    { id: 'bank-3', name: 'Cash on Hand', gl_code: '1001-001' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoice) return;

    if (!externalBankRef || !paymentDate || !paymentMethod || !bankAccount || !amountPaid) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(amountPaid);
    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (amount !== invoice.total_amount) {
      alert(`Payment amount must exactly match the invoice amount: ${formatCurrency(invoice.total_amount)}`);
      return;
    }

    onSubmit({
      invoice_id: invoice.id,
      external_bank_ref: externalBankRef,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      bank_account_id: bankAccount,
      amount_paid: amount,
      attachment_url: attachmentUrl || undefined
    });

    handleClose();
  };

  const handleClose = () => {
    setExternalBankRef('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Bank_Transfer');
    setBankAccount('');
    setAmountPaid('');
    setAttachmentUrl('');
    onClose();
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Record Payment - {invoice.invoice_no}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Vendor: {invoice.vendor_name} | 
                Amount: <span className="font-medium text-indigo-600">
                  {formatCurrency(invoice.total_amount)}
                </span>
              </p>
            </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="bankRef" className="text-sm text-gray-500">
                  Bank Reference Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bankRef"
                  value={externalBankRef}
                  onChange={(e) => setExternalBankRef(e.target.value)}
                  placeholder="Enter bank reference/check number"
                  className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate" className="text-sm text-gray-500">
                  Payment Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-sm text-gray-500">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
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
                <Label htmlFor="bankAccount" className="text-sm text-gray-500">
                  Bank/Cash Account <span className="text-red-500">*</span>
                </Label>
                <Select value={bankAccount} onValueChange={setBankAccount}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
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

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm text-gray-500">
                  Amount to Pay (Must match invoice amount) <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-1">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                    className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment" className="text-sm text-gray-500">
                  Attachment URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="attachment"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="Enter attachment URL"
                    className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <Button type="button" variant="outline" size="icon" className="hover:bg-gray-100">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <div className="mx-auto flex justify-center items-center gap-1.5">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer px-6"
              >
                Record Payment
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer px-6"
                onClick={handleClose}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RecordPaymentModal;
