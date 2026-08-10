// src/pages/modules/Finance.tsx - FULLY CORRECTED FINAL VERSION

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard,
  Wallet, FileText, RefreshCw, Clock, Activity,
  ArrowUpRight, ArrowDownRight, Building2, Users,
  BarChart3, Receipt, Landmark, Briefcase,
  Shield, Percent, BookOpen, Layers, Download
} from 'lucide-react';
import { useFinanceDashboard } from '@/modules/finance/hooks/useFinanceDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';

// Error Boundary and Skeleton
import ErrorBoundary from '@/modules/finance/components/ErrorBoundary';
import { SkeletonWidget } from '@/modules/finance/components/SkeletonWidget';

// Widget Components
import VoucherManagement from '@/modules/finance/components/VoucherManagement';
import AccountsPayable from '@/modules/finance/components/AccountsPayable';
import AccountsReceivable from '@/modules/finance/components/AccountsReceivable';
import GeneralLedger from '@/modules/finance/components/GeneralLedger';
import CashAndBankManagement from '@/modules/finance/components/CashAndBankManagement';
import BudgetingAndForecasting from '@/modules/finance/components/BudgetingAndForecasting';
import FinancialReportingAndAnalytics from '@/modules/finance/components/FinancialReportingAndAnalytics';
import TaxManagement from '@/modules/finance/components/TaxManagement';
import AuditAndComplianceManagement from '@/modules/finance/components/AuditAndComplianceManagement';
import AssetManagement from '@/modules/finance/components/AssetManagement';
import CostAccounting from '@/modules/finance/components/CostAccounting';
import ConsolidationAndFinancialClose from '@/modules/finance/components/ConsolidationAndFinancialClose';
import KPIcards from '@/modules/finance/components/KPIcards';
import ScenarioPlanner from '@/modules/finance/components/ScenarioPlanner';
import VarianceChart from '@/modules/finance/components/VarianceChart';

// ✅ Simplified Stats Interface - Just display values
interface DashboardStats {
  // Revenue
  revenue: number;
  revenueGrowth: number;

  // Expenses
  totalExpenses: number;
  expenseGrowth: number;

  // Financial Health
  netIncome: number;
  profitMargin: number;
  cashBalance: number;
  cashInflow: number;
  cashOutflow: number;
  netCashFlow: number;

  // Accounts
  accountsReceivable: number;
  accountsPayable: number;
  totalAssets: number;

  // Budget
  totalBudget: number;
  budgetUtilization: number;

  // Top Lists (already calculated on backend)
  topCustomers: any[];
  topVendors: any[];

  // ✅ All values come pre-calculated from backend
  monthlyRevenue: number;
  monthlyCount: number;
  averageInvoice: number;
  overdueAmount: number;
}

