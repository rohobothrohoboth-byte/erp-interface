// components/finance/chart-of-accounts/components/AccountHeader.tsx

import React from 'react';
import { Layers, Plus, RefreshCw, Download, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface AccountHeaderProps {
    totalCount: number;
    categoriesCount: number;
    selectedIds: string[];
    isRefreshing: boolean;
    onRefresh: () => void;
    onAdd: () => void;
    onHierarchy: () => void;
    onExport: () => void;
    onBulkDelete: () => void;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
                                                                totalCount,
                                                                categoriesCount,
                                                                selectedIds,
                                                                isRefreshing,
                                                                onRefresh,
                                                                onAdd,
                                                                onHierarchy,
                                                                onExport,
                                                                onBulkDelete,
                                                            }) => {
    return (
        <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <Layers className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
                    <p className="text-sm text-gray-500">
                        {totalCount} accounts • {categoriesCount} categories
                    </p>
                </div>
            </div>
            <div className="flex gap-2 flex-wrap">
                <Button
                    onClick={onHierarchy}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <LinkIcon size={16} />
                    Hierarchy
                </Button>
                <Button
                    onClick={onExport}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Download size={16} />
                    Export
                </Button>
                <Button
                    onClick={onRefresh}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isRefreshing}
                >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    Refresh
                </Button>
                {selectedIds.length > 0 && (
                    <Button
                        onClick={onBulkDelete}
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                    >
                        <Trash2 size={16} />
                        Delete Selected ({selectedIds.length})
                    </Button>
                )}
                <Button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus size={16} />
                    Add Account
                </Button>
            </div>
        </div>
    );
};