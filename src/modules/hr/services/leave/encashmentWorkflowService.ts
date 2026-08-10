// src/services/hr/leave/encashmentWorkflowService.ts
import { api } from '@/shared/services/api';
import type { EncashmentRequest, EncashmentPolicy } from '@/modules/hr/types/leave/encashmentWorkflow';

export const encashmentWorkflowApi = {
    // Create encashment request
    createRequest: (data: Partial<EncashmentRequest>) =>
        api.post('/hrm/leave/v1/Encashment/Request', data),

    // Get pending approvals for a user (Manager/HR/Finance/CEO)
    getPendingApprovals: (approverId: string, role: string) =>
        api.get(`/hrm/leave/v1/Encashment/Pending/${role}/${approverId}`),

    // Approve or reject request
    processApproval: (requestId: string, action: 'APPROVE' | 'REJECT', comments: string) =>
        api.post(`/hrm/leave/v1/Encashment/Approve/${requestId}`, { action, comments }),

    // Get encashment policy
    getEncashmentPolicy: (leaveTypeId: string) =>
        api.get(`/hrm/leave/v1/Encashment/Policy/${leaveTypeId}`),

    // Get encashment calendar (when employees can request)
    getEncashmentCalendar: (year: number) =>
        api.get(`/hrm/leave/v1/Encashment/Calendar/${year}`),

    // Get department encashment budget
    getDepartmentBudget: (departmentId: string, fiscalYear: number) =>
        api.get(`/hrm/leave/v1/Encashment/Budget/${departmentId}/${fiscalYear}`),

    // Submit to finance for processing
    submitToFinance: (requestId: string) =>
        api.post(`/hrm/leave/v1/Encashment/SubmitToFinance/${requestId}`),

    // Generate encashment report for finance
    generateFinanceReport: (fiscalYearId: string, month?: string) =>
        api.get(`/hrm/leave/v1/Encashment/FinanceReport/${fiscalYearId}`, { params: { month } }),
};