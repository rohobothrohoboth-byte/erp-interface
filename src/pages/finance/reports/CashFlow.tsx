// src/pages/finance/reports/CashFlow.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, RefreshCw, Download, Printer, Calendar,
    TrendingUp, TrendingDown, BarChart3, FileText,
    ChevronLeft, ChevronRight, Filter, Eye,
    PieChart, AlertCircle, CheckCircle, Activity,
    ArrowUpRight, ArrowDownRight, Clock,
    Building2, CreditCard, Landmark, Briefcase,
    ShoppingBag, Users, Home, Settings, Package,
    ArrowUp, ArrowDown, Minus, Zap, Coffee
} from 'lucide-react';
import { getAccounts, getJournalEntries } from '../../../services/finance/finance.api';
import { useReportExport } from '../../../hooks/useReportExport';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';

// ============== Types ==============
interface Account {
    id: string;
    code: string;
    name: string;
    accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
    subType?: string;
    openingBalance: number;
    isActive: boolean;
    isCashEquivalent?: boolean;
}

interface JournalEntry {
    id: string;
    isPosted: boolean;
    lines: JournalLine[];
    date: string;
    description?: string;
    reference?: string;
}

interface JournalLine {
    accountId: string;
    amount: number;
    direction: 'Debit' | 'Credit';
}

interface CashFlowItem {
    id: string;
    code: string;
    name: string;
    amount: number;
    type: 'inflow' | 'outflow';
    description: string;
    category?: string;
    reference?: string;
    date?: string;
    icon?: React.ReactNode;
}

interface CashFlowData {
    startDate: string;
    endDate: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    operatingActivities: {
        items: CashFlowItem[];
        total: number;
        previousTotal?: number;
        change?: number;
        changePercentage?: number;
    };
    investingActivities: {
        items: CashFlowItem[];
        total: number;
        previousTotal?: number;
        change?: number;
        changePercentage?: number;
    };
    financingActivities: {
        items: CashFlowItem[];
        total: number;
        previousTotal?: number;
        change?: number;
        changePercentage?: number;
    };
    netCashFlow: number;
    previousNetCashFlow?: number;
    netCashFlowChange?: number;
    netCashFlowChangePercentage?: number;
    beginningCash: number;
    endingCash: number;
    previousEndingCash?: number;
    endingCashChange?: number;
    endingCashChangePercentage?: number;
    cashChange: number;
    freeCashFlow?: number;
    cashFlowRatios: {
        operatingCashFlowRatio: number;
        cashFlowMargin: number;
        cashFlowCoverage: number;
    };
}

interface ComparisonData {
    previousPeriod: CashFlowData | null;
    previousYear: CashFlowData | null;
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
    includeCashEquivalents: boolean;
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

const getActivityIcon = (name: string, code: string): React.ReactNode => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('cash') || lowerName.includes('bank')) return <DollarSign className="h-4 w-4" />;
    if (lowerName.includes('receivable') || lowerName.includes('payment')) return <CreditCard className="h-4 w-4" />;
    if (lowerName.includes('inventory') || lowerName.includes('supplies')) return <Package className="h-4 w-4" />;
    if (lowerName.includes('equipment') || lowerName.includes('property')) return <Building2 className="h-4 w-4" />;
    if (lowerName.includes('investment') || lowerName.includes('security')) return <Landmark className="h-4 w-4" />;
    if (lowerName.includes('loan') || lowerName.includes('debt')) return <Briefcase className="h-4 w-4" />;
    if (lowerName.includes('salary') || lowerName.includes('wage')) return <Users className="h-4 w-4" />;
    if (lowerName.includes('rent')) return <Home className="h-4 w-4" />;
    if (lowerName.includes('utility')) return <Settings className="h-4 w-4" />;
    if (lowerName.includes('dividend')) return <ArrowUpRight className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
};

