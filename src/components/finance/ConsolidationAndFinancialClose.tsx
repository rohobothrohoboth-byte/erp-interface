// components/finance/ConsolidationAndFinancialClose.tsx - FULLY FIXED

import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/finance/helpers';
import { Badge } from '../../components/ui/badge';

interface ConsolidationAndFinancialCloseProps {
    journalEntries?: any[];
    chartOfAccounts?: any[];
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

function ConsolidationAndFinancialClose({
                                            journalEntries = [],
                                            chartOfAccounts = [],
                                            filters = {},
                                            periodRange = {},
                                            isLoading = false
                                        }: ConsolidationAndFinancialCloseProps) {

    const data = useMemo(() => {
        // ✅ Filter by period
        const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
        const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

        // ✅ Safely get arrays
        const jour = Array.isArray(journalEntries) ? journalEntries : [];
        const acc = Array.isArray(chartOfAccounts) ? chartOfAccounts : [];

        // ✅ Filter journal entries by date
        const filteredJournals = jour.filter((j: any) => {
            const journalDate = new Date(j.journalDate || j.JournalDate || j.date || j.Date || j.DateAdd);
            return journalDate >= startDate && journalDate <= endDate;
        });

        // ✅ Filter chart of accounts by date
        const filteredAccounts = acc.filter((a: any) => {
            const accountDate = new Date(a.dateAdd || a.DateAdd || a.createdAt || a.CreatedAt || '2000-01-01');
            return accountDate >= startDate && accountDate <= endDate;
        });

        // ✅ Separate posted and unposted
        const posted = filteredJournals.filter((j: any) => j.isPosted || j.status === 'Posted');
        const unposted = filteredJournals.filter((j: any) => !j.isPosted && j.status !== 'Posted');

        // ✅ Calculate totals from posted entries only
        const totalDebit = posted.reduce((sum: number, j: any) => {
            return sum + (j.totalDebit || j.debit || j.Debit || 0);
        }, 0);

        const totalCredit = posted.reduce((sum: number, j: any) => {
            return sum + (j.totalCredit || j.credit || j.Credit || 0);
        }, 0);

        // ✅ Account balances from filtered accounts
        const balances = filteredAccounts.reduce((acc: any, a: any) => {
            const type = a.accountType || a.AccountType || a.type || a.Type || 'Unknown';
            acc[type] = (acc[type] || 0) + Number(a.balance || a.currentBalance || a.openingBalance || a.Balance || 0);
            return acc;
        }, {});

        // ✅ Close status
        const closeStatus = {
            'Journal Entries': filteredJournals.length > 0 ? 'Completed' : 'Pending',
            'Postings': posted.length > 0 ? 'Completed' : 'Pending',
            'Balances': Math.abs(totalDebit - totalCredit) < 0.01 ? 'Balanced' : 'Unbalanced',
            'Consolidation': unposted.length === 0 ? 'Ready' : 'In Progress',
        };

        const progressValues = Object.values(closeStatus);
        const completedCount = progressValues.filter(s =>
            s === 'Completed' || s === 'Balanced' || s === 'Ready'
        ).length;
        const totalSteps = progressValues.length;
        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

        // ✅ Debug logging
        console.log('📊 ConsolidationAndFinancialClose - Filtered Data:', {
            period: filters?.period,
            totalJournalEntries: jour.length,
            filteredJournalEntries: filteredJournals.length,
            postedCount: posted.length,
            unpostedCount: unposted.length,
            totalDebit,
            totalCredit,
            isBalanced,
            progress: (completedCount / totalSteps) * 100,
        });

        return {
            postedCount: posted.length,
            unpostedCount: unposted.length,
            totalDebit,
            totalCredit,
            balances,
            closeStatus,
            progress: (completedCount / totalSteps) * 100,
            isBalanced,
            totalEntries: filteredJournals.length,
        };
    }, [journalEntries, chartOfAccounts, periodRange, filters]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100 hover:border-purple-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Consolidation & Close</h3>
                <Badge className={`${data.isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {data.isBalanced ? '✅ Balanced' : '❌ Unbalanced'}
                </Badge>
            </div>

            <div className="space-y-3">
                {/* Progress Bar */}
                <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Close Progress</span>
                        <span className="font-medium text-gray-700">{Math.round(data.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${data.progress >= 80 ? 'bg-green-500' : data.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, data.progress)}%` }}
                        />
                    </div>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(data.closeStatus).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded p-2 text-center">
                            <p className="text-xs text-gray-500">{key}</p>
                            <p className={`text-sm font-bold ${
                                value === 'Completed' || value === 'Balanced' || value === 'Ready'
                                    ? 'text-green-600'
                                    : value === 'In Progress'
                                        ? 'text-yellow-600'
                                        : 'text-red-600'
                            }`}>
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Account Balances */}
                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Account Balances</p>
                    <div className="space-y-1">
                        {Object.entries(data.balances).map(([type, amount]) => (
                            <div key={type} className="flex justify-between text-sm">
                                <span className="text-gray-600">{type}</span>
                                <span className={`font-medium ${
                                    type === 'Asset' || type === 'asset' ? 'text-blue-600' :
                                        type === 'Liability' || type === 'liability' ? 'text-red-600' :
                                            type === 'Equity' || type === 'equity' ? 'text-purple-600' :
                                                'text-gray-600'
                                }`}>
                  {formatCurrency(amount as number)}
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Posted: {data.postedCount}</span>
                        <span className="text-gray-500">Unposted: {data.unpostedCount}</span>
                        <span className="text-gray-500">Total: {data.totalEntries}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(ConsolidationAndFinancialClose);