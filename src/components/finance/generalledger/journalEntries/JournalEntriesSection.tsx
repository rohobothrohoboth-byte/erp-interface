import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../../../ui/input';
import JournalEntriesTable from './JournalEntriesTable';
import ViewJournalEntryModal from './ViewJournalEntryModal';
import type { JournalEntryWithLines, UUID, JournalStatus } from '../../../../types/finance/generalLedger';
import { showToast } from '../../../../layout/layout';
import { 
  createARInvoiceJournal, 
  createARPaymentJournal, 
  createAPPaymentJournal, 
  postJournalToGL 
} from '../../../../utils/finance/glAutoPosting';

const JournalEntriesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingEntry, setViewingEntry] = useState<JournalEntryWithLines | null>(null);

  const loadJournalEntries = (): JournalEntryWithLines[] => {
    const stored = localStorage.getItem('journalEntries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure all entries have required fields
        return parsed.map((entry: any) => ({
          ...entry,
          entryNumber: entry.entryNumber || `JE-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5)}`,
          description: entry.description || 'No description',
          reference: entry.reference || '',
          sourceModule: entry.sourceModule || 'Manual',
          sourceReference: entry.sourceReference || '',
          fiscalYear: entry.fiscalYear || new Date().getFullYear().toString(),
          period: entry.period || new Date().toLocaleDateString('en-US', { month: 'long' }),
          status: entry.status || 'Draft',
          totalDebit: entry.totalDebit || 0,
          totalCredit: entry.totalCredit || 0,
          isBalanced: entry.isBalanced || false,
          isReversing: entry.isReversing || false,
          createdBy: entry.createdBy || 'Unknown',
          createdAt: entry.createdAt || new Date().toISOString(),
          rowVersion: entry.rowVersion || 1,
          lines: (entry.lines || []).map((line: any) => ({
            ...line,
            accountCode: line.accountCode || '',
            accountName: line.accountName || 'Unknown Account',
            memo: line.memo || '',
          })),
        }));
      } catch (error) {
        console.error('Error loading journal entries from localStorage:', error);
        // If there's an error, clear localStorage and create fresh sample data
        localStorage.removeItem('journalEntries');
      }
    }
    
    // Sample journal entries with proper structure
    const sampleEntries: JournalEntryWithLines[] = [
      {
        id: '1' as UUID,
        entryNumber: 'JE-2024-001',
        entryDate: '2024-01-15',
        postingDate: '2024-01-15',
        description: 'Office Supplies Purchase',
        reference: 'INV-2024-001',
        sourceModule: 'AP',
        sourceReference: 'Invoice-INV-2024-001',
        fiscalYear: '2024',
        period: 'January',
        status: 'Posted',
        totalDebit: 1500,
        totalCredit: 1500,
        isBalanced: true,
        isReversing: false,
        createdBy: 'John Doe',
        createdAt: '2024-01-15T10:30:00',
        postedBy: 'Jane Smith',
        postedAt: '2024-01-15T11:00:00',
        rowVersion: 1,
        lines: [
          {
            id: '1-1' as UUID,
            journalId: '1' as UUID,
            lineNumber: 1,
            accountId: '10' as UUID,
            accountCode: '5000',
            accountName: 'Office Expenses',
            debit: 1500,
            credit: 0,
            memo: 'Office supplies for January',
            createdAt: '2024-01-15T10:30:00',
            rowVersion: 1,
          },
          {
            id: '1-2' as UUID,
            journalId: '1' as UUID,
            lineNumber: 2,
            accountId: '7' as UUID,
            accountCode: '2110',
            accountName: 'Accounts Payable',
            debit: 0,
            credit: 1500,
            memo: 'Payment due to supplier',
            createdAt: '2024-01-15T10:30:00',
            rowVersion: 1,
          },
        ],
      },
      {
        id: '2' as UUID,
        entryNumber: 'JE-2024-002',
        entryDate: '2024-01-16',
        description: 'Customer Payment Received',
        reference: 'REC-2024-001',
        sourceModule: 'AR',
        sourceReference: 'Receipt-REC-2024-001',
        fiscalYear: '2024',
        period: 'January',
        status: 'Posted',
        totalDebit: 10000,
        totalCredit: 10000,
        isBalanced: true,
        isReversing: false,
        createdBy: 'John Doe',
        createdAt: '2024-01-16T14:20:00',
        postedBy: 'Jane Smith',
        postedAt: '2024-01-16T15:00:00',
        rowVersion: 1,
        lines: [
          {
            id: '2-1' as UUID,
            journalId: '2' as UUID,
            lineNumber: 1,
            accountId: '3' as UUID,
            accountCode: '1110',
            accountName: 'Cash and Bank',
            debit: 10000,
            credit: 0,
            memo: 'Payment received from customer',
            createdAt: '2024-01-16T14:20:00',
            rowVersion: 1,
          },
          {
            id: '2-2' as UUID,
            journalId: '2' as UUID,
            lineNumber: 2,
            accountId: '4' as UUID,
            accountCode: '1120',
            accountName: 'Accounts Receivable',
            debit: 0,
            credit: 10000,
            memo: 'Customer payment applied',
            createdAt: '2024-01-16T14:20:00',
            rowVersion: 1,
          },
        ],
      },
      {
        id: '3' as UUID,
        entryNumber: 'JE-2024-003',
        entryDate: '2024-01-17',
        description: 'Monthly Depreciation',
        sourceModule: 'Manual',
        fiscalYear: '2024',
        period: 'January',
        status: 'Draft',
        totalDebit: 5000,
        totalCredit: 5000,
        isBalanced: true,
        isReversing: false,
        createdBy: 'John Doe',
        createdAt: '2024-01-17T09:15:00',
        rowVersion: 1,
        lines: [
          {
            id: '3-1' as UUID,
            journalId: '3' as UUID,
            lineNumber: 1,
            accountId: '11' as UUID,
            accountCode: '6200',
            accountName: 'Depreciation Expense',
            debit: 5000,
            credit: 0,
            memo: 'Monthly depreciation charge',
            createdAt: '2024-01-17T09:15:00',
            rowVersion: 1,
          },
          {
            id: '3-2' as UUID,
            journalId: '3' as UUID,
            lineNumber: 2,
            accountId: '2' as UUID,
            accountCode: '1200',
            accountName: 'Accumulated Depreciation',
            debit: 0,
            credit: 5000,
            memo: 'Accumulated depreciation',
            createdAt: '2024-01-17T09:15:00',
            rowVersion: 1,
          },
        ],
      },
    ];
    
    localStorage.setItem('journalEntries', JSON.stringify(sampleEntries));
    return sampleEntries;
  };

  const [journalEntries, setJournalEntries] = useState<JournalEntryWithLines[]>(() => {
    const loaded = loadJournalEntries();
    return Array.isArray(loaded) ? loaded : [];
  });

  // Auto-sync with AR/AP data on component mount and refresh
  useEffect(() => {
    syncWithARAPData();
  }, []);

  const syncWithARAPData = async () => {
    try {
      // Get AR invoices and payments
      const arInvoices = JSON.parse(localStorage.getItem('salesInvoices') || '[]');
      const arPayments = JSON.parse(localStorage.getItem('paymentReceipts') || '[]');
      const apPayments = JSON.parse(localStorage.getItem('paymentEntries') || '[]');
      
      const existingJournals = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      const existingRefs = new Set(existingJournals.map((j: any) => j.sourceReference));
      
      let newJournals: JournalEntryWithLines[] = [];
      
      // Create journals for posted AR invoices
      arInvoices
        .filter((inv: any) => inv.status === 'Posted' && !existingRefs.has(`Invoice-${inv.invoice_no}`))
        .forEach((invoice: any) => {
          const journal = createARInvoiceJournal(invoice);
          newJournals.push(journal);
        });
      
      // Create journals for AR payments
      arPayments
        .filter((pmt: any) => pmt.status === 'Posted' && !existingRefs.has(`Receipt-${pmt.receipt_id}`))
        .forEach((payment: any) => {
          const journal = createARPaymentJournal(payment);
          newJournals.push(journal);
        });
      
      // Create journals for AP payments
      apPayments
        .filter((pmt: any) => pmt.status === 'Posted' && !existingRefs.has(`Payment-${pmt.internal_pv_no}`))
        .forEach((payment: any) => {
          const journal = createAPPaymentJournal(payment);
          newJournals.push(journal);
        });
      
      // Post new journals to GL
      newJournals.forEach(journal => {
        postJournalToGL(journal);
      });
      
      if (newJournals.length > 0) {
        showToast.success(`${newJournals.length} automatic journal entries created from AR/AP transactions`);
        // Reload journal entries
        const updatedJournals = loadJournalEntries();
        setJournalEntries(Array.isArray(updatedJournals) ? updatedJournals : []);
      }
      
    } catch (error) {
      console.error('Error syncing with AR/AP data:', error);
      showToast.error('Error syncing with AR/AP data');
    }
  };

  const saveJournalEntries = (updatedEntries: JournalEntryWithLines[]) => {
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    setJournalEntries(updatedEntries);
  };



  const handlePostEntry = (entryId: UUID) => {
    const updatedEntries = journalEntries.map(entry =>
      entry.id === entryId
        ? {
            ...entry,
            status: 'Posted' as JournalStatus,
            postedBy: 'Current User',
            postedAt: new Date().toISOString(),
          }
        : entry
    );
    saveJournalEntries(updatedEntries);
    showToast.success('Journal entry posted successfully');
  };


  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch =
      (entry.entryNumber && entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.reference && entry.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 gap-4 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by entry number, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Journal Entries Table */}
      <JournalEntriesTable
        entries={paginatedEntries}
        onView={setViewingEntry}
        onPost={handlePostEntry}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredEntries.length}
        onPageChange={setCurrentPage}
      />

     

      {viewingEntry && (
        <ViewJournalEntryModal
          isOpen={true}
          onClose={() => setViewingEntry(null)}
          entry={viewingEntry}
        />
      )}

    </div>
  );
};

export default JournalEntriesSection;
