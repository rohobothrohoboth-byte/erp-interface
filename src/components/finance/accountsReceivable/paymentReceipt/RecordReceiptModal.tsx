// src/components/finance/accountsReceivable/paymentReceipt/RecordReceiptModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus, Trash2, Printer, FileText, DollarSign, Calendar, Building2, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Checkbox } from '../../../ui/checkbox';
import { Badge } from '../../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { getInvoices, getBankAccounts } from '../../../../services/finance/finance.api';
import { showToast } from '../../../../layout/layout';

interface SalesInvoice {
  id: string;
  invoice_no: string;
  customer_id: string;
  customer_name: string;
  total_amount: number;
  remaining_amount: number;
  invoice_date: string;
  due_date: string;
  status: string;
}

interface PaymentAllocation {
  invoice_id: string;
  invoice_no: string;
  amount_applied: number;
}

interface RecordReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: { id: string; name: string; email?: string; phone?: string }[];
  onSubmit: (data: {
    customer_id: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Telebirr' | 'Check';
    bank_reference: string;
    bank_gl_account: string;
    total_received: number;
    allocations: PaymentAllocation[];
    attachment_url?: string;
    receipt_date: string;
    notes?: string;
    require_signature?: boolean;
    receiver_name?: string;
    authorized_by?: string;
  }) => void;
  isLoading?: boolean;
}

