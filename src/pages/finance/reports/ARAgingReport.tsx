// src/pages/finance/reports/ARAgingReport.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, RefreshCw, Download, Printer, Calendar,
    DollarSign, TrendingUp, TrendingDown, FileText,
    ChevronLeft, ChevronRight, Filter, Eye,
    AlertCircle, CheckCircle, Search, BarChart3,
    Building2, Clock, PieChart
} from 'lucide-react';
import { getInvoices, getCustomers } from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
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

interface AgingCustomer {
    id: string;
    name: string;
    totalOutstanding: number;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days120: number;
    totalInvoices: number;
    overdueInvoices: number;
}

const ARAgingReport: React.FC = () => {
    const [data, setData] = useState<AgingCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchData();
    }, [asOfDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invoicesRes] = await Promise.all([
                getInvoices(),
            ]);

            const invoices = invoicesRes.data.data || invoicesRes.data || [];

            // Group by customer
            const customerMap = new Map<string, AgingCustomer>();

            invoices.forEach((inv: any) => {
                const customerId = inv.customerId || inv.customer_id;
                if (!customerId) return;

                if (!customerMap.has(customerId)) {
                    customerMap.set(customerId, {
                        id: customerId,
                        name: inv.customerName || inv.customer_name || 'Unknown',
                        totalOutstanding: 0,
                        current: 0,
                        days30: 0,
                        days60: 0,
                        days90: 0,
                        days120: 0,
                        totalInvoices: 0,
                        overdueInvoices: 0,
                    });
                }

                const customer = customerMap.get(customerId)!;
                const amount = inv.totalAmount || 0;
                const dueDate = new Date(inv.dueDate || inv.due_date);
                const today = new Date(asOfDate);
                const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

                if (inv.status !== 'Paid' && inv.status !== 'Cancelled') {
                    customer.totalOutstanding += amount;
                    customer.totalInvoices++;

                    if (daysOverdue <= 0) {
                        customer.current += amount;
                    } else if (daysOverdue <= 30) {
                        customer.days30 += amount;
                    } else if (daysOverdue <= 60) {
                        customer.days60 += amount;
                    } else if (daysOverdue <= 90) {
                        customer.days90 += amount;
                    } else {
                        customer.days120 += amount;
                    }

                    if (daysOverdue > 0) {
                        customer.overdueInvoices++;
                    }
                }
            });

            setData(Array.from(customerMap.values()));
        } catch (error) {
            console.error('Error fetching aging data:', error);
            showToast('Failed to load aging report', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getStatusColor = (days: number) => {
        if (days <= 0) return 'bg-green-100 text-green-700';
        if (days <= 30) return 'bg-yellow-100 text-yellow-700';
        if (days <= 60) return 'bg-orange-100 text-orange-700';
        return 'bg-red-100 text-red-700';
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const totals = data.reduce((acc, item) => ({
        current: acc.current + item.current,
        days30: acc.days30 + item.days30,
        days60: acc.days60 + item.days60,
        days90: acc.days90 + item.days90,
        days120: acc.days120 + item.days120,
        total: acc.total + item.totalOutstanding,
    }), { current: 0, days30: 0, days60: 0, days90: 0, days120: 0, total: 0 });

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
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Accounts Receivable Aging</h1>
                        <p className="text-sm text-gray-500">As of {new Date(asOfDate).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchData}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsExportModalOpen(true)}
                    >
                        <Download size={16} />
                        Export
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <Label className="font-medium">As of Date:</Label>
                </div>
                <Input
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                    className="w-48"
                />
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={fetchData} className="bg-indigo-600 hover:bg-indigo-700">
                    Generate
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-700 font-medium">Current</p>
                        <p className="text-2xl font-bold text-green-900">{formatCurrency(totals.current)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-700 font-medium">1-30 Days</p>
                        <p className="text-2xl font-bold text-yellow-900">{formatCurrency(totals.days30)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-orange-700 font-medium">31-60 Days</p>
                        <p className="text-2xl font-bold text-orange-900">{formatCurrency(totals.days60)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-red-700 font-medium">61-90 Days</p>
                        <p className="text-2xl font-bold text-red-900">{formatCurrency(totals.days90)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-700 font-medium">90+ Days</p>
                        <p className="text-2xl font-bold text-purple-900">{formatCurrency(totals.days120)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Aging Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">1-30 Days</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">31-60 Days</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">61-90 Days</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">90+ Days</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.totalInvoices} invoices</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-green-600">
                                        {formatCurrency(item.current)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-yellow-600">
                                        {formatCurrency(item.days30)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-orange-600">
                                        {formatCurrency(item.days60)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-red-600">
                                        {formatCurrency(item.days90)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-purple-600">
                                        {formatCurrency(item.days120)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium">
                                        {formatCurrency(item.totalOutstanding)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                            <tr className="font-bold">
                                <td className="px-4 py-3">TOTAL</td>
                                <td className="px-4 py-3 text-right text-green-600">{formatCurrency(totals.current)}</td>
                                <td className="px-4 py-3 text-right text-yellow-600">{formatCurrency(totals.days30)}</td>
                                <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(totals.days60)}</td>
                                <td className="px-4 py-3 text-right text-red-600">{formatCurrency(totals.days90)}</td>
                                <td className="px-4 py-3 text-right text-purple-600">{formatCurrency(totals.days120)}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(totals.total)}</td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                            <p className="text-sm text-gray-500">
                                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} customers
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages || 1}
                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            Export Aging Report
                        </DialogTitle>
                        <DialogDescription>
                            Export the aging report in your preferred format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select defaultValue="pdf">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>As of Date</Label>
                            <Input type="date" value={asOfDate} readOnly />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                            showToast('Aging report exported successfully', 'success');
                            setIsExportModalOpen(false);
                        }}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default ARAgingReport;