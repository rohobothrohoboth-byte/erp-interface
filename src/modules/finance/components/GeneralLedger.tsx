// components/finance/GeneralLedger.tsx - FULLY FIXED (NO DUPLICATE CALCULATIONS)

import React, { useMemo } from 'react';
import { formatCurrency } from '@/modules/finance/utils/helpers';

interface GeneralLedgerProps {
  journalEntries?: any[];
  chartOfAccounts?: any[];
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

function GeneralLedger({
                         journalEntries = [],
                         chartOfAccounts = [],
                         analytics = {},  // ✅ Add analytics
                         filters = {},
                         periodRange = {},
                         isLoading = false
                       }: GeneralLedgerProps) {

  const data = useMemo(() => {
    const analyticsData = analytics || {};

    // ✅ ============================================================
    // ✅ ALL VALUES FROM BACKEND - NO CALCULATIONS
    // ✅ ============================================================

    // ✅ Journal Entry Metrics (pre-calculated)
    const totalEntries = analyticsData?.totalJournalEntries ?? 0;  // ✅ From backend
    const postedCount = analyticsData?.postedJournalCount ?? 0;    // ✅ From backend
    const unpostedCount = analyticsData?.unpostedJournalCount ?? 0; // ✅ From backend
    const totalDebit = analyticsData?.totalJournalDebit ?? 0;      // ✅ From backend
    const totalCredit = analyticsData?.totalJournalCredit ?? 0;    // ✅ From backend
    const isBalanced = analyticsData?.isJournalBalanced ?? true;   // ✅ From backend

    // ✅ Entries by Type (pre-calculated)
    const entriesByType = analyticsData?.journalEntriesByType ?? {};

    // ✅ Recent Entries (pre-calculated)
    const recentEntries = analyticsData?.recentJournalEntries ?? [];

    // ✅ Account Types (pre-calculated or from chartOfAccounts)
    const accountTypes = analyticsData?.accountTypes ?? {};

    // ✅ Debug logging - verify all values come from backend
    console.log('📊 GeneralLedger - ALL FROM BACKEND:', {
      period: filters?.period,
      totalEntries,          // ✅ From backend
      postedCount,           // ✅ From backend
      unpostedCount,         // ✅ From backend
      totalDebit,            // ✅ From backend
      totalCredit,           // ✅ From backend
      isBalanced,            // ✅ From backend
      entriesByTypeCount: Object.keys(entriesByType).length,
      recentEntriesCount: recentEntries.length,
      accountTypesCount: Object.keys(accountTypes).length,
    });

    return {
      totalEntries,
      postedCount,
      unpostedCount,
      totalDebit,
      totalCredit,
      isBalanced,
      entriesByType,
      recentEntries,
      accountTypes,
    };
  }, [analytics]);

  if (isLoading) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-indigo-100">
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
  if (data.totalEntries === 0) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-indigo-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">General Ledger</h3>
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        0 entries
                    </span>
          </div>
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No journal entries for the selected period</p>
          </div>
        </div>
    );
  }

  return (
      <div className="bg-white rounded-lg shadow-md p-4 border-2 border-indigo-100 hover:border-indigo-500 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">General Ledger</h3>
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    {data.totalEntries} entries
                </span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-xs text-gray-500">Posted</p>
              <p className="text-sm font-bold text-green-600">{data.postedCount}</p>  {/* ✅ From backend */}
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-xs text-gray-500">Unposted</p>
              <p className="text-sm font-bold text-yellow-600">{data.unpostedCount}</p>  {/* ✅ From backend */}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-xs text-gray-500">Debit</p>
              <p className="text-sm font-bold text-emerald-600">
                {formatCurrency(data.totalDebit)}  {/* ✅ From backend */}
              </p>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-xs text-gray-500">Credit</p>
              <p className="text-sm font-bold text-rose-600">
                {formatCurrency(data.totalCredit)}  {/* ✅ From backend */}
              </p>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Balance</span>
              <span className={`text-sm font-bold ${data.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                            {data.isBalanced ? '✅ Balanced' : '❌ Unbalanced'}  {/* ✅ From backend */}
                        </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                  className={`h-1.5 rounded-full ${data.isBalanced ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{
                    width: data.totalDebit > 0 && data.totalCredit > 0
                        ? `${Math.min(100, (Math.abs(data.totalDebit - data.totalCredit) / Math.max(data.totalDebit, data.totalCredit)) * 100)}%`
                        : '0%'
                  }}
              />
            </div>
          </div>

          {data.recentEntries.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Recent Entries</p>
                <div className="space-y-1 max-h-16 overflow-y-auto">
                  {data.recentEntries.map((entry: any, index: number) => (
                      <div key={index} className="flex justify-between text-xs border-b border-gray-50 py-1 last:border-0">
                                    <span className="text-gray-600 truncate">
                                        {entry.reference || entry.Reference || entry.number || entry.Number || 'Entry'}
                                    </span>
                        <span className={`font-medium ${(entry.isPosted || entry.status === 'Posted') ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {(entry.isPosted || entry.status === 'Posted') ? 'Posted' : 'Draft'}
                                    </span>
                      </div>
                  ))}
                </div>
              </div>
          )}

          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Account Types:</span>
              <span className="text-gray-600">
                            {Object.entries(data.accountTypes).length > 0
                                ? Object.entries(data.accountTypes).map(([type, count]) =>
                                    `${type}: ${count}`
                                ).join(' • ')
                                : 'No accounts'}
                        </span>
            </div>
          </div>
        </div>
      </div>
  );
}

export default React.memo(GeneralLedger);