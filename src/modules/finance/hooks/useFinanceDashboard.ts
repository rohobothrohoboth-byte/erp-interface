// hooks/finance/useFinanceDashboard.ts - WITH LOGGING

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFullDashboard } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';

// ✅ Cache configuration
const CACHE_CONFIG = {
    analytics: {
        staleTime: 1 * 60 * 1000,  // 1 minute
        gcTime: 5 * 60 * 1000,     // 5 minutes
    },
};

export const extractData = (response: any) => {
    if (!response) return [];

    const candidates = [
        response?.data?.data,
        response?.data?.items,
        response?.data,
        response?.items,
        response,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate) && candidate.length > 0) {
            return candidate;
        }
    }

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            return candidate;
        }
    }

    return [];
};

export function useFinanceDashboard(filters: any) {
    const queryClient = useQueryClient();

    // ✅ Log the filters being used
    console.log('📡 [useFinanceDashboard] Filters:', {
        periodStart: filters.periodStart,
        periodEnd: filters.periodEnd,
        periodType: filters.periodType,
        fiscalYear: filters.fiscalYear,
    });

    // ============================================================
    // ✅ SINGLE SOURCE OF TRUTH - ONLY ONE API CALL!
    // ============================================================
    const dashboardQuery = useQuery({
        queryKey: [
            'finance',
            'dashboard',
            'full',
            filters.periodStart,
            filters.periodEnd,
            filters.periodType,
            filters.fiscalYear,
        ],
        queryFn: async () => {
            console.time('⏱️ [getFullDashboard] API call');
            try {
                const result = await getFullDashboard({
                    periodStart: filters.periodStart,
                    periodEnd: filters.periodEnd,
                    periodType: filters.periodType || 'month',
                    fiscalYear: filters.fiscalYear,
                });
                console.timeEnd('⏱️ [getFullDashboard] API call');
                console.log('✅ [getFullDashboard] Response received');
                return result;
            } catch (error) {
                console.timeEnd('⏱️ [getFullDashboard] API call');
                console.error('❌ [getFullDashboard] Error:', error);
                throw error;
            }
        },
        select: (data) => {
            console.time('⏱️ [useFinanceDashboard] Data processing');

            const response = data?.data || data || {};
            const analytics = response.analytics || {};

            // ✅ Log data sizes
            console.log('📊 [useFinanceDashboard] Data sizes:');
            console.log(`  📄 Analytics: ${Object.keys(analytics).length} keys`);
            console.log(`  🏦 Bank Accounts: ${response.bankAccounts?.length || 0}`);
            console.log(`  💰 Bank Transactions: ${response.bankTransactions?.length || 0}`);
            console.log(`  📊 Chart of Accounts: ${response.chartOfAccounts?.length || 0}`);
            console.log(`  📋 Budgets: ${response.budgets?.length || 0}`);
            console.log(`  🏗️ Assets: ${response.assets?.length || 0}`);
            console.log(`  📈 Revenue Trend: ${response.revenueTrend?.length || 0}`);

            // ✅ Log specific arrays that might be large
            if (response.bankAccounts?.length > 1000) {
                console.warn(`⚠️ Large bank accounts array: ${response.bankAccounts.length} items`);
            }
            if (response.chartOfAccounts?.length > 5000) {
                console.warn(`⚠️ Large chart of accounts array: ${response.chartOfAccounts.length} items`);
            }
            if (response.assets?.length > 1000) {
                console.warn(`⚠️ Large assets array: ${response.assets.length} items`);
            }

            const result = {
                // ✅ Raw data
                analytics: analytics,
                bankAccounts: response.bankAccounts || [],
                bankTransactions: response.bankTransactions || [],
                chartOfAccounts: response.chartOfAccounts || [],
                budgets: response.budgets || [],
                assets: response.assets || [],
                dateGenerated: response.dateGenerated || new Date().toISOString(),

                // ✅ KPI Metrics
                kpiMetrics: {
                    revenue: analytics.monthlyRevenue || 0,
                    expenses: analytics.totalExpenses || 0,
                    netIncome: analytics.netIncome || 0,
                    profitMargin: analytics.profitMargin || 0,
                    cashBalance: analytics.cashBalance || 0,
                    budgetUtilization: analytics.budgetUtilization || 0,
                    revenueGrowth: analytics.monthOverMonthGrowth || 0,
                    expenseGrowth: analytics.purchaseMonthOverMonthGrowth || 0,
                    overdueInvoices: analytics.overdueInvoices || 0,
                    pendingInvoices: analytics.pendingInvoices || 0,
                },

                // ✅ Financial Health
                financialHealth: {
                    netIncome: analytics.netIncome || 0,
                    profitMargin: analytics.profitMargin || 0,
                    cashBalance: analytics.cashBalance || 0,
                    netCashFlow: analytics.netCashFlow || 0,
                    cashInflow: analytics.cashInflow || 0,
                    cashOutflow: analytics.cashOutflow || 0,
                    accountsReceivable: analytics.accountsReceivable || 0,
                    accountsPayable: analytics.accountsPayable || 0,
                },

                // ✅ Budget Metrics
                budgetMetrics: {
                    totalBudget: analytics.totalBudgetAmount || 0,
                    totalBudgets: analytics.totalBudgets || 0,
                    utilization: analytics.budgetUtilization || 0,
                    remaining: analytics.budgetRemaining || 0,
                    variance: analytics.budgetVariance || 0,
                    variancePercentage: analytics.budgetVariancePercentage || 0,
                    isOverBudget: analytics.isOverBudget || false,
                    isNearBudget: analytics.isNearBudget || false,
                },

                // ✅ Cost Metrics
                costMetrics: {
                    totalCost: analytics.monthlyPurchaseExpense || 0,
                    purchaseCost: analytics.purchaseCost || 0,
                    costPerUnit: analytics.costPerUnit || 0,
                    profitPerUnit: analytics.profitPerUnit || 0,
                    costToRevenueRatio: analytics.costToRevenueRatio || 0,
                },

                // ✅ General Ledger
                ledgerMetrics: {
                    totalEntries: analytics.totalJournalEntries || 0,
                    postedCount: analytics.postedJournalCount || 0,
                    unpostedCount: analytics.unpostedJournalCount || 0,
                    totalDebit: analytics.totalJournalDebit || 0,
                    totalCredit: analytics.totalJournalCredit || 0,
                    isBalanced: analytics.isJournalBalanced || false,
                    entriesByType: analytics.journalEntriesByType || {},
                    recentEntries: analytics.recentJournalEntries || [],
                    accountTypes: analytics.accountTypes || {},
                },

                // ✅ Voucher Metrics
                voucherMetrics: {
                    paymentVouchers: analytics.paymentVoucherCount || 0,
                    receiptVouchers: analytics.receiptVoucherCount || 0,
                    journalVouchers: analytics.journalVoucherCount || 0,
                    totalVouchers: analytics.totalVouchers || 0,
                    pendingPayment: analytics.pendingPaymentVouchers || 0,
                    pendingReceipt: analytics.pendingReceiptVouchers || 0,
                    pendingJournal: analytics.pendingJournalVouchers || 0,
                    processedTypes: analytics.processedVoucherTypes || 0,
                    processedPercentage: analytics.voucherProcessedPercentage || 0,
                },

                // ✅ Asset Metrics
                assetMetrics: {
                    totalValue: analytics.totalAssetValue || 0,
                    netBookValue: analytics.netBookValue || 0,
                    totalDepreciation: analytics.totalDepreciation || 0,
                    activeCount: analytics.activeAssetCount || 0,
                    maintenanceCount: analytics.maintenanceAssetCount || 0,
                    totalCount: analytics.totalAssetCount || 0,
                    byType: analytics.assetsByType || {},
                    topAssets: analytics.topAssets || [],
                },

                // ✅ Cash & Bank Metrics
                cashMetrics: {
                    totalCash: analytics.cashBalance || 0,
                    cashAmount: analytics.cashAmount || 0,
                    bankAmount: analytics.bankAmount || 0,
                    avgDailyCashFlow: analytics.avgDailyCashFlow || 0,
                    weeklyCashFlow: analytics.weeklyCashFlow || [],
                    recentTransactions: analytics.recentTransactions || [],
                    totalBankAccounts: analytics.totalBankAccounts || 0,
                    totalBankTransactions: analytics.totalBankTransactions || 0,
                },

                // ✅ Top Lists
                topLists: {
                    customers: analytics.topCustomers || [],
                    vendors: analytics.topVendors || [],
                    expenseCategories: analytics.topExpenseCategories || [],
                },

                // ✅ Revenue Trend
                revenueTrend: response.revenueTrend || [],

                // ✅ Aging Report
                agingReport: response.agingReport || {},

                // ✅ Payment Analytics
                paymentAnalytics: response.paymentAnalytics || {},

                // ✅ Expense Analytics
                expenseAnalytics: response.expenseAnalytics || {},

                // ✅ Budget Analytics
                budgetAnalytics: response.budgetAnalytics || {},

                // ✅ Invoice Summary
                invoiceSummary: {
                    totalInvoices: analytics.monthlyCount || 0,
                    totalRevenue: analytics.monthlyRevenue || 0,
                    averageInvoice: analytics.averageInvoice || 0,
                    overdueAmount: analytics.overdueAmount || 0,
                    salesByStatus: analytics.salesByStatus || [],
                    expensesByCategory: analytics.expensesByCategory || [],
                },

                // ✅ Recent Invoices
                recentInvoices: analytics.topCustomers?.slice(0, 5) || [],
            };

            console.timeEnd('⏱️ [useFinanceDashboard] Data processing');
            console.log('✅ [useFinanceDashboard] Data processed successfully');

            return result;
        },
        staleTime: CACHE_CONFIG.analytics.staleTime,
        gcTime: CACHE_CONFIG.analytics.gcTime,
        retry: 2,
        enabled: !!filters.periodStart && !!filters.periodEnd,
    });

    // ============================================================
    // ✅ LOADING & ERROR STATES WITH LOGGING
    // ============================================================

    const isLoading = dashboardQuery.isLoading;
    const isRefreshing = dashboardQuery.isFetching;
    const hasError = dashboardQuery.isError;
    const error = dashboardQuery.error;

    // ✅ Log when loading state changes
    if (isLoading) {
        console.log('⏳ [useFinanceDashboard] Loading data...');
    }
    if (hasError) {
        console.error('❌ [useFinanceDashboard] Error:', error);
    }

    // ============================================================
    // ✅ REFRESH FUNCTIONS
    // ============================================================

    const refetchAll = async () => {
        console.log('🔄 [useFinanceDashboard] Refreshing all data...');
        try {
            await queryClient.invalidateQueries({ queryKey: ['finance', 'dashboard'] });
            await dashboardQuery.refetch();
            showToast.success('Dashboard refreshed successfully');
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            showToast.error('Failed to refresh dashboard');
        }
    };

    const refetchDashboard = dashboardQuery.refetch;

    // ============================================================
    // ✅ DATA EXTRACTION
    // ============================================================

    const data = dashboardQuery.data || {};
    const analytics = data.analytics || {};

    return {
        // 📊 CONSOLIDATED DASHBOARD DATA
        dashboardData: dashboardQuery.data,
        analytics: analytics,
        dateGenerated: data.dateGenerated,

        // ✅ KPI Metrics
        kpiMetrics: data.kpiMetrics || {},
        financialHealth: data.financialHealth || {},
        budgetMetrics: data.budgetMetrics || {},
        costMetrics: data.costMetrics || {},
        ledgerMetrics: data.ledgerMetrics || {},
        voucherMetrics: data.voucherMetrics || {},
        assetMetrics: data.assetMetrics || {},
        cashMetrics: data.cashMetrics || {},
        topLists: data.topLists || {},
        revenueTrend: data.revenueTrend || [],
        agingReport: data.agingReport || {},
        paymentAnalytics: data.paymentAnalytics || {},
        expenseAnalytics: data.expenseAnalytics || {},
        budgetAnalytics: data.budgetAnalytics || {},

        // ✅ Invoice Data
        invoiceSummary: data.invoiceSummary || {},
        recentInvoices: data.recentInvoices || [],

        // ✅ Reference Data
        bankAccounts: data.bankAccounts || [],
        bankTransactions: data.bankTransactions || [],
        chartOfAccounts: data.chartOfAccounts || [],
        budgets: data.budgets || [],
        assets: data.assets || [],

        // ✅ Derived Data
        vendors: analytics.topVendors || [],
        customers: analytics.topCustomers || [],
        expenses: analytics.expensesByCategory || [],
        payments: analytics.paymentAnalytics?.paymentsByMethod || [],
        journalEntries: analytics.journalEntriesByType || {},
        loadJournalEntries: () => Promise.resolve({ data: analytics.journalEntriesByType || {} }),

        // ✅ Empty arrays for other data
        branches: [],
        employees: [],
        departments: [],
        taxReturns: [],
        auditLogs: [],

        // 🔄 LOADING STATES
        isLoading,
        isRefreshing,
        hasError,
        error,
        loadingStates: {
            dashboard: dashboardQuery.isLoading,
            all: dashboardQuery.isLoading,
        },

        // 🔄 REFETCH FUNCTIONS
        refetchAll,
        refetchDashboard,
        refetch: {
            dashboard: dashboardQuery.refetch,
            all: refetchAll,
        },

        // 📊 QUERY STATUSES
        status: {
            dashboard: dashboardQuery.status,
        },
    };
}