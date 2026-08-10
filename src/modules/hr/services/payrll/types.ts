export type SalaryStructure = Record<string, unknown> & { id?: string; name?: string };
export type EmployeeSalary = Record<string, unknown> & { id?: string; employeeId?: string };
export type PayrollRun = Record<string, unknown> & { id?: string; status?: string };
export type Payslip = Record<string, unknown> & { id?: string };
export type PayslipHistory = Record<string, unknown> & { id?: string };

export type ApiResponse<T> = {
  data: T;
  message?: string;
  success?: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
};
