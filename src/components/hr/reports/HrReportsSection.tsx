import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/badge';
import HrPageShell from '../shared/HrPageShell';
import { useHrReport, useHrReportsSummary } from '../../../services/hr/reports/reports.queries';
import type { HrReportEnvelope } from '../../../types/hr/reports';

const DomainCard: React.FC<{ title: string; to: string; envelope?: HrReportEnvelope }> = ({ title, to, envelope }) => (
  <Link to={to} className="block bg-white border rounded-lg p-4 hover:border-green-600 transition">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <Badge variant={envelope?.upstreamSuccess ? 'default' : 'destructive'}>
        {envelope?.upstreamSuccess ? 'OK' : 'Error'}
      </Badge>
    </div>
    <p className="text-xs text-gray-500">{envelope?.message || 'Open report'}</p>
  </Link>
);

export const HrReportsHome: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useHrReportsSummary();
  return (
    <HrPageShell
      title="HR Reports"
      subtitle="Calls gateway /hrm/reports/* → Reports service :7018"
      loading={isLoading}
      error={error?.message}
      actionLabel={isFetching ? 'Refreshing…' : 'Refresh'}
      onAction={() => { void refetch(); }}
    >
      <p className="text-xs text-gray-500 mb-2">
        Expected API: <code>GET {import.meta.env.VITE_HR_REPORTS_URL || '/hrm/reports'}/summary</code>
      </p>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <DomainCard title="Employees" to="/hr/reports/employees" envelope={data?.employees} />
        <DomainCard title="Attendance" to="/hr/reports/attendance" envelope={data?.attendance} />
        <DomainCard title="Leave" to="/hr/reports/leave" envelope={data?.leave} />
        <DomainCard title="Payroll" to="/hr/reports/payroll" envelope={data?.payroll} />
        <DomainCard title="Recruitment" to="/hr/reports/recruitment" envelope={data?.recruitment} />
      </div>
    </HrPageShell>
  );
};

export const HrReportDomainPage: React.FC<{ domain: 'employees' | 'attendance' | 'leave' | 'payroll' | 'recruitment'; title: string }> = ({
  domain, title,
}) => {
  const { data, isLoading, error, refetch, isFetching } = useHrReport(domain);
  return (
    <HrPageShell
      title={title}
      subtitle={`Gateway /hrm/reports/${domain} → Reports :7018 → upstream ${data?.domain || domain}`}
      loading={isLoading && !data}
      error={error?.message}
      actionLabel={isFetching ? 'Refreshing…' : 'Refresh'}
      onAction={() => { void refetch(); }}
    >
      {isFetching && data && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Refreshing report…
        </p>
      )}
      <div className="bg-white border rounded-lg p-4">
        <div className="mb-3 flex gap-2 items-center flex-wrap">
          <Badge variant={data?.upstreamSuccess ? 'default' : 'destructive'}>
            {data?.upstreamSuccess ? 'Upstream OK' : 'Upstream failed'}
          </Badge>
          <span className="text-xs text-gray-500">{data?.message || (error ? error.message : 'Waiting for Reports service…')}</span>
        </div>
        <pre className="text-xs overflow-auto max-h-[70vh] bg-gray-50 p-3 rounded">
          {JSON.stringify(data ?? null, null, 2)}
        </pre>
      </div>
    </HrPageShell>
  );
};
