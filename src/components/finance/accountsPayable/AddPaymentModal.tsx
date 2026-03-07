import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface Invoice {
  id: string;
  invoice_no: string;
  vendor_id: string;
  vendor_name: string;
  total_amount: number;
  remaining_amount: number;
  invoice_date: string;
  status: 'Pending' | 'Partially_Paid' | 'Paid';
}

interface InvoiceToPay {
  invoice_id: string;
  invoice_no: string;
  amount_paid: number;
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    external_bank_ref: string;
    vendor_id: string;
    payment_date: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';
    bank_account_id: string;
    invoices_to_pay: InvoiceToPay[];
    total_amount: number;
    attachment_url?: string;
  }) => void;
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  onSubmit
}: AddPaymentModalProps) {
  const [externalBankRef, setExternalBankRef] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr'>('Bank_Transfer');
  const [bankAccount, setBankAccount] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [invoicesToPay, setInvoicesToPay] = useState<InvoiceToPay[]>([]);
  const [availableInvoices, setAvailableInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [amountToPay, setAmountToPay] = useState('');

  // Mock data for vendors and bank accounts
  const vendors = [
    { id: 'vendor-1', name: 'ABC Suppliers Ltd' },
    { id: 'vendor-2', name: 'XYZ Trading Co' },
    { id: 'vendor-3', name: 'Global Imports Inc' }
  ];

  const bankAccounts = [
    { id: 'bank-1', name: 'Commercial Bank - Main Account', gl_code: '1010-001' },
    { id: 'bank-2', name: 'Awash Bank - Operations', gl_code: '1010-002' },
    { id: 'bank-3', name: 'Cash on Hand', gl_code: '1001-001' }
  ];

  // Load mock invoices when vendor is selected
  useEffect(() => {
    if (selectedVendor) {
      // Mock invoices from procurement
      const mockInvoices: Invoice[] = [
        {
          id: 'inv-1',
          invoice_no: 'INV-2024-001',
          vendor_id: selectedVendor,
          vendor_name: vendors.find(v => v.id === selectedVendor)?.name || '',
          total_amount: 50000,
          remaining_amount: 50000,
          invoice_date: '2024-01-15',
          status: 'Pending'
        },
        {
          id: 'inv-2',
          invoice_no: 'INV-2024-002',
          vendor_id: selectedVendor,
          vendor_name: vendors.find(v => v.id === selectedVendor)?.name || '',
          total_amount: 75000,
          remaining_amount: 75000,
          invoice_date: '2024-01-20',
          status: 'Pending'
        },
        {
          id: 'inv-3',
          invoice_no: 'INV-2024-003',
          vendor_id: selectedVendor,
          vendor_name: vendors.find(v => v.id === selectedVendor)?.name || '',
          total_amount: 120000,
          remaining_amount: 60000,
          invoice_date: '2024-01-25',
          status: 'Partially_Paid'
        }
      ];
      setAvailableInvoices(mockInvoices);
    } else {
      setAvailableInvoices([]);
    }
  }, [selectedVendor]);

  const handleAddInvoice = () => {
    if (!selectedInvoice || !amountToPay) return;

    const invoice = availableInvoices.find(inv => inv.id === selectedInvoice);
    if (!invoice) return;

    const amount = parseFloat(amountToPay);
    if (amount <= 0 || amount > invoice.remaining_amount) {
      alert(`Amount must be between 0 and ${invoice.remaining_amount}`);
      return;
    }

    setInvoicesToPay([
      ...invoicesToPay,
      {
        invoice_id: invoice.id,
        invoice_no: invoice.invoice_no,
        amount_paid: amount
      }
    ]);

    setSelectedInvoice('');
    setAmountToPay('');
  };

  const handleRemoveInvoice = (invoiceId: string) => {
    setInvoicesToPay(invoicesToPay.filter(inv => inv.invoice_id !== invoiceId));
  };

  const calculateTotal = () => {
    return invoicesToPay.reduce((sum, inv) => sum + inv.amount_paid, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!externalBankRef || !selectedVendor || !paymentDate || !paymentMethod || !bankAccount) {
      alert('Please fill in all required fields');
      return;
    }

    if (invoicesToPay.length === 0) {
      alert('Please add at least one invoice to pay');
      return;
    }

    onSubmit({
      external_bank_ref: externalBankRef,
      vendor_id: selectedVendor,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      bank_account_id: bankAccount,
      invoices_to_pay: invoicesToPay,
      total_amount: calculateTotal(),
      attachment_url: attachmentUrl || undefined
    });

    // Reset form
    setExternalBankRef('');
    setSelectedVendor('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Bank_Transfer');
    setBankAccount('');
    setAttachmentUrl('');
    setInvoicesToPay([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Record Payment Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor *</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
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

          {/* Invoice Selection */}
          {selectedVendor && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Invoices to Pay</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="invoice">Invoice</Label>
                  <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInvoices
                        .filter(inv => !invoicesToPay.find(i => i.invoice_id === inv.id))
                        .map(invoice => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.invoice_no} - Remaining: {invoice.remaining_amount.toFixed(2)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Pay</Label>
                  <div className="flex gap-2">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amountToPay}
                      onChange={(e) => setAmountToPay(e.target.value)}
                      placeholder="0.00"
                    />
                    <Button type="button" onClick={handleAddInvoice} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Selected Invoices */}
              {invoicesToPay.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Invoices</h4>
                  <div className="space-y-2">
                    {invoicesToPay.map((invoice) => (
                      <div key={invoice.invoice_id} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div>
                          <span className="font-medium">{invoice.invoice_no}</span>
                          <span className="text-gray-500 ml-4">Amount: {invoice.amount_paid.toFixed(2)}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInvoice(invoice.invoice_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Payment:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
