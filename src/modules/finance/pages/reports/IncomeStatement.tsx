// src/pages/finance/reports/IncomeStatement.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, RefreshCw, Download, Printer, Calendar,
    DollarSign, TrendingDown, BarChart3, FileText,
    ChevronLeft, ChevronRight, Filter, Eye,
    PieChart, AlertCircle, CheckCircle, Percent,
    ArrowUp, ArrowDown, Minus, Building2, Coffee,
    ShoppingBag, Package, Users, Settings, CreditCard,
    Gift, Home, Briefcase, Banknote, Landmark, Shield
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

interface IncomeItem {
    id: string;
    code: string;
    name: string;
    amount: number;
    percentage: number;
    previousAmount?: number;
    change?: number;
    changePercentage?: number;
    category?: string;
    icon?: React.ReactNode;
}

interface IncomeStatementData {
    startDate: string;
    endDate: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    revenue: {
        items: IncomeItem[];
        total: number;
        percentage: number;
        previousTotal?: number;
        change?: number;
        changePercentage?: number;
    };
    costOfGoodsSold: {
        items: IncomeItem[];
        total: number;
        percentage: number;
        previousTotal?: number;
        change?: number;
        changePercentage?: number;
    };
    grossProfit: number;
    grossMargin: number;
    previousGrossProfit?: number;
    grossProfitChange?: number;
    grossProfitChangePercentage?: number;
    operatingExpenses: {
        items: IncomeItem[];
        total: number;
        percentage: number;
        previousTotal?: number;
        change?: number;
        changePercentage?: number;
    };
    operatingIncome: number;
    operatingMargin: number;
    previousOperatingIncome?: number;
    operatingIncomeChange?: number;
    operatingIncomeChangePercentage?: number;
    otherIncome: {
        items: IncomeItem[];
        total: number;
        percentage: number;
        previousTotal?: number;
        change?: number;
        changePercentage?: number;
    };
    otherExpenses: {
        items: IncomeItem[];
        total: number;
        percentage: number;
        previousTotal?: number;
        change?: number;
        changePercentage?: number;
    };
    netIncome: number;
    netMargin: number;
    previousNetIncome?: number;
    netIncomeChange?: number;
    netIncomeChangePercentage?: number;
    ebitda: number;
    ebitdaMargin: number;
    previousEbitda?: number;
    ebitdaChange?: number;
    ebitdaChangePercentage?: number;
    taxExpense?: number;
    interestExpense?: number;
    depreciationAmortization?: number;
}

interface ComparisonData {
    previousPeriod: IncomeStatementData | null;
    previousYear: IncomeStatementData | null;
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

const getRevenueIcon = (name: string, code: string): React.ReactNode => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('sales') || lowerName.includes('product')) return <ShoppingBag className="h-4 w-4" />;
    if (lowerName.includes('service')) return <Briefcase className="h-4 w-4" />;
    if (lowerName.includes('interest')) return <Banknote className="h-4 w-4" />;
    if (lowerName.includes('rent')) return <Home className="h-4 w-4" />;
    if (lowerName.includes('commission')) return <Gift className="h-4 w-4" />;
    if (lowerName.includes('consulting')) return <Users className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
};

const getExpenseIcon = (name: string, code: string): React.ReactNode => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('salary') || lowerName.includes('wage')) return <Users className="h-4 w-4" />;
    if (lowerName.includes('rent')) return <Home className="h-4 w-4" />;
    if (lowerName.includes('utility')) return <Settings className="h-4 w-4" />;
    if (lowerName.includes('supplies')) return <Package className="h-4 w-4" />;
    if (lowerName.includes('marketing') || lowerName.includes('advertising')) return <TrendingUp className="h-4 w-4" />;
    if (lowerName.includes('insurance')) return <Shield className="h-4 w-4" />;
    if (lowerName.includes('travel')) return <Coffee className="h-4 w-4" />;
    if (lowerName.includes('depreciation') || lowerName.includes('amortization')) return <Landmark className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
};

