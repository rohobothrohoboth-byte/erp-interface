import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { interviewApi } from '@/modules/hr/services/recruitment/interview/interview.api';
import { ReportView, type ReportColumn, type ReportRow, type AppliedFilter } from './reportKit';

const fmtDateTime = (v?: string | null): string => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const columns: ReportColumn[] = [
  { key: 'applicant', label: 'Applicant' },
  { key: 'position', label: 'Position' },
  { key: 'type', label: 'Type' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'location', label: 'Location / Link' },
  { key: 'interviewer', label: 'Interviewer' },
  { key: 'status', label: 'Status' },
];

const statusTone = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  const v = s.toLowerCase();
  if (v.includes('complet')) return 'success';
  if (v.includes('schedul')) return 'warning';
  if (v.includes('cancel') || v.includes('noshow') || v.includes('no show')) return 'danger';
  if (v.includes('progress') || v.includes('reschedul')) return 'info';
  return 'neutral';
};

export default function RecruitmentInterviewsReportPage() {
  const { data = [], isLoading, error, refetch } = useQuery<any[], Error>({
    queryKey: ['recruit', 'interviews'],
    queryFn: interviewApi.getAllInterviews,
  });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const allRows: ReportRow[] = useMemo(
    () =>
      (data ?? []).map((i: any, idx: number) => ({
        id: String(i.id ?? idx),
        applicant: i.applicantName ?? i.applicant ?? '',
        position: i.position ?? i.jobTitle ?? '',
        type: i.interviewType ?? i.interviewTypeStr ?? '',
        scheduled: fmtDateTime(i.scheduledDate),
        location: i.location || i.meetingLink || '',
        interviewer: i.interviewerName ?? i.interviewer ?? '',
        status: i.statusStr ?? i.status ?? '',
      })),
    [data],
  );

  const statuses = useMemo(() => Array.from(new Set(allRows.map((r) => String(r.status)).filter(Boolean))).sort(), [allRows]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (status && r.status !== status) return false;
      if (!q) return true;
      return [r.applicant, r.position, r.type, r.interviewer].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [allRows, search, status]);

  const stats = useMemo(
    () => [
      { label: 'Interviews', value: rows.length },
      { label: 'Scheduled', value: rows.filter((r) => String(r.status).toLowerCase().includes('schedul')).length },
      { label: 'Completed', value: rows.filter((r) => String(r.status).toLowerCase().includes('complet')).length },
    ],
    [rows],
  );

  const appliedFilters: AppliedFilter[] = [
    ...(status ? [{ label: 'Status', value: status }] : []),
    ...(search ? [{ label: 'Search', value: search }] : []),
  ];

  return (
    <ReportView
      title="Interview Schedule Report"
      subtitle="Scheduled and completed interviews across postings and applicants."
      columns={columns}
      rows={rows}
      stats={stats}
      appliedFilters={appliedFilters}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by applicant, position, interviewer…"
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={() => refetch()}
      statusTone={statusTone}
      filenameBase="interviews_report"
      filters={
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      }
    />
  );
}
