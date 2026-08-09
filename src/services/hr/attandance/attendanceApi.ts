// services/hr/attandance/attendanceApi.ts
import api from '../../api';
import type {
    AttendanceRecord,
    AttendanceSummary,
    Shift,
    LeaveRequest,
    LeaveBalance,
    OvertimeRequest,
    PaginatedResponse
} from '../../../types/hr/attandance';

const BASE_URL = '/attendance';

export const attendanceApi = {
    // ============ Attendance Records ============
    getTodayAttendance: (employeeId: string): Promise<AttendanceRecord[]> => {
        return api.get<AttendanceRecord[]>(`${BASE_URL}/today/${employeeId}`);
    },

    // GET: api/v1/attendance/employee/{employeeId}/summary
    getAttendanceStats: (employeeId: string, month: number, year: number): Promise<AttendanceSummary> => {
        const from = new Date(year, month - 1, 1).toISOString();
        const to = new Date(year, month, 0).toISOString();
        return api.get<AttendanceSummary>(`${BASE_URL}/employee/${employeeId}/summary`, {
            params: { from, to }
        });
    },

    // GET: api/v1/attendance/records
    getAttendanceRecords: (params: {
        employeeId?: string;
        from?: string;
        to?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<AttendanceRecord>> => {
        return api.get<PaginatedResponse<AttendanceRecord>>(`${BASE_URL}/records`, { params });
    },

    // ✅ ADD THIS METHOD - Get daily report
    getDailyReport: (date: string): Promise<any> => {
        return api.get(`${BASE_URL}/report/daily`, {
            params: { date }
        });
    },

    // ✅ ADD THIS METHOD - Get monthly report
    getMonthlyReport: (year: number, month: number): Promise<any> => {
        return api.get(`${BASE_URL}/report/monthly`, {
            params: { year, month }
        });
    },

    // POST: api/v1/attendance/clock-in
    // In attendanceApi.ts
    clockIn: (employeeId: string): Promise<AttendanceRecord> => {
        // ✅ Send employeeId
        return api.post<AttendanceRecord>(`${BASE_URL}/clock-in`, {
            employeeId: employeeId
        });
    },

    // POST: api/v1/attendance/clock-out
    // ✅ CORRECT - Send employeeId
    clockOut: (employeeId: string): Promise<AttendanceRecord> => {
        return api.post<AttendanceRecord>(`${BASE_URL}/clock-out`, { employeeId: employeeId });
    },

    // ============ Employee Info ============
    getEmployeeInfo: (employeeId: string): Promise<{
        id: string;
        name: string;
        email: string;
        department: string;
        position: string;
        photoUrl: string;
        employeeCode: string;
    }> => {
        const name = localStorage.getItem('employeeName') || 'Employee';
        const email = localStorage.getItem('userEmail') || '';
        const department = localStorage.getItem('department') || '';
        const position = localStorage.getItem('position') || '';
        return Promise.resolve({
            id: employeeId,
            name,
            email,
            department,
            position,
            photoUrl: '',
            employeeCode: localStorage.getItem('employeeCode') || ''
        });
    },

    // ============ Shifts ============
    getShifts: (): Promise<Shift[]> => {
        return api.get<Shift[]>(`${BASE_URL}/shifts`);
    },

    getShiftById: (id: string): Promise<Shift> => {
        return api.get<Shift>(`${BASE_URL}/shifts/${id}`);
    },

    createShift: (data: Partial<Shift>): Promise<Shift> => {
        return api.post<Shift>(`${BASE_URL}/shifts`, data);
    },

    updateShift: (id: string, data: Partial<Shift>): Promise<Shift> => {
        return api.put<Shift>(`${BASE_URL}/shifts/${id}`, data);
    },

    deleteShift: (id: string): Promise<void> => {
        return api.delete(`${BASE_URL}/shifts/${id}`);
    },

    // ============ Leave Requests ============
    getLeaveRequests: (params?: {
        employeeId?: string;
        status?: string;
        from?: string;
        to?: string;
    }): Promise<LeaveRequest[]> => {
        return api.get<LeaveRequest[]>(`${BASE_URL}/leave/requests`, { params });
    },

    createLeaveRequest: (data: Partial<LeaveRequest>): Promise<LeaveRequest> => {
        return api.post<LeaveRequest>(`${BASE_URL}/leave/requests`, data);
    },

    updateLeaveRequest: (id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest> => {
        return api.put<LeaveRequest>(`${BASE_URL}/leave/requests/${id}`, data);
    },

    deleteLeaveRequest: (id: string): Promise<void> => {
        return api.delete(`${BASE_URL}/leave/requests/${id}`);
    },

    // ============ Leave Balance ============
    getLeaveBalance: (employeeId: string, year?: number): Promise<LeaveBalance[]> => {
        return api.get<LeaveBalance[]>(`${BASE_URL}/leave/balance/${employeeId}`, {
            params: { year }
        });
    },

    // ============ Overtime ============
    getOvertimeRequests: (params?: {
        employeeId?: string;
        status?: string;
        from?: string;
        to?: string;
    }): Promise<OvertimeRequest[]> => {
        return api.get<OvertimeRequest[]>(`${BASE_URL}/overtime/requests`, { params });
    },

    createOvertimeRequest: (data: Partial<OvertimeRequest>): Promise<OvertimeRequest> => {
        return api.post<OvertimeRequest>(`${BASE_URL}/overtime/requests`, data);
    },

    updateOvertimeRequest: (id: string, data: Partial<OvertimeRequest>): Promise<OvertimeRequest> => {
        return api.put<OvertimeRequest>(`${BASE_URL}/overtime/requests/${id}`, data);
    },

    approveOvertime: (id: string, approved: boolean, notes?: string): Promise<OvertimeRequest> => {
        return api.post<OvertimeRequest>(`${BASE_URL}/overtime/approve/${id}`, { approved, notes });
    },

    // ============ Reports ============
    getAttendanceReport: (params: {
        employeeId?: string;
        departmentId?: string;
        from: string;
        to: string;
        format?: 'pdf' | 'excel';
    }): Promise<Blob> => {
        return api.get(`${BASE_URL}/report/attendance`, {
            params,
            responseType: 'blob'
        });
    },

    getSummaryReport: (params: {
        departmentId?: string;
        month: number;
        year: number;
    }): Promise<any> => {
        return api.get(`${BASE_URL}/report/summary`, { params });
    }
};