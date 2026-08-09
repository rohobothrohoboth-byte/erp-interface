// components/finance/AccountsReceivable.tsx - FULLY FIXED

import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/finance/helpers';

interface AccountsReceivableProps {
    invoices?: any[];
    payments?: any[];
    customers?: any[];
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

function AccountsReceivable({
                                invoices = [],
                                payments = [],
                                customers = [],
                                analytics = {},
                                filters = {},
                                periodRange = {},
                                isLoading = false
                            }: AccountsReceivableProps) {

    const data = useMemo(() => {
        const analyticsData = analytics || {};

        // ✅ Accounts Receivable (pre-calculated)
        const totalReceivable = analyticsData?.accountsReceivable ?? 0;
        const overdueAmount = analyticsData?.salesOverdueAmount ?? 0;
        const overdueCount = analyticsData?.salesOverdueCount ?? 0;
        const currentPercentage = analyticsData?.currentPercentage ?? 0;
        const customerCount = analyticsData?.customerCount ?? 0;
        const paymentCount = analyticsData?.salesPaymentCount ?? 0;

        // ✅ Aging Report (pre-calculated)
        const agingReport = analyticsData?.agingReport ?? {
            current: 0,
            "1-30": 0,
            "31-60": 0,
            "61-90": 0,
            "90+": 0
        };

        // ✅ Top Customers - Ensure it's always an array
        let topCustomers = analyticsData?.topCustomers ?? [];

        // If topCustomers is an object (not array), convert it
        if (!Array.isArray(topCustomers) && typeof topCustomers === 'object') {
            topCustomers = Object.entries(topCustomers);
        }

        // Ensure each item is properly formatted
        const displayTopCustomers = topCustomers
            .map((item: any) => {
                if (Array.isArray(item) && item.length === 2) {
                    return item;
                }
                if (typeof item === 'object' && item !== null) {
                    const key = item.customerName || item.name || Object.keys(item)[0] || 'Unknown';
                    const value = item.totalAmount || item.amount || Object.values(item)[0] || 0;
                    return [String(key), Number(value)];
                }
                return null;
            })
            .filter((item: any) => item !== null && Array.isArray(item) && item.length === 2)
            .filter((item: any[]) => item[1] > 0)
            .slice(0, 5);

        // ✅ Fallback: If backend doesn't provide data, use raw data
        let displayTotalReceivable = totalReceivable;
        let displayAging = agingReport;
        let displayCustomerCount = customerCount;
        let fallbackTopCustomers: any[] = [];

        if (totalReceivable === 0 && Array.isArray(invoices) && invoices.length > 0) {
            const inv = Array.isArray(invoices) ? invoices : [];
            const cust = Array.isArray(customers) ? customers : [];
            const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
            const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

            const filteredInvoices = inv.filter((i: any) => {
                const invoiceDate = new Date(i.invoiceDate || i.InvoiceDate);
                return invoiceDate >= startDate && invoiceDate <= endDate;
            });

            const salesInvoices = filteredInvoices.filter((invoice: any) => {
                const invoiceType = invoice.invoiceType ?? invoice.InvoiceType ?? invoice.type ?? invoice.Type;
                return invoiceType === "Sales";
            });

            const customerMap = new Map<string, string>();
            cust.forEach((customer: any) => {
                const customerId = customer.id ?? customer.Id;
                const customerName = customer.name ?? customer.Name ?? customer.customerName ?? "Unknown";
                if (customerId) {
                    customerMap.set(customerId, customerName);
                }
            });

            const total = salesInvoices.reduce((sum: number, i: any) => {
                const status = i.status ?? i.Status;
                const totalAmount = Number(i.totalAmount ?? i.TotalAmount ?? i.amount ?? 0);
                const paidAmount = Number(i.paidAmount ?? i.PaidAmount ?? 0);
                const isUnpaid = status === "Unpaid" || status === "Pending";
                return isUnpaid ? sum + (totalAmount - paidAmount) : sum;
            }, 0);

            const byCustomer: Record<string, number> = {};
            salesInvoices.forEach((invoice: any) => {
                const status = invoice.status ?? invoice.Status;
                if (status !== "Unpaid" && status !== "Pending") return;

                const customerId = invoice.customerId ?? invoice.CustomerId;
                let customerName = "Unknown";
                if (customerId && customerMap.has(customerId)) {
                    customerName = customerMap.get(customerId)!;
                } else {
                    customerName = invoice.customerName ?? invoice.CustomerName ?? "Unknown";
                }
                const totalAmount = Number(invoice.totalAmount ?? invoice.TotalAmount ?? 0);
                const paidAmount = Number(invoice.paidAmount ?? invoice.PaidAmount ?? 0);
                const outstanding = totalAmount - paidAmount;
                byCustomer[customerName] = (byCustomer[customerName] ?? 0) + outstanding;
            });

            // Aging
            const today = new Date();
            const agingCalc = { current: 0, "1-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
            salesInvoices.forEach((invoice: any) => {
                const status = invoice.status ?? invoice.Status;
                if (status !== "Unpaid" && status !== "Pending") return;
                const dueDateValue = invoice.dueDate ?? invoice.DueDate;
                if (!dueDateValue) return;
                const dueDate = new Date(dueDateValue);
                const totalAmount = Number(invoice.totalAmount ?? invoice.TotalAmount ?? 0);
                const paidAmount = Number(invoice.paidAmount ?? invoice.PaidAmount ?? 0);
                const outstanding = totalAmount - paidAmount;
                const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysOverdue <= 0) agingCalc.current += outstanding;
                else if (daysOverdue <= 30) agingCalc["1-30"] += outstanding;
                else if (daysOverdue <= 60) agingCalc["31-60"] += outstanding;
                else if (daysOverdue <= 90) agingCalc["61-90"] += outstanding;
                else agingCalc["90+"] += outstanding;
            });

            displayTotalReceivable = total;
            fallbackTopCustomers = Object.entries(byCustomer)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5);
            displayAging = agingCalc;
            displayCustomerCount = Object.keys(byCustomer).length;
        }

        // ✅ Use analytics topCustomers if available, otherwise use fallback
        const finalTopCustomers = displayTopCustomers.length > 0 ? displayTopCustomers : fallbackTopCustomers;

        // ✅ Debug logging
        console.log('📊 AccountsReceivable - ALL FROM BACKEND:', {
            period: filters?.period,
            totalReceivable: displayTotalReceivable,
            overdueAmount,
            overdueCount,
            currentPercentage,
            topCustomersCount: finalTopCustomers.length,
            customerCount: displayCustomerCount,
            paymentCount,
        });

        return {
            totalReceivable: displayTotalReceivable,
            overdueAmount: Number(overdueAmount) || 0,
            overdueCount: Number(overdueCount) || 0,
            currentPercentage: Number(currentPercentage) || 0,
            topCustomers: finalTopCustomers,
            customerCount: displayCustomerCount,
            paymentCount,
            aging: displayAging,
        };
    }, [analytics, invoices, payments, customers, periodRange, filters]);

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

