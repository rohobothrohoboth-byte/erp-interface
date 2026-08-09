// components/finance/chart-of-accounts/AccountSummaryCards.tsx

import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import type { Account } from '../../../types/finance/account.types';

interface Props {
    accounts: Account[];
    totalCount: number;
}

export const AccountSummaryCards: React.FC<Props> = ({ accounts, totalCount }) => {
    const activeCount = accounts.filter(a => a.isActive).length;
    const inactiveCount = accounts.filter(a => !a.isActive).length;

    const typeCounts = accounts.reduce((acc, a) => {
        acc[a.accountType] = (acc[a.accountType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-3">
                    <p className="text-xs text-blue-700 font-medium">Total Accounts</p>
                    <p className="text-xl font-bold text-blue-900">{totalCount}</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3">
                    <p className="text-xs text-green-700 font-medium">Active</p>
                    <p className="text-xl font-bold text-green-900">{activeCount}</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                <CardContent className="p-3">
                    <p className="text-xs text-red-700 font-medium">Inactive</p>
                    <p className="text-xl font-bold text-red-900">{inactiveCount}</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-3">
                    <p className="text-xs text-purple-700 font-medium">Account Types</p>
                    <div className="text-xs text-purple-900">
                        {Object.entries(typeCounts).slice(0, 6).map(([type, count]) => (
                            <div key={type}>{type}: {count}</div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};