import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../layout/layout';
import PaymentEntryHeader from './payment/PaymentEntryHeader';
import PaymentEntrySearchFilter from './payment/PaymentEntrySearchFilter';
import PaymentEntryTable from './PaymentEntryTable';
import AddPaymentModal from './AddPaymentModal';
import EditPaymentModal from './EditPaymentModal';
import ViewPaymentModal from './ViewPaymentModal';
import DeletePaymentModal from './DeletePaymentModal';
import type { PaymentEntry } from './types';

export default function PaymentEntrySection() {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<PaymentEntry | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentEntry | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<PaymentEntry | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = () => {
    const stored = localStorage.getItem('paymentEntries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPayments(parsed);
      } catch (e) {
        console.error('Error parsing payment entries:', e);
      }
    }
  };

  const savePayments = (updatedPayments: PaymentEntry[]) => {
    localStorage.setItem('paymentEntries', JSON.stringify(updatedPayments));
    setPayments(updatedPayments);
  };

  const generatePVNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const sequence = String(payments.length + 1).padStart(4, '0');
    return `PV-${year}-${month}-${sequence}`;
  };

  const handleAddPayment = (data: {
    external_bank_ref: string;
    vendor_id: string;
    payment_date: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';
    bank_account_id: string;
    invoices_to_pay: Array<{
      invoice_id: string;
      invoice_no: string;
      amount_paid: number;
    }>;
    total_amount: number;
    attachment_url?: string;
  }) => {
    // Mock vendor and bank account names
    const vendors = [
      { id: 'vendor-1', name: 'ABC Suppliers Ltd' },
      { id: 'vendor-2', name: 'XYZ Trading Co' },
      { id: 'vendor-3', name: 'Global Imports Inc' }
    ];

    const bankAccounts = [
      { id: 'bank-1', name: 'Commercial Bank - Main Account' },
      { id: 'bank-2', name: 'Awash Bank - Operations' },
      { id: 'bank-3', name: 'Cash on Hand' }
    ];

    const newPayment: PaymentEntry = {
      id: `payment-${Date.now()}`,
      internal_pv_no: generatePVNumber(),
      external_bank_ref: data.external_bank_ref,
      vendor_id: data.vendor_id,
      vendor_name: vendors.find(v => v.id === data.vendor_id)?.name || 'Unknown Vendor',
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      bank_account_id: data.bank_account_id,
      bank_account_name: bankAccounts.find(b => b.id === data.bank_account_id)?.name || 'Unknown Account',
      total_amount: data.total_amount,
      invoices_paid: data.invoices_to_pay,
      attachment_url: data.attachment_url,
      status: 'Draft',
      created_at: new Date().toISOString(),
      created_by: 'Current User'
    };

    savePayments([...payments, newPayment]);
    
    // Create journal entries (mock)
    createJournalEntries(newPayment);
    
    // Update invoice statuses (mock)
    updateInvoiceStatuses(data.invoices_to_pay);
    
    showToast.success(`Payment entry ${newPayment.internal_pv_no} created successfully`);
    setIsAddModalOpen(false);
  };

  const handleEditPayment = (data: {
    external_bank_ref: string;
    payment_date: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';
    bank_account_id: string;
    attachment_url?: string;
  }) => {
    if (!editingPayment) return;

    const bankAccounts = [
      { id: 'bank-1', name: 'Commercial Bank - Main Account' },
      { id: 'bank-2', name: 'Awash Bank - Operations' },
      { id: 'bank-3', name: 'Cash on Hand' }
    ];

    const updatedPayments = payments.map(p =>
      p.id === editingPayment.id
        ? {
            ...p,
            external_bank_ref: data.external_bank_ref,
            payment_date: data.payment_date,
            payment_method: data.payment_method,
            bank_account_id: data.bank_account_id,
            bank_account_name: bankAccounts.find(b => b.id === data.bank_account_id)?.name || p.bank_account_name,
            attachment_url: data.attachment_url
          }
        : p
    );

    savePayments(updatedPayments);
    showToast.success('Payment entry updated successfully');
    setEditingPayment(null);
  };

  const handleDeletePayment = () => {
    if (!deletingPayment) return;

    savePayments(payments.filter(p => p.id !== deletingPayment.id));
    showToast.success('Payment entry deleted successfully');
    setDeletingPayment(null);
  };

  const createJournalEntries = (payment: PaymentEntry) => {
    // Mock journal entry creation
    const journalEntry = {
      id: `je-${Date.now()}`,
      entry_no: `JE-${Date.now()}`,
      date: payment.payment_date,
      description: `Payment to ${payment.vendor_name} - ${payment.internal_pv_no}`,
      lines: [
        {
          account: 'Accounts Payable',
          debit: payment.total_amount,
          credit: 0
        },
        {
          account: payment.bank_account_name,
          debit: 0,
          credit: payment.total_amount
        }
      ],
      created_at: new Date().toISOString(),
      created_by: 'System - AP Module'
    };

    // Store journal entry
    const storedJournals = localStorage.getItem('journalEntries');
    const journals = storedJournals ? JSON.parse(storedJournals) : [];
    journals.push(journalEntry);
    localStorage.setItem('journalEntries', JSON.stringify(journals));

    console.log('Journal Entry Created:', journalEntry);
  };

  const updateInvoiceStatuses = (invoices: Array<{ invoice_id: string; amount_paid: number }>) => {
    // Mock invoice status update
    console.log('Updating invoice statuses to PAID:', invoices);
    
    // In real implementation, this would update the Procurement_Invoices table
    const storedInvoices = localStorage.getItem('procurementInvoices');
    if (storedInvoices) {
      const allInvoices = JSON.parse(storedInvoices);
      const updatedInvoices = allInvoices.map((inv: any) => {
        const paidInvoice = invoices.find(i => i.invoice_id === inv.id);
        if (paidInvoice) {
          return {
            ...inv,
            status: 'Paid',
            paid_amount: (inv.paid_amount || 0) + paidInvoice.amount_paid,
            payment_date: new Date().toISOString()
          };
        }
        return inv;
      });
      localStorage.setItem('procurementInvoices', JSON.stringify(updatedInvoices));
    }
  };

  const filteredPayments = payments.filter(p =>
    p.internal_pv_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.external_bank_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoices_paid.some(inv => inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPayments.length / 10);

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

      <PaymentEntryTable
        payments={filteredPayments}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPayments.length}
        onPageChange={setCurrentPage}
        onView={setViewingPayment}
        onEdit={setEditingPayment}
        onDelete={setDeletingPayment}
      />

      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPayment}
      />

      <EditPaymentModal
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        onSubmit={handleEditPayment}
        payment={editingPayment}
      />

      <ViewPaymentModal
        isOpen={!!viewingPayment}
        onClose={() => setViewingPayment(null)}
        payment={viewingPayment}
      />

      <DeletePaymentModal
        isOpen={!!deletingPayment}
        onClose={() => setDeletingPayment(null)}
        onConfirm={handleDeletePayment}
        paymentNumber={deletingPayment?.internal_pv_no || ''}
      />
    </motion.div>
  );
}
