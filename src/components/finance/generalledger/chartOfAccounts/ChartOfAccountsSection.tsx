// src/components/finance/generalledger/chartOfAccounts/ChartOfAccountsSection.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ComboboxOption } from '../../../ui/combobox';
import ViewJournalEntryModal from '../journalEntries/ViewJournalEntryModal';
import AccountSearchFilter from './AccountSearchFilter';
import AccountLedgerTable from './AccountLedgerTable';
import { getAccounts, getJournalEntries } from '../../../../services/finance/finance.api';
import { showToast } from '../../../../layout/layout';

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

interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  nameAm?: string;
  accountType: string;
  accountSubType?: string;
  parentId?: string;
  parentName?: string;
  level: number;
  isActive: boolean;
  description?: string;
  openingBalance?: number;
  dateAdd: string;
  dateMod?: string;
}

const ChartOfAccountsSection: React.FC = () => {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingJournal, setViewingJournal] = useState<any | null>(null);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await getAccounts();
      const data = res.data.data || res.data || [];
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showToast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  // Load transactions when account is selected
  useEffect(() => {
    if (selectedAccount) {
      fetchAccountTransactions(selectedAccount);
    } else {
      setTransactions([]);
    }
  }, [selectedAccount]);

  const fetchAccountTransactions = async (account: ChartOfAccount) => {
    try {
      // Get all journal entries
      const res = await getJournalEntries({ accountId: account.id });
      const entries = res.data.data || res.data || [];

      // Transform to ledger transactions
      const ledgerTransactions: LedgerTransaction[] = entries.flatMap((entry: any) =>
          entry.lines
              .filter((line: any) => line.accountId === account.id)
              .map((line: any) => ({
                id: `${entry.id}-${line.id}`,
                date: entry.entryDate,
                description: entry.description || line.description || 'Journal entry',
                postReference: entry.reference,
                journalId: entry.id,
                debit: line.direction === 'Debit' ? line.amount : 0,
                credit: line.direction === 'Credit' ? line.amount : 0,
                balance: 0, // Calculate balance
                balanceType: line.direction === 'Debit' ? 'Debit' : 'Credit',
                createdAt: entry.dateAdd,
              }))
      );

      // Calculate running balance
      let runningBalance = account.openingBalance || 0;
      ledgerTransactions.forEach(t => {
        runningBalance += t.debit - t.credit;
        t.balance = runningBalance;
      });

      setTransactions(ledgerTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast.error('Failed to load account transactions');
    }
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    const account = accounts.find(acc => acc.id === accountId);
    setSelectedAccount(account || null);
  };

  const accountOptions: ComboboxOption[] = accounts.map(account => ({
    value: account.id,
    label: `${account.code} - ${account.name}`,
    searchLabel: `${account.code} ${account.name} ${account.nameAm || ''}`.toLowerCase()
  }));

  const handleViewJournal = (journalId: string) => {
    // Fetch journal entry by ID
    // For now, we'll show a placeholder
    setViewingJournal({ id: journalId, reference: `JE-${journalId.substring(0, 8)}` });
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

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

        {/* Journal View Modal - Simplified */}
        {viewingJournal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b px-6 py-4">
                  <h2 className="text-lg font-bold text-gray-900">Journal Entry</h2>
                  <button
                      onClick={() => setViewingJournal(null)}
                      className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6">
                  <p><strong>Reference:</strong> {viewingJournal.reference}</p>
                  <p><strong>ID:</strong> {viewingJournal.id}</p>
                  <p className="text-sm text-gray-500 mt-4">Journal entry details would appear here</p>
                </div>
                <div className="border-t px-6 py-4 flex justify-end">
                  <button
                      onClick={() => setViewingJournal(null)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
        )}
      </motion.div>
  );
};

export default ChartOfAccountsSection;