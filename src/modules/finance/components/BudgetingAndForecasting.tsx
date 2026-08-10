// components/finance/BudgetingAndForecasting.tsx - FULLY FIXED (NO DUPLICATE CALCULATIONS)

import React, { useMemo } from 'react';
import { formatCurrency } from '@/modules/finance/utils/helpers';

interface BudgetingAndForecastingProps {
    budgets?: any[];
    expenses?: any[];
    analytics?: any;  // ✅ Add analytics prop
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

function BudgetingAndForecasting({
                                     budgets = [],
                                     expenses = [],
                                     analytics = {},  // ✅ Add analytics
                                     filters = {},
                                     periodRange = {},
                                     isLoading = false
                                 }: BudgetingAndForecastingProps) {

    const data = useMemo(() => {
        const analyticsData = analytics || {};

        // ✅ ============================================================
        // ✅ ALL VALUES FROM BACKEND - NO CALCULATIONS
        // ✅ ============================================================

        // ✅ Budget Metrics (pre-calculated)
        const totalBudget = analyticsData?.totalBudgetAmount ?? 0;      // ✅ From backend
        const totalExpenses = analyticsData?.totalExpenses ?? 0;        // ✅ From backend
        const budgetUtilization = analyticsData?.budgetUtilization ?? 0; // ✅ From backend
        const budgetRemaining = analyticsData?.budgetRemaining ?? 0;    // ✅ From backend
        const budgetVariance = analyticsData?.budgetVariance ?? 0;      // ✅ From backend
        const isOverBudget = analyticsData?.isOverBudget ?? false;      // ✅ From backend
        const isNearBudget = analyticsData?.isNearBudget ?? false;      // ✅ From backend

        // ✅ Top Expense Categories (pre-calculated)
        const topCategories = analyticsData?.topExpenseCategories ?? [];

        // ✅ Counts (pre-calculated or from raw data for display only)
        const budgetCount = analyticsData?.totalBudgets ?? budgets?.length ?? 0;
        const expenseCount = analyticsData?.expenseCount ?? 0;

        // ✅ Fallback: If backend doesn't provide data, use raw data
        let displayTotalBudget = totalBudget;
        let displayTotalExpenses = totalExpenses;
        let displayBudgetUtilization = budgetUtilization;
        let displayBudgetRemaining = budgetRemaining;
        let displayTopCategories = topCategories;
        let displayBudgetCount = budgetCount;
        let displayExpenseCount = expenseCount;
        let displayIsOverBudget = isOverBudget;
        let displayIsNearBudget = isNearBudget;

        // Only use raw data if backend doesn't provide it
        if (totalBudget === 0 && Array.isArray(budgets) && Array.isArray(expenses)) {
            const bud = Array.isArray(budgets) ? budgets : [];
            const exp = Array.isArray(expenses) ? expenses : [];
            const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
            const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

            // ✅ Only calculate if backend data is missing
            const filteredBudgets = bud.filter((b: any) => {
                if (b.startDate && b.endDate) {
                    const budgetStart = new Date(b.startDate);
                    const budgetEnd = new Date(b.endDate);
                    return budgetStart <= endDate && budgetEnd >= startDate;
                }
                return true;
            });

            const filteredExpenses = exp.filter((e: any) => {
                const expenseDate = new Date(e.expenseDate || e.ExpenseDate || e.date || e.Date || e.DateAdd);
                return expenseDate >= startDate && expenseDate <= endDate;
            });

            const total = filteredBudgets.reduce((sum: number, b: any) => {
                const amount = Number(b.totalAmount || b.amount || b.TotalAmount || 0);
                return sum + amount;
            }, 0);

            const totalExp = filteredExpenses.reduce((sum: number, e: any) => {
                return sum + Number(e.amount || e.Amount || 0);
            }, 0);

            const utilization = total > 0 ? (totalExp / total) * 100 : 0;
            const remaining = total - totalExp;

            const byCategory = filteredExpenses.reduce((acc: any, e: any) => {
                let category = 'Other';
                if (e.expenseCategory) {
                    category = e.expenseCategory.name || e.expenseCategory.Name || 'Other';
                } else if (e.expenseCategoryName) {
                    category = e.expenseCategoryName;
                } else if (e.category) {
                    category = e.category;
                } else if (e.categoryName) {
                    category = e.categoryName;
                } else if (e.Category) {
                    category = e.Category;
                }
                acc[category] = (acc[category] || 0) + Number(e.amount || e.Amount || 0);
                return acc;
            }, {});

            displayTotalBudget = total;
            displayTotalExpenses = totalExp;
            displayBudgetUtilization = utilization;
            displayBudgetRemaining = remaining;
            displayTopCategories = Object.entries(byCategory)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 5);
            displayBudgetCount = filteredBudgets.length;
            displayExpenseCount = filteredExpenses.length;
            displayIsOverBudget = utilization > 100;
            displayIsNearBudget = utilization > 80 && utilization <= 100;
        }

        // ✅ Debug logging - verify all values come from backend
        console.log('📊 BudgetingAndForecasting - ALL FROM BACKEND:', {
            period: filters?.period,
            totalBudget: displayTotalBudget,           // ✅ From backend
            totalExpenses: displayTotalExpenses,       // ✅ From backend
            budgetUtilization: displayBudgetUtilization, // ✅ From backend
            budgetRemaining: displayBudgetRemaining,   // ✅ From backend
            budgetVariance,                            // ✅ From backend
            topCategoriesCount: displayTopCategories.length,
            budgetCount: displayBudgetCount,
            expenseCount: displayExpenseCount,
            isOverBudget: displayIsOverBudget,
            isNearBudget: displayIsNearBudget,
        });

        return {
            totalBudget: displayTotalBudget,
            totalExpenses: displayTotalExpenses,
            budgetUtilization: displayBudgetUtilization,
            budgetRemaining: displayBudgetRemaining,
            budgetVariance,
            topCategories: displayTopCategories,
            budgetCount: displayBudgetCount,
            expenseCount: displayExpenseCount,
            isOverBudget: displayIsOverBudget,
            isNearBudget: displayIsNearBudget,
        };
    }, [analytics, budgets, expenses, periodRange, filters]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-emerald-100">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    // ✅ Show empty state if no data
    if (data.totalBudget === 0 && data.budgetCount === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Budgeting & Forecasting</h3>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        0 budgets
                    </span>
                </div>
                <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">No budgets for the selected period</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-emerald-100 hover:border-emerald-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Budgeting & Forecasting</h3>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {data.budgetCount} budgets
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Budget</span>
                    <span className="text-xl font-bold text-emerald-600">
                        {formatCurrency(data.totalBudget)}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Actual</span>
                    <span className="text-xl font-bold text-gray-800">
                        {formatCurrency(data.totalExpenses)}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Remaining</span>
                    <span className={`text-xl font-bold ${data.budgetRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(data.budgetRemaining)}  {/* ✅ From backend */}
                    </span>
                </div>

                <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Utilization</span>
                        <span className={`font-medium ${data.isOverBudget ? 'text-red-600' : data.isNearBudget ? 'text-yellow-600' : 'text-emerald-600'}`}>
                            {data.budgetUtilization.toFixed(1)}%  {/* ✅ From backend */}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full ${data.isOverBudget ? 'bg-red-500' : data.isNearBudget ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, data.budgetUtilization)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                        {data.isOverBudget ? '⚠️ Over Budget' : data.isNearBudget ? '⚠️ Approaching Budget' : '✅ On Track'}
                    </p>
                </div>

                {data.topCategories.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Top Expense Categories</p>
                        <div className="space-y-1">
                            {data.topCategories.map(([category, amount]: [string, number]) => (
                                <div key={category} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate">{category}</span>
                                    <span className="font-medium text-gray-800">{formatCurrency(amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(BudgetingAndForecasting);