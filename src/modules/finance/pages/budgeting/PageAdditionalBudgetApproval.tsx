// src/pages/finance/budgetpage/BudgetAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, PieChart, BarChart3,
  DollarSign, Calendar, Building2, Users,
  RefreshCw, Search, Filter, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, Clock, FileText
} from 'lucide-react';
import { getBudgets, getExpenses, getInvoices } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
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

interface BudgetAnalysis {
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
  variance: number;
  variancePercentage: number;
  projectedSpend: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

const BudgetAnalysis: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBudget, setSelectedBudget] = useState<BudgetAnalysis | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
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

      // Calculate revenue and spending
      const totalRevenue = invoicesData
          .filter((i: any) => i.status === 'Paid')
          .reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

      const mappedBudgets: BudgetAnalysis[] = budgetsData.map((b: any) => {
        const spent = expensesData
            .filter((e: any) => e.budgetId === b.id || e.categoryId === b.id)
            .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

        const remaining = b.totalAmount - spent;
        const utilization = b.totalAmount > 0 ? (spent / b.totalAmount) * 100 : 0;
        const variance = spent - b.totalAmount;
        const variancePercentage = b.totalAmount > 0 ? (variance / b.totalAmount) * 100 : 0;
        const projectedSpend = spent + (spent / 0.5); // Simple projection

        // Determine trend
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
          variance,
          variancePercentage,
          projectedSpend,
          trend,
        };
      });

      setBudgets(mappedBudgets);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      showToast.error('Failed to load analysis data');
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

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
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

  // Calculate summary stats
  const totalBudget = budgets.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remainingAmount, 0);
  const avgUtilization = budgets.length > 0
      ? budgets.reduce((sum, b) => sum + b.utilizationPercentage, 0) / budgets.length
      : 0;

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
            <h1 className="text-2xl font-bold text-gray-900">Budget Analysis</h1>
            <p className="text-sm text-gray-500">Analyze budget performance and trends</p>
          </div>
          <div className="flex gap-2">
            <Button
                onClick={() => setShowComparison(!showComparison)}
                variant="outline"
                className="flex items-center gap-2"
            >
              <BarChart3 size={16} />
              {showComparison ? 'Hide Comparison' : 'Show Comparison'}
            </Button>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-700 font-medium">Total Budget</p>
                  <p className="text-2xl font-bold text-indigo-900">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-lg">
                  <DollarSign className="h-6 w-6 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Total Spent</p>
                  <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalSpent)}</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Remaining</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(totalRemaining)}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Avg Utilization</p>
                  <p className="text-2xl font-bold text-purple-900">{avgUtilization.toFixed(1)}%</p>
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
                  <Card key={budget.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                    setSelectedBudget(budget);
                    setIsDetailModalOpen(true);
                  }}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                            {getTrendIcon(budget.trend)}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{budget.description || 'No description'}</p>
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

                      {showComparison && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Variance:</span>
                              <span className={`font-medium ${budget.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {budget.variance >= 0 ? '+' : ''}{formatCurrency(budget.variance)}
                      </span>
                              <span className={`font-medium ${budget.variancePercentage >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ({budget.variancePercentage >= 0 ? '+' : ''}{budget.variancePercentage.toFixed(1)}%)
                      </span>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-gray-500">Projected Spend:</span>
                              <span className="font-medium text-purple-600">{formatCurrency(budget.projectedSpend)}</span>
                            </div>
                          </div>
                      )}
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

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Budget Analysis Details
              </DialogTitle>
              <DialogDescription>
                Detailed breakdown of budget performance.
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
                      <p className="text-sm text-gray-500">Spent</p>
                      <p className="text-xl font-bold text-orange-600">{formatCurrency(selectedBudget.spentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining</p>
                      <p className={`text-xl font-bold ${selectedBudget.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(selectedBudget.remainingAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Utilization</p>
                      <p className="text-xl font-bold">{selectedBudget.utilizationPercentage.toFixed(1)}%</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Variance</p>
                      <p className={`text-lg font-bold ${selectedBudget.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedBudget.variance >= 0 ? '+' : ''}{formatCurrency(selectedBudget.variance)}
                        <span className="text-sm font-normal text-gray-500 ml-2">
                      ({selectedBudget.variancePercentage >= 0 ? '+' : ''}{selectedBudget.variancePercentage.toFixed(1)}%)
                    </span>
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Period</p>
                      <p>{formatDate(selectedBudget.startDate)} - {formatDate(selectedBudget.endDate)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Trend</p>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(selectedBudget.trend)}
                        <span className="capitalize">{selectedBudget.trend}</span>
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

export default BudgetAnalysis;