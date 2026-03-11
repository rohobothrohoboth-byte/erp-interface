import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ComboboxOption } from '../../../ui/combobox';
import ViewJournalEntryModal from '../journalEntries/ViewJournalEntryModal';
import AccountSearchFilter from './AccountSearchFilter';
import AccountLedgerTable from './AccountLedgerTable';
import type { ChartOfAccount, UUID, JournalEntryWithLines } from '../../../../types/finance/generalLedger';
import { getAccountLedger } from '../../../../utils/finance/glAutoPosting';

interface LedgerTransaction {
  id: string;
  date: string;
  description: string;
  postReference: string;
  journalId: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'Debit' | 'Credit';
  createdAt: string;
}

const ChartOfAccountsSection: React.FC = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingJournal, setViewingJournal] = useState<JournalEntryWithLines | null>(null);
  const itemsPerPage = 15;

  const loadAccounts = (): ChartOfAccount[] => {
    const stored = localStorage.getItem('chartOfAccounts');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default Chart of Accounts for Ethiopian IFRS compliance
    const defaultAccounts: ChartOfAccount[] = [
      {
        id: '1' as UUID,
        code: '1000',
        name: 'Assets',
        nameAm: 'ንብረቶች',
        accountType: 'Asset',
        parentId: null,
        level: 1,
        balance: 0,
        debitBalance: 0,
        creditBalance: 0,
        currency: 'ETB',
        status: 'Active',
        isControlAccount: true,
        allowManualEntry: false,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        rowVersion: 1
      },
      {
        id: '2' as UUID,
        code: '1100',
        name: 'Current Assets',
        nameAm: 'የአሁን ንብረቶች',
        accountType: 'Asset',
        parentId: '1' as UUID,
        level: 2,
        balance: 0,
        debitBalance: 0,
        creditBalance: 0,
        currency: 'ETB',
        status: 'Active',
        isControlAccount: true,
        allowManualEntry: false,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        rowVersion: 1
      },
      {
        id: '3' as UUID,
        code: '1110',
        name: 'Cash and Bank',
        nameAm: 'ጥሬ ገንዘብ እና ባንክ',
        accountType: 'Asset',
        parentId: '2' as UUID,
        level: 3,
        balance: 150000,
        debitBalance: 150000,
        creditBalance: 0,
        currency: 'ETB',
        status: 'Active',
        isControlAccount: false,
        allowManualEntry: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        rowVersion: 1
      },
      {
        id: '4' as UUID,
        code: '1120',
        name: 'Accounts Receivable',
        nameAm: 'ተቀባይ ሂሳቦች',
        accountType: 'Asset',
        parentId: '2' as UUID,
        level: 3,
        balance: 250000,
        debitBalance: 250000,
        creditBalance: 0,
        currency: 'ETB',
        status: 'Active',
        isControlAccount: false,
        allowManualEntry: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        rowVersion: 1
      },
      {
        id: '5' as UUID,
        code: '2000',
        name: 'Liabilities',
        nameAm: 'ዕዳዎች',
        accountType: 'Liability',
        parentId: null,
        level: 1,
        balance: 0,
        debitBalance: 0,
        creditBalance: 0,
        currency: 'ETB',
        status: 'Active',
        isControlAccount: true,
        allowManualEntry: false,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        rowVersion: 1
      },
      {
        id: '6' as UUID,
        code: '2100',
        name: 'Current Liabilities',
        nameAm: 'የአሁን ዕዳዎች',
        accountType: 'Liability',
        parentId: '5' as UUID,
        level: 2,
        balance: 0,
        debitBalance: 0,
        creditBalance: 0,
        currency: 'ETB',
        status: 'Active',
        isControlAccount: true,
        allowManualEntry: false,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        rowVersion: 1
      },
      {
        id: '7' as UUID,
        code: '2110',
        name: 'Accounts Payable',
        nameAm: 'ተከፋይ ሂሳቦች',
        accountType: 'Liability',
        parentId: '6' as UUID,
        level: 3,
        balance: 180000,
        debitBalance: 0,
        creditBalance: 180000,
        currency: 'ETB',
        status: 'Active',
        isControlAccount: false,
        allowManualEntry: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        rowVersion: 1
      },
      {
        id: '8' as UUID,
        code: '3000',
        name: 'Equity',
        nameAm: 'ካፒታል',
        accountType: 'Equity',
        parentId: null,
        level: 1,
        balance: 200000,
        debitBalance: 0,
        creditBalance: 200000,
        currency: 'ETB',
        status: 'Active',
        isControlAccount: true,
        allowManualEntry: false,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        rowVersion: 1
      },
      {
        id: '9' as UUID,
        code: '4000',
        name: 'Revenue',
        nameAm: 'ገቢ',
        accountType: 'Revenue',
        parentId: null,
        level: 1,
        balance: 800000,
        debitBalance: 0,
        creditBalance: 800000,
        currency: 'ETB',
        status: 'Active',
        isControlAccount: true,
        allowManualEntry: false,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        rowVersion: 1
      },
      {
        id: '10' as UUID,
        code: '5000',
        name: 'Expenses',
        nameAm: 'ወጪዎች',
        accountType: 'Expense',
        parentId: null,
        level: 1,
        balance: 450000,
        debitBalance: 450000,
        creditBalance: 0,
        currency: 'ETB',
        status: 'Active',
        isControlAccount: true,
        allowManualEntry: false,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        rowVersion: 1
      }
    ];
    
    localStorage.setItem('chartOfAccounts', JSON.stringify(defaultAccounts));
    return defaultAccounts;
  };

  const [accounts] = useState<ChartOfAccount[]>(loadAccounts());

  // Load transactions when account is selected
  useEffect(() => {
    if (selectedAccount) {
      const ledger = getAccountLedger(selectedAccount.code);
      setTransactions(ledger);
      setCurrentPage(1);
    } else {
      setTransactions([]);
    }
  }, [selectedAccount]);

  // Handle account selection
  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    const account = accounts.find(acc => acc.id === accountId);
    setSelectedAccount(account || null);
  };

  // Prepare options for the combobox
  const accountOptions: ComboboxOption[] = accounts.map(account => ({
    value: account.id,
    label: `${account.code} - ${account.name}`,
    searchLabel: `${account.code} ${account.name} ${account.nameAm || ''}`.toLowerCase()
  }));

  // Handle journal view
  const handleViewJournal = (journalId: string) => {
    const journals = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const journal = journals.find((j: JournalEntryWithLines) => j.id === journalId);
    if (journal) {
      setViewingJournal(journal);
    }
  };

  // Pagination for transactions
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Account Search Filter */}
      <AccountSearchFilter
        accountOptions={accountOptions}
        selectedAccountId={selectedAccountId}
        onAccountSelect={handleAccountSelect}
      />

      {/* Account Ledger Table */}
      {selectedAccount && (
        <AccountLedgerTable
          transactions={paginatedTransactions}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={transactions.length}
          onPageChange={setCurrentPage}
          onViewJournal={handleViewJournal}
          accountCode={selectedAccount.code}
          accountName={selectedAccount.name}
        />
      )}

      {/* Journal View Modal */}
      {viewingJournal && (
        <ViewJournalEntryModal
          isOpen={true}
          onClose={() => setViewingJournal(null)}
          entry={viewingJournal}
        />
      )}
    </motion.div>
  );
};

export default ChartOfAccountsSection;