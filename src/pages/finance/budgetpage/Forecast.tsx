// src/pages/finance/budgetpage/BudgetForecast.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, RefreshCw, Search, Filter,
    ChevronLeft, ChevronRight, DollarSign, Calendar,
    Building2, Users, FileText, PieChart, Download,
    Eye, Clock, AlertCircle, CheckCircle
} from 'lucide-react';
import { getBudgets, getExpenses, getInvoices } from '../../../services/finance/financeApi';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';

interface ForecastBudget {
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
    forecastAmount: number;
    forecastVariance: number;
    forecastVariancePercentage: number;
    confidenceLevel: 'High' | 'Medium' | 'Low';
    trend: 'increasing' | 'decreasing' | 'stable';
    monthlyData: Array<{ month: string; actual: number; forecast: number }>;
}

const BudgetForecast: React.FC = () => {
    const [forecasts, setForecasts] = useState<ForecastBudget[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBudget, setSelectedBudget] = useState<ForecastBudget | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [forecastPeriod, setForecastPeriod] = useState('3 Months');
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [budgetsRes, expensesRes, invoicesRes] = await Promise.all([
                getBudgets(),
                getExpenses(),
                getInvoices(),
            ]);

            const budgetsData = budgetsRes.data.data || budgetsRes.data || [];
            const expensesData = expensesRes.data.data || expensesRes.data || [];
            const invoicesData = invoicesRes.data.data || invoicesRes.data || [];

            const mappedForecasts: ForecastBudget[] = budgetsData.map((b: any) => {
                const spent = expensesData
                    .filter((e: any) => e.budgetId === b.id || e.categoryId === b.id)
                    .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

                const remaining = b.totalAmount - spent;
                const utilization = b.totalAmount > 0 ? (spent / b.totalAmount) * 100 : 0;

                // Calculate forecast based on historical trends
                const monthlyData = generateMonthlyData(b, expensesData);
                const forecastAmount = calculateForecast(b, spent, monthlyData);
                const forecastVariance = forecastAmount - b.totalAmount;
                const forecastVariancePercentage = b.totalAmount > 0 ? (forecastVariance / b.totalAmount) * 100 : 0;

                // Determine confidence level based on data availability
                const confidenceLevel: 'High' | 'Medium' | 'Low' =
                    expensesData.filter((e: any) => e.budgetId === b.id).length > 10 ? 'High' :
                        expensesData.filter((e: any) => e.budgetId === b.id).length > 5 ? 'Medium' : 'Low';

                const trend: 'increasing' | 'decreasing' | 'stable' =
                    utilization > 80 ? 'increasing' :
                        utilization < 30 ? 'decreasing' : 'stable';

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
                    forecastAmount,
                    forecastVariance,
                    forecastVariancePercentage,
                    confidenceLevel,
                    trend,
                    monthlyData,
                };
            });

            setForecasts(mappedForecasts);
        } catch (error) {
            console.error('Error fetching forecast data:', error);
            showToast.error('Failed to load forecast data');
        } finally {
            setLoading(false);
        }
    };

    const generateMonthlyData = (budget: any, expenses: any[]) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const result = [];

        for (let i = 0; i < 6; i++) {
            const monthIndex = (currentMonth + i) % 12;
            const month = months[monthIndex];
            const actual = expenses
                .filter((e: any) => {
                    const date = new Date(e.expenseDate || e.dateAdd);
                    return date.getMonth() === monthIndex && (e.budgetId === budget.id || e.categoryId === budget.id);
                })
                .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

            const forecast = actual * (1 + (i * 0.02)); // Simple forecast with 2% growth per month
            result.push({ month, actual, forecast });
        }

        return result;
    };

    const calculateForecast = (budget: any, spent: number, monthlyData: any[]) => {
        const averageMonthlySpend = monthlyData.reduce((sum, d) => sum + d.forecast, 0) / monthlyData.length;
        const monthsRemaining = 3; // Assuming 3 months remaining
        return spent + (averageMonthlySpend * monthsRemaining);
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

    const getConfidenceColor = (level: string) => {
        const colors: Record<string, string> = {
            High: 'bg-green-100 text-green-700',
            Medium: 'bg-yellow-100 text-yellow-700',
            Low: 'bg-red-100 text-red-700',
        };
        return colors[level] || 'bg-gray-100 text-gray-700';
    };

    const filteredForecasts = forecasts.filter(f => {
        const matchesSearch =
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || f.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredForecasts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedForecasts = filteredForecasts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                    <h1 className="text-2xl font-bold text-gray-900">Budget Forecasting</h1>
                    <p className="text-sm text-gray-500">Predict and analyze budget trends</p>
                </div>
                <div className="flex gap-2">
                    <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                        <SelectTrigger className="w-40">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3 Months">3 Months</SelectItem>
                            <SelectItem value="6 Months">6 Months</SelectItem>
                            <SelectItem value="12 Months">12 Months</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={fetchData}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search forecasts..."
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

            {/* Forecast Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedForecasts.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                        No forecasts found
                    </div>
                ) : (
                    paginatedForecasts.map((forecast) => (
                        <Card key={forecast.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                            setSelectedBudget(forecast);
                            setIsDetailModalOpen(true);
                        }}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{forecast.name}</h3>
                                            {forecast.trend === 'increasing' ? (
                                                <TrendingUp className="h-4 w-4 text-red-500" />
                                            ) : forecast.trend === 'decreasing' ? (
                                                <TrendingDown className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Clock className="h-4 w-4 text-gray-400" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{forecast.description || 'No description'}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge className={getStatusColor(forecast.status)}>
                                            {forecast.status}
                                        </Badge>
                                        <Badge className={`text-xs ${getConfidenceColor(forecast.confidenceLevel)}`}>
                                            {forecast.confidenceLevel} Confidence
                                        </Badge>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    <div>
                                        <p className="text-xs text-gray-500">Budget</p>
                                        <p className="text-sm font-semibold text-indigo-600">{formatCurrency(forecast.totalAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Forecast</p>
                                        <p className="text-sm font-semibold text-purple-600">{formatCurrency(forecast.forecastAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Variance</p>
                                        <p className={`text-sm font-semibold ${forecast.forecastVariance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {forecast.forecastVariance >= 0 ? '+' : ''}{formatCurrency(forecast.forecastVariance)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Current Utilization</span>
                                        <span>{forecast.utilizationPercentage.toFixed(1)}%</span>
                                    </div>
                                    <Progress
                                        value={forecast.utilizationPercentage}
                                        className={`h-2 ${forecast.utilizationPercentage >= 90 ? 'bg-red-500' : forecast.utilizationPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    />
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-1">
                                    {forecast.monthlyData.slice(0, 3).map((data, idx) => (
                                        <div key={idx} className="text-center p-1 bg-gray-50 rounded">
                                            <p className="text-xs text-gray-500">{data.month}</p>
                                            <p className="text-xs font-medium text-indigo-600">{formatCurrency(data.forecast)}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredForecasts.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredForecasts.length)} of {filteredForecasts.length} forecasts
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

            {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-purple-600" />
                            Forecast Details
                        </DialogTitle>
                        <DialogDescription>
                            Detailed forecast analysis for this budget.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedBudget && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedBudget.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedBudget.status)}>
                                        {selectedBudget.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Budget</p>
                                    <p className="text-xl font-bold text-indigo-600">{formatCurrency(selectedBudget.totalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Forecast</p>
                                    <p className="text-xl font-bold text-purple-600">{formatCurrency(selectedBudget.forecastAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Variance</p>
                                    <p className={`text-lg font-bold ${selectedBudget.forecastVariance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {selectedBudget.forecastVariance >= 0 ? '+' : ''}{formatCurrency(selectedBudget.forecastVariance)}
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                      ({selectedBudget.forecastVariancePercentage >= 0 ? '+' : ''}{selectedBudget.forecastVariancePercentage.toFixed(1)}%)
                    </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Confidence</p>
                                    <Badge className={getConfidenceColor(selectedBudget.confidenceLevel)}>
                                        {selectedBudget.confidenceLevel}
                                    </Badge>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 mb-2">Monthly Forecast</p>
                                    <div className="grid grid-cols-6 gap-1">
                                        {selectedBudget.monthlyData.map((data, idx) => (
                                            <div key={idx} className="text-center p-2 bg-gray-50 rounded">
                                                <p className="text-xs text-gray-500">{data.month}</p>
                                                <p className="text-xs font-medium text-indigo-600">{formatCurrency(data.forecast)}</p>
                                                <p className="text-xs text-gray-400">(Actual: {formatCurrency(data.actual)})</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default BudgetForecast;