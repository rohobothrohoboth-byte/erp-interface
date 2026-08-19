import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllPayrollRuns } from '@/modules/hr/services/payroll/payrollRun.api';
import {
  ReportView,
  type ReportColumn,
  type ReportRow,
  type AppliedFilter,
} from './reportKit';

const money = (n: number | null | undefined): string =>
  `ETB ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (v?: string | null): string => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

const columns: ReportColumn[] = [
  { key: 'name', label: 'Payroll Run' },
  { key: 'period', label: 'Pay Period' },
  { key: 'paymentDate', label: 'Payment Date' },
  { key: 'employees', label: 'Employees', align: 'right' },
  { key: 'gross', label: 'Gross', align: 'right' },
  { key: 'deductions', label: 'Deductions', align: 'right' },
  { key: 'taxes', label: 'Taxes', align: 'right' },
  { key: 'net', label: 'Net', align: 'right' },
  { key: 'status', label: 'Status' },
];

const statusTone = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  const v = s.toLowerCase();
  if (v.includes('approv') || v.includes('paid') || v.includes('complet')) return 'success';
  if (v.includes('process')) return 'info';
  if (v.includes('draft')) return 'warning';
  if (v.includes('cancel') || v.includes('fail')) return 'danger';
  return 'neutral';
};

export default function PayrollReportsPage() {
  const { data: runs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['payroll', 'runs'],
    queryFn: getAllPayrollRuns,
  });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const allRows: ReportRow[] = useMemo(
    () =>
      runs.map((r) => ({
        id: String(r.id),
        name: r.name,
        period: `${fmtDate(r.payPeriodStart)} – ${fmtDate(r.payPeriodEnd)}`,
        paymentDate: fmtDate(r.paymentDate),
        employees: r.totalEmployees,
        gross: money(r.totalGrossPay),
        deductions: money(r.totalDeductions),
        taxes: money(r.totalTaxes),
        net: money(r.totalNetPay),
        status: r.payrollStatus,
      })),
    [runs],
  );

  const statuses = useMemo(
    () => Array.from(new Set(allRows.map((r) => String(r.status)).filter(Boolean))).sort(),
    [allRows],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (status && r.status !== status) return false;
      if (!q) return true;
      return [r.name, r.period, r.status].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [allRows, search, status]);

  const stats = useMemo(() => {
    const totalNet = runs.reduce((s, r) => s + Number(r.totalNetPay ?? 0), 0);
    return [
      { label: 'Runs', value: rows.length },
      {
        label: 'Approved / Paid',
        value: rows.filter((r) => {
          const v = String(r.status).toLowerCase();
          return v.includes('approv') || v.includes('paid') || v.includes('complet');
        }).length,
      },
      { label: 'Draft', value: rows.filter((r) => String(r.status).toLowerCase().includes('draft')).length },
      { label: 'Total Net', value: money(totalNet) },
    ];
  }, [runs, rows]);

  const appliedFilters: AppliedFilter[] = [
    ...(status ? [{ label: 'Status', value: status }] : []),
    ...(search ? [{ label: 'Search', value: search }] : []),
  ];

  return (
    <ReportView
      title="Payroll Report"
      subtitle="Payroll run summaries, cost totals, and payment status by period."
      columns={columns}
      rows={rows}
      stats={stats}
      appliedFilters={appliedFilters}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by run name or period…"
      loading={isLoading}
      error={error instanceof Error ? error.message : error ? String(error) : null}
      onRefresh={() => refetch()}
      statusTone={statusTone}
      filenameBase="payroll_report"
      filters={
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      }
    />
  );
}
