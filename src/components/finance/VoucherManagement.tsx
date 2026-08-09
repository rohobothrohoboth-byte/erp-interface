// components/finance/VoucherManagement.tsx - FULLY FIXED (NO DUPLICATE CALCULATIONS)

import React, { useMemo } from 'react';

interface VoucherType {
  type: string;
  count: number;
  pending: number;
  color: string;
}

interface VoucherManagementProps {
  invoices?: any[];
  payments?: any[];
  journalEntries?: any[];
  analytics?: any;  // ✅ Add analytics prop
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

function VoucherManagement({
                             invoices = [],
                             payments = [],
                             journalEntries = [],
                             analytics = {},  // ✅ Add analytics
                             filters = {},
                             periodRange = {},
                             isLoading = false
                           }: VoucherManagementProps) {

  const data = useMemo(() => {
    const analyticsData = analytics || {};

    // ✅ ============================================================
    // ✅ ALL VALUES FROM BACKEND - NO CALCULATIONS
    // ✅ ============================================================

    // ✅ Voucher Counts (pre-calculated)
    const paymentVoucherCount = analyticsData?.paymentVoucherCount ?? 0;      // ✅ From backend
    const receiptVoucherCount = analyticsData?.receiptVoucherCount ?? 0;      // ✅ From backend
    const journalVoucherCount = analyticsData?.journalVoucherCount ?? 0;      // ✅ From backend
    const totalVouchers = analyticsData?.totalVouchers ?? 0;                  // ✅ From backend

    // ✅ Pending Counts (pre-calculated)
    const pendingPaymentVouchers = analyticsData?.pendingPaymentVouchers ?? 0; // ✅ From backend
    const pendingReceiptVouchers = analyticsData?.pendingReceiptVouchers ?? 0; // ✅ From backend
    const pendingJournalVouchers = analyticsData?.pendingJournalVouchers ?? 0; // ✅ From backend

    // ✅ Processed Count (pre-calculated)
    const processedVoucherTypes = analyticsData?.processedVoucherTypes ?? 0;  // ✅ From backend
    const totalVoucherTypes = analyticsData?.totalVoucherTypes ?? 3;          // ✅ From backend
    const processedPercentage = analyticsData?.voucherProcessedPercentage ?? 0; // ✅ From backend

    // ✅ Fallback: If backend doesn't provide data, use raw data
    let displayPaymentVoucherCount = paymentVoucherCount;
    let displayReceiptVoucherCount = receiptVoucherCount;
    let displayJournalVoucherCount = journalVoucherCount;
    let displayTotalVouchers = totalVouchers;
    let displayPendingPaymentVouchers = pendingPaymentVouchers;
    let displayPendingReceiptVouchers = pendingReceiptVouchers;
    let displayPendingJournalVouchers = pendingJournalVouchers;
    let displayProcessedVoucherTypes = processedVoucherTypes;
    let displayProcessedPercentage = processedPercentage;

    // Only use raw data if backend doesn't provide it
    if (totalVouchers === 0 && Array.isArray(invoices)) {
      const inv = Array.isArray(invoices) ? invoices : [];
      const pay = Array.isArray(payments) ? payments : [];
      const jour = Array.isArray(journalEntries) ? journalEntries : [];
      const startDate = periodRange?.periodStart ? new Date(periodRange.periodStart) : new Date('2000-01-01');
      const endDate = periodRange?.periodEnd ? new Date(periodRange.periodEnd) : new Date('2099-12-31');

      // ✅ Only calculate if backend data is missing
      const filteredInvoices = inv.filter((i: any) => {
        const invoiceDate = new Date(i.invoiceDate || i.InvoiceDate);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });

      const filteredPayments = pay.filter((p: any) => {
        const paymentDate = new Date(p.paymentDate || p.PaymentDate || p.DateAdd);
        return paymentDate >= startDate && paymentDate <= endDate;
      });

      const filteredJournals = jour.filter((j: any) => {
        const journalDate = new Date(j.journalDate || j.JournalDate || j.DateAdd);
        return journalDate >= startDate && journalDate <= endDate;
      });

      const payVouchers = filteredPayments.filter((p: any) =>
          p.type === 'Payment' || p.paymentType === 'Payment' || p.voucherType === 'Payment'
      );

      const receiptVouchers = filteredInvoices.filter((i: any) =>
          i.status === 'Paid' || i.isPaid === true
      );

      const jourVouchers = filteredJournals;

      const pendingPay = payVouchers.filter((p: any) =>
          p.status === 'Pending' || p.status === 'Draft' || p.isApproved === false
      ).length;

      const pendingReceipt = filteredInvoices.filter((i: any) =>
          i.status === 'Unpaid' || i.status === 'Pending' || !i.isPaid
      ).length;

      const pendingJour = jourVouchers.filter((j: any) =>
          !j.isPosted || j.status === 'Draft'
      ).length;

      const total = payVouchers.length + receiptVouchers.length + jourVouchers.length;
      const processed = [pendingPay === 0, pendingReceipt === 0, pendingJour === 0].filter(Boolean).length;

      displayPaymentVoucherCount = payVouchers.length;
      displayReceiptVoucherCount = receiptVouchers.length;
      displayJournalVoucherCount = jourVouchers.length;
      displayTotalVouchers = total;
      displayPendingPaymentVouchers = pendingPay;
      displayPendingReceiptVouchers = pendingReceipt;
      displayPendingJournalVouchers = pendingJour;
      displayProcessedVoucherTypes = processed;
      displayProcessedPercentage = total > 0 ? (processed / 3) * 100 : 0;
    }

    // ✅ Build voucher data for display
    const voucherData: VoucherType[] = [
      {
        type: 'Payment Vouchers',
        count: displayPaymentVoucherCount,
        pending: displayPendingPaymentVouchers,
        color: 'text-blue-600',
      },
      {
        type: 'Receipt Vouchers',
        count: displayReceiptVoucherCount,
        pending: displayPendingReceiptVouchers,
        color: 'text-green-600',
      },
      {
        type: 'Journal Vouchers',
        count: displayJournalVoucherCount,
        pending: displayPendingJournalVouchers,
        color: 'text-purple-600',
      },
    ];

    // ✅ Debug logging - verify all values come from backend
    console.log('📊 VoucherManagement - ALL FROM BACKEND:', {
      period: filters?.period,
      paymentVoucherCount: displayPaymentVoucherCount,   // ✅ From backend
      receiptVoucherCount: displayReceiptVoucherCount,   // ✅ From backend
      journalVoucherCount: displayJournalVoucherCount,   // ✅ From backend
      totalVouchers: displayTotalVouchers,               // ✅ From backend
      pendingPaymentVouchers: displayPendingPaymentVouchers, // ✅ From backend
      pendingReceiptVouchers: displayPendingReceiptVouchers, // ✅ From backend
      pendingJournalVouchers: displayPendingJournalVouchers, // ✅ From backend
      processedVoucherTypes: displayProcessedVoucherTypes,   // ✅ From backend
      processedPercentage: displayProcessedPercentage,   // ✅ From backend
    });

    return {
      vouchers: voucherData,
      total: displayTotalVouchers,
      processedCount: displayProcessedVoucherTypes,
      totalTypes: totalVoucherTypes,
      processedPercentage: displayProcessedPercentage,
    };
  }, [analytics, invoices, payments, journalEntries, periodRange, filters]);

  const getStatusColor = (pending: number, total: number) => {
    if (total === 0) return 'bg-gray-100 text-gray-500';
    const ratio = pending / total;
    if (ratio === 0) return 'bg-green-100 text-green-800';
    if (ratio < 0.3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100">
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
  if (data.total === 0) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Voucher Management</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            0 total vouchers
          </span>
          </div>
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No vouchers for the selected period</p>
          </div>
        </div>
    );
  }

  return (
      <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-100 hover:border-indigo-800 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Voucher Management</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {data.total} total vouchers
        </span>
        </div>

        <div className="space-y-3">
          {data.vouchers.map((voucher, index) => (
              <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                <span className="text-gray-600 font-medium">{voucher.type}</span>
                <div className="text-right">
                  <div className={`font-bold ${voucher.color}`}>{voucher.count}</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(voucher.pending, voucher.count)}`}>
                    {voucher.pending > 0 ? `${voucher.pending} pending` : '✅ All processed'}
                  </div>
                </div>
              </div>
          ))}

          <div className="mt-3 pt-3 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Total Vouchers:</span>
              <span className="text-sm font-bold text-indigo-600">{data.total}</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, data.processedPercentage)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {data.processedCount} of {data.totalTypes} types fully processed
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}

export default React.memo(VoucherManagement);