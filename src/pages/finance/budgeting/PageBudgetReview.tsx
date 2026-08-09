// src/pages/finance/budgeting/PageBudgetReview.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    RefreshCw, Search, Filter, Eye, TrendingUp, TrendingDown,
    DollarSign, Calendar, Building2, Users, PieChart,
    ChevronLeft, ChevronRight, FileText, Clock
} from 'lucide-react';
import { getBudgets, getExpenses } from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
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

interface BudgetReview {
    id: string;
    name: string;
    description?: string;
    totalAmount: number;
    spentAmount: number;
    remainingAmount: number;
    utilizationPercentage: number;
    status: string;
    startDate: string;
    endDate: string;
    branchName?: string;
    departmentName?: string;
}

const PageBudgetReview: React.FC = () => {
    const [budgets, setBudgets] = useState<BudgetReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [budgetsRes, expensesRes] = await Promise.all([
                getBudgets(),
                getExpenses(),
            ]);

            const budgetsData = budgetsRes.data.data || budgetsRes.data || [];
            const expensesData = expensesRes.data.data || expensesRes.data || [];

            // Calculate spending per budget
            const mappedBudgets: BudgetReview[] = budgetsData.map((b: any) => {
                const spent = expensesData
                    .filter((e: any) => e.budgetId === b.id || e.categoryId === b.id)
                    .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

                const remaining = b.totalAmount - spent;
                const utilization = b.totalAmount > 0 ? (spent / b.totalAmount) * 100 : 0;

                return {
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    totalAmount: b.totalAmount,
                    spentAmount: spent,
                    remainingAmount: remaining,
                    utilizationPercentage: Math.min(100, utilization),
                    status: b.status,
                    startDate: b.startDate,
                    endDate: b.endDate,
                    branchName: b.branchName,
                    departmentName: b.departmentName,
                };
            });

            setBudgets(mappedBudgets);
        } catch (error) {
            console.error('Error fetching budget review data:', error);
            showToast.error('Failed to load budget review data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getUtilizationColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Active: 'bg-green-100 text-green-700',
            Draft: 'bg-yellow-100 text-yellow-700',
            Inactive: 'bg-gray-100 text-gray-700',
            Approved: 'bg-blue-100 text-blue-700',
            Rejected: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const filteredBudgets = budgets.filter(b => {
        const matchesSearch =
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedBudgets = filteredBudgets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Budget Review</h1>
                    <p className="text-sm text-gray-500">Monitor budget utilization and performance</p>
                </div>
                <Button
                    onClick={fetchData}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <RefreshCw size={16} />
                    Refresh
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Total Budgets</p>
                                <p className="text-2xl font-bold text-indigo-900">{budgets.length}</p>
                            </div>
                            <div className="p-3 bg-indigo-200 rounded-lg">
                                <FileText className="h-6 w-6 text-indigo-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Total Budget</p>
                                <p className="text-2xl font-bold text-emerald-900">
                                    {formatCurrency(budgets.reduce((sum, b) => sum + b.totalAmount, 0))}
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-lg">
                                <DollarSign className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Total Spent</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {formatCurrency(budgets.reduce((sum, b) => sum + b.spentAmount, 0))}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Avg Utilization</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {budgets.length > 0
                                        ? Math.round(budgets.reduce((sum, b) => sum + b.utilizationPercentage, 0) / budgets.length)
                                        : 0}%
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <PieChart className="h-6 w-6 text-purple-700" />
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
                        placeholder="Search budgets..."
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
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Budget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedBudgets.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                        No budgets found
                    </div>
                ) : (
                    paginatedBudgets.map((budget) => (
                        <Card key={budget.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                                        <p className="text-sm text-gray-500">{budget.description || 'No description'}</p>
                                    </div>
                                    <Badge className={getStatusColor(budget.status)}>
                                        {budget.status}
                                    </Badge>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    <div>
                                        <p className="text-xs text-gray-500">Budget</p>
                                        <p className="text-sm font-semibold text-indigo-600">{formatCurrency(budget.totalAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Spent</p>
                                        <p className="text-sm font-semibold text-orange-600">{formatCurrency(budget.spentAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Remaining</p>
                                        <p className={`text-sm font-semibold ${budget.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(budget.remainingAmount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Utilization</span>
                                        <span>{budget.utilizationPercentage.toFixed(1)}%</span>
                                    </div>
                                    <Progress
                                        value={budget.utilizationPercentage}
                                        className={`h-2 ${getUtilizationColor(budget.utilizationPercentage)}`}
                                    />
                                </div>

                                <div className="mt-3 flex justify-between text-xs text-gray-500">
                                    <span>{formatDate(budget.startDate)}</span>
                                    <span>→</span>
                                    <span>{formatDate(budget.endDate)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredBudgets.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredBudgets.length)} of {filteredBudgets.length} budgets
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
        </motion.div>
    );
};

export default PageBudgetReview;