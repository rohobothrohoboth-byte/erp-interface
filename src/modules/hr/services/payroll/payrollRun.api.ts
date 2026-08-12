// Minimal client for payroll runs, used by the Payroll report.
// NOTE: the gateway route is `/payroll/{**catch-all}` -> `api/v1/{**catch-all}`,
// so the correct path is `/payroll/payroll-runs` (NOT `/payroll/v1/...`, which
// would double the version segment). PayrollRunController.GetAll returns the
// list directly (not wrapped in ApiResponse).

import { api } from '@/shared/services/api';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';

export interface PayrollRunDto {
  id: string;
  name: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDate: string;
  payrollStatus: string;
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
  totalDeductions: number;
  totalEmployees: number;
  createdBy?: string | null;
  processedAt?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  notes?: string | null;
}

export async function getAllPayrollRuns(): Promise<PayrollRunDto[]> {
  const res = await api.get(`${GATEWAY}/payroll/payroll-runs`);
  const data = (res.data?.data ?? res.data) as PayrollRunDto[];
  return Array.isArray(data) ? data : [];
}
