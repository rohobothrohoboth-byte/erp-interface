// src/components/finance/generalledger/journalEntries/JournalEntriesSection.tsx
import React, { useState, useEffect } from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import JournalEntriesTable from './JournalEntriesTable';
import ViewJournalEntryModal from './ViewJournalEntryModal';
import { getJournalEntries, postJournalEntry }  from '../../../../services/finance/finance.api';
import { showToast } from '../../../../layout/layout';

interface JournalEntry {
  id: string;
  reference: string;
  entryDate: string;
  description: string;
  entryType: string;
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  postedDate?: string;
  financialPeriodId?: string;
  branchId?: string;
  departmentId?: string;
  employeeId?: string;
  lines: Array<{
    id: string;
    accountId: string;
    accountName?: string;
    accountCode?: string;
    direction: string;
    amount: number;
    description?: string;
  }>;
  dateAdd: string;
  dateMod?: string;
}

const JournalEntriesSection: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [filterPosted, setFilterPosted] = useState<string>('All');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await getJournalEntries();
      const data = res.data.data || res.data || [];
      setEntries(data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      showToast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handlePostEntry = async (entryId: string) => {
    try {
      await postJournalEntry(entryId);
      showToast.success('Journal entry posted successfully');
      await fetchEntries();
    } catch (error) {
      console.error('Error posting journal entry:', error);
      showToast.error('Failed to post journal entry');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
        (entry.reference && entry.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPosted = filterPosted === 'All' ||
        (filterPosted === 'Posted' && entry.isPosted) ||
        (filterPosted === 'Unposted' && !entry.isPosted);

    return matchesSearch && matchesPosted;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
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
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 gap-4 w-full flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    placeholder="Search by reference or description..."
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

              <select
                  value={filterPosted}
                  onChange={(e) => setFilterPosted(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Posted">Posted</option>
                <option value="Unposted">Unposted</option>
              </select>
            </div>

            <Button
                onClick={fetchEntries}
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
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