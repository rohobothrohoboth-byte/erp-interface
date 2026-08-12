import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Eye } from 'lucide-react';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { Button } from '@/shared/components/ui/button';
import { getAllPayrollRuns } from '@/modules/hr/services/payroll/payrollRun.api';
import { money, fmtDate, runStatusTone, RunDetailModal } from './payrollRunsShared';

export default function PayrollHistoryPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: runs = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['payroll', 'runs'],
    queryFn: getAllPayrollRuns,
  });

  const statuses = useMemo(
    () => Array.from(new Set(runs.map((r) => r.payrollStatus).filter(Boolean))).sort(),
    [runs],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return runs.filter((r) => {
      if (status && r.payrollStatus !== status) return false;
      if (!q) return true;
      return [r.name, r.payrollStatus].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [runs, search, status]);

  const totalNet = useMemo(() => runs.reduce((s, r) => s + Number(r.totalNetPay ?? 0), 0), [runs]);

  return (
    <ModulePageShell
      title="Payroll History"
      subtitle="Past payroll runs, totals, and payment status."
      stats={[
        { label: 'Runs', value: runs.length },
        { label: 'Total Net Paid', value: money(totalNet) },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search runs..."
      onRefresh={() => refetch()}
      filters={
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading history...
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 py-12 text-center">
          <p className="text-sm text-rose-700">{(error as Error)?.message || 'Failed to load payroll history.'}</p>
          <Button variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Run</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 text-right font-medium">Employees</th>
                <th className="px-4 py-3 text-right font-medium">Gross</th>
                <th className="px-4 py-3 text-right font-medium">Net</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                  <td className="px-4 py-3">{fmtDate(r.payPeriodStart)} – {fmtDate(r.payPeriodEnd)}</td>
                  <td className="px-4 py-3">{fmtDate(r.paymentDate)}</td>
                  <td className="px-4 py-3 text-right">{r.totalEmployees}</td>
                  <td className="px-4 py-3 text-right">{money(r.totalGrossPay)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{money(r.totalNetPay)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.payrollStatus} tone={runStatusTone(r.payrollStatus)} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setDetailId(r.id)}>
                      <Eye className="mr-1 h-3.5 w-3.5" /> View
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    {search || status ? 'No runs match your filters.' : 'No payroll history yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <RunDetailModal runId={detailId} onClose={() => setDetailId(null)} />
    </ModulePageShell>
  );
}
