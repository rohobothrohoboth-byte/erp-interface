import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PaymentListHeader from './PaymentListHeader';
import PaymentListSearchFilter from './PaymentListSearchFilter';
import PaymentListTable from './PaymentListTable';
import ViewInvoiceDocModal from '../PaymentEntry/ViewInvoiceDocModal';
import type { Invoice } from '../types';

interface Payment {
  id: string;
  internal_pv_no: string;
  external_bank_ref: string;
  vendor_id: string;
  vendor_name: string;
  invoice_id: string;
  invoice_no: string;
  payment_date: string;
  payment_method: string;
  bank_account_id: string;
  bank_account_name: string;
  total_amount: number;
  attachment_url?: string;
  status: string;
  created_at: string;
  created_by: string;
}

export default function PaymentListSection() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingDocInvoice, setViewingDocInvoice] = useState<{ invoiceNo: string; documentUrl?: string } | null>(null);

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
        console.error('Error parsing payments:', e);
        createSamplePayments();
      }
    } else {
      createSamplePayments();
    }
  };

  const createSamplePayments = () => {
    const samplePayments: Payment[] = [
      {
        id: 'payment-001',
        internal_pv_no: 'PV-2024-01-0001',
        external_bank_ref: 'TXN-CBE-240115-001',
        vendor_id: 'vendor-001',
        vendor_name: 'Office Supplies Co.',
        invoice_id: 'inv-001',
        invoice_no: 'INV-2024-001',
        payment_date: '2024-01-28',
        payment_method: 'Bank_Transfer',
        bank_account_id: 'bank-1',
        bank_account_name: 'Commercial Bank - Main Account',
        total_amount: 25000,
        attachment_url: 'https://example.com/payments/PV-2024-01-0001.pdf',
        status: 'Posted',
        created_at: '2024-01-28T10:30:00',
        created_by: 'Finance Officer'
      },
      {
        id: 'payment-002',
        internal_pv_no: 'PV-2024-01-0002',
        external_bank_ref: 'TXN-AWB-240130-002',
        vendor_id: 'vendor-003',
        vendor_name: 'Maintenance Services Inc.',
        invoice_id: 'inv-003',
        invoice_no: 'INV-2024-003',
        payment_date: '2024-01-30',
        payment_method: 'Bank_Transfer',
        bank_account_id: 'bank-2',
        bank_account_name: 'Awash Bank - Operations',
        total_amount: 20000,
        attachment_url: 'https://example.com/payments/PV-2024-01-0002.pdf',
        status: 'Posted',
        created_at: '2024-01-30T14:15:00',
        created_by: 'Finance Manager'
      },
      {
        id: 'payment-003',
        internal_pv_no: 'PV-2024-02-0001',
        external_bank_ref: 'CHK-001234',
        vendor_id: 'vendor-004',
        vendor_name: 'Catering Services',
        invoice_id: 'inv-004',
        invoice_no: 'INV-2024-004',
        payment_date: '2024-02-01',
        payment_method: 'Check',
        bank_account_id: 'bank-1',
        bank_account_name: 'Commercial Bank - Main Account',
        total_amount: 15000,
        status: 'Posted',
        created_at: '2024-02-01T11:20:00',
        created_by: 'Accounts Payable Clerk'
      },
      {
        id: 'payment-004',
        internal_pv_no: 'PV-2024-02-0002',
        external_bank_ref: 'TXN-TEL-240203-001',
        vendor_id: 'vendor-005',
        vendor_name: 'Transport & Logistics',
        invoice_id: 'inv-005',
        invoice_no: 'INV-2024-005',
        payment_date: '2024-02-03',
        payment_method: 'Telebirr',
        bank_account_id: 'bank-3',
        bank_account_name: 'Cash on Hand',
        total_amount: 35000,
        attachment_url: 'https://example.com/payments/PV-2024-02-0002.pdf',
        status: 'Posted',
        created_at: '2024-02-03T16:45:00',
        created_by: 'Finance Officer'
      },
      {
        id: 'payment-005',
        internal_pv_no: 'PV-2024-02-0003',
        external_bank_ref: 'TXN-CBE-240205-003',
        vendor_id: 'vendor-002',
        vendor_name: 'Tech Solutions Ltd.',
        invoice_id: 'inv-002',
        invoice_no: 'INV-2024-002',
        payment_date: '2024-02-05',
        payment_method: 'Bank_Transfer',
        bank_account_id: 'bank-1',
        bank_account_name: 'Commercial Bank - Main Account',
        total_amount: 85000,
        attachment_url: 'https://example.com/payments/PV-2024-02-0003.pdf',
        status: 'Posted',
        created_at: '2024-02-05T13:10:00',
        created_by: 'Finance Manager'
      },
      {
        id: 'payment-006',
        internal_pv_no: 'PV-2024-02-0004',
        external_bank_ref: 'CASH-240207-001',
        vendor_id: 'vendor-006',
        vendor_name: 'Local Supplier',
        invoice_id: 'inv-006',
        invoice_no: 'INV-2024-006',
        payment_date: '2024-02-07',
        payment_method: 'Cash',
        bank_account_id: 'bank-3',
        bank_account_name: 'Cash on Hand',
        total_amount: 8500,
        status: 'Posted',
        created_at: '2024-02-07T09:30:00',
        created_by: 'Petty Cash Officer'
      }
    ];

    localStorage.setItem('paymentEntries', JSON.stringify(samplePayments));
    setPayments(samplePayments);
  };

  const handleViewInvoice = (payment: Payment) => {
    // Load the invoice from localStorage
    const storedInvoices = localStorage.getItem('procurement_invoices');
    if (storedInvoices) {
      try {
        const invoices: Invoice[] = JSON.parse(storedInvoices);
        const invoice = invoices.find(inv => inv.id === payment.invoice_id);
        if (invoice) {
          if (invoice.invoice_document_url) {
            // Open document directly in new tab
            window.open(invoice.invoice_document_url, '_blank');
          } else {
            // Show modal if no document
            setViewingDocInvoice({
              invoiceNo: payment.invoice_no,
              documentUrl: undefined
            });
          }
        } else {
          // Show modal if invoice not found
          setViewingDocInvoice({
            invoiceNo: payment.invoice_no,
            documentUrl: undefined
          });
        }
      } catch (e) {
        console.error('Error loading invoice:', e);
        setViewingDocInvoice({
          invoiceNo: payment.invoice_no,
          documentUrl: undefined
        });
      }
    } else {
      setViewingDocInvoice({
        invoiceNo: payment.invoice_no,
        documentUrl: undefined
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.internal_pv_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.external_bank_ref.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod =
      paymentMethodFilter === 'all' || payment.payment_method === paymentMethodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalPages = Math.ceil(filteredPayments.length / 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PaymentListHeader />

      <PaymentListSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
      />

      <PaymentListTable
        payments={filteredPayments}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPayments.length}
        onPageChange={setCurrentPage}
        onViewInvoice={handleViewInvoice}
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
