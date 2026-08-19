// src/pages/finance/reports/BalanceSheet.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Scale, RefreshCw, Download, Printer, Calendar,
    DollarSign, TrendingUp, TrendingDown, Building2,
    FileText, ChevronLeft, ChevronRight, Filter,
    Eye, PieChart, BarChart3, AlertCircle, CheckCircle,
    ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { getAccounts, getJournalEntries } from '@/modules/finance/services/finance.api';
import { ReportService } from '@/modules/finance/services/report.service';
import { ExportService,  type ExportOptions   } from '@/modules/finance/services/export.service';
import { BalanceSheetReport } from '@/modules/finance/services/report/balanceSheet.report';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useReportExport } from '@/shared/hooks/useReportExport';
import { Progress } from '@/shared/components/ui/progress';
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
}

interface JournalLine {
    accountId: string;
    amount: number;
    direction: 'Debit' | 'Credit';
}

interface BalanceSheetItem {
    id: string;
    code: string;
    name: string;
    amount: number;
    percentage: number;
    previousAmount?: number;
    change?: number;
    changePercentage?: number;
    isTotal?: boolean;
}

interface BalanceSheetData {
    asOfDate: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    periodStart: string;
    periodEnd: string;
    assets: {
        currentAssets: BalanceSheetItem[];
        fixedAssets: BalanceSheetItem[];
        otherAssets: BalanceSheetItem[];
        totalCurrentAssets: number;
        totalFixedAssets: number;
        totalOtherAssets: number;
        totalAssets: number;
    };
    liabilities: {
        currentLiabilities: BalanceSheetItem[];
        longTermLiabilities: BalanceSheetItem[];
        otherLiabilities: BalanceSheetItem[];
        totalCurrentLiabilities: number;
        totalLongTermLiabilities: number;
        totalOtherLiabilities: number;
        totalLiabilities: number;
    };
    equity: {
        equityItems: BalanceSheetItem[];
        totalEquity: number;
    };
    totalLiabilitiesAndEquity: number;
    ratios: {
        currentRatio: number;
        quickRatio: number;
        debtToEquityRatio: number;
        workingCapital: number;
        equityRatio: number;
        debtRatio: number;
    };
}

interface ComparisonData {
    previousPeriod: BalanceSheetData | null;
    previousYear: BalanceSheetData | null;
}

interface PeriodFilters {
    asOfDate: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    fiscalYear: string;
    fiscalYearStart: string;
    compareWithPrevious: boolean;
    compareWithPreviousYear: boolean;
    customStartDate?: string;
    customEndDate?: string;
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
        fiscalYearStart: new Date(parseInt(filters.fiscalYear), 0, 1).toISOString().split('T')[0],
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

// ============== Main Component ==============
const BalanceSheet: React.FC = () => {
    // State
    const [data, setData] = useState<BalanceSheetData | null>(null);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filters, setFilters] = useState<PeriodFilters>({
        asOfDate: new Date().toISOString().split('T')[0],
        periodType: 'month',
        fiscalYear: new Date().getFullYear().toString(),
        fiscalYearStart: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        compareWithPrevious: false,
        compareWithPreviousYear: false,
        customStartDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        customEndDate: new Date().toISOString().split('T')[0],
    });

