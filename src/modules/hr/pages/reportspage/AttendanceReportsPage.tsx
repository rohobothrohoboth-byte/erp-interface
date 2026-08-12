import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/modules/hr/services/attandance/attendanceApi';
import { getAllEmployees } from '@/modules/hr/services/employee/emp.api';
import type { EmployeeListDto } from '@/modules/hr/types/employee';
import {
  ReportView,
  type ReportColumn,
  type ReportRow,
  type AppliedFilter,
} from './reportKit';

// The shared api client's response shape varies, so normalize to a record array.
function extractItems(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.items)) return res.data.items;
  if (Array.isArray(res.data?.data?.items)) return res.data.data.items;
  return [];
}

const fmtDate = (v?: string | null): string => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};
const fmtTime = (v?: string | null): string => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const columns: ReportColumn[] = [
  { key: 'date', label: 'Date' },
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Employee' },
  { key: 'department', label: 'Department' },
  { key: 'checkIn', label: 'Check In' },
  { key: 'checkOut', label: 'Check Out' },
  { key: 'hours', label: 'Hours', align: 'right' },
  { key: 'overtime', label: 'OT', align: 'right' },
  { key: 'status', label: 'Status' },
];

const statusTone = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  const v = s.toLowerCase();
  if (v.includes('present')) return 'success';
  if (v.includes('late')) return 'warning';
  if (v.includes('absent')) return 'danger';
  if (v.includes('leave') || v.includes('holiday') || v.includes('weekend')) return 'info';
  return 'neutral';
};

const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);

export default function AttendanceReportsPage() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('');

  const {
    data: records = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['attendance', 'report', from, to],
    queryFn: async () => {
      const res = await attendanceApi.getAttendanceRecords({
        from: new Date(from + 'T00:00:00Z').toISOString(),
        to: new Date(to + 'T23:59:59Z').toISOString(),
        page: 1,
        pageSize: 2000,
      });
      return extractItems(res);
    },
  });

  const { data: employees = [] } = useQuery<EmployeeListDto[]>({
    queryKey: ['employees', 'forAttendanceReport'],
    queryFn: getAllEmployees,
    staleTime: 5 * 60 * 1000,
  });

  const empById = useMemo(() => {
    const m = new Map<string, EmployeeListDto>();
    employees.forEach((e) => m.set(String(e.id), e));
    return m;
  }, [employees]);

  const allRows: ReportRow[] = useMemo(
    () =>
      records.map((r: any, idx: number) => {
        const emp = empById.get(String(r.employeeId));
        return {
          id: String(r.id ?? `${r.employeeId}-${r.date}-${idx}`),
          date: fmtDate(r.date),
          code: r.employeeCode || emp?.code || '',
          name: r.employeeName || emp?.empFullName || '',
          department: emp?.department || r.department || '',
          checkIn: fmtTime(r.checkIn),
          checkOut: fmtTime(r.checkOut),
          hours: r.hoursWorked ?? 0,
          overtime: r.overtimeHours ?? 0,
          status: r.status || '',
        };
      }),
    [records, empById],
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
      return [r.code, r.name, r.department].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [allRows, search, dept, status]);

  const stats = useMemo(
    () => [
      { label: 'Records', value: rows.length },
      { label: 'Present', value: rows.filter((r) => String(r.status).toLowerCase().includes('present')).length },
      { label: 'Late', value: rows.filter((r) => String(r.status).toLowerCase().includes('late')).length },
      { label: 'Absent', value: rows.filter((r) => String(r.status).toLowerCase().includes('absent')).length },
    ],
    [rows],
  );

  const appliedFilters: AppliedFilter[] = [
    { label: 'Period', value: `${fmtDate(from)} – ${fmtDate(to)}` },
    ...(dept ? [{ label: 'Department', value: dept }] : []),
    ...(status ? [{ label: 'Status', value: status }] : []),
    ...(search ? [{ label: 'Search', value: search }] : []),
  ];

  const dateInput =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';

  return (
    <ReportView
      title="Attendance Report"
      subtitle="Daily attendance, hours, and status by employee for the selected period."
      columns={columns}
      rows={rows}
      stats={stats}
      appliedFilters={appliedFilters}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by employee, code, department…"
      loading={isLoading}
      error={error instanceof Error ? error.message : error ? String(error) : null}
      onRefresh={() => refetch()}
      statusTone={statusTone}
      filenameBase="attendance_report"
      filters={
        <>
          <input type="date" className={dateInput} value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className={dateInput} value={to} onChange={(e) => setTo(e.target.value)} />
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
