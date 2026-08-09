// services/core/settings/ModHrm/LeaveTypeService.tsx
import { api } from '../../../api';
import type { LeaveTypeListDto, LeaveTypeAddDto, LeaveTypeModDto, UUID } from '../../../../types/core/Settings/leavetype';

class LeaveTypeService {
  // Gateway URL - use HTTP, not HTTPS
  private gatewayUrl = (import.meta.env.VITE_GATEWAY_URL || 'http://localhost:1212').replace(/\/$/, '');

  // REMOVE the /api prefix - your backend doesn't have it!
  private baseUrl = `${this.gatewayUrl}/hrm/leave/v1/Policy`;

  async getAllLeaveTypes(): Promise<LeaveTypeListDto[]> {
    try {
      // Now this will be: http://localhost:1212/hrm/leave/v1/Policy/Type/All
      const response = await api.get(`${this.baseUrl}/Type/All`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching leave types:', error);
      throw error;
    }
  }

  async getLeaveTypeById(id: UUID): Promise<LeaveTypeListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/Type/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching leave type:', error);
      throw error;
    }
  }

  async getLeaveTypeNames(): Promise<{ id: string; name: string }[]> {
    try {
      const response = await api.get(`${this.baseUrl}/Type/Names`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching leave type names:', error);
      throw error;
    }
  }

  async createLeaveType(data: LeaveTypeAddDto): Promise<LeaveTypeListDto> {
    try {
      console.log('Creating leave type at URL:', `${this.baseUrl}/Type/Add`);
      const response = await api.post(`${this.baseUrl}/Type/Add`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating leave type:', error);
      throw error;
    }
  }

  async updateLeaveType(data: LeaveTypeModDto): Promise<LeaveTypeListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/Type/Update/${data.id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating leave type:', error);
      throw error;
    }
  }

  async deleteLeaveType(id: UUID): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/Type/Delete/${id}`);
    } catch (error) {
      console.error('Error deleting leave type:', error);
      throw error;
    }
  }

  async changeLeaveTypeStatus(id: UUID, isActive: boolean, rowVersion: string): Promise<LeaveTypeListDto> {
    try {
      const response = await api.patch(`${this.baseUrl}/Type/Status`, {
        id,
        stat: isActive,
        rowVersion
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error changing leave type status:', error);
      throw error;
    }
  }
  async createApprovalChain(data: {
    leaveTypeId: string;
    effectiveFrom: string;
    steps: Array<{
      stepOrder: number;
      stepName: string;
      role: string;
      isFinal: boolean;
      employeeId?: string | null;
      timeoutHours?: number | null;
    }>;
    isActive: boolean;
  }): Promise<any> {
    try {
      const response = await api.post('/hrm/leave/v1/Policy/Chain/Add', {
        leaveTypeId: data.leaveTypeId,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: null,
        isActive: data.isActive,
        steps: data.steps
      });
      return response.data?.data;
    } catch (error) {
      console.error('Error creating approval chain:', error);
      throw error;
    }
  }


}

export const leaveTypeService = new LeaveTypeService();