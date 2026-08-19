// src/services/hr/leave/yearEndApi.ts
import { api } from '@/shared/services/api';
import type {
    FiscalYear,
    CarryoverPreview,
    ProcessResult,
    EncashmentRecord,
    EncashmentConfig,
    EncashmentRequest
} from '@/modules/hr/types/leave/leaveye';

export const yearEndApi = {
    // Fiscal Years
    getFiscalYears: () => api.get('/hrm/leave/v1/YearEnd/AvailableFiscalYears'),

    // Preview & Process
    getPreview: (fiscalYearId: string, force = true) =>
        api.get(`/hrm/leave/v1/YearEnd/Preview/${fiscalYearId}?force=${force}`),

    processYearEnd: (fiscalYearId: string) =>
        api.post('/hrm/leave/v1/YearEnd/Process?force=true', { fiscalYearId }),

    revertYearEnd: (fiscalYear: number) =>
        api.post(`/hrm/leave/v1/YearEnd/Revert/${fiscalYear}`),

    // Encashment Config
    getEncashmentConfig: () => api.get('/hrm/leave/v1/YearEnd/Encashment/Config'),

    processEncashment: (data: EncashmentRequest) =>
        api.post('/hrm/leave/v1/YearEnd/Encashment/Process', data),

    // Get encashment total
    getEncashmentTotal: (employeeId: string, fiscalYear: number) =>
        api.get(`/hrm/leave/v1/YearEnd/Encashment/Total/${employeeId}`, { params: { fiscalYear } }),

    // Get ALL encashments for admin
    getAllEncashments: async (fiscalYearId?: string) => {
        const url = fiscalYearId
            ? `/hrm/leave/v1/YearEnd/Encashment/History/All?fiscalYearId=${fiscalYearId}`
            : '/hrm/leave/v1/YearEnd/Encashment/History/All';

        const response = await api.get(url);

        // Transform the data to map DaysEncashed to encashmentDays
        const records = response.data?.data || [];
        const transformedRecords = records.map((record: any) => ({
            id: record.id || record.Id,
            employeeId: record.employeeId || record.EmployeeId,
            employeeName: record.employeeName,
            leaveTypeId: record.leaveTypeId || record.LeaveTypeId,
            leaveTypeName: record.leaveTypeName || record.LeaveTypeName || 'Annual Leave',
            encashmentDays: record.daysEncashed || record.DaysEncashed || 0,  // Map DaysEncashed here
            ratePerDay: record.ratePerDay || record.RatePerDay || 100,
            totalAmount: record.totalAmount || record.TotalAmount || 0,
            taxAmount: record.taxAmount || record.TaxAmount || 0,
            netAmount: record.netAmount || record.NetAmount || 0,
            status: record.status || record.Status || 'Pending',
            requestDate: record.requestDate || record.dateAdd || record.DateAdd,
            dateAdd: record.dateAdd || record.DateAdd,
            createdAt: record.createdAt || record.dateAdd || record.DateAdd
        }));

        return { ...response, data: { ...response.data, data: transformedRecords } };
    },


// Approve or reject encashment request
    approveEncashment: (id: string, status: 'Approved' | 'Rejected', comments?: string) =>
        api.post(`/hrm/leave/v1/YearEnd/Encashment/${id}/Approve`, { status, comments }),


    // History
    getProcessingHistory: (fiscalYearId: string) =>
        api.get(`/hrm/leave/v1/YearEnd/History/${fiscalYearId}`),

    canProcess: (fiscalYearId: string) =>
        api.get(`/hrm/leave/v1/YearEnd/CanProcess/${fiscalYearId}`),
    getEncashmentRequestsForReview: async (employeeId: string, role: string) => {
        // Map role to approval level
        const approvalLevel = role === 'mgr' ? 'MANAGER' :
            role === 'ceo' ? 'CEO' :
                role === 'admin' ? 'ADMIN' : 'HR';

        const response = await api.get('/hrm/leave/v1/YearEnd/Encashment/PendingApprovals', {
            params: { approverId: employeeId, approvalLevel }
        });

        // Transform the response to match the interface expected by ManagerApprovals
        const requests = response.data?.data || [];
        const transformedRequests = requests.map((req: any) => ({
            id: req.id,
            employeeId: req.employeeId,
            employeeName: req.employeeName,
            department: req.department || '',
            leaveTypeName: req.leaveTypeName,
            requestedDays: req.encashmentDays,
            ratePerDay: req.ratePerDay,
            totalAmount: req.totalAmount,
            reason: req.reason || '',
            preferredMonth: req.preferredMonth || new Date(req.requestDate).toLocaleString('default', { month: 'long' }),
            requestDate: req.requestDate,
            status: req.status,
            currentApprovalLevel: req.currentStep || 1
        }));

        return { ...response, data: { ...response.data, data: transformedRequests } };
    },

    /// <summary>
    /// Process approval for an encashment request
    /// </summary>
    processApproval: async (requestId: string, action: 'APPROVE' | 'REJECT', comments?: string) => {
        const response = await api.post(`/hrm/leave/v1/YearEnd/Encashment/${requestId}/Approve`, {
            status: action === 'APPROVE' ? 'Approved' : 'Rejected',
            comments: comments || ''
        });
        return response;
    },

    /// <summary>
    /// Get encashment approval details for a specific request
    /// </summary>
    getEncashmentApprovalDetails: async (requestId: string) => {
        const response = await api.get(`/hrm/leave/v1/YearEnd/Encashment/${requestId}/ApprovalDetails`);
        return response;
    },

    /// <summary>
    /// Get pending encashment approvals (for managers/approvers)
    /// </summary>
    getPendingEncashmentApprovals: async () => {
        const response = await api.get('/hrm/leave/v1/YearEnd/Encashment/PendingApprovals');
        return response;
    },

    // Get encashment history for an employee
    // The backend expects a GUID, so we pass the employeeId as is (should be GUID string)
    getEncashmentHistory: async (employeeId: string) => {
        // Make sure employeeId is a valid GUID format
        if (!employeeId || employeeId.length < 10) {
            console.warn('Invalid employeeId for encashment history:', employeeId);
            return { data: { data: [], success: true } };
        }

        const response = await api.get(`/hrm/leave/v1/YearEnd/Encashment/History/${employeeId}`);

        // The backend returns: ApiResponse<object>.Ok(result, "message")
        // So response.data should contain the result directly
        let records = [];

        if (response.data?.data) {
            // If the response has a data property containing the array
            records = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response.data)) {
            // If response.data is directly the array
            records = response.data;
        } else if (response.data?.$values) {
            // For some .NET serialization formats
            records = response.data.$values || [];
        }

        // Transform the data to match frontend expectations with safe property access
        const transformedRecords = records.map((record: any) => ({
            id: record.id || record.Id || '',
            employeeId: record.employeeId || record.EmployeeId || employeeId,
            leaveTypeId: record.leaveTypeId || record.LeaveTypeId || '',
            leaveTypeName: record.leaveTypeName || record.LeaveTypeName || record.leaveType || 'Annual Leave',
            encashmentDays: record.encashmentDays || record.EncashmentDays || record.days || 0,
            ratePerDay: record.ratePerDay || record.RatePerDay || 100,
            totalAmount: record.totalAmount || record.TotalAmount || 0,
            taxAmount: record.taxAmount || record.TaxAmount || 0,
            netAmount: record.netAmount || record.NetAmount || 0,
            status: record.status || record.Status || record.approvalStatus || 'Pending',
            requestDate: record.requestDate || record.RequestDate || record.createdAt || record.CreatedAt,
            createdAt: record.createdAt || record.CreatedAt || new Date().toISOString(),
            updatedAt: record.updatedAt || record.UpdatedAt,
            approvedBy: record.approvedBy || record.ApprovedBy,
            approvedAt: record.approvedAt || record.ApprovedAt,
            leaveAppChainId: record.leaveAppChainId || record.LeaveAppChainId,
            currentStepId: record.currentStepId || record.CurrentStepId,
            // Preserve original data for debugging
            _original: record
        }));

        return {
            ...response,
            data: {
                ...response.data,
                data: transformedRecords,
                success: true,
                message: response.data?.message || 'Encashment history retrieved successfully'
            }
        };
    },


    // Alias for getEncashmentHistory for consistency
    getEncashmentHistoryByEmployee: async (employeeId: string) => {
        return yearEndApi.getEncashmentHistory(employeeId);
    },
};