    const [activeView, setActiveView] = useState<'standard' | 'comparison' | 'trend'>('standard');
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
    } = useReportExport('balance-sheet');

    // ============== Data Fetching ==============
    const calculateBalances = useCallback((
        accounts: Account[],
        journals: JournalEntry[],
        periodStart: string,
        periodEnd: string
    ) => {
        const accountBalances = new Map<string, number>();

        // Initialize with opening balances
        accounts.forEach((acc: Account) => {
            accountBalances.set(acc.id, acc.openingBalance || 0);
        });

        // Process journal entries within the period
        journals.forEach((journal: JournalEntry) => {
            if (journal.isPosted && journal.lines) {
                const journalDate = new Date(journal.date);
                const startDate = new Date(periodStart);
                const endDate = new Date(periodEnd);

                // Only include entries within the period
                if (journalDate >= startDate && journalDate <= endDate) {
                    journal.lines.forEach((line: JournalLine) => {
                        const currentBalance = accountBalances.get(line.accountId) || 0;
                        if (line.direction === 'Debit') {
                            accountBalances.set(line.accountId, currentBalance + line.amount);
                        } else {
                            accountBalances.set(line.accountId, currentBalance - line.amount);
                        }
                    });
                }
            }
        });

        return accountBalances;
    }, []);

    const buildBalanceSheet = useCallback((
        accounts: Account[],
        accountBalances: Map<string, number>,
        asOfDate: string,
        periodType: 'month' | 'quarter' | 'year' | 'custom',
        periodStart: string,
        periodEnd: string
    ): BalanceSheetData => {
        const assets: BalanceSheetItem[] = [];
        const liabilities: BalanceSheetItem[] = [];
        const equity: BalanceSheetItem[] = [];

        // In the buildBalanceSheet function, update the classification logic:

        // Alternative: Use code-based classification
        accounts.forEach((acc: Account) => {
            const balance = accountBalances.get(acc.id) || 0;
            if (Math.abs(balance) < 0.01) return;

            const item: BalanceSheetItem = {
                id: acc.id,
                code: acc.code,
                name: acc.name,
                amount: balance,
                percentage: 0,
            };

            const code = acc.code || '';

            if (code.startsWith('1')) {
                assets.push(item);
            } else if (code.startsWith('2')) {
                liabilities.push(item);
            } else if (code.startsWith('3')) {
                equity.push(item);
            } else {
                // Fallback to accountType
                const accountType = (acc.accountType || '').toLowerCase();
                if (accountType.includes('asset')) {
                    assets.push(item);
                } else if (accountType.includes('liability')) {
                    liabilities.push(item);
                } else if (accountType.includes('equity')) {
                    equity.push(item);
                }
            }
        });


        // Calculate totals
        const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
        const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
        const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);








        // Calculate percentages
        assets.forEach(item => {
            item.percentage = totalAssets > 0 ? (item.amount / totalAssets) * 100 : 0;
        });
        liabilities.forEach(item => {
            item.percentage = totalLiabilities > 0 ? (item.amount / totalLiabilities) * 100 : 0;
        });
        equity.forEach(item => {
            item.percentage = totalEquity > 0 ? (item.amount / totalEquity) * 100 : 0;
        });

        // Organize by sub-type using account subType or code patterns
        const currentAssets = assets.filter(a =>
            a.code.startsWith('11') || a.code.startsWith('12') || a.code.startsWith('13')
        );
        const fixedAssets = assets.filter(a =>
            a.code.startsWith('14') || a.code.startsWith('15') || a.code.startsWith('16')
        );
        const otherAssets = assets.filter(a =>
            !a.code.startsWith('11') && !a.code.startsWith('12') && !a.code.startsWith('13') &&
            !a.code.startsWith('14') && !a.code.startsWith('15') && !a.code.startsWith('16')
        );

        const currentLiabilities = liabilities.filter(l =>
            l.code.startsWith('21') || l.code.startsWith('22')
        );
        const longTermLiabilities = liabilities.filter(l =>
            l.code.startsWith('23') || l.code.startsWith('24')
        );
        const otherLiabilities = liabilities.filter(l =>
            !l.code.startsWith('21') && !l.code.startsWith('22') &&
            !l.code.startsWith('23') && !l.code.startsWith('24')
        );

        const totalCurrentAssets = currentAssets.reduce((sum, item) => sum + item.amount, 0);
        const totalFixedAssets = fixedAssets.reduce((sum, item) => sum + item.amount, 0);
        const totalOtherAssets = otherAssets.reduce((sum, item) => sum + item.amount, 0);

        const totalCurrentLiabilities = currentLiabilities.reduce((sum, item) => sum + item.amount, 0);
        const totalLongTermLiabilities = longTermLiabilities.reduce((sum, item) => sum + item.amount, 0);
        const totalOtherLiabilities = otherLiabilities.reduce((sum, item) => sum + item.amount, 0);

        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

        // Calculate ratios
        const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0;
        // Quick ratio: subtract inventory (code starting with 12) from current assets
        const inventoryAmount = currentAssets
            .filter(a => a.code.startsWith('12'))
            .reduce((sum, item) => sum + item.amount, 0);
        const quickRatio = totalCurrentLiabilities > 0
            ? (totalCurrentAssets - inventoryAmount) / totalCurrentLiabilities
            : 0;
        const debtToEquityRatio = totalEquity > 0 ? totalLiabilities / totalEquity : 0;
        const workingCapital = totalCurrentAssets - totalCurrentLiabilities;
        const equityRatio = totalAssets > 0 ? totalEquity / totalAssets : 0;
        const debtRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;

        return {
            asOfDate,
            periodType,
            periodStart,
            periodEnd,
            assets: {
                currentAssets,
                fixedAssets,
                otherAssets,
                totalCurrentAssets,
                totalFixedAssets,
                totalOtherAssets,
                totalAssets,
            },
            liabilities: {
                currentLiabilities,
                longTermLiabilities,
                otherLiabilities,
                totalCurrentLiabilities,
                totalLongTermLiabilities,
                totalOtherLiabilities,
                totalLiabilities,
            },
            equity: {
                equityItems: equity,
                totalEquity: totalEquity,
            },
            totalLiabilitiesAndEquity,
            ratios: {
                currentRatio,
                quickRatio,
                debtToEquityRatio,
                workingCapital,
                equityRatio,
                debtRatio,
            },
        };
    }, []);

    const mergeComparisonData = useCallback((
        currentData: BalanceSheetData,
        previousData: BalanceSheetData | null,
        previousYearData: BalanceSheetData | null
    ): BalanceSheetData => {
        if (!previousData && !previousYearData) return currentData;

        const mergedData = { ...currentData };

        // Helper to merge items with comparison
        const mergeItems = (
            currentItems: BalanceSheetItem[],
            previousItems: BalanceSheetItem[] | undefined
        ): BalanceSheetItem[] => {
            if (!previousItems) return currentItems;

            return currentItems.map(item => {
                const prevItem = previousItems.find(p => p.id === item.id);
                if (prevItem) {
                    const change = item.amount - prevItem.amount;
                    const changePercentage = prevItem.amount !== 0
                        ? (change / Math.abs(prevItem.amount)) * 100
                        : 0;
                    return {
                        ...item,
                        previousAmount: prevItem.amount,
                        change,
                        changePercentage,
                    };
                }
                return item;
            });
        };

        // Merge assets
        mergedData.assets.currentAssets = mergeItems(
            currentData.assets.currentAssets,
            previousData?.assets.currentAssets
        );
        mergedData.assets.fixedAssets = mergeItems(
            currentData.assets.fixedAssets,
            previousData?.assets.fixedAssets
        );
        mergedData.assets.otherAssets = mergeItems(
            currentData.assets.otherAssets,
            previousData?.assets.otherAssets
        );

        // Merge liabilities
        mergedData.liabilities.currentLiabilities = mergeItems(
            currentData.liabilities.currentLiabilities,
            previousData?.liabilities.currentLiabilities
        );
        mergedData.liabilities.longTermLiabilities = mergeItems(
            currentData.liabilities.longTermLiabilities,
            previousData?.liabilities.longTermLiabilities
        );
        mergedData.liabilities.otherLiabilities = mergeItems(
            currentData.liabilities.otherLiabilities,
            previousData?.liabilities.otherLiabilities
        );

        // Merge equity
        mergedData.equity.equityItems = mergeItems(
            currentData.equity.equityItems,
            previousData?.equity.equityItems
        );

        return mergedData;
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const { periodStart, periodEnd, fiscalYearStart } = getPeriodDates(filters);

            // Fetch accounts and journals for current period
            const [accountsRes, journalRes] = await Promise.all([
                getAccounts(),
                getJournalEntries({
                    fromDate: fiscalYearStart, // Start from fiscal year beginning for cumulative balances
                    toDate: periodEnd
                }),
            ]);

            const accounts = accountsRes.data.data || accountsRes.data || [];
            const journals = journalRes.data.data || journalRes.data || [];

            // Calculate balances for current period
            const accountBalances = calculateBalances(
                accounts,
                journals,
                fiscalYearStart,
                periodEnd
            );

            // Build current balance sheet
            const currentData = buildBalanceSheet(
                accounts,
                accountBalances,
                filters.asOfDate,
                filters.periodType,
                periodStart,
                periodEnd
            );

            let previousData: BalanceSheetData | null = null;
            let previousYearData: BalanceSheetData | null = null;

            // Fetch comparison data if needed
            if (filters.compareWithPrevious || filters.compareWithPreviousYear) {
                const comparisonPromises: Promise<any>[] = [];

                if (filters.compareWithPrevious) {
                    const { previousStart, previousEnd } = getPreviousPeriodDates(filters);
                    comparisonPromises.push(
                        getJournalEntries({
                            fromDate: fiscalYearStart,
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
                    const prevBalances = calculateBalances(
                        accounts,
                        prevJournals,
                        fiscalYearStart,
                        getPreviousPeriodDates(filters).previousEnd
                    );
                    const { previousStart, previousEnd } = getPreviousPeriodDates(filters);
                    previousData = buildBalanceSheet(
                        accounts,
                        prevBalances,
                        previousEnd,
                        filters.periodType,
                        previousStart,
                        previousEnd
                    );
                    resultIndex++;
                }

                if (filters.compareWithPreviousYear) {
                    const prevYearJournals = comparisonResults[resultIndex].data.data || comparisonResults[resultIndex].data || [];
                    const { previousYearStart, previousYearEnd } = getPreviousYearDates(filters);
                    const prevYearBalances = calculateBalances(
                        accounts,
                        prevYearJournals,
                        previousYearStart,
                        previousYearEnd
                    );
                    previousYearData = buildBalanceSheet(
                        accounts,
                        prevYearBalances,
                        previousYearEnd,
                        'year',
                        previousYearStart,
                        previousYearEnd
                    );
                }
            }

            // Merge comparison data
            const mergedData = mergeComparisonData(currentData, previousData, previousYearData);
            setData(mergedData);
            setComparisonData({ previousPeriod: previousData, previousYear: previousYearData });

        } catch (error) {
            console.error('Error fetching balance sheet:', error);
            showToast.error('Failed to load balance sheet');
        } finally {
            setLoading(false);
        }
    }, [filters, calculateBalances, buildBalanceSheet, mergeComparisonData]);

    // ============== Effects ==============
    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // ============== Print Functions ==============



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
        items: BalanceSheetItem[],
        total: number,
        color: string,
        showComparison: boolean = false
    ) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-4">
                <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-700">{title}</span>
                    <div className="flex items-center gap-6">
                        <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
                        {showComparison && (
                            <span className="text-xs text-gray-400 w-24 text-right">Change</span>
                        )}
                    </div>
                </div>
                {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-1.5 px-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-mono">{item.code}</span>
                            <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(item.amount)}
                                </span>
                                <span className="text-xs text-gray-400 w-12 text-right">
                                    {item.percentage.toFixed(1)}%
                                </span>
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                                    <div
                                        className={`h-1.5 rounded-full ${color}`}
                                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                                    />
                                </div>
                            </div>
                            {showComparison && item.change !== undefined && (
                                <div className="flex items-center gap-1 w-24">
                                    <span className={`text-xs font-medium ${getChangeColor(item.change)}`}>
                                        {getChangeIcon(item.change)}
                                        {item.change !== 0 && formatCurrency(item.change)}
                                    </span>
                                    {item.changePercentage !== undefined && item.changePercentage !== 0 && (
                                        <span className={`text-xs ${getChangeColor(item.change)}`}>
                                            ({item.changePercentage > 0 ? '+' : ''}
                                            {item.changePercentage.toFixed(1)}%)
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

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
                <p className="text-gray-500">Run the report to see the balance sheet</p>
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
                        <Scale className="w-6 h-6 text-indigo-600"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
                        <p className="text-sm text-gray-500">
                            {filters.periodType === 'custom' ? (
                                <>From {formatDate(data.periodStart)} to {formatDate(data.periodEnd)}</>
                            ) : (
                                <>As of {formatDate(data.asOfDate)}</>
                            )}
                            {filters.periodType !== 'custom' && (
                                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                                    {filters.periodType.charAt(0).toUpperCase() + filters.periodType.slice(1)}
                                </span>
                            )}
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
                                setFilters({...filters, periodType: value});
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

                {/* Comparison Options */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-6">
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

            {/* Ratios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-700 font-medium">Current Ratio</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {data.ratios.currentRatio.toFixed(2)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Current Assets / Current Liabilities
                        </p>
                        <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{width: `${Math.min(100, data.ratios.currentRatio * 50)}%`}}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-700 font-medium">Quick Ratio</p>
                        <p className="text-2xl font-bold text-green-900">
                            {data.ratios.quickRatio.toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            Quick Assets / Current Liabilities
                        </p>
                        <div className="mt-2 w-full bg-green-200 rounded-full h-1.5">
                            <div
                                className="bg-green-600 h-1.5 rounded-full"
                                style={{width: `${Math.min(100, data.ratios.quickRatio * 50)}%`}}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-700 font-medium">Debt to Equity</p>
                        <p className="text-2xl font-bold text-yellow-900">
                            {data.ratios.debtToEquityRatio.toFixed(2)}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                            Total Liabilities / Total Equity
                        </p>
                        <div className="mt-2 w-full bg-yellow-200 rounded-full h-1.5">
                            <div
                                className="bg-yellow-600 h-1.5 rounded-full"
                                style={{width: `${Math.min(100, data.ratios.debtToEquityRatio * 20)}%`}}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-700 font-medium">Working Capital</p>
                        <p className="text-2xl font-bold text-purple-900">
                            {formatCurrency(data.ratios.workingCapital)}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                            Current Assets - Current Liabilities
                        </p>
                        <div className="mt-2 flex gap-2 text-xs">
                            <span className="text-purple-600">
                                Equity Ratio: {(data.ratios.equityRatio * 100).toFixed(1)}%
                            </span>
                            <span className="w-px h-3 bg-purple-300"/>
                            <span className="text-purple-600">
                                Debt Ratio: {(data.ratios.debtRatio * 100).toFixed(1)}%
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Balance Sheet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets */}
                <Card className="border-blue-200">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                            <Building2 className="h-5 w-5"/>
                            Assets
                            <Badge className="ml-2 bg-blue-100 text-blue-700">
                                {data.assets.currentAssets.length + data.assets.fixedAssets.length + data.assets.otherAssets.length} accounts
                            </Badge>
                        </h3>

                        {renderSection(
                            'Current Assets',
                            data.assets.currentAssets,
                            data.assets.totalCurrentAssets,
                            'bg-blue-500',
                            showComparison
                        )}
                        {renderSection(
                            'Fixed Assets',
                            data.assets.fixedAssets,
                            data.assets.totalFixedAssets,
                            'bg-indigo-500',
                            showComparison
                        )}
                        {renderSection(
                            'Other Assets',
                            data.assets.otherAssets,
                            data.assets.totalOtherAssets,
                            'bg-cyan-500',
                            showComparison
                        )}

                        <div
                            className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between items-center font-bold text-lg">
                            <span className="text-gray-900">Total Assets</span>
                            <div className="flex items-center gap-6">
                                <span className="text-blue-700">{formatCurrency(data.assets.totalAssets)}</span>
                                {showComparison && comparisonData?.previousPeriod && (
                                    <span className="text-xs text-gray-400 w-24 text-right">
                                        {formatCurrency(
                                            data.assets.totalAssets - comparisonData.previousPeriod.assets.totalAssets
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Liabilities & Equity */}
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5"/>
                            Liabilities & Equity
                            <Badge className="ml-2 bg-red-100 text-red-700">
                                {data.liabilities.currentLiabilities.length +
                                    data.liabilities.longTermLiabilities.length +
                                    data.liabilities.otherLiabilities.length +
                                    data.equity.equityItems.length} accounts
                            </Badge>
                        </h3>

                        <div className="mb-4">
                            <h4 className="font-medium text-red-700 mb-2">Liabilities</h4>
                            {renderSection(
                                'Current Liabilities',
                                data.liabilities.currentLiabilities,
                                data.liabilities.totalCurrentLiabilities,
                                'bg-red-500',
                                showComparison
                            )}
                            {renderSection(
                                'Long-Term Liabilities',
                                data.liabilities.longTermLiabilities,
                                data.liabilities.totalLongTermLiabilities,
                                'bg-orange-500',
                                showComparison
                            )}
                            {renderSection(
                                'Other Liabilities',
                                data.liabilities.otherLiabilities,
                                data.liabilities.totalOtherLiabilities,
                                'bg-rose-500',
                                showComparison
                            )}

                            <div
                                className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between items-center font-bold text-lg">
                                <span className="text-gray-900">Total Liabilities</span>
                                <div className="flex items-center gap-6">
                                    <span
                                        className="text-red-700">{formatCurrency(data.liabilities.totalLiabilities)}</span>
                                    {showComparison && comparisonData?.previousPeriod && (
                                        <span className="text-xs text-gray-400 w-24 text-right">
                                            {formatCurrency(
                                                data.liabilities.totalLiabilities - comparisonData.previousPeriod.liabilities.totalLiabilities
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t-2 border-gray-200">
                            <h4 className="font-medium text-green-700 mb-2">Equity</h4>
                            {renderSection(
                                'Equity',
                                data.equity.equityItems,
                                data.equity.totalEquity,
                                'bg-green-500',
                                showComparison
                            )}

                            <div
                                className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between items-center font-bold text-lg">
                                <span className="text-gray-900">Total Equity</span>
                                <div className="flex items-center gap-6">
                                    <span className="text-green-700">{formatCurrency(data.equity.totalEquity)}</span>
                                    {showComparison && comparisonData?.previousPeriod && (
                                        <span className="text-xs text-gray-400 w-24 text-right">
                                            {formatCurrency(
                                                data.equity.totalEquity - comparisonData.previousPeriod.equity.totalEquity
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div
                            className="mt-6 pt-6 border-t-2 border-indigo-300 flex justify-between items-center font-bold text-xl">
                            <span className="text-gray-900">Total Liabilities & Equity</span>
                            <div className="flex items-center gap-6">
                                <span
                                    className="text-indigo-700">{formatCurrency(data.totalLiabilitiesAndEquity)}</span>
                                {showComparison && comparisonData?.previousPeriod && (
                                    <span className="text-xs text-gray-400 w-24 text-right">
                                        {formatCurrency(
                                            data.totalLiabilitiesAndEquity - comparisonData.previousPeriod.totalLiabilitiesAndEquity
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Balance Sheet Verification */}
            <Card
                className={`border-2 ${Math.abs(data.assets.totalAssets - data.totalLiabilitiesAndEquity) < 0.01 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        {Math.abs(data.assets.totalAssets - data.totalLiabilitiesAndEquity) < 0.01 ? (
                            <CheckCircle className="h-6 w-6 text-green-600"/>
                        ) : (
                            <AlertCircle className="h-6 w-6 text-red-600"/>
                        )}
                        <div>
                            <p className={`font-semibold ${Math.abs(data.assets.totalAssets - data.totalLiabilitiesAndEquity) < 0.01 ? 'text-green-700' : 'text-red-700'}`}>
                                {Math.abs(data.assets.totalAssets - data.totalLiabilitiesAndEquity) < 0.01
                                    ? '✓ Balance Sheet Balanced'
                                    : '✗ Balance Sheet Out of Balance'}
                            </p>
                            <p className="text-sm text-gray-600">
                                Assets: {formatCurrency(data.assets.totalAssets)} =
                                Liabilities: {formatCurrency(data.liabilities.totalLiabilities)} +
                                Equity: {formatCurrency(data.equity.totalEquity)}
                                {Math.abs(data.assets.totalAssets - data.totalLiabilitiesAndEquity) >= 0.01 && (
                                    <span className="text-red-600 ml-2">
                                        (Difference: {formatCurrency(Math.abs(data.assets.totalAssets - data.totalLiabilitiesAndEquity))})
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comparison Summary (if enabled) */}
            {showComparison && comparisonData?.previousPeriod && (
                <Card className="border-indigo-200 bg-indigo-50">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-indigo-800 mb-2">Period Comparison Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Total Assets Change</p>
                                <p className={`font-bold ${getChangeColor(data.assets.totalAssets - comparisonData.previousPeriod.assets.totalAssets)}`}>
                                    {formatCurrency(data.assets.totalAssets - comparisonData.previousPeriod.assets.totalAssets)}
                                    <span className="ml-1">
                                        ({((data.assets.totalAssets - comparisonData.previousPeriod.assets.totalAssets) / comparisonData.previousPeriod.assets.totalAssets * 100).toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Total Liabilities Change</p>
                                <p className={`font-bold ${getChangeColor(data.liabilities.totalLiabilities - comparisonData.previousPeriod.liabilities.totalLiabilities)}`}>
                                    {formatCurrency(data.liabilities.totalLiabilities - comparisonData.previousPeriod.liabilities.totalLiabilities)}
                                    <span className="ml-1">
                                        ({((data.liabilities.totalLiabilities - comparisonData.previousPeriod.liabilities.totalLiabilities) / comparisonData.previousPeriod.liabilities.totalLiabilities * 100).toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Total Equity Change</p>
                                <p className={`font-bold ${getChangeColor(data.equity.totalEquity - comparisonData.previousPeriod.equity.totalEquity)}`}>
                                    {formatCurrency(data.equity.totalEquity - comparisonData.previousPeriod.equity.totalEquity)}
                                    <span className="ml-1">
                                        ({((data.equity.totalEquity - comparisonData.previousPeriod.equity.totalEquity) / comparisonData.previousPeriod.equity.totalEquity * 100).toFixed(1)}%)
                                    </span>
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

export default BalanceSheet;