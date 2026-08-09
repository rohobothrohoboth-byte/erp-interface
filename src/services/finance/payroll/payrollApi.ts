// src/services/finance/payroll/payrollApi.ts
import api from '../../api';

const BASE_URL = '/payroll';

export const payrollApi = {
    // Payroll Management
    getAll: () => api.get(`${BASE_URL}/employees`),
    getById: (id: string) => api.get(`${BASE_URL}/employees/${id}`),
    create: (data: any) => api.post(`${BASE_URL}/employees`, data),
    update: (id: string, data: any) => api.put(`${BASE_URL}/employees/${id}`, data),
    delete: (id: string) => api.delete(`${BASE_URL}/employees/${id}`),

    // Payroll Processing
    process: (data: any) => api.post(`${BASE_URL}/process`, data),
    getStatus: (id: string) => api.get(`${BASE_URL}/status/${id}`),

    // Payslips
    getPayslips: () => api.get(`${BASE_URL}/payslips`),
    getPayslip: (id: string) => api.get(`${BASE_URL}/payslips/${id}`),
    downloadPayslip: (id: string) => api.get(`${BASE_URL}/payslips/${id}/download`, { responseType: 'blob' }),
    generatePayslip: (id: string) => api.post(`${BASE_URL}/payslips/generate/${id}`),

    // Employee Salaries
    getEmployeeSalaries: () => api.get(`${BASE_URL}/salaries`),
    updateEmployeeSalary: (id: string, data: any) => api.put(`${BASE_URL}/salaries/${id}`, data),

    // Calendar
    getCalendarEvents: (year: number, month: number) =>
        api.get(`${BASE_URL}/calendar`, { params: { year, month } }),

    // Reports
    getReportSummary: (month: number, year: number) =>
        api.get(`${BASE_URL}/reports/summary`, { params: { month, year } }),
    getDepartmentReport: (month: number, year: number) =>
        api.get(`${BASE_URL}/reports/department`, { params: { month, year } }),
    exportReport: (month: number, year: number, format: string) =>
        api.get(`${BASE_URL}/reports/export`, {
            params: { month, year, format },
            responseType: 'blob'
        }),

    // Settings
    getSettings: () => api.get(`${BASE_URL}/settings`),
    updateSettings: (data: any) => api.put(`${BASE_URL}/settings`, data),
};