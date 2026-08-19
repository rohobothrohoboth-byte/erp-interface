import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { periodFetcher } from '../../services/core/period/period.api';
import {
    getGeneralLedger,
    getTrialBalance,
    type GeneralLedgerResponse,
    type TrialBalanceResponse,
} from '../../services/finance/financeReports.api';

type PeriodOption = { id: string; name: string; startDate?: string; endDate?: string };

const money = (value: number) => new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const PageGeneralLedger: React.FC = () => {
    const [periods, setPeriods] = useState<PeriodOption[]>([]);
    const [periodId, setPeriodId] = useState('');
    const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(null);
    const [ledger, setLedger] = useState<GeneralLedgerResponse | null>(null);
    const [accountId, setAccountId] = useState('');
    const [view, setView] = useState<'trialBalance' | 'ledger'>('trialBalance');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedPeriod = useMemo(() => periods.find((period) => period.id === periodId), [periods, periodId]);

    const loadTrialBalance = async (selectedPeriodId: string) => {
        if (!selectedPeriodId) return;
        setLoading(true);
        setError(null);
        try {
            const report = await getTrialBalance(selectedPeriodId);
            setTrialBalance(report);
            setLedger(null);
            setAccountId(report.lines[0]?.accountId ?? '');
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Unable to load Trial Balance.');
        } finally {
            setLoading(false);
        }
    };

    const loadLedger = async () => {
        if (!periodId || !accountId) return;
        setLoading(true);
        setError(null);
        try {
            setLedger(await getGeneralLedger(periodId, accountId));
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Unable to load General Ledger.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        periodFetcher.getAllPeriods()
            .then((result) => {
                if (!active) return;
                const options = (result ?? []).map((period: any) => ({ id: period.id, name: period.name, startDate: period.startDate, endDate: period.endDate }));
                setPeriods(options);
            })
            .catch((err) => {
                if (active) setError(err?.message ?? 'Unable to load financial periods.');
            });
        return () => { active = false; };
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-3"><BookOpen className="h-6 w-6 text-indigo-600" /></div>
                    <div><h1 className="text-2xl font-bold text-gray-900">General Ledger</h1><p className="text-sm text-gray-500">Backend-authoritative financial reporting</p></div>
                </div>
                <Button variant="outline" disabled={loading || !periodId} onClick={() => void loadTrialBalance(periodId)} className="flex items-center gap-2"><RefreshCw size={16} />Refresh</Button>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="grid gap-4 md:grid-cols-3">
                    <label className="text-sm font-medium text-gray-700">Financial Period
                        <select value={periodId} onChange={(event) => { const next = event.target.value; setPeriodId(next); setLedger(null); setTrialBalance(null); setAccountId(''); if (next) void loadTrialBalance(next); }} className="mt-1 block w-full rounded-md border px-3 py-2">
                            <option value="">Select period</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-medium text-gray-700">Account
                        <select value={accountId} onChange={(event) => setAccountId(event.target.value)} disabled={!trialBalance} className="mt-1 block w-full rounded-md border px-3 py-2">
                            <option value="">Select account</option>{(trialBalance?.lines ?? []).map((line) => <option key={line.accountId} value={line.accountId}>{line.accountCode} - {line.accountName}</option>)}
                        </select>
                    </label>
                    <div className="flex items-end gap-2">
                        <Button variant={view === 'trialBalance' ? 'default' : 'outline'} onClick={() => setView('trialBalance')} disabled={!trialBalance}>Trial Balance</Button>
                        <Button variant={view === 'ledger' ? 'default' : 'outline'} onClick={() => { setView('ledger'); void loadLedger(); }} disabled={!accountId || loading}>General Ledger</Button>
                    </div>
                </div>
                {selectedPeriod && <p className="mt-3 text-xs text-gray-500">Reporting period supplied by the backend: {selectedPeriod.name}{selectedPeriod.startDate && selectedPeriod.endDate ? ` (${new Date(selectedPeriod.startDate).toLocaleDateString()} - ${new Date(selectedPeriod.endDate).toLocaleDateString()})` : ''}</p>}
            </div>

            {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            {view === 'trialBalance' && trialBalance && (
                <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                    <div className="flex flex-wrap justify-between gap-4 border-b p-4"><div><h2 className="font-semibold">Trial Balance — {trialBalance.periodName}</h2><p className="text-xs text-gray-500">{new Date(trialBalance.startDate).toLocaleDateString()} - {new Date(trialBalance.endDate).toLocaleDateString()}</p></div><div className={trialBalance.isBalanced ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>{trialBalance.isBalanced ? 'Balanced' : 'Out of Balance'} · Difference {money(trialBalance.difference)}</div></div>
                    <table className="min-w-full text-sm"><thead className="bg-gray-50 text-left"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Account</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Debit</th><th className="px-4 py-3 text-right">Credit</th><th className="px-4 py-3 text-right">Balance</th></tr></thead>
                        <tbody>{trialBalance.lines.map((line) => <tr key={line.accountId} className="border-t"><td className="px-4 py-3">{line.accountCode}</td><td className="px-4 py-3">{line.accountName}</td><td className="px-4 py-3">{line.accountType}</td><td className="px-4 py-3 text-right">{money(line.debit)}</td><td className="px-4 py-3 text-right">{money(line.credit)}</td><td className="px-4 py-3 text-right">{money(line.balance)}</td></tr>)}</tbody>
                        <tfoot className="border-t bg-gray-50 font-semibold"><tr><td colSpan={3} className="px-4 py-3">TOTAL</td><td className="px-4 py-3 text-right">{money(trialBalance.totalDebits)}</td><td className="px-4 py-3 text-right">{money(trialBalance.totalCredits)}</td><td className="px-4 py-3 text-right">{money(trialBalance.difference)}</td></tr></tfoot>
                    </table>
                </div>
            )}

            {view === 'ledger' && ledger && (
                <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                    <div className="border-b p-4"><h2 className="font-semibold">General Ledger — {ledger.entries[0]?.accountCode ?? ''} {ledger.entries[0]?.accountName ?? ''}</h2><p className="text-sm text-gray-500">Period: {ledger.periodName}</p></div>
                    <table className="min-w-full text-sm"><thead className="bg-gray-50 text-left"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Description</th><th className="px-4 py-3 text-right">Debit</th><th className="px-4 py-3 text-right">Credit</th><th className="px-4 py-3 text-right">Balance</th></tr></thead>
                        <tbody>{ledger.entries.map((entry) => <tr key={`${entry.reference}-${entry.date}`} className="border-t"><td className="px-4 py-3">{new Date(entry.date).toLocaleDateString()}</td><td className="px-4 py-3">{entry.reference}</td><td className="px-4 py-3">{entry.description}</td><td className="px-4 py-3 text-right">{money(entry.debit)}</td><td className="px-4 py-3 text-right">{money(entry.credit)}</td><td className="px-4 py-3 text-right">{money(entry.balance)}</td></tr>)}</tbody>
                        <tfoot className="border-t bg-gray-50 font-semibold"><tr><td colSpan={3} className="px-4 py-3">TOTAL</td><td className="px-4 py-3 text-right">{money(ledger.totalDebits)}</td><td className="px-4 py-3 text-right">{money(ledger.totalCredits)}</td><td className="px-4 py-3 text-right">{money(ledger.closingBalance)}</td></tr></tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PageGeneralLedger;