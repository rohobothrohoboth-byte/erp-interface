// components/finance/ScenarioPlanner.tsx - FULLY FIXED (NO DUPLICATE CALCULATIONS)

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/modules/finance/utils/helpers';

interface Scenario {
    id: string;
    name: string;
    description: string;
    assumptions: {
        revenueGrowth: number;
        expenseGrowth: number;
        taxRate: number;
        investment: number;
    };
    results: {
        revenue: number;
        expenses: number;
        profit: number;
        cashFlow: number;
    };
}

interface ScenarioPlannerProps {
    analytics?: any;
    invoices?: any[];
    expenses?: any[];
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

function ScenarioPlanner({
                             analytics = {},
                             invoices = [],
                             expenses = [],
                             filters = {},
                             periodRange = {},
                             isLoading = false
                         }: ScenarioPlannerProps) {

    const [activeScenario, setActiveScenario] = useState<string>('baseline');

    // ✅ Base data from analytics (pre-calculated by backend)
    const baseData = useMemo(() => {
        const analyticsData = analytics || {};

        // ✅ ALL VALUES FROM BACKEND - NO CALCULATIONS
        const totalRevenue = analyticsData?.monthlyRevenue ?? 0;
        const totalExpenses = analyticsData?.totalExpenses ?? 0;
        const netIncome = analyticsData?.netIncome ?? 0;  // ✅ From backend

        console.log('📊 ScenarioPlanner - Base Data from Backend:', {
            period: filters?.period,
            totalRevenue,
            totalExpenses,
            netIncome,  // ✅ From backend
        });

        return {
            revenue: totalRevenue,
            expenses: totalExpenses,
            profit: netIncome  // ✅ Use NetIncome from backend
        };
    }, [analytics, filters]);

    // ✅ Generate scenarios based on base data
    const scenarios: Scenario[] = useMemo(() => {
        const baseRevenue = baseData.revenue || 100000;
        const baseExpenses = baseData.expenses || 70000;
        const baseProfit = baseData.profit || 30000;  // ✅ Use NetIncome from backend

        return [
            {
                id: 'baseline',
                name: 'Baseline',
                description: 'Current projections',
                assumptions: {
                    revenueGrowth: 0,
                    expenseGrowth: 0,
                    taxRate: 20,
                    investment: 0,
                },
                results: {
                    revenue: baseRevenue,
                    expenses: baseExpenses,
                    profit: baseProfit,  // ✅ Use baseProfit
                    cashFlow: baseProfit, // ✅ Use baseProfit
                },
            },
            {
                id: 'optimistic',
                name: 'Optimistic',
                description: '+15% revenue, -5% expenses',
                assumptions: {
                    revenueGrowth: 15,
                    expenseGrowth: -5,
                    taxRate: 20,
                    investment: 10000,
                },
                results: {
                    revenue: baseRevenue * 1.15,
                    expenses: baseExpenses * 0.95,
                    profit: (baseRevenue * 1.15) - (baseExpenses * 0.95),  // ✅ Calculate from projections
                    cashFlow: (baseRevenue * 1.15) - (baseExpenses * 0.95) - 10000,
                },
            },
            {
                id: 'pessimistic',
                name: 'Pessimistic',
                description: '-10% revenue, +10% expenses',
                assumptions: {
                    revenueGrowth: -10,
                    expenseGrowth: 10,
                    taxRate: 20,
                    investment: 5000,
                },
                results: {
                    revenue: baseRevenue * 0.9,
                    expenses: baseExpenses * 1.1,
                    profit: (baseRevenue * 0.9) - (baseExpenses * 1.1),
                    cashFlow: (baseRevenue * 0.9) - (baseExpenses * 1.1) - 5000,
                },
            },
            {
                id: 'growth',
                name: 'Growth',
                description: '+25% revenue, +10% expenses',
                assumptions: {
                    revenueGrowth: 25,
                    expenseGrowth: 10,
                    taxRate: 20,
                    investment: 20000,
                },
                results: {
                    revenue: baseRevenue * 1.25,
                    expenses: baseExpenses * 1.1,
                    profit: (baseRevenue * 1.25) - (baseExpenses * 1.1),
                    cashFlow: (baseRevenue * 1.25) - (baseExpenses * 1.1) - 20000,
                },
            },
        ];
    }, [baseData]);

    const active = scenarios.find(s => s.id === activeScenario) || scenarios[0];
    const maxValue = Math.max(...scenarios.map(s => Math.max(s.results.revenue, s.results.expenses)));

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-teal-100">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-teal-100 hover:border-teal-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Scenario Planner</h3>
                <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                    {scenarios.length} scenarios
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto">
                    {scenarios.map((scenario) => (
                        <button
                            key={scenario.id}
                            onClick={() => setActiveScenario(scenario.id)}
                            className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
                                activeScenario === scenario.id
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {scenario.name}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm font-medium text-gray-700">{active.name}</p>
                    <p className="text-xs text-gray-500">{active.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className={`text-sm font-bold ${active.results.revenue >= baseData.revenue ? 'text-blue-600' : 'text-gray-600'}`}>
                            {formatCurrency(active.results.revenue)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Expenses</p>
                        <p className={`text-sm font-bold ${active.results.expenses <= baseData.expenses ? 'text-emerald-600' : 'text-gray-600'}`}>
                            {formatCurrency(active.results.expenses)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Profit</p>
                        <p className={`text-sm font-bold ${active.results.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(active.results.profit)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Cash Flow</p>
                        <p className={`text-sm font-bold ${active.results.cashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(active.results.cashFlow)}
                        </p>
                    </div>
                </div>

                <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Assumptions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between bg-gray-50 rounded p-1.5">
                            <span className="text-gray-500">Revenue Growth</span>
                            <span className={`font-medium ${active.assumptions.revenueGrowth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {active.assumptions.revenueGrowth}%
                            </span>
                        </div>
                        <div className="flex justify-between bg-gray-50 rounded p-1.5">
                            <span className="text-gray-500">Expense Growth</span>
                            <span className={`font-medium ${active.assumptions.expenseGrowth <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {active.assumptions.expenseGrowth}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Revenue</span>
                        <span>Expenses</span>
                    </div>
                    <div className="flex items-end gap-1 h-8">
                        <div
                            className="flex-1 bg-blue-500 rounded-t-sm"
                            style={{ height: `${(active.results.revenue / maxValue) * 100}%` }}
                        />
                        <div
                            className="flex-1 bg-rose-500 rounded-t-sm"
                            style={{ height: `${(active.results.expenses / maxValue) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(ScenarioPlanner);