import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../layout/layout';
import PaymentEntryHeader from './PaymentEntryHeader';
import PaymentEntrySearchFilter from './PaymentEntrySearchFilter';
import InvoiceListTable from './InvoiceListTable';
import RecordPaymentModal from './RecordPaymentModal';
import ViewInvoiceModal from './ViewInvoiceModal';
import type { Invoice } from '../types';

export default function AccountsPayableSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordingPaymentFor, setRecordingPaymentFor] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const stored = localStorage.getItem('procurement_invoices');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Only show approved invoices
        const approvedInvoices = parsed.filter((inv: Invoice) => inv.approval_status === 'Approved');
        setInvoices(approvedInvoices);
      } catch (e) {
        console.error('Error parsing invoices:', e);
        setInvoices([]);
      }
    } else {
      setInvoices([]);
    }
  };

  const generatePVNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const stored = localStorage.getItem('paymentEntries');
    const existingPayments = stored ? JSON.parse(stored) : [];
    const sequence = String(existingPayments.length + 1).padStart(4, '0');
    return `PV-${year}-${month}-${sequence}`;
  };

  const handleRecordPayment = (data: {
    invoice_id: string;
    external_bank_ref: string;
    payment_date: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';
    bank_account_id: string;
    amount_paid: number;
    attachment_url?: string;
  }) => {
    const invoice = invoices.find(inv => inv.id === data.invoice_id);
    if (!invoice) return;

    const bankAccounts = [
      { id: 'bank-1', name: 'Commercial Bank - Main Account', gl_code: '1010-001' },
      { id: 'bank-2', name: 'Awash Bank - Operations', gl_code: '1010-002' },
      { id: 'bank-3', name: 'Cash on Hand', gl_code: '1001-001' }
    ];

    const bankAccount = bankAccounts.find(b => b.id === data.bank_account_id);

    // Update invoice status
    const newPaidAmount = invoice.paid_amount + data.amount_paid;
    const newRemainingAmount = invoice.total_amount - newPaidAmount;
    const newStatus = newRemainingAmount === 0 ? 'Paid' : 'Partially_Paid';

    const updatedInvoices = invoices.map(inv =>
      inv.id === data.invoice_id
        ? {
            ...inv,
            paid_amount: newPaidAmount,
            remaining_amount: newRemainingAmount,
            status: newStatus as 'Pending' | 'Partially_Paid' | 'Paid'
          }
        : inv
    );

    // Update in procurement_invoices (main storage)
    const storedAll = localStorage.getItem('procurement_invoices');
    if (storedAll) {
      const allInvoices = JSON.parse(storedAll);
      const updatedAll = allInvoices.map((inv: Invoice) =>
        inv.id === data.invoice_id
          ? {
              ...inv,
              paid_amount: newPaidAmount,
              remaining_amount: newRemainingAmount,
              status: newStatus as 'Pending' | 'Partially_Paid' | 'Paid'
            }
          : inv
      );
      localStorage.setItem('procurement_invoices', JSON.stringify(updatedAll));
    }

    setInvoices(updatedInvoices);

    // Create payment entry record
    const pvNumber = generatePVNumber();
    const paymentEntry = {
      id: `payment-${Date.now()}`,
      internal_pv_no: pvNumber,
      external_bank_ref: data.external_bank_ref,
      vendor_id: invoice.vendor_id,
      vendor_name: invoice.vendor_name,
      invoice_id: invoice.id,
      invoice_no: invoice.invoice_no,
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      bank_account_id: data.bank_account_id,
      bank_account_name: bankAccount?.name || 'Unknown Account',
      total_amount: data.amount_paid,
      attachment_url: data.attachment_url,
      status: 'Posted',
      created_at: new Date().toISOString(),
      created_by: 'Current User'
    };

    const storedPayments = localStorage.getItem('paymentEntries');
    const payments = storedPayments ? JSON.parse(storedPayments) : [];
    payments.push(paymentEntry);
    localStorage.setItem('paymentEntries', JSON.stringify(payments));

    // Create journal entry automatically
    createJournalEntry(paymentEntry, invoice, bankAccount);

    showToast.success(`Payment ${pvNumber} recorded successfully and journal entry created`);
    setRecordingPaymentFor(null);
  };

  const createJournalEntry = (
    payment: any,
    invoice: Invoice,
    bankAccount: any
  ) => {
    const journalEntry = {
      id: Date.now(),
      date: payment.payment_date,
      number: `JE-${Date.now()}`,
      reference: payment.internal_pv_no,
      description: `Payment to ${invoice.vendor_name} for ${invoice.invoice_no}`,
      type: 'Payment Voucher',
      lines: [
        {
          account: 'Accounts Payable',
          account_code: '2010-001',
          debit: payment.total_amount,
          credit: 0,
          description: `Clear liability for ${invoice.invoice_no}`
        },
        {
          account: bankAccount?.name || 'Bank Account',
          account_code: bankAccount?.gl_code || '1010-001',
          debit: 0,
          credit: payment.total_amount,
          description: `Payment via ${payment.payment_method.replace('_', ' ')}`
        }
      ],
      total_debit: payment.total_amount,
      total_credit: payment.total_amount,
      status: 'Posted',
      created_by: 'System - AP Module',
      created_at: new Date().toISOString(),
      posted_at: new Date().toISOString()
    };

    // Store in journal entries
    const storedJournals = localStorage.getItem('journalEntries');
    const journals = storedJournals ? JSON.parse(storedJournals) : [];
    journals.push(journalEntry);
    localStorage.setItem('journalEntries', JSON.stringify(journals));

    // Also update General Ledger
    updateGeneralLedger(journalEntry);

    console.log('Journal Entry Created:', journalEntry);
  };

  const updateGeneralLedger = (journalEntry: any) => {
    // Update GL accounts with the journal entry
    const storedGL = localStorage.getItem('generalLedger');
    const glAccounts = storedGL ? JSON.parse(storedGL) : [];

    journalEntry.lines.forEach((line: any) => {
      const accountIndex = glAccounts.findIndex(
        (acc: any) => acc.account_code === line.account_code
      );

      if (accountIndex >= 0) {
        // Update existing account
        glAccounts[accountIndex].transactions.push({
          date: journalEntry.date,
          reference: journalEntry.reference,
          description: line.description,
          debit: line.debit,
          credit: line.credit,
          balance: glAccounts[accountIndex].balance + line.debit - line.credit
        });
        glAccounts[accountIndex].balance += line.debit - line.credit;
      } else {
        // Create new account entry
        glAccounts.push({
          account_code: line.account_code,
          account_name: line.account,
          balance: line.debit - line.credit,
          transactions: [
            {
              date: journalEntry.date,
              reference: journalEntry.reference,
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
    console.log('General Ledger Updated');
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInvoices.length / 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PaymentEntryHeader />

      <PaymentEntrySearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <InvoiceListTable
        invoices={filteredInvoices}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredInvoices.length}
        onPageChange={setCurrentPage}
        onRecordPayment={setRecordingPaymentFor}
        onViewDetails={setViewingInvoice}
      />

      <RecordPaymentModal
        isOpen={!!recordingPaymentFor}
        onClose={() => setRecordingPaymentFor(null)}
        invoice={recordingPaymentFor}
        onSubmit={handleRecordPayment}
      />

      <ViewInvoiceModal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
      />
    </motion.div>
  );
}
