import { useMemo, useState } from 'react';
import { useEmployeeList } from '@/modules/hr/services/employee/emp.queries';
import { EmpState } from '@/modules/hr/types/enum';
import {
  ReportView,
  type ReportColumn,
  type ReportRow,
  type AppliedFilter,
} from './reportKit';

const empStateLabel = (v: unknown): string => (EmpState as Record<string, string>)[String(v)] ?? String(v ?? '');

const columns: ReportColumn[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Employee' },
  { key: 'department', label: 'Department' },
  { key: 'position', label: 'Position' },
  { key: 'branch', label: 'Branch' },
  { key: 'gender', label: 'Gender' },
  { key: 'account', label: 'Account' },
  { key: 'status', label: 'Status' },
];

const statusTone = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  const v = s.toLowerCase();
  if (v.includes('active') || v.includes('approved')) return 'success';
  if (v.includes('leave')) return 'warning';
  if (v.includes('probation') || v.includes('pending') || v.includes('standby')) return 'info';
  if (v.includes('terminat') || v.includes('retir')) return 'danger';
  return 'neutral';
};

export default function EmployeeReportsPage() {
  const { data: employees = [], isLoading, error, refetch } = useEmployeeList();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('');

  const allRows: ReportRow[] = useMemo(
    () =>
      employees.map((e) => ({
        id: String(e.id),
        code: e.code,
        name: e.empFullName,
        department: e.department,
        position: e.position,
        branch: e.branch,
        gender: e.gender,
        account: e.hasAccount ? 'Yes' : 'No',
        status: empStateLabel(e.empState),
      })),
    [employees],
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
      return [r.code, r.name, r.department, r.position, r.branch]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [allRows, search, dept, status]);

  const stats = useMemo(
    () => [
      { label: 'Employees', value: rows.length },
      { label: 'Active', value: rows.filter((r) => String(r.status).toLowerCase().includes('active')).length },
      { label: 'On Leave', value: rows.filter((r) => String(r.status).toLowerCase().includes('leave')).length },
      {
        label: 'Probation',
        value: rows.filter((r) => String(r.status).toLowerCase().includes('probation')).length,
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
      title="Employee Report"
      subtitle="Headcount, status, and assignment across the organization."
      columns={columns}
      rows={rows}
      stats={stats}
      appliedFilters={appliedFilters}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by name, code, department, position…"
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={() => refetch()}
      statusTone={statusTone}
      filenameBase="employee_report"
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
