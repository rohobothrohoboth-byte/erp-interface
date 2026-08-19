import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle2, Loader2, RefreshCw, Scale } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { getGeneralLedger, getTrialBalance, type GeneralLedgerResponse, type TrialBalanceResponse } from '../services/ledger.api';

const formatAmount = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));

const today = new Date().toISOString().slice(0, 10);
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

const PageGeneralLedger: React.FC = () => {
    const [activeReport, setActiveReport] = useState<'ledger' | 'trialBalance'>('ledger');
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);
    const [asOfDate, setAsOfDate] = useState(today);
    const [ledger, setLedger] = useState<GeneralLedgerResponse | null>(null);
    const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadReport = useCallback(async () => {
        if (activeReport === 'ledger' && endDate < startDate) {
            setError('End date must be on or after start date.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (activeReport === 'ledger') {
                const response = await getGeneralLedger({ startDate, endDate });
                setLedger(response.data);
            } else {
                const response = await getTrialBalance({ asOfDate });
                setTrialBalance(response.data);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Unable to load the finance report.');
        } finally {
            setLoading(false);
        }
    }, [activeReport, asOfDate, endDate, startDate]);

    useEffect(() => {
        void loadReport();
    }, [loadReport]);

    const ledgerEntries = ledger?.entries ?? [];
    const trialLines = trialBalance?.lines ?? [];
    const trialStatus = useMemo(() => trialBalance?.isBalanced ?? false, [trialBalance]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-3">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">General Ledger</h1>
                        <p className="text-sm text-gray-500">Posted accounting transactions and trial balance</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => void loadReport()} disabled={loading} className="gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Refresh
                </Button>
            </div>

            <div className="flex gap-2 border-b">
                <button
                    type="button"
                    onClick={() => setActiveReport('ledger')}
                    className={`border-b-2 px-4 py-2 text-sm font-medium ${activeReport === 'ledger' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500'}`}
                >
                    General Ledger
                </button>
                <button
                    type="button"
                    onClick={() => setActiveReport('trialBalance')}
                    className={`border-b-2 px-4 py-2 text-sm font-medium ${activeReport === 'trialBalance' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500'}`}
                >
                    Trial Balance
                </button>
            </div>

            {activeReport === 'ledger' ? (
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-end gap-4">
                        <label className="text-sm text-gray-600">
                            From
                            <input className="mt-1 block rounded-md border px-3 py-2" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </label>
                        <label className="text-sm text-gray-600">
                            To
                            <input className="mt-1 block rounded-md border px-3 py-2" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </label>
                    </div>

                    <div className="mb-4 grid gap-3 md:grid-cols-4">
                        <SummaryCard label="Opening" value={ledger?.openingBalance ?? 0} />
                        <SummaryCard label="Debits" value={ledger?.totalDebits ?? 0} />
                        <SummaryCard label="Credits" value={ledger?.totalCredits ?? 0} />
                        <SummaryCard label="Closing" value={ledger?.closingBalance ?? 0} />
                    </div>

                    <ReportTable>
                        <thead>
                            <tr>
                                <Header>Date</Header>
                                <Header>Account</Header>
                                <Header>Reference</Header>
                                <Header>Description</Header>
                                <Header right>Debit</Header>
                                <Header right>Credit</Header>
                                <Header right>Balance</Header>
                            </tr>
                        </thead>
                        <tbody>
                            {ledgerEntries.map((entry, index) => (
                                <tr key={`${entry.reference ?? 'entry'}-${entry.date}-${index}`} className="border-t">
                                    <Cell>{new Date(entry.date).toLocaleDateString()}</Cell>
                                    <Cell>{entry.accountCode ? `${entry.accountCode} — ${entry.accountName ?? ''}` : entry.accountName ?? '—'}</Cell>
                                    <Cell>{entry.reference ?? '—'}</Cell>
                                    <Cell>{entry.description ?? '—'}</Cell>
                                    <Cell right>{formatAmount(entry.debit)}</Cell>
                                    <Cell right>{formatAmount(entry.credit)}</Cell>
                                    <Cell right>{formatAmount(entry.balance)}</Cell>
                                </tr>
                            ))}
                            {!loading && ledgerEntries.length === 0 && (
                                <tr><td colSpan={7} className="py-10 text-center text-gray-500">No posted transactions found for this period.</td></tr>
                            )}
                        </tbody>
                    </ReportTable>
                </div>
            ) : (
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                        <label className="text-sm text-gray-600">
                            As of
                            <input className="mt-1 block rounded-md border px-3 py-2" type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} />
                        </label>
                        <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${trialStatus ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {trialStatus ? <CheckCircle2 size={16} /> : <Scale size={16} />}
                            {trialStatus ? 'Trial balance is balanced' : `Difference: ${formatAmount(trialBalance?.difference ?? 0)}`}
                        </div>
                    </div>

                    <ReportTable>
                        <thead>
                            <tr>
                                <Header>Account</Header>
                                <Header>Type</Header>
                                <Header right>Debit</Header>
                                <Header right>Credit</Header>
                                <Header right>Balance</Header>
                            </tr>
                        </thead>
                        <tbody>
                            {trialLines.map(line => (
                                <tr key={line.accountId} className="border-t">
                                    <Cell>{line.accountCode ? `${line.accountCode} — ${line.accountName ?? ''}` : line.accountName ?? '—'}</Cell>
                                    <Cell>{line.accountType ?? '—'}</Cell>
                                    <Cell right>{formatAmount(line.debit)}</Cell>
                                    <Cell right>{formatAmount(line.credit)}</Cell>
                                    <Cell right>{formatAmount(line.balance)}</Cell>
                                </tr>
                            ))}
                            {!loading && trialLines.length === 0 && (
                                <tr><td colSpan={5} className="py-10 text-center text-gray-500">No balances found for this date.</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t bg-gray-50 font-semibold">
                                <td colSpan={2} className="px-3 py-3">Total</td>
                                <td className="px-3 py-3 text-right">{formatAmount(trialBalance?.totalDebits ?? 0)}</td>
                                <td className="px-3 py-3 text-right">{formatAmount(trialBalance?.totalCredits ?? 0)}</td>
                                <td className="px-3 py-3 text-right">{formatAmount(trialBalance?.difference ?? 0)}</td>
                            </tr>
                        </tfoot>
                    </ReportTable>
                </div>
            )}

            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
    <div className="rounded-lg bg-gray-50 p-3">
        <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
        <div className="mt-1 text-lg font-semibold text-gray-900">{formatAmount(value)}</div>
    </div>
);

const ReportTable = ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">{children}</table>
    </div>
);

const Header = ({ children, right = false }: { children: React.ReactNode; right?: boolean }) => (
    <th className={`bg-gray-50 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${right ? 'text-right' : 'text-left'}`}>{children}</th>
);

const Cell = ({ children, right = false }: { children: React.ReactNode; right?: boolean }) => (
    <td className={`px-3 py-3 text-gray-700 ${right ? 'text-right tabular-nums' : ''}`}>{children}</td>
);

export default PageGeneralLedger;
