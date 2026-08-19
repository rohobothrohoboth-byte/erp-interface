import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobRequisitionApi } from '@/modules/hr/services/recruitment/jobRequisition/jobRequisition.api';
import type { JobReqListDto } from '@/modules/hr/types/recruit/jobRequisition';
import { ReportView, type ReportColumn, type ReportRow, type AppliedFilter } from './reportKit';

const columns: ReportColumn[] = [
  { key: 'reqNumber', label: 'Req #' },
  { key: 'position', label: 'Position' },
  { key: 'wfpCode', label: 'Workforce Plan' },
  { key: 'reqReason', label: 'Reason' },
  { key: 'reqQuantity', label: 'Qty', align: 'right' },
  { key: 'budgetCode', label: 'Budget' },
  { key: 'startDate', label: 'Start' },
  { key: 'status', label: 'Status' },
];

const statusTone = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  const v = s.toLowerCase();
  if (v.includes('approv')) return 'success';
  if (v.includes('pend')) return 'warning';
  if (v.includes('reject') || v.includes('cancel')) return 'danger';
  if (v.includes('close')) return 'info';
  return 'neutral';
};

export default function RecruitmentRequisitionsReportPage() {
  const { data = [], isLoading, error, refetch } = useQuery<JobReqListDto[], Error>({
    queryKey: ['recruit', 'requisitions'],
    queryFn: jobRequisitionApi.getAll,
  });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const allRows: ReportRow[] = useMemo(
    () =>
      data.map((r) => ({
        id: String(r.id),
        reqNumber: r.reqNumber,
        position: r.position,
        wfpCode: r.wfpCode,
        reqReason: r.reqReason,
        reqQuantity: r.reqQuantity,
        budgetCode: r.budgetCode,
        startDate: r.startDateStr || r.startDate,
        status: r.statusStr,
      })),
    [data],
  );

  const statuses = useMemo(() => Array.from(new Set(allRows.map((r) => String(r.status)).filter(Boolean))).sort(), [allRows]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (status && r.status !== status) return false;
      if (!q) return true;
      return [r.reqNumber, r.position, r.wfpCode, r.reqReason].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [allRows, search, status]);

  const stats = useMemo(
    () => [
      { label: 'Requisitions', value: rows.length },
      { label: 'Approved', value: rows.filter((r) => String(r.status).toLowerCase().includes('approv')).length },
      { label: 'Pending', value: rows.filter((r) => String(r.status).toLowerCase().includes('pend')).length },
      { label: 'Positions', value: rows.reduce((s, r) => s + (Number(r.reqQuantity) || 0), 0) },
    ],
    [rows],
  );

  const appliedFilters: AppliedFilter[] = [
    ...(status ? [{ label: 'Status', value: status }] : []),
    ...(search ? [{ label: 'Search', value: search }] : []),
  ];

  return (
    <ReportView
      title="Job Requisitions Report"
      subtitle="Requisitions raised across workforce plans, with quantities and approval status."
      columns={columns}
      rows={rows}
      stats={stats}
      appliedFilters={appliedFilters}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by req #, position, plan…"
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={() => refetch()}
      statusTone={statusTone}
      filenameBase="requisitions_report"
      filters={
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      }
    />
  );
}
