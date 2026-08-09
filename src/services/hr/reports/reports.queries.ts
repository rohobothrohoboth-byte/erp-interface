import { useQuery } from '@tanstack/react-query';
import { reportsApi } from './reports.api';
import { reportsKeys } from './reports.keys';

export const useHrReportsSummary = () =>
  useQuery({ queryKey: reportsKeys.summary, queryFn: reportsApi.summary, staleTime: 60_000 });

export const useHrReport = (domain: 'employees' | 'attendance' | 'leave' | 'payroll' | 'recruitment') =>
  useQuery({
    queryKey: reportsKeys.domain(domain),
    queryFn: () => reportsApi[domain](),
    staleTime: 60_000,
  });
