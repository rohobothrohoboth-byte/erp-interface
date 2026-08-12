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

interface MonthlyReport {
  records: any[];
  presentCount?: number;
  absentCount?: number;
  lateCount?: number;
  totalEmployees?: number;
  attendanceRate?: number;
}

function normalizeReport(res: any): MonthlyReport {
  const dto = res?.data ?? res ?? {};
  const records = dto.records ?? dto.Records ?? dto.data?.records ?? [];
  return {
    records: Array.isArray(records) ? records : [],
    presentCount: dto.presentCount ?? dto.PresentCount,
    absentCount: dto.absentCount ?? dto.AbsentCount,
    lateCount: dto.lateCount ?? dto.LateCount,
    totalEmployees: dto.totalEmployees ?? dto.TotalEmployees,
    attendanceRate: dto.attendanceRate ?? dto.AttendanceRate,
  };
}

const currentMonth = () => new Date().toISOString().slice(0, 7); // YYYY-MM

export default function AttendanceReportsPage() {
  const [ym, setYm] = useState(currentMonth());
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('');

  const year = Number(ym.slice(0, 4));
  const month = Number(ym.slice(5, 7));

  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['attendance', 'monthly', year, month],
    queryFn: async () => normalizeReport(await attendanceApi.getMonthlyReport(year, month)),
    enabled: !!year && !!month,
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
      (report?.records ?? []).map((r: any, idx: number) => {
        const emp = empById.get(String(r.employeeId ?? r.EmployeeId));
        return {
          id: String(r.id ?? r.Id ?? `${r.employeeId}-${r.date}-${idx}`),
          date: fmtDate(r.date ?? r.Date),
          code: r.employeeCode ?? r.EmployeeCode ?? emp?.code ?? '',
          name: r.employeeName ?? r.EmployeeName ?? emp?.empFullName ?? '',
          department: emp?.department ?? r.department ?? '',
          checkIn: fmtTime(r.checkIn ?? r.CheckIn),
          checkOut: fmtTime(r.checkOut ?? r.CheckOut),
          hours: r.hoursWorked ?? r.HoursWorked ?? 0,
          overtime: r.overtimeHours ?? r.OvertimeHours ?? 0,
          status: r.status ?? r.Status ?? '',
        };
      }),
    [report, empById],
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
      {
        label: 'Present',
        value: report?.presentCount ?? rows.filter((r) => String(r.status).toLowerCase().includes('present')).length,
      },
      {
        label: 'Late',
        value: report?.lateCount ?? rows.filter((r) => String(r.status).toLowerCase().includes('late')).length,
      },
      {
        label: 'Absent',
        value: report?.absentCount ?? rows.filter((r) => String(r.status).toLowerCase().includes('absent')).length,
      },
    ],
    [rows, report],
  );

  const appliedFilters: AppliedFilter[] = [
    { label: 'Month', value: ym },
    ...(dept ? [{ label: 'Department', value: dept }] : []),
    ...(status ? [{ label: 'Status', value: status }] : []),
    ...(search ? [{ label: 'Search', value: search }] : []),
  ];

  const controlCls =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';

  return (
    <ReportView
      title="Attendance Report"
      subtitle="Monthly attendance, hours, and status by employee."
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
          <input type="month" className={controlCls} value={ym} onChange={(e) => setYm(e.target.value)} />
          <select className={controlCls} value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select className={controlCls} value={status} onChange={(e) => setStatus(e.target.value)}>
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
