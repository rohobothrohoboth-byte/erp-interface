import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/shared/layout/layout';
import PaymentEntryHeader from '@/modules/finance/components/accountsPayable/PaymentEntry/PaymentEntryHeader';
import PaymentEntrySearchFilter from '@/modules/finance/components/accountsPayable/PaymentEntry/PaymentEntrySearchFilter';
import InvoiceListTable from '@/modules/finance/components/accountsPayable/PaymentEntry/InvoiceListTable';
import RecordPaymentModal from '@/modules/finance/components/accountsPayable/PaymentEntry/RecordPaymentModal';
import ViewInvoiceDocModal from '@/modules/finance/components/accountsPayable/PaymentEntry/ViewInvoiceDocModal';
import type { Invoice } from '@/modules/finance/components/accountsPayable/types';

export default function AccountsPayableSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordingPaymentFor, setRecordingPaymentFor] = useState<Invoice | null>(null);
  const [viewingDocInvoice, setViewingDocInvoice] = useState<{ invoiceNo: string; documentUrl?: string } | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const stored = localStorage.getItem('procurement_invoices');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Only show approved invoices that are not fully paid
        const approvedInvoices = parsed.filter(
          (inv: Invoice) => inv.approval_status === 'Approved' && inv.status !== 'Paid'
        );
        setInvoices(approvedInvoices);
      } catch (e) {
        console.error('Error parsing invoices:', e);
        createSampleInvoices();
      }
    } else {
      createSampleInvoices();
    }
  };

  const createSampleInvoices = () => {
    const sampleInvoices: Invoice[] = [
      {
        id: 'inv-001',
        invoice_no: 'INV-2024-001',
        vendor_id: 'vendor-001',
        vendor_name: 'Office Supplies Co.',
        invoice_date: '2024-01-15',
        due_date: '2024-02-14',
        total_amount: 25000,
        paid_amount: 0,
        remaining_amount: 25000,
        status: 'Pending',
        approval_status: 'Approved',
        approval_history: [
          {
            step_order: 1,
            step_name: 'Department Head Approval',
            approver_name: 'John Smith',
            approver_role: 'Department Head',
            action: 'Approved',
            comment: 'Approved for office supplies purchase',
            action_date: '2024-01-16T10:30:00'
          },
          {
            step_order: 2,
            step_name: 'Finance Manager Approval',
            approver_name: 'Sarah Johnson',
            approver_role: 'Finance Manager',
            action: 'Approved',
            comment: 'Budget approved',
            action_date: '2024-01-17T14:20:00'
          }
        ],
        description: 'Office supplies and stationery for Q1 2024',
        invoice_document_url: 'https://example.com/invoices/INV-2024-001.pdf',
        created_at: '2024-01-15T09:00:00'
      },
      {
        id: 'inv-002',
        invoice_no: 'INV-2024-002',
        vendor_id: 'vendor-002',
        vendor_name: 'Tech Solutions Ltd.',
        invoice_date: '2024-01-18',
        due_date: '2024-02-17',
        total_amount: 85000,
        paid_amount: 0,
        remaining_amount: 85000,
        status: 'Pending',
        approval_status: 'Approved',
        approval_history: [
          {
            step_order: 1,
            step_name: 'IT Manager Approval',
            approver_name: 'Mike Davis',
            approver_role: 'IT Manager',
            action: 'Approved',
            comment: 'Required for system upgrade',
            action_date: '2024-01-19T11:15:00'
          },
          {
            step_order: 2,
            step_name: 'Finance Manager Approval',
            approver_name: 'Sarah Johnson',
            approver_role: 'Finance Manager',
            action: 'Approved',
            comment: 'Approved within IT budget',
            action_date: '2024-01-20T16:45:00'
          }
        ],
        description: 'Software licenses and hardware upgrade',
        created_at: '2024-01-18T13:30:00'
      },
      {
        id: 'inv-003',
        invoice_no: 'INV-2024-003',
        vendor_id: 'vendor-003',
        vendor_name: 'Maintenance Services Inc.',
        invoice_date: '2024-01-20',
        due_date: '2024-02-19',
        total_amount: 45000,
        paid_amount: 20000,
        remaining_amount: 25000,
        status: 'Partially_Paid',
        approval_status: 'Approved',
        approval_history: [
          {
            step_order: 1,
            step_name: 'Operations Manager Approval',
            approver_name: 'Lisa Brown',
            approver_role: 'Operations Manager',
            action: 'Approved',
            comment: 'Essential maintenance work',
            action_date: '2024-01-21T09:30:00'
          }
        ],
        description: 'Building maintenance and repairs',
        invoice_document_url: 'https://example.com/invoices/INV-2024-003.pdf',
        created_at: '2024-01-20T15:00:00'
      },
      {
        id: 'inv-004',
        invoice_no: 'INV-2024-004',
        vendor_id: 'vendor-004',
        vendor_name: 'Catering Services',
        invoice_date: '2024-01-22',
        due_date: '2024-02-21',
        total_amount: 15000,
        paid_amount: 0,
        remaining_amount: 15000,
        status: 'Pending',
        approval_status: 'Approved',
        approval_history: [
          {
            step_order: 1,
            step_name: 'HR Manager Approval',
            approver_name: 'David Wilson',
            approver_role: 'HR Manager',
            action: 'Approved',
            comment: 'Approved for company event',
            action_date: '2024-01-23T12:00:00'
          }
        ],
        description: 'Catering for annual company meeting',
        created_at: '2024-01-22T10:15:00'
      },
      {
        id: 'inv-005',
        invoice_no: 'INV-2024-005',
        vendor_id: 'vendor-005',
        vendor_name: 'Transport & Logistics',
        invoice_date: '2024-01-25',
        due_date: '2024-02-24',
        total_amount: 35000,
        paid_amount: 0,
        remaining_amount: 35000,
        status: 'Pending',
        approval_status: 'Approved',
        approval_history: [
          {
            step_order: 1,
            step_name: 'Logistics Manager Approval',
            approver_name: 'Emma Taylor',
            approver_role: 'Logistics Manager',
            action: 'Approved',
            comment: 'Required for product delivery',
            action_date: '2024-01-26T14:30:00'
          }
        ],
        description: 'Transportation and delivery services',
        invoice_document_url: 'https://example.com/invoices/INV-2024-005.pdf',
        created_at: '2024-01-25T11:45:00'
      }
    ];

    localStorage.setItem('procurement_invoices', JSON.stringify(sampleInvoices));
    
    // Only show approved invoices that are not fully paid
    const approvedInvoices = sampleInvoices.filter(
      (inv: Invoice) => inv.approval_status === 'Approved' && inv.status !== 'Paid'
    );
    setInvoices(approvedInvoices);
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

    // Validate that payment amount exactly matches invoice total amount
    if (data.amount_paid !== invoice.total_amount) {
      showToast.error(`Payment amount must exactly match the invoice amount: ${invoice.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      return;
    }

    const bankAccounts = [
      { id: 'bank-1', name: 'Commercial Bank - Main Account', gl_code: '1010-001' },
      { id: 'bank-2', name: 'Awash Bank - Operations', gl_code: '1010-002' },
      { id: 'bank-3', name: 'Cash on Hand', gl_code: '1001-001' }
    ];

    const bankAccount = bankAccounts.find(b => b.id === data.bank_account_id);

    // Mark invoice as paid
    const updatedInvoices = invoices.map(inv =>
      inv.id === data.invoice_id
        ? {
            ...inv,
            status: 'Paid' as 'Pending' | 'Partially_Paid' | 'Paid'
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
              status: 'Paid' as 'Pending' | 'Partially_Paid' | 'Paid'
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
    
    // Reload invoices to remove fully paid ones
    loadInvoices();
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

  const handleViewDocument = (invoice: Invoice) => {
    if (invoice.invoice_document_url) {
      // Open document directly in new tab
      window.open(invoice.invoice_document_url, '_blank');
    } else {
      // Show modal if no document
      setViewingDocInvoice({
        invoiceNo: invoice.invoice_no,
        documentUrl: undefined
      });
    }
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
        onViewDocument={handleViewDocument}
      />

      <RecordPaymentModal
        isOpen={!!recordingPaymentFor}
        onClose={() => setRecordingPaymentFor(null)}
        invoice={recordingPaymentFor}
        onSubmit={handleRecordPayment}
      />

      <ViewInvoiceDocModal
        isOpen={!!viewingDocInvoice}
        onClose={() => setViewingDocInvoice(null)}
        invoiceNumber={viewingDocInvoice?.invoiceNo || ''}
        documentUrl={viewingDocInvoice?.documentUrl}
      />
    </motion.div>
  );
}
