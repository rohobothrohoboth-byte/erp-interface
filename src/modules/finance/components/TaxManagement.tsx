// components/finance/TaxManagement.tsx - WITH DEBUG

import React, { useMemo } from 'react';
import { formatCurrency } from '@/modules/finance/utils/helpers';

interface TaxManagementProps {
  taxReturns?: any[];
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

function TaxManagement({
                         taxReturns = [],
                         filters = {},
                         periodRange = {},
                         isLoading = false
                       }: TaxManagementProps) {

  const data = useMemo(() => {
    // ✅ DEBUG: Log what we received
    console.log('📊 TaxManagement - Received props:', {
      taxReturnsLength: taxReturns?.length || 0,
      taxReturns: taxReturns,
      filters,
      periodRange,
    });

    // ✅ Safely get tax returns
    const allTax = Array.isArray(taxReturns) ? taxReturns : [];

    console.log('📊 TaxManagement - All tax returns:', allTax.length);

    // ✅ Get fiscal year from filters
    const fiscalYear = filters?.fiscalYear || filters?.period?.split('-')[0] || null;

    console.log('📊 TaxManagement - Fiscal year from filters:', fiscalYear);

    // ✅ Filter by fiscal year
    let tax = allTax;

    if (fiscalYear) {
      tax = allTax.filter((t: any) => {
        const taxFiscalYear = t.fiscalYear || t.FiscalYear || '';
        const match = taxFiscalYear === fiscalYear;

        console.log(`📊 TaxManagement - Checking tax return: ${t.code}, fiscalYear: ${taxFiscalYear}, expected: ${fiscalYear}, match: ${match}`);

        return match;
      });
      console.log(`📊 TaxManagement - Filtered by fiscal year ${fiscalYear}: ${tax.length} returns`);
    } else {
      console.log('📊 TaxManagement - No fiscal year filter, showing all tax returns');
      tax = allTax;
    }

    // ✅ If no tax returns, return empty state
    if (tax.length === 0) {
      console.log('📊 TaxManagement - No tax returns found after filtering');
      return {
        total: 0,
        filed: 0,
        pending: 0,
        overdue: 0,
        draft: 0,
        totalLiability: 0,
        totalPaid: 0,
        balanceDue: 0,
        byType: {},
        upcoming: [],
        complianceRate: 0,
        fiscalYear: fiscalYear || 'None',
      };
    }

    // ✅ Filter by status
    const filed = tax.filter((t: any) => {
      const status = t.status || t.Status || '';
      return status === 'Filed' || status === 'Paid' || status === 'Completed';
    });

    const pending = tax.filter((t: any) => {
      const status = t.status || t.Status || '';
      return status === 'Pending' || status === 'pending';
    });

    const overdue = tax.filter((t: any) => {
      const status = t.status || t.Status || '';
      return status === 'Overdue' || status === 'overdue';
    });

    const draft = tax.filter((t: any) => {
      const status = t.status || t.Status || '';
      return status === 'Draft' || status === 'draft';
    });

    // ✅ Calculate totals
    const totalLiability = tax.reduce((sum: number, t: any) => {
      const amount = t.taxAmount || t.TaxAmount || t.amount || t.Amount || t.taxLiability || 0;
      return sum + Number(amount);
    }, 0);

    const totalPaid = tax.reduce((sum: number, t: any) => {
      const paid = t.amountPaid || t.AmountPaid || t.paidAmount || t.PaidAmount || 0;
      return sum + Number(paid);
    }, 0);

    const balanceDue = tax.reduce((sum: number, t: any) => {
      const due = t.balanceDue || t.BalanceDue || t.dueAmount || t.DueAmount || 0;
      return sum + Number(due);
    }, 0);

    // ✅ Group by type
    const byType = tax.reduce((acc: any, t: any) => {
      const type = t.taxType || t.TaxType || t.type || t.Type || 'Unknown';
      acc[type] = (acc[type] || 0) + Number(t.taxAmount || t.amount || 0);
      return acc;
    }, {});

    // ✅ Upcoming deadlines
    const upcoming = tax
        .filter((t: any) => {
          const dueDate = t.dueDate || t.DueDate;
          const status = t.status || t.Status || '';
          return dueDate &&
              new Date(dueDate) > new Date() &&
              status !== 'Filed' &&
              status !== 'Paid' &&
              status !== 'Completed';
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.dueDate || a.DueDate);
          const dateB = new Date(b.dueDate || b.DueDate);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 3);

    console.log('📊 TaxManagement - Final data:', {
      total: tax.length,
      filed: filed.length,
      pending: pending.length,
      overdue: overdue.length,
      totalLiability,
      balanceDue,
      fiscalYear: fiscalYear,
    });

    return {
      total: tax.length,
      filed: filed.length,
      pending: pending.length,
      overdue: overdue.length,
      draft: draft.length,
      totalLiability,
      totalPaid,
      balanceDue,
      byType,
      upcoming,
      complianceRate: tax.length > 0 ? (filed.length / tax.length) * 100 : 0,
      fiscalYear: fiscalYear || 'None',
    };
  }, [taxReturns, filters]);

  if (isLoading) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-amber-100">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
    );
  }

  // ✅ If no data, show empty state with fiscal year info
  if (data.total === 0) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-amber-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Tax Management</h3>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            0 returns
          </span>
          </div>
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">
              {data.fiscalYear !== 'None'
                  ? `No tax returns found for fiscal year ${data.fiscalYear}`
                  : 'No tax returns found'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Received {taxReturns?.length || 0} tax returns from API
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="bg-white rounded-lg shadow-md p-4 border-2 border-amber-100 hover:border-amber-500 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Tax Management</h3>
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
          {data.total} returns
        </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Liability</span>
            <span className="text-xl font-bold text-amber-600">
            {formatCurrency(data.totalLiability)}
          </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded p-2 text-center">
              <p className="text-xs text-green-600">Filed</p>
              <p className="text-sm font-bold text-green-700">{data.filed}</p>
            </div>
            <div className="bg-yellow-50 rounded p-2 text-center">
              <p className="text-xs text-yellow-600">Pending</p>
              <p className="text-sm font-bold text-yellow-700">{data.pending}</p>
            </div>
            <div className="bg-red-50 rounded p-2 text-center">
              <p className="text-xs text-red-600">Overdue</p>
              <p className="text-sm font-bold text-red-700">{data.overdue}</p>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Compliance Rate</span>
              <span className={`font-medium ${data.complianceRate >= 80 ? 'text-green-600' : data.complianceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {data.complianceRate.toFixed(1)}%
            </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                  className={`h-2 rounded-full ${data.complianceRate >= 80 ? 'bg-green-500' : data.complianceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, data.complianceRate)}%` }}
              />
            </div>
          </div>

          {data.upcoming.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Upcoming Deadlines</p>
                <div className="space-y-1">
                  {data.upcoming.map((tax: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm border-b border-gray-50 py-1 last:border-0">
                        <span className="text-gray-600">{tax.code || tax.Code || 'Tax Return'}</span>
                        <span className="text-gray-400 text-xs">
                    {tax.dueDate || tax.DueDate ? new Date(tax.dueDate || tax.DueDate).toLocaleDateString() : 'N/A'}
                  </span>
                      </div>
                  ))}
                </div>
              </div>
          )}

          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Balance Due</span>
              <span className={`font-medium ${data.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(data.balanceDue)}
            </span>
            </div>
          </div>
        </div>
      </div>
  );
}

export default React.memo(TaxManagement);