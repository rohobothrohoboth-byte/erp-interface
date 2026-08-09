// src/pages/finance/tax/TaxReports.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, RefreshCw, Download, Printer, Calendar,
    DollarSign, TrendingUp, TrendingDown, PieChart,
    FileText, Percent, Shield, Clock, AlertCircle,
    ChevronLeft, ChevronRight, Filter, Search,
    ArrowUp, ArrowDown, Minus, Building2, Users,
    CreditCard, Landmark, Briefcase, Package, Zap,
    CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { getInvoices, getExpenses, getAccounts, getJournalEntries } from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { useReportExport } from '../../../hooks/useReportExport';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../../../components/ui/tooltip';

// ============== Types ==============
interface TaxReportData {
    period: string;
    periodStart: string;
    periodEnd: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    vatOnSales: number;
    vatOnPurchases: number;
    vatOnImports: number;
    vatOnExports: number;
    netVat: number;
    withholdingTax: number;
    totalTaxLiability: number;
    transactions: number;
    vatRate: number;
    filingStatus: 'Pending' | 'Filed' | 'Overdue' | 'Refunded';
    filingDate?: string;
    paymentDate?: string;
    filingReference?: string;
    breakdown: {
        sales: number;
        purchases: number;
        imports: number;
        exports: number;
        withholdingTax: number;
        adjustments: number;
    };
    previousPeriod?: {
        period: string;
        netVat: number;
        withholdingTax: number;
        totalTax: number;
        change: number;
        changePercentage: number;
    };
    rateDistribution: {
        rate: number;
        amount: number;
        count: number;
    }[];
    accountSummary: {
        accountType: string;
        count: number;
        taxableAmount: number;
        taxAmount: number;
    }[];
}

interface TaxPeriodData {
    period: string;
    periodStart: string;
    periodEnd: string;
    vat: number;
    withholdingTax: number;
    totalTax: number;
    netVat: number;
    status: 'Filed' | 'Pending' | 'Overdue' | 'Refunded';
    filingDate?: string;
    paymentDate?: string;
    transactions: number;
    revenue: number;
    expenses: number;
}

interface PeriodFilters {
    period: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    fiscalYear: string;
    reportType: 'VAT' | 'WithholdingTax' | 'Combined' | 'All';
    compareWithPrevious: boolean;
    compareWithPreviousYear: boolean;
    customStartDate?: string;
    customEndDate?: string;
    includeAdjustments: boolean;
    includeZeroTransactions: boolean;
    vatRates: number[];
}

// ============== Helper Functions ==============
const getPeriodRange = (period: string, periodType: 'month' | 'quarter' | 'year' | 'custom') => {
    const [year, month] = period.split('-').map(Number);
    let startDate: Date;
    let endDate: Date;

    switch (periodType) {
        case 'month':
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
            break;
        case 'quarter':
            const quarter = Math.floor((month - 1) / 3);
            startDate = new Date(year, quarter * 3, 1);
            endDate = new Date(year, quarter * 3 + 3, 0);
            break;
        case 'year':
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31);
            break;
        case 'custom':
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
            break;
        default:
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
    }

    return {
        periodStart: startDate.toISOString().split('T')[0],
        periodEnd: endDate.toISOString().split('T')[0],
    };
};

const getPreviousPeriod = (period: string, periodType: 'month' | 'quarter' | 'year' | 'custom') => {
    const [year, month] = period.split('-').map(Number);
    let previousYear = year;
    let previousMonth = month;

    switch (periodType) {
        case 'month':
            previousMonth = month - 1;
            if (previousMonth === 0) {
                previousMonth = 12;
                previousYear = year - 1;
            }
            break;
        case 'quarter':
            previousMonth = month - 3;
            if (previousMonth <= 0) {
                previousMonth = 12 + previousMonth;
                previousYear = year - 1;
            }
            break;
        case 'year':
            previousYear = year - 1;
            previousMonth = month;
            break;
        case 'custom':
            previousMonth = month - 1;
            if (previousMonth === 0) {
                previousMonth = 12;
                previousYear = year - 1;
            }
            break;
    }

    return `${previousYear}-${String(previousMonth).padStart(2, '0')}`;
};

const getPreviousYearPeriod = (period: string) => {
    const [year, month] = period.split('-').map(Number);
    return `${year - 1}-${String(month).padStart(2, '0')}`;
};

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        Filed: 'bg-green-100 text-green-700 border-green-200',
        Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Overdue: 'bg-red-100 text-red-700 border-red-200',
        Refunded: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
};

