import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Edit,
  FileText,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  postJournalEntry,
} from '@/modules/finance/services/finance.api';
import { journalEntryService } from '@/modules/finance/services/journal-entries/journalEntryService';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import AddJournalModal from '@/modules/finance/components/journal/AddJournalModal';
import EditJournalModal from '@/modules/finance/components/journal/EditJournalModal';

interface JournalLine {
  id: string;
  accountId: string;
  accountName?: string;
  accountCode?: string;
  direction: string;
  amount: number;
  description?: string;
}

interface JournalEntry {
  id: string;
  reference: string;
  entryDate: string;
  description: string;
  entryType: string;
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  isApproved?: boolean;
  isReversed?: boolean;
  postedDate?: string;
  periodId?: string;
  periodName?: string;
  branchId?: string | null;
  departmentId?: string | null;
  employeeId?: string | null;
  rowVersion?: string | null;
  lines: JournalLine[];
  dateAdd: string;
  dateMod?: string;
}

interface ReferenceAccount {
  id: string;
  code?: string;
  name?: string;
  accountType?: string;
  normalBalance?: string;
}

interface ReferencePeriod {
  id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  isClosed?: boolean;
}

const extractArray = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

// Keep calendar dates stable. Do not use toLocaleDateString() on a UTC midnight
// value because it can move the displayed date backward/forward by timezone.
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const dateOnly = dateString.slice(0, 10);
  const [year, month, day] = dateOnly.split('-').map(Number);
  if (!year || !month || !day) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

const PageJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [accounts, setAccounts] = useState<ReferenceAccount[]>([]);
  const [periods, setPeriods] = useState<ReferencePeriod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosted, setFilterPosted] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPosted]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await getJournalEntries({ page: 1, pageSize: 100, sortBy: 'entrydate', sortOrder: 'DESC' });
      const data = extractArray(res.data);
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
      const lines = journalData.lines.map((line: any) => ({
        accountId: line.accountId,
        direction: Number(line.debit) > 0 ? 'Debit' : 'Credit',
        amount: Number(line.debit) > 0 ? Number(line.debit) : Number(line.credit),
        description: line.description || '',
      }));

      const totalDebit = lines
        .filter((line: any) => line.direction === 'Debit')
        .reduce((sum: number, line: any) => sum + line.amount, 0);
      const totalCredit = lines
        .filter((line: any) => line.direction === 'Credit')
        .reduce((sum: number, line: any) => sum + line.amount, 0);

      await createJournalEntry({
        reference: journalData.journalNumber,
        entryDate: `${journalData.date}T00:00:00.000Z`,
        description: journalData.description || '',
        entryType: 'General',
        periodId: journalData.periodId || '',
        totalDebit,
        totalCredit,
        lines,
      });

      showToast.success('Journal entry created successfully');
      setIsAddModalOpen(false);
      await fetchEntries();
    } catch (error: any) {
      console.error('Error creating journal entry:', error);
      showToast.error(error?.response?.data?.message || 'Failed to create journal entry');
    }
  };

  const handleEdit = async (entry: JournalEntry) => {
    try {
      const [freshEntry, referenceData] = await Promise.all([
        journalEntryService.getEntryById(entry.id),
        journalEntryService.getReferenceData(),
      ]);

      setSelectedEntry(freshEntry as JournalEntry);
      setAccounts(extractArray(referenceData.accounts));
      setPeriods(extractArray(referenceData.financialPeriods));
      setEditing(true);
    } catch (error: any) {
      console.error('Error preparing journal edit:', error);
      showToast.error(error?.response?.data?.message || 'Failed to open journal entry for editing');
    }
  };

  const handleSaveEdit = async (data: any) => {
    await journalEntryService.updateEntry(data);
    showToast.success('Journal entry updated successfully');
    setEditing(false);
    setSelectedEntry(null);
    await fetchEntries();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      await deleteJournalEntry(id);
      showToast.success('Journal entry deleted successfully');
      await fetchEntries();
    } catch (error: any) {
      console.error('Error deleting journal entry:', error);
      showToast.error(error?.response?.data?.message || 'Failed to delete journal entry');
    }
  };

  const handlePost = async (id: string) => {
    try {
      await postJournalEntry(id);
      showToast.success('Journal entry posted successfully');
      await fetchEntries();
    } catch (error: any) {
      console.error('Error posting journal entry:', error);
      showToast.error(error?.response?.data?.message || 'Failed to post journal entry');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const filteredEntries = entries.filter(entry => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (entry.reference || '').toLowerCase().includes(search) ||
      (entry.description || '').toLowerCase().includes(search);
    const matchesPosted =
      filterPosted === 'All' ||
      (filterPosted === 'Posted' && entry.isPosted) ||
      (filterPosted === 'Unposted' && !entry.isPosted);
    return matchesSearch && matchesPosted;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-3">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
            <p className="text-sm text-gray-500">Manage journal entries and post to ledger</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchEntries} variant="outline" className="flex items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus size={16} /> New Entry
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by reference or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select value={filterPosted} onChange={e => setFilterPosted(e.target.value)} className="rounded-lg border border-gray-300 px-4 py-2 md:w-64">
          <option value="All">All Status</option>
          <option value="Posted">Posted</option>
          <option value="Unposted">Unposted</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Debit</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Credit</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEntries.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No journal entries found</td></tr>
              ) : paginatedEntries.map(entry => (
                <tr key={entry.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.reference}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(entry.entryDate)}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">{entry.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.entryType}</td>
                  <td className="px-4 py-3 text-right text-sm text-green-600">{entry.totalDebit ? formatCurrency(entry.totalDebit) : '-'}</td>
                  <td className="px-4 py-3 text-right text-sm text-red-600">{entry.totalCredit ? formatCurrency(entry.totalCredit) : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${entry.isPosted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {entry.isPosted ? 'Posted' : 'Unposted'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Popover open={popoverOpen === entry.id} onOpenChange={open => setPopoverOpen(open ? entry.id : null)}>
                      <PopoverTrigger asChild>
                        <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><MoreVertical size={18} /></button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0" align="end">
                        <div className="py-1">
                          {!entry.isPosted && (
                            <button onClick={() => { handlePost(entry.id); setPopoverOpen(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100">
                              <CheckCircle size={16} /> Post
                            </button>
                          )}
                          {!entry.isPosted && (
                            <button onClick={() => { handleEdit(entry); setPopoverOpen(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-indigo-600 hover:bg-gray-100">
                              <Edit size={16} /> Edit
                            </button>
                          )}
                          <button onClick={() => { handleDelete(entry.id); setPopoverOpen(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-500">Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredEntries.length)} of {filteredEntries.length}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
              <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <AddJournalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddJournal={handleAddJournal}
      />

      <EditJournalModal
        isOpen={editing}
        entry={selectedEntry}
        accounts={accounts}
        periods={periods}
        onClose={() => { setEditing(false); setSelectedEntry(null); }}
        onSave={handleSaveEdit}
      />
    </motion.div>
  );
};

export default PageJournal;
