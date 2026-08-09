// components/finance/CashAndBankManagement.tsx - FULLY FIXED

import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/finance/helpers';

interface CashAndBankManagementProps {
    bankAccounts?: any[];
    bankTransactions?: any[];
    analytics?: any;
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

function CashAndBankManagement({
                                   bankAccounts = [],
                                   bankTransactions = [],
                                   analytics = {},
                                   filters = {},
                                   periodRange = {},
                                   isLoading = false
                               }: CashAndBankManagementProps) {

    const data = useMemo(() => {
        const analyticsData = analytics || {};

        // ✅ ============================================================
        // ✅ ALL VALUES FROM BACKEND - NO CALCULATIONS
        // ✅ ============================================================

        // ✅ Cash & Bank Metrics (pre-calculated)
        const totalCash = analyticsData?.cashBalance ?? 0;
        const cashAmount = analyticsData?.cashAmount ?? 0;
        const bankAmount = analyticsData?.bankAmount ?? 0;
        const avgDailyCashFlow = analyticsData?.avgDailyCashFlow ?? 0;

        // ✅ Weekly Cash Flow (pre-calculated)
        const weeklyCashFlow = analyticsData?.weeklyCashFlow ?? [0, 0, 0, 0, 0, 0, 0];

        // ✅ Recent Transactions (pre-calculated)
        const recentTransactions = analyticsData?.recentTransactions ?? [];

        // ✅ Get bank accounts
        const bankAccs = Array.isArray(bankAccounts) ? bankAccounts : [];
        const transactions = Array.isArray(bankTransactions) ? bankTransactions : [];

        // ✅ Use analytics totalBankAccounts if available, otherwise use bankAccounts length
        let totalAccounts = analyticsData?.totalBankAccounts ?? 0;
        if (totalAccounts === 0 && bankAccs.length > 0) {
            totalAccounts = bankAccs.length;
        }

        const totalTransactions = analyticsData?.totalBankTransactions ?? transactions.length;

        // ✅ Initialize variables for cash and bank counts
        let cashAccountCount = 0;
        let bankAccountCount = 0;

        // ✅ Fallback: If backend doesn't provide data, use raw data
        let displayTotalCash = totalCash;
        let displayCashAmount = cashAmount;
        let displayBankAmount = bankAmount;
        let displayWeeklyCashFlow = weeklyCashFlow;
        let displayAvgDailyCashFlow = avgDailyCashFlow;
        let displayRecentTransactions = recentTransactions;
        let displayTotalAccounts = totalAccounts;
        let displayTotalTransactions = totalTransactions;

        // Only use raw data if backend doesn't provide it
        if (totalCash === 0 && bankAccs.length > 0) {
            const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
            const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

            const filteredAccounts = bankAccs.filter((acc: any) => {
                const accountDate = new Date(acc.dateAdd || acc.DateAdd || acc.createdAt || acc.CreatedAt || '2000-01-01');
                return accountDate >= startDate && accountDate <= endDate;
            });

            const filteredTransactions = transactions.filter((t: any) => {
                const transactionDate = new Date(t.transactionDate || t.TransactionDate || t.dateAdd || t.DateAdd || t.date || t.Date);
                return transactionDate >= startDate && transactionDate <= endDate;
            });

            const total = filteredAccounts.reduce((sum: number, acc: any) =>
                sum + (acc.currentBalance || acc.availableBalance || acc.balance || 0), 0
            );

            const cashAccs = filteredAccounts.filter((a: any) => {
                const type = a.accountType || a.AccountType || a.type || a.Type || '';
                return type === 'Cash' || type?.toLowerCase().includes('cash');
            });

            const bankAccsFiltered = filteredAccounts.filter((a: any) => {
                const type = a.accountType || a.AccountType || a.type || a.Type || '';
                return type === 'Checking' || type === 'Savings' ||
                    type?.toLowerCase().includes('bank') || type?.toLowerCase().includes('checking');
            });

            cashAccountCount = cashAccs.length;
            bankAccountCount = bankAccsFiltered.length;

            const cashTotal = cashAccs.reduce((sum: number, a: any) =>
                sum + (a.currentBalance || a.availableBalance || a.balance || 0), 0
            );

            const bankTotal = bankAccsFiltered.reduce((sum: number, a: any) =>
                sum + (a.currentBalance || a.availableBalance || a.balance || 0), 0
            );

            // Weekly cash flow
            const dailyTrend = [0, 0, 0, 0, 0, 0, 0];
            const today = new Date();
            filteredTransactions.forEach((t: any) => {
                const date = new Date(t.transactionDate || t.TransactionDate || t.dateAdd || t.DateAdd);
                if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
                    const day = date.getDate();
                    const weekDay = new Date(today.getFullYear(), today.getMonth(), day).getDay();
                    if (weekDay >= 0 && weekDay <= 6) {
                        const amount = Number(t.amount || t.Amount || 0);
                        const type = t.transactionType || t.TransactionType || t.type || t.Type || '';
                        if (type === 'Deposit' || type === 'Replenishment' || type === 'Income' || type === 'Credit') {
                            dailyTrend[weekDay] += amount;
                        } else if (type === 'Withdrawal' || type === 'Expense' || type === 'Debit' || type === 'Payment') {
                            dailyTrend[weekDay] -= amount;
                        } else {
                            if (amount > 0) dailyTrend[weekDay] += amount;
                            else dailyTrend[weekDay] += amount;
                        }
                    }
                }
            });

            const recent = [...filteredTransactions]
                .sort((a, b) => {
                    const dateA = new Date(a.transactionDate || a.TransactionDate || a.dateAdd || a.DateAdd || 0);
                    const dateB = new Date(b.transactionDate || b.TransactionDate || b.dateAdd || b.DateAdd || 0);
                    return dateB.getTime() - dateA.getTime();
                })
                .slice(0, 5);

            displayTotalCash = total;
            displayCashAmount = cashTotal;
            displayBankAmount = bankTotal;
            displayWeeklyCashFlow = dailyTrend;
            displayAvgDailyCashFlow = dailyTrend.reduce((a, b) => a + b, 0) / 7;
            displayRecentTransactions = recent;
            displayTotalAccounts = filteredAccounts.length;
            displayTotalTransactions = filteredTransactions.length;
        }

        // ✅ If we didn't calculate cashAccountCount and bankAccountCount from raw data,
        // try to get them from analytics or calculate from bankAccounts
        if (cashAccountCount === 0 && bankAccountCount === 0) {
            const accs = bankAccs.length > 0 ? bankAccs : [];
            const cashAccs = accs.filter((a: any) => {
                const type = a.accountType || a.AccountType || a.type || a.Type || '';
                return type === 'Cash' || type?.toLowerCase().includes('cash');
            });
            const bankAccsFiltered = accs.filter((a: any) => {
                const type = a.accountType || a.AccountType || a.type || a.Type || '';
                return type === 'Checking' || type === 'Savings' ||
                    type?.toLowerCase().includes('bank') || type?.toLowerCase().includes('checking');
            });
            cashAccountCount = cashAccs.length;
            bankAccountCount = bankAccsFiltered.length;
        }

        // ✅ Debug logging
        console.log('📊 CashAndBankManagement - ALL FROM BACKEND:', {
            period: filters?.period,
            totalCash: displayTotalCash,
            cashAmount: displayCashAmount,
            bankAmount: displayBankAmount,
            avgDailyCashFlow: displayAvgDailyCashFlow,
            weeklyCashFlow: displayWeeklyCashFlow,
            recentTransactionsCount: displayRecentTransactions.length,
            totalAccounts: displayTotalAccounts,
            totalTransactions: displayTotalTransactions,
            cashAccountCount,
            bankAccountCount,
        });

        return {
            totalCash: displayTotalCash,
            cashAmount: displayCashAmount,
            bankAmount: displayBankAmount,
            avgDailyCashFlow: displayAvgDailyCashFlow,
            weeklyCashFlow: displayWeeklyCashFlow,
            recentTransactions: displayRecentTransactions,
            totalAccounts: displayTotalAccounts,
            cashAccountCount: cashAccountCount,
            bankAccountCount: bankAccountCount,
            totalTransactions: displayTotalTransactions,
        };
    }, [analytics, bankAccounts, bankTransactions, periodRange, filters]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-cyan-100">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    // ✅ Show empty state if no data
    if (data.totalCash === 0 && data.totalAccounts === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-cyan-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Cash & Bank</h3>
                    <span className="text-xs text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
                        0 accounts
                    </span>
                </div>
                <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">No cash or bank accounts for the selected period</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-cyan-100 hover:border-cyan-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Cash & Bank</h3>
                <span className="text-xs text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
                    {data.totalAccounts} accounts
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Cash</span>
                    <span className="text-xl font-bold text-cyan-600">
                        {formatCurrency(data.totalCash)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded p-2 text-center">
                        <p className="text-xs text-gray-500">Cash</p>
                        <p className="text-sm font-bold text-green-600">
                            {formatCurrency(data.cashAmount)}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                        <p className="text-xs text-gray-500">Bank</p>
                        <p className="text-sm font-bold text-blue-600">
                            {formatCurrency(data.bankAmount)}
                        </p>
                    </div>
                </div>

                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Weekly Cash Flow</p>
                    <div className="flex items-end h-16 gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                            const value = data.weeklyCashFlow[index] || 0;
                            const maxValue = Math.max(...data.weeklyCashFlow.map(Math.abs), 1);
                            const height = maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;
                            const isPositive = value >= 0;

                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div
                                        className={`w-full rounded-t-sm ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
                                        style={{ height: `${Math.min(100, height * 0.8)}%` }}
                                    />
                                    <p className="text-[8px] text-gray-400 mt-1">{day}</p>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                        Avg daily: {formatCurrency(data.avgDailyCashFlow)}
                    </p>
                </div>

                {data.recentTransactions.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Recent Transactions</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {data.recentTransactions.map((transaction: any, index: number) => {
                                const amount = Number(transaction.amount || transaction.Amount || 0);
                                const type = transaction.transactionType || transaction.TransactionType || transaction.type || transaction.Type || '';
                                const isDeposit = type === 'Deposit' || type === 'Replenishment' || type === 'Income' || type === 'Credit';
                                const isPositive = isDeposit || amount > 0;

                                return (
                                    <div key={index} className="flex justify-between text-xs border-b border-gray-50 py-1 last:border-0">
                                        <span className="text-gray-600 truncate max-w-[60%]">
                                            {transaction.description || transaction.Description || transaction.transactionType || transaction.TransactionType || 'Transaction'}
                                        </span>
                                        <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            {isPositive ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Account details */}
                {data.totalAccounts > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{data.totalAccounts} accounts</span>
                            <span>{data.totalTransactions} transactions</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(CashAndBankManagement);