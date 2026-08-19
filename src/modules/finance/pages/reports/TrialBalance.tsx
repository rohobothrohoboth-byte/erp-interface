// src/pages/finance/reports/TrialBalance.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Scale, RefreshCw, Download, Printer, Calendar,
    DollarSign, TrendingUp, TrendingDown, FileText,
    ChevronLeft, ChevronRight, Filter, Eye,
    AlertCircle, CheckCircle, Search, BarChart3,
    ArrowUp, ArrowDown, Minus, Clock, Building2,
    Users, CreditCard, Landmark, Briefcase, Package
} from 'lucide-react';
import { getAccounts, getJournalEntries } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
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

// ============== Custom Icon ==============
const BalanceIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 2v20" />
        <path d="M4 6h16" />
        <path d="M4 10h16" />
        <path d="M4 14h16" />
        <path d="M4 18h16" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

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
}

interface JournalLine {
    accountId: string;
    amount: number;
    direction: 'Debit' | 'Credit';
}

interface TrialBalanceItem {
    id: string;
    code: string;
    name: string;
    accountType: string;
    subType?: string;
    openingBalance: number;
    debitTransactions: number;
    creditTransactions: number;
    netDebit: number;
    netCredit: number;
    closingBalance: number;
    balanceType: 'Debit' | 'Credit' | 'Zero';
    previousClosingBalance?: number;
    change?: number;
    changePercentage?: number;
    percentageOfTotal?: number;
}

interface TrialBalanceData {
    asOfDate: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    periodStart: string;
    periodEnd: string;
    items: TrialBalanceItem[];
    totalOpeningDebit: number;
    totalOpeningCredit: number;
    totalDebitTransactions: number;
    totalCreditTransactions: number;
    totalClosingDebit: number;
    totalClosingCredit: number;
    previousTotalClosingDebit?: number;
    previousTotalClosingCredit?: number;
    totalChange?: number;
    totalChangePercentage?: number;
    isBalanced: boolean;
    difference: number;
    accountTypeSummary: {
        [key: string]: {
            count: number;
            totalDebit: number;
            totalCredit: number;
            totalBalance: number;
        };
    };
}

interface ComparisonData {
    previousPeriod: TrialBalanceData | null;
    previousYear: TrialBalanceData | null;
}

interface PeriodFilters {
    asOfDate: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    fiscalYear: string;
    compareWithPrevious: boolean;
    compareWithPreviousYear: boolean;
    customStartDate?: string;
    customEndDate?: string;
    includeZeroBalances: boolean;
    includeInactiveAccounts: boolean;
}

// ============== Helper Functions ==============
const getPeriodDates = (filters: PeriodFilters) => {
    const asOfDate = new Date(filters.asOfDate);
    let periodStart: Date;
    let periodEnd: Date = asOfDate;

    switch (filters.periodType) {
        case 'month':
            periodStart = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 1);
            periodEnd = new Date(asOfDate.getFullYear(), asOfDate.getMonth() + 1, 0);
            break;
        case 'quarter':
            const quarter = Math.floor(asOfDate.getMonth() / 3);
            periodStart = new Date(asOfDate.getFullYear(), quarter * 3, 1);
            periodEnd = new Date(asOfDate.getFullYear(), quarter * 3 + 3, 0);
            break;
        case 'year':
            periodStart = new Date(parseInt(filters.fiscalYear), 0, 1);
            periodEnd = new Date(parseInt(filters.fiscalYear), 11, 31);
            break;
        case 'custom':
            periodStart = new Date(filters.customStartDate || filters.asOfDate);
            periodEnd = new Date(filters.customEndDate || filters.asOfDate);
            break;
        default:
            periodStart = new Date(asOfDate.getFullYear(), 0, 1);
    }

    return {
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
    };
};

