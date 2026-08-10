import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    DollarSign,
    Calendar,
    Building2,
    User,
    Loader2,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    PieChart,
    BarChart3,
    Download,
    Edit,
    Plus,
    Trash2,
    CheckCircle,
    AlertCircle,
    Clock,
    XCircle,
    ChevronDown,
    ChevronUp,
    Target,
    Flag,
    Award,
    Zap,
    FileText
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { showToast } from '@/shared/layout/layout';
import { getProjectById } from '@/modules/plandev/services/project.api';
import type { Project, Budget } from '@/modules/plandev/types/types';

// ============================================================
// BUDGET CONFIGURATIONS
// ============================================================

const budgetTypeColors: Record<string, string> = {
    Personnel: 'bg-blue-100 text-blue-800 border-blue-200',
    Equipment: 'bg-purple-100 text-purple-800 border-purple-200',
    Materials: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Travel: 'bg-orange-100 text-orange-800 border-orange-200',
    Training: 'bg-green-100 text-green-800 border-green-200',
    Software: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Infrastructure: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    Consulting: 'bg-pink-100 text-pink-800 border-pink-200',
    Marketing: 'bg-rose-100 text-rose-800 border-rose-200',
    Operations: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    InProgress: 'bg-blue-100 text-blue-800 border-blue-200',
    Completed: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <FileText className="w-4 h-4" />,
    Approved: <CheckCircle className="w-4 h-4" />,
    InProgress: <Clock className="w-4 h-4" />,
    Completed: <Award className="w-4 h-4" />,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const StrategicPlanBudget = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [strategicPlan, setStrategicPlan] = useState<Project | null>(null);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState(true);
    const [view, setView] = useState<'summary' | 'detailed'>('summary');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Fetch strategic plan with budgets
    const fetchData = useCallback(async () => {
        if (!id) {
            setError('No strategic plan ID provided');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log(`📡 Fetching strategic plan with ID: ${id}`);
            const data = await getProjectById(id);
            setStrategicPlan(data);
            setBudgets(data.budgets || []);
            console.log('✅ Budgets loaded:', data.budgets?.length || 0);
        } catch (error: any) {
            console.error('Error fetching strategic plan:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load budget data';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getBudgetStatus = (budget: Budget) => {
        const utilization = budget.plannedAmount > 0
            ? (budget.actualAmount / budget.plannedAmount) * 100
            : 0;

        if (utilization > 100) {
            return { label: 'Over Budget', color: 'text-red-600', bgColor: 'bg-red-100' };
        } else if (utilization > 80) {
            return { label: 'At Risk', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        } else {
            return { label: 'On Track', color: 'text-green-600', bgColor: 'bg-green-100' };
        }
    };

    const getBudgetTypeBadge = (type?: string) => {
        if (!type) return null;
        const colors = budgetTypeColors[type] || 'bg-gray-100 text-gray-800';
        return (
            <Badge className={colors}>
                {type}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {statusIcons[status] || <AlertCircle className="w-4 h-4" />}
                <span>{status}</span>
            </Badge>
        );
    };

    // Calculate budget metrics
    const totalPlanned = budgets.reduce((acc, b) => acc + (b.plannedAmount || 0), 0);
    const totalActual = budgets.reduce((acc, b) => acc + (b.actualAmount || 0), 0);
    const totalVariance = totalPlanned - totalActual;
    const utilization = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

    // Group budgets by category for summary view
    const budgetCategories = budgets.reduce((acc, budget) => {
        const category = budget.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = {
                planned: 0,
                actual: 0,
                budgets: []
            };
        }
        acc[category].planned += budget.plannedAmount || 0;
        acc[category].actual += budget.actualAmount || 0;
        acc[category].budgets.push(budget);
        return acc;
    }, {} as Record<string, { planned: number; actual: number; budgets: Budget[] }>);

    // Get unique categories
    const categories = Object.keys(budgetCategories);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading budget data...</p>
                </div>
            </div>
        );
    }

    if (error || !strategicPlan) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{error || 'Strategic plan not found'}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/plandev/strategic-plans')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Strategic Plans
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/plandev/strategic-plans/${id}`)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
                        <p className="text-sm text-gray-500">
                            {strategicPlan.name} • {strategicPlan.code} • {budgets.length} budget items
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setRefreshing(true);
                            fetchData();
                        }}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setView(view === 'summary' ? 'detailed' : 'summary')}
                    >
                        {view === 'summary' ? (
                            <BarChart3 className="w-4 h-4 mr-2" />
                        ) : (
                            <PieChart className="w-4 h-4 mr-2" />
                        )}
                        {view === 'summary' ? 'Detailed View' : 'Summary View'}
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate(`/plandev/strategic-plans/${id}/budget/create`)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Budget
                    </Button>
                </div>
            </div>

            {/* Budget Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Planned</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(totalPlanned)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Actual</p>
                        <p className={`text-2xl font-bold ${
                            totalActual > totalPlanned ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                            {formatCurrency(totalActual)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Variance</p>
                        <p className={`text-2xl font-bold ${
                            totalVariance >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                            {formatCurrency(totalVariance)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Utilization</p>
                        <p className={`text-2xl font-bold ${
                            utilization > 100 ? 'text-red-600' :
                                utilization > 80 ? 'text-yellow-600' :
                                    'text-emerald-600'
                        }`}>
                            {utilization.toFixed(1)}%
                        </p>
                        <Progress
                            value={Math.min(utilization, 100)}
                            className={`h-1.5 mt-1 ${
                                utilization > 100 ? 'bg-red-200' :
                                    utilization > 80 ? 'bg-yellow-200' :
                                        'bg-emerald-200'
                            }`}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Budget Categories */}
            <Card>
                <CardContent className="p-6">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedCategories(!expandedCategories)}
                    >
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            Budget Categories
                            <Badge variant="outline" className="ml-2">
                                {categories.length} categories • {budgets.length} items
                            </Badge>
                        </h3>
                        <Button variant="ghost" size="sm">
                            {expandedCategories ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </Button>
                    </div>

                    {expandedCategories && (
                        <div className="mt-4 space-y-4">
                            {budgets.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                    <p>No budget categories defined</p>
                                    <p className="text-sm">Add budget categories to track spending</p>
                                    <Button
                                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                                        onClick={() => navigate(`/plandev/strategic-plans/${id}/budget/create`)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Budget Item
                                    </Button>
                                </div>
                            ) : view === 'summary' ? (
                                // Summary View - Grouped by Category
                                categories.map((category) => {
                                    const catData = budgetCategories[category];
                                    const categoryUtilization = catData.planned > 0
                                        ? (catData.actual / catData.planned) * 100
                                        : 0;

                                    return (
                                        <div
                                            key={category}
                                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                        <DollarSign className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{category}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {catData.budgets.length} items
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge className={
                                                        categoryUtilization > 100 ? 'bg-red-100 text-red-800' :
                                                            categoryUtilization > 80 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                    }>
                                                        {categoryUtilization.toFixed(1)}% used
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Planned</p>
                                                    <p className="font-medium text-gray-900">
                                                        {formatCurrency(catData.planned)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Actual</p>
                                                    <p className={`font-medium ${
                                                        catData.actual > catData.planned
                                                            ? 'text-red-600'
                                                            : 'text-emerald-600'
                                                    }`}>
                                                        {formatCurrency(catData.actual)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Variance</p>
                                                    <p className={`font-medium ${
                                                        (catData.planned - catData.actual) >= 0
                                                            ? 'text-emerald-600'
                                                            : 'text-red-600'
                                                    }`}>
                                                        {formatCurrency(catData.planned - catData.actual)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <Progress
                                                    value={Math.min(categoryUtilization, 100)}
                                                    className={`h-1.5 ${
                                                        categoryUtilization > 100 ? 'bg-red-200' :
                                                            categoryUtilization > 80 ? 'bg-yellow-200' :
                                                                'bg-emerald-200'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                // Detailed View - Individual Budget Items
                                budgets.map((budget) => {
                                    const status = getBudgetStatus(budget);
                                    const utilization = budget.plannedAmount > 0
                                        ? (budget.actualAmount / budget.plannedAmount) * 100
                                        : 0;

                                    return (
                                        <div
                                            key={budget.id}
                                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status.bgColor}`}>
                                                        {utilization > 100 ? (
                                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                                        ) : (
                                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{budget.category}</p>
                                                        <div className="flex items-center gap-2">
                                                            {getBudgetTypeBadge(budget.budgetType)}
                                                            {getStatusBadge(budget.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge className={status.bgColor}>
                                                        <span className={status.color}>{status.label}</span>
                                                    </Badge>
                                                    <span className={`text-sm font-medium ${
                                                        utilization > 100 ? 'text-red-600' : 'text-gray-700'
                                                    }`}>
                                                        {utilization.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Planned</p>
                                                    <p className="font-medium text-gray-900">
                                                        {formatCurrency(budget.plannedAmount)}
                                                    </p>
                                                    {budget.plannedQuantity > 0 && (
                                                        <p className="text-xs text-gray-400">
                                                            Qty: {budget.plannedQuantity} {budget.unit || ''}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Actual</p>
                                                    <p className={`font-medium ${
                                                        budget.actualAmount > budget.plannedAmount
                                                            ? 'text-red-600'
                                                            : 'text-emerald-600'
                                                    }`}>
                                                        {formatCurrency(budget.actualAmount)}
                                                    </p>
                                                    {budget.actualQuantity > 0 && (
                                                        <p className="text-xs text-gray-400">
                                                            Qty: {budget.actualQuantity} {budget.unit || ''}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Variance</p>
                                                    <p className={`font-medium ${
                                                        (budget.variance || 0) >= 0
                                                            ? 'text-emerald-600'
                                                            : 'text-red-600'
                                                    }`}>
                                                        {formatCurrency(budget.variance || 0)}
                                                    </p>
                                                </div>
                                            </div>

                                            {budget.description && (
                                                <p className="text-xs text-gray-400 mt-2">{budget.description}</p>
                                            )}

                                            <div className="mt-2">
                                                <Progress
                                                    value={Math.min(utilization, 100)}
                                                    className={`h-1.5 ${
                                                        utilization > 100 ? 'bg-red-200' :
                                                            utilization > 80 ? 'bg-yellow-200' :
                                                                'bg-emerald-200'
                                                    }`}
                                                />
                                            </div>

                                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-blue-600"
                                                    onClick={() => navigate(`/plandev/strategic-plans/${id}/budget/${budget.id}/edit`)}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        if (confirm(`Delete budget item "${budget.category}"?`)) {
                                                            showToast.info('Delete functionality coming soon');
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Export Actions */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => showToast.info('Export functionality coming soon')}
                        >
                            <Download className="w-4 h-4" />
                            Export Budget Report
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => showToast.info('Export functionality coming soon')}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Export Summary
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => showToast.info('Export functionality coming soon')}
                        >
                            <FileText className="w-4 h-4" />
                            Export Detailed Report
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Budget Tips */}
            {budgets.length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-800">Budget Insights</h4>
                                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                                    <li>• Total budget utilization: <strong>{utilization.toFixed(1)}%</strong></li>
                                    <li>• {budgets.filter(b => b.status === 'Approved').length} approved items, {budgets.filter(b => b.status === 'InProgress').length} in progress</li>
                                    <li>• {totalVariance >= 0 ? 'Under budget by' : 'Over budget by'} <strong>{formatCurrency(Math.abs(totalVariance))}</strong></li>
                                    {categories.length > 0 && (
                                        <li>• {categories.length} budget categories</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default StrategicPlanBudget;