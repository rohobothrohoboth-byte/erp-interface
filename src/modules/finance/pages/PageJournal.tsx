import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronLeft, ChevronRight, Edit, FileText, MoreVertical, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { deleteJournalEntry, getJournalEntries, postJournalEntry } from '@/modules/finance/services/finance.api';
import { journalEntryService } from '@/modules/finance/services/journal-entries/journalEntryService';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import CreateJournalModal from '@/modules/finance/components/journal/CreateJournalModal';
import EditJournalModal from '@/modules/finance/components/journal/EditJournalModal';

interface Line { id: string; accountId: string; accountName?: string; accountCode?: string; direction: string; amount: number; description?: string; }
interface Entry { id: string; reference: string; entryDate: string; description: string; entryType: string; totalDebit: number; totalCredit: number; isPosted: boolean; periodId?: string; branchId?: string | null; departmentId?: string | null; employeeId?: string | null; rowVersion?: string | null; lines: Line[]; dateAdd: string; dateMod?: string; }
interface Account { id: string; code?: string; name?: string; accountType?: string; normalBalance?: string; }
interface Period { id: string; name?: string; startDate?: string; endDate?: string; isClosed?: boolean; }

const arrayOf = (value: any): any[] => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : Array.isArray(value?.data?.data) ? value.data.data : [];
const dateLabel = (value?: string) => {
  if (!value) return '-';
  const d = value.slice(0, 10).split('-').map(Number);
  return d.length === 3 ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(d[0], d[1] - 1, d[2]))) : '-';
};

const PageJournal: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Entry | null>(null);
  const pageSize = 10;

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await getJournalEntries({ page: 1, pageSize: 500, sortBy: 'entrydate', sortOrder: 'DESC' });
      setEntries(arrayOf(response.data));
    } catch (e: any) {
      console.error(e);
      showToast.error(e?.response?.data?.message || 'Failed to load journal entries');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadEntries(); }, []);
  useEffect(() => { setPage(1); }, [search, status]);

  const loadReferences = async () => {
    const refs = await journalEntryService.getReferenceData();
    setAccounts(arrayOf(refs.accounts));
    setPeriods(arrayOf(refs.financialPeriods));
  };

  const openCreate = async () => {
    try { await loadReferences(); setCreateOpen(true); }
    catch (e: any) { showToast.error(e?.response?.data?.message || 'Failed to load account and period data'); }
  };

  const openEdit = async (entry: Entry) => {
    try {
      const [fresh, refs] = await Promise.all([journalEntryService.getEntryById(entry.id), journalEntryService.getReferenceData()]);
      setSelected(fresh as Entry);
      setAccounts(arrayOf(refs.accounts));
      setPeriods(arrayOf(refs.financialPeriods));
      setEditOpen(true);
    } catch (e: any) { showToast.error(e?.response?.data?.message || 'Failed to open journal entry'); }
  };

  const filtered = entries.filter(e => {
    const q = search.toLowerCase();
    const matchesSearch = (e.reference || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q);
    const matchesStatus = status === 'All' || (status === 'Posted' ? e.isPosted : !e.isPosted);
    return matchesSearch && matchesStatus;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const currency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);

  const createEntry = async (data: any) => { await journalEntryService.createEntry(data); showToast.success('Journal entry created successfully'); setCreateOpen(false); await loadEntries(); };
  const updateEntry = async (data: any) => { await journalEntryService.updateEntry(data); showToast.success('Journal entry updated successfully'); setEditOpen(false); setSelected(null); await loadEntries(); };
  const removeEntry = async (id: string) => { if (!window.confirm('Are you sure you want to delete this journal entry?')) return; try { await deleteJournalEntry(id); showToast.success('Journal entry deleted successfully'); await loadEntries(); } catch (e: any) { showToast.error(e?.response?.data?.message || 'Failed to delete journal entry'); } };
  const postEntry = async (id: string) => { try { await postJournalEntry(id); showToast.success('Journal entry posted successfully'); await loadEntries(); } catch (e: any) { showToast.error(e?.response?.data?.message || 'Failed to post journal entry'); } };

  if (loading) return <div className="flex min-h-[400px] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-lg bg-indigo-100 p-3"><FileText className="h-6 w-6 text-indigo-600" /></div><div><h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1><p className="text-sm text-gray-500">Create, edit and post journal entries</p></div></div><div className="flex gap-2"><Button variant="outline" onClick={loadEntries}><RefreshCw size={16} className="mr-2" />Refresh</Button><Button onClick={openCreate}><Plus size={16} className="mr-2" />New Entry</Button></div></div>
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><Input className="pl-10" placeholder="Search by reference or description..." value={search} onChange={e => setSearch(e.target.value)} /></div><select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border px-4 py-2 md:w-56"><option value="All">All Status</option><option value="Posted">Posted</option><option value="Unposted">Unposted</option></select></div>
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Reference</th><th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th><th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Description</th><th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th><th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Debit</th><th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Credit</th><th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th><th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th></tr></thead><tbody className="divide-y">
        {visible.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No journal entries found</td></tr> : visible.map(entry => <tr key={entry.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm font-medium">{entry.reference}</td><td className="px-4 py-3 text-sm text-gray-500">{dateLabel(entry.entryDate)}</td><td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">{entry.description}</td><td className="px-4 py-3 text-sm text-gray-500">{entry.entryType}</td><td className="px-4 py-3 text-right text-sm text-green-600">{entry.totalDebit ? currency(entry.totalDebit) : '-'}</td><td className="px-4 py-3 text-right text-sm text-red-600">{entry.totalCredit ? currency(entry.totalCredit) : '-'}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${entry.isPosted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{entry.isPosted ? 'Posted' : 'Unposted'}</span></td><td className="px-4 py-3 text-right"><Popover open={menu === entry.id} onOpenChange={open => setMenu(open ? entry.id : null)}><PopoverTrigger asChild><button className="rounded-full p-1 text-gray-400 hover:bg-gray-100"><MoreVertical size={18} /></button></PopoverTrigger><PopoverContent className="w-48 p-0" align="end"><div className="py-1">{!entry.isPosted && <button onClick={() => { postEntry(entry.id); setMenu(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100"><CheckCircle size={16} />Post</button>}{!entry.isPosted && <button onClick={() => { openEdit(entry); setMenu(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-indigo-600 hover:bg-gray-100"><Edit size={16} />Edit</button>}<button onClick={() => { removeEntry(entry.id); setMenu(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"><Trash2 size={16} />Delete</button></div></PopoverContent></Popover></td></tr>)}
      </tbody></table></div>{filtered.length > 0 && <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3"><span className="text-sm text-gray-500">Showing {(safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1} className="rounded border p-2 disabled:opacity-50"><ChevronLeft size={16} /></button><span className="text-sm">Page {safePage} of {pages}</span><button onClick={() => setPage(Math.min(pages, safePage + 1))} disabled={safePage === pages} className="rounded border p-2 disabled:opacity-50"><ChevronRight size={16} /></button></div></div>}</div>
      <CreateJournalModal isOpen={createOpen} accounts={accounts} periods={periods} onClose={() => setCreateOpen(false)} onSave={createEntry} />
      <EditJournalModal isOpen={editOpen} entry={selected} accounts={accounts} periods={periods} onClose={() => { setEditOpen(false); setSelected(null); }} onSave={updateEntry} />
    </motion.div>
  );
};

export default PageJournal;
