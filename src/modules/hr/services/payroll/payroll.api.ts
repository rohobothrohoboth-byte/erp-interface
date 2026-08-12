// HR Payroll API client (HRM Payroll service via the gateway).
// Gateway maps `/payroll/**` -> `api/v1/**`, so the correct paths are
// `/payroll/<resource>` (NOT `/payroll/v1/...`). Controllers return raw objects
// (not wrapped in ApiResponse), so responses are unwrapped defensively.

import { api } from '@/shared/services/api';
import type { PayrollRunDto } from '@/modules/hr/services/payroll/payrollRun.api';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.7:5000';
const P = `${GATEWAY}/payroll`;

function unwrap<T>(res: any): T {
  return (res?.data?.data ?? res?.data) as T;
}
function unwrapList<T>(res: any): T[] {
  const d = res?.data?.data ?? res?.data;
  if (Array.isArray(d)) return d as T[];
  if (Array.isArray(d?.items)) return d.items as T[];
  return [];
}
function errMsg(e: any): string {
  return e?.response?.data?.message || e?.message || 'An unexpected error occurred';
}

// ───────────────────────── Salary Structures ─────────────────────────

export interface SalaryStructureDto {
  id: string;
  name: string;
  description?: string | null;
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

export interface SalaryStructureCreateDto {
  name: string;
  description?: string | null;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  deductions: number;
  pensionContribution: number;
}

export const salaryStructureApi = {
  async getAll(): Promise<SalaryStructureDto[]> {
    try {
      return unwrapList<SalaryStructureDto>(await api.get(`${P}/salary-structures`));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async create(dto: SalaryStructureCreateDto): Promise<SalaryStructureDto> {
    try {
      return unwrap<SalaryStructureDto>(await api.post(`${P}/salary-structures`, dto));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async update(id: string, dto: SalaryStructureCreateDto): Promise<SalaryStructureDto> {
    try {
      return unwrap<SalaryStructureDto>(await api.put(`${P}/salary-structures/${id}`, dto));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${P}/salary-structures/${id}`);
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
};

// ───────────────────────── Employee Salaries ─────────────────────────

export interface EmployeeSalaryDto {
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
  endDate?: string | null;
  isActive: boolean;
}

export interface EmployeeSalaryCreateDto {
  employeeId: string;
  salaryStructureId: string;
  effectiveDate: string;
  endDate?: string | null;
}

export const employeeSalaryApi = {
  async getAll(): Promise<EmployeeSalaryDto[]> {
    try {
      return unwrapList<EmployeeSalaryDto>(await api.get(`${P}/employee-salaries`));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async getByEmployee(employeeId: string): Promise<EmployeeSalaryDto[]> {
    try {
      return unwrapList<EmployeeSalaryDto>(await api.get(`${P}/employee-salaries/employee/${employeeId}`));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async assign(dto: EmployeeSalaryCreateDto): Promise<EmployeeSalaryDto> {
    try {
      return unwrap<EmployeeSalaryDto>(await api.post(`${P}/employee-salaries`, dto));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async update(id: string, dto: EmployeeSalaryCreateDto): Promise<EmployeeSalaryDto> {
    try {
      return unwrap<EmployeeSalaryDto>(await api.put(`${P}/employee-salaries/${id}`, dto));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
};

// ───────────────────────── Tax ─────────────────────────

export interface TaxRateDto {
  id: string;
  name: string;
  minIncome: number;
  maxIncome?: number | null;
  taxRate: number;
  deductibleAmount: number;
  taxYear: number;
  isActive: boolean;
}

export interface TaxRateCreateDto {
  name: string;
  minIncome: number;
  maxIncome?: number | null;
  taxRate: number;
  deductibleAmount: number;
  taxYear: number;
}

export interface TaxBracketDto {
  minIncome: number;
  maxIncome?: number | null;
  rate: number;
  amount: number;
}

export interface TaxCalculationDto {
  grossIncome: number;
  pensionContribution: number;
  taxableIncome: number;
  taxAmount: number;
  netIncome: number;
  taxBrackets: TaxBracketDto[];
}

export const taxApi = {
  async getRates(taxYear?: number): Promise<TaxRateDto[]> {
    try {
      const q = taxYear ? `?taxYear=${taxYear}` : '';
      return unwrapList<TaxRateDto>(await api.get(`${P}/tax/rates${q}`));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async createRate(dto: TaxRateCreateDto): Promise<TaxRateDto> {
    try {
      return unwrap<TaxRateDto>(await api.post(`${P}/tax/rates`, dto));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async calculate(grossIncome: number): Promise<TaxCalculationDto> {
    try {
      return unwrap<TaxCalculationDto>(await api.post(`${P}/tax/calculate`, { grossIncome }));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
};

// ───────────────────────── Payslips ─────────────────────────

export interface PayslipDto {
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
  generatedAt?: string | null;
}

export const payslipApi = {
  async getByEmployee(employeeId: string): Promise<PayslipDto[]> {
    try {
      return unwrapList<PayslipDto>(await api.get(`${P}/payslips/employee/${employeeId}`));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  downloadUrl(id: string): string {
    return `${P}/payslips/${id}/download`;
  },
};

// ───────────────────────── Payroll Runs (mutations) ─────────────────────────

export interface PayrollRunCreateDto {
  name: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDate: string;
  employeeIds: string[];
  notes?: string | null;
}

export const payrollRunApi = {
  async getById(id: string): Promise<PayrollRunDto> {
    try {
      return unwrap<PayrollRunDto>(await api.get(`${P}/payroll-runs/${id}`));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async create(dto: PayrollRunCreateDto): Promise<PayrollRunDto> {
    try {
      return unwrap<PayrollRunDto>(await api.post(`${P}/payroll-runs`, dto));
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async process(id: string): Promise<void> {
    try {
      await api.post(`${P}/payroll-runs/${id}/process`);
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async approve(id: string, approvedBy: string): Promise<void> {
    try {
      await api.post(`${P}/payroll-runs/${id}/approve`, { approvedBy });
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
  async generatePayslips(id: string): Promise<void> {
    try {
      await api.post(`${P}/payroll-runs/${id}/payslips`);
    } catch (e) {
      throw new Error(errMsg(e));
    }
  },
};