// ============== Main Component ==============
const IncomeStatement: React.FC = () => {
    // State
    const [data, setData] = useState<IncomeStatementData | null>(null);
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
    });

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
    } = useReportExport('income-statement');

    // ============== Data Fetching ==============
    const calculateBalances = useCallback((
        accounts: Account[],
        journals: JournalEntry[],
        periodStart: string,
        periodEnd: string
    ) => {
        const accountBalances = new Map<string, number>();

        // Initialize with zero (income statement accounts don't use opening balances)
        accounts.forEach((acc: Account) => {
            accountBalances.set(acc.id, 0);
        });

        // Process journal entries within the period
        journals.forEach((journal: JournalEntry) => {
            if (journal.isPosted && journal.lines) {
                const journalDate = new Date(journal.date || journal.entryDate);
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

    const buildIncomeStatement = useCallback((
        accounts: Account[],
        accountBalances: Map<string, number>,
        startDate: string,
        endDate: string,
        periodType: 'month' | 'quarter' | 'year' | 'custom'
    ): IncomeStatementData => {
        const revenueItems: IncomeItem[] = [];
        const cogsItems: IncomeItem[] = [];
        const operatingExpenseItems: IncomeItem[] = [];
        const otherIncomeItems: IncomeItem[] = [];
        const otherExpenseItems: IncomeItem[] = [];

        let depreciationAmortization = 0;
        let interestExpense = 0;
        let taxExpense = 0;

        accounts.forEach((acc: Account) => {
            const balance = accountBalances.get(acc.id) || 0;
            if (Math.abs(balance) < 0.01) return;

            const amount = Math.abs(balance);
            const item: IncomeItem = {
                id: acc.id,
                code: acc.code,
                name: acc.name,
                amount: amount,
                percentage: 0,
                category: acc.subType || 'Other',
                icon: acc.accountType === 'Revenue' ? getRevenueIcon(acc.name, acc.code) : getExpenseIcon(acc.name, acc.code),
            };

            // Categorize accounts
            if (acc.accountType === 'Revenue') {
                // Check if it's sales revenue (COGS related)
                if (acc.code.startsWith('41') ||
                    acc.name.toLowerCase().includes('sales') ||
                    acc.name.toLowerCase().includes('revenue')) {
                    revenueItems.push(item);
                } else {
                    otherIncomeItems.push(item);
                }
            } else if (acc.accountType === 'Expense') {
                // COGS - typically accounts starting with 51 or containing COGS in name
                if (acc.code.startsWith('51') ||
                    acc.name.toLowerCase().includes('cogs') ||
                    acc.name.toLowerCase().includes('cost of goods') ||
                    acc.name.toLowerCase().includes('cost of sales')) {
                    cogsItems.push(item);
                }
                // Operating Expenses - accounts starting with 52-58 or 6xxx
                else if (acc.code.startsWith('52') ||
                    acc.code.startsWith('53') ||
                    acc.code.startsWith('54') ||
                    acc.code.startsWith('55') ||
                    acc.code.startsWith('56') ||
                    acc.code.startsWith('57') ||
                    acc.code.startsWith('58') ||
                    acc.code.startsWith('6') ||
                    acc.name.toLowerCase().includes('operating') ||
                    acc.name.toLowerCase().includes('administrative') ||
                    acc.name.toLowerCase().includes('selling') ||
                    acc.name.toLowerCase().includes('general') ||
                    acc.name.toLowerCase().includes('salary') ||
                    acc.name.toLowerCase().includes('rent') ||
                    acc.name.toLowerCase().includes('utility') ||
                    acc.name.toLowerCase().includes('supplies') ||
                    acc.name.toLowerCase().includes('marketing') ||
                    acc.name.toLowerCase().includes('insurance') ||
                    acc.name.toLowerCase().includes('travel') ||
                    acc.name.toLowerCase().includes('maintenance') ||
                    acc.name.toLowerCase().includes('depreciation') ||
                    acc.name.toLowerCase().includes('amortization') ||
                    acc.name.toLowerCase().includes('interest') ||
                    acc.name.toLowerCase().includes('consulting') ||
                    acc.name.toLowerCase().includes('software')) {
                    operatingExpenseItems.push(item);

                    // Track specific expenses
                    if (acc.name.toLowerCase().includes('depreciation') ||
                        acc.name.toLowerCase().includes('amortization')) {
                        depreciationAmortization += amount;
                    }
                    if (acc.name.toLowerCase().includes('interest')) {
                        interestExpense += amount;
                    }
                    if (acc.name.toLowerCase().includes('tax')) {
                        taxExpense += amount;
                    }
                }
                // Other Expenses
                else {
                    otherExpenseItems.push(item);
                }
            }
        });

        // Sort items by amount (descending)
        revenueItems.sort((a, b) => b.amount - a.amount);
        cogsItems.sort((a, b) => b.amount - a.amount);
        operatingExpenseItems.sort((a, b) => b.amount - a.amount);
        otherIncomeItems.sort((a, b) => b.amount - a.amount);
        otherExpenseItems.sort((a, b) => b.amount - a.amount);

        // Calculate totals
        const totalRevenue = revenueItems.reduce((sum, item) => sum + item.amount, 0);
        const totalCogs = cogsItems.reduce((sum, item) => sum + item.amount, 0);
        const totalOperatingExpenses = operatingExpenseItems.reduce((sum, item) => sum + item.amount, 0);
        const totalOtherIncome = otherIncomeItems.reduce((sum, item) => sum + item.amount, 0);
        const totalOtherExpenses = otherExpenseItems.reduce((sum, item) => sum + item.amount, 0);

        const grossProfit = totalRevenue - totalCogs;
        const operatingIncome = grossProfit - totalOperatingExpenses;
        const netIncome = operatingIncome + totalOtherIncome - totalOtherExpenses;

        // Calculate percentages (based on total revenue)
        revenueItems.forEach(item => {
            item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
        });
        cogsItems.forEach(item => {
            item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
        });
        operatingExpenseItems.forEach(item => {
            item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
        });
        otherIncomeItems.forEach(item => {
            item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
        });
        otherExpenseItems.forEach(item => {
            item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
        });

        const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        const operatingMargin = totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0;
        const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

        // EBITDA = Operating Income + Depreciation + Amortization
        const ebitda = operatingIncome + depreciationAmortization;
        const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;

        return {
            startDate,
            endDate,
            periodType,
            revenue: {
                items: revenueItems,
                total: totalRevenue,
                percentage: 100,
            },
            costOfGoodsSold: {
                items: cogsItems,
                total: totalCogs,
                percentage: totalRevenue > 0 ? (totalCogs / totalRevenue) * 100 : 0,
            },
            grossProfit,
            grossMargin,
            operatingExpenses: {
                items: operatingExpenseItems,
                total: totalOperatingExpenses,
                percentage: totalRevenue > 0 ? (totalOperatingExpenses / totalRevenue) * 100 : 0,
            },
            operatingIncome,
            operatingMargin,
            otherIncome: {
                items: otherIncomeItems,
                total: totalOtherIncome,
                percentage: totalRevenue > 0 ? (totalOtherIncome / totalRevenue) * 100 : 0,
            },
            otherExpenses: {
                items: otherExpenseItems,
                total: totalOtherExpenses,
                percentage: totalRevenue > 0 ? (totalOtherExpenses / totalRevenue) * 100 : 0,
            },
            netIncome,
            netMargin,
            ebitda,
            ebitdaMargin,
            taxExpense,
            interestExpense,
            depreciationAmortization,
        };
    }, []);

    const mergeComparisonData = useCallback((
        currentData: IncomeStatementData,
        previousData: IncomeStatementData | null,
        previousYearData: IncomeStatementData | null
    ): IncomeStatementData => {
        if (!previousData && !previousYearData) return currentData;

        const mergedData = { ...currentData };

        // Helper to merge items with comparison
        const mergeItems = (
            currentItems: IncomeItem[],
            previousItems: IncomeItem[] | undefined
        ): IncomeItem[] => {
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

        // Merge with previous period
        if (previousData) {
            mergedData.revenue.items = mergeItems(currentData.revenue.items, previousData.revenue.items);
            mergedData.revenue.previousTotal = previousData.revenue.total;
            mergedData.revenue.change = currentData.revenue.total - previousData.revenue.total;
            mergedData.revenue.changePercentage = previousData.revenue.total !== 0
                ? (mergedData.revenue.change / Math.abs(previousData.revenue.total)) * 100
                : 0;

            mergedData.costOfGoodsSold.items = mergeItems(currentData.costOfGoodsSold.items, previousData.costOfGoodsSold.items);
            mergedData.costOfGoodsSold.previousTotal = previousData.costOfGoodsSold.total;
            mergedData.costOfGoodsSold.change = currentData.costOfGoodsSold.total - previousData.costOfGoodsSold.total;
            mergedData.costOfGoodsSold.changePercentage = previousData.costOfGoodsSold.total !== 0
                ? (mergedData.costOfGoodsSold.change / Math.abs(previousData.costOfGoodsSold.total)) * 100
                : 0;

            mergedData.operatingExpenses.items = mergeItems(currentData.operatingExpenses.items, previousData.operatingExpenses.items);
            mergedData.operatingExpenses.previousTotal = previousData.operatingExpenses.total;
            mergedData.operatingExpenses.change = currentData.operatingExpenses.total - previousData.operatingExpenses.total;
            mergedData.operatingExpenses.changePercentage = previousData.operatingExpenses.total !== 0
                ? (mergedData.operatingExpenses.change / Math.abs(previousData.operatingExpenses.total)) * 100
                : 0;

            mergedData.otherIncome.items = mergeItems(currentData.otherIncome.items, previousData.otherIncome.items);
            mergedData.otherIncome.previousTotal = previousData.otherIncome.total;
            mergedData.otherIncome.change = currentData.otherIncome.total - previousData.otherIncome.total;
            mergedData.otherIncome.changePercentage = previousData.otherIncome.total !== 0
                ? (mergedData.otherIncome.change / Math.abs(previousData.otherIncome.total)) * 100
                : 0;

            mergedData.otherExpenses.items = mergeItems(currentData.otherExpenses.items, previousData.otherExpenses.items);
            mergedData.otherExpenses.previousTotal = previousData.otherExpenses.total;
            mergedData.otherExpenses.change = currentData.otherExpenses.total - previousData.otherExpenses.total;
            mergedData.otherExpenses.changePercentage = previousData.otherExpenses.total !== 0
                ? (mergedData.otherExpenses.change / Math.abs(previousData.otherExpenses.total)) * 100
                : 0;

            mergedData.previousGrossProfit = previousData.grossProfit;
            mergedData.grossProfitChange = currentData.grossProfit - previousData.grossProfit;
            mergedData.grossProfitChangePercentage = previousData.grossProfit !== 0
                ? (mergedData.grossProfitChange / Math.abs(previousData.grossProfit)) * 100
                : 0;

            mergedData.previousOperatingIncome = previousData.operatingIncome;
            mergedData.operatingIncomeChange = currentData.operatingIncome - previousData.operatingIncome;
            mergedData.operatingIncomeChangePercentage = previousData.operatingIncome !== 0
                ? (mergedData.operatingIncomeChange / Math.abs(previousData.operatingIncome)) * 100
                : 0;

            mergedData.previousNetIncome = previousData.netIncome;
            mergedData.netIncomeChange = currentData.netIncome - previousData.netIncome;
            mergedData.netIncomeChangePercentage = previousData.netIncome !== 0
                ? (mergedData.netIncomeChange / Math.abs(previousData.netIncome)) * 100
                : 0;

            mergedData.previousEbitda = previousData.ebitda;
            mergedData.ebitdaChange = currentData.ebitda - previousData.ebitda;
            mergedData.ebitdaChangePercentage = previousData.ebitda !== 0
                ? (mergedData.ebitdaChange / Math.abs(previousData.ebitda)) * 100
                : 0;
        }

        return mergedData;
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

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

            console.log('📊 Total accounts:', accounts.length);
            console.log('📊 Total journals:', journals.length);

            // Calculate balances for current period
            const accountBalances = calculateBalances(
                accounts,
                journals,
                periodStart,
                periodEnd
            );

            // Build current income statement
            const currentData = buildIncomeStatement(
                accounts,
                accountBalances,
                periodStart,
                periodEnd,
                filters.periodType
            );

            let previousData: IncomeStatementData | null = null;
            let previousYearData: IncomeStatementData | null = null;

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
                    const prevBalances = calculateBalances(
                        accounts,
                        prevJournals,
                        getPreviousPeriodDates(filters).previousStart,
                        getPreviousPeriodDates(filters).previousEnd
                    );
                    const { previousStart, previousEnd } = getPreviousPeriodDates(filters);
                    previousData = buildIncomeStatement(
                        accounts,
                        prevBalances,
                        previousStart,
                        previousEnd,
                        filters.periodType
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
                    previousYearData = buildIncomeStatement(
                        accounts,
                        prevYearBalances,
                        previousYearStart,
                        previousYearEnd,
                        'year'
                    );
                }
            }

            // Merge comparison data
            const mergedData = mergeComparisonData(currentData, previousData, previousYearData);
            setData(mergedData);
            setComparisonData({ previousPeriod: previousData, previousYear: previousYearData });

        } catch (error) {
            console.error('Error fetching income statement:', error);
            showToast.error('Failed to load income statement');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filters, calculateBalances, buildIncomeStatement, mergeComparisonData]);

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
        items: IncomeItem[],
        total: number,
        percentage: number,
        color: string,
        totalColor: string,
        showComparison: boolean = false,
        previousTotal?: number,
        change?: number,
        changePercentage?: number
    ) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-4">
                <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-700">{title}</span>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
                            <span className="text-xs text-gray-400 w-16 text-right">{percentage.toFixed(1)}%</span>
                        </div>
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
                {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-1.5 px-4 hover:bg-gray-50 transition-colors border-b border-gray-100 group">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">{item.icon}</span>
                            <span className="text-xs text-gray-400 font-mono">{item.code}</span>
                            <span className="text-sm text-gray-700">{item.name}</span>
                            {item.category && (
                                <Badge variant="outline" className="text-xs">
                                    {item.category}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(item.amount)}
                                </span>
                                <span className="text-xs text-gray-400 w-16 text-right">
                                    {item.percentage.toFixed(1)}%
                                </span>
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                                    <div
                                        className={`h-1.5 rounded-full ${color}`}
                                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                                    />
                                </div>
                            </div>
                            {showComparison && item.change !== undefined && (
                                <div className="flex items-center gap-1 w-32">
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
                <div className="mt-1 pt-2 border-t-2 border-gray-300 flex justify-between items-center font-medium">
                    <span className="text-sm text-gray-600">Total {title}</span>
                    <div className="flex items-center gap-6">
                        <span className={`text-sm font-bold ${totalColor}`}>{formatCurrency(total)}</span>
                        {showComparison && previousTotal !== undefined && (
                            <span className={`text-xs font-medium ${getChangeColor(change)} w-32`}>
                                {change !== undefined && formatCurrency(change)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderSummaryLine = (
        label: string,
        amount: number,
        margin?: number,
        marginLabel?: string,
        color: string = 'text-gray-900',
        bgColor: string = 'bg-gray-50',
        borderColor: string = 'border-gray-200',
        showComparison: boolean = false,
        previousAmount?: number,
        change?: number,
        changePercentage?: number,
        secondaryLabel?: string,
        secondaryValue?: string
    ) => {
        return (
            <div className={`my-3 p-3 ${bgColor} rounded-lg border ${borderColor} flex justify-between items-center`}>
                <div>
                    <span className={`font-semibold ${color}`}>{label}</span>
                    {secondaryLabel && secondaryValue && (
                        <p className="text-xs text-gray-500">{secondaryLabel}: {secondaryValue}</p>
                    )}
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <span className={`font-bold ${color}`}>{formatCurrency(amount)}</span>
                        {margin !== undefined && marginLabel && (
                            <span className="text-sm text-gray-500">
                                ({margin.toFixed(1)}% {marginLabel})
                            </span>
                        )}
                    </div>
                    {showComparison && previousAmount !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${getChangeColor(change)}`}>
                                {getChangeIcon(change)}
                                {change !== undefined && formatCurrency(change)}
                            </span>
                            {changePercentage !== undefined && changePercentage !== 0 && (
                                <span className={`text-xs ${getChangeColor(change)}`}>
                                    ({changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ============== Loading State ==============
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // ============== Empty State ==============
    if (!data || (data.revenue.total === 0 && data.operatingExpenses.total === 0)) {
        return (
            <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No Data Available</h3>
                <p className="text-gray-500">Run the report to see the income statement</p>
                <Button onClick={fetchData} className="mt-4 bg-green-600 hover:bg-green-700">
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
                    <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Income Statement</h1>
                        <p className="text-sm text-gray-500">
                            {filters.periodType === 'custom' ? (
                                <>From {formatDate(data.startDate)} to {formatDate(data.endDate)}</>
                            ) : (
                                <>For the {filters.periodType} ending {formatDate(data.endDate)}</>
                            )}
                            <span className="ml-2 text-xs bg-green-100 px-2 py-1 rounded-full text-green-700">
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
                        {exporting && (
                            <div className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center">
                                <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
                                    <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
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
                            className="h-4 w-4 text-green-600 rounded border-gray-300"
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
                            className="h-4 w-4 text-green-600 rounded border-gray-300"
                        />
                        <Label htmlFor="compareYear" className="cursor-pointer text-sm">
                            Compare with same period last year
                        </Label>
                    </div>
                    <Button
                        onClick={fetchData}
                        className="bg-green-600 hover:bg-green-700 ml-auto"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
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
                            <span className="text-green-600">
                                <strong>Comparing with:</strong>
                                {filters.compareWithPrevious && ` Previous ${filters.periodType}`}
                                {filters.compareWithPrevious && filters.compareWithPreviousYear && ' & '}
                                {filters.compareWithPreviousYear && ' Same period last year'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-blue-700 font-medium">Revenue</p>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.revenue.total)}</p>
                        <p className="text-xs text-blue-600 mt-1">Total revenue for period</p>
                        {showComparison && data.revenue.change !== undefined && (
                            <p className={`text-xs font-medium ${getChangeColor(data.revenue.change)} mt-1`}>
                                {getChangeIcon(data.revenue.change)}
                                {formatCurrency(data.revenue.change)} ({data.revenue.changePercentage?.toFixed(1)}%)
                            </p>
                        )}
                        <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                            <div className="bg-blue-600 h-1 rounded-full" style={{ width: '100%' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-green-700 font-medium">Gross Profit</p>
                            <Percent className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-900">{formatCurrency(data.grossProfit)}</p>
                        <p className="text-xs text-green-600 mt-1">Gross Margin: {data.grossMargin.toFixed(1)}%</p>
                        {showComparison && data.grossProfitChange !== undefined && (
                            <p className={`text-xs font-medium ${getChangeColor(data.grossProfitChange)} mt-1`}>
                                {getChangeIcon(data.grossProfitChange)}
                                {formatCurrency(data.grossProfitChange)} ({data.grossProfitChangePercentage?.toFixed(1)}%)
                            </p>
                        )}
                        <div className="mt-2 w-full bg-green-200 rounded-full h-1">
                            <div
                                className="bg-green-600 h-1 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, data.grossMargin))}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-purple-700 font-medium">Operating Income</p>
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-purple-900">{formatCurrency(data.operatingIncome)}</p>
                        <p className="text-xs text-purple-600 mt-1">Operating Margin: {data.operatingMargin.toFixed(1)}%</p>
                        {showComparison && data.operatingIncomeChange !== undefined && (
                            <p className={`text-xs font-medium ${getChangeColor(data.operatingIncomeChange)} mt-1`}>
                                {getChangeIcon(data.operatingIncomeChange)}
                                {formatCurrency(data.operatingIncomeChange)} ({data.operatingIncomeChangePercentage?.toFixed(1)}%)
                            </p>
                        )}
                        <div className="mt-2 w-full bg-purple-200 rounded-full h-1">
                            <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, data.operatingMargin))}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-emerald-700 font-medium">Net Income</p>
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                        <p className={`text-2xl font-bold ${data.netIncome >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                            {formatCurrency(data.netIncome)}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">Net Margin: {data.netMargin.toFixed(1)}%</p>
                        {showComparison && data.netIncomeChange !== undefined && (
                            <p className={`text-xs font-medium ${getChangeColor(data.netIncomeChange)} mt-1`}>
                                {getChangeIcon(data.netIncomeChange)}
                                {formatCurrency(data.netIncomeChange)} ({data.netIncomeChangePercentage?.toFixed(1)}%)
                            </p>
                        )}
                        <div className="mt-2 w-full bg-emerald-200 rounded-full h-1">
                            <div
                                className={`h-1 rounded-full ${data.netIncome >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}
                                style={{ width: `${Math.min(100, Math.max(0, data.netMargin))}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Income Statement Details */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-green-600" />
                            Income Statement Summary
                            <Badge className="ml-2 bg-green-100 text-green-700">
                                {data.revenue.items.length + data.costOfGoodsSold.items.length +
                                    data.operatingExpenses.items.length + data.otherIncome.items.length +
                                    data.otherExpenses.items.length} accounts
                            </Badge>
                        </h3>
                        {showComparison && (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                                Comparison View
                            </Badge>
                        )}
                    </div>

                    {/* Revenue */}
                    {renderSection(
                        'Revenue',
                        data.revenue.items,
                        data.revenue.total,
                        100,
                        'bg-blue-500',
                        'text-blue-700',
                        showComparison,
                        data.revenue.previousTotal,
                        data.revenue.change,
                        data.revenue.changePercentage
                    )}

                    {/* COGS */}
                    {renderSection(
                        'Cost of Goods Sold',
                        data.costOfGoodsSold.items,
                        data.costOfGoodsSold.total,
                        data.costOfGoodsSold.percentage,
                        'bg-red-500',
                        'text-red-700',
                        showComparison,
                        data.costOfGoodsSold.previousTotal,
                        data.costOfGoodsSold.change,
                        data.costOfGoodsSold.changePercentage
                    )}

                    {/* Gross Profit */}
                    {renderSummaryLine(
                        'Gross Profit',
                        data.grossProfit,
                        data.grossMargin,
                        'margin',
                        'text-green-800',
                        'bg-green-50',
                        'border-green-200',
                        showComparison,
                        data.previousGrossProfit,
                        data.grossProfitChange,
                        data.grossProfitChangePercentage
                    )}

                    {/* Operating Expenses */}
                    {renderSection(
                        'Operating Expenses',
                        data.operatingExpenses.items,
                        data.operatingExpenses.total,
                        data.operatingExpenses.percentage,
                        'bg-orange-500',
                        'text-orange-700',
                        showComparison,
                        data.operatingExpenses.previousTotal,
                        data.operatingExpenses.change,
                        data.operatingExpenses.changePercentage
                    )}

                    {/* Operating Income */}
                    {renderSummaryLine(
                        'Operating Income (EBIT)',
                        data.operatingIncome,
                        data.operatingMargin,
                        'margin',
                        'text-purple-800',
                        'bg-purple-50',
                        'border-purple-200',
                        showComparison,
                        data.previousOperatingIncome,
                        data.operatingIncomeChange,
                        data.operatingIncomeChangePercentage,
                        'EBITDA',
                        `${formatCurrency(data.ebitda)} (${data.ebitdaMargin.toFixed(1)}% margin)`
                    )}

                    {/* Other Income */}
                    {renderSection(
                        'Other Income',
                        data.otherIncome.items,
                        data.otherIncome.total,
                        data.otherIncome.percentage,
                        'bg-cyan-500',
                        'text-cyan-700',
                        showComparison,
                        data.otherIncome.previousTotal,
                        data.otherIncome.change,
                        data.otherIncome.changePercentage
                    )}

                    {/* Other Expenses */}
                    {renderSection(
                        'Other Expenses',
                        data.otherExpenses.items,
                        data.otherExpenses.total,
                        data.otherExpenses.percentage,
                        'bg-rose-500',
                        'text-rose-700',
                        showComparison,
                        data.otherExpenses.previousTotal,
                        data.otherExpenses.change,
                        data.otherExpenses.changePercentage
                    )}

                    {/* Net Income */}
                    <div className={`mt-4 p-4 bg-gradient-to-r ${data.netIncome >= 0 ? 'from-emerald-50 to-green-50' : 'from-red-50 to-rose-50'} rounded-lg border-2 ${data.netIncome >= 0 ? 'border-emerald-300' : 'border-red-300'} flex justify-between items-center`}>
                        <div>
                            <span className={`font-bold text-lg ${data.netIncome >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                                Net Income {data.netIncome >= 0 ? '✓' : '⚠'}
                            </span>
                            {data.taxExpense !== undefined && data.taxExpense > 0 && (
                                <p className="text-xs text-gray-500">
                                    Tax Expense: {formatCurrency(data.taxExpense)}
                                    {data.interestExpense !== undefined && data.interestExpense > 0 && (
                                        <> • Interest Expense: {formatCurrency(data.interestExpense)}</>
                                    )}
                                </p>
                            )}
                            {data.depreciationAmortization !== undefined && data.depreciationAmortization > 0 && (
                                <p className="text-xs text-gray-500">
                                    Depreciation & Amortization: {formatCurrency(data.depreciationAmortization)}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <span className={`text-2xl font-bold ${data.netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                {formatCurrency(data.netIncome)}
                            </span>
                            <p className="text-sm text-gray-500">
                                Net Margin: {data.netMargin.toFixed(1)}%
                                {showComparison && data.netIncomeChange !== undefined && (
                                    <span className={`ml-2 text-xs font-medium ${getChangeColor(data.netIncomeChange)}`}>
                                        {getChangeIcon(data.netIncomeChange)}
                                        {formatCurrency(data.netIncomeChange)} ({data.netIncomeChangePercentage?.toFixed(1)}%)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* EBITDA Summary Card */}
            <Card className="border-indigo-200 bg-indigo-50">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            <span className="font-semibold text-indigo-800">EBITDA Summary</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-sm text-indigo-600">EBITDA</p>
                                <p className="text-lg font-bold text-indigo-900">{formatCurrency(data.ebitda)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-indigo-600">EBITDA Margin</p>
                                <p className="text-lg font-bold text-indigo-900">{data.ebitdaMargin.toFixed(1)}%</p>
                            </div>
                            {showComparison && data.ebitdaChange !== undefined && (
                                <div>
                                    <p className="text-sm text-indigo-600">Change</p>
                                    <p className={`text-lg font-bold ${getChangeColor(data.ebitdaChange)}`}>
                                        {getChangeIcon(data.ebitdaChange)}
                                        {formatCurrency(data.ebitdaChange)}
                                        <span className="text-sm ml-1">
                                            ({data.ebitdaChangePercentage?.toFixed(1)}%)
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comparison Summary (if enabled) */}
            {showComparison && comparisonData?.previousPeriod && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-green-800 mb-3">Period Comparison Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Revenue Change</p>
                                <p className={`font-bold ${getChangeColor(data.revenue.change)}`}>
                                    {data.revenue.change !== undefined && formatCurrency(data.revenue.change)}
                                    <span className="ml-1">
                                        ({data.revenue.changePercentage?.toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Gross Profit Change</p>
                                <p className={`font-bold ${getChangeColor(data.grossProfitChange)}`}>
                                    {data.grossProfitChange !== undefined && formatCurrency(data.grossProfitChange)}
                                    <span className="ml-1">
                                        ({data.grossProfitChangePercentage?.toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Operating Income Change</p>
                                <p className={`font-bold ${getChangeColor(data.operatingIncomeChange)}`}>
                                    {data.operatingIncomeChange !== undefined && formatCurrency(data.operatingIncomeChange)}
                                    <span className="ml-1">
                                        ({data.operatingIncomeChangePercentage?.toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Net Income Change</p>
                                <p className={`font-bold ${getChangeColor(data.netIncomeChange)}`}>
                                    {data.netIncomeChange !== undefined && formatCurrency(data.netIncomeChange)}
                                    <span className="ml-1">
                                        ({data.netIncomeChangePercentage?.toFixed(1)}%)
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

export default IncomeStatement;