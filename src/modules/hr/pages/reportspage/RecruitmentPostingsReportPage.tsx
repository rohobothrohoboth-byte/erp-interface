import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobPostingApi } from '@/modules/hr/services/recruitment/jobPosting/jobPosting.api';
import type { JobPostingListDto } from '@/modules/hr/types/recruit/jobPosting';
import { ReportView, type ReportColumn, type ReportRow, type AppliedFilter } from './reportKit';

const columns: ReportColumn[] = [
  { key: 'postNumber', label: 'Post #' },
  { key: 'reqNumber', label: 'Req #' },
  { key: 'postType', label: 'Type' },
  { key: 'reqAppQuan', label: 'Req / Applied' },
  { key: 'published', label: 'Published' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'status', label: 'Status' },
];

const statusTone = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  const v = s.toLowerCase();
  if (v.includes('publish')) return 'success';
  if (v.includes('pend') || v.includes('draft')) return 'warning';
  if (v.includes('cancel') || v.includes('expire')) return 'danger';
  if (v.includes('close') || v.includes('hold')) return 'info';
  return 'neutral';
};

export default function RecruitmentPostingsReportPage() {
  const { data = [], isLoading, error, refetch } = useQuery<JobPostingListDto[], Error>({
    queryKey: ['recruit', 'postings'],
    queryFn: jobPostingApi.getAll,
  });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const allRows: ReportRow[] = useMemo(
    () =>
      data.map((p) => ({
        id: String(p.id),
        postNumber: p.postNumber,
        reqNumber: p.reqNumber,
        postType: p.postTypeStr,
        reqAppQuan: p.reqAppQuan,
        published: p.publishedDateStr,
        deadline: p.deadlineDateStr,
        status: p.statusStr,
      })),
    [data],
  );

  const statuses = useMemo(() => Array.from(new Set(allRows.map((r) => String(r.status)).filter(Boolean))).sort(), [allRows]);
  const types = useMemo(() => Array.from(new Set(allRows.map((r) => String(r.postType)).filter(Boolean))).sort(), [allRows]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (status && r.status !== status) return false;
      if (type && r.postType !== type) return false;
      if (!q) return true;
      return [r.postNumber, r.reqNumber].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [allRows, search, status, type]);

  const stats = useMemo(
    () => [
      { label: 'Postings', value: rows.length },
      { label: 'Published', value: rows.filter((r) => String(r.status).toLowerCase().includes('publish')).length },
      { label: 'Closed', value: rows.filter((r) => String(r.status).toLowerCase().includes('close')).length },
    ],
    [rows],
  );

  const appliedFilters: AppliedFilter[] = [
    ...(status ? [{ label: 'Status', value: status }] : []),
    ...(type ? [{ label: 'Type', value: type }] : []),
    ...(search ? [{ label: 'Search', value: search }] : []),
  ];

  const sel = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm';
  return (
    <ReportView
      title="Job Postings Report"
      subtitle="Postings by type and status, with requisition/application counts and deadlines."
      columns={columns}
      rows={rows}
      stats={stats}
      appliedFilters={appliedFilters}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by post # or req #…"
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={() => refetch()}
      statusTone={statusTone}
      filenameBase="postings_report"
      filters={
        <>
          <select className={sel} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {types.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          <select className={sel} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </>
      }
    />
  );
}
