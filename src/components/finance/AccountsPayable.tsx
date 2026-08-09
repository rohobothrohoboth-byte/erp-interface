// components/finance/AccountsPayable.tsx - FULLY FIXED (NO DUPLICATE CALCULATIONS)

import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/finance/helpers';

interface AccountsPayableProps {
  invoices?: any[];
  payments?: any[];
  vendors?: any[];
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

function AccountsPayable({
                           invoices = [],
                           payments = [],
                           vendors = [],
                           analytics = {},
                           filters = {},
                           periodRange = {},
                           isLoading = false
                         }: AccountsPayableProps) {

  const data = useMemo(() => {
    const analyticsData = analytics || {};

    // ✅ ============================================================
    // ✅ ALL VALUES FROM BACKEND - NO CALCULATIONS
    // ✅ ============================================================

    // ✅ Accounts Payable (pre-calculated)
    const totalPayable = analyticsData?.accountsPayable ?? 0;
    const overdueAmount = analyticsData?.purchaseOverdueAmount ?? 0;
    const overdueCount = analyticsData?.purchaseOverdueCount ?? 0;
    const overduePercentage = analyticsData?.overduePercentage ?? 0;
    const vendorCount = analyticsData?.vendorCount ?? 0;
    const paymentCount = analyticsData?.purchasePaymentCount ?? 0;

    // ✅ Top Vendors - Ensure it's always an array
    let topVendors = analyticsData?.topVendors ?? [];

    // ✅ If topVendors is an object (not array), convert it
    if (!Array.isArray(topVendors) && typeof topVendors === 'object') {
      topVendors = Object.entries(topVendors);
    }

    // ✅ Ensure each item is properly formatted
    const displayTopVendors = topVendors
        .map((item: any) => {
          if (Array.isArray(item)) return item;
          if (typeof item === 'object' && item !== null) {
            const key = item.vendorName || item.name || Object.keys(item)[0];
            const value = item.totalAmount || item.amount || Object.values(item)[0];
            return [key, value];
          }
          return null;
        })
        .filter((item: any) => item !== null && Array.isArray(item) && item.length === 2 && item[1] > 0)
        .slice(0, 5);

    // ✅ Fallback: If backend doesn't provide data, use raw data
    let displayTotalPayable = totalPayable;
    let displayVendorCount = vendorCount;
    let fallbackTopVendors: any[] = [];

    // Only use raw data if backend doesn't provide it
    if (totalPayable === 0 && Array.isArray(invoices) && invoices.length > 0) {
      const inv = Array.isArray(invoices) ? invoices : [];
      const vend = Array.isArray(vendors) ? vendors : [];
      const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
      const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

      const filteredInvoices = inv.filter((i: any) => {
        const invoiceDate = new Date(i.invoiceDate || i.InvoiceDate);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });

      const purchaseInvoices = filteredInvoices.filter((invoice: any) => {
        const invoiceType = invoice.invoiceType ?? invoice.InvoiceType ?? invoice.type ?? invoice.Type;
        return invoiceType === "Purchase";
      });

      const vendorMap = new Map<string, string>();
      vend.forEach((vendor: any) => {
        const vendorId = vendor.id ?? vendor.Id;
        const vendorName = vendor.name ?? vendor.Name ?? vendor.vendorName ?? "Unknown";
        if (vendorId) {
          vendorMap.set(vendorId, vendorName);
        }
      });

      const total = purchaseInvoices.reduce((sum: number, invoice: any) => {
        const status = invoice.status ?? invoice.Status;
        const totalAmount = Number(invoice.totalAmount ?? invoice.TotalAmount ?? 0);
        const paidAmount = Number(invoice.paidAmount ?? invoice.PaidAmount ?? 0);
        const isUnpaid = status === "Unpaid" || status === "Pending";
        return isUnpaid ? sum + (totalAmount - paidAmount) : sum;
      }, 0);

      const byVendor: Record<string, number> = {};
      purchaseInvoices.forEach((invoice: any) => {
        const status = invoice.status ?? invoice.Status;
        if (status !== "Unpaid" && status !== "Pending") return;

        const vendorId = invoice.vendorId ?? invoice.VendorId;
        let vendorName = "Unknown";
        if (vendorId && vendorMap.has(vendorId)) {
          vendorName = vendorMap.get(vendorId)!;
        } else {
          vendorName = invoice.vendorName ?? invoice.VendorName ?? "Unknown";
        }
        const totalAmount = Number(invoice.totalAmount ?? invoice.TotalAmount ?? 0);
        const paidAmount = Number(invoice.paidAmount ?? invoice.PaidAmount ?? 0);
        const outstanding = totalAmount - paidAmount;
        byVendor[vendorName] = (byVendor[vendorName] ?? 0) + outstanding;
      });

      displayTotalPayable = total;
      fallbackTopVendors = Object.entries(byVendor)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5);
      displayVendorCount = Object.keys(byVendor).length;
    }

    // ✅ Use analytics topVendors if available, otherwise use fallback
    const finalTopVendors = displayTopVendors.length > 0 ? displayTopVendors : fallbackTopVendors;

    // ✅ Debug logging
    console.log('📊 AccountsPayable - ALL FROM BACKEND:', {
      period: filters?.period,
      totalPayable: displayTotalPayable,
      overdueAmount,
      overdueCount,
      overduePercentage,
      topVendorsCount: finalTopVendors.length,
      vendorCount: displayVendorCount,
      paymentCount,
    });

    return {
      totalPayable: displayTotalPayable,
      overdueAmount,
      overdueCount,
      overduePercentage,
      topVendors: finalTopVendors,
      vendorCount: displayVendorCount,
      paymentCount,
    };
  }, [analytics, invoices, payments, vendors, periodRange, filters]);

  if (isLoading) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-rose-100">
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
  if (data.totalPayable === 0 && data.vendorCount === 0) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-rose-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Accounts Payable</h3>
            <span className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
            0 vendors
          </span>
          </div>
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No payables for the selected period</p>
          </div>
        </div>
    );
  }

  return (
      <div className="bg-white rounded-lg shadow-md p-4 border-2 border-rose-100 hover:border-rose-500 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Accounts Payable</h3>
          <span className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
          {data.vendorCount} vendors
        </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Payable</span>
            <span className="text-xl font-bold text-rose-600">
            {formatCurrency(data.totalPayable)}
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

          {data.topVendors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Top Vendors</p>
                <div className="space-y-1">
                  {data.topVendors.map(([vendor, amount]: [string, number], index: number) => (
                      <div key={`vendor-${index}-${vendor.replace(/\s/g, '-')}`} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate">{vendor}</span>
                        <span className="font-medium text-gray-800">{formatCurrency(amount)}</span>
                      </div>
                  ))}
                </div>
              </div>
          )}

          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                  className="h-1.5 rounded-full bg-rose-500"
                  style={{
                    width: data.totalPayable > 0
                        ? `${Math.min(100, data.overduePercentage)}%`
                        : '0%'
                  }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {data.totalPayable > 0
                  ? `${data.overduePercentage.toFixed(0)}% overdue`
                  : 'No payables'}
            </p>
          </div>
        </div>
      </div>
  );
}

export default React.memo(AccountsPayable);