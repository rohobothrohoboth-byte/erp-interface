// src/pages/finance/PageJournal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, Search, Plus, Eye, Edit, Trash2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry, postJournalEntry } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import AddJournalModal from '@/modules/finance/components/journal/AddJournalModal';

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

const PageJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosted, setFilterPosted] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;

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

  const handleAddJournal = async (journalData: any) => {
    try {
      // Transform the data to match API expectations
      const payload = {
        reference: journalData.journalNumber,
        entryDate: journalData.date,
        description: journalData.description,
        entryType: 'General',
        isPosted: false,
        totalDebit: journalData.lines.reduce((sum: number, line: any) => sum + (parseFloat(line.debit) || 0), 0),
        totalCredit: journalData.lines.reduce((sum: number, line: any) => sum + (parseFloat(line.credit) || 0), 0),
        lines: journalData.lines.map((line: any) => ({
          accountId: line.accountId,
          direction: parseFloat(line.debit) > 0 ? 'Debit' : 'Credit',
          amount: parseFloat(line.debit) || parseFloat(line.credit) || 0,
          description: line.description,
        })),
      };

      await createJournalEntry(payload);
      showToast.success('Journal entry created successfully');
      setIsAddModalOpen(false);
      await fetchEntries();
    } catch (error) {
      console.error('Error creating journal entry:', error);
      showToast.error('Failed to create journal entry');
    }
  };

  const handleEdit = async (entry: JournalEntry) => {
    // TODO: Implement edit functionality
    console.log('Edit entry:', entry);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await deleteJournalEntry(id);
        showToast.success('Journal entry deleted successfully');
        await fetchEntries();
      } catch (error) {
        console.error('Error deleting journal entry:', error);
        showToast.error('Failed to delete journal entry');
      }
    }
  };

  const handlePost = async (id: string) => {
    try {
      await postJournalEntry(id);
      showToast.success('Journal entry posted successfully');
      await fetchEntries();
    } catch (error) {
      console.error('Error posting journal entry:', error);
      showToast.error('Failed to post journal entry');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosted = filterPosted === 'All' ||
        (filterPosted === 'Posted' && entry.isPosted) ||
        (filterPosted === 'Unposted' && !entry.isPosted);
    return matchesSearch && matchesPosted;
  });

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
              <p className="text-sm text-gray-500">Manage journal entries and post to ledger</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
                onClick={fetchEntries}
                variant="outline"
                className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} />
              New Entry
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
                placeholder="Search by reference or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
          </div>
          <div className="md:w-64">
            <select
                value={filterPosted}
                onChange={(e) => setFilterPosted(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Posted">Posted</option>
              <option value="Unposted">Unposted</option>
            </select>
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {paginatedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No journal entries found
                    </td>
                  </tr>
              ) : (
                  paginatedEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium text-xs">
                            {entry.reference.split('-').pop()}
                          </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{entry.reference}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(entry.entryDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{entry.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{entry.entryType}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">
                          {entry.totalDebit > 0 ? formatCurrency(entry.totalDebit) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">
                          {entry.totalCredit > 0 ? formatCurrency(entry.totalCredit) : '-'}
                        </td>
                        <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.isPosted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {entry.isPosted ? 'Posted' : 'Unposted'}
                      </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Popover open={popoverOpen === entry.id} onOpenChange={(open) => setPopoverOpen(open ? entry.id : null)}>
                            <PopoverTrigger asChild>
                              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <MoreVertical size={18} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="end">
                              <div className="py-1">
                                {!entry.isPosted && (
                                    <button
                                        onClick={() => {
                                          handlePost(entry.id);
                                          setPopoverOpen(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-green-600 flex items-center gap-2"
                                    >
                                      <CheckCircle size={16} />
                                      Post
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                      handleEdit(entry);
                                      setPopoverOpen(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-indigo-600 flex items-center gap-2"
                                >
                                  <Edit size={16} />
                                  Edit
                                </button>
                                <button
                                    onClick={() => {
                                      handleDelete(entry.id);
                                      setPopoverOpen(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredEntries.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredEntries.length)} of {filteredEntries.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages || 1}
              </span>
                  <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* Add Journal Modal */}
        <AddJournalModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddJournal={handleAddJournal}
        />
      </motion.div>
  );
};

// Add CheckCircle import
import { CheckCircle } from 'lucide-react';

export default PageJournal;