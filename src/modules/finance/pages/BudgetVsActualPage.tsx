// src/pages/finance/BudgetVsActualPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBudgetVsActual, getBudgets } from '@/modules/finance/services/finance.api';

interface BudgetVsActualData {
    budgetName: string;
    startDate: string;
    endDate: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
    variancePercentage: number;
    lines: Array<{
        accountName: string;
        accountCode: string;
        budgetAmount: number;
        actualAmount: number;
        variance: number;
        variancePercentage: number;
    }>;
}

const BudgetVsActualPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const budgetId = searchParams.get('budgetId');

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<BudgetVsActualData | null>(null);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [selectedBudgetId, setSelectedBudgetId] = useState<string>(budgetId || '');

    useEffect(() => {
        fetchBudgets();
        if (budgetId) {
            fetchData(budgetId);
        }
    }, [budgetId]);

    const fetchBudgets = async () => {
        try {
            const res = await getBudgets();
            const data = res.data.data || res.data || [];
            setBudgets(data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    };

    const fetchData = async (id: string) => {
        try {
            setLoading(true);
            const res = await getBudgetVsActual({ budgetId: id });
            setData(res.data.data || res.data);
        } catch (error) {
            console.error('Error fetching budget vs actual:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBudgetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedBudgetId(id);
        if (id) {
            fetchData(id);
            navigate(`?budgetId=${id}`, { replace: true });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
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
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/finance')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Budget vs Actual</h1>
                        <p className="text-gray-500">Compare budgeted amounts against actual spending</p>
                    </div>
                </div>
            </div>

            {/* Budget Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Budget
                </label>
                <select
                    value={selectedBudgetId}
                    onChange={handleBudgetChange}
                    className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">Select a budget...</option>
                    {budgets.map((budget) => (
                        <option key={budget.id} value={budget.id}>
                            {budget.name} ({formatDate(budget.startDate)} - {formatDate(budget.endDate)})
                        </option>
                    ))}
                </select>
            </div>

            {data ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <p className="text-sm text-gray-500">Budget Amount</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.budgetAmount)}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <p className="text-sm text-gray-500">Actual Amount</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.actualAmount)}</p>
                        </div>
                        <div className={`bg-white rounded-xl shadow-sm border p-4 ${
                            data.variance >= 0 ? 'border-green-200' : 'border-red-200'
                        }`}>
                            <p className="text-sm text-gray-500">Variance</p>
                            <p className={`text-2xl font-bold ${
                                data.variance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {formatCurrency(data.variance)}
                            </p>
                        </div>
                        <div className={`bg-white rounded-xl shadow-sm border p-4 ${
                            data.variancePercentage >= 0 ? 'border-green-200' : 'border-red-200'
                        }`}>
                            <p className="text-sm text-gray-500">Variance %</p>
                            <p className={`text-2xl font-bold ${
                                data.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {data.variancePercentage.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    {/* Budget Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">
                                {data.budgetName}
                                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({formatDate(data.startDate)} - {formatDate(data.endDate)})
                </span>
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variance %</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {data.lines.map((line, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div>
                                                <span>{line.accountName}</span>
                                                <span className="text-gray-400 ml-2">({line.accountCode})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">{formatCurrency(line.budgetAmount)}</td>
                                        <td className="px-6 py-4 text-sm text-right">{formatCurrency(line.actualAmount)}</td>
                                        <td className={`px-6 py-4 text-sm text-right font-medium ${
                                            line.variance >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {formatCurrency(line.variance)}
                                        </td>
                                        <td className={`px-6 py-4 text-sm text-right font-medium ${
                                            line.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {line.variancePercentage.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                                {/* Total Row */}
                                <tr className="bg-gray-50 font-medium">
                                    <td className="px-6 py-4 text-sm">TOTAL</td>
                                    <td className="px-6 py-4 text-sm text-right">{formatCurrency(data.budgetAmount)}</td>
                                    <td className="px-6 py-4 text-sm text-right">{formatCurrency(data.actualAmount)}</td>
                                    <td className={`px-6 py-4 text-sm text-right ${
                                        data.variance >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {formatCurrency(data.variance)}
                                    </td>
                                    <td className={`px-6 py-4 text-sm text-right ${
                                        data.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {data.variancePercentage.toFixed(2)}%
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select a budget to see the comparison</p>
                </div>
            )}
        </motion.div>
    );
};

export default BudgetVsActualPage;