// src/pages/finance/ar/CollectionFollowup.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, RefreshCw, Search, Filter, Eye, Edit,
    Phone, Mail, Clock, DollarSign, Calendar,
    ChevronLeft, ChevronRight, MoreVertical, Download,
    AlertCircle, CheckCircle, TrendingUp, TrendingDown,
    FileText, Send, MessageSquare, User, Building2,
    PhoneCall, MailOpen, Clock as ClockIcon, Plus,
    Save, X, Trash2, Bell, BellRing, Flag, Star,
    Award, Target, BarChart3, PieChart,
    Calendar as CalendarIcon
} from 'lucide-react';
import { getSalesInvoices, getCustomers, getSalesPayments, getFinancialPeriods } from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { useReportExport } from '../../../hooks/useReportExport';
import { Printer } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';
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

interface CollectionCustomer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    totalOutstanding: number;
    overdueAmount: number;
    invoiceCount: number;
    daysOverdue: number;
    lastPaymentDate?: string;
    aging: {
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
    status: 'Current' | 'Overdue' | 'Critical';
    contactPerson?: string;
    notes?: string[];
    collectionScore?: number;
    riskLevel?: 'Low' | 'Medium' | 'High';
    periodId?: string;  // ✅ Added
    periodName?: string;  // ✅ Added
}

interface CollectionActivity {
    id: string;
    date: string;
    type: 'Call' | 'Email' | 'Note' | 'Payment' | 'Promise';
    description: string;
    customerId: string;
    customerName: string;
    status: 'Pending' | 'Completed' | 'Scheduled';
    followUpDate?: string;
    createdBy?: string;
    periodId?: string;  // ✅ Added
    periodName?: string;  // ✅ Added
}

interface Period {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isClosed: boolean;
}

