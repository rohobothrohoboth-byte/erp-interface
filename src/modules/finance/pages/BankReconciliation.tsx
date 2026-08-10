// src/pages/finance/BankReconciliation.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    RefreshCw, Search, Filter, Download, Eye,
    CheckCircle, XCircle, Clock, DollarSign,
    ChevronLeft, ChevronRight, MoreVertical,
    FileText, Calendar, AlertCircle, Save, X,
    TrendingUp, TrendingDown, Calendar as CalendarIcon,
    Printer, FileText as FileTextIcon, Loader2
} from 'lucide-react';
import {
    getBankTransactions,
    reconcileBankTransaction,
    bulkReconcileBankTransactions,
    getReconciliationSummary,
    getBankAccounts,
    getFinancialPeriods
} from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
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

// ============================================================
// TYPES
// ============================================================

interface ReconciliationItem {
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
    periodId?: string;
    periodName?: string;
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

// ============================================================
// MAIN COMPONENT
// ============================================================

const BankReconciliation: React.FC = () => {
    // State
    const [items, setItems] = useState<ReconciliationItem[]>([]);
    const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [periods, setPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedBankAccount, setSelectedBankAccount] = useState<string>('All');
    const [periodFilter, setPeriodFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<ReconciliationItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Modal states
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
    const [isUnreconcileModalOpen, setIsUnreconcileModalOpen] = useState(false);
    const [isBulkReconcileModalOpen, setIsBulkReconcileModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [exporting, setExporting] = useState(false);

    const ITEMS_PER_PAGE = 10;

    // ============================================================
    // DATA FETCHING
    // ============================================================

    useEffect(() => {
        fetchPeriods();
    }, []);

    useEffect(() => {
        fetchData();
    }, [periodFilter]);

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
            }
        } catch (error) {
            console.error('Error fetching periods:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const accountsRes = await getBankAccounts();
            const accountsData = accountsRes.data?.data || accountsRes.data || [];
            setBankAccounts(accountsData);

            const params: any = {};
            if (periodFilter && periodFilter !== 'all') {
                params.periodId = periodFilter;
            }
            if (selectedBankAccount && selectedBankAccount !== 'All') {
                params.bankAccountId = selectedBankAccount;
            }

            const [transactionsRes, summaryRes] = await Promise.all([
                getBankTransactions(params),
                getReconciliationSummary(params),
            ]);

            let transactions = [];
            if (transactionsRes.data) {
                if (Array.isArray(transactionsRes.data)) {
                    transactions = transactionsRes.data;
                } else if (transactionsRes.data.data && Array.isArray(transactionsRes.data.data)) {
                    transactions = transactionsRes.data.data;
                } else if (transactionsRes.data.$values && Array.isArray(transactionsRes.data.$values)) {
                    transactions = transactionsRes.data.$values;
                }
            }

            const mappedTransactions = transactions.map((t: any) => ({
                ...t,
                periodId: t.periodId || t.PeriodId || '',
                periodName: t.periodName || t.PeriodName || periods.find(p => p.id === (t.periodId || t.PeriodId))?.name || '',
                status: t.status || (t.isReconciled ? 'Reconciled' : 'Pending'),
            }));

            setItems(mappedTransactions);

            const summaryData = summaryRes.data?.data || summaryRes.data || {};

            const periodName = periodFilter !== 'all'
                ? periods.find(p => p.id === periodFilter)?.name || ''
                : 'All Periods';

            setSummary({
                ...summaryData,
                periodId: periodFilter !== 'all' ? periodFilter : '',
                periodName: periodName,
            });
        } catch (error) {
            console.error('Error fetching reconciliation data:', error);
            showToast.error('Failed to load reconciliation data');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleReconcile = async () => {
        if (!selectedItem) return;

        const period = periods.find(p => p.id === selectedItem.periodId);
        if (period?.isClosed) {
            showToast.error('Cannot reconcile transaction in a closed period');
            return;
        }

        setIsSubmitting(true);
        try {
            const transactionId = selectedItem.id;
            await reconcileBankTransaction({
                id: transactionId,
                isReconciled: true,
                reconciliationDate: new Date().toISOString(),
            });
            showToast.success('Transaction reconciled successfully');
            setIsReconcileModalOpen(false);
            setSelectedItem(null);
            await fetchData();
        } catch (error: any) {
            console.error('Error reconciling transaction:', error);
            showToast.error(error.response?.data?.message || 'Failed to reconcile transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnreconcile = async () => {
        if (!selectedItem) return;

        const period = periods.find(p => p.id === selectedItem.periodId);
        if (period?.isClosed) {
            showToast.error('Cannot unreconcile transaction in a closed period');
            return;
        }

        setIsSubmitting(true);
        try {
            const transactionId = selectedItem.id;
            await reconcileBankTransaction({
                id: transactionId,
                isReconciled: false,
                reconciliationDate: new Date().toISOString(),
            });
            showToast.success('Transaction unreconciled');
            setIsUnreconcileModalOpen(false);
            setSelectedItem(null);
            await fetchData();
        } catch (error: any) {
            console.error('Error unreconciling transaction:', error);
            showToast.error(error.response?.data?.message || 'Failed to unreconcile transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkReconcile = async () => {
        if (selectedIds.length === 0) {
            showToast.error('Please select at least one transaction');
            return;
        }

        // Check if any selected transaction is in a closed period
        const invalidItems = items.filter(i =>
            selectedIds.includes(i.id) && periods.find(p => p.id === i.periodId)?.isClosed
        );
        if (invalidItems.length > 0) {
            showToast.error(`${invalidItems.length} selected transaction(s) are in closed periods`);
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
        } catch (error: any) {
            console.error('Error bulk reconciling:', error);
            showToast.error(error.response?.data?.message || 'Failed to reconcile transactions');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAllSelection = () => {
        const unreconciledItems = paginatedItems.filter(item => !item.isReconciled);
        const unreconciledIds = unreconciledItems.map(item => item.id);

        if (selectedIds.length === unreconciledIds.length && unreconciledIds.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(unreconciledIds);
        }
    };

    // ============================================================
    // HELPERS
    // ============================================================

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

    const getStatusColor = (isReconciled: boolean) => {
        return isReconciled
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    };

    const isPeriodClosed = (periodId?: string) => {
        if (!periodId) return false;
        const period = periods.find(p => p.id === periodId);
        return period?.isClosed || false;
    };

    // ============================================================
    // FILTERING & PAGINATION
    // ============================================================

    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.reference.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' ||
            (filterStatus === 'Reconciled' && item.isReconciled) ||
            (filterStatus === 'Unreconciled' && !item.isReconciled);
        const matchesBank = selectedBankAccount === 'All' || item.bankAccountId === selectedBankAccount;
        return matchesSearch && matchesStatus && matchesBank;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading reconciliation data...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Bank Reconciliation</h1>
                    <p className="text-sm text-gray-500">Reconcile bank transactions</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => {
                            fetchData();
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
                    {selectedIds.length > 0 && (
                        <Button
                            onClick={() => setIsBulkReconcileModalOpen(true)}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <CheckCircle size={16} />
                            Reconcile Selected ({selectedIds.length})
                        </Button>
                    )}
                </div>
            </div>

            {/* Period Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <Label className="font-medium text-gray-700">Period:</Label>
                </div>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Period" />
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

                <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                    <SelectTrigger className="w-48">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Bank Account" />
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

                <Button onClick={fetchData} className="bg-indigo-600 hover:bg-indigo-700" disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Apply Filter
                </Button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {summary.periodName && (
                        <div className="col-span-full">
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                Period: {summary.periodName}
                            </Badge>
                        </div>
                    )}

                    <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                        <CardContent className="p-4">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Total</p>
                                <p className="text-2xl font-bold text-indigo-900">{summary.totalTransactions}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Reconciled</p>
                                <p className="text-2xl font-bold text-green-900">{summary.reconciledCount}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardContent className="p-4">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Unreconciled</p>
                                <p className="text-2xl font-bold text-yellow-900">{summary.unreconciledCount}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Progress</p>
                                <p className="text-2xl font-bold text-purple-900">{summary.reconciliationProgress}%</p>
                                <Progress
                                    value={summary.reconciliationProgress}
                                    className="mt-2 h-1 bg-purple-200"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                        <CardContent className="p-4">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Amount</p>
                                <p className="text-xl font-bold text-emerald-900">{formatCurrency(summary.totalAmount)}</p>
                                <p className="text-xs text-emerald-600">Reconciled: {formatCurrency(summary.reconciledAmount)}</p>
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Reconciled">Reconciled</SelectItem>
                        <SelectItem value="Unreconciled">Unreconciled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Reconciliation Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <input
                                        type="checkbox"
                                        checked={
                                            paginatedItems.filter(item => !item.isReconciled).length > 0 &&
                                            selectedIds.length === paginatedItems.filter(item => !item.isReconciled).length
                                        }
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
                            {paginatedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                        No reconciliation items found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedItems.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            {!item.isReconciled && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleSelection(item.id)}
                                                    className="rounded border-gray-300"
                                                    disabled={isPeriodClosed(item.periodId)}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">{formatDate(item.transactionDate)}</TableCell>
                                        <TableCell className="text-sm text-gray-900 max-w-xs truncate">
                                            {item.description}
                                            {item.periodName && (
                                                <Badge variant="outline" className="text-[10px] ml-2">
                                                    {item.periodName}
                                                </Badge>
                                            )}
                                            {isPeriodClosed(item.periodId) && (
                                                <Badge variant="outline" className="text-[10px] ml-1 bg-red-50 text-red-600 border-red-200">
                                                    🔒 Closed
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm font-mono text-gray-600">{item.reference}</TableCell>
                                        <TableCell className="text-sm text-gray-500">{item.bankAccountName || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge className={
                                                item.transactionType === 'Deposit' || item.transactionType === 'Replenishment'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-rose-100 text-rose-700'
                                            }>
                                                {item.transactionType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`text-sm text-right font-medium ${item.transactionType === 'Deposit' || item.transactionType === 'Replenishment' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {formatCurrency(item.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`border ${getStatusColor(item.isReconciled)}`}>
                                                {item.isReconciled ? 'Reconciled' : 'Unreconciled'}
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
                                                                    setSelectedItem(item);
                                                                    setIsViewModalOpen(true);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                                            >
                                                                <Eye size={16} />
                                                                View Details
                                                            </button>
                                                            {!item.isReconciled && !isPeriodClosed(item.periodId) && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedItem(item);
                                                                        setIsReconcileModalOpen(true);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-green-600 flex items-center gap-2"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                    Reconcile
                                                                </button>
                                                            )}
                                                            {item.isReconciled && !isPeriodClosed(item.periodId) && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedItem(item);
                                                                        setIsUnreconcileModalOpen(true);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-yellow-600 flex items-center gap-2"
                                                                >
                                                                    <XCircle size={16} />
                                                                    Unreconcile
                                                                </button>
                                                            )}
                                                            {isPeriodClosed(item.periodId) && (
                                                                <div className="px-4 py-2 text-xs text-gray-400">
                                                                    Period is closed
                                                                </div>
                                                            )}
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
                {filteredItems.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} items
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

            {/* View Transaction Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Transaction Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            {selectedItem.periodName && (
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                    <p className="text-sm text-indigo-700 font-medium flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        Financial Period
                                    </p>
                                    <p className="text-indigo-900 font-semibold">{selectedItem.periodName}</p>
                                    {isPeriodClosed(selectedItem.periodId) && (
                                        <Badge className="mt-1 bg-red-100 text-red-700">🔒 Closed</Badge>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.transactionDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className={`font-medium ${selectedItem.transactionType === 'Deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {formatCurrency(selectedItem.amount)}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{selectedItem.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Reference</p>
                                    <p className="font-mono">{selectedItem.reference}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account</p>
                                    <p className="font-medium">{selectedItem.bankAccountName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge variant="secondary">{selectedItem.transactionType}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={selectedItem.isReconciled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                        {selectedItem.isReconciled ? 'Reconciled' : 'Unreconciled'}
                                    </Badge>
                                </div>
                                {selectedItem.reconciliationDate && (
                                    <div>
                                        <p className="text-sm text-gray-500">Reconciled Date</p>
                                        <p className="font-medium">{formatDate(selectedItem.reconciliationDate)}</p>
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

            {/* Reconcile Modal */}
            <Dialog open={isReconcileModalOpen} onOpenChange={setIsReconcileModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            Reconcile Transaction
                        </DialogTitle>
                        <DialogDescription>
                            This will mark the transaction as reconciled.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedItem && (
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{selectedItem.description}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="font-medium">{formatCurrency(selectedItem.amount)}</p>
                                </div>
                                {selectedItem.periodName && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">Period</p>
                                        <p className="font-medium">{selectedItem.periodName}</p>
                                    </div>
                                )}
                                {isPeriodClosed(selectedItem.periodId) && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                        ⚠️ This period is closed. Cannot reconcile.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReconcileModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleReconcile}
                            disabled={isSubmitting || isPeriodClosed(selectedItem?.periodId)}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Reconciling...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Reconcile
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unreconcile Modal */}
            <Dialog open={isUnreconcileModalOpen} onOpenChange={setIsUnreconcileModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-yellow-600">
                            <XCircle className="h-5 w-5" />
                            Unreconcile Transaction
                        </DialogTitle>
                        <DialogDescription>
                            This will mark the transaction as unreconciled.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedItem && (
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{selectedItem.description}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="font-medium">{formatCurrency(selectedItem.amount)}</p>
                                </div>
                                {selectedItem.periodName && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">Period</p>
                                        <p className="font-medium">{selectedItem.periodName}</p>
                                    </div>
                                )}
                                {isPeriodClosed(selectedItem.periodId) && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                        ⚠️ This period is closed. Cannot unreconcile.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUnreconcileModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            onClick={handleUnreconcile}
                            disabled={isSubmitting || isPeriodClosed(selectedItem?.periodId)}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Unreconcile
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Reconcile Modal */}
            <Dialog open={isBulkReconcileModalOpen} onOpenChange={setIsBulkReconcileModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-5 w-5" />
                            Bulk Reconcile
                        </DialogTitle>
                        <DialogDescription>
                            You are about to reconcile {selectedIds.length} transactions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-600">
                            This will mark all selected transactions as reconciled.
                        </p>
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-700 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Please ensure all selected transactions are valid.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkReconcileModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleBulkReconcile}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Reconcile All
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            Export Bank Reconciliation
                        </DialogTitle>
                        <DialogDescription>
                            Export the bank reconciliation report in your preferred format.
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
                                    <SelectItem value="pdf">
                                        <div className="flex items-center gap-2">
                                            <FileTextIcon className="h-4 w-4 text-red-500" />
                                            PDF - Printable Document
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="excel">
                                        <div className="flex items-center gap-2">
                                            <FileTextIcon className="h-4 w-4 text-green-600" />
                                            Excel - Spreadsheet
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="csv">
                                        <div className="flex items-center gap-2">
                                            <FileTextIcon className="h-4 w-4 text-blue-500" />
                                            CSV - Comma separated values
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Period</Label>
                            <div className="text-sm text-gray-600">
                                {summary?.periodName || 'All Periods'}
                            </div>
                        </div>

                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Total Transactions: <strong>{summary?.totalTransactions || 0}</strong></p>
                                <p>Reconciled: <strong>{summary?.reconciledCount || 0}</strong></p>
                                <p>Unreconciled: <strong>{summary?.unreconciledCount || 0}</strong></p>
                                <p>Progress: <strong>{(summary?.reconciliationProgress || 0).toFixed(1)}%</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => {
                                showToast.success(`Exporting as ${exportFormat.toUpperCase()}`);
                                setIsExportModalOpen(false);
                            }}
                            disabled={exporting || !items || items.length === 0}
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

export default BankReconciliation;