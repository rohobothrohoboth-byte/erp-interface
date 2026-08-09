import axios from 'axios';
import {
    SalaryStructure,
    EmployeeSalary,
    PayrollRun,
    Payslip,
    PayslipHistory,
    ApiResponse,
    PaginatedResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_PAYROLL_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ============ Salary Structures ============
export const salaryStructureApi = {
    getAll: () => api.get<ApiResponse<SalaryStructure[]>>('/salary-structures'),
    getById: (id: string) => api.get<ApiResponse<SalaryStructure>>(`/salary-structures/${id}`),
    create: (data: any) => api.post<ApiResponse<SalaryStructure>>('/salary-structures', data),
    update: (id: string, data: any) =>
        api.put<ApiResponse<SalaryStructure>>(`/salary-structures/${id}`, data),
    delete: (id: string) => api.delete(`/salary-structures/${id}`),
};

// ============ Employee Salaries ============
export const employeeSalaryApi = {
    getAll: () => api.get<ApiResponse<EmployeeSalary[]>>('/employee-salaries'),
    getByEmployee: (employeeId: string) =>
        api.get<ApiResponse<EmployeeSalary[]>>(`/employee-salaries/employee/${employeeId}`),
    getById: (id: string) => api.get<ApiResponse<EmployeeSalary>>(`/employee-salaries/${id}`),
    create: (data: any) => api.post<ApiResponse<EmployeeSalary>>('/employee-salaries', data),
    update: (id: string, data: any) =>
        api.put<ApiResponse<EmployeeSalary>>(`/employee-salaries/${id}`, data),
};

// ============ Payroll Runs ============
export const payrollRunApi = {
    getAll: () => api.get<ApiResponse<PayrollRun[]>>('/payroll-runs'),
    getById: (id: string) => api.get<ApiResponse<PayrollRun>>(`/payroll-runs/${id}`),
    create: (data: any) => api.post<ApiResponse<PayrollRun>>('/payroll-runs', data),
    process: (id: string) => api.post<ApiResponse<PayrollRun>>(`/payroll-runs/${id}/process`),
    approve: (id: string, data: { approvedBy: string }) =>
        api.post<ApiResponse<PayrollRun>>(`/payroll-runs/${id}/approve`, data),
    updateStatus: (id: string, data: { status: string; approvedBy?: string; notes?: string }) =>
        api.put<ApiResponse<PayrollRun>>(`/payroll-runs/${id}/status`, data),
};

// ============ Payslips ============
export const payslipApi = {
    getAll: (page?: number, pageSize?: number) =>
        api.get<ApiResponse<PaginatedResponse<Payslip>>>('/payslips', {
            params: { page, pageSize },
        }),
    getById: (id: string) => api.get<ApiResponse<Payslip>>(`/payslips/${id}`),
    getByEmployee: (employeeId: string) =>
        api.get<ApiResponse<Payslip[]>>(`/payslips/employee/${employeeId}`),
    generate: (payrollEmployeeId: string) =>
        api.post<ApiResponse<Payslip>>('/payslips/generate', { payrollEmployeeId }),
    generateForPayrollRun: (payrollRunId: string) =>
        api.post<ApiResponse<Payslip[]>>(`/payslips/generate/payroll-run/${payrollRunId}`),
    download: (id: string) =>
        api.get(`/payslips/${id}/download`, { responseType: 'blob' }),
    getHistory: (employeeId: string, year: number) =>
        api.get<ApiResponse<PayslipHistory[]>>(`/reports/employee/${employeeId}/history`, {
            params: { year },
        }),
};