    // ✅ Show empty state if no data
    if (data.totalReceivable === 0 && data.customerCount === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Accounts Receivable</h3>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        0 customers
                    </span>
                </div>
                <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">No receivables for the selected period</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-100 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Accounts Receivable</h3>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {data.customerCount} customers
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Receivable</span>
                    <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(data.totalReceivable)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded p-2 text-center">
                        <p className="text-xs text-gray-500">Overdue</p>
                        <p className="text-sm font-bold text-red-600">
                            {data.overdueCount} ({formatCurrency(data.overdueAmount)})
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                        <p className="text-xs text-gray-500">Payments</p>
                        <p className="text-sm font-bold text-green-600">{data.paymentCount}</p>
                    </div>
                </div>

                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Aging Summary</p>
                    <div className="grid grid-cols-5 gap-1">
                        {Object.entries(data.aging).map(([label, amount]) => (
                            <div key={label} className="text-center bg-gray-50 rounded p-1">
                                <p className="text-[10px] text-gray-500">{label}</p>
                                <p className="text-xs font-semibold text-gray-700">
                                    {formatCurrency(Number(amount) || 0)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {data.topCustomers.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Top Customers</p>
                        <div className="space-y-1">
                            {data.topCustomers.map(([customer, amount]: [string, number], index: number) => (
                                <div key={`customer-${index}-${customer.replace(/\s/g, '-')}`} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate">{customer}</span>
                                    <span className="font-medium text-gray-800">{formatCurrency(amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{
                                width: data.totalReceivable > 0
                                    ? `${Math.min(100, Number(data.currentPercentage) || 0)}%`
                                    : '0%'
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                        {data.totalReceivable > 0
                            ? `${(Number(data.currentPercentage) || 0).toFixed(0)}% current`
                            : 'No receivables'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default React.memo(AccountsReceivable);