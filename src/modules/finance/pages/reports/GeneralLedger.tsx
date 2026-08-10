// src/pages/finance/reports/GeneralLedger.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, RefreshCw, Download, Printer, Calendar,
    DollarSign, TrendingUp, TrendingDown, FileText,
    ChevronLeft, ChevronRight, Filter, Eye,
    AlertCircle, CheckCircle, Search, BarChart3,
    Building2, User, Clock, ChevronDown, ChevronUp,
    ArrowUp, ArrowDown, Minus, Users, CreditCard,
    Landmark, Briefcase, Package, Zap
} from 'lucide-react';
import { getAccounts, getJournalEntries } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useReportExport } from '@/shared/hooks/useReportExport';
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/shared/components/ui/tooltip';

// ============== Types ==============
interface Account {
    id: string;
    code: string;
    name: string;
    accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
    subType?: string;
    openingBalance: number;
    isActive: boolean;
}

interface JournalEntry {
    id: string;
    isPosted: boolean;
    lines: JournalLine[];
    date: string;
    description?: string;
    reference?: string;
    postedBy?: string;
    postedDate?: string;
}

interface JournalLine {
    accountId: string;
    amount: number;
    direction: 'Debit' | 'Credit';
}

interface GeneralLedgerEntry {
    id: string;
    date: string;
    journalReference: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    runningBalance: number;
    accountId: string;
    accountCode: string;
    accountName: string;
    accountType: string;
    postedBy?: string;
    postedDate?: string;
    previousBalance?: number;
    change?: number;
    changePercentage?: number;
}

interface GeneralLedgerData {
    startDate: string;
    endDate: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    accountId: string;
    accountCode: string;
    accountName: string;
    accountType: string;
    entries: GeneralLedgerEntry[];
    totalDebit: number;
    totalCredit: number;
    openingBalance: number;
    closingBalance: number;
    previousOpeningBalance?: number;
    previousClosingBalance?: number;
    totalChange?: number;
    totalChangePercentage?: number;
    summary: {
        totalTransactions: number;
        averageBalance: number;
        maxBalance: number;
        minBalance: number;
        volatility: number;
    };
}

interface ComparisonData {
    previousPeriod: GeneralLedgerData | null;
    previousYear: GeneralLedgerData | null;
}

interface PeriodFilters {
    startDate: string;
    endDate: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    fiscalYear: string;
    compareWithPrevious: boolean;
    compareWithPreviousYear: boolean;
    customStartDate?: string;
    customEndDate?: string;
}

// ============== Helper Functions ==============
const getPeriodDates = (filters: PeriodFilters) => {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    return {
        periodStart: startDate.toISOString().split('T')[0],
        periodEnd: endDate.toISOString().split('T')[0],
    };
};

const getPreviousPeriodDates = (filters: PeriodFilters) => {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const previousEnd = new Date(startDate);
    previousEnd.setDate(previousEnd.getDate() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - diffDays);

    return {
        previousStart: previousStart.toISOString().split('T')[0],
        previousEnd: previousEnd.toISOString().split('T')[0],
    };
};

const getPreviousYearDates = (filters: PeriodFilters) => {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const previousYearStart = new Date(startDate);
    previousYearStart.setFullYear(previousYearStart.getFullYear() - 1);
    const previousYearEnd = new Date(endDate);
    previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1);

    return {
        previousYearStart: previousYearStart.toISOString().split('T')[0],
        previousYearEnd: previousYearEnd.toISOString().split('T')[0],
    };
};

const getAccountTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
        case 'Asset': return <Building2 className="h-4 w-4" />;
        case 'Liability': return <CreditCard className="h-4 w-4" />;
        case 'Equity': return <Users className="h-4 w-4" />;
        case 'Revenue': return <TrendingUp className="h-4 w-4" />;
        case 'Expense': return <TrendingDown className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
    }
};

