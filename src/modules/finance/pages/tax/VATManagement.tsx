// src/pages/finance/tax/VATManagement.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Percent, RefreshCw, Search, Filter, Eye, Edit,
    Plus, DollarSign, Calendar, Building2, FileText,
    ChevronLeft, ChevronRight, MoreVertical, Save, X,
    AlertCircle, CheckCircle, TrendingUp, TrendingDown,
    Download, Printer, Clock, BarChart3, PieChart,
    ArrowUp, ArrowDown, Minus, Users, CreditCard,
    Landmark, Briefcase, Package, Zap,
    Home, Settings, Coffee, Gift, Banknote
} from 'lucide-react';
import { getInvoices, getExpenses, getAccounts, getJournalEntries } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
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
interface VATTransaction {
    id: string;
    date: string;
    reference: string;
    description: string;
    type: 'Sales' | 'Purchase' | 'Import' | 'Export' | 'Adjustment';
    vatRate: number;
    vatAmount: number;
    netAmount: number;
    totalAmount: number;
    status: 'Pending' | 'Filed' | 'Paid' | 'Overdue' | 'Refunded';
    period: string;
    invoiceId?: string;
    expenseId?: string;
    customerName?: string;
    supplierName?: string;
    taxCode?: string;
    vatCategory?: string;
    postedBy?: string;
    postedDate?: string;
    previousVatAmount?: number;
    change?: number;
    changePercentage?: number;
    sourceType: 'Invoice' | 'Expense' | 'Journal' | 'Manual';
}

interface VATSummary {
    period: string;
    periodStart: string;
    periodEnd: string;
    totalSales: number;
    totalPurchases: number;
    totalImports: number;
    totalExports: number;
    vatOnSales: number;
    vatOnPurchases: number;
    vatOnImports: number;
    vatOnExports: number;
    netVatPayable: number;
    previousNetVatPayable?: number;
    change?: number;
    changePercentage?: number;
    filingStatus: 'Pending' | 'Filed' | 'Overdue' | 'Refunded';
    filingDate?: string;
    paymentDate?: string;
    filingReference?: string;
    vatRateDistribution: {
        rate: number;
        salesAmount: number;
        purchaseAmount: number;
        vatAmount: number;
    }[];
}

interface VATComparisonData {
    previousPeriod: VATSummary | null;
    previousYear: VATSummary | null;
}

interface PeriodFilters {
    period: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    fiscalYear: string;
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

const getVATRate = (amount: number, taxAmount: number): number => {
    if (amount === 0) return 0;
    return (taxAmount / amount) * 100;
};

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Filed: 'bg-green-100 text-green-700 border-green-200',
        Paid: 'bg-blue-100 text-blue-700 border-blue-200',
        Overdue: 'bg-red-100 text-red-700 border-red-200',
        Refunded: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
};

const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
        Sales: 'bg-blue-100 text-blue-700',
        Purchase: 'bg-orange-100 text-orange-700',
        Import: 'bg-purple-100 text-purple-700',
        Export: 'bg-green-100 text-green-700',
        Adjustment: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
};

const getTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
        case 'Sales': return <TrendingUp className="h-4 w-4" />;
        case 'Purchase': return <ShoppingBag className="h-4 w-4" />;
        case 'Import': return <Package className="h-4 w-4" />;
        case 'Export': return <Gift className="h-4 w-4" />;
        case 'Adjustment': return <Edit className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
    }
};

// Import missing icons
const ShoppingBag = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const Shield = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;

