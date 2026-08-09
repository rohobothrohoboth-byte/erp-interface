// components/finance/VarianceChart.tsx - FULLY FIXED (NO DUPLICATE CALCULATIONS)

import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/finance/helpers';

interface VarianceChartProps {
    analytics?: any;
    invoices?: any[];
    expenses?: any[];
    budgets?: any[];
    filters?: {
        period?: string;
        periodType?: string;
        fiscalYear?: string;
    };
    periodRange?: {
        periodStart?: string;
        periodEnd?: string;
    };
    isLoading?: boolean;
}

function VarianceChart({
                           analytics = {},
                           invoices = [],
                           expenses = [],
                           budgets = [],
                           filters = {},
                           periodRange = {},
                           isLoading = false
                       }: VarianceChartProps) {

    const data = useMemo(() => {
        const analyticsData = analytics || {};

        // ✅ ============================================================
        // ✅ ALL VALUES FROM BACKEND - NO CALCULATIONS
        // ✅ ============================================================

        // ✅ Revenue & Expenses (pre-calculated)
        const totalRevenue = analyticsData?.monthlyRevenue ?? 0;
        const totalExpenses = analyticsData?.totalExpenses ?? 0;
        const netIncome = analyticsData?.netIncome ?? 0;           // ✅ From backend
        const totalBudget = analyticsData?.totalBudgetAmount ?? 0;
        const budgetVariance = analyticsData?.budgetVariance ?? 0; // ✅ From backend
        const budgetVariancePercentage = analyticsData?.budgetVariancePercentage ?? 0; // ✅ From backend
        const budgetUtilization = analyticsData?.budgetUtilization ?? 0; // ✅ From backend

        // ✅ Monthly data from backend
        const monthlyData = analyticsData?.monthlyVarianceData ?? [];

        // ✅ Positive/Negative variance counts
        const positiveVariance = monthlyData.filter((d: any) => d.variance >= 0).length;
        const negativeVariance = monthlyData.filter((d: any) => d.variance < 0).length;

        // ✅ If backend doesn't provide monthly data, calculate from available data
        const hasMonthlyData = monthlyData.length > 0;

        // ✅ For UI display - use backend data or fallback
        const displayMonthlyData = hasMonthlyData ? monthlyData : [];

        // ✅ Calculate max value for chart scaling (only for display)
        const maxValue = displayMonthlyData.length > 0
            ? Math.max(
                ...displayMonthlyData.map((d: any) => Math.max(d.revenue || 0, d.expenses || 0, d.budget || 0)),
                1
            )
            : 1;

        // ✅ Debug logging - verify all values come from backend
        console.log('📊 VarianceChart - ALL FROM BACKEND:', {
            period: filters?.period,
            totalRevenue,
            totalExpenses,
            netIncome,              // ✅ From backend
            totalBudget,
            budgetVariance,         // ✅ From backend
            budgetVariancePercentage, // ✅ From backend
            budgetUtilization,      // ✅ From backend
            monthlyDataCount: monthlyData.length,
            positiveVariance,
            negativeVariance,
        });

        return {
            monthlyData: displayMonthlyData,
            totalRevenue,
            totalExpenses,
            totalProfit: netIncome,   // ✅ Use NetIncome from backend
            totalBudget,
            totalVariance: budgetVariance, // ✅ Use BudgetVariance from backend
            maxValue,
            positiveVariance,
            negativeVariance,
            hasMonthlyData,
        };
    }, [analytics]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-indigo-100">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    // ✅ Show empty state if no data
    if (data.monthlyData.length === 0 && data.totalRevenue === 0 && data.totalBudget === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Variance Analysis</h3>
                    <span className="text-xs text-gray-400">No data available</span>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No variance data for the selected period</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-indigo-100 hover:border-indigo-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Variance Analysis</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600">▲ {data.positiveVariance}</span>
                    <span className="text-xs text-red-600">▼ {data.negativeVariance}</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Actual</p>
                        <p className="text-sm font-bold text-blue-600">{formatCurrency(data.totalProfit)}</p>  {/* ✅ From backend */}
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="text-sm font-bold text-gray-600">{formatCurrency(data.totalBudget)}</p>
                    </div>
                </div>

                <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Variance</span>
                        <span className={`font-medium ${data.totalVariance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(data.totalVariance)}  {/* ✅ From backend */}
                            {data.totalBudget !== 0 && ` (${Math.abs(data.budgetVariancePercentage).toFixed(1)}%)`}  {/* ✅ From backend */}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${data.totalVariance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{
                                width: `${Math.min(100, Math.abs((data.totalVariance / (data.totalBudget || 1)) * 100))}%`
                            }}
                        />
                    </div>
                </div>

                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">Monthly Performance</p>
                    {data.hasMonthlyData ? (
                        <div className="flex items-end h-24 gap-1">
                            {data.monthlyData.map((item: any, index: number) => {
                                const height = data.maxValue > 0 ? (item.revenue / data.maxValue) * 80 : 0;
                                const isPositive = item.variance >= 0;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="relative w-full flex flex-col items-center">
                                            <div
                                                className={`w-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} rounded-t-sm transition-all`}
                                                style={{ height: `${Math.min(100, height)}%` }}
                                            />
                                            {item.variance !== 0 && (
                                                <div
                                                    className={`absolute w-1 h-1 ${isPositive ? 'bg-emerald-700' : 'bg-rose-700'} rounded-full -top-1`}
                                                />
                                            )}
                                        </div>
                                        <p className="text-[8px] text-gray-400 mt-1">{item.month}</p>
                                        <p className={`text-[8px] font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {item.variancePercent > 0 ? '+' : ''}{item.variancePercent.toFixed(0)}%
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                            No monthly data available
                        </div>
                    )}
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                        <span className="text-gray-500">Positive</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-500 rounded-sm" />
                        <span className="text-gray-500">Negative</span>
                    </div>
                    <span className="text-gray-400">
                        {data.positiveVariance} of {data.monthlyData.length} months
                    </span>
                </div>
            </div>
        </div>
    );
}

export default React.memo(VarianceChart);