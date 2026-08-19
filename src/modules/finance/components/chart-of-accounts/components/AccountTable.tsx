// components/finance/chart-of-accounts/components/AccountTable.tsx

import React from 'react';
import { Edit, Trash2, Eye, Link as LinkIcon, Circle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { Account } from '@/modules/finance/types/account.types';

interface AccountTableProps {
    accounts: Account[];
    selectedIds: string[];
    onToggleSelection: (id: string) => void;
    onToggleAll: () => void;
    onView: (account: Account) => void;
    onEdit: (account: Account) => void;
    onDelete: (account: Account) => void;
    onToggleStatus: (id: string) => void;
    onViewUsage: (account: Account) => void;
    allSelected: boolean;
    accountCategories?: any[]; // ✅ Optional - for lookup if needed
}

export const AccountTable: React.FC<AccountTableProps> = ({
                                                              accounts,
                                                              selectedIds,
                                                              onToggleSelection,
                                                              onToggleAll,
                                                              onView,
                                                              onEdit,
                                                              onDelete,
                                                              onToggleStatus,
                                                              onViewUsage,
                                                              allSelected,
                                                              accountCategories = [], // ✅ Default empty array
                                                          }) => {
    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Asset: 'bg-blue-100 text-blue-700',
            Liability: 'bg-red-100 text-red-700',
            Equity: 'bg-purple-100 text-purple-700',
            Revenue: 'bg-green-100 text-green-700',
            Expense: 'bg-orange-100 text-orange-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    // ✅ Helper to get category name - fallback to categoryName or lookup
    const getCategoryName = (account: Account) => {
        // If categoryName exists, use it
        if (account.categoryName) {
            return account.categoryName;
        }

        // If categoryId exists but categoryName doesn't, try to lookup
        if (account.categoryId && accountCategories.length > 0) {
            const category = accountCategories.find(c => c.id === account.categoryId);
            if (category) {
                return category.name || '-';
            }
        }

        return '-';
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 w-10">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={onToggleAll}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(account.id)}
                                onChange={() => onToggleSelection(account.id)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                        </td>
                        <td className="px-4 py-3">
                            <span className="font-mono text-sm text-gray-600">{account.code}</span>
                        </td>
                        <td className="px-4 py-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{account.name}</p>
                                {account.nameAm && (
                                    <p className="text-xs text-gray-400">{account.nameAm}</p>
                                )}
                                {account.description && (
                                    <p className="text-xs text-gray-400 truncate max-w-xs">{account.description}</p>
                                )}
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            <Badge className={getTypeColor(account.accountType)}>
                                {account.accountType}
                            </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                            {getCategoryName(account)} {/* ✅ Updated to use helper */}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 2,
                            }).format(account.currentBalance || 0)}
                        </td>
                        <td className="px-4 py-3">
                            <Badge className={account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {account.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                                <button
                                    onClick={() => onToggleStatus(account.id)}
                                    className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                    title={account.isActive ? 'Deactivate' : 'Activate'}
                                >
                                    {account.isActive ? (
                                        <CheckCircle size={16} className="text-green-500" />
                                    ) : (
                                        <XCircle size={16} className="text-red-500" />
                                    )}
                                </button>
                                <button
                                    onClick={() => onViewUsage(account)}
                                    className="p-1 hover:bg-purple-100 rounded-lg transition-colors"
                                    title="View Usage"
                                >
                                    <LinkIcon size={16} className="text-purple-500" />
                                </button>
                                <button
                                    onClick={() => onView(account)}
                                    className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="View Details"
                                >
                                    <Eye size={16} className="text-blue-500" />
                                </button>
                                <button
                                    onClick={() => onEdit(account)}
                                    className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit size={16} className="text-green-500" />
                                </button>
                                <button
                                    onClick={() => onDelete(account)}
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
    );
};