// ============== Main Component ==============
const VATManagement: React.FC = () => {
    // State
    const [transactions, setTransactions] = useState<VATTransaction[]>([]);
    const [summary, setSummary] = useState<VATSummary | null>(null);
    const [comparisonData, setComparisonData] = useState<VATComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState<VATTransaction | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustmentAmount, setAdjustmentAmount] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [filters, setFilters] = useState<PeriodFilters>({
        period: new Date().toISOString().slice(0, 7),
        periodType: 'month',
        fiscalYear: new Date().getFullYear().toString(),
        compareWithPrevious: false,
        compareWithPreviousYear: false,
        customStartDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        customEndDate: new Date().toISOString().split('T')[0],
        includeAdjustments: true,
        includeZeroTransactions: false,
        vatRates: [5, 7, 15, 20, 25],
    });

    const [vatAccounts, setVatAccounts] = useState<{
        inputAccountId?: string;
        outputAccountId?: string;
        payableAccountId?: string;
        receivableAccountId?: string;
    }>({});

    const ITEMS_PER_PAGE = 10;

    // ✅ FIXED: Use 'vat-report' hook
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
    } = useReportExport('vat-report');

    // ============== Data Fetching ==============
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

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

            // Find VAT accounts
            const vatInput = accounts.find((a: any) =>
                a.name.toLowerCase().includes('vat input') ||
                a.name.toLowerCase().includes('input vat')
            );
            const vatOutput = accounts.find((a: any) =>
                a.name.toLowerCase().includes('vat output') ||
                a.name.toLowerCase().includes('output vat')
            );
            const vatPayable = accounts.find((a: any) =>
                a.name.toLowerCase().includes('vat payable') ||
                a.name.toLowerCase().includes('payable vat')
            );
            const vatReceivable = accounts.find((a: any) =>
                a.name.toLowerCase().includes('vat receivable') ||
                a.name.toLowerCase().includes('receivable vat')
            );

            setVatAccounts({
                inputAccountId: vatInput?.id,
                outputAccountId: vatOutput?.id,
                payableAccountId: vatPayable?.id,
                receivableAccountId: vatReceivable?.id,
            });

            // Create VAT transactions from invoices (Sales)
            const salesTransactions: VATTransaction[] = invoices
                .filter((inv: any) => {
                    const hasVAT = (inv.taxAmount > 0) || (inv.vatAmount > 0);
                    return hasVAT && inv.invoiceDate && inv.invoiceDate >= periodStart && inv.invoiceDate <= periodEnd;
                })
                .map((inv: any) => {
                    const vatAmount = inv.taxAmount || inv.vatAmount || 0;
                    const netAmount = inv.subTotal || inv.totalAmount - vatAmount || 0;
                    const vatRate = getVATRate(netAmount, vatAmount);

                    return {
                        id: `vat-${inv.id}`,
                        date: inv.invoiceDate || inv.dateAdd,
                        reference: inv.invoiceNumber || inv.id,
                        description: inv.notes || `Invoice ${inv.invoiceNumber}`,
                        type: 'Sales' as const,
                        vatRate,
                        vatAmount,
                        netAmount,
                        totalAmount: netAmount + vatAmount,
                        status: inv.status === 'Paid' ? 'Filed' : 'Pending',
                        period: inv.invoiceDate ? inv.invoiceDate.slice(0, 7) : filters.period,
                        invoiceId: inv.id,
                        customerName: inv.customerName || 'Unknown',
                        sourceType: 'Invoice' as const,
                        vatCategory: inv.vatCategory || 'Standard',
                    };
                });

            // Create VAT transactions from expenses (Purchases)
            const purchaseTransactions: VATTransaction[] = expenses
                .filter((exp: any) => {
                    const hasVAT = (exp.taxAmount > 0) || (exp.vatAmount > 0);
                    return hasVAT && exp.expenseDate && exp.expenseDate >= periodStart && exp.expenseDate <= periodEnd;
                })
                .map((exp: any) => {
                    const vatAmount = exp.taxAmount || exp.vatAmount || 0;
                    const netAmount = exp.amount || 0;
                    const vatRate = getVATRate(netAmount, vatAmount);

                    return {
                        id: `vat-${exp.id}`,
                        date: exp.expenseDate || exp.dateAdd,
                        reference: exp.reference || exp.id,
                        description: exp.description || 'Expense',
                        type: 'Purchase' as const,
                        vatRate,
                        vatAmount,
                        netAmount,
                        totalAmount: netAmount + vatAmount,
                        status: exp.status === 'Approved' ? 'Filed' : 'Pending',
                        period: exp.expenseDate ? exp.expenseDate.slice(0, 7) : filters.period,
                        expenseId: exp.id,
                        supplierName: exp.supplierName || 'Unknown',
                        sourceType: 'Expense' as const,
                        vatCategory: exp.vatCategory || 'Standard',
                    };
                });

            // Create VAT transactions from journal entries
            const journalTransactions: VATTransaction[] = [];
            journals.forEach((journal: any) => {
                if (journal.isPosted && journal.lines) {
                    journal.lines.forEach((line: any) => {
                        const account = accounts.find((a: any) => a.id === line.accountId);
                        if (account && (account.name.toLowerCase().includes('vat') || account.code.startsWith('22'))) {
                            const vatAmount = Math.abs(line.amount);
                            const isDebit = line.direction === 'Debit';

                            journalTransactions.push({
                                id: `vat-journal-${journal.id}-${line.accountId}`,
                                date: journal.date,
                                reference: journal.reference || journal.id,
                                description: journal.description || `VAT Journal Entry`,
                                type: isDebit ? 'Purchase' as const : 'Sales' as const,
                                vatRate: 15, // Default rate for journals
                                vatAmount,
                                netAmount: 0,
                                totalAmount: vatAmount,
                                status: 'Filed',
                                period: journal.date.slice(0, 7),
                                sourceType: 'Journal' as const,
                                vatCategory: 'Adjustment',
                                postedBy: journal.postedBy,
                                postedDate: journal.postedDate,
                            });
                        }
                    });
                }
            });

            let allTransactions = [...salesTransactions, ...purchaseTransactions, ...journalTransactions];

            // Filter by VAT rates if specified
            if (filters.vatRates.length > 0) {
                allTransactions = allTransactions.filter(t =>
                    filters.vatRates.includes(Math.round(t.vatRate))
                );
            }

            // Include/exclude adjustments
            if (!filters.includeAdjustments) {
                allTransactions = allTransactions.filter(t => t.vatCategory !== 'Adjustment');
            }

            // Include/exclude zero transactions
            if (!filters.includeZeroTransactions) {
                allTransactions = allTransactions.filter(t => Math.abs(t.vatAmount) > 0.01);
            }

            setTransactions(allTransactions);

            // Calculate summary for current period
            const periodTransactions = allTransactions.filter(t => t.period === filters.period);

            const sales = periodTransactions.filter(t => t.type === 'Sales' || t.type === 'Export');
            const purchases = periodTransactions.filter(t => t.type === 'Purchase');
            const imports = periodTransactions.filter(t => t.type === 'Import');
            const exports = periodTransactions.filter(t => t.type === 'Export');

            const totalSales = sales.reduce((sum, t) => sum + t.netAmount, 0);
            const totalPurchases = purchases.reduce((sum, t) => sum + t.netAmount, 0);
            const totalImports = imports.reduce((sum, t) => sum + t.netAmount, 0);
            const totalExports = exports.reduce((sum, t) => sum + t.netAmount, 0);
            const vatOnSales = sales.reduce((sum, t) => sum + t.vatAmount, 0);
            const vatOnPurchases = purchases.reduce((sum, t) => sum + t.vatAmount, 0);
            const vatOnImports = imports.reduce((sum, t) => sum + t.vatAmount, 0);
            const vatOnExports = exports.reduce((sum, t) => sum + t.vatAmount, 0);
            const netVatPayable = vatOnSales + vatOnImports - vatOnPurchases - vatOnExports;

            // Calculate VAT rate distribution
            const rateMap = new Map<number, { salesAmount: number; purchaseAmount: number; vatAmount: number }>();
            periodTransactions.forEach(t => {
                const rate = Math.round(t.vatRate);
                if (!rateMap.has(rate)) {
                    rateMap.set(rate, { salesAmount: 0, purchaseAmount: 0, vatAmount: 0 });
                }
                const entry = rateMap.get(rate)!;
                if (t.type === 'Sales' || t.type === 'Export') {
                    entry.salesAmount += t.netAmount;
                } else {
                    entry.purchaseAmount += t.netAmount;
                }
                entry.vatAmount += t.vatAmount;
            });

            const vatRateDistribution = Array.from(rateMap.entries()).map(([rate, data]) => ({
                rate,
                salesAmount: data.salesAmount,
                purchaseAmount: data.purchaseAmount,
                vatAmount: data.vatAmount,
            }));

            let previousNetVatPayable: number | undefined;
            let previousSummary: VATSummary | null = null;

            // Fetch comparison data if needed
            if (filters.compareWithPrevious || filters.compareWithPreviousYear) {
                let comparisonPeriod: string | null = null;

                if (filters.compareWithPrevious) {
                    comparisonPeriod = getPreviousPeriod(filters.period, filters.periodType);
                } else if (filters.compareWithPreviousYear) {
                    comparisonPeriod = getPreviousYearPeriod(filters.period);
                }

                if (comparisonPeriod) {
                    const { periodStart: prevStart, periodEnd: prevEnd } = getPeriodRange(comparisonPeriod, filters.periodType);

                    const [prevInvoicesRes, prevExpensesRes, prevJournalRes] = await Promise.all([
                        getInvoices(),
                        getExpenses(),
                        getJournalEntries({ fromDate: prevStart, toDate: prevEnd }),
                    ]);

                    const prevInvoices = prevInvoicesRes.data.data || prevInvoicesRes.data || [];
                    const prevExpenses = prevExpensesRes.data.data || prevExpensesRes.data || [];
                    const prevJournals = prevJournalRes.data.data || prevJournalRes.data || [];

                    // Calculate previous period summary
                    const prevSales = prevInvoices
                        .filter((inv: any) => (inv.taxAmount > 0 || inv.vatAmount > 0) && inv.invoiceDate && inv.invoiceDate >= prevStart && inv.invoiceDate <= prevEnd)
                        .reduce((sum: number, inv: any) => sum + (inv.taxAmount || inv.vatAmount || 0), 0);

                    const prevPurchases = prevExpenses
                        .filter((exp: any) => (exp.taxAmount > 0 || exp.vatAmount > 0) && exp.expenseDate && exp.expenseDate >= prevStart && exp.expenseDate <= prevEnd)
                        .reduce((sum: number, exp: any) => sum + (exp.taxAmount || exp.vatAmount || 0), 0);

                    // Calculate previous net VAT
                    const prevVatOnSales = prevSales;
                    const prevVatOnPurchases = prevPurchases;
                    previousNetVatPayable = prevVatOnSales - prevVatOnPurchases;

                    previousSummary = {
                        period: comparisonPeriod,
                        periodStart: prevStart,
                        periodEnd: prevEnd,
                        totalSales: 0,
                        totalPurchases: 0,
                        totalImports: 0,
                        totalExports: 0,
                        vatOnSales: prevVatOnSales,
                        vatOnPurchases: prevVatOnPurchases,
                        vatOnImports: 0,
                        vatOnExports: 0,
                        netVatPayable: previousNetVatPayable,
                        filingStatus: 'Pending',
                        vatRateDistribution: [],
                    };
                }
            }

            const change = previousNetVatPayable !== undefined ? netVatPayable - previousNetVatPayable : undefined;
            const changePercentage = previousNetVatPayable !== undefined && previousNetVatPayable !== 0
                ? (change! / Math.abs(previousNetVatPayable)) * 100
                : undefined;

            setSummary({
                period: filters.period,
                periodStart,
                periodEnd,
                totalSales,
                totalPurchases,
                totalImports,
                totalExports,
                vatOnSales,
                vatOnPurchases,
                vatOnImports,
                vatOnExports,
                netVatPayable,
                previousNetVatPayable,
                change,
                changePercentage,
                filingStatus: netVatPayable > 0 ? 'Pending' : 'Filed',
                vatRateDistribution,
            });

            setComparisonData({
                previousPeriod: previousSummary,
                previousYear: null,
            });

        } catch (error) {
            console.error('Error fetching VAT data:', error);
            showToast.error('Failed to load VAT data');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
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

    // ============== Filtering and Pagination ==============
    const filteredTransactions = useMemo(() => {
        let items = transactions;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            items = items.filter(t =>
                t.reference.toLowerCase().includes(term) ||
                t.description.toLowerCase().includes(term) ||
                (t.customerName || '').toLowerCase().includes(term) ||
                (t.supplierName || '').toLowerCase().includes(term) ||
                t.taxCode?.toLowerCase().includes(term)
            );
        }

        if (filterStatus !== 'All') {
            items = items.filter(t => t.status === filterStatus);
        }

        if (filterType !== 'All') {
            items = items.filter(t => t.type === filterType);
        }

        return items;
    }, [transactions, searchTerm, filterStatus, filterType]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterType]);

    // ============== Loading State ==============
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // ============== Empty State ==============
    if (!summary) {
        return (
            <div className="text-center py-12">
                <Percent className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No VAT Data Available</h3>
                <p className="text-gray-500">Run the report to see VAT transactions</p>
                <Button onClick={fetchData} className="mt-4 bg-purple-600 hover:bg-purple-700">
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
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Percent className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">VAT Management</h1>
                        <p className="text-sm text-gray-500">
                            Period: {summary.period}
                            <span className="ml-2 text-xs bg-purple-100 px-2 py-1 rounded-full text-purple-700">
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
                        onClick={() => handlePrintReport(summary)}
                        disabled={!summary}
                    >
                        <Printer size={16} />
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
                            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                        />
                    </div>

                    {/* Period Type */}
                    <div>
                        <Label className="text-sm font-medium">Period Type</Label>
                        <Select
                            value={filters.periodType}
                            onValueChange={(value: any) => setFilters({ ...filters, periodType: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select period type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">Monthly</SelectItem>
                                <SelectItem value="quarter">Quarterly</SelectItem>
                                <SelectItem value="year">Yearly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
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

                    {/* VAT Rates */}
                    <div>
                        <Label className="text-sm font-medium">VAT Rates</Label>
                        <Select
                            value={filters.vatRates.join(',')}
                            onValueChange={(value) => {
                                const rates = value === 'all' ? [] : value.split(',').map(Number);
                                setFilters({ ...filters, vatRates: rates });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select rates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Rates</SelectItem>
                                <SelectItem value="5,7,15,20,25">Standard (5%, 7%, 15%, 20%, 25%)</SelectItem>
                                <SelectItem value="15">15% Only</SelectItem>
                                <SelectItem value="7">7% Only</SelectItem>
                                <SelectItem value="5">5% Only</SelectItem>
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
                            className="h-4 w-4 text-purple-600 rounded border-gray-300"
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
                            className="h-4 w-4 text-purple-600 rounded border-gray-300"
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
                            className="h-4 w-4 text-purple-600 rounded border-gray-300"
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
                            className="h-4 w-4 text-purple-600 rounded border-gray-300"
                        />
                        <Label htmlFor="compareYear" className="cursor-pointer text-sm">
                            Compare with same period last year
                        </Label>
                    </div>
                    <Button
                        onClick={fetchData}
                        className="bg-purple-600 hover:bg-purple-700 ml-auto"
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
                        <strong>Period:</strong> {formatDate(summary.periodStart)} to {formatDate(summary.periodEnd)}
                    </span>
                    <span className="w-px h-4 bg-gray-300" />
                    <span>
                        <strong>Fiscal Year:</strong> {filters.fiscalYear}
                    </span>
                    <span className="w-px h-4 bg-gray-300" />
                    <span>
                        <strong>Transactions:</strong> {transactions.length}
                    </span>
                    {filters.includeAdjustments && (
                        <>
                            <span className="w-px h-4 bg-gray-300" />
                            <span className="text-purple-600">
                                <strong>Including:</strong> Adjustments
                            </span>
                        </>
                    )}
                    {showComparison && (
                        <>
                            <span className="w-px h-4 bg-gray-300" />
                            <span className="text-purple-600">
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
                                <p className="text-sm text-blue-700 font-medium">Total Sales (Net)</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.totalSales)}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Exports: {formatCurrency(summary.totalExports)}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Total Purchases (Net)</p>
                                <p className="text-2xl font-bold text-orange-900">{formatCurrency(summary.totalPurchases)}</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">Imports: {formatCurrency(summary.totalImports)}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">VAT on Sales</p>
                                <p className="text-2xl font-bold text-purple-900">{formatCurrency(summary.vatOnSales)}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Percent className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">VAT on Purchases: {formatCurrency(summary.vatOnPurchases)}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-teal-700 font-medium">Net VAT</p>
                                <p className={`text-2xl font-bold ${summary.netVatPayable >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatCurrency(Math.abs(summary.netVatPayable))}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${summary.netVatPayable >= 0 ? 'bg-red-200' : 'bg-green-200'}`}>
                                {summary.netVatPayable >= 0 ? (
                                    <TrendingUp className="h-6 w-6 text-red-700" />
                                ) : (
                                    <TrendingDown className="h-6 w-6 text-green-700" />
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            {summary.netVatPayable >= 0 ? 'Payable' : 'Refundable'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`bg-gradient-to-r ${summary.filingStatus === 'Filed' ? 'from-green-50 to-green-100 border-green-200' : 'from-yellow-50 to-yellow-100 border-yellow-200'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm ${summary.filingStatus === 'Filed' ? 'text-green-700' : 'text-yellow-700'} font-medium`}>
                                    Filing Status
                                </p>
                                <p className={`text-2xl font-bold ${summary.filingStatus === 'Filed' ? 'text-green-900' : 'text-yellow-900'}`}>
                                    {summary.filingStatus}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${summary.filingStatus === 'Filed' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                                {summary.filingStatus === 'Filed' ? (
                                    <CheckCircle className="h-6 w-6 text-green-700" />
                                ) : (
                                    <Clock className="h-6 w-6 text-yellow-700" />
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Period: {summary.period}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* VAT Rate Distribution */}
            {summary.vatRateDistribution.length > 0 && (
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            VAT Rate Distribution
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {summary.vatRateDistribution.map((item) => (
                                <div key={item.rate} className="bg-white rounded-lg p-3 border border-purple-200">
                                    <p className="text-sm font-semibold text-purple-700">{item.rate}% Rate</p>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-gray-500">Sales: {formatCurrency(item.salesAmount)}</p>
                                        <p className="text-xs text-gray-500">Purchases: {formatCurrency(item.purchaseAmount)}</p>
                                        <p className="text-xs font-medium text-purple-600">VAT: {formatCurrency(item.vatAmount)}</p>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div
                                                className="bg-purple-600 h-1.5 rounded-full"
                                                style={{
                                                    width: `${Math.min(100, (item.vatAmount / Math.max(summary.vatOnSales, summary.vatOnPurchases, 1)) * 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comparison Summary (if enabled) */}
            {showComparison && comparisonData?.previousPeriod && (
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-purple-800 mb-3">VAT Comparison Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Net VAT Change</p>
                                <p className={`font-bold ${getChangeColor(summary.change)}`}>
                                    {summary.change !== undefined && formatCurrency(summary.change)}
                                    <span className="ml-1">
                                        ({summary.changePercentage?.toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">VAT on Sales Change</p>
                                <p className={`font-bold ${getChangeColor(summary.vatOnSales - (comparisonData.previousPeriod?.vatOnSales || 0))}`}>
                                    {formatCurrency(summary.vatOnSales - (comparisonData.previousPeriod?.vatOnSales || 0))}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">VAT on Purchases Change</p>
                                <p className={`font-bold ${getChangeColor(summary.vatOnPurchases - (comparisonData.previousPeriod?.vatOnPurchases || 0))}`}>
                                    {formatCurrency(summary.vatOnPurchases - (comparisonData.previousPeriod?.vatOnPurchases || 0))}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Transaction Count Change</p>
                                <p className={`font-bold ${getChangeColor(transactions.length - (comparisonData.previousPeriod?.period ? 0 : 0))}`}>
                                    {transactions.length - (comparisonData.previousPeriod?.period ? 0 : 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search and Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Filed">Filed</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                        <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                        <FileText className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Purchase">Purchase</SelectItem>
                        <SelectItem value="Import">Import</SelectItem>
                        <SelectItem value="Export">Export</SelectItem>
                        <SelectItem value="Adjustment">Adjustment</SelectItem>
                    </SelectContent>
                </Select>
                <Badge variant="outline" className="text-sm">
                    {filteredTransactions.length} transactions
                </Badge>
            </div>

            {/* VAT Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">VAT Rate</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">VAT Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                    No VAT transactions found
                                </td>
                            </tr>
                        ) : (
                            paginatedTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{transaction.reference}</p>
                                            <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                                            <p className="text-xs text-gray-400">{transaction.sourceType}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{transaction.description}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            {getTypeIcon(transaction.type)}
                                            <Badge className={getTypeBadge(transaction.type)}>
                                                {transaction.type}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        {formatCurrency(transaction.netAmount)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-700">
                                        {transaction.vatRate.toFixed(1)}%
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-purple-600">
                                        {formatCurrency(transaction.vatAmount)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        {formatCurrency(transaction.totalAmount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(transaction.status)}>
                                            {transaction.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedTransaction(transaction);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                        <tr className="font-bold">
                            <td colSpan={3} className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                            <td className="px-4 py-3 text-sm text-right">
                                {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.netAmount, 0))}
                            </td>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 text-sm text-right text-purple-600">
                                {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.vatAmount, 0))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                                {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0))}
                            </td>
                            <td colSpan={2} className="px-4 py-3"></td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
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
                                        className={currentPage === pageNum ? 'bg-purple-600' : ''}
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
            </div>

            {/* File VAT Return Modal */}
            <Dialog open={isFileModalOpen} onOpenChange={setIsFileModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-600" />
                            File VAT Return
                        </DialogTitle>
                        <DialogDescription>
                            File VAT return for the selected period.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Period</Label>
                            <Input
                                type="month"
                                value={filters.period}
                                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                            />
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                            <p className="flex justify-between text-sm">
                                <span className="text-gray-500">VAT on Sales:</span>
                                <span className="font-medium text-purple-600">{formatCurrency(summary.vatOnSales)}</span>
                            </p>
                            <p className="flex justify-between text-sm">
                                <span className="text-gray-500">VAT on Purchases:</span>
                                <span className="font-medium text-orange-600">{formatCurrency(summary.vatOnPurchases)}</span>
                            </p>
                            <p className="flex justify-between text-sm">
                                <span className="text-gray-500">VAT on Imports:</span>
                                <span className="font-medium text-blue-600">{formatCurrency(summary.vatOnImports)}</span>
                            </p>
                            <p className="flex justify-between text-sm">
                                <span className="text-gray-500">VAT on Exports:</span>
                                <span className="font-medium text-green-600">{formatCurrency(summary.vatOnExports)}</span>
                            </p>
                            <p className="flex justify-between text-sm border-t border-gray-200 pt-2 font-bold">
                                <span>Net VAT {summary.netVatPayable >= 0 ? 'Payable' : 'Refundable'}:</span>
                                <span className={summary.netVatPayable >= 0 ? 'text-red-600' : 'text-green-600'}>
                                    {formatCurrency(Math.abs(summary.netVatPayable))}
                                </span>
                            </p>
                        </div>
                        <div>
                            <Label>Filing Reference</Label>
                            <Input placeholder="Enter filing reference" />
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Textarea placeholder="Additional notes" rows={2} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFileModalOpen(false)}>Cancel</Button>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                            showToast.success('VAT return filed successfully');
                            setIsFileModalOpen(false);
                        }}>
                            <FileText className="h-4 w-4 mr-2" />
                            File Return
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Transaction Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-purple-600" />
                            VAT Transaction Details
                        </DialogTitle>
                        <DialogDescription>
                            View VAT transaction information.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Reference</p>
                                    <p className="font-medium">{selectedTransaction.reference}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p>{formatDate(selectedTransaction.date)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p>{selectedTransaction.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge className={getTypeBadge(selectedTransaction.type)}>
                                        {selectedTransaction.type}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Source</p>
                                    <p className="text-sm">{selectedTransaction.sourceType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">VAT Rate</p>
                                    <p>{selectedTransaction.vatRate}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">VAT Category</p>
                                    <p>{selectedTransaction.vatCategory || 'Standard'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Net Amount</p>
                                    <p className="font-medium">{formatCurrency(selectedTransaction.netAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">VAT Amount</p>
                                    <p className="font-medium text-purple-600">{formatCurrency(selectedTransaction.vatAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="font-medium">{formatCurrency(selectedTransaction.totalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedTransaction.status)}>
                                        {selectedTransaction.status}
                                    </Badge>
                                </div>
                                {selectedTransaction.customerName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p>{selectedTransaction.customerName}</p>
                                    </div>
                                )}
                                {selectedTransaction.supplierName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Supplier</p>
                                        <p>{selectedTransaction.supplierName}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p>{selectedTransaction.period}</p>
                                </div>
                                {selectedTransaction.postedBy && (
                                    <div>
                                        <p className="text-sm text-gray-500">Posted By</p>
                                        <p>{selectedTransaction.postedBy}</p>
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

            {/* ✅ Export Modal - FIXED */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            {title || 'Export VAT Report'}
                        </DialogTitle>
                        <DialogDescription>
                            Export the VAT report in your preferred format.
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
                                    <>From {formatDate(summary.periodStart)} to {formatDate(summary.periodEnd)}</>
                                ) : (
                                    <>For the period ending {formatDate(summary.periodEnd)}</>
                                )}
                            </div>
                        </div>

                        {showComparison && comparisonData?.previousPeriod && (
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
                            onClick={() => handleExport(summary)}
                            disabled={exporting || !summary}
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

export default VATManagement;