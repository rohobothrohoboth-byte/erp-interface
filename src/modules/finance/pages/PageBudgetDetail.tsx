// src/pages/finance/PageBudgetDetail.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, RefreshCw, Calendar, DollarSign, PieChart } from 'lucide-react';
import { getBudgetById, toggleBudgetStatus, deleteBudget } from  '@/modules/finance/services/finance.api';

interface BudgetLine {
    id: string;
    accountId: string;
    accountName?: string;
    accountCode?: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    description?: string;
}

interface BudgetDetail {
    id: string;
    name: string;
    description?: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    status: string;
    branchId?: string;
    branchName?: string;
    departmentId?: string;
    departmentName?: string;
    lines: BudgetLine[];
    dateAdd: string;
    dateMod?: string;
}

const PageBudgetDetail: React.FC = () => {
    const { budgetId } = useParams<{ budgetId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [budget, setBudget] = useState<BudgetDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (budgetId) {
            fetchBudget(budgetId);
        }
    }, [budgetId]);

    const fetchBudget = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await getBudgetById(id);
            setBudget(res.data.data || res.data);
        } catch (error) {
            console.error('Error fetching budget:', error);
            setError('Failed to load budget details');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!budgetId) return;
        try {
            await toggleBudgetStatus(budgetId);
            await fetchBudget(budgetId);
        } catch (error) {
            console.error('Error toggling budget status:', error);
        }
    };

    const handleDelete = async () => {
        if (!budgetId) return;
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await deleteBudget(budgetId);
                navigate('/finance/budget');
            } catch (error) {
                console.error('Error deleting budget:', error);
            }
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
            month: 'long',
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

    if (error || !budget) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">{error || 'Budget not found'}</p>
                <button
                    onClick={() => navigate('/finance/budget')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Back to Budgets
                </button>
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
                        onClick={() => navigate('/finance/budget')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        Back to Budgets
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{budget.name}</h1>
                        <p className="text-gray-500">{budget.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleStatus}
                        className={`px-4 py-2 rounded-lg text-white transition-colors ${
                            budget.status === 'Active'
                                ? 'bg-yellow-600 hover:bg-yellow-700'
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {budget.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                        onClick={() => navigate(`/finance/budget-plan?edit=${budget.id}`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Edit size={16} />
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                    <button
                        onClick={() => navigate(`/finance/budget-vs-actual?budgetId=${budget.id}`)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                        <PieChart size={16} />
                        vs Actual
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget.totalAmount)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        budget.status === 'Active' ? 'bg-green-100 text-green-700' :
                            budget.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                    }`}>
            {budget.status}
          </span>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Period</p>
                    <p className="text-sm font-medium text-gray-900">
                        {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">
                        {budget.dateMod ? formatDate(budget.dateMod) : formatDate(budget.dateAdd)}
                    </p>
                </div>
            </div>

            {/* Budget Lines */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Budget Lines</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Allocated</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spent</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remaining</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {budget.lines.map((line) => (
                            <tr key={line.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {line.accountName || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-400">{line.accountCode}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="text-sm font-medium text-gray-900">{formatCurrency(line.allocatedAmount)}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="text-sm text-red-600">{formatCurrency(line.spentAmount)}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className={`text-sm font-medium ${line.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(line.remainingAmount)}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{line.description || '-'}</td>
                            </tr>
                        ))}
                        {/* Total Row */}
                        <tr className="bg-gray-50 font-semibold">
                            <td className="px-6 py-4 text-sm">TOTAL</td>
                            <td className="px-6 py-4 text-right">{formatCurrency(budget.totalAmount)}</td>
                            <td className="px-6 py-4 text-right">{formatCurrency(budget.lines.reduce((sum, l) => sum + l.spentAmount, 0))}</td>
                            <td className="px-6 py-4 text-right">
                                {formatCurrency(budget.totalAmount - budget.lines.reduce((sum, l) => sum + l.spentAmount, 0))}
                            </td>
                            <td className="px-6 py-4"></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default PageBudgetDetail;