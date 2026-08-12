import { useMemo, useState } from 'react';
import { useAllApplicants } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import {
  ReportView,
  type ReportColumn,
  type ReportRow,
  type AppliedFilter,
} from './reportKit';

const columns: ReportColumn[] = [
  { key: 'name', label: 'Applicant' },
  { key: 'position', label: 'Position' },
  { key: 'department', label: 'Department' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'applied', label: 'Applied' },
  { key: 'status', label: 'Status' },
];

const statusTone = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  const v = s.toLowerCase();
  if (v.includes('hire') || v.includes('accept') || v.includes('select')) return 'success';
  if (v.includes('reject') || v.includes('declin')) return 'danger';
  if (v.includes('interview') || v.includes('shortlist') || v.includes('review')) return 'info';
  if (v.includes('pend') || v.includes('applied') || v.includes('new')) return 'warning';
  return 'neutral';
};

export default function RecruitmentReportsPage() {
  const { data: applicants = [], isLoading, error, refetch } = useAllApplicants();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('');

  const allRows: ReportRow[] = useMemo(
    () =>
      applicants.map((a) => ({
        id: String(a.id),
        name: a.applicant,
        position: a.position,
        department: a.department,
        email: a.email,
        phone: a.phone ?? '',
        applied: a.appliedDate,
        status: a.statusStr,
      })),
    [applicants],
  );

  const departments = useMemo(
    () => Array.from(new Set(allRows.map((r) => String(r.department)).filter(Boolean))).sort(),
    [allRows],
  );
  const statuses = useMemo(
    () => Array.from(new Set(allRows.map((r) => String(r.status)).filter(Boolean))).sort(),
    [allRows],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (dept && r.department !== dept) return false;
      if (status && r.status !== status) return false;
      if (!q) return true;
      return [r.name, r.position, r.email, r.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [allRows, search, dept, status]);

  const stats = useMemo(
    () => [
      { label: 'Applicants', value: rows.length },
      {
        label: 'In Process',
        value: rows.filter((r) => {
          const v = String(r.status).toLowerCase();
          return v.includes('interview') || v.includes('shortlist') || v.includes('review');
        }).length,
      },
      {
        label: 'Hired',
        value: rows.filter((r) => {
          const v = String(r.status).toLowerCase();
          return v.includes('hire') || v.includes('accept') || v.includes('select');
        }).length,
      },
      {
        label: 'Rejected',
        value: rows.filter((r) => String(r.status).toLowerCase().includes('reject')).length,
      },
    ],
    [rows],
  );

  const appliedFilters: AppliedFilter[] = [
    ...(dept ? [{ label: 'Department', value: dept }] : []),
    ...(status ? [{ label: 'Status', value: status }] : []),
    ...(search ? [{ label: 'Search', value: search }] : []),
  ];

  return (
    <ReportView
      title="Recruitment Report"
      subtitle="Applicants, pipeline stage, and outcomes across open positions."
      columns={columns}
      rows={rows}
      stats={stats}
      appliedFilters={appliedFilters}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by applicant, position, email…"
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={() => refetch()}
      statusTone={statusTone}
      filenameBase="recruitment_report"
      filters={
        <>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
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
