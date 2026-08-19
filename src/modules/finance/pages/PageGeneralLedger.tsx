import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import ChartOfAccountsSection from '@/modules/finance/components/generalledger/chartOfAccounts/ChartOfAccountsSection';
import {
  getFinanceIntegrity,
  getGeneralLedgerEntries,
  getTrialBalance,
  type FinanceIntegrityResponse,
  type GeneralLedgerEntry,
  type TrialBalanceResponse,
} from '@/modules/finance/services/generalLedger.api';

const formatMoney = (value: number) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const PageGeneralLedger: React.FC = () => {
  const [activeView, setActiveView] = useState<'ledger' | 'trialBalance' | 'accounts'>('ledger');
  const [entries, setEntries] = useState<GeneralLedgerEntry[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(null);
  const [integrity, setIntegrity] = useState<FinanceIntegrityResponse | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [fromDate, toDate],
  );

  const loadLedger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ledger, balance, health] = await Promise.all([
        getGeneralLedgerEntries({ ...filters, page, pageSize: 50 }),
        getTrialBalance(filters),
        getFinanceIntegrity(filters),
      ]);
      setEntries(ledger.data ?? []);
      setTotalPages(Math.max(ledger.totalPages ?? 1, 1));
      setTrialBalance(balance);
      setIntegrity(health);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load General Ledger data.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    if (activeView !== 'accounts') {
      void loadLedger();
    }
  }, [activeView, loadLedger]);

  const applyFilters = () => {
    setPage(1);
    void loadLedger();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-3">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">General Ledger</h1>
            <p className="text-sm text-gray-500">
              Posted journal lines are the accounting source of truth.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => void loadLedger()}
          disabled={loading || activeView === 'accounts'}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border bg-white p-2">
        {[
          ['ledger', 'General Ledger'],
          ['trialBalance', 'Trial Balance'],
          ['accounts', 'Chart of Accounts'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveView(value as typeof activeView)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeView === value
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeView === 'accounts' ? (
        <ChartOfAccountsSection />
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              From
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="rounded-md border px-3 py-2 text-gray-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              To
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="rounded-md border px-3 py-2 text-gray-900"
              />
            </label>
            <Button onClick={applyFilters} disabled={loading}>
              Apply filters
            </Button>
          </div>

          {integrity && (
            <div
              className={`flex items-center justify-between rounded-lg border p-4 ${
                integrity.isHealthy
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {integrity.isHealthy ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {integrity.isHealthy ? 'Ledger integrity is healthy' : 'Ledger integrity needs attention'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {integrity.postedEntries} posted entries checked; {integrity.invalidEntries} invalid.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {activeView === 'ledger' ? (
            <div className="overflow-hidden rounded-lg border bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Debit</th>
                      <th className="px-4 py-3 text-right">Credit</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {entries.map((entry) => (
                      <tr key={entry.lineId} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3">{new Date(entry.entryDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium">{entry.journalReference}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{entry.accountCode}</div>
                          <div className="text-xs text-gray-500">{entry.accountName}</div>
                        </td>
                        <td className="max-w-md px-4 py-3 text-gray-600">{entry.description || '—'}</td>
                        <td className="px-4 py-3 text-right">{entry.debit ? formatMoney(entry.debit) : '—'}</td>
                        <td className="px-4 py-3 text-right">{entry.credit ? formatMoney(entry.credit) : '—'}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatMoney(entry.runningBalance)}</td>
                      </tr>
                    ))}
                    {!loading && entries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                          No posted ledger entries match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-600">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Debit</th>
                      <th className="px-4 py-3 text-right">Credit</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(trialBalance?.data ?? []).map((row) => (
                      <tr key={row.accountId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{row.accountCode}</div>
                          <div className="text-xs text-gray-500">{row.accountName}</div>
                        </td>
                        <td className="px-4 py-3">{row.accountType}</td>
                        <td className="px-4 py-3 text-right">{formatMoney(row.debit)}</td>
                        <td className="px-4 py-3 text-right">{formatMoney(row.credit)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatMoney(row.balance)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={2} className="px-4 py-3">TOTAL</td>
                      <td className="px-4 py-3 text-right">{formatMoney(trialBalance?.totalDebit ?? 0)}</td>
                      <td className="px-4 py-3 text-right">{formatMoney(trialBalance?.totalCredit ?? 0)}</td>
                      <td className="px-4 py-3 text-right">{formatMoney(trialBalance?.difference ?? 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={`border-t px-4 py-3 text-sm font-medium ${trialBalance?.isBalanced ? 'text-emerald-700' : 'text-red-700'}`}>
                {trialBalance?.isBalanced
                  ? 'Trial Balance is balanced: total debit equals total credit.'
                  : `Trial Balance is NOT balanced. Difference: ${formatMoney(trialBalance?.difference ?? 0)}`}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PageGeneralLedger;