const RecordReceiptModal: React.FC<RecordReceiptModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 customers,
                                                                 onSubmit,
                                                                 isLoading = false
                                                               }) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerInvoices, setCustomerInvoices] = useState<SalesInvoice[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank_Transfer' | 'Telebirr' | 'Check'>('Bank_Transfer');
  const [bankReference, setBankReference] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [totalReceived, setTotalReceived] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [allocations, setAllocations] = useState<PaymentAllocation[]>([]);
  const [bankAccounts, setBankAccounts] = useState<{ id: string; name: string; glCode: string }[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [requireSignature, setRequireSignature] = useState(true);
  const [receiverName, setReceiverName] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('');

  // ✅ Fetch bank accounts on mount
  useEffect(() => {
    if (isOpen) {
      fetchBankAccounts();
    }
  }, [isOpen]);

  // ✅ Load customer invoices when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerInvoices(selectedCustomer);
    } else {
      setCustomerInvoices([]);
      setAllocations([]);
    }
  }, [selectedCustomer]);

  const fetchBankAccounts = async () => {
    try {
      const response = await getBankAccounts();
      let data = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data.$values && Array.isArray(response.data.$values)) {
          data = response.data.$values;
        }
      }
      setBankAccounts(data.map((acc: any) => ({
        id: acc.id,
        name: acc.name || acc.accountName || 'Unknown Account',
        glCode: acc.glCode || acc.gl_code || ''
      })));
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      // Fallback to default accounts
      setBankAccounts([
        { id: 'bank-1', name: 'Commercial Bank - Main Account', glCode: '1010-001' },
        { id: 'bank-2', name: 'Awash Bank - Operations', glCode: '1010-002' },
        { id: 'bank-3', name: 'Cash on Hand', glCode: '1001-001' }
      ]);
    }
  };

  const loadCustomerInvoices = async (customerId: string) => {
    try {
      setLoadingInvoices(true);
      const response = await getInvoices();
      let data = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data.$values && Array.isArray(response.data.$values)) {
          data = response.data.$values;
        }
      }

      // ✅ Filter only Sales invoices (AR) that are unpaid
      const unpaidInvoices = data
          .filter((inv: any) => {
            const type = inv.invoiceType || inv.InvoiceType || 'Purchase';
            const customerIdField = inv.customerId || inv.customer_id;
            const status = inv.status || 'Draft';
            const total = Number(inv.totalAmount || inv.total_amount || 0);
            const paid = Number(inv.paidAmount || inv.paid_amount || 0);
            const remaining = total - paid;
            return type === 'Sales' &&
                customerIdField === customerId &&
                status !== 'Paid' &&
                status !== 'Cancelled' &&
                remaining > 0;
          })
          .map((inv: any) => ({
            id: inv.id,
            invoice_no: inv.invoiceNumber || inv.invoice_no || 'N/A',
            customer_id: inv.customerId || inv.customer_id,
            customer_name: inv.customerName || inv.customer_name || 'Unknown',
            total_amount: Number(inv.totalAmount || inv.total_amount || 0),
            remaining_amount: Number(inv.totalAmount || inv.total_amount || 0) - Number(inv.paidAmount || inv.paid_amount || 0),
            invoice_date: inv.invoiceDate || inv.invoice_date,
            due_date: inv.dueDate || inv.due_date,
            status: inv.status || 'Draft'
          }));

      setCustomerInvoices(unpaidInvoices);
    } catch (error) {
      console.error('Error loading customer invoices:', error);
      showToast.error('Failed to load invoices');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleAddAllocation = (invoice: SalesInvoice) => {
    if (allocations.find(a => a.invoice_id === invoice.id)) {
      showToast.warning('Invoice already allocated');
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
    const parsedAmount = parseFloat(amount) || 0;
    const invoice = customerInvoices.find(inv => inv.id === invoiceId);

    // ✅ Validate amount doesn't exceed remaining balance
    if (invoice && parsedAmount > invoice.remaining_amount) {
      showToast.error(`Amount cannot exceed remaining balance of ${formatCurrency(invoice.remaining_amount)}`);
      return;
    }

    setAllocations(allocations.map(a =>
        a.invoice_id === invoiceId
            ? { ...a, amount_applied: parsedAmount }
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

    // ✅ Validate required fields
    if (!selectedCustomer) {
      showToast.error('Please select a customer');
      return;
    }
    if (!paymentMethod) {
      showToast.error('Please select a payment method');
      return;
    }
    if (paymentMethod !== 'Cash' && !bankReference) {
      showToast.error('Bank reference is required for non-cash payments');
      return;
    }
    if (!bankAccount) {
      showToast.error('Please select a bank account');
      return;
    }
    if (!totalReceived || parseFloat(totalReceived) <= 0) {
      showToast.error('Amount received must be greater than 0');
      return;
    }
    if (allocations.length === 0) {
      showToast.error('Please allocate payment to at least one invoice');
      return;
    }

    const received = parseFloat(totalReceived);
    const totalAllocated = getTotalAllocated();

    if (totalAllocated > received) {
      showToast.error('Total allocated amount cannot exceed amount received');
      return;
    }

    if (Math.abs(totalAllocated - received) > 0.01) {
      showToast.error(`Total allocated (${formatCurrency(totalAllocated)}) does not match amount received (${formatCurrency(received)})`);
      return;
    }

    if (requireSignature && (!receiverName.trim() || !authorizedBy.trim())) {
      showToast.error('Please enter receiver name and authorized by');
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
      receipt_date: receiptDate,
      notes: notes || undefined,
      require_signature: requireSignature,
      receiver_name: receiverName,
      authorized_by: authorizedBy,
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
    setNotes('');
    setAllocations([]);
    setReceiverName('');
    setAuthorizedBy('');
    setRequireSignature(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Record Payment Receipt</h2>
                  <p className="text-sm text-gray-500">Record customer payment and allocate to invoices</p>
                </div>
              </div>
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Customer & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {customer.name}
                          </div>
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Receipt Date <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full"
                    required
                />
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger className="w-full">
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

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Bank Reference {paymentMethod !== 'Cash' && <span className="text-red-500">*</span>}
                </Label>
                <Input
                    value={bankReference}
                    onChange={(e) => setBankReference(e.target.value)}
                    placeholder="Transaction reference"
                    className="w-full"
                    required={paymentMethod !== 'Cash'}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Bank Account <span className="text-red-500">*</span>
                </Label>
                <Select value={bankAccount} onValueChange={setBankAccount}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <span>{account.name}</span>
                            <span className="text-xs text-gray-400">({account.glCode})</span>
                          </div>
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Total Received <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="number"
                    step="0.01"
                    value={totalReceived}
                    onChange={(e) => setTotalReceived(e.target.value)}
                    placeholder="0.00"
                    className="w-full"
                    required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full"
              />
            </div>

            {/* Invoice Allocation */}
            {selectedCustomer && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-gray-700">
                      Invoice Allocations
                    </Label>
                    <div className="text-sm text-gray-600">
                      Unallocated: <span className={`font-semibold ${getUnallocated() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {formatCurrency(getUnallocated())}
                                    </span>
                    </div>
                  </div>

                  {loadingInvoices ? (
                      <div className="text-center py-6 text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                        Loading invoices...
                      </div>
                  ) : customerInvoices.length > 0 ? (
                      <div className="space-y-3">
                        {/* Available Invoices */}
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-medium text-gray-600">Available Invoices:</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {customerInvoices.map(invoice => {
                              const isAllocated = allocations.find(a => a.invoice_id === invoice.id);
                              return (
                                  <div key={invoice.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-emerald-200 transition-colors">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-indigo-400" />
                                        <p className="text-sm font-medium text-gray-900">{invoice.invoice_no}</p>
                                        <Badge variant="outline" className="text-xs">
                                          {formatCurrency(invoice.remaining_amount)} due
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-gray-400">
                                        Due: {new Date(invoice.due_date).toLocaleDateString()}
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
                              <p className="text-xs font-medium text-gray-600">Allocated Payments:</p>
                              {allocations.map(allocation => {
                                const invoice = customerInvoices.find(inv => inv.id === allocation.invoice_id);
                                if (!invoice) return null;

                                return (
                                    <div key={allocation.invoice_id} className="flex items-center gap-2 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
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
                                <span className={`text-sm font-bold ${getTotalAllocated() === parseFloat(totalReceived) ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {formatCurrency(getTotalAllocated())}
                                                </span>
                              </div>
                            </div>
                        )}
                      </div>
                  ) : (
                      <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p>No unpaid invoices found for this customer</p>
                        <p className="text-xs text-gray-400">All invoices are fully paid</p>
                      </div>
                  )}
                </div>
            )}

            {/* Signature Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                    checked={requireSignature}
                    onCheckedChange={(checked) => setRequireSignature(checked as boolean)}
                    id="requireSignature"
                />
                <Label htmlFor="requireSignature" className="text-sm font-medium text-gray-700">
                  Require Signature
                </Label>
              </div>

              {requireSignature && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Receiver Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          placeholder="Enter receiver name"
                          className="w-full"
                          required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Authorized By <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          value={authorizedBy}
                          onChange={(e) => setAuthorizedBy(e.target.value)}
                          placeholder="Enter authorized person"
                          className="w-full"
                          required
                      />
                    </div>
                  </div>
              )}
            </div>

            {/* Summary */}
            {selectedCustomer && allocations.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Received</p>
                      <p className="text-2xl font-bold text-emerald-600">{formatCurrency(parseFloat(totalReceived) || 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Allocated</p>
                      <p className="text-2xl font-bold text-indigo-600">{formatCurrency(getTotalAllocated())}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Unallocated</p>
                      <p className={`text-2xl font-bold ${getUnallocated() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(getUnallocated())}
                      </p>
                    </div>
                  </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  disabled={!selectedCustomer || allocations.length === 0 || isLoading}
              >
                {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Recording...
                    </>
                ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Record Receipt
                    </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
  );
};

export default RecordReceiptModal;