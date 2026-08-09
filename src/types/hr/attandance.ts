// ============ Attendance Types ============
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Holiday' | 'Weekend';
  hoursWorked: number;
  overtimeHours: number;
  isLate: boolean;
  lateMinutes: number;
  shiftName: string | null;
  notes: string | null;
}

export interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
  averageHoursPerDay: number;
  attendanceRate: number;
}

export interface Shift {
  id: string;
  name: string;
  nameAm: string;
  description: string;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  breakDurationHours: number;
  totalHours: number;
  isActive: boolean;
  colorCode: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  daysApproved: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  isPaid: boolean;
  approvedBy: string | null;
  rejectedReason: string | null;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  totalDays: number;
  usedDays: number;
  balanceDays: number;
  year: number;
  expiryDate: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  date: string;
  hoursRequested: number;
  hoursApproved: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy: string | null;
  rejectedReason: string | null;
}

// ============ Payroll Types ============
export interface SalaryStructure {
  id: string;
  name: string;
  description: string;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  deductions: number;
  pensionContribution: number;
  totalSalary: number;
  isActive: boolean;
}
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  employeeCode: string;
  email: string;
  phone: string;
  department: string;
  departmentName: string;
  position: string;
  positionName: string;
  branch: string;
  branchName: string;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'OnLeave' | 'Terminated';
  profilePicture?: string;
  // Add other fields as needed
}
export interface EmployeeSalary {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  salaryStructureId: string;
  salaryStructureName: string;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  deductions: number;
  pensionContribution: number;
  totalSalary: number;
  effectiveDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface PayrollRun {
  id: string;
  name: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDate: string;
  payrollStatus: 'Draft' | 'Processing' | 'Completed' | 'Approved';
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
  totalDeductions: number;
  totalEmployees: number;
  employees: PayrollEmployee[];
  notes: string;
}

export interface PayrollEmployee {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  overtimePay: number;
  bonusPay: number;
  commissionPay: number;
  grossPay: number;
  taxAmount: number;
  pensionContribution: number;
  otherDeductions: number;
  netPay: number;
  daysWorked: number;
  daysAbsent: number;
  overtimeHours: number;
  notes: string;
}

export interface Payslip {
  id: string;
  payslipNumber: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  grossPay: number;
  housingAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  totalAllowances: number;
  overtimePay: number;
  bonusPay: number;
  commissionPay: number;
  taxAmount: number;
  pensionContribution: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  daysWorked: number;
  daysAbsent: number;
  overtimeHours: number;
  isGenerated: boolean;
  generatedAt: string | null;
}

export interface PayslipHistory {
  id: string;
  payslipNumber: string;
  periodStart: string;
  periodEnd: string;
  grossPay: number;
  netPay: number;
  isGenerated: boolean;
  generatedAt: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

// types/hr/attendance.ts
export interface DaySchedule {
  clockInStart: string;
  clockInEnd: string;
  clockOutStart: string;
  clockOutEnd: string;
  isActive: boolean;
  breakStart?: string;
  breakEnd?: string;
}

export interface ShiftSchedule {
  [day: string]: DaySchedule;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  description: string;
  schedule: ShiftSchedule;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface EmployeeShift {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftTemplateId: string;
  shiftTemplateName: string;
  effectiveDate: string;
  endDate: string | null;
  schedule: ShiftSchedule;
  isActive: boolean;
}

export interface TimeClockEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  checkIn: string;
  checkOut: string | null;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Holiday' | 'Weekend';
  hoursWorked: number;
  overtimeHours: number;
  isLate: boolean;
  lateMinutes: number;
  location: string;
  notes: string;
}