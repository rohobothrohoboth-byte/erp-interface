// src/services/hr/leave/leave.api.ts
import { api } from '../../api';
import type { LeaveRequestListDto, LeaveRequestAddDto, LeaveRequestModDto } from '../../../types/hr/leaverequest';
import type { UUID } from 'crypto';

class LeaveApi {
  private gatewayUrl = (import.meta.env.VITE_GATEWAY_URL || 'http://localhost:1212').replace(/\/$/, '');
  private leavePath = (import.meta.env.VITE_HRMM_LEAVE_URL || '/hrm/leave/v1').replace(/^\//, '');
  private baseUrl = `${this.gatewayUrl}/${this.leavePath}/Request`;

  async addLeaveRequest(leaveData: any): Promise<LeaveRequestListDto> {
    const payload = {
      leaveTypeId: leaveData.leaveTypeId,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      isHalfDay: leaveData.isHalfDay || false,
      comments: leaveData.comments,
      approvalChainId: leaveData.approvalChainId,
      currentStepId: leaveData.currentStepId,
    };

    const response = await api.post(`${this.baseUrl}/AddNewReq`, payload);
    return response.data.data;
  }

  async updateLeaveRequest(updateData: LeaveRequestModDto): Promise<LeaveRequestListDto> {
    const response = await api.put(`${this.baseUrl}/UpdateLeaveReq/${updateData.id}`, updateData);
    return response.data.data;
  }

  async deleteLeaveRequest(id: UUID): Promise<void> {
    await api.delete(`${this.baseUrl}/DeleteLeaveReq/${id}`);
  }

  async getMyLeaveRequests(): Promise<LeaveRequestListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/MyLeaveReq`);
      const data = response.data?.data || response.data || [];

      // Ensure employeeId is properly mapped
      return data.map((item: any) => ({
        ...item,
        employeeId: item.employeeId || item.EmployeeId || '',
        employee: item.employee || item.employeeName || 'Unknown',
      }));
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Leave requests: insufficient permissions');
        return [];
      }
      console.error('Error fetching leave requests:', error);
      return [];
    }
  }

  async getLeaveRequestById(id: UUID): Promise<LeaveRequestListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetLeaveReq/${id}`);
      const data = response.data.data;
      return {
        ...data,
        employeeId: data.employeeId || data.EmployeeId || '',
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('You do not have permission to view this leave request.');
      }
      throw new Error(error.message);
    }
  }

  async approveLeaveRequest(id: string, comments: string, rowVersion: string): Promise<any> {
    try {
      const response = await api.put(`${this.gatewayUrl}/${this.leavePath}/Request/Approve/${id}`, {
        comments: comments,
        rowVersion: rowVersion
      });
      return response.data?.data;
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  }

  async rejectLeaveRequest(id: string, comments: string, rowVersion: string): Promise<any> {
    try {
      const response = await api.put(`${this.gatewayUrl}/${this.leavePath}/Request/Reject/${id}`, {
        comments: comments,
        rowVersion: rowVersion
      });
      return response.data?.data;
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw error;
    }
  }

  async cancelLeaveRequest(id: UUID, rowVersion?: string): Promise<any> {
    const response = await api.put(`${this.baseUrl}/Cancel/${id}`, { rowVersion });
    return response.data;
  }

  async getMyLeaveBalances(): Promise<any[]> {
    try {
      const response = await api.get(`${this.gatewayUrl}/${this.leavePath}/Balance/MyBalance`);
      console.log('Balance API Response:', response.data);

      const data = response.data?.data || response.data || [];

      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          leaveTypeId: item.leaveTypeId,
          leaveTypeName: item.leaveType,
          remainingDays: Number(item.remainingBalance) || Number(item.remainDays?.split(' ')[0]) || 0,
          carriedOverDays: Number(item.carryForward) || 0,
          lostDays: 0,
          encashableDays: 0,
          newBalance: Number(item.assignedEntitlement) || 0,
          totalDays: Number(item.totalDays?.split(' ')[0]) || Number(item.assignedEntitlement) || 0,
          usedDays: Number(item.usedDays?.split(' ')[0]) || Number(item.balance) || 0,
          remainDays: Number(item.remainDays?.split(' ')[0]) || Number(item.remainingBalance) || 0,
          carryForward: Number(item.carryForward?.split(' ')[0]) || 0,
          leaveType: item.leaveType,
          fiscalYear: item.fiscalYear,
          effectiveFrom: item.effectiveFrom,
          effectiveTo: item.effectiveTo,
          isActive: item.isActive
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      return [];
    }
  }

  // FIXED: getAllLeaveRequests - properly map employeeId
  async getAllLeaveRequests(): Promise<LeaveRequestListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllRequests`);
      const data = response.data?.data || response.data || [];

      console.log('📋 Raw API response from AllRequests:', data);

      // Map each request with proper employeeId
      return data.map((item: any) => {
        // Try multiple possible field names for employeeId
        const employeeId = item.employeeId || item.EmployeeId || item.employee_id || '';
        const employeeName = item.employee || item.employeeName || item.Employee || 'Unknown';

        console.log(`📋 Request ${item.id}: employeeId=${employeeId}, employeeName=${employeeName}`);

        return {
          ...item,
          employeeId: employeeId,  // Ensure employeeId is properly set
          employee: employeeName,
          employeeName: employeeName,
        };
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Leave requests: insufficient permissions');
        return [];
      }
      console.error('Error fetching all leave requests:', error);
      return [];
    }
  }
}

export const leaveApi = new LeaveApi();