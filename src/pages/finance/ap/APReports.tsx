// src/pages/finance/ap/APReports.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, RefreshCw, Download, Printer, Calendar,
    DollarSign, TrendingUp, TrendingDown, PieChart,
    FileText, Users, Clock, AlertCircle, CheckCircle,
    ChevronLeft, ChevronRight, Filter, Search,
    Building2, Eye, CreditCard, Wallet, Receipt,
    ArrowUpRight, ArrowDownRight, Banknote, Landmark,
    Calendar as CalendarIcon
} from 'lucide-react';
import {
    getPurchaseInvoices,
    getPurchasePayments,
    getVendors,
    getFinancialPeriods,
} from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';
import { useReportExport } from '../../../hooks/useReportExport';
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

interface VendorMap {
    [key: string]: string;
}

interface Period {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isClosed: boolean;
}

interface APReportData {
    period: string;
    periodName?: string;
    periodId?: string;
    totalPayables: number;
    currentPayables: number;
    overduePayables: number;
    totalPaid: number;
    totalPayments: number;
    averagePayment: number;
    paymentRate: number;
    avgDaysToPay: number;
    totalVendors: number;
    totalInvoices: number;
    aging: {
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
    topVendors: Array<{
        id: string;
        name: string;
        amount: number;
        invoiceCount: number;
        percentage: number;
    }>;
    topPaidVendors: Array<{
        id: string;
        name: string;
        amount: number;
        paymentCount: number;
        percentage: number;
    }>;
    monthlyTrend: Array<{
        month: string;
        amount: number;
        paid: number;
        balance: number;
    }>;
    statusBreakdown: {
        pending: number;
        partiallyPaid: number;
        approved: number;
        paid: number;
    };
    periodBreakdown?: {
        periodId: string;
        periodName: string;
        totalAmount: number;
        paidAmount: number;
        balanceAmount: number;
        invoiceCount: number;
    }[];
}

const APReports: React.FC = () => {
    const [reportData, setReportData] = useState<APReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
    const [periods, setPeriods] = useState<Period[]>([]);
    const [reportType, setReportType] = useState('aging');
    const [vendorMap, setVendorMap] = useState<VendorMap>({});

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
    } = useReportExport('ap-report');

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

            const vendorsRes = await getVendors();
            let vendorsData = [];
            if (vendorsRes.data) {
                if (Array.isArray(vendorsRes.data)) {
                    vendorsData = vendorsRes.data;
                } else if (vendorsRes.data.data && Array.isArray(vendorsRes.data.data)) {
                    vendorsData = vendorsRes.data.data;
                } else if (vendorsRes.data.$values && Array.isArray(vendorsRes.data.$values)) {
                    vendorsData = vendorsRes.data.$values;
                }
            }

            const vendorMapData: VendorMap = {};
            vendorsData.forEach((vendor: any) => {
                const id = vendor.id || vendor.vendorId;
                if (id) {
                    vendorMapData[id] = vendor.name || vendor.vendorName || vendor.displayName || 'Unknown Vendor';
                }
            });
            setVendorMap(vendorMapData);

            const params: any = {};
            if (selectedPeriodId) {
                params.periodId = selectedPeriodId;
            }

