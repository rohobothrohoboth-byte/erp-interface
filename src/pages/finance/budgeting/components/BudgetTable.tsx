// src/pages/finance/budget/components/BudgetTable.tsx

import React from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import type { Budget } from '../types';

interface BudgetTableProps {
    budgets: Budget[];
    onView: (budget: Budget) => void;
    onEdit: (budget: Budget) => void;
    onToggleStatus: (budget: Budget) => void;
    onDelete: (budget: Budget) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    formatCurrency: (amount: number) => string;
    formatDate: (date: string) => string;
    getStatusColor: (status: string) => string;
}

export const BudgetTable: React.FC<BudgetTableProps> = ({
                                                            budgets,
                                                            onView,
                                                            onEdit,
                                                            onToggleStatus,
                                                            onDelete,
                                                            currentPage,
                                                            totalPages,
                                                            onPageChange,
                                                            totalItems,
                                                            itemsPerPage,
                                                            formatCurrency,
                                                            formatDate,
                                                            getStatusColor,
                                                        }) => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    if (budgets.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <Coins className="h-12 w-12 text-gray-300" />
                        <p className="font-medium">No budgets found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {budgets.map((budget) => (
                        <tr key={budget.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{budget.name}</p>
                                    {budget.description && (
                                        <p className="text-xs text-gray-500 truncate max-w-xs">{budget.description}</p>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                {budget.periodName ? (
                                    <Badge variant="outline" className="text-xs">
                                        {budget.periodName}
                                    </Badge>
                                ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                                {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-indigo-600 text-right">
                                {formatCurrency(budget.totalAmount)}
                            </td>
                            <td className="px-4 py-3">
                                <Badge className={getStatusColor(budget.status)}>
                                    {budget.status}
                                </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <button
                                        onClick={() => onView(budget)}
                                        className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="View"
                                    >
                                        <Eye size={16} className="text-blue-500" />
                                    </button>
                                    <button
                                        onClick={() => onEdit(budget)}
                                        className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit size={16} className="text-yellow-600" />
                                    </button>
                                    <button
                                        onClick={() => onToggleStatus(budget)}
                                        className={`p-1 rounded-lg transition-colors ${
                                            budget.status === 'Active'
                                                ? 'hover:bg-red-100'
                                                : 'hover:bg-green-100'
                                        }`}
                                        title={budget.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    >
                                        {budget.status === 'Active' ? (
                                            <span className="text-red-500 text-xs font-medium">Deactivate</span>
                                        ) : (
                                            <span className="text-green-500 text-xs font-medium">Activate</span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => onDelete(budget)}
                                        className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} budgets
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};