// src/pages/finance/budget/components/BudgetStats.tsx

import React from 'react';
import { Coins, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { BudgetStats } from '@/modules/finance/pages/budgeting/types';

interface BudgetStatsProps {
    stats: BudgetStats;
}

export const BudgetStats: React.FC<BudgetStatsProps> = ({ stats }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const utilization = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Total Budgets</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                            <p className="text-xs text-blue-600 mt-1">{formatCurrency(stats.totalAmount)} total</p>
                        </div>
                        <div className="p-3 bg-blue-200 rounded-xl">
                            <Coins className="h-6 w-6 text-blue-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Active</p>
                            <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                            <p className="text-xs text-green-600 mt-1">Active budgets</p>
                        </div>
                        <div className="p-3 bg-green-200 rounded-xl">
                            <CheckCircle className="h-6 w-6 text-green-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700 font-medium">Draft</p>
                            <p className="text-2xl font-bold text-yellow-900">{stats.draft}</p>
                            <p className="text-xs text-yellow-600 mt-1">Pending review</p>
                        </div>
                        <div className="p-3 bg-yellow-200 rounded-xl">
                            <FileText className="h-6 w-6 text-yellow-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-700 font-medium">Utilization</p>
                            <p className="text-2xl font-bold text-purple-900">{utilization}%</p>
                            <p className="text-xs text-purple-600 mt-1">Active rate</p>
                        </div>
                        <div className="p-3 bg-purple-200 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-purple-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};