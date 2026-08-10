// src/pages/finance/BankTransactions.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt, Plus, Search, RefreshCw, Eye, Edit, Trash2,
  DollarSign, CreditCard, ChevronLeft, ChevronRight, MoreVertical,
  X, Save, AlertCircle, CheckCircle, Banknote, Calendar,
  TrendingUp, TrendingDown, Filter, Calendar as CalendarIcon,
  Download, Printer, FileText, Loader2, Check, Ban,
  RotateCcw, BarChart3
} from 'lucide-react';
import {
  getBankTransactions,
  getBankTransactionById,
  createBankTransaction,
  updateBankTransaction,
  deleteBankTransaction,
  reconcileBankTransaction,
  bulkReconcileBankTransactions,
  getBankAccounts,
  getFinancialPeriods,
  getReconciliationSummary,
  getTransactionStats,
  getTransactionTypes
} from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Progress } from '@/shared/components/ui/progress';

// ============================================================
// TYPES
// ============================================================

interface BankTransaction {
  id: string;
  bankAccountId: string;
  bankAccountName?: string;
  transactionDate: string;
  transactionType: string;
  amount: number;
  description: string;
  reference: string;
  isReconciled: boolean;
  reconciliationDate?: string;
  dateAdd: string;
  dateMod?: string;
  periodId?: string;
  periodName?: string;
  status?: string;
}

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currentBalance: number;
}

interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

interface ReconciliationSummary {
  bankAccountId?: string;
  bankAccountName?: string;
  totalTransactions: number;
  reconciledCount: number;
  unreconciledCount: number;
  totalAmount: number;
  reconciledAmount: number;
  unreconciledAmount: number;
  reconciliationProgress: number;
  periodId: string;
  periodName?: string;
}