const getPreviousPeriodDates = (filters: PeriodFilters) => {
    const asOfDate = new Date(filters.asOfDate);
    let previousStart: Date;
    let previousEnd: Date;

    switch (filters.periodType) {
        case 'month':
            previousStart = new Date(asOfDate.getFullYear(), asOfDate.getMonth() - 1, 1);
            previousEnd = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 0);
            break;
        case 'quarter':
            const quarter = Math.floor(asOfDate.getMonth() / 3);
            previousStart = new Date(asOfDate.getFullYear(), quarter * 3 - 3, 1);
            previousEnd = new Date(asOfDate.getFullYear(), quarter * 3, 0);
            break;
        case 'year':
            previousStart = new Date(parseInt(filters.fiscalYear) - 1, 0, 1);
            previousEnd = new Date(parseInt(filters.fiscalYear) - 1, 11, 31);
            break;
        case 'custom':
            const currentStart = new Date(filters.customStartDate || filters.asOfDate);
            const currentEnd = new Date(filters.customEndDate || filters.asOfDate);
            const diffDays = Math.floor((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
            previousEnd = new Date(currentStart);
            previousEnd.setDate(previousEnd.getDate() - 1);
            previousStart = new Date(previousEnd);
            previousStart.setDate(previousStart.getDate() - diffDays);
            break;
        default:
            previousStart = new Date(asOfDate.getFullYear() - 1, 0, 1);
            previousEnd = new Date(asOfDate.getFullYear() - 1, 11, 31);
    }

    return {
        previousStart: previousStart.toISOString().split('T')[0],
        previousEnd: previousEnd.toISOString().split('T')[0],
    };
};

const getPreviousYearDates = (filters: PeriodFilters) => {
    const asOfDate = new Date(filters.asOfDate);
    const previousYearStart = new Date(asOfDate.getFullYear() - 1, 0, 1);
    const previousYearEnd = new Date(asOfDate.getFullYear() - 1, 11, 31);

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
const TrialBalance: React.FC = () => {
    // State
    const [data, setData] = useState<TrialBalanceData | null>(null);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [filters, setFilters] = useState<PeriodFilters>({
        asOfDate: new Date().toISOString().split('T')[0],
        periodType: 'year',
        fiscalYear: new Date().getFullYear().toString(),
        compareWithPrevious: false,
        compareWithPreviousYear: false,
        customStartDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        customEndDate: new Date().toISOString().split('T')[0],
        includeZeroBalances: false,
        includeInactiveAccounts: false,
    });

    const [sortConfig, setSortConfig] = useState<{
        key: keyof TrialBalanceItem | null;
        direction: 'asc' | 'desc';
    }>({ key: null, direction: 'asc' });

    const ITEMS_PER_PAGE = 20;
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
    } = useReportExport('trial-balance');

    // ============== Data Fetching ==============
    // src/pages/finance/reports/TrialBalance.tsx

    const calculateTrialBalance = useCallback((
        accounts: Account[],
        journals: JournalEntry[],
        periodStart: string,
        periodEnd: string,
        includeZeroBalances: boolean = false,
        includeInactiveAccounts: boolean = false
    ): TrialBalanceData => {
        const accountData = new Map<string, TrialBalanceItem>();

        // Initialize accounts with opening balances
        accounts.forEach((acc: Account) => {
            if (!includeInactiveAccounts && !acc.isActive) return;

            let openingBalance = acc.openingBalance || 0;

            // ✅ CRITICAL FIX: Negate opening balances for Liability, Equity, and Revenue accounts
            // In double-entry accounting, these accounts have Credit (negative) balances
            const accountType = acc.accountType || 'Other';
            if (accountType === 'Liability' || accountType === 'Equity' || accountType === 'Revenue') {
                openingBalance = -Math.abs(openingBalance);
            }
            // Asset and Expense accounts keep positive (Debit) balances
            // Note: Contra-asset accounts (Accumulated Depreciation) are Assets but have Credit balances
            // They will be handled by their individual opening balance values (already negative)

            accountData.set(acc.id, {
                id: acc.id,
                code: acc.code,
                name: acc.name,
                accountType: accountType,
                subType: acc.subType,
                openingBalance: openingBalance,
                debitTransactions: 0,
                creditTransactions: 0,
                netDebit: 0,
                netCredit: 0,
                closingBalance: openingBalance,
                balanceType: openingBalance > 0 ? 'Debit' : openingBalance < 0 ? 'Credit' : 'Zero',
                percentageOfTotal: 0,
            });
        });

        // Process journal entries
        journals.forEach((journal: JournalEntry) => {
            if (!journal.isPosted || !journal.lines) return;

            const journalDate = new Date(journal.date);
            const startDate = new Date(periodStart);
            const endDate = new Date(periodEnd);

            if (journalDate >= startDate && journalDate <= endDate) {
                journal.lines.forEach((line: JournalLine) => {
                    const account = accountData.get(line.accountId);
                    if (!account) return;

                    // ✅ CRITICAL FIX: Apply transactions correctly
                    // Debit increases Asset/Expense, decreases Liability/Equity/Revenue
                    // Credit decreases Asset/Expense, increases Liability/Equity/Revenue
                    const accountType = account.accountType;
                    const isLiabilityEquityRevenue = accountType === 'Liability' ||
                        accountType === 'Equity' ||
                        accountType === 'Revenue';

                    let adjustedAmount = line.amount;
                    // For Liability/Equity/Revenue accounts, flip the sign
                    if (isLiabilityEquityRevenue) {
                        adjustedAmount = -line.amount;
                    }

                    if (line.direction === 'Debit') {
                        account.debitTransactions += line.amount;
                        account.netDebit += line.amount;
                        account.closingBalance += adjustedAmount;
                    } else {
                        account.creditTransactions += line.amount;
                        account.netCredit += line.amount;
                        account.closingBalance -= adjustedAmount;
                    }
                });
            }
        });

        // Update balance types and calculate totals
        let totalOpeningDebit = 0;
        let totalOpeningCredit = 0;
        let totalDebitTransactions = 0;
        let totalCreditTransactions = 0;
        let totalClosingDebit = 0;
        let totalClosingCredit = 0;
        const accountTypeSummary: { [key: string]: { count: number; totalDebit: number; totalCredit: number; totalBalance: number } } = {};

        const finalItems: TrialBalanceItem[] = [];

        accountData.forEach((account) => {
            // Update balance type
            account.balanceType = account.closingBalance > 0 ? 'Debit' : account.closingBalance < 0 ? 'Credit' : 'Zero';

            // Skip zero balance accounts if option is disabled
            if (!includeZeroBalances && Math.abs(account.closingBalance) < 0.01 &&
                account.debitTransactions === 0 && account.creditTransactions === 0) {
                return;
            }

            // Update opening balance totals
            if (account.openingBalance > 0) {
                totalOpeningDebit += account.openingBalance;
            } else if (account.openingBalance < 0) {
                totalOpeningCredit += Math.abs(account.openingBalance);
            }

            totalDebitTransactions += account.debitTransactions;
            totalCreditTransactions += account.creditTransactions;

            if (account.closingBalance > 0) {
                totalClosingDebit += account.closingBalance;
            } else if (account.closingBalance < 0) {
                totalClosingCredit += Math.abs(account.closingBalance);
            }

            // Update account type summary
            if (!accountTypeSummary[account.accountType]) {
                accountTypeSummary[account.accountType] = {
                    count: 0,
                    totalDebit: 0,
                    totalCredit: 0,
                    totalBalance: 0,
                };
            }
            accountTypeSummary[account.accountType].count++;
            accountTypeSummary[account.accountType].totalDebit += account.debitTransactions;
            accountTypeSummary[account.accountType].totalCredit += account.creditTransactions;
            accountTypeSummary[account.accountType].totalBalance += Math.abs(account.closingBalance);

            finalItems.push(account);
        });

        // Calculate percentages
        const totalBalance = totalClosingDebit + totalClosingCredit;
        finalItems.forEach((account) => {
            account.percentageOfTotal = totalBalance > 0 ? (Math.abs(account.closingBalance) / totalBalance) * 100 : 0;
        });

        const difference = totalClosingDebit - totalClosingCredit;

        return {
            asOfDate: periodEnd,
            periodType: filters.periodType,
            periodStart,
            periodEnd,
            items: finalItems,
            totalOpeningDebit,
            totalOpeningCredit,
            totalDebitTransactions,
            totalCreditTransactions,
            totalClosingDebit,
            totalClosingCredit,
            isBalanced: Math.abs(difference) < 0.01,
            difference,
            accountTypeSummary,
        };
    }, [filters.periodType]);

    const mergeComparisonData = useCallback((
        currentData: TrialBalanceData,
        previousData: TrialBalanceData | null,
        previousYearData: TrialBalanceData | null
    ): TrialBalanceData => {
        if (!previousData && !previousYearData) return currentData;

        const mergedData = { ...currentData };

        // Merge with previous period
        if (previousData) {
            // Create a map of previous items for quick lookup
            const previousItemsMap = new Map(
                previousData.items.map(item => [item.id, item])
            );

            // Update current items with previous data
            mergedData.items = currentData.items.map(item => {
                const prevItem = previousItemsMap.get(item.id);
                if (prevItem) {
                    const change = item.closingBalance - prevItem.closingBalance;
                    const changePercentage = prevItem.closingBalance !== 0
                        ? (change / Math.abs(prevItem.closingBalance)) * 100
                        : 0;
                    return {
                        ...item,
                        previousClosingBalance: prevItem.closingBalance,
                        change,
                        changePercentage,
                    };
                }
                return item;
            });

            mergedData.previousTotalClosingDebit = previousData.totalClosingDebit;
            mergedData.previousTotalClosingCredit = previousData.totalClosingCredit;
            mergedData.totalChange = currentData.totalClosingDebit - previousData.totalClosingDebit;
            mergedData.totalChangePercentage = previousData.totalClosingDebit !== 0
                ? (mergedData.totalChange / Math.abs(previousData.totalClosingDebit)) * 100
                : 0;
        }

        return mergedData;
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const { periodStart, periodEnd } = getPeriodDates(filters);

            // Fetch accounts and journals for current period
            const [accountsRes, journalRes] = await Promise.all([
                getAccounts(),
                getJournalEntries({
                    fromDate: periodStart,
                    toDate: periodEnd
                }),
            ]);

            const accounts = accountsRes.data.data || accountsRes.data || [];
            const journals = journalRes.data.data || journalRes.data || [];

            // Build current trial balance
            const currentData = calculateTrialBalance(
                accounts,
                journals,
                periodStart,
                periodEnd,
                filters.includeZeroBalances,
                filters.includeInactiveAccounts
            );

            let previousData: TrialBalanceData | null = null;
            let previousYearData: TrialBalanceData | null = null;

            // Fetch comparison data if needed
            if (filters.compareWithPrevious || filters.compareWithPreviousYear) {
                const comparisonPromises: Promise<any>[] = [];

                if (filters.compareWithPrevious) {
                    const { previousStart, previousEnd } = getPreviousPeriodDates(filters);
                    comparisonPromises.push(
                        getJournalEntries({
                            fromDate: previousStart,
                            toDate: previousEnd
                        })
                    );
                }

                if (filters.compareWithPreviousYear) {
                    const { previousYearStart, previousYearEnd } = getPreviousYearDates(filters);
                    comparisonPromises.push(
                        getJournalEntries({
                            fromDate: previousYearStart,
                            toDate: previousYearEnd
                        })
                    );
                }

                const comparisonResults = await Promise.all(comparisonPromises);
                let resultIndex = 0;

                if (filters.compareWithPrevious) {
                    const prevJournals = comparisonResults[resultIndex].data.data || comparisonResults[resultIndex].data || [];
                    const { previousStart, previousEnd } = getPreviousPeriodDates(filters);
                    previousData = calculateTrialBalance(
                        accounts,
                        prevJournals,
                        previousStart,
                        previousEnd,
                        filters.includeZeroBalances,
                        filters.includeInactiveAccounts
                    );
                    resultIndex++;
                }

                if (filters.compareWithPreviousYear) {
                    const prevYearJournals = comparisonResults[resultIndex].data.data || comparisonResults[resultIndex].data || [];
                    const { previousYearStart, previousYearEnd } = getPreviousYearDates(filters);
                    previousYearData = calculateTrialBalance(
                        accounts,
                        prevYearJournals,
                        previousYearStart,
                        previousYearEnd,
                        filters.includeZeroBalances,
                        filters.includeInactiveAccounts
                    );
                }
            }

            // Merge comparison data
            const mergedData = mergeComparisonData(currentData, previousData, previousYearData);
            setData(mergedData);
            setComparisonData({ previousPeriod: previousData, previousYear: previousYearData });

        } catch (error) {
            console.error('Error fetching trial balance:', error);
            showToast.error('Failed to load trial balance');
        } finally {
            setLoading(false);
        }
    }, [filters, calculateTrialBalance, mergeComparisonData]);

    // ============== Effects ==============
    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
            month: 'long',
            day: 'numeric',
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

    const getTypeBgColor = (type: string) => {
        const colors: Record<string, string> = {
            Asset: 'bg-blue-50 border-blue-200',
            Liability: 'bg-red-50 border-red-200',
            Equity: 'bg-purple-50 border-purple-200',
            Revenue: 'bg-green-50 border-green-200',
            Expense: 'bg-orange-50 border-orange-200',
            Other: 'bg-gray-50 border-gray-200',
        };
        return colors[type] || 'bg-gray-50 border-gray-200';
    };

    const getBalanceTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            Debit: 'bg-blue-100 text-blue-700',
            Credit: 'bg-red-100 text-red-700',
            Zero: 'bg-gray-100 text-gray-500',
        };
        return colors[type] || 'bg-gray-100 text-gray-500';
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

    const handleSort = (key: keyof TrialBalanceItem) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    // ============== Filtering and Sorting ==============
    const filteredItems = useMemo(() => {
        if (!data) return [];

        let items = data.items;

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            items = items.filter(item =>
                item.code.toLowerCase().includes(term) ||
                item.name.toLowerCase().includes(term)
            );
        }

        // Type filter
        if (filterType !== 'All') {
            items = items.filter(item => item.accountType === filterType);
        }

        // Sorting
        if (sortConfig.key) {
            items.sort((a, b) => {
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

        return items;
    }, [data, searchTerm, filterType, sortConfig]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset page when filters change
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
    if (!data) {
        return (
            <div className="text-center py-12">
                <Scale className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No Data Available</h3>
                <p className="text-gray-500">Run the report to see the trial balance</p>
                <Button onClick={fetchData} className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Report
                </Button>
            </div>
        );
    }

    const showComparison = filters.compareWithPrevious || filters.compareWithPreviousYear;

    // ============== Main Render ==============
    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <BalanceIcon className="w-6 h-6 text-indigo-600"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Trial Balance</h1>
                        <p className="text-sm text-gray-500">
                            {filters.periodType === 'custom' ? (
                                <>From {formatDate(data.periodStart)} to {formatDate(data.periodEnd)}</>
                            ) : (
                                <>As of {formatDate(data.asOfDate)}</>
                            )}
                            <span className="ml-2 text-xs bg-indigo-100 px-2 py-1 rounded-full text-indigo-700">
                                {filters.periodType.charAt(0).toUpperCase() + filters.periodType.slice(1)}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => {
                            setIsRefreshing(true);
                            fetchData();
                        }}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''}/>
                        Refresh
                    </Button>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={exporting}
                    >
                        <Download size={16}/>
                        {exporting && (
                            <div className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center">
                                <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
                                    <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-3"/>
                                    <p className="font-medium">Generating PDF...</p>
                                    <p className="text-sm text-gray-500">Please wait.</p>
                                </div>
                            </div>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport(data)}
                    >
                        <Printer size={16}/>
                        Print
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Period Type */}
                    <div>
                        <Label className="text-sm font-medium">Period Type</Label>
                        <Select
                            value={filters.periodType}
                            onValueChange={(value: any) => {
                                const now = new Date();
                                let asOfDate = new Date();

                                switch (value) {
                                    case 'month':
                                        asOfDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                        break;
                                    case 'quarter':
                                        const quarter = Math.floor(now.getMonth() / 3);
                                        asOfDate = new Date(now.getFullYear(), quarter * 3 + 2, 1);
                                        break;
                                    case 'year':
                                        asOfDate = new Date(now.getFullYear(), 11, 31);
                                        break;
                                    case 'custom':
                                        asOfDate = now;
                                        break;
                                }

                                setFilters({
                                    ...filters,
                                    periodType: value,
                                    asOfDate: asOfDate.toISOString().split('T')[0],
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select period"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">Month</SelectItem>
                                <SelectItem value="quarter">Quarter</SelectItem>
                                <SelectItem value="year">Year</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* As of Date */}
                    <div>
                        <Label className="text-sm font-medium">As of Date</Label>
                        <Input
                            type="date"
                            value={filters.asOfDate}
                            onChange={(e) => setFilters({...filters, asOfDate: e.target.value})}
                        />
                    </div>

                    {/* Fiscal Year */}
                    <div>
                        <Label className="text-sm font-medium">Fiscal Year</Label>
                        <Select
                            value={filters.fiscalYear}
                            onValueChange={(value) => setFilters({...filters, fiscalYear: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select year"/>
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

                    {/* Custom Range */}
                    {filters.periodType === 'custom' && (
                        <>
                            <div>
                                <Label className="text-sm font-medium">Start Date</Label>
                                <Input
                                    type="date"
                                    value={filters.customStartDate}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        customStartDate: e.target.value
                                    })}
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">End Date</Label>
                                <Input
                                    type="date"
                                    value={filters.customEndDate}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        customEndDate: e.target.value
                                    })}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Options and Comparison */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includeZeroBalances"
                            checked={filters.includeZeroBalances}
                            onChange={(e) => setFilters({
                                ...filters,
                                includeZeroBalances: e.target.checked
                            })}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <Label htmlFor="includeZeroBalances" className="cursor-pointer text-sm">
                            Include Zero Balance Accounts
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includeInactive"
                            checked={filters.includeInactiveAccounts}
                            onChange={(e) => setFilters({
                                ...filters,
                                includeInactiveAccounts: e.target.checked
                            })}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <Label htmlFor="includeInactive" className="cursor-pointer text-sm">
                            Include Inactive Accounts
                        </Label>
                    </div>
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
                    >
                        <RefreshCw className="h-4 w-4 mr-2"/>
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Period Info Summary */}
            <div
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 text-sm text-gray-600 border border-gray-200">
                <div className="flex flex-wrap gap-4 items-center">
                    <span>
                        <strong>Period:</strong> {formatDate(data.periodStart)} to {formatDate(data.periodEnd)}
                    </span>
                    <span className="w-px h-4 bg-gray-300"/>
                    <span>
                        <strong>Fiscal Year:</strong> {filters.fiscalYear}
                    </span>
                    <span className="w-px h-4 bg-gray-300"/>
                    <span>
                        <strong>Total Accounts:</strong> {data.items.length}
                    </span>
                    {filters.includeZeroBalances && (
                        <>
                            <span className="w-px h-4 bg-gray-300"/>
                            <span className="text-indigo-600">
                                <strong>Including:</strong> Zero balance accounts
                            </span>
                        </>
                    )}
                    {showComparison && (
                        <>
                            <span className="w-px h-4 bg-gray-300"/>
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

            {/* Balance Check */}
            <Card
                className={`border-2 ${data.isBalanced ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        {data.isBalanced ? (
                            <CheckCircle className="h-6 w-6 text-green-600"/>
                        ) : (
                            <AlertCircle className="h-6 w-6 text-red-600"/>
                        )}
                        <div className="flex-1">
                            <p className={`font-semibold ${data.isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                                {data.isBalanced ? '✓ Trial Balance is Balanced' : '✗ Trial Balance is Out of Balance'}
                            </p>
                            <p className="text-sm text-gray-600">
                                Total Debits: {formatCurrency(data.totalClosingDebit)} = Total
                                Credits: {formatCurrency(data.totalClosingCredit)}
                                {!data.isBalanced && (
                                    <span className="text-red-600 ml-2">
                                        (Difference: {formatCurrency(Math.abs(data.difference))})
                                    </span>
                                )}
                            </p>
                        </div>
                        {data.totalChange !== undefined && showComparison && (
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Change from previous</p>
                                <p className={`font-semibold ${getChangeColor(data.totalChange)}`}>
                                    {getChangeIcon(data.totalChange)}
                                    {formatCurrency(data.totalChange)}
                                    <span className="ml-1 text-sm">
                                        ({data.totalChangePercentage?.toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Account Type Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(data.accountTypeSummary).map(([type, summary]) => (
                    <Card key={type} className={`${getTypeBgColor(type)} border`}>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                {getAccountTypeIcon(type)}
                                <span className={`text-sm font-medium ${getTypeColor(type)}`}>
                                    {type}
                                </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{summary.count}</p>
                            <p className="text-xs text-gray-500">
                                Balance: {formatCurrency(summary.totalBalance)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                    <Input
                        placeholder="Search accounts by code or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2"/>
                        <SelectValue placeholder="Account Type"/>
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
                    {filteredItems.length} accounts
                </Badge>
            </div>

            {/* Trial Balance Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('code')}
                                >
                                    Code {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('name')}
                                >
                                    Account
                                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('accountType')}
                                >
                                    Type {sortConfig.key === 'accountType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('openingBalance')}
                                >
                                    Opening {sortConfig.key === 'openingBalance' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('debitTransactions')}
                                >
                                    Debit {sortConfig.key === 'debitTransactions' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('creditTransactions')}
                                >
                                    Credit {sortConfig.key === 'creditTransactions' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('closingBalance')}
                                >
                                    Closing {sortConfig.key === 'closingBalance' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Balance Type
                                </th>
                                {showComparison && (
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Change
                                    </th>
                                )}
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    %
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={showComparison ? 10 : 9}
                                        className="px-4 py-8 text-center text-gray-500">
                                        No accounts found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.code}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                                        <td className="px-4 py-3">
                                                <span
                                                    className={`text-sm font-medium ${getTypeColor(item.accountType)}`}>
                                                    {item.accountType}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            {item.openingBalance !== 0 ? formatCurrency(item.openingBalance) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-blue-600">
                                            {item.debitTransactions > 0 ? formatCurrency(item.debitTransactions) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-red-600">
                                            {item.creditTransactions > 0 ? formatCurrency(item.creditTransactions) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium">
                                            {item.closingBalance > 0 ? formatCurrency(item.closingBalance) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge className={getBalanceTypeBadge(item.balanceType)}>
                                                {item.balanceType}
                                            </Badge>
                                        </td>
                                        {showComparison && (
                                            <td className="px-4 py-3 text-sm text-right">
                                                {item.change !== undefined && (
                                                    <span className={`font-medium ${getChangeColor(item.change)}`}>
                                                            {getChangeIcon(item.change)}
                                                        {formatCurrency(item.change)}
                                                        {item.changePercentage !== undefined && item.changePercentage !== 0 && (
                                                            <span className="text-xs ml-1">
                                                                    ({item.changePercentage > 0 ? '+' : ''}
                                                                {item.changePercentage.toFixed(1)}%)
                                                                </span>
                                                        )}
                                                        </span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-sm text-right text-gray-500">
                                            {item.percentageOfTotal?.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                            <tr className="font-bold">
                                <td colSpan={3} className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                                <td className="px-4 py-3 text-sm text-right">
                                    {formatCurrency(data.totalOpeningDebit)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-blue-600">
                                    {formatCurrency(data.totalDebitTransactions)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-red-600">
                                    {formatCurrency(data.totalCreditTransactions)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                        <span className={data.isBalanced ? 'text-green-600' : 'text-red-600'}>
                                            {formatCurrency(data.totalClosingDebit)}
                                        </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Badge
                                        className={data.isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                        {data.isBalanced ? 'Balanced' : 'Unbalanced'}
                                    </Badge>
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
                                <td className="px-4 py-3 text-sm text-right text-gray-500">
                                    100%
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} accounts
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4"/>
                        </Button>
                        <div className="flex gap-1">
                            {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
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
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            )}

            {/* Comparison Summary (if enabled) */}
            {showComparison && comparisonData?.previousPeriod && (
                <Card className="border-indigo-200 bg-indigo-50">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-indigo-800 mb-3">Trial Balance Comparison Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Total Debits Change</p>
                                <p className={`font-bold ${getChangeColor(data.totalChange)}`}>
                                    {data.totalChange !== undefined && formatCurrency(data.totalChange)}
                                    <span className="ml-1">
                                        ({data.totalChangePercentage?.toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Account Count Change</p>
                                <p className={`font-bold ${getChangeColor(data.items.length - (comparisonData.previousPeriod?.items.length || 0))}`}>
                                    {data.items.length - (comparisonData.previousPeriod?.items.length || 0)}
                                    <span className="ml-1">
                                        ({((data.items.length - (comparisonData.previousPeriod?.items.length || 0)) / (comparisonData.previousPeriod?.items.length || 1) * 100).toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Balance Status</p>
                                <Badge
                                    className={data.isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                    {data.isBalanced ? 'Balanced' : 'Unbalanced'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-gray-600">Difference Amount</p>
                                <p className={`font-bold ${data.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(data.difference)}
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
                            onClick={() => handleExport(data, showComparison)}
                            disabled={exporting}
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

export default TrialBalance;