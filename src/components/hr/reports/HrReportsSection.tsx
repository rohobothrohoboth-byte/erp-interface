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
  const { data, isLoading, error } = useHrReportsSummary();
  return (
    <HrPageShell title="HR Reports" subtitle="Cross-module report hub" loading={isLoading} error={error?.message}>
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
  const { data, isLoading, error } = useHrReport(domain);
  return (
    <HrPageShell title={title} subtitle={`Upstream: ${data?.domain || domain}`} loading={isLoading} error={error?.message}>
      <div className="bg-white border rounded-lg p-4">
        <div className="mb-3 flex gap-2 items-center">
          <Badge variant={data?.upstreamSuccess ? 'default' : 'destructive'}>
            {data?.upstreamSuccess ? 'Upstream OK' : 'Upstream failed'}
          </Badge>
          <span className="text-xs text-gray-500">{data?.message}</span>
        </div>
        <pre className="text-xs overflow-auto max-h-[70vh] bg-gray-50 p-3 rounded">
          {JSON.stringify(data?.data ?? data, null, 2)}
        </pre>
      </div>
    </HrPageShell>
  );
};
