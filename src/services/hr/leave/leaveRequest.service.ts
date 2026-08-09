// services/hr/leave/leaveRequest.service.ts
import { api } from '../../api';
import type { UUID } from '../../../types/core/Settings/leavepolicy';

export interface LeaveRequestDto {
    id: UUID;
    employeeId: UUID;
    employeeName: string;
    employeeNameAm: string;
    gender: string;
    department: string;
    position: string;
    branch: string;
    leaveType: string;
    leaveTypeId: UUID;
    startDate: string;
    endDate: string;
    daysRequested: number;
    status: string;
    comments?: string;
}

class LeaveRequestService {
    private baseUrl = '/hrm/leave/v1/Request';

    // Get all leave requests (for HR/Admin)
    async getAllLeaveRequests(): Promise<LeaveRequestDto[]> {
        try {
            const response = await api.get(`${this.baseUrl}/AllRequests`);
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching all leave requests:', error);
            return [];
        }
    }

    // Get my leave requests (for employee)
    async getMyLeaveRequests(): Promise<LeaveRequestDto[]> {
        try {
            const response = await api.get(`${this.baseUrl}/MyLeaveReq`);
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching my leave requests:', error);
            return [];
        }
    }

    // Get currently on leave employees (approved and within date range)
    async getOnLeaveEmployees(): Promise<LeaveRequestDto[]> {
        try {
            const allRequests = await this.getAllLeaveRequests();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Filter approved requests that are currently active
            const onLeave = allRequests.filter(request => {
                const startDate = new Date(request.startDate);
                const endDate = new Date(request.endDate);
                const isApproved = request.status === 'Approved';
                const isCurrent = startDate <= today && endDate >= today;
                return isApproved && isCurrent;
            });

            return onLeave;
        } catch (error) {
            console.error('Error fetching on-leave employees:', error);
            return [];
        }
    }
}

export const leaveRequestService = new LeaveRequestService();