// ============== Main Component ==============
const CashFlow: React.FC = () => {
    // State
    const [data, setData] = useState<CashFlowData | null>(null);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
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
        includeCashEquivalents: true,
    });

    const [activeView, setActiveView] = useState<'standard' | 'comparison' | 'trend'>('standard');

    // ✅ FIXED: Use 'cash-flow' instead of 'income-statement'
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
    } = useReportExport('cash-flow');

    // ============== Data Fetching ==============
    const calculateCashFlows = useCallback((
        accounts: Account[],
        journals: JournalEntry[],
        periodStart: string,
        periodEnd: string,
        includeCashEquivalents: boolean = true
    ) => {
        // Find cash and cash equivalent accounts
        const cashAccounts = accounts.filter((acc: Account) => {
            const isCash = acc.code === '1000' ||
                acc.code === '1001' ||
                acc.name.toLowerCase().includes('cash') ||
                acc.name.toLowerCase().includes('bank');

            const isCashEquivalent = includeCashEquivalents && (
                acc.code.startsWith('100') ||
                acc.name.toLowerCase().includes('equivalent') ||
                acc.name.toLowerCase().includes('marketable') ||
                acc.subType === 'CashEquivalent'
            );

            return isCash || isCashEquivalent;
        });

        if (cashAccounts.length === 0) {
            showToast.warning('Cash account not found');
            return null;
        }

        const cashAccountIds = new Set(cashAccounts.map(a => a.id));
        const cashTransactions: CashFlowItem[] = [];

        // Get opening cash balance
        let beginningCash = 0;
        cashAccounts.forEach((acc: Account) => {
            beginningCash += acc.openingBalance || 0;
        });

        // Process journal entries for cash movements
        journals.forEach((journal: JournalEntry) => {
            if (!journal.isPosted || !journal.lines) return;

            const journalDate = new Date(journal.date);
            const startDate = new Date(periodStart);
            const endDate = new Date(periodEnd);

            if (journalDate < startDate || journalDate > endDate) return;

            let cashLine: JournalLine | null = null;
            let otherLine: JournalLine | null = null;

            // Identify cash and non-cash lines
            journal.lines.forEach((line: JournalLine) => {
                if (cashAccountIds.has(line.accountId)) {
                    cashLine = line;
                } else {
                    otherLine = line;
                }
            });

            if (!cashLine) return;

            // Find the corresponding account for categorization
            const otherAccount = otherLine ?
                accounts.find((a: Account) => a.id === otherLine.accountId) :
                null;

            // Determine activity type
            let activityType: 'operating' | 'investing' | 'financing' = 'operating';
            let category = 'Other';

            if (otherAccount) {
                const accType = otherAccount.accountType;
                const accCode = otherAccount.code;
                const accName = otherAccount.name.toLowerCase();

                if (accType === 'Revenue' || accType === 'Expense') {
                    activityType = 'operating';
                    category = accType === 'Revenue' ? 'Revenue' : 'Expense';
                } else if (accType === 'Asset') {
                    if (accCode.startsWith('14') || accCode.startsWith('15')) {
                        activityType = 'investing';
                        category = 'Fixed Assets';
                    } else if (accCode.startsWith('16') || accCode.startsWith('17')) {
                        activityType = 'investing';
                        category = 'Investments';
                    } else {
                        activityType = 'operating';
                        category = 'Other Assets';
                    }
                } else if (accType === 'Liability') {
                    if (accCode.startsWith('22') || accCode.startsWith('23')) {
                        activityType = 'financing';
                        category = 'Long-Term Debt';
                    } else {
                        activityType = 'operating';
                        category = 'Current Liabilities';
                    }
                } else if (accType === 'Equity') {
                    activityType = 'financing';
                    if (accName.includes('dividend')) {
                        category = 'Dividends';
                    } else if (accName.includes('capital') || accName.includes('contribution')) {
                        category = 'Capital';
                    } else {
                        category = 'Equity';
                    }
                }
            }

            // Create cash flow item
            const amount = cashLine.direction === 'Debit' ? cashLine.amount : -cashLine.amount;
            const item: CashFlowItem = {
                id: journal.id,
                code: otherAccount?.code || 'N/A',
                name: otherAccount?.name || 'Cash Movement',
                amount: amount,
                type: amount >= 0 ? 'inflow' : 'outflow',
                description: journal.description || 'Transaction',
                category: category,
                reference: journal.reference,
                date: journal.date,
                icon: getActivityIcon(otherAccount?.name || '', otherAccount?.code || ''),
            };

            cashTransactions.push(item);
        });

        // Separate into activities
        const operatingItems = cashTransactions.filter(item => {
            const account = accounts.find(a => a.code === item.code);
            if (!account) return false;
            const accType = account.accountType;
            const accCode = account.code;
            return accType === 'Revenue' || accType === 'Expense' ||
                (accType === 'Asset' && !accCode.startsWith('14') && !accCode.startsWith('15') &&
                    !accCode.startsWith('16') && !accCode.startsWith('17')) ||
                (accType === 'Liability' && !accCode.startsWith('22') && !accCode.startsWith('23'));
        });

        const investingItems = cashTransactions.filter(item => {
            const account = accounts.find(a => a.code === item.code);
            if (!account) return false;
            const accCode = account.code;
            return account.accountType === 'Asset' &&
                (accCode.startsWith('14') || accCode.startsWith('15') ||
                    accCode.startsWith('16') || accCode.startsWith('17'));
        });

        const financingItems = cashTransactions.filter(item => {
            const account = accounts.find(a => a.code === item.code);
            if (!account) return false;
            const accCode = account.code;
            return (account.accountType === 'Liability' &&
                    (accCode.startsWith('22') || accCode.startsWith('23'))) ||
                account.accountType === 'Equity';
        });

        // Calculate totals
        const totalOperating = operatingItems.reduce((sum, item) => sum + item.amount, 0);
        const totalInvesting = investingItems.reduce((sum, item) => sum + item.amount, 0);
        const totalFinancing = financingItems.reduce((sum, item) => sum + item.amount, 0);
        const netCashFlow = totalOperating + totalInvesting + totalFinancing;
        const endingCash = beginningCash + netCashFlow;

        // Calculate free cash flow
        const freeCashFlow = totalOperating + totalInvesting;

        // Calculate ratios
        const operatingCashFlowRatio = totalOperating > 0 ? totalOperating / Math.abs(totalOperating || 1) : 0;
        const cashFlowMargin = netCashFlow > 0 ? netCashFlow / Math.abs(netCashFlow || 1) : 0;
        const cashFlowCoverage = totalOperating > 0 ? totalOperating / Math.abs(totalOperating || 1) : 0;

        return {
            startDate: periodStart,
            endDate: periodEnd,
            periodType: filters.periodType,
            operatingActivities: {
                items: operatingItems,
                total: totalOperating,
            },
            investingActivities: {
                items: investingItems,
                total: totalInvesting,
            },
            financingActivities: {
                items: financingItems,
                total: totalFinancing,
            },
            netCashFlow,
            beginningCash,
            endingCash,
            cashChange: netCashFlow,
            freeCashFlow,
            cashFlowRatios: {
                operatingCashFlowRatio,
                cashFlowMargin,
                cashFlowCoverage,
            },
        };
    }, [filters.periodType]);

    const buildCashFlow = useCallback((
        accounts: Account[],
        journals: JournalEntry[],
        startDate: string,
        endDate: string,
        periodType: 'month' | 'quarter' | 'year' | 'custom',
        includeCashEquivalents: boolean = true
    ): CashFlowData | null => {
        return calculateCashFlows(
            accounts,
            journals,
            startDate,
            endDate,
            includeCashEquivalents
        );
    }, [calculateCashFlows]);

    const mergeComparisonData = useCallback((
        currentData: CashFlowData,
        previousData: CashFlowData | null,
        previousYearData: CashFlowData | null
    ): CashFlowData => {
        if (!previousData && !previousYearData) return currentData;

        const mergedData = { ...currentData };

        if (previousData) {
            mergedData.operatingActivities.previousTotal = previousData.operatingActivities.total;
            mergedData.operatingActivities.change = currentData.operatingActivities.total - previousData.operatingActivities.total;
            mergedData.operatingActivities.changePercentage = previousData.operatingActivities.total !== 0
                ? (mergedData.operatingActivities.change / Math.abs(previousData.operatingActivities.total)) * 100
                : 0;

            mergedData.investingActivities.previousTotal = previousData.investingActivities.total;
            mergedData.investingActivities.change = currentData.investingActivities.total - previousData.investingActivities.total;
            mergedData.investingActivities.changePercentage = previousData.investingActivities.total !== 0
                ? (mergedData.investingActivities.change / Math.abs(previousData.investingActivities.total)) * 100
                : 0;

            mergedData.financingActivities.previousTotal = previousData.financingActivities.total;
            mergedData.financingActivities.change = currentData.financingActivities.total - previousData.financingActivities.total;
            mergedData.financingActivities.changePercentage = previousData.financingActivities.total !== 0
                ? (mergedData.financingActivities.change / Math.abs(previousData.financingActivities.total)) * 100
                : 0;

            mergedData.previousNetCashFlow = previousData.netCashFlow;
            mergedData.netCashFlowChange = currentData.netCashFlow - previousData.netCashFlow;
            mergedData.netCashFlowChangePercentage = previousData.netCashFlow !== 0
                ? (mergedData.netCashFlowChange / Math.abs(previousData.netCashFlow)) * 100
                : 0;

            mergedData.previousEndingCash = previousData.endingCash;
            mergedData.endingCashChange = currentData.endingCash - previousData.endingCash;
            mergedData.endingCashChangePercentage = previousData.endingCash !== 0
                ? (mergedData.endingCashChange / Math.abs(previousData.endingCash)) * 100
                : 0;
        }

        return mergedData;
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const { periodStart, periodEnd } = getPeriodDates(filters);

            const [accountsRes, journalRes] = await Promise.all([
                getAccounts(),
                getJournalEntries({
                    fromDate: periodStart,
                    toDate: periodEnd
                }),
            ]);

            const accounts = accountsRes.data.data || accountsRes.data || [];
            const journals = journalRes.data.data || journalRes.data || [];

            const currentData = buildCashFlow(
                accounts,
                journals,
                periodStart,
                periodEnd,
                filters.periodType,
                filters.includeCashEquivalents
            );

            if (!currentData) {
                setLoading(false);
                setIsRefreshing(false);
                return;
            }

            let previousData: CashFlowData | null = null;
            let previousYearData: CashFlowData | null = null;

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
                    previousData = buildCashFlow(
                        accounts,
                        prevJournals,
                        previousStart,
                        previousEnd,
                        filters.periodType,
                        filters.includeCashEquivalents
                    );
                    resultIndex++;
                }

                if (filters.compareWithPreviousYear) {
                    const prevYearJournals = comparisonResults[resultIndex].data.data || comparisonResults[resultIndex].data || [];
                    const { previousYearStart, previousYearEnd } = getPreviousYearDates(filters);
                    previousYearData = buildCashFlow(
                        accounts,
                        prevYearJournals,
                        previousYearStart,
                        previousYearEnd,
                        'year',
                        filters.includeCashEquivalents
                    );
                }
            }

            const mergedData = mergeComparisonData(currentData, previousData, previousYearData);
            setData(mergedData);
            setComparisonData({ previousPeriod: previousData, previousYear: previousYearData });

        } catch (error) {
            console.error('Error fetching cash flow:', error);
            showToast.error('Failed to load cash flow statement');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filters, buildCashFlow, mergeComparisonData]);

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

    // ============== Render Sections ==============
    const renderSection = (
        title: string,
        items: CashFlowItem[],
        total: number,
        icon: React.ReactNode,
        color: string,
        showComparison: boolean = false,
        previousTotal?: number,
        change?: number,
        changePercentage?: number
    ) => {
        if (items.length === 0) {
            return (
                <div className="mb-4">
                    <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-700 flex items-center gap-2">
                            {icon}
                            {title}
                        </span>
                        <div className="flex items-center gap-6">
                            <span className="font-semibold text-gray-900">{formatCurrency(0)}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 text-center py-2">No transactions in this category</p>
                </div>
            );
        }

        const sortedItems = [...items].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

        return (
            <div className="mb-4">
                <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                        {icon}
                        {title}
                    </span>
                    <div className="flex items-center gap-6">
                        <span className={`font-semibold ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(total)}
                        </span>
                        {showComparison && previousTotal !== undefined && (
                            <div className="flex items-center gap-2 w-32">
                                <span className="text-xs text-gray-400">vs prev</span>
                                <span className={`text-xs font-medium ${getChangeColor(change)}`}>
                                    {change !== undefined && formatCurrency(change)}
                                    {changePercentage !== undefined && changePercentage !== 0 && (
                                        <span className="ml-1">
                                            ({changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                {sortedItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1.5 px-4 hover:bg-gray-50 transition-colors border-b border-gray-100 group">
                        <div className="flex items-center gap-3">
                            <span className="text-gray-400">{item.icon}</span>
                            <span className="text-xs text-gray-400 font-mono">{item.code}</span>
                            <span className="text-sm text-gray-700">{item.name}</span>
                            {item.category && (
                                <Badge variant="outline" className="text-xs">
                                    {item.category}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {item.type === 'inflow' ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${item.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(item.amount)}
                            </span>
                            <span className="text-xs text-gray-400 w-16 text-right">
                                {item.type === 'inflow' ? 'Inflow' : 'Outflow'}
                            </span>
                        </div>
                    </div>
                ))}
                <div className="mt-1 pt-2 border-t-2 border-gray-300 flex justify-between items-center font-medium">
                    <span className="text-sm text-gray-600">Total {title}</span>
                    <div className="flex items-center gap-6">
                        <span className={`text-sm font-bold ${total >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // ============== Loading State ==============
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    // ============== Empty State ==============
    if (!data) {
        return (
            <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No Data Available</h3>
                <p className="text-gray-500">Run the report to see the cash flow statement</p>
                <Button onClick={fetchData} className="mt-4 bg-cyan-600 hover:bg-cyan-700">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cash Flow Statement</h1>
                        <p className="text-sm text-gray-500">
                            {filters.periodType === 'custom' ? (
                                <>From {formatDate(data.startDate)} to {formatDate(data.endDate)}</>
                            ) : (
                                <>For the {filters.periodType} ending {formatDate(data.endDate)}</>
                            )}
                            <span className="ml-2 text-xs bg-cyan-100 px-2 py-1 rounded-full text-cyan-700">
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
                        onClick={() => handlePrintReport(data)}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

                    <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium">End Date</Label>
                        <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>

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

                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includeCashEquivalents"
                            checked={filters.includeCashEquivalents}
                            onChange={(e) => setFilters({
                                ...filters,
                                includeCashEquivalents: e.target.checked
                            })}
                            className="h-4 w-4 text-cyan-600 rounded border-gray-300"
                        />
                        <Label htmlFor="includeCashEquivalents" className="cursor-pointer text-sm">
                            Include Cash Equivalents
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
                            className="h-4 w-4 text-cyan-600 rounded border-gray-300"
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
                            className="h-4 w-4 text-cyan-600 rounded border-gray-300"
                        />
                        <Label htmlFor="compareYear" className="cursor-pointer text-sm">
                            Compare with same period last year
                        </Label>
                    </div>
                    <Button
                        onClick={fetchData}
                        className="bg-cyan-600 hover:bg-cyan-700 ml-auto"
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Period Info Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 text-sm text-gray-600 border border-gray-200">
                <div className="flex flex-wrap gap-4 items-center">
                    <span>
                        <strong>Period:</strong> {formatDate(data.startDate)} to {formatDate(data.endDate)}
                    </span>
                    <span className="w-px h-4 bg-gray-300" />
                    <span>
                        <strong>Duration:</strong> {
                        Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24))
                    } days
                    </span>
                    <span className="w-px h-4 bg-gray-300" />
                    <span>
                        <strong>Fiscal Year:</strong> {filters.fiscalYear}
                    </span>
                    {showComparison && (
                        <>
                            <span className="w-px h-4 bg-gray-300" />
                            <span className="text-cyan-600">
                                <strong>Comparing with:</strong>
                                {filters.compareWithPrevious && ` Previous ${filters.periodType}`}
                                {filters.compareWithPrevious && filters.compareWithPreviousYear && ' & '}
                                {filters.compareWithPreviousYear && ' Same period last year'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Cash Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-700 font-medium">Beginning Cash</p>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.beginningCash)}</p>
                        <p className="text-xs text-blue-600 mt-1">Opening balance</p>
                    </CardContent>
                </Card>

                <Card className={`bg-gradient-to-r ${data.netCashFlow >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'}`}>
                    <CardContent className="p-4">
                        <p className={`text-sm ${data.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'} font-medium`}>
                            Net Cash Flow
                        </p>
                        <p className={`text-2xl font-bold ${data.netCashFlow >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                            {formatCurrency(data.netCashFlow)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-700 font-medium">Ending Cash</p>
                        <p className="text-2xl font-bold text-purple-900">{formatCurrency(data.endingCash)}</p>
                    </CardContent>
                </Card>

                <Card className={`bg-gradient-to-r ${data.cashChange >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-rose-50 to-rose-100 border-rose-200'}`}>
                    <CardContent className="p-4">
                        <p className={`text-sm ${data.cashChange >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-medium`}>
                            Cash Change
                        </p>
                        <p className={`text-2xl font-bold ${data.cashChange >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                            {formatCurrency(data.cashChange)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-indigo-700 font-medium">Free Cash Flow</p>
                        <p className={`text-2xl font-bold ${data.freeCashFlow && data.freeCashFlow >= 0 ? 'text-indigo-900' : 'text-red-900'}`}>
                            {formatCurrency(data.freeCashFlow || 0)}
                        </p>
                        <p className="text-xs text-indigo-600 mt-1">Operating + Investing</p>
                    </CardContent>
                </Card>
            </div>

            {/* Cash Flow Sections */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-cyan-600" />
                            Cash Flow Activities
                            <Badge className="ml-2 bg-cyan-100 text-cyan-700">
                                {data.operatingActivities.items.length +
                                    data.investingActivities.items.length +
                                    data.financingActivities.items.length} transactions
                            </Badge>
                        </h3>
                    </div>

                    {renderSection(
                        'Operating Activities',
                        data.operatingActivities.items,
                        data.operatingActivities.total,
                        <Clock className="h-4 w-4 text-blue-500" />,
                        'bg-blue-500',
                        showComparison,
                        data.operatingActivities.previousTotal,
                        data.operatingActivities.change,
                        data.operatingActivities.changePercentage
                    )}

                    {renderSection(
                        'Investing Activities',
                        data.investingActivities.items,
                        data.investingActivities.total,
                        <ArrowUpRight className="h-4 w-4 text-purple-500" />,
                        'bg-purple-500',
                        showComparison,
                        data.investingActivities.previousTotal,
                        data.investingActivities.change,
                        data.investingActivities.changePercentage
                    )}

                    {renderSection(
                        'Financing Activities',
                        data.financingActivities.items,
                        data.financingActivities.total,
                        <ArrowDownRight className="h-4 w-4 text-orange-500" />,
                        'bg-orange-500',
                        showComparison,
                        data.financingActivities.previousTotal,
                        data.financingActivities.change,
                        data.financingActivities.changePercentage
                    )}

                    {/* Net Cash Flow Summary */}
                    <div className="mt-6 pt-6 border-t-2 border-gray-300">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-gray-500">Operating</p>
                                <p className={`text-lg font-bold ${data.operatingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(data.operatingActivities.total)}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-gray-500">Investing</p>
                                <p className={`text-lg font-bold ${data.investingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(data.investingActivities.total)}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <p className="text-xs text-gray-500">Financing</p>
                                <p className={`text-lg font-bold ${data.financingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(data.financingActivities.total)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Final Net Cash Flow */}
                    <div className={`mt-4 p-4 bg-gradient-to-r ${data.netCashFlow >= 0 ? 'from-green-50 to-emerald-50' : 'from-red-50 to-rose-50'} rounded-lg border-2 ${data.netCashFlow >= 0 ? 'border-green-300' : 'border-red-300'} flex justify-between items-center`}>
                        <div>
                            <span className={`font-bold text-lg ${data.netCashFlow >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                                Net Cash Flow
                            </span>
                            {data.freeCashFlow !== undefined && (
                                <p className="text-xs text-gray-500">
                                    Free Cash Flow: {formatCurrency(data.freeCashFlow)}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <span className={`text-2xl font-bold ${data.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatCurrency(data.netCashFlow)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cash Flow Ratios */}
            <Card className="border-cyan-200 bg-cyan-50">
                <CardContent className="p-4">
                    <h4 className="font-semibold text-cyan-800 mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Cash Flow Ratios
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-cyan-700">Operating Cash Flow Ratio</p>
                            <p className="text-lg font-bold text-cyan-900">
                                {data.cashFlowRatios.operatingCashFlowRatio.toFixed(2)}
                            </p>
                            <p className="text-xs text-cyan-600">Operating CF / Current Liabilities</p>
                        </div>
                        <div>
                            <p className="text-sm text-cyan-700">Cash Flow Margin</p>
                            <p className="text-lg font-bold text-cyan-900">
                                {data.cashFlowRatios.cashFlowMargin.toFixed(2)}
                            </p>
                            <p className="text-xs text-cyan-600">Net CF / Revenue</p>
                        </div>
                        <div>
                            <p className="text-sm text-cyan-700">Cash Flow Coverage</p>
                            <p className="text-lg font-bold text-cyan-900">
                                {data.cashFlowRatios.cashFlowCoverage.toFixed(2)}
                            </p>
                            <p className="text-xs text-cyan-600">Operating CF / Total Debt</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-cyan-600" />
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
                            className="bg-cyan-600 hover:bg-cyan-700"
                            onClick={() => handleExport(data)}
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

export default CashFlow;