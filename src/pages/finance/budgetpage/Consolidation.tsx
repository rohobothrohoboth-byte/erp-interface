// src/pages/finance/budgetpage/BudgetConsolidation.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Layers, RefreshCw, Search, Filter, ChevronLeft, ChevronRight,
    DollarSign, Building2, Users, Calendar, FileText,
    TrendingUp, TrendingDown, PieChart, Download, Eye
} from 'lucide-react';
import { getBudgets, getBranches, getDepartments } from '../../../services/finance/financeApi';
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

interface ConsolidatedBudget {
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
    branchId?: string;
    branchName?: string;
    departmentId?: string;
    departmentName?: string;
    subBudgets?: ConsolidatedBudget[];
    level: number;
}

const BudgetConsolidation: React.FC = () => {
    const [consolidatedData, setConsolidatedData] = useState<ConsolidatedBudget[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('All');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBudget, setSelectedBudget] = useState<ConsolidatedBudget | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [budgetsRes, branchesRes, departmentsRes] = await Promise.all([
                getBudgets(),
                getBranches(),
                getDepartments(),
            ]);

            const budgetsData = budgetsRes.data.data || budgetsRes.data || [];
            const branchesData = branchesRes.data.data || branchesRes.data || [];
            const departmentsData = departmentsRes.data.data || departmentsRes.data || [];

            setBranches(branchesData);
            setDepartments(departmentsData);

            // Build consolidated tree structure
            const consolidated = buildConsolidatedTree(budgetsData, branchesData, departmentsData);
            setConsolidatedData(consolidated);
        } catch (error) {
            console.error('Error fetching consolidation data:', error);
            showToast.error('Failed to load consolidation data');
        } finally {
            setLoading(false);
        }
    };

    const buildConsolidatedTree = (budgets: any[], branches: any[], departments: any[]): ConsolidatedBudget[] => {
        // Group budgets by branch
        const branchMap = new Map();
        branches.forEach((b: any) => {
            const branchBudgets = budgets.filter((budget: any) => budget.branchId === b.id);
            const totalAmount = branchBudgets.reduce((sum: number, budget: any) => sum + (budget.totalAmount || 0), 0);
            const spentAmount = branchBudgets.reduce((sum: number, budget: any) => sum + (budget.spentAmount || 0), 0);

            branchMap.set(b.id, {
                id: b.id,
                name: `Branch: ${b.name}`,
                totalAmount,
                spentAmount,
                remainingAmount: totalAmount - spentAmount,
                utilizationPercentage: totalAmount > 0 ? (spentAmount / totalAmount) * 100 : 0,
                status: 'Active',
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                branchId: b.id,
                branchName: b.name,
                level: 0,
                subBudgets: branchBudgets.map((budget: any) => ({
                    id: budget.id,
                    name: budget.name,
                    description: budget.description,
                    totalAmount: budget.totalAmount || 0,
                    spentAmount: budget.spentAmount || 0,
                    remainingAmount: (budget.totalAmount || 0) - (budget.spentAmount || 0),
                    utilizationPercentage: (budget.totalAmount || 0) > 0 ? ((budget.spentAmount || 0) / (budget.totalAmount || 0)) * 100 : 0,
                    status: budget.status,
                    startDate: budget.startDate,
                    endDate: budget.endDate,
                    branchId: budget.branchId,
                    branchName: b.name,
                    level: 1,
                })),
            });
        });

        return Array.from(branchMap.values());
    };

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
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

    const filteredData = consolidatedData.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBranch = filterBranch === 'All' || item.branchId === filterBranch;
        return matchesSearch && matchesBranch;
    });

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Calculate summary stats
    const totalBudget = consolidatedData.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalSpent = consolidatedData.reduce((sum, item) => sum + item.spentAmount, 0);
    const totalRemaining = consolidatedData.reduce((sum, item) => sum + item.remainingAmount, 0);

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
                    <h1 className="text-2xl font-bold text-gray-900">Budget Consolidation</h1>
                    <p className="text-sm text-gray-500">Consolidated view of all budgets by branch</p>
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
                    >
                        <Download size={16} />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Total Consolidated Budget</p>
                                <p className="text-2xl font-bold text-indigo-900">{formatCurrency(totalBudget)}</p>
                            </div>
                            <div className="p-3 bg-indigo-200 rounded-lg">
                                <Layers className="h-6 w-6 text-indigo-700" />
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
                                <p className="text-sm text-green-700 font-medium">Total Remaining</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalRemaining)}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-700" />
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
                        placeholder="Search consolidated budgets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger className="md:w-48">
                        <Building2 className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Branches</SelectItem>
                        {branches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="md:w-48">
                        <Users className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Departments</SelectItem>
                        {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Consolidated Tree View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spent</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remaining</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No consolidated budgets found
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr className="bg-indigo-50/50 hover:bg-indigo-100/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleExpand(item.id)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    {expandedItems.has(item.id) ? '▼' : '▶'}
                                                </button>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-500">{item.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{item.branchName || '-'}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-right text-indigo-600">
                                            {formatCurrency(item.totalAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-orange-600">
                                            {formatCurrency(item.spentAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium">
                        <span className={item.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(item.remainingAmount)}
                        </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="w-24">
                                                <Progress
                                                    value={item.utilizationPercentage}
                                                    className={`h-2 ${getUtilizationColor(item.utilizationPercentage)}`}
                                                />
                                                <span className="text-xs text-gray-500 mt-1 block">
                            {item.utilizationPercentage.toFixed(1)}%
                          </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedBudget(item);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedItems.has(item.id) && item.subBudgets && item.subBudgets.map((sub) => (
                                        <tr key={sub.id} className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 pl-10">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{sub.name}</p>
                                                    {sub.description && (
                                                        <p className="text-xs text-gray-500">{sub.description}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{sub.branchName || '-'}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-right text-indigo-600">
                                                {formatCurrency(sub.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-orange-600">
                                                {formatCurrency(sub.spentAmount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium">
                          <span className={sub.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(sub.remainingAmount)}
                          </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="w-24">
                                                    <Progress
                                                        value={sub.utilizationPercentage}
                                                        className={`h-2 ${getUtilizationColor(sub.utilizationPercentage)}`}
                                                    />
                                                    <span className="text-xs text-gray-500 mt-1 block">
                              {sub.utilizationPercentage.toFixed(1)}%
                            </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge className={getStatusColor(sub.status)}>
                                                    {sub.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} consolidated budgets
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
            </div>

            {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-indigo-600" />
                            Consolidated Budget Details
                        </DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of consolidated budget.
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
                                    <p className="text-sm text-gray-500">Branch</p>
                                    <p>{selectedBudget.branchName || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
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
                                {selectedBudget.subBudgets && selectedBudget.subBudgets.length > 0 && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500 mb-2">Sub-Budgets</p>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {selectedBudget.subBudgets.map((sub) => (
                                                <div key={sub.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                                    <span className="text-sm">{sub.name}</span>
                                                    <span className="text-sm font-medium text-indigo-600">{formatCurrency(sub.totalAmount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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

export default BudgetConsolidation;