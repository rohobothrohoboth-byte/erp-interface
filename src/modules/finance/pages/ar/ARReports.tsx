// src/pages/finance/ar/ARReports.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, RefreshCw, Download, Printer, Calendar,
    DollarSign, TrendingUp, TrendingDown, PieChart,
    FileText, Users, Clock, AlertCircle, CheckCircle,
    ChevronLeft, ChevronRight, Filter, Search,
    Building2, Eye, CreditCard, Wallet, Receipt,
    ArrowUpRight, ArrowDownRight, Banknote, Landmark,
    PercentCircle, Target, Award,
    Calendar as CalendarIcon
} from 'lucide-react';
import { getSalesInvoices, getSalesPayments, getCustomers, getFinancialPeriods } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { useReportExport } from '@/shared/hooks/useReportExport';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
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

interface Period {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isClosed: boolean;
}

interface ARReportData {
    period: string;
    periodName?: string;
    periodId?: string;
    totalReceivables: number;
    currentReceivables: number;
    overdueReceivables: number;
    collectionRate: number;
    avgDaysOutstanding: number;
    totalCollected: number;
    totalPayments: number;
    averagePayment: number;
    customerCount: number;
    invoiceCount: number;
    aging: {
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
    topCustomers: Array<{
        name: string;
        amount: number;
        invoiceCount: number;
        percentage: number;
        periodName?: string;
    }>;
    topPayingCustomers: Array<{
        name: string;
        amount: number;
        paymentCount: number;
        percentage: number;
        periodName?: string;
    }>;
    monthlyTrend: Array<{
        month: string;
        amount: number;
        collected: number;
        balance: number;
    }>;
    statusBreakdown: {
        draft: number;
        posted: number;
        paid: number;
        partiallyPaid: number;
        overdue: number;
    };
    periodBreakdown?: Array<{
        periodId: string;
        periodName: string;
        totalAmount: number;
        collectedAmount: number;
        balanceAmount: number;
        invoiceCount: number;
    }>;
}

const ARReports: React.FC = () => {
    const [reportData, setReportData] = useState<ARReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
    const [periods, setPeriods] = useState<Period[]>([]);
    const [reportType, setReportType] = useState('aging');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [customerMap, setCustomerMap] = useState<Record<string, string>>({});

    // ✅ Use the report export hook
    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen: isExportModalOpenHook,
        setIsExportModalOpen: setIsExportModalOpenHook,
        handlePrintReport,
        handleExport,
        handleRefresh,
        title,
    } = useReportExport('ar-report');

    // ✅ Fetch periods on mount
    useEffect(() => {
        fetchPeriods();
    }, []);

    // ✅ Fetch data when period changes
    useEffect(() => {
        if (selectedPeriodId) {
            fetchData();
        }
    }, [selectedPeriodId]);

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