// ============== Main Component ==============
const GeneralLedger: React.FC = () => {
    // State
    const [data, setData] = useState<GeneralLedgerData | null>(null);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [filters, setFilters] = useState<PeriodFilters>({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        periodType: 'year',
        fiscalYear: new Date().getFullYear().toString(),
        compareWithPrevious: false,
        compareWithPreviousYear: false,
        customStartDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        customEndDate: new Date().toISOString().split('T')[0],
    });

    const [sortConfig, setSortConfig] = useState<{
        key: keyof GeneralLedgerEntry | null;
        direction: 'asc' | 'desc';
    }>({ key: null, direction: 'asc' });

    const ITEMS_PER_PAGE = 20;

    // ✅ Use the report export hook
    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
        title,
    } = useReportExport('general-ledger');

    // ============== Data Fetching ==============
    const fetchAccounts = useCallback(async () => {
        try {
            const res = await getAccounts();
            const accountsData = res.data.data || res.data || [];
            setAccounts(accountsData);
            if (accountsData.length > 0 && !selectedAccount) {
                setSelectedAccount(accountsData[0].id);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            showToast.error('Failed to load accounts');
        }
    }, [selectedAccount]);

    const buildGeneralLedger = useCallback((
        account: Account,
        journals: JournalEntry[],
        startDate: string,
        endDate: string,
        periodType: 'month' | 'quarter' | 'year' | 'custom'
    ): GeneralLedgerData => {
        let runningBalance = account.openingBalance || 0;
        const entries: GeneralLedgerEntry[] = [];
        let totalDebit = 0;
        let totalCredit = 0;
        let maxBalance = runningBalance;
        let minBalance = runningBalance;

        const sortedJournals = [...journals].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        sortedJournals.forEach((journal: JournalEntry) => {
            if (journal.isPosted && journal.lines) {
                journal.lines.forEach((line: JournalLine) => {
                    if (line.accountId === account.id) {
                        const debit = line.direction === 'Debit' ? line.amount : 0;
                        const credit = line.direction === 'Credit' ? line.amount : 0;
                        const previousBalance = runningBalance;
                        runningBalance += debit - credit;

                        if (debit > 0) totalDebit += debit;
                        if (credit > 0) totalCredit += credit;

                        if (runningBalance > maxBalance) maxBalance = runningBalance;
                        if (runningBalance < minBalance) minBalance = runningBalance;

                        entries.push({
                            id: journal.id,
                            date: journal.date,
                            journalReference: journal.reference || journal.id,
                            description: journal.description || 'Transaction',
                            debit,
                            credit,
                            balance: runningBalance,
                            runningBalance: runningBalance,
                            accountId: account.id,
                            accountCode: account.code,
                            accountName: account.name,
                            accountType: account.accountType || 'Other',
                            postedBy: journal.postedBy || 'System',
                            postedDate: journal.postedDate || journal.date,
                            previousBalance,
                            change: runningBalance - previousBalance,
                            changePercentage: previousBalance !== 0
                                ? ((runningBalance - previousBalance) / Math.abs(previousBalance)) * 100
                                : 0,
                        });
                    }
                });
            }
        });

        const totalTransactions = entries.length;
        const averageBalance = totalTransactions > 0
            ? entries.reduce((sum, e) => sum + e.balance, 0) / totalTransactions
            : runningBalance;
        const volatility = totalTransactions > 0
            ? entries.reduce((sum, e) => sum + Math.abs(e.change || 0), 0) / totalTransactions
            : 0;

        return {
            startDate,
            endDate,
            periodType,
            accountId: account.id,
            accountCode: account.code,
            accountName: account.name,
            accountType: account.accountType || 'Other',
            entries,
            totalDebit,
            totalCredit,
            openingBalance: account.openingBalance || 0,
            closingBalance: runningBalance,
            summary: {
                totalTransactions,
                averageBalance,
                maxBalance,
                minBalance,
                volatility,
            },
        };
    }, []);

    const mergeComparisonData = useCallback((
        currentData: GeneralLedgerData,
        previousData: GeneralLedgerData | null,
        previousYearData: GeneralLedgerData | null
    ): GeneralLedgerData => {
        if (!previousData && !previousYearData) return currentData;

        const mergedData = { ...currentData };

        if (previousData) {
            const previousEntriesMap = new Map(
                previousData.entries.map(entry => [entry.id, entry])
            );

            mergedData.entries = currentData.entries.map(entry => {
                const prevEntry = previousEntriesMap.get(entry.id);
                if (prevEntry) {
                    const change = entry.balance - prevEntry.balance;
                    const changePercentage = prevEntry.balance !== 0
                        ? (change / Math.abs(prevEntry.balance)) * 100
                        : 0;
                    return {
                        ...entry,
                        previousBalance: prevEntry.balance,
                        change,
                        changePercentage,
                    };
                }
                return entry;
            });

            mergedData.previousOpeningBalance = previousData.openingBalance;
            mergedData.previousClosingBalance = previousData.closingBalance;
            mergedData.totalChange = currentData.closingBalance - previousData.closingBalance;
            mergedData.totalChangePercentage = previousData.closingBalance !== 0
                ? (mergedData.totalChange / Math.abs(previousData.closingBalance)) * 100
                : 0;
        }

        return mergedData;
    }, []);

    const fetchData = useCallback(async () => {
        if (!selectedAccount) {
            await fetchAccounts();
            return;
        }

        try {
            setLoading(true);
            setIsRefreshing(true);

            const { periodStart, periodEnd } = getPeriodDates(filters);

            const [journalRes] = await Promise.all([
                getJournalEntries({
                    fromDate: periodStart,
                    toDate: periodEnd,
                    accountId: selectedAccount
                }),
            ]);

            const journals = journalRes.data.data || journalRes.data || [];
            const account = accounts.find((a: Account) => a.id === selectedAccount);

            if (!account) {
                setLoading(false);
                setIsRefreshing(false);
                return;
            }

            const currentData = buildGeneralLedger(
                account,
                journals,
                periodStart,
                periodEnd,
                filters.periodType
            );

            let previousData: GeneralLedgerData | null = null;
            let previousYearData: GeneralLedgerData | null = null;

            if (filters.compareWithPrevious || filters.compareWithPreviousYear) {
                const comparisonPromises: Promise<any>[] = [];

                if (filters.compareWithPrevious) {
                    const { previousStart, previousEnd } = getPreviousPeriodDates(filters);
                    comparisonPromises.push(
                        getJournalEntries({
                            fromDate: previousStart,
                            toDate: previousEnd,
                            accountId: selectedAccount
                        })
                    );
                }

                if (filters.compareWithPreviousYear) {
                    const { previousYearStart, previousYearEnd } = getPreviousYearDates(filters);
                    comparisonPromises.push(
                        getJournalEntries({
                            fromDate: previousYearStart,
                            toDate: previousYearEnd,
                            accountId: selectedAccount
                        })
                    );
                }

                const comparisonResults = await Promise.all(comparisonPromises);
                let resultIndex = 0;

                if (filters.compareWithPrevious) {
                    const prevJournals = comparisonResults[resultIndex].data.data || comparisonResults[resultIndex].data || [];
                    const { previousStart, previousEnd } = getPreviousPeriodDates(filters);
                    previousData = buildGeneralLedger(
                        account,
                        prevJournals,
                        previousStart,
                        previousEnd,
                        filters.periodType
                    );
                    resultIndex++;
                }

                if (filters.compareWithPreviousYear) {
                    const prevYearJournals = comparisonResults[resultIndex].data.data || comparisonResults[resultIndex].data || [];
                    const { previousYearStart, previousYearEnd } = getPreviousYearDates(filters);
                    previousYearData = buildGeneralLedger(
                        account,
                        prevYearJournals,
                        previousYearStart,
                        previousYearEnd,
                        'year'
                    );
                }
            }

            const mergedData = mergeComparisonData(currentData, previousData, previousYearData);
            setData(mergedData);
            setComparisonData({ previousPeriod: previousData, previousYear: previousYearData });

        } catch (error) {
            console.error('Error fetching general ledger:', error);
            showToast.error('Failed to load general ledger');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [selectedAccount, filters, accounts, fetchAccounts, buildGeneralLedger, mergeComparisonData]);

    // ============== Effects ==============
    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        if (selectedAccount) {
            fetchData();
        }
    }, [selectedAccount, filters.startDate, filters.endDate, fetchData]);

    // ============== UI Helpers ==============
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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Asset: 'text-blue-600',
            Liability: 'text-red-600',
            Equity: 'text-purple-600',
            Revenue: 'text-green-600',
            Expense: 'text-orange-600',
            Other: 'text-gray-600',
        };
        return colors[type] || 'text-gray-600';
    };

    const getChangeColor = (change?: number) => {
        if (!change) return 'text-gray-400';
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-400';
    };

    const getChangeIcon = (change?: number) => {
        if (!change || Math.abs(change) < 0.01) return <Minus className="h-3 w-3" />;
        if (change > 0) return <ArrowUp className="h-3 w-3" />;
        return <ArrowDown className="h-3 w-3" />;
    };

    const handleSort = (key: keyof GeneralLedgerEntry) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    // ============== Filtering and Sorting ==============
    const filteredEntries = useMemo(() => {
        if (!data) return [];

        let entries = data.entries;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            entries = entries.filter(entry =>
                entry.journalReference.toLowerCase().includes(term) ||
                entry.description.toLowerCase().includes(term) ||
                entry.accountCode.toLowerCase().includes(term) ||
                entry.accountName.toLowerCase().includes(term)
            );
        }

        if (filterType !== 'All') {
            entries = entries.filter(entry => entry.accountType === filterType);
        }

        if (sortConfig.key) {
            entries.sort((a, b) => {
                let aVal = a[sortConfig.key!];
                let bVal = b[sortConfig.key!];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortConfig.direction === 'asc'
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'asc'
                        ? aVal - bVal
                        : bVal - aVal;
                }

                return 0;
            });
        }

        return entries;
    }, [data, searchTerm, filterType, sortConfig]);

    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);

    // ============== Loading State ==============
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // ============== Empty State ==============
    if (!data || !selectedAccount) {
        return (
            <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">Select an Account</h3>
                <p className="text-gray-500">Choose an account to view the general ledger</p>
                {accounts.length > 0 && (
                    <div className="mt-4 max-w-md mx-auto">
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc: Account) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.code} - {acc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        );
    }

    const selectedAccountData = accounts.find((a: Account) => a.id === selectedAccount);
    const showComparison = filters.compareWithPrevious || filters.compareWithPreviousYear;

    // ============== Main Render ==============
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">General Ledger</h1>
                        <p className="text-sm text-gray-500">
                            {selectedAccountData?.code} - {selectedAccountData?.name}
                            <span className="ml-2 text-xs bg-indigo-100 px-2 py-1 rounded-full text-indigo-700">
                                {filters.periodType.charAt(0).toUpperCase() + filters.periodType.slice(1)}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => handleRefresh(fetchData)}
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
                        disabled={exporting}
                    >
                        <Download size={16} />
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => data && handlePrintReport(data)}
                        disabled={!data}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Account Selection */}
                    <div>
                        <Label className="text-sm font-medium">Account</Label>
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc: Account) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.code} - {acc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Period Type */}
                    <div>
                        <Label className="text-sm font-medium">Period Type</Label>
                        <Select
                            value={filters.periodType}
                            onValueChange={(value: any) => {
                                const now = new Date();
                                let startDate = new Date();
                                let endDate = new Date();

                                switch (value) {
                                    case 'month':
                                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                                        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                        break;
                                    case 'quarter':
                                        const quarter = Math.floor(now.getMonth() / 3);
                                        startDate = new Date(now.getFullYear(), quarter * 3, 1);
                                        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
                                        break;
                                    case 'year':
                                        startDate = new Date(now.getFullYear(), 0, 1);
                                        endDate = new Date(now.getFullYear(), 11, 31);
                                        break;
                                    case 'custom':
                                        startDate = new Date(now.getFullYear(), 0, 1);
                                        endDate = now;
                                        break;
                                }

                                setFilters({
                                    ...filters,
                                    periodType: value,
                                    startDate: startDate.toISOString().split('T')[0],
                                    endDate: endDate.toISOString().split('T')[0],
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">Month</SelectItem>
                                <SelectItem value="quarter">Quarter</SelectItem>
                                <SelectItem value="year">Year</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <Label className="text-sm font-medium">End Date</Label>
                        <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>

                    {/* Fiscal Year */}
                    <div>
                        <Label className="text-sm font-medium">Fiscal Year</Label>
                        <Select
                            value={filters.fiscalYear}
                            onValueChange={(value) => setFilters({ ...filters, fiscalYear: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2022">2022</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Comparison Options */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="comparePrevious"
                            checked={filters.compareWithPrevious}
                            onChange={(e) => setFilters({
                                ...filters,
                                compareWithPrevious: e.target.checked
                            })}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <Label htmlFor="comparePrevious" className="cursor-pointer text-sm">
                            Compare with previous {filters.periodType}
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="compareYear"
                            checked={filters.compareWithPreviousYear}
                            onChange={(e) => setFilters({
                                ...filters,
                                compareWithPreviousYear: e.target.checked
                            })}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <Label htmlFor="compareYear" className="cursor-pointer text-sm">
                            Compare with same period last year
                        </Label>
                    </div>
                    <Button
                        onClick={fetchData}
                        className="bg-indigo-600 hover:bg-indigo-700 ml-auto"
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Account Info and Period Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 text-sm text-gray-600 border border-gray-200">
                <div className="flex flex-wrap gap-4 items-center">
                    <span>
                        <strong>Account:</strong> {data.accountCode} - {data.accountName}
                    </span>
                    <span className="w-px h-4 bg-gray-300" />
                    <span>
                        <strong>Type:</strong>
                        <span className={`ml-1 font-medium ${getTypeColor(data.accountType)}`}>
                            {data.accountType}
                        </span>
                    </span>
                    <span className="w-px h-4 bg-gray-300" />
                    <span>
                        <strong>Period:</strong> {formatDate(data.startDate)} to {formatDate(data.endDate)}
                    </span>
                    <span className="w-px h-4 bg-gray-300" />
                    <span>
                        <strong>Transactions:</strong> {data.summary.totalTransactions}
                    </span>
                    {showComparison && (
                        <>
                            <span className="w-px h-4 bg-gray-300" />
                            <span className="text-indigo-600">
                                <strong>Comparing with:</strong>
                                {filters.compareWithPrevious && ` Previous ${filters.periodType}`}
                                {filters.compareWithPrevious && filters.compareWithPreviousYear && ' & '}
                                {filters.compareWithPreviousYear && ' Same period last year'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-3">
                        <p className="text-xs text-blue-700 font-medium">Opening Balance</p>
                        <p className="text-lg font-bold text-blue-900">{formatCurrency(data.openingBalance)}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-3">
                        <p className="text-xs text-green-700 font-medium">Total Debits</p>
                        <p className="text-lg font-bold text-green-900">{formatCurrency(data.totalDebit)}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-3">
                        <p className="text-xs text-red-700 font-medium">Total Credits</p>
                        <p className="text-lg font-bold text-red-900">{formatCurrency(data.totalCredit)}</p>
                    </CardContent>
                </Card>

                <Card className={`bg-gradient-to-r ${data.closingBalance >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-rose-50 to-rose-100 border-rose-200'}`}>
                    <CardContent className="p-3">
                        <p className={`text-xs ${data.closingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-medium`}>
                            Closing Balance
                        </p>
                        <p className={`text-lg font-bold ${data.closingBalance >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                            {formatCurrency(data.closingBalance)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-3">
                        <p className="text-xs text-purple-700 font-medium">Average Balance</p>
                        <p className="text-lg font-bold text-purple-900">{formatCurrency(data.summary.averageBalance)}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-3">
                        <p className="text-xs text-orange-700 font-medium">Volatility</p>
                        <p className="text-lg font-bold text-orange-900">{formatCurrency(data.summary.volatility)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search by reference, description, or account..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Asset">Asset</SelectItem>
                        <SelectItem value="Liability">Liability</SelectItem>
                        <SelectItem value="Equity">Equity</SelectItem>
                        <SelectItem value="Revenue">Revenue</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                </Select>
                <Badge variant="outline" className="text-sm">
                    {filteredEntries.length} entries
                </Badge>
            </div>

            {/* General Ledger Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('date')}
                                >
                                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('journalReference')}
                                >
                                    Ref {sortConfig.key === 'journalReference' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('description')}
                                >
                                    Description {sortConfig.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('debit')}
                                >
                                    Debit {sortConfig.key === 'debit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('credit')}
                                >
                                    Credit {sortConfig.key === 'credit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('balance')}
                                >
                                    Balance {sortConfig.key === 'balance' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Posted
                                </th>
                                {showComparison && (
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Change
                                    </th>
                                )}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={showComparison ? 8 : 7} className="px-4 py-8 text-center text-gray-500">
                                        No entries found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                paginatedEntries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(entry.date)}</td>
                                        <td className="px-4 py-3 text-sm font-mono text-indigo-600">{entry.journalReference}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{entry.description}</td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                                            {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                                            {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                                        </td>
                                        <td className={`px-4 py-3 text-sm text-right font-medium ${entry.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                            {formatCurrency(entry.balance)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-400">
                                            {entry.postedBy && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                <span>{entry.postedBy}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Posted: {formatDateTime(entry.postedDate || entry.date)}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </td>
                                        {showComparison && (
                                            <td className="px-4 py-3 text-sm text-right">
                                                {entry.change !== undefined && (
                                                    <span className={`font-medium ${getChangeColor(entry.change)}`}>
                                                            {getChangeIcon(entry.change)}
                                                        {formatCurrency(entry.change)}
                                                        {entry.changePercentage !== undefined && entry.changePercentage !== 0 && (
                                                            <span className="text-xs ml-1">
                                                                    ({entry.changePercentage > 0 ? '+' : ''}
                                                                {entry.changePercentage.toFixed(1)}%)
                                                                </span>
                                                        )}
                                                        </span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                            <tr className="font-bold">
                                <td colSpan={3} className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                                <td className="px-4 py-3 text-sm text-right text-green-600">
                                    {formatCurrency(data.totalDebit)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-red-600">
                                    {formatCurrency(data.totalCredit)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                        <span className={data.closingBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                            {formatCurrency(data.closingBalance)}
                                        </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-400">
                                    {data.summary.totalTransactions} transactions
                                </td>
                                {showComparison && (
                                    <td className="px-4 py-3 text-sm text-right">
                                        {data.totalChange !== undefined && (
                                            <span className={`font-medium ${getChangeColor(data.totalChange)}`}>
                                                    {getChangeIcon(data.totalChange)}
                                                {formatCurrency(data.totalChange)}
                                                <span className="text-xs ml-1">
                                                        ({data.totalChangePercentage?.toFixed(1)}%)
                                                    </span>
                                                </span>
                                        )}
                                    </td>
                                )}
                            </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredEntries.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50">
                            <p className="text-sm text-gray-500">
                                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredEntries.length)} of {filteredEntries.length} entries
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                className={currentPage === pageNum ? 'bg-indigo-600' : ''}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <>
                                            <span className="px-2 py-1 text-sm text-gray-400">...</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(totalPages)}
                                            >
                                                {totalPages}
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Balance Trend Indicator */}
            <Card className="border-indigo-200 bg-indigo-50">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            <span className="font-semibold text-indigo-800">Balance Trend Analysis</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <div>
                                <p className="text-indigo-600">Max Balance</p>
                                <p className="font-bold text-indigo-900">{formatCurrency(data.summary.maxBalance)}</p>
                            </div>
                            <div>
                                <p className="text-indigo-600">Min Balance</p>
                                <p className="font-bold text-indigo-900">{formatCurrency(data.summary.minBalance)}</p>
                            </div>
                            <div>
                                <p className="text-indigo-600">Range</p>
                                <p className="font-bold text-indigo-900">
                                    {formatCurrency(data.summary.maxBalance - data.summary.minBalance)}
                                </p>
                            </div>
                            <div>
                                <p className="text-indigo-600">Volatility</p>
                                <p className="font-bold text-indigo-900">
                                    {data.summary.volatility > 0 ? 'High' : 'Low'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 w-full bg-indigo-200 rounded-full h-1.5">
                        <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{
                                width: `${Math.min(100, ((data.closingBalance - data.summary.minBalance) /
                                    (data.summary.maxBalance - data.summary.minBalance || 1)) * 100)}%`
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Comparison Summary */}
            {showComparison && comparisonData?.previousPeriod && (
                <Card className="border-indigo-200 bg-indigo-50">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-indigo-800 mb-3">Comparison Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Opening Balance Change</p>
                                <p className={`font-bold ${getChangeColor(data.previousOpeningBalance !== undefined ? data.openingBalance - data.previousOpeningBalance : undefined)}`}>
                                    {data.previousOpeningBalance !== undefined && (
                                        <>
                                            {formatCurrency(data.openingBalance - data.previousOpeningBalance)}
                                            <span className="ml-1">
                                                ({((data.openingBalance - data.previousOpeningBalance) / Math.abs(data.previousOpeningBalance || 1) * 100).toFixed(1)}%)
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Closing Balance Change</p>
                                <p className={`font-bold ${getChangeColor(data.totalChange)}`}>
                                    {data.totalChange !== undefined && (
                                        <>
                                            {formatCurrency(data.totalChange)}
                                            <span className="ml-1">
                                                ({data.totalChangePercentage?.toFixed(1)}%)
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Transaction Count Change</p>
                                <p className={`font-bold ${getChangeColor(data.summary.totalTransactions - (comparisonData.previousPeriod?.summary.totalTransactions || 0))}`}>
                                    {data.summary.totalTransactions - (comparisonData.previousPeriod?.summary.totalTransactions || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Volatility Change</p>
                                <p className={`font-bold ${getChangeColor(data.summary.volatility - (comparisonData.previousPeriod?.summary.volatility || 0))}`}>
                                    {((data.summary.volatility - (comparisonData.previousPeriod?.summary.volatility || 0)) > 0) ? 'Increased' : 'Decreased'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            {title}
                        </DialogTitle>
                        <DialogDescription>
                            Export the {title.toLowerCase().replace('export ', '')} in your preferred format.
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
                                            <FileText className="h-4 w-4 text-red-500" />
                                            PDF - Printable Document
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="excel">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-600" />
                                            Excel - Spreadsheet
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="csv">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            CSV - Comma separated values
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Account</Label>
                            <div className="text-sm text-gray-600">
                                {data.accountCode} - {data.accountName}
                            </div>
                        </div>
                        <div>
                            <Label>Period</Label>
                            <div className="text-sm text-gray-600">
                                {filters.periodType === 'custom' ? (
                                    <>From {formatDate(data.startDate)} to {formatDate(data.endDate)}</>
                                ) : (
                                    <>For the period ending {formatDate(data.endDate)}</>
                                )}
                            </div>
                        </div>
                        {showComparison && (
                            <div>
                                <Label>Include Comparison</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="checkbox"
                                        id="exportComparison"
                                        checked={showComparison}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                                        readOnly
                                    />
                                    <Label htmlFor="exportComparison" className="text-sm text-gray-600">
                                        {showComparison ? 'Enabled ✓' : 'Disabled'}
                                    </Label>
                                </div>
                            </div>
                        )}
                        <div className="text-xs text-gray-400 space-y-1">
                            <p>📄 PDF: Professional formatted report</p>
                            <p>📊 Excel: Full data with multiple sheets</p>
                            <p>📋 CSV: Raw data for further analysis</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => data && handleExport(data)}
                            disabled={exporting || !data}
                        >
                            {exporting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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

export default GeneralLedger;