// ============== Stat Card Component ==============
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'emerald' | 'purple' | 'orange' | 'rose' | 'indigo' | 'teal' | 'cyan';
  trend?: { value: number; isPositive: boolean };
  progress?: number;
  progressLabel?: string;
}> = ({ title, value, subtitle, icon, color, trend, progress, progressLabel }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    rose: 'bg-rose-50 border-rose-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    teal: 'bg-teal-50 border-teal-200',
    cyan: 'bg-cyan-50 border-cyan-200',
  };

  const iconColorClasses = {
    blue: 'bg-blue-200 text-blue-700',
    green: 'bg-green-200 text-green-700',
    emerald: 'bg-emerald-200 text-emerald-700',
    purple: 'bg-purple-200 text-purple-700',
    orange: 'bg-orange-200 text-orange-700',
    rose: 'bg-rose-200 text-rose-700',
    indigo: 'bg-indigo-200 text-indigo-700',
    teal: 'bg-teal-200 text-teal-700',
    cyan: 'bg-cyan-200 text-cyan-700',
  };

  return (
      <Card className={`${colorClasses[color]} border shadow-sm hover:shadow-md transition-shadow`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
              {trend && (
                  <div className="flex items-center gap-1 mt-2">
                    {trend.isPositive ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                    ) : (
                        <ArrowDownRight className="h-3 w-3 text-rose-600" />
                    )}
                    <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {Math.abs(trend.value).toFixed(2)}%
                </span>
                    <span className="text-xs text-gray-400">vs last month</span>
                  </div>
              )}
              {progress !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Utilization</span>
                      <span>{progressLabel || `${Math.round(progress)}%`}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                          className={`h-1.5 rounded-full ${iconColorClasses[color].split(' ')[0]}`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${iconColorClasses[color]}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

// ============== Helper Functions ==============
const getPeriodRange = (period: string, periodType: 'month' | 'quarter' | 'year' | 'custom') => {
  const [year, month] = period.split('-').map(Number);
  let startDate: Date;
  let endDate: Date;

  switch (periodType) {
    case 'month':
      startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      break;
    case 'quarter':
      const quarter = Math.floor((month - 1) / 3);
      const quarterStartMonth = quarter * 3;
      startDate = new Date(Date.UTC(year, quarterStartMonth, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(year, quarterStartMonth + 3, 0, 23, 59, 59));
      break;
    case 'year':
      startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
      break;
    default:
      startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  }

  return {
    periodStart: startDate.toISOString(),
    periodEnd: endDate.toISOString(),
  };
};

// ============== Main Component ==============
const FinanceDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<{
    period: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    fiscalYear: string;
  }>({
    period: new Date().toISOString().slice(0, 7),
    periodType: 'month',
    fiscalYear: new Date().getFullYear().toString(),
  });

  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const periodRange = useMemo(() => {
    return getPeriodRange(filters.period, filters.periodType);
  }, [filters.period, filters.periodType]);

  // ✅ Use the shared hook - gets pre-calculated data
  const {
    chartOfAccounts,
    expenses,
    invoices,
    payments,
    budgets,
    journalEntries,
    branches,
    employees,
    taxReturns,
    bankAccounts,
    bankTransactions,
    assets,
    vendors,
    customers,
    departments,
    auditLogs,
    isLoading,
    isRefreshing,
    refetchAll,
    analytics,
  } = useFinanceDashboard({
    periodStart: periodRange.periodStart,
    periodEnd: periodRange.periodEnd,
    period: filters.period,
    periodType: filters.periodType,
    fiscalYear: filters.fiscalYear,
  });

  // ✅ SIMPLIFIED: Just extract pre-calculated values from backend
  const stats = useMemo<DashboardStats>(() => {
    const a = analytics || {};

    return {
      // Revenue (pre-calculated)
      revenue: a.monthlyRevenue || 0,
      revenueGrowth: a.monthOverMonthGrowth || 0,

      // Expenses (pre-calculated)
      totalExpenses: a.totalExpenses || 0,
      expenseGrowth: a.purchaseMonthOverMonthGrowth || 0,

      // Financial Health (pre-calculated)
      netIncome: a.netIncome || 0,
      profitMargin: a.profitMargin || 0,
      cashBalance: a.cashBalance || 0,
      cashInflow: a.cashInflow || 0,
      cashOutflow: a.cashOutflow || 0,
      netCashFlow: a.netCashFlow || 0,

      // Accounts (pre-calculated)
      accountsReceivable: a.accountsReceivable || 0,
      accountsPayable: a.accountsPayable || 0,
      totalAssets: a.totalAssets || 0,

      // Budget (pre-calculated)
      totalBudget: a.totalBudgetAmount || 0,
      budgetUtilization: a.budgetUtilization || 0,

      // Top Lists (pre-calculated)
      topCustomers: a.topCustomers || [],
      topVendors: a.topVendors || [],

      // Additional metrics
      monthlyRevenue: a.monthlyRevenue || 0,
      monthlyCount: a.monthlyCount || 0,
      averageInvoice: a.averageInvoice || 0,
      overdueAmount: a.overdueAmount || 0,
    };
  }, [analytics]);

  // ✅ Manual refresh
  const handleRefresh = useCallback(async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      await refetchAll();
      setLastUpdated(new Date());
      showToast.success('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      showToast.error('Failed to refresh dashboard');
    }
  }, [queryClient, refetchAll]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyWithCents = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Health score (still calculated on frontend since it's a composite metric)
  const getFinancialHealthScore = () => {
    let score = 0;
    if (stats.netIncome > 0) score += 20;
    if (stats.cashBalance > 0) score += 15;
    if (stats.accountsReceivable < stats.revenue * 0.3) score += 15;
    if (stats.accountsPayable < stats.totalExpenses * 0.3) score += 15;
    if (stats.budgetUtilization < 100) score += 15;
    if (stats.totalAssets > 0) score += 10;
    if (stats.netCashFlow > 0) score += 10;
    return Math.min(100, score);
  };

  const healthScore = getFinancialHealthScore();

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading dashboard...</p>
          </div>
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              Financial Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time overview of your financial performance
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <Button
                onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
            >
              <BarChart3 size={16} />
              {showAdvancedStats ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
            <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Period Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Period</Label>
              <Input
                  type="month"
                  value={filters.period}
                  onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Period Type</Label>
              <Select
                  value={filters.periodType}
                  onValueChange={(value: 'month' | 'quarter' | 'year' | 'custom') =>
                      setFilters({ ...filters, periodType: value })
                  }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                  onClick={handleRefresh}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full"
                  disabled={isRefreshing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Financial Health Score */}
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-200 rounded-lg">
                  <Activity className="h-5 w-5 text-indigo-700" />
                </div>
                <div>
                  <p className="font-semibold text-indigo-800">Financial Health Score</p>
                  <p className="text-xs text-indigo-600">Based on key financial metrics</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-900">{healthScore}%</p>
                  <p className="text-xs text-indigo-600">
                    {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
                  </p>
                </div>
                <div className="w-32 bg-indigo-200 rounded-full h-2">
                  <div
                      className={`h-2 rounded-full ${healthScore >= 80 ? 'bg-emerald-600' : healthScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Stats Cards - Displaying pre-calculated values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.revenue)}
              subtitle={`${stats.monthlyCount} invoices processed`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="blue"
              trend={{ value: stats.revenueGrowth, isPositive: stats.revenueGrowth >= 0 }}
          />
          <StatCard
              title="Total Expenses"
              value={formatCurrency(stats.totalExpenses)}
              subtitle="Operating + Purchase expenses"
              icon={<TrendingDown className="h-5 w-5" />}
              color="rose"
              trend={{ value: stats.expenseGrowth, isPositive: stats.expenseGrowth <= 0 }}
          />
          <StatCard
              title="Net Income"
              value={formatCurrency(stats.netIncome)}
              subtitle={stats.netIncome >= 0 ? 'Profit' : 'Loss'}
              icon={<Wallet className="h-5 w-5" />}
              color={stats.netIncome >= 0 ? 'emerald' : 'orange'}
              trend={{ value: stats.revenueGrowth, isPositive: stats.revenueGrowth >= 0 }}
          />
          <StatCard
              title="Cash Balance"
              value={formatCurrency(stats.cashBalance)}
              subtitle={`${bankAccounts?.length || 0} bank accounts`}
              icon={<DollarSign className="h-5 w-5" />}
              color="cyan"
              progress={stats.revenue > 0 ? Math.min(100, (stats.cashBalance / stats.revenue) * 100) : 0}
              progressLabel={stats.revenue > 0 ? `${Math.round((stats.cashBalance / stats.revenue) * 100)}% of revenue` : 'No revenue'}
          />
        </div>

        {/* Widgets Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Layers className="h-5 w-5 text-gray-600"/>
              Financial Modules
            </h2>
            <span className="text-xs text-gray-400">12 modules active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

            {/* 1. Voucher Management */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Voucher Management</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <VoucherManagement
                      analytics={analytics}  // ✅ All data from analytics
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 2. Accounts Payable */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Accounts Payable</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <AccountsPayable
                      analytics={analytics}  // ✅ All data from analytics
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 3. Accounts Receivable */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Accounts Receivable</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <AccountsReceivable
                      analytics={analytics}  // ✅ All data from analytics
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 4. General Ledger */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load General Ledger</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <GeneralLedger
                      analytics={analytics}  // ✅ All data from analytics
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 5. Cash & Bank Management */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Cash & Bank Management</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <CashAndBankManagement
                      analytics={analytics}  // ✅ All data from analytics
                      bankAccounts={bankAccounts}  // ✅ Still needed for detailed bank data
                      bankTransactions={bankTransactions}  // ✅ Still needed for detailed transactions
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 6. Budgeting & Forecasting */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Budgeting & Forecasting</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <BudgetingAndForecasting
                      analytics={analytics}  // ✅ All data from analytics
                      budgets={budgets}  // ✅ Still needed for detailed budget data
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 7. Financial Reporting & Analytics */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Financial Reporting</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <FinancialReportingAndAnalytics
                      analytics={analytics}  // ✅ All data from analytics
                      chartOfAccounts={chartOfAccounts}  // ✅ Still needed for detailed COA
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 8. Asset Management */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Asset Management</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <AssetManagement
                      analytics={analytics}  // ✅ All data from analytics
                      assets={assets}  // ✅ Still needed for detailed asset data
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 9. Tax Management */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Tax Management</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <TaxManagement
                      analytics={analytics}  // ✅ All data from analytics
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 10. Cost Accounting */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Cost Accounting</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <CostAccounting
                      analytics={analytics}  // ✅ All data from analytics
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 11. Audit & Compliance Management */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Audit & Compliance</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <AuditAndComplianceManagement
                      analytics={analytics}  // ✅ All data from analytics
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 12. Consolidation & Financial Close */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Consolidation & Close</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <ConsolidationAndFinancialClose
                      analytics={analytics}  // ✅ All data from analytics
                      chartOfAccounts={chartOfAccounts}  // ✅ Still needed for detailed COA
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 13. Variance Chart */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Variance Chart</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <VarianceChart
                      analytics={analytics}  // ✅ All data from analytics
                      budgets={budgets}  // ✅ Still needed for detailed budget data
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

            {/* 14. Scenario Planner */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">Failed to load Scenario Planner</div>}>
              {isLoading ? <SkeletonWidget /> : (
                  <ScenarioPlanner
                      analytics={analytics}  // ✅ All data from analytics
                      filters={filters}
                      periodRange={periodRange}
                      isLoading={isLoading}
                  />
              )}
            </ErrorBoundary>

          </div>
        </div>

        {/* Export Modal */}
        <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-indigo-600" />
                Export Dashboard
              </DialogTitle>
              <DialogDescription>
                Export the dashboard data in your preferred format.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Export Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Period</Label>
                <Input type="month" value={filters.period} readOnly />
              </div>
              <div>
                <Label>Include</Label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="includeStats" defaultChecked className="h-4 w-4 text-indigo-600 rounded border-gray-300" />
                    <Label htmlFor="includeStats" className="text-sm">Statistics</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="includeCharts" defaultChecked className="h-4 w-4 text-indigo-600 rounded border-gray-300" />
                    <Label htmlFor="includeCharts" className="text-sm">Charts & Metrics</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="includeModules" defaultChecked className="h-4 w-4 text-indigo-600 rounded border-gray-300" />
                    <Label htmlFor="includeModules" className="text-sm">Module Widgets</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                showToast.success('Dashboard exported successfully');
                setIsExportModalOpen(false);
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
  );
};

export default React.memo(FinanceDashboard);