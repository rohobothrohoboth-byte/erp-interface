import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import InvoicePostingHeader from '@/modules/finance/components/accountsReceivable/invoicePosting/InvoicePostingHeader';
import InvoicePostingSearchFilter from '@/modules/finance/components/accountsReceivable/invoicePosting/InvoicePostingSearchFilter';
import InvoicePostingTable from '@/modules/finance/components/accountsReceivable/invoicePosting/InvoicePostingTable';
import type { SalesInvoice, JournalEntry } from '@/modules/finance/components/accountsReceivable/types';

export default function InvoicePostingSection() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const stored = localStorage.getItem('sales_invoices');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setInvoices(parsed);
      } catch (e) {
        console.error('Error parsing invoices:', e);
        // Create mock data
        const mockInvoices = createMockInvoices();
        localStorage.setItem('sales_invoices', JSON.stringify(mockInvoices));
        setInvoices(mockInvoices);
      }
    } else {
      // Create mock data
      const mockInvoices = createMockInvoices();
      localStorage.setItem('sales_invoices', JSON.stringify(mockInvoices));
      setInvoices(mockInvoices);
    }
  };

  const createMockInvoices = (): SalesInvoice[] => {
    return [
      {
        id: 'inv-001',
        invoice_no: 'INV-2024-001',
        customer_id: 'cust-001',
        customer_name: 'ABC Tours & Travel',
        invoice_date: '2024-03-01',
        due_date: '2024-03-31',
        total_amount: 50000.0,
        paid_amount: 0,
        remaining_amount: 50000.0,
        status: 'Draft',
        description: 'Tour package for 10 people - Lalibela & Axum',
        created_at: '2024-03-01T10:00:00Z'
      },
      {
        id: 'inv-002',
        invoice_no: 'INV-2024-002',
        customer_id: 'cust-002',
        customer_name: 'XYZ Corporate Services',
        invoice_date: '2024-03-05',
        due_date: '2024-04-05',
        total_amount: 75000.0,
        paid_amount: 0,
        remaining_amount: 75000.0,
        status: 'Draft',
        description: 'Conference venue and catering services',
        created_at: '2024-03-05T14:30:00Z'
      },
      {
        id: 'inv-003',
        invoice_no: 'INV-2024-003',
        customer_id: 'cust-003',
        customer_name: 'Safari Adventures Ltd',
        invoice_date: '2024-02-20',
        due_date: '2024-03-20',
        total_amount: 120000.0,
        paid_amount: 0,
        remaining_amount: 120000.0,
        status: 'Posted',
        description: 'Simien Mountains trekking package',
        created_at: '2024-02-20T09:00:00Z',
        posted_at: '2024-02-21T10:00:00Z',
        posted_by: 'Finance Manager'
      }
    ];
  };

  const handlePostInvoice = (invoice: SalesInvoice) => {
    if (invoice.status !== 'Draft') {
      toast.error('Only draft invoices can be posted');
      return;
    }

    // Update invoice status
    const updatedInvoice: SalesInvoice = {
      ...invoice,
      status: 'Posted',
      posted_at: new Date().toISOString(),
      posted_by: 'Current User'
    };

    const updatedInvoices = invoices.map(inv =>
      inv.id === invoice.id ? updatedInvoice : inv
    );

    setInvoices(updatedInvoices);
    localStorage.setItem('sales_invoices', JSON.stringify(updatedInvoices));

    // Create journal entry
    createPostingJournalEntry(updatedInvoice);

    toast.success(`Invoice ${invoice.invoice_no} posted successfully`);
  };

  const createPostingJournalEntry = (invoice: SalesInvoice) => {
    const storedJournals = localStorage.getItem('journal_entries');
    const journals: JournalEntry[] = storedJournals ? JSON.parse(storedJournals) : [];

    const newEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entry_no: `JE-${new Date().getFullYear()}-${String(journals.length + 1).padStart(4, '0')}`,
      entry_date: new Date().toISOString().split('T')[0],
      description: `Revenue recognition for ${invoice.invoice_no} - ${invoice.customer_name}`,
      reference_type: 'Invoice_Posting',
      reference_id: invoice.id,
      total_debit: invoice.total_amount,
      total_credit: invoice.total_amount,
      status: 'Posted',
      lines: [
        {
          account: 'Accounts Receivable',
          account_code: '1200-001',
          debit: invoice.total_amount,
          credit: 0,
          description: `AR from ${invoice.customer_name}`
        },
        {
          account: 'Tour Revenue',
          account_code: '4000-001',
          debit: 0,
          credit: invoice.total_amount,
          description: `Revenue from ${invoice.description}`
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

  const handleViewDetails = (invoice: SalesInvoice) => {
    // TODO: Implement view details modal
    console.log('View invoice:', invoice);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <InvoicePostingHeader />

      <InvoicePostingSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <InvoicePostingTable
        invoices={filteredInvoices}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredInvoices.length}
        onPageChange={setCurrentPage}
        onPostInvoice={handlePostInvoice}
        onViewDetails={handleViewDetails}
      />
    </motion.div>
  );
}