const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
        case 'Filed': return <CheckCircle className="h-4 w-4" />;
        case 'Pending': return <Clock className="h-4 w-4" />;
        case 'Overdue': return <AlertTriangle className="h-4 w-4" />;
        case 'Refunded': return <ArrowUp className="h-4 w-4" />;
        default: return <AlertCircle className="h-4 w-4" />;
    }
};

const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-400';
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-400';
};

const getChangeIcon = (change?: number) => {
    if (!change || Math.abs(change) < 0.01) return <Minus className="h-3 w-3" />;
    if (change > 0) return <ArrowUp className="h-3 w-3" />;
    return <ArrowDown className="h-3 w-3" />;
};

// ============== Main Component ==============
const TaxReports: React.FC = () => {
    // State
    const [reportData, setReportData] = useState<TaxReportData | null>(null);
    const [periodHistory, setPeriodHistory] = useState<TaxPeriodData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
    const [filters, setFilters] = useState<PeriodFilters>({
        period: new Date().toISOString().slice(0, 7),
        periodType: 'month',
        fiscalYear: new Date().getFullYear().toString(),
        reportType: 'Combined',
        compareWithPrevious: false,
        compareWithPreviousYear: false,
        customStartDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        customEndDate: new Date().toISOString().split('T')[0],
        includeAdjustments: true,
        includeZeroTransactions: false,
        vatRates: [5, 7, 15, 20, 25],
    });

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

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
    } = useReportExport('tax-report');

    // ============== Data Fetching ==============
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const { periodStart, periodEnd } = getPeriodRange(filters.period, filters.periodType);

            const [invoicesRes, expensesRes, accountsRes, journalRes] = await Promise.all([
                getInvoices(),
                getExpenses(),
                getAccounts(),
                getJournalEntries({ fromDate: periodStart, toDate: periodEnd }),
            ]);

            const invoices = invoicesRes.data.data || invoicesRes.data || [];
            const expenses = expensesRes.data.data || expensesRes.data || [];
            const accounts = accountsRes.data.data || accountsRes.data || [];
            const journals = journalRes.data.data || journalRes.data || [];

            // Filter by period
            const periodInvoices = invoices.filter((inv: any) =>
                inv.invoiceDate && inv.invoiceDate >= periodStart && inv.invoiceDate <= periodEnd
            );
            const periodExpenses = expenses.filter((exp: any) =>
                exp.expenseDate && exp.expenseDate >= periodStart && exp.expenseDate <= periodEnd
            );

            // Calculate VAT
            const vatOnSales = periodInvoices.reduce((sum: number, inv: any) => sum + (inv.taxAmount || inv.vatAmount || 0), 0);
            const vatOnPurchases = periodExpenses.reduce((sum: number, exp: any) => sum + (exp.taxAmount || exp.vatAmount || 0), 0);

            // Calculate imports and exports
            const imports = periodInvoices
                .filter((inv: any) => inv.type === 'Import' || inv.isImport)
                .reduce((sum: number, inv: any) => sum + (inv.taxAmount || inv.vatAmount || 0), 0);
            const exports = periodInvoices
                .filter((inv: any) => inv.type === 'Export' || inv.isExport)
                .reduce((sum: number, inv: any) => sum + (inv.taxAmount || inv.vatAmount || 0), 0);

            const netVat = vatOnSales + imports - vatOnPurchases - exports;

            // Calculate withholding tax
            const withholdingTax = periodInvoices
                .filter((inv: any) => inv.withholdingTax > 0)
                .reduce((sum: number, inv: any) => sum + (inv.withholdingTax || 0), 0);

            // Calculate adjustments from journal entries
            let adjustments = 0;
            journals.forEach((journal: any) => {
                if (journal.isPosted && journal.lines) {
                    journal.lines.forEach((line: any) => {
                        const account = accounts.find((a: any) => a.id === line.accountId);
                        if (account && (account.name.toLowerCase().includes('vat adjustment') ||
                            account.code.startsWith('229'))) {
                            adjustments += line.direction === 'Debit' ? line.amount : -line.amount;
                        }
                    });
                }
            });

            // Calculate breakdown
            const sales = periodInvoices.reduce((sum: number, inv: any) => sum + (inv.subTotal || inv.totalAmount || 0), 0);
            const purchases = periodExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);

            // Calculate rate distribution
            const rateMap = new Map<number, { amount: number; count: number }>();
            periodInvoices.forEach((inv: any) => {
                const rate = inv.taxRate || 15;
                const vatAmount = inv.taxAmount || inv.vatAmount || 0;
                if (!rateMap.has(rate)) {
                    rateMap.set(rate, { amount: 0, count: 0 });
                }
                const entry = rateMap.get(rate)!;
                entry.amount += vatAmount;
                entry.count++;
            });
            periodExpenses.forEach((exp: any) => {
                const rate = exp.taxRate || 15;
                const vatAmount = exp.taxAmount || exp.vatAmount || 0;
                if (!rateMap.has(rate)) {
                    rateMap.set(rate, { amount: 0, count: 0 });
                }
                const entry = rateMap.get(rate)!;
                entry.amount += vatAmount;
                entry.count++;
            });

            const rateDistribution = Array.from(rateMap.entries()).map(([rate, data]) => ({
                rate,
                amount: data.amount,
                count: data.count,
            })).sort((a, b) => b.amount - a.amount);

            // Account summary
            const accountMap = new Map<string, { count: number; taxableAmount: number; taxAmount: number }>();
            periodInvoices.forEach((inv: any) => {
                const type = inv.accountType || 'Revenue';
                if (!accountMap.has(type)) {
                    accountMap.set(type, { count: 0, taxableAmount: 0, taxAmount: 0 });
                }
                const entry = accountMap.get(type)!;
                entry.count++;
                entry.taxableAmount += inv.subTotal || inv.totalAmount || 0;
                entry.taxAmount += inv.taxAmount || inv.vatAmount || 0;
            });
            periodExpenses.forEach((exp: any) => {
                const type = exp.accountType || 'Expense';
                if (!accountMap.has(type)) {
                    accountMap.set(type, { count: 0, taxableAmount: 0, taxAmount: 0 });
                }
                const entry = accountMap.get(type)!;
                entry.count++;
                entry.taxableAmount += exp.amount || 0;
                entry.taxAmount += exp.taxAmount || exp.vatAmount || 0;
            });

            const accountSummary = Array.from(accountMap.entries()).map(([accountType, data]) => ({
                accountType,
                count: data.count,
                taxableAmount: data.taxableAmount,
                taxAmount: data.taxAmount,
            }));

            // Calculate previous period for comparison
            let previousPeriodData: TaxReportData['previousPeriod'] | undefined;
            if (filters.compareWithPrevious || filters.compareWithPreviousYear) {
                let comparisonPeriod: string | null = null;

                if (filters.compareWithPrevious) {
                    comparisonPeriod = getPreviousPeriod(filters.period, filters.periodType);
                } else if (filters.compareWithPreviousYear) {
                    comparisonPeriod = getPreviousYearPeriod(filters.period);
                }

                if (comparisonPeriod) {
                    const { periodStart: prevStart, periodEnd: prevEnd } = getPeriodRange(comparisonPeriod, filters.periodType);

                    const [prevInvoicesRes, prevExpensesRes] = await Promise.all([
                        getInvoices(),
                        getExpenses(),
                    ]);

                    const prevInvoices = prevInvoicesRes.data.data || prevInvoicesRes.data || [];
                    const prevExpenses = prevExpensesRes.data.data || prevExpensesRes.data || [];

                    const prevPeriodInvoices = prevInvoices.filter((inv: any) =>
                        inv.invoiceDate && inv.invoiceDate >= prevStart && inv.invoiceDate <= prevEnd
                    );
                    const prevPeriodExpenses = prevExpenses.filter((exp: any) =>
                        exp.expenseDate && exp.expenseDate >= prevStart && exp.expenseDate <= prevEnd
                    );

                    const prevVatOnSales = prevPeriodInvoices.reduce((sum: number, inv: any) => sum + (inv.taxAmount || inv.vatAmount || 0), 0);
                    const prevVatOnPurchases = prevPeriodExpenses.reduce((sum: number, exp: any) => sum + (exp.taxAmount || exp.vatAmount || 0), 0);
                    const prevNetVat = prevVatOnSales - prevVatOnPurchases;
                    const prevWithholdingTax = prevPeriodInvoices
                        .filter((inv: any) => inv.withholdingTax > 0)
                        .reduce((sum: number, inv: any) => sum + (inv.withholdingTax || 0), 0);
                    const prevTotalTax = Math.max(0, prevNetVat) + prevWithholdingTax;
                    const currentTotalTax = Math.max(0, netVat) + withholdingTax;

                    previousPeriodData = {
                        period: comparisonPeriod,
                        netVat: prevNetVat,
                        withholdingTax: prevWithholdingTax,
                        totalTax: prevTotalTax,
                        change: currentTotalTax - prevTotalTax,
                        changePercentage: prevTotalTax !== 0 ? ((currentTotalTax - prevTotalTax) / Math.abs(prevTotalTax)) * 100 : 0,
                    };
                }
            }

            // Determine filing status
            let filingStatus: 'Pending' | 'Filed' | 'Overdue' | 'Refunded' = 'Pending';
            const totalLiability = Math.max(0, netVat) + withholdingTax;
            if (totalLiability < 0) {
                filingStatus = 'Refunded';
            } else if (totalLiability > 0) {
                filingStatus = 'Pending';
            } else {
                filingStatus = 'Filed';
            }

            setReportData({
                period: filters.period,
                periodStart,
                periodEnd,
                periodType: filters.periodType,
                vatOnSales,
                vatOnPurchases,
                vatOnImports: imports,
                vatOnExports: exports,
                netVat,
                withholdingTax,
                totalTaxLiability: Math.max(0, totalLiability),
                transactions: periodInvoices.length + periodExpenses.length,
                vatRate: 15,
                filingStatus,
                breakdown: {
                    sales,
                    purchases,
                    imports: periodInvoices.filter((inv: any) => inv.type === 'Import').reduce((sum: number, inv: any) => sum + (inv.subTotal || inv.totalAmount || 0), 0),
                    exports: periodInvoices.filter((inv: any) => inv.type === 'Export').reduce((sum: number, inv: any) => sum + (inv.subTotal || inv.totalAmount || 0), 0),
                    withholdingTax,
                    adjustments,
                },
                previousPeriod: previousPeriodData,
                rateDistribution,
                accountSummary,
            });

            // Generate period history
            const history: TaxPeriodData[] = [];
            for (let i = 0; i < 6; i++) {
                const date = new Date(filters.period);
                date.setMonth(date.getMonth() - i - 1);
                const period = date.toISOString().slice(0, 7);
                const { periodStart: histStart, periodEnd: histEnd } = getPeriodRange(period, filters.periodType);

                // Fetch data for historical period
                const [histInvoicesRes, histExpensesRes] = await Promise.all([
                    getInvoices(),
                    getExpenses(),
                ]);

                const histInvoices = histInvoicesRes.data.data || histInvoicesRes.data || [];
                const histExpenses = histExpensesRes.data.data || histExpensesRes.data || [];

                const histPeriodInvoices = histInvoices.filter((inv: any) =>
                    inv.invoiceDate && inv.invoiceDate >= histStart && inv.invoiceDate <= histEnd
                );
                const histPeriodExpenses = histExpenses.filter((exp: any) =>
                    exp.expenseDate && exp.expenseDate >= histStart && exp.expenseDate <= histEnd
                );

                const histVat = histPeriodInvoices.reduce((sum: number, inv: any) => sum + (inv.taxAmount || inv.vatAmount || 0), 0) -
                    histPeriodExpenses.reduce((sum: number, exp: any) => sum + (exp.taxAmount || exp.vatAmount || 0), 0);
                const histWithholdingTax = histPeriodInvoices
                    .filter((inv: any) => inv.withholdingTax > 0)
                    .reduce((sum: number, inv: any) => sum + (inv.withholdingTax || 0), 0);
                const histTotalTax = Math.max(0, histVat) + histWithholdingTax;

                history.push({
                    period,
                    periodStart: histStart,
                    periodEnd: histEnd,
                    vat: histVat,
                    withholdingTax: histWithholdingTax,
                    totalTax: histTotalTax,
                    netVat: histVat,
                    status: histTotalTax > 0 ? 'Pending' : 'Filed',
                    transactions: histPeriodInvoices.length + histPeriodExpenses.length,
                    revenue: histPeriodInvoices.reduce((sum: number, inv: any) => sum + (inv.subTotal || inv.totalAmount || 0), 0),
                    expenses: histPeriodExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0),
                });
            }

            setPeriodHistory(history);

        } catch (error) {
            console.error('Error fetching tax report data:', error);
            showToast.error('Failed to load tax report data');
        } finally {
            setLoading(false);
        }
    }, [filters]);

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
            month: 'short',
            day: 'numeric',
        });
    };

    const getReportTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            VAT: 'text-purple-600 bg-purple-100',
            WithholdingTax: 'text-orange-600 bg-orange-100',
            Combined: 'text-indigo-600 bg-indigo-100',
            All: 'text-gray-600 bg-gray-100',
        };
        return colors[type] || 'text-gray-600 bg-gray-100';
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
    if (!reportData) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No Tax Data Available</h3>
                <p className="text-gray-500">Generate a report to see tax information</p>
                <Button onClick={fetchData} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
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
                        <BarChart3 className="w-6 h-6 text-indigo-600"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tax Reports</h1>
                        <p className="text-sm text-gray-500">
                            Period: {reportData.period}
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
                        onClick={() => handlePrintReport(reportData)}
                    >
                        <Printer size={16}/>
                        Print
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Period */}
                    <div>
                        <Label className="text-sm font-medium">Period</Label>
                        <Input
                            type="month"
                            value={filters.period}
                            onChange={(e) => setFilters({...filters, period: e.target.value})}
                        />
                    </div>

                    {/* Period Type */}
                    <div>
                        <Label className="text-sm font-medium">Period Type</Label>
                        <Select
                            value={filters.periodType}
                            onValueChange={(value: any) => setFilters({...filters, periodType: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select period type"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">Monthly</SelectItem>
                                <SelectItem value="quarter">Quarterly</SelectItem>
                                <SelectItem value="year">Yearly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Report Type */}
                    <div>
                        <Label className="text-sm font-medium">Report Type</Label>
                        <Select
                            value={filters.reportType}
                            onValueChange={(value: any) => setFilters({...filters, reportType: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select report type"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="VAT">VAT Report</SelectItem>
                                <SelectItem value="WithholdingTax">Withholding Tax Report</SelectItem>
                                <SelectItem value="Combined">Combined Tax Report</SelectItem>
                                <SelectItem value="All">All Taxes</SelectItem>
                            </SelectContent>
                        </Select>
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
                </div>

                {/* Options and Comparison */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includeAdjustments"
                            checked={filters.includeAdjustments}
                            onChange={(e) => setFilters({
                                ...filters,
                                includeAdjustments: e.target.checked
                            })}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <Label htmlFor="includeAdjustments" className="cursor-pointer text-sm">
                            Include Adjustments
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includeZero"
                            checked={filters.includeZeroTransactions}
                            onChange={(e) => setFilters({
                                ...filters,
                                includeZeroTransactions: e.target.checked
                            })}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <Label htmlFor="includeZero" className="cursor-pointer text-sm">
                            Include Zero Transactions
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
                        <strong>Period:</strong> {formatDate(reportData.periodStart)} to {formatDate(reportData.periodEnd)}
                    </span>
                    <span className="w-px h-4 bg-gray-300"/>
                    <span>
                        <strong>Fiscal Year:</strong> {filters.fiscalYear}
                    </span>
                    <span className="w-px h-4 bg-gray-300"/>
                    <span>
                        <strong>Report Type:</strong>
                        <Badge className={`ml-1 ${getReportTypeColor(filters.reportType)}`}>
                            {filters.reportType}
                        </Badge>
                    </span>
                    <span className="w-px h-4 bg-gray-300"/>
                    <span>
                        <strong>Transactions:</strong> {reportData.transactions}
                    </span>
                    {filters.includeAdjustments && (
                        <>
                            <span className="w-px h-4 bg-gray-300"/>
                            <span className="text-indigo-600">
                                <strong>Including:</strong> Adjustments
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">VAT on Sales</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(reportData.vatOnSales)}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-blue-700"/>
                            </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Exports: {formatCurrency(reportData.vatOnExports)}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">VAT on Purchases</p>
                                <p className="text-2xl font-bold text-orange-900">{formatCurrency(reportData.vatOnPurchases)}</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-orange-700"/>
                            </div>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">Imports: {formatCurrency(reportData.vatOnImports)}</p>
                    </CardContent>
                </Card>

                <Card
                    className={`bg-gradient-to-r ${reportData.netVat >= 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-green-50 to-green-100 border-green-200'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm ${reportData.netVat >= 0 ? 'text-red-700' : 'text-green-700'} font-medium`}>
                                    Net VAT {reportData.netVat >= 0 ? 'Payable' : 'Refundable'}
                                </p>
                                <p className={`text-2xl font-bold ${reportData.netVat >= 0 ? 'text-red-900' : 'text-green-900'}`}>
                                    {formatCurrency(Math.abs(reportData.netVat))}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${reportData.netVat >= 0 ? 'bg-red-200' : 'bg-green-200'}`}>
                                {reportData.netVat >= 0 ? (
                                    <TrendingUp className="h-6 w-6 text-red-700"/>
                                ) : (
                                    <TrendingDown className="h-6 w-6 text-green-700"/>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Withholding Tax</p>
                                <p className="text-2xl font-bold text-purple-900">{formatCurrency(reportData.withholdingTax)}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Shield className="h-6 w-6 text-purple-700"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Total Tax Liability</p>
                                <p className="text-2xl font-bold text-indigo-900">{formatCurrency(reportData.totalTaxLiability)}</p>
                            </div>
                            <div
                                className={`p-3 rounded-lg ${reportData.filingStatus === 'Filed' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                                {getStatusIcon(reportData.filingStatus)}
                            </div>
                        </div>
                        <p className="text-xs text-indigo-600 mt-1">
                            Status: <Badge
                            className={getStatusColor(reportData.filingStatus)}>{reportData.filingStatus}</Badge>
                        </p>
                        {showComparison && reportData.previousPeriod && (
                            <p className={`text-xs font-medium ${getChangeColor(reportData.previousPeriod.change)} mt-1`}>
                                {getChangeIcon(reportData.previousPeriod.change)}
                                {formatCurrency(reportData.previousPeriod.change)} ({reportData.previousPeriod.changePercentage.toFixed(1)}%)
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax Breakdown */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Breakdown</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Sales</span>
                                    <span
                                        className="font-medium text-blue-600">{formatCurrency(reportData.breakdown.sales)}</span>
                                </div>
                                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-blue-500 rounded-full" style={{
                                        width: `${Math.min(100, (reportData.breakdown.sales / (reportData.breakdown.sales + reportData.breakdown.purchases + 1)) * 100)}%`
                                    }}/>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Purchases</span>
                                    <span
                                        className="font-medium text-orange-600">{formatCurrency(reportData.breakdown.purchases)}</span>
                                </div>
                                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-orange-500 rounded-full" style={{
                                        width: `${Math.min(100, (reportData.breakdown.purchases / (reportData.breakdown.sales + reportData.breakdown.purchases + 1)) * 100)}%`
                                    }}/>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Imports</span>
                                    <span
                                        className="font-medium text-purple-600">{formatCurrency(reportData.breakdown.imports)}</span>
                                </div>
                                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-purple-500 rounded-full" style={{
                                        width: `${Math.min(100, (reportData.breakdown.imports / (reportData.breakdown.sales + reportData.breakdown.purchases + 1)) * 100)}%`
                                    }}/>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Exports</span>
                                    <span
                                        className="font-medium text-green-600">{formatCurrency(reportData.breakdown.exports)}</span>
                                </div>
                                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-green-500 rounded-full" style={{
                                        width: `${Math.min(100, (reportData.breakdown.exports / (reportData.breakdown.sales + reportData.breakdown.purchases + 1)) * 100)}%`
                                    }}/>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Withholding Tax</span>
                                    <span
                                        className="font-medium text-purple-600">{formatCurrency(reportData.breakdown.withholdingTax)}</span>
                                </div>
                                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-purple-500 rounded-full" style={{
                                        width: `${Math.min(100, (reportData.breakdown.withholdingTax / (reportData.totalTaxLiability + 1)) * 100)}%`
                                    }}/>
                                </div>
                            </div>
                            {reportData.breakdown.adjustments !== 0 && (
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Adjustments</span>
                                        <span
                                            className={`font-medium ${reportData.breakdown.adjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(reportData.breakdown.adjustments)}
                                        </span>
                                    </div>
                                    <div className="mt-1 h-2 bg-gray-200 rounded-full">
                                        <div
                                            className={`h-2 ${reportData.breakdown.adjustments >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full`}
                                            style={{
                                                width: `${Math.min(100, Math.abs(reportData.breakdown.adjustments) / (reportData.totalTaxLiability + 1) * 100)}%`
                                            }}/>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* VAT Rate Distribution */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">VAT Rate Distribution</h3>
                        <div className="space-y-4">
                            {reportData.rateDistribution.map((item) => (
                                <div key={item.rate} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium text-gray-700">{item.rate}% Rate</span>
                                            <span
                                                className="text-xs text-gray-500 ml-2">({item.count} transactions)</span>
                                        </div>
                                        <span className="font-bold text-purple-600">{formatCurrency(item.amount)}</span>
                                    </div>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-purple-600 h-1.5 rounded-full"
                                            style={{
                                                width: `${Math.min(100, (item.amount / Math.max(reportData.vatOnSales, reportData.vatOnPurchases, 1)) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {reportData.rateDistribution.length === 0 && (
                                <p className="text-center text-gray-500 py-4">No VAT rate data available</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Account Summary */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {reportData.accountSummary.map((item) => (
                            <div key={item.accountType} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-500"/>
                                    <span className="font-medium text-gray-700">{item.accountType}</span>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-500">Count: {item.count}</p>
                                    <p className="text-sm text-gray-500">Taxable: {formatCurrency(item.taxableAmount)}</p>
                                    <p className="text-sm font-medium text-purple-600">Tax: {formatCurrency(item.taxAmount)}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className="bg-purple-600 h-1 rounded-full"
                                            style={{
                                                width: `${Math.min(100, (item.taxAmount / Math.max(reportData.totalTaxLiability, 1)) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Historical Periods */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Historical Tax Periods</h3>
                        <Badge className="bg-indigo-100 text-indigo-700">
                            {periodHistory.length} periods
                        </Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date
                                    Range
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">VAT</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Withholding
                                    Tax
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total
                                    Tax
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {periodHistory.map((period, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{period.period}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {formatDate(period.periodStart)} - {formatDate(period.periodEnd)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-blue-600">
                                        {formatCurrency(period.vat)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-purple-600">
                                        {formatCurrency(period.withholdingTax)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        {formatCurrency(period.totalTax)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-green-600">
                                        {formatCurrency(period.revenue)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-red-600">
                                        {formatCurrency(period.expenses)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(period.status)}>
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(period.status)}
                                                    {period.status}
                                                </span>
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Comparison Summary (if enabled) */}
            {showComparison && reportData.previousPeriod && (
                <Card className="border-indigo-200 bg-indigo-50">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-indigo-800 mb-3">Tax Comparison Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Total Tax Change</p>
                                <p className={`font-bold ${getChangeColor(reportData.previousPeriod.change)}`}>
                                    {getChangeIcon(reportData.previousPeriod.change)}
                                    {formatCurrency(reportData.previousPeriod.change)}
                                    <span className="ml-1">
                                        ({reportData.previousPeriod.changePercentage.toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Net VAT Change</p>
                                <p className={`font-bold ${getChangeColor(reportData.netVat - reportData.previousPeriod.netVat)}`}>
                                    {formatCurrency(reportData.netVat - reportData.previousPeriod.netVat)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Withholding Tax Change</p>
                                <p className={`font-bold ${getChangeColor(reportData.withholdingTax - reportData.previousPeriod.withholdingTax)}`}>
                                    {formatCurrency(reportData.withholdingTax - reportData.previousPeriod.withholdingTax)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Previous Period</p>
                                <p className="font-medium text-gray-900">{reportData.previousPeriod.period}</p>
                                <p className="text-xs text-gray-500">Total: {formatCurrency(reportData.previousPeriod.totalTax)}</p>
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
                            <Download className="h-5 w-5 text-indigo-600"/>
                            {title || 'Export Tax Report'}
                        </DialogTitle>
                        <DialogDescription>
                            Export the tax report in your preferred format.
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
                                    <SelectValue placeholder="Select format"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-red-500"/>
                                            PDF - Printable Document
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="excel">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-600"/>
                                            Excel - Spreadsheet
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="csv">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500"/>
                                            CSV - Comma separated values
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Period</Label>
                            <div className="text-sm text-gray-600">
                                {formatDate(reportData.periodStart)} to {formatDate(reportData.periodEnd)}
                            </div>
                        </div>
                        <div>
                            <Label>Report Type</Label>
                            <div className="text-sm text-gray-600">{filters.reportType}</div>
                        </div>
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
                            onClick={() => handleExport(reportData)}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin"/>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2"/>
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

export default TaxReports;