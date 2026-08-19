import { useMemo, useState } from 'react';
import { useAllLeaveHistory } from '@/modules/hr/services/leave/LeaveHistory/leaveHistory.queries';
import type { HistLvReqList } from '@/modules/hr/types/leave/leaverequest';
import {
  ReportView,
  type ReportColumn,
  type ReportRow,
  type AppliedFilter,
} from './reportKit';

const columns: ReportColumn[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Employee' },
  { key: 'leaveType', label: 'Leave Type' },
  { key: 'days', label: 'Days', align: 'right' },
  { key: 'start', label: 'Start' },
  { key: 'end', label: 'End' },
  { key: 'requested', label: 'Requested' },
  { key: 'status', label: 'Status' },
];

const statusTone = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  const v = s.toLowerCase();
  if (v.includes('approv')) return 'success';
  if (v.includes('pend')) return 'warning';
  if (v.includes('reject') || v.includes('declin') || v.includes('cancel')) return 'danger';
  return 'neutral';
};

export default function LeaveReportsPage() {
  const { data = [], isLoading, error, refetch } = useAllLeaveHistory();
  const history = (data as HistLvReqList[]) ?? [];
  const [search, setSearch] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [status, setStatus] = useState('');

  const allRows: ReportRow[] = useMemo(
    () =>
      history.map((r) => ({
        id: String(r.id),
        code: r.code,
        name: r.empName,
        leaveType: r.leaveType,
        days: r.daysRequestedStr,
        start: r.startDateStr,
        end: r.endDateStr,
        requested: r.dateRequestedStr,
        status: r.status,
      })),
    [history],
  );

  const leaveTypes = useMemo(
    () => Array.from(new Set(allRows.map((r) => String(r.leaveType)).filter(Boolean))).sort(),
    [allRows],
  );
  const statuses = useMemo(
    () => Array.from(new Set(allRows.map((r) => String(r.status)).filter(Boolean))).sort(),
    [allRows],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (leaveType && r.leaveType !== leaveType) return false;
      if (status && r.status !== status) return false;
      if (!q) return true;
      return [r.code, r.name, r.leaveType].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [allRows, search, leaveType, status]);

  const stats = useMemo(
    () => [
      { label: 'Requests', value: rows.length },
      { label: 'Approved', value: rows.filter((r) => String(r.status).toLowerCase().includes('approv')).length },
      { label: 'Pending', value: rows.filter((r) => String(r.status).toLowerCase().includes('pend')).length },
      {
        label: 'Rejected',
        value: rows.filter((r) => {
          const v = String(r.status).toLowerCase();
          return v.includes('reject') || v.includes('declin');
        }).length,
      },
    ],
    [rows],
  );

  const appliedFilters: AppliedFilter[] = [
    ...(leaveType ? [{ label: 'Leave Type', value: leaveType }] : []),
    ...(status ? [{ label: 'Status', value: status }] : []),
    ...(search ? [{ label: 'Search', value: search }] : []),
  ];

  return (
    <ReportView
      title="Leave Report"
      subtitle="Company-wide leave requests, durations, and approval status."
      columns={columns}
      rows={rows}
      stats={stats}
      appliedFilters={appliedFilters}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by employee or code…"
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={() => refetch()}
      statusTone={statusTone}
      filenameBase="leave_report"
      filters={
        <>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option value="">All leave types</option>
            {leaveTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
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
        </>
      }
    />
  );
}
