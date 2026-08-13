import { useQuery } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ModulePageShell';
import { payrollRunApi } from '@/modules/hr/services/payroll/payroll.api';
import type { PayrollRunDto } from '@/modules/hr/services/payroll/payrollRun.api';

export const money = (n: number | null | undefined) =>
  `ETB ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtDate = (v?: string | null): string => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

export const runStatusTone = (s: string): 'success' | 'warning' | 'info' | 'danger' | 'neutral' => {
  const v = (s || '').toLowerCase();
  if (v.includes('approv') || v.includes('paid') || v.includes('complet')) return 'success';
  if (v.includes('process')) return 'info';
  if (v.includes('draft')) return 'warning';
  if (v.includes('cancel') || v.includes('fail')) return 'danger';
  return 'neutral';
};

/** Read-only payroll run detail with the per-employee breakdown. */
export function RunDetailModal({ runId, onClose }: { runId: string | null; onClose: () => void }) {
  const { data: run, isLoading, error } = useQuery<PayrollRunDto, Error>({
    queryKey: ['payroll', 'run', runId],
    queryFn: () => payrollRunApi.getById(runId!),
    enabled: !!runId,
  });

  if (!runId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <div>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {run?.name || 'Payroll Run'}
            </div>
            {run && (
              <div className="text-xs text-slate-500">
                {fmtDate(run.payPeriodStart)} – {fmtDate(run.payPeriodEnd)} · Pay date {fmtDate(run.paymentDate)}
              </div>
            )}
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[74vh] overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading run...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message}</div>
          ) : run ? (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Status', node: <StatusBadge status={run.payrollStatus} tone={runStatusTone(run.payrollStatus)} /> },
                  { label: 'Employees', node: run.totalEmployees },
                  { label: 'Gross', node: money(run.totalGrossPay) },
                  { label: 'Tax', node: money(run.totalTaxes) },
                  { label: 'Deductions', node: money(run.totalDeductions) },
                  { label: 'Net', node: <span className="font-semibold text-emerald-600">{money(run.totalNetPay)}</span> },
                  { label: 'Approved by', node: run.approvedBy || '—' },
                  { label: 'Processed', node: fmtDate(run.processedAt) },
                ].map((s, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.node}</div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-3 py-2 font-medium">Employee</th>
                      <th className="px-3 py-2 font-medium">Department</th>
                      <th className="px-3 py-2 text-right font-medium">Gross</th>
                      <th className="px-3 py-2 text-right font-medium">Tax</th>
                      <th className="px-3 py-2 text-right font-medium">Pension</th>
                      <th className="px-3 py-2 text-right font-medium">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(run.employees ?? []).map((e) => (
                      <tr key={e.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2">
                          <div className="font-medium text-slate-800 dark:text-slate-100">{e.employeeName}</div>
                          {e.employeeCode && <div className="text-xs text-slate-400">{e.employeeCode}</div>}
                        </td>
                        <td className="px-3 py-2">{e.department || '—'}</td>
                        <td className="px-3 py-2 text-right">{money(e.grossPay)}</td>
                        <td className="px-3 py-2 text-right">{money(e.taxAmount)}</td>
                        <td className="px-3 py-2 text-right">{money(e.pensionContribution)}</td>
                        <td className="px-3 py-2 text-right font-medium">{money(e.netPay)}</td>
                      </tr>
                    ))}
                    {(run.employees ?? []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                          No employee lines yet — process the run to compute pay.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