const CollectionFollowup: React.FC = () => {
    const [customers, setCustomers] = useState<CollectionCustomer[]>([]);
    const [activities, setActivities] = useState<CollectionActivity[]>([]);
    const [periods, setPeriods] = useState<Period[]>([]);  // ✅ Added
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterRisk, setFilterRisk] = useState('All');
    const [periodFilter, setPeriodFilter] = useState<string>('all');  // ✅ Added
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState<CollectionCustomer | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isPromiseModalOpen, setIsPromiseModalOpen] = useState(false);
    const [activityForm, setActivityForm] = useState({
        type: 'Call' as 'Call' | 'Email' | 'Note' | 'Payment' | 'Promise',
        description: '',
        followUpDate: '',
        customerId: '',
        periodId: '',  // ✅ Added
    });
    const [promiseForm, setPromiseForm] = useState({
        amount: 0,
        promiseDate: '',
        notes: '',
        periodId: '',  // ✅ Added
    });
    const [stats, setStats] = useState({
        totalOutstanding: 0,
        overdueAmount: 0,
        criticalCount: 0,
        overdueCount: 0,
        currentCount: 0,
        collectionRate: 0,
    });
    const ITEMS_PER_PAGE = 10;

    // ✅ Fetch periods on mount
    useEffect(() => {
        fetchPeriods();
    }, []);

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
    } = useReportExport('collection-followup');

    // ✅ Fetch data when period filter changes
    useEffect(() => {
        fetchData();
    }, [periodFilter]);

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

            // ✅ Auto-select active period
            const active = data.find((p: any) => !p.isClosed);
            if (active) {
                setPeriodFilter(active.id);
            }
        } catch (error) {
            console.error('Error fetching periods:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);

            // ✅ Get ONLY Sales invoices (AR) with period filter
            const params: any = {};
            if (periodFilter && periodFilter !== 'all') {
                params.periodId = periodFilter;
            }

            const invoicesRes = await getSalesInvoices(params);
            const paymentsRes = await getSalesPayments(params);
            const customersRes = await getCustomers();

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
            const customerMap: Record<string, any> = {};
            customersData.forEach((c: any) => {
                const id = c.id || c.customerId;
                if (id) {
                    customerMap[id] = {
                        name: c.name || c.customerName || 'Unknown',
                        email: c.email || c.customerEmail,
                        phone: c.phone || c.customerPhone,
                        contactPerson: c.contactPerson,
                    };
                }
            });

            // Group invoices by customer
            const customerMapData = new Map<string, CollectionCustomer>();

            invoices.forEach((inv: any) => {
                const customerId = inv.customerId || inv.customer_id;
                if (!customerId) return;

                if (!customerMapData.has(customerId)) {
                    const customerInfo = customerMap[customerId] || {};
                    customerMapData.set(customerId, {
                        id: customerId,
                        name: customerInfo.name || inv.customerName || inv.customer_name || 'Unknown',
                        email: customerInfo.email,
                        phone: customerInfo.phone,
                        totalOutstanding: 0,
                        overdueAmount: 0,
                        invoiceCount: 0,
                        daysOverdue: 0,
                        aging: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 },
                        status: 'Current',
                        contactPerson: customerInfo.contactPerson,
                        collectionScore: 0,
                        riskLevel: 'Low',
                        // ✅ Period fields
                        periodId: inv.periodId || inv.PeriodId || periodFilter !== 'all' ? periodFilter : '',
                        periodName: inv.periodName || inv.PeriodName || periods.find(p => p.id === periodFilter)?.name || '',
                    });
                }

                const customer = customerMapData.get(customerId)!;
                const amount = Number(inv.totalAmount || inv.total_amount || 0);
                const dueDate = new Date(inv.dueDate || inv.due_date || inv.invoiceDate || inv.invoice_date);
                const today = new Date();
                const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                const status = inv.status || 'Draft';

                customer.invoiceCount++;

                if (status !== 'Paid' && status !== 'Cancelled' && status !== 'Rejected') {
                    customer.totalOutstanding += amount;

                    if (daysOverdue > 0) {
                        customer.overdueAmount += amount;
                        if (daysOverdue > 90) customer.aging['90+'] += amount;
                        else if (daysOverdue > 60) customer.aging['61-90'] += amount;
                        else if (daysOverdue > 30) customer.aging['31-60'] += amount;
                        else customer.aging['0-30'] += amount;
                    }
                }

                customer.daysOverdue = Math.max(customer.daysOverdue, daysOverdue);

                // Calculate status
                if (daysOverdue > 90) {
                    customer.status = 'Critical';
                    customer.riskLevel = 'High';
                } else if (daysOverdue > 30) {
                    customer.status = 'Overdue';
                    customer.riskLevel = 'Medium';
                } else {
                    customer.status = 'Current';
                    customer.riskLevel = 'Low';
                }

                // Calculate collection score (0-100)
                let score = 100;
                if (customer.totalOutstanding > 0) {
                    const overdueRatio = customer.overdueAmount / customer.totalOutstanding;
                    score = Math.max(0, 100 - (overdueRatio * 100) - (daysOverdue * 0.5));
                }
                customer.collectionScore = Math.round(Math.min(100, score));
            });

            // Add last payment date
            payments.forEach((payment: any) => {
                const customerId = payment.customerId || payment.customer_id;
                if (customerId && customerMapData.has(customerId)) {
                    const customer = customerMapData.get(customerId)!;
                    const paymentDate = payment.paymentDate || payment.dateAdd;
                    if (!customer.lastPaymentDate || paymentDate > customer.lastPaymentDate) {
                        customer.lastPaymentDate = paymentDate;
                    }
                }
            });

            const customersArray = Array.from(customerMapData.values());
            setCustomers(customersArray);

            // Calculate stats
            const totalOutstanding = customersArray.reduce((sum, c) => sum + c.totalOutstanding, 0);
            const overdueAmount = customersArray.reduce((sum, c) => sum + c.overdueAmount, 0);
            const criticalCount = customersArray.filter(c => c.status === 'Critical').length;
            const overdueCount = customersArray.filter(c => c.status === 'Overdue').length;
            const currentCount = customersArray.filter(c => c.status === 'Current').length;
            const collectionRate = totalOutstanding > 0 ? ((totalOutstanding - overdueAmount) / totalOutstanding) * 100 : 100;

            setStats({
                totalOutstanding,
                overdueAmount,
                criticalCount,
                overdueCount,
                currentCount,
                collectionRate,
            });

            // Mock activities with period info
            const mockActivities: CollectionActivity[] = customersArray.slice(0, 5).map((c, i) => ({
                id: `act-${i}`,
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
                type: ['Call', 'Email', 'Note', 'Promise', 'Payment'][i % 5] as any,
                description: `Follow-up ${['call', 'email', 'note', 'promise', 'payment'][i % 5]} for ${c.name}`,
                customerId: c.id,
                customerName: c.name,
                status: ['Pending', 'Completed', 'Scheduled'][i % 3] as any,
                followUpDate: i % 2 === 0 ? new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString() : undefined,
                periodId: periodFilter !== 'all' ? periodFilter : '',
                periodName: periods.find(p => p.id === periodFilter)?.name || '',
            }));
            setActivities(mockActivities);

        } catch (error) {
            console.error('Error fetching collection data:', error);
            showToast.error('Failed to load collection data');
        } finally {
            setLoading(false);
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
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Current: 'bg-green-100 text-green-700 border-green-200',
            Overdue: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Critical: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getRiskBadge = (risk: string) => {
        const colors: Record<string, string> = {
            Low: 'bg-green-100 text-green-700 border-green-200',
            Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            High: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[risk] || 'bg-gray-100 text-gray-700';
    };

    const getActivityTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Call: 'bg-blue-100 text-blue-700',
            Email: 'bg-purple-100 text-purple-700',
            Note: 'bg-gray-100 text-gray-700',
            Payment: 'bg-green-100 text-green-700',
            Promise: 'bg-orange-100 text-orange-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'Call': return <PhoneCall className="h-4 w-4" />;
            case 'Email': return <MailOpen className="h-4 w-4" />;
            case 'Note': return <FileText className="h-4 w-4" />;
            case 'Payment': return <DollarSign className="h-4 w-4" />;
            case 'Promise': return <ClockIcon className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const filteredCustomers = customers.filter(c => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
        const matchesRisk = filterRisk === 'All' || c.riskLevel === filterRisk;
        return matchesSearch && matchesStatus && matchesRisk;
    });

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                        <Users className="w-6 h-6 text-white"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Collection Follow-up</h1>
                        <p className="text-sm text-gray-500">Manage customer collections and overdue accounts</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleRefresh(fetchData)}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isRefreshing}
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
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport({customers, stats})}
                        disabled={!customers || customers.length === 0}
                    >
                        <Printer size={16}/>
                        Print
                    </Button>
                    <Button
                        onClick={() => setIsActivityModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus size={16}/> Log Activity
                    </Button>
                </div>
            </div>

            {/* ✅ Period Filter - Added */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500"/>
                    <Label className="font-medium text-gray-700">Period:</Label>
                </div>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Period"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Periods</SelectItem>
                        {periods.map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                                {period.name} {period.isClosed ? '🔒' : '🔓'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Outstanding</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalOutstanding)}</p>
                            </div>
                            <div className="p-2.5 bg-blue-200 rounded-xl">
                                <DollarSign className="h-5 w-5 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Overdue Amount</p>
                                <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.overdueAmount)}</p>
                            </div>
                            <div className="p-2.5 bg-red-200 rounded-xl">
                                <AlertCircle className="h-5 w-5 text-red-700" />
                            </div>
                        </div>
                        <p className="text-xs text-red-600 mt-1">{stats.criticalCount} critical accounts</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Overdue Customers</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.overdueCount}</p>
                            </div>
                            <div className="p-2.5 bg-yellow-200 rounded-xl">
                                <Clock className="h-5 w-5 text-yellow-700" />
                            </div>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Current Accounts</p>
                                <p className="text-2xl font-bold text-green-900">{stats.currentCount}</p>
                            </div>
                            <div className="p-2.5 bg-green-200 rounded-xl">
                                <CheckCircle className="h-5 w-5 text-green-700" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 mt-1">On track</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Collection Rate</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.collectionRate.toFixed(1)}%</p>
                            </div>
                            <div className="p-2.5 bg-purple-200 rounded-xl">
                                <TrendingUp className="h-5 w-5 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search customers by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Current">Current</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="md:w-40">
                        <Flag className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Risks</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Overdue</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Payment</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {paginatedCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No customers found</p>
                                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                <User className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                                                {/* ✅ Period badge */}
                                                {customer.periodName && (
                                                    <Badge variant="outline" className="text-[10px] mt-0.5">
                                                        {customer.periodName}
                                                    </Badge>
                                                )}
                                                {customer.email && (
                                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{customer.email}</p>
                                                )}
                                                <p className="text-xs text-gray-400">{customer.invoiceCount} invoices</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-bold text-indigo-600">
                                        {formatCurrency(customer.totalOutstanding)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                                        {formatCurrency(customer.overdueAmount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(customer.status)}>
                                            {customer.status}
                                        </Badge>
                                        {customer.daysOverdue > 0 && (
                                            <span className="text-xs text-gray-500 ml-1 block">
                                                    {customer.daysOverdue} days overdue
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getRiskBadge(customer.riskLevel || 'Low')}>
                                            {customer.riskLevel || 'Low'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">{customer.collectionScore || 0}%</span>
                                            <div className="w-12 h-1.5 bg-gray-200 rounded-full">
                                                <div
                                                    className={`h-1.5 rounded-full ${
                                                        (customer.collectionScore || 0) >= 70 ? 'bg-green-500' :
                                                            (customer.collectionScore || 0) >= 40 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                    }`}
                                                    style={{ width: `${Math.min(100, customer.collectionScore || 0)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {customer.lastPaymentDate ? formatDate(customer.lastPaymentDate) : 'No payments'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            <button
                                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Call"
                                            >
                                                <Phone size={16} className="text-green-500" />
                                            </button>
                                            <button
                                                className="p-1 hover:bg-purple-100 rounded-lg transition-colors"
                                                title="Email"
                                            >
                                                <Mail size={16} className="text-purple-500" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActivityForm({ ...activityForm, customerId: customer.id });
                                                    setIsActivityModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                                title="Log Activity"
                                            >
                                                <FileText size={16} className="text-yellow-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length} customers
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* View Customer Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-600" />
                            Customer Collection Details
                        </DialogTitle>
                        <DialogDescription>
                            View collection information and activity history.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCustomer && (
                        <div className="space-y-4 py-4">
                            {/* ✅ Period Info */}
                            {selectedCustomer.periodName && (
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                    <p className="text-sm text-indigo-700 font-medium flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        Financial Period
                                    </p>
                                    <p className="text-indigo-900 font-semibold">{selectedCustomer.periodName}</p>
                                    {selectedCustomer.periodId && (
                                        <p className="text-xs text-indigo-500">ID: {selectedCustomer.periodId}</p>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedCustomer.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedCustomer.status)}>
                                        {selectedCustomer.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Risk Level</p>
                                    <Badge className={getRiskBadge(selectedCustomer.riskLevel || 'Low')}>
                                        {selectedCustomer.riskLevel || 'Low'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Collection Score</p>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{selectedCustomer.collectionScore || 0}%</span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    (selectedCustomer.collectionScore || 0) >= 70 ? 'bg-green-500' :
                                                        (selectedCustomer.collectionScore || 0) >= 40 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                }`}
                                                style={{ width: `${Math.min(100, selectedCustomer.collectionScore || 0)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Outstanding</p>
                                    <p className="text-lg font-bold text-indigo-600">{formatCurrency(selectedCustomer.totalOutstanding)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Overdue Amount</p>
                                    <p className="text-lg font-bold text-red-600">{formatCurrency(selectedCustomer.overdueAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Invoices</p>
                                    <p>{selectedCustomer.invoiceCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Days Overdue</p>
                                    <p>{selectedCustomer.daysOverdue}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Payment</p>
                                    <p>{selectedCustomer.lastPaymentDate ? formatDate(selectedCustomer.lastPaymentDate) : 'No payments'}</p>
                                </div>
                                {selectedCustomer.email && (
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-sm">{selectedCustomer.email}</p>
                                    </div>
                                )}
                                {selectedCustomer.phone && (
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="text-sm">{selectedCustomer.phone}</p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Aging Breakdown</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {Object.entries(selectedCustomer.aging).map(([period, amount]) => (
                                        <div key={period} className="text-center p-2 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500">{period} days</p>
                                            <p className="text-sm font-medium">{formatCurrency(amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Recent Activities</p>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {activities.filter(a => a.customerId === selectedCustomer.id).map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                            <div className={`p-1 rounded-full ${getActivityTypeColor(activity.type)}`}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">{activity.description}</p>
                                                <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                                                {activity.periodName && (
                                                    <p className="text-xs text-indigo-500">Period: {activity.periodName}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Log Activity Modal */}
            <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Log Collection Activity
                        </DialogTitle>
                        <DialogDescription>
                            Record a collection activity for this customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Customer</Label>
                            <Select
                                value={activityForm.customerId}
                                onValueChange={(value) => setActivityForm({ ...activityForm, customerId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ✅ Period Selection - Added */}
                        <div>
                            <Label className="text-sm font-medium">Financial Period</Label>
                            <Select
                                value={activityForm.periodId}
                                onValueChange={(value) => setActivityForm({ ...activityForm, periodId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Period</SelectItem>
                                    {periods.map((period) => (
                                        <SelectItem key={period.id} value={period.id}>
                                            {period.name} {period.isClosed ? '🔒' : '🔓'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Activity Type</Label>
                            <Select
                                value={activityForm.type}
                                onValueChange={(value) => setActivityForm({ ...activityForm, type: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Call">Phone Call</SelectItem>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="Note">Note</SelectItem>
                                    <SelectItem value="Payment">Payment Received</SelectItem>
                                    <SelectItem value="Promise">Promise to Pay</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={activityForm.description}
                                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                                placeholder="Enter activity details..."
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label>Follow-up Date (Optional)</Label>
                            <Input
                                type="date"
                                value={activityForm.followUpDate}
                                onChange={(e) => setActivityForm({ ...activityForm, followUpDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                            showToast.success('Activity logged successfully');
                            setIsActivityModalOpen(false);
                        }}>
                            <Save className="h-4 w-4 mr-2" />
                            Log Activity
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            {title || 'Export Collection Follow-up Report'}
                        </DialogTitle>
                        <DialogDescription>
                            Export the collection follow-up report in your preferred format.
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
                                {periods.find(p => p.id === periodFilter)?.name || 'All Periods'}
                            </div>
                        </div>

                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Total Outstanding: <strong>{formatCurrency(stats.totalOutstanding)}</strong></p>
                                <p>Overdue Amount: <strong>{formatCurrency(stats.overdueAmount)}</strong></p>
                                <p>Customers: <strong>{customers.length}</strong></p>
                                <p>Collection Rate: <strong>{stats.collectionRate.toFixed(1)}%</strong></p>
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
                            onClick={() => handleExport({ customers, stats })}
                            disabled={exporting || !customers || customers.length === 0}
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

export default CollectionFollowup;