            const [invoicesRes, paymentsRes] = await Promise.all([
                getPurchaseInvoices(params),
                getPurchasePayments(params),
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

            const selectedPeriodObj = periods.find(p => p.id === selectedPeriodId);
            const periodName = selectedPeriodObj?.name || selectedPeriod;

            const totalPaid = payments.reduce((sum: number, p: any) => {
                return sum + Number(p.amount || p.total_amount || 0);
            }, 0);

            const totalPaymentsCount = payments.length;
            const averagePayment = totalPaymentsCount > 0 ? totalPaid / totalPaymentsCount : 0;

            const unpaidInvoices = invoices.filter((inv: any) => {
                const status = inv.status || inv.invoiceStatus || 'Draft';
                return status !== 'Paid' && status !== 'Cancelled' && status !== 'Rejected';
            });

            const totalPayables = unpaidInvoices.reduce((sum: number, inv: any) => {
                const total = Number(inv.totalAmount || inv.total_amount || 0);
                return sum + total;
            }, 0);

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

            const totalInvoiced = invoices.reduce((sum: number, inv: any) => {
                const total = Number(inv.totalAmount || inv.total_amount || 0);
                return sum + total;
            }, 0);

            const paymentRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

            const statusBreakdown = {
                pending: invoices.filter((inv: any) => {
                    const status = inv.status || inv.invoiceStatus;
                    return status === 'Pending' || status === 'Draft';
                }).length,
                partiallyPaid: invoices.filter((inv: any) => {
                    const status = inv.status || inv.invoiceStatus;
                    return status === 'Partially_Paid';
                }).length,
                approved: invoices.filter((inv: any) => {
                    const status = inv.status || inv.invoiceStatus;
                    return status === 'Approved';
                }).length,
                paid: invoices.filter((inv: any) => {
                    const status = inv.status || inv.invoiceStatus;
                    return status === 'Paid' || status === 'Completed';
                }).length,
            };

            const vendorTotals = new Map<string, { name: string; amount: number; count: number }>();
            unpaidInvoices.forEach((inv: any) => {
                const vendorId = inv.vendorId || inv.vendor_id || inv.supplierId;
                if (vendorId) {
                    if (!vendorTotals.has(vendorId)) {
                        vendorTotals.set(vendorId, {
                            name: vendorMapData[vendorId] || inv.vendorName || inv.vendor_name || 'Unknown Vendor',
                            amount: 0,
                            count: 0
                        });
                    }
                    const current = vendorTotals.get(vendorId)!;
                    current.amount += Number(inv.totalAmount || inv.total_amount || 0);
                    current.count++;
                }
            });

            const topVendors = Array.from(vendorTotals.values())
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((item) => ({
                    id: '',
                    name: item.name,
                    amount: item.amount,
                    invoiceCount: item.count,
                    percentage: totalPayables > 0 ? (item.amount / totalPayables) * 100 : 0,
                }));

            const vendorPaymentTotals = new Map<string, { name: string; amount: number; count: number }>();
            payments.forEach((p: any) => {
                const vendorId = p.vendorId || p.vendor_id || p.supplierId || p.toAccountId;
                if (vendorId) {
                    if (!vendorPaymentTotals.has(vendorId)) {
                        vendorPaymentTotals.set(vendorId, {
                            name: vendorMapData[vendorId] || p.vendorName || p.vendor_name || 'Unknown Vendor',
                            amount: 0,
                            count: 0
                        });
                    }
                    const current = vendorPaymentTotals.get(vendorId)!;
                    current.amount += Number(p.amount || p.total_amount || 0);
                    current.count++;
                }
            });

            const topPaidVendors = Array.from(vendorPaymentTotals.values())
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((item) => ({
                    id: '',
                    name: item.name,
                    amount: item.amount,
                    paymentCount: item.count,
                    percentage: totalPaid > 0 ? (item.amount / totalPaid) * 100 : 0,
                }));

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

                const paid = monthPayments.reduce((sum: number, p: any) => {
                    return sum + Number(p.amount || p.total_amount || 0);
                }, 0);

                monthlyTrend.push({
                    month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    amount,
                    paid,
                    balance: amount - paid,
                });
            }

            const periodBreakdownMap = new Map<string, { periodId: string; periodName: string; totalAmount: number; paidAmount: number; invoiceCount: number }>();

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
                            paidAmount: 0,
                            invoiceCount: 0
                        });
                    }
                    const current = periodBreakdownMap.get(invPeriodId)!;
                    const total = Number(inv.totalAmount || inv.total_amount || 0);
                    const paid = Number(inv.paidAmount || inv.paid_amount || 0);
                    current.totalAmount += total;
                    current.paidAmount += paid;
                    current.invoiceCount++;
                }
            });

            const periodBreakdown = Array.from(periodBreakdownMap.values())
                .sort((a, b) => b.totalAmount - a.totalAmount);

            setReportData({
                period: selectedPeriod,
                periodName: periodName,
                periodId: selectedPeriodId,
                totalPayables,
                currentPayables: totalPayables - overdueAmount,
                overduePayables: overdueAmount,
                totalPaid,
                totalPayments: totalPaymentsCount,
                averagePayment,
                paymentRate,
                avgDaysToPay: daysCount > 0 ? Math.round(totalDays / daysCount) : 0,
                totalVendors: vendorTotals.size,
                totalInvoices: unpaidInvoices.length,
                aging,
                topVendors,
                topPaidVendors,
                monthlyTrend,
                statusBreakdown,
                periodBreakdown,
            });

        } catch (error) {
            console.error('Error fetching AP report data:', error);
            showToast.error('Failed to load AP report data');
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Accounts Payable Reports</h1>
                        <p className="text-sm text-gray-500">Vendor payables and payment analytics</p>
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
                        <SelectItem value="payment">Payment Report</SelectItem>
                        <SelectItem value="vendor">Vendor Report</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    onClick={fetchData}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Generate Report
                </Button>
            </div>

            {/* Period Info Badge */}
            {reportData?.periodName && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-indigo-600" />
                    <div>
                        <span className="text-sm text-indigo-700 font-medium">Report Period:</span>
                        <span className="text-sm text-indigo-900 font-semibold ml-2">{reportData.periodName}</span>
                        {reportData.periodId && (
                            <span className="text-xs text-indigo-500 ml-2">ID: {reportData.periodId.substring(0, 8)}...</span>
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
                                    <p className="text-sm text-blue-700 font-medium">Total Payables</p>
                                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(reportData.totalPayables)}</p>
                                    <p className="text-xs text-blue-600 mt-1">{reportData.totalInvoices} invoices</p>
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
                                    <p className="text-sm text-emerald-700 font-medium">Total Paid</p>
                                    <p className="text-2xl font-bold text-emerald-900">{formatCurrency(reportData.totalPaid)}</p>
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
                                    <p className="text-2xl font-bold text-green-900">{formatCurrency(reportData.currentPayables)}</p>
                                    <p className="text-xs text-green-600 mt-1">Within payment terms</p>
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
                                    <p className="text-2xl font-bold text-red-900">{formatCurrency(reportData.overduePayables)}</p>
                                    <p className="text-xs text-red-600 mt-1">Avg {reportData.avgDaysToPay} days</p>
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
                                    <p className="text-sm text-purple-700 font-medium">Payment Rate</p>
                                    <p className="text-2xl font-bold text-purple-900">{reportData.paymentRate.toFixed(1)}%</p>
                                    <p className="text-xs text-purple-600 mt-1">{reportData.totalVendors} vendors</p>
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
                            <CalendarIcon className="h-5 w-5 text-indigo-500" />
                            Period Breakdown
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid Amount</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {reportData.periodBreakdown.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {item.periodName}
                                            {item.periodId === selectedPeriodId && (
                                                <Badge variant="outline" className="ml-2 text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                                    Current
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-600">{item.invoiceCount}</td>
                                        <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{formatCurrency(item.totalAmount)}</td>
                                        <td className="px-4 py-3 text-sm text-right text-emerald-600 font-medium">{formatCurrency(item.paidAmount)}</td>
                                        <td className={`px-4 py-3 text-sm text-right font-medium ${(item.totalAmount - item.paidAmount) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {formatCurrency(item.totalAmount - item.paidAmount)}
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-yellow-700 font-medium">Pending</p>
                                    <p className="text-lg font-bold text-yellow-900">{reportData.statusBreakdown.pending}</p>
                                </div>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-200 shadow-sm">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-orange-700 font-medium">Partially Paid</p>
                                    <p className="text-lg font-bold text-orange-900">{reportData.statusBreakdown.partiallyPaid}</p>
                                </div>
                                <Receipt className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200 shadow-sm">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-blue-700 font-medium">Approved</p>
                                    <p className="text-lg font-bold text-blue-900">{reportData.statusBreakdown.approved}</p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-50 border-emerald-200 shadow-sm">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-emerald-700 font-medium">Paid</p>
                                    <p className="text-lg font-bold text-emerald-900">{reportData.statusBreakdown.paid}</p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
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
                                {formatCurrency(reportData.totalPayables)} Total
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(reportData.aging).map(([period, amount]) => {
                                const percentage = reportData.totalPayables > 0 ? (amount / reportData.totalPayables) * 100 : 0;
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

            {/* Top Vendors */}
            {reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-500" />
                                Top Vendors by Payables
                            </h3>
                            <div className="space-y-3">
                                {reportData.topVendors.length > 0 ? (
                                    reportData.topVendors.map((vendor, index) => {
                                        const barColors = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];
                                        return (
                                            <div key={index} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${barColors[index % barColors.length]}`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-900 text-sm">{vendor.name}</span>
                                                        <span className="font-medium text-gray-900 text-sm">{formatCurrency(vendor.amount)}</span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-1.5 rounded-full ${barColors[index % barColors.length]} transition-all duration-500`}
                                                            style={{ width: `${Math.min(100, vendor.percentage)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">{vendor.invoiceCount} invoices • {vendor.percentage.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No vendor payables data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-emerald-500" />
                                Top Vendors by Payments
                            </h3>
                            <div className="space-y-3">
                                {reportData.topPaidVendors.length > 0 ? (
                                    reportData.topPaidVendors.map((vendor, index) => {
                                        const barColors = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500'];
                                        return (
                                            <div key={index} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${barColors[index % barColors.length]}`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-900 text-sm">{vendor.name}</span>
                                                        <span className="font-medium text-gray-900 text-sm">{formatCurrency(vendor.amount)}</span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-1.5 rounded-full ${barColors[index % barColors.length]} transition-all duration-500`}
                                                            style={{ width: `${Math.min(100, vendor.percentage)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">{vendor.paymentCount} payments • {vendor.percentage.toFixed(1)}%</p>
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
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payment %</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {reportData.monthlyTrend.map((item, index) => {
                                    const percentage = item.amount > 0 ? (item.paid / item.amount) * 100 : 0;
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.month}</td>
                                            <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{formatCurrency(item.amount)}</td>
                                            <td className="px-4 py-3 text-sm text-right text-emerald-600 font-medium">{formatCurrency(item.paid)}</td>
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
                            <Download className="h-5 w-5 text-indigo-600" />
                            {title || 'Export AP Report'}
                        </DialogTitle>
                        <DialogDescription>
                            Export the accounts payable report in your preferred format.
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
                            className="bg-indigo-600 hover:bg-indigo-700"
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

export default APReports;