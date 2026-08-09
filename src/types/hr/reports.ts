export interface HrReportEnvelope {
  domain: string;
  generatedAt: string;
  upstreamSuccess: boolean;
  message?: string | null;
  data?: unknown;
}

export interface HrReportsSummaryDto {
  generatedAt: string;
  employees: HrReportEnvelope;
  attendance: HrReportEnvelope;
  leave: HrReportEnvelope;
  payroll: HrReportEnvelope;
  recruitment: HrReportEnvelope;
}
