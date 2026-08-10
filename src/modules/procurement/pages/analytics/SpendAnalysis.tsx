// src/pages/procurement/analytics/SpendAnalysis.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Download,
    Filter,
    BarChart3,
    PieChart,
    Building2,
    Package,
    Users,
    Search,
    ChevronDown,
    ChevronUp,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { getSpendAnalysis } from '@/modules/procurement/services/reports.api';
import type {  SpendAnalysis as SpendAnalysisType } from '@/modules/procurement/services/reports.api';

// ============================================================
// MAIN COMPONENT
// ============================================================

const SpendAnalysis = () => {
    const navigate = useNavigate();

    // State
    const [spendData, setSpendData] = useState<SpendAnalysisType | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState<string>('Q3 2024');
    const [expandedCategories, setExpandedCategories] = useState(true);
    const [expandedVendors, setExpandedVendors] = useState(true);
    const [expandedBudget, setExpandedBudget] = useState(true);

    // Fetch spend analysis
    const fetchSpendAnalysis = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSpendAnalysis(period);
            setSpendData(data);
            console.log('✅ Spend analysis loaded:', data);
        } catch (error: any) {
            console.error('Error fetching spend analysis:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load spend analysis');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [period]);

    // Initial load
    useEffect(() => {
        fetchSpendAnalysis();
    }, [fetchSpendAnalysis]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchSpendAnalysis();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <TrendingUp className="w-4 h-4 text-gray-400" />;
    };

    const getMaxValue = (data: any[], key: string) => {
        if (!data || data.length === 0) return 1;
        return Math.max(...data.map(item => item[key] || 0));
    };

    const getScoreColor = (utilization: number) => {
        if (utilization > 90) return 'bg-red-500';
        if (utilization > 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getScoreBadgeColor = (utilization: number) => {
        if (utilization > 90) return 'bg-red-100 text-red-800 border-red-200';
        if (utilization > 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    if (loading && !spendData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading spend analysis...</p>
                </div>
            </div>
        );
    }

    if (!spendData) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No spend data available</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleRefresh}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Spend Analysis</h1>
                    <p className="text-sm text-gray-500">
                        {spendData.period} • Analyze procurement spending patterns
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {spendData.period}
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Spend</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(spendData.totalSpend)}
                        </p>
                        <p className={`text-xs flex items-center gap-1 mt-1 ${
                            spendData.monthlyChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {spendData.monthlyChange > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(spendData.monthlyChange)}% from previous period
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Top Category</p>
                        <p className="text-lg font-bold text-blue-700">
                            {spendData.categories.length > 0 ? spendData.categories[0].name : 'N/A'}
                        </p>
                        <p className="text-sm text-blue-600">
                            {spendData.categories.length > 0 ? formatCurrency(spendData.categories[0].amount) : 'N/A'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-600">Top Vendor</p>
                        <p className="text-lg font-bold text-purple-700">
                            {spendData.topVendors.length > 0 ? spendData.topVendors[0].name : 'N/A'}
                        </p>
                        <p className="text-sm text-purple-600">
                            {spendData.topVendors.length > 0 ? formatCurrency(spendData.topVendors[0].amount) : 'N/A'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Budget Utilization</p>
                        <p className="text-lg font-bold text-green-700">
                            {spendData.budgetUtilizationPercentage.toFixed(0)}%
                        </p>
                        <p className="text-sm text-green-600">of total budget used</p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trend */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Monthly Spend Trend</h3>
                    {spendData.monthlyTrend.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No monthly trend data available</p>
                    ) : (
                        <div className="space-y-3">
                            {spendData.monthlyTrend.map((item, index) => {
                                const maxValue = getMaxValue(spendData.monthlyTrend, 'amount');
                                const percentage = maxValue > 0 ? (item.amount / maxValue) * 100 : 0;
                                return (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{item.month}</span>
                                            <span className="font-medium text-gray-900">
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Categories */}
            <Card>
                <CardContent className="p-6">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedCategories(!expandedCategories)}
                    >
                        <h3 className="font-semibold text-gray-900">Spend by Category</h3>
                        <Button variant="ghost" size="sm">
                            {expandedCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>
                    {expandedCategories && (
                        <div className="mt-4 space-y-4">
                            {spendData.categories.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No category data available</p>
                            ) : (
                                spendData.categories.map((category, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-900">
                                                        {formatCurrency(category.amount)}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {category.percentage}%
                                                    </Badge>
                                                    {getTrendIcon(category.trend)}
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${
                                                        category.percentage > 30 ? 'bg-red-500' :
                                                            category.percentage > 15 ? 'bg-yellow-500' :
                                                                'bg-green-500'
                                                    }`}
                                                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Vendors */}
            <Card>
                <CardContent className="p-6">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedVendors(!expandedVendors)}
                    >
                        <h3 className="font-semibold text-gray-900">Top Vendors by Spend</h3>
                        <Button variant="ghost" size="sm">
                            {expandedVendors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>
                    {expandedVendors && (
                        <div className="mt-4 space-y-3">
                            {spendData.topVendors.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No vendor data available</p>
                            ) : (
                                spendData.topVendors.map((vendor, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{vendor.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {formatCurrency(vendor.amount)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-800">
                                            {vendor.percentage}%
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Budget Utilization */}
            <Card>
                <CardContent className="p-6">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedBudget(!expandedBudget)}
                    >
                        <h3 className="font-semibold text-gray-900">Budget Utilization</h3>
                        <Button variant="ghost" size="sm">
                            {expandedBudget ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>
                    {expandedBudget && (
                        <div className="mt-4 space-y-3">
                            {spendData.budgetUtilization.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No budget data available</p>
                            ) : (
                                spendData.budgetUtilization.map((item, index) => {
                                    const utilization = item.utilizationPercentage ||
                                        (item.budgeted > 0 ? (item.actual / item.budgeted) * 100 : 0);
                                    return (
                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {item.category}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600">
                                                        {formatCurrency(item.actual)} / {formatCurrency(item.budgeted)}
                                                    </span>
                                                    <Badge className={getScoreBadgeColor(utilization)}>
                                                        {utilization.toFixed(0)}%
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(utilization)}`}
                                                    style={{ width: `${Math.min(utilization, 100)}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Variance: {formatCurrency(item.variance)}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default SpendAnalysis;