interface TransactionStats {
  totalTransactions: number;
  reconciledCount: number;
  unreconciledCount: number;
  totalDeposits: number;
  totalWithdrawals: number;
  netChange: number;
  averageTransactionAmount: number;
  minTransactionAmount: number;
  maxTransactionAmount: number;
  firstTransactionDate?: string;
  lastTransactionDate?: string;
  transactionsByType: Record<string, number>;
  amountByType: Record<string, number>;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const BankTransactions: React.FC = () => {
  // State
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<string[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [reconciliationSummary, setReconciliationSummary] = useState<ReconciliationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('All');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [isBulkReconcileModalOpen, setIsBulkReconcileModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [exporting, setExporting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bankAccountId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    transactionType: 'Deposit',
    amount: 0,
    description: '',
    reference: '',
    periodId: '',
    rowVersion: '',
  });

  const [reconcileData, setReconcileData] = useState({
    isReconciled: true,
    reconciliationDate: new Date().toISOString().split('T')[0],
  });

  const ITEMS_PER_PAGE = 10;

  // ============================================================
  // DATA FETCHING
  // ============================================================

  useEffect(() => {
    fetchPeriods();
    fetchTransactionTypes();
  }, []);

  useEffect(() => {
    if (periodFilter) {
      fetchData();
      fetchReconciliationSummary();
      fetchStats();
    }
  }, [periodFilter, selectedBankAccount]);

  const fetchPeriods = async () => {
    try {
      const res = await getFinancialPeriods({ status: 'All' });
      let data = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res.data.$values && Array.isArray(res.data.$values)) {
          data = res.data.$values;
        }
      }
      setPeriods(data);

      const active = data.find((p: any) => !p.isClosed);
      if (active) {
        setPeriodFilter(active.id);
        setFormData(prev => ({ ...prev, periodId: active.id }));
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchTransactionTypes = async () => {
    try {
      const res = await getTransactionTypes();
      const data = res.data?.data || res.data || [];
      setTransactionTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transaction types:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);

      const params: any = {};
      if (periodFilter && periodFilter !== 'all') {
        params.periodId = periodFilter;
      }
      if (selectedBankAccount && selectedBankAccount !== 'All') {
        params.bankAccountId = selectedBankAccount;
      }
      if (filterType && filterType !== 'All') {
        params.transactionType = filterType;
      }

      const [transactionsRes, accountsRes] = await Promise.all([
        getBankTransactions(params),
        getBankAccounts(),
      ]);

      let transactionsData = [];
      if (transactionsRes.data) {
        if (Array.isArray(transactionsRes.data)) {
          transactionsData = transactionsRes.data;
        } else if (transactionsRes.data.data && Array.isArray(transactionsRes.data.data)) {
          transactionsData = transactionsRes.data.data;
        } else if (transactionsRes.data.$values && Array.isArray(transactionsRes.data.$values)) {
          transactionsData = transactionsRes.data.$values;
        }
      }

      const mappedTransactions = transactionsData.map((t: any) => ({
        ...t,
        periodId: t.periodId || t.PeriodId || '',
        periodName: t.periodName || t.PeriodName || periods.find(p => p.id === (t.periodId || t.PeriodId))?.name || '',
        status: t.status || (t.isReconciled ? 'Reconciled' : 'Pending'),
      }));

      setTransactions(mappedTransactions);

      let accountsData = [];
      if (accountsRes.data) {
        if (Array.isArray(accountsRes.data)) {
          accountsData = accountsRes.data;
        } else if (accountsRes.data.data && Array.isArray(accountsRes.data.data)) {
          accountsData = accountsRes.data.data;
        } else if (accountsRes.data.$values && Array.isArray(accountsRes.data.$values)) {
          accountsData = accountsRes.data.$values;
        }
      }
      setBankAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast.error('Failed to load transactions');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchReconciliationSummary = async () => {
    try {
      const params: any = {};
      if (periodFilter && periodFilter !== 'all') {
        params.periodId = periodFilter;
      }
      if (selectedBankAccount && selectedBankAccount !== 'All') {
        params.bankAccountId = selectedBankAccount;
      }

      const res = await getReconciliationSummary(params);
      const data = res.data?.data || res.data;
      if (data) {
        setReconciliationSummary(data);
      }
    } catch (error) {
      console.error('Error fetching reconciliation summary:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const params: any = {};
      if (periodFilter && periodFilter !== 'all') {
        params.periodId = periodFilter;
      }
      if (selectedBankAccount && selectedBankAccount !== 'All') {
        params.bankAccountId = selectedBankAccount;
      }

      const res = await getTransactionStats(params);
      const data = res.data?.data || res.data;
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // ============================================================
  // CRUD OPERATIONS
  // ============================================================

  const handleAddTransaction = async () => {
    if (!formData.periodId) {
      showToast.error('Please select a financial period');
      return;
    }

    const selectedPeriod = periods.find(p => p.id === formData.periodId);
    if (selectedPeriod?.isClosed) {
      showToast.error('Selected period is closed. Cannot create transaction.');
      return;
    }

    if (!formData.bankAccountId || !formData.description || formData.amount <= 0) {
      showToast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBankTransaction({
        ...formData,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        periodId: formData.periodId,
      });
      showToast.success('Transaction created successfully');
      setIsAddModalOpen(false);
      resetForm();
      await fetchData();
      await fetchReconciliationSummary();
      await fetchStats();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      showToast.error(error.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!selectedTransaction) return;

    if (!formData.periodId) {
      showToast.error('Please select a financial period');
      return;
    }

    const selectedPeriod = periods.find(p => p.id === formData.periodId);
    if (selectedPeriod?.isClosed) {
      showToast.error('Selected period is closed. Cannot update transaction.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBankTransaction({
        id: selectedTransaction.id,
        ...formData,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        periodId: formData.periodId,
      });
      showToast.success('Transaction updated successfully');
      setIsEditModalOpen(false);
      await fetchData();
      await fetchReconciliationSummary();
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      showToast.error(error.response?.data?.message || 'Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    const period = periods.find(p => p.id === selectedTransaction.periodId);
    if (period?.isClosed) {
      showToast.error('Cannot delete transaction in a closed period');
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteBankTransaction(selectedTransaction.id);
      showToast.success('Transaction deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedTransaction(null);
      await fetchData();
      await fetchReconciliationSummary();
      await fetchStats();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReconcileTransaction = async () => {
    if (!selectedTransaction) return;

    const period = periods.find(p => p.id === selectedTransaction.periodId);
    if (period?.isClosed) {
      showToast.error('Cannot reconcile transaction in a closed period');
      return;
    }

    setIsSubmitting(true);
    try {
      await reconcileBankTransaction({
        id: selectedTransaction.id,
        isReconciled: reconcileData.isReconciled,
        reconciliationDate: new Date(reconcileData.reconciliationDate).toISOString(),
      });
      showToast.success('Transaction reconciled successfully');
      setIsReconcileModalOpen(false);
      setSelectedTransaction(null);
      await fetchData();
      await fetchReconciliationSummary();
      await fetchStats();
    } catch (error: any) {
      console.error('Error reconciling transaction:', error);
      showToast.error(error.response?.data?.message || 'Failed to reconcile transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkReconcile = async () => {
    if (selectedIds.length === 0) {
      showToast.error('Please select at least one transaction');
      return;
    }

    setIsSubmitting(true);
    try {
      await bulkReconcileBankTransactions({
        transactionIds: selectedIds,
        isReconciled: true,
        reconciliationDate: new Date().toISOString(),
      });
      showToast.success(`${selectedIds.length} transactions reconciled successfully`);
      setIsBulkReconcileModalOpen(false);
      setSelectedIds([]);
      await fetchData();
      await fetchReconciliationSummary();
      await fetchStats();
    } catch (error: any) {
      console.error('Error bulk reconciling:', error);
      showToast.error(error.response?.data?.message || 'Failed to reconcile transactions');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const resetForm = () => {
    setFormData({
      bankAccountId: '',
      transactionDate: new Date().toISOString().split('T')[0],
      transactionType: 'Deposit',
      amount: 0,
      description: '',
      reference: '',
      periodId: formData.periodId || '',
    });
  };

  const openEditModal = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      bankAccountId: transaction.bankAccountId,
      transactionDate: transaction.transactionDate.split('T')[0],
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      description: transaction.description,
      reference: transaction.reference,
      periodId: transaction.periodId || '',
      rowVersion: transaction.rowVersion || '',
    });
    setIsEditModalOpen(true);
  };

  const openReconcileModal = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setReconcileData({
      isReconciled: !transaction.isReconciled,
      reconciliationDate: new Date().toISOString().split('T')[0],
    });
    setIsReconcileModalOpen(true);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedIds.length === paginatedTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTransactions.map(t => t.id));
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
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Reconciled': 'bg-green-100 text-green-700 border-green-200',
      'Completed': 'bg-green-100 text-green-700 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // ============================================================
  // FILTERING & PAGINATION
  // ============================================================

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || t.transactionType === filterType;
    const matchesBank = selectedBankAccount === 'All' || t.bankAccountId === selectedBankAccount;
    return matchesSearch && matchesType && matchesBank;
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bank Transactions</h1>
            <p className="text-sm text-gray-500">Manage all bank transactions</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
                onClick={() => {
                  fetchData();
                  fetchReconciliationSummary();
                  fetchStats();
                }}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsExportModalOpen(true)}
            >
              <Download size={16} />
              Export
            </Button>
            <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsStatsModalOpen(true)}
            >
              <BarChart3 size={16} />
              Stats
            </Button>
            {selectedIds.length > 0 && (
                <Button
                    onClick={() => setIsBulkReconcileModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check size={16} />
                  Reconcile Selected ({selectedIds.length})
                </Button>
            )}
            <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {reconciliationSummary && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Total</p>
                    <p className="text-2xl font-bold text-blue-900">{reconciliationSummary.totalTransactions}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Reconciled</p>
                    <p className="text-2xl font-bold text-emerald-900">{reconciliationSummary.reconciledCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">Unreconciled</p>
                    <p className="text-2xl font-bold text-yellow-900">{reconciliationSummary.unreconciledCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-purple-700 font-medium">Progress</p>
                    <p className="text-2xl font-bold text-purple-900">{reconciliationSummary.reconciliationProgress}%</p>
                    <Progress
                        value={reconciliationSummary.reconciliationProgress}
                        className="mt-2 h-1 bg-purple-200"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-indigo-700 font-medium">Period</p>
                    <p className="text-lg font-bold text-indigo-900 truncate">{reconciliationSummary.periodName || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
                placeholder="Search by description, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
          </div>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="md:w-44">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name} {period.isClosed ? '🔒' : '🔓'}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="md:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              {transactionTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
            <SelectTrigger className="md:w-48">
              <Banknote className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Accounts</SelectItem>
              {bankAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.accountName}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                        type="checkbox"
                        checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                        onChange={toggleAllSelection}
                        className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No transactions found
                      </TableCell>
                    </TableRow>
                ) : (
                    paginatedTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-gray-50">
                          <TableCell>
                            {!transaction.isReconciled && (
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(transaction.id)}
                                    onChange={() => toggleSelection(transaction.id)}
                                    className="rounded border-gray-300"
                                />
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{formatDate(transaction.transactionDate)}</TableCell>
                          <TableCell className="text-sm text-gray-900 max-w-xs truncate">
                            {transaction.description}
                            {transaction.periodName && (
                                <Badge variant="outline" className="text-[10px] ml-2">
                                  {transaction.periodName}
                                </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-mono text-gray-600">{transaction.reference}</TableCell>
                          <TableCell className="text-sm text-gray-500">{transaction.bankAccountName || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={
                              transaction.transactionType === 'Deposit' || transaction.transactionType === 'Replenishment'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                            }>
                              {transaction.transactionType}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-sm text-right font-medium ${transaction.transactionType === 'Deposit' || transaction.transactionType === 'Replenishment' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status || (transaction.isReconciled ? 'Reconciled' : 'Pending'))}>
                              {transaction.status || (transaction.isReconciled ? 'Reconciled' : 'Pending')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                    <MoreVertical size={16} />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-0" align="end">
                                  <div className="py-1">
                                    <button
                                        onClick={() => {
                                          setSelectedTransaction(transaction);
                                          setIsViewModalOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                    >
                                      <Eye size={16} />
                                      View Details
                                    </button>
                                    {!transaction.isReconciled && (
                                        <>
                                          <button
                                              onClick={() => openEditModal(transaction)}
                                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-indigo-600 flex items-center gap-2"
                                          >
                                            <Edit size={16} />
                                            Edit
                                          </button>
                                          <button
                                              onClick={() => openReconcileModal(transaction)}
                                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-emerald-600 flex items-center gap-2"
                                          >
                                            <Check size={16} />
                                            Reconcile
                                          </button>
                                        </>
                                    )}
                                    {transaction.isReconciled && (
                                        <button
                                            onClick={() => openReconcileModal(transaction)}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-yellow-600 flex items-center gap-2"
                                        >
                                          <RotateCcw size={16} />
                                          Unreconcile
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                          setSelectedTransaction(transaction);
                                          setIsDeleteModalOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                    >
                                      <Trash2 size={16} />
                                      Delete
                                    </button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
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

        {/* ============================================================ */}
        {/* MODALS */}
        {/* ============================================================ */}

        {/* Add Transaction Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                Add Bank Transaction
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Period selection */}
              <div>
                <Label className="text-sm font-medium">
                  Financial Period <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.periodId}
                    onValueChange={(value) => setFormData({ ...formData, periodId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name} {period.isClosed ? '🔒' : '🔓'}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Bank Account *</Label>
                <Select
                    value={formData.bankAccountId}
                    onValueChange={(value) => setFormData({ ...formData, bankAccountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.accountName} ({acc.accountNumber})
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Transaction Type *</Label>
                <Select
                    value={formData.transactionType}
                    onValueChange={(value) => setFormData({ ...formData, transactionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount *</Label>
                <Input
                    type="number"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                />
              </div>
              <div>
                <Label>Description *</Label>
                <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Transaction description"
                />
              </div>
              <div>
                <Label>Reference</Label>
                <Input
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Reference number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddTransaction} disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Transaction Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-indigo-600" />
                Edit Transaction
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium">
                  Financial Period <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.periodId}
                    onValueChange={(value) => setFormData({ ...formData, periodId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name} {period.isClosed ? '🔒' : '🔓'}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bank Account *</Label>
                <Select
                    value={formData.bankAccountId}
                    onValueChange={(value) => setFormData({ ...formData, bankAccountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.accountName}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Transaction Type *</Label>
                <Select
                    value={formData.transactionType}
                    onValueChange={(value) => setFormData({ ...formData, transactionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount *</Label>
                <Input
                    type="number"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Description *</Label>
                <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Reference</Label>
                <Input
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleUpdateTransaction} disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Transaction Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                Transaction Details
              </DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
                <div className="space-y-4 py-4">
                  {selectedTransaction.periodName && (
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <p className="text-sm text-indigo-700 font-medium flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Financial Period
                        </p>
                        <p className="text-indigo-900 font-semibold">{selectedTransaction.periodName}</p>
                      </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(selectedTransaction.transactionDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className={`font-medium ${selectedTransaction.transactionType === 'Deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium">{selectedTransaction.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reference</p>
                      <p className="font-mono">{selectedTransaction.reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account</p>
                      <p className="font-medium">{selectedTransaction.bankAccountName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <Badge variant="secondary">{selectedTransaction.transactionType}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className={selectedTransaction.isReconciled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {selectedTransaction.isReconciled ? 'Reconciled' : 'Unreconciled'}
                      </Badge>
                    </div>
                    {selectedTransaction.reconciliationDate && (
                        <div>
                          <p className="text-sm text-gray-500">Reconciled Date</p>
                          <p className="font-medium">{formatDate(selectedTransaction.reconciliationDate)}</p>
                        </div>
                    )}
                  </div>
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reconcile Transaction Modal */}
        <Dialog open={isReconcileModalOpen} onOpenChange={setIsReconcileModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-600" />
                {selectedTransaction?.isReconciled ? 'Unreconcile' : 'Reconcile'} Transaction
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedTransaction && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{selectedTransaction.description}</p>
                    <p className="text-sm font-medium">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
              )}
              <div>
                <Label>Reconciliation Date</Label>
                <Input
                    type="date"
                    value={reconcileData.reconciliationDate}
                    onChange={(e) => setReconcileData({ ...reconcileData, reconciliationDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReconcileModalOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleReconcileTransaction} disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {selectedTransaction?.isReconciled ? 'Unreconcile' : 'Reconcile'}
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Reconcile Modal */}
        <Dialog open={isBulkReconcileModalOpen} onOpenChange={setIsBulkReconcileModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-600" />
                Bulk Reconcile Transactions
              </DialogTitle>
              <DialogDescription>
                You are about to reconcile {selectedIds.length} transactions.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">This will mark all selected transactions as reconciled.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkReconcileModalOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleBulkReconcile} disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Reconcile All
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Transaction Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Delete Transaction
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete this transaction?
              </p>
              {selectedTransaction && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{selectedTransaction.description}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(selectedTransaction.amount)}</p>
                    {selectedTransaction.periodName && (
                        <p className="text-xs text-gray-400">Period: {selectedTransaction.periodName}</p>
                    )}
                  </div>
              )}
              <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteTransaction} disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Modal */}
        <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Transaction Statistics
              </DialogTitle>
            </DialogHeader>
            {stats && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-xl font-bold">{stats.totalTransactions}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-sm text-gray-500">Deposits</p>
                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(stats.totalDeposits)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-sm text-gray-500">Withdrawals</p>
                        <p className="text-xl font-bold text-rose-600">{formatCurrency(stats.totalWithdrawals)}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Net Change</p>
                      <p className={`text-lg font-bold ${stats.netChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(stats.netChange)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Amount</p>
                      <p className="text-lg font-bold">{formatCurrency(stats.averageTransactionAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Min Amount</p>
                      <p className="text-lg font-bold">{formatCurrency(stats.minTransactionAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Max Amount</p>
                      <p className="text-lg font-bold">{formatCurrency(stats.maxTransactionAmount)}</p>
                    </div>
                  </div>
                  {stats.firstTransactionDate && (
                      <div className="text-sm text-gray-500">
                        <p>First: {formatDate(stats.firstTransactionDate)}</p>
                        <p>Last: {stats.lastTransactionDate ? formatDate(stats.lastTransactionDate) : 'N/A'}</p>
                      </div>
                  )}
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatsModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Modal */}
        <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-indigo-600" />
                Export Bank Transactions
              </DialogTitle>
              <DialogDescription>
                Export the bank transactions list in your preferred format.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Export Format</Label>
                <Select
                    value={exportFormat}
                    onValueChange={(value: any) => setExportFormat(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF - Printable Document</SelectItem>
                    <SelectItem value="excel">Excel - Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV - Comma separated values</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Summary</Label>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Total Transactions: <strong>{transactions.length}</strong></p>
                  <p>Deposits: <strong>{transactions.filter(t => t.transactionType === 'Deposit' || t.transactionType === 'Replenishment').length}</strong></p>
                  <p>Withdrawals: <strong>{transactions.filter(t => t.transactionType === 'Withdrawal' || t.transactionType === 'Expense').length}</strong></p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
              <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    // Implement export logic
                    showToast.success(`Exporting as ${exportFormat.toUpperCase()}`);
                    setIsExportModalOpen(false);
                  }}
                  disabled={exporting || !transactions || transactions.length === 0}
              >
                {exporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export {exportFormat.toUpperCase()}
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
  );
};

export default BankTransactions;