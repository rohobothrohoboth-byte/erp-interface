// src/pages/finance/budget/components/BudgetHeader.tsx

import React from 'react';
import { Coins, Plus, RefreshCw, Download, Printer } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface BudgetHeaderProps {
    onRefresh: () => void;
    onExport: () => void;
    onPrint: () => void;
    onCreate: () => void;
    isRefreshing: boolean;
    exporting: boolean;
    hasData: boolean;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
                                                              onRefresh,
                                                              onExport,
                                                              onPrint,
                                                              onCreate,
                                                              isRefreshing,
                                                              exporting,
                                                              hasData,
                                                          }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <Coins className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
                    <p className="text-sm text-gray-500">Manage financial budgets and allocations</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    onClick={onRefresh}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isRefreshing}
                >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    Refresh
                </Button>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={onExport}
                    disabled={exporting}
                >
                    <Download size={16} />
                    {exporting ? 'Exporting...' : 'Export'}
                </Button>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={onPrint}
                    disabled={!hasData}
                >
                    <Printer size={16} />
                    Print
                </Button>
                <Button
                    onClick={onCreate}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus size={16} />
                    Create Budget
                </Button>
            </div>
        </div>
    );
};