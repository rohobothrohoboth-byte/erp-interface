// components/finance/FinancialReportingAndAnalytics.tsx - FULLY FIXED (NO DUPLICATE CALCULATIONS)

import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/finance/helpers';

interface FinancialReportingAndAnalyticsProps {
  analytics?: any;
  invoices?: any[];
  expenses?: any[];
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

function FinancialReportingAndAnalytics({
                                          analytics = {},
                                          invoices = [],
                                          expenses = [],
                                          chartOfAccounts = [],
                                          filters = {},
                                          periodRange = {},
                                          isLoading = false
                                        }: FinancialReportingAndAnalyticsProps) {

  const data = useMemo(() => {
    const analyticsData = analytics || {};

    // ✅ ============================================================
    // ✅ ALL VALUES FROM BACKEND - NO CALCULATIONS
    // ✅ ============================================================

    // ✅ Revenue & Expenses (pre-calculated)
    const totalRevenue = analyticsData?.monthlyRevenue ?? 0;
    const totalExpenses = analyticsData?.totalExpenses ?? 0;
    const netIncome = analyticsData?.netIncome ?? 0;           // ✅ From backend
    const profitMargin = analyticsData?.profitMargin ?? 0;      // ✅ From backend
    const currentRatio = analyticsData?.currentRatio ?? 0;      // ✅ From backend

    // ✅ Assets & Liabilities (pre-calculated)
    const totalAssets = analyticsData?.totalAssets ?? 0;
    const totalLiabilities = analyticsData?.totalLiabilities ?? 0;
    const totalEquity = analyticsData?.equity ?? 0;

    // ✅ Growth rates (pre-calculated)
    const revenueGrowth = analyticsData?.monthOverMonthGrowth ?? 0;
    const expenseGrowth = analyticsData?.purchaseMonthOverMonthGrowth ?? 0;

    // ✅ Cash flow (pre-calculated)
    const cashFlow = analyticsData?.netCashFlow ?? 0;

    // ✅ Invoice counts (pre-calculated or use raw data for display only)
    const invoiceCount = analyticsData?.monthlyCount ?? (Array.isArray(invoices) ? invoices.length : 0);
    const expenseCount = analyticsData?.purchaseCount ?? (Array.isArray(expenses) ? expenses.length : 0);

    // ✅ Monthly data - use from backend if available, otherwise build from raw data
    let monthlyData: Array<{ month: string; revenue: number; expenses: number; profit: number }> = [];

    // ✅ Try to use pre-calculated monthly data from backend
    if (analyticsData?.revenueByMonth && analyticsData?.expensesByMonth) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyData = months.map(month => ({
        month,
        revenue: analyticsData.revenueByMonth[month] || 0,
        expenses: analyticsData.expensesByMonth[month] || 0,
        profit: (analyticsData.revenueByMonth[month] || 0) - (analyticsData.expensesByMonth[month] || 0),
      }));
    } else {
      // ✅ Fallback: Use raw data for monthly breakdown (only if backend doesn't provide it)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const invoiceByMonth: Record<string, number> = {};
      const expenseByMonth: Record<string, number> = {};

      const inv = Array.isArray(invoices) ? invoices : [];
      const exp = Array.isArray(expenses) ? expenses : [];

      // Only use raw data if analytics doesn't have monthly data
      if (!analyticsData?.revenueByMonth) {
        inv.forEach((i: any) => {
          const date = new Date(i.invoiceDate || i.InvoiceDate || i.date || i.Date || i.DateAdd);
          const month = months[date.getMonth()];
          const type = i.invoiceType || i.InvoiceType || i.type || i.Type;
          if (type === 'Sales') {
            invoiceByMonth[month] = (invoiceByMonth[month] || 0) + Number(i.totalAmount || i.TotalAmount || i.amount || 0);
          }
        });
      }

      if (!analyticsData?.expensesByMonth) {
        exp.forEach((e: any) => {
          const date = new Date(e.expenseDate || e.ExpenseDate || e.date || e.Date || e.DateAdd);
          const month = months[date.getMonth()];
          expenseByMonth[month] = (expenseByMonth[month] || 0) + Number(e.amount || e.Amount || 0);
        });
      }

      monthlyData = months.map(month => ({
        month,
        revenue: invoiceByMonth[month] || 0,
        expenses: expenseByMonth[month] || 0,
        profit: (invoiceByMonth[month] || 0) - (expenseByMonth[month] || 0),
      }));
    }

    // ✅ Debug logging - verify all values come from backend
    console.log('📊 FinancialReportingAndAnalytics - ALL FROM BACKEND:', {
      period: filters?.period,
      totalRevenue,
      totalExpenses,
      netIncome,              // ✅ From backend
      profitMargin,           // ✅ From backend
      currentRatio,           // ✅ From backend
      totalAssets,
      totalLiabilities,
      totalEquity,
      revenueGrowth,
      expenseGrowth,
      cashFlow,
      monthlyDataLength: monthlyData.length,
    });

    return {
      totalRevenue,
      totalExpenses,
      netIncome,              // ✅ From backend
      profitMargin,           // ✅ From backend
      currentRatio,           // ✅ From backend
      totalAssets,
      totalLiabilities,
      totalEquity,
      cashFlow,
      revenueGrowth,
      expenseGrowth,
      monthlyData,
      invoiceCount,
      expenseCount,
    };
  }, [analytics, invoices, expenses, filters]);

