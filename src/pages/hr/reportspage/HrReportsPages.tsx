import { HrReportDomainPage, HrReportsHome } from '../../../components/hr/reports/HrReportsSection';

export function HrReportsPage() { return <HrReportsHome />; }
export function HrEmployeeReportsPage() { return <HrReportDomainPage domain="employees" title="Employee Reports" />; }
export function HrAttendanceReportsPage() { return <HrReportDomainPage domain="attendance" title="Attendance Reports" />; }
export function HrLeaveReportsPage() { return <HrReportDomainPage domain="leave" title="Leave Reports" />; }
export function HrPayrollReportsPage() { return <HrReportDomainPage domain="payroll" title="Payroll Reports" />; }
export function HrRecruitmentReportsPage() { return <HrReportDomainPage domain="recruitment" title="Recruitment Reports" />; }
