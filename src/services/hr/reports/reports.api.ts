import { api } from '../../api';
import { extractApiError, unwrapData } from '../apiError';
import type { HrReportEnvelope, HrReportsSummaryDto } from '../../../types/hr/reports';

const BASE = import.meta.env.VITE_HR_REPORTS_URL || '/hrm/reports';

export const reportsApi = {
  summary: async () => {
    try { return unwrapData<HrReportsSummaryDto>(await api.get(`${BASE}/summary`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  employees: async () => {
    try { return unwrapData<HrReportEnvelope>(await api.get(`${BASE}/employees`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  attendance: async () => {
    try { return unwrapData<HrReportEnvelope>(await api.get(`${BASE}/attendance`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  leave: async () => {
    try { return unwrapData<HrReportEnvelope>(await api.get(`${BASE}/leave`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  payroll: async () => {
    try { return unwrapData<HrReportEnvelope>(await api.get(`${BASE}/payroll`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  recruitment: async () => {
    try { return unwrapData<HrReportEnvelope>(await api.get(`${BASE}/recruitment`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
};
