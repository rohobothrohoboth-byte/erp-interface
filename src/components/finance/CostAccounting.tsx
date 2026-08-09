// components/finance/CostAccounting.tsx - FULLY FIXED

import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/finance/helpers';

// ✅ Helper to deduplicate vendors
const deduplicateKeyValueArray = (items: any[]): [string, number][] => {
    const map = new Map<string, number>();

    items.forEach((item) => {
        let key: string;
        let amount: number;

        if (Array.isArray(item) && item.length === 2) {
            key = String(item[0]);
            amount = Number(item[1]) || 0;
        } else if (typeof item === 'object' && item !== null) {
            key = item.vendorName || item.name || item.departmentName || 'Unknown';
            amount = Number(item.totalAmount || item.amount || 0);
        } else {
            return;
        }

        map.set(key, (map.get(key) || 0) + amount);
    });

    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
};

// ✅ Helper to group vendors by name (deduplicate by vendor name)
const groupVendorsByName = (vendors: any[]): [string, number][] => {
    const map = new Map<string, number>();

    vendors.forEach((v) => {
        const name = v.vendorName || v.name || 'Unknown';
        const amount = Number(v.totalAmount || v.amount || 0);
        map.set(name, (map.get(name) || 0) + amount);
    });

    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
};

interface CostAccountingProps {
    analytics?: any;
    invoices?: any[];
    expenses?: any[];
    departments?: any[];
    vendors?: any[];
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

function CostAccounting({
                            analytics = {},
                            invoices = [],
                            expenses = [],
                            departments = [],
                            vendors = [],
                            filters = {},
                            periodRange = {},
                            isLoading = false
                        }: CostAccountingProps) {

    const data = useMemo(() => {
        const analyticsData = analytics || {};

        // ✅ Revenue & Expenses (pre-calculated)
        const totalRevenue = analyticsData?.monthlyRevenue ?? 0;
        const totalCost = analyticsData?.purchaseCost ?? analyticsData?.monthlyPurchaseExpense ?? 0;
        const totalExpenses = analyticsData?.totalExpenses ?? 0;

        // ✅ Financial Ratios (pre-calculated)
        const costPerUnit = analyticsData?.costPerUnit ?? 0;
        const profitPerUnit = analyticsData?.profitPerUnit ?? 0;
        const costToRevenueRatio = analyticsData?.costToRevenueRatio ?? 0;
        const profitMargin = analyticsData?.profitMargin ?? 0;

        // ✅ Growth rates (pre-calculated)
        const revenueGrowth = analyticsData?.monthOverMonthGrowth ?? 0;
        const expenseGrowth = analyticsData?.purchaseMonthOverMonthGrowth ?? 0;

        // ✅ Counts - Use purchase count from analytics or calculate
        let expenseCount = analyticsData?.monthlyPurchaseCount ?? analyticsData?.purchaseCount ?? 0;

        // ✅ If expenseCount is 0, try to calculate from invoices
        if (expenseCount === 0 && Array.isArray(invoices)) {
            const inv = Array.isArray(invoices) ? invoices : [];
            const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
            const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

            const purchaseInvoices = inv.filter((i: any) => {
                const invoiceDate = new Date(i.invoiceDate || i.InvoiceDate || i.date || i.Date || i.DateAdd);
                const type = i.invoiceType || i.InvoiceType || i.type || i.Type || '';
                return invoiceDate >= startDate && invoiceDate <= endDate &&
                    (type === 'Purchase' || type === 'PurchaseInvoice' || type === 'purchase');
            });
            expenseCount = purchaseInvoices.length;
        }

        const totalVendors = analyticsData?.vendorCount ?? vendors?.length ?? 0;
        const totalDepartments = analyticsData?.totalDepartments ?? departments?.length ?? 0;

        // ✅ ============================================================
        // ✅ FIX: Extract and deduplicate Top Vendors from analytics
        // ✅ ============================================================

        // ✅ Get top vendors from analytics
        let topVendorsData = analyticsData?.topVendors ?? [];

        // ✅ If topVendors is an array of objects, group by vendor name
        let processedTopVendors: [string, number][] = [];

        if (Array.isArray(topVendorsData) && topVendorsData.length > 0) {
            // Check if it's an array of objects with vendorName
            if (typeof topVendorsData[0] === 'object' && topVendorsData[0] !== null) {
                // Group by vendor name (deduplicate)
                processedTopVendors = groupVendorsByName(topVendorsData);
            } else if (Array.isArray(topVendorsData[0])) {
                // Already in [key, value] format
                processedTopVendors = deduplicateKeyValueArray(topVendorsData);
            } else {
                // Try to convert to [key, value] format
                processedTopVendors = deduplicateKeyValueArray(topVendorsData);
            }
        }

        // ✅ If no top vendors from analytics, try to extract from expensesByCategory
        if (processedTopVendors.length === 0) {
            const expensesByCategory = analyticsData?.expensesByCategory ?? [];
            if (Array.isArray(expensesByCategory) && expensesByCategory.length > 0) {
                const vendorCategories = expensesByCategory
                    .filter((c: any) => c.category?.startsWith('Supplier:'))
                    .map((c: any) => [c.category?.replace('Supplier: ', ''), c.totalAmount] as [string, number]);
                processedTopVendors = deduplicateKeyValueArray(vendorCategories);
            }
        }

        // ✅ Fallback: Use raw invoices data
        if (processedTopVendors.length === 0 && Array.isArray(vendors) && vendors.length > 0) {
            const vend = Array.isArray(vendors) ? vendors : [];
            const vendorMap = new Map<string, string>();
            vend.forEach((v: any) => {
                const vendorId = v.id || v.Id;
                const vendorName = v.name || v.Name || v.vendorName;
                if (vendorId && vendorName) {
                    vendorMap.set(vendorId, vendorName);
                }
            });

            const inv = Array.isArray(invoices) ? invoices : [];
            const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
            const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

            const purchaseInvoices = inv.filter((i: any) => {
                const invoiceDate = new Date(i.invoiceDate || i.InvoiceDate || i.date || i.Date || i.DateAdd);
                const type = i.invoiceType || i.InvoiceType || i.type || i.Type || '';
                return invoiceDate >= startDate && invoiceDate <= endDate &&
                    (type === 'Purchase' || type === 'PurchaseInvoice' || type === 'purchase');
            });

            const byVendor: Record<string, number> = {};
            purchaseInvoices.forEach((invoice: any) => {
                const vendorId = invoice.vendorId || invoice.VendorId;
                let vendorName = 'Unknown';
                if (vendorId && vendorMap.has(vendorId)) {
                    vendorName = vendorMap.get(vendorId)!;
                } else {
                    vendorName = invoice.vendorName || invoice.VendorName || 'Unknown';
                }
                byVendor[vendorName] = (byVendor[vendorName] || 0) + Number(invoice.totalAmount || invoice.TotalAmount || invoice.amount || 0);
            });

            processedTopVendors = Object.entries(byVendor)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 5);
        }

        // ✅ Top Departments - try to extract from expensesByCategory
        let processedTopDepartments: [string, number][] = [];
        const expensesByCategory = analyticsData?.expensesByCategory ?? [];
        if (Array.isArray(expensesByCategory) && expensesByCategory.length > 0) {
            // Filter out supplier categories and get department/expense categories
            const deptCategories = expensesByCategory
                .filter((c: any) => !c.category?.startsWith('Supplier:'))
                .map((c: any) => [c.category, c.totalAmount] as [string, number]);
            processedTopDepartments = deduplicateKeyValueArray(deptCategories);
        }

        // ✅ If no departments, use fallback
        if (processedTopDepartments.length === 0 && Array.isArray(departments) && departments.length > 0) {
            const dept = Array.isArray(departments) ? departments : [];
            const departmentMap = new Map<string, string>();
            dept.forEach((d: any) => {
                const deptId = d.id || d.Id;
                const deptName = d.name || d.Name;
                if (deptId && deptName) {
                    departmentMap.set(deptId, deptName);
                }
            });

            const inv = Array.isArray(invoices) ? invoices : [];
            const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
            const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

            const purchaseInvoices = inv.filter((i: any) => {
                const invoiceDate = new Date(i.invoiceDate || i.InvoiceDate || i.date || i.Date || i.DateAdd);
                const type = i.invoiceType || i.InvoiceType || i.type || i.Type || '';
                return invoiceDate >= startDate && invoiceDate <= endDate &&
                    (type === 'Purchase' || type === 'PurchaseInvoice' || type === 'purchase');
            });

            const byDepartment: Record<string, number> = {};
            purchaseInvoices.forEach((invoice: any) => {
                const deptId = invoice.departmentId || invoice.DepartmentId;
                let deptName = 'Unknown';
                if (deptId && departmentMap.has(deptId)) {
                    deptName = departmentMap.get(deptId)!;
                } else {
                    deptName = invoice.departmentName || invoice.DepartmentName || 'Unknown';
                }
                byDepartment[deptName] = (byDepartment[deptName] || 0) + Number(invoice.totalAmount || invoice.TotalAmount || invoice.amount || 0);
            });

            processedTopDepartments = Object.entries(byDepartment)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 5);
        }

        // ✅ Debug logging
        console.log('📊 CostAccounting - Processed Data:', {
            period: filters?.period,
            totalRevenue,
            totalCost,
            costPerUnit,
            profitPerUnit,
            costToRevenueRatio,
            profitMargin,
            expenseCount,
            topVendorsCount: processedTopVendors.length,
            topDepartmentsCount: processedTopDepartments.length,
            totalVendors,
            totalDepartments,
            topVendors: processedTopVendors,
            topDepartments: processedTopDepartments,
        });

        return {
            totalRevenue: Number(totalRevenue) || 0,
            totalCost: Number(totalCost) || 0,
            totalExpenses: Number(totalExpenses) || 0,
            costPerUnit: Number(costPerUnit) || 0,
            profitPerUnit: Number(profitPerUnit) || 0,
            costToRevenueRatio: Number(costToRevenueRatio) || 0,
            profitMargin: Number(profitMargin) || 0,
            revenueGrowth: Number(revenueGrowth) || 0,
            expenseGrowth: Number(expenseGrowth) || 0,
            topVendors: processedTopVendors,
            topDepartments: processedTopDepartments,
            expenseCount: Number(expenseCount) || 0,
            totalVendors: Number(totalVendors) || 0,
            totalDepartments: Number(totalDepartments) || 0,
        };
    }, [analytics, vendors, invoices, departments, periodRange, filters]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-orange-100">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    // ✅ Only show empty state if truly no data
    if (data.expenseCount === 0 && data.totalCost === 0 && data.totalRevenue === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-orange-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Cost Accounting</h3>
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                        0 costs
                    </span>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-400">No purchase invoices found for this period</p>
                </div>
            </div>
        );
    }

    // ✅ Extract values from data for easier use
    const {
        totalRevenue,
        totalCost,
        costPerUnit,
        profitPerUnit,
        revenueGrowth,
        expenseGrowth,
        topVendors,
        topDepartments,
        totalVendors,
        totalDepartments,
        expenseCount
    } = data;

    const costToRevenueRatio = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-orange-100 hover:border-orange-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Cost Accounting</h3>
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    {expenseCount} costs
                </span>
            </div>

            <div className="space-y-3">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-center bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">Total Cost</p>
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(totalCost)}</p>
                        <p className={`text-xs ${expenseGrowth >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {expenseGrowth >= 0 ? '↑' : '↓'} {Math.abs(expenseGrowth).toFixed(1)}% vs last month
                        </p>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
                        <p className={`text-xs ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth).toFixed(1)}% vs last month
                        </p>
                    </div>
                </div>

                {/* Ratios */}
                <div className="mt-2 bg-gray-50 rounded p-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Cost per Unit</span>
                        <span className="font-medium text-gray-700">{costPerUnit.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Profit per Unit</span>
                        <span className={`font-medium ${profitPerUnit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {profitPerUnit.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* Top Vendors - Deduplicated */}
                {topVendors.length > 0 && (
                    <div className="mt-2">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-medium text-gray-500">Top Suppliers</p>
                            <span className="text-xs text-gray-400">{totalVendors || topVendors.length} total</span>
                        </div>
                        <div className="space-y-1 mt-1 max-h-32 overflow-y-auto">
                            {topVendors.map(([vendor, amount]: [string, number], index: number) => {
                                const percentage = totalCost > 0 ? (amount / totalCost) * 100 : 0;
                                return (
                                    <div key={`vendor-${index}`} className="flex flex-col">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 truncate max-w-[55%]" title={vendor}>
                                                {vendor}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">{formatCurrency(amount)}</span>
                                                <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                            <div
                                                className="h-1 rounded-full bg-orange-400"
                                                style={{ width: `${Math.min(100, percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Top Departments - from Expenses by Category */}
                {topDepartments.length > 0 && (
                    <div className="mt-2">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-medium text-gray-500">Cost by Category</p>
                            <span className="text-xs text-gray-400">{topDepartments.length} total</span>
                        </div>
                        <div className="space-y-1 mt-1 max-h-32 overflow-y-auto">
                            {topDepartments.map(([dept, amount]: [string, number], index: number) => {
                                const percentage = totalCost > 0 ? (amount / totalCost) * 100 : 0;
                                return (
                                    <div key={`dept-${index}`} className="flex flex-col">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 truncate max-w-[55%]" title={dept}>
                                                {dept}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">{formatCurrency(amount)}</span>
                                                <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                            <div
                                                className="h-1 rounded-full bg-blue-400"
                                                style={{ width: `${Math.min(100, percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Cost to Revenue Ratio */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Cost to Revenue Ratio</span>
                        <span className="font-medium text-gray-700">
                            {costToRevenueRatio.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${
                                costToRevenueRatio > 80 ? 'bg-red-500' :
                                    costToRevenueRatio > 60 ? 'bg-yellow-500' :
                                        'bg-green-500'
                            }`}
                            style={{
                                width: `${Math.min(100, costToRevenueRatio)}%`
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(CostAccounting);