            // Auto-select active period
            const active = data.find((p: any) => !p.isClosed);
            if (active) {
                setSelectedPeriodId(active.id);
                const startDate = new Date(active.startDate);
                setSelectedPeriod(startDate.toISOString().slice(0, 7));
            } else if (data.length > 0) {
                setSelectedPeriodId(data[0].id);
                const startDate = new Date(data[0].startDate);
                setSelectedPeriod(startDate.toISOString().slice(0, 7));
            }
        } catch (error) {
            console.error('Error fetching periods:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const selectedPeriodObj = periods.find(p => p.id === selectedPeriodId);
            const periodName = selectedPeriodObj?.name || selectedPeriod;

            const params: any = {};
            if (selectedPeriodId) {
                params.periodId = selectedPeriodId;
            }

            const [invoicesRes, paymentsRes, customersRes] = await Promise.all([
                getSalesInvoices(params),
                getSalesPayments(params),
                getCustomers(),
            ]);

            let invoices = [];
            if (invoicesRes.data) {
                if (Array.isArray(invoicesRes.data)) {
                    invoices = invoicesRes.data;
                } else if (invoicesRes.data.data && Array.isArray(invoicesRes.data.data)) {
                    invoices = invoicesRes.data.data;
                } else if (invoicesRes.data.$values && Array.isArray(invoicesRes.data.$values)) {
                    invoices = invoicesRes.data.$values;
                }
            }

            let payments = [];
            if (paymentsRes.data) {
                if (Array.isArray(paymentsRes.data)) {
                    payments = paymentsRes.data;
                } else if (paymentsRes.data.data && Array.isArray(paymentsRes.data.data)) {
                    payments = paymentsRes.data.data;
                } else if (paymentsRes.data.$values && Array.isArray(paymentsRes.data.$values)) {
                    payments = paymentsRes.data.$values;
                }
            }

            let customersData = [];
            if (customersRes.data) {
                if (Array.isArray(customersRes.data)) {
                    customersData = customersRes.data;
                } else if (customersRes.data.data && Array.isArray(customersRes.data.data)) {
                    customersData = customersRes.data.data;
                } else if (customersRes.data.$values && Array.isArray(customersRes.data.$values)) {
                    customersData = customersRes.data.$values;
                }
            }

            // Build customer map
            const customerMapData: Record<string, string> = {};
            customersData.forEach((c: any) => {
                const id = c.id || c.customerId;
                if (id) {
                    customerMapData[id] = c.name || c.customerName || c.displayName || 'Unknown Customer';
                }
            });
            setCustomerMap(customerMapData);

            // Calculate AR metrics
            const unpaidInvoices = invoices.filter((inv: any) => {
                const status = inv.status || 'Draft';
                return status !== 'Paid' && status !== 'Cancelled' && status !== 'Rejected';
            });

            const totalReceivables = unpaidInvoices.reduce((sum: number, inv: any) => {
                const total = Number(inv.totalAmount || inv.total_amount || 0);
                return sum + total;
            }, 0);

            // Calculate aging
            const today = new Date();
            const aging = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
            let overdueAmount = 0;
            let totalDays = 0;
            let daysCount = 0;

            unpaidInvoices.forEach((inv: any) => {
                const dueDate = new Date(inv.dueDate || inv.due_date || inv.invoiceDate || inv.invoice_date);
                const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                const amount = Number(inv.totalAmount || inv.total_amount || 0);

                if (daysOverdue > 90) {
                    aging['90+'] += amount;
                    overdueAmount += amount;
                } else if (daysOverdue > 60) {
                    aging['61-90'] += amount;
                    overdueAmount += amount;
                } else if (daysOverdue > 30) {
                    aging['31-60'] += amount;
                    overdueAmount += amount;
                } else if (daysOverdue > 0) {
                    aging['0-30'] += amount;
                    overdueAmount += amount;
                }

                if (daysOverdue > 0) {
                    totalDays += daysOverdue;
                    daysCount++;
                }
            });

            // Calculate collection rate
            const totalInvoiced = invoices.reduce((sum: number, inv: any) => {
                const total = Number(inv.totalAmount || inv.total_amount || 0);
                return sum + total;
            }, 0);

            const totalCollected = payments.reduce((sum: number, p: any) => {
                return sum + Number(p.amount || p.total_amount || 0);
            }, 0);

            const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0;

            // Status breakdown
            const statusBreakdown = {
                draft: invoices.filter((inv: any) => {
                    const status = inv.status || 'Draft';
                    return status === 'Draft';
                }).length,
                posted: invoices.filter((inv: any) => {
                    const status = inv.status || 'Draft';
                    return status === 'Posted';
                }).length,
                paid: invoices.filter((inv: any) => {
                    const status = inv.status || 'Draft';
                    return status === 'Paid';
                }).length,
                partiallyPaid: invoices.filter((inv: any) => {
                    const status = inv.status || 'Draft';
                    return status === 'Partially_Paid';
                }).length,
                overdue: invoices.filter((inv: any) => {
                    const status = inv.status || 'Draft';
                    const dueDate = new Date(inv.dueDate || inv.due_date || inv.invoiceDate || inv.invoice_date);
                    return status !== 'Paid' && dueDate < today;
                }).length,
            };

            // Top customers by receivables
            const customerTotals = new Map<string, { name: string; amount: number; count: number }>();
            unpaidInvoices.forEach((inv: any) => {
                const customerId = inv.customerId || inv.customer_id;
                if (customerId) {
                    if (!customerTotals.has(customerId)) {
                        customerTotals.set(customerId, {
                            name: customerMapData[customerId] || inv.customerName || inv.customer_name || 'Unknown',
                            amount: 0,
                            count: 0,
                        });
                    }
                    const current = customerTotals.get(customerId)!;
                    current.amount += Number(inv.totalAmount || inv.total_amount || 0);
                    current.count++;
                }
            });

            const topCustomers = Array.from(customerTotals.values())
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((item) => ({
                    name: item.name,
                    amount: item.amount,
                    invoiceCount: item.count,
                    percentage: totalReceivables > 0 ? (item.amount / totalReceivables) * 100 : 0,
                    periodName: periodName,
                }));

            // Top customers by payments
            const customerPaymentTotals = new Map<string, { name: string; amount: number; count: number }>();
            payments.forEach((p: any) => {
                const customerId = p.customerId || p.customer_id;
                if (customerId) {
                    if (!customerPaymentTotals.has(customerId)) {
                        customerPaymentTotals.set(customerId, {
                            name: customerMapData[customerId] || p.customerName || p.customer_name || 'Unknown',
                            amount: 0,
                            count: 0,
                        });
                    }
                    const current = customerPaymentTotals.get(customerId)!;
                    current.amount += Number(p.amount || p.total_amount || 0);
                    current.count++;
                }
            });

            const topPayingCustomers = Array.from(customerPaymentTotals.values())
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((item) => ({
                    name: item.name,
                    amount: item.amount,
                    paymentCount: item.count,
                    percentage: totalCollected > 0 ? (item.amount / totalCollected) * 100 : 0,
                    periodName: periodName,
                }));

            // Monthly trend
            const monthlyTrend = [];
            const now = new Date(selectedPeriod);
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                const monthInvoices = invoices.filter((inv: any) => {
                    const invDate = inv.invoiceDate || inv.invoice_date;
                    return invDate && new Date(invDate) >= monthStart && new Date(invDate) <= monthEnd;
                });

                const monthPayments = payments.filter((p: any) => {
                    const pDate = p.paymentDate || p.payment_date;
                    return pDate && new Date(pDate) >= monthStart && new Date(pDate) <= monthEnd;
                });

                const amount = monthInvoices.reduce((sum: number, inv: any) => {
                    return sum + Number(inv.totalAmount || inv.total_amount || 0);
                }, 0);

                const collected = monthPayments.reduce((sum: number, p: any) => {
                    return sum + Number(p.amount || p.total_amount || 0);
                }, 0);

                monthlyTrend.push({
                    month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    amount,
                    collected,
                    balance: amount - collected,
                });
            }

            // Period breakdown
            const periodBreakdownMap = new Map<string, { periodId: string; periodName: string; totalAmount: number; collectedAmount: number; invoiceCount: number }>();

            invoices.forEach((inv: any) => {
                const invPeriodId = inv.periodId || inv.PeriodId;
                if (invPeriodId) {
                    const invPeriod = periods.find(p => p.id === invPeriodId);
                    const periodName = invPeriod?.name || inv.periodName || inv.PeriodName || 'Unknown Period';

                    if (!periodBreakdownMap.has(invPeriodId)) {
                        periodBreakdownMap.set(invPeriodId, {
                            periodId: invPeriodId,
                            periodName: periodName,
                            totalAmount: 0,
                            collectedAmount: 0,
                            invoiceCount: 0
                        });
                    }
                    const current = periodBreakdownMap.get(invPeriodId)!;
                    const total = Number(inv.totalAmount || inv.total_amount || 0);
                    const paid = Number(inv.paidAmount || inv.paid_amount || 0);
                    current.totalAmount += total;
                    current.collectedAmount += paid;
                    current.invoiceCount++;
                }
            });

            const periodBreakdown = Array.from(periodBreakdownMap.values())
                .sort((a, b) => b.totalAmount - a.totalAmount);

            setReportData({
                period: selectedPeriod,
                periodName: periodName,
                periodId: selectedPeriodId,
                totalReceivables,
                currentReceivables: totalReceivables - overdueAmount,
                overdueReceivables: overdueAmount,
                collectionRate,
                avgDaysOutstanding: daysCount > 0 ? Math.round(totalDays / daysCount) : 0,
                totalCollected,
                totalPayments: payments.length,
                averagePayment: payments.length > 0 ? totalCollected / payments.length : 0,
                customerCount: customerTotals.size,
                invoiceCount: unpaidInvoices.length,
                aging,
                topCustomers,
                topPayingCustomers,
                monthlyTrend,
                statusBreakdown,
                periodBreakdown,
            });

        } catch (error) {
            console.error('Error fetching AR report data:', error);
            showToast.error('Failed to load AR report data');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        if (!amount || isNaN(amount)) return '$0.00';
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

    const getAgingColor = (period: string): string => {
        const colors = {
            '0-30': 'bg-blue-500',
            '31-60': 'bg-yellow-500',
            '61-90': 'bg-orange-500',
            '90+': 'bg-red-500',
        };
        return colors[period as keyof typeof colors] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Accounts Receivable Reports</h1>
                        <p className="text-sm text-gray-500">Customer receivables and collection analytics</p>
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
                        onClick={() => setIsExportModalOpenHook(true)}
                        disabled={exporting}
                    >
                        <Download size={16} />
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport(reportData)}
                        disabled={!reportData}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                </div>
            </div>

            {/* Period Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                    <Label className="font-medium text-gray-700">Financial Period:</Label>
                </div>
                <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                    <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        {periods.map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                                <div className="flex items-center gap-2">
                                    <span>{period.name}</span>
                                    {period.isClosed ? (
                                        <Badge variant="outline" className="text-xs text-red-500 border-red-200">Closed</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs text-green-500 border-green-200">Open</Badge>
                                    )}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="aging">Aging Report</SelectItem>
                        <SelectItem value="collection">Collection Report</SelectItem>
                        <SelectItem value="customer">Customer Report</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    onClick={fetchData}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Generate Report
                </Button>
            </div>

            {/* Period Info Badge */}
            {reportData?.periodName && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-emerald-600" />
                    <div>
                        <span className="text-sm text-emerald-700 font-medium">Report Period:</span>
                        <span className="text-sm text-emerald-900 font-semibold ml-2">{reportData.periodName}</span>
                        {reportData.periodId && (
                            <span className="text-xs text-emerald-500 ml-2">ID: {reportData.periodId.substring(0, 8)}...</span>
                        )}
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            {reportData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Total Receivables</p>
                                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(reportData.totalReceivables)}</p>
                                    <p className="text-xs text-blue-600 mt-1">{reportData.invoiceCount} invoices</p>
                                </div>
                                <div className="p-2.5 bg-blue-200 rounded-xl">
                                    <CreditCard className="h-5 w-5 text-blue-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-emerald-700 font-medium">Total Collected</p>
                                    <p className="text-2xl font-bold text-emerald-900">{formatCurrency(reportData.totalCollected)}</p>
                                    <p className="text-xs text-emerald-600 mt-1">{reportData.totalPayments} payments</p>
                                </div>
                                <div className="p-2.5 bg-emerald-200 rounded-xl">
                                    <Banknote className="h-5 w-5 text-emerald-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Current</p>
                                    <p className="text-2xl font-bold text-green-900">{formatCurrency(reportData.currentReceivables)}</p>
                                    <p className="text-xs text-green-600 mt-1">Not overdue</p>
                                </div>
                                <div className="p-2.5 bg-green-200 rounded-xl">
                                    <CheckCircle className="h-5 w-5 text-green-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-700 font-medium">Overdue</p>
                                    <p className="text-2xl font-bold text-red-900">{formatCurrency(reportData.overdueReceivables)}</p>
                                    <p className="text-xs text-red-600 mt-1">Avg {reportData.avgDaysOutstanding} days</p>
                                </div>
                                <div className="p-2.5 bg-red-200 rounded-xl">
                                    <AlertCircle className="h-5 w-5 text-red-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-700 font-medium">Collection Rate</p>
                                    <p className="text-2xl font-bold text-purple-900">{reportData.collectionRate.toFixed(1)}%</p>
                                    <p className="text-xs text-purple-600 mt-1">{reportData.customerCount} customers</p>
                                </div>
                                <div className="p-2.5 bg-purple-200 rounded-xl">
                                    <TrendingUp className="h-5 w-5 text-purple-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Period Breakdown */}
            {reportData?.periodBreakdown && reportData.periodBreakdown.length > 1 && (
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-emerald-500" />
                            Period Breakdown
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collected</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {reportData.periodBreakdown.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {item.periodName}
                                            {item.periodId === selectedPeriodId && (
                                                <Badge variant="outline" className="ml-2 text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                                    Current
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-600">{item.invoiceCount}</td>
                                        <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{formatCurrency(item.totalAmount)}</td>
                                        <td className="px-4 py-3 text-sm text-right text-emerald-600 font-medium">{formatCurrency(item.collectedAmount)}</td>
                                        <td className={`px-4 py-3 text-sm text-right font-medium ${(item.totalAmount - item.collectedAmount) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {formatCurrency(item.totalAmount - item.collectedAmount)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Status Breakdown */}
            {reportData && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Draft</p>
                                    <p className="text-lg font-bold text-gray-700">{reportData.statusBreakdown.draft}</p>
                                </div>
                                <FileText className="h-4 w-4 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-blue-600 font-medium">Posted</p>
                                    <p className="text-lg font-bold text-blue-700">{reportData.statusBreakdown.posted}</p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-yellow-600 font-medium">Partially Paid</p>
                                    <p className="text-lg font-bold text-yellow-700">{reportData.statusBreakdown.partiallyPaid}</p>
                                </div>
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-red-600 font-medium">Overdue</p>
                                    <p className="text-lg font-bold text-red-700">{reportData.statusBreakdown.overdue}</p>
                                </div>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-50 border-emerald-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-emerald-600 font-medium">Paid</p>
                                    <p className="text-lg font-bold text-emerald-700">{reportData.statusBreakdown.paid}</p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Aging Breakdown */}
            {reportData && (
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Aging Breakdown</h3>
                            <Badge variant="outline" className="text-xs">
                                {formatCurrency(reportData.totalReceivables)} Total
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(reportData.aging).map(([period, amount]) => {
                                const percentage = reportData.totalReceivables > 0 ? (amount / reportData.totalReceivables) * 100 : 0;
                                const color = getAgingColor(period);

                                return (
                                    <div key={period} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-600">{period} Days</p>
                                            <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</p>
                                        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-2 rounded-full ${color} transition-all duration-500`}
                                                style={{ width: `${Math.min(100, percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Top Customers */}
            {reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-500" />
                                Top Customers by Receivables
                            </h3>
                            <div className="space-y-3">
                                {reportData.topCustomers.map((customer, index) => {
                                    const barColors = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${barColors[index % barColors.length]}`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-gray-900 text-sm">{customer.name}</span>
                                                    <span className="font-medium text-gray-900 text-sm">{formatCurrency(customer.amount)}</span>
                                                </div>
                                                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-1.5 rounded-full ${barColors[index % barColors.length]} transition-all duration-500`}
                                                        style={{ width: `${Math.min(100, customer.percentage)}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{customer.invoiceCount} invoices • {customer.percentage.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-emerald-500" />
                                Top Customers by Payments
                            </h3>
                            <div className="space-y-3">
                                {reportData.topPayingCustomers.length > 0 ? (
                                    reportData.topPayingCustomers.map((customer, index) => {
                                        const barColors = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500'];
                                        return (
                                            <div key={index} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${barColors[index % barColors.length]}`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-900 text-sm">{customer.name}</span>
                                                        <span className="font-medium text-gray-900 text-sm">{formatCurrency(customer.amount)}</span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-1.5 rounded-full ${barColors[index % barColors.length]} transition-all duration-500`}
                                                            style={{ width: `${Math.min(100, customer.percentage)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">{customer.paymentCount} payments • {customer.percentage.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No payment data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Monthly Trend */}
            {reportData && (
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoiced</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collected</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collection %</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {reportData.monthlyTrend.map((item, index) => {
                                    const percentage = item.amount > 0 ? (item.collected / item.amount) * 100 : 0;
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.month}</td>
                                            <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{formatCurrency(item.amount)}</td>
                                            <td className="px-4 py-3 text-sm text-right text-emerald-600 font-medium">{formatCurrency(item.collected)}</td>
                                            <td className={`px-4 py-3 text-sm text-right font-medium ${item.balance >= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {formatCurrency(item.balance)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                            percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                                                        {percentage.toFixed(1)}%
                                                    </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ✅ Export Modal - Using useReportExport hook */}
            <Dialog open={isExportModalOpenHook} onOpenChange={setIsExportModalOpenHook}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-emerald-600" />
                            {title || 'Export AR Report'}
                        </DialogTitle>
                        <DialogDescription>
                            Export the accounts receivable report in your preferred format.
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
                                {reportData?.periodName || selectedPeriod || 'N/A'}
                            </div>
                        </div>

                        {reportData?.periodId && (
                            <div>
                                <Label>Period ID</Label>
                                <div className="text-sm text-gray-500 font-mono">
                                    {reportData.periodId}
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
                        <Button variant="outline" onClick={() => setIsExportModalOpenHook(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleExport(reportData)}
                            disabled={exporting || !reportData}
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

export default ARReports;