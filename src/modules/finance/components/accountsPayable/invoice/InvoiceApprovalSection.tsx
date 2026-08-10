import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import InvoiceApprovalHeader from '@/modules/finance/components/accountsPayable/invoice/InvoiceApprovalHeader';
import InvoiceApprovalSearchFilter from '@/modules/finance/components/accountsPayable/invoice/InvoiceApprovalSearchFilter';
import InvoiceApprovalList from '@/modules/finance/components/accountsPayable/invoice/InvoiceApprovalList';
import type { Invoice, JournalEntry, ApprovalHistoryItem } from '@/modules/finance/components/accountsPayable/types';

const InvoiceApprovalSection: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    setLoading(true);
    try {
      const storedInvoices = localStorage.getItem('procurement_invoices');
      if (storedInvoices) {
        const parsedInvoices: Invoice[] = JSON.parse(storedInvoices);
        setInvoices(parsedInvoices);
      } else {
        // Create mock invoices with approval workflow
        const mockInvoices = createMockInvoices();
        localStorage.setItem('procurement_invoices', JSON.stringify(mockInvoices));
        setInvoices(mockInvoices);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMockInvoices = (): Invoice[] => {
    const approvalChain = localStorage.getItem('activePaymentApprovalChain');
    const approvalSteps = localStorage.getItem('paymentApprovalSteps');
    
    let approvalHistory: ApprovalHistoryItem[] = [];
    let chainId = '';

    if (approvalChain && approvalSteps) {
      const chain = JSON.parse(approvalChain);
      const steps = JSON.parse(approvalSteps);
      chainId = chain.chain_id;

      approvalHistory = steps.map((step: any) => ({
        step_order: step.step_order,
        step_name: step.step_name,
        approver_name: step.employee_name || 'Unassigned',
        approver_role: step.approver_role,
        action: 'Pending' as const,
      }));
    }

    return [
      {
        id: 'inv-001',
        invoice_no: 'INV-2024-001',
        vendor_id: 'vendor-001',
        vendor_name: 'Office Supplies Ltd',
        invoice_date: '2024-01-15',
        due_date: '2024-02-15',
        total_amount: 15000.0,
        paid_amount: 0,
        remaining_amount: 15000.0,
        status: 'Pending',
        approval_status: 'Pending_Approval',
        current_approval_step: 1,
        approval_chain_id: chainId,
        approval_history: approvalHistory.length > 0 ? approvalHistory : [
          {
            step_order: 1,
            step_name: 'Finance Manager Approval',
            approver_name: 'John Doe',
            approver_role: 'FINANCE_MANAGER',
            action: 'Pending',
          },
        ],
        description: 'Office supplies and stationery for Q1 2024',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'inv-002',
        invoice_no: 'INV-2024-002',
        vendor_id: 'vendor-002',
        vendor_name: 'Tech Solutions Inc',
        invoice_date: '2024-01-20',
        due_date: '2024-02-20',
        total_amount: 45000.0,
        paid_amount: 0,
        remaining_amount: 45000.0,
        status: 'Pending',
        approval_status: 'In_Progress',
        current_approval_step: 2,
        approval_chain_id: chainId,
        approval_history: approvalHistory.length > 0 ? approvalHistory.map((h, i) => ({
          ...h,
          action: i === 0 ? 'Approved' : 'Pending',
          action_date: i === 0 ? '2024-01-21T14:30:00Z' : undefined,
          comment: i === 0 ? 'Approved for payment' : undefined,
        })) : [
          {
            step_order: 1,
            step_name: 'Finance Manager Approval',
            approver_name: 'John Doe',
            approver_role: 'FINANCE_MANAGER',
            action: 'Approved',
            action_date: '2024-01-21T14:30:00Z',
            comment: 'Approved for payment',
          },
          {
            step_order: 2,
            step_name: 'Director Approval',
            approver_name: 'Jane Smith',
            approver_role: 'FINANCE_DIRECTOR',
            action: 'Pending',
          },
        ],
        description: 'Software licenses and IT equipment',
        created_at: '2024-01-20T09:00:00Z',
      },
    ];
  };

  const handleApprove = (invoiceId: string, comment: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const currentStep = invoice.current_approval_step || 1;
    const updatedHistory = invoice.approval_history.map((h) =>
      h.step_order === currentStep
        ? {
            ...h,
            action: 'Approved' as const,
            action_date: new Date().toISOString(),
            comment: comment || undefined,
          }
        : h
    );

    const nextStep = currentStep + 1;
    const isLastStep = nextStep > invoice.approval_history.length;

    const updatedInvoice: Invoice = {
      ...invoice,
      approval_history: updatedHistory,
      current_approval_step: isLastStep ? currentStep : nextStep,
      approval_status: isLastStep ? 'Approved' : 'In_Progress',
    };

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoiceId ? updatedInvoice : inv
    );

    setInvoices(updatedInvoices);
    localStorage.setItem('procurement_invoices', JSON.stringify(updatedInvoices));

    // Create journal entry for approval
    createApprovalJournalEntry(updatedInvoice, 'Approved', comment);

    toast.success(
      isLastStep
        ? 'Invoice fully approved! Now available for payment.'
        : 'Invoice approved and moved to next step.'
    );
  };

  const handleReject = (invoiceId: string, comment: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const currentStep = invoice.current_approval_step || 1;
    const updatedHistory = invoice.approval_history.map((h) =>
      h.step_order === currentStep
        ? {
            ...h,
            action: 'Rejected' as const,
            action_date: new Date().toISOString(),
            comment,
          }
        : h
    );

    const updatedInvoice: Invoice = {
      ...invoice,
      approval_history: updatedHistory,
      approval_status: 'Rejected',
    };

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoiceId ? updatedInvoice : inv
    );

    setInvoices(updatedInvoices);
    localStorage.setItem('procurement_invoices', JSON.stringify(updatedInvoices));

    // Create journal entry for rejection
    createApprovalJournalEntry(updatedInvoice, 'Rejected', comment);

    toast.error('Invoice rejected.');
  };

  const createApprovalJournalEntry = (
    invoice: Invoice,
    action: 'Approved' | 'Rejected',
    comment: string
  ) => {
    const existingEntries = localStorage.getItem('journal_entries');
    const entries: JournalEntry[] = existingEntries ? JSON.parse(existingEntries) : [];

    const newEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entry_no: `JE-${new Date().getFullYear()}-${String(entries.length + 1).padStart(4, '0')}`,
      entry_date: new Date().toISOString().split('T')[0],
      description: `Invoice ${invoice.invoice_no} ${action} - ${comment || 'No comment'}`,
      reference_type: 'Invoice_Approval',
      reference_id: invoice.id,
      total_debit: 0,
      total_credit: 0,
      status: 'Posted',
      lines: [],
      created_at: new Date().toISOString(),
      created_by: 'Current User',
    };

    entries.push(newEntry);
    localStorage.setItem('journal_entries', JSON.stringify(entries));
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || invoice.approval_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <InvoiceApprovalHeader />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <InvoiceApprovalSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading invoices...</p>
          </div>
        ) : (
          <InvoiceApprovalList
            invoices={filteredInvoices}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </motion.div>
    </div>
  );
};

export default InvoiceApprovalSection;
