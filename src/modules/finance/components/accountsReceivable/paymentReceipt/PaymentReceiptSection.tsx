import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import PaymentReceiptHeader from '@/modules/finance/components/accountsReceivable/paymentReceipt/PaymentReceiptHeader';
import RecordReceiptModal from '@/modules/finance/components/accountsReceivable/paymentReceipt/RecordReceiptModal';
import type { SalesInvoice, PaymentReceipt, JournalEntry, PaymentAllocation } from '@/modules/finance/components/accountsReceivable/types';

export default function PaymentReceiptSection() {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadReceipts();
    loadCustomers();
  }, []);

  const loadReceipts = () => {
    const stored = localStorage.getItem('payment_receipts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setReceipts(parsed);
      } catch (e) {
        console.error('Error parsing receipts:', e);
        setReceipts([]);
      }
    }
  };

  const loadCustomers = () => {
    // Load unique customers from sales invoices
    const stored = localStorage.getItem('sales_invoices');
    if (stored) {
      const invoices: SalesInvoice[] = JSON.parse(stored);
      const uniqueCustomers = Array.from(
        new Map(
          invoices.map(inv => [inv.customer_id, { id: inv.customer_id, name: inv.customer_name }])
        ).values()
      );
      setCustomers(uniqueCustomers);
    }
  };

  const generateReceiptNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const sequence = String(receipts.length + 1).padStart(4, '0');
    return `REC-${year}-${month}-${sequence}`;
  };

  const handleRecordReceipt = (data: {
    customer_id: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Telebirr' | 'Check';
    bank_reference: string;
    bank_gl_account: string;
    total_received: number;
    allocations: PaymentAllocation[];
    attachment_url?: string;
    receipt_date: string;
  }) => {
    const customer = customers.find(c => c.id === data.customer_id);
    if (!customer) return;

    const bankAccounts = [
      { id: 'bank-1', name: 'Commercial Bank - Main Account', gl_code: '1010-001' },
      { id: 'bank-2', name: 'Awash Bank - Operations', gl_code: '1010-002' },
      { id: 'bank-3', name: 'Cash on Hand', gl_code: '1001-001' }
    ];

    const bankAccount = bankAccounts.find(b => b.id === data.bank_gl_account);

    // Create receipt record
    const receiptNumber = generateReceiptNumber();
    const newReceipt: PaymentReceipt = {
      receipt_id: receiptNumber,
      customer_id: data.customer_id,
      customer_name: customer.name,
      payment_method: data.payment_method,
      bank_reference: data.bank_reference,
      bank_gl_account: data.bank_gl_account,
      bank_account_name: bankAccount?.name || 'Unknown Account',
      total_received: data.total_received,
      allocations: data.allocations,
      attachment_url: data.attachment_url,
      receipt_date: data.receipt_date,
      status: 'Posted',
      created_at: new Date().toISOString(),
      created_by: 'Current User'
    };

    // Update receipts
    const updatedReceipts = [...receipts, newReceipt];
    setReceipts(updatedReceipts);
    localStorage.setItem('payment_receipts', JSON.stringify(updatedReceipts));

    // Update invoice statuses
    updateInvoiceStatuses(data.allocations);

    // Create journal entry
    createReceiptJournalEntry(newReceipt, bankAccount);

    toast.success(`Payment receipt ${receiptNumber} recorded successfully`);
    setIsModalOpen(false);
  };

  const updateInvoiceStatuses = (allocations: PaymentAllocation[]) => {
    const stored = localStorage.getItem('sales_invoices');
    if (!stored) return;

    const invoices: SalesInvoice[] = JSON.parse(stored);
    const updatedInvoices = invoices.map(invoice => {
      const allocation = allocations.find(a => a.invoice_id === invoice.id);
      if (!allocation) return invoice;

      const newPaidAmount = invoice.paid_amount + allocation.amount_applied;
      const newRemainingAmount = invoice.total_amount - newPaidAmount;
      const newStatus = newRemainingAmount === 0 ? 'Paid' : 'Partially_Paid';

      return {
        ...invoice,
        paid_amount: newPaidAmount,
        remaining_amount: newRemainingAmount,
        status: newStatus as 'Draft' | 'Posted' | 'Partially_Paid' | 'Paid'
      };
    });

    localStorage.setItem('sales_invoices', JSON.stringify(updatedInvoices));
  };

  const createReceiptJournalEntry = (receipt: PaymentReceipt, bankAccount: any) => {
    const storedJournals = localStorage.getItem('journal_entries');
    const journals: JournalEntry[] = storedJournals ? JSON.parse(storedJournals) : [];

    const newEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entry_no: `JE-${new Date().getFullYear()}-${String(journals.length + 1).padStart(4, '0')}`,
      entry_date: receipt.receipt_date,
      description: `Payment received from ${receipt.customer_name} - ${receipt.receipt_id}`,
      reference_type: 'Payment_Receipt',
      reference_id: receipt.receipt_id,
      total_debit: receipt.total_received,
      total_credit: receipt.total_received,
      status: 'Posted',
      lines: [
        {
          account: bankAccount?.name || 'Bank Account',
          account_code: bankAccount?.gl_code || '1010-001',
          debit: receipt.total_received,
          credit: 0,
          description: `Cash received via ${receipt.payment_method.replace('_', ' ')}`
        },
        {
          account: 'Accounts Receivable',
          account_code: '1200-001',
          debit: 0,
          credit: receipt.total_received,
          description: `Payment from ${receipt.customer_name}`
        }
      ],
      created_at: new Date().toISOString(),
      created_by: 'Current User'
    };

    journals.push(newEntry);
    localStorage.setItem('journal_entries', JSON.stringify(journals));

    // Update General Ledger
    updateGeneralLedger(newEntry);

    console.log('Journal Entry Created:', newEntry);
  };

  const updateGeneralLedger = (journalEntry: JournalEntry) => {
    const storedGL = localStorage.getItem('generalLedger');
    const glAccounts = storedGL ? JSON.parse(storedGL) : [];

    journalEntry.lines.forEach((line) => {
      const accountIndex = glAccounts.findIndex(
        (acc: any) => acc.account_code === line.account_code
      );

      if (accountIndex >= 0) {
        glAccounts[accountIndex].transactions.push({
          date: journalEntry.entry_date,
          reference: journalEntry.entry_no,
          description: line.description,
          debit: line.debit,
          credit: line.credit,
          balance: glAccounts[accountIndex].balance + line.debit - line.credit
        });
        glAccounts[accountIndex].balance += line.debit - line.credit;
      } else {
        glAccounts.push({
          account_code: line.account_code,
          account_name: line.account,
          balance: line.debit - line.credit,
          transactions: [
            {
              date: journalEntry.entry_date,
              reference: journalEntry.entry_no,
              description: line.description,
              debit: line.debit,
              credit: line.credit,
              balance: line.debit - line.credit
            }
          ]
        });
      }
    });

    localStorage.setItem('generalLedger', JSON.stringify(glAccounts));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >  <PaymentReceiptHeader />
      <div className="flex justify-end items-center">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Receipt
        </Button>
      </div>

      {/* Receipts List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {receipts.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No payment receipts recorded yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Receipt No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoices
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <tr key={receipt.receipt_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {receipt.receipt_id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {receipt.customer_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {formatDate(receipt.receipt_date)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {receipt.payment_method.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-indigo-600">
                      {formatCurrency(receipt.total_received)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {receipt.allocations.map(a => a.invoice_no).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RecordReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customers={customers}
        onSubmit={handleRecordReceipt}
      />
    </motion.div>
  );
}
