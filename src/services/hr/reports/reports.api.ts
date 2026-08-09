import { api } from '../../api';
import { extractApiError, unwrapData } from '../apiError';
import type { HrReportEnvelope, HrReportsSummaryDto } from '../../../types/hr/reports';

const BASE = import.meta.env.VITE_HR_REPORTS_URL || '/hrm/reports';
/** Backend domain budget is ~7s; keep UI timeout slightly above that. */
const REPORTS_TIMEOUT_MS = 20_000;

const getReport = async <T>(path: string) => {
  try {
    return unwrapData<T>(await api.get(`${BASE}/${path}`, { timeout: REPORTS_TIMEOUT_MS }));
  } catch (e) {
    throw new Error(extractApiError(e));
  }
};

export const reportsApi = {
  summary: () => getReport<HrReportsSummaryDto>('summary'),
  employees: () => getReport<HrReportEnvelope>('employees'),
  attendance: () => getReport<HrReportEnvelope>('attendance'),
  leave: () => getReport<HrReportEnvelope>('leave'),
  payroll: () => getReport<HrReportEnvelope>('payroll'),
  recruitment: () => getReport<HrReportEnvelope>('recruitment'),
};