  if (isLoading) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-100">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
    );
  }

  const maxValue = Math.max(...data.monthlyData.map(m => Math.max(m.revenue, m.expenses)), 1);

  return (
      <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-100 hover:border-blue-500 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Financial Analytics</h3>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          {data.invoiceCount} transactions
        </span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="text-sm font-bold text-blue-600">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Expenses</p>
              <p className="text-sm font-bold text-rose-600">{formatCurrency(data.totalExpenses)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Profit</p>
              <p className={`text-sm font-bold ${data.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(data.netIncome)}  {/* ✅ From backend */}
              </p>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Monthly Revenue vs Expenses</span>
              <span className="text-gray-400">Profit Margin: {data.profitMargin.toFixed(1)}%</span>  {/* ✅ From backend */}
            </div>
            <div className="h-20 flex items-end gap-1">
              {data.monthlyData.slice(0, 6).map((item, index) => {
                const revenueHeight = maxValue > 0 ? (item.revenue / maxValue) * 80 : 0;
                const expenseHeight = maxValue > 0 ? (item.expenses / maxValue) * 80 : 0;

                return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex gap-0.5 h-16 items-end">
                        <div
                            className="flex-1 bg-blue-500 rounded-t-sm"
                            style={{ height: `${Math.min(100, revenueHeight)}%` }}
                        />
                        <div
                            className="flex-1 bg-rose-500 rounded-t-sm"
                            style={{ height: `${Math.min(100, expenseHeight)}%` }}
                        />
                      </div>
                      <p className="text-[8px] text-gray-400 mt-1">{item.month}</p>
                    </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[8px] text-gray-400 mt-1">
              <span>Revenue (Blue)</span>
              <span>Expenses (Red)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-xs text-gray-500">Current Ratio</p>
              <p className="text-sm font-bold text-indigo-600">{data.currentRatio.toFixed(2)}</p>  {/* ✅ From backend */}
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-xs text-gray-500">Equity</p>
              <p className="text-sm font-bold text-purple-600">{formatCurrency(data.totalEquity)}</p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Assets</span>
              <span className="text-gray-600">{formatCurrency(data.totalAssets)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Liabilities</span>
              <span className="text-gray-600">{formatCurrency(data.totalLiabilities)}</span>
            </div>
          </div>
        </div>
      </div>
  );
}

export default React.memo(FinancialReportingAndAnalytics);