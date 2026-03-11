import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { SalesInvoice, PaymentAllocation } from '../types';

interface RecordReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: { id: string; name: string }[];
  onSubmit: (data: {
    customer_id: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Telebirr' | 'Check';
    bank_reference: string;
    bank_gl_account: string;
    total_received: number;
    allocations: PaymentAllocation[];
    attachment_url?: string;
    receipt_date: string;
  }) => void;
}

const RecordReceiptModal: React.FC<RecordReceiptModalProps> = ({
  isOpen,
  onClose,
  customers,
  onSubmit
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerInvoices, setCustomerInvoices] = useState<SalesInvoice[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank_Transfer' | 'Telebirr' | 'Check'>('Bank_Transfer');
  const [bankReference, setBankReference] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [totalReceived, setTotalReceived] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [allocations, setAllocations] = useState<PaymentAllocation[]>([]);

  const bankAccounts = [
    { id: 'bank-1', name: 'Commercial Bank - Main Account', gl_code: '1010-001' },
    { id: 'bank-2', name: 'Awash Bank - Operations', gl_code: '1010-002' },
    { id: 'bank-3', name: 'Cash on Hand', gl_code: '1001-001' }
  ];

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerInvoices(selectedCustomer);
    } else {
      setCustomerInvoices([]);
      setAllocations([]);
    }
  }, [selectedCustomer]);

  const loadCustomerInvoices = (customerId: string) => {
    const stored = localStorage.getItem('sales_invoices');
    if (stored) {
      const allInvoices: SalesInvoice[] = JSON.parse(stored);
      const unpaidInvoices = allInvoices.filter(
        inv => inv.customer_id === customerId && 
        inv.status !== 'Draft' && 
        inv.remaining_amount > 0
      );
      setCustomerInvoices(unpaidInvoices);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleAddAllocation = (invoice: SalesInvoice) => {
    if (allocations.find(a => a.invoice_id === invoice.id)) {
      return;
    }

    setAllocations([
      ...allocations,
      {
        invoice_id: invoice.id,
        invoice_no: invoice.invoice_no,
        amount_applied: 0
      }
    ]);
  };

  const handleRemoveAllocation = (invoiceId: string) => {
    setAllocations(allocations.filter(a => a.invoice_id !== invoiceId));
  };

  const handleAllocationAmountChange = (invoiceId: string, amount: string) => {
    setAllocations(allocations.map(a =>
      a.invoice_id === invoiceId
        ? { ...a, amount_applied: parseFloat(amount) || 0 }
        : a
    ));
  };

  const getTotalAllocated = () => {
    return allocations.reduce((sum, a) => sum + a.amount_applied, 0);
  };

  const getUnallocated = () => {
    const received = parseFloat(totalReceived) || 0;
    return received - getTotalAllocated();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer || !paymentMethod || !bankAccount || !totalReceived) {
      alert('Please fill in all required fields');
      return;
    }

    if (paymentMethod !== 'Cash' && !bankReference) {
      alert('Bank reference is required for non-cash payments');
      return;
    }

    const received = parseFloat(totalReceived);
    if (received <= 0) {
      alert('Amount received must be greater than 0');
      return;
    }

    if (allocations.length === 0) {
      alert('Please allocate payment to at least one invoice');
      return;
    }

    const totalAllocated = getTotalAllocated();
    if (totalAllocated > received) {
      alert('Total allocated amount cannot exceed amount received');
      return;
    }

    onSubmit({
      customer_id: selectedCustomer,
      payment_method: paymentMethod,
      bank_reference: bankReference,
      bank_gl_account: bankAccount,
      total_received: received,
      allocations: allocations.filter(a => a.amount_applied > 0),
      attachment_url: attachmentUrl || undefined,
      receipt_date: receiptDate
    });

    handleClose();
  };

  const handleClose = () => {
    setSelectedCustomer('');
    setCustomerInvoices([]);
    setPaymentMethod('Bank_Transfer');
    setBankReference('');
    setBankAccount('');
    setTotalReceived('');
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setAttachmentUrl('');
    setAllocations([]);
    onClose();
  };

  if (!isOpen) return null;

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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">
              Record Payment Receipt
            </h2>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">

            {/* Customer Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-sm text-gray-500">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-emerald-500 focus:border-transparent">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptDate" className="text-sm text-gray-500">
                  Receipt Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="receiptDate"
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="border-gray-300 focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-sm text-gray-500">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-emerald-500 focus:border-transparent">
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
                <Label htmlFor="bankRef" className="text-sm text-gray-500">
                  Bank Reference Number {paymentMethod !== 'Cash' && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="bankRef"
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value)}
                  placeholder="Enter bank reference/transaction ID"
                  className="border-gray-300 focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  required={paymentMethod !== 'Cash'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount" className="text-sm text-gray-500">
                  Bank/Cash Account <span className="text-red-500">*</span>
                </Label>
                <Select value={bankAccount} onValueChange={setBankAccount}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-emerald-500 focus:border-transparent">
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
                  Total Amount Received <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={totalReceived}
                  onChange={(e) => setTotalReceived(e.target.value)}
                  placeholder="0.00"
                  className="border-gray-300 focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="attachment" className="text-sm text-gray-500">
                  Attachment URL (Bank Slip)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="attachment"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="Enter attachment URL"
                    className="border-gray-300 focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Button type="button" variant="outline" size="icon" className="hover:bg-gray-100">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Invoice Allocation */}
            {selectedCustomer && customerInvoices.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold text-gray-700">
                    Allocate Payment to Invoices
                  </Label>
                  <div className="text-sm text-gray-600">
                    Unallocated: <span className="font-semibold text-emerald-600">
                      {formatCurrency(getUnallocated())}
                    </span>
                  </div>
                </div>

                {/* Available Invoices */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">Available Invoices:</p>
                  <div className="space-y-2">
                    {customerInvoices.map(invoice => {
                      const isAllocated = allocations.find(a => a.invoice_id === invoice.id);
                      return (
                        <div key={invoice.id} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{invoice.invoice_no}</p>
                            <p className="text-xs text-gray-500">
                              Due: {formatCurrency(invoice.remaining_amount)}
                            </p>
                          </div>
                          {!isAllocated && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddAllocation(invoice)}
                              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Allocated Invoices */}
                {allocations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">Payment Allocation:</p>
                    {allocations.map(allocation => {
                      const invoice = customerInvoices.find(inv => inv.id === allocation.invoice_id);
                      if (!invoice) return null;

                      return (
                        <div key={allocation.invoice_id} className="flex items-center gap-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{allocation.invoice_no}</p>
                            <p className="text-xs text-gray-500">
                              Max: {formatCurrency(invoice.remaining_amount)}
                            </p>
                          </div>
                          <Input
                            type="number"
                            step="0.01"
                            max={invoice.remaining_amount}
                            value={allocation.amount_applied || ''}
                            onChange={(e) => handleAllocationAmountChange(allocation.invoice_id, e.target.value)}
                            placeholder="0.00"
                            className="w-32 border-emerald-300"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAllocation(allocation.invoice_id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                      <span className="text-sm font-semibold text-gray-700">Total Allocated:</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {formatCurrency(getTotalAllocated())}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedCustomer && customerInvoices.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg">
                No unpaid invoices found for this customer
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-2">
            <div className="mx-auto flex justify-center items-center gap-1.5">
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6"
                disabled={!selectedCustomer || allocations.length === 0}
              >
                Record Receipt
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

export default RecordReceiptModal;
