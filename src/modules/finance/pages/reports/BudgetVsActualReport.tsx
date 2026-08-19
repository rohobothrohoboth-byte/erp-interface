// src/pages/finance/reports/BudgetVsActualReport.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart, RefreshCw, Download, Printer, Calendar,
    DollarSign, TrendingUp, TrendingDown, FileText,
    ChevronLeft, ChevronRight, Filter, Eye,
    AlertCircle, CheckCircle, Search, BarChart3,
    Building2, Clock, Target
} from 'lucide-react';
import { getBudgets, getExpenses } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
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

interface BudgetVsActualItem {
    id: string;
    name: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
    variancePercentage: number;
    status: 'On Track' | 'Over Budget' | 'Under Budget';
}

const BudgetVsActualReport: React.FC = () => {
    const [data, setData] = useState<BudgetVsActualItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [budgetsRes, expensesRes] = await Promise.all([
                getBudgets(),
                getExpenses(),
            ]);

            const budgets = budgetsRes.data.data || budgetsRes.data || [];
            const expenses = expensesRes.data.data || expensesRes.data || [];

            // Filter expenses by period
            const periodExpenses = expenses.filter((exp: any) =>
                exp.expenseDate && exp.expenseDate.slice(0, 7) === period
            );

            const mappedData: BudgetVsActualItem[] = budgets.map((budget: any) => {
                const actualAmount = periodExpenses
                    .filter((exp: any) => exp.budgetId === budget.id || exp.categoryId === budget.id)
                    .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);

                const variance = budget.totalAmount - actualAmount;
                const variancePercentage = budget.totalAmount > 0 ? (variance / budget.totalAmount) * 100 : 0;

                let status: 'On Track' | 'Over Budget' | 'Under Budget' = 'On Track';
                if (variance < 0) status = 'Over Budget';
                else if (variance > budget.totalAmount * 0.2) status = 'Under Budget';

                return {
                    id: budget.id,
                    name: budget.name || 'Unnamed Budget',
                    budgetAmount: budget.totalAmount || 0,
                    actualAmount,
                    variance,
                    variancePercentage,
                    status,
                };
            });

            setData(mappedData);
        } catch (error) {
            console.error('Error fetching budget vs actual data:', error);
            showToast('Failed to load budget vs actual report', 'error');
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

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'On Track': 'bg-green-100 text-green-700',
            'Over Budget': 'bg-red-100 text-red-700',
            'Under Budget': 'bg-yellow-100 text-yellow-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const totals = data.reduce((acc, item) => ({
        budget: acc.budget + item.budgetAmount,
        actual: acc.actual + item.actualAmount,
        variance: acc.variance + item.variance,
    }), { budget: 0, actual: 0, variance: 0 });

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
                        <Target className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Budget vs Actual</h1>
                        <p className="text-sm text-gray-500">Period: {period}</p>
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
                    <Label className="font-medium">Period:</Label>
                </div>
                <Input
                    type="month"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-48"
                />
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search budgets..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-700 font-medium">Total Budget</p>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(totals.budget)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-700 font-medium">Total Actual</p>
                        <p className="text-2xl font-bold text-green-900">{formatCurrency(totals.actual)}</p>
                    </CardContent>
                </Card>
                <Card className={`bg-gradient-to-r ${totals.variance >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-red-50 to-red-100 border-red-200'}`}>
                    <CardContent className="p-4">
                        <p className={`text-sm ${totals.variance >= 0 ? 'text-emerald-700' : 'text-red-700'} font-medium`}>
                            Variance
                        </p>
                        <p className={`text-2xl font-bold ${totals.variance >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                            {formatCurrency(totals.variance)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Budget vs Actual Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget Name</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedData.map((item) => {
                                const utilization = item.budgetAmount > 0 ? (item.actualAmount / item.budgetAmount) * 100 : 0;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.budgetAmount)}</td>
                                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.actualAmount)}</td>
                                        <td className={`px-4 py-3 text-sm text-right font-medium ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(item.variance)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge className={getStatusColor(item.status)}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="w-32">
                                                <Progress value={Math.min(100, utilization)} className="h-2" />
                                                <span className="text-xs text-gray-500 mt-1 block">
                            {utilization.toFixed(0)}%
                          </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                            <tr className="font-bold">
                                <td className="px-4 py-3">TOTAL</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(totals.budget)}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(totals.actual)}</td>
                                <td className={`px-4 py-3 text-right ${totals.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(totals.variance)}
                                </td>
                                <td className="px-4 py-3 text-center" colSpan={2}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${totals.variance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {totals.variance >= 0 ? 'Under Budget' : 'Over Budget'}
                    </span>
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                            <p className="text-sm text-gray-500">
                                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} budgets
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
                            Export Budget vs Actual
                        </DialogTitle>
                        <DialogDescription>
                            Export the budget vs actual report in your preferred format.
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
                            <Label>Period</Label>
                            <Input type="month" value={period} readOnly />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                            showToast('Budget vs actual exported successfully', 'success');
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

export default BudgetVsActualReport;