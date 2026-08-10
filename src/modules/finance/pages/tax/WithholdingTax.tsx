// src/pages/finance/tax/WithholdingTax.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, RefreshCw, Search, Filter, Eye, Edit,
    Plus, DollarSign, Calendar, Building2, FileText,
    ChevronLeft, ChevronRight, MoreVertical, Save, X,
    AlertCircle, CheckCircle, TrendingUp, TrendingDown,
    Download, Printer, Clock, Users, Briefcase,
    ArrowUp, ArrowDown, Minus, User, Building,
    CreditCard, Landmark, Package, Zap, Coffee,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { getInvoices, getExpenses, getAccounts, getJournalEntries } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
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
interface WithholdingTaxTransaction {
    id: string;
    date: string;
    reference: string;
    description: string;
    type: 'Vendor' | 'Contractor' | 'Employee' | 'Consultant' | 'Other';
    taxRate: number;
    taxAmount: number;
    grossAmount: number;
    netAmount: number;
    status: 'Pending' | 'Filed' | 'Paid' | 'Overdue' | 'Refunded';
    period: string;
    periodStart: string;
    periodEnd: string;
    vendorName?: string;
    contractorName?: string;
    employeeName?: string;
    consultantName?: string;
    taxCode?: string;
    invoiceId?: string;
    expenseId?: string;
    sourceType: 'Invoice' | 'Expense' | 'Journal' | 'Manual';
    postedBy?: string;
    postedDate?: string;
    previousTaxAmount?: number;
    change?: number;
    changePercentage?: number;
    withholdingType: 'Regular' | 'Final' | 'Creditable';
}

interface WithholdingTaxSummary {
    period: string;
    periodStart: string;
    periodEnd: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    totalGross: number;
    totalTax: number;
    totalNet: number;
    previousTotalTax?: number;
    change?: number;
    changePercentage?: number;
    filingStatus: 'Pending' | 'Filed' | 'Overdue' | 'Refunded';
    filingDate?: string;
    paymentDate?: string;
    filingReference?: string;
    byType: {
        vendor: number;
        contractor: number;
        employee: number;
        consultant: number;
        other: number;
    };
    byRate: {
        rate: number;
        amount: number;
        count: number;
    }[];
    topPayees: {
        name: string;
        type: string;
        taxAmount: number;
        count: number;
    }[];
}

interface WHTComparisonData {
    previousPeriod: WithholdingTaxSummary | null;
    previousYear: WithholdingTaxSummary | null;
}

interface PeriodFilters {
    period: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    fiscalYear: string;
    compareWithPrevious: boolean;
    compareWithPreviousYear: boolean;
    customStartDate?: string;
    customEndDate?: string;
    includePaid: boolean;
    includePending: boolean;
    includeFiled: boolean;
    withholdingTypes: string[];
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
        Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Filed: 'bg-green-100 text-green-700 border-green-200',
        Paid: 'bg-blue-100 text-blue-700 border-blue-200',
        Overdue: 'bg-red-100 text-red-700 border-red-200',
        Refunded: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
};

const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        Vendor: 'bg-blue-100 text-blue-700',
        Contractor: 'bg-orange-100 text-orange-700',
        Employee: 'bg-green-100 text-green-700',
        Consultant: 'bg-purple-100 text-purple-700',
        Other: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
};

const getTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
        case 'Vendor': return <Building className="h-4 w-4" />;
        case 'Contractor': return <Briefcase className="h-4 w-4" />;
        case 'Employee': return <User className="h-4 w-4" />;
        case 'Consultant': return <Users className="h-4 w-4" />;
        default: return <Building2 className="h-4 w-4" />;
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
const WithholdingTax: React.FC = () => {
    // State
    const [transactions, setTransactions] = useState<WithholdingTaxTransaction[]>([]);
    const [summary, setSummary] = useState<WithholdingTaxSummary | null>(null);
    const [comparisonData, setComparisonData] = useState<WHTComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<WithholdingTaxTransaction | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [filters, setFilters] = useState<PeriodFilters>({
        period: new Date().toISOString().slice(0, 7),
        periodType: 'month',
        fiscalYear: new Date().getFullYear().toString(),
        compareWithPrevious: false,
        compareWithPreviousYear: false,
        customStartDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        customEndDate: new Date().toISOString().split('T')[0],
        includePaid: true,
        includePending: true,
        includeFiled: true,
        withholdingTypes: ['Regular', 'Final', 'Creditable'],
    });

    const [sortConfig, setSortConfig] = useState<{
        key: keyof WithholdingTaxTransaction | null;
        direction: 'asc' | 'desc';
    }>({ key: null, direction: 'asc' });

    const ITEMS_PER_PAGE = 10;

    // ✅ FIXED: Use 'wht-report' instead of 'vat-report'
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
    } = useReportExport('wht-report');

    const taxRates = [
        { value: 2, label: '2% - Professional Services' },
        { value: 5, label: '5% - Contractors' },
        { value: 10, label: '10% - Consultants' },
        { value: 15, label: '15% - Rent' },
        { value: 30, label: '30% - Interest & Dividends' },
    ];

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

            // Find WHT accounts
            const whtPayable = accounts.find((a: any) =>
                a.name.toLowerCase().includes('withholding tax payable') ||
                a.name.toLowerCase().includes('wht payable')
            );

            // Create withholding tax transactions from invoices
            const invoiceTransactions: WithholdingTaxTransaction[] = invoices
                .filter((inv: any) => {
                    const hasWHT = (inv.withholdingTax > 0) || (inv.whtAmount > 0);
                    return hasWHT && inv.invoiceDate && inv.invoiceDate >= periodStart && inv.invoiceDate <= periodEnd;
                })
                .map((inv: any) => {
                    const taxAmount = inv.withholdingTax || inv.whtAmount || 0;
                    const grossAmount = inv.totalAmount || 0;
                    const taxRate = inv.withholdingTaxRate || 10;

                    return {
                        id: `wht-${inv.id}`,
                        date: inv.invoiceDate || inv.dateAdd,
                        reference: inv.invoiceNumber || inv.id,
                        description: inv.notes || `Invoice ${inv.invoiceNumber}`,
                        type: inv.customerType === 'Vendor' ? 'Vendor' :
                            inv.customerType === 'Contractor' ? 'Contractor' :
                                inv.customerType === 'Consultant' ? 'Consultant' : 'Other',
                        taxRate,
                        taxAmount,
                        grossAmount,
                        netAmount: grossAmount - taxAmount,
                        status: inv.status === 'Paid' ? 'Filed' : 'Pending',
                        period: inv.invoiceDate ? inv.invoiceDate.slice(0, 7) : filters.period,
                        periodStart,
                        periodEnd,
                        vendorName: inv.vendorName || inv.customerName || 'Unknown',
                        invoiceId: inv.id,
                        sourceType: 'Invoice' as const,
                        withholdingType: inv.withholdingType || 'Regular',
                        postedBy: inv.postedBy,
                        postedDate: inv.postedDate,
                    };
                });

            // Create withholding tax transactions from expenses
            const expenseTransactions: WithholdingTaxTransaction[] = expenses
                .filter((exp: any) => {
                    const hasWHT = (exp.withholdingTax > 0) || (exp.whtAmount > 0);
                    return hasWHT && exp.expenseDate && exp.expenseDate >= periodStart && exp.expenseDate <= periodEnd;
                })
                .map((exp: any) => {
                    const taxAmount = exp.withholdingTax || exp.whtAmount || 0;
                    const grossAmount = exp.amount || 0;
                    const taxRate = exp.withholdingTaxRate || 10;

                    return {
                        id: `wht-${exp.id}`,
                        date: exp.expenseDate || exp.dateAdd,
                        reference: exp.reference || exp.id,
                        description: exp.description || 'Expense',
                        type: exp.supplierType === 'Vendor' ? 'Vendor' :
                            exp.supplierType === 'Contractor' ? 'Contractor' :
                                exp.supplierType === 'Consultant' ? 'Consultant' : 'Other',
                        taxRate,
                        taxAmount,
                        grossAmount,
                        netAmount: grossAmount - taxAmount,
                        status: exp.status === 'Approved' ? 'Filed' : 'Pending',
                        period: exp.expenseDate ? exp.expenseDate.slice(0, 7) : filters.period,
                        periodStart,
                        periodEnd,
                        vendorName: exp.supplierName || 'Unknown',
                        expenseId: exp.id,
                        sourceType: 'Expense' as const,
                        withholdingType: exp.withholdingType || 'Regular',
                        postedBy: exp.postedBy,
                        postedDate: exp.postedDate,
                    };
                });

            // Create withholding tax transactions from journal entries
            const journalTransactions: WithholdingTaxTransaction[] = [];
            journals.forEach((journal: any) => {
                if (journal.isPosted && journal.lines) {
                    journal.lines.forEach((line: any) => {
                        const account = accounts.find((a: any) => a.id === line.accountId);
                        if (account && (account.name.toLowerCase().includes('withholding tax') ||
                            account.code.startsWith('228'))) {
                            const taxAmount = Math.abs(line.amount);
                            const isDebit = line.direction === 'Debit';

                            journalTransactions.push({
                                id: `wht-journal-${journal.id}-${line.accountId}`,
                                date: journal.date,
                                reference: journal.reference || journal.id,
                                description: journal.description || `WHT Journal Entry`,
                                type: 'Other',
                                taxRate: 10,
                                taxAmount,
                                grossAmount: taxAmount * 10, // Estimate
                                netAmount: taxAmount * 9,
                                status: 'Filed',
                                period: journal.date.slice(0, 7),
                                periodStart,
                                periodEnd,
                                sourceType: 'Journal' as const,
                                withholdingType: 'Regular',
                                postedBy: journal.postedBy,
                                postedDate: journal.postedDate,
                            });
                        }
                    });
                }
            });

            let allTransactions = [...invoiceTransactions, ...expenseTransactions, ...journalTransactions];

            // Filter by status
            if (!filters.includePaid) {
                allTransactions = allTransactions.filter(t => t.status !== 'Paid');
            }
            if (!filters.includePending) {
                allTransactions = allTransactions.filter(t => t.status !== 'Pending');
            }
            if (!filters.includeFiled) {
                allTransactions = allTransactions.filter(t => t.status !== 'Filed');
            }

            // Filter by withholding type
            if (filters.withholdingTypes.length > 0) {
                allTransactions = allTransactions.filter(t =>
                    filters.withholdingTypes.includes(t.withholdingType)
                );
            }

            setTransactions(allTransactions);

            // Calculate summary
            const periodTransactions = allTransactions.filter(t => t.period === filters.period);

            const totalGross = periodTransactions.reduce((sum, t) => sum + t.grossAmount, 0);
            const totalTax = periodTransactions.reduce((sum, t) => sum + t.taxAmount, 0);
            const totalNet = periodTransactions.reduce((sum, t) => sum + t.netAmount, 0);

            const byType = {
                vendor: periodTransactions.filter(t => t.type === 'Vendor').reduce((sum, t) => sum + t.taxAmount, 0),
                contractor: periodTransactions.filter(t => t.type === 'Contractor').reduce((sum, t) => sum + t.taxAmount, 0),
                employee: periodTransactions.filter(t => t.type === 'Employee').reduce((sum, t) => sum + t.taxAmount, 0),
                consultant: periodTransactions.filter(t => t.type === 'Consultant').reduce((sum, t) => sum + t.taxAmount, 0),
                other: periodTransactions.filter(t => t.type === 'Other').reduce((sum, t) => sum + t.taxAmount, 0),
            };

            // Calculate by rate
            const rateMap = new Map<number, { amount: number; count: number }>();
            periodTransactions.forEach(t => {
                if (!rateMap.has(t.taxRate)) {
                    rateMap.set(t.taxRate, { amount: 0, count: 0 });
                }
                const entry = rateMap.get(t.taxRate)!;
                entry.amount += t.taxAmount;
                entry.count++;
            });
            const byRate = Array.from(rateMap.entries()).map(([rate, data]) => ({
                rate,
                amount: data.amount,
                count: data.count,
            })).sort((a, b) => b.amount - a.amount);

            // Calculate top payees
            const payeeMap = new Map<string, { name: string; type: string; taxAmount: number; count: number }>();
            periodTransactions.forEach(t => {
                const name = t.vendorName || t.contractorName || t.employeeName || t.consultantName || 'Unknown';
                const key = `${name}-${t.type}`;
                if (!payeeMap.has(key)) {
                    payeeMap.set(key, { name, type: t.type, taxAmount: 0, count: 0 });
                }
                const entry = payeeMap.get(key)!;
                entry.taxAmount += t.taxAmount;
                entry.count++;
            });
            const topPayees = Array.from(payeeMap.values())
                .sort((a, b) => b.taxAmount - a.taxAmount)
                .slice(0, 5);

            let previousTotalTax: number | undefined;
            let previousSummary: WithholdingTaxSummary | null = null;

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

                    const [prevInvoicesRes, prevExpensesRes] = await Promise.all([
                        getInvoices(),
                        getExpenses(),
                    ]);

                    const prevInvoices = prevInvoicesRes.data.data || prevInvoicesRes.data || [];
                    const prevExpenses = prevExpensesRes.data.data || prevExpensesRes.data || [];

                    const prevPeriodInvoices = prevInvoices.filter((inv: any) =>
                        inv.invoiceDate && inv.invoiceDate >= prevStart && inv.invoiceDate <= prevEnd &&
                        (inv.withholdingTax > 0 || inv.whtAmount > 0)
                    );
                    const prevPeriodExpenses = prevExpenses.filter((exp: any) =>
                        exp.expenseDate && exp.expenseDate >= prevStart && exp.expenseDate <= prevEnd &&
                        (exp.withholdingTax > 0 || exp.whtAmount > 0)
                    );

                    const prevTotalTax =
                        prevPeriodInvoices.reduce((sum: number, inv: any) => sum + (inv.withholdingTax || inv.whtAmount || 0), 0) +
                        prevPeriodExpenses.reduce((sum: number, exp: any) => sum + (exp.withholdingTax || exp.whtAmount || 0), 0);

                    previousTotalTax = prevTotalTax;

                    previousSummary = {
                        period: comparisonPeriod,
                        periodStart: prevStart,
                        periodEnd: prevEnd,
                        periodType: filters.periodType,
                        totalGross: 0,
                        totalTax: prevTotalTax,
                        totalNet: 0,
                        filingStatus: 'Pending',
                        byType: { vendor: 0, contractor: 0, employee: 0, consultant: 0, other: 0 },
                        byRate: [],
                        topPayees: [],
                    };
                }
            }

            const change = previousTotalTax !== undefined ? totalTax - previousTotalTax : undefined;
            const changePercentage = previousTotalTax !== undefined && previousTotalTax !== 0
                ? (change! / Math.abs(previousTotalTax)) * 100
                : undefined;

            setSummary({
                period: filters.period,
                periodStart,
                periodEnd,
                periodType: filters.periodType,
                totalGross,
                totalTax,
                totalNet,
                previousTotalTax,
                change,
                changePercentage,
                filingStatus: totalTax > 0 ? 'Pending' : 'Filed',
                byType,
                byRate,
                topPayees,
            });

            setComparisonData({
                previousPeriod: previousSummary,
                previousYear: null,
            });

        } catch (error) {
            console.error('Error fetching withholding tax data:', error);
            showToast.error('Failed to load withholding tax data');
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

    const handleSort = (key: keyof WithholdingTaxTransaction) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    // ============== Filtering and Pagination ==============
    const filteredTransactions = useMemo(() => {
        let items = transactions;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            items = items.filter(t =>
                t.reference.toLowerCase().includes(term) ||
                t.description.toLowerCase().includes(term) ||
                (t.vendorName || '').toLowerCase().includes(term) ||
                (t.contractorName || '').toLowerCase().includes(term) ||
                t.taxCode?.toLowerCase().includes(term)
            );
        }

        if (filterStatus !== 'All') {
            items = items.filter(t => t.status === filterStatus);
        }

        if (filterType !== 'All') {
            items = items.filter(t => t.type === filterType);
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
    }, [transactions, searchTerm, filterStatus, filterType, sortConfig]);

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // ============== Empty State ==============
    if (!summary) {
        return (
            <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No Withholding Tax Data</h3>
                <p className="text-gray-500">Run the report to see withholding tax transactions</p>
                <Button onClick={fetchData} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Report
                </Button>
            </div>
        );
    }

    const showComparison = filters.compareWithPrevious || filters.compareWithPreviousYear;
    const reportData = summary; // ✅ Alias for export modal

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
                        <Shield className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Withholding Tax</h1>
                        <p className="text-sm text-gray-500">
                            Period: {summary.period}
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

                    {/* Withholding Types */}
                    <div>
                        <Label className="text-sm font-medium">Withholding Types</Label>
                        <Select
                            value={filters.withholdingTypes.join(',')}
                            onValueChange={(value) => {
                                const types = value === 'all' ? [] : value.split(',');
                                setFilters({ ...filters, withholdingTypes: types });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Regular">Regular</SelectItem>
                                <SelectItem value="Final">Final</SelectItem>
                                <SelectItem value="Creditable">Creditable</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Options and Comparison */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includePaid"
                            checked={filters.includePaid}
                            onChange={(e) => setFilters({
                                ...filters,
                                includePaid: e.target.checked
                            })}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <Label htmlFor="includePaid" className="cursor-pointer text-sm">
                            Include Paid
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includePending"
                            checked={filters.includePending}
                            onChange={(e) => setFilters({
                                ...filters,
                                includePending: e.target.checked
                            })}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <Label htmlFor="includePending" className="cursor-pointer text-sm">
                            Include Pending
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includeFiled"
                            checked={filters.includeFiled}
                            onChange={(e) => setFilters({
                                ...filters,
                                includeFiled: e.target.checked
                            })}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <Label htmlFor="includeFiled" className="cursor-pointer text-sm">
                            Include Filed
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
                    <span className="w-px h-4 bg-gray-300" />
                    <span>
                        <strong>Status:</strong>
                        <Badge className={`ml-1 ${getStatusColor(summary.filingStatus)}`}>
                            {summary.filingStatus}
                        </Badge>
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* ... keep your existing summary cards ... */}
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Gross</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.totalGross)}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">{transactions.length} transactions</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total Withholding Tax</p>
                                <p className="text-2xl font-bold text-purple-900">{formatCurrency(summary.totalTax)}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Shield className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                        {showComparison && summary.change !== undefined && (
                            <p className={`text-xs font-medium ${getChangeColor(summary.change)} mt-1`}>
                                {getChangeIcon(summary.change)}
                                {formatCurrency(summary.change)} ({summary.changePercentage?.toFixed(1)}%)
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Net Amount</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.totalNet)}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 mt-1">After withholding tax</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">By Type</p>
                                <div className="space-y-0.5 mt-1">
                                    <p className="text-xs">
                                        Vendor: <span className="font-medium">{formatCurrency(summary.byType.vendor)}</span>
                                    </p>
                                    <p className="text-xs">
                                        Contractor: <span className="font-medium">{formatCurrency(summary.byType.contractor)}</span>
                                    </p>
                                    <p className="text-xs">
                                        Consultant: <span className="font-medium">{formatCurrency(summary.byType.consultant)}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <Users className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* By Rate and Top Payees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ... keep your existing By Rate and Top Payees sections ... */}
            </div>

            {/* Comparison Summary */}
            {showComparison && comparisonData?.previousPeriod && (
                <Card className="border-indigo-200 bg-indigo-50">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-indigo-800 mb-3">Withholding Tax Comparison Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Total Tax Change</p>
                                <p className={`font-bold ${getChangeColor(summary.change)}`}>
                                    {summary.change !== undefined && formatCurrency(summary.change)}
                                    <span className="ml-1">
                                        ({summary.changePercentage?.toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Previous Period</p>
                                <p className="font-medium text-gray-900">{comparisonData.previousPeriod.period}</p>
                                <p className="text-xs text-gray-500">Tax: {formatCurrency(comparisonData.previousPeriod.totalTax)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Gross Amount Change</p>
                                <p className={`font-bold ${getChangeColor(summary.totalGross - (comparisonData.previousPeriod?.totalGross || 0))}`}>
                                    {formatCurrency(summary.totalGross - (comparisonData.previousPeriod?.totalGross || 0))}
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
                        <Users className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Vendor">Vendor</SelectItem>
                        <SelectItem value="Contractor">Contractor</SelectItem>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Consultant">Consultant</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Badge variant="outline" className="text-sm">
                    {filteredTransactions.length} transactions
                </Badge>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* ... keep your existing table ... */}
            </div>

            {/* File Return Modal */}
            <Dialog open={isFileModalOpen} onOpenChange={setIsFileModalOpen}>
                {/* ... keep your existing file modal ... */}
            </Dialog>

            {/* View Transaction Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                {/* ... keep your existing view modal ... */}
            </Dialog>

            {/* ✅ Export Modal - FIXED */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            {title || 'Export Withholding Tax Report'}
                        </DialogTitle>
                        <DialogDescription>
                            Export the withholding tax report in your preferred format.
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

export default